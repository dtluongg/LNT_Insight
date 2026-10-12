using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Backend_LNT_Insight.Dtos;

namespace Backend_LNT_Insight.Services.AI
{
    public class GeminiService : IGeminiService
    {
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;
        private readonly HttpClient _httpClient;
        private static readonly System.Threading.SemaphoreSlim _lock = new(1, 1);
        //Khóa Semaphore (SemaphoreSlim): Đảm bảo các request trùng nhau không bao giờ bị dẫm chân lên nhau, request đến sau sẽ tự động lấy từ Cache mà không tốn quota của Gemini.

        public GeminiService(
            IConfiguration config,
            IMemoryCache cache,
            HttpClient httpClient)
        {
            _config = config;
            _cache = cache;
            _httpClient = httpClient;
        }

        public async Task<AiBatchResponseDto> ExecuteBatchAnalysisAsync(AiBatchRequestDto request)
        {
            var response = new AiBatchResponseDto
            {
                GeneratedAt = DateTime.Now
            };

            // 1. Check if request has items
            if (request.Items == null || request.Items.Count == 0)
            {
                response.Success = false;
                response.ErrorMessage = "No analysis items provided in the request.";
                Console.WriteLine("[LNT AI ENGINE WARN] Batch request received with 0 items.");
                return response;
            }

            // 2. Check Cache
            if (!request.ForceRefresh && !string.IsNullOrWhiteSpace(request.CacheKey))
            {
                if (_cache.TryGetValue(request.CacheKey, out AiBatchResponseDto? cachedResponse) && cachedResponse != null)
                {
                    cachedResponse.IsCached = true;
                    Console.WriteLine($"[LNT AI ENGINE CACHE HIT] Returned cached results for key: {request.CacheKey}");
                    return cachedResponse;
                }
            }

            // 3. Check Gemini API Key
            string apiKey = _config["GeminiSettings:ApiKey"] ?? "";
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                response.Success = false;
                response.ErrorMessage = "Gemini API Key is not configured. Please add 'GeminiSettings:ApiKey' in appsettings.json.";
                Console.WriteLine("[LNT AI ENGINE ERROR] Missing Gemini API Key in configuration.");
                return response;
            }

            // 4. Construct Structured Multi-Item Prompt
            string modelName = _config["GeminiSettings:Model"] ?? "gemini-3.8-flash";
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("You are an Executive Business & Operations AI Advisor for LNT Insight.");
            promptBuilder.AppendLine("Analyze the following items based on their individual instruction and data.");
            promptBuilder.AppendLine("You MUST return a valid JSON object strictly matching this schema, without any conversational preamble:");
            promptBuilder.AppendLine("{");
            promptBuilder.AppendLine("  \"<item_id>\": {");
            promptBuilder.AppendLine("    \"title\": \"Short descriptive title\",");
            promptBuilder.AppendLine("    \"summary\": \"2-3 sentence executive insight based on the real data provided\",");
            promptBuilder.AppendLine("    \"severity\": \"SUCCESS\" | \"WARNING\" | \"DANGER\" | \"INFO\"");
            promptBuilder.AppendLine("  }");
            promptBuilder.AppendLine("}");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Severity Guidelines:");
            promptBuilder.AppendLine("- SUCCESS: Exceeded plan, high efficiency, zero or low defects.");
            promptBuilder.AppendLine("- WARNING: Slight deviations, potential risk, minor increase in defect rate.");
            promptBuilder.AppendLine("- DANGER: Severe drop in output, critical defect spikes, bottleneck failure.");
            promptBuilder.AppendLine("- INFO: Neutral status, general update.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("[ITEMS TO ANALYZE]:");

            foreach (var item in request.Items)
            {
                // Read prompt directly from appsettings.json according to item.Id
                string prompt = _config[$"AiEngineConfig:Prompts:{item.Id}"] 
                    ?? "Analyze this operational dataset and provide an executive summary.";
                string itemDataJson = item.Data != null ? JsonSerializer.Serialize(item.Data) : "{}";

                promptBuilder.AppendLine($"--- ITEM ID: \"{item.Id}\" ---");
                promptBuilder.AppendLine($"Instruction: {prompt}");
                promptBuilder.AppendLine($"Data: {itemDataJson}");
                promptBuilder.AppendLine();
            }

            await _lock.WaitAsync();
            try
            {
                // Re-check cache after acquiring lock in case concurrent request just populated it
                if (!request.ForceRefresh && !string.IsNullOrWhiteSpace(request.CacheKey))
                {
                    if (_cache.TryGetValue(request.CacheKey, out AiBatchResponseDto? cachedResponse) && cachedResponse != null)
                    {
                        cachedResponse.IsCached = true;
                        Console.WriteLine($"[LNT AI ENGINE CACHE HIT] Returned cached results for key: {request.CacheKey}");
                        return cachedResponse;
                    }
                }

                // 5. Call Gemini API
                string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent?key={apiKey}";
                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = promptBuilder.ToString() }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        responseMimeType = "application/json"
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                Console.WriteLine($"[LNT AI ENGINE INFO] Sending batch request ({request.Items.Count} items) to Gemini model '{modelName}'...");

                HttpResponseMessage? httpResponse = null;
                int maxRetries = 2;
                for (int attempt = 0; attempt <= maxRetries; attempt++)
                {
                    httpResponse = await _httpClient.PostAsync(apiUrl, content);
                    if (httpResponse.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable && attempt < maxRetries)
                    {
                        Console.WriteLine($"[LNT AI ENGINE WARN] Gemini returned 503 (high demand spike). Waiting 2s before retry (attempt {attempt + 1}/{maxRetries})...");
                        await Task.Delay(2000);
                        continue;
                    }
                    break;
                }

                if (httpResponse == null || !httpResponse.IsSuccessStatusCode)
                {
                    string errorDetails = httpResponse != null ? await httpResponse.Content.ReadAsStringAsync() : "No response from Gemini API.";
                    response.Success = false;
                    response.ErrorMessage = $"Google Gemini API returned status {httpResponse?.StatusCode}: {errorDetails}";
                    Console.WriteLine($"[LNT AI ENGINE API ERROR] Status: {httpResponse?.StatusCode}, Details: {errorDetails}");
                    return response;
                }

                string jsonResponse = await httpResponse.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(jsonResponse);
                var rawText = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (string.IsNullOrWhiteSpace(rawText))
                {
                    response.Success = false;
                    response.ErrorMessage = "Gemini API returned an empty response text.";
                    Console.WriteLine("[LNT AI ENGINE ERROR] Empty content returned from Gemini API.");
                    return response;
                }

                // 6. Clean and Parse JSON from Gemini
                string cleanJson = CleanJsonMarkdownFences(rawText);
                var parsedResults = JsonSerializer.Deserialize<Dictionary<string, AiCardResultDto>>(cleanJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (parsedResults != null)
                {
                    response.Success = true;
                    response.Results = parsedResults;
                    response.IsCached = false;
                    Console.WriteLine($"[LNT AI ENGINE SUCCESS] Successfully analyzed {parsedResults.Count} items via Gemini API.");

                    // Cache result if CacheKey was provided
                    if (!string.IsNullOrWhiteSpace(request.CacheKey))
                    {
                        int cacheDuration = _config.GetValue<int>("AiEngineConfig:CacheDurationMinutes", 60);
                        _cache.Set(request.CacheKey, response, TimeSpan.FromMinutes(cacheDuration));
                    }

                    return response;
                }
                else
                {
                    response.Success = false;
                    response.ErrorMessage = "Unable to deserialize Gemini response into card results.";
                    return response;
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.ErrorMessage = $"Exception occurred while connecting to AI service: {ex.Message}";
                Console.WriteLine($"[LNT AI ENGINE EXCEPTION] {ex}");
                return response;
            }
            finally
            {
                _lock.Release();
            }
        }

        private string CleanJsonMarkdownFences(string text)
        {
            text = text.Trim();
            if (text.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                text = text.Substring(7);
            }
            else if (text.StartsWith("```"))
            {
                text = text.Substring(3);
            }

            if (text.EndsWith("```"))
            {
                text = text.Substring(0, text.Length - 3);
            }

            text = text.Trim();
            int firstBrace = text.IndexOf('{');
            int lastBrace = text.LastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace)
            {
                text = text.Substring(firstBrace, lastBrace - firstBrace + 1);
            }

            return text.Trim();
        }
    }
}
