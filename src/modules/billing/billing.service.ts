// src/modules/billing/billing.service.ts
// Updated: December 4, 2025 - Abuse Controls Integration
// Changes:
// - ✅ ADDED: Payment activation delay (trust-based)
// - ✅ ADDED: Booster purchase eligibility checks
// - ✅ ADDED: Purchase gap enforcement
// - ✅ ADDED: Failed payment tracking
// - ✅ MAINTAINED: Regional pricing support (IN vs INTL)
// - ✅ MAINTAINED: Class-based structure
// - ✅ MAINTAINED: Studio Integration

import { plansManager, PlanType, SubscriptionStatus, BoosterStatus } from '../../constants';
import { 
  Region as PlansRegion, 
  getPlanPricing, 
  formatPrice,
  BillingCycle,
  getPlanPricingByCycle,
  calculateYearlySavings,
} from '../../constants/plans';
import { Region, PlanStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';

// ⭐ Abuse limits integration
import {
  getUserTrustLevel,
  getActivationDelayMinutes,
  canPurchaseBooster,
  BOOSTER_PURCHASE_CONTROLS,
  ACCOUNT_ELIGIBILITY,
} from '@/constants/abuse-limits';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ActivationResult {
  success: boolean;
  status: 'ACTIVE' | 'ACTIVATING';
  activatesAt: Date;
  delayMinutes: number;
  message: string;
}

interface BoosterEligibility {
  allowed: boolean;
  reason: string;
}

export class BillingService {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Convert Prisma Region enum to plans.ts Region enum
   * Prisma: IN, INTL
   * plans.ts: INDIA, INTERNATIONAL
   */
  private mapPrismaRegionToPlansRegion(prismaRegion: Region): PlansRegion {
    return prismaRegion === Region.IN ? PlansRegion.INDIA : PlansRegion.INTERNATIONAL;
  }

  /**
   * Calculate account age in days
   */
  private getAccountAgeDays(createdAt: Date): number {
    return Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get hours since a date
   */
  private getHoursSince(date: Date | null): number {
    if (!date) return 999;
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  }

  /**
   * Add minutes to a date
   */
  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  /**
   * Get user's failed payments count today
   */
  private async getFailedPaymentsToday(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.transaction.count({
      where: {
        userId,
        status: 'FAILED',
        createdAt: { gte: today },
      },
    });

    return count;
  }

  /**
   * Get user's last booster purchase time by type
   */
  private async getLastBoosterPurchaseTime(
    userId: string,
    boosterType: 'COOLDOWN' | 'ADDON' | 'STUDIO'
  ): Promise<Date | null> {
    const lastBooster = await prisma.booster.findFirst({
      where: {
        userId,
        boosterType: { contains: boosterType.toLowerCase() },
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return lastBooster?.createdAt || null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⭐ NEW: PAYMENT ACTIVATION DELAY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate activation delay for a payment
   * Returns delay based on user trust level
   */
  async calculateActivationDelay(
    userId: string,
    isHighValueFeature: boolean = false
  ): Promise<{ delayMinutes: number; trustLevel: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        accountFlagged: true,
        refundCount: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Count previous subscriptions
    const previousSubscriptions = await prisma.subscription.count({
      where: {
        userId,
        status: { in: ['ACTIVE', 'CANCELLED', 'EXPIRED'] },
      },
    });

    const accountAgeDays = this.getAccountAgeDays(user.createdAt);

    const trustLevel = getUserTrustLevel({
      previousSubscriptions,
      accountAgeDays,
      flagged: user.accountFlagged,
      refundHistory: user.refundCount,
    });

    const delayMinutes = getActivationDelayMinutes(trustLevel, isHighValueFeature);

    return { delayMinutes, trustLevel };
  }

  /**
   * Activate subscription with trust-based delay
   */
  async activateSubscriptionWithDelay(
    userId: string,
    subscriptionId: string,
    planType: PlanType
  ): Promise<ActivationResult> {
    try {
      // Check if plan has high-value features
      const plan = plansManager.getPlan(planType);
      const isHighValue = plan?.features?.studio || planType === PlanType.APEX;

      // Calculate delay
      const { delayMinutes, trustLevel } = await this.calculateActivationDelay(userId, isHighValue);

      const now = new Date();
      const activatesAt = this.addMinutes(now, delayMinutes);

      if (delayMinutes === 0) {
        // Instant activation for trusted users
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            startDate: now,
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            planType: planType,
            planStatus: PlanStatus.ACTIVE,
            planStartDate: now,
          },
        });

        return {
          success: true,
          status: 'ACTIVE',
          activatesAt: now,
          delayMinutes: 0,
          message: 'Your subscription is now active!',
        };
      } else {
        // Delayed activation for new/suspicious users
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            gatewayMetadata: {
              activatesAt: activatesAt.toISOString(),
              trustLevel,
              delayMinutes,
              pendingPlanType: planType,
            },
          },
        });

        return {
          success: true,
          status: 'ACTIVATING',
          activatesAt,
          delayMinutes,
          message: `Payment successful! Your ${plan?.displayName || 'plan'} features will be ready in ~${delayMinutes} minutes. We're setting up your premium experience...`,
        };
      }
    } catch (error: any) {
      console.error('[BillingService] Activation error:', error);
      return {
        success: false,
        status: 'ACTIVATING',
        activatesAt: new Date(),
        delayMinutes: 0,
        message: `Activation failed: ${error.message}`,
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⭐ NEW: BOOSTER PURCHASE ELIGIBILITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if user can purchase a booster
   */
  async checkBoosterEligibility(
    userId: string,
    boosterType: 'COOLDOWN' | 'ADDON' | 'STUDIO'
  ): Promise<BoosterEligibility> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        mobileVerified: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    const accountAgeDays = this.getAccountAgeDays(user.createdAt);
    const failedPaymentsToday = await this.getFailedPaymentsToday(userId);
    const lastPurchaseTime = await this.getLastBoosterPurchaseTime(userId, boosterType);
    const hoursSinceLastPurchase = this.getHoursSince(lastPurchaseTime);

    return canPurchaseBooster({
      accountAgeDays,
      mobileVerified: user.mobileVerified,
      emailVerified: user.emailVerified,
      hoursSinceLastBoosterPurchase: hoursSinceLastPurchase,
      boosterType,
      failedPaymentsToday,
    });
  }

  /**
   * Get user's booster eligibility status (for UI)
   */
  async getBoosterEligibilityStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        mobileVerified: true,
        emailVerified: true,
        cooldownPurchasesThisPeriod: true,
      },
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const accountAgeDays = this.getAccountAgeDays(user.createdAt);
    const failedPaymentsToday = await this.getFailedPaymentsToday(userId);
    const minDays = ACCOUNT_ELIGIBILITY.minAccountAgeDaysForBoosters;

    const baseEligible = accountAgeDays >= minDays && user.mobileVerified && failedPaymentsToday < 3;

    return {
      success: true,
      eligibility: {
        accountAgeDays,
        minRequiredDays: minDays,
        mobileVerified: user.mobileVerified,
        emailVerified: user.emailVerified,
        failedPaymentsToday,
        maxFailedPayments: BOOSTER_PURCHASE_CONTROLS.maxFailedPaymentsPerDay,
        cooldownPurchasesThisPeriod: user.cooldownPurchasesThisPeriod,
        canPurchaseCooldown: baseEligible,
        canPurchaseAddon: baseEligible,
        canPurchaseStudio: baseEligible,
        requirements: {
          accountAge: accountAgeDays >= minDays ? '✅' : `❌ Need ${minDays - accountAgeDays} more days`,
          mobileVerified: user.mobileVerified ? '✅' : '❌ Mobile verification required',
          noPaymentIssues: failedPaymentsToday < 3 ? '✅' : '❌ Too many failed payments today',
        },
      },
    };
  }

  /**
   * Record failed payment attempt
   */
  async recordFailedPayment(userId: string, reason: string): Promise<void> {
    await prisma.transaction.create({
      data: {
        userId,
        type: 'PAYMENT_FAILED',
        status: 'FAILED',
        amount: 0,
        currency: 'INR',
        paymentGateway: 'unknown',
        gatewayMetadata: { reason, timestamp: new Date().toISOString() },
      },
    });

    const failedToday = await this.getFailedPaymentsToday(userId);

    if (failedToday >= BOOSTER_PURCHASE_CONTROLS.maxFailedPaymentsPerDay) {
      console.warn(`[BillingService] User ${userId} locked out: ${failedToday} failed payments today`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLAN QUERIES (Existing)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get all enabled plans with regional pricing
   */
  async getAllPlans(userRegion: Region = Region.IN, billingCycle: BillingCycle = BillingCycle.MONTHLY) {
    try {
      const enabledPlans = plansManager.getEnabledPlans();

      // Convert Prisma Region to plans.ts Region for pricing lookup
      const plansRegion = this.mapPrismaRegionToPlansRegion(userRegion);

      // Format plans for API response with regional pricing
      const formattedPlans = enabledPlans.map((plan) => {
  // ✅ NEW: Get pricing by billing cycle
  const pricing = getPlanPricingByCycle(plan.id, plansRegion, billingCycle);
  const savings = calculateYearlySavings(plan.id, plansRegion);
  
  const limits = userRegion === Region.IN 
    ? plan.limits 
    : (plan.limitsInternational || plan.limits);

  return {
    id: plan.id,
    name: plan.name,
    displayName: plan.displayName,
    tagline: plan.tagline,
    description: plan.description,
    
    // ✅ UPDATED: Billing cycle aware pricing
    price: pricing.price,
    priceMonthly: pricing.priceMonthly,
    currency: pricing.currency,
    displayPrice: formatPrice(pricing.price, pricing.currency),
    billingCycle: pricing.billingCycle,
    discount: pricing.discount,
    region: userRegion,
    
    // ✅ NEW: Yearly savings info
    yearlySavings: {
      amount: savings.savings,
      percentage: savings.savingsPercentage,
      displaySavings: formatPrice(savings.savings, pricing.currency),
    },
    
    popular: plan.popular || false,
    hero: plan.hero || false,
    order: plan.order,
    
    // ✅ Regional limits
    limits: {
      monthlyWords: limits.monthlyWords,
      dailyWords: limits.dailyWords,
      botResponseLimit: limits.botResponseLimit,
      studioCredits: limits.studioCredits,
    },
    
    features: {
      studio: plan.features.studio,
      documentIntelligence: plan.features.documentIntelligence,
      fileUpload: plan.features.fileUpload,
      prioritySupport: plan.features.prioritySupport,
    },
    
    aiModels: plan.aiModels.map((model) => ({
      provider: model.provider,
      displayName: model.displayName,
    })),
    
    cooldownBooster: plan.cooldownBooster
      ? {
          price: plan.cooldownBooster.price,
          wordsUnlocked: plan.cooldownBooster.wordsUnlocked,
          maxPerPlanPeriod: plan.cooldownBooster.maxPerPlanPeriod,
        }
      : null,
      
    addonBooster: plan.addonBooster
      ? {
          price: plan.addonBooster.price,
          wordsAdded: plan.addonBooster.wordsAdded,
          validity: plan.addonBooster.validity,
          maxPerMonth: plan.addonBooster.maxPerMonth,
        }
      : null,
      
    documentation: plan.documentation
      ? {
          enabled: plan.documentation.enabled,
          tier: plan.documentation.tier,
          monthlyWords: plan.documentation.monthlyWords,
        }
      : null,
  };
});

      return {
        success: true,
        plans: formattedPlans,
        region: userRegion,
      };
    } catch (error: any) {
      console.error('Get all plans error:', error);
      return {
        success: false,
        message: 'Failed to get plans',
        error: error.message,
      };
    }
  }

  /**
   * Get plan details by type with regional pricing
   */
  async getPlanDetails(
  planType: PlanType, 
  userRegion: Region = Region.IN,
  billingCycle: BillingCycle = BillingCycle.MONTHLY
) {
  try {
    const plan = plansManager.getPlan(planType);

    if (!plan) {
      return {
        success: false,
        message: 'Plan not found',
      };
    }

    // Convert Prisma Region to plans.ts Region
    const plansRegion = this.mapPrismaRegionToPlansRegion(userRegion);
    
    // ✅ NEW: Get pricing by billing cycle
    const pricing = getPlanPricingByCycle(plan.id, plansRegion, billingCycle);
    const savings = calculateYearlySavings(plan.id, plansRegion);
    
    const limits = userRegion === Region.IN 
      ? plan.limits 
      : (plan.limitsInternational || plan.limits);

    return {
      success: true,
      plan: {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        tagline: plan.tagline,
        description: plan.description,
        
        // ✅ UPDATED: Billing cycle aware pricing
        price: pricing.price,
        priceMonthly: pricing.priceMonthly,
        currency: pricing.currency,
        displayPrice: formatPrice(pricing.price, pricing.currency),
        billingCycle: pricing.billingCycle,
        discount: pricing.discount,
        region: userRegion,
        
        // ✅ NEW: Yearly savings info
        yearlySavings: {
          amount: savings.savings,
          percentage: savings.savingsPercentage,
          displaySavings: formatPrice(savings.savings, pricing.currency),
        },
        
        // ✅ NEW: Gateway plan ID for checkout
        gatewayPlanId: pricing.gatewayPlanId,
        
        popular: plan.popular,
        hero: plan.hero,
        order: plan.order,
        
        // ✅ Regional limits
        limits: limits,
        
        features: plan.features,
        cooldownBooster: plan.cooldownBooster,
        addonBooster: plan.addonBooster,
        documentation: plan.documentation,
      },
    };
  } catch (error: any) {
    console.error('Get plan details error:', error);
    return {
      success: false,
      message: 'Failed to get plan details',
      error: error.message,
    };
  }
}

  /**
   * Get active subscription for user
   */
  async getUserSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!subscription) {
        return {
          success: false,
          message: 'No active subscription found',
        };
      }

      return {
        success: true,
        subscription: {
          id: subscription.id,
          planName: subscription.planName,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          autoRenew: subscription.autoRenew,
        },
      };
    } catch (error: any) {
      console.error('Get user subscription error:', error);
      return {
        success: false,
        message: 'Failed to get subscription',
        error: error.message,
      };
    }
  }

  /**
   * Get active boosters for user
   */
  async getActiveBoosters(userId: string) {
    try {
      const boosters = await prisma.booster.findMany({
        where: {
          userId,
          status: BoosterStatus.ACTIVE,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        boosters: boosters.map((booster) => ({
          id: booster.id,
          type: booster.boosterType,
          status: booster.status,
          wordsAdded: booster.wordsAdded,
          creditsAdded: booster.creditsAdded,
          expiresAt: booster.expiresAt,
          activatedAt: booster.activatedAt,
        })),
      };
    } catch (error: any) {
      console.error('Get active boosters error:', error);
      return {
        success: false,
        message: 'Failed to get boosters',
        error: error.message,
      };
    }
  }
}

export default new BillingService();