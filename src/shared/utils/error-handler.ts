// src/utils/error-handler.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * 🎯 SORIVA - ERROR HANDLER (ENHANCED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer: Amandeep, Punjab, India
 * Architecture: Centralized error handling with logging
 * Quality: 10/10 Production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM API ERROR CLASS (ENHANCED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any[];

  constructor(statusCode: number, message: string, isOperational: boolean = true, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATIC FACTORY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR CONVERTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const convertToApiError = (err: any): ApiError => {
  // Already an ApiError
  if (err instanceof ApiError) {
    return err;
  }

  // Mongoose/Prisma validation error
  if (err.name === 'ValidationError') {
    return ApiError.badRequest('Validation Error', err.errors);
  }

  // Mongoose/Prisma duplicate key error
  if (err.code === 11000 || err.code === 'P2002') {
    return ApiError.conflict('Duplicate entry');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Token expired');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiError.badRequest('File too large');
    }
    return ApiError.badRequest(err.message);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2025') {
      return ApiError.notFound('Record not found');
    }
    if (err.code === 'P2002') {
      return ApiError.conflict('Unique constraint violation');
    }
    return ApiError.badRequest('Database error');
  }

  // Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    return ApiError.badRequest('Invalid data provided');
  }

  // Default to internal server error
  return ApiError.internal(err.message || 'Something went wrong');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLER MIDDLEWARE (ENHANCED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // Convert to ApiError
  const apiError = convertToApiError(err);

  // Get environment
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error
  logger.error(`${apiError.statusCode} - ${apiError.message}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.id,
    errors: apiError.errors,
    stack: apiError.stack,
  });

  // Build response
  const response: any = {
    success: false,
    message: apiError.message,
    statusCode: apiError.statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // Add errors array if present
  if (apiError.errors && apiError.errors.length > 0) {
    response.errors = apiError.errors;
  }

  // Include stack trace in development
  if (isDevelopment && apiError.stack) {
    response.stack = apiError.stack;
  }

  // Send response
  res.status(apiError.statusCode).json(response);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 404 NOT FOUND HANDLER (ENHANCED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const notFoundHandler = (req: Request, res: Response): void => {
  const message = `Route ${req.method} ${req.originalUrl} not found`;

  logger.warn(`404 - ${message}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASYNC HANDLER WRAPPER (TYPED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
