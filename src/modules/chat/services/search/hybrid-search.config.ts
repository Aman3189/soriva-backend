/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA HYBRID SEARCH CONFIG v1.0 - 100% DYNAMIC
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/hybrid-search.config.ts
 * 
 * All search provider configurations, routing rules, and 
 * domain mappings in one place. Runtime updatable.
 * 
 * STRATEGY: 50/30/20 (Brave/Tavily/Google)
 * - Brave (50%): Tech, coding, general, international
 * - Tavily (30%): Entertainment, cricket, finance, deep research
 * - Google (20%): Local, maps, festivals, real-time events
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type SearchProvider = 'brave' | 'tavily' | 'google';

export interface ProviderConfig {
  enabled: boolean;
  weight: number; // Percentage (0-100)
  timeout: number; // ms
  maxResults: number;
  retryCount: number;
  costPer1000: number; // USD
}

export interface DomainRouting {
  [domain: string]: SearchProvider;
}

export interface KeywordRouting {
  [provider: string]: string[];
}

export interface HybridSearchSettings {
  // Global settings
  enableFallback: boolean;
  fallbackOrder: SearchProvider[];
  maxTotalResults: number;
  deduplicateResults: boolean;
  
  // Caching
  enableCache: boolean;
  cacheTTLMs: number;
  
  // Logging
  enableDetailedLogs: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT CONFIGURATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_PROVIDER_CONFIGS: Record<SearchProvider, ProviderConfig> = {
  brave: {
    enabled: true,
    weight: 50,
    timeout: 15000,
    maxResults: 5,
    retryCount: 1,
    costPer1000: 3.0, // $3 per 1000 queries
  },
  tavily: {
    enabled: true,
    weight: 30,
    timeout: 20000,
    maxResults: 5,
    retryCount: 1,
    costPer1000: 5.0, // $5 per 1000 queries
  },
  google: {
    enabled: true,
    weight: 20,
    timeout: 10000,
    maxResults: 5,
    retryCount: 0,
    costPer1000: 5.0, // $5 per 1000 queries
  },
};

// Domain → Provider mapping (which provider is BEST for each domain)
const DEFAULT_DOMAIN_ROUTING: DomainRouting = {
  // Google excels at
  local: 'google',
  maps: 'google',
  festivals: 'google',
  weather: 'google',
  realtime: 'google',
  
  // Tavily excels at
  entertainment: 'tavily',
  cricket: 'tavily',
  sports: 'tavily',
  finance: 'tavily',
  news: 'tavily',
  research: 'tavily',
  
  // Brave excels at
  tech: 'brave',
  coding: 'brave',
  programming: 'brave',
  general: 'brave',
  international: 'brave',
  
  // Default
  default: 'brave',
};

// Keyword → Provider mapping (fast keyword-based routing)
const DEFAULT_KEYWORD_ROUTING: KeywordRouting = {
  google: [
    // Local
    'near me', 'nearby', 'directions', 'address', 'location',
    'restaurant', 'hotel', 'hospital', 'shop', 'store',
    'paas mein', 'kahan hai', 'kahan milega',
    // Festivals & Events
    'festival', 'holiday', 'diwali', 'holi', 'eid', 'christmas',
    'navratri', 'puja', 'tyohar', 'chutti',
    // Weather
    'weather', 'mausam', 'temperature', 'barish', 'rain',
    // Maps
    'map', 'route', 'distance', 'how to reach',
  ],
  tavily: [
    // Entertainment
    'movie', 'film', 'song', 'album', 'netflix', 'amazon prime',
    'hotstar', 'ott', 'imdb', 'rating', 'review', 'trailer',
    'bollywood', 'hollywood', 'actor', 'actress', 'release date',
    'box office', 'web series', 'gaana', 'picture',
    // Sports
    'cricket', 'ipl', 'match', 'score', 'world cup', 'playing xi',
    'football', 'hockey', 'tennis', 'tournament',
    // Finance
    'stock', 'share', 'sensex', 'nifty', 'bitcoin', 'crypto',
    'market', 'trading', 'invest', 'mutual fund',
    // News
    'news', 'khabar', 'headline', 'breaking', 'latest news',
  ],
  brave: [
    // Tech & Coding
    'code', 'programming', 'javascript', 'python', 'react',
    'nodejs', 'api', 'github', 'stackoverflow', 'tutorial',
    'error', 'debug', 'function', 'algorithm', 'database',
    // General knowledge
    'what is', 'how to', 'why', 'explain', 'definition',
    'history', 'wikipedia', 'meaning',
  ],
};

const DEFAULT_SETTINGS: HybridSearchSettings = {
  enableFallback: true,
  fallbackOrder: ['brave', 'tavily', 'google'],
  maxTotalResults: 10,
  deduplicateResults: true,
  enableCache: true,
  cacheTTLMs: 5 * 60 * 1000, // 5 minutes
  enableDetailedLogs: true,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIG MANAGER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class HybridSearchConfigManager {
  private static instance: HybridSearchConfigManager;
  
  private providerConfigs: Record<SearchProvider, ProviderConfig>;
  private domainRouting: DomainRouting;
  private keywordRouting: KeywordRouting;
  private settings: HybridSearchSettings;
  private lastUpdated: Date;

  private constructor() {
    this.providerConfigs = this.deepClone(DEFAULT_PROVIDER_CONFIGS);
    this.domainRouting = this.deepClone(DEFAULT_DOMAIN_ROUTING);
    this.keywordRouting = this.deepClone(DEFAULT_KEYWORD_ROUTING);
    this.settings = { ...DEFAULT_SETTINGS };
    this.lastUpdated = new Date();
    
    console.log('[HybridSearchConfig] ✅ Initialized with 50/30/20 strategy');
  }

  static getInstance(): HybridSearchConfigManager {
    if (!HybridSearchConfigManager.instance) {
      HybridSearchConfigManager.instance = new HybridSearchConfigManager();
    }
    return HybridSearchConfigManager.instance;
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GETTERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getProviderConfig(provider: SearchProvider): ProviderConfig {
    return this.providerConfigs[provider];
  }

  getAllProviderConfigs(): Record<SearchProvider, ProviderConfig> {
    return this.providerConfigs;
  }

  getDomainRouting(): DomainRouting {
    return this.domainRouting;
  }

  getKeywordRouting(): KeywordRouting {
    return this.keywordRouting;
  }

  getSettings(): HybridSearchSettings {
    return this.settings;
  }

  getProviderForDomain(domain: string): SearchProvider {
    return this.domainRouting[domain] || this.domainRouting['default'] || 'brave';
  }

  getEnabledProviders(): SearchProvider[] {
    return (Object.keys(this.providerConfigs) as SearchProvider[])
      .filter(p => this.providerConfigs[p].enabled);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SMART ROUTING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Determine best provider based on query keywords
   */
  routeByKeywords(query: string): SearchProvider {
    const queryLower = query.toLowerCase();
    
    // Check each provider's keywords
    for (const [provider, keywords] of Object.entries(this.keywordRouting)) {
      for (const keyword of keywords) {
        if (queryLower.includes(keyword)) {
          return provider as SearchProvider;
        }
      }
    }
    
    // Default to brave
    return 'brave';
  }

  /**
   * Get provider with fallbacks
   */
  getProviderWithFallback(preferredProvider: SearchProvider): SearchProvider[] {
    const providers: SearchProvider[] = [preferredProvider];
    
    if (this.settings.enableFallback) {
      for (const fallback of this.settings.fallbackOrder) {
        if (fallback !== preferredProvider && this.providerConfigs[fallback].enabled) {
          providers.push(fallback);
        }
      }
    }
    
    return providers;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETTERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  updateProviderConfig(provider: SearchProvider, config: Partial<ProviderConfig>): void {
    this.providerConfigs[provider] = { ...this.providerConfigs[provider], ...config };
    this.lastUpdated = new Date();
    console.log(`[HybridSearchConfig] 🔄 ${provider} config updated`);
  }

  setProviderWeight(provider: SearchProvider, weight: number): void {
    this.providerConfigs[provider].weight = weight;
    this.lastUpdated = new Date();
  }

  enableProvider(provider: SearchProvider): void {
    this.providerConfigs[provider].enabled = true;
    this.lastUpdated = new Date();
  }

  disableProvider(provider: SearchProvider): void {
    this.providerConfigs[provider].enabled = false;
    this.lastUpdated = new Date();
  }

  updateDomainRouting(domain: string, provider: SearchProvider): void {
    this.domainRouting[domain] = provider;
    this.lastUpdated = new Date();
  }

  addKeywordRouting(provider: SearchProvider, keyword: string): void {
    if (!this.keywordRouting[provider]) {
      this.keywordRouting[provider] = [];
    }
    if (!this.keywordRouting[provider].includes(keyword)) {
      this.keywordRouting[provider].push(keyword);
      this.lastUpdated = new Date();
    }
  }

  updateSettings(settings: Partial<HybridSearchSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.lastUpdated = new Date();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BULK OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  loadFromObject(config: {
    providerConfigs?: Partial<Record<SearchProvider, Partial<ProviderConfig>>>;
    domainRouting?: DomainRouting;
    keywordRouting?: KeywordRouting;
    settings?: Partial<HybridSearchSettings>;
  }): void {
    if (config.providerConfigs) {
      for (const [provider, cfg] of Object.entries(config.providerConfigs)) {
        this.providerConfigs[provider as SearchProvider] = {
          ...this.providerConfigs[provider as SearchProvider],
          ...cfg,
        };
      }
    }
    if (config.domainRouting) {
      this.domainRouting = { ...this.domainRouting, ...config.domainRouting };
    }
    if (config.keywordRouting) {
      this.keywordRouting = { ...this.keywordRouting, ...config.keywordRouting };
    }
    if (config.settings) {
      this.settings = { ...this.settings, ...config.settings };
    }
    this.lastUpdated = new Date();
    console.log('[HybridSearchConfig] 📦 Bulk config loaded');
  }

  exportToJSON(): string {
    return JSON.stringify({
      providerConfigs: this.providerConfigs,
      domainRouting: this.domainRouting,
      keywordRouting: this.keywordRouting,
      settings: this.settings,
      lastUpdated: this.lastUpdated,
    }, null, 2);
  }

  resetToDefaults(): void {
    this.providerConfigs = this.deepClone(DEFAULT_PROVIDER_CONFIGS);
    this.domainRouting = this.deepClone(DEFAULT_DOMAIN_ROUTING);
    this.keywordRouting = this.deepClone(DEFAULT_KEYWORD_ROUTING);
    this.settings = { ...DEFAULT_SETTINGS };
    this.lastUpdated = new Date();
    console.log('[HybridSearchConfig] 🔄 Reset to defaults');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATS & COST
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getStats(): {
    enabledProviders: SearchProvider[];
    weights: Record<SearchProvider, number>;
    estimatedCostPer1000: number;
    lastUpdated: Date;
  } {
    const enabled = this.getEnabledProviders();
    const weights: Record<string, number> = {};
    let totalCost = 0;

    for (const provider of enabled) {
      const config = this.providerConfigs[provider];
      weights[provider] = config.weight;
      totalCost += (config.weight / 100) * config.costPer1000;
    }

    return {
      enabledProviders: enabled,
      weights: weights as Record<SearchProvider, number>,
      estimatedCostPer1000: Math.round(totalCost * 100) / 100,
      lastUpdated: this.lastUpdated,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HybridSearchConfig = HybridSearchConfigManager.getInstance();
export { HybridSearchConfigManager };

export const DEFAULTS = {
  PROVIDER_CONFIGS: DEFAULT_PROVIDER_CONFIGS,
  DOMAIN_ROUTING: DEFAULT_DOMAIN_ROUTING,
  KEYWORD_ROUTING: DEFAULT_KEYWORD_ROUTING,
  SETTINGS: DEFAULT_SETTINGS,
};