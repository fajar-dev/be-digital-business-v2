import { Hono } from 'hono';
import { AuthController } from '../controller/auth.controller';

const api = new Hono();

// Initialize Controllers
const authController = new AuthController();

// Auth Routes
api.post('/auth/login', (c) => authController.login(c));
api.post('/auth/dev-login', (c) => authController.devLogin(c));
api.post('/auth/google', (c) => authController.google(c));
api.post('/auth/refresh', (c) => authController.refresh(c));
api.get('/auth/me', (c) => authController.me(c));
api.post('/auth/logout', (c) => authController.logout(c));

export { api };
