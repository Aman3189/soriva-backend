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
 * Developer: Amandeep, Punjab, India
 * Architecture: Class-based Singleton Pattern
 * Quality: 10/10 Production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ROUTES:
 * ✅ POST   /api/documents/upload                              - Upload document
 * ✅ GET    /api/documents/stats                               - Get user stats (BEFORE :id)
 * ✅ GET    /api/documents/intelligence/usage                  - Get intelligence usage stats
 * ✅ GET    /api/documents                                     - List documents
 * ✅ GET    /api/documents/:id                                 - Get document by ID
 * ✅ POST   /api/documents/query                               - Query document(s) with RAG
 * ✅ POST   /api/documents/:id/intelligence/operate            - Perform AI operation
 * ✅ GET    /api/documents/intelligence/operations/:operationId - Get operation result
 * ✅ GET    /api/documents/:id/intelligence/operations         - List document operations
 * ✅ PATCH  /api/documents/:id                                 - Update document
 * ✅ DELETE /api/documents/:id                                 - Delete document
 * 
 * 💳 SMART DOCS CREDIT ROUTES (NEW!):
 * ✅ GET    /api/documents/smart-docs/credits                  - Get credit balance
 * ✅ GET    /api/documents/smart-docs/summary                  - Get dashboard summary
 * ✅ GET    /api/documents/smart-docs/features                 - Get all features with status
 * ✅ POST   /api/documents/smart-docs/check-operation          - Check if operation allowed
 * ✅ GET    /api/documents/smart-docs/usage                    - Get usage statistics
 * ✅ GET    /api/documents/smart-docs/packs                    - Get available packs
 * ✅ POST   /api/documents/smart-docs/purchase-pack            - Purchase credit pack
 * ✅ GET    /api/documents/smart-docs/affordable               - Get affordable operations
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
    // GET INTELLIGENCE USAGE STATS
    // ⚠️ MUST BE BEFORE /:id ROUTE!
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/intelligence/usage:
     *   get:
     *     summary: Get Document Intelligence Usage Statistics
     *     description: Retrieve usage stats for AI operations (documents, operations, storage, costs)
     *     tags: [Document Intelligence]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Usage statistics retrieved successfully
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
     *                     period:
     *                       type: string
     *                       example: month
     *                     usage:
     *                       type: object
     *                       properties:
     *                         documents:
     *                           type: object
     *                           properties:
     *                             used:
     *                               type: integer
     *                               example: 15
     *                             limit:
     *                               type: integer
     *                               example: 50
     *                             percentage:
     *                               type: number
     *                               example: 30
     *                         operations:
     *                           type: object
     *                           properties:
     *                             used:
     *                               type: integer
     *                               example: 127
     *                             limit:
     *                               type: integer
     *                               example: 500
     *                             percentage:
     *                               type: number
     *                               example: 25.4
     *                         storage:
     *                           type: object
     *                           properties:
     *                             used:
     *                               type: integer
     *                               example: 52428800
     *                               description: Storage used in bytes
     *                             limit:
     *                               type: integer
     *                               example: 1073741824
     *                               description: Storage limit in bytes
     *                             percentage:
     *                               type: number
     *                               example: 4.88
     *                         cost:
     *                           type: object
     *                           properties:
     *                             thisMonth:
     *                               type: number
     *                               example: 2.45
     *                               description: Total cost this month in USD
     *                             average:
     *                               type: number
     *                               example: 1.89
     *                               description: Average monthly cost in USD
     *                     topOperations:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           type:
     *                             type: string
     *                             example: SUMMARIZE
     *                           count:
     *                             type: integer
     *                             example: 45
     *                           totalCost:
     *                             type: number
     *                             example: 0.89
     *                     recentDocuments:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             example: doc_1234567890
     *                           filename:
     *                             type: string
     *                             example: annual-report.pdf
     *                           uploadedAt:
     *                             type: string
     *                             format: date-time
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      '/intelligence/usage',
      authMiddleware,
      quickCheckLimits,
      documentController.getIntelligenceUsage
    );

    // ═══════════════════════════════════════════════════════
    // GET OPERATION RESULT BY ID
    // ⚠️ MUST BE BEFORE /:id ROUTE!
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/intelligence/operations/{operationId}:
     *   get:
     *     summary: Get Operation Result
     *     description: Retrieve details and results of a specific AI operation
     *     tags: [Document Intelligence]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: operationId
     *         required: true
     *         schema:
     *           type: string
     *           example: op_1234567890
     *         description: Operation ID
     *     responses:
     *       200:
     *         description: Operation result retrieved successfully
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
     *                       example: op_1234567890
     *                     operationType:
     *                       type: string
     *                       example: SUMMARIZE
     *                     operationName:
     *                       type: string
     *                       example: Document Summarization
     *                     status:
     *                       type: string
     *                       example: SUCCESS
     *                       enum: [PENDING, PROCESSING, SUCCESS, FAILED]
     *                     result:
     *                       type: object
     *                       description: Operation result (structure varies by operation type)
     *                     resultPreview:
     *                       type: string
     *                       example: This document discusses...
     *                     processingTime:
     *                       type: integer
     *                       example: 2341
     *                       description: Processing time in milliseconds
     *                     totalTokens:
     *                       type: integer
     *                       example: 1245
     *                     promptTokens:
     *                       type: integer
     *                       example: 845
     *                     completionTokens:
     *                       type: integer
     *                       example: 400
     *                     cost:
     *                       type: number
     *                       example: 0.025
     *                       description: Cost in USD
     *                     aiProvider:
     *                       type: string
     *                       example: gemini-1.5-flash
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     completedAt:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Operation not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      '/intelligence/operations/:operationId',
      authMiddleware,
      quickCheckLimits,
      documentController.getOperationResult
    );

    // ═══════════════════════════════════════════════════════════════
    // 💳 SMART DOCS CREDIT ROUTES (NEW!)
    // ⚠️ ALL MUST BE BEFORE /:id ROUTE!
    // ═══════════════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/smart-docs/credits:
     *   get:
     *     summary: Get Smart Docs Credit Balance
     *     description: Retrieve user's current Smart Docs credit balance, daily/monthly limits
     *     tags: [Smart Docs Credits]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Credit balance retrieved successfully
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
     *                     monthlyCredits:
     *                       type: integer
     *                       example: 100
     *                     creditsUsed:
     *                       type: integer
     *                       example: 35
     *                     creditsRemaining:
     *                       type: integer
     *                       example: 65
     *                     bonusCredits:
     *                       type: integer
     *                       example: 20
     *                     totalAvailable:
     *                       type: integer
     *                       example: 85
     *                     dailyLimit:
     *                       type: integer
     *                       example: 15
     *                     dailyRemaining:
     *                       type: integer
     *                       example: 12
     *                     percentageUsed:
     *                       type: number
     *                       example: 35
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/smart-docs/credits',
      authMiddleware,
      quickCheckLimits,
      documentController.getSmartDocsCredits
    );

    /**
     * @swagger
     * /api/documents/smart-docs/summary:
     *   get:
     *     summary: Get Smart Docs Dashboard Summary
     *     description: Complete dashboard data - credits, recent ops, packs, cycle info
     *     tags: [Smart Docs Credits]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Summary retrieved successfully
     */
    this.router.get(
      '/smart-docs/summary',
      authMiddleware,
      quickCheckLimits,
      documentController.getSmartDocsSummary
    );

    /**
     * @swagger
     * /api/documents/smart-docs/features:
     *   get:
     *     summary: Get All Smart Docs Features
     *     description: Get all 25 features with lock/unlock status based on plan & credits
     *     tags: [Smart Docs Credits]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Features retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     features:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                           name:
     *                             type: string
     *                           credits:
     *                             type: integer
     *                           tier:
     *                             type: integer
     *                           isLocked:
     *                             type: boolean
     *                           lockReason:
     *                             type: string
     *                     summary:
     *                       type: object
     *                       properties:
     *                         total:
     *                           type: integer
     *                           example: 25
     *                         unlocked:
     *                           type: integer
     *                           example: 13
     */
    this.router.get(
      '/smart-docs/features',
      authMiddleware,
      quickCheckLimits,
      documentController.getSmartDocsFeatures
    );

    /**
     * @swagger
     * /api/documents/smart-docs/check-operation:
     *   post:
     *     summary: Check if Operation is Allowed
     *     description: Pre-check if user can perform a specific Smart Docs operation
     *     tags: [Smart Docs Credits]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - operation
     *             properties:
     *               operation:
     *                 type: string
     *                 example: SUMMARIZE
     *     responses:
     *       200:
     *         description: Check completed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     canProceed:
     *                       type: boolean
     *                     creditsRequired:
     *                       type: integer
     *                     creditsAvailable:
     *                       type: integer
     *                     error:
     *                       type: string
     */
    this.router.post(
      '/smart-docs/check-operation',
      authMiddleware,
      quickCheckLimits,
      documentController.checkSmartDocsOperation
    );

    /**
     * @swagger
     * /api/documents/smart-docs/usage:
     *   get:
     *     summary: Get Smart Docs Usage Statistics
     *     description: Get detailed usage analytics - operations breakdown, daily usage
     *     tags: [Smart Docs Credits]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: period
     *         schema:
     *           type: string
     *           enum: [day, week, month]
     *           default: month
     *     responses:
     *       200:
     *         description: Usage stats retrieved
     */
    this.router.get(
      '/smart-docs/usage',
      authMiddleware,
      quickCheckLimits,
      documentController.getSmartDocsUsage
    );

    /**
     * @swagger
     * /api/documents/smart-docs/packs:
     *   get:
     *     summary: Get Available Credit Packs
     *     description: Get available standalone credit packs for purchase
     *     tags: [Smart Docs Credits]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Packs retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     available:
     *                       type: boolean
     *                     reason:
     *                       type: string
     *                     packs:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                           name:
     *                             type: string
     *                           credits:
     *                             type: integer
     *                           price:
     *                             type: number
     *                           canPurchase:
     *                             type: boolean
     *                     region:
     *                       type: string
     *                       enum: [IN, INTL]
     */
    this.router.get(
      '/smart-docs/packs',
      authMiddleware,
      quickCheckLimits,
      documentController.getSmartDocsPacks
    );

    /**
     * @swagger
     * /api/documents/smart-docs/purchase-pack:
     *   post:
     *     summary: Purchase Credit Pack
     *     description: Purchase a standalone credit pack
     *     tags: [Smart Docs Credits]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - packId
     *             properties:
     *               packId:
     *                 type: string
     *                 example: SMART_DOCS_STARTER
     *     responses:
     *       200:
     *         description: Pack purchased successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     packId:
     *                       type: string
     *                     creditsAdded:
     *                       type: integer
     *                     newBalance:
     *                       type: object
     */
    this.router.post(
      '/smart-docs/purchase-pack',
      authMiddleware,
      checkRateLimits, // Stricter rate limit for purchases
      documentController.purchaseSmartDocsPack
    );

    /**
     * @swagger
     * /api/documents/smart-docs/affordable:
     *   get:
     *     summary: Get Affordable Operations
     *     description: Get list of operations user can currently afford
     *     tags: [Smart Docs Credits]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Affordable operations list
     */
    this.router.get(
      '/smart-docs/affordable',
      authMiddleware,
      quickCheckLimits,
      documentController.getAffordableSmartDocsOps
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
    // GET DOCUMENT OPERATIONS
    // ⚠️ MUST BE AFTER /:id BUT BEFORE OTHER :id ROUTES
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/{id}/intelligence/operations:
     *   get:
     *     summary: List Document Operations
     *     description: Get all AI operations performed on a specific document
     *     tags: [Document Intelligence]
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
     *         description: Operations retrieved successfully
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
     *                     documentId:
     *                       type: string
     *                       example: doc_1234567890
     *                     operations:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             example: op_1234567890
     *                           operationType:
     *                             type: string
     *                             example: SUMMARIZE
     *                           operationName:
     *                             type: string
     *                             example: Document Summarization
     *                           status:
     *                             type: string
     *                             example: SUCCESS
     *                           resultPreview:
     *                             type: string
     *                             example: This document discusses...
     *                           processingTime:
     *                             type: integer
     *                             example: 2341
     *                           totalTokens:
     *                             type: integer
     *                             example: 1245
     *                           cost:
     *                             type: number
     *                             example: 0.025
     *                           createdAt:
     *                             type: string
     *                             format: date-time
     *                     total:
     *                       type: integer
     *                       example: 12
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
      '/:id/intelligence/operations',
      authMiddleware,
      quickCheckLimits,
      documentController.getDocumentOperations
    );

    // ═══════════════════════════════════════════════════════
    // PERFORM INTELLIGENCE OPERATION
    // ═══════════════════════════════════════════════════════

    /**
     * @swagger
     * /api/documents/{id}/intelligence/operate:
     *   post:
     *     summary: Perform AI Operation
     *     description: Execute AI operation on document (summarize, translate, extract, etc.)
     *     tags: [Document Intelligence]
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
     *             required:
     *               - operationType
     *             properties:
     *               operationType:
     *                 type: string
     *                 enum:
     *                   - SUMMARIZE
     *                   - TRANSLATE
     *                   - EXTRACT_ENTITIES
     *                   - EXTRACT_KEYWORDS
     *                   - EXTRACT_DATES
     *                   - EXTRACT_NUMBERS
     *                   - EXTRACT_CONTACTS
     *                   - SENTIMENT_ANALYSIS
     *                   - CATEGORIZE
     *                   - GENERATE_TITLE
     *                   - GENERATE_DESCRIPTION
     *                   - EXTRACT_QUESTIONS
     *                   - EXTRACT_ACTION_ITEMS
     *                   - TABLE_EXTRACTION
     *                   - CHART_ANALYSIS
     *                   - COMPLIANCE_CHECK
     *                   - READABILITY_ANALYSIS
     *                   - LANGUAGE_DETECTION
     *                   - FACT_CHECK
     *                   - PLAGIARISM_CHECK
     *                   - GENERATE_QUIZ
     *                   - COMPARE_DOCUMENTS
     *                   - TREND_ANALYSIS
     *                   - RISK_ASSESSMENT
     *                 example: SUMMARIZE
     *                 description: Type of AI operation to perform
     *               options:
     *                 type: object
     *                 description: Operation-specific options
     *                 properties:
     *                   length:
     *                     type: string
     *                     enum: [short, medium, long]
     *                     example: medium
     *                     description: For SUMMARIZE - summary length
     *                   targetLanguage:
     *                     type: string
     *                     example: hi
     *                     description: For TRANSLATE - target language code
     *                   categories:
     *                     type: array
     *                     items:
     *                       type: string
     *                     example: [finance, legal, technical]
     *                     description: For CATEGORIZE - possible categories
     *                   temperature:
     *                     type: number
     *                     minimum: 0
     *                     maximum: 2
     *                     example: 0.7
     *                     description: AI temperature for creativity
     *     responses:
     *       200:
     *         description: Operation completed successfully
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
     *                     operation:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                           example: op_1234567890
     *                         operationType:
     *                           type: string
     *                           example: SUMMARIZE
     *                         status:
     *                           type: string
     *                           example: SUCCESS
     *                         tokensUsed:
     *                           type: integer
     *                           example: 1245
     *                         cost:
     *                           type: number
     *                           example: 0.025
     *                         processingTime:
     *                           type: integer
     *                           example: 2341
     *                         aiProvider:
     *                           type: string
     *                           example: gemini-1.5-flash
     *                     result:
     *                       type: object
     *                       description: Operation result (varies by operation type)
     *       400:
     *         description: Invalid operation or document not ready
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
     *       403:
     *         description: Operation limit exceeded
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
    this.router.post(
      '/:id/intelligence/operate',
      authMiddleware,
      checkRateLimits,
      documentController.performIntelligenceOperation
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