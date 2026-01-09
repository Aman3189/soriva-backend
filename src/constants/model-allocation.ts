/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MODEL ALLOCATION CONFIG
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
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

export const PLAN_MONTHLY_TOKENS: Record<PlanType, number> = {
  [PlanType.STARTER]: 300000,
  [PlanType.PLUS]: 750000,
  [PlanType.PRO]: 1650000,
  [PlanType.APEX]: 3050000,
  [PlanType.SOVEREIGN]: 999999999,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INDIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INDIA: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER: 300K tokens
  // Mistral Large 3 65% + Flash Lite 35%
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'mistral-large-3',
      percentage: 65,
      tokensAllocated: 195000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash-lite',
      percentage: 35,
      tokensAllocated: 105000,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // PLUS: 750K tokens
  // Mistral Large 3 65% + Flash 35%
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'mistral-large-3',
      percentage: 65,
      tokensAllocated: 487500,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 35,
      tokensAllocated: 262500,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // PRO: 1.65M tokens
  // Mistral 50% + Flash 30% + GPT 10% + Magistral 10%
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'mistral-large-3',
      percentage: 50,
      tokensAllocated: 825000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 30,
      tokensAllocated: 495000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 10,
      tokensAllocated: 165000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'magistral-medium',
      percentage: 10,
      tokensAllocated: 165000,
      priority: 4,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // APEX: 3.05M tokens
  // Mistral 52.2% + Flash 30% + GPT 7.3% + Pro 6.9% + Magistral 3.6%
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'mistral-large-3',
      percentage: 52.2,
      tokensAllocated: 1592100,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 30,
      tokensAllocated: 915000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 7.3,
      tokensAllocated: 222650,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'gemini-2.5-pro',
      percentage: 6.9,
      tokensAllocated: 210450,
      priority: 4,
      tier: 'premium',
    },
    {
      modelId: 'magistral-medium',
      percentage: 3.6,
      tokensAllocated: 109800,
      priority: 5,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // SOVEREIGN: Unlimited tokens
  // Full access to all models
  // ──────────────────────────────────────
  [PlanType.SOVEREIGN]: [
    {
      modelId: 'mistral-large-3',
      percentage: 25,
      tokensAllocated: 250000000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 15,
      tokensAllocated: 150000000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'gemini-3-pro',
      percentage: 15,
      tokensAllocated: 150000000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 20,
      tokensAllocated: 200000000,
      priority: 4,
      tier: 'premium',
    },
    {
      modelId: 'claude-sonnet-4-5',
      percentage: 15,
      tokensAllocated: 150000000,
      priority: 5,
      tier: 'ultra',
    },
    {
      modelId: 'magistral-medium',
      percentage: 10,
      tokensAllocated: 100000000,
      priority: 6,
      tier: 'premium',
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INTERNATIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INTL: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER INTL: Same as India
  // Mistral Large 3 65% + Flash Lite 35%
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'mistral-large-3',
      percentage: 65,
      tokensAllocated: 195000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash-lite',
      percentage: 35,
      tokensAllocated: 105000,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // PLUS INTL: 1.15M tokens
  // Mistral Large 3 65% + Flash 35%
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'mistral-large-3',
      percentage: 65,
      tokensAllocated: 747500,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 35,
      tokensAllocated: 402500,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // PRO INTL: 4.65M tokens
  // Mistral 48.1% + Flash 25% + GPT 10% + Magistral 10.9% + Pro 6%
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'mistral-large-3',
      percentage: 48.1,
      tokensAllocated: 2236650,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 25,
      tokensAllocated: 1162500,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 10,
      tokensAllocated: 465000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'magistral-medium',
      percentage: 10.9,
      tokensAllocated: 506850,
      priority: 4,
      tier: 'premium',
    },
    {
      modelId: 'gemini-2.5-pro',
      percentage: 6,
      tokensAllocated: 279000,
      priority: 5,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // APEX INTL: 6.77M tokens
  // Mistral 37.4% + GPT 22.8% + Flash 15% + Magistral 10% + Claude 7.4% + 3-Pro 7.4%
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'mistral-large-3',
      percentage: 37.4,
      tokensAllocated: 2532180,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 22.8,
      tokensAllocated: 1543560,
      priority: 2,
      tier: 'premium',
    },
    {
      modelId: 'gemini-2.5-flash',
      percentage: 15,
      tokensAllocated: 1015500,
      priority: 3,
      tier: 'budget',
    },
    {
      modelId: 'magistral-medium',
      percentage: 10,
      tokensAllocated: 677000,
      priority: 4,
      tier: 'premium',
    },
    {
      modelId: 'claude-sonnet-4-5',
      percentage: 7.4,
      tokensAllocated: 500980,
      priority: 5,
      tier: 'ultra',
    },
    {
      modelId: 'gemini-3-pro',
      percentage: 7.4,
      tokensAllocated: 500980,
      priority: 6,
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


