namespace Backend_LNT_Insight.Dtos
{
    public class UserInfo
    {
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public bool? Authorized { get; set; }
        public bool? Admin { get; set; }
        public string? DefaultCompanyID { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public DateTime? LastUpdatePW { get; set; }
        public bool? IsNewUser { get; set; }
    }
}
