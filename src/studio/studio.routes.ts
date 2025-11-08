// src/studio/studio.routes.ts
// ✅ UPDATED: Added Talking Photos + Prompt Enhancement routes
import { Router } from 'express';
import { studioController } from './studio.controller';
import { AuthMiddleware } from '../modules/auth/auth.middleware';

const router = Router();

// ==========================================
// BALANCE
// ==========================================
router.get(
  '/balance',
  AuthMiddleware.authenticate,
  studioController.getImageBalance.bind(studioController)
);

// Keep old endpoint
router.get(
  '/credits/balance',
  AuthMiddleware.authenticate,
  studioController.getCreditsBalance.bind(studioController)
);

router.get(
  '/credits/history',
  AuthMiddleware.authenticate,
  studioController.getCreditsHistory.bind(studioController)
);

// ==========================================
// IMAGE GENERATION (SDXL - FREE)
// ==========================================
router.post(
  '/generate/image',
  AuthMiddleware.authenticate,
  studioController.generateImage.bind(studioController)
);

// ==========================================
// LOGO GENERATION (ULTRA - ₹29)
// ==========================================
router.post(
  '/logo/previews',
  AuthMiddleware.authenticate,
  studioController.generateLogoPreviews.bind(studioController)
);

router.post(
  '/logo/final',
  AuthMiddleware.authenticate,
  studioController.generateLogoFinal.bind(studioController)
);

router.get('/logo/pricing', studioController.getLogoPricing.bind(studioController));

// ==========================================
// TALKING PHOTOS (NEW - Real + AI Baby)
// ==========================================
router.post(
  '/talking-photo',
  AuthMiddleware.authenticate,
  studioController.createTalkingPhoto.bind(studioController)
);

router.get(
  '/talking-photo/pricing',
  AuthMiddleware.authenticate,
  studioController.getTalkingPhotoPricing.bind(studioController)
);

// ==========================================
// PROMPT ENHANCEMENT (Haiku)
// ==========================================
router.post(
  '/enhance-prompt',
  AuthMiddleware.authenticate,
  studioController.enhancePrompt.bind(studioController)
);

// ==========================================
// UPSCALE
// ==========================================
router.post(
  '/upscale',
  AuthMiddleware.authenticate,
  studioController.upscaleImage.bind(studioController)
);

// ==========================================
// IMAGE TO VIDEO
// ==========================================
router.post(
  '/image-to-video',
  AuthMiddleware.authenticate,
  studioController.imageToVideo.bind(studioController)
);

// ==========================================
// HISTORY
// ==========================================
router.get(
  '/generation/:id',
  AuthMiddleware.authenticate,
  studioController.getGenerationStatus.bind(studioController)
);

router.get(
  '/generations',
  AuthMiddleware.authenticate,
  studioController.getUserGenerations.bind(studioController)
);

// ==========================================
// DEPRECATED (Keep for compatibility)
// ==========================================
router.post(
  '/preview/:generationId',
  AuthMiddleware.authenticate,
  studioController.requestPreview.bind(studioController)
);

router.get(
  '/boosters/active',
  AuthMiddleware.authenticate,
  studioController.getActiveBoosters.bind(studioController)
);

router.post(
  '/boosters/purchase',
  AuthMiddleware.authenticate,
  studioController.purchaseBooster.bind(studioController)
);

router.patch(
  '/generation/:id/status',
  studioController.updateGenerationStatus.bind(studioController)
);

router.patch(
  '/preview/:id/output',
  studioController.updatePreviewOutput.bind(studioController)
);

export default router;