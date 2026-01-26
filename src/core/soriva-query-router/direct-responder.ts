/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA DIRECT RESPONDER v2.1 (OMDB Integration)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Updated: January 26, 2026 - OMDB (IMDB data) instead of TMDB
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

const GREETING_RESPONSES = {
  morning: ['Good morning! ☀️ Kaise help karun?', 'Subah ki namaste! 🙏'],
  afternoon: ['Good afternoon! 🌤️ Kaise help karun?'],
  evening: ['Good evening! 🌆 Kaise madad karun?'],
  general: ['Hello! 👋 Main Soriva hoon. Kaise help karun?', 'Namaste! 🙏'],
  howAreYou: ['Main theek hoon! 😊 Tum batao, kya help chahiye?'],
};

const IDENTITY_RESPONSES = [
  'Main Soriva hoon - tumhara AI companion! 🤖 Risenex Dynamics ne banaya hai mujhe.',
  'Soriva hoon main! Risenex ka AI assistant.',
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIRECT RESPONDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class DirectResponder {
  private weatherApiKey: string | undefined;
  private omdbApiKey: string | undefined;
  
  constructor() {
    this.weatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.omdbApiKey = process.env.OMDB_API_KEY;
  }
  
  async respond(classification: ClassificationResult, query: string, context?: UserContext): Promise<DirectResponse> {
    const startTime = Date.now();
    
    try {
      switch (classification.queryType) {
        case 'FESTIVAL': return this.handleFestival(classification, startTime);
        case 'DATE_TIME': return this.handleDateTime(query, context, startTime);
        case 'MATH': return this.handleMath(classification, startTime);
        case 'GREETING': return this.handleGreeting(query, context, startTime);
        case 'IDENTITY': return this.handleIdentity(startTime);
        case 'WEATHER': return await this.handleWeather(classification, context, startTime);
        case 'MOVIE': return await this.handleMovie(classification, query, startTime);
        case 'GITA': return this.handleGita(classification, context, startTime);
        default:
          return { success: false, response: '', queryType: classification.queryType, source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime, error: 'Not supported' };
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
  // GREETING
  // ─────────────────────────────────────────────────────────────
  
  private handleGreeting(query: string, context: UserContext | undefined, startTime: number): DirectResponse {
    const queryLower = query.toLowerCase();
    const hour = new Date().getHours();
    
    let responses: string[];
    if (queryLower.includes('kaise') || queryLower.includes('how are')) responses = GREETING_RESPONSES.howAreYou;
    else if (hour >= 5 && hour < 12) responses = GREETING_RESPONSES.morning;
    else if (hour >= 12 && hour < 17) responses = GREETING_RESPONSES.afternoon;
    else if (hour >= 17 && hour < 21) responses = GREETING_RESPONSES.evening;
    else responses = GREETING_RESPONSES.general;
    
    let response = responses[Math.floor(Math.random() * responses.length)];
    if (context?.userName) response = response.replace('!', `, ${context.userName}!`);
    
    return { success: true, response, queryType: 'GREETING', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
  }
  
  // ─────────────────────────────────────────────────────────────
  // IDENTITY
  // ─────────────────────────────────────────────────────────────
  
  private handleIdentity(startTime: number): DirectResponse {
    const response = IDENTITY_RESPONSES[Math.floor(Math.random() * IDENTITY_RESPONSES.length)];
    return { success: true, response, queryType: 'IDENTITY', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
  }
  
  // ─────────────────────────────────────────────────────────────
  // WEATHER (OpenWeather API)
  // ─────────────────────────────────────────────────────────────
  
  private async handleWeather(classification: ClassificationResult, context: UserContext | undefined, startTime: number): Promise<DirectResponse> {
    let location = classification.extracted.location || context?.location || 'Delhi';
    location = location.trim().replace(/[^a-zA-Z\s]/g, '');
    
    if (!this.weatherApiKey) {
      return { success: false, response: '⚠️ Weather API not configured.', queryType: 'WEATHER', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
    }
    
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${this.weatherApiKey}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return { success: false, response: `❌ "${location}" nahi mila.`, queryType: 'WEATHER', source: 'weather_api', tokensUsed: 0, processingTimeMs: Date.now() - startTime };
      }
      
      const data: any = await response.json();
      const temp = Math.round(data.main?.temp || 0);
      const feelsLike = Math.round(data.main?.feels_like || 0);
      const humidity = data.main?.humidity || 0;
      const condition = data.weather?.[0]?.description || 'Unknown';
      const windSpeed = Math.round((data.wind?.speed || 0) * 3.6);
      const cityName = data.name || location;
      
      const weatherResponse = `🌤️ **${cityName} ka Mausam:**\n\n🌡️ Temperature: **${temp}°C** (Feels ${feelsLike}°C)\n☁️ Condition: **${condition}**\n💧 Humidity: **${humidity}%**\n💨 Wind: **${windSpeed} km/h**`;
      
      return { success: true, response: weatherResponse, queryType: 'WEATHER', source: 'weather_api', tokensUsed: 0, processingTimeMs: Date.now() - startTime, apiCallMade: true };
    } catch (error: unknown) {
      return { success: false, response: '⚠️ Weather fetch failed.', queryType: 'WEATHER', source: 'template', tokensUsed: 0, processingTimeMs: Date.now() - startTime, error: error instanceof Error ? error.message : 'Unknown' };
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
    // Words to remove (NOT numbers - sequels like Border 2, Housefull 4, Wrong Turn 10)
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
    
    // Remove question marks and punctuation first
    cleaned = cleaned.replace(/[?!.,'"]/g, ' ');
    
    // Remove specified words (but keep numbers!)
    for (const word of removeWords) {
      cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), ' ');
    }
    
    // Clean up extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Return if valid (at least 2 chars)
    return cleaned.length >= 2 ? cleaned : null;
  }
  
  private async searchOMDB(title: string, year?: number, startTime?: number): Promise<DirectResponse> {
    let url = `https://www.omdbapi.com/?apikey=${this.omdbApiKey}&t=${encodeURIComponent(title)}&type=movie`;
    if (year) url += `&y=${year}`;
    
    console.log(`[OMDB] Searching: ${title}${year ? ` (${year})` : ''}`);
    
    const response = await fetch(url);
    const data: any = await response.json();
    
    // If exact match fails, try search
    if (data.Response === 'False' || !data.Title) {
      const searchUrl = `https://www.omdbapi.com/?apikey=${this.omdbApiKey}&s=${encodeURIComponent(title)}&type=movie`;
      const searchResponse = await fetch(searchUrl);
      const searchData: any = await searchResponse.json();
      
      if (searchData.Response === 'False' || !searchData.Search?.length) {
        return { success: false, response: `❌ "${title}" IMDB pe nahi mili.`, queryType: 'MOVIE', source: 'tmdb', tokensUsed: 0, processingTimeMs: Date.now() - (startTime || 0) };
      }
      
      // Get first result details
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