/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA TONE MATCHER SERVICE v4.1 - ELITE PRODUCTION ENGINE
 * Deterministic Language Detection + Lightweight Formality LLM
 * + Production-Grade Caching
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * CHANGES v4.1:
 * - Added per-user caching with TTL
 * - analyzeTone(text, userId?) - optional userId for caching
 * - clearCache(userId?) - clear specific user or all
 * - getCacheStats() - monitoring stats
 * - Auto-cleanup of expired entries
 */

import {
  DetectedLanguage,
  LanguageFormality,
  ToneAnalysis,
  LLMService,
} from './intelligence.types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface StyleResponse {
  useHinglish: boolean;
  formalityLevel: LanguageFormality;
  examplePhrases: string[];
}

interface CacheEntry {
  analysis: ToneAnalysis;
  timestamp: number;
}

interface CacheStats {
  totalEntries: number;
  userCount: number;
  hitRate: number;
  memoryEstimateKB: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CACHE_CONFIG = {
  TTL_MS: 5 * 60 * 1000,           // 5 minutes
  MAX_ENTRIES_PER_USER: 20,        // Max cached messages per user
  MAX_TOTAL_ENTRIES: 1000,         // Global max
  CLEANUP_INTERVAL_MS: 60 * 1000,  // Cleanup every 1 minute
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// HINDI MARKERS (Safe - No English Collisions)
// ═══════════════════════════════════════════════════════════════════════════════

const HINDI_MARKERS = new Set([
  // Question words
  'kya', 'kaise', 'kab', 'kahan', 'kahaan', 'kyun', 'kyu', 'kaun', 'kitna', 'kitni', 'kitne', 'kaisi', 'kaisa', 'konsa', 'konsi',

  // Core verbs
  'hai', 'hain', 'ho', 'hoon', 'hun', 'hoga', 'hogi', 'honge', 'tha', 'thi',
  'raha', 'rahi', 'rahe',
  'kar', 'karo', 'karna', 'karti', 'karte', 'kiya',
  'bata', 'batao', 'btao', 'batana', 'batati', 'batate',
  'chal', 'chalo', 'jao', 'jaa', 'aao', 'aaja',
  'de', 'do', 'dena', 'dete',
  'le', 'lo', 'lena', 'lete',
  'dekh', 'dekho', 'sun', 'suno', 'bol', 'bolo', 'likh', 'likho',
  'padh', 'padho', 'samajh', 'samjho',

  // Pronouns
  'main', 'mai', 'mujhe', 'muje', 'aap', 'tum', 'hum', 'tera', 'meri', 'mere',

  // Postpositions
  'ka', 'ki', 'ke', 'ko', 'se', 'par', 'pe', 'tak', 'wala', 'wali', 'wale',

  // Common Hindi-only
  'nahi', 'nhi', 'mat', 'bilkul', 'zaroor', 'pakka', 'shayad',
  'accha', 'acha', 'achha', 'theek', 'thik', 'sahi', 'galat',
  'bahut', 'bohot', 'zyada', 'kam', 'thoda',
  'abhi', 'aaj', 'kal', 'subah', 'shaam', 'raat',
  'aur', 'bhi', 'phir'

]);
// ═══════════════════════════════════════════════════════════════════════════════
// TONE MATCHER SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export class ToneMatcherService {
  private llmService: LLMService;
  
  // Cache: userId -> (messageHash -> CacheEntry)
  private cache: Map<string, Map<string, CacheEntry>> = new Map();
  
  // Stats tracking
  private stats = {
    hits: 0,
    misses: 0,
  };
  
  // Cleanup interval reference
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    this.startCleanupInterval();
    console.log('[ToneMatcher] ✅ v4.1 Elite Engine Active (with caching)');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN ANALYSIS (with optional caching)
  // ═══════════════════════════════════════════════════════════════════════════════

  public async analyzeTone(text: string, userId?: string): Promise<ToneAnalysis> {
    // Try cache first if userId provided
    if (userId) {
      const cached = this.getFromCache(userId, text);
      if (cached) {
        this.stats.hits++;
        return cached;
      }
      this.stats.misses++;
    }

    // Perform analysis
    const explicit = this.detectExplicitLanguageRequest(text);
    const language = explicit || this.detectLanguage(text);
    const formality = await this.detectFormality(text);

    const { hindiPercent, englishPercent } = this.calculateLanguagePercent(text, language);

    const analysis: ToneAnalysis = {
      language,
      formality,
      hindiWordsPercent: hindiPercent,
      englishWordsPercent: englishPercent,
      hinglishPhrases: [],
      shouldMatchTone: true,
      suggestedStyle: this.buildStyle(language, formality),
    };

    // Cache the result if userId provided
    if (userId) {
      this.addToCache(userId, text, analysis);
    }

    return analysis;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Clear cache - specific user or all
   */
  public clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
      console.log(`[ToneMatcher] Cache cleared for user: ${userId}`);
    } else {
      this.cache.clear();
      this.stats.hits = 0;
      this.stats.misses = 0;
      console.log('[ToneMatcher] Full cache cleared');
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): CacheStats {
    let totalEntries = 0;
    
    for (const userCache of this.cache.values()) {
      totalEntries += userCache.size;
    }

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    // Rough memory estimate (JSON string length * 2 for UTF-16)
    const memoryEstimateKB = Math.round((totalEntries * 500) / 1024);

    return {
      totalEntries,
      userCount: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryEstimateKB,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIVATE CACHE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  private getFromCache(userId: string, text: string): ToneAnalysis | null {
    const userCache = this.cache.get(userId);
    if (!userCache) return null;

    const hash = this.hashText(text);
    const entry = userCache.get(hash);

    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > CACHE_CONFIG.TTL_MS) {
      userCache.delete(hash);
      return null;
    }

    // Refresh entry for true LRU behavior
      userCache.delete(hash);
      userCache.set(hash, {
        analysis: entry.analysis,
        timestamp: entry.timestamp,
      });

      return entry.analysis;
  }

  private addToCache(userId: string, text: string, analysis: ToneAnalysis): void {
    let userCache = this.cache.get(userId);

    if (!userCache) {
      userCache = new Map();
      this.cache.set(userId, userCache);
    }

    // Enforce per-user limit (LRU-style: remove oldest)
    if (userCache.size >= CACHE_CONFIG.MAX_ENTRIES_PER_USER) {
      const oldestKey = userCache.keys().next().value;
      if (oldestKey) {
        userCache.delete(oldestKey);
      }
    }

    // Enforce global limit
    const totalEntries = this.getTotalEntries();
    if (totalEntries >= CACHE_CONFIG.MAX_TOTAL_ENTRIES) {
      this.evictOldestGlobal();
    }

    const hash = this.hashText(text);
    userCache.set(hash, {
      analysis,
      timestamp: Date.now(),
    });
  }

  private getTotalEntries(): number {
    let total = 0;
    for (const userCache of this.cache.values()) {
      total += userCache.size;
    }
    return total;
  }

  private evictOldestGlobal(): void {
    let oldestTime = Infinity;
    let oldestUserId: string | null = null;
    let oldestHash: string | null = null;

    for (const [userId, userCache] of this.cache.entries()) {
      for (const [hash, entry] of userCache.entries()) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestUserId = userId;
          oldestHash = hash;
        }
      }
    }

    if (oldestUserId && oldestHash) {
      const userCache = this.cache.get(oldestUserId);
      if (userCache) {
        userCache.delete(oldestHash);
        if (userCache.size === 0) {
          this.cache.delete(oldestUserId);
        }
      }
    }
  }

  private hashText(text: string): string {
    // Simple hash for cache key
    const normalized = text.toLowerCase().trim().slice(0, 200);
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, CACHE_CONFIG.CLEANUP_INTERVAL_MS);

    // Don't prevent process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, userCache] of this.cache.entries()) {
      for (const [hash, entry] of userCache.entries()) {
        if (now - entry.timestamp > CACHE_CONFIG.TTL_MS) {
          userCache.delete(hash);
          cleaned++;
        }
      }

      // Remove empty user caches
      if (userCache.size === 0) {
        this.cache.delete(userId);
      }
    }

    if (cleaned > 0) {
      console.log(`[ToneMatcher] Cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Destroy service (cleanup interval)
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    console.log('[ToneMatcher] Service destroyed');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LANGUAGE DETECTION (DETERMINISTIC)
  // ═══════════════════════════════════════════════════════════════════════════════

  private detectLanguage(text: string): DetectedLanguage {
    const trimmed = text.trim();
    if (!trimmed) return 'english';

    // Devanagari = Hindi 100%
    if (/[\u0900-\u097F]/.test(trimmed)) {
      return 'hindi';
    }

    const words = this.cleanWords(trimmed);
    if (words.length === 0) return 'english';

    let hindiCount = 0;

    for (const word of words) {
      if (HINDI_MARKERS.has(word)) {
        hindiCount++;
      }
    }

    const ratio = hindiCount / words.length;

    // Roman Hindi majority
    if (ratio >= 0.7) {
      return 'hindi';
    }

    // Hinglish threshold
    if (hindiCount >= 2 || ratio >= 0.2) {
      return 'hinglish';
    }

    // Short message (1 word)
    if (words.length === 1 && HINDI_MARKERS.has(words[0])) {
      return 'hinglish';
    }

    return 'english';
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FORMALITY DETECTION (LLM - Cached)
  // ═══════════════════════════════════════════════════════════════════════════════

  private async detectFormality(text: string): Promise<LanguageFormality> {
  const trimmed = text.trim();
  if (trimmed.length <= 3) return 'casual'; // ultra short = casual

  try {
      const prompt = `
Classify the formality level of the message below.

"${text}"

Respond with ONLY one word:
casual
semi_formal
formal
Do not add any other text.
`;

      const response = await this.llmService.generateCompletion(prompt, {
        maxTokens: 5,
        temperature: 0,
      });

      const clean = response.toLowerCase().trim().split(/\s+/)[0];

      if (clean === 'formal') return 'formal';
      if (clean === 'semi_formal') return 'semi_formal';
      return 'casual';
    } catch {
      return 'casual';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LANGUAGE PERCENT CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════════

  private calculateLanguagePercent(text: string, language: DetectedLanguage) {
    if (language === 'hindi') {
      return { hindiPercent: 100, englishPercent: 0 };
    }

    const words = this.cleanWords(text);
    if (words.length === 0) {
      return { hindiPercent: 0, englishPercent: 100 };
    }

    let hindiCount = 0;

    for (const word of words) {
      if (HINDI_MARKERS.has(word)) {
        hindiCount++;
      }
    }

    const hindiPercent = Math.round((hindiCount / words.length) * 100);
    const englishPercent = 100 - hindiPercent;

    return { hindiPercent, englishPercent };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // STYLE BUILDER
  // ═══════════════════════════════════════════════════════════════════════════════

  private buildStyle(language: DetectedLanguage, formality: LanguageFormality): StyleResponse {
    if (language === 'hinglish' || language === 'hindi') {
      return {
        useHinglish: true,
        formalityLevel: formality,
        examplePhrases:
          formality === 'formal'
            ? [
                'Ji bilkul, main madad kar sakti hoon.',
                'Zaroor, batati hoon.',
                'Main samjhti hoon, dekhiye.',
              ]
            : [
                'Haan bilkul!',
                'Batati hoon.',
                'Chalo dekhte hain.',
              ],
      };
    }

    return {
      useHinglish: false,
      formalityLevel: formality,
      examplePhrases: [
        'Sure!',
        'Let me explain.',
        'Absolutely.',
      ],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXPLICIT LANGUAGE OVERRIDE
  // ═══════════════════════════════════════════════════════════════════════════════

  private detectExplicitLanguageRequest(text: string): DetectedLanguage | null {
    const lower = text.toLowerCase();

    if (
      lower.includes('only english') ||
      lower.includes('english only') ||
      lower.includes('reply in english') ||
      lower.includes('speak english')
    ) {
      return 'english';
    }

    if (
      lower.includes('hinglish') ||
      lower.includes('hindi mein') ||
      lower.includes('speak hindi')
    ) {
      return 'hinglish';
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  private cleanWords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[?!.,;:'"()]/g, ''))
      .filter(Boolean);
  }
}

export default ToneMatcherService;