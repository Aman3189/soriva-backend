// src/core/ai/prompts/pro-routing.ts
// ============================================================================
// SORIVA PRO ROUTING v1.1 - January 2026
// ============================================================================
// Purpose: Intent-based model routing for Pro plan with GPT cap protection
// 
// Routing Logic:
// - EVERYDAY     → Flash / Kimi (NO GPT) - Hash-based 60:40
// - PROFESSIONAL → Kimi / Gemini Pro (rare GPT if high-stakes) - Hash-based 50:50
// - EXPERT       → GPT-5.1 (with monthly cap + pre-estimation check)
//
// GPT-5.1 Monthly Caps:
// - India: 220,000 tokens
// - International: 650,000 tokens
//
// v1.1 Updates:
// - Hash-based routing (deterministic, no randomness)
// - GPT estimation pre-check before routing
// - Smart PROFESSIONAL fallback (Gemini Pro vs Kimi based on budget)
// - Renamed softGPTEscalation → softGPTEscalationTriggered
//
// ⚠️ FROZEN FILE - Do not add more conditions or randomness
// ============================================================================

import { ProIntentType, classifyProIntent, ProIntentResult } from './pro-intent-classifier';
import { getProDelta } from './pro-delta';

// ============================================================================
// TYPES
// ============================================================================

export type Region = 'IN' | 'INTL';

export interface ProRoutingResult {
  model: string;
  modelDisplayName: string;
  intent: ProIntentType;
  deltaPrompt: string;
  gptAllowed: boolean;
  gptCapReached: boolean;
  isFollowUp: boolean;
  estimatedTokens: number;
  metadata: {
    gptTokensUsed: number;
    gptTokensRemaining: number;
    gptCapLimit: number;
    softGPTEscalationTriggered: boolean; // Renamed for clarity
    fallbackApplied: boolean;
    fallbackReason: string | null;
    routingHash: number; // For debugging deterministic routing
  };
}

export interface ProRoutingOptions {
  gptTokensUsed: number;
  region: Region;
  turnNumber?: number;
  sessionIntent?: ProIntentType;
  sessionIntentLocked?: boolean;
  userId?: string; // For hash-based routing consistency
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
 * Use Gemini Pro if remaining > this, else Kimi (cheaper)
 */
const PROFESSIONAL_FALLBACK_THRESHOLD = 80000;

/**
 * Model IDs
 */
export const MODELS = {
  GPT_51: 'gpt-5.1',
  GEMINI_PRO: 'gemini-2.5-pro',
  GEMINI_FLASH: 'gemini-2.5-flash',
  KIMI_K2: 'moonshotai/kimi-k2-thinking',
};

/**
 * Model Display Names
 */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  [MODELS.GPT_51]: 'GPT-5.1',
  [MODELS.GEMINI_PRO]: 'Gemini Pro',
  [MODELS.GEMINI_FLASH]: 'Gemini Flash',
  [MODELS.KIMI_K2]: 'Kimi K2',
};

// ============================================================================
// HASH-BASED ROUTING (Deterministic)
// ============================================================================

/**
 * Generate deterministic hash for routing
 * Same input = same output (no randomness)
 * 
 * @param message - User's message
 * @param userId - Optional user ID for extra consistency
 * @returns Hash value 0-99
 */
function generateRoutingHash(message: string, userId?: string): number {
  const input = userId ? `${userId}:${message}` : message;
  
  // Simple but effective hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Return 0-99 range
  return Math.abs(hash) % 100;
}

/**
 * Select model based on hash and distribution
 * @param hash - Routing hash (0-99)
 * @param distribution - Array of [model, percentage] pairs
 * @returns Selected model
 */
function selectModelByHash(
  hash: number,
  distribution: Array<{ model: string; threshold: number }>
): string {
  for (const { model, threshold } of distribution) {
    if (hash < threshold) {
      return model;
    }
  }
  return distribution[distribution.length - 1].model;
}

// ============================================================================
// GPT ESTIMATION
// ============================================================================

/**
 * Estimate GPT tokens for a message + expected response
 * Rough estimate: 1 token ≈ 4 characters
 * 
 * @param message - User's message
 * @param expectedResponseLength - Expected response tokens (default 800 for EXPERT)
 * @returns Estimated total tokens
 */
export function estimateGPTTokens(
  message: string,
  intent: ProIntentType
): number {
  const inputTokens = Math.ceil(message.length / 4) + 200;

  const expectedResponseLength =
    intent === 'EXPERT' ? 900 :
    intent === 'PROFESSIONAL' ? 500 :
    250;

  return inputTokens + expectedResponseLength;
}

/**
 * Check if GPT can handle this request without breaching cap
 * @param estimatedTokens - Estimated tokens for this call
 * @param gptTokensRemaining - Remaining GPT tokens
 * @returns Whether GPT can safely handle this request
 */
function canGPTHandleRequest(
  estimatedTokens: number,
  gptTokensRemaining: number
): boolean {
  // Leave buffer of 5000 tokens for safety
  const safeRemaining = gptTokensRemaining - 5000;
  return estimatedTokens <= safeRemaining && safeRemaining > GPT_SAFE_THRESHOLD;
}

// ============================================================================
// MAIN ROUTING FUNCTION
// ============================================================================

/**
 * Resolve model for Pro plan message
 * Combines intent classification, GPT cap check, estimation, and fallback logic
 * 
 * @param message - User's message
 * @param options - Routing options (gptTokensUsed, region, etc.)
 * @returns ProRoutingResult with model, delta, and metadata
 * 
 * @example
 * const result = resolveProModel('Design a scalable architecture', {
 *   gptTokensUsed: 50000,
 *   region: 'IN',
 *   turnNumber: 1,
 *   userId: 'user_123',
 * });
 */
export function resolveProModel(
  message: string,
  options: ProRoutingOptions
): ProRoutingResult {
  const {
    gptTokensUsed,
    region,
    turnNumber = 1,
    sessionIntent,
    sessionIntentLocked = false,
    userId,
  } = options;

  // Calculate GPT cap and remaining
  const gptCapLimit = GPT_MONTHLY_CAPS[region];
  const gptTokensRemaining = Math.max(0, gptCapLimit - gptTokensUsed);
  const gptCapReached = gptTokensRemaining < GPT_SAFE_THRESHOLD;

  // Generate deterministic routing hash
// Generate deterministic routing hash
const routingHash = generateRoutingHash(message, userId);

// Classify intent (with session hysteresis support)
const intentResult = classifyProIntent(message, {
  gptRemainingTokens: gptTokensRemaining,
  sessionIntent,
  sessionIntentLocked,
});

const { intent, allowGPT, metadata: intentMetadata } = intentResult;

// Intent-aware GPT token estimation
const estimatedTokens = estimateGPTTokens(message, intent);

  // Determine if this is a follow-up turn
  const isFollowUp = turnNumber > 1 && sessionIntentLocked;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GPT PRE-CHECK: Estimate tokens before routing
  // Prevents accidental cap breach mid-call
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const gptCanHandle = canGPTHandleRequest(estimatedTokens, gptTokensRemaining);

  // Select model based on intent, caps, and estimation
  const { model, fallbackApplied, fallbackReason } = selectModel(
    intent,
    allowGPT,
    gptCapReached,
    gptCanHandle,
    gptTokensRemaining,
    intentMetadata.softGPTEscalation,
    routingHash
  );

  // Get delta prompt (with follow-up compression if applicable)
  const deltaPrompt = getProDelta(intent, message);

  return {
    model,
    modelDisplayName: MODEL_DISPLAY_NAMES[model] || model,
    intent,
    deltaPrompt,
    gptAllowed: allowGPT && !gptCapReached && gptCanHandle,
    gptCapReached,
    isFollowUp,
    estimatedTokens,
    metadata: {
      gptTokensUsed,
      gptTokensRemaining,
      gptCapLimit,
      softGPTEscalationTriggered: intentMetadata.softGPTEscalation,
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
  intent: ProIntentType,
  allowGPT: boolean,
  gptCapReached: boolean,
  gptCanHandle: boolean,
  gptTokensRemaining: number,
  softEscalation: boolean,
  routingHash: number
): { model: string; fallbackApplied: boolean; fallbackReason: string | null } {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EVERYDAY → Flash / Kimi (NO GPT ever)
  // Hash-based 60:40 distribution
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'EVERYDAY') {
    const model = selectModelByHash(routingHash, [
      { model: MODELS.GEMINI_FLASH, threshold: 60 }, // 0-59 = Flash (60%)
      { model: MODELS.KIMI_K2, threshold: 100 },     // 60-99 = Kimi (40%)
    ]);
    return { model, fallbackApplied: false, fallbackReason: null };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROFESSIONAL → Kimi / Gemini Pro (rare GPT soft escalation)
  // Hash-based 50:50 distribution
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'PROFESSIONAL') {
    // Soft escalation: High-stakes professional → GPT
    if (softEscalation && allowGPT && !gptCapReached && gptCanHandle) {
      return { model: MODELS.GPT_51, fallbackApplied: false, fallbackReason: null };
    }

    // Smart fallback based on remaining budget
    // More tokens remaining → Gemini Pro (better quality)
    // Less tokens remaining → Kimi (cheaper, save budget)
    if (gptTokensRemaining > PROFESSIONAL_FALLBACK_THRESHOLD) {
      const model = selectModelByHash(routingHash, [
        { model: MODELS.KIMI_K2, threshold: 50 },     // 0-49 = Kimi (50%)
        { model: MODELS.GEMINI_PRO, threshold: 100 }, // 50-99 = Gemini Pro (50%)
      ]);
      return { model, fallbackApplied: false, fallbackReason: null };
    } else {
      // Budget pressure → prefer Kimi (70:30)
      const model = selectModelByHash(routingHash, [
        { model: MODELS.KIMI_K2, threshold: 70 },     // 0-69 = Kimi (70%)
        { model: MODELS.GEMINI_PRO, threshold: 100 }, // 70-99 = Gemini Pro (30%)
      ]);
      return { model, fallbackApplied: false, fallbackReason: null };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXPERT → GPT-5.1 (with cap + estimation protection)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'EXPERT') {
    // GPT allowed, cap not reached, AND can handle this request
    if (allowGPT && !gptCapReached && gptCanHandle) {
      return { model: MODELS.GPT_51, fallbackApplied: false, fallbackReason: null };
    }

    // Fallback: GPT unavailable → Gemini Pro
    let fallbackReason = 'unknown';
    if (gptCapReached) {
      fallbackReason = 'gpt_cap_reached';
    } else if (!gptCanHandle) {
      fallbackReason = 'gpt_estimation_exceeded';
    } else if (!allowGPT) {
      fallbackReason = 'gpt_not_allowed';
    }

    return { 
      model: MODELS.GEMINI_PRO, 
      fallbackApplied: true, 
      fallbackReason 
    };
  }

  // Default fallback (shouldn't reach here)
  return { model: MODELS.GEMINI_FLASH, fallbackApplied: false, fallbackReason: null };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if GPT is available for this user/region
 * @param gptTokensUsed - Tokens used this month
 * @param region - User's region
 * @returns Whether GPT is still available
 */
export function isGPTAvailable(gptTokensUsed: number, region: Region): boolean {
  const cap = GPT_MONTHLY_CAPS[region];
  const remaining = cap - gptTokensUsed;
  return remaining >= GPT_SAFE_THRESHOLD;
}

/**
 * Get GPT usage stats for user
 * @param gptTokensUsed - Tokens used this month
 * @param region - User's region
 * @returns Usage statistics
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
    isNearCap: remaining < 50000, // Warning at 50K remaining
    isCapReached: remaining < GPT_SAFE_THRESHOLD,
  };
}

/**
 * Get fallback model for when GPT is unavailable
 * @param intent - Current intent
 * @returns Fallback model ID
 */
export function getFallbackModel(intent: ProIntentType): string {
  switch (intent) {
    case 'EXPERT':
      return MODELS.GEMINI_PRO; // Best fallback for expert
    case 'PROFESSIONAL':
      return MODELS.KIMI_K2; // Good for professional
    case 'EVERYDAY':
    default:
      return MODELS.GEMINI_FLASH; // Fast for everyday
  }
}

/**
 * Get model cost per 1M tokens (for analytics)
 * @param model - Model ID
 * @returns Cost in INR
 */
export function getModelCostPer1M(model: string): number {
  const costs: Record<string, number> = {
    [MODELS.GPT_51]: 850,        // ₹850 per 1M
    [MODELS.GEMINI_PRO]: 180,    // ₹180 per 1M
    [MODELS.GEMINI_FLASH]: 25,   // ₹25 per 1M
    [MODELS.KIMI_K2]: 65,        // ₹65 per 1M
  };

  return costs[model] || 100;
}

/**
 * Estimate cost for this specific call (for future analytics)
 * @param model - Model ID
 * @param estimatedTokens - Estimated tokens
 * @returns Estimated cost in INR
 */
export function estimateCallCost(model: string, estimatedTokens: number): number {
  const costPer1M = getModelCostPer1M(model);
  return (estimatedTokens / 1000000) * costPer1M;
}

// ============================================================================
// PRO HANDLER (Combined convenience function)
// ============================================================================

/**
 * Handle Pro message - combines classification, routing, and delta
 * This is the main entry point for Pro plan message handling
 * 
 * @param message - User's message
 * @param options - Routing options
 * @returns Complete routing result
 * 
 * @example
 * const result = handleProMessage(message, {
 *   gptTokensUsed: user.gptTokensUsed,
 *   region: user.region,
 *   turnNumber: chat.turnNumber,
 *   sessionIntent: chat.lockedIntent,
 *   sessionIntentLocked: chat.intentLocked,
 *   userId: user.id,
 * });
 * 
 * // Use result
 * const response = await callModel(result.model, {
 *   systemPrompt: corePrompt + result.deltaPrompt,
 *   message,
 * });
 */
export function handleProMessage(
  message: string,
  options: ProRoutingOptions
): ProRoutingResult {
  return resolveProModel(message, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default handleProMessage;

// ============================================================================
// ⚠️ FROZEN FILE NOTICE
// ============================================================================
// This file is FROZEN after v1.1
// 
// DO NOT:
// - Add more conditions
// - Add more intent levels
// - Add more randomness
// - Change hash algorithm
//
// This file is:
// - Predictable (hash-based routing)
// - Auditable (fallback reasons logged)
// - Scale-safe (GPT pre-estimation)
//
// Any changes require review and testing.
// ============================================================================