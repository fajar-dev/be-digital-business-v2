import { Context } from "hono";
import { IEmployeeService } from "../interface/employee.interface";
import { ApiResponse } from "../helper/response";
import { NotFoundException, BadRequestException } from "../helper/exception";

export class EmployeeController {
    constructor(private readonly employeeService: IEmployeeService) {}

    async getEmployeeByEmployeeId(c: Context) {
        const employeeId = c.req.param('id');
        if (!employeeId) {
            throw new BadRequestException('Employee ID is required');
        }

        const result = await this.employeeService.getEmployeeByEmployeeId(employeeId);
        
        if (!result) {
            throw new NotFoundException('Employee not found');
        }
        
        return ApiResponse.success(c, result, "Employee retrieved successfully");
    }

    async getEmployeeHierarchy(c: Context) {
        const employeeId = c.req.param('id');
        if (!employeeId) {
            throw new BadRequestException('Employee ID is required');
        }

        const hierarchy = await this.employeeService.getHierarchy(employeeId);

        return ApiResponse.success(c, hierarchy, "Employee hierarchy retrieved successfully");
    }
}
