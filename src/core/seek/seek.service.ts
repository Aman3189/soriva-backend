/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEEK SERVICE - 100% DYNAMIC
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: AI-powered web search with FULLY DYNAMIC responses
 * 
 * Key Feature: Gemini DECIDES the response type - no hardcoded keywords!
 * 
 * Response Types (Gemini chooses):
 * - products: Shopping queries, recommendations, gift ideas
 * - comparison: X vs Y, which is better, differences
 * - news: Current events, latest updates, what's happening
 * - steps: How-to guides, tutorials, processes
 * - text: Explanations, definitions, general answers
 * 
 * Cost: ₹0.42 per search (Google API) + Token pool for AI
 * 
 * Author: Risenex Global
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';
import { googleSearchService } from '../../services/web-search/google-search.service';
import { SEEK_LIMITS } from '../../constants/plans';
import usageService from '../../modules/billing/usage.service';

const prisma = new PrismaClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  domain: string;
}

export type SearchMode = 'quick' | 'deep' | 'research';
export type PlanType = 'STARTER' | 'PLUS' | 'PRO' | 'APEX';
export type ResponseType = 'products' | 'comparison' | 'news' | 'steps' | 'text';

export interface SeekRequest {
  query: string;
  mode?: SearchMode;
  region?: string;
}

export interface SeekSource {
  title: string;
  url: string;
  snippet?: string;
  domain?: string;
  favicon?: string;
}

// Product structure
export interface SeekProduct {
  name: string;
  price: string;
  rating?: number;
  image?: string;
  specs?: string[];
  source?: string;
  buyLink?: string;
}

// Comparison structure
export interface SeekComparisonItem {
  name: string;
  image?: string;
  attributes: Record<string, string>;
}

// News structure
export interface SeekNewsItem {
  title: string;
  snippet: string;
  source: string;
  time: string;
  url?: string;
  image?: string;
}

// Step structure
export interface SeekStep {
  number: number;
  title: string;
  description: string;
}

// Unified response
export interface SeekResponse {
  success: boolean;
  responseType: ResponseType;
  query: string;
  mode: SearchMode;
  
  // Type-specific content
  textContent?: string;
  products?: SeekProduct[];
  comparison?: SeekComparisonItem[];
  newsItems?: SeekNewsItem[];
  steps?: SeekStep[];
  
  // Always present
  sources: SeekSource[];
  followUps: string[];
  
  // Meta
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  searchCost: number;
  processingTime: number;
  cached?: boolean;
}

export interface SeekLimitStatus {
  allowed: boolean;
  reason?: string;
  used: number;
  limit: number;
  remaining: number;
  resetsAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SEARCH_MODE_CONFIG = {
  quick: {
    numResults: 5,
    maxSummaryTokens: 800,
    description: 'Fast answer with top 5 sources',
  },
  deep: {
    numResults: 8,
    maxSummaryTokens: 1200,
    description: 'Detailed answer with 8 sources',
  },
  research: {
    numResults: 12,
    maxSummaryTokens: 1800,
    description: 'Comprehensive research with 12 sources',
  },
} as const;

// Cache
const SEARCH_CACHE: Map<string, { data: SeekResponse; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UNIFIED DYNAMIC PROMPT - GEMINI DECIDES EVERYTHING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Generate unified prompt - Gemini will decide the response type
 */
function generateUnifiedPrompt(query: string, searchResults: SearchResult[]): string {
  // Build context from search results
  const context = searchResults
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.link}`)
    .join('\n\n');

  return `You are Soriva Seek - an intelligent AI search assistant for Indian users.

═══════════════════════════════════════════════════════════════════
USER QUERY: "${query}"
═══════════════════════════════════════════════════════════════════

SEARCH RESULTS:
${context}

═══════════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════════

1. ANALYZE the user's query and search results
2. DECIDE the best response format from these 5 types:
   
   • "products" - Use when user wants to BUY something, needs RECOMMENDATIONS, 
                  looking for GIFTS, comparing prices, best options, top picks
                  Examples: "best phone under 20k", "gift for mom", "suggest headphones"
   
   • "comparison" - Use when user wants to COMPARE 2-3 specific items
                    Examples: "iPhone vs Samsung", "which is better A or B"
   
   • "news" - Use when user asks about CURRENT EVENTS, RECENT happenings, UPDATES
              Examples: "latest tech news", "what happened today", "recent updates"
   
   • "steps" - Use when user wants to LEARN HOW TO do something, needs a GUIDE
               Examples: "how to invest", "steps to apply", "guide to learn"
   
   • "text" - Use for EXPLANATIONS, DEFINITIONS, GENERAL KNOWLEDGE
              Examples: "what is AI", "explain blockchain", "meaning of"

3. RESPOND with the appropriate JSON structure

═══════════════════════════════════════════════════════════════════
RESPONSE FORMAT (Choose ONE based on your decision):
═══════════════════════════════════════════════════════════════════

IF responseType = "products":
{
  "responseType": "products",
  "products": [
    {
      "name": "Product Name",
      "price": "₹XX,XXX",
      "rating": 4.5,
      "specs": ["spec1", "spec2", "spec3"],
      "source": "Website Name"
    }
  ],
  "followUps": ["relevant question 1", "relevant question 2", "relevant question 3", "relevant question 4"]
}

IF responseType = "comparison":
{
  "responseType": "comparison",
  "comparison": [
    {
      "name": "Item 1",
      "attributes": {
        "Price": "₹XX,XXX",
        "Feature 1": "Value",
        "Feature 2": "Value"
      }
    },
    {
      "name": "Item 2", 
      "attributes": {
        "Price": "₹XX,XXX",
        "Feature 1": "Value",
        "Feature 2": "Value"
      }
    }
  ],
  "followUps": ["which is better for X?", "alternatives?", "detailed review?", "price drop alerts?"]
}

IF responseType = "news":
{
  "responseType": "news",
  "newsItems": [
    {
      "title": "News Headline",
      "snippet": "Brief 1-2 sentence summary",
      "source": "Publication Name",
      "time": "X hours ago"
    }
  ],
  "followUps": ["more about topic?", "related news?", "expert opinions?", "impact analysis?"]
}

IF responseType = "steps":
{
  "responseType": "steps",
  "steps": [
    {
      "number": 1,
      "title": "Step Title",
      "description": "Detailed explanation with tips. 2-3 sentences."
    }
  ],
  "followUps": ["common mistakes?", "tips for beginners?", "advanced guide?", "video tutorials?"]
}

IF responseType = "text":
{
  "responseType": "text",
  "textContent": "Your comprehensive answer here. Use **bold** for emphasis. Include facts, numbers. Cite sources using [1], [2]. Write 150-300 words in paragraphs.",
  "followUps": ["related question?", "deeper dive?", "practical examples?", "latest updates?"]
}

═══════════════════════════════════════════════════════════════════
IMPORTANT RULES:
═══════════════════════════════════════════════════════════════════

1. RESPOND WITH ONLY JSON - No markdown backticks, no extra text
2. Use Hinglish naturally if query is in Hindi/Hinglish
3. ALL prices must be in ₹ (Indian Rupees)
4. Extract REAL data from search results - don't make up prices/specs
5. followUps must be CONTEXTUAL to the user's query
6. For products: Include 4-6 items with real prices from search results
7. For comparison: Use SAME attribute keys for both items (for table alignment)
8. For news: Include 4-6 news items with realistic time estimates
9. For steps: Include 4-7 actionable steps with practical tips
10. For text: Be comprehensive but concise, cite sources

RESPOND NOW WITH JSON:`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEEK SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SeekService {
  private static instance: SeekService;

  private constructor() {}

  static getInstance(): SeekService {
    if (!SeekService.instance) {
      SeekService.instance = new SeekService();
    }
    return SeekService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN SEARCH METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async search(userId: string, request: SeekRequest): Promise<SeekResponse> {
    const startTime = Date.now();
    const mode = request.mode || 'quick';
    const config = SEARCH_MODE_CONFIG[mode];

    try {
      // ─────────────────────────────────────────────────────────────────
      // Check cache
      // ─────────────────────────────────────────────────────────────────
      const cacheKey = this.getCacheKey(request.query, mode);
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        console.log(`✅ Seek cache hit: "${request.query}"`);
        return { ...cached, cached: true };
      }

      // ─────────────────────────────────────────────────────────────────
      // Check user limits (search count)
      // ─────────────────────────────────────────────────────────────────
      const limitCheck = await this.checkSearchLimit(userId);
      
      if (!limitCheck.allowed) {
        throw new Error(limitCheck.reason || 'Search limit exceeded');
      }

      // ─────────────────────────────────────────────────────────────────
      // Check token pool availability
      // ─────────────────────────────────────────────────────────────────
      const estimatedTokens = SEARCH_MODE_CONFIG[mode].maxSummaryTokens + 500; // buffer
      const tokenCheck = await usageService.canUseTokens(userId, estimatedTokens);
      
      if (!tokenCheck.canUse) {
        throw new Error(tokenCheck.reason || 'Insufficient tokens for search');
      }

      // ─────────────────────────────────────────────────────────────────
      // Perform Google Search
      // ─────────────────────────────────────────────────────────────────
      console.log(`🔍 Seek: "${request.query}" [${mode}]`);

      const searchResults = await googleSearchService.search(request.query, {
        numResults: config.numResults,
        region: request.region || 'in',
      });

      if (!searchResults || searchResults.length === 0) {
        return this.buildEmptyResponse(request.query, mode, startTime);
      }

      // ─────────────────────────────────────────────────────────────────
      // Generate AI Response - GEMINI DECIDES EVERYTHING
      // ─────────────────────────────────────────────────────────────────
      const prompt = generateUnifiedPrompt(request.query, searchResults);
      const aiResponse = await this.callGeminiFlash(prompt, config.maxSummaryTokens);
      
      // Parse JSON response
      const parsedResponse = this.parseAIResponse(aiResponse.text);

      if (!parsedResponse.responseType) {
        throw new Error('Gemini did not return responseType');
      }

      console.log(`🎯 Gemini decided: ${parsedResponse.responseType}`);

      // ─────────────────────────────────────────────────────────────────
      // Build sources list
      // ─────────────────────────────────────────────────────────────────
      const sources: SeekSource[] = searchResults.map(r => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
        domain: r.domain,
        favicon: `https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`,
      }));

      // ─────────────────────────────────────────────────────────────────
      // Record usage
      // ─────────────────────────────────────────────────────────────────
      await this.recordSearchUsage(userId, {
        query: request.query,
        mode,
        responseType: parsedResponse.responseType,
        sourcesCount: searchResults.length,
        tokenUsage: aiResponse.tokenUsage,
      });

      // ─────────────────────────────────────────────────────────────────
      // Build final response
      // ─────────────────────────────────────────────────────────────────
      const responseType = parsedResponse.responseType as ResponseType;
      
      const response: SeekResponse = {
        success: true,
        responseType,
        query: request.query,
        mode,
        
        // Type-specific content based on what Gemini decided
        ...(responseType === 'text' && { textContent: parsedResponse.textContent }),
        ...(responseType === 'products' && { products: parsedResponse.products }),
        ...(responseType === 'comparison' && { comparison: parsedResponse.comparison }),
        ...(responseType === 'news' && { newsItems: parsedResponse.newsItems }),
        ...(responseType === 'steps' && { steps: parsedResponse.steps }),
        
        sources,
        followUps: parsedResponse.followUps || this.getDefaultFollowUps(request.query),
        tokenUsage: aiResponse.tokenUsage,
        searchCost: SEEK_LIMITS.costPerSearch,
        processingTime: Date.now() - startTime,
        cached: false,
      };

      // Cache the response
      this.saveToCache(cacheKey, response);

      console.log(`✅ Seek complete [${responseType}]: ${response.processingTime}ms`);
      return response;

    } catch (error: any) {
      console.error('❌ Seek error:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AI RESPONSE PARSING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Parse AI response JSON
   */
  private parseAIResponse(text: string): any {
    try {
      // Clean the response
      let cleanText = text
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      // Extract JSON object
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanText);
      
      // Validate responseType exists
      if (!parsed.responseType) {
        console.warn('⚠️ No responseType in response, defaulting to text');
        return {
          responseType: 'text',
          textContent: cleanText,
          followUps: []
        };
      }

      // Validate content exists for the response type
      const validations: Record<string, string> = {
        'products': 'products',
        'comparison': 'comparison',
        'news': 'newsItems',
        'steps': 'steps',
        'text': 'textContent'
      };

      const requiredField = validations[parsed.responseType];
      if (requiredField && !parsed[requiredField]) {
        console.warn(`⚠️ Missing ${requiredField} for type ${parsed.responseType}`);
        // Try to salvage by converting to text
        return {
          responseType: 'text',
          textContent: text,
          followUps: parsed.followUps || []
        };
      }

      return parsed;

    } catch (error: any) {
      console.error('❌ JSON parse error:', error.message);
      console.log('Raw text (first 500 chars):', text.substring(0, 500));
      
      // Return as text fallback
      return {
        responseType: 'text',
        textContent: text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim(),
        followUps: []
      };
    }
  }

  /**
   * Get default follow-ups based on query
   */
  private getDefaultFollowUps(query: string): string[] {
    return [
      `Tell me more about ${query.split(' ').slice(0, 3).join(' ')}`,
      'What are the alternatives?',
      'Explain in more detail',
      'Latest updates on this topic'
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GEMINI API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Call Gemini Flash API
   */
  private async callGeminiFlash(
    prompt: string,
    maxTokens: number
  ): Promise<{
    text: string;
    tokenUsage: { input: number; output: number; total: number };
  }> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7,
            topP: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Token usage
    const usageMetadata = data.usageMetadata || {};
    const inputTokens = usageMetadata.promptTokenCount || Math.ceil(prompt.length / 4);
    const outputTokens = usageMetadata.candidatesTokenCount || Math.ceil(text.length / 4);

    return {
      text,
      tokenUsage: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildEmptyResponse(query: string, mode: SearchMode, startTime: number): SeekResponse {
    return {
      success: false,
      responseType: 'text',
      query,
      mode,
      textContent: 'No results found. Please try different keywords.',
      sources: [],
      followUps: ['Try different search terms', 'Be more specific', 'Check spelling'],
      tokenUsage: { input: 0, output: 0, total: 0 },
      searchCost: 0,
      processingTime: Date.now() - startTime,
    };
  }

  private getCacheKey(query: string, mode: SearchMode): string {
    return `${query.toLowerCase().trim()}_${mode}`;
  }

  private getFromCache(key: string): SeekResponse | null {
    const cached = SEARCH_CACHE.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private saveToCache(key: string, data: SeekResponse): void {
    SEARCH_CACHE.set(key, { data, timestamp: Date.now() });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE & LIMITS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async checkSearchLimit(userId: string): Promise<SeekLimitStatus> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, region: true },
      });

      if (!user) {
        return {
          allowed: false,
          reason: 'User not found',
          used: 0, limit: 0, remaining: 0, resetsAt: new Date(),
        };
      }

      const planType = user.planType as PlanType;
      const region = (user.region === 'IN' ? 'IN' : 'INTL') as 'IN' | 'INTL';
      const limit = SEEK_LIMITS[region][planType];

      if (limit === 0) {
        return {
          allowed: false,
          reason: 'Soriva Seek is available for PLUS, PRO, and APEX plans. Upgrade to unlock!',
          used: 0, limit: 0, remaining: 0, resetsAt: new Date(),
        };
      }

      const billingCycle = this.getBillingCycle();
      const usage = await this.getMonthlyUsage(userId, billingCycle.startDate);
      const remaining = Math.max(0, limit - usage);

      if (remaining <= 0) {
        return {
          allowed: false,
          reason: `Monthly limit reached (${limit}). Resets on ${billingCycle.endDate.toLocaleDateString()}.`,
          used: usage, limit, remaining: 0, resetsAt: billingCycle.endDate,
        };
      }

      return { allowed: true, used: usage, limit, remaining, resetsAt: billingCycle.endDate };
    } catch (error: any) {
      console.error('❌ Limit check error:', error.message);
      return { allowed: false, reason: 'Error checking limits', used: 0, limit: 0, remaining: 0, resetsAt: new Date() };
    }
  }

    private async recordSearchUsage(
    userId: string,
    data: {
      query: string;
      mode: SearchMode;
      responseType: string;
      sourcesCount: number;
      tokenUsage: { input: number; output: number; total: number };
    }
  ): Promise<void> {
    try {
      // ─────────────────────────────────────────────────────────────────
      // Deduct from Token Pool (Premium → Bonus fallback)
      // ─────────────────────────────────────────────────────────────────
      // First check which pool to use
      const poolCheck = await usageService.canUseTokens(userId, data.tokenUsage.total);
      const poolToUse = poolCheck.useFromPool || 'premium';
      
      const deductionResult = await usageService.deductTokens(userId, data.tokenUsage.total, poolToUse);
      
      if (!deductionResult.success) {
        console.warn(`⚠️ Token deduction failed for Seek: ${deductionResult.message}`);
      }

      // ─────────────────────────────────────────────────────────────────
      // Update Seek-specific counters
      // ─────────────────────────────────────────────────────────────────
      await prisma.usage.update({
        where: { userId },
        data: {
          seekSearchesThisMonth: { increment: 1 },
          seekTokensUsed: { increment: data.tokenUsage.total },
          lastSeekAt: new Date(),
        },
      });

      console.log(`📊 Seek: ${userId} | ${data.responseType} | ${data.tokenUsage.total} tokens | Pool: ${deductionResult.poolUsed?.toUpperCase() || 'PREMIUM'}`);
    } catch (error: any) {
      console.error('❌ Usage recording error:', error.message);
    }
  }

  private async getMonthlyUsage(userId: string, cycleStart: Date): Promise<number> {
    try {
      const usage = await prisma.usage.findUnique({
        where: { userId },
        select: { seekSearchesThisMonth: true, updatedAt: true },
      });

      if (!usage) return 0;

      if (usage.updatedAt < cycleStart) {
        await prisma.usage.update({
          where: { userId },
          data: { seekSearchesThisMonth: 0 },
        });
        return 0;
      }

      return usage.seekSearchesThisMonth || 0;
    } catch (error) {
      return 0;
    }
  }

  private getBillingCycle(): { startDate: Date; endDate: Date } {
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getTrendingSearches(): string[] {
    return [
      'Best phones under 20000',
      'iPhone vs Samsung comparison',
      'Latest tech news India',
      'How to invest in mutual funds',
      'Best laptops for students',
      'IPL 2025 updates',
      'Electric scooters under 1 lakh',
      'Gold price today',
    ];
  }

  async getSearchStats(userId: string): Promise<any> {
    const limitStatus = await this.checkSearchLimit(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });

    return {
      used: limitStatus.used,
      limit: limitStatus.limit,
      remaining: limitStatus.remaining,
      resetsAt: limitStatus.resetsAt,
      planType: user?.planType || 'STARTER',
    };
  }

  getSearchModes(): typeof SEARCH_MODE_CONFIG {
    return SEARCH_MODE_CONFIG;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default SeekService.getInstance();