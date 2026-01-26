// ============================================================================
// SORIVA DELTA ENGINE v2.2 — DYNAMIC COMPANION EDITION
// ============================================================================
// 
// ✅ BACKWARD COMPATIBLE: Old function signatures still work
// ✅ NEW FEATURES: Companion formula, search trust, domain detection
// ✅ INTELLIGENCE SYNC: Ready for tone-matcher, proactive, emotion
// ✅ TOKEN EFFICIENT: ~120-150 tokens per delta
// ✅ FIX v2.2: Updated search tags to <web_search_data>
//
// MIGRATION: Zero code changes required for existing usage!
// - classifyIntent(plan, message) → still works
// - buildDelta(plan, intent) → still works (returns string)
// - NEW: buildDeltaV2(input) → new object-based API
//
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type PlanType = 'STARTER' | 'LITE' | 'PLUS' | 'PRO' | 'APEX' | 'SOVEREIGN';

export type IntentType = 
  | 'CASUAL' 
  | 'GENERAL' 
  | 'TECHNICAL' 
  | 'LEARNING' 
  | 'CREATIVE'
  | 'PROFESSIONAL'
  | 'ANALYTICAL'
  | 'STRATEGIC'
  | 'PERSONAL'
  | 'QUICK'
  | 'EVERYDAY'
  | 'WORK'
  | 'EXPERT';

export type DomainType = 
  | 'entertainment'
  | 'local'
  | 'finance'
  | 'tech'
  | 'travel'
  | 'health'
  | 'shopping'
  | 'education'
  | 'general';

// V2 Input/Output types
export interface UserContext {
  name?: string;
  location?: string;
  language?: 'english' | 'hinglish' | 'hindi';
  plan: PlanType;
  previousTopics?: string[];
}

export interface SearchContext {
  hasResults: boolean;
  domain?: DomainType;
  confidence?: number;
  resultSnippet?: string;
}

export interface DeltaInput {
  message: string;
  userContext: UserContext;
  searchContext?: SearchContext;
}

export interface DeltaOutput {
  systemPrompt: string;
  intent: IntentType;
  domain: DomainType;
  maxTokens: number;
  proactiveHint: string;
}

// Intelligence sync interface
export interface IntelligenceSync {
  toneAnalysis?: {
    shouldUseHinglish: boolean;
    formalityLevel: 'casual' | 'semi_formal' | 'formal';
  };
  emotionalState?: {
    mood: string;
    stressLevel: number;
  };
  proactiveContext?: {
    recentTopics: string[];
    pendingFollowUps: string[];
  };
}

// ============================================================================
// CORE IDENTITY (Compact, ~25 tokens)
// ============================================================================

const IDENTITY = `You are Soriva, AI by Risenex Dynamics (India). Female tone. Not ChatGPT/Gemini/Claude.`;

// Legacy identity for backward compatibility
export const SORIVA_IDENTITY = IDENTITY;

// ============================================================================
// LANGUAGE RULES
// ============================================================================

const getLanguageRule = (lang?: string): string => {
  if (lang === 'hinglish' || lang === 'hindi') {
    return `Mirror user's Hinglish naturally. No Devanagari script.`;
  }
  return `Match user's language style naturally.`;
};

const LANGUAGE = `LANGUAGE:
- Mirror user: Hinglish→Hinglish, English→English
- Never use Devanagari
- Keep grammar natural to user's tone`;

// ============================================================================
// SEARCH TRUST RULES (Strict)
// ============================================================================

const SEARCH_TRUST = {
  WITH_DATA: `SEARCH DATA PROVIDED: Use it CONFIDENTLY. State facts directly. Never say "pata nahi" or "officially listed nahi" when data exists. Trust the search.`,
  
  WITHOUT_DATA: `NO SEARCH DATA: For real-time info (prices, ratings, scores, news), say "main check karke batati hoon." Never guess or hallucinate.`,
};

// ============================================================================
// COMPANION FORMULA (Core of Dynamic Behavior)
// ============================================================================

const COMPANION_FORMULA = `RESPONSE FORMULA:
1. ANSWER: Direct, confident (from search/knowledge)
2. VALUE: 1 extra insight (context, tip, why it matters)
3. PROACTIVE: Offer relevant next step as question (not pushy)

Keep natural, 3-5 sentences typical. Use name sparingly.`;

// ============================================================================
// BEHAVIOR RULES (Legacy + Enhanced)
// ============================================================================

const BEHAVIOR = `BEHAVIOR:
- No cringe, no role-play, no overwhelming warmth
- Respectful + warm like a smart helpful friend (female tone)
- Use user's name naturally (not every sentence)
- 1 emoji max only when it adds value
- Rude user → neutral but firm
- No mentions of other AI models
- NEVER make up financial data (stocks, crypto, prices)
- No fake real-time data

SEARCH DATA RULE:
- <web_search_data> present → USE it CONFIDENTLY (dates, ratings, prices, scores)
- <web_search_data> absent → Say "check karke batati hoon", NEVER guess
- Trust <web_search_data> over your training data
- NEVER expose XML tags in your response (no <web_search_data>, no [SEARCH RESULT])`;

// ============================================================================
// STYLE RULES
// ============================================================================

const STYLE = `STYLE:
- Clear, structured when needed
- Every sentence must add value
- Avoid fluff, avoid filler
- If list needed → short bullets`;

// ============================================================================
// PROACTIVE HINTS BY DOMAIN
// ============================================================================

const PROACTIVE_HINTS: Record<DomainType, string> = {
  entertainment: `Offer: tickets, showtimes, reviews, similar recommendations, trailers`,
  local: `Offer: contact, directions, timings, booking, alternatives nearby`,
  finance: `Offer: detailed analysis, alerts, trends, portfolio context`,
  tech: `Offer: code examples, documentation, debugging help, related concepts`,
  travel: `Offer: booking, weather, itinerary, local tips, transport options`,
  health: `Offer: nearby specialists, appointment help, reliable sources`,
  shopping: `Offer: price comparison, alternatives, delivery options, reviews`,
  education: `Offer: resources, practice problems, deeper explanation, related topics`,
  general: `Offer: relevant follow-up based on context`,
};

// ============================================================================
// PLAN CONFIGURATIONS
// ============================================================================

interface PlanConfig {
  core: string;
  toneSummary: string;
  intents: Record<string, string>;
  maxTokens: Record<string, number>;
  baseTokens: number;
  intentMultipliers: Partial<Record<IntentType, number>>;
}

const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  STARTER: {
    core: `Tone: Friendly, bhai-vibe, concise.`,
    toneSummary: `Friendly, concise. Max value in few words.`,
    intents: {
      CASUAL: `Short, friendly, 1-3 lines.`,
      GENERAL: `Clear, practical, one example max.`,
      TECHNICAL: `Concept first → short code snippet.`,
      LEARNING: `Explain like a smart friend, analogy if helpful.`,
    },
    maxTokens: {
      CASUAL: 300,
      GENERAL: 600,
      TECHNICAL: 900,
      LEARNING: 800,
    },
    baseTokens: 400,
    intentMultipliers: {
      CASUAL: 0.6,
      GENERAL: 1.0,
      TECHNICAL: 1.5,
      LEARNING: 1.3,
    },
  },
  LITE: {
    core: `Tone: Friendly, helpful, efficient. Give clear answers without fluff.`,
    toneSummary: `Helpful, efficient. Clear without fluff.`,
    intents: {
      CASUAL: `Warm, brief, 2-3 lines max.`,
      GENERAL: `Clear explanation, one example if needed.`,
      TECHNICAL: `Step-by-step, working code snippets.`,
      LEARNING: `Simple explanations, relatable analogies.`,
      CREATIVE: `Practical ideas, helpful suggestions.`,
    },
    maxTokens: {
      CASUAL: 400,
      GENERAL: 800,
      TECHNICAL: 1200,
      LEARNING: 1000,
      CREATIVE: 900,
    },
    baseTokens: 600,
    intentMultipliers: {
      CASUAL: 0.6,
      GENERAL: 1.0,
      TECHNICAL: 1.5,
      LEARNING: 1.3,
      CREATIVE: 1.2,
    },
  },
  PLUS: {
    core: `Treat every question with full attention. Warm but natural.`,
    toneSummary: `Warm companion. Full attention to every query.`,
    intents: {
      EVERYDAY: `Casual, human tone.`,
      CASUAL: `Casual, human tone.`,
      GENERAL: `Thoughtful, complete.`,
      WORK: `Actionable + structured.`,
      TECHNICAL: `Step-by-step with examples.`,
      LEARNING: `Clear explanations with context.`,
      CREATIVE: `Collaborative, encouraging.`,
    },
    maxTokens: {
      EVERYDAY: 500,
      CASUAL: 500,
      GENERAL: 900,
      WORK: 1100,
      TECHNICAL: 1400,
      LEARNING: 1200,
      CREATIVE: 1100,
    },
    baseTokens: 800,
    intentMultipliers: {
      CASUAL: 0.6,
      EVERYDAY: 0.6,
      GENERAL: 1.0,
      WORK: 1.2,
      TECHNICAL: 1.5,
      LEARNING: 1.3,
      CREATIVE: 1.2,
    },
  },
  PRO: {
    core: `Premium companion. Thoughtful, contextual, proactive.`,
    toneSummary: `Thoughtful, contextual. Anticipates needs.`,
    intents: {
      QUICK: `Direct, efficient.`,
      EVERYDAY: `Conversational, warm.`,
      CASUAL: `Conversational, warm.`,
      GENERAL: `Comprehensive, insightful.`,
      WORK: `Professional, actionable.`,
      PROFESSIONAL: `Professional, actionable.`,
      TECHNICAL: `Deep dive with best practices.`,
      LEARNING: `Multi-angle explanation.`,
      CREATIVE: `Collaborative ideation.`,
      ANALYTICAL: `Data-driven, thorough.`,
    },
    maxTokens: {
      QUICK: 600,
      EVERYDAY: 700,
      CASUAL: 700,
      GENERAL: 1200,
      WORK: 1500,
      PROFESSIONAL: 1500,
      TECHNICAL: 2000,
      LEARNING: 1600,
      CREATIVE: 1400,
      ANALYTICAL: 1800,
    },
    baseTokens: 1000,
    intentMultipliers: {
      QUICK: 0.5,
      CASUAL: 0.6,
      EVERYDAY: 0.6,
      GENERAL: 1.0,
      WORK: 1.3,
      PROFESSIONAL: 1.3,
      TECHNICAL: 1.8,
      LEARNING: 1.4,
      CREATIVE: 1.2,
      ANALYTICAL: 1.6,
    },
  },
  APEX: {
    core: `Elite companion. Visionary, strategic, anticipates needs.`,
    toneSummary: `Visionary partner. Strategic, anticipates needs.`,
    intents: {
      QUICK: `Precise, elegant.`,
      EVERYDAY: `Natural, personalized.`,
      CASUAL: `Natural, personalized.`,
      GENERAL: `Rich, contextualized.`,
      WORK: `Strategic, visionary.`,
      PROFESSIONAL: `Strategic, visionary.`,
      TECHNICAL: `Architect-level depth.`,
      EXPERT: `Architect-level depth.`,
      LEARNING: `Mastery-oriented.`,
      CREATIVE: `Innovative partnership.`,
      ANALYTICAL: `Executive-level analysis.`,
      STRATEGIC: `High-level strategic.`,
    },
    maxTokens: {
      QUICK: 800,
      EVERYDAY: 1000,
      CASUAL: 1000,
      GENERAL: 1600,
      WORK: 2000,
      PROFESSIONAL: 2000,
      TECHNICAL: 2500,
      EXPERT: 2500,
      LEARNING: 2000,
      CREATIVE: 1800,
      ANALYTICAL: 2200,
      STRATEGIC: 2400,
    },
    baseTokens: 1500,
    intentMultipliers: {
      QUICK: 0.5,
      CASUAL: 0.6,
      EVERYDAY: 0.6,
      GENERAL: 1.0,
      WORK: 1.3,
      PROFESSIONAL: 1.3,
      TECHNICAL: 1.8,
      EXPERT: 1.8,
      LEARNING: 1.4,
      CREATIVE: 1.2,
      ANALYTICAL: 1.5,
      STRATEGIC: 1.6,
    },
  },
  SOVEREIGN: {
    core: `Ultimate companion. Unlimited depth, personalized excellence.`,
    toneSummary: `Ultimate partner. Unlimited depth and personalization.`,
    intents: {
      QUICK: `Precise, elegant.`,
      EVERYDAY: `Natural, deeply personalized.`,
      CASUAL: `Natural, deeply personalized.`,
      GENERAL: `Exhaustive, multi-dimensional.`,
      WORK: `CEO-level strategic.`,
      PROFESSIONAL: `CEO-level strategic.`,
      TECHNICAL: `World-class engineering depth.`,
      EXPERT: `World-class engineering depth.`,
      LEARNING: `Mastery-path guidance.`,
      CREATIVE: `Visionary co-creation.`,
      ANALYTICAL: `Board-level analysis.`,
      STRATEGIC: `Visionary strategic.`,
    },
    maxTokens: {
      QUICK: 1000,
      EVERYDAY: 1200,
      CASUAL: 1200,
      GENERAL: 2000,
      WORK: 2500,
      PROFESSIONAL: 2500,
      TECHNICAL: 3500,
      EXPERT: 3500,
      LEARNING: 2500,
      CREATIVE: 2200,
      ANALYTICAL: 3000,
      STRATEGIC: 3200,
    },
    baseTokens: 2000,
    intentMultipliers: {
      QUICK: 0.5,
      CASUAL: 0.6,
      EVERYDAY: 0.6,
      GENERAL: 1.0,
      WORK: 1.25,
      PROFESSIONAL: 1.25,
      TECHNICAL: 1.75,
      EXPERT: 1.75,
      LEARNING: 1.25,
      CREATIVE: 1.1,
      ANALYTICAL: 1.5,
      STRATEGIC: 1.6,
    },
  },
};

// ============================================================================
// INTENT CLASSIFIER (BACKWARD COMPATIBLE)
// ============================================================================

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BACKWARD COMPATIBLE: classifyIntent(plan, message)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Same signature as before, enhanced logic
 */
export function classifyIntent(plan: PlanType | string, message: string): string {
  const m = message.toLowerCase();
  const wordCount = message.trim().split(/\s+/).length;
  
  // Quick detection for short messages
  if (wordCount <= 3) {
    const greetings = ['hi', 'hello', 'hey', 'hola', 'namaste', 'good morning', 'good evening'];
    if (greetings.some(g => m.includes(g))) return 'CASUAL';
    return 'QUICK';
  }
  
  // Technical indicators
  const techPatterns = [
    /\b(code|function|api|debug|error|bug|programming|sql|python|javascript|react)\b/i,
    /\b(implement|deploy|database|algorithm|git|npm|docker)\b/i,
    /```|<\/?\w+>/,
  ];
  if (techPatterns.some(p => p.test(m))) return 'TECHNICAL';
  
  // Analytical indicators
  const analyticalPatterns = [
    /\b(analyze|compare|evaluate|assess|metrics|data|statistics|trends)\b/i,
    /\b(report|insight|breakdown|performance|roi|growth)\b/i,
  ];
  if (analyticalPatterns.some(p => p.test(m))) return 'ANALYTICAL';
  
  // Creative indicators
  const creativePatterns = [
    /\b(write|create|design|brainstorm|ideas|story|content|creative)\b/i,
    /\b(marketing|slogan|tagline|poem|script)\b/i,
  ];
  if (creativePatterns.some(p => p.test(m))) return 'CREATIVE';
  
  // Learning indicators
  const learningPatterns = [
    /\b(explain|teach|learn|understand|how does|what is|why does)\b/i,
    /\b(concept|theory|principle|basics|fundamentals)\b/i,
  ];
  if (learningPatterns.some(p => p.test(m))) return 'LEARNING';
  
  // Work/Professional indicators
  const workPatterns = [
    /\b(meeting|email|presentation|proposal|strategy|client|project)\b/i,
    /\b(deadline|schedule|team|manager|business|professional)\b/i,
  ];
  if (workPatterns.some(p => p.test(m))) return 'WORK';
  
  // Strategic (for higher plans)
  if (['APEX', 'SOVEREIGN'].includes(plan as string)) {
    const strategicPatterns = [
      /\b(strategy|roadmap|vision|long-term|market|competitive|expansion)\b/i,
    ];
    if (strategicPatterns.some(p => p.test(m))) return 'STRATEGIC';
  }
  
  // Personal/Casual indicators
  const casualPatterns = [
    /\b(feel|mood|tired|bored|happy|sad|excited|stressed)\b/i,
    /\b(weekend|movie|food|travel|hobby)\b/i,
  ];
  if (casualPatterns.some(p => p.test(m))) return 'CASUAL';
  
  // Default based on message length
  if (wordCount <= 10) return 'QUICK';
  if (wordCount <= 30) return 'GENERAL';
  
  return 'GENERAL';
}

// ============================================================================
// DOMAIN DETECTION
// ============================================================================

function detectDomain(message: string): DomainType {
  const m = message.toLowerCase();
  
  // Entertainment
  if (/\b(movie|film|song|music|album|artist|singer|actor|series|show|netflix|amazon prime|trailer|release|bollywood|hollywood|imdb|rating)\b/i.test(m)) {
    return 'entertainment';
  }
  
  // Finance
  if (/\b(stock|share|price|market|nifty|sensex|crypto|bitcoin|investment|mutual fund|loan|emi|interest rate)\b/i.test(m)) {
    return 'finance';
  }
  
  // Tech
  if (/\b(code|programming|software|app|website|api|database|server|cloud|ai|ml)\b/i.test(m)) {
    return 'tech';
  }
  
  // Travel
  if (/\b(flight|hotel|travel|trip|vacation|booking|destination|visa|passport|airport)\b/i.test(m)) {
    return 'travel';
  }
  
  // Health
  if (/\b(doctor|hospital|medicine|health|symptom|disease|treatment|medical|clinic)\b/i.test(m)) {
    return 'health';
  }
  
  // Shopping
  if (/\b(buy|purchase|order|product|price|discount|sale|amazon|flipkart|shopping)\b/i.test(m)) {
    return 'shopping';
  }
  
  // Education
  if (/\b(course|study|exam|college|university|degree|learn|tutorial|certification)\b/i.test(m)) {
    return 'education';
  }
  
  // Local
  if (/\b(near me|nearby|restaurant|cafe|shop|store|directions|address|contact|timing)\b/i.test(m)) {
    return 'local';
  }
  
  return 'general';
}

// Export for external use
export function getDomain(message: string): DomainType {
  return detectDomain(message);
}

// ============================================================================
// TOKEN CALCULATION
// ============================================================================

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BACKWARD COMPATIBLE: getMaxTokens(plan, intent)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export function getMaxTokens(plan: PlanType | string, intent?: string): number {
  const planConfig = PLAN_CONFIGS[plan as PlanType] || PLAN_CONFIGS.STARTER;
  
  if (intent && planConfig.maxTokens[intent]) {
    return planConfig.maxTokens[intent];
  }
  
  // Fallback to base tokens
  return planConfig.baseTokens || 1000;
}

// ============================================================================
// DELTA BUILDER (BACKWARD COMPATIBLE)
// ============================================================================

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BACKWARD COMPATIBLE: buildDelta(plan, intent) → string
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Returns string (not object) for backward compatibility
 */
export function buildDelta(plan: PlanType | string, intent: string): string {
  const planConfig = PLAN_CONFIGS[plan as PlanType] || PLAN_CONFIGS.STARTER;
  const intentHint = planConfig.intents[intent] || '';
  
  // Detect domain from intent for proactive hint
  const domain = detectDomainFromIntent(intent);
  const proactiveHint = PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general;

  return `${IDENTITY}
${LANGUAGE}
${BEHAVIOR}
${STYLE}
${planConfig.core}
${intentHint}

${COMPANION_FORMULA}
PROACTIVE OPTIONS: ${proactiveHint}`.trim();
}

// Helper to guess domain from intent
function detectDomainFromIntent(intent: string): DomainType {
  const intentDomainMap: Record<string, DomainType> = {
    TECHNICAL: 'tech',
    CREATIVE: 'entertainment',
    LEARNING: 'education',
    PROFESSIONAL: 'general',
    ANALYTICAL: 'general',
    STRATEGIC: 'general',
    PERSONAL: 'general',
  };
  return intentDomainMap[intent] || 'general';
}

// ============================================================================
// V2 API (NEW - Object-based, full features)
// ============================================================================

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NEW V2 API: buildDeltaV2(input) → DeltaOutput
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Full-featured object-based API
 */
export function buildDeltaV2(input: DeltaInput): DeltaOutput {
  const { message, userContext, searchContext } = input;
  
  // 1. Classify intent & domain
  const intent = classifyIntent(userContext.plan, message) as IntentType;
  const domain = searchContext?.domain || detectDomain(message);
  
  // 2. Get plan config
  const planConfig = PLAN_CONFIGS[userContext.plan] || PLAN_CONFIGS.STARTER;
  
  // 3. Build search trust rule
  const searchRule = searchContext?.hasResults 
    ? SEARCH_TRUST.WITH_DATA 
    : SEARCH_TRUST.WITHOUT_DATA;
  
  // 4. Get proactive hint for domain
  const proactiveHint = PROACTIVE_HINTS[domain];
  
  // 5. Build language rule
  const languageRule = getLanguageRule(userContext.language);
  
  // 6. Assemble system prompt
  const systemPrompt = [
    IDENTITY,
    languageRule,
    planConfig.toneSummary,
    searchRule,
    COMPANION_FORMULA,
    `PROACTIVE OPTIONS: ${proactiveHint}`,
  ].join('\n');
  
  // 7. Calculate max tokens
  const maxTokens = getMaxTokens(userContext.plan, intent);
  
  return {
    systemPrompt,
    intent,
    domain,
    maxTokens,
    proactiveHint,
  };
}

/**
 * Quick delta for simple cases
 */
export function buildQuickDelta(
  message: string, 
  plan: PlanType, 
  language?: 'english' | 'hinglish' | 'hindi'
): DeltaOutput {
  return buildDeltaV2({
    message,
    userContext: { plan, language },
    searchContext: { hasResults: false },
  });
}

/**
 * Enhanced delta with intelligence layer
 */
export function buildEnhancedDelta(
  input: DeltaInput,
  intelligence?: IntelligenceSync
): DeltaOutput {
  const baseDelta = buildDeltaV2(input);
  
  if (!intelligence) return baseDelta;
  
  const enhancements: string[] = [];
  
  if (intelligence.toneAnalysis?.shouldUseHinglish) {
    enhancements.push(`User prefers Hinglish. Match their style.`);
  }
  
  if (intelligence.toneAnalysis?.formalityLevel === 'formal') {
    enhancements.push(`Keep tone respectful and professional.`);
  }
  
  if (intelligence.emotionalState?.stressLevel && intelligence.emotionalState.stressLevel > 7) {
    enhancements.push(`User may be stressed. Be extra supportive.`);
  }
  
  if (intelligence.proactiveContext?.pendingFollowUps?.length) {
    const topic = intelligence.proactiveContext.pendingFollowUps[0];
    enhancements.push(`Previous topic to follow up: "${topic}"`);
  }
  
  const enhancedPrompt = enhancements.length > 0
    ? `${baseDelta.systemPrompt}\n\nCONTEXT: ${enhancements.join(' ')}`
    : baseDelta.systemPrompt;
  
  return {
    ...baseDelta,
    systemPrompt: enhancedPrompt,
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

// Get intent (alias for V2 style)
export function getIntent(message: string, plan: PlanType): IntentType {
  return classifyIntent(plan, message) as IntentType;
}

// Clean response utility (preserve if used elsewhere)
export function cleanResponse(response: string): string {
  return response
    .replace(/^(Soriva:|AI:|Assistant:)\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const SorivaDeltaEngine = {
  // Backward compatible
  classifyIntent,
  buildDelta,
  getMaxTokens,
  
  // V2 API
  buildDeltaV2,
  buildSearchDelta,
  buildQuickDelta,
  buildEnhancedDelta,
  getIntent,
  getDomain,
  
  // Constants
  PLANS: PLAN_CONFIGS,
  PROACTIVE_HINTS,
  SEARCH_TRUST,
  IDENTITY,
  SORIVA_IDENTITY,
  
  // Utilities
  cleanResponse,
};

export default SorivaDeltaEngine;

// ============================================================================
// LEGACY EXPORTS (for prompts.ts compatibility)
// ============================================================================
// If ai.service.ts imports from prompts.ts, that file should re-export from here:
// export { classifyIntent, getMaxTokens, SORIVA_IDENTITY, cleanResponse } from './soriva-delta-engine';
// ============================================================================
// ADDITIONAL EXPORTS FOR INDEX.TS COMPATIBILITY
// ============================================================================

// Combined core constants
export const DELTA_CORE = {
  IDENTITY,
  LANGUAGE,
  BEHAVIOR,
  STYLE,
};

// Get proactive hint by domain
export function getProactiveHint(domain: DomainType): string {
  return PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general;
}

// Get search trust rules
export function getSearchTrustRules() {
  return SEARCH_TRUST;
}
// ============================================================================
// MINI PROMPT FOR SEARCH QUERIES (Token Efficient - ~100 tokens)
// ============================================================================

/**
 * Lightweight system prompt for search-based queries
 * Uses ~100 tokens instead of ~1000 tokens
 * Use for: LOCAL_BUSINESS, NEWS, MOVIE (web search), etc.
 */
export function buildSearchDelta(hasSearchData: boolean = true): string {
  return `You are Soriva, AI by Risenex Dynamics (India). Female tone.
LANGUAGE: Mirror user - Hinglish→Hinglish, English→English. No Devanagari.
${hasSearchData 
  ? 'SEARCH DATA: Use <web_search_data> CONFIDENTLY. State facts directly. Trust search over your knowledge.'
  : 'NO DATA: Say "check karke batati hoon". Never guess.'
}
STRICT RULE: If specific names (theatres, restaurants) NOT in search data, say "exact list ke liye BookMyShow/JustDial check karo". NEVER guess or make up names.
IMPORTANT: NEVER show XML tags like <web_search_data> in response. Only use the DATA inside.
RESPONSE: Direct answer (2-4 sentences). 1 helpful follow-up. No fluff.`.trim();
}
// Also export individual constants for backward compatibility
export { IDENTITY, LANGUAGE, BEHAVIOR, STYLE };
export const PLANS = PLAN_CONFIGS;