import type { AuthorizedCompanyDto, User } from '../../types';

// ==========================================
// 1. KHAI BÁO CÁC HẰNG SỐ TÊN KHÓA (KEYS)
// Gom tên key vào một chỗ để tránh gõ sai chính tả giữa hàm ĐỌC và hàm GHI
// ==========================================
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';
const AUTHORIZED_COMPANIES_KEY = 'authorized_companies';  // Key lưu danh sách công ty được phân quyền
const SELECTED_COMPANY_KEY = 'selected_company_id';       // Key lưu mã công ty đang chọn

export const authStorage = {

  // --- QUẢN LÝ ACCESS TOKEN (Chuỗi xác thực API) ---
  // Lấy token ra (nếu không có thì trả về null)
  getToken: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  // Use for save token in browser
  setToken: (token: string): void => sessionStorage.setItem(TOKEN_KEY, token),

  //// --- Manage REFRESH TOKEN (Cấp lại token khi hết hạn) ---
  getRefreshToken: (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY),

  setRefreshToken: (token: string): void => sessionStorage.setItem(REFRESH_TOKEN_KEY, token),

  // --- QUẢN LÝ THÔNG TIN TÀI KHOẢN (USER OBJECT) ---
  getUser: (): User | null => {
    // Step 1: get user from browser (sessionStorage)
    const userStr = sessionStorage.getItem(USER_KEY);
    if (!userStr) return null;  // if not logged in -> return null
    // Step 2: Chuyển chuỗi JSON thành Object kiểu User
    try {
      // convert Json data to UserDTO
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getAuthorizedCompanies: (): AuthorizedCompanyDto[] => {
    const data = sessionStorage.getItem(AUTHORIZED_COMPANIES_KEY);
    if (!data) return [];
    try {
      // convert Json data to Author List Company DTO
      return JSON.parse(data) as AuthorizedCompanyDto[];
    } catch {
      return [];
    }
  },

  setAuthorizedCompanies: (companies: AuthorizedCompanyDto[]): void => {
    // convert User Object to Json data and save.
    sessionStorage.setItem(AUTHORIZED_COMPANIES_KEY, JSON.stringify(companies));
  },

  getSelectedCompany: (): string | null => sessionStorage.getItem(SELECTED_COMPANY_KEY),

  setSelectedCompany: (companyID: string): void => sessionStorage.setItem(SELECTED_COMPANY_KEY, companyID),

  clear: (): void => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(AUTHORIZED_COMPANIES_KEY); // Dọn dẹp sạch sẽ khi Logout
    sessionStorage.removeItem(SELECTED_COMPANY_KEY);
  }
};