// src/routes/document.routes.ts

import { Router } from 'express';
import multer from 'multer';

// Import controllers (DEFAULT EXPORTS)
import documentController from './document.controller';

// Import middlewares (CORRECT PATHS)
import { authMiddleware } from '../auth/middleware/auth.middleware';
import validationMiddleware from '@shared/middlewares/validation.middleware';
// OLD RATE LIMITER - COMMENTED OUT (Fixed 100 limit issue)
// import rateLimitMiddleware from '@shared/middlewares/rate-limit.middleware';
// NEW RATE LIMITER - Plan-based limits (STARTER=20, PRIME=50, etc.)
import { checkRateLimits, quickCheckLimits } from '../../middleware/rateLimiter.middleware';

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
 * ✅ Rate limiting per endpoint type (Plan-based)
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

    /**
     * @swagger
     * /api/documents/upload:
     *   post:
     *     summary: Upload Document
     *     description: Upload a PDF document for processing and AI-powered querying
     *     tags: [Document]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - file
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: PDF file to upload (max 100MB)
     *               title:
     *                 type: string
     *                 example: Annual Report 2025
     *                 description: Optional custom title for the document
     *               description:
     *                 type: string
     *                 example: Company annual financial report
     *                 description: Optional description
     *     responses:
     *       201:
     *         description: Document uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Document uploaded successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: doc_1234567890
     *                     title:
     *                       type: string
     *                       example: Annual Report 2025
     *                     fileName:
     *                       type: string
     *                       example: annual-report.pdf
     *                     fileSize:
     *                       type: integer
     *                       example: 2457600
     *                     status:
     *                       type: string
     *                       example: processing
     *                     uploadedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Invalid file or missing required fields
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       413:
     *         description: File too large
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       429:
     *         description: Rate limit exceeded
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      '/upload',
      authMiddleware,
      checkRateLimits, // ✅ NEW: Plan-based rate limiting
      upload.single('file'),
      validationMiddleware.validate(documentValidationSchemas.upload),
      documentController.uploadDocument
    );

    // ═══════════════════════════════════════════════════════
    // GET USER STATS
    // ⚠️ MUST BE BEFORE /:id ROUTE!
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/stats:
     *   get:
     *     summary: Get User Document Statistics
     *     description: Retrieve user's document usage statistics and quotas
     *     tags: [Document]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Statistics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     totalDocuments:
     *                       type: integer
     *                       example: 15
     *                     totalSize:
     *                       type: integer
     *                       example: 52428800
     *                       description: Total size in bytes
     *                     storageUsed:
     *                       type: string
     *                       example: 50 MB
     *                     storageLimit:
     *                       type: string
     *                       example: 1 GB
     *                     documentsLimit:
     *                       type: integer
     *                       example: 50
     *                     remaining:
     *                       type: integer
     *                       example: 35
     *                     byStatus:
     *                       type: object
     *                       properties:
     *                         processed:
     *                           type: integer
     *                           example: 12
     *                         processing:
     *                           type: integer
     *                           example: 2
     *                         failed:
     *                           type: integer
     *                           example: 1
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      '/stats',
      authMiddleware,
      quickCheckLimits, // ✅ NEW: Lighter rate limiting for CRUD
      documentController.getUserStats
    );

    // ═══════════════════════════════════════════════════════
    // LIST DOCUMENTS (with filters, search, sort)
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents:
     *   get:
     *     summary: List Documents
     *     description: Get paginated list of user's documents with filtering and sorting
     *     tags: [Document]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *           example: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 20
     *           example: 20
     *         description: Items per page
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *           example: annual report
     *         description: Search in title and content
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [processing, processed, failed]
     *           example: processed
     *         description: Filter by processing status
     *       - in: query
     *         name: sortBy
     *         schema:
     *           type: string
     *           enum: [createdAt, title, fileSize]
     *           default: createdAt
     *           example: createdAt
     *         description: Sort field
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: desc
     *           example: desc
     *         description: Sort order
     *     responses:
     *       200:
     *         description: Documents retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     documents:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             example: doc_1234567890
     *                           title:
     *                             type: string
     *                             example: Annual Report 2025
     *                           fileName:
     *                             type: string
     *                             example: annual-report.pdf
     *                           fileSize:
     *                             type: integer
     *                             example: 2457600
     *                           status:
     *                             type: string
     *                             example: processed
     *                           createdAt:
     *                             type: string
     *                             format: date-time
     *                     pagination:
     *                       type: object
     *                       properties:
     *                         page:
     *                           type: integer
     *                           example: 1
     *                         limit:
     *                           type: integer
     *                           example: 20
     *                         total:
     *                           type: integer
     *                           example: 15
     *                         totalPages:
     *                           type: integer
     *                           example: 1
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      '/',
      authMiddleware,
      quickCheckLimits, // ✅ NEW: Lighter rate limiting for CRUD
      validationMiddleware.validate(documentValidationSchemas.list),
      documentController.getDocuments
    );

    // ═══════════════════════════════════════════════════════
    // GET DOCUMENT BY ID
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/{id}:
     *   get:
     *     summary: Get Document by ID
     *     description: Retrieve detailed information about a specific document
     *     tags: [Document]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           example: doc_1234567890
     *         description: Document ID
     *     responses:
     *       200:
     *         description: Document retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: doc_1234567890
     *                     title:
     *                       type: string
     *                       example: Annual Report 2025
     *                     description:
     *                       type: string
     *                       example: Company annual financial report
     *                     fileName:
     *                       type: string
     *                       example: annual-report.pdf
     *                     fileSize:
     *                       type: integer
     *                       example: 2457600
     *                     status:
     *                       type: string
     *                       example: processed
     *                     pageCount:
     *                       type: integer
     *                       example: 45
     *                     extractedText:
     *                       type: string
     *                       example: This is the extracted text from the PDF...
     *                     metadata:
     *                       type: object
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Document not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      '/:id',
      authMiddleware,
      quickCheckLimits, // ✅ NEW: Lighter rate limiting for CRUD
      validationMiddleware.validate(documentValidationSchemas.getById),
      documentController.getDocumentById
    );

    // ═══════════════════════════════════════════════════════
    // QUERY DOCUMENT(S)
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/query:
     *   post:
     *     summary: Query Documents with AI
     *     description: Ask questions about one or more documents using AI-powered search and retrieval
     *     tags: [Document]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - query
     *             properties:
     *               query:
     *                 type: string
     *                 example: What are the key financial highlights from Q4?
     *                 description: Natural language question about the document(s)
     *               documentIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 example: ["doc_1234567890", "doc_0987654321"]
     *                 description: Specific document IDs to query (optional, queries all if not provided)
     *               maxResults:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 10
     *                 default: 3
     *                 example: 3
     *                 description: Maximum number of relevant chunks to retrieve
     *     responses:
     *       200:
     *         description: Query processed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     answer:
     *                       type: string
     *                       example: The key financial highlights from Q4 include...
     *                     sources:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           documentId:
     *                             type: string
     *                             example: doc_1234567890
     *                           documentTitle:
     *                             type: string
     *                             example: Annual Report 2025
     *                           pageNumber:
     *                             type: integer
     *                             example: 12
     *                           relevanceScore:
     *                             type: number
     *                             example: 0.92
     *                           excerpt:
     *                             type: string
     *                             example: Revenue increased by 25% to $5.2M...
     *                     tokensUsed:
     *                       type: integer
     *                       example: 450
     *       400:
     *         description: Invalid query or parameters
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       429:
     *         description: Rate limit exceeded
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      '/query',
      authMiddleware,
      checkRateLimits, // ✅ NEW: Full rate limiting with token tracking
      validationMiddleware.validate(documentValidationSchemas.query),
      documentController.queryDocument
    );

    // ═══════════════════════════════════════════════════════
    // UPDATE DOCUMENT METADATA
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/{id}:
     *   patch:
     *     summary: Update Document
     *     description: Update document metadata (title, description, tags)
     *     tags: [Document]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           example: doc_1234567890
     *         description: Document ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: Updated Annual Report 2025
     *               description:
     *                 type: string
     *                 example: Updated description with more details
     *               tags:
     *                 type: array
     *                 items:
     *                   type: string
     *                 example: ["finance", "annual", "2025"]
     *     responses:
     *       200:
     *         description: Document updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Document updated successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: doc_1234567890
     *                     title:
     *                       type: string
     *                       example: Updated Annual Report 2025
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Invalid update data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Document not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.patch(
      '/:id',
      authMiddleware,
      quickCheckLimits, // ✅ NEW: Lighter rate limiting for CRUD
      validationMiddleware.validate(documentValidationSchemas.update),
      documentController.updateDocument
    );

    // ═══════════════════════════════════════════════════════
    // DELETE DOCUMENT
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/{id}:
     *   delete:
     *     summary: Delete Document
     *     description: Permanently delete a document and all associated data
     *     tags: [Document]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           example: doc_1234567890
     *         description: Document ID
     *     responses:
     *       200:
     *         description: Document deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Document deleted successfully
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Document not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.delete(
      '/:id',
      authMiddleware,
      quickCheckLimits, // ✅ NEW: Lighter rate limiting for CRUD
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