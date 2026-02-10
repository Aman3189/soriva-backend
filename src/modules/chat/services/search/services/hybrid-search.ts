/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA HYBRID SEARCH SERVICE v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/hybrid-search.ts
 * Created by: Risenex Dynamics Pvt. Ltd.
 * Updated: February 10, 2026
 *
 * v2.0 CHANGES:
 * ✅ REMOVED: Google CSE (replaced by Gemini Grounding)
 * ✅ PRIMARY: Gemini Grounding (FREE 45K searches/month)
 * ✅ FALLBACK: Brave Search (2000 free/month)
 *
 * Architecture v2.0:
 * ┌─────────────────────────────────────────┐
 * │           User Query                    │
 * └─────────────────┬───────────────────────┘
 *                   ↓
 * ┌─────────────────────────────────────────┐
 * │    Gemini Grounding (PRIMARY - FREE)    │
 * └─────────────────┬───────────────────────┘
 *                   ↓
 *              Success?
 *         ┌────────┴────────┐
 *        YES               NO
 *         ↓                 ↓
 *      Return          Brave Search
 *                      (FALLBACK)
 * 
 * Cost: Grounding FREE + Brave 2000/month = Massive savings!
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { GeminiGroundingService } from './gemini-grounding';
import { braveSearchService } from '../brave-search.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// v2.0: Local category type (no CSE dependency)
export type SearchCategory = 
  | 'news' | 'sports' | 'entertainment' | 'health' | 'finance' 
  | 'food' | 'travel' | 'education' | 'weather' | 'festival'
  | 'tech' | 'government' | 'local' | 'general';

export interface HybridSearchResult {
  title: string;
  url: string;
  description: string;
  source: string;
}

export interface HybridSearchResponse {
  results: HybridSearchResult[];
  query: string;
  category: SearchCategory;
  provider: 'gemini-grounding' | 'brave' | 'hybrid';
  timeMs: number;
  success: boolean;
  fallbackUsed: boolean;
}

export interface HybridFetchResponse {
  fact: string;
  source: string;
  sources?: Array<{ title: string; url: string }>;
  category: SearchCategory;
  provider: string;
  timeMs: number;
  success: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MIN_CONTENT_LENGTH = 100;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE v2.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HybridSearchService = {

  /**
   * 🚀 Main Search - Gemini Grounding PRIMARY → Brave FALLBACK
   */
  async search(query: string, userLocation?: string): Promise<HybridSearchResponse> {
    const startTime = Date.now();

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 [Hybrid Search v2.0] GROUNDING + BRAVE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📝 Query: "${query}"`);
    console.log(`📍 Location: ${userLocation || 'India'}`);

    const category = this.detectCategory(query);
    console.log(`🏷️  Category: ${category.toUpperCase()}`);

    // Step 1: Try Gemini Grounding (PRIMARY - FREE!)
    if (GeminiGroundingService.isConfigured()) {
      console.log('');
      console.log('🔍 [Hybrid] Trying Gemini Grounding (PRIMARY)...');
      
      const groundingResult = await GeminiGroundingService.search(query, {
        location: userLocation,
        language: this.detectLanguage(query),
      });
      
      if (groundingResult.success && groundingResult.answer.length >= MIN_CONTENT_LENGTH) {
        const timeMs = Date.now() - startTime;
        
        console.log('');
        console.log('✅ [Hybrid] Gemini Grounding SUCCESS');
        console.log(`⏱️  Total Time: ${timeMs}ms`);
        console.log(`🔗 Sources: ${groundingResult.sources.length}`);
        console.log('═══════════════════════════════════════════════════════');

        return {
          results: groundingResult.sources.map(s => ({
            title: s.title,
            url: s.url,
            description: groundingResult.answer,
            source: 'Gemini Grounding',
          })),
          query,
          category,
          provider: 'gemini-grounding',
          timeMs,
          success: true,
          fallbackUsed: false,
        };
      }

      console.log('⚠️  [Hybrid] Grounding insufficient, trying Brave...');
    } else {
      console.log('⚠️  [Hybrid] Grounding not configured, using Brave...');
    }

    // Step 2: Brave Fallback
    console.log('');
    console.log('🦁 [Hybrid] Brave Search (Fallback)...');
    
    try {
      const braveResult = await braveSearchService.smartSearch(query, userLocation);
      const timeMs = Date.now() - startTime;

      const results: HybridSearchResult[] = [{
        title: query,
        url: '',
        description: braveResult,
        source: 'Brave Search',
      }];

      console.log('');
      console.log('✅ [Hybrid] Brave Fallback SUCCESS');
      console.log(`⏱️  Total Time: ${timeMs}ms`);
      console.log('═══════════════════════════════════════════════════════');

      return {
        results,
        query,
        category,
        provider: 'brave',
        timeMs,
        success: true,
        fallbackUsed: true,
      };

    } catch (error: any) {
      const timeMs = Date.now() - startTime;
      
      console.error(`❌ [Hybrid] Brave also failed: ${error.message}`);
      console.log('═══════════════════════════════════════════════════════');

      return {
        results: [],
        query,
        category,
        provider: 'hybrid',
        timeMs,
        success: false,
        fallbackUsed: true,
      };
    }
  },

  /**
   * 🎯 Smart Search with Full Content Fetch
   * v2.0: Grounding provides full answers, Brave as fallback
   */
  async searchWithFetch(query: string, userLocation?: string): Promise<HybridFetchResponse> {
    const startTime = Date.now();
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 [Hybrid v2.0] SEARCH WITH FETCH');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📝 Query: "${query}"`);
    console.log(`📍 Location: ${userLocation || 'India'}`);

    const category = this.detectCategory(query);
    console.log(`🏷️  Category: ${category.toUpperCase()}`);

    // Step 1: Try Gemini Grounding (provides full answer with sources)
    if (GeminiGroundingService.isConfigured()) {
      console.log('');
      console.log('🔍 [Hybrid] Trying Gemini Grounding...');
      
      const groundingResult = await GeminiGroundingService.search(query, {
        location: userLocation,
        language: this.detectLanguage(query),
      });
      
      if (groundingResult.success && groundingResult.answer.length >= MIN_CONTENT_LENGTH) {
        console.log(`✅ [Hybrid] Grounding SUCCESS: ${groundingResult.answer.length} chars`);
        
        return this.buildResponse(
          groundingResult.answer,
          groundingResult.sources[0]?.url || '',
          groundingResult.sources,
          category,
          'gemini-grounding',
          startTime,
          true
        );
      }
      
      console.log('⚠️  [Hybrid] Grounding insufficient, falling back to Brave...');
    }

    // Step 2: Brave Fallback with fetch
    console.log('');
    console.log('🦁 [Hybrid] Using Brave smartSearchWithFetch...');
    
    try {
      const braveResult = await braveSearchService.smartSearchWithFetch(query, userLocation);
      
      return this.buildResponse(
        braveResult.fact, 
        braveResult.bestUrl || '', 
        [],
        category, 
        'brave', 
        startTime, 
        true
      );
    } catch (error: any) {
      console.error(`❌ [Hybrid] Brave failed: ${error.message}`);
      
      return this.buildResponse(
        'No relevant information found.',
        '',
        [],
        category,
        'none',
        startTime,
        false
      );
    }
  },

  /**
   * Build standardized response
   */
  buildResponse(
    fact: string,
    source: string,
    sources: Array<{ title: string; url: string }>,
    category: SearchCategory,
    provider: string,
    startTime: number,
    success: boolean
  ): HybridFetchResponse {
    const timeMs = Date.now() - startTime;
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ [Hybrid v2.0] SEARCH COMPLETE`);
    console.log(`📊 Provider: ${provider}`);
    console.log(`🏷️  Category: ${category}`);
    console.log(`📏 Content: ${fact.length} chars`);
    console.log(`⏱️  Time: ${timeMs}ms`);
    console.log('═══════════════════════════════════════════════════════');

    return {
      fact,
      source,
      sources,
      category,
      provider,
      timeMs,
      success,
    };
  },

  /**
   * 📊 Check service configuration
   */
  getStats(): { groundingConfigured: boolean; braveConfigured: boolean } {
    return {
      groundingConfigured: GeminiGroundingService.isConfigured(),
      braveConfigured: Boolean(process.env.BRAVE_API_KEY),
    };
  },

  /**
   * 🔍 Quick search - returns just the fact string
   */
  async quickSearch(query: string, userLocation?: string): Promise<string> {
    const result = await this.searchWithFetch(query, userLocation);
    return result.fact;
  },

  /**
   * 🏷️ Simple category detection (no CSE dependency)
   */
  detectCategory(query: string): SearchCategory {
    const q = query.toLowerCase();
    
    if (/score|match|ipl|cricket|football|khel|tournament/.test(q)) return 'sports';
    if (/news|khabar|headlines|breaking/.test(q)) return 'news';
    if (/movie|film|song|gaana|actor|actress|bollywood/.test(q)) return 'entertainment';
    if (/weather|mausam|temperature|barish/.test(q)) return 'weather';
    if (/stock|share|nifty|sensex|gold|price|rate/.test(q)) return 'finance';
    if (/hospital|doctor|medicine|health|sehat/.test(q)) return 'health';
    if (/restaurant|food|khana|recipe/.test(q)) return 'food';
    if (/hotel|travel|flight|train|yatra/.test(q)) return 'travel';
    if (/school|college|exam|result|admission/.test(q)) return 'education';
    if (/diwali|holi|eid|christmas|festival|tyohar/.test(q)) return 'festival';
    if (/coding|programming|software|tech|app/.test(q)) return 'tech';
    if (/government|sarkari|yojana|scheme/.test(q)) return 'government';
    if (/near me|nearby|directions|address/.test(q)) return 'local';
    
    return 'general';
  },

  /**
   * 🌐 Detect language for grounding
   */
  detectLanguage(query: string): 'hi' | 'en' {
    const hindiPatterns = /[ा-ू]|kya|hai|kaise|batao|mujhe|yahan|wahan/i;
    return hindiPatterns.test(query) ? 'hi' : 'en';
  },
};

export default HybridSearchService;