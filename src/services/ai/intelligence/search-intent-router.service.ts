/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH INTENT ROUTER - FULLY LLM-POWERED
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: February 2026
 * 
 * PHILOSOPHY:
 * - ZERO static keyword lists
 * - LLM understands user intent naturally
 * - LLM decides if search is needed
 * - LLM determines search type and query
 * - Fast, cached, intelligent routing
 * 
 * PROBLEM SOLVED:
 * - "dinner kahaan milega" → needs local search ✅
 * - "best restaurant near me" → needs local search ✅
 * - "badi achi baat" → NO search (compliment) ✅
 * - "thank you" → NO search (gratitude) ✅
 * 
 * ARCHITECTURE:
 * - Single LLM call for complete intent analysis
 * - Smart caching to avoid repeated calls
 * - Returns structured search decision
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
  // Should we search?
  needsSearch: boolean;
  
  // What type of search?
  searchType: SearchType;
  
  // User's intent category
  intent: UserIntent;
  
  // Optimized search query (if search needed)
  suggestedQuery: string | null;
  
  // Confidence in the decision (0-100)
  confidence: number;
  
  // Reasoning (for debugging)
  reasoning: string;
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
  
  // Confidence threshold
  HIGH_CONFIDENCE_THRESHOLD: 80,
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
CRITICAL EXAMPLES - STUDY THESE CAREFULLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOCAL SEARCH (needsSearch: true, searchType: "local"):
- "dinner kahaan milega" → local search for "dinner restaurants"
- "mere shehar mei acha restaurant" → local search for "good restaurants"
- "best pizza near me" → local search for "pizza restaurants nearby"
- "koi acchi cafe batao" → local search for "cafes"
- "hospital nearby" → local search for "hospitals"
- "petrol pump kahan hai" → local search for "petrol pump gas station"
- "ATM near me" → local search for "ATM"
- "movie theatre" → local search for "cinema movie theatre"
- "kya khayen aaj" → local search for "restaurants food"
- "date night ke liye jagah" → local search for "romantic restaurants date night"
- "chai peene kahan jayen" → local search for "tea cafe chai"

FACTUAL SEARCH (needsSearch: true, searchType: "web" or "knowledge"):
- "iPhone 16 price" → shopping search
- "who won IPL 2024" → web search for sports
- "weather today" → web search
- "news about elections" → news search
- "what is quantum computing" → knowledge search
- "how to make biryani" → knowledge search

NO SEARCH NEEDED (needsSearch: false):
- "badi achi baat" → compliment, just thank them
- "wah bhai kamaal" → compliment
- "thank you so much" → gratitude
- "shukriya" → gratitude
- "hello" / "namaste" → greeting
- "bye" / "alvida" → farewell
- "haan theek hai" → agreement
- "okay got it" → agreement
- "hmm achha" → casual_chat
- "nahi yaar" → disagreement
- "arey yaar" → frustration
- "write a poem about love" → creative_request (use AI knowledge)
- "explain recursion" → command (use AI knowledge)
- "continue" / "aur batao" → continuation
- "matlab ye ki..." → clarification
- "2+2 kitna hota hai" → command (use AI knowledge)
- "code likh do python mein" → creative_request

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HINGLISH UNDERSTANDING:
   - "kahaan" / "kahan" = where (often needs local search)
   - "kya khayen" = what to eat (needs local search)
   - "milega" = will get/find (often needs search)
   - "batao" = tell me (might need search depending on context)
   - "acha/accha" alone = just acknowledgment, no search
   - "badi achi baat" = compliment, NOT a search query!

2. FOOD/RESTAURANT DETECTION:
   - Any mention of food + location/where = LOCAL SEARCH
   - "dinner", "lunch", "breakfast", "khana", "khaana" + "kahaan/where/milega" = LOCAL SEARCH
   - "restaurant", "cafe", "hotel", "dhaba" = LOCAL SEARCH
   - "best X to eat" = LOCAL SEARCH
   - "kya khayen" = LOCAL SEARCH (what to eat = looking for food places)

3. COMPLIMENT vs QUERY:
   - "badi achi baat" = COMPLIMENT (praising what was said)
   - "achi jagah batao" = QUERY (asking for good places)
   - "wah kamaal" = COMPLIMENT
   - "kamaal ki jagah" = QUERY

4. CONVERSATIONAL INTENTS NEVER NEED SEARCH:
   - Greetings, farewells, thanks, agreements, casual expressions
   - Creative requests (poems, stories, code)
   - Math/logic questions
   - Explanations of concepts AI knows

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
    console.log('[SearchRouter] ✅ Initialized - Fully LLM-Powered (No Static Keywords)');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ROUTING METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🎯 MAIN: Analyze message and decide if search is needed
   */
  public async analyzeIntent(message: string): Promise<SearchIntentResult> {
    console.log('[SearchRouter] 🔍 Analyzing search intent...');

    // Check cache first
    const cacheKey = this.generateCacheKey(message);
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      console.log('[SearchRouter] ⚡ Cache hit');
      return cachedResult;
    }

    // Handle very short messages
    if (message.trim().length < ROUTER_CONFIG.MIN_TEXT_LENGTH) {
      return this.getDefaultResult('Message too short');
    }

    try {
      // LLM-powered intent analysis
      const result = await this.analyzeViaLLM(message);
      
      // Cache the result
      this.cacheResult(cacheKey, result);
      
      console.log(
        `[SearchRouter] ✅ Intent: ${result.intent}, NeedsSearch: ${result.needsSearch}, Type: ${result.searchType}, Confidence: ${result.confidence}%`
      );

      return result;
    } catch (error) {
      console.error('[SearchRouter] ❌ LLM analysis failed:', error);
      return this.getDefaultResult('LLM analysis failed');
    }
  }

  /**
   * 🎯 CONVENIENCE: Quick check if search is needed
   */
  public async shouldSearch(message: string): Promise<boolean> {
    const result = await this.analyzeIntent(message);
    return result.needsSearch;
  }

  /**
   * 🎯 CONVENIENCE: Get search query if search is needed
   */
  public async getSearchQuery(message: string): Promise<string | null> {
    const result = await this.analyzeIntent(message);
    return result.needsSearch ? result.suggestedQuery : null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LLM-POWERED ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Analyze intent using LLM
   */
  private async analyzeViaLLM(message: string): Promise<SearchIntentResult> {
    const prompt = SEARCH_INTENT_PROMPT.replace('{USER_MESSAGE}', message);

    const response = await this.llmService.generateCompletion(prompt, {
      maxTokens: 200,
      temperature: 0.1, // Low temperature for consistent classification
    });

    return this.parseLLMResponse(response);
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
      };
    } catch (error) {
      console.error('[SearchRouter] ❌ Failed to parse LLM response:', error);
      return this.getDefaultResult('Parse error');
    }
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
      keys: Array.from(this.intentCache.keys()).slice(0, 10), // First 10 for debugging
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE FUNCTIONS (for backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Singleton instance (will be initialized with LLM service)
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
 * @deprecated Use router.shouldSearch() instead
 */
export async function shouldTriggerSearch(message: string): Promise<boolean> {
  if (!routerInstance) {
    console.warn('[SearchRouter] ⚠️ Router not initialized, defaulting to false');
    return false;
  }
  return routerInstance.shouldSearch(message);
}

/**
 * Detect user intent (uses singleton)
 * @deprecated Use router.analyzeIntent() instead
 */
export async function detectUserIntent(message: string): Promise<UserIntent> {
  if (!routerInstance) {
    console.warn('[SearchRouter] ⚠️ Router not initialized, defaulting to unknown');
    return 'unknown';
  }
  const result = await routerInstance.analyzeIntent(message);
  return result.intent;
}

export default SearchIntentRouter;