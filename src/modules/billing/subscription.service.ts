// src/modules/billing/subscription.service.ts

/**
 * ==========================================
 * SUBSCRIPTION SERVICE - PLAN MANAGEMENT
 * ==========================================
 * Handles subscription creation, upgrades, cancellations
 * Last Updated: October 28, 2025 (Evening - Enum Uppercase Fix)
 *
 * CHANGES (October 28 Evening):
 * - ✅ FIXED: All enum values to UPPERCASE (PlanStatus)
 * - ✅ FIXED: 'active' → 'ACTIVE'
 * - ✅ FIXED: 'cancelled' → 'CANCELLED'
 * - ✅ FIXED: 'expired' → 'EXPIRED'
 * - ✅ REMOVED: 'cancelling' status (not in enum)
 *
 * PREVIOUS CHANGES:
 * - Updated to new plan names: STARTER (was vibe_free)
 * - Uses plansManager instead of PLANS object
 * - Class-based architecture maintained
 */

import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import usageService from './usage.service';

export class SubscriptionService {
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
      // Get plan using plansManager
      const plan = plansManager.getPlanByName(data.planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription

      // Create subscription record with correct field names
      const subscription = await prisma.subscription.create({
        data: {
          userId: data.userId,
          planName: data.planId, // ✅ planName not planId
          planPrice: data.amount, // ✅ planPrice not amount
          status: 'ACTIVE', // ✅ FIXED: uppercase
          startDate,
          endDate,
          paymentGateway: data.paymentMethod, // ✅ paymentGateway not paymentMethod
          gatewaySubscriptionId: data.transactionId, // ✅ gatewaySubscriptionId not transactionId
          autoRenew: true,
        },
      });

      // Update user's subscription plan
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          subscriptionPlan: data.planId,
          planStatus: 'ACTIVE', // ✅ FIXED: uppercase
          planStartDate: startDate,
          planEndDate: endDate,
        },
      });

      // Update usage limits
      await usageService.updateLimitsOnPlanChange(data.userId, data.planId);

      return {
        success: true,
        message: 'Subscription created successfully',
        subscription,
      };
    } catch (error: any) {
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
          status: 'ACTIVE', // ✅ FIXED: uppercase
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get current and new plans using plansManager
      const currentPlan = plansManager.getPlanByName(user.subscriptionPlan);
      const newPlan = plansManager.getPlanByName(newPlanId);

      if (!newPlan) {
        throw new Error('Invalid plan selected');
      }

      // Calculate prorated amount (for upgrades)
      const proratedAmount = this.calculateProratedAmount(user, currentPlan, newPlan);

      // Update subscription if exists
      if (activeSubscription) {
        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: {
            planName: newPlanId, // ✅ planName
            planPrice: newPlan.price, // ✅ planPrice
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

      return {
        success: true,
        message: 'Plan changed successfully',
        subscription: activeSubscription,
        proratedAmount,
        isUpgrade: newPlan.price > (currentPlan?.price || 0),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to change plan',
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, cancelImmediately: boolean = false) {
    try {
      // Get active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE', // ✅ FIXED: uppercase
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
            status: 'CANCELLED', // ✅ FIXED: uppercase
            endDate: new Date(),
            autoRenew: false,
            cancelledAt: new Date(), // ✅ Schema has cancelledAt
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionPlan: 'starter', // ✅ NEW: was 'vibe_free'
            planStatus: 'CANCELLED', // ✅ FIXED: uppercase
          },
        });

        // Reset to free plan limits
        await usageService.updateLimitsOnPlanChange(userId, 'starter'); // ✅ NEW

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
            // ✅ REMOVED: 'cancelling' status (not in enum)
            // Will be marked as CANCELLED when period ends
          },
        });

        return {
          success: true,
          message: 'Subscription will be cancelled at end of billing period',
          effectiveDate: subscription.endDate,
        };
      }
    } catch (error: any) {
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
          status: 'CANCELLED', // ✅ FIXED: only check CANCELLED
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
          status: 'ACTIVE', // ✅ FIXED: uppercase
          autoRenew: true,
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Extend for 1 month
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          planStatus: 'ACTIVE', // ✅ FIXED: uppercase
        },
      });

      return {
        success: true,
        message: 'Subscription reactivated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to reactivate subscription',
      };
    }
  }

  /**
   * Get subscription details
   */
  async getSubscriptionDetails(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE', // ✅ FIXED: uppercase
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

    // Get plan details using plansManager
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

  /**
   * Check and expire subscriptions (cron job)
   */
  async checkExpiredSubscriptions() {
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        endDate: { lte: new Date() },
        status: 'ACTIVE', // ✅ FIXED: uppercase
      },
    });

    let expiredCount = 0;

    for (const sub of expiredSubscriptions) {
      if (sub.autoRenew) {
        // TODO: Attempt to renew payment
        // For now, just mark as expired
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' }, // ✅ FIXED: uppercase
        });

        await prisma.user.update({
          where: { id: sub.userId },
          data: {
            subscriptionPlan: 'starter', // ✅ NEW: was 'vibe_free'
            planStatus: 'EXPIRED', // ✅ FIXED: uppercase
          },
        });

        // Reset to free plan
        await usageService.updateLimitsOnPlanChange(sub.userId, 'starter'); // ✅ NEW

        expiredCount++;
      } else {
        // Already marked for cancellation
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: 'CANCELLED', // ✅ FIXED: uppercase
            cancelledAt: new Date(),
          },
        });

        await prisma.user.update({
          where: { id: sub.userId },
          data: {
            subscriptionPlan: 'starter', // ✅ NEW: was 'vibe_free'
            planStatus: 'CANCELLED', // ✅ FIXED: uppercase
          },
        });

        await usageService.updateLimitsOnPlanChange(sub.userId, 'starter'); // ✅ NEW

        expiredCount++;
      }
    }

    return {
      success: true,
      message: `Processed ${expiredCount} expired subscriptions`,
    };
  }

  /**
   * Calculate prorated amount for plan changes
   */
  private calculateProratedAmount(user: any, currentPlan: any, newPlan: any): number {
    if (!user.planEndDate) return newPlan.price;

    const now = new Date();
    const endDate = new Date(user.planEndDate);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = 30; // Assuming 30-day billing cycle

    const currentPlanProration = ((currentPlan?.price || 0) / totalDays) * daysRemaining;
    const newPlanProration = (newPlan.price / totalDays) * daysRemaining;

    return Math.max(0, newPlanProration - currentPlanProration);
  }

  /**
   * Get revenue statistics (admin)
   */
  async getRevenueStats() {
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' }, // ✅ FIXED: uppercase
    });

    const totalRevenue = await prisma.subscription.aggregate({
      where: { status: 'ACTIVE' }, // ✅ FIXED: uppercase
      _sum: { planPrice: true }, // ✅ planPrice not amount
    });

    const revenueByPlan = await prisma.subscription.groupBy({
      by: ['planName'], // ✅ planName not planId
      where: { status: 'ACTIVE' }, // ✅ FIXED: uppercase
      _sum: { planPrice: true },
      _count: true,
    });

    return {
      activeSubscriptions,
      monthlyRecurringRevenue: totalRevenue._sum.planPrice || 0,
      revenueByPlan,
    };
  }

  /**
   * Get all active subscriptions (admin)
   */
  async getAllActiveSubscriptions() {
    return await prisma.subscription.findMany({
      where: { status: 'ACTIVE' }, // ✅ FIXED: uppercase
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
      where: { status: 'ACTIVE' }, // ✅ FIXED: uppercase
      _count: true,
    });

    return counts.map((item) => ({
      planName: item.planName,
      count: item._count,
    }));
  }
}

export default new SubscriptionService();
