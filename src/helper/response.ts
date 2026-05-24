import { Context } from "hono"
import { ContentfulStatusCode } from "hono/utils/http-status"

/**
 * Standard API Response Formatter (Best Practice)
 * Ensures consistency across all API responses.
 */
export class ApiResponse {
    static success<T>(
        c: Context,
        data: T,
        message: string = "Success",
        status: number = 200
    ) {
        return c.json({
            success: true,
            statusCode: status,
            message: message,
            data: data,
        }, status as ContentfulStatusCode)
    }

    static error(
        c: Context,
        message: string = "Internal Server Error",
        status: number = 500,
        errors: Record<string, unknown> | Record<string, unknown>[] | null = null
    ) {
        return c.json({
            success: false,
            statusCode: status,
            message: message,
            errors: errors
        }, status as ContentfulStatusCode)
    }
}