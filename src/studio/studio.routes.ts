// src/studio/studio.routes.ts
import { Router } from 'express';
import { studioController } from './studio.controller';
import { AuthMiddleware } from '../modules/auth/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Studio
 *   description: AI Generation Studio with Credits System
 */

// ==========================================
// CREDITS ROUTES
// ==========================================

/**
 * @swagger
 * /api/studio/credits/balance:
 *   get:
 *     summary: Get User Credits Balance
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credits balance retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/credits/balance',
  AuthMiddleware.authenticate,
  studioController.getCreditsBalance.bind(studioController)
);

/**
 * @swagger
 * /api/studio/credits/history:
 *   get:
 *     summary: Get Credits History
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credits history retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/credits/history',
  AuthMiddleware.authenticate,
  studioController.getCreditsHistory.bind(studioController)
);

// ==========================================
// GENERATION ROUTES
// ==========================================

/**
 * @swagger
 * /api/studio/generate:
 *   post:
 *     summary: Generate Content
 *     description: Create a new AI generation request (deducts base credits)
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - featureType
 *               - userPrompt
 *             properties:
 *               featureType:
 *                 type: string
 *                 enum: [IMAGE_GENERATION_512, IMAGE_GENERATION_1024, BACKGROUND_REMOVAL, IMAGE_UPSCALE_2X, IMAGE_UPSCALE_4X, TEXT_TO_SPEECH, VOICE_CLONE, VIDEO_5SEC, VIDEO_15SEC, VIDEO_30SEC]
 *                 example: IMAGE_GENERATION_512
 *               userPrompt:
 *                 type: string
 *                 example: "A futuristic cityscape at sunset"
 *               parameters:
 *                 type: object
 *     responses:
 *       201:
 *         description: Generation created successfully
 *       400:
 *         description: Invalid input
 *       402:
 *         description: Insufficient credits
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/generate',
  AuthMiddleware.authenticate,
  studioController.generateContent.bind(studioController)
);

/**
 * @swagger
 * /api/studio/preview/{generationId}:
 *   post:
 *     summary: Request Preview
 *     description: Generate a preview for a generation (1st free, then 3 credits)
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: generationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Preview created
 *       402:
 *         description: Insufficient credits
 *       404:
 *         description: Generation not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/preview/:generationId',
  AuthMiddleware.authenticate,
  studioController.requestPreview.bind(studioController)
);

/**
 * @swagger
 * /api/studio/generation/{id}:
 *   get:
 *     summary: Get Generation Status
 *     description: Get generation status with all previews
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Generation status retrieved
 *       404:
 *         description: Generation not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/generation/:id',
  AuthMiddleware.authenticate,
  studioController.getGenerationStatus.bind(studioController)
);

/**
 * @swagger
 * /api/studio/generations:
 *   get:
 *     summary: Get User's Generations
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: User generations retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/generations',
  AuthMiddleware.authenticate,
  studioController.getUserGenerations.bind(studioController)
);

// ==========================================
// BOOSTER ROUTES
// ==========================================

/**
 * @swagger
 * /api/studio/boosters/active:
 *   get:
 *     summary: Get Active Boosters
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active boosters retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/boosters/active',
  AuthMiddleware.authenticate,
  studioController.getActiveBoosters.bind(studioController)
);

/**
 * @swagger
 * /api/studio/boosters/purchase:
 *   post:
 *     summary: Purchase Credit Booster
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boosterType
 *             properties:
 *               boosterType:
 *                 type: string
 *                 enum: [LITE, PRO, MAX]
 *                 example: LITE
 *     responses:
 *       201:
 *         description: Booster purchased successfully
 *       400:
 *         description: Invalid booster type
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/boosters/purchase',
  AuthMiddleware.authenticate,
  studioController.purchaseBooster.bind(studioController)
);

// ==========================================
// GPU SERVICE CALLBACK ROUTES (No Auth Required)
// ==========================================

/**
 * @swagger
 * /api/studio/generation/{id}/status:
 *   patch:
 *     summary: Update Generation Status
 *     description: Callback endpoint for GPU service to update generation status
 *     tags: [Studio - Internal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, COMPLETED, FAILED]
 *               outputUrl:
 *                 type: string
 *               metadata:
 *                 type: object
 *               errorMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/generation/:id/status',
  studioController.updateGenerationStatus.bind(studioController)
);

/**
 * @swagger
 * /api/studio/preview/{id}/output:
 *   patch:
 *     summary: Update Preview Output
 *     description: Callback endpoint for GPU service to update preview URL
 *     tags: [Studio - Internal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - previewUrl
 *             properties:
 *               previewUrl:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Preview output updated
 */
router.patch(
  '/preview/:id/output',
  studioController.updatePreviewOutput.bind(studioController)
);

export default router;