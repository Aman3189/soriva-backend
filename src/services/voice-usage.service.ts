/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE USAGE SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Track and manage voice usage (STT/TTS) with plan-based limits
 * 
 * Features:
 * - Voice minutes tracking (total, STT, TTS)
 * - Plan-based limit enforcement
 * - Usage recording after each interaction
 * - Monthly pool management (45 minutes/month)
 * - Per-request limits (STT: 15s, TTS: 30s)
 * 
 * Monthly Pool (All Plans): 45 minutes
 * - STT (User speaks): 9 minutes (20%)
 * - TTS (AI responds): 36 minutes (80%)
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '..//..//src/config/database.config';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface VoiceUsageRecord {
  sttSeconds: number;
  ttsSeconds: number;
  totalMinutes: number;
}

interface VoiceLimitCheck {
  allowed: boolean;
  reason?: string;
  remaining?: {
    totalMinutes: number;
    sttMinutes: number;
    ttsMinutes: number;
  };
}

interface VoiceUsageStats {
  totalMinutesUsed: number;
  sttSecondsUsed: number;
  ttsSecondsUsed: number;
  requestCount: number;
  lastUsedAt?: Date;
  limits: {
    monthlyMinutes: number;
    sttMinutes: number;
    ttsMinutes: number;
  };
  remaining: {
    totalMinutes: number;
    sttMinutes: number;
    ttsMinutes: number;
  };
  percentageUsed: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOICE USAGE SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class VoiceUsageService {
  private static instance: VoiceUsageService;

  // Voice limits (constant across all plans)
  private readonly MONTHLY_VOICE_MINUTES = 45;
  private readonly STT_MINUTES = 9; // 20% of total
  private readonly TTS_MINUTES = 36; // 80% of total
  private readonly MAX_STT_SECONDS_PER_REQUEST = 15;
  private readonly MAX_TTS_SECONDS_PER_REQUEST = 30;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): VoiceUsageService {
    if (!VoiceUsageService.instance) {
      VoiceUsageService.instance = new VoiceUsageService();
    }
    return VoiceUsageService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VOICE LIMIT CHECKS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if user can use STT (Speech-to-Text)
   */
  async canUseStt(
    userId: string,
    requestedSeconds: number
  ): Promise<VoiceLimitCheck> {
    try {
      const usage = await this.getVoiceUsage(userId);

      if (!usage) {
        return {
          allowed: false,
          reason: 'Usage record not found'
        };
      }

      // Check per-request limit
      if (requestedSeconds > this.MAX_STT_SECONDS_PER_REQUEST) {
        return {
          allowed: false,
          reason: `STT request too long. Max ${this.MAX_STT_SECONDS_PER_REQUEST} seconds allowed.`
        };
      }

      // Calculate remaining STT minutes
      const sttUsedMinutes = usage.voiceSttSecondsUsed / 60;
      const sttRemainingMinutes = this.STT_MINUTES - sttUsedMinutes;
      const requestedMinutes = requestedSeconds / 60;

      if (requestedMinutes > sttRemainingMinutes) {
        return {
          allowed: false,
          reason: `Insufficient STT minutes. Remaining: ${sttRemainingMinutes.toFixed(2)} min`,
          remaining: {
            totalMinutes: this.MONTHLY_VOICE_MINUTES - usage.voiceMinutesUsed,
            sttMinutes: sttRemainingMinutes,
            ttsMinutes: this.TTS_MINUTES - (usage.voiceTtsSecondsUsed / 60)
          }
        };
      }

      return {
        allowed: true,
        remaining: {
          totalMinutes: this.MONTHLY_VOICE_MINUTES - usage.voiceMinutesUsed,
          sttMinutes: sttRemainingMinutes,
          ttsMinutes: this.TTS_MINUTES - (usage.voiceTtsSecondsUsed / 60)
        }
      };

    } catch (error) {
      console.error('❌ Error checking STT limits:', error);
      return {
        allowed: false,
        reason: 'Error checking voice limits'
      };
    }
  }

  /**
   * Check if user can use TTS (Text-to-Speech)
   */
  async canUseTts(
    userId: string,
    estimatedSeconds: number
  ): Promise<VoiceLimitCheck> {
    try {
      const usage = await this.getVoiceUsage(userId);

      if (!usage) {
        return {
          allowed: false,
          reason: 'Usage record not found'
        };
      }

      // Check per-request limit
      if (estimatedSeconds > this.MAX_TTS_SECONDS_PER_REQUEST) {
        return {
          allowed: false,
          reason: `TTS response too long. Max ${this.MAX_TTS_SECONDS_PER_REQUEST} seconds allowed.`
        };
      }

      // Calculate remaining TTS minutes
      const ttsUsedMinutes = usage.voiceTtsSecondsUsed / 60;
      const ttsRemainingMinutes = this.TTS_MINUTES - ttsUsedMinutes;
      const estimatedMinutes = estimatedSeconds / 60;

      if (estimatedMinutes > ttsRemainingMinutes) {
        return {
          allowed: false,
          reason: `Insufficient TTS minutes. Remaining: ${ttsRemainingMinutes.toFixed(2)} min`,
          remaining: {
            totalMinutes: this.MONTHLY_VOICE_MINUTES - usage.voiceMinutesUsed,
            sttMinutes: this.STT_MINUTES - (usage.voiceSttSecondsUsed / 60),
            ttsMinutes: ttsRemainingMinutes
          }
        };
      }

      return {
        allowed: true,
        remaining: {
          totalMinutes: this.MONTHLY_VOICE_MINUTES - usage.voiceMinutesUsed,
          sttMinutes: this.STT_MINUTES - (usage.voiceSttSecondsUsed / 60),
          ttsMinutes: ttsRemainingMinutes
        }
      };

    } catch (error) {
      console.error('❌ Error checking TTS limits:', error);
      return {
        allowed: false,
        reason: 'Error checking voice limits'
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE RECORDING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Record voice usage after STT/TTS interaction
   */
  async recordVoiceUsage(
    userId: string,
    usage: VoiceUsageRecord
  ): Promise<boolean> {
    try {
      const { sttSeconds, ttsSeconds, totalMinutes } = usage;

      await prisma.usage.update({
        where: { userId },
        data: {
          voiceMinutesUsed: {
            increment: totalMinutes
          },
          voiceSttSecondsUsed: {
            increment: sttSeconds
          },
          voiceTtsSecondsUsed: {
            increment: ttsSeconds
          },
          voiceRequestCount: {
            increment: 1
          },
          lastVoiceUsedAt: new Date()
        }
      });

      console.log(`✅ Voice usage recorded for user ${userId}: STT ${sttSeconds}s, TTS ${ttsSeconds}s`);
      return true;

    } catch (error) {
      console.error('❌ Error recording voice usage:', error);
      return false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE RETRIEVAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get voice usage record from database
   */
  private async getVoiceUsage(userId: string) {
    return await prisma.usage.findUnique({
      where: { userId },
      select: {
        voiceMinutesUsed: true,
        voiceSttSecondsUsed: true,
        voiceTtsSecondsUsed: true,
        voiceRequestCount: true,
        lastVoiceUsedAt: true
      }
    });
  }

  /**
   * Get comprehensive voice usage statistics
   */
  async getVoiceStats(userId: string): Promise<VoiceUsageStats | null> {
    try {
      const usage = await this.getVoiceUsage(userId);

      if (!usage) {
        return null;
      }

      const sttMinutesUsed = usage.voiceSttSecondsUsed / 60;
      const ttsMinutesUsed = usage.voiceTtsSecondsUsed / 60;

      const remaining = {
        totalMinutes: this.MONTHLY_VOICE_MINUTES - usage.voiceMinutesUsed,
        sttMinutes: this.STT_MINUTES - sttMinutesUsed,
        ttsMinutes: this.TTS_MINUTES - ttsMinutesUsed
      };

      const percentageUsed = (usage.voiceMinutesUsed / this.MONTHLY_VOICE_MINUTES) * 100;

      return {
        totalMinutesUsed: usage.voiceMinutesUsed,
        sttSecondsUsed: usage.voiceSttSecondsUsed,
        ttsSecondsUsed: usage.voiceTtsSecondsUsed,
        requestCount: usage.voiceRequestCount,
        lastUsedAt: usage.lastVoiceUsedAt || undefined,
        limits: {
          monthlyMinutes: this.MONTHLY_VOICE_MINUTES,
          sttMinutes: this.STT_MINUTES,
          ttsMinutes: this.TTS_MINUTES
        },
        remaining,
        percentageUsed: parseFloat(percentageUsed.toFixed(2))
      };

    } catch (error) {
      console.error('❌ Error getting voice stats:', error);
      return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate total minutes from STT + TTS seconds
   */
  public calculateTotalMinutes(sttSeconds: number, ttsSeconds: number): number {
    return parseFloat(((sttSeconds + ttsSeconds) / 60).toFixed(4));
  }

  /**
   * Get voice limits configuration
   */
  public getVoiceLimits() {
    return {
      monthlyMinutes: this.MONTHLY_VOICE_MINUTES,
      sttMinutes: this.STT_MINUTES,
      ttsMinutes: this.TTS_MINUTES,
      maxSttSecondsPerRequest: this.MAX_STT_SECONDS_PER_REQUEST,
      maxTtsSecondsPerRequest: this.MAX_TTS_SECONDS_PER_REQUEST
    };
  }

  /**
   * Check if user has any voice minutes remaining
   */
  async hasVoiceMinutesRemaining(userId: string): Promise<boolean> {
    try {
      const usage = await this.getVoiceUsage(userId);
      
      if (!usage) {
        return false;
      }

      return usage.voiceMinutesUsed < this.MONTHLY_VOICE_MINUTES;

    } catch (error) {
      console.error('❌ Error checking voice minutes:', error);
      return false;
    }
  }

  /**
   * Reset voice usage (for testing or monthly reset)
   */
  async resetVoiceUsage(userId: string): Promise<boolean> {
    try {
      await prisma.usage.update({
        where: { userId },
        data: {
          voiceMinutesUsed: 0,
          voiceSttSecondsUsed: 0,
          voiceTtsSecondsUsed: 0,
          voiceRequestCount: 0,
          lastVoiceUsedAt: null
        }
      });

      console.log(`✅ Voice usage reset for user ${userId}`);
      return true;

    } catch (error) {
      console.error('❌ Error resetting voice usage:', error);
      return false;
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default VoiceUsageService;
export type { VoiceUsageRecord, VoiceLimitCheck, VoiceUsageStats };