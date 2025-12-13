// src/studio/providers/HedraProvider.ts
// ✅ Hedra Provider - Talking Photo (40 credits/5s, 80 credits/10s)
// Natural head movement + realistic lip sync

import { STUDIO_CONFIG } from '../config/studio.config';

// ============ INTERFACES ============

export interface HedraGenerateRequest {
  imageUrl?: string;
  imageBase64?: string;
  text: string;
  voiceId?: string;
  duration: '5s' | '10s';
  aspectRatio?: '1:1' | '16:9' | '9:16';
}

export interface HedraGenerateResponse {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  provider: 'HEDRA';
  status: 'completed' | 'processing' | 'failed';
  metadata?: Record<string, any>;
}

interface HedraJobResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
}

// ============ HEDRA PROVIDER ============

export class HedraProvider {
  readonly name = 'HEDRA';
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const config = STUDIO_CONFIG.providers.hedra;
    this.apiKey = config?.apiKey || process.env.HEDRA_API_KEY || '';
    this.baseUrl = config?.baseUrl || 'https://api.hedra.com/v1';
  }

  /**
   * Generate talking photo video
   */
  async generate(request: HedraGenerateRequest): Promise<HedraGenerateResponse> {
    if (!this.isAvailable()) {
      throw new Error('Hedra API key not configured. Set HEDRA_API_KEY in .env');
    }

    try {
      console.log(`🎬 [HEDRA] Creating talking photo: "${request.text.substring(0, 50)}..."`);

      // Step 1: Create generation job
      const jobId = await this.createJob(request);
      console.log(`⏳ [HEDRA] Job created: ${jobId}`);

      // Step 2: Poll for completion
      const result = await this.pollJobStatus(jobId);

      console.log(`✅ [HEDRA] Video generated successfully`);

      return {
        videoUrl: result.video_url!,
        thumbnailUrl: result.video_url, // Hedra may provide separate thumbnail
        duration: request.duration === '5s' ? 5 : 10,
        provider: 'HEDRA',
        status: 'completed',
        metadata: {
          jobId,
          voiceId: request.voiceId,
          aspectRatio: request.aspectRatio || '1:1',
        },
      };

    } catch (error: any) {
      console.error(`❌ [HEDRA] Generation failed:`, error.message);
      throw new Error(`Hedra generation failed: ${error.message}`);
    }
  }

  /**
   * Create generation job on Hedra
   */
  private async createJob(request: HedraGenerateRequest): Promise<string> {
    const payload: Record<string, any> = {
      text: request.text,
      voice_id: request.voiceId || this.getDefaultVoice(),
      aspect_ratio: request.aspectRatio || '1:1',
      duration: request.duration === '5s' ? 5 : 10,
    };

    // Add image (URL or base64)
    if (request.imageUrl) {
      payload.image_url = request.imageUrl;
    } else if (request.imageBase64) {
      payload.image_base64 = request.imageBase64;
    } else {
      throw new Error('Image is required (imageUrl or imageBase64)');
    }

    const response = await fetch(`${this.baseUrl}/characters/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hedra API error: ${response.status} - ${error}`);
    }

    const data: any = await response.json();
    
    if (!data.job_id) {
      throw new Error('No job_id returned from Hedra');
    }

    return data.job_id;
  }

  /**
   * Poll job status until completion
   */
  private async pollJobStatus(jobId: string): Promise<HedraJobResponse> {
    const maxAttempts = 120; // 6 minutes max (video generation takes time)
    const pollInterval = 3000; // 3 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.status}`);
      }

      const data = await response.json() as HedraJobResponse;

      if (data.status === 'completed' && data.video_url) {
        return data;
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Video generation failed');
      }

      // Still processing, wait and retry
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      if (attempts % 10 === 0) {
        console.log(`⏳ [HEDRA] Still processing... (${attempts * 3}s elapsed)`);
      }
    }

    throw new Error('Timeout waiting for Hedra video generation');
  }

  /**
   * Get default voice ID (Indian English)
   */
  private getDefaultVoice(): string {
    // Hedra voice IDs - update with actual IDs
    return 'en-IN-female-1';
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return [
      { id: 'en-IN-male-1', name: 'Indian Male', language: 'en-IN' },
      { id: 'en-IN-female-1', name: 'Indian Female', language: 'en-IN' },
      { id: 'hi-IN-male-1', name: 'Hindi Male', language: 'hi-IN' },
      { id: 'hi-IN-female-1', name: 'Hindi Female', language: 'hi-IN' },
      { id: 'en-US-male-1', name: 'American Male', language: 'en-US' },
      { id: 'en-US-female-1', name: 'American Female', language: 'en-US' },
    ];
  }

  /**
   * Estimate cost in credits
   */
  estimateCost(duration: '5s' | '10s'): number {
    // From feature list: 5s = 40 credits, 10s = 80 credits
    return duration === '5s' ? 40 : 80;
  }

  /**
   * Check if provider is available
   */
  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    return {
      name: 'Hedra',
      description: 'Talking Photo - Natural head movement + realistic lip sync',
      features: ['Image to Video', 'Text to Speech', 'Lip Sync', 'Head Movement'],
      credits: {
        '5s': 40,
        '10s': 80,
      },
      estimatedTime: '30-90 seconds',
      quality: '9/10',
      isAvailable: this.isAvailable(),
    };
  }
}

// ============ SINGLETON EXPORT ============

export const hedraProvider = new HedraProvider();
export default HedraProvider;