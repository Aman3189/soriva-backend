/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MODEL USAGE SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * 
 * Purpose: Track and enforce per-model token allocations
 * 
 * Features:
 * - Track tokens used per model per user
 * - Check if model allocation is exhausted
 * - Get available models with remaining quota
 * - Auto-reset on billing cycle
 * 
 * CRITICAL: This ensures smart-routing respects plans.ts ratios!
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '../config/prisma';
import { PlanType } from '../constants';
import {
  getModelAllocations,
  getModelAllocation,
  getFallbackModel,
  ModelAllocation,
} from '../constants/model-allocation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ModelUsageStatus {
  modelId: string;
  tokensAllocated: number;
  tokensUsed: number;
  tokensRemaining: number;
  percentageUsed: number;
  isExhausted: boolean;
}

export interface AvailableModel {
  modelId: string;
  tokensRemaining: number;
  priority: number;
  tier: string;
}

export interface ModelUsageResult {
  success: boolean;
  availableModels: AvailableModel[];
  exhaustedModels: string[];
  allExhausted: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL USAGE SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ModelUsageService {
  private static instance: ModelUsageService;

  private constructor() {
    console.log('[ModelUsageService] ✅ Initialized - Ratio-Enforced Routing Active');
  }

  public static getInstance(): ModelUsageService {
    if (!ModelUsageService.instance) {
      ModelUsageService.instance = new ModelUsageService();
    }
    return ModelUsageService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET CURRENT PERIOD DATES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getCurrentPeriod(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET MODEL USAGE FOR USER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getModelUsage(
    userId: string,
    modelId: string
  ): Promise<ModelUsageStatus | null> {
    const { start, end } = this.getCurrentPeriod();

    try {
      const usage = await prisma.userModelUsage.findFirst({
        where: {
          userId,
          modelId,
          periodType: 'monthly',
          periodStart: start,
        },
      });

      if (!usage) {
        return null;
      }

      const tokensRemaining = Math.max(0, usage.tokensLimit - usage.tokensUsed);
      const percentageUsed = usage.tokensLimit > 0 
        ? (usage.tokensUsed / usage.tokensLimit) * 100 
        : 0;

      return {
        modelId,
        tokensAllocated: usage.tokensLimit,
        tokensUsed: usage.tokensUsed,
        tokensRemaining,
        percentageUsed,
        isExhausted: tokensRemaining <= 0,
      };
    } catch (error) {
      console.error('[ModelUsageService] Error getting model usage:', error);
      return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET ALL MODEL USAGES FOR USER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getAllModelUsages(userId: string): Promise<ModelUsageStatus[]> {
    const { start } = this.getCurrentPeriod();

    try {
      const usages = await prisma.userModelUsage.findMany({
        where: {
          userId,
          periodType: 'monthly',
          periodStart: start,
        },
      });

      return usages.map(usage => {
        const tokensRemaining = Math.max(0, usage.tokensLimit - usage.tokensUsed);
        const percentageUsed = usage.tokensLimit > 0 
          ? (usage.tokensUsed / usage.tokensLimit) * 100 
          : 0;

        return {
          modelId: usage.modelId,
          tokensAllocated: usage.tokensLimit,
          tokensUsed: usage.tokensUsed,
          tokensRemaining,
          percentageUsed,
          isExhausted: tokensRemaining <= 0,
        };
      });
    } catch (error) {
      console.error('[ModelUsageService] Error getting all model usages:', error);
      return [];
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INITIALIZE USER MODEL ALLOCATIONS
  // Creates/updates allocation records for current period
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async initializeAllocations(
    userId: string,
    planType: PlanType,
    region: 'IN' | 'INTL' = 'IN'
  ): Promise<void> {
    const { start, end } = this.getCurrentPeriod();
    const allocations = getModelAllocations(planType, region);

    try {
      for (const allocation of allocations) {
        await prisma.userModelUsage.upsert({
          where: {
            userId_modelId_periodType_periodStart: {
              userId,
              modelId: allocation.modelId,
              periodType: 'monthly',
              periodStart: start,
            },
          },
          update: {
            tokensLimit: allocation.tokensAllocated,
            periodEnd: end,
          },
          create: {
            userId,
            modelId: allocation.modelId,
            tokensUsed: 0,
            tokensLimit: allocation.tokensAllocated,
            periodType: 'monthly',
            periodStart: start,
            periodEnd: end,
          },
        });
      }

      console.log(`[ModelUsageService] ✅ Initialized allocations for user ${userId}, plan ${planType}`);
    } catch (error) {
      console.error('[ModelUsageService] Error initializing allocations:', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET AVAILABLE MODELS (Respecting allocation limits)
  // This is the KEY method for smart-routing integration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getAvailableModels(
    userId: string,
    planType: PlanType,
    region: 'IN' | 'INTL' = 'IN'
  ): Promise<ModelUsageResult> {
    const { start } = this.getCurrentPeriod();
    const allocations = getModelAllocations(planType, region);

    try {
      // Get current usages
      const usages = await prisma.userModelUsage.findMany({
        where: {
          userId,
          periodType: 'monthly',
          periodStart: start,
        },
      });

      // Create usage map
      const usageMap = new Map<string, number>();
      for (const usage of usages) {
        usageMap.set(usage.modelId, usage.tokensUsed);
      }

      const availableModels: AvailableModel[] = [];
      const exhaustedModels: string[] = [];

      for (const allocation of allocations) {
        const tokensUsed = usageMap.get(allocation.modelId) || 0;
        const tokensRemaining = allocation.tokensAllocated - tokensUsed;

        if (tokensRemaining > 0) {
          availableModels.push({
            modelId: allocation.modelId,
            tokensRemaining,
            priority: allocation.priority,
            tier: allocation.tier,
          });
        } else {
          exhaustedModels.push(allocation.modelId);
        }
      }

      // Sort by priority (lower = higher priority)
      availableModels.sort((a, b) => a.priority - b.priority);

      return {
        success: true,
        availableModels,
        exhaustedModels,
        allExhausted: availableModels.length === 0,
      };
    } catch (error) {
      console.error('[ModelUsageService] Error getting available models:', error);
      
      // On error, return all models as available (fail-open for UX)
      return {
        success: false,
        availableModels: allocations.map(a => ({
          modelId: a.modelId,
          tokensRemaining: a.tokensAllocated,
          priority: a.priority,
          tier: a.tier,
        })),
        exhaustedModels: [],
        allExhausted: false,
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK IF MODEL HAS QUOTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async hasModelQuota(
    userId: string,
    modelId: string,
    planType: PlanType,
    tokensNeeded: number = 1000,
    region: 'IN' | 'INTL' = 'IN'
  ): Promise<{ hasQuota: boolean; tokensRemaining: number }> {
    const { start } = this.getCurrentPeriod();
    const allocation = getModelAllocation(planType, modelId, region);

    if (!allocation) {
      return { hasQuota: false, tokensRemaining: 0 };
    }

    try {
      const usage = await prisma.userModelUsage.findFirst({
        where: {
          userId,
          modelId,
          periodType: 'monthly',
          periodStart: start,
        },
      });

      const tokensUsed = usage?.tokensUsed || 0;
      const tokensRemaining = allocation.tokensAllocated - tokensUsed;
      const hasQuota = tokensRemaining >= tokensNeeded;

      return { hasQuota, tokensRemaining };
    } catch (error) {
      console.error('[ModelUsageService] Error checking model quota:', error);
      // Fail-open: allow usage on error
      return { hasQuota: true, tokensRemaining: allocation.tokensAllocated };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RECORD MODEL USAGE
  // Called after each AI response to track consumption
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async recordUsage(
    userId: string,
    modelId: string,
    tokensUsed: number,
    planType: PlanType,
    region: 'IN' | 'INTL' = 'IN'
  ): Promise<{ success: boolean; newTotal: number; remaining: number }> {
    const { start, end } = this.getCurrentPeriod();
    const allocation = getModelAllocation(planType, modelId, region);

    if (!allocation) {
      console.warn(`[ModelUsageService] No allocation found for model ${modelId} in plan ${planType}`);
      return { success: false, newTotal: 0, remaining: 0 };
    }

    try {
      const result = await prisma.userModelUsage.upsert({
        where: {
          userId_modelId_periodType_periodStart: {
            userId,
            modelId,
            periodType: 'monthly',
            periodStart: start,
          },
        },
        update: {
          tokensUsed: {
            increment: tokensUsed,
          },
        },
        create: {
          userId,
          modelId,
          tokensUsed,
          tokensLimit: allocation.tokensAllocated,
          periodType: 'monthly',
          periodStart: start,
          periodEnd: end,
        },
      });

      const remaining = Math.max(0, allocation.tokensAllocated - result.tokensUsed);

      console.log(`[ModelUsageService] 📊 Recorded ${tokensUsed} tokens for ${modelId}. Total: ${result.tokensUsed}/${allocation.tokensAllocated}, Remaining: ${remaining}`);

      return {
        success: true,
        newTotal: result.tokensUsed,
        remaining,
      };
    } catch (error) {
      console.error('[ModelUsageService] Error recording usage:', error);
      return { success: false, newTotal: 0, remaining: 0 };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET BEST AVAILABLE MODEL
  // Returns the best model that still has quota
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getBestAvailableModel(
    userId: string,
    planType: PlanType,
    preferredModelId: string,
    region: 'IN' | 'INTL' = 'IN'
  ): Promise<{ modelId: string; wasDowngraded: boolean; reason?: string }> {
    // First, check if preferred model has quota
    const { hasQuota, tokensRemaining } = await this.hasModelQuota(
      userId,
      preferredModelId,
      planType,
      1000, // minimum tokens needed
      region
    );

    if (hasQuota) {
      return {
        modelId: preferredModelId,
        wasDowngraded: false,
      };
    }

    // Preferred model exhausted - find fallback
    console.log(`[ModelUsageService] ⚠️ ${preferredModelId} exhausted for user ${userId}. Finding fallback...`);

    const { availableModels, allExhausted } = await this.getAvailableModels(userId, planType, region);

    if (allExhausted) {
      // All models exhausted - return cheapest as last resort
      const allocations = getModelAllocations(planType, region);
      const cheapest = allocations.find(a => a.tier === 'budget') || allocations[0];
      
      return {
        modelId: cheapest.modelId,
        wasDowngraded: true,
        reason: 'all_models_exhausted',
      };
    }

    // Return best available model (first in sorted list)
    const fallback = availableModels[0];
    
    return {
      modelId: fallback.modelId,
      wasDowngraded: true,
      reason: `${preferredModelId}_quota_exhausted`,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET USER USAGE SUMMARY
  // For dashboard/API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getUsageSummary(
    userId: string,
    planType: PlanType,
    region: 'IN' | 'INTL' = 'IN'
  ): Promise<{
    models: ModelUsageStatus[];
    totalUsed: number;
    totalAllocated: number;
    percentageUsed: number;
  }> {
    const allocations = getModelAllocations(planType, region);
    const usages = await this.getAllModelUsages(userId);

    const usageMap = new Map<string, ModelUsageStatus>();
    for (const usage of usages) {
      usageMap.set(usage.modelId, usage);
    }

    const models: ModelUsageStatus[] = allocations.map(allocation => {
      const usage = usageMap.get(allocation.modelId);
      
      if (usage) {
        return usage;
      }

      // No usage yet for this model
      return {
        modelId: allocation.modelId,
        tokensAllocated: allocation.tokensAllocated,
        tokensUsed: 0,
        tokensRemaining: allocation.tokensAllocated,
        percentageUsed: 0,
        isExhausted: false,
      };
    });

    const totalUsed = models.reduce((sum, m) => sum + m.tokensUsed, 0);
    const totalAllocated = models.reduce((sum, m) => sum + m.tokensAllocated, 0);
    const percentageUsed = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

    return {
      models,
      totalUsed,
      totalAllocated,
      percentageUsed,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESET USER ALLOCATIONS (For billing cycle reset)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async resetUserAllocations(userId: string): Promise<void> {
    const { start } = this.getCurrentPeriod();

    try {
      await prisma.userModelUsage.updateMany({
        where: {
          userId,
          periodStart: start,
        },
        data: {
          tokensUsed: 0,
        },
      });

      console.log(`[ModelUsageService] ✅ Reset allocations for user ${userId}`);
    } catch (error) {
      console.error('[ModelUsageService] Error resetting allocations:', error);
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const modelUsageService = ModelUsageService.getInstance();
export default modelUsageService;