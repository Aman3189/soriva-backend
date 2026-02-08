/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA HYBRID SEARCH SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/hybrid-search.ts
 * Created by: Risenex Dynamics Pvt. Ltd.
 * Created: February 2026
 *
 * Architecture:
 * ┌─────────────────────────────────────────┐
 * │           User Query                    │
 * └─────────────────┬───────────────────────┘
 *                   ↓
 * ┌─────────────────────────────────────────┐
 * │      Category Detection                 │
 * └─────────────────┬───────────────────────┘
 *                   ↓
 *         ┌────────┴────────┐
 *         ↓                 ↓
 *    Category Found    General/Unknown
 *         ↓                 ↓
 *    Google CSE         Brave Search
 *    (Primary)          (Direct)
 *         ↓                   
 *    Results >= 3?            
 *    ├── YES → WebFetch content
 *    └── NO → Brave (Fallback)
 * 
 * Cost: CSE 3000 free/month + Brave 2000 free/month = 5000 FREE!
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { GoogleCSEService, CSEResponse, SearchCategory } from './google-cse';
import { WebFetchService } from './webfetch';
import { braveSearchService } from '../brave-search.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  provider: 'google-cse' | 'brave' | 'hybrid';
  timeMs: number;
  success: boolean;
  fallbackUsed: boolean;
}

export interface HybridFetchResponse {
  fact: string;
  source: string;
  category: SearchCategory;
  provider: string;
  timeMs: number;
  success: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MIN_RESULTS_FOR_SUCCESS = 3;
const MIN_CONTENT_LENGTH = 100;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HybridSearchService = {

  /**
   * 🚀 Main Search - Returns structured results
   */
  async search(query: string, userLocation?: string): Promise<HybridSearchResponse> {
    const startTime = Date.now();

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 [Hybrid Search] SORIVA SMART SEARCH v1.0');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📝 Query: "${query}"`);
    console.log(`📍 Location: ${userLocation || 'India'}`);

    // Step 1: Detect category
    const category = GoogleCSEService.detectCategory(query);
    
    // Step 2: Try Google CSE first (if category is specific)
    if (category !== 'general' && GoogleCSEService.isConfigured()) {
      console.log('');
      console.log('🔍 [Hybrid] Trying Google CSE (Primary)...');
      
      const cseResponse = await GoogleCSEService.search(query, category);
      
      if (cseResponse.success && cseResponse.results.length >= MIN_RESULTS_FOR_SUCCESS) {
        const timeMs = Date.now() - startTime;
        
        console.log('');
        console.log('✅ [Hybrid] Google CSE SUCCESS - No fallback needed');
        console.log(`⏱️  Total Time: ${timeMs}ms`);
        console.log('═══════════════════════════════════════════════════════');

        return {
          results: cseResponse.results.map(r => ({
            title: r.title,
            url: r.url,
            description: r.description,
            source: r.source,
          })),
          query,
          category,
          provider: 'google-cse',
          timeMs,
          success: true,
          fallbackUsed: false,
        };
      }

      console.log('⚠️  [Hybrid] CSE results insufficient, trying Brave fallback...');
    } else {
      console.log('');
      console.log('🔍 [Hybrid] General query - Using Brave directly...');
    }

    // Step 3: Brave Fallback
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
        provider: category !== 'general' ? 'hybrid' : 'brave',
        timeMs,
        success: true,
        fallbackUsed: category !== 'general',
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
   * This is the main method for Soriva AI responses
   */
  async searchWithFetch(query: string, userLocation?: string): Promise<HybridFetchResponse> {
    const startTime = Date.now();
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 [Hybrid] SEARCH WITH FETCH v1.0');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📝 Query: "${query}"`);
    console.log(`📍 Location: ${userLocation || 'India'}`);

    // Step 1: Detect category
    const category = GoogleCSEService.detectCategory(query);
    console.log(`🏷️  Category: ${category.toUpperCase()}`);

    // Step 2: Try CSE for specific categories
    if (category !== 'general' && GoogleCSEService.isConfigured()) {
      console.log('');
      console.log('🔍 [Hybrid] Trying Google CSE (Primary)...');
      
      const cseResponse = await GoogleCSEService.search(query, category, 5);
      
      if (cseResponse.success && cseResponse.results.length > 0) {
        const best = cseResponse.results[0];
        console.log(`📰 [Hybrid] Best result: ${best.source}`);
        
        // Try to fetch full content
        if (best.url) {
          console.log('📥 [Hybrid] Attempting WebFetch...');
          
          const fetchResult = await WebFetchService.fetch(best.url, 2500);
          
          // Check if it's a JS-heavy site (use snippet)
          if (fetchResult.snippetOnly) {
            console.log('⚡ [Hybrid] JS-heavy site - using snippet');
            return this.buildResponse(best.description, best.url, category, 'google-cse (snippet)', startTime, true);
          }
          
          // Use fetched content if good
          if (fetchResult.success && fetchResult.content.length >= MIN_CONTENT_LENGTH) {
            console.log(`✅ [Hybrid] WebFetch SUCCESS: ${fetchResult.contentLength} chars`);
            return this.buildResponse(fetchResult.content, best.url, category, 'google-cse + webfetch', startTime, true);
          }
          
          console.log('⚠️  [Hybrid] WebFetch insufficient, using snippet');
        }

        // Return snippet if fetch fails
        return this.buildResponse(best.description, best.url, category, 'google-cse (snippet)', startTime, true);
      }
      
      console.log('⚠️  [Hybrid] CSE no results, falling back to Brave...');
    }

    // Step 3: Brave Fallback with fetch
    console.log('');
    console.log('🦁 [Hybrid] Using Brave smartSearchWithFetch...');
    
    try {
      const braveResult = await braveSearchService.smartSearchWithFetch(query, userLocation);
      
      return this.buildResponse(
        braveResult.fact, 
        braveResult.bestUrl || '', 
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
    category: SearchCategory,
    provider: string,
    startTime: number,
    success: boolean
  ): HybridFetchResponse {
    const timeMs = Date.now() - startTime;
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ [Hybrid] SEARCH COMPLETE`);
    console.log(`📊 Provider: ${provider}`);
    console.log(`🏷️  Category: ${category}`);
    console.log(`📏 Content: ${fact.length} chars`);
    console.log(`⏱️  Time: ${timeMs}ms`);
    console.log('═══════════════════════════════════════════════════════');

    return {
      fact,
      source,
      category,
      provider,
      timeMs,
      success,
    };
  },

  /**
   * 📊 Check service configuration
   */
  getStats(): { cseConfigured: boolean; braveConfigured: boolean } {
    return {
      cseConfigured: GoogleCSEService.isConfigured(),
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
};

export default HybridSearchService;