/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CORE AI - UNIFIED EXPORTS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: soriva-backend/src/core/ai/index.ts
 * 
 * Single source of truth for all AI-related imports.
 * 
 * Usage:
 *   import { buildDelta, DELTA_CORE } from '../../core/ai';
 *   import { queryIntelligence, analyzeQuery } from '../../core/ai';
 * 
 * UPDATED: January 2026 - Removed greeting.service (LLM handles greetings)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUERY INTELLIGENCE v1.0 - Ambiguity & Context Detection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  QueryIntelligenceService,
  queryIntelligence,
} from './query-intelligence.service';

export type {
  QueryAnalysis,
  ConversationMessage,
  QueryIntelligenceConfig,
  AmbiguityLevel,
  ComplexityLevel,
  QueryCategory,
} from './query-intelligence.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELTA ENGINE v2.4.0 - Companion Prompts, Intents, Domains
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  // Core constants
  DELTA_CORE,
  SORIVA_CORE,
  CORE_CONSTANTS,
  
  // Plan configurations
  PLANS,
  
  // Main functions
  classifyIntent,
  buildDelta,
  buildDeltaV2,
  buildEnhancedDelta,
  buildQuickDelta,
  buildSearchDelta,
  getDomain,
  getIntent,
  getMaxTokens,
  
  // Query Intelligence shortcuts
  analyzeQuery,
  needsClarification,
  getClarificationQuestion,
  isFollowUp,
  
  // Proactive hints
  getProactiveHint,
  PROACTIVE_HINTS,
  
  // Search trust
  getSearchTrustRules,
  
  // Clean response
  cleanResponse,
  
  // Version
  SORIVA_DELTA_ENGINE_VERSION,
  
  // Main engine object
  SorivaDeltaEngine,
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
import { DELTA_CORE } from './soriva-delta-engine';

export const IDENTITY = DELTA_CORE.IDENTITY;
export const LANGUAGE = DELTA_CORE.LANGUAGE_RULES;
export const BEHAVIOR = DELTA_CORE.BEHAVIOR_RULES;
export const STYLE = DELTA_CORE.STYLE_RULES;

// Aliases
export const CORE_IDENTITY = DELTA_CORE.IDENTITY;
export const SORIVA_IDENTITY = DELTA_CORE.IDENTITY;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM PROMPT SERVICE - Prompt Assembly & Safety
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  buildSystemPrompt,
  isExtreme,
  EXTREME_RESPONSE,
  getValueAuditAnalytics,
  logAuditEntry,
} from './system-prompt.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GREETING BEHAVIOR NOTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// greeting.service.ts has been REMOVED.
// Greetings are now handled by LLM for more natural responses.
// See GREETING_RULES in delta-engine system prompts.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE ALIASES (for backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type LanguagePreference = 'english' | 'hinglish' | 'hindi';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTE: Other Services
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// ORCHESTRATOR (Intelligence Layer):
//   import { intelligenceOrchestrator } from '../../services/ai/intelligence/orchestrator.service';
//
// COORDINATOR (Full Pipeline):
//   import { sorivaCoordinator } from '../../services/ai/soriva-coordinator.service';
//
// HYBRID SEARCH:
//   import { HybridSearchService } from '../../modules/chat/services/search/hybrid-search.service';
//