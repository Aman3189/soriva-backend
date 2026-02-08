/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v7.1.1 - ENTERPRISE GRADE MERGED ARCHITECTURE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: modules/chat/services/search/soriva/index.ts
 * Created by: Risenex Dynamics Pvt. Ltd.
 * Version: 7.1.1
 * 
 * ARCHITECTURE: v6.0 Clean Structure + v5.0 Full Intelligence
 * 
 * v7.1.1 CHANGES (Feb 2026):
 * ✅ SourceRouter now INFLUENCES providerOrder (not just logging)
 * ✅ buildQuery() route === 'local' ALWAYS overrides domain skip rules
 * ✅ health → local_business in mapToSourceDomain (hospitals are local)
 * ✅ Added inherentlyLocalPatterns detection (timings, address, nearest)
 * ✅ Added mapSourceRouterToProviders() helper function
 * 
 * v7.1.0 CHANGES (Feb 2026):
 * ✅ FIX 1: Added tech + government to FRESHNESS_MAP
 * ✅ FIX 2: Added tech + government to PROVIDER_PRIORITY
 * ✅ FIX 3: buildQuery() now adds location for food/health/education/local
 * ✅ FIX 4: GoogleCSE validCategories extended (tech, government, local)
 * ✅ FIX 5: FESTIVAL_KEYWORDS synced with keyword-engine.ts
 * ✅ FIX 6: providerResults now includes domain field
 * ✅ FIX 7: assembleResult() has tech-specific URL filtering
 * ✅ FIX 8: SourceRouter integrated for city-tier aware routing
 * 
 * SECTIONS:
 * ═══════════════════════════════════════════════════════════════
 * § 1. TYPES           - All interfaces & type definitions
 * § 2. DOMAIN          - Keywords, Freshness, Provider priority
 * § 3. NORMALIZERS     - Hinglish translation, Query optimizer
 * § 4. ENGINE          - Tiered search, Multi-provider logic
 * § 5. FETCH           - WebFetch, Browserless rules
 * § 6. ORCHESTRATOR    - Main search() with full v5.0 brain
 * § 7. EXPORTS         - Clean public API
 * ═══════════════════════════════════════════════════════════════
 * 
 * PIPELINE:
 * 1. Domain Detection (Hybrid Engine)
 * 1.5 Source Routing (City-tier aware) ← NEW in v7.1
 * 2. Festival Shortcut (Calendarific API)
 * 3. Date Normalization (IST-aware)
 * 4. Query Optimization (Hinglish → English, zero LLM cost)
 * 5. Freshness Routing (sports=pd, news=pd, tech=pd, etc.)
 * 6. Tier Classification (ConsistencyEngine)
 * 7. Tiered Multi-Provider Search (parallel if needed)
 * 8. Consistency Verification (cross-check facts)
 * 9. Relevance Scoring
 * 10. WebFetch (Deep content extraction)
 * 11. LLM Context Assembly (with verification metadata)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { HybridKeywordEngine } from "../engine/hybrid/keyword-engine";
import { Routing } from "../core/routing";
import { DateNormalizer } from "../engine/date-normalizer";
import { BraveService } from "../services/brave";
import { GoogleCSEService } from "../services/google-cse";
import { Relevance } from "../engine/relevance";
import { WebFetchService } from "../services/webfetch";
import { BrowserlessService } from "../services/browserless";
import { SearchResultItem } from "../core/data";
import { festivalService } from '../../../../../services/calender/festivalService';
import { ConsistencyEngine, type ProviderResult, type VerificationTier, type ConsistencyResult } from './consistency.engine';
import { sourceRouter, type SourceRoutingResult } from '../core/source-router';


// ╔═══════════════════════════════════════════════════════════════╗
// ║                    § 1. TYPES                                  ║
// ╚═══════════════════════════════════════════════════════════════╝

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
  verification?: {
    tier: VerificationTier;
    confidence: string;
    confidenceScore: number;
    agreement: string;
    providersUsed: number;
    llmInstruction: string;
  };
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

interface RatingCandidate {
  value: number;
  confidence: number;
  source: string;
  url?: string;
}

type Provider = 'google-cse' | 'brave';


// ╔═══════════════════════════════════════════════════════════════╗
// ║                    § 2. DOMAIN                                 ║
// ║  Keywords, Freshness, Provider Priority, Festival, Rating      ║
// ╚═══════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────
// 2.1 CINEMA & SHOWTIME DETECTION
// ─────────────────────────────────────────────────────────────────

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
  // v7.0: Added Hindi variants
  "lagdi", "chalti", "chaldi", "dekhni", "dekhna", "dekhu",
  "pvr", "inox", "cinepolis",
]);

function hasCinemaAnchor(query: string): boolean {
  const q = query.toLowerCase();
  for (const anchor of CINEMA_ANCHOR_WORDS) {
    if (q.includes(anchor)) return true;
  }
  return false;
}

function hasShowtimeIntent(query: string): boolean {
  const q = query.toLowerCase();
  for (const kw of SHOWTIME_KEYWORDS) {
    if (q.includes(kw)) return true;
  }
  return false;
}

function extractCinemaName(query: string): string {
  let cleaned = query;
  for (const anchor of CINEMA_ANCHOR_WORDS) {
    cleaned = cleaned.replace(new RegExp(`\\b${anchor}\\b`, "gi"), "");
  }
  for (const kw of SHOWTIME_KEYWORDS) {
    cleaned = cleaned.replace(new RegExp(`\\b${kw}\\b`, "gi"), "");
  }
  cleaned = cleaned.replace(/\b(hai|hain|ka|ki|ke|ko|se|mein|me|kya|bhai|yaar|sir|please|about)\b/gi, "");
  return cleaned.replace(/\s+/g, " ").trim();
}

// ─────────────────────────────────────────────────────────────────
// 2.2 FRESHNESS MAP
// ─────────────────────────────────────────────────────────────────

// v7.1.0: Extended to 14 domains (synced with HybridKeywordEngine)
const FRESHNESS_MAP: Record<string, 'pd' | 'pw' | 'pm' | undefined> = {
  sports: 'pd', 
  finance: 'pd', 
  news: 'pd', 
  weather: 'pd',
  tech: 'pd',             // ✅ FIX 1: Tech needs fresh data (launches, updates)
  entertainment: 'pw', 
  festival: 'pm', 
  general: undefined,
  health: undefined,
  food: undefined,
  travel: undefined,
  education: undefined,
  local: undefined,
  government: undefined,  // ✅ FIX 1: Govt schemes don't need strict freshness
};

// ─────────────────────────────────────────────────────────────────
// 2.3 PROVIDER PRIORITY PER DOMAIN
// ─────────────────────────────────────────────────────────────────

// v7.1.0: Extended to 14 domains (synced with HybridKeywordEngine)
const PROVIDER_PRIORITY: Record<string, Provider[]> = {
  sports:        ['google-cse', 'brave'],
  finance:       ['google-cse', 'brave'],
  news:          ['google-cse', 'brave'],
  entertainment: ['google-cse', 'brave'],
  weather:       ['google-cse', 'brave'],
  festival:      ['google-cse', 'brave'],
  health:        ['google-cse', 'brave'],
  food:          ['google-cse', 'brave'],
  travel:        ['google-cse', 'brave'],
  education:     ['google-cse', 'brave'],
  local:         ['google-cse', 'brave'],
  tech:          ['google-cse', 'brave'],       // ✅ FIX 2: Google CSE first for structured results
  government:    ['google-cse', 'brave'],       // ✅ FIX 2: Google CSE first for official sources
  general:       ['brave', 'google-cse'],       // General: Brave first (broader coverage)
};

// ─────────────────────────────────────────────────────────────────
// 2.4 FESTIVAL DETECTION
// ─────────────────────────────────────────────────────────────────

// v7.1.0: Synced with keyword-engine.ts festival keywords
const FESTIVAL_KEYWORDS = [
  // Major Hindu Festivals
  'holi', 'diwali', 'deepavali', 'dussehra', 'navratri', 'ganesh chaturthi', 'janmashtami',
  'raksha bandhan', 'rakhi', 'mahashivratri', 'shivratri', 'vasant panchami',
  'basant panchami', 'karwa chauth', 'karva chauth', 'chhath', 'bhai dooj', 'dhanteras',
  'holika dahan', 'rang panchami', 'chaitra navratri', 'durga puja',
  // Regional Festivals
  'onam', 'pongal', 'ugadi', 'makar sankranti', 'lohri', 'baisakhi', 'vaisakhi',
  // Sikh Festivals
  'gurpurab', 'guru nanak jayanti', 'guru purab',
  // Buddhist/Jain Festivals
  'buddha purnima', 'mahavir jayanti',
  // Islamic Festivals
  'eid', 'eid ul fitr', 'eid ul adha', 'bakrid', 'muharram',
  // Christian Festivals
  'christmas', 'easter', 'good friday',
  // Jayantis
  'ram navami', 'hanuman jayanti', 'guru purnima',
  // National Holidays
  'independence day', 'republic day', 'gandhi jayanti',
  // Generic Festival Words
  'tyohar', 'utsav', 'parv', 'panchami', 'ekadashi', 'purnima', 'amavasya', 'jayanti', 'vrat'
];

function extractFestivalName(query: string): string | null {
  const q = query.toLowerCase();
  for (const festival of FESTIVAL_KEYWORDS) {
    if (q.includes(festival)) return festival;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────
// 2.5 RATING EXTRACTION ENGINE
// ─────────────────────────────────────────────────────────────────

const UNRELIABLE_RATING_SOURCES = [
  'bookmyshow.com', 'justwatch.com', 'letterboxd.com',
  'mubi.com', 'paytm.com', 'hungama.com',
];

const TRUSTED_RATING_SOURCES = [
  'imdb.com', 'rottentomatoes.com', 'metacritic.com',
  'themoviedb.org', 'filmfare.com',
  'timesofindia.indiatimes.com', 'indianexpress.com', 'hindustantimes.com',
];

const FAMOUS_BOLLYWOOD_MOVIES = [
  'bajirao mastani', 'padmaavat', 'devdas', 'dilwale dulhania',
  'sholay', '3 idiots', 'dangal', 'pk', 'lagaan', 'rang de basanti',
  'swades', 'chak de india', 'taare zameen par', 'dil chahta hai',
  'zindagi na milegi dobara', 'gangs of wasseypur', 'andhadhun',
  'article 15', 'barfi', 'queen', 'kahaani', 'tumbbad', 'gully boy',
  'uri', 'war', 'pathaan', 'jawan', 'animal', 'stree', 'kabir singh',
  'gadar', 'kgf', 'rrr', 'pushpa', 'bahubali', 'drishyam', 'bhool bhulaiyaa',
];

function isUnreliableRatingSource(url?: string): boolean {
  if (!url) return false;
  const urlLower = url.toLowerCase();
  return UNRELIABLE_RATING_SOURCES.some(source => urlLower.includes(source));
}

function isTrustedRatingSource(url?: string): boolean {
  if (!url) return false;
  const urlLower = url.toLowerCase();
  return TRUSTED_RATING_SOURCES.some(source => urlLower.includes(source));
}

function isFamousMovie(query: string): boolean {
  const qLower = query.toLowerCase();
  return FAMOUS_BOLLYWOOD_MOVIES.some(movie => qLower.includes(movie));
}

function extractRatingFromResults(results: SearchResultItem[], query: string): string | null {
  const candidates: RatingCandidate[] = [];
  
  for (const result of results.slice(0, 5)) {
    const title = result.title || '';
    const desc = result.description || '';
    const url = result.url || '';
    const combined = `${title} ${desc}`;
    
    if (isUnreliableRatingSource(url)) {
      console.log(`   ⏭ Rating skip: unreliable source ${url.slice(0, 50)}...`);
      continue;
    }
    
    const trustBonus = isTrustedRatingSource(url) ? 15 : 0;
    
    // Pattern 1: Decimal ratings like "7.2/10"
    const decimalMatches = combined.matchAll(/(\d+\.\d+)\s*\/\s*10/g);
    for (const match of decimalMatches) {
      const val = parseFloat(match[1]);
      if (val >= 1.0 && val <= 10.0) {
        candidates.push({ value: val, confidence: 95 + trustBonus, source: title.slice(0, 50), url });
      }
    }
    
    // Pattern 2: Star ratings like "⭐ 7.2"
    const starMatches = combined.matchAll(/⭐\s*(\d+\.?\d*)/g);
    for (const match of starMatches) {
      const val = parseFloat(match[1]);
      if (val >= 1.0 && val <= 10.0) {
        candidates.push({ value: val, confidence: 90 + trustBonus, source: title.slice(0, 50), url });
      }
    }
    
    // Pattern 3: Context ratings like "IMDb rating: 7.2"
    const contextMatches = combined.matchAll(/(?:rating|imdb|imdb\s*rating)[:\s]+(\d+\.?\d*)/gi);
    for (const match of contextMatches) {
      const val = parseFloat(match[1]);
      if (val >= 1.0 && val <= 10.0) {
        const conf = match[1].includes('.') ? 85 + trustBonus : 50 + trustBonus;
        candidates.push({ value: val, confidence: conf, source: title.slice(0, 50), url });
      }
    }
    
    // Pattern 4: Rating page with integer ratings
    const isRatingPage = /rating|imdb|review|score/i.test(title);
    if (isRatingPage) {
      const intMatches = combined.matchAll(/\b(\d{1,2})\s*\/\s*10\b/g);
      for (const match of intMatches) {
        const val = parseFloat(match[1]);
        if (val >= 2 && val <= 9) {
          candidates.push({ value: val, confidence: 60 + trustBonus, source: title.slice(0, 50), url });
        }
      }
    }
  }

  if (candidates.length === 0) {
    console.log(`   🎬 Rating: NOT FOUND in search results`);
    return null;
  }

  // Group by similar values (within 0.5)
  const grouped = new Map<number, RatingCandidate[]>();
  for (const c of candidates) {
    const roundedKey = Math.round(c.value * 2) / 2;
    if (!grouped.has(roundedKey)) grouped.set(roundedKey, []);
    grouped.get(roundedKey)!.push(c);
  }

  let bestValue = 0;
  let bestConfidence = 0;
  let bestSource = '';

  for (const [value, group] of grouped) {
    const combinedConf = group.length > 1 
      ? Math.min(100, Math.max(...group.map(g => g.confidence)) + (group.length * 10))
      : group[0].confidence;
    
    if (combinedConf > bestConfidence) {
      bestConfidence = combinedConf;
      bestValue = group[0].value;
      bestSource = group[0].source;
    }
  }

  const MIN_CONFIDENCE = 55;
  
  if (bestConfidence < MIN_CONFIDENCE) {
    console.log(`   🎬 Rating: FOUND ${bestValue}/10 but LOW confidence (${bestConfidence}%) — SKIPPED`);
    return null;
  }

  if (isFamousMovie(query) && bestValue < 4.0) {
    console.log(`   🎬 Rating: ${bestValue}/10 SUSPICIOUS for famous movie — SKIPPED`);
    console.log(`   ⚠️ Source was: ${bestSource}`);
    return null;
  }

  if (bestValue < 3.0 && bestConfidence < 90) {
    console.log(`   🎬 Rating: ${bestValue}/10 UNUSUALLY LOW (confidence: ${bestConfidence}%) — SKIPPED`);
    return null;
  }

  console.log(`   🎬 Rating: ${bestValue}/10 (confidence: ${bestConfidence}%, candidates: ${candidates.length})`);
  return `IMDb Rating: ${bestValue}/10`;
}


// ╔═══════════════════════════════════════════════════════════════╗
// ║                    § 3. NORMALIZERS                            ║
// ║  Hinglish Translation, Query Optimizer                         ║
// ╚═══════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────
// 3.1 HINGLISH MULTI-WORD PATTERNS
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// 3.2 HINGLISH SINGLE-WORD TRANSLATE
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// 3.3 HINGLISH STOP WORDS TO REMOVE
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// 3.4 QUERY OPTIMIZER
// ─────────────────────────────────────────────────────────────────

function optimizeSearchQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 3) return trimmed;

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

  if (cinemaName && cinemaName.length > 1 && !optimized.toLowerCase().includes(cinemaName.toLowerCase())) {
    optimized = `${cinemaName} ${optimized}`;
  }

  if (optimized.length < 3) return trimmed;
  return optimized;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA SEARCH v7.0 - PART 2 (FINAL FIXED)
// Continues from Part 1 (Types, Domain, Normalizers)
// 
// ALL FIXES APPLIED:
// ✅ FIX 1: GoogleCSE.search(query, category, count) - correct signature
// ✅ FIX 2: result null checks (Ln 702, 703)
// ✅ FIX 3: festivalService.searchFestivalByName(name, year, countryCode)
// ✅ FIX 4: Relevance.best() null crash prevention
// ✅ FIX 5: providerResults.flatMap null safety
// ✅ FIX 6: Browserless regex explosion try-catch
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


// ╔═══════════════════════════════════════════════════════════════╗
// ║                    § 4. ENGINE                                 ║
// ║  Tiered Search, Multi-Provider Logic, Quality Threshold        ║
// ╚═══════════════════════════════════════════════════════════════╝

const QUALITY_THRESHOLD = 15;

// ─────────────────────────────────────────────────────────────────
// 4.1 TIERED MULTI-PROVIDER SEARCH
// ─────────────────────────────────────────────────────────────────

async function tieredMultiProviderSearch(
  originalQuery: string,
  searchQuery: string,
  count: number,
  freshness: 'pd' | 'pw' | 'pm' | undefined,
  providerOrder: Provider[],
  tier: VerificationTier,
  domain: string
): Promise<{ searchResult: ProviderSearchResult | null; providerResults: ProviderResult[] }> {

  // ── TIER 1: NO_VERIFY — Sequential fallback ──
  if (tier === 'NO_VERIFY') {
    console.log(`   📋 TIER 1: Sequential fallback (single provider)`);
    const searchResult = await sequentialFallbackSearch(
      originalQuery, searchQuery, count, freshness, providerOrder, domain
    );
    
    const providerResults: ProviderResult[] = [];
    if (searchResult) {
      providerResults.push({
        provider: searchResult.provider as Provider,
        results: searchResult.results,
        answer: searchResult.answer,
        timeMs: searchResult.timeMs,
        facts: [],
        domain,  // ✅ FIX 6: Added domain field
      });
    }
    
    return { searchResult, providerResults };
  }

  // ── TIER 2 & 3: Parallel execution ──
  const providersToUse = tier === 'STRICT'
    ? providerOrder.slice(0, 3)
    : providerOrder.slice(0, 2);

  console.log(`   📋 ${tier === 'STRICT' ? 'TIER 3' : 'TIER 2'}: Parallel search with ${providersToUse.length} providers [${providersToUse.join(', ')}]`);

  const searchPromises = providersToUse.map(provider =>
    searchWithProvider(provider, searchQuery, count, freshness, domain)
      .catch(err => {
        console.log(`   ⚠️ ${provider} error: ${err.message}`);
        return null;
      })
  );

  const results = await Promise.all(searchPromises);
  
  const providerResults: ProviderResult[] = [];
  let bestResult: ProviderSearchResult | null = null;
  let bestCount = 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    // ✅ FIX 2: Proper null check
    if (result !== null && result !== undefined && result.results && result.results.length > 0) {
      providerResults.push({
        provider: providersToUse[i],
        results: result.results,
        answer: result.answer,
        timeMs: result.timeMs,
        facts: [],
        domain,  // ✅ FIX 6: Added domain field
      });
      
      if (result.results.length > bestCount) {
        bestCount = result.results.length;
        bestResult = result;
      }
    }
  }

  if (!bestResult) {
    console.log(`   ⚠️ Parallel search failed, trying sequential fallback...`);
    bestResult = await sequentialFallbackSearch(
      originalQuery, searchQuery, count, freshness, providerOrder, domain
    );
  }

  return { searchResult: bestResult, providerResults };
}

// ─────────────────────────────────────────────────────────────────
// 4.2 SEQUENTIAL FALLBACK SEARCH
// ─────────────────────────────────────────────────────────────────

async function sequentialFallbackSearch(
  originalQuery: string,
  searchQuery: string,
  count: number,
  freshness: 'pd' | 'pw' | 'pm' | undefined,
  providerOrder: Provider[],
  domain: string
): Promise<ProviderSearchResult | null> {
  
  for (const provider of providerOrder) {
    try {
      console.log(`   🔍 Trying ${provider}...`);
      const result = await searchWithProvider(provider, searchQuery, count, freshness, domain);
      
      // ✅ FIX 2: Explicit null checks
      if (result !== null && result !== undefined) {
        if (result.results && result.results.length >= 3) {
          console.log(`   ✅ ${provider}: ${result.results.length} results`);
          return result;
        } else if (result.results && result.results.length > 0) {
          console.log(`   ⚠️ ${provider}: Only ${result.results.length} results, trying next...`);
        }
      }
    } catch (err: any) {
      console.log(`   ❌ ${provider} failed: ${err.message}`);
    }
  }
  
  return null;
}

// ─────────────────────────────────────────────────────────────────
// 4.3 SINGLE PROVIDER SEARCH
// ✅ FIX 1: GoogleCSE.search(query, category, count) - CORRECT SIGNATURE
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// 4.3 SINGLE PROVIDER SEARCH
// ✅ ALL FIXES APPLIED
// ─────────────────────────────────────────────────────────────────

async function searchWithProvider(
  provider: Provider,
  query: string,
  count: number,
  freshness: 'pd' | 'pw' | 'pm' | undefined,
  domain: string
): Promise<ProviderSearchResult | null> {
  const startTime = Date.now();

  try {
    if (provider === 'google-cse') {
      // v7.1.0: Extended validCategories to include tech, government, local
      const validCategories = [
        'news', 'sports', 'entertainment', 'health', 'finance', 
        'food', 'travel', 'education', 'weather', 'festival',
        'tech', 'government', 'local', 'general'  // ✅ FIX 4: Added new domains
      ] as const;
      
      type ValidCategory = typeof validCategories[number];
      
      // Map domain to valid category, default to 'general'
      const category: ValidCategory = validCategories.includes(domain as ValidCategory) 
        ? (domain as ValidCategory) 
        : 'general';
      
      const result = await GoogleCSEService.search(query, category, count);
      
      // Null safety check
      if (!result || !result.results) {
        return null;
      }
      
      return {
        results: result.results.map(r => ({
          title: r.title || '',
          url: r.url || '',
          description: r.description || '',
          source: r.source || '',
        })),
        timeMs: Date.now() - startTime,
        provider: 'google-cse',
      };
    } 
    
    if (provider === 'brave') {
      const result = await BraveService.search(query, { count, freshness });
      
      // Null safety check
      if (!result || !result.results) {
        return null;
      }
      
      return {
        results: result.results,
        answer: result.answer,
        timeMs: Date.now() - startTime,
        provider: 'brave',
      };
    }
    
  } catch (err: any) {
    console.log(`   ❌ ${provider} search error: ${err.message}`);
    return null;
  }

  return null;
}

// ╔═══════════════════════════════════════════════════════════════╗
// ║                    § 5. FETCH                                  ║
// ║  WebFetch Rules, Skip Domains, Browserless                     ║
// ╚═══════════════════════════════════════════════════════════════╝

const SKIP_DOMAINS = [
  'india.gov.in', 'gov.in', 'nic.in', 'mygov.in',
  'punjab.gov.in', 'haryana.gov.in', 'rajasthan.gov.in',
  'scribd.com', 'slideshare.net', 'linkedin.com'
];

function shouldSkipUrl(url: string): boolean {
  if (!url) return true;
  const urlLower = url.toLowerCase();
  return SKIP_DOMAINS.some(d => urlLower.includes(d));
}

async function fetchBestContent(
  results: SearchResultItem[],
  query: string,
  maxContentChars: number
): Promise<{ webFetch: any; useSnippetOnly: boolean; browserlessUsed: boolean }> {
  
  let webFetch = null;
  let useSnippetOnly = false;
  let browserlessUsed = false;

  // ✅ FIX 4: Null safety for results
  if (!results || !Array.isArray(results) || results.length === 0) {
    return { webFetch: null, useSnippetOnly: true, browserlessUsed: false };
  }

  const rankedResults = Relevance.rank(query, results).slice(0, 3);
  
  for (const result of rankedResults) {
    if (!result || !result.url) continue;
    
    if (shouldSkipUrl(result.url)) {
      console.log(`   ⏭ Skipped: ${result.url.slice(0, 50)}...`);
      continue;
    }
    
    // ✅ FIX 6: Browserless try-catch to prevent regex explosion
    let needsBrowserless = false;
    try {
      needsBrowserless = BrowserlessService.needsBrowserless(result.url);
    } catch (browserlessCheckErr) {
      console.log(`   ⚠ Browserless check error, skipping: ${browserlessCheckErr}`);
      needsBrowserless = false;
    }
    
    if (needsBrowserless && BrowserlessService.isConfigured()) {
      try {
        console.log(`🌐 Browserless → ${result.url.slice(0, 80)}...`);
        const bResult = await BrowserlessService.fetch(result.url, maxContentChars);
        
        if (bResult.success) {
          console.log(`   ✅ Browserless: ${bResult.contentLength} chars in ${bResult.timeMs}ms`);
          webFetch = {
            success: true,
            url: bResult.url,
            title: bResult.title,
            content: bResult.content,
            contentLength: bResult.contentLength,
            promptTokens: bResult.promptTokens,
            timeMs: bResult.timeMs,
          };
          browserlessUsed = true;
          break;
        } else {
          console.log(`   ⚠ Browserless failed: ${bResult.error}`);
          useSnippetOnly = true;
          break;
        }
      } catch (browserlessFetchErr) {
        console.log(`   ⚠ Browserless fetch error: ${browserlessFetchErr}`);
      }
    }
    
    // Regular WebFetch
    try {
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
    } catch (fetchErr) {
      console.log(`   ⚠ WebFetch error: ${fetchErr}`);
    }
  }
  
  if (!webFetch?.success && !useSnippetOnly) {
    console.log(`   📝 All WebFetch failed, using snippets`);
    useSnippetOnly = true;
  }

  return { webFetch, useSnippetOnly, browserlessUsed };
}

// ─────────────────────────────────────────────────────────────────
// 5.3 SOURCE DOMAIN MAPPER (for SourceRouter integration)
// ─────────────────────────────────────────────────────────────────

type SourceDomain = 'movies' | 'news' | 'local_business' | 'sports' | 'finance' | 'general';

function mapToSourceDomain(domain: string): SourceDomain {
  const domainMap: Record<string, SourceDomain> = {
    entertainment: 'movies',
    news: 'news',
    sports: 'sports',
    finance: 'finance',
    local: 'local_business',
    food: 'local_business',
    health: 'local_business',   // ✅ FIX: health → local_business (hospitals/clinics are local)
    travel: 'general',
    education: 'general',
    tech: 'general',
    government: 'general',
    weather: 'general',
    festival: 'general',
    general: 'general',
  };
  return domainMap[domain] || 'general';
}

// ─────────────────────────────────────────────────────────────────
// 5.4 SOURCE ROUTER → PROVIDER MAPPER
// v7.1.1: Maps SourceRouter output to internal provider names
// ─────────────────────────────────────────────────────────────────

interface SourceConfig {
  name: string;
  domain: string;
  [key: string]: any;
}

function mapSourceRouterToProviders(sources: SourceConfig[]): Provider[] {
  const providers: Provider[] = [];
  
  // Map source domains to our internal provider names
  // SourceRouter returns sources like { name: 'Google', domain: 'google.com' }
  // We need to map them to 'google-cse' or 'brave'
  
  const domainToProvider: Record<string, Provider> = {
    'google.com': 'google-cse',
    'googleapis.com': 'google-cse',
    'brave.com': 'brave',
    // News sources → prefer Google CSE
    'timesofindia.indiatimes.com': 'google-cse',
    'hindustantimes.com': 'google-cse',
    'indianexpress.com': 'google-cse',
    'ndtv.com': 'google-cse',
    // Entertainment → prefer Google CSE
    'imdb.com': 'google-cse',
    'bookmyshow.com': 'google-cse',
    'rottentomatoes.com': 'google-cse',
    // Local business → prefer Google CSE
    'justdial.com': 'google-cse',
    'zomato.com': 'google-cse',
    'practo.com': 'google-cse',
  };
  
  for (const source of sources) {
    const provider = domainToProvider[source.domain];
    if (provider && !providers.includes(provider)) {
      providers.push(provider);
    }
  }
  
  // If no specific mapping, default based on source count
  if (providers.length === 0 && sources.length > 0) {
    // Default: Google CSE for structured results
    providers.push('google-cse');
  }
  
  return providers;
}


// ╔═══════════════════════════════════════════════════════════════╗
// ║                    § 6. ORCHESTRATOR                           ║
// ║  Main Search Method - Full v5.0 Brain                          ║
// ╚═══════════════════════════════════════════════════════════════╝

export const SorivaSearch = {
  
  // ─────────────────────────────────────────────────────────────────
  // 6.1 MAIN SEARCH METHOD
  // ─────────────────────────────────────────────────────────────────
  
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const {
      userLocation = "India",
      enableWebFetch = true,
      maxContentChars = 2000,
    } = options;

    const q = query.trim();

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔎 [SorivaSearch v7.1.0] ENTERPRISE GRADE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📝 Query: "${q}"`);
    console.log(`📍 Location: ${userLocation}`);

    // ── STEP 1: DOMAIN DETECTION ──
    const domain = HybridKeywordEngine.detect(q);
    const route = Routing.mapDomainToRoute(domain);
    console.log(`🎯 Domain: ${domain}  →  Route: ${route}`);

    // ── STEP 1.5: SOURCE ROUTING (City-tier aware) ── ✅ FIX 8
    let sourceRouting: SourceRoutingResult | null = null;
    try {
      // Map domain to SourceRouter domain type
      const sourceDomain = mapToSourceDomain(domain);
      sourceRouting = sourceRouter.getSourcesForQuery(q, sourceDomain, userLocation);
      console.log(`🏙️ City Tier: ${sourceRouting.cityTier} | Region: ${sourceRouting.region}`);
      if (sourceRouting.primarySources.length > 0) {
        console.log(`📋 Preferred sources: ${sourceRouting.primarySources.map(s => s.name).join(', ')}`);
      }
    } catch (err) {
      console.log(`   ⚠️ SourceRouter error (non-fatal): ${err}`);
    }

    // ── STEP 2: FESTIVAL SHORTCUT ──
    if (route === "festival") {
      console.log("🎉 Festival route → Calendarific API");
      const festivalResult = await this.handleFestivalQuery(q, userLocation, startTime);
      if (festivalResult) {
        console.log("✅ Festival resolved via Calendarific");
        return festivalResult;
      }
      console.log("⚠️ Calendarific fallback → Web search");
    }

    // ── STEP 3: DATE NORMALIZATION ──
    const dateInfo = DateNormalizer.normalize(q);
    if (dateInfo) console.log(`📅 Date: ${dateInfo.keyword} → ${dateInfo.human}`);

    // ── STEP 4: BUILD + OPTIMIZE QUERY ──
    const rawQuery = this.buildQuery(q, route, dateInfo, userLocation, domain);  // ✅ FIX 3: Pass domain
    const finalQuery = optimizeSearchQuery(rawQuery);
    
    console.log(`📝 Raw: "${rawQuery}"`);
    if (rawQuery !== finalQuery) console.log(`🔄 Optimized: "${finalQuery}"`);

    // ── STEP 5: FRESHNESS + RESULT COUNT ──
    const resultCount = Routing.getResultCount(domain);
    const freshness = FRESHNESS_MAP[domain];
    if (freshness) console.log(`⏰ Freshness: ${freshness} (${domain})`);

    // ── STEP 6: TIER CLASSIFICATION ──
    const tier = ConsistencyEngine.classifyTier(domain, q);
    console.log(`🔒 Verification Tier: ${tier}`);

    // ── STEP 7: PROVIDER SELECTION ──
    // v7.1.1: SourceRouter now INFLUENCES providerOrder
    let providerOrder = PROVIDER_PRIORITY[domain] || PROVIDER_PRIORITY.general;
    
    // Override with SourceRouter recommendations if available
    if (sourceRouting?.primarySources && sourceRouting.primarySources.length > 0) {
      const sourceRouterProviders = mapSourceRouterToProviders(sourceRouting.primarySources);
      if (sourceRouterProviders.length > 0) {
        // Dedupe: SourceRouter providers first, then fallback to default order
        const seen = new Set(sourceRouterProviders);
        const mergedOrder = [
          ...sourceRouterProviders,
          ...providerOrder.filter(p => !seen.has(p))
        ] as Provider[];
        providerOrder = mergedOrder;
        console.log(`🏙️ SourceRouter override: ${providerOrder.join(' → ')}`);
      }
    } else {
      console.log(`🔗 Provider order: ${providerOrder.join(' → ')}`);
    }

    // ── STEP 8: TIERED MULTI-PROVIDER SEARCH ──
    const { searchResult, providerResults } = await tieredMultiProviderSearch(
      q, finalQuery, resultCount, freshness, providerOrder, tier, domain
    );

    if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
      console.log("❌ ALL providers returned NO results");
      return this.emptyResult(domain, route, dateInfo, finalQuery, Date.now() - startTime);
    }

    console.log(`✅ ${searchResult.provider}: ${searchResult.results.length} results in ${searchResult.timeMs}ms`);
    searchResult.results.slice(0, 3).forEach((r: SearchResultItem, i: number) => {
      console.log(`   #${i + 1} → ${r.title?.slice(0, 70) || 'No title'}...`);
    });

    // ── STEP 9: CONSISTENCY VERIFICATION ──
    let verification: ConsistencyResult | null = null;
    if (tier !== 'NO_VERIFY' && providerResults.length > 0) {
      try {
        verification = ConsistencyEngine.verify(providerResults, domain, q, tier);
      } catch (verifyErr) {
        console.log(`   ⚠️ Verification error: ${verifyErr}`);
      }
    }

    // ── STEP 10: RELEVANCE SCORING ──
    // ✅ FIX 4 & 5: Safe flatMap and null check for Relevance.best()
    const allResults = providerResults
      .filter(pr => pr && pr.results && Array.isArray(pr.results))
      .flatMap(pr => pr.results);
    
    const resultsForRelevance = allResults.length > 0 ? allResults : searchResult.results;
    
    let best: SearchResultItem | null = null;
    if (Array.isArray(resultsForRelevance) && resultsForRelevance.length > 0) {
      try {
        best = Relevance.best(q, resultsForRelevance);
      } catch (relErr) {
        console.log(`   ⚠️ Relevance scoring error: ${relErr}`);
        best = resultsForRelevance[0] || null;
      }
    }
    
    if (best) console.log(`🏆 Best: ${best.title?.slice(0, 60) || 'No title'}...`);

    // ── STEP 11: WEBFETCH ──
    let webFetch = null;
    let useSnippetOnly = false;
    let browserlessUsed = false;

    if (enableWebFetch && Routing.shouldWebFetch(domain)) {
      const fetchResult = await fetchBestContent(
        resultsForRelevance,
        q,
        maxContentChars
      );
      webFetch = fetchResult.webFetch;
      useSnippetOnly = fetchResult.useSnippetOnly;
      browserlessUsed = fetchResult.browserlessUsed;
    }

    // ── STEP 12: ASSEMBLE RESULT ──
    const result = this.assembleResult({
      searchResult,
      best,
      webFetch,
      useSnippetOnly,
      domain,
      route,
      dateInfo,
      finalQuery,
      startTime,
      browserlessUsed,
      verification,
      originalQuery: q,
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SEARCH COMPLETE");
    console.log(`📊 Provider: ${result.provider} | Source: ${result.source} | ⏱ ${result.totalTimeMs}ms | 🔥 ${result.promptTokens} tokens`);
    if (result.verification) {
      console.log(`🔒 Verification: ${result.verification.tier} | ${result.verification.confidence} (${(result.verification.confidenceScore * 100).toFixed(0)}%) | ${result.verification.agreement}`);
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return result;
  },

  // ─────────────────────────────────────────────────────────────────
  // 6.2 BUILD QUERY
  // v7.1.1: Added route === 'local' override for location
  // ─────────────────────────────────────────────────────────────────

  buildQuery(
    query: string,
    route: string,
    dateInfo: { date: string; human: string; keyword: string } | null,
    location: string,
    domain?: string  // ✅ FIX 3: Added domain parameter
  ): string {
    let q = query;

    if (dateInfo) {
      q = q.replace(new RegExp(dateInfo.keyword, 'gi'), dateInfo.human);
    }

    // ✅ FIX 3 + v7.1.1: Location addition logic
    // DOMAINS that NEED location: local, food, health, education
    // DOMAINS that DON'T need location: tech, government, travel, general
    const locationDomains = new Set(['local', 'food', 'health', 'education']);
    const hasNearMe = /near\s*me|nearby|mere\s*paas|yahaan|yahan|mere\s*shehar|mere\s*city/i.test(query);
    
    // v7.1.1: Detect inherently local queries even without "near me"
    const inherentlyLocalPatterns = /nearest|timings|timing|address|contact|phone|number|location|direction|how\s*to\s*reach|open\s*now|closed|hours|kahan\s*hai|kidhar|pahunchna/i;
    const isInherentlyLocal = inherentlyLocalPatterns.test(query);
    
    const effectiveDomain = domain || route;
    
    // v7.1.1: route === 'local' ALWAYS overrides domain skip rules
    const isLocalRoute = route === 'local';
    
    const needsLocation = (
      isLocalRoute ||  // ✅ FIX: Local route ALWAYS needs location
      locationDomains.has(effectiveDomain) || 
      hasNearMe || 
      isInherentlyLocal ||  // ✅ FIX: Inherently local queries
      hasShowtimeIntent(query)
    );
    
    // Don't add location for tech, government, travel (they are not location-dependent)
    // BUT if route === 'local', we OVERRIDE this skip
    const skipLocationDomains = new Set(['tech', 'government', 'travel', 'general', 'finance', 'news']);
    const shouldAddLocation = needsLocation && (isLocalRoute || !skipLocationDomains.has(effectiveDomain));

    if (shouldAddLocation && location && !q.toLowerCase().includes(location.toLowerCase())) {
      q = `${q} ${location}`;
      console.log(`   📍 Location auto-added: "${location}" (domain: ${effectiveDomain}, route: ${route})`);
    }

    return q;
  },

  // ─────────────────────────────────────────────────────────────────
  // 6.3 HANDLE FESTIVAL QUERY
  // ✅ FIX 3: festivalService.searchFestivalByName(name, year, countryCode)
  // ─────────────────────────────────────────────────────────────────

  async handleFestivalQuery(
    query: string,
    location: string,
    startTime: number
  ): Promise<SearchResult | null> {
    const festivalName = extractFestivalName(query);
    if (!festivalName) return null;

    try {
      const currentYear = new Date().getFullYear();
      
      // ✅ FIX 3: Correct method - searchFestivalByName(name, year, countryCode)
      const festival = await festivalService.searchFestivalByName(festivalName, currentYear, 'IN');
      
      if (festival) {
        const fact = `${festival.name} is on ${festival.dateHuman} (${festival.date}).${festival.description ? ' ' + festival.description.slice(0, 150) : ''}`;
        const totalTime = Date.now() - startTime;
        
        return {
          fact,
          topTitles: festival.name,
          source: 'calendarific',
          bestUrl: null,
          domain: 'festival',
          route: 'festival',
          dateInfo: { date: festival.date, human: festival.dateHuman, keyword: festivalName },
          braveTimeMs: 0,
          fetchTimeMs: 0,
          totalTimeMs: totalTime,
          promptTokens: Math.ceil(fact.length / 4),
          resultsFound: 1,
          queryUsed: query,
          provider: 'calendarific',
        };
      }
    } catch (err) {
      console.log(`   ⚠️ Calendarific error: ${err}`);
    }

    return null;
  },

  // ─────────────────────────────────────────────────────────────────
  // 6.4 ASSEMBLE RESULT
  // ─────────────────────────────────────────────────────────────────

  assembleResult(params: {
    searchResult: ProviderSearchResult;
    best: SearchResultItem | null;
    webFetch: any;
    useSnippetOnly: boolean;
    domain: string;
    route: string;
    dateInfo: { date: string; human: string; keyword: string } | null;
    finalQuery: string;
    startTime: number;
    browserlessUsed: boolean;
    verification: ConsistencyResult | null;
    originalQuery: string;
  }): SearchResult {
    const {
      searchResult, best, webFetch, useSnippetOnly,
      domain, route, dateInfo, finalQuery, startTime,
      browserlessUsed, verification, originalQuery
    } = params;

    let source: SearchResult['source'] = 'none';
    let fact = '';
    let fetchTimeMs = 0;
    let promptTokens = 0;

    if (webFetch?.success && webFetch.content) {
      source = 'webfetch';
      fact = webFetch.content;
      fetchTimeMs = webFetch.timeMs || 0;
      promptTokens = webFetch.promptTokens || Math.ceil(fact.length / 4);
    } else if (searchResult.answer) {
      source = 'brave_answer';
      fact = searchResult.answer;
      promptTokens = Math.ceil(fact.length / 4);
    } else if (useSnippetOnly || best) {
      source = 'snippet';
      const snippets = searchResult.results
        .slice(0, 5)
        .map(r => r.description)
        .filter(d => d && d.length > 20)
        .join('\n\n');
      fact = snippets;
      promptTokens = Math.ceil(fact.length / 4);
    }

    if (domain === 'entertainment') {
      const rating = extractRatingFromResults(searchResult.results, originalQuery);
      if (rating) {
        fact = `${rating}\n\n${fact}`;
        promptTokens += 10;
      }
    }

    const topTitles = searchResult.results
      .slice(0, 3)
      .map(r => r.title || '')
      .join(' | ');

    // ✅ FIX 7: Tech-specific URL filtering
    // For tech domain, prefer URLs with specs/review/comparison keywords
    let bestUrl = best?.url || searchResult.results[0]?.url || null;
    
    if (domain === 'tech' && searchResult.results.length > 0) {
      const techPreferredPatterns = /specs|specification|review|comparison|features|benchmark|gsmarena|91mobiles|digit\.in|techradar|theverge|engadget/i;
      const techAvoidPatterns = /youtube\.com|facebook\.com|twitter\.com|instagram\.com/i;
      
      // Find best tech URL
      const techUrl = searchResult.results.find(r => {
        if (!r.url) return false;
        if (techAvoidPatterns.test(r.url)) return false;
        return techPreferredPatterns.test(r.url) || techPreferredPatterns.test(r.title || '');
      });
      
      if (techUrl?.url) {
        bestUrl = techUrl.url;
        console.log(`   🔧 Tech URL optimized: ${bestUrl.slice(0, 60)}...`);
      }
    }

    let verificationMeta: SearchResult['verification'] = undefined;
    if (verification) {
      verificationMeta = {
        tier: verification.tier,
        confidence: verification.confidence,
        confidenceScore: verification.confidenceScore,
        agreement: String(verification.agreement),
        providersUsed: verification.providersUsed,
        llmInstruction: verification.llmInstruction,
      };
    }

    return {
      fact,
      topTitles,
      source,
      bestUrl,  // ✅ FIX 7: Use optimized bestUrl
      domain,
      route,
      dateInfo,
      braveTimeMs: searchResult.timeMs,
      fetchTimeMs,
      totalTimeMs: Date.now() - startTime,
      promptTokens,
      resultsFound: searchResult.results.length,
      queryUsed: finalQuery,
      provider: searchResult.provider,
      verification: verificationMeta,
    };
  },

  // ─────────────────────────────────────────────────────────────────
  // 6.5 EMPTY RESULT
  // ─────────────────────────────────────────────────────────────────

  emptyResult(
    domain: string,
    route: string,
    dateInfo: { date: string; human: string; keyword: string } | null,
    queryUsed: string,
    totalTimeMs: number
  ): SearchResult {
    return {
      fact: '',
      topTitles: '',
      source: 'none',
      bestUrl: null,
      domain,
      route,
      dateInfo,
      braveTimeMs: 0,
      fetchTimeMs: 0,
      totalTimeMs,
      promptTokens: 0,
      resultsFound: 0,
      queryUsed,
      provider: 'none',
    };
  },
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║                    § 7. EXPORTS                                ║
// ╚═══════════════════════════════════════════════════════════════╝

export default SorivaSearch;

export async function search(query: string, options?: SearchOptions): Promise<SearchResult> {
  return SorivaSearch.search(query, options);
}

export {
  FRESHNESS_MAP,
  PROVIDER_PRIORITY,
  FESTIVAL_KEYWORDS,
  CINEMA_ANCHOR_WORDS,
  SHOWTIME_KEYWORDS,
  HINGLISH_TRANSLATE,
  HINGLISH_REMOVE,
  SKIP_DOMAINS,
  QUALITY_THRESHOLD,
};

export {
  optimizeSearchQuery,
  extractFestivalName,
  extractRatingFromResults,
  hasCinemaAnchor,
  hasShowtimeIntent,
  extractCinemaName,
  mapToSourceDomain,  // ✅ v7.1.0: Export helper
};

export const VERSION = '7.1.1';  // ✅ Updated version
export const ARCHITECTURE = 'MERGED_ENTERPRISE_V2';