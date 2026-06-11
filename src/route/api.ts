import { Hono } from 'hono';
import { AuthController } from '../controller/auth.controller';
import { EmployeeController } from '../controller/employee.controller';
import { InvoiceController } from '../controller/invoice.controller';
import { CommissionController } from '../controller/commission.controller';
import { AdditionalController } from '../controller/additional.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { SnapshotRepository } from '../repository/snapshot.repository';
import { SnapshotService } from '../service/snapshot.service';
import { EmployeeRepository } from '../repository/employee.repository';
import { EmployeeService } from '../service/employee.service';
import { AuthService } from '../service/auth.service';
import { NisRepository } from '../repository/nis.repository';
import { NisService } from '../service/nis.service';
import { dashboardPool, nisPool } from '../config/database';

const api = new Hono();

// Initialize Repositories
const snapshotRepository = new SnapshotRepository(dashboardPool);
const employeeRepository = new EmployeeRepository(dashboardPool);
const nisRepository = new NisRepository(nisPool);

// Initialize Services
const nisService = new NisService(nisRepository);
const snapshotService = new SnapshotService(snapshotRepository, nisService);
const employeeService = new EmployeeService(employeeRepository);
const authService = new AuthService(employeeService);

// Initialize Controllers
const authController = new AuthController(authService);
const employeeController = new EmployeeController(employeeService);
const invoiceController = new InvoiceController(snapshotService);
const commissionController = new CommissionController(snapshotService, employeeService);
const additionalController = new AdditionalController();

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
api.get('/invoice/:id/implementator', (c) => invoiceController.implementatorInvoice(c));
api.get('/invoice/:id/resell', (c) => invoiceController.resellInvoice(c));

// Protected Commission Routes
api.get('/commission/:id/implementator', (c) => commissionController.implementatorCommission(c));
api.get('/commission/:id/implementator/yearly', (c) => commissionController.implementatorCommissionYearly(c));
api.get('/commission/:id/sales', (c) => commissionController.salesCommission(c));
api.get('/commission/:id/sales/yearly', (c) => commissionController.salesCommissionYearly(c));
api.get('/commission/:id/manager', (c) => commissionController.managerCommission(c));

// Protected Team Routes
api.get('/team/:id/manager', (c) => commissionController.managerTeam(c));

// Additional Routes
api.get('/additional/period', (c) => additionalController.getPeriod(c));
export { api };

