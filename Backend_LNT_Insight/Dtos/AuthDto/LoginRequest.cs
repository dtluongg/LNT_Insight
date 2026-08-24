namespace Backend_LNT_Insight.Dtos.AuthDto
{
    // class is used to send login info to server
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
