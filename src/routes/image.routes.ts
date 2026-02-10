// src/routes/image.routes.ts

/**
 * ==========================================
 * SORIVA IMAGE ROUTES
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: API routes for image generation
 * Last Updated: January 19, 2026 - v10.4 Dual Model
 *
 * DUAL MODEL SYSTEM:
 * - Klein 9B (BFL): ₹1.26 - Text/Cards/Deities/Festivals
 * - Schnell (Fal.ai): ₹0.25 - General images (people, animals, objects)
 * - Auto routing based on prompt content
 *
 * ROUTES:
 * - POST   /api/image/generate        → Generate an image (auto-routes)
 * - POST   /api/image/edit-generate   → Edit & regenerate image
 * - GET    /api/image/quota           → Get user's image quota (Klein + Schnell)
 * - GET    /api/image/history         → Get generation history
 * - POST   /api/image/detect-intent   → Check if message is image request
 * - GET    /api/image/download        → Download image via proxy
 */

import { Router } from 'express';
import imageController from '../modules/image/image.controller';
import { authMiddleware } from '../modules/auth/middleware/auth.middleware';

const router = Router();

// ==========================================
// PROTECTED ROUTES (Require Authentication)
// ==========================================

/**
 * POST /api/image/generate
 * Generate an image from prompt with smart 4-model routing
 * 
 * Body:
 * - prompt: string (required) - Image description
 * - provider?: 'schnell' | 'klein9b' | 'nanoBanana' | 'fluxKontext' | 'auto' - Provider selection (default: auto)
 *   - 'auto': Smart routing based on prompt content & plan
 *   - 'schnell': Fast, budget-friendly - ₹0.25 (All plans)
 *   - 'klein9b': Premium, text rendering - ₹1.26 (PLUS+)
 *   - 'nanoBanana': Ultra-premium, photorealistic - ₹3.26 (PRO/APEX)
 *   - 'fluxKontext': Style transfer, editing - ₹3.35 (PRO/APEX)
 * - aspectRatio?: string - Optional aspect ratio (default: 1:1)
 * - sessionId?: string - Optional chat session ID
 * 
 * Response:
 * - success: boolean
 * - data?: { imageUrl, provider, generationTimeMs }
 * - routing?: { provider, reason, cost, availableProviders }
 * - quota?: { schnellRemaining, klein9bRemaining, nanoBananaRemaining, fluxKontextRemaining }
 * - error?: string
 */
router.post(
  '/generate',
  authMiddleware,
  (req, res) => imageController.generateImage(req, res)
);

/**
 * POST /api/image/edit-generate
 * Edit an existing prompt and regenerate image
 * Uses Mistral to optimize Hinglish/desi language to professional prompts
 * 
 * Body:
 * - originalPrompt: string (required) - The original image prompt
 * - editInstruction: string (required) - User's edit instruction (any language)
 * - provider?: 'schnell' | 'klein9b' | 'nanoBanana' | 'fluxKontext' | 'auto' - Provider (default: auto)
 * - aspectRatio?: string - Optional aspect ratio
 * - sessionId?: string - Optional chat session ID
 * 
 * Response:
 * - success: boolean
 * - data?: { imageUrl, provider, generationTimeMs }
 * - routing?: { provider, reason, cost, availableProviders }
 * - editInfo?: { originalPrompt, editInstruction, optimizedPrompt, ... }
 * - quota?: { schnellRemaining, klein9bRemaining, nanoBananaRemaining, fluxKontextRemaining }
 * - error?: string
 * 
 * Example:
 * {
 *   "originalPrompt": "A 5-year-old girl sitting with a golden retriever in a park",
 *   "editInstruction": "sky ko neela kar do aur dress red",
 *   "provider": "auto"
 * }
 */
router.post(
  '/edit-generate',
  authMiddleware,
  (req, res) => imageController.editAndGenerate(req, res)
);

/**
 * GET /api/image/quota
 * Get user's image generation quota (Klein 9B + Schnell)
 * 
 * Response:
 * - success: boolean
 * - data?: {
 *     planType, region,
 *     klein9b: { limit, used, remaining, booster, cost, bestFor },
 *     schnell: { limit, used, remaining, booster, cost, bestFor },
 *     totalRemaining
 *   }
 */
router.get(
  '/quota',
  authMiddleware,
  (req, res) => imageController.getQuota(req, res)
);

/**
 * GET /api/image/history
 * Get user's image generation history
 * 
 * Query:
 * - limit?: number (default: 20, max: 100)
 * - offset?: number (default: 0)
 * 
 * Response:
 * - success: boolean
 * - data?: {
 *     images: [...],
 *     pagination: { total, limit, offset, hasMore }
 *   }
 */
router.get(
  '/history',
  authMiddleware,
  (req, res) => imageController.getHistory(req, res)
);

/**
 * POST /api/image/detect-intent
 * Check if message is an image generation request
 * 
 * Body:
 * - message: string (required)
 * 
 * Response:
 * - success: boolean
 * - data?: {
 *     isImageRequest: boolean,
 *     confidence: number,
 *     intentType: string,
 *     suggestedProvider: string,
 *     extractedPrompt: string
 *   }
 */
router.post(
  '/detect-intent',
  authMiddleware,
  (req, res) => imageController.detectIntent(req, res)
);

/**
 * GET /api/image/download
 * Download image via backend proxy (bypasses CORS)
 * 
 * Query:
 * - url: string (required) - Image URL to download
 * 
 * Response:
 * - Image file as attachment (JPEG format)
 */
/**
 * POST /api/image/img2img
 * Edit an uploaded image with AI (Image-to-Image)
 * 
 * Body:
 * - imageUrl: string (required) - URL of uploaded image to edit
 * - prompt: string (required) - Edit instruction (e.g., "make it anime style", "change background to beach")
 * - aspectRatio?: string - Output aspect ratio (default: 1:1)
 * - sessionId?: string - Optional chat session ID
 * 
 * Cost: ₹3.26 per edit (Nano Banana Edit)
 * Requires: PRO or APEX plan
 * 
 * Example:
 * {
 *   "imageUrl": "https://..../uploaded-image.jpg",
 *   "prompt": "Convert to anime style with vibrant colors"
 * }
 */
router.post(
  '/img2img',
  authMiddleware,
  (req, res) => imageController.imageToImage(req, res)
);

/**
 * POST /api/image/upload
 * Upload an image and get a URL (for img2img)
 * Uses Fal.ai storage or base64
 */
router.post(
  '/upload',
  authMiddleware,
  async (req, res) => {
    try {
      const multer = require('multer');
      const upload = multer({ 
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB
      }).single('image');
      
      upload(req, res, async (err: any) => {
        if (err) {
          return res.status(400).json({ success: false, error: 'Upload failed' });
        }
        
        const file = (req as any).file;
        if (!file) {
          return res.status(400).json({ success: false, error: 'No image provided' });
        }
        
        // Convert to base64 data URL (Fal.ai accepts this)
        const base64 = file.buffer.toString('base64');
        const mimeType = file.mimetype || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        
        res.json({
          success: true,
          imageUrl: dataUrl,
          fileName: file.originalname,
          size: file.size,
        });
      });
    } catch (error) {
      console.error('[ImageUpload] Error:', error);
      res.status(500).json({ success: false, error: 'Upload failed' });
    }
  }
);

router.get(
  '/download',
  authMiddleware,
  async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: 'URL required' });
      }

      // Fetch image from external URL
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(404).json({ success: false, error: 'Image not found' });
      }
      
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/webp';
      
      // Set headers for download
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="soriva-creation-${Date.now()}.jpg"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send image
      res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error('[ImageDownload] Error:', error);
      res.status(500).json({ success: false, error: 'Download failed' });
    }
  }
);

export default router;