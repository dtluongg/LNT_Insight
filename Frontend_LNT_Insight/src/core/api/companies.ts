import { apiFetch, mapKeysToCamelCase } from './httpClient';
import type { CompanyInfo, SiteInfo, SectionInfo, ProductionVsPlanInfo } from '../../types';

export const companiesApi = {
    getCompanies: async (): Promise<CompanyInfo[]> => {
        const raw = await apiFetch<any[]>('/companies');
        return mapKeysToCamelCase(raw);
    },
    getSites: async (companyId: string): Promise<SiteInfo[]> => {
        const raw = await apiFetch<any[]>(`/companies/${companyId}/sites`);
        return mapKeysToCamelCase(raw);
    },
    getSections: async (companyId: string, siteId: string, departmentId: string = 'DEP05'): Promise<SectionInfo[]> => {
        const raw = await apiFetch<any[]>(`/companies/${companyId}/sites/${siteId}/sections?departmentId=${departmentId}`);
        return mapKeysToCamelCase(raw);
    },
    getProductionVsPlan: async (companyId: string, siteId: string): Promise<ProductionVsPlanInfo[]> => {
        const raw = await apiFetch<any[]>(`/companies/${companyId}/sites/${siteId}/production-vs-plan`);
        return mapKeysToCamelCase(raw);
    }
};
