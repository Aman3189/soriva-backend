// src/shared/utils/error-handler.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Error Handler Utilities & Middleware
// Pattern: FUNCTIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { ApiError } from '../errors/api-error';

// Re-export for backward compatibility
export { ApiError } from '../errors/api-error';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR CONVERTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const convertToApiError = (err: any): ApiError => {
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
// ERROR HANDLER MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
// 404 NOT FOUND HANDLER
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
// ASYNC HANDLER WRAPPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  convertToApiError,
};
