// src/services/image/imageGenerator.ts

/**
 * ==========================================
 * SORIVA IMAGE GENERATOR
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Generate images using FLUX.2 Klein 9B model via BFL API
 * Provider: Klein 9B - ₹1.26/image
 * Last Updated: January 17, 2026
 */

import {
  ImageGenerationResult,
  ImageProvider,
  IMAGE_COSTS,
} from '../../types/image.types';

// ==========================================
// BFL API TYPES
// ==========================================

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

// ==========================================
// IMAGE GENERATOR CLASS
// ==========================================

export class ImageGenerator {
  private static instance: ImageGenerator;
  private apiKey: string;
  private baseUrl = 'https://api.bfl.ai/v1';

  private constructor() {
    this.apiKey = process.env.BFL_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[ImageGenerator] ⚠️ BFL_API_KEY not set!');
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
   * Generate image using FLUX.2 Klein 9B model
   */
  public async generate(
    prompt: string,
    provider: ImageProvider = ImageProvider.KLEIN9B,
    aspectRatio: string = '1:1'
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    try {
      // Validate API key
      if (!this.apiKey) {
        return this.createErrorResult(
          prompt,
          provider,
          'BFL_API_KEY not configured',
          'CONFIG_ERROR'
        );
      }

      // Get dimensions from aspect ratio
      const { width, height } = this.getDimensions(aspectRatio);
      
      console.log(`[ImageGenerator] 🎨 Generating image with FLUX.2 Klein 9B...`);
      console.log(`[ImageGenerator] 📝 Prompt: ${prompt.substring(0, 100)}...`);
      console.log(`[ImageGenerator] 📐 Size: ${width}x${height}`);

      // Step 1: Create prediction (async request)
      const createResponse = await this.createPrediction(prompt, width, height);

      if (!createResponse || !createResponse.id) {
        return this.createErrorResult(
          prompt,
          provider,
          'Failed to create prediction',
          'PREDICTION_ERROR'
        );
      }

      console.log(`[ImageGenerator] ⏳ Prediction created: ${createResponse.id}`);

      // Step 2: Poll for result
      const result = await this.pollForResult(createResponse.id);

      const generationTime = Date.now() - startTime;

      if (result.status === 'Ready' && result.result?.sample) {
        console.log(`[ImageGenerator] ✅ Image generated in ${generationTime}ms`);
        
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
        result.error || 'Generation failed',
        'GENERATION_ERROR'
      );

    } catch (error) {
      const generationTime = Date.now() - startTime;
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
  // BFL API METHODS
  // ==========================================

  /**
   * Create a prediction (async request to BFL)
   */
  private async createPrediction(
    prompt: string,
    width: number,
    height: number
  ): Promise<BFLCreateResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/flux-2-klein-9b`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'x-key': this.apiKey,
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
      console.error('[ImageGenerator] Create prediction error:', error);
      return null;
    }
  }

  /**
   * Poll for result (BFL uses async generation)
   */
  private async pollForResult(
    taskId: string,
    maxAttempts: number = 120,
    intervalMs: number = 500
  ): Promise<BFLPollResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/get_result?id=${taskId}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-key': this.apiKey,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[ImageGenerator] Poll error:', response.status, errorText);
          // Continue polling on error
          await this.sleep(intervalMs);
          continue;
        }

        const result = await response.json() as BFLPollResponse;

        // Check if completed
        if (result.status === 'Ready' || result.status === 'Error' || 
            result.status === 'Content Moderated' || result.status === 'Request Moderated') {
          return result;
        }

        // Still pending, wait before next poll
        if (attempt % 10 === 0) {
          console.log(`[ImageGenerator] ⏳ Still generating... (attempt ${attempt + 1})`);
        }
        await this.sleep(intervalMs);
      } catch (error) {
        console.error('[ImageGenerator] Poll error:', error);
        await this.sleep(intervalMs);
      }
    }

    return {
      id: taskId,
      status: 'Error',
      error: 'Timeout waiting for image generation',
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
   * Check if API is configured
   */
  public isConfigured(): boolean {
    return !!this.apiKey;
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