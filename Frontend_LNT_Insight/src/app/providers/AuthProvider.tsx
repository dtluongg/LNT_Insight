import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginResponse } from '../../types';
import { authStorage } from '../../core/auth/authStorage';

interface AuthContextType {
  user: User | null;
  authorizedCompanies: string[]; // Danh sách mã các công ty được phân quyền
  selectedCompanyID: string;
  setSelectedCompanyID: (companyID: string) => void;
  loginMessage: string | null; // Message phản hồi khi đăng nhập
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authorizedCompanies, setAuthorizedCompanies] = useState<string[]>([]);
  const [selectedCompanyID, setSelectedCompanyIDState] = useState<string>('');
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  const changeSelectedCompanyID = (companyID: string) => {
    authStorage.setSelectedCompany(companyID);
    setSelectedCompanyIDState(companyID);
  };

  useEffect(() => {
    const storedUser = authStorage.getUser();
    const token = authStorage.getToken();
    if (storedUser && token) {
      setUser(storedUser);
      // Đọc authorizedCompanies đã lưu từ localStorage
      const companies = authStorage.getAuthorizedCompanies();
      setAuthorizedCompanies(companies);

      const storedCompany = authStorage.getSelectedCompany();
      const validCompany = (storedCompany && (companies.length === 0 || companies.includes(storedCompany)))
        ? storedCompany
        : (storedUser.defaultCompanyID && (companies.length === 0 || companies.includes(storedUser.defaultCompanyID)))
          ? storedUser.defaultCompanyID
          : companies[0] || storedUser.defaultCompanyID || '';

      setSelectedCompanyIDState(validCompany);
      if (validCompany) {
        authStorage.setSelectedCompany(validCompany);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (data: LoginResponse) => {
    authStorage.setToken(data.token);
    if (data.refreshToken) {
      authStorage.setRefreshToken(data.refreshToken);
    }
    authStorage.setUser(data.user);
    setUser(data.user);

    // Lưu danh sách mã công ty (lọc các giá trị trùng lặp)
    const companyIds = Array.from(
      new Set((data.authorizedCompanies || []).map((item) => item.companyID))
    );
    authStorage.setAuthorizedCompanies(companyIds);
    setAuthorizedCompanies(companyIds);

    const defaultCompany = (data.user?.defaultCompanyID && (companyIds.length === 0 || companyIds.includes(data.user.defaultCompanyID)))
      ? data.user.defaultCompanyID
      : companyIds[0] || data.user?.defaultCompanyID || '';

    changeSelectedCompanyID(defaultCompany);

    // Lưu thông báo phản hồi (nếu có)
    setLoginMessage(data.message || null);
  };

  const logout = () => {
    authStorage.clear();
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
        setSelectedCompanyID: changeSelectedCompanyID,
        loginMessage,
        isAuthenticated: !!user,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
