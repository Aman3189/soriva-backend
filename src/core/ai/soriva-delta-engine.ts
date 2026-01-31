// ============================================================================
// SORIVA DELTA ENGINE v2.4.1 — HYBRID OPTIMIZED
// Production-Safe • Token-Efficient • Query-Intelligence Enabled
// Location: src/core/ai/soriva-delta-engine.ts
// ============================================================================
// Notes:
// - All features from v2.4.0 preserved
// - Internal duplication removed
// - Prompt rule blocks reorganized (identity → ownership → language → search → behavior → context → style → plan → intent)
// - Medium comments for developer clarity
// - Strict anti-hallucination behavior
// - QueryIntelligenceService imported exactly as you wrote (Q1 mode)
// ============================================================================

import {
  QueryIntelligenceService,
  QueryAnalysis,
  ConversationMessage,
  AmbiguityLevel,
  ComplexityLevel,
  QueryCategory,
} from './query-intelligence.service';

// ============================================================================
// TYPES
// ============================================================================

export type PlanType =
  | 'STARTER'
  | 'LITE'
  | 'PLUS'
  | 'PRO'
  | 'APEX'
  | 'SOVEREIGN';

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
  | 'EXPERT'
  | 'CLARIFICATION';

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
  conversationHistory?: ConversationMessage[];
}

export interface DeltaOutput {
  systemPrompt: string;
  intent: IntentType;
  domain: DomainType;
  maxTokens: number;
  proactiveHint: string;
  intelligence?: {
    analysis: QueryAnalysis;
    needsClarification: boolean;
    clarificationQuestion: string | null;
    complexity: ComplexityLevel;
    category: QueryCategory;
  };
}

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
// INTERNAL CONSTANTS — 100% Token-Optimized, Meaning Preserved
// ============================================================================

const IDENTITY = `
You are Soriva — an intelligent, warm and professional female AI assistant created only by Risenex Dynamics (India).
Personality: mature, composed, empathetic, helpful.
Rules:
- Represent only Soriva.
- Risenex creates only Soriva.
- Maintain a feminine, professional tone (never casual or flirtatious).
- Use "main" naturally in Hindi.
- Stay clear, respectful and supportive.
`.trim();

const OWNERSHIP_RULES = `
OWNERSHIP SAFETY (Zero Hallucination):
These are NOT made by Risenex:
• OpenAI → ChatGPT, GPT-4, GPT-4o, Sora, DALL-E
• Anthropic → Claude
• Google → Gemini, Bard
• Meta → Llama
• Microsoft → Copilot
• Midjourney Inc → Midjourney
If unsure → say "let me check". Never guess.
`.trim();

const LANGUAGE_RULES = `
LANGUAGE CONTROL (HARD OVERRIDE):

1) Detect the user's language EXACTLY.
   - Pure English input → treat as ENGLISH.
   - Hinglish (English alphabet + Hindi words) → treat as HINGLISH.
   - Hindi script (हिंदी) → reply in HINGLISH (roman).

2) REPLY RULES:
   - If input is English → reply ONLY in English.
   - If input is Hinglish → reply ONLY in Hinglish.
   - If input is Hindi script → reply ONLY in Hinglish (roman).

3) STRICT DETECTION LOGIC:
   - English cues → "what is", "explain", "how to", "tell me", full English grammar.
   - Hinglish cues → "kya", "kaise", "ke baare", "mujhe", "batao", mixture words.
   - Hindi script → any Devanagari character (क-ह, ा-ौ, etc.).

4) FORBIDDEN:
   - Never mix English + Hinglish unless user's input mixes.
   - Never reply in Hinglish when input is pure English.
   - Never reply in Hindi script.

5) PRIORITY:
   LANGUAGE CONTROL OVERRIDES every other tone/style rule.
`;

const BEHAVIOR_RULES = `
BEHAVIOR (CRITICAL):
- Direct, factual — NO hallucination.
- NEVER invent: names, places, prices, ratings, addresses.
- For local queries: if unsure → say "pata nahi, online check karo".
- Never output <web_search_data> or ANY XML.
- Ask if unclear; never assume.
- Always respectful and confidential.
`.trim();

const SEARCH_RULES = `
SEARCH MODE (Strict):
- If <web_search_data> exists → treat as primary truth.
- Training knowledge is secondary.
- No search → say "let me check". Do NOT guess.
- Never fabricate search details.
`.trim();

const COMPANION_STYLE = `
TONE & STYLE (Smart Conversational):
- Warm, natural, intelligent.
- Not overly corporate or overly casual.
- One helpful insight allowed.
- Follow-up only when useful.
`.trim();

const STYLE_RULES = `
STYLE:
- Clear sentences.
- No filler.
- Lists only when needed.
`.trim();

const CLARIFICATION_RULES = `
CLARIFICATION MODE:
- If query unclear → ask one friendly question.
- Do not guess.
- Be natural, not robotic.
`.trim();

// ============================================================================
// SAFE EXPORT (Identity Only)
// ============================================================================

export const SORIVA_IDENTITY = `${IDENTITY}`;


// ============================================================================
// PROACTIVE HINTS
// ============================================================================

export const PROACTIVE_HINTS: Record<DomainType, string> = {
  entertainment: `Can assist with: recommendations, ratings, similar picks`,
  local: `Can assist with: directions, timings, nearby options`,
  finance: `Can assist with: breakdowns, trends, comparisons`,
  tech: `Can assist with: debugging, code examples, architectures`,
  travel: `Can assist with: bookings, tips, itinerary`,
  health: `Can assist with: credible info & specialist types`,
  shopping: `Can assist with: price compare, alternatives`,
  education: `Can assist with: study resources, guidance`,
  general: `Can assist with: context-sensitive help`,
};

// ============================================================================
// QUERY INTELLIGENCE INSTANCE (as-is, Q1 Mode)
// ============================================================================

const queryIntelligence = new QueryIntelligenceService();

// ============================================================================
// DOMAIN DETECTION — Optimized + Query Category Aware
// ============================================================================

function detectDomain(message: string, category?: QueryCategory): DomainType {
  // Category override (fast-path)
  if (category === 'TECHNICAL') return 'tech';
  if (category === 'CREATIVE') return 'entertainment';

  const m = message.toLowerCase();
  const score = {
    entertainment: 0,
    finance: 0,
    tech: 0,
    travel: 0,
    health: 0,
    shopping: 0,
    education: 0,
    local: 0,
  };

  const add = (key: keyof typeof score) => score[key]++;

  // Entertainment
  if (
    /\b(movie|film|series|show|trailer|netflix|prime video|hotstar|imdb|bollywood|hollywood)\b/i.test(
      m
    )
  )
    add('entertainment');

  // Finance
  if (
    /\b(stock|share|market|nifty|sensex|crypto|bitcoin|loan|emi|interest|credit|bank|sbi|hdfc|icici|card)\b/i.test(
      m
    )
  )
    add('finance');

  // Tech
  if (
    /\b(code|app|website|api|debug|software|server|programming|javascript|python|ai|ml|react|compiler|css|html)\b/i.test(
      m
    )
  )
    add('tech');

  // Travel
  if (/\b(flight|hotel|trip|travel|visa|passport|airport|booking|destination)\b/i.test(m))
    add('travel');

  // Health
  if (/\b(doctor|medicine|symptom|disease|clinic|pain|treatment|health)\b/i.test(m))
    add('health');

  // Shopping
  if (/\b(buy|price|order|discount|offer|flipkart|amazon|shopping|cart|deal)\b/i.test(m))
    add('shopping');

  // Education
  if (/\b(course|study|exam|college|university|degree|learn|tutorial|practice)\b/i.test(m))
    add('education');

  // Local
  if (/\b(near me|nearby|restaurant|cafe|shop|address|contact|timing)\b/i.test(m))
    add('local');

  // Determine best domain
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? (best[0] as DomainType) : 'general';
}

export function getDomain(message: string): DomainType {
  return detectDomain(message);
}

// ============================================================================
// INTENT CLASSIFIER — Enhanced + Category Mapping
// ============================================================================

export function classifyIntent(
  plan: PlanType | string,
  message: string,
  analysis?: QueryAnalysis
): IntentType {
  // If query intelligence says clarification is needed
  if (analysis?.action.needsClarification) return 'CLARIFICATION';

  // Direct category mapping
 if (analysis?.category) {
  const map: Partial<Record<QueryCategory, IntentType>> = {
    TECHNICAL: 'TECHNICAL',
    CREATIVE: 'CREATIVE',
    PERSONAL:  'PERSONAL',
    DECISION:  'ANALYTICAL',
    FACTUAL:   'LEARNING',
    FOLLOWUP:  'GENERAL',
    AMBIGUOUS: 'CLARIFICATION'
  };
  const mapped = map[analysis.category];
  if (mapped) return mapped;
}
  const m = message.toLowerCase();
  const wc = message.trim().split(/\s+/).length;

  // Greeting / Short messages
  if (wc <= 3) {
    if (['hi', 'hello', 'hey', 'hola', 'namaste'].some((g) => m.includes(g))) return 'CASUAL';
    return 'QUICK';
  }

  // Technical signals
  if (
    /\b(code|function|api|debug|error|bug|sql|javascript|python|react|database|deploy|server|docker|git)\b/i.test(
      m
    ) ||
    /```/.test(m)
  )
    return 'TECHNICAL';

  // Analytical signals
  if (/\b(analyze|compare|evaluate|metrics|statistics|roi|growth|trends|insight)\b/i.test(m))
    return 'ANALYTICAL';

  // Creative
  if (/\b(write|create|design|idea|story|creative|tagline|script|marketing)\b/i.test(m))
    return 'CREATIVE';

  // Learning
  if (/\b(explain|teach|learn|understand|concept|basics|what is|why is|how does)\b/i.test(m))
    return 'LEARNING';

  // Work
  if (
    /\b(meeting|email|client|project|proposal|strategy|business|professional|manager|deadline)\b/i.test(
      m
    )
  )
    return 'WORK';

  // Strategic (only for higher plans)
  if (['PRO', 'APEX', 'SOVEREIGN'].includes(plan as string)) {
    if (/\b(strategy|vision|roadmap|long-term|market|competitive|expansion|planning)\b/i.test(m))
      return 'STRATEGIC';
  }

  // Personal
  if (/\b(feel|mood|tired|happy|sad|stressed|excited|bored)\b/i.test(m)) return 'PERSONAL';

  // Short messages
  if (wc <= 12) return 'GENERAL';

  return 'GENERAL';
}
  
// ============================================================================
// PART 4 — PLAN CONFIGURATIONS + TOKEN LOGIC (Optimized v2.4.1)
// ============================================================================

interface PlanConfig {
  core: string;
  toneSummary: string;
  intents: Record<string, string>;
  maxTokens: Record<string, number>;
  baseTokens: number;
  multipliers: Partial<Record<IntentType, number>>;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  STARTER: {
    core: `Friendly + crisp.`,
    toneSummary: `Friendly, quick and practical.`,
    intents: {
      CASUAL: `2–3 lines, natural.`,
      GENERAL: `Clear, no extra details.`,
      TECHNICAL: `Short concept + very short code.`,
      LEARNING: `Simple explanation.`,
      CLARIFICATION: `Ask one clear question.`,
    },
    maxTokens: {
      CASUAL: 250,
      GENERAL: 450,
      TECHNICAL: 700,
      LEARNING: 600,
      CLARIFICATION: 150,
    },
    baseTokens: 450,
    multipliers: {
      GENERAL: 1.0,
      TECHNICAL: 1.3,
      LEARNING: 1.2,
      CASUAL: 0.6,
    },
  },

  LITE: {
    core: `Helpful + efficient.`,
    toneSummary: `Clear, concise with small examples.`,
    intents: {
      CASUAL: `Short + warm.`,
      GENERAL: `Clear + one example.`,
      TECHNICAL: `Step-by-step short code.`,
      LEARNING: `Simple analogies.`,
      CREATIVE: `Practical ideas.`,
      CLARIFICATION: `Friendly clarification.`,
    },
    maxTokens: {
      CASUAL: 350,
      GENERAL: 700,
      TECHNICAL: 1100,
      LEARNING: 900,
      CREATIVE: 800,
      CLARIFICATION: 200,
    },
    baseTokens: 650,
    multipliers: {
      TECHNICAL: 1.4,
      LEARNING: 1.3,
      CREATIVE: 1.1,
    },
  },

  PLUS: {
    core: `Warm companion.`,
    toneSummary: `Warm, thoughtful attention.`,
    intents: {
      CASUAL: `Human & friendly.`,
      GENERAL: `Thoughtful + complete.`,
      WORK: `Structured + actionable.`,
      TECHNICAL: `Examples + explanation.`,
      LEARNING: `Context-rich.`,
      CREATIVE: `Collaborative.`,
      CLARIFICATION: `Warm, specific question.`,
    },
    maxTokens: {
      CASUAL: 450,
      GENERAL: 850,
      WORK: 1200,
      TECHNICAL: 1600,
      LEARNING: 1400,
      CREATIVE: 1200,
      CLARIFICATION: 200,
    },
    baseTokens: 850,
    multipliers: {
      TECHNICAL: 1.5,
      WORK: 1.2,
      LEARNING: 1.3,
    },
  },

  PRO: {
    core: `Premium companion.`,
    toneSummary: `Smart, anticipatory, detailed.`,
    intents: {
      QUICK: `Direct + efficient.`,
      GENERAL: `Comprehensive.`,
      WORK: `Professional + structured.`,
      PROFESSIONAL: `High-quality professional.`,
      TECHNICAL: `Deep dive + best practices.`,
      LEARNING: `Multi-angle.`,
      CREATIVE: `Collaborative ideation.`,
      ANALYTICAL: `Data-driven breakdown.`,
      CLARIFICATION: `Smart, targeted question.`,
    },
    maxTokens: {
      QUICK: 500,
      GENERAL: 1000,
      WORK: 1500,
      PROFESSIONAL: 1500,
      TECHNICAL: 2000,
      LEARNING: 1700,
      CREATIVE: 1400,
      ANALYTICAL: 1600,
      CLARIFICATION: 250,
    },
    baseTokens: 1100,
    multipliers: {
      TECHNICAL: 1.6,
      ANALYTICAL: 1.4,
      WORK: 1.2,
    },
  },

  APEX: {
    core: `Elite companion.`,
    toneSummary: `Strategic + visionary.`,
    intents: {
      STRATEGIC: `High-level clarity.`,
      EXPERT: `Architect-level.`,
      TECHNICAL: `Architectural depth.`,
      GENERAL: `Context-rich.`,
      WORK: `Strategic leadership.`,
      PROFESSIONAL: `Leader-level clarity.`,
      LEARNING: `Mastery-oriented.`,
      CREATIVE: `Innovative.`,
      ANALYTICAL: `Executive breakdown.`,
      CLARIFICATION: `Precise, efficient question.`,
    },
    maxTokens: {
      STRATEGIC: 2300,
      EXPERT: 2300,
      TECHNICAL: 2400,
      GENERAL: 1500,
      WORK: 1800,
      PROFESSIONAL: 1800,
      LEARNING: 1800,
      CREATIVE: 1600,
      ANALYTICAL: 2000,
      CLARIFICATION: 250,
    },
    baseTokens: 1600,
    multipliers: {
      TECHNICAL: 1.7,
      STRATEGIC: 1.6,
      EXPERT: 1.7,
    },
  },

  SOVEREIGN: {
    core: `Ultimate companion.`,
    toneSummary: `Unlimited depth + personalized excellence.`,
    intents: {
      STRATEGIC: `Visionary-level.`,
      EXPERT: `World-class engineering.`,
      TECHNICAL: `Advanced engineering.`,
      PROFESSIONAL: `CEO-level clarity.`,
      WORK: `Executive planning.`,
      GENERAL: `Exhaustive breakdown.`,
      LEARNING: `Mastery path.`,
      CREATIVE: `Visionary ideation.`,
      ANALYTICAL: `Board-level analysis.`,
      CLARIFICATION: `Concise, targeted.`,
    },
    maxTokens: {
      STRATEGIC: 3000,
      EXPERT: 3300,
      TECHNICAL: 3400,
      PROFESSIONAL: 2500,
      WORK: 2300,
      GENERAL: 2000,
      LEARNING: 2200,
      CREATIVE: 2000,
      ANALYTICAL: 2600,
      CLARIFICATION: 300,
    },
    baseTokens: 2100,
    multipliers: {
      EXPERT: 1.8,
      TECHNICAL: 1.7,
      STRATEGIC: 1.6,
    },
  },
};

// ============================================================================
// TOKEN CALCULATION
// ============================================================================

export function getMaxTokens(plan: PlanType | string, intent?: string): number {
  const cfg = PLAN_CONFIGS[plan as PlanType] || PLAN_CONFIGS.STARTER;
  if (intent && cfg.maxTokens[intent]) return cfg.maxTokens[intent];
  return cfg.baseTokens || 900;
}
// ============================================================================
// PART 5 — UNIFIED PROMPT BUILDER (v2.4.1 Hybrid Optimized)
// ============================================================================

function buildUnifiedPrompt(
  plan: PlanType,
  intent: IntentType,
  domain: DomainType,
  searchRule: string,
  contextBlock: string = '',
  clarificationContext?: {
    needsClarification: boolean;
    question: string | null;
    possibleIntents: string[];
  }
): string {

  const planCfg = PLAN_CONFIGS[plan];
  const proactiveHint = PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general;
  const intentHint = planCfg.intents[intent] || '';

  // Clarification block (shown only when needed)
  let clarificationBlock = '';
  if (
    clarificationContext?.needsClarification &&
    clarificationContext.question
  ) {
    clarificationBlock = `
${CLARIFICATION_RULES}

ASK USER THIS QUESTION:
${clarificationContext.question}

POSSIBLE USER MEANINGS:
${clarificationContext.possibleIntents.map(i => `- ${i}`).join('\n')}
`;
  }

  // Final prompt hierarchy (optimized)
  return `
${IDENTITY}

${OWNERSHIP_RULES}

${LANGUAGE_RULES}

${searchRule}

${BEHAVIOR_RULES}

${contextBlock}${clarificationBlock}

${STYLE_RULES}

PLAN TONE (${plan}):
${planCfg.toneSummary}

INTENT STYLE:
${intentHint}

${COMPANION_STYLE}

Proactive Options: ${proactiveHint}
`.trim();
}
// ============================================================================
// PART 6 — LEGACY BUILDER + V2 BUILDER (Query Intelligence Integrated)
// ============================================================================

// Legacy builder (kept for backward compatibility)
export function buildDelta(
  plan: PlanType | string,
  intent: string,
  message?: string
): string {
  const planType = (plan as PlanType) || 'STARTER';
  const intentType = (intent as IntentType) || 'GENERAL';
  const domain = message ? detectDomain(message) : 'general';

  const searchRule = SEARCH_RULES +
    `\n(No search data → say "let me check". Do not guess.)`;

  return buildUnifiedPrompt(
    planType,
    intentType,
    domain,
    searchRule,
    ''
  );
}

// ============================================================================
// buildDeltaV2 — Full Query Intelligence Integration (v2.4.1)
// ============================================================================

export function buildDeltaV2(input: DeltaInput): DeltaOutput {
  const { message, userContext, searchContext, conversationHistory } = input;

  // Step 1 — Query Intelligence
  const analysis = queryIntelligence.analyze(
    message,
    conversationHistory,
    userContext.plan
  );

  // Step 2 — Intent (query-aware)
  const intent = classifyIntent(
    userContext.plan,
    message,
    analysis
  );

  // Step 3 — Domain (category-aware)
  const domain = detectDomain(message, analysis.category);

  // Step 4 — Search Rule
  const searchRule = searchContext?.hasResults
    ? SEARCH_RULES + `\n(Search data available → use it first.)`
    : SEARCH_RULES + `\n(No search data → say "let me check". Do not guess.)`;

  // Step 5 — Clarification context
  const clarificationContext = analysis.action.needsClarification
    ? {
        needsClarification: true,
        question: analysis.action.clarificationQuestion,
        possibleIntents: analysis.ambiguity.possibleIntents,
      }
    : undefined;

  // Step 6 — Build final system prompt
  const systemPrompt = buildUnifiedPrompt(
    userContext.plan,
    intent,
    domain,
    searchRule,
    '',
    clarificationContext
  );

  // Step 7 — Tokens
  const maxTokens = getMaxTokens(userContext.plan, intent);

  // Step 8 — Return full payload
  return {
    systemPrompt,
    intent,
    domain,
    maxTokens,
    proactiveHint: PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general,
    intelligence: {
      analysis,
      needsClarification: analysis.action.needsClarification,
      clarificationQuestion: analysis.action.clarificationQuestion,
      complexity: analysis.complexity.level,
      category: analysis.category,
    },
  };
}
// ============================================================================
// PART 7 — QUICK DELTA + ENHANCED DELTA (Tone + Mood + QI Integration)
// ============================================================================

// Quick builder — lightweight wrapper around full engine
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

// ============================================================================
// buildEnhancedDelta — Advanced builder (Tone + Emotion + Follow-ups)
// ============================================================================

export function buildEnhancedDelta(
  input: DeltaInput,
  intelligence?: IntelligenceSync
): DeltaOutput {
  const { message, userContext, searchContext, conversationHistory } = input;

  // Step 1 — Query Intelligence
  const analysis = queryIntelligence.analyze(
    message,
    conversationHistory,
    userContext.plan
  );

  // Step 2 — Intent classification
  const intent = classifyIntent(
    userContext.plan,
    message,
    analysis
  );

  // Step 3 — Domain detection
  const domain = detectDomain(
    message,
    analysis.category
  );

  // Step 4 — Search rule
  const searchRule = searchContext?.hasResults
    ? SEARCH_RULES + `\n(Search data available → use it first.)`
    : SEARCH_RULES + `\n(No search data → say "let me check". Do not guess.)`;

  // Step 5 — Build Context Signals
  let contextBlock = '';

  if (intelligence) {
    const signals: string[] = [];

    // Tone adjustments
    if (intelligence.toneAnalysis) {
  const t = intelligence.toneAnalysis;
  // Don't override if user wrote in pure English
      const hasHinglishWords = /\b(kya|hai|kaise|kaisa|batao|karo|mein|mera|tera|aur|nahi|haan|bhai|yaar|accha|theek|dekho|suno)\b/i.test(message);
      if (hasHinglishWords) {
        signals.push(`Use Hinglish tone.`);
      }
      if (t.formalityLevel === 'formal')
        signals.push(`Use semi-formal respectful tone.`);
      else if (t.formalityLevel === 'casual')
        signals.push(`Use a softer, youthful tone.`);
    }

    // Mood adjustments
    if (intelligence.emotionalState) {
      const e = intelligence.emotionalState;
      if (e.stressLevel > 7)
        signals.push(`User seems stressed → respond with extra calm.`);
      else if (e.stressLevel > 4)
        signals.push(`User slightly stressed → keep tone reassuring.`);
      if (e.mood)
        signals.push(`Detected mood: ${e.mood}. Adjust tone sensitively.`);
    }

    // Proactive context
    if (intelligence.proactiveContext) {
      const pc = intelligence.proactiveContext;
      if (pc.recentTopics?.length)
        signals.push(`Recent topics: ${pc.recentTopics.slice(0, 3).join(', ')}.`);
      if (pc.pendingFollowUps?.length)
        signals.push(`Pending follow-up: "${pc.pendingFollowUps[0]}". Mention only if relevant.`);
    }

    if (signals.length > 0) {
      contextBlock = `\nCONTEXT SIGNALS:\n- ${signals.join('\n- ')}\n`;
    }
  }

  // Step 6 — Follow-up awareness
  if (analysis.context.isFollowUp && analysis.context.detectedTopic) {
    contextBlock += `\nFOLLOW-UP CONTEXT: Continuing discussion about ${analysis.context.detectedTopic}.\n`;
  }

  // Step 7 — Clarification scaffolding
  const clarificationContext = analysis.action.needsClarification
    ? {
        needsClarification: true,
        question: analysis.action.clarificationQuestion,
        possibleIntents: analysis.ambiguity.possibleIntents,
      }
    : undefined;

  // Step 8 — Final prompt
  const systemPrompt = buildUnifiedPrompt(
    userContext.plan,
    intent,
    domain,
    searchRule,
    contextBlock,
    clarificationContext
  );

  // Step 9 — Max tokens
  const maxTokens = getMaxTokens(userContext.plan, intent);

  // Step 10 — Return final payload
  return {
    systemPrompt,
    intent,
    domain,
    maxTokens,
    proactiveHint: PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general,
    intelligence: {
      analysis,
      needsClarification: analysis.action.needsClarification,
      clarificationQuestion: analysis.action.clarificationQuestion,
      complexity: analysis.complexity.level,
      category: analysis.category,
    },
  };
}
// ============================================================================
// PART 8 — UTILITIES + STRICT SEARCH DELTA + EXPORTS + VERSION STAMP
// ============================================================================

// Intent helper
export function getIntent(message: string, plan: PlanType): IntentType {
  return classifyIntent(plan, message);
}

// Proactive hint helper
export function getProactiveHint(domain: DomainType): string {
  return PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general;
}

// Search trust helper
export function getSearchTrustRules() {
  return `${SEARCH_RULES}`;
}

// ============================================================================
// CLEAN RESPONSE UTILITY
// ============================================================================

export function cleanResponse(response: string): string {
  return response
    .replace(/^(Soriva:|AI:|Assistant:)\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================================================
// STRICT SEARCH DELTA — Anti-Hallucination Shield
// ============================================================================

export function buildSearchDelta(hasSearchData: boolean = true): string {
  return `
You are Soriva — conversational, factual and identity-safe (Risenex Dynamics, India).

OWNERSHIP (Critical):
- These are NOT made by Risenex:
  OpenAI → ChatGPT, GPT-4, GPT-4o, Sora, DALL-E
  Anthropic → Claude
  Google → Gemini, Bard
  Meta → Llama
  Microsoft → Copilot
  Midjourney → Midjourney
- Never guess ownership. If unsure: "let me check".

LANGUAGE (STRICT - HARD OVERRIDE):
1) Detect user's language:
   - Pure English → ENGLISH
   - Hinglish (mixed) → HINGLISH
   - Hindi script → reply in HINGLISH (roman)
2) MATCH exactly:
   - English input → English reply ONLY
   - Hinglish input → Hinglish reply ONLY
3) FORBIDDEN: Never reply Hinglish to pure English input.
4) PRIORITY: Language rule overrides ALL other style rules.

SEARCH MODE:
${hasSearchData ? 'Use <web_search_data> as the ONLY factual source.' : 'No search data → do not guess.'}

ANTI-HALLUCINATION (STRICT):
- If name/address/price/showtime not in search → DO NOT invent
- Say: "Mujhe exact info nahi mili, BookMyShow/Google Maps pe check karo"
- Never output <web_search_data> tags or ANY XML tags

RESPONSE:
- Direct, factual, 2–4 lines
- No filler, no guesses
  `.trim();
}

// ============================================================================
// QUERY INTELLIGENCE SHORTCUTS
// ============================================================================

export function analyzeQuery(
  message: string,
  conversationHistory?: ConversationMessage[]
): QueryAnalysis {
  return queryIntelligence.analyze(message, conversationHistory);
}

export function needsClarification(message: string): boolean {
  return queryIntelligence.needsClarification(message);
}

export function getClarificationQuestion(message: string): string | null {
  return queryIntelligence.getClarificationQuestion(message);
}

export function isFollowUp(message: string): boolean {
  return queryIntelligence.isFollowUp(message);
}

// ============================================================================
// CORE CONSTANT EXPORTS (CLEANED — NO DUPLICATION)
// ============================================================================


export const DELTA_CORE = {
  IDENTITY: `${IDENTITY}`,
  LANGUAGE_RULES: `${LANGUAGE_RULES}`,
  BEHAVIOR_RULES: `${BEHAVIOR_RULES}`,
  STYLE_RULES: `${STYLE_RULES}`,
  OWNERSHIP_RULES: `${OWNERSHIP_RULES}`,
};

export const SORIVA_CORE = {
  IDENTITY: `${IDENTITY}`,
  OWNERSHIP_RULES: `${OWNERSHIP_RULES}`,
  LANGUAGE_RULES: `${LANGUAGE_RULES}`,
  BEHAVIOR_RULES: `${BEHAVIOR_RULES}`,
  STYLE_RULES: `${STYLE_RULES}`,
};

export const CORE_CONSTANTS = {
  IDENTITY: `${IDENTITY}`,
  LANGUAGE_RULES: `${LANGUAGE_RULES}`,
  BEHAVIOR_RULES: `${BEHAVIOR_RULES}`,
  STYLE_RULES: `${STYLE_RULES}`,
  OWNERSHIP_RULES: `${OWNERSHIP_RULES}`,
};

// ============================================================================
// MAIN ENGINE OBJECT — CLEAN, SAFE, FINAL
// ============================================================================

export const SorivaDeltaEngine = {
  // Safe rule blocks
  IDENTITY: `${IDENTITY}`,
  OWNERSHIP_RULES: `${OWNERSHIP_RULES}`,
  LANGUAGE_RULES: `${LANGUAGE_RULES}`,
  BEHAVIOR_RULES: `${BEHAVIOR_RULES}`,
  STYLE_RULES: `${STYLE_RULES}`,

  // Core builders
  classifyIntent,
  buildDelta,
  buildDeltaV2,
  buildQuickDelta,
  buildEnhancedDelta,
  buildSearchDelta,

  // Query Intelligence shortcuts
  analyzeQuery,
  needsClarification,
  getClarificationQuestion,
  isFollowUp,

  // Utils
  cleanResponse,
  getIntent,
  getDomain,
  getMaxTokens,
  getProactiveHint,
  getSearchTrustRules,

  // Configs
  PLANS: PLAN_CONFIGS,
  PROACTIVE_HINTS,
};

// ============================================================================
// VERSION STAMP
// ============================================================================

export const SORIVA_DELTA_ENGINE_VERSION = '2.4.1-PRODUCTION';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default SorivaDeltaEngine;
export const PLANS = PLAN_CONFIGS;
