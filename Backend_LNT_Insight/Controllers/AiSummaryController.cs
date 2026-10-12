using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Backend_LNT_Insight.Dtos;
using Backend_LNT_Insight.Services.AI;

namespace Backend_LNT_Insight.Controllers
{
    [Route("api/v1/ai")]
    [ApiController]
    public class AiSummaryController : ControllerBase
    {
        private readonly IGeminiService _geminiService;

        public AiSummaryController(IGeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        /// <summary>
        /// Execute Batch AI Analysis for multiple cards in 1 single request.
        /// Each card has its own Id, Prompt, and SP Query Data.
        /// </summary>
        [HttpPost("batch-generate")]
        public async Task<IActionResult> BatchGenerate([FromBody] AiBatchRequestDto request)
        {
            if (request == null || request.Items == null || request.Items.Count == 0)
            {
                return BadRequest(new AiBatchResponseDto
                {
                    Success = false,
                    ErrorMessage = "Request payload must contain at least one analysis item."
                });
            }

            var result = await _geminiService.ExecuteBatchAnalysisAsync(request);
            if (!result.Success)
            {
                return StatusCode(502, result);
            }

            return Ok(result);
        }
    }
}
