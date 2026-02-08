/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ONAIR - GEMINI LIVE SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Real-time bidirectional voice conversations using Gemini Live API
 * Cost: ₹1.42/min (Audio Input: ₹0.28/min + Audio Output: ₹1.14/min)
 * 
 * Features:
 * - ⚡ Real-time audio streaming (WebSocket)
 * - 🎙️ Native audio input/output (no separate STT/TTS)
 * - 🗣️ Voice Activity Detection (VAD)
 * - 💬 Natural conversation flow with interruptions
 * - 🎭 Multiple voice options
 * - 📝 Audio transcription support
 * 
 * Model: gemini-2.5-flash-native-audio-preview (or gemini-live-2.5-flash-preview)
 * 
 * Architecture:
 * - Single API call replaces: Whisper (STT) + AI + Azure (TTS)
 * - Lower latency, better UX, simpler code
 * 
 * Author: Aman (Risenex Dynamics)
 * Created: December 2025
 * Updated: February 2026 - Centralized instructions from soriva-core-instructions.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { EventEmitter } from 'events';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPORT FROM CENTRAL SOURCE OF TRUTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { 
  buildVoicePrompt, 
  buildMinimalPrompt,
  COMPANY 
} from '../core/ai/soriva-core-instructions';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Available voice options for Gemini Live
 */
export type GeminiVoice = 
  | 'Puck'      // Default - Friendly, conversational
  | 'Charon'    // Deep, authoritative
  | 'Kore'      // Warm, empathetic
  | 'Fenrir'    // Energetic, dynamic
  | 'Aoede';    // Calm, soothing

/**
 * Session configuration for Gemini Live
 */
export interface GeminiLiveConfig {
  /** System instruction for AI personality */
  systemInstruction?: string;
  /** Voice to use for responses */
  voice?: GeminiVoice;
  /** Enable input audio transcription */
  enableInputTranscription?: boolean;
  /** Enable output audio transcription */
  enableOutputTranscription?: boolean;
  /** Language code (e.g., 'en-IN', 'hi-IN') */
  language?: string;
  /** Custom temperature for responses */
  temperature?: number;
}

/**
 * Audio input request
 */
export interface AudioInputRequest {
  /** Audio data as Buffer or base64 string */
  audioData: Buffer | string;
  /** MIME type (default: audio/pcm;rate=16000) */
  mimeType?: string;
}

/**
 * Response from Gemini Live
 */
export interface GeminiLiveResponse {
  /** Whether response was successful */
  success: boolean;
  /** Audio response as Buffer */
  audioBuffer?: Buffer;
  /** Audio response as base64 */
  audioBase64?: string;
  /** Transcription of user's input */
  inputTranscript?: string;
  /** Transcription of AI's response */
  outputTranscript?: string;
  /** Duration of response in seconds */
  durationSeconds?: number;
  /** Estimated cost in rupees */
  costRupees?: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Session state
 */
export interface SessionState {
  /** Whether session is active */
  isActive: boolean;
  /** Session start time */
  startedAt?: Date;
  /** Total audio input seconds */
  totalInputSeconds: number;
  /** Total audio output seconds */
  totalOutputSeconds: number;
  /** Total estimated cost */
  totalCostRupees: number;
}

/**
 * Live session events
 */
export interface GeminiLiveEvents {
  'connected': () => void;
  'disconnected': () => void;
  'audio': (audioBuffer: Buffer) => void;
  'transcript': (text: string, type: 'input' | 'output') => void;
  'error': (error: Error) => void;
  'turnEnd': () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Cost per minute in INR (at 10:90 input:output ratio)
const COST_PER_MINUTE_INPUT = 0.28;   // ₹0.28/min for audio input
const COST_PER_MINUTE_OUTPUT = 1.14;  // ₹1.14/min for audio output
const COST_PER_MINUTE_TOTAL = 1.42;   // ₹1.42/min combined

// Audio format specifications
const INPUT_SAMPLE_RATE = 16000;      // 16kHz for input
const OUTPUT_SAMPLE_RATE = 24000;     // 24kHz for output
const INPUT_MIME_TYPE = 'audio/pcm;rate=16000';
const OUTPUT_MIME_TYPE = 'audio/pcm;rate=24000';

// Model names
const GEMINI_LIVE_MODEL = 'gemini-live-2.5-flash-preview';
const GEMINI_NATIVE_AUDIO_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';

// Default system instruction for Soriva - now uses centralized buildVoicePrompt
// Using 'User' as default name since actual name is passed via config
const DEFAULT_SYSTEM_INSTRUCTION = buildVoicePrompt('User');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GEMINI LIVE SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class GeminiLiveService extends EventEmitter {
  private static instance: GeminiLiveService;
  private client: GoogleGenAI;
  private session: any = null;
  private sessionState: SessionState;
  private config: GeminiLiveConfig;
  private audioChunks: Buffer[] = [];

  private constructor() {
    super();
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY is required');
    }

    this.client = new GoogleGenAI({ apiKey });
    
    this.sessionState = {
      isActive: false,
      totalInputSeconds: 0,
      totalOutputSeconds: 0,
      totalCostRupees: 0,
    };

    this.config = {
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
      voice: 'Puck',
      enableInputTranscription: true,
      enableOutputTranscription: true,
      language: 'en-IN',
    };

    console.log('✅ GeminiLiveService initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GeminiLiveService {
    if (!GeminiLiveService.instance) {
      GeminiLiveService.instance = new GeminiLiveService();
    }
    return GeminiLiveService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Start a new live session
   */
  public async connect(config?: Partial<GeminiLiveConfig>): Promise<boolean> {
    try {
      // Merge config
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Build session config
      const sessionConfig: any = {
        responseModalities: [Modality.AUDIO],
        systemInstruction: this.config.systemInstruction,
      };

      // Add speech config if voice specified
      if (this.config.voice) {
        sessionConfig.speechConfig = {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.config.voice,
            },
          },
        };
      }

      // Enable transcription
      if (this.config.enableInputTranscription) {
        sessionConfig.inputAudioTranscription = {};
      }
      if (this.config.enableOutputTranscription) {
        sessionConfig.outputAudioTranscription = {};
      }

      // Connect to Gemini Live
      this.session = await this.client.live.connect({
        model: GEMINI_LIVE_MODEL,
        config: sessionConfig,
        callbacks: {
          onopen: () => {
            console.log('🎙️ Soriva OnAir: Connected');
            this.sessionState.isActive = true;
            this.sessionState.startedAt = new Date();
            this.emit('connected');
          },
          onmessage: (message: any) => {
            this.handleMessage(message);
          },
          onerror: (error: any) => {
            console.error('❌ Soriva OnAir Error:', error);
            this.emit('error', new Error(error?.message || 'Connection error'));
          },
          onclose: () => {
            console.log('🔌 Soriva OnAir: Disconnected');
            this.sessionState.isActive = false;
            this.emit('disconnected');
          },
        },
      });

      return true;

    } catch (error: any) {
      console.error('❌ Failed to connect to Gemini Live:', error);
      return false;
    }
  }

  /**
   * Disconnect from live session
   */
  public async disconnect(): Promise<void> {
    if (this.session) {
      try {
        await this.session.close();
      } catch (error) {
        console.error('Error closing session:', error);
      }
      this.session = null;
      this.sessionState.isActive = false;
    }
  }

  /**
   * Check if session is active
   */
  public isConnected(): boolean {
    return this.sessionState.isActive && this.session !== null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AUDIO HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Send audio input to Gemini Live
   */
  public async sendAudio(request: AudioInputRequest): Promise<boolean> {
    if (!this.isConnected()) {
      console.error('❌ Cannot send audio: Not connected');
      return false;
    }

    try {
      // Convert base64 to Buffer if needed
      let audioBuffer: Buffer;
      if (typeof request.audioData === 'string') {
        audioBuffer = Buffer.from(request.audioData, 'base64');
      } else {
        audioBuffer = request.audioData;
      }

      const mimeType = request.mimeType || INPUT_MIME_TYPE;

      // Send to Gemini Live
      await this.session.sendRealtimeInput({
        audio: {
          data: audioBuffer,
          mimeType: mimeType,
        },
      });

      // Track input duration (estimate based on buffer size)
      const estimatedSeconds = this.estimateAudioDuration(audioBuffer, mimeType);
      this.sessionState.totalInputSeconds += estimatedSeconds;
      this.updateCost();

      return true;

    } catch (error: any) {
      console.error('❌ Failed to send audio:', error);
      return false;
    }
  }

  /**
   * Send text input (for text-to-speech)
   */
  public async sendText(text: string): Promise<boolean> {
    if (!this.isConnected()) {
      console.error('❌ Cannot send text: Not connected');
      return false;
    }

    try {
      await this.session.sendClientContent({
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      });

      return true;

    } catch (error: any) {
      console.error('❌ Failed to send text:', error);
      return false;
    }
  }

  /**
   * Handle incoming message from Gemini Live
   */
  private handleMessage(message: any): void {
    try {
      const data = message?.data;
      if (!data) return;

      // Handle audio response
      if (data.serverContent?.modelTurn?.parts) {
        for (const part of data.serverContent.modelTurn.parts) {
          if (part.inlineData?.data) {
            const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
            this.audioChunks.push(audioBuffer);
            this.emit('audio', audioBuffer);

            // Track output duration
            const estimatedSeconds = this.estimateAudioDuration(
              audioBuffer,
              part.inlineData.mimeType || OUTPUT_MIME_TYPE
            );
            this.sessionState.totalOutputSeconds += estimatedSeconds;
            this.updateCost();
          }
        }
      }

      // Handle input transcription
      if (data.serverContent?.inputTranscription?.text) {
        const transcript = data.serverContent.inputTranscription.text;
        console.log('📝 User said:', transcript);
        this.emit('transcript', transcript, 'input');
      }

      // Handle output transcription
      if (data.serverContent?.outputTranscription?.text) {
        const transcript = data.serverContent.outputTranscription.text;
        console.log('🗣️ Soriva said:', transcript);
        this.emit('transcript', transcript, 'output');
      }

      // Handle turn complete
      if (data.serverContent?.turnComplete) {
        this.emit('turnEnd');
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SIMPLE REQUEST-RESPONSE (Non-streaming)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Process audio and get response (simple request-response mode)
   * This is useful for non-streaming scenarios
   */
  public async processAudio(
    audioInput: Buffer | string,
    config?: Partial<GeminiLiveConfig>
  ): Promise<GeminiLiveResponse> {
    try {
      // Convert base64 to Buffer if needed
      let audioBuffer: Buffer;
      if (typeof audioInput === 'string') {
        audioBuffer = Buffer.from(audioInput, 'base64');
      } else {
        audioBuffer = audioInput;
      }

      // Merge config
      const sessionConfig = { ...this.config, ...config };

      // Reset audio chunks
      this.audioChunks = [];
      let inputTranscript = '';
      let outputTranscript = '';

      // Connect if not connected
      const wasConnected = this.isConnected();
      if (!wasConnected) {
        const connected = await this.connect(sessionConfig);
        if (!connected) {
          return {
            success: false,
            error: 'Failed to connect to Gemini Live',
          };
        }
      }

      // Set up listeners for this request
      const responsePromise = new Promise<GeminiLiveResponse>((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            error: 'Request timeout',
          });
        }, 30000); // 30 second timeout

        const onTranscript = (text: string, type: 'input' | 'output') => {
          if (type === 'input') inputTranscript = text;
          if (type === 'output') outputTranscript += text + ' ';
        };

        const onTurnEnd = () => {
          clearTimeout(timeout);
          this.removeListener('transcript', onTranscript);
          this.removeListener('turnEnd', onTurnEnd);

          // Combine audio chunks
          const combinedAudio = Buffer.concat(this.audioChunks);
          const durationSeconds = this.estimateAudioDuration(combinedAudio, OUTPUT_MIME_TYPE);
          const costRupees = this.calculateCost(
            this.estimateAudioDuration(audioBuffer, INPUT_MIME_TYPE),
            durationSeconds
          );

          resolve({
            success: true,
            audioBuffer: combinedAudio,
            audioBase64: combinedAudio.toString('base64'),
            inputTranscript: inputTranscript.trim(),
            outputTranscript: outputTranscript.trim(),
            durationSeconds,
            costRupees,
          });
        };

        this.on('transcript', onTranscript);
        this.on('turnEnd', onTurnEnd);
      });

      // Send audio
      await this.sendAudio({ audioData: audioBuffer });

      // Wait for response
      const response = await responsePromise;

      // Disconnect if we connected for this request
      if (!wasConnected) {
        await this.disconnect();
      }

      return response;

    } catch (error: any) {
      console.error('❌ Error processing audio:', error);
      return {
        success: false,
        error: error.message || 'Failed to process audio',
      };
    }
  }

  /**
   * Generate personalized wake word response
   * User says: "Listen, Soriva" or "Hey Soriva"
   * System responds: "Yes, [User Name]" or "Hi [User Name], how can I help?"
   */
  public async generateWakeWordResponse(
    userName: string,
    greeting?: string
  ): Promise<GeminiLiveResponse> {
    try {
      const responseText = greeting || `Yes, ${userName}. How can I help you?`;

      // For wake word, we use text-to-speech mode with minimal prompt
      // Connect with text input mode
      const connected = await this.connect({
        ...this.config,
        systemInstruction: `You are Soriva by ${COMPANY.name}. Respond with exactly: "${responseText}" in a warm, helpful tone.`,
      });

      if (!connected) {
        return {
          success: false,
          error: 'Failed to connect',
        };
      }

      // Reset chunks
      this.audioChunks = [];

      // Set up response listener
      const responsePromise = new Promise<GeminiLiveResponse>((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            error: 'Wake word timeout',
          });
        }, 10000);

        const onTurnEnd = () => {
          clearTimeout(timeout);
          this.removeListener('turnEnd', onTurnEnd);

          const combinedAudio = Buffer.concat(this.audioChunks);
          const durationSeconds = this.estimateAudioDuration(combinedAudio, OUTPUT_MIME_TYPE);

          resolve({
            success: true,
            audioBuffer: combinedAudio,
            audioBase64: combinedAudio.toString('base64'),
            outputTranscript: responseText,
            durationSeconds,
            costRupees: durationSeconds * (COST_PER_MINUTE_OUTPUT / 60),
          });
        };

        this.on('turnEnd', onTurnEnd);
      });

      // Send text prompt
      await this.sendText(`Say: ${responseText}`);

      const response = await responsePromise;
      await this.disconnect();

      return response;

    } catch (error: any) {
      console.error('❌ Wake word error:', error);
      return {
        success: false,
        error: error.message || 'Wake word generation failed',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Estimate audio duration from buffer size
   */
  private estimateAudioDuration(buffer: Buffer, mimeType: string): number {
    // PCM 16-bit = 2 bytes per sample
    const bytesPerSample = 2;
    
    // Get sample rate from mime type
    let sampleRate = INPUT_SAMPLE_RATE;
    if (mimeType.includes('24000')) {
      sampleRate = OUTPUT_SAMPLE_RATE;
    } else if (mimeType.includes('16000')) {
      sampleRate = INPUT_SAMPLE_RATE;
    }

    const samples = buffer.length / bytesPerSample;
    const seconds = samples / sampleRate;

    return parseFloat(seconds.toFixed(2));
  }

  /**
   * Calculate cost for audio duration
   */
  private calculateCost(inputSeconds: number, outputSeconds: number): number {
    const inputCost = (inputSeconds / 60) * COST_PER_MINUTE_INPUT;
    const outputCost = (outputSeconds / 60) * COST_PER_MINUTE_OUTPUT;
    return parseFloat((inputCost + outputCost).toFixed(4));
  }

  /**
   * Update session cost
   */
  private updateCost(): void {
    this.sessionState.totalCostRupees = this.calculateCost(
      this.sessionState.totalInputSeconds,
      this.sessionState.totalOutputSeconds
    );
  }

  /**
   * Get current session state
   */
  public getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  /**
   * Get session duration in seconds
   */
  public getSessionDuration(): number {
    if (!this.sessionState.startedAt) return 0;
    return (Date.now() - this.sessionState.startedAt.getTime()) / 1000;
  }

  /**
   * Get total cost for current session
   */
  public getSessionCost(): number {
    return this.sessionState.totalCostRupees;
  }

  /**
   * Get cost per minute
   */
  public getCostPerMinute(): number {
    return COST_PER_MINUTE_TOTAL;
  }

  /**
   * Get available voices
   */
  public getAvailableVoices(): Array<{ name: GeminiVoice; description: string }> {
    return [
      { name: 'Puck', description: 'Friendly, conversational (Default)' },
      { name: 'Charon', description: 'Deep, authoritative' },
      { name: 'Kore', description: 'Warm, empathetic' },
      { name: 'Fenrir', description: 'Energetic, dynamic' },
      { name: 'Aoede', description: 'Calm, soothing' },
    ];
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<GeminiLiveConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): GeminiLiveConfig {
    return { ...this.config };
  }

  /**
   * Validate audio format
   */
  public isValidAudioFormat(mimeType: string): boolean {
    const validFormats = [
      'audio/pcm',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/mp3',
      'audio/mpeg',
    ];
    return validFormats.some(format => mimeType.toLowerCase().includes(format));
  }

  /**
   * Reset session statistics
   */
  public resetStats(): void {
    this.sessionState = {
      isActive: this.sessionState.isActive,
      startedAt: this.sessionState.startedAt,
      totalInputSeconds: 0,
      totalOutputSeconds: 0,
      totalCostRupees: 0,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default GeminiLiveService;
export { 
  COST_PER_MINUTE_TOTAL,
  COST_PER_MINUTE_INPUT,
  COST_PER_MINUTE_OUTPUT,
  INPUT_SAMPLE_RATE,
  OUTPUT_SAMPLE_RATE,
  GEMINI_LIVE_MODEL,
};