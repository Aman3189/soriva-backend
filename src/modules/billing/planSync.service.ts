// src/modules/billing/planSync.service.ts

/**
 * ==========================================
 * SORIVA BACKEND - PLAN SYNC SERVICE
 * ==========================================
 * Created: January 17, 2026
 * Author: Amandeep, Punjab, India
 *
 * PURPOSE:
 * - Auto-update Usage table when user plan changes
 * - Auto-update ImageUsage table when user plan changes
 * - Keep all tables in sync with user's current plan
 *
 * USAGE:
 * - Call syncUserPlan() after updating user.planType
 * - Or use updateUserPlanWithSync() for atomic update
 */

import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import { Region } from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PlanSyncResult {
  success: boolean;
  message: string;
  oldPlan: PlanType;
  newPlan: PlanType;
  usageUpdated: boolean;
  imageUsageUpdated: boolean;
  changes: {
    usage?: {
      monthlyLimit: { old: number; new: number };
      dailyLimit: { old: number; new: number };
      premiumTokensTotal?: { old: number; new: number };
      dailyTokenLimit?: { old: number; new: number };
    };
    imageUsage?: {
      klein9bImagesLimit: { old: number; new: number };
    };
  };
}

interface UsageLimitsFromPlan {
  monthlyWords: number;
  dailyWords: number;
  monthlyTokens: number;
  dailyTokens: number;
}

interface ImageLimitsFromPlan {
  klein9bImages: number;
  totalImages: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN SYNC SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PlanSyncService {
  
  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * MAIN METHOD: Sync all tables after plan change
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Call this AFTER updating user.planType
   */
  async syncUserPlan(userId: string, newPlanType: PlanType): Promise<PlanSyncResult> {
    try {
      // Get current user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          planType: true,
          region: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          oldPlan: PlanType.STARTER,
          newPlan: newPlanType,
          usageUpdated: false,
          imageUsageUpdated: false,
          changes: {},
        };
      }

      const oldPlanType = user.planType;
      const isInternational = user.region === Region.INTL;

      // Get new plan limits from plansManager
      const newUsageLimits = this.getUsageLimitsFromPlan(newPlanType, isInternational);
      const newImageLimits = this.getImageLimitsFromPlan(newPlanType, isInternational);

      const changes: PlanSyncResult['changes'] = {};

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // TRANSACTION: Update both tables atomically
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const result = await prisma.$transaction(async (tx) => {
        let usageUpdated = false;
        let imageUsageUpdated = false;

        // ──────────────────────────────────────────────────────
        // 1. UPDATE USAGE TABLE
        // ──────────────────────────────────────────────────────
        const currentUsage = await tx.usage.findUnique({
          where: { userId },
          select: {
            monthlyLimit: true,
            dailyLimit: true,
            premiumTokensTotal: true,
            dailyTokenLimit: true,
            wordsUsed: true,
            dailyWordsUsed: true,
            premiumTokensUsed: true,
            dailyTokensUsed: true,
          },
        });

        if (currentUsage) {
          // Calculate new remaining values (preserve used amounts)
          const newRemainingWords = Math.max(0, newUsageLimits.monthlyWords - (currentUsage.wordsUsed || 0));
          const newRemainingDailyWords = Math.max(0, newUsageLimits.dailyWords - (currentUsage.dailyWordsUsed || 0));
          const newPremiumTokensRemaining = Math.max(0, newUsageLimits.monthlyTokens - (currentUsage.premiumTokensUsed || 0));
          const newDailyTokensRemaining = Math.max(0, newUsageLimits.dailyTokens - (currentUsage.dailyTokensUsed || 0));

          await tx.usage.update({
            where: { userId },
            data: {
              // Word limits
              monthlyLimit: newUsageLimits.monthlyWords,
              dailyLimit: newUsageLimits.dailyWords,
              remainingWords: newRemainingWords,
              
              // Token limits
              premiumTokensTotal: newUsageLimits.monthlyTokens,
              premiumTokensRemaining: newPremiumTokensRemaining,
              dailyTokenLimit: newUsageLimits.dailyTokens,
              dailyTokensRemaining: newDailyTokensRemaining,
              
              updatedAt: new Date(),
            },
          });

          usageUpdated = true;
          changes.usage = {
            monthlyLimit: { old: currentUsage.monthlyLimit, new: newUsageLimits.monthlyWords },
            dailyLimit: { old: currentUsage.dailyLimit, new: newUsageLimits.dailyWords },
            premiumTokensTotal: { old: currentUsage.premiumTokensTotal || 0, new: newUsageLimits.monthlyTokens },
            dailyTokenLimit: { old: currentUsage.dailyTokenLimit || 0, new: newUsageLimits.dailyTokens },
          };

          console.log(`[PlanSync] Usage updated for user ${userId}:`, {
            monthlyLimit: `${currentUsage.monthlyLimit} → ${newUsageLimits.monthlyWords}`,
            dailyLimit: `${currentUsage.dailyLimit} → ${newUsageLimits.dailyWords}`,
          });
        }

        // ──────────────────────────────────────────────────────
        // 2. UPDATE IMAGE USAGE TABLE
        // ──────────────────────────────────────────────────────
        const currentImageUsage = await tx.imageUsage.findUnique({
          where: { userId },
          select: {
            klein9bImagesLimit: true,
            klein9bImagesUsed: true,
          },
        });

        if (currentImageUsage) {
          await tx.imageUsage.update({
            where: { userId },
            data: {
              klein9bImagesLimit: newImageLimits.klein9bImages,
              updatedAt: new Date(),
            },
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            klein9bImagesLimit: { old: currentImageUsage.klein9bImagesLimit, new: newImageLimits.klein9bImages },
          };

          console.log(`[PlanSync] ImageUsage updated for user ${userId}:`, {
            klein9bLimit: `${currentImageUsage.klein9bImagesLimit} → ${newImageLimits.klein9bImages}`,
          });
        } else {
          // Create ImageUsage if doesn't exist
          const now = new Date();
          const cycleEnd = new Date(now);
          cycleEnd.setMonth(cycleEnd.getMonth() + 1);

          await tx.imageUsage.create({
            data: {
              userId,
              klein9bImagesLimit: newImageLimits.klein9bImages,
              klein9bImagesUsed: 0,
              totalImagesGenerated: 0,
              boosterKlein9bImages: 0,
              cycleStartDate: now,
              cycleEndDate: cycleEnd,
              lastMonthlyReset: now,
            },
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            klein9bImagesLimit: { old: 0, new: newImageLimits.klein9bImages },
          };

          console.log(`[PlanSync] ImageUsage created for user ${userId}`);
        }

        return { usageUpdated, imageUsageUpdated };
      });

      return {
        success: true,
        message: `Plan synced successfully: ${oldPlanType} → ${newPlanType}`,
        oldPlan: oldPlanType,
        newPlan: newPlanType,
        usageUpdated: result.usageUpdated,
        imageUsageUpdated: result.imageUsageUpdated,
        changes,
      };

    } catch (error: any) {
      console.error('[PlanSync] Failed to sync user plan:', error);
      return {
        success: false,
        message: `Sync failed: ${error.message}`,
        oldPlan: PlanType.STARTER,
        newPlan: newPlanType,
        usageUpdated: false,
        imageUsageUpdated: false,
        changes: {},
      };
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * ATOMIC METHOD: Update user plan + sync all tables in one go
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Use this instead of directly updating user.planType
   */
  async updateUserPlanWithSync(
    userId: string, 
    newPlanType: PlanType,
    options?: {
      resetUsage?: boolean;      // Reset used amounts to 0
      extendCycle?: boolean;     // Extend billing cycle
      preserveBoosters?: boolean; // Keep active boosters
    }
  ): Promise<PlanSyncResult & { userUpdated: boolean }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, region: true },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          oldPlan: PlanType.STARTER,
          newPlan: newPlanType,
          usageUpdated: false,
          imageUsageUpdated: false,
          userUpdated: false,
          changes: {},
        };
      }

      const oldPlanType = user.planType;
      const isInternational = user.region === Region.INTL;
      const newUsageLimits = this.getUsageLimitsFromPlan(newPlanType, isInternational);
      const newImageLimits = this.getImageLimitsFromPlan(newPlanType, isInternational);

      const changes: PlanSyncResult['changes'] = {};

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ATOMIC TRANSACTION: User + Usage + ImageUsage
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const result = await prisma.$transaction(async (tx) => {
        // 1. UPDATE USER TABLE
        await tx.user.update({
          where: { id: userId },
          data: {
            planType: newPlanType,
            planStartDate: options?.extendCycle ? new Date() : undefined,
            updatedAt: new Date(),
          },
        });

        // 2. UPDATE USAGE TABLE
        const currentUsage = await tx.usage.findUnique({
          where: { userId },
        });

        let usageUpdated = false;
        if (currentUsage) {
          const usageUpdateData: any = {
            monthlyLimit: newUsageLimits.monthlyWords,
            dailyLimit: newUsageLimits.dailyWords,
            premiumTokensTotal: newUsageLimits.monthlyTokens,
            dailyTokenLimit: newUsageLimits.dailyTokens,
            updatedAt: new Date(),
          };

          if (options?.resetUsage) {
            // Full reset - new plan starts fresh
            usageUpdateData.wordsUsed = 0;
            usageUpdateData.dailyWordsUsed = 0;
            usageUpdateData.remainingWords = newUsageLimits.monthlyWords;
            usageUpdateData.premiumTokensUsed = 0;
            usageUpdateData.premiumTokensRemaining = newUsageLimits.monthlyTokens;
            usageUpdateData.dailyTokensUsed = 0;
            usageUpdateData.dailyTokensRemaining = newUsageLimits.dailyTokens;
          } else {
            // Preserve used amounts, just update limits
            usageUpdateData.remainingWords = Math.max(0, newUsageLimits.monthlyWords - currentUsage.wordsUsed);
            usageUpdateData.premiumTokensRemaining = Math.max(0, newUsageLimits.monthlyTokens - (currentUsage.premiumTokensUsed || 0));
            usageUpdateData.dailyTokensRemaining = Math.max(0, newUsageLimits.dailyTokens - (currentUsage.dailyTokensUsed || 0));
          }

          await tx.usage.update({
            where: { userId },
            data: usageUpdateData,
          });

          usageUpdated = true;
          changes.usage = {
            monthlyLimit: { old: currentUsage.monthlyLimit, new: newUsageLimits.monthlyWords },
            dailyLimit: { old: currentUsage.dailyLimit, new: newUsageLimits.dailyWords },
          };
        }

        // 3. UPDATE IMAGE USAGE TABLE
        const currentImageUsage = await tx.imageUsage.findUnique({
          where: { userId },
        });

        let imageUsageUpdated = false;
        if (currentImageUsage) {
          const imageUpdateData: any = {
            klein9bImagesLimit: newImageLimits.klein9bImages,
            updatedAt: new Date(),
          };

          if (options?.resetUsage) {
            imageUpdateData.klein9bImagesUsed = 0;
          }

          await tx.imageUsage.update({
            where: { userId },
            data: imageUpdateData,
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            klein9bImagesLimit: { old: currentImageUsage.klein9bImagesLimit, new: newImageLimits.klein9bImages },
          };
        }

        return { usageUpdated, imageUsageUpdated };
      });

      console.log(`[PlanSync] Plan changed atomically: ${oldPlanType} → ${newPlanType} for user ${userId}`);

      return {
        success: true,
        message: `Plan updated and synced: ${oldPlanType} → ${newPlanType}`,
        oldPlan: oldPlanType,
        newPlan: newPlanType,
        usageUpdated: result.usageUpdated,
        imageUsageUpdated: result.imageUsageUpdated,
        userUpdated: true,
        changes,
      };

    } catch (error: any) {
      console.error('[PlanSync] Atomic update failed:', error);
      return {
        success: false,
        message: `Update failed: ${error.message}`,
        oldPlan: PlanType.STARTER,
        newPlan: newPlanType,
        usageUpdated: false,
        imageUsageUpdated: false,
        userUpdated: false,
        changes: {},
      };
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HELPER: Get usage limits from plansManager
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private getUsageLimitsFromPlan(planType: PlanType, isInternational: boolean = false): UsageLimitsFromPlan {
    const plan = plansManager.getPlan(planType);
    
    if (!plan) {
      // Fallback to STARTER limits
      return {
        monthlyWords: 15000,
        dailyWords: 1000,
        monthlyTokens: 50000,
        dailyTokens: 5000,
      };
    }

    const limits = isInternational && plan.limitsInternational 
      ? plan.limitsInternational 
      : plan.limits;

    return {
      monthlyWords: limits.monthlyWords,
      dailyWords: limits.dailyWords,
      monthlyTokens: limits.monthlyTokens || limits.monthlyWords * 4, // Approx 4 tokens per word
      dailyTokens: limits.dailyTokens || limits.dailyWords * 4,
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HELPER: Get image limits from plansManager
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private getImageLimitsFromPlan(planType: PlanType, isInternational: boolean = false): ImageLimitsFromPlan {
    const imageLimits = plansManager.getImageLimits(planType, isInternational);
    
    return {
      klein9bImages: imageLimits.klein9bImages,
      totalImages: imageLimits.totalImages,
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * UTILITY: Check if tables are in sync with user's plan
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  async checkSyncStatus(userId: string): Promise<{
    inSync: boolean;
    issues: string[];
    currentPlan: PlanType;
    usageLimits: { actual: any; expected: any };
    imageLimits: { actual: any; expected: any };
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, region: true },
      });

      if (!user) {
        return {
          inSync: false,
          issues: ['User not found'],
          currentPlan: PlanType.STARTER,
          usageLimits: { actual: null, expected: null },
          imageLimits: { actual: null, expected: null },
        };
      }

      const isInternational = user.region === Region.INTL;
      const expectedUsage = this.getUsageLimitsFromPlan(user.planType, isInternational);
      const expectedImage = this.getImageLimitsFromPlan(user.planType, isInternational);

      const [usage, imageUsage] = await Promise.all([
        prisma.usage.findUnique({ where: { userId } }),
        prisma.imageUsage.findUnique({ where: { userId } }),
      ]);

      const issues: string[] = [];

      // Check Usage sync
      if (usage) {
        if (usage.monthlyLimit !== expectedUsage.monthlyWords) {
          issues.push(`Usage.monthlyLimit mismatch: ${usage.monthlyLimit} vs expected ${expectedUsage.monthlyWords}`);
        }
        if (usage.dailyLimit !== expectedUsage.dailyWords) {
          issues.push(`Usage.dailyLimit mismatch: ${usage.dailyLimit} vs expected ${expectedUsage.dailyWords}`);
        }
      } else {
        issues.push('Usage record not found');
      }

      // Check ImageUsage sync
      if (imageUsage) {
        if (imageUsage.klein9bImagesLimit !== expectedImage.klein9bImages) {
          issues.push(`ImageUsage.klein9bImagesLimit mismatch: ${imageUsage.klein9bImagesLimit} vs expected ${expectedImage.klein9bImages}`);
        }
      } else {
        issues.push('ImageUsage record not found');
      }

      return {
        inSync: issues.length === 0,
        issues,
        currentPlan: user.planType,
        usageLimits: {
          actual: usage ? { monthly: usage.monthlyLimit, daily: usage.dailyLimit } : null,
          expected: { monthly: expectedUsage.monthlyWords, daily: expectedUsage.dailyWords },
        },
        imageLimits: {
          actual: imageUsage ? { klein9b: imageUsage.klein9bImagesLimit } : null,
          expected: { klein9b: expectedImage.klein9bImages },
        },
      };

    } catch (error: any) {
      return {
        inSync: false,
        issues: [`Check failed: ${error.message}`],
        currentPlan: PlanType.STARTER,
        usageLimits: { actual: null, expected: null },
        imageLimits: { actual: null, expected: null },
      };
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * BATCH: Fix all out-of-sync users (Admin utility)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  async fixAllOutOfSyncUsers(): Promise<{
    totalChecked: number;
    outOfSync: number;
    fixed: number;
    failed: string[];
  }> {
    const users = await prisma.user.findMany({
      select: { id: true, planType: true },
    });

    let outOfSync = 0;
    let fixed = 0;
    const failed: string[] = [];

    for (const user of users) {
      const status = await this.checkSyncStatus(user.id);
      
      if (!status.inSync) {
        outOfSync++;
        const result = await this.syncUserPlan(user.id, user.planType);
        
        if (result.success) {
          fixed++;
        } else {
          failed.push(user.id);
        }
      }
    }

    console.log(`[PlanSync] Batch fix complete: ${fixed}/${outOfSync} fixed out of ${users.length} users`);

    return {
      totalChecked: users.length,
      outOfSync,
      fixed,
      failed,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const planSyncService = new PlanSyncService();
export default planSyncService;