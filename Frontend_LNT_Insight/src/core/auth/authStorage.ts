import type { AuthorizedCompanyDto, User } from '../../types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';
const AUTHORIZED_COMPANIES_KEY = 'authorized_companies'; // Khai báo hằng số đồng bộ
const SELECTED_COMPANY_KEY = 'selected_company_id';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

  setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getAuthorizedCompanies: (): AuthorizedCompanyDto[] => {
    const data = localStorage.getItem(AUTHORIZED_COMPANIES_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as AuthorizedCompanyDto[];
    } catch {
      return [];
    }
  },

  setAuthorizedCompanies: (companies: AuthorizedCompanyDto[]): void => {
    localStorage.setItem(AUTHORIZED_COMPANIES_KEY, JSON.stringify(companies));
  },

  getSelectedCompany: (): string | null => localStorage.getItem(SELECTED_COMPANY_KEY),

  setSelectedCompany: (companyID: string): void => localStorage.setItem(SELECTED_COMPANY_KEY, companyID),

  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTHORIZED_COMPANIES_KEY); // Dọn dẹp sạch sẽ khi Logout
    localStorage.removeItem(SELECTED_COMPANY_KEY);
  }
};