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
  /**
   * Anchor keywords — domain-defining terms with overwhelming weight.
   * If ANY anchor matches the query, domain score gets a massive boost
   * that overrides weaker signals from other domains.
   *
   * Example: "cinema" in query → entertainment anchors,
   * regardless of "silver" triggering finance keywords.
   *
   * This is pattern-based, NOT name-based. No hardcoded brand names.
   */
  anchors?: string[];
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
    ],
    anchors: [
      "diwali","holi","navratri","shivratri","janmashtami",
      "eid","christmas","ganesh chaturthi","ram navami"
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
    ],
    anchors: [
      "cricket","ipl","football","kabaddi","hockey","tennis",
      "world cup","playing xi","innings","odi","t20"
    ]
  },

  finance: {
    vector: [
      "stock","market","finance","nifty","sensex","price","share",
      "crypto","bitcoin","gold","rupee","dollar","investment",
      "silver","trading","mutual fund","sip"
    ],
    keywords: [
      "sensex","nifty","stock","share","crypto","bitcoin",
      "rupee","dollar","gold","petrol","diesel",
      "trading","mutual fund","sip","demat"
    ],
    anchors: [
      "sensex","nifty","crypto","bitcoin","demat","mutual fund","sip"
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
      "trailer","cinema","cinemas","series","netflix","amazon","hotstar",
      "theatre","theater","multiplex","showtime","showtimes","screening",
      "movie hall","bollywood","hollywood","tollywood","kollywood",
      "box office","premiere","filmfare","oscar","song","album"
    ],
    keywords: [
      "movie","film","web series","trailer","imdb","ott",
      "box office","rating","review","netflix","amazon prime",
      "cinema","cinemas","theatre","theater","multiplex",
      "showtime","showtimes","screening","movie hall","ticket booking",
      "bollywood","hollywood","tollywood","premiere","filmfare",
      "songs","album","playlist","drama","episode","season"
    ],
    anchors: [
      "cinema","cinemas","theatre","theater","multiplex",
      "showtime","showtimes","screening","movie hall","ticket booking",
      "bollywood","hollywood","tollywood","filmfare"
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
    ],
    anchors: [
      "weather","mausam","forecast","heatwave","barish"
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

/**
 * Anchor score — domain-defining keywords that override weaker signals.
 *
 * If ANY anchor phrase is found in the normalized query, it returns a
 * massive score (10 per anchor hit). This ensures that "cinema" in a
 * query will ALWAYS push entertainment above finance, regardless of
 * other words like "silver" triggering finance keywords.
 *
 * Uses substring match on the full query string so multi-word anchors
 * like "ticket booking" and "movie hall" work correctly.
 */
function anchorScore(query: string, anchors: string[]): number {
  if (!anchors || anchors.length === 0) return 0;

  let score = 0;

  for (const anchor of anchors) {
    if (query.includes(anchor)) {
      score += 10;
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
      const anc = anchorScore(q, d.anchors || []);

      // Weighted scoring: semantic*2 + fuzzy + anchor boost
      scores[domain] = (sem * 2) + fuz + anc;
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
      const anc = anchorScore(q, d.anchors || []);
      result[domain] = (sem * 2) + fuz + anc;
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