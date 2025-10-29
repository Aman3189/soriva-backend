// src/modules/billing/usage.service.ts

/**
 * ==========================================
 * SORIVA BACKEND - USAGE SERVICE (SECURE & CONFIDENTIAL)
 * ==========================================
 * Last Updated: October 14, 2025 (Evening - New Plan Names)
 *
 * CHANGES:
 * - Uses plansManager instead of PLANS object
 * - Import from constants/index
 * - Class-based architecture maintained
 *
 * ENHANCEMENTS:
 * 1. Added calculateStatusFromPercentage() - Public helper for status calculation
 * 2. Made getInternalUsageStats() accessible via getUsageStatsForPrompt()
 */

import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import BrainService from '../../services/brain.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BoosterContext {
  cooldownToday: number;
  activeAddons: number;
  hasActiveBoosters: boolean;
}

// ⭐ Secure status response (NO exact numbers!)
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

// ⭐ NEW: Simple status for context builder
interface SimpleStatus {
  status: 'green' | 'yellow' | 'orange' | 'red' | 'empty';
  statusMessage: string;
  canChat: boolean;
}

// PRIVATE: Only for internal calculations (NEVER expose to frontend)
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
// USAGE SERVICE CLASS (SECURE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class UsageService {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC API (SECURE - NO EXACT NUMBERS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's current status (SECURE - NO EXACT NUMBERS!)
   * Returns visual indicators and natural language only
   */
  async getUserStatus(userId: string): Promise<UserStatus> {
    try {
      // Get internal stats (NEVER expose these directly!)
      const internalStats = await this.getInternalUsageStats(userId);

      // Calculate max percentage (daily vs monthly)
      const maxPercent = Math.max(
        internalStats.dailyUsagePercentage,
        internalStats.usagePercentage
      );

      // Determine status zone
      const statusZone = this.calculateStatusZone(maxPercent);

      // Get booster suggestions
      const boosterSuggestions = await this.getBoosterSuggestions(
        userId,
        internalStats.dailyUsagePercentage,
        internalStats.usagePercentage
      );

      // Check if user can chat
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
  // ⭐ NEW: PUBLIC HELPERS FOR SYSTEM PROMPT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate status from percentage (NO DATABASE CALL)
   * Used by system-prompt.service.ts when usage data is already loaded
   *
   * @param dailyPercent - Daily usage percentage
   * @param monthlyPercent - Monthly usage percentage
   * @returns SimpleStatus object for context builder
   */
  calculateStatusFromPercentage(dailyPercent: number, monthlyPercent: number): SimpleStatus {
    // Use the higher of daily or monthly percentage
    const maxPercent = Math.max(dailyPercent, monthlyPercent);

    // Get status zone
    const zone = this.calculateStatusZone(maxPercent);

    // Determine if user can chat
    const canChat = dailyPercent < 100 && monthlyPercent < 100;

    return {
      status: zone.level,
      statusMessage: zone.message,
      canChat,
    };
  }

  /**
   * Get usage stats for system prompt building
   * This is for INTERNAL use by system-prompt.service.ts
   *
   * ⚠️ WARNING: Contains exact numbers - DO NOT expose to frontend!
   */
  async getUsageStatsForPrompt(userId: string): Promise<InternalUsageStats> {
    return await this.getInternalUsageStats(userId);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE METHODS (INTERNAL USE ONLY - NEVER EXPOSE!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * PRIVATE: Get detailed usage stats (INTERNAL ONLY)
   * ⚠️ NEVER expose this method to frontend/API!
   */
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

      // Get plan using plansManager
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

  /**
   * PRIVATE: Calculate status zone based on percentage
   * Returns user-friendly status with natural language
   */
  private calculateStatusZone(percentUsed: number): {
    level: 'green' | 'yellow' | 'orange' | 'red' | 'empty';
    message: string;
    icon: string;
    color: string;
  } {
    // ZONE 6: Limit reached (100%)
    if (percentUsed >= 100) {
      return {
        level: 'empty',
        message: 'Daily limit reached! Unlock more with Cooldown Booster ⚡',
        icon: '⚫',
        color: '#EF4444',
      };
    }

    // ZONE 5: Critical (90-99%)
    if (percentUsed >= 90) {
      return {
        level: 'red',
        message: 'Almost there! Cooldown Booster ready when you need it 💪',
        icon: '🔴',
        color: '#F97316',
      };
    }

    // ZONE 4: Low (70-89%)
    if (percentUsed >= 70) {
      return {
        level: 'orange',
        message: "You're quite active today! Keep the momentum going 🔥",
        icon: '🟠',
        color: '#F59E0B',
      };
    }

    // ZONE 3: Medium (40-69%)
    if (percentUsed >= 40) {
      return {
        level: 'yellow',
        message: "Healthy usage - you're doing great! 💬",
        icon: '🟡',
        color: '#EAB308',
      };
    }

    // ZONE 1-2: Good (0-39%)
    return {
      level: 'green',
      message: 'All set! Enjoy your conversations 😊',
      icon: '🟢',
      color: '#10B981',
    };
  }

  /**
   * PRIVATE: Get smart booster suggestions
   * Suggests boosters at the right time without being spammy
   */
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

      // Check if user already purchased cooldown today
      const cooldownToday = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: 'COOLDOWN',
          activatedAt: { gte: today },
        },
      });

      // Check active addon boosters
      const activeAddons = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: 'ADDON',
          status: 'active',
          expiresAt: { gte: now },
        },
      });

      // Cooldown suggestion logic
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

      // Add-on suggestion logic
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
  // WORD USAGE TRACKING (SECURE)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if user can use specified number of words
   */
  async canUseWords(userId: string, wordsToUse: number) {
    try {
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

      // Get plan using plansManager
      const plan = plansManager.getPlanByName(user.subscriptionPlan);
      if (!plan) {
        return { canUse: false, reason: 'Invalid subscription plan' };
      }

      // Check daily limit
      const dailyRemaining = usage.dailyLimit - usage.dailyWordsUsed;
      if (dailyRemaining < wordsToUse) {
        return {
          canUse: false,
          reason: 'Daily limit reached',
          // ⚠️ Internal use only - never expose to frontend!
          dailyRemaining,
          monthlyRemaining: usage.remainingWords,
        };
      }

      // Check monthly limit
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

  /**
   * Deduct words from user's usage
   * Includes brain service tracking!
   */
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

  /**
   * Reset daily usage for a user
   */
  async resetDailyUsage(userId: string) {
    try {
      return await prisma.usage.update({
        where: { userId },
        data: { dailyWordsUsed: 0 },
      });
    } catch (error: any) {
      throw new Error(`Failed to reset daily usage: ${error.message}`);
    }
  }

  /**
   * Reset daily usage for all users (cron job)
   */
  async resetAllDailyUsage() {
    try {
      const result = await prisma.usage.updateMany({
        data: { dailyWordsUsed: 0 },
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

  /**
   * Reset monthly usage for a user
   */
  async resetMonthlyUsage(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get plan using plansManager
      const plan = plansManager.getPlanByName(user.subscriptionPlan);
      if (!plan) {
        throw new Error('Plan not found');
      }

      return await prisma.usage.update({
        where: { userId },
        data: {
          wordsUsed: 0,
          dailyWordsUsed: 0,
          remainingWords: plan.limits.monthlyWords,
          monthlyLimit: plan.limits.monthlyWords,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to reset monthly usage: ${error.message}`);
    }
  }

  /**
   * Add bonus words (from boosters)
   */
  async addBonusWords(userId: string, bonusWords: number) {
    try {
      return await prisma.usage.update({
        where: { userId },
        data: {
          remainingWords: { increment: bonusWords },
          monthlyLimit: { increment: bonusWords },
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to add bonus words: ${error.message}`);
    }
  }

  /**
   * Update usage limits when plan changes
   */
  async updateLimitsOnPlanChange(userId: string, newPlanId: string) {
    try {
      // Get plan using plansManager
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
      const wordsUsedSoFar = currentUsage.wordsUsed;
      const newRemainingWords = Math.max(0, newMonthlyLimit - wordsUsedSoFar);

      return await prisma.usage.update({
        where: { userId },
        data: {
          monthlyLimit: newMonthlyLimit,
          dailyLimit: newPlan.limits.dailyWords,
          remainingWords: newRemainingWords,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to update limits: ${error.message}`);
    }
  }

  /**
   * Get usage statistics for admin (ADMIN ONLY!)
   */
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
  // BOOSTER CONTEXT (FOR CONTEXT.BUILDER.TS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get booster context for system prompt
   * Used by context.builder.ts
   */
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

      // Get plan using plansManager
      const plan = plansManager.getPlanByName(user.subscriptionPlan);
      if (!plan) {
        throw new Error('Plan not found');
      }

      return plan.limits.contextMemory || 0;
    } catch (error: any) {
      throw new Error(`Failed to get context memory limit: ${error.message}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STUDIO CREDITS MANAGEMENT
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

      // Get plan using plansManager
      const plan = plansManager.getPlanByName(user.subscriptionPlan);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const studioCredits = plan.credits?.monthlyCredits || 0;

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
  // TRIAL SYSTEM (14 DAYS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async initializeTrial(userId: string): Promise<{
    success: boolean;
    message: string;
    trialEndDate?: Date;
    trialDays?: number;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (user.trialEndDate) {
        return {
          success: false,
          message: 'Trial already initialized',
          trialEndDate: user.trialEndDate,
        };
      }

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // ✅ 14 days trial

      await prisma.user.update({
        where: { id: userId },
        data: {
          trialEndDate,
          trialExtended: false,
          trialStartDate: new Date(),
        },
      });

      return {
        success: true,
        message: 'Trial initialized successfully',
        trialEndDate,
        trialDays: 14,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to initialize trial',
      };
    }
  }

  async renewTrial(userId: string): Promise<{
    success: boolean;
    message: string;
    newTrialEndDate?: Date;
    daysAdded?: number;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (user.trialExtended) {
        return {
          success: false,
          message: 'Trial already extended once. Maximum trial period reached.',
        };
      }

      if (!user.trialEndDate) {
        return {
          success: false,
          message: 'No active trial found. Please initialize trial first.',
        };
      }

      const newTrialEndDate = new Date(user.trialEndDate);
      newTrialEndDate.setDate(newTrialEndDate.getDate() + 7);

      await prisma.user.update({
        where: { id: userId },
        data: {
          trialEndDate: newTrialEndDate,
          trialExtended: true,
        },
      });

      return {
        success: true,
        message: 'Trial extended successfully (+7 days)',
        newTrialEndDate,
        daysAdded: 7,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to renew trial',
      };
    }
  }

  async checkTrialStatus(userId: string): Promise<{
    hasTrialActive: boolean;
    trialEndDate?: Date;
    daysRemaining?: number;
    isExpired: boolean;
    canExtend: boolean;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          trialEndDate: true,
          trialExtended: true,
        },
      });

      if (!user || !user.trialEndDate) {
        return {
          hasTrialActive: false,
          isExpired: false,
          canExtend: false,
        };
      }

      const now = new Date();
      const trialEnd = new Date(user.trialEndDate);
      const isExpired = trialEnd < now;
      const daysRemaining = Math.max(
        0,
        Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        hasTrialActive: !isExpired,
        trialEndDate: user.trialEndDate,
        daysRemaining,
        isExpired,
        canExtend: !user.trialExtended && !isExpired,
      };
    } catch (error: any) {
      throw new Error(`Failed to check trial status: ${error.message}`);
    }
  }

  async isTrialActive(userId: string): Promise<boolean> {
    const status = await this.checkTrialStatus(userId);
    return status.hasTrialActive;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default new UsageService();
