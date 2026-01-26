/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA QUERY ROUTER - TYPES v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: src/core/soriva-query-router/types.ts
 * Created: January 25, 2026
 * Updated: January 25, 2026 (Day 2 - Added MOVIE, GITA types)
 * Author: Amandeep, Risenex Dynamics
 * 
 * Purpose: Single source of truth for query routing types
 * Philosophy: Simple, fast, accurate
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUERY TYPES - What kind of query is this?
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type QueryType =
  | 'FESTIVAL'        // "Holi kab hai?" → Calendarific API
  | 'WEATHER'         // "Mausam kaisa hai?" → Weather API
  | 'DATE_TIME'       // "Aaj kya date hai?" → JS Date
  | 'MATH'            // "25 * 47 = ?" → Direct calculation
  | 'GREETING'        // "Hi", "Hello" → Template response
  | 'IDENTITY'        // "Tum kaun ho?" → About Soriva
  | 'NEWS'            // "Latest news?" → News API
  | 'MOVIE'           // "SRK ki new movie?" → OMDB API
  | 'GITA'            // "Gita chapter 2 shlok 47" → Bhagavad Gita
  | 'LOCAL_BUSINESS'  // "Theatre near me?" → Web Search ✨ NEW
  | 'SPORTS'          // "Cricket score?" → Sports API (future)
  | 'GENERAL';        // Everything else → LLM required

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPONSE MODE - How to handle this query?
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ResponseMode =
  | 'DIRECT'          // No LLM needed, direct API/template response
  | 'LLM_MINIMAL'     // LLM with minimal context (small prompt)
  | 'LLM_FULL';       // LLM with full context (complex queries)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLASSIFICATION RESULT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ClassificationResult {
  queryType: QueryType;
  responseMode: ResponseMode;
  confidence: number;           // 0-1, how sure are we?
  
  // Extracted entities
  extracted: {
    festivalName?: string;
    location?: string;
    mathExpression?: string;
    searchQuery?: string;
    
    // ✨ NEW: Movie entities
    movieTitle?: string;
    actorName?: string;
    movieYear?: number;
    movieGenre?: string;
    
    // ✨ NEW: Gita entities
    gitaChapter?: number;
    gitaShlok?: number;
    gitaKeyword?: string;      // For searching shlokas by topic
    
    // ✨ NEW: Sports entities (Day 3)
    team?: string;
    keyword?: string;
  };
  
  // Debug info
  matchedPattern?: string;
  processingTimeMs?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIRECT RESPONSE RESULT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DirectResponse {
  success: boolean;
  response: string;
  queryType: QueryType;
  source: 'template' | 'calendarific' | 'cache' | 'weather_api' | 'js_date' | 'math' | 'tmdb' | 'gita_db';
  tokensUsed: number;           // Always 0 for direct responses!
  processingTimeMs: number;
  
  // Optional metadata
  cacheHit?: boolean;
  apiCallMade?: boolean;
  error?: string;
  
  // ✨ NEW: Rich response data
  richData?: {
    // Movie data
    movie?: {
      id: number;
      title: string;
      originalTitle?: string;
      releaseDate?: string;
      rating?: number;
      overview?: string;
      posterUrl?: string;
      genres?: string[];
    };
    
    // Weather data
    weather?: {
      temperature: number;
      feelsLike: number;
      condition: string;
      humidity: number;
      windSpeed: number;
      moodLine?: string;
    };
    
    // Gita data
    gita?: {
      chapter: number;
      shlok: number;
      sanskrit: string;
      transliteration?: string;
      hindiMeaning: string;
      englishMeaning: string;
      speaker?: string;
    };
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UserContext {
  userId?: string;
  userName?: string;
  location?: string;            // City name or "lat,lng"
  language?: 'en' | 'hi' | 'hinglish';
  timezone?: string;
  plan?: 'STARTER' | 'PLUS' | 'PRO' | 'APEX';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTER RESULT (Final output)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface RouterResult {
  // Was this handled without LLM?
  handledDirectly: boolean;
  
  // If handled directly, here's the response
  directResponse?: DirectResponse;
  
  // Classification result (always present)
  classification: ClassificationResult;
  
  // If not handled directly, LLM context hints
  llmContext?: {
    maxTokens: number;
    systemPromptHint?: string;
    searchNeeded?: boolean;
    apiDataToInclude?: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATTERN DEFINITION (For classifiers)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PatternDefinition {
  pattern: RegExp;
  queryType: QueryType;
  responseMode: ResponseMode;
  confidence: number;
  extractor?: (match: RegExpMatchArray, query: string) => Record<string, any>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GITA SHLOK INTERFACE ✨ NEW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GitaShlok {
  chapter: number;
  shlok: number;
  sanskrit: string;
  transliteration: string;
  hindiMeaning: string;
  englishMeaning: string;
  speaker: 'Krishna' | 'Arjuna' | 'Sanjaya' | 'Dhritarashtra';
  keywords: string[];           // For search
}

export interface GitaChapter {
  number: number;
  nameHindi: string;
  nameEnglish: string;
  nameSanskrit: string;
  totalShlokas: number;
  summary: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOVIE INTERFACES ✨ NEW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}