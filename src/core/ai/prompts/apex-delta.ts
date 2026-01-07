// src/core/ai/prompts/apex-delta.ts
// ============================================================================
// SORIVA APEX DELTA v3.0 — Ultimate Excellence
// ============================================================================
//
// 🎯 APEX = Best answer they've EVER received
// Warmth handled by: humanTone: 0.9 (tone.config.ts)
// This file: Excellence + Depth + No-limits mindset
//
// TOKEN COST: ~60 tokens
// ============================================================================

export type ApexIntent = 
  | 'QUICK'
  | 'ANALYTICAL'
  | 'STRATEGIC'
  | 'CREATIVE'
  | 'TECHNICAL'
  | 'LEARNING'
  | 'PERSONAL';

// ============================================================================
// CORE - Premium standard, minimal tokens
// ============================================================================

const APEX_CORE = `You are APEX - the ultimate thinking partner.

Standard:
- Every response = BEST they've ever received
- Never hold back, never dumb down
- Insightful, clear, memorable
- No limits, no upgrade mentions`;

// ============================================================================
// INTENT HINTS - Lean but powerful
// ============================================================================

const INTENT_DELTAS: Record<ApexIntent, string> = {
  QUICK: `Sharp, decisive, zero fluff. Respect their time.`,
  
  ANALYTICAL: `Full analytical power. Multiple angles. Surface non-obvious insights.`,
  
  STRATEGIC: `Think in years. Second-order effects. Decisions that really matter.`,
  
  CREATIVE: `Push boundaries. Surprise them. Multiple genuinely different directions.`,
  
  TECHNICAL: `Senior engineer level. Production-ready. Anticipate edge cases.`,
  
  LEARNING: `First principles. Analogies that illuminate. Build confidence.`,
  
  PERSONAL: `Full emotional intelligence. Listen between lines. Be the 2am friend.`,
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

export function getApexDelta(intent: ApexIntent = 'QUICK'): string {
  return `${APEX_CORE}\n\n${INTENT_DELTAS[intent]}`;
}

export function getMaxResponseTokens(intent: ApexIntent = 'QUICK'): number {
  const caps: Record<ApexIntent, number> = {
    QUICK: 600,
    ANALYTICAL: 2500,
    STRATEGIC: 2500,
    CREATIVE: 2000,
    TECHNICAL: 3000,
    LEARNING: 2000,
    PERSONAL: 1500,
  };
  return caps[intent];
}

export function getApexDeltaTokenEstimate(): number {
  return 60;
}

// ============================================================================
// INTENT CLASSIFIER - Lightweight regex
// ============================================================================

export function classifyApexIntent(message: string): ApexIntent {
  const msg = message.toLowerCase();
  const len = message.length;

  // Early exit: Short + no explanation = QUICK
  if (len < 50 && !/explain|why|how/.test(msg)) return 'QUICK';

  // Pattern matching (priority order)
  if (/feel|stressed|anxious|worried|relationship|life|career|should i|advice|struggling/.test(msg)) return 'PERSONAL';
  if (/code|api|database|error|bug|typescript|react|node|architecture|deploy|server/.test(msg)) return 'TECHNICAL';
  if (/creative|idea|brainstorm|design|brand|write|story|content|campaign/.test(msg)) return 'CREATIVE';
  if (/strategy|long-term|roadmap|growth|scale|market|competitive|investment/.test(msg)) return 'STRATEGIC';
  if (/analyze|evaluate|compare|trade-off|pros and cons|deep dive|thorough/.test(msg)) return 'ANALYTICAL';
  if (/explain|understand|learn|teach|what is|concept|basics|samjhao|batao/.test(msg)) return 'LEARNING';

  // Default: Long = ANALYTICAL, Short = QUICK
  return len > 100 ? 'ANALYTICAL' : 'QUICK';
}

// ============================================================================
// EXPORTS
// ============================================================================

export { APEX_CORE, INTENT_DELTAS };
export default getApexDelta;