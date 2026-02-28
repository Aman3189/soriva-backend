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
// DELTA ENGINE v2.4.0 - Companion Prompts, Intents, Domains
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  // Core constants
  DELTA_CORE,
  
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
  
  // Proactive hints
  getProactiveHint,
  

  
  // Clean response
  cleanResponse,
  
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
export const LANGUAGE = DELTA_CORE.LANGUAGE;
export const BEHAVIOR = DELTA_CORE.BEHAVIOR;
export const STYLE = DELTA_CORE.STYLE;

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