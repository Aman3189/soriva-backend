// src/studio/providers/ITalkingPhotoProvider.ts
// ✅ Interface for Video Providers (Hedra, Kling)

// ============ REQUEST INTERFACES ============

export interface TalkingPhotoRequest {
  // Image input (one required)
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  
  // Audio/Text
  text: string;
  voiceId?: string;
  audioUrl?: string;      // Optional: custom audio
  audioBase64?: string;   // Optional: custom audio
  
  // Settings
  duration: '5s' | '10s';
  aspectRatio?: '1:1' | '16:9' | '9:16';
  
  // Tracking
  userId?: string;
  generationId?: string;
}

export interface VideoGenerationRequest {
  // For Kling (Coming Soon)
  prompt: string;
  imageUrl?: string;
  imageBase64?: string;
  duration: '5s' | '10s';
  aspectRatio?: '1:1' | '16:9' | '9:16';
  style?: string;
  
  // Tracking
  userId?: string;
  generationId?: string;
}

// ============ RESPONSE INTERFACES ============

export interface TalkingPhotoResponse {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  provider: string;
  credits: number;
  status: 'completed' | 'processing' | 'failed';
  metadata?: Record<string, any>;
}

export interface VideoGenerationResponse {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  provider: string;
  credits: number;
  status: 'completed' | 'processing' | 'failed';
  metadata?: Record<string, any>;
}

// ============ PROVIDER INTERFACE ============

/**
 * Interface for Talking Photo providers (Hedra)
 */
export interface ITalkingPhotoProvider {
  readonly name: string;
  
  /**
   * Generate talking photo video
   */
  generate(request: TalkingPhotoRequest): Promise<TalkingPhotoResponse>;
  
  /**
   * Get estimated credits cost
   */
  estimateCost(duration: '5s' | '10s'): number;
  
  /**
   * Check if provider is available
   */
  isAvailable(): boolean;
  
  /**
   * Get available voices
   */
  getAvailableVoices(): Array<{
    id: string;
    name: string;
    language: string;
  }>;
  
  /**
   * Get provider info
   */
  getProviderInfo(): {
    name: string;
    description: string;
    features: string[];
    credits: {
      '5s': number;
      '10s': number;
    };
    estimatedTime: string;
    quality: string;
    isAvailable: boolean;
  };
}

/**
 * Interface for Video Generation providers (Kling - Coming Soon)
 */
export interface IVideoProvider {
  readonly name: string;
  
  /**
   * Generate video from prompt/image
   */
  generate(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
  
  /**
   * Get estimated credits cost
   */
  estimateCost(duration: '5s' | '10s'): number;
  
  /**
   * Check if provider is available
   */
  isAvailable(): boolean;
  
  /**
   * Get provider info
   */
  getProviderInfo(): {
    name: string;
    description: string;
    features: string[];
    credits: {
      '5s': number;
      '10s': number;
    };
    estimatedTime: string;
    quality: string;
    isAvailable: boolean;
    comingSoon?: boolean;
  };
}

// ============ PROVIDER TYPES ============

export type VideoProviderType = 'HEDRA' | 'KLING';

export const VIDEO_PROVIDER_CREDITS = {
  HEDRA: {
    '5s': 40,
    '10s': 80,
  },
  KLING: {
    '5s': 200,
    '10s': 400,
  },
} as const;