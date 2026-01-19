// src/core/ai/prompts/soriva.tone.ts
/**
 * SORIVA TONE — STYLE per plan
 * NO hard token caps. LLM decides length naturally.
 */
export type PlanType = 'LITE' | 'STARTER' | 'PLUS' | 'PRO' | 'APEX' | 'SOVEREIGN';

interface PlanConfig {
  maxTokens: number;
  tone: string;
}

const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  STARTER: {
    maxTokens: 3000,
    tone: 'Helpful, concise. Keep responses brief but complete.',
  },
  LITE: {
    maxTokens: 4096,
    tone: 'Friendly, thorough. Answer fully, no cutting corners.',
  },
  PLUS: {
    maxTokens: 4096,
    tone: 'Warm, thorough, natural. Answer fully, no cutting corners.',
  },
  PRO: {
    maxTokens: 8192,
    tone: 'Engaging, detailed when needed. Adapt length to query complexity.',
  },
  APEX: {
    maxTokens: 8192,
    tone: 'Premium experience. Comprehensive answers. No limits on helpfulness.',
  },
  SOVEREIGN: {
    maxTokens: 99999,
    tone: 'Full Soriva experience. Be exceptional.',
  },
};

export function getTonePrompt(plan: PlanType): string {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.STARTER;
  return `TONE: ${config.tone}`;
}

export const getTone = getTonePrompt;  // ← ADD THIS LINE

export function getMaxTokens(plan: PlanType): number {
  return PLAN_CONFIG[plan]?.maxTokens || 4096;
}

export { PLAN_CONFIG };
export default { getTonePrompt, getTone, getMaxTokens, PLAN_CONFIG };