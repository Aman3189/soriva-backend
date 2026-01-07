// src/core/ai/prompts/apex-intent-classifier.ts
// ============================================================================
// SORIVA APEX CLASSIFIER v3.1 — Ultra Lightweight
// ============================================================================
// Purpose: 
// 1. Detect NUDGE type (for UI prompts)
// 2. Model recommendation (premium routing)
// 3. Convenience functions
// Token Cost: 0 (pure regex)
// ============================================================================

// Import classifier from apex-delta (single source)
import { ApexIntent, classifyApexIntent } from './apex-delta';

// Re-export for backward compatibility
export { classifyApexIntent };

// ============================================================================
// TYPES
// ============================================================================

export type NudgeType = 'DECIDE' | 'ACTION' | 'SIMPLIFY' | null;

export interface ApexClassifyResult {
  intent: ApexIntent;
  nudgeType: NudgeType;
  nudgeText: string;
  recommendedModels: string[];
}

// ============================================================================
// NUDGE PATTERNS
// ============================================================================

const DECIDE_PATTERN = /should i|which one|recommend|choose between|decide|better option|what do you think|kya karu|konsa|sahi rahega/i;

const ACTION_PATTERN = /how do i|how to|next step|where do i start|get started|first step|kaise karu|shuru karu|steps batao/i;

const SIMPLIFY_PATTERN = /confused|confusing|overwhelming|complicated|dont understand|don't understand|not sure|lost|stuck|samajh nahi|clear nahi/i;

// ============================================================================
// NUDGE FUNCTIONS
// ============================================================================

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

// ============================================================================
// MODEL RECOMMENDATION
// ============================================================================

/**
 * Get recommended models for intent
 * APEX users get premium model routing
 */
export function getRecommendedModels(intent: ApexIntent): string[] {
  switch (intent) {
    case 'QUICK': return ['gemini-2.5-flash', 'kimi-k2'];
    case 'ANALYTICAL': return ['gpt-5.1', 'gemini-2.5-pro'];
    case 'STRATEGIC': return ['gpt-5.1', 'claude-sonnet-4-5'];
    case 'CREATIVE': return ['claude-sonnet-4-5', 'gemini-3-pro'];
    case 'TECHNICAL': return ['gpt-5.1', 'claude-sonnet-4-5'];
    case 'LEARNING': return ['claude-sonnet-4-5', 'gemini-2.5-pro'];
    case 'PERSONAL': return ['claude-sonnet-4-5'];
    default: return ['gemini-2.5-flash'];
  }
}

// ============================================================================
// FULL CLASSIFICATION
// ============================================================================

/**
 * Full classification with nudge and model recommendation
 */
export function classifyMessage(message: string): ApexClassifyResult {
  const intent = classifyApexIntent(message);
  const nudgeType = detectNudge(message);
  
  return {
    intent,
    nudgeType,
    nudgeText: getNudgeText(nudgeType),
    recommendedModels: getRecommendedModels(intent),
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function getApexIntent(message: string): ApexIntent {
  return classifyApexIntent(message);
}

export function shouldShowNudge(message: string): boolean {
  return detectNudge(message) !== null;
}

export function needsDeepThinking(message: string): boolean {
  const intent = classifyApexIntent(message);
  return ['ANALYTICAL', 'STRATEGIC', 'TECHNICAL'].includes(intent);
}

export function needsEmotionalIntelligence(message: string): boolean {
  return classifyApexIntent(message) === 'PERSONAL';
}

export default classifyMessage;