// src/services/image/quotaManager.ts

/**
 * ==========================================
 * SORIVA IMAGE QUOTA MANAGER
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Manage image generation quota for users
 * Features:
 * - Check available quota (4 Models: Schnell, Klein, Nano Banana, Flux Kontext)
 * - Deduct quota after generation
 * - Handle booster images
 * - Region-based limits
 * - Smart fallback between providers
 * 
 * Last Updated: January 25, 2026 - v11.0 (4 Model System)
 * 
 * CHANGELOG v11.0:
 * - 4 MODEL SYSTEM: Schnell, Klein, Nano Banana, Flux Kontext
 * - Separate quota tracking for each provider
 * - Booster support for all 4 models
 * - Nano Banana & Flux Kontext for PRO/APEX only
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
   * Supports all 4 models: Schnell, Klein, Nano Banana, Flux Kontext
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

      // Calculate available images for all 4 providers
      const schnellAvailable = Math.max(0, imageUsage.schnellImagesLimit - imageUsage.schnellImagesUsed);
      const klein9bAvailable = Math.max(0, imageUsage.klein9bImagesLimit - imageUsage.klein9bImagesUsed);
      const nanoBananaAvailable = Math.max(0, (imageUsage.nanoBananaImagesLimit || 0) - (imageUsage.nanoBananaImagesUsed || 0));
      const fluxKontextAvailable = Math.max(0, (imageUsage.fluxKontextImagesLimit || 0) - (imageUsage.fluxKontextImagesUsed || 0));
      
      const boosterSchnell = imageUsage.boosterSchnellImages || 0;
      const boosterKlein9b = imageUsage.boosterKlein9bImages || 0;
      const boosterNanoBanana = imageUsage.boosterNanoBananaImages || 0;
      const boosterFluxKontext = imageUsage.boosterFluxKontextImages || 0;

      // Total available (plan + booster) for each provider
      const totalSchnell = schnellAvailable + boosterSchnell;
      const totalKlein9b = klein9bAvailable + boosterKlein9b;
      const totalNanoBanana = nanoBananaAvailable + boosterNanoBanana;
      const totalFluxKontext = fluxKontextAvailable + boosterFluxKontext;
      const totalAvailable = totalSchnell + totalKlein9b + totalNanoBanana + totalFluxKontext;

      // Determine if user has quota for requested provider
      let hasQuota = false;
      let provider = preferredProvider || ImageProvider.SCHNELL;
      let reason: string | undefined;

      if (preferredProvider === ImageProvider.SCHNELL) {
        hasQuota = totalSchnell > 0;
        reason = hasQuota ? undefined : 'Schnell quota exhausted';
      } else if (preferredProvider === ImageProvider.KLEIN9B) {
        hasQuota = totalKlein9b > 0;
        reason = hasQuota ? undefined : 'Klein 9B quota exhausted';
      } else if (preferredProvider === ImageProvider.NANO_BANANA) {
        hasQuota = totalNanoBanana > 0;
        reason = hasQuota ? undefined : 'Nano Banana quota exhausted';
      } else if (preferredProvider === ImageProvider.FLUX_KONTEXT) {
        hasQuota = totalFluxKontext > 0;
        reason = hasQuota ? undefined : 'Flux Kontext quota exhausted';
      } else {
        // No preference - check if any quota available
        hasQuota = totalAvailable > 0;
        reason = hasQuota ? undefined : 'Image quota exhausted for all providers';
        // Default to Schnell if available (cheapest)
        if (totalSchnell > 0) provider = ImageProvider.SCHNELL;
        else if (totalKlein9b > 0) provider = ImageProvider.KLEIN9B;
        else if (totalNanoBanana > 0) provider = ImageProvider.NANO_BANANA;
        else if (totalFluxKontext > 0) provider = ImageProvider.FLUX_KONTEXT;
      }

      return {
        hasQuota,
        provider,
        availableSchnell: schnellAvailable,
        availableKlein9b: klein9bAvailable,
        availableNanoBanana: nanoBananaAvailable,
        availableFluxKontext: fluxKontextAvailable,
        totalAvailable,
        reason,
        canUseBooster: boosterSchnell > 0 || boosterKlein9b > 0 || boosterNanoBanana > 0 || boosterFluxKontext > 0,
        boosterSchnell,
        boosterKlein9b,
        boosterNanoBanana,
        boosterFluxKontext,
      };
    } catch (error) {
      console.error('[ImageQuotaManager] Error checking quota:', error);
      return this.createNoQuotaResult('Error checking quota');
    }
  }

  /**
   * Get user's full image quota information (all 4 providers)
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
      const klein9bRemaining = Math.max(0, imageUsage.klein9bImagesLimit - imageUsage.klein9bImagesUsed);
      const nanoBananaRemaining = Math.max(0, (imageUsage.nanoBananaImagesLimit || 0) - (imageUsage.nanoBananaImagesUsed || 0));
      const fluxKontextRemaining = Math.max(0, (imageUsage.fluxKontextImagesLimit || 0) - (imageUsage.fluxKontextImagesUsed || 0));

      return {
        userId,
        planType: user.planType,
        region: user.region,
        
        // Schnell
        schnellLimit: imageUsage.schnellImagesLimit,
        schnellUsed: imageUsage.schnellImagesUsed,
        boosterSchnell: imageUsage.boosterSchnellImages || 0,
        schnellRemaining,
        
        // Klein 9B
        klein9bLimit: imageUsage.klein9bImagesLimit,
        klein9bUsed: imageUsage.klein9bImagesUsed,
        boosterKlein9b: imageUsage.boosterKlein9bImages || 0,
        klein9bRemaining,
        
        // Nano Banana
        nanoBananaLimit: imageUsage.nanoBananaImagesLimit || 0,
        nanoBananaUsed: imageUsage.nanoBananaImagesUsed || 0,
        boosterNanoBanana: imageUsage.boosterNanoBananaImages || 0,
        nanoBananaRemaining,
        
        // Flux Kontext
        fluxKontextLimit: imageUsage.fluxKontextImagesLimit || 0,
        fluxKontextUsed: imageUsage.fluxKontextImagesUsed || 0,
        boosterFluxKontext: imageUsage.boosterFluxKontextImages || 0,
        fluxKontextRemaining,
        
        // Total
        totalRemaining: schnellRemaining + klein9bRemaining + nanoBananaRemaining + fluxKontextRemaining + 
                       (imageUsage.boosterSchnellImages || 0) + (imageUsage.boosterKlein9bImages || 0) +
                       (imageUsage.boosterNanoBananaImages || 0) + (imageUsage.boosterFluxKontextImages || 0),
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
   * Supports all 4 models: Schnell, Klein, Nano Banana, Flux Kontext
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
      } else if (provider === ImageProvider.KLEIN9B) {
        // Klein 9B deduction
        const planAvailable = imageUsage.klein9bImagesLimit - imageUsage.klein9bImagesUsed;
        
        if (planAvailable > 0) {
          updateData.klein9bImagesUsed = { increment: 1 };
        } else if ((imageUsage.boosterKlein9bImages || 0) > 0) {
          updateData.boosterKlein9bImages = { decrement: 1 };
          fromBooster = true;
        } else {
          return this.createDeductFailResult('No Klein 9B quota available');
        }
      } else if (provider === ImageProvider.NANO_BANANA) {
        // Nano Banana deduction
        const planAvailable = (imageUsage.nanoBananaImagesLimit || 0) - (imageUsage.nanoBananaImagesUsed || 0);
        
        if (planAvailable > 0) {
          updateData.nanoBananaImagesUsed = { increment: 1 };
        } else if ((imageUsage.boosterNanoBananaImages || 0) > 0) {
          updateData.boosterNanoBananaImages = { decrement: 1 };
          fromBooster = true;
        } else {
          return this.createDeductFailResult('No Nano Banana quota available');
        }
      } else if (provider === ImageProvider.FLUX_KONTEXT) {
        // Flux Kontext deduction
        const planAvailable = (imageUsage.fluxKontextImagesLimit || 0) - (imageUsage.fluxKontextImagesUsed || 0);
        
        if (planAvailable > 0) {
          updateData.fluxKontextImagesUsed = { increment: 1 };
        } else if ((imageUsage.boosterFluxKontextImages || 0) > 0) {
          updateData.boosterFluxKontextImages = { decrement: 1 };
          fromBooster = true;
        } else {
          return this.createDeductFailResult('No Flux Kontext quota available');
        }
      }

      // Update quota
      const updated = await this.prisma.imageUsage.update({
        where: { userId },
        data: updateData,
      });

      // Calculate remaining
      const remainingSchnell = updated.schnellImagesLimit - updated.schnellImagesUsed + (updated.boosterSchnellImages || 0);
      const remainingKlein9b = updated.klein9bImagesLimit - updated.klein9bImagesUsed + (updated.boosterKlein9bImages || 0);
      const remainingNanoBanana = (updated.nanoBananaImagesLimit || 0) - (updated.nanoBananaImagesUsed || 0) + (updated.boosterNanoBananaImages || 0);
      const remainingFluxKontext = (updated.fluxKontextImagesLimit || 0) - (updated.fluxKontextImagesUsed || 0) + (updated.boosterFluxKontextImages || 0);

      return {
        success: true,
        provider,
        deducted: true,
        fromBooster,
        remainingSchnell,
        remainingKlein9b,
        remainingNanoBanana,
        remainingFluxKontext,
        totalRemaining: remainingSchnell + remainingKlein9b + remainingNanoBanana + remainingFluxKontext,
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
   * Get or create ImageUsage record for user (with all 4 providers)
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

    // Create new record with all 4 providers
    const isInternational = region === 'INTL';
    const imageLimits = plansManager.getImageLimits(planType, isInternational);

    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    return await this.prisma.imageUsage.create({
      data: {
        userId,
        // Schnell
        schnellImagesLimit: imageLimits.schnellImages,
        schnellImagesUsed: 0,
        boosterSchnellImages: 0,
        // Klein 9B
        klein9bImagesLimit: imageLimits.klein9bImages,
        klein9bImagesUsed: 0,
        boosterKlein9bImages: 0,
        // Nano Banana (PRO/APEX only)
        nanoBananaImagesLimit: imageLimits.nanoBananaImages || 0,
        nanoBananaImagesUsed: 0,
        boosterNanoBananaImages: 0,
        // Flux Kontext (PRO/APEX only)
        fluxKontextImagesLimit: imageLimits.fluxKontextImages || 0,
        fluxKontextImagesUsed: 0,
        boosterFluxKontextImages: 0,
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
   * Reset monthly quota (all 4 providers)
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
        // Klein 9B reset
        klein9bImagesLimit: imageLimits.klein9bImages,
        klein9bImagesUsed: 0,
        // Nano Banana reset
        nanoBananaImagesLimit: imageLimits.nanoBananaImages || 0,
        nanoBananaImagesUsed: 0,
        // Flux Kontext reset
        fluxKontextImagesLimit: imageLimits.fluxKontextImages || 0,
        fluxKontextImagesUsed: 0,
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
      availableSchnell: 0,
      availableKlein9b: 0,
      availableNanoBanana: 0,
      availableFluxKontext: 0,
      totalAvailable: 0,
      reason,
      canUseBooster: false,
      boosterSchnell: 0,
      boosterKlein9b: 0,
      boosterNanoBanana: 0,
      boosterFluxKontext: 0,
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
      remainingSchnell: 0,
      remainingKlein9b: 0,
      remainingNanoBanana: 0,
      remainingFluxKontext: 0,
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