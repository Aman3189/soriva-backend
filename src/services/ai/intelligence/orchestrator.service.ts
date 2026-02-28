/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE ORCHESTRATOR v5.0 - ZERO-LLM EDITION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * PHILOSOPHY: ZERO preprocessing LLM calls. Pure rule-based.
 * - ALL detection via keywords, patterns, regex
 * - NO LLM calls in preprocessing phase
 * - Token savings: ~2500 tokens per query
 * - Quality maintained via comprehensive patterns
 * 
 * v5.0 CHANGES (February 14, 2026) - ZERO-LLM:
 * - REMOVED: LLM service adapter (not needed anymore)
 * - REMOVED: ToneMatcher LLM calls → Pure regex formality detection
 * - REMOVED: SearchIntentRouter LLM calls → Pure keyword detection
 * - KEPT: All existing features (re-check, movie detection, etc.)
 * - KEPT: Caching infrastructure (still useful for rule results)
 * - ADDED: Enhanced keyword lists for better accuracy
 * 
 * TOKEN SAVINGS:
 * - Before: ~2500 tokens per preprocessing
 * - After: ~0 tokens (pure CPU)
 * - Savings: 100% in preprocessing phase
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../../constants';
import { OrchestratorConfig } from './orchestrator.config';
import { 
  getDomain, 
  getIntent,
  buildEnhancedDelta,
  type DomainType,
  type IntelligenceSync,
  type DeltaOutput,
} from '../../../core/ai/soriva-delta-engine';
import type { ToneAnalysis } from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ComplexityLevel = 'SIMPLE' | 'MEDIUM' | 'HIGH';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PreprocessorRequest {
  userId: string;
  message: string;
  planType: PlanType;
  userName?: string;
  userLocation?: string;
  userLanguage?: 'english' | 'hinglish' | 'hindi';
  conversationHistory?: ConversationMessage[];
}

export interface ProcessWithPreprocessorResult {
  complexity: ComplexityLevel;
  core: string;
  searchNeeded: boolean;
  searchQuery?: string;
  intent: string;
  domain: DomainType;
  routedTo: 'MISTRAL' | 'SMART_ROUTING';
  processingTimeMs: number;
  directResponse?: string;
  intelligenceSync?: IntelligenceSync;
  deltaOutput?: DeltaOutput;
  enhancedResult?: {
    analysis?: {
      emotion?: string;
      tone?: {
        language?: string;
        formality?: string;
        shouldUseHinglish?: boolean;
      };
      context?: {
        userIntent?: string;
        complexity?: string;
        questionType?: string;
      };
      // v3.1: Dynamic flags - computed from existing fields, NO static patterns
      needsVisual?: boolean;     // Derived from complexity + domain + intent
      needsRecency?: boolean;    // Derived from searchNeeded + category
      isFollowUp?: boolean;      // Derived from conversation context
    };
    metadata?: {
      processingTimeMs?: number;
      cacheHit?: boolean;
    };
  };
  systemPrompt?: string;
  isRecheckIntent?: boolean;
  originalSearchQuery?: string;
}

export interface QuickEnhanceRequest {
  userId: string;
  message: string;
  planType: PlanType;
}

export interface QuickEnhanceResult {
  analysis?: {
    emotion?: string;
    tone?: { language?: string };
    context?: {
      userIntent?: string;
      complexity?: string;
      questionType?: string;
    };
  };
  metadata?: { processingTimeMs?: number };
}

interface CachedToneData {
  analysis: ToneAnalysis;
  timestamp: number;
  messageCount: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RE-CHECK INTENT KEYWORDS (Unchanged)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RECHECK_KEYWORDS = [
  // Hinglish
  'dobara', 'dubara', 'doobara', 'phir se', 'fir se', 'phirse', 'firse',
  'ek baar aur', 'ek bar aur', 'ek baar or', 'ek bar or',
  'wapas', 'vapas', 'wapis', 'vapis',
  'check karo', 'check kijiye', 'check kar', 'check kariye',
  'dekho', 'dekhiye', 'dekh lo', 'dekh lena', 'dekh lijiye',
  'refresh', 'refresh karo', 'refresh kar',
  'update', 'update karo', 'update dikhao',
  'abhi ka', 'abhi ki', 'abhi wala', 'abhi wali',
  'latest', 'latest dikhao', 'latest btao',
  'naya', 'nayi', 'naye', 'new wala',
  'recheck', 're-check', 're check',
  // English
  'again', 'check again', 'try again', 'once more', 'one more time',
  'retry', 're-try', 'redo', 're-do',
  'refresh it', 'update it', 'check it again',
  'show again', 'show me again', 'tell me again',
  'repeat', 'repeat search', 'search again',
];

const SEARCH_CONTEXT_KEYWORDS = [
  'movie', 'film', 'showtime', 'theatre', 'theater', 'cinema',
  'news', 'khabar', 'weather', 'mausam', 'price', 'rate', 'bhav',
  'score', 'match', 'result', 'rating', 'review',
  'restaurant', 'hotel', 'flight', 'train',
  'stock', 'share', 'crypto', 'bitcoin',
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// v5.0: PURE RULE-BASED FORMALITY DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FORMALITY_PATTERNS = {
  formal: /\b(please|kindly|would you|could you|sir|madam|respected|aapka|aapki|kripya|sahab|sahib|madam ji|sir ji|ji|aap)\b/i,
  casual: /\b(hey|yo|lol|haha|bro|dude|yaar|arre|bhai|oye|abe|chal|haan|nah|kya be|bata na|bol na)\b/i,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// v5.0: ENHANCED HINDI MARKERS (No LLM needed)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HINDI_MARKERS = new Set([
  // Question words
  'kya', 'kaise', 'kab', 'kahan', 'kahaan', 'kyun', 'kyu', 'kaun', 'kitna', 'kitni', 'kitne', 'kaisi', 'kaisa', 'konsa', 'konsi',
  // Core verbs
  'hai', 'hain', 'ho', 'hoon', 'hun', 'hoga', 'hogi', 'honge', 'tha', 'thi',
  'raha', 'rahi', 'rahe',
  'kar', 'karo', 'karna', 'karti', 'karte', 'kiya',
  'bata', 'batao', 'btao', 'batana', 'batati', 'batate',
  'chal', 'chalo', 'jao', 'jaa', 'aao', 'aaja',
  'de', 'do', 'dena', 'dete',
  'le', 'lo', 'lena', 'lete',
  'dekh', 'dekho', 'sun', 'suno', 'bol', 'bolo', 'likh', 'likho',
  'padh', 'padho', 'samajh', 'samjho',
  // Pronouns
  'main', 'mai', 'mujhe', 'muje', 'aap', 'tum', 'hum', 'tera', 'meri', 'mere',
  // Postpositions
  'ka', 'ki', 'ke', 'ko', 'se', 'par', 'pe', 'tak', 'wala', 'wali', 'wale',
  // Common Hindi-only
  'nahi', 'nhi', 'mat', 'bilkul', 'zaroor', 'pakka', 'shayad',
  'accha', 'acha', 'achha', 'theek', 'thik', 'sahi', 'galat',
  'bahut', 'bohot', 'zyada', 'kam', 'thoda',
  'abhi', 'aaj', 'kal', 'subah', 'shaam', 'raat',
  'aur', 'bhi', 'phir'
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// v5.4: PRODUCTION-SAFE SEARCH TRIGGER SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOAL: Search rate 8-15%, Classifier rate 3-7%
// FLOW: Rule Engine (85-92%) → Classifier Escalation (5-10%) → Premium Fallback (1-3%)
// 
// v5.4 PRODUCTION FIXES:
// - Risk A: Common nouns ignore list (India, Monday, January)
// - Risk B: Windowed phrase detection for split finance queries
// - Risk C: Plan-based classifier escalation (PRO/APEX only)
// - Hybrid architecture for production reliability
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * STEP 1: HARD YES - These ALWAYS need search (real-time/external data)
 * Keywords that inherently require current/external information
 */
const HARD_YES_SEARCH_KEYWORDS = new Set([
  // Price & Rates (always dynamic)
  'price', 'rate', 'cost', 'bhav', 'kimat', 'daam', 'kitne ka', 'kitni ki',
  'kitne mein', 'kitne rupay', 'kitne paise', 'rate kya',
  
  // Time-sensitive queries
  'today', 'aaj', 'abhi', 'now', 'latest', 'live', 'current', 'breaking',
  'taaza', 'fresh', 'recent', 'trending', 'viral',
  
  // Location-based (need external API)
  'near me', 'nearby', 'paas mein', 'aas paas', 'directions', 'route',
  'kahan milega', 'kahan hai',
  
  // Scores & Results (always real-time)
  'score', 'result', 'match result', 'final score', 'kaun jeeta', 'winner',
  'toss', 'playing xi', 'live score', 'standings',
  
  // Contact & Business info
  'contact', 'phone number', 'address', 'email', 'website', 'timing',
  'opening hours', 'kab khulta', 'band kab', 'holiday',
  
  // Release & Launch dates
  'release date', 'kab aa rahi', 'kab release', 'kab launch', 'coming soon',
  'premiere', 'showtimes', 'show timing',
  
  // News & Events
  'news', 'khabar', 'headline', 'election', 'vote', 'incident', 'accident',
  'ghatna', 'hadsa',
  
  // Stock/Crypto (always real-time)
  'stock price', 'share price', 'sensex', 'nifty', 'bitcoin', 'crypto',
  
  // Weather (always real-time)
  'weather', 'mausam', 'barish', 'temperature', 'forecast',
]);

/**
 * v5.4 FIX Risk 1: Finance entities that need search when combined with predictive words
 * "Gold ka future kya hoga?" → needs search
 */
const FINANCE_ENTITIES = new Set([
  'gold', 'sona', 'silver', 'chandi', 'platinum',
  'dollar', 'rupee', 'euro', 'pound', 'yen', 'currency',
  'stock', 'share', 'equity', 'bond', 'mutual fund', 'etf',
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
  'sensex', 'nifty', 'nasdaq', 'dow jones',
  'petrol', 'diesel', 'crude', 'oil', 'gas',
  'real estate', 'property', 'land', 'flat', 'house',
  'interest rate', 'inflation', 'gdp', 'rbi', 'fed',
]);

const PREDICTIVE_FUTURE_WORDS = new Set([
  'future', 'bhavishya', 'aage', 'prediction', 'forecast', 'target',
  'hoga', 'hogi', 'honge', 'jayega', 'jayegi', 'expected', 'outlook',
  'will', 'gonna', 'going to', 'next year', 'next month', 'next week',
  'agle saal', 'agle mahine', 'agle hafte', 'kya hoga', 'kya jayega',
  'invest karu', 'invest karna', 'buy karu', 'sell karu', 'hold karu',
]);

/**
 * v5.4 FIX Risk A: Common nouns that should NOT trigger proper noun detection
 * Prevents over-triggering for "India", "Monday", etc.
 */
const COMMON_NOUN_IGNORE_LIST = new Set([
  // Countries & Places (common in queries)
  'india', 'bharat', 'america', 'usa', 'uk', 'china', 'pakistan', 'nepal',
  'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune',
  'london', 'new york', 'dubai', 'singapore',
  
  // Days of week
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'somvar', 'mangalvar', 'budhvar', 'guruvar', 'shukravar', 'shanivar', 'ravivar',
  
  // Months
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  
  // Common services (not company-specific queries)
  'google', 'youtube', 'whatsapp', 'instagram', 'facebook', 'twitter',
  'amazon', 'flipkart', 'swiggy', 'zomato', 'uber', 'ola',
  
  // Generic terms that get capitalized
  'ai', 'ml', 'api', 'app', 'web', 'mobile', 'internet', 'wifi',
  'pdf', 'doc', 'excel', 'word', 'email', 'sms',
]);

/**
 * STEP 2: HARD NO - These NEVER need search (AI can handle directly)
 * Creative, explanatory, or personal tasks
 */
const HARD_NO_SEARCH_PATTERNS = [
  // Explanatory (AI knowledge) - Generic concepts only
  /\b(explain|define|definition|describe|samjhao|samjha|samjhana)\b.*\b(concept|meaning|matlab|kya hota|kya matlab)\b/i,
  /\b(kya hota hai|what is the meaning|meaning of|definition of)\b/i,
  /\b(concept of|theory of|principle of)\b/i,
  
  // Creative writing (AI generates)
  /\b(write|likh|likho|likhna|banao|bana|create|generate)\b.*\b(poem|story|essay|letter|email|code|script|article|blog|content)\b/i,
  /\b(poem|kavita|shayari|story|kahani|essay|nibandh)\b.*\b(likh|write|bana|create)\b/i,
  
  // How-to/Tutorial (AI knowledge)
  /\b(how to|kaise kare|kaise karu|kaise karna|tarika|steps|guide|tutorial)\b/i,
  /\b(sikha|sikhao|teach|help me learn|madad|guide karo)\b/i,
  
  // Personal statements (memory, not search)
  /\b(my name is|mera naam|i am|main hoon|i live|main rehta|my age|meri umar)\b/i,
  /\b(my favourite|meri favourite|my favorite|meri pasand|i like|mujhe pasand)\b/i,
  /\b(remember|yaad rakh|yaad rakho|note kar|save kar)\b/i,
  
  // Conversational/Opinion (AI personality)
  /\b(what do you think|tumhara kya|tera kya|your opinion|aapka vichar)\b/i,
  /\b(tum kaun ho|who are you|what are you|introduce yourself|apna parichay)\b/i,
  
  // Math & Calculations (AI can compute)
  /\b(calculate|compute|solve|find the|hisab|ganit)\b.*\b(\d+|x|y|equation)\b/i,
  /^\s*\d+\s*[\+\-\*\/\%\^]\s*\d+/i, // Simple math like "5 + 3"
  
  // Translation & Language
  /\b(translate|translation|anuvad|meaning in|hindi mein|english mein)\b/i,
  
  // Code/Programming (AI generates)
  /\b(code|function|program|script|api|bug|fix|error|debug)\b.*\b(write|likh|bana|create|help)\b/i,
  /\b(write|create|make|build)\b.*\b(code|function|program|script|api)\b/i,
  
  // Summarization (AI processes)
  /\b(summarize|summary|summarise|saar|sangrah|short mein)\b/i,
  
  // Comparison/Analysis (AI reasoning) - BUT NOT for real entities
  /\b(compare|difference|vs|versus)\b.*\b(between|among|mein)\b.*\b(concept|theory|idea|approach)\b/i,
];

/**
 * STEP 3: DYNAMIC CHECK KEYWORDS (Ambiguous - need context analysis)
 * These MAY need search if asking about current/real-time info
 */
const DYNAMIC_CHECK_KEYWORDS = new Set([
  // Could be real-time or educational
  'movie', 'film', 'song', 'album', 'show', 'series',
  'restaurant', 'hotel', 'doctor', 'hospital',
  'company', 'startup', 'brand', 'product',
  'person', 'celebrity', 'politician', 'player',
]);

/**
 * Time-sensitivity indicators (used in Step 3)
 * v5.4: No hardcoded years - uses YEAR_PATTERN regex
 */
const TIME_SENSITIVITY_MARKERS = new Set([
  'now', 'today', 'aaj', 'abhi', 'latest', 'current', 'new', 'naya', 'nayi',
  'recent', 'this year', 'is saal', 'upcoming', 'aane wali',
  'kab', 'when', 'timing', 'schedule', 'release', 'launch',
]);

// v5.4: Dynamic year regex instead of hardcoded '2025', '2026'
const YEAR_PATTERN = /\b20\d{2}\b/;

/**
 * v5.4 FIX Risk 2: Better factual intent detection for proper nouns
 * Questions that indicate factual info need (valuation, revenue, funding, etc.)
 */
const FACTUAL_INTENT_PATTERNS = [
  /\b(valuation|revenue|funding|profit|loss|earnings|sales|turnover)\b/i,
  /\b(ceo|founder|owner|chairman|president|employee|staff|team)\b/i,
  /\b(headquarter|hq|office|location|based in|founded|established)\b/i,
  /\b(worth|net worth|salary|income|assets|market cap)\b/i,
  /\b(launched|acquired|merged|ipo|investment|investor)\b/i,
  /\b(kab shuru|kisne banaya|kaun hai|malik kaun|kitna kamata)\b/i,
];

/**
 * v5.4: Confidence levels and plan-based escalation
 * - HIGH: HARD YES/NO matched
 * - MEDIUM: Dynamic check matched
 * - LOW: Ambiguous, may need classifier
 * - VERY_LOW: Classifier SHOULD be triggered (for PRO/APEX)
 */
const SEARCH_CONFIDENCE = {
  HIGH: 0.9,
  MEDIUM: 0.7,
  LOW: 0.5,
  VERY_LOW: 0.3,
  // Thresholds
  CLASSIFIER_THRESHOLD: 0.5,  // Below this → trigger classifier (if PRO/APEX)
  FORCE_SEARCH_THRESHOLD: 0.3, // Below this AND paid plan → force search
};

/**
 * v5.4: Plans that get classifier escalation
 * STARTER/LITE: No classifier (cost control)
 * PLUS: Basic classifier escalation
 * PRO/APEX: Full classifier + premium fallback
 */
const CLASSIFIER_ENABLED_PLANS = new Set(['PLUS', 'PRO', 'APEX']);
const PREMIUM_FALLBACK_PLANS = new Set(['PRO', 'APEX']);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORCHESTRATOR CLASS v5.4
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class IntelligenceOrchestrator {
  private static instance: IntelligenceOrchestrator;
  private toneCache: Map<string, CachedToneData> = new Map();
  private lastSearchQueryCache: Map<string, { query: string; domain: DomainType; timestamp: number }> = new Map();

  private constructor() {
    const stats = OrchestratorConfig.getStats();
    console.log('[Orchestrator] 🚀 v5.0 ZERO-LLM Edition initialized');
    console.log('[Orchestrator] 📊 Config loaded:', {
      searchCategories: stats.searchCategories,
      totalKeywords: stats.totalSearchKeywords,
      greetings: stats.greetingsCount,
      mode: 'PURE_RULE_BASED',
      llmCalls: 0,
    });
  }

  static getInstance(): IntelligenceOrchestrator {
    if (!IntelligenceOrchestrator.instance) {
      IntelligenceOrchestrator.instance = new IntelligenceOrchestrator();
    }
    return IntelligenceOrchestrator.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RE-CHECK INTENT DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private hasRecheckIntent(messageLower: string): boolean {
    return RECHECK_KEYWORDS.some(kw => messageLower.includes(kw));
  }

  private findLastSearchQuery(
    history: ConversationMessage[] | undefined,
    userId: string
  ): { query: string; domain: DomainType } | null {
    const cached = this.lastSearchQueryCache.get(userId);
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 60 * 1000) {
      console.log(`[Orchestrator] 🔄 Re-check: Using cached last search: "${cached.query.slice(0, 40)}..."`);
      return { query: cached.query, domain: cached.domain };
    }

    if (!history || history.length === 0) return null;

    const maxMessages = Math.min(history.length, 15);
    for (let i = history.length - 1; i >= history.length - maxMessages; i--) {
      const msg = history[i];
      if (msg.role !== 'user') continue;
      
      const content = msg.content.toLowerCase();
      if (this.hasRecheckIntent(content)) continue;
      
      const hasSearchContext = SEARCH_CONTEXT_KEYWORDS.some(kw => content.includes(kw));
      
      if (hasSearchContext) {
        const domain = getDomain(msg.content);
        console.log(`[Orchestrator] 🔄 Re-check: Found previous search query: "${msg.content.slice(0, 40)}..."`);
        return { query: msg.content, domain };
      }
    }

    return null;
  }

  storeLastSearchQuery(userId: string, query: string, domain: DomainType): void {
    this.lastSearchQueryCache.set(userId, { query, domain, timestamp: Date.now() });
    
    if (this.lastSearchQueryCache.size > 1000) {
      const oldest = this.lastSearchQueryCache.keys().next().value;
      if (oldest) this.lastSearchQueryCache.delete(oldest);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN METHOD: processWithPreprocessor (ZERO LLM)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async processWithPreprocessor(request: PreprocessorRequest): Promise<ProcessWithPreprocessorResult> {
    const startTime = Date.now();
    const { userId, message, planType, userName, userLocation, userLanguage, conversationHistory } = request;
    const messageLower = message.toLowerCase().trim();
    const settings = OrchestratorConfig.getSettings();

    // v5.0: Pure rule-based language detection (NO LLM)
    const detectedLanguage = userLanguage || this.detectLanguageRule(messageLower);
    const isHinglish = detectedLanguage === 'hinglish';

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Orchestrator] 🚀 v5.0 ZERO-LLM Processing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Message: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`);
    console.log(`📋 Plan: ${planType} | User: ${userName || userId.slice(0, 8)}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 0.5: RE-CHECK INTENT DETECTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (this.hasRecheckIntent(messageLower)) {
      const lastSearch = this.findLastSearchQuery(conversationHistory, userId);
      
      if (lastSearch) {
        const processingTime = Date.now() - startTime;
        console.log(`[Orchestrator] 🔄 RE-CHECK INTENT DETECTED!`);
        console.log(`[Orchestrator] 📝 Original query: "${lastSearch.query.slice(0, 50)}..."`);
        console.log(`[Orchestrator] ⏱️ Processing: ${processingTime}ms (ZERO LLM)`);
        
        return {
          complexity: 'MEDIUM',
          core: lastSearch.query.slice(0, 50),
          searchNeeded: true,
          searchQuery: lastSearch.query,
          intent: 'QUICK',
          domain: lastSearch.domain,
          routedTo: 'SMART_ROUTING',
          processingTimeMs: processingTime,
          isRecheckIntent: true,
          originalSearchQuery: lastSearch.query,
          enhancedResult: {
            analysis: {
              emotion: 'neutral',
              tone: { 
                language: detectedLanguage,
                formality: 'casual',
                shouldUseHinglish: isHinglish,
              },
              context: { 
                userIntent: 'recheck_search', 
                complexity: 'MEDIUM', 
                questionType: 'factual' 
              },
            },
            metadata: { processingTimeMs: processingTime, cacheHit: false },
          },
        };
      } else {
        console.log(`[Orchestrator] ⚠️ Re-check intent but no previous search found`);
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: Check for simple greeting
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (this.isSimpleGreeting(messageLower)) {
      const processingTime = Date.now() - startTime;
      console.log(`✅ Simple greeting detected - SKIP all processing`);
      console.log(`⏱️ Processing time: ${processingTime}ms (ZERO LLM)`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return {
        complexity: 'SIMPLE',
        core: 'greeting',
        searchNeeded: false,
        intent: 'CASUAL',
        domain: 'general',
        routedTo: 'MISTRAL',
        processingTimeMs: processingTime,
        enhancedResult: {
          analysis: {
            emotion: 'neutral',
            tone: { language: detectedLanguage },
          },
          metadata: { processingTimeMs: processingTime, cacheHit: false },
        },
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1.5: MOVIE SEQUEL DETECTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const genericSequelPattern = /\b([\w][\w\s]{0,30}?)\s+(2|3|4|5|6|7|8|9|10|two|three|four|five|part\s*\d+|chapter\s*\d+)\b/i;
    const movieContextPattern = /\b(movie|film|rating|imdb|review|release|cast|dekhni|dekhi|dekhna|dekhu|dekhenge|showtimes?|trailer|box\s*office|kaisi\s*hai|kab\s*aa\s*rahi|kab\s*release|lagi|lagti|laga|chal|chalti|chala|running|playing|cinema|theatre|theater|ticket)\b/i;
    
    const sequelMatch = messageLower.match(genericSequelPattern);
    const hasMovieContext = movieContextPattern.test(messageLower);
    
    if (sequelMatch && hasMovieContext) {
      const movieName = sequelMatch[0].trim();
      
      console.log(`[Orchestrator] 🎬 MOVIE SEQUEL DETECTED: "${movieName}"`);
      this.storeLastSearchQuery(userId, message, 'entertainment');
      
      const processingTime = Date.now() - startTime;
      return {
        complexity: 'MEDIUM',
        core: movieName,
        searchNeeded: true,
        searchQuery: movieName,
        intent: 'QUICK',
        domain: 'entertainment',
        routedTo: 'SMART_ROUTING',
        processingTimeMs: processingTime,
        enhancedResult: {
          analysis: {
            emotion: 'neutral',
            tone: { 
              language: detectedLanguage,
              formality: 'casual',
              shouldUseHinglish: isHinglish,
            },
            context: { 
              userIntent: 'movie_info', 
              complexity: 'MEDIUM', 
              questionType: 'factual' 
            },
          },
          metadata: { processingTimeMs: processingTime, cacheHit: false },
        },
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: Detect search need (v5.0: PURE KEYWORD - NO LLM)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const searchAnalysis = this.detectSearchNeedRule(messageLower, message);
    console.log(`🔍 Search Analysis (Rule-Based):`, {
      needed: searchAnalysis.needed,
      category: searchAnalysis.category,
      matchedKeywords: searchAnalysis.matchedKeywords.slice(0, 3),
    });

    // STEP 3: Domain & Intent Detection (Rule-based from delta engine)
    const domain = settings.enableDomainDetection 
      ? getDomain(message) 
      : this.categoryToDomain(searchAnalysis.category);
    const intent = getIntent(message, planType as any);
    console.log(`🎯 Domain: ${domain} | Intent: ${intent}`);

    if (searchAnalysis.needed) {
      this.storeLastSearchQuery(userId, message, domain);
    }

    // STEP 4: Complexity & Core Extraction (Rule-based)
    const complexity = this.estimateComplexity(messageLower);
    const core = this.extractCore(messageLower, message);
    console.log(`🧠 Complexity: ${complexity} | Core: "${core.slice(0, 30)}..."`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 5: Tone Analysis (v5.0: PURE RULE-BASED - NO LLM)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const toneResult = this.analyzeToneRule(userId, message, messageLower);
    console.log(`🎵 Tone (Rule-Based):`, {
      language: toneResult.analysis?.language || 'unknown',
      formality: toneResult.analysis?.formality || 'unknown',
      cacheHit: toneResult.cacheHit,
    });

    // STEP 6: Build Intelligence Sync
    const detectedLang = (['english', 'hindi', 'hinglish'].includes(toneResult.analysis?.language || '') 
      ? toneResult.analysis?.language as 'english' | 'hindi' | 'hinglish' 
      : 'english');
    
    const intelligenceSync: IntelligenceSync = {
      toneAnalysis: toneResult.analysis ? {
        detectedLanguage: detectedLang,
        shouldUseHinglish: toneResult.analysis.language === 'hinglish' || toneResult.analysis.language === 'hindi',
        formalityLevel: toneResult.analysis.formality || 'casual',
      } : undefined,
      emotionalState: { mood: 'neutral', stressLevel: 0 },
      proactiveContext: { recentTopics: [], pendingFollowUps: [] },
    };

    // STEP 7: Pre-build Delta
    let deltaOutput: DeltaOutput | undefined;
    let systemPrompt: string | undefined;
    
    if (settings.enableDeltaPrebuild) {
      deltaOutput = buildEnhancedDelta(
        {
          message,
          userContext: {
            plan: planType as any,
            name: userName,
            location: userLocation,
            language: userLanguage || detectedLang,
          },
          searchContext: { hasResults: false, domain },
        },
        intelligenceSync
      );
      systemPrompt = deltaOutput.systemPrompt;
      console.log(`📄 Delta pre-built: ${systemPrompt.length} chars`);
    }

    // STEP 8: Determine Routing
    const routedTo = this.determineRouting(complexity, planType, searchAnalysis.needed);
    const processingTime = Date.now() - startTime;

    // STEP 9: Build Search Query
    let searchQuery: string | undefined;
    if (searchAnalysis.needed) {
      searchQuery = this.buildSearchQuery(message, core, searchAnalysis.category, domain);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // v3.1: DYNAMIC FLAGS (computed from existing analysis)
    // 100% dynamic - no hardcoded lists, AI decides everything
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // needsVisual: Enable for non-simple queries, let AI + Visual Engine decide
    // AI has instructions to generate diagrams only when valuable
    // Visual Engine will parse and validate - if no visual block, hasVisual=false
    const needsVisual = complexity !== 'SIMPLE' && !searchAnalysis.needed;
    
    // needsRecency: TRUE if search is needed (orchestrator already decided this dynamically)
    const needsRecency = searchAnalysis.needed;

    console.log(`🎯 Final Decision:`, {
      domain, intent, complexity,
      searchNeeded: searchAnalysis.needed,
      needsVisual,
      searchQuery: searchQuery ? searchQuery.slice(0, 50) + '...' : 'N/A',
      routedTo, 
      processingTimeMs: processingTime,
      llmCalls: 0,  // v5.0: Always 0!
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      complexity, core,
      searchNeeded: searchAnalysis.needed,
      searchQuery,
      intent, domain, routedTo, processingTimeMs: processingTime,
      intelligenceSync, deltaOutput, systemPrompt,
      enhancedResult: {
        analysis: {
          emotion: 'neutral',
          tone: {
            language: toneResult.analysis?.language || detectedLanguage,
            formality: toneResult.analysis?.formality,
            shouldUseHinglish: toneResult.analysis?.suggestedStyle?.useHinglish,
          },
          context: {
            userIntent: intent,
            complexity: complexity,
            questionType: searchAnalysis.category || domain,
          },
          // v3.1: Dynamic flags - derived from existing analysis
          needsVisual,
          needsRecency,
          isFollowUp: false,  // Will be set by conversation context in streaming
        },
        metadata: { processingTimeMs: processingTime, cacheHit: toneResult.cacheHit },
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v5.0: PURE RULE-BASED TONE ANALYSIS (NO LLM!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeToneRule(
    userId: string, 
    message: string, 
    messageLower: string
  ): { analysis: ToneAnalysis | null; cacheHit: boolean } {
    const settings = OrchestratorConfig.getSettings();

    // Check cache first
    const cached = this.toneCache.get(userId);
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      const cacheValid = cacheAge < (settings.toneCacheTTLMs || 300000) &&
                          cached.messageCount < (settings.toneCacheMaxMessages || 10);
      
      if (cacheValid) {
        cached.messageCount++;
        return { analysis: cached.analysis, cacheHit: true };
      }
    }

    // v5.0: Pure rule-based analysis
    const language = this.detectLanguageRule(messageLower);
    const formality = this.detectFormalityRule(messageLower);

    const analysis: ToneAnalysis = {
      language,
      formality,
      hindiWordsPercent: this.calculateHindiPercent(messageLower),
      englishWordsPercent: 100 - this.calculateHindiPercent(messageLower),
      hinglishPhrases: [],
      shouldMatchTone: true,
      suggestedStyle: {
        useHinglish: language === 'hinglish' || language === 'hindi',
        formalityLevel: formality,
        examplePhrases: formality === 'formal' 
          ? ['Ji bilkul', 'Zaroor'] 
          : ['Haan bilkul!', 'Batati hoon'],
      },
    };

    // Cache the result
    this.toneCache.set(userId, {
      analysis,
      timestamp: Date.now(),
      messageCount: 1,
    });
    
    this.cleanupToneCache();

    return { analysis, cacheHit: false };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v5.1: RULE-BASED SEARCH WITH FUZZY TYPO TOLERANCE (NO LLM!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Levenshtein distance - calculates how different two strings are
   * Returns number of edits needed to transform one string to another
   */
  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Check if word is similar to keyword (typo tolerant)
   * Max distance = 2 for words >= 4 chars, 1 for shorter words
   */
  private isFuzzyMatch(word: string, keyword: string): boolean {
    // Exact match
    if (word === keyword) return true;
    
    // For multi-word keywords like "what is", check if message contains it with typos
    if (keyword.includes(' ')) {
      const keywordParts = keyword.split(' ');
      const wordParts = word.split(' ');
      // Not applicable for single words
      return false;
    }
    
    // Skip very short words (< 3 chars) - too many false positives
    if (word.length < 3 || keyword.length < 3) return false;
    
    // Calculate max allowed distance based on word length
    const maxDistance = keyword.length >= 5 ? 2 : 1;
    
    const distance = this.levenshteinDistance(word, keyword);
    return distance <= maxDistance;
  }

  /**
   * Fuzzy match for multi-word patterns like "what is" 
   */
  private isFuzzyPhraseMatch(message: string, phrase: string): boolean {
    const phraseParts = phrase.toLowerCase().split(' ');
    if (phraseParts.length === 1) return false; // Use isFuzzyMatch for single words
    
    const messageParts = message.toLowerCase().split(/\s+/);
    
    // Look for consecutive words that fuzzy match the phrase
    for (let i = 0; i <= messageParts.length - phraseParts.length; i++) {
      let allMatch = true;
      for (let j = 0; j < phraseParts.length; j++) {
        if (!this.isFuzzyMatch(messageParts[i + j], phraseParts[j])) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) return true;
    }
    
    return false;
  }

  private detectSearchNeedRule(
    messageLower: string,
    original: string,
    planType?: string
  ): { needed: boolean; category: string | null; matchedKeywords: string[]; confidence?: number; needsClassifier?: boolean } {
    
    const words = messageLower.split(/\s+/);
    const matchedKeywords: string[] = [];
    let confidence = SEARCH_CONFIDENCE.HIGH;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: HARD YES - Always needs search (real-time data)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Check for HARD YES keywords (single words)
    for (const word of words) {
      if (HARD_YES_SEARCH_KEYWORDS.has(word)) {
        matchedKeywords.push(`[HARD_YES:${word}]`);
      }
    }
    
    // Check for HARD YES phrases (multi-word)
    for (const phrase of HARD_YES_SEARCH_KEYWORDS) {
      if (phrase.includes(' ') && messageLower.includes(phrase)) {
        matchedKeywords.push(`[HARD_YES:${phrase}]`);
      }
    }
    
    if (matchedKeywords.length > 0) {
      const category = this.inferCategoryFromKeywords(matchedKeywords);
      console.log(`🔍 [SearchAnalysis] STEP 1 - HARD YES triggered: ${matchedKeywords.join(', ')}`);
      return { needed: true, category, matchedKeywords, confidence: SEARCH_CONFIDENCE.HIGH };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // v5.4 FIX Risk B: Finance Entity + Predictive Intent (Windowed)
    // "gold price agle mahine" - handles split phrases across sentence
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    let hasFinanceEntity = false;
    let financeEntity = '';
    
    // Check single words
    for (const word of words) {
      if (FINANCE_ENTITIES.has(word)) {
        hasFinanceEntity = true;
        financeEntity = word;
        break;
      }
    }
    
    // Check multi-word finance entities
    if (!hasFinanceEntity) {
      for (const entity of FINANCE_ENTITIES) {
        if (entity.includes(' ') && messageLower.includes(entity)) {
          hasFinanceEntity = true;
          financeEntity = entity;
          break;
        }
      }
    }
    
    if (hasFinanceEntity) {
      let hasPredictiveIntent = false;
      
      // v5.4 FIX Risk B: Windowed search - check entire message for predictive words
      // Not just adjacent words, but anywhere in the sentence
      for (const word of words) {
        if (PREDICTIVE_FUTURE_WORDS.has(word)) {
          hasPredictiveIntent = true;
          break;
        }
      }
      
      // Check multi-word predictive phrases
      if (!hasPredictiveIntent) {
        for (const phrase of PREDICTIVE_FUTURE_WORDS) {
          if (phrase.includes(' ') && messageLower.includes(phrase)) {
            hasPredictiveIntent = true;
            break;
          }
        }
      }
      
      // v5.4 ADDITION: Also check for predictive patterns (regex-based)
      if (!hasPredictiveIntent) {
        const predictivePatterns = [
          /\b(agle|next|future|coming)\s+(week|month|year|saal|mahine|hafte)\b/i,
          /\b(invest|buy|sell|hold)\s+(karu|karna|chahiye|should)\b/i,
          /\bkya\s+(hoga|jayega|ayega|rahega)\b/i,
        ];
        for (const pattern of predictivePatterns) {
          if (pattern.test(messageLower)) {
            hasPredictiveIntent = true;
            break;
          }
        }
      }
      
      if (hasPredictiveIntent) {
        matchedKeywords.push(`[FINANCE+FUTURE:${financeEntity}]`);
        console.log(`🔍 [SearchAnalysis] v5.4 - Finance + Future intent: ${financeEntity}`);
        return { needed: true, category: 'finance', matchedKeywords, confidence: SEARCH_CONFIDENCE.HIGH };
      }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: HARD NO - Never needs search (AI handles directly)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    for (const pattern of HARD_NO_SEARCH_PATTERNS) {
      if (pattern.test(messageLower)) {
        console.log(`🔍 [SearchAnalysis] STEP 2 - HARD NO triggered: ${pattern.source.slice(0, 30)}...`);
        return { needed: false, category: null, matchedKeywords: ['[HARD_NO]'], confidence: SEARCH_CONFIDENCE.HIGH };
      }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3: AMBIGUOUS - Check if dynamic/time-sensitive
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Check for dynamic keywords (movie, restaurant, etc.)
    let hasDynamicKeyword = false;
    let dynamicKeyword = '';
    for (const word of words) {
      if (DYNAMIC_CHECK_KEYWORDS.has(word)) {
        hasDynamicKeyword = true;
        dynamicKeyword = word;
        break;
      }
    }
    
    if (hasDynamicKeyword) {
      let hasTimeSensitivity = false;
      
      // Check TIME_SENSITIVITY_MARKERS
      for (const marker of TIME_SENSITIVITY_MARKERS) {
        if (messageLower.includes(marker)) {
          hasTimeSensitivity = true;
          matchedKeywords.push(`[DYNAMIC:${dynamicKeyword}+${marker}]`);
          break;
        }
      }
      
      // v5.4: Dynamic year detection
      if (!hasTimeSensitivity && YEAR_PATTERN.test(messageLower)) {
        hasTimeSensitivity = true;
        const yearMatch = messageLower.match(YEAR_PATTERN);
        matchedKeywords.push(`[DYNAMIC:${dynamicKeyword}+year:${yearMatch?.[0]}]`);
      }
      
      // Real-time info patterns
      const realTimePatterns = [
        /\b(rating|review|imdb|rotten|tomatoes|kaisi hai|kaisi lagi|hit ya flop)\b/i,
        /\b(booking|ticket|reservation|available|open|closed|band|khula)\b/i,
        /\b(menu|dish|specialty|special)\b.*\b(aaj|today|abhi)\b/i,
        /\b(appointment|slot|timing|schedule)\b/i,
      ];
      
      for (const pattern of realTimePatterns) {
        if (pattern.test(messageLower)) {
          hasTimeSensitivity = true;
          matchedKeywords.push(`[DYNAMIC:realtime-pattern]`);
          break;
        }
      }
      
      if (hasTimeSensitivity) {
        const category = this.inferCategoryFromKeywords([dynamicKeyword]);
        console.log(`🔍 [SearchAnalysis] STEP 3 - DYNAMIC + TIME-SENSITIVE: ${matchedKeywords.join(', ')}`);
        return { needed: true, category, matchedKeywords, confidence: SEARCH_CONFIDENCE.MEDIUM };
      }
      
      console.log(`🔍 [SearchAnalysis] STEP 3 - DYNAMIC but NOT time-sensitive: "${dynamicKeyword}" - SKIP SEARCH`);
      return { needed: false, category: null, matchedKeywords: [], confidence: SEARCH_CONFIDENCE.MEDIUM };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // v5.4 FIX Risk A: Better Proper Noun Detection
    // Ignores common nouns, sentence-start words, generic terms
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const properNouns = this.extractProperNouns(original);
    const hasValidProperNoun = properNouns.length > 0;
    
    // Check for factual intent
    let hasFactualIntent = false;
    for (const pattern of FACTUAL_INTENT_PATTERNS) {
      if (pattern.test(messageLower)) {
        hasFactualIntent = true;
        break;
      }
    }
    
    if (hasValidProperNoun && hasFactualIntent) {
      console.log(`🔍 [SearchAnalysis] v5.4 - Proper noun + Factual intent: ${properNouns.join(', ')}`);
      return { 
        needed: true, 
        category: 'info', 
        matchedKeywords: [`[PROPER_NOUN:${properNouns[0]}+FACTUAL]`],
        confidence: SEARCH_CONFIDENCE.MEDIUM,
      };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3B: Legacy Unknown Entity Detection
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (this.isLikelyUnknownEntity(original)) {
      console.log(`🔍 [SearchAnalysis] STEP 3B - Unknown entity detected - SEARCH`);
      return { 
        needed: true, 
        category: 'info', 
        matchedKeywords: ['[unknown-entity]'],
        confidence: SEARCH_CONFIDENCE.LOW,
      };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // v5.4 FIX Risk C: Plan-based Classifier Escalation
    // Long ambiguous questions → classifier for PRO/APEX only
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const isAmbiguous = messageLower.length > 50 && 
                        /\?|kya|kaun|kab|kahan|kyun|how|what|when|where|who|why/.test(messageLower);
    
    if (isAmbiguous) {
      const needsClassifier = planType ? CLASSIFIER_ENABLED_PLANS.has(planType) : false;
      const shouldForceSearch = planType ? PREMIUM_FALLBACK_PLANS.has(planType) : false;
      
      console.log(`🔍 [SearchAnalysis] AMBIGUOUS - Plan: ${planType}, Classifier: ${needsClassifier}`);
      
      // For PRO/APEX: Flag for classifier escalation
      if (needsClassifier) {
        return { 
          needed: false, // Default no, but classifier may override
          category: null, 
          matchedKeywords: ['[AMBIGUOUS:CLASSIFIER_ELIGIBLE]'],
          confidence: SEARCH_CONFIDENCE.LOW,
          needsClassifier: true,
        };
      }
      
      // For STARTER/LITE: Just return no search (cost control)
      return { 
        needed: false, 
        category: null, 
        matchedKeywords: ['[AMBIGUOUS:STARTER]'],
        confidence: SEARCH_CONFIDENCE.LOW,
        needsClassifier: false,
      };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DEFAULT: No search needed
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`🔍 [SearchAnalysis] No triggers matched - SKIP SEARCH`);
    return { needed: false, category: null, matchedKeywords: [], confidence: SEARCH_CONFIDENCE.MEDIUM };
  }

  /**
   * v5.4 FIX Risk A: Extract proper nouns, ignoring common nouns
   * Filters out: sentence-start words, days, months, common places, services
   */
  private extractProperNouns(text: string): string[] {
    const properNouns: string[] = [];
    
    // Split into sentences to handle sentence-start capitalization
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      const words = trimmed.split(/\s+/);
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const isFirstWord = i === 0;
        
        // Skip if first word of sentence (might just be capitalized)
        if (isFirstWord && words.length > 1) continue;
        
        // Check for capitalization patterns
        const isCamelCase = /^[A-Z][a-z]+[A-Z]/.test(word); // OpenAI, SpaceX
        const isAllCaps = /^[A-Z]{2,}$/.test(word); // NASA, IBM
        const isCapitalized = /^[A-Z][a-z]+$/.test(word); // Apple, Google
        
        if (isCamelCase || isAllCaps || isCapitalized) {
          const wordLower = word.toLowerCase();
          
          // v5.4 FIX Risk A: Skip common nouns
          if (COMMON_NOUN_IGNORE_LIST.has(wordLower)) {
            continue;
          }
          
          properNouns.push(word);
        }
      }
    }
    
    return properNouns;
  }

  /**
   * v5.4: Check if classifier fallback should be triggered
   * Plan-aware: Only for PLUS/PRO/APEX
   */
  shouldTriggerClassifierFallback(confidence: number | undefined, planType?: string): boolean {
    if (confidence === undefined) return false;
    if (!planType || !CLASSIFIER_ENABLED_PLANS.has(planType)) return false;
    return confidence < SEARCH_CONFIDENCE.CLASSIFIER_THRESHOLD;
  }

  /**
   * v5.4: Check if premium fallback (force search) should apply
   * Only for PRO/APEX on very low confidence
   */
  shouldForcePremiumSearch(confidence: number | undefined, planType?: string): boolean {
    if (confidence === undefined) return false;
    if (!planType || !PREMIUM_FALLBACK_PLANS.has(planType)) return false;
    return confidence < SEARCH_CONFIDENCE.FORCE_SEARCH_THRESHOLD;
  }

  /**
   * Infer category from matched keywords for domain routing
   */
  private inferCategoryFromKeywords(keywords: string[]): string {
    const keywordStr = keywords.join(' ').toLowerCase();
    
    if (/price|rate|cost|stock|sensex|nifty|bitcoin|crypto/.test(keywordStr)) return 'finance';
    if (/weather|mausam|barish|temperature/.test(keywordStr)) return 'weather';
    if (/score|match|result|toss|playing/.test(keywordStr)) return 'sports';
    if (/movie|film|song|album|show|rating|imdb/.test(keywordStr)) return 'entertainment';
    if (/news|khabar|headline|incident|accident/.test(keywordStr)) return 'news';
    if (/near|nearby|paas|directions|route|restaurant|hotel/.test(keywordStr)) return 'local';
    if (/release|launch|showtimes|timing/.test(keywordStr)) return 'entertainment';
    
    return 'info';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v5.0: PURE RULE-BASED LANGUAGE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectLanguageRule(text: string): 'english' | 'hinglish' | 'hindi' {
    const trimmed = text.trim();
    if (!trimmed) return 'english';

    // Devanagari = Hindi 100%
    if (/[\u0900-\u097F]/.test(trimmed)) {
      return 'hindi';
    }

    const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'english';

    let hindiCount = 0;
    for (const word of words) {
      const cleaned = word.replace(/[?!.,;:'"()]/g, '');
      if (HINDI_MARKERS.has(cleaned)) {
        hindiCount++;
      }
    }

    const ratio = hindiCount / words.length;

    // Roman Hindi majority
    if (ratio >= 0.7) return 'hindi';
    
    // Hinglish threshold
    if (hindiCount >= 2 || ratio >= 0.2) return 'hinglish';
    
    // Short message (1 word)
    if (words.length === 1) {
      const cleaned = words[0].replace(/[?!.,;:'"()]/g, '');
      if (HINDI_MARKERS.has(cleaned)) return 'hinglish';
    }

    return 'english';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v5.0: PURE RULE-BASED FORMALITY DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectFormalityRule(text: string): 'casual' | 'semi_formal' | 'formal' {
    if (text.length <= 5) return 'casual';

    if (FORMALITY_PATTERNS.formal.test(text)) return 'formal';
    if (FORMALITY_PATTERNS.casual.test(text)) return 'casual';

    // Default based on message length
    if (text.length > 100) return 'semi_formal';
    
    return 'casual';
  }

  private calculateHindiPercent(text: string): number {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0;

    let hindiCount = 0;
    for (const word of words) {
      const cleaned = word.replace(/[?!.,;:'"()]/g, '');
      if (HINDI_MARKERS.has(cleaned)) hindiCount++;
    }

    return Math.round((hindiCount / words.length) * 100);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUICK ENHANCE (Backward compatibility)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async quickEnhance(request: QuickEnhanceRequest): Promise<QuickEnhanceResult> {
    const { message } = request;
    const messageLower = message.toLowerCase();
    const language = this.detectLanguageRule(messageLower);

    return {
      analysis: {
        emotion: 'neutral',
        tone: { language },
        context: {
          userIntent: getIntent(message, request.planType as any),
          complexity: this.estimateComplexity(messageLower),
          questionType: 'general',
        },
      },
      metadata: { processingTimeMs: 1 },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private cleanupToneCache(): void {
    const now = Date.now();
    const TONE_TTL = 10 * 60 * 1000;
    const TONE_MAX = 500;
    
    for (const [key, value] of this.toneCache) {
      if (now - value.timestamp > TONE_TTL) {
        this.toneCache.delete(key);
      }
    }
    if (this.toneCache.size > TONE_MAX) {
      const excess = this.toneCache.size - TONE_MAX;
      const keys = Array.from(this.toneCache.keys()).slice(0, excess);
      keys.forEach(k => this.toneCache.delete(k));
    }
  }

  private cleanupSearchCache(): void {
    const now = Date.now();
    const SEARCH_TTL = 2 * 60 * 60 * 1000;
    const SEARCH_MAX = 500;
    
    for (const [key, value] of this.lastSearchQueryCache) {
      if (now - value.timestamp > SEARCH_TTL) {
        this.lastSearchQueryCache.delete(key);
      }
    }
    if (this.lastSearchQueryCache.size > SEARCH_MAX) {
      const excess = this.lastSearchQueryCache.size - SEARCH_MAX;
      const keys = Array.from(this.lastSearchQueryCache.keys()).slice(0, excess);
      keys.forEach(k => this.lastSearchQueryCache.delete(k));
    }
  }

  clearToneCache(userId: string): void {
    this.toneCache.delete(userId);
    console.log(`[Orchestrator] 🧹 Tone cache cleared for: ${userId.slice(0, 8)}`);
  }

  clearAllCaches(): void {
    this.toneCache.clear();
    this.lastSearchQueryCache.clear();
    console.log(`[Orchestrator] 🧹 All caches cleared`);
  }

  getCacheStats(): { toneCache: number; lastSearchCache: number } {
    this.cleanupToneCache();
    this.cleanupSearchCache();
    
    return { 
      toneCache: this.toneCache.size,
      lastSearchCache: this.lastSearchQueryCache.size,
    };
  }

  getConfig() {
    return OrchestratorConfig;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private isSimpleGreeting(message: string): boolean {
    const greetings = OrchestratorConfig.getSimpleGreetings();
    const cleaned = message.replace(/[!?.,"']/g, '').trim();
    
    if (greetings.has(cleaned)) return true;
    
    if (cleaned.length < 15) {
      const words = cleaned.split(/\s+/);
      if (words.length <= 3 && greetings.has(words[0])) {
        return true;
      }
    }
    return false;
  }

  private isLikelyUnknownEntity(original: string): boolean {
    const raw = original.trim();
    const m = original.trim().toLowerCase();

    const capitalizedPhrase = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)\b/.test(raw);
    const brandedName = /\b([A-Za-z]+(?:AI|App|Pro|X|OS|Lab|Studio|Hub|Works|Tech))\b/.test(raw);
    const toolMention = /\b(tool|app|saas|platform|software|service|company|website|product)\b/i.test(m);
    const infoIntent = /\b(baare|about|explain|kya|batao|btao|btaao|detail|details|information|info|jaankari|jankari)\b/i.test(m);

    return infoIntent && (capitalizedPhrase || brandedName || toolMention);
  }

  private estimateComplexity(message: string): ComplexityLevel {
    const patterns = OrchestratorConfig.getComplexityPatterns();
    const wordCount = message.split(/\s+/).length;
    if (patterns.high.test(message)) return 'HIGH';
    if (patterns.medium.test(message) || wordCount > 20) return 'MEDIUM';
    return 'SIMPLE';
  }

  private extractCore(messageLower: string, originalMessage: string): string {
    const stopWords = OrchestratorConfig.getStopWords();
    
    const correctionPatterns = [
      /nahi[,.\s]+(.+?)(?:\s+hai|\s+he|\s+h)?$/i,
      /galat[,.\s]+(.+?)(?:\s+hai|\s+he|\s+h|\s+sahi)?$/i,
      /wrong[,.\s]+(.+?)(?:\s+is|\s+hai|\s+correct)?$/i,
      /not[,.\s]+(.+?)(?:\s+is|\s+it's|\s+its)?$/i,
    ];
    
    for (const pattern of correctionPatterns) {
      const match = messageLower.match(pattern);
      if (match && match[1]) {
        const correctedPart = match[1].trim();
        const words = correctedPart.split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
        if (words.length > 0) {
          return words.slice(0, 6).join(' ');
        }
      }
    }
    
    const lines = messageLower.split(/[\n\r]+/).filter(l => l.trim().length > 3);
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1].trim();
      const words = lastLine.split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
      if (words.length >= 2) {
        return words.slice(0, 6).join(' ');
      }
    }
    
    const words = messageLower.split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
    if (words.length > 0) return words.slice(0, 6).join(' ');
    return originalMessage.slice(0, 40);
  }

  private categoryToDomain(category: string | null): DomainType {
    if (!category) return 'general';
    const map = OrchestratorConfig.getCategoryDomainMap();
    return (map[category] as DomainType) || 'general';
  }

  private buildSearchQuery(
    originalMessage: string, core: string, category: string | null, domain: DomainType
  ): string {
    const suffixes = OrchestratorConfig.getDomainSuffixes();
    
    let cleanCore = core
      .replace(/\b(nahi|galat|wrong|not|hai|he|h|kya|ka|ki|ke|ye|yeh|wo|woh|toh|bhi|name|naam)\b/gi, '')
      .replace(/[,.\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanCore.length < 5) {
      const entityMatch = originalMessage.match(
        /(?:movie|film|show|series|song|restaurant|place|rating|review)\s+(?:ka|ki|ke|of|for)?\s*[""']?([^""'\n,?]+)/i
      );
      if (entityMatch && entityMatch[1]) {
        cleanCore = entityMatch[1].trim();
      } else {
        cleanCore = core;
      }
    }
    
    if (domain === 'entertainment' || category === 'entertainment') {
      const moviePatterns = [
        /^(.+?)\s+(?:movie|film)\s+(?:ki|ka|ke)\s+/i,
        /(.+?)\s+(?:ki|ka|ke)\s+(?:rating|review|imdb|release|cast|box\s*office)/i,
        /^([a-zA-Z\s]+)\s+(?:movie|film|rating|review|imdb)/i,
        /[""']([^""']+)[""']\s*(?:movie|film|ki\s+rating)/i,
        /(?:movie|film)\s+(?:ka\s+naam|name|called)\s*[:\-]?\s*[""']?([^""'\n,?]+)/i,
      ];
      
      const NOT_ENTITY_NAMES = /^(imdb|rating|review|release|cast|trailer|box\s*office|score|movie|film|songs?|budget|collection|earning|download|watch|online|streaming|subtitles?|dubbed|hindi|english|tamil|telugu|kannada|malayalam|marathi|bengali|punjabi|bollywood|hollywood|south|free|best|worst|top|new|old|latest|upcoming)$/i;

      for (const pattern of moviePatterns) {
        const match = originalMessage.match(pattern);
        if (match && match[1] && match[1].trim().length > 3) {
          const candidate = match[1].trim()
            .replace(/\b(ki|ka|ke|hai|he|h|kya|ye|movie|film)\b/gi, '')
            .trim();
          if (candidate.length > 3 && !NOT_ENTITY_NAMES.test(candidate)) {
            cleanCore = candidate;
            break;
          }
        }
      }
    }
    
    let query = cleanCore;
    const suffix = suffixes[domain] || suffixes['general'] || '';
    
    const hasRelevantTerms = /rating|review|imdb|release|cast|score/i.test(query);
    if (!hasRelevantTerms && suffix) {
      query += ' ' + suffix;
    }
    
    return query.trim().slice(0, 100);
  }

  private determineRouting(complexity: ComplexityLevel, planType: PlanType, searchNeeded: boolean = false): 'MISTRAL' | 'SMART_ROUTING' {
    if (searchNeeded) return 'SMART_ROUTING';
    
    if (planType === PlanType.STARTER || planType === PlanType.LITE) return 'MISTRAL';
    if (complexity === 'SIMPLE') return 'MISTRAL';
    return 'SMART_ROUTING';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const intelligenceOrchestrator = IntelligenceOrchestrator.getInstance();
export { IntelligenceOrchestrator, OrchestratorConfig };