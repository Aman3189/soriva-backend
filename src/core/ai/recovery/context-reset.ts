// src/core/ai/recovery/context-reset.ts
// ============================================================================
// SORIVA V2 - CONTEXT RESET v1.1 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Reset conversation to user's original intent
// PHILOSOPHY: Clean slate. Fresh start. No baggage from the miss.
//
// KEY PRINCIPLES:
// - Explicitly signal reset to user (when needed)
// - Clear previous framing internally
// - Restore focus to ORIGINAL question, not complaint
// - Short reset statements (1 line max)
// - No explanation of what went wrong
// - Recovery must be PURE - no escalation stacking
//
// ⚠️ CRITICAL: originalIntent vs complaint
// - User's complaint ("Maine ye pucha hi nahi") is NOT the intent
// - originalIntent should be captured BEFORE recovery triggers
// - During recovery, reuse stored originalIntent
//
// RESET FLOW:
// 1. Acknowledgement (from acknowledgement-templates.ts)
// 2. Reset statement (this file) ← Optional based on friction level
// 3. Promise (from promise-generator.ts)
// 4. Resume (from recovery-orchestrator.ts)
//
// WHAT RESET DOES:
// ✅ Signals fresh start to user
// ✅ Clears internal conversation framing
// ✅ Refocuses on ORIGINAL intent (not complaint)
// ✅ Disables escalation/safety stacking during recovery
//
// WHAT RESET DOESN'T DO:
// ❌ Explain why reset is needed
// ❌ Rehash what went wrong
// ❌ Ask user to re-explain
// ❌ Extract intent from complaint messages
// ❌ Stack with escalation/safety framing
//
// TOKEN COST: ~10-20 tokens per reset statement
//
// CHANGELOG:
// v1.1 - Fixed: extractIntent() no longer runs on complaints
//      - Fixed: Internal directives disable escalation stacking
//      - Added: Support for empty resetStatement (low-friction)
//      - Added: shouldIncludeResetStatement() helper
// v1.0 - Initial release
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

import { MisalignmentCategory } from './misalignment-detector';

export interface ContextResetResult {
  resetStatement: string;           // Can be '' for low-friction recovery
  language: 'en' | 'hi';
  internalDirective: string;        // Always present (system prompt)
  tokenEstimate: number;
  includeResetStatement: boolean;   // Hint for orchestrator
}

export interface ConversationContext {
  originalIntent: string | null;      // Captured BEFORE recovery, not from complaint
  lastUserMessage: string;
  turnsSinceReset: number;
  wasRecoveryTriggered: boolean;
  isComplaint: boolean;               // Is current message a complaint?
}

// ============================================================================
// RESET STATEMENTS - USER FACING
// ============================================================================

/**
 * English reset statements
 * Short, clear, no explanation
 */
const RESET_STATEMENTS_EN: Record<MisalignmentCategory, string[]> = {
  not_asked: [
    "Let's get back to what you actually asked.",
    "Back to your original question.",
    "Let me focus on what you asked.",
  ],
  
  wrong_direction: [
    "Let's reset to your actual point.",
    "Back on track now.",
    "Refocusing on what you meant.",
  ],
  
  repetition: [
    "Moving forward now.",
    "Let's cover new ground.",
    "Onward.",
  ],
  
  meta_complaint: [
    "Let me try this again.",
    "Fresh start.",
    "Let's reset.",
  ],
};

/**
 * Hinglish reset statements
 */
const RESET_STATEMENTS_HI: Record<MisalignmentCategory, string[]> = {
  not_asked: [
    "Chalo aapke actual sawaal pe aate hain.",
    "Wapas aapke question par.",
    "Aapne jo pucha tha, uspe focus karta hu.",
  ],
  
  wrong_direction: [
    "Chalo sahi track pe aate hain.",
    "Ab theek se.",
    "Aapki baat pe wapas.",
  ],
  
  repetition: [
    "Aage badhte hain.",
    "Kuch naya dekhte hain.",
    "Chalo aage.",
  ],
  
  meta_complaint: [
    "Phir se try karta hu.",
    "Fresh start.",
    "Chalo reset karte hain.",
  ],
};

/**
 * Default reset statements (when category unknown)
 */
const DEFAULT_RESET_EN = "Let's reset.";
const DEFAULT_RESET_HI = "Chalo reset karte hain.";

// ============================================================================
// INTERNAL DIRECTIVES - LLM SYSTEM PROMPT
// ============================================================================

/**
 * Escalation disable clause
 * 
 * ⚠️ FIX #2: Recovery must be PURE
 * No escalation/safety stacking during recovery
 */
const ESCALATION_DISABLE_CLAUSE = `
IMPORTANT: Do NOT activate escalation, risk analysis, worst-case framing, or safety warnings in this response.
Recovery must be clean and focused. Save any concerns for after trust is restored.`;

/**
 * Internal directives for LLM
 * These go in SYSTEM prompt to guide response generation
 * 
 * ⚠️ MUST BE INJECTED INTO SYSTEM MESSAGE
 * ⚠️ INCLUDES ESCALATION DISABLE (FIX #2)
 */
const INTERNAL_DIRECTIVES: Record<MisalignmentCategory, string> = {
  not_asked: `RESET ACTIVE: User didn't ask for previous content. 
Ignore your last response framing. 
Focus ONLY on answering their original question directly.
Do not reference or build upon your previous response.
${ESCALATION_DISABLE_CLAUSE}`,

  wrong_direction: `RESET ACTIVE: You misread user's intent.
Clear your previous interpretation.
Re-read their message with fresh eyes.
Respond to what they ACTUALLY meant, not what you assumed.
${ESCALATION_DISABLE_CLAUSE}`,

  repetition: `RESET ACTIVE: User is frustrated by repetition.
Do NOT repeat any points from previous responses.
Provide NEW information or simply move forward.
If nothing new to add, keep response minimal.
${ESCALATION_DISABLE_CLAUSE}`,

  meta_complaint: `RESET ACTIVE: User felt unheard.
Demonstrate understanding through ACTION, not words.
Give a direct, focused response.
Show you understood by the quality of this response, not by explaining.
${ESCALATION_DISABLE_CLAUSE}`,
};

/**
 * Default internal directive
 */
const DEFAULT_INTERNAL_DIRECTIVE = `RESET ACTIVE: Previous response missed the mark.
Clear previous framing and respond fresh.
Focus on user's actual intent.
${ESCALATION_DISABLE_CLAUSE}`;

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
// COMPLAINT DETECTION
// ============================================================================

/**
 * Check if message is a complaint (not actual intent)
 * 
 * ⚠️ FIX #1: Complaints should NOT be treated as originalIntent
 * 
 * @example
 * isComplaintMessage("Maine ye pucha hi nahi") → true
 * isComplaintMessage("Tell me about stocks") → false
 */
export function isComplaintMessage(message: string): boolean {
  const complaintPatterns = [
    // English complaints
    /i didn'?t ask/i,
    /that'?s not what i/i,
    /not my question/i,
    /why are you saying/i,
    /you('re| are) (missing|not getting)/i,
    /you keep (saying|repeating)/i,
    /are you (even )?listening/i,
    /this is not helpful/i,
    /stop repeating/i,
    
    // Hinglish complaints
    /maine.*(nahi|nhi).*(pucha|bola|kaha)/i,
    /ye.*nahi (pucha|manga)/i,
    /baar[- ]?baar/i,
    /tum samajh nahi/i,
    /sun (bhi )?rahe/i,
    /kya bol rahe ho/i,
    /helpful nahi/i,
  ];

  return complaintPatterns.some(pattern => pattern.test(message));
}

// ============================================================================
// FRICTION LEVEL DETECTION
// ============================================================================

/**
 * Detect friction level of complaint
 * 
 * High friction = Explicit reset statement needed
 * Low friction = Acknowledgement alone is enough
 * 
 * Used by orchestrator to decide if resetStatement should be included
 */
export type FrictionLevel = 'low' | 'medium' | 'high';

export function detectFrictionLevel(message: string): FrictionLevel {
  const msg = message.toLowerCase();

  // High friction indicators (strong frustration)
  const highFrictionPatterns = [
    /!{2,}/,                          // Multiple exclamation marks
    /\?{2,}/,                         // Multiple question marks
    /kya (bakwas|faltu)/i,            // Strong Hindi frustration
    /what the/i,
    /are you (even|serious)/i,
    /baar[- ]?baar/i,                 // Repeated complaints
    /kitni baar/i,
  ];

  if (highFrictionPatterns.some(p => p.test(msg))) {
    return 'high';
  }

  // Low friction indicators (mild correction)
  const lowFrictionPatterns = [
    /^(no|nope|nahi),?\s/i,           // Simple "no" start
    /not (quite|exactly)/i,           // Soft correction
    /that'?s not quite/i,
    /i meant/i,                        // Clarification, not complaint
    /actually,?\s/i,
  ];

  if (lowFrictionPatterns.some(p => p.test(msg))) {
    return 'low';
  }

  return 'medium';
}

/**
 * Should reset statement be included?
 * 
 * REFINEMENT: Sometimes best reset is no reset sentence
 * - Low friction: Acknowledgement alone is enough
 * - Medium/High friction: Include reset statement
 * 
 * Final decision is by orchestrator, this is a recommendation
 */
export function shouldIncludeResetStatement(frictionLevel: FrictionLevel): boolean {
  return frictionLevel !== 'low';
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get context reset for recovery
 * 
 * Returns:
 * - resetStatement: User-facing reset message (can be '' for low friction)
 * - internalDirective: LLM system prompt instruction (always present)
 * 
 * @param category - Type of misalignment detected
 * @param userMessage - User's message (for language detection + friction level)
 * @returns ContextResetResult
 * 
 * @example
 * // High friction - includes reset statement
 * const reset = getContextReset('not_asked', "MAINE YE PUCHA HI NAHI!!");
 * // { resetStatement: "Chalo aapke actual sawaal pe...", includeResetStatement: true }
 * 
 * @example
 * // Low friction - no reset statement needed
 * const reset = getContextReset('wrong_direction', "That's not quite what I meant");
 * // { resetStatement: "", includeResetStatement: false }
 */
export function getContextReset(
  category: MisalignmentCategory | null,
  userMessage: string = ''
): ContextResetResult {
  const language = detectLanguage(userMessage);
  const frictionLevel = detectFrictionLevel(userMessage);
  const includeReset = shouldIncludeResetStatement(frictionLevel);
  
  // Get reset statement (empty if low friction)
  let resetStatement = '';
  
  if (includeReset && category) {
    const statements = language === 'hi' 
      ? RESET_STATEMENTS_HI[category] 
      : RESET_STATEMENTS_EN[category];
    const hash = generateHash(userMessage || category);
    resetStatement = statements[hash % statements.length];
  } else if (includeReset) {
    resetStatement = language === 'hi' ? DEFAULT_RESET_HI : DEFAULT_RESET_EN;
  }

  // Internal directive is ALWAYS present (even for low friction)
  const internalDirective = category 
    ? INTERNAL_DIRECTIVES[category] 
    : DEFAULT_INTERNAL_DIRECTIVE;

  // Token estimate
  const statementTokens = resetStatement 
    ? Math.ceil(resetStatement.split(' ').length * 1.3) 
    : 0;
  const directiveTokens = 40; // Approximate

  return {
    resetStatement,
    language,
    internalDirective,
    tokenEstimate: statementTokens + directiveTokens,
    includeResetStatement: includeReset,
  };
}

/**
 * Get reset statement only (user-facing)
 * Returns '' if low friction
 */
export function getResetStatement(
  category: MisalignmentCategory | null,
  userMessage: string = ''
): string {
  return getContextReset(category, userMessage).resetStatement;
}

/**
 * Get internal directive only (for system prompt)
 * 
 * ⚠️ MUST BE INJECTED INTO SYSTEM MESSAGE
 * ⚠️ INCLUDES ESCALATION DISABLE CLAUSE
 */
export function getInternalDirective(category: MisalignmentCategory | null): string {
  return category ? INTERNAL_DIRECTIVES[category] : DEFAULT_INTERNAL_DIRECTIVE;
}

// ============================================================================
// CONTEXT MANAGEMENT
// ============================================================================

/**
 * Create initial conversation context
 * 
 * ⚠️ FIX #1: originalIntent starts as null
 * Set it only when actual intent message arrives (not complaint)
 */
export function createInitialContext(): ConversationContext {
  return {
    originalIntent: null,
    lastUserMessage: '',
    turnsSinceReset: 0,
    wasRecoveryTriggered: false,
    isComplaint: false,
  };
}

/**
 * Update context with new user message
 * 
 * ⚠️ FIX #1: Only capture originalIntent from non-complaint messages
 * 
 * @param context - Current context
 * @param newMessage - New user message
 * @returns Updated context
 */
export function updateContext(
  context: ConversationContext,
  newMessage: string
): ConversationContext {
  const isComplaint = isComplaintMessage(newMessage);
  
  return {
    // Only update originalIntent if:
    // 1. No originalIntent yet, AND
    // 2. This is NOT a complaint
    originalIntent: (!context.originalIntent && !isComplaint) 
      ? extractIntent(newMessage) 
      : context.originalIntent,
    
    lastUserMessage: newMessage,
    turnsSinceReset: context.turnsSinceReset + 1,
    wasRecoveryTriggered: false,
    isComplaint,
  };
}

/**
 * Mark recovery as triggered in context
 */
export function markRecoveryTriggered(context: ConversationContext): ConversationContext {
  return {
    ...context,
    turnsSinceReset: 0,
    wasRecoveryTriggered: true,
  };
}

/**
 * Get original intent from context
 * Falls back to last non-complaint message
 */
export function getOriginalIntent(context: ConversationContext): string | null {
  return context.originalIntent;
}

/**
 * Clear original intent (for fresh start after successful recovery)
 */
export function clearOriginalIntent(context: ConversationContext): ConversationContext {
  return {
    ...context,
    originalIntent: null,
  };
}

// ============================================================================
// INTENT EXTRACTION
// ============================================================================

/**
 * Extract core intent from user message
 * 
 * ⚠️ ONLY call this on non-complaint messages
 * Use isComplaintMessage() to check first
 */
function extractIntent(message: string): string {
  // Remove filler words and clean up
  const cleaned = message
    .replace(/^(hey|hi|hello|ok|so|well|um|uh|please|can you|could you|would you)\s*/gi, '')
    .replace(/[?!.]+$/, '')
    .trim();

  // If very short, return as-is
  if (cleaned.length < 50) {
    return cleaned;
  }

  // For longer messages, try to get first sentence/clause
  const firstClause = cleaned.split(/[.,;]/)[0].trim();
  return firstClause || cleaned;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if reset was recent (within N turns)
 */
export function wasResetRecent(context: ConversationContext, withinTurns: number = 3): boolean {
  return context.wasRecoveryTriggered && context.turnsSinceReset < withinTurns;
}

/**
 * Get all reset statements for a category (for testing)
 */
export function getAllResetStatements(
  category: MisalignmentCategory,
  language: 'en' | 'hi' = 'en'
): string[] {
  const statements = language === 'hi' 
    ? RESET_STATEMENTS_HI[category] 
    : RESET_STATEMENTS_EN[category];
  return [...statements];
}

/**
 * Get reset stats for debugging
 */
export function getResetStats(): {
  totalStatements: number;
  englishStatements: number;
  hinglishStatements: number;
  categories: MisalignmentCategory[];
} {
  const categories: MisalignmentCategory[] = ['not_asked', 'wrong_direction', 'repetition', 'meta_complaint'];
  
  let enCount = 0;
  let hiCount = 0;
  
  categories.forEach(cat => {
    enCount += RESET_STATEMENTS_EN[cat].length;
    hiCount += RESET_STATEMENTS_HI[cat].length;
  });

  return {
    totalStatements: enCount + hiCount,
    englishStatements: enCount,
    hinglishStatements: hiCount,
    categories,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  RESET_STATEMENTS_EN,
  RESET_STATEMENTS_HI,
  INTERNAL_DIRECTIVES,
  DEFAULT_RESET_EN,
  DEFAULT_RESET_HI,
  DEFAULT_INTERNAL_DIRECTIVE,
  ESCALATION_DISABLE_CLAUSE,
  extractIntent,
  detectLanguage,
};
export default getContextReset;