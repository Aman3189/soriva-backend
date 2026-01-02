// src/core/ai/prompts/pro-delta.ts
// ============================================================================
// SORIVA PRO DELTA v2.0 — Real Learning Partner
// ============================================================================
//
// 🎯 PHILOSOPHY: "Graduate Teacher" + "Thinking Partner"
// - Not just answers, but frameworks to think
// - Professional depth with human warmth
// - Makes user genuinely smarter, not just informed
// - "Isse better koi nahi samjha sakta"
//
// 🔥 SORIVA PRINCIPLES:
// - "HAAR NAHI MANEGA" - Never refuse, never hold back
// - Real depth, real reasoning, real value
// - User walks away SMARTER, not just with an answer
// - ZERO upgrade pitches - PRO users deserve premium treatment
//
// 💡 USER FEELING:
// - "Ye sirf answer nahi deta, sochna sikhata hai"
// - "Professional hai but robotic nahi"
// - "Iske saath kaam karna = growth"
//
// TOKEN COST: ~100-150 tokens per delta
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type ProIntent = 'EVERYDAY' | 'PROFESSIONAL' | 'EXPERT' | 'TECHNICAL';

// ============================================================================
// CORE PROMPT
// ============================================================================

const PRO_CORE = `You are a thinking partner - someone who makes people genuinely smarter.

Your Philosophy:
- Don't just answer, teach the framework behind the answer
- Professional depth with human warmth
- Every response should leave them more capable
- Treat their problem like it matters (because it does)

Rules:
- Give complete, well-reasoned responses
- Show your thinking when it adds value
- Be direct but never cold
- Challenge gently when needed
- Never mention plans, limits, or upgrades`;

// ============================================================================
// INTENT-SPECIFIC DELTAS
// ============================================================================

const INTENT_DELTAS: Record<ProIntent, string> = {
  EVERYDAY: `This is casual conversation with a professional.
Be warm, direct, efficient.
No need to over-explain - they're smart.
Match their energy.`,

  PROFESSIONAL: `User needs professional-grade thinking.
Structure your response clearly:
- Lead with the answer/recommendation
- Then explain the reasoning
- Offer alternatives if relevant
End with a clear next step or decision point.`,

  EXPERT: `This requires deep, expert-level analysis.
Think through this properly:
- Consider multiple angles
- Weigh trade-offs explicitly
- Challenge assumptions (including theirs)
- Be specific, not generic
Your response should feel like consulting a senior expert.`,

  TECHNICAL: `User needs technical expertise.
Be precise and thorough:
- Explain concept clearly first
- Code should be clean, commented, production-ready
- Anticipate edge cases
- Offer architecture insights when relevant
Make them a better developer, not just give them code.`,
};

// ============================================================================
// PRO TOUCHES - Rotating for variety
// ============================================================================

const PRO_TOUCHES = [
  `Your goal: they should walk away smarter, not just with an answer.`,
  `Think like their smartest colleague who genuinely wants them to succeed.`,
  `This is someone investing in real growth. Match that energy.`,
  `Be the expert they wish they had access to.`,
];

// ============================================================================
// CONTEXT ENHANCERS - Optional depth layers
// ============================================================================

const CONTEXT_ENHANCERS = {
  STRATEGY: `Think about long-term implications and positioning.
Offer phased approaches with clear milestones.`,

  ARCHITECTURE: `Consider scalability, maintainability, and real-world constraints.
Think about what could go wrong and how to prevent it.`,

  FINANCIAL: `Ground your analysis in numbers where possible.
Consider risk, opportunity cost, and ROI.`,

  CREATIVE: `Balance innovation with practicality.
Offer multiple directions with clear trade-offs.`,

  LEARNING: `Build understanding from first principles.
Connect new concepts to things they already know.`,
};

// ============================================================================
// HASH FUNCTION - Deterministic selection
// ============================================================================

/**
 * Generate consistent hash from message
 * Same input → Same output (always)
 */
function generateHash(message: string): number {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Select PRO touch deterministically
 * Consistent, debuggable, reproducible
 */
function selectProTouch(message: string): string {
  const hash = generateHash(message);
  return PRO_TOUCHES[hash % PRO_TOUCHES.length];
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get PRO delta prompt
 * Combines: CORE + Intent Delta + Deterministic Touch
 * 
 * @param intent - Classified intent type
 * @param message - User message (for deterministic touch selection)
 * @returns Complete delta prompt string (~100-120 tokens)
 */
export function getProDelta(intent: ProIntent = 'EVERYDAY', message: string = ''): string {
  const touch = message ? selectProTouch(message) : PRO_TOUCHES[0];
  return `${PRO_CORE}\n\n${INTENT_DELTAS[intent]}\n\n${touch}`;
}

/**
 * Get PRO delta with context enhancement
 * For specialized queries that need extra depth
 * 
 * @param intent - Classified intent type
 * @param context - Optional context flags
 * @param message - User message (for deterministic touch selection)
 * @returns Enhanced delta prompt (~130-150 tokens)
 */
export function getProDeltaWithContext(
  intent: ProIntent,
  context?: {
    isStrategy?: boolean;
    isArchitecture?: boolean;
    isFinancial?: boolean;
    isCreative?: boolean;
    isLearning?: boolean;
  },
  message: string = ''
): string {
  let delta = getProDelta(intent, message);

  if (!context) return delta;

  // Add context enhancer if applicable
  if (context.isStrategy) {
    delta += `\n\n${CONTEXT_ENHANCERS.STRATEGY}`;
  } else if (context.isArchitecture) {
    delta += `\n\n${CONTEXT_ENHANCERS.ARCHITECTURE}`;
  } else if (context.isFinancial) {
    delta += `\n\n${CONTEXT_ENHANCERS.FINANCIAL}`;
  } else if (context.isCreative) {
    delta += `\n\n${CONTEXT_ENHANCERS.CREATIVE}`;
  } else if (context.isLearning) {
    delta += `\n\n${CONTEXT_ENHANCERS.LEARNING}`;
  }

  return delta;
}

/**
 * Get max response tokens for intent
 * PRO gets generous limits - real expertise needs space
 */
export function getMaxResponseTokens(intent: ProIntent = 'EVERYDAY'): number {
  const caps: Record<ProIntent, number> = {
    EVERYDAY: 800,     // Casual but complete
    PROFESSIONAL: 1500, // Business decisions need depth
    EXPERT: 2000,      // Deep analysis needs room
    TECHNICAL: 1800,   // Code + explanation
  };
  return caps[intent];
}

/**
 * Get token estimate for delta prompt
 */
export function getProDeltaTokenEstimate(intent: ProIntent = 'EVERYDAY'): number {
  const estimates: Record<ProIntent, number> = {
    EVERYDAY: 100,
    PROFESSIONAL: 120,
    EXPERT: 130,
    TECHNICAL: 125,
  };
  return estimates[intent];
}

// ============================================================================
// INTENT CLASSIFIER
// ============================================================================

/**
 * Classify PRO user intent
 * More sophisticated - recognizes professional vs expert vs technical
 */
export function classifyProIntent(message: string): ProIntent {
  const msg = message.toLowerCase();

  // TECHNICAL indicators (highest priority for PRO)
  const technicalKeywords = [
    'code', 'function', 'api', 'database', 'error', 'bug', 'debug',
    'typescript', 'javascript', 'python', 'react', 'node', 'sql',
    'architecture', 'system design', 'algorithm', 'optimization',
    'deploy', 'server', 'aws', 'docker', 'kubernetes',
    'git', 'ci/cd', 'testing', 'performance',
  ];

  // EXPERT indicators
  const expertKeywords = [
    'analyze', 'deep dive', 'comprehensive', 'thorough',
    'trade-offs', 'tradeoffs', 'pros and cons', 'risks',
    'strategy', 'long-term', 'implications', 'impact',
    'evaluate', 'assess', 'compare options',
    'complex', 'nuanced', 'detailed analysis',
    'architecture decision', 'critical', 'high stakes',
  ];

  // PROFESSIONAL indicators
  const professionalKeywords = [
    'business', 'project', 'plan', 'proposal', 'presentation',
    'client', 'stakeholder', 'meeting', 'email', 'report',
    'decision', 'recommend', 'approach', 'framework',
    'pricing', 'revenue', 'growth', 'market',
    'team', 'process', 'workflow', 'roadmap',
  ];

  // Check in priority order
  if (technicalKeywords.some(k => msg.includes(k))) return 'TECHNICAL';
  if (expertKeywords.some(k => msg.includes(k))) return 'EXPERT';
  if (professionalKeywords.some(k => msg.includes(k))) return 'PROFESSIONAL';
  
  return 'EVERYDAY';
}

/**
 * Detect context for enhanced delta
 */
export function detectProContext(message: string): {
  isStrategy?: boolean;
  isArchitecture?: boolean;
  isFinancial?: boolean;
  isCreative?: boolean;
  isLearning?: boolean;
} {
  const msg = message.toLowerCase();

  return {
    isStrategy: /strategy|positioning|market|competitive|roadmap|long.?term/i.test(msg),
    isArchitecture: /architecture|system design|scalab|infrastructure|microservice/i.test(msg),
    isFinancial: /revenue|pricing|roi|budget|financial|investment|cost/i.test(msg),
    isCreative: /creative|brainstorm|idea|concept|design|brand|content/i.test(msg),
    isLearning: /explain|understand|learn|teach|concept|why does|how does/i.test(msg),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { PRO_CORE, INTENT_DELTAS, PRO_TOUCHES, CONTEXT_ENHANCERS };
export default getProDelta;