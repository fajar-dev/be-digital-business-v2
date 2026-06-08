import { Context } from "hono";
import { ISnapshotService } from "../interface/snapshot.interface";
import { IEmployeeService } from "../interface/employee.interface";
import { ApiResponse } from "../helper/response";
import { PeriodHelper } from "../helper/period";

export class CommissionController {
    constructor(
        private readonly snapshotService: ISnapshotService,
        private readonly employeeService: IEmployeeService,
        private readonly periodHelper: PeriodHelper = new PeriodHelper(),
    ) {}

    async implementatorCommission(c: Context) {
        const { month: monthQuery, year: yearQuery } = c.req.query();
        const employeeId = c.req.param('id');

        if (!employeeId) {
            return ApiResponse.error(c, "id is required", 400);
        }

        const period = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);
        const data = await this.snapshotService.getImplementatorCommissionSummary(employeeId, period.startDate, period.endDate);
        return ApiResponse.success(c, data, "implementator commission retrieved successfully");
    }

    async salesCommission(c: Context) {
        const { month: monthQuery, year: yearQuery } = c.req.query();
        const employeeId = c.req.param('id');

        if (!employeeId) {
            return ApiResponse.error(c, "id is required", 400);
        }

        const period = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);
        const data = await this.snapshotService.getSalesCommissionSummary(employeeId, period.startDate, period.endDate);
        return ApiResponse.success(c, data, "sales commission retrieved successfully");
    }

    async managerTeam(c: Context) {
        const { month: monthQuery, year: yearQuery } = c.req.query();
        const managerId = c.req.param('id');

        if (!managerId) {
            return ApiResponse.error(c, "id is required", 400);
        }

        // Get staff under this manager
        const manager = await this.employeeService.getManagerById(managerId);
        if (!manager.length) {
            return ApiResponse.error(c, "manager not found", 404);
        }

        const staff = await this.employeeService.getStaff(manager[0].id);
        const employees = staff.map((s: any) => ({
            employeeId: s.employee_id,
            name: s.name,
            photoProfile: s.photo_profile || ''
        }));

        const period = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);
        const data = await this.snapshotService.getManagerTeamSummary(employees, period.startDate, period.endDate);
        return ApiResponse.success(c, data, "manager team commission retrieved successfully");
    }
}