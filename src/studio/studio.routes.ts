// src/studio/studio.routes.ts
// ✅ UPDATED: Added Talking Photos + Prompt Enhancement routes
import { Router } from 'express';
import { studioController } from './studio.controller';
import { authMiddleware } from '../modules/auth/middleware/auth.middleware';

const router = Router();

// ==========================================
// BALANCE
// ==========================================
router.get(
  '/balance',
  authMiddleware,
  studioController.getImageBalance.bind(studioController)
);

// Keep old endpoint
router.get(
  '/credits/balance',
  authMiddleware,
  studioController.getCreditsBalance.bind(studioController)
);

router.get(
  '/credits/history',
  authMiddleware,
  studioController.getCreditsHistory.bind(studioController)
);

// ==========================================
// IMAGE GENERATION (SDXL - FREE)
// ==========================================
router.post(
  '/generate/image',
  authMiddleware,
  studioController.generateImage.bind(studioController)
);

// ==========================================
// LOGO GENERATION (ULTRA - ₹29)
// ==========================================
router.post(
  '/logo/previews',
  authMiddleware,
  studioController.generateLogoPreviews.bind(studioController)
);

router.post(
  '/logo/final',
  authMiddleware,
  studioController.generateLogoFinal.bind(studioController)
);

router.get('/logo/pricing', studioController.getLogoPricing.bind(studioController));

// ==========================================
// TALKING PHOTOS (NEW - Real + AI Baby)
// ==========================================
router.post(
  '/talking-photo',
  authMiddleware,
  studioController.createTalkingPhoto.bind(studioController)
);

router.get(
  '/talking-photo/pricing',
  authMiddleware,
  studioController.getTalkingPhotoPricing.bind(studioController)
);

// ==========================================
// PROMPT ENHANCEMENT (Haiku)
// ==========================================
router.post(
  '/enhance-prompt',
  authMiddleware,
  studioController.enhancePrompt.bind(studioController)
);

// ==========================================
// UPSCALE
// ==========================================
router.post(
  '/upscale',
  authMiddleware,
  studioController.upscaleImage.bind(studioController)
);

// ==========================================
// IMAGE TO VIDEO
// ==========================================
router.post(
  '/image-to-video',
  authMiddleware,
  studioController.imageToVideo.bind(studioController)
);

// ==========================================
// HISTORY
// ==========================================
router.get(
  '/generation/:id',
  authMiddleware,
  studioController.getGenerationStatus.bind(studioController)
);

router.get(
  '/generations',
  authMiddleware,
  studioController.getUserGenerations.bind(studioController)
);

// ==========================================
// DEPRECATED (Keep for compatibility)
// ==========================================
router.post(
  '/preview/:generationId',
  authMiddleware,
  studioController.requestPreview.bind(studioController)
);

router.get(
  '/boosters/active',
  authMiddleware,
  studioController.getActiveBoosters.bind(studioController)
);

router.post(
  '/boosters/purchase',
  authMiddleware,
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