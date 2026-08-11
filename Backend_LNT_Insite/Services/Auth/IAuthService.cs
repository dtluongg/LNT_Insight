using Backend_LNT_Insight.Dtos.AuthDto;

namespace Backend_LNT_Insight.Services.Auth
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest loginRequest);
        Task<TokenModel> RefreshAsync(TokenModel tokenRequest);
        Task<bool> ChangePasswordAsync(ChangePasswordRequest passwordRequest);
        Task<bool> ResetPasswordAsync(ResetPasswordRequest resetPasswordRequest);

    }
}
