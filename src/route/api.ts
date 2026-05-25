import { Hono } from 'hono';
import { AuthController } from '../controller/auth.controller';
import { EmployeeController } from '../controller/employee.controller';
import { InvoiceController } from '../controller/invoice.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { SnapshotRepository } from '../repository/snapshot.repository';
import { SnapshotService } from '../service/snapshot.service';
import { EmployeeRepository } from '../repository/employee.repository';
import { EmployeeService } from '../service/employee.service';
import { AuthService } from '../service/auth.service';
import { dashboardPool } from '../config/database';

const api = new Hono();

// Initialize Repositories
const snapshotRepository = new SnapshotRepository(dashboardPool);
const employeeRepository = new EmployeeRepository(dashboardPool);

// Initialize Services
const snapshotService = new SnapshotService(snapshotRepository);
const employeeService = new EmployeeService(employeeRepository);
const authService = new AuthService(employeeService);

// Initialize Controllers
const authController = new AuthController(authService);
const employeeController = new EmployeeController(employeeService);
const invoiceController = new InvoiceController(snapshotService);

// Public Auth Routes
api.post('/auth/login', (c) => authController.login(c));
api.post('/auth/dev', (c) => authController.devLogin(c));
api.post('/auth/google', (c) => authController.google(c));
api.post('/auth/refresh', (c) => authController.refresh(c));

// Protected Auth Routes
api.get('/auth/me', authMiddleware, (c) => authController.me(c));
api.post('/auth/logout', authMiddleware, (c) => authController.logout(c));

// Protected Employee Routes
api.get('/employee/:id', authMiddleware, (c) => employeeController.getEmployeeByEmployeeId(c));
api.get('/employee/:id/hierarchy', authMiddleware, (c) => employeeController.getEmployeeHierarchy(c));

// Protected Invoice Routes
api.get('/invoice/:id/internal', (c) => invoiceController.internalInvoice(c));

export { api };
