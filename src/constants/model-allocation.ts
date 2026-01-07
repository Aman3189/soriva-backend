/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MODEL ALLOCATION CONFIG
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * 
 * Purpose: Define per-model token allocations for each plan
 * This enforces the ratios defined in plans.ts
 * 
 * CRITICAL: Smart routing MUST respect these allocations
 * If a model's allocation is exhausted, fallback to next available
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from './index';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ModelAllocation {
  modelId: string;
  percentage: number;      // 0-100
  tokensAllocated: number; // Calculated from plan's monthly tokens
  priority: number;        // Lower = higher priority (fallback order)
  tier: 'budget' | 'mid' | 'premium' | 'ultra';
}

export interface PlanAllocation {
  planType: PlanType;
  monthlyTokens: number;
  models: ModelAllocation[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN TOKEN LIMITS (From plans.ts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_MONTHLY_TOKENS: Record<PlanType, number> = {
  [PlanType.STARTER]: 300000,
  [PlanType.PLUS]: 1500000,
  [PlanType.PRO]: 3000000,
  [PlanType.APEX]: 6000000,
  [PlanType.SOVEREIGN]: 15000000,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INDIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INDIA: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER: 300K tokens
  // Flash Lite 50% + Kimi 50%
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'gemini-2.5-flash-lite',
      percentage: 50,
      tokensAllocated: 150000,
      priority: 1,
      tier: 'budget',
    },
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 50,
      tokensAllocated: 150000,
      priority: 2,
      tier: 'mid',
    },
  ],

  // ──────────────────────────────────────
  // PLUS: 1.5M tokens
  // Kimi 50% + Flash 50%
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 50,
      tokensAllocated: 750000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 50,
      tokensAllocated: 750000,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // PRO: 3M tokens
  // Flash 60% + Kimi 20% + GPT 20%
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'gemini-2.5-flash',
      percentage: 60,
      tokensAllocated: 1800000,
      priority: 1,
      tier: 'budget',
    },
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 20,
      tokensAllocated: 600000,
      priority: 2,
      tier: 'mid',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 20,
      tokensAllocated: 600000,
      priority: 3,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // APEX: 6M tokens
  // Flash 41.1% + Kimi 41.1% + Pro 6.9% + GPT 10.9%
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'gemini-2.5-flash',
      percentage: 41.1,
      tokensAllocated: 2466000,
      priority: 1,
      tier: 'budget',
    },
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 41.1,
      tokensAllocated: 2466000,
      priority: 2,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-pro',
      percentage: 6.9,
      tokensAllocated: 414000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 10.9,
      tokensAllocated: 654000,
      priority: 4,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // SOVEREIGN: 15M tokens
  // Full access to all models
  // ──────────────────────────────────────
  [PlanType.SOVEREIGN]: [
    {
      modelId: 'gemini-2.5-flash',
      percentage: 30,
      tokensAllocated: 4500000,
      priority: 1,
      tier: 'budget',
    },
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 25,
      tokensAllocated: 3750000,
      priority: 2,
      tier: 'mid',
    },
    {
      modelId: 'gemini-3-pro',
      percentage: 15,
      tokensAllocated: 2250000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 15,
      tokensAllocated: 2250000,
      priority: 4,
      tier: 'premium',
    },
    {
      modelId: 'claude-sonnet-4-5',
      percentage: 15,
      tokensAllocated: 2250000,
      priority: 5,
      tier: 'ultra',
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INTERNATIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INTL: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER INTL: Same as India
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'gemini-2.5-flash-lite',
      percentage: 50,
      tokensAllocated: 150000,
      priority: 1,
      tier: 'budget',
    },
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 50,
      tokensAllocated: 150000,
      priority: 2,
      tier: 'mid',
    },
  ],

  // ──────────────────────────────────────
  // PLUS INTL: Flash 70% + Kimi 30%
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'gemini-2.5-flash',
      percentage: 70,
      tokensAllocated: 1050000,
      priority: 1,
      tier: 'budget',
    },
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 30,
      tokensAllocated: 450000,
      priority: 2,
      tier: 'mid',
    },
  ],

  // ──────────────────────────────────────
  // PRO INTL: Flash 43.1% + Kimi 30% + Pro 9.3% + GPT 17.6%
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'gemini-2.5-flash',
      percentage: 43.1,
      tokensAllocated: 1293000,
      priority: 1,
      tier: 'budget',
    },
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 30,
      tokensAllocated: 900000,
      priority: 2,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-pro',
      percentage: 9.3,
      tokensAllocated: 279000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 17.6,
      tokensAllocated: 528000,
      priority: 4,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // APEX INTL: Kimi 35.2% + GPT 32.8% + Flash 17.2% + Claude 7.4% + 3-Pro 7.4%
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'moonshotai/kimi-k2-thinking',
      percentage: 35.2,
      tokensAllocated: 2112000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 32.8,
      tokensAllocated: 1968000,
      priority: 2,
      tier: 'premium',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 17.2,
      tokensAllocated: 1032000,
      priority: 3,
      tier: 'budget',
    },
    {
      modelId: 'claude-sonnet-4-5',
      percentage: 7.4,
      tokensAllocated: 444000,
      priority: 4,
      tier: 'ultra',
    },
    {
      modelId: 'gemini-3-pro',
      percentage: 7.4,
      tokensAllocated: 444000,
      priority: 5,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // SOVEREIGN INTL: Same as India
  // ──────────────────────────────────────
  [PlanType.SOVEREIGN]: MODEL_ALLOCATIONS_INDIA[PlanType.SOVEREIGN],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get model allocations for a plan
 */
export function getModelAllocations(
  planType: PlanType,
  region: 'IN' | 'INTL' = 'IN'
): ModelAllocation[] {
  const allocations = region === 'INTL' 
    ? MODEL_ALLOCATIONS_INTL[planType] 
    : MODEL_ALLOCATIONS_INDIA[planType];
  
  return allocations || [];
}

/**
 * Get allocation for a specific model
 */
export function getModelAllocation(
  planType: PlanType,
  modelId: string,
  region: 'IN' | 'INTL' = 'IN'
): ModelAllocation | undefined {
  const allocations = getModelAllocations(planType, region);
  return allocations.find(a => a.modelId === modelId);
}

/**
 * Get total tokens for a plan
 */
export function getPlanMonthlyTokens(planType: PlanType): number {
  return PLAN_MONTHLY_TOKENS[planType] || 0;
}

/**
 * Get fallback model (next available by priority)
 */
export function getFallbackModel(
  planType: PlanType,
  exhaustedModelIds: string[],
  region: 'IN' | 'INTL' = 'IN'
): ModelAllocation | undefined {
  const allocations = getModelAllocations(planType, region);
  
  // Sort by priority and find first non-exhausted
  const sorted = [...allocations].sort((a, b) => a.priority - b.priority);
  
  return sorted.find(a => !exhaustedModelIds.includes(a.modelId));
}

/**
 * Check if model is available for plan
 */
export function isModelAvailableForPlan(
  planType: PlanType,
  modelId: string,
  region: 'IN' | 'INTL' = 'IN'
): boolean {
  const allocation = getModelAllocation(planType, modelId, region);
  return allocation !== undefined && allocation.tokensAllocated > 0;
}

/**
 * Get all model IDs for a plan
 */
export function getPlanModelIds(
  planType: PlanType,
  region: 'IN' | 'INTL' = 'IN'
): string[] {
  return getModelAllocations(planType, region).map(a => a.modelId);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { PLAN_MONTHLY_TOKENS };