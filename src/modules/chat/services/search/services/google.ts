/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH - GOOGLE CUSTOM SEARCH API SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/google.ts
 *
 * Purpose:
 * - Google Custom Search API integration
 * - Best for: Local searches, Maps, Festivals, Weather, Real-time
 * - Highest accuracy for location-based queries in India
 *
 * Setup Required:
 * - GOOGLE_SEARCH_API_KEY: API key from Google Cloud Console
 * - GOOGLE_SEARCH_ENGINE_ID: Custom Search Engine ID (cx)
 *
 * API Docs: https://developers.google.com/custom-search/v1/overview
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from "axios";
import { SearchResultItem } from "../core/data";
import { HybridSearchConfig } from "../hybrid-search.config";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GoogleResult extends SearchResultItem {
  displayLink?: string;
  formattedUrl?: string;
  pagemap?: {
    metatags?: Array<Record<string, string>>;
    cse_image?: Array<{ src: string }>;
  };
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
      cse_image?: Array<{ src: string }>;
    };
  }>;
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  spelling?: {
    correctedQuery: string;
  };
}

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
    const config = HybridSearchConfig.getProviderConfig('google');

    if (!apiKey || !searchEngineId) {
      console.error("[Google] ❌ API key or Search Engine ID missing");
      return null;
    }

    if (!config.enabled) {
      console.warn("[Google] ⚠️ Provider disabled");
      return null;
    }

    const start = Date.now();

    try {
      // Google Custom Search API limits to 10 results per request
      const numResults = Math.min(count, 10);

      const res = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            key: apiKey,
            cx: searchEngineId,
            q: query,
            num: numResults,
            gl: "in", // Geolocation: India
            hl: "en", // Language: English
            safe: "active", // Safe search
          },
          timeout: config.timeout,
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
        pagemap: item.pagemap,
        age: "", // Google doesn't provide age directly
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
        
        // Handle specific Google API errors
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
   * Location-specific search (best use case for Google)
   */
  async localSearch(query: string, location?: string): Promise<GoogleResponse | null> {
    const enhancedQuery = location 
      ? `${query} in ${location} India`
      : `${query} near me India`;
    
    return this.search(enhancedQuery, 5);
  },

  /**
   * Quick single result search
   */
  async quickSearch(query: string): Promise<GoogleResult | null> {
    const res = await this.search(query, 1);
    return res?.results?.[0] || null;
  },

  /**
   * Extract answer from Google response (limited, usually from featured snippets)
   */
  extractAnswer(data: GoogleAPIResponse): string {
    // Google Custom Search doesn't directly provide answers like Brave/Tavily
    // We try to extract from first result's metatags if available
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

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.isConfigured() && HybridSearchConfig.getProviderConfig('google').enabled;
  },

  /**
   * Get remaining daily quota (Google has 100 free queries/day)
   * Note: This is informational only, actual tracking needs server-side implementation
   */
  getQuotaInfo(): { freeDaily: number; note: string } {
    return {
      freeDaily: 100,
      note: "Google Custom Search provides 100 free queries/day. Beyond that, $5 per 1000 queries.",
    };
  },
};