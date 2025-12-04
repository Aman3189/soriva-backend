/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE USAGE SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Track and manage voice usage (STT/TTS) with plan-based limits
 * Updated: December 4, 2025 - Plan-based limits integration
 * 
 * Features:
 * - ⭐ NEW: Plan-based limits (STARTER/PLUS/PRO/APEX)
 * - ⭐ NEW: Daily minutes limit per plan
 * - ⭐ NEW: Max audio length per plan
 * - ⭐ NEW: Requests per hour limit
 * - Voice minutes tracking (total, STT, TTS)
 * - Usage recording after each interaction
 * 
 * Plan Limits:
 * - STARTER: ❌ No voice access
 * - PLUS: 10 min/day, 60s max audio, 20 req/hour
 * - PRO: 15 min/day, 120s max audio, 30 req/hour
 * - APEX: 20 min/day, 180s max audio, 40 req/hour
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '..//..//src/config/database.config';
import { PlanType } from '@prisma/client';

// ⭐ NEW: Import plan-based limits
import { VOICE_HARD_LIMITS } from '@/constants/abuse-limits';

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
    requestsThisHour?: number;
  };
}

interface VoiceUsageStats {
  totalMinutesUsed: number;
  sttSecondsUsed: number;
  ttsSecondsUsed: number;
  requestCount: number;
  requestsThisHour: number;
  lastUsedAt?: Date;
  planType: PlanType;
  hasAccess: boolean;
  limits: {
    dailyMinutes: number;
    maxAudioLengthSeconds: number;
    requestsPerHour: number;
    sttMinutes: number;
    ttsMinutes: number;
  };
  remaining: {
    dailyMinutes: number;
    sttMinutes: number;
    ttsMinutes: number;
    requestsThisHour: number;
  };
  percentageUsed: number;
}

// ⭐ NEW: Plan limits type
interface PlanVoiceLimits {
  minutesPerDay: number;
  maxAudioLengthSeconds: number;
  requestsPerHour: number;
  sttMinutes: number;  // 20% of daily
  ttsMinutes: number;  // 80% of daily
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOICE USAGE SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class VoiceUsageService {
  private static instance: VoiceUsageService;

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
  // ⭐ NEW: PLAN-BASED LIMITS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's plan type
   */
  private async getUserPlanType(userId: string): Promise<PlanType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });
    return user?.planType || PlanType.STARTER;
  }

  /**
   * Check if plan has voice access
   */
  private hasPlanAccess(planType: PlanType): boolean {
    return planType !== PlanType.STARTER;
  }

  /**
   * Get plan-based voice limits
   */
  private getPlanLimits(planType: PlanType): PlanVoiceLimits {
    const limits = VOICE_HARD_LIMITS[planType as keyof typeof VOICE_HARD_LIMITS];

    if (!limits) {
      // STARTER - no access
      return {
        minutesPerDay: 0,
        maxAudioLengthSeconds: 0,
        requestsPerHour: 0,
        sttMinutes: 0,
        ttsMinutes: 0,
      };
    }

    const dailyMinutes = limits.minutesPerDay;
    return {
      minutesPerDay: dailyMinutes,
      maxAudioLengthSeconds: limits.maxAudioLengthSeconds,
      requestsPerHour: limits.requestsPerHour,
      sttMinutes: Math.round(dailyMinutes * 0.2),  // 20% for STT
      ttsMinutes: Math.round(dailyMinutes * 0.8),  // 80% for TTS
    };
  }

  /**
   * Get requests made this hour
   */
  private async getRequestsThisHour(userId: string): Promise<number> {
    const hourStart = new Date();
    hourStart.setMinutes(0, 0, 0);

    // Count voice requests in the last hour from usage tracking
    // Since we don't have separate voice request log, we'll use voiceRequestCount
    // and track hourly resets
    const usage = await prisma.usage.findUnique({
      where: { userId },
      select: { 
        voiceRequestCount: true,
        lastVoiceUsedAt: true,
      },
    });

    if (!usage || !usage.lastVoiceUsedAt) {
      return 0;
    }

    // If last usage was before this hour, count is 0 for this hour
    if (usage.lastVoiceUsedAt < hourStart) {
      return 0;
    }

    // For now, return a simple count (in production, track hourly separately)
    return usage.voiceRequestCount % 100; // Approximation
  }

  /**
   * Get minutes used today
   */
  private async getMinutesUsedToday(userId: string): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const usage = await prisma.usage.findUnique({
      where: { userId },
      select: {
        voiceMinutesUsed: true,
        lastVoiceUsedAt: true,
      },
    });

    if (!usage) {
      return 0;
    }

    // If last usage was before today, return 0 (needs daily reset)
    if (usage.lastVoiceUsedAt && usage.lastVoiceUsedAt < todayStart) {
      return 0;
    }

    return usage.voiceMinutesUsed;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⭐ ENHANCED: VOICE LIMIT CHECKS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if user can use STT (Speech-to-Text)
   */
  async canUseStt(
    userId: string,
    requestedSeconds: number
  ): Promise<VoiceLimitCheck> {
    try {
      // ⭐ Check plan access
      const planType = await this.getUserPlanType(userId);
      
      if (!this.hasPlanAccess(planType)) {
        return {
          allowed: false,
          reason: 'Voice features are not available on Starter plan. Please upgrade to Plus or higher.'
        };
      }

      const planLimits = this.getPlanLimits(planType);
      const usage = await this.getVoiceUsage(userId);

      if (!usage) {
        return {
          allowed: false,
          reason: 'Usage record not found'
        };
      }

      // ⭐ Check per-request limit (plan-based max audio length)
      if (requestedSeconds > planLimits.maxAudioLengthSeconds) {
        return {
          allowed: false,
          reason: `Audio too long. ${planType} plan allows max ${planLimits.maxAudioLengthSeconds} seconds.`
        };
      }

      // ⭐ Check hourly request limit
      const requestsThisHour = await this.getRequestsThisHour(userId);
      if (requestsThisHour >= planLimits.requestsPerHour) {
        return {
          allowed: false,
          reason: `Hourly request limit (${planLimits.requestsPerHour}/hour) reached. Try again later.`
        };
      }

      // ⭐ Check daily minutes limit
      const minutesToday = await this.getMinutesUsedToday(userId);
      const requestedMinutes = requestedSeconds / 60;

      if (minutesToday + requestedMinutes > planLimits.minutesPerDay) {
        return {
          allowed: false,
          reason: `Daily voice limit (${planLimits.minutesPerDay} min) reached. Resets at midnight.`,
          remaining: {
            totalMinutes: Math.max(0, planLimits.minutesPerDay - minutesToday),
            sttMinutes: Math.max(0, planLimits.sttMinutes - (usage.voiceSttSecondsUsed / 60)),
            ttsMinutes: Math.max(0, planLimits.ttsMinutes - (usage.voiceTtsSecondsUsed / 60)),
            requestsThisHour: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
          }
        };
      }

      // Calculate remaining STT minutes
      const sttUsedMinutes = usage.voiceSttSecondsUsed / 60;
      const sttRemainingMinutes = planLimits.sttMinutes - sttUsedMinutes;

      if (requestedMinutes > sttRemainingMinutes) {
        return {
          allowed: false,
          reason: `Insufficient STT minutes. Remaining: ${sttRemainingMinutes.toFixed(2)} min`,
          remaining: {
            totalMinutes: Math.max(0, planLimits.minutesPerDay - minutesToday),
            sttMinutes: sttRemainingMinutes,
            ttsMinutes: planLimits.ttsMinutes - (usage.voiceTtsSecondsUsed / 60),
            requestsThisHour: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
          }
        };
      }

      return {
        allowed: true,
        remaining: {
          totalMinutes: Math.max(0, planLimits.minutesPerDay - minutesToday),
          sttMinutes: sttRemainingMinutes,
          ttsMinutes: planLimits.ttsMinutes - (usage.voiceTtsSecondsUsed / 60),
          requestsThisHour: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
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
      // ⭐ Check plan access
      const planType = await this.getUserPlanType(userId);
      
      if (!this.hasPlanAccess(planType)) {
        return {
          allowed: false,
          reason: 'Voice features are not available on Starter plan. Please upgrade to Plus or higher.'
        };
      }

      const planLimits = this.getPlanLimits(planType);
      const usage = await this.getVoiceUsage(userId);

      if (!usage) {
        return {
          allowed: false,
          reason: 'Usage record not found'
        };
      }

      // ⭐ Check per-request limit (plan-based max audio length)
      if (estimatedSeconds > planLimits.maxAudioLengthSeconds) {
        return {
          allowed: false,
          reason: `Response too long. ${planType} plan allows max ${planLimits.maxAudioLengthSeconds} seconds.`
        };
      }

      // ⭐ Check hourly request limit
      const requestsThisHour = await this.getRequestsThisHour(userId);
      if (requestsThisHour >= planLimits.requestsPerHour) {
        return {
          allowed: false,
          reason: `Hourly request limit (${planLimits.requestsPerHour}/hour) reached. Try again later.`
        };
      }

      // ⭐ Check daily minutes limit
      const minutesToday = await this.getMinutesUsedToday(userId);
      const estimatedMinutes = estimatedSeconds / 60;

      if (minutesToday + estimatedMinutes > planLimits.minutesPerDay) {
        return {
          allowed: false,
          reason: `Daily voice limit (${planLimits.minutesPerDay} min) reached. Resets at midnight.`,
          remaining: {
            totalMinutes: Math.max(0, planLimits.minutesPerDay - minutesToday),
            sttMinutes: Math.max(0, planLimits.sttMinutes - (usage.voiceSttSecondsUsed / 60)),
            ttsMinutes: Math.max(0, planLimits.ttsMinutes - (usage.voiceTtsSecondsUsed / 60)),
            requestsThisHour: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
          }
        };
      }

      // Calculate remaining TTS minutes
      const ttsUsedMinutes = usage.voiceTtsSecondsUsed / 60;
      const ttsRemainingMinutes = planLimits.ttsMinutes - ttsUsedMinutes;

      if (estimatedMinutes > ttsRemainingMinutes) {
        return {
          allowed: false,
          reason: `Insufficient TTS minutes. Remaining: ${ttsRemainingMinutes.toFixed(2)} min`,
          remaining: {
            totalMinutes: Math.max(0, planLimits.minutesPerDay - minutesToday),
            sttMinutes: planLimits.sttMinutes - (usage.voiceSttSecondsUsed / 60),
            ttsMinutes: ttsRemainingMinutes,
            requestsThisHour: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
          }
        };
      }

      return {
        allowed: true,
        remaining: {
          totalMinutes: Math.max(0, planLimits.minutesPerDay - minutesToday),
          sttMinutes: planLimits.sttMinutes - (usage.voiceSttSecondsUsed / 60),
          ttsMinutes: ttsRemainingMinutes,
          requestsThisHour: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
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
   * Get comprehensive voice usage statistics (with plan-based limits)
   */
  async getVoiceStats(userId: string): Promise<VoiceUsageStats | null> {
    try {
      // ⭐ Get plan info
      const planType = await this.getUserPlanType(userId);
      const hasAccess = this.hasPlanAccess(planType);
      const planLimits = this.getPlanLimits(planType);

      const usage = await this.getVoiceUsage(userId);

      if (!usage) {
        return null;
      }

      const sttMinutesUsed = usage.voiceSttSecondsUsed / 60;
      const ttsMinutesUsed = usage.voiceTtsSecondsUsed / 60;
      const requestsThisHour = await this.getRequestsThisHour(userId);
      const minutesToday = await this.getMinutesUsedToday(userId);

      const remaining = {
        dailyMinutes: Math.max(0, planLimits.minutesPerDay - minutesToday),
        sttMinutes: Math.max(0, planLimits.sttMinutes - sttMinutesUsed),
        ttsMinutes: Math.max(0, planLimits.ttsMinutes - ttsMinutesUsed),
        requestsThisHour: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
      };

      const percentageUsed = planLimits.minutesPerDay > 0
        ? (minutesToday / planLimits.minutesPerDay) * 100
        : 0;

      return {
        totalMinutesUsed: usage.voiceMinutesUsed,
        sttSecondsUsed: usage.voiceSttSecondsUsed,
        ttsSecondsUsed: usage.voiceTtsSecondsUsed,
        requestCount: usage.voiceRequestCount,
        requestsThisHour,
        lastUsedAt: usage.lastVoiceUsedAt || undefined,
        planType,
        hasAccess,
        limits: {
          dailyMinutes: planLimits.minutesPerDay,
          maxAudioLengthSeconds: planLimits.maxAudioLengthSeconds,
          requestsPerHour: planLimits.requestsPerHour,
          sttMinutes: planLimits.sttMinutes,
          ttsMinutes: planLimits.ttsMinutes,
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
  // ⭐ NEW: PLAN LIMITS STATUS (for UI)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get plan-based voice limits status (for UI)
   */
  async getPlanLimitsStatus(userId: string) {
    const planType = await this.getUserPlanType(userId);
    const hasAccess = this.hasPlanAccess(planType);

    if (!hasAccess) {
      return {
        success: false,
        hasAccess: false,
        planType,
        message: 'Voice features are not available on Starter plan. Please upgrade to Plus or higher.',
      };
    }

    const planLimits = this.getPlanLimits(planType);
    const minutesToday = await this.getMinutesUsedToday(userId);
    const requestsThisHour = await this.getRequestsThisHour(userId);

    return {
      success: true,
      hasAccess: true,
      planType,
      limits: {
        minutesPerDay: {
          used: minutesToday,
          limit: planLimits.minutesPerDay,
          remaining: Math.max(0, planLimits.minutesPerDay - minutesToday),
        },
        maxAudioLengthSeconds: planLimits.maxAudioLengthSeconds,
        requestsPerHour: {
          used: requestsThisHour,
          limit: planLimits.requestsPerHour,
          remaining: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
        },
      },
      resetsAt: {
        daily: this.getNextDailyReset(),
        hourly: this.getNextHourlyReset(),
      },
    };
  }

  private getNextDailyReset(): Date {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private getNextHourlyReset(): Date {
    const next = new Date();
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
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
   * Get voice limits configuration for a plan
   */
  public async getVoiceLimits(userId: string) {
    const planType = await this.getUserPlanType(userId);
    const planLimits = this.getPlanLimits(planType);

    return {
      planType,
      hasAccess: this.hasPlanAccess(planType),
      dailyMinutes: planLimits.minutesPerDay,
      sttMinutes: planLimits.sttMinutes,
      ttsMinutes: planLimits.ttsMinutes,
      maxAudioLengthSeconds: planLimits.maxAudioLengthSeconds,
      requestsPerHour: planLimits.requestsPerHour,
    };
  }

  /**
   * Check if user has any voice minutes remaining
   */
  async hasVoiceMinutesRemaining(userId: string): Promise<boolean> {
    try {
      const planType = await this.getUserPlanType(userId);
      
      if (!this.hasPlanAccess(planType)) {
        return false;
      }

      const planLimits = this.getPlanLimits(planType);
      const minutesToday = await this.getMinutesUsedToday(userId);

      return minutesToday < planLimits.minutesPerDay;

    } catch (error) {
      console.error('❌ Error checking voice minutes:', error);
      return false;
    }
  }

  /**
   * Reset voice usage (for testing or daily reset)
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