// src/core/ai/prompts/pro-routing.ts
// ============================================================================
// SORIVA PRO ROUTING v2.0 - January 2026
// ============================================================================
// Purpose: Intent-based model routing for Pro plan with GPT cap protection
// 
// Routing Logic:
// - EVERYDAY     → Flash / Mistral (NO GPT) - Hash-based 60:40
// - PROFESSIONAL → Mistral / Gemini Pro (budget-aware) - Hash-based
// - TECHNICAL    → Mistral / Gemini Pro - Hash-based 50:50
// - EXPERT       → GPT-5.1 (with monthly cap + pre-estimation check)
//
// GPT-5.1 Monthly Caps:
// - India: 220,000 tokens
// - International: 650,000 tokens
//
// v2.0 Updates:
// - Compatible with lean pro-intent-classifier v2.0
// - Added TECHNICAL intent routing
// - Cleaner code, same business logic
// ============================================================================

import { ProIntent } from './pro-delta';
import { classifyProIntent, shouldAllowGPT } from './pro-intent-classifier';
import { getProDelta } from './pro-delta';

// ============================================================================
// TYPES
// ============================================================================

export type Region = 'IN' | 'INTL';

export interface ProRoutingResult {
  model: string;
  modelDisplayName: string;
  intent: ProIntent;
  deltaPrompt: string;
  gptAllowed: boolean;
  gptCapReached: boolean;
  estimatedTokens: number;
  metadata: {
    gptTokensUsed: number;
    gptTokensRemaining: number;
    gptCapLimit: number;
    fallbackApplied: boolean;
    fallbackReason: string | null;
    routingHash: number;
  };
}

export interface ProRoutingOptions {
  gptTokensUsed: number;
  region: Region;
  userId?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * GPT-5.1 Monthly Token Caps
 * Protects margin from heavy GPT usage
 */
export const GPT_MONTHLY_CAPS = {
  IN: 220000,      // India: 220K tokens/month
  INTL: 650000,    // International: 650K tokens/month
};

/**
 * GPT Safe Threshold
 * Stop GPT routing when remaining tokens below this
 */
const GPT_SAFE_THRESHOLD = 20000;

/**
 * Professional Fallback Threshold
 * Use better distribution if remaining > this, else prefer cheaper model
 */
const PROFESSIONAL_FALLBACK_THRESHOLD = 80000;

/**
 * Model IDs
 */
export const MODELS = {
  GPT_51: 'gpt-5.1',
  GEMINI_PRO: 'gemini-2.5-pro',
  GEMINI_FLASH: 'gemini-2.5-flash',
  MISTRAL_LARGE: 'mistral-large-3',
};

/**
 * Model Display Names
 */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  [MODELS.GPT_51]: 'GPT-5.1',
  [MODELS.GEMINI_PRO]: 'Gemini Pro',
  [MODELS.GEMINI_FLASH]: 'Gemini Flash',
  [MODELS.MISTRAL_LARGE]: 'Mistral Large 3',
};

// ============================================================================
// HASH-BASED ROUTING (Deterministic)
// ============================================================================

/**
 * Generate deterministic hash for routing
 * Same input = same output (no randomness)
 */
function generateRoutingHash(message: string, userId?: string): number {
  const input = userId ? `${userId}:${message}` : message;
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash) % 100;
}

/**
 * Select model based on hash and distribution
 */
function selectModelByHash(
  hash: number,
  distribution: Array<{ model: string; threshold: number }>
): string {
  for (const { model, threshold } of distribution) {
    if (hash < threshold) return model;
  }
  return distribution[distribution.length - 1].model;
}

// ============================================================================
// GPT ESTIMATION & VALIDATION
// ============================================================================

/**
 * Estimate GPT tokens for a message + expected response
 * Rough estimate: 1 token ≈ 4 characters
 */
export function estimateGPTTokens(message: string, intent: ProIntent): number {
  const inputTokens = Math.ceil(message.length / 4) + 200;

  const expectedResponseLength =
    intent === 'EXPERT' ? 900 :
    intent === 'PROFESSIONAL' ? 500 :
    intent === 'TECHNICAL' ? 600 :
    250;

  return inputTokens + expectedResponseLength;
}

/**
 * Check if GPT can handle this request without breaching cap
 * Prevents accidental cap breach mid-call
 */
function canGPTHandleRequest(
  estimatedTokens: number,
  gptTokensRemaining: number
): boolean {
  const safeRemaining = gptTokensRemaining - 5000; // 5K buffer
  return estimatedTokens <= safeRemaining && safeRemaining > GPT_SAFE_THRESHOLD;
}

// ============================================================================
// MAIN ROUTING FUNCTION
// ============================================================================

/**
 * Resolve model for Pro plan message
 * Combines intent classification, GPT cap check, estimation, and fallback logic
 */
export function resolveProModel(
  message: string,
  options: ProRoutingOptions
): ProRoutingResult {
  const { gptTokensUsed, region, userId } = options;

  // Calculate GPT cap and remaining
  const gptCapLimit = GPT_MONTHLY_CAPS[region];
  const gptTokensRemaining = Math.max(0, gptCapLimit - gptTokensUsed);
  const gptCapReached = gptTokensRemaining < GPT_SAFE_THRESHOLD;

  // Generate deterministic routing hash
  const routingHash = generateRoutingHash(message, userId);

  // Classify intent
  const intent = classifyProIntent(message);

  // Estimate tokens for this request
  const estimatedTokens = estimateGPTTokens(message, intent);

  // Check if GPT can handle this request
  const gptCanHandle = canGPTHandleRequest(estimatedTokens, gptTokensRemaining);

  // Check GPT allowance based on intent
  const gptAllowedByIntent = shouldAllowGPT(intent, gptTokensRemaining);

  // Select model based on intent, caps, and estimation
  const { model, fallbackApplied, fallbackReason } = selectModel(
    intent,
    gptAllowedByIntent,
    gptCapReached,
    gptCanHandle,
    gptTokensRemaining,
    routingHash
  );

  // Get delta prompt
  const deltaPrompt = getProDelta(intent);

  return {
    model,
    modelDisplayName: MODEL_DISPLAY_NAMES[model] || model,
    intent,
    deltaPrompt,
    gptAllowed: gptAllowedByIntent && !gptCapReached && gptCanHandle,
    gptCapReached,
    estimatedTokens,
    metadata: {
      gptTokensUsed,
      gptTokensRemaining,
      gptCapLimit,
      fallbackApplied,
      fallbackReason,
      routingHash,
    },
  };
}

// ============================================================================
// MODEL SELECTION (Deterministic)
// ============================================================================

/**
 * Select model based on intent and constraints
 * Uses hash-based routing for determinism
 */
function selectModel(
  intent: ProIntent,
  gptAllowed: boolean,
  gptCapReached: boolean,
  gptCanHandle: boolean,
  gptTokensRemaining: number,
  routingHash: number
): { model: string; fallbackApplied: boolean; fallbackReason: string | null } {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EVERYDAY → Flash / Kimi (NO GPT ever)
  // Hash-based 60:40 distribution
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'EVERYDAY') {
    const model = selectModelByHash(routingHash, [
      { model: MODELS.GEMINI_FLASH, threshold: 60 }, // 0-59 = Flash (60%)
      { model: MODELS.MISTRAL_LARGE, threshold: 100 },     // 60-99 = Mistral (40%)
    ]);
    return { model, fallbackApplied: false, fallbackReason: null };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROFESSIONAL → Smart budget-based routing
  // More budget = better distribution, less budget = prefer cheaper
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'PROFESSIONAL') {
    if (gptTokensRemaining > PROFESSIONAL_FALLBACK_THRESHOLD) {
      // More budget → 50:50 Mistral/Gemini Pro
      const model = selectModelByHash(routingHash, [
        { model: MODELS.MISTRAL_LARGE, threshold: 50 },
        { model: MODELS.GEMINI_PRO, threshold: 100 },
      ]);
      return { model, fallbackApplied: false, fallbackReason: null };
    } else {
      // Less budget → 70:30 prefer Mistral (cheaper)
      const model = selectModelByHash(routingHash, [
        { model: MODELS.MISTRAL_LARGE, threshold: 70 },
        { model: MODELS.GEMINI_PRO, threshold: 100 },
      ]);
      return { model, fallbackApplied: false, fallbackReason: null };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TECHNICAL → Kimi / Gemini Pro (50:50)
  // Good balance for code-related queries
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'TECHNICAL') {
    const model = selectModelByHash(routingHash, [
      { model: MODELS.MISTRAL_LARGE, threshold: 50 },
      { model: MODELS.GEMINI_PRO, threshold: 100 },
    ]);
    return { model, fallbackApplied: false, fallbackReason: null };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXPERT → GPT-5.1 (with cap + estimation protection)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'EXPERT') {
    // GPT allowed, cap not reached, AND can handle this request
    if (gptAllowed && !gptCapReached && gptCanHandle) {
      return { model: MODELS.GPT_51, fallbackApplied: false, fallbackReason: null };
    }

    // Fallback: GPT unavailable → Gemini Pro
    let fallbackReason = 'unknown';
    if (gptCapReached) {
      fallbackReason = 'gpt_cap_reached';
    } else if (!gptCanHandle) {
      fallbackReason = 'gpt_estimation_exceeded';
    } else if (!gptAllowed) {
      fallbackReason = 'gpt_not_allowed';
    }

    return { 
      model: MODELS.GEMINI_PRO, 
      fallbackApplied: true, 
      fallbackReason 
    };
  }

  // Default fallback
  return { model: MODELS.GEMINI_FLASH, fallbackApplied: false, fallbackReason: null };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if GPT is available for this user/region
 */
export function isGPTAvailable(gptTokensUsed: number, region: Region): boolean {
  const cap = GPT_MONTHLY_CAPS[region];
  const remaining = cap - gptTokensUsed;
  return remaining >= GPT_SAFE_THRESHOLD;
}

/**
 * Get GPT usage stats for user
 */
export function getGPTUsageStats(
  gptTokensUsed: number,
  region: Region
): {
  used: number;
  remaining: number;
  cap: number;
  percentUsed: number;
  isNearCap: boolean;
  isCapReached: boolean;
} {
  const cap = GPT_MONTHLY_CAPS[region];
  const remaining = Math.max(0, cap - gptTokensUsed);
  const percentUsed = Math.round((gptTokensUsed / cap) * 100);

  return {
    used: gptTokensUsed,
    remaining,
    cap,
    percentUsed,
    isNearCap: remaining < 50000,
    isCapReached: remaining < GPT_SAFE_THRESHOLD,
  };
}

/**
 * Get fallback model for when GPT is unavailable
 */
export function getFallbackModel(intent: ProIntent): string {
  switch (intent) {
    case 'EXPERT':
      return MODELS.GEMINI_PRO;
    case 'PROFESSIONAL':
    case 'TECHNICAL':
      return MODELS.MISTRAL_LARGE;
    case 'EVERYDAY':
    default:
      return MODELS.GEMINI_FLASH;
  }
}

/**
 * Get model cost per 1M tokens (for analytics)
 */
export function getModelCostPer1M(model: string): number {
  const costs: Record<string, number> = {
    [MODELS.GPT_51]: 850,
    [MODELS.GEMINI_PRO]: 180,
    [MODELS.GEMINI_FLASH]: 210,
    [MODELS.MISTRAL_LARGE]: 125,
  };
  return costs[model] || 100;
}

/**
 * Estimate cost for this specific call (for analytics)
 */
export function estimateCallCost(model: string, estimatedTokens: number): number {
  const costPer1M = getModelCostPer1M(model);
  return (estimatedTokens / 1000000) * costPer1M;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

/**
 * Handle Pro message - main entry point
 */
export function handleProMessage(
  message: string,
  options: ProRoutingOptions
): ProRoutingResult {
  return resolveProModel(message, options);
}

export default handleProMessage;