// src/services/ai/routing/router.service.ts

/**
 * ==========================================
 * AI ROUTER SERVICE - MAIN ORCHESTRATOR
 * ==========================================
 * Coordinates smart AI routing based on:
 * - Query complexity analysis
 * - User plan capabilities
 * - Model availability and fallbacks
 * - Usage tracking
 * 
 * Last Updated: November 17, 2025
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
  timestamp: Date;
}

export interface RoutingStats {
  totalRequests: number;
  routingBreakdown: Record<string, number>;
  avgConfidence: number;
}

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
  // PUBLIC: MAIN ROUTING METHOD
  // ==========================================

  public async routeQuery(
    query: string,
    planType: PlanType
  ): Promise<RoutingDecision> {
    try {
      const analysis = this.queryAnalyzer.analyzeQuery(query);

      console.log(
        `[AIRouter] Query analysis: tier=${analysis.tier}, confidence=${analysis.confidence}`
      );

      const selection = this.modelSelector.selectModel(planType, analysis.tier);

      this.trackRouting(planType, selection.model.modelId);

      const decision: RoutingDecision = {
        model: selection.model,
        fallbackModel: selection.fallbackModel,
        analysis,
        routingStrategy: selection.isRouted ? 'smart' : 'fixed',
        timestamp: new Date(),
      };

      console.log(
        `[AIRouter] Routed to ${selection.model.displayName} for ${planType} plan`
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
    primaryFailed: boolean = false
  ): Promise<RoutingDecision> {
    const decision = await this.routeQuery(query, planType);

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
    planType: PlanType
  ): Promise<RoutingDecision[]> {
    return Promise.all(
      queries.map(query => this.routeQuery(query, planType))
    );
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