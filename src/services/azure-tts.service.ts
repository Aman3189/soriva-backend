/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AZURE TTS SERVICE (TEXT TO SPEECH)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Azure Neural TTS integration for Text-to-Speech
 * Cost: ₹0.00134 per character (Neural voices)
 * Limits: 30 seconds max response (~450 characters)
 * 
 * Features:
 * - Text-to-speech synthesis (Azure Neural TTS)
 * - Indian English voice (en-IN-NeerjaNeural)
 * - Character count tracking
 * - Audio format: MP3
 * - Error handling
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AzureTTSRequest {
  text: string;
  voiceName?: string; // Optional, default: en-IN-NeerjaNeural
}

interface AzureTTSResponse {
  success: boolean;
  audioBuffer?: Buffer;
  characterCount?: number;
  durationSeconds?: number;
  costRupees?: number;
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AZURE TTS SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AzureTTSService {
  private static instance: AzureTTSService;
  private readonly subscriptionKey: string;
  private readonly region: string;
  private readonly costPerCharacter: number = 0.00134; // ₹0.00134 per character
  private readonly maxCharacters: number = 450; // ~30 seconds of speech
  private readonly defaultVoice: string = 'en-IN-NeerjaNeural'; // Indian English Female

  private constructor() {
    this.subscriptionKey = process.env.AZURE_SPEECH_KEY || '';
    this.region = process.env.AZURE_SPEECH_REGION || 'centralindia';
    
    if (!this.subscriptionKey) {
      console.error('❌ AZURE_SPEECH_KEY not found in environment variables');
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AzureTTSService {
    if (!AzureTTSService.instance) {
      AzureTTSService.instance = new AzureTTSService();
    }
    return AzureTTSService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN SYNTHESIS METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Synthesize text to speech using Azure Neural TTS
   */
  public async synthesizeSpeech(
    request: AzureTTSRequest
  ): Promise<AzureTTSResponse> {
    try {
      const { text, voiceName = this.defaultVoice } = request;

      // Validate API key
      if (!this.subscriptionKey) {
        return {
          success: false,
          error: 'Azure Speech key not configured'
        };
      }

      // Validate text
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'Text cannot be empty'
        };
      }

      // Count characters
      const characterCount = text.length;

      // Check character limit
      if (characterCount > this.maxCharacters) {
        return {
          success: false,
          error: `Text too long. Max ${this.maxCharacters} characters allowed. Current: ${characterCount}`
        };
      }

      // Configure speech
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        this.subscriptionKey,
        this.region
      );

      // Set output format to MP3
      speechConfig.speechSynthesisOutputFormat = 
        sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      // Set voice
      speechConfig.speechSynthesisVoiceName = voiceName;

      // Create synthesizer
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

      // Synthesize speech
      const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          (result) => {
            synthesizer.close();
            resolve(result);
          },
          (error) => {
            synthesizer.close();
            reject(error);
          }
        );
      });

      // Check result
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        const audioBuffer = Buffer.from(result.audioData);

        // Estimate duration (rough estimate: ~15 characters per second)
        const estimatedDuration = characterCount / 15;

        // Calculate cost
        const costRupees = characterCount * this.costPerCharacter;

        console.log(`✅ Azure TTS synthesis successful: ${characterCount} characters`);

        return {
          success: true,
          audioBuffer,
          characterCount,
          durationSeconds: parseFloat(estimatedDuration.toFixed(2)),
          costRupees: parseFloat(costRupees.toFixed(4))
        };
      } else {
        const errorDetails = result.errorDetails || 'Unknown synthesis error';
        console.error('❌ Azure TTS synthesis failed:', errorDetails);

        return {
          success: false,
          error: errorDetails
        };
      }

    } catch (error: any) {
      console.error('❌ Azure TTS error:', error.message);

      return {
        success: false,
        error: error.message || 'Speech synthesis failed'
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PERSONALIZED WAKE WORD RESPONSE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate personalized wake word response
   * User says: "Listen, Soriva"
   * System responds: "Yes, [User Name]"
   */
  public async generateWakeWordResponse(
    userName: string
  ): Promise<AzureTTSResponse> {
    const responseText = `Yes, ${userName}`;
    
    return this.synthesizeSpeech({
      text: responseText,
      voiceName: this.defaultVoice
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Truncate text to fit within character limit
   */
  public truncateText(text: string, maxChars?: number): string {
    const limit = maxChars || this.maxCharacters;
    
    if (text.length <= limit) {
      return text;
    }

    // Truncate at last complete sentence within limit
    const truncated = text.substring(0, limit);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');

    const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);

    if (lastSentenceEnd > 0) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }

    // If no sentence end found, truncate at last space
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Calculate cost for given character count
   */
  public calculateCost(characterCount: number): number {
    return parseFloat((characterCount * this.costPerCharacter).toFixed(4));
  }

  /**
   * Estimate duration from character count
   * Rough estimate: ~15 characters per second
   */
  public estimateDuration(characterCount: number): number {
    return parseFloat((characterCount / 15).toFixed(2));
  }

  /**
   * Get max character limit
   */
  public getMaxCharacters(): number {
    return this.maxCharacters;
  }

  /**
   * Get cost per character
   */
  public getCostPerCharacter(): number {
    return this.costPerCharacter;
  }

  /**
   * Get default voice name
   */
  public getDefaultVoice(): string {
    return this.defaultVoice;
  }

  /**
   * Get available Indian English voices
   */
  public getIndianVoices(): Array<{ name: string; gender: string; description: string }> {
    return [
      {
        name: 'en-IN-NeerjaNeural',
        gender: 'Female',
        description: 'Indian English - Clear and professional (Default)'
      },
      {
        name: 'en-IN-PrabhatNeural',
        gender: 'Male',
        description: 'Indian English - Warm and friendly'
      }
    ];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default AzureTTSService;
export type { AzureTTSRequest, AzureTTSResponse };