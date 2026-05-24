import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from './config/app'
import { api } from './route/api'
import { Exception } from './helper/exception'
import { ApiResponse } from './helper/response'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Register API Routes
app.route('/api', api);


// Global Error Handler
app.onError((err, c) => {
    if (err instanceof Exception) {
        console.error(`[Exception] ${err.status} - ${err.message}`)
        return ApiResponse.error(c, err.message, err.status, err.context)
    }

    console.error("error: ", err.message)

    const errors = config.app.env !== "production" ? { 
        message: err.message, 
        stack: err.stack 
    } : null

    return ApiResponse.error(c, "Internal Server Error", 500, errors as any)
})

export default {
  port: config.app.port,
  fetch: app.fetch
};
