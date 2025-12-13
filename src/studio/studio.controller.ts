// src/studio/studio.controller.ts
// ============================================================================
// SORIVA STUDIO v2.0 - December 2025
// ============================================================================
// Unified controller using generate() method for all features
// ============================================================================

import { Request, Response } from 'express';
import { studioService } from './studio.service';
import { StudioFeatureType } from '@prisma/client';
import {
  FEATURE_CONFIGS,
  BOOSTER_CONFIGS,
  STUDIO_SUMMARY,
  AVAILABLE_FEATURES,
  IdeogramStyle,
} from './types/studio.types';

export class StudioController {
  // ==========================================================================
  // CREDITS
  // ==========================================================================

  async getCreditsBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const balance = await studioService.getCreditsBalance(userId);
      return res.status(200).json({ success: true, data: balance });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  // ==========================================================================
  // UNIVERSAL GENERATE ENDPOINT
  // ==========================================================================

  async generate(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { featureType, prompt, inputImageUrl, options } = req.body;

      // Validate required fields
      if (!featureType || !prompt) {
        return res.status(400).json({
          success: false,
          message: 'featureType and prompt are required',
        });
      }

      // Validate feature type
      if (!FEATURE_CONFIGS[featureType as StudioFeatureType]) {
        return res.status(400).json({
          success: false,
          message: `Invalid featureType. Available: ${Object.keys(FEATURE_CONFIGS).join(', ')}`,
        });
      }

      const result = await studioService.generate(userId, {
        featureType: featureType as StudioFeatureType,
        prompt,
        inputImageUrl,
        options,
      });

      if (result.status === 'FAILED') {
        return res.status(400).json({
          success: false,
          message: result.error,
          data: result,
        });
      }

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Generation completed successfully',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = message.includes('Not enough credits') ? 402 : 500;
      return res.status(statusCode).json({ success: false, message });
    }
  }

  // ==========================================================================
  // SPECIFIC FEATURE ENDPOINTS (Convenience wrappers)
  // ==========================================================================

  async generateImage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { prompt, style, aspectRatio, negativePrompt } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'prompt is required',
        });
      }

      const result = await studioService.generate(userId, {
        featureType: 'TEXT_TO_IMAGE',
        prompt,
        options: {
          style: style as IdeogramStyle,
          aspectRatio,
          negativePrompt,
        },
      });

      return res.status(result.status === 'COMPLETED' ? 201 : 400).json({
        success: result.status === 'COMPLETED',
        data: result,
        message: result.status === 'COMPLETED' ? 'Image generated' : result.error,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  async generateLogo(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { prompt, style, aspectRatio } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'prompt is required',
        });
      }

      const result = await studioService.generate(userId, {
        featureType: 'LOGO_GENERATION',
        prompt,
        options: {
          style: (style as IdeogramStyle) || 'design',
          aspectRatio: aspectRatio || 'square',
        },
      });

      return res.status(result.status === 'COMPLETED' ? 201 : 400).json({
        success: result.status === 'COMPLETED',
        data: result,
        message: result.status === 'COMPLETED' ? 'Logo generated' : result.error,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  async photoTransform(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { featureType, prompt, inputImageUrl } = req.body;

      if (!featureType || !inputImageUrl) {
        return res.status(400).json({
          success: false,
          message: 'featureType and inputImageUrl are required',
        });
      }

      const validFeatures = [
        'OBJECT_REMOVE',
        'BACKGROUND_CHANGE',
        'PORTRAIT_STUDIO',
        'SKETCH_COMPLETE',
        'PHOTO_ENHANCE',
        'BACKGROUND_EXPAND',
        'STYLE_TRANSFER',
        'CELEBRITY_MERGE',
      ];

      if (!validFeatures.includes(featureType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid featureType. Valid options: ${validFeatures.join(', ')}`,
        });
      }

      const result = await studioService.generate(userId, {
        featureType: featureType as StudioFeatureType,
        prompt: prompt || '',
        inputImageUrl,
      });

      return res.status(result.status === 'COMPLETED' ? 201 : 400).json({
        success: result.status === 'COMPLETED',
        data: result,
        message: result.status === 'COMPLETED' ? 'Photo transformed' : result.error,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  async babyPrediction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { momImageUrl, dadImageUrl, babyGender } = req.body;

      if (!momImageUrl || !dadImageUrl) {
        return res.status(400).json({
          success: false,
          message: 'momImageUrl and dadImageUrl are required',
        });
      }

      const result = await studioService.generate(userId, {
        featureType: 'BABY_PREDICTION',
        prompt: 'Baby prediction',
        inputImageUrl: momImageUrl,
        options: {
          secondImageUrl: dadImageUrl,
          babyGender,
        },
      });

      return res.status(result.status === 'COMPLETED' ? 201 : 400).json({
        success: result.status === 'COMPLETED',
        data: result,
        message: result.status === 'COMPLETED' ? 'Baby prediction generated' : result.error,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  async createTalkingPhoto(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { duration, text, voiceStyle, imageUrl } = req.body;

      if (!duration || !text || !imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'duration (5 or 10), text, and imageUrl are required',
        });
      }

      const featureType = duration === 5 || duration === '5' ? 'TALKING_PHOTO_5S' : 'TALKING_PHOTO_10S';

      const result = await studioService.generate(userId, {
        featureType: featureType as StudioFeatureType,
        prompt: text,
        inputImageUrl: imageUrl,
        options: {
          voiceStyle: voiceStyle || 'female',
          text,
        },
      });

      return res.status(result.status === 'COMPLETED' ? 201 : 400).json({
        success: result.status === 'COMPLETED',
        data: result,
        message: result.status === 'COMPLETED' ? 'Talking photo created' : result.error,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  // ==========================================================================
  // PROMPT ENHANCEMENT
  // ==========================================================================

  async enhancePrompt(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { prompt, context } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'prompt is required',
        });
      }

      const enhanced = await studioService.enhancePrompt(prompt, context || 'image');

      return res.status(200).json({
        success: true,
        data: {
          original: prompt,
          enhanced,
        },
        message: 'Prompt enhanced',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  // ==========================================================================
  // BOOSTERS
  // ==========================================================================

  async purchaseBooster(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { boosterType, paymentVerified } = req.body;

      if (!boosterType || !['LITE', 'PRO', 'MAX'].includes(boosterType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid boosterType. Options: LITE, PRO, MAX',
        });
      }

      if (!paymentVerified) {
        const booster = BOOSTER_CONFIGS[boosterType as 'LITE' | 'PRO' | 'MAX'];
        return res.status(402).json({
          success: false,
          message: 'Payment required',
          paymentRequired: true,
          priceInRupees: booster.price,
          credits: booster.credits,
        });
      }

      const result = await studioService.addBoosterCredits(userId, boosterType as 'LITE' | 'PRO' | 'MAX');

      return res.status(200).json({
        success: true,
        data: result,
        message: `${boosterType} booster activated! +${result.credits} credits added`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  async getBoosterPricing(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      data: BOOSTER_CONFIGS,
    });
  }

  // ==========================================================================
  // HISTORY & STATUS
  // ==========================================================================

  async getGenerationStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { id: generationId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const generation = await studioService.getGeneration(generationId, userId);

      return res.status(200).json({ success: true, data: generation });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = message === 'Unauthorized' ? 403 : 404;
      return res.status(statusCode).json({ success: false, message });
    }
  }

  async getUserGenerations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string | undefined;

      const generations = await studioService.getUserGenerations(userId, {
        limit,
        offset,
        category: category as any,
      });

      return res.status(200).json({
        success: true,
        data: generations,
        count: generations.length,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  // ==========================================================================
  // STUDIO INFO
  // ==========================================================================

  async getStudioStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const status = await studioService.getStudioStatus(userId);

      return res.status(200).json({ success: true, data: status });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  async getAvailableFeatures(req: Request, res: Response) {
    const features = studioService.getAvailableFeatures();
    return res.status(200).json({
      success: true,
      data: features,
      summary: STUDIO_SUMMARY,
    });
  }

  async getFeatureCategories(req: Request, res: Response) {
    const categories = studioService.getFeatureCategories();
    return res.status(200).json({
      success: true,
      data: categories,
    });
  }

  async getUsageStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const days = parseInt(req.query.days as string) || 30;
      const stats = await studioService.getUsageStats(userId, days);

      return res.status(200).json({ success: true, data: stats });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ success: false, message });
    }
  }

  // ==========================================================================
  // DEPRECATED ENDPOINTS (Return helpful message)
  // ==========================================================================

  async deprecatedEndpoint(req: Request, res: Response) {
    return res.status(410).json({
      success: false,
      message: 'This endpoint is deprecated in Studio v2.0',
      alternative: 'Use POST /api/studio/generate with featureType parameter',
      docs: '/api/studio/features',
    });
  }
}

export const studioController = new StudioController();