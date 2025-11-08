// src/studio/providers/HeyGenProvider.ts
// ✅ HeyGen Provider (₹8.50/video, 10/10 quality)
// Premium quality for demanding users

import {
  ITalkingPhotoProvider,
  TalkingPhotoProviderRequest,
} from './ITalkingPhotoProvider';
import { VoiceStyle } from '../types/studio.types';

interface HeyGenVideoResponse {
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
}

export class HeyGenProvider implements ITalkingPhotoProvider {
  readonly name = 'heygen';
  private apiKey: string;
  private apiUrl = 'https://api.heygen.com/v1/video.generate';

  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY || '';
  }

  /**
   * Create talking photo using HeyGen API
   */
  async createTalkingPhoto(request: TalkingPhotoProviderRequest): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('HeyGen API key not configured');
    }

    try {
      // Step 1: Create video generation request
      const videoId = await this.createVideo(request);

      // Step 2: Poll for completion
      const videoUrl = await this.pollVideoStatus(videoId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`HeyGen failed: ${error.message}`);
    }
  }

  /**
   * Create video on HeyGen
   */
  private async createVideo(request: TalkingPhotoProviderRequest): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
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
        dimension: {
          width: 1024,
          height: 1024,
        },
        test: false, // Production mode
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen API error: ${error}`);
    }

    const data: any = await response.json();
    return data.video_id;
  }

  /**
   * Poll video status until completion
   */
  private async pollVideoStatus(videoId: string): Promise<string> {
    const maxAttempts = 60; // 5 minutes max
    const pollInterval = 5000; // 5 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(
        `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
        {
          headers: {
            'X-Api-Key': this.apiKey,
          },
        }
      );

      const data: any = await response.json();

      if (data.status === 'completed' && data.video_url) {
        return data.video_url;
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Video generation failed');
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error('Video generation timeout - exceeded 5 minutes');
  }

  /**
   * Map VoiceStyle to HeyGen voice IDs
   */
  private getVoiceId(voiceStyle: VoiceStyle): string {
    const voiceMap = {
      male: 'en-IN-male-1', // Indian English Male
      female: 'en-IN-female-1', // Indian English Female
      child: 'en-US-child-1', // Child voice
    };

    return voiceMap[voiceStyle] || voiceMap.male;
  }

  /**
   * Get estimated cost in INR
   */
  getEstimatedCost(duration: number): number {
    // HeyGen: ~$0.10 per video = ₹8.50
    return duration <= 5 ? 8.5 : 17.0;
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
      name: 'HeyGen',
      quality: '10/10 (Premium quality, Hollywood-grade)',
      costPer5Sec: 8.5, // INR
      costPer10Sec: 17.0, // INR
      estimatedTime: '45-90 seconds',
    };
  }
}