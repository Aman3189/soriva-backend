/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CONTEXT ANALYZER - THE BRAIN 🧠
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Understand WHAT the user actually wants beyond their words
 *
 * This is what makes Soriva truly intelligent - not just processing words,
 * but understanding context, intent, tone, and situation in real-time.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum QueryType {
  TECHNICAL = 'technical', // Code, math, science questions
  EDUCATIONAL = 'educational', // Learning, explanations, how-to
  EMOTIONAL = 'emotional', // Venting, support, feelings
  CASUAL = 'casual', // Chit-chat, random conversation
  CREATIVE = 'creative', // Writing, ideas, brainstorming
  PROFESSIONAL = 'professional', // Work, business, formal queries
  PERSONAL = 'personal', // Life advice, personal decisions
  TRANSACTIONAL = 'transactional', // Quick info, commands
}

export enum ToneIntent {
  HELP_SEEKING = 'help_seeking', // Genuine need for help
  EXPLORATORY = 'exploratory', // Curious, learning
  CONVERSATIONAL = 'conversational', // Just chatting
  TESTING = 'testing', // Testing AI capabilities
  MANIPULATIVE = 'manipulative', // Trying to trick/break AI
  PLAYFUL = 'playful', // Fun, banter, jokes
  URGENT = 'urgent', // Time-sensitive, stressed
  VULNERABLE = 'vulnerable', // Emotionally sensitive state
}

export enum ComplexityLevel {
  SIMPLE = 'simple', // One-word answers, basic info
  MODERATE = 'moderate', // Paragraph-level responses
  COMPLEX = 'complex', // Detailed explanations needed
  EXPERT = 'expert', // Deep technical/specialized
}

export enum FormalityLevel {
  VERY_FORMAL = 'very_formal', // Sir/Ma'am, professional
  FORMAL = 'formal', // Polite, structured
  NEUTRAL = 'neutral', // Standard conversation
  CASUAL = 'casual', // Relaxed, friendly
  VERY_CASUAL = 'very_casual', // Slang, informal
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

  // Confidence scores (0-1)
  confidence: {
    queryType: number;
    toneIntent: number;
    formality: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATTERNS & MATCHERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PATTERNS = {
  // Query type patterns
  technical:
    /\b(code|error|debug|function|algorithm|syntax|compile|api|database|sql|python|javascript|react|typescript|bug|stack|overflow|terminal|command|install|configure)\b/i,

  educational:
    /\b(explain|how does|what is|why does|teach me|learn|understand|difference between|example of|meaning of|definition|concept|theory|principle)\b/i,

  emotional:
    /\b(feel|feeling|felt|sad|happy|depressed|anxious|stressed|worried|scared|afraid|lonely|hurt|angry|frustrated|upset|crying|tears|heartbreak|miss|love|hate)\b/i,

  creative:
    /\b(write|create|generate|make|design|compose|poem|story|essay|article|script|song|idea|brainstorm|imagine|creative)\b/i,

  professional:
    /\b(meeting|presentation|email|report|proposal|client|boss|colleague|deadline|project|business|career|job|interview|salary|resume|cv|professional)\b/i,

  // Tone patterns
  urgent: /\b(urgent|asap|emergency|immediately|now|quick|fast|hurry|help me|please help|stuck)\b/i,

  vulnerable:
    /\b(don't know what to do|feeling lost|giving up|can't take it|no one understands|alone|worthless|helpless|hopeless)\b/i,

  testing:
    /\b(are you|can you really|prove|test|trick|break|jailbreak|ignore previous|system prompt|instructions|pretend you are)\b/i,

  manipulative:
    /\b(you must|you have to|you're wrong|stupid|dumb|useless|worst|better than you|smarter than|superior to)\b/i,

  // Formality markers
  veryFormal:
    /\b(sir|ma'am|madam|kindly|please could you|would you be so kind|respectfully|sincerely|regards)\b/i,

  formal: /\b(please|thank you|could you|would you|appreciate|grateful|request)\b/i,

  casual: /\b(hey|hi|hello|thanks|cool|nice|awesome|great|yo|sup)\b/i,

  veryCasual: /\b(yaar|bhai|bro|dude|mate|buddy|lol|lmao|wtf|omg|nah|yeah|gonna|wanna|gotta)\b/i,

  // Language markers
  hinglish:
    /\b(yaar|bhai|haan|nahi|kya|hai|kar|mat|bas|acha|theek|sahi|matlab|kyunki|phir|abhi|yeh|wo)\b/i,

  hindi: /[\u0900-\u097F]{3,}/, // Devanagari script

  punjabi: /\b(oye|paaji|veer|kithe|tussi|pher|ohna|mainu|tuhanu)\b/i,

  // Behavioral markers
  greeting:
    /^(hi|hello|hey|good morning|good evening|good afternoon|namaste|sat sri akal|assalam|salaam|hola|bonjour|konnichiwa)\b/i,

  farewell:
    /\b(bye|goodbye|see you|take care|catch you later|thanks bye|peace out|gotta go|gtg)\b/i,

  question:
    /\?|^(what|why|how|when|where|who|which|can you|could you|will you|do you|does|is|are|explain)/i,

  command:
    /^(make|create|generate|write|build|give me|show me|tell me|find|search|calculate|translate|summarize)\b/i,
};

// Complexity indicators
const COMPLEXITY_INDICATORS = {
  simple: ['yes', 'no', 'maybe', 'ok', 'thanks', 'nice', 'cool', 'k'],
  moderate: 10, // word count threshold
  complex: 25, // word count threshold
  expert:
    /\b(algorithm complexity|time complexity|big o|distributed systems|microservices|kubernetes|blockchain|quantum|neural network|machine learning|deep learning|gradient descent)\b/i,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALYZER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ContextAnalyzer {
  /**
   * Main analysis method - understands the REAL context
   */
  analyze(userMessage: string, conversationHistory?: string[]): ContextAnalysis {
    const normalized = userMessage.toLowerCase().trim();
    const wordCount = userMessage.split(/\s+/).length;

    // Detect all aspects
    const queryType = this.detectQueryType(normalized, conversationHistory);
    const toneIntent = this.detectToneIntent(normalized, userMessage);
    const complexityLevel = this.detectComplexity(normalized, wordCount);
    const formalityLevel = this.detectFormality(normalized);

    // Behavioral flags
    const isGreeting = PATTERNS.greeting.test(normalized);
    const isFarewell = PATTERNS.farewell.test(normalized);
    const isQuestion = PATTERNS.question.test(userMessage);
    const isCommand = PATTERNS.command.test(normalized);
    const containsEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]/u.test(userMessage);

    // Language detection
    const hasHinglish = PATTERNS.hinglish.test(normalized);
    const hasHindi = PATTERNS.hindi.test(userMessage);
    const hasPunjabi = PATTERNS.punjabi.test(normalized);
    const primaryLanguage = this.detectPrimaryLanguage(hasHinglish, hasHindi, hasPunjabi);

    // Situational context
    const expectedResponseLength = this.determineResponseLength(
      queryType,
      complexityLevel,
      wordCount
    );

    const shouldBeEmpathetic = this.shouldBeEmpathetic(queryType, toneIntent);
    const shouldBeProfessional = this.shouldBeProfessional(queryType, formalityLevel);
    const shouldBePlayful = this.shouldBePlayful(toneIntent, formalityLevel);

    // Calculate confidence scores
    const confidence = this.calculateConfidence(normalized, queryType, toneIntent);

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
      confidence,
    };
  }

  /**
   * Detect query type
   */
  private detectQueryType(normalized: string, history?: string[]): QueryType {
    const scores = {
      [QueryType.TECHNICAL]: 0,
      [QueryType.EDUCATIONAL]: 0,
      [QueryType.EMOTIONAL]: 0,
      [QueryType.CASUAL]: 0,
      [QueryType.CREATIVE]: 0,
      [QueryType.PROFESSIONAL]: 0,
      [QueryType.PERSONAL]: 0,
      [QueryType.TRANSACTIONAL]: 0,
    };

    // Technical indicators
    if (PATTERNS.technical.test(normalized)) scores[QueryType.TECHNICAL] += 3;
    if (/code|script|program/i.test(normalized)) scores[QueryType.TECHNICAL] += 2;

    // Educational indicators
    if (PATTERNS.educational.test(normalized)) scores[QueryType.EDUCATIONAL] += 3;
    if (/^(what|why|how)\b/i.test(normalized)) scores[QueryType.EDUCATIONAL] += 1;

    // Emotional indicators
    if (PATTERNS.emotional.test(normalized)) scores[QueryType.EMOTIONAL] += 4;
    if (PATTERNS.vulnerable.test(normalized)) scores[QueryType.EMOTIONAL] += 2;

    // Creative indicators
    if (PATTERNS.creative.test(normalized)) scores[QueryType.CREATIVE] += 3;

    // Professional indicators
    if (PATTERNS.professional.test(normalized)) scores[QueryType.PROFESSIONAL] += 3;

    // Casual indicators
    if (normalized.length < 20 && !PATTERNS.question.test(normalized)) {
      scores[QueryType.CASUAL] += 2;
    }
    if (PATTERNS.veryCasual.test(normalized)) scores[QueryType.CASUAL] += 1;

    // Transactional indicators
    if (PATTERNS.command.test(normalized) && normalized.split(/\s+/).length < 8) {
      scores[QueryType.TRANSACTIONAL] += 2;
    }

    // Personal advice indicators
    if (/should i|what do you think|advice|recommend|suggest/i.test(normalized)) {
      scores[QueryType.PERSONAL] += 2;
    }

    // Find highest score
    const highest = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a));

    // Default to casual if no clear winner
    return highest[1] > 0 ? (highest[0] as QueryType) : QueryType.CASUAL;
  }

  /**
   * Detect tone and intent
   */
  private detectToneIntent(normalized: string, original: string): ToneIntent {
    // Check for manipulation/testing first (highest priority)
    if (PATTERNS.manipulative.test(normalized) || PATTERNS.testing.test(normalized)) {
      if (PATTERNS.testing.test(normalized)) return ToneIntent.TESTING;
      return ToneIntent.MANIPULATIVE;
    }

    // Check vulnerability
    if (PATTERNS.vulnerable.test(normalized)) {
      return ToneIntent.VULNERABLE;
    }

    // Check urgency
    if (PATTERNS.urgent.test(normalized)) {
      return ToneIntent.URGENT;
    }

    // Check for help-seeking markers
    if (/help|need|stuck|confused|don't understand|can you|could you/i.test(normalized)) {
      return ToneIntent.HELP_SEEKING;
    }

    // Check for exploratory/curiosity
    if (/\b(curious|wonder|interesting|tell me more|explore|learn about)\b/i.test(normalized)) {
      return ToneIntent.EXPLORATORY;
    }

    // Check for playfulness
    if (/\b(lol|haha|😂|😄|joke|fun|play|banter)\b/i.test(original)) {
      return ToneIntent.PLAYFUL;
    }

    // Default to conversational
    return ToneIntent.CONVERSATIONAL;
  }

  /**
   * Detect complexity level
   */
  private detectComplexity(normalized: string, wordCount: number): ComplexityLevel {
    // Expert-level indicators
    if (COMPLEXITY_INDICATORS.expert.test(normalized)) {
      return ComplexityLevel.EXPERT;
    }

    // Simple single-word or very short
    if (wordCount <= 3 || COMPLEXITY_INDICATORS.simple.includes(normalized)) {
      return ComplexityLevel.SIMPLE;
    }

    // Complex multi-part questions
    if (wordCount >= COMPLEXITY_INDICATORS.complex) {
      return ComplexityLevel.COMPLEX;
    }

    // Moderate default
    if (wordCount >= COMPLEXITY_INDICATORS.moderate) {
      return ComplexityLevel.MODERATE;
    }

    return ComplexityLevel.SIMPLE;
  }

  /**
   * Detect formality level
   */
  private detectFormality(normalized: string): FormalityLevel {
    let formalityScore = 0;

    // Very formal markers
    if (PATTERNS.veryFormal.test(normalized)) formalityScore += 4;

    // Formal markers
    if (PATTERNS.formal.test(normalized)) formalityScore += 2;

    // Casual markers
    if (PATTERNS.casual.test(normalized)) formalityScore -= 1;

    // Very casual markers
    if (PATTERNS.veryCasual.test(normalized)) formalityScore -= 3;

    // Determine level
    if (formalityScore >= 4) return FormalityLevel.VERY_FORMAL;
    if (formalityScore >= 2) return FormalityLevel.FORMAL;
    if (formalityScore <= -3) return FormalityLevel.VERY_CASUAL;
    if (formalityScore <= -1) return FormalityLevel.CASUAL;

    return FormalityLevel.NEUTRAL;
  }

  /**
   * Detect primary language
   */
  private detectPrimaryLanguage(
    hasHinglish: boolean,
    hasHindi: boolean,
    hasPunjabi: boolean
  ): 'en' | 'hi' | 'pa' | 'mixed' {
    const indicators = [hasHinglish, hasHindi, hasPunjabi].filter(Boolean).length;

    if (indicators === 0) return 'en';
    if (hasHindi && !hasHinglish) return 'hi';
    if (hasPunjabi) return 'pa';
    if (indicators >= 2) return 'mixed';
    if (hasHinglish) return 'mixed';

    return 'en';
  }

  /**
   * Determine expected response length
   */
  private determineResponseLength(
    queryType: QueryType,
    complexity: ComplexityLevel,
    wordCount: number
  ): 'short' | 'medium' | 'long' | 'detailed' {
    // Transactional = short
    if (queryType === QueryType.TRANSACTIONAL) return 'short';

    // Casual + simple = short
    if (queryType === QueryType.CASUAL && complexity === ComplexityLevel.SIMPLE) {
      return 'short';
    }

    // Expert or complex = detailed
    if (complexity === ComplexityLevel.EXPERT) return 'detailed';
    if (complexity === ComplexityLevel.COMPLEX) return 'long';

    // Technical/Educational = medium to long
    if (queryType === QueryType.TECHNICAL || queryType === QueryType.EDUCATIONAL) {
      return complexity === ComplexityLevel.MODERATE ? 'medium' : 'long';
    }

    // Emotional = medium (not too brief, not overwhelming)
    if (queryType === QueryType.EMOTIONAL) return 'medium';

    // Default based on input length
    if (wordCount > 30) return 'long';
    if (wordCount > 15) return 'medium';

    return 'short';
  }

  /**
   * Should response be empathetic?
   */
  private shouldBeEmpathetic(queryType: QueryType, intent: ToneIntent): boolean {
    if (queryType === QueryType.EMOTIONAL) return true;
    if (intent === ToneIntent.VULNERABLE) return true;
    if (intent === ToneIntent.URGENT) return true;

    return false;
  }

  /**
   * Should response be professional?
   */
  private shouldBeProfessional(queryType: QueryType, formality: FormalityLevel): boolean {
    if (queryType === QueryType.PROFESSIONAL) return true;
    if (formality === FormalityLevel.VERY_FORMAL || formality === FormalityLevel.FORMAL) {
      return true;
    }

    return false;
  }

  /**
   * Should response be playful?
   */
  private shouldBePlayful(intent: ToneIntent, formality: FormalityLevel): boolean {
    if (intent === ToneIntent.PLAYFUL) return true;
    if (intent === ToneIntent.CONVERSATIONAL && formality === FormalityLevel.VERY_CASUAL) {
      return true;
    }

    return false;
  }

  /**
   * Calculate confidence scores
   */
  private calculateConfidence(
    normalized: string,
    queryType: QueryType,
    intent: ToneIntent
  ): { queryType: number; toneIntent: number; formality: number } {
    // Simple heuristic: stronger pattern matches = higher confidence
    let queryConfidence = 0.5;
    let intentConfidence = 0.5;
    const formalityConfidence = 0.6;

    // Boost query confidence if strong patterns match
    const queryPatternKey = queryType as keyof typeof PATTERNS;
    if (PATTERNS[queryPatternKey] && PATTERNS[queryPatternKey].test(normalized)) {
      queryConfidence = 0.85;
    }

    // Boost intent confidence for clear signals
    if (intent === ToneIntent.VULNERABLE || intent === ToneIntent.URGENT) {
      intentConfidence = 0.9;
    } else if (intent === ToneIntent.TESTING || intent === ToneIntent.MANIPULATIVE) {
      intentConfidence = 0.95;
    }

    return {
      queryType: queryConfidence,
      toneIntent: intentConfidence,
      formality: formalityConfidence,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const contextAnalyzer = new ContextAnalyzer();
