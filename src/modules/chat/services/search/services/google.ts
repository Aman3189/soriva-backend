/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH - GOOGLE CUSTOM SEARCH API SERVICE v2.0 (Standalone)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/google.ts
 *
 * Purpose:
 * - Google Custom Search API integration
 * - Best for: Local searches, Maps, Festivals, Weather
 * - Highest accuracy for location-based queries in India
 * - Used as FALLBACK provider in SorivaSearch pipeline
 *
 * v2.0: Standalone — no HybridSearchConfig dependency
 *
 * Quota: 100 free queries/day, then $5/1000 queries
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from "axios";
import { SearchResultItem } from "../core/data";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GoogleResult extends SearchResultItem {
  displayLink?: string;
  formattedUrl?: string;
}

export interface GoogleResponse {
  results: GoogleResult[];
  answer?: string;
  timeMs: number;
  query: string;
  status: number;
  totalResults?: number;
}

interface GoogleAPIResponse {
  items?: Array<{
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
    formattedUrl: string;
    pagemap?: {
      metatags?: Array<Record<string, string>>;
    };
  }>;
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GOOGLE_TIMEOUT = 10000; // 10s timeout

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const GoogleService = {
  /**
   * Main search method
   */
  async search(query: string, count: number = 5): Promise<GoogleResponse | null> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.error("[Google] ❌ API key or Search Engine ID missing");
      return null;
    }

    const start = Date.now();

    try {
      const numResults = Math.min(count, 10);

      const res = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            key: apiKey,
            cx: searchEngineId,
            q: query,
            num: numResults,
            gl: "in",
            hl: "en",
            safe: "active",
          },
          timeout: GOOGLE_TIMEOUT,
        }
      );

      const timeMs = Date.now() - start;
      const data: GoogleAPIResponse = res.data;

      const results: GoogleResult[] = (data.items || []).map((item) => ({
        title: item.title || "",
        url: item.link || "",
        description: item.snippet || "",
        displayLink: item.displayLink,
        formattedUrl: item.formattedUrl,
        age: "",
      }));

      console.log(`[Google] ✅ ${results.length} results in ${timeMs}ms`);

      return {
        results,
        answer: this.extractAnswer(data),
        timeMs,
        query,
        status: 200,
        totalResults: data.searchInformation?.totalResults
          ? parseInt(data.searchInformation.totalResults)
          : undefined,
      };
    } catch (err: any) {
      const timeMs = Date.now() - start;

      if (err.response) {
        const errorMessage = err.response.data?.error?.message || err.response.statusText;
        console.error(`[Google] ❌ HTTP ${err.response.status}: ${errorMessage}`);

        if (err.response.status === 429) {
          console.error("[Google] ⚠️ Rate limit exceeded");
        } else if (err.response.status === 403) {
          console.error("[Google] ⚠️ API quota exceeded or invalid key");
        }

        return {
          results: [],
          answer: "",
          timeMs,
          query,
          status: err.response.status,
        };
      }

      if (err.request) {
        console.error("[Google] ❌ Network error (no response)");
        return {
          results: [],
          answer: "",
          timeMs,
          query,
          status: 0,
        };
      }

      console.error("[Google] ❌ Error:", err.message);
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
  async quickSearch(query: string): Promise<GoogleResult | null> {
    const res = await this.search(query, 1);
    return res?.results?.[0] || null;
  },

  /**
   * Extract answer from Google response
   */
  extractAnswer(data: GoogleAPIResponse): string {
    const firstItem = data.items?.[0];
    if (firstItem?.pagemap?.metatags?.[0]) {
      const metatags = firstItem.pagemap.metatags[0];
      return metatags['og:description'] || metatags['description'] || "";
    }
    return "";
  },

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID);
  },
};