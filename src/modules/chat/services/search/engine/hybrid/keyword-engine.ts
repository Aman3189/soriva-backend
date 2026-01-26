/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.0 - HYBRID KEYWORD ENGINE (REFINED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/engine/hybrid/keyword-engine.ts
 *
 * Hybrid Detection = Semantic Vector Score + Fuzzy Jaro-Winkler.
 * Zero token cost — fully local, deterministic, stable.
 *
 * Domain detection output guides:
 * - Query routing
 * - Freshness policy
 * - WebFetch decision
 *
 * This refined version prevents false positives and increases
 * classification accuracy significantly.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import natural from "natural";
import { SearchDomain } from "../../core/data";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NORMALIZER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOMAIN DEFINITIONS (Semantic Vectors + High-signal Keywords)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DomainDef {
  vector: string[];
  keywords: string[];
}

const Domains: Record<SearchDomain, DomainDef> = {
  festival: {
    vector: [
      "festival","tyohar","utsav","panchami","ekadashi","purnima",
      "amavasya","jayanti","vrat","hindu","puja","basant",
      "diwali","holi","navratri","durga","ganesh","shivratri",
      "janmashtami","ram navami"
    ],
    keywords: [
      "festival","tyohar","utsav","panchami","ekadashi","amavasya",
      "purnima","basant","jayanti","vrat","puja","holi","diwali",
      "eid","christmas","navratri","shivratri","ganesh","durga"
    ]
  },

  sports: {
    vector: [
      "sports","match","score","live","cricket","ipl","football",
      "innings","toss","team","player","tournament","world cup"
    ],
    keywords: [
      "match","score","cricket","ipl","football","toss","innings",
      "playing xi","odi","t20","test","kabaddi","hockey","tennis"
    ]
  },

  finance: {
    vector: [
      "stock","market","finance","nifty","sensex","price","share",
      "crypto","bitcoin","gold","rupee","dollar","investment"
    ],
    keywords: [
      "sensex","nifty","price","stock","share","crypto","bitcoin",
      "rupee","dollar","gold","silver","petrol","diesel"
    ]
  },

  news: {
    vector: [
      "news","breaking","headline","update","incident","accident",
      "report","government","politics","election","weather"
    ],
    keywords: [
      "news","breaking","headline","update","incident","khabar",
      "election","government","minister","pm","cm"
    ]
  },

  entertainment: {
    vector: [
      "movie","film","actor","actress","ott","imdb","rating","review",
      "trailer","cinema","series","netflix","amazon","hotstar"
    ],
    keywords: [
      "movie","film","web series","trailer","imdb","ott",
      "box office","rating","review","netflix","amazon prime"
    ]
  },

  weather: {
    vector: [
      "weather","temperature","forecast","rain","humidity","storm",
      "mausam","barish","garmi","sardi","climate","heatwave"
    ],
    keywords: [
      "weather","mausam","temperature","forecast","rain","barish",
      "humidity","storm","garmi","sardi","thand"
    ]
  },

  general: {
    vector: [],
    keywords: []
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function semanticScore(query: string, domainWords: string[]): number {
  const words = normalize(query).split(" ");
  let score = 0;

  for (const w of words) {
    if (w.length > 2 && domainWords.includes(w)) {
      score += 1;
    }
  }
  return score;
}

function fuzzyScore(query: string, keywords: string[]): number {
  const tokens = normalize(query).split(" ");
  let score = 0;

  for (const k of keywords) {
    if (query.includes(k)) {
      score += 3;
      continue;
    }

    for (const t of tokens) {
      const sim = natural.JaroWinklerDistance(t, k);

      if (sim > 0.88) score += 2;
      else if (sim > 0.75) score += 1;
    }
  }

  return score;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HYBRID ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HybridKeywordEngine = {
  /**
   * Main domain classification method
   */
  detect(query: string): SearchDomain {
    const q = normalize(query);

    if (!q || q.length < 2) return "general";

    const scores: Record<SearchDomain, number> = {
      festival: 0, sports: 0, finance: 0,
      news: 0, entertainment: 0, weather: 0, general: 0
    };

    (Object.keys(Domains) as SearchDomain[]).forEach(domain => {
      const d = Domains[domain];

      const sem = semanticScore(q, d.vector);
      const fuz = fuzzyScore(q, d.keywords);

      // Weighted scoring
      scores[domain] = (sem * 2) + fuz;
    });

    // Select highest scoring domain
    let best: SearchDomain = "general";
    let max = 0;

    for (const domain of Object.keys(scores) as SearchDomain[]) {
      const s = scores[domain];
      if (s > max) {
        best = domain;
        max = s;
      }
    }

    // Threshold to prevent false positives
    if (max < 3) return "general";

    return best;
  },

  /**
   * Debug method: return raw scores
   */
  getAllScores(query: string): Record<string, number> {
    const q = normalize(query);
    const result: Record<string, number> = {};

    (Object.keys(Domains) as SearchDomain[]).forEach(domain => {
      const d = Domains[domain];
      const sem = semanticScore(q, d.vector);
      const fuz = fuzzyScore(q, d.keywords);
      result[domain] = (sem * 2) + fuz;
    });

    return result;
  },

  /**
   * Should perform search?
   * (Avoids greetings and useless queries)
   */
  needsSearch(query: string): boolean {
    return this.detect(query) !== "general";
  }
};