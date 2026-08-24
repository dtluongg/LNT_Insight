using BCrypt.Net;

namespace Backend_LNT_Insight.Helpers
{
    public class PWHelperHash
    {
        public static string HashPassword(string passwordInput)
        {
            return BCrypt.Net.BCrypt.HashPassword(passwordInput);
        }

        public static bool VerifyPassword(string passwordInput, string passwordHashed)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(passwordInput, passwordHashed);
            }
            catch
            {
                return passwordInput == passwordHashed;
            }
        }
    }
}
