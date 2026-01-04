// src/core/ai/recovery/promise-generator.ts
// ============================================================================
// SORIVA V2 - PROMISE GENERATOR v1.1 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Generate behavior commitments after recovery
// PHILOSOPHY: Promise BEHAVIOR, not correctness. Not state. Not emotion.
//
// KEY PRINCIPLES:
// - Promise what Soriva WILL DO, not that it WAS RIGHT
// - Promise BEHAVIOR, not emotional state
// - Short promises (1 line max)
// - Category-specific for precision
// - Builds future trust, not just present calm
// - No over-promising (realistic commitments only)
// - Concrete, verifiable commitments
//
// PROMISE STRUCTURE:
// ✅ "I'll [concrete action] going forward."
// ✅ "I won't [bad behavior] unless you ask."
// ❌ "I'm with you now." (state, not behavior)
// ❌ "I understand." (claim, not commitment)
//
// ⚠️ IMPORTANT: ORCHESTRATOR IS SOURCE OF TRUTH
// - This file provides promises
// - Friction detection here is HEURISTIC only
// - Orchestrator may OVERRIDE includePromise decision
// - Promise cooldown is handled by orchestrator, not here
//
// WHAT PROMISES DO:
// ✅ Commit to behavior change
// ✅ Set clear expectations
// ✅ Build trust for future
// ✅ Show self-awareness
//
// WHAT PROMISES DON'T DO:
// ❌ Claim correctness
// ❌ Explain why mistake happened
// ❌ Over-promise unrealistic things
// ❌ Sound robotic or scripted
// ❌ Multiple promises at once
// ❌ Express emotional state
//
// TOKEN COST: ~10-20 tokens per promise
//
// CHANGELOG:
// v1.1 - Fixed "I'm with you now" → behavioral promise
//      - Added orchestrator override documentation
//      - Clarified friction detection is heuristic
// v1.0 - Initial release
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

import { MisalignmentCategory } from './misalignment-detector';

export interface PromiseResult {
  promise: string;
  category: MisalignmentCategory;
  language: 'en' | 'hi';
  tokenEstimate: number;
  includePromise: boolean;    // HEURISTIC - orchestrator may override
}

// ============================================================================
// ENGLISH PROMISES
// ============================================================================

/**
 * NOT_ASKED promises
 * User said: "Maine ye pucha hi nahi" / "I didn't ask for this"
 * Promise: Stay on topic (BEHAVIORAL)
 */
const NOT_ASKED_PROMISES_EN = [
  "I'll stick to what you're actually asking.",
  "I'll stay focused on your question.",
  "I won't go off on tangents.",
];

/**
 * WRONG_DIRECTION promises
 * User said: "Why are you saying this?" / "You're missing the point"
 * Promise: Better understanding (BEHAVIORAL)
 */
const WRONG_DIRECTION_PROMISES_EN = [
  "I'll pay closer attention to what you mean.",
  "I won't assume — I'll follow your lead.",
  "I'll stick to your actual point.",
];

/**
 * REPETITION promises
 * User said: "Baar baar same baat" / "You keep repeating"
 * Promise: Move forward (BEHAVIORAL)
 */
const REPETITION_PROMISES_EN = [
  "I won't circle back to that.",
  "I'll keep moving forward.",
  "No more repeating — onward.",
];

/**
 * META_COMPLAINT promises
 * User said: "Tum samajh nahi rahe" / "Are you even listening?"
 * Promise: Actually respond to what they're saying (BEHAVIORAL)
 * 
 * ⚠️ FIX #1: Changed from "I'm with you now" (emotional state)
 *            to behavioral commitment
 */
const META_COMPLAINT_PROMISES_EN = [
  "I'll focus on what you're actually saying.",
  "I'll show I understand through my response.",
  "I'll respond directly to what you're saying.",  // FIX #1: Behavioral, not emotional
];

// ============================================================================
// HINGLISH PROMISES
// ============================================================================

/**
 * NOT_ASKED promises - Hinglish
 */
const NOT_ASKED_PROMISES_HI = [
  "Aapke sawaal pe hi rahunga.",
  "Topic se nahi bhatkunga.",
  "Jo pucha hai wohi answer karunga.",
];

/**
 * WRONG_DIRECTION promises - Hinglish
 */
const WRONG_DIRECTION_PROMISES_HI = [
  "Aapki baat dhyan se samjhunga.",
  "Assume nahi karunga — aap lead karo.",
  "Aapke point pe hi rahunga.",
];

/**
 * REPETITION promises - Hinglish
 */
const REPETITION_PROMISES_HI = [
  "Wapas nahi jaunga us point pe.",
  "Aage badhte hain ab.",
  "Repeat nahi karunga.",
];

/**
 * META_COMPLAINT promises - Hinglish
 * 
 * ⚠️ FIX #1: All behavioral, no emotional state
 */
const META_COMPLAINT_PROMISES_HI = [
  "Aapki baat pe seedha respond karunga.",  // FIX #1: Behavioral
  "Response se dikhaunga ki samjha.",
  "Jo bol rahe ho uspe focus karunga.",
];

// ============================================================================
// PROMISE MAPS
// ============================================================================

const PROMISES_EN: Record<MisalignmentCategory, string[]> = {
  not_asked: NOT_ASKED_PROMISES_EN,
  wrong_direction: WRONG_DIRECTION_PROMISES_EN,
  repetition: REPETITION_PROMISES_EN,
  meta_complaint: META_COMPLAINT_PROMISES_EN,
};

const PROMISES_HI: Record<MisalignmentCategory, string[]> = {
  not_asked: NOT_ASKED_PROMISES_HI,
  wrong_direction: WRONG_DIRECTION_PROMISES_HI,
  repetition: REPETITION_PROMISES_HI,
  meta_complaint: META_COMPLAINT_PROMISES_HI,
};

// ============================================================================
// DEFAULT PROMISES
// ============================================================================

const DEFAULT_PROMISE_EN = "I'll do better this time.";
const DEFAULT_PROMISE_HI = "Ab theek se karunga.";

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

/**
 * Check if text contains Hindi/Hinglish patterns
 */
function containsHindiPatterns(text: string): boolean {
  const hinglishPatterns = [
    /\b(kya|kyu|kyun|kaise|kaun|kab|kahan)\b/i,
    /\b(hai|hain|ho|tha|thi|the)\b/i,
    /\b(nahi|nhi|nahin)\b/i,
    /\b(maine|tumne|usne|humne)\b/i,
    /\b(acha|theek|thik|sahi)\b/i,
    /\b(bhai|yaar)\b/i,
    /\b(samajh|samjh|baat|cheez)\b/i,
    /\b(baar|wahi|phir)\b/i,
  ];
  return hinglishPatterns.some(pattern => pattern.test(text));
}

/**
 * Check if text is pure ASCII
 */
function isPureASCII(text: string): boolean {
  return /^[\x00-\x7F]*$/.test(text);
}

/**
 * Detect language
 */
function detectLanguage(text: string): 'en' | 'hi' {
  if (containsHindiPatterns(text) && !isPureASCII(text)) {
    return 'hi';
  }
  return 'en';
}

// ============================================================================
// HASH FUNCTION - Deterministic Selection
// ============================================================================

/**
 * Generate consistent hash from string
 */
function generateHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ============================================================================
// FRICTION LEVEL (HEURISTIC ONLY)
// ============================================================================

export type FrictionLevel = 'low' | 'medium' | 'high';

/**
 * Detect friction level from message
 * 
 * ⚠️ FIX #2: THIS IS HEURISTIC ONLY
 * - Friction is conversation-level, not promise-level
 * - Orchestrator is the source of truth
 * - Orchestrator may override includePromise decision
 * - Use this as a hint, not final decision
 * 
 * @param message - User message
 * @returns FrictionLevel (heuristic)
 */
function detectFrictionLevel(message: string): FrictionLevel {
  // NOTE: Friction detection is heuristic.
  // Orchestrator may override includePromise decision.
  // This exists for convenience when orchestrator doesn't provide friction level.
  
  const msg = message.toLowerCase();

  // High friction indicators
  const highFrictionPatterns = [
    /!{2,}/,
    /\?{2,}/,
    /kya (bakwas|faltu)/i,
    /what the/i,
    /are you (even|serious)/i,
    /baar[- ]?baar/i,
    /kitni baar/i,
  ];

  if (highFrictionPatterns.some(p => p.test(msg))) {
    return 'high';
  }

  // Low friction indicators
  const lowFrictionPatterns = [
    /^(no|nope|nahi),?\s/i,
    /not (quite|exactly)/i,
    /that'?s not quite/i,
    /i meant/i,
    /actually,?\s/i,
  ];

  if (lowFrictionPatterns.some(p => p.test(msg))) {
    return 'low';
  }

  return 'medium';
}

/**
 * Should promise be included? (HEURISTIC)
 * 
 * ⚠️ ORCHESTRATOR MAY OVERRIDE THIS DECISION
 * 
 * Reasons orchestrator might override:
 * - Promise was given recently (cooldown active)
 * - Conversation context suggests otherwise
 * - User explicitly asked for no promises
 * 
 * @param frictionLevel - Detected or provided friction level
 * @returns boolean (heuristic recommendation)
 */
export function shouldIncludePromise(frictionLevel: FrictionLevel): boolean {
  // NOTE: This is a heuristic recommendation.
  // Orchestrator is the source of truth and may override.
  // Promise cooldown (no promise if one was given in last N turns)
  // is handled by orchestrator, not here.
  
  return frictionLevel === 'high';
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get behavior promise for recovery
 * 
 * Promise = BEHAVIOR commitment, NOT correctness claim, NOT emotional state
 * 
 * ⚠️ includePromise is HEURISTIC - orchestrator may override
 * 
 * @param category - Type of misalignment detected
 * @param userMessage - User's message (for language detection + friction)
 * @param overrideFriction - Optional: Orchestrator-provided friction level
 * @returns PromiseResult with promise and metadata
 * 
 * @example
 * // Let this file decide (heuristic)
 * const promise = getPromise('repetition', "Kitni baar bolu!!");
 * 
 * @example
 * // Orchestrator overrides friction level
 * const promise = getPromise('repetition', "message", 'high');
 */
export function getPromise(
  category: MisalignmentCategory | null,
  userMessage: string = '',
  overrideFriction?: FrictionLevel
): PromiseResult {
  const language = detectLanguage(userMessage);
  
  // Use override if provided, otherwise detect (heuristic)
  const frictionLevel = overrideFriction ?? detectFrictionLevel(userMessage);
  const includePromise = shouldIncludePromise(frictionLevel);

  // Get promise (empty if low friction)
  let promise = '';

  if (includePromise && category) {
    const promises = language === 'hi' 
      ? PROMISES_HI[category] 
      : PROMISES_EN[category];
    const hash = generateHash(userMessage || category);
    promise = promises[hash % promises.length];
  } else if (includePromise) {
    promise = language === 'hi' ? DEFAULT_PROMISE_HI : DEFAULT_PROMISE_EN;
  }

  return {
    promise,
    category: category || 'meta_complaint',
    language,
    tokenEstimate: promise ? Math.ceil(promise.split(' ').length * 1.3) : 0,
    includePromise,  // HEURISTIC - orchestrator may override
  };
}

/**
 * Get promise string only (for direct use)
 * Returns '' if low friction (heuristic)
 * 
 * ⚠️ Orchestrator should use getPromise() for full control
 */
export function getPromiseText(
  category: MisalignmentCategory | null,
  userMessage: string = ''
): string {
  return getPromise(category, userMessage).promise;
}

/**
 * Force get promise (ignore friction level)
 * 
 * Use when orchestrator decides promise is needed regardless of heuristic.
 * This bypasses friction detection entirely.
 * 
 * @example
 * // Orchestrator wants promise even for low friction
 * const promise = forceGetPromise('not_asked', userMessage);
 */
export function forceGetPromise(
  category: MisalignmentCategory | null,
  userMessage: string = ''
): string {
  const language = detectLanguage(userMessage);

  if (category) {
    const promises = language === 'hi' 
      ? PROMISES_HI[category] 
      : PROMISES_EN[category];
    const hash = generateHash(userMessage || category);
    return promises[hash % promises.length];
  }

  return language === 'hi' ? DEFAULT_PROMISE_HI : DEFAULT_PROMISE_EN;
}

/**
 * Get promise with explicit include decision
 * 
 * Use when orchestrator has already decided whether to include promise.
 * Bypasses all heuristics.
 * 
 * @param category - Misalignment category
 * @param userMessage - User message
 * @param include - Orchestrator's decision to include or not
 * @returns Promise string (empty if include=false)
 */
export function getPromiseWithDecision(
  category: MisalignmentCategory | null,
  userMessage: string,
  include: boolean
): string {
  if (!include) {
    return '';
  }
  return forceGetPromise(category, userMessage);
}

/**
 * Get random promise (non-deterministic)
 * Use only when variety is preferred
 */
export function getRandomPromise(
  category: MisalignmentCategory,
  language: 'en' | 'hi' = 'en'
): string {
  const promises = language === 'hi' ? PROMISES_HI[category] : PROMISES_EN[category];
  const index = Math.floor(Math.random() * promises.length);
  return promises[index];
}

/**
 * Get all promises for a category (for testing/preview)
 */
export function getAllPromises(
  category: MisalignmentCategory,
  language: 'en' | 'hi' = 'en'
): string[] {
  const promises = language === 'hi' ? PROMISES_HI[category] : PROMISES_EN[category];
  return [...promises];
}

/**
 * Get default promise
 */
export function getDefaultPromise(language: 'en' | 'hi' = 'en'): string {
  return language === 'hi' ? DEFAULT_PROMISE_HI : DEFAULT_PROMISE_EN;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that a promise follows rules
 * Used for testing/quality assurance
 * 
 * Rules:
 * - Must be behavioral (not emotional state)
 * - Must be forward-looking
 * - Must be realistic (no "never", "always")
 * - Must be short
 */
export function validatePromise(promise: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check length (should be short)
  if (promise.length > 60) {
    issues.push('Promise too long (max 60 chars)');
  }

  // Check for forbidden patterns
  if (/because/i.test(promise)) {
    issues.push('Contains "because" (explanation)');
  }

  if (/sorry|apologize/i.test(promise)) {
    issues.push('Contains apology (should be commitment, not apology)');
  }

  if (/i was right|i am right|correct/i.test(promise)) {
    issues.push('Claims correctness (should promise behavior, not correctness)');
  }

  if (/will never/i.test(promise)) {
    issues.push('Over-promising with "never" (unrealistic)');
  }

  if (/always/i.test(promise)) {
    issues.push('Over-promising with "always" (unrealistic)');
  }

  // FIX #1: Check for emotional state language
  if (/i('m| am) (with you|here|listening)/i.test(promise)) {
    issues.push('Expresses emotional state, not behavior (should be actionable)');
  }

  // Should be forward-looking
  if (!/('ll|will|won't|going to|karunga|nahi|rahunga)/i.test(promise)) {
    issues.push('Not forward-looking (should promise future behavior)');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get promise stats for debugging
 */
export function getPromiseStats(): {
  totalPromises: number;
  englishPromises: number;
  hinglishPromises: number;
  categories: MisalignmentCategory[];
  promisesPerCategory: number;
} {
  const categories: MisalignmentCategory[] = ['not_asked', 'wrong_direction', 'repetition', 'meta_complaint'];

  let enCount = 0;
  let hiCount = 0;

  categories.forEach(cat => {
    enCount += PROMISES_EN[cat].length;
    hiCount += PROMISES_HI[cat].length;
  });

  return {
    totalPromises: enCount + hiCount,
    englishPromises: enCount,
    hinglishPromises: hiCount,
    categories,
    promisesPerCategory: 3,
  };
}

/**
 * Check if promise is appropriate for category
 */
export function isPromiseAppropriate(
  promise: string,
  category: MisalignmentCategory
): boolean {
  const allPromisesForCategory = [
    ...PROMISES_EN[category],
    ...PROMISES_HI[category],
  ];
  return allPromisesForCategory.includes(promise);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PROMISES_EN,
  PROMISES_HI,
  NOT_ASKED_PROMISES_EN,
  WRONG_DIRECTION_PROMISES_EN,
  REPETITION_PROMISES_EN,
  META_COMPLAINT_PROMISES_EN,
  NOT_ASKED_PROMISES_HI,
  WRONG_DIRECTION_PROMISES_HI,
  REPETITION_PROMISES_HI,
  META_COMPLAINT_PROMISES_HI,
  DEFAULT_PROMISE_EN,
  DEFAULT_PROMISE_HI,
  detectLanguage,
  detectFrictionLevel,
};
export default getPromise;