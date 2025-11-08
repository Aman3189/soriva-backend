// src/studio/config/providers.config.ts
// ✅ PROVIDER ABSTRACTION: Easy switching between Replicate ↔ HeyGen
// ✅ INTERFACE: Common interface for all providers

import { STUDIO_CONFIG, getTalkingPhotoProvider } from './studio.config';

// ==========================================
// INTERFACES (Common for all providers)
// ==========================================

export interface TalkingPhotoRequest {
  imageUrl: string;
  text: string;
  voiceStyle: 'male' | 'female' | 'child';
  duration: '5sec' | '10sec';
  type: 'real_photo' | 'ai_baby';
}

export interface TalkingPhotoResponse {
  videoUrl: string;
  provider: string;
  cost: number;
  duration: number;
  status: 'completed' | 'processing' | 'failed';
  estimatedTime?: string;
}

export interface TalkingPhotoProvider {
  name: string;
  generateVideo(request: TalkingPhotoRequest): Promise<TalkingPhotoResponse>;
  estimateCost(duration: '5sec' | '10sec'): number;
  getQualityScore(): number;
  isReady(): boolean;
}

// ==========================================
// REPLICATE PROVIDER (Current - LIVE!)
// ==========================================

export class ReplicateLivePortraitProvider implements TalkingPhotoProvider {
  name = 'replicate';

  async generateVideo(request: TalkingPhotoRequest): Promise<TalkingPhotoResponse> {
    const config = STUDIO_CONFIG.talkingPhotos.replicate;

    if (!this.isReady()) {
      throw new Error('Replicate provider not configured. Set REPLICATE_API_TOKEN in .env');
    }

    try {
      console.log(`🎬 Generating video with Replicate LivePortrait...`);

      // Step 1: Create prediction
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: config.model,
          input: {
            source_image: request.imageUrl,
            // Additional LivePortrait params
            // Will be configured based on actual model requirements
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.statusText}`);
      }

      const prediction: any = await response.json();
      console.log(`⏳ Prediction created: ${prediction.id}`);

      // Step 2: Poll for result
      const videoUrl = await this.pollReplicateResult(prediction.id, config.maxRetries);

      console.log(`✅ Video generated successfully!`);

      return {
        videoUrl,
        provider: 'replicate',
        cost: config.costPerVideo,
        duration: request.duration === '5sec' ? 5 : 10,
        status: 'completed',
        estimatedTime: config.estimatedTime,
      };
    } catch (error: any) {
      console.error(`❌ Replicate generation failed:`, error.message);
      throw new Error(`Replicate generation failed: ${error.message}`);
    }
  }

  private async pollReplicateResult(predictionId: string, maxRetries: number): Promise<string> {
    const config = STUDIO_CONFIG.talkingPhotos.replicate;
    let attempts = 0;

    while (attempts < maxRetries * 20) {
      // maxRetries * 20 = total polling attempts
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: { 'Authorization': `Token ${config.apiToken}` },
        }
      );

      const result: any = await response.json();

      if (result.status === 'succeeded') {
        const output = Array.isArray(result.output) ? result.output[0] : result.output;
        if (!output) {
          throw new Error('No output URL returned from Replicate');
        }
        return output;
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Generation failed');
      }

      if (result.status === 'canceled') {
        throw new Error('Generation was canceled');
      }

      // Still processing, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
      attempts++;

      if (attempts % 10 === 0) {
        console.log(`⏳ Still processing... (${attempts * 3}s elapsed)`);
      }
    }

    throw new Error('Timeout waiting for result');
  }

  estimateCost(duration: '5sec' | '10sec'): number {
    return STUDIO_CONFIG.talkingPhotos.replicate.costPerVideo;
  }

  getQualityScore(): number {
    return STUDIO_CONFIG.talkingPhotos.replicate.qualityScore;
  }

  isReady(): boolean {
    const config = STUDIO_CONFIG.talkingPhotos.replicate;
    return config.enabled && !!config.apiToken;
  }
}

// ==========================================
// HEYGEN PROVIDER (Ready - DISABLED)
// ==========================================

export class HeyGenProvider implements TalkingPhotoProvider {
  name = 'heygen';

  async generateVideo(request: TalkingPhotoRequest): Promise<TalkingPhotoResponse> {
    const config = STUDIO_CONFIG.talkingPhotos.heygen;

    if (!config.enabled) {
      throw new Error('HeyGen provider is disabled. Enable in studio.config.ts');
    }

    if (!this.isReady()) {
      throw new Error('HeyGen provider not configured. Set HEYGEN_API_KEY in .env');
    }

    try {
      console.log(`🎬 Generating video with HeyGen...`);

      // Step 1: Create talking photo video
      const response = await fetch('https://api.heygen.com/v1/video.generate', {
        method: 'POST',
        headers: {
          'X-Api-Key': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: 'photo',
                photo_url: request.imageUrl,
              },
              voice: {
                type: 'text',
                input_text: request.text,
                voice_id: this.getVoiceId(request.voiceStyle),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HeyGen API error: ${response.statusText}`);
      }

      const result: any = await response.json();
      console.log(`⏳ Video generation started: ${result.video_id}`);

      // Step 2: Poll for completion
      const videoUrl = await this.pollHeyGenResult(result.video_id, config.maxRetries);

      console.log(`✅ Video generated successfully!`);

      const cost = request.duration === '5sec' ? config.costPer5s : config.costPer10s;

      return {
        videoUrl,
        provider: 'heygen',
        cost,
        duration: request.duration === '5sec' ? 5 : 10,
        status: 'completed',
        estimatedTime: config.estimatedTime,
      };
    } catch (error: any) {
      console.error(`❌ HeyGen generation failed:`, error.message);
      throw new Error(`HeyGen generation failed: ${error.message}`);
    }
  }

  private async pollHeyGenResult(videoId: string, maxRetries: number): Promise<string> {
    const config = STUDIO_CONFIG.talkingPhotos.heygen;
    let attempts = 0;

    while (attempts < maxRetries * 20) {
      const response = await fetch(
        `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
        {
          headers: { 'X-Api-Key': config.apiKey },
        }
      );

      const result: any = await response.json();

      if (result.data.status === 'completed') {
        return result.data.video_url;
      }

      if (result.data.status === 'failed') {
        throw new Error(result.data.error || 'Generation failed');
      }

      // Still processing
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      if (attempts % 6 === 0) {
        console.log(`⏳ Still processing... (${attempts * 5}s elapsed)`);
      }
    }

    throw new Error('Timeout waiting for result');
  }

  private getVoiceId(voiceStyle: 'male' | 'female' | 'child'): string {
    // HeyGen voice IDs (update with actual IDs from HeyGen)
    const voiceMap = {
      male: 'en-IN-PrabhatNeural',
      female: 'en-IN-NeerjaNeural',
      child: 'en-US-AnaNeural',
    };
    return voiceMap[voiceStyle];
  }

  estimateCost(duration: '5sec' | '10sec'): number {
    const config = STUDIO_CONFIG.talkingPhotos.heygen;
    return duration === '5sec' ? config.costPer5s : config.costPer10s;
  }

  getQualityScore(): number {
    return STUDIO_CONFIG.talkingPhotos.heygen.qualityScore;
  }

  isReady(): boolean {
    const config = STUDIO_CONFIG.talkingPhotos.heygen;
    return config.enabled && !!config.apiKey;
  }
}

// ==========================================
// PROVIDER FACTORY (Main entry point)
// ==========================================

export class TalkingPhotoProviderFactory {
  private static replicateProvider = new ReplicateLivePortraitProvider();
  private static heygenProvider = new HeyGenProvider();

  /**
   * Get the active provider based on config
   */
  static getProvider(): TalkingPhotoProvider {
    const activeProvider = getTalkingPhotoProvider();

    if (activeProvider === 'heygen') {
      return this.heygenProvider;
    }

    return this.replicateProvider;
  }

  /**
   * Get a specific provider by name
   */
  static getProviderByName(name: 'replicate' | 'heygen'): TalkingPhotoProvider {
    if (name === 'heygen') {
      return this.heygenProvider;
    }
    return this.replicateProvider;
  }

  /**
   * Check if current provider is ready
   */
  static isCurrentProviderReady(): boolean {
    const provider = this.getProvider();
    return provider.isReady();
  }

  /**
   * Get current provider info
   */
  static getCurrentProviderInfo() {
    const provider = this.getProvider();
    return {
      name: provider.name,
      qualityScore: provider.getQualityScore(),
      isReady: provider.isReady(),
      cost5s: provider.estimateCost('5sec'),
      cost10s: provider.estimateCost('10sec'),
    };
  }
}

// ==========================================
// EXPORTS
// ==========================================

export const talkingPhotoProviderFactory = TalkingPhotoProviderFactory;