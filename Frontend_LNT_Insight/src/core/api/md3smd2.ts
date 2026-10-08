import { apiFetch } from './httpClient';
import type { CompanyInfo, SiteInfo, SectionInfo, SewingTeamSummay, SewingTeamDetail, OverallDefectAnalysis, WorkshiftInfo, SewingTeamAnalysis } from '../../types';
import { getPreviousWorkingDay } from '../../features/dashboard/utils/dateUtils';

export const md3smd2Api = {
    getPreviousWorkingDay: async (_companyID: string, _siteID: string, dateDayStr: string): Promise<string> => {
        // Architecture abstraction: Currently uses client-side calculation.
        // In the future, this can be switched to fetch from backend API endpoint:
        // const workingDays = await apiFetch<string[]>(`/companies/${_companyID}/sites/${_siteID}/working-days`);
        // return findPreviousWorkingDay(workingDays, dateDayStr);
        return getPreviousWorkingDay(dateDayStr);
    },
    // getCompanies: async (): Promise<CompanyInfo[]> => {
    //     const raw = await apiFetch<any[]>('/md3smd2/com');
    //     return raw;
    // },
    getSites: async (companyID: string): Promise<SiteInfo[]> => {
        const raw = await apiFetch<any[]>(`/md3smd2/com/${companyID}/si`);
        return raw;
    },
    getSections: async (companyID: string, siteID: string): Promise<SectionInfo[]> => {
        const raw = await apiFetch<any[]>(`/md3smd2/com/${companyID}/si/${siteID}/se`);
        return raw;
    },
    getTeamSewingSummary: async (companyID: string, siteID: string, sectionID: number, dateDay: Date): Promise<SewingTeamSummay[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/md3smd2/com/${companyID}/si/${siteID}/se/${sectionID}/date/${formattedDate}/sewing_summary`);
        return raw;
    },
    getTeamSewingDetail: async (companyID: string, siteID: string, sectionID: number, dateDay: Date): Promise<SewingTeamDetail[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/md3smd2/com/${companyID}/si/${siteID}/se/${sectionID}/date/${formattedDate}/team_sewing_detail`);
        return raw;
    },
    getOverallDefectAnalysis: async (companyID: string, siteID: string, sectionID: number, dateDay: Date): Promise<OverallDefectAnalysis[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const url = `/md3smd2/com/${companyID}/si/${siteID}/se/${sectionID}/date/${formattedDate}/overall_sewing_defect_nalysis`;
        const raw = await apiFetch<any[]>(url);
        return raw;
    },
    getWorkshiftList: async (companyID: string, siteID: string, dateDay: Date, sectionID: number): Promise<WorkshiftInfo[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/md3smd2/com/${companyID}/si/${siteID}/date/${formattedDate}/se/${sectionID}/workshift`);
        return raw;
    },
    getDataSewingTeamAnalysis: async (companyID: string, siteID: string, dateDay: Date, teamID: number, shiftworkID: number): Promise<SewingTeamAnalysis[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/md3smd2/com/${companyID}/si/${siteID}/date/${formattedDate}/team/${teamID}/shiftwork/${shiftworkID}/sewing_analysis`);
        return raw;
    },
    getTeamDefectAnalysis: async (companyID: string, siteID: string, sectionID: number, dateDay: Date, teamID: number): Promise<OverallDefectAnalysis[]> => {
        const formattedDate = dateDay.toISOString().split('T')[0];
        const raw = await apiFetch<any[]>(`/md3smd2/com/${companyID}/si/${siteID}/se/${sectionID}/date/${formattedDate}/team/${teamID}/team_sewing_defect_analysis`);
        return raw;
    }
};