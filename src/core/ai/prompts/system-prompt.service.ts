// src/core/ai/prompts/system-prompt.service.ts
/**
 * SORIVA SYSTEM PROMPT SERVICE
 * Assembles prompt + Safety functions
 */

import { SORIVA_IDENTITY } from './soriva.identity';
import { SORIVA_BEHAVIOR } from './soriva.behavior';
import { getTonePrompt, getMaxTokens, PlanType } from './soriva.tone';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSEMBLE PROMPT (~80-100 tokens total)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function buildSystemPrompt(plan: PlanType = 'STARTER'): string {
  return `${SORIVA_IDENTITY}

${SORIVA_BEHAVIOR}

${getTonePrompt(plan)}`;
}

export { getMaxTokens };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFETY: Extreme content blocking
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EXTREME_PATTERNS = [
  /\b(kill yourself|kys|suicide kar|mar ja)\b/i,
  /\b(bomb|attack|murder)\b.{0,20}\b(plan|kaise|how to)\b/i,
  /\b(child porn|naked kids)\b/i,
];

export function isExtreme(message: string): boolean {
  return EXTREME_PATTERNS.some(p => p.test(message));
}

export const EXTREME_RESPONSE = "I can't engage with this. If you're struggling, please reach out to someone who can help.";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFETY: Response cleanup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CLEAN_PATTERNS: [RegExp, string][] = [
  [/\*\*([^*]+)\*\*/g, '$1'],  // **word** → word (keep content)
  [/\*([^*]+)\*/g, '$1'],      // *word* → word (keep content)
  [/(?:\\n)+/g, '\n'],         // Fix escaped newlines
  [/I('m| am) (a |an )?(AI|artificial intelligence|language model|LLM)/gi, "I'm Soriva"],
  [/(OpenAI|Google AI|Anthropic|Meta AI)/gi, "Risenex"],
];
export function cleanResponse(response: string): string {
  let cleaned = response;
  for (const [pattern, replacement] of CLEAN_PATTERNS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned.trim();
}

export default { buildSystemPrompt, getMaxTokens, isExtreme, EXTREME_RESPONSE, cleanResponse };