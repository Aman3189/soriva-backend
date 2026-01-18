// src/routes/index.routes.ts
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import billingRoutes from '../modules/billing/billing.routes';
import ragRoutes from '../rag/rag.routes';
import aiRoutes from '../core/ai/ai.routes';
import userRoutes from '../modules/user/user.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import plansRoutes from './plans.routes';
import { detectRegion } from '../modules/auth/middleware/region.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { CacheTTL, CacheNamespace } from '../types/cache.types';
import { authMiddleware } from '../modules/auth/middleware/auth.middleware';
import forgeRoutes from '../modules/forge/forge.routes';
import workspaceRoutes from '../controllers/workspace.routes';
import documentTemplatesRoutes from '../modules/document-templates/document-templates.routes';



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
      plans: 'active',
      documentTemplates: 'active',
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
*     CACHED: 6 hours (rarely changes)
*/
router.get(
  '/',
  cacheMiddleware.cache({
    namespace: CacheNamespace.PUBLIC,
    ttl: CacheTTL.VERY_LONG, // 6 hours
    keyGenerator: () => 'api:version:info',
  }),
  (req, res) => {
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
        plans: '/api/plans',
        chat: '/api/chat',
        documentTemplates: '/api/document-templates',
        health: '/api/health',
      },
    });
  }
);

/**
* Mount Route Modules
*/
router.use('/auth', authRoutes);
router.use('/billing', billingRoutes);
router.use('/rag', ragRoutes);
router.use('/ai', aiRoutes);
router.use('/user', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/plans', detectRegion, plansRoutes);
router.use('/forge', authMiddleware, forgeRoutes);
router.use('/workspace', workspaceRoutes);
router.use('/document-templates', documentTemplatesRoutes);

export default router;