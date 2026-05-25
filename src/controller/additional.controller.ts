import { Context } from "hono";
import { PeriodHelper } from "../helper/period";
import { ApiResponse } from "../helper/response";

export class AdditionalController {
    constructor(private readonly periodHelper: PeriodHelper = new PeriodHelper()) {}

    async getPeriod(c: Context) {
        const data = this.periodHelper.getStartAndEndDateForCurrentMonth();
        return ApiResponse.success(c, data, "Period retrieved successfully");
    }

    async getCurrentPeriod(c: Context) {
        const dateParam = c.req.query('date');
        const date = dateParam ? new Date(dateParam) : new Date();
        
        const data = this.periodHelper.getPeriodByDate(date);
        return ApiResponse.success(c, data, "Current period retrieved successfully");
    }
}
