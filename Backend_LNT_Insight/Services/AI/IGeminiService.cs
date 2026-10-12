using System.Threading.Tasks;
using Backend_LNT_Insight.Dtos;

namespace Backend_LNT_Insight.Services.AI
{
    public interface IGeminiService
    {
        Task<AiBatchResponseDto> ExecuteBatchAnalysisAsync(AiBatchRequestDto request);
    }
}
