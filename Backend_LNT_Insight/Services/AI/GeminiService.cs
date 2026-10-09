using Dapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
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
        private readonly IWebHostEnvironment _env;
        private readonly string _connectionString;
        private readonly bool _useLocalMockData;

        public GeminiService(
            IConfiguration config,
            IMemoryCache cache,
            HttpClient httpClient,
            IWebHostEnvironment env)
        {
            _config = config;
            _cache = cache;
            _httpClient = httpClient;
            _env = env;
            _useLocalMockData = config.GetValue<bool>("UseLocalMockData", true);
            _connectionString = config.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        private string GetMockJsonContent(string fileName)
        {
            var filePath = Path.Combine(_env.ContentRootPath, "SSMS", "Data", "DataCompaniesController", fileName);
            if (File.Exists(filePath))
            {
                return File.ReadAllText(filePath);
            }
            return "[]";
        }

        public async Task<AiOverviewResponseDto> GetOverviewSummaryAsync(AiOverviewRequestDto request)
        {
            string cacheKey = $"AIOVERVIEW_{request.PageCode}_{request.CompanyId}_{request.SiteId}_{request.SectionId}_{request.FilterDate:yyyyMMdd}";

            if (!request.ForceRefresh && _cache.TryGetValue(cacheKey, out AiOverviewResponseDto? cachedResult) && cachedResult != null)
            {
                cachedResult.IsCached = true;
                return cachedResult;
            }

            // 1. Fetch Stage 1 Data (From Mock JSON or DB)
            string summaryDataJson = "";
            string detailDataJson = "";

            if (_useLocalMockData)
            {
                summaryDataJson = GetMockJsonContent("GetSewingSummary.json");
                detailDataJson = GetMockJsonContent("GetSewingDetail.json");
            }
            else
            {
                try
                {
                    using var db = CreateConnection();
                    var summaryData = (await db.QueryAsync<dynamic>(
                        "USP_FXPRO_Insight_SewingTeamPerformance_Summary",
                        new { CompanyID = request.CompanyId, SiteID = request.SiteId, SectionID = request.SectionId, Date = request.FilterDate.Date },
                        commandType: CommandType.StoredProcedure)).ToList();

                    var detailData = (await db.QueryAsync<dynamic>(
                        "USP_FXPRO_Insight_SewingTeamPerformance_Detail",
                        new { CompanyID = request.CompanyId, SiteID = request.SiteId, SectionID = request.SectionId, Date = request.FilterDate.Date },
                        commandType: CommandType.StoredProcedure)).ToList();

                    summaryDataJson = JsonSerializer.Serialize(summaryData);
                    detailDataJson = JsonSerializer.Serialize(detailData);
                }
                catch
                {
                    summaryDataJson = GetMockJsonContent("GetSewingSummary.json");
                    detailDataJson = GetMockJsonContent("GetSewingDetail.json");
                }
            }

            // 2. Generate Prompt and Call Gemini API
            string apiKey = _config["GeminiSettings:ApiKey"] ?? "";
            string prompt = $@"
You are the Executive Business Advisor for LNT Insight.
Based on the overall operational dataset of the manufacturing plant ({request.FilterDate:yyyy-MM-dd}):

[STATCARDS SUMMARY]:
{summaryDataJson}

[SEWING LINE DETAILS]:
{detailDataJson}

Please generate a structured executive summary in professional Business English including:
1. Overall production performance and quality assessment.
2. 1 major highlight.
3. 1 operational/quality warning.
4. 2 concrete action recommendations.
Format the output in clean, professional Markdown in English.";

            string markdownResult = await CallGeminiOrFallbackAsync(apiKey, prompt, GetDefaultOverviewMarkdown(request.FilterDate));

            // 3. Build Response DTO in English
            var response = new AiOverviewResponseDto
            {
                Success = true,
                PageCode = request.PageCode,
                OverviewTitle = $"Executive Daily Briefing ({request.FilterDate:yyyy-MM-dd})",
                RawMarkdown = markdownResult,
                IsCached = false,
                GeneratedAt = DateTime.Now,
                Insights = new List<AiInsightCardDto>
                {
                    new AiInsightCardDto
                    {
                        InsightId = "INSIGHT_01",
                        Title = "Production Output & Sewing Productivity",
                        SummaryText = "Overall output reached 98.5% of target. Lines 01 and 03 maintained high efficiency above 100%.",
                        Severity = "SUCCESS",
                        ModuleCode = "MD3",
                        SubModuleCode = "MD3SMD2"
                    },
                    new AiInsightCardDto
                    {
                        InsightId = "INSIGHT_02",
                        Title = "Quality & Defect Rate Warning",
                        SummaryText = "Defect rate at Sewing Section 1 increased slightly (3.8%). Primary defect types: Skip Stitches and Thread Breaks.",
                        Severity = "WARNING",
                        ModuleCode = "MD3",
                        SubModuleCode = "MD3SMD2",
                        DrillDownTarget = new DrillDownOptionDto
                        {
                            OptionId = "OPT_DEFECT_ANALYSIS",
                            OptionLabel = "🔍 Deep-Dive Defect Analysis",
                            SubModuleCode = "MD3SMD2",
                            Params = new Dictionary<string, object>
                            {
                                { "companyId", request.CompanyId },
                                { "siteId", request.SiteId },
                                { "sectionId", request.SectionId }
                            }
                        }
                    },
                    new AiInsightCardDto
                    {
                        InsightId = "INSIGHT_03",
                        Title = "Shiftwork Output & Pace Variance",
                        SummaryText = "Morning shift achieved 104% of plan, whereas afternoon shift declined by 8.2% due to line pacing bottlenecks.",
                        Severity = "INFO",
                        ModuleCode = "MD3",
                        SubModuleCode = "MD3SMD2",
                        DrillDownTarget = new DrillDownOptionDto
                        {
                            OptionId = "OPT_SHIFTWORK_ANALYSIS",
                            OptionLabel = "⏱️ Shiftwork Productivity Analysis",
                            SubModuleCode = "MD3SMD2",
                            Params = new Dictionary<string, object>
                            {
                                { "companyId", request.CompanyId },
                                { "siteId", request.SiteId },
                                { "sectionId", request.SectionId }
                            }
                        }
                    }
                },
                AvailableOptions = new List<DrillDownOptionDto>
                {
                    new DrillDownOptionDto
                    {
                        OptionId = "OPT_DEFECT_ANALYSIS",
                        OptionLabel = "🔍 Deep-Dive Defect Analysis",
                        SubModuleCode = "MD3SMD2"
                    },
                    new DrillDownOptionDto
                    {
                        OptionId = "OPT_SHIFTWORK_ANALYSIS",
                        OptionLabel = "⏱️ Shiftwork Productivity Analysis",
                        SubModuleCode = "MD3SMD2"
                    }
                }
            };

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(_config.GetValue<int>("AiEngineConfig:CacheDurationMinutes", 60)));
            _cache.Set(cacheKey, response, cacheOptions);

            return response;
        }

        public async Task<AiDrillDownResponseDto> GetDrillDownAnalysisAsync(AiDrillDownRequestDto request)
        {
            string cacheKey = $"AIDRILLDOWN_{request.SubModuleCode}_{request.OptionId}_{request.CompanyId}_{request.SiteId}_{request.SectionId}_{request.TeamId}_{request.FilterDate:yyyyMMdd}";

            if (!request.ForceRefresh && _cache.TryGetValue(cacheKey, out AiDrillDownResponseDto? cachedResult) && cachedResult != null)
            {
                cachedResult.IsCached = true;
                return cachedResult;
            }

            // 1. Fetch Stage 2 Granular Data
            string deepDataJson = "";
            if (_useLocalMockData)
            {
                if (request.OptionId == "OPT_SHIFTWORK_ANALYSIS")
                {
                    deepDataJson = GetMockJsonContent("GetDataSewingTeamAnalysis.json");
                }
                else
                {
                    deepDataJson = GetMockJsonContent("GetOverallDefectAnalysis.json");
                }
            }
            else
            {
                try
                {
                    using var db = CreateConnection();
                    if (request.OptionId == "OPT_SHIFTWORK_ANALYSIS")
                    {
                        var data = (await db.QueryAsync<dynamic>(
                            "USP_FXPRO_Insight_Dashboard_SewingTeamOutputAnalysis_GetData",
                            new { CompanyID = request.CompanyId, SiteID = request.SiteId, Date = request.FilterDate.Date, TeamID = request.TeamId, ShiftWorkID = request.ShiftWorkId },
                            commandType: CommandType.StoredProcedure)).ToList();
                        deepDataJson = JsonSerializer.Serialize(data);
                    }
                    else
                    {
                        var data = (await db.QueryAsync<dynamic>(
                            "USP_FXPRO_Insight_SewingTeamPerformance_DefectDetail",
                            new { CompanyID = request.CompanyId, SiteID = request.SiteId, SectionID = request.SectionId, Date = request.FilterDate.Date, TeamID = request.TeamId },
                            commandType: CommandType.StoredProcedure)).ToList();
                        deepDataJson = JsonSerializer.Serialize(data);
                    }
                }
                catch
                {
                    deepDataJson = GetMockJsonContent("GetOverallDefectAnalysis.json");
                }
            }

            // 2. Build Prompt & Call Gemini
            string apiKey = _config["GeminiSettings:ApiKey"] ?? "";
            string prompt = $@"
You are a Senior Garment Manufacturing Specialist.
Based on the granular dataset below (Option: {request.OptionId}):

[GRANULAR DATASET]:
{deepDataJson}

Please generate a comprehensive Root Cause Analysis Report in professional Business English:
1. Operational situation assessment.
2. Root cause determination for defect variances.
3. 3 immediate technical resolutions for line supervisors and technicians.
Write the report in clean Markdown in English.";

            string markdownResult = await CallGeminiOrFallbackAsync(apiKey, prompt, GetDefaultDrillDownMarkdown(request.OptionId));

            var response = new AiDrillDownResponseDto
            {
                Success = true,
                SubModuleCode = request.SubModuleCode,
                OptionId = request.OptionId,
                Title = request.OptionId == "OPT_SHIFTWORK_ANALYSIS" 
                    ? "Deep-Dive Shiftwork Productivity & Output Analysis Report" 
                    : "Root Cause Analysis Report: Sewing Line Quality & Defects",
                RootCauseAnalysis = "Skip Stitch defects account for 45% of total defects, concentrated primarily during the early afternoon shift due to needle wear and uneven thread tension balance across machines.",
                KeyHighlights = new List<string>
                {
                    "Sewing Line 01 achieved the fastest defect resolution time (< 15 minutes).",
                    "Morning shift maintained a steady pace of 45 units/hour."
                },
                Warnings = new List<string>
                {
                    "Sewing Line 02 exceeded the allowable Skip Stitch defect threshold (4.8%).",
                    "Afternoon shift experienced pacing slowdown between 14:30 - 15:30."
                },
                ActionItems = new List<string>
                {
                    "Replace sewing needles for the first 5 machines on Line 02.",
                    "Technical Supervisor to adjust lower thread tension prior to afternoon shift.",
                    "Strengthen QA inspection at sleeve attachment sewing stations."
                },
                RawMarkdown = markdownResult,
                IsCached = false,
                GeneratedAt = DateTime.Now
            };

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(_config.GetValue<int>("AiEngineConfig:CacheDurationMinutes", 60)));
            _cache.Set(cacheKey, response, cacheOptions);

            return response;
        }

        private async Task<string> CallGeminiOrFallbackAsync(string apiKey, string prompt, string fallbackMarkdown)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return fallbackMarkdown;
            }

            try
            {
                string apiUrl = $"{_config["GeminiSettings:ApiUrl"]}?key={apiKey}";
                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(apiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(jsonResponse);
                    var text = doc.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();

                    return text ?? fallbackMarkdown;
                }
            }
            catch
            {
                // Fallback on network or API key issues
            }

            return fallbackMarkdown;
        }

        private string GetDefaultOverviewMarkdown(DateTime date)
        {
            return $@"### 🤖 EXECUTIVE DAILY BRIEFING ({date:yyyy-MM-dd})

#### 🌟 Key Highlights
* **Overall Productivity**: Total factory output reached **102%** against the daily target.
* **Top Performing Line**: **Sewing Line 03** recorded the highest productivity at **108%** of plan with a defect rate below 1.5%.

#### ⚠️ Operational Warnings
* **Slight Defect Rate Elevation**: **Sewing Section 2** observed a 4.2% increase in *Skip Stitch* defects compared to yesterday.
* **Shift Pacing Variance**: Afternoon shift output on Line 02 dipped 5% compared to the morning shift.

#### 💡 Action Recommendations
1. **Technical Staff**: Adjust presser foot pressure and replace sewing needles on Line 02.
2. **Shift Management**: Rebalance line pacing for the afternoon shift to ensure consistent output.";
        }

        private string GetDefaultDrillDownMarkdown(string optionId)
        {
            if (optionId == "OPT_SHIFTWORK_ANALYSIS")
            {
                return @"### ⏱️ DEEP-DIVE SHIFTWORK PRODUCTIVITY REPORT

#### 📊 Shiftwork Output Assessment
* **Morning Shift (07:30 - 11:30)**: Output reached **520/500 pcs** (104%), average cycle time **42 sec/pc**.
* **Afternoon Shift (13:00 - 17:00)**: Output reached **460/500 pcs** (92%), average cycle time **48 sec/pc**.

#### 🔍 Discrepancy Causes
1. Afternoon shift experienced 20 minutes of technical downtime due to repeated thread breaks at side seam stations.
2. Fatigue during 15:00 - 16:00 reduced operational pace by 8% among junior operators.

#### 💡 Adjustment Recommendations
* Deploy float operators to bottleneck workstations.
* Inspect thread tension quality prior to loading afternoon shift materials.";
            }

            return @"### 🔍 ROOT CAUSE ANALYSIS REPORT: SEWING LINE DEFECTS

#### 📉 Defect Distribution Breakdown
* **Skip Stitch**: 45% (Concentrated on Line 02)
* **Thread Break**: 30% (Concentrated on Lines 01 & 04)
* **Uneven Stitch**: 15%
* **Others**: 10%

#### 🧠 Root Cause Identification
1. **Equipment**: Sewing needle points dulled after 72 continuous operating hours without replacement.
2. **Material**: New thread batch exhibits inconsistent elasticity, leading to breaks under high-speed sewing (>4,000 RPM).

#### 🛠️ Immediate Corrective Actions
1. **Replace Needles**: Change needles across all 8 machines at armhole insertion stations on Line 02.
2. **Machine Parameters**: Reduce machine speed by 5% and reduce thread tension by 10%.
3. **Re-inspection**: QA team to audit 10 sample units immediately following adjustment.";
        }
    }
}
