// src/services/ai/routing/query-analyzer.ts

/**
 * ==========================================
 * QUERY ANALYZER - AI ROUTING
 * ==========================================
 * Analyzes user queries to determine complexity tier
 * Used for smart AI model routing
 * 
 * Last Updated: November 16, 2025
 */

import { RoutingTier } from '@/constants/plans';

// ==========================================
// INTERFACES
// ==========================================

export interface QueryAnalysis {
  tier: RoutingTier;
  confidence: number;
  reasoning: string;
  metrics: {
    wordCount: number;
    sentenceCount: number;
    hasCode: boolean;
    hasQuestions: boolean;
    hasTechnicalTerms: boolean;
    hasEmotionalContext: boolean;
  };
}

// ==========================================
// COMPLEXITY INDICATORS
// ==========================================

const CASUAL_INDICATORS = [
  'hi', 'hello', 'hey', 'sup', 'yo', 'namaste', 'thanks', 'thank you',
  'ok', 'okay', 'cool', 'nice', 'great', 'awesome', 'good morning',
  'good night', 'bye', 'goodbye', 'see you', 'ttyl', 'brb',
];

const SIMPLE_INDICATORS = [
  'what is', 'who is', 'when', 'where', 'how to', 'explain',
  'tell me', 'can you', 'define', 'meaning', 'translate',
];

const TECHNICAL_TERMS = [
  'algorithm', 'function', 'variable', 'database', 'api', 'framework',
  'deployment', 'architecture', 'optimization', 'integration', 'authentication',
  'encryption', 'backend', 'frontend', 'debugging', 'testing', 'docker',
  'kubernetes', 'typescript', 'javascript', 'python', 'sql', 'nosql',
];

const COMPLEX_INDICATORS = [
  'analyze', 'compare', 'evaluate', 'design', 'architecture', 'strategy',
  'implement', 'optimize', 'refactor', 'debug complex', 'performance issue',
  'scalability', 'best practices', 'trade-offs', 'pros and cons',
];

const EXPERT_INDICATORS = [
  'advanced', 'deep dive', 'comprehensive', 'detailed analysis',
  'system design', 'scalable architecture', 'enterprise', 'production-grade',
  'philosophical', 'existential', 'psychological', 'research',
];

const EMOTIONAL_KEYWORDS = [
  'feel', 'feeling', 'emotional', 'sad', 'happy', 'anxious', 'worried',
  'depressed', 'confused', 'frustrated', 'excited', 'scared', 'lonely',
  'love', 'relationship', 'breakup', 'heartbreak', 'stress', 'anxiety',
];

const CODE_PATTERNS = [
  /```[\s\S]*?```/g,
  /`[^`]+`/g,
  /function\s+\w+\s*\(/,
  /const\s+\w+\s*=/,
  /let\s+\w+\s*=/,
  /class\s+\w+/,
  /import\s+.*from/,
  /export\s+(default|const)/,
  /<\w+[^>]*>/,
  /\{[\s\S]*\}/,
];

// ==========================================
// QUERY ANALYZER CLASS
// ==========================================

export class QueryAnalyzer {
  /**
   * Analyze a user query and determine complexity tier
   */
  public analyzeQuery(query: string): QueryAnalysis {
    const normalizedQuery = query.toLowerCase().trim();
    
    const metrics = this.calculateMetrics(query, normalizedQuery);
    const tier = this.determineTier(normalizedQuery, metrics);
    const confidence = this.calculateConfidence(tier, metrics);
    const reasoning = this.generateReasoning(tier, metrics);

    return { tier, confidence, reasoning, metrics };
  }

  private calculateMetrics(
    query: string,
    normalizedQuery: string
  ): QueryAnalysis['metrics'] {
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    const sentences = query.split(/[.!?]+/).filter(s => s.trim().length > 0);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      hasCode: CODE_PATTERNS.some(pattern => pattern.test(query)),
      hasQuestions: /\?|how|what|why|when|where|who/i.test(query),
      hasTechnicalTerms: TECHNICAL_TERMS.some(term => normalizedQuery.includes(term)),
      hasEmotionalContext: EMOTIONAL_KEYWORDS.some(keyword => normalizedQuery.includes(keyword)),
    };
  }

  private determineTier(
    normalizedQuery: string,
    metrics: QueryAnalysis['metrics']
  ): RoutingTier {
    if (this.shouldUseExpert(normalizedQuery, metrics)) {
      return RoutingTier.EXPERT;
    }

    if (this.shouldUseComplex(normalizedQuery, metrics)) {
      return RoutingTier.COMPLEX;
    }

    if (this.shouldUseMedium(normalizedQuery, metrics)) {
      return RoutingTier.MEDIUM;
    }

    if (this.shouldUseCasual(normalizedQuery, metrics)) {
      return RoutingTier.CASUAL;
    }

    return RoutingTier.SIMPLE;
  }

  private shouldUseCasual(query: string, metrics: QueryAnalysis['metrics']): boolean {
    if (metrics.wordCount <= 3) {
      return CASUAL_INDICATORS.some(indicator => query.includes(indicator));
    }

    if (metrics.wordCount === 1) {
      return true;
    }

    return false;
  }

  private shouldUseMedium(query: string, metrics: QueryAnalysis['metrics']): boolean {
    if (metrics.wordCount >= 15 && metrics.wordCount <= 50) {
      if (metrics.hasTechnicalTerms || metrics.hasCode) {
        return true;
      }
    }

    if (metrics.sentenceCount >= 2 && metrics.hasQuestions) {
      return true;
    }

    if (SIMPLE_INDICATORS.some(ind => query.includes(ind)) && metrics.wordCount > 10) {
      return true;
    }

    return false;
  }

  private shouldUseComplex(query: string, metrics: QueryAnalysis['metrics']): boolean {
    if (metrics.wordCount > 50) {
      return true;
    }

    if (COMPLEX_INDICATORS.some(ind => query.includes(ind))) {
      return true;
    }

    if (metrics.hasCode && metrics.hasTechnicalTerms && metrics.sentenceCount >= 2) {
      return true;
    }

    if (query.includes('design') || query.includes('architecture')) {
      return true;
    }

    return false;
  }

  private shouldUseExpert(query: string, metrics: QueryAnalysis['metrics']): boolean {
    if (metrics.hasEmotionalContext && metrics.wordCount > 30) {
      return true;
    }

    if (EXPERT_INDICATORS.some(ind => query.includes(ind))) {
      return true;
    }

    if (metrics.wordCount > 100) {
      return true;
    }

    if (query.includes('comprehensive') || query.includes('research')) {
      return true;
    }

    return false;
  }

  private calculateConfidence(
    tier: RoutingTier,
    metrics: QueryAnalysis['metrics']
  ): number {
    let confidence = 0.5;

    switch (tier) {
      case RoutingTier.CASUAL:
        if (metrics.wordCount <= 2) confidence = 0.95;
        else if (metrics.wordCount <= 5) confidence = 0.80;
        break;

      case RoutingTier.SIMPLE:
        if (metrics.wordCount >= 5 && metrics.wordCount <= 15) confidence = 0.75;
        break;

      case RoutingTier.MEDIUM:
        if (metrics.hasTechnicalTerms || metrics.hasCode) confidence = 0.80;
        break;

      case RoutingTier.COMPLEX:
        if (metrics.wordCount > 50 || metrics.hasCode) confidence = 0.85;
        break;

      case RoutingTier.EXPERT:
        if (metrics.hasEmotionalContext || metrics.wordCount > 100) confidence = 0.90;
        break;
    }

    return Math.min(confidence, 1.0);
  }

  private generateReasoning(
    tier: RoutingTier,
    metrics: QueryAnalysis['metrics']
  ): string {
    const reasons: string[] = [];

    if (metrics.wordCount <= 3) {
      reasons.push('very short query');
    } else if (metrics.wordCount > 50) {
      reasons.push('long detailed query');
    }

    if (metrics.hasCode) reasons.push('contains code');
    if (metrics.hasTechnicalTerms) reasons.push('technical content');
    if (metrics.hasEmotionalContext) reasons.push('emotional context');
    if (metrics.hasQuestions) reasons.push('asking questions');

    const tierName = tier.toLowerCase();
    return `Selected ${tierName} tier: ${reasons.join(', ') || 'standard query'}`;
  }
}