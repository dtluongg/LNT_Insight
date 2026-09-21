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
            var userFind = await db.QueryFirstOrDefaultAsync<UserInfoFindDto>(
                    "USP_FXPRO_Insight_CheckUser",
                    new { UserID = loginRequest.Username },
                    commandType: CommandType.StoredProcedure
                );
            if (userFind == null)
            {
                return new LoginResponse
                {
                    IsSuccess = false,
                    Message = "User Not Authorized"
                };
            }

            // [SỬA TẠI ĐÂY]: Xác thực thông minh - Chấp nhận cả 2 loại mật khẩu và không cập nhật DB
            if (string.IsNullOrEmpty(userFind.Password) || !PWHelperHash.VerifyPassword(loginRequest.Password, userFind.Password))
            {
                return new LoginResponse
                {
                    IsSuccess = false,
                    Message = "Incorrect Password"
                };
            }

            var userInfo = await db.QueryFirstOrDefaultAsync<UserInfoNew>(
                    "USP_FXPRO_Insight_GetInfoUser",
                    new { userFind.UserID },
                    commandType: CommandType.StoredProcedure
                );
            if (userInfo == null) return null;

            // Kiểm tra Authorized flag:
            //if (userInfo.Authorized == false) return null;

            // Get list company follow user:
            var userCompanies = (await db.QueryAsync<CompanyDto>(
                    "select * from [dbo].[tblMastUserCompany] where UserID = @UserID",
                    new { userFind.UserID }
                )).ToList();


            // Tạo JWT (Access Token và Refresh Token):
            var accessToken = _jwtHelper.GenerateJwtAccessToken(userInfo);
            var refreshToken = _jwtHelper.GenerateJwtRefreshToken(userInfo);

            // Cập nhật refreshToken 
            await db.ExecuteAsync(
                "USP_FXPRO_Insight_SaveRefreshToken",
                new
                {
                    UserID = loginRequest.Username,
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
                    Username = userInfo.UserID,
                    FullName = userInfo.FullName,
                    Email = userInfo.Email,
                    IsAdmin = userInfo.Admin ?? false,
                    DefaultCompanyID = userInfo.DefaultCompanyID,
                },
                AuthorizedCompanies = userCompanies,
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
                "SELECT COUNT(1) FROM tblMastUser WHERE UserID = @UserID",
                new { UserID = resetPasswordRequest.Username }
            );
            if (userExists == 0) return false;

            var hashPassword = PWHelperHash.HashPassword(resetPasswordRequest.NewPassword);
            await db.ExecuteAsync(
                "UPDATE tblMastUser SET Password = @Password WHERE UserID = @UserID",
                new
                {
                    UserID = resetPasswordRequest.Username,
                    Password = hashPassword
                }
            );
            return true;
        }
    }
}
