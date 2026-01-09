/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MEMORY MODULE - INDEX
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * Purpose: Clean exports for memory module
 *
 * Usage:
 * import { getMemoryContext, getSafeProWelcomeHints } from './memory';
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
  // Internal types (for server-side usage)
  ConversationSummary,
  ImportantEvent,
  UnresolvedIssue,
  ProactiveReminder,
  MemoryContext,
  WelcomeBackContext,
  AdvancedInsights,
  AdvancedWelcomeContext,
  
  // Safe types (for LLM consumption)
  SafeGreetingContext,
  SafeProWelcomeHints,
  SafeApexWelcomeHints,
  TimeAwareHints,
  
  // Utility types
  EmotionHeuristic,
  CacheEntry,
  CacheConfig,
  UserIdentity,
  MemoryPlanType,
} from './memory.types';

// Config exports
export {
  MEMORY_RETENTION_DAYS,
  WELCOME_BACK_CONFIG,
} from './memory.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CACHE EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  memoryCache,
  MemoryCache,
  createMemoryCacheKey,
  createWelcomeCacheKey,
  createTimeAwareCacheKey,
} from './memory.cache';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE MEMORY EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  // Main memory functions
  getMemoryContext,
  getRecentConversations,
  getImportantEvents,
  getUnresolvedIssues,
  generateProactiveReminders,
  getUserPreferences,
  analyzeEmotionalState,
  
  // Helper functions
  extractKeyTopics,
  detectEmotionalTone,
  detectEmotionHeuristic,
  createConversationSummary,
  extractEventDescription,
  extractIssueDescription,
  normalizeIssue,
  detectIssuePriority,
  
  // Cache management
  clearUserMemoryCache,
  clearAllMemoryCache,
} from './memory.core';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRO WELCOME EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  getProWelcomeContext,
  getSafeProWelcomeHints,
  updateProLastSeen,
  markProGreetingShown,
  buildProWelcomePrompt,
} from './memory.welcome.pro';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APEX WELCOME EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  getApexWelcomeContext,
  getSafeApexWelcomeHints,
  updateApexLastSeen,
  markApexGreetingShown,
  buildApexWelcomePrompt,
} from './memory.welcome.apex';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIME-AWARE EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  // Main time-aware functions
  getTimeAwareHints,
  getLateNightCareHints,
  
  // Dynamic mirroring
  getMirroredTerm,
  getAllMirrorTerms,
  clearMirrorTermCache,
  
  // Time detection
  detectTimeSlot,
  isLateNightTime,
  isEarlyMorning,
  getTimeBasedGreetingHint,
  getUserLocalHour,
  
  // Prompt builder
  buildTimeAwarePrompt,
} from './memory.timeaware';