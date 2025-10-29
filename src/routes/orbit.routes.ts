/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ORBIT ROUTES
 * "Where every idea finds its gravity"
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Router } from 'express';
import * as orbitController from '../controllers/orbit.controller';
import { AuthMiddleware } from '../modules/auth/auth.middleware';

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALL ROUTES REQUIRE AUTHENTICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.use(AuthMiddleware.authenticate);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORBIT MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/orbit/limits
 * Get orbit limits for user's plan
 */
router.get('/limits', orbitController.getLimits);

/**
 * GET /api/orbit
 * Get all orbits for authenticated user
 */
router.get('/', orbitController.getAllOrbits);

/**
 * POST /api/orbit
 * Create new orbit
 * Body: { name, description?, icon?, color? }
 */
router.post('/', orbitController.createOrbit);

/**
 * GET /api/orbit/:id
 * Get single orbit by ID
 */
router.get('/:id', orbitController.getOrbitById);

/**
 * PATCH /api/orbit/:id
 * Update orbit
 * Body: { name?, description?, icon?, color?, isPinned? }
 */
router.patch('/:id', orbitController.updateOrbit);

/**
 * DELETE /api/orbit/:id
 * Delete orbit (cannot delete default orbit)
 */
router.delete('/:id', orbitController.deleteOrbit);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVERSATION MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/orbit/:id/conversations
 * Get all conversations in orbit
 */
router.get('/:id/conversations', orbitController.getConversations);

/**
 * POST /api/orbit/:id/conversations
 * Add conversation to orbit
 * Body: { conversationId, isPinned? }
 */
router.post('/:id/conversations', orbitController.addConversation);

/**
 * DELETE /api/orbit/:id/conversations/:conversationId
 * Remove conversation from orbit
 */
router.delete('/:id/conversations/:conversationId', orbitController.removeConversation);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAG MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/orbit/:id/tags
 * Get all tags for orbit
 */
router.get('/:id/tags', orbitController.getTags);

/**
 * POST /api/orbit/:id/tags
 * Create tag in orbit
 * Body: { name, color? }
 */
router.post('/:id/tags', orbitController.createTag);

/**
 * DELETE /api/orbit/tags/:tagId
 * Delete tag
 */
router.delete('/tags/:tagId', orbitController.deleteTag);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ROUTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;
