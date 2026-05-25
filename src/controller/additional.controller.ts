import { Context } from "hono";
import { PeriodHelper } from "../helper/period";
import { ApiResponse } from "../helper/response";

export class AdditionalController {
    constructor(private readonly periodHelper: PeriodHelper = new PeriodHelper()) {}

    async getPeriod(c: Context) {
        const { month: monthQuery, year: yearQuery } = c.req.query();
        const data = this.periodHelper.getPeriodFromQuery(monthQuery, yearQuery);
        return ApiResponse.success(c, data, "Period retrieved successfully");
    }
}
