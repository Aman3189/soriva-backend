/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE CONTROLLER - SORIVA ONAIR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Handle voice-related API endpoints using Gemini Live API
 * Updated: December 2025 - Added Dynamic Bonus Minutes System
 * 
 * MIGRATION: Whisper + Azure → Gemini Live API
 * - Single API call instead of 3 separate calls
 * - Real-time bidirectional audio streaming
 * - Lower latency, better UX
 * - Cost: ₹1.42/min (budgeted) | Actual varies by input:output ratio
 * 
* 🆕 DYNAMIC BONUS MINUTES:
 * - "The more you SPEAK, the more you earn!"
 * - Efficient conversations (more USER input) = savings
 * - Savings convert to bonus minutes automatically
 * 
 * Endpoints:
 * - POST /api/voice/process    - Main voice endpoint (audio in → audio out)
 * - POST /api/voice/wake-word  - Handle "Listen, Soriva" + personalized response
 * - POST /api/voice/text-to-speech - Convert text to speech
 * - GET  /api/voice/stats      - Get voice usage statistics
 * - GET  /api/voice/limits     - Get voice limits for user's plan
 * - GET  /api/voice/voices     - Get available voice options
 * - GET  /api/voice/bonus      - 🆕 Get bonus minutes status
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response } from 'express';
import GeminiLiveService from '../../services/gemini-live.service';
import VoiceUsageService from '../../services/voice-usage.service';
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
   * 🆕 Now tracks savings and awards bonus minutes!
   * 
   * POST /api/voice/process
   * Body: { audio: base64String, mimeType?: string }
   */
  async processVoice(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userName = (req as any).user?.name || 'there';
      const { audio, mimeType, voice } = req.body;

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
      // Estimate input duration for limit check
      // ─────────────────────────────────────────────────────────────────
      const audioBuffer = Buffer.from(audio, 'base64');
      const estimatedInputSeconds = this.estimateAudioDuration(audioBuffer, mimeType || 'audio/webm');

      // ─────────────────────────────────────────────────────────────────
      // Voice Access & Limits Check (includes bonus minutes!)
      // ─────────────────────────────────────────────────────────────────
      const limitCheck = await voiceUsageService.canUseVoice(userId, estimatedInputSeconds);
      
      if (!limitCheck.allowed) {
        const statusCode = limitCheck.upgradeRequired ? 403 : 429;
        res.status(statusCode).json({
          success: false,
          error: limitCheck.reason,
          limitType: limitCheck.limitType,
          upgradeRequired: limitCheck.upgradeRequired || false,
          remaining: limitCheck.remaining,
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Process with Gemini Live (OnAir)
      // ─────────────────────────────────────────────────────────────────
      console.log(`🎙️ Processing voice for user: ${userName} (${userId})`);

      // Determine gender from voice name
          const selectedVoice = voice || 'Kore';// default voice
          const voiceGender = ['Kore', 'Aoede'].includes(selectedVoice) ? 'female' : 'male';

          const response = await geminiLiveService.processAudio(audio, {
            systemInstruction: this.buildSystemInstruction(userName, voiceGender),
            voice: selectedVoice,
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
      // Record Usage (🆕 Now returns cost breakdown & bonus info!)
      // ─────────────────────────────────────────────────────────────────
      const outputSeconds = response.durationSeconds || 0;
      const totalMinutes = voiceUsageService.calculateTotalMinutes(
        estimatedInputSeconds,
        outputSeconds
      );

      const usageResult = await voiceUsageService.recordUsage(userId, {
        inputSeconds: estimatedInputSeconds,
        outputSeconds: outputSeconds,
        totalMinutes
      });

      // ─────────────────────────────────────────────────────────────────
      // Build Response with Bonus Info
      // ─────────────────────────────────────────────────────────────────
      const responsePayload: any = {
        success: true,
        audio: response.audioBase64,
        inputTranscript: response.inputTranscript,
        outputTranscript: response.outputTranscript,
        duration: response.durationSeconds,
        cost: response.costRupees,
        remaining: limitCheck.remaining,
        technology: 'onair'
      };

      // 🆕 Add cost breakdown if available
      if (usageResult.costBreakdown) {
        responsePayload.costDetails = {
          inputSeconds: usageResult.costBreakdown.inputSeconds,
          outputSeconds: usageResult.costBreakdown.outputSeconds,
          actualCost: usageResult.costBreakdown.actualCost,
          budgetedCost: usageResult.costBreakdown.budgetedCost,
          savings: usageResult.costBreakdown.savings,
          ratio: usageResult.costBreakdown.inputOutputRatio,
        };
      }

      // 🆕 Add bonus notification if earned!
      if (usageResult.bonusResult && usageResult.bonusResult.bonusMinutesAwarded > 0) {
        responsePayload.bonus = {
          awarded: true,
          minutesEarned: usageResult.bonusResult.bonusMinutesAwarded,
          totalBonusMinutes: usageResult.bonusResult.totalBonusMinutes,
          message: usageResult.bonusResult.message || `🎁 +${usageResult.bonusResult.bonusMinutesAwarded} bonus minute earned!`,
        };
      }

      // ─────────────────────────────────────────────────────────────────
      // Success Response
      // ─────────────────────────────────────────────────────────────────
      res.status(200).json(responsePayload);

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
      const userId = (req as any).user?.userId;
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
      // Voice Access Check (wake word is short, ~2-3 seconds)
      // ─────────────────────────────────────────────────────────────────
      const limitCheck = await voiceUsageService.canUseVoice(userId, 3);
      
      if (!limitCheck.allowed) {
        res.status(limitCheck.upgradeRequired ? 403 : 429).json({
          success: false,
          error: limitCheck.reason,
          upgradeRequired: limitCheck.upgradeRequired || false,
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
      // Record Usage (wake word = mostly output, minimal savings)
      // ─────────────────────────────────────────────────────────────────
      const outputSeconds = response.durationSeconds || 2;
      const totalMinutes = voiceUsageService.calculateTotalMinutes(0, outputSeconds);

      const usageResult = await voiceUsageService.recordUsage(userId, {
        inputSeconds: 0, // Wake word has minimal input
        outputSeconds,
        totalMinutes
      });

      // ─────────────────────────────────────────────────────────────────
      // Build Response
      // ─────────────────────────────────────────────────────────────────
      const responsePayload: any = {
        success: true,
        audio: response.audioBase64,
        message: response.outputTranscript || `Yes, ${userName}`,
        duration: outputSeconds,
        cost: response.costRupees,
        technology: 'onair'
      };

      // 🆕 Add bonus notification if earned
      if (usageResult.bonusResult && usageResult.bonusResult.bonusMinutesAwarded > 0) {
        responsePayload.bonus = {
          awarded: true,
          minutesEarned: usageResult.bonusResult.bonusMinutesAwarded,
          message: usageResult.bonusResult.message,
        };
      }

      res.status(200).json(responsePayload);

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
   * Note: TTS is 100% output = no input savings (output is expensive)
   * 
   * POST /api/voice/text-to-speech
   * Body: { text: string, voice?: string }
   */
  async textToSpeech(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
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
      // Estimate duration and check limits
      // ─────────────────────────────────────────────────────────────────
      const estimatedSeconds = truncatedText.length / 15; // ~15 chars/second
      const limitCheck = await voiceUsageService.canUseVoice(userId, estimatedSeconds);

      if (!limitCheck.allowed) {
        res.status(limitCheck.upgradeRequired ? 403 : 429).json({
          success: false,
          error: limitCheck.reason,
          limitType: limitCheck.limitType,
          upgradeRequired: limitCheck.upgradeRequired || false,
          remaining: limitCheck.remaining,
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Generate Speech
      // ─────────────────────────────────────────────────────────────────
      const selectedVoice = voice || 'Kore';
      const connected = await geminiLiveService.connect({
        systemInstruction: `Convert the following text to natural speech: "${truncatedText}"`,
        voice: selectedVoice,
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
      // Record Usage (TTS = 0 input, all output = minimal savings)
      // ─────────────────────────────────────────────────────────────────
      const outputSeconds = sessionState.totalOutputSeconds || estimatedSeconds;
      const totalMinutes = voiceUsageService.calculateTotalMinutes(0, outputSeconds);

      const usageResult = await voiceUsageService.recordUsage(userId, {
        inputSeconds: 0, // TTS has no audio input
        outputSeconds,
        totalMinutes
      });

      // ─────────────────────────────────────────────────────────────────
      // Build Response
      // ─────────────────────────────────────────────────────────────────
      const responsePayload: any = {
        success: true,
        text: truncatedText,
        duration: outputSeconds,
        cost: sessionState.totalCostRupees,
        remaining: limitCheck.remaining,
        technology: 'onair'
      };

      // 🆕 Add cost details
      if (usageResult.costBreakdown) {
        responsePayload.costDetails = {
          actualCost: usageResult.costBreakdown.actualCost,
          budgetedCost: usageResult.costBreakdown.budgetedCost,
          savings: usageResult.costBreakdown.savings,
          ratio: usageResult.costBreakdown.inputOutputRatio, // Should be "0:100" for TTS
        };
      }

      // 🆕 Add bonus notification if earned
      if (usageResult.bonusResult && usageResult.bonusResult.bonusMinutesAwarded > 0) {
        responsePayload.bonus = {
          awarded: true,
          minutesEarned: usageResult.bonusResult.bonusMinutesAwarded,
          totalBonusMinutes: usageResult.bonusResult.totalBonusMinutes,
          message: usageResult.bonusResult.message,
        };
      }

      res.status(200).json(responsePayload);

    } catch (error: any) {
      console.error('❌ Text-to-speech error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🆕 BONUS MINUTES STATUS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get bonus minutes status for current user
   * 
   * GET /api/voice/bonus
   */
  async getBonusStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

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
        bonus: {
          minutesEarned: stats.bonus.bonusMinutesEarned,
          minutesUsed: stats.bonus.bonusMinutesUsed,
          minutesAvailable: stats.bonus.bonusMinutesAvailable,
          totalEffectiveMinutes: stats.bonus.totalEffectiveMinutes,
        },
        message: stats.bonus.bonusMinutesAvailable > 0
          ? `🎁 You have ${stats.bonus.bonusMinutesAvailable} bonus minute${stats.bonus.bonusMinutesAvailable > 1 ? 's' : ''} available!`
          : null,
      });

    } 
    catch (error: any) {
      console.error('❌ Bonus status error:', error);
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
    return this.processVoice(req, res);
  }

  /**
   * Legacy: Synthesize speech (redirects to textToSpeech)
   * POST /api/voice/synthesize
   */
  async synthesizeSpeech(req: Request, res: Response): Promise<void> {
    return this.textToSpeech(req, res);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE STATISTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get voice usage statistics for current user
   * 🆕 Now includes bonus system stats!
   * 
   * GET /api/voice/stats
   */
  async getVoiceStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

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
          // Basic usage
          usage: {
            minutesUsed: stats.minutesUsedThisMonth,
            minutesRemaining: stats.remaining.minutes,
            requestsThisMonth: stats.requestsThisMonth,
            lastUsedAt: stats.lastUsedAt,
          },
          
          // Plan info
          plan: {
            type: stats.planType,
            hasAccess: stats.hasAccess,
            limits: stats.limits,
          },
          
          // 🆕 Bonus system
          bonus: {
            minutesEarned: stats.bonus.bonusMinutesEarned,
            minutesUsed: stats.bonus.bonusMinutesUsed,
            minutesAvailable: stats.bonus.bonusMinutesAvailable,
            savingsAccumulated: stats.bonus.savingsAccumulated,
            savingsToNextBonus: stats.bonus.savingsToNextBonus,
            totalEffectiveMinutes: stats.bonus.totalEffectiveMinutes,
          },
          
          // Cost tracking
          cost: {
            budgetedPerMinute: stats.cost.perMinuteBudgeted,
            actualAveragePerMinute: stats.cost.perMinuteActualAvg,
            totalSpentThisMonth: stats.cost.usedThisMonth,
            totalSavedThisMonth: stats.cost.savedThisMonth,
            maxBudgetThisMonth: stats.cost.maxThisMonth,
          },
          
          // Billing cycle
          billingCycle: stats.billingCycle,
          
          // Meta
          technology: 'onair',
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
   * 🆕 Now includes bonus info!
   * 
   * GET /api/voice/limits
   */
  async getVoiceLimits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

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
        ...limits,
        status: planStatus,
        technology: 'onair',
        features: {
          realTimeStreaming: true,
          voiceActivityDetection: true,
          naturalConversation: true,
          multiLanguage: true,
          dynamicBonusMinutes: true, // 🆕
          availableVoices: geminiLiveService.getAvailableVoices(),
        },
        // Bonus system enabled (internal feature)
        bonusSystem: {
          enabled: true,
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
          indian: 'Kore',       // Warm, empathetic - good for Indian users
          professional: 'Charon', // Deep, authoritative
          friendly: 'Puck',     // Friendly, conversational
          calm: 'Aoede',        // Calm, soothing
          energetic: 'Fenrir',  // Energetic, dynamic
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
  // 🆕 PRICING INFO (For transparency)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get voice pricing information (for transparency)
   * 
   * GET /api/voice/pricing
   */
  async getPricingInfo(req: Request, res: Response): Promise<void> {
    try {
      const pricingConstants = voiceUsageService.getPricingConstants();

      res.status(200).json({
        success: true,
        pricing: {
          budgetedCostPerMinute: `₹${pricingConstants.budgetedCostPerMinute}`,
          actualCostRange: '₹1.06 - ₹1.42 per minute (depends on conversation ratio)',
          bonusThreshold: `₹${pricingConstants.bonusMinuteThreshold} savings = 1 bonus minute`,
        },
        breakdown: {
          audioInputCostPerSecond: `₹${pricingConstants.audioInputCostPerSecond.toFixed(4)}`,
          audioOutputCostPerSecond: `₹${pricingConstants.audioOutputCostPerSecond.toFixed(4)}`,
          tokensPerSecond: pricingConstants.tokensPerSecond,
        },
        examples: [
          {
            scenario: 'Balanced conversation (50:50)',
            costPerMinute: '₹0.95',
            savingsPerMinute: '₹0.47',
          },
          {
            scenario: 'You listen more (30:70)',
            costPerMinute: '₹1.17',
            savingsPerMinute: '₹0.25',
          },
          {
            scenario: 'AI explains a lot (10:90)',
            costPerMinute: '₹1.40',
            savingsPerMinute: '₹0.02',
          },
        ],
      });

    } catch (error: any) {
      console.error('❌ Pricing info error:', error);
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
 * Gender-aware for natural Hindi conversation
 */
private buildSystemInstruction(userName: string, voiceGender: 'male' | 'female' = 'female'): string {
  const isFemale = voiceGender === 'female';
  
  const genderVerbs = isFemale 
    ? `Use feminine Hindi verbs: "karti hoon", "batati hoon", "samjhti hoon", "deti hoon", "sunti hoon"`
    : `Use masculine Hindi verbs: "karta hoon", "batata hoon", "samjhta hoon", "deta hoon", "sunta hoon"`;

  const helpExample = isFemale ? "main help karti hoon" : "main help karta hoon";
  const personalityType = isFemale ? "warm, caring female" : "confident, friendly male";

  return `You are Soriva - a ${personalityType} AI assistant from India.

SPEAK TO: ${userName}

VOICE RULES:
- ${genderVerbs}
- Mix English + Hindi naturally: "Bilkul ${userName}, ${helpExample}" / "Zaroor, bataiye"
- 2-3 sentences max. Short. Punchy. Human.
- Match user's vibe - excited? Be excited. Calm? Be calm.
- Say "${userName}" sometimes, not always.

PERSONALITY:
- Confident but humble
- Genuinely helpful, not robotic
- Witty when appropriate
- Proud Indian AI by Risenex Global

NEVER:
- Long explanations in voice
- Robotic phrases like "I am an AI language model"
- Wrong gender verbs

Creator: Risenex Global, Punjab | soriva.ai`.trim();
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