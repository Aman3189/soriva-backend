// src/core/ai/prompts/apex-intent-classifier.ts
// ============================================================================
// SORIVA APEX INTENT CLASSIFIER v2.1 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Smart intent detection for APEX (premium) users
// NO policing - only intelligent routing for premium experience
//
// INTENT TYPES (Aligned with apex-delta.ts):
// - QUICK:      Fast, sharp responses (short queries)
// - ANALYTICAL: Deep thinking, reasoning, trade-offs
// - STRATEGIC:  Long-term, big picture planning
// - CREATIVE:   Original, boundary-pushing ideas
// - TECHNICAL:  Code, architecture, systems
// - LEARNING:   Teaching, explaining, mentoring
// - PERSONAL:   Life advice, emotional intelligence
//
// NUDGE TYPES:
// - SIMPLIFY:  User confused/overwhelmed → "Want me to simplify this?"
// - DECIDE:    User needs decision help → "Want me to decide this for you?"
// - ACTION:    User needs next steps → "Want clear next steps?"
// - null:      No nudge needed
//
// TOKEN COST: 0 (pure keyword matching)
// CPU COST: ~0ms (ultra-light)
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type ApexIntent =
  | 'QUICK'
  | 'ANALYTICAL'
  | 'STRATEGIC'
  | 'CREATIVE'
  | 'TECHNICAL'
  | 'LEARNING'
  | 'PERSONAL';

// Nudge types for contextual single-line nudge
export type NudgeType = 'SIMPLIFY' | 'DECIDE' | 'ACTION' | null;

export interface ApexIntentResult {
  intent: ApexIntent;
  confidence: number;
  nudgeType: NudgeType;
  metadata: {
    requiresTools: boolean;
    depthScore: number;
    processingTimeMs: number;
  };
}

// ============================================================================
// KEYWORD DEFINITIONS
// ============================================================================

/**
 * PERSONAL intent keywords
 * Life, emotions, relationships, decisions
 */
const PERSONAL_KEYWORDS = [
  // Emotions
  'feel', 'feeling', 'stressed', 'anxious', 'worried', 'confused',
  'overwhelmed', 'lost', 'stuck', 'frustrated', 'happy', 'excited',
  'scared', 'nervous', 'sad', 'angry', 'lonely',
  // Life decisions
  'relationship', 'family', 'friend', 'life', 'career', 'decision',
  'should i', 'what should', 'advice', 'help me decide',
  'struggling', 'dealing with', 'going through',
  // Personal growth
  'motivation', 'confidence', 'self-doubt', 'imposter',
  'work-life', 'balance', 'burnout', 'mental health',
];

/**
 * TECHNICAL intent keywords
 * Code, systems, architecture, debugging
 */
const TECHNICAL_KEYWORDS = [
  // Programming
  'code', 'function', 'api', 'database', 'error', 'bug', 'debug',
  'typescript', 'javascript', 'python', 'react', 'node', 'sql',
  'prisma', 'nextjs', 'flutter', 'dart', 'rust', 'golang',
  // Architecture
  'architecture', 'system design', 'algorithm', 'optimization',
  'scalability', 'performance', 'infrastructure', 'microservice',
  // DevOps
  'deploy', 'server', 'aws', 'docker', 'kubernetes', 'ci/cd',
  'authentication', 'security', 'testing', 'git',
];

/**
 * CREATIVE intent keywords
 * Ideas, design, content, innovation
 */
const CREATIVE_KEYWORDS = [
  // Creative writing
  'creative', 'story', 'narrative', 'write', 'fiction', 'poem',
  'script', 'dialogue', 'content', 'blog', 'article',
  // Design & branding
  'design', 'brand', 'logo', 'visual', 'concept', 'aesthetic',
  'tagline', 'slogan', 'campaign', 'marketing',
  // Innovation
  'idea', 'brainstorm', 'ideate', 'innovative', 'unique',
  'original', 'fresh', 'vision', 'disruptive',
  // Social media
  'social media', 'instagram', 'twitter', 'post', 'caption',
];

/**
 * STRATEGIC intent keywords
 * Business, long-term, planning
 */
const STRATEGIC_KEYWORDS = [
  // Business strategy
  'strategy', 'strategic', 'roadmap', 'long-term', 'long term',
  'business', 'growth', 'scale', 'expand', 'market',
  'competitive', 'positioning', 'business model',
  // Planning
  'planning', 'forecast', 'projection', 'milestone',
  'quarterly', 'annual', 'okr', 'kpi', 'goals',
  // Investment
  'investment', 'roi', 'funding', 'valuation', 'exit',
  'acquisition', 'investor', 'pitch', 'startup',
  // Decision making
  'prioritization', 'resource allocation', 'risk assessment',
];

/**
 * ANALYTICAL intent keywords
 * Deep thinking, analysis, reasoning
 */
const ANALYTICAL_KEYWORDS = [
  // Analysis
  'analyze', 'analysis', 'evaluate', 'assess', 'examine',
  'investigate', 'research', 'study', 'review', 'audit',
  // Reasoning
  'why does', 'how does', 'reasoning', 'logic', 'implications',
  'consequences', 'impact', 'cause', 'root cause',
  // Comparison
  'compare', 'trade-off', 'tradeoff', 'pros and cons',
  'advantages', 'disadvantages', 'versus', 'vs',
  // Deep dive
  'deep dive', 'thorough', 'comprehensive', 'detailed',
  'in-depth', 'factors', 'evidence', 'data',
];

/**
 * LEARNING intent keywords
 * Understanding, explanation, teaching
 */
const LEARNING_KEYWORDS = [
  // Questions
  'explain', 'what is', 'what are', 'how to', 'why is',
  'understand', 'learn', 'teach', 'help me understand',
  // Concepts
  'concept', 'basics', 'fundamentals', 'introduction',
  'beginner', 'tutorial', 'guide', 'meaning', 'definition',
  // Hindi/Hinglish
  'samjhao', 'batao', 'sikho', 'kaise', 'kyun', 'kya hai',
];

/**
 * TOOL keywords - indicates external data might be needed
 */
const TOOL_KEYWORDS = [
  'search', 'find', 'lookup', 'fetch', 'current', 'latest',
  'today', 'now', 'real-time', 'weather', 'stock', 'price', 'news',
];

// ============================================================================
// NUDGE DETECTION KEYWORDS
// ============================================================================

/**
 * SIMPLIFY nudge - user is confused/overwhelmed
 * Shows: "Want me to simplify this?"
 */
const SIMPLIFY_KEYWORDS = [
  'confused', 'confusing', 'overwhelming', 'overwhelmed',
  'too much', 'complicated', 'complex', 'dont understand',
  "don't understand", 'not sure', 'lost', 'stuck',
  'hard to understand', 'difficult to', 'cant figure',
  "can't figure", 'makes no sense', 'unclear',
  // Hindi/Hinglish
  'samajh nahi', 'pata nahi', 'confused hu', 'clear nahi',
  'mushkil', 'difficult', 'समझ नहीं',
];

/**
 * DECIDE nudge - user needs decision help
 * Shows: "Want me to decide this for you?"
 */
const DECIDE_KEYWORDS = [
  'should i', 'should we', 'is it better', 'which one',
  'or should', 'what would you', 'recommend', 'suggestion',
  'choose between', 'decide', 'decision', 'dilemma',
  'better option', 'best choice', 'what do you think',
  'worth it', 'good idea', 'bad idea',
  // Hindi/Hinglish
  'kya karu', 'kaun sa', 'konsa', 'sahi rahega',
  'better hai', 'theek rahega', 'karna chahiye',
];

/**
 * ACTION nudge - user needs next steps
 * Shows: "Want clear next steps?"
 */
const ACTION_KEYWORDS = [
  'how do i', 'how to', 'next step', 'what should i do',
  'where do i start', 'get started', 'begin', 'first step',
  'grow', 'scale', 'improve', 'increase', 'achieve',
  'plan', 'roadmap', 'strategy', 'way forward',
  'practical', 'actionable', 'steps to',
  // Hindi/Hinglish
  'kaise karu', 'shuru karu', 'aage kya', 'kya karna hai',
  'plan batao', 'steps batao',
];

// ============================================================================
// LENGTH THRESHOLDS
// ============================================================================

const LENGTH_THRESHOLDS = {
  QUICK_MAX: 60,          // Very short = QUICK
  ANALYTICAL_MIN: 120,    // Longer = likely needs depth
};

// ============================================================================
// NUDGE TYPE DETECTION
// ============================================================================

/**
 * Detect nudge type from message
 * Priority: SIMPLIFY > DECIDE > ACTION
 */
function detectNudgeType(text: string): NudgeType {
  const lowerText = text.toLowerCase();

  // Check SIMPLIFY (confusion/overwhelm) - highest priority
  for (const keyword of SIMPLIFY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'SIMPLIFY';
    }
  }

  // Check DECIDE (decision needed)
  for (const keyword of DECIDE_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'DECIDE';
    }
  }

  // Check ACTION (next steps needed)
  for (const keyword of ACTION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'ACTION';
    }
  }

  return null;
}

// ============================================================================
// MAIN CLASSIFIER
// ============================================================================

/**
 * Classify APEX user intent
 * Premium users deserve precise, intelligent routing
 *
 * @param message - User's message
 * @returns ApexIntentResult with intent, nudgeType, and metadata
 * 
 * @example
 * const result = classifyApexIntent('Design a scalable architecture');
 * // { intent: 'TECHNICAL', confidence: 85, nudgeType: null }
 * 
 * @example
 * const result = classifyApexIntent("I'm confused about system design");
 * // { intent: 'TECHNICAL', confidence: 80, nudgeType: 'SIMPLIFY' }
 */
export function classifyApexIntent(message: string): ApexIntentResult {
  const startTime = Date.now();
  const text = message.toLowerCase();
  const messageLength = message.length;
  let depthScore = 0;
  let requiresTools = false;

  // Score tracking
  const scores = {
    personal: 0,
    technical: 0,
    creative: 0,
    strategic: 0,
    analytical: 0,
    learning: 0,
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NUDGE TYPE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const nudgeType = detectNudgeType(text);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOOL DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (TOOL_KEYWORDS.some(k => text.includes(k))) {
    requiresTools = true;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUICK CHECK (Very short, simple queries)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const isSimpleQuery = 
    messageLength < LENGTH_THRESHOLDS.QUICK_MAX &&
    !text.includes('explain') &&
    !text.includes('why') &&
    !text.includes('analyze') &&
    !text.includes('help me');

  if (isSimpleQuery) {
    return createResult('QUICK', 90, nudgeType, requiresTools, 0, startTime);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KEYWORD SCORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of PERSONAL_KEYWORDS) {
    if (text.includes(keyword)) scores.personal += 3; // High weight - important to detect
  }

  for (const keyword of TECHNICAL_KEYWORDS) {
    if (text.includes(keyword)) scores.technical += 2;
  }

  for (const keyword of CREATIVE_KEYWORDS) {
    if (text.includes(keyword)) scores.creative += 2;
  }

  for (const keyword of STRATEGIC_KEYWORDS) {
    if (text.includes(keyword)) scores.strategic += 2;
  }

  for (const keyword of ANALYTICAL_KEYWORDS) {
    if (text.includes(keyword)) scores.analytical += 2;
  }

  for (const keyword of LEARNING_KEYWORDS) {
    if (text.includes(keyword)) scores.learning += 2;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LENGTH-BASED DEPTH SCORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (messageLength > LENGTH_THRESHOLDS.ANALYTICAL_MIN) {
    depthScore += 2;
    scores.analytical += 1;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTENT DETERMINATION (Priority order)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Find highest scoring intent
  const maxScore = Math.max(...Object.values(scores));

  // PERSONAL - Highest priority (emotional intelligence matters)
  if (scores.personal >= 3 && scores.personal >= maxScore) {
    return createResult('PERSONAL', Math.min(80 + scores.personal * 2, 95), nudgeType, requiresTools, 2, startTime);
  }

  // TECHNICAL - Code/architecture queries
  if (scores.technical >= 4 && scores.technical >= maxScore) {
    depthScore += 2;
    return createResult('TECHNICAL', Math.min(82 + scores.technical, 94), nudgeType, requiresTools, depthScore, startTime);
  }

  // STRATEGIC - Business/planning focus
  if (scores.strategic >= 4 && scores.strategic >= maxScore) {
    depthScore += 3;
    return createResult('STRATEGIC', Math.min(82 + scores.strategic, 93), nudgeType, requiresTools, depthScore, startTime);
  }

  // CREATIVE - Originality focus
  if (scores.creative >= 4 && scores.creative >= maxScore) {
    return createResult('CREATIVE', Math.min(80 + scores.creative, 92), nudgeType, requiresTools, 1, startTime);
  }

  // LEARNING - Teaching/explanation
  if (scores.learning >= 2 && scores.learning >= maxScore) {
    return createResult('LEARNING', Math.min(78 + scores.learning * 2, 90), nudgeType, requiresTools, 2, startTime);
  }

  // ANALYTICAL - Deep thinking (default for complex)
  if (scores.analytical >= 2 || depthScore >= 2) {
    depthScore += 2;
    return createResult('ANALYTICAL', Math.min(75 + scores.analytical * 2, 90), nudgeType, requiresTools, depthScore, startTime);
  }

  // QUICK - Default for everything else
  return createResult('QUICK', 70, nudgeType, requiresTools, 0, startTime);
}

/**
 * Helper to create result object
 */
function createResult(
  intent: ApexIntent,
  confidence: number,
  nudgeType: NudgeType,
  requiresTools: boolean,
  depthScore: number,
  startTime: number
): ApexIntentResult {
  return {
    intent,
    confidence,
    nudgeType,
    metadata: {
      requiresTools,
      depthScore,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get intent type only (for simple routing)
 */
export function getApexIntentType(message: string): ApexIntent {
  return classifyApexIntent(message).intent;
}

/**
 * Get nudge type only
 */
export function getApexNudgeType(message: string): NudgeType {
  return classifyApexIntent(message).nudgeType;
}

/**
 * Check if nudge should be shown
 */
export function shouldShowNudge(message: string): boolean {
  return classifyApexIntent(message).nudgeType !== null;
}

/**
 * Get nudge text based on nudge type
 */
export function getNudgeText(nudgeType: NudgeType): string {
  switch (nudgeType) {
    case 'SIMPLIFY':
      return 'Want me to simplify this?';
    case 'DECIDE':
      return 'Want me to decide this for you?';
    case 'ACTION':
      return 'Want clear next steps?';
    default:
      return '';
  }
}

/**
 * Quick check for tool requirement
 */
export function requiresTools(message: string): boolean {
  return classifyApexIntent(message).metadata.requiresTools;
}

/**
 * Check if intent needs deep thinking
 */
export function needsDeepThinking(message: string): boolean {
  const intent = classifyApexIntent(message).intent;
  return ['ANALYTICAL', 'STRATEGIC', 'TECHNICAL'].includes(intent);
}

/**
 * Check if intent needs emotional intelligence
 */
export function needsEmotionalIntelligence(message: string): boolean {
  return classifyApexIntent(message).intent === 'PERSONAL';
}

/**
 * Get model recommendation based on intent
 */
export function getRecommendedModels(intent: ApexIntent): string[] {
  switch (intent) {
    case 'QUICK':
      return ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking'];
    case 'ANALYTICAL':
      return ['gpt-5.1', 'gemini-2.5-pro'];
    case 'STRATEGIC':
      return ['gpt-5.1', 'claude-sonnet-4-5'];
    case 'CREATIVE':
      return ['claude-sonnet-4-5', 'gemini-3-pro'];
    case 'TECHNICAL':
      return ['gpt-5.1', 'claude-sonnet-4-5'];
    case 'LEARNING':
      return ['claude-sonnet-4-5', 'gemini-2.5-pro'];
    case 'PERSONAL':
      return ['claude-sonnet-4-5']; // Best for emotional intelligence
    default:
      return ['gemini-2.5-flash'];
  }
}

/**
 * Get classifier stats (for debugging/admin)
 */
export function getApexClassifierStats(): {
  personalKeywords: number;
  technicalKeywords: number;
  creativeKeywords: number;
  strategicKeywords: number;
  analyticalKeywords: number;
  learningKeywords: number;
  nudgeKeywords: { simplify: number; decide: number; action: number };
} {
  return {
    personalKeywords: PERSONAL_KEYWORDS.length,
    technicalKeywords: TECHNICAL_KEYWORDS.length,
    creativeKeywords: CREATIVE_KEYWORDS.length,
    strategicKeywords: STRATEGIC_KEYWORDS.length,
    analyticalKeywords: ANALYTICAL_KEYWORDS.length,
    learningKeywords: LEARNING_KEYWORDS.length,
    nudgeKeywords: {
      simplify: SIMPLIFY_KEYWORDS.length,
      decide: DECIDE_KEYWORDS.length,
      action: ACTION_KEYWORDS.length,
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default classifyApexIntent;