// src/core/ai/prompts/starter-delta.ts
// ============================================================================
// SORIVA STARTER DELTA PROMPTS v1.0 - January 2026
// ============================================================================
// Purpose: Behaviour control for Starter (free) plan responses
// NOT for routing - only controls response length and depth
//
// Delta Prompts:
// - EVERYDAY: Brief, direct (5-6 lines max)
// - LEARNING: High-level explanation only (no step-by-step)
// - HEAVY: Short overview + soft upgrade mention
//
// Business Logic:
// - Control token burn on free tier
// - Create clear value gap (Starter vs Plus/Pro)
// - Polite, encouraging tone (not blocking)
//
// Token Cost: ~15-25 tokens per delta
// ============================================================================

import { StarterIntent } from './starter-intent-guard';

// ============================================================================
// DELTA PROMPTS
// ============================================================================

/**
 * EVERYDAY Delta (Default)
 * Quick, casual queries → Brief responses
 * Target: 5-6 lines max
 */
const STARTER_EVERYDAY = `Respond briefly and directly.
Avoid long explanations unless asked.
Keep it under 5-6 lines.
Be friendly and helpful.`;

/**
 * LEARNING Delta
 * Educational queries → High-level only
 * No step-by-step, no exam solutions
 */
const STARTER_LEARNING = `Explain the concept at a high level.
Do not provide step-by-step solutions.
Focus on understanding, not exam answers.
Keep it concise - max 8-10 lines.
Be encouraging about learning.`;

/**
 * HEAVY Delta
 * Complex requests → Limited response + soft nudge
 * User should upgrade for full answers
 */
const STARTER_HEAVY = `Provide a short overview only (4-5 lines max).
Do not give full solutions or deep analysis.
At the end, mention: "For detailed help, Soriva Plus has you covered!"
Be polite and encouraging, not restrictive.`;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Get delta prompt for Starter plan based on intent
 * @param intent - Classified intent type
 * @returns Delta prompt string
 *
 * @example
 * const delta = getStarterDelta('HEAVY');
 * // Returns limited response prompt with upgrade nudge
 */
export function getStarterDelta(intent: StarterIntent): string {
  switch (intent) {
    case 'HEAVY':
      return STARTER_HEAVY;
    case 'LEARNING':
      return STARTER_LEARNING;
    case 'EVERYDAY':
    default:
      return STARTER_EVERYDAY;
  }
}

// ============================================================================
// TOKEN ESTIMATES
// ============================================================================

/**
 * Get token estimate for delta prompt
 * @param intent - Intent type
 * @returns Estimated token count
 */
export function getStarterDeltaTokenEstimate(intent: StarterIntent): number {
  const estimates: Record<StarterIntent, number> = {
    EVERYDAY: 20,
    LEARNING: 25,
    HEAVY: 30,
  };

  return estimates[intent] || 20;
}

// ============================================================================
// RESPONSE LENGTH GUIDELINES
// ============================================================================

/**
 * Get max response lines for intent
 * Used for response validation/truncation if needed
 */
export function getMaxResponseLines(intent: StarterIntent): number {
  switch (intent) {
    case 'HEAVY':
      return 5;
    case 'LEARNING':
      return 10;
    case 'EVERYDAY':
    default:
      return 6;
  }
}

/**
 * Get max response tokens for intent
 * Used for model max_tokens parameter
 */
export function getMaxResponseTokens(intent: StarterIntent): number {
  switch (intent) {
    case 'HEAVY':
      return 150;    // ~5 lines
    case 'LEARNING':
      return 300;    // ~10 lines
    case 'EVERYDAY':
    default:
      return 200;    // ~6 lines
  }
}

// ============================================================================
// UPGRADE NUDGE MESSAGES (In-response)
// ============================================================================

/**
 * Soft upgrade nudge messages for different contexts
 * Used when shouldNudgeUpgrade is true
 */
export const UPGRADE_NUDGES = {
  // For HEAVY intent responses
  heavy: "For detailed help, Soriva Plus has you covered!",
  
  // For session limit (10+ messages)
  session: "Enjoying our chat? Soriva Plus gives you unlimited conversations!",
  
  // For code requests
  code: "Need complete code solutions? Try Soriva Plus!",
  
  // For exam/study requests
  study: "For step-by-step solutions, Soriva Plus is perfect for students!",
  
  // Generic
  generic: "Want more? Upgrade to Soriva Plus for detailed answers!",
};

/**
 * Get appropriate nudge message based on context
 */
export function getUpgradeNudge(
  intent: StarterIntent,
  nudgeReason?: string
): string | null {
  if (intent !== 'HEAVY' && !nudgeReason) {
    return null; // No nudge needed
  }

  if (nudgeReason === 'heavy_session_usage') {
    return UPGRADE_NUDGES.session;
  }

  if (intent === 'HEAVY') {
    return UPGRADE_NUDGES.heavy;
  }

  return UPGRADE_NUDGES.generic;
}

// ============================================================================
// ALL DELTAS (For debugging/admin)
// ============================================================================

/**
 * Get all delta prompts
 */
export function getAllStarterDeltas(): Record<StarterIntent, string> {
  return {
    EVERYDAY: STARTER_EVERYDAY,
    LEARNING: STARTER_LEARNING,
    HEAVY: STARTER_HEAVY,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  STARTER_EVERYDAY,
  STARTER_LEARNING,
  STARTER_HEAVY,
};

export default getStarterDelta;