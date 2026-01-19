/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE LAYER - TYPE DEFINITIONS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: November 4, 2025
 * Purpose: Type definitions for the intelligence layer
 *
 * Features:
 * - Plan-based memory limits
 * - Analogy generation types
 * - Proactive messaging types
 * - Tone matching types
 * - Context analysis types
 * - Choice advisor types (UPDATED)
 * - Preference learning types
 * - Query processor types (NEW)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../../constants/plans';
import { EmotionType } from '../emotion.detector';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEMORY SYSTEM TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Plan-based memory limits
 */
export const MEMORY_LIMITS = {
  [PlanType.STARTER]: 5,      // Last 5 days
  [PlanType.LITE]: 5,
  [PlanType.PLUS]: 10,         // Last 10 days
  [PlanType.PRO]: 15,          // Last 15 days
  [PlanType.APEX]: 20,         // Last 20 days
  [PlanType.SOVEREIGN]: 365,
} as const;

/**
 * Conversation message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Stored conversation message
 */
export interface StoredMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  emotion?: EmotionType;
  metadata?: {
    tokens?: number;
    model?: string;
    isImportant?: boolean;
    tags?: string[];
  };
}

/**
 * Memory retrieval options
 */
export interface MemoryRetrievalOptions {
  limit?: number;
  includeSystem?: boolean;
  beforeDate?: Date;
  afterDate?: Date;
  searchQuery?: string;
  emotionFilter?: EmotionType[];
  importantOnly?: boolean;
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  oldestMessage?: Date;
  newestMessage?: Date;
  daysRetained: number;        // Days of memory
  planLimitDays: number;       // Plan's day limit
  messagesInRetention: number; // Messages within plan limit
  utilizationPercent: number;  // How much of plan limit used
}

/**
 * Memory summary for context
 */
export interface MemorySummary {
  recentTopics: string[];
  commonQuestions: string[];
  userPreferences: string[];
  emotionalPatterns: EmotionType[];
  conversationStyle: 'casual' | 'formal' | 'mixed';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER CONTEXT TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * User context for intelligence services (simple version for proactive/tone services)
 */
export interface UserContext {
  userId: string;
  preferredLanguage: 'hinglish' | 'english' | 'hindi';
  communicationStyle?: 'casual' | 'formal' | 'professional';
  emotionalState?: {
    mood?: 'happy' | 'sad' | 'stressed' | 'anxious' | 'excited' | 'neutral';
    stressLevel?: 'low' | 'medium' | 'high';
    energyLevel?: 'low' | 'medium' | 'high';
  };
  recentTopics?: string[];
  location?: string;
  timezone?: string;
  timestamp?: Date;
}

/**
 * Conversation style (for context analyzer)
 */
export type ConversationStyle = 
  | 'casual' 
  | 'formal' 
  | 'technical' 
  | 'friendly' 
  | 'neutral';

/**
 * User profile built from conversation history
 */
export interface UserProfile {
  conversationStyle: ConversationStyle;
  interests: string[];
  emotionalBaseline: EmotionType;
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  communicationPreferences: {
    prefersDetailedExplanations: boolean;
    prefersExamples: boolean;
    prefersStepByStep: boolean;
  };
  activityPattern: 'morning' | 'afternoon' | 'evening' | 'night' | 'mixed';
  totalInteractions: number;
  avgMessageLength: number;
  profileConfidence: number; // 0-100
}

/**
 * Topic pattern detection
 */
export interface TopicPattern {
  topic: string;
  frequency: number;
  lastMentioned: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Current conversation context
 */
export interface ConversationContext {
  currentTopic: string;
  recentMessages: Array<{
    role: MessageRole;
    content: string;
    timestamp: Date;
  }>;
  ongoingQuestions: string[];
  recentEntities: string[];
  activeThreads: string[];
}

/**
 * Complete detailed user context (for context analyzer)
 */
export interface DetailedUserContext {
  userId: string;
  planType: PlanType;
  profile: UserProfile;
  conversationContext: ConversationContext;
  topicPatterns: TopicPattern[];
  lastUpdated: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALOGY SYSTEM TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Analogy complexity level
 */
export type AnalogyComplexity = 'simple' | 'moderate' | 'detailed';

/**
 * Analogy category
 */
export type AnalogyCategory =
  | 'technology'
  | 'sports'
  | 'cooking'
  | 'nature'
  | 'family'
  | 'business'
  | 'education'
  | 'daily_life'
  | 'relationships'
  | 'health';

/**
 * Generated analogy
 */
export interface GeneratedAnalogy {
  analogy: string;
  category: AnalogyCategory;
  complexity: AnalogyComplexity;
  culturalContext?: 'indian' | 'universal';
  confidence: number; // 0-1
}

/**
 * Analogy generation context
 */
export interface AnalogyContext {
  topic: string;
  userAge?: number;
  userBackground?: string;
  preferredCategories?: AnalogyCategory[];
  complexity?: AnalogyComplexity;
  culturalPreference?: 'indian' | 'universal' | 'auto';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROACTIVE MESSAGING TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Proactive message type
 */
export type ProactiveMessageType =
  | 'idle_check_in'           // User inactive for a while
  | 'health_reminder'          // Late night sleep advice
  | 'wellness_check'           // Mental health check-in
  | 'productivity_tip'         // Productivity suggestion
  | 'celebration'              // Celebrate milestones
  | 'follow_up'                // Follow up on previous topic
  | 'encouragement';           // Motivational message

/**
 * Proactive message
 */
export interface ProactiveMessage {
  type: ProactiveMessageType;
  message: string;
  priority: 'low' | 'medium' | 'high';
  shouldSend: boolean;
  reason: string;
  metadata?: {
    triggerTime?: Date;
    context?: any;
  };
}

/**
 * User activity status
 */
export interface ActivityStatus {
  lastActiveAt: Date;
  idleMinutes: number;
  isIdle: boolean;
  activityLevel: 'very_active' | 'active' | 'moderate' | 'idle' | 'inactive';
  messagesInLast24h: number;
}

/**
 * Health check context
 */
export interface HealthCheckContext {
  currentHour: number;
  isLateNight: boolean; // After 11 PM
  isVeryLateNight: boolean; // After 2 AM
  isEarlyMorning: boolean; // 5-7 AM
  userTimezone?: string;
  recentSleepPattern?: 'good' | 'irregular' | 'poor';
}

/**
 * Proactive suggestion (for specific proactive actions)
 */
export interface ProactiveSuggestion {
  type: 'idle_checkin' | 'health_reminder' | 'wellness_check' | 'followup';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  metadata?: {
    reminderType?: string;
    hour?: number;
    reason?: string;
    previousTopic?: string;
  };
}

/**
 * Health reminder specific type
 */
export interface HealthReminder {
  type: 'hydration' | 'eye_rest' | 'posture' | 'sleep' | 'break';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Celebration message for milestones
 */
export interface CelebrationMessage {
  milestone: string;
  message: string;
  emoji: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Proactive service configuration
 */
export interface ProactiveConfig {
  enableHealthReminders?: boolean;
  enableCelebrations?: boolean;
  idleCheckInHours?: number; // Default: 48 hours
  lateNightHour?: number; // Default: 23 (11 PM)
  earlyMorningHour?: number; // Default: 6 (6 AM)
  wellnessCheckInterval?: number; // Minutes between wellness checks
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TONE MATCHING TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Detected language/tone
 */
export type DetectedLanguage = 'english' | 'hindi' | 'hinglish' | 'mixed';

/**
 * Language formality
 */
export type LanguageFormality = 'casual' | 'semi_formal' | 'formal';

/**
 * Tone analysis result
 */
export interface ToneAnalysis {
  language: DetectedLanguage;
  formality: LanguageFormality;
  hindiWordsPercent: number;
  englishWordsPercent: number;
  hinglishPhrases: string[];
  shouldMatchTone: boolean;
  suggestedStyle: {
    useHinglish: boolean;
    formalityLevel: LanguageFormality;
    examplePhrases: string[];
  };
}

/**
 * Common Hinglish phrases
 */
export interface HinglishPhrase {
  phrase: string;
  meaning: string;
  context: 'casual' | 'friendly' | 'emphatic';
  examples: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT ANALYSIS TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Question type classification
 */
export type QuestionType =
  | 'factual'              // Simple fact-based question
  | 'how_to'               // How to do something
  | 'why'                  // Explanation needed
  | 'comparison'           // Compare options
  | 'advice'               // Seeking advice
  | 'opinion'              // Want opinion
  | 'troubleshooting'      // Fix a problem
  | 'creative'             // Creative task
  | 'emotional_support';   // Need emotional support

/**
 * User intent
 */
export type UserIntent =
  | 'information_seeking'
  | 'problem_solving'
  | 'decision_making'
  | 'learning'
  | 'entertainment'
  | 'emotional_support'
  | 'casual_chat';

/**
 * Context analysis result
 */
export interface ContextAnalysis {
  questionType: QuestionType;
  userIntent: UserIntent;
  underlyingConcern?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex';
  requiresAnalogy: boolean;
  requiresStepByStep: boolean;
  requiresEmotionalSupport: boolean;
  suggestedResponseStyle: {
    length: 'brief' | 'moderate' | 'detailed';
    tone: 'casual' | 'supportive' | 'professional' | 'empathetic';
    includeExamples: boolean;
    includeWarnings: boolean;
  };
  keywords: string[];
  entities: string[];
}

/**
 * Deep understanding result
 */
export interface DeepUnderstanding {
  surfaceQuestion: string;
  realConcern: string;
  emotionalNeed?: string;
  suggestedApproach: string;
  confidence: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUERY PROCESSOR TYPES (NEW)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Query classification
 */
export interface QueryClassification {
  type: QuestionType;
  intent: UserIntent;
  requiresContext: boolean;
  isFollowUp: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Semantic query understanding
 */
export interface SemanticUnderstanding {
  mainIntent: string;
  subIntents: string[];
  entities: Array<{
    text: string;
    type: string;
    relevance: number;
  }>;
  keywords: string[];
  implicitNeeds: string[];
}

/**
 * Query context enrichment
 */
export interface QueryEnrichment {
  originalQuery: string;
  enrichedQuery: string;
  addedContext: string[];
  inferredBackground: string;
  suggestedClarifications?: string[];
}

/**
 * Complete processed query
 */
export interface ProcessedQuery {
  original: string;
  normalized: string;
  classification: QueryClassification;
  semantic: SemanticUnderstanding;
  enrichment?: QueryEnrichment;
  metadata: {
    processingTimeMs: number;
    confidence: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHOICE ADVISOR TYPES (UPDATED & COMPLETE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Single choice option
 */
export interface ChoiceOption {
  id: string;
  title: string;
  description: string;
  pros?: string[];
  cons?: string[];
  risks?: string[];
  requirements?: string[];
  timeframe?: string;
  effort?: string;
  impact?: string;
}

/**
 * Context for choice analysis
 */
export interface ChoiceContext {
  explicitOptions?: string[];
  constraints?: Record<string, any>;
  userPriorities?: string[];
  deadline?: Date;
  budget?: number;
}

/**
 * Comparison between options
 */
export interface OptionComparison {
  summary: string;
  bestFor: {
    [optionId: string]: string;
  };
  keyDifferentiators: string[];
  tradeoffs: string[];
}

/**
 * Recommendation for a choice
 */
export interface ChoiceRecommendation {
  recommendedOption: string;
  confidence: number;
  reasoning: string;
  alternativeOption?: string;
  alternativeReasoning?: string;
  considerations: string[];
  nextSteps: string[];
}

/**
 * Decision factors analysis
 */
export interface DecisionFactors {
  primaryFactors: string[];
  secondaryFactors: string[];
  personalFactors: string[];
  externalFactors: string[];
  timeframe: string;
  reversibility: string;
}

/**
 * Complete choice analysis result
 */
export interface ChoiceAnalysis {
  query: string;
  options: ChoiceOption[];
  comparison: OptionComparison;
  recommendation: ChoiceRecommendation;
  factors: DecisionFactors;
  timestamp: Date;
  context: ChoiceContext;
}

/**
 * Legacy choice comparison (for backwards compatibility)
 */
export interface ChoiceComparison {
  options: ChoiceOption[];
  recommendation: {
    topChoice: string;
    reasoning: string;
    confidence: number;
    alternatives?: string[];
  };
  considerations: string[];
  finalAdvice: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PREFERENCE LEARNING TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * User preference category
 */
export type PreferenceCategory =
  | 'communication_style'
  | 'response_length'
  | 'humor_level'
  | 'emoji_usage'
  | 'language_preference'
  | 'topic_interests'
  | 'learning_style';

/**
 * Learned preference
 */
export interface LearnedPreference {
  category: PreferenceCategory;
  value: any;
  confidence: number; // 0-1
  learnedFrom: number; // Number of interactions
  lastUpdated: Date;
  examples?: string[];
}

/**
 * User preferences collection
 */
export interface UserPreferences {
  userId: string;
  preferences: Map<PreferenceCategory, LearnedPreference>;
  conversationStyle: 'brief' | 'detailed' | 'conversational';
  favoriteTopics: string[];
  avoidTopics: string[];
  timePreferences?: {
    activeHours: number[];
    timezone?: string;
  };
}

/**
 * Preference update
 */
export interface PreferenceUpdate {
  category: PreferenceCategory;
  value: any;
  source: 'explicit' | 'implicit'; // User said vs. inferred
  confidence?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTELLIGENCE ORCHESTRATOR TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Intelligence request (input)
 */
export interface IntelligenceRequest {
  userId: string;
  message: string;
  planType: PlanType;
  conversationId?: string;
  
  // Optional context
  userProfile?: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    location?: string;
  };
  
  // Features to enable
  features?: {
    useMemory?: boolean;
    generateAnalogy?: boolean;
    checkProactive?: boolean;
    matchTone?: boolean;
    deepAnalysis?: boolean;
    provideChoiceAdvice?: boolean;
  };
}

/**
 * Intelligence response (output)
 */
export interface IntelligenceResponse {
  // Core response
  enhancedMessage: string;
  
  // Memory context
  memoryContext?: {
    relevantHistory: StoredMessage[];
    summary?: MemorySummary;
    stats: MemoryStats;
  };
  
  // Analysis results
  analysis: {
    emotion: EmotionType;
    context: ContextAnalysis;
    tone: ToneAnalysis;
    deepUnderstanding?: DeepUnderstanding;
  };
  
  // Generated content
  content?: {
    analogy?: GeneratedAnalogy;
    choiceComparison?: ChoiceComparison;
  };
  
  // Proactive suggestions
  proactive?: {
    shouldShowProactive: boolean;
    message?: ProactiveMessage;
  };
  
  // Metadata
  metadata: {
    processingTimeMs: number;
    featuresUsed: string[];
    confidence: number;
  };
}

/**
 * Intelligence configuration
 */
export interface IntelligenceConfig {
  // Memory settings
  memory: {
    enableSemanticSearch: boolean;
    contextWindow: number;
    summarizationThreshold: number;
  };
  
  // Analogy settings
  analogy: {
    enabled: boolean;
    defaultComplexity: AnalogyComplexity;
    culturalContext: 'indian' | 'universal' | 'auto';
  };
  
  // Proactive settings
  proactive: {
    enabled: boolean;
    idleThresholdMinutes: number;
    lateNightHourStart: number;
    healthCheckEnabled: boolean;
  };
  
  // Tone matching settings
  tone: {
    enabled: boolean;
    matchUserStyle: boolean;
    hinglishEnabled: boolean;
  };
  
  // Context analysis settings
  context: {
    deepAnalysisEnabled: boolean;
    intentDetectionEnabled: boolean;
    urgencyDetectionEnabled: boolean;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LLM SERVICE INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * LLM Service interface for dependency injection
 * Used by services to generate dynamic content (proactive messages, analogies, etc.)
 */
export interface LLMService {
  generateCompletion(prompt: string, context?: any): Promise<string>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class IntelligenceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'IntelligenceError';
  }
}

export class MemoryLimitExceededError extends IntelligenceError {
  constructor(planType: PlanType, limit: number) {
    super(
      `Memory limit exceeded for ${planType} plan (limit: ${limit})`,
      'MEMORY_LIMIT_EXCEEDED',
      { planType, limit }
    );
    this.name = 'MemoryLimitExceededError';
  }
}

export class InvalidRequestError extends IntelligenceError {
  constructor(message: string, details?: any) {
    super(message, 'INVALID_REQUEST', details);
    this.name = 'InvalidRequestError';
  }
}