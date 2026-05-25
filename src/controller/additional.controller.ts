import { Context } from "hono";
import { PeriodHelper } from "../helper/period";
import { ApiResponse } from "../helper/response";

export class AdditionalController {
    constructor(private readonly periodHelper: PeriodHelper = new PeriodHelper()) {}

    async getPeriod(c: Context) {
        const monthParam = c.req.query('month');
        const yearParam = c.req.query('year');
        const today = new Date();
        
        // Use query params if provided (1-12), else current month (0-11) + 1
        const monthIndex = monthParam ? Number(monthParam) - 1 : today.getMonth();
        const year = yearParam ? Number(yearParam) : today.getFullYear();

        const data = this.periodHelper.getStartAndEndDateForMonth(year, monthIndex);
        return ApiResponse.success(c, data, "Period retrieved successfully");
    }

    async getCurrentPeriod(c: Context) {
        const dateParam = c.req.query('date');
        const date = dateParam ? new Date(dateParam) : new Date();
        
        const data = this.periodHelper.getPeriodByDate(date);
        return ApiResponse.success(c, data, "Current period retrieved successfully");
    }
}
