// src/routes/rag.routes.ts
// SORIVA Backend - RAG Routes (Ultimate Edition)
// Phase 3: Complete RAG API Routes - 10/10 Production Quality
// 100% Dynamic | Modular | Secured | Request Tracking | Middleware-Ready

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { RAGController, requestContextMiddleware } from '../rag/controllers/rag.controller';
import adminMiddleware from '../core/ai/middlewares/admin.middleware';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MULTER CONFIGURATION FOR FILE UPLOADS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.'));
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RAG ROUTER CONFIGURATION (10/10 Quality)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class RAGRouter {
  private static instance: RAGRouter;
  public router: Router;
  private controller: RAGController;

  private constructor() {
    this.router = Router();
    this.controller = RAGController.getInstance();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RAGRouter {
    if (!RAGRouter.instance) {
      RAGRouter.instance = new RAGRouter();
    }
    return RAGRouter.instance;
  }

  /**
   * Initialize global middleware for all RAG routes
   */
  private initializeMiddleware(): void {
    // Request context middleware (adds requestId to all requests)
    this.router.use(requestContextMiddleware);
  }

  /**
   * Initialize all RAG routes
   */
  private initializeRoutes(): void {
    console.log('🔗 Initializing RAG Routes...');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PUBLIC ROUTES (No Authentication Required)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * @swagger
     * /api/rag/health:
     *   get:
     *     summary: RAG System Health Check
     *     description: Check the health and status of the RAG (Retrieval Augmented Generation) system
     *     tags: [RAG]
     *     responses:
     *       200:
     *         description: RAG system is healthy
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
     *                   example: RAG system is healthy
     *                 data:
     *                   type: object
     *                   properties:
     *                     status:
     *                       type: string
     *                       example: operational
     *                     vectorStore:
     *                       type: string
     *                       example: connected
     *                     embeddingService:
     *                       type: string
     *                       example: active
     *                     timestamp:
     *                       type: string
     *                       format: date-time
     *       500:
     *         description: RAG system health check failed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/health', this.controller.getHealthStatus);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PROTECTED ROUTES (Authentication Required)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * @swagger
     * /api/rag/upload:
     *   post:
     *     summary: Upload Document for RAG
     *     description: Upload a document (PDF, DOC, DOCX, TXT, MD) to be processed and indexed for RAG queries
     *     tags: [RAG]
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
     *                 description: Document file (PDF, DOC, DOCX, TXT, MD) - Max 10MB
     *               title:
     *                 type: string
     *                 example: Company Knowledge Base
     *                 description: Optional custom title for the document
     *               metadata:
     *                 type: object
     *                 description: Optional metadata as JSON
     *     responses:
     *       201:
     *         description: Document uploaded and processing started
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
     *                     documentId:
     *                       type: string
     *                       example: rag_doc_1234567890
     *                     fileName:
     *                       type: string
     *                       example: knowledge-base.pdf
     *                     fileSize:
     *                       type: integer
     *                       example: 1048576
     *                     status:
     *                       type: string
     *                       example: processing
     *                     uploadedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Invalid file type or missing file
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
     *         description: File too large (max 10MB)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      '/upload',
      adminMiddleware.authenticate,
      upload.single('file'),
      this.controller.uploadDocument
    );

    /**
     * @swagger
     * /api/rag/query:
     *   post:
     *     summary: Query Documents with RAG
     *     description: Perform semantic search across user's documents using RAG and get AI-powered answers
     *     tags: [RAG]
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
     *                 example: What are the key features of our product?
     *                 description: Natural language question to search for
     *               documentIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 example: ["rag_doc_123", "rag_doc_456"]
     *                 description: Optional array of specific document IDs to search in
     *               topK:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 20
     *                 default: 5
     *                 example: 5
     *                 description: Number of top results to retrieve
     *               includeMetadata:
     *                 type: boolean
     *                 default: true
     *                 example: true
     *                 description: Include document metadata in results
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
     *                       example: Our product features include AI-powered search, real-time collaboration...
     *                     results:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           documentId:
     *                             type: string
     *                             example: rag_doc_123
     *                           chunkId:
     *                             type: string
     *                             example: chunk_789
     *                           content:
     *                             type: string
     *                             example: The main features of the product are...
     *                           score:
     *                             type: number
     *                             example: 0.89
     *                             description: Relevance score (0-1)
     *                           metadata:
     *                             type: object
     *                     tokensUsed:
     *                       type: integer
     *                       example: 320
     *       400:
     *         description: Invalid query parameters
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
     */
    this.router.post('/query', adminMiddleware.authenticate, this.controller.queryDocuments);

    /**
     * @swagger
     * /api/rag/documents:
     *   get:
     *     summary: Get All RAG Documents
     *     description: Retrieve all documents uploaded by the user for RAG
     *     tags: [RAG]
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
     *         name: status
     *         schema:
     *           type: string
     *           enum: [processing, indexed, failed]
     *           example: indexed
     *         description: Filter by processing status
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
     *                             example: rag_doc_123
     *                           title:
     *                             type: string
     *                             example: Company Knowledge Base
     *                           fileName:
     *                             type: string
     *                             example: knowledge-base.pdf
     *                           fileSize:
     *                             type: integer
     *                             example: 1048576
     *                           status:
     *                             type: string
     *                             example: indexed
     *                           chunksCount:
     *                             type: integer
     *                             example: 45
     *                           uploadedAt:
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
     *                           example: 8
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
    this.router.get('/documents', adminMiddleware.authenticate, this.controller.getUserDocuments);

    /**
     * @swagger
     * /api/rag/documents/{id}:
     *   get:
     *     summary: Get RAG Document by ID
     *     description: Retrieve detailed information about a specific RAG document
     *     tags: [RAG]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           example: rag_doc_123
     *         description: RAG Document ID
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
     *                       example: rag_doc_123
     *                     title:
     *                       type: string
     *                       example: Company Knowledge Base
     *                     fileName:
     *                       type: string
     *                       example: knowledge-base.pdf
     *                     fileSize:
     *                       type: integer
     *                       example: 1048576
     *                     status:
     *                       type: string
     *                       example: indexed
     *                     chunks:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             example: chunk_789
     *                           content:
     *                             type: string
     *                             example: This section discusses...
     *                           pageNumber:
     *                             type: integer
     *                             example: 5
     *                     metadata:
     *                       type: object
     *                     uploadedAt:
     *                       type: string
     *                       format: date-time
     *                     processedAt:
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
      '/documents/:id',
      adminMiddleware.authenticate,
      this.controller.getDocumentById
    );

    /**
     * @swagger
     * /api/rag/documents/{id}:
     *   delete:
     *     summary: Delete RAG Document
     *     description: Delete a RAG document and all its associated chunks and embeddings
     *     tags: [RAG]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           example: rag_doc_123
     *         description: RAG Document ID
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
     *                   example: Document and all associated data deleted successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     deletedChunks:
     *                       type: integer
     *                       example: 45
     *                     freedStorage:
     *                       type: integer
     *                       example: 1048576
     *                       description: Storage freed in bytes
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
      '/documents/:id',
      adminMiddleware.authenticate,
      this.controller.deleteDocument
    );

    /**
     * @swagger
     * /api/rag/stats:
     *   get:
     *     summary: Get RAG Statistics
     *     description: Get statistics about user's RAG documents and usage
     *     tags: [RAG]
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
     *                       example: 8
     *                     totalChunks:
     *                       type: integer
     *                       example: 340
     *                     totalStorage:
     *                       type: integer
     *                       example: 8388608
     *                       description: Total storage in bytes
     *                     storageFormatted:
     *                       type: string
     *                       example: 8 MB
     *                     byStatus:
     *                       type: object
     *                       properties:
     *                         indexed:
     *                           type: integer
     *                           example: 6
     *                         processing:
     *                           type: integer
     *                           example: 1
     *                         failed:
     *                           type: integer
     *                           example: 1
     *                     queriesThisMonth:
     *                       type: integer
     *                       example: 127
     *                     averageQueryTime:
     *                       type: number
     *                       example: 0.85
     *                       description: Average query time in seconds
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/stats', adminMiddleware.authenticate, this.controller.getDocumentStats);

    /**
     * @swagger
     * /api/rag/config:
     *   get:
     *     summary: Get RAG Configuration
     *     description: Get current RAG system configuration and settings
     *     tags: [RAG]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Configuration retrieved successfully
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
     *                     embeddingModel:
     *                       type: string
     *                       example: text-embedding-ada-002
     *                     chunkSize:
     *                       type: integer
     *                       example: 1000
     *                     chunkOverlap:
     *                       type: integer
     *                       example: 200
     *                     vectorStore:
     *                       type: string
     *                       example: pinecone
     *                     maxDocumentSize:
     *                       type: integer
     *                       example: 10485760
     *                       description: Max file size in bytes
     *                     supportedFileTypes:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["pdf", "doc", "docx", "txt", "md"]
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/config', adminMiddleware.authenticate, this.controller.getConfiguration);

    console.log('✅ RAG Routes initialized successfully');
    this.logRoutes();
  }

  /**
   * Log registered routes (for debugging & monitoring)
   */
  private logRoutes(): void {
    console.log('\n📋 Registered RAG Routes:');
    console.log('   ═══════════════════════════════════════════════════════');
    console.log('   🌐 Public:');
    console.log('      GET    /api/rag/health');
    console.log('   ═══════════════════════════════════════════════════════');
    console.log('   🔒 Protected (Auth Required):');
    console.log('      POST   /api/rag/upload');
    console.log('      POST   /api/rag/query');
    console.log('      GET    /api/rag/documents');
    console.log('      GET    /api/rag/documents/:id');
    console.log('      DELETE /api/rag/documents/:id');
    console.log('      GET    /api/rag/stats');
    console.log('      GET    /api/rag/config');
    console.log('   ═══════════════════════════════════════════════════════\n');
  }

  /**
   * Get router instance
   */
  public getRouter(): Router {
    return this.router;
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT ROUTER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export default RAGRouter.getInstance().getRouter();