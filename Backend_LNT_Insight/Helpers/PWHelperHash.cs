using System;
using System.Text;
using System.Security.Cryptography;
using BCrypt.Net;

namespace Backend_LNT_Insight.Helpers
{
    public class PWHelperHash
    {
        // Hàm băm dùng khi tạo mới hoặc Reset mật khẩu (luôn dùng BCrypt)
        public static string HashPassword(string passwordInput)
        {
            return BCrypt.Net.BCrypt.HashPassword(passwordInput);
        }

        // Hàm kiểm tra tự động nhận diện loại hash
        public static bool VerifyPassword(string passwordInput, string passwordHashed)
        {
            if (string.IsNullOrEmpty(passwordInput) || string.IsNullOrEmpty(passwordHashed))
                return false;

            // Nếu chuỗi bắt đầu bằng '$2', hệ thống hiểu đây là BCrypt
            if (passwordHashed.StartsWith("$2"))
            {
                try
                {
                    return BCrypt.Net.BCrypt.Verify(passwordInput, passwordHashed);
                }
                catch
                {
                    return false; // Định dạng lỗi hoặc hash không hợp lệ
                }
            }
            else
            {
                // Ngược lại, xác thực theo cơ chế SHA-512 cũ của VB
                string legacyHash = CreateLegacySHA512Hash(passwordInput);

                // So sánh an toàn chuỗi (Fixed Time) nhằm chống tấn công Timing Attack
                return CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(legacyHash),
                    Encoding.UTF8.GetBytes(passwordHashed)
                );
            }
        }

        // Logic SHA-512 nguyên bản từ VB cũ chuyển sang C#
        private static string CreateLegacySHA512Hash(string password)
        {
            const string hardcodedSalt = "~av%^*#465@^t~%%4~~@3";
            using (SHA512 sha512 = SHA512.Create())
            {
                byte[] passwordAsBytes = Encoding.UTF8.GetBytes(string.Concat(password, hardcodedSalt));
                byte[] encryptedBytes = sha512.ComputeHash(passwordAsBytes);
                return Convert.ToBase64String(encryptedBytes);
            }
        }
    }
}
