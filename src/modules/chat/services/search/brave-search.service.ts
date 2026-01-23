/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA BRAVE SEARCH SERVICE v2.3
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Risenex Dynamics Pvt. Ltd.
 * Updated: January 2026
 * 
 * v2.3 CHANGES:
 * ✅ FIXED: Web Fetch now works! (bestUrl was hardcoded null)
 * ✅ FIXED: Single search call in smartSearchWithFetch (no rate limit)
 * ✅ Prompt Token Pool integration ready
 * 
 * v2.1 CHANGES:
 * ✅ FIXED: Relevance-based result extraction (no more "Sensex pucha, OIS mila")
 * ✅ IST Timezone Support (Asia/Kolkata)
 * ✅ Enhanced Date Normalization (aaj, kal, parso, narso)
 * ✅ Location-aware hyper-local search
 * ✅ Comprehensive logging with emojis
 * ✅ Ultra-low token output (~150 chars max)
 * ✅ Smart Query Router (Festival, News, Sports, Finance)
 * 
 * Cost: FREE 2000/month, then $3/1000
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from 'axios';
import * as cheerio from 'cheerio';  // 🆕 HTML parsing ke liye

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

export interface BraveResponse {
  query: string;
  results: BraveSearchResult[];
  answer?: string;
  response_time: number;
}

export interface SearchOptions {
  count?: number;
  freshness?: 'pd' | 'pw' | 'pm' | 'py'; // past day/week/month/year
  country?: string;
  searchLang?: string;
}

export interface SmartSearchResult {
  fact: string;
  queryType: QueryType;
  dateUsed: string | null;
  location: string;
  responseTimeMs: number;
}

// 🆕 Web Fetch Result Interface
export interface WebFetchResult {
  url: string;
  content: string;
  title: string;
  promptTokensUsed: number;
  fetchTimeMs: number;
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// KEYWORD SETS
// ═══════════════════════════════════════════════════════════════

const FESTIVAL_KEYWORDS = [
  'festival', 'tyohar', 'holiday', 'chutti', 'parv', 'utsav',
  'panchami', 'ekadashi', 'jayanti', 'purnima', 'amavasya',
  'diwali', 'deepawali', 'holi', 'eid', 'christmas', 'navratri',
  'durga puja', 'ganesh chaturthi', 'raksha bandhan', 'rakhi',
  'baisakhi', 'lohri', 'vasant', 'basant', 'makar sankranti',
  'pongal', 'onam', 'bihu', 'ugadi', 'gudi padwa',
  'guru gobind', 'guru nanak', 'buddha purnima', 'mahavir jayanti',
  'ambedkar jayanti', 'gandhi jayanti', 'netaji', 'subhas chandra bose',
  'republic day', 'independence day', 'holiday list',
  'karwa chauth', 'chhath', 'shivratri', 'janmashtami', 'ram navami'
];

const DATE_KEYWORDS = [
  'today', 'aaj', 'kal', 'tomorrow', 'yesterday', 'parso', 'parson',
  'narso', 'day after', 'agle hafte', 'next week', 'is mahine', 'this month',
  'abhi', 'now', 'current', 'latest', 'live', 'recent', 'breaking',
  'aane wala', 'upcoming', 'agli'
];

const SPORTS_KEYWORDS = [
  'match', 'score', 'cricket', 'ipl', 'world cup', 'football',
  'result', 'winner', 'playing xi', 'toss', 'innings',
  'india vs', 'ind vs', 'live score', 'highlights', 'kabaddi',
  'hockey', 'badminton', 'tennis', 'fifa', 'asia cup'
];

const NEWS_KEYWORDS = [
  'news', 'khabar', 'headline', 'update', 'announced',
  'election', 'vote', 'launch', 'release', 'died', 'death',
  'accident', 'earthquake', 'flood', 'weather', 'breaking',
  'samachar', 'taza khabar'
];

const FINANCE_KEYWORDS = [
  'stock', 'share', 'price', 'sensex', 'nifty', 'market',
  'bitcoin', 'crypto', 'dollar', 'rupee', 'exchange rate',
  'gold price', 'silver price', 'petrol', 'diesel', 'sona', 'chandi'
];

const ENTERTAINMENT_KEYWORDS = [
  'movie', 'film', 'song', 'album', 'release date', 'trailer',
  'box office', 'collection', 'ott', 'netflix', 'amazon prime',
  'bollywood', 'hollywood', 'web series', 'imdb', 'rating'
];

const QUESTION_KEYWORDS = [
  'who is', 'kaun hai', 'what is', 'kya hai', 'how much', 'kitna',
  'when is', 'kab hai', 'where is', 'kahan hai', 'kaun sa', 'which'
];

const REALTIME_KEYWORDS = [
  ...DATE_KEYWORDS,
  ...SPORTS_KEYWORDS,
  ...NEWS_KEYWORDS,
  ...FINANCE_KEYWORDS,
  ...ENTERTAINMENT_KEYWORDS,
  ...QUESTION_KEYWORDS,
  ...FESTIVAL_KEYWORDS
];

// ═══════════════════════════════════════════════════════════════
// IST TIMEZONE UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Get current date/time in IST (India Standard Time)
 */
function getISTDate(): Date {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  return new Date(utc + istOffset);
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date as human-readable (e.g., "22 January 2026")
 */
function formatDateHuman(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ═══════════════════════════════════════════════════════════════
// DATE NORMALIZATION (Enhanced with IST)
// ═══════════════════════════════════════════════════════════════

interface DateNormalizationResult {
  date: string;
  humanReadable: string;
  keyword: string;
}

function normalizeRelativeDate(query: string): DateNormalizationResult | null {
  const now = getISTDate(); // Use IST!
  const lowerQuery = query.toLowerCase();

  // TODAY / AAJ / ABHI
  if (/(today|aaj|\babhi\b|filhaal)/i.test(lowerQuery)) {
    console.log('📅 [Brave] Date keyword detected: TODAY/AAJ');
    return {
      date: formatDate(now),
      humanReadable: formatDateHuman(now),
      keyword: 'today'
    };
  }

  // TOMORROW / KAL (future context)
  if (/(tomorrow|kal(?!.*pehle)(?!.*beeta))/i.test(lowerQuery) && 
      !/(yesterday|beeta|guzra|pehle)/i.test(lowerQuery)) {
    const d = new Date(now);
    d.setDate(now.getDate() + 1);
    console.log('📅 [Brave] Date keyword detected: TOMORROW/KAL');
    return {
      date: formatDate(d),
      humanReadable: formatDateHuman(d),
      keyword: 'tomorrow'
    };
  }

  // YESTERDAY / KAL (past context) / BEETA KAL
  if (/(yesterday|kal.*pehle|beeta.*kal|guzra.*kal|pichla.*din)/i.test(lowerQuery)) {
    const d = new Date(now);
    d.setDate(now.getDate() - 1);
    console.log('📅 [Brave] Date keyword detected: YESTERDAY');
    return {
      date: formatDate(d),
      humanReadable: formatDateHuman(d),
      keyword: 'yesterday'
    };
  }

  // PARSO / PARSON / DAY AFTER TOMORROW (+2 days)
  if (/(parso|parson|day after tomorrow)/i.test(lowerQuery)) {
    const d = new Date(now);
    d.setDate(now.getDate() + 2);
    console.log('📅 [Brave] Date keyword detected: PARSO (+2 days)');
    return {
      date: formatDate(d),
      humanReadable: formatDateHuman(d),
      keyword: 'parso'
    };
  }

  // NARSO / TARSO (+3 days - day after parso)
  if (/(narso|tarso|three days)/i.test(lowerQuery)) {
    const d = new Date(now);
    d.setDate(now.getDate() + 3);
    console.log('📅 [Brave] Date keyword detected: NARSO (+3 days)');
    return {
      date: formatDate(d),
      humanReadable: formatDateHuman(d),
      keyword: 'narso'
    };
  }

  // NEXT WEEK / AGLE HAFTE
  if (/(next week|agle hafte|agli week)/i.test(lowerQuery)) {
    const d = new Date(now);
    d.setDate(now.getDate() + 7);
    console.log('📅 [Brave] Date keyword detected: NEXT WEEK');
    return {
      date: formatDate(d),
      humanReadable: formatDateHuman(d),
      keyword: 'next week'
    };
  }

  // THIS WEEKEND / IS WEEKEND
  if (/(this weekend|is weekend|is hafte ka end)/i.test(lowerQuery)) {
    const d = new Date(now);
    const daysUntilSaturday = (6 - d.getDay() + 7) % 7 || 7;
    d.setDate(now.getDate() + daysUntilSaturday);
    console.log('📅 [Brave] Date keyword detected: THIS WEEKEND');
    return {
      date: formatDate(d),
      humanReadable: formatDateHuman(d),
      keyword: 'weekend'
    };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// QUERY TYPE DETECTION
// ═══════════════════════════════════════════════════════════════

type QueryType = 'festival' | 'sports' | 'finance' | 'news' | 'entertainment' | 'general';

function detectQueryType(query: string): QueryType {
  const l = query.toLowerCase();
  
  if (FESTIVAL_KEYWORDS.some(k => l.includes(k))) return 'festival';
  if (SPORTS_KEYWORDS.some(k => l.includes(k))) return 'sports';
  if (FINANCE_KEYWORDS.some(k => l.includes(k))) return 'finance';
  if (NEWS_KEYWORDS.some(k => l.includes(k))) return 'news';
  if (ENTERTAINMENT_KEYWORDS.some(k => l.includes(k))) return 'entertainment';
  
  return 'general';
}

function isDateDependent(query: string): boolean {
  const l = query.toLowerCase();
  return DATE_KEYWORDS.some(k => l.includes(k));
}

// ═══════════════════════════════════════════════════════════════
// LOCATION PARSER (Hyper-Local)
// ═══════════════════════════════════════════════════════════════

interface ParsedLocation {
  city?: string;
  state?: string;
  country: string;
  searchString: string;
}

function parseLocation(userLocation?: string): ParsedLocation {
  if (!userLocation) {
    return { country: 'India', searchString: 'India' };
  }

  const parts = userLocation.split(',').map(p => p.trim());
  
  if (parts.length >= 3) {
    return {
      city: parts[0],
      state: parts[1],
      country: parts[2] || 'India',
      searchString: `${parts[0]}, ${parts[1]}, India`
    };
  } else if (parts.length === 2) {
    return {
      city: parts[0],
      state: parts[1],
      country: 'India',
      searchString: `${parts[0]}, ${parts[1]}, India`
    };
  } else {
    return {
      city: parts[0],
      country: 'India',
      searchString: `${parts[0]}, India`
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// KEYWORD EXTRACTOR (for relevance scoring)
// ═══════════════════════════════════════════════════════════════

/**
 * Extract meaningful keywords from query for relevance matching
 * Filters out stop words and keeps domain-specific terms
 */
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    // Hindi common words
    'kya', 'hai', 'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'pe',
    'aur', 'ya', 'jo', 'wo', 'ye', 'woh', 'yeh', 'ek', 'do', 'teen',
    'batao', 'bata', 'do', 'de', 'dikhao', 'dikha', 'bol', 'bolo',
    // English common words  
    'what', 'is', 'the', 'a', 'an', 'how', 'much', 'many', 'show', 'tell', 'me',
    'can', 'you', 'please', 'give', 'get', 'find', 'search',
    // Time words (handled separately)
    'aaj', 'kal', 'abhi', 'today', 'now', 'current', 'latest', 'live',
    // Location words (handled separately)
    'india', 'indian', 'in', 'of', 'for', 'and', 'or', 'to', 'at'
  ]);

  // Split query, filter stop words, keep meaningful ones
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Deduplicate and return
  return [...new Set(words)];
}

// ═══════════════════════════════════════════════════════════════
// FACT EXTRACTOR v2.1 (Relevance-Based Selection)
// ═══════════════════════════════════════════════════════════════
// FIX: "Sensex pucha, OIS mila" - now scores results by relevance

function extractBestFact(resp: BraveResponse | null, originalQuery?: string): string {
  if (!resp) return '';

  // 1. Direct answer always wins (Brave's featured snippet)
  if (resp.answer && resp.answer.length > 10) {
    console.log('📌 [Brave] Using direct answer from Brave');
    return resp.answer.slice(0, 300);
  }

  // 2. No results = empty
  if (!resp.results?.length) {
    console.log('⚠️  [Brave] No results found');
    return '';
  }

  // 3. Extract keywords from original query for relevance scoring
  const queryKeywords = extractKeywords(originalQuery || resp.query);
  console.log(`🔑 [Brave] Query keywords: [${queryKeywords.join(', ')}]`);

  // 4. Score each result by relevance
  const scoredResults = resp.results.map((result, index) => {
    const titleLower = result.title.toLowerCase();
    const descLower = result.description.toLowerCase();
    const combinedText = `${titleLower} ${descLower}`;
    let score = 0;

    // A) Keyword matching (primary signal)
    for (const keyword of queryKeywords) {
      const kw = keyword.toLowerCase();
      
      // Title match = strong signal (+15)
      if (titleLower.includes(kw)) {
        score += 15;
      }
      // Description match = good signal (+8)
      if (descLower.includes(kw)) {
        score += 8;
      }
    }

    // B) Position bonus (earlier = slightly better if equal relevance)
    score += Math.max(0, 5 - index);

    // C) Freshness bonus
    if (result.age) {
      if (result.age.includes('hour') || result.age.includes('minute')) score += 4;
      else if (result.age.includes('day')) score += 2;
    }

    // D) Penalty for known irrelevant patterns
    // OIS penalty when not asked about OIS
    if ((combinedText.includes('ois ') || combinedText.includes('overnight indexed swap') || 
         combinedText.includes('overnight index swap')) && 
        !queryKeywords.some(k => k.includes('ois') || k.includes('overnight'))) {
      score -= 25;
      console.log(`   ⚠️  OIS penalty applied to result #${index + 1}`);
    }

    // Generic financial jargon penalty when asking for specific index
    if (queryKeywords.some(k => k === 'sensex' || k === 'nifty')) {
      // If result doesn't contain the specific index name, penalize
      if (queryKeywords.includes('sensex') && !combinedText.includes('sensex')) {
        score -= 15;
      }
      if (queryKeywords.includes('nifty') && !combinedText.includes('nifty')) {
        score -= 15;
      }
    }

    return { result, score, index };
  });

  // 5. Sort by score (highest first)
  scoredResults.sort((a, b) => b.score - a.score);

  // 6. Log scoring for debugging
  console.log('📊 [Brave] Result relevance scores:');
  scoredResults.forEach(({ result, score, index }) => {
    const marker = index === scoredResults[0].index ? '→' : ' ';
    console.log(`   ${marker} #${index + 1} (score: ${score.toString().padStart(3)}): ${result.title.slice(0, 50)}...`);
  });

  // 7. Return best match
  const best = scoredResults[0];
  if (best && best.score > 0) {
    console.log(`✅ [Brave] Selected: Result #${best.index + 1} with score ${best.score}`);
    return best.result.description?.slice(0, 300) || best.result.title.slice(0, 300);
  }

  // 8. Fallback to first result if no good match (backward compatible)
  console.log('⚠️  [Brave] No high-relevance match found, using first result as fallback');
  return resp.results[0].description?.slice(0, 300) || '';
}

// ═══════════════════════════════════════════════════════════════
// BRAVE SEARCH SERVICE CLASS
// ═══════════════════════════════════════════════════════════════

class BraveSearchService {
  private apiKey: string;
  private baseUrl = 'https://api.search.brave.com/res/v1/web/search';

  constructor() {
    this.apiKey = process.env.BRAVE_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  [Brave] API key not configured');
    } else {
      console.log('✅ [Brave] Search Service v2.3 initialized (IST + Relevance + WebFetch)');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK IF SEARCH IS NEEDED
  // ─────────────────────────────────────────────────────────────
  
  needsSearch(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    
    const hasRealtimeKeyword = REALTIME_KEYWORDS.some(keyword => 
      lowerQuery.includes(keyword.toLowerCase())
    );
    
    const questionPatterns = [
      /kaun.*jeet/i,
      /kya.*hua/i,
      /kya.*score/i,
      /kitna.*price/i,
      /what.*happen/i,
      /who.*won/i,
      /how.*much/i,
      /\d{4}.*result/i,
      /vs\s+\w+/i,
      /kaun.*sa.*festival/i,
      /kya.*hai.*kal/i,
      /kaun.*sa.*tyohar/i,
      /kab.*hai/i,
    ];
    
    const matchesPattern = questionPatterns.some(pattern => 
      pattern.test(lowerQuery)
    );
    
    const shouldSearch = hasRealtimeKeyword || matchesPattern;
    
    console.log(`🔍 [Brave] needsSearch("${query.slice(0, 50)}..."): ${shouldSearch}`);
    
    return shouldSearch;
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN SEARCH FUNCTION
  // ─────────────────────────────────────────────────────────────

  async search(query: string, options?: SearchOptions): Promise<BraveResponse | null> {
    if (!this.apiKey) {
      console.error('❌ [Brave] API key not configured');
      return null;
    }

    try {
      console.log(`🔍 [Brave] Searching: "${query}"`);
      const startTime = Date.now();

      const params = new URLSearchParams({
        q: query,
        count: String(options?.count || 5),
        search_lang: options?.searchLang || 'en',
        country: options?.country || 'IN',
      });

      if (options?.freshness) {
        params.append('freshness', options.freshness);
      }

      const response = await axios.get(`${this.baseUrl}?${params}`, {
        headers: {
          'X-Subscription-Token': this.apiKey,
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      const responseTime = Date.now() - startTime;
      console.log(`✅ [Brave] Response in ${responseTime}ms`);

      const data = response.data;

      // Extract results
      const results: BraveSearchResult[] = (data.web?.results || []).map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        description: r.description || '',
        age: r.age || '',
      }));

      // Check for instant answer
      const answer = data.query?.answer || data.infobox?.description || '';

      return {
        query: query,
        results,
        answer,
        response_time: responseTime,
      };

    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('❌ [Brave] API key invalid');
      } else if (error.response?.status === 429) {
        console.error('❌ [Brave] Rate limit exceeded');
      } else {
        console.error('❌ [Brave] Search error:', error.message);
      }
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 🚀 SMART SEARCH v2.1 (Main Entry Point)
  // ─────────────────────────────────────────────────────────────

  async smartSearch(query: string, userLocation?: string): Promise<string> {
    const startTime = Date.now();
    
    // ═══════════════════════════════════════════════════════════
    // LOGGING: Start
    // ═══════════════════════════════════════════════════════════
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 [Brave] SMART SEARCH v2.1');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Original Query: "${query}"`);
    console.log(`📍 User Location: ${userLocation || 'Not provided (default: India)'}`);
    
    // ═══════════════════════════════════════════════════════════
    // STEP 1: Date Normalization (IST)
    // ═══════════════════════════════════════════════════════════
    const dateResult = normalizeRelativeDate(query);
    const queryType = detectQueryType(query);
    const location = parseLocation(userLocation);
    
    console.log(`📅 IST Date: ${formatDateHuman(getISTDate())}`);
    console.log(`📅 Detected Date: ${dateResult ? dateResult.humanReadable : 'None'}`);
    console.log(`📅 Date Keyword: ${dateResult?.keyword || 'None'}`);
    console.log(`🏷️  Query Type: ${queryType.toUpperCase()}`);
    console.log(`🌍 Location: ${location.searchString}`);

    let finalQuery = query;
    let searchOptions: SearchOptions = {
      count: 5,
      country: 'IN',
    };

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Query Type Routing
    // ═══════════════════════════════════════════════════════════

    // A) FESTIVAL QUERIES
    if (queryType === 'festival') {
      if (dateResult) {
        finalQuery = `festival holiday on ${dateResult.humanReadable} in ${location.searchString}`;
      } else {
        finalQuery = `upcoming festival holiday in ${location.searchString}`;
      }
      searchOptions.freshness = 'pm';
      console.log('🎪 [Brave] Route: FESTIVAL');
    }

    // B) SPORTS QUERIES
    else if (queryType === 'sports') {
      finalQuery = `${query} latest score result`;
      searchOptions.freshness = 'pd';
      console.log('🏏 [Brave] Route: SPORTS');
    }

    // C) FINANCE QUERIES
    else if (queryType === 'finance') {
      finalQuery = `${query} price today India`;
      searchOptions.freshness = 'pd';
      console.log('💰 [Brave] Route: FINANCE');
    }

    // D) NEWS QUERIES
    else if (queryType === 'news') {
      if (dateResult) {
        finalQuery = `${location.searchString} news ${dateResult.humanReadable}`;
      } else {
        finalQuery = `${query} ${location.searchString}`;
      }
      searchOptions.freshness = 'pd';
      console.log('📰 [Brave] Route: NEWS');
    }

    // E) ENTERTAINMENT QUERIES
    else if (queryType === 'entertainment') {
      finalQuery = `${query} India latest`;
      searchOptions.freshness = 'pw';
      console.log('🎬 [Brave] Route: ENTERTAINMENT');
    }

    // F) DATE-DEPENDENT GENERAL QUERIES
    else if (isDateDependent(query) && dateResult) {
      finalQuery = `${query} ${dateResult.humanReadable} ${location.searchString}`;
      console.log('📅 [Brave] Route: DATE-DEPENDENT');
    }

    // G) DEFAULT
    else {
      finalQuery = `${query} ${location.searchString}`;
      console.log('🔎 [Brave] Route: GENERAL');
    }

    console.log(`🎯 Final Query: "${finalQuery}"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ═══════════════════════════════════════════════════════════
    // STEP 3: Execute Search
    // ═══════════════════════════════════════════════════════════
    const resp = await this.search(finalQuery, searchOptions);
    
    // v2.1 FIX: Pass original query for relevance scoring
    const fact = extractBestFact(resp, query);
    
    const totalTime = Date.now() - startTime;
    
    // ═══════════════════════════════════════════════════════════
    // LOGGING: Result
    // ═══════════════════════════════════════════════════════════
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [Brave] SMART SEARCH RESULT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Results Found: ${resp?.results?.length || 0}`);
    console.log(`📝 Fact: "${fact.slice(0, 80)}..."`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`📏 Fact Length: ${fact.length} chars (~${Math.ceil(fact.length / 4)} tokens)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    return fact;
  }

  // ─────────────────────────────────────────────────────────────
  // SPECIALIZED SEARCH METHODS
  // ─────────────────────────────────────────────────────────────

  async searchNews(query: string, location?: string): Promise<string> {
    console.log('📰 [Brave] searchNews called');
    const resp = await this.search(`${query} ${location || 'India'} news`, {
      count: 5,
      freshness: 'pd',
    });
    return extractBestFact(resp, query);
  }

  async searchSports(query: string): Promise<string> {
    console.log('🏏 [Brave] searchSports called');
    const resp = await this.search(`${query} latest score result`, {
      count: 3,
      freshness: 'pd',
    });
    return extractBestFact(resp, query);
  }

  async searchFinance(query: string, location?: string): Promise<string> {
    console.log('💰 [Brave] searchFinance called');
    const resp = await this.search(`${query} price today ${location || 'India'}`, {
      count: 3,
      freshness: 'pd',
    });
    return extractBestFact(resp, query);
  }

  async searchFestival(query: string, location?: string): Promise<string> {
    console.log('🎪 [Brave] searchFestival called');
    const dateResult = normalizeRelativeDate(query);
    const loc = location || 'India';
    
    const finalQuery = dateResult
      ? `festival holiday on ${dateResult.humanReadable} in ${loc}`
      : `${query} ${loc} festival calendar`;
    
    const resp = await this.search(finalQuery, {
      count: 5,
      freshness: 'pm',
    });
    return extractBestFact(resp, query);
  }

  // ─────────────────────────────────────────────────────────────
  // 🌐 WEB FETCH v1.0 - Full Content Extraction (Perplexity Style)
  // ─────────────────────────────────────────────────────────────

  /**
   * Fetch full content from a URL
   * @param url - URL to fetch
   * @param maxChars - Maximum characters to extract (default: 2000)
   * @returns WebFetchResult with content and token usage
   */
  async webFetch(url: string, maxChars: number = 2000): Promise<WebFetchResult> {
    const startTime = Date.now();
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 [WebFetch] CONTENT EXTRACTION v1.0');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔗 URL: ${url}`);
    console.log(`📏 Max Chars: ${maxChars}`);

    try {
      // Fetch the page
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SorivaBot/1.0; +https://soriva.in)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5,hi;q=0.3',
        },
        maxRedirects: 3,
      });

      const fetchTime = Date.now() - startTime;
      console.log(`✅ [WebFetch] Page fetched in ${fetchTime}ms`);

      // Parse HTML with Cheerio
      const $ = cheerio.load(response.data);

      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .ads, .advertisement, .sidebar, .comments, .related').remove();

      // Extract title
      const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

      // Extract main content (prioritize article, main, or body)
      let content = '';
      
      const selectors = [
        'article p',
        'main p', 
        '.content p',
        '.article-body p',
        '.post-content p',
        '.entry-content p',
        'body p'
      ];

      for (const selector of selectors) {
        const paragraphs = $(selector);
        if (paragraphs.length > 0) {
          paragraphs.each((_, el) => {
            const text = $(el).text().trim();
            if (text.length > 30) { // Skip very short paragraphs
              content += text + ' ';
            }
          });
          if (content.length > 200) break; // Got enough content
        }
      }

      // Clean up content
      content = content
        .replace(/\s+/g, ' ')           // Multiple spaces → single space
        .replace(/\n+/g, ' ')            // Newlines → space
        .replace(/\t+/g, ' ')            // Tabs → space
        .trim()
        .slice(0, maxChars);             // Limit to maxChars

      // Calculate prompt tokens (approximate: 1 token ≈ 4 chars)
      const promptTokensUsed = Math.ceil(content.length / 4);
      const totalTime = Date.now() - startTime;

      console.log(`📄 [WebFetch] Title: "${title.slice(0, 50)}..."`);
      console.log(`📝 [WebFetch] Content extracted: ${content.length} chars`);
      console.log(`🎯 [WebFetch] Prompt Tokens: ${promptTokensUsed}`);
      console.log(`⏱️  [WebFetch] Total Time: ${totalTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return {
        url,
        content,
        title,
        promptTokensUsed,
        fetchTimeMs: totalTime,
        success: true,
      };

    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ [WebFetch] Error: ${error.message}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return {
        url,
        content: '',
        title: '',
        promptTokensUsed: 0,
        fetchTimeMs: totalTime,
        success: false,
        error: error.message,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 🚀 SMART SEARCH WITH WEB FETCH v2.3 (FIXED!)
  // ─────────────────────────────────────────────────────────────

  /**
   * Enhanced search that fetches full content from best result
   * @param query - Search query
   * @param userLocation - User's location
   * @param enableWebFetch - Whether to fetch full content (default: true)
   * @returns Enhanced search result with full content and token usage
   */
  async smartSearchWithFetch(
    query: string, 
    userLocation?: string,
    enableWebFetch: boolean = true
  ): Promise<{ fact: string; webFetch?: WebFetchResult; totalPromptTokens: number; bestUrl?: string }> {
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 [Brave] SMART SEARCH WITH WEB FETCH v2.3');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📝 Query: "${query}"`);
    console.log(`📍 Location: ${userLocation || 'India'}`);
    console.log(`🌐 Web Fetch: ${enableWebFetch ? 'ENABLED' : 'DISABLED'}`);

    const startTime = Date.now();

    // ═══════════════════════════════════════════════════════════
    // STEP 1: Build Query (reusing smartSearch logic)
    // ═══════════════════════════════════════════════════════════
    const dateResult = normalizeRelativeDate(query);
    const queryType = detectQueryType(query);
    const location = parseLocation(userLocation);
    
    let finalQuery = query;
    let searchOptions: SearchOptions = {
      count: 5,
      country: 'IN',
    };

    // Query Type Routing
    if (queryType === 'festival') {
      finalQuery = dateResult
        ? `festival holiday on ${dateResult.humanReadable} in ${location.searchString}`
        : `upcoming festival holiday in ${location.searchString}`;
      searchOptions.freshness = 'pm';
    } else if (queryType === 'sports') {
      finalQuery = `${query} latest score result`;
      searchOptions.freshness = 'pd';
    } else if (queryType === 'finance') {
      finalQuery = `${query} price today India`;
      searchOptions.freshness = 'pd';
    } else if (queryType === 'news') {
      finalQuery = dateResult
        ? `${location.searchString} news ${dateResult.humanReadable}`
        : `${query} ${location.searchString}`;
      searchOptions.freshness = 'pd';
    } else if (queryType === 'entertainment') {
      finalQuery = `${query} India latest`;
      searchOptions.freshness = 'pw';
    } else if (isDateDependent(query) && dateResult) {
      finalQuery = `${query} ${dateResult.humanReadable} ${location.searchString}`;
    } else {
      finalQuery = `${query} ${location.searchString}`;
    }

    console.log(`🏷️  Query Type: ${queryType.toUpperCase()}`);
    console.log(`🎯 Final Query: "${finalQuery}"`);

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Execute Search (SINGLE CALL - no duplication!)
    // ═══════════════════════════════════════════════════════════
    const searchResponse = await this.search(finalQuery, searchOptions);
    
    if (!searchResponse || !searchResponse.results || searchResponse.results.length === 0) {
      console.log('⚠️  [Brave] No results found');
      return {
        fact: 'No relevant information found.',
        totalPromptTokens: 0,
      };
    }

    // Extract fact from results
    const fact = extractBestFact(searchResponse, query);
    
    // 🔥 v2.3 FIX: Extract bestUrl from search results (was hardcoded null!)
    const bestUrl = searchResponse.results[0]?.url || null;
    
    console.log(`📊 Results Found: ${searchResponse.results.length}`);
    console.log(`📝 Snippet: "${fact.slice(0, 80)}..."`);
    console.log(`🔗 Best URL: ${bestUrl || 'None'}`);

    let webFetchResult: WebFetchResult | undefined;
    let totalPromptTokens = Math.ceil(fact.length / 4); // Snippet tokens as base

    // ═══════════════════════════════════════════════════════════
    // STEP 3: Web Fetch (if enabled and URL available)
    // ═══════════════════════════════════════════════════════════
    if (enableWebFetch && bestUrl) {
      console.log('');
      console.log('📥 [Brave] Fetching full content from best result...');
      
      try {
        webFetchResult = await this.webFetch(bestUrl, 2000);
        
        if (webFetchResult.success && webFetchResult.content.length > 100) {
          totalPromptTokens = webFetchResult.promptTokensUsed;
          
          console.log('');
          console.log('═══════════════════════════════════════════════════════');
          console.log('📊 [Brave] PROMPT TOKEN SUMMARY');
          console.log('═══════════════════════════════════════════════════════');
          console.log(`📝 Snippet Tokens: ${Math.ceil(fact.length / 4)}`);
          console.log(`🌐 WebFetch Tokens: ${webFetchResult.promptTokensUsed}`);
          console.log(`🎯 Total Prompt Tokens (using WebFetch): ${totalPromptTokens}`);
          console.log('═══════════════════════════════════════════════════════');
        } else {
          console.log('⚠️  [Brave] WebFetch returned insufficient content, using snippet');
          webFetchResult = undefined;
        }
      } catch (error: any) {
        console.error(`❌ [Brave] WebFetch error: ${error.message}`);
        webFetchResult = undefined;
      }
    } else if (!bestUrl) {
      console.log('⚠️  [Brave] No URL available for WebFetch');
    }

    const totalTime = Date.now() - startTime;
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ [Brave] SEARCH COMPLETE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`📏 Content Source: ${webFetchResult?.success ? 'WebFetch' : 'Snippet'}`);
    console.log(`🎯 Final Prompt Tokens: ${totalPromptTokens}`);
    console.log('═══════════════════════════════════════════════════════');

    return {
      fact: webFetchResult?.success ? webFetchResult.content : fact,
      webFetch: webFetchResult,
      totalPromptTokens,
      bestUrl: bestUrl || undefined,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const braveSearchService = new BraveSearchService();

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE EXPORT
// ═══════════════════════════════════════════════════════════════

/**
 * Main entry point for Soriva search
 * Usage: const result = await sorivaSearch("kal kaun sa festival hai", "Ferozepur, Punjab, India");
 */
export async function sorivaSearch(query: string, userLocation?: string): Promise<string> {
  return braveSearchService.smartSearch(query, userLocation);
}