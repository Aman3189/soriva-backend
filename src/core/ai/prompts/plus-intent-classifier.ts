// src/core/ai/prompts/plus-intent-classifier.ts
// ============================================================================
// SORIVA PLUS CLASSIFIER v2.0 — Ultra Lightweight
// ============================================================================
// Purpose: 
// 1. Detect NUDGE type (for UI prompts)
// 2. Simple intent wrapper (uses plus-delta classifier)
// Token Cost: 0 (pure regex)
// ============================================================================

import { PlusIntent } from './plus-delta';

// ============================================================================
// TYPES
// ============================================================================

export type NudgeType = 'DECIDE' | 'ACTION' | 'SIMPLIFY' | null;

export interface PlusClassifyResult {
  intent: PlusIntent;
  nudgeType: NudgeType;
  nudgeText: string;
}

// ============================================================================
// PATTERNS — Minimal regex
// ============================================================================

// Intent patterns
const WORK_PATTERN = /email|meeting|presentation|report|client|deadline|project|proposal|business|professional/i;

const CREATIVE_PATTERN = /write|story|poem|creative|idea|brainstorm|design|content|blog|article|script|caption|tagline|slogan/i;

const LEARNING_PATTERN = /explain|what is|how does|why|understand|learn|teach|concept|meaning|samjhao|batao|sikho/i;

// Nudge patterns
const DECIDE_PATTERN = /should i|which one|recommend|choose between|decide|better option|what do you think|kya karu|konsa|sahi rahega/i;

const ACTION_PATTERN = /how do i|how to|next step|where do i start|get started|first step|kaise karu|shuru karu|steps batao/i;

const SIMPLIFY_PATTERN = /confused|confusing|overwhelming|complicated|dont understand|don't understand|not sure|lost|stuck|samajh nahi|clear nahi/i;

// ============================================================================
// CLASSIFIER FUNCTIONS
// ============================================================================

/**
 * Classify intent
 */
export function classifyPlusIntent(message: string): PlusIntent {
  if (WORK_PATTERN.test(message)) return 'WORK';
  if (CREATIVE_PATTERN.test(message)) return 'CREATIVE';
  if (LEARNING_PATTERN.test(message)) return 'LEARNING';
  return 'EVERYDAY';
}

/**
 * Detect nudge type
 * Priority: DECIDE > ACTION > SIMPLIFY
 */
export function detectNudge(message: string): NudgeType {
  if (DECIDE_PATTERN.test(message)) return 'DECIDE';
  if (ACTION_PATTERN.test(message)) return 'ACTION';
  if (SIMPLIFY_PATTERN.test(message)) return 'SIMPLIFY';
  return null;
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

/**
 * Full classification
 */
export function classifyMessage(message: string): PlusClassifyResult {
  const nudgeType = detectNudge(message);
  return {
    intent: classifyPlusIntent(message),
    nudgeType,
    nudgeText: getNudgeText(nudgeType),
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function getPlusIntent(message: string): PlusIntent {
  return classifyPlusIntent(message);
}

export function shouldShowNudge(message: string): boolean {
  return detectNudge(message) !== null;
}

export default classifyMessage;