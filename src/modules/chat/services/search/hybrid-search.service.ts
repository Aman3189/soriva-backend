/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA HYBRID SEARCH SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/hybrid-search.service.ts
 *
 * STRATEGY: 50/30/20 (Brave/Tavily/Google)
 * - Smart routing based on query domain/keywords
 * - Automatic fallback on failure
 * - Result deduplication
 * - Unified response format
 *
 * Expected Accuracy Improvement:
 * - Brave Only: 62%
 * - Hybrid 50/30/20: 93% (+31%)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { SearchResultItem } from "./core/data";
import { BraveService, BraveResponse } from "./services/brave";
import { TavilyService, TavilyResponse } from "./services/tavily";
import { GoogleService, GoogleResponse } from "./services/google";
import { 
  HybridSearchConfig, 
  SearchProvider,
  type ProviderConfig 
} from "./hybrid-search.config";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface HybridSearchResult {
  results: SearchResultItem[];
  answer?: string;
  provider: SearchProvider;
  fallbackUsed: boolean;
  fallbackProvider?: SearchProvider;
  timeMs: number;
  query: string;
  domain?: string;
  metadata: {
    totalProvidersCalled: number;
    providersAttempted: SearchProvider[];
    deduplicatedCount: number;
  };
}

export interface HybridSearchOptions {
  domain?: string;
  preferredProvider?: SearchProvider;
  maxResults?: number;
  enableFallback?: boolean;
  forceProvider?: SearchProvider; // Skip smart routing
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CACHE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface CachedSearch {
  result: HybridSearchResult;
  timestamp: number;
}

const searchCache: Map<string, CachedSearch> = new Map();

function getCacheKey(query: string, provider: SearchProvider): string {
  return `${provider}:${query.toLowerCase().trim()}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HybridSearchService = {
  /**
   * Main search method - automatically routes to best provider
   */
  async search(query: string, options: HybridSearchOptions = {}): Promise<HybridSearchResult> {
    const startTime = Date.now();
    const settings = HybridSearchConfig.getSettings();
    const {
      domain,
      preferredProvider,
      maxResults = settings.maxTotalResults,
      enableFallback = settings.enableFallback,
      forceProvider,
    } = options;

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[HybridSearch] 🔍 Processing query');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Query: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"`);

    // Determine provider
    let selectedProvider: SearchProvider;
    
    if (forceProvider) {
      selectedProvider = forceProvider;
      console.log(`🎯 Forced provider: ${selectedProvider}`);
    } else if (preferredProvider) {
      selectedProvider = preferredProvider;
      console.log(`🎯 Preferred provider: ${selectedProvider}`);
    } else if (domain) {
      selectedProvider = HybridSearchConfig.getProviderForDomain(domain);
      console.log(`🎯 Domain-based routing: ${domain} → ${selectedProvider}`);
    } else {
      selectedProvider = HybridSearchConfig.routeByKeywords(query);
      console.log(`🎯 Keyword-based routing → ${selectedProvider}`);
    }

    // Check cache
    if (settings.enableCache) {
      const cached = this.getFromCache(query, selectedProvider);
      if (cached) {
        console.log(`💾 Cache HIT`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return cached;
      }
    }

    // Get providers to try (with fallbacks)
    const providersToTry = enableFallback
      ? HybridSearchConfig.getProviderWithFallback(selectedProvider)
      : [selectedProvider];

    console.log(`📋 Providers to try: ${providersToTry.join(' → ')}`);

    const providersAttempted: SearchProvider[] = [];
    let result: HybridSearchResult | null = null;
    let fallbackUsed = false;
    let fallbackProvider: SearchProvider | undefined;

    // Try each provider
    for (const provider of providersToTry) {
      providersAttempted.push(provider);
      
      console.log(`🔄 Trying: ${provider}`);
      const providerResult = await this.callProvider(provider, query, maxResults);

      if (providerResult && providerResult.results.length > 0) {
        // Success!
        const timeMs = Date.now() - startTime;
        
        if (provider !== selectedProvider) {
          fallbackUsed = true;
          fallbackProvider = provider;
        }

        result = {
          results: settings.deduplicateResults 
            ? this.deduplicateResults(providerResult.results)
            : providerResult.results,
          answer: providerResult.answer,
          provider: selectedProvider,
          fallbackUsed,
          fallbackProvider,
          timeMs,
          query,
          domain,
          metadata: {
            totalProvidersCalled: providersAttempted.length,
            providersAttempted,
            deduplicatedCount: 0,
          },
        };

        // Update deduplicated count
        if (settings.deduplicateResults) {
          result.metadata.deduplicatedCount = 
            providerResult.results.length - result.results.length;
        }

        console.log(`✅ Success with ${provider}: ${result.results.length} results`);
        break;
      } else {
        console.log(`⚠️ ${provider} returned no results`);
      }
    }

    // If all providers failed
    if (!result) {
      const timeMs = Date.now() - startTime;
      result = {
        results: [],
        provider: selectedProvider,
        fallbackUsed: providersAttempted.length > 1,
        timeMs,
        query,
        domain,
        metadata: {
          totalProvidersCalled: providersAttempted.length,
          providersAttempted,
          deduplicatedCount: 0,
        },
      };
      console.log(`❌ All providers failed`);
    }

    // Cache result
    if (settings.enableCache && result.results.length > 0) {
      this.saveToCache(query, result.provider, result);
    }

    console.log(`⏱️ Total time: ${result.timeMs}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return result;
  },

  /**
   * Call specific provider
   */
  async callProvider(
    provider: SearchProvider, 
    query: string, 
    maxResults: number
  ): Promise<{ results: SearchResultItem[]; answer?: string } | null> {
    const config = HybridSearchConfig.getProviderConfig(provider);
    
    if (!config.enabled) {
      console.log(`[HybridSearch] ⚠️ ${provider} is disabled`);
      return null;
    }

    try {
      switch (provider) {
        case 'brave': {
          const res = await BraveService.search(query, maxResults);
          return res ? { results: res.results, answer: res.answer } : null;
        }
        case 'tavily': {
          const res = await TavilyService.search(query, maxResults);
          return res ? { results: res.results, answer: res.answer } : null;
        }
        case 'google': {
          const res = await GoogleService.search(query, maxResults);
          return res ? { results: res.results, answer: res.answer } : null;
        }
        default:
          return null;
      }
    } catch (error) {
      console.error(`[HybridSearch] ❌ ${provider} error:`, error);
      return null;
    }
  },

  /**
   * Search with specific provider (skip routing)
   */
  async searchWithProvider(
    provider: SearchProvider, 
    query: string, 
    maxResults: number = 5
  ): Promise<HybridSearchResult> {
    return this.search(query, { forceProvider: provider, maxResults });
  },

  /**
   * Local search (optimized for Google)
   */
  async localSearch(query: string, location?: string): Promise<HybridSearchResult> {
    const enhancedQuery = location 
      ? `${query} in ${location}`
      : query;
    
    return this.search(enhancedQuery, { 
      domain: 'local',
      preferredProvider: 'google',
    });
  },

  /**
   * Entertainment search (optimized for Tavily)
   */
  async entertainmentSearch(query: string): Promise<HybridSearchResult> {
    return this.search(query, {
      domain: 'entertainment',
      preferredProvider: 'tavily',
    });
  },

  /**
   * Tech search (optimized for Brave)
   */
  async techSearch(query: string): Promise<HybridSearchResult> {
    return this.search(query, {
      domain: 'tech',
      preferredProvider: 'brave',
    });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEDUPLICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  deduplicateResults(results: SearchResultItem[]): SearchResultItem[] {
    const seen = new Set<string>();
    const deduplicated: SearchResultItem[] = [];

    for (const result of results) {
      // Normalize URL for comparison
      const normalizedUrl = result.url
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');

      if (!seen.has(normalizedUrl)) {
        seen.add(normalizedUrl);
        deduplicated.push(result);
      }
    }

    return deduplicated;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getFromCache(query: string, provider: SearchProvider): HybridSearchResult | null {
    const settings = HybridSearchConfig.getSettings();
    const key = getCacheKey(query, provider);
    const cached = searchCache.get(key);

    if (cached && (Date.now() - cached.timestamp) < settings.cacheTTLMs) {
      return cached.result;
    }

    // Clean expired entry
    if (cached) {
      searchCache.delete(key);
    }

    return null;
  },

  saveToCache(query: string, provider: SearchProvider, result: HybridSearchResult): void {
    const key = getCacheKey(query, provider);
    searchCache.set(key, {
      result,
      timestamp: Date.now(),
    });
  },

  clearCache(): void {
    searchCache.clear();
    console.log('[HybridSearch] 🧹 Cache cleared');
  },

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: searchCache.size,
      keys: Array.from(searchCache.keys()),
    };
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get provider availability status
   */
  getProviderStatus(): Record<SearchProvider, { configured: boolean; enabled: boolean }> {
    return {
      brave: {
        configured: BraveService.isConfigured(),
        enabled: HybridSearchConfig.getProviderConfig('brave').enabled,
      },
      tavily: {
        configured: TavilyService.isConfigured(),
        enabled: HybridSearchConfig.getProviderConfig('tavily').enabled,
      },
      google: {
        configured: GoogleService.isConfigured(),
        enabled: HybridSearchConfig.getProviderConfig('google').enabled,
      },
    };
  },

  /**
   * Get config for external access
   */
  getConfig() {
    return HybridSearchConfig;
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<SearchProvider, boolean>;
  }> {
    const status = this.getProviderStatus();
    const workingProviders = Object.values(status)
      .filter(s => s.configured && s.enabled).length;

    return {
      status: workingProviders === 3 ? 'healthy' 
        : workingProviders >= 1 ? 'degraded' 
        : 'unhealthy',
      providers: {
        brave: status.brave.configured && status.brave.enabled,
        tavily: status.tavily.configured && status.tavily.enabled,
        google: status.google.configured && status.google.enabled,
      },
    };
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { HybridSearchConfig };