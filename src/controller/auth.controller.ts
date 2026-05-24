import { OAuth2Client } from "google-auth-library";
import { Context } from "hono";
import { sign, verify } from 'hono/jwt';
import { EmployeeService } from "../service/employee.service";
import { config } from "../config/app";
import { ApiResponse } from "../helper/response";
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
        try {
            const body = await c.req.json();
            const isVerify = await axios.post(config.auth.apiUrl, {
                username: body.employeeId,
                password: body.password
            });

            if(isVerify.status !== 201) {
                return ApiResponse.error(c, 'Employee ID or password is not valid', 401);
            }
            const employee = await this.employeeService.getEmployeeByEmployeeId(body.employeeId) as any;
            
            if(!employee) {
                return ApiResponse.error(c, 'Employee not found', 404);
            }

            const tokens = await this.generateToken(employee);
            
            return ApiResponse.success(c, {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: employee
            }, "Login successful");

        } catch (error: any) {
            const status = error.response?.status || 500;
            return ApiResponse.error(c, 'Login failed', status, { error: error.message });
        }
    }

    async devLogin(c: Context) {
        try {
            const body = await c.req.json();
            const employee = await this.employeeService.getEmployeeByEmployeeId(body.employeeId) as any;
            
            if(!employee) {
                return ApiResponse.error(c, 'Employee not found', 404);
            }

            const tokens = await this.generateToken(employee);
            
            return ApiResponse.success(c, {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: employee
            }, "Login successful");

        } catch (error: any) {
            const status = error.response?.status || 500;
            return ApiResponse.error(c, 'Login failed', status, { error: error.message });
        }
    }

    async google(c: Context) {
        try {
            const body = await c.req.json();
            const payload = await this.verify(body.code);
            const employee = await this.employeeService.getEmployeeByEmail(payload.email) as any;
            
            if(!employee) {
                return ApiResponse.error(c, 'Employee not found', 404);
            }

            const tokens = await this.generateToken(employee);
            
            return ApiResponse.success(c, {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: employee
            }, "Login successful");

        } catch (error: any) {
            return ApiResponse.error(c, 'Login failed', 500, { error: error.message });
        }
    }

    async refresh(c: Context) {
        try {
            const body = await c.req.json();
            const refreshToken = body.refreshToken;

            if (!refreshToken) {
                return ApiResponse.error(c, 'Refresh token is required', 400);
            }

            try {
                const payload = await verify(refreshToken, config.auth.jwtSecret, 'HS256');
                const email = payload.email as string;
                
                const employee = await this.employeeService.getEmployeeByEmail(email) as any;
                if (!employee) {
                    return ApiResponse.error(c, 'User not found', 401);
                }

                const tokens = await this.generateToken(employee);

                return ApiResponse.success(c, {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    user: employee
                }, "Token refreshed");

            } catch (err) {
                return ApiResponse.error(c, 'Invalid refresh token', 401);
            }
        } catch (error: any) {
            return ApiResponse.error(c, 'Refresh failed', 500, { error: error.message });
        }
    }

    async me(c: Context) {
        try {
            const authHeader = c.req.header('Authorization');
            if (!authHeader) {
                return ApiResponse.error(c, 'Authorization header missing', 401);
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return ApiResponse.error(c, 'Token missing', 401);
            }

            try {
                const payload = await verify(token, config.auth.jwtSecret, 'HS256');
                const email = payload.email as string;
                const employee = await this.employeeService.getEmployeeByEmail(email) as any;

                if (!employee) {
                    return ApiResponse.error(c, 'User not found', 404);
                }

                return ApiResponse.success(c, employee, "User retrieved");
            } catch (err) {
                 return ApiResponse.error(c, 'Invalid token', 401);
            }

        } catch (error: any) {
            return ApiResponse.error(c, 'Failed to get user', 500, { error: error.message });
        }
    }

    async logout(c: Context) {
        // Stateless JWT logout (client should delete token)
        return ApiResponse.success(c, null, "Logged out successfully");
    }
}
