/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH INTENT ROUTER - FULLY LLM-POWERED WITH FALLBACK
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: February 2026
 * Updated: February 13, 2026
 * 
 * PHILOSOPHY:
 * - LLM understands user intent naturally
 * - LLM decides if search is needed
 * - Keyword fallback when LLM fails
 * - Fast, cached, intelligent routing
 * - Cost-optimized (uses smaller model)
 * 
 * FIXES APPLIED:
 * - ✅ userId now passed to LLM service
 * - ✅ Keyword fallback when LLM fails
 * - ✅ Uses cheaper model for classification
 * - ✅ Better error handling
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { LLMService } from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * User intent categories
 */
export type UserIntent =
  | 'question'           // User asking for information
  | 'local_search'       // Food, restaurants, places, directions
  | 'product_search'     // Shopping, products, prices, reviews
  | 'factual_search'     // News, facts, definitions, how-to
  | 'entertainment'      // Movies, music, games, recommendations
  | 'compliment'         // Praising/appreciating
  | 'greeting'           // Hello, hi, namaste
  | 'farewell'           // Bye, alvida
  | 'gratitude'          // Thank you, shukriya
  | 'agreement'          // Haan, okay, theek hai
  | 'disagreement'       // Nahi, galat
  | 'frustration'        // User is annoyed
  | 'casual_chat'        // Random banter, small talk
  | 'command'            // Do something specific (non-search)
  | 'clarification'      // User explaining/clarifying
  | 'continuation'       // Continue previous topic
  | 'creative_request'   // Write poem, story, code etc.
  | 'unknown';

/**
 * Search types for routing
 */
export type SearchType =
  | 'local'              // Google Places, Maps, local businesses
  | 'web'                // General web search
  | 'news'               // Current events, news
  | 'shopping'           // Products, prices, e-commerce
  | 'knowledge'          // Wikipedia, definitions, facts
  | 'none';              // No search needed

/**
 * Complete search intent analysis result
 */
export interface SearchIntentResult {
  needsSearch: boolean;
  searchType: SearchType;
  intent: UserIntent;
  suggestedQuery: string | null;
  confidence: number;
  reasoning: string;
  source: 'llm' | 'keyword_fallback' | 'cache' | 'default';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ROUTER_CONFIG = {
  // Cache settings
  CACHE_TTL_MINUTES: 10,
  MAX_CACHE_SIZE: 1000,
  
  // LLM settings
  MIN_TEXT_LENGTH: 2,
  LLM_TIMEOUT_MS: 3000,
  
  // Use smaller/cheaper model for classification
  // Mistral Small: $0.10/$0.30 per 1M (5x cheaper than Large!)
  USE_SMALL_MODEL: true,
  ROUTER_MODEL: 'mistral-small-latest',
  
  // Confidence threshold
  HIGH_CONFIDENCE_THRESHOLD: 80,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KEYWORD FALLBACK LISTS (Used when LLM fails)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SEARCH_KEYWORDS = {
  // News & Current Events
  news: [
    'news', 'khabar', 'latest', 'recent', 'happened', 'incident', 
    'today', 'aaj', 'breaking', 'update', 'current', 'election',
    'politics', 'accident', 'crime', 'weather', 'forecast'
  ],
  
  // Local Search (Places, Restaurants, etc.)
  local: [
    'restaurant', 'cafe', 'hotel', 'hospital', 'near', 'nearby',
    'kahaan', 'kahan', 'where', 'milega', 'directions', 'route',
    'petrol', 'pump', 'atm', 'bank', 'mall', 'shop', 'store',
    'dhaba', 'khana', 'food', 'dinner', 'lunch', 'breakfast',
    'pizza', 'burger', 'chai', 'coffee', 'movie', 'theatre', 'cinema'
  ],
  
  // Shopping & Products
  shopping: [
    'price', 'buy', 'cost', 'amazon', 'flipkart', 'khareedna',
    'purchase', 'order', 'delivery', 'review', 'rating', 'compare',
    'discount', 'offer', 'sale', 'cheap', 'best deal'
  ],
  
  // Knowledge & Facts
  knowledge: [
    'what is', 'kya hai', 'meaning', 'matlab', 'definition',
    'how to', 'kaise', 'why', 'kyun', 'explain', 'history',
    'who is', 'kaun hai', 'when did', 'kab'
  ],
  
  // NO Search Keywords (Conversational)
  no_search: [
    'thank', 'thanks', 'shukriya', 'dhanyavaad', 'hello', 'hi',
    'namaste', 'bye', 'goodbye', 'alvida', 'okay', 'ok', 'theek',
    'haan', 'yes', 'no', 'nahi', 'hmm', 'achha', 'accha', 'great',
    'nice', 'good', 'awesome', 'amazing', 'wow', 'wah', 'kamaal',
    'write', 'likh', 'code', 'poem', 'story', 'explain', 'samjhao'
  ]
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LLM PROMPT (The Brain - Understands Everything!)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SEARCH_INTENT_PROMPT = `You are an expert intent classifier for an AI assistant. Your job is to understand what the user wants and decide if a web/local search is needed.

ANALYZE the user's message and determine:

1. INTENT - What does the user want?
   - "question" = Asking for information that might need search
   - "local_search" = Looking for places, restaurants, food, directions, nearby things
   - "product_search" = Shopping, products, prices, buying something
   - "factual_search" = News, facts, definitions, current events, how-to
   - "entertainment" = Movies, music, games, show recommendations
   - "compliment" = Praising or appreciating (e.g., "badi achi baat", "nice", "amazing")
   - "greeting" = Hello, hi, namaste, kaise ho
   - "farewell" = Bye, goodbye, alvida
   - "gratitude" = Thank you, shukriya, thanks
   - "agreement" = Yes, okay, haan, theek hai, got it
   - "disagreement" = No, nahi, wrong
   - "frustration" = User is annoyed or frustrated
   - "casual_chat" = Small talk, random chat, hmm, achha
   - "command" = Asking to do something (write, create, explain) that doesn't need search
   - "clarification" = User is explaining or clarifying something
   - "continuation" = Wants to continue previous topic
   - "creative_request" = Write poem, story, code, song, etc.
   - "unknown" = Can't determine

2. NEEDS_SEARCH - Does this require searching the internet?
   - true = User needs real-time info, local places, current prices, news, facts not in AI knowledge
   - false = Conversational response, AI knowledge is enough, or it's just social interaction

3. SEARCH_TYPE - If search is needed, what kind?
   - "local" = Restaurants, cafes, hotels, hospitals, places, directions, "near me" queries
   - "web" = General information search
   - "news" = Current events, breaking news
   - "shopping" = Products, prices, e-commerce
   - "knowledge" = Definitions, facts, Wikipedia-style info
   - "none" = No search needed

4. SUGGESTED_QUERY - If search is needed, what should we search for?
   - Extract the core search query from user's message
   - Translate Hinglish to English for better search results
   - Remove conversational filler words
   - Keep it concise and searchable

5. CONFIDENCE - How confident are you? (0-100)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL EXAMPLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOCAL SEARCH (needsSearch: true, searchType: "local"):
- "dinner kahaan milega" → local search for "dinner restaurants"
- "best pizza near me" → local search for "pizza restaurants nearby"
- "hospital nearby" → local search for "hospitals"

NEWS SEARCH (needsSearch: true, searchType: "news"):
- "latest news" → news search
- "kya hua aaj" → news search for "today's news"
- "tell me about recent incident" → news search

NO SEARCH NEEDED (needsSearch: false):
- "badi achi baat" → compliment
- "thank you" → gratitude
- "write a poem" → creative_request
- "explain recursion" → command (AI knowledge)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User Message: "{USER_MESSAGE}"

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "intent": "local_search|question|compliment|greeting|...",
  "needsSearch": true|false,
  "searchType": "local|web|news|shopping|knowledge|none",
  "suggestedQuery": "optimized search query" or null,
  "confidence": 95,
  "reasoning": "brief explanation"
}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEARCH INTENT ROUTER SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SearchIntentRouter {
  private llmService: LLMService;
  private intentCache: Map<string, { result: SearchIntentResult; timestamp: Date }> = new Map();

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    console.log('[SearchRouter] ✅ Initialized - LLM-Powered with Keyword Fallback');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ROUTING METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🎯 MAIN: Analyze message and decide if search is needed
   * @param message - User's message
   * @param userId - User ID for LLM service (REQUIRED!)
   */
  public async analyzeIntent(message: string, userId: string): Promise<SearchIntentResult> {
    console.log('[SearchRouter] 🔍 Analyzing search intent...');

    // Validate userId
    if (!userId || userId === 'system-orchestrator-service') {
      console.warn('[SearchRouter] ⚠️ Invalid userId, using keyword fallback');
      return this.keywordFallback(message);
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(message);
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      console.log('[SearchRouter] ⚡ Cache hit');
      return { ...cachedResult, source: 'cache' };
    }

    // Handle very short messages
    if (message.trim().length < ROUTER_CONFIG.MIN_TEXT_LENGTH) {
      return this.getDefaultResult('Message too short');
    }

    try {
      // LLM-powered intent analysis
      const result = await this.analyzeViaLLM(message, userId);
      
      // Cache the result
      this.cacheResult(cacheKey, result);
      
      console.log(
        `[SearchRouter] ✅ Intent: ${result.intent}, NeedsSearch: ${result.needsSearch}, Type: ${result.searchType}, Confidence: ${result.confidence}%`
      );

      return result;
    } catch (error) {
      console.error('[SearchRouter] ❌ LLM analysis failed:', error);
      
      // ✅ FALLBACK: Use keyword detection when LLM fails
      const fallbackResult = this.keywordFallback(message);
      console.log(`[SearchRouter] ⚠️ Using keyword fallback: needsSearch=${fallbackResult.needsSearch}`);
      
      // Cache fallback result too
      this.cacheResult(cacheKey, fallbackResult);
      
      return fallbackResult;
    }
  }

  /**
   * 🎯 CONVENIENCE: Quick check if search is needed
   */
  public async shouldSearch(message: string, userId: string): Promise<boolean> {
    const result = await this.analyzeIntent(message, userId);
    return result.needsSearch;
  }

  /**
   * 🎯 CONVENIENCE: Get search query if search is needed
   */
  public async getSearchQuery(message: string, userId: string): Promise<string | null> {
    const result = await this.analyzeIntent(message, userId);
    return result.needsSearch ? result.suggestedQuery : null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LLM-POWERED ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Analyze intent using LLM
   */
  private async analyzeViaLLM(message: string, userId: string): Promise<SearchIntentResult> {
    const prompt = SEARCH_INTENT_PROMPT.replace('{USER_MESSAGE}', message);

    const response = await this.llmService.generateCompletion(prompt, {
      maxTokens: 200,
      temperature: 0.1,
      userId: userId, // ✅ FIX: Pass userId!
      model: ROUTER_CONFIG.USE_SMALL_MODEL ? ROUTER_CONFIG.ROUTER_MODEL : undefined, // ✅ Use cheaper model
    });

    const result = this.parseLLMResponse(response);
    return { ...result, source: 'llm' };
  }

  /**
   * Parse LLM response into structured result
   */
  private parseLLMResponse(response: string): SearchIntentResult {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate intent
      const validIntents: UserIntent[] = [
        'question', 'local_search', 'product_search', 'factual_search', 'entertainment',
        'compliment', 'greeting', 'farewell', 'gratitude', 'agreement', 'disagreement',
        'frustration', 'casual_chat', 'command', 'clarification', 'continuation',
        'creative_request', 'unknown'
      ];

      // Validate search type
      const validSearchTypes: SearchType[] = ['local', 'web', 'news', 'shopping', 'knowledge', 'none'];

      const intent: UserIntent = validIntents.includes(parsed.intent) ? parsed.intent : 'unknown';
      const searchType: SearchType = validSearchTypes.includes(parsed.searchType) ? parsed.searchType : 'none';
      const needsSearch = typeof parsed.needsSearch === 'boolean' ? parsed.needsSearch : false;

      return {
        intent,
        needsSearch,
        searchType: needsSearch ? searchType : 'none',
        suggestedQuery: needsSearch && parsed.suggestedQuery ? String(parsed.suggestedQuery).trim() : null,
        confidence: typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, parsed.confidence)) : 70,
        reasoning: parsed.reasoning || 'No reasoning provided',
        source: 'llm',
      };
    } catch (error) {
      console.error('[SearchRouter] ❌ Failed to parse LLM response:', error);
      throw error; // Re-throw to trigger fallback
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KEYWORD FALLBACK (When LLM Fails)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🔧 Keyword-based fallback when LLM fails
   */
  private keywordFallback(message: string): SearchIntentResult {
    const lowerMessage = message.toLowerCase();
    
    // First check NO_SEARCH keywords (highest priority)
    const hasNoSearchKeyword = SEARCH_KEYWORDS.no_search.some(k => {
      // Check for word boundaries to avoid false positives
      const regex = new RegExp(`\\b${k}\\b`, 'i');
      return regex.test(lowerMessage);
    });
    
    // If starts with greeting/thanks, definitely no search
    const startsWithNoSearch = /^(hi|hello|hey|thanks|thank|ok|okay|yes|no|haan|nahi|bye|namaste)/i.test(lowerMessage.trim());
    
    if (startsWithNoSearch) {
      return {
        intent: 'greeting',
        needsSearch: false,
        searchType: 'none',
        suggestedQuery: null,
        confidence: 80,
        reasoning: 'Keyword fallback: greeting/acknowledgment detected',
        source: 'keyword_fallback',
      };
    }

    // Check NEWS keywords (high priority for "news", "incident", "happened")
    if (SEARCH_KEYWORDS.news.some(k => lowerMessage.includes(k))) {
      return {
        intent: 'factual_search',
        needsSearch: true,
        searchType: 'news',
        suggestedQuery: this.extractSearchQuery(message),
        confidence: 75,
        reasoning: 'Keyword fallback: news-related keywords detected',
        source: 'keyword_fallback',
      };
    }
    
    // Check LOCAL keywords
    if (SEARCH_KEYWORDS.local.some(k => lowerMessage.includes(k))) {
      return {
        intent: 'local_search',
        needsSearch: true,
        searchType: 'local',
        suggestedQuery: this.extractSearchQuery(message),
        confidence: 75,
        reasoning: 'Keyword fallback: local search keywords detected',
        source: 'keyword_fallback',
      };
    }
    
    // Check SHOPPING keywords
    if (SEARCH_KEYWORDS.shopping.some(k => lowerMessage.includes(k))) {
      return {
        intent: 'product_search',
        needsSearch: true,
        searchType: 'shopping',
        suggestedQuery: this.extractSearchQuery(message),
        confidence: 75,
        reasoning: 'Keyword fallback: shopping keywords detected',
        source: 'keyword_fallback',
      };
    }
    
    // Check KNOWLEDGE keywords
    if (SEARCH_KEYWORDS.knowledge.some(k => lowerMessage.includes(k))) {
      // Could be search or AI knowledge - use web search to be safe
      return {
        intent: 'question',
        needsSearch: true,
        searchType: 'knowledge',
        suggestedQuery: this.extractSearchQuery(message),
        confidence: 60,
        reasoning: 'Keyword fallback: knowledge query detected',
        source: 'keyword_fallback',
      };
    }
    
    // If has NO_SEARCH keywords and nothing else matched
    if (hasNoSearchKeyword) {
      return {
        intent: 'casual_chat',
        needsSearch: false,
        searchType: 'none',
        suggestedQuery: null,
        confidence: 65,
        reasoning: 'Keyword fallback: conversational keywords detected',
        source: 'keyword_fallback',
      };
    }
    
    // Default: no search (safer default)
    return this.getDefaultResult('Keyword fallback: no clear search intent');
  }

  /**
   * Extract clean search query from message
   */
  private extractSearchQuery(message: string): string {
    // Remove common filler words
    const fillerWords = [
      'please', 'can you', 'could you', 'tell me', 'show me', 'find me',
      'mujhe', 'batao', 'bata do', 'kya', 'hai', 'hain', 'the', 'a', 'an',
      'about', 'regarding', 'related to'
    ];
    
    let query = message;
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      query = query.replace(regex, '');
    });
    
    // Clean up extra spaces
    query = query.replace(/\s+/g, ' ').trim();
    
    // If query is too short after cleaning, return original
    return query.length > 3 ? query : message;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHING SYSTEM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate cache key from message
   */
  private generateCacheKey(message: string): string {
    return message.toLowerCase().trim().substring(0, 200);
  }

  /**
   * Get cached result
   */
  private getCachedResult(cacheKey: string): SearchIntentResult | null {
    const cached = this.intentCache.get(cacheKey);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp.getTime();
    const ttl = ROUTER_CONFIG.CACHE_TTL_MINUTES * 60 * 1000;

    if (age > ttl) {
      this.intentCache.delete(cacheKey);
      return null;
    }

    return cached.result;
  }

  /**
   * Cache result
   */
  private cacheResult(cacheKey: string, result: SearchIntentResult): void {
    // Enforce max cache size
    if (this.intentCache.size >= ROUTER_CONFIG.MAX_CACHE_SIZE) {
      const oldestKey = this.intentCache.keys().next().value;
      if (oldestKey) this.intentCache.delete(oldestKey);
    }

    this.intentCache.set(cacheKey, {
      result,
      timestamp: new Date(),
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get default result (fallback)
   */
  private getDefaultResult(reasoning: string): SearchIntentResult {
    return {
      intent: 'unknown',
      needsSearch: false,
      searchType: 'none',
      suggestedQuery: null,
      confidence: 50,
      reasoning,
      source: 'default',
    };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.intentCache.clear();
    console.log('[SearchRouter] 🧹 Cache cleared');
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.intentCache.size,
      keys: Array.from(this.intentCache.keys()).slice(0, 10),
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE FUNCTIONS (for backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Singleton instance
let routerInstance: SearchIntentRouter | null = null;

/**
 * Initialize the router with LLM service
 */
export function initSearchRouter(llmService: LLMService): SearchIntentRouter {
  routerInstance = new SearchIntentRouter(llmService);
  return routerInstance;
}

/**
 * Get the router instance
 */
export function getSearchRouter(): SearchIntentRouter | null {
  return routerInstance;
}

/**
 * Quick check if message needs search (uses singleton)
 * @param message - User's message
 * @param userId - User ID (REQUIRED!)
 */
export async function shouldTriggerSearch(message: string, userId: string): Promise<boolean> {
  if (!routerInstance) {
    console.warn('[SearchRouter] ⚠️ Router not initialized, using keyword fallback');
    // Create temporary instance for fallback
    const tempRouter = new SearchIntentRouter(null as any);
    return tempRouter['keywordFallback'](message).needsSearch;
  }
  return routerInstance.shouldSearch(message, userId);
}

/**
 * Detect user intent (uses singleton)
 * @param message - User's message
 * @param userId - User ID (REQUIRED!)
 */
export async function detectUserIntent(message: string, userId: string): Promise<UserIntent> {
  if (!routerInstance) {
    console.warn('[SearchRouter] ⚠️ Router not initialized, defaulting to unknown');
    return 'unknown';
  }
  const result = await routerInstance.analyzeIntent(message, userId);
  return result.intent;
}

export default SearchIntentRouter;