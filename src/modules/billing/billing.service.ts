// src/modules/billing/billing.service.ts
// Updated: November 12, 2025 - Regional Pricing Integration
// Changes:
// - ✅ ADDED: Regional pricing support (IN vs INTL)
// - ✅ ADDED: Helper function to map Prisma Region to plans.ts Region
// - ✅ UPDATED: getAllPlans() - now accepts userRegion parameter
// - ✅ UPDATED: getPlanDetails() - now accepts userRegion parameter
// - ✅ MAINTAINED: Class-based structure
// - ✅ MAINTAINED: Studio Integration

import { plansManager, PlanType, SubscriptionStatus, BoosterStatus } from '../../constants';
import { Region as PlansRegion, getPlanPricing, formatPrice } from '../../constants/plans';
import { Region } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class BillingService {
  /**
   * Convert Prisma Region enum to plans.ts Region enum
   * Prisma: IN, INTL
   * plans.ts: INDIA, INTERNATIONAL
   */
  private mapPrismaRegionToPlansRegion(prismaRegion: Region): PlansRegion {
    return prismaRegion === Region.IN ? PlansRegion.INDIA : PlansRegion.INTERNATIONAL;
  }

  /**
   * Get all enabled plans with regional pricing
   */
  async getAllPlans(userRegion: Region = Region.IN) {
    try {
      const enabledPlans = plansManager.getEnabledPlans();

      // Convert Prisma Region to plans.ts Region for pricing lookup
      const plansRegion = this.mapPrismaRegionToPlansRegion(userRegion);

      // Format plans for API response with regional pricing
      const formattedPlans = enabledPlans.map((plan) => {
        // Get regional pricing
        const pricing = getPlanPricing(plan.id, plansRegion);
        const limits = userRegion === Region.IN 
          ? plan.limits 
          : (plan.limitsInternational || plan.limits);

        return {
          id: plan.id,
          name: plan.name,
          displayName: plan.displayName,
          tagline: plan.tagline,
          description: plan.description,
          
          // ✅ Regional pricing
          price: pricing.price,
          currency: pricing.currency,
          displayPrice: formatPrice(pricing.price, pricing.currency),
          region: userRegion,
          
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
  async getPlanDetails(planType: PlanType, userRegion: Region = Region.IN) {
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
      const pricing = getPlanPricing(plan.id, plansRegion);
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
          
          // ✅ Regional pricing
          price: pricing.price,
          currency: pricing.currency,
          displayPrice: formatPrice(pricing.price, pricing.currency),
          region: userRegion,
          
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