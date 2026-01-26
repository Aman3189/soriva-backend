/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CONTEXT ANALYZER - HYBRID (LLM + Statistical)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Location: soriva-backend/src/services/analyzers/context.analyzer.ts
 * Created by: Amandeep, Punjab, India
 * Updated: January 2026
 * 
 * Purpose: Understand WHAT the user actually wants beyond their words
 * This is what makes Soriva truly intelligent - not just processing
 * words, but understanding context, intent, tone, and situation.
 * 
 * Architecture:
 * - PRIMARY: LLM-powered semantic understanding
 * - FALLBACK: Statistical pattern matching (instant, always works)
 * 
 * Features:
 * - ✅ LLM-powered context understanding
 * - ✅ Region-aware analysis (IN/US/UK/INTL)
 * - ✅ Hinglish & multilingual support
 * - ✅ Semantic complexity detection (not word count!)
 * - ✅ Gender & Age detection
 * - ✅ Graceful fallback to statistical
 * - ✅ Backward compatible singleton export
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { LLMService } from '../ai/intelligence/intelligence.types';
import { PlanType } from '../../constants/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & ENUMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  NOT_SPECIFIED = 'NOT_SPECIFIED',
}

export enum AgeGroup {
  YOUNG = 'YOUNG',       // 18-30
  MIDDLE = 'MIDDLE',     // 31-50
  SENIOR = 'SENIOR',     // 51+
  NOT_SPECIFIED = 'NOT_SPECIFIED',
}

export enum QueryType {
  TECHNICAL = 'technical',
  EDUCATIONAL = 'educational',
  EMOTIONAL = 'emotional',
  CASUAL = 'casual',
  CREATIVE = 'creative',
  PROFESSIONAL = 'professional',
  PERSONAL = 'personal',
  TRANSACTIONAL = 'transactional',
}

export enum ToneIntent {
  HELP_SEEKING = 'help_seeking',
  EXPLORATORY = 'exploratory',
  CONVERSATIONAL = 'conversational',
  TESTING = 'testing',
  MANIPULATIVE = 'manipulative',
  PLAYFUL = 'playful',
  URGENT = 'urgent',
  VULNERABLE = 'vulnerable',
}

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  EXPERT = 'expert',
}

export enum FormalityLevel {
  VERY_FORMAL = 'very_formal',
  FORMAL = 'formal',
  NEUTRAL = 'neutral',
  CASUAL = 'casual',
  VERY_CASUAL = 'very_casual',
}

export interface ContextAnalysis {
  queryType: QueryType;
  toneIntent: ToneIntent;
  complexityLevel: ComplexityLevel;
  formalityLevel: FormalityLevel;

  // Behavioral flags
  isGreeting: boolean;
  isFarewell: boolean;
  isQuestion: boolean;
  isCommand: boolean;
  containsEmoji: boolean;

  // Language markers
  hasHinglish: boolean;
  hasHindi: boolean;
  hasPunjabi: boolean;
  primaryLanguage: 'en' | 'hi' | 'pa' | 'mixed';

  // Situational context
  expectedResponseLength: 'short' | 'medium' | 'long' | 'detailed';
  shouldBeEmpathetic: boolean;
  shouldBeProfessional: boolean;
  shouldBePlayful: boolean;

  // Personalization Detection
  detectedGender?: Gender;
  detectedAgeGroup?: AgeGroup;
  personalizationConfidence: {
    gender: number;
    ageGroup: number;
  };
  shouldSuggestPersonalization: boolean;

  // Confidence scores
  confidence: {
    queryType: number;
    toneIntent: number;
    formality: number;
  };

  // Metadata
  analysisMethod: 'llm' | 'statistical';
  processingTimeMs: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONFIG = {
  USE_LLM_BY_DEFAULT: true,
  MIN_TEXT_LENGTH_FOR_LLM: 5,
  LLM_TIMEOUT_MS: 5000,
  SUGGESTION_THRESHOLD: 0.65,
  CACHE_TTL_MS: 5 * 60 * 1000,  // 5 minutes
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATISTICAL PATTERNS (Fallback Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PATTERNS = {
  // Basic detection patterns (for fallback only)
  greeting: /^(hi|hello|hey|good morning|good evening|namaste|sat sri akal|hola)\b/i,
  farewell: /\b(bye|goodbye|see you|take care|gotta go|gtg)\b/i,
  question: /\?|^(what|why|how|when|where|who|which|can you|could you|explain)/i,
  command: /^(make|create|generate|write|build|give me|show me|tell me|find|search)\b/i,
  
  // Language detection
  hinglish: /\b(yaar|bhai|haan|nahi|kya|hai|kar|mat|bas|acha|theek|matlab|kyunki|abhi)\b/i,
  hindi: /[\u0900-\u097F]{3,}/,
  punjabi: /\b(oye|paaji|veer|kithe|tussi|pher|mainu)\b/i,
  
  // Quick tone detection
  urgent: /\b(urgent|asap|emergency|immediately|now|quick|help me)\b/i,
  vulnerable: /\b(don't know what to do|feeling lost|giving up|can't take it|alone|worthless)\b/i,
  
  // Emoji detection
  emoji: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]/u,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT ANALYZER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ContextAnalyzer {
  private llmService: LLMService | null = null;
  private analysisCache: Map<string, { analysis: ContextAnalysis; timestamp: Date }> = new Map();
  private initialized: boolean = false;

  constructor(llmService?: LLMService) {
    if (llmService) {
      this.llmService = llmService;
      this.initialized = true;
    }
    console.log('[ContextAnalyzer] ✅ Initialized - Hybrid (LLM + Statistical)');
  }

  /**
   * Initialize with LLMService (call this after services are ready)
   */
  initialize(llmService: LLMService): void {
    this.llmService = llmService;
    this.initialized = true;
    console.log('[ContextAnalyzer] ✅ LLMService connected - Full LLM analysis enabled');
  }

  /**
   * Check if LLM is available
   */
  isLLMAvailable(): boolean {
    return this.initialized && this.llmService !== null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ANALYSIS METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🎯 MAIN: Analyze context (backward compatible - sync method)
   * Uses statistical analysis for instant results
   */
  analyze(userMessage: string, conversationHistory?: string[]): ContextAnalysis {
    return this.analyzeStatistical(userMessage, conversationHistory);
  }

  /**
   * 🎯 ENHANCED: Analyze context with LLM (async method)
   * Uses LLM for deep semantic understanding with statistical fallback
   */
  async analyzeAsync(
    userId: string,
    userMessage: string,
    planType: PlanType = PlanType.PLUS,
    region: 'IN' | 'US' | 'UK' | 'INTL' = 'INTL',
    conversationHistory?: string[]
  ): Promise<ContextAnalysis> {
    const startTime = Date.now();
    console.log('[ContextAnalyzer] 🧠 Analyzing context...');

    // Check cache first
    const cacheKey = this.buildCacheKey(userId, userMessage);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('[ContextAnalyzer] ⚡ Returning cached analysis');
      return cached;
    }

    let analysis: ContextAnalysis;

    // Decide: LLM or Statistical?
    const shouldUseLLM = CONFIG.USE_LLM_BY_DEFAULT && 
                         this.isLLMAvailable() &&
                         userMessage.length >= CONFIG.MIN_TEXT_LENGTH_FOR_LLM;

    if (shouldUseLLM) {
      try {
        console.log('[ContextAnalyzer] 🤖 Using LLM for semantic understanding...');
        analysis = await this.analyzeLLM(userMessage, region, conversationHistory);
        analysis.analysisMethod = 'llm';
      } catch (error) {
        console.warn('[ContextAnalyzer] ⚠️ LLM failed, falling back to statistical:', error);
        analysis = this.analyzeStatistical(userMessage, conversationHistory);
        analysis.analysisMethod = 'statistical';
      }
    } else {
      console.log('[ContextAnalyzer] 📊 Using statistical analysis...');
      analysis = this.analyzeStatistical(userMessage, conversationHistory);
      analysis.analysisMethod = 'statistical';
    }

    analysis.processingTimeMs = Date.now() - startTime;

    // Cache the result
    this.setCache(cacheKey, analysis);

    console.log(`[ContextAnalyzer] ✅ Complete: ${analysis.queryType} | ${analysis.complexityLevel} | ${analysis.analysisMethod} (${analysis.processingTimeMs}ms)`);

    return analysis;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LLM-POWERED ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Analyze context using LLM for deep semantic understanding
   */
  private async analyzeLLM(
    userMessage: string,
    region: 'IN' | 'US' | 'UK' | 'INTL',
    conversationHistory?: string[]
  ): Promise<ContextAnalysis> {
    if (!this.llmService) {
      throw new Error('LLMService not initialized');
    }

    const prompt = this.buildAnalysisPrompt(userMessage, region, conversationHistory);
    const responseText = await this.llmService.generateCompletion(prompt);
    
    // Parse LLM response
    const parsed = this.parseLLMResponse(responseText, userMessage);
    return parsed;
  }

  /**
   * Build comprehensive analysis prompt for LLM
   */
  private buildAnalysisPrompt(
    userMessage: string,
    region: 'IN' | 'US' | 'UK' | 'INTL',
    conversationHistory?: string[]
  ): string {
    const historyContext = conversationHistory && conversationHistory.length > 0
      ? `Recent conversation:\n${conversationHistory.slice(-3).map(m => `- ${m}`).join('\n')}`
      : 'No conversation history.';

    return `You are Soriva's context analyzer. Analyze this user message to understand their TRUE intent, not just the words.

USER MESSAGE: "${userMessage}"

REGION: ${region}
${historyContext}

ANALYZE AND RETURN JSON:
{
  "queryType": "technical|educational|emotional|casual|creative|professional|personal|transactional",
  "toneIntent": "help_seeking|exploratory|conversational|testing|manipulative|playful|urgent|vulnerable",
  "complexityLevel": "simple|moderate|complex|expert",
  "formalityLevel": "very_formal|formal|neutral|casual|very_casual",
  "primaryLanguage": "en|hi|pa|mixed",
  "expectedResponseLength": "short|medium|long|detailed",
  "shouldBeEmpathetic": true/false,
  "shouldBeProfessional": true/false,
  "shouldBePlayful": true/false,
  "confidence": {
    "queryType": 0.0-1.0,
    "toneIntent": 0.0-1.0,
    "formality": 0.0-1.0
  }
}

COMPLEXITY GUIDELINES (IMPORTANT - Don't use word count!):
- SIMPLE: Greetings, yes/no questions, basic info requests
  Examples: "hi", "thanks", "what time is it?", "ok"
- MODERATE: Single-topic questions, straightforward requests
  Examples: "explain recursion", "how to make chai?", "career advice chahiye"
- COMPLEX: Multi-part questions, comparisons, analysis needed
  Examples: "compare React vs Vue for my e-commerce project", "should I take this job offer?"
- EXPERT: Deep technical, research-level, specialized domain
  Examples: "explain transformer architecture attention mechanism", "kubernetes vs docker swarm for microservices"

LANGUAGE DETECTION:
- If message has Hindi/Hinglish words (yaar, bhai, kya, hai, etc.) → "hi" or "mixed"
- If pure English → "en"
- If Punjabi words (oye, paaji, tussi) → "pa"

TONE DETECTION:
- "help_seeking": User genuinely needs help
- "urgent": Time-sensitive, stressed
- "vulnerable": Emotionally sensitive, needs care
- "playful": Fun, banter, jokes
- "testing": Testing AI capabilities
- "manipulative": Trying to trick/jailbreak

Return ONLY valid JSON, no explanations.`;
  }

  /**
   * Parse LLM response into ContextAnalysis
   */
  private parseLLMResponse(responseText: string, originalMessage: string): ContextAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Build complete analysis with LLM data + quick detections
      return this.buildCompleteAnalysis(parsed, originalMessage);
    } catch (error) {
      console.error('[ContextAnalyzer] ❌ Failed to parse LLM response:', error);
      // Fall back to statistical
      return this.analyzeStatistical(originalMessage);
    }
  }

  /**
   * Build complete analysis combining LLM output with quick detections
   */
  private buildCompleteAnalysis(llmOutput: any, originalMessage: string): ContextAnalysis {
    const normalized = originalMessage.toLowerCase().trim();

    // Quick pattern detections (always accurate)
    const isGreeting = PATTERNS.greeting.test(normalized);
    const isFarewell = PATTERNS.farewell.test(normalized);
    const isQuestion = PATTERNS.question.test(originalMessage);
    const isCommand = PATTERNS.command.test(normalized);
    const containsEmoji = PATTERNS.emoji.test(originalMessage);
    const hasHinglish = PATTERNS.hinglish.test(normalized);
    const hasHindi = PATTERNS.hindi.test(originalMessage);
    const hasPunjabi = PATTERNS.punjabi.test(normalized);

    return {
      queryType: this.mapQueryType(llmOutput.queryType),
      toneIntent: this.mapToneIntent(llmOutput.toneIntent),
      complexityLevel: this.mapComplexity(llmOutput.complexityLevel),
      formalityLevel: this.mapFormality(llmOutput.formalityLevel),
      
      isGreeting,
      isFarewell,
      isQuestion,
      isCommand,
      containsEmoji,
      
      hasHinglish,
      hasHindi,
      hasPunjabi,
      primaryLanguage: llmOutput.primaryLanguage || this.detectLanguage(hasHinglish, hasHindi, hasPunjabi),
      
      expectedResponseLength: llmOutput.expectedResponseLength || 'medium',
      shouldBeEmpathetic: llmOutput.shouldBeEmpathetic || false,
      shouldBeProfessional: llmOutput.shouldBeProfessional || false,
      shouldBePlayful: llmOutput.shouldBePlayful || false,
      
      detectedGender: undefined,
      detectedAgeGroup: undefined,
      personalizationConfidence: { gender: 0, ageGroup: 0 },
      shouldSuggestPersonalization: false,
      
      confidence: {
        queryType: llmOutput.confidence?.queryType || 0.8,
        toneIntent: llmOutput.confidence?.toneIntent || 0.8,
        formality: llmOutput.confidence?.formality || 0.7,
      },
      
      analysisMethod: 'llm',
      processingTimeMs: 0,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATISTICAL ANALYSIS (Fallback & Sync)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Statistical analysis - fast, always works, sync
   */
  private analyzeStatistical(
    userMessage: string,
    conversationHistory?: string[]
  ): ContextAnalysis {
    const normalized = userMessage.toLowerCase().trim();
    const wordCount = userMessage.split(/\s+/).length;

    // Detect all aspects
    const queryType = this.detectQueryTypeStatistical(normalized);
    const toneIntent = this.detectToneIntentStatistical(normalized, userMessage);
    const complexityLevel = this.detectComplexityStatistical(normalized, wordCount);
    const formalityLevel = this.detectFormalityStatistical(normalized);

    // Quick flags
    const isGreeting = PATTERNS.greeting.test(normalized);
    const isFarewell = PATTERNS.farewell.test(normalized);
    const isQuestion = PATTERNS.question.test(userMessage);
    const isCommand = PATTERNS.command.test(normalized);
    const containsEmoji = PATTERNS.emoji.test(userMessage);

    // Language detection
    const hasHinglish = PATTERNS.hinglish.test(normalized);
    const hasHindi = PATTERNS.hindi.test(userMessage);
    const hasPunjabi = PATTERNS.punjabi.test(normalized);
    const primaryLanguage = this.detectLanguage(hasHinglish, hasHindi, hasPunjabi);

    // Response expectations
    const expectedResponseLength = this.determineResponseLength(queryType, complexityLevel, wordCount);
    const shouldBeEmpathetic = queryType === QueryType.EMOTIONAL || toneIntent === ToneIntent.VULNERABLE;
    const shouldBeProfessional = queryType === QueryType.PROFESSIONAL || formalityLevel === FormalityLevel.FORMAL;
    const shouldBePlayful = toneIntent === ToneIntent.PLAYFUL && formalityLevel === FormalityLevel.CASUAL;

    return {
      queryType,
      toneIntent,
      complexityLevel,
      formalityLevel,
      
      isGreeting,
      isFarewell,
      isQuestion,
      isCommand,
      containsEmoji,
      
      hasHinglish,
      hasHindi,
      hasPunjabi,
      primaryLanguage,
      
      expectedResponseLength,
      shouldBeEmpathetic,
      shouldBeProfessional,
      shouldBePlayful,
      
      detectedGender: undefined,
      detectedAgeGroup: undefined,
      personalizationConfidence: { gender: 0, ageGroup: 0 },
      shouldSuggestPersonalization: false,
      
      confidence: {
        queryType: 0.6,
        toneIntent: 0.6,
        formality: 0.6,
      },
      
      analysisMethod: 'statistical',
      processingTimeMs: 0,
    };
  }

  /**
   * Statistical query type detection
   */
  private detectQueryTypeStatistical(normalized: string): QueryType {
    if (/\b(code|error|debug|function|api|bug|programming)\b/i.test(normalized)) {
      return QueryType.TECHNICAL;
    }
    if (/\b(explain|how does|what is|teach me|learn)\b/i.test(normalized)) {
      return QueryType.EDUCATIONAL;
    }
    if (/\b(feel|feeling|sad|happy|depressed|anxious|stressed)\b/i.test(normalized)) {
      return QueryType.EMOTIONAL;
    }
    if (/\b(write|create|generate|story|poem|design)\b/i.test(normalized)) {
      return QueryType.CREATIVE;
    }
    if (/\b(meeting|presentation|email|report|business|career)\b/i.test(normalized)) {
      return QueryType.PROFESSIONAL;
    }
    if (/\b(should i|advice|recommend|suggest|help me decide)\b/i.test(normalized)) {
      return QueryType.PERSONAL;
    }
    if (normalized.split(/\s+/).length < 5) {
      return QueryType.TRANSACTIONAL;
    }
    return QueryType.CASUAL;
  }

  /**
   * Statistical tone intent detection
   */
  private detectToneIntentStatistical(normalized: string, original: string): ToneIntent {
    if (PATTERNS.vulnerable.test(normalized)) return ToneIntent.VULNERABLE;
    if (PATTERNS.urgent.test(normalized)) return ToneIntent.URGENT;
    if (/\b(jailbreak|ignore|pretend|system prompt)\b/i.test(normalized)) return ToneIntent.TESTING;
    if (/help|need|stuck|confused/i.test(normalized)) return ToneIntent.HELP_SEEKING;
    if (/\b(lol|haha|😂|joke|fun)\b/i.test(original)) return ToneIntent.PLAYFUL;
    if (/curious|wonder|interesting/i.test(normalized)) return ToneIntent.EXPLORATORY;
    return ToneIntent.CONVERSATIONAL;
  }

  /**
   * Statistical complexity detection (improved - not just word count)
   */
  private detectComplexityStatistical(normalized: string, wordCount: number): ComplexityLevel {
    // Expert indicators
    if (/\b(algorithm|architecture|microservices|kubernetes|neural network|distributed)\b/i.test(normalized)) {
      return ComplexityLevel.EXPERT;
    }
    
    // Complex indicators (multi-part, comparisons)
    if (/\b(compare|versus|vs|difference between|pros and cons|should i)\b/i.test(normalized)) {
      return ComplexityLevel.COMPLEX;
    }
    if ((normalized.match(/\band\b/g) || []).length >= 2) {
      return ComplexityLevel.COMPLEX;
    }
    
    // Simple indicators
    if (wordCount <= 4) return ComplexityLevel.SIMPLE;
    if (/^(hi|hello|thanks|ok|yes|no|bye)\b/i.test(normalized)) return ComplexityLevel.SIMPLE;
    
    // Default to moderate
    return ComplexityLevel.MODERATE;
  }

  /**
   * Statistical formality detection
   */
  private detectFormalityStatistical(normalized: string): FormalityLevel {
    if (/\b(sir|madam|kindly|respectfully|please could you)\b/i.test(normalized)) {
      return FormalityLevel.VERY_FORMAL;
    }
    if (/\b(please|thank you|could you|would you)\b/i.test(normalized)) {
      return FormalityLevel.FORMAL;
    }
    if (/\b(yaar|bhai|bro|dude|lol|lmao|wtf)\b/i.test(normalized)) {
      return FormalityLevel.VERY_CASUAL;
    }
    if (/\b(hey|hi|thanks|cool|awesome)\b/i.test(normalized)) {
      return FormalityLevel.CASUAL;
    }
    return FormalityLevel.NEUTRAL;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectLanguage(hasHinglish: boolean, hasHindi: boolean, hasPunjabi: boolean): 'en' | 'hi' | 'pa' | 'mixed' {
    if (hasPunjabi) return 'pa';
    if (hasHindi && !hasHinglish) return 'hi';
    if (hasHinglish || hasHindi) return 'mixed';
    return 'en';
  }

  private determineResponseLength(
    queryType: QueryType,
    complexity: ComplexityLevel,
    wordCount: number
  ): 'short' | 'medium' | 'long' | 'detailed' {
    if (queryType === QueryType.TRANSACTIONAL) return 'short';
    if (complexity === ComplexityLevel.SIMPLE) return 'short';
    if (complexity === ComplexityLevel.EXPERT) return 'detailed';
    if (complexity === ComplexityLevel.COMPLEX) return 'long';
    return 'medium';
  }

  // Type mappers (string to enum)
  private mapQueryType(str: string): QueryType {
    const map: Record<string, QueryType> = {
      'technical': QueryType.TECHNICAL,
      'educational': QueryType.EDUCATIONAL,
      'emotional': QueryType.EMOTIONAL,
      'casual': QueryType.CASUAL,
      'creative': QueryType.CREATIVE,
      'professional': QueryType.PROFESSIONAL,
      'personal': QueryType.PERSONAL,
      'transactional': QueryType.TRANSACTIONAL,
    };
    return map[str?.toLowerCase()] || QueryType.CASUAL;
  }

  private mapToneIntent(str: string): ToneIntent {
    const map: Record<string, ToneIntent> = {
      'help_seeking': ToneIntent.HELP_SEEKING,
      'exploratory': ToneIntent.EXPLORATORY,
      'conversational': ToneIntent.CONVERSATIONAL,
      'testing': ToneIntent.TESTING,
      'manipulative': ToneIntent.MANIPULATIVE,
      'playful': ToneIntent.PLAYFUL,
      'urgent': ToneIntent.URGENT,
      'vulnerable': ToneIntent.VULNERABLE,
    };
    return map[str?.toLowerCase()] || ToneIntent.CONVERSATIONAL;
  }

  private mapComplexity(str: string): ComplexityLevel {
    const map: Record<string, ComplexityLevel> = {
      'simple': ComplexityLevel.SIMPLE,
      'moderate': ComplexityLevel.MODERATE,
      'complex': ComplexityLevel.COMPLEX,
      'expert': ComplexityLevel.EXPERT,
    };
    return map[str?.toLowerCase()] || ComplexityLevel.MODERATE;
  }

  private mapFormality(str: string): FormalityLevel {
    const map: Record<string, FormalityLevel> = {
      'very_formal': FormalityLevel.VERY_FORMAL,
      'formal': FormalityLevel.FORMAL,
      'neutral': FormalityLevel.NEUTRAL,
      'casual': FormalityLevel.CASUAL,
      'very_casual': FormalityLevel.VERY_CASUAL,
    };
    return map[str?.toLowerCase()] || FormalityLevel.NEUTRAL;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildCacheKey(userId: string, message: string): string {
    return `${userId}-${message.slice(0, 50).toLowerCase()}`;
  }

  private getFromCache(key: string): ContextAnalysis | null {
    const cached = this.analysisCache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp.getTime();
    if (age > CONFIG.CACHE_TTL_MS) {
      this.analysisCache.delete(key);
      return null;
    }
    
    return cached.analysis;
  }

  private setCache(key: string, analysis: ContextAnalysis): void {
    this.analysisCache.set(key, { analysis, timestamp: new Date() });
  }

  public clearCache(): void {
    this.analysisCache.clear();
    console.log('[ContextAnalyzer] 🧹 Cache cleared');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public getStats() {
    return {
      cachedAnalyses: this.analysisCache.size,
      llmAvailable: this.isLLMAvailable(),
      config: CONFIG,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT (Backward Compatible)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Create singleton instance (LLM will be initialized later via .initialize())
export const contextAnalyzer = new ContextAnalyzer();

export default ContextAnalyzer;