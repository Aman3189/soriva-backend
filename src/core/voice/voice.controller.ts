/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE CONTROLLER - SORIVA ONAIR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Handle voice-related API endpoints using Gemini Live API
 * Updated: December 2025 - Migrated to Soriva OnAir (Gemini Live)
 * 
 * MIGRATION: Whisper + Azure → Gemini Live API
 * - Single API call instead of 3 separate calls
 * - Real-time bidirectional audio streaming
 * - Lower latency, better UX
 * - Cost: ₹1.42/min (vs ₹1.66/min legacy)
 * 
 * Endpoints:
 * - POST /api/voice/process    - Main voice endpoint (audio in → audio out)
 * - POST /api/voice/wake-word  - Handle "Listen, Soriva" + personalized response
 * - POST /api/voice/text-to-speech - Convert text to speech
 * - GET  /api/voice/stats      - Get voice usage statistics
 * - GET  /api/voice/limits     - Get voice limits for user's plan
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response } from 'express';
import GeminiLiveService from '../../services/gemini-live.service';
import VoiceUsageService from '../../services/voice-usage.service';
import { VoiceTechnology } from '../../constants/plans';
import { PlanType } from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE INSTANCES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const geminiLiveService = GeminiLiveService.getInstance();
const voiceUsageService = VoiceUsageService.getInstance();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOICE CONTROLLER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class VoiceController {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN VOICE PROCESSING (OnAir)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Process voice input and return voice response
   * Uses Gemini Live API for real-time audio processing
   * 
   * POST /api/voice/process
   * Body: { audio: base64String, mimeType?: string }
   */
  async processVoice(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userName = (req as any).user?.name || 'there';
      const { audio, mimeType } = req.body;

      // ─────────────────────────────────────────────────────────────────
      // Authentication Check
      // ─────────────────────────────────────────────────────────────────
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Input Validation
      // ─────────────────────────────────────────────────────────────────
      if (!audio) {
        res.status(400).json({
          success: false,
          error: 'Audio data is required'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Voice Access Check (Plan-based)
      // ─────────────────────────────────────────────────────────────────
      const voiceLimits = await voiceUsageService.getVoiceLimits(userId);
      
      if (!voiceLimits.hasAccess) {
        res.status(403).json({
          success: false,
          error: 'Voice features are not available on Starter plan. Please upgrade to Plus or higher.',
          upgradeRequired: true
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Check Daily Limits
      // ─────────────────────────────────────────────────────────────────
      const hasMinutes = await voiceUsageService.hasVoiceMinutesRemaining(userId);
      
      if (!hasMinutes) {
        res.status(403).json({
          success: false,
          error: 'Daily voice minutes exhausted. Resets at midnight.',
          limitReached: true
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Estimate input duration for limit check
      // ─────────────────────────────────────────────────────────────────
      const audioBuffer = Buffer.from(audio, 'base64');
      const estimatedInputSeconds = this.estimateAudioDuration(audioBuffer, mimeType || 'audio/webm');

      const canUseVoice = await voiceUsageService.canUseStt(userId, estimatedInputSeconds);
      
      if (!canUseVoice.allowed) {
        res.status(403).json({
          success: false,
          error: canUseVoice.reason,
          remaining: canUseVoice.remaining
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Process with Gemini Live (OnAir)
      // ─────────────────────────────────────────────────────────────────
      console.log(`🎙️ Processing voice for user: ${userName} (${userId})`);

      const response = await geminiLiveService.processAudio(audio, {
        systemInstruction: this.buildSystemInstruction(userName),
        voice: 'Kore', // Warm voice for Indian users
        enableInputTranscription: true,
        enableOutputTranscription: true,
      });

      if (!response.success || !response.audioBase64) {
        res.status(500).json({
          success: false,
          error: response.error || 'Voice processing failed'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Record Usage
      // ─────────────────────────────────────────────────────────────────
      const totalSeconds = estimatedInputSeconds + (response.durationSeconds || 0);
      const totalMinutes = voiceUsageService.calculateTotalMinutes(
        estimatedInputSeconds,
        response.durationSeconds || 0
      );

      await voiceUsageService.recordVoiceUsage(userId, {
        sttSeconds: estimatedInputSeconds,
        ttsSeconds: response.durationSeconds || 0,
        totalMinutes
      });

      // ─────────────────────────────────────────────────────────────────
      // Success Response
      // ─────────────────────────────────────────────────────────────────
      res.status(200).json({
        success: true,
        audio: response.audioBase64,
        inputTranscript: response.inputTranscript,
        outputTranscript: response.outputTranscript,
        duration: response.durationSeconds,
        cost: response.costRupees,
        technology: 'onair' // Soriva OnAir badge
      });

    } catch (error: any) {
      console.error('❌ Voice processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WAKE WORD HANDLER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Handle wake word activation: "Listen, Soriva" or "Hey Soriva"
   * Returns personalized response: "Yes, [User Name]" or custom greeting
   * 
   * POST /api/voice/wake-word
   * Body: { greeting?: string }
   */
  async handleWakeWord(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userName = (req as any).user?.name || 'there';
      const { greeting } = req.body;

      // ─────────────────────────────────────────────────────────────────
      // Authentication Check
      // ─────────────────────────────────────────────────────────────────
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Voice Access Check
      // ─────────────────────────────────────────────────────────────────
      const hasMinutes = await voiceUsageService.hasVoiceMinutesRemaining(userId);
      
      if (!hasMinutes) {
        res.status(403).json({
          success: false,
          error: 'Voice minutes exhausted. Please upgrade your plan.'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Generate Wake Word Response
      // ─────────────────────────────────────────────────────────────────
      console.log(`🎙️ Wake word triggered for: ${userName}`);

      const response = await geminiLiveService.generateWakeWordResponse(userName, greeting);

      if (!response.success || !response.audioBase64) {
        res.status(500).json({
          success: false,
          error: response.error || 'Failed to generate wake word response'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Record Usage (wake word is very short, ~1-2 seconds)
      // ─────────────────────────────────────────────────────────────────
      const ttsSeconds = response.durationSeconds || 2;
      const totalMinutes = voiceUsageService.calculateTotalMinutes(0, ttsSeconds);

      await voiceUsageService.recordVoiceUsage(userId, {
        sttSeconds: 0,
        ttsSeconds,
        totalMinutes
      });

      // ─────────────────────────────────────────────────────────────────
      // Success Response
      // ─────────────────────────────────────────────────────────────────
      res.status(200).json({
        success: true,
        audio: response.audioBase64,
        message: response.outputTranscript || `Yes, ${userName}`,
        duration: ttsSeconds,
        cost: response.costRupees,
        technology: 'onair'
      });

    } catch (error: any) {
      console.error('❌ Wake word error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEXT-TO-SPEECH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Convert text to speech using Gemini Live
   * 
   * POST /api/voice/text-to-speech
   * Body: { text: string, voice?: string }
   */
  async textToSpeech(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { text, voice } = req.body;

      // ─────────────────────────────────────────────────────────────────
      // Authentication Check
      // ─────────────────────────────────────────────────────────────────
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Input Validation
      // ─────────────────────────────────────────────────────────────────
      if (!text || text.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Text is required'
        });
        return;
      }

      // Limit text length for voice (max ~500 characters for reasonable audio)
      const maxChars = 500;
      const truncatedText = text.length > maxChars 
        ? text.substring(0, maxChars) + '...' 
        : text;

      // ─────────────────────────────────────────────────────────────────
      // Check TTS Limits
      // ─────────────────────────────────────────────────────────────────
      const estimatedSeconds = truncatedText.length / 15; // ~15 chars/second
      const canUseTTS = await voiceUsageService.canUseTts(userId, estimatedSeconds);

      if (!canUseTTS.allowed) {
        res.status(403).json({
          success: false,
          error: canUseTTS.reason,
          remaining: canUseTTS.remaining
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Generate Speech
      // ─────────────────────────────────────────────────────────────────
      const connected = await geminiLiveService.connect({
        systemInstruction: `Convert the following text to natural speech: "${truncatedText}"`,
        voice: voice || 'Kore',
      });

      if (!connected) {
        res.status(500).json({
          success: false,
          error: 'Failed to connect to voice service'
        });
        return;
      }

      // Send text and collect audio
      await geminiLiveService.sendText(truncatedText);

      // Wait for response (simple timeout-based approach)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const sessionState = geminiLiveService.getSessionState();
      await geminiLiveService.disconnect();

      // ─────────────────────────────────────────────────────────────────
      // Record Usage
      // ─────────────────────────────────────────────────────────────────
      const ttsSeconds = sessionState.totalOutputSeconds || estimatedSeconds;
      const totalMinutes = voiceUsageService.calculateTotalMinutes(0, ttsSeconds);

      await voiceUsageService.recordVoiceUsage(userId, {
        sttSeconds: 0,
        ttsSeconds,
        totalMinutes
      });

      // ─────────────────────────────────────────────────────────────────
      // Success Response
      // ─────────────────────────────────────────────────────────────────
      res.status(200).json({
        success: true,
        text: truncatedText,
        duration: ttsSeconds,
        cost: sessionState.totalCostRupees,
        technology: 'onair'
      });

    } catch (error: any) {
      console.error('❌ Text-to-speech error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEGACY ENDPOINTS (For backward compatibility)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Legacy: Transcribe audio (redirects to processVoice)
   * POST /api/voice/transcribe
   */
  async transcribeAudio(req: Request, res: Response): Promise<void> {
    // Redirect to main processVoice endpoint
    return this.processVoice(req, res);
  }

  /**
   * Legacy: Synthesize speech (redirects to textToSpeech)
   * POST /api/voice/synthesize
   */
  async synthesizeSpeech(req: Request, res: Response): Promise<void> {
    // Redirect to textToSpeech endpoint
    return this.textToSpeech(req, res);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE STATISTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get voice usage statistics for current user
   * 
   * GET /api/voice/stats
   */
  async getVoiceStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const stats = await voiceUsageService.getVoiceStats(userId);

      if (!stats) {
        res.status(404).json({
          success: false,
          error: 'Usage statistics not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        stats: {
          ...stats,
          technology: 'onair', // Soriva OnAir
          costPerMinute: geminiLiveService.getCostPerMinute(),
        }
      });

    } catch (error: any) {
      console.error('❌ Voice stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VOICE LIMITS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get voice limits configuration for user's plan
   * 
   * GET /api/voice/limits
   */
  async getVoiceLimits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const limits = await voiceUsageService.getVoiceLimits(userId);
      const planStatus = await voiceUsageService.getPlanLimitsStatus(userId);

      res.status(200).json({
        success: true,
        limits,
        status: planStatus,
        technology: 'onair',
        features: {
          realTimeStreaming: true,
          voiceActivityDetection: true,
          naturalConversation: true,
          multiLanguage: true,
          availableVoices: geminiLiveService.getAvailableVoices(),
        }
      });

    } catch (error: any) {
      console.error('❌ Voice limits error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AVAILABLE VOICES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get available voice options
   * 
   * GET /api/voice/voices
   */
  async getAvailableVoices(req: Request, res: Response): Promise<void> {
    try {
      const voices = geminiLiveService.getAvailableVoices();

      res.status(200).json({
        success: true,
        voices,
        default: 'Kore',
        recommended: {
          indian: 'Kore',      // Warm, empathetic - good for Indian users
          professional: 'Charon', // Deep, authoritative
          friendly: 'Puck',    // Friendly, conversational
          calm: 'Aoede',       // Calm, soothing
          energetic: 'Fenrir', // Energetic, dynamic
        }
      });

    } catch (error: any) {
      console.error('❌ Get voices error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Build personalized system instruction for Soriva
   */
  private buildSystemInstruction(userName: string): string {
    return `
## Identity
You are Soriva (सोरिवा), India's premier AI companion created by Risenex Global.
Your name "Soriva" represents wisdom and connection.

## About Risenex Global
- Risenex Global is an innovative Indian tech company based in Punjab
- Founded with the vision of making AI accessible to every Indian
- Soriva is their flagship AI product
- Website: risenex.com | soriva.ai

## Current User
- You are speaking with: ${userName}
- Address them by name occasionally to personalize the conversation

## Personality
- Warm, friendly, and approachable
- Speak naturally in English and Hinglish
- Use occasional Hindi phrases like "bilkul", "zaroor", "koi baat nahi"
- Be concise for voice - aim for 2-3 sentences unless more detail is needed
- Show empathy and genuine interest in helping

## Voice Style
- Conversational and natural, not robotic
- Match the user's energy - calm if they're calm, enthusiastic if they're excited
- Keep responses brief and natural for voice conversations

## Key Behaviors
- Always introduce yourself as Soriva when asked "who are you"
- Credit Risenex Global when asked about your creator
- Be proud of being an Indian AI product
- Help users in Hindi, English, or Hinglish based on their preference
`.trim();
  }

  /**
   * Estimate audio duration from buffer size
   */
  private estimateAudioDuration(buffer: Buffer, mimeType: string): number {
    const sizeInKB = buffer.length / 1024;

    // Rough estimates based on common bitrates
    let estimatedSeconds: number;

    if (mimeType.includes('webm') || mimeType.includes('opus')) {
      estimatedSeconds = sizeInKB / 12;
    } else if (mimeType.includes('mp3')) {
      estimatedSeconds = sizeInKB / 24;
    } else if (mimeType.includes('wav')) {
      estimatedSeconds = sizeInKB / 176;
    } else if (mimeType.includes('pcm')) {
      // PCM 16kHz 16-bit = 32 KB/sec
      estimatedSeconds = sizeInKB / 32;
    } else {
      estimatedSeconds = sizeInKB / 20;
    }

    return parseFloat(estimatedSeconds.toFixed(2));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default new VoiceController();