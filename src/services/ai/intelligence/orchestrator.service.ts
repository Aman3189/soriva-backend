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
// v5.0: NO SEARCH KEYWORDS (Conversational - skip search)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NO_SEARCH_KEYWORDS = new Set([
  // Greetings
  'thank', 'thanks', 'shukriya', 'dhanyavaad', 'hello', 'hi', 'hey',
  'namaste', 'bye', 'goodbye', 'alvida', 'okay', 'ok', 'theek',
  'haan', 'yes', 'no', 'nahi', 'hmm', 'achha', 'accha', 'great',
  'nice', 'good', 'awesome', 'amazing', 'wow', 'wah', 'kamaal',
  // Creative requests (AI handles, no search)
  'write', 'likh', 'poem', 'story', 'explain', 'samjhao',
  'code', 'program', 'script', 'function',
  // Acknowledgments
  'got it', 'understood', 'samajh gaya', 'samajh gayi', 'clear',
  // ✅ PERSONAL STATEMENTS - Never search for these!
  'favourite', 'favorite', 'mera', 'meri', 'mere', 'my',
  'naam', 'name', 'remember', 'yaad', 'pasand', 'like',
  'hoon', 'hun', 'hu', 'hai', 'i am', 'main',
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORCHESTRATOR CLASS v5.0
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

    console.log(`🎯 Final Decision:`, {
      domain, intent, complexity,
      searchNeeded: searchAnalysis.needed,
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
    original: string
  ): { needed: boolean; category: string | null; matchedKeywords: string[] } {
    
    // First check NO_SEARCH keywords
    const words = messageLower.split(/\s+/);
    const hasNoSearchKeyword = words.some(w => NO_SEARCH_KEYWORDS.has(w));
    
    // ✅ PERSONAL STATEMENT PATTERN - Never search for "my/mera + favourite/naam" etc.
    const personalStatementPattern = /\b(my|mera|meri|mere)\s+(favourite|favorite|naam|name|pasand|age|umar|job|kaam|hobby|hobbies)\b/i;
    const isPersonalStatement = personalStatementPattern.test(messageLower) || 
                                /\b(i am|i'm|main hoon|main hun|mera naam|my name is)\b/i.test(messageLower) ||
                                /\b(remember|yaad rakh|yaad rakho)\b/i.test(messageLower);
    
    if (isPersonalStatement) {
      console.log(`🔍 [SearchAnalysis] Personal statement detected - SKIP SEARCH`);
      return { needed: false, category: null, matchedKeywords: [] };
    }
    
    // If message is very short and has no-search keyword, skip
    if (words.length <= 3 && hasNoSearchKeyword) {
      return { needed: false, category: null, matchedKeywords: [] };
    }

    // Check search keywords from config (with fuzzy matching)
    const searchKeywords = OrchestratorConfig.getSearchKeywords();
    const matchedKeywords: string[] = [];
    let category: string | null = null;

    for (const [cat, keywords] of Object.entries(searchKeywords)) {
      for (const keyword of keywords) {
        // 1. Exact match (original behavior)
        if (messageLower.includes(keyword)) {
          matchedKeywords.push(keyword);
          if (!category) category = cat;
          continue;
        }
        
        // 2. Fuzzy match for multi-word phrases (e.g., "what is" matches "wha is")
        if (keyword.includes(' ') && this.isFuzzyPhraseMatch(messageLower, keyword)) {
          matchedKeywords.push(`~${keyword}`); // ~ indicates fuzzy match
          if (!category) category = cat;
          continue;
        }
        
        // 3. Fuzzy match for single words (e.g., "explain" matches "explan")
        if (!keyword.includes(' ')) {
          for (const word of words) {
            if (this.isFuzzyMatch(word, keyword)) {
              matchedKeywords.push(`~${keyword}`);
              if (!category) category = cat;
              break;
            }
          }
        }
      }
    }

    if (matchedKeywords.length > 0) {
      return {
        needed: true,
        category: category || 'info',
        matchedKeywords,
      };
    }

    // Unknown Entity Detector (Zero-cost)
    if (this.isLikelyUnknownEntity(original)) {
      return { 
        needed: true, 
        category: 'info', 
        matchedKeywords: ['[unknown-entity]'],
      };
    }

    // If no search keywords and has no-search indicators
    if (hasNoSearchKeyword) {
      return { needed: false, category: null, matchedKeywords: [] };
    }

    return { needed: false, category: null, matchedKeywords: [] };
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