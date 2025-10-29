// src/utils/errors.ts

/**
 * Base Custom Error Class
 */
class CustomError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, CustomError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400
 */
export class ValidationError extends CustomError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

/**
 * Authentication Error - 401
 */
export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

/**
 * Authorization Error - 403
 */
export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict Error - 409
 */
export class ConflictError extends CustomError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * Bad Request Error - 400
 */
export class BadRequestError extends CustomError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Rate Limit Error - 429
 */
export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}
