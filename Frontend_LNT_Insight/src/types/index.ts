// Định nghĩa thông tin của user đang đăng nhập. 
export interface User {
    username: string;
    fullName: string | null;
    email: string | null;
    isAdmin: boolean;
    defaultCompanyID: string | null;
}
// Cấu trúc phản hồi từ API Đăng nhập thành công
export interface LoginResponse {
    token: string;
    refreshToken?: string;
    user: User;
}
export interface MastUserInfo {
    username: string;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    authorized: boolean | null;
    admin: boolean | null;
    createdTime: string | null;
    isNewUser: boolean | null;
}
export interface ModuleMasterInfo {
    ModuleMasterID: string;
    ModuleMasterName: string;
    icon?: string;
}
export interface SubModuleInfo {
    ModuleMasterSubID: string;
    ModuleMasterName: string;
    ModuleMasterID: string;
}

export interface CompanyInfo {
    CompanyID: string;
    CompanyCode: string;
    CompanyName: string;
}

export interface SiteInfo {
    SiteID: string;
    SiteCode: string;
    SiteName: string;
}

export interface SectionInfo {
    SectionID: string;
    SectionNo: string;
    SectionName: string;
}

export interface ProductionVsPlanInfo {
    TeamID: number;
    TeamNo: string;
    TeamName: string;
    DayOutput: number;
    DayTarget: number | null;
}

export interface SewingTeamSummay {
    DayOutput: number;
    DayTarget: number;
    InspectedQty: number;
    DefectQty: number; 
    DefectRate: number;
}

export interface SewingTeamDetail {
    TeamNo: string;
    TeamName: string;
    DayOutput: number;
    DayTarget: number;
    InspectedQty: number;
    DefectQty: number; 
    DefectRate: number;
}