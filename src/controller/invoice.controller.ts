import { Context } from "hono";
import { ISnapshotService } from "../interface/snapshot.interface";
import { ApiResponse } from "../helper/response";
import { PeriodHelper } from "../helper/period";

export class InvoiceController {
    constructor(
        private readonly snapshotService: ISnapshotService,
        private readonly periodHelper: PeriodHelper = new PeriodHelper(),
    ) {}

    async internalInvoice(c: Context) {
        const { month, year } = c.req.query();
        const employeeId = c.req.param('id');

        if (!month || !year || !employeeId) {
            return ApiResponse.error(c, "month, year, and id are required", 400);
        }

        // monthIndex in periodHelper is 0-based, so subtract 1 from month string
        const { startDate, endDate } = this.periodHelper.getStartAndEndDateForMonth(Number(year), Number(month) - 1);

        const data = await this.snapshotService.getInternalInvoiceDetail(employeeId, startDate, endDate);

        return ApiResponse.success(c, data, "Success get internal invoice");
    }

    async implementatorInvoice(c: Context) {
        const { month, year } = c.req.query();
        const id = c.req.param('id');

        if (!month || !year || !id) {
            return ApiResponse.error(c, "month, year, and id are required", 400);
        }

        const { startDate, endDate } = this.periodHelper.getStartAndEndDateForMonth(Number(year), Number(month) - 1);
        
        const data = await this.snapshotService.getImplementatorInvoiceDetail(id, startDate, endDate);

        return ApiResponse.success(c, data, "Implementator invoice retrieved successfully");
    }
}