// src/services/ai/routing/router.service.ts

/**
 * ==========================================
 * AI ROUTER SERVICE - MAIN ORCHESTRATOR
 * ==========================================
 * Coordinates smart AI routing based on:
 * - Query complexity analysis
 * - User plan capabilities
 * - Model availability and fallbacks
 * - Token pool awareness
 * - Usage tracking
 * 
 * Last Updated: November 21, 2025
 * 
 * CHANGES:
 * - ✅ ADDED: Token cost estimation
 * - ✅ ADDED: Enhanced routing decisions with cost info
 * - ✅ ADDED: Pool-aware routing methods
 */

import { PlanType, AIModel } from '@/constants/plans';
import { QueryAnalyzer, QueryAnalysis } from './query-analyzer';
import { ModelSelector, ModelSelectionResult } from './model-selector';

// ==========================================
// INTERFACES
// ==========================================

export interface RoutingDecision {
  model: AIModel;
  fallbackModel?: AIModel;
  analysis: QueryAnalysis;
  routingStrategy: 'fixed' | 'smart';
  estimatedTokens?: number;      // ✅ NEW: Estimated token cost
  poolRecommendation?: 'premium' | 'bonus';  // ✅ NEW: Which pool to use
  timestamp: Date;
}

export interface RoutingStats {
  totalRequests: number;
  routingBreakdown: Record<string, number>;
  avgConfidence: number;
}

// ==========================================
// TOKEN COST CONSTANTS
// ==========================================

const ESTIMATED_TOKENS_PER_WORD = 1.3;  // Average tokens per word
const RESPONSE_MULTIPLIER = 2.5;         // Response is typically 2.5x input

// ==========================================
// AI ROUTER SERVICE
// ==========================================

export class AIRouterService {
  private readonly queryAnalyzer: QueryAnalyzer;
  private readonly modelSelector: ModelSelector;
  private stats: Map<PlanType, RoutingStats> = new Map();

  constructor() {
    this.queryAnalyzer = new QueryAnalyzer();
    this.modelSelector = new ModelSelector();
    this.initializeStats();
  }

  // ==========================================
  // PUBLIC: MAIN ROUTING METHOD (ENHANCED)
  // ==========================================

  public async routeQuery(
    query: string,
    planType: PlanType,
    availableTokens?: { premium: number; bonus: number }
  ): Promise<RoutingDecision> {
    try {
      const analysis = this.queryAnalyzer.analyzeQuery(query);

      console.log(
        `[AIRouter] Query analysis: tier=${analysis.tier}, confidence=${analysis.confidence}`
      );

      const selection = this.modelSelector.selectModel(planType, analysis.tier);

      this.trackRouting(planType, selection.model.modelId);

      // ✅ NEW: Estimate token cost
      const estimatedTokens = this.estimateTokenCost(query);
      
      // ✅ NEW: Determine pool recommendation
      const poolRecommendation = this.getPoolRecommendation(
        selection.model,
        estimatedTokens,
        availableTokens
      );

      const decision: RoutingDecision = {
        model: selection.model,
        fallbackModel: selection.fallbackModel,
        analysis,
        routingStrategy: selection.isRouted ? 'smart' : 'fixed',
        estimatedTokens,
        poolRecommendation,
        timestamp: new Date(),
      };

      console.log(
        `[AIRouter] Routed to ${selection.model.displayName} for ${planType} plan (est: ${estimatedTokens} tokens, pool: ${poolRecommendation})`
      );

      return decision;
    } catch (error) {
      console.error('[AIRouter] Error in routing query:', error);
      return this.getDefaultRouting(planType);
    }
  }

  // ==========================================
  // PUBLIC: ROUTING WITH FALLBACK HANDLING
  // ==========================================

  public async routeWithFallback(
    query: string,
    planType: PlanType,
    primaryFailed: boolean = false,
    availableTokens?: { premium: number; bonus: number }
  ): Promise<RoutingDecision> {
    const decision = await this.routeQuery(query, planType, availableTokens);

    if (primaryFailed && decision.fallbackModel) {
      console.warn(
        `[AIRouter] Primary model ${decision.model.displayName} failed, using fallback ${decision.fallbackModel.displayName}`
      );

      return {
        ...decision,
        model: decision.fallbackModel,
        fallbackModel: decision.model,
      };
    }

    return decision;
  }

  // ==========================================
  // PUBLIC: BATCH ROUTING
  // ==========================================

  public async routeBatch(
    queries: string[],
    planType: PlanType,
    availableTokens?: { premium: number; bonus: number }
  ): Promise<RoutingDecision[]> {
    return Promise.all(
      queries.map(query => this.routeQuery(query, planType, availableTokens))
    );
  }

  // ==========================================
  // ✅ NEW: TOKEN COST ESTIMATION
  // ==========================================

  /**
   * Estimate token cost for a query
   * Based on word count and expected response length
   */
  public estimateTokenCost(query: string): number {
    const wordCount = query.split(/\s+/).length;
    const inputTokens = Math.ceil(wordCount * ESTIMATED_TOKENS_PER_WORD);
    const outputTokens = Math.ceil(inputTokens * RESPONSE_MULTIPLIER);
    return inputTokens + outputTokens;
  }

  /**
   * Get more detailed token cost breakdown
   */
  public getTokenBreakdown(query: string): {
    input: number;
    estimatedOutput: number;
    total: number;
  } {
    const wordCount = query.split(/\s+/).length;
    const input = Math.ceil(wordCount * ESTIMATED_TOKENS_PER_WORD);
    const estimatedOutput = Math.ceil(input * RESPONSE_MULTIPLIER);
    
    return {
      input,
      estimatedOutput,
      total: input + estimatedOutput,
    };
  }

  // ==========================================
  // ✅ NEW: POOL RECOMMENDATION
  // ==========================================

  /**
   * Recommend which token pool to use based on model and availability
   */
  private getPoolRecommendation(
    model: AIModel,
    estimatedTokens: number,
    availableTokens?: { premium: number; bonus: number }
  ): 'premium' | 'bonus' {
    // If no token info provided, default to premium
    if (!availableTokens) {
      return 'premium';
    }

    // Flash Lite models can use bonus pool
    const isFlashLite = model.modelId === 'gemini-2.5-flash-lite';
    
    if (isFlashLite && availableTokens.bonus >= estimatedTokens) {
      return 'bonus';
    }

    // Premium models always use premium pool
    return 'premium';
  }

  /**
   * Check if user has enough tokens for estimated cost
   */
  public canAffordQuery(
    estimatedTokens: number,
    availableTokens: { premium: number; bonus: number }
  ): {
    canAfford: boolean;
    usePool: 'premium' | 'bonus';
    reason?: string;
  } {
    // Try premium pool first
    if (availableTokens.premium >= estimatedTokens) {
      return {
        canAfford: true,
        usePool: 'premium',
      };
    }

    // Try bonus pool
    if (availableTokens.bonus >= estimatedTokens) {
      return {
        canAfford: true,
        usePool: 'bonus',
      };
    }

    // Not enough in either pool
    return {
      canAfford: false,
      usePool: 'premium',
      reason: `Insufficient tokens. Need ${estimatedTokens}, have ${availableTokens.premium} premium + ${availableTokens.bonus} bonus`,
    };
  }

  // ==========================================
  // PUBLIC: STATISTICS & MONITORING
  // ==========================================

  public getRoutingStats(planType: PlanType): RoutingStats | undefined {
    return this.stats.get(planType);
  }

  public getAllStats(): Record<PlanType, RoutingStats> {
    const allStats: any = {};
    this.stats.forEach((stats, planType) => {
      allStats[planType] = stats;
    });
    return allStats;
  }

  public resetStats(): void {
    this.initializeStats();
    console.log('[AIRouter] Routing statistics reset');
  }

  // ==========================================
  // PRIVATE: STATISTICS TRACKING
  // ==========================================

  private trackRouting(planType: PlanType, modelId: string): void {
    const stats = this.stats.get(planType);
    if (!stats) return;

    stats.totalRequests++;
    stats.routingBreakdown[modelId] = 
      (stats.routingBreakdown[modelId] || 0) + 1;

    this.stats.set(planType, stats);
  }

  private initializeStats(): void {
    Object.values(PlanType).forEach(planType => {
      this.stats.set(planType, {
        totalRequests: 0,
        routingBreakdown: {},
        avgConfidence: 0,
      });
    });
  }

  // ==========================================
  // PRIVATE: FALLBACK & ERROR HANDLING
  // ==========================================

  private getDefaultRouting(planType: PlanType): RoutingDecision {
    const models = this.modelSelector.getAvailableModelsForPlan(planType);
    const defaultModel = models[0];

    console.warn(
      `[AIRouter] Using default routing to ${defaultModel.displayName} for ${planType}`
    );

    return {
      model: defaultModel,
      analysis: {
        tier: defaultModel.tier!,
        confidence: 0,
        reasoning: 'Default routing due to error',
        metrics: {
          wordCount: 0,
          sentenceCount: 0,
          hasCode: false,
          hasQuestions: false,
          hasTechnicalTerms: false,
          hasEmotionalContext: false,
        },
      },
      routingStrategy: 'fixed',
      estimatedTokens: 0,
      poolRecommendation: 'premium',
      timestamp: new Date(),
    };
  }

  // ==========================================
  // UTILITY: PLAN CAPABILITIES
  // ==========================================

  public planSupportsSmartRouting(planType: PlanType): boolean {
    return planType !== PlanType.STARTER;
  }

  public getAvailableModels(planType: PlanType): AIModel[] {
    return this.modelSelector.getAvailableModelsForPlan(planType);
  }

  public validateModelForPlan(
    planType: PlanType,
    modelId: string
  ): boolean {
    return this.modelSelector.planSupportsModel(planType, modelId);
  }
}