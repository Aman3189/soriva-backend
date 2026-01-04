// src/validations/document.validation.ts

import Joi from 'joi';

/**
 * 🎯 SORIVA - DOCUMENT VALIDATION SCHEMAS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer: Amandeep, Punjab, India
 * Updated: November 24, 2025
 * Quality: 10/10 Production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Joi validation schemas for all document endpoints
 * - Basic CRUD operations
 * - RAG query operations
 * - Document Intelligence AI operations (28 types)
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
// DOCUMENT INTELLIGENCE - OPERATION TYPES (28 Total)
// Matches Prisma OperationType enum exactly
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VALID_OPERATION_TYPES = [
  // ===== FREE Operations (5) =====
  'SUMMARY_SHORT',        // Quick 2-3 line summary
  'SUMMARY_BULLET',       // Bullet point summary
  'KEYWORD_EXTRACT',      // Extract keywords
  'DOCUMENT_CLEANUP',     // Fix formatting
  'FLASHCARDS',           // Generate flashcards

  // ===== PAID Operations (23) =====
  // Summaries & Notes
  'SUMMARY_LONG',         // Detailed paragraph summary
  'SUMMARIES_ADVANCED',   // Executive summary
  'NOTES_GENERATOR',      // Structured study notes
  'TOPIC_BREAKDOWN',      // Break down topics

  // Test & Questions
  'TEST_GENERATOR',       // Create MCQ tests
  'QUESTION_BANK',        // Generate question bank
  'FILL_IN_BLANKS',       // Fill-in-blank exercises

  // Presentation & Reports
  'PRESENTATION_MAKER',   // Generate PPT slides
  'REPORT_BUILDER',       // Professional reports
  'WORKFLOW_CONVERSION',  // Convert to workflow

  // Translation & Cleanup
  'TRANSLATE_BASIC',      // Basic translation
  'TRANSLATE_SIMPLIFY_ADVANCED', // Translate + simplify
  'DOCUMENT_CLEANUP_ADVANCED',   // Professional cleanup

  // Data & Insights
  'TABLE_TO_CHARTS',      // Tables to visualizations
  'TREND_ANALYSIS',       // Analyze trends
  'INSIGHTS_EXTRACTION',  // Extract key insights

  // Research & Comparison
  'CROSS_PDF_COMPARE',    // Compare multiple PDFs
  'MULTI_DOC_REASONING',  // Reason across documents
  'KEYWORD_INDEX_EXTRACTOR', // Comprehensive keyword index

  // Document Q&A
  'DOCUMENT_CHAT_MEMORY', // Chat with document context

  // Special Features
  'DIAGRAM_INTERPRETATION', // Interpret diagrams
  'CONTRACT_LAW_SCAN',    // Legal document analysis
  'AI_DETECTION_REDACTION', // Detect AI-generated content
  'VOICE_MODE',           // Voice-based interaction
];

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

  // ═════════════════════════════════════════════════════════════════
  // DOCUMENT INTELLIGENCE VALIDATIONS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Perform Intelligence Operation
   * POST /api/documents/:id/intelligence/operate
   */
  performOperation: Joi.object({
    id: mongoIdSchema,

    operationType: Joi.string()
      .valid(...VALID_OPERATION_TYPES)
      .required()
      .messages({
        'string.base': 'operationType must be a string',
        'any.only': `Invalid operationType. Valid types: ${VALID_OPERATION_TYPES.join(', ')}`,
        'any.required': 'operationType is required',
      }),

    options: Joi.object({
      // ===== SUMMARY Options =====
      length: Joi.string().valid('short', 'medium', 'long').optional().messages({
        'any.only': 'length must be one of: short, medium, long',
      }),

      // ===== TRANSLATE Options =====
      targetLanguage: Joi.string().min(2).max(5).lowercase().optional().messages({
        'string.min': 'targetLanguage must be at least 2 characters (e.g., hi, es, fr)',
        'string.max': 'targetLanguage cannot exceed 5 characters',
      }),

      sourceLanguage: Joi.string().min(2).max(5).lowercase().optional().messages({
        'string.min': 'sourceLanguage must be at least 2 characters',
        'string.max': 'sourceLanguage cannot exceed 5 characters',
      }),

      // ===== TEST_GENERATOR / QUESTION_BANK Options =====
      questionCount: Joi.number().integer().min(1).max(50).optional().messages({
        'number.min': 'questionCount must be at least 1',
        'number.max': 'questionCount cannot exceed 50',
      }),

      difficulty: Joi.string().valid('easy', 'medium', 'hard').optional().messages({
        'any.only': 'difficulty must be one of: easy, medium, hard',
      }),

      questionTypes: Joi.array()
        .items(Joi.string().valid('mcq', 'short', 'long', 'true_false'))
        .optional()
        .messages({
          'any.only': 'questionTypes must be one of: mcq, short, long, true_false',
        }),

      // ===== FLASHCARDS Options =====
      cardCount: Joi.number().integer().min(1).max(20).optional().messages({
        'number.min': 'cardCount must be at least 1',
        'number.max': 'cardCount cannot exceed 20',
      }),

      // ===== PRESENTATION_MAKER Options =====
      slideCount: Joi.number().integer().min(3).max(20).optional().messages({
        'number.min': 'slideCount must be at least 3',
        'number.max': 'slideCount cannot exceed 20',
      }),

      presentationStyle: Joi.string()
        .valid('professional', 'academic', 'creative', 'minimal')
        .optional()
        .messages({
          'any.only': 'presentationStyle must be one of: professional, academic, creative, minimal',
        }),

      // ===== NOTES_GENERATOR Options =====
      notesStyle: Joi.string()
        .valid('brief', 'detailed', 'comprehensive')
        .optional()
        .messages({
          'any.only': 'notesStyle must be one of: brief, detailed, comprehensive',
        }),

      // ===== CROSS_PDF_COMPARE Options =====
      compareWithDocumentId: Joi.string().length(24).hex().optional().messages({
        'string.length': 'Invalid compareWithDocumentId format',
        'string.hex': 'Invalid compareWithDocumentId format',
      }),

      compareWithDocumentIds: Joi.array()
        .items(Joi.string().length(24).hex())
        .max(5)
        .optional()
        .messages({
          'array.max': 'Maximum 5 documents can be compared at once',
        }),

      // ===== TABLE_TO_CHARTS Options =====
      chartType: Joi.string()
        .valid('bar', 'line', 'pie', 'auto')
        .optional()
        .messages({
          'any.only': 'chartType must be one of: bar, line, pie, auto',
        }),

      // ===== AI Configuration =====
      temperature: Joi.number().min(0).max(2).optional().messages({
        'number.min': 'temperature must be at least 0',
        'number.max': 'temperature cannot exceed 2',
      }),

      maxTokens: Joi.number().integer().min(100).max(10000).optional().messages({
        'number.min': 'maxTokens must be at least 100',
        'number.max': 'maxTokens cannot exceed 10000',
      }),

      // ===== Custom Options =====
      customInstructions: Joi.string().max(500).trim().optional().messages({
        'string.max': 'customInstructions cannot exceed 500 characters',
      }),

      outputFormat: Joi.string().valid('text', 'json', 'markdown', 'html').optional().messages({
        'any.only': 'outputFormat must be one of: text, json, markdown, html',
      }),

      // ===== DOCUMENT_CHAT_MEMORY Options =====
      question: Joi.string().max(1000).trim().optional().messages({
        'string.max': 'question cannot exceed 1000 characters',
      }),

      conversationId: Joi.string().optional(),

      // ===== CONTRACT_LAW_SCAN Options =====
      jurisdiction: Joi.string().max(50).optional().messages({
        'string.max': 'jurisdiction cannot exceed 50 characters',
      }),

      contractType: Joi.string()
        .valid('employment', 'nda', 'service', 'lease', 'general')
        .optional()
        .messages({
          'any.only': 'contractType must be one of: employment, nda, service, lease, general',
        }),

    }).optional().messages({
      'object.base': 'options must be an object',
    }),
  }),

  /**
   * Get Operation Result
   * GET /api/documents/intelligence/operations/:operationId
   */
  getOperationResult: Joi.object({
    operationId: Joi.string().length(24).hex().required().messages({
      'string.length': 'Invalid operation ID format',
      'string.hex': 'Invalid operation ID format',
      'any.required': 'Operation ID is required',
    }),
  }),

  /**
   * Get Document Operations
   * GET /api/documents/:id/intelligence/operations
   */
  getDocumentOperations: Joi.object({
    id: mongoIdSchema,

    // Optional filters
    operationType: Joi.string()
      .valid(...VALID_OPERATION_TYPES)
      .optional()
      .messages({
        'any.only': `operationType must be one of: ${VALID_OPERATION_TYPES.join(', ')}`,
      }),

    status: Joi.string()
      .valid('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED', 'CACHED')
      .optional()
      .messages({
        'any.only': 'status must be one of: PENDING, PROCESSING, SUCCESS, FAILED, TIMEOUT, CANCELLED, CACHED',
      }),

    ...paginationSchema,
  }),
};

export default documentValidationSchemas;