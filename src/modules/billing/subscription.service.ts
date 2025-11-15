// src/modules/billing/subscription.service.ts

/**
 * ==========================================
 * SUBSCRIPTION SERVICE - PLAN MANAGEMENT
 * ==========================================
 * Handles subscription creation, upgrades, cancellations
 * Last Updated: November 12, 2025 - Multi-Currency Support
 *
 * CHANGES (November 12, 2025):
 * - ✅ FIXED: Regional pricing in changePlan()
 * - ✅ FIXED: Regional prorated amount calculation
 * - ✅ ADDED: Currency tracking in all transactions
 * - ✅ ADDED: Regional price validation in upgrades
 * - ✅ UPDATED: Helper methods for regional pricing
 *
 * CHANGES (November 5, 2025):
 * - ✅ ADDED: Studio credits reset on plan changes
 * - ✅ ADDED: New user initialization (usage + credits)
 * - ✅ UPDATED: Usage service method calls
 * - ✅ REMOVED: Any trial-related logic
 * - ✅ IMPROVED: Better error handling
 *
 * FEATURES:
 * - Create/Update subscriptions with regional pricing
 * - Plan upgrades/downgrades with prorated amounts
 * - Cancellation (immediate or end of period)
 * - Reactivation
 * - Revenue statistics (regional)
 * - Cron job for expiry checks
 */

import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import { Region, Currency } from '@prisma/client';
import usageService from './usage.service';

export class SubscriptionService {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUBSCRIPTION CREATION & MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create or update subscription with regional pricing validation
   */
  async createSubscription(data: {
    userId: string;
    planId: string;
    paymentMethod: string;
    transactionId?: string;
    amount: number;
    region?: Region;
    currency?: Currency;
  }) {
    try {
      // Get user's region from database if not provided
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { region: true, currency: true },
      });

      const userRegion = data.region || user?.region || Region.IN;
      const userCurrency = data.currency || user?.currency || Currency.INR;

      // Validate plan
      const plan = plansManager.getPlanByName(data.planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // ✅ Validate regional pricing
      const expectedPrice = this.getRegionalPrice(plan, userRegion);
      
      if (data.amount !== expectedPrice) {
        throw new Error(
          `Invalid amount. Expected ${userCurrency === Currency.INR ? '₹' : '$'}${expectedPrice} for ${data.planId} plan in ${userRegion} region`
        );
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Check if user already has usage record
      const existingUsage = await prisma.usage.findUnique({
        where: { userId: data.userId },
      });

      // ✅ Create transaction record
      await prisma.transaction.create({
        data: {
          userId: data.userId,
          type: 'subscription',
          amount: data.amount,
          currency: userCurrency,
          status: 'success',
          planName: data.planId,
          paymentGateway: data.paymentMethod,
          gatewayPaymentId: data.transactionId,
          description: `${data.planId} plan subscription - ${userRegion} region`,
        },
      });

      // Create subscription record
      const subscription = await prisma.subscription.create({
        data: {
          userId: data.userId,
          planName: data.planId,
          planPrice: data.amount,
          status: 'ACTIVE',
          startDate,
          endDate,
          paymentGateway: data.paymentMethod,
          gatewaySubscriptionId: data.transactionId,
          autoRenew: true,
        },
      });

      // Update user's subscription plan
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          subscriptionPlan: data.planId,
          planStatus: 'ACTIVE',
          planStartDate: startDate,
          planEndDate: endDate,
        },
      });

      // Initialize or update usage with regional limits
      if (!existingUsage) {
        // New user - initialize with regional limits
        await usageService.initializeUsage(data.userId, data.planId as PlanType);
        await usageService.initializeStudioCredits(data.userId, data.planId as PlanType);
      } else {
        // Existing user - update limits
        await usageService.updateLimitsOnPlanChange(data.userId, data.planId);
        await usageService.resetMonthlyUsage(data.userId);
        await usageService.resetStudioCredits(data.userId);
      }

      return {
        success: true,
        message: 'Subscription created successfully',
        subscription,
        region: userRegion,
        currency: userCurrency,
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Create subscription error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create subscription',
      };
    }
  }

  /**
   * ✅ FIXED: Upgrade or downgrade plan with regional pricing
   */
  async changePlan(userId: string, newPlanId: string) {
    try {
      // Get user with region info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          subscriptionPlan: true,
          planEndDate: true,
          region: true,
          currency: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get active subscription
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get plans
      const currentPlan = plansManager.getPlanByName(user.subscriptionPlan);
      const newPlan = plansManager.getPlanByName(newPlanId);

      if (!newPlan) {
        throw new Error('Invalid plan selected');
      }

      // ✅ Get regional prices
      const userRegion = user.region || Region.IN;
      const userCurrency = user.currency || Currency.INR;
      
      const currentPlanPrice = currentPlan ? this.getRegionalPrice(currentPlan, userRegion) : 0;
      const newPlanPrice = this.getRegionalPrice(newPlan, userRegion);

      // ✅ Calculate prorated amount with regional pricing
      const proratedAmount = this.calculateProratedAmount(
        user,
        currentPlanPrice,
        newPlanPrice
      );

      // Determine if it's an upgrade or downgrade
      const isUpgrade = newPlanPrice > currentPlanPrice;

      // ✅ Create transaction record for plan change
      await prisma.transaction.create({
        data: {
          userId,
          type: 'subscription',
          amount: isUpgrade ? proratedAmount : 0,
          currency: userCurrency,
          status: 'success',
          planName: newPlanId,
          paymentGateway: 'plan_change',
          description: `Plan ${isUpgrade ? 'upgrade' : 'downgrade'}: ${user.subscriptionPlan} → ${newPlanId} (${userRegion})`,
        },
      });

      // Update subscription if exists
      if (activeSubscription) {
        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: {
            planName: newPlanId,
            planPrice: newPlanPrice,  // ✅ Uses regional price
          },
        });
      }

      // Update user plan
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: newPlanId,
        },
      });

      // Update usage limits
      await usageService.updateLimitsOnPlanChange(userId, newPlanId);

      // Reset monthly usage to new plan limits
      await usageService.resetMonthlyUsage(userId);

      // Reset studio credits to new plan allocation
      await usageService.resetStudioCredits(userId);

      return {
        success: true,
        message: 'Plan changed successfully',
        subscription: activeSubscription,
        proratedAmount,
        isUpgrade,
        currentPlanPrice,
        newPlanPrice,
        region: userRegion,
        currency: userCurrency,
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Change plan error:', error);
      return {
        success: false,
        message: error.message || 'Failed to change plan',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CANCELLATION & REACTIVATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, cancelImmediately: boolean = false) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      if (cancelImmediately) {
        // Immediate cancellation
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'CANCELLED',
            endDate: new Date(),
            autoRenew: false,
            cancelledAt: new Date(),
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionPlan: 'starter',
            planStatus: 'CANCELLED',
          },
        });

        // Reset to starter plan limits
        await usageService.updateLimitsOnPlanChange(userId, 'starter');
        await usageService.resetMonthlyUsage(userId);
        await usageService.resetStudioCredits(userId);

        return {
          success: true,
          message: 'Subscription cancelled immediately',
          effectiveDate: new Date(),
        };
      } else {
        // Cancel at end of billing period
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            autoRenew: false,
          },
        });

        return {
          success: true,
          message: 'Subscription will be cancelled at end of billing period',
          effectiveDate: subscription.endDate,
        };
      }
    } catch (error: any) {
      console.error('[SubscriptionService] Cancel subscription error:', error);
      return {
        success: false,
        message: error.message || 'Failed to cancel subscription',
      };
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'CANCELLED',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription) {
        throw new Error('No cancelled subscription found');
      }

      // Check if subscription can be reactivated (not too old)
      const daysSinceCancellation = Math.floor(
        (new Date().getTime() - subscription.endDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCancellation > 30) {
        throw new Error('Subscription expired too long ago, please create a new subscription');
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          autoRenew: true,
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          planStatus: 'ACTIVE',
        },
      });

      // Restore plan limits
      await usageService.updateLimitsOnPlanChange(userId, subscription.planName);
      await usageService.resetMonthlyUsage(userId);
      await usageService.resetStudioCredits(userId);

      return {
        success: true,
        message: 'Subscription reactivated successfully',
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Reactivate subscription error:', error);
      return {
        success: false,
        message: error.message || 'Failed to reactivate subscription',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUBSCRIPTION QUERIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get subscription details
   */
  async getSubscriptionDetails(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            subscriptionPlan: true,
            planStatus: true,
            region: true,
            currency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return null;
    }

    const plan = plansManager.getPlanByName(subscription.planName);
    const daysRemaining = Math.ceil(
      (subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    // ✅ Get regional price
    const userRegion = subscription.user.region || Region.IN;
    const regionalPrice = plan ? this.getRegionalPrice(plan, userRegion) : subscription.planPrice;

    return {
      subscription: {
        ...subscription,
        planPrice: regionalPrice,  // ✅ Return regional price
      },
      plan,
      daysRemaining,
      willAutoRenew: subscription.autoRenew,
      region: userRegion,
      currency: subscription.user.currency,
    };
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory(userId: string) {
    return await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRON JOB - EXPIRY MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check and expire subscriptions (cron job)
   */
  async checkExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          endDate: { lte: new Date() },
          status: 'ACTIVE',
        },
      });

      let expiredCount = 0;
      let renewedCount = 0;

      for (const sub of expiredSubscriptions) {
        if (sub.autoRenew) {
          // TODO: Attempt to renew payment via payment gateway
          // For now, just mark as expired
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'EXPIRED' },
          });

          await prisma.user.update({
            where: { id: sub.userId },
            data: {
              subscriptionPlan: 'starter',
              planStatus: 'EXPIRED',
            },
          });

          // Reset to starter plan
          await usageService.updateLimitsOnPlanChange(sub.userId, 'starter');
          await usageService.resetMonthlyUsage(sub.userId);
          await usageService.resetStudioCredits(sub.userId);

          expiredCount++;
        } else {
          // Already marked for cancellation
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
            },
          });

          await prisma.user.update({
            where: { id: sub.userId },
            data: {
              subscriptionPlan: 'starter',
              planStatus: 'CANCELLED',
            },
          });

          await usageService.updateLimitsOnPlanChange(sub.userId, 'starter');
          await usageService.resetMonthlyUsage(sub.userId);
          await usageService.resetStudioCredits(sub.userId);

          expiredCount++;
        }
      }

      return {
        success: true,
        message: `Processed ${expiredCount} expired subscriptions`,
        expiredCount,
        renewedCount,
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Check expired subscriptions error:', error);
      return {
        success: false,
        message: error.message || 'Failed to check expired subscriptions',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * ✅ NEW: Get regional price for a plan
   */
  private getRegionalPrice(plan: any, region: Region): number {
    if (region === Region.INTL) {
      return plan.priceUSD || plan.price;  // Use USD price for international
    }
    return plan.price;  // Use INR price for India
  }

  /**
   * ✅ FIXED: Calculate prorated amount for plan changes with regional pricing
   */
  private calculateProratedAmount(
    user: any,
    currentPlanPrice: number,
    newPlanPrice: number
  ): number {
    if (!user.planEndDate) return newPlanPrice;

    const now = new Date();
    const endDate = new Date(user.planEndDate);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) return newPlanPrice;

    const totalDays = 30; // 30-day billing cycle
    
    // ✅ Calculate prorated amounts using regional prices
    const currentPlanProration = (currentPlanPrice / totalDays) * daysRemaining;
    const newPlanProration = (newPlanPrice / totalDays) * daysRemaining;

    // Return difference (can be negative for downgrades)
    return Math.max(0, newPlanProration - currentPlanProration);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADMIN STATISTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get revenue statistics (admin)
   */
  async getRevenueStats() {
    try {
      const activeSubscriptions = await prisma.subscription.count({
        where: { status: 'ACTIVE' },
      });

      const totalRevenue = await prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { planPrice: true },
      });

      const revenueByPlan = await prisma.subscription.groupBy({
        by: ['planName'],
        where: { status: 'ACTIVE' },
        _sum: { planPrice: true },
        _count: true,
      });

      return {
        activeSubscriptions,
        monthlyRecurringRevenue: totalRevenue._sum.planPrice || 0,
        revenueByPlan: revenueByPlan.map(item => ({
          planName: item.planName,
          revenue: item._sum.planPrice || 0,
          count: item._count,
        })),
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Get revenue stats error:', error);
      throw new Error(`Failed to get revenue stats: ${error.message}`);
    }
  }

  /**
   * Get all active subscriptions (admin)
   */
  async getAllActiveSubscriptions() {
    return await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            subscriptionPlan: true,
            region: true,
            currency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get subscription count by plan (admin)
   */
  async getSubscriptionCountByPlan() {
    const counts = await prisma.subscription.groupBy({
      by: ['planName'],
      where: { status: 'ACTIVE' },
      _count: true,
    });

    return counts.map((item) => ({
      planName: item.planName,
      count: item._count,
    }));
  }

  /**
   * Get subscription statistics summary (admin)
   */
  async getSubscriptionStatsSummary() {
    try {
      const [active, cancelled, expired, total] = await Promise.all([
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.subscription.count({ where: { status: 'CANCELLED' } }),
        prisma.subscription.count({ where: { status: 'EXPIRED' } }),
        prisma.subscription.count(),
      ]);

      return {
        total,
        active,
        cancelled,
        expired,
        churnRate: total > 0 ? ((cancelled + expired) / total) * 100 : 0,
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Get stats summary error:', error);
      throw new Error(`Failed to get subscription stats: ${error.message}`);
    }
  }

  /**
   * ✅ NEW: Get revenue by region (admin)
   */
  async getRevenueByRegion() {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: {
          user: {
            select: {
              region: true,
              currency: true,
            },
          },
        },
      });

      const revenueByRegion = subscriptions.reduce((acc, sub) => {
        const region = sub.user.region || Region.IN;
        if (!acc[region]) {
          acc[region] = {
            count: 0,
            revenue: 0,
            currency: sub.user.currency || Currency.INR,
          };
        }
        acc[region].count++;
        acc[region].revenue += sub.planPrice;
        return acc;
      }, {} as Record<string, { count: number; revenue: number; currency: Currency }>);

      return {
        success: true,
        data: revenueByRegion,
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Get revenue by region error:', error);
      throw new Error(`Failed to get regional revenue: ${error.message}`);
    }
  }
}

export default new SubscriptionService();