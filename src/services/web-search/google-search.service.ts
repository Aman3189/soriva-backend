/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GOOGLE CUSTOM SEARCH SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from 'axios';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  domain: string;
}

class GoogleSearchService {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';

    if (!this.apiKey || !this.searchEngineId) {
      console.warn('⚠️  Google Search API credentials not configured');
    }
  }

  /**
   * Search the web
   */
  async search(query: string, options?: {
    numResults?: number;
    region?: string;
  }): Promise<SearchResult[]> {
    if (!this.apiKey || !this.searchEngineId) {
      console.error('❌ Google Search API not configured');
      return [];
    }

    try {
      console.log(`🔍 Searching: "${query}"`);

      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.searchEngineId,
          q: query,
          num: options?.numResults || 5,
          gl: options?.region || 'in',
        },
        timeout: 10000,
      });

      if (!response.data.items) {
        console.log('ℹ️  No search results found');
        return [];
      }

      const results = response.data.items.map((item: any) => ({
        title: this.cleanTitle(item.title),
        link: item.link,
        snippet: item.snippet || '',
        domain: this.extractDomain(item.link),
      }));

      console.log(`✅ Found ${results.length} results`);
      return results;

    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error('❌ Search API quota exceeded');
      } else if (error.response?.status === 403) {
        console.error('❌ API key invalid or restricted');
      } else {
        console.error('❌ Search error:', error.message);
      }
      return [];
    }
  }

  /**
   * Specialized search for cricket
   */
  async searchCricket(query: string): Promise<SearchResult[]> {
    const enhancedQuery = `${query} site:cricbuzz.com OR site:espncricinfo.com`;
    return this.search(enhancedQuery, { numResults: 3 });
  }

  /**
   * Specialized search for news
   */
  async searchNews(query: string): Promise<SearchResult[]> {
    const enhancedQuery = `${query} latest news india`;
    return this.search(enhancedQuery, { numResults: 5 });
  }

  /**
   * Clean title (remove site name suffixes)
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/\s*[-–—]\s*.+$/, '')
      .replace(/\s*\|.+$/, '')
      .trim();
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return 'web';
    }
  }
}

export const googleSearchService = new GoogleSearchService();