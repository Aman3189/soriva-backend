// src/modules/billing/subscription.service.ts

/**
 * ==========================================
 * SUBSCRIPTION SERVICE - PLAN MANAGEMENT
 * ==========================================
 * Handles subscription creation, upgrades, cancellations
 * Last Updated: January 17, 2026 - Added PlanSync Integration
 *
 * CHANGES (January 17, 2026):
 * - ✅ ADDED: planSyncService integration for Usage + ImageUsage sync
 * - ✅ FIXED: Plan changes now sync all tables atomically
 * - ✅ FIXED: NEW TOKEN GENERATION on plan change (BUG FIX!)
 *
 * CHANGES (January 2026):
 * - ✅ REMOVED: initializeStudioCredits calls (migrated to images)
 * - ✅ REMOVED: resetStudioCredits calls (migrated to images)
 * - ✅ MAINTAINED: All other subscription logic
 *
 * CHANGES (November 12, 2025):
 * - ✅ FIXED: Regional pricing in changePlan()
 * - ✅ FIXED: Regional prorated amount calculation
 * - ✅ ADDED: Currency tracking in all transactions
 * - ✅ ADDED: Regional price validation in upgrades
 * - ✅ UPDATED: Helper methods for regional pricing
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
import { planSyncService } from './planSync.service';
import { generateAccessToken } from '@/shared/utils/jwt.util'; // ✅ NEW IMPORT

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
        select: { region: true, currency: true, email: true },
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

      // ✅ NEW: Use planSyncService for atomic update (User + Usage + ImageUsage)
      const syncResult = await planSyncService.updateUserPlanWithSync(
        data.userId,
        data.planId as PlanType,
        {
          resetUsage: true,    // Fresh start with new subscription
          extendCycle: true,   // New billing cycle
        }
      );

      if (!syncResult.success) {
        console.error('[SubscriptionService] Plan sync failed:', syncResult.message);
        // Fallback to old method if sync fails
        await prisma.user.update({
          where: { id: data.userId },
          data: {
            planType: data.planId as PlanType,
            planStatus: 'ACTIVE',
            planStartDate: startDate,
            planEndDate: endDate,
          },
        });
        await usageService.initializeUsage(data.userId, data.planId as PlanType);
      } else {
        // Update plan dates separately (sync doesn't handle these)
        await prisma.user.update({
          where: { id: data.userId },
          data: {
            planStatus: 'ACTIVE',
            planStartDate: startDate,
            planEndDate: endDate,
          },
        });
      }

      // ✅ NEW: Generate fresh token with updated planType
      const newToken = generateAccessToken({
        userId: data.userId,
        email: user!.email,
        planType: data.planId,
      });

      console.log(`[SubscriptionService] Subscription created for user ${data.userId}, plan: ${data.planId}`);

      return {
        success: true,
        message: 'Subscription created successfully',
        subscription,
        region: userRegion,
        currency: userCurrency,
        syncResult,
        newToken, // ✅ NEW: Return token for frontend
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
   * ✅ FIXED: Upgrade or downgrade plan with regional pricing + PlanSync + NEW TOKEN
   */
  async changePlan(userId: string, newPlanId: string) {
    try {
      // Get user with region info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true, // ✅ NEW: Need email for token
          planType: true,
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
      const currentPlan = plansManager.getPlanByName(user.planType);
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
          description: `Plan ${isUpgrade ? 'upgrade' : 'downgrade'}: ${user.planType} → ${newPlanId} (${userRegion})`,
        },
      });

      // Update subscription if exists
      if (activeSubscription) {
        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: {
            planName: newPlanId,
            planPrice: newPlanPrice,
          },
        });
      }

      // ✅ NEW: Use planSyncService for atomic update (User + Usage + ImageUsage)
      const syncResult = await planSyncService.updateUserPlanWithSync(
        userId,
        newPlanId as PlanType,
        {
          resetUsage: isUpgrade,  // Reset on upgrade, preserve on downgrade
          extendCycle: false,     // Keep current billing cycle
        }
      );

      if (!syncResult.success) {
        console.error('[SubscriptionService] Plan sync failed:', syncResult.message);
        // Fallback to old method
        await prisma.user.update({
          where: { id: userId },
          data: { planType: newPlanId as PlanType },
        });
        await usageService.updateLimitsOnPlanChange(userId, newPlanId);
        await usageService.resetMonthlyUsage(userId);
      }

      // ✅ NEW: Generate fresh token with updated planType
      const newToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        planType: newPlanId, // ✅ This is the NEW plan!
      });

      console.log(`[SubscriptionService] Plan changed: ${user.planType} → ${newPlanId} for user ${userId}`);
      console.log(`[SubscriptionService] New token generated with planType: ${newPlanId}`);

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
        syncResult,
        newToken, // ✅ NEW: Frontend MUST use this token!
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Change plan error:', error);
      return {
        success: false,
        message: error.message || 'Failed to change plan',
      };
    }
  }

  /**
   * Cancel subscription (immediate or end of period)
   */
  async cancelSubscription(userId: string, immediate: boolean = false) {
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

      // ✅ Get user email for token generation
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (immediate) {
        // Immediate cancellation
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            autoRenew: false,
          },
        });

        // ✅ NEW: Use planSyncService to downgrade to STARTER
        const syncResult = await planSyncService.updateUserPlanWithSync(
          userId,
          PlanType.STARTER,
          {
            resetUsage: true,
            extendCycle: false,
          }
        );

        await prisma.user.update({
          where: { id: userId },
          data: {
            planStatus: 'CANCELLED',
            planEndDate: new Date(),
          },
        });

        // ✅ NEW: Generate token with STARTER plan
        const newToken = generateAccessToken({
          userId,
          email: user!.email,
          planType: PlanType.STARTER,
        });

        console.log(`[SubscriptionService] Subscription cancelled immediately for user ${userId}`);

        return {
          success: true,
          message: 'Subscription cancelled immediately',
          syncResult,
          newToken, // ✅ NEW: Return new token
        };
      } else {
        // Cancel at end of period
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            autoRenew: false,
            cancelledAt: new Date(),
          },
        });

        console.log(`[SubscriptionService] Subscription marked for cancellation at period end for user ${userId}`);

        return {
          success: true,
          message: 'Subscription will be cancelled at the end of the billing period',
          endDate: subscription.endDate,
          // No new token needed - plan still active until end date
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
          status: { in: ['CANCELLED', 'EXPIRED'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription) {
        throw new Error('No cancelled subscription found');
      }

      // Check if subscription is still within the billing period
      const now = new Date();
      if (subscription.endDate && subscription.endDate < now) {
        throw new Error('Subscription period has ended. Please create a new subscription.');
      }

      // ✅ Get user email for token generation
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          autoRenew: true,
          cancelledAt: null,
        },
      });

      // ✅ NEW: Use planSyncService to restore plan
      const syncResult = await planSyncService.updateUserPlanWithSync(
        userId,
        subscription.planName as PlanType,
        {
          resetUsage: false,  // Preserve usage
          extendCycle: false,
        }
      );

      await prisma.user.update({
        where: { id: userId },
        data: {
          planStatus: 'ACTIVE',
        },
      });

      // ✅ NEW: Generate token with restored plan
      const newToken = generateAccessToken({
        userId,
        email: user!.email,
        planType: subscription.planName,
      });

      console.log(`[SubscriptionService] Subscription reactivated for user ${userId}`);

      return {
        success: true,
        message: 'Subscription reactivated successfully',
        subscription,
        syncResult,
        newToken, // ✅ NEW: Return new token
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Reactivate subscription error:', error);
      return {
        success: false,
        message: error.message || 'Failed to reactivate subscription',
      };
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          planType: true,
          planStatus: true,
          planStartDate: true,
          planEndDate: true,
          region: true,
          currency: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const plan = plansManager.getPlan(user.planType);
      const regionalPrice = plan ? this.getRegionalPrice(plan, user.region || Region.IN) : 0;

      return {
        success: true,
        data: {
          planType: user.planType,
          planStatus: user.planStatus,
          planStartDate: user.planStartDate,
          planEndDate: user.planEndDate,
          region: user.region,
          currency: user.currency,
          regionalPrice,
          subscription: subscription ? {
            id: subscription.id,
            status: subscription.status,
            autoRenew: subscription.autoRenew,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
          } : null,
        },
      };
    } catch (error: any) {
      console.error('[SubscriptionService] Get subscription status error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get subscription status',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRON JOB - EXPIRY MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check and expire subscriptions (cron job)
   * Note: This runs server-side, so no token refresh needed here
   * Users will get new token on next login
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
              planStatus: 'EXPIRED',
            },
          });

          // ✅ NEW: Use planSyncService to reset to STARTER
          await planSyncService.updateUserPlanWithSync(
            sub.userId,
            PlanType.STARTER,
            {
              resetUsage: true,
              extendCycle: false,
            }
          );

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
              planStatus: 'CANCELLED',
            },
          });

          // ✅ NEW: Use planSyncService to reset to STARTER
          await planSyncService.updateUserPlanWithSync(
            sub.userId,
            PlanType.STARTER,
            {
              resetUsage: true,
              extendCycle: false,
            }
          );

          expiredCount++;
        }
      }

      console.log(`[SubscriptionService] Processed ${expiredCount} expired subscriptions`);

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
            planType: true,
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