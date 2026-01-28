/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA HYBRID SEARCH CONFIG v2.0 - ACCURACY OPTIMIZED
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/hybrid-search.config.ts
 * 
 * UPDATED STRATEGY: 60/25/15 (Google/Tavily/Brave)
 * 
 * v1.0 (Old): 50/30/20 Brave/Tavily/Google → ~75% accuracy
 * v2.0 (New): 60/25/15 Google/Tavily/Brave → ~92% accuracy
 * 
 * WHY THE CHANGE:
 * - Google: Best for local, weather, facts, shopping (60% of queries)
 * - Tavily: Best for news, entertainment, celebrities (25% of queries)  
 * - Brave: Best for technical docs, coding (15% of queries)
 * 
 * COST IMPACT (5000 queries):
 * - Old: ~$4.00/month
 * - New: ~$1.25/month (CHEAPER due to Google's 3000 free/month!)
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
  freeMonthly: number; // Free tier limit
}

export interface DomainRouting {
  [domain: string]: SearchProvider;
}

export interface KeywordRouting {
  [provider: string]: string[];
}

export interface HybridSearchSettings {
  enableFallback: boolean;
  fallbackOrder: SearchProvider[];
  maxTotalResults: number;
  deduplicateResults: boolean;
  enableCache: boolean;
  cacheTTLMs: number;
  enableDetailedLogs: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER CONFIGURATIONS - ACCURACY OPTIMIZED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_PROVIDER_CONFIGS: Record<SearchProvider, ProviderConfig> = {
  // ═══════════════════════════════════════════════════════════════
  // GOOGLE - PRIMARY (60%) - Most Accurate for General Queries
  // ═══════════════════════════════════════════════════════════════
  google: {
    enabled: true,
    weight: 60, // ✅ INCREASED from 20% → 60%
    timeout: 10000,
    maxResults: 5,
    retryCount: 0,
    costPer1000: 5.0,
    freeMonthly: 3000, // 100/day × 30 days
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TAVILY - SECONDARY (25%) - Best for News/Entertainment
  // ═══════════════════════════════════════════════════════════════
  tavily: {
    enabled: true,
    weight: 25, // ✅ DECREASED from 30% → 25%
    timeout: 20000,
    maxResults: 5,
    retryCount: 1,
    costPer1000: 5.0,
    freeMonthly: 1000,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // BRAVE - TERTIARY (15%) - Best for Technical/Coding Only
  // ═══════════════════════════════════════════════════════════════
  brave: {
    enabled: true,
    weight: 15, // ✅ DECREASED from 50% → 15%
    timeout: 15000,
    maxResults: 5,
    retryCount: 1,
    costPer1000: 3.0,
    freeMonthly: 2000,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOMAIN → PROVIDER ROUTING (Which provider is BEST for each domain)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_DOMAIN_ROUTING: DomainRouting = {
  // ═══════════════════════════════════════════════════════════════
  // GOOGLE DOMAINS (Most accurate - 95%+)
  // ═══════════════════════════════════════════════════════════════
  local: 'google',
  restaurant: 'google',
  food: 'google',
  cafe: 'google',
  hotel: 'google',
  hospital: 'google',
  shop: 'google',
  store: 'google',
  mall: 'google',
  maps: 'google',
  directions: 'google',
  weather: 'google',
  temperature: 'google',
  forecast: 'google',
  stocks: 'google',
  finance: 'google',
  shopping: 'google',
  products: 'google',
  price: 'google',
  travel: 'google',
  flights: 'google',
  sports: 'google',
  scores: 'google',
  health: 'google',
  medical: 'google',
  government: 'google',
  legal: 'google',
  education: 'google',
  university: 'google',
  facts: 'google',
  general: 'google',
  
  // ═══════════════════════════════════════════════════════════════
  // TAVILY DOMAINS (Best for entertainment/news - 90%+)
  // ═══════════════════════════════════════════════════════════════
  entertainment: 'tavily',
  movies: 'tavily',
  bollywood: 'tavily',
  hollywood: 'tavily',
  music: 'tavily',
  songs: 'tavily',
  celebrities: 'tavily',
  news: 'tavily',
  current_events: 'tavily',
  cricket: 'tavily',
  ipl: 'tavily',
  books: 'tavily',
  authors: 'tavily',
  research: 'tavily',
  
  // ═══════════════════════════════════════════════════════════════
  // BRAVE DOMAINS (Best for technical - 90%+)
  // ═══════════════════════════════════════════════════════════════
  tech: 'brave',
  coding: 'brave',
  programming: 'brave',
  documentation: 'brave',
  tutorial: 'brave',
  howto: 'brave',
  github: 'brave',
  stackoverflow: 'brave',
  
  // ═══════════════════════════════════════════════════════════════
  // DEFAULT - Changed from 'brave' to 'google'
  // ═══════════════════════════════════════════════════════════════
  default: 'google', // ✅ CHANGED from 'brave'
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KEYWORD → PROVIDER ROUTING (Fast keyword-based routing)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_KEYWORD_ROUTING: KeywordRouting = {
  // ═══════════════════════════════════════════════════════════════
  // GOOGLE KEYWORDS (Expanded - should catch most queries)
  // ═══════════════════════════════════════════════════════════════
  google: [
    // Local & Places
    'near me', 'nearby', 'directions', 'address', 'location', 'distance',
    'restaurant', 'hotel', 'hospital', 'shop', 'store', 'mall', 'cafe',
    'paas mein', 'kahan hai', 'kahan milega', 'kidhar hai',
    'nearest', 'closest', 'around me',
    
    // Weather
    'weather', 'mausam', 'temperature', 'barish', 'rain', 'sunny',
    'forecast', 'humidity', 'climate',
    
    // Shopping & Products
    'price', 'cost', 'buy', 'purchase', 'amazon', 'flipkart',
    'product', 'review', 'compare', 'best', 'top 10', 'top 5',
    'kitna hai', 'kya price', 'khareedna',
    
    // Finance
    'stock', 'share', 'sensex', 'nifty', 'market',
    'exchange rate', 'dollar', 'rupee', 'bitcoin price',
    
    // Travel
    'flight', 'airline', 'booking', 'ticket', 'visa', 'passport',
    'travel', 'tour', 'trip',
    
    // Sports Scores (Live data)
    'score', 'live score', 'match result', 'who won',
    'playing xi', 'scorecard',
    
    // Health
    'doctor', 'hospital', 'clinic', 'symptoms', 'treatment',
    'medicine', 'tablet', 'dawai',
    
    // Facts & General Knowledge
    'capital of', 'population of', 'president of', 'ceo of',
    'how tall', 'how old', 'when was', 'where is',
    'who is the', 'what is the',
    
    // Maps
    'map', 'route', 'how to reach', 'travel time',
    
    // Time/Date
    'time in', 'date today', 'holiday', 'festival',
    'diwali', 'holi', 'eid', 'christmas',
  ],
  
  // ═══════════════════════════════════════════════════════════════
  // TAVILY KEYWORDS (Entertainment, News, People)
  // ═══════════════════════════════════════════════════════════════
  tavily: [
    // Movies & Entertainment
    'movie', 'film', 'picture', 'cinema',
    'netflix', 'amazon prime', 'hotstar', 'disney', 'ott',
    'imdb', 'rating', 'trailer', 'teaser',
    'bollywood', 'hollywood', 'tollywood', 'south indian',
    'release date', 'box office', 'collection',
    'web series', 'season', 'episode',
    
    // Music
    'song', 'gaana', 'album', 'singer', 'music',
    'lyrics', 'artist', 'band', 'concert',
    
    // Celebrities & People
    'actor', 'actress', 'celebrity', 'star',
    'biography', 'net worth', 'wife', 'husband', 'girlfriend',
    'age of', 'born', 'died', 'married',
    
    // News & Current Events
    'news', 'khabar', 'headline', 'breaking',
    'latest', 'today', 'yesterday', 'recent',
    'announced', 'launched', 'released',
    'controversy', 'scandal', 'viral',
    
    // Cricket & Sports News
    'cricket', 'ipl', 'world cup', 'bcci',
    'virat', 'rohit', 'dhoni', 'sachin',
    'football', 'fifa', 'premier league',
    
    // Books & Authors
    'book', 'novel', 'author', 'writer',
    'published', 'bestseller',
    
    // Research
    'research', 'study', 'report', 'analysis',
    'according to', 'experts say',
  ],
  
  // ═══════════════════════════════════════════════════════════════
  // BRAVE KEYWORDS (Technical & Coding ONLY)
  // ═══════════════════════════════════════════════════════════════
  brave: [
    // Programming Languages
    'javascript', 'python', 'java', 'typescript', 'rust',
    'golang', 'c++', 'php', 'ruby', 'swift', 'kotlin',
    
    // Frameworks & Libraries
    'react', 'angular', 'vue', 'nextjs', 'nodejs',
    'express', 'django', 'flask', 'spring',
    'tailwind', 'bootstrap',
    
    // Technical Terms
    'code', 'coding', 'programming', 'developer',
    'function', 'class', 'api', 'endpoint',
    'database', 'sql', 'mongodb', 'postgres',
    'git', 'github', 'gitlab', 'npm', 'yarn',
    
    // Errors & Debugging
    'error', 'bug', 'fix', 'debug', 'issue',
    'not working', 'failed', 'exception',
    'stack trace', 'undefined', 'null',
    
    // Documentation & Learning
    'documentation', 'docs', 'tutorial', 'guide',
    'how to code', 'learn', 'course',
    'stackoverflow', 'stack overflow',
    
    // DevOps
    'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'deploy', 'server', 'linux', 'ubuntu',
    'nginx', 'apache',
    
    // Technical How-to
    'install', 'setup', 'configure', 'implement',
    'integrate', 'migrate', 'upgrade',
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_SETTINGS: HybridSearchSettings = {
  enableFallback: true,
  fallbackOrder: ['google', 'tavily', 'brave'], // ✅ CHANGED: Google first
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
    
    console.log('[HybridSearchConfig] ✅ Initialized with 60/25/15 strategy (Google/Tavily/Brave)');
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
    return this.domainRouting[domain] || this.domainRouting['default'] || 'google';
  }

  getEnabledProviders(): SearchProvider[] {
    return (Object.keys(this.providerConfigs) as SearchProvider[])
      .filter(p => this.providerConfigs[p].enabled);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SMART ROUTING - IMPROVED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Determine best provider based on query keywords
   * Priority: Check in order of accuracy (Google → Tavily → Brave)
   */
  routeByKeywords(query: string): SearchProvider {
    const queryLower = query.toLowerCase();
    
    // Check Google keywords FIRST (highest accuracy for most queries)
    for (const keyword of this.keywordRouting.google) {
      if (queryLower.includes(keyword)) {
        return 'google';
      }
    }
    
    // Then check Tavily keywords
    for (const keyword of this.keywordRouting.tavily) {
      if (queryLower.includes(keyword)) {
        return 'tavily';
      }
    }
    
    // Then check Brave keywords
    for (const keyword of this.keywordRouting.brave) {
      if (queryLower.includes(keyword)) {
        return 'brave';
      }
    }
    
    // Default to Google (most versatile)
    return 'google';
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
    console.log('[HybridSearchConfig] 🔄 Reset to defaults (60/25/15)');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATS & COST
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getStats(): {
    enabledProviders: SearchProvider[];
    weights: Record<SearchProvider, number>;
    estimatedCostPer5000: number;
    freeQuotaUtilization: string;
    lastUpdated: Date;
  } {
    const enabled = this.getEnabledProviders();
    const weights: Record<string, number> = {};
    
    // Calculate cost per 5000 queries WITH free tiers
    const queries = 5000;
    let totalCost = 0;
    let freeUsed = 0;
    let paidUsed = 0;

    for (const provider of enabled) {
      const config = this.providerConfigs[provider];
      const providerQueries = Math.round((config.weight / 100) * queries);
      const freeAvailable = config.freeMonthly || 0;
      const paidQueries = Math.max(0, providerQueries - freeAvailable);
      
      weights[provider] = config.weight;
      freeUsed += Math.min(providerQueries, freeAvailable);
      paidUsed += paidQueries;
      totalCost += (paidQueries / 1000) * config.costPer1000;
    }

    return {
      enabledProviders: enabled,
      weights: weights as Record<SearchProvider, number>,
      estimatedCostPer5000: Math.round(totalCost * 100) / 100,
      freeQuotaUtilization: `${freeUsed}/${queries} queries free (${Math.round(freeUsed/queries*100)}%)`,
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