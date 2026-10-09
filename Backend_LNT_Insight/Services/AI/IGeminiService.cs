using System.Threading.Tasks;
using Backend_LNT_Insight.Dtos;

namespace Backend_LNT_Insight.Services.AI
{
    public interface IGeminiService
    {
        Task<AiOverviewResponseDto> GetOverviewSummaryAsync(AiOverviewRequestDto request);
        Task<AiDrillDownResponseDto> GetDrillDownAnalysisAsync(AiDrillDownRequestDto request);
    }
}
