using Backend_LNT_Insight.Dtos.AuthDto;
using Backend_LNT_Insight.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_LNT_Insight.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var response = await _authService.LoginAsync(loginRequest);
            if(response == null)
            {
                return Unauthorized(new { message = "Username or Password is wrong, please check again or contact to ADMIN" });
            }
            return Ok(response);
        }

        [HttpPost("reset-password")]
        [Authorize(Roles = "Admin")] // Require authorization, Admin only
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest resetPasswordRequest)
        {
            var result = await _authService.ResetPasswordAsync(resetPasswordRequest);
            if (!result)
            {
                return BadRequest(new { message = "Không thể đổi mật khẩu. Vui lòng thử lại!" });
            }
            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }

    }
}
