import { Context, Next } from "hono";
import { EmployeeService } from "../service/employee.service";
import { UnauthorizedException, ForbiddenException } from "../helper/exception";

export const hierarchyMiddleware = async (c: Context, next: Next) => {
    const user = c.get('user');
    const targetEmployeeId = c.req.param('id');

    if (!user || !user.sub) {
        throw new UnauthorizedException('Unauthorized: User identity missing');
    }

    const currentEmployeeId = user.sub;

    // Fetch hierarchy for the current user
    // This returns the current user and all subordinates
    const employeeService = new EmployeeService();
    const hierarchy = await employeeService.getHierarchy(currentEmployeeId);

    // Check if the target employee ID exists in the hierarchy list
    const isAuthorized = hierarchy.some((emp: any) => emp.employee_id === targetEmployeeId);

    if (!isAuthorized) {
        throw new ForbiddenException('Forbidden: You do not have access to this resource');
    }

    await next();
};
