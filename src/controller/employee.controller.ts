import { Context } from "hono";
import { EmployeeService } from "../service/employee.service";
import { ApiResponse } from "../helper/response";
import { NotFoundException } from "../helper/exception";

export class EmployeeController {
    private employeeService: EmployeeService;

    constructor() {
        this.employeeService = new EmployeeService();
    }

    async getEmployeeByEmployeeId(c: Context) {
        const employeeId = c.req.param('id');
        const result = await this.employeeService.getEmployeeByEmployeeId(employeeId);
        
        if (!result) {
            throw new NotFoundException('Employee not found');
        }
        
        return ApiResponse.success(c, result, "Employee retrieved successfully");
    }

    async getEmployeeHierarchy(c: Context) {
        const employeeId = c.req.param('id');
        const hierarchy = await this.employeeService.getHierarchy(employeeId);

        return ApiResponse.success(c, hierarchy, "Employee hierarchy retrieved successfully");
    }
}
