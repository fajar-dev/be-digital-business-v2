export interface IAuthService {
    verifyGoogleCode(code: string): Promise<any>;
    generateToken(employee: any): Promise<{ accessToken: string; refreshToken: string }>;
    login(employeeId: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: any }>;
    devLogin(employeeId: string): Promise<{ accessToken: string; refreshToken: string; user: any }>;
    googleLogin(code: string): Promise<{ accessToken: string; refreshToken: string; user: any }>;
    refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: any }>;
    getMe(token: string): Promise<any>;
}
