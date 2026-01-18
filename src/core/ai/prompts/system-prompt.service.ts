// src/core/ai/prompts/system-prompt.service.ts
/**
 * SORIVA SYSTEM PROMPT SERVICE
 * Assembles prompt + Safety functions + Value Audit Analytics
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
  [/\*\*([^*]+)\*\*/g, '$1'],
  [/\*([^*]+)\*/g, '$1'],
  [/(?:\\n)+/g, '\n'],
  [/I('m| am) (a |an )?(AI|artificial intelligence|language model|LLM)/gi, "I'm Soriva"],
  [/(OpenAI|Google AI|Anthropic|Meta AI)/gi, "Risenex"],
  [/Amandeep\s+Singh/gi, "Amandeep"],  // Force correct name
];

export function cleanResponse(response: string): string {
  let cleaned = response;
  for (const [pattern, replacement] of CLEAN_PATTERNS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned.trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALUE AUDIT ANALYTICS
// Tracks token efficiency per plan
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface AuditEntry {
  planType: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: Date;
}

const auditLog: AuditEntry[] = [];

export function logAuditEntry(entry: AuditEntry): void {
  auditLog.push(entry);
  // Keep last 1000 entries only
  if (auditLog.length > 1000) {
    auditLog.shift();
  }
}

export function getValueAuditAnalytics(planType?: string) {
  const entries = planType 
    ? auditLog.filter(e => e.planType === planType)
    : auditLog;

  if (entries.length === 0) {
    return {
      planType: planType || 'all',
      totalResponses: 0,
      avgTokens: 0,
      avgInputTokens: 0,
      avgOutputTokens: 0,
      avgCompressionRatio: 1.0,
      totalTokens: 0,
      lastUpdated: new Date(),
    };
  }

  const totalInput = entries.reduce((sum, e) => sum + e.inputTokens, 0);
  const totalOutput = entries.reduce((sum, e) => sum + e.outputTokens, 0);
  const totalTokens = totalInput + totalOutput;

  return {
    planType: planType || 'all',
    totalResponses: entries.length,
    avgTokens: Math.round(totalTokens / entries.length),
    avgInputTokens: Math.round(totalInput / entries.length),
    avgOutputTokens: Math.round(totalOutput / entries.length),
    avgCompressionRatio: totalInput > 0 ? Number((totalOutput / totalInput).toFixed(2)) : 1.0,
    totalTokens,
    lastUpdated: new Date(),
  };
}

export default { 
  buildSystemPrompt, 
  getMaxTokens, 
  isExtreme, 
  EXTREME_RESPONSE, 
  cleanResponse,
  getValueAuditAnalytics,
  logAuditEntry,
};