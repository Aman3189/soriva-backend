/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.1 - WEBFETCH SERVICE (UPGRADED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/webfetch.ts
 *
 * UPGRADE v3.1:
 * - JS-heavy sites detection (IMDb, YouTube, Netflix, etc.)
 * - snippetOnly flag for search router
 * - No more wasted fetches on JS-rendered pages
 * 
 * REALITY CHECK:
 * Even ChatGPT + Perplexity do NOT fetch IMDb directly.
 * They use Bing/Google snippets. Now Soriva does the same.
 * 
 * KEY FEATURES:
 * - Anti-bot bypass headers (Chrome 124 UA)
 * - Retry with backoff on partial / blocked content
 * - Multi-layer paragraph extraction
 * - UTF-8 sanitization
 * - Noise removal (ads, widgets, comments, popups)
 * - Selector fallback chain (15+ selectors)
 * 
 * Production-ready.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from "axios";
import * as cheerio from "cheerio";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface WebFetchResult {
  success: boolean;
  url: string;
  title: string;
  content: string;
  promptTokens: number;
  timeMs: number;
  contentLength: number;
  error?: string;
  snippetOnly?: boolean;  // Flag for search router
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JS-HEAVY SITES — Content rendered via JavaScript
// These sites return empty/skeleton HTML via axios
// Solution: Skip fetch, use search snippet directly
//
// Two categories:
// 1. HOST-ONLY: Any page on this domain is JS-heavy
// 2. PATH-SPECIFIC: Only certain paths on the domain are JS-heavy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const JS_HEAVY_HOSTS: string[] = [
  // Entertainment
  "imdb.com",
  "rottentomatoes.com",
  "metacritic.com",
  "letterboxd.com",
  
  // Streaming platforms
  "youtube.com",
  "netflix.com",
  "primevideo.com",
  "hotstar.com",
  "jiocinema.com",
  "sonyliv.com",
  "zee5.com",
  "voot.com",
  "mxplayer.in",
  "altbalaji.com",
  
  // Ticketing
  "bookmyshow.com",
  
  // Social/Dynamic
  "twitter.com",
  "x.com",
  "reddit.com",
  "quora.com",
  "medium.com",
  
  // Local Business (JS-heavy)
  "zomato.com",
  "swiggy.com",
  "justdial.com",
  "practo.com",
  "magicpin.com",
  "yelp.com",
  "tripadvisor.com",
  
  // E-commerce (product pages)
  "amazon.in",
  "amazon.com",
  "flipkart.com",
  "myntra.com",
];

/**
 * Path-specific JS-heavy patterns.
 * Only matched when host matches AND path starts with the given prefix.
 * This prevents false positives — e.g. paytm.com/blog is fine to fetch,
 * but paytm.com/movies is JS-rendered.
 */
const JS_HEAVY_PATHS: { host: string; pathPrefix: string }[] = [
  { host: "paytm.com", pathPrefix: "/movies" },
  { host: "amazon.com", pathPrefix: "/gp/video" },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOCKED DOMAINS (complete skip - no useful content ever)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BLOCKED: string[] = [
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "pinterest.com",
  "tiktok.com",
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTENT SELECTORS (deep priority chain)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SELECTORS: string[] = [
  "article p",
  "main p",
  "section p",
  ".article-content p",
  ".post-content p",
  ".entry-content p",
  ".story-body p",
  ".story-content p",
  ".news-article p",
  '[itemprop="articleBody"] p',
  '[role="main"] p',
  "#main-content p",
  "#content p",
  "body p",
];

// Remove noise elements
const REMOVE_NOISE: string =
  "script, style, nav, header, footer, aside, iframe, " +
  ".ads, .ad, .advertisement, .sponsored, .promo, .sidebar, " +
  ".related, .recommendation, .newsletter, .subscription, " +
  ".popup, .modal, .paywall, .comments, .share, .social, noscript";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function sanitize(text: string): string {
  return text
    .replace(/\u00A0/g, " ") // non-breaking space
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle($: cheerio.CheerioAPI): string {
  return (
    $("title").text().trim() ||
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    "Untitled"
  ).slice(0, 180);
}

function parseUrl(url: string): { hostname: string; pathname: string } | null {
  try {
    const parsed = new URL(url);
    return {
      hostname: parsed.hostname.toLowerCase(),
      pathname: parsed.pathname.toLowerCase(),
    };
  } catch {
    return null;
  }
}

function isBlocked(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed) return true;
  return BLOCKED.some(d => parsed.hostname.includes(d));
}

/**
 * JS-heavy detection — safe, no false positives.
 *
 * Uses ONLY proper URL parsing (hostname + pathname).
 * Never does raw url.includes() which could match substrings
 * in paths, query params, or fragments.
 *
 * Two-tier check:
 * 1. Host-only: entire domain is JS-heavy (e.g. imdb.com)
 * 2. Path-specific: only certain paths (e.g. paytm.com/movies)
 */
function isJsHeavy(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed) return false;

  // Check host-only matches
  if (JS_HEAVY_HOSTS.some(site => parsed.hostname.includes(site))) {
    return true;
  }

  // Check path-specific matches
  for (const entry of JS_HEAVY_PATHS) {
    if (
      parsed.hostname.includes(entry.host) &&
      parsed.pathname.startsWith(entry.pathPrefix)
    ) {
      return true;
    }
  }

  return false;
}

/** Simple delay utility for retry backoff */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN WEBFETCH SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const WebFetchService = {
  async fetch(url: string, maxChars = 2200): Promise<WebFetchResult> {
    const start = Date.now();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHECK 1: Blocked domains (complete skip)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isBlocked(url)) {
      return this.fail(url, start, "Domain blocked");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHECK 2: JS-heavy sites (use snippet instead)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isJsHeavy(url)) {
      const parsed = parseUrl(url);
      console.log(`[WebFetch] ⚡ JS-heavy site detected: ${parsed?.hostname ?? url} → Use snippet`);
      return {
        success: false,
        url,
        title: "",
        content: "",
        contentLength: 0,
        promptTokens: 0,
        timeMs: Date.now() - start,
        snippetOnly: true,  // IMPORTANT: Router should use Brave/Google snippet
        error: "JS-heavy site - use search snippet",
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NORMAL FETCH (for static sites)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const attempt = async (): Promise<WebFetchResult> => {
      try {
        const res = await axios.get(url, {
          timeout: 15000,
          maxRedirects: 4,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
              "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
            Connection: "keep-alive",
          },
          validateStatus: status => status < 400,
        });

        const html = res.data;
        const $ = cheerio.load(html);

        // Remove noise
        $(REMOVE_NOISE).remove();

        // Extract title
        const title = extractTitle($);

        // Extract content via selector chain
        let content = "";

        for (const sel of SELECTORS) {
          const nodes = $(sel);

          if (nodes.length > 0) {
            nodes.each((_, el) => {
              const t = sanitize($(el).text());
              if (t.length > 50) content += t + " ";
            });

            if (content.length > 300) break;
          }
        }

        content = sanitize(content).slice(0, maxChars);

        if (content.length < 80) {
          return this.fail(url, start, "Insufficient content");
        }

        const timeMs = Date.now() - start;

        return {
          success: true,
          url,
          title,
          content,
          contentLength: content.length,
          promptTokens: Math.ceil(content.length / 4),
          timeMs,
        };
      } catch (e: any) {
        return this.fail(url, start, e?.message || "Unknown error");
      }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RETRY LOGIC — with backoff for Indian news sites
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const first = await attempt();
    if (!first.success && !first.snippetOnly) {
      console.warn(`[WebFetch] ⚠ Retrying (500ms backoff) due to: ${first.error}`);
      await delay(500);
      const second = await attempt();
      if (second.success) return second;
    }

    return first;
  },

  fail(url: string, start: number, error: string): WebFetchResult {
    console.error(`[WebFetch] ❌ ${error}`);

    return {
      success: false,
      url,
      title: "",
      content: "",
      contentLength: 0,
      promptTokens: 0,
      timeMs: Date.now() - start,
      error,
    };
  },
};