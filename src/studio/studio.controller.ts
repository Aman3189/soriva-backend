// src/studio/studio.controller.ts
// ✅ PRODUCTION UPDATE: Logo + Talking Photos + Prompt Enhancement

import { Request, Response } from 'express';
import { studioService } from './studio.service';
import { ImageResolution, UpscaleMultiplier } from './types/studio.types';

export class StudioController {
  // ==========================================
  // BALANCE
  // ==========================================

  async getImageBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const balance = await studioService.getImageBalance(userId);
      return res.status(200).json({ success: true, data: balance });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Keep old endpoint for compatibility
  async getCreditsBalance(req: Request, res: Response) {
    return this.getImageBalance(req, res);
  }

  async getCreditsHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const generations = await studioService.getUserGenerations(userId, 50);
      return res.status(200).json({
        success: true,
        data: { generations, boosters: [] },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // IMAGE GENERATION (SDXL - With Prompt Enhancement)
  // ==========================================

  async generateImage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { prompt, resolution, language, negativePrompt } = req.body;

      if (!prompt || !resolution) {
        return res.status(400).json({
          success: false,
          message: 'prompt and resolution required',
        });
      }

      const validResolutions: ImageResolution[] = ['512x512', '1024x1024', '768x1024', '1024x768'];
      if (!validResolutions.includes(resolution)) {
        return res.status(400).json({
          success: false,
          message: `Invalid resolution: ${validResolutions.join(', ')}`,
        });
      }

      const generation = await studioService.createImageGeneration(
        userId,
        prompt,
        resolution,
        language || 'hinglish',
        negativePrompt
      );

      return res.status(201).json({
        success: true,
        data: generation,
        message: 'Image generated with Hinglish support',
      });
    } catch (error: any) {
      return res.status(error.message.includes('Need') ? 402 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ==========================================
  // LOGO GENERATION (NEW - 3 Previews + Final)
  // ==========================================

  async generateLogoPreviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { prompt, style } = req.body;

      if (!prompt) {
        return res.status(400).json({ success: false, message: 'prompt required' });
      }

      const logoRequest = {
        prompt,
        style: style || 'modern',
      };

      const previews = await studioService.createLogoPreviews(userId, logoRequest);

      return res.status(200).json({
        success: true,
        data: previews,
        message: '3 logo preview styles generated',
        note: 'Select your favorite style, then generate final logo with text',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async generateLogoFinal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { selectedPreviewId, businessName, tagline, enhancedPrompt, paymentVerified } = req.body;

      if (!selectedPreviewId || !businessName || !enhancedPrompt) {
        return res.status(400).json({
          success: false,
          message: 'selectedPreviewId, businessName, and enhancedPrompt required',
        });
      }

      if (!paymentVerified) {
        return res.status(402).json({
          success: false,
          message: 'Payment required',
          paymentRequired: true,
          priceInRupees: 29,
          features: [
            '3 SDXL preview styles (included)',
            'Stable Image Ultra final generation',
            'Perfect text rendering',
            'Professional business-ready quality',
          ],
        });
      }

      const logoRequest = {
        selectedPreviewId,
        businessName,
        tagline,
        enhancedPrompt,
      };

      const generation = await studioService.createLogoFinal(userId, logoRequest, paymentVerified);

      return res.status(201).json({
        success: true,
        data: generation,
        message: 'Professional logo generated with perfect text',
      });
    } catch (error: any) {
      return res.status(error.message.includes('Payment') ? 402 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getLogoPricing(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      data: {
        workflow: '3 SDXL previews (style selection) → Ultra final with text (₹29)',
        previewCost: 0,
        finalPrice: 29,
        totalCost: 29,
        model: 'Stable Image Ultra',
        textAccuracy: '98%',
        turnaroundTime: '30-60 seconds total',
      },
    });
  }

  // ==========================================
  // TALKING PHOTOS (NEW - Real Photo + AI Baby)
  // ==========================================

  async createTalkingPhoto(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { type, duration, text, voiceStyle, imageUrl, babyCustomization, paymentVerified } = req.body;

      if (!type || !duration || !text || !voiceStyle) {
        return res.status(400).json({
          success: false,
          message: 'type, duration, text, and voiceStyle required',
        });
      }

      if (type === 'real_photo' && !imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'imageUrl required for real_photo type',
        });
      }

      if (type === 'ai_baby' && !babyCustomization) {
        return res.status(400).json({
          success: false,
          message: 'babyCustomization required for ai_baby type',
        });
      }

      if (!paymentVerified) {
        const pricing = type === 'real_photo'
          ? duration === '5sec' ? 19 : 29
          : duration === '5sec' ? 29 : 39;

        return res.status(402).json({
          success: false,
          message: 'Payment required',
          paymentRequired: true,
          priceInRupees: pricing,
          type,
          duration,
          features: type === 'ai_baby' 
            ? ['AI baby generation', 'Perfect lip-sync', 'Natural animation', `${duration === '5sec' ? 5 : 10} seconds video`]
            : ['Upload your photo', 'Perfect lip-sync', 'Natural animation', `${duration === '5sec' ? 5 : 10} seconds video`],
        });
      }

      const talkingRequest = {
        type,
        duration,
        text,
        voiceStyle,
        imageUrl,
        babyCustomization,
      };

      const result = await studioService.createTalkingPhoto(userId, talkingRequest, paymentVerified);

      return res.status(201).json({
        success: true,
        data: result,
        message: `${type === 'ai_baby' ? 'AI baby' : 'Photo'} talking video created`,
      });
    } catch (error: any) {
      return res.status(error.message.includes('Payment') ? 402 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTalkingPhotoPricing(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      data: {
        real_photo: {
          '5sec': { price: 19, features: ['Upload photo', 'Lip-sync', '5s video'] },
          '10sec': { price: 29, features: ['Upload photo', 'Lip-sync', '10s video'] },
        },
        ai_baby: {
          '5sec': { price: 29, features: ['AI baby generation', 'Customization', 'Lip-sync', '5s video'] },
          '10sec': { price: 39, features: ['AI baby generation', 'Customization', 'Lip-sync', '10s video'] },
        },
        voiceStyles: ['male', 'female', 'child'],
        babyCustomization: ['age', 'skinTone', 'hairColor', 'eyeColor', 'expression', 'outfit'],
      },
    });
  }

  // ==========================================
  // PROMPT ENHANCEMENT (NEW - HAIKU)
  // ==========================================

  async enhancePrompt(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { prompt, language, context, culturalContext } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'prompt required',
        });
      }

      const enhancement = await studioService.enhancePrompt({
        originalPrompt: prompt,
        language: language || 'hinglish',
        context: context || 'general',
        culturalContext,
      });

      return res.status(200).json({
        success: true,
        data: enhancement,
        message: 'Prompt enhanced with Haiku',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ==========================================
  // UPSCALE (Optional - Kept for compatibility)
  // ==========================================

  async upscaleImage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { imageUrl, multiplier } = req.body;

      if (!imageUrl || !multiplier) {
        return res.status(400).json({
          success: false,
          message: 'imageUrl and multiplier required',
        });
      }

      const validMultipliers: UpscaleMultiplier[] = ['2x', '4x'];
      if (!validMultipliers.includes(multiplier)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid multiplier: 2x or 4x',
        });
      }

      const generation = await studioService.createImageUpscale(userId, imageUrl, multiplier);

      return res.status(201).json({
        success: true,
        data: generation,
        message: 'Image upscaled',
      });
    } catch (error: any) {
      return res.status(error.message.includes('Need') ? 402 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ==========================================
  // HISTORY & STATUS
  // ==========================================

  async getGenerationStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { id: generationId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const generation = await studioService.getGeneration(generationId, userId);

      return res.status(200).json({ success: true, data: generation });
    } catch (error: any) {
      return res
        .status(error.message === 'Unauthorized' ? 403 : 404)
        .json({ success: false, message: error.message });
    }
  }

  async getUserGenerations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const generations = await studioService.getUserGenerations(userId, limit);

      return res.status(200).json({
        success: true,
        data: generations,
        count: generations.length,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // ADMIN/SYSTEM
  // ==========================================

  async updateGenerationStatus(req: Request, res: Response) {
    try {
      const { id: generationId } = req.params;
      const { status, outputUrl, metadata, errorMessage } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'status required' });
      }

      const generation = await studioService.updateGenerationStatus(
        generationId,
        status,
        outputUrl,
        metadata,
        errorMessage
      );

      return res.status(200).json({ success: true, data: generation });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // DEPRECATED (Keep for compatibility)
  // ==========================================

  async requestPreview(req: Request, res: Response) {
    return res.status(410).json({ success: false, message: 'Previews deprecated' });
  }

  async getActiveBoosters(req: Request, res: Response) {
    return res.status(200).json({ success: true, data: [], count: 0 });
  }

  async purchaseBooster(req: Request, res: Response) {
    return res.status(410).json({ success: false, message: 'Boosters deprecated' });
  }

  async updatePreviewOutput(req: Request, res: Response) {
    return res.status(410).json({ success: false, message: 'Previews deprecated' });
  }

  async imageToVideo(req: Request, res: Response) {
    return res.status(410).json({ 
      success: false, 
      message: 'Image-to-Video deprecated - Use Talking Photos instead',
      alternative: 'POST /api/studio/talking-photo',
    });
  }
}

export const studioController = new StudioController();