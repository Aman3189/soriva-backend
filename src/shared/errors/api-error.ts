// src/shared/errors/api-error.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Custom API Error Class
// Pattern: CLASS-BASED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any[];

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    errors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad Request', errors?: any[]): ApiError {
    return new ApiError(400, message, true, errors);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message, true);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message, true);
  }

  static notFound(message: string = 'Not Found'): ApiError {
    return new ApiError(404, message, true);
  }

  static conflict(message: string = 'Conflict'): ApiError {
    return new ApiError(409, message, true);
  }

  static tooManyRequests(message: string = 'Too Many Requests'): ApiError {
    return new ApiError(429, message, true);
  }

  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(500, message, false);
  }

  static serviceUnavailable(message: string = 'Service Unavailable'): ApiError {
    return new ApiError(503, message, false);
  }
}

export default ApiError;