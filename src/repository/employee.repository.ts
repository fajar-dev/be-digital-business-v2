import { Pool, RowDataPacket } from 'mysql2/promise';
import { Employee } from '../interface/nusawork.interface';
import { IEmployeeRepository } from '../interface/employee.interface';

export class EmployeeRepository implements IEmployeeRepository {
    constructor(private readonly dbPool: Pool) {}

    async insertEmployee(data: Employee): Promise<any> {
        const query = `
            INSERT INTO employees (
                id,
                employee_id,
                name,
                email,
                photo_profile,
                job_position,
                organization_name,
                job_level,
                branch,
                manager_id,
                has_dashboard
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                employee_id = VALUES(employee_id),
                name = VALUES(name),
                email = VALUES(email),
                photo_profile = VALUES(photo_profile),
                job_position = VALUES(job_position),
                organization_name = VALUES(organization_name),
                job_level = VALUES(job_level),
                branch = VALUES(branch),
                manager_id = VALUES(manager_id),
                has_dashboard = VALUES(has_dashboard)
        `;

        const [rows] = await this.dbPool.query(query, [
            data.userId,
            data.employeeId,
            data.name,
            data.email,             
            data.photoProfile,
            data.jobPosition,
            data.organizationName,
            data.jobLevel,
            data.branch,
            data.managerId ?? null,
            data.hasDashboard ?? false
        ]);

        return rows;
    }

    async getManagerById(employeeId: string): Promise<any[]> {
        const query = `
            SELECT *
            FROM employees
            WHERE employee_id = ?
        `;
        const [rows] = await this.dbPool.query<RowDataPacket[]>(query, [employeeId]);
        return rows;
    }

    async getStaff(managerId: string): Promise<any[]> {
        const query = `
            SELECT *
            FROM employees
            WHERE manager_id = ?
        `;
        const [rows] = await this.dbPool.query<RowDataPacket[]>(query, [managerId]);
        return rows;
    }

    async getEmployeeByEmployeeId(employeeId: string): Promise<any | null> {
        const query = `
            SELECT 
                e1.*, 
                e2.name AS managerName, 
                e2.employee_id AS managerEmployeeId, 
                e2.photo_profile AS managerPhotoProfile 
            FROM employees e1 
            LEFT JOIN employees e2 ON e1.manager_id = e2.id 
            WHERE e1.employee_id = ? 
            LIMIT 1
        `;
        const [rows] = await this.dbPool.query<RowDataPacket[]>(query, [employeeId]);
        return rows.length > 0 ? rows[0] : null;
    }

    async getEmployeeById(id: string): Promise<any | null> {
        const query = `SELECT * FROM employees WHERE id = ? LIMIT 1`;
        const [rows] = await this.dbPool.query<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async getEmployeeByEmail(email: string): Promise<any | null> {
        const query = `SELECT * FROM employees WHERE email = ? LIMIT 1`;
        const [rows] = await this.dbPool.query<RowDataPacket[]>(query, [email]);
        return rows.length > 0 ? rows[0] : null;
    }

    async getAllDashboardEmployees(): Promise<any[]> {
        const query = `SELECT * FROM employees WHERE has_dashboard = true`;
        const [rows]: any[] = await this.dbPool.query(query);
        return Array.isArray(rows) ? rows : [];
    }

    async getHierarchy(employeeId: string): Promise<any[]> {
        const query = `
            WITH RECURSIVE employee_hierarchy AS (
                SELECT *, 0 AS depth
                FROM employees
                WHERE employee_id = ?
                
                UNION ALL
                
                SELECT e.*, eh.depth + 1
                FROM employees e
                INNER JOIN employee_hierarchy eh ON e.manager_id = eh.id
            )
            SELECT * 
            FROM employee_hierarchy 
            WHERE has_dashboard = true 
            ORDER BY depth ASC;
        `;
        const [rows]: any[] = await this.dbPool.query(query, [employeeId]);
        return Array.isArray(rows) ? rows : [];
    }
}
