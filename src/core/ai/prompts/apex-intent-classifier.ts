// src/core/ai/prompts/apex-intent-classifier.ts
// ============================================================================
// SORIVA APEX INTENT CLASSIFIER v1.0 - January 2026
// ============================================================================
// Purpose: Intent classification for Apex (premium) plan
// NO policing - only empowerment and smart routing
//
// Intent Types:
// - INSTANT: Fast, direct execution (short queries)
// - ANALYTICAL: Deep thinking, trade-offs, reasoning
// - STRATEGIC: Business/life/long-term planning
// - CREATIVE: High originality, storytelling, design
// - MULTI_DOMAIN: Needs multiple models/tools orchestration
//
// Key Difference from Pro:
// - Pro: Controls GPT access (cost protection)
// - Apex: Enables multi-model chaining (premium experience)
//
// Token Cost: 0 (pure keyword matching)
// CPU Cost: ~0ms (ultra-light)
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type ApexIntent =
  | 'INSTANT'
  | 'ANALYTICAL'
  | 'STRATEGIC'
  | 'CREATIVE'
  | 'MULTI_DOMAIN';

export interface ApexIntentResult {
  intent: ApexIntent;
  confidence: number;
  metadata: {
    requiresTools: boolean;
    requiresMultipleModels: boolean;
    depthScore: number;
    processingTimeMs: number;
  };
}

// ============================================================================
// KEYWORD DEFINITIONS
// ============================================================================

/**
 * STRATEGIC intent keywords
 * Business, long-term, planning queries
 * → GPT-5.1 primary
 */
const STRATEGIC_KEYWORDS = [
  // Business strategy
  'strategy', 'roadmap', 'long term', 'long-term', 'business',
  'investment', 'growth', 'expansion', 'revenue', 'market',
  'competitive', 'positioning', 'stakeholder', 'exit',
  'business model', 'go-to-market', 'gtm', 'market entry',
  
  // Planning
  'planning', 'forecast', 'projection', 'milestone',
  'quarterly', 'annual plan', 'okr', 'kpi',
  
  // Decision making
  'decision framework', 'prioritization', 'resource allocation',
  'risk assessment', 'opportunity cost', 'roi analysis',
];

/**
 * CREATIVE intent keywords
 * Originality, design, storytelling
 * → Claude Sonnet / Gemini 3 Pro
 */
const CREATIVE_KEYWORDS = [
  // Creative writing
  'story', 'narrative', 'write', 'generate', 'imagine',
  'creative', 'fiction', 'poem', 'script', 'dialogue',
  
  // Design & branding
  'design', 'brand', 'aesthetic', 'visual', 'concept',
  'logo', 'identity', 'mood board', 'style guide',
  
  // Marketing creative
  'campaign', 'pitch', 'tagline', 'slogan', 'copy',
  'ad creative', 'content strategy', 'viral',
  
  // Innovation
  'vision', 'ideate', 'brainstorm', 'innovative', 'disruptive',
];

/**
 * MULTI_DOMAIN intent keywords
 * Complex queries needing multiple models/perspectives
 * → Multi-model orchestration (Kimi + GPT + Claude)
 */
const MULTI_DOMAIN_KEYWORDS = [
  // Cross-domain
  'compare', 'tradeoff', 'trade-off', 'combine', 'architecture',
  'integrate', 'synthesize', 'cross-functional', 'holistic',
  'end-to-end', 'full stack', 'full-stack', 'system design',
  
  // Complex analysis
  'multi-dimensional', 'comprehensive analysis', 'deep dive',
  'from all angles', 'pros and cons', 'complete picture',
  
  // Technical + business
  'technical strategy', 'tech roadmap', 'build vs buy',
  'scalability', 'cost-benefit', 'feasibility study',
];

/**
 * ANALYTICAL intent keywords
 * Deep thinking, reasoning, explanations
 * → GPT-5.1 / Gemini Pro
 */
const ANALYTICAL_KEYWORDS = [
  // Analysis
  'analyze', 'analysis', 'evaluate', 'assess', 'examine',
  'investigate', 'research', 'study', 'review',
  
  // Reasoning
  'why', 'how does', 'explain', 'reasoning', 'logic',
  'implications', 'consequences', 'impact', 'cause',
  
  // Problem solving
  'solve', 'debug', 'troubleshoot', 'optimize', 'improve',
  'root cause', 'diagnose', 'fix',
];

/**
 * TOOL keywords
 * Indicates tools/external data might be needed
 */
const TOOL_KEYWORDS = [
  'search', 'find', 'lookup', 'look up', 'fetch',
  'calculate', 'compute', 'convert', 'translate',
  'current', 'latest', 'today', 'now', 'real-time',
  'weather', 'stock', 'price', 'news',
];

/**
 * Length thresholds
 */
const LENGTH_THRESHOLDS = {
  INSTANT_MAX: 80,        // Short = instant
  ANALYTICAL_MIN: 150,    // Longer = likely analytical
};

// ============================================================================
// MAIN CLASSIFIER
// ============================================================================

/**
 * Classify Apex plan message intent
 * No policing - only smart routing for premium experience
 *
 * @param message - User's message
 * @returns ApexIntentResult with intent and orchestration hints
 *
 * @example
 * const result = classifyApexIntent('Compare AWS vs GCP vs Azure for our startup');
 * // { intent: 'MULTI_DOMAIN', requiresMultipleModels: true, confidence: 92 }
 */
export function classifyApexIntent(message: string): ApexIntentResult {
  const startTime = Date.now();
  const text = message.toLowerCase();
  const messageLength = message.length;

  let depthScore = 0;
  let requiresTools = false;
  let requiresMultipleModels = false;

  // Score tracking
  let strategicScore = 0;
  let creativeScore = 0;
  let multiDomainScore = 0;
  let analyticalScore = 0;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOOL DETECTION (Refined - dual signal required)
  // Prevents false positives on "current best practice" type queries
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const hasToolKeyword = TOOL_KEYWORDS.some(k => text.includes(k));
  const hasDataContext = 
    text.includes('price') || 
    text.includes('data') || 
    text.includes('search') || 
    text.includes('fetch') ||
    text.includes('stock') ||
    text.includes('weather') ||
    text.includes('news');
  
  if (hasToolKeyword && hasDataContext) {
    requiresTools = true;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INSTANT CHECK (Short, simple queries)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (
    messageLength < LENGTH_THRESHOLDS.INSTANT_MAX &&
    !text.includes('why') &&
    !text.includes('analyze') &&
    !text.includes('compare') &&
    !text.includes('strategy')
  ) {
    return {
      intent: 'INSTANT',
      confidence: 90,
      metadata: {
        requiresTools,
        requiresMultipleModels: false,
        depthScore: 0,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KEYWORD SCORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of STRATEGIC_KEYWORDS) {
    if (text.includes(keyword)) strategicScore += 2;
  }

  for (const keyword of CREATIVE_KEYWORDS) {
    if (text.includes(keyword)) creativeScore += 2;
  }

  for (const keyword of MULTI_DOMAIN_KEYWORDS) {
    if (text.includes(keyword)) multiDomainScore += 3; // Higher weight
  }

  for (const keyword of ANALYTICAL_KEYWORDS) {
    if (text.includes(keyword)) analyticalScore += 1;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LENGTH-BASED DEPTH SCORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (messageLength > LENGTH_THRESHOLDS.ANALYTICAL_MIN) {
    depthScore += 2;
    analyticalScore += 1;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTENT DETERMINATION (Priority order)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const processingTime = Date.now() - startTime;

  // MULTI_DOMAIN - highest priority (needs orchestration)
  // Requires dual signal: multiDomain keywords + (strategic OR analytical context)
  if (multiDomainScore >= 3 && (strategicScore > 0 || analyticalScore > 0)) {
    requiresMultipleModels = true;
    depthScore += 4;
    return {
      intent: 'MULTI_DOMAIN',
      confidence: Math.min(85 + multiDomainScore * 2, 95),
      metadata: {
        requiresTools,
        requiresMultipleModels: true,
        depthScore,
        processingTimeMs: processingTime,
      },
    };
  }

  // STRATEGIC - business/planning focus
  // Requires 2-point dominance over creative (prevents collision)
  if (strategicScore >= 4 && strategicScore >= creativeScore + 2) {
    depthScore += 3;
    return {
      intent: 'STRATEGIC',
      confidence: Math.min(82 + strategicScore, 92),
      metadata: {
        requiresTools,
        requiresMultipleModels: false,
        depthScore,
        processingTimeMs: processingTime,
      },
    };
  }

  // CREATIVE - originality focus
  // Requires 2-point dominance over strategic (prevents collision)
  if (creativeScore >= 4 && creativeScore >= strategicScore + 2) {
    return {
      intent: 'CREATIVE',
      confidence: Math.min(80 + creativeScore, 90),
      metadata: {
        requiresTools,
        requiresMultipleModels: false,
        depthScore: 1,
        processingTimeMs: processingTime,
      },
    };
  }

  // ANALYTICAL - default for complex queries
  if (analyticalScore >= 2 || depthScore >= 2) {
    depthScore += 2;
    return {
      intent: 'ANALYTICAL',
      confidence: Math.min(75 + analyticalScore * 2, 88),
      metadata: {
        requiresTools,
        requiresMultipleModels: false,
        depthScore,
        processingTimeMs: processingTime,
      },
    };
  }

  // INSTANT - default for everything else
  return {
    intent: 'INSTANT',
    confidence: 70,
    metadata: {
      requiresTools,
      requiresMultipleModels: false,
      depthScore: 0,
      processingTimeMs: processingTime,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick check for multi-model requirement
 */
export function requiresMultiModel(message: string): boolean {
  return classifyApexIntent(message).metadata.requiresMultipleModels;
}

/**
 * Quick check for tool requirement
 */
export function requiresTools(message: string): boolean {
  return classifyApexIntent(message).metadata.requiresTools;
}

/**
 * Get intent type only (for simple routing)
 */
export function getApexIntentType(message: string): ApexIntent {
  return classifyApexIntent(message).intent;
}

/**
 * Check if intent needs deep thinking models
 */
export function needsDeepThinking(message: string): boolean {
  const intent = classifyApexIntent(message).intent;
  return intent === 'ANALYTICAL' || intent === 'STRATEGIC' || intent === 'MULTI_DOMAIN';
}

/**
 * Get model recommendation based on intent
 */
export function getRecommendedModels(intent: ApexIntent): string[] {
  switch (intent) {
    case 'INSTANT':
      return ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking'];
    case 'ANALYTICAL':
      return ['gpt-5.1', 'gemini-2.5-pro'];
    case 'STRATEGIC':
      return ['gpt-5.1'];
    case 'CREATIVE':
      return ['claude-sonnet-4-5', 'gemini-3-pro'];
    case 'MULTI_DOMAIN':
      return ['moonshotai/kimi-k2-thinking', 'gpt-5.1', 'claude-sonnet-4-5'];
    default:
      return ['gemini-2.5-flash'];
  }
}

/**
 * Get classifier stats (for debugging/admin)
 */
export function getApexClassifierStats(): {
  strategicKeywords: number;
  creativeKeywords: number;
  multiDomainKeywords: number;
  analyticalKeywords: number;
  toolKeywords: number;
} {
  return {
    strategicKeywords: STRATEGIC_KEYWORDS.length,
    creativeKeywords: CREATIVE_KEYWORDS.length,
    multiDomainKeywords: MULTI_DOMAIN_KEYWORDS.length,
    analyticalKeywords: ANALYTICAL_KEYWORDS.length,
    toolKeywords: TOOL_KEYWORDS.length,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default classifyApexIntent;