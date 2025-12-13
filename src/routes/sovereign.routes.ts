/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SOVEREIGN ACCESS ROUTES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Router } from 'express';
import SovereignController from '@controllers/sovereign.controller';
import { authMiddleware } from '@modules/auth/middleware/auth.middleware';

const router = Router();

// POST /api/auth/sovereign-access
router.post('/sovereign-access', authMiddleware, SovereignController.activateSovereign);

// GET /api/auth/sovereign-status
router.get('/sovereign-status', authMiddleware, SovereignController.checkSovereignStatus);

export default router;