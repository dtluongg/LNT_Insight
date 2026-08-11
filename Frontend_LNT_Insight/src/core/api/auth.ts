import { apiFetch, mapKeysToCamelCase } from "./httpClient";
import type { LoginResponse } from "../../types";

export const authApi = {
    login: async (username: string, password: string):
        Promise<LoginResponse> => {
        const raw = await apiFetch<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        return mapKeysToCamelCase(raw) as LoginResponse;
    }
}