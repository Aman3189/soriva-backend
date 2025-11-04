// src/studio/studio.controller.ts (FIXED)
// ✅ Changed all req.user?.id to req.user?.userId (8 places)

import { Request, Response } from 'express';
import { studioService } from './studio.service';
import {
  GenerateRequest,
  GetGenerationStatusRequest,
} from './dto/generate.dto';

export class StudioController {
  // ==========================================
  // CREDITS ENDPOINTS
  // ==========================================

  /**
   * GET /api/studio/credits/balance
   * Get user's current credits balance
   */
  async getCreditsBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId; // ✅ FIXED

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const balance = await studioService.getCreditsBalance(userId);

      return res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get credits balance',
      });
    }
  }

  /**
   * GET /api/studio/credits/history
   * Get user's credit usage history
   */
  async getCreditsHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId; // ✅ FIXED

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const history = await studioService.getCreditsHistory(userId);

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get credits history',
      });
    }
  }

  // ==========================================
  // GENERATION ENDPOINTS
  // ==========================================

  /**
   * POST /api/studio/generate
   * Create a new generation request
   */
  async generateContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId; // ✅ FIXED

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { featureType, userPrompt, parameters }: GenerateRequest = req.body;

      if (!featureType || !userPrompt) {
        return res.status(400).json({
          success: false,
          message: 'featureType and userPrompt are required',
        });
      }

      // Create generation using service
      const generation = await studioService.createGeneration(
        userId,
        featureType,
        userPrompt,
        parameters
      );

      // Get pricing for response
      const pricing = studioService.getFeaturePricing(featureType);

      return res.status(201).json({
        success: true,
        data: {
          generationId: generation.id,
          featureType: generation.featureType,
          featureName: generation.featureName,
          creditsDeducted: generation.creditsUsed,
          status: generation.status,
          estimatedTime: pricing.processingTime,
          message: 'Generation created. GPU processing will start soon.',
        },
      });
    } catch (error: any) {
      return res.status(error.message.includes('Insufficient') ? 402 : 500).json({
        success: false,
        message: error.message || 'Failed to generate content',
      });
    }
  }

  /**
   * POST /api/studio/preview/:generationId
   * Request a preview for a generation
   */
  async requestPreview(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { generationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Create preview using service
    const preview = await studioService.createPreview(generationId, userId);

    return res.status(201).json({
      success: true,
      data: {
        previewId: preview.id,
        previewNumber: preview.previewNumber,
        creditsCost: preview.creditsCost,
        message: `Preview generated successfully. ${preview.creditsCost} credits deducted.`, // ✅ FIXED
      },
    });
  } catch (error: any) {
    return res.status(error.message.includes('Insufficient') ? 402 : 500).json({
      success: false,
      message: error.message || 'Failed to create preview',
    });
  }
}
  /**
   * GET /api/studio/generation/:id
   * Get generation status and result
   */
  async getGenerationStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId; // ✅ FIXED
      const { id: generationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const generation = await studioService.getGeneration(generationId, userId);

      return res.status(200).json({
        success: true,
        data: {
          generationId: generation.id,
          featureType: generation.featureType,
          featureName: generation.featureName,
          status: generation.status,
          outputUrl: generation.outputUrl,
          outputType: generation.outputType,
          processingTime: generation.processingTime,
          errorMessage: generation.errorMessage,
          previews: generation.previews,
          createdAt: generation.createdAt,
          completedAt: generation.completedAt,
        },
      });
    } catch (error: any) {
      return res.status(error.message === 'Unauthorized' ? 403 : 404).json({
        success: false,
        message: error.message || 'Failed to get generation status',
      });
    }
  }

  /**
   * GET /api/studio/generations
   * Get user's all generations
   */
  async getUserGenerations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId; // ✅ FIXED

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const generations = await studioService.getUserGenerations(userId, limit);

      return res.status(200).json({
        success: true,
        data: generations,
        count: generations.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get generations',
      });
    }
  }

  // ==========================================
  // BOOSTER ENDPOINTS
  // ==========================================

  /**
   * GET /api/studio/boosters/active
   * Get user's active boosters
   */
  async getActiveBoosters(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId; // ✅ FIXED

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const boosters = await studioService.getActiveBoosters(userId);

      return res.status(200).json({
        success: true,
        data: boosters,
        count: boosters.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get active boosters',
      });
    }
  }

  /**
   * POST /api/studio/boosters/purchase
   * Purchase a booster (manual - no payment for now)
   */
  async purchaseBooster(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId; // ✅ FIXED
      const { boosterType } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!boosterType) {
        return res.status(400).json({
          success: false,
          message: 'boosterType is required',
        });
      }

      const purchase = await studioService.purchaseBooster(userId, boosterType);

      return res.status(201).json({
        success: true,
        data: purchase,
        message: 'Booster purchased successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to purchase booster',
      });
    }
  }

  // ==========================================
  // ADMIN/DEBUG ENDPOINTS (For GPU Integration Testing)
  // ==========================================

  /**
   * PATCH /api/studio/generation/:id/status
   * Update generation status (for GPU service callback)
   */
  async updateGenerationStatus(req: Request, res: Response) {
    try {
      const { id: generationId } = req.params;
      const { status, outputUrl, metadata, errorMessage } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'status is required',
        });
      }

      const generation = await studioService.updateGenerationStatus(
        generationId,
        status,
        outputUrl,
        metadata,
        errorMessage
      );

      return res.status(200).json({
        success: true,
        data: generation,
        message: 'Generation status updated',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update generation status',
      });
    }
  }

  /**
   * PATCH /api/studio/preview/:id/output
   * Update preview output URL (for GPU service callback)
   */
  async updatePreviewOutput(req: Request, res: Response) {
    try {
      const { id: previewId } = req.params;
      const { previewUrl, metadata } = req.body;

      if (!previewUrl) {
        return res.status(400).json({
          success: false,
          message: 'previewUrl is required',
        });
      }

      const preview = await studioService.updatePreviewOutput(
        previewId,
        previewUrl,
        metadata
      );

      return res.status(200).json({
        success: true,
        data: preview,
        message: 'Preview output updated',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update preview output',
      });
    }
  }
}

export const studioController = new StudioController();