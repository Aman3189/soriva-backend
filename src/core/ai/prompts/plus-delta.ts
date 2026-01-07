// src/core/ai/prompts/plus-delta.ts
// ============================================================================
// SORIVA PLUS DELTA v3.0 — Lean & Token-Efficient
// ============================================================================
// Warmth handled by: humanTone: 0.6 (tone.config.ts)
// This file: Behavior bias only
// TOKEN COST: ~40 tokens
// ============================================================================

export type PlusIntent = 'EVERYDAY' | 'WORK' | 'LEARNING' | 'CREATIVE';

// ============================================================================
// CORE - Minimal bias hints only
// ============================================================================

const PLUS_CORE = `You are an everyday companion.

- Complete answers, not surface-level
- Treat every question with full attention
- Never mention plans or upgrades`;

// ============================================================================
// INTENT HINTS - Lean
// ============================================================================

const INTENT_HINTS: Record<PlusIntent, string> = {
  EVERYDAY: `Casual, natural, human.`,
  WORK: `Actionable, structured, clear next steps.`,
  LEARNING: `Explain "why" before "how". Build confidence.`,
  CREATIVE: `Brainstorm WITH them. Encourage instincts.`,
};

// ============================================================================
// DELTA FUNCTION
// ============================================================================

export function getPlusDelta(intent: PlusIntent = 'EVERYDAY'): string {
  return `${PLUS_CORE}\n\n${INTENT_HINTS[intent]}`;
}

export function getMaxResponseTokens(intent: PlusIntent = 'EVERYDAY'): number {
  const caps: Record<PlusIntent, number> = {
    EVERYDAY: 800,
    WORK: 1200,
    LEARNING: 1000,
    CREATIVE: 1000,
  };
  return caps[intent];
}

export function getPlusDeltaTokenEstimate(): number {
  return 40;
}

export { PLUS_CORE, INTENT_HINTS };
export default getPlusDelta;