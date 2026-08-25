import { apiFetch } from './httpClient';
import type { CompanyInfo, SiteInfo, SectionInfo, ProductionVsPlanInfo } from '../../types';

export const companiesApi = {
    getCompanies: async (): Promise<CompanyInfo[]> => {
        const raw = await apiFetch<any[]>('/companies');
        return raw;
    },
    getSites: async (companyId: string): Promise<SiteInfo[]> => {
        const raw = await apiFetch<any[]>(`/companies/${companyId}/sites`);
        return raw;
    },
    getSections: async (companyId: string, siteId: string, departmentId: string = 'DEP05'): Promise<SectionInfo[]> => {
        const raw = await apiFetch<any[]>(`/companies/${companyId}/sites/${siteId}/sections?departmentId=${departmentId}`);
        return raw;
    },
    getProductionVsPlan: async (companyId: string, siteId: string, sectionId: number, dateDay: Date): Promise<ProductionVsPlanInfo[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/companies/${companyId}/sites/${siteId}/sections/${sectionId}/date/${formattedDate}/production-vs-plan`);
        return raw;
    }
};