import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'

/**
 * Base Application Exception Class
 * Extends Hono's HTTPException for seamless integration.
 */
export class Exception extends HTTPException {
    public context: Record<string, unknown>[] | null

    constructor(
        message: string,
        status: number = 400,
        errors: Record<string, unknown>[] | null = null
    ) {
        super(status as ContentfulStatusCode, { message })
        this.context = errors
    }
}

/**
 * Common Exception Sub-classes (Standard HTTP Semantics)
 */
export class BadRequestException extends Exception {
    constructor(message: string = "Bad Request", errors: Record<string, unknown>[] | null = null) {
        super(message, 400, errors)
    }
}

export class UnauthorizedException extends Exception {
    constructor(message: string = "Unauthorized Access") {
        super(message, 401)
    }
}

export class NotFoundException extends Exception {
    constructor(message: string = "Resource not found") {
        super(message, 404)
    }
}


export class ForbiddenException extends Exception {
    constructor(message: string = "Forbidden") {
        super(message, 403)
    }
}

export class ConflictException extends Exception {
    constructor(message: string = "Conflict") {
        super(message, 409)
    }
}

export class TooManyRequestsException extends Exception {
    constructor(message: string = "Too Many Requests") {
        super(message, 429)
    }
}