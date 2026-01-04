// src/modules/billing/booster.service.ts

/**
 * ==========================================
 * SORIVA BOOSTER SERVICE v3.0 (REFACTORED)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Updated: November 21, 2025 - Aligned with Plans.ts v3.0
 * 
 * CRITICAL FIXES:
 * ✅ Studio credits: 420/1695/2545 (IN) | 1050/4237/6362 (INTL)
 * ✅ Cooldown limits: 5 for STARTER, 1 for others
 * ✅ Region detection & international pricing
 * ✅ Addon queueing (max 2/month)
 * ✅ Schema-compliant field names (wordsUnlocked not tokensUnlocked)
 * ✅ Natural language messages
 * ✅ Plans.ts v3.0 100% aligned
 * 
 * FEATURES:
 * - Cooldown: 2× daily limit, uses own tokens (97% margin)
 * - Addon: Fresh pool, 7-day validity, queueing system
 * - Studio: Region-specific credits, 83-88% margin
 * ==========================================
 */

import { prisma } from '../../config/prisma';
import { Region, Currency, BoosterCategory, StudioBoosterType } from '@prisma/client';

import {
  PLANS_STATIC_CONFIG,
  STUDIO_BOOSTERS,
  PlanType,
  getStudioBoosterPricing,
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
  StudioPurchaseRequest,
  StudioPurchaseResult,
  StudioPackageInfo,
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
          subscriptionPlan: true,
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
      const planType = user.subscriptionPlan as PlanType;
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
      // For STARTER: Fixed unlock amount (15K tokens)
      // For others: 2× daily limit
      const requiredWords = planType === PlanType.STARTER 
        ? Math.floor(tokensUnlocked / 1.5) // Convert tokens to words
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
      if (plan.cooldownBooster.resetOn === 'plan_renewal') {
        // Use plan renewal date (stored in user.subscriptionRenewalDate)
        // For now, use calendar month
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
      } else {
        // Calendar month
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
      }

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

      // ✅ ELIGIBLE!
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
        select: { subscriptionPlan: true },
      });

      const planType = user?.subscriptionPlan as PlanType;
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
      expiresAt.setHours(23, 59, 59, 999); // End of day

      // Create booster record
      const booster = await prisma.booster.create({
        data: {
          userId: data.userId,

          // Classification
          boosterCategory: BoosterCategory.COOLDOWN,
          boosterType: `${planType}_cooldown`,
          boosterName: `${plan.displayName} Cooldown Booster`,
          boosterPrice: Math.round(price * 100), // Convert to paise/cents

          // Region & Currency
          region,
          currency: currency as any,

          // Cooldown-specific fields (schema-compliant)
          wordsUnlocked,
          cooldownDuration: cooldown.duration,
          maxPerPlanPeriod: cooldown.maxPerPlanPeriod,
          cooldownEnd: expiresAt,

          // Addon fields (null for cooldown)
          wordsAdded: null,
          creditsAdded: null,
          validity: null,
          distributionLogic: null,

          // Tracking
          wordsUsed: 0,
          wordsRemaining: null, // Cooldown uses monthly pool
          creditsUsed: 0,
          creditsRemaining: null,

          // Status
          status: BoosterStatus.ACTIVE,
          expiresAt,

          // Payment
          paymentGateway: data.paymentMethod,
          gatewayPaymentId: data.transactionId,

          // Metadata
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
        select: { subscriptionPlan: true },
      });

      if (!user) {
        return {
          eligible: false,
          reason: 'User not found',
          naturalMessage: 'Oops! Something went wrong. Please try again.',
        };
      }

      const planType = user.subscriptionPlan as PlanType;
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
      const totalWords = Math.floor(addon.totalTokens / 1.5); // Average token ratio
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
          premiumTokens: addon.premiumTokens,
          flashTokens: addon.flashTokens,
          totalTokens: addon.totalTokens,
          totalWords,
          creditsAdded: addon.costs?.ai || 0, // Using AI cost as credits placeholder
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
        select: { subscriptionPlan: true },
      });

      const planType = user?.subscriptionPlan as PlanType;
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
        creditsAdded: 0, // Studio credits separate
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
  // STUDIO BOOSTER (CORRECT CREDITS!)
  // ==========================================

  /**
   * Get all studio packages with region-specific pricing
   */
  async getStudioPackages(region: Region = Region.IN): Promise<StudioPackageInfo[]> {
    try {
      const packages: StudioPackageInfo[] = [];

      for (const [type, booster] of Object.entries(STUDIO_BOOSTERS)) {
       const plansRegion = mapPrismaRegionToPlans(region);  // ⭐ ADD THIS LINE
       const pricing = getStudioBoosterPricing(type, plansRegion);  // ⭐ CHANGE HERE
        const currency = pricing.currency === PlanCurrency.INR ? Currency.INR : Currency.USD;

        packages.push({
          type: type as StudioBoosterType,
          name: booster.name,
          displayName: booster.displayName,
          tagline: booster.tagline,
          price: pricing.price,
          priceDisplay: formatPrice(pricing.price, pricing.currency),
          currency,
          creditsAdded: pricing.credits,
          validity: booster.validity,
          maxPerMonth: booster.maxPerMonth,
          popular: booster.popular,
          costBreakdown: {
            gateway: pricing.costs.gateway,
            infra: pricing.costs.infra,
            maxGPUCost: pricing.costs.maxGPUCost,
            total: pricing.costs.total,
            profit: pricing.costs.profit,
            margin: pricing.costs.margin,
          },
        });
      }

      return packages;
    } catch (error) {
      console.error('[BoosterService] Failed to get studio packages:', error);
      return [];
    }
  }

  /**
   * Purchase Studio Credits Booster
   * ✅ FIXED: Correct credits (420/1695/2545 IN | 1050/4237/6362 INTL)
   */
  async purchaseStudioBooster(
    data: StudioPurchaseRequest
  ): Promise<StudioPurchaseResult> {
    try {
      const region = data.region || Region.IN;
      const currency = data.currency || (region === Region.IN ? Currency.INR : Currency.USD);

      // Get correct package pricing for region
      const plansRegion = mapPrismaRegionToPlans(region);  // ⭐ ADD THIS LINE
      const pricing = getStudioBoosterPricing(data.boosterType, plansRegion);  // ⭐ CHANGE HERE
      const boosterConfig = STUDIO_BOOSTERS[data.boosterType];

      if (!boosterConfig) {
        return {
          success: false,
          message: 'Invalid booster type',
          naturalMessage: 'Invalid booster package selected.',
        };
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true, subscriptionPlan: true },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          naturalMessage: 'User account not found.',
        };
      }

      // Check monthly limit
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const purchasedThisMonth = await prisma.studioBoosterPurchase.count({
        where: {
          userId: data.userId,
          boosterType: data.boosterType,
          purchasedAt: { gte: monthStart },
        },
      });

      if (purchasedThisMonth >= boosterConfig.maxPerMonth) {
        return {
          success: false,
          message: `Maximum ${boosterConfig.maxPerMonth} ${boosterConfig.displayName} purchases per month`,
          naturalMessage: `You've already purchased ${boosterConfig.displayName} ${purchasedThisMonth} times this month! Limit resets next month. 😊`,
        };
      }

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + boosterConfig.validity);

      // Generate payment ID
      const paymentId = data.transactionId || `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate costs
      const gatewayCost = pricing.costs.gateway;
      const netRevenue = pricing.price - gatewayCost;

      // Create studio booster purchase record
      const booster = await prisma.studioBoosterPurchase.create({
        data: {
          userId: data.userId,
          boosterType: data.boosterType,
          boosterName: boosterConfig.displayName,
          creditsAdded: pricing.credits,
          price: pricing.price,
          currency: currency === Currency.INR ? 'INR' : 'USD',
          region,
          validityDays: boosterConfig.validity,
          expiresAt,
          active: true,
          paymentMethod: data.paymentMethod,
          paymentId,
          paymentStatus: 'completed',
          gatewayCost,
          netRevenue,
          creditsUsed: 0,
          creditsRemaining: pricing.credits,
          activatedAt: new Date(),
        },
      });

      // Add credits to user account
      await this.addStudioCredits(data.userId, pricing.credits, user.subscriptionPlan);

      // Get new balance
      const updatedUser = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { studioCreditsRemaining: true },
      });

      // Record session
      try {
        await BrainService.recordSession(data.userId);
      } catch (brainError) {
        console.warn('[BoosterService] Brain tracking failed:', brainError);
      }

      const symbol = currency === Currency.USD ? '$' : '₹';

      return {
        success: true,
        message: `${boosterConfig.displayName} purchased successfully`,
        naturalMessage: `Awesome! You've got ${pricing.credits.toLocaleString()} Studio Credits for the next ${boosterConfig.validity} days! Start creating amazing content! 🎨✨`,
        booster,
        boosterType: data.boosterType,
        price: pricing.price,
        priceDisplay: `${symbol}${pricing.price}`,
        creditsAdded: pricing.credits,
        newBalance: updatedUser?.studioCreditsRemaining || pricing.credits,
        transactionId: paymentId,
        expiresAt,
      };
    } catch (error: any) {
      console.error('[BoosterService] Studio booster purchase failed:', error);
      return {
        success: false,
        message: error.message || 'Purchase failed',
        naturalMessage: 'Something went wrong with your purchase. Please try again or contact support.',
      };
    }
  }

  /**
   * Add studio credits to user account
   * Updates both Credit table and User.studioCreditsRemaining
   */
  private async addStudioCredits(
    userId: string,
    creditsToAdd: number,
    planName?: string
  ): Promise<void> {
    try {
      // Update Credit table
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
            planName: planName || PlanType.STARTER,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        });
      }

      // Update User table
      await prisma.user.update({
        where: { id: userId },
        data: {
          studioCreditsRemaining: { increment: creditsToAdd },
        },
      });

      console.log(`[BoosterService] Added ${creditsToAdd} studio credits to user ${userId}`);
    } catch (error) {
      console.error('[BoosterService] Failed to add studio credits:', error);
      throw error;
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
            { activatedAt: { gt: now } }, // Include queued
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
          activatedAt: { lte: now }, // Only currently active ones
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

      // Studio boosters
      const studioRevenue = await prisma.studioBoosterPurchase.aggregate({
        _sum: { price: true },
      });

      const studioCount = await prisma.studioBoosterPurchase.count();

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

      const totalRevenueINR = ((boosterRevenue._sum.boosterPrice || 0) / 100) + 
                              (studioRevenue._sum.price || 0);

      return {
        totalBoosters,
        totalRevenue: totalRevenueINR,
        totalRevenueINR,
        totalRevenueUSD: totalRevenueINR * 0.012, // Convert to USD
        activeBoosters,
        expiredBoosters,
        cooldownCount,
        cooldownRevenue: (cooldownRevenue._sum.boosterPrice || 0) / 100,
        cooldownMargin: 97.7, // From plans.ts
        addonCount,
        addonRevenue: (addonRevenue._sum.boosterPrice || 0) / 100,
        addonMargin: 66, // Average from plans.ts
        studioCount,
        studioRevenue: studioRevenue._sum.price || 0,
        studioMargin: 86, // Average from plans.ts
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
            select: { subscriptionPlan: true },
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
              creditsAdded: data.creditsAdded || 0,
              validity: data.validityDays,
              wordsUsed: 0,
              wordsRemaining: data.wordsAdded || 0,
              creditsUsed: 0,
              creditsRemaining: data.creditsAdded || 0,
              status: BoosterStatus.ACTIVE,
              expiresAt,
              paymentGateway: 'promo',
              planName: user?.subscriptionPlan || PlanType.STARTER,
              description: `Promo: ${data.reason}`,
            },
          });
        })
      );

      // Add words/credits to users
      await Promise.all(
        data.userIds.map(async (userId) => {
          if (data.wordsAdded) {
            await usageService.addBonusWords(userId, data.wordsAdded);
          }
          if (data.creditsAdded) {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { subscriptionPlan: true },
            });
            await this.addStudioCredits(userId, data.creditsAdded, user?.subscriptionPlan);
          }
        })
      );

      return {
        success: true,
        message: `Applied promo booster to ${data.userIds.length} users`,
        naturalMessage: `Promo applied! ${data.wordsAdded?.toLocaleString() || 0} words${data.creditsAdded ? ` + ${data.creditsAdded} credits` : ''} added to ${data.userIds.length} users.`,
        boosters,
        totalUsers: data.userIds.length,
        totalWordsAdded: data.wordsAdded,
        totalCreditsAdded: data.creditsAdded,
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
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export default new BoosterService();
