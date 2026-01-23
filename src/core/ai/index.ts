/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CORE AI - UNIFIED EXPORTS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: soriva-backend/src/core/ai/index.ts
 * 
 * Single source of truth for all AI-related imports.
 * 
 * Usage:
 *   import { sorivaIntelligence, greetingService } from '../../core/ai';
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELTA ENGINE - Behavior, Plans, Intents, Token Limits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  SorivaDeltaEngine,
  buildDelta,
  classifyIntent,
  getMaxTokens,
  IDENTITY,
  LANGUAGE,
  BEHAVIOR,
  STYLE,
  PLANS,
} from './soriva-delta-engine';

export type {
  PlanType,
  StarterIntent,
  LiteIntent,
  PlusIntent,
  ProIntent,
  ApexIntent,
  SovereignIntent,
} from './soriva-delta-engine';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTELLIGENCE - Safety, Health, Emotion, Analysis
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  sorivaIntelligence,
  SorivaIntelligence,
  detectHealthIntentDepth,
  decideHealthResponseMode,
  buildAdaptiveHealthRules,
  buildHealthModeRules,
  detectManipulation,
  detectTesterMode,
  compress,
  compressHard,
  countTokens,
  qualityCheckHealthResponse,
} from './soriva-intelligence';

export type {
  IntentType,
  ComplexityLevel,
  LanguageType,
  EmotionType,
  SafetyLevel,
  HealthIntentDepth,
  HealthResponseMode,
  SorivaInput,
  SorivaOutput,
} from './soriva-intelligence';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GREETING SERVICE - Dynamic Greetings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  greetingService,
  GreetingService,
} from './greeting.service';

export type {
  LanguagePreference,
  TimeOfDay,
  WarmthLevel,
  GreetingContext,
  GreetingResult,
} from './greeting.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM PROMPT SERVICE - Prompt Assembly & Safety
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  buildSystemPrompt,
  isExtreme,
  EXTREME_RESPONSE,
  cleanResponse,
  getValueAuditAnalytics,
  logAuditEntry,
} from './system-prompt.service';