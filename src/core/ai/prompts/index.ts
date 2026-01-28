/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PROMPTS - RE-EXPORTS FROM CORE/AI
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: soriva-backend/src/core/ai/prompts/index.ts
 * 
 * This file re-exports from the parent /core/ai/ folder
 * for backward compatibility with existing imports.
 * 
 * UPDATED: January 2026 - Greeting service removed (LLM handles greetings)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Re-export everything from parent for backward compatibility
export {
  // System Prompt Service
  buildSystemPrompt,
  isExtreme,
  EXTREME_RESPONSE,
  cleanResponse,
  getValueAuditAnalytics,
  logAuditEntry,
  
  // Delta Engine
  SorivaDeltaEngine,
  buildDelta,
  classifyIntent,
  getMaxTokens,
  IDENTITY,
  LANGUAGE,
  BEHAVIOR,
  STYLE,
  PLANS,
} from '../index';

export type {
  PlanType,
} from '../index';

// Legacy aliases for backward compatibility
export { IDENTITY as SORIVA_IDENTITY } from '../index';
export { BEHAVIOR as SORIVA_BEHAVIOR } from '../index';

// Legacy exports (map to new structure)
export const COMPANY_INFO = {
  name: 'Risenex Dynamics',
  country: 'India',
};

export const getTonePrompt = (plan: string) => {
  const { buildDelta, classifyIntent } = require('../soriva-delta-engine');
  return buildDelta(plan, classifyIntent(plan, ''));
};

export const PLAN_CONFIG = {
  STARTER: { maxTokens: 900 },
  LITE: { maxTokens: 1200 },
  PLUS: { maxTokens: 1200 },
  PRO: { maxTokens: 2000 },
  APEX: { maxTokens: 3000 },
  SOVEREIGN: { maxTokens: 3000 },
};

// Default export for backward compatibility
import { buildSystemPrompt, isExtreme, EXTREME_RESPONSE, cleanResponse } from '../index';

export default {
  buildSystemPrompt,
  isExtreme,
  EXTREME_RESPONSE,
  cleanResponse,
};