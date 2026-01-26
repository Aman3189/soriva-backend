/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.0 - BRAVE API SERVICE (REFINED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/brave.ts
 *
 * Purpose:
 * - Stable wrapper around Brave Web Search API
 * - Normalizes response for Soriva Search Pipeline
 * - Adds retry, enhanced answer extraction, safer fallbacks
 *
 * Refined for v3.1 — production-grade reliability.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from "axios";
import { SearchResultItem } from "../core/data";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BraveResult extends SearchResultItem {}

export interface BraveResponse {
  results: BraveResult[];
  answer?: string;
  timeMs: number;
  query: string;
  status: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERNAL HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract answer from Brave response safely
 */
function extractAnswer(data: any): string {
  return (
    data?.query?.answer ||
    data?.infobox?.description ||
    data?.infobox?.data?.map((x: any) => x?.value).join(" ") ||
    data?.featured_snippet?.description ||
    data?.featured_snippet?.answer ||
    ""
  );
}

/**
 * Parse Brave result safely
 */
function parseResults(data: any): BraveResult[] {
  const items = data?.web?.results || [];
  return items.map((r: any) => ({
    title: r.title || "",
    url: r.url || "",
    description: r.description || "",
    age: r.age || "",
  }));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BraveService = {
  /**
   * Low-level Brave API call with retry support
   */
  async search(query: string, count: number = 5): Promise<BraveResponse | null> {
    const apiKey = process.env.BRAVE_API_KEY;

    if (!apiKey) {
      console.error("[Brave] ❌ API key missing");
      return null;
    }

    const start = Date.now();

    const makeCall = async (): Promise<BraveResponse> => {
      try {
        const res = await axios.get("https://api.search.brave.com/res/v1/web/search", {
          headers: {
            "X-Subscription-Token": apiKey,
            Accept: "application/json",
          },
          params: {
            q: query,
            count,
            country: "IN",
            search_lang: "en",
            ui_lang: "en-IN",
          },
          timeout: 15000,
        });

        const timeMs = Date.now() - start;
        const data = res.data;

        const results = parseResults(data);
        const answer = extractAnswer(data);

        return {
          results,
          answer,
          timeMs,
          query,
          status: res.status,
        };
      } catch (err: any) {
        const timeMs = Date.now() - start;

        // HTTP error codes
        if (err.response) {
          console.error(
            `[Brave] ❌ HTTP ${err.response.status}: ${err.response.statusText}`
          );
          return {
            results: [],
            answer: "",
            timeMs,
            query,
            status: err.response.status,
          };
        }

        // No response
        if (err.request) {
          console.error("[Brave] ❌ Network error (no response)");
          return {
            results: [],
            answer: "",
            timeMs,
            query,
            status: 0,
          };
        }

        // Other errors
        console.error("[Brave] ❌ Error:", err.message);
        return {
          results: [],
          answer: "",
          timeMs,
          query,
          status: 0,
        };
      }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RETRY LOGIC (Important for Brave occasional 502/503)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const firstTry = await makeCall();

    if (firstTry.status === 502 || firstTry.status === 503 || firstTry.results.length === 0) {
      console.warn("[Brave] ⚠ Retrying due to empty/unstable response...");
      const retry = await makeCall();

      // If retry gives better results, use them
      if (retry.results.length > firstTry.results.length) return retry;
    }

    return firstTry;
  },

  /**
   * Quick top-1 search
   */
  async quickSearch(query: string): Promise<BraveResult | null> {
    const res = await this.search(query, 1);
    return res?.results?.[0] || null;
  },

  /**
   * Simple environment check
   */
  isConfigured(): boolean {
    return Boolean(process.env.BRAVE_API_KEY);
  },
};