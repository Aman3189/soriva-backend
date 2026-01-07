// src/core/ai/prompts/tone.config.ts
/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA HUMAN TONE CONFIGURATION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Numeric scale for LLM tone control
 * Replaces verbose personality instructions
 * Saves ~50-70 tokens per request
 */

export const HUMAN_TONE_LEVELS = {
  STARTER: 0.4,    // Helpful, clear, basic
  PLUS: 0.6,       // Warm, friendly
  PRO: 0.75,       // Very human, empathetic
  APEX: 0.9,       // Premium - like talking to a friend
  SOVEREIGN: 0.95, // Ultra-premium, deeply personal
} as const;

// 🆕 Delta mapping - which delta file to use for each plan
export const PLAN_DELTA_MAP = {
  STARTER: 'STARTER',
  PLUS: 'PLUS',
  PRO: 'PRO',
  APEX: 'APEX',
  SOVEREIGN: 'APEX',  // SOVEREIGN uses APEX delta + higher tone
} as const;

export type PlanName = keyof typeof HUMAN_TONE_LEVELS;
export type DeltaType = typeof PLAN_DELTA_MAP[keyof typeof PLAN_DELTA_MAP];

/**
 * Get human tone level for a plan
 * @param plan - Plan name (STARTER, PLUS, PRO, APEX, SOVEREIGN)
 * @returns Tone level between 0.0 and 1.0
 */
export function getHumanToneLevel(plan: string): number {
  const upperPlan = plan.toUpperCase() as PlanName;
  return HUMAN_TONE_LEVELS[upperPlan] ?? HUMAN_TONE_LEVELS.STARTER;
}

/**
 * Get delta type for a plan
 * @param plan - Plan name
 * @returns Delta type to use (STARTER, PLUS, PRO, APEX)
 */
export function getDeltaType(plan: string): DeltaType {
  const upperPlan = plan.toUpperCase() as keyof typeof PLAN_DELTA_MAP;
  return PLAN_DELTA_MAP[upperPlan] ?? 'STARTER';
}

/**
 * Token-efficient tone instruction
 * Just 3-5 tokens instead of 50+
 */
export function getToneInstruction(plan: string): string {
  const level = getHumanToneLevel(plan);
  return `humanTone: ${level}`;
}

export default HUMAN_TONE_LEVELS;