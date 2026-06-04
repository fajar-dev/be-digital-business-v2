import { Context } from "hono";
import { ISnapshotService } from "../interface/snapshot.interface";
import { ApiResponse } from "../helper/response";
import { PeriodHelper } from "../helper/period";

export class CommissionController {
    constructor(
        private readonly snapshotService: ISnapshotService,
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
}