import { Context, Next } from "hono";
import { verify } from 'hono/jwt';
import { config } from "../config/app";
import { UnauthorizedException } from "../helper/exception";

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
        throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new UnauthorizedException('Token missing');
    }

    try {
        const payload = await verify(token, config.auth.jwtSecret, 'HS256');
        c.set('user', payload);
    } catch (err) {
        throw new UnauthorizedException('Invalid or expired token');
    }

    await next();
};
