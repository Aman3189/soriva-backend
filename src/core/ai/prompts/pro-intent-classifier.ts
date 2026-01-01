// src/core/ai/prompts/pro-intent-classifier.ts
// ============================================================================
// SORIVA PRO INTENT CLASSIFIER v1.1 - January 2026
// ============================================================================
// Purpose: Classify Pro plan queries into 3 intent buckets for smart routing
// Method: Lightweight keyword-based (no LLM call, ~0 tokens)
// 
// Intent Buckets:
// - EVERYDAY: Quick tasks → Flash/Kimi (NO GPT)
// - PROFESSIONAL: Business/planning → Kimi/Gemini Pro (rare GPT escalation)
// - EXPERT: Deep thinking → GPT-5.1 (with cap)
//
// v1.1 Updates:
// - Soft GPT for high-stakes PROFESSIONAL (score >= 8, tokens > 120K)
// - Short-message bias exception (only if expertScore === 0)
// - Intent hysteresis support (session lock for continuity)
//
// Business Logic:
// - Protect GPT-5.1 allocation for truly complex queries
// - User never sees classification (seamless experience)
// - Margin protection without compromising quality
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type ProIntentType = 'EVERYDAY' | 'PROFESSIONAL' | 'EXPERT';

export interface ProIntentResult {
  intent: ProIntentType;
  confidence: number; // 0-100
  matchedKeywords: string[];
  allowGPT: boolean; // Whether GPT-5.1 is allowed for this intent
  shouldLock: boolean; // Lock intent in session if high confidence
  metadata: {
    expertScore: number;
    professionalScore: number;
    everydayScore: number;
    processingTimeMs: number;
    biasApplied: boolean;
    softGPTEscalation: boolean; // True if PROFESSIONAL got GPT access
  };
}

export interface ProClassifierOptions {
  minConfidence?: number; // Minimum confidence to assign intent (default: 30)
  expertBiasEnabled?: boolean; // Boost expert detection (default: true)
  gptRemainingTokens?: number; // For conditional GPT allowance
  sessionIntent?: ProIntentType; // For hysteresis (previous locked intent)
  sessionIntentLocked?: boolean; // Whether session has locked intent
}

// ============================================================================
// KEYWORD DEFINITIONS
// ============================================================================

/**
 * EXPERT intent keywords (3 points each)
 * Deep thinking, complex analysis, high-stakes decisions
 * → GPT-5.1 allowed (with cap)
 */
const EXPERT_KEYWORDS = {
  // High weight (3 points) - Definitely expert
  high: [
    'architecture', 'system design', 'system architecture',
    'long term', 'long-term', 'strategic planning',
    'trade off', 'trade-off', 'tradeoff',
    'decision matrix', 'decision framework',
    'risk analysis', 'risk assessment', 'risk mitigation',
    'cost benefit', 'cost-benefit', 'roi analysis',
    'multi variable', 'multi-variable', 'multivariate',
    'scalability', 'scale strategy',
    'legal implications', 'regulatory',
    'financial modeling', 'financial analysis',
    'deep analysis', 'comprehensive analysis',
    'edge cases', 'corner cases',
    'complex problem', 'complex decision',
    'critical thinking', 'first principles',
    'root cause', 'root-cause analysis',
    'impact assessment', 'impact analysis',
    'due diligence', 'feasibility study',
    'competitive analysis', 'market analysis',
  ],

  // Medium weight (2 points) - Likely expert
  medium: [
    'evaluate', 'evaluation',
    'analyze', 'analysis',
    'implications', 'consequences',
    'alternatives', 'options analysis',
    'pros and cons', 'advantages disadvantages',
    'long run', 'short term vs long term',
    'dependencies', 'constraints',
    'assumptions', 'hypothesis',
    'framework', 'methodology',
    'benchmark', 'benchmarking',
    'optimization', 'optimize for',
    'prioritization', 'prioritize',
    'stakeholder', 'stakeholders',
  ],
};

/**
 * PROFESSIONAL intent keywords (2 points each)
 * Business, planning, structured thinking
 * → Kimi K2 / Gemini Pro (conditional GPT for high-stakes)
 */
const PROFESSIONAL_KEYWORDS = {
  // High weight (3 points)
  high: [
    'business plan', 'business model',
    'go to market', 'go-to-market', 'gtm strategy',
    'product roadmap', 'product strategy',
    'marketing strategy', 'marketing plan',
    'sales strategy', 'sales pitch',
    'investor pitch', 'pitch deck',
    'competitive advantage', 'value proposition',
    'target audience', 'customer segment',
    'revenue model', 'pricing strategy',
    'partnership', 'collaboration proposal',
    'project plan', 'project timeline',
    'resource allocation', 'budget planning',
  ],

  // Medium weight (2 points)
  medium: [
    'plan', 'planning',
    'proposal', 'propose',
    'strategy', 'strategic',
    'roadmap', 'milestone',
    'comparison', 'compare',
    'business', 'enterprise',
    'pricing', 'cost estimate',
    'market', 'industry',
    'optimize', 'improve',
    'design', 'redesign',
    'documentation', 'document',
    'workflow', 'process',
    'presentation', 'present',
    'report', 'reporting',
    'meeting', 'agenda',
    'client', 'customer',
    'team', 'leadership',
    'kpi', 'metrics', 'okr',
  ],

  // Low weight (1 point)
  low: [
    'professional', 'work',
    'office', 'corporate',
    'manager', 'management',
    'executive', 'director',
    'startup', 'company',
    'organization', 'firm',
  ],
};

/**
 * EVERYDAY intent keywords
 * Quick tasks, simple queries
 * → Flash/Kimi only (NO GPT)
 */
const EVERYDAY_KEYWORDS = {
  // These REDUCE expert/professional score (negative signal)
  casual: [
    'quickly', 'quick', 'fast',
    'simple', 'easy', 'basic',
    'just', 'only', 'brief',
    'short', 'small',
    'rewrite', 'rephrase',
    'fix', 'correct', 'grammar',
    'summarize', 'tldr',
    'translate', 'convert',
    'format', 'formatting',
    'list', 'bullet points',
    'email', 'message', 'reply',
    'thanks', 'thank you',
    'hi', 'hello', 'hey',
  ],
};

// ============================================================================
// PRO INTENT CLASSIFIER CLASS
// ============================================================================

class ProIntentClassifier {
  private defaultOptions: ProClassifierOptions = {
    minConfidence: 30,
    expertBiasEnabled: true,
    gptRemainingTokens: undefined,
    sessionIntent: undefined,
    sessionIntentLocked: false,
  };

  /**
   * Constructor - validates keyword limits
   */
  constructor() {
    this.validateKeywordLimits();
  }

  /**
   * Validate keyword list sizes for performance
   */
  private validateKeywordLimits(): void {
    const MAX_KEYWORDS = 80;

    if (EXPERT_KEYWORDS.high.length > MAX_KEYWORDS) {
      console.warn(
        `[ProIntentClassifier] ⚠️ EXPERT high keywords too large: ${EXPERT_KEYWORDS.high.length}/${MAX_KEYWORDS}`
      );
    }
    if (PROFESSIONAL_KEYWORDS.high.length > MAX_KEYWORDS) {
      console.warn(
        `[ProIntentClassifier] ⚠️ PROFESSIONAL high keywords too large: ${PROFESSIONAL_KEYWORDS.high.length}/${MAX_KEYWORDS}`
      );
    }

    console.log('[ProIntentClassifier] ✅ Initialized with keyword validation');
  }

  /**
   * Classify Pro user message intent
   * @param message - User's message
   * @param options - Classifier options
   * @returns ProIntentResult with intent type and GPT allowance
   *
   * @example
   * const result = classifier.classify('Design a scalable architecture for our e-commerce platform');
   * // { intent: 'EXPERT', allowGPT: true, confidence: 85 }
   */
  public classify(message: string, options?: ProClassifierOptions): ProIntentResult {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    // Normalize message
    const normalizedMessage = message.toLowerCase();

    // Calculate scores
    const expertScore = this.calculateExpertScore(normalizedMessage);
    const professionalScore = this.calculateProfessionalScore(normalizedMessage);
    const everydayScore = this.calculateEverydayScore(normalizedMessage, expertScore);

    // Get matched keywords for debugging
    const matchedKeywords = this.getMatchedKeywords(normalizedMessage);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INTENT HYSTERESIS (Session continuity)
    // If session has locked intent and current confidence < 80
    // → Keep previous intent for conversation continuity
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const rawIntent = this.determineIntent(
      expertScore,
      professionalScore,
      everydayScore,
      opts
    );

    let finalIntent = rawIntent.intent;
    let finalConfidence = rawIntent.confidence;

    if (
      opts.sessionIntentLocked &&
      opts.sessionIntent &&
      rawIntent.confidence < 80
    ) {
      // Keep session intent for continuity
      finalIntent = opts.sessionIntent;
      finalConfidence = Math.max(rawIntent.confidence, 60);
    }

    // Determine GPT allowance (with soft escalation for PROFESSIONAL)
    const { allowGPT, softGPTEscalation } = this.determineGPTAllowance(
      finalIntent,
      professionalScore,
      opts.gptRemainingTokens
    );

    // Session lock for high confidence
    const shouldLock = finalConfidence >= 70;

    const processingTime = Date.now() - startTime;

    return {
      intent: finalIntent,
      confidence: finalConfidence,
      matchedKeywords,
      allowGPT,
      shouldLock,
      metadata: {
        expertScore,
        professionalScore,
        everydayScore,
        processingTimeMs: processingTime,
        biasApplied: rawIntent.biasApplied,
        softGPTEscalation,
      },
    };
  }

  /**
   * Quick classify - returns just intent type
   */
  public quickClassify(message: string): ProIntentType {
    return this.classify(message).intent;
  }

  /**
   * Determine GPT allowance with soft escalation for PROFESSIONAL
   */
  private determineGPTAllowance(
    intent: ProIntentType,
    professionalScore: number,
    gptRemainingTokens?: number
  ): { allowGPT: boolean; softGPTEscalation: boolean } {
    // EVERYDAY = Never allow GPT
    if (intent === 'EVERYDAY') {
      return { allowGPT: false, softGPTEscalation: false };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PROFESSIONAL = Soft GPT escalation (rare)
    // Only if: tokens > 120K AND professionalScore >= 8
    // Effect: 90% → Gemini Pro, 10% high-stakes → GPT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (intent === 'PROFESSIONAL') {
      if (
        gptRemainingTokens !== undefined &&
        gptRemainingTokens > 120000 &&
        professionalScore >= 8
      ) {
        return { allowGPT: true, softGPTEscalation: true };
      }
      return { allowGPT: false, softGPTEscalation: false };
    }

    // EXPERT = Allow GPT (but check cap)
    if (intent === 'EXPERT') {
      const GPT_SAFE_THRESHOLD = 20000;
      if (gptRemainingTokens !== undefined && gptRemainingTokens < GPT_SAFE_THRESHOLD) {
        return { allowGPT: false, softGPTEscalation: false }; // Cap reached, fallback
      }
      return { allowGPT: true, softGPTEscalation: false };
    }

    return { allowGPT: false, softGPTEscalation: false };
  }

  /**
   * Calculate EXPERT score
   */
  private calculateExpertScore(message: string): number {
    let score = 0;

    // High weight (3 points)
    for (const keyword of EXPERT_KEYWORDS.high) {
      if (this.containsKeyword(message, keyword)) {
        score += 3;
      }
    }

    // Medium weight (2 points)
    for (const keyword of EXPERT_KEYWORDS.medium) {
      if (this.containsKeyword(message, keyword)) {
        score += 2;
      }
    }

    return score;
  }

  /**
   * Calculate PROFESSIONAL score
   */
  private calculateProfessionalScore(message: string): number {
    let score = 0;

    // High weight (3 points)
    for (const keyword of PROFESSIONAL_KEYWORDS.high) {
      if (this.containsKeyword(message, keyword)) {
        score += 3;
      }
    }

    // Medium weight (2 points)
    for (const keyword of PROFESSIONAL_KEYWORDS.medium) {
      if (this.containsKeyword(message, keyword)) {
        score += 2;
      }
    }

    // Low weight (1 point)
    for (const keyword of PROFESSIONAL_KEYWORDS.low) {
      if (this.containsKeyword(message, keyword)) {
        score += 1;
      }
    }

    return score;
  }

  /**
   * Calculate EVERYDAY score (negative signal for expert/professional)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * TWEAK: Short-message bias exception
   * Only add short-message penalty if expertScore === 0
   * This avoids demoting short expert commands
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private calculateEverydayScore(message: string, expertScore: number): number {
    let score = 0;

    for (const keyword of EVERYDAY_KEYWORDS.casual) {
      if (this.containsKeyword(message, keyword)) {
        score += 2;
      }
    }

    // Short messages are likely everyday
    // BUT only if no expert keywords detected (exception for short expert commands)
    if (expertScore === 0) {
      if (message.length < 50) {
        score += 3;
      } else if (message.length < 100) {
        score += 1;
      }
    }

    return score;
  }

  /**
   * Get all matched keywords for debugging
   */
  private getMatchedKeywords(message: string): string[] {
    const matches: string[] = [];

    const allKeywords = [
      ...EXPERT_KEYWORDS.high,
      ...EXPERT_KEYWORDS.medium,
      ...PROFESSIONAL_KEYWORDS.high,
      ...PROFESSIONAL_KEYWORDS.medium,
      ...PROFESSIONAL_KEYWORDS.low,
    ];

    for (const keyword of allKeywords) {
      if (this.containsKeyword(message, keyword)) {
        matches.push(keyword);
      }
    }

    return matches;
  }

  /**
   * Check if message contains keyword (word boundary aware)
   */
  private containsKeyword(message: string, keyword: string): boolean {
    // For multi-word keywords, check direct inclusion
    if (keyword.includes(' ') || keyword.includes('-')) {
      return message.includes(keyword.toLowerCase());
    }

    // For single words, use word boundary regex
    const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'i');
    return regex.test(message);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Determine final intent from scores
   */
  private determineIntent(
    expertScore: number,
    professionalScore: number,
    everydayScore: number,
    options: ProClassifierOptions
  ): { intent: ProIntentType; confidence: number; biasApplied: boolean } {
    let biasApplied = false;

    // Adjust scores based on everyday signals
    const adjustedExpertScore = Math.max(0, expertScore - everydayScore * 0.5);
    const adjustedProfessionalScore = Math.max(0, professionalScore - everydayScore * 0.3);

    const totalScore = adjustedExpertScore + adjustedProfessionalScore + everydayScore;

    // No significant signals
    if (totalScore < 3) {
      return { intent: 'EVERYDAY', confidence: 60, biasApplied: false };
    }

    // Calculate confidence
    const maxScore = Math.max(adjustedExpertScore, adjustedProfessionalScore, everydayScore);
    let confidence = Math.round((maxScore / (totalScore + 5)) * 100);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EXPERT BIAS RULE
    // If expert score >= 6 AND expert > professional * 1.3
    // → Force EXPERT intent (complex queries deserve GPT)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (
      options.expertBiasEnabled &&
      adjustedExpertScore >= 6 &&
      adjustedExpertScore > adjustedProfessionalScore * 1.3
    ) {
      biasApplied = true;
      confidence = Math.max(confidence, 70);
      return { intent: 'EXPERT', confidence, biasApplied };
    }

    // Determine winner
    if (adjustedExpertScore > adjustedProfessionalScore && adjustedExpertScore > everydayScore) {
      return { intent: 'EXPERT', confidence, biasApplied: false };
    }

    if (adjustedProfessionalScore > everydayScore) {
      return { intent: 'PROFESSIONAL', confidence, biasApplied: false };
    }

    // Default to EVERYDAY
    return { intent: 'EVERYDAY', confidence: Math.max(confidence, 50), biasApplied: false };
  }

  /**
   * Add custom keywords (runtime)
   */
  public addCustomKeywords(
    intent: 'EXPERT' | 'PROFESSIONAL',
    weight: 'high' | 'medium',
    keywords: string[]
  ): void {
    const targetKeywords = intent === 'EXPERT' ? EXPERT_KEYWORDS : PROFESSIONAL_KEYWORDS;

    if (weight === 'high' || weight === 'medium') {
      targetKeywords[weight].push(...keywords);
    }

    console.log(
      `[ProIntentClassifier] ➕ Added ${keywords.length} ${weight} keywords to ${intent}`
    );
  }

  /**
   * Get statistics
   */
  public getStats(): {
    expertKeywords: { high: number; medium: number; total: number };
    professionalKeywords: { high: number; medium: number; low: number; total: number };
    everydayKeywords: { casual: number };
  } {
    return {
      expertKeywords: {
        high: EXPERT_KEYWORDS.high.length,
        medium: EXPERT_KEYWORDS.medium.length,
        total: EXPERT_KEYWORDS.high.length + EXPERT_KEYWORDS.medium.length,
      },
      professionalKeywords: {
        high: PROFESSIONAL_KEYWORDS.high.length,
        medium: PROFESSIONAL_KEYWORDS.medium.length,
        low: PROFESSIONAL_KEYWORDS.low.length,
        total:
          PROFESSIONAL_KEYWORDS.high.length +
          PROFESSIONAL_KEYWORDS.medium.length +
          PROFESSIONAL_KEYWORDS.low.length,
      },
      everydayKeywords: {
        casual: EVERYDAY_KEYWORDS.casual.length,
      },
    };
  }

  /**
   * Health check
   */
  public healthCheck(): {
    status: 'healthy' | 'warning' | 'error';
    checks: Record<string, boolean>;
    message: string;
  } {
    const checks = {
      expertKeywordsValid: EXPERT_KEYWORDS.high.length > 0,
      professionalKeywordsValid: PROFESSIONAL_KEYWORDS.high.length > 0,
      keywordsWithinLimits:
        EXPERT_KEYWORDS.high.length <= 80 && PROFESSIONAL_KEYWORDS.high.length <= 80,
    };

    const allPassed = Object.values(checks).every((v) => v);

    return {
      status: allPassed ? 'healthy' : 'warning',
      checks,
      message: allPassed
        ? 'Pro intent classifier is healthy'
        : 'Some checks failed - review keyword limits',
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE & EXPORTS
// ============================================================================

const proIntentClassifier = new ProIntentClassifier();

export default proIntentClassifier;
export { ProIntentClassifier };

// Convenience functions
export function classifyProIntent(
  message: string,
  options?: {
    gptRemainingTokens?: number;
    sessionIntent?: ProIntentType;
    sessionIntentLocked?: boolean;
  }
): ProIntentResult {
  return proIntentClassifier.classify(message, options);
}

export function getProIntentType(message: string): ProIntentType {
  return proIntentClassifier.quickClassify(message);
}

export function isExpertIntent(message: string): boolean {
  return proIntentClassifier.quickClassify(message) === 'EXPERT';
}

export function isProfessionalIntent(message: string): boolean {
  return proIntentClassifier.quickClassify(message) === 'PROFESSIONAL';
}

export function shouldAllowGPTForMessage(message: string, gptRemainingTokens?: number): boolean {
  const result = proIntentClassifier.classify(message, { gptRemainingTokens });
  return result.allowGPT;
}