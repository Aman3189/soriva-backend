// src/core/ai/prompts/starter-intent-guard.ts
// ============================================================================
// SORIVA STARTER GUARD v3.0 — Ultra Lightweight
// ============================================================================
// Purpose: 
// 1. Detect LEARNING vs NORMAL intent (for LLM bias)
// 2. Detect NUDGE type (for UI prompts)
// Token Cost: 0 (pure regex)
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type Intent = 'LEARNING' | 'NORMAL';
export type NudgeType = 'SIMPLIFY' | 'DECIDE' | 'ACTION' | null;

export interface GuardResult {
  intent: Intent;
  nudgeType: NudgeType;
}

// ============================================================================
// PATTERNS — Minimal regex
// ============================================================================

// Intent patterns
const LEARNING_PATTERN = /explain|samjhao|samajhna|what is|how does|why is|concept|theory|learn|teach|basics|fundamentals|exam|syllabus|formula|definition/i;

// Nudge patterns
const SIMPLIFY_PATTERN = /confused|confusing|overwhelming|complicated|dont understand|don't understand|not sure|lost|stuck|samajh nahi|clear nahi/i;

const DECIDE_PATTERN = /should i|which one|recommend|choose between|decide|better option|what do you think|kya karu|konsa|sahi rahega/i;

const ACTION_PATTERN = /how do i|how to|next step|where do i start|get started|first step|kaise karu|shuru karu|steps batao/i;

// ============================================================================
// CLASSIFIER FUNCTIONS
// ============================================================================

/**
 * Classify intent
 */
export function classifyIntent(message: string): Intent {
  return LEARNING_PATTERN.test(message) ? 'LEARNING' : 'NORMAL';
}

/**
 * Detect nudge type
 */
export function detectNudge(message: string): NudgeType {
  if (DECIDE_PATTERN.test(message)) return 'DECIDE';
  if (ACTION_PATTERN.test(message)) return 'ACTION';
  if (SIMPLIFY_PATTERN.test(message)) return 'SIMPLIFY';
  return null;
}


/**
 * Full classification
 */
export function classifyMessage(message: string): GuardResult {
  return {
    intent: classifyIntent(message),
    nudgeType: detectNudge(message),
  };
}

// ============================================================================
// BIAS & NUDGE TEXT
// ============================================================================

/**
 * Get LLM bias instruction
 */
export function getIntentBias(intent: Intent): string {
  return intent === 'LEARNING' 
    ? 'Guide step-by-step. Build understanding before answers.' 
    : '';
}

/**
 * Get nudge text for UI
 */
export function getNudgeText(nudgeType: NudgeType): string {
  switch (nudgeType) {
    case 'DECIDE': return 'Want me to help you decide?';
    case 'ACTION': return 'Want clear next steps?';
    case 'SIMPLIFY': return 'Want this explained more simply?';
    default: return '';
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick check: is learning query?
 */
export function isLearningQuery(message: string): boolean {
  return classifyIntent(message) === 'LEARNING';
}

/**
 * Quick check: should show nudge?
 */
export function shouldShowNudge(message: string): boolean {
  return detectNudge(message) !== null;
}

/**
 * Get everything in one call
 */
export function getMessageContext(message: string): {
  intent: Intent;
  bias: string;
  nudgeType: NudgeType;
  nudgeText: string;
} {
  const intent = classifyIntent(message);
  const nudgeType = detectNudge(message);
  
  return {
    intent,
    bias: getIntentBias(intent),
    nudgeType,
    nudgeText: getNudgeText(nudgeType),
  };
}

export default classifyMessage;