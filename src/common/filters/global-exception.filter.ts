import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Global Exception Filter
 * Catches ALL exceptions (HTTP and non-HTTP) and formats them into our standardized API response
 * Ensures even 500 errors follow the { success, data, error } format
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Determine HTTP status code
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Extract error message
        let errorMessage = 'Internal server error';
        let errorDetails: any = null;

        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                errorMessage = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                errorMessage =
                    (exceptionResponse as any).message || exception.message;
                errorDetails = exceptionResponse;
            }
        } else if (exception instanceof Error) {
            errorMessage = exception.message;
        }

        // Log error for debugging (in production, send to monitoring service)
        this.logger.error(
            `HTTP ${status} Error: ${errorMessage}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        // Build standardized error response
        const errorResponse: ApiResponse = {
            success: false,
            error: errorMessage,
            message: errorMessage,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Include detailed validation errors if available (e.g., from Zod)
        if (errorDetails && Array.isArray(errorDetails.message)) {
            errorResponse.data = {
                validationErrors: errorDetails.message,
            };
        }

        response.status(status).json(errorResponse);
    }
}
