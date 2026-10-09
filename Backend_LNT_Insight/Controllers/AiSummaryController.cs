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
        /// Stage 1: Get Macro Executive Overview Briefing & Available Drill-Down Options
        /// </summary>
        [HttpPost("overview")]
        public async Task<IActionResult> GetOverview([FromBody] AiOverviewRequestDto request)
        {
            if (request == null)
            {
                request = new AiOverviewRequestDto();
            }

            var result = await _geminiService.GetOverviewSummaryAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// Stage 2: Get Deep-Dive Root Cause Analysis for a selected option
        /// </summary>
        [HttpPost("drill-down")]
        public async Task<IActionResult> GetDrillDown([FromBody] AiDrillDownRequestDto request)
        {
            if (request == null)
            {
                return BadRequest(new { Message = "Drill-down request parameters are required." });
            }

            var result = await _geminiService.GetDrillDownAnalysisAsync(request);
            return Ok(result);
        }
    }
}
