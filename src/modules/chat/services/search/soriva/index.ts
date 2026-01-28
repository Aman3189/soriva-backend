/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH v3.3 - MASTER ORCHESTRATOR (Production Ready)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/soriva/index.ts
 * 
 * Pipeline:
 * - Hybrid Engine (Semantic + Fuzzy, zero LLM cost)
 * - Routing (Domain → Optimized search query)
 * - Date Normalizer (IST-aware)
 * - Brave API (Fast web search)
 * - Relevance Scoring (Title 15, Desc 8, Freshness, Source)
 * - WebFetch (Deep content extraction)
 * 
 * UPGRADE v3.3 (FESTIVAL FIX):
 * - Festival queries → Calendarific API (NOT Brave)
 * - Accurate dates, no 2025 results
 * - Token savings: 1355 → ~50 tokens
 * - Zero LLM hallucination for festivals
 * 
 * UPGRADE v3.2:
 * - snippetOnly handling (JS-heavy sites like IMDb)
 * - Clean fact output (NO internal tags visible to user)
 * - LLM-ready context format
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { HybridKeywordEngine } from "../engine/hybrid/keyword-engine";
import { Routing } from "../core/routing";
import { DateNormalizer } from "../engine/date-normalizer";
import { BraveService } from "../services/brave";
import { Relevance } from "../engine/relevance";
import { WebFetchService } from "../services/webfetch";
import { BrowserlessService } from "../services/browserless";
import { SearchResultItem } from "../core/data";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEW v3.3: FESTIVAL SERVICE IMPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  dateInfo: {
    date: string;
    human: string;
    keyword: string;
  } | null;

  braveTimeMs: number;
  fetchTimeMs: number;
  totalTimeMs: number;

  promptTokens: number;

  resultsFound: number;
  queryUsed: string;
}

export interface SearchOptions {
  userLocation?: string;
  maxContentChars?: number;
  enableWebFetch?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FESTIVAL NAME EXTRACTOR
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
    if (q.includes(festival)) {
      return festival;
    }
  }
  
  return null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MASTER ORCHESTRATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SorivaSearch = {
  /**
   * Main entry point
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const {
      userLocation = "India",
      enableWebFetch = true,
      maxContentChars = 2000,
    } = options;

    const q = query.trim();

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔎 [SorivaSearch v3.3] SEARCH STARTED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📝 Query: "${q}"`);
    console.log(`📍 Location: ${userLocation}`);

    // ─────────────────────────────────────────────────────────────
    // 1. DOMAIN DETECTION
    // ─────────────────────────────────────────────────────────────
    const domain = HybridKeywordEngine.detect(q);
    const route = Routing.mapDomainToRoute(domain);

    console.log(`🎯 Domain: ${domain}  →  Route: ${route}`);

    // ─────────────────────────────────────────────────────────────
    // 2. FESTIVAL SHORTCUT (NEW v3.3)
    // Skip Brave entirely for festival queries → Use Calendarific
    // ─────────────────────────────────────────────────────────────
    if (route === "festival") {
      console.log("🎉 [v3.3] Festival route detected → Using Calendarific API");
      
      const festivalResult = await this.handleFestivalQuery(q, userLocation, startTime);
      
      if (festivalResult) {
        console.log("✅ [v3.3] Festival resolved via Calendarific");
        return festivalResult;
      }
      
      console.log("⚠️ [v3.3] Calendarific fallback → Trying Brave");
    }

    // ─────────────────────────────────────────────────────────────
    // 3. DATE NORMALIZATION
    // ─────────────────────────────────────────────────────────────
    const dateInfo = DateNormalizer.normalize(q);
    if (dateInfo) {
      console.log(`📅 Date detected: ${dateInfo.keyword} → ${dateInfo.human}`);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. BUILD FINAL QUERY
    // ─────────────────────────────────────────────────────────────
    const finalQuery = this.buildQuery(q, route, dateInfo, userLocation);
    console.log(`🔎 Final Query: "${finalQuery}"`);

    // Domain-based result count
    const resultCount = Routing.getResultCount(domain);

    // ─────────────────────────────────────────────────────────────
    // 5. BRAVE SEARCH
    // ─────────────────────────────────────────────────────────────
    const brave = await BraveService.search(finalQuery, resultCount);

    if (!brave || brave.results.length === 0) {
      console.log("❌ Brave returned NO results");
      return this.emptyResult(domain, route, dateInfo, finalQuery, Date.now() - startTime);
    }

    console.log(`✅ Brave: ${brave.results.length} results in ${brave.timeMs}ms`);

    brave.results.slice(0, 3).forEach((r, i) => {
      console.log(`   #${i + 1} → ${r.title.slice(0, 70)}...`);
    });

    // ─────────────────────────────────────────────────────────────
    // 6. RELEVANCE SCORING
    // ─────────────────────────────────────────────────────────────
    const best = Relevance.best(q, brave.results);
    const bestUrl = best?.url || null;

    if (best) console.log(`🏆 Best Match: ${best.title.slice(0, 60)}...`);

    // ─────────────────────────────────────────────────────────────
    // 7. WEBFETCH (with snippetOnly handling)
    // ─────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────
    // 7. WEBFETCH (with RETRY on fail - try next URLs)
    // ─────────────────────────────────────────────────────────────
    let webFetch = null;
    let useSnippetOnly = false;
    let usedUrl = bestUrl;
    let browserlessUsed = false;

    if (enableWebFetch && Routing.shouldWebFetch(domain)) {
      // Get ranked URLs to try (best first, then alternatives)
      const rankedResults = Relevance.rank(q, brave.results).slice(0, 3);
      
      // v3.4: Skip these domains entirely - they always fail
      const SKIP_DOMAINS = [
        'india.gov.in', 'gov.in', 'nic.in', 'mygov.in',
        'punjab.gov.in', 'haryana.gov.in', 'rajasthan.gov.in',
        'scribd.com', 'slideshare.net', 'linkedin.com'
      ];
      
      for (const result of rankedResults) {
        if (!result.url) continue;
        
        // v3.4: Skip unreliable domains
        const urlLower = result.url.toLowerCase();
        if (SKIP_DOMAINS.some(d => urlLower.includes(d))) {
          console.log(`   ⏭ Skipped unreliable: ${result.url.slice(0, 50)}...`);
          continue;
        }
        
        // ─────────────────────────────────────────────────────────
        // CHECK: Does this URL need Browserless? (Zomato, JustDial, etc.)
        // ─────────────────────────────────────────────────────────
        if (BrowserlessService.needsBrowserless(result.url) && BrowserlessService.isConfigured()) {
          console.log(`🌐 Browserless → ${result.url.slice(0, 80)}...`);
          const browserlessResult = await BrowserlessService.fetch(result.url, maxContentChars);
          
          if (browserlessResult.success) {
            console.log(`   ✅ Browserless extracted ${browserlessResult.contentLength} chars in ${browserlessResult.timeMs}ms`);
            webFetch = {
              success: true,
              url: browserlessResult.url,
              title: browserlessResult.title,
              content: browserlessResult.content,
              contentLength: browserlessResult.contentLength,
              promptTokens: browserlessResult.promptTokens,
              timeMs: browserlessResult.timeMs,
            };
            usedUrl = result.url;
            browserlessUsed = true;
            break;
          } else {
            console.log(`   ⚠ Browserless failed: ${browserlessResult.error}`);
            // Fall through to snippet
            useSnippetOnly = true;
            break;
          }
        }
        
        // Normal WebFetch for non-JS-heavy sites
        console.log(`🌐 WebFetch → ${result.url.slice(0, 80)}...`);
        webFetch = await WebFetchService.fetch(result.url, maxContentChars);
        
        if (webFetch.success) {
          console.log(`   ✅ Extracted ${webFetch.contentLength} chars in ${webFetch.timeMs}ms`);
          usedUrl = result.url;
          break;
        } else if (webFetch.snippetOnly) {
          // JS-heavy site detected but Browserless not configured
          if (BrowserlessService.needsBrowserless(result.url) && !BrowserlessService.isConfigured()) {
            console.log(`   ⚡ JS-heavy site detected - Browserless not configured, using snippet`);
          } else {
            console.log(`   ⚡ JS-heavy site - using Brave snippet directly`);
          }
          useSnippetOnly = true;
          break;
        } else {
          console.log(`   ⚠ WebFetch failed: ${webFetch.error}, trying next...`);
        }
      }
      
      // If all URLs failed, use snippet
      if (!webFetch?.success && !useSnippetOnly) {
        console.log(`   📝 All WebFetch failed, using snippets`);
        useSnippetOnly = true;
      }
    }
    // ─────────────────────────────────────────────────────────────
    // 8. ASSEMBLE FINAL OUTPUT (CLEAN FORMAT)
    // ─────────────────────────────────────────────────────────────
    const result = this.assembleResult({
      brave,
      best,
      webFetch,
      useSnippetOnly,
      domain,
      route,
      dateInfo,
      finalQuery,
      startTime,
      browserlessUsed,
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SEARCH COMPLETE");
    console.log(`📊 Source Used: ${result.source}`);
    console.log(`⏱ Total Time: ${result.totalTimeMs}ms`);
    console.log(`🔥 Tokens: ${result.promptTokens}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return result;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NEW v3.3: FESTIVAL QUERY HANDLER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async handleFestivalQuery(
    query: string,
    location: string,
    startTime: number
  ): Promise<SearchResult | null> {
    try {
      const festivalName = extractFestivalName(query);
      
      if (festivalName) {
        // User asking "Holi kab hai?" → Search by name
        console.log(`🔍 [Festival] Searching by name: "${festivalName}"`);
        
        const currentYear = new Date().getFullYear();
        const festival = await festivalService.searchFestivalByName(festivalName, currentYear, 'IN');
        
        if (festival) {
          const fact = `${festival.name} is on ${festival.dateHuman} (${festival.date}).${festival.description ? ' ' + festival.description.slice(0, 150) : ''}`;
          
          console.log(`✅ [Festival] Found: ${festival.name} on ${festival.dateHuman}`);
          
          return {
            fact,
            topTitles: festival.name,
            source: "calendarific",
            bestUrl: null,
            domain: "festival",
            route: "festival",
            dateInfo: {
              date: festival.date,
              human: festival.dateHuman,
              keyword: festivalName,
            },
            braveTimeMs: 0,
            fetchTimeMs: 0,
            totalTimeMs: Date.now() - startTime,
            promptTokens: Math.ceil(fact.length / 4),
            resultsFound: 1,
            queryUsed: query,
          };
        }
      }
      
      // Check if user asking "kal/aaj kaun sa festival hai?"
      const dateKeywords = ['today', 'aaj', 'kal', 'tomorrow', 'parso'];
      const hasDateKeyword = dateKeywords.some(k => query.toLowerCase().includes(k));
      
      if (hasDateKeyword) {
        console.log(`🔍 [Festival] Searching by date keyword`);
        
        // Parse location
        const locationParts = location.split(/[,\s]+/).filter(Boolean);
        const city = locationParts[0];
        const state = locationParts[1];
        const country = locationParts[2] || 'India';
        
        const result = await festivalService.getFestivalsForDate({
          city,
          state,
          country,
        });
        
        if (result.success && result.primaryFestival) {
          const f = result.primaryFestival;
          const fact = `${result.dateHuman} is ${f.name}.${f.description ? ' ' + f.description.slice(0, 150) : ''}`;
          
          console.log(`✅ [Festival] Found: ${f.name} on ${result.dateHuman}`);
          
          return {
            fact,
            topTitles: f.name,
            source: "calendarific",
            bestUrl: null,
            domain: "festival",
            route: "festival",
            dateInfo: {
              date: result.date,
              human: result.dateHuman,
              keyword: "today",
            },
            braveTimeMs: 0,
            fetchTimeMs: 0,
            totalTimeMs: Date.now() - startTime,
            promptTokens: Math.ceil(fact.length / 4),
            resultsFound: result.count,
            queryUsed: query,
          };
        }
      }
      
      return null; // Fallback to Brave
      
    } catch (error: any) {
      console.error(`❌ [Festival] Error: ${error.message}`);
      return null; // Fallback to Brave
    }
  },


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUILD QUERY (ROUTE-AWARE) - v3.4 FIX
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
buildQuery(
  query: string,
  route: string,
  dateInfo: { human: string } | null,
  location: string
): string {
  const dateText = dateInfo ? ` ${dateInfo.human}` : "";
  const q = query.toLowerCase();

  // ═══════════════════════════════════════════════════════════════
  // LOCAL BUSINESS KEYWORDS
  // ═══════════════════════════════════════════════════════════════
  const localBusinessKeywords = ['theatre', 'theater', 'cinema', 'movie hall', 'multiplex'];
  const restaurantKeywords = ['restaurant', 'hotel', 'cafe', 'dhaba', 'food'];
  const hospitalKeywords = ['hospital', 'clinic', 'doctor', 'medical', 'pharmacy'];
  
  const isTheatreQuery = localBusinessKeywords.some(kw => q.includes(kw));
  const isRestaurantQuery = restaurantKeywords.some(kw => q.includes(kw));
  const isHospitalQuery = hospitalKeywords.some(kw => q.includes(kw));

  // ═══════════════════════════════════════════════════════════════
  // NEW v3.4: MOVIE SHOWTIME DETECTION
  // "border 2 lagi hai" → movie showtime, NOT geographical border
  // ═══════════════════════════════════════════════════════════════
  const movieShowtimeKeywords = [
    'lagi', 'lagi hai', 'lag rahi', 'chal rahi', 'chal raha', 
    'running', 'showtime', 'show time', 'playing', 'screening',
    'ticket', 'book', 'kab lagi', 'kahan lagi', 'yahaan', 'yahan',
    'mere shehar', 'mere city', 'hometown'
  ];
  const isMovieShowtimeQuery = movieShowtimeKeywords.some(kw => q.includes(kw));
  
  // Detect if query contains a movie name pattern (word + number like "border 2")
  const hasMovieNamePattern = /\b(border|race|dhoom|krrish|bahubali|pushpa|jawan|pathaan|tiger|war|bang bang|don|dabangg|singham|golmaal|housefull|dhamaal|welcome|no entry|hera pheri|de de pyaar de|animal|fighter|bade miyan|stree|bhool bhulaiyaa)\s*\d*\b/i.test(q);

  // Theatre/Cinema → BookMyShow + JustDial
  if (isTheatreQuery) {
    return `${query} justdial bookmyshow cinema theatre ${location}`;
  }
      
  // Restaurant → Zomato/JustDial prefer
  if (isRestaurantQuery) {
    return `${query} zomato justdial ${location}`;
  }
  
  // Hospital → Practo/JustDial prefer
  if (isHospitalQuery) {
    return `${query} practo justdial ${location}`;
  }

  switch (route) {
    case "festival":
      return dateInfo
        ? `festival on ${dateInfo.human} in ${location}`
        : `${query} festival date significance ${location}`;

    case "sports":
      return `${query} latest score result${dateText} ${location}`;

    case "finance":
      return `${query} price today live chart ${location}`;

    case "news":
      return `${query} latest update ${location}`;

    case "entertainment":
      // ═══════════════════════════════════════════════════════════
      // v3.4 FIX: Movie showtime queries need location + BookMyShow
      // ═══════════════════════════════════════════════════════════
      if (isMovieShowtimeQuery || hasMovieNamePattern) {
        // Extract movie name (remove showtime keywords)
        let movieName = query
          .replace(/\b(lagi|lagi hai|lag rahi|chal rahi|chal raha|hai|yahaan|yahan|mere shehar|mere city|hometown|kahan|kab)\b/gi, '')
          .trim();
        
        console.log(`   🎬 [v3.4] Movie showtime detected: "${movieName}" in ${location}`);
        
        return `${movieName} movie showtimes bookmyshow ${location}`;
      }
      
      // General entertainment (rating, cast, etc.) - no location needed
      return `${query} release date rating review cast`;

    case "weather":
      return `${query} weather forecast today ${location}`;

    default:
      // FIX v3.4: Don't add location for factual queries like "What is X"
      const isFactualQuery = /^(what|who|when|where|why|how|kya|kaun|kab|kahan|kyun|kaise)\s+(is|are|was|were|hai|hain|tha|the|thi)\b/i.test(query);
      if (isFactualQuery) {
        return `${query}${dateText}`;  // No location for "What is Sora" type
      }
      return `${query}${dateText} ${location}`;
  }
},

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ASSEMBLE RESULT (CLEAN OUTPUT - NO INTERNAL TAGS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  assembleResult(data: any): SearchResult {
    const { brave, best, webFetch, useSnippetOnly, domain, route, dateInfo, finalQuery, startTime } = data;

    const topTitles = brave.results
      .slice(0, 3)
      .map((r: SearchResultItem) => r.title)
      .join(" | ");

    // ─────────────────────────────────────────────────────────────
    // SMART RATING EXTRACTION from Brave snippets
    // Extracts IMDB ratings (⭐ X.X) from search result titles
    // ─────────────────────────────────────────────────────────────
    let extractedRating: string | null = null;
    const isRatingQuery = /\b(rating|imdb|score|review)\b/i.test(finalQuery);
    
    if (isRatingQuery && brave.results?.length > 0) {
      for (const result of brave.results.slice(0, 5)) {
        const title = result.title || '';
        const desc = result.description || '';
        const combined = `${title} ${desc}`;
        
        // Pattern: ⭐ 8.0 or Rating: 8.0/10 or 8.0/10 or IMDB: 8.0
        const ratingPatterns = [
          /⭐\s*(\d+\.?\d*)/,                    // ⭐ 8.0
          /(\d+\.?\d*)\s*\/\s*10/,               // 8.0/10
          /rating[:\s]+(\d+\.?\d*)/i,            // Rating: 8.0
          /imdb[:\s]+(\d+\.?\d*)/i,              // IMDB: 8.0
          /(\d+\.?\d*)\s*out\s*of\s*10/i,        // 8.0 out of 10
        ];
        
        for (const pattern of ratingPatterns) {
          const match = combined.match(pattern);
          if (match && match[1]) {
            const rating = parseFloat(match[1]);
            if (rating >= 1 && rating <= 10) {
              extractedRating = `IMDB Rating: ${rating}/10 (from ${result.url?.includes('imdb') ? 'IMDB' : 'search results'})`;
              console.log(`   🎬 Smart Rating Extracted: ${rating}/10`);
              break;
            }
          }
        }
        if (extractedRating) break;
      }
    }

    let fact = "";
    let source: SearchResult["source"] = "none";

    if (webFetch?.success && webFetch.content.length > 100) {
      // Prepend extracted rating to WebFetch content if available
      const ratingPrefix = extractedRating ? `${extractedRating}\n\n` : '';
      
      fact = this.buildLLMContext({
        contentType: "extracted",
        title: webFetch.title,
        content: ratingPrefix + webFetch.content,
        url: best?.url,
      });
      source = "webfetch";
    }
    else if (best && (useSnippetOnly || !webFetch?.success)) {
      const snippet = best.description || brave.answer || "";
      
      fact = this.buildLLMContext({
        contentType: "snippet",
        title: best.title,
        content: extractedRating ? `${extractedRating}\n\n${snippet}` : snippet,
        url: best.url,
        extraTitles: topTitles,
      });
      source = "snippet";
    }
    else if (brave.answer && brave.answer.length > 30) {
      fact = this.buildLLMContext({
        contentType: "answer",
        content: extractedRating ? `${extractedRating}\n\n${brave.answer}` : brave.answer,
        extraTitles: topTitles,
      });
      source = "brave_answer";
    }
    else {
      fact = "No relevant information found for this query.";
      source = "none";
    }

    const promptTokens = Math.ceil(fact.length / 4);

    return {
      fact,
      topTitles,
      source,
      bestUrl: best?.url || null,

      domain,
      route,
      dateInfo,

      braveTimeMs: brave.timeMs,
      fetchTimeMs: webFetch?.timeMs || 0,
      totalTimeMs: Date.now() - startTime,

      promptTokens,
      resultsFound: brave.results.length,
      queryUsed: finalQuery,
    };
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUILD LLM CONTEXT (Clean, no internal tags visible)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  buildLLMContext(params: {
    contentType: "extracted" | "snippet" | "answer";
    title?: string;
    content: string;
    url?: string;
    extraTitles?: string;
  }): string {
    const { contentType, title, content, url, extraTitles } = params;

    let context = "";

    if (title) {
      context += `${title}\n\n`;
    }

    context += content.trim();

    if (extraTitles && contentType === "snippet") {
      context += `\n\nRelated: ${extraTitles}`;
    }

    if (url) {
      context += `\n\nSource: ${url}`;
    }

    return context.trim();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMPTY RESULT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  emptyResult(
    domain: string,
    route: string,
    dateInfo: any,
    q: string,
    time: number
  ): SearchResult {
    return {
      fact: "No results found.",
      topTitles: "",
      source: "none",
      bestUrl: null,

      domain,
      route,
      dateInfo,

      braveTimeMs: 0,
      fetchTimeMs: 0,
      totalTimeMs: time,

      promptTokens: 0,
      resultsFound: 0,
      queryUsed: q,
    };
  },
};

export default SorivaSearch;