// src/modules/image/image.controller.ts

/**
 * ==========================================
 * SORIVA IMAGE CONTROLLER
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: HTTP handlers for image generation API endpoints
 * Last Updated: January 18, 2026 - v10.3 Edit & Regenerate
 *
 * CHANGELOG v10.3:
 * - Added editAndGenerate endpoint
 * - Uses existing promptOptimizer with Mistral Large
 * - Hinglish/desi language support
 *
 * ENDPOINTS:
 * - POST   /api/image/generate        → Generate an image
 * - POST   /api/image/edit-generate   → Edit & regenerate image (NEW)
 * - GET    /api/image/quota           → Get user's image quota
 * - GET    /api/image/history         → Get generation history
 * - POST   /api/image/detect-intent   → Check if message is image request
 */

import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { createImageService, ImageService } from '../../services/image';
import { ImageProvider, SUPPORTED_ASPECT_RATIOS } from '../../types/image.types';
import { optimizePrompt } from '../../services/image/promptOptimizer';

// ==========================================
// INTERFACES
// ==========================================

interface GenerateImageBody {
  prompt: string;
  provider?: 'klein9b';
  aspectRatio?: string;
  sessionId?: string;
}

interface EditAndGenerateBody {
  originalPrompt: string;
  editInstruction: string;
  provider?: 'klein9b';
  aspectRatio?: string;
  sessionId?: string;
}

// ==========================================
// IMAGE CONTROLLER CLASS
// ==========================================

export class ImageController {
  private imageService: ImageService;

  constructor() {
    this.imageService = createImageService(prisma);
  }

  // ==========================================
  // GENERATE IMAGE
  // ==========================================

  /**
   * POST /api/image/generate
   * Generate an image from prompt
   */
  async generateImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { prompt, provider, aspectRatio, sessionId } = req.body as GenerateImageBody;

      // Validate authentication
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate prompt
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Prompt is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate prompt length
      if (prompt.length > 2000) {
        res.status(400).json({
          success: false,
          error: 'Prompt too long (maximum 2000 characters)',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate aspect ratio if provided
      if (aspectRatio && !SUPPORTED_ASPECT_RATIOS.includes(aspectRatio as any)) {
        res.status(400).json({
          success: false,
          error: `Invalid aspect ratio. Supported: ${SUPPORTED_ASPECT_RATIOS.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate provider if provided (only klein9b now)
      if (provider && provider !== 'klein9b') {
        res.status(400).json({
          success: false,
          error: 'Invalid provider. Use "klein9b"',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate image
      const result = await this.imageService.generateImage({
        userId,
        prompt: prompt.trim(),
        provider: ImageProvider.KLEIN9B,
        aspectRatio,
        sessionId,
      });

      // Handle quota exhausted
      if (!result.success && result.errorCode === 'QUOTA_EXHAUSTED') {
        res.status(429).json(result);
        return;
      }

      // Handle other errors
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Success
      res.status(200).json(result);

    } catch (error) {
      console.error('[ImageController] Generate error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // EDIT AND GENERATE (NEW)
  // ==========================================

  /**
   * POST /api/image/edit-generate
   * Edit an existing image prompt and regenerate
   * 
   * Flow:
   * 1. Take original prompt + user's edit instruction (can be Hinglish)
   * 2. Combine and use existing promptOptimizer (Mistral Large)
   * 3. Generate new image with Klein9B
   * 
   * Body:
   * - originalPrompt: string (required) - The original image prompt
   * - editInstruction: string (required) - User's edit in any language
   * - provider?: 'klein9b' - Provider (default: klein9b)
   * - aspectRatio?: string - Aspect ratio
   * - sessionId?: string - Chat session ID
   */
  async editAndGenerate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { 
        originalPrompt, 
        editInstruction, 
        provider, 
        aspectRatio, 
        sessionId,
      } = req.body as EditAndGenerateBody;

      // Validate authentication
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate original prompt
      if (!originalPrompt || typeof originalPrompt !== 'string' || originalPrompt.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Original prompt is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate edit instruction
      if (!editInstruction || typeof editInstruction !== 'string' || editInstruction.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Edit instruction is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate edit instruction length
      if (editInstruction.length > 500) {
        res.status(400).json({
          success: false,
          error: 'Edit instruction too long (maximum 500 characters)',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate aspect ratio if provided
      if (aspectRatio && !SUPPORTED_ASPECT_RATIOS.includes(aspectRatio as any)) {
        res.status(400).json({
          success: false,
          error: `Invalid aspect ratio. Supported: ${SUPPORTED_ASPECT_RATIOS.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.log(`[ImageController] Edit request - User: ${userId}`);
      console.log(`[ImageController] Original: "${originalPrompt.substring(0, 50)}..."`);
      console.log(`[ImageController] Edit: "${editInstruction}"`);

      // ==========================================
      // Step 1: Combine prompts for optimization
      // ==========================================
      
      // Create combined prompt for Mistral to understand context
      const combinedPrompt = `${originalPrompt.trim()}. User wants these changes: ${editInstruction.trim()}`;

      // ==========================================
      // Step 2: Use existing promptOptimizer (Mistral Large)
      // ==========================================
      
      let finalPrompt: string;
      let optimizationResult;

      try {
        optimizationResult = await optimizePrompt(combinedPrompt);
        finalPrompt = optimizationResult.optimizedPrompt;
        
        console.log(`[ImageController] Mistral optimized: "${finalPrompt.substring(0, 80)}..."`);
        console.log(`[ImageController] Language detected: ${optimizationResult.detectedLanguage}`);
        
      } catch (optimizeError) {
        // Fallback: Simple combination if optimizer fails
        console.error('[ImageController] Optimizer failed, using fallback:', optimizeError);
        finalPrompt = `${originalPrompt.trim()}. ${editInstruction.trim()}`;
        optimizationResult = {
          originalPrompt: combinedPrompt,
          optimizedPrompt: finalPrompt,
          detectedLanguage: 'english' as const,
          enhancements: ['Fallback: Simple combination'],
          containsText: false,
          containsLogo: false,
          isRealistic: false,
        };
      }

      // Validate final prompt length
      if (finalPrompt.length > 2000) {
        finalPrompt = finalPrompt.substring(0, 2000);
      }

      // ==========================================
      // Step 3: Generate image with Klein9B
      // ==========================================

      const result = await this.imageService.generateImage({
        userId,
        prompt: finalPrompt,
        provider: ImageProvider.KLEIN9B,
        aspectRatio,
        sessionId,
      });

      // Handle quota exhausted
      if (!result.success && result.errorCode === 'QUOTA_EXHAUSTED') {
        res.status(429).json(result);
        return;
      }

      // Handle other errors
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // ==========================================
      // Success Response with Edit Info
      // ==========================================
      
      res.status(200).json({
        ...result,
        editInfo: {
          originalPrompt: originalPrompt.trim(),
          editInstruction: editInstruction.trim(),
          optimizedPrompt: finalPrompt,
          detectedLanguage: optimizationResult.detectedLanguage,
          enhancements: optimizationResult.enhancements,
          containsText: optimizationResult.containsText,
          containsLogo: optimizationResult.containsLogo,
          isRealistic: optimizationResult.isRealistic,
        },
      });

    } catch (error) {
      console.error('[ImageController] Edit & Generate error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // GET QUOTA
  // ==========================================

  /**
   * GET /api/image/quota
   * Get user's image generation quota
   */
  async getQuota(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const quota = await this.imageService.getUserQuota(userId);

      if (!quota) {
        res.status(404).json({
          success: false,
          error: 'Quota information not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          planType: quota.planType,
          region: quota.region,
          klein9b: {
            limit: quota.klein9bLimit,
            used: quota.klein9bUsed,
            remaining: quota.klein9bRemaining,
            booster: quota.boosterKlein9b,
          },
          totalRemaining: quota.totalRemaining,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] Quota error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // GET HISTORY
  // ==========================================

  /**
   * GET /api/image/history
   * Get user's image generation history
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate limit
      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const history = await prisma.imageGeneration.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          provider: true,
          prompt: true,
          imageUrl: true,
          status: true,
          costINR: true,
          generationTime: true,
          createdAt: true,
        },
      });

      const total = await prisma.imageGeneration.count({
        where: { userId },
      });

      res.status(200).json({
        success: true,
        data: {
          images: history,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + history.length < total,
          },
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] History error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // DETECT INTENT
  // ==========================================

  /**
   * POST /api/image/detect-intent
   * Check if message is an image generation request
   * Useful for frontend to show image generation UI
   */
  async detectIntent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { message } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Message is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const intentResult = this.imageService.detectIntent(message);

      res.status(200).json({
        success: true,
        data: {
          isImageRequest: intentResult.isImageRequest,
          confidence: intentResult.confidence,
          intentType: intentResult.intentType,
          suggestedProvider: intentResult.suggestedProvider,
          extractedPrompt: intentResult.extractedPrompt,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] Detect intent error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export default new ImageController();