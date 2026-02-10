// src/modules/billing/planSync.service.ts

/**
 * ==========================================
 * SORIVA BACKEND - PLAN SYNC SERVICE
 * ==========================================
 * Created: January 17, 2026
 * Updated: February 10, 2026 - 4-Model Image System
 * Author: Amandeep, Punjab, India
 *
 * PURPOSE:
 * - Auto-update Usage table when user plan changes
 * - Auto-update UserUsage table when user plan changes (planName sync)
 * - Auto-update ImageUsage table when user plan changes (4-Model System)
 * - Keep all tables in sync with user's current plan
 * - Support LITE plan (free tier with Schnell images)
 *
 * 4-MODEL IMAGE SYSTEM:
 * - Schnell: Budget (₹0.25) - All plans
 * - Klein 9B: Premium (₹1.26) - PLUS and above
 * - Nano Banana: Ultra-Premium (₹3.26) - PRO/APEX only
 * - Flux Kontext: Ultra-Premium (₹3.35) - PRO/APEX only
 *
 * USAGE:
 * - Call syncUserPlan() after updating user.planType
 * - Or use updateUserPlanWithSync() for atomic update
 * 
 * CHANGES (January 23, 2026):
 * - ✅ ADDED: UserUsage table sync (planName field)
 * - ✅ FIXED: All 3 usage tables now sync atomically
 *
 * CHANGES (January 19, 2026):
 * - ✅ ADDED: LITE plan support
 * - ✅ ADDED: Schnell image quota handling (schnellImagesLimit, schnellImagesUsed)
 * - ✅ ADDED: Dual model sync (Klein + Schnell)
 * - ✅ UPDATED: ImageLimitsFromPlan interface with schnellImages
 * - ✅ UPDATED: checkSyncStatus() to verify Schnell limits
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
  userUsageUpdated: boolean;  // ✅ NEW
  changes: {
    usage?: {
      monthlyLimit: { old: number; new: number };
      dailyLimit: { old: number; new: number };
      premiumTokensTotal?: { old: number; new: number };
      dailyTokenLimit?: { old: number; new: number };
    };
    imageUsage?: {
      klein9bImagesLimit: { old: number; new: number };
      schnellImagesLimit: { old: number; new: number };
    };
    userUsage?: {  // ✅ NEW
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

interface ImageLimitsFromPlan {
  schnellImages: number;
  klein9bImages: number;
  nanoBananaImages: number;
  fluxKontextImages: number;
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
   * ✅ UPDATED: Now handles Usage + ImageUsage + UserUsage
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
        // 2. UPDATE IMAGE USAGE TABLE (4-Model System)
        // ──────────────────────────────────────────────────────
        const currentImageUsage = await tx.imageUsage.findUnique({
          where: { userId },
          select: {
            schnellImagesLimit: true,
            schnellImagesUsed: true,
            klein9bImagesLimit: true,
            klein9bImagesUsed: true,
            nanoBananaImagesLimit: true,
            nanoBananaImagesUsed: true,
            fluxKontextImagesLimit: true,
            fluxKontextImagesUsed: true,
          },
        });

        if (currentImageUsage) {
          await tx.imageUsage.update({
            where: { userId },
            data: {
              schnellImagesLimit: newImageLimits.schnellImages,
              klein9bImagesLimit: newImageLimits.klein9bImages,
              nanoBananaImagesLimit: newImageLimits.nanoBananaImages,
              fluxKontextImagesLimit: newImageLimits.fluxKontextImages,
              updatedAt: new Date(),
            },
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            klein9bImagesLimit: { old: currentImageUsage.klein9bImagesLimit, new: newImageLimits.klein9bImages },
            schnellImagesLimit: { old: currentImageUsage.schnellImagesLimit || 0, new: newImageLimits.schnellImages },
          };

          console.log(`[PlanSync] ImageUsage updated for user ${userId}:`, {
            schnellLimit: `${currentImageUsage.schnellImagesLimit || 0} → ${newImageLimits.schnellImages}`,
            kleinLimit: `${currentImageUsage.klein9bImagesLimit} → ${newImageLimits.klein9bImages}`,
            nanoBananaLimit: `${currentImageUsage.nanoBananaImagesLimit || 0} → ${newImageLimits.nanoBananaImages}`,
            fluxKontextLimit: `${currentImageUsage.fluxKontextImagesLimit || 0} → ${newImageLimits.fluxKontextImages}`,
          });
        } else {
          // Create ImageUsage if doesn't exist
          const now = new Date();
          const cycleEnd = new Date(now);
          cycleEnd.setMonth(cycleEnd.getMonth() + 1);

          await tx.imageUsage.create({
            data: {
              userId,
              // Schnell (Budget)
              schnellImagesLimit: newImageLimits.schnellImages,
              schnellImagesUsed: 0,
              boosterSchnellImages: 0,
              // Klein (Premium)
              klein9bImagesLimit: newImageLimits.klein9bImages,
              klein9bImagesUsed: 0,
              boosterKlein9bImages: 0,
              // Nano Banana (Ultra-Premium)
              nanoBananaImagesLimit: newImageLimits.nanoBananaImages,
              nanoBananaImagesUsed: 0,
              boosterNanoBananaImages: 0,
              // Flux Kontext (Ultra-Premium)
              fluxKontextImagesLimit: newImageLimits.fluxKontextImages,
              fluxKontextImagesUsed: 0,
              boosterFluxKontextImages: 0,
              // General
              totalImagesGenerated: 0,
              cycleStartDate: now,
              cycleEndDate: cycleEnd,
              lastMonthlyReset: now,
            },
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            klein9bImagesLimit: { old: 0, new: newImageLimits.klein9bImages },
            schnellImagesLimit: { old: 0, new: newImageLimits.schnellImages },
          };

          console.log(`[PlanSync] ImageUsage created for user ${userId}:`, {
            schnell: newImageLimits.schnellImages,
            klein: newImageLimits.klein9bImages,
            nanoBanana: newImageLimits.nanoBananaImages,
            fluxKontext: newImageLimits.fluxKontextImages,
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
   * ✅ UPDATED: Now handles Usage + ImageUsage + UserUsage
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

        // 3. UPDATE IMAGE USAGE TABLE (Klein + Schnell)
        const currentImageUsage = await tx.imageUsage.findUnique({
          where: { userId },
        });

        if (currentImageUsage) {
          const imageUpdateData: any = {
            klein9bImagesLimit: newImageLimits.klein9bImages,
            schnellImagesLimit: newImageLimits.schnellImages,
            updatedAt: new Date(),
          };

          if (options?.resetUsage) {
            imageUpdateData.klein9bImagesUsed = 0;
            imageUpdateData.schnellImagesUsed = 0;
          }

          await tx.imageUsage.update({
            where: { userId },
            data: imageUpdateData,
          });

          imageUsageUpdated = true;
          changes.imageUsage = {
            klein9bImagesLimit: { old: currentImageUsage.klein9bImagesLimit, new: newImageLimits.klein9bImages },
            schnellImagesLimit: { old: currentImageUsage.schnellImagesLimit || 0, new: newImageLimits.schnellImages },
          };
        } else {
          const now = new Date();
          const cycleEnd = new Date(now);
          cycleEnd.setMonth(cycleEnd.getMonth() + 1);

          await tx.imageUsage.create({
            data: {
              userId,
              klein9bImagesLimit: newImageLimits.klein9bImages,
              klein9bImagesUsed: 0,
              schnellImagesLimit: newImageLimits.schnellImages,
              schnellImagesUsed: 0,
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
            schnellImagesLimit: { old: 0, new: newImageLimits.schnellImages },
          };
        }

        // 4. UPDATE USER_USAGE TABLE (planName sync) ✅ NEW
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
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private getImageLimitsFromPlan(planType: PlanType, isInternational: boolean = false): ImageLimitsFromPlan {
    const imageLimits = plansManager.getImageLimits(planType, isInternational);
    
    return {
      schnellImages: imageLimits.schnellImages || 0,
      klein9bImages: imageLimits.klein9bImages || 0,
      nanoBananaImages: imageLimits.nanoBananaImages || 0,
      fluxKontextImages: imageLimits.fluxKontextImages || 0,
      totalImages: imageLimits.totalImages || 0,
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

      // Check ImageUsage sync (4-Model System)
      if (imageUsage) {
        if ((imageUsage.schnellImagesLimit || 0) !== expectedImage.schnellImages) {
          issues.push(`ImageUsage.schnellImagesLimit mismatch: ${imageUsage.schnellImagesLimit || 0} vs expected ${expectedImage.schnellImages}`);
        }
        if (imageUsage.klein9bImagesLimit !== expectedImage.klein9bImages) {
          issues.push(`ImageUsage.klein9bImagesLimit mismatch: ${imageUsage.klein9bImagesLimit} vs expected ${expectedImage.klein9bImages}`);
        }
        if ((imageUsage.nanoBananaImagesLimit || 0) !== expectedImage.nanoBananaImages) {
          issues.push(`ImageUsage.nanoBananaImagesLimit mismatch: ${imageUsage.nanoBananaImagesLimit || 0} vs expected ${expectedImage.nanoBananaImages}`);
        }
        if ((imageUsage.fluxKontextImagesLimit || 0) !== expectedImage.fluxKontextImages) {
          issues.push(`ImageUsage.fluxKontextImagesLimit mismatch: ${imageUsage.fluxKontextImagesLimit || 0} vs expected ${expectedImage.fluxKontextImages}`);
        }
      } else {
        issues.push('ImageUsage record not found');
      }

      // Check UserUsage sync ✅ NEW
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
            klein9b: imageUsage.klein9bImagesLimit,
            nanoBanana: imageUsage.nanoBananaImagesLimit || 0,
            fluxKontext: imageUsage.fluxKontextImagesLimit || 0,
          } : null,
          expected: { 
            schnell: expectedImage.schnellImages,
            klein9b: expectedImage.klein9bImages,
            nanoBanana: expectedImage.nanoBananaImages,
            fluxKontext: expectedImage.fluxKontextImages,
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
   * Migrate existing ImageUsage records to add Schnell fields
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  async migrateSchnellFields(): Promise<{
    totalRecords: number;
    updated: number;
    failed: string[];
  }> {
    console.log('[PlanSync] Starting Schnell fields migration...');

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
            schnellImagesLimit: imageLimits.schnellImages,
            schnellImagesUsed: 0,
          },
        });

        updated++;
        console.log(`[PlanSync] Migrated Schnell for user ${imageUsage.userId}: limit=${imageLimits.schnellImages}`);
      } catch (error: any) {
        console.error(`[PlanSync] Failed to migrate user ${imageUsage.userId}:`, error.message);
        failed.push(imageUsage.userId);
      }
    }

    console.log(`[PlanSync] Schnell migration complete: ${updated}/${imageUsages.length} updated`);

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