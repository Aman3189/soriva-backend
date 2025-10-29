// src/core/response.ts
import { Response } from 'express';

/**
 * Standardized success response
 */
export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standardized error response
 */
export const errorResponse = (
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  error?: any
) => {
  const response: any = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standardized validation error response
 */
export const validationErrorResponse = (
  res: Response,
  errors: any[],
  message: string = 'Validation failed'
) => {
  return res.status(400).json({
    success: false,
    message,
    errors,
  });
};
