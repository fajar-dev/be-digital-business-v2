import { Context } from "hono";
import { IAuthService } from "../interface/auth.interface";
import { ApiResponse } from "../helper/response";
import { UnauthorizedException, BadRequestException } from "../helper/exception";

export class AuthController {
    constructor(private readonly authService: IAuthService) {}

    async login(c: Context) {
        const body = await c.req.json();
        
        if (!body.employeeId || !body.password) {
            throw new BadRequestException('Employee ID and password are required');
        }

        const data = await this.authService.login(body.employeeId, body.password);
        
        return ApiResponse.success(c, data, "Login successful");
    }

    async devLogin(c: Context) {
        const body = await c.req.json();
        
        if (!body.employeeId) {
            throw new BadRequestException('Employee ID is required');
        }

        const data = await this.authService.devLogin(body.employeeId);
        
        return ApiResponse.success(c, data, "Login successful");
    }

    async google(c: Context) {
        const body = await c.req.json();
        
        if (!body.code) {
            throw new BadRequestException('Authorization code is required');
        }

        const data = await this.authService.googleLogin(body.code);
        
        return ApiResponse.success(c, data, "Login successful");
    }

    async refresh(c: Context) {
        const body = await c.req.json();
        const refreshToken = body.refreshToken;

        if (!refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }

        const data = await this.authService.refreshToken(refreshToken);

        return ApiResponse.success(c, data, "Token refreshed");
    }

    async me(c: Context) {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token missing');
        }

        const employee = await this.authService.getMe(token);

        return ApiResponse.success(c, employee, "User retrieved");
    }

    async logout(c: Context) {
        // Stateless JWT logout (client should delete token)
        return ApiResponse.success(c, null, "Logged out successfully");
    }
}
