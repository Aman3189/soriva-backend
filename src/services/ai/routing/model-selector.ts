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

  // ==========================================
  // TIER MODEL SELECTION (ISOLATED APPROACH)
  // ==========================================
  // CODING tier is completely isolated from general tiers.
  // Devstral (CODING model) has NO general knowledge -
  // it must NEVER be selected for non-coding queries.
  // ==========================================

  /**
   * Router: Delegates to appropriate tier handler
   */
  private getClosestTierModel(
    availableModels: AIModel[],
    requestedTier: RoutingTier
  ): AIModel {
    if (requestedTier === RoutingTier.CODING) {
      return this.getCodingTierModel(availableModels);
    }
    return this.getGeneralTierModel(availableModels, requestedTier);
  }

  /**
   * CODING queries only - Isolated from general tier fallback
   * Fallback: COMPLEX tier (Mistral Large can handle code too)
   */
  private getCodingTierModel(availableModels: AIModel[]): AIModel {
    const codingModel = availableModels.find(m => m.tier === RoutingTier.CODING);
    if (codingModel) return codingModel;

    const complexModel = availableModels.find(m => m.tier === RoutingTier.COMPLEX);
    if (complexModel) return complexModel;

    return availableModels[0];
  }

  /**
   * GENERAL queries - CODING tier is EXCLUDED from search
   * Hierarchy: CASUAL → SIMPLE → MEDIUM → COMPLEX → EXPERT
   */
  private getGeneralTierModel(
    availableModels: AIModel[],
    requestedTier: RoutingTier
  ): AIModel {
    // Exclude coding models - they have no general knowledge
    const generalModels = availableModels.filter(m => m.tier !== RoutingTier.CODING);

    // General tier hierarchy (NO CODING)
    const tierHierarchy = [
      RoutingTier.CASUAL,
      RoutingTier.SIMPLE,
      RoutingTier.MEDIUM,
      RoutingTier.COMPLEX,
      RoutingTier.EXPERT,
    ];

    const requestedIndex = tierHierarchy.indexOf(requestedTier);
    const safeIndex = requestedIndex === -1 ? 1 : requestedIndex; // Default to SIMPLE

    // Try at or below requested tier
    for (let i = safeIndex; i >= 0; i--) {
      const model = generalModels.find(m => m.tier === tierHierarchy[i]);
      if (model) return model;
    }

    // Try above requested tier
    for (let i = safeIndex + 1; i < tierHierarchy.length; i++) {
      const model = generalModels.find(m => m.tier === tierHierarchy[i]);
      if (model) return model;
    }

    // Ultimate fallback: first general model or any available
    return generalModels[0] || availableModels[0];
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