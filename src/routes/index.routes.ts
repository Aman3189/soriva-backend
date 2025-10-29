// src/routes/index.routes.ts
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import billingRoutes from '../modules/billing/billing.routes';
import ragRoutes from './rag.routes'; // ← RAG System Routes
import aiRoutes from './ai.routes'; // ← AI Routes
import orbitRoutes from './orbit.routes'; // ← NEW: Orbit Routes
// import chatRoutes from '../modules/chat/chat.routes'; // ← UNCOMMENTED!

const router = Router();

/**
 * Health Check Endpoint
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
 * API Version Info
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Soriva Lumos API',
    version: '1.0.0',
    documentation: '/api/docs', // Future: API documentation
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
