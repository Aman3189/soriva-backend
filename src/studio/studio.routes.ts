// src/studio/studio.routes.ts
// ============================================================================
// SORIVA STUDIO v2.0 - December 2025
// ============================================================================

import { Router } from 'express';
import { studioController } from './studio.controller';
import { authMiddleware } from '../modules/auth/middleware/auth.middleware';

const router = Router();

// ============================================================================
// CREDITS
// ============================================================================

router.get(
  '/credits',
  authMiddleware,
  studioController.getCreditsBalance.bind(studioController)
);

// Legacy endpoint (keep for compatibility)
router.get(
  '/balance',
  authMiddleware,
  studioController.getCreditsBalance.bind(studioController)
);

// ============================================================================
// UNIVERSAL GENERATE (Main endpoint for all features)
// ============================================================================

router.post(
  '/generate',
  authMiddleware,
  studioController.generate.bind(studioController)
);

// ============================================================================
// CONVENIENCE ENDPOINTS (Shortcuts for specific features)
// ============================================================================

// Text-to-Image
router.post(
  '/image',
  authMiddleware,
  studioController.generateImage.bind(studioController)
);

// Logo Generation
router.post(
  '/logo',
  authMiddleware,
  studioController.generateLogo.bind(studioController)
);

// Photo Transform (All 8 Banana PRO features)
router.post(
  '/photo-transform',
  authMiddleware,
  studioController.photoTransform.bind(studioController)
);

// Baby Prediction
router.post(
  '/baby-prediction',
  authMiddleware,
  studioController.babyPrediction.bind(studioController)
);

// Talking Photos
router.post(
  '/talking-photo',
  authMiddleware,
  studioController.createTalkingPhoto.bind(studioController)
);

// ============================================================================
// PROMPT ENHANCEMENT
// ============================================================================

router.post(
  '/enhance-prompt',
  authMiddleware,
  studioController.enhancePrompt.bind(studioController)
);

// ============================================================================
// BOOSTERS
// ============================================================================

router.post(
  '/boosters/purchase',
  authMiddleware,
  studioController.purchaseBooster.bind(studioController)
);

router.get(
  '/boosters/pricing',
  studioController.getBoosterPricing.bind(studioController)
);

// ============================================================================
// HISTORY & STATUS
// ============================================================================

router.get(
  '/generations',
  authMiddleware,
  studioController.getUserGenerations.bind(studioController)
);

router.get(
  '/generation/:id',
  authMiddleware,
  studioController.getGenerationStatus.bind(studioController)
);

// ============================================================================
// STUDIO INFO
// ============================================================================

router.get(
  '/status',
  authMiddleware,
  studioController.getStudioStatus.bind(studioController)
);

router.get(
  '/features',
  studioController.getAvailableFeatures.bind(studioController)
);

router.get(
  '/categories',
  studioController.getFeatureCategories.bind(studioController)
);

router.get(
  '/stats',
  authMiddleware,
  studioController.getUsageStats.bind(studioController)
);

// ============================================================================
// DEPRECATED ENDPOINTS (Helpful redirect messages)
// ============================================================================

router.post('/generate/image', authMiddleware, studioController.deprecatedEndpoint.bind(studioController));
router.post('/logo/previews', authMiddleware, studioController.deprecatedEndpoint.bind(studioController));
router.post('/logo/final', authMiddleware, studioController.deprecatedEndpoint.bind(studioController));
router.post('/upscale', authMiddleware, studioController.deprecatedEndpoint.bind(studioController));
router.post('/image-to-video', authMiddleware, studioController.deprecatedEndpoint.bind(studioController));
router.post('/preview/:generationId', authMiddleware, studioController.deprecatedEndpoint.bind(studioController));
router.get('/boosters/active', authMiddleware, studioController.deprecatedEndpoint.bind(studioController));

export default router;