import { Context, Next } from "hono";
import { verify } from 'hono/jwt';
import { config } from "../config/app";
import { ApiResponse } from "../helper/response";

export const authMiddleware = async (c: Context, next: Next) => {
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
            c.set('user', payload);
            await next();
        } catch (err) {
             return ApiResponse.error(c, 'Invalid or expired token', 401);
        }

    } catch (error: any) {
        return ApiResponse.error(c, 'Authentication failed', 500, { error: error.message });
    }
};
