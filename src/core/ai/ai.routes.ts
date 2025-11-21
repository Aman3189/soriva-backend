/**
 * SORIVA AI ROUTES
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: API route definitions for AI endpoints
 */
import { Router, Request, Response, NextFunction } from 'express';
import { aiController } from './ai.controller';

// ✅ IMPORT AUTH MIDDLEWARE
import { authMiddleware } from '../../modules/auth/middleware/auth.middleware';
import { checkRateLimits } from '../../middleware/rateLimiter.middleware';


const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUBLIC ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/ai/health:
 *   get:
 *     summary: AI Service Health Check
 *     description: Check the health status of all AI providers (Anthropic, OpenAI, Groq, Google)
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Health status retrieved successfully
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
 *                   example: AI Service is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     providers:
 *                       type: object
 *                       properties:
 *                         anthropic:
 *                           type: string
 *                           example: healthy
 *                         openai:
 *                           type: string
 *                           example: healthy
 *                         groq:
 *                           type: string
 *                           example: healthy
 *                         google:
 *                           type: string
 *                           example: healthy
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-30T00:00:00Z
 *       500:
 *         description: Service health check failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/health', (req: Request, res: Response, next: NextFunction) => {
  aiController.health(req, res);
});

/**
 * @swagger
 * /api/ai/tiers:
 *   get:
 *     summary: Get Subscription Tiers
 *     description: Retrieve available subscription tiers with their AI capabilities and limits
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Subscription tiers retrieved successfully
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
 *                     tiers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: PLUS
 *                           displayName:
 *                             type: string
 *                             example: Soriva Plus
 *                           price:
 *                             type: number
 *                             example: 149
 *                           provider:
 *                             type: string
 *                             example: groq
 *                           model:
 *                             type: string
 *                             example: llama-3.3-70b-versatile
 *                           features:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Fast responses", "Basic AI chat", "5000 messages/month"]
 *       500:
 *         description: Failed to retrieve tiers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/tiers', (req: Request, res: Response, next: NextFunction) => {
  aiController.getTiers(req, res);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROTECTED ROUTES (✅ WITH AUTHENTICATION)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Send Chat Message
 *     description: Send a chat message to AI (non-streaming response)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: Hello, how are you?
 *                 description: User's message to AI
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                       example: user
 *                     content:
 *                       type: string
 *                       example: Previous message
 *                 description: Optional conversation history for context
 *               temperature:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 2
 *                 default: 0.7
 *                 example: 0.7
 *                 description: Controls randomness (0 = focused, 2 = creative)
 *               maxTokens:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8192
 *                 default: 2048
 *                 example: 2048
 *                 description: Maximum tokens in response
 *     responses:
 *       200:
 *         description: Chat response generated successfully
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
 *                     response:
 *                       type: string
 *                       example: Hello! I'm doing well, thank you for asking. How can I help you today?
 *                     provider:
 *                       type: string
 *                       example: groq
 *                     model:
 *                       type: string
 *                       example: llama-3.3-70b-versatile
 *                     tokensUsed:
 *                       type: integer
 *                       example: 45
 *                     tier:
 *                       type: string
 *                       example: PLUS
 *       400:
 *         description: Invalid request - missing message or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *       500:
 *         description: AI service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/chat', authMiddleware, checkRateLimits, (req: Request, res: Response, next: NextFunction) => {
  aiController.chat(req as any, res, next);
});

/**
 * @swagger
 * /api/ai/chat/stream:
 *   post:
 *     summary: Stream Chat Message
 *     description: Stream a chat message response using Server-Sent Events (SSE)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: Tell me a story about space exploration
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *               temperature:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 2
 *                 default: 0.7
 *                 example: 0.7
 *               maxTokens:
 *                 type: integer
 *                 default: 2048
 *                 example: 2048
 *     responses:
 *       200:
 *         description: SSE stream of chat response chunks
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: {"chunk": "Once", "done": false}
 *                 data: {"chunk": " upon", "done": false}
 *                 data: {"chunk": " a time...", "done": false}
 *                 data: {"done": true, "tokensUsed": 150}
 *       400:
 *         description: Invalid request
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
router.post('/chat/stream', authMiddleware, checkRateLimits, (req: Request, res: Response, next: NextFunction) => {
  aiController.streamChat(req as any, res, next);
});

/**
 * @swagger
 * /api/ai/suggestions:
 *   get:
 *     summary: Get Conversation Suggestions
 *     description: Generate smart conversation suggestions based on context
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: context
 *         required: true
 *         schema:
 *           type: string
 *           example: We were discussing machine learning basics
 *         description: Conversation context for generating suggestions
 *     responses:
 *       200:
 *         description: Suggestions generated successfully
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
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - "What are the different types of machine learning?"
 *                         - "Can you explain neural networks?"
 *                         - "What's the difference between supervised and unsupervised learning?"
 *                     context:
 *                       type: string
 *                       example: We were discussing machine learning basics
 *       400:
 *         description: Missing or invalid context parameter
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
router.get('/suggestions', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  aiController.getSuggestions(req as any, res, next);
});

/**
 * @swagger
 * /api/ai/stats:
 *   get:
 *     summary: Get AI Service Statistics
 *     description: Retrieve AI service usage statistics and metrics (Admin only)
 *     tags: [AI]
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
 *                     totalRequests:
 *                       type: integer
 *                       example: 15420
 *                     totalTokens:
 *                       type: integer
 *                       example: 1245600
 *                     providerStats:
 *                       type: object
 *                       properties:
 *                         anthropic:
 *                           type: object
 *                           properties:
 *                             requests:
 *                               type: integer
 *                               example: 3500
 *                             tokens:
 *                               type: integer
 *                               example: 425000
 *                         groq:
 *                           type: object
 *                           properties:
 *                             requests:
 *                               type: integer
 *                               example: 8200
 *                             tokens:
 *                               type: integer
 *                               example: 620000
 *                     averageResponseTime:
 *                       type: number
 *                       example: 1.25
 *                       description: Average response time in seconds
 *                     uptime:
 *                       type: string
 *                       example: 99.8%
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  aiController.getStats(req, res, next);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ROUTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;