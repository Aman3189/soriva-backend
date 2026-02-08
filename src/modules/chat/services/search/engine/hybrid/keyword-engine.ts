/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v4.0 - HYBRID KEYWORD ENGINE (ENTERPRISE GRADE)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/engine/hybrid/keyword-engine.ts
 * Created by: Risenex Dynamics Pvt. Ltd.
 * Version: 4.0.0
 *
 * Hybrid Detection = Semantic Vector Score + Fuzzy Jaro-Winkler.
 * Zero token cost — fully local, deterministic, stable.
 *
 * v4.0 CHANGES (Feb 2026):
 * ✅ Extended from 7 → 14 domains
 * ✅ Added: health, food, travel, education, local, tech, government
 * ✅ Comprehensive Hinglish keyword support
 * ✅ Domain-specific anchors for high-precision detection
 * ✅ Synced with routing.ts v3.2.1 and data.ts v4.0
 * ✅ 100% loophole-free domain coverage
 *
 * Domain detection output guides:
 * - Query routing (routing.ts)
 * - Freshness policy (FRESHNESS_MAP)
 * - WebFetch decision (WEBFETCH_ALLOWED)
 * - Google CSE engine selection (SEARCH_ENGINES)
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
// DOMAIN DEFINITIONS (14 Domains - Enterprise Grade)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DomainDef {
  vector: string[];      // Semantic words for broad matching
  keywords: string[];    // Exact/fuzzy match keywords
  anchors?: string[];    // High-confidence domain-defining terms (10x weight)
}

const Domains: Record<SearchDomain, DomainDef> = {
  // ─────────────────────────────────────────────────────────────
  // CORE DOMAINS (Original 7)
  // ─────────────────────────────────────────────────────────────
  
  festival: {
    vector: [
      "festival", "tyohar", "utsav", "panchami", "ekadashi", "purnima",
      "amavasya", "jayanti", "vrat", "hindu", "puja", "basant",
      "diwali", "holi", "navratri", "durga", "ganesh", "shivratri",
      "janmashtami", "ram navami", "parv", "celebration"
    ],
    keywords: [
      "festival", "tyohar", "utsav", "panchami", "ekadashi", "amavasya",
      "purnima", "basant", "jayanti", "vrat", "puja", "holi", "diwali",
      "eid", "christmas", "navratri", "shivratri", "ganesh", "durga",
      "rakhi", "raksha bandhan", "bhai dooj", "karwa chauth", "lohri",
      "baisakhi", "onam", "pongal", "ugadi", "chhath", "guru purab"
    ],
    anchors: [
      "diwali", "holi", "navratri", "shivratri", "janmashtami",
      "eid", "christmas", "ganesh chaturthi", "ram navami",
      "durga puja", "raksha bandhan", "karwa chauth"
    ]
  },

  sports: {
    vector: [
      "sports", "match", "score", "live", "cricket", "ipl", "football",
      "innings", "toss", "team", "player", "tournament", "world cup",
      "khel", "kheladi", "jeet", "haar", "final", "semi final"
    ],
    keywords: [
      "match", "score", "cricket", "ipl", "football", "toss", "innings",
      "playing xi", "odi", "t20", "test", "kabaddi", "hockey", "tennis",
      "badminton", "fifa", "world cup", "olympics", "asian games",
      "bcci", "icc", "rcb", "csk", "mi", "kkr", "srh", "dc", "gt", "lsg",
      "premier league", "la liga", "nba", "wwe", "ufc", "boxing"
    ],
    anchors: [
      "cricket", "ipl", "football", "kabaddi", "hockey", "tennis",
      "world cup", "playing xi", "innings", "odi", "t20", "fifa",
      "olympics", "bcci", "icc"
    ]
  },

  finance: {
    vector: [
      "stock", "market", "finance", "nifty", "sensex", "price", "share",
      "crypto", "bitcoin", "gold", "rupee", "dollar", "investment",
      "silver", "trading", "mutual fund", "sip", "paisa", "daam"
    ],
    keywords: [
      "sensex", "nifty", "stock", "share", "crypto", "bitcoin", "ethereum",
      "rupee", "dollar", "gold", "petrol", "diesel", "lpg",
      "trading", "mutual fund", "sip", "demat", "ipo", "dividend",
      "loan", "emi", "interest rate", "rbi", "tax", "gst", "itr",
      "sone ka bhav", "chandi", "forex", "exchange rate"
    ],
    anchors: [
      "sensex", "nifty", "crypto", "bitcoin", "demat", "mutual fund", "sip",
      "stock market", "share price", "gold price", "petrol price"
    ]
  },

  news: {
    vector: [
      "news", "breaking", "headline", "update", "incident", "accident",
      "report", "politics", "election", "khabar", "samachar", "viral"
    ],
    keywords: [
      "news", "breaking", "headline", "update", "incident", "khabar",
      "election", "minister", "pm", "cm", "parliament", "lok sabha",
      "rajya sabha", "protest", "strike", "hartal", "andolan",
      "viral", "trending", "latest", "aaj ki khabar"
    ],
    anchors: [
      "breaking news", "latest news", "aaj ki khabar", "election",
      "parliament", "lok sabha"
    ]
  },

  entertainment: {
    vector: [
      "movie", "film", "actor", "actress", "ott", "imdb", "rating", "review",
      "trailer", "cinema", "cinemas", "series", "netflix", "amazon", "hotstar",
      "theatre", "theater", "multiplex", "showtime", "showtimes", "screening",
      "bollywood", "hollywood", "tollywood", "kollywood", "box office",
      "song", "album", "gaana", "music"
    ],
    keywords: [
      "movie", "film", "web series", "trailer", "imdb", "ott",
      "box office", "rating", "review", "netflix", "amazon prime", "hotstar",
      "cinema", "cinemas", "theatre", "theater", "multiplex",
      "showtime", "showtimes", "screening", "movie hall", "ticket booking",
      "bollywood", "hollywood", "tollywood", "premiere", "filmfare",
      "songs", "album", "playlist", "drama", "episode", "season",
      "gaana", "spotify", "youtube music"
    ],
    anchors: [
      "cinema", "cinemas", "theatre", "theater", "multiplex",
      "showtime", "showtimes", "screening", "movie hall", "ticket booking",
      "bollywood", "hollywood", "tollywood", "filmfare", "imdb rating"
    ]
  },

  weather: {
    vector: [
      "weather", "temperature", "forecast", "rain", "humidity", "storm",
      "mausam", "barish", "garmi", "sardi", "climate", "heatwave", "thand"
    ],
    keywords: [
      "weather", "mausam", "temperature", "forecast", "rain", "barish",
      "humidity", "storm", "garmi", "sardi", "thand", "toofan",
      "heatwave", "cold wave", "monsoon", "winter", "summer",
      "aaj ka mausam", "kal ka mausam"
    ],
    anchors: [
      "weather", "mausam", "forecast", "heatwave", "barish", "toofan",
      "aaj ka mausam", "temperature today"
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // EXTENDED DOMAINS (v4.0 - 7 New Domains)
  // ─────────────────────────────────────────────────────────────

  health: {
    vector: [
      "health", "medical", "doctor", "hospital", "disease", "illness",
      "medicine", "tablet", "dawai", "treatment", "symptoms", "cure",
      "sehat", "bimari", "ilaj", "dawa"
    ],
    keywords: [
      "doctor", "hospital", "clinic", "medicine", "tablet", "dawai",
      "symptoms", "treatment", "disease", "illness", "cure", "therapy",
      "diabetes", "sugar", "bp", "blood pressure", "heart", "cancer",
      "fever", "bukhar", "cold", "cough", "covid", "vaccine",
      "ayurveda", "yoga", "homeopathy", "allopathy",
      "aiims", "apollo", "fortis", "max hospital",
      "side effects", "dosage", "prescription"
    ],
    anchors: [
      "symptoms", "treatment", "medicine", "tablet", "dawai", "doctor",
      "hospital", "disease", "bimari", "ilaj", "side effects", "dosage"
    ]
  },

  food: {
    vector: [
      "food", "recipe", "cook", "restaurant", "khana", "dish", "cuisine",
      "banane ka tarika", "kaise banaye", "ingredients"
    ],
    keywords: [
      "recipe", "cook", "cooking", "banane ka tarika", "kaise banaye",
      "restaurant", "dhaba", "cafe", "bakery",
      "biryani", "curry", "roti", "dal", "sabzi", "paneer", "chicken", "mutton",
      "dessert", "mithai", "cake", "sweet",
      "breakfast", "lunch", "dinner", "snack", "nashta",
      "zomato", "swiggy", "food delivery",
      "vegetarian", "veg", "non veg", "vegan"
    ],
    anchors: [
      "recipe", "banane ka tarika", "kaise banaye", "restaurant",
      "zomato", "swiggy", "food delivery", "ingredients"
    ]
  },

  travel: {
    vector: [
      "travel", "trip", "tour", "hotel", "flight", "booking", "vacation",
      "holiday", "tourist", "destination", "ghoomna", "safar"
    ],
    keywords: [
      "travel", "trip", "tour", "hotel", "flight", "booking", "vacation",
      "holiday", "tourist", "destination", "resort", "homestay",
      "train", "bus", "irctc", "makemytrip", "goibibo", "oyo",
      "places to visit", "tourist places", "ghoomne ki jagah",
      "visa", "passport", "airport", "railway station",
      "beach", "hill station", "temple", "mandir"
    ],
    anchors: [
      "hotel booking", "flight booking", "places to visit", "tourist places",
      "ghoomne ki jagah", "irctc", "makemytrip", "visa", "passport"
    ]
  },

  education: {
    vector: [
      "education", "college", "university", "school", "exam", "admission",
      "course", "degree", "padhai", "study", "syllabus"
    ],
    keywords: [
      "college", "university", "school", "exam", "admission", "entrance",
      "course", "degree", "syllabus", "result", "marks", "grade",
      "jee", "neet", "upsc", "ssc", "cat", "gate", "ias", "ips",
      "engineering", "medical", "mba", "btech", "mbbs",
      "scholarship", "fellowship", "cutoff", "merit list",
      "iit", "nit", "aiims", "bits", "du", "jnu"
    ],
    anchors: [
      "admission", "syllabus", "exam date", "result", "cutoff",
      "jee", "neet", "upsc", "ssc", "entrance exam", "merit list"
    ]
  },

  local: {
    vector: [
      "near me", "nearby", "local", "address", "location", "direction",
      "paas mein", "kahan hai", "timing", "contact"
    ],
    keywords: [
      "near me", "nearby", "paas mein", "kahan hai", "kidhar hai",
      "address", "location", "direction", "route", "map",
      "timing", "timings", "opening hours", "closing time",
      "contact", "phone number", "mobile number",
      "shop", "store", "market", "mall", "showroom",
      "atm", "bank", "petrol pump", "gas station"
    ],
    anchors: [
      "near me", "nearby", "paas mein", "kahan hai", "address",
      "timing", "timings", "contact number", "opening hours"
    ]
  },

  tech: {
    vector: [
      "technology", "phone", "mobile", "laptop", "computer", "gadget",
      "specs", "review", "comparison", "software", "app"
    ],
    keywords: [
      "phone", "mobile", "smartphone", "laptop", "computer", "tablet",
      "specs", "specifications", "review", "comparison", "versus", "vs",
      "iphone", "samsung", "oneplus", "xiaomi", "redmi", "realme",
      "processor", "ram", "storage", "camera", "battery", "display",
      "android", "ios", "windows", "mac", "linux",
      "app", "software", "update", "download", "install",
      "wifi", "bluetooth", "5g", "4g", "internet"
    ],
    anchors: [
      "specs", "specifications", "review", "comparison", "vs",
      "price in india", "launch date", "features",
      "best phone", "best laptop", "which is better"
    ]
  },

  government: {
    vector: [
      "government", "sarkari", "yojana", "scheme", "form", "apply",
      "notification", "vacancy", "recruitment", "naukri"
    ],
    keywords: [
      "sarkari", "government", "yojana", "scheme", "policy",
      "form", "apply", "application", "registration",
      "notification", "circular", "gazette",
      "vacancy", "recruitment", "bharti", "naukri", "job",
      "eligibility", "documents", "deadline", "last date",
      "ration card", "aadhar", "pan card", "passport", "driving license",
      "pm kisan", "ayushman bharat", "mudra loan", "jan dhan"
    ],
    anchors: [
      "sarkari yojana", "government scheme", "apply online",
      "eligibility", "last date", "notification", "vacancy",
      "sarkari naukri", "form bharna", "documents required"
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // FALLBACK
  // ─────────────────────────────────────────────────────────────

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
    // Exact substring match (high confidence)
    if (query.includes(k)) {
      score += 3;
      continue;
    }

    // Fuzzy match per token
    for (const t of tokens) {
      const sim = natural.JaroWinklerDistance(t, k);

      if (sim > 0.88) score += 2;
      else if (sim > 0.75) score += 1;
    }
  }

  return score;
}

/**
 * Anchor score — domain-defining keywords with 10x weight.
 * If ANY anchor phrase matches, domain score gets massive boost.
 * 
 * Example: "diabetes symptoms" → health anchors match → health wins
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
// HYBRID ENGINE (v4.0 - 14 Domain Support)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HybridKeywordEngine = {
  /**
   * Main domain classification method
   * Returns one of 14 domains based on query analysis
   */
  detect(query: string): SearchDomain {
    const q = normalize(query);

    if (!q || q.length < 2) return "general";

    // Initialize scores for all 14 domains
    const scores: Record<SearchDomain, number> = {
      festival: 0, sports: 0, finance: 0, news: 0,
      entertainment: 0, weather: 0, health: 0, food: 0,
      travel: 0, education: 0, local: 0, tech: 0,
      government: 0, general: 0
    };

    // Calculate scores for each domain
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
   * Debug method: return raw scores for all domains
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
   * Get top N domains by score (for debugging/logging)
   */
  getTopDomains(query: string, n: number = 3): Array<{ domain: string; score: number }> {
    const scores = this.getAllScores(query);
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([domain, score]) => ({ domain, score }));
  },

  /**
   * Should perform search?
   * Returns true if query has clear domain intent
   */
  needsSearch(query: string): boolean {
    return this.detect(query) !== "general";
  },

  /**
   * Check if domain is valid
   */
  isValidDomain(domain: string): domain is SearchDomain {
    return domain in Domains;
  },

  /**
   * Get all supported domains
   */
  getSupportedDomains(): SearchDomain[] {
    return Object.keys(Domains) as SearchDomain[];
  }
};