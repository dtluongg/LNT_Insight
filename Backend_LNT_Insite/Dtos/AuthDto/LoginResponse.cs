namespace Backend_LNT_Insight.Dtos.AuthDto
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserInfoDto User { get; set; } = new();
        public List<SiteDto> AuthorizedSites { get; set; } = new();
        public List<ModuleDto> AuthorizedModules { get; set; } = new();
    }

    public class UserInfoDto { 
        public string Username { get; set; } = string.Empty;
        public string ? FullName { get; set; } = string.Empty;
        public string ? Email { get; set; } = string.Empty;
        public bool IsAdmin { get; set; } = false;
        public string ? DefaultCompanyID { get; set; } = string.Empty;
        public string ? DefaultSiteID { get; set; } = string.Empty;
    }

    public class SiteDto
    {
        public string CompanySiteID { get; set; } = string.Empty;
        public string SiteCode { get; set; } = string.Empty;
        public string SiteName { get; set; } = string.Empty;
    }

    public class ModuleDto
    {
        public string CompanySiteID { get; set; } = string.Empty;
        public string ModuleMasterID { get; set; } = string.Empty;
        public string ModuleMasterName { get; set; } = string.Empty;
    }
}
