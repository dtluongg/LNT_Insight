import { authApi } from '../../../core/api/auth';
import type { LoginResponse } from '../../../types';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return await authApi.login(username, password);
  }
};
