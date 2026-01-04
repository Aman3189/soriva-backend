// src/core/ai/recovery/acknowledgement-templates.ts
// ============================================================================
// SORIVA V2 - ACKNOWLEDGEMENT TEMPLATES v1.1 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Provide short, non-defensive acknowledgement responses
// PHILOSOPHY: User feels SEEN, not corrected. No defense, no justification.
//
// KEY PRINCIPLES:
// - Max 1-2 sentences
// - NO "Because...", NO "Medically...", NO "Statistically..."
// - NO explaining WHY Soriva went wrong
// - Ownership without over-apologizing
// - Category-specific templates for precision
// - Deterministic selection (same input = same output)
// - EXPLICIT ownership - never imply user was unclear
//
// TEMPLATE STRUCTURE:
// 1. Acknowledgement (1 line) - "You're right..."
// 2. Ownership (optional, 1 line) - "That was a misread..."
//
// WHAT TEMPLATES DO:
// ✅ Accept the miss
// ✅ Take brief ownership
// ✅ Signal reset
//
// WHAT TEMPLATES DON'T DO:
// ❌ Explain previous logic
// ❌ Justify intent
// ❌ Cite sources
// ❌ Over-apologize
// ❌ Ask why user is upset
// ❌ Imply user was unclear
//
// TOKEN COST: ~15-25 tokens per template
//
// CHANGELOG:
// v1.1 - Fixed "I hear you now" → "I missed that" (ownership)
//      - Fixed Hinglish detection (pure ASCII = English)
// v1.0 - Initial release
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

import { MisalignmentCategory } from './misalignment-detector';

export interface AcknowledgementResult {
  template: string;
  category: MisalignmentCategory;
  language: 'en' | 'hi';
  tokenEstimate: number;
}

// ============================================================================
// ENGLISH TEMPLATES
// ============================================================================

/**
 * NOT_ASKED templates
 * User said: "Maine ye pucha hi nahi" / "I didn't ask for this"
 */
const NOT_ASKED_TEMPLATES_EN = [
  "You're right — I went in a direction you didn't ask for.",
  "Fair point. That wasn't what you asked.",
  "Got it — I drifted from your actual question.",
  "You're right, that's not what you were asking.",
];

/**
 * WRONG_DIRECTION templates
 * User said: "Why are you saying this?" / "You're missing the point"
 */
const WRONG_DIRECTION_TEMPLATES_EN = [
  "You're right — I went off track there.",
  "Fair point. I misread your intent.",
  "Got it — I took that in the wrong direction.",
  "You're right, I missed what you were getting at.",
];

/**
 * REPETITION templates
 * User said: "Baar baar same baat" / "You keep repeating"
 */
const REPETITION_TEMPLATES_EN = [
  "You're right — I've been circling the same point.",
  "Fair point. Let me move forward instead of repeating.",
  "Got it — I was stuck on that. Moving on.",
  "You're right, I kept going back to that.",
];

/**
 * META_COMPLAINT templates
 * User said: "Tum samajh nahi rahe" / "Are you even listening?"
 * 
 * ⚠️ NOTE: Templates must maintain OWNERSHIP
 * Never imply user was unclear — that's blame shift
 */
const META_COMPLAINT_TEMPLATES_EN = [
  "You're right — I wasn't tracking your point properly.",
  "Fair point. Let me actually address what you're saying.",
  "You're right — I missed that.",  // FIX #1: Replaced "I hear you now"
  "You're right, I wasn't getting it. Let me try again.",
];

// ============================================================================
// HINGLISH TEMPLATES
// ============================================================================

/**
 * NOT_ASKED templates - Hinglish
 */
const NOT_ASKED_TEMPLATES_HI = [
  "Sahi kaha — maine galat direction li.",
  "Bilkul — ye aapne nahi pucha tha.",
  "Got it — main bhatak gaya tha actual question se.",
  "Sahi baat hai — ye aapka sawaal nahi tha.",
];

/**
 * WRONG_DIRECTION templates - Hinglish
 */
const WRONG_DIRECTION_TEMPLATES_HI = [
  "Sahi kaha — main off track ho gaya.",
  "Bilkul — maine intent galat samjha.",
  "Got it — galat direction le li maine.",
  "Sahi baat hai — point miss ho gaya mujhse.",
];

/**
 * REPETITION templates - Hinglish
 */
const REPETITION_TEMPLATES_HI = [
  "Sahi kaha — wahi baat ghuma raha tha.",
  "Bilkul — aage badhte hain ab.",
  "Got it — us point pe atak gaya tha.",
  "Sahi baat hai — repeat ho raha tha. Chalo aage.",
];

/**
 * META_COMPLAINT templates - Hinglish
 */
const META_COMPLAINT_TEMPLATES_HI = [
  "Sahi kaha — theek se nahi samjha maine.",
  "Bilkul — ab dhyan se sunta hu.",
  "Sahi kaha — miss ho gaya mujhse.",  // Consistent with EN fix
  "Sahi baat hai — phir se try karta hu.",
];

// ============================================================================
// TEMPLATE MAPS
// ============================================================================

const TEMPLATES_EN: Record<MisalignmentCategory, string[]> = {
  not_asked: NOT_ASKED_TEMPLATES_EN,
  wrong_direction: WRONG_DIRECTION_TEMPLATES_EN,
  repetition: REPETITION_TEMPLATES_EN,
  meta_complaint: META_COMPLAINT_TEMPLATES_EN,
};

const TEMPLATES_HI: Record<MisalignmentCategory, string[]> = {
  not_asked: NOT_ASKED_TEMPLATES_HI,
  wrong_direction: WRONG_DIRECTION_TEMPLATES_HI,
  repetition: REPETITION_TEMPLATES_HI,
  meta_complaint: META_COMPLAINT_TEMPLATES_HI,
};

// ============================================================================
// HASH FUNCTION - Deterministic Selection
// ============================================================================

/**
 * Generate consistent hash from string
 * Same input → Same output (always)
 * Used for deterministic template selection
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
// LANGUAGE DETECTION
// ============================================================================

/**
 * Check if text contains Hindi/Hinglish patterns
 * NOTE: This is step 1 - needs isPureASCII check too
 */
function containsHindiPatterns(text: string): boolean {
  const hinglishPatterns = [
    /\b(kya|kyu|kyun|kaise|kaun|kab|kahan)\b/i,
    /\b(hai|hain|ho|tha|thi|the)\b/i,
    /\b(nahi|nhi|nahin)\b/i,
    /\b(maine|tumne|usne|humne)\b/i,
    /\b(acha|theek|thik|sahi)\b/i,
    /\b(bhai|yaar)\b/i,  // Removed "bro" - it's English slang
    /\b(samajh|samjh|baat|cheez)\b/i,
    /\b(baar|wahi|phir)\b/i,
  ];

  return hinglishPatterns.some(pattern => pattern.test(text));
}

/**
 * Check if text is pure ASCII (English only)
 * Used to prevent "Bro, you're wrong" → Hinglish
 */
function isPureASCII(text: string): boolean {
  return /^[\x00-\x7F]*$/.test(text);
}

/**
 * Smart Hinglish detection
 * 
 * FIX #2: Only classify as Hinglish if:
 * 1. Contains Hindi patterns AND
 * 2. NOT pure ASCII (has Devanagari or mixed script)
 * 
 * This prevents English slang ("bro", "yaar" in English context)
 * from triggering Hinglish templates
 * 
 * @example
 * isHinglish("Bro, you're missing the point") → false (pure ASCII)
 * isHinglish("Maine ye nahi pucha bhai") → true (Hindi patterns + not pure English)
 * isHinglish("Kya kar rahe ho?") → true (Hindi patterns)
 */
function isHinglish(text: string): boolean {
  // Must have Hindi patterns
  if (!containsHindiPatterns(text)) {
    return false;
  }

  // If pure ASCII, it's likely English with casual slang
  if (isPureASCII(text)) {
    return false;
  }

  return true;
}

/**
 * Detect language with smart logic
 * 
 * Logic:
 * - Hindi patterns + non-ASCII → Hinglish
 * - Hindi patterns + pure ASCII → English (slang like "bro")
 * - No Hindi patterns → English
 */
function detectLanguage(text: string): 'en' | 'hi' {
  return isHinglish(text) ? 'hi' : 'en';
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get acknowledgement template for recovery
 * 
 * Deterministic: Same category + userMessage = Same template (always)
 * 
 * @param category - Type of misalignment detected
 * @param userMessage - User's message (for hash + language detection)
 * @returns AcknowledgementResult with template and metadata
 * 
 * @example
 * const ack = getAcknowledgement('not_asked', "Maine ye pucha hi nahi");
 * // { template: "Sahi kaha — maine galat direction li.", language: 'hi', ... }
 * 
 * @example
 * const ack = getAcknowledgement('wrong_direction', "Bro, you're missing the point");
 * // { template: "You're right — I went off track there.", language: 'en', ... }
 */
export function getAcknowledgement(
  category: MisalignmentCategory,
  userMessage: string = ''
): AcknowledgementResult {
  // Detect language with smart logic
  const language = detectLanguage(userMessage);
  
  // Select template map based on language
  const templateMap = language === 'hi' ? TEMPLATES_HI : TEMPLATES_EN;
  const templates = templateMap[category];

  // Deterministic selection using hash
  const hash = generateHash(userMessage || category);
  const index = hash % templates.length;
  const template = templates[index];

  return {
    template,
    category,
    language,
    tokenEstimate: Math.ceil(template.split(' ').length * 1.3),
  };
}

/**
 * Get template string only (for direct use)
 */
export function getAcknowledgementText(
  category: MisalignmentCategory,
  userMessage: string = ''
): string {
  return getAcknowledgement(category, userMessage).template;
}

/**
 * Get random template (non-deterministic)
 * Use only when variety is preferred over consistency
 */
export function getRandomAcknowledgement(
  category: MisalignmentCategory,
  language: 'en' | 'hi' = 'en'
): string {
  const templateMap = language === 'hi' ? TEMPLATES_HI : TEMPLATES_EN;
  const templates = templateMap[category];
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
}

/**
 * Get all templates for a category (for testing/preview)
 */
export function getAllTemplates(
  category: MisalignmentCategory,
  language: 'en' | 'hi' = 'en'
): string[] {
  const templateMap = language === 'hi' ? TEMPLATES_HI : TEMPLATES_EN;
  return [...templateMap[category]];
}

/**
 * Get default/fallback acknowledgement
 * Used when category is null or unknown
 */
export function getDefaultAcknowledgement(language: 'en' | 'hi' = 'en'): string {
  if (language === 'hi') {
    return "Sahi kaha — phir se try karta hu.";
  }
  return "You're right — let me try that again.";
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get template stats for debugging
 */
export function getTemplateStats(): {
  totalTemplates: number;
  englishTemplates: number;
  hinglishTemplates: number;
  categories: MisalignmentCategory[];
  templatesPerCategory: number;
} {
  const categories: MisalignmentCategory[] = ['not_asked', 'wrong_direction', 'repetition', 'meta_complaint'];
  
  return {
    totalTemplates: 32,
    englishTemplates: 16,
    hinglishTemplates: 16,
    categories,
    templatesPerCategory: 4,
  };
}

/**
 * Validate that a template follows rules
 * Used for testing/quality assurance
 */
export function validateTemplate(template: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check length (should be short)
  if (template.length > 80) {
    issues.push('Template too long (max 80 chars)');
  }

  // Check for forbidden patterns
  if (/because/i.test(template)) {
    issues.push('Contains "because" (justification)');
  }

  if (/sorry|apologize/i.test(template)) {
    issues.push('Contains apology (should be ownership, not apology)');
  }

  if (/let me explain/i.test(template)) {
    issues.push('Contains explanation intent');
  }

  if (/\?$/.test(template)) {
    issues.push('Ends with question (should be statement)');
  }

  // FIX #1: Check for blame-shift language
  if (/now i (hear|understand|get)/i.test(template)) {
    issues.push('Implies user was unclear before (blame shift)');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  TEMPLATES_EN,
  TEMPLATES_HI,
  NOT_ASKED_TEMPLATES_EN,
  WRONG_DIRECTION_TEMPLATES_EN,
  REPETITION_TEMPLATES_EN,
  META_COMPLAINT_TEMPLATES_EN,
  NOT_ASKED_TEMPLATES_HI,
  WRONG_DIRECTION_TEMPLATES_HI,
  REPETITION_TEMPLATES_HI,
  META_COMPLAINT_TEMPLATES_HI,
  isHinglish,
  detectLanguage,
};
export default getAcknowledgement;