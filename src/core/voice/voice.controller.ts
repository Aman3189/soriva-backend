/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE CONTROLLER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Handle voice-related API endpoints (STT, TTS, Wake Word)
 * 
 * Endpoints:
 * - POST /api/voice/wake-word - Handle "Listen, Soriva" + personalized response
 * - POST /api/voice/transcribe - Speech-to-Text (audio → text)
 * - POST /api/voice/synthesize - Text-to-Speech (text → audio)
 * - GET  /api/voice/stats - Get voice usage statistics
 * 
 * Wake Word Flow:
 * User: "Listen, Soriva"
 * System: "Yes, [User Name]" (personalized TTS response)
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response } from 'express';
import WhisperService from '../../services/whisper.service';
import AzureTTSService from '../../services/azure-tts.service';
import VoiceUsageService from '../../services/voice-usage.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE INSTANCES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const whisperService = WhisperService.getInstance();
const azureTTSService = AzureTTSService.getInstance();
const voiceUsageService = VoiceUsageService.getInstance();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOICE CONTROLLER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class VoiceController {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WAKE WORD HANDLER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Handle wake word activation: "Listen, Soriva"
   * Returns personalized TTS response: "Yes, [User Name]"
   * 
   * POST /api/voice/wake-word
   */
  async handleWakeWord(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userName = (req as any).user?.name || 'there';

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // Check if user has voice minutes remaining
      const hasMinutes = await voiceUsageService.hasVoiceMinutesRemaining(userId);
      
      if (!hasMinutes) {
        res.status(403).json({
          success: false,
          error: 'Voice minutes exhausted. Please upgrade your plan.'
        });
        return;
      }

      // Generate personalized wake word response
      const ttsResponse = await azureTTSService.generateWakeWordResponse(userName);

      if (!ttsResponse.success || !ttsResponse.audioBuffer) {
        res.status(500).json({
          success: false,
          error: ttsResponse.error || 'Failed to generate wake word response'
        });
        return;
      }

      // Record TTS usage (wake word is very short, ~1-2 seconds)
      const ttsSeconds = ttsResponse.durationSeconds || 2;
      const totalMinutes = voiceUsageService.calculateTotalMinutes(0, ttsSeconds);

      await voiceUsageService.recordVoiceUsage(userId, {
        sttSeconds: 0,
        ttsSeconds,
        totalMinutes
      });

      // Return audio as base64
      const audioBase64 = ttsResponse.audioBuffer.toString('base64');

      res.status(200).json({
        success: true,
        audio: audioBase64,
        message: `Yes, ${userName}`,
        duration: ttsSeconds,
        cost: ttsResponse.costRupees
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
  // SPEECH-TO-TEXT (STT) HANDLER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Transcribe audio to text using Whisper API
   * 
   * POST /api/voice/transcribe
   * Body: { audio: base64String, mimeType: string }
   */
  async transcribeAudio(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { audio, mimeType } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // Validate input
      if (!audio || !mimeType) {
        res.status(400).json({
          success: false,
          error: 'Audio and mimeType are required'
        });
        return;
      }

      // Validate audio format
      if (!whisperService.isValidAudioFormat(mimeType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid audio format. Supported: mp3, wav, webm, m4a, ogg'
        });
        return;
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audio, 'base64');

      // Estimate duration and check STT limits
      const estimatedDuration = whisperService['estimateAudioDuration'](audioBuffer, mimeType);
      const canUseSTT = await voiceUsageService.canUseStt(userId, estimatedDuration);

      if (!canUseSTT.allowed) {
        res.status(403).json({
          success: false,
          error: canUseSTT.reason,
          remaining: canUseSTT.remaining
        });
        return;
      }

      // Transcribe audio
      const transcription = await whisperService.transcribeAudio({
        audioBuffer,
        fileName: `audio_${Date.now()}.webm`,
        mimeType
      });

      if (!transcription.success || !transcription.text) {
        res.status(500).json({
          success: false,
          error: transcription.error || 'Transcription failed'
        });
        return;
      }

      // Record STT usage
      const sttSeconds = transcription.durationSeconds || estimatedDuration;
      const totalMinutes = voiceUsageService.calculateTotalMinutes(sttSeconds, 0);

      await voiceUsageService.recordVoiceUsage(userId, {
        sttSeconds,
        ttsSeconds: 0,
        totalMinutes
      });

      res.status(200).json({
        success: true,
        text: transcription.text,
        duration: sttSeconds,
        cost: transcription.costRupees
      });

    } catch (error: any) {
      console.error('❌ Transcription error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEXT-TO-SPEECH (TTS) HANDLER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Synthesize text to speech using Azure Neural TTS
   * 
   * POST /api/voice/synthesize
   * Body: { text: string }
   */
  async synthesizeSpeech(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { text } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // Validate input
      if (!text || text.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Text is required'
        });
        return;
      }

      // Truncate text if too long
      const maxChars = azureTTSService.getMaxCharacters();
      const truncatedText = azureTTSService.truncateText(text, maxChars);

      // Estimate duration and check TTS limits
      const estimatedDuration = azureTTSService.estimateDuration(truncatedText.length);
      const canUseTTS = await voiceUsageService.canUseTts(userId, estimatedDuration);

      if (!canUseTTS.allowed) {
        res.status(403).json({
          success: false,
          error: canUseTTS.reason,
          remaining: canUseTTS.remaining
        });
        return;
      }

      // Synthesize speech
      const synthesis = await azureTTSService.synthesizeSpeech({
        text: truncatedText
      });

      if (!synthesis.success || !synthesis.audioBuffer) {
        res.status(500).json({
          success: false,
          error: synthesis.error || 'Speech synthesis failed'
        });
        return;
      }

      // Record TTS usage
      const ttsSeconds = synthesis.durationSeconds || estimatedDuration;
      const totalMinutes = voiceUsageService.calculateTotalMinutes(0, ttsSeconds);

      await voiceUsageService.recordVoiceUsage(userId, {
        sttSeconds: 0,
        ttsSeconds,
        totalMinutes
      });

      // Return audio as base64
      const audioBase64 = synthesis.audioBuffer.toString('base64');

      res.status(200).json({
        success: true,
        audio: audioBase64,
        text: truncatedText,
        characterCount: synthesis.characterCount,
        duration: ttsSeconds,
        cost: synthesis.costRupees
      });

    } catch (error: any) {
      console.error('❌ Speech synthesis error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE STATISTICS HANDLER
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
        stats
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
  // VOICE LIMITS INFO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get voice limits configuration
   * 
   * GET /api/voice/limits
   */
  async getVoiceLimits(req: Request, res: Response): Promise<void> {
    try {
      const limits = voiceUsageService.getVoiceLimits();

      res.status(200).json({
        success: true,
        limits
      });

    } catch (error: any) {
      console.error('❌ Voice limits error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default new VoiceController();