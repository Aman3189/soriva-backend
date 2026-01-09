/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MEMORY TYPES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * Purpose: Type definitions for memory module
 *
 * Architecture Rules:
 * - Internal types: For server-side logic only
 * - Safe types: For LLM consumption (no raw insights)
 * - LLM gets STYLE hints, not DECISION data
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERNAL TYPES (Server-side only - NEVER send to LLM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Conversation summary for memory context
 * @internal Server-side only
 */
export interface ConversationSummary {
  sessionId: string;
  date: Date;
  summary: string;
  keyTopics: string[];
  emotionalTone: string;
  messageCount: number;
}

/**
 * Important events detected in conversations
 * @internal Server-side only
 */
export interface ImportantEvent {
  date: Date;
  type: 'achievement' | 'problem' | 'decision' | 'goal' | 'milestone';
  description: string;
  sessionId: string;
}

/**
 * Unresolved issues tracking
 * @internal Server-side only
 */
export interface UnresolvedIssue {
  issue: string;
  firstMentioned: Date;
  lastMentioned: Date;
  priority: 'low' | 'medium' | 'high';
  sessionId: string;
}

/**
 * Proactive reminders for follow-ups
 * @internal Server-side only
 */
export interface ProactiveReminder {
  message: string;
  type: 'follow_up' | 'deadline' | 'check_in' | 'suggestion';
  relevance: number; // 0-1 score
}

/**
 * Complete memory context (internal aggregation)
 * @internal Server-side only - transform before sending to LLM
 */
export interface MemoryContext {
  recentConversations: ConversationSummary[];
  importantEvents: ImportantEvent[];
  unresolvedIssues: UnresolvedIssue[];
  proactiveReminders: ProactiveReminder[];
  userPreferences: Record<string, unknown>;
  emotionalState: {
    current: string;
    trend: 'improving' | 'stable' | 'declining';
  };
}

/**
 * Raw welcome back context (internal)
 * @internal Server-side only - NEVER expose daysMissed to LLM
 */
export interface WelcomeBackContext {
  shouldConsiderGreeting: boolean;
  daysMissed?: number; // INTERNAL ONLY
  context?: string;
}

/**
 * Advanced insights for APEX (internal calculations)
 * @internal Server-side only - convert to SafeWelcomeHints before LLM
 */
export interface AdvancedInsights {
  usualChatTime?: string;
  currentTime?: string;
  relationshipLevel?: number; // 1-10 scale - NEVER send to LLM
  concernLevel?: 'low' | 'medium' | 'high';
  wasOnStreak?: boolean;
  streakBroken?: number; // NEVER send to LLM
  usualDailyWords?: number; // NEVER send to LLM
  likelyReason?: string; // NEVER send to LLM
  shouldShowConcern?: boolean;
}

/**
 * Advanced welcome context (internal)
 * @internal Server-side only
 */
export interface AdvancedWelcomeContext extends WelcomeBackContext {
  advancedInsights?: AdvancedInsights;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFE TYPES (For LLM consumption - Style hints only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Safe greeting context for LLM
 * Rule: LLM gets STYLE, Server makes DECISION
 */
export interface SafeGreetingContext {
  /** Whether greeting is allowed (server decided) */
  allowGreeting: boolean;

  /** Tone hint for greeting style */
  tone: 'light' | 'friendly' | 'warm' | 'concerned';

  /** Depth of emotional expression */
  depth: 'low' | 'medium' | 'high';

  /** Style hint for greeting approach */
  style: 'casual' | 'caring_friend' | 'supportive' | 'excited';

  /** Optional: Safe example styles (no specific numbers) */
  exampleHints?: string[];
}

/**
 * Safe welcome hints for PRO plan
 * No raw data - only style guidance
 */
export interface SafeProWelcomeHints {
  allowGreeting: boolean;
  tone: 'light' | 'friendly';
  hint: 'short_gap' | 'few_days' | 'week_gap';
  skipIf: string[]; // Conditions to skip greeting
}

/**
 * Safe welcome hints for APEX plan
 * Emotional intelligence without raw numbers
 */
export interface SafeApexWelcomeHints {
  allowGreeting: boolean;
  tone: 'friendly' | 'warm' | 'concerned' | 'excited';
  depth: 'low' | 'medium' | 'high';
  style: 'casual' | 'caring_friend' | 'supportive' | 'reconnecting';
  emotionalApproach: 'light_checkin' | 'warm_welcome' | 'genuine_concern';
  skipIf: string[];
}

/**
 * Time-aware context hints
 * For late night care + dynamic mirroring
 */
export interface TimeAwareHints {
  isLateNight: boolean;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
  careHint?: 'gentle_reminder' | 'health_concern' | 'none';
  mirrorTerm: string; // Dynamic: Bhai/Yaar/Name based on identity
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMOTION TYPES (Heuristic only - not ground truth)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Emotion detection result
 * NOTE: Heuristic only. Never assume emotional truth.
 * @internal Use for hints, not for critical decisions
 */
export interface EmotionHeuristic {
  detected: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: 'low' | 'medium' | 'high';
  /** WARNING: This is pattern-based, not actual emotion */
  isHeuristicOnly: true;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CACHE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  defaultTTL: number;
  maxEntries: number;
  cleanupInterval: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER CONTEXT TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * User identity for dynamic mirroring
 */
export interface UserIdentity {
  name?: string;
  gender?: 'male' | 'female' | 'other' | null;
  preferredLanguage?: 'en' | 'hi' | 'hinglish';
}

/**
 * Plan types for memory features
 */
export type MemoryPlanType = 'STARTER' | 'PLUS' | 'PRO' | 'APEX' | 'SOVEREIGN';

/**
 * Memory retention config by plan
 */
export const MEMORY_RETENTION_DAYS: Record<MemoryPlanType, number> = {
  STARTER: 5,
  PLUS: 10,
  PRO: 15,
  APEX: 25,
  SOVEREIGN: 30,
};

/**
 * Welcome back feature availability by plan
 */
export const WELCOME_BACK_CONFIG: Record<MemoryPlanType, {
  enabled: boolean;
  maxLookbackDays: number;
  advancedInsights: boolean;
}> = {
  STARTER: { enabled: false, maxLookbackDays: 0, advancedInsights: false },
  PLUS: { enabled: false, maxLookbackDays: 0, advancedInsights: false },
  PRO: { enabled: true, maxLookbackDays: 5, advancedInsights: false },
  APEX: { enabled: true, maxLookbackDays: 30, advancedInsights: true },
  SOVEREIGN: { enabled: true, maxLookbackDays: 30, advancedInsights: true },
};