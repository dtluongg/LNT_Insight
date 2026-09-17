namespace Backend_LNT_Insight.Dtos.AuthDto
{
    // --- Model kết nối Database (Dùng nội bộ Backend cho Dapper) ---
    public record UserInfo
    {
        public string Username { get; init; } = string.Empty;
        public string? FullName { get; init; }
        public string? Email { get; init; }
        public string? Password { get; init; }
        public bool? Authorized { get; init; }
        public bool? Admin { get; init; }
        public string? DefaultCompanyID { get; init; }
        public string? RefreshToken { get; init; }
        public DateTime? RefreshTokenExpiryTime { get; init; }
        public DateTime? LastUpdatePW { get; init; }
        public bool? IsNewUser { get; init; }
    }

    // --- Requests ---
    public record LoginRequest
    {
        public string Username { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }

    public record ChangePasswordRequest
    {
        public string Username { get; init; } = string.Empty;
        public string OldPassword { get; init; } = string.Empty;
        public string NewPassword { get; init; } = string.Empty;
    }

    public record ResetPasswordRequest
    {
        public string Username { get; init; } = string.Empty;
        public string NewPassword { get; init; } = string.Empty;
    }

    public record TokenModel
    {
        public string AccessToken { get; init; } = string.Empty;
        public string RefreshToken { get; init; } = string.Empty;
    }

    // --- Responses & Sub-DTOs (Trả ra Frontend) ---
    public record UserInfoDto
    {
        public string Username { get; init; } = string.Empty;
        public string? FullName { get; init; }
        public string? Email { get; init; }
        public bool IsAdmin { get; init; }
        public string? DefaultCompanyID { get; init; }
        public string? DefaultSiteID { get; init; }
    }

    public record SiteDto
    {
        public string CompanySiteID { get; init; } = string.Empty;
        public string SiteCode { get; init; } = string.Empty;
        public string SiteName { get; init; } = string.Empty;
    }

    public record ModuleDto
    {
        public string CompanySiteID { get; init; } = string.Empty;
        public string ModuleMasterID { get; init; } = string.Empty;
        public string ModuleMasterName { get; init; } = string.Empty;
    }

    public record LoginResponse
    {
        public string Token { get; init; } = string.Empty;
        public string RefreshToken { get; init; } = string.Empty;
        public UserInfoDto User { get; init; } = new();
        public List<SiteDto> AuthorizedSites { get; init; } = new();
        public List<ModuleDto> AuthorizedModules { get; init; } = new();
    }
}
