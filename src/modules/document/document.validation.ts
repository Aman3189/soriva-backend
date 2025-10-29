// src/validations/document.validation.ts

import Joi from 'joi';

/**
 * 🎯 SORIVA - DOCUMENT VALIDATION SCHEMAS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer: Amandeep Singh, Punjab, India
 * Quality: 10/10 Production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Joi validation schemas for all document endpoints
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REUSABLE SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const mongoIdSchema = Joi.string().length(24).hex().required().messages({
  'string.length': 'Invalid document ID format',
  'string.hex': 'Invalid document ID format',
  'any.required': 'Document ID is required',
});

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const documentValidationSchemas = {
  /**
   * Upload Document
   * POST /api/documents/upload
   */
  upload: Joi.object({
    // No body validation needed - file handled by multer
  }).unknown(true),

  /**
   * List Documents
   * GET /api/documents
   */
  list: Joi.object({
    ...paginationSchema,

    status: Joi.string().valid('PENDING', 'PROCESSING', 'READY', 'FAILED').optional().messages({
      'any.only': 'Status must be one of: PENDING, PROCESSING, READY, FAILED',
    }),

    search: Joi.string().min(1).max(255).trim().optional().messages({
      'string.min': 'Search query must be at least 1 character',
      'string.max': 'Search query cannot exceed 255 characters',
    }),

    sortBy: Joi.string().valid('createdAt', 'fileName', 'fileSize').default('createdAt').messages({
      'any.only': 'sortBy must be one of: createdAt, fileName, fileSize',
    }),

    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': 'sortOrder must be either asc or desc',
    }),
  }),

  /**
   * Get Document By ID
   * GET /api/documents/:id
   */
  getById: Joi.object({
    id: mongoIdSchema,
  }),

  /**
   * Query Document(s)
   * POST /api/documents/query
   */
  query: Joi.object({
    question: Joi.string().min(3).max(1000).trim().required().messages({
      'string.base': 'Question must be a string',
      'string.min': 'Question must be at least 3 characters',
      'string.max': 'Question cannot exceed 1000 characters',
      'any.required': 'Question is required',
    }),

    documentId: Joi.string().length(24).hex().optional().messages({
      'string.length': 'Invalid document ID format',
      'string.hex': 'Invalid document ID format',
    }),

    documentIds: Joi.array()
      .items(Joi.string().length(24).hex())
      .min(1)
      .max(10)
      .optional()
      .messages({
        'array.base': 'documentIds must be an array',
        'array.min': 'At least 1 document ID required',
        'array.max': 'Maximum 10 documents can be queried at once',
        'string.length': 'Invalid document ID format',
        'string.hex': 'Invalid document ID format',
      }),

    topK: Joi.number().integer().min(1).max(20).default(5).optional().messages({
      'number.base': 'topK must be a number',
      'number.integer': 'topK must be an integer',
      'number.min': 'topK must be at least 1',
      'number.max': 'topK cannot exceed 20',
    }),
  }),

  /**
   * Update Document
   * PATCH /api/documents/:id
   */
  update: Joi.object({
    id: mongoIdSchema,
    fileName: Joi.string().min(1).max(255).trim().required().messages({
      'string.base': 'fileName must be a string',
      'string.min': 'fileName cannot be empty',
      'string.max': 'fileName cannot exceed 255 characters',
      'any.required': 'fileName is required',
    }),
  }),

  /**
   * Delete Document
   * DELETE /api/documents/:id
   */
  delete: Joi.object({
    id: mongoIdSchema,
  }),
};

export default documentValidationSchemas;
