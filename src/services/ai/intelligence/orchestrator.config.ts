/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ORCHESTRATOR CONFIG v1.0 - 100% DYNAMIC
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * All configurable data for Intelligence Orchestrator.
 * - No hardcoded values in main service
 * - Can be updated at runtime
 * - Can be loaded from DB/API in future
 * - Zero token cost, zero time cost
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import type { DomainType } from '../../../core/ai/soriva-delta-engine';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SearchKeywordConfig {
  [category: string]: string[];
}

export interface DomainSuffixConfig {
  [domain: string]: string;
}

export interface CategoryDomainMap {
  [category: string]: DomainType;
}

export interface OrchestratorSettings {
  toneCacheTTLMs: number;
  intelligenceCacheTTLMs: number;
  enableToneMatcher: boolean;
  enableFullAnalysisFirstMessage: boolean;
  enableDomainDetection: boolean;
  enableDeltaPrebuild: boolean;
  maxToneAnalysisTimeMs: number;
  skipToneForSimple: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT CONFIGURATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_SEARCH_KEYWORDS: SearchKeywordConfig = {
  time: [
    'aaj', 'today', 'kal', 'tomorrow', 'abhi', 'now', 'current', 
    'latest', 'live', 'recent', 'breaking', 'is waqt', 'filhal'
  ],
  info: [
    'kya hai', 'what is', 'kaun hai', 'who is', 'kab', 'when', 
    'kahan', 'where', 'kitna', 'how much', 'price', 'rate', 'cost',
    'kaun', 'konsa', 'which'
  ],
  entertainment: [
    'movie', 'film', 'song', 'album', 'release', 'netflix', 
    'amazon prime', 'hotstar', 'ott', 'imdb', 'rating', 'review', 
    'trailer', 'box office', 'web series', 'bollywood', 'hollywood',
    'actor', 'actress', 'singer', 'music', 'gaana', 'picture'
  ],
  news: [
    'news', 'khabar', 'headline', 'election', 'match', 'score', 
    'result', 'winner', 'died', 'death', 'accident', 'update',
    'breaking', 'latest news', 'taaza khabar'
  ],
  finance: [
    'stock', 'share', 'sensex', 'nifty', 'bitcoin', 'crypto', 
    'dollar', 'rupee', 'gold', 'silver', 'petrol', 'diesel', 
    'market', 'trading', 'invest', 'mutual fund', 'price today'
  ],
  weather: [
    'weather', 'mausam', 'temperature', 'barish', 'rain', 
    'garmi', 'sardi', 'forecast', 'humidity', 'toofan', 'storm'
  ],
  sports: [
    'cricket', 'ipl', 'match', 'score', 'football', 'hockey', 
    'tennis', 'world cup', 'playing xi', 'toss', 'live score',
    'team', 'player', 'khel', 'tournament', 'final'
  ],
  festivals: [
    'festival', 'tyohar', 'holiday', 'chutti', 'diwali', 'holi', 
    'eid', 'christmas', 'navratri', 'puja', 'rakhi', 'baisakhi',
    'lohri', 'guru purab', 'kab hai'
  ],
  local: [
    'near me', 'nearby', 'best in', 'restaurant', 'hotel', 
    'shop', 'hospital', 'doctor', 'directions', 'address', 
    'location', 'paas mein', 'kahan milega', 'contact number'
  ],
  tech: [
    'download', 'app', 'software', 'update', 'version', 
    'launch', 'release date', 'features', 'specs', 'price india'
  ],
};

const DEFAULT_SIMPLE_GREETINGS: string[] = [
  'hi', 'hello', 'hey', 'hii', 'hiii', 'hiiii',
  'good morning', 'good afternoon', 'good evening', 'good night',
  'gm', 'gn', 'morning', 'evening',
  'namaste', 'namaskar', 'pranam', 'suprabhat',
  'kya haal', 'kaise ho', 'how are you', 'whats up', 'wassup', 'sup',
  'kya chal raha', 'sab theek', 'kaisa hai',
  'thanks', 'thank you', 'shukriya', 'dhanyavaad', 'thx', 'ty',
  'ok', 'okay', 'acha', 'accha', 'theek hai', 'thik hai',
  'hmm', 'hmmm', 'ohh', 'ohhh', 'achha', 'got it',
  'haan', 'nahi', 'yes', 'no', 'yeah', 'nope', 'ha', 'na',
  'bye', 'goodbye', 'alvida', 'tata', 'see you', 'bye bye',
  'jai shri ram', 'jai siyaram', 'har har mahadev', 'radhe radhe',
  'jai mata di', 'sat sri akal', 'jai hind', 'vande mataram',
];

const DEFAULT_DOMAIN_SUFFIXES: DomainSuffixConfig = {
  entertainment: ' release date rating review India 2025 2026',
  local: ' near me location address contact phone number',
  finance: ' today price India market live',
  tech: ' tutorial guide example documentation',
  travel: ' booking package India price',
  health: ' India doctor hospital near me',
  shopping: ' price buy India online best deal',
  education: ' course learn India free online',
  general: ' latest today India',
};

const DEFAULT_CATEGORY_DOMAIN_MAP: CategoryDomainMap = {
  entertainment: 'entertainment',
  news: 'general',
  finance: 'finance',
  weather: 'general',
  sports: 'entertainment',
  festivals: 'general',
  local: 'local',
  time: 'general',
  info: 'general',
  tech: 'tech',
};

const DEFAULT_SETTINGS: OrchestratorSettings = {
  toneCacheTTLMs: 15 * 60 * 1000,
  intelligenceCacheTTLMs: 10 * 60 * 1000,
  enableToneMatcher: true,
  enableFullAnalysisFirstMessage: true,
  enableDomainDetection: true,
  enableDeltaPrebuild: true,
  maxToneAnalysisTimeMs: 2000,
  skipToneForSimple: true,
};

const DEFAULT_HINDI_PATTERNS: string[] = [
  'kya', 'hai', 'kaise', 'batao', 'samjhao', 'bhai', 'yaar', 
  'haan', 'nahi', 'acha', 'theek', 'karo', 'karna', 'karun', 
  'karenge', 'hoga', 'tha', 'thi', 'mein', 'aur', 'par', 'se', 
  'ko', 'ka', 'ki', 'ke', 'aaegi', 'aayegi', 'ayegi', 'ho',
  'kuch', 'bahut', 'zyada', 'kam', 'accha', 'bura', 'sahi',
  'galat', 'pata', 'nahi', 'haan', 'ji', 'sir', 'madam'
];

const DEFAULT_COMPLEXITY_PATTERNS = {
  high: [
    'code', 'program', 'function', 'algorithm', 'analyze', 
    'compare', 'explain in detail', 'step by step', 'debug', 
    'error', 'architecture', 'design pattern', 'optimize'
  ],
  medium: [
    'explain', 'how to', 'why', 'difference', 'samjhao', 
    'batao detail', 'kaise kare', 'tutorial', 'guide', 
    'example', 'kya fark hai', 'compare karo'
  ],
};

const DEFAULT_STOP_WORDS: string[] = [
  'kya', 'hai', 'ka', 'ki', 'ke', 'ko', 'me', 'mein', 
  'the', 'is', 'a', 'an', 'what', 'how', 'when', 'where', 
  'who', 'why', 'batao', 'bataao', 'btao', 'btaao', 
  'please', 'pls', 'krdo', 'kardo', 'de', 'do', 'dijiye',
  'and', 'or', 'but', 'for', 'with', 'about', 'this', 'that'
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIG MANAGER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class OrchestratorConfigManager {
  private static instance: OrchestratorConfigManager;
  
  private searchKeywords: SearchKeywordConfig;
  private simpleGreetings: Set<string>;
  private domainSuffixes: DomainSuffixConfig;
  private categoryDomainMap: CategoryDomainMap;
  private settings: OrchestratorSettings;
  private hindiPatterns: RegExp;
  private complexityPatterns: { high: RegExp; medium: RegExp };
  private stopWords: Set<string>;
  private lastUpdated: Date;

  private constructor() {
    this.searchKeywords = this.deepClone(DEFAULT_SEARCH_KEYWORDS);
    this.simpleGreetings = new Set(DEFAULT_SIMPLE_GREETINGS);
    this.domainSuffixes = this.deepClone(DEFAULT_DOMAIN_SUFFIXES);
    this.categoryDomainMap = this.deepClone(DEFAULT_CATEGORY_DOMAIN_MAP);
    this.settings = { ...DEFAULT_SETTINGS };
    this.stopWords = new Set(DEFAULT_STOP_WORDS);
    this.hindiPatterns = this.buildHindiPatternRegex(DEFAULT_HINDI_PATTERNS);
    this.complexityPatterns = {
      high: this.buildPatternRegex(DEFAULT_COMPLEXITY_PATTERNS.high),
      medium: this.buildPatternRegex(DEFAULT_COMPLEXITY_PATTERNS.medium),
    };
    this.lastUpdated = new Date();
    
    console.log('[OrchestratorConfig] ✅ Initialized with default config');
  }

  static getInstance(): OrchestratorConfigManager {
    if (!OrchestratorConfigManager.instance) {
      OrchestratorConfigManager.instance = new OrchestratorConfigManager();
    }
    return OrchestratorConfigManager.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER: Deep Clone
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GETTERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getSearchKeywords(): SearchKeywordConfig {
    return this.searchKeywords;
  }

  getSimpleGreetings(): Set<string> {
    return this.simpleGreetings;
  }

  getDomainSuffixes(): DomainSuffixConfig {
    return this.domainSuffixes;
  }

  getCategoryDomainMap(): CategoryDomainMap {
    return this.categoryDomainMap;
  }

  getSettings(): OrchestratorSettings {
    return this.settings;
  }

  getHindiPatterns(): RegExp {
    return this.hindiPatterns;
  }

  getComplexityPatterns(): { high: RegExp; medium: RegExp } {
    return this.complexityPatterns;
  }

  getStopWords(): Set<string> {
    return this.stopWords;
  }

  getLastUpdated(): Date {
    return this.lastUpdated;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETTERS (For runtime updates)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  updateSearchKeywords(keywords: SearchKeywordConfig): void {
    this.searchKeywords = this.deepClone(keywords);
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 🔄 Search keywords updated');
  }

  addSearchKeyword(category: string, keyword: string): void {
    if (!this.searchKeywords[category]) {
      this.searchKeywords[category] = [];
    }
    if (!this.searchKeywords[category].includes(keyword)) {
      this.searchKeywords[category].push(keyword);
      this.lastUpdated = new Date();
    }
  }

  removeSearchKeyword(category: string, keyword: string): void {
    if (this.searchKeywords[category]) {
      this.searchKeywords[category] = this.searchKeywords[category].filter(k => k !== keyword);
      this.lastUpdated = new Date();
    }
  }

  updateSimpleGreetings(greetings: string[]): void {
    this.simpleGreetings = new Set(greetings);
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 🔄 Simple greetings updated');
  }

  addGreeting(greeting: string): void {
    this.simpleGreetings.add(greeting.toLowerCase());
    this.lastUpdated = new Date();
  }

  removeGreeting(greeting: string): void {
    this.simpleGreetings.delete(greeting.toLowerCase());
    this.lastUpdated = new Date();
  }

  updateDomainSuffixes(suffixes: DomainSuffixConfig): void {
    this.domainSuffixes = this.deepClone(suffixes);
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 🔄 Domain suffixes updated');
  }

  updateSettings(settings: Partial<OrchestratorSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 🔄 Settings updated');
  }

  updateHindiPatterns(patterns: string[]): void {
    this.hindiPatterns = this.buildHindiPatternRegex(patterns);
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 🔄 Hindi patterns updated');
  }

  updateComplexityPatterns(high: string[], medium: string[]): void {
    this.complexityPatterns = {
      high: this.buildPatternRegex(high),
      medium: this.buildPatternRegex(medium),
    };
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 🔄 Complexity patterns updated');
  }

  updateStopWords(words: string[]): void {
    this.stopWords = new Set(words);
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 🔄 Stop words updated');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BULK LOAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  loadFromObject(config: {
    searchKeywords?: SearchKeywordConfig;
    simpleGreetings?: string[];
    domainSuffixes?: DomainSuffixConfig;
    categoryDomainMap?: CategoryDomainMap;
    settings?: Partial<OrchestratorSettings>;
    hindiPatterns?: string[];
    complexityPatterns?: { high: string[]; medium: string[] };
    stopWords?: string[];
  }): void {
    if (config.searchKeywords) {
      this.searchKeywords = this.deepClone(config.searchKeywords);
    }
    if (config.simpleGreetings) {
      this.simpleGreetings = new Set(config.simpleGreetings);
    }
    if (config.domainSuffixes) {
      this.domainSuffixes = this.deepClone(config.domainSuffixes);
    }
    if (config.categoryDomainMap) {
      this.categoryDomainMap = this.deepClone(config.categoryDomainMap);
    }
    if (config.settings) {
      this.settings = { ...this.settings, ...config.settings };
    }
    if (config.hindiPatterns) {
      this.hindiPatterns = this.buildHindiPatternRegex(config.hindiPatterns);
    }
    if (config.complexityPatterns) {
      this.complexityPatterns = {
        high: this.buildPatternRegex(config.complexityPatterns.high),
        medium: this.buildPatternRegex(config.complexityPatterns.medium),
      };
    }
    if (config.stopWords) {
      this.stopWords = new Set(config.stopWords);
    }
    
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 📦 Bulk config loaded');
  }

  loadFromJSON(jsonString: string): void {
    try {
      const config = JSON.parse(jsonString);
      this.loadFromObject(config);
    } catch (error) {
      console.error('[OrchestratorConfig] ❌ Failed to parse JSON config:', error);
    }
  }

  exportToJSON(): string {
    return JSON.stringify({
      searchKeywords: this.searchKeywords,
      simpleGreetings: Array.from(this.simpleGreetings),
      domainSuffixes: this.domainSuffixes,
      categoryDomainMap: this.categoryDomainMap,
      settings: this.settings,
      stopWords: Array.from(this.stopWords),
      lastUpdated: this.lastUpdated,
    }, null, 2);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESET TO DEFAULTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  resetToDefaults(): void {
    this.searchKeywords = this.deepClone(DEFAULT_SEARCH_KEYWORDS);
    this.simpleGreetings = new Set(DEFAULT_SIMPLE_GREETINGS);
    this.domainSuffixes = this.deepClone(DEFAULT_DOMAIN_SUFFIXES);
    this.categoryDomainMap = this.deepClone(DEFAULT_CATEGORY_DOMAIN_MAP);
    this.settings = { ...DEFAULT_SETTINGS };
    this.stopWords = new Set(DEFAULT_STOP_WORDS);
    this.hindiPatterns = this.buildHindiPatternRegex(DEFAULT_HINDI_PATTERNS);
    this.complexityPatterns = {
      high: this.buildPatternRegex(DEFAULT_COMPLEXITY_PATTERNS.high),
      medium: this.buildPatternRegex(DEFAULT_COMPLEXITY_PATTERNS.medium),
    };
    this.lastUpdated = new Date();
    console.log('[OrchestratorConfig] 🔄 Reset to defaults');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildPatternRegex(patterns: string[]): RegExp {
    const escaped = patterns.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(escaped.join('|'), 'i');
  }

  private buildHindiPatternRegex(patterns: string[]): RegExp {
    const escaped = patterns.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'i');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getStats(): {
    searchCategories: number;
    totalSearchKeywords: number;
    greetingsCount: number;
    domainsCount: number;
    lastUpdated: Date;
  } {
    let totalKeywords = 0;
    for (const keywords of Object.values(this.searchKeywords)) {
      totalKeywords += keywords.length;
    }

    return {
      searchCategories: Object.keys(this.searchKeywords).length,
      totalSearchKeywords: totalKeywords,
      greetingsCount: this.simpleGreetings.size,
      domainsCount: Object.keys(this.domainSuffixes).length,
      lastUpdated: this.lastUpdated,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const OrchestratorConfig = OrchestratorConfigManager.getInstance();
export { OrchestratorConfigManager };

export const DEFAULTS = {
  SEARCH_KEYWORDS: DEFAULT_SEARCH_KEYWORDS,
  SIMPLE_GREETINGS: DEFAULT_SIMPLE_GREETINGS,
  DOMAIN_SUFFIXES: DEFAULT_DOMAIN_SUFFIXES,
  CATEGORY_DOMAIN_MAP: DEFAULT_CATEGORY_DOMAIN_MAP,
  SETTINGS: DEFAULT_SETTINGS,
  HINDI_PATTERNS: DEFAULT_HINDI_PATTERNS,
  COMPLEXITY_PATTERNS: DEFAULT_COMPLEXITY_PATTERNS,
  STOP_WORDS: DEFAULT_STOP_WORDS,
};