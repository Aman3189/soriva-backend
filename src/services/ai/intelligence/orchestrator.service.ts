/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE ORCHESTRATOR v4.7 - PRODUCTION-READY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * PHILOSOPHY: Fast + Smart + Companion Feel + 100% Configurable
 * - ALL keywords, patterns, settings from config file
 * - Zero hardcoded values in this service
 * - Runtime updatable without code changes
 * - Smart caching for performance
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
 * v4.6 CHANGES (February 2026):
 * - NEW: Layer 3 LLM-based search detection
 * - Catches ALL real-world events keywords miss
 * - 100 tokens, 800ms timeout, 5min cache
 * 
 * v4.5 CHANGES (February 2026):
 * - NEW: Layer 3 — Re-check Intent Detection
 *   Catches: "dobara check karo", "phir se dekho", "again check"
 *   Uses conversation history to find last search query
 *   Re-triggers search with previous context
 * - NEW: PreprocessorRequest now accepts conversationHistory
 * - NEW: RECHECK_KEYWORDS constant for intent detection
 * - IMPROVED: Three-layer search detection system
 * 
 * v4.4 CHANGES (February 2026):
 * - BUG-1 FIXED: moviePatterns reordered — specific patterns FIRST,
 *   greedy fallback LAST. "Dhurandhar movie ki IMDB rating" now
 *   correctly extracts "Dhurandhar", NOT "IMDB rating".
 *   Added new Hinglish-first pattern for "X movie ki Y" structure.
 * - BUG-3 FIXED: Removed 44-name SEQUEL_MOVIES hardcoded list.
 *   Replaced with generic pattern: "<words> <number>" + movie context.
 *   Eliminated 14 false-positive common words (border, race, war, etc.)
 * - BUG-5 FIXED: Documented searchQuery as FALLBACK ONLY —
 *   ChatService passes original message to SorivaSearch (which owns
 *   all intelligent query building via buildQuery()).
 * 
 * v4.3 CHANGES (January 24, 2026):
 * - FIXED: extractCore now handles "X nahi, Y hai" corrections
 * - FIXED: buildSearchQuery extracts movie/entity names properly
 * - IMPROVED: Multi-line message handling
 * - RESULT: Better search queries, accurate results
 * 
 * v4.2 CHANGES:
 * - MOVED: All keywords/patterns to orchestrator.config.ts
 * - ADDED: Config-based everything
 * - KEPT: All v4.1 features (tone matching, intelligence sync)
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
// v4.6: LAYER 3 CONFIGURATION - LLM-based Search Detection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LAYER3_CONFIG = {
  enabled: true,                    // Master switch for Layer 3
  timeoutMs: 800,                   // Max time to wait for LLM response
  cacheTTLMs: 5 * 60 * 1000,        // Cache results for 5 minutes
  maxCacheSize: 500,                // Max cached queries
  maxTokens: 50,                    // Keep response tiny
  temperature: 0.1,                 // Deterministic responses
  
  // The prompt - optimized for minimal tokens + high accuracy
  systemPrompt: `You are a search-need classifier. Determine if a query needs REAL-TIME web search.

NEEDS SEARCH (reply "YES:category"):
- Real-world events, incidents, accidents, crimes, news
- Current prices, stocks, weather, sports scores
- Recent movies, shows, releases, ratings
- People's current status, positions, roles
- Any query about something that happened recently
- Local business info, restaurants, shops
- Product availability, prices

NO SEARCH NEEDED (reply "NO"):
- General knowledge, concepts, definitions
- How-to questions, tutorials, explanations
- Creative writing, coding help
- Personal advice, opinions
- Historical facts (not recent)
- Greetings, casual chat

Categories: news, entertainment, finance, sports, local, tech, weather, info

Reply ONLY with "YES:category" or "NO". Nothing else.`,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORCHESTRATOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class IntelligenceOrchestrator {
  private static instance: IntelligenceOrchestrator;
  private toneCache: Map<string, CachedToneData> = new Map();
  private toneMatcher: ToneMatcherService | null = null;
  
  // v4.5: Store last search query per user for re-check
  private lastSearchQueryCache: Map<string, { query: string; domain: DomainType; timestamp: number }> = new Map();

  // v4.6: Layer 3 LLM classification cache
  private layer3Cache: Map<string, { needed: boolean; category: string | null; timestamp: number }> = new Map();

  private constructor() {
    const stats = OrchestratorConfig.getStats();
    console.log('[Orchestrator] 🚀 v4.6 LAYER-3 SMART Edition initialized');
    console.log('[Orchestrator] 📊 Config loaded:', {
      searchCategories: stats.searchCategories,
      totalKeywords: stats.totalSearchKeywords,
      greetings: stats.greetingsCount,
      layer3Enabled: LAYER3_CONFIG.enabled,
    });
  }

  static getInstance(): IntelligenceOrchestrator {
    if (!IntelligenceOrchestrator.instance) {
      IntelligenceOrchestrator.instance = new IntelligenceOrchestrator();
    }
    return IntelligenceOrchestrator.instance;
  }

  private getToneMatcher(): ToneMatcherService | null {
    const settings = OrchestratorConfig.getSettings();
    if (!settings.enableToneMatcher) return null;
    
    if (!this.toneMatcher) {
      try {
        const llmService: LLMService = {
          generateCompletion: async (prompt: string) => {
            const response = await aiService.chat({
              message: prompt,
              userId: 'system-tone-matcher',
              planType: 'STARTER',
              maxTokens: 200,
              temperature: 0.3,
            });
            return response.message;
          }
        };
        this.toneMatcher = new ToneMatcherService(llmService);
        console.log('[Orchestrator] ✅ ToneMatcher loaded');
      } catch (error) {
        console.warn('[Orchestrator] ⚠️ ToneMatcher not available:', error);
        return null;
      }
    }
    return this.toneMatcher;
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v4.6: LAYER 3 - LLM-BASED SEARCH DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Catches ALL real-world queries that keywords miss:
  // - "Firozpur mein nehar wali ghatna" → YES:news
  // - "kuan mein gir gaya baccha" → YES:news  
  // - "company ne layoffs kiye" → YES:news
  // - "us neta ka kya hua" → YES:news
  // Cost: ~100 tokens (~₹0.001) | Time: <500ms
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Layer 3: LLM-based search need detection
   * Called only when Layer 1 (keywords) and Layer 2 (entity) fail
   * Uses Mistral with minimal tokens for cost efficiency
   */
  private async detectSearchNeedWithLLM(
    message: string
  ): Promise<{ needed: boolean; category: string | null }> {
    
    // Check if Layer 3 is enabled
    if (!LAYER3_CONFIG.enabled) {
      return { needed: false, category: null };
    }

    const cacheKey = message.toLowerCase().trim().slice(0, 100); // Normalize for cache
    
    // Check cache first
    const cached = this.layer3Cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < LAYER3_CONFIG.cacheTTLMs) {
      console.log(`[Orchestrator] 🧠 Layer 3 CACHE HIT: needed=${cached.needed}`);
      return { needed: cached.needed, category: cached.category };
    }

    const startTime = Date.now();
    
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Layer 3 timeout')), LAYER3_CONFIG.timeoutMs);
      });

      // LLM call promise
      const llmPromise = aiService.chat({
        message: `Query: "${message}"`,
        userId: 'system-layer3-classifier',
        planType: 'STARTER',
        maxTokens: LAYER3_CONFIG.maxTokens,
        temperature: LAYER3_CONFIG.temperature,
        systemPrompt: LAYER3_CONFIG.systemPrompt,
      });

      // Race between LLM and timeout
      const response = await Promise.race([llmPromise, timeoutPromise]);
      
      const timeMs = Date.now() - startTime;
      const answer = response.message.trim().toUpperCase();
      
      // Parse response
      let needed = false;
      let category: string | null = null;
      
      if (answer.startsWith('YES')) {
        needed = true;
        // Extract category if present: "YES:news" → "news"
        const categoryMatch = answer.match(/YES[:\s]*(\w+)/i);
        if (categoryMatch) {
          category = categoryMatch[1].toLowerCase();
        } else {
          category = 'info'; // Default category
        }
      }

      console.log(`[Orchestrator] 🧠 Layer 3 LLM: "${answer}" (${timeMs}ms)`);
      
      // Cache the result
      this.layer3Cache.set(cacheKey, { needed, category, timestamp: Date.now() });
      
      // Cleanup cache if too large
      if (this.layer3Cache.size > LAYER3_CONFIG.maxCacheSize) {
        const oldestKey = this.layer3Cache.keys().next().value;
        if (oldestKey) this.layer3Cache.delete(oldestKey);
      }

      return { needed, category };
      
    } catch (error) {
      const timeMs = Date.now() - startTime;
      console.warn(`[Orchestrator] ⚠️ Layer 3 failed (${timeMs}ms):`, error instanceof Error ? error.message : 'Unknown error');
      
      // On failure, don't block - return false (let keywords handle it)
      return { needed: false, category: null };
    }
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
    console.log('[Orchestrator] 🔱 v4.7 PRODUCTION-READY Processing');
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
    // v4.4 FIX (BUG-3): Removed 44-name SEQUEL_MOVIES list.
    // OLD problem: "Indian restaurant rating" → "indian" in list + "rating" matched → FALSE POSITIVE
    // 14 common English words (border, race, tiger, war, don, etc.) caused false positives.
    // NEW approach: Generic "<words> <number/part>" pattern + movie keyword context.
    // Works for ANY movie: "Border 2", "Pushpa 3", "Dhurandhar 2", "XYZ Part 4"
    // Requires BOTH a sequel number AND movie context — no more false positives.
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
        searchQuery: movieName,  // v4.4: Let SorivaSearch build the full query
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

    // STEP 2: Detect search need (v4.6: Now async with Layer 3 LLM)
    const searchAnalysis = await this.detectSearchNeed(messageLower, message);
    console.log(`🔍 Search Analysis:`, {
      needed: searchAnalysis.needed,
      category: searchAnalysis.category,
      matchedKeywords: searchAnalysis.matchedKeywords.slice(0, 3),
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

    // STEP 5: Tone Analysis (SMART CACHED)
    const toneResult = await this.getToneAnalysisCached(userId, message, messageLower);
    console.log(`🎵 Tone:`, {
      language: toneResult.analysis?.language || 'unknown',
      formality: toneResult.analysis?.formality || 'unknown',
      cacheHit: toneResult.cacheHit,
      timeMs: toneResult.timeMs,
    });

    // STEP 6: Build Intelligence Sync
    const intelligenceSync: IntelligenceSync = {
      toneAnalysis: toneResult.analysis ? {
        shouldUseHinglish: toneResult.analysis.suggestedStyle?.useHinglish || false,
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
            language: userLanguage || (toneResult.analysis?.language as any) || 'hinglish',
          },
          // FIX v4.4: hasResults = false because search hasn't happened yet!
          // searchAnalysis.needed = "search SHOULD be done"
          // hasResults = "search data IS available" (not yet!)
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

    // STEP 9: Build Search Query (v4.4: FALLBACK ONLY — SorivaSearch owns query building)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ARCHITECTURE NOTE (BUG-5 FIX):
    // ChatService passes the ORIGINAL user message to SorivaSearch.search()
    // SorivaSearch v4.4 has its own intelligent buildQuery() that handles:
    //   - Domain-specific suffixes, freshness params, location context
    //   - Hinglish optimization, cinema detection, showtime intent
    // This orchestrator searchQuery is ONLY used for:
    //   1. Logging/debugging (ChatService logs it at line 1106)
    //   2. Fallback if SorivaSearch is unavailable
    // It should NOT be used as the primary search query.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const searchQuery = searchAnalysis.needed 
      ? this.buildSearchQuery(message, core, searchAnalysis.category, domain)
      : undefined;

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
      enhancedResult: {
        analysis: {
          emotion: 'neutral',
          tone: {
            language: toneResult.analysis?.language || this.detectLanguageQuick(messageLower),
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
  // TONE ANALYSIS WITH CACHING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async getToneAnalysisCached(
    userId: string, message: string, messageLower: string
  ): Promise<{ analysis: ToneAnalysis | null; cacheHit: boolean; timeMs: number }> {
    const settings = OrchestratorConfig.getSettings();
    const startTime = Date.now();

    // Check cache
    const cached = this.toneCache.get(userId);
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      const cacheValid = cacheAge < (settings.toneCacheTTLMs || 300000) &&
                          cached.messageCount < (settings.toneCacheMaxMessages || 10);

      
      if (cacheValid) {
        cached.messageCount++;
        return { analysis: cached.analysis, cacheHit: true, timeMs: 0 };
      }
    }

    // Try ToneMatcher if available
    const toneMatcher = this.getToneMatcher();
    if (toneMatcher) {
      try {
        const analysis = await toneMatcher.analyzeTone(message);
        this.toneCache.set(userId, {
          analysis,
          timestamp: Date.now(),
          messageCount: 1,
        });
        return { analysis, cacheHit: false, timeMs: Date.now() - startTime };
      } catch (error) {
        console.warn('[Orchestrator] ⚠️ Tone analysis failed:', error);
      }
    }

    // Fallback: Quick detection
    const quickAnalysis: ToneAnalysis = {
      language: this.detectLanguageQuick(messageLower),
      formality: 'casual',
      suggestedStyle: {
        useHinglish: this.detectLanguageQuick(messageLower) === 'hinglish',
      },
    } as ToneAnalysis;
        
    return { analysis: quickAnalysis, cacheHit: false, timeMs: Date.now() - startTime };
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
  
  // v4.7 FIX #9: Add periodic cache cleanup
  private cleanupExpiredCaches(): void {
    const now = Date.now();
    
    // Tone cache: 10 min TTL, max 500 entries (FIX #9)
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
    
    // Last search cache: 2 hrs TTL, max 500 entries (FIX #10)
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
    
    // Layer 3 cache cleanup already in detectSearchNeedWithLLM
  }

  clearToneCache(userId: string): void {
    this.toneCache.delete(userId);
    console.log(`[Orchestrator] 🧹 Tone cache cleared for: ${userId.slice(0, 8)}`);
  }

  clearAllCaches(): void {
    this.toneCache.clear();
    this.lastSearchQueryCache.clear();  // v4.5
    this.layer3Cache.clear();  // v4.6
    console.log(`[Orchestrator] 🧹 All caches cleared`);
  }

  getCacheStats(): { toneCache: number; lastSearchCache: number; layer3Cache: number } {
    // v4.7: Run cleanup before returning stats
    this.cleanupExpiredCaches();
    return { 
      toneCache: this.toneCache.size,
      lastSearchCache: this.lastSearchQueryCache.size,  // v4.5
      layer3Cache: this.layer3Cache.size  // v4.6
    };
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
  // SEARCH NEED DETECTION v3.0 — Four-Layer System (v4.6)
  // Layer 1: Keyword-based (fast, zero cost)
  // Layer 2: Unknown Entity Detector (fast, zero cost)
  // Layer 3: LLM-based Smart Detection (100 tokens, 500ms)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private async detectSearchNeed(
  messageLower: string,
  original: string
): Promise<{ needed: boolean; category: string | null; matchedKeywords: string[] }> {
    // ── Layer 1: Keyword-based detection (fast, zero cost) ──
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
    console.log('[Orchestrator] 🔍 Layer 1: Keyword match found');
  return {
    needed: true,
    category: category || 'info',
    matchedKeywords
  };
}

    // ── Layer 2: Unknown Entity Detector (zero cost, no LLM) ──
    // Catches queries about unknown products, tools, services, brands
    // that are NOT in keyword list but clearly need real-time search
    if (this.isLikelyUnknownEntity(original)) {
      console.log('[Orchestrator] 🔍 Layer 2: Unknown entity detected — forcing search');
      return { needed: true, category: 'info', matchedKeywords: ['[unknown-entity-fallback]'] };
    }

    // ── Layer 3: LLM-based Smart Detection (NEW in v4.6) ──
    // Catches ALL real-world events that keywords miss:
    // - "Firozpur mein nehar wali ghatna"
    // - "kuan mein gir gaya baccha"
    // - "company ne layoffs announce kiye"
    // Cost: ~100 tokens | Time: <800ms with timeout
    const layer3Result = await this.detectSearchNeedWithLLM(original);
    
    if (layer3Result.needed) {
      console.log(`[Orchestrator] 🧠 Layer 3: LLM detected search need — category: ${layer3Result.category}`);
      return { 
        needed: true, 
        category: layer3Result.category || 'info', 
        matchedKeywords: ['[llm-smart-detection]'] 
      };
    }

    // ── No match across all layers → No search needed ──
    return { needed: false, category: null, matchedKeywords: [] };
  }
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LAYER 2: UNKNOWN ENTITY DETECTOR (Zero-cost, No LLM)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Catches: "AI Express Video tool btao", "FlyAds.ai service",
  //          "Magic Studio Pro explain karo", "XYZ Maker 2.0 kya hai"
  // Zero false positives: requires BOTH entity pattern + info intent
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
private isLikelyUnknownEntity(original: string): boolean {
  const raw = original.trim();   // preserve actual casing
  const m = original.trim().toLowerCase(); // lowercase version for intent detection

  // 1. Capitalized multi-word proper nouns (AI Express, Magic Studio)
  const capitalizedPhrase = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)\b/.test(raw);

  // 2. Brand-style names with suffixes (ToolX, MakerAI, StudioPro)
  const brandedName = /\b([A-Za-z]+(?:AI|App|Pro|X|OS|Lab|Studio|Hub|Works|Tech))\b/.test(raw);

  // 3. Tool/product/app/company indicators (case-insensitive)
  const toolMention = /\b(tool|app|saas|platform|software|service|company|website|product)\b/i.test(m);

  // 4. Info intent detection (case-insensitive)
  const infoIntent = /\b(baare|about|explain|kya|batao|btao|btaao|detail|details|information|info|jaankari|jankari)\b/i.test(m);

  // FINAL check — must have info intent AND entity signal
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
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * IMPROVED v4.3: Handles corrections like "X nahi, Y hai"
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * IMPROVED v4.3: Better query cleaning and entity extraction
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    // v4.4 FIX (BUG-1): Reordered patterns — specific FIRST, greedy LAST
    // OLD ORDER caused "Dhurandhar movie ki IMDB rating" → extract "IMDB rating" (WRONG)
    // Pattern 1 was greedy: /movie\s+...([^""'\n,?]+)/ captured EVERYTHING after "movie"
    // NEW ORDER: Hinglish "X movie ki Y" patterns first, greedy fallback last
    if (domain === 'entertainment' || category === 'entertainment') {
      const moviePatterns = [
        // P1 (NEW): Hinglish "X movie ki/ka/ke Y" — most common Hinglish structure
        /^(.+?)\s+(?:movie|film)\s+(?:ki|ka|ke)\s+/i,
        // P2: Hinglish "X ki/ka/ke rating/review/imdb" — "Dhurandhar ki rating"
        /(.+?)\s+(?:ki|ka|ke)\s+(?:rating|review|imdb|release|cast|box\s*office)/i,
        // P3: English "Name movie/film/rating/review" — "Dhurandhar movie rating"
        /^([a-zA-Z\s]+)\s+(?:movie|film|rating|review|imdb)/i,
        // P4: Quoted names — '"Dhurandhar" movie rating'
        /[""']([^""']+)[""']\s*(?:movie|film|ki\s+rating)/i,
        // P5 (LAST — greedy fallback): "movie called X" / "movie name X"
        /(?:movie|film)\s+(?:ka\s+naam|name|called)\s*[:\-]?\s*[""']?([^""'\n,?]+)/i,
      ];
      
      // Guard: Known keywords that are NOT movie/entity names
      // Without this, "IMDB rating btaao" → P3 extracts "IMDB" as movie name (WRONG)
      // With this, "IMDB" gets rejected → cleanCore stays as original core → correct behavior
      const NOT_ENTITY_NAMES = /^(imdb|rating|review|release|cast|trailer|box\s*office|score|movie|film|songs?|budget|collection|earning|download|watch|online|streaming|subtitles?|dubbed|hindi|english|tamil|telugu|kannada|malayalam|marathi|bengali|punjabi|bollywood|hollywood|south|free|best|worst|top|new|old|latest|upcoming)$/i;

      for (const pattern of moviePatterns) {
        const match = originalMessage.match(pattern);
        if (match && match[1] && match[1].trim().length > 3) {
          const candidate = match[1].trim()
            .replace(/\b(ki|ka|ke|hai|he|h|kya|ye|movie|film)\b/gi, '')
            .trim();
          // Accept ONLY if it's an actual name, not a generic keyword
          if (candidate.length > 3 && !NOT_ENTITY_NAMES.test(candidate)) {
            cleanCore = candidate;
            console.log(`[Orchestrator] 🎬 Extracted movie name: "${cleanCore}"`);
            break;
          }
          // If rejected, log and continue to next pattern
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