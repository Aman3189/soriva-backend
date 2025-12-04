// src/modules/studio/studio.service.ts
// ✅ PRODUCTION UPDATE: December 4, 2025 - Abuse Controls
// ✅ Logo + Talking Photos + Prompt Enhancement
// ✅ Provider Factory Integration (Replicate/HeyGen)
// ✅ Plan-based hard limits (daily/hourly)
// ✅ Feature access validation

import { StudioFeatureType, PlanType } from '@prisma/client';
import { prisma } from '../core/services/prisma.service';
import {
  IMAGE_RESOLUTION_OPTIONS,
  UPSCALE_OPTIONS,
  ImageResolution,
  UpscaleMultiplier,
  LOGO_PRICING,
  TALKING_PHOTO_PRICING,
  PROMPT_ENHANCEMENT_COST,
  LogoStyle,
  LogoGenerationRequest,
  LogoPreviewResponse,
  LogoFinalRequest,
  TalkingPhotoRequest,
  TalkingPhotoResponse,
  TalkingPhotoType,
  TalkingDuration,
  VoiceStyle,
  AIBabyCustomization,
  PromptEnhancementRequest,
  PromptEnhancementResponse,
} from './types/studio.types';

// ✅ NEW: Import Provider Factory
import { TalkingPhotoProviderFactory } from './providers/TalkingPhotoProviderFactory';
import { STUDIO_CONFIG as studioConfig } from './config/studio.config';

// ⭐ NEW: Abuse limits integration
import { STUDIO_HARD_LIMITS } from '@/constants/abuse-limits';

// Studio feature type (local)
type StudioFeature = 'imageGeneration' | 'talkingPhoto' | 'logoPreview' | 'logoFinal';

// Environment variables
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// Plan image limits (no credits, just image count)
const PLAN_IMAGE_LIMITS: Record<string, number> = {
  STARTER: 0,    // ⭐ UPDATED: Starter has no studio access
  PLUS: 50,
  PRO: 120,
  APEX: 300,
};

// ⭐ NEW: Plan feature access
const PLAN_STUDIO_ACCESS: Record<string, boolean> = {
  STARTER: false,
  PLUS: true,
  PRO: true,
  APEX: true,
};

// Replicate Model IDs
const REPLICATE_MODELS = {
  SDXL: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  ULTRA: 'stability-ai/stable-diffusion-3', // Logo generation (final)
  UPSCALE: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
  IMAGE_TO_VIDEO: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
};

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
}

// ⭐ NEW: Usage tracking interface
interface UsageStats {
  imageGeneration: { daily: number; hourly: number };
  talkingPhoto: { daily: number; hourly: number };
  logoPreview: { daily: number };
  logoFinal: { daily: number };
}

export class StudioService {
  // ==========================================
  // ⭐ NEW: ABUSE CONTROL CHECKS
  // ==========================================

  /**
   * Check if user's plan has studio access
   */
  private async checkStudioAccess(userId: string): Promise<{ allowed: boolean; planType: string; reason?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });

    if (!user) {
      return { allowed: false, planType: 'UNKNOWN', reason: 'User not found' };
    }

    const hasAccess = PLAN_STUDIO_ACCESS[user.planType] ?? false;

    if (!hasAccess) {
      return {
        allowed: false,
        planType: user.planType,
        reason: 'Studio is not available on Starter plan. Please upgrade to Plus or higher.',
      };
    }

    return { allowed: true, planType: user.planType };
  }

  /**
   * Get user's usage stats for today/this hour
   */
  private async getUsageStats(userId: string): Promise<UsageStats> {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const hourStart = new Date(now);
    hourStart.setMinutes(0, 0, 0);

    // Get all generations for today
    const todayGenerations = await prisma.studioGeneration.findMany({
      where: {
        userId,
        createdAt: { gte: todayStart },
        status: { in: ['COMPLETED', 'PROCESSING'] },
      },
      select: {
        featureType: true,
        featureName: true,
        createdAt: true,
      },
    });

    // Count by feature type
    const stats: UsageStats = {
      imageGeneration: { daily: 0, hourly: 0 },
      talkingPhoto: { daily: 0, hourly: 0 },
      logoPreview: { daily: 0 },
      logoFinal: { daily: 0 },
    };

    for (const gen of todayGenerations) {
      const isThisHour = gen.createdAt >= hourStart;

      if (gen.featureType.includes('IMAGE_GENERATION')) {
        stats.imageGeneration.daily++;
        if (isThisHour) stats.imageGeneration.hourly++;
      } else if (gen.featureName?.includes('Talking Photo')) {
        stats.talkingPhoto.daily++;
        if (isThisHour) stats.talkingPhoto.hourly++;
      } else if (gen.featureName?.includes('Logo') && gen.featureName?.includes('Preview')) {
        stats.logoPreview.daily++;
      } else if (gen.featureName?.includes('Logo') && gen.featureName?.includes('Ultra')) {
        stats.logoFinal.daily++;
      }
    }

    return stats;
  }

  /**
   * Check if user can use a studio feature (hard limit check)
   */
  private async checkFeatureLimit(
    userId: string,
    feature: StudioFeature
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    const accessCheck = await this.checkStudioAccess(userId);
    if (!accessCheck.allowed) {
      return { allowed: false, reason: accessCheck.reason };
    }

    const planType = accessCheck.planType as 'STARTER' | 'PLUS' | 'PRO' | 'APEX';
    const usage = await this.getUsageStats(userId);
    const limits = STUDIO_HARD_LIMITS[planType];

    if (!limits) {
      return { allowed: false, reason: 'Plan limits not found' };
    }

    // Check limits based on feature
    switch (feature) {
      case 'imageGeneration': {
        const featureLimits = limits.imageGeneration;
        if (usage.imageGeneration.daily >= featureLimits.perDay) {
          return { allowed: false, reason: `Daily limit reached (${featureLimits.perDay}/day). Resets at midnight.` };
        }
        if (usage.imageGeneration.hourly >= featureLimits.perHour) {
          return { allowed: false, reason: `Hourly limit reached (${featureLimits.perHour}/hour). Try again soon.` };
        }
        return { allowed: true, remaining: featureLimits.perDay - usage.imageGeneration.daily };
      }
      case 'talkingPhoto': {
        const featureLimits = limits.talkingPhoto;
        if (usage.talkingPhoto.daily >= featureLimits.perDay) {
          return { allowed: false, reason: `Daily limit reached (${featureLimits.perDay}/day). Resets at midnight.` };
        }
        if (usage.talkingPhoto.hourly >= featureLimits.perHour) {
          return { allowed: false, reason: `Hourly limit reached (${featureLimits.perHour}/hour). Try again soon.` };
        }
        return { allowed: true, remaining: featureLimits.perDay - usage.talkingPhoto.daily };
      }
      case 'logoPreview': {
        const featureLimits = limits.logoPreview;
        if (usage.logoPreview.daily >= featureLimits.perDay) {
          return { allowed: false, reason: `Daily limit reached (${featureLimits.perDay}/day). Resets at midnight.` };
        }
        return { allowed: true, remaining: featureLimits.perDay - usage.logoPreview.daily };
      }
      case 'logoFinal': {
        const featureLimits = limits.logoFinal;
        if (usage.logoFinal.daily >= featureLimits.perDay) {
          return { allowed: false, reason: `Daily limit reached (${featureLimits.perDay}/day). Resets at midnight.` };
        }
        return { allowed: true, remaining: featureLimits.perDay - usage.logoFinal.daily };
      }
      default:
        return { allowed: false, reason: 'Unknown feature' };
    }
  }

  /**
   * Get user's studio limits and usage (for UI)
   */
  async getStudioLimitsStatus(userId: string) {
    const accessCheck = await this.checkStudioAccess(userId);
    
    if (!accessCheck.allowed) {
      return {
        success: false,
        hasAccess: false,
        planType: accessCheck.planType,
        message: accessCheck.reason,
      };
    }

    const planType = accessCheck.planType as 'STARTER' | 'PLUS' | 'PRO' | 'APEX';
    const usage = await this.getUsageStats(userId);
    const limits = STUDIO_HARD_LIMITS[planType];

    // Handle case where limits don't exist for plan
    if (!limits) {
      return {
        success: false,
        hasAccess: false,
        planType,
        message: 'Studio limits not configured for this plan',
      };
    }

    return {
      success: true,
      hasAccess: true,
      planType,
      limits: {
        imageGeneration: {
          daily: { used: usage.imageGeneration.daily, limit: limits.imageGeneration.perDay },
          hourly: { used: usage.imageGeneration.hourly, limit: limits.imageGeneration.perHour },
        },
        talkingPhoto: {
          daily: { used: usage.talkingPhoto.daily, limit: limits.talkingPhoto.perDay },
          hourly: { used: usage.talkingPhoto.hourly, limit: limits.talkingPhoto.perHour },
        },
        logoPreview: {
          daily: { used: usage.logoPreview.daily, limit: limits.logoPreview.perDay },
        },
        logoFinal: {
          daily: { used: usage.logoFinal.daily, limit: limits.logoFinal.perDay },
        },
      },
      resetsAt: {
        daily: this.getNextDailyReset(),
        hourly: this.getNextHourlyReset(),
      },
    };
  }

  private getNextDailyReset(): Date {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private getNextHourlyReset(): Date {
    const next = new Date();
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
  }

  // ==========================================
  // IMAGE BALANCE (Replaced Credits)
  // ==========================================

  async getImageBalance(userId: string) {
    // ⭐ Check access first
    const accessCheck = await this.checkStudioAccess(userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        studioImagesUsed: true,
        studioImagesRemaining: true,
        lastStudioReset: true,
        planType: true,
      },
    });

    if (!user) throw new Error('User not found');

    const planLimit = PLAN_IMAGE_LIMITS[user.planType] || 0;
    const nextReset = this.getNextResetDate(user.lastStudioReset);

    return {
      planType: user.planType,
      hasAccess: accessCheck.allowed,
      totalImages: planLimit,
      usedImages: user.studioImagesUsed,
      remainingImages: user.studioImagesRemaining,
      lastReset: user.lastStudioReset,
      nextReset,
    };
  }

  async hasEnoughImages(userId: string, required: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { studioImagesRemaining: true },
    });
    return user ? user.studioImagesRemaining >= required : false;
  }

  async deductImages(userId: string, amount: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        studioImagesUsed: { increment: amount },
        studioImagesRemaining: { decrement: amount },
      },
    });
  }

  async resetMonthlyImages(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });

    if (!user) throw new Error('User not found');

    const planLimit = PLAN_IMAGE_LIMITS[user.planType] || 0;

    await prisma.user.update({
      where: { id: userId },
      data: {
        studioImagesUsed: 0,
        studioImagesRemaining: planLimit,
        lastStudioReset: new Date(),
      },
    });
  }

  private getNextResetDate(lastReset: Date): Date {
    const next = new Date(lastReset);
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  async checkAndResetImages(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastStudioReset: true },
    });

    if (!user) return;

    const nextReset = this.getNextResetDate(user.lastStudioReset);
    if (new Date() >= nextReset) {
      await this.resetMonthlyImages(userId);
    }
  }

  // ==========================================
  // PROMPT ENHANCEMENT (NEW - HAIKU)
  // ==========================================

  async enhancePrompt(request: PromptEnhancementRequest): Promise<PromptEnhancementResponse> {
    const systemPrompt = `You are an expert prompt engineer for AI image generation. Transform user input (which may be in Hinglish, Hindi, Punjabi, or English) into detailed, professional English prompts for image generation APIs.

Rules:
1. Maintain cultural context (Indian festivals, traditions, clothing, etc.)
2. Add professional photography/art terminology
3. Keep the core intent but enhance with quality descriptors
4. For logos: emphasize "professional", "clean", "vector-style", "business-ready"
5. For babies: emphasize "cute", "innocent", "adorable", "high detail"
6. For general images: add "high quality", "detailed", "photorealistic" where appropriate

Context: ${request.context}
${request.culturalContext ? `Cultural Context: ${request.culturalContext}` : ''}

Transform this prompt into a perfect English prompt for image generation.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: PROMPT_ENHANCEMENT_COST.model,
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: `Original prompt: "${request.originalPrompt}"\n\nProvide only the enhanced English prompt, nothing else.`,
            },
          ],
          system: systemPrompt,
        }),
      });

      const data: any = await response.json();
      const enhancedPrompt = data.content[0].text.trim();

      return {
        originalPrompt: request.originalPrompt,
        enhancedPrompt,
        language: request.language,
        improvements: ['Professional terminology added', 'Cultural context maintained', 'Quality descriptors included'],
        cost: PROMPT_ENHANCEMENT_COST.perRequest,
        model: 'claude-haiku',
      };
    } catch (error: any) {
      // Fallback: return original if enhancement fails
      return {
        originalPrompt: request.originalPrompt,
        enhancedPrompt: request.originalPrompt,
        language: request.language,
        improvements: [],
        cost: 0,
        model: 'claude-haiku',
      };
    }
  }

  // ==========================================
  // REPLICATE API
  // ==========================================

  private async callReplicate(modelVersion: string, input: any): Promise<string> {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ version: modelVersion, input }),
    });

    const prediction = (await response.json()) as ReplicatePrediction;
    const result = await this.pollReplicateResult(prediction.id);
    return Array.isArray(result.output) ? result.output[0] : result.output;
  }

  private async pollReplicateResult(predictionId: string): Promise<any> {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        { headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` } }
      );

      const result: any = await response.json();

      if (result.status === 'succeeded') return result;
      if (result.status === 'failed') throw new Error(result.error || 'Failed');

      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Timeout');
  }

  // ==========================================
  // IMAGE GENERATION (SDXL - With Prompt Enhancement)
  // ==========================================

  async createImageGeneration(
    userId: string,
    prompt: string,
    resolution: ImageResolution,
    language: 'hinglish' | 'hindi' | 'english' | 'punjabi' = 'hinglish',
    negativePrompt?: string
  ) {
    // ⭐ NEW: Check hard limits first
    const limitCheck = await this.checkFeatureLimit(userId, 'imageGeneration');
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.reason || 'Daily limit reached for image generation');
    }

    const resConfig = IMAGE_RESOLUTION_OPTIONS[resolution];
    const imagesRequired = 1;

    const hasImages = await this.hasEnoughImages(userId, imagesRequired);
    if (!hasImages) {
      throw new Error(`Need ${imagesRequired} images. Upgrade your plan.`);
    }

    // Enhance prompt using Haiku
    const enhancement = await this.enhancePrompt({
      originalPrompt: prompt,
      language,
      context: 'image',
    });

    await this.deductImages(userId, imagesRequired);

    const generation = await prisma.studioGeneration.create({
      data: {
        userId,
        featureType: resolution === '512x512' ? 'IMAGE_GENERATION_512' : 'IMAGE_GENERATION_1024',
        featureName: `Image ${resolution}`,
        userPrompt: prompt,
        parameters: {
          resolution,
          negativePrompt,
          model: 'sdxl',
          enhancedPrompt: enhancement.enhancedPrompt,
          originalLanguage: language,
        },
        creditsUsed: 0,
        previewCredits: 0,
        generationCredits: 0,
        apiCost: resConfig.estimatedCost + PROMPT_ENHANCEMENT_COST.perRequest,
        status: 'PROCESSING',
        outputType: 'image',
      },
    });

    try {
      const outputUrl = await this.callReplicate(REPLICATE_MODELS.SDXL, {
        prompt: enhancement.enhancedPrompt,
        negative_prompt: negativePrompt || 'blurry, bad quality, distorted',
        width: resConfig.width,
        height: resConfig.height,
      });

      await this.updateGenerationStatus(generation.id, 'COMPLETED', outputUrl, { resolution });
      return await this.getGeneration(generation.id, userId);
    } catch (error: any) {
      await this.updateGenerationStatus(generation.id, 'FAILED', undefined, undefined, error.message);
      throw error;
    }
  }

  // ==========================================
  // LOGO GENERATION (NEW - 3 Previews + Final)
  // ==========================================

  async createLogoPreviews(
    userId: string,
    request: LogoGenerationRequest
  ): Promise<LogoPreviewResponse> {
    // ⭐ NEW: Check hard limits first
    const limitCheck = await this.checkFeatureLimit(userId, 'logoPreview');
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.reason || 'Daily limit reached for logo previews');
    }

    // Enhance prompt for logo generation
    const enhancement = await this.enhancePrompt({
      originalPrompt: request.prompt,
      language: 'hinglish',
      context: 'logo',
      culturalContext: 'Professional business logo for Indian market',
    });

    const previews: LogoPreviewResponse['previews'] = [];

    // Generate 3 preview variations using SDXL (no text)
    for (let i = 0; i < 3; i++) {
      try {
        const styleVariation = ['modern minimalist', 'professional elegant', 'creative bold'][i];
        const logoPrompt = `${enhancement.enhancedPrompt}, ${styleVariation}, logo design, no text, icon only, clean background, ${request.style || 'modern'} style`;

        const outputUrl = await this.callReplicate(REPLICATE_MODELS.SDXL, {
          prompt: logoPrompt,
          negative_prompt: 'text, letters, words, typography, blurry, bad quality',
          width: 1024,
          height: 1024,
        });

        previews.push({
          id: `preview_${i + 1}_${Date.now()}`,
          url: outputUrl,
          style: styleVariation,
          status: 'ready',
        });
      } catch (error) {
        previews.push({
          id: `preview_${i + 1}_${Date.now()}`,
          url: '',
          style: ['modern minimalist', 'professional elegant', 'creative bold'][i],
          status: 'failed',
        });
      }
    }

    return {
      previews,
      totalCost: LOGO_PRICING.preview.totalCost,
      previewCount: 3,
    };
  }

  async createLogoFinal(
    userId: string,
    request: LogoFinalRequest,
    paymentVerified: boolean
  ) {
    // ⭐ NEW: Check hard limits first
    const limitCheck = await this.checkFeatureLimit(userId, 'logoFinal');
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.reason || 'Daily limit reached for logo finals');
    }

    if (!paymentVerified) {
      throw new Error('Payment required: ₹29');
    }

    const generation = await prisma.studioGeneration.create({
      data: {
        userId,
        featureType: 'IMAGE_GENERATION_1024', // Using existing type
        featureName: 'Logo Generation (Ultra)',
        userPrompt: request.enhancedPrompt,
        parameters: {
          model: 'ultra',
          businessName: request.businessName,
          tagline: request.tagline,
          selectedPreview: request.selectedPreviewId,
        } as any,
        creditsUsed: 0,
        previewCredits: 0,
        generationCredits: 0,
        apiCost: LOGO_PRICING.final.estimatedCost,
        status: 'PROCESSING',
        outputType: 'image',
      },
    });

    try {
      const finalPrompt = `Professional business logo, ${request.enhancedPrompt}, text: "${request.businessName}"${
        request.tagline ? `, tagline: "${request.tagline}"` : ''
      }, vector style, clean, high quality, perfect typography, business-ready`;

      const outputUrl = await this.callReplicate(REPLICATE_MODELS.ULTRA, {
        prompt: finalPrompt,
        width: 1024,
        height: 1024,
      });

      await this.updateGenerationStatus(generation.id, 'COMPLETED', outputUrl, {
        model: 'ultra',
        isLogo: true,
        businessName: request.businessName,
      });

      return await this.getGeneration(generation.id, userId);
    } catch (error: any) {
      await this.updateGenerationStatus(generation.id, 'FAILED', undefined, undefined, error.message);
      throw error;
    }
  }

  // ==========================================
  // ✅ TALKING PHOTOS (UPDATED - Provider Factory)
  // ==========================================

  async createTalkingPhoto(
    userId: string,
    request: TalkingPhotoRequest,
    paymentVerified: boolean
  ): Promise<TalkingPhotoResponse> {
    // ⭐ NEW: Check hard limits first
    const limitCheck = await this.checkFeatureLimit(userId, 'talkingPhoto');
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.reason || 'Daily limit reached for talking photos');
    }

    const pricing = TALKING_PHOTO_PRICING[request.type][request.duration];

    if (!paymentVerified) {
      throw new Error(`Payment required: ₹${pricing.price}`);
    }

    let imageUrl = request.imageUrl;

    // If AI baby, generate the baby image first
    if (request.type === 'ai_baby' && request.babyCustomization) {
      imageUrl = await this.generateAIBaby(request.babyCustomization);
    }

    if (!imageUrl) {
      throw new Error('Image URL required');
    }

    const generation = await prisma.studioGeneration.create({
      data: {
        userId,
        featureType: 'IMAGE_TO_VIDEO', // Reusing for now
        featureName: `Talking Photo (${request.type})`,
        userPrompt: request.text,
        parameters: {
          type: request.type,
          duration: request.duration,
          voiceStyle: request.voiceStyle,
          imageUrl,
          babyCustomization: request.babyCustomization || null,
          provider: studioConfig.talkingPhotos.currentProvider, // ✅ Track provider used
        } as any,
        creditsUsed: 0,
        previewCredits: 0,
        generationCredits: 0,
        apiCost: pricing.estimatedCost,
        status: 'PROCESSING',
        outputType: 'video',
      },
    });

    try {
      // ✅ NEW: Use Provider Factory instead of hardcoded D-ID
      const provider = TalkingPhotoProviderFactory.getProvider();
      
      const videoUrl = await provider.createTalkingPhoto({
        imageUrl,
        text: request.text,
        voiceStyle: request.voiceStyle,
        duration: request.duration === '5sec' ? 5 : 10,
        userId, // For tracking
      });

      await this.updateGenerationStatus(generation.id, 'COMPLETED', videoUrl, {
        type: request.type,
        duration: request.duration,
        provider: studioConfig.talkingPhotos.currentProvider,
      });

      return {
        videoUrl,
        duration: pricing.duration,
        cost: pricing.price,
        type: request.type,
        status: 'completed',
        estimatedTime: '30-60 seconds',
      };
    } catch (error: any) {
      await this.updateGenerationStatus(generation.id, 'FAILED', undefined, undefined, error.message);
      
      // ✅ Enhanced error handling with provider info
      throw new Error(`Talking photo creation failed (${studioConfig.talkingPhotos.currentProvider}): ${error.message}`);
    }
  }

  private async generateAIBaby(customization: AIBabyCustomization): Promise<string> {
    const prompt = `Adorable ${customization.age} old Indian baby, ${customization.skinTone} skin tone, ${customization.hairColor} hair, ${customization.eyeColor} eyes, ${customization.expression} expression, wearing ${customization.outfit} outfit, high quality, detailed, photorealistic, studio lighting${
      customization.additionalDetails ? `, ${customization.additionalDetails}` : ''
    }`;

    const enhancement = await this.enhancePrompt({
      originalPrompt: prompt,
      language: 'english',
      context: 'baby',
      culturalContext: 'Cute Indian baby for family content',
    });

    return await this.callReplicate(REPLICATE_MODELS.SDXL, {
      prompt: enhancement.enhancedPrompt,
      negative_prompt: 'ugly, distorted, blurry, bad anatomy, adult, scary',
      width: 1024,
      height: 1024,
    });
  }

  // ==========================================
  // UPSCALE (Uses Plan Images)
  // ==========================================

  async createImageUpscale(userId: string, imageUrl: string, multiplier: UpscaleMultiplier) {
    // ⭐ NEW: Check studio access
    const accessCheck = await this.checkStudioAccess(userId);
    if (!accessCheck.allowed) {
      throw new Error(accessCheck.reason);
    }

    const upscaleConfig = UPSCALE_OPTIONS[multiplier];
    const imagesRequired = multiplier === '2x' ? 1 : 2;

    const hasImages = await this.hasEnoughImages(userId, imagesRequired);
    if (!hasImages) {
      throw new Error(`Need ${imagesRequired} images.`);
    }

    await this.deductImages(userId, imagesRequired);

    const generation = await prisma.studioGeneration.create({
      data: {
        userId,
        featureType: multiplier === '2x' ? 'IMAGE_UPSCALE_2X' : 'IMAGE_UPSCALE_4X',
        featureName: `Upscale ${multiplier}`,
        userPrompt: `Upscale ${multiplier}`,
        parameters: { imageUrl, multiplier } as any,
        creditsUsed: 0,
        previewCredits: 0,
        generationCredits: 0,
        apiCost: upscaleConfig.estimatedCost,
        status: 'PROCESSING',
        outputType: 'image',
      },
    });

    try {
      const scale = parseInt(multiplier.replace('x', ''));
      const outputUrl = await this.callReplicate(REPLICATE_MODELS.UPSCALE, {
        image: imageUrl,
        scale,
      });

      await this.updateGenerationStatus(generation.id, 'COMPLETED', outputUrl, { multiplier });
      return await this.getGeneration(generation.id, userId);
    } catch (error: any) {
      await this.updateGenerationStatus(generation.id, 'FAILED', undefined, undefined, error.message);
      throw error;
    }
  }

  // ==========================================
  // UTILITY
  // ==========================================

  async getUserGenerations(userId: string, limit: number = 20) {
    return await prisma.studioGeneration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getGeneration(generationId: string, userId: string) {
    const generation = await prisma.studioGeneration.findUnique({
      where: { id: generationId },
    });

    if (!generation) throw new Error('Not found');
    if (generation.userId !== userId) throw new Error('Unauthorized');

    return generation;
  }

  async updateGenerationStatus(
    generationId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    outputUrl?: string,
    metadata?: Record<string, any>,
    errorMessage?: string
  ) {
    return await prisma.studioGeneration.update({
      where: { id: generationId },
      data: {
        status,
        outputUrl,
        metadata,
        errorMessage,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  // ==========================================
  // 🔧 PROVIDER MANAGEMENT (Admin/Testing)
  // ==========================================

  /**
   * Get current talking photo provider stats
   */
  async getProviderStats(userId: string) {
    const isAdmin = await this.checkAdminAccess(userId);
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    return {
      currentProvider: studioConfig.talkingPhotos.currentProvider,
      replicateConfig: studioConfig.talkingPhotos.replicate,
      heygenConfig: studioConfig.talkingPhotos.heygen,
      availableProviders: ['replicate', 'heygen'],
    };
  }

  /**
   * Switch provider (admin only)
   */
  async switchProvider(userId: string, provider: 'replicate' | 'heygen') {
    const isAdmin = await this.checkAdminAccess(userId);
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    // In production, this would update database config
    // For now, just validate
    if (!['replicate', 'heygen'].includes(provider)) {
      throw new Error('Invalid provider');
    }

    return {
      message: `Provider switched to ${provider}`,
      note: 'Update studio.config.ts to persist change',
      newProvider: provider,
    };
  }

  private async checkAdminAccess(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // Add admin emails here
    const adminEmails = ['aman@risenex.com', 'admin@soriva.ai'];
    return user ? adminEmails.includes(user.email) : false;
  }

  // ==========================================
  // OLD BOOSTER METHODS (Keep for compatibility)
  // ==========================================

  async getActiveBoosters(userId: string) {
    return [];
  }

  async purchaseBooster(userId: string, boosterType: any) {
    throw new Error('Boosters deprecated');
  }

  getFeaturePricing(featureType: StudioFeatureType) {
    return { baseCredits: 0, previewCredits: 0 };
  }

  calculateTotalCredits(featureType: StudioFeatureType) {
    return 0;
  }

  async getCreditsBalance(userId: string) {
    const balance = await this.getImageBalance(userId);
    return {
      total: balance.totalImages,
      used: balance.usedImages,
      remaining: balance.remainingImages,
      carryForward: 0,
      lastReset: balance.lastReset,
      nextReset: balance.nextReset,
    };
  }

  async createPreview(generationId: string, userId: string) {
    throw new Error('Previews deprecated');
  }

  async getCreditsHistory(userId: string) {
    return { generations: [], boosters: [] };
  }
}

export const studioService = new StudioService();