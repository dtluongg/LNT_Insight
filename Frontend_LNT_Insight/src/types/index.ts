// Định nghĩa thông tin của user đang đăng nhập. 
export interface User {
    username: string;
    fullName: string | null;
    email: string | null;
    isAdmin: boolean;
    defaultCompanyID: string | null;
}

export interface ModuleDto {
    moduleMasterID: string;
    moduleMasterSubID: number;
}
export interface AuthorizedCompanyDto {
    companyID: string;
    companyCode?: string;
    companyName?: string;
    authorizedListModules: ModuleDto[];
}
// Cấu trúc phản hồi từ API Đăng nhập thành công
export interface LoginResponse {
    isSuccess: boolean;
    message?: string;
    token: string;
    refreshToken?: string;
    user: User;
    authorizedCompanies: AuthorizedCompanyDto[];
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
export interface UserWorkingInfo {
    UserID: string;
    ActiveFlag?: boolean;
    AdminUser?: boolean;
    RefreshToken?: string | null;
    RefreshTokenExpiryTime?: string | null;
}
export interface ModuleMasterInfo {
    ModuleMasterID: string;
    ModuleMasterName: string;
    icon?: string;
}
export interface SubModuleInfo {
    ModuleMasterSubID: string | number;
    ModuleMasterName: string;
    ModuleMasterID: string;
}

export interface UserCompanyAccessItem {
    companyID: string;
}

export interface UserModuleAccessItem {
    moduleMasterID: string;
    moduleMasterSubID: number;
}

export interface UserModuleAccessResponse {
    userID: string;
    companyIDs: UserCompanyAccessItem[];
    modules: UserModuleAccessItem[];
}

export interface UpdateUserModuleAccessPayload {
    UserID: string;
    CompanyIDs: { CompanyID: string }[];
    Modules: { ModuleMasterID: string; ModuleMasterSubID: number }[];
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

// export interface ProductionVsPlanInfo {
//     TeamID: number;
//     TeamNo: string;
//     TeamName: string;
//     DayOutput: number;
//     DayTarget: number | null;
// }

export interface SewingTeamSummay {
    OutputQty: number;  // DayOutPut
    MOPlanQty: number;  // DayTarget
    InspectedQty: number;
    DefectQty: number;
    DefectRate: number;
}

export interface SewingTeamDetail {
    SectionID: number;
    TeamID: number;
    TeamNo: string;
    TeamName: string;
    OutputQty: number;  // DayOutPut
    MOPlanQty: number;  // DayTarget
    InspectedQty: number;
    DefectQty: number;
    DefectRate: number;
}

export interface OverallDefectAnalysis {
    DefectID: number;
    DefectName: string;
    DefectQty: number;
}

export interface WorkshiftInfo {
    ShiftWorkID: number;
    ShiftWorkName: string;
    ShiftWorkStartTime: string;
    ShiftWorkCompleteTime: string;
    ShiftWorkNameWithTime: string;
}

export interface SewingTeamAnalysis {
    ShiftHourID: string;
    ShiftHourWithTime: string;
    OutputQty: number | null;
    HourlyPlan: number;
    Achievement: number | null;
    RunningOutput: number;
    CumulativeVariance: number | null;
    CumulativePlan: number;
    OutputVariance: number | null;
}