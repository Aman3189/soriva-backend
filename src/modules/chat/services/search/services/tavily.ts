/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH - TAVILY API SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/tavily.ts
 *
 * Purpose:
 * - Tavily Search API integration
 * - Best for: Entertainment, Sports, Finance, News, Deep Research
 * - High accuracy for Indian content (Bollywood, Cricket, etc.)
 *
 * API Docs: https://docs.tavily.com/
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from "axios";
import { SearchResultItem } from "../core/data";
import { HybridSearchConfig } from "../hybrid-search.config";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TavilyResult extends SearchResultItem {
  score?: number;
  publishedDate?: string;
}

export interface TavilyResponse {
  results: TavilyResult[];
  answer?: string;
  timeMs: number;
  query: string;
  status: number;
}

interface TavilyAPIResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
    published_date?: string;
  }>;
  answer?: string;
  query: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TavilyService = {
  /**
   * Main search method
   */
  async search(query: string, count: number = 5): Promise<TavilyResponse | null> {
    const apiKey = process.env.TAVILY_API_KEY;
    const config = HybridSearchConfig.getProviderConfig('tavily');

    if (!apiKey) {
      console.error("[Tavily] ❌ API key missing");
      return null;
    }

    if (!config.enabled) {
      console.warn("[Tavily] ⚠️ Provider disabled");
      return null;
    }

    const start = Date.now();

    try {
      const res = await axios.post(
        "https://api.tavily.com/search",
        {
          api_key: apiKey,
          query: query,
          search_depth: "basic", // "basic" or "advanced"
          include_answer: true,
          include_raw_content: false,
          max_results: count,
          include_domains: [], // Optional: limit to specific domains
          exclude_domains: [], // Optional: exclude specific domains
        },
        {
          timeout: config.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const timeMs = Date.now() - start;
      const data: TavilyAPIResponse = res.data;

      const results: TavilyResult[] = (data.results || []).map((r) => ({
        title: r.title || "",
        url: r.url || "",
        description: r.content || "",
        score: r.score,
        publishedDate: r.published_date,
        age: r.published_date ? this.formatAge(r.published_date) : "",
      }));

      console.log(`[Tavily] ✅ ${results.length} results in ${timeMs}ms`);

      return {
        results,
        answer: data.answer || "",
        timeMs,
        query,
        status: 200,
      };
    } catch (err: any) {
      const timeMs = Date.now() - start;

      if (err.response) {
        console.error(`[Tavily] ❌ HTTP ${err.response.status}: ${err.response.data?.message || err.response.statusText}`);
        return {
          results: [],
          answer: "",
          timeMs,
          query,
          status: err.response.status,
        };
      }

      if (err.request) {
        console.error("[Tavily] ❌ Network error (no response)");
        return {
          results: [],
          answer: "",
          timeMs,
          query,
          status: 0,
        };
      }

      console.error("[Tavily] ❌ Error:", err.message);
      return {
        results: [],
        answer: "",
        timeMs,
        query,
        status: 0,
      };
    }
  },

  /**
   * Deep search (advanced mode - more thorough, slower)
   */
  async deepSearch(query: string, count: number = 10): Promise<TavilyResponse | null> {
    const apiKey = process.env.TAVILY_API_KEY;
    const config = HybridSearchConfig.getProviderConfig('tavily');

    if (!apiKey || !config.enabled) {
      return null;
    }

    const start = Date.now();

    try {
      const res = await axios.post(
        "https://api.tavily.com/search",
        {
          api_key: apiKey,
          query: query,
          search_depth: "advanced",
          include_answer: true,
          include_raw_content: false,
          max_results: count,
        },
        {
          timeout: config.timeout + 10000, // Extra time for deep search
          headers: { "Content-Type": "application/json" },
        }
      );

      const timeMs = Date.now() - start;
      const data: TavilyAPIResponse = res.data;

      const results: TavilyResult[] = (data.results || []).map((r) => ({
        title: r.title || "",
        url: r.url || "",
        description: r.content || "",
        score: r.score,
        publishedDate: r.published_date,
        age: r.published_date ? this.formatAge(r.published_date) : "",
      }));

      console.log(`[Tavily] ✅ Deep search: ${results.length} results in ${timeMs}ms`);

      return {
        results,
        answer: data.answer || "",
        timeMs,
        query,
        status: 200,
      };
    } catch (err: any) {
      console.error("[Tavily] ❌ Deep search failed:", err.message);
      return null;
    }
  },

  /**
   * Quick single result search
   */
  async quickSearch(query: string): Promise<TavilyResult | null> {
    const res = await this.search(query, 1);
    return res?.results?.[0] || null;
  },

  /**
   * Format published date to human-readable age
   */
  formatAge(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return "";
    }
  },

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return Boolean(process.env.TAVILY_API_KEY);
  },

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.isConfigured() && HybridSearchConfig.getProviderConfig('tavily').enabled;
  },
};