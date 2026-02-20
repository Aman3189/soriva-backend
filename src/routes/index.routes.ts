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
import astrologyRoutes from '../services/astrology/astrology.routes';


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
// Code Execute - PUBLIC (no auth) - Using Wandbox API
router.post('/forge/execute/piston', async (req, res) => {
  const { language, files, stdin } = req.body;

  if (!language || !files || !Array.isArray(files) || files.length === 0) {
    res.status(400).json({ success: false, message: 'Language and files are required' });
    return;
  }

  // Wandbox compiler mapping
  const wandboxCompilers: Record<string, string> = {
    'c': 'gcc-head-c',
    'cpp': 'gcc-head',
    'python': 'cpython-3.10.2',
    'ruby': 'ruby-3.1.0',
    'java': 'openjdk-head',
    'rust': 'rust-head',
    'go': 'go-head',
    'javascript': 'nodejs-16.14.0',
    'typescript': 'typescript-4.5.4',
    'php': 'php-8.1.2',
    'perl': 'perl-head',
    'bash': 'bash',
    'lua': 'lua-5.4.3',
    'haskell': 'ghc-head',
    'csharp': 'mono-head',
    'scala': 'scala-2.13.x',
    'swift': 'swift-head',
    'kotlin': 'kotlin-head',
  };

  const compiler = wandboxCompilers[language.toLowerCase()];
  if (!compiler) {
    res.status(400).json({ success: false, message: `Language '${language}' is not supported` });
    return;
  }

  try {
    console.log('📥 Stdin received:', stdin || '(empty)');
    
    const wandboxResponse = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: compiler,
        code: files[0].content,
        stdin: stdin || '',
        save: false,
      }),
    });

    const result = await wandboxResponse.json();
    console.log('🔥 Wandbox Response:', JSON.stringify(result, null, 2));

    // Convert Wandbox response to Piston-like format
    // Wandbox: status = 0 means success, non-zero means error
    const exitCode = typeof result.status === 'number' ? result.status : 0;
    const hasCompileError = !!(result.compiler_error);
    
    res.status(200).json({
      success: true,
      data: {
        run: {
          output: result.program_output || '',
          stderr: result.program_error || '',
          code: exitCode,
        },
        compile: {
          output: result.compiler_output || '',
          stderr: result.compiler_error || '',
          code: hasCompileError ? 1 : 0,
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Wandbox error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Forge routes - PROTECTED (auth required)
router.use('/forge', authMiddleware, forgeRoutes);
router.use('/workspace', workspaceRoutes);
router.use('/document-templates', documentTemplatesRoutes);
router.use('/astrology', astrologyRoutes);

export default router;