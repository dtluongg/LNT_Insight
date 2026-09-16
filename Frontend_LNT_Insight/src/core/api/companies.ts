import { apiFetch } from './httpClient';
import type { CompanyInfo, SiteInfo, SectionInfo, ProductionVsPlanInfo, SewingTeamSummay, SewingTeamDetail, OverallDefectAnalysis, WorkshiftInfo, SewingTeamAnalysis } from '../../types';
import { getPreviousWorkingDay } from '../../features/dashboard/utils/dateUtils';

export const companiesApi = {
    getPreviousWorkingDay: async (_companyID: string, _siteID: string, dateDayStr: string): Promise<string> => {
        // Architecture abstraction: Currently uses client-side calculation.
        // In the future, this can be switched to fetch from backend API endpoint:
        // const workingDays = await apiFetch<string[]>(`/companies/${_companyID}/sites/${_siteID}/working-days`);
        // return findPreviousWorkingDay(workingDays, dateDayStr);
        return getPreviousWorkingDay(dateDayStr);
    },
    getCompanies: async (): Promise<CompanyInfo[]> => {
        const raw = await apiFetch<any[]>('/companies');
        return raw;
    },
    getSites: async (companyID: string): Promise<SiteInfo[]> => {
        const raw = await apiFetch<any[]>(`/companies/${companyID}/sites`);
        return raw;
    },
    getSections: async (companyID: string, siteID: string, departmentID: string = 'DEP05'): Promise<SectionInfo[]> => {
        const raw = await apiFetch<any[]>(`/companies/${companyID}/sites/${siteID}/sections?departmentID=${departmentID}`);
        return raw;
    },
    getProductionVsPlan: async (companyID: string, siteID: string, sectionID: number, dateDay: Date): Promise<ProductionVsPlanInfo[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/companies/${companyID}/sites/${siteID}/sections/${sectionID}/date/${formattedDate}/production-vs-plan`);
        return raw;
    },
    getTeamSewingSummary: async (companyID: string, siteID: string, sectionID: number, dateDay: Date): Promise<SewingTeamSummay[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/companies/${companyID}/sites/${siteID}/sections/${sectionID}/date/${formattedDate}/sewing_summary`);
        return raw;
    },
    getTeamSewingDetail: async (companyID: string, siteID: string, sectionID: number, dateDay: Date): Promise<SewingTeamDetail[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/companies/${companyID}/sites/${siteID}/sections/${sectionID}/date/${formattedDate}/sewing_detail`);
        return raw;
    },
    getOverallDefectAnalysis: async (companyID: string, siteID: string, sectionID: number, dateDay: Date, teamID?: number): Promise<OverallDefectAnalysis[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const url = `/companies/${companyID}/sites/${siteID}/sections/${sectionID}/date/${formattedDate}/defect/defectID/OverallDefectAnalysis${teamID !== undefined ? `?teamID=${teamID}` : ''}`;
        const raw = await apiFetch<any[]>(url);
        return raw;
    },
    // getOverallDefectAnalysis: async (companyID: string, siteID: string, sectionID: number, dateDay: Date, teamID?: number): Promise<OverallDefectAnalysis[]> => {
    //     const formattedDate = dateDay.toISOString().split('T')[0];
    //     const url = `/companies/${companyID}/sites/${siteID}/sections/${sectionID}/date/${formattedDate}/OverallDefectAnalysis${teamID !== undefined ? `?teamID=${teamID}` : ''}`;
    //     const raw = await apiFetch<any[]>(url);
    //     return raw;
    // },
    getWorkshiftList: async (companyID: string, siteID: string, dateDay: Date, sectionID: number): Promise<WorkshiftInfo[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/companies/${companyID}/sites/${siteID}/date/${formattedDate}/section/${sectionID}/workshift`);
        return raw;
    },
    getDataSewingTeamAnalysis: async (companyID: string, siteID: string, dateDay: Date, teamID: number, shiftworkID: number): Promise<SewingTeamAnalysis[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/companies/${companyID}/sites/${siteID}/date/${formattedDate}/team/${teamID}/shiftwork/${shiftworkID}/sewing_analysis`);
        return raw;
    },
    getTeamDefectAnalysis: async (companyID: string, siteID: string, sectionID: number, dateDay: Date, teamID: number): Promise<OverallDefectAnalysis[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/companies/${companyID}/sites/${siteID}/sections/${sectionID}/date/${formattedDate}/team/${teamID}/team_defect_analysis`);
        return raw;
    }
};