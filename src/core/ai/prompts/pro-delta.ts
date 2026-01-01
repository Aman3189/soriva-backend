// src/core/ai/prompts/pro-delta.ts
// ============================================================================
// SORIVA PRO DELTA PROMPTS v1.1 - January 2026
// ============================================================================
// Purpose: Intent-specific delta prompts for Pro plan
// Usage: Injected after core prompt based on classified intent
//
// Delta Prompts:
// - EVERYDAY: Ultra-light, direct (Flash doesn't need philosophy)
// - PROFESSIONAL: Structured, options-focused, practical
// - EXPERT: Deep analysis, trade-offs, comprehensive
// - EXPERT_FOLLOWUP: Compressed for subsequent turns (30% token saving)
//
// v1.1 Updates:
// - EXPERT_DELTA_FOLLOWUP for multi-turn conversations
// - EXTENDED deltas now APPEND to base (guardrails preserved)
// - Ultra-light EVERYDAY delta (~10 tokens)
//
// Token Cost: ~10-55 tokens per delta (very efficient)
// ============================================================================

import { ProIntentType } from './pro-intent-classifier';

// ============================================================================
// DELTA PROMPTS
// ============================================================================

/**
 * EVERYDAY Delta Prompt (Ultra-light)
 * For quick tasks, simple queries, casual interactions
 * Model: Flash / Kimi (NO GPT)
 * 
 * Flash doesn't need philosophy - just answer!
 */
const EVERYDAY_DELTA = `Answer directly and concisely.`;

/**
 * PROFESSIONAL Delta Prompt
 * For business decisions, planning, structured thinking
 * Model: Kimi K2 / Gemini Pro (rare GPT escalation)
 */
const PROFESSIONAL_DELTA = `This is a professional decision-oriented query.
Offer clear options and reasoning.
Focus on practicality and actionable insights.
Structure your response for easy decision-making.`;

/**
 * EXPERT Delta Prompt (First turn)
 * For complex analysis, deep thinking, high-stakes decisions
 * Model: GPT-5.1 (with cap)
 */
const EXPERT_DELTA = `This is a high-stakes professional query requiring deep analysis.
Analyze trade-offs, risks, and long-term impact.
Consider edge cases and potential pitfalls.
Avoid generic advice - be precise and specific.
Structure your response with clear reasoning.
Challenge assumptions where appropriate.
Provide actionable recommendations with rationale.`;

/**
 * EXPERT Delta Prompt (Follow-up turns)
 * For subsequent turns in an expert conversation
 * 30% token saving, sharper responses
 */
const EXPERT_DELTA_FOLLOWUP = `Continue the analysis.
Focus only on new information or questions.
Avoid repeating earlier reasoning unless necessary.`;

/**
 * EXPERT with GPT Cap Reached Delta
 * When GPT tokens exhausted but expert query detected
 * Graceful fallback without compromising quality perception
 */
const EXPERT_FALLBACK_DELTA = `This is a complex professional query.
Provide thorough analysis within practical bounds.
Focus on the most critical factors.
Highlight key trade-offs and recommendations.`;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Get delta prompt for Pro plan based on intent
 * @param intent - Classified intent type
 * @param options - Optional configuration
 * @returns Delta prompt string
 *
 * @example
 * const delta = getProDelta('EXPERT');
 * // Returns deep analysis prompt (first turn)
 *
 * const delta = getProDelta('EXPERT', { isFollowUp: true });
 * // Returns compressed followup prompt
 *
 * const delta = getProDelta('EXPERT', { gptCapReached: true });
 * // Returns fallback prompt
 */
export function getProDelta(
  intent: ProIntentType,
  options?: {
    isFollowUp?: boolean;
    gptCapReached?: boolean;
  }
): string {
  const { isFollowUp = false, gptCapReached = false } = options || {};

  switch (intent) {
    case 'EXPERT':
      // GPT cap reached → fallback
      if (gptCapReached) {
        return EXPERT_FALLBACK_DELTA;
      }
      // Follow-up turn → compressed delta
      if (isFollowUp) {
        return EXPERT_DELTA_FOLLOWUP;
      }
      // First turn → full delta
      return EXPERT_DELTA;

    case 'PROFESSIONAL':
      return PROFESSIONAL_DELTA;

    case 'EVERYDAY':
    default:
      return EVERYDAY_DELTA;
  }
}

// ============================================================================
// EXTENDED DELTA PROMPTS (Context-specific enhancements)
// ============================================================================

/**
 * Extended delta prompts for specific sub-contexts
 * These APPEND to base delta, not replace
 */
export const EXTENDED_DELTAS = {
  // PROFESSIONAL sub-types (append to PROFESSIONAL_DELTA)
  PROFESSIONAL_STRATEGY: `Consider market dynamics and competitive positioning.
Offer phased recommendations with clear milestones.`,

  PROFESSIONAL_TECHNICAL: `Balance technical depth with business practicality.
Highlight implementation considerations.`,

  PROFESSIONAL_CREATIVE: `Offer multiple creative directions with rationale.
Balance innovation with feasibility.`,

  // EXPERT sub-types (append to EXPERT_DELTA)
  EXPERT_ARCHITECTURE: `Analyze scalability, maintainability, and performance.
Consider failure modes and recovery strategies.
Highlight critical decision points and their implications.`,

  EXPERT_FINANCIAL: `Provide detailed quantitative analysis where possible.
Consider risk factors and sensitivity analysis.
Offer scenario-based recommendations.`,

  EXPERT_LEGAL: `Highlight potential compliance considerations.
Note where professional legal advice is recommended.
Focus on risk awareness without providing legal advice.`,
};

// ============================================================================
// CONTEXT-AWARE DELTA FUNCTION
// ============================================================================

/**
 * Get delta prompt with optional context enhancement
 * Context APPENDS to base delta (guardrails preserved)
 * 
 * @param intent - Classified intent type
 * @param context - Optional context for sub-type selection
 * @param options - Additional options (isFollowUp, gptCapReached)
 * @returns Enhanced delta prompt
 * 
 * @example
 * getProDeltaWithContext('EXPERT', { isArchitecture: true })
 * // Returns: EXPERT_DELTA + "\n" + EXPERT_ARCHITECTURE
 */
export function getProDeltaWithContext(
  intent: ProIntentType,
  context?: {
    isArchitecture?: boolean;
    isFinancial?: boolean;
    isLegal?: boolean;
    isStrategy?: boolean;
    isTechnical?: boolean;
    isCreative?: boolean;
  },
  options?: {
    isFollowUp?: boolean;
    gptCapReached?: boolean;
  }
): string {
  // Get base delta
  let delta = getProDelta(intent, options);

  // Skip context enhancement for EVERYDAY (keep it ultra-light)
  if (intent === 'EVERYDAY' || !context) {
    return delta;
  }

  // Skip context enhancement for follow-up turns (keep it compressed)
  if (options?.isFollowUp) {
    return delta;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // APPEND context-specific enhancement (not replace!)
  // This preserves base guardrails while adding flavor
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'EXPERT') {
    if (context.isArchitecture) {
      delta = `${delta}\n${EXTENDED_DELTAS.EXPERT_ARCHITECTURE}`;
    } else if (context.isFinancial) {
      delta = `${delta}\n${EXTENDED_DELTAS.EXPERT_FINANCIAL}`;
    } else if (context.isLegal) {
      delta = `${delta}\n${EXTENDED_DELTAS.EXPERT_LEGAL}`;
    }
  } else if (intent === 'PROFESSIONAL') {
    if (context.isStrategy) {
      delta = `${delta}\n${EXTENDED_DELTAS.PROFESSIONAL_STRATEGY}`;
    } else if (context.isTechnical) {
      delta = `${delta}\n${EXTENDED_DELTAS.PROFESSIONAL_TECHNICAL}`;
    } else if (context.isCreative) {
      delta = `${delta}\n${EXTENDED_DELTAS.PROFESSIONAL_CREATIVE}`;
    }
  }

  return delta;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get token estimate for delta prompt
 * @param intent - Intent type
 * @param isFollowUp - Whether this is a follow-up turn
 * @returns Estimated token count
 */
export function getDeltaTokenEstimate(
  intent: ProIntentType,
  isFollowUp: boolean = false
): number {
  if (intent === 'EXPERT' && isFollowUp) {
    return 20; // EXPERT_DELTA_FOLLOWUP
  }

  const estimates: Record<ProIntentType, number> = {
    EVERYDAY: 10,      // Ultra-light
    PROFESSIONAL: 35,
    EXPERT: 55,
  };

  return estimates[intent] || 25;
}

/**
 * Get all delta prompts (for debugging/admin)
 */
export function getAllDeltas(): Record<string, string> {
  return {
    EVERYDAY: EVERYDAY_DELTA,
    PROFESSIONAL: PROFESSIONAL_DELTA,
    EXPERT: EXPERT_DELTA,
    EXPERT_FOLLOWUP: EXPERT_DELTA_FOLLOWUP,
    EXPERT_FALLBACK: EXPERT_FALLBACK_DELTA,
  };
}

/**
 * Check if intent should use followup delta
 * @param turnNumber - Current turn number in conversation
 * @param intentLocked - Whether intent is locked in session
 * @returns Whether to use followup delta
 */
export function shouldUseFollowUpDelta(
  turnNumber: number,
  intentLocked: boolean
): boolean {
  // Use followup delta if:
  // - Not first turn (turnNumber > 1)
  // - AND intent is locked (conversation is coherent)
  return turnNumber > 1 && intentLocked;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  EVERYDAY_DELTA,
  PROFESSIONAL_DELTA,
  EXPERT_DELTA,
  EXPERT_DELTA_FOLLOWUP,
  EXPERT_FALLBACK_DELTA,
};

export default getProDelta;