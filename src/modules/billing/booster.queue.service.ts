// src/modules/billing/booster.queue.service.ts

/**
 * ==========================================
 * SORIVA BOOSTER QUEUE SERVICE
 * ==========================================
 * Created by: Amandeep Singh, Punjab, India
 * Updated: November 21, 2025
 * Purpose: Manage addon booster queueing & activation
 * 
 * FEATURES:
 * - Max 2 addons per month per user
 * - Queue system: If 1 active, next purchase queues
 * - Auto-activation: When active expires, queued starts
 * - 7-day validity per addon
 * - Separate pool tracking
 * 
 * LOGIC:
 * - Purchase 1: Active immediately
 * - Purchase 2 (while 1 active): Queues, starts when 1 ends
 * - Purchase 3 (same month): Rejected (max 2/month)
 * ==========================================
 */

import { prisma } from '../../config/prisma';
import { BoosterCategory, Region } from '@prisma/client';
import {
  QueueCheckResult,
  QueueAddResult,
  QueuedBooster,
  BoosterStatus,
} from './booster.types';

export class BoosterQueueService {
  // ==========================================
  // QUEUE CHECK & VALIDATION
  // ==========================================

  /**
   * Check user's addon queue status
   * Returns active addon, queued boosters, and purchase eligibility
   */
  async checkAddonQueue(userId: string): Promise<QueueCheckResult> {
    try {
      // Get current month boundaries
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Find active addon (not expired)
      const activeAddon = await prisma.booster.findFirst({
        where: {
          userId,
          boosterCategory: BoosterCategory.ADDON,
          status: BoosterStatus.ACTIVE,
          expiresAt: { gte: now },
        },
        orderBy: { activatedAt: 'desc' },
      });

      // Find all addons this month (for count)
      const addonsThisMonth = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: BoosterCategory.ADDON,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      // Find queued boosters (future activatedAt)
      const queuedBoosters = await prisma.booster.findMany({
        where: {
          userId,
          boosterCategory: BoosterCategory.ADDON,
          status: BoosterStatus.ACTIVE,
          activatedAt: { gt: now }, // Future activation
        },
        orderBy: { activatedAt: 'asc' },
      });

      const maxPerMonth = 2; // From plans.ts
      const canPurchaseMore = addonsThisMonth < maxPerMonth;

      return {
        hasActiveAddon: !!activeAddon,
        activeAddonId: activeAddon?.id,
        activeAddonEndsAt: activeAddon?.expiresAt,
        queuedBoosters: queuedBoosters.map((b, index) => ({
          id: b.id,
          userId: b.userId,
          boosterCategory: b.boosterCategory,
          boosterType: b.boosterType,
          wordsAdded: b.wordsAdded || 0,
          creditsAdded: b.creditsAdded || 0,
          dailyBoost: b.wordsAdded ? Math.floor(b.wordsAdded / 7) : 0,
          validity: b.validity || 7,
          scheduledStartAt: b.activatedAt,
          scheduledEndAt: b.expiresAt,
          queuePosition: index + 1,
          status: 'queued' as const,
          createdAt: b.createdAt,
        })),
        canPurchaseMore,
        totalThisMonth: addonsThisMonth,
        maxPerMonth,
      };
    } catch (error) {
      console.error('[QueueService] Failed to check addon queue:', error);
      throw error;
    }
  }

  /**
   * Add addon to queue
   * If no active addon: activate immediately
   * If active addon exists: queue for activation when current expires
   */
  async addToQueue(data: {
    userId: string;
    boosterType: string;
    boosterName: string;
    boosterPrice: number;
    wordsAdded: number;
    creditsAdded: number;
    validity: number;
    planName: string;
    paymentMethod: string;
    transactionId?: string;
    region: Region;
    currency: string;
  }): Promise<QueueAddResult> {
    try {
      // Check current queue status
      const queueStatus = await this.checkAddonQueue(data.userId);

      if (!queueStatus.canPurchaseMore) {
        return {
          success: false,
          booster: null,
          status: 'active',
          startsAt: new Date(),
          endsAt: new Date(),
          message: `Maximum ${queueStatus.maxPerMonth} addon boosters per month reached`,
        };
      }

      // Determine start and end times
      let activatedAt: Date;
      let expiresAt: Date;
      let status: 'active' | 'queued';
      let queuePosition: number | undefined;

      if (!queueStatus.hasActiveAddon && queueStatus.queuedBoosters.length === 0) {
        // No active or queued boosters - activate immediately
        activatedAt = new Date();
        expiresAt = new Date(activatedAt);
        expiresAt.setDate(expiresAt.getDate() + data.validity);
        status = 'active';
      } else {
        // Calculate when this booster should start
        const lastBooster = queueStatus.queuedBoosters.length > 0
          ? queueStatus.queuedBoosters[queueStatus.queuedBoosters.length - 1]
          : null;

        if (lastBooster) {
          // Queue after last queued booster
          activatedAt = new Date(lastBooster.scheduledEndAt);
        } else if (queueStatus.activeAddonEndsAt) {
          // Queue after current active booster
          activatedAt = new Date(queueStatus.activeAddonEndsAt);
        } else {
          // Fallback: start now (shouldn't happen)
          activatedAt = new Date();
        }

        expiresAt = new Date(activatedAt);
        expiresAt.setDate(expiresAt.getDate() + data.validity);
        status = 'queued';
        queuePosition = queueStatus.queuedBoosters.length + 1;
      }

      // Create booster record
      const booster = await prisma.booster.create({
        data: {
          userId: data.userId,

          // Classification
          boosterCategory: BoosterCategory.ADDON,
          boosterType: data.boosterType,
          boosterName: data.boosterName,
          boosterPrice: data.boosterPrice * 100, // Convert to paise

          // Region & Currency
          region: data.region,
          currency: data.currency as any,

          // Addon-specific fields
          wordsAdded: data.wordsAdded,
          creditsAdded: data.creditsAdded,
          validity: data.validity,
          distributionLogic: `Daily spread: ${data.wordsAdded} ÷ ${data.validity} days`,

          // Cooldown fields (null for addon)
          wordsUnlocked: null,
          cooldownDuration: null,
          maxPerPlanPeriod: null,
          cooldownEnd: null,

          // Tracking
          wordsUsed: 0,
          wordsRemaining: data.wordsAdded,
          creditsUsed: 0,
          creditsRemaining: data.creditsAdded,

          // Status & timing
          status: BoosterStatus.ACTIVE, // Even queued ones are "active" status
          activatedAt,
          expiresAt,

          // Payment
          paymentGateway: data.paymentMethod,
          gatewayPaymentId: data.transactionId,

          // Metadata
          planName: data.planName,
          description: `Addon booster: ${data.wordsAdded} words + ${data.creditsAdded} credits for ${data.validity} days`,
        },
      });

      return {
        success: true,
        booster,
        status,
        startsAt: activatedAt,
        endsAt: expiresAt,
        queuePosition,
        message: status === 'active'
          ? 'Addon booster activated immediately'
          : `Addon booster queued. Will activate on ${activatedAt.toLocaleDateString()}`,
      };
    } catch (error) {
      console.error('[QueueService] Failed to add to queue:', error);
      throw error;
    }
  }

  // ==========================================
  // QUEUE PROCESSING (Cron Job)
  // ==========================================

  /**
   * Process expired addons and activate queued ones
   * Should run as a cron job (every hour or daily)
   */
  async processQueue(): Promise<{ activated: number; expired: number }> {
    try {
      const now = new Date();
      let activatedCount = 0;
      let expiredCount = 0;

      // 1. Mark expired boosters
      const expiredResult = await prisma.booster.updateMany({
        where: {
          boosterCategory: BoosterCategory.ADDON,
          status: BoosterStatus.ACTIVE,
          expiresAt: { lte: now },
          activatedAt: { lte: now }, // Only currently active ones
        },
        data: {
          status: BoosterStatus.EXPIRED,
        },
      });

      expiredCount = expiredResult.count;

      // 2. Find queued boosters that should activate now
      const readyToActivate = await prisma.booster.findMany({
        where: {
          boosterCategory: BoosterCategory.ADDON,
          status: BoosterStatus.ACTIVE,
          activatedAt: { lte: now }, // Scheduled to start now or earlier
          expiresAt: { gte: now },   // Not yet expired
        },
      });

      // Note: These boosters are already "active" in DB, but their activatedAt
      // is in the past/now, so they're effectively transitioning from queued to live

      activatedCount = readyToActivate.length;

      console.log(`[QueueService] Processed queue: ${activatedCount} activated, ${expiredCount} expired`);

      return { activated: activatedCount, expired: expiredCount };
    } catch (error) {
      console.error('[QueueService] Failed to process queue:', error);
      return { activated: 0, expired: 0 };
    }
  }

  // ==========================================
  // QUEUE QUERIES
  // ==========================================

  /**
   * Get all queued boosters for a user
   */
  async getQueuedBoosters(userId: string): Promise<QueuedBooster[]> {
    try {
      const now = new Date();

      const boosters = await prisma.booster.findMany({
        where: {
          userId,
          boosterCategory: BoosterCategory.ADDON,
          status: BoosterStatus.ACTIVE,
          activatedAt: { gt: now }, // Future activation
        },
        orderBy: { activatedAt: 'asc' },
      });

      return boosters.map((b, index) => ({
        id: b.id,
        userId: b.userId,
        boosterCategory: b.boosterCategory,
        boosterType: b.boosterType,
        wordsAdded: b.wordsAdded || 0,
        creditsAdded: b.creditsAdded || 0,
        dailyBoost: b.wordsAdded ? Math.floor(b.wordsAdded / 7) : 0,
        validity: b.validity || 7,
        scheduledStartAt: b.activatedAt,
        scheduledEndAt: b.expiresAt,
        queuePosition: index + 1,
        status: 'queued' as const,
        createdAt: b.createdAt,
      }));
    } catch (error) {
      console.error('[QueueService] Failed to get queued boosters:', error);
      return [];
    }
  }

  /**
   * Cancel a queued booster (admin only)
   */
  async cancelQueuedBooster(boosterId: string): Promise<boolean> {
    try {
      const now = new Date();

      // Only cancel if not yet active
      const booster = await prisma.booster.findUnique({
        where: { id: boosterId },
      });

      if (!booster) return false;

      if (booster.activatedAt > now) {
        // Still queued, can cancel
        await prisma.booster.update({
          where: { id: boosterId },
          data: { status: BoosterStatus.CANCELLED },
        });
        return true;
      }

      return false; // Already active, can't cancel
    } catch (error) {
      console.error('[QueueService] Failed to cancel queued booster:', error);
      return false;
    }
  }

  // ==========================================
  // MONTHLY RESET CHECK
  // ==========================================

  /**
   * Check if user can purchase more addons this month
   */
  async canPurchaseThisMonth(userId: string): Promise<{
    canPurchase: boolean;
    purchased: number;
    remaining: number;
    maxPerMonth: number;
  }> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const purchased = await prisma.booster.count({
        where: {
          userId,
          boosterCategory: BoosterCategory.ADDON,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const maxPerMonth = 2; // From plans.ts
      const remaining = Math.max(0, maxPerMonth - purchased);

      return {
        canPurchase: purchased < maxPerMonth,
        purchased,
        remaining,
        maxPerMonth,
      };
    } catch (error) {
      console.error('[QueueService] Failed to check monthly limit:', error);
      return {
        canPurchase: false,
        purchased: 0,
        remaining: 0,
        maxPerMonth: 2,
      };
    }
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export default new BoosterQueueService();
