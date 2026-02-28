// ============================================================================
// SORIVA DELTA ENGINE v2.7 — USERID FIX
// ============================================================================
// 
// ✅ v2.7: Fixed userId parameter for SearchIntentRouter & ToneMatcher
// ✅ v2.6: Integrated SearchIntentRouter (LLM-powered search decisions)
// ✅ v2.5: Integrated with soriva-core-instructions v2.0
// ✅ LANGUAGE FIX: No hardcoded Hinglish - fully dynamic from ToneMatcher
// ✅ SEARCH FIX: No static keywords - LLM decides search intent
// ✅ FEMALE IDENTITY: Guaranteed throughout
// ✅ BACKWARD COMPATIBLE: Old function signatures still work
// ✅ TOKEN EFFICIENT: ~120-150 tokens per delta
//
// CHANGES FROM v2.6:
// - Added userId parameter to buildSmartDelta()
// - Added userId parameter to shouldSearch(), getSearchQuery(), getSearchIntent()
// - Added userId parameter to getToneAnalysis()
// - Default userId = 'system' for backward compatibility
//
// ============================================================================

// ============================================================================
// IMPORTS FROM CORE INSTRUCTIONS (SAME FOLDER)
// ============================================================================

import CoreInstructions, {
  COMPANY,
  SORIVA,
  PROMPTS,
  buildSystemPrompt,
  buildMinimalPrompt,
  type Language,
  type Context,
  type PromptConfig,
} from './instructions';

// ============================================================================
// IMPORT SEARCH INTENT ROUTER (NEW v2.6)
// Path: src/core/ai/ → src/services/ai/intelligence/
// ============================================================================

import { 
  SearchIntentRouter, 
  type SearchIntentResult, 
  type UserIntent as SearchUserIntent,
  type SearchType,
} from '../../services/ai/intelligence/search-intent-router.service';

import { ToneMatcherService } from '../../services/ai/intelligence/tone-matcher.service';
import type { LLMService } from '../../services/ai/intelligence/intelligence.types';

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
  language?: Language;  // Now uses Language type from core
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

// ============================================================================
// ENHANCED OUTPUT WITH SEARCH INTENT (NEW v2.6)
// ============================================================================

export interface SmartDeltaOutput extends DeltaOutput {
  // Search routing info
  searchIntent: SearchIntentResult;
  shouldSearch: boolean;
  searchQuery: string | null;
  searchType: SearchType;
}

// Intelligence sync interface (ENHANCED v2.6)
export interface IntelligenceSync {
  toneAnalysis?: {
    detectedLanguage?: Language;
    shouldUseHinglish: boolean;
    formalityLevel: 'casual' | 'semi_formal' | 'formal';
  };
  // NEW v2.6: Search intent from SearchIntentRouter
  searchIntent?: SearchIntentResult;
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
// PLAN CONFIGURATIONS
// ============================================================================

const PLAN_BADGES: Record<PlanType, { badge: string; warmth: 'high' | 'moderate' | 'standard' }> = {
  STARTER: { badge: 'Starter', warmth: 'standard' },
  LITE: { badge: 'Lite', warmth: 'standard' },
  PLUS: { badge: 'Plus ⭐', warmth: 'moderate' },
  PRO: { badge: 'Pro 🌟', warmth: 'moderate' },
  APEX: { badge: 'Apex 💎', warmth: 'high' },
  SOVEREIGN: { badge: 'Sovereign 👑', warmth: 'high' },
};

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
    core: `Friendly, concise.`,
    toneSummary: `Friendly, max value in few words.`,
    intents: {
      CASUAL: `1-3 lines, friendly.`,
      GENERAL: `Clear, practical.`,
      TECHNICAL: `Concept → short code.`,
      LEARNING: `Simple explanation, analogy if helpful.`,
    },
    maxTokens: { CASUAL: 300, GENERAL: 600, TECHNICAL: 900, LEARNING: 800 },
    baseTokens: 400,
    intentMultipliers: { CASUAL: 0.6, GENERAL: 1.0, TECHNICAL: 1.5, LEARNING: 1.3 },
  },
  LITE: {
    core: `Helpful, efficient.`,
    toneSummary: `Helpful, efficient.`,
    intents: {
      CASUAL: `Warm, 2-3 lines.`,
      GENERAL: `Clear, one example if needed.`,
      TECHNICAL: `Step-by-step, working code.`,
      LEARNING: `Simple, relatable analogies.`,
      CREATIVE: `Practical ideas.`,
    },
    maxTokens: { CASUAL: 400, GENERAL: 800, TECHNICAL: 1200, LEARNING: 1000, CREATIVE: 900 },
    baseTokens: 600,
    intentMultipliers: { CASUAL: 0.6, GENERAL: 1.0, TECHNICAL: 1.5, LEARNING: 1.3, CREATIVE: 1.2 },
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
    maxTokens: { EVERYDAY: 500, CASUAL: 500, GENERAL: 900, WORK: 1100, TECHNICAL: 1400, LEARNING: 1200, CREATIVE: 1100 },
    baseTokens: 800,
    intentMultipliers: { CASUAL: 0.6, EVERYDAY: 0.6, GENERAL: 1.0, WORK: 1.2, TECHNICAL: 1.5, LEARNING: 1.3, CREATIVE: 1.2 },
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
    maxTokens: { QUICK: 600, EVERYDAY: 700, CASUAL: 700, GENERAL: 1200, WORK: 1500, PROFESSIONAL: 1500, TECHNICAL: 2000, LEARNING: 1600, CREATIVE: 1400, ANALYTICAL: 1800 },
    baseTokens: 1000,
    intentMultipliers: { QUICK: 0.5, CASUAL: 0.6, EVERYDAY: 0.6, GENERAL: 1.0, WORK: 1.3, PROFESSIONAL: 1.3, TECHNICAL: 1.8, LEARNING: 1.4, CREATIVE: 1.2, ANALYTICAL: 1.6 },
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
    maxTokens: { QUICK: 800, EVERYDAY: 1000, CASUAL: 1000, GENERAL: 1600, WORK: 2000, PROFESSIONAL: 2000, TECHNICAL: 2500, EXPERT: 2500, LEARNING: 2000, CREATIVE: 1800, ANALYTICAL: 2200, STRATEGIC: 2400 },
    baseTokens: 1500,
    intentMultipliers: { QUICK: 0.5, CASUAL: 0.6, EVERYDAY: 0.6, GENERAL: 1.0, WORK: 1.3, PROFESSIONAL: 1.3, TECHNICAL: 1.8, EXPERT: 1.8, LEARNING: 1.4, CREATIVE: 1.2, ANALYTICAL: 1.5, STRATEGIC: 1.6 },
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
    maxTokens: { QUICK: 1000, EVERYDAY: 1200, CASUAL: 1200, GENERAL: 2000, WORK: 2500, PROFESSIONAL: 2500, TECHNICAL: 3500, EXPERT: 3500, LEARNING: 2500, CREATIVE: 2200, ANALYTICAL: 3000, STRATEGIC: 3200 },
    baseTokens: 2000,
    intentMultipliers: { QUICK: 0.5, CASUAL: 0.6, EVERYDAY: 0.6, GENERAL: 1.0, WORK: 1.25, PROFESSIONAL: 1.25, TECHNICAL: 1.75, EXPERT: 1.75, LEARNING: 1.25, CREATIVE: 1.1, ANALYTICAL: 1.5, STRATEGIC: 1.6 },
  },
};

// ============================================================================
// PROACTIVE HINTS BY DOMAIN
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
// DELTA ENGINE CLASS (NEW v2.6 - with SearchIntentRouter)
// ============================================================================

export class SorivaDeltaEngineV2 {
  private searchRouter: SearchIntentRouter;
  private toneMatcher: ToneMatcherService;
  
  constructor(llmService: LLMService) {
    this.searchRouter = new SearchIntentRouter(llmService);
    this.toneMatcher = new ToneMatcherService(llmService);
    console.log('[DeltaEngine v2.6] ✅ Initialized with SearchIntentRouter + ToneMatcher');
  }
  
  /**
   * 🎯 SMART DELTA: Full intelligence - ToneMatcher + SearchRouter
   * This is the recommended method for v2.6+
   * @param input - Delta input with message, userContext, searchContext
   * @param userId - User ID for search router (required for LLM calls)
   */
  async buildSmartDelta(input: DeltaInput, userId: string = 'system'): Promise<SmartDeltaOutput> {
    const { message, userContext, searchContext } = input;
    
    console.log('[DeltaEngine v2.6] 🧠 Building smart delta...');
    
    // STEP 1: Analyze tone (language detection)
    const toneAnalysis = await this.toneMatcher.analyzeTone(message, userId);
    
    // STEP 2: Analyze search intent (LLM-powered)
    const searchIntent = await this.searchRouter.analyzeIntent(message, userId);
    
    // STEP 3: Update user context with detected language
    // Convert DetectedLanguage to Language (handle 'mixed' → 'hinglish' fallback)
    const detectedLang = toneAnalysis.language;
    const normalizedLanguage: Language = 
      detectedLang === 'mixed' ? 'hinglish' : detectedLang as Language;
    
    const enhancedUserContext: UserContext = {
      ...userContext,
      language: normalizedLanguage,
    };
    
    // STEP 4: Build base delta
    const intent = classifyIntent(userContext.plan, message) as IntentType;
    const domain = searchIntent.needsSearch && searchIntent.searchType === 'local' 
      ? 'local' 
      : (searchContext?.domain || detectDomain(message));
    const context = intentToContext(intent);
    
    const planConfig = PLAN_CONFIGS[userContext.plan] || PLAN_CONFIGS.STARTER;
    const proactiveHint = PROACTIVE_HINTS[domain];
    
    // STEP 5: Build system prompt
    const basePrompt = buildSystemPrompt({
      userName: enhancedUserContext.name,
      language: enhancedUserContext.language || 'english',
      context,
      hasSearchData: searchIntent.needsSearch || (searchContext?.hasResults || false),
      isVoice: false,
    });
    
    // STEP 6: Add search context if needed
    let searchContextPrompt = '';
    if (searchIntent.needsSearch) {
      searchContextPrompt = `
SEARCH REQUIRED:
- Type: ${searchIntent.searchType}
- Query: "${searchIntent.suggestedQuery}"
- Confidence: ${searchIntent.confidence}%`;
    }
    
    const systemPrompt = `${basePrompt}

PLAN: ${planConfig.toneSummary}
INTENT: ${planConfig.intents[intent] || ''}
PROACTIVE: ${proactiveHint}${searchContextPrompt}`.trim();
    
    console.log('[DeltaEngine v2.6] ✅ Smart delta built:', {
      language: enhancedUserContext.language,
      needsSearch: searchIntent.needsSearch,
      searchType: searchIntent.searchType,
      intent: searchIntent.intent,
    });
    
    return {
      systemPrompt,
      intent,
      domain,
      maxTokens: getMaxTokens(userContext.plan, intent),
      proactiveHint,
      // NEW v2.6: Search intent info
      searchIntent,
      shouldSearch: searchIntent.needsSearch,
      searchQuery: searchIntent.suggestedQuery,
      searchType: searchIntent.searchType,
    };
  }
  
  /**
   * Quick search check (without full delta)
   * @param message - User message
   * @param userId - User ID for LLM calls
   */
  async shouldSearch(message: string, userId: string = 'system'): Promise<boolean> {
    return this.searchRouter.shouldSearch(message, userId);
  }
  
  /**
   * Get optimized search query
   * @param message - User message
   * @param userId - User ID for LLM calls
   */
  async getSearchQuery(message: string, userId: string = 'system'): Promise<string | null> {
    return this.searchRouter.getSearchQuery(message, userId);
  }
  
  /**
   * Get full search intent analysis
   * @param message - User message
   * @param userId - User ID for LLM calls
   */
  async getSearchIntent(message: string, userId: string = 'system'): Promise<SearchIntentResult> {
    return this.searchRouter.analyzeIntent(message, userId);
  }
  
  /**
   * Get tone analysis
   * @param message - User message
   * @param userId - User ID for LLM calls
   */
  async getToneAnalysis(message: string, userId: string = 'system') {
    return this.toneMatcher.analyzeTone(message, userId);
  }
}

// ============================================================================
// INTENT CLASSIFIER
// ============================================================================

export function classifyIntent(plan: PlanType | string, message: string): IntentType {
  const m = message.toLowerCase();
  const wordCount = message.trim().split(/\s+/).length;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIORITY 1: Check meaningful intents FIRST (before word count)
  // This ensures "Explain X" or "Write code" get proper intent
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Learning indicators - CHECK FIRST! (explain, teach, what is, etc.)
  const learningPatterns = [
    /\b(explain|teach|learn|understand|how does|what is|why does|elaborate|describe|define)\b/i,
    /\b(concept|theory|principle|basics|fundamentals)\b/i,
    /\b(samjhao|samjha|samjhana|batao|btao|sikhao|kaise|kyun|kya hai|kya hota)\b/i, // Hindi/Hinglish
  ];
  const learningRoots = ['expl', 'elab', 'desc', 'defi', 'teac', 'lear', 'unde', 'conc', 'theo', 'samj'];
  const hasLearningRoot = learningRoots.some(root => m.includes(root));
  
  if (learningPatterns.some(p => p.test(m)) || hasLearningRoot) return 'LEARNING';
  
  // Technical indicators
  const techPatterns = [
    /\b(code|function|api|debug|error|bug|programming|sql|python|javascript|react)\b/i,
    /\b(implement|deploy|database|algorithm|git|npm|docker|typescript|node)\b/i,
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
    /\b(marketing|slogan|tagline|poem|script|essay|article)\b/i,
  ];
  if (creativePatterns.some(p => p.test(m))) return 'CREATIVE';
  
  // Work/Professional indicators
  const workPatterns = [
    /\b(meeting|email|presentation|proposal|strategy|client|project)\b/i,
    /\b(deadline|schedule|team|manager|business|professional)\b/i,
  ];
  if (workPatterns.some(p => p.test(m))) return 'WORK';
  
  // Strategic (for higher plans)
  if (['APEX', 'SOVEREIGN'].includes(plan as string)) {
    const strategicPatterns = [/\b(strategy|roadmap|vision|long-term|market|competitive|expansion)\b/i];
    if (strategicPatterns.some(p => p.test(m))) return 'STRATEGIC';
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIORITY 2: Now check greetings and casual (after meaningful intents)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Greeting detection (short messages)
  if (wordCount <= 3) {
    const greetings = ['hi', 'hello', 'hey', 'hola', 'namaste', 'good morning', 'good evening', 'gm', 'gn'];
    if (greetings.some(g => m.includes(g))) return 'CASUAL';
  }
  
  // Personal/Casual indicators
  const casualPatterns = [
    /\b(feel|mood|tired|bored|happy|sad|excited|stressed)\b/i,
    /\b(weekend|movie|food|travel|hobby)\b/i,
  ];
  if (casualPatterns.some(p => p.test(m))) return 'CASUAL';
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIORITY 3: Default based on message length
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (wordCount <= 5) return 'QUICK';
  if (wordCount <= 15) return 'GENERAL';
  return 'GENERAL';
}

// ============================================================================
// DOMAIN DETECTION
// ============================================================================

function detectDomain(message: string): DomainType {
  const m = message.toLowerCase();
  
  if (/\b(movie|film|song|music|artist|singer|actor|series|show|netflix|trailer|bollywood|hollywood)\b/i.test(m)) return 'entertainment';
  if (/\b(stock|share|price|market|nifty|sensex|crypto|bitcoin|investment|mutual fund|loan)\b/i.test(m)) return 'finance';
  if (/\b(code|programming|software|app|website|api|database|server|cloud|ai|ml)\b/i.test(m)) return 'tech';
  if (/\b(flight|hotel|travel|trip|vacation|booking|destination|visa|passport)\b/i.test(m)) return 'travel';
  if (/\b(doctor|hospital|medicine|health|symptom|disease|treatment|medical)\b/i.test(m)) return 'health';
  if (/\b(buy|purchase|order|product|discount|sale|amazon|flipkart|shopping)\b/i.test(m)) return 'shopping';
  if (/\b(course|study|exam|college|university|degree|learn|tutorial)\b/i.test(m)) return 'education';
  if (/\b(near me|nearby|restaurant|cafe|shop|store|directions|address)\b/i.test(m)) return 'local';
  
  return 'general';
}

export function getDomain(message: string): DomainType {
  return detectDomain(message);
}

// ============================================================================
// INTENT TO CONTEXT MAPPING
// ============================================================================

function intentToContext(intent: IntentType): Context {
  const map: Partial<Record<IntentType, Context>> = {
    CASUAL: 'casual',
    EVERYDAY: 'casual',
    QUICK: 'casual',
    PERSONAL: 'emotional',
    TECHNICAL: 'technical',
    EXPERT: 'technical',
    WORK: 'professional',
    PROFESSIONAL: 'professional',
    ANALYTICAL: 'professional',
    STRATEGIC: 'professional',
    LEARNING: 'casual',
    CREATIVE: 'casual',
    GENERAL: 'casual',
  };
  return map[intent] || 'casual';
}

// ============================================================================
// TOKEN CALCULATION
// ============================================================================

export function getMaxTokens(plan: PlanType | string, intent?: string): number {
  const planConfig = PLAN_CONFIGS[plan as PlanType] || PLAN_CONFIGS.STARTER;
  if (intent && planConfig.maxTokens[intent]) {
    return planConfig.maxTokens[intent];
  }
  return planConfig.baseTokens || 1000;
}

// ============================================================================
// MAIN DELTA BUILDERS (Using new core instructions)
// ============================================================================

/**
 * BACKWARD COMPATIBLE: buildDelta(plan, intent, message?)
 * Now uses core instructions buildSystemPrompt
 */
export function buildDelta(
  plan: PlanType | string,
  intent: string,
  _message?: string,
  language: Language = 'hinglish',
  mode: 'normal' | 'code' = 'normal'  // ✅ ADD MODE
): string {
  const planConfig = PLAN_CONFIGS[plan as PlanType] || PLAN_CONFIGS.STARTER;
  const context = intentToContext(intent as IntentType);
  const domain = detectDomainFromIntent(intent);
  const proactiveHint = PROACTIVE_HINTS[domain];

  const basePrompt = buildSystemPrompt({
    language,
    context,
    hasSearchData: false,
    isVoice: false,
    mode,  // ✅ PASS MODE
  });

  return `${basePrompt}

PLAN: ${planConfig.core}
INTENT: ${planConfig.intents[intent] || ''}
PROACTIVE: ${proactiveHint}`.trim();
}

function detectDomainFromIntent(intent: string): DomainType {
  const map: Record<string, DomainType> = {
    TECHNICAL: 'tech',
    CREATIVE: 'entertainment',
    LEARNING: 'education',
  };
  return map[intent] || 'general';
}

/**
 * v2.5: buildGreetingDelta - Greeting-specific prompt
 */
export function buildGreetingDelta(
  plan: PlanType | string,
  userName?: string,
  originalMessage?: string,
  language: Language = 'hinglish'
): string {
  const planBadge = PLAN_BADGES[plan as PlanType] || PLAN_BADGES.STARTER;
  const msg = (originalMessage || '').toLowerCase();
  
  // Detect if Hindi-style greeting
  const isHindiGreeting = /namaste|namaskar|pranam|jai|ram ram|sat sri akal/.test(msg);
  
  // Override language if Hindi greeting detected
  const effectiveLanguage: Language = isHindiGreeting ? 'hinglish' : language;
  
  // Build base prompt with detected language
  const basePrompt = buildSystemPrompt({
    userName,
    language: effectiveLanguage,
    context: 'casual',
    hasSearchData: false,
    isVoice: false,
  });

  const warmthNote = planBadge.warmth === 'high' 
    ? 'Add extra warmth - premium user.' 
    : '';

  return `${basePrompt}

GREETING MODE:
- User: ${userName || 'there'}
- Plan: ${planBadge.badge}
- Keep response SHORT (1-2 lines max)
- Be genuinely warm, not robotic
- Ask how you can help
${warmthNote}`.trim();
}

/**
 * v2.5: buildSearchDelta - Search-aware prompt
 */
export function buildSearchDelta(
  hasSearchData: boolean = true,
  message?: string,
  location?: string,
  language: Language = 'english'
): string {
  const basePrompt = buildSystemPrompt({
    language,
    context: 'casual',
    hasSearchData,
    isVoice: false,
  });

  const locationContext = location ? `User location: ${location}.` : '';
  const messageContext = message ? `Query: "${message.slice(0, 100)}..."` : '';

  return `${basePrompt}

SEARCH MODE:
${locationContext}
${messageContext}
- Answer DIRECTLY from search data
- Be concise (2-4 sentences for simple facts)
- If data conflicts, mention uncertainty`.trim();
}

// ============================================================================
// V2 API: buildDeltaV2 (Full-featured object-based API)
// ============================================================================

export function buildDeltaV2(input: DeltaInput): DeltaOutput {
  const { message, userContext, searchContext } = input;
  
  // 1. Classify intent & domain
  const intent = classifyIntent(userContext.plan, message) as IntentType;
  const domain = searchContext?.domain || detectDomain(message);
  const context = intentToContext(intent);
  
  // 2. Get plan config
  const planConfig = PLAN_CONFIGS[userContext.plan] || PLAN_CONFIGS.STARTER;
  
  // 3. Get proactive hint
  const proactiveHint = PROACTIVE_HINTS[domain];
  
  // 4. Build system prompt using core instructions
  // THIS IS THE KEY - language comes from userContext (ToneMatcher)
  const basePrompt = buildSystemPrompt({
    userName: userContext.name,
    language: userContext.language || 'english',  // Default to English if not specified
    context,
    hasSearchData: searchContext?.hasResults || false,
    isVoice: false,
  });

  const systemPrompt = `${basePrompt}

PLAN: ${planConfig.toneSummary}
INTENT: ${planConfig.intents[intent] || ''}
PROACTIVE: ${proactiveHint}`.trim();

  console.log('🔍 [Delta v2.5] Language:', userContext.language);
  console.log('🔍 [Delta v2.5] Context:', context);
  
  // 5. Calculate max tokens
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
 * Enhanced delta with intelligence sync (ToneMatcher + SearchRouter integration)
 */
export function buildEnhancedDelta(
  input: DeltaInput,
  intelligence?: IntelligenceSync
): DeltaOutput {
  // Derive language from intelligence
  if (intelligence?.toneAnalysis) {
    // Priority 1: Use detectedLanguage if available
    if (intelligence.toneAnalysis.detectedLanguage) {
      input.userContext.language = intelligence.toneAnalysis.detectedLanguage;
    } 
    // Priority 2: Derive from shouldUseHinglish flag
    else if (intelligence.toneAnalysis.shouldUseHinglish === false) {
      // If shouldUseHinglish is explicitly false, use English
      input.userContext.language = 'english';
      console.log('🔍 [Delta v2.6] Language derived from shouldUseHinglish=false → english');
    } else if (intelligence.toneAnalysis.shouldUseHinglish === true) {
      input.userContext.language = 'hinglish';
      console.log('🔍 [Delta v2.6] Language derived from shouldUseHinglish=true → hinglish');
    }
  }
  
  console.log('🔍 [Delta v2.6] Final language for prompt:', input.userContext.language);
  
  const baseDelta = buildDeltaV2(input);
  
  if (!intelligence) return baseDelta;
  
  const enhancements: string[] = [];
  
  // Formality level
  if (intelligence.toneAnalysis?.formalityLevel === 'formal') {
    enhancements.push('Keep tone respectful and professional.');
  }
  
  // NEW v2.6: Search intent info
  if (intelligence.searchIntent?.needsSearch) {
    enhancements.push(`Search needed: ${intelligence.searchIntent.searchType} - "${intelligence.searchIntent.suggestedQuery}"`);
  }
  
  // Emotional support
  if (intelligence.emotionalState?.stressLevel && intelligence.emotionalState.stressLevel > 7) {
    enhancements.push('User may be stressed. Be extra supportive.');
  }
  
  // Follow-up context
  if (intelligence.proactiveContext?.pendingFollowUps?.length) {
    const topic = intelligence.proactiveContext.pendingFollowUps[0];
    enhancements.push(`Previous topic: "${topic}"`);
  }
  
  const enhancedPrompt = enhancements.length > 0
    ? `${baseDelta.systemPrompt}\n\nCONTEXT: ${enhancements.join(' ')}`
    : baseDelta.systemPrompt;
  
  console.log('🔍 [Delta v2.6] Enhanced with intelligence:', {
    language: intelligence.toneAnalysis?.detectedLanguage,
    formality: intelligence.toneAnalysis?.formalityLevel,
    searchNeeded: intelligence.searchIntent?.needsSearch,
  });
  
  return {
    ...baseDelta,
    systemPrompt: enhancedPrompt,
  };
}

/**
 * Quick delta for simple cases
 */
export function buildQuickDelta(
  message: string, 
  plan: PlanType, 
  language: Language = 'english'
): DeltaOutput {
  return buildDeltaV2({
    message,
    userContext: { plan, language },
    searchContext: { hasResults: false },
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getIntent(message: string, plan: PlanType): IntentType {
  return classifyIntent(plan, message) as IntentType;
}

export function cleanResponse(response: string): string {
  return response
    .replace(/^(Soriva:|AI:|Assistant:)\s*/i, '')
    .replace(/\[web_search_data\]/gi, '')
    .replace(/<\/?web_search_data>/gi, '')
    .replace(/\[\/web_search_data\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function getProactiveHint(domain: DomainType): string {
  return PROACTIVE_HINTS[domain] || PROACTIVE_HINTS.general;
}

// ============================================================================
// LEGACY EXPORTS (Backward compatibility)
// ============================================================================

// Compact identity for legacy consumers
export const SORIVA_IDENTITY = `You are Soriva, female AI by ${COMPANY.name} (${COMPANY.country}). Helpful, intelligent, personable.`;
export const IDENTITY = SORIVA_IDENTITY;

// Legacy language (now dynamic, this is just a fallback)
export const LANGUAGE = `Mirror user's language. Hinglish→Hinglish, English→English. No Devanagari.`;

// Legacy behavior/style
export const BEHAVIOR = PROMPTS.BEHAVIOR_RULES;
export const STYLE = `Use user's name occasionally. Max 1 emoji in casual. Be concise.`;

// Combined core for legacy
export const DELTA_CORE = {
  IDENTITY,
  LANGUAGE,
  BEHAVIOR,
  STYLE,
  LLM_UNLOCK: PROMPTS.LLM_UNLOCK,
  FORBIDDEN: PROMPTS.HARD_BOUNDARIES,
  CONSISTENCY: PROMPTS.CONSISTENCY_ANCHOR,
};

export const PLANS = PLAN_CONFIGS;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const SorivaDeltaEngine = {
  // NEW v2.6: Class-based engine
  DeltaEngineV2: SorivaDeltaEngineV2,
  
  // Core builders
  buildDelta,
  buildDeltaV2,
  buildSearchDelta,
  buildGreetingDelta,
  buildQuickDelta,
  buildEnhancedDelta,
  
  // Classifiers
  classifyIntent,
  getIntent,
  getDomain,
  getMaxTokens,
  getProactiveHint,
  
  // Constants
  PLANS: PLAN_CONFIGS,
  PROACTIVE_HINTS,
  PLAN_BADGES,
  
  // Core imports (for consumers)
  COMPANY,
  SORIVA,
  PROMPTS,
  CoreInstructions,
  
  // Utilities
  cleanResponse,
  
  // Legacy
  IDENTITY,
  SORIVA_IDENTITY,
  LANGUAGE,
  BEHAVIOR,
  STYLE,
  DELTA_CORE,
};

export default SorivaDeltaEngine;