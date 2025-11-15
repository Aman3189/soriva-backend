// src/routes/index.routes.ts
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import billingRoutes from '../modules/billing/billing.routes';
import ragRoutes from '../rag/rag.routes';
import aiRoutes from '../core/ai/ai.routes';
import orbitRoutes from '../modules/orbit/orbit.routes';
import studioRoutes from '../studio/studio.routes';
import userRoutes from '../modules/user/user.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import plansRoutes from './plans.routes'; // ← NEW: Plans Routes
// ← NEW: Region Middleware Import
import { detectRegion } from '../modules/auth/middleware/region.middleware';


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
      orbit: 'active',
      studio: 'active',
      plans: 'active', // ← NEW: Plans service
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
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Soriva Lumos API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      billing: '/api/billing',
      rag: '/api/rag',
      ai: '/api/ai',
      orbit: '/api/orbit',
      studio: '/api/studio',
      plans: '/api/plans', // ← NEW: Plans endpoint
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
router.use('/rag', ragRoutes);
router.use('/ai', aiRoutes);
router.use('/orbit', orbitRoutes);
router.use('/studio', studioRoutes);
router.use('/user', userRoutes);
router.use('/settings', settingsRoutes);

// ← NEW: Plans routes with region middleware
router.use('/plans', detectRegion, plansRoutes);

// router.use('/chat', chatRoutes);

export default router;