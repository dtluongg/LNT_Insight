using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using Backend_LNT_Insight.Dtos;

namespace Backend_LNT_Insight.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupportController : ControllerBase
    {
        private readonly string _connectionString;

        public SupportController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' is missing!");
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        [HttpGet("help/{functionId}")]
        public async Task<IActionResult> GetHelpContent(int functionId)
        {
            using var db = CreateConnection();
            var result = await db.QueryFirstOrDefaultAsync<dynamic>(
                "USP_Support_GetHelpByFunction",
                new { MenuFunctionID = functionId },
                commandType: CommandType.StoredProcedure
            );

            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy tài liệu hướng dẫn cho chức năng này." });
            }

            return Ok(result);
        }

        [HttpPost("ticket")]
        public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
        {
            if (string.IsNullOrEmpty(request.ErrorDescription))
            {
                return BadRequest(new { message = "Vui lòng cung cấp mô tả lỗi." });
            }

            using var db = CreateConnection();
            await db.ExecuteAsync(
                "USP_Support_CreateITTicket",
                new
                {
                    request.Username,
                    request.ActivePageName,
                    request.ActivePageURL,
                    request.UserAgent,
                    request.ErrorDescription,
                    request.ScreenshotBase64
                },
                commandType: CommandType.StoredProcedure
            );

            return Ok(new { success = true, message = "Gửi báo cáo lỗi cho IT thành công!" });
        }

        [HttpPost("help/save")]
        public async Task<IActionResult> SaveHelpContent([FromBody] SaveHelpRequest request)
        {
            if (request.MenuFunctionID <= 0)
            {
                return BadRequest(new { message = "Mã chức năng (MenuFunctionID) không hợp lệ." });
            }

            using var db = CreateConnection();
            await db.ExecuteAsync(
                "USP_Support_SaveHelpContent",
                new
                {
                    request.MenuFunctionID,
                    request.HelpContentHTML,
                    request.UpdatedBy
                },
                commandType: CommandType.StoredProcedure
            );

            return Ok(new { success = true, message = "Cập nhật hướng dẫn nghiệp vụ thành công!" });
        }

        [HttpGet("tickets")]
        public async Task<IActionResult> GetAllTickets()
        {
            using var db = CreateConnection();
            var result = await db.QueryAsync<dynamic>(
                "USP_Support_GetAllTickets",
                commandType: CommandType.StoredProcedure
            );
            return Ok(result);
        }
    }
}
