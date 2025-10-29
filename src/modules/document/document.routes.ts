// src/routes/document.routes.ts

import { Router } from 'express';
import multer from 'multer';

// Import controllers (DEFAULT EXPORTS)
import documentController from './document.controller';

// Import middlewares (CORRECT PATHS)
import { AuthMiddleware } from '../auth/auth.middleware';
import validationMiddleware from '@shared/middlewares/validation.middleware';
import rateLimitMiddleware from '@shared/middlewares/rate-limit.middleware';

// Import validation schemas
import { documentValidationSchemas } from './document.validation';

/**
 * 🎯 SORIVA - DOCUMENT ROUTES (100% PRODUCTION-READY)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer: Amandeep Singh, Punjab, India
 * Architecture: Class-based Singleton Pattern
 * Quality: 10/10 Production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ROUTES:
 * ✅ POST   /api/documents/upload       - Upload document
 * ✅ GET    /api/documents/stats        - Get user stats (BEFORE :id)
 * ✅ GET    /api/documents              - List documents
 * ✅ GET    /api/documents/:id          - Get document by ID
 * ✅ POST   /api/documents/query        - Query document(s)
 * ✅ PATCH  /api/documents/:id          - Update document
 * ✅ DELETE /api/documents/:id          - Delete document
 *
 * SECURITY:
 * ✅ Authentication on all routes
 * ✅ Rate limiting per endpoint type
 * ✅ Input validation
 * ✅ File upload restrictions
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTER CONFIGURATION (IN-MEMORY STORAGE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max (will be validated by controller based on plan)
    files: 1, // Only 1 file at a time
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DocumentRoutes {
  private static instance: DocumentRoutes;
  public router: Router;

  /**
   * Private constructor to enforce Singleton pattern
   */
  private constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  /**
   * Get singleton instance of DocumentRoutes
   * @returns {DocumentRoutes} Singleton instance
   */
  public static getInstance(): DocumentRoutes {
    if (!DocumentRoutes.instance) {
      DocumentRoutes.instance = new DocumentRoutes();
    }
    return DocumentRoutes.instance;
  }

  /**
   * Initialize all document routes with middleware chain
   * @private
   */
  private initializeRoutes(): void {
    // ═══════════════════════════════════════════════════════
    // UPLOAD DOCUMENT
    // ═══════════════════════════════════════════════════════
    this.router.post(
      '/upload',
      AuthMiddleware.authenticate,
      rateLimitMiddleware.uploadLimiter,
      upload.single('file'),
      validationMiddleware.validate(documentValidationSchemas.upload),
      documentController.uploadDocument
    );

    // ═══════════════════════════════════════════════════════
    // GET USER STATS
    // ⚠️ MUST BE BEFORE /:id ROUTE!
    // ═══════════════════════════════════════════════════════
    this.router.get(
      '/stats',
      AuthMiddleware.authenticate,
      rateLimitMiddleware.apiLimiter,
      documentController.getUserStats
    );

    // ═══════════════════════════════════════════════════════
    // LIST DOCUMENTS (with filters, search, sort)
    // ═══════════════════════════════════════════════════════
    this.router.get(
      '/',
      AuthMiddleware.authenticate,
      rateLimitMiddleware.apiLimiter,
      validationMiddleware.validate(documentValidationSchemas.list),
      documentController.getDocuments
    );

    // ═══════════════════════════════════════════════════════
    // GET DOCUMENT BY ID
    // ═══════════════════════════════════════════════════════
    this.router.get(
      '/:id',
      AuthMiddleware.authenticate,
      rateLimitMiddleware.apiLimiter,
      validationMiddleware.validate(documentValidationSchemas.getById),
      documentController.getDocumentById
    );

    // ═══════════════════════════════════════════════════════
    // QUERY DOCUMENT(S)
    // ═══════════════════════════════════════════════════════
    this.router.post(
      '/query',
      AuthMiddleware.authenticate,
      rateLimitMiddleware.strictLimiter,
      validationMiddleware.validate(documentValidationSchemas.query),
      documentController.queryDocument
    );

    // ═══════════════════════════════════════════════════════
    // UPDATE DOCUMENT METADATA
    // ═══════════════════════════════════════════════════════
    this.router.patch(
      '/:id',
      AuthMiddleware.authenticate,
      rateLimitMiddleware.apiLimiter,
      validationMiddleware.validate(documentValidationSchemas.update),
      documentController.updateDocument
    );

    // ═══════════════════════════════════════════════════════
    // DELETE DOCUMENT
    // ═══════════════════════════════════════════════════════
    this.router.delete(
      '/:id',
      AuthMiddleware.authenticate,
      rateLimitMiddleware.apiLimiter,
      validationMiddleware.validate(documentValidationSchemas.delete),
      documentController.deleteDocument
    );
  }

  /**
   * Get configured router instance
   * @returns {Router} Express router with all document routes
   */
  public getRouter(): Router {
    return this.router;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default DocumentRoutes.getInstance();
