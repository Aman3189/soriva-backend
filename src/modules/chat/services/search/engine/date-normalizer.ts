/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.0 - DATE NORMALIZER (REFINED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/engine/date-normalizer.ts
 *
 * Fully IST-aware Hinglish date extractor.
 * Supports:
 * - aaj, kal (future/past), parso, narso
 * - day after tomorrow
 * - beeta kal, guzra kal
 * - next week / last week
 * - this month / next month
 * - upcoming / aane wala
 * - this weekend / next weekend
 * Outputs:
 *   { date: "2026-01-24", human: "24 January 2026", keyword: "today" }
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { DateCore, DateInfo } from "../core/data";

export const DateNormalizer = {
  /**
   * Normalize Hinglish date references into real IST dates
   */
  normalize(query: string): DateInfo | null {
    const q = query.toLowerCase();
    const now = DateCore.getIST();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TODAY / AAJ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(today|aaj|abhi|filhaal|is\swakt)\b/.test(q)) {
      return this.build(now, "today");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TOMORROW (kal = future)
    // Condition: If “kal” appears WITHOUT past indicators
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const hasKal = /\bkal\b/.test(q);
    const kalPastMarkers = /(beeta|beete|guzra|guzre|pichla|pichle|yesterday)/;

    if (/\btomorrow\b/.test(q) || (hasKal && !kalPastMarkers.test(q))) {
      return this.build(DateCore.addDays(now, 1), "tomorrow");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // YESTERDAY (beeta kal / guzra kal / yesterday)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(yesterday|beeta\s*kal|guzra\s*kal|pichla\s*din)\b/.test(q)) {
      return this.build(DateCore.addDays(now, -1), "yesterday");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PARSO (+2 days)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(parso|parson|day\s*after\s*tomorrow)\b/.test(q)) {
      return this.build(DateCore.addDays(now, 2), "parso");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NARSO (+3 days)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(narso|narson|tarso)\b/.test(q)) {
      return this.build(DateCore.addDays(now, 3), "narso");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // THIS WEEKEND
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(this\s*weekend|is\s*weekend)\b/.test(q)) {
      const d = this.nextSaturday(now);
      return this.build(d, "this-weekend");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NEXT WEEKEND
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(next\s*weekend)\b/.test(q)) {
      const d = this.nextSaturday(DateCore.addDays(now, 7));
      return this.build(d, "next-weekend");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NEXT WEEK / AGLE HAFTE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(next\s*week|agle\s*hafte|agla\s*hafta)\b/.test(q)) {
      return this.build(DateCore.addDays(now, 7), "next-week");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAST WEEK / PICHLE HAFTE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(last\s*week|pichle\s*hafte|pichla\s*hafta)\b/.test(q)) {
      return this.build(DateCore.addDays(now, -7), "last-week");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // THIS MONTH / IS MAHINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(this\s*month|is\s*mahine|is\s*maah)\b/.test(q)) {
      return {
        date: DateCore.fmt(now),
        human: `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`,
        keyword: "this-month",
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NEXT MONTH / AGLE MAHINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(next\s*month|agle\s*mahine)\b/.test(q)) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + 1);
      return {
        date: DateCore.fmt(d),
        human: `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`,
        keyword: "next-month",
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UPCOMING / AANE WALA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(upcoming|aanewala|aane\s*wala|coming)\b/.test(q)) {
      return this.build(now, "upcoming");
    }

    return null; // no date detected
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  build(date: Date, keyword: string): DateInfo {
    return {
      date: DateCore.fmt(date),
      human: DateCore.human(date),
      keyword,
    };
  },

  nextSaturday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const offset = (6 - day + 7) % 7 || 7;
    return DateCore.addDays(d, offset);
  },

  hasDateReference(query: string): boolean {
    return this.normalize(query) !== null;
  },

  getCurrentDate(): DateInfo {
    const now = DateCore.getIST();
    return this.build(now, "today");
  },
};