using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Backend_LNT_Insight.DataConfig;
using Backend_LNT_Insight.Helpers;
using Backend_LNT_Insight.Dtos;
using Backend_LNT_Insight.Dtos.AuthDto;

namespace Backend_LNT_Insight.Services.Auth
{
    public class AuthServiceImplement : IAuthService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;
        private readonly ProtectByJWT _jwtHelper;

        public AuthServiceImplement(IConfiguration configuration, ProtectByJWT jwtHelper)
        {
            _configuration = configuration;
            _jwtHelper = jwtHelper;
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }


        public Task<bool> ChangePasswordAsync(ChangePasswordRequest passwordRequest)
        {
            throw new NotImplementedException();
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest loginRequest)
        {
            using IDbConnection db = new SqlConnection(_connectionString);
            // 1. tìm user trong database:
            var userFind = await db.QueryFirstOrDefaultAsync<UserInfo>(
                    "USP_Auth_GetUserByUsername",
                    new { loginRequest.Username },
                    commandType: CommandType.StoredProcedure
                );
            if (userFind == null) return null;

            // xác thực mật khẩu:
            if (string.IsNullOrEmpty(userFind.Password) || !PWHelperHash.VerifyPassword(loginRequest.Password, userFind.Password))
            {
                return null;
            }

            // Kiểm tra Authorized flag:
            if (userFind.Authorized == false) return null;

            // Tạo JWT (Access Token và Refresh Token):
            var accessToken = _jwtHelper.GenerateJwtAccessToken(userFind);
            var refreshToken = _jwtHelper.GenerateJwtRefreshToken(userFind);

            // Cập nhật refreshToken 
            await db.ExecuteAsync(
                "USP_Auth_UpdateRefreshToken",
                new
                {
                    loginRequest.Username,
                    RefreshToken = refreshToken,
                    RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1).ToString()
                },
                commandType: CommandType.StoredProcedure
            );

            // return 
            return new LoginResponse
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                User = new UserInfoDto
                {
                    Username = userFind.Username,
                    FullName = userFind.FullName,
                    Email = userFind.Email,
                    IsAdmin = userFind.Admin ?? false,
                    DefaultCompanyID = userFind.DefaultCompanyID,
                }
            };
        }

        public Task<TokenModel> RefreshAsync(TokenModel tokenRequest)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequest resetPasswordRequest)
        {
            using IDbConnection db = new SqlConnection(_connectionString);
            
            // Check if user exists first to verify the target username is valid
            var userExists = await db.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM tblMastUser WHERE Username = @Username",
                new { resetPasswordRequest.Username }
            );
            if (userExists == 0) return false;

            var hashPassword = PWHelperHash.HashPassword(resetPasswordRequest.NewPassword);
            await db.ExecuteAsync(
                "USP_Auth_ResetPassword",
                new
                {
                    resetPasswordRequest.Username,
                    Password = hashPassword
                },
                commandType: CommandType.StoredProcedure
            );
            return true;
        }
    }
}
