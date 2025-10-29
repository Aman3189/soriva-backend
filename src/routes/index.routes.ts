// src/routes/index.routes.ts
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import billingRoutes from '../modules/billing/billing.routes';
import ragRoutes from '../rag/rag.routes'; // ← RAG System Routes
import aiRoutes from '../core/ai/ai.routes'; // ← AI Routes
import orbitRoutes from '../modules/orbit/orbit.routes'; // ← NEW: Orbit Routes
// import chatRoutes from '../modules/chat/chat.routes'; // ← UNCOMMENTED!

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     description: Check if the Soriva Backend API is running and all services are active
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and running
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
 *                   example: Soriva Lumos Backend is running! 🚀
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 services:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: active
 *                     billing:
 *                       type: string
 *                       example: active
 *                     rag:
 *                       type: string
 *                       example: active
 *                     ai:
 *                       type: string
 *                       example: active
 *                     orbit:
 *                       type: string
 *                       example: active
 *                     database:
 *                       type: string
 *                       example: connected
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Soriva Lumos Backend is running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      auth: 'active',
      billing: 'active',
      rag: 'active',
      ai: 'active',
      orbit: 'active', // ← NEW: Orbit service status
      database: 'connected',
    },
  });
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API Version Info
 *     description: Get API version information and available endpoints
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API version and endpoints information
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
 *                   example: Welcome to Soriva Lumos API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: /api/auth
 *                     billing:
 *                       type: string
 *                       example: /api/billing
 *                     rag:
 *                       type: string
 *                       example: /api/rag
 *                     ai:
 *                       type: string
 *                       example: /api/ai
 *                     orbit:
 *                       type: string
 *                       example: /api/orbit
 *                     chat:
 *                       type: string
 *                       example: /api/chat
 *                     health:
 *                       type: string
 *                       example: /api/health
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Soriva Lumos API',
    version: '1.0.0',
    documentation: '/api-docs', // Updated to point to Swagger docs
    endpoints: {
      auth: '/api/auth',
      billing: '/api/billing',
      rag: '/api/rag',
      ai: '/api/ai',
      orbit: '/api/orbit', // ← NEW: Orbit endpoints
      chat: '/api/chat',
      health: '/api/health',
    },
  });
});

/**
 * Mount Route Modules
 */
router.use('/auth', authRoutes);
router.use('/billing', billingRoutes);
router.use('/rag', ragRoutes); // ← RAG System Integration
router.use('/ai', aiRoutes); // ← AI System Integration
router.use('/orbit', orbitRoutes); // ← NEW: Orbit System Integration
// router.use('/chat', chatRoutes); // ← ACTIVATED!

// Future routes will be added here:
// router.use('/studio', studioRoutes);
// router.use('/plans', plansRoutes);

export default router;