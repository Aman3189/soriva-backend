// src/modules/billing/planSync.service.ts

/**
 * ==========================================
 * SORIVA BACKEND - PLAN SYNC SERVICE v12.0
 * ==========================================
 * Created: January 17, 2026
 * Updated: February 22, 2026 - v12.0 2-Model Image System
 * Author: Amandeep, Punjab, India
 *
 * PURPOSE:
 * - Auto-update Usage table when user plan changes
 * - Auto-update UserUsage table when user plan changes (planName sync)
 * - Auto-update ImageUsage table when user plan changes (2-Model System)
 * - Keep all tables in sync with user's current plan
 * - Support LITE plan (free tier with Schnell images)
 *
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 * 
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 * 
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25/image - General images
 *    - GPT LOW (OpenAI gpt-image-1.5): ₹1.18/image - Text, Ads, Festivals
 *
 * ==========================================
 * PREVIOUS CHANGES:
 * ==========================================
 * - January 23, 2026: UserUsage table sync (planName field)
 * - January 19, 2026: LITE plan support, Schnell image quota handling
 * - January 17, 2026: Initial creation with Klein 9B support
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
  userUsageUpdated: boolean;
  changes: {
    usage?: {
      monthlyLimit: { old: number; new: number };
      dailyLimit: { old: number; new: number };
      premiumTokensTotal?: { old: number; new: number };
      dailyTokenLimit?: { old: number; new: number };
    };
    imageUsage?: {
      // v12.0: Changed from klein9b to gptLow
      schnellImagesLimit: { old: number; new: number };
      gptLowImagesLimit: { old: number; new: number };
    };
    userUsage?: {
      planName: { old: string; new: string };
    };
  };
}

interface UsageLimitsFromPlan {
  monthlyWords: number;
  dailyWords: number;
  monthlyTokens: number;
  dailyTokens: number;
}

/**
 * v12.0: Simplified to 2-model system
 */
interface ImageLimitsFromPlan {
  schnellImages: number;
  gptLowImages: number;
  totalImages: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN SYNC SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PlanSyncService {
  
  constructor() {
    console.log('[PlanSyncService] ✅ v12.0 Ready (2-Model System: Schnell + GPT LOW)');
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * MAIN METHOD: Sync all tables after plan change
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Call this AFTER updating user.planType
   * v12.0: Now handles Schnell + GPT LOW quotas
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
          userUsageUpdated: false,
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
      // TRANSACTION: Update all tables atomically
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const result = await prisma.$transaction(async (tx) => {
        let usageUpdated = false;
        let imageUsageUpdated = false;
        let userUsageUpdated = false;

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
        // 2. UPDATE IMAGE USAGE TABLE (v12.0: 2-Model System)
        // ──────────────────────────────────────────────────────
        const currentImageUsage = await tx.imageUsage.findUnique({
          where: { userId },
          select: {
            schnellImagesLimit: true,
            schnellImagesUsed: true,
            gptLowImagesLimit: true,
            gptLowImagesUsed: true,
          },
        });

        if (currentImageUsage) {
          await tx.imageUsage.update({
            where: { userId },
            data: {
              schnellImagesLimit: newImageLimits.schnellImages,
              gptLowImagesLimit: newImageLimits.gptLowImages,
              updatedAt: new Date(),
            },
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            schnellImagesLimit: { old: currentImageUsage.schnellImagesLimit || 0, new: newImageLimits.schnellImages },
            gptLowImagesLimit: { old: currentImageUsage.gptLowImagesLimit || 0, new: newImageLimits.gptLowImages },
          };

          console.log(`[PlanSync] ImageUsage updated for user ${userId}:`, {
            schnellLimit: `${currentImageUsage.schnellImagesLimit || 0} → ${newImageLimits.schnellImages}`,
            gptLowLimit: `${currentImageUsage.gptLowImagesLimit || 0} → ${newImageLimits.gptLowImages}`,
          });
        } else {
          // Create ImageUsage if doesn't exist
          const now = new Date();
          const cycleEnd = new Date(now);
          cycleEnd.setMonth(cycleEnd.getMonth() + 1);

          await tx.imageUsage.create({
            data: {
              userId,
              // Schnell (Budget) - ₹0.25
              schnellImagesLimit: newImageLimits.schnellImages,
              schnellImagesUsed: 0,
              boosterSchnellImages: 0,
              // GPT LOW (Premium) - ₹1.18
              gptLowImagesLimit: newImageLimits.gptLowImages,
              gptLowImagesUsed: 0,
              boosterGptLowImages: 0,
              // General
              totalImagesGenerated: 0,
              cycleStartDate: now,
              cycleEndDate: cycleEnd,
              lastMonthlyReset: now,
            },
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            schnellImagesLimit: { old: 0, new: newImageLimits.schnellImages },
            gptLowImagesLimit: { old: 0, new: newImageLimits.gptLowImages },
          };

          console.log(`[PlanSync] ImageUsage created for user ${userId}:`, {
            schnell: newImageLimits.schnellImages,
            gptLow: newImageLimits.gptLowImages,
          });
        }

        // ──────────────────────────────────────────────────────
        // 3. UPDATE USER_USAGE TABLE (Token tracking + planName sync)
        // ──────────────────────────────────────────────────────
        const now = new Date();
        const currentUserUsage = await tx.userUsage.findUnique({
          where: { userId },
        });

        if (currentUserUsage) {
          const oldPlanName = (currentUserUsage as any).planName || 'STARTER';
          
          await tx.userUsage.update({
            where: { userId },
            data: {
              planName: newPlanType,
              updatedAt: now,
            },
          });
          
          userUsageUpdated = true;
          changes.userUsage = {
            planName: { old: oldPlanName, new: newPlanType },
          };
          
          console.log(`[PlanSync] UserUsage.planName updated: ${oldPlanName} → ${newPlanType}`);
        } else {
          // Create UserUsage if doesn't exist
          const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
          const dayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const monthFromNow = new Date(now);
          monthFromNow.setMonth(monthFromNow.getMonth() + 1);

          await tx.userUsage.create({
            data: {
              userId,
              planName: newPlanType,
              tokensUsedMonthly: 0,
              tokensUsedDaily: 0,
              requestsThisMinute: 0,
              requestsThisHour: 0,
              voiceMinutesUsed: 0,
              monthlyResetAt: monthFromNow,
              dailyResetAt: dayFromNow,
              minuteResetAt: now,
              hourResetAt: hourFromNow,
            },
          });
          
          userUsageUpdated = true;
          changes.userUsage = {
            planName: { old: 'none', new: newPlanType },
          };
          
          console.log(`[PlanSync] UserUsage created for user ${userId} with planName=${newPlanType}`);
        }

        return { usageUpdated, imageUsageUpdated, userUsageUpdated };
      });

      return {
        success: true,
        message: `Plan synced successfully: ${oldPlanType} → ${newPlanType}`,
        oldPlan: oldPlanType,
        newPlan: newPlanType,
        usageUpdated: result.usageUpdated,
        imageUsageUpdated: result.imageUsageUpdated,
        userUsageUpdated: result.userUsageUpdated,
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
        userUsageUpdated: false,
        changes: {},
      };
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * ATOMIC METHOD: Update user plan + sync all tables in one go
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Use this instead of directly updating user.planType
   * v12.0: Handles Schnell + GPT LOW quotas
   */
  async updateUserPlanWithSync(
    userId: string, 
    newPlanType: PlanType,
    options?: {
      resetUsage?: boolean;
      extendCycle?: boolean;
      preserveBoosters?: boolean;
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
          userUsageUpdated: false,
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
      // ATOMIC TRANSACTION: User + Usage + ImageUsage + UserUsage
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const result = await prisma.$transaction(async (tx) => {
        let usageUpdated = false;
        let imageUsageUpdated = false;
        let userUsageUpdated = false;

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

        if (currentUsage) {
          const usageUpdateData: any = {
            monthlyLimit: newUsageLimits.monthlyWords,
            dailyLimit: newUsageLimits.dailyWords,
            premiumTokensTotal: newUsageLimits.monthlyTokens,
            dailyTokenLimit: newUsageLimits.dailyTokens,
            updatedAt: new Date(),
          };

          if (options?.resetUsage) {
            usageUpdateData.wordsUsed = 0;
            usageUpdateData.dailyWordsUsed = 0;
            usageUpdateData.remainingWords = newUsageLimits.monthlyWords;
            usageUpdateData.premiumTokensUsed = 0;
            usageUpdateData.premiumTokensRemaining = newUsageLimits.monthlyTokens;
            usageUpdateData.dailyTokensUsed = 0;
            usageUpdateData.dailyTokensRemaining = newUsageLimits.dailyTokens;
          } else {
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

        // 3. UPDATE IMAGE USAGE TABLE (v12.0: Schnell + GPT LOW)
        const currentImageUsage = await tx.imageUsage.findUnique({
          where: { userId },
        });

        if (currentImageUsage) {
          const imageUpdateData: any = {
            schnellImagesLimit: newImageLimits.schnellImages,
            gptLowImagesLimit: newImageLimits.gptLowImages,
            updatedAt: new Date(),
          };

          if (options?.resetUsage) {
            imageUpdateData.schnellImagesUsed = 0;
            imageUpdateData.gptLowImagesUsed = 0;
          }

          await tx.imageUsage.update({
            where: { userId },
            data: imageUpdateData,
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            schnellImagesLimit: { old: currentImageUsage.schnellImagesLimit || 0, new: newImageLimits.schnellImages },
            gptLowImagesLimit: { old: currentImageUsage.gptLowImagesLimit || 0, new: newImageLimits.gptLowImages },
          };
        } else {
          const now = new Date();
          const cycleEnd = new Date(now);
          cycleEnd.setMonth(cycleEnd.getMonth() + 1);

          await tx.imageUsage.create({
            data: {
              userId,
              schnellImagesLimit: newImageLimits.schnellImages,
              schnellImagesUsed: 0,
              boosterSchnellImages: 0,
              gptLowImagesLimit: newImageLimits.gptLowImages,
              gptLowImagesUsed: 0,
              boosterGptLowImages: 0,
              totalImagesGenerated: 0,
              cycleStartDate: now,
              cycleEndDate: cycleEnd,
              lastMonthlyReset: now,
            },
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            schnellImagesLimit: { old: 0, new: newImageLimits.schnellImages },
            gptLowImagesLimit: { old: 0, new: newImageLimits.gptLowImages },
          };
        }

        // 4. UPDATE USER_USAGE TABLE (planName sync)
        const now = new Date();
        const currentUserUsage = await tx.userUsage.findUnique({
          where: { userId },
        });

        if (currentUserUsage) {
          const oldPlanName = (currentUserUsage as any).planName || 'STARTER';
          
          await tx.userUsage.update({
            where: { userId },
            data: {
              planName: newPlanType,
              updatedAt: now,
            },
          });
          
          userUsageUpdated = true;
          changes.userUsage = {
            planName: { old: oldPlanName, new: newPlanType },
          };
        } else {
          const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
          const dayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const monthFromNow = new Date(now);
          monthFromNow.setMonth(monthFromNow.getMonth() + 1);

          await tx.userUsage.create({
            data: {
              userId,
              planName: newPlanType,
              tokensUsedMonthly: 0,
              tokensUsedDaily: 0,
              requestsThisMinute: 0,
              requestsThisHour: 0,
              voiceMinutesUsed: 0,
              monthlyResetAt: monthFromNow,
              dailyResetAt: dayFromNow,
              minuteResetAt: now,
              hourResetAt: hourFromNow,
            },
          });
          
          userUsageUpdated = true;
          changes.userUsage = {
            planName: { old: 'none', new: newPlanType },
          };
        }

        return { usageUpdated, imageUsageUpdated, userUsageUpdated };
      });

      console.log(`[PlanSync] Plan changed atomically: ${oldPlanType} → ${newPlanType} for user ${userId}`);

      return {
        success: true,
        message: `Plan updated and synced: ${oldPlanType} → ${newPlanType}`,
        oldPlan: oldPlanType,
        newPlan: newPlanType,
        usageUpdated: result.usageUpdated,
        imageUsageUpdated: result.imageUsageUpdated,
        userUsageUpdated: result.userUsageUpdated,
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
        userUsageUpdated: false,
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
      monthlyTokens: limits.monthlyTokens || limits.monthlyWords * 4,
      dailyTokens: limits.dailyTokens || limits.dailyWords * 4,
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HELPER: Get image limits from plansManager
   * v12.0: Returns only Schnell + GPT LOW
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private getImageLimitsFromPlan(planType: PlanType, isInternational: boolean = false): ImageLimitsFromPlan {
    const imageLimits = plansManager.getImageLimits(planType, isInternational);
    
    return {
      schnellImages: imageLimits.schnellImages || 0,
      gptLowImages: imageLimits.gptLowImages || 0,
      totalImages: imageLimits.totalImages || 0,
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * UTILITY: Check if tables are in sync with user's plan
   * v12.0: Checks Schnell + GPT LOW quotas
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

      const [usage, imageUsage, userUsage] = await Promise.all([
        prisma.usage.findUnique({ where: { userId } }),
        prisma.imageUsage.findUnique({ where: { userId } }),
        prisma.userUsage.findUnique({ where: { userId } }),
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

      // Check ImageUsage sync (v12.0: 2-Model System)
      if (imageUsage) {
        if ((imageUsage.schnellImagesLimit || 0) !== expectedImage.schnellImages) {
          issues.push(`ImageUsage.schnellImagesLimit mismatch: ${imageUsage.schnellImagesLimit || 0} vs expected ${expectedImage.schnellImages}`);
        }
        if ((imageUsage.gptLowImagesLimit || 0) !== expectedImage.gptLowImages) {
          issues.push(`ImageUsage.gptLowImagesLimit mismatch: ${imageUsage.gptLowImagesLimit || 0} vs expected ${expectedImage.gptLowImages}`);
        }
      } else {
        issues.push('ImageUsage record not found');
      }

      // Check UserUsage sync
      if (userUsage) {
        const userUsagePlanName = (userUsage as any).planName;
        if (userUsagePlanName && userUsagePlanName !== user.planType) {
          issues.push(`UserUsage.planName mismatch: ${userUsagePlanName} vs expected ${user.planType}`);
        }
      } else {
        issues.push('UserUsage record not found');
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
          actual: imageUsage ? { 
            schnell: imageUsage.schnellImagesLimit || 0,
            gptLow: imageUsage.gptLowImagesLimit || 0,
          } : null,
          expected: { 
            schnell: expectedImage.schnellImages,
            gptLow: expectedImage.gptLowImages,
          },
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

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * v12.0 MIGRATION: Migrate existing ImageUsage records to GPT LOW
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Run this ONCE after deploying v12.0 to set up gptLow fields
   */
  async migrateToGptLowFields(): Promise<{
    totalRecords: number;
    updated: number;
    failed: string[];
  }> {
    console.log('[PlanSync] Starting v12.0 GPT LOW fields migration...');

    const imageUsages = await prisma.imageUsage.findMany({
      include: { user: { select: { planType: true, region: true } } },
    });

    let updated = 0;
    const failed: string[] = [];

    for (const imageUsage of imageUsages) {
      try {
        const isInternational = imageUsage.user.region === Region.INTL;
        const imageLimits = this.getImageLimitsFromPlan(imageUsage.user.planType, isInternational);

        await prisma.imageUsage.update({
          where: { userId: imageUsage.userId },
          data: {
            gptLowImagesLimit: imageLimits.gptLowImages,
            gptLowImagesUsed: 0,
            boosterGptLowImages: 0,
          },
        });

        updated++;
        console.log(`[PlanSync] Migrated GPT LOW for user ${imageUsage.userId}: limit=${imageLimits.gptLowImages}`);
      } catch (error: any) {
        console.error(`[PlanSync] Failed to migrate user ${imageUsage.userId}:`, error.message);
        failed.push(imageUsage.userId);
      }
    }

    console.log(`[PlanSync] v12.0 GPT LOW migration complete: ${updated}/${imageUsages.length} updated`);

    return {
      totalRecords: imageUsages.length,
      updated,
      failed,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const planSyncService = new PlanSyncService();
export default planSyncService;