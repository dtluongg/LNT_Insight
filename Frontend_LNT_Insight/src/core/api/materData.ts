import { apiFetch } from '../../core/api/httpClient';
import type {
    MastUserInfo,
    UserWorkingInfo,
    ModuleMasterInfo,
    SubModuleInfo,
    UserModuleAccessResponse,
    UpdateUserModuleAccessPayload,
} from '../../types';


export const masterDataApi = {
    getUserWorking: async (): Promise<UserWorkingInfo[]> => {
        const raw = await apiFetch<any[]>('/MasterData/user_working');
        return raw;
    },
    getUsers: async (): Promise<MastUserInfo[]> => {
        const raw = await apiFetch<any[]>('/MasterData/users');
        return raw;
    },
    getModules: async (): Promise<ModuleMasterInfo[]> => {
        const raw = await apiFetch<any[]>('/MasterData/modules');
        return raw;
    },
    getSubModules: async (moduleMasterID: string): Promise<SubModuleInfo[]> => {
        const raw = await apiFetch<any[]>(`/MasterData/subModules/${moduleMasterID}`);
        return raw;
    },
    getUserModuleAccess: async (userID: string): Promise<UserModuleAccessResponse> => {
        const raw = await apiFetch<UserModuleAccessResponse>(`/MasterData/manage_user/${encodeURIComponent(userID)}`);
        return raw;
    },
    updateUserModuleAccess: async (payload: UpdateUserModuleAccessPayload): Promise<{ success?: boolean }> => {
        const raw = await apiFetch<{ success?: boolean }>('/MasterData/manage_user', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return raw;
    },
};

