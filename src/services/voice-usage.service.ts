/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE USAGE SERVICE - SORIVA ONAIR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Track and manage voice usage with MONTHLY plan-based limits
 * Updated: December 2025 - Refined for monthly billing cycle
 * 
 * Features:
 * - Monthly voice minutes allocation per plan
 * - Real-time usage tracking
 * - Hourly request rate limiting (abuse prevention)
 * - Max audio length per request (plan-based)
 * - Automatic monthly reset on billing cycle
 * 
 * Plan Limits (Monthly):
 * ┌──────────┬─────────────┬──────────────┬─────────────┐
 * │ Plan     │ Minutes/Mo  │ Max Audio    │ Req/Hour    │
 * ├──────────┼─────────────┼──────────────┼─────────────┤
 * │ STARTER  │ ❌ 0        │ ❌ 0s        │ ❌ 0        │
 * │ PLUS     │ 30 min      │ 60s          │ 30/hr       │
 * │ PRO      │ 45 min      │ 120s         │ 45/hr       │
 * │ APEX     │ 60 min      │ 180s         │ 60/hr       │
 * └──────────┴─────────────┴──────────────┴─────────────┘
 * 
 * Cost: ₹1.42/minute (Gemini Live API)
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '../config/database.config';
import { PlanType } from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Voice limits per plan (MONTHLY)
 * Aligned with Soriva pricing: PLUS ₹299, PRO ₹799, APEX ₹1299
 */
const VOICE_PLAN_LIMITS = {
  [PlanType.STARTER]: {
    minutesPerMonth: 0,
    maxAudioLengthSeconds: 0,
    requestsPerHour: 0,
    hasAccess: false,
  },
  [PlanType.PLUS]: {
    minutesPerMonth: 30,        // 30 min/month @ ₹1.42 = ₹42.6 cost
    maxAudioLengthSeconds: 60,  // 1 min max per request
    requestsPerHour: 30,        // Rate limit
    hasAccess: true,
  },
  [PlanType.PRO]: {
    minutesPerMonth: 45,        // 45 min/month @ ₹1.42 = ₹63.9 cost
    maxAudioLengthSeconds: 120, // 2 min max per request
    requestsPerHour: 45,        // Rate limit
    hasAccess: true,
  },
  [PlanType.APEX]: {
    minutesPerMonth: 60,        // 60 min/month @ ₹1.42 = ₹85.2 cost
    maxAudioLengthSeconds: 180, // 3 min max per request
    requestsPerHour: 60,        // Rate limit
    hasAccess: true,
  },
  [PlanType.SOVEREIGN]: {
  minutesPerMonth: 999999,
  maxAudioLengthSeconds: 600,
  requestsPerHour: 9999,
  hasAccess: true,
},
} as const;

// Cost per minute in INR (Gemini Live API)
const COST_PER_MINUTE_INR = 1.42;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface VoiceUsageRecord {
  inputSeconds: number;   // User's audio input duration
  outputSeconds: number;  // Soriva's audio response duration
  totalMinutes: number;   // Combined minutes for billing
}

interface VoiceLimitCheck {
  allowed: boolean;
  reason?: string;
  remaining?: {
    minutes: number;
    seconds: number;
    percentage: number;
    requestsThisHour: number;
  };
  upgradeRequired?: boolean;
  limitType?: 'plan_access' | 'monthly_limit' | 'hourly_rate' | 'audio_length';
}

interface VoiceUsageStats {
  // Current usage
  minutesUsedThisMonth: number;
  secondsUsedThisMonth: number;
  requestsThisMonth: number;
  requestsThisHour: number;
  lastUsedAt?: Date;
  
  // Plan info
  planType: PlanType;
  hasAccess: boolean;
  
  // Limits
  limits: {
    minutesPerMonth: number;
    maxAudioLengthSeconds: number;
    requestsPerHour: number;
  };
  
  // Remaining
  remaining: {
    minutes: number;
    seconds: number;
    percentage: number;
    requestsThisHour: number;
  };
  
  // Billing cycle
  billingCycle: {
    startDate: Date;
    endDate: Date;
    daysRemaining: number;
    resetsAt: Date;
  };
  
  // Cost info
  cost: {
    perMinute: number;
    usedThisMonth: number;
    maxThisMonth: number;
  };
}

interface VoiceLimitsResponse {
  planType: PlanType;
  hasAccess: boolean;
  limits: {
    minutesPerMonth: number;
    maxAudioLengthSeconds: number;
    requestsPerHour: number;
  };
  usage: {
    minutesUsed: number;
    minutesRemaining: number;
    percentageUsed: number;
  };
  billingCycle: {
    startDate: Date;
    endDate: Date;
    resetsAt: Date;
  };
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
  // PLAN & ACCESS HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's current plan type
   */
  private async getUserPlanType(userId: string): Promise<PlanType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });
    return user?.planType || PlanType.STARTER;
  }

  /**
   * Get plan limits configuration
   */
  private getPlanLimits(planType: PlanType) {
    return VOICE_PLAN_LIMITS[planType] || VOICE_PLAN_LIMITS[PlanType.STARTER];
  }

  /**
   * Check if plan has voice access
   */
  private hasPlanAccess(planType: PlanType): boolean {
    return this.getPlanLimits(planType).hasAccess;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BILLING CYCLE HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's billing cycle dates
   * Based on subscription start date or account creation
   */
  private async getBillingCycle(userId: string): Promise<{
    startDate: Date;
    endDate: Date;
    daysRemaining: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        planStartDate: true,
        createdAt: true,
      },
    });

    // Use subscription start date or account creation date
    const cycleAnchor = user?.planStartDate || user?.createdAt || new Date();    
    // Calculate current billing cycle
    const now = new Date();
    const anchorDay = cycleAnchor.getDate();
    
    // Find current cycle start
    let cycleStart = new Date(now.getFullYear(), now.getMonth(), anchorDay);
    if (cycleStart > now) {
      cycleStart.setMonth(cycleStart.getMonth() - 1);
    }
    
    // Cycle end is one month after start
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);
    
    // Days remaining
    const msRemaining = cycleEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    return {
      startDate: cycleStart,
      endDate: cycleEnd,
      daysRemaining: Math.max(0, daysRemaining),
    };
  }

  /**
   * Check if usage record is from current billing cycle
   */
  private isCurrentBillingCycle(lastResetDate: Date | null, cycleStart: Date): boolean {
    if (!lastResetDate) return false;
    return lastResetDate >= cycleStart;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE TRACKING HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get minutes used in current billing cycle
   */
  private async getMinutesUsedThisMonth(userId: string): Promise<number> {
    const billingCycle = await this.getBillingCycle(userId);
    
    const usage = await prisma.usage.findUnique({
      where: { userId },
      select: {
        voiceMinutesUsed: true,
        voiceUsageResetAt: true,
      },
    });

    if (!usage) return 0;

    // Check if usage is from current billing cycle
    if (!this.isCurrentBillingCycle(usage.voiceUsageResetAt, billingCycle.startDate)) {
      // Usage is from previous cycle, needs reset
      await this.resetMonthlyUsage(userId);
      return 0;
    }

    return usage.voiceMinutesUsed || 0;
  }

  /**
   * Get requests made in the current hour (rate limiting)
   */
  private async getRequestsThisHour(userId: string): Promise<number> {
    const hourStart = new Date();
    hourStart.setMinutes(0, 0, 0);

    const usage = await prisma.usage.findUnique({
      where: { userId },
      select: {
        voiceRequestsThisHour: true,
        voiceHourlyResetAt: true,
      },
    });

    if (!usage) return 0;

    // Check if we need to reset hourly counter
    if (!usage.voiceHourlyResetAt || usage.voiceHourlyResetAt < hourStart) {
      // Reset hourly counter
      await prisma.usage.update({
        where: { userId },
        data: {
          voiceRequestsThisHour: 0,
          voiceHourlyResetAt: hourStart,
        },
      });
      return 0;
    }

    return usage.voiceRequestsThisHour || 0;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LIMIT CHECKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if user can use voice (comprehensive check)
   * Call this before processing any voice request
   */
  async canUseVoice(
    userId: string,
    requestedSeconds: number = 0
  ): Promise<VoiceLimitCheck> {
    try {
      // 1. Check plan access
      const planType = await this.getUserPlanType(userId);
      const planLimits = this.getPlanLimits(planType);

      if (!planLimits.hasAccess) {
        return {
          allowed: false,
          reason: 'OnAir voice features require Plus plan or higher. Upgrade to unlock voice conversations!',
          upgradeRequired: true,
          limitType: 'plan_access',
        };
      }

      // 2. Check audio length limit
      if (requestedSeconds > planLimits.maxAudioLengthSeconds) {
        return {
          allowed: false,
          reason: `Audio too long. Your ${planType} plan allows max ${planLimits.maxAudioLengthSeconds} seconds (${planLimits.maxAudioLengthSeconds / 60} min) per request.`,
          limitType: 'audio_length',
        };
      }

      // 3. Check hourly rate limit
      const requestsThisHour = await this.getRequestsThisHour(userId);
      if (requestsThisHour >= planLimits.requestsPerHour) {
        const nextReset = this.getNextHourlyReset();
        return {
          allowed: false,
          reason: `Hourly limit reached (${planLimits.requestsPerHour} requests/hour). Resets at ${nextReset.toLocaleTimeString()}.`,
          limitType: 'hourly_rate',
          remaining: {
            minutes: 0,
            seconds: 0,
            percentage: 0,
            requestsThisHour: 0,
          },
        };
      }

      // 4. Check monthly minutes limit
      const minutesUsed = await this.getMinutesUsedThisMonth(userId);
      const minutesRemaining = planLimits.minutesPerMonth - minutesUsed;
      const requestedMinutes = requestedSeconds / 60;

      if (minutesRemaining <= 0) {
        const billingCycle = await this.getBillingCycle(userId);
        return {
          allowed: false,
          reason: `Monthly voice minutes exhausted. Your ${planType} plan has ${planLimits.minutesPerMonth} min/month. Resets on ${billingCycle.endDate.toLocaleDateString()}.`,
          limitType: 'monthly_limit',
          remaining: {
            minutes: 0,
            seconds: 0,
            percentage: 0,
            requestsThisHour: planLimits.requestsPerHour - requestsThisHour,
          },
        };
      }

      // 5. Check if requested duration fits in remaining
      if (requestedMinutes > minutesRemaining) {
        return {
          allowed: false,
          reason: `Not enough minutes. Remaining: ${minutesRemaining.toFixed(1)} min. Requested: ~${requestedMinutes.toFixed(1)} min.`,
          limitType: 'monthly_limit',
          remaining: {
            minutes: minutesRemaining,
            seconds: minutesRemaining * 60,
            percentage: (minutesRemaining / planLimits.minutesPerMonth) * 100,
            requestsThisHour: planLimits.requestsPerHour - requestsThisHour,
          },
        };
      }

      // All checks passed
      return {
        allowed: true,
        remaining: {
          minutes: minutesRemaining,
          seconds: minutesRemaining * 60,
          percentage: (minutesRemaining / planLimits.minutesPerMonth) * 100,
          requestsThisHour: planLimits.requestsPerHour - requestsThisHour,
        },
      };

    } catch (error) {
      console.error('❌ Error checking voice limits:', error);
      return {
        allowed: false,
        reason: 'Error checking voice limits. Please try again.',
      };
    }
  }

  /**
   * Quick check if user has voice access (for UI)
   */
  async hasVoiceAccess(userId: string): Promise<boolean> {
    const planType = await this.getUserPlanType(userId);
    return this.hasPlanAccess(planType);
  }

  /**
   * Quick check if user has minutes remaining
   */
  async hasMinutesRemaining(userId: string): Promise<boolean> {
    const planType = await this.getUserPlanType(userId);
    if (!this.hasPlanAccess(planType)) return false;

    const planLimits = this.getPlanLimits(planType);
    const minutesUsed = await this.getMinutesUsedThisMonth(userId);
    
    return minutesUsed < planLimits.minutesPerMonth;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE RECORDING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Record voice usage after a successful interaction
   */
  async recordUsage(userId: string, usage: VoiceUsageRecord): Promise<boolean> {
    try {
      const { inputSeconds, outputSeconds, totalMinutes } = usage;
      const billingCycle = await this.getBillingCycle(userId);

      // Check if we need to reset (new billing cycle)
      const currentUsage = await prisma.usage.findUnique({
        where: { userId },
        select: { voiceUsageResetAt: true },
      });

      const needsReset = !this.isCurrentBillingCycle(
        currentUsage?.voiceUsageResetAt || null,
        billingCycle.startDate
      );

      if (needsReset) {
        // Reset and then add new usage
        await prisma.usage.update({
          where: { userId },
          data: {
            voiceMinutesUsed: totalMinutes,
            voiceSecondsInput: inputSeconds,
            voiceSecondsOutput: outputSeconds,
            voiceRequestCount: 1,
            voiceRequestsThisHour: 1,
            voiceHourlyResetAt: new Date(),
            voiceUsageResetAt: billingCycle.startDate,
            lastVoiceUsedAt: new Date(),
          },
        });
      } else {
        // Increment existing usage
        await prisma.usage.update({
          where: { userId },
          data: {
            voiceMinutesUsed: { increment: totalMinutes },
            voiceSecondsInput: { increment: inputSeconds },
            voiceSecondsOutput: { increment: outputSeconds },
            voiceRequestCount: { increment: 1 },
            voiceRequestsThisHour: { increment: 1 },
            lastVoiceUsedAt: new Date(),
          },
        });
      }

      console.log(`✅ Voice usage recorded: ${totalMinutes.toFixed(2)} min (in: ${inputSeconds}s, out: ${outputSeconds}s)`);
      return true;

    } catch (error) {
      console.error('❌ Error recording voice usage:', error);
      return false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATISTICS & LIMITS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get comprehensive voice usage statistics
   */
  async getVoiceStats(userId: string): Promise<VoiceUsageStats | null> {
    try {
      const planType = await this.getUserPlanType(userId);
      const planLimits = this.getPlanLimits(planType);
      const billingCycle = await this.getBillingCycle(userId);

      const usage = await prisma.usage.findUnique({
        where: { userId },
        select: {
          voiceMinutesUsed: true,
          voiceSecondsInput: true,
          voiceSecondsOutput: true,
          voiceRequestCount: true,
          voiceRequestsThisHour: true,
          lastVoiceUsedAt: true,
          voiceUsageResetAt: true,
        },
      });

      // Check if usage is from current cycle
      const isCurrentCycle = this.isCurrentBillingCycle(
        usage?.voiceUsageResetAt || null,
        billingCycle.startDate
      );

      const minutesUsed = isCurrentCycle ? (usage?.voiceMinutesUsed || 0) : 0;
      const requestsThisHour = await this.getRequestsThisHour(userId);
      const minutesRemaining = Math.max(0, planLimits.minutesPerMonth - minutesUsed);
      const percentageUsed = planLimits.minutesPerMonth > 0 
        ? (minutesUsed / planLimits.minutesPerMonth) * 100 
        : 0;

      return {
        minutesUsedThisMonth: minutesUsed,
        secondsUsedThisMonth: minutesUsed * 60,
        requestsThisMonth: isCurrentCycle ? (usage?.voiceRequestCount || 0) : 0,
        requestsThisHour,
        lastUsedAt: usage?.lastVoiceUsedAt || undefined,

        planType,
        hasAccess: planLimits.hasAccess,

        limits: {
          minutesPerMonth: planLimits.minutesPerMonth,
          maxAudioLengthSeconds: planLimits.maxAudioLengthSeconds,
          requestsPerHour: planLimits.requestsPerHour,
        },

        remaining: {
          minutes: minutesRemaining,
          seconds: minutesRemaining * 60,
          percentage: 100 - percentageUsed,
          requestsThisHour: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
        },

        billingCycle: {
          startDate: billingCycle.startDate,
          endDate: billingCycle.endDate,
          daysRemaining: billingCycle.daysRemaining,
          resetsAt: billingCycle.endDate,
        },

        cost: {
          perMinute: COST_PER_MINUTE_INR,
          usedThisMonth: parseFloat((minutesUsed * COST_PER_MINUTE_INR).toFixed(2)),
          maxThisMonth: parseFloat((planLimits.minutesPerMonth * COST_PER_MINUTE_INR).toFixed(2)),
        },
      };

    } catch (error) {
      console.error('❌ Error getting voice stats:', error);
      return null;
    }
  }

  /**
   * Get voice limits for user's plan (for UI display)
   */
  async getVoiceLimits(userId: string): Promise<VoiceLimitsResponse> {
    const planType = await this.getUserPlanType(userId);
    const planLimits = this.getPlanLimits(planType);
    const billingCycle = await this.getBillingCycle(userId);
    const minutesUsed = await this.getMinutesUsedThisMonth(userId);

    return {
      planType,
      hasAccess: planLimits.hasAccess,
      limits: {
        minutesPerMonth: planLimits.minutesPerMonth,
        maxAudioLengthSeconds: planLimits.maxAudioLengthSeconds,
        requestsPerHour: planLimits.requestsPerHour,
      },
      usage: {
        minutesUsed,
        minutesRemaining: Math.max(0, planLimits.minutesPerMonth - minutesUsed),
        percentageUsed: planLimits.minutesPerMonth > 0 
          ? parseFloat(((minutesUsed / planLimits.minutesPerMonth) * 100).toFixed(1))
          : 0,
      },
      billingCycle: {
        startDate: billingCycle.startDate,
        endDate: billingCycle.endDate,
        resetsAt: billingCycle.endDate,
      },
    };
  }

  /**
   * Get plan limits status (for controller response)
   */
  async getPlanLimitsStatus(userId: string) {
    const planType = await this.getUserPlanType(userId);
    const planLimits = this.getPlanLimits(planType);

    if (!planLimits.hasAccess) {
      return {
        success: false,
        hasAccess: false,
        planType,
        message: 'OnAir voice features require Plus plan or higher. Upgrade to unlock voice conversations!',
        upgradeUrl: '/plans',
      };
    }

    const minutesUsed = await this.getMinutesUsedThisMonth(userId);
    const requestsThisHour = await this.getRequestsThisHour(userId);
    const billingCycle = await this.getBillingCycle(userId);

    return {
      success: true,
      hasAccess: true,
      planType,
      limits: {
        minutesPerMonth: {
          limit: planLimits.minutesPerMonth,
          used: parseFloat(minutesUsed.toFixed(2)),
          remaining: parseFloat(Math.max(0, planLimits.minutesPerMonth - minutesUsed).toFixed(2)),
          percentageUsed: parseFloat(((minutesUsed / planLimits.minutesPerMonth) * 100).toFixed(1)),
        },
        maxAudioLengthSeconds: planLimits.maxAudioLengthSeconds,
        requestsPerHour: {
          limit: planLimits.requestsPerHour,
          used: requestsThisHour,
          remaining: Math.max(0, planLimits.requestsPerHour - requestsThisHour),
        },
      },
      billingCycle: {
        startDate: billingCycle.startDate,
        endDate: billingCycle.endDate,
        daysRemaining: billingCycle.daysRemaining,
      },
      resetsAt: {
        monthly: billingCycle.endDate,
        hourly: this.getNextHourlyReset(),
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESET METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Reset monthly voice usage (called on new billing cycle)
   */
  async resetMonthlyUsage(userId: string): Promise<boolean> {
    try {
      const billingCycle = await this.getBillingCycle(userId);

      await prisma.usage.update({
        where: { userId },
        data: {
          voiceMinutesUsed: 0,
          voiceSecondsInput: 0,
          voiceSecondsOutput: 0,
          voiceRequestCount: 0,
          voiceUsageResetAt: billingCycle.startDate,
        },
      });

      console.log(`✅ Monthly voice usage reset for user ${userId}`);
      return true;

    } catch (error) {
      console.error('❌ Error resetting monthly usage:', error);
      return false;
    }
  }

  /**
   * Manual reset (for testing/admin)
   */
  async forceResetUsage(userId: string): Promise<boolean> {
    try {
      await prisma.usage.update({
        where: { userId },
        data: {
          voiceMinutesUsed: 0,
          voiceSecondsInput: 0,
          voiceSecondsOutput: 0,
          voiceRequestCount: 0,
          voiceRequestsThisHour: 0,
          voiceHourlyResetAt: null,
          voiceUsageResetAt: new Date(),
          lastVoiceUsedAt: null,
        },
      });

      console.log(`✅ Force reset voice usage for user ${userId}`);
      return true;

    } catch (error) {
      console.error('❌ Error force resetting usage:', error);
      return false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate total minutes from input + output seconds
   */
  public calculateTotalMinutes(inputSeconds: number, outputSeconds: number): number {
    return parseFloat(((inputSeconds + outputSeconds) / 60).toFixed(4));
  }

  /**
   * Get next hourly reset time
   */
  private getNextHourlyReset(): Date {
    const next = new Date();
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
  }

  /**
   * Get cost per minute
   */
  public getCostPerMinute(): number {
    return COST_PER_MINUTE_INR;
  }

  /**
   * Estimate cost for given duration
   */
  public estimateCost(minutes: number): number {
    return parseFloat((minutes * COST_PER_MINUTE_INR).toFixed(2));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default VoiceUsageService;
export { VOICE_PLAN_LIMITS, COST_PER_MINUTE_INR };
export type { VoiceUsageRecord, VoiceLimitCheck, VoiceUsageStats, VoiceLimitsResponse };