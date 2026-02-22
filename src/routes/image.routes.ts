// src/routes/image.routes.ts

/**
 * ==========================================
 * SORIVA IMAGE ROUTES v12.0
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: API routes for image generation
 * Last Updated: February 22, 2026 - v12.0 2-Model System
 *
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 * 
 * ✅ REMOVED:
 *    - Klein 9B ❌
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 *    - /img2img endpoint ❌ (was using Nano Banana)
 * 
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25 - Nature, animals, scenery, general
 *    - GPT LOW (OpenAI): ₹1.18 - Text, logos, festivals, ads, transforms
 *
 * ==========================================
 * ROUTES:
 * ==========================================
 * - POST   /api/image/generate        → Generate image (auto-routes Schnell/GPT LOW)
 * - POST   /api/image/edit-generate   → Edit & regenerate image
 * - GET    /api/image/quota           → Get user's quota (Schnell + GPT LOW)
 * - GET    /api/image/history         → Get generation history
 * - POST   /api/image/detect-intent   → Check if message is image request
 * - POST   /api/image/upload          → Upload image for processing
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
 * Generate an image from prompt with smart 2-model routing
 * 
 * Body:
 * - prompt: string (required) - Image description
 * - provider?: 'schnell' | 'gptLow' | 'auto' - Provider selection (default: auto)
 *   - 'auto': Smart routing based on prompt content
 *   - 'schnell': Fast, budget-friendly - ₹0.25 (Nature, animals, scenery)
 *   - 'gptLow': Premium, text/ads - ₹1.18 (Text, logos, festivals, transforms)
 * - aspectRatio?: 'portrait' | 'landscape' - Output aspect ratio
 *   - 'portrait': 1024x1536 (GPT LOW) / optimized (Schnell)
 *   - 'landscape': 1536x1024 (GPT LOW) / optimized (Schnell)
 * - sessionId?: string - Optional chat session ID
 * 
 * Response:
 * - success: boolean
 * - data?: { imageUrl, provider, generationTimeMs }
 * - routing?: { provider, category, reason, cost }
 * - quota?: { schnellRemaining, gptLowRemaining, totalRemaining }
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
 * - provider?: 'schnell' | 'gptLow' | 'auto' - Provider (default: auto)
 * - aspectRatio?: 'portrait' | 'landscape' - Output aspect ratio
 * - sessionId?: string - Optional chat session ID
 * 
 * Response:
 * - success: boolean
 * - data?: { imageUrl, provider, generationTimeMs }
 * - routing?: { provider, category, reason, cost }
 * - editInfo?: { originalPrompt, editInstruction, optimizedPrompt, ... }
 * - quota?: { schnellRemaining, gptLowRemaining, totalRemaining }
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
 * Get user's image generation quota (Schnell + GPT LOW)
 * 
 * Response:
 * - success: boolean
 * - data?: {
 *     planType, region,
 *     schnell: { limit, used, remaining, booster, cost, bestFor },
 *     gptLow: { limit, used, remaining, booster, cost, bestFor },
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
 *     suggestedProvider: 'schnell' | 'gptLow',
 *     suggestedProviderDisplay: 'Schnell' | 'GPT LOW',
 *     extractedPrompt: string
 *   }
 */
router.post(
  '/detect-intent',
  authMiddleware,
  (req, res) => imageController.detectIntent(req, res)
);

// ==========================================
// 🎨 GPT IMAGE EDITING FEATURES (v12.0)
// ==========================================

/**
 * POST /api/image/transform
 * Transform an uploaded image to a new style (img2img)
 * 
 * Body:
 * - imageUrl: string (required) - URL or base64 of source image
 * - prompt: string (required) - Transform instruction (e.g., "Convert to GTA style")
 * - aspectRatio?: 'portrait' | 'landscape' (default: portrait)
 * 
 * Cost: ₹1.18 (GPT LOW)
 * 
 * Examples:
 * - Photo → "Convert to GTA style"
 * - Portrait → "Make it anime"
 * - Landscape → "Add dramatic sunset"
 */
router.post(
  '/transform',
  authMiddleware,
  (req, res) => imageController.transformImage(req, res)
);

/**
 * POST /api/image/merge
 * Combine multiple images into one (logo + letterhead, etc.)
 * 
 * Body:
 * - images: string[] (required) - Array of image URLs/base64 (2-4 images)
 * - prompt: string (required) - Merge instruction
 * - aspectRatio?: 'portrait' | 'landscape' (default: portrait)
 * 
 * Cost: ₹1.18 (GPT LOW)
 * 
 * Examples:
 * - Logo + Old Letterhead → "Create new letterhead with this logo"
 * - Photo + Background → "Place person on beach background"
 * - Multiple products → "Create product collage"
 */
router.post(
  '/merge',
  authMiddleware,
  (req, res) => imageController.mergeImages(req, res)
);

/**
 * POST /api/image/continue-edit
 * Continue editing a previously generated image (conversational)
 * 
 * Body:
 * - previousImageUrl: string (required) - URL of previously generated image
 * - prompt: string (required) - New edit instruction
 * - aspectRatio?: 'portrait' | 'landscape' (default: portrait)
 * 
 * Cost: ₹1.18 (GPT LOW)
 * 
 * Examples:
 * - "Mountain sunset" → "Add eagle flying" → "Make eagle bigger"
 * - "Portrait" → "Add hat" → "Change background to beach"
 */
router.post(
  '/continue-edit',
  authMiddleware,
  (req, res) => imageController.continueEdit(req, res)
);

/**
 * POST /api/image/upload
 * Upload an image and get a URL/base64
 * Useful for future image editing features
 * 
 * Body (multipart/form-data):
 * - image: File (required) - Image file to upload (max 10MB)
 * 
 * Response:
 * - success: boolean
 * - imageUrl: string (base64 data URL)
 * - fileName: string
 * - size: number
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
        
        // Convert to base64 data URL
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