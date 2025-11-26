/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * WHISPER SERVICE (STT - SPEECH TO TEXT)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: OpenAI Whisper API integration for Speech-to-Text
 * Cost: ₹0.50 per minute (₹0.0083 per second)
 * Limits: 15 seconds max per request
 * 
 * Features:
 * - Audio transcription (Whisper API)
 * - Multi-format support (mp3, wav, webm, m4a)
 * - Duration tracking
 * - Error handling
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface WhisperTranscriptionRequest {
  audioBuffer: Buffer;
  fileName: string;
  mimeType: string;
}

interface WhisperTranscriptionResponse {
  success: boolean;
  text?: string;
  durationSeconds?: number;
  error?: string;
  costRupees?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WHISPER SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class WhisperService {
  private static instance: WhisperService;
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://api.openai.com/v1/audio/transcriptions';
  private readonly costPerSecond: number = 0.0083; // ₹0.50/min = ₹0.0083/sec
  private readonly maxDurationSeconds: number = 15;

  private constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment variables');
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): WhisperService {
    if (!WhisperService.instance) {
      WhisperService.instance = new WhisperService();
    }
    return WhisperService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN TRANSCRIPTION METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Transcribe audio to text using Whisper API
   */
  public async transcribeAudio(
    request: WhisperTranscriptionRequest
  ): Promise<WhisperTranscriptionResponse> {
    try {
      const { audioBuffer, fileName, mimeType } = request;

      // Validate API key
      if (!this.apiKey) {
        return {
          success: false,
          error: 'OpenAI API key not configured'
        };
      }

      // Estimate duration (rough estimate based on buffer size)
      const estimatedDuration = this.estimateAudioDuration(audioBuffer, mimeType);

      // Check duration limit
      if (estimatedDuration > this.maxDurationSeconds) {
        return {
          success: false,
          error: `Audio too long. Max ${this.maxDurationSeconds} seconds allowed.`
        };
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: fileName,
        contentType: mimeType
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Can be made dynamic later
      formData.append('response_format', 'json');

      // Call Whisper API
      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      // Extract transcription
      const transcriptionText = response.data?.text || '';

      if (!transcriptionText) {
        return {
          success: false,
          error: 'No transcription returned from Whisper API'
        };
      }

      // Calculate cost
      const costRupees = estimatedDuration * this.costPerSecond;

      console.log(`✅ Whisper transcription successful: "${transcriptionText.substring(0, 50)}..."`);

      return {
        success: true,
        text: transcriptionText,
        durationSeconds: estimatedDuration,
        costRupees: parseFloat(costRupees.toFixed(4))
      };

    } catch (error: any) {
      console.error('❌ Whisper transcription error:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Transcription failed'
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Estimate audio duration based on buffer size
   * This is a rough estimate - actual duration may vary
   */
  private estimateAudioDuration(buffer: Buffer, mimeType: string): number {
    const sizeInKB = buffer.length / 1024;

    // Rough estimates based on common bitrates
    let estimatedSeconds: number;

    if (mimeType.includes('webm') || mimeType.includes('opus')) {
      // WebM/Opus: ~8-16 KB/sec
      estimatedSeconds = sizeInKB / 12;
    } else if (mimeType.includes('mp3')) {
      // MP3: ~16-32 KB/sec (128kbps average)
      estimatedSeconds = sizeInKB / 24;
    } else if (mimeType.includes('wav')) {
      // WAV: ~176 KB/sec (uncompressed)
      estimatedSeconds = sizeInKB / 176;
    } else {
      // Default estimate
      estimatedSeconds = sizeInKB / 20;
    }

    // Round to 2 decimal places
    return parseFloat(estimatedSeconds.toFixed(2));
  }

  /**
   * Validate audio file format
   */
  public isValidAudioFormat(mimeType: string): boolean {
    const validFormats = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/m4a',
      'audio/x-m4a',
      'audio/ogg',
      'audio/opus'
    ];

    return validFormats.some(format => mimeType.includes(format));
  }

  /**
   * Calculate cost for given duration
   */
  public calculateCost(durationSeconds: number): number {
    return parseFloat((durationSeconds * this.costPerSecond).toFixed(4));
  }

  /**
   * Get max duration limit
   */
  public getMaxDuration(): number {
    return this.maxDurationSeconds;
  }

  /**
   * Get cost per second
   */
  public getCostPerSecond(): number {
    return this.costPerSecond;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default WhisperService;
export type { WhisperTranscriptionRequest, WhisperTranscriptionResponse };