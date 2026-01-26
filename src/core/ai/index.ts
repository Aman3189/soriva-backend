/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CORE AI - UNIFIED EXPORTS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: soriva-backend/src/core/ai/index.ts
 * 
 * Single source of truth for all AI-related imports.
 * 
 * Usage:
 *   import { greetingService, buildDelta, DELTA_CORE } from '../../core/ai';
 * 
 * UPDATED: January 2026 - Delta Engine v2.1 + Orchestrator Integration
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELTA ENGINE v2.1 - Companion Prompts, Intents, Domains
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  // Core constants (IDENTITY, LANGUAGE, BEHAVIOR, STYLE combined)
  DELTA_CORE,
  
  // Plan configurations
  PLANS,
  
  // Main functions
  classifyIntent,
  buildDelta,
  buildDeltaV2,
  buildEnhancedDelta,
  getDomain,
  getIntent,
  getMaxTokens,
  
  // Proactive hints
  getProactiveHint,
  
  // Search trust
  getSearchTrustRules,
} from './soriva-delta-engine';

// Types
export type {
  PlanType,
  IntentType,
  DomainType,
  DeltaInput,
  DeltaOutput,
  IntelligenceSync,
  SearchContext,
  UserContext,
} from './soriva-delta-engine';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BACKWARD COMPATIBILITY - Old exports mapped to new
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// These are re-exported from DELTA_CORE for backward compatibility
import { DELTA_CORE } from './soriva-delta-engine';

export const IDENTITY = DELTA_CORE.IDENTITY;
export const LANGUAGE = DELTA_CORE.LANGUAGE;
export const BEHAVIOR = DELTA_CORE.BEHAVIOR;
export const STYLE = DELTA_CORE.STYLE;

// Legacy class export (use buildDelta/buildEnhancedDelta instead)
export { SorivaDeltaEngine } from './soriva-delta-engine';

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTE: Intelligence Layer & Coordinator
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// ORCHESTRATOR (Intelligence Layer v4.2):
//   import { intelligenceOrchestrator } from '../../services/ai/intelligence/orchestrator.service';
//
// COORDINATOR (Full Pipeline):
//   import { sorivaCoordinator } from '../../services/ai/soriva-coordinator.service';
//
// HYBRID SEARCH:
//   import { HybridSearchService } from '../../modules/chat/services/search/hybrid-search.service';
//