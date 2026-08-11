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
    moduleMasterID: string;
    moduleMasterName: string;
    icon?: string;
}
export interface SubModuleInfo {
    moduleMasterSubID: string;
    moduleMasterName: string;
    moduleMasterID?: string;
}