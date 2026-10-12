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

        public GeminiService(IConfiguration config, IMemoryCache cache, HttpClient httpClient)
        {
            _config = config;
            _cache = cache;
            _httpClient = httpClient;
        }

        public async Task<AiBatchResponseDto> ExecuteBatchAnalysisAsync(AiBatchRequestDto request)
        {
            var response = new AiBatchResponseDto { GeneratedAt = DateTime.Now };

            if (request.Items == null || request.Items.Count == 0)
            {
                response.Success = false;
                response.ErrorMessage = "No analysis items provided in the request.";
                return response;
            }

            // 1. Kiểm tra Cache
            if (!request.ForceRefresh && !string.IsNullOrWhiteSpace(request.CacheKey))
            {
                if (_cache.TryGetValue(request.CacheKey, out AiBatchResponseDto? cached) && cached != null)
                {
                    cached.IsCached = true;
                    return cached;
                }
            }

            string apiKey = _config["GeminiSettings:ApiKey"] ?? "";
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                response.Success = false;
                response.ErrorMessage = "Gemini API Key is not configured in appsettings.json.";
                return response;
            }

            // 2. Tạo Prompt: Yêu cầu Gemini trả về đúng khuôn mẫu JSON cho từng Card
            var promptBuilder = new StringBuilder("""
            You are an Executive Business & Operations AI Advisor for LNT Insight.
            Analyze the following items based on their individual instruction and data.
            You MUST return a valid JSON object matching this schema:
            {
              "<item_id>": {
                "title": "Short descriptive title",
                "summary": "2-3 sentence executive insight based on data",
                "severity": "SUCCESS" | "WARNING" | "DANGER" | "INFO"
              }
            }

            [ITEMS TO ANALYZE]:

            """);

            foreach (var item in request.Items)
            {
                // Ưu tiên prompt do frontend truyền lên; nếu không có thì lấy trong appsettings.json
                string prompt = !string.IsNullOrWhiteSpace(item.Prompt)
                    ? item.Prompt
                    : (_config[$"AiEngineConfig:Prompts:{item.Id}"] ?? "Analyze this operational dataset and provide an executive summary.");

                string itemDataJson = item.Data != null ? JsonSerializer.Serialize(item.Data) : "{}";
                promptBuilder.AppendLine($"--- ITEM ID: \"{item.Id}\" ---\nInstruction: {prompt}\nData: {itemDataJson}\n");
            }

            // 3. Khóa Semaphore để tránh gọi trùng lặp cùng tích tắc
            await _lock.WaitAsync();
            try
            {
                if (!request.ForceRefresh && !string.IsNullOrWhiteSpace(request.CacheKey))
                {
                    if (_cache.TryGetValue(request.CacheKey, out AiBatchResponseDto? cached) && cached != null)
                    {
                        cached.IsCached = true;
                        return cached;
                    }
                }

                // 4. Gọi Gemini API (Sử dụng model gemini-3.5-flash-lite)
                string model = _config["GeminiSettings:Model"] ?? "gemini-3.5-flash-lite";
                string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

                var requestBody = new
                {
                    contents = new[] { new { parts = new[] { new { text = promptBuilder.ToString() } } } },
                    generationConfig = new { responseMimeType = "application/json" }
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                Console.WriteLine($"[LNT AI ENGINE] Calling Gemini model '{model}' for {request.Items.Count} items...");

                var httpResponse = await _httpClient.PostAsync(apiUrl, content);

                if (!httpResponse.IsSuccessStatusCode)
                {
                    string errorDetails = await httpResponse.Content.ReadAsStringAsync();
                    response.Success = false;
                    response.ErrorMessage = $"Google Gemini API returned status {httpResponse.StatusCode}: {errorDetails}";
                    Console.WriteLine($"[LNT AI ENGINE ERROR] Status: {httpResponse.StatusCode}, Details: {errorDetails}");
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

                // 5. Bóc tách JSON trả về cho các Card
                string cleanJson = CleanJson(rawText ?? "");
                var parsedResults = JsonSerializer.Deserialize<Dictionary<string, AiCardResultDto>>(cleanJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                response.Success = true;
                response.Results = parsedResults ?? new();

                if (!string.IsNullOrWhiteSpace(request.CacheKey))
                {
                    int cacheMinutes = _config.GetValue<int>("AiEngineConfig:CacheDurationMinutes", 60);
                    _cache.Set(request.CacheKey, response, TimeSpan.FromMinutes(cacheMinutes));
                }

                Console.WriteLine($"[LNT AI ENGINE SUCCESS] Successfully analyzed {response.Results.Count} items.");
                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.ErrorMessage = $"Exception: {ex.Message}";
                Console.WriteLine($"[LNT AI ENGINE EXCEPTION] {ex}");
                return response;
            }
            finally
            {
                _lock.Release();
            }
        }

        private string CleanJson(string text)
        {
            text = text.Trim();
            int first = text.IndexOf('{');
            int last = text.LastIndexOf('}');
            return (first >= 0 && last > first) ? text.Substring(first, last - first + 1) : text;
        }
    }
}
