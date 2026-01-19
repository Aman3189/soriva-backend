// src/services/image/quotaManager.ts

/**
 * ==========================================
 * SORIVA IMAGE QUOTA MANAGER
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Manage image generation quota for users
 * Features:
 * - Check available quota (Klein 9B + Schnell - Dual Model)
 * - Deduct quota after generation
 * - Handle booster images
 * - Region-based limits
 * - Smart fallback between providers
 * 
 * Last Updated: January 19, 2026 - v10.4 Dual Model
 * 
 * CHANGELOG v10.4:
 * - DUAL MODEL SYSTEM: Klein 9B + Schnell
 * - Separate quota tracking for each provider
 * - Booster support for both models
 * - Smart fallback when one provider exhausted
 * 
 * CHANGELOG v10.2:
 * - Replaced Schnell + Fast with single Klein 9B model
 * - Simplified quota logic (no more dual-model fallback)
 */

import { PrismaClient, PlanType, Region } from '@prisma/client';
import {
  QuotaCheckResult,
  QuotaDeductResult,
  UserImageQuota,
  ImageProvider,
} from '../../types/image.types';
import { plansManager } from '../../constants/plansManager';

// ==========================================
// QUOTA MANAGER CLASS
// ==========================================

export class ImageQuotaManager {
  private static instance: ImageQuotaManager;
  private prisma: PrismaClient;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public static getInstance(prisma: PrismaClient): ImageQuotaManager {
    if (!ImageQuotaManager.instance) {
      ImageQuotaManager.instance = new ImageQuotaManager(prisma);
    }
    return ImageQuotaManager.instance;
  }

  // ==========================================
  // QUOTA CHECK
  // ==========================================

  /**
   * Check if user has quota for image generation
   * Supports both Klein 9B and Schnell
   */
  public async checkQuota(
    userId: string,
    preferredProvider?: ImageProvider
  ): Promise<QuotaCheckResult> {
    try {
      // Get user with plan info
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          planType: true,
          region: true,
        },
      });

      if (!user) {
        return this.createNoQuotaResult('User not found');
      }

      // Get or create ImageUsage record
      const imageUsage = await this.getOrCreateImageUsage(userId, user.planType, user.region);

      // Calculate available images for both providers
      const klein9bAvailable = Math.max(0, imageUsage.klein9bImagesLimit - imageUsage.klein9bImagesUsed);
      const schnellAvailable = Math.max(0, imageUsage.schnellImagesLimit - imageUsage.schnellImagesUsed);
      
      const boosterKlein9b = imageUsage.boosterKlein9bImages || 0;
      const boosterSchnell = imageUsage.boosterSchnellImages || 0;

      // Total available (plan + booster) for each provider
      const totalKlein9b = klein9bAvailable + boosterKlein9b;
      const totalSchnell = schnellAvailable + boosterSchnell;
      const totalAvailable = totalKlein9b + totalSchnell;

      // Determine if user has quota for requested provider
      let hasQuota = false;
      let provider = preferredProvider || ImageProvider.SCHNELL;
      let reason: string | undefined;

      if (preferredProvider === ImageProvider.KLEIN9B) {
        hasQuota = totalKlein9b > 0;
        reason = hasQuota ? undefined : 'Klein 9B quota exhausted';
      } else if (preferredProvider === ImageProvider.SCHNELL) {
        hasQuota = totalSchnell > 0;
        reason = hasQuota ? undefined : 'Schnell quota exhausted';
      } else {
        // No preference - check if any quota available
        hasQuota = totalAvailable > 0;
        reason = hasQuota ? undefined : 'Image quota exhausted for all providers';
        // Default to Schnell if available (cheaper)
        provider = totalSchnell > 0 ? ImageProvider.SCHNELL : ImageProvider.KLEIN9B;
      }

      return {
        hasQuota,
        provider,
        availableKlein9b: klein9bAvailable,
        availableSchnell: schnellAvailable,
        totalAvailable,
        reason,
        canUseBooster: boosterKlein9b > 0 || boosterSchnell > 0,
        boosterKlein9b,
        boosterSchnell,
      };
    } catch (error) {
      console.error('[ImageQuotaManager] Error checking quota:', error);
      return this.createNoQuotaResult('Error checking quota');
    }
  }

  /**
   * Get user's full image quota information (both providers)
   */
  public async getUserQuota(userId: string): Promise<UserImageQuota | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          planType: true,
          region: true,
        },
      });

      if (!user) return null;

      const imageUsage = await this.getOrCreateImageUsage(userId, user.planType, user.region);

      const klein9bRemaining = Math.max(0, imageUsage.klein9bImagesLimit - imageUsage.klein9bImagesUsed);
      const schnellRemaining = Math.max(0, imageUsage.schnellImagesLimit - imageUsage.schnellImagesUsed);

      return {
        userId,
        planType: user.planType,
        region: user.region,
        
        // Klein 9B
        klein9bLimit: imageUsage.klein9bImagesLimit,
        klein9bUsed: imageUsage.klein9bImagesUsed,
        boosterKlein9b: imageUsage.boosterKlein9bImages,
        klein9bRemaining,
        
        // Schnell
        schnellLimit: imageUsage.schnellImagesLimit,
        schnellUsed: imageUsage.schnellImagesUsed,
        boosterSchnell: imageUsage.boosterSchnellImages,
        schnellRemaining,
        
        // Total
        totalRemaining: klein9bRemaining + schnellRemaining + 
                       imageUsage.boosterKlein9bImages + imageUsage.boosterSchnellImages,
      };
    } catch (error) {
      console.error('[ImageQuotaManager] Error getting user quota:', error);
      return null;
    }
  }

  // ==========================================
  // QUOTA DEDUCTION
  // ==========================================

  /**
   * Deduct image quota after successful generation
   * Supports both Klein 9B and Schnell
   */
  public async deductQuota(
    userId: string,
    provider: ImageProvider = ImageProvider.SCHNELL
  ): Promise<QuotaDeductResult> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, region: true },
      });

      if (!user) {
        return this.createDeductFailResult('User not found');
      }

      const imageUsage = await this.getOrCreateImageUsage(userId, user.planType, user.region);

      // Determine where to deduct from
      let fromBooster = false;
      let updateData: any = {
        totalImagesGenerated: { increment: 1 },
        lastImageGeneratedAt: new Date(),
      };

      if (provider === ImageProvider.KLEIN9B) {
        // Klein 9B deduction
        const planAvailable = imageUsage.klein9bImagesLimit - imageUsage.klein9bImagesUsed;
        
        if (planAvailable > 0) {
          updateData.klein9bImagesUsed = { increment: 1 };
        } else if (imageUsage.boosterKlein9bImages > 0) {
          updateData.boosterKlein9bImages = { decrement: 1 };
          fromBooster = true;
        } else {
          return this.createDeductFailResult('No Klein 9B quota available');
        }
      } else {
        // Schnell deduction
        const planAvailable = imageUsage.schnellImagesLimit - imageUsage.schnellImagesUsed;
        
        if (planAvailable > 0) {
          updateData.schnellImagesUsed = { increment: 1 };
        } else if (imageUsage.boosterSchnellImages > 0) {
          updateData.boosterSchnellImages = { decrement: 1 };
          fromBooster = true;
        } else {
          return this.createDeductFailResult('No Schnell quota available');
        }
      }

      // Update quota
      const updated = await this.prisma.imageUsage.update({
        where: { userId },
        data: updateData,
      });

      // Calculate remaining
      const remainingKlein9b = updated.klein9bImagesLimit - updated.klein9bImagesUsed + updated.boosterKlein9bImages;
      const remainingSchnell = updated.schnellImagesLimit - updated.schnellImagesUsed + updated.boosterSchnellImages;

      return {
        success: true,
        provider,
        deducted: true,
        fromBooster,
        remainingKlein9b,
        remainingSchnell,
        totalRemaining: remainingKlein9b + remainingSchnell,
      };
    } catch (error) {
      console.error('[ImageQuotaManager] Error deducting quota:', error);
      return this.createDeductFailResult('Error deducting quota');
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Get or create ImageUsage record for user (with both providers)
   */
  private async getOrCreateImageUsage(
    userId: string,
    planType: PlanType,
    region: Region
  ) {
    // Try to find existing
    let imageUsage = await this.prisma.imageUsage.findUnique({
      where: { userId },
    });

    if (imageUsage) {
      // Check if needs monthly reset
      if (this.needsMonthlyReset(imageUsage.lastMonthlyReset)) {
        imageUsage = await this.resetMonthlyQuota(userId, planType, region);
      }
      return imageUsage;
    }

    // Create new record with both providers
    const isInternational = region === 'INTL';
    const imageLimits = plansManager.getImageLimits(planType, isInternational);

    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    return await this.prisma.imageUsage.create({
      data: {
        userId,
        // Klein 9B
        klein9bImagesLimit: imageLimits.klein9bImages,
        klein9bImagesUsed: 0,
        boosterKlein9bImages: 0,
        // Schnell
        schnellImagesLimit: imageLimits.schnellImages,
        schnellImagesUsed: 0,
        boosterSchnellImages: 0,
        // Totals
        totalImagesGenerated: 0,
        cycleStartDate: now,
        cycleEndDate: cycleEnd,
        lastMonthlyReset: now,
      },
    });
  }

  /**
   * Check if monthly reset is needed
   */
  private needsMonthlyReset(lastReset: Date): boolean {
    const now = new Date();
    const resetDate = new Date(lastReset);
    
    // Reset if month changed
    return now.getMonth() !== resetDate.getMonth() || 
           now.getFullYear() !== resetDate.getFullYear();
  }

  /**
   * Reset monthly quota (both providers)
   */
  private async resetMonthlyQuota(
    userId: string,
    planType: PlanType,
    region: Region
  ) {
    const isInternational = region === 'INTL';
    const imageLimits = plansManager.getImageLimits(planType, isInternational);

    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    return await this.prisma.imageUsage.update({
      where: { userId },
      data: {
        // Klein 9B reset
        klein9bImagesLimit: imageLimits.klein9bImages,
        klein9bImagesUsed: 0,
        // Schnell reset
        schnellImagesLimit: imageLimits.schnellImages,
        schnellImagesUsed: 0,
        // Cycle dates
        cycleStartDate: now,
        cycleEndDate: cycleEnd,
        lastMonthlyReset: now,
        // Note: booster images don't reset
      },
    });
  }

  /**
   * Create no quota result
   */
  private createNoQuotaResult(reason: string): QuotaCheckResult {
    return {
      hasQuota: false,
      provider: ImageProvider.SCHNELL,
      availableKlein9b: 0,
      availableSchnell: 0,
      totalAvailable: 0,
      reason,
      canUseBooster: false,
      boosterKlein9b: 0,
      boosterSchnell: 0,
    };
  }

  /**
   * Create deduction fail result
   */
  private createDeductFailResult(error: string): QuotaDeductResult {
    return {
      success: false,
      provider: ImageProvider.SCHNELL,
      deducted: false,
      fromBooster: false,
      remainingKlein9b: 0,
      remainingSchnell: 0,
      totalRemaining: 0,
      error,
    };
  }
}

// ==========================================
// FACTORY FUNCTION
// ==========================================

export function createImageQuotaManager(prisma: PrismaClient): ImageQuotaManager {
  return ImageQuotaManager.getInstance(prisma);
}