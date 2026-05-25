import { Employee } from './nusawork.interface';

export interface IEmployeeRepository {
    insertEmployee(data: Employee): Promise<any>;
    getManagerById(employeeId: string): Promise<any[]>;
    getStaff(managerId: string): Promise<any[]>;
    getEmployeeByEmployeeId(employeeId: string): Promise<any | null>;
    getEmployeeById(id: string): Promise<any | null>;
    getEmployeeByEmail(email: string): Promise<any | null>;
    getAllDashboardEmployees(): Promise<any[]>;
    getHierarchy(employeeId: string): Promise<any[]>;
}

export interface IEmployeeService {
    insertEmployee(data: Employee): Promise<any>;
    getManagerById(employeeId: string): Promise<any[]>;
    getStaff(managerId: string): Promise<any[]>;
    getEmployeeByEmployeeId(employeeId: string): Promise<any | null>;
    getEmployeeById(id: string): Promise<any | null>;
    getEmployeeByEmail(email: string): Promise<any | null>;
    getHierarchy(employeeId: string): Promise<any[]>;
}
