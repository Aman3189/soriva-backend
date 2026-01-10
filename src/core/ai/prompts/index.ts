// src/core/ai/prompts/index.ts
/**
 * SORIVA PROMPTS — CLEAN EXPORTS
 */

// Main entry point
export { 
  buildSystemPrompt, 
  getMaxTokens, 
  isExtreme, 
  EXTREME_RESPONSE, 
  cleanResponse 
} from './system-prompt.service';

// Individual components (if needed)
export { SORIVA_IDENTITY, COMPANY_INFO } from './soriva.identity';
export { SORIVA_BEHAVIOR } from './soriva.behavior';
export { getTonePrompt, PLAN_CONFIG } from './soriva.tone';
export type { PlanType } from './soriva.tone';