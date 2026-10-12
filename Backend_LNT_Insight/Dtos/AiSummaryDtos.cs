using System;
using System.Collections.Generic;

namespace Backend_LNT_Insight.Dtos
{
    public class AiCardItemDto
    {
        public string Id { get; set; } = string.Empty;     // e.g. "card_production", "card_defect", "card_shift"
        public string? Prompt { get; set; }                // Optional override instruction; if null/empty, reads from appsettings.json
        public object? Data { get; set; }                  // Data from SP query (object, list, dynamic...)
    }

    public class AiBatchRequestDto
    {
        public string? CacheKey { get; set; }              // e.g. "HOME_CARDS_COM01_20261012"
        public bool ForceRefresh { get; set; } = false;
        public List<AiCardItemDto> Items { get; set; } = new();
    }

    public class AiCardResultDto
    {
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Severity { get; set; } = "INFO"; // "SUCCESS", "WARNING", "DANGER", "INFO"
    }

    public class AiBatchResponseDto
    {
        public bool Success { get; set; } = true;
        public string? ErrorMessage { get; set; }
        public Dictionary<string, AiCardResultDto> Results { get; set; } = new();
        public bool IsCached { get; set; } = false;
        public DateTime GeneratedAt { get; set; } = DateTime.Now;
    }
}
