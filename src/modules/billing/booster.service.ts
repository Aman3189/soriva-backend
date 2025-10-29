// src/modules/billing/booster.service.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA BACKEND - BOOSTER SERVICE (SCHEMA ALIGNED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Purpose: Cooldown & Add-on booster purchase logic
// Updated: October 28, 2025 (Evening - maxPerDay → maxPerPlanPeriod)
//
// Schema Notes:
// - boosterPrice: Int (stored in PAISE, not rupees)
// - Cooldown: uses wordsUnlocked field
// - Addon: uses wordsAdded field
// - Both categories have separate tracking fields
// - maxPerPlanPeriod: Max 2 cooldown boosters per plan period
//
// Features:
// - Cooldown booster: 2x daily limit unlock (100% profit!)
// - Add-on booster: Fresh words + credits (separate pool)
// - Eligibility validation
// - Payment integration ready
// - Natural language responses
//
// Changes (October 28 Evening):
// - ✅ FIXED: maxPerDay → maxPerPlanPeriod (aligned with schema)
// - ✅ FIXED: Cooldown max set to 2 per plan period
// - ✅ FIXED: Addon boosters have no limit (null)
//
// Previous Changes (Session 2):
// - FIXED: Import from new constants structure
// - FIXED: All plan lookups using plansManager
// - FIXED: Removed all 4 hardcoded 'vibe_free' fallbacks
// - MAINTAINED: Class-based structure (100%)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants'; // ✅ FIXED: New import structure
import usageService from './usage.service';
import BrainService from '../../services/brain.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  naturalMessage?: string; // For user-facing messages
  boosterDetails?: {
    price: number; // In rupees (will be converted to paise for DB)
    wordsUnlocked?: number; // For cooldown
    wordsAdded?: number; // For addon
    creditsAdded?: number;
    duration?: number; // hours
    validity?: number; // days
    maxPerPlanPeriod?: number; // Max cooldown boosters per plan period (e.g., 2)
  };
}

interface PurchaseResult {
  success: boolean;
  message: string;
  naturalMessage?: string; // For user-facing messages
  booster?: any;
  wordsAdded?: number;
  creditsAdded?: number;
  expiresAt?: Date;
}

interface BoosterStats {
  totalBoosters: number;
  totalRevenue: number;
  activeBoosters: number;
  boostersByType: Array<{
    boosterType: string;
    _count: number;
    _sum: { boosterPrice: number | null };
  }>;
  cooldownRevenue: number; // 100% profit
  addonRevenue: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOOSTER SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class BoosterService {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COOLDOWN BOOSTER (100% PROFIT - UNLOCKS DAILY LIMIT)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check cooldown booster eligibility
   * CRITICAL: User must have 2x daily limit remaining in monthly pool!
   */
  async checkCooldownEligibility(userId: string): Promise<EligibilityResult> {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          eligible: false,
          reason: 'User not found',
          naturalMessage: 'Oops! Something went wrong. Please try again.',
        };
      }

      // Get usage data
      const usage = await prisma.usage.findUnique({
        where: { userId },
      });

      if (!usage) {
        return {
          eligible: false,
          reason: 'Usage data not found',
          naturalMessage: 'Unable to verify your account. Please contact support.',
        };
      }

      // ✅ FIXED: Get plan details using plansManager
      const plan = user.subscriptionPlan ? plansManager.getPlanByName(user.subscriptionPlan) : null;
      if (!plan?.cooldownBooster) {
        return {
          eligible: false,
          reason: 'Cooldown booster not available for plan',
          naturalMessage: `Cooldown booster isn't available on your ${plan?.displayName || 'current'} plan.`,
        };
      }

      // ⭐ CRITICAL CHECK: 2x daily limit requirement
      const cooldownRequirement = usage.dailyLimit * 2;
      const hasEnoughWords = usage.remainingWords >= cooldownRequirement;

      if (!hasEnoughWords) {
        return {
          eligible: false,
          reason: `Insufficient monthly words (need ${cooldownRequirement}, have ${usage.remainingWords})`,
          naturalMessage: `You've been chatting quite a bit this month! 😊 Your monthly allocation is running low. I'd recommend trying an Add-on Booster instead - it gives you fresh capacity for the next ${plan.addonBooster?.validity} days!`,
        };
      }

      // Check if daily limit is actually hit
      const dailyRemaining = usage.dailyLimit - usage.dailyWordsUsed;
      if (dailyRemaining > 0) {
        return {
          eligible: false,
          reason: 'Daily limit not reached yet',
          naturalMessage: `You still have chat capacity for today! The cooldown booster unlocks more time after you've used your daily limit. 😊`,
        };
      }

      // Check if already purchased today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingBooster = await prisma.booster.findFirst({
        where: {
          userId,
          boosterCategory: 'COOLDOWN', // Updated field name
          activatedAt: { gte: today },
          status: 'active',
        },
      });

      if (existingBooster) {
        return {
          eligible: false,
          reason: 'Cooldown already used today',
          naturalMessage: `You've already unlocked your daily limit once today! 😊 For more capacity, check out our Add-on Booster - it gives you ${plan.addonBooster?.wordsAdded.toLocaleString()} fresh words for ${plan.addonBooster?.validity} days!`,
        };
      }

      // ✅ ELIGIBLE!
      return {
        eligible: true,
        naturalMessage: `Great! You can unlock 2x your daily limit (${cooldownRequirement.toLocaleString()} words) for the next 24 hours! 🚀`,
        boosterDetails: {
          price: plan.cooldownBooster.price,
          wordsUnlocked: cooldownRequirement, // 2x daily limit
          duration: 24, // hours
          maxPerPlanPeriod: 2,
        },
      };
    } catch (error) {
      console.error('[BoosterService] Cooldown eligibility check failed:', error);
      return {
        eligible: false,
        reason: 'System error',
        naturalMessage: 'Something went wrong. Please try again later.',
      };
    }
  }

  /**
   * Purchase cooldown booster
   * 100% PROFIT - just unlocks existing monthly words!
   */
  async purchaseCooldownBooster(data: {
    userId: string;
    paymentMethod: string;
    transactionId?: string;
  }): Promise<PurchaseResult> {
    try {
      // Check eligibility
      const eligibility = await this.checkCooldownEligibility(data.userId);
      if (!eligibility.eligible) {
        return {
          success: false,
          message: eligibility.reason || 'Not eligible',
          naturalMessage: eligibility.naturalMessage,
        };
      }

      // Get user and plan
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      // ✅ FIXED: Get plan using plansManager
      const plan = user?.subscriptionPlan
        ? plansManager.getPlanByName(user.subscriptionPlan)
        : null;
      if (!plan?.cooldownBooster) {
        return {
          success: false,
          message: 'Cooldown booster not available',
          naturalMessage: 'This booster is not available for your plan.',
        };
      }

      // Get usage for calculation
      const usage = await prisma.usage.findUnique({
        where: { userId: data.userId },
      });

      const wordsUnlocked = (usage?.dailyLimit || 0) * 2;

      // Calculate expiry (24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create booster record with EXACT SCHEMA FIELDS
      const booster = await prisma.booster.create({
        data: {
          userId: data.userId,

          // Classification fields
          boosterCategory: 'COOLDOWN',
          boosterType: `${user?.subscriptionPlan}_cooldown`,
          boosterName: `${plan.displayName} Cooldown Booster`,
          boosterPrice: plan.cooldownBooster.price * 100, // Convert to paise

          // Cooldown-specific fields
          wordsUnlocked: wordsUnlocked,
          cooldownDuration: 24,
          maxPerPlanPeriod: 2, // ✅ Max 2 cooldown boosters per plan period
          cooldownEnd: expiresAt,

          // Addon fields (null for cooldown)
          wordsAdded: null,
          creditsAdded: null,
          validity: null,

          // Tracking fields
          wordsUsed: 0,
          wordsRemaining: null, // Cooldown uses monthly pool
          creditsUsed: 0,
          creditsRemaining: null,

          // Status fields
          expiresAt,
          status: 'active',

          // Payment tracking
          paymentGateway: data.paymentMethod,
          gatewayPaymentId: data.transactionId,

          // Metadata
          planName: user?.subscriptionPlan || PlanType.STARTER, // ✅ FIXED: Use default plan enum
          description: `Cooldown booster - unlocks ${wordsUnlocked} words for 24h`,
        },
      });

      // Reset daily usage (cooldown effect)
      await usageService.resetDailyUsage(data.userId);

      // Record session for behavioral tracking (optional)
      try {
        await BrainService.recordSession(data.userId);
      } catch (brainError) {
        console.warn('[BoosterService] Brain service tracking failed:', brainError);
        // Non-critical, continue
      }

      // Success response with natural language
      return {
        success: true,
        message: 'Cooldown booster activated successfully',
        naturalMessage: `Perfect! Your daily limit has been unlocked for the next 24 hours! You can now continue our conversation with ${wordsUnlocked.toLocaleString()} words available. 🚀`,
        booster,
        wordsAdded: wordsUnlocked,
        creditsAdded: 0,
        expiresAt,
      };
    } catch (error: any) {
      console.error('[BoosterService] Cooldown purchase failed:', error);
      return {
        success: false,
        message: error.message || 'Purchase failed',
        naturalMessage:
          'Something went wrong with your purchase. Please try again or contact support.',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADD-ON BOOSTER (FRESH WORDS + CREDITS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check addon booster availability
   * Add-on is ALWAYS available (no eligibility restrictions)
   */
  async checkAddonAvailability(userId: string): Promise<EligibilityResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          eligible: false,
          reason: 'User not found',
          naturalMessage: 'Oops! Something went wrong. Please try again.',
        };
      }

      // ✅ FIXED: Get plan using plansManager
      const plan = user.subscriptionPlan ? plansManager.getPlanByName(user.subscriptionPlan) : null;
      if (!plan?.addonBooster) {
        return {
          eligible: false,
          reason: 'Addon booster not available for plan',
          naturalMessage: `Add-on booster isn't available on your ${plan?.displayName || 'current'} plan.`,
        };
      }

      // ✅ ADD-ON IS ALWAYS AVAILABLE!
      return {
        eligible: true,
        naturalMessage: `Great! The Add-on Booster gives you ${plan.addonBooster.wordsAdded.toLocaleString()} fresh words${plan.addonBooster.creditsAdded ? ` + ${plan.addonBooster.creditsAdded} studio credits` : ''} valid for ${plan.addonBooster.validity} days! 🎉`,
        boosterDetails: {
          price: plan.addonBooster.price,
          wordsAdded: plan.addonBooster.wordsAdded,
          creditsAdded: plan.addonBooster.creditsAdded || 0,
          validity: plan.addonBooster.validity,
        },
      };
    } catch (error) {
      console.error('[BoosterService] Addon availability check failed:', error);
      return {
        eligible: false,
        reason: 'System error',
        naturalMessage: 'Something went wrong. Please try again later.',
      };
    }
  }

  /**
   * Purchase addon booster
   * Adds FRESH words + credits (separate pool)
   */
  async purchaseAddonBooster(data: {
    userId: string;
    paymentMethod: string;
    transactionId?: string;
  }): Promise<PurchaseResult> {
    try {
      // Check availability
      const availability = await this.checkAddonAvailability(data.userId);
      if (!availability.eligible) {
        return {
          success: false,
          message: availability.reason || 'Not available',
          naturalMessage: availability.naturalMessage,
        };
      }

      // Get user and plan
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      // ✅ FIXED: Get plan using plansManager
      const plan = user?.subscriptionPlan
        ? plansManager.getPlanByName(user.subscriptionPlan)
        : null;
      if (!plan?.addonBooster) {
        return {
          success: false,
          message: 'Addon booster not available',
          naturalMessage: 'This booster is not available for your plan.',
        };
      }

      // Calculate expiry (validity days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.addonBooster.validity);

      // Create booster record with EXACT SCHEMA FIELDS
      const booster = await prisma.booster.create({
        data: {
          userId: data.userId,

          // Classification fields
          boosterCategory: 'ADDON',
          boosterType: `${user?.subscriptionPlan}_addon`,
          boosterName: `${plan.displayName} Add-on Booster`,
          boosterPrice: plan.addonBooster.price * 100, // Convert to paise

          // Cooldown fields (null for addon)
          wordsUnlocked: null,
          cooldownDuration: null,
          maxPerPlanPeriod: null, // ✅ No limit for addon boosters
          wordsAdded: plan.addonBooster.wordsAdded,
          creditsAdded: plan.addonBooster.creditsAdded || 0,
          validity: plan.addonBooster.validity,

          // Tracking fields (fresh words pool)
          wordsUsed: 0,
          wordsRemaining: plan.addonBooster.wordsAdded,
          creditsUsed: 0,
          creditsRemaining: plan.addonBooster.creditsAdded || 0,

          // Status fields
          expiresAt,
          status: 'active',

          // Payment tracking
          paymentGateway: data.paymentMethod,
          gatewayPaymentId: data.transactionId,

          // Metadata
          planName: user?.subscriptionPlan || PlanType.STARTER, // ✅ FIXED: Use default plan enum
          description: `Add-on booster - ${plan.addonBooster.wordsAdded} words + ${plan.addonBooster.creditsAdded || 0} credits for ${plan.addonBooster.validity} days`,
        },
      });

      // Add fresh words (separate pool)
      await usageService.addBonusWords(data.userId, plan.addonBooster.wordsAdded);

      // Add studio credits if applicable
      if (plan.addonBooster.creditsAdded) {
        await this.addStudioCredits(
          data.userId,
          plan.addonBooster.creditsAdded,
          user?.subscriptionPlan
        );
      }

      // Record session for behavioral tracking (optional)
      try {
        await BrainService.recordSession(data.userId);
      } catch (brainError) {
        console.warn('[BoosterService] Brain service tracking failed:', brainError);
        // Non-critical, continue
      }

      // Success response with natural language
      const creditsMessage = plan.addonBooster.creditsAdded
        ? ` + ${plan.addonBooster.creditsAdded} studio credits`
        : '';

      return {
        success: true,
        message: 'Addon booster purchased successfully',
        naturalMessage: `Awesome! You've got ${plan.addonBooster.wordsAdded.toLocaleString()} fresh words${creditsMessage} for the next ${plan.addonBooster.validity} days! Let's continue our conversation! 🎉`,
        booster,
        wordsAdded: plan.addonBooster.wordsAdded,
        creditsAdded: plan.addonBooster.creditsAdded || 0,
        expiresAt,
      };
    } catch (error: any) {
      console.error('[BoosterService] Addon purchase failed:', error);
      return {
        success: false,
        message: error.message || 'Purchase failed',
        naturalMessage:
          'Something went wrong with your purchase. Please try again or contact support.',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Add studio credits to user account
   */
  private async addStudioCredits(
    userId: string,
    creditsToAdd: number,
    planName?: string
  ): Promise<void> {
    try {
      const existingCredit = await prisma.credit.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (existingCredit) {
        await prisma.credit.update({
          where: { id: existingCredit.id },
          data: {
            totalCredits: { increment: creditsToAdd },
            remainingCredits: { increment: creditsToAdd },
          },
        });
      } else {
        await prisma.credit.create({
          data: {
            userId,
            totalCredits: creditsToAdd,
            usedCredits: 0,
            remainingCredits: creditsToAdd,
            planName: planName || PlanType.STARTER, // ✅ FIXED: Use default plan enum
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        });
      }

      console.log(`[BoosterService] Added ${creditsToAdd} credits to user ${userId}`);
    } catch (error) {
      console.error('[BoosterService] Failed to add studio credits:', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUERY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get active boosters for user
   */
  async getActiveBoosters(userId: string) {
    try {
      const boosters = await prisma.booster.findMany({
        where: {
          userId,
          status: 'active',
          expiresAt: { gte: new Date() },
        },
        orderBy: { activatedAt: 'desc' },
      });

      return boosters.map((booster) => ({
        ...booster,
        hoursRemaining: Math.ceil(
          (booster.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60)
        ),
        daysRemaining: Math.ceil(
          (booster.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
      }));
    } catch (error) {
      console.error('[BoosterService] Failed to get active boosters:', error);
      return [];
    }
  }

  /**
   * Get booster history for user
   */
  async getBoosterHistory(userId: string, limit?: number) {
    try {
      return await prisma.booster.findMany({
        where: { userId },
        orderBy: { activatedAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('[BoosterService] Failed to get booster history:', error);
      return [];
    }
  }

  /**
   * Get cooldown count for today
   */
  async getCooldownCountToday(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await prisma.booster.count({
        where: {
          userId,
          boosterCategory: 'COOLDOWN',
          activatedAt: { gte: today },
        },
      });
    } catch (error) {
      console.error('[BoosterService] Failed to get cooldown count:', error);
      return 0;
    }
  }

  /**
   * Get active addon count
   */
  async getActiveAddonCount(userId: string): Promise<number> {
    try {
      return await prisma.booster.count({
        where: {
          userId,
          boosterCategory: 'ADDON',
          status: 'active',
          expiresAt: { gte: new Date() },
        },
      });
    } catch (error) {
      console.error('[BoosterService] Failed to get active addon count:', error);
      return 0;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADMIN / MAINTENANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Expire old boosters (cron job)
   */
  async expireOldBoosters(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const result = await prisma.booster.updateMany({
        where: {
          expiresAt: { lte: new Date() },
          status: 'active',
        },
        data: { status: 'expired' },
      });

      console.log(`[BoosterService] Expired ${result.count} boosters`);

      return {
        success: true,
        count: result.count,
        message: `Expired ${result.count} boosters`,
      };
    } catch (error) {
      console.error('[BoosterService] Failed to expire boosters:', error);
      return {
        success: false,
        count: 0,
        message: 'Failed to expire boosters',
      };
    }
  }

  /**
   * Get booster statistics (admin)
   */
  async getBoosterStats(): Promise<BoosterStats> {
    try {
      const totalBoosters = await prisma.booster.count();

      const boosterRevenue = await prisma.booster.aggregate({
        _sum: { boosterPrice: true },
      });

      const activeBoosters = await prisma.booster.count({
        where: {
          status: 'active',
          expiresAt: { gte: new Date() },
        },
      });

      const boostersByType = await prisma.booster.groupBy({
        by: ['boosterType'],
        _count: true,
        _sum: { boosterPrice: true },
      });

      // Calculate cooldown revenue (100% profit!)
      const cooldownRevenue = await prisma.booster.aggregate({
        where: { boosterCategory: 'COOLDOWN' },
        _sum: { boosterPrice: true },
      });

      // Calculate addon revenue
      const addonRevenue = await prisma.booster.aggregate({
        where: { boosterCategory: 'ADDON' },
        _sum: { boosterPrice: true },
      });

      return {
        totalBoosters,
        totalRevenue: boosterRevenue._sum.boosterPrice || 0,
        activeBoosters,
        boostersByType,
        cooldownRevenue: cooldownRevenue._sum.boosterPrice || 0,
        addonRevenue: addonRevenue._sum.boosterPrice || 0,
      };
    } catch (error) {
      console.error('[BoosterService] Failed to get booster stats:', error);
      throw error;
    }
  }

  /**
   * Apply promotional booster (admin/marketing)
   */
  async applyPromoBooster(data: {
    userIds: string[];
    wordsAdded: number;
    creditsAdded?: number;
    validityDays: number;
    reason: string;
  }): Promise<PurchaseResult> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.validityDays);

      const boosters = await Promise.all(
        data.userIds.map(async (userId) => {
          // Get user first (needed for planName)
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionPlan: true },
          });

          // Create promo booster with EXACT SCHEMA FIELDS
          const booster = await prisma.booster.create({
            data: {
              userId,

              // Classification fields
              boosterCategory: 'ADDON', // Promo treated as addon
              boosterType: 'promo',
              boosterName: `Promotional Booster - ${data.reason}`,
              boosterPrice: 0, // Free

              // Cooldown fields (null for promo)
              wordsUnlocked: null,
              cooldownDuration: null,
              maxPerPlanPeriod: null,
              cooldownEnd: null,

              // Addon-specific fields
              wordsAdded: data.wordsAdded,
              creditsAdded: data.creditsAdded || 0,
              validity: data.validityDays,

              // Tracking fields
              wordsUsed: 0,
              wordsRemaining: data.wordsAdded,
              creditsUsed: 0,
              creditsRemaining: data.creditsAdded || 0,

              // Status fields
              expiresAt,
              status: 'active',

              // Payment tracking
              paymentGateway: 'promo',

              // Metadata
              planName: user?.subscriptionPlan || PlanType.STARTER, // ✅ FIXED: Use default plan enum
              description: `Promo: ${data.reason}`,
            },
          });

          // Add words
          await usageService.addBonusWords(userId, data.wordsAdded);

          // Add credits if applicable
          if (data.creditsAdded) {
            await this.addStudioCredits(userId, data.creditsAdded, user?.subscriptionPlan);
          }

          return booster;
        })
      );

      return {
        success: true,
        message: `Applied promo booster to ${data.userIds.length} users`,
        naturalMessage: `Promo applied! ${data.wordsAdded.toLocaleString()} words${data.creditsAdded ? ` + ${data.creditsAdded} credits` : ''} added to ${data.userIds.length} users.`,
        wordsAdded: data.wordsAdded,
        creditsAdded: data.creditsAdded || 0,
      };
    } catch (error: any) {
      console.error('[BoosterService] Failed to apply promo booster:', error);
      return {
        success: false,
        message: error.message || 'Failed to apply promo booster',
      };
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default new BoosterService();
