// ============================================================================
// SORIVA DELTA ENGINE v2.4 — CENTRALIZED INSTRUCTIONS EDITION
// ============================================================================
// 
// ✅ BACKWARD COMPATIBLE: Old function signatures still work
// ✅ NEW FEATURES: Companion formula, search trust, domain detection
// ✅ INTELLIGENCE SYNC: Ready for tone-matcher, proactive, emotion
// ✅ TOKEN EFFICIENT: ~120-150 tokens per delta
// ✅ FIX v2.2: Updated search tags to <web_search_data>
// ✅ v2.3: Centralized instructions from soriva-core-instructions.ts
// ✅ v2.4: Added buildGreetingDelta + fixed buildSearchDelta signature
//
// MIGRATION: Zero code changes required for existing usage!
// - classifyIntent(plan, message) → still works
// - buildDelta(plan, intent) → still works (returns string)
// - NEW: buildDeltaV2(input) → new object-based API
// - NEW: buildGreetingDelta(plan, userName, message) → greeting prompt
// - FIXED: buildSearchDelta(hasData, message, location) → 3 params
//
// ============================================================================

// ============================================================================
// IMPORTS FROM CENTRAL SOURCE OF TRUTH
// ============================================================================

import {
  // Data objects
  COMPANY,
  IDENTITY as CORE_IDENTITY,
  TONE,
  LANGUAGE as CORE_LANGUAGE,
  BEHAVIOR as CORE_BEHAVIOR,
  STYLE as CORE_STYLE,
  FORBIDDEN,
  CONSISTENCY,
  
  // Formatted prompts
  LLM_UNLOCK,
  IDENTITY_PROMPT,
  TONE_PROMPT,
  LANGUAGE_PROMPT,
  BEHAVIOR_PROMPT,
  STYLE_PROMPT,
  FORBIDDEN_PROMPT,
  CONSISTENCY_PROMPT,
  
  // Builder functions
  buildBaseSystemPrompt,
  buildSearchAwarePrompt,
  
  // Types
  type ContextType,
} from './soriva-core-instructions';

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
// PLAN BADGE MAPPING (for greeting warmth)
// ============================================================================

const PLAN_BADGES: Record<PlanType, { badge: string; warmth: 'high' | 'moderate' | 'standard' }> = {
  STARTER: { badge: 'Starter', warmth: 'standard' },
  LITE: { badge: 'Lite', warmth: 'standard' },
  PLUS: { badge: 'Plus ⭐', warmth: 'moderate' },
  PRO: { badge: 'Pro 🌟', warmth: 'moderate' },
  APEX: { badge: 'Apex 💎', warmth: 'high' },
  SOVEREIGN: { badge: 'Sovereign 👑', warmth: 'high' },
};

// ============================================================================
// CORE IDENTITY (Now imported from soriva-core-instructions.ts)
// ============================================================================

// Use the core identity - compact version for token efficiency
const IDENTITY = `You are Soriva, female AI by ${COMPANY.name} (${COMPANY.country}). Helpful, intelligent, personable.`;

// Legacy identity for backward compatibility
export const SORIVA_IDENTITY = IDENTITY;

// ============================================================================
// LANGUAGE RULES (Now uses core language rules)
// ============================================================================

const getLanguageRule = (lang?: string): string => {
  // Use core language rules
  if (lang === 'hinglish' || lang === 'hindi') {
    return CORE_LANGUAGE.mirrorRule + ' ' + CORE_LANGUAGE.devanagariRule;
  }
  return CORE_LANGUAGE.mirrorRule;
};

// Compact version for prompts
const LANGUAGE = LANGUAGE_PROMPT;

// ============================================================================
// SEARCH TRUST RULES (Uses core behavior rules)
// ============================================================================

const SEARCH_TRUST = {
  WITH_DATA: CORE_BEHAVIOR.searchTrust.withData,
  WITHOUT_DATA: CORE_BEHAVIOR.searchTrust.withoutData,
};

// ============================================================================
// COMPANION FORMULA (Enhanced with core behavior rules)
// ============================================================================

const COMPANION_FORMULA = `RESPONSE STYLE:
1. ANSWER what user asked (direct, confident)
2. ADD 1 useful insight if relevant (not forced)
3. FLOW naturally - ask followup only if genuinely needed for clarity

LENGTH: ${CORE_BEHAVIOR.response.matchComplexity}
PRECISION RULE: ${TONE.precisionRule}`;

// ============================================================================
// BEHAVIOR RULES (Now imported from soriva-core-instructions.ts)
// ============================================================================

// Use the full behavior prompt from core
const BEHAVIOR = BEHAVIOR_PROMPT;

// ============================================================================
// STYLE RULES (Now imported from soriva-core-instructions.ts)
// ============================================================================

// Use the style prompt from core
const STYLE = STYLE_PROMPT;

// ============================================================================
// PROACTIVE HINTS BY DOMAIN (Compact)
// ============================================================================

const PROACTIVE_HINTS: Record<DomainType, string> = {
  entertainment: `Can offer: showtimes, reviews, similar picks, trailers`,
  local: `Can offer: contact, directions, timings, alternatives`,
  finance: `Can offer: analysis, trends, alerts`,
  tech: `Can offer: code examples, docs, debugging`,
  travel: `Can offer: booking, weather, tips`,
  health: `Can offer: specialists nearby, reliable sources`,
  shopping: `Can offer: price compare, alternatives, reviews`,
  education: `Can offer: resources, practice, deeper explanation`,
  general: `Can offer: relevant follow-up based on context`,
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
    core: `Friendly, concise. Bhai-vibe.`,
    toneSummary: `Friendly, max value in few words.`,
    intents: {
      CASUAL: `1-3 lines, friendly.`,
      GENERAL: `Clear, practical.`,
      TECHNICAL: `Concept → short code.`,
      LEARNING: `Simple explanation, analogy if helpful.`,
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
    core: `Helpful, efficient. Clear without fluff.`,
    toneSummary: `Helpful, efficient.`,
    intents: {
      CASUAL: `Warm, 2-3 lines.`,
      GENERAL: `Clear, one example if needed.`,
      TECHNICAL: `Step-by-step, working code.`,
      LEARNING: `Simple, relatable analogies.`,
      CREATIVE: `Practical ideas.`,
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
    core: `Warm companion. Full attention.`,
    toneSummary: `Warm, attentive.`,
    intents: {
      EVERYDAY: `Casual, human.`,
      CASUAL: `Casual, human.`,
      GENERAL: `Thoughtful, complete.`,
      WORK: `Actionable, structured.`,
      TECHNICAL: `Step-by-step with examples.`,
      LEARNING: `Clear with context.`,
      CREATIVE: `Collaborative.`,
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
    core: `Premium companion. Thoughtful, proactive.`,
    toneSummary: `Thoughtful, anticipates needs.`,
    intents: {
      QUICK: `Direct, efficient.`,
      EVERYDAY: `Conversational.`,
      CASUAL: `Conversational.`,
      GENERAL: `Comprehensive.`,
      WORK: `Professional, actionable.`,
      PROFESSIONAL: `Professional, actionable.`,
      TECHNICAL: `Deep dive, best practices.`,
      LEARNING: `Multi-angle explanation.`,
      CREATIVE: `Collaborative ideation.`,
      ANALYTICAL: `Data-driven.`,
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
    core: `Elite companion. Strategic, anticipates needs.`,
    toneSummary: `Visionary partner.`,
    intents: {
      QUICK: `Precise, elegant.`,
      EVERYDAY: `Natural, personalized.`,
      CASUAL: `Natural, personalized.`,
      GENERAL: `Rich, contextualized.`,
      WORK: `Strategic, visionary.`,
      PROFESSIONAL: `Strategic, visionary.`,
      TECHNICAL: `Architect-level.`,
      EXPERT: `Architect-level.`,
      LEARNING: `Mastery-oriented.`,
      CREATIVE: `Innovative partnership.`,
      ANALYTICAL: `Executive-level.`,
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
    toneSummary: `Ultimate partner. Unlimited.`,
    intents: {
      QUICK: `Precise, elegant.`,
      EVERYDAY: `Deeply personalized.`,
      CASUAL: `Deeply personalized.`,
      GENERAL: `Exhaustive, multi-dimensional.`,
      WORK: `CEO-level strategic.`,
      PROFESSIONAL: `CEO-level strategic.`,
      TECHNICAL: `World-class engineering.`,
      EXPERT: `World-class engineering.`,
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
 * Now includes LLM_UNLOCK for maximum potential
 */
export function buildDelta(plan: PlanType | string, intent: string, _message?: string): string {
  const planConfig = PLAN_CONFIGS[plan as PlanType] || PLAN_CONFIGS.STARTER;
  const intentHint = planConfig.intents[intent] || '';
  
  // Detect domain from intent for proactive hint
  const domain = detectDomainFromIntent(intent);
  const proactiveHint = PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general;

  return `${LLM_UNLOCK}

${IDENTITY}
${LANGUAGE}
${BEHAVIOR}
${STYLE}
${FORBIDDEN_PROMPT}

PLAN LEVEL: ${planConfig.core}
INTENT: ${intentHint}

${COMPANION_FORMULA}
${CONSISTENCY_PROMPT}

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
// V2.4 NEW: buildGreetingDelta (REQUIRED BY chat.service.ts)
// ============================================================================

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * v2.4 NEW: buildGreetingDelta(plan, userName, message)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Specialized prompt for greeting messages (hi, hello, namaste)
 * Returns SHORT, warm response instruction
 */
export function buildGreetingDelta(
  plan: PlanType | string,
  userName?: string,
  originalMessage?: string
): string {
  const planBadge = PLAN_BADGES[plan as PlanType] || PLAN_BADGES.STARTER;
  const greeting = userName ? userName : 'there';
  
  // Detect greeting style from message
  const msg = (originalMessage || '').toLowerCase();
  const isHindiGreeting = /namaste|namaskar|pranam|jai|ram ram|sat sri akal/.test(msg);
  const isInformal = /hey|yo|sup|hii+|hello+/.test(msg);
  
  // Build personalized greeting response instruction
  const greetingStyle = isHindiGreeting 
    ? `Respond with a warm Hindi/Hinglish greeting. User said "${originalMessage}", so match their cultural style.`
    : isInformal
    ? `Keep it casual and friendly. User is being informal.`
    : `Be warm and welcoming.`;
  
  const warmthBoost = planBadge.warmth === 'high' 
    ? 'Add extra warmth and make them feel valued as a premium user.' 
    : '';

  return `${IDENTITY}

${LANGUAGE}

GREETING CONTEXT:
- User: ${greeting}
- Plan: ${planBadge.badge}
- ${greetingStyle}
- Keep response SHORT (1-2 lines max)
- Be genuinely warm, not robotic
- If user just said hi, respond naturally and ask how you can help
- DO NOT give long introductions or list your capabilities
${warmthBoost}

${STYLE}`.trim();
}

// ============================================================================
// V2.4 FIXED: buildSearchDelta (3 params as expected by chat.service.ts)
// ============================================================================

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * v2.4 FIXED: buildSearchDelta(hasSearchData, message?, location?)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Lightweight system prompt for search-based queries
 * Now accepts 3 parameters as expected by chat.service.ts
 */
export function buildSearchDelta(
  hasSearchData: boolean = true,
  message?: string,
  location?: string
): string {
  const searchRule = hasSearchData 
    ? SEARCH_TRUST.WITH_DATA 
    : SEARCH_TRUST.WITHOUT_DATA;
  
  const locationContext = location 
    ? `User location: ${location}. Use this for local context if relevant.` 
    : '';
  
  const messageContext = message 
    ? `Query context: "${message.slice(0, 100)}..."` 
    : '';

  return `${IDENTITY}

${LANGUAGE}

SEARCH MODE:
${searchRule}
${locationContext}
${messageContext}

RULES:
- Answer DIRECTLY from search data
- Be concise (2-4 sentences for simple facts)
- Include source attribution naturally
- If search data conflicts, mention uncertainty
- DO NOT make up information not in search results

${STYLE}`.trim();
}

// ============================================================================
// V2 API (NEW - Object-based, full features)
// ============================================================================

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NEW V2 API: buildDeltaV2(input) → DeltaOutput
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Full-featured object-based API with centralized instructions
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
  
  // 6. Determine tone context based on intent
  const toneContext = getToneContext(intent);
  
  // 7. Assemble system prompt with LLM_UNLOCK
  const systemPrompt = [
    LLM_UNLOCK,
    '',
    IDENTITY,
    languageRule,
    toneContext,
    planConfig.toneSummary,
    searchRule,
    BEHAVIOR,
    FORBIDDEN_PROMPT,
    COMPANION_FORMULA,
    CONSISTENCY_PROMPT,
    `PROACTIVE OPTIONS: ${proactiveHint}`,
  ].join('\n');
  
  // 8. Calculate max tokens
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
 * Helper to get tone context based on intent
 */
function getToneContext(intent: IntentType): string {
  const toneMap: Partial<Record<IntentType, ContextType>> = {
    CASUAL: 'casual',
    TECHNICAL: 'technical',
    PROFESSIONAL: 'enterprise',
    WORK: 'professional',
    ANALYTICAL: 'enterprise',
    STRATEGIC: 'enterprise',
    LEARNING: 'casual',
    CREATIVE: 'casual',
  };
  
  const contextType = toneMap[intent] || 'casual';
  const context = TONE.contexts[contextType];
  
  return `TONE: ${context.tone} (Warmth: ${context.warmth})`;
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
  buildSearchDelta,      // v2.4: Now accepts 3 params
  buildGreetingDelta,    // v2.4: NEW - greeting-specific
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
  
  // Core imports (for consumers who need them)
  LLM_UNLOCK,
  CORE_IDENTITY,
  CORE_BEHAVIOR,
  CORE_LANGUAGE,
  CORE_STYLE,
  FORBIDDEN,
  CONSISTENCY,
  TONE,
  
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

// Combined core constants (now from central source)
export const DELTA_CORE = {
  IDENTITY,
  LANGUAGE,
  BEHAVIOR,
  STYLE,
  // New exports from core
  LLM_UNLOCK,
  FORBIDDEN: FORBIDDEN_PROMPT,
  CONSISTENCY: CONSISTENCY_PROMPT,
  TONE: TONE_PROMPT,
};

// Get proactive hint by domain
export function getProactiveHint(domain: DomainType): string {
  return PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general;
}

// Get search trust rules
export function getSearchTrustRules() {
  return SEARCH_TRUST;
}

// Also export individual constants for backward compatibility
export { IDENTITY, LANGUAGE, BEHAVIOR, STYLE };
export const PLANS = PLAN_CONFIGS;