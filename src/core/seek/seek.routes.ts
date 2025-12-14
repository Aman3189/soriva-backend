/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEEK ROUTES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Define Soriva Seek API routes
 * 
 * Routes:
 * - POST /api/seek/search     - Main AI search
 * - GET  /api/seek/trending   - Trending searches (no auth)
 * - GET  /api/seek/stats      - User's search stats
 * - GET  /api/seek/modes      - Available search modes (no auth)
 * - GET  /api/seek/limits     - User's search limits
 * - GET  /api/seek/health     - Health check (no auth)
 * 
 * Author: Risenex Global
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Router } from 'express';
import SeekController from './seek.controller';
import { authMiddleware as authenticate } from '../../modules/auth/middleware/auth.middleware';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTER INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SEARCH ROUTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/seek/search
 * Main AI-powered search endpoint
 * 
 * Body: { query: string, mode?: 'quick' | 'deep' | 'research' }
 * Response: { success, data: { summary, sources, relatedQuestions }, meta, limits }
 */
router.post(
  '/search',
  authenticate,
  SeekController.search.bind(SeekController)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INFORMATION ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/seek/trending
 * Get trending searches (no auth required)
 * 
 * Response: { success, trending: string[] }
 */
router.get(
  '/trending',
  SeekController.getTrending.bind(SeekController)
);

/**
 * GET /api/seek/modes
 * Get available search modes (no auth required)
 * 
 * Response: { success, modes, default }
 */
router.get(
  '/modes',
  SeekController.getModes.bind(SeekController)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER-SPECIFIC ROUTES (Auth Required)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/seek/stats
 * Get user's search statistics
 * 
 * Response: { success, stats }
 */
router.get(
  '/stats',
  authenticate,
  SeekController.getStats.bind(SeekController)
);

/**
 * GET /api/seek/limits
 * Get user's search limits
 * 
 * Response: { success, limits, message }
 */
router.get(
  '/limits',
  authenticate,
  SeekController.getLimits.bind(SeekController)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/seek/health
 * Seek service health check (no auth required)
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Soriva Seek',
    description: 'AI-powered search engine',
    status: 'operational',
    version: '1.0.0',
    features: [
      'Google Custom Search integration',
      'AI-powered summarization',
      'Multi-mode search (Quick/Deep/Research)',
      'Hinglish support',
      'Related questions',
      'Source citations',
    ],
    limits: {
      STARTER: 'No access',
      PLUS: '10 searches/month',
      PRO: '30 searches/month',
      APEX: '50 searches/month',
    }
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;