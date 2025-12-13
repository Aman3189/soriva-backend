// src/studio/providers/TalkingPhotoProviderFactory.ts
// ✅ Factory Pattern for Video Providers (Hedra, Kling)

import { 
  ITalkingPhotoProvider, 
  IVideoProvider,
  TalkingPhotoRequest,
  TalkingPhotoResponse,
  VIDEO_PROVIDER_CREDITS 
} from './ITalkingPhotoProvider';
import { HedraProvider } from './HedraProvider';
// import { KlingProvider } from './KlingProvider'; // Coming Soon

// ============ VIDEO PROVIDER FACTORY ============

export class VideoProviderFactory {
  private static hedraProvider: HedraProvider | null = null;
  // private static klingProvider: KlingProvider | null = null; // Coming Soon

  /**
   * Initialize Hedra provider (lazy singleton)
   */
  private static getHedra(): HedraProvider {
    if (!this.hedraProvider) {
      this.hedraProvider = new HedraProvider();
    }
    return this.hedraProvider;
  }

  /**
   * Get provider for Talking Photo (Hedra)
   */
  static getTalkingPhotoProvider(): HedraProvider {
    const provider = this.getHedra();
    
    if (!provider.isAvailable()) {
      throw new Error('Hedra provider not available. Set HEDRA_API_KEY in .env');
    }
    
    return provider;
  }

  /**
   * Get provider for Video Generation (Kling - Coming Soon)
   */
  static getVideoProvider(): never {
    throw new Error('Video generation (Kling) coming soon!');
  }

  /**
   * Generate talking photo
   */
  static async generateTalkingPhoto(
    imageUrl: string,
    text: string,
    duration: '5s' | '10s',
    options?: {
      voiceId?: string;
      aspectRatio?: '1:1' | '16:9' | '9:16';
    }
  ): Promise<TalkingPhotoResponse> {
    const provider = this.getTalkingPhotoProvider();
    
    const result = await provider.generate({
      imageUrl,
      text,
      duration,
      voiceId: options?.voiceId,
      aspectRatio: options?.aspectRatio,
    });

    return {
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      duration: result.duration,
      provider: 'HEDRA',
      credits: VIDEO_PROVIDER_CREDITS.HEDRA[duration],
      status: 'completed',
      metadata: result.metadata,
    };
  }

  /**
   * Get credits cost for feature
   */
  static getCreditsCost(
    feature: 'TALKING_PHOTO_5S' | 'TALKING_PHOTO_10S' | 'VIDEO_5S' | 'VIDEO_10S'
  ): number {
    switch (feature) {
      case 'TALKING_PHOTO_5S':
        return VIDEO_PROVIDER_CREDITS.HEDRA['5s']; // 40
      case 'TALKING_PHOTO_10S':
        return VIDEO_PROVIDER_CREDITS.HEDRA['10s']; // 80
      case 'VIDEO_5S':
        return VIDEO_PROVIDER_CREDITS.KLING['5s']; // 200
      case 'VIDEO_10S':
        return VIDEO_PROVIDER_CREDITS.KLING['10s']; // 400
      default:
        throw new Error(`Unknown feature: ${feature}`);
    }
  }

  /**
   * Check provider availability
   */
  static getProviderStatus() {
    return {
      hedra: {
        name: 'Hedra',
        type: 'Talking Photo',
        available: this.getHedra().isAvailable(),
        credits: VIDEO_PROVIDER_CREDITS.HEDRA,
        features: ['Talking Photo 5s', 'Talking Photo 10s'],
      },
      kling: {
        name: 'Kling',
        type: 'Video Generation',
        available: false, // Coming Soon
        credits: VIDEO_PROVIDER_CREDITS.KLING,
        features: ['Video 5s', 'Video 10s'],
        comingSoon: true,
      },
    };
  }

  /**
   * Get available voices for Talking Photo
   */
  static getAvailableVoices() {
    return this.getHedra().getAvailableVoices();
  }

  /**
   * Get all provider info
   */
  static getAllProvidersInfo() {
    return {
      talkingPhoto: {
        provider: 'Hedra',
        ...this.getHedra().getProviderInfo(),
      },
      videoGeneration: {
        provider: 'Kling',
        description: 'AI Video Generation',
        features: ['Text to Video', 'Image to Video'],
        credits: VIDEO_PROVIDER_CREDITS.KLING,
        estimatedTime: '2-5 minutes',
        quality: '9/10',
        isAvailable: false,
        comingSoon: true,
      },
    };
  }

  /**
   * Validate request before generation
   */
  static validateTalkingPhotoRequest(request: Partial<TalkingPhotoRequest>): string[] {
    const errors: string[] = [];

    if (!request.imageUrl && !request.imageBase64) {
      errors.push('Image is required (imageUrl or imageBase64)');
    }

    if (!request.text || request.text.trim().length === 0) {
      errors.push('Text is required');
    }

    if (request.text && request.text.length > 500) {
      errors.push('Text must be 500 characters or less');
    }

    if (!request.duration || !['5s', '10s'].includes(request.duration)) {
      errors.push('Duration must be "5s" or "10s"');
    }

    return errors;
  }
}

// ============ LEGACY EXPORT (Backwards Compatibility) ============

export const TalkingPhotoProviderFactory = VideoProviderFactory;

export default VideoProviderFactory;