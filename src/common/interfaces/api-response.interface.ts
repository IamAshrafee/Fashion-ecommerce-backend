/**
 * Standardized API Response Interface
 * Ensures all API responses follow the same structure for consistency
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp?: string;
    path?: string;
}
