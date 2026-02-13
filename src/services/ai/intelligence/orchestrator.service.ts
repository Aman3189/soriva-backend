/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE ORCHESTRATOR v4.9 - PRODUCTION-READY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * PHILOSOPHY: Fast + Smart + Companion Feel + 100% Configurable
 * - ALL keywords, patterns, settings from config file
 * - Zero hardcoded values in this service
 * - Runtime updatable without code changes
 * - Smart caching for performance
 * 
 * v4.9 CHANGES (February 13, 2026) - USERID FIX:
 * - FIX: userId now properly passed to SearchIntentRouter
 * - FIX: LLM service adapter accepts userId in options
 * - FIX: detectSearchNeed now receives userId parameter
 * - FIX: All internal calls propagate userId correctly
 * 
 * v4.8 CHANGES (February 2026) - LLM-POWERED SERVICES:
 * - NEW: SearchIntentRouter integration (replaces inline Layer 3)
 * - IMPROVED: ToneMatcher properly integrated with LLM service
 * - CLEANER: Separated concerns - each service handles its domain
 * - FASTER: Better caching strategy across services
 * 
 * v4.7 FIXES (February 2026) - 22-POINT PRODUCTION FIXES:
 * - FIX #3: Language detection cached (avoid duplicate calls)
 * - FIX #4: lastSearchQueryCache TTL increased 30min → 2hrs
 * - FIX #4: History scan limited to last 15 messages
 * - FIX #9: Tone cache eviction (10min TTL, max 500)
 * - FIX #10: Last search cache eviction (2hr TTL, max 500)
 * - FIX #13: Added missing Hinglish keywords
 * - FIX #14, #17, #25: Improved category-domain mapping
 * - FIX #18: searchNeeded=true → always SMART_ROUTING
 * - FIX #19: Re-check requires previous search context
 * - FIX #23: Layer 3 timeout errors silenced (warn only)
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../../constants';
import { aiService } from '../ai.service';
import { OrchestratorConfig } from './orchestrator.config';
import { 
  getDomain, 
  getIntent,
  buildEnhancedDelta,
  type DomainType,
  type IntelligenceSync,
  type DeltaOutput,
} from '../../../core/ai/soriva-delta-engine';
import { ToneMatcherService } from './tone-matcher.service';
import { SearchIntentRouter, initSearchRouter, type SearchIntentResult } from './search-intent-router.service';
import type { ToneAnalysis, LLMService } from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ComplexityLevel = 'SIMPLE' | 'MEDIUM' | 'HIGH';

// v4.5: Conversation message type for history
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
  conversationHistory?: ConversationMessage[];  // v4.5: Added for re-check intent
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
  isRecheckIntent?: boolean;  // v4.5: Flag to indicate re-check triggered
  originalSearchQuery?: string;  // v4.5: The query being re-checked
  // v4.8: Additional search intent details
  searchIntentResult?: SearchIntentResult;
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
// v4.5: RE-CHECK INTENT KEYWORDS
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

// v4.5: Keywords that indicate search-related previous context
const SEARCH_CONTEXT_KEYWORDS = [
  'movie', 'film', 'showtime', 'theatre', 'theater', 'cinema',
  'news', 'khabar', 'weather', 'mausam', 'price', 'rate', 'bhav',
  'score', 'match', 'result', 'rating', 'review',
  'restaurant', 'hotel', 'flight', 'train',
  'stock', 'share', 'crypto', 'bitcoin',
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// v4.8: SERVICE CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SERVICE_CONFIG = {
  // SearchIntentRouter settings
  searchRouter: {
    enabled: true,                    // Master switch
    fallbackToKeywords: true,         // Use keyword detection if router fails
  },
  
  // ToneMatcher settings
  toneMatcher: {
    enabled: true,                    // Master switch
    cacheEnabled: true,               // Enable response caching
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORCHESTRATOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class IntelligenceOrchestrator {
  private static instance: IntelligenceOrchestrator;
  private toneCache: Map<string, CachedToneData> = new Map();
  private toneMatcher: ToneMatcherService | null = null;
  private searchRouter: SearchIntentRouter | null = null;
  private llmService: LLMService | null = null;
  
  // v4.5: Store last search query per user for re-check
  private lastSearchQueryCache: Map<string, { query: string; domain: DomainType; timestamp: number }> = new Map();

  private constructor() {
    const stats = OrchestratorConfig.getStats();
    console.log('[Orchestrator] 🚀 v4.9 USERID FIX Edition initialized');
    console.log('[Orchestrator] 📊 Config loaded:', {
      searchCategories: stats.searchCategories,
      totalKeywords: stats.totalSearchKeywords,
      greetings: stats.greetingsCount,
      searchRouterEnabled: SERVICE_CONFIG.searchRouter.enabled,
      toneMatcherEnabled: SERVICE_CONFIG.toneMatcher.enabled,
    });
    
    // Initialize LLM service adapter
    this.initializeLLMService();
  }

  static getInstance(): IntelligenceOrchestrator {
    if (!IntelligenceOrchestrator.instance) {
      IntelligenceOrchestrator.instance = new IntelligenceOrchestrator();
    }
    return IntelligenceOrchestrator.instance;
  }

  /**
   * v4.9 FIX: Initialize the LLM service adapter with userId support
   * Now accepts userId in options and passes it to aiService
   */
  private initializeLLMService(): void {
    this.llmService = {
      generateCompletion: async (
        prompt: string, 
        options?: { 
          maxTokens?: number; 
          temperature?: number;
          userId?: string;  // v4.9: Added userId support
          model?: string;   // v4.9: Added model support for cheaper routing
        }
      ) => {
        const response = await aiService.chat({
          message: prompt,
          userId: options?.userId || 'system-orchestrator-fallback', // v4.9: Use provided userId
          planType: 'STARTER',
          maxTokens: options?.maxTokens || 200,
          temperature: options?.temperature || 0.3,
          // v4.9: Could add model routing here if needed
          // model: options?.model,
        });
        return response.message;
      }
    };
    console.log('[Orchestrator] ✅ LLM Service adapter initialized (v4.9 with userId support)');
  }

  /**
   * v4.8: Get or initialize ToneMatcher service
   */
  private getToneMatcher(): ToneMatcherService | null {
    if (!SERVICE_CONFIG.toneMatcher.enabled) return null;
    
    if (!this.toneMatcher && this.llmService) {
      try {
        this.toneMatcher = new ToneMatcherService(this.llmService);
        console.log('[Orchestrator] ✅ ToneMatcher service initialized');
      } catch (error) {
        console.warn('[Orchestrator] ⚠️ ToneMatcher initialization failed:', error);
        return null;
      }
    }
    return this.toneMatcher;
  }

  /**
   * v4.8: Get or initialize SearchIntentRouter service
   */
  private getSearchRouter(): SearchIntentRouter | null {
    if (!SERVICE_CONFIG.searchRouter.enabled) return null;
    
    if (!this.searchRouter && this.llmService) {
      try {
        this.searchRouter = initSearchRouter(this.llmService);
        console.log('[Orchestrator] ✅ SearchIntentRouter service initialized');
      } catch (error) {
        console.warn('[Orchestrator] ⚠️ SearchIntentRouter initialization failed:', error);
        return null;
      }
    }
    return this.searchRouter;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v4.5: RE-CHECK INTENT DETECTION (Layer 3)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Detects if user wants to re-check/retry previous search
   * "dobara check karo", "phir se dekho", "again"
   */
  private hasRecheckIntent(messageLower: string): boolean {
    return RECHECK_KEYWORDS.some(kw => messageLower.includes(kw));
  }

  /**
   * Find the last search-worthy query from conversation history
   * Looks for user messages that contained search keywords
   */
  private findLastSearchQuery(
    history: ConversationMessage[] | undefined,
    userId: string
  ): { query: string; domain: DomainType } | null {
    
    // First check cache (most recent search for this user)
    const cached = this.lastSearchQueryCache.get(userId);
    // v4.7 FIX #4: Increased TTL from 30min to 2hrs for better re-check support
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 60 * 1000) { // 2 hours TTL
      console.log(`[Orchestrator] 🔄 Re-check: Using cached last search: "${cached.query.slice(0, 40)}..."`);
      return { query: cached.query, domain: cached.domain };
    }

    // If no cache, search through history (check last 15 messages - FIX #4)
    if (!history || history.length === 0) {
      return null;
    }

    // Go through history in reverse (most recent first), max 15 messages
    const maxMessages = Math.min(history.length, 15);
    for (let i = history.length - 1; i >= history.length - maxMessages; i--) {
      const msg = history[i];
      if (msg.role !== 'user') continue;
      
      const content = msg.content.toLowerCase();
      
      // Skip if this is also a re-check message
      if (this.hasRecheckIntent(content)) continue;
      
      // Check if this message had search context
      const hasSearchContext = SEARCH_CONTEXT_KEYWORDS.some(kw => content.includes(kw));
      
      if (hasSearchContext) {
        // Detect domain from the message
        const domain = getDomain(msg.content);
        console.log(`[Orchestrator] 🔄 Re-check: Found previous search query: "${msg.content.slice(0, 40)}..."`);
        return { query: msg.content, domain };
      }
    }

    return null;
  }

  /**
   * Store last search query for a user (called when search is triggered)
   */
  storeLastSearchQuery(userId: string, query: string, domain: DomainType): void {
    this.lastSearchQueryCache.set(userId, {
      query,
      domain,
      timestamp: Date.now()
    });
    
    // Cleanup old entries (keep max 1000)
    if (this.lastSearchQueryCache.size > 1000) {
      const oldest = this.lastSearchQueryCache.keys().next().value;
      if (oldest) this.lastSearchQueryCache.delete(oldest);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN METHOD: processWithPreprocessor
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async processWithPreprocessor(request: PreprocessorRequest): Promise<ProcessWithPreprocessorResult> {
    const startTime = Date.now();
    const { userId, message, planType, userName, userLocation, userLanguage, conversationHistory } = request;
    const messageLower = message.toLowerCase().trim();
    const settings = OrchestratorConfig.getSettings();

    // v4.7 FIX #3: Cache language detection result (avoid duplicate calls)
    const detectedLanguage = userLanguage || this.detectLanguageQuick(messageLower);
    const isHinglish = detectedLanguage === 'hinglish';

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Orchestrator] 🔱 v4.9 USERID FIX Processing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Message: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`);
    console.log(`📋 Plan: ${planType} | User: ${userName || userId.slice(0, 8)}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 0.5 (NEW v4.5): RE-CHECK INTENT DETECTION
    // "dobara check karo", "phir se dekho", "again"
    // v4.7 FIX #19: Require domain context for re-check
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (this.hasRecheckIntent(messageLower)) {
      const lastSearch = this.findLastSearchQuery(conversationHistory, userId);
      
      // FIX #19: Only trigger re-check if we have previous search context
      if (lastSearch) {
        const processingTime = Date.now() - startTime;
        console.log(`[Orchestrator] 🔄 RE-CHECK INTENT DETECTED!`);
        console.log(`[Orchestrator] 📝 Original query: "${lastSearch.query.slice(0, 50)}..."`);
        console.log(`[Orchestrator] 🎯 Domain: ${lastSearch.domain}`);
        console.log(`[Orchestrator] ✅ Force search: true (re-check)`);
        
        return {
          complexity: 'MEDIUM',
          core: lastSearch.query.slice(0, 50),
          searchNeeded: true,
          searchQuery: lastSearch.query,
          intent: 'QUICK',
          domain: lastSearch.domain,
          routedTo: 'SMART_ROUTING',  // FIX #18: Search queries always get SMART_ROUTING
          processingTimeMs: processingTime,
          isRecheckIntent: true,
          originalSearchQuery: lastSearch.query,
          enhancedResult: {
            analysis: {
              emotion: 'neutral',
              tone: { 
                language: detectedLanguage,  // FIX #3: Use cached value
                formality: 'casual',
                shouldUseHinglish: isHinglish,  // FIX #3: Use cached value
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
        console.log(`[Orchestrator] ⚠️ Re-check intent but no previous search found - continuing normal flow`);
        // Continue with normal processing
      }
    }

    // STEP 1: Check for simple greeting
    if (this.isSimpleGreeting(messageLower)) {
      const processingTime = Date.now() - startTime;
      console.log(`✅ Simple greeting detected - SKIP all processing`);
      console.log(`⏱️  Processing time: ${processingTime}ms`);
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
            tone: { language: this.detectLanguageQuick(messageLower) },
          },
          metadata: { processingTimeMs: processingTime, cacheHit: false },
        },
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1.5: MOVIE SEQUEL DETECTION (Generic pattern — NO hardcoded list)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Pattern 1: Detects "<word(s)> <number>" or "<word(s)> part <number>"
    const genericSequelPattern = /\b([\w][\w\s]{0,30}?)\s+(2|3|4|5|6|7|8|9|10|two|three|four|five|part\s*\d+|chapter\s*\d+)\b/i;
    
    // Pattern 2: Movie context keywords — must appear alongside sequel pattern
    const movieContextPattern = /\b(movie|film|rating|imdb|review|release|cast|dekhni|dekhi|dekhna|dekhu|dekhenge|showtimes?|trailer|box\s*office|kaisi\s*hai|kab\s*aa\s*rahi|kab\s*release|lagi|lagti|laga|chal|chalti|chala|running|playing|cinema|theatre|theater|ticket)\b/i;
    
    const sequelMatch = messageLower.match(genericSequelPattern);
    const hasMovieContext = movieContextPattern.test(messageLower);
    
    // Only trigger if BOTH sequel pattern AND movie context exist
    if (sequelMatch && hasMovieContext) {
      const movieName = sequelMatch[0].trim();
      
      console.log(`[Orchestrator] 🎬 MOVIE SEQUEL DETECTED: "${movieName}"`);
      console.log(`[Orchestrator] ✅ Force search: true`);
      
      // v4.5: Store this as last search query
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
              language: this.detectLanguageQuick(messageLower),
              formality: 'casual',
              shouldUseHinglish: this.detectLanguageQuick(messageLower) === 'hinglish',
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
    // STEP 2: Detect search need (v4.9: Pass userId to SearchIntentRouter)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const searchAnalysis = await this.detectSearchNeed(messageLower, message, userId); // v4.9: Added userId
    console.log(`🔍 Search Analysis:`, {
      needed: searchAnalysis.needed,
      category: searchAnalysis.category,
      matchedKeywords: searchAnalysis.matchedKeywords.slice(0, 3),
      routerUsed: searchAnalysis.routerUsed,
    });

    // STEP 3: Domain & Intent Detection
    const domain = settings.enableDomainDetection 
      ? getDomain(message) 
      : this.categoryToDomain(searchAnalysis.category);
    const intent = getIntent(message, planType as any);
    console.log(`🎯 Domain: ${domain} | Intent: ${intent}`);

    // v4.5: Store search query if search is needed
    if (searchAnalysis.needed) {
      this.storeLastSearchQuery(userId, message, domain);
    }

    // STEP 4: Complexity & Core Extraction
    const complexity = this.estimateComplexity(messageLower);
    const core = this.extractCore(messageLower, message);
    console.log(`🧠 Complexity: ${complexity} | Core: "${core.slice(0, 30)}..."`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 5: Tone Analysis (v4.8: Using ToneMatcher service)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const toneResult = await this.getToneAnalysisCached(userId, message, messageLower);
    console.log(`🎵 Tone:`, {
      language: toneResult.analysis?.language || 'unknown',
      formality: toneResult.analysis?.formality || 'unknown',
      cacheHit: toneResult.cacheHit,
      timeMs: toneResult.timeMs,
      serviceUsed: toneResult.serviceUsed,
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
            language: userLanguage || (['english', 'hindi', 'hinglish'].includes(toneResult.analysis?.language || '') ? toneResult.analysis?.language as 'english' | 'hindi' | 'hinglish' : 'english'),
          },
          searchContext: { hasResults: false, domain },
        },
        intelligenceSync
      );
      systemPrompt = deltaOutput.systemPrompt;
      console.log(`📄 Delta pre-built: ${systemPrompt.length} chars`);
    }

    // STEP 8: Determine Routing (v4.7 FIX #18: Pass searchNeeded)
    const routedTo = this.determineRouting(complexity, planType, searchAnalysis.needed);
    const processingTime = Date.now() - startTime;

    // STEP 9: Build Search Query
    let searchQuery: string | undefined;
    if (searchAnalysis.needed) {
      // v4.8: Prefer SearchIntentRouter's suggested query if available
      if (searchAnalysis.routerResult?.suggestedQuery) {
        searchQuery = searchAnalysis.routerResult.suggestedQuery;
        console.log(`[Orchestrator] 🎯 Using SearchIntentRouter suggested query: "${searchQuery}"`);
      } else {
        searchQuery = this.buildSearchQuery(message, core, searchAnalysis.category, domain);
      }
    }

    console.log(`🎯 Final Decision:`, {
      domain, intent, complexity,
      searchNeeded: searchAnalysis.needed,
      searchQuery: searchQuery ? searchQuery.slice(0, 50) + '...' : 'N/A',
      routedTo, processingTimeMs: processingTime,
      toneCacheHit: toneResult.cacheHit,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      complexity, core,
      searchNeeded: searchAnalysis.needed,
      searchQuery,
      intent, domain, routedTo, processingTimeMs: processingTime,
       
      intelligenceSync, deltaOutput, systemPrompt,
      searchIntentResult: searchAnalysis.routerResult,
      enhancedResult: {
        analysis: {
          emotion: 'neutral',
          tone: {
            language: toneResult.analysis?.language || this.detectLanguageQuick(messageLower),
            formality: toneResult.analysis?.formality,
            shouldUseHinglish: toneResult.analysis?.suggestedStyle?.useHinglish,
          },
          context: {
            userIntent: searchAnalysis.routerResult?.intent || intent,
            complexity: complexity,
            questionType: searchAnalysis.category || domain,
          },
        },
        metadata: { processingTimeMs: processingTime, cacheHit: toneResult.cacheHit },
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v4.8: TONE ANALYSIS WITH TONEMATCHER SERVICE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async getToneAnalysisCached(
    userId: string, message: string, messageLower: string
  ): Promise<{ analysis: ToneAnalysis | null; cacheHit: boolean; timeMs: number; serviceUsed: string }> {
    const settings = OrchestratorConfig.getSettings();
    const startTime = Date.now();

    // Check cache first
    const cached = this.toneCache.get(userId);
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      const cacheValid = cacheAge < (settings.toneCacheTTLMs || 300000) &&
                          cached.messageCount < (settings.toneCacheMaxMessages || 10);

      
      if (cacheValid) {
        cached.messageCount++;
        return { analysis: cached.analysis, cacheHit: true, timeMs: 0, serviceUsed: 'cache' };
      }
    }

    // v4.8: Try ToneMatcher service first
    const toneMatcher = this.getToneMatcher();
    if (toneMatcher) {
      try {
        const analysis = await toneMatcher.analyzeTone(message, userId);
        
        // Cache the result
        this.toneCache.set(userId, {
          analysis,
          timestamp: Date.now(),
          messageCount: 1,
        });
        
        // v4.7 FIX #9: Enforce cache limits
        this.cleanupToneCache();
        
        return { 
          analysis, 
          cacheHit: false, 
          timeMs: Date.now() - startTime,
          serviceUsed: 'ToneMatcher'
        };
      } catch (error) {
        console.warn('[Orchestrator] ⚠️ ToneMatcher analysis failed, using fallback:', error);
      }
    }

    // Fallback: Quick rule-based detection
    const quickAnalysis: ToneAnalysis = {
      language: this.detectLanguageQuick(messageLower),
      formality: 'casual',
      hindiWordsPercent: 0,
      englishWordsPercent: 100,
      hinglishPhrases: [],
      shouldMatchTone: true,
      suggestedStyle: {
        useHinglish: this.detectLanguageQuick(messageLower) === 'hinglish',
        formalityLevel: 'casual',
        examplePhrases: ['Sure!', 'Let me help.'],
      },
    };
        
    return { 
      analysis: quickAnalysis, 
      cacheHit: false, 
      timeMs: Date.now() - startTime,
      serviceUsed: 'fallback'
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUICK ENHANCE (Backward compatibility)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async quickEnhance(request: QuickEnhanceRequest): Promise<QuickEnhanceResult> {
    const { message } = request;
    const messageLower = message.toLowerCase();
    const language = this.detectLanguageQuick(messageLower);

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
  
  // v4.7 FIX #9: Tone cache cleanup
  private cleanupToneCache(): void {
    const now = Date.now();
    const TONE_TTL = 10 * 60 * 1000; // 10 min
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

  // v4.7 FIX #10: Search cache cleanup
  private cleanupSearchCache(): void {
    const now = Date.now();
    const SEARCH_TTL = 2 * 60 * 60 * 1000; // 2 hrs
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

  // v4.7: Periodic cache cleanup
  private cleanupExpiredCaches(): void {
    this.cleanupToneCache();
    this.cleanupSearchCache();
  }

  clearToneCache(userId: string): void {
    this.toneCache.delete(userId);
    // v4.8: Also clear from ToneMatcher if available
    const toneMatcher = this.getToneMatcher();
    if (toneMatcher) {
      toneMatcher.clearCache(userId);
    }
    console.log(`[Orchestrator] 🧹 Tone cache cleared for: ${userId.slice(0, 8)}`);
  }

  clearAllCaches(): void {
    this.toneCache.clear();
    this.lastSearchQueryCache.clear();
    
    // v4.8: Clear service caches too
    const toneMatcher = this.getToneMatcher();
    if (toneMatcher) {
      toneMatcher.clearCache();
    }
    const searchRouter = this.getSearchRouter();
    if (searchRouter) {
      searchRouter.clearCache();
    }
    
    console.log(`[Orchestrator] 🧹 All caches cleared`);
  }

  getCacheStats(): { 
    toneCache: number; 
    lastSearchCache: number;
    toneMatcherCache?: { analysisCache: number; userCache: number };
    searchRouterCache?: { size: number };
  } {
    // v4.7: Run cleanup before returning stats
    this.cleanupExpiredCaches();
    
    const stats: any = { 
      toneCache: this.toneCache.size,
      lastSearchCache: this.lastSearchQueryCache.size,
    };
    
    // v4.8: Include service cache stats
    const toneMatcher = this.getToneMatcher();
    if (toneMatcher) {
      const tmStats = toneMatcher.getCacheStats();
      stats.toneMatcherCache = {
        analysisCache: tmStats.totalEntries,
        userCache: tmStats.userCount,
      };
    }
    
    const searchRouter = this.getSearchRouter();
    if (searchRouter) {
      stats.searchRouterCache = {
        size: searchRouter.getCacheStats().size,
      };
    }
    
    return stats;
  }

  getConfig() {
    return OrchestratorConfig;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS (All config-based)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private isSimpleGreeting(message: string): boolean {
    const greetings = OrchestratorConfig.getSimpleGreetings();
    const cleaned = message.replace(/[!?.,"']/g, '').trim();
    
    // Exact match only
    if (greetings.has(cleaned)) return true;
    
    // FIX v4.5: Word boundary check, NOT substring!
    if (cleaned.length < 15) {
      const words = cleaned.split(/\s+/);
      if (words.length <= 3 && greetings.has(words[0])) {
        return true;
      }
    }
    return false;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v4.9: SEARCH NEED DETECTION - FIXED userId PASSING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  private async detectSearchNeed(
    messageLower: string,
    original: string,
    userId: string  // v4.9 FIX: Added userId parameter!
  ): Promise<{ 
    needed: boolean; 
    category: string | null; 
    matchedKeywords: string[];
    routerUsed: boolean;
    routerResult?: SearchIntentResult;
  }> {
    
    // ── Try SearchIntentRouter first (v4.8: LLM-powered) ──
    const searchRouter = this.getSearchRouter();
    if (searchRouter) {
      try {
        // v4.9 FIX: Pass userId to analyzeIntent!
        const routerResult = await searchRouter.analyzeIntent(original, userId);
        
        // Map router search type to category
        const categoryMap: Record<string, string> = {
          'local': 'local',
          'web': 'info',
          'news': 'news',
          'shopping': 'shopping',
          'knowledge': 'knowledge',
          'none': '',
        };
        
        const category = categoryMap[routerResult.searchType] || null;
        
        console.log(`[Orchestrator] 🧠 SearchIntentRouter: needsSearch=${routerResult.needsSearch}, type=${routerResult.searchType}, confidence=${routerResult.confidence}%`);
        
        return {
          needed: routerResult.needsSearch,
          category: routerResult.needsSearch ? category : null,
          matchedKeywords: routerResult.needsSearch ? [`[router:${routerResult.intent}]`] : [],
          routerUsed: true,
          routerResult,
        };
      } catch (error) {
        console.warn('[Orchestrator] ⚠️ SearchIntentRouter failed, falling back to keywords:', error);
      }
    }

    // ── Fallback: Keyword-based detection ──
    if (SERVICE_CONFIG.searchRouter.fallbackToKeywords) {
      return this.detectSearchNeedViaKeywords(messageLower, original);
    }
    
    // No search if both methods fail/disabled
    return { 
      needed: false, 
      category: null, 
      matchedKeywords: [],
      routerUsed: false,
    };
  }

  /**
   * Fallback: Keyword-based search detection (from v4.7)
   */
  private detectSearchNeedViaKeywords(
    messageLower: string,
    original: string
  ): { 
    needed: boolean; 
    category: string | null; 
    matchedKeywords: string[];
    routerUsed: boolean;
  } {
    const searchKeywords = OrchestratorConfig.getSearchKeywords();
    const matchedKeywords: string[] = [];
    let category: string | null = null;

    for (const [cat, keywords] of Object.entries(searchKeywords)) {
      for (const keyword of keywords) {
        if (messageLower.includes(keyword)) {
          matchedKeywords.push(keyword);
          if (!category) category = cat;
        }
      }
    }

    if (matchedKeywords.length > 0) {
      console.log('[Orchestrator] 🔍 Keyword fallback: Match found');
      return {
        needed: true,
        category: category || 'info',
        matchedKeywords,
        routerUsed: false,
      };
    }

    // Layer 2: Unknown Entity Detector
    if (this.isLikelyUnknownEntity(original)) {
      console.log('[Orchestrator] 🔍 Keyword fallback: Unknown entity detected');
      return { 
        needed: true, 
        category: 'info', 
        matchedKeywords: ['[unknown-entity-fallback]'],
        routerUsed: false,
      };
    }

    return { needed: false, category: null, matchedKeywords: [], routerUsed: false };
  }

  /**
   * Layer 2: Unknown Entity Detector (Zero-cost, No LLM)
   */
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

  /**
   * v4.3: Handles corrections like "X nahi, Y hai"
   */
  private extractCore(messageLower: string, originalMessage: string): string {
    const stopWords = OrchestratorConfig.getStopWords();
    
    // Handle corrections: "X nahi, Y hai" → take Y part
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
          console.log(`[Orchestrator] 🔄 Correction detected, using: "${words.join(' ')}"`);
          return words.slice(0, 6).join(' ');
        }
      }
    }
    
    // Handle multi-line messages: take the last meaningful line
    const lines = messageLower.split(/[\n\r]+/).filter(l => l.trim().length > 3);
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1].trim();
      const words = lastLine.split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
      if (words.length >= 2) {
        console.log(`[Orchestrator] 📝 Multi-line: using last line`);
        return words.slice(0, 6).join(' ');
      }
    }
    
    // Default: extract key words
    const words = messageLower.split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
    if (words.length > 0) return words.slice(0, 6).join(' ');
    return originalMessage.slice(0, 40);
  }

  private detectLanguageQuick(message: string): 'hinglish' | 'english' {
    const hindiPatterns = OrchestratorConfig.getHindiPatterns();
    return hindiPatterns.test(message) ? 'hinglish' : 'english';
  }

  private categoryToDomain(category: string | null): DomainType {
    if (!category) return 'general';
    const map = OrchestratorConfig.getCategoryDomainMap();
    return (map[category] as DomainType) || 'general';
  }

  /**
   * v4.3: Better query cleaning and entity extraction
   */
  private buildSearchQuery(
    originalMessage: string, core: string, category: string | null, domain: DomainType
  ): string {
    const suffixes = OrchestratorConfig.getDomainSuffixes();
    
    // Clean the core - remove noise words
    let cleanCore = core
      .replace(/\b(nahi|galat|wrong|not|hai|he|h|kya|ka|ki|ke|ye|yeh|wo|woh|toh|bhi|name|naam)\b/gi, '')
      .replace(/[,.\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // If core is too short after cleaning, try original message
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
    
    // For entertainment, extract movie/show name specifically
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
            console.log(`[Orchestrator] 🎬 Extracted movie name: "${cleanCore}"`);
            break;
          }
          if (candidate.length > 3) {
            console.log(`[Orchestrator] ⏭️ Rejected generic keyword: "${candidate}" — trying next pattern`);
          }
        }
      }
    }
    
    // Build final query
    let query = cleanCore;
    const suffix = suffixes[domain] || suffixes['general'] || '';
    
    // Don't add suffix if core already contains relevant terms
    const hasRelevantTerms = /rating|review|imdb|release|cast|score/i.test(query);
    if (!hasRelevantTerms && suffix) {
      query += ' ' + suffix;
    }
    
    console.log(`[Orchestrator] 🔎 Search query built: "${query.trim().slice(0, 60)}..."`);
    
    return query.trim().slice(0, 100);
  }

  // v4.7 FIX #18: Search queries should always get SMART_ROUTING
  private determineRouting(complexity: ComplexityLevel, planType: PlanType, searchNeeded: boolean = false): 'MISTRAL' | 'SMART_ROUTING' {
    // FIX #18: If search is needed, always use SMART_ROUTING regardless of complexity
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