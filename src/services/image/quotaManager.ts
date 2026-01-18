// src/services/image/quotaManager.ts

/**
 * ==========================================
 * SORIVA IMAGE QUOTA MANAGER
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Manage image generation quota for users
 * Features:
 * - Check available quota (Klein 9B - Single Model)
 * - Deduct quota after generation
 * - Handle booster images
 * - Region-based limits
 * Last Updated: January 17, 2026 - v10.2 Klein 9B
 * 
 * CHANGELOG v10.2:
 * - Replaced Schnell + Fast with single Klein 9B model
 * - Simplified quota logic (no more dual-model fallback)
 * - Updated all database field references
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

      // Calculate available images (Klein 9B - single model)
      const klein9bAvailable = Math.max(0, imageUsage.klein9bImagesLimit - imageUsage.klein9bImagesUsed);
      const boosterKlein9b = imageUsage.boosterKlein9bImages || 0;

      // Total available (plan + booster)
      const totalAvailable = klein9bAvailable + boosterKlein9b;

      // Check if user has quota
      const hasQuota = totalAvailable > 0;
      const reason = hasQuota ? undefined : 'Image quota exhausted';

      return {
        hasQuota,
        provider: ImageProvider.KLEIN9B,
        availableKlein9b: klein9bAvailable,
        totalAvailable,
        reason,
        canUseBooster: boosterKlein9b > 0,
        boosterKlein9b,
      };
    } catch (error) {
      console.error('[ImageQuotaManager] Error checking quota:', error);
      return this.createNoQuotaResult('Error checking quota');
    }
  }

  /**
   * Get user's full image quota information
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

      return {
        userId,
        planType: user.planType,
        region: user.region,
        klein9bLimit: imageUsage.klein9bImagesLimit,
        klein9bUsed: imageUsage.klein9bImagesUsed,
        boosterKlein9b: imageUsage.boosterKlein9bImages,
        klein9bRemaining,
        totalRemaining: klein9bRemaining + imageUsage.boosterKlein9bImages,
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
   */
  public async deductQuota(
    userId: string,
    provider: ImageProvider = ImageProvider.KLEIN9B
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

      // Klein 9B - single model logic
      const planAvailable = imageUsage.klein9bImagesLimit - imageUsage.klein9bImagesUsed;
      
      if (planAvailable > 0) {
        updateData.klein9bImagesUsed = { increment: 1 };
      } else if (imageUsage.boosterKlein9bImages > 0) {
        updateData.boosterKlein9bImages = { decrement: 1 };
        fromBooster = true;
      } else {
        return this.createDeductFailResult('No image quota available');
      }

      // Update quota
      const updated = await this.prisma.imageUsage.update({
        where: { userId },
        data: updateData,
      });

      const remainingKlein9b = updated.klein9bImagesLimit - updated.klein9bImagesUsed + updated.boosterKlein9bImages;

      return {
        success: true,
        provider: ImageProvider.KLEIN9B,
        deducted: true,
        fromBooster,
        remainingKlein9b,
        totalRemaining: remainingKlein9b,
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
   * Get or create ImageUsage record for user
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

    // Create new record
    const isInternational = region === 'INTL';
    const imageLimits = plansManager.getImageLimits(planType, isInternational);

    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    return await this.prisma.imageUsage.create({
      data: {
        userId,
        klein9bImagesLimit: imageLimits.klein9bImages,
        klein9bImagesUsed: 0,
        totalImagesGenerated: 0,
        boosterKlein9bImages: 0,
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
   * Reset monthly quota
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
        klein9bImagesLimit: imageLimits.klein9bImages,
        klein9bImagesUsed: 0,
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
      provider: ImageProvider.KLEIN9B,
      availableKlein9b: 0,
      totalAvailable: 0,
      reason,
      canUseBooster: false,
      boosterKlein9b: 0,
    };
  }

  /**
   * Create deduction fail result
   */
  private createDeductFailResult(error: string): QuotaDeductResult {
    return {
      success: false,
      provider: ImageProvider.KLEIN9B,
      deducted: false,
      fromBooster: false,
      remainingKlein9b: 0,
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