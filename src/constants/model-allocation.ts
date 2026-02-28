/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MODEL ALLOCATION CONFIG
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * Updated: February 15, 2026 - V10.3 Routing Update
 * 
 * Purpose: Define per-model token allocations for each plan
 * This enforces the ratios defined in plans.ts
 * 
 * CHANGES (February 15, 2026):
 * - ❌ REMOVED: claude-haiku-4-5 from all plans
 * - ❌ REMOVED: gpt-5.1 from all plans
 * - ❌ REMOVED: claude-sonnet-4-5 from all plans
 * - ✅ ADDED: devstral-medium-latest for CODING tier (LITE 10%, PLUS/PRO/APEX 15%)
 * - ✅ UPDATED: Token allocations to match plans.ts V10.3
 * - ✅ ADDED: 'coding' tier type
 * 
 * NEW ROUTING (Updated Feb 27, 2026):
 * - ALL PLANS: 100% Mistral Large for Chat
 * - Devstral: Code Toggle ON activates (unified pool with Mistral)
 * - Gemini: ONLY for Doc AI + Fallback
 * - STARTER/LITE/PLUS Doc AI: Gemini Flash
 * - PRO/APEX Doc AI: Mistral Large
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
  tier: 'budget' | 'mid' | 'premium' | 'coding';  // ✅ Added 'coding' tier
}

export interface PlanAllocation {
  planType: PlanType;
  monthlyTokens: number;
  models: ModelAllocation[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN TOKEN LIMITS - INDIA (From plans.ts V10.3)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAN_MONTHLY_TOKENS: Record<PlanType, number> = {
  [PlanType.STARTER]: 800000,       // 8L (100% Mistral)
  [PlanType.LITE]: 1100000,         // 11L (100% Mistral)
  [PlanType.PLUS]: 2100000,         // 21L (100% Mistral)
  [PlanType.PRO]: 3000000,          // 30L (100% Mistral)
  [PlanType.APEX]: 7000000,         // 70L (100% Mistral)
  [PlanType.SOVEREIGN]: 999999999,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN TOKEN LIMITS - INTERNATIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAN_MONTHLY_TOKENS_INTL: Record<PlanType, number> = {
  [PlanType.STARTER]: 1400000,      // 14L (100% Mistral)
  [PlanType.LITE]: 3000000,         // 30L (100% Mistral)
  [PlanType.PLUS]: 4500000,         // 45L (100% Mistral)
  [PlanType.PRO]: 7500000,          // 75L (100% Mistral)
  [PlanType.APEX]: 18000000,        // 180L (100% Mistral)
  [PlanType.SOVEREIGN]: 999999999,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INDIA
// ✅ UPDATED: V10.3 - Haiku/GPT/Sonnet removed, Devstral added
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INDIA: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER: 8L tokens (100% Mistral)
  // Gemini only for fallback
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 800000,
      priority: 1,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // LITE: 11L tokens (100% Mistral)
  // Gemini only for fallback
  // ──────────────────────────────────────
  [PlanType.LITE]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 1100000,
      priority: 1,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // PLUS: 21L tokens (Mistral + Devstral unified pool)
  // Devstral activates when Code Toggle ON
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 2100000,
      priority: 1,
      tier: 'premium',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 100,
      tokensAllocated: 2100000,
      priority: 1,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // PRO: 30L tokens (Mistral + Devstral unified pool)
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 3000000,
      priority: 1,
      tier: 'premium',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 100,
      tokensAllocated: 3000000,
      priority: 1,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // APEX: 70L tokens (Mistral + Devstral unified pool)
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 7000000,
      priority: 1,
      tier: 'premium',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 100,
      tokensAllocated: 7000000,
      priority: 1,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // SOVEREIGN: Same as APEX
  // ──────────────────────────────────────
  [PlanType.SOVEREIGN]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 500000000,
      priority: 1,
      tier: 'premium',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 100,
      tokensAllocated: 500000000,
      priority: 1,
      tier: 'coding',
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INTERNATIONAL
// ✅ UPDATED: V10.3 - Haiku/GPT/Sonnet removed, Devstral added
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INTL: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER INTL: 14L tokens (100% Mistral)
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 1400000,
      priority: 1,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // LITE INTL: 30L tokens (100% Mistral)
  // ──────────────────────────────────────
  [PlanType.LITE]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 3000000,
      priority: 1,
      tier: 'premium',
    },
  ],

  // ──────────────────────────────────────
  // PLUS INTL: 45L tokens (Mistral + Devstral unified pool)
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 4500000,
      priority: 1,
      tier: 'premium',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 100,
      tokensAllocated: 4500000,
      priority: 1,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // PRO INTL: 75L tokens (Mistral + Devstral unified pool)
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 7500000,
      priority: 1,
      tier: 'premium',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 100,
      tokensAllocated: 7500000,
      priority: 1,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // APEX INTL: 180L tokens (Mistral + Devstral unified pool)
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 100,
      tokensAllocated: 18000000,
      priority: 1,
      tier: 'premium',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 100,
      tokensAllocated: 18000000,
      priority: 1,
      tier: 'coding',
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
export function getPlanMonthlyTokens(
  planType: PlanType,
  region: 'IN' | 'INTL' = 'IN'
): number {
  return region === 'INTL' 
    ? PLAN_MONTHLY_TOKENS_INTL[planType] || 0
    : PLAN_MONTHLY_TOKENS[planType] || 0;
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
 * Check if plan is a free plan (STARTER trial)
 */
export function isFreePlan(planType: PlanType): boolean {
  return planType === PlanType.STARTER;
}

/**
 * Get primary model for a plan
 */
export function getPrimaryModel(
  planType: PlanType,
  region: 'IN' | 'INTL' = 'IN'
): string {
  const allocations = getModelAllocations(planType, region);
  const primary = allocations.find(a => a.priority === 1);
  return primary?.modelId || 'mistral-large-latest';
}

/**
 * ✅ NEW: Get coding model for a plan (Devstral)
 */
export function getCodingModel(
  planType: PlanType,
  region: 'IN' | 'INTL' = 'IN'
): string | undefined {
  const allocations = getModelAllocations(planType, region);
  const coding = allocations.find(a => a.tier === 'coding');
  return coding?.modelId;
}

/**
 * ✅ NEW: Check if plan has coding model access
 */
export function hasCodingModelAccess(
  planType: PlanType,
  region: 'IN' | 'INTL' = 'IN'
): boolean {
  return getCodingModel(planType, region) !== undefined;
}