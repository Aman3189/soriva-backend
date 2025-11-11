// src/modules/billing/billing.service.ts
// Updated: November 6, 2025 - Enum Conversion Complete
// Changes:
// - ✅ ADDED: SubscriptionStatus, BoosterStatus enum imports
// - ✅ FIXED: 'ACTIVE' → SubscriptionStatus.ACTIVE (Line 130)
// - ✅ FIXED: 'active' → BoosterStatus.ACTIVE (Line 168)
// - ✅ MAINTAINED: Class-based structure (100%)
// - ✅ MAINTAINED: Studio Integration Complete
// - ✅ MAINTAINED: Clean, no hardcoded values
//
// Previous Changes (November 4, 2025):
// - ✅ FIXED: Removed plan.credits (doesn't exist in interface)
// - ✅ ADDED: Studio credits support (plan.limits.studioCredits)
// - ✅ ADDED: tagline, hero, order, documentation fields

import { plansManager, PlanType, SubscriptionStatus, BoosterStatus } from '../../constants';
import { prisma } from '../../config/prisma';

export class BillingService {
  /**
   * Get all enabled plans (visible to users)
   */
  async getAllPlans() {
    try {
      const enabledPlans = plansManager.getEnabledPlans();

      // Format plans for API response (hide internal cost details)
      const formattedPlans = enabledPlans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        tagline: plan.tagline,
        description: plan.description,
        price: plan.price,
        popular: plan.popular || false,
        hero: plan.hero || false,
        order: plan.order,
        limits: {
          monthlyWords: plan.limits.monthlyWords,
          dailyWords: plan.limits.dailyWords,
          botResponseLimit: plan.limits.botResponseLimit,
          studioCredits: plan.limits.studioCredits,
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
      }));

      return {
        success: true,
        plans: formattedPlans,
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
   * Get plan details by type
   */
  async getPlanDetails(planType: PlanType) {
    try {
      const plan = plansManager.getPlan(planType);

      if (!plan) {
        return {
          success: false,
          message: 'Plan not found',
        };
      }

      return {
        success: true,
        plan: {
          id: plan.id,
          name: plan.name,
          displayName: plan.displayName,
          tagline: plan.tagline,
          description: plan.description,
          price: plan.price,
          popular: plan.popular,
          hero: plan.hero,
          order: plan.order,
          limits: plan.limits,
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