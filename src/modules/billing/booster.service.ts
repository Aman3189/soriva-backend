// src/modules/billing/booster.service.ts

/**
 * ==========================================
 * SORIVA BOOSTER SERVICE v3.1 (CLEANED)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Updated: January 15, 2026 - Studio Removed
 * 
 * FEATURES:
 * - Cooldown: 2× daily limit, uses own tokens (97% margin)
 * - Addon: Fresh pool, 7-day validity, queueing system
 * 
 * REMOVED:
 * - Studio boosters (now direct image generation in chat)
 * ==========================================
 */

import { prisma } from '../../config/prisma';
import { Region, Currency, BoosterCategory } from '@prisma/client';

import {
  PLANS_STATIC_CONFIG,
  PlanType,
  formatPrice,
  Currency as PlanCurrency,
  Region as PlansRegion,
} from '../../constants/plans';
import {
  CooldownEligibilityResult,
  CooldownPurchaseRequest,
  CooldownPurchaseResult,
  AddonAvailabilityResult,
  AddonPurchaseRequest,
  AddonPurchaseResult,
  BoosterStatus,
  BoosterStats,
  PromoBoosterRequest,
  PromoBoosterResult,
} from './booster.types';
import usageService from './usage.service';
import BrainService from '../../services/ai/brain.service';
import boosterQueueService from './booster.queue.service';

// ==========================================
// BOOSTER SERVICE CLASS
// ==========================================
function mapPrismaRegionToPlans(prismaRegion: Region): PlansRegion {
  return prismaRegion === Region.IN ? PlansRegion.INDIA : PlansRegion.INTERNATIONAL;
}

export class BoosterService {
  // ==========================================
  // COOLDOWN BOOSTER (97% MARGIN!)
  // ==========================================

  /**
   * Check cooldown booster eligibility
   * CRITICAL: User must have 2× daily limit remaining in monthly pool!
   */
  async checkCooldownEligibility(
    userId: string,
    region: Region = Region.IN
  ): Promise<CooldownEligibilityResult> {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          planType: true,
        },
      });

      if (!user) {
        return {
          eligible: false,
          reason: 'User not found',
          naturalMessage: 'Oops! Something went wrong. Please try again.',
        };
      }

      // Get plan from plans.ts
      const planType = user.planType as PlanType;
      const plan = PLANS_STATIC_CONFIG[planType];

      if (!plan?.cooldownBooster) {
        return {
          eligible: false,
          reason: 'Cooldown booster not available for plan',
          naturalMessage: `Cooldown booster isn't available on your ${plan?.displayName || 'current'} plan.`,
        };
      }

      // Get usage data
      const usage = await prisma.usage.findUnique({
        where: { userId },
        select: {
          dailyLimit: true,
          dailyWordsUsed: true,
          remainingWords: true,
        },
      });

      if (!usage) {
        return {
          eligible: false,
          reason: 'Usage data not found',
          naturalMessage: 'Unable to verify your account. Please contact support.',
        };
      }

      // Check if daily limit is hit
      const dailyRemaining = usage.dailyLimit - usage.dailyWordsUsed;
      if (dailyRemaining > 0) {
        return {
          eligible: false,
          reason: 'Daily limit not reached yet',
          naturalMessage: `You still have chat capacity for today! The cooldown booster unlocks more time after you've used your daily limit. 😊`,
        };
      }

      // Get cooldown booster details from plans.ts
      const cooldown = plan.cooldownBooster;
      const wordsUnlocked = cooldown.wordsUnlocked;
      const tokensUnlocked = cooldown.tokensUnlocked;

      // Check if enough words remain in monthly pool
      const requiredWords = planType === PlanType.STARTER 
        ? Math.floor(tokensUnlocked / 1.5)
        : wordsUnlocked;

      if (usage.remainingWords < requiredWords) {
        return {
          eligible: false,
          reason: `Insufficient monthly words (need ${requiredWords}, have ${usage.remainingWords})`,
          naturalMessage: planType === PlanType.STARTER
            ? `Your monthly capacity is running low! 😊 Consider upgrading to Plus for more capacity and smart AI routing!`
            : `You've been chatting quite a bit this month! 😊 Your monthly allocation is running low. Try an Add-on Booster instead - it gives you fresh capacity for the next 7 days!`,
        };
      }

      // Check how many cooldowns used this period
      const periodStart = new Date();
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);

      const usedCount = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: BoosterCategory.COOLDOWN,
          createdAt: { gte: periodStart },
        },
      });

      const maxAllowed = cooldown.maxPerPlanPeriod;
      
      if (usedCount >= maxAllowed) {
        return {
          eligible: false,
          reason: `Maximum ${maxAllowed} cooldown boosters per period reached`,
          naturalMessage: planType === PlanType.STARTER
            ? `You've used all ${maxAllowed} cooldown boosters this month! 🚀 Time to level up? Plus plan gives you smart AI routing and way more capacity!`
            : `You've already used your cooldown booster this month! 😊 For more capacity, check out our Add-on Booster - it gives you fresh words for 7 days!`,
        };
      }

      // Get price based on region
      const price = region === Region.INTL 
        ? (cooldown.priceUSD || cooldown.price)
        : cooldown.price;

      const currency = region === Region.INTL ? Currency.USD : Currency.INR;
      const symbol = currency === Currency.USD ? '$' : '₹';

      return {
        eligible: true,
        naturalMessage: planType === PlanType.STARTER
          ? `Great! Unlock ${wordsUnlocked.toLocaleString()} words instantly for ${symbol}${price}! 🚀`
          : `Perfect! Double your daily limit (${wordsUnlocked.toLocaleString()} words) for ${symbol}${price}! 🚀`,
        boosterDetails: {
          price,
          priceDisplay: `${symbol}${price}`,
          wordsUnlocked,
          tokensUnlocked,
          duration: cooldown.duration,
          maxPerPlanPeriod: maxAllowed,
          usedThisPeriod: usedCount,
          remainingThisPeriod: maxAllowed - usedCount,
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
   * 97% PROFIT - just unlocks existing monthly words!
   */
  async purchaseCooldownBooster(
    data: CooldownPurchaseRequest
  ): Promise<CooldownPurchaseResult> {
    try {
      const region = data.region || Region.IN;
      const currency = data.currency || (region === Region.IN ? Currency.INR : Currency.USD);

      // Check eligibility
      const eligibility = await this.checkCooldownEligibility(data.userId, region);
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
        select: { planType: true },
      });

      const planType = user?.planType as PlanType;
      const plan = PLANS_STATIC_CONFIG[planType];

      if (!plan?.cooldownBooster) {
        return {
          success: false,
          message: 'Cooldown booster not available',
          naturalMessage: 'This booster is not available for your plan.',
        };
      }

      const cooldown = plan.cooldownBooster;
      const price = region === Region.INTL ? (cooldown.priceUSD || cooldown.price) : cooldown.price;
      const wordsUnlocked = eligibility.boosterDetails!.wordsUnlocked;

      // Calculate expiry (instant for cooldown - just resets daily usage)
      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);

      // Create booster record
      const booster = await prisma.booster.create({
        data: {
          userId: data.userId,
          boosterCategory: BoosterCategory.COOLDOWN,
          boosterType: `${planType}_cooldown`,
          boosterName: `${plan.displayName} Cooldown Booster`,
          boosterPrice: Math.round(price * 100),
          region,
          currency: currency as any,
          wordsUnlocked,
          cooldownDuration: cooldown.duration,
          maxPerPlanPeriod: cooldown.maxPerPlanPeriod,
          cooldownEnd: expiresAt,
          wordsAdded: null,
          creditsAdded: null,
          validity: null,
          distributionLogic: null,
          wordsUsed: 0,
          wordsRemaining: null,
          creditsUsed: 0,
          creditsRemaining: null,
          status: BoosterStatus.ACTIVE,
          expiresAt,
          paymentGateway: data.paymentMethod,
          gatewayPaymentId: data.transactionId,
          planName: planType,
          description: `Cooldown booster - unlocks ${wordsUnlocked} words until end of day`,
        },
      });

      // Reset daily usage (cooldown effect)
      await usageService.resetDailyUsage(data.userId);

      // Get new daily limit after reset
      const updatedUsage = await prisma.usage.findUnique({
        where: { userId: data.userId },
        select: { dailyLimit: true },
      });

      // Record session (optional)
      try {
        await BrainService.recordSession(data.userId);
      } catch (brainError) {
        console.warn('[BoosterService] Brain tracking failed:', brainError);
      }

      const symbol = currency === Currency.USD ? '$' : '₹';

      return {
        success: true,
        message: 'Cooldown booster activated successfully',
        naturalMessage: `Perfect! Your daily limit has been reset! You can now continue with ${wordsUnlocked.toLocaleString()} words available. 🚀`,
        booster,
        wordsUnlocked,
        expiresAt,
        newDailyLimit: updatedUsage?.dailyLimit,
      };
    } catch (error: any) {
      console.error('[BoosterService] Cooldown purchase failed:', error);
      return {
        success: false,
        message: error.message || 'Purchase failed',
        naturalMessage: 'Something went wrong with your purchase. Please try again or contact support.',
      };
    }
  }

  // ==========================================
  // ADDON BOOSTER (FRESH POOL + QUEUEING)
  // ==========================================

  /**
   * Check addon booster availability
   * Addon is ALWAYS available (shows queue status)
   */
  async checkAddonAvailability(
    userId: string,
    region: Region = Region.IN
  ): Promise<AddonAvailabilityResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true },
      });

      if (!user) {
        return {
          eligible: false,
          reason: 'User not found',
          naturalMessage: 'Oops! Something went wrong. Please try again.',
        };
      }

      const planType = user.planType as PlanType;
      const plan = PLANS_STATIC_CONFIG[planType];

      if (!plan?.addonBooster) {
        return {
          eligible: false,
          reason: 'Addon booster not available for plan',
          naturalMessage: `Add-on booster isn't available on your ${plan?.displayName || 'current'} plan.`,
        };
      }

      // Check queue status
      const queueStatus = await boosterQueueService.checkAddonQueue(userId);
      const addon = plan.addonBooster;

      // Get price based on region
      const price = region === Region.INTL ? (addon.priceUSD || addon.price) : addon.price;
      const currency = region === Region.INTL ? Currency.USD : Currency.INR;
      const symbol = currency === Currency.USD ? '$' : '₹';

      // Calculate words from tokens
      const totalWords = Math.floor(addon.totalTokens / 1.5);
      const dailyBoostWords = Math.floor(totalWords / addon.validity);

      let naturalMessage = '';
      if (!queueStatus.canPurchaseMore) {
        naturalMessage = `You've reached the maximum of ${queueStatus.maxPerMonth} addon boosters this month! They'll reset next month. 😊`;
      } else if (queueStatus.hasActiveAddon) {
        naturalMessage = `You have an active addon! This purchase will queue and automatically start when your current one ends. 🎯`;
      } else {
        naturalMessage = `Get ${totalWords.toLocaleString()} fresh words spread over ${addon.validity} days for ${symbol}${price}! 🎉`;
      }

      return {
        eligible: true,
        naturalMessage,
        boosterDetails: {
          price,
          priceDisplay: `${symbol}${price}`,
          totalTokens: addon.totalTokens,
          totalWords,
          creditsAdded: addon.costs?.ai || 0,
          dailyBoost: addon.dailyBoost,
          dailyBoostWords,
          validity: addon.validity,
          maxPerMonth: addon.maxPerMonth,
          activeCount: queueStatus.hasActiveAddon ? 1 : 0,
          queuedCount: queueStatus.queuedBoosters.length,
          canPurchase: queueStatus.canPurchaseMore,
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
   * Uses queue system - max 2/month
   */
  async purchaseAddonBooster(
    data: AddonPurchaseRequest
  ): Promise<AddonPurchaseResult> {
    try {
      const region = data.region || Region.IN;
      const currency = data.currency || (region === Region.IN ? Currency.INR : Currency.USD);

      // Check availability
      const availability = await this.checkAddonAvailability(data.userId, region);
      if (!availability.eligible) {
        return {
          success: false,
          message: availability.reason || 'Not available',
          naturalMessage: availability.naturalMessage,
          status: 'active',
        };
      }

      if (!availability.boosterDetails?.canPurchase) {
        return {
          success: false,
          message: 'Maximum addon boosters per month reached',
          naturalMessage: `You've already purchased ${availability.boosterDetails?.maxPerMonth} addon boosters this month! 😊`,
          status: 'active',
        };
      }

      // Get user and plan
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { planType: true },
      });

      const planType = user?.planType as PlanType;
      const plan = PLANS_STATIC_CONFIG[planType];

      if (!plan?.addonBooster) {
        return {
          success: false,
          message: 'Addon booster not available',
          naturalMessage: 'This booster is not available for your plan.',
          status: 'active',
        };
      }

      const addon = plan.addonBooster;
      const price = region === Region.INTL ? (addon.priceUSD || addon.price) : addon.price;
      const totalWords = Math.floor(addon.totalTokens / 1.5);

      // Add to queue (handles activation vs queueing logic)
      const queueResult = await boosterQueueService.addToQueue({
        userId: data.userId,
        boosterType: `${planType}_addon`,
        boosterName: `${plan.displayName} Add-on Booster`,
        boosterPrice: price,
        wordsAdded: totalWords,
        creditsAdded: 0,
        validity: addon.validity,
        planName: planType,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        region,
        currency: currency as any,
      });

      if (!queueResult.success) {
        return {
          success: false,
          message: queueResult.message,
          naturalMessage: queueResult.message,
          status: 'active',
        };
      }

      // Add bonus words if active immediately
      if (queueResult.status === 'active') {
        await usageService.addBonusWords(data.userId, totalWords);
      }

      // Record session
      try {
        await BrainService.recordSession(data.userId);
      } catch (brainError) {
        console.warn('[BoosterService] Brain tracking failed:', brainError);
      }

      const symbol = currency === Currency.USD ? '$' : '₹';
      const dailyBoostWords = Math.floor(totalWords / addon.validity);

      let naturalMessage = '';
      if (queueResult.status === 'active') {
        naturalMessage = `Awesome! ${totalWords.toLocaleString()} fresh words added for the next ${addon.validity} days! (${dailyBoostWords.toLocaleString()} per day) 🎉`;
      } else {
        const startDate = queueResult.startsAt.toLocaleDateString();
        naturalMessage = `Your addon is queued! It will automatically activate on ${startDate} when your current one ends. 🎯`;
      }

      return {
        success: true,
        message: queueResult.message,
        naturalMessage,
        booster: queueResult.booster,
        wordsAdded: totalWords,
        creditsAdded: 0,
        dailyBoost: dailyBoostWords,
        validity: addon.validity,
        expiresAt: queueResult.endsAt,
        startsAt: queueResult.startsAt,
        queuePosition: queueResult.queuePosition,
        status: queueResult.status,
      };
    } catch (error: any) {
      console.error('[BoosterService] Addon purchase failed:', error);
      return {
        success: false,
        message: error.message || 'Purchase failed',
        naturalMessage: 'Something went wrong with your purchase. Please try again or contact support.',
        status: 'active',
      };
    }
  }

  // ==========================================
  // QUERY METHODS
  // ==========================================

  /**
   * Get active boosters for user
   */
  async getActiveBoosters(userId: string) {
    try {
      const now = new Date();

      const boosters = await prisma.booster.findMany({
        where: {
          userId,
          status: BoosterStatus.ACTIVE,
          OR: [
            { expiresAt: { gte: now } },
            { activatedAt: { gt: now } },
          ],
        },
        orderBy: { activatedAt: 'desc' },
      });

      return boosters.map((booster) => ({
        ...booster,
        isQueued: booster.activatedAt > now,
        isActive: booster.activatedAt <= now && booster.expiresAt >= now,
        hoursRemaining: Math.ceil(
          (booster.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
        ),
        daysRemaining: Math.ceil(
          (booster.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
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
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('[BoosterService] Failed to get booster history:', error);
      return [];
    }
  }

  // ==========================================
  // ADMIN METHODS
  // ==========================================

  /**
   * Expire old boosters (cron job)
   */
  async expireOldBoosters(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const now = new Date();

      const result = await prisma.booster.updateMany({
        where: {
          expiresAt: { lte: now },
          status: BoosterStatus.ACTIVE,
          activatedAt: { lte: now },
        },
        data: { status: BoosterStatus.EXPIRED },
      });

      console.log(`[BoosterService] Expired ${result.count} boosters`);

      // Also process addon queue
      await boosterQueueService.processQueue();

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
          status: BoosterStatus.ACTIVE,
          expiresAt: { gte: new Date() },
        },
      });

      const expiredBoosters = await prisma.booster.count({
        where: { status: BoosterStatus.EXPIRED },
      });

      // By category
      const cooldownRevenue = await prisma.booster.aggregate({
        where: { boosterCategory: BoosterCategory.COOLDOWN },
        _sum: { boosterPrice: true },
      });

      const cooldownCount = await prisma.booster.count({
        where: { boosterCategory: BoosterCategory.COOLDOWN },
      });

      const addonRevenue = await prisma.booster.aggregate({
        where: { boosterCategory: BoosterCategory.ADDON },
        _sum: { boosterPrice: true },
      });

      const addonCount = await prisma.booster.count({
        where: { boosterCategory: BoosterCategory.ADDON },
      });

      // By region
      const indiaRevenue = await prisma.booster.aggregate({
        where: { region: Region.IN },
        _sum: { boosterPrice: true },
      });

      const intlRevenue = await prisma.booster.aggregate({
        where: { region: Region.INTL },
        _sum: { boosterPrice: true },
      });

      // By plan
      const boostersByPlan = await prisma.booster.groupBy({
        by: ['planName'],
        _count: true,
        _sum: { boosterPrice: true },
      });

      // By type
      const boostersByType = await prisma.booster.groupBy({
        by: ['boosterType'],
        _count: true,
        _sum: { boosterPrice: true },
      });

      const totalRevenueINR = (boosterRevenue._sum.boosterPrice || 0) / 100;

      return {
        totalBoosters,
        totalRevenue: totalRevenueINR,
        totalRevenueINR,
        totalRevenueUSD: totalRevenueINR * 0.012,
        activeBoosters,
        expiredBoosters,
        cooldownCount,
        cooldownRevenue: (cooldownRevenue._sum.boosterPrice || 0) / 100,
        cooldownMargin: 97.7,
        addonCount,
        addonRevenue: (addonRevenue._sum.boosterPrice || 0) / 100,
        addonMargin: 66,
        indiaRevenue: (indiaRevenue._sum.boosterPrice || 0) / 100,
        internationalRevenue: (intlRevenue._sum.boosterPrice || 0) / 100,
        boostersByPlan: boostersByPlan.map(b => ({
          planName: b.planName,
          count: b._count,
          revenue: (b._sum.boosterPrice || 0) / 100,
        })),
        boostersByType: boostersByType.map(b => ({
          boosterType: b.boosterType,
          count: b._count,
          revenue: (b._sum.boosterPrice || 0) / 100,
        })),
      };
    } catch (error) {
      console.error('[BoosterService] Failed to get booster stats:', error);
      throw error;
    }
  }

  /**
   * Apply promotional booster (admin/marketing)
   */
  async applyPromoBooster(data: PromoBoosterRequest): Promise<PromoBoosterResult> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.validityDays);

      const boosters = await Promise.all(
        data.userIds.map(async (userId) => {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { planType: true },
          });

          return await prisma.booster.create({
            data: {
              userId,
              boosterCategory: data.boosterCategory,
              boosterType: 'promo',
              boosterName: `Promotional Booster - ${data.reason}`,
              boosterPrice: 0,
              region: Region.IN,
              currency: Currency.INR,
              wordsUnlocked: null,
              cooldownDuration: null,
              maxPerPlanPeriod: null,
              cooldownEnd: null,
              wordsAdded: data.wordsAdded || 0,
              creditsAdded: 0,
              validity: data.validityDays,
              wordsUsed: 0,
              wordsRemaining: data.wordsAdded || 0,
              creditsUsed: 0,
              creditsRemaining: 0,
              status: BoosterStatus.ACTIVE,
              expiresAt,
              paymentGateway: 'promo',
              planName: user?.planType || PlanType.STARTER,
              description: `Promo: ${data.reason}`,
            },
          });
        })
      );

      // Add words to users
      await Promise.all(
        data.userIds.map(async (userId) => {
          if (data.wordsAdded) {
            await usageService.addBonusWords(userId, data.wordsAdded);
          }
        })
      );

      return {
        success: true,
        message: `Applied promo booster to ${data.userIds.length} users`,
        naturalMessage: `Promo applied! ${data.wordsAdded?.toLocaleString() || 0} words added to ${data.userIds.length} users.`,
        boosters,
        totalUsers: data.userIds.length,
        totalWordsAdded: data.wordsAdded,
      };
    } catch (error: any) {
      console.error('[BoosterService] Failed to apply promo booster:', error);
      return {
        success: false,
        message: error.message || 'Failed to apply promo booster',
        totalUsers: 0,
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STARTER PLAN BOOSTER METHODS
  // Cooldown: ₹9 India | FREE International (1x/month)
  // Addon: ₹49 India | $1 International (5x/month)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check STARTER addon booster availability
   */
  async checkStarterAddonAvailability(
    userId: string,
    region: Region = Region.IN
  ): Promise<{
    eligible: boolean;
    reason?: string;
    naturalMessage: string;
    boosterDetails?: {
      price: number;
      priceDisplay: string;
      totalTokens: number;
      maxPerMonth: number;
      purchasedThisMonth: number;
      remainingPurchases: number;
      canPurchase: boolean;
    };
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true },
      });

      if (!user || user.planType !== PlanType.STARTER) {
        return {
          eligible: false,
          reason: 'Not a STARTER plan user',
          naturalMessage: 'This addon is only available for STARTER plan users.',
        };
      }

      const plan = PLANS_STATIC_CONFIG[PlanType.STARTER];
      const addon = plan.addonBooster;

      if (!addon) {
        return {
          eligible: false,
          reason: 'Addon booster not configured',
          naturalMessage: 'Addon booster is not available right now.',
        };
      }

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const purchasedThisMonth = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: BoosterCategory.ADDON,
          createdAt: { gte: monthStart },
        },
      });

      const maxPerMonth = addon.maxPerMonth ?? 5;
      const canPurchase = purchasedThisMonth < maxPerMonth;

      const price = region === Region.INTL ? (addon.priceUSD ?? 1) : addon.price;
      const totalTokens = region === Region.INTL 
        ? (addon.totalTokensInternational ?? 300000) 
        : addon.totalTokens;
      const currency = region === Region.INTL ? Currency.USD : Currency.INR;
      const symbol = currency === Currency.USD ? '$' : '₹';

      let naturalMessage = '';
      if (!canPurchase) {
        naturalMessage = `You've used all ${maxPerMonth} Token Boosts this month! 🎯 They'll reset next month, or upgrade to Plus for more options!`;
      } else {
        naturalMessage = `Get ${totalTokens.toLocaleString()} extra tokens for ${symbol}${price}! Use them anytime this month. 🚀`;
      }

      return {
        eligible: true,
        naturalMessage,
        boosterDetails: {
          price,
          priceDisplay: `${symbol}${price}`,
          totalTokens,
          maxPerMonth,
          purchasedThisMonth,
          remainingPurchases: maxPerMonth - purchasedThisMonth,
          canPurchase,
        },
      };
    } catch (error) {
      console.error('[BoosterService] STARTER addon availability check failed:', error);
      return {
        eligible: false,
        reason: 'System error',
        naturalMessage: 'Something went wrong. Please try again later.',
      };
    }
  }

  /**
   * Purchase STARTER addon booster
   */
  async purchaseStarterAddonBooster(data: {
    userId: string;
    region?: Region;
    currency?: Currency;
    paymentMethod: string;
    transactionId: string;
  }): Promise<{
    success: boolean;
    message: string;
    naturalMessage: string;
    booster?: any;
    tokensAdded?: number;
    expiresAt?: Date;
    purchaseNumber?: number;
    remainingPurchases?: number;
  }> {
    try {
      const region = data.region ?? Region.IN;
      const currency = data.currency ?? (region === Region.IN ? Currency.INR : Currency.USD);

      const availability = await this.checkStarterAddonAvailability(data.userId, region);
      
      if (!availability.eligible) {
        return {
          success: false,
          message: availability.reason ?? 'Not available',
          naturalMessage: availability.naturalMessage,
        };
      }

      if (!availability.boosterDetails?.canPurchase) {
        return {
          success: false,
          message: 'Maximum addon boosters per month reached',
          naturalMessage: availability.naturalMessage,
        };
      }

      const plan = PLANS_STATIC_CONFIG[PlanType.STARTER];
      const addon = plan.addonBooster;
      
      if (!addon) {
        return {
          success: false,
          message: 'Addon not configured',
          naturalMessage: 'Addon booster is not available right now.',
        };
      }

      const price = region === Region.INTL ? (addon.priceUSD ?? 1) : addon.price;
      const totalTokens = region === Region.INTL 
        ? (addon.totalTokensInternational ?? 300000) 
        : addon.totalTokens;
      const addonValidity = addon.validity ?? 7;
      const addonMaxPerMonth = addon.maxPerMonth ?? 5;

      const now = new Date();
      const expiresAt = new Date(now.getTime() + addonValidity * 24 * 60 * 60 * 1000);

      const purchaseNumber = (availability.boosterDetails?.purchasedThisMonth ?? 0) + 1;

      const booster = await prisma.booster.create({
        data: {
          userId: data.userId,
          boosterCategory: BoosterCategory.ADDON,
          boosterType: 'starter_addon',
          boosterName: 'Starter Boost',
          boosterPrice: price * 100,
          region,
          currency,
          wordsUnlocked: null,
          cooldownDuration: null,
          cooldownEnd: null,
          maxPerPlanPeriod: addonMaxPerMonth,
          wordsAdded: Math.floor(totalTokens / 1.5),
          creditsAdded: totalTokens,
          validity: addonValidity,
          wordsUsed: 0,
          wordsRemaining: Math.floor(totalTokens / 1.5),
          creditsUsed: 0,
          creditsRemaining: totalTokens,
          purchaseNumber,
          status: BoosterStatus.ACTIVE,
          activatedAt: now,
          expiresAt,
          paymentGateway: data.paymentMethod,
          gatewayPaymentId: data.transactionId,
          planName: PlanType.STARTER,
          description: `STARTER Token Boost #${purchaseNumber} - ${totalTokens.toLocaleString()} tokens`,
        },
      });

      return {
        success: true,
        message: 'Starter Boost activated successfully',
        naturalMessage: `Awesome! ${totalTokens.toLocaleString()} extra tokens added for ${addonValidity} days! 🚀`,
        booster,
        tokensAdded: totalTokens,
        expiresAt,
        purchaseNumber,
        remainingPurchases: addonMaxPerMonth - purchaseNumber,
      };
    } catch (error: any) {
      console.error('[BoosterService] STARTER addon purchase failed:', error);
      return {
        success: false,
        message: error.message ?? 'Purchase failed',
        naturalMessage: 'Something went wrong with your purchase. Please try again or contact support.',
      };
    }
  }

  /**
   * Check STARTER cooldown eligibility
   */
  async checkStarterCooldownEligibility(
    userId: string,
    region: Region = Region.IN
  ): Promise<{
    eligible: boolean;
    reason?: string;
    naturalMessage: string;
    boosterDetails?: {
      price: number;
      priceDisplay: string;
      isFree: boolean;
      tokensUnlocked: number;
      maxPerMonth: number;
      usedThisMonth: number;
      remainingThisMonth: number;
    };
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true },
      });

      if (!user || user.planType !== PlanType.STARTER) {
        return {
          eligible: false,
          reason: 'Not a STARTER plan user',
          naturalMessage: 'This feature is only for STARTER plan users.',
        };
      }

      const plan = PLANS_STATIC_CONFIG[PlanType.STARTER];
      const cooldown = plan.cooldownBooster;

      if (!cooldown) {
        return {
          eligible: false,
          reason: 'Cooldown booster not configured',
          naturalMessage: 'Cooldown booster is not available right now.',
        };
      }

      const usage = await prisma.usage.findUnique({
        where: { userId },
        select: {
          dailyTokenLimit: true,
          dailyTokensUsed: true,
          dailyTokensRemaining: true,
          premiumTokensRemaining: true,
        },
      });

      if (!usage) {
        return {
          eligible: false,
          reason: 'Usage data not found',
          naturalMessage: 'Unable to verify your account. Please contact support.',
        };
      }

      if (usage.dailyTokensRemaining > 0) {
        return {
          eligible: false,
          reason: 'Daily limit not reached yet',
          naturalMessage: `You still have ${usage.dailyTokensRemaining.toLocaleString()} tokens for today! The Daily Unlock becomes available when you hit your daily limit. 😊`,
        };
      }

      if (usage.premiumTokensRemaining < usage.dailyTokenLimit) {
        return {
          eligible: false,
          reason: 'Insufficient monthly tokens',
          naturalMessage: `Your monthly tokens are running low! 😊 Try a Token Boost instead!`,
        };
      }

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const usedThisMonth = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: BoosterCategory.COOLDOWN,
          createdAt: { gte: monthStart },
        },
      });

      const maxPerMonth = cooldown.maxPerPlanPeriod ?? 1;

      if (usedThisMonth >= maxPerMonth) {
        return {
          eligible: false,
          reason: `Maximum ${maxPerMonth} Daily Unlock per month reached`,
          naturalMessage: `You've already used your Daily Unlock this month! 🎯 Try a Token Boost for extra capacity, or upgrade to Plus!`,
        };
      }

      const price = region === Region.INTL ? (cooldown.priceUSD ?? 0) : cooldown.price;
      const isFree = region === Region.INTL && price === 0;
      const symbol = region === Region.INTL ? '$' : '₹';

      return {
        eligible: true,
        naturalMessage: isFree 
          ? `Unlock your daily limit for FREE! 🎁 Continue chatting using your monthly tokens.`
          : `Unlock your daily limit for ${symbol}${price}! Continue chatting using your monthly tokens. 🚀`,
        boosterDetails: {
          price,
          priceDisplay: isFree ? 'FREE' : `${symbol}${price}`,
          isFree,
          tokensUnlocked: usage.dailyTokenLimit,
          maxPerMonth,
          usedThisMonth,
          remainingThisMonth: maxPerMonth - usedThisMonth,
        },
      };
    } catch (error) {
      console.error('[BoosterService] STARTER cooldown eligibility check failed:', error);
      return {
        eligible: false,
        reason: 'System error',
        naturalMessage: 'Something went wrong. Please try again later.',
      };
    }
  }

  /**
   * Activate FREE cooldown for international STARTER users
   */
  async activateFreeStarterCooldown(
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    naturalMessage: string;
    booster?: any;
    tokensUnlocked?: number;
    expiresAt?: Date;
  }> {
    try {
      const eligibility = await this.checkStarterCooldownEligibility(userId, Region.INTL);
      
      if (!eligibility.eligible) {
        return {
          success: false,
          message: eligibility.reason ?? 'Not eligible',
          naturalMessage: eligibility.naturalMessage,
        };
      }

      if (!eligibility.boosterDetails?.isFree) {
        return {
          success: false,
          message: 'Free cooldown only for international users',
          naturalMessage: 'Please use the paid cooldown option.',
        };
      }

      const plan = PLANS_STATIC_CONFIG[PlanType.STARTER];
      const cooldown = plan.cooldownBooster;
      const cooldownMaxPerPlanPeriod = cooldown?.maxPerPlanPeriod ?? 1;

      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);

      const tokensUnlocked = eligibility.boosterDetails?.tokensUnlocked ?? 0;

      const booster = await prisma.booster.create({
        data: {
          userId,
          boosterCategory: BoosterCategory.COOLDOWN,
          boosterType: 'starter_cooldown_free',
          boosterName: 'Daily Unlock (Free)',
          boosterPrice: 0,
          region: Region.INTL,
          currency: Currency.USD,
          wordsUnlocked: tokensUnlocked,
          cooldownDuration: 0,
          maxPerPlanPeriod: cooldownMaxPerPlanPeriod,
          cooldownEnd: expiresAt,
          wordsAdded: null,
          creditsAdded: null,
          validity: null,
          wordsUsed: 0,
          wordsRemaining: null,
          creditsUsed: 0,
          creditsRemaining: null,
          status: BoosterStatus.ACTIVE,
          expiresAt,
          paymentGateway: 'free',
          gatewayPaymentId: `free_${Date.now()}`,
          planName: PlanType.STARTER,
          description: 'FREE Daily Unlock for international STARTER user',
        },
      });

      await usageService.resetDailyUsage(userId);

      return {
        success: true,
        message: 'Daily Unlock activated successfully',
        naturalMessage: `Done! Your daily limit has been reset for FREE! 🎁 Enjoy chatting!`,
        booster,
        tokensUnlocked,
        expiresAt,
      };
    } catch (error: any) {
      console.error('[BoosterService] Free cooldown activation failed:', error);
      return {
        success: false,
        message: error.message ?? 'Activation failed',
        naturalMessage: 'Something went wrong. Please try again.',
      };
    }
  }

  /**
   * Purchase STARTER cooldown (India - ₹9)
   */
  async purchaseStarterCooldown(data: {
    userId: string;
    paymentMethod: string;
    transactionId: string;
  }): Promise<{
    success: boolean;
    message: string;
    naturalMessage: string;
    booster?: any;
    tokensUnlocked?: number;
    expiresAt?: Date;
  }> {
    try {
      const eligibility = await this.checkStarterCooldownEligibility(data.userId, Region.IN);
      
      if (!eligibility.eligible) {
        return {
          success: false,
          message: eligibility.reason ?? 'Not eligible',
          naturalMessage: eligibility.naturalMessage,
        };
      }

      const plan = PLANS_STATIC_CONFIG[PlanType.STARTER];
      const cooldown = plan.cooldownBooster;

      if (!cooldown) {
        return {
          success: false,
          message: 'Cooldown not configured',
          naturalMessage: 'Cooldown booster is not available right now.',
        };
      }

      const cooldownPrice = cooldown.price;
      const cooldownMaxPerPlanPeriod = cooldown.maxPerPlanPeriod ?? 1;
      const tokensUnlocked = eligibility.boosterDetails?.tokensUnlocked ?? 0;

      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);

      const booster = await prisma.booster.create({
        data: {
          userId: data.userId,
          boosterCategory: BoosterCategory.COOLDOWN,
          boosterType: 'starter_cooldown',
          boosterName: 'Daily Unlock',
          boosterPrice: cooldownPrice * 100,
          region: Region.IN,
          currency: Currency.INR,
          wordsUnlocked: tokensUnlocked,
          cooldownDuration: 0,
          maxPerPlanPeriod: cooldownMaxPerPlanPeriod,
          cooldownEnd: expiresAt,
          wordsAdded: null,
          creditsAdded: null,
          validity: null,
          wordsUsed: 0,
          wordsRemaining: null,
          creditsUsed: 0,
          creditsRemaining: null,
          status: BoosterStatus.ACTIVE,
          expiresAt,
          paymentGateway: data.paymentMethod,
          gatewayPaymentId: data.transactionId,
          planName: PlanType.STARTER,
          description: 'Daily Unlock for STARTER user',
        },
      });

      await usageService.resetDailyUsage(data.userId);

      return {
        success: true,
        message: 'Daily Unlock activated successfully',
        naturalMessage: `Done! Your daily limit has been reset! 🚀 Enjoy chatting!`,
        booster,
        tokensUnlocked,
        expiresAt,
      };
    } catch (error: any) {
      console.error('[BoosterService] Cooldown purchase failed:', error);
      return {
        success: false,
        message: error.message ?? 'Purchase failed',
        naturalMessage: 'Something went wrong. Please try again.',
      };
    }
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export default new BoosterService();