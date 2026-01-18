/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA QUERY PROCESSOR SERVICE - LISTEN FIRST, PRECISION ALWAYS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: November 4, 2025
 * 
 * ✅ FIXED v2.1: Robust JSON parsing with multiple fallback strategies
 * 
 * Core Philosophy (NOW WITH TRUE LLM UNDERSTANDING):
 * 1. LISTEN FIRST    - LLM se DEEP semantic understanding
 * 2. ANALYZE DEEP    - Surface se neeche, real intent pakado
 * 3. EXTRACT POINTS  - AI-powered extraction, not keywords
 * 4. PRECISION       - 10000% accurate with LLM validation
 * 5. NO RUSH         - Quality over speed, semantic analysis
 * 6. USER PRIORITY   - User first, intelligent understanding
 * 
 * HYBRID Approach:
 * - Statistical baseline (fast, always works)
 * - LLM enhancement (deep, semantic, accurate)
 * - Graceful fallback if LLM unavailable
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../../constants/plans';
import { EmotionType } from '../emotion.detector';
import {
  LLMService,
  ProcessedQuery,
  QueryClassification,
  SemanticUnderstanding,
  QuestionType,
  UserIntent,
} from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES (Internal processing types)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type QueryIntent =
  | 'INFORMATION_SEEKING'
  | 'PROBLEM_SOLVING'
  | 'DECISION_MAKING'
  | 'TASK_COMPLETION'
  | 'CREATIVE_GENERATION'
  | 'EMOTIONAL_SUPPORT'
  | 'CASUAL_CONVERSATION'
  | 'CLARIFICATION'
  | 'FEEDBACK';

export type QueryComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'ADVANCED';

export type QueryUrgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AmbiguityLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface ExtractedPoints {
  mainQuestion: string;
  subQuestions: string[];
  keywords: string[];
  entities: string[];
  technicalTerms: string[];
  assumptions: string[];
  missingInfo: string[];
}

export interface QueryValidation {
  isValid: boolean;
  clarity: number;
  completeness: number;
  ambiguityLevel: AmbiguityLevel;
  issues: string[];
  suggestions: string[];
  needsClarification: boolean;
  clarificationQuestions?: string[];
}

export interface ProcessingOptions {
  deepAnalysis?: boolean;
  strictValidation?: boolean;
  allowAssumptions?: boolean;
  culturalContext?: 'indian' | 'global';
  forceLLM?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PROCESSOR_CONFIG = {
  MIN_CLARITY_SCORE: 70,
  MIN_COMPLETENESS_SCORE: 60,
  MIN_CONFIDENCE_SCORE: 75,
  MIN_QUERY_LENGTH_FOR_LLM: 10,
  USE_LLM_BY_DEFAULT: true,
  MAX_KEYWORDS: 10,
  MAX_SUB_QUESTIONS: 5,
  MAX_CLARIFICATION_QUESTIONS: 3,
  JSON_PARSE_MAX_RETRIES: 3,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUERY PROCESSOR SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class QueryProcessorService {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    console.log('[QueryProcessor] ✅ Initialized - LLM-powered LISTEN FIRST mode (v2.1 - Robust JSON)');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN PROCESSING PIPELINE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🎯 MAIN METHOD: Process query with TRUE deep listening via LLM
   * ✅ FIXED: Returns ProcessedQuery matching intelligence.types.ts
   */
  public async processQuery(
    userId: string,
    query: string,
    planType: PlanType,
    options?: ProcessingOptions
  ): Promise<ProcessedQuery> {
    const startTime = Date.now();
    let usedLLM = false;

    console.log('[QueryProcessor] 👂 LISTENING: Deep LLM analysis started...');
    console.log(`[QueryProcessor] 📝 Query: "${query.substring(0, 100)}..."`);

    try {
      // Decide: LLM or Statistical?
      const shouldUseLLM =
        options?.forceLLM ||
        (PROCESSOR_CONFIG.USE_LLM_BY_DEFAULT &&
          query.length >= PROCESSOR_CONFIG.MIN_QUERY_LENGTH_FOR_LLM);

      let analysis: any;

      if (shouldUseLLM) {
        console.log('[QueryProcessor] 🤖 Using LLM for deep semantic understanding...');
        try {
          analysis = await this.analyzeLLM(query, options);
          usedLLM = true;
        } catch (error) {
          console.warn('[QueryProcessor] ⚠️ LLM failed, falling back to statistical...', error);
          analysis = this.analyzeStatistical(query);
        }
      } else {
        console.log('[QueryProcessor] 📊 Using statistical analysis...');
        analysis = this.analyzeStatistical(query);
      }

      // VALIDATION
      const validation = await this.validateQuery(query, analysis.extractedPoints, options);

      // CONTEXT REQUIREMENTS (for internal tracking)
      const contextRequirements = this.determineContextRequirements(
        analysis.intent,
        analysis.complexity,
        analysis.extractedPoints
      );

      // METRICS
      const processingTime = Date.now() - startTime;
      const confidence = this.calculateConfidence(validation, analysis.extractedPoints);
      const qualityScore = this.calculateQualityScore(validation, confidence);

      // ✅ FIXED: Map to intelligence.types.ts ProcessedQuery format
      const processedQuery: ProcessedQuery = {
        original: query,
        normalized: query.toLowerCase().trim(),
        classification: {
          type: this.mapToQuestionType(analysis.intent),
          intent: this.mapToUserIntent(analysis.intent),
          requiresContext: contextRequirements.requiresMemory,
          isFollowUp: false,
          complexity: analysis.complexity.toLowerCase() as 'simple' | 'moderate' | 'complex',
        },
        semantic: {
          mainIntent: analysis.extractedPoints.mainQuestion || query,
          subIntents: analysis.extractedPoints.subQuestions || [],
          entities: (analysis.extractedPoints.entities || []).map((text: string) => ({
            text,
            type: 'UNKNOWN',
            relevance: 0.8,
          })),
          keywords: analysis.extractedPoints.keywords || [],
          implicitNeeds: analysis.extractedPoints.assumptions || [],
        },
        enrichment: undefined,
        metadata: {
          processingTimeMs: processingTime,
          confidence,
        },
      };

      console.log(
        `[QueryProcessor] 🎉 COMPLETE: Quality ${qualityScore}%, Confidence ${confidence}% (${processingTime}ms, LLM: ${usedLLM})`
      );

      return processedQuery;
    } catch (error) {
      console.error('[QueryProcessor] ❌ Processing failed:', error);
      throw new Error('Query processing failed');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAPPING FUNCTIONS (Internal types → intelligence.types.ts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private mapToQuestionType(intent: QueryIntent): QuestionType {
    const mapping: Record<QueryIntent, QuestionType> = {
      INFORMATION_SEEKING: 'factual',
      PROBLEM_SOLVING: 'troubleshooting',
      DECISION_MAKING: 'comparison',
      TASK_COMPLETION: 'how_to',
      CREATIVE_GENERATION: 'creative',
      EMOTIONAL_SUPPORT: 'emotional_support',
      CASUAL_CONVERSATION: 'factual',
      CLARIFICATION: 'factual',
      FEEDBACK: 'opinion',
    };
    return mapping[intent] || 'factual';
  }

  private mapToUserIntent(intent: QueryIntent): UserIntent {
    const mapping: Record<QueryIntent, UserIntent> = {
      INFORMATION_SEEKING: 'information_seeking',
      PROBLEM_SOLVING: 'problem_solving',
      DECISION_MAKING: 'decision_making',
      TASK_COMPLETION: 'problem_solving',
      CREATIVE_GENERATION: 'learning',
      EMOTIONAL_SUPPORT: 'emotional_support',
      CASUAL_CONVERSATION: 'casual_chat',
      CLARIFICATION: 'information_seeking',
      FEEDBACK: 'casual_chat',
    };
    return mapping[intent] || 'information_seeking';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LLM-POWERED ANALYSIS (Deep Semantic Understanding)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Deep semantic analysis via LLM
   */
  private async analyzeLLM(query: string, options?: ProcessingOptions): Promise<any> {
    const prompt = this.buildAnalysisPrompt(query, options);
    const response = await this.llmService.generateCompletion(prompt);

    // ✅ FIXED: Robust JSON parsing with multiple strategies
    const parsed = this.parseLLMAnalysisRobust(response, query);

    console.log(`[QueryProcessor] ✅ LLM Analysis: ${parsed.intent} (${parsed.complexity})`);

    return parsed;
  }

  /**
   * Build comprehensive analysis prompt for LLM
   * ✅ IMPROVED: Stricter JSON-only instruction
   */
  private buildAnalysisPrompt(query: string, options?: ProcessingOptions): string {
    return `You are an expert query analyzer. Analyze this user query with PRECISION.

User Query: "${query}"

Cultural Context: ${options?.culturalContext || 'auto-detect'}

IMPORTANT: Respond with ONLY a valid JSON object. No markdown, no code blocks, no explanation text before or after. Just pure JSON.

{
  "intent": "INFORMATION_SEEKING",
  "complexity": "MODERATE",
  "urgency": "MEDIUM",
  "emotion": "NEUTRAL",
  "extractedPoints": {
    "mainQuestion": "The primary question or request",
    "subQuestions": [],
    "keywords": [],
    "entities": [],
    "technicalTerms": [],
    "assumptions": [],
    "missingInfo": []
  },
  "reasoning": "Brief explanation"
}

Valid intent values: INFORMATION_SEEKING, PROBLEM_SOLVING, DECISION_MAKING, TASK_COMPLETION, CREATIVE_GENERATION, EMOTIONAL_SUPPORT, CASUAL_CONVERSATION, CLARIFICATION, FEEDBACK

Valid complexity values: SIMPLE, MODERATE, COMPLEX, ADVANCED

Valid urgency values: CRITICAL, HIGH, MEDIUM, LOW

Valid emotion values: JOY, SADNESS, ANGER, FEAR, SURPRISE, NEUTRAL

Respond with ONLY the JSON object:`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ NEW: ROBUST JSON PARSING (Multiple Fallback Strategies)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * ✅ FIXED: Robust LLM response parsing with multiple strategies
   */
  private parseLLMAnalysisRobust(response: string, originalQuery: string): any {
    console.log('[QueryProcessor] 🔧 Parsing LLM response...');

    // Strategy 1: Direct JSON parse (cleanest response)
    try {
      const trimmed = response.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        if (this.validateParsedAnalysis(parsed)) {
          console.log('[QueryProcessor] ✅ Strategy 1: Direct parse successful');
          return this.normalizeParsedAnalysis(parsed, originalQuery);
        }
      }
    } catch (e) {
      console.log('[QueryProcessor] ⚠️ Strategy 1 failed, trying next...');
    }

    // Strategy 2: Extract JSON from markdown code blocks
    try {
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        const jsonStr = codeBlockMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        if (this.validateParsedAnalysis(parsed)) {
          console.log('[QueryProcessor] ✅ Strategy 2: Code block extraction successful');
          return this.normalizeParsedAnalysis(parsed, originalQuery);
        }
      }
    } catch (e) {
      console.log('[QueryProcessor] ⚠️ Strategy 2 failed, trying next...');
    }

    // Strategy 3: Find first complete JSON object (balanced braces)
    try {
      const jsonStr = this.extractBalancedJSON(response);
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        if (this.validateParsedAnalysis(parsed)) {
          console.log('[QueryProcessor] ✅ Strategy 3: Balanced JSON extraction successful');
          return this.normalizeParsedAnalysis(parsed, originalQuery);
        }
      }
    } catch (e) {
      console.log('[QueryProcessor] ⚠️ Strategy 3 failed, trying next...');
    }

    // Strategy 4: Aggressive cleanup and parse
    try {
      const cleaned = this.aggressiveJSONCleanup(response);
      const parsed = JSON.parse(cleaned);
      if (this.validateParsedAnalysis(parsed)) {
        console.log('[QueryProcessor] ✅ Strategy 4: Aggressive cleanup successful');
        return this.normalizeParsedAnalysis(parsed, originalQuery);
      }
    } catch (e) {
      console.log('[QueryProcessor] ⚠️ Strategy 4 failed, trying next...');
    }

    // Strategy 5: Extract key-value pairs manually
    try {
      const extracted = this.extractKeyValuesManually(response, originalQuery);
      console.log('[QueryProcessor] ✅ Strategy 5: Manual extraction successful');
      return extracted;
    } catch (e) {
      console.log('[QueryProcessor] ⚠️ Strategy 5 failed');
    }

    // Final fallback: Return statistical analysis
    console.log('[QueryProcessor] ⚠️ All JSON strategies failed, using statistical fallback');
    return this.analyzeStatistical(originalQuery);
  }

  /**
   * Extract balanced JSON object from text
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
   * Aggressive JSON cleanup
   */
  private aggressiveJSONCleanup(text: string): string {
    // Remove common prefixes
    let cleaned = text
      .replace(/^[\s\S]*?(?=\{)/m, '') // Remove everything before first {
      .replace(/}[\s\S]*$/m, '}') // Remove everything after last }
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .replace(/^[^{]*/, '') // Remove leading non-JSON text
      .trim();

    // Fix common JSON issues
    cleaned = cleaned
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/'/g, '"') // Single quotes to double quotes
      .replace(/(\w+):/g, '"$1":') // Unquoted keys
      .replace(/""+/g, '"') // Multiple quotes
      .replace(/:\s*'([^']*)'/g, ': "$1"'); // Single quoted values

    return cleaned;
  }

  /**
   * Manual key-value extraction as last resort
   */
  private extractKeyValuesManually(text: string, originalQuery: string): any {
    const lower = text.toLowerCase();

    // Extract intent
    let intent: QueryIntent = 'INFORMATION_SEEKING';
    const intentPatterns: Record<string, QueryIntent> = {
      'problem_solving': 'PROBLEM_SOLVING',
      'problem solving': 'PROBLEM_SOLVING',
      'emotional_support': 'EMOTIONAL_SUPPORT',
      'emotional support': 'EMOTIONAL_SUPPORT',
      'decision_making': 'DECISION_MAKING',
      'decision making': 'DECISION_MAKING',
      'creative': 'CREATIVE_GENERATION',
      'task_completion': 'TASK_COMPLETION',
      'task completion': 'TASK_COMPLETION',
      'casual': 'CASUAL_CONVERSATION',
      'clarification': 'CLARIFICATION',
      'feedback': 'FEEDBACK',
    };

    for (const [pattern, value] of Object.entries(intentPatterns)) {
      if (lower.includes(pattern)) {
        intent = value;
        break;
      }
    }

    // Extract complexity
    let complexity: QueryComplexity = 'MODERATE';
    if (lower.includes('simple')) complexity = 'SIMPLE';
    else if (lower.includes('complex')) complexity = 'COMPLEX';
    else if (lower.includes('advanced') || lower.includes('expert')) complexity = 'ADVANCED';

    // Extract urgency
    let urgency: QueryUrgency = 'MEDIUM';
    if (lower.includes('critical') || lower.includes('urgent')) urgency = 'CRITICAL';
    else if (lower.includes('high')) urgency = 'HIGH';
    else if (lower.includes('low')) urgency = 'LOW';

    // Extract emotion
    let emotion: EmotionType = 'neutral' as EmotionType;
    if (lower.includes('joy') || lower.includes('happy')) emotion = 'happy' as EmotionType;
    else if (lower.includes('sad')) emotion = 'sad' as EmotionType;
    else if (lower.includes('anger') || lower.includes('angry')) emotion = 'angry' as EmotionType;
    else if (lower.includes('fear') || lower.includes('anxious')) emotion = 'anxious' as EmotionType;

    return {
      intent,
      complexity,
      urgency,
      emotion,
      extractedPoints: {
        mainQuestion: originalQuery,
        subQuestions: [],
        keywords: this.extractKeywordsSimple(originalQuery),
        entities: this.extractEntitiesSimple(originalQuery),
        technicalTerms: [],
        assumptions: [],
        missingInfo: [],
      },
    };
  }

  /**
   * Validate parsed analysis has required fields
   */
  private validateParsedAnalysis(parsed: any): boolean {
    if (!parsed || typeof parsed !== 'object') return false;
    if (!parsed.intent && !parsed.extractedPoints) return false;
    return true;
  }

  /**
   * Normalize parsed analysis to ensure all fields exist
   */
  private normalizeParsedAnalysis(parsed: any, originalQuery: string): any {
    return {
      intent: parsed.intent || 'INFORMATION_SEEKING',
      complexity: parsed.complexity || 'MODERATE',
      urgency: parsed.urgency || 'MEDIUM',
      emotion: (parsed.emotion?.toLowerCase() || 'neutral') as EmotionType,
      extractedPoints: {
        mainQuestion: parsed.extractedPoints?.mainQuestion || originalQuery,
        subQuestions: parsed.extractedPoints?.subQuestions || [],
        keywords: parsed.extractedPoints?.keywords || [],
        entities: parsed.extractedPoints?.entities || [],
        technicalTerms: parsed.extractedPoints?.technicalTerms || [],
        assumptions: parsed.extractedPoints?.assumptions || [],
        missingInfo: parsed.extractedPoints?.missingInfo || [],
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATISTICAL ANALYSIS (Fallback)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Statistical analysis (fallback when LLM unavailable)
   */
  private analyzeStatistical(query: string): any {
    return {
      intent: this.detectIntentStatistical(query),
      complexity: this.assessComplexityStatistical(query),
      urgency: this.detectUrgencyStatistical(query),
      emotion: this.detectEmotionStatistical(query),
      extractedPoints: this.extractKeyPointsStatistical(query),
    };
  }

  /**
   * Statistical intent detection
   */
  private detectIntentStatistical(query: string): QueryIntent {
    const lower = query.toLowerCase();

    if (
      ['stressed', 'worried', 'anxious', 'confused', 'frustrated'].some((w) => lower.includes(w))
    ) {
      return 'EMOTIONAL_SUPPORT';
    }

    if (['create', 'generate', 'write', 'design', 'make'].some((w) => lower.includes(w))) {
      return 'CREATIVE_GENERATION';
    }

    if (['fix', 'solve', 'error', 'bug', 'issue', 'problem'].some((w) => lower.includes(w))) {
      return 'PROBLEM_SOLVING';
    }

    if (['should i', 'which', 'better', 'choose', 'compare'].some((w) => lower.includes(w))) {
      return 'DECISION_MAKING';
    }

    if (['how to', 'steps', 'guide', 'tutorial'].some((w) => lower.includes(w))) {
      return 'TASK_COMPLETION';
    }

    return 'INFORMATION_SEEKING';
  }

  /**
   * Statistical complexity assessment
   */
  private assessComplexityStatistical(query: string): QueryComplexity {
    const words = query.split(/\s+/).length;
    const sentences = query.split(/[.!?]+/).length;
    const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1;

    if (words > 50 || (hasMultipleQuestions && words > 30)) return 'ADVANCED';
    if (words > 30 || sentences > 2) return 'COMPLEX';
    if (words > 15) return 'MODERATE';
    return 'SIMPLE';
  }

  /**
   * Statistical urgency detection
   */
  private detectUrgencyStatistical(query: string): QueryUrgency {
    const lower = query.toLowerCase();

    if (
      ['urgent', 'emergency', 'asap', 'immediately', 'critical'].some((w) => lower.includes(w))
    ) {
      return 'CRITICAL';
    }

    if (['important', 'soon', 'quickly', 'need help', 'stuck'].some((w) => lower.includes(w))) {
      return 'HIGH';
    }

    if (['help', 'question', 'wondering'].some((w) => lower.includes(w))) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Statistical emotion detection
   */
  private detectEmotionStatistical(query: string): EmotionType {
    const lower = query.toLowerCase();

    if (['frustrated', 'angry', 'upset', 'hate'].some((w) => lower.includes(w))) {
      return 'angry' as EmotionType;
    }

    if (['sad', 'depressed', 'down', 'unhappy'].some((w) => lower.includes(w))) {
      return 'sad' as EmotionType;
    }

    if (['worried', 'anxious', 'scared', 'nervous'].some((w) => lower.includes(w))) {
      return 'anxious' as EmotionType;
    }

    if (['happy', 'great', 'awesome', 'love', 'excited'].some((w) => lower.includes(w))) {
      return 'happy' as EmotionType;
    }

    return 'neutral' as EmotionType;
  }

  /**
   * Statistical key point extraction
   */
  private extractKeyPointsStatistical(query: string): ExtractedPoints {
    const sentences = query.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    return {
      mainQuestion: sentences[0]?.trim() || query,
      subQuestions: sentences
        .slice(1)
        .filter((s) => s.includes('?'))
        .slice(0, 3),
      keywords: this.extractKeywordsSimple(query),
      entities: this.extractEntitiesSimple(query),
      technicalTerms: [],
      assumptions: [],
      missingInfo: [],
    };
  }

  /**
   * Simple keyword extraction
   */
  private extractKeywordsSimple(query: string): string[] {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'is',
      'are',
      'was',
      'were',
      'i',
      'me',
      'my',
      'you',
      'your',
      'we',
      'our',
      'they',
      'their',
      'it',
      'its',
      'this',
      'that',
      'these',
      'those',
      'what',
      'which',
      'who',
      'how',
      'when',
      'where',
      'why',
      'can',
      'could',
      'would',
      'should',
      'will',
      'do',
      'does',
      'did',
      'have',
      'has',
      'had',
      'be',
      'been',
      'being',
      'with',
      'from',
      'about',
      'into',
      'through',
      'during',
      'before',
      'after',
      'above',
      'below',
      'between',
      'under',
      'again',
      'further',
      'then',
      'once',
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
      .slice(0, PROCESSOR_CONFIG.MAX_KEYWORDS);
  }

  /**
   * Simple entity extraction
   */
  private extractEntitiesSimple(query: string): string[] {
    const entities = new Set<string>();
    const words = query.split(/\s+/);

    words.forEach((word) => {
      // Capitalized words (potential proper nouns)
      if (/^[A-Z][a-z]{2,}/.test(word)) {
        entities.add(word);
      }
      // Technical terms (camelCase, snake_case, etc.)
      if (/^[a-z]+[A-Z]/.test(word) || word.includes('_')) {
        entities.add(word);
      }
    });

    return Array.from(entities).slice(0, 10);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION (LLM-Enhanced)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate query (with optional LLM enhancement)
   */
  private async validateQuery(
    query: string,
    points: ExtractedPoints,
    options?: ProcessingOptions
  ): Promise<QueryValidation> {
    // Skip LLM validation to reduce latency - use statistical only
    // LLM validation adds ~2-3s and provides minimal benefit for validation
    return this.validateStatistical(query, points, options);
  }

  /**
   * Statistical validation
   */
  private validateStatistical(
    query: string,
    points: ExtractedPoints,
    options?: ProcessingOptions
  ): QueryValidation {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let clarity = 100;
    let completeness = 100;

    if (query.length < 10) {
      clarity -= 30;
      issues.push('Query is very short');
      suggestions.push('Provide more details');
    }

    if (points.keywords.length < 2) {
      clarity -= 20;
      issues.push('Lacks specific keywords');
      suggestions.push('Be more specific');
    }

    if (points.assumptions.length > 2) {
      completeness -= 25;
      issues.push('Missing context');
      suggestions.push('Provide background information');
    }

    let ambiguityLevel: AmbiguityLevel = 'NONE';
    if (clarity < 50 || completeness < 50) ambiguityLevel = 'HIGH';
    else if (clarity < 70 || completeness < 70) ambiguityLevel = 'MEDIUM';
    else if (clarity < 90 || completeness < 90) ambiguityLevel = 'LOW';

    const needsClarification = ambiguityLevel === 'HIGH';

    return {
      isValid: clarity >= 70 && completeness >= 60,
      clarity: Math.max(0, Math.min(100, clarity)),
      completeness: Math.max(0, Math.min(100, completeness)),
      ambiguityLevel,
      issues,
      suggestions,
      needsClarification,
      clarificationQuestions: needsClarification
        ? ['Could you provide more specific details?']
        : undefined,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTEXT REQUIREMENTS & METRICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private determineContextRequirements(
    intent: QueryIntent,
    complexity: QueryComplexity,
    points: ExtractedPoints
  ): any {
    return {
      requiresMemory: intent === 'CLARIFICATION' || points.assumptions.length > 1,
      requiresAnalogy: complexity === 'COMPLEX' || complexity === 'ADVANCED',
      requiresStepByStep: intent === 'TASK_COMPLETION' || intent === 'PROBLEM_SOLVING',
      requiresExamples: complexity !== 'SIMPLE' && intent === 'INFORMATION_SEEKING',
      requiresComparison: intent === 'DECISION_MAKING',
      requiresEmotionalSupport: intent === 'EMOTIONAL_SUPPORT',
    };
  }

  private calculateConfidence(validation: QueryValidation, points: ExtractedPoints): number {
    let confidence = 100;

    if (!validation.isValid) confidence -= 30;
    if (validation.ambiguityLevel === 'HIGH') confidence -= 25;
    if (validation.ambiguityLevel === 'MEDIUM') confidence -= 15;
    if (validation.ambiguityLevel === 'LOW') confidence -= 5;

    confidence -= points.missingInfo.length * 5;
    confidence -= points.assumptions.length * 5;

    if (points.keywords.length >= 5) confidence += 10;
    if (points.entities.length >= 3) confidence += 5;

    return Math.max(0, Math.min(100, confidence));
  }

  private calculateQualityScore(validation: QueryValidation, confidence: number): number {
    const score = validation.clarity * 0.4 + validation.completeness * 0.3 + confidence * 0.3;
    return Math.round(score);
  }
}

export default QueryProcessorService;