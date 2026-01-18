/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CONTEXT ANALYZER SERVICE - HYBRID (Statistical + LLM)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: November 4, 2025
 * 
 * ✅ FIXED v2.0: Uses LLMService (Smart Routing) instead of hardcoded Anthropic
 * 
 * Purpose: Analyzes conversation context and user patterns from memory
 *
 * Features:
 * - HYBRID approach: Statistical base + LLM intelligence
 * - User profile building from conversation history
 * - Conversation context extraction
 * - Pattern detection (topics, timing, style)
 * - Preference learning
 * - Behavior analysis
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../../constants/plans';
import { EmotionType } from '../emotion.detector';
import { MemoryService } from './memory.service';
import {
  DetailedUserContext,
  ConversationContext,
  UserProfile,
  TopicPattern,
  ConversationStyle,
  StoredMessage,
  ContextAnalysis,
  DeepUnderstanding,
  QuestionType,
  UserIntent,
  LLMService,
} from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONTEXT_CONFIG = {
  MIN_MESSAGES_FOR_PROFILE: 10,
  MIN_MESSAGES_FOR_LLM: 5,
  CACHE_TTL_MINUTES: 10,
  MAX_CONTEXT_MESSAGES: 20,
  USE_LLM_FOR_DEEP_ANALYSIS: true,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT ANALYZER SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ContextAnalyzerService {
  private llmService: LLMService;
  private memoryService: MemoryService;

  private contextCache: Map<string, { context: DetailedUserContext; timestamp: Date }> =
    new Map();

  /**
   * ✅ FIXED: Constructor uses LLMService (connected to Smart Routing)
   */
  constructor(llmService: LLMService, memoryService: MemoryService) {
    this.llmService = llmService;
    this.memoryService = memoryService;
    console.log('[ContextAnalyzer] ✅ Initialized (v2.0 - Smart Routing Connected)');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN METHODS FOR ORCHESTRATOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Analyze context for current query (main method called by orchestrator)
   */
  async analyzeContext(
    userId: string,
    message: string,
    planType: PlanType
  ): Promise<ContextAnalysis> {
    try {
      // Get recent memory
      const recentMessages = await this.memoryService.getRecentContext(
        userId,
        planType,
        10
      );

      // Statistical analysis (fast)
      const stats = this.statisticalAnalysis(message);

      // LLM analysis for deeper understanding
      if (CONTEXT_CONFIG.USE_LLM_FOR_DEEP_ANALYSIS) {
        try {
          const llmAnalysis = await this.llmContextAnalysis(message, recentMessages);
          console.log('[ContextAnalyzer] ✅ LLM analysis successful');
          return this.mergeAnalysis(stats, llmAnalysis);
        } catch (error) {
          console.warn('[ContextAnalyzer] LLM analysis failed, using statistical:', error);
          return this.convertStatsToContextAnalysis(stats);
        }
      }

      return this.convertStatsToContextAnalysis(stats);
    } catch (error) {
      console.error('[ContextAnalyzer] Context analysis failed:', error);
      throw new Error('Failed to analyze context');
    }
  }

  /**
   * Quick analyze - Statistical only (no LLM)
   */
  async quickAnalyze(message: string): Promise<ContextAnalysis> {
    const stats = this.statisticalAnalysis(message);
    return this.convertStatsToContextAnalysis(stats);
  }

  /**
   * Get deep understanding of user's real concern
   * ✅ FIXED: Uses llmService instead of direct Anthropic
   */
  async getDeepUnderstanding(
    message: string,
    basicContext: ContextAnalysis
  ): Promise<DeepUnderstanding> {
    const prompt = `Analyze this user query deeply to understand their real concern:

Message: "${message}"
Basic Context: ${basicContext.questionType}, ${basicContext.userIntent}

Provide deep understanding in JSON ONLY (no other text):
{
  "surfaceQuestion": "What they literally asked",
  "realConcern": "What they're actually worried about",
  "emotionalNeed": "Their emotional state/need",
  "suggestedApproach": "Best way to help them",
  "confidence": 85
}`;

    try {
      const response = await this.llmService.generateCompletion(prompt);
      const parsed = this.parseJSONResponse(response);
      
      return {
        surfaceQuestion: parsed.surfaceQuestion || message,
        realConcern: parsed.realConcern || message,
        emotionalNeed: parsed.emotionalNeed,
        suggestedApproach: parsed.suggestedApproach || 'Provide helpful information',
        confidence: parsed.confidence || 70,
      };
    } catch (error) {
      console.warn('[ContextAnalyzer] Deep understanding failed:', error);
      // Return default
      return {
        surfaceQuestion: message,
        realConcern: message,
        suggestedApproach: 'Provide helpful information',
        confidence: 50,
      };
    }
  }

  /**
   * Statistical analysis (fast baseline)
   */
  statisticalAnalysis(message: string): {
    likelyType: QuestionType;
    intent: UserIntent;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    complexity: 'simple' | 'moderate' | 'complex';
    keywords: string[];
    entities: string[];
  } {
    const lower = message.toLowerCase();

    // Question type detection
    let likelyType: QuestionType = 'factual';

    if (lower.includes('how to') || lower.includes('how do i')) {
      likelyType = 'how_to';
    } else if (lower.includes('why')) {
      likelyType = 'why';
    } else if (
      lower.includes('vs') ||
      lower.includes('versus') ||
      lower.includes('better')
    ) {
      likelyType = 'comparison';
    } else if (lower.includes('should i') || lower.includes('advice')) {
      likelyType = 'advice';
    } else if (lower.includes('feel') || lower.includes('worried')) {
      likelyType = 'emotional_support';
    }
    if (lower.includes('error') || lower.includes('fix') || lower.includes('not working')) {
      likelyType = 'troubleshooting';
    }

    // Intent detection
    let intent: UserIntent = 'information_seeking';
    if (likelyType === 'how_to' || likelyType === 'troubleshooting') {
      intent = 'problem_solving';
    } else if (likelyType === 'comparison' || likelyType === 'advice') {
      intent = 'decision_making';
    } else if (lower.includes('learn') || lower.includes('understand')) {
      intent = 'learning';
    } else if (likelyType === 'emotional_support') {
      intent = 'emotional_support';
    }

    // Urgency detection
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (
      lower.includes('urgent') ||
      lower.includes('emergency') ||
      lower.includes('asap')
    ) {
      urgency = 'critical';
    } else if (lower.includes('soon') || lower.includes('quickly')) {
      urgency = 'high';
    } else if (lower.includes('help')) {
      urgency = 'medium';
    }

    // Complexity detection
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (message.length > 200 || message.split('.').length > 3) {
      complexity = 'complex';
    } else if (message.length > 100) {
      complexity = 'moderate';
    }

    // Extract keywords
    const keywords = message
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4 && !/^(this|that|what|with|from|have)$/.test(w))
      .slice(0, 10);

    // Extract entities (capitalized words)
    const entities = message
      .split(/\s+/)
      .filter((w) => /^[A-Z][a-z]+$/.test(w) && w.length > 3)
      .slice(0, 5);

    return {
      likelyType,
      intent,
      urgency,
      complexity,
      keywords,
      entities,
    };
  }

  /**
   * LLM context analysis
   * ✅ FIXED: Uses llmService instead of direct Anthropic
   */
  private async llmContextAnalysis(
    message: string,
    recentMessages: StoredMessage[]
  ): Promise<Partial<ContextAnalysis>> {
    const context =
      recentMessages.length > 0
        ? `Recent context:\n${recentMessages
            .slice(0, 5)
            .map((m) => `${m.role}: ${m.content.substring(0, 100)}`)
            .join('\n')}`
        : 'No previous context.';

    const prompt = `Analyze this user query in context:

Query: "${message}"

${context}

Provide analysis in JSON ONLY (no markdown, no explanation, just JSON):
{
  "questionType": "factual",
  "userIntent": "information_seeking",
  "underlyingConcern": "What's the real concern?",
  "urgency": "low",
  "requiresAnalogy": false,
  "requiresStepByStep": false,
  "requiresEmotionalSupport": false
}

Valid questionType: factual, how_to, why, comparison, advice, opinion, troubleshooting, creative, emotional_support
Valid userIntent: information_seeking, problem_solving, decision_making, learning, entertainment, emotional_support, casual_chat
Valid urgency: low, medium, high, critical`;

    const response = await this.llmService.generateCompletion(prompt);
    const parsed = this.parseJSONResponse(response);

    return {
      questionType: parsed.questionType as QuestionType,
      userIntent: parsed.userIntent as UserIntent,
      underlyingConcern: parsed.underlyingConcern,
      urgency: parsed.urgency,
      requiresAnalogy: parsed.requiresAnalogy,
      requiresStepByStep: parsed.requiresStepByStep,
      requiresEmotionalSupport: parsed.requiresEmotionalSupport,
    };
  }

  /**
   * ✅ NEW: Robust JSON parsing (same pattern as QueryProcessor)
   */
  private parseJSONResponse(response: string): any {
    // Strategy 1: Direct parse
    try {
      const trimmed = response.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return JSON.parse(trimmed);
      }
    } catch (e) {}

    // Strategy 2: Extract from markdown code blocks
    try {
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
      }
    } catch (e) {}

    // Strategy 3: Find balanced JSON
    try {
      const jsonStr = this.extractBalancedJSON(response);
      if (jsonStr) {
        return JSON.parse(jsonStr);
      }
    } catch (e) {}

    // Strategy 4: Aggressive cleanup
    try {
      const cleaned = response
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .replace(/^[^{]*/, '')
        .replace(/}[^}]*$/, '}')
        .trim();
      return JSON.parse(cleaned);
    } catch (e) {}

    throw new Error('Failed to parse JSON response');
  }

  /**
   * Extract balanced JSON from text
   */
  private extractBalancedJSON(text: string): string | null {
    let depth = 0;
    let start = -1;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          return text.substring(start, i + 1);
        }
      }
    }
    return null;
  }

  /**
   * Merge statistical and LLM analysis
   */
  private mergeAnalysis(
    stats: ReturnType<typeof this.statisticalAnalysis>,
    llm: Partial<ContextAnalysis>
  ): ContextAnalysis {
    return {
      questionType: llm.questionType || stats.likelyType,
      userIntent: llm.userIntent || stats.intent,
      underlyingConcern: llm.underlyingConcern,
      urgency: llm.urgency || stats.urgency,
      complexity: stats.complexity,
      requiresAnalogy: llm.requiresAnalogy || false,
      requiresStepByStep: llm.requiresStepByStep || false,
      requiresEmotionalSupport: llm.requiresEmotionalSupport || false,
      suggestedResponseStyle: {
        length: stats.complexity === 'simple' ? 'brief' : 'moderate',
        tone: llm.requiresEmotionalSupport ? 'empathetic' : 'casual',
        includeExamples: llm.requiresStepByStep || false,
        includeWarnings: stats.urgency === 'critical',
      },
      keywords: stats.keywords,
      entities: stats.entities,
    };
  }

  /**
   * Convert stats to ContextAnalysis
   */
  private convertStatsToContextAnalysis(
    stats: ReturnType<typeof this.statisticalAnalysis>
  ): ContextAnalysis {
    return {
      questionType: stats.likelyType,
      userIntent: stats.intent,
      urgency: stats.urgency,
      complexity: stats.complexity,
      requiresAnalogy: stats.complexity === 'complex',
      requiresStepByStep: stats.likelyType === 'how_to',
      requiresEmotionalSupport: stats.likelyType === 'emotional_support',
      suggestedResponseStyle: {
        length: stats.complexity === 'simple' ? 'brief' : 'moderate',
        tone: stats.likelyType === 'emotional_support' ? 'empathetic' : 'casual',
        includeExamples: stats.likelyType === 'how_to',
        includeWarnings: stats.urgency === 'critical',
      },
      keywords: stats.keywords,
      entities: stats.entities,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USER CONTEXT ANALYSIS METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get complete user context (profile + conversation + patterns)
   */
  async getUserContext(userId: string, planType: PlanType): Promise<DetailedUserContext> {
    try {
      const cached = this.contextCache.get(userId);
      if (cached && this.isCacheFresh(cached.timestamp)) {
        console.log('[ContextAnalyzer] ✅ Returning cached context');
        return cached.context;
      }

      console.log('[ContextAnalyzer] 🔍 Building user context...');

      const messages = await this.memoryService.retrieveMessages(userId, planType, {
        limit: 100,
      });

      const profile = await this.buildUserProfile(userId, planType, messages);
      const conversationContext = await this.extractConversationContext(messages);
      const topicPatterns = await this.detectTopicPatterns(messages);

      const context: DetailedUserContext = {
        userId,
        planType,
        profile,
        conversationContext,
        topicPatterns,
        lastUpdated: new Date(),
      };

      this.contextCache.set(userId, {
        context,
        timestamp: new Date(),
      });

      console.log('[ContextAnalyzer] ✅ Context built successfully');
      return context;
    } catch (error) {
      console.error('[ContextAnalyzer] ❌ Failed to get user context:', error);
      throw new Error('Failed to analyze user context');
    }
  }

  /**
   * Build user profile from conversation history
   */
  private async buildUserProfile(
    userId: string,
    planType: PlanType,
    messages: StoredMessage[]
  ): Promise<UserProfile> {
    try {
      console.log('[ContextAnalyzer] 📊 Building profile (hybrid mode)...');

      const stats = this.calculateBasicStats(messages);
      const statisticalProfile = this.buildStatisticalProfile(messages, stats);

      if (
        messages.length >= CONTEXT_CONFIG.MIN_MESSAGES_FOR_LLM &&
        CONTEXT_CONFIG.USE_LLM_FOR_DEEP_ANALYSIS
      ) {
        console.log('[ContextAnalyzer] 🤖 Enhancing with LLM analysis...');
        const llmProfile = await this.enhanceProfileWithLLM(messages, statisticalProfile);
        return llmProfile;
      }

      console.log('[ContextAnalyzer] ✅ Profile built (statistical only)');
      return statisticalProfile;
    } catch (error) {
      console.error('[ContextAnalyzer] ❌ Profile building failed:', error);
      throw error;
    }
  }

  private calculateBasicStats(messages: StoredMessage[]) {
    const userMessages = messages.filter((m) => m.role === 'user');
    const totalMessages = messages.length;
    const avgLength =
      userMessages.reduce((sum, m) => sum + m.content.length, 0) /
      (userMessages.length || 1);

    return {
      totalMessages,
      userMessageCount: userMessages.length,
      avgMessageLength: Math.round(avgLength),
    };
  }

  private buildStatisticalProfile(
    messages: StoredMessage[],
    stats: {
      totalMessages: number;
      userMessageCount: number;
      avgMessageLength: number;
    }
  ): UserProfile {
    const userMessages = messages.filter((m) => m.role === 'user');

    return {
      conversationStyle: this.detectConversationStyleBasic(
        userMessages,
        stats.avgMessageLength
      ),
      interests: this.extractInterestsBasic(userMessages),
      emotionalBaseline: this.detectEmotionalBaseline(messages),
      expertiseLevel: this.assessExpertiseLevelBasic(userMessages, stats.avgMessageLength),
      communicationPreferences: this.extractPreferencesBasic(userMessages),
      activityPattern: this.detectActivityPattern(messages),
      totalInteractions: stats.totalMessages,
      avgMessageLength: stats.avgMessageLength,
      profileConfidence: this.calculateProfileConfidence(stats.totalMessages),
    };
  }

  /**
   * Enhance profile with LLM
   * ✅ FIXED: Uses llmService instead of direct Anthropic
   */
  private async enhanceProfileWithLLM(
    messages: StoredMessage[],
    baseProfile: UserProfile
  ): Promise<UserProfile> {
    try {
      const recentMessages = messages.slice(0, 30);
      const conversationText = recentMessages
        .map((m) => `${m.role}: ${m.content.substring(0, 100)}`)
        .join('\n');

      const prompt = `Analyze this conversation history to understand the user's profile.

Conversation History (recent messages):
${conversationText}

Current Analysis:
- Style: ${baseProfile.conversationStyle}
- Interests: ${baseProfile.interests.join(', ') || 'unknown'}
- Expertise: ${baseProfile.expertiseLevel}

Provide refined analysis in JSON ONLY:
{
  "conversationStyle": "casual",
  "interests": ["interest1", "interest2"],
  "expertiseLevel": "intermediate"
}

Valid conversationStyle: casual, formal, technical, friendly, neutral
Valid expertiseLevel: beginner, intermediate, advanced`;

      const response = await this.llmService.generateCompletion(prompt);
      const parsed = this.parseJSONResponse(response);

      console.log('[ContextAnalyzer] ✅ Profile enhanced with LLM');

      return {
        ...baseProfile,
        conversationStyle: parsed.conversationStyle || baseProfile.conversationStyle,
        interests:
          parsed.interests && parsed.interests.length > 0
            ? parsed.interests
            : baseProfile.interests,
        expertiseLevel: parsed.expertiseLevel || baseProfile.expertiseLevel,
        profileConfidence: Math.min(100, baseProfile.profileConfidence + 20),
      };
    } catch (error) {
      console.warn('[ContextAnalyzer] ⚠️ LLM enhancement failed, using base profile:', error);
      return baseProfile;
    }
  }

  private detectConversationStyleBasic(
    messages: StoredMessage[],
    avgLength: number
  ): ConversationStyle {
    if (messages.length === 0) return 'neutral';

    const casualIndicators = ['lol', 'haha', 'btw', 'omg', '😊', '👍'];
    const formalIndicators = ['kindly', 'please', 'thank you', 'appreciate', 'regarding'];
    const technicalIndicators = ['function', 'api', 'code', 'error', 'debug', 'algorithm'];

    let casualScore = 0;
    let formalScore = 0;
    let technicalScore = 0;

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      casualIndicators.forEach((ind) => {
        if (content.includes(ind)) casualScore++;
      });
      formalIndicators.forEach((ind) => {
        if (content.includes(ind)) formalScore++;
      });
      technicalIndicators.forEach((ind) => {
        if (content.includes(ind)) technicalScore++;
      });
    });

    if (technicalScore > casualScore && technicalScore > formalScore) return 'technical';
    if (avgLength < 50 && casualScore > formalScore) return 'casual';
    if (avgLength > 100 && formalScore > casualScore) return 'formal';
    if (casualScore > formalScore * 2) return 'friendly';

    return 'neutral';
  }

  private extractInterestsBasic(messages: StoredMessage[]): string[] {
    const interests = new Set<string>();
    const topicCategories = {
      programming: ['code', 'programming', 'developer', 'software'],
      design: ['design', 'ui', 'ux', 'creative'],
      business: ['business', 'startup', 'entrepreneur'],
      learning: ['learn', 'study', 'course', 'education'],
    };

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      Object.entries(topicCategories).forEach(([category, keywords]) => {
        if (keywords.some((kw) => content.includes(kw))) {
          interests.add(category);
        }
      });
    });

    return Array.from(interests);
  }

  private detectEmotionalBaseline(messages: StoredMessage[]): EmotionType {
    const emotions = messages
      .filter((m) => m.emotion)
      .map((m) => m.emotion as EmotionType);

    if (emotions.length === 0) return 'neutral';

    const emotionCounts = new Map<EmotionType, number>();
    emotions.forEach((emotion) => {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    });

    let maxEmotion: EmotionType = 'neutral';
    let maxCount = 0;

    emotionCounts.forEach((count, emotion) => {
      if (count > maxCount) {
        maxCount = count;
        maxEmotion = emotion;
      }
    });

    return maxEmotion;
  }

  private assessExpertiseLevelBasic(
    messages: StoredMessage[],
    avgLength: number
  ): 'beginner' | 'intermediate' | 'advanced' {
    if (messages.length === 0) return 'beginner';

    const advancedTerms = [
      'algorithm',
      'architecture',
      'optimization',
      'scalability',
      'kubernetes',
      'microservices',
    ];

    let advancedScore = 0;
    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      advancedTerms.forEach((term) => {
        if (content.includes(term)) advancedScore++;
      });
    });

    if (advancedScore > 5 && avgLength > 100) return 'advanced';
    if (advancedScore > 2 || avgLength > 75) return 'intermediate';
    return 'beginner';
  }

  private extractPreferencesBasic(messages: StoredMessage[]): {
    prefersDetailedExplanations: boolean;
    prefersExamples: boolean;
    prefersStepByStep: boolean;
  } {
    const avgLength =
      messages.reduce((sum, m) => sum + m.content.length, 0) / (messages.length || 1);

    let detailedCount = 0;
    let exampleCount = 0;
    let stepCount = 0;

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      if (['explain', 'detail', 'elaborate'].some((k) => content.includes(k)))
        detailedCount++;
      if (['example', 'show me', 'demonstrate'].some((k) => content.includes(k)))
        exampleCount++;
      if (['step', 'guide', 'how to'].some((k) => content.includes(k))) stepCount++;
    });

    return {
      prefersDetailedExplanations: avgLength > 100 || detailedCount > 2,
      prefersExamples: exampleCount > 2,
      prefersStepByStep: stepCount > 2,
    };
  }

  private detectActivityPattern(
    messages: StoredMessage[]
  ): 'morning' | 'afternoon' | 'evening' | 'night' | 'mixed' {
    if (messages.length < 10) return 'mixed';

    const periodCounts = new Map<string, number>();

    messages.forEach((msg) => {
      const hour = msg.timestamp.getHours();
      let period: string;

      if (hour >= 5 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 17) period = 'afternoon';
      else if (hour >= 17 && hour < 21) period = 'evening';
      else period = 'night';

      periodCounts.set(period, (periodCounts.get(period) || 0) + 1);
    });

    let maxPeriod = 'mixed';
    let maxCount = 0;

    periodCounts.forEach((count, period) => {
      if (count > maxCount) {
        maxCount = count;
        maxPeriod = period;
      }
    });

    if (maxCount < messages.length * 0.4) return 'mixed';
    return maxPeriod as any;
  }

  private calculateProfileConfidence(messageCount: number): number {
    if (messageCount < CONTEXT_CONFIG.MIN_MESSAGES_FOR_PROFILE) {
      return Math.round(
        (messageCount / CONTEXT_CONFIG.MIN_MESSAGES_FOR_PROFILE) * 100
      );
    }

    const confidence = Math.min(100, 50 + messageCount / 2);
    return Math.round(confidence);
  }

  private async extractConversationContext(
    messages: StoredMessage[]
  ): Promise<ConversationContext> {
    const recentMessages = messages
      .slice(0, CONTEXT_CONFIG.MAX_CONTEXT_MESSAGES)
      .reverse();

    const baseContext = this.extractContextStatistical(recentMessages);

    if (
      CONTEXT_CONFIG.USE_LLM_FOR_DEEP_ANALYSIS &&
      recentMessages.length >= CONTEXT_CONFIG.MIN_MESSAGES_FOR_LLM
    ) {
      try {
        const enhancedTopic = await this.enhanceTopicWithLLM(recentMessages.slice(-5));
        baseContext.currentTopic = enhancedTopic || baseContext.currentTopic;
      } catch (error) {
        console.warn('[ContextAnalyzer] ⚠️ Topic enhancement failed, using statistical');
      }
    }

    return baseContext;
  }

  private extractContextStatistical(messages: StoredMessage[]): ConversationContext {
    return {
      currentTopic: this.identifyTopicBasic(messages.slice(-5)),
      recentMessages: messages.map((m) => ({
        role: m.role,
        content: m.content.slice(0, 100),
        timestamp: m.timestamp,
      })),
      ongoingQuestions: messages
        .filter((m) => m.role === 'user' && m.content.includes('?'))
        .map((m) => m.content)
        .slice(-3),
      recentEntities: this.extractEntitiesBasic(messages.slice(-10)),
      activeThreads: [],
    };
  }

  /**
   * Enhance topic with LLM
   * ✅ FIXED: Uses llmService instead of direct Anthropic
   */
  private async enhanceTopicWithLLM(messages: StoredMessage[]): Promise<string> {
    const conversation = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

    const prompt = `Identify the main topic of this conversation in 1-3 words.

Conversation:
${conversation}

Output ONLY the topic (e.g., "web development", "career advice", "technical debugging"):`;

    const response = await this.llmService.generateCompletion(prompt);
    return response.trim().toLowerCase().replace(/['"]/g, '');
  }

  private identifyTopicBasic(messages: StoredMessage[]): string {
    if (messages.length === 0) return 'general';

    const allText = messages.map((m) => m.content).join(' ').toLowerCase();

    const topics = {
      programming: ['code', 'programming', 'function', 'bug'],
      design: ['design', 'ui', 'layout', 'colors'],
      career: ['career', 'job', 'interview', 'resume'],
      learning: ['learn', 'understand', 'explain', 'teach'],
    };

    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.filter((kw) => allText.includes(kw)).length >= 2) {
        return topic;
      }
    }

    return 'general';
  }

  private extractEntitiesBasic(messages: StoredMessage[]): string[] {
    const entities = new Set<string>();
    const allText = messages.map((m) => m.content).join(' ');
    const words = allText.split(/\s+/);

    words.forEach((word) => {
      if (/^[A-Z][a-z]+$/.test(word) && word.length > 3) {
        entities.add(word);
      }
    });

    return Array.from(entities).slice(0, 10);
  }

  private async detectTopicPatterns(messages: StoredMessage[]): Promise<TopicPattern[]> {
    const patterns = this.detectPatternsStatistical(messages);
    return patterns;
  }

  private detectPatternsStatistical(messages: StoredMessage[]): TopicPattern[] {
    const topicMap = new Map<string, { count: number; recent: Date }>();

    const topics = {
      programming: ['code', 'programming', 'function', 'bug', 'api'],
      design: ['design', 'ui', 'layout', 'ux'],
      career: ['career', 'job', 'interview'],
      learning: ['learn', 'study', 'understand'],
    };

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();

      Object.entries(topics).forEach(([topic, keywords]) => {
        if (keywords.some((kw) => content.includes(kw))) {
          const existing = topicMap.get(topic);
          if (existing) {
            existing.count++;
            if (msg.timestamp > existing.recent) {
              existing.recent = msg.timestamp;
            }
          } else {
            topicMap.set(topic, { count: 1, recent: msg.timestamp });
          }
        }
      });
    });

    const patterns: TopicPattern[] = [];
    topicMap.forEach((data, topic) => {
      if (data.count >= 3) {
        patterns.push({
          topic,
          frequency: data.count,
          lastMentioned: data.recent,
          trend: this.calculateTrend(data.count, messages.length),
        });
      }
    });

    patterns.sort((a, b) => b.frequency - a.frequency);
    return patterns;
  }

  private calculateTrend(
    count: number,
    total: number
  ): 'increasing' | 'stable' | 'decreasing' {
    const percentage = (count / total) * 100;
    if (percentage > 30) return 'increasing';
    if (percentage > 15) return 'stable';
    return 'decreasing';
  }

  private isCacheFresh(timestamp: Date): boolean {
    const now = Date.now();
    const age = now - timestamp.getTime();
    const ttlMs = CONTEXT_CONFIG.CACHE_TTL_MINUTES * 60 * 1000;
    return age < ttlMs;
  }

  public clearCache(userId?: string): void {
    if (userId) {
      this.contextCache.delete(userId);
      console.log(`[ContextAnalyzer] 🧹 Cache cleared for user: ${userId}`);
    } else {
      this.contextCache.clear();
      console.log('[ContextAnalyzer] 🧹 All cache cleared');
    }
  }

  public getCacheStats(): { size: number; users: string[] } {
    return {
      size: this.contextCache.size,
      users: Array.from(this.contextCache.keys()),
    };
  }
}

export default ContextAnalyzerService;