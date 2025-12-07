// src/modules/forge/forge.routes.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔥 SORIVA FORGE - ROUTES
 * ═══════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { forgeController } from './forge.controller';
import { authMiddleware } from '../auth/middleware/auth.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

// Get shared forge by token
router.get('/shared/:token', forgeController.getByShareToken);

// Track copy/download (public for shared forges)
router.post('/:id/copy', forgeController.trackCopy);
router.post('/:id/download', forgeController.trackDownload);

// ============================================
// PROTECTED ROUTES (Auth Required)
// ============================================

router.use(authMiddleware);

// CRUD Operations
router.post('/', forgeController.create);
router.get('/', forgeController.list);
router.get('/stats', forgeController.getStats);
router.get('/:id', forgeController.getById);
router.patch('/:id', forgeController.update);
router.delete('/:id', forgeController.delete);

// Share Management
router.post('/:id/share', forgeController.generateShareLink);
router.delete('/:id/share', forgeController.revokeShareLink);

export default router;