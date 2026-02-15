// src/services/ai/routing/model-selector.ts

/**
 * ==========================================
 * MODEL SELECTOR - AI ROUTING
 * ==========================================
 * Selects appropriate AI model based on:
 * - User's plan (Starter/Plus/Pro/Apex)
 * - Query complexity tier
 * - Model availability
 * 
 * Last Updated: February 15, 2026
 * Changes: Removed LLM_ROUTING_CONFIG dependency, added CODING tier
 */

import {
  PlanType,
  RoutingTier,
  AIModel,
  PLANS_STATIC_CONFIG,
} from '@/constants/plans';

// ==========================================
// INTERFACES
// ==========================================

export interface ModelSelectionResult {
  model: AIModel;
  fallbackModel?: AIModel;
  isRouted: boolean;
  planSupportsRouting: boolean;
}

// ==========================================
// MODEL SELECTOR CLASS
// ==========================================

export class ModelSelector {
  /**
   * Select the appropriate AI model based on plan and tier
   */
  public selectModel(
    planType: PlanType,
    tier: RoutingTier
  ): ModelSelectionResult {
    const plan = PLANS_STATIC_CONFIG[planType];

    // Starter plan: Always use first model (no routing)
    if (planType === PlanType.STARTER) {
      return {
        model: plan.aiModels[0],
        isRouted: false,
        planSupportsRouting: false,
      };
    }

    // Paid plans: Smart routing
    if (plan.hasSmartRouting) {
      const selectedModel = this.selectModelByTier(plan.aiModels, tier);
      const fallback = this.getFallbackModel(plan.aiModels, selectedModel);

      return {
        model: selectedModel,
        fallbackModel: fallback,
        isRouted: true,
        planSupportsRouting: true,
      };
    }

    // Fallback (should not happen with current plans)
    return {
      model: plan.aiModels[0],
      isRouted: false,
      planSupportsRouting: false,
    };
  }

  // ==========================================
  // PRIVATE: MODEL SELECTION BY TIER
  // ==========================================

  private selectModelByTier(
    availableModels: AIModel[],
    tier: RoutingTier
  ): AIModel {
    // Find model matching the tier
    const matchingModel = availableModels.find(
      model => model.tier === tier
    );

    if (matchingModel) {
      return matchingModel;
    }

    // Fallback: If tier not available, use closest available tier
    return this.getClosestTierModel(availableModels, tier);
  }

  private getClosestTierModel(
    availableModels: AIModel[],
    requestedTier: RoutingTier
  ): AIModel {
    // Tier hierarchy (from simplest to most complex)
    const tierHierarchy = [
      RoutingTier.CASUAL,
      RoutingTier.SIMPLE,
      RoutingTier.MEDIUM,
      RoutingTier.COMPLEX,
      RoutingTier.EXPERT,
      RoutingTier.CODING,
    ];

    const requestedIndex = tierHierarchy.indexOf(requestedTier);

    // Try to find a model at or below the requested tier
    for (let i = requestedIndex; i >= 0; i--) {
      const model = availableModels.find(
        m => m.tier === tierHierarchy[i]
      );
      if (model) return model;
    }

    // If nothing found below, try above
    for (let i = requestedIndex + 1; i < tierHierarchy.length; i++) {
      const model = availableModels.find(
        m => m.tier === tierHierarchy[i]
      );
      if (model) return model;
    }

    // Ultimate fallback: first available model
    return availableModels[0];
  }

  // ==========================================
  // PRIVATE: FALLBACK MODEL SELECTION
  // ==========================================

  private getFallbackModel(
    availableModels: AIModel[],
    primaryModel: AIModel
  ): AIModel | undefined {
    // Fallback hierarchy:
    // 1. One tier down from primary
    // 2. SIMPLE tier as safe fallback
    // 3. CASUAL tier as last resort

    const fallbackTiers = [
      this.getTierBelow(primaryModel.tier),
      RoutingTier.SIMPLE,
      RoutingTier.CASUAL,
    ].filter(Boolean) as RoutingTier[];

    for (const tier of fallbackTiers) {
      const fallback = availableModels.find(
        model => model.tier === tier && model.modelId !== primaryModel.modelId
      );
      if (fallback) return fallback;
    }

    return undefined;
  }

  private getTierBelow(tier?: RoutingTier): RoutingTier | null {
    if (!tier) return null;

    const tierMap: Record<RoutingTier, RoutingTier | null> = {
      [RoutingTier.EXPERT]: RoutingTier.COMPLEX,
      [RoutingTier.COMPLEX]: RoutingTier.MEDIUM,
      [RoutingTier.MEDIUM]: RoutingTier.SIMPLE,
      [RoutingTier.SIMPLE]: RoutingTier.CASUAL,
      [RoutingTier.CASUAL]: null,
      [RoutingTier.CODING]: RoutingTier.COMPLEX,
    };

    return tierMap[tier];
  }

  // ==========================================
  // UTILITY: CHECK PLAN CAPABILITIES
  // ==========================================

  public planSupportsModel(planType: PlanType, modelId: string): boolean {
    const plan = PLANS_STATIC_CONFIG[planType];
    return plan.aiModels.some(model => model.modelId === modelId);
  }

  public planSupportsTier(planType: PlanType, tier: RoutingTier): boolean {
    const plan = PLANS_STATIC_CONFIG[planType];
    return plan.aiModels.some(model => model.tier === tier);
  }

  public getAvailableModelsForPlan(planType: PlanType): AIModel[] {
    return PLANS_STATIC_CONFIG[planType].aiModels;
  }
}