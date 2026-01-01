// src/core/ai/prompts/starter-intent-guard.ts
// ============================================================================
// SORIVA STARTER INTENT GUARD v1.0 - January 2026
// ============================================================================
// Purpose: Behaviour control for Starter (free) plan
// NOT for routing or model selection - only response behaviour limiting
//
// Intent Types:
// - EVERYDAY: Quick, casual queries → Brief responses
// - LEARNING: Educational queries → High-level explanation only
// - HEAVY: Complex/exam queries → Limited response + upgrade nudge
//
// Business Logic:
// - Control token burn on free tier
// - Create clear value gap (Starter vs Plus/Pro)
// - Natural upgrade conversion through soft nudges
//
// Token Cost: 0 (pure keyword matching)
// CPU Cost: ~0ms (ultra-light)
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type StarterIntent = 'EVERYDAY' | 'LEARNING' | 'HEAVY';

export interface StarterIntentResult {
  intent: StarterIntent;
  confidence: number;
  shouldNudgeUpgrade: boolean;
  nudgeReason?: string;
  metadata: {
    heavyScore: number;
    learningScore: number;
    messageLength: number;
    processingTimeMs: number;
  };
}

// ============================================================================
// KEYWORD DEFINITIONS
// ============================================================================

/**
 * HEAVY intent keywords
 * These indicate complex queries that should be limited on Starter
 * User should upgrade for full answers
 */
const HEAVY_KEYWORDS = [
  // Deep analysis requests
  'step by step',
  'step-by-step',
  'in detail',
  'detailed explanation',
  'deep analysis',
  'complete explanation',
  'full explanation',
  'explain everything',
  'explain in depth',
  
  // Academic/exam abuse signals
  'all formulas',
  'full derivation',
  'prove that',
  'prove this',
  'solve this',
  'solve completely',
  'complete solution',
  'full solution',
  
  // Professional requests
  'case study',
  'architecture',
  'system design',
  'business plan',
  'business model',
  'market analysis',
  'competitive analysis',
  
  // Code requests (potential abuse)
  'write code',
  'full code',
  'complete code',
  'debug this',
  'fix this code',
  'entire program',
  'working code',
  
  // Long-form content
  'write an essay',
  'write a report',
  'comprehensive',
  'exhaustive',
  'thorough analysis',
];

/**
 * LEARNING intent keywords
 * Educational queries - give high-level explanation only
 */
const LEARNING_KEYWORDS = [
  'what is',
  'what are',
  'explain',
  'how does',
  'how do',
  'define',
  'meaning of',
  'concept of',
  'why does',
  'why do',
  'difference between',
  'compare',
  'tell me about',
  'help me understand',
  'can you explain',
];

/**
 * Length thresholds
 */
const LENGTH_THRESHOLDS = {
  LONG_MESSAGE: 250,      // Characters - adds to heavy score
  VERY_LONG_MESSAGE: 400, // Characters - strong heavy signal
};

/**
 * Score thresholds
 */
const SCORE_THRESHOLDS = {
  HEAVY_MIN: 3,           // Minimum score to classify as HEAVY
  LEARNING_MIN: 1,        // Minimum score to classify as LEARNING
};

// ============================================================================
// MAIN CLASSIFIER
// ============================================================================

/**
 * Classify Starter plan message intent
 * Ultra-light, 0 LLM tokens, ~0 CPU
 *
 * @param message - User's message
 * @param sessionMessageCount - Optional: messages sent in current session
 * @returns StarterIntentResult with intent and upgrade nudge flag
 *
 * @example
 * const result = classifyStarterIntent('Explain step by step how to solve quadratic equations');
 * // { intent: 'HEAVY', shouldNudgeUpgrade: true, confidence: 80 }
 */
export function classifyStarterIntent(
  message: string,
  sessionMessageCount?: number
): StarterIntentResult {
  const startTime = Date.now();
  const text = message.toLowerCase();
  const messageLength = message.length;

  let heavyScore = 0;
  let learningScore = 0;
  let nudgeReason: string | undefined;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEAVY KEYWORD DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of HEAVY_KEYWORDS) {
    if (text.includes(keyword)) {
      heavyScore += 2;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEARNING KEYWORD DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of LEARNING_KEYWORDS) {
    if (text.includes(keyword)) {
      learningScore += 1;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LENGTH-BASED SCORING
  // Long messages = more likely to be complex/heavy
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (messageLength > LENGTH_THRESHOLDS.VERY_LONG_MESSAGE) {
    heavyScore += 3;
    nudgeReason = 'complex_query';
  } else if (messageLength > LENGTH_THRESHOLDS.LONG_MESSAGE) {
    heavyScore += 2;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION COUNT CHECK
  // Heavy usage in single session = upgrade nudge
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let sessionNudge = false;
  if (sessionMessageCount !== undefined && sessionMessageCount > 10) {
    sessionNudge = true;
    nudgeReason = nudgeReason || 'heavy_session_usage';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTENT DETERMINATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const processingTime = Date.now() - startTime;

  // HEAVY intent
  if (heavyScore >= SCORE_THRESHOLDS.HEAVY_MIN) {
    return {
      intent: 'HEAVY',
      confidence: Math.min(80 + heavyScore * 2, 95),
      shouldNudgeUpgrade: true,
      nudgeReason: nudgeReason || 'complex_request',
      metadata: {
        heavyScore,
        learningScore,
        messageLength,
        processingTimeMs: processingTime,
      },
    };
  }

  // LEARNING intent
  if (learningScore >= SCORE_THRESHOLDS.LEARNING_MIN) {
    return {
      intent: 'LEARNING',
      confidence: Math.min(65 + learningScore * 5, 85),
      shouldNudgeUpgrade: sessionNudge,
      nudgeReason: sessionNudge ? nudgeReason : undefined,
      metadata: {
        heavyScore,
        learningScore,
        messageLength,
        processingTimeMs: processingTime,
      },
    };
  }

  // EVERYDAY intent (default)
  return {
    intent: 'EVERYDAY',
    confidence: 60,
    shouldNudgeUpgrade: sessionNudge,
    nudgeReason: sessionNudge ? nudgeReason : undefined,
    metadata: {
      heavyScore,
      learningScore,
      messageLength,
      processingTimeMs: processingTime,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick check if message is HEAVY (for fast decisions)
 */
export function isHeavyIntent(message: string): boolean {
  return classifyStarterIntent(message).intent === 'HEAVY';
}

/**
 * Quick check if upgrade should be nudged
 */
export function shouldNudgeUpgrade(
  message: string,
  sessionMessageCount?: number
): boolean {
  return classifyStarterIntent(message, sessionMessageCount).shouldNudgeUpgrade;
}

/**
 * Get upgrade nudge message based on reason
 */
export function getUpgradeNudgeMessage(nudgeReason?: string): string {
  switch (nudgeReason) {
    case 'complex_query':
      return 'For detailed explanations and step-by-step solutions, try Soriva Plus!';
    case 'complex_request':
      return 'Want comprehensive answers? Upgrade to Soriva Plus for full access!';
    case 'heavy_session_usage':
      return 'Enjoying Soriva? Get unlimited conversations with Soriva Plus!';
    default:
      return 'Unlock more with Soriva Plus - detailed answers, voice chat, and more!';
  }
}

/**
 * Get statistics (for debugging/admin)
 */
export function getStarterGuardStats(): {
  heavyKeywords: number;
  learningKeywords: number;
  thresholds: typeof SCORE_THRESHOLDS;
} {
  return {
    heavyKeywords: HEAVY_KEYWORDS.length,
    learningKeywords: LEARNING_KEYWORDS.length,
    thresholds: SCORE_THRESHOLDS,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default classifyStarterIntent;