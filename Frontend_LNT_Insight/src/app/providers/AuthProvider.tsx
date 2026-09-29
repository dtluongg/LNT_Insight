import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginResponse, AuthorizedCompanyDto } from '../../types';
import { authStorage } from '../../core/auth/authStorage';

interface AuthContextType {
  user: User | null; // Thông tin user đăng nhập
  authorizedCompanies: AuthorizedCompanyDto[]; // Danh sách cac cong ty dc phan quyen
  selectedCompanyID: string; // company ID using (EX: 'COM01')
  setSelectedCompanyID: (companyID: string) => void; // Function for change companyID
  loginMessage: string | null; // Message phản hồi khi đăng nhập
  isAuthenticated: boolean; // Check status loged in?
  isLoading: boolean; // check status loading data
  login: (data: LoginResponse) => void; // function check status loged in
  logout: () => void; // function logout. 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authorizedCompanies, setAuthorizedCompanies] = useState<AuthorizedCompanyDto[]>([]);
  const [selectedCompanyID, setSelectedCompanyIDState] = useState<string>('');
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  const changeSelectedCompanyID = (companyID: string) => {
    authStorage.setSelectedCompany(companyID);
    setSelectedCompanyIDState(companyID);
  };


  // -------------------------------------------------------------
  // KHI KHỞI CHẠY APP HOẶC F5 (Reload trang)
  // Chỉ chạy đúng 1 lần duy nhất khi ứng dụng vừa mount
  // -------------------------------------------------------------
  useEffect(() => {
    // get data from session storage.
    const storedUser = authStorage.getUser();
    const token = authStorage.getToken();
    if (storedUser && token) {
      setUser(storedUser);
      // Đọc authorizedCompanies đã lưu từ session Storage
      const companies = authStorage.getAuthorizedCompanies();
      setAuthorizedCompanies(companies);
      // Thuật toán xác định CompanyID hợp lệ khi vào lại web
      const companyIds = companies.map(c => c.companyID);
      const storedCompany = authStorage.getSelectedCompany();
      // Kiểm tra: Có ID lưu cũ không? Có nằm trong danh sách quyền không?
      const validCompany = (storedCompany && (companyIds.length === 0 || companyIds.includes(storedCompany)))
        ? storedCompany
        : (storedUser.defaultCompanyID && (companyIds.length === 0 || companyIds.includes(storedUser.defaultCompanyID)))
          ? storedUser.defaultCompanyID
          : companyIds[0] || storedUser.defaultCompanyID || '';

      // Cập nhật state công ty đang chọn
      setSelectedCompanyIDState(validCompany);
      if (validCompany) {
        authStorage.setSelectedCompany(validCompany);
      }
    }
    // Đánh dấu đã nạp dữ liệu xong
    setIsLoading(false);
  }, []);

  const login = (data: LoginResponse) => {
    // Lưu token và thông tin user vào storage & state
    authStorage.setToken(data.token);
    if (data.refreshToken) {
      authStorage.setRefreshToken(data.refreshToken);
    }
    authStorage.setUser(data.user);
    setUser(data.user);

    // Lọc trùng lặp đối tượng dựa trên companyID
    const uniqueCompanies = (data.authorizedCompanies || []).reduce<AuthorizedCompanyDto[]>((acc, current) => {
      if (!acc.some(item => item.companyID === current.companyID)) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Lưu mảng công ty vào storage & state
    authStorage.setAuthorizedCompanies(uniqueCompanies);
    setAuthorizedCompanies(uniqueCompanies);

    // Chọn công ty mặc định ngay khi vừa đăng nhập
    const companyIds = uniqueCompanies.map(c => c.companyID);
    const defaultCompany = (data.user?.defaultCompanyID && (companyIds.length === 0 || companyIds.includes(data.user.defaultCompanyID)))
      ? data.user.defaultCompanyID
      : companyIds[0] || data.user?.defaultCompanyID || '';

    changeSelectedCompanyID(defaultCompany);
    
    // Lưu thông điệp đăng nhập
    setLoginMessage(data.message || null);
  };

  // -------------------------------------------------------------
  // HÀM ĐĂNG XUẤT (LOGOUT)
  // -------------------------------------------------------------
  const logout = () => {
    // Dọn dẹp toàn bộ dữ liệu storage
    authStorage.clear();

    // Reset toàn bộ state về trạng thái ban đầu
    setUser(null);
    setAuthorizedCompanies([]);
    setSelectedCompanyIDState('');
    setLoginMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authorizedCompanies,
        selectedCompanyID,
        setSelectedCompanyID: changeSelectedCompanyID, // Hàm này bắn ra ngoài
        loginMessage,
        isAuthenticated: !!user, // Có user = true, không có = false
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Nếu gọi hook này ở component không nằm bên trong <AuthProvider> thì báo lỗi ngay
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
