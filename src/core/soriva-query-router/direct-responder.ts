/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA DIRECT RESPONDER v2.2 (OMDB Integration)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Updated: January 28, 2026
 * Change: GREETING & IDENTITY removed - now handled by LLM
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { ClassificationResult, DirectResponse, UserContext } from './types';
import { getChapterInfo, getShlok, getShlokasByTopic, getRandomFamousShlok, formatShlokResponse, formatChapterResponse } from './gita-data';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FESTIVAL DATA 2026
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FESTIVAL_STATIC_2026: Record<string, { date: string; dateHuman: string }> = {
  'holi': { date: '2026-03-14', dateHuman: '14 March 2026 (Saturday)' },
  'diwali': { date: '2026-10-20', dateHuman: '20 October 2026 (Tuesday)' },
  'dussehra': { date: '2026-10-11', dateHuman: '11 October 2026 (Sunday)' },
  'ganesh chaturthi': { date: '2026-08-27', dateHuman: '27 August 2026 (Thursday)' },
  'raksha bandhan': { date: '2026-08-11', dateHuman: '11 August 2026 (Tuesday)' },
  'janmashtami': { date: '2026-08-22', dateHuman: '22 August 2026 (Saturday)' },
  'navratri': { date: '2026-10-02', dateHuman: '2 October 2026 (Friday)' },
  'karwa chauth': { date: '2026-10-24', dateHuman: '24 October 2026 (Saturday)' },
  'chhath': { date: '2026-10-26', dateHuman: '26 October 2026 (Monday)' },
  'lohri': { date: '2026-01-13', dateHuman: '13 January 2026 (Tuesday)' },
  'makar sankranti': { date: '2026-01-14', dateHuman: '14 January 2026 (Wednesday)' },
  'republic day': { date: '2026-01-26', dateHuman: '26 January 2026 (Monday)' },
  'independence day': { date: '2026-08-15', dateHuman: '15 August 2026 (Saturday)' },
  'gandhi jayanti': { date: '2026-10-02', dateHuman: '2 October 2026 (Friday)' },
  'christmas': { date: '2026-12-25', dateHuman: '25 December 2026 (Friday)' },
  'new year': { date: '2026-01-01', dateHuman: '1 January 2026 (Thursday)' },
  'eid ul fitr': { date: '2026-03-20', dateHuman: '20 March 2026 (Friday) (approx)' },
  'eid ul adha': { date: '2026-05-27', dateHuman: '27 May 2026 (Wednesday) (approx)' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIRECT RESPONDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class DirectResponder {
  private weatherApiKey: string | undefined;
  private omdbApiKey: string | undefined;
  
  constructor() {
    this.weatherApiKey = process.env.WEATHER_API_KEY;    
    this.omdbApiKey = process.env.OMDB_API_KEY;
  }
  
  async respond(classification: ClassificationResult, query: string, context?: UserContext): Promise<DirectResponse> {
    const startTime = Date.now();
    
    try {
      switch (classification.queryType) {
        case 'FESTIVAL': return this.handleFestival(classification, startTime);
        case 'DATE_TIME': return this.handleDateTime(query, context, startTime);
        case 'MATH': return this.handleMath(classification, startTime);
        case 'WEATHER': return await this.handleWeather(classification, context, startTime);
        case 'MOVIE': return await this.handleMovie(classification, query, startTime);
        case 'GITA': return this.handleGita(classification, context, startTime);
        // GREETING and IDENTITY removed - LLM handles them now for natural responses
        default:
          return { success: false, response: '', queryType: classification.queryType, source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime, error: 'Not supported by DirectResponder' };
      }
    } catch (error: unknown) {
      return { success: false, response: '', queryType: classification.queryType, source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime, error: error instanceof Error ? error.message : 'Unknown' };
    }
  }
  
  // ─────────────────────────────────────────────────────────────
  // FESTIVAL
  // ─────────────────────────────────────────────────────────────
  
  private handleFestival(classification: ClassificationResult, startTime: number): DirectResponse {
    const festivalName = classification.extracted.festivalName?.toLowerCase();
    if (!festivalName) {
      return { success: false, response: 'Kaunsa festival?', queryType: 'FESTIVAL', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
    }
    
    const staticData = FESTIVAL_STATIC_2026[festivalName];
    if (staticData) {
      const name = festivalName.charAt(0).toUpperCase() + festivalName.slice(1);
      return { success: true, response: `🎉 **${name}** is **${staticData.dateHuman}** ko hai!`, queryType: 'FESTIVAL', source: 'cache', tokensUsed: 0, processingTimeMs: Date.now() - startTime, cacheHit: true };
    }
    
    return { success: false, response: `"${festivalName}" ki date nahi mili.`, queryType: 'FESTIVAL', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
  }
  
  // ─────────────────────────────────────────────────────────────
  // DATE/TIME
  // ─────────────────────────────────────────────────────────────
  
  private handleDateTime(query: string, context: UserContext | undefined, startTime: number): DirectResponse {
    const timezone = context?.timezone || 'Asia/Kolkata';
    const now = new Date();
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('time') || queryLower.includes('samay') || queryLower.includes('baje')) {
      const timeStr = now.toLocaleTimeString('en-IN', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true });
      return { success: true, response: `🕐 Abhi **${timeStr}** baj rahe hain.`, queryType: 'DATE_TIME', source: 'js_date', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
    }
    
    const dateStr = now.toLocaleDateString('en-IN', { timeZone: timezone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return { success: true, response: `📅 Aaj **${dateStr}** hai.`, queryType: 'DATE_TIME', source: 'js_date', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
  }
  
  // ─────────────────────────────────────────────────────────────
  // MATH
  // ─────────────────────────────────────────────────────────────
  
  private handleMath(classification: ClassificationResult, startTime: number): DirectResponse {
    const expr = classification.extracted.mathExpression;
    if (!expr) {
      return { success: false, response: 'Math expression samajh nahi aayi.', queryType: 'MATH', source: 'math', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
    }
    
    try {
      const sanitized = expr.replace(/[^0-9\+\-\*\/\(\)\.\s\^%]/g, '').replace(/\^/g, '**');
      const result = new Function(`return ${sanitized}`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const formatted = Number.isInteger(result) ? result.toLocaleString('en-IN') : result.toLocaleString('en-IN', { maximumFractionDigits: 4 });
        return { success: true, response: `🔢 **${expr} = ${formatted}**`, queryType: 'MATH', source: 'math', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
      }
    } catch { /* fall through */ }
    
    return { success: false, response: `"${expr}" calculate nahi hua.`, queryType: 'MATH', source: 'math', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
  }
  
  // ─────────────────────────────────────────────────────────────
  // WEATHER (WeatherAPI.com)
  // ─────────────────────────────────────────────────────────────
  
  private async handleWeather(classification: ClassificationResult, context: UserContext | undefined, startTime: number): Promise<DirectResponse> {
  let location = classification.extracted.location;
  
  // If extracted location is suspicious (short words like "kya", "hai")
  const badWords = ['kya', 'hai', 'haal', 'ka', 'ki', 'ke', 'aaj', 'kal', 'mausam', 'weather'];
  if (!location || location.length < 3 || badWords.includes(location.toLowerCase())) {
    location = context?.location || 'Delhi';
  }
  
  location = location.trim().replace(/[^a-zA-Z\s]/g, '');
  
  // ✅ SMART: Extract country from user's location context
  if (context?.location) {
    const locationParts = context.location.trim().split(/[\s,]+/);
    const userCountry = locationParts[locationParts.length - 1];
    
    if (userCountry && userCountry.length > 2 && !location.toLowerCase().includes(userCountry.toLowerCase())) {
      location = `${location},${userCountry}`;
    }
  }
  
  console.log('[Weather] Final location:', location);
  
  if (!this.weatherApiKey) {
    return { success: false, response: '', queryType: 'WEATHER', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime, error: 'Weather API not configured' };
  }
  
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${this.weatherApiKey}&q=${encodeURIComponent(location)}&aqi=yes`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return { success: false, response: '', queryType: 'WEATHER', source: 'weather_api', tokensUsed: 0, processingTimeMs: Date.now() - startTime, error: `Location not found: ${location}` };
    }
    
    const data: any = await response.json();
    
    // ✅ Return structured data for LLM to process naturally
    const weatherData = {
      city: data.location?.name || location,
      region: data.location?.region || '',
      country: data.location?.country || '',
      temp: Math.round(data.current?.temp_c || 0),
      feelsLike: Math.round(data.current?.feelslike_c || 0),
      condition: data.current?.condition?.text || 'Unknown',
      humidity: data.current?.humidity || 0,
      wind: Math.round(data.current?.wind_kph || 0),
      aqi: data.current?.air_quality?.['us-epa-index'] || null,
      uv: data.current?.uv || null,
      isDay: data.current?.is_day === 1,
    };
    
    console.log('[Weather] Data fetched for LLM:', weatherData.city);
    
    // ✅ Return data for LLM processing (response empty - LLM will generate)
    return {
      success: true,
      response: '', // Empty - LLM will generate natural response
      queryType: 'WEATHER',
      source: 'weather_api',
      tokensUsed: 0,
      processingTimeMs: Date.now() - startTime,
      apiCallMade: true,
      richData: {
      weather: {
        city: data.location?.name || location,
        region: data.location?.region || '',
        country: data.location?.country || '',
        temperature: Math.round(data.current?.temp_c || 0),
        feelsLike: Math.round(data.current?.feelslike_c || 0),
        condition: data.current?.condition?.text || 'Unknown',
        humidity: data.current?.humidity || 0,
        windSpeed: Math.round(data.current?.wind_kph || 0),
        aqi: data.current?.air_quality?.['us-epa-index'] || null,
        uv: data.current?.uv || null,
        isDay: data.current?.is_day === 1,
      }
    }
    };
  } catch (error: unknown) {
    return { success: false, response: '', queryType: 'WEATHER', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime, error: error instanceof Error ? error.message : 'Unknown' };
  }
}
  
  // ─────────────────────────────────────────────────────────────
  // 🎬 MOVIE (OMDB API - IMDB Data)
  // ─────────────────────────────────────────────────────────────
  
  private async handleMovie(classification: ClassificationResult, query: string, startTime: number): Promise<DirectResponse> {
    if (!this.omdbApiKey) {
      return { success: false, response: '⚠️ Movie API not configured.', queryType: 'MOVIE', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
    }
    
    try {
      const { movieTitle, movieYear } = classification.extracted;
      let searchTitle = movieTitle || this.extractMovieFromQuery(query);
      
      if (!searchTitle) {
        return { success: false, response: '🎬 Kaunsi movie? Naam batao.', queryType: 'MOVIE', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
      }
      
      return await this.searchOMDB(searchTitle, movieYear, startTime);
    } catch (error: unknown) {
      return { success: false, response: '⚠️ Movie fetch failed.', queryType: 'MOVIE', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime, error: error instanceof Error ? error.message : 'Unknown' };
    }
  }
  
  private extractMovieFromQuery(query: string): string | null {
    const removeWords = [
      'movie', 'film', 'ki', 'ka', 'ke', 'kab', 'release', 'rating', 'review',
      'kaisi', 'kaisa', 'hai', 'hain', 'tha', 'thi', 'the',
      'btao', 'btaao', 'batao', 'bataao', 'bata', 'tell', 'about',
      'ho', 'gayi', 'gayin', 'gaya', 'hogi', 'hoga', 'chuki', 'chuka',
      'acha', 'achhi', 'acchi', 'ye', 'yeh', 'woh', 'wo', 'kya',
      'me', 'mein', 'mei', 'ke', 'baare', 'bare', 'info',
      'pucha', 'puchha', 'pcuha', 'dekhi', 'dekha', 'dekhna', 'chahiye',
      'konsi', 'kaunsi', 'kaun', 'kon', 'new', 'latest', 'upcoming'
    ];
    
    let cleaned = query.toLowerCase();
    cleaned = cleaned.replace(/[?!.,'"]/g, ' ');
    
    for (const word of removeWords) {
      cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), ' ');
    }
    
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned.length >= 2 ? cleaned : null;
  }
  
  private async searchOMDB(title: string, year?: number, startTime?: number): Promise<DirectResponse> {
    let url = `https://www.omdbapi.com/?apikey=${this.omdbApiKey}&t=${encodeURIComponent(title)}&type=movie`;
    if (year) url += `&y=${year}`;
    
    console.log(`[OMDB] Searching: ${title}${year ? ` (${year})` : ''}`);
    
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (data.Response === 'False' || !data.Title) {
      const searchUrl = `https://www.omdbapi.com/?apikey=${this.omdbApiKey}&s=${encodeURIComponent(title)}&type=movie`;
      const searchResponse = await fetch(searchUrl);
      const searchData: any = await searchResponse.json();
      
      if (searchData.Response === 'False' || !searchData.Search?.length) {
        return { success: false, response: `❌ "${title}" IMDB pe nahi mili.`, queryType: 'MOVIE', source: 'tmdb', tokensUsed: 0, processingTimeMs: Date.now() - (startTime || 0) };
      }
      
      const detailUrl = `https://www.omdbapi.com/?apikey=${this.omdbApiKey}&i=${searchData.Search[0].imdbID}`;
      const detailResponse = await fetch(detailUrl);
      const detailData: any = await detailResponse.json();
      
      if (detailData.Response === 'True') {
        return this.formatOMDBResponse(detailData, startTime);
      }
    }
    
    return this.formatOMDBResponse(data, startTime);
  }
  
  private formatOMDBResponse(data: any, startTime?: number): DirectResponse {
    const title = data.Title || 'Unknown';
    const year = data.Year || 'N/A';
    const imdbRating = data.imdbRating || 'N/A';
    const rottenTomatoes = data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes')?.Value || null;
    const genre = data.Genre || 'N/A';
    const director = data.Director || 'N/A';
    const actors = data.Actors || 'N/A';
    const plot = data.Plot || 'No description.';
    const runtime = data.Runtime || 'N/A';
    const boxOffice = data.BoxOffice || null;
    
    let response = `🎬 **${title}** (${year})\n\n`;
    response += `⭐ **IMDB: ${imdbRating}/10**`;
    if (rottenTomatoes) response += ` | 🍅 RT: ${rottenTomatoes}`;
    response += `\n\n`;
    response += `🎭 Genre: ${genre}\n`;
    response += `🎬 Director: ${director}\n`;
    response += `⏱️ Runtime: ${runtime}\n`;
    response += `🌟 Cast: ${actors}\n`;
    if (boxOffice) response += `💰 Box Office: ${boxOffice}\n`;
    response += `\n📝 ${plot.length > 200 ? plot.substring(0, 200) + '...' : plot}`;
    
    return { success: true, response, queryType: 'MOVIE', source: 'tmdb', tokensUsed: 0, processingTimeMs: Date.now() - (startTime || 0), apiCallMade: true };
  }
  
  // ─────────────────────────────────────────────────────────────
  // 📖 GITA
  // ─────────────────────────────────────────────────────────────
  
  private handleGita(classification: ClassificationResult, context: UserContext | undefined, startTime: number): DirectResponse {
    const { gitaChapter, gitaShlok, gitaKeyword } = classification.extracted;
    const language = (context?.language || 'hinglish') as 'hi' | 'en' | 'hinglish';
    
    if (gitaChapter && gitaShlok) {
      const shlok = getShlok(gitaChapter, gitaShlok);
      if (shlok) {
        return { success: true, response: formatShlokResponse(shlok, language), queryType: 'GITA', source: 'gita_db', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
      }
      return { success: true, response: `📖 Gita ${gitaChapter}.${gitaShlok} database mein nahi hai.`, queryType: 'GITA', source: 'gita_db', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
    }
    
    if (gitaChapter && !gitaShlok) {
      const chapter = getChapterInfo(gitaChapter);
      if (chapter) {
        return { success: true, response: formatChapterResponse(chapter), queryType: 'GITA', source: 'gita_db', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
      }
      return { success: false, response: `❌ Chapter ${gitaChapter} invalid. Gita mein 1-18 chapters hain.`, queryType: 'GITA', source: 'gita_db', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
    }
    
    if (gitaKeyword) {
      const shlokas = getShlokasByTopic(gitaKeyword);
      if (shlokas.length > 0) {
        return { success: true, response: `📖 **"${gitaKeyword}":**\n\n` + formatShlokResponse(shlokas[0], language), queryType: 'GITA', source: 'gita_db', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
      }
    }
    
    const randomShlok = getRandomFamousShlok();
    return { success: true, response: `📖 **Aaj ka Shlok:**\n\n` + formatShlokResponse(randomShlok, language), queryType: 'GITA', source: 'gita_db', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
  }
}

export const directResponder = new DirectResponder();