using System;
using System.Collections.Generic;

namespace Backend_LNT_Insight.Dtos
{
    public class AiOverviewRequestDto
    {
        public string PageCode { get; set; } = "HOME_BRIEFING";
        public string CompanyId { get; set; } = "COM01";
        public string SiteId { get; set; } = "SI01";
        public int SectionId { get; set; } = 1;
        public DateTime FilterDate { get; set; } = DateTime.Today;
        public bool ForceRefresh { get; set; } = false;
    }

    public class DrillDownOptionDto
    {
        public string OptionId { get; set; } = string.Empty;
        public string OptionLabel { get; set; } = string.Empty;
        public string SubModuleCode { get; set; } = string.Empty;
        public Dictionary<string, object>? Params { get; set; }
    }

    public class AiInsightCardDto
    {
        public string InsightId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string SummaryText { get; set; } = string.Empty;
        public string Severity { get; set; } = "INFO"; // INFO, SUCCESS, WARNING, DANGER
        public string ModuleCode { get; set; } = string.Empty;
        public string SubModuleCode { get; set; } = string.Empty;
        public DrillDownOptionDto? DrillDownTarget { get; set; }
    }

    public class AiOverviewResponseDto
    {
        public bool Success { get; set; } = true;
        public string PageCode { get; set; } = string.Empty;
        public string OverviewTitle { get; set; } = string.Empty;
        public string RawMarkdown { get; set; } = string.Empty;
        public List<AiInsightCardDto> Insights { get; set; } = new();
        public List<DrillDownOptionDto> AvailableOptions { get; set; } = new();
        public bool IsCached { get; set; } = false;
        public DateTime GeneratedAt { get; set; } = DateTime.Now;
    }

    public class AiDrillDownRequestDto
    {
        public string SubModuleCode { get; set; } = "MD3SMD2";
        public string OptionId { get; set; } = "OPT_DEFECT_ANALYSIS";
        public string CompanyId { get; set; } = "COM01";
        public string SiteId { get; set; } = "SI01";
        public int SectionId { get; set; } = 1;
        public int TeamId { get; set; } = 0;
        public int ShiftWorkId { get; set; } = 0;
        public DateTime FilterDate { get; set; } = DateTime.Today;
        public bool ForceRefresh { get; set; } = false;
    }

    public class AiDrillDownResponseDto
    {
        public bool Success { get; set; } = true;
        public string SubModuleCode { get; set; } = string.Empty;
        public string OptionId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string RootCauseAnalysis { get; set; } = string.Empty;
        public List<string> KeyHighlights { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public List<string> ActionItems { get; set; } = new();
        public string RawMarkdown { get; set; } = string.Empty;
        public bool IsCached { get; set; } = false;
        public DateTime GeneratedAt { get; set; } = DateTime.Now;
    }
}
