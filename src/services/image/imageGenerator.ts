// src/services/image/imageGenerator.ts

/**
 * ==========================================
 * SORIVA IMAGE GENERATOR
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Generate images using dual model system
 * 
 * DUAL MODEL SYSTEM (v10.4):
 * - Klein 9B (BFL API): ₹1.26/image - Text/Deities/Festivals
 * - Schnell (Fal.ai): ₹0.25/image - General images
 * 
 * Last Updated: January 19, 2026
 * 
 * CHANGELOG v10.4:
 * - Added Fal.ai Schnell integration
 * - Smart provider selection
 * - Separate API handling for each provider
 */

import {
  ImageGenerationResult,
  ImageProvider,
  IMAGE_COSTS,
} from '../../types/image.types';

// ==========================================
// API TYPES
// ==========================================

// BFL API Types (Klein 9B)
interface BFLCreateResponse {
  id: string;
  polling_url?: string;
}

interface BFLPollResponse {
  id: string;
  status: 'Pending' | 'Ready' | 'Error' | 'Content Moderated' | 'Request Moderated';
  result?: {
    sample: string; // Image URL
  };
  error?: string;
}

// Fal.ai API Types (Schnell)
interface FalResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings?: {
    inference: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
}

// ==========================================
// IMAGE GENERATOR CLASS
// ==========================================

export class ImageGenerator {
  private static instance: ImageGenerator;
  
  // API Keys
  private bflApiKey: string;
  private falApiKey: string;
  
  // Base URLs
  private bflBaseUrl = 'https://api.bfl.ai/v1';
  private falBaseUrl = 'https://fal.run/fal-ai/flux/schnell';

  private constructor() {
    this.bflApiKey = process.env.BFL_API_KEY || '';
    this.falApiKey = process.env.FAL_KEY || '';
    
    if (!this.bflApiKey) {
      console.warn('[ImageGenerator] ⚠️ BFL_API_KEY not set!');
    }
    if (!this.falApiKey) {
      console.warn('[ImageGenerator] ⚠️ FAL_KEY not set!');
    }
  }

  public static getInstance(): ImageGenerator {
    if (!ImageGenerator.instance) {
      ImageGenerator.instance = new ImageGenerator();
    }
    return ImageGenerator.instance;
  }

  // ==========================================
  // MAIN GENERATION METHOD
  // ==========================================

  /**
   * Generate image using selected provider
   * Routes to Klein 9B (BFL) or Schnell (Fal.ai)
   */
  public async generate(
    prompt: string,
    provider: ImageProvider = ImageProvider.SCHNELL,
    aspectRatio: string = '1:1'
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`[ImageGenerator] 🎨 Generating with ${provider}...`);
      console.log(`[ImageGenerator] 📝 Prompt: ${prompt.substring(0, 100)}...`);

      // Route to appropriate provider
      if (provider === ImageProvider.KLEIN9B) {
        return await this.generateWithKlein9B(prompt, aspectRatio, startTime);
      } else {
        return await this.generateWithSchnell(prompt, aspectRatio, startTime);
      }

    } catch (error) {
      console.error('[ImageGenerator] ❌ Error:', error);

      return this.createErrorResult(
        prompt,
        provider,
        error instanceof Error ? error.message : 'Unknown error',
        'API_ERROR'
      );
    }
  }

  // ==========================================
  // KLEIN 9B (BFL API)
  // ==========================================

  /**
   * Generate image using FLUX.2 Klein 9B via BFL API
   * Best for: Text, Cards, Deities, Festivals
   * Cost: ₹1.26/image
   */
  private async generateWithKlein9B(
    prompt: string,
    aspectRatio: string,
    startTime: number
  ): Promise<ImageGenerationResult> {
    const provider = ImageProvider.KLEIN9B;

    // Validate API key
    if (!this.bflApiKey) {
      return this.createErrorResult(
        prompt,
        provider,
        'BFL_API_KEY not configured',
        'CONFIG_ERROR'
      );
    }

    // Get dimensions from aspect ratio
    const { width, height } = this.getDimensions(aspectRatio);
    
    console.log(`[ImageGenerator] 🎯 Klein 9B - Size: ${width}x${height}`);

    // Step 1: Create prediction (async request)
    const createResponse = await this.bflCreatePrediction(prompt, width, height);

    if (!createResponse || !createResponse.id) {
      return this.createErrorResult(
        prompt,
        provider,
        'Failed to create BFL prediction',
        'PREDICTION_ERROR'
      );
    }

    console.log(`[ImageGenerator] ⏳ BFL Prediction: ${createResponse.id}`);

    // Step 2: Poll for result
    const result = await this.bflPollForResult(createResponse.id);

    const generationTime = Date.now() - startTime;

    if (result.status === 'Ready' && result.result?.sample) {
      console.log(`[ImageGenerator] ✅ Klein 9B completed in ${generationTime}ms`);
      
      return {
        success: true,
        imageUrl: result.result.sample,
        provider,
        prompt,
        optimizedPrompt: prompt,
        generationTimeMs: generationTime,
        costINR: IMAGE_COSTS[provider],
      };
    }

    // Handle moderation
    if (result.status === 'Content Moderated' || result.status === 'Request Moderated') {
      return this.createErrorResult(
        prompt,
        provider,
        'Content was moderated by safety filters',
        'MODERATION_ERROR'
      );
    }

    return this.createErrorResult(
      prompt,
      provider,
      result.error || 'Klein 9B generation failed',
      'GENERATION_ERROR'
    );
  }

  // ==========================================
  // SCHNELL (FAL.AI API)
  // ==========================================

  /**
   * Generate image using FLUX Schnell via Fal.ai
   * Best for: General images (people, animals, scenery)
   * Cost: ₹0.25/image
   */
  private async generateWithSchnell(
    prompt: string,
    aspectRatio: string,
    startTime: number
  ): Promise<ImageGenerationResult> {
    const provider = ImageProvider.SCHNELL;

    // Validate API key
    if (!this.falApiKey) {
      return this.createErrorResult(
        prompt,
        provider,
        'FAL_KEY not configured',
        'CONFIG_ERROR'
      );
    }

    // Get dimensions from aspect ratio
    const { width, height } = this.getDimensions(aspectRatio);
    
    console.log(`[ImageGenerator] ⚡ Schnell - Size: ${width}x${height}`);

    try {
      // Fal.ai is synchronous (faster!)
      const response = await fetch(this.falBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.falApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image_size: { width, height },
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
          output_format: 'jpeg',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ImageGenerator] Fal.ai Error:', response.status, errorText);
        return this.createErrorResult(
          prompt,
          provider,
          `Fal.ai API error: ${response.status}`,
          'API_ERROR'
        );
      }

      const result = await response.json() as FalResponse;
      const generationTime = Date.now() - startTime;

      if (result.images && result.images.length > 0 && result.images[0].url) {
        console.log(`[ImageGenerator] ✅ Schnell completed in ${generationTime}ms`);
        
        return {
          success: true,
          imageUrl: result.images[0].url,
          provider,
          prompt,
          optimizedPrompt: prompt,
          generationTimeMs: generationTime,
          costINR: IMAGE_COSTS[provider],
        };
      }

      // Check for NSFW
      if (result.has_nsfw_concepts && result.has_nsfw_concepts[0]) {
        return this.createErrorResult(
          prompt,
          provider,
          'Content was flagged as inappropriate',
          'MODERATION_ERROR'
        );
      }

      return this.createErrorResult(
        prompt,
        provider,
        'Schnell generation failed - no image returned',
        'GENERATION_ERROR'
      );

    } catch (error) {
      console.error('[ImageGenerator] Schnell error:', error);
      return this.createErrorResult(
        prompt,
        provider,
        error instanceof Error ? error.message : 'Schnell API error',
        'API_ERROR'
      );
    }
  }

  // ==========================================
  // BFL API METHODS
  // ==========================================

  /**
   * Create a prediction (async request to BFL)
   */
  private async bflCreatePrediction(
    prompt: string,
    width: number,
    height: number
  ): Promise<BFLCreateResponse | null> {
    try {
      const response = await fetch(`${this.bflBaseUrl}/flux-2-klein-9b`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'x-key': this.bflApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          width,
          height,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ImageGenerator] BFL API Error:', response.status, errorText);
        return null;
      }

      const data = await response.json() as BFLCreateResponse;
      return data;
    } catch (error) {
      console.error('[ImageGenerator] BFL create error:', error);
      return null;
    }
  }

  /**
   * Poll for BFL result (async generation)
   */
  private async bflPollForResult(
    taskId: string,
    maxAttempts: number = 120,
    intervalMs: number = 500
  ): Promise<BFLPollResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.bflBaseUrl}/get_result?id=${taskId}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-key': this.bflApiKey,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[ImageGenerator] BFL poll error:', response.status, errorText);
          await this.sleep(intervalMs);
          continue;
        }

        const result = await response.json() as BFLPollResponse;

        // Check if completed
        if (result.status === 'Ready' || result.status === 'Error' || 
            result.status === 'Content Moderated' || result.status === 'Request Moderated') {
          return result;
        }

        // Still pending
        if (attempt % 10 === 0) {
          console.log(`[ImageGenerator] ⏳ Klein 9B generating... (${attempt + 1}/${maxAttempts})`);
        }
        await this.sleep(intervalMs);
      } catch (error) {
        console.error('[ImageGenerator] BFL poll error:', error);
        await this.sleep(intervalMs);
      }
    }

    return {
      id: taskId,
      status: 'Error',
      error: 'Timeout waiting for Klein 9B generation',
    };
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Get dimensions from aspect ratio
   */
  private getDimensions(aspectRatio: string): { width: number; height: number } {
    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1360, height: 768 },
      '9:16': { width: 768, height: 1360 },
      '4:3': { width: 1184, height: 888 },
      '3:4': { width: 888, height: 1184 },
      '3:2': { width: 1248, height: 832 },
      '2:3': { width: 832, height: 1248 },
    };

    return dimensions[aspectRatio] || dimensions['1:1'];
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create error result
   */
  private createErrorResult(
    prompt: string,
    provider: ImageProvider,
    error: string,
    errorCode: string
  ): ImageGenerationResult {
    return {
      success: false,
      provider,
      prompt,
      optimizedPrompt: prompt,
      generationTimeMs: 0,
      costINR: 0,
      error,
      errorCode,
    };
  }

  /**
   * Check if APIs are configured
   */
  public isConfigured(): { klein9b: boolean; schnell: boolean } {
    return {
      klein9b: !!this.bflApiKey,
      schnell: !!this.falApiKey,
    };
  }

  /**
   * Get supported aspect ratios
   */
  public getSupportedAspectRatios(): string[] {
    return ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'];
  }
}

// ==========================================
// EXPORT SINGLETON & HELPER
// ==========================================

export const imageGenerator = ImageGenerator.getInstance();

export async function generateImage(
  prompt: string,
  provider?: ImageProvider,
  aspectRatio?: string
): Promise<ImageGenerationResult> {
  return imageGenerator.generate(prompt, provider, aspectRatio);
}