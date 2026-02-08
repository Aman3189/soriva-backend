/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v4.0 - CORE DATA UTILITIES (ENTERPRISE GRADE)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/core/data.ts
 *
 * Provides:
 * - IST-aware datetime utilities
 * - Strong search domain typing (14 domains)
 * - Shared interfaces for Brave, WebFetch, Relevance, Orchestrator
 *
 * v4.0 CHANGES (Feb 2026):
 * ✅ Extended SearchDomain from 7 → 14 domains
 * ✅ Added: health, food, travel, education, local, tech, government
 * ✅ Synced with routing.ts v3.2.1 and keyword-engine.ts v4.0
 *
 * This module is intentionally light, dependency-free, and 
 * performance-optimized. Used across all Soriva Search engines.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE CORE — IST Utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DateCore = {
  /**
   * Current IST time
   */
  getIST(): Date {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    return new Date(utc + IST_OFFSET);
  },

  /**
   * Format: YYYY-MM-DD
   */
  fmt(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  },

  /**
   * Format: "24 January 2026"
   */
  human(date: Date): string {
    const m = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    return `${date.getDate()} ${m[date.getMonth()]} ${date.getFullYear()}`;
  },

  /**
   * Format short: "24 Jan 2026"
   */
  humanShort(date: Date): string {
    const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${date.getDate()} ${m[date.getMonth()]} ${date.getFullYear()}`;
  },

  /**
   * Day Name: "Friday"
   */
  dayName(date: Date): string {
    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][
      date.getDay()
    ];
  },

  /**
   * Add N days to date
   */
  addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  /**
   * Whether date is today (IST)
   */
  isToday(date: Date): boolean {
    return this.fmt(date) === this.fmt(this.getIST());
  },

  /**
   * Smart relative label for UI + routing
   *
   * 0 → "today"
   * +1 → "tomorrow"
   * -1 → "yesterday"
   * +2 → "parso"
   * +3 → "narso"
   * (±7 range → "in X days" / "X days ago")
   */
  relative(date: Date): string {
    const today = this.getIST();
    const diff = Math.floor(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "today";
    if (diff === 1) return "tomorrow";
    if (diff === -1) return "yesterday";
    if (diff === 2) return "parso";
    if (diff === 3) return "narso";

    if (diff > 0 && diff <= 7) return `in ${diff} days`;
    if (diff < 0 && diff >= -7) return `${Math.abs(diff)} days ago`;

    // Otherwise full human date
    return this.human(date);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEARCH DOMAINS (v4.0 - Extended to 14 domains)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type SearchDomain =
  // Core domains (original)
  | "festival"
  | "sports"
  | "finance"
  | "news"
  | "entertainment"
  | "weather"
  // Extended domains (v4.0)
  | "health"
  | "food"
  | "travel"
  | "education"
  | "local"
  | "tech"
  | "government"
  // Fallback
  | "general";

// Route type = same as domain (1:1 mapping for now)
export type SearchRoute = 
  | "festival"
  | "sports"
  | "finance"
  | "news"
  | "entertainment"
  | "weather"
  | "general";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOMAIN LISTS (For iteration/validation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ALL_DOMAINS: SearchDomain[] = [
  "festival", "sports", "finance", "news", "entertainment", "weather",
  "health", "food", "travel", "education", "local", "tech", "government",
  "general"
];

export const CORE_DOMAINS: SearchDomain[] = [
  "festival", "sports", "finance", "news", "entertainment", "weather", "general"
];

export const EXTENDED_DOMAINS: SearchDomain[] = [
  "health", "food", "travel", "education", "local", "tech", "government"
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESULT INTERFACES (Shared across modules)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Brave Search Result Item (raw)
 */
export interface SearchResultItem {
  title: string;
  url: string;
  description: string;
  age?: string; // e.g., "2 hours ago"
}

/**
 * Normalized Date Info for Soriva Query Routing
 */
export interface DateInfo {
  date: string;      // "2026-01-24"
  human: string;     // "24 January 2026"
  keyword: string;   // "today", "parso", "narso", etc.
}