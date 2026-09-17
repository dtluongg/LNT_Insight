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

//UserID, FullName, Password, Email, Phone, Avatar, Signature, Checked, Authorized, Admin, CompanyID, SetByUser, CreatedTime, LastUpdatePW, IsNewUser, VPN_UserName, VPN_DomainName, DefaultCompanyID
    public record UserInfoNew
    {
        public string UserID {get; init;} = string.Empty;
        public string? FullName { get; init; }
        public string? Password { get; init; }
        public string? Email { get; init; }
        public string? Phone { get; init; }
        public string? Avatar { get; init; }
        public string? Signature { get; init; }
        public bool? Checked { get; init; }
        public bool? Authorized { get; init; }
        public bool? Admin { get; init; }
        public string? CompanyID { get; init; }
        public string? SetByUser { get; init; }
        public DateTime? CreatedTime { get; init; }
        public DateTime? LastUpdatePW { get; init; }
        public bool? IsNewUser { get; init; }
        public string? VPN_UserName { get; init; }
        public string? VPN_DomainName { get; init; }
        public string? DefaultCompanyID { get; init; }
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

    public record UserInfoFindDto
    {
        public string UserID { get; init; } = string.Empty;
        public string? ActiveFlag { get; init; }
        public bool? AdminUser { get; init; }
        public string? RefreshToken { get; init; }
        public string? RefreshTokenExpiryTime { get; init; }
        public string? Password { get; init; }

    }

    public record CompanyDto {
        public string CompanyID { get; init; } = string.Empty;
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
        public bool IsSuccess { get; init; } = true;
        public string? Message { get; init; } = string.Empty;
        public string Token { get; init; } = string.Empty;
        public string RefreshToken { get; init; } = string.Empty;
        public UserInfoDto User { get; init; } = new();
        //public List<SiteDto> AuthorizedSites { get; init; } = new();
        //public List<ModuleDto> AuthorizedModules { get; init; } = new();
        public List<CompanyDto> AuthorizedCompanies { get; init; } = new();
    }
}
