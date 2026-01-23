// src/modules/chat/services/search/searchIntentDetector.ts

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH INTENT DETECTOR v2.0 (MISTRAL LARGE - Direct HTTP)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Risenex Dynamics
 * Date: January 23, 2026
 * 
 * v2.0 CHANGES:
 * ✅ MISTRAL LARGE via Direct HTTP (same as mistral.provider.ts)
 * ✅ NO SDK NEEDED - uses axios
 * ✅ Lazy API key loading
 * ✅ Better error handling
 * 
 * PURPOSE:
 * - LLM-based search intent detection (NO HARDCODING!)
 * - Works for ANY language, ANY phrasing
 * - Returns optimized search query
 * - Integrates with Festival Service for accurate festival data
 * 
 * COST: ~$0.0002 per call (Mistral Large)
 * SPEED: ~200-400ms
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from 'axios';
import { 
  getTodaysFestivals, 
  FestivalQueryResult 
} from '../../../../services/calender/festivalService';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type SearchIntentType = 
  | 'festival'      // Festivals, holidays, events
  | 'news'          // Current events, headlines
  | 'sports'        // Matches, scores, results
  | 'finance'       // Stocks, prices, markets
  | 'weather'       // Weather conditions
  | 'entertainment' // Movies, shows, releases
  | 'general'       // General real-time info
  | 'none';         // No search needed

export interface SearchIntentResult {
  needsSearch: boolean;
  type: SearchIntentType;
  searchQuery: string;
  dateContext: string | null;
  confidence: number;
  reason: string;
  processingTimeMs: number;
  // Festival data if type = festival
  festivalData?: FestivalQueryResult;
}

export interface SearchIntentInput {
  message: string;
  userLocation?: string;
  currentDate?: string;
  currentTime?: string;
}

// Mistral API types
interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IST DATE/TIME UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getISTDateTime(): { date: string; time: string; fullDate: string } {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const ist = new Date(utc + istOffset);
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const day = ist.getDate();
  const month = months[ist.getMonth()];
  const year = ist.getFullYear();
  const dayName = days[ist.getDay()];
  
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return {
    date: `${day} ${month} ${year}`,
    time: `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`,
    fullDate: `${dayName}, ${day} ${month} ${year}`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUICK PRE-CHECK (Sync, fast, 0 cost)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function isObviouslyNoSearch(message: string): boolean {
  const msg = message.toLowerCase().trim();
  
  // Very short greetings
  if (msg.length < 15) {
    const greetings = ['hi', 'hello', 'hey', 'bye', 'thanks', 'ok', 'haan', 'nahi', 'theek', 'acha', 'hmm', 'ji'];
    if (greetings.includes(msg)) return true;
  }
  
  // Code-related (no search needed)
  if (/^(```|function|const|let|var|import|export|class|def |print\(|console\.)/.test(msg)) {
    return true;
  }
  
  // Math/calculations
  if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(msg)) {
    return true;
  }
  
  return false;
}

/**
 * Quick keyword check - determines if LLM detection is even needed
 * This is FAST and FREE (no API call)
 */
export function mightNeedSearch(message: string): boolean {
  const msg = message.toLowerCase().trim();
  
  // Skip ONLY obvious non-search cases
  // Everything else → let LLM decide!
  
  // 1. Very short greetings
  if (msg.length < 10) {
    const skipWords = ['hi', 'hello', 'hey', 'bye', 'thanks', 'ok', 'haan', 'nahi', 'hmm'];
    if (skipWords.includes(msg)) return false;
  }
  
  // 2. Code blocks
  if (msg.startsWith('```') || msg.startsWith('function ') || msg.startsWith('const ')) {
    return false;
  }
  
  // 3. Pure math
  if (/^\d+\s*[+\-*/]\s*\d+$/.test(msg)) {
    return false;
  }
  
  // Everything else → LLM decides!
  return true;
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEARCH INTENT DETECTOR CLASS (MISTRAL LARGE - Direct HTTP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SearchIntentDetector {
  private static instance: SearchIntentDetector;
  private readonly baseUrl: string = 'https://api.mistral.ai/v1';
  private apiKey: string = '';
  
  private constructor() {
    console.log('✅ [SearchIntentDetector] Initialized v2.0 (Mistral Large - Direct HTTP)');
  }
  
  public static getInstance(): SearchIntentDetector {
    if (!SearchIntentDetector.instance) {
      SearchIntentDetector.instance = new SearchIntentDetector();
    }
    return SearchIntentDetector.instance;
  }
  
  /**
   * Lazy load API key - only when needed
   */
  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = process.env.MISTRAL_API_KEY || '';
      
      if (!this.apiKey) {
        console.warn('⚠️ [SearchIntentDetector] MISTRAL_API_KEY not set!');
        throw new Error('MISTRAL_API_KEY not configured');
      }
      
      console.log('✅ [SearchIntentDetector] Mistral API key loaded!');
    }
    return this.apiKey;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN DETECTION METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  async detect(input: SearchIntentInput): Promise<SearchIntentResult> {
    const startTime = Date.now();
    const { message, userLocation } = input;
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧠 [SearchIntentDetector] Mistral Large Detection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Message: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`);
    
    // Quick pre-check for obvious non-search queries
    if (isObviouslyNoSearch(message)) {
      console.log('⚡ [SearchIntentDetector] Quick skip - obvious non-search');
      return this.createNoSearchResult(message, startTime, 'Greeting or code - no search needed');
    }
    
    // Get current IST date/time
    const istDateTime = getISTDateTime();
    const location = userLocation || 'India';
    
    console.log(`📅 IST: ${istDateTime.fullDate}, ${istDateTime.time}`);
    console.log(`📍 Location: ${location}`);
    
    try {
      // LLM-based detection with Mistral Large
      const result = await this.detectWithMistral(message, istDateTime, location);
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🎉 FESTIVAL SPECIAL HANDLING
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      if (result.type === 'festival') {
        console.log('[SearchIntentDetector] 🎉 Festival query detected - calling Festival Service...');
        
        try {
          const festivalResult = await getTodaysFestivals(location);
          result.festivalData = festivalResult;
          
          if (festivalResult.success && festivalResult.primaryFestival) {
            console.log(`[SearchIntentDetector] ✅ Festival found: ${festivalResult.primaryFestival.name}`);
            
            // Update search query with accurate festival name
            result.searchQuery = `${festivalResult.primaryFestival.name} ${istDateTime.date} ${location}`;
            result.confidence = 0.95; // High confidence - from API!
            result.reason = `Festival API: ${festivalResult.primaryFestival.name}`;
            
            // If festival has description, may not need Brave Search
            if (festivalResult.primaryFestival.description) {
              result.needsSearch = false;
              result.reason += ' (complete info from API)';
            }
          } else {
            console.log('[SearchIntentDetector] ⚠️ No festival found for today');
            result.reason = 'No festival found for this date';
          }
        } catch (festivalError: any) {
          console.error('[SearchIntentDetector] ❌ Festival Service error:', festivalError.message);
          // Continue with Brave Search as fallback
        }
      }
      
      result.processingTimeMs = Date.now() - startTime;
      
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ [SearchIntentDetector] RESULT');
      console.log(`📊 Type: ${result.type}`);
      console.log(`🔍 Needs Search: ${result.needsSearch}`);
      console.log(`📝 Query: ${result.searchQuery}`);
      console.log(`💪 Confidence: ${Math.round(result.confidence * 100)}%`);
      console.log(`⏱️ Time: ${result.processingTimeMs}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return result;
      
    } catch (error: any) {
      console.error('❌ [SearchIntentDetector] Error:', error.message);
      
      // Fallback: return a basic result
      return {
        needsSearch: true,
        type: 'general',
        searchQuery: message,
        dateContext: istDateTime.date,
        confidence: 0.3,
        reason: `Error fallback: ${error.message}`,
        processingTimeMs: Date.now() - startTime,
      };
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MISTRAL LARGE DETECTION (Direct HTTP - same as mistral.provider.ts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  private async detectWithMistral(
    message: string,
    istDateTime: { date: string; time: string; fullDate: string },
    location: string
  ): Promise<SearchIntentResult> {
    
    const apiKey = this.getApiKey();
    
    const systemPrompt = `You are a search intent classifier for an AI assistant.
Current Date: ${istDateTime.fullDate}
Current Time: ${istDateTime.time} IST
User Location: ${location}

Analyze if the user's message requires REAL-TIME information (web search).

RESPOND IN JSON ONLY:
{
  "needsSearch": boolean,
  "type": "festival" | "news" | "sports" | "finance" | "weather" | "entertainment" | "general" | "none",
  "searchQuery": "optimized search query in English",
  "confidence": 0.0 to 1.0,
  "reason": "brief explanation"
}

RULES:
- type="festival" for ANY festival/holiday/tyohar/event questions
- type="news" for current events, headlines, breaking news
- type="sports" for matches, scores, results, tournaments
- type="finance" for stocks, prices, rates, markets
- type="weather" for weather, temperature, mausam
- type="none" for general knowledge, coding, math, opinions
- needsSearch=true ONLY if real-time data needed
- Keep searchQuery short (3-6 words)`;

    const messages: MistralMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    // Direct HTTP call to Mistral API (same pattern as mistral.provider.ts)
    const response = await axios.post<MistralResponse>(
      `${this.baseUrl}/chat/completions`,
      {
        model: 'mistral-large-latest',
        messages,
        temperature: 0.1,
        max_tokens: 200,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    
    const content = response.data.choices?.[0]?.message?.content || '';
    
    console.log(`[SearchIntentDetector] 📊 Tokens: ${response.data.usage?.total_tokens || 'N/A'}`);
    
    // Parse JSON from response
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonStr);
      
      return {
        needsSearch: parsed.needsSearch ?? true,
        type: parsed.type || 'general',
        searchQuery: parsed.searchQuery || message,
        dateContext: istDateTime.date,
        confidence: parsed.confidence ?? 0.5,
        reason: parsed.reason || 'LLM detection',
        processingTimeMs: 0, // Will be set by caller
      };
      
    } catch (parseError) {
      console.warn('[SearchIntentDetector] JSON parse failed, using defaults');
      
      return {
        needsSearch: true,
        type: 'general',
        searchQuery: message,
        dateContext: istDateTime.date,
        confidence: 0.4,
        reason: 'JSON parse fallback',
        processingTimeMs: 0,
      };
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER: Create no-search result
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  private createNoSearchResult(
    message: string,
    startTime: number,
    reason: string
  ): SearchIntentResult {
    return {
      needsSearch: false,
      type: 'none',
      searchQuery: '',
      dateContext: null,
      confidence: 1.0,
      reason,
      processingTimeMs: Date.now() - startTime,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const searchIntentDetector = SearchIntentDetector.getInstance();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function detectSearchIntent(input: SearchIntentInput): Promise<SearchIntentResult> {
  return searchIntentDetector.detect(input);
}