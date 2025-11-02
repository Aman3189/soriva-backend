// src/studio/studio.service.ts

import { StudioFeatureType, StudioBoosterType } from '@prisma/client';
import { prisma } from '../core/services/prisma.service';
import {
  FEATURE_PRICING,
  BOOSTER_CONFIGS,
  PLAN_BONUS_CREDITS,
  CreditsBalance,
  CreditTransaction,
} from './types/studio.types';

export class StudioService {
  // ==========================================
  // CREDITS MANAGEMENT
  // ==========================================

  /**
   * Get user's current credits balance
   */
  async getCreditsBalance(userId: string): Promise<CreditsBalance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        studioCreditsUsed: true,
        studioCreditsRemaining: true,
        studioCreditsCarryForward: true,
        lastStudioReset: true,
        planType: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate next reset (1st of next month)
    const nextReset = this.getNextResetDate(user.lastStudioReset);

    // Get bonus credits from plan (STARTER = 0, no free credits)
    const planBonusCredits = PLAN_BONUS_CREDITS[user.planType] || 0;

    return {
      total: planBonusCredits + user.studioCreditsCarryForward,
      used: user.studioCreditsUsed,
      remaining: user.studioCreditsRemaining,
      carryForward: 0, // ✅ CHANGED: No carry forward (always 0)
      lastReset: user.lastStudioReset,
      nextReset,
    };
  }

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { studioCreditsRemaining: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.studioCreditsRemaining >= requiredCredits;
  }

  /**
   * Deduct credits from user
   */
  async deductCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<CreditTransaction> {
    // Check if user has enough credits
    const hasCredits = await this.hasEnoughCredits(userId, amount);

    if (!hasCredits) {
      throw new Error(`Insufficient credits. You need ${amount} credits but don't have enough.`);
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        studioCreditsUsed: { increment: amount },
        studioCreditsRemaining: { decrement: amount },
      },
    });

    return {
      amount: -amount,
      type: 'deduct',
      reason,
      timestamp: new Date(),
    };
  }

  /**
   * Add credits to user (from booster purchase)
   */
  async addCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<CreditTransaction> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        studioCreditsRemaining: { increment: amount },
        // ✅ REMOVED: No carry forward increment
      },
    });

    return {
      amount,
      type: 'add',
      reason,
      timestamp: new Date(),
    };
  }

  /**
   * Reset monthly credits (runs on 1st of every month)
   * ✅ UPDATED: NO CARRY FORWARD - Credits expire monthly
   */
  async resetMonthlyCredits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        studioCreditsRemaining: true,
        studioCreditsUsed: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get plan bonus credits (STARTER = 0)
    const planBonusCredits = PLAN_BONUS_CREDITS[user.planType] || 0;

    // ✅ CHANGED: NO CARRY FORWARD
    // Unused credits expire at month end
    // Reset to plan bonus only (0 for STARTER)

    await prisma.user.update({
      where: { id: userId },
      data: {
        studioCreditsUsed: 0,
        studioCreditsRemaining: planBonusCredits, // ✅ Only plan bonus, no carry forward
        studioCreditsCarryForward: 0, // ✅ Always 0
        lastStudioReset: new Date(),
      },
    });
  }

  /**
   * Get feature pricing
   */
  getFeaturePricing(featureType: StudioFeatureType) {
    return FEATURE_PRICING[featureType];
  }

  /**
   * Calculate total credits needed (including preview)
   */
  calculateTotalCredits(featureType: StudioFeatureType, includePreview: boolean = true): number {
    const pricing = FEATURE_PRICING[featureType];
    return pricing.baseCredits + (includePreview ? pricing.previewCredits : 0);
  }

  // ==========================================
  // BOOSTER MANAGEMENT
  // ==========================================

  /**
   * Get active boosters for user
   */
  async getActiveBoosters(userId: string) {
    const now = new Date();

    return await prisma.studioBoosterPurchase.findMany({
      where: {
        userId,
        active: true,
        expiresAt: { gt: now },
      },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  /**
   * Purchase booster (without payment - manual for now)
   * ✅ UPDATED: Booster credits valid for 30 days, then expire
   */
  async purchaseBooster(userId: string, boosterType: StudioBoosterType) {
    const config = BOOSTER_CONFIGS[boosterType];

    if (!config) {
      throw new Error('Invalid booster type');
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + config.validityDays); // 30 days

    // Create booster purchase record
    const purchase = await prisma.studioBoosterPurchase.create({
      data: {
        userId,
        boosterType,
        boosterName: config.name,
        creditsAdded: config.credits,
        price: config.price,
        validityDays: config.validityDays,
        expiresAt,
        active: true,
        paymentStatus: 'completed', // Manual for now
        creditsRemaining: config.credits,
      },
    });

    // Add credits to user (valid for 30 days)
    await this.addCredits(userId, config.credits, `Booster: ${config.name}`);

    return purchase;
  }

  /**
   * Check and expire old boosters
   * ✅ IMPORTANT: This removes expired credits from user balance
   */
  async expireBoosters(userId: string): Promise<void> {
    const now = new Date();

    // Find expired boosters with remaining credits
    const expiredBoosters = await prisma.studioBoosterPurchase.findMany({
      where: {
        userId,
        active: true,
        expiresAt: { lte: now },
        creditsRemaining: { gt: 0 },
      },
    });

    // Deduct expired credits from user balance
    for (const booster of expiredBoosters) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          studioCreditsRemaining: {
            decrement: booster.creditsRemaining,
          },
        },
      });
    }

    // Mark boosters as expired
    await prisma.studioBoosterPurchase.updateMany({
      where: {
        userId,
        active: true,
        expiresAt: { lte: now },
      },
      data: {
        active: false,
        creditsRemaining: 0,
      },
    });
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get next reset date (1st of next month)
   */
  private getNextResetDate(lastReset: Date): Date {
    const next = new Date(lastReset);
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  /**
   * Check if reset is needed
   */
  async checkAndResetCredits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastStudioReset: true },
    });

    if (!user) return;

    const nextReset = this.getNextResetDate(user.lastStudioReset);
    const now = new Date();

    // If current date is past next reset date, reset credits
    if (now >= nextReset) {
      await this.resetMonthlyCredits(userId);
    }

    // Also check for expired boosters
    await this.expireBoosters(userId);
  }

  // ==========================================
  // GENERATION METHODS
  // ==========================================

  /**
   * Create a new generation request
   */
  async createGeneration(
    userId: string,
    featureType: StudioFeatureType,
    userPrompt: string,
    parameters?: Record<string, any>
  ) {
    const pricing = this.getFeaturePricing(featureType);
    
    // Check credits (base credits only, preview is free first time)
    const hasCredits = await this.hasEnoughCredits(userId, pricing.baseCredits);
    if (!hasCredits) {
      throw new Error(`Insufficient credits. Need ${pricing.baseCredits} credits.`);
    }

    // Deduct base credits
    await this.deductCredits(userId, pricing.baseCredits, `Generation: ${pricing.name}`);

    // Create generation record
    const generation = await prisma.studioGeneration.create({
      data: {
        userId,
        featureType,
        featureName: pricing.name,
        userPrompt,
        parameters: parameters || {},
        creditsUsed: pricing.baseCredits,
        previewCredits: 0, // First preview is free
        generationCredits: pricing.baseCredits,
        apiCost: pricing.estimatedApiCost,
        status: 'PENDING',
        outputType: pricing.outputType,
      },
    });

    return generation;
  }

  /**
   * Create preview for a generation
   */
  async createPreview(generationId: string, userId: string) {
    // Get generation
    const generation = await prisma.studioGeneration.findUnique({
      where: { id: generationId },
      include: { previews: true },
    });

    if (!generation) {
      throw new Error('Generation not found');
    }

    if (generation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const previewCount = generation.previews.length;
    const pricing = this.getFeaturePricing(generation.featureType);

    // First preview is FREE
    let creditsCost = 0;
    
    if (previewCount >= pricing.maxFreeRetries) {
      // Additional previews cost 3 credits
      creditsCost = pricing.previewCredits;
      
      // Check and deduct credits
      const hasCredits = await this.hasEnoughCredits(userId, creditsCost);
      if (!hasCredits) {
        throw new Error(`Insufficient credits. Need ${creditsCost} credits for additional preview.`);
      }
      
      await this.deductCredits(userId, creditsCost, `Preview: ${pricing.name}`);
    }

    // Create preview record
    const preview = await prisma.studioPreview.create({
      data: {
        generationId,
        userId,
        previewNumber: previewCount + 1,
        previewUrl: '', // Will be set by GPU service
        previewType: pricing.outputType === 'video' ? 'video' : 'image',
        creditsCost,
        apiCost: pricing.estimatedApiCost * 0.3, // Preview is ~30% of full cost
      },
    });

    return preview;
  }

  /**
   * Get user's generation history
   */
  async getUserGenerations(userId: string, limit: number = 20) {
    return await prisma.studioGeneration.findMany({
      where: { userId },
      include: {
        previews: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get single generation with previews
   */
  async getGeneration(generationId: string, userId: string) {
    const generation = await prisma.studioGeneration.findUnique({
      where: { id: generationId },
      include: {
        previews: {
          orderBy: { generatedAt: 'asc' },
        },
      },
    });

    if (!generation) {
      throw new Error('Generation not found');
    }

    if (generation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return generation;
  }

  /**
   * Update generation status
   */
  async updateGenerationStatus(
    generationId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    outputUrl?: string,
    metadata?: Record<string, any>,
    errorMessage?: string
  ) {
    return await prisma.studioGeneration.update({
      where: { id: generationId },
      data: {
        status,
        outputUrl,
        metadata,
        errorMessage,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  /**
   * Update preview with output URL
   */
  async updatePreviewOutput(
    previewId: string,
    previewUrl: string,
    metadata?: Record<string, any>
  ) {
    return await prisma.studioPreview.update({
      where: { id: previewId },
      data: {
        previewUrl,
        resolution: metadata?.resolution,
        duration: metadata?.duration,
        fileSize: metadata?.fileSize,
      },
    });
  }

  /**
   * Get credits usage history
   */
  async getCreditsHistory(userId: string, limit: number = 50) {
    const generations = await prisma.studioGeneration.findMany({
      where: { userId },
      select: {
        id: true,
        featureName: true,
        creditsUsed: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const boosters = await prisma.studioBoosterPurchase.findMany({
      where: { userId },
      select: {
        id: true,
        boosterName: true,
        creditsAdded: true,
        purchasedAt: true,
      },
      orderBy: { purchasedAt: 'desc' },
      take: limit,
    });

    return {
      generations,
      boosters,
    };
  }
}

export const studioService = new StudioService();