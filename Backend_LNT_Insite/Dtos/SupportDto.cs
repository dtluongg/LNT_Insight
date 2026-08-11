namespace Backend_LNT_Insight.Dtos
{
    public class CreateTicketRequest
    {
        public string Username { get; set; } = string.Empty;
        public string ActivePageName { get; set; } = string.Empty;
        public string ActivePageURL { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public string ErrorDescription { get; set; } = string.Empty;
        public string ScreenshotBase64 { get; set; } = string.Empty;
    }

    public class SaveHelpRequest
    {
        public int MenuFunctionID { get; set; }
        public string HelpContentHTML { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
    }
}
