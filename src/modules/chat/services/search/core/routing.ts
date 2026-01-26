/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.0 - ROUTING (REFINED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/core/routing.ts
 *
 * Maps detected domains → optimized Brave search route
 * Applies:
 * - smart suffixes
 * - freshness conditions
 * - domain-specific result counts
 * - WebFetch policy
 *
 * Lightweight, pure, dependency-free engine.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { SearchDomain, SearchRoute } from "./data";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOMAIN → ROUTE MAP (1-to-1 for now, but scalable)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DOMAIN_ROUTE_MAP: Record<SearchDomain, SearchRoute> = {
  festival: "festival",
  sports: "sports",
  finance: "finance",
  news: "news",
  entertainment: "entertainment",
  weather: "weather",
  general: "general",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE SUFFIXES (OPTIMIZES BRAVE QUERY)
// Must be short, high-signal, low-noise.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ROUTE_SUFFIXES: Record<SearchRoute, string> = {
  festival: "festival date significance rituals",
  sports: "latest live score result update",
  finance: "price today rate update market trend",
  news: "news today latest breaking update",
  entertainment: "release date cast rating review imdb",
  weather: "weather forecast temperature today",
  general: "",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESULT COUNT RECOMMENDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RESULT_COUNT: Record<SearchDomain, number> = {
  sports: 3,
  finance: 3,
  news: 5,
  entertainment: 5,
  festival: 3,
  weather: 2,
  general: 5,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FRESHNESS RULES
// Sports/Finance/News/Weather generally need fresh data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FRESH_DOMAINS = new Set<SearchDomain>([
  "sports",
  "finance",
  "news",
  "weather",
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIME-SENSITIVE DOMAINS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIME_SENSITIVE = new Set<SearchDomain>([
  "sports",
  "finance",
  "news",
  "weather",
  "festival",
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEBFETCH POLICY
// WebFetch SHOULD NOT be used for:
/// - Sports (mostly scores, small snippets)
//  - Finance (small price data)
// Weather also returns short single info.
//
// WebFetch SHOULD be used for:
// - Entertainment (reviews)
// - News (articles)
// - Festival (meaning, significance)
// - General (Wikipedia-like)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WEBFETCH_ALLOWED = new Set<SearchDomain>([
  "entertainment",
  "news",
  "festival",
  "general",
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTING SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const Routing = {
  /**
   * Map detected domain → route
   */
  mapDomainToRoute(domain: string): SearchRoute {
    return DOMAIN_ROUTE_MAP[domain as SearchDomain] ?? "general";
  },

  /**
   * Get the optimized suffix for Brave query
   */
  getSuffix(route: SearchRoute): string {
    return ROUTE_SUFFIXES[route] ?? "";
  },

  /**
   * Whether freshness matters (sports/finance/news/weather)
   */
  needsFreshData(domain: string): boolean {
    return FRESH_DOMAINS.has(domain as SearchDomain);
  },

  /**
   * Whether domain is time-sensitive (affects query building)
   */
  isTimeSensitive(domain: string): boolean {
    return TIME_SENSITIVE.has(domain as SearchDomain);
  },

  /**
   * Recommended Brave result count
   */
  getResultCount(domain: string): number {
    return RESULT_COUNT[domain as SearchDomain] ?? 5;
  },

  /**
   * Should we run WebFetch for this domain?
   */
  shouldWebFetch(domain: string): boolean {
    return WEBFETCH_ALLOWED.has(domain as SearchDomain);
  },
};