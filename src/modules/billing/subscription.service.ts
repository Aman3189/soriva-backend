// src/modules/billing/subscription.service.ts

/**
 * ==========================================
 * SUBSCRIPTION SERVICE - PLAN MANAGEMENT
 * ==========================================
 * Handles subscription creation, upgrades, cancellations
 * Last Updated: November 5, 2025 - Studio Integration Complete
 *
 * CHANGES (November 5):
 * - ✅ ADDED: Studio credits reset on plan changes
 * - ✅ ADDED: New user initialization (usage + credits)
 * - ✅ UPDATED: Usage service method calls
 * - ✅ REMOVED: Any trial-related logic
 * - ✅ IMPROVED: Better error handling
 *
 * FEATURES:
 * - Create/Update subscriptions
 * - Plan upgrades/downgrades
 * - Cancellation (immediate or end of period)
 * - Reactivation
 * - Revenue statistics
 * - Cron job for expiry checks
 */

import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import usageService from './usage.service';

export class SubscriptionService {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUBSCRIPTION CREATION & MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create or update subscription
   */
  async createSubscription(data: {
    userId: string;
    planId: string;
    paymentMethod: string;
    transactionId?: string;
    amount: number;
  }) {
    try {
      // Validate plan
      const plan = plansManager.getPlanByName(data.planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Check if user already has usage record
      const existingUsage = await prisma.usage.findUnique({
        where: { userId: data.userId },
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

      // Initialize or update usage
      if (!existingUsage) {
        // New user - initialize everything
        await usageService.initializeUsage(data.userId, data.planId as PlanType);
        await usageService.initializeStudioCredits(data.userId, data.planId as PlanType);
      } else {
        // Existing user - update limits
        await usageService.updateLimitsOnPlanChange(data.userId, data.planId);
        
        // Reset monthly usage for new plan
        await usageService.resetMonthlyUsage(data.userId);
        
        // Reset studio credits for new plan
        await usageService.resetStudioCredits(data.userId);
      }

      return {
        success: true,
        message: 'Subscription created successfully',
        subscription,
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
   * Upgrade or downgrade plan
   */
  async changePlan(userId: string, newPlanId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
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

      // Calculate prorated amount
      const proratedAmount = this.calculateProratedAmount(user, currentPlan, newPlan);

      // Update subscription if exists
      if (activeSubscription) {
        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: {
            planName: newPlanId,
            planPrice: newPlan.price,
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
        isUpgrade: newPlan.price > (currentPlan?.price || 0),
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

    return {
      subscription,
      plan,
      daysRemaining,
      willAutoRenew: subscription.autoRenew,
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
   * Calculate prorated amount for plan changes
   */
  private calculateProratedAmount(user: any, currentPlan: any, newPlan: any): number {
    if (!user.planEndDate) return newPlan.price;

    const now = new Date();
    const endDate = new Date(user.planEndDate);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) return newPlan.price;

    const totalDays = 30; // 30-day billing cycle
    const currentPlanProration = ((currentPlan?.price || 0) / totalDays) * daysRemaining;
    const newPlanProration = (newPlan.price / totalDays) * daysRemaining;

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
}

export default new SubscriptionService();