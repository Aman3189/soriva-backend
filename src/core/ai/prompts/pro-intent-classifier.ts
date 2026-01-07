// src/core/ai/prompts/pro-intent-classifier.ts
// ============================================================================
// SORIVA PRO CLASSIFIER v2.0 — Ultra Lightweight
// ============================================================================
// Purpose: 
// 1. Detect NUDGE type (for UI prompts)
// 2. Determine GPT allowance (model routing)
// 3. Simple intent classification
// Token Cost: 0 (pure regex)
// ============================================================================

import { ProIntent } from './pro-delta';

// ============================================================================
// TYPES
// ============================================================================

export type NudgeType = 'DECIDE' | 'ACTION' | 'SIMPLIFY' | null;

export interface ProClassifyResult {
  intent: ProIntent;
  nudgeType: NudgeType;
  nudgeText: string;
  allowGPT: boolean;
}

// ============================================================================
// PATTERNS — Minimal regex
// ============================================================================

// Intent patterns
const EXPERT_PATTERN = /architecture|system design|scalability|trade.?off|risk analysis|financial analysis|deep analysis|complex|first principles|root cause|impact assessment/i;

const PROFESSIONAL_PATTERN = /business plan|roadmap|strategy|proposal|marketing|sales|pitch|pricing|project plan|budget|presentation|report|meeting|client|metrics|kpi/i;

const TECHNICAL_PATTERN = /code|api|database|error|bug|typescript|react|node|deploy|server|function|algorithm/i;

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
export function classifyProIntent(message: string): ProIntent {
  const len = message.length;
  
  // Short message + no explanation = EVERYDAY
  if (len < 50 && !/explain|why|how/.test(message)) return 'EVERYDAY';
  
if (EXPERT_PATTERN.test(message)) return 'EXPERT';
if (PROFESSIONAL_PATTERN.test(message)) return 'PROFESSIONAL';
if (TECHNICAL_PATTERN.test(message)) return 'TECHNICAL';
  
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
 * Determine if GPT allowed for this intent
 * PRO users get GPT for EXPERT queries only
 */
export function shouldAllowGPT(intent: ProIntent, gptRemainingTokens?: number): boolean {
  // Only EXPERT intent gets GPT
  if (intent !== 'EXPERT') return false;
  
  // Check token cap
  const GPT_MIN_THRESHOLD = 20000;
  if (gptRemainingTokens !== undefined && gptRemainingTokens < GPT_MIN_THRESHOLD) {
    return false; // Cap reached
  }
  
  return true;
}

/**
 * Full classification
 */
export function classifyMessage(message: string, gptRemainingTokens?: number): ProClassifyResult {
  const intent = classifyProIntent(message);
  const nudgeType = detectNudge(message);
  
  return {
    intent,
    nudgeType,
    nudgeText: getNudgeText(nudgeType),
    allowGPT: shouldAllowGPT(intent, gptRemainingTokens),
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function getProIntent(message: string): ProIntent {
  return classifyProIntent(message);
}

export function shouldShowNudge(message: string): boolean {
  return detectNudge(message) !== null;
}

export function isExpertIntent(message: string): boolean {
  return classifyProIntent(message) === 'EXPERT';
}

export default classifyMessage;