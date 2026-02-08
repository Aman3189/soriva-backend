/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.2.1 - ROUTING (CRITICAL SUFFIX FIX)
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
 * v3.2.1 CRITICAL FIX (Feb 2026):
 * ⚠️ getSuffix() now accepts DOMAIN, not route!
 * 
 * BEFORE (BUG):
 *   domain="tech" → route="general" → getSuffix("general") → "" ❌
 *   Tech suffix LOST! Query optimization broken!
 * 
 * AFTER (FIXED):
 *   domain="tech" → getSuffix("tech") → "technology latest gadgets..." ✅
 *   Suffix preserved regardless of route mapping!
 *
 * v3.2 CHANGES (Feb 2026):
 * ✅ Added tech domain (HybridKeywordEngine outputs this)
 * ✅ Added government domain (HybridKeywordEngine outputs this)
 * ✅ Tech suffix: "technology latest gadgets review comparison specs"
 * ✅ Government suffix: "sarkari yojana scheme policy notification rules update"
 * ✅ Tech added to FRESH_DOMAINS (fast-changing news)
 * ✅ Tech & Government added to TIME_SENSITIVE
 * ✅ Tech & Government added to WEBFETCH_ALLOWED
 * ✅ Full alignment with HybridKeywordEngine.detect() output domains
 *
 * v3.1 CHANGES (Feb 2026):
 * ✅ Added missing domains: health, food, travel, education, local
 * ✅ Synced with SORIVA v7.0 FRESHNESS_MAP
 * ✅ Updated WebFetch policy for health domain
 * ✅ Added suffixes for new domains
 *
 * Lightweight, pure, dependency-free engine.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { SearchDomain, SearchRoute } from "./data";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXTENDED DOMAIN TYPE (Synced with SORIVA v7.0 + HybridKeywordEngine)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ExtendedDomain = SearchDomain | 'health' | 'food' | 'travel' | 'education' | 'local' | 'tech' | 'government';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOMAIN → ROUTE MAP (Extended for v7.0 + HybridKeywordEngine compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DOMAIN_ROUTE_MAP: Record<ExtendedDomain, SearchRoute> = {
  // Original domains
  festival: "festival",
  sports: "sports",
  finance: "finance",
  news: "news",
  entertainment: "entertainment",
  weather: "weather",
  general: "general",
  // v7.0 additions
  health: "general",      // Maps to general route but with health-specific handling
  food: "general",
  travel: "general",
  education: "general",
  local: "general",
  // v3.2 additions (HybridKeywordEngine outputs these)
  tech: "general",        // Technology queries → general route with tech suffix
  government: "general",  // Sarkari/govt queries → general route with govt suffix
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE SUFFIXES (OPTIMIZES BRAVE QUERY)
// Must be short, high-signal, low-noise.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ROUTE_SUFFIXES: Record<ExtendedDomain, string> = {
  // Original domains
  festival: "festival date significance rituals",
  sports: "latest live score result update",
  finance: "price today rate update market trend",
  news: "news today latest breaking update",
  entertainment: "release date cast rating review imdb",
  weather: "weather forecast temperature today",
  general: "",
  // v7.0 additions - domain-specific suffixes
  health: "symptoms treatment medicine dosage side effects",
  food: "recipe restaurant near me review rating",
  travel: "travel guide places to visit booking",
  education: "course syllabus admission eligibility",
  local: "near me address contact timings",
  // v3.2 additions - tech & government suffixes
  tech: "technology latest gadgets review comparison specs",
  government: "sarkari yojana scheme policy notification rules update",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESULT COUNT RECOMMENDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RESULT_COUNT: Record<ExtendedDomain, number> = {
  // Original domains
  sports: 3,
  finance: 3,
  news: 5,
  entertainment: 5,
  festival: 3,
  weather: 2,
  general: 5,
  // v7.0 additions
  health: 5,      // More results for health (important topic)
  food: 5,
  travel: 5,
  education: 5,
  local: 3,
  // v3.2 additions
  tech: 5,        // Tech reviews need multiple sources
  government: 5,  // Govt schemes need comprehensive info
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FRESHNESS RULES (Synced with SORIVA v7.0 FRESHNESS_MAP)
// Sports/Finance/News/Weather generally need fresh data
// Health/Food/Travel/Education don't need freshness filter
// Tech needs freshness for latest gadget news
// Government may need freshness for new schemes/notifications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FRESH_DOMAINS = new Set<ExtendedDomain>([
  "sports",
  "finance",
  "news",
  "weather",
  "tech",         // Tech news changes fast (new launches, updates)
  // Note: health, food, travel, education, local, government DON'T need strict freshness
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIME-SENSITIVE DOMAINS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIME_SENSITIVE = new Set<ExtendedDomain>([
  "sports",
  "finance",
  "news",
  "weather",
  "festival",
  "tech",         // Tech launches are time-sensitive
  "government",   // Govt notifications have deadlines
  // Note: health, food, travel, education are NOT time-sensitive
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEBFETCH POLICY (Updated for v7.0 + v3.2)
// WebFetch SHOULD NOT be used for:
// - Sports (mostly scores, small snippets)
// - Finance (small price data)
// - Weather (short single info)
// - Local (just addresses/timings)
//
// WebFetch SHOULD be used for:
// - Entertainment (reviews, articles)
// - News (full articles)
// - Festival (meaning, significance)
// - General (Wikipedia-like)
// - Health (medical articles, detailed info) ← v7.0 addition
// - Food (recipes need full content)
// - Travel (guides need detail)
// - Education (course info, syllabi)
// - Tech (detailed reviews, comparisons) ← v3.2 addition
// - Government (full scheme details, eligibility) ← v3.2 addition
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WEBFETCH_ALLOWED = new Set<ExtendedDomain>([
  "entertainment",
  "news",
  "festival",
  "general",
  // v7.0 additions
  "health",       // Medical articles need deep content
  "food",         // Recipes need full instructions
  "travel",       // Travel guides need detail
  "education",    // Course info needs detail
  // v3.2 additions
  "tech",         // Tech reviews need detailed specs/comparisons
  "government",   // Govt schemes need full eligibility/process details
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTING SERVICE (v3.2 - Full HybridKeywordEngine domain support)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const Routing = {
  /**
   * Map detected domain → route
   * Now supports extended domains from SORIVA v7.0
   */
  mapDomainToRoute(domain: string): SearchRoute {
    return DOMAIN_ROUTE_MAP[domain as ExtendedDomain] ?? "general";
  },

  /**
   * Get the optimized suffix for Brave query
   * 
   * ⚠️ CRITICAL FIX v3.2.1:
   * This method now accepts DOMAIN (not route!)
   * Because: domain="tech" → route="general" → suffix should be tech's, not general's
   * 
   * @param domain - The detected domain from HybridKeywordEngine (e.g., "tech", "health")
   * @returns Domain-specific suffix for query optimization
   */
  getSuffix(domain: string): string {
    // Direct domain lookup - domain IS the key, not route
    return ROUTE_SUFFIXES[domain as ExtendedDomain] ?? "";
  },

  /**
   * @deprecated Use getSuffix(domain) instead
   * Legacy method for backward compatibility
   */
  getSuffixByRoute(route: string): string {
    return ROUTE_SUFFIXES[route as SearchRoute] ?? "";
  },

  /**
   * Whether freshness matters (sports/finance/news/weather/tech)
   * Health/Food/Travel/Education DON'T need freshness
   */
  needsFreshData(domain: string): boolean {
    return FRESH_DOMAINS.has(domain as ExtendedDomain);
  },

  /**
   * Whether domain is time-sensitive (affects query building)
   */
  isTimeSensitive(domain: string): boolean {
    return TIME_SENSITIVE.has(domain as ExtendedDomain);
  },

  /**
   * Recommended Brave result count
   * Health gets 5 results (important topic)
   */
  getResultCount(domain: string): number {
    return RESULT_COUNT[domain as ExtendedDomain] ?? 5;
  },

  /**
   * Should we run WebFetch for this domain?
   * v3.2: Tech & Government also allow WebFetch
   */
  shouldWebFetch(domain: string): boolean {
    return WEBFETCH_ALLOWED.has(domain as ExtendedDomain);
  },

  /**
   * v3.2: Get all supported domains
   */
  getSupportedDomains(): string[] {
    return Object.keys(DOMAIN_ROUTE_MAP);
  },

  /**
   * v3.2: Check if domain is supported
   */
  isDomainSupported(domain: string): boolean {
    return domain in DOMAIN_ROUTE_MAP;
  },
};