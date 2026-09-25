import { Context, Next } from "hono";
import { verify } from 'hono/jwt';
import { config } from "../config/app";
import { UnauthorizedException, ForbiddenException } from "../helper/exception";

export const adminMiddleware = async (c: Context, next: Next) => {
    let user = c.get('user');

    if (!user) {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token missing');
        }

        try {
            user = await verify(token, config.auth.jwtSecret, 'HS256');
            c.set('user', user);
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    const isAdmin = user.is_admin === true || user.is_admin === 1 || user.is_admin === '1' || user.is_admin === 'true';

    if (!isAdmin) {
        throw new ForbiddenException('Forbidden: Admin access required');
    }

    await next();
};
