/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MODEL ALLOCATION CONFIG
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * Updated: January 19, 2026 - Added LITE plan support
 * 
 * Purpose: Define per-model token allocations for each plan
 * This enforces the ratios defined in plans.ts
 * 
 * CHANGES (January 19, 2026):
 * - ✅ ADDED: LITE plan to PLAN_MONTHLY_TOKENS
 * - ✅ ADDED: LITE plan to MODEL_ALLOCATIONS_INDIA
 * - ✅ ADDED: LITE plan to MODEL_ALLOCATIONS_INTL
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
// ✅ UPDATED: Added LITE plan
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAN_MONTHLY_TOKENS: Record<PlanType, number> = {
  [PlanType.STARTER]: 630000,       // 6.3L (Paid), Free has 3.5L handled separately
  [PlanType.LITE]: 980000,          // 9.8L
  [PlanType.PLUS]: 2100000,         // 21L
  [PlanType.PRO]: 2310000,          // 23.1L
  [PlanType.APEX]: 4460000,         // 44.6L
  [PlanType.SOVEREIGN]: 999999999,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN TOKEN LIMITS - INTERNATIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAN_MONTHLY_TOKENS_INTL: Record<PlanType, number> = {
  [PlanType.STARTER]: 1400000,      // 14L
  [PlanType.LITE]: 1960000,         // 19.6L
  [PlanType.PLUS]: 3120000,         // 31.2L
  [PlanType.PRO]: 5440000,          // 54.4L
  [PlanType.APEX]: 7800000,         // 78L
  [PlanType.SOVEREIGN]: 999999999,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INDIA
// ✅ UPDATED: Added LITE plan
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INDIA: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER: 6.3L tokens (Paid)
  // Mistral 50% (3.15L) + Gemini 50% (3.15L)
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 50,
      tokensAllocated: 315000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 50,
      tokensAllocated: 315000,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // LITE: 9.8L tokens
  // Mistral 50% (4.9L) + Gemini 50% (4.9L)
  // ──────────────────────────────────────
  [PlanType.LITE]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 50,
      tokensAllocated: 490000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 50,
      tokensAllocated: 490000,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // PLUS: 21L tokens
  // Mistral 50% (10.5L) + Gemini 50% (10.5L)
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 50,
      tokensAllocated: 1050000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 50,
      tokensAllocated: 1050000,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // PRO: 23.1L tokens
  // Mistral 39% (9.1L) + Gemini 39% (9.1L) + Haiku 22% (4.9L)
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 39,
      tokensAllocated: 910000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 39,
      tokensAllocated: 910000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'claude-haiku-4-5',
      percentage: 22,
      tokensAllocated: 490000,
      priority: 3,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // APEX: 44.6L tokens
  // Mistral 36% (15.93L) + Gemini 36% (15.93L) + Haiku 19% (8.56L) + GPT 9% (4.18L)
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 36,
      tokensAllocated: 1593000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 36,
      tokensAllocated: 1593000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'claude-haiku-4-5',
      percentage: 19,
      tokensAllocated: 856000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 9,
      tokensAllocated: 418000,
      priority: 4,
      tier: 'ultra',
    },
  ],

  // ──────────────────────────────────────
  // SOVEREIGN: Unlimited tokens
  // Full access to all models (Founder Edition)
  // ──────────────────────────────────────
  [PlanType.SOVEREIGN]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 20,
      tokensAllocated: 200000000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 20,
      tokensAllocated: 200000000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'claude-haiku-4-5',
      percentage: 20,
      tokensAllocated: 200000000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'claude-sonnet-4-5',
      percentage: 20,
      tokensAllocated: 200000000,
      priority: 4,
      tier: 'ultra',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 20,
      tokensAllocated: 200000000,
      priority: 5,
      tier: 'ultra',
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INTERNATIONAL
// ✅ UPDATED: Added LITE plan
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INTL: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER INTL: 14L tokens
  // Mistral 50% (7L) + Gemini 50% (7L)
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 50,
      tokensAllocated: 700000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 50,
      tokensAllocated: 700000,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // LITE INTL: 19.6L tokens
  // Mistral 50% (9.8L) + Gemini 50% (9.8L)
  // ──────────────────────────────────────
  [PlanType.LITE]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 50,
      tokensAllocated: 980000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 50,
      tokensAllocated: 980000,
      priority: 2,
      tier: 'budget',
    },
  ],

  // ──────────────────────────────────────
  // PLUS INTL: 31.2L tokens
  // Mistral 39% (12.29L) + Gemini 39% (12.29L) + Haiku 22% (6.61L)
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 39,
      tokensAllocated: 1229000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 39,
      tokensAllocated: 1229000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'claude-haiku-4-5',
      percentage: 22,
      tokensAllocated: 661000,
      priority: 3,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // PRO INTL: 54.4L tokens
  // Mistral 38% (20.83L) + Gemini 38% (20.83L) + GPT 24% (12.75L)
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 38,
      tokensAllocated: 2083000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 38,
      tokensAllocated: 2083000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 24,
      tokensAllocated: 1275000,
      priority: 3,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // APEX INTL: 78L tokens
  // Mistral 28% (22.06L) + Gemini 28% (22.06L) + Haiku 22% (17.15L) + GPT 9% (7L) + Sonnet 13% (9.8L)
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'mistral-large-3-2512',
      percentage: 28,
      tokensAllocated: 2206000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 28,
      tokensAllocated: 2206000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'claude-haiku-4-5',
      percentage: 22,
      tokensAllocated: 1715000,
      priority: 3,
      tier: 'premium',
    },
    {
      modelId: 'gpt-5.1',
      percentage: 9,
      tokensAllocated: 700000,
      priority: 4,
      tier: 'premium',
    },
    {
      modelId: 'claude-sonnet-4-5',
      percentage: 13,
      tokensAllocated: 980000,
      priority: 5,
      tier: 'ultra',
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

/**
 * ✅ NEW: Check if plan is a free plan (STARTER or LITE)
 */
export function isFreePlan(planType: PlanType): boolean {
  return planType === PlanType.STARTER || planType === PlanType.LITE;
}

/**
 * ✅ NEW: Get primary model for a plan
 */
export function getPrimaryModel(
  planType: PlanType,
  region: 'IN' | 'INTL' = 'IN'
): string {
  const allocations = getModelAllocations(planType, region);
  const primary = allocations.find(a => a.priority === 1);
  return primary?.modelId || 'gemini-2.0-flash';
}