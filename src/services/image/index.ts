// src/services/image/index.ts

/**
 * ==========================================
 * SORIVA IMAGE SERVICE - MAIN ORCHESTRATOR
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Orchestrate all image generation services
 * 
 * v10.2 Changes:
 * - Replaced Schnell/Fast with single Klein 9B model
 * - Simplified quota and provider selection
 * 
 * Flow:
 * 1. Detect Intent → Is this an image request?
 * 2. Check Quota → Does user have images left?
 * 3. Optimize Prompt → Translate & enhance
 * 4. Generate Image → Call Replicate API (Klein 9B)
 * 5. Deduct Quota → Update user's quota
 * 6. Log Generation → Save to database
 * Last Updated: January 17, 2026
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
  IMAGE_COSTS,
} from '../../types/image.types';

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
   * Full image generation pipeline
   * Called from chat flow when image intent is detected
   */
  public async generateImage(input: ImageGenerationInput): Promise<ImageApiResponse> {
    const { userId, prompt, sessionId } = input;
    const startTime = Date.now();

    try {
      console.log(`[ImageService] 🎨 Starting image generation for user: ${userId}`);

      // Step 1: Detect Intent (verify it's an image request)
      const intentResult = this.detectIntent(prompt);
      
      if (!intentResult.isImageRequest && intentResult.confidence < 0.1) {
        console.log(`[ImageService] 📋 Intent: ${intentResult.intentType}, Confidence: ${intentResult.confidence}`);
      }

      console.log(`[ImageService] 📋 Intent: ${intentResult.intentType}, Confidence: ${intentResult.confidence}`);

      // Step 2: Check Quota (always Klein 9B now)
      const quotaResult = await this.quotaManager.checkQuota(
        userId, 
        ImageProvider.KLEIN9B
      );

      if (!quotaResult.hasQuota) {
        return this.createResponse(
          false, 
          undefined, 
          quotaResult.reason || 'Image quota exhausted',
          'QUOTA_EXHAUSTED',
          this.createQuotaInfo(quotaResult)
        );
      }

      console.log(`[ImageService] ✅ Quota available: ${quotaResult.provider}`);

      // Step 3: Optimize Prompt
      const optimizedResult = await this.promptOptimizer.optimize(intentResult.extractedPrompt);
      console.log(`[ImageService] 📝 Optimized prompt: ${optimizedResult.optimizedPrompt.substring(0, 100)}...`);

      // Step 4: Provider is always Klein 9B
      const finalProvider = ImageProvider.KLEIN9B;

      console.log(`[ImageService] 🎯 Using provider: ${finalProvider}`);

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
          IMAGE_COSTS[finalProvider],
          generationResult.generationTimeMs
        );

        const totalTime = Date.now() - startTime;
        console.log(`[ImageService] ✅ Image generated successfully in ${totalTime}ms`);

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
            klein9bRemaining: deductResult.remainingKlein9b,
            totalRemaining: deductResult.totalRemaining,
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
   * Get user's image quota
   */
  public async getUserQuota(userId: string) {
    return this.quotaManager.getUserQuota(userId);
  }

  /**
   * Check if user has quota
   */
  public async checkQuota(userId: string, provider?: ImageProvider) {
    return this.quotaManager.checkQuota(userId, provider);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Create API response
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
      klein9bRemaining: number;
      totalRemaining: number;
    }
  ): ImageApiResponse {
    return {
      success,
      data,
      error,
      errorCode,
      quota,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create quota info from check result
   */
  private createQuotaInfo(quotaResult: QuotaCheckResult) {
    return {
      klein9bRemaining: quotaResult.availableKlein9b + quotaResult.boosterKlein9b,
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