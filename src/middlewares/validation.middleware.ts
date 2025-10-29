// src/controllers/middlewares/validation.middleware.ts

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * 🎯 SORIVA - VALIDATION MIDDLEWARE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer: Amandeep Singh, Punjab, India
 * Architecture: Joi-based request validation
 * Quality: 10/10 Production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * FEATURES:
 * ✅ Request body validation
 * ✅ Query params validation
 * ✅ Path params validation
 * ✅ Custom error messages
 * ✅ Sanitization
 * ✅ Type coercion
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION SCHEMAS FOR DOCUMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const documentSchemas = {
  // Upload document validation
  upload: Joi.object({
    file: Joi.any().required(),
  }),

  // Query document validation
  // Query document validation
  query: Joi.object({
    question: Joi.string().trim().min(3).max(1000).required().messages({
      'string.empty': 'Question cannot be empty',
      'string.min': 'Question must be at least 3 characters long',
      'string.max': 'Question cannot exceed 1000 characters',
      'any.required': 'Question is required',
    }),
    documentId: Joi.string().uuid().messages({
      'string.guid': 'Invalid document ID format',
    }),
    documentIds: Joi.array().items(Joi.string().uuid()).min(1).max(10).messages({
      'array.min': 'At least one document ID is required',
      'array.max': 'Cannot query more than 10 documents at once',
      'string.guid': 'Invalid document ID format in array',
    }),
    topK: Joi.number().integer().min(1).max(20).default(5).messages({
      'number.base': 'topK must be a number',
      'number.min': 'topK must be at least 1',
      'number.max': 'topK cannot exceed 20',
    }),
  })
    .or('documentId', 'documentIds') // ✅ At least one must be present
    .messages({
      'object.missing': 'Either documentId or documentIds must be provided',
    }),

  // List documents validation
  list: Joi.object({
    status: Joi.string().valid('UPLOADING', 'PROCESSING', 'READY', 'FAILED').optional().messages({
      'any.only': 'Status must be one of: UPLOADING, PROCESSING, READY, FAILED',
    }),
    search: Joi.string().trim().min(1).max(100).optional().messages({
      'string.min': 'Search term must be at least 1 character',
      'string.max': 'Search term cannot exceed 100 characters',
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
    sortBy: Joi.string().valid('createdAt', 'fileName', 'fileSize').default('createdAt').messages({
      'any.only': 'sortBy must be one of: createdAt, fileName, fileSize',
    }),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': 'sortOrder must be either asc or desc',
    }),
  }),

  // Update document validation
  update: Joi.object({
    fileName: Joi.string().trim().min(1).max(255).optional().messages({
      'string.empty': 'File name cannot be empty',
      'string.min': 'File name must be at least 1 character',
      'string.max': 'File name cannot exceed 255 characters',
    }),
    metadata: Joi.object().optional().messages({
      'object.base': 'Metadata must be an object',
    }),
  })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),

  // Document ID param validation
  documentId: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid document ID format',
      'any.required': 'Document ID is required',
    }),
  }),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION MIDDLEWARE FACTORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Validate request data against Joi schema
 */
export const validate = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body',
  options: ValidationOptions = {}
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const defaultOptions: ValidationOptions = {
      abortEarly: false, // Return all errors, not just first
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false,
      ...options,
    };

    const { error, value } = schema.validate(req[property], defaultOptions);

    if (error) {
      const errors: ValidationError[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Replace request data with validated & sanitized data
    req[property] = value;
    next();
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE VALIDATION MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Validate uploaded file
 */
export const validateFile = (
  options: {
    required?: boolean;
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
) => {
  const defaultOptions = {
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB default
    allowedTypes: ['application/pdf'],
    ...options,
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    const file = (req as any).file;

    // Check if file is required
    if (defaultOptions.required && !file) {
      res.status(400).json({
        success: false,
        message: 'File is required',
        errors: [
          {
            field: 'file',
            message: 'No file uploaded',
          },
        ],
      });
      return;
    }

    // If file not required and not provided, skip validation
    if (!defaultOptions.required && !file) {
      next();
      return;
    }

    // Validate file size
    if (file.size > defaultOptions.maxSize) {
      res.status(400).json({
        success: false,
        message: 'File size exceeds limit',
        errors: [
          {
            field: 'file',
            message: `File size must not exceed ${defaultOptions.maxSize / 1024 / 1024}MB`,
          },
        ],
      });
      return;
    }

    // Validate file type
    if (!defaultOptions.allowedTypes.includes(file.mimetype)) {
      res.status(400).json({
        success: false,
        message: 'Invalid file type',
        errors: [
          {
            field: 'file',
            message: `Only ${defaultOptions.allowedTypes.join(', ')} files are allowed`,
          },
        ],
      });
      return;
    }

    next();
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SANITIZATION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Sanitize string input (remove XSS attempts)
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove inline event handlers
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  validate,
  validateFile,
  documentSchemas,
  sanitizeString,
  sanitizeObject,
};
