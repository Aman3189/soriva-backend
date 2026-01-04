// src/core/ai/recovery/escalation-guard.ts
// ============================================================================
// SORIVA V2 - ESCALATION GUARD v2.1 (ULTRA-LEAN) - January 2026
// ============================================================================
// 🎯 PURPOSE: Freeze forward logic when misalignment detected
// 💡 PHILOSOPHY: Minimum tokens, maximum impact
//
// v2.1 - CRITICAL FIX:
// - Tell LLM acknowledgement ALREADY added (no double apology)
// - Guard prompt: 18 tokens → 12 tokens
// - Total overhead target: <50 tokens
// ============================================================================

import { MisalignmentCategory } from './misalignment-detector';

// ============================================================================
// TYPES
// ============================================================================

export interface EscalationGuardResult {
  isActive: boolean;
  guardPrompt: string;
  blockedBehaviors: string[];
  allowedBehaviors: string[];
  responseLimit: ResponseLimit;
}

export interface ResponseLimit {
  maxLines: number;
  maxTokens: number;
  enforced: boolean;
}

export interface ViolationCheckResult {
  violates: boolean;
  reasons: string[];
  action: 'pass' | 'regenerate' | 'trim';
}

// ============================================================================
// CONSTANTS (ULTRA-LEAN)
// ============================================================================

const RECOVERY_RESPONSE_LIMIT: ResponseLimit = {
  maxLines: 4,      // Reduced from 6
  maxTokens: 80,    // Reduced from 120
  enforced: true,
};

/**
 * CORE GUARD - 12 tokens
 * KEY: "Apology prefix added" tells LLM not to add its own
 */
const CORE_GUARD_PROMPT = `Acknowledgement done. Now just answer. No apology. No identity. No explaining. Max 4 lines.`;
/**
 * CATEGORY GUARDS - 3-4 tokens each
 */
const CATEGORY_GUARDS: Record<MisalignmentCategory, string> = {
  not_asked: `Only actual question.`,
  wrong_direction: `User's intent only.`,
  repetition: `New info only.`,
  meta_complaint: `Action, not words.`,
};

const BLOCKED_BEHAVIORS = [
  'Extra apology',
  'Explaining previous',
  'Identity intro',
  'Disclaimers',
  'Long response',
];

const ALLOWED_BEHAVIORS = [
  'Direct answer',
  'Moving forward',
];

/**
 * IDENTITY PATTERNS (detection only)
 */
const IDENTITY_PATTERNS = [
  /\bi('m| am) soriva\b/i,
  /\bsoriva (here|hai)\b/i,
  /\b(created|made) by risenex\b/i,
  /\brisenex/i,
  /\bi('m| am) an? (ai|assistant)\b/i,
];

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

export function getEscalationGuard(category: MisalignmentCategory | null): EscalationGuardResult {
  let guardPrompt = CORE_GUARD_PROMPT;

  if (category && CATEGORY_GUARDS[category]) {
    guardPrompt += ` ${CATEGORY_GUARDS[category]}`;
  }

  return {
    isActive: true,
    guardPrompt,
    blockedBehaviors: BLOCKED_BEHAVIORS,
    allowedBehaviors: ALLOWED_BEHAVIORS,
    responseLimit: RECOVERY_RESPONSE_LIMIT,
  };
}

export function getGuardPrompt(category: MisalignmentCategory | null): string {
  return getEscalationGuard(category).guardPrompt;
}

export function getInactiveGuard(): EscalationGuardResult {
  return {
    isActive: false,
    guardPrompt: '',
    blockedBehaviors: [],
    allowedBehaviors: [],
    responseLimit: { maxLines: 0, maxTokens: 0, enforced: false },
  };
}

// ============================================================================
// VIOLATION CHECK
// ============================================================================

export function checkResponseViolation(responseText: string): ViolationCheckResult {
  const text = responseText.toLowerCase();
  const reasons: string[] = [];

  // Identity
  if (IDENTITY_PATTERNS.some(p => p.test(responseText))) {
    reasons.push('Identity');
  }

  // Extra apology (even 1 is too many - prefix already has acknowledgement)
  if (/\b(sorry|apolog|maaf)\b/i.test(text)) {
    reasons.push('Extra apology');
  }

  // Justification
  if (/because (i|we|earlier)/.test(text)) {
    reasons.push('Justification');
  }

  // Length
  const lines = responseText.split('\n').filter(l => l.trim()).length;
  if (lines > RECOVERY_RESPONSE_LIMIT.maxLines) {
    reasons.push('Too long');
  }

  if (reasons.length === 0) {
    return { violates: false, reasons: [], action: 'pass' };
  }

  const needsRegenerate = reasons.some(r => 
    r === 'Identity' || r === 'Extra apology' || r === 'Justification'
  );

  return {
    violates: true,
    reasons,
    action: needsRegenerate ? 'regenerate' : 'trim',
  };
}

export function containsIdentityIntroduction(text: string): boolean {
  return IDENTITY_PATTERNS.some(p => p.test(text));
}

export function removeIdentitySentences(response: string): string {
  return response
    .split(/(?<=[.!?])\s+/)
    .filter(s => !IDENTITY_PATTERNS.some(p => p.test(s)))
    .join(' ')
    .trim();
}

/**
 * Remove extra apologies from response
 */
export function removeExtraApologies(response: string): string {
  return response
    .split(/(?<=[.!?])\s+/)
    .filter(s => !/\b(sorry|apolog|maaf|my bad)\b/i.test(s))
    .join(' ')
    .trim();
}

/**
 * Clean response - remove identity AND apologies
 */
export function cleanRecoveryResponse(response: string): string {
  return response
    .split(/(?<=[.!?])\s+/)
    .filter(s => {
      const hasIdentity = IDENTITY_PATTERNS.some(p => p.test(s));
      const hasApology = /\b(sorry|apolog|maaf|my bad)\b/i.test(s);
      return !hasIdentity && !hasApology;
    })
    .join(' ')
    .trim();
}

// ============================================================================
// UTILITIES
// ============================================================================

export function getRecoveryResponseLimit(): ResponseLimit {
  return { ...RECOVERY_RESPONSE_LIMIT };
}

export function getBlockedBehaviors(): string[] {
  return [...BLOCKED_BEHAVIORS];
}

export function getAllowedBehaviors(): string[] {
  return [...ALLOWED_BEHAVIORS];
}

export function getGuardTokenEstimate(category: MisalignmentCategory | null): number {
  return category ? 16 : 12;
}

export function trimToRecoveryLimit(response: string): string {
  const lines = response.split('\n').filter(l => l.trim());
  return lines.length <= RECOVERY_RESPONSE_LIMIT.maxLines 
    ? response 
    : lines.slice(0, RECOVERY_RESPONSE_LIMIT.maxLines).join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export { 
  CORE_GUARD_PROMPT, 
  CATEGORY_GUARDS, 
  BLOCKED_BEHAVIORS, 
  ALLOWED_BEHAVIORS,
  RECOVERY_RESPONSE_LIMIT,
  IDENTITY_PATTERNS,
};

export default getEscalationGuard;