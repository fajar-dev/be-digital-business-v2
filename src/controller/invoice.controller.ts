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
        const { month: monthQuery, year: yearQuery } = c.req.query();
        const employeeId = c.req.param('id');

        if (!employeeId) {
            return ApiResponse.error(c, "id is required", 400);
        }

        const { startDate, endDate } = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);

        const data = await this.snapshotService.getInternalInvoiceDetail(employeeId, startDate, endDate);

        return ApiResponse.success(c, data, "Success get internal invoice");
    }

    async implementatorInvoice(c: Context) {
        const { month: monthQuery, year: yearQuery } = c.req.query();
        const id = c.req.param('id');

        if (!id) {
            return ApiResponse.error(c, "id is required", 400);
        }

        const { startDate, endDate } = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);
        
        const data = await this.snapshotService.getImplementatorInvoiceDetail(id, startDate, endDate);

        return ApiResponse.success(c, data, "Implementator invoice retrieved successfully");
    }
}