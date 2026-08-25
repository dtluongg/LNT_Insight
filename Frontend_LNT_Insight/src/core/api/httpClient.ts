// src/core/api/httpClient.ts
const API_BASE = '/api';

let isRefreshing = false;

let refreshSubcribers: ((token: string) => void)[] = []; // chưa hiểu cú pháp này lắm
// cú pháp trên nghĩa là:
// refreshSubcribers là một mảng chứa các hàm, 
// mỗi hàm có tham số là string (token mới) và trả về void.

// Đăng ký các request bị tạm giữ vào hàng đợi để chờ token mới:
function subcribeTokenRefresh(cb: (token: string) => void) {
    refreshSubcribers.push(cb);
}

// khi có token mới, giải phóng toàn bộ các request đang xếp hàng:
function onRefreshed(token: string) {
    refreshSubcribers.forEach((cb) => cb(token));
    // sau đó xoá toàn bộ danh sách
    refreshSubcribers = [];
}

// Hàm httpClient bọc fetch
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}):
    Promise<T> {
    const token = localStorage.getItem('auth_token');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Tạo request
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    // Nếu gặp lỗi 401 UNAUTHORIZED (là token hết hạn)
    if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
        const refreshToken = localStorage.getItem('auth_refresh_token');
        if (!refreshToken) {
            // Không có refreshToken, yêu cầu đăng nhập lại
            clearAuthStorage();
            window.location.reload();
            throw new Error('Unauthorized');
        }
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                // gọi api refresh token
                const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        accessToken: token || '',
                        refreshToken: refreshToken,
                    }),
                });
                if (!refreshResponse.ok) {
                    throw new Error('Refresh token expired');
                }
                const tokenModel = await refreshResponse.json();

                // Lưu token mới vào localStorage
                localStorage.setItem('auth_token', tokenModel.accessToken);
                localStorage.setItem('auth_refresh_token', tokenModel.refreshToken)

                isRefreshing = false;
                onRefreshed(tokenModel.accessToken);
            } catch (error) {
                isRefreshing = false;
                clearAuthStorage();
                window.location.reload();
                throw error;
            }
        }
        // Đưa request hiện tại xếp hàng chờ cho đến khi token đc làm mới thành công. 
        const retryOriginalRequest = new Promise<T>((resolve, reject) => {
            subcribeTokenRefresh((newToken) => {
                const newHeaders = new Headers(options.headers || {});
                newHeaders.set('Content-Type', 'application/json');
                newHeaders.set('Authorization', `Bearer ${newToken}`);

                fetch(`${API_BASE}${endpoint}`, {
                    ...options,
                    headers: newHeaders,
                })
                    .then(async (res) => {
                        if (!res.ok) {
                            const errMessage = await getErrorMessage(res);
                            throw new Error(errMessage);
                        }
                        if (res.status === 204) {
                            resolve({} as T);
                        } else {
                            resolve(res.json() as Promise<T>)
                        }
                    })
                    .catch((err) => reject(err));
            });
        });
        return retryOriginalRequest;
    }
    // Xử lý lỗi phản hồi khác từ API (400, 500, ...)
    if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
    }
    if (response.status === 204) {
        return {} as T;
    }
    return response.json() as Promise<T>;
}


// tạo function dọn dẹp bộ nhớ đệm xác thực:
function clearAuthStorage() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('selected_site_id');
    localStorage.removeIten('selected_module_id');
    localStorage.removeItem('is_site_confirmed');
}

// lấy thông báo từ response json hoặc text thô:
async function getErrorMessage(res: Response): Promise<string> {
    const errorText = await res.text();
    let errorMessage = `API Error ${res.status}`;
    try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.errMessage || errorMessage;
    } catch {
        errorMessage = errorText || errorMessage;
    }
    return errorMessage;
}

// Bộ chuyển đổi khoá: Đổi PascalCase (C#/Dapper) thành camelCase (JavaScript)
// export function mapKeysToCamelCase(obj: any): any {
//     if (Array.isArray(obj)) {
//         return obj.map(mapKeysToCamelCase);
//     } else if (obj !== null && typeof obj === 'object') {
//         const newObj: any = {};
//         for (const key of Object.keys(obj)) {
//             let camelCase = key.charAt(0).toLowerCase() + key.slice(1);
//             // Đồng bộ hoá đuôi Id thành ID viết để dễ gõ kiểu:
//             if (camelCase.endsWith('Id') && camelCase !== 'isNewUser') {
//                 camelCase = camelCase.slice(0, -2) + 'ID';
//             }
//             newObj[camelCase] = mapKeysToCamelCase(obj[key]);
//         }
//         return newObj;
//     }
//     return obj;
// }