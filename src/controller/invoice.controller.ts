import { Context } from "hono";
import { ISnapshotService } from "../interface/snapshot.interface";
import { ApiResponse } from "../helper/response";
import { PeriodHelper } from "../helper/period";

export class InvoiceController {
    constructor(
        private readonly snapshotService: ISnapshotService,
        private readonly periodHelper: PeriodHelper = new PeriodHelper(),
    ) {}

    async accountManagers(c: Context) {
        const data = await this.snapshotService.getAccountManagers();
        return ApiResponse.success(c, data, "Account managers retrieved successfully");
    }

    async snapshotList(c: Context) {
        const { search, status, type, salesId, month: monthQuery, year: yearQuery, page, limit } = c.req.query();

        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
        const serviceType = type === 'internal' || type === 'resell' ? type : undefined;

        const { startDate, endDate } = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);

        const data = await this.snapshotService.getSnapshotList({
            search: search || undefined,
            status: status || undefined,
            serviceType,
            salesId: salesId || undefined,
            startDate,
            endDate,
            page: pageNum,
            limit: limitNum
        });

        return ApiResponse.success(c, data, "Snapshot list retrieved successfully");
    }

    async internalInvoice(c: Context) {
        const { month: monthQuery, year: yearQuery } = c.req.query();
        const employeeId = c.req.param('id');

        if (!employeeId) {
            return ApiResponse.error(c, "id is required", 400);
        }

        const { startDate, endDate } = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);
        const data = await this.snapshotService.getInternalInvoiceDetail(employeeId, startDate, endDate);
        return ApiResponse.success(c, data, "Internal invoice retrieved successfully");
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

    async resellInvoice(c: Context) {
        const { month: monthQuery, year: yearQuery } = c.req.query();
        const employeeId = c.req.param('id');

        if (!employeeId) {
            return ApiResponse.error(c, "id is required", 400);
        }

        const { startDate, endDate } = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);
        const data = await this.snapshotService.getResellInvoiceDetail(employeeId, startDate, endDate);
        return ApiResponse.success(c, data, "Resell invoice retrieved successfully");
    }
}