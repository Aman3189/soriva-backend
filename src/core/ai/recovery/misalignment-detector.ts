// src/core/ai/recovery/misalignment-detector.ts
// ============================================================================
// SORIVA V2 - MISALIGNMENT DETECTOR v1.1 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Detect OBVIOUS user frustration when Soriva goes wrong direction
// PHILOSOPHY: Safety net, not primary brain. LLM handles nuance.
//
// KEY PRINCIPLES:
// - HIGH confidence patterns ONLY (no guessing)
// - Zero false positives > Maximum coverage
// - LLM is smart, trust it for subtle cases
// - This catches what LLM might miss in obvious cases
// - STATELESS: No cooldown logic here (handled by orchestrator)
//
// DETECTS:
// - "Maine ye pucha hi nahi" (not_asked)
// - "Why are you saying this?" (wrong_direction)
// - "Baar baar same baat" (repetition)
// - "Tum samajh nahi rahe" (meta_complaint)
// - "This is not helpful" (meta_complaint)
//
// DOES NOT DETECT (LLM handles):
// - Sarcasm (too context-dependent)
// - Subtle tone shifts (LLM reads better)
// - Ambiguous short responses (could be normal)
//
// TOKEN COST: 0 (pure code)
// FALSE POSITIVE RATE: <5% (only obvious patterns)
//
// CHANGELOG:
// v1.1 - Fixed confidence semantics (null when not detected)
//      - Added "this is not helpful" pattern
// v1.0 - Initial release
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface MisalignmentResult {
  detected: boolean;
  confidence: 'high' | null;  // HIGH when detected, NULL when not
  trigger: string | null;
  category: MisalignmentCategory | null;
}

export type MisalignmentCategory =
  | 'not_asked'         // "Maine ye pucha hi nahi"
  | 'wrong_direction'   // "Why are you saying this?"
  | 'repetition'        // "Baar baar same thing"
  | 'meta_complaint';   // "Tum samajh nahi rahe" / "This is not helpful"

// ============================================================================
// HIGH CONFIDENCE PATTERNS ONLY
// ============================================================================

/**
 * English patterns - EXPLICIT frustration only
 * Each pattern = User is CLEARLY frustrated, no ambiguity
 */
const ENGLISH_PATTERNS: { pattern: RegExp; category: MisalignmentCategory }[] = [
  // NOT ASKED - User explicitly says they didn't ask this
  { pattern: /i didn'?t ask (for |about )?(this|that)/i, category: 'not_asked' },
  { pattern: /that'?s not what i (asked|meant|said)/i, category: 'not_asked' },
  { pattern: /this (is|was) not my question/i, category: 'not_asked' },
  { pattern: /i never (asked|said|mentioned) (this|that)/i, category: 'not_asked' },
  { pattern: /not what i('m| am) (asking|looking for)/i, category: 'not_asked' },

  // WRONG DIRECTION - User explicitly says Soriva is off-track
  { pattern: /why are you (saying|telling me|talking about) this/i, category: 'wrong_direction' },
  { pattern: /you('re| are) (missing|not getting) (the |my )?point/i, category: 'wrong_direction' },
  { pattern: /that('s| is) (completely |totally )?off/i, category: 'wrong_direction' },
  { pattern: /you('ve| have) gone off( |-)track/i, category: 'wrong_direction' },

  // REPETITION - User explicitly complains about repetition
  { pattern: /you keep (saying|repeating|going back to)/i, category: 'repetition' },
  { pattern: /stop (repeating|saying) (the )?same/i, category: 'repetition' },
  { pattern: /how many times (do i|should i|must i)/i, category: 'repetition' },
  { pattern: /i('ve| have) already (said|told|mentioned)/i, category: 'repetition' },

  // META COMPLAINT - User explicitly questions Soriva's understanding
  { pattern: /are you (even )?listening/i, category: 'meta_complaint' },
  { pattern: /you('re| are) not (listening|understanding)/i, category: 'meta_complaint' },
  { pattern: /do you (even )?understand (what i|me)/i, category: 'meta_complaint' },
  { pattern: /this is not helpful/i, category: 'meta_complaint' },  // FIX #3: Universal negative phrase
];

/**
 * Hinglish patterns - EXPLICIT frustration only
 * Native Hindi speakers ke common phrases
 */
const HINGLISH_PATTERNS: { pattern: RegExp; category: MisalignmentCategory }[] = [
  // NOT ASKED
  { pattern: /maine (ye|yeh) (pucha|bola|kaha) (hi )?nahi/i, category: 'not_asked' },
  { pattern: /(ye|yeh) (maine )?nahi (pucha|manga|bola)/i, category: 'not_asked' },
  { pattern: /mera sawaal (ye|yeh) (tha )?nahi/i, category: 'not_asked' },
  { pattern: /maine kab (pucha|bola|kaha)/i, category: 'not_asked' },

  // WRONG DIRECTION
  { pattern: /(ye|yeh) kya bol rahe? ho/i, category: 'wrong_direction' },
  { pattern: /kahan (se |)le aaye (ye|yeh)/i, category: 'wrong_direction' },
  { pattern: /baat kahan se kahan/i, category: 'wrong_direction' },
  { pattern: /topic (se )?bhatak (gaye|rahe)/i, category: 'wrong_direction' },

  // REPETITION
  { pattern: /baar[- ]?baar (wahi|same|yehi)/i, category: 'repetition' },
  { pattern: /kitni baar (bolu|kahu|samjhau)/i, category: 'repetition' },
  { pattern: /phir se wahi (baat|cheez)/i, category: 'repetition' },
  { pattern: /wahi ghisa pita/i, category: 'repetition' },

  // META COMPLAINT
  { pattern: /tum (samajh|sun) (nahi |hi nahi )?rahe/i, category: 'meta_complaint' },
  { pattern: /sun (bhi )?rahe? ho (ya nahi)?/i, category: 'meta_complaint' },
  { pattern: /samajh (me |mein )?(nahi )?aa raha (kya|tumhe)?/i, category: 'meta_complaint' },
  { pattern: /helpful nahi hai/i, category: 'meta_complaint' },  // Hinglish version
];

/**
 * Combined patterns - All HIGH confidence
 */
const ALL_PATTERNS = [...ENGLISH_PATTERNS, ...HINGLISH_PATTERNS];

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Detect misalignment in user message
 * 
 * Only returns detected=true for HIGH confidence, OBVIOUS frustration.
 * Subtle cases → LLM handles naturally.
 * 
 * NOTE: This function is STATELESS. Cooldown/rate-limiting
 * should be handled by recovery-orchestrator.ts
 * 
 * @param userMessage - Current user message
 * @returns MisalignmentResult (detected only if HIGH confidence)
 * 
 * @example
 * // DETECTED (obvious)
 * detectMisalignment("Maine ye pucha hi nahi")
 * // { detected: true, confidence: 'high', category: 'not_asked', trigger: 'maine ye pucha hi nahi' }
 * 
 * @example
 * // NOT DETECTED (ambiguous - let LLM handle)
 * detectMisalignment("ok")
 * // { detected: false, confidence: null, trigger: null, category: null }
 */
export function detectMisalignment(userMessage: string): MisalignmentResult {
  const message = userMessage.toLowerCase().trim();

  // Check all HIGH confidence patterns
  for (const { pattern, category } of ALL_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      return {
        detected: true,
        confidence: 'high',
        trigger: match[0],
        category,
      };
    }
  }

  // No obvious misalignment detected
  // Confidence = null (semantically correct)
  // LLM will handle subtle cases naturally
  return {
    detected: false,
    confidence: null,
    trigger: null,
    category: null,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick boolean check - for simple conditionals
 * 
 * @example
 * if (isMisaligned(userMessage)) {
 *   // Trigger recovery flow (if cooldown allows)
 * }
 */
export function isMisaligned(userMessage: string): boolean {
  return detectMisalignment(userMessage).detected;
}

/**
 * Get category for targeted recovery response
 * Different categories may need different acknowledgement style
 * 
 * @example
 * const category = getMisalignmentCategory(message);
 * if (category === 'repetition') {
 *   // Use repetition-specific acknowledgement
 * }
 */
export function getMisalignmentCategory(userMessage: string): MisalignmentCategory | null {
  return detectMisalignment(userMessage).category;
}

/**
 * Get pattern stats for debugging/monitoring
 * Useful for admin dashboard or logs
 */
export function getDetectorStats(): {
  totalPatterns: number;
  englishPatterns: number;
  hinglishPatterns: number;
  categories: MisalignmentCategory[];
} {
  return {
    totalPatterns: ALL_PATTERNS.length,
    englishPatterns: ENGLISH_PATTERNS.length,
    hinglishPatterns: HINGLISH_PATTERNS.length,
    categories: ['not_asked', 'wrong_direction', 'repetition', 'meta_complaint'],
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default detectMisalignment;