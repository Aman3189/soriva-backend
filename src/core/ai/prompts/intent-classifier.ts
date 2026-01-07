// src/core/ai/prompts/intent-classifier.ts
// ============================================================================
// SORIVA INTENT CLASSIFIER v2.0 — Ultra Lightweight
// ============================================================================
// Purpose: Detect LEARNING vs NORMAL intent (STARTER/PLUS plans only)
// PRO/APEX use their own classifiers in delta files
// Token Cost: ~10 tokens max
// ============================================================================

export type Intent = 'LEARNING' | 'NORMAL';

// ============================================================================
// LEARNING PATTERNS — Strong signals only
// ============================================================================

const LEARNING_PATTERNS = [
  /explain|samjhao|samajhna|samjha|what is|how does|why is|concept|theory/i,
  /exam|syllabus|formula|derive|proof|definition|chapter|lesson/i,
  /learn|teach|padhai|study|understand|basics|fundamentals/i,
];

// ============================================================================
// CLASSIFIER — Simple & Fast
// ============================================================================

/**
 * Classify message intent
 * @param message - User message
 * @returns 'LEARNING' or 'NORMAL'
 */
export function classifyIntent(message: string): Intent {
  return LEARNING_PATTERNS.some(p => p.test(message)) ? 'LEARNING' : 'NORMAL';
}

// ============================================================================
// BIAS INJECTION — One line only
// ============================================================================

/**
 * Get intent bias for system prompt
 * @param intent - Classified intent
 * @returns Bias instruction or empty string
 */
export function getIntentBias(intent: Intent): string {
  return intent === 'LEARNING' 
    ? 'Guide step-by-step. Build understanding before giving answers.' 
    : '';
}

// ============================================================================
// CONVENIENCE FUNCTION
// ============================================================================

/**
 * Classify and get bias in one call
 * @param message - User message
 * @returns Bias string (empty if NORMAL)
 */
export function getMessageBias(message: string): string {
  return getIntentBias(classifyIntent(message));
}

export default classifyIntent;