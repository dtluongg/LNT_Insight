import { apiFetch, mapKeysToCamelCase } from '../../core/api/httpClient';
import type {
    MastUserInfo,
    ModuleMasterInfo,
    SubModuleInfo,
} from '../../types'


export const masterDataApi = {
    getUsers: async (): Promise<MastUserInfo[]> => {
        const raw = await apiFetch<any[]>('/MasterData/users');
        return mapKeysToCamelCase(raw);
    },
    getModules: async (): Promise<ModuleMasterInfo[]> => {
        const raw = await apiFetch<any[]>('/MasterData/modules');
        return mapKeysToCamelCase(raw);
    },
    getSubModules: async (moduleMasterID: string): Promise<SubModuleInfo[]> => {
        const raw = await apiFetch<any[]>(`/MasterData/subModules/${moduleMasterID}`);
        return mapKeysToCamelCase(raw);
    }
}