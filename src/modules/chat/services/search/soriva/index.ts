/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v4.4 - MASTER ORCHESTRATOR (Multi-Provider + Quality Check)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/soriva/index.ts
 * 
 * Pipeline:
 * 1. Domain Detection (Hybrid Engine)
 * 2. Festival Shortcut (Calendarific API)
 * 3. Date Normalization (IST-aware)
 * 4. Query Optimization (Hinglish → English, zero LLM cost)
 * 5. Freshness Routing (sports=pd, news=pd, etc.)
 * 6. Multi-Provider Search (Brave → Tavily → Google fallback)
 * 7. Relevance Scoring
 * 8. WebFetch (Deep content extraction)
 * 9. LLM Context Assembly
 *
 * v4.4 CHANGES:
 * ✅ REMOVED: KNOWN_CINEMAS hardcoded regex — cinema detection now via keyword-engine anchors
 * ✅ REMOVED: PROTECTED_NAMES hardcoded regex — query optimizer uses dynamic anchor detection
 * ✅ REMOVED: hasMovieName hardcoded regex — showtime keywords alone handle routing
 * ✅ FIXED: buildQuery ordering — cinema-specific routing no longer blocked by localBiz check
 * ✅ All v4.3 features intact (multi-provider, quality check, rating extraction)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { HybridKeywordEngine } from "../engine/hybrid/keyword-engine";
import { Routing } from "../core/routing";
import { DateNormalizer } from "../engine/date-normalizer";
import { BraveService } from "../services/brave";
import { TavilyService } from "../services/tavily";
import { GoogleService } from "../services/google";
import { Relevance } from "../engine/relevance";
import { WebFetchService } from "../services/webfetch";
import { BrowserlessService } from "../services/browserless";
import { SearchResultItem } from "../core/data";
import { festivalService } from '../../../../../services/calender/festivalService';


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SearchResult {
  fact: string;
  topTitles: string;
  source: "webfetch" | "snippet" | "brave_answer" | "calendarific" | "none";
  bestUrl: string | null;
  domain: string;
  route: string;
  dateInfo: { date: string; human: string; keyword: string } | null;
  braveTimeMs: number;
  fetchTimeMs: number;
  totalTimeMs: number;
  promptTokens: number;
  resultsFound: number;
  queryUsed: string;
  provider: string;
}

export interface SearchOptions {
  userLocation?: string;
  maxContentChars?: number;
  enableWebFetch?: boolean;
}

interface ProviderSearchResult {
  results: SearchResultItem[];
  answer?: string;
  timeMs: number;
  provider: string;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// v4.4: ENTERTAINMENT ANCHOR KEYWORDS
// These are the SAME anchors from keyword-engine.ts — used here to
// detect cinema/theatre queries WITHOUT hardcoded cinema names.
//
// WHY DUPLICATE? Because keyword-engine only returns domain ("entertainment"),
// not WHICH anchor matched. We need to know if "cinema"/"theatre" was the
// trigger to route differently (showtimes vs general entertainment).
//
// This is NOT a hardcoded name list. These are generic category words
// that will work for ANY cinema name: "Galaxy cinema", "Star theatre", etc.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CINEMA_ANCHOR_WORDS = new Set([
  "cinema", "cinemas", "theatre", "theater", "multiplex",
  "showtime", "showtimes", "screening", "movie hall",
]);

const SHOWTIME_KEYWORDS = new Set([
  "lagi", "lagi hai", "lag rahi", "chal rahi", "chal raha",
  "running", "showtime", "showtimes", "playing", "screening",
  "ticket", "book", "kab lagi", "kahan lagi",
  "yahaan", "yahan", "mere shehar", "mere city",
  "aaj", "today", "show", "movie", "film",
  "kaun", "kaunsi", "konsi", "best",
]);

/**
 * Check if query contains cinema/theatre anchor words.
 * Works for ANY cinema name — no hardcoded brand names.
 * "Silverbird cinemas" → true (because "cinemas")
 * "Galaxy theatre" → true (because "theatre")
 * "Pushpa 2 review" → false (no cinema anchor)
 */
function hasCinemaAnchor(query: string): boolean {
  const q = query.toLowerCase();
  for (const anchor of CINEMA_ANCHOR_WORDS) {
    if (q.includes(anchor)) return true;
  }
  return false;
}

/**
 * Check if query has showtime intent.
 * "Silverbird cinemas movies today" → true
 * "what is a cinema" → false
 */
function hasShowtimeIntent(query: string): boolean {
  const q = query.toLowerCase();
  for (const kw of SHOWTIME_KEYWORDS) {
    if (q.includes(kw)) return true;
  }
  return false;
}

/**
 * Extract the venue/movie name from a cinema query by stripping
 * known anchor words and showtime keywords.
 * "Silverbird cinemas movies today" → "Silverbird"
 * "PVR cinema Ferozepur showtime" → "PVR Ferozepur"
 *
 * Dynamic — no hardcoded names. Works by removing what we KNOW
 * (anchors + showtime words) and keeping what we DON'T (the name).
 */
function extractCinemaName(query: string): string {
  let cleaned = query;

  // Remove cinema anchor words
  for (const anchor of CINEMA_ANCHOR_WORDS) {
    cleaned = cleaned.replace(new RegExp(`\\b${anchor}\\b`, "gi"), "");
  }

  // Remove showtime keywords
  for (const kw of SHOWTIME_KEYWORDS) {
    cleaned = cleaned.replace(new RegExp(`\\b${kw}\\b`, "gi"), "");
  }

  // Remove common Hinglish filler
  cleaned = cleaned.replace(/\b(hai|hain|ka|ki|ke|ko|se|mein|me|kya|bhai|yaar|sir|please|about)\b/gi, "");

  return cleaned.replace(/\s+/g, " ").trim();
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// v4.0: QUERY OPTIMIZER (Hinglish → Clean English)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HINGLISH_MULTI: [RegExp, string][] = [
  [/pradhan\s*mantri/gi, 'prime minister'],
  [/mukhya\s*mantri/gi, 'chief minister'],
  [/lok\s*sabha/gi, 'lok sabha'],
  [/rajya\s*sabha/gi, 'rajya sabha'],
  [/supreme\s*court/gi, 'supreme court'],
  [/high\s*court/gi, 'high court'],
  [/sarkar(?:i)?\s*yojana/gi, 'government scheme'],
  [/sarkar(?:i)?\s*naukri/gi, 'government job'],
  [/sehat\s*bima/gi, 'health insurance'],
  [/jeevan\s*bima/gi, 'life insurance'],
  [/fasal\s*bima/gi, 'crop insurance'],
  [/kisan\s*samman/gi, 'kisan samman'],
  [/aaj\s*ki\s*taaza\s*khabar/gi, 'today latest news'],
  [/taaza\s*khabar/gi, 'latest news'],
  [/taza\s*khabar/gi, 'latest news'],
  [/aaj\s*ki\s*news/gi, 'today news'],
  [/kal\s*ki\s*news/gi, 'tomorrow news'],
  [/sarkari\s*result/gi, 'government result'],
  [/board\s*result/gi, 'board result'],
  [/petrol\s*ka\s*rate/gi, 'petrol price'],
  [/diesel\s*ka\s*rate/gi, 'diesel price'],
  [/sone\s*ka\s*(bhav|rate|daam)/gi, 'gold price'],
  [/chandi\s*ka\s*(bhav|rate|daam)/gi, 'silver price'],
];

const HINGLISH_TRANSLATE: Record<string, string> = {
  sarkar: 'government', sarkari: 'government',
  mantri: 'minister', neta: 'leader',
  chunav: 'election', kanoon: 'law', niyam: 'rule',
  paisa: 'money', dhan: 'money', rupaya: 'rupee',
  daam: 'price', bhav: 'price', kimat: 'price',
  kamai: 'earnings', munafa: 'profit',
  sona: 'gold', chandi: 'silver',
  bazaar: 'market', share: 'share',
  sehat: 'health', swasthya: 'health',
  bima: 'insurance', ilaj: 'treatment',
  dawai: 'medicine', aspatal: 'hospital',
  vidyalaya: 'school', vishwavidyalaya: 'university',
  padhai: 'studies', pariksha: 'exam',
  natija: 'result', bharti: 'recruitment',
  yojana: 'scheme', suvidha: 'facility',
  labh: 'benefit', madad: 'help',
  avedan: 'application', patra: 'eligible',
  samachar: 'news', khabar: 'news',
  jankari: 'information', suchna: 'notification',
  aaj: 'today', kal: 'tomorrow',
  abhi: 'now', filhaal: 'currently',
  shehar: 'city', gaon: 'village',
  rajya: 'state', desh: 'country', zila: 'district',
  naukri: 'job', kaam: 'work',
  dukan: 'shop', ghar: 'home',
  safar: 'travel', yatra: 'journey',
  mausam: 'weather', barish: 'rain', garmi: 'heat', sardi: 'cold',
  khel: 'sports', match: 'match',
  film: 'movie', gaana: 'song',
};

const HINGLISH_REMOVE = new Set([
  'hai', 'hain', 'tha', 'the', 'thi', 'ho', 'hota', 'hoti',
  'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'pe',
  'ne', 'na', 'nahi', 'mat', 'bhi', 'toh', 'to', 'hi',
  'kya', 'kaise', 'kahan', 'kahaan', 'kyun', 'kyon', 'kaun',
  'kab', 'kitna', 'kitne', 'kitni', 'konsa', 'konsi',
  'batao', 'bata', 'btao', 'btaao', 'bataye', 'btaiye',
  'dikhao', 'dikha', 'sunao', 'suna',
  'de', 'do', 'dena', 'dedo', 'dijiye', 'kariye',
  'mujhe', 'mujhko', 'hume', 'humko', 'apko', 'aapko', 'unko', 'usko',
  'mere', 'mera', 'meri', 'hamare', 'hamari', 'apna', 'apni',
  'ye', 'yeh', 'wo', 'woh', 'is', 'us', 'in', 'un',
  'ek', 'do', 'aur', 'ya', 'lekin', 'magar', 'par',
  'bahut', 'bohot', 'zyada', 'kam', 'thoda', 'sabse',
  'wala', 'wali', 'wale', 'waala', 'waali', 'waale',
  'kar', 'karo', 'karna', 'karke',
  'raha', 'rahi', 'rahe', 'rhe',
  'about', 'please', 'sir', 'bhai', 'yaar', 'bro',
  'uske', 'uski', 'iske', 'iski', 'unke', 'unki',
  'baare', 'bare', 'vishay',
  'jo', 'jaise', 'jaisa',
  'kuch', 'sab', 'koi',
  'accha', 'achha', 'theek',
]);

/**
 * v4.4: Query optimizer — Hinglish → Clean English
 *
 * REMOVED: PROTECTED_NAMES hardcoded regex
 * NEW: Dynamic protection using cinema anchor detection.
 * If query contains cinema anchors, we preserve the entire
 * pre-anchor portion (the cinema/venue name) regardless of
 * what it is — works for any name, no list needed.
 */
function optimizeSearchQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 3) return trimmed;

  // v4.4: Dynamic anchor-based protection
  // If query has cinema anchors, protect the name portion
  // "Silverbird cinemas movies today" → protect "Silverbird"
  // No hardcoded name list needed
  const cinemaName = hasCinemaAnchor(trimmed) ? extractCinemaName(trimmed) : null;

  const words = trimmed.toLowerCase().split(/\s+/);
  const englishPattern = /^[a-z]+$/;
  const englishCount = words.filter(w => englishPattern.test(w) && !HINGLISH_REMOVE.has(w) && !HINGLISH_TRANSLATE[w]).length;
  
  if (englishCount / words.length > 0.7) {
    const cleaned = words.filter(w => !HINGLISH_REMOVE.has(w)).join(' ');
    return cleaned || trimmed;
  }
  
  let result = trimmed;
  for (const [pattern, replacement] of HINGLISH_MULTI) {
    result = result.replace(pattern, replacement);
  }
  
  const resultWords = result.split(/\s+/);
  const processed: string[] = [];
  
  for (const word of resultWords) {
    const lower = word.toLowerCase().replace(/[^\w]/g, '');
    if (HINGLISH_REMOVE.has(lower)) continue;
    if (HINGLISH_TRANSLATE[lower]) { processed.push(HINGLISH_TRANSLATE[lower]); continue; }
    processed.push(word);
  }
  
  const deduped: string[] = [];
  for (const word of processed) {
    if (deduped.length === 0 || deduped[deduped.length - 1].toLowerCase() !== word.toLowerCase()) {
      deduped.push(word);
    }
  }
  
  let optimized = deduped.join(' ').trim();

  // v4.4: Restore cinema name if it was stripped during optimization
  if (cinemaName && cinemaName.length > 1 && !optimized.toLowerCase().includes(cinemaName.toLowerCase())) {
    optimized = `${cinemaName} ${optimized}`;
  }

  if (optimized.length < 3) return trimmed;
  return optimized;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FRESHNESS MAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FRESHNESS_MAP: Record<string, 'pd' | 'pw' | 'pm' | undefined> = {
  sports: 'pd', finance: 'pd', news: 'pd', weather: 'pd',
  entertainment: 'pw', festival: 'pm', general: undefined,
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER PRIORITY PER DOMAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Provider = 'brave' | 'tavily' | 'google';

const PROVIDER_PRIORITY: Record<string, Provider[]> = {
  sports:        ['brave', 'tavily', 'google'],
  finance:       ['brave', 'google', 'tavily'],
  news:          ['tavily', 'brave', 'google'],
  entertainment: ['tavily', 'brave', 'google'],
  weather:       ['google', 'brave', 'tavily'],
  festival:      ['google', 'brave', 'tavily'],
  general:       ['brave', 'tavily', 'google'],
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FESTIVAL KEYWORDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FESTIVAL_KEYWORDS = [
  'holi', 'diwali', 'dussehra', 'navratri', 'ganesh chaturthi', 'janmashtami',
  'raksha bandhan', 'rakhi', 'mahashivratri', 'shivratri', 'vasant panchami',
  'basant panchami', 'karwa chauth', 'chhath', 'onam', 'pongal', 'ugadi',
  'makar sankranti', 'lohri', 'baisakhi', 'vaisakhi', 'gurpurab', 'guru nanak',
  'eid', 'eid ul fitr', 'eid ul adha', 'bakrid', 'muharram', 'christmas',
  'easter', 'good friday', 'thanksgiving', 'independence day', 'republic day',
  'gandhi jayanti', 'ram navami', 'hanuman jayanti', 'buddha purnima',
  'mahavir jayanti', 'guru purnima', 'karva chauth', 'bhai dooj', 'dhanteras',
  'holika dahan', 'rang panchami', 'chaitra navratri', 'durga puja'
];

function extractFestivalName(query: string): string | null {
  const q = query.toLowerCase();
  for (const festival of FESTIVAL_KEYWORDS) {
    if (q.includes(festival)) return festival;
  }
  return null;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// v4.3: ROBUST RATING EXTRACTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface RatingCandidate {
  value: number;
  confidence: number;
  source: string;
}

function extractRatingFromResults(results: SearchResultItem[], query: string): string | null {
  const candidates: RatingCandidate[] = [];
  
  for (const result of results.slice(0, 5)) {
    const title = result.title || '';
    const desc = result.description || '';
    const combined = `${title} ${desc}`;
    
    const decimalMatches = combined.matchAll(/(\d+\.\d+)\s*\/\s*10/g);
    for (const match of decimalMatches) {
      const val = parseFloat(match[1]);
      if (val >= 1.0 && val <= 10.0) {
        candidates.push({ value: val, confidence: 95, source: title.slice(0, 50) });
      }
    }
    
    const starMatches = combined.matchAll(/⭐\s*(\d+\.?\d*)/g);
    for (const match of starMatches) {
      const val = parseFloat(match[1]);
      if (val >= 1.0 && val <= 10.0) {
        candidates.push({ value: val, confidence: 90, source: title.slice(0, 50) });
      }
    }
    
    const contextMatches = combined.matchAll(/(?:rating|imdb|imdb\s*rating)[:\s]+(\d+\.?\d*)/gi);
    for (const match of contextMatches) {
      const val = parseFloat(match[1]);
      if (val >= 1.0 && val <= 10.0) {
        const conf = match[1].includes('.') ? 85 : 50;
        candidates.push({ value: val, confidence: conf, source: title.slice(0, 50) });
      }
    }
    
    const isRatingPage = /rating|imdb|review|score/i.test(title);
    if (isRatingPage) {
      const intMatches = combined.matchAll(/\b(\d{1,2})\s*\/\s*10\b/g);
      for (const match of intMatches) {
        const val = parseFloat(match[1]);
        if (val >= 2 && val <= 9) {
          candidates.push({ value: val, confidence: 60, source: title.slice(0, 50) });
        }
      }
    }
  }

  if (candidates.length === 0) {
    console.log(`   🎬 Rating: NOT FOUND in search results`);
    return null;
  }

  const grouped = new Map<number, RatingCandidate[]>();
  for (const c of candidates) {
    const roundedKey = Math.round(c.value * 2) / 2;
    if (!grouped.has(roundedKey)) grouped.set(roundedKey, []);
    grouped.get(roundedKey)!.push(c);
  }

  let bestValue = 0;
  let bestConfidence = 0;

  for (const [value, group] of grouped) {
    const combinedConf = group.length > 1 
      ? Math.min(100, Math.max(...group.map(g => g.confidence)) + (group.length * 10))
      : group[0].confidence;
    
    if (combinedConf > bestConfidence) {
      bestConfidence = combinedConf;
      bestValue = group[0].value;
    }
  }

  const MIN_CONFIDENCE = 55;
  
  if (bestConfidence < MIN_CONFIDENCE) {
    console.log(`   🎬 Rating: FOUND ${bestValue}/10 but LOW confidence (${bestConfidence}%) — SKIPPED`);
    return null;
  }

  console.log(`   🎬 Rating: ${bestValue}/10 (confidence: ${bestConfidence}%, candidates: ${candidates.length})`);
  return `IMDB Rating: ${bestValue}/10`;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MASTER ORCHESTRATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SorivaSearch = {
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const {
      userLocation = "India",
      enableWebFetch = true,
      maxContentChars = 2000,
    } = options;

    const q = query.trim();

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔎 [SorivaSearch v4.4] SEARCH STARTED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📝 Query: "${q}"`);
    console.log(`📍 Location: ${userLocation}`);

    // 1. DOMAIN DETECTION
    const domain = HybridKeywordEngine.detect(q);
    const route = Routing.mapDomainToRoute(domain);
    console.log(`🎯 Domain: ${domain}  →  Route: ${route}`);

    // 2. FESTIVAL SHORTCUT → Calendarific
    if (route === "festival") {
      console.log("🎉 Festival route → Calendarific API");
      const festivalResult = await this.handleFestivalQuery(q, userLocation, startTime);
      if (festivalResult) {
        console.log("✅ Festival resolved via Calendarific");
        return festivalResult;
      }
      console.log("⚠️ Calendarific fallback → Web search");
    }

    // 3. DATE NORMALIZATION
    const dateInfo = DateNormalizer.normalize(q);
    if (dateInfo) console.log(`📅 Date: ${dateInfo.keyword} → ${dateInfo.human}`);

    // 4. BUILD + OPTIMIZE QUERY
    const rawQuery = this.buildQuery(q, route, dateInfo, userLocation);
    const finalQuery = optimizeSearchQuery(rawQuery);
    
    console.log(`📝 Raw: "${rawQuery}"`);
    if (rawQuery !== finalQuery) console.log(`🔄 Optimized: "${finalQuery}"`);

    // 5. FRESHNESS + RESULT COUNT
    const resultCount = Routing.getResultCount(domain);
    const freshness = FRESHNESS_MAP[domain];
    if (freshness) console.log(`⏰ Freshness: ${freshness} (${domain})`);

    // 6. MULTI-PROVIDER SEARCH
    const providerOrder = PROVIDER_PRIORITY[domain] || PROVIDER_PRIORITY.general;
    console.log(`🔗 Provider order: ${providerOrder.join(' → ')}`);

    const searchResult = await this.multiProviderSearch(q, finalQuery, resultCount, freshness, providerOrder);

    if (!searchResult || searchResult.results.length === 0) {
      console.log("❌ ALL providers returned NO results");
      return this.emptyResult(domain, route, dateInfo, finalQuery, Date.now() - startTime);
    }

    console.log(`✅ ${searchResult.provider}: ${searchResult.results.length} results in ${searchResult.timeMs}ms`);
    searchResult.results.slice(0, 3).forEach((r, i) => {
      console.log(`   #${i + 1} → ${r.title.slice(0, 70)}...`);
    });

    // 7. RELEVANCE SCORING
    const best = Relevance.best(q, searchResult.results);
    if (best) console.log(`🏆 Best: ${best.title.slice(0, 60)}...`);

    // 8. WEBFETCH (with retry)
    let webFetch = null;
    let useSnippetOnly = false;
    let browserlessUsed = false;

    if (enableWebFetch && Routing.shouldWebFetch(domain)) {
      const rankedResults = Relevance.rank(q, searchResult.results).slice(0, 3);
      
      const SKIP_DOMAINS = [
        'india.gov.in', 'gov.in', 'nic.in', 'mygov.in',
        'punjab.gov.in', 'haryana.gov.in', 'rajasthan.gov.in',
        'scribd.com', 'slideshare.net', 'linkedin.com'
      ];
      
      for (const result of rankedResults) {
        if (!result.url) continue;
        
        const urlLower = result.url.toLowerCase();
        if (SKIP_DOMAINS.some(d => urlLower.includes(d))) {
          console.log(`   ⏭ Skipped: ${result.url.slice(0, 50)}...`);
          continue;
        }
        
        if (BrowserlessService.needsBrowserless(result.url) && BrowserlessService.isConfigured()) {
          console.log(`🌐 Browserless → ${result.url.slice(0, 80)}...`);
          const bResult = await BrowserlessService.fetch(result.url, maxContentChars);
          
          if (bResult.success) {
            console.log(`   ✅ Browserless: ${bResult.contentLength} chars in ${bResult.timeMs}ms`);
            webFetch = {
              success: true, url: bResult.url, title: bResult.title,
              content: bResult.content, contentLength: bResult.contentLength,
              promptTokens: bResult.promptTokens, timeMs: bResult.timeMs,
            };
            browserlessUsed = true;
            break;
          } else {
            console.log(`   ⚠ Browserless failed: ${bResult.error}`);
            useSnippetOnly = true;
            break;
          }
        }
        
        console.log(`🌐 WebFetch → ${result.url.slice(0, 80)}...`);
        webFetch = await WebFetchService.fetch(result.url, maxContentChars);
        
        if (webFetch.success) {
          console.log(`   ✅ ${webFetch.contentLength} chars in ${webFetch.timeMs}ms`);
          break;
        } else if (webFetch.snippetOnly) {
          console.log(`   ⚡ JS-heavy site - using snippet`);
          useSnippetOnly = true;
          break;
        } else {
          console.log(`   ⚠ Failed: ${webFetch.error}, next...`);
        }
      }
      
      if (!webFetch?.success && !useSnippetOnly) {
        console.log(`   📝 All WebFetch failed, using snippets`);
        useSnippetOnly = true;
      }
    }

    // 9. ASSEMBLE RESULT
    const result = this.assembleResult({
      searchResult, best, webFetch, useSnippetOnly,
      domain, route, dateInfo, finalQuery, startTime, browserlessUsed,
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SEARCH COMPLETE");
    console.log(`📊 Provider: ${result.provider} | Source: ${result.source} | ⏱ ${result.totalTimeMs}ms | 🔥 ${result.promptTokens} tokens`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return result;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MULTI-PROVIDER SEARCH WITH QUALITY CHECK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  QUALITY_THRESHOLD: 15,

  async multiProviderSearch(
    originalQuery: string,
    searchQuery: string,
    count: number,
    freshness: 'pd' | 'pw' | 'pm' | undefined,
    providerOrder: Provider[]
  ): Promise<ProviderSearchResult | null> {

    let bestSoFar: { result: ProviderSearchResult; score: number } | null = null;

    for (const provider of providerOrder) {
      try {
        let result: ProviderSearchResult | null = null;

        switch (provider) {
          case 'brave': {
            if (!BraveService.isConfigured()) {
              console.log(`   ⏭ Brave: not configured`);
              continue;
            }
            const brave = await BraveService.search(searchQuery, { count, freshness });
            if (brave && brave.results.length > 0) {
              result = { results: brave.results, answer: brave.answer, timeMs: brave.timeMs, provider: 'brave' };
            }
            break;
          }
          case 'tavily': {
            if (!TavilyService.isConfigured()) {
              console.log(`   ⏭ Tavily: not configured`);
              continue;
            }
            const tavily = await TavilyService.search(searchQuery, count);
            if (tavily && tavily.results.length > 0) {
              result = { results: tavily.results, answer: tavily.answer, timeMs: tavily.timeMs, provider: 'tavily' };
            }
            break;
          }
          case 'google': {
            if (!GoogleService.isConfigured()) {
              console.log(`   ⏭ Google: not configured`);
              continue;
            }
            const google = await GoogleService.search(searchQuery, count);
            if (google && google.results.length > 0) {
              result = { results: google.results, answer: google.answer, timeMs: google.timeMs, provider: 'google' };
            }
            break;
          }
        }

        if (!result) {
          console.log(`   ⚠ ${provider}: no results, trying next...`);
          continue;
        }

        const bestResult = Relevance.best(originalQuery, result.results);
        const topScore = bestResult ? Relevance.score(originalQuery, bestResult) : 0;
        const hasDirectAnswer = !!(result.answer && result.answer.length > 30);

        console.log(`   📊 ${provider}: ${result.results.length} results, top score: ${topScore}${hasDirectAnswer ? ' + direct answer ✓' : ''}`);

        const passedLevel1 = topScore >= this.QUALITY_THRESHOLD || hasDirectAnswer;

        if (!passedLevel1) {
          console.log(`   ⚠ ${provider}: L1 FAIL — score ${topScore} < ${this.QUALITY_THRESHOLD}, trying next...`);
          if (!bestSoFar || topScore > bestSoFar.score) {
            bestSoFar = { result, score: topScore };
          }
          continue;
        }

        const answerText = (result.answer || '').toLowerCase();
        const allResultsText = result.results
          .slice(0, 5)
          .map(r => `${r.title || ''} ${r.description || ''}`)
          .join(' ')
          .toLowerCase();
        const combinedText = `${answerText} ${allResultsText}`;

        const contentUseless = this.isAnswerUseless(originalQuery, combinedText);

        if (contentUseless) {
          console.log(`   ⚠ ${provider}: L2 FAIL — answer content useless, trying next...`);
          if (!bestSoFar || topScore > bestSoFar.score) {
            bestSoFar = { result, score: topScore };
          }
          continue;
        }

        console.log(`   ✅ ${provider}: quality GOOD (L1: score ${topScore}, L2: content useful)`);
        return result;

      } catch (error: any) {
        console.error(`   ❌ ${provider} error: ${error.message}`);
      }
    }

    if (bestSoFar) {
      console.log(`   🔄 No provider passed quality threshold. Using best available: ${bestSoFar.result.provider} (score: ${bestSoFar.score})`);
      return bestSoFar.result;
    }

    return null;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEVEL 2 QUALITY — Is answer content actually useful?
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  isAnswerUseless(originalQuery: string, combinedText: string): boolean {
    const q = originalQuery.toLowerCase();
    const text = combinedText.toLowerCase();

    const USELESS_PHRASES = [
      'not yet available', 'not available yet', 'no rating',
      'not yet rated', 'no reviews yet', 'not been rated',
      'rating not available', 'no imdb rating', 'awaiting rating',
      'tbd', 'to be announced', 'yet to be released',
      'not yet released', 'no data available', 'information not available',
      'coming soon', 'details awaited', 'abhi available nahi',
    ];

    const hasUselessPhrase = USELESS_PHRASES.some(phrase => text.includes(phrase));

    const isRatingQuery = /\b(rating|imdb|score|review\s*score|tmdb)\b/i.test(q);
    
    if (isRatingQuery) {
      const hasRatingNumber = /(\d+\.?\d*)\s*\/\s*10|⭐\s*\d|rating[:\s]+\d|imdb[:\s]+\d|\b[1-9]\.\d\b/i.test(text);
      if (!hasRatingNumber) {
        console.log(`   🔍 L2: Rating query but NO number found in answer`);
        return true;
      }
    }

    const isPriceQuery = /\b(price|rate|bhav|daam|kimat|cost|kitna)\b/i.test(q);
    
    if (isPriceQuery) {
      const hasPriceNumber = /₹|rs\.?\s*\d|\$\s*\d|\d+,?\d*\s*(rupee|crore|lakh|thousand)/i.test(text);
      if (!hasPriceNumber) {
        console.log(`   🔍 L2: Price query but NO price found in answer`);
        return true;
      }
    }

    const isScoreQuery = /\b(score|result|winner|jita|jeeta|kon jita|who won)\b/i.test(q);
    
    if (isScoreQuery) {
      const hasScoreData = /\d+\s*[-–\/]\s*\d+|\bwon\b|\bbeat\b|\blost\b|\bdraw\b|\btied\b|\bjita\b|\bjeeta\b|\bhaara\b/i.test(text);
      if (!hasScoreData) {
        console.log(`   🔍 L2: Score query but NO score/result found in answer`);
        return true;
      }
    }

    const isWeatherQuery = /\b(weather|mausam|temperature|barish|rain|forecast)\b/i.test(q);
    
    if (isWeatherQuery) {
      const hasWeatherData = /\d+\s*°|\d+\s*celsius|\d+\s*fahrenheit|\brain\b|\bsunny\b|\bcloudy\b|\bhaze\b|\bfog\b|\bdhoop\b|\bbarish\b/i.test(text);
      if (!hasWeatherData) {
        console.log(`   🔍 L2: Weather query but NO weather data found in answer`);
        return true;
      }
    }

    if (hasUselessPhrase) {
      console.log(`   🔍 L2: Useless phrase detected in answer`);
      return true;
    }

    return false;
  },

  async handleFestivalQuery(
    query: string, location: string, startTime: number
  ): Promise<SearchResult | null> {
    try {
      const festivalName = extractFestivalName(query);
      
      if (festivalName) {
        console.log(`🔍 [Festival] Name: "${festivalName}"`);
        const currentYear = new Date().getFullYear();
        const festival = await festivalService.searchFestivalByName(festivalName, currentYear, 'IN');
        
        if (festival) {
          const fact = `${festival.name} is on ${festival.dateHuman} (${festival.date}).${festival.description ? ' ' + festival.description.slice(0, 150) : ''}`;
          console.log(`✅ [Festival] ${festival.name} on ${festival.dateHuman}`);
          
          return {
            fact, topTitles: festival.name,
            source: "calendarific", bestUrl: null,
            domain: "festival", route: "festival",
            dateInfo: { date: festival.date, human: festival.dateHuman, keyword: festivalName },
            braveTimeMs: 0, fetchTimeMs: 0, totalTimeMs: Date.now() - startTime,
            promptTokens: Math.ceil(fact.length / 4), resultsFound: 1, queryUsed: query,
            provider: 'calendarific',
          };
        }
      }
      
      const dateKeywords = ['today', 'aaj', 'kal', 'tomorrow', 'parso'];
      const hasDateKeyword = dateKeywords.some(k => query.toLowerCase().includes(k));
      
      if (hasDateKeyword) {
        console.log(`🔍 [Festival] Date keyword search`);
        const locationParts = location.split(/[,\s]+/).filter(Boolean);
        
        const result = await festivalService.getFestivalsForDate({
          city: locationParts[0], state: locationParts[1], country: locationParts[2] || 'India',
        });
        
        if (result.success && result.primaryFestival) {
          const f = result.primaryFestival;
          const fact = `${result.dateHuman} is ${f.name}.${f.description ? ' ' + f.description.slice(0, 150) : ''}`;
          console.log(`✅ [Festival] ${f.name} on ${result.dateHuman}`);
          
          return {
            fact, topTitles: f.name,
            source: "calendarific", bestUrl: null,
            domain: "festival", route: "festival",
            dateInfo: { date: result.date, human: result.dateHuman, keyword: "today" },
            braveTimeMs: 0, fetchTimeMs: 0, totalTimeMs: Date.now() - startTime,
            promptTokens: Math.ceil(fact.length / 4), resultsFound: result.count, queryUsed: query,
            provider: 'calendarific',
          };
        }
      }
      
      return null;
    } catch (error: any) {
      console.error(`❌ [Festival] ${error.message}`);
      return null;
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v4.4: BUILD QUERY (ROUTE-AWARE) — NO HARDCODED NAMES
  //
  // CHANGES:
  // - REMOVED: KNOWN_CINEMAS regex
  // - REMOVED: hasMovieName regex
  // - NEW: Cinema detection via anchor words (dynamic, future-proof)
  // - FIXED: Ordering — cinema check BEFORE generic localBiz
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  buildQuery(
    query: string, route: string,
    dateInfo: { human: string } | null, location: string
  ): string {
    const dateText = dateInfo ? ` ${dateInfo.human}` : "";
    const q = query.toLowerCase();

    // ── LOCAL BUSINESS ROUTING ──
    // Order matters: cinema check FIRST (most specific), then restaurants, hospitals

    // 1. CINEMA/THEATRE queries — detected via anchor words, no hardcoded names
    if (hasCinemaAnchor(q)) {
      const venueName = extractCinemaName(query);

      if (hasShowtimeIntent(q)) {
        console.log(`   🎬 Cinema showtime: "${venueName}" in ${location}`);
        return venueName
          ? `${venueName} cinema showtimes today ${location}`
          : `cinema showtimes today ${location}`;
      }

      console.log(`   🎬 Cinema location: "${venueName}" in ${location}`);
      return venueName
        ? `${venueName} cinema ${location}`
        : `cinema near me ${location}`;
    }

    // 2. Restaurant queries
    const restaurants = ['restaurant', 'hotel', 'cafe', 'dhaba', 'food'];
    if (restaurants.some(kw => q.includes(kw))) {
      return `${query} zomato justdial ${location}`;
    }

    // 3. Hospital/medical queries
    const hospitals = ['hospital', 'clinic', 'doctor', 'medical', 'pharmacy'];
    if (hospitals.some(kw => q.includes(kw))) {
      return `${query} practo justdial ${location}`;
    }

    // ── SHOWTIME INTENT (without cinema anchor) ──
    const showtimeKw = ['lagi', 'lagi hai', 'lag rahi', 'chal rahi', 'chal raha',
      'running', 'showtime', 'playing', 'screening', 'ticket',
      'book', 'kab lagi', 'kahan lagi', 'yahaan', 'yahan',
      'mere shehar', 'mere city'];
    const isShowtime = showtimeKw.some(kw => q.includes(kw));

    // ── ROUTE-SPECIFIC QUERY BUILDING ──
    switch (route) {
      case "festival":
        return dateInfo ? `festival on ${dateInfo.human} in ${location}` : `${query} festival date significance ${location}`;

      case "sports":
        return `${query} latest score result${dateText} ${location}`;

      case "finance":
        return `${query} price today live chart ${location}`;

      case "news":
        return `${query} latest update ${location}`;

      case "entertainment":
        if (isShowtime) {
          const movieName = query.replace(/\b(lagi|lagi hai|lag rahi|chal rahi|chal raha|hai|yahaan|yahan|mere shehar|mere city|hometown|kahan|kab)\b/gi, '').trim();
          console.log(`   🎬 Movie showtime: "${movieName}" in ${location}`);
          return `${movieName} movie showtimes ${location}`;
        }

        const isRatingQ = /\b(rating|imdb|score|review|kaisi hai|kaisi h|kesi hai|acchi hai)\b/i.test(q);
        if (isRatingQ) {
          const movieClean = query.replace(/\b(ki|ka|ke|kya|hai|h|movie|film|batao|bata)\b/gi, '').trim();
          return `${movieClean} IMDb rating /10 review score`;
        }

        return `${query} release date rating review cast`;

      case "weather":
        return `${query} weather forecast today ${location}`;

      default:
        const isFactual = /^(what|who|when|where|why|how|kya|kaun|kab|kahan|kyun|kaise)\s+(is|are|was|were|hai|hain|tha|the|thi)\b/i.test(query);
        if (isFactual) return `${query}${dateText}`;
        return `${query}${dateText} ${location}`;
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ASSEMBLE RESULT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  assembleResult(data: any): SearchResult {
    const { searchResult, best, webFetch, useSnippetOnly, domain, route, dateInfo, finalQuery, startTime } = data;

    const topTitles = searchResult.results.slice(0, 3).map((r: SearchResultItem) => r.title).join(" | ");

    let extractedRating: string | null = null;
    const isRatingQuery = /\b(rating|imdb|score|review)\b/i.test(finalQuery);
    
    if (isRatingQuery && searchResult.results?.length > 0) {
      extractedRating = extractRatingFromResults(searchResult.results, finalQuery);
    }

    let fact = "";
    let source: SearchResult["source"] = "none";

    if (webFetch?.success && webFetch.content.length > 100) {
      const prefix = extractedRating ? `${extractedRating}\n\n` : '';
      fact = this.buildLLMContext({ contentType: "extracted", title: webFetch.title, content: prefix + webFetch.content, url: best?.url });
      source = "webfetch";
    }
    else if (best && (useSnippetOnly || !webFetch?.success)) {
      const snippet = best.description || searchResult.answer || "";
      fact = this.buildLLMContext({ contentType: "snippet", title: best.title, content: extractedRating ? `${extractedRating}\n\n${snippet}` : snippet, url: best.url, extraTitles: topTitles });
      source = "snippet";
    }
    else if (searchResult.answer && searchResult.answer.length > 30) {
      fact = this.buildLLMContext({ contentType: "answer", content: extractedRating ? `${extractedRating}\n\n${searchResult.answer}` : searchResult.answer, extraTitles: topTitles });
      source = "brave_answer";
    }
    else {
      fact = "No relevant information found for this query.";
      source = "none";
    }

    return {
      fact, topTitles, source, bestUrl: best?.url || null,
      domain, route, dateInfo,
      braveTimeMs: searchResult.timeMs, fetchTimeMs: webFetch?.timeMs || 0, totalTimeMs: Date.now() - startTime,
      promptTokens: Math.ceil(fact.length / 4), resultsFound: searchResult.results.length, queryUsed: finalQuery,
      provider: searchResult.provider,
    };
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUILD LLM CONTEXT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  buildLLMContext(params: {
    contentType: "extracted" | "snippet" | "answer";
    title?: string; content: string; url?: string; extraTitles?: string;
  }): string {
    const { contentType, title, content, url, extraTitles } = params;
    let ctx = "";
    if (title) ctx += `${title}\n\n`;
    ctx += content.trim();
    if (extraTitles && contentType === "snippet") ctx += `\n\nRelated: ${extraTitles}`;
    if (url) ctx += `\n\nSource: ${url}`;
    return ctx.trim();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMPTY RESULT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  emptyResult(domain: string, route: string, dateInfo: any, q: string, time: number): SearchResult {
    return {
      fact: "No results found.", topTitles: "", source: "none", bestUrl: null,
      domain, route, dateInfo,
      braveTimeMs: 0, fetchTimeMs: 0, totalTimeMs: time,
      promptTokens: 0, resultsFound: 0, queryUsed: q,
      provider: 'none',
    };
  },
};

export default SorivaSearch;