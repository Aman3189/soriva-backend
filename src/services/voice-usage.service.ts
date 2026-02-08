/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE USAGE SERVICE - SORIVA ONAIR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Track and manage voice usage with MONTHLY plan-based limits
 * Updated: December 2025 - Dynamic Bonus Minutes System (FULLY WORKING)
 * 
 * Features:
 * - Monthly voice minutes allocation per plan
 * - Real-time usage tracking
 * - Hourly request rate limiting (abuse prevention)
 * - Max audio length per request (plan-based)
 * - Automatic monthly reset on billing cycle
 * - 🆕 DYNAMIC BONUS MINUTES - Earn extra minutes from efficient conversations!
 * - 🆕 AUTO BONUS USAGE - Bonus minutes automatically used when base exhausted!
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
 * Pricing Model:
 * - Budgeted Cost: ₹1.42/min (10:90 ratio - worst case)
 * - Actual Cost: Varies by input:output ratio
 *   - 40:60 ratio = ₹1.06/min (MAX savings!)
 *   - 30:70 ratio = ₹1.17/min
 *   - 10:90 ratio = ₹1.40/min (MIN savings)
 * - Savings converted to BONUS MINUTES! 🎁
 * - ₹1.10 savings = 1 bonus minute
 * 
 * "The more you SPEAK, the more you earn!"
 * 
 * Author: Aman (Risenex Dynamics)
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
    [PlanType.LITE]: {             
    minutesPerMonth: 0,
    maxAudioLengthSeconds: 0,
    requestsPerHour: 0,
    hasAccess: false,
  },
  [PlanType.PLUS]: {
    minutesPerMonth: 30,        // 30 min/month @ ₹1.42 = ₹42.6 budget
    maxAudioLengthSeconds: 60,  // 1 min max per request
    requestsPerHour: 30,        // Rate limit
    hasAccess: true,
  },
  [PlanType.PRO]: {
    minutesPerMonth: 45,        // 45 min/month @ ₹1.42 = ₹63.9 budget
    maxAudioLengthSeconds: 120, // 2 min max per request
    requestsPerHour: 45,        // Rate limit
    hasAccess: true,
  },
  [PlanType.APEX]: {
    minutesPerMonth: 60,        // 60 min/month @ ₹1.42 = ₹85.2 budget
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRICING CONSTANTS (Gemini 2.5 Flash Native Audio - Live API)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Token rates
const TOKENS_PER_SECOND = 25;  // 25 tokens/sec for audio

// Cost per token in INR (@ $1 = ₹84)
// Audio Input: $3.00/1M tokens = ₹252/1M tokens
// Audio Output: $12.00/1M tokens = ₹1008/1M tokens
const AUDIO_INPUT_COST_PER_TOKEN_INR = 252 / 1_000_000;   // ₹0.000252/token
const AUDIO_OUTPUT_COST_PER_TOKEN_INR = 1008 / 1_000_000; // ₹0.001008/token

// Cost per second (25 tokens × cost per token)
const AUDIO_INPUT_COST_PER_SECOND_INR = TOKENS_PER_SECOND * AUDIO_INPUT_COST_PER_TOKEN_INR;   // ₹0.0063/sec
const AUDIO_OUTPUT_COST_PER_SECOND_INR = TOKENS_PER_SECOND * AUDIO_OUTPUT_COST_PER_TOKEN_INR; // ₹0.0252/sec

// Budgeted cost per minute (based on 10:90 ratio - worst case scenario)
// This is what we charge/allocate in plans
const BUDGETED_COST_PER_MINUTE_INR = 1.42;

// Threshold for bonus minute conversion
// When savings accumulate to this amount, grant 1 bonus minute
// Based on average actual cost (~₹1.10/min at 30:70 ratio)
const BONUS_MINUTE_COST_THRESHOLD_INR = 1.10;

// Legacy export for backward compatibility
const COST_PER_MINUTE_INR = BUDGETED_COST_PER_MINUTE_INR;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface VoiceUsageRecord {
  inputSeconds: number;   // User's audio input duration
  outputSeconds: number;  // Soriva's audio response duration
  totalMinutes: number;   // Combined minutes for billing
}

interface VoiceCostBreakdown {
  inputSeconds: number;
  outputSeconds: number;
  totalMinutes: number;
  inputCost: number;      // Actual input cost in INR
  outputCost: number;     // Actual output cost in INR
  actualCost: number;     // Total actual cost in INR
  budgetedCost: number;   // What we budgeted (₹1.42/min)
  savings: number;        // Difference (budgeted - actual)
  inputOutputRatio: string; // e.g., "35:65"
}

interface VoiceLimitCheck {
  allowed: boolean;
  reason?: string;
  remaining?: {
    minutes: number;
    seconds: number;
    percentage: number;
    requestsThisHour: number;
    bonusMinutes: number;      // Bonus minutes available
    totalMinutes: number;      // Base + Bonus minutes
  };
  upgradeRequired?: boolean;
  limitType?: 'plan_access' | 'monthly_limit' | 'hourly_rate' | 'audio_length';
  usingBonus?: boolean;        // 🆕 Flag if this request will use bonus minutes
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
  
  // Bonus System
  bonus: {
    bonusMinutesEarned: number;      // Total bonus minutes earned this month
    bonusMinutesUsed: number;        // Bonus minutes consumed
    bonusMinutesAvailable: number;   // Available to use
    savingsAccumulated: number;      // Current savings pool (not yet converted)
    savingsToNextBonus: number;      // How much more needed for next bonus
    totalEffectiveMinutes: number;   // Base remaining + bonus available
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
    perMinuteBudgeted: number;
    perMinuteActualAvg: number;
    usedThisMonth: number;
    maxThisMonth: number;
    savedThisMonth: number;
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
  bonus: {
    minutesEarned: number;
    minutesAvailable: number;
    savingsAccumulated: number;
  };
  billingCycle: {
    startDate: Date;
    endDate: Date;
    resetsAt: Date;
  };
}

interface BonusMinutesResult {
  bonusMinutesAwarded: number;
  totalBonusMinutes: number;
  savingsRemaining: number;
  message?: string;
}

interface UsageRecordResult {
  success: boolean;
  costBreakdown?: VoiceCostBreakdown;
  bonusResult?: BonusMinutesResult;
  usedBonusMinutes?: number;       // 🆕 How many bonus minutes were consumed
  usedFromBase?: number;           // 🆕 How many minutes from base quota
  message?: string;
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
  // COST CALCULATION METHODS (Dynamic Pricing)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate ACTUAL cost based on real input/output duration
   * This is the real cost we pay to Gemini
   */
  public calculateActualCost(inputSeconds: number, outputSeconds: number): number {
    const inputCost = inputSeconds * AUDIO_INPUT_COST_PER_SECOND_INR;
    const outputCost = outputSeconds * AUDIO_OUTPUT_COST_PER_SECOND_INR;
    return parseFloat((inputCost + outputCost).toFixed(4));
  }

  /**
   * Calculate BUDGETED cost (what we allocate in plans)
   * Based on worst-case 10:90 ratio @ ₹1.42/min
   */
  public calculateBudgetedCost(totalMinutes: number): number {
    return parseFloat((totalMinutes * BUDGETED_COST_PER_MINUTE_INR).toFixed(4));
  }

  /**
   * Get detailed cost breakdown for a voice interaction
   */
  public getCostBreakdown(inputSeconds: number, outputSeconds: number): VoiceCostBreakdown {
    const totalSeconds = inputSeconds + outputSeconds;
    const totalMinutes = totalSeconds / 60;
    
    const inputCost = inputSeconds * AUDIO_INPUT_COST_PER_SECOND_INR;
    const outputCost = outputSeconds * AUDIO_OUTPUT_COST_PER_SECOND_INR;
    const actualCost = inputCost + outputCost;
    const budgetedCost = totalMinutes * BUDGETED_COST_PER_MINUTE_INR;
    const savings = Math.max(0, budgetedCost - actualCost);
    
    // Calculate ratio
    const inputPercent = totalSeconds > 0 ? Math.round((inputSeconds / totalSeconds) * 100) : 0;
    const outputPercent = 100 - inputPercent;
    
    return {
      inputSeconds,
      outputSeconds,
      totalMinutes: parseFloat(totalMinutes.toFixed(4)),
      inputCost: parseFloat(inputCost.toFixed(4)),
      outputCost: parseFloat(outputCost.toFixed(4)),
      actualCost: parseFloat(actualCost.toFixed(4)),
      budgetedCost: parseFloat(budgetedCost.toFixed(4)),
      savings: parseFloat(savings.toFixed(4)),
      inputOutputRatio: `${inputPercent}:${outputPercent}`,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BONUS MINUTES SYSTEM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Process savings and convert to bonus minutes
   * Called after each voice interaction
   */
  private async processSavingsToBonus(userId: string, savings: number): Promise<BonusMinutesResult> {
    if (savings <= 0) {
      return {
        bonusMinutesAwarded: 0,
        totalBonusMinutes: 0,
        savingsRemaining: 0,
      };
    }

    try {
      // Get current savings pool
      const usage = await prisma.usage.findUnique({
        where: { userId },
        select: {
          voiceSavingsAccumulated: true,
          voiceBonusMinutesEarned: true,
        },
      });

      const currentSavings = (usage?.voiceSavingsAccumulated || 0) + savings;
      const currentBonusMinutes = usage?.voiceBonusMinutesEarned || 0;

      // Calculate new bonus minutes
      const newBonusMinutes = Math.floor(currentSavings / BONUS_MINUTE_COST_THRESHOLD_INR);
      const remainingSavings = currentSavings % BONUS_MINUTE_COST_THRESHOLD_INR;

      // Update database
      await prisma.usage.update({
        where: { userId },
        data: {
          voiceSavingsAccumulated: parseFloat(remainingSavings.toFixed(4)),
          voiceBonusMinutesEarned: { increment: newBonusMinutes },
        },
      });

      const totalBonusMinutes = currentBonusMinutes + newBonusMinutes;

      // Log if bonus awarded
      if (newBonusMinutes > 0) {
        console.log(`🎁 Bonus minutes awarded to user ${userId}: +${newBonusMinutes} min (Total: ${totalBonusMinutes} min)`);
      }

      return {
        bonusMinutesAwarded: newBonusMinutes,
        totalBonusMinutes,
        savingsRemaining: parseFloat(remainingSavings.toFixed(4)),
        message: newBonusMinutes > 0 
          ? `🎁 +${newBonusMinutes} bonus minute${newBonusMinutes > 1 ? 's' : ''} earned!`
          : undefined,
      };

    } catch (error) {
      console.error('❌ Error processing savings to bonus:', error);
      return {
        bonusMinutesAwarded: 0,
        totalBonusMinutes: 0,
        savingsRemaining: savings,
      };
    }
  }

  /**
   * Get user's bonus minutes status
   */
  async getBonusMinutesStatus(userId: string): Promise<{
    earned: number;
    used: number;
    available: number;
    savingsAccumulated: number;
    savingsToNextBonus: number;
  }> {
    const usage = await prisma.usage.findUnique({
      where: { userId },
      select: {
        voiceBonusMinutesEarned: true,
        voiceBonusMinutesUsed: true,
        voiceSavingsAccumulated: true,
      },
    });

    const earned = usage?.voiceBonusMinutesEarned || 0;
    const used = usage?.voiceBonusMinutesUsed || 0;
    const available = Math.max(0, earned - used);
    const savingsAccumulated = usage?.voiceSavingsAccumulated || 0;
    const savingsToNextBonus = parseFloat((BONUS_MINUTE_COST_THRESHOLD_INR - savingsAccumulated).toFixed(2));

    return {
      earned,
      used,
      available,
      savingsAccumulated: parseFloat(savingsAccumulated.toFixed(2)),
      savingsToNextBonus: Math.max(0, savingsToNextBonus),
    };
  }

  /**
   * 🆕 Use bonus minutes (NOW ACTUALLY CALLED!)
   * Called when base quota is exhausted but user still has bonus minutes
   */
  private async useBonusMinutes(userId: string, minutes: number): Promise<boolean> {
    try {
      const bonusStatus = await this.getBonusMinutesStatus(userId);
      
      if (bonusStatus.available < minutes) {
        console.log(`⚠️ Insufficient bonus minutes: need ${minutes}, have ${bonusStatus.available}`);
        return false;
      }

      await prisma.usage.update({
        where: { userId },
        data: {
          voiceBonusMinutesUsed: { increment: minutes },
        },
      });

      console.log(`✅ Used ${minutes.toFixed(2)} bonus minute(s) for user ${userId} | Remaining: ${(bonusStatus.available - minutes).toFixed(2)}`);
      return true;

    } catch (error) {
      console.error('❌ Error using bonus minutes:', error);
      return false;
    }
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

  /**
   * Get total effective minutes (base remaining + bonus available)
   */
  private async getTotalEffectiveMinutes(userId: string): Promise<{
    baseRemaining: number;
    bonusAvailable: number;
    totalEffective: number;
    baseUsed: number;
    baseLimit: number;
  }> {
    const planType = await this.getUserPlanType(userId);
    const planLimits = this.getPlanLimits(planType);
    const minutesUsed = await this.getMinutesUsedThisMonth(userId);
    const bonusStatus = await this.getBonusMinutesStatus(userId);

    const baseRemaining = Math.max(0, planLimits.minutesPerMonth - minutesUsed);
    const bonusAvailable = bonusStatus.available;
    const totalEffective = baseRemaining + bonusAvailable;

    return {
      baseRemaining,
      bonusAvailable,
      totalEffective,
      baseUsed: minutesUsed,
      baseLimit: planLimits.minutesPerMonth,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LIMIT CHECKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if user can use voice (comprehensive check)
   * Call this before processing any voice request
   * 🆕 Now properly checks and reports if bonus minutes will be used!
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
            bonusMinutes: 0,
            totalMinutes: 0,
          },
        };
      }

      // 4. Check monthly minutes limit (including bonus!)
      const effectiveMinutes = await this.getTotalEffectiveMinutes(userId);
      const requestedMinutes = requestedSeconds / 60;

      // 🆕 Determine if we'll need to use bonus minutes
      const willUseBonus = effectiveMinutes.baseRemaining < requestedMinutes && effectiveMinutes.bonusAvailable > 0;

      // Minimum 20 seconds required to make a voice request
      // Prevents guaranteed overage on last request
      const MINIMUM_SECONDS_REQUIRED = 20;
      const remainingSeconds = effectiveMinutes.totalEffective * 60;

      if (remainingSeconds < MINIMUM_SECONDS_REQUIRED) {
        const billingCycle = await this.getBillingCycle(userId);
        return {
          allowed: false,
          reason: remainingSeconds <= 0
            ? `Monthly voice minutes exhausted (including bonus). Your ${planType} plan has ${planLimits.minutesPerMonth} min/month. Resets on ${billingCycle.endDate.toLocaleDateString()}.`
            : `Only ${Math.floor(remainingSeconds)} seconds remaining. Minimum ${MINIMUM_SECONDS_REQUIRED} seconds required. Resets on ${billingCycle.endDate.toLocaleDateString()}.`,
          limitType: 'monthly_limit',
          remaining: {
            minutes: effectiveMinutes.baseRemaining,
            seconds: remainingSeconds,
            percentage: (effectiveMinutes.baseRemaining / planLimits.minutesPerMonth) * 100,
            requestsThisHour: planLimits.requestsPerHour - requestsThisHour,
            bonusMinutes: effectiveMinutes.bonusAvailable,
            totalMinutes: effectiveMinutes.totalEffective,
          },
        };
      }
      // 5. Check if requested duration fits in remaining (base + bonus)
      if (requestedMinutes > effectiveMinutes.totalEffective) {
        return {
          allowed: false,
          reason: `Not enough minutes. Remaining: ${effectiveMinutes.totalEffective.toFixed(1)} min (Base: ${effectiveMinutes.baseRemaining.toFixed(1)} + Bonus: ${effectiveMinutes.bonusAvailable}). Requested: ~${requestedMinutes.toFixed(1)} min.`,
          limitType: 'monthly_limit',
          remaining: {
            minutes: effectiveMinutes.baseRemaining,
            seconds: effectiveMinutes.baseRemaining * 60,
            percentage: (effectiveMinutes.baseRemaining / planLimits.minutesPerMonth) * 100,
            requestsThisHour: planLimits.requestsPerHour - requestsThisHour,
            bonusMinutes: effectiveMinutes.bonusAvailable,
            totalMinutes: effectiveMinutes.totalEffective,
          },
        };
      }

      // All checks passed
      return {
        allowed: true,
        usingBonus: willUseBonus, // 🆕 Let caller know bonus will be used
        remaining: {
          minutes: effectiveMinutes.baseRemaining,
          seconds: effectiveMinutes.baseRemaining * 60,
          percentage: (effectiveMinutes.baseRemaining / planLimits.minutesPerMonth) * 100,
          requestsThisHour: planLimits.requestsPerHour - requestsThisHour,
          bonusMinutes: effectiveMinutes.bonusAvailable,
          totalMinutes: effectiveMinutes.totalEffective,
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
   * Quick check if user has minutes remaining (including bonus)
   */
  async hasMinutesRemaining(userId: string): Promise<boolean> {
    const planType = await this.getUserPlanType(userId);
    if (!this.hasPlanAccess(planType)) return false;

    const effectiveMinutes = await this.getTotalEffectiveMinutes(userId);
    return effectiveMinutes.totalEffective > 0;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE RECORDING (🆕 NOW WITH BONUS USAGE!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Record voice usage after a successful interaction
   * 🆕 Now calculates actual cost, tracks savings, awards bonus minutes,
   *    AND automatically uses bonus minutes when base quota exhausted!
   */
  async recordUsage(userId: string, usage: VoiceUsageRecord): Promise<UsageRecordResult> {
    try {
      const { inputSeconds, outputSeconds, totalMinutes } = usage;
      const billingCycle = await this.getBillingCycle(userId);

      // Get current state BEFORE recording
      const effectiveMinutesBefore = await this.getTotalEffectiveMinutes(userId);
      const planType = await this.getUserPlanType(userId);
      const planLimits = this.getPlanLimits(planType);

      // Calculate actual vs budgeted cost
      const costBreakdown = this.getCostBreakdown(inputSeconds, outputSeconds);
      
      // Check if we need to reset (new billing cycle)
      const currentUsage = await prisma.usage.findUnique({
        where: { userId },
        select: { voiceUsageResetAt: true },
      });

      const needsReset = !this.isCurrentBillingCycle(
        currentUsage?.voiceUsageResetAt || null,
        billingCycle.startDate
      );

      // ─────────────────────────────────────────────────────────────────
      // 🆕 SMART DEDUCTION LOGIC
      // ─────────────────────────────────────────────────────────────────
      // Determine how much to deduct from base vs bonus
      let deductFromBase = 0;
      let deductFromBonus = 0;
      let bonusUsageMessage = '';

      if (needsReset) {
        // New cycle - everything resets, all usage goes to base
        deductFromBase = totalMinutes;
      } else {
        // Calculate how to split between base and bonus
        const baseRemainingBefore = effectiveMinutesBefore.baseRemaining;
        
        if (baseRemainingBefore >= totalMinutes) {
          // Enough base quota - use only base
          deductFromBase = totalMinutes;
        } else if (baseRemainingBefore > 0) {
          // Partial base, partial bonus
          deductFromBase = baseRemainingBefore;
          deductFromBonus = totalMinutes - baseRemainingBefore;
          bonusUsageMessage = `Used ${deductFromBase.toFixed(2)} base + ${deductFromBonus.toFixed(2)} bonus minutes`;
        } else {
          // No base remaining - all from bonus
          deductFromBonus = totalMinutes;
          bonusUsageMessage = `Used ${deductFromBonus.toFixed(2)} bonus minutes (base exhausted)`;
        }
      }

      // ─────────────────────────────────────────────────────────────────
      // UPDATE DATABASE
      // ─────────────────────────────────────────────────────────────────
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
            // Reset bonus tracking for new cycle
            voiceBonusMinutesEarned: 0,
            voiceBonusMinutesUsed: 0,
            voiceSavingsAccumulated: 0,
            voiceTotalSavingsThisMonth: costBreakdown.savings,
            voiceActualCostThisMonth: costBreakdown.actualCost,
          },
        });
      } else {
        // Increment existing usage
        await prisma.usage.update({
          where: { userId },
          data: {
            voiceMinutesUsed: { increment: deductFromBase }, // Only increment base usage
            voiceSecondsInput: { increment: inputSeconds },
            voiceSecondsOutput: { increment: outputSeconds },
            voiceRequestCount: { increment: 1 },
            voiceRequestsThisHour: { increment: 1 },
            lastVoiceUsedAt: new Date(),
            // Track actual costs
            voiceTotalSavingsThisMonth: { increment: costBreakdown.savings },
            voiceActualCostThisMonth: { increment: costBreakdown.actualCost },
          },
        });

        // 🆕 USE BONUS MINUTES IF NEEDED
        if (deductFromBonus > 0) {
          const bonusUsed = await this.useBonusMinutes(userId, deductFromBonus);
          if (!bonusUsed) {
            console.error(`❌ Failed to deduct ${deductFromBonus} bonus minutes for user ${userId}`);
            // Note: We don't fail the whole operation - usage is already recorded
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────
      // PROCESS SAVINGS INTO BONUS MINUTES (earn new bonus)
      // ─────────────────────────────────────────────────────────────────
      const bonusResult = await this.processSavingsToBonus(userId, costBreakdown.savings);

      // ─────────────────────────────────────────────────────────────────
      // LOGGING
      // ─────────────────────────────────────────────────────────────────
      console.log(`✅ Voice usage recorded: ${totalMinutes.toFixed(2)} min | Ratio: ${costBreakdown.inputOutputRatio} | Actual: ₹${costBreakdown.actualCost.toFixed(2)} | Saved: ₹${costBreakdown.savings.toFixed(2)}`);
      
      if (bonusUsageMessage) {
        console.log(`🎯 ${bonusUsageMessage}`);
      }
      
      if (bonusResult.bonusMinutesAwarded > 0) {
        console.log(`🎁 Bonus earned: +${bonusResult.bonusMinutesAwarded} min!`);
      }

      return {
        success: true,
        costBreakdown,
        bonusResult,
        usedBonusMinutes: deductFromBonus,
        usedFromBase: deductFromBase,
        message: bonusUsageMessage || undefined,
      };

    } catch (error) {
      console.error('❌ Error recording voice usage:', error);
      return { success: false };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATISTICS & LIMITS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get comprehensive voice usage statistics
   * Includes bonus system stats!
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
          // Bonus fields
          voiceBonusMinutesEarned: true,
          voiceBonusMinutesUsed: true,
          voiceSavingsAccumulated: true,
          voiceTotalSavingsThisMonth: true,
          voiceActualCostThisMonth: true,
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

      // Bonus calculations
      const bonusEarned = isCurrentCycle ? (usage?.voiceBonusMinutesEarned || 0) : 0;
      const bonusUsed = isCurrentCycle ? (usage?.voiceBonusMinutesUsed || 0) : 0;
      const bonusAvailable = Math.max(0, bonusEarned - bonusUsed);
      const savingsAccumulated = isCurrentCycle ? (usage?.voiceSavingsAccumulated || 0) : 0;
      const totalSavings = isCurrentCycle ? (usage?.voiceTotalSavingsThisMonth || 0) : 0;
      const actualCost = isCurrentCycle ? (usage?.voiceActualCostThisMonth || 0) : 0;

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

        // Bonus system stats
        bonus: {
          bonusMinutesEarned: bonusEarned,
          bonusMinutesUsed: bonusUsed,
          bonusMinutesAvailable: bonusAvailable,
          savingsAccumulated: parseFloat(savingsAccumulated.toFixed(2)),
          savingsToNextBonus: parseFloat(Math.max(0, BONUS_MINUTE_COST_THRESHOLD_INR - savingsAccumulated).toFixed(2)),
          totalEffectiveMinutes: minutesRemaining + bonusAvailable,
        },

        billingCycle: {
          startDate: billingCycle.startDate,
          endDate: billingCycle.endDate,
          daysRemaining: billingCycle.daysRemaining,
          resetsAt: billingCycle.endDate,
        },

        cost: {
          perMinuteBudgeted: BUDGETED_COST_PER_MINUTE_INR,
          perMinuteActualAvg: minutesUsed > 0 ? parseFloat((actualCost / minutesUsed).toFixed(2)) : 0,
          usedThisMonth: parseFloat(actualCost.toFixed(2)),
          maxThisMonth: parseFloat((planLimits.minutesPerMonth * BUDGETED_COST_PER_MINUTE_INR).toFixed(2)),
          savedThisMonth: parseFloat(totalSavings.toFixed(2)),
        },
      };

    } catch (error) {
      console.error('❌ Error getting voice stats:', error);
      return null;
    }
  }

  /**
   * Get voice limits for user's plan (for UI display)
   * Includes bonus info!
   */
  async getVoiceLimits(userId: string): Promise<VoiceLimitsResponse> {
    const planType = await this.getUserPlanType(userId);
    const planLimits = this.getPlanLimits(planType);
    const billingCycle = await this.getBillingCycle(userId);
    const minutesUsed = await this.getMinutesUsedThisMonth(userId);
    const bonusStatus = await this.getBonusMinutesStatus(userId);

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
      bonus: {
        minutesEarned: bonusStatus.earned,
        minutesAvailable: bonusStatus.available,
        savingsAccumulated: bonusStatus.savingsAccumulated,
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
   * Includes bonus info!
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
    const bonusStatus = await this.getBonusMinutesStatus(userId);
    const effectiveMinutes = await this.getTotalEffectiveMinutes(userId);

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
      // Bonus info
      bonus: {
        minutesEarned: bonusStatus.earned,
        minutesUsed: bonusStatus.used,
        minutesAvailable: bonusStatus.available,
        savingsAccumulated: bonusStatus.savingsAccumulated,
        savingsToNextBonus: bonusStatus.savingsToNextBonus,
        totalEffectiveMinutes: effectiveMinutes.totalEffective,
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
   * Also resets bonus minutes for new cycle
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
          // Reset bonus tracking
          voiceBonusMinutesEarned: 0,
          voiceBonusMinutesUsed: 0,
          voiceSavingsAccumulated: 0,
          voiceTotalSavingsThisMonth: 0,
          voiceActualCostThisMonth: 0,
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
          // Reset bonus
          voiceBonusMinutesEarned: 0,
          voiceBonusMinutesUsed: 0,
          voiceSavingsAccumulated: 0,
          voiceTotalSavingsThisMonth: 0,
          voiceActualCostThisMonth: 0,
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
   * Get budgeted cost per minute
   */
  public getCostPerMinute(): number {
    return BUDGETED_COST_PER_MINUTE_INR;
  }

  /**
   * Estimate budgeted cost for given duration
   */
  public estimateCost(minutes: number): number {
    return parseFloat((minutes * BUDGETED_COST_PER_MINUTE_INR).toFixed(2));
  }

  /**
   * Get pricing constants (for debugging/admin)
   */
  public getPricingConstants() {
    return {
      tokensPerSecond: TOKENS_PER_SECOND,
      audioInputCostPerToken: AUDIO_INPUT_COST_PER_TOKEN_INR,
      audioOutputCostPerToken: AUDIO_OUTPUT_COST_PER_TOKEN_INR,
      audioInputCostPerSecond: AUDIO_INPUT_COST_PER_SECOND_INR,
      audioOutputCostPerSecond: AUDIO_OUTPUT_COST_PER_SECOND_INR,
      budgetedCostPerMinute: BUDGETED_COST_PER_MINUTE_INR,
      bonusMinuteThreshold: BONUS_MINUTE_COST_THRESHOLD_INR,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default VoiceUsageService;
export { 
  VOICE_PLAN_LIMITS, 
  COST_PER_MINUTE_INR,
  BUDGETED_COST_PER_MINUTE_INR,
  BONUS_MINUTE_COST_THRESHOLD_INR,
  TOKENS_PER_SECOND,
  AUDIO_INPUT_COST_PER_SECOND_INR,
  AUDIO_OUTPUT_COST_PER_SECOND_INR,
};
export type { 
  VoiceUsageRecord, 
  VoiceLimitCheck, 
  VoiceUsageStats, 
  VoiceLimitsResponse,
  VoiceCostBreakdown,
  BonusMinutesResult,
  UsageRecordResult,
};