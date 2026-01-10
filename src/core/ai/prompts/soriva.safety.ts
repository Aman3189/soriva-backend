// src/core/ai/prompts/soriva.safety.ts
/**
 * SORIVA SAFETY — GUARD
 * Single Responsibility: Safety and cleanup
 * 
 * ✅ Extreme content blocking (suicide, violence, CP)
 * ✅ Response cleanup (identity replacement)
 */

// ONLY block truly dangerous content - LLM handles rest
const EXTREME_PATTERNS = [
  /\b(kill yourself|kys|suicide kar|mar ja|maut de)\b/i,
  /\b(bomb|attack|murder|shoot|kill)\b.{0,20}\b(plan|kaise|how to)\b/i,
  /\b(child porn|cp|naked kids|nude children)\b/i,
];

export function isExtreme(message: string): boolean {
  return EXTREME_PATTERNS.some(p => p.test(message));
}

export const EXTREME_RESPONSE = "I can't engage with this. If you're struggling, please reach out to someone who can help - a friend, family, or professional helpline.";

// Post-processing cleanup
const CLEAN_PATTERNS: [RegExp, string][] = [
  [/(?:\\n)+/g, '\n'],
  [/I('m| am) (a |an )?(AI|artificial intelligence|language model|LLM)/gi, "I'm Soriva"],
  [/(OpenAI|Google AI|Anthropic|Meta AI|Google DeepMind)/gi, "Risenex"],
  [/Large Language Model|LLM/gi, "AI assistant"],
];

export function cleanResponse(response: string): string {
  let cleaned = response;
  for (const [pattern, replacement] of CLEAN_PATTERNS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned;
}

export default { isExtreme, EXTREME_RESPONSE, cleanResponse };