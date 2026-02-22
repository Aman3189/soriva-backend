// src/services/image/quotaManager.ts

/**
 * ==========================================
 * SORIVA IMAGE QUOTA MANAGER
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Manage image generation quota for users
 * Features:
 * - Check available quota (2 Models: Schnell + GPT LOW)
 * - Deduct quota after generation
 * - Handle booster images
 * - Region-based limits
 * - Smart fallback between providers
 * 
 * Last Updated: February 22, 2026 - v12.0 (2 Model System)
 * 
 * ==========================================
 * CHANGELOG v12.0 (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 *
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌ (replaced by GPT LOW)
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 *
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25/image - General images (scenery, nature, animals)
 *    - GPT LOW (OpenAI gpt-image-1.5): ₹1.18/image - Text, Ads, Festivals, Transforms
 *
 * ✅ UPDATED METHODS:
 *    - checkQuota() - Now only checks Schnell + GPT LOW
 *    - deductQuota() - Now only deducts from Schnell or GPT LOW
 *    - getUserQuota() - Returns simplified 2-model quota
 * 
 * ==========================================
 * CHANGELOG v11.0 (January 25, 2026): [SUPERSEDED]
 * ==========================================
 * - 4 MODEL SYSTEM: Schnell, Klein, Nano Banana, Flux Kontext
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
  // QUOTA CHECK (v12.0 - Schnell + GPT LOW)
  // ==========================================

  /**
   * Check if user has quota for image generation
   * v12.0: Supports 2 models - Schnell + GPT LOW
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
      const schnellAvailable = Math.max(0, imageUsage.schnellImagesLimit - imageUsage.schnellImagesUsed);
      const gptLowAvailable = Math.max(0, imageUsage.gptLowImagesLimit - imageUsage.gptLowImagesUsed);
      
      const boosterSchnell = imageUsage.boosterSchnellImages || 0;
      const boosterGptLow = imageUsage.boosterGptLowImages || 0;

      // Total available (plan + booster) for each provider
      const totalSchnell = schnellAvailable + boosterSchnell;
      const totalGptLow = gptLowAvailable + boosterGptLow;
      const totalAvailable = totalSchnell + totalGptLow;

      // Determine if user has quota for requested provider
      let hasQuota = false;
      let provider = preferredProvider || ImageProvider.SCHNELL;
      let reason: string | undefined;

      if (preferredProvider === ImageProvider.SCHNELL) {
        hasQuota = totalSchnell > 0;
        reason = hasQuota ? undefined : 'Schnell quota exhausted';
      } else if (preferredProvider === ImageProvider.GPT_LOW) {
        hasQuota = totalGptLow > 0;
        reason = hasQuota ? undefined : 'GPT LOW quota exhausted';
      } else {
        // No preference - check if any quota available
        hasQuota = totalAvailable > 0;
        reason = hasQuota ? undefined : 'Image quota exhausted for all providers';
        // Default to Schnell if available (cheaper)
        if (totalSchnell > 0) provider = ImageProvider.SCHNELL;
        else if (totalGptLow > 0) provider = ImageProvider.GPT_LOW;
      }

      return {
        hasQuota,
        provider,
        availableSchnell: schnellAvailable,
        availableGptLow: gptLowAvailable,
        totalAvailable,
        reason,
        canUseBooster: boosterSchnell > 0 || boosterGptLow > 0,
        boosterSchnell,
        boosterGptLow,
      };
    } catch (error) {
      console.error('[ImageQuotaManager] Error checking quota:', error);
      return this.createNoQuotaResult('Error checking quota');
    }
  }

  /**
   * Get user's full image quota information (v12.0 - 2 providers)
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

      const schnellRemaining = Math.max(0, imageUsage.schnellImagesLimit - imageUsage.schnellImagesUsed);
      const gptLowRemaining = Math.max(0, imageUsage.gptLowImagesLimit - imageUsage.gptLowImagesUsed);

      return {
        userId,
        planType: user.planType,
        region: user.region,
        
        // Schnell (₹0.25)
        schnellLimit: imageUsage.schnellImagesLimit,
        schnellUsed: imageUsage.schnellImagesUsed,
        boosterSchnell: imageUsage.boosterSchnellImages || 0,
        schnellRemaining,
        
        // GPT LOW (₹1.18)
        gptLowLimit: imageUsage.gptLowImagesLimit,
        gptLowUsed: imageUsage.gptLowImagesUsed,
        boosterGptLow: imageUsage.boosterGptLowImages || 0,
        gptLowRemaining,
        
        // Total
        totalRemaining: schnellRemaining + gptLowRemaining + 
                       (imageUsage.boosterSchnellImages || 0) + (imageUsage.boosterGptLowImages || 0),
      };
    } catch (error) {
      console.error('[ImageQuotaManager] Error getting user quota:', error);
      return null;
    }
  }

  // ==========================================
  // QUOTA DEDUCTION (v12.0 - Schnell + GPT LOW)
  // ==========================================

  /**
   * Deduct image quota after successful generation
   * v12.0: Supports 2 models - Schnell + GPT LOW
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

      if (provider === ImageProvider.SCHNELL) {
        // Schnell deduction
        const planAvailable = imageUsage.schnellImagesLimit - imageUsage.schnellImagesUsed;
        
        if (planAvailable > 0) {
          updateData.schnellImagesUsed = { increment: 1 };
        } else if ((imageUsage.boosterSchnellImages || 0) > 0) {
          updateData.boosterSchnellImages = { decrement: 1 };
          fromBooster = true;
        } else {
          return this.createDeductFailResult('No Schnell quota available');
        }
      } else if (provider === ImageProvider.GPT_LOW) {
        // GPT LOW deduction
        const planAvailable = imageUsage.gptLowImagesLimit - imageUsage.gptLowImagesUsed;
        
        if (planAvailable > 0) {
          updateData.gptLowImagesUsed = { increment: 1 };
        } else if ((imageUsage.boosterGptLowImages || 0) > 0) {
          updateData.boosterGptLowImages = { decrement: 1 };
          fromBooster = true;
        } else {
          return this.createDeductFailResult('No GPT LOW quota available');
        }
      } else {
        return this.createDeductFailResult(`Unknown provider: ${provider}`);
      }

      // Update quota
      const updated = await this.prisma.imageUsage.update({
        where: { userId },
        data: updateData,
      });

      // Calculate remaining
      const remainingSchnell = updated.schnellImagesLimit - updated.schnellImagesUsed + (updated.boosterSchnellImages || 0);
      const remainingGptLow = updated.gptLowImagesLimit - updated.gptLowImagesUsed + (updated.boosterGptLowImages || 0);

      return {
        success: true,
        provider,
        deducted: true,
        fromBooster,
        remainingSchnell,
        remainingGptLow,
        totalRemaining: remainingSchnell + remainingGptLow,
      };
    } catch (error) {
      console.error('[ImageQuotaManager] Error deducting quota:', error);
      return this.createDeductFailResult('Error deducting quota');
    }
  }

  // ==========================================
  // BOOSTER METHODS (v12.0)
  // ==========================================

  /**
   * Add booster images to user's quota
   */
  public async addBoosterImages(
    userId: string,
    schnellImages: number = 0,
    gptLowImages: number = 0
  ): Promise<boolean> {
    try {
      await this.prisma.imageUsage.update({
        where: { userId },
        data: {
          boosterSchnellImages: { increment: schnellImages },
          boosterGptLowImages: { increment: gptLowImages },
        },
      });
      return true;
    } catch (error) {
      console.error('[ImageQuotaManager] Error adding booster images:', error);
      return false;
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Get or create ImageUsage record for user (v12.0 - 2 providers)
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

    // Create new record with 2 providers (v12.0)
    const isInternational = region === 'INTL';
    const imageLimits = plansManager.getImageLimits(planType, isInternational);

    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    return await this.prisma.imageUsage.create({
      data: {
        userId,
        // Schnell (₹0.25)
        schnellImagesLimit: imageLimits.schnellImages,
        schnellImagesUsed: 0,
        boosterSchnellImages: 0,
        // GPT LOW (₹1.18)
        gptLowImagesLimit: imageLimits.gptLowImages,
        gptLowImagesUsed: 0,
        boosterGptLowImages: 0,
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
   * Reset monthly quota (v12.0 - 2 providers)
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
        // Schnell reset
        schnellImagesLimit: imageLimits.schnellImages,
        schnellImagesUsed: 0,
        // GPT LOW reset
        gptLowImagesLimit: imageLimits.gptLowImages,
        gptLowImagesUsed: 0,
        // Cycle dates
        cycleStartDate: now,
        cycleEndDate: cycleEnd,
        lastMonthlyReset: now,
        // Note: booster images don't reset
      },
    });
  }

  /**
   * Create no quota result (v12.0)
   */
  private createNoQuotaResult(reason: string): QuotaCheckResult {
    return {
      hasQuota: false,
      provider: ImageProvider.SCHNELL,
      availableSchnell: 0,
      availableGptLow: 0,
      totalAvailable: 0,
      reason,
      canUseBooster: false,
      boosterSchnell: 0,
      boosterGptLow: 0,
    };
  }

  /**
   * Create deduction fail result (v12.0)
   */
  private createDeductFailResult(error: string): QuotaDeductResult {
    return {
      success: false,
      provider: ImageProvider.SCHNELL,
      deducted: false,
      fromBooster: false,
      remainingSchnell: 0,
      remainingGptLow: 0,
      totalRemaining: 0,
      error,
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Check if user can use specific provider
   */
  public async canUseProvider(userId: string, provider: ImageProvider): Promise<boolean> {
    const quota = await this.checkQuota(userId, provider);
    return quota.hasQuota;
  }

  /**
   * Get best available provider for user
   * Prefers Schnell (cheaper) if available
   */
  public async getBestAvailableProvider(userId: string): Promise<ImageProvider | null> {
    const quota = await this.checkQuota(userId);
    
    if (!quota.hasQuota) return null;
    
    // Prefer Schnell (₹0.25) over GPT LOW (₹1.18)
    if (quota.availableSchnell > 0 || quota.boosterSchnell > 0) {
      return ImageProvider.SCHNELL;
    }
    if (quota.availableGptLow > 0 || quota.boosterGptLow > 0) {
      return ImageProvider.GPT_LOW;
    }
    
    return null;
  }

  /**
   * Get quota summary for display
   */
  public async getQuotaSummary(userId: string): Promise<{
    schnell: { used: number; limit: number; booster: number };
    gptLow: { used: number; limit: number; booster: number };
    total: { used: number; limit: number; remaining: number };
  } | null> {
    const quota = await this.getUserQuota(userId);
    if (!quota) return null;

    return {
      schnell: {
        used: quota.schnellUsed,
        limit: quota.schnellLimit,
        booster: quota.boosterSchnell,
      },
      gptLow: {
        used: quota.gptLowUsed,
        limit: quota.gptLowLimit,
        booster: quota.boosterGptLow,
      },
      total: {
        used: quota.schnellUsed + quota.gptLowUsed,
        limit: quota.schnellLimit + quota.gptLowLimit,
        remaining: quota.totalRemaining,
      },
    };
  }
}

// ==========================================
// FACTORY FUNCTION
// ==========================================

export function createImageQuotaManager(prisma: PrismaClient): ImageQuotaManager {
  return ImageQuotaManager.getInstance(prisma);
}