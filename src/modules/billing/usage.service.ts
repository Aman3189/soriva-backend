// src/modules/billing/usage.service.ts

/**
 * ==========================================
 * SORIVA BACKEND - USAGE SERVICE (UPDATED)
 * ==========================================
 * Last Updated: November 21, 2025
 *
 * CHANGES:
 * - ❌ REMOVED: Trial system (no longer needed - Starter is free)
 * - ✅ FIXED: Studio credits using plansManager
 * - ✅ ADDED: Missing helper methods for context builder
 * - ✅ ADDED: initializeUsage for new users
 * - ✅ NEW: Token pool management system (Plans.ts V3.0)
 * - ✅ NEW: Dual tracking (words + tokens for migration)
 * - Uses plansManager for all plan data
 * - Class-based singleton architecture
 */

import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import BrainService from '../../services/ai/brain.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BoosterContext {
  cooldownToday: number;
  activeAddons: number;
  hasActiveBoosters: boolean;
}

interface UserStatus {
  status: 'green' | 'yellow' | 'orange' | 'red' | 'empty';
  statusMessage: string;
  icon: string;
  color: string;
  canChat: boolean;
  plan: string;
  memoryDays: number;
  responseDelay: number;
  boosters: {
    cooldown: {
      available: boolean;
      message: string | null;
    };
    addon: {
      available: boolean;
      message: string | null;
    };
  };
}

interface SimpleStatus {
  status: 'green' | 'yellow' | 'orange' | 'red' | 'empty';
  statusMessage: string;
  canChat: boolean;
}

interface InternalUsageStats {
  wordsUsed: number;
  dailyWordsUsed: number;
  remainingWords: number;
  monthlyLimit: number;
  dailyLimit: number;
  remainingDailyWords: number;
  usagePercentage: number;
  dailyUsagePercentage: number;
  plan: string;
  memoryDays: number;
  responseDelay: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USAGE SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class UsageService {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC API (SECURE - NO EXACT NUMBERS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's current status (SECURE - NO EXACT NUMBERS!)
   */
  async getUserStatus(userId: string): Promise<UserStatus> {
    try {
      const internalStats = await this.getInternalUsageStats(userId);

      const maxPercent = Math.max(
        internalStats.dailyUsagePercentage,
        internalStats.usagePercentage
      );

      const statusZone = this.calculateStatusZone(maxPercent);
      const boosterSuggestions = await this.getBoosterSuggestions(
        userId,
        internalStats.dailyUsagePercentage,
        internalStats.usagePercentage
      );

      const canChat = internalStats.remainingWords > 0 && internalStats.remainingDailyWords > 0;

      return {
        status: statusZone.level,
        statusMessage: statusZone.message,
        icon: statusZone.icon,
        color: statusZone.color,
        canChat,
        plan: internalStats.plan,
        memoryDays: internalStats.memoryDays,
        responseDelay: internalStats.responseDelay,
        boosters: boosterSuggestions,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user status: ${error.message}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC HELPERS FOR SYSTEM PROMPT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate status from percentage (NO DATABASE CALL)
   * Used by system-prompt.service.ts
   */
  calculateStatusFromPercentage(dailyPercent: number, monthlyPercent: number): SimpleStatus {
    const maxPercent = Math.max(dailyPercent, monthlyPercent);
    const zone = this.calculateStatusZone(maxPercent);
    const canChat = dailyPercent < 100 && monthlyPercent < 100;

    return {
      status: zone.level,
      statusMessage: zone.message,
      canChat,
    };
  }

  /**
   * Get usage stats for system prompt building (INTERNAL USE)
   */
  async getUsageStatsForPrompt(userId: string): Promise<InternalUsageStats> {
    return await this.getInternalUsageStats(userId);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async getInternalUsageStats(userId: string): Promise<InternalUsageStats> {
    try {
      const usage = await prisma.usage.findUnique({
        where: { userId },
      });

      if (!usage) {
        throw new Error('Usage data not found');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionPlan: true,
          memoryDays: true,
          responseDelay: true,
        },
      });

      const plan = plansManager.getPlanByName(user?.subscriptionPlan || '');

      return {
        wordsUsed: usage.wordsUsed,
        dailyWordsUsed: usage.dailyWordsUsed,
        remainingWords: usage.remainingWords,
        monthlyLimit: usage.monthlyLimit,
        dailyLimit: usage.dailyLimit,
        remainingDailyWords: usage.dailyLimit - usage.dailyWordsUsed,
        usagePercentage: Math.round((usage.wordsUsed / usage.monthlyLimit) * 100),
        dailyUsagePercentage: Math.round((usage.dailyWordsUsed / usage.dailyLimit) * 100),
        plan: plan?.displayName || 'Unknown',
        memoryDays: user?.memoryDays || 5,
        responseDelay: user?.responseDelay || 5,
      };
    } catch (error: any) {
      throw new Error(`Failed to get internal stats: ${error.message}`);
    }
  }

  private calculateStatusZone(percentUsed: number): {
    level: 'green' | 'yellow' | 'orange' | 'red' | 'empty';
    message: string;
    icon: string;
    color: string;
  } {
    if (percentUsed >= 100) {
      return {
        level: 'empty',
        message: 'Daily limit reached! Unlock more with Cooldown Booster ⚡',
        icon: '⚫',
        color: '#EF4444',
      };
    }

    if (percentUsed >= 90) {
      return {
        level: 'red',
        message: 'Almost there! Cooldown Booster ready when you need it 💪',
        icon: '🔴',
        color: '#F97316',
      };
    }

    if (percentUsed >= 70) {
      return {
        level: 'orange',
        message: "You're quite active today! Keep the momentum going 🔥",
        icon: '🟠',
        color: '#F59E0B',
      };
    }

    if (percentUsed >= 40) {
      return {
        level: 'yellow',
        message: "Healthy usage - you're doing great! 💬",
        icon: '🟡',
        color: '#EAB308',
      };
    }

    return {
      level: 'green',
      message: 'All set! Enjoy your conversations 😊',
      icon: '🟢',
      color: '#10B981',
    };
  }

  private async getBoosterSuggestions(
    userId: string,
    dailyPercent: number,
    monthlyPercent: number
  ): Promise<{
    cooldown: { available: boolean; message: string | null };
    addon: { available: boolean; message: string | null };
  }> {
    try {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const cooldownToday = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: 'COOLDOWN',
          activatedAt: { gte: today },
        },
      });

      const canSuggestCooldown = dailyPercent >= 70 && cooldownToday === 0;
      let cooldownMessage = null;

      if (canSuggestCooldown) {
        if (dailyPercent >= 95) {
          cooldownMessage =
            'Need more words today? Cooldown Booster unlocks 2× capacity instantly! 🚀';
        } else if (dailyPercent >= 85) {
          cooldownMessage = 'Running low? Grab a Cooldown Booster to keep chatting! 💪';
        } else if (dailyPercent >= 70) {
          cooldownMessage = 'Psst... Cooldown Booster available if you need it! 😉';
        }
      }

      const canSuggestAddon = monthlyPercent >= 60;
      let addonMessage = null;

      if (canSuggestAddon) {
        if (monthlyPercent >= 85) {
          addonMessage =
            'Running low this month? Add-on Booster gives you fresh words + credits! 🔥';
        } else if (monthlyPercent >= 70) {
          addonMessage = 'Want more capacity? Check out our Add-on Booster! 💎';
        } else if (monthlyPercent >= 60) {
          addonMessage = 'Need extra words? Add-on Booster is available! 😊';
        }
      }

      return {
        cooldown: {
          available: canSuggestCooldown,
          message: cooldownMessage,
        },
        addon: {
          available: canSuggestAddon,
          message: addonMessage,
        },
      };
    } catch (error) {
      console.error('[UsageService] Failed to get booster suggestions:', error);
      return {
        cooldown: { available: false, message: null },
        addon: { available: false, message: null },
      };
    }
  }

  /**
   * ADMIN ONLY: Get internal stats for admin dashboard
   */
  async getInternalStatsForAdmin(userId: string): Promise<InternalUsageStats> {
    try {
      return await this.getInternalUsageStats(userId);
    } catch (error: any) {
      throw new Error(`Admin access failed: ${error.message}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WORD USAGE TRACKING (DEPRECATED - KEEPING FOR BACKWARD COMPATIBILITY)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async canUseWords(userId: string, wordsToUse: number) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🧪 [DEV MODE] Bypassing usage limits for testing');
        return {
          canUse: true,
          dailyRemaining: 999999,
          monthlyRemaining: 999999,
        };
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { canUse: false, reason: 'User not found' };
      }

      const usage = await prisma.usage.findUnique({
        where: { userId },
      });

      if (!usage) {
        return { canUse: false, reason: 'Usage data not initialized' };
      }

      const plan = plansManager.getPlanByName(user.subscriptionPlan);
      if (!plan) {
        return { canUse: false, reason: 'Invalid subscription plan' };
      }

      const dailyRemaining = usage.dailyLimit - usage.dailyWordsUsed;
      if (dailyRemaining < wordsToUse) {
        return {
          canUse: false,
          reason: 'Daily limit reached',
          dailyRemaining,
          monthlyRemaining: usage.remainingWords,
        };
      }

      if (usage.remainingWords < wordsToUse) {
        return {
          canUse: false,
          reason: 'Monthly limit reached',
          dailyRemaining,
          monthlyRemaining: usage.remainingWords,
        };
      }

      return {
        canUse: true,
        dailyRemaining,
        monthlyRemaining: usage.remainingWords,
      };
    } catch (error: any) {
      return { canUse: false, reason: error.message };
    }
  }

  async deductWords(userId: string, wordsUsed: number) {
    try {
      const canUse = await this.canUseWords(userId, wordsUsed);
      if (!canUse.canUse) {
        return {
          success: false,
          message: canUse.reason || 'Cannot use words',
        };
      }

      const updatedUsage = await prisma.usage.update({
        where: { userId },
        data: {
          wordsUsed: { increment: wordsUsed },
          dailyWordsUsed: { increment: wordsUsed },
          remainingWords: { decrement: wordsUsed },
          lastUsedAt: new Date(),
        },
      });

      // Track session in brain service
      try {
        await BrainService.recordSession(userId);
      } catch (brainError) {
        console.warn('[UsageService] Brain service tracking failed:', brainError);
      }

      return {
        success: true,
        message: 'Words deducted successfully',
        usage: updatedUsage,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to deduct words',
      };
    }
  }

  async resetDailyUsage(userId: string) {
    try {
      return await prisma.usage.update({
        where: { userId },
        data: {
          dailyWordsUsed: 0,
          lastDailyReset: new Date(),
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to reset daily usage: ${error.message}`);
    }
  }

  async resetAllDailyUsage() {
    try {
      const result = await prisma.usage.updateMany({
        data: {
          dailyWordsUsed: 0,
          lastDailyReset: new Date(),
        },
      });
      return {
        success: true,
        message: `Daily usage reset for ${result.count} users`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async resetMonthlyUsage(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const plan = plansManager.getPlanByName(user.subscriptionPlan);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const monthlyLimit = plan.limits.monthlyWords;
      const dailyLimit = plan.limits.dailyWords;

      return await prisma.usage.update({
        where: { userId },
        data: {
          wordsUsed: 0,
          dailyWordsUsed: 0,
          remainingWords: monthlyLimit,
          bonusWords: 0,
          monthlyLimit,
          dailyLimit,
          cycleStartDate: new Date(),
          cycleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          lastDailyReset: new Date(),
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to reset monthly usage: ${error.message}`);
    }
  }

  async addBonusWords(userId: string, bonusWords: number) {
    try {
      return await prisma.usage.update({
        where: { userId },
        data: {
          bonusWords: { increment: bonusWords },
          remainingWords: { increment: bonusWords },
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to add bonus words: ${error.message}`);
    }
  }

  async updateLimitsOnPlanChange(userId: string, newPlanId: string) {
    try {
      const newPlan = plansManager.getPlanByName(newPlanId);
      if (!newPlan) {
        throw new Error('Plan not found');
      }

      const currentUsage = await prisma.usage.findUnique({
        where: { userId },
      });

      if (!currentUsage) {
        throw new Error('Usage data not found');
      }

      const newMonthlyLimit = newPlan.limits.monthlyWords;
      const newDailyLimit = newPlan.limits.dailyWords;
      const wordsUsedSoFar = currentUsage.wordsUsed;
      const newRemainingWords = Math.max(0, newMonthlyLimit - wordsUsedSoFar);

      return await prisma.usage.update({
        where: { userId },
        data: {
          monthlyLimit: newMonthlyLimit,
          dailyLimit: newDailyLimit,
          remainingWords: newRemainingWords,
          planName: newPlanId,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to update limits: ${error.message}`);
    }
  }

  async getGlobalUsageStats() {
    try {
      const totalUsers = await prisma.usage.count();

      const totalWordsUsed = await prisma.usage.aggregate({
        _sum: { wordsUsed: true },
      });

      const avgWordsPerUser = await prisma.usage.aggregate({
        _avg: { wordsUsed: true },
      });

      const usersOverLimit = await prisma.usage.count({
        where: { remainingWords: { lte: 0 } },
      });

      return {
        totalUsers,
        totalWordsUsed: totalWordsUsed._sum.wordsUsed || 0,
        avgWordsPerUser: Math.round(avgWordsPerUser._avg.wordsUsed || 0),
        usersOverLimit,
      };
    } catch (error: any) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🆕 TOKEN POOL MANAGEMENT (NEW SYSTEM - PLANS.TS V3.0)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's token pools status
   */
  async getTokenPools(userId: string): Promise<{
    premium: { total: number; used: number; remaining: number };
    bonus: { total: number; used: number; remaining: number };
    daily: {
      limit: number;
      used: number;
      remaining: number;
      rolledOver: number;
      totalAvailable: number;
    };
  }> {
    try {
      const usage = await prisma.usage.findUnique({
        where: { userId },
      });

      if (!usage) {
        throw new Error('Usage data not found');
      }

      return {
        premium: {
          total: usage.premiumTokensTotal,
          used: usage.premiumTokensUsed,
          remaining: usage.premiumTokensRemaining,
        },
        bonus: {
          total: usage.bonusTokensTotal,
          used: usage.bonusTokensUsed,
          remaining: usage.bonusTokensRemaining,
        },
        daily: {
          limit: usage.dailyTokenLimit,
          used: usage.dailyTokensUsed,
          remaining: usage.dailyTokensRemaining,
          rolledOver: usage.rolledOverTokens,
          totalAvailable: usage.totalAvailableToday,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get token pools: ${error.message}`);
    }
  }

  /**
   * Check if user can use tokens (pre-flight check)
   */
  async canUseTokens(
    userId: string,
    tokensNeeded: number
  ): Promise<{
    canUse: boolean;
    useFromPool: 'premium' | 'bonus' | null;
    reason?: string;
    availablePremium?: number;
    availableBonus?: number;
    availableDaily?: number;
  }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🧪 [DEV MODE] Bypassing token limits for testing');
        return {
          canUse: true,
          useFromPool: 'premium',
          availablePremium: 999999,
          availableBonus: 999999,
          availableDaily: 999999,
        };
      }

      const pools = await this.getTokenPools(userId);

      // Check daily limit first
      if (pools.daily.remaining < tokensNeeded) {
        return {
          canUse: false,
          useFromPool: null,
          reason: 'Daily token limit reached',
          availablePremium: pools.premium.remaining,
          availableBonus: pools.bonus.remaining,
          availableDaily: pools.daily.remaining,
        };
      }

      // Try premium pool first
      if (pools.premium.remaining >= tokensNeeded) {
        return {
          canUse: true,
          useFromPool: 'premium',
          availablePremium: pools.premium.remaining,
          availableBonus: pools.bonus.remaining,
          availableDaily: pools.daily.remaining,
        };
      }

      // Fall back to bonus pool (Flash Lite only)
      if (pools.bonus.remaining >= tokensNeeded) {
        return {
          canUse: true,
          useFromPool: 'bonus',
          availablePremium: pools.premium.remaining,
          availableBonus: pools.bonus.remaining,
          availableDaily: pools.daily.remaining,
        };
      }

      // Not enough tokens in any pool
      return {
        canUse: false,
        useFromPool: null,
        reason: 'Insufficient tokens in all pools',
        availablePremium: pools.premium.remaining,
        availableBonus: pools.bonus.remaining,
        availableDaily: pools.daily.remaining,
      };
    } catch (error: any) {
      return {
        canUse: false,
        useFromPool: null,
        reason: error.message,
      };
    }
  }

  /**
   * Deduct tokens from specified pool
   */
  async deductTokens(
    userId: string,
    tokensUsed: number,
    pool: 'premium' | 'bonus'
  ): Promise<{
    success: boolean;
    message: string;
    remaining?: number;
    poolUsed?: 'premium' | 'bonus';
  }> {
    try {
      // Pre-flight check
      const canUse = await this.canUseTokens(userId, tokensUsed);
      if (!canUse.canUse) {
        return {
          success: false,
          message: canUse.reason || 'Cannot use tokens',
        };
      }

      // Deduct from specified pool
      const updateData: any = {
        dailyTokensUsed: { increment: tokensUsed },
        dailyTokensRemaining: { decrement: tokensUsed },
        totalAvailableToday: { decrement: tokensUsed },
        lastUsedAt: new Date(),
      };

      if (pool === 'premium') {
        updateData.premiumTokensUsed = { increment: tokensUsed };
        updateData.premiumTokensRemaining = { decrement: tokensUsed };
      } else {
        updateData.bonusTokensUsed = { increment: tokensUsed };
        updateData.bonusTokensRemaining = { decrement: tokensUsed };
      }

      const updatedUsage = await prisma.usage.update({
        where: { userId },
        data: updateData,
      });

      // Track session in brain service
      try {
        await BrainService.recordSession(userId);
      } catch (brainError) {
        console.warn('[UsageService] Brain service tracking failed:', brainError);
      }

      const remaining =
        pool === 'premium'
          ? updatedUsage.premiumTokensRemaining
          : updatedUsage.bonusTokensRemaining;

      return {
        success: true,
        message: `Tokens deducted from ${pool} pool`,
        remaining,
        poolUsed: pool,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to deduct tokens',
      };
    }
  }

  /**
   * Initialize token pools for new user
   */
  async initializeTokenPools(
    userId: string,
    planType: PlanType
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const plan = plansManager.getPlanByName(planType);
      if (!plan) {
        throw new Error('Invalid plan type');
      }

      // Get token allocations from plans.ts
      const premiumTokens = plan.limits.monthlyTokens;
      const bonusTokens = 100000; // Always 100K Flash Lite bonus
      const dailyLimit = plan.limits.dailyTokens;

      const cycleStart = new Date();
      const cycleEnd = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.usage.create({
        data: {
          userId,
          planName: planType,
          // Old word-based fields (backward compatibility)
          wordsUsed: 0,
          dailyWordsUsed: 0,
          remainingWords: 0,
          bonusWords: 0,
          monthlyLimit: 0,
          dailyLimit: 0,
          // New token-based fields
          premiumTokensTotal: premiumTokens,
          premiumTokensUsed: 0,
          premiumTokensRemaining: premiumTokens,
          bonusTokensTotal: bonusTokens,
          bonusTokensUsed: 0,
          bonusTokensRemaining: bonusTokens,
          dailyTokenLimit: dailyLimit,
          dailyTokensUsed: 0,
          dailyTokensRemaining: dailyLimit,
          rolledOverTokens: 0,
          totalAvailableToday: dailyLimit,
          cycleStartDate: cycleStart,
          cycleEndDate: cycleEnd,
          lastDailyReset: new Date(),
          lastMonthlyReset: new Date(),
        },
      });

      return {
        success: true,
        message: 'Token pools initialized successfully',
      };
    } catch (error: any) {
      throw new Error(`Failed to initialize token pools: ${error.message}`);
    }
  }

  /**
   * Reset daily token usage with rollover
   */
  async resetDailyTokens(userId: string): Promise<{
    success: boolean;
    message: string;
    rolledOver?: number;
  }> {
    try {
      const usage = await prisma.usage.findUnique({
        where: { userId },
      });

      if (!usage) {
        throw new Error('Usage data not found');
      }

      // Calculate rollover (unused tokens from yesterday)
      const unusedYesterday = Math.max(0, usage.dailyTokensRemaining);
      const rolloverAmount = Math.min(unusedYesterday, usage.dailyTokenLimit * 0.5); // Max 50% rollover

      const newTotalAvailable = usage.dailyTokenLimit + rolloverAmount;

      await prisma.usage.update({
        where: { userId },
        data: {
          dailyTokensUsed: 0,
          dailyTokensRemaining: usage.dailyTokenLimit,
          rolledOverTokens: rolloverAmount,
          totalAvailableToday: newTotalAvailable,
          lastDailyReset: new Date(),
        },
      });

      return {
        success: true,
        message: 'Daily tokens reset successfully',
        rolledOver: rolloverAmount,
      };
    } catch (error: any) {
      throw new Error(`Failed to reset daily tokens: ${error.message}`);
    }
  }

  /**
   * Reset monthly token pools
   */
  async resetMonthlyTokens(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const plan = plansManager.getPlanByName(user.subscriptionPlan);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const premiumTokens = plan.limits.monthlyTokens;
      const bonusTokens = 100000; // Always 100K Flash Lite bonus
      const dailyLimit = plan.limits.dailyTokens;

      const cycleStart = new Date();
      const cycleEnd = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.usage.update({
        where: { userId },
        data: {
          // Reset premium pool
          premiumTokensTotal: premiumTokens,
          premiumTokensUsed: 0,
          premiumTokensRemaining: premiumTokens,
          // Reset bonus pool
          bonusTokensTotal: bonusTokens,
          bonusTokensUsed: 0,
          bonusTokensRemaining: bonusTokens,
          // Reset daily
          dailyTokenLimit: dailyLimit,
          dailyTokensUsed: 0,
          dailyTokensRemaining: dailyLimit,
          rolledOverTokens: 0,
          totalAvailableToday: dailyLimit,
          // Update cycle dates
          cycleStartDate: cycleStart,
          cycleEndDate: cycleEnd,
          lastMonthlyReset: new Date(),
          lastDailyReset: new Date(),
        },
      });

      return {
        success: true,
        message: 'Monthly tokens reset successfully',
      };
    } catch (error: any) {
      throw new Error(`Failed to reset monthly tokens: ${error.message}`);
    }
  }

  /**
   * Update token limits when user changes plan
   */
  async updateTokenLimitsOnPlanChange(
    userId: string,
    newPlanType: PlanType
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const newPlan = plansManager.getPlanByName(newPlanType);
      if (!newPlan) {
        throw new Error('Plan not found');
      }

      const currentUsage = await prisma.usage.findUnique({
        where: { userId },
      });

      if (!currentUsage) {
        throw new Error('Usage data not found');
      }

      const newPremiumTotal = newPlan.limits.monthlyTokens;
      const newBonusTotal = 100000; // Always 100K Flash Lite bonus
      const newDailyLimit = newPlan.limits.dailyTokens;

      // Calculate new remaining based on usage so far
      const newPremiumRemaining = Math.max(0, newPremiumTotal - currentUsage.premiumTokensUsed);
      const newBonusRemaining = Math.max(0, newBonusTotal - currentUsage.bonusTokensUsed);

      await prisma.usage.update({
        where: { userId },
        data: {
          planName: newPlanType,
          premiumTokensTotal: newPremiumTotal,
          premiumTokensRemaining: newPremiumRemaining,
          bonusTokensTotal: newBonusTotal,
          bonusTokensRemaining: newBonusRemaining,
          dailyTokenLimit: newDailyLimit,
        },
      });

      return {
        success: true,
        message: 'Token limits updated for new plan',
      };
    } catch (error: any) {
      throw new Error(`Failed to update token limits: ${error.message}`);
    }
  }

  /**
   * Get token usage statistics for admin/monitoring
   */
  async getTokenUsageStats(userId: string): Promise<{
    premium: { usage: number; percentage: number };
    bonus: { usage: number; percentage: number };
    daily: { usage: number; percentage: number };
    totalUsed: number;
    estimatedDaysRemaining: number;
  }> {
    try {
      const pools = await this.getTokenPools(userId);

      const premiumPercentage =
        pools.premium.total > 0
          ? Math.round((pools.premium.used / pools.premium.total) * 100)
          : 0;

      const bonusPercentage =
        pools.bonus.total > 0 ? Math.round((pools.bonus.used / pools.bonus.total) * 100) : 0;

      const dailyPercentage =
        pools.daily.limit > 0 ? Math.round((pools.daily.used / pools.daily.limit) * 100) : 0;

      const totalUsed = pools.premium.used + pools.bonus.used;
      const totalRemaining = pools.premium.remaining + pools.bonus.remaining;

      const avgDailyUsage = pools.daily.used > 0 ? pools.daily.used : pools.daily.limit * 0.3;
      const estimatedDaysRemaining =
        avgDailyUsage > 0 ? Math.floor(totalRemaining / avgDailyUsage) : 30;

      return {
        premium: {
          usage: pools.premium.used,
          percentage: premiumPercentage,
        },
        bonus: {
          usage: pools.bonus.used,
          percentage: bonusPercentage,
        },
        daily: {
          usage: pools.daily.used,
          percentage: dailyPercentage,
        },
        totalUsed,
        estimatedDaysRemaining,
      };
    } catch (error: any) {
      throw new Error(`Failed to get token usage stats: ${error.message}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BOOSTER CONTEXT (FOR CONTEXT.BUILDER.TS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getBoosterContext(userId: string): Promise<BoosterContext> {
    try {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const cooldownToday = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: 'COOLDOWN',
          activatedAt: { gte: today },
        },
      });

      const activeAddons = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: 'ADDON',
          status: 'active',
          expiresAt: { gte: now },
        },
      });

      return {
        cooldownToday,
        activeAddons,
        hasActiveBoosters: cooldownToday > 0 || activeAddons > 0,
      };
    } catch (error) {
      console.error('[UsageService] Failed to get booster context:', error);
      return {
        cooldownToday: 0,
        activeAddons: 0,
        hasActiveBoosters: false,
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEMORY & RESPONSE CONFIGURATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getMemoryDays(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { memoryDays: true },
      });
      return user?.memoryDays || 5;
    } catch (error: any) {
      console.error('[UsageService] Failed to get memory days:', error);
      return 5;
    }
  }

  async getResponseDelay(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { responseDelay: true },
      });
      return user?.responseDelay || 5;
    } catch (error: any) {
      console.error('[UsageService] Failed to get response delay:', error);
      return 5;
    }
  }

  async getContextMemoryLimit(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const plan = plansManager.getPlanByName(user.subscriptionPlan);
      if (!plan) {
        throw new Error('Plan not found');
      }

      return plan.limits.contextMemory || 0;
    } catch (error: any) {
      throw new Error(`Failed to get context memory limit: ${error.message}`);
    }
  }

  // ✅ NEW: Helper methods for context builder (synchronous)
  getMemoryDaysSync(planType: PlanType): number {
    return plansManager.getMemoryDays(planType);
  }

  getResponseDelaySync(planType: PlanType): number {
    return plansManager.getResponseDelay(planType);
  }

  getBotResponseLimit(planType: PlanType): number {
    return plansManager.getBotResponseLimit(planType);
  }

  getContextMemory(planType: PlanType): number {
    return plansManager.getContextMemory(planType);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STUDIO CREDITS MANAGEMENT (CREDIT TABLE SYSTEM)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async checkStudioCredits(userId: string): Promise<{
    hasCredits: boolean;
    remainingCredits: number;
    totalCredits: number;
    usedCredits: number;
  }> {
    try {
      const credit = await prisma.credit.findFirst({
        where: {
          userId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!credit) {
        return {
          hasCredits: false,
          remainingCredits: 0,
          totalCredits: 0,
          usedCredits: 0,
        };
      }

      return {
        hasCredits: credit.remainingCredits > 0,
        remainingCredits: credit.remainingCredits,
        totalCredits: credit.totalCredits,
        usedCredits: credit.usedCredits,
      };
    } catch (error: any) {
      throw new Error(`Failed to check studio credits: ${error.message}`);
    }
  }

  async deductStudioCredits(
    userId: string,
    creditsToDeduct: number
  ): Promise<{
    success: boolean;
    message: string;
    remainingCredits?: number;
  }> {
    try {
      const creditStatus = await this.checkStudioCredits(userId);

      if (!creditStatus.hasCredits || creditStatus.remainingCredits < creditsToDeduct) {
        return {
          success: false,
          message: 'Insufficient studio credits',
        };
      }

      const credit = await prisma.credit.findFirst({
        where: {
          userId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!credit) {
        return {
          success: false,
          message: 'Credit record not found',
        };
      }

      const updatedCredit = await prisma.credit.update({
        where: { id: credit.id },
        data: {
          usedCredits: { increment: creditsToDeduct },
          remainingCredits: { decrement: creditsToDeduct },
        },
      });

      return {
        success: true,
        message: 'Studio credits deducted successfully',
        remainingCredits: updatedCredit.remainingCredits,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to deduct studio credits',
      };
    }
  }

  async resetStudioCredits(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const studioCredits = plansManager.getStudioCredits(user.subscriptionPlan as PlanType);

      const existingCredit = await prisma.credit.findFirst({
        where: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      });

      if (existingCredit) {
        return await prisma.credit.update({
          where: { id: existingCredit.id },
          data: {
            totalCredits: studioCredits,
            usedCredits: 0,
            remainingCredits: studioCredits,
          },
        });
      } else {
        return await prisma.credit.create({
          data: {
            userId,
            totalCredits: studioCredits,
            usedCredits: 0,
            remainingCredits: studioCredits,
            planName: user.subscriptionPlan,
            month: currentMonth,
            year: currentYear,
          },
        });
      }
    } catch (error: any) {
      throw new Error(`Failed to reset studio credits: ${error.message}`);
    }
  }

  async getStudioCreditsRemaining(userId: string): Promise<number> {
    const creditStatus = await this.checkStudioCredits(userId);
    return creditStatus.remainingCredits;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INITIALIZATION (FOR NEW USERS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async initializeUsage(userId: string, planType: PlanType) {
    try {
      const monthlyLimit = plansManager.getMonthlyWordLimit(planType);
      const dailyLimit = plansManager.getDailyWordLimit(planType);

      await prisma.usage.create({
        data: {
          userId,
          planName: planType,
          wordsUsed: 0,
          dailyWordsUsed: 0,
          remainingWords: monthlyLimit,
          bonusWords: 0,
          monthlyLimit,
          dailyLimit,
          cycleStartDate: new Date(),
          cycleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          lastDailyReset: new Date(),
        },
      });

      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to initialize usage: ${error.message}`);
    }
  }

  async initializeStudioCredits(userId: string, planType: PlanType) {
    try {
      const studioCredits = plansManager.getStudioCredits(planType);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      await prisma.credit.create({
        data: {
          userId,
          totalCredits: studioCredits,
          usedCredits: 0,
          remainingCredits: studioCredits,
          planName: planType,
          month: currentMonth,
          year: currentYear,
        },
      });

      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to initialize studio credits: ${error.message}`);
    }
  }
}

export default new UsageService();