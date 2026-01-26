/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.0 - KEYWORDS (REFINED FALLBACK ENGINE)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/core/keywords.ts
 *
 * This is NOT the main classifier (Hybrid Engine handles that).
 * These keywords act as:
 * - supplementary fallback detectors
 * - category scoring hints
 * - safety net when ambiguous
 *
 * Zero token cost, fast, and extremely stable.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Cleaner, safer, no-overlap keyword map.
 */
export const Keywords = {
  FESTIVAL: [
    "festival", "tyohar", "utsav", "jayanti",
    "panchami", "ekadashi", "purnima", "amavasya",
    "sankranti", "chaturthi",
    "diwali", "holi", "navratri", "durga puja",
    "ganesh chaturthi", "eid", "christmas",
    "ram navami", "janmashtami", "shivratri"
  ],

  SPORTS: [
    "match", "score", "cricket", "football", "ipl",
    "innings", "playing xi", "winner", "toss",
    "odi", "t20", "test match", "kabaddi", "hockey",
    "tennis", "badminton", "world cup"
  ],

  FINANCE: [
    "price", "stock", "share", "market",
    "sensex", "nifty", "crypto", "bitcoin",
    "gold", "silver", "rupee", "dollar",
    "petrol", "diesel", "mutual fund", "investment"
  ],

  NEWS: [
    "news", "headline", "breaking", "update",
    "incident", "accident", "election", "government",
    "minister", "pm", "cm", "earthquake", "flood",
    "weather news", "storm", "announcement"
  ],

  ENTERTAINMENT: [
    "movie", "film", "trailer", "imdb", "rating",
    "ott", "web series", "netflix", "amazon prime",
    "hotstar", "actor", "actress", "song", "album",
    "box office", "collection", "release"
  ],

  WEATHER: [
    "weather", "mausam", "temperature",
    "barish", "rain", "humidity",
    "garmi", "sardi", "forecast", "andhi",
    "dust storm", "heatwave"
  ],

  DATE: [
    "aaj", "today", "kal", "tomorrow", "yesterday",
    "parso", "narso", "recent", "latest",
    "current", "now", "abhi"
  ]
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Clean normalize text for broader matching
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if a category keyword exists in query
 */
export function hasKeyword(
  query: string,
  category: keyof typeof Keywords
): boolean {
  const q = normalize(query);
  return Keywords[category].some(keyword => q.includes(keyword));
}

/**
 * Detect all matching keyword categories
 * Returns a list of fallback possible domains
 */
export function detectCategories(query: string): string[] {
  const q = normalize(query);
  const matches: string[] = [];

  for (const [category, list] of Object.entries(Keywords)) {
    if (list.some(k => q.includes(k))) {
      matches.push(category.toLowerCase());
    }
  }

  return matches;
}

/**
 * Weighted category scoring (useful if hybrid engine future evolves)
 * Example output:
 * { festival: 2, news: 1 }
 */
export function scoreCategories(query: string): Record<string, number> {
  const q = normalize(query);
  const scores: Record<string, number> = {};

  for (const [category, list] of Object.entries(Keywords)) {
    let score = 0;
    for (const k of list) {
      if (q.includes(k)) score++;
    }
    if (score > 0) scores[category.toLowerCase()] = score;
  }

  return scores;
}