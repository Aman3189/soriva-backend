/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEEK SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: AI-powered web search with intelligent summarization
 * Cost: ₹0.42 per search (Google API) + Token pool for AI summary
 * 
 * Features:
 * - Google Custom Search integration
 * - AI-powered summary (Gemini Flash)
 * - 3 Search modes: Quick / Deep / Research
 * - Plan-based limits (PLUS: 10, PRO: 30, APEX: 50)
 * - Trending searches cache
 * - Related questions generation
 * 
 * Author: Risenex Global
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';
import { googleSearchService } from '../../services/web-search/google-search.service';
import { SEEK_LIMITS } from '../../constants/plans';

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

export interface SeekRequest {
  query: string;
  mode?: SearchMode;
  region?: string;
}

export interface SeekSource {
  title: string;
  link: string;
  snippet: string;
  domain: string;
  favicon?: string;
}

export interface SeekResponse {
  success: boolean;
  query: string;
  mode: SearchMode;
  summary: string;
  sources: SeekSource[];
  relatedQuestions: string[];
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
    numResults: 3,
    maxSummaryTokens: 300,
    description: 'Fast answer with top 3 sources',
  },
  deep: {
    numResults: 6,
    maxSummaryTokens: 600,
    description: 'Detailed answer with 6 sources',
  },
  research: {
    numResults: 10,
    maxSummaryTokens: 1000,
    description: 'Comprehensive research with 10 sources',
  },
} as const;

// Trending searches cache (refresh every hour)
const TRENDING_CACHE: Map<string, { data: SeekResponse; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

  /**
   * Main search method - Google Search + AI Summary
   */
  async search(userId: string, request: SeekRequest): Promise<SeekResponse> {
    const startTime = Date.now();
    const mode = request.mode || 'quick';
    const config = SEARCH_MODE_CONFIG[mode];

    try {
      // ─────────────────────────────────────────────────────────────────
      // Check cache first
      // ─────────────────────────────────────────────────────────────────
      const cacheKey = this.getCacheKey(request.query, mode);
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        console.log(`✅ Seek cache hit: "${request.query}"`);
        return { ...cached, cached: true };
      }

      // ─────────────────────────────────────────────────────────────────
      // Check user limits
      // ─────────────────────────────────────────────────────────────────
      const limitCheck = await this.checkSearchLimit(userId);
      
      if (!limitCheck.allowed) {
        throw new Error(limitCheck.reason || 'Search limit exceeded');
      }

      // ─────────────────────────────────────────────────────────────────
      // Perform Google Search
      // ─────────────────────────────────────────────────────────────────
      console.log(`🔍 Seek searching: "${request.query}" [${mode}]`);

      const searchResults = await googleSearchService.search(request.query, {
        numResults: config.numResults,
        region: request.region || 'in',
      });

      if (!searchResults || searchResults.length === 0) {
        return {
          success: false,
          query: request.query,
          mode,
          summary: 'No results found for your query. Please try different keywords.',
          sources: [],
          relatedQuestions: [],
          tokenUsage: { input: 0, output: 0, total: 0 },
          searchCost: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // ─────────────────────────────────────────────────────────────────
      // Generate AI Summary
      // ─────────────────────────────────────────────────────────────────
      const { summary, relatedQuestions, tokenUsage } = await this.generateSummary(
        request.query,
        searchResults,
        config.maxSummaryTokens
      );

      // ─────────────────────────────────────────────────────────────────
      // Record usage
      // ─────────────────────────────────────────────────────────────────
      await this.recordSearchUsage(userId, {
        query: request.query,
        mode,
        sourcesCount: searchResults.length,
        tokenUsage,
      });

      // ─────────────────────────────────────────────────────────────────
      // Build response
      // ─────────────────────────────────────────────────────────────────
      const response: SeekResponse = {
        success: true,
        query: request.query,
        mode,
        summary,
        sources: searchResults.map(r => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet,
          domain: r.domain,
          favicon: `https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`,
        })),
        relatedQuestions,
        tokenUsage,
        searchCost: SEEK_LIMITS.costPerSearch,
        processingTime: Date.now() - startTime,
        cached: false,
      };

      // Cache the response
      this.saveToCache(cacheKey, response);

      console.log(`✅ Seek complete: ${response.processingTime}ms`);
      return response;

    } catch (error: any) {
      console.error('❌ Seek error:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AI SUMMARY GENERATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate AI summary from search results
   * Uses Gemini Flash for cost efficiency
   */
  private async generateSummary(
    query: string,
    results: SearchResult[],
    maxTokens: number
  ): Promise<{
    summary: string;
    relatedQuestions: string[];
    tokenUsage: { input: number; output: number; total: number };
  }> {
    try {
      // Build context from search results
      const context = results
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.domain}`)
        .join('\n\n');

      const prompt = `You are Soriva Seek - an AI search assistant for Indian users.

USER QUERY: "${query}"

SEARCH RESULTS:
${context}

INSTRUCTIONS:
1. Provide a clear, helpful summary answering the user's query
2. Use Hinglish naturally if the query is in Hindi/Hinglish
3. Include specific facts, numbers, prices (in ₹) where relevant
4. Keep response concise but complete
5. Cite sources using [1], [2], etc.
6. At the end, suggest 3 related questions the user might want to ask

FORMAT:
[Your summary here with citations]

Related Questions:
1. [Question 1]
2. [Question 2]
3. [Question 3]`;

      // Call Gemini Flash API
      const response = await this.callGeminiFlash(prompt, maxTokens);

      // Parse response
      const parts = response.text.split('Related Questions:');
      const summary = parts[0].trim();
      
      let relatedQuestions: string[] = [];
      if (parts[1]) {
        relatedQuestions = parts[1]
          .split('\n')
          .filter(line => line.trim().match(/^\d+\./))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(q => q.length > 0)
          .slice(0, 3);
      }

      return {
        summary,
        relatedQuestions,
        tokenUsage: response.tokenUsage,
      };

    } catch (error: any) {
      console.error('❌ Summary generation error:', error.message);
      
      // Fallback: Return search snippets as summary
      const fallbackSummary = results
        .slice(0, 3)
        .map((r, i) => `${i + 1}. **${r.title}**: ${r.snippet}`)
        .join('\n\n');

      return {
        summary: fallbackSummary,
        relatedQuestions: [],
        tokenUsage: { input: 0, output: 0, total: 0 },
      };
    }
  }

  /**
   * Call Gemini Flash API for summary generation
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: any = await response.json();    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Estimate token usage
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(text.length / 4);

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
  // USAGE TRACKING & LIMITS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if user can perform search
   */
  async checkSearchLimit(userId: string): Promise<SeekLimitStatus> {
    try {
      // Get user's plan and region
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, region: true },
      });

      if (!user) {
        return {
          allowed: false,
          reason: 'User not found',
          used: 0,
          limit: 0,
          remaining: 0,
          resetsAt: new Date(),
        };
      }

      const planType = user.planType as PlanType;
      const region = (user.region === 'IN' ? 'IN' : 'INTL') as 'IN' | 'INTL';

      // Get plan limit
      const limit = SEEK_LIMITS[region][planType];

      // STARTER has no access
      if (limit === 0) {
        return {
          allowed: false,
          reason: 'Soriva Seek is available for PLUS, PRO, and APEX plans. Please upgrade to unlock AI Search.',
          used: 0,
          limit: 0,
          remaining: 0,
          resetsAt: new Date(),
        };
      }

      // Get current month usage
      const billingCycle = this.getBillingCycle(userId);
      const usage = await this.getMonthlyUsage(userId, billingCycle.startDate);

      const remaining = Math.max(0, limit - usage);

      if (remaining <= 0) {
        return {
          allowed: false,
          reason: `Monthly search limit reached (${limit} searches). Resets on ${billingCycle.endDate.toLocaleDateString()}.`,
          used: usage,
          limit,
          remaining: 0,
          resetsAt: billingCycle.endDate,
        };
      }

      return {
        allowed: true,
        used: usage,
        limit,
        remaining,
        resetsAt: billingCycle.endDate,
      };

    } catch (error: any) {
      console.error('❌ Limit check error:', error.message);
      return {
        allowed: false,
        reason: 'Error checking search limits',
        used: 0,
        limit: 0,
        remaining: 0,
        resetsAt: new Date(),
      };
    }
  }

  /**
   * Record search usage
   */
  private async recordSearchUsage(
    userId: string,
    data: {
      query: string;
      mode: SearchMode;
      sourcesCount: number;
      tokenUsage: { input: number; output: number; total: number };
    }
  ): Promise<void> {
    try {
      await prisma.usage.update({
        where: { userId },
        data: {
          seekSearchesThisMonth: { increment: 1 },
          seekTokensUsed: { increment: data.tokenUsage.total },
          lastSeekAt: new Date(),
        },
      });

      console.log(`📊 Seek usage recorded for user: ${userId}`);
      }       
        catch (error: any) {
        console.error('❌ Usage recording error:', error.message);
    }
  }

  /**
   * Get monthly search usage
   */
  private async getMonthlyUsage(userId: string, cycleStart: Date): Promise<number> {
    try {
      const usage = await prisma.usage.findUnique({
        where: { userId },
        select: { seekSearchesThisMonth: true, updatedAt: true },
      });

      if (!usage) return 0;

      // Check if usage is from current cycle
      if (usage.updatedAt < cycleStart) {
        // Reset counter for new cycle
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

  /**
   * Get billing cycle dates
   */
  private getBillingCycle(userId: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    return { startDate, endDate };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get cache key for query
   */
  private getCacheKey(query: string, mode: SearchMode): string {
    return `${query.toLowerCase().trim()}_${mode}`;
  }

  /**
   * Get from cache if valid
   */
  private getFromCache(key: string): SeekResponse | null {
    const cached = TRENDING_CACHE.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    return null;
  }

  /**
   * Save to cache
   */
  private saveToCache(key: string, data: SeekResponse): void {
    TRENDING_CACHE.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRENDING SEARCHES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get trending searches for India
   */
  getTrendingSearches(): string[] {
    return [
      'Latest news India today',
      'Stock market live updates',
      'Weather forecast today',
      'IPL 2025 updates',
      'Best smartphones under 20000',
      'Mutual fund investment tips',
      'Gold price today India',
      'Upcoming movies 2025',
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATS & INFO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get search stats for user
   */
  async getSearchStats(userId: string): Promise<{
    used: number;
    limit: number;
    remaining: number;
    resetsAt: Date;
    planType: string;
  }> {
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

  /**
   * Get search modes info
   */
  getSearchModes(): typeof SEARCH_MODE_CONFIG {
    return SEARCH_MODE_CONFIG;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default SeekService.getInstance();