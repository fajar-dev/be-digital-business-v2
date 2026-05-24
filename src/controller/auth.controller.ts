import { OAuth2Client } from "google-auth-library";
import { Context } from "hono";
import { sign, verify } from 'hono/jwt';
import { EmployeeService } from "../service/employee.service";
import { config } from "../config/app";
import { ApiResponse } from "../helper/response";
import { UnauthorizedException, NotFoundException, BadRequestException } from "../helper/exception";
import axios from "axios";

export class AuthController {
    private employeeService: EmployeeService;

    constructor() {
        this.employeeService = new EmployeeService();
    }

    private getOauth2Client() {
        return new OAuth2Client(
            config.auth.googleClientId,
            config.auth.googleClientSecret,
            'postmessage'
        );
    }

    async verify(code: string): Promise<any> {
        const oAuth2Client = this.getOauth2Client();
        const result = await oAuth2Client.getToken(code);
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: result.tokens.id_token!,
            audience: config.auth.googleClientId,
        });
        return ticket.getPayload();
    }

    async generateToken(employee: any) {
        const now = Math.floor(Date.now() / 1000);
        const accessTokenPayload = {
            sub: employee.employee_id,
            svp: employee.manager_id,
            email: employee.email,
            role: employee.job_position,
            exp: now + 60 * 15, // 15 minutes
        };
        const refreshTokenPayload = {
            sub: employee.employee_id,
            email: employee.email,
            exp: now + 60 * 60 * 24 * 7, // 7 days
        };

        const accessToken = await sign(accessTokenPayload, config.auth.jwtSecret);
        const refreshToken = await sign(refreshTokenPayload, config.auth.jwtSecret);
        
        return { accessToken, refreshToken };
    }

    async login(c: Context) {
        const body = await c.req.json();
        
        let isVerify;
        try {
            isVerify = await axios.post(config.auth.apiUrl, {
                username: body.employeeId,
                password: body.password
            });
        } catch (error: any) {
            throw new UnauthorizedException('Employee ID or password is not valid');
        }

        if(isVerify.status !== 201) {
            throw new UnauthorizedException('Employee ID or password is not valid');
        }
        
        const employee = await this.employeeService.getEmployeeByEmployeeId(body.employeeId) as any;
        
        if(!employee) {
            throw new NotFoundException('Employee not found');
        }

        const tokens = await this.generateToken(employee);
        
        return ApiResponse.success(c, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: employee
        }, "Login successful");
    }

    async devLogin(c: Context) {
        const body = await c.req.json();
        const employee = await this.employeeService.getEmployeeByEmployeeId(body.employeeId) as any;
        
        if(!employee) {
            throw new NotFoundException('Employee not found');
        }

        const tokens = await this.generateToken(employee);
        
        return ApiResponse.success(c, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: employee
        }, "Login successful");
    }

    async google(c: Context) {
        const body = await c.req.json();
        const payload = await this.verify(body.code);
        const employee = await this.employeeService.getEmployeeByEmail(payload.email) as any;
        
        if(!employee) {
            throw new NotFoundException('Employee not found');
        }

        const tokens = await this.generateToken(employee);
        
        return ApiResponse.success(c, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: employee
        }, "Login successful");
    }

    async refresh(c: Context) {
        const body = await c.req.json();
        const refreshToken = body.refreshToken;

        if (!refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }

        let payload;
        try {
            payload = await verify(refreshToken, config.auth.jwtSecret, 'HS256');
        } catch (err) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        
        const email = payload.email as string;
        
        const employee = await this.employeeService.getEmployeeByEmail(email) as any;
        if (!employee) {
            throw new UnauthorizedException('User not found');
        }

        const tokens = await this.generateToken(employee);

        return ApiResponse.success(c, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: employee
        }, "Token refreshed");
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

        let payload;
        try {
            payload = await verify(token, config.auth.jwtSecret, 'HS256');
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
        
        const email = payload.email as string;
        const employee = await this.employeeService.getEmployeeByEmail(email) as any;

        if (!employee) {
            throw new NotFoundException('User not found');
        }

        return ApiResponse.success(c, employee, "User retrieved");
    }

    async logout(c: Context) {
        // Stateless JWT logout (client should delete token)
        return ApiResponse.success(c, null, "Logged out successfully");
    }
}
