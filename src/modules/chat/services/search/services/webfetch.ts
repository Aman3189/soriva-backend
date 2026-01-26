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
 * - Retry on partial / blocked content
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
  snippetOnly?: boolean;  // NEW: Flag for search router
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JS-HEAVY SITES — Content rendered via JavaScript
// These sites return empty/skeleton HTML via axios
// Solution: Skip fetch, use search snippet directly
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const JS_HEAVY_SITES = [
  // Entertainment
  "imdb.com",
  "rottentomatoes.com",
  "metacritic.com",
  "letterboxd.com",
  
  // Streaming platforms
  "youtube.com",
  "netflix.com",
  "primevideo.com",
  "amazon.com/gp/video",
  "hotstar.com",
  "jiocinema.com",
  "sonyliv.com",
  "zee5.com",
  "voot.com",
  "mxplayer.in",
  "altbalaji.com",
  
  // Ticketing
  "bookmyshow.com",
  "paytm.com/movies",
  
  // Social/Dynamic
  "twitter.com",
  "x.com",
  "reddit.com",
  "quora.com",
  "medium.com",
  
  // E-commerce (product pages)
  "amazon.in",
  "amazon.com",
  "flipkart.com",
  "myntra.com",
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOCKED DOMAINS (complete skip - no useful content ever)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BLOCKED = [
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "pinterest.com",
  "tiktok.com",
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTENT SELECTORS (deep priority chain)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SELECTORS = [
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
const REMOVE_NOISE =
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

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isBlocked(url: string): boolean {
  const host = getHostname(url);
  if (!host) return true;
  return BLOCKED.some(d => host.includes(d));
}

function isJsHeavy(url: string): boolean {
  const host = getHostname(url);
  if (!host) return false;
  return JS_HEAVY_SITES.some(site => host.includes(site) || url.includes(site));
}

// Clean IMDb URLs to main page
function cleanIMDbUrl(url: string): string {
  if (url.includes('imdb.com/title/')) {
    return url.replace(/\/(ratings|reviews|fullcredits|plotsummary|releaseinfo)\/?.*$/, '/');
  }
  return url;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN WEBFETCH SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const WebFetchService = {
  async fetch(url: string, maxChars = 2200): Promise<WebFetchResult> {
    const start = Date.now();
    
    // Clean IMDb URLs
    url = cleanIMDbUrl(url);

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
      console.log(`[WebFetch] ⚡ JS-heavy site detected: ${getHostname(url)} → Use snippet`);
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

        // Extract content
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
    // RETRY LOGIC — IMPORTANT FOR SOME INDIAN NEWS SITES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const first = await attempt();
    if (!first.success && !first.snippetOnly) {
      console.warn(`[WebFetch] ⚠ Retrying due to: ${first.error}`);
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