import { Hono } from 'hono';
import { AuthController } from '../controller/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const api = new Hono();

// Initialize Controllers
const authController = new AuthController();

// Public Auth Routes
api.post('/auth/login', (c) => authController.login(c));
api.post('/auth/dev-login', (c) => authController.devLogin(c));
api.post('/auth/google', (c) => authController.google(c));
api.post('/auth/refresh', (c) => authController.refresh(c));

// Protected Auth Routes
api.get('/auth/me', authMiddleware, (c) => authController.me(c));
api.post('/auth/logout', authMiddleware, (c) => authController.logout(c));

export { api };
