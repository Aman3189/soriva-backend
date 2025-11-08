// src/studio/providers/ITalkingPhotoProvider.ts
// ✅ Interface for Talking Photo Providers (Replicate, HeyGen, D-ID)

import { VoiceStyle } from '../types/studio.types';

/**
 * Request parameters for creating talking photo
 */
export interface TalkingPhotoProviderRequest {
  imageUrl: string;
  text: string;
  voiceStyle: VoiceStyle;
  duration: number; // in seconds (5 or 10)
  userId?: string; // For tracking purposes
}

/**
 * Provider response after creating talking photo
 */
export interface TalkingPhotoProviderResponse {
  videoUrl: string;
  duration: number;
  provider: string;
  estimatedCost: number;
  metadata?: Record<string, any>;
}

/**
 * Base interface that all talking photo providers must implement
 */
export interface ITalkingPhotoProvider {
  /**
   * Provider name (replicate, heygen, did)
   */
  readonly name: string;

  /**
   * Create talking photo video from image and text
   */
  createTalkingPhoto(request: TalkingPhotoProviderRequest): Promise<string>;

  /**
   * Get estimated cost for a request (in INR)
   */
  getEstimatedCost(duration: number): number;

  /**
   * Check if provider is available/configured
   */
  isAvailable(): boolean;

  /**
   * Get provider configuration details
   */
  getProviderInfo(): {
    name: string;
    quality: string;
    costPer5Sec: number;
    costPer10Sec: number;
    estimatedTime: string;
  };
}