/**
 * SORIVA AI ROUTES
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: API route definitions for AI endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import { aiController } from './ai.controller';

// Import your auth middleware (example)
// import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUBLIC ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/ai/health
 * Health check for AI providers
 */
router.get('/health', (req: Request, res: Response, next: NextFunction) => {
  aiController.health(req, res);
});

/**
 * GET /api/ai/tiers
 * Get available subscription tiers
 */
router.get('/tiers', (req: Request, res: Response, next: NextFunction) => {
  aiController.getTiers(req, res);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROTECTED ROUTES (Require Authentication)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// If you have auth middleware, use it like this:
// router.use(authenticate);

/**
 * POST /api/ai/chat
 * Send a chat message (non-streaming)
 *
 * Request Body:
 * {
 *   "message": "Hello, how are you?",
 *   "conversationHistory": [...], // optional
 *   "temperature": 0.7,            // optional
 *   "maxTokens": 2048              // optional
 * }
 */
router.post('/chat', (req: Request, res: Response, next: NextFunction) => {
  aiController.chat(req as any, res, next);
});

/**
 * POST /api/ai/chat/stream
 * Stream a chat message (Server-Sent Events)
 *
 * Request Body: Same as /chat
 * Response: SSE stream with chunks
 */
router.post('/chat/stream', (req: Request, res: Response, next: NextFunction) => {
  aiController.streamChat(req as any, res, next);
});

/**
 * GET /api/ai/suggestions
 * Get conversation suggestions
 *
 * Query Parameters:
 * - context: string (required)
 */
router.get('/suggestions', (req: Request, res: Response, next: NextFunction) => {
  aiController.getSuggestions(req as any, res, next);
});

/**
 * GET /api/ai/stats
 * Get service statistics (admin only)
 *
 * Note: Add admin middleware if needed
 */
router.get('/stats', (req: Request, res: Response, next: NextFunction) => {
  aiController.getStats(req, res, next);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ROUTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;
