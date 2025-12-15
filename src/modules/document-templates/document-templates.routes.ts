// src/modules/document-templates/document-templates.routes.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * SORIVA DOCUMENT TEMPLATES - ROUTES
 * ═══════════════════════════════════════════════════════════════
 * 
 * API Routes for document template operations
 * Base path: /api/document-templates
 * 
 * Created by: Risenex Global
 * ═══════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { documentTemplatesController } from './document-templates.controller';
import { authMiddleware } from '../auth/middleware/auth.middleware';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES (No auth required)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/document-templates/stats
 * Get template statistics (public)
 */
router.get('/stats', documentTemplatesController.getStats.bind(documentTemplatesController));

// ═══════════════════════════════════════════════════════════════
// PROTECTED ROUTES (Auth required)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/document-templates
 * List all templates for user's plan
 */
router.get(
  '/',
  authMiddleware,
  documentTemplatesController.listTemplates.bind(documentTemplatesController)
);

/**
 * GET /api/document-templates/categories
 * Get templates grouped by category
 */
router.get(
  '/categories',
  authMiddleware,
  documentTemplatesController.getByCategory.bind(documentTemplatesController)
);

/**
 * GET /api/document-templates/session/:sessionId
 * Get session progress
 */
router.get(
  '/session/:sessionId',
  authMiddleware,
  documentTemplatesController.getSession.bind(documentTemplatesController)
);

/**
 * GET /api/document-templates/download/:fileName
 * Download generated document
 */
router.get(
  '/download/:fileName',
  authMiddleware,
  documentTemplatesController.downloadDocument.bind(documentTemplatesController)
);

/**
 * GET /api/document-templates/:templateId
 * Get single template details
 * NOTE: Must be after other GET routes to avoid conflicts
 */
router.get(
  '/:templateId',
  authMiddleware,
  documentTemplatesController.getTemplate.bind(documentTemplatesController)
);

/**
 * POST /api/document-templates/start
 * Start a new document generation session
 */
router.post(
  '/start',
  authMiddleware,
  documentTemplatesController.startDocument.bind(documentTemplatesController)
);

/**
 * POST /api/document-templates/submit-field
 * Submit data for a single field
 */
router.post(
  '/submit-field',
  authMiddleware,
  documentTemplatesController.submitField.bind(documentTemplatesController)
);

/**
 * POST /api/document-templates/skip-field
 * Skip an optional field
 */
router.post(
  '/skip-field',
  authMiddleware,
  documentTemplatesController.skipField.bind(documentTemplatesController)
);

/**
 * POST /api/document-templates/generate
 * Generate the final document
 */
router.post(
  '/generate',
  authMiddleware,
  documentTemplatesController.generateDocument.bind(documentTemplatesController)
);

/**
 * POST /api/document-templates/quick-generate
 * Generate document with all data at once
 */
router.post(
  '/quick-generate',
  authMiddleware,
  documentTemplatesController.quickGenerate.bind(documentTemplatesController)
);

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export default router;