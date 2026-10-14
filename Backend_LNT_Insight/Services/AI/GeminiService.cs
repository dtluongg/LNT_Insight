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

            // 1. Kiểm tra Cache (1 cache duy nhất chứa cả 3 ngôn ngữ)
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

            // 2. Tạo Prompt: Yêu cầu Gemini trả về cả 3 ngôn ngữ (VI, EN, SI) trong cùng 1 lần gọi
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("You are an Executive Business & Operations AI Advisor for LNT Insight, an apparel manufacturing intelligence system.");
            promptBuilder.AppendLine("""

            CRITICAL MULTI-LANGUAGE REQUIREMENT:
            For EVERY analyzed item, you MUST generate the Title and Summary in THREE languages simultaneously inside the "translations" object:
            1. "vi" (Vietnamese): Fluent, natural Vietnamese using accurate apparel manufacturing terms (Chuyền may, Kế hoạch MO, Sản lượng thực tế, Tỷ lệ lỗi, Nhịp độ ra hàng).
            2. "en" (English): Fluent, professional English using standard industry terms (Sewing Line, MO Target, Actual Output, Defect Rate, Run-rate, End-of-shift projection).
            3. "si" (Sinhala - Sri Lanka): Fluent, professional Sinhala (සිංහල) for Sri Lankan garment managers (මැහුම් කණ්ඩායම/පෙළ, MO ඉලක්කය, නිමි ඇඳුම් ප්‍රමාණය, දෝෂ අනුපාතය, වැඩ මුරයේ නිමාව).

            Strict Operational Rules:
            1. High-Value Analytical Rigor: Do NOT generate rigid, robotic or fill-in-the-blank canned text. Deeply evaluate the numbers, explain what they mean for factory momentum (expansion vs decline, line balance, plan vs actual mismatch, defect containment), and provide actionable executive insights.
            2. Bullet Formatting & Headings:
               - For dashboard briefing cards: Provide rich, multi-sentence operational evaluations using bold sub-labels (e.g. "• Hiệu suất: [detailed analysis]", "• Điểm nhấn vận hành: [operational insight]").
               - For deep-dive diagnostic reports: Provide in-depth executive diagnostic sections with numbered headers (e.g. "1. SECTION TITLE") and thorough analytical bullets with bold sub-labels (e.g. "• Sub-label: [deep metric interpretation]").
               - Always use line breaks (\n) between sections and bullets for clean UI rendering.
            3. For production forecasting (shift 07:15 AM to 4:15 PM): compare actual run-rate vs remaining shift time to project end-of-shift output against MO target.
            4. For defect analysis: focus strictly on top Pareto defect items from the data. Do NOT invent machine or fabric causes that are not in the data.
            5. You MUST return ONLY a valid JSON object matching this exact schema:
            {
              "<item_id>": {
                "title": "Short descriptive title (Vietnamese)",
                "summary": "Detailed executive analytical report with line breaks following the item instruction (Vietnamese)",
                "severity": "SUCCESS" | "WARNING" | "DANGER" | "INFO",
                "translations": {
                  "vi": {
                    "title": "Tiêu đề tiếng Việt",
                    "summary": "Báo cáo phân tích chi tiết bằng tiếng Việt..."
                  },
                  "en": {
                    "title": "English title",
                    "summary": "Detailed executive analytical report in English..."
                  },
                  "si": {
                    "title": "සිංහල මාතෘකාව",
                    "summary": "සිංහලෙන් විස්තරාත්මක විධායක විශ්ලේෂණ වාර්තාව..."
                  }
                }
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
                    generationConfig = new 
                    { 
                        responseMimeType = "application/json",
                        temperature = 0.1 
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                Console.WriteLine($"[LNT AI ENGINE] Calling Gemini model '{model}' for {request.Items.Count} items (Tri-lingual: VI, EN, SI)...");

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

                if (parsedResults != null)
                {
                    foreach (var (cardKey, card) in parsedResults)
                    {
                        // Fallback an toàn nếu Gemini chỉ điền Translations mà bỏ trống Title/Summary cấp ngoài
                        if (card.Translations != null && card.Translations.TryGetValue("vi", out var viContent))
                        {
                            if (string.IsNullOrWhiteSpace(card.Title)) card.Title = viContent.Title;
                            if (string.IsNullOrWhiteSpace(card.Summary)) card.Summary = viContent.Summary;
                        }
                    }
                }

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
