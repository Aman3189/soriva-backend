/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.0 - RELEVANCE SCORING (REFINED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/engine/relevance.ts
 * 
 * Improves accuracy by applying:
 * - Weighted title/description matching
 * - Freshness scoring
 * - Trusted source bonus
 * - Exact match multiplier
 * - Penalty system for irrelevant results
 * - Normalized domain/URL processing
 *
 * Extremely stable for Brave search result ranking.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { SearchResultItem } from "../core/data";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WEIGHTS = {
  TITLE_MATCH: 15,
  DESCRIPTION_MATCH: 8,
  EXACT_MATCH: 12,
  PARTIAL_MATCH: 4,

  FRESH_MINUTES: 10,
  FRESH_HOURS: 6,
  FRESH_DAYS: 3,
  FRESH_WEEKS: 1,

  YEAR_MATCH: 4,

  TRUSTED_SOURCE: 6,

  PENALTY_IRRELEVANT: -12,
  PENALTY_CLICKBAIT: -8,
  PENALTY_UNRELIABLE: -15, // v3.4: Heavy penalty for sites that often fail to fetch
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRUSTED DOMAINS BY CATEGORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// General trusted sources
const TRUSTED_DOMAINS = [
  "wikipedia.org",
  "imdb.com",
  "espncricinfo.com",
  "cricbuzz.com",
  "moneycontrol.com",
  "economictimes.com",
  "bbc.com",
];

// News sources (for NEWS queries)
const NEWS_DOMAINS = [
  "ndtv.com",
  "hindustantimes.com",
  "timesofindia.indiatimes.com",
  "indianexpress.com",
  "thehindu.com",
  "bbc.com",
  "cnn.com",
  "reuters.com",
  "aljazeera.com",
  "theguardian.com",
  "nytimes.com",
];

// Local Business sources (for theatre/restaurant/hospital queries)
const LOCAL_BUSINESS_DOMAINS = [
  // India
  "bookmyshow.com",
  "paytm.com",
  "justdial.com",
  "zomato.com",
  "swiggy.com",
  "practo.com",
  "makemytrip.com",
  "goibibo.com",
  // International
  "yelp.com",
  "tripadvisor.com",
  "google.com/maps",
  "maps.google.com",
  "foursquare.com",
  "opentable.com",
  "fandango.com",
  "atomtickets.com",
  "amctheatres.com",
  "regmovies.com",
  "cinemark.com",
  "odeon.co.uk",
  "cineworld.co.uk",
  "vuecinemas.co.uk",
];

// Clickbait/low-quality domains (penalty)
const LOW_QUALITY_DOMAINS = [
  "quora.com",
  "pinterest.com",
  "tumblr.com",
  "fb.com",
  "facebook.com",
];

// v3.4: Unreliable domains - often return 404, block bots, or have broken URLs
// These get heavy penalty to avoid wasting WebFetch attempts
const UNRELIABLE_DOMAINS = [
  // Government portals (frequently broken/block bots)
  "india.gov.in",
  "gov.in",
  "nic.in",
  "mygov.in",
  // State government sites
  "punjab.gov.in",
  "haryana.gov.in",
  "rajasthan.gov.in",
  "up.gov.in",
  "mp.gov.in",
  // District/local government
  "district",  // Catches district.*.gov.in patterns
  // PDF-heavy sites (can't extract content easily)
  "scribd.com",
  "slideshare.net",
  "academia.edu",
  // Login-walled sites
  "linkedin.com",
  "medium.com",  // Often paywalled
  // Other unreliable
  "archive.org", // Slow, often times out
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEXT NORMALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SCORING ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const Relevance = {
  /**
   * Score a result against a query
   */
  score(query: string, result: SearchResultItem): number {
    const q = normalize(query);
    const words = q.split(" ").filter(w => w.length > 2);

    const title = normalize(result.title || "");
    const desc = normalize(result.description || "");
    const url = (result.url || "").toLowerCase();

    let score = 0;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TITLE & DESCRIPTION MATCHING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    for (const w of words) {
      if (title.includes(w)) score += WEIGHTS.TITLE_MATCH;
      if (desc.includes(w)) score += WEIGHTS.DESCRIPTION_MATCH;
    }

    // Exact query phrase
    if (title.includes(q) || desc.includes(q)) {
      score += WEIGHTS.EXACT_MATCH;
    }

    // Partial phrase match
    if (q.length > 4 && (title.includes(q.slice(0, 4)) || desc.includes(q.slice(0, 4)))) {
      score += WEIGHTS.PARTIAL_MATCH;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FRESHNESS BONUS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (result.age) {
      const age = result.age.toLowerCase();

      if (/minute/.test(age)) score += WEIGHTS.FRESH_MINUTES;
      else if (/hour/.test(age)) score += WEIGHTS.FRESH_HOURS;
      else if (/day/.test(age)) score += WEIGHTS.FRESH_DAYS;
      else if (/week/.test(age)) score += WEIGHTS.FRESH_WEEKS;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // YEAR BONUS (2024/2025/2026)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const currentYear = new Date().getFullYear();
    const yearCandidates = [currentYear - 1, currentYear, currentYear + 1];

    for (const y of yearCandidates) {
      if (title.includes(String(y)) || desc.includes(String(y))) {
        score += WEIGHTS.YEAR_MATCH;
        break;
      }
    }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TRUSTED SOURCE BONUS (Context-Aware)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Detect if query is LOCAL_BUSINESS type
    const localBusinessKeywords = [
      'theatre', 'theater', 'cinema', 'movie', 'multiplex', 'pvr', 'inox',
      'restaurant', 'hotel', 'cafe', 'dhaba', 'food', 'khana',
      'hospital', 'clinic', 'doctor', 'medical', 'pharmacy',
      'shop', 'mall', 'store', 'market',
      'atm', 'bank', 'petrol', 'pump'
    ];
    
    const isLocalBusinessQuery = localBusinessKeywords.some(kw => q.includes(kw));
    
    // HIGH PRIORITY: Local Business domains for local queries
    if (isLocalBusinessQuery) {
      for (const domain of LOCAL_BUSINESS_DOMAINS) {
        if (url.includes(domain)) {
          score += WEIGHTS.TRUSTED_SOURCE * 3; // Triple bonus!
          break;
        }
      }
    }
    
    // General trusted sources
    for (const domain of TRUSTED_DOMAINS) {
      if (url.includes(domain)) {
        score += WEIGHTS.TRUSTED_SOURCE;
        break;
      }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PENALTIES (IMPORTANT)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Penalty: Clickbait / low quality
    for (const bad of LOW_QUALITY_DOMAINS) {
      if (url.includes(bad)) {
        score += WEIGHTS.PENALTY_CLICKBAIT;
      }
    }

    // v3.4: Penalty: Unreliable domains (often fail to fetch)
    for (const unreliable of UNRELIABLE_DOMAINS) {
      if (url.includes(unreliable)) {
        score += WEIGHTS.PENALTY_UNRELIABLE;
        break; // Only apply once
      }
    }

    // Penalty: Completely irrelevant titles (no keyword overlap)
    let hasKeywordMatch =
      words.some(w => title.includes(w) || desc.includes(w));

    if (!hasKeywordMatch) {
      score += WEIGHTS.PENALTY_IRRELEVANT;
    }

    return score;
  },

  /**
   * Select best result
   */
  best(query: string, results: SearchResultItem[]): SearchResultItem | null {
    if (!results?.length) return null;

    let best = results[0];
    let bestScore = this.score(query, best);

    for (let i = 1; i < results.length; i++) {
      const s = this.score(query, results[i]);
      if (s > bestScore) {
        best = results[i];
        bestScore = s;
      }
    }

    return best;
  },

  /**
   * Rank all results by score
   */
  rank(query: string, results: SearchResultItem[]) {
    return results
      .map(r => ({ ...r, score: this.score(query, r) }))
      .sort((a, b) => b.score - a.score);
  },

  /**
   * Top N results for debugging or UI
   */
  topN(query: string, results: SearchResultItem[], n = 3) {
    return this.rank(query, results).slice(0, n);
  },
};