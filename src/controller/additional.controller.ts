import { Context } from "hono";
import { PeriodHelper } from "../helper/period";
import { ApiResponse } from "../helper/response";

export class AdditionalController {
    constructor(private readonly periodHelper: PeriodHelper = new PeriodHelper()) {}

    async getPeriod(c: Context) {
        const monthParam = c.req.query('month');
        const yearParam = c.req.query('year');
        
        const data = this.periodHelper.getPeriodFromQuery(monthParam, yearParam);
        
        // Remove startDate and endDate to match previous response format if needed, or just return the whole object
        // The original method returned { startDate, endDate } from getStartAndEndDateForMonth.
        // getPeriodFromQuery returns { year, month, startDate, endDate }.
        // This actually adds useful info, so we can just return it.
        return ApiResponse.success(c, { startDate: data.startDate, endDate: data.endDate }, "Period retrieved successfully");
    }

    async getCurrentPeriod(c: Context) {
        const dateParam = c.req.query('date');
        const date = dateParam ? new Date(dateParam) : new Date();
        
        const data = this.periodHelper.getPeriodByDate(date);
        return ApiResponse.success(c, data, "Current period retrieved successfully");
    }
}
