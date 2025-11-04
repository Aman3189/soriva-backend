/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA QUERY PROCESSOR SERVICE - LISTEN FIRST, PRECISION ALWAYS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: November 4, 2025
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

export type QueryComplexity =
  | 'SIMPLE'
  | 'MODERATE'
  | 'COMPLEX'
  | 'ADVANCED';

export type QueryUrgency =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type AmbiguityLevel =
  | 'NONE'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH';

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
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUERY PROCESSOR SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class QueryProcessorService {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    console.log('[QueryProcessor] ✅ Initialized - LLM-powered LISTEN FIRST mode');
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
          console.warn('[QueryProcessor] ⚠️ LLM failed, falling back to statistical...');
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
      'INFORMATION_SEEKING': 'factual',
      'PROBLEM_SOLVING': 'troubleshooting',
      'DECISION_MAKING': 'comparison',
      'TASK_COMPLETION': 'how_to',
      'CREATIVE_GENERATION': 'creative',
      'EMOTIONAL_SUPPORT': 'emotional_support',
      'CASUAL_CONVERSATION': 'factual',
      'CLARIFICATION': 'factual',
      'FEEDBACK': 'opinion',
    };
    return mapping[intent] || 'factual';
  }

  private mapToUserIntent(intent: QueryIntent): UserIntent {
    const mapping: Record<QueryIntent, UserIntent> = {
      'INFORMATION_SEEKING': 'information_seeking',
      'PROBLEM_SOLVING': 'problem_solving',
      'DECISION_MAKING': 'decision_making',
      'TASK_COMPLETION': 'problem_solving',
      'CREATIVE_GENERATION': 'learning',
      'EMOTIONAL_SUPPORT': 'emotional_support',
      'CASUAL_CONVERSATION': 'casual_chat',
      'CLARIFICATION': 'information_seeking',
      'FEEDBACK': 'casual_chat',
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

    // Parse LLM response
    const parsed = this.parseLLMAnalysis(response, query);

    console.log(`[QueryProcessor] ✅ LLM Analysis: ${parsed.intent} (${parsed.complexity})`);

    return parsed;
  }

  /**
   * Build comprehensive analysis prompt for LLM
   */
  private buildAnalysisPrompt(query: string, options?: ProcessingOptions): string {
    return `
You are an expert query analyzer. Deeply analyze this user query with PRECISION and UNDERSTANDING.

User Query: "${query}"

Cultural Context: ${options?.culturalContext || 'auto-detect'}

Provide a comprehensive analysis in JSON format:

{
  "intent": "INFORMATION_SEEKING|PROBLEM_SOLVING|DECISION_MAKING|TASK_COMPLETION|CREATIVE_GENERATION|EMOTIONAL_SUPPORT|CASUAL_CONVERSATION|CLARIFICATION|FEEDBACK",
  "complexity": "SIMPLE|MODERATE|COMPLEX|ADVANCED",
  "urgency": "CRITICAL|HIGH|MEDIUM|LOW",
  "emotion": "JOY|SADNESS|ANGER|FEAR|SURPRISE|NEUTRAL",
  "extractedPoints": {
    "mainQuestion": "The primary question or request",
    "subQuestions": ["Any secondary questions"],
    "keywords": ["key", "important", "terms"],
    "entities": ["Specific names, places, technologies"],
    "technicalTerms": ["Technical terminology used"],
    "assumptions": ["What information is assumed or implicit"],
    "missingInfo": ["What critical information is missing"]
  },
  "reasoning": "Brief explanation of your analysis"
}

Analysis Guidelines:
1. INTENT: What is the user REALLY trying to achieve? Look beyond surface words.
2. COMPLEXITY: How sophisticated is the query? Consider depth, not just length.
3. URGENCY: Does this need immediate attention? Look for emotional cues.
4. EMOTION: What is the user feeling? Be sensitive to subtle emotional signals.
5. EXTRACTION: Pull out the MOST important elements with semantic understanding.
6. ASSUMPTIONS: What is the user assuming we know? Context matters.
7. MISSING INFO: What would make this query clearer?

Be PRECISE. Be THOUGHTFUL. LISTEN FIRST.

Output ONLY valid JSON, no additional text:
`;
  }

  /**
   * Parse LLM analysis response
   */
  private parseLLMAnalysis(response: string, originalQuery: string): any {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and structure
      return {
        intent: parsed.intent || 'INFORMATION_SEEKING',
        complexity: parsed.complexity || 'MODERATE',
        urgency: parsed.urgency || 'MEDIUM',
        emotion: parsed.emotion as EmotionType,
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
    } catch (error) {
      console.error('[QueryProcessor] ❌ Failed to parse LLM response:', error);
      throw error;
    }
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
      ['stressed', 'worried', 'anxious', 'confused', 'frustrated'].some((w) =>
        lower.includes(w)
      )
    ) {
      return 'EMOTIONAL_SUPPORT';
    }

    if (['create', 'generate', 'write', 'design', 'make'].some((w) => lower.includes(w))) {
      return 'CREATIVE_GENERATION';
    }

    if (['fix', 'solve', 'error', 'bug', 'issue', 'problem'].some((w) => lower.includes(w))) {
      return 'PROBLEM_SOLVING';
    }

    if (
      ['should i', 'which', 'better', 'choose', 'compare'].some((w) => lower.includes(w))
    ) {
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

    if (['urgent', 'emergency', 'asap', 'immediately', 'critical'].some((w) => lower.includes(w))) {
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
      subQuestions: sentences.slice(1).filter((s) => s.includes('?')).slice(0, 3),
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
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))
      .slice(0, 10);
  }

  /**
   * Simple entity extraction
   */
  private extractEntitiesSimple(query: string): string[] {
    const entities = new Set<string>();
    const words = query.split(/\s+/);

    words.forEach((word) => {
      if (/^[A-Z][a-z]{2,}/.test(word)) {
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
    // Try LLM validation for high precision
    if (PROCESSOR_CONFIG.USE_LLM_BY_DEFAULT && query.length > 15) {
      try {
        return await this.validateWithLLM(query, points);
      } catch (error) {
        console.warn('[QueryProcessor] ⚠️ LLM validation failed, using statistical');
      }
    }

    // Fallback to statistical validation
    return this.validateStatistical(query, points, options);
  }

  /**
   * LLM-powered validation
   */
  private async validateWithLLM(query: string, points: ExtractedPoints): Promise<QueryValidation> {
    const prompt = `
Validate this user query for clarity and completeness.

Query: "${query}"

Extracted Points:
- Main Question: ${points.mainQuestion}
- Keywords: ${points.keywords.join(', ')}
- Assumptions: ${points.assumptions.join(', ') || 'none'}
- Missing Info: ${points.missingInfo.join(', ') || 'none'}

Provide validation analysis in JSON:

{
  "clarity": 0-100,
  "completeness": 0-100,
  "ambiguityLevel": "NONE|LOW|MEDIUM|HIGH",
  "issues": ["List of clarity/completeness issues"],
  "suggestions": ["How user can improve the query"],
  "needsClarification": true|false,
  "clarificationQuestions": ["Questions to ask user if needed"]
}

Output ONLY valid JSON:
`;

    const response = await this.llmService.generateCompletion(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isValid: parsed.clarity >= 70 && parsed.completeness >= 60,
        clarity: parsed.clarity,
        completeness: parsed.completeness,
        ambiguityLevel: parsed.ambiguityLevel,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || [],
        needsClarification: parsed.needsClarification,
        clarificationQuestions: parsed.clarificationQuestions,
      };
    }

    throw new Error('Failed to parse LLM validation response');
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