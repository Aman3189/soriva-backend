// src/services/image/index.ts

/**
 * ==========================================
 * SORIVA IMAGE SERVICE - MAIN ORCHESTRATOR
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Orchestrate all image generation services
 * 
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 * 
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 * 
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25/image - General images (scenery, nature, animals)
 *    - GPT LOW (OpenAI gpt-image-1.5): ₹1.18/image - Text, Ads, Festivals, Transforms
 * 
 * ✅ ROUTING LOGIC:
 *    - Scenery/Nature/Animals → Schnell (₹0.25)
 *    - Text/Ads/Festivals/Posters/Transforms → GPT LOW (₹1.18)
 * 
 * ==========================================
 * v10.4 (January 19, 2026): [SUPERSEDED]
 * ==========================================
 * - DUAL MODEL SYSTEM: Klein 9B + Schnell
 * - Smart routing based on prompt content
 * 
 * Flow:
 * 1. Detect Intent → Is this an image request?
 * 2. Smart Route → Schnell or GPT LOW based on content
 * 3. Check Quota → Does user have images left for that provider?
 * 4. Optimize Prompt → Translate & enhance
 * 5. Generate Image → Call Fal.ai (Schnell) or OpenAI (GPT LOW)
 * 6. Deduct Quota → Update user's quota
 * 7. Log Generation → Save to database
 * 
 * Last Updated: February 22, 2026
 */

import { PrismaClient } from '@prisma/client';
import { ImageIntentDetector, detectImageIntent } from './intentDetector';
import { PromptOptimizer, optimizePrompt } from './promptOptimizer';
import { ImageQuotaManager, createImageQuotaManager } from './quotaManager';
import { ImageGenerator, generateImage } from './imageGenerator';
import {
  ImageGenerationInput,
  ImageGenerationResult,
  ImageApiResponse,
  ImageProvider,
  ImageIntentType,
  IntentDetectionResult,
  QuotaCheckResult,
  PromptOptimizationResult,
  IMAGE_COST_BY_PROVIDER,
} from '../../types/image.types';


// ==========================================
// SMART ROUTING LOGIC
// ==========================================

// ==========================================
// IMAGE SERVICE CLASS
// ==========================================

export class ImageService {
  private static instance: ImageService;
  private prisma: PrismaClient;
  private intentDetector: ImageIntentDetector;
  private promptOptimizer: PromptOptimizer;
  private quotaManager: ImageQuotaManager;
  private imageGenerator: ImageGenerator;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.intentDetector = ImageIntentDetector.getInstance();
    this.promptOptimizer = PromptOptimizer.getInstance();
    this.quotaManager = createImageQuotaManager(prisma);
    this.imageGenerator = ImageGenerator.getInstance();
    
    console.log('[ImageService] ✅ v12.0 Ready (2-Model System: Schnell + GPT LOW)');
  }

  public static getInstance(prisma: PrismaClient): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService(prisma);
    }
    return ImageService.instance;
  }

  // ==========================================
  // MAIN GENERATION METHOD
  // ==========================================

  /**
   * Full image generation pipeline with 2-model support
   * v12.0: Routes between Schnell and GPT LOW based on content
   * 
   * @param input - Image generation input
   * @returns Image API response with generation result
   */
  public async generateImage(input: ImageGenerationInput): Promise<ImageApiResponse> {
    const { userId, prompt, provider: requestedProvider, sessionId } = input;
    const startTime = Date.now();

    try {
      console.log(`[ImageService] 🎨 Starting image generation for user: ${userId}`);

      // Step 1: Detect Intent (verify it's an image request)
      const intentResult = this.detectIntent(prompt);
      
      console.log(`[ImageService] 📋 Intent: ${intentResult.intentType}, Confidence: ${intentResult.confidence}`);

      // Step 2: Optimize Prompt first (for better routing decision)
      const optimizedResult = await this.promptOptimizer.optimize(intentResult.extractedPrompt);
      console.log(`[ImageService] 📝 Optimized prompt: ${optimizedResult.optimizedPrompt.substring(0, 100)}...`);

      // Step 3: Use provider from Controller (already routed based on intent)
      // Controller handles routing: text/ads/festivals → GPT LOW, general → Schnell
      let finalProvider: ImageProvider = requestedProvider || ImageProvider.SCHNELL;
      let routingReason: string = `Using ${finalProvider} (routed by controller)`;

      console.log(`[ImageService] 🎯 Provider: ${finalProvider} - ${routingReason}`);

      // Step 4: Check Quota for selected provider
      const quotaResult = await this.quotaManager.checkQuota(userId, finalProvider);

      if (!quotaResult.hasQuota) {
        // Try fallback to other provider if quota exhausted
        const fallbackProvider = finalProvider === ImageProvider.GPT_LOW 
          ? ImageProvider.SCHNELL 
          : ImageProvider.GPT_LOW;
        
        const fallbackQuota = await this.quotaManager.checkQuota(userId, fallbackProvider);
        
        if (fallbackQuota.hasQuota) {
          console.log(`[ImageService] ⚠️ ${finalProvider} quota exhausted, falling back to ${fallbackProvider}`);
          finalProvider = fallbackProvider;
          routingReason = `Fallback to ${fallbackProvider} (${requestedProvider || 'original'} quota exhausted)`;
        } else {
          return this.createResponse(
            false, 
            undefined, 
            quotaResult.reason || 'Image quota exhausted for all providers',
            'QUOTA_EXHAUSTED',
            this.createQuotaInfo(quotaResult)
          );
        }
      }

      console.log(`[ImageService] ✅ Quota available: ${finalProvider}`);

      // Step 5: Generate Image
      const generationResult = await this.imageGenerator.generate(
        optimizedResult.optimizedPrompt,
        finalProvider,
        input.aspectRatio
      );

      // Step 6: Handle result
      if (generationResult.success && generationResult.imageUrl) {
        // Deduct quota
        const deductResult = await this.quotaManager.deductQuota(userId, finalProvider);
        
        // Log generation
        await this.logGeneration(
          userId,
          finalProvider,
          prompt,
          optimizedResult.optimizedPrompt,
          generationResult.imageUrl,
          'success',
          IMAGE_COST_BY_PROVIDER[finalProvider],
          generationResult.generationTimeMs
        );

        const totalTime = Date.now() - startTime;
        console.log(`[ImageService] ✅ Image generated successfully in ${totalTime}ms using ${finalProvider}`);

        return this.createResponse(
          true,
          {
            imageUrl: generationResult.imageUrl,
            provider: finalProvider,
            generationTimeMs: generationResult.generationTimeMs,
          },
          undefined,
          undefined,
          {
            schnellRemaining: deductResult.remainingSchnell,
            gptLowRemaining: deductResult.remainingGptLow,
            totalRemaining: deductResult.totalRemaining,
          },
          {
            provider: finalProvider,
            reason: routingReason,
            cost: `₹${IMAGE_COST_BY_PROVIDER[finalProvider]}`,
          }
        );
      }

      // Generation failed
      await this.logGeneration(
        userId,
        finalProvider,
        prompt,
        optimizedResult.optimizedPrompt,
        undefined,
        'failed',
        0,
        generationResult.generationTimeMs,
        generationResult.error
      );

      return this.createResponse(
        false,
        undefined,
        generationResult.error || 'Image generation failed',
        generationResult.errorCode
      );

    } catch (error) {
      console.error('[ImageService] ❌ Error:', error);
      
      return this.createResponse(
        false,
        undefined,
        error instanceof Error ? error.message : 'Unknown error',
        'INTERNAL_ERROR'
      );
    }
  }

  // ==========================================
  // INTENT DETECTION (for chat integration)
  // ==========================================

  /**
   * Check if message is an image request
   * Can be called from ChatService before processing
   */
  public detectIntent(message: string): IntentDetectionResult {
    return this.intentDetector.detect({ message });
  }

  /**
   * Quick check - is this an image request?
   */
  public isImageRequest(message: string): boolean {
    const result = this.detectIntent(message);
    return result.isImageRequest && result.confidence >= 0.5;
  }

  // ==========================================
  // PROMPT OPTIMIZATION
  // ==========================================

  /**
   * Optimize prompt for image generation
   */
  public async optimizePrompt(prompt: string): Promise<PromptOptimizationResult> {
    return this.promptOptimizer.optimize(prompt);
  }

  // ==========================================
  // DATABASE LOGGING
  // ==========================================

  /**
   * Log image generation to database
   */
  private async logGeneration(
    userId: string,
    provider: ImageProvider,
    prompt: string,
    optimizedPrompt: string,
    imageUrl: string | undefined,
    status: string,
    costINR: number,
    generationTimeMs: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await this.prisma.imageGeneration.create({
        data: {
          userId,
          provider,
          prompt,
          optimizedPrompt,
          imageUrl,
          status,
          costINR,
          generationTime: generationTimeMs,
          errorMessage,
        },
      });
    } catch (error) {
      console.error('[ImageService] Error logging generation:', error);
      // Don't throw - logging failure shouldn't break the flow
    }
  }

  // ==========================================
  // QUOTA METHODS
  // ==========================================

  /**
   * Get user's image quota (both Schnell and GPT LOW)
   * v12.0: Returns quotas for 2-model system
   */
  public async getUserQuota(userId: string) {
    return this.quotaManager.getUserQuota(userId);
  }

  /**
   * Check if user has quota for specific provider
   */
  public async checkQuota(userId: string, provider?: ImageProvider) {
    return this.quotaManager.checkQuota(userId, provider);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Create API response with routing info
   * v12.0: Updated for Schnell + GPT LOW
   */
  private createResponse(
    success: boolean,
    data?: {
      imageUrl: string;
      provider: ImageProvider;
      generationTimeMs: number;
    },
    error?: string,
    errorCode?: string,
    quota?: {
      schnellRemaining: number;
      gptLowRemaining: number;
      totalRemaining: number;
    },
    routing?: {
      provider: ImageProvider;
      reason: string;
      cost: string;
    }
  ): ImageApiResponse {
    return {
      success,
      data,
      routing: routing ? {
        provider: routing.provider,
        reason: routing.reason,
        cost: routing.cost,
      } : undefined,
      error,
      errorCode,
      quota: quota ? {
        schnellRemaining: quota.schnellRemaining,
        gptLowRemaining: quota.gptLowRemaining,
        totalRemaining: quota.totalRemaining,
      } : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create quota info from check result
   * v12.0: Updated for Schnell + GPT LOW
   */
  private createQuotaInfo(quotaResult: QuotaCheckResult) {
    return {
      schnellRemaining: quotaResult.availableSchnell + quotaResult.boosterSchnell,
      gptLowRemaining: quotaResult.availableGptLow + quotaResult.boosterGptLow,
      totalRemaining: quotaResult.totalAvailable,
    };
  }
}

// ==========================================
// EXPORTS
// ==========================================

export { ImageIntentDetector, detectImageIntent } from './intentDetector';
export { PromptOptimizer, optimizePrompt } from './promptOptimizer';
export { ImageQuotaManager, createImageQuotaManager } from './quotaManager';
export { ImageGenerator, generateImage } from './imageGenerator';

// Factory function
export function createImageService(prisma: PrismaClient): ImageService {
  return ImageService.getInstance(prisma);
}