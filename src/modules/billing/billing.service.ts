// src/modules/billing/billing.service.ts
// Updated: October 14, 2025 (Session 2 - Plan Migration)
// Changes:
// - FIXED: Import from new constants structure
// - FIXED: Use plansManager.getEnabledPlans()
// - FIXED: Use plansManager.getPlan()
// - MAINTAINED: Class-based structure (100%)
// - MAINTAINED: No hardcoded plan names (already clean!)

import { plansManager, PlanType } from '../../constants'; // ✅ FIXED: New import structure
import { prisma } from '../../config/prisma';

export class BillingService {
  /**
   * Get all enabled plans (visible to users)
   */
  async getAllPlans() {
    try {
      // ✅ FIXED: Use plansManager method
      const enabledPlans = plansManager.getEnabledPlans();

      // Format plans for API response (hide internal cost details)
      const formattedPlans = enabledPlans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        price: plan.price,
        popular: plan.popular || false,
        limits: {
          monthlyWords: plan.limits.monthlyWords,
          dailyWords: plan.limits.dailyWords,
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
        credits: plan.credits
          ? {
              monthlyCredits: plan.credits.monthlyCredits,
            }
          : null,
        cooldownBooster: plan.cooldownBooster
          ? {
              price: plan.cooldownBooster.price,
              wordsUnlocked: plan.cooldownBooster.wordsUnlocked,
            }
          : null,
        addonBooster: plan.addonBooster
          ? {
              price: plan.addonBooster.price,
              wordsAdded: plan.addonBooster.wordsAdded,
              creditsAdded: plan.addonBooster.creditsAdded,
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
      // ✅ FIXED: Use plansManager method
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
          description: plan.description,
          price: plan.price,
          limits: plan.limits,
          features: plan.features,
          credits: plan.credits,
          cooldownBooster: plan.cooldownBooster,
          addonBooster: plan.addonBooster,
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
          status: 'ACTIVE',
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
          status: 'active',
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
          type: booster.boosterType, // ✅ Already correct!
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
