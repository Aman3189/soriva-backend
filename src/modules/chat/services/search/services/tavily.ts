/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH - TAVILY API SERVICE v2.0 (Standalone)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/tavily.ts
 *
 * Purpose:
 * - Tavily Search API integration
 * - Best for: Entertainment, Sports, Deep Research
 * - High accuracy for Indian content (Bollywood, Cricket, etc.)
 * - Used as FALLBACK provider in SorivaSearch pipeline
 *
 * v2.0: Standalone — no HybridSearchConfig dependency
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from "axios";
import { SearchResultItem } from "../core/data";

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
// CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TAVILY_TIMEOUT = 12000; // 12s timeout

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TavilyService = {
  /**
   * Main search method
   */
  async search(query: string, count: number = 5): Promise<TavilyResponse | null> {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      console.error("[Tavily] ❌ API key missing");
      return null;
    }

    const start = Date.now();

    try {
      const res = await axios.post(
        "https://api.tavily.com/search",
        {
          api_key: apiKey,
          query: query,
          search_depth: "basic",
          include_answer: true,
          include_raw_content: false,
          max_results: count,
          include_domains: [],
          exclude_domains: [],
        },
        {
          timeout: TAVILY_TIMEOUT,
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
};