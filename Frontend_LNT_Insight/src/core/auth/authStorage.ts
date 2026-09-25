import type { AuthorizedCompanyDto, User } from '../../types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';
const AUTHORIZED_COMPANIES_KEY = 'authorized_companies'; // Khai báo hằng số đồng bộ
const SELECTED_COMPANY_KEY = 'selected_company_id';

export const authStorage = {
  getToken: (): string | null => sessionStorage.getItem(TOKEN_KEY),

  setToken: (token: string): void => sessionStorage.setItem(TOKEN_KEY, token),

  getRefreshToken: (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY),

  setRefreshToken: (token: string): void => sessionStorage.setItem(REFRESH_TOKEN_KEY, token),

  getUser: (): User | null => {
    const userStr = sessionStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
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
      return JSON.parse(data) as AuthorizedCompanyDto[];
    } catch {
      return [];
    }
  },

  setAuthorizedCompanies: (companies: AuthorizedCompanyDto[]): void => {
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