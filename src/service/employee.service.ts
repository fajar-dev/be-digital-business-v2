import { Employee } from "../interface/nusawork.interface";
import { IEmployeeRepository, IEmployeeService } from "../interface/employee.interface";

export class EmployeeService implements IEmployeeService {
    constructor(private readonly employeeRepository: IEmployeeRepository) {}

    async insertEmployee(data: Employee) {
        return await this.employeeRepository.insertEmployee(data);
    }

    async getManagerById(employeeId: string) {
        return await this.employeeRepository.getManagerById(employeeId);
    }

    async getStaff(managerId: string) {
        return await this.employeeRepository.getStaff(managerId);
    }

    async getEmployeeByEmployeeId(employeeId: string) {
        return await this.employeeRepository.getEmployeeByEmployeeId(employeeId);
    }

    async getEmployeeById(id: string) {
        return await this.employeeRepository.getEmployeeById(id);
    }

    async getEmployeeByEmail(email: string) {
        return await this.employeeRepository.getEmployeeByEmail(email);
    }

    async getHierarchy(employeeId: string) {
        const employee = await this.getEmployeeByEmployeeId(employeeId);

        if (employee && employee.manager_id == null) {
            return await this.employeeRepository.getAllDashboardEmployees();
        }

        return await this.employeeRepository.getHierarchy(employeeId);
    }
}
