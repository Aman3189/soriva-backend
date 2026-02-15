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
 * NEW ROUTING (All Regions):
 * - STARTER: Mistral 50% + Gemini 50%
 * - LITE: Mistral 55% + Gemini 35% + Devstral 10% (Intl only)
 * - PLUS/PRO/APEX: Mistral 50% + Gemini 35% + Devstral 15%
 * - SOVEREIGN: Mistral 50% + Gemini 35% + Devstral 15%
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
  [PlanType.STARTER]: 630000,       // 6.3L (Paid)
  [PlanType.LITE]: 980000,          // 9.8L
  [PlanType.PLUS]: 2100000,         // 21L
  [PlanType.PRO]: 2310000,          // 23.1L
  [PlanType.APEX]: 7460000,         // 74.6L ✅ Updated from 44.6L
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
  [PlanType.APEX]: 15000000,        // 150L (15M) ✅ Updated from 78L
  [PlanType.SOVEREIGN]: 999999999,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ALLOCATIONS - INDIA
// ✅ UPDATED: V10.3 - Haiku/GPT/Sonnet removed, Devstral added
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_ALLOCATIONS_INDIA: Record<PlanType, ModelAllocation[]> = {
  // ──────────────────────────────────────
  // STARTER: 6.3L tokens (Paid)
  // Mistral 50% (3.15L) + Gemini 50% (3.15L)
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'mistral-large-latest',
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
  // Note: India has no Devstral, Intl has 10%
  // ──────────────────────────────────────
  [PlanType.LITE]: [
    {
      modelId: 'mistral-large-latest',
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
  // Mistral 50% (10.5L) + Gemini 35% (7.35L) + Devstral 15% (3.15L)
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 50,
      tokensAllocated: 1050000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 35,
      tokensAllocated: 735000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 15,
      tokensAllocated: 315000,
      priority: 3,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // PRO: 23.1L tokens
  // Mistral 50% (11.55L) + Gemini 35% (8.085L) + Devstral 15% (3.465L)
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 50,
      tokensAllocated: 1155000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 35,
      tokensAllocated: 808500,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 15,
      tokensAllocated: 346500,
      priority: 3,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // APEX: 74.6L tokens
  // Mistral 50% (37.3L) + Gemini 35% (26.11L) + Devstral 15% (11.19L)
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 50,
      tokensAllocated: 3730000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 35,
      tokensAllocated: 2611000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 15,
      tokensAllocated: 1119000,
      priority: 3,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // SOVEREIGN: Unlimited tokens (Founder Edition)
  // Mistral 50% + Gemini 35% + Devstral 15%
  // ──────────────────────────────────────
  [PlanType.SOVEREIGN]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 50,
      tokensAllocated: 500000000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 35,
      tokensAllocated: 350000000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 15,
      tokensAllocated: 150000000,
      priority: 3,
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
  // STARTER INTL: 14L tokens
  // Mistral 50% (7L) + Gemini 50% (7L)
  // ──────────────────────────────────────
  [PlanType.STARTER]: [
    {
      modelId: 'mistral-large-latest',
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
  // Mistral 55% (10.78L) + Gemini 35% (6.86L) + Devstral 10% (1.96L)
  // ──────────────────────────────────────
  [PlanType.LITE]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 55,
      tokensAllocated: 1078000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 35,
      tokensAllocated: 686000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 10,
      tokensAllocated: 196000,
      priority: 3,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // PLUS INTL: 31.2L tokens
  // Mistral 50% (15.6L) + Gemini 35% (10.92L) + Devstral 15% (4.68L)
  // ──────────────────────────────────────
  [PlanType.PLUS]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 50,
      tokensAllocated: 1560000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 35,
      tokensAllocated: 1092000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 15,
      tokensAllocated: 468000,
      priority: 3,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // PRO INTL: 54.4L tokens
  // Mistral 50% (27.2L) + Gemini 35% (19.04L) + Devstral 15% (8.16L)
  // ──────────────────────────────────────
  [PlanType.PRO]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 50,
      tokensAllocated: 2720000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 35,
      tokensAllocated: 1904000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 15,
      tokensAllocated: 816000,
      priority: 3,
      tier: 'coding',
    },
  ],

  // ──────────────────────────────────────
  // APEX INTL: 150L (15M) tokens
  // Mistral 50% (75L) + Gemini 35% (52.5L) + Devstral 15% (22.5L)
  // ──────────────────────────────────────
  [PlanType.APEX]: [
    {
      modelId: 'mistral-large-latest',
      percentage: 50,
      tokensAllocated: 7500000,
      priority: 1,
      tier: 'mid',
    },
    {
      modelId: 'gemini-2.0-flash',
      percentage: 35,
      tokensAllocated: 5250000,
      priority: 2,
      tier: 'budget',
    },
    {
      modelId: 'devstral-medium-latest',
      percentage: 15,
      tokensAllocated: 2250000,
      priority: 3,
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
  return primary?.modelId || 'gemini-2.0-flash';
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