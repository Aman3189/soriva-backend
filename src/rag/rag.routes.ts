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
     * Health Check
     * GET /api/rag/health
     * Public endpoint for monitoring system health
     */
    this.router.get('/health', this.controller.getHealthStatus);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PROTECTED ROUTES (Authentication Required)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Upload Document
     * POST /api/rag/upload
     * Upload and process a document for RAG
     *
     * ✅ NOW WITH MULTER MIDDLEWARE!
     */
    this.router.post(
      '/upload',
      adminMiddleware.authenticate,
      upload.single('file'), // ✅ ADDED THIS - Handles file upload
      this.controller.uploadDocument
    );

    /**
     * Query Documents
     * POST /api/rag/query
     * Search through user's documents using semantic search
     */
    this.router.post('/query', adminMiddleware.authenticate, this.controller.queryDocuments);

    /**
     * Get User Documents
     * GET /api/rag/documents
     * Retrieve all documents belonging to the authenticated user
     */
    this.router.get('/documents', adminMiddleware.authenticate, this.controller.getUserDocuments);

    /**
     * Get Document By ID
     * GET /api/rag/documents/:id
     * Retrieve a specific document by its ID
     */
    this.router.get(
      '/documents/:id',
      adminMiddleware.authenticate,
      this.controller.getDocumentById
    );

    /**
     * Delete Document
     * DELETE /api/rag/documents/:id
     * Delete a document and its associated chunks/embeddings
     */
    this.router.delete(
      '/documents/:id',
      adminMiddleware.authenticate,
      this.controller.deleteDocument
    );

    /**
     * Get Document Statistics
     * GET /api/rag/stats
     * Get statistics about user's documents
     */
    this.router.get('/stats', adminMiddleware.authenticate, this.controller.getDocumentStats);

    /**
     * Get RAG Configuration
     * GET /api/rag/config
     * Get current RAG system configuration
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
