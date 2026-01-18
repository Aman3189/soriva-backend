// src/routes/image.routes.ts

/**
 * ==========================================
 * SORIVA IMAGE ROUTES
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: API routes for image generation
 * Last Updated: January 18, 2026 - v10.3
 *
 * ROUTES:
 * - POST   /api/image/generate        → Generate an image
 * - POST   /api/image/edit-generate   → Edit & regenerate image (NEW)
 * - GET    /api/image/quota           → Get user's image quota
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
 * Generate an image from prompt
 * 
 * Body:
 * - prompt: string (required) - Image description
 * - provider?: 'klein9b' - Optional provider selection
 * - aspectRatio?: string - Optional aspect ratio (default: 1:1)
 * - sessionId?: string - Optional chat session ID
 * 
 * Response:
 * - success: boolean
 * - data?: { imageUrl, provider, generationTimeMs }
 * - quota?: { klein9bRemaining, totalRemaining }
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
 * - provider?: 'klein9b' - Provider (default: klein9b)
 * - aspectRatio?: string - Optional aspect ratio
 * - sessionId?: string - Optional chat session ID
 * - style?: 'photorealistic' | 'artistic' | 'poster' | 'editorial'
 * 
 * Response:
 * - success: boolean
 * - data?: { imageUrl, provider, generationTimeMs }
 * - editInfo?: { originalPrompt, editInstruction, optimizedPrompt, promptOptimized, tokensUsed }
 * - quota?: { klein9bRemaining, totalRemaining }
 * - error?: string
 * 
 * Example:
 * {
 *   "originalPrompt": "A 5-year-old girl sitting with a golden retriever in a park",
 *   "editInstruction": "sky ko neela kar do aur dress red",
 *   "style": "photorealistic"
 * }
 * 
 * Mistral will convert this to:
 * "A 5-year-old girl sitting with a golden retriever in a park, 
 *  bright blue sky, wearing an elegant red dress, golden hour lighting"
 */
router.post(
  '/edit-generate',
  authMiddleware,
  (req, res) => imageController.editAndGenerate(req, res)
);

/**
 * GET /api/image/quota
 * Get user's image generation quota
 * 
 * Response:
 * - success: boolean
 * - data?: {
 *     planType, region,
 *     klein9b: { limit, used, remaining, booster },
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