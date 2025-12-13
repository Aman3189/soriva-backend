// src/studio/config/providers.config.ts
// ✅ STUDIO v2.0: Ideogram (Text-to-Image) + Banana PRO (Photo Transform)

import { STUDIO_CONFIG } from './studio.config';

// ==========================================
// INTERFACES
// ==========================================

export interface GenerationRequest {
  prompt: string;
  // Ideogram specific
  style?: 'auto' | 'realistic' | 'design' | 'anime' | '3d';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  negativePrompt?: string;
  // Banana specific
  imageBase64?: string;
  imageMimeType?: string;
}

export interface GenerationResponse {
  outputUrl: string;
  thumbnailUrl?: string;
  provider: 'IDEOGRAM' | 'BANANA_PRO';
  cost: number;
  status: 'completed' | 'processing' | 'failed';
  metadata?: Record<string, any>;
}

export interface StudioProvider {
  name: string;
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  estimateCost(): number;
  isReady(): boolean;
}

// ==========================================
// IDEOGRAM PROVIDER (Text-to-Image)
// ==========================================

export class IdeogramProvider implements StudioProvider {
  name = 'IDEOGRAM';

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.isReady()) {
      throw new Error('Ideogram provider not configured. Set IDEOGRAM_API_KEY in .env');
    }

    const config = STUDIO_CONFIG.providers.ideogram;

    try {
      console.log(`🎨 [IDEOGRAM] Generating: "${request.prompt.substring(0, 50)}..."`);

      const response = await fetch(`${config.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Api-Key': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_request: {
            prompt: request.prompt,
            aspect_ratio: this.mapAspectRatio(request.aspectRatio),
            model: config.version || 'V_2',
            style_type: this.mapStyle(request.style),
            negative_prompt: request.negativePrompt,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ideogram API error: ${response.status} - ${error}`);
      }

      const result: any = await response.json();

      if (!result.data || !result.data[0]?.url) {
        throw new Error('No image URL in Ideogram response');
      }

      console.log(`✅ [IDEOGRAM] Generated successfully`);

      return {
        outputUrl: result.data[0].url,
        thumbnailUrl: result.data[0].url,
        provider: 'IDEOGRAM',
        cost: config.costPerGeneration,
        status: 'completed',
        metadata: {
          style: request.style || 'auto',
          aspectRatio: request.aspectRatio || '1:1',
          seed: result.data[0].seed,
        },
      };

    } catch (error: any) {
      console.error(`❌ [IDEOGRAM] Generation failed:`, error.message);
      throw new Error(`Ideogram generation failed: ${error.message}`);
    }
  }

  private mapAspectRatio(ratio?: string): string {
    const mapping: Record<string, string> = {
      '1:1': 'ASPECT_1_1',
      '16:9': 'ASPECT_16_9',
      '9:16': 'ASPECT_9_16',
      '4:3': 'ASPECT_4_3',
      '3:4': 'ASPECT_3_4',
    };
    return mapping[ratio || '1:1'] || 'ASPECT_1_1';
  }

  private mapStyle(style?: string): string {
    const mapping: Record<string, string> = {
      'auto': 'AUTO',
      'realistic': 'REALISTIC',
      'design': 'DESIGN',
      'anime': 'ANIME',
      '3d': 'RENDER_3D',
    };
    return mapping[style || 'auto'] || 'AUTO';
  }

  estimateCost(): number {
    return STUDIO_CONFIG.providers.ideogram.costPerGeneration;
  }

  isReady(): boolean {
    const config = STUDIO_CONFIG.providers.ideogram;
    return config.enabled && !!config.apiKey;
  }
}

// ==========================================
// BANANA PRO PROVIDER (Photo Transform)
// ==========================================

export class BananaProProvider implements StudioProvider {
  name = 'BANANA_PRO';

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.isReady()) {
      throw new Error('Banana PRO provider not configured. Set BANANA_API_KEY in .env');
    }

    if (!request.imageBase64) {
      throw new Error('Banana PRO requires an input image');
    }

    const config = STUDIO_CONFIG.providers.bananaPro;

    try {
      console.log(`🍌 [BANANA PRO] Transforming with prompt: "${request.prompt.substring(0, 50)}..."`);

      const response = await fetch(`${config.baseUrl}/transform`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          image: request.imageBase64,
          image_type: request.imageMimeType || 'image/jpeg',
          strength: 0.75,
          guidance_scale: 7.5,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Banana PRO API error: ${response.status} - ${error}`);
      }

      const result: any = await response.json();

      // Handle async processing if needed
      if (result.status === 'processing' && result.task_id) {
        const finalResult = await this.pollResult(result.task_id);
        return finalResult;
      }

      if (!result.output?.image_url) {
        throw new Error('No image URL in Banana PRO response');
      }

      console.log(`✅ [BANANA PRO] Transformed successfully`);

      return {
        outputUrl: result.output.image_url,
        thumbnailUrl: result.output.image_url,
        provider: 'BANANA_PRO',
        cost: config.costPerTransform,
        status: 'completed',
        metadata: {
          hasSourceImage: true,
        },
      };

    } catch (error: any) {
      console.error(`❌ [BANANA PRO] Generation failed:`, error.message);
      throw new Error(`Banana PRO generation failed: ${error.message}`);
    }
  }

  private async pollResult(taskId: string): Promise<GenerationResponse> {
    const config = STUDIO_CONFIG.providers.bananaPro;
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${config.baseUrl}/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      const result: any = await response.json();

      if (result.status === 'completed') {
        return {
          outputUrl: result.output.image_url,
          thumbnailUrl: result.output.image_url,
          provider: 'BANANA_PRO',
          cost: config.costPerTransform,
          status: 'completed',
          metadata: { taskId },
        };
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;

      if (attempts % 10 === 0) {
        console.log(`⏳ [BANANA PRO] Still processing... (${attempts * 3}s)`);
      }
    }

    throw new Error('Timeout waiting for Banana PRO result');
  }

  estimateCost(): number {
    return STUDIO_CONFIG.providers.bananaPro.costPerTransform;
  }

  isReady(): boolean {
    const config = STUDIO_CONFIG.providers.bananaPro;
    return config.enabled && !!config.apiKey;
  }
}

// ==========================================
// PROVIDER FACTORY
// ==========================================

export class StudioProviderFactory {
  private static ideogramProvider = new IdeogramProvider();
  private static bananaProProvider = new BananaProProvider();

  static getProviderForRequest(request: GenerationRequest): StudioProvider {
    if (request.imageBase64) {
      return this.bananaProProvider;
    }
    return this.ideogramProvider;
  }

  static getProvider(name: 'IDEOGRAM' | 'BANANA_PRO'): StudioProvider {
    if (name === 'BANANA_PRO') {
      return this.bananaProProvider;
    }
    return this.ideogramProvider;
  }

  static getProviderStatus() {
    return {
      ideogram: {
        name: 'IDEOGRAM',
        ready: this.ideogramProvider.isReady(),
        cost: this.ideogramProvider.estimateCost(),
      },
      bananaPro: {
        name: 'BANANA_PRO',
        ready: this.bananaProProvider.isReady(),
        cost: this.bananaProProvider.estimateCost(),
      },
    };
  }

  static isAnyProviderReady(): boolean {
    return this.ideogramProvider.isReady() || this.bananaProProvider.isReady();
  }
}

export const studioProviderFactory = StudioProviderFactory;