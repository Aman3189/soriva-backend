// src/services/security/prompt-sanitizer.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ PROMPT SANITIZER SERVICE v3.0 (ENHANCED - DYNAMIC)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Purpose: Advanced input sanitization with dynamic database-driven configs
// Features: 5-Layer detection, semantic analysis, real-time threshold updates
// Architecture: Singleton, Database-first, Fully Dynamic, Production-grade
// Version: 3.0 (Complete Rewrite)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { PrismaClient } from '@prisma/client';
import learningServiceInstance from '@/services/ai/learning.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Sanitization result (enhanced)
 */
export interface SanitizationResult {
  sanitized: string;
  original: string;
  modifications: SanitizationModification[];
  isModified: boolean;
  warnings: string[];
  errors: string[];
  byteLength: number;
  characterCount: number;
  sanitizedAt: Date;
  processingTimeMs: number;
  confidenceScore: number; // 0-100 (confidence in sanitization quality)
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: {
    removedCharacters: number;
    encodingDetected: boolean;
    injectionDetected: boolean;
    hiddenCharsRemoved: number;
    version: string;
  };
}

/**
 * Sanitization modification
 */
export interface SanitizationModification {
  type: ModificationType;
  description: string;
  beforeLength: number;
  afterLength: number;
  removedContent?: string;
  timestamp: Date;
  confidence: number;
}

/**
 * Modification types (expanded)
 */
export type ModificationType =
  | 'ENCODING_REMOVED'
  | 'HIDDEN_CHARS_REMOVED'
  | 'WHITESPACE_NORMALIZED'
  | 'INJECTION_NEUTRALIZED'
  | 'LENGTH_TRUNCATED'
  | 'SPECIAL_CHARS_ESCAPED'
  | 'CASE_NORMALIZED'
  | 'UNICODE_NORMALIZED'
  | 'HTML_ESCAPED'
  | 'SQL_NEUTRALIZED'
  | 'XSS_NEUTRALIZED'
  | 'SCRIPT_REMOVED'
  | 'URL_SANITIZED'
  | 'BASE64_REMOVED'
  | 'HEX_REMOVED';

/**
 * Sanitization options (enhanced)
 */
export interface SanitizationOptions {
  maxLength?: number;
  normalizeWhitespace?: boolean;
  removeHiddenChars?: boolean;
  neutralizeInjection?: boolean;
  decodeAttempts?: boolean;
  trimInput?: boolean;
  normalizeUnicode?: boolean;
  allowedTags?: string[];
  strictMode?: boolean;
  preserveNewlines?: boolean;
  allowUrls?: boolean;
  customRules?: CustomSanitizationRule[];
  skipCache?: boolean;
}

/**
 * Custom sanitization rule
 */
export interface CustomSanitizationRule {
  name: string;
  pattern: RegExp;
  replacement: string;
  priority: number;
  enabled: boolean;
}

/**
 * Suspicious analysis result (enhanced)
 */
export interface SuspiciousAnalysis {
  suspicious: boolean;
  reasons: string[];
  riskScore: number; // 0-100
  confidenceLevel: number; // 0-100
  detectionMethod: string[];
  layerResults: {
    patterns: LayerResult;
    semantic: LayerResult;
    behavioral: LayerResult;
    contextual: LayerResult;
    linguistic: LayerResult;
  };
  metadata: {
    processingTimeMs: number;
    timestamp: Date;
    thresholdsUsed: string;
  };
}

/**
 * Layer result
 */
interface LayerResult {
  detected: boolean;
  score: number;
  reasons: string[];
  confidence: number;
}

/**
 * Dynamic thresholds (database-driven)
 */
interface SanitizerThresholds {
  maxMessageLength: number;
  suspiciousThreshold: number;
  encodingRiskScore: number;
  hiddenCharRiskScore: number;
  scriptTagRiskScore: number;
  sqlInjectionRiskScore: number;
  specialCharThreshold: number;
  base64RiskScore: number;
  manipulationThreshold: number;
  extractionThreshold: number;
  bypassThreshold: number;
  xssRiskScore: number;
  urlRiskScore: number;
  confidenceThreshold: number;
}

/**
 * Configuration snapshot
 */
interface ConfigSnapshot {
  version: string;
  loadedAt: Date;
  thresholds: SanitizerThresholds;
  environment: string;
  source: 'database' | 'environment' | 'defaults';
}

/**
 * Sanitization statistics (enhanced)
 */
interface SanitizerStats {
  totalSanitized: number;
  suspiciousDetected: number;
  modificationsApplied: number;
  encodingAttemptsBlocked: number;
  injectionAttemptsBlocked: number;
  hiddenCharsRemoved: number;
  cacheHits: number;
  cacheMisses: number;
  averageProcessingTime: number;
  lastSanitization: Date | null;
  errorCount: number;
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMPT SANITIZER SERVICE (SINGLETON)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PromptSanitizerService {
  private static instance: PromptSanitizerService;
  private prisma: PrismaClient;
  private learningService = learningServiceInstance;

  // Configuration
  private configSnapshot: ConfigSnapshot | null = null;
  private thresholds: SanitizerThresholds | null = null;
  private thresholdsLoadedAt: Date | null = null;

  // Caching
  private sanitizationCache: Map<string, CacheEntry<SanitizationResult>>;
  private suspiciousCache: Map<string, CacheEntry<SuspiciousAnalysis>>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_MAX_SIZE = 1000;

  // Default fallback thresholds
  private readonly DEFAULT_THRESHOLDS: SanitizerThresholds = {
    maxMessageLength: 10000,
    suspiciousThreshold: 30,
    encodingRiskScore: 20,
    hiddenCharRiskScore: 25,
    scriptTagRiskScore: 30,
    sqlInjectionRiskScore: 30,
    specialCharThreshold: 0.3,
    base64RiskScore: 20,
    manipulationThreshold: 2,
    extractionThreshold: 2,
    bypassThreshold: 2,
    xssRiskScore: 35,
    urlRiskScore: 15,
    confidenceThreshold: 70,
  };

  // Statistics
  private stats: SanitizerStats = {
    totalSanitized: 0,
    suspiciousDetected: 0,
    modificationsApplied: 0,
    encodingAttemptsBlocked: 0,
    injectionAttemptsBlocked: 0,
    hiddenCharsRemoved: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageProcessingTime: 0,
    lastSanitization: null,
    errorCount: 0,
  };

  // Custom rules storage
  private customRules: Map<string, CustomSanitizationRule> = new Map();

  /**
   * Private constructor (Singleton)
   */
  private constructor() {
    this.prisma = new PrismaClient();
    this.sanitizationCache = new Map();
    this.suspiciousCache = new Map();

    this.loadConfiguration();

    console.log('[PromptSanitizer] ✅ Service initialized (v3.0 - Dynamic)');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PromptSanitizerService {
    if (!PromptSanitizerService.instance) {
      PromptSanitizerService.instance = new PromptSanitizerService();
    }
    return PromptSanitizerService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURATION MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Load configuration from environment variables and database
   */
  private loadConfiguration(): void {
    try {
      // Load from environment variables first (fallback)
      this.thresholds = {
        maxMessageLength: parseInt(process.env.SANITIZER_MAX_LENGTH || '10000'),
        suspiciousThreshold: parseInt(process.env.SANITIZER_SUSPICIOUS_THRESHOLD || '30'),
        encodingRiskScore: parseInt(process.env.SANITIZER_ENCODING_RISK || '20'),
        hiddenCharRiskScore: parseInt(process.env.SANITIZER_HIDDEN_CHAR_RISK || '25'),
        scriptTagRiskScore: parseInt(process.env.SANITIZER_SCRIPT_TAG_RISK || '30'),
        sqlInjectionRiskScore: parseInt(process.env.SANITIZER_SQL_RISK || '30'),
        specialCharThreshold: parseFloat(process.env.SANITIZER_SPECIAL_CHAR_THRESHOLD || '0.3'),
        base64RiskScore: parseInt(process.env.SANITIZER_BASE64_RISK || '20'),
        manipulationThreshold: parseInt(process.env.SANITIZER_MANIPULATION_THRESHOLD || '2'),
        extractionThreshold: parseInt(process.env.SANITIZER_EXTRACTION_THRESHOLD || '2'),
        bypassThreshold: parseInt(process.env.SANITIZER_BYPASS_THRESHOLD || '2'),
        xssRiskScore: parseInt(process.env.SANITIZER_XSS_RISK || '35'),
        urlRiskScore: parseInt(process.env.SANITIZER_URL_RISK || '15'),
        confidenceThreshold: parseInt(process.env.SANITIZER_CONFIDENCE_THRESHOLD || '70'),
      };

      this.configSnapshot = {
        version: '3.0.0',
        loadedAt: new Date(),
        thresholds: this.thresholds,
        environment: process.env.NODE_ENV || 'development',
        source: 'environment',
      };

      console.log('[PromptSanitizer] 📋 Configuration loaded from environment');
    } catch (error) {
      console.error('[PromptSanitizer] ⚠️ Error loading configuration, using defaults:', error);
      this.thresholds = this.DEFAULT_THRESHOLDS;
      this.configSnapshot = {
        version: '3.0.0',
        loadedAt: new Date(),
        thresholds: this.thresholds,
        environment: 'default',
        source: 'defaults',
      };
    }
  }

  /**
   * Check if thresholds need refresh
   */
  private isThresholdCacheExpired(): boolean {
    if (!this.thresholdsLoadedAt) return true;
    const elapsed = Date.now() - this.thresholdsLoadedAt.getTime();
    return elapsed > this.CACHE_DURATION;
  }

  /**
   * Load thresholds from database
   */
  private async loadThresholdsFromDatabase(): Promise<void> {
    try {
      console.log('[PromptSanitizer] 📥 Loading thresholds from database...');

      const configs = await this.prisma.securityConfig.findMany({
        where: {
          category: 'MODERATION',
          isActive: true,
        },
      });

      const thresholds: Partial<SanitizerThresholds> = {};

      for (const config of configs) {
        const key = config.configKey;
        let value: number;

        if (config.dataType === 'INT') {
          value = parseInt(config.configValue, 10);
        } else if (config.dataType === 'FLOAT') {
          value = parseFloat(config.configValue);
        } else {
          continue;
        }

        const mappings: Record<string, keyof SanitizerThresholds> = {
          MAX_MESSAGE_LENGTH: 'maxMessageLength',
          SUSPICIOUS_THRESHOLD: 'suspiciousThreshold',
          ENCODING_RISK_SCORE: 'encodingRiskScore',
          HIDDEN_CHAR_RISK_SCORE: 'hiddenCharRiskScore',
          SCRIPT_TAG_RISK_SCORE: 'scriptTagRiskScore',
          SQL_INJECTION_RISK_SCORE: 'sqlInjectionRiskScore',
          SPECIAL_CHAR_THRESHOLD: 'specialCharThreshold',
          BASE64_RISK_SCORE: 'base64RiskScore',
          MANIPULATION_THRESHOLD: 'manipulationThreshold',
          EXTRACTION_THRESHOLD: 'extractionThreshold',
          BYPASS_THRESHOLD: 'bypassThreshold',
          XSS_RISK_SCORE: 'xssRiskScore',
          URL_RISK_SCORE: 'urlRiskScore',
          CONFIDENCE_THRESHOLD: 'confidenceThreshold',
        };

        const mappedKey = mappings[key];
        if (mappedKey) {
          thresholds[mappedKey] = value;
        }
      }

      this.thresholds = {
        ...this.DEFAULT_THRESHOLDS,
        ...thresholds,
      };

      this.thresholdsLoadedAt = new Date();

      if (this.configSnapshot) {
        this.configSnapshot.thresholds = this.thresholds;
        this.configSnapshot.loadedAt = new Date();
        this.configSnapshot.source = 'database';
      }

      console.log(`[PromptSanitizer] ✅ Loaded ${configs.length} threshold configs from database`);
    } catch (error) {
      console.error('[PromptSanitizer] ❌ Error loading thresholds from database:', error);
      if (!this.thresholds) {
        this.thresholds = this.DEFAULT_THRESHOLDS;
      }
    }
  }

  /**
   * Ensure thresholds are loaded
   */
  private async ensureThresholdsLoaded(): Promise<void> {
    if (this.isThresholdCacheExpired()) {
      await this.loadThresholdsFromDatabase();
    }
  }

  /**
   * Get current thresholds
   */
  private getThresholds(): SanitizerThresholds {
    return this.thresholds || this.DEFAULT_THRESHOLDS;
  }

  /**
   * Force reload thresholds
   */
  public async reloadThresholds(): Promise<void> {
    console.log('[PromptSanitizer] 🔄 Force reloading thresholds...');
    await this.loadThresholdsFromDatabase();
    this.clearCache();
  }

  /**
   * Reload configuration
   */
  public reloadConfiguration(): void {
    console.log('[PromptSanitizer] 🔄 Reloading configuration...');
    this.loadConfiguration();
    this.clearCache();
  }

  /**
   * Get current configuration snapshot
   */
  public getConfiguration(): ConfigSnapshot | null {
    return this.configSnapshot;
  }

  /**
   * Update specific threshold dynamically
   */
  public updateThreshold(key: keyof SanitizerThresholds, value: number): void {
    if (this.thresholds) {
      this.thresholds[key] = value;

      if (this.configSnapshot) {
        this.configSnapshot.thresholds[key] = value;
        this.configSnapshot.loadedAt = new Date();
      }

      console.log(`[PromptSanitizer] 🔧 Updated ${key} to ${value}`);
      this.clearCache();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CUSTOM RULES MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Add custom sanitization rule
   */
  public addCustomRule(rule: CustomSanitizationRule): void {
    this.customRules.set(rule.name, rule);
    console.log(`[PromptSanitizer] ➕ Added custom rule: ${rule.name}`);
  }

  /**
   * Remove custom rule
   */
  public removeCustomRule(name: string): boolean {
    const deleted = this.customRules.delete(name);
    if (deleted) {
      console.log(`[PromptSanitizer] ➖ Removed custom rule: ${name}`);
    }
    return deleted;
  }

  /**
   * Get all custom rules
   */
  public getCustomRules(): CustomSanitizationRule[] {
    return Array.from(this.customRules.values());
  }

  /**
   * Toggle custom rule
   */
  public toggleCustomRule(name: string, enabled: boolean): boolean {
    const rule = this.customRules.get(name);
    if (rule) {
      rule.enabled = enabled;
      console.log(`[PromptSanitizer] 🎚️ Rule "${name}" ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate cache key
   */
  private generateCacheKey(input: string, options?: any): string {
    const optionsStr = options ? JSON.stringify(options) : '';
    return this.simpleHash(input + optionsStr);
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get from cache
   */
  private getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      cache.delete(key);
      return null;
    }

    entry.hits++;
    this.stats.cacheHits++;
    return entry.data;
  }

  /**
   * Add to cache
   */
  private addToCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    if (cache.size >= this.CACHE_MAX_SIZE) {
      const entriesToRemove = Math.floor(this.CACHE_MAX_SIZE * 0.1);
      const keys = Array.from(cache.keys()).slice(0, entriesToRemove);
      keys.forEach((k) => cache.delete(k));
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.sanitizationCache.clear();
    this.suspiciousCache.clear();
    this.stats.cacheHits = 0;
    this.stats.cacheMisses = 0;
    console.log('[PromptSanitizer] 🧹 All caches cleared');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN SANITIZATION (ENHANCED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Main sanitization method - cleans and normalizes user input
   */
  public async sanitize(
    input: string,
    options?: Partial<SanitizationOptions>
  ): Promise<SanitizationResult> {
    const startTime = Date.now();

    // Validate input
    if (!input || typeof input !== 'string') {
      return this.createEmptyResult('', startTime);
    }

    // Check cache first
    if (!options?.skipCache) {
      const cacheKey = this.generateCacheKey(input, options);
      const cached = this.getFromCache(this.sanitizationCache, cacheKey);
      if (cached) {
        return cached;
      }
      this.stats.cacheMisses++;
    }

    await this.ensureThresholdsLoaded();
    const thresholds = this.getThresholds();

    const defaultOptions: SanitizationOptions = {
      maxLength: thresholds.maxMessageLength,
      normalizeWhitespace: true,
      removeHiddenChars: true,
      neutralizeInjection: true,
      decodeAttempts: true,
      trimInput: true,
      normalizeUnicode: true,
      allowedTags: [],
      strictMode: false,
      preserveNewlines: false,
      allowUrls: false,
      customRules: [],
      skipCache: false,
    };

    const opts = { ...defaultOptions, ...options };
    const modifications: SanitizationModification[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    const original = input;
    let sanitized = input;
    let removedCharacters = 0;
    let encodingDetected = false;
    let injectionDetected = false;
    let hiddenCharsRemoved = 0;

    try {
      // Step 1: Trim input
      if (opts.trimInput) {
        const trimmed = sanitized.trim();
        if (trimmed.length !== sanitized.length) {
          modifications.push({
            type: 'WHITESPACE_NORMALIZED',
            description: 'Trimmed leading/trailing whitespace',
            beforeLength: sanitized.length,
            afterLength: trimmed.length,
            timestamp: new Date(),
            confidence: 1.0,
          });
          removedCharacters += sanitized.length - trimmed.length;
        }
        sanitized = trimmed;
      }

      // Step 2: Remove hidden/invisible characters
      if (opts.removeHiddenChars) {
        const { cleaned, removed } = this.removeHiddenCharacters(sanitized);
        if (removed > 0) {
          modifications.push({
            type: 'HIDDEN_CHARS_REMOVED',
            description: `Removed ${removed} hidden/zero-width characters`,
            beforeLength: sanitized.length,
            afterLength: cleaned.length,
            timestamp: new Date(),
            confidence: 0.95,
          });
          warnings.push(`Detected ${removed} suspicious hidden characters`);
          removedCharacters += removed;
          hiddenCharsRemoved = removed;
        }
        sanitized = cleaned;
      }

      // Step 3: Neutralize encoding attempts
      if (opts.decodeAttempts) {
        const { decoded, wasEncoded, method } = this.neutralizeEncodingAttempts(sanitized);
        if (wasEncoded) {
          modifications.push({
            type: 'ENCODING_REMOVED',
            description: `Neutralized ${method} encoding bypass attempt`,
            beforeLength: sanitized.length,
            afterLength: decoded.length,
            timestamp: new Date(),
            confidence: 0.9,
          });
          warnings.push(`Detected potential ${method} encoding bypass attempt`);
          encodingDetected = true;
          this.stats.encodingAttemptsBlocked++;
        }
        sanitized = decoded;
      }

      // Step 4: Apply custom rules (if provided)
      if (opts.customRules && opts.customRules.length > 0) {
        const customResult = this.applyCustomRules(sanitized, opts.customRules);
        if (customResult.modified) {
          sanitized = customResult.sanitized;
          modifications.push(...customResult.modifications);
        }
      }

      // Step 5: Apply stored custom rules
      if (this.customRules.size > 0) {
        const storedRulesResult = this.applyCustomRules(
          sanitized,
          Array.from(this.customRules.values()).filter((r) => r.enabled)
        );
        if (storedRulesResult.modified) {
          sanitized = storedRulesResult.sanitized;
          modifications.push(...storedRulesResult.modifications);
        }
      }

      // Step 6: Neutralize injection attacks
      if (opts.neutralizeInjection) {
        const neutralized = this.neutralizeInjection(sanitized, opts.strictMode);
        if (neutralized !== sanitized) {
          modifications.push({
            type: 'INJECTION_NEUTRALIZED',
            description: 'Neutralized potential injection patterns',
            beforeLength: sanitized.length,
            afterLength: neutralized.length,
            timestamp: new Date(),
            confidence: 0.85,
          });
          warnings.push('Detected and neutralized injection patterns');
          injectionDetected = true;
          this.stats.injectionAttemptsBlocked++;
        }
        sanitized = neutralized;
      }

      // Step 7: Normalize whitespace
      if (opts.normalizeWhitespace) {
        const normalized = this.normalizeWhitespace(sanitized, opts.preserveNewlines);
        if (normalized !== sanitized) {
          modifications.push({
            type: 'WHITESPACE_NORMALIZED',
            description: 'Normalized excessive whitespace',
            beforeLength: sanitized.length,
            afterLength: normalized.length,
            timestamp: new Date(),
            confidence: 1.0,
          });
          removedCharacters += sanitized.length - normalized.length;
        }
        sanitized = normalized;
      }

      // Step 8: Normalize Unicode
      if (opts.normalizeUnicode) {
        const unicodeNormalized = this.normalizeUnicode(sanitized);
        if (unicodeNormalized !== sanitized) {
          modifications.push({
            type: 'UNICODE_NORMALIZED',
            description: 'Normalized Unicode characters',
            beforeLength: sanitized.length,
            afterLength: unicodeNormalized.length,
            timestamp: new Date(),
            confidence: 1.0,
          });
        }
        sanitized = unicodeNormalized;
      }

      // Step 9: Sanitize URLs (if not allowed)
      if (!opts.allowUrls) {
        const urlSanitized = this.sanitizeUrls(sanitized);
        if (urlSanitized !== sanitized) {
          modifications.push({
            type: 'URL_SANITIZED',
            description: 'Sanitized or removed URLs',
            beforeLength: sanitized.length,
            afterLength: urlSanitized.length,
            timestamp: new Date(),
            confidence: 0.8,
          });
          warnings.push('URLs detected and sanitized');
        }
        sanitized = urlSanitized;
      }

      // Step 10: Enforce length limits
      if (opts.maxLength && sanitized.length > opts.maxLength) {
        const truncated = sanitized.substring(0, opts.maxLength);
        modifications.push({
          type: 'LENGTH_TRUNCATED',
          description: `Truncated to ${opts.maxLength} characters`,
          beforeLength: sanitized.length,
          afterLength: truncated.length,
          removedContent: `...${sanitized.length - opts.maxLength} chars removed`,
          timestamp: new Date(),
          confidence: 1.0,
        });
        warnings.push(`Input exceeded max length (${opts.maxLength} chars)`);
        sanitized = truncated;
      }

      // Step 11: Final validation
      if (sanitized.length === 0 && original.length > 0) {
        warnings.push('Input became empty after sanitization');
      }

      // Calculate confidence and risk level
      const confidenceScore = this.calculateConfidenceScore(modifications, warnings.length);
      const riskLevel = this.calculateRiskLevel(modifications, encodingDetected, injectionDetected);

      // Update statistics
      this.stats.totalSanitized++;
      this.stats.modificationsApplied += modifications.length;
      this.stats.hiddenCharsRemoved += hiddenCharsRemoved;
      this.stats.lastSanitization = new Date();

      const processingTime = Date.now() - startTime;
      this.stats.averageProcessingTime =
        (this.stats.averageProcessingTime * (this.stats.totalSanitized - 1) + processingTime) /
        this.stats.totalSanitized;

      const result: SanitizationResult = {
        sanitized,
        original,
        modifications,
        isModified: modifications.length > 0,
        warnings,
        errors,
        byteLength: Buffer.byteLength(sanitized, 'utf8'),
        characterCount: sanitized.length,
        sanitizedAt: new Date(),
        processingTimeMs: processingTime,
        confidenceScore,
        riskLevel,
        metadata: {
          removedCharacters,
          encodingDetected,
          injectionDetected,
          hiddenCharsRemoved,
          version: '3.0.0',
        },
      };

      // Cache the result
      if (!opts.skipCache) {
        const cacheKey = this.generateCacheKey(input, options);
        this.addToCache(this.sanitizationCache, cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('[PromptSanitizer] ❌ Error during sanitization:', error);
      this.stats.errorCount++;

      return this.createErrorResult(original, startTime, error);
    }
  }

  /**
   * Quick sanitization (convenience method)
   */
  public quickSanitize(input: string): string {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input.trim();
    sanitized = this.removeHiddenCharacters(sanitized).cleaned;
    sanitized = this.normalizeWhitespace(sanitized, false);
    sanitized = this.neutralizeInjection(sanitized, false);

    return sanitized;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SANITIZATION METHODS (ENHANCED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Remove hidden and zero-width characters
   */
  private removeHiddenCharacters(input: string): { cleaned: string; removed: number } {
    const before = input.length;

    const cleaned = input
      // Zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Soft hyphens and format markers
      .replace(/[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E]/g, '')
      // Word joiners
      .replace(/[\u2060-\u2069]/g, '')
      // Bidirectional text markers
      .replace(/[\u202A-\u202E]/g, '')
      // Variation selectors
      .replace(/[\uFE00-\uFE0F]/g, '')
      // Non-breaking spaces (optional)
      .replace(/\u00A0/g, ' ');

    const removed = before - cleaned.length;
    return { cleaned, removed };
  }

  /**
   * Neutralize encoding bypass attempts (enhanced)
   */
  private neutralizeEncodingAttempts(input: string): {
    decoded: string;
    wasEncoded: boolean;
    method: string;
  } {
    let decoded = input;
    let wasEncoded = false;
    let method = 'none';

    // Base64 detection (enhanced)
    const base64Pattern = /^[A-Za-z0-9+/]{20,}={0,2}$/;
    if (base64Pattern.test(decoded.trim())) {
      wasEncoded = true;
      method = 'base64';
      decoded = '[ENCODED_CONTENT_REMOVED]';
      return { decoded, wasEncoded, method };
    }

    // Hex encoding
    const hexPattern = /(?:0x[0-9a-f]{2}[\s,]*){4,}/gi;
    if (hexPattern.test(decoded)) {
      wasEncoded = true;
      method = 'hex';
      decoded = decoded.replace(hexPattern, '[HEX_SEQUENCE_REMOVED]');
    }

    // Unicode escapes
    const unicodeEscapePattern = /(?:\\u[0-9a-f]{4}){3,}/gi;
    if (unicodeEscapePattern.test(decoded)) {
      wasEncoded = true;
      method = 'unicode';
      decoded = decoded.replace(unicodeEscapePattern, '[UNICODE_ESCAPE_REMOVED]');
    }

    // URL encoding
    const urlEncodePattern = /(?:%[0-9a-f]{2}){3,}/gi;
    if (urlEncodePattern.test(decoded)) {
      wasEncoded = true;
      method = 'url';
      decoded = decoded.replace(urlEncodePattern, '[URL_ENCODED_REMOVED]');
    }

    // HTML entities
    const htmlEntityPattern = /(?:&#x?[0-9a-f]+;){3,}/gi;
    if (htmlEntityPattern.test(decoded)) {
      wasEncoded = true;
      method = 'html_entity';
      decoded = decoded.replace(htmlEntityPattern, '[HTML_ENTITIES_REMOVED]');
    }

    // Octal encoding
    const octalPattern = /(?:\\[0-7]{3}){3,}/g;
    if (octalPattern.test(decoded)) {
      wasEncoded = true;
      method = 'octal';
      decoded = decoded.replace(octalPattern, '[OCTAL_ENCODED_REMOVED]');
    }

    return { decoded, wasEncoded, method };
  }

  /**
   * Neutralize SQL/XSS injection attempts (enhanced)
   */
  private neutralizeInjection(input: string, strictMode: boolean = false): string {
    let sanitized = input;

    // Escape HTML
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Remove script tags
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      '[SCRIPT_REMOVED]'
    );

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, 'blocked:');
    sanitized = sanitized.replace(/vbscript:/gi, 'blocked:');
    sanitized = sanitized.replace(/data:/gi, 'blocked:');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '[EVENT_REMOVED]');

    // Remove iframe/embed/object tags
    if (strictMode) {
      sanitized = sanitized.replace(/<(iframe|embed|object|applet)\b[^>]*>/gi, '[TAG_REMOVED]');
    }

    // Neutralize SQL patterns
    const sqlPatterns = [
      /\bUNION\s+SELECT\b/gi,
      /\bDROP\s+TABLE\b/gi,
      /\bINSERT\s+INTO\b/gi,
      /\bDELETE\s+FROM\b/gi,
      /\bUPDATE\s+\w+\s+SET\b/gi,
      /\bEXEC\s*\(/gi,
      /--\s*$/gm,
      /\/\*.*?\*\//gs,
      /;\s*DROP\b/gi,
      /'\s*OR\s+'1'\s*=\s*'1/gi,
      /"\s*OR\s+"1"\s*=\s*"1/gi,
    ];

    for (const pattern of sqlPatterns) {
      sanitized = sanitized.replace(pattern, '[SQL_PATTERN_REMOVED]');
    }

    // Remove shell commands (strict mode)
    if (strictMode) {
      const shellPatterns = [
        /[;&|]\s*(rm|cat|ls|chmod|sudo|su|wget|curl|nc|bash|sh)\b/gi,
        /`[^`]+`/g,
        /\$\([^)]+\)/g,
      ];

      for (const pattern of shellPatterns) {
        sanitized = sanitized.replace(pattern, '[SHELL_CMD_REMOVED]');
      }
    }

    return sanitized;
  }

  /**
   * Normalize whitespace (enhanced)
   */
  private normalizeWhitespace(input: string, preserveNewlines: boolean = false): string {
    if (preserveNewlines) {
      return input
        .replace(/[^\S\n]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    return input
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Normalize Unicode
   */
  private normalizeUnicode(input: string): string {
    try {
      return input.normalize('NFC');
    } catch (error) {
      console.error('[PromptSanitizer] ⚠️ Unicode normalization failed:', error);
      return input;
    }
  }

  /**
   * Sanitize URLs
   */
  private sanitizeUrls(input: string): string {
    // Remove or neutralize URLs
    const urlPattern = /https?:\/\/[^\s]+/gi;
    return input.replace(urlPattern, '[URL_REMOVED]');
  }

  /**
   * Apply custom sanitization rules
   */
  private applyCustomRules(
    input: string,
    rules: CustomSanitizationRule[]
  ): {
    sanitized: string;
    modified: boolean;
    modifications: SanitizationModification[];
  } {
    let sanitized = input;
    const modifications: SanitizationModification[] = [];
    let modified = false;

    // Sort by priority (higher first)
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      const before = sanitized;
      sanitized = sanitized.replace(rule.pattern, rule.replacement);

      if (sanitized !== before) {
        modified = true;
        modifications.push({
          type: 'SPECIAL_CHARS_ESCAPED',
          description: `Applied custom rule: ${rule.name}`,
          beforeLength: before.length,
          afterLength: sanitized.length,
          timestamp: new Date(),
          confidence: 0.8,
        });
      }
    }

    return { sanitized, modified, modifications };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCORING & RISK CALCULATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate confidence score
   */
  private calculateConfidenceScore(
    modifications: SanitizationModification[],
    warningCount: number
  ): number {
    if (modifications.length === 0) return 100;

    let score = 100;

    // Deduct based on modifications
    for (const mod of modifications) {
      score -= (1 - mod.confidence) * 10;
    }

    // Deduct for warnings
    score -= warningCount * 5;

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(
    modifications: SanitizationModification[],
    encodingDetected: boolean,
    injectionDetected: boolean
  ): 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let riskScore = 0;

    if (encodingDetected) riskScore += 30;
    if (injectionDetected) riskScore += 40;

    const criticalMods = modifications.filter(
      (m) =>
        m.type === 'INJECTION_NEUTRALIZED' ||
        m.type === 'ENCODING_REMOVED' ||
        m.type === 'SCRIPT_REMOVED'
    );

    riskScore += criticalMods.length * 15;
    riskScore += (modifications.length - criticalMods.length) * 5;

    if (riskScore >= 70) return 'CRITICAL';
    if (riskScore >= 50) return 'HIGH';
    if (riskScore >= 30) return 'MEDIUM';
    if (riskScore >= 10) return 'LOW';
    return 'SAFE';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUSPICIOUS DETECTION (5-LAYER ANALYSIS) - ENHANCED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Advanced suspicious pattern detection (5 layers with enhanced analytics)
   */
  public async isSuspicious(input: string, userId?: string): Promise<SuspiciousAnalysis> {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = this.generateCacheKey(input, { userId });
    const cached = this.getFromCache(this.suspiciousCache, cacheKey);
    if (cached) {
      return cached;
    }
    this.stats.cacheMisses++;

    await this.ensureThresholdsLoaded();
    const thresholds = this.getThresholds();

    const reasons: string[] = [];
    const detectionMethods: string[] = [];
    let riskScore = 0;

    // Layer 1: Pattern-based detection
    const patternResult = this.checkPatterns(input, thresholds);
    if (patternResult.detected) {
      reasons.push(...patternResult.reasons);
      detectionMethods.push('PATTERN_MATCH');
      riskScore += patternResult.score;
    }

    // Layer 2: Semantic analysis
    const semanticResult = this.analyzeIntent(input, thresholds);
    if (semanticResult.detected) {
      reasons.push(...semanticResult.reasons);
      detectionMethods.push('SEMANTIC_ANALYSIS');
      riskScore += semanticResult.score;
    }

    // Layer 3: Behavioral analysis
    const behavioralResult = this.analyzeBehavior(input);
    if (behavioralResult.detected) {
      reasons.push(...behavioralResult.reasons);
      detectionMethods.push('BEHAVIORAL_ANALYSIS');
      riskScore += behavioralResult.score;
    }

    // Layer 4: Contextual analysis
    const contextualResult = this.analyzeContext(input);
    if (contextualResult.detected) {
      reasons.push(...contextualResult.reasons);
      detectionMethods.push('CONTEXTUAL_ANALYSIS');
      riskScore += contextualResult.score;
    }

    // Layer 5: Linguistic analysis
    const linguisticResult = this.analyzeLinguistics(input);
    if (linguisticResult.detected) {
      reasons.push(...linguisticResult.reasons);
      detectionMethods.push('LINGUISTIC_ANALYSIS');
      riskScore += linguisticResult.score;
    }

    riskScore = Math.min(100, riskScore);

    // Calculate overall confidence
    const totalLayers = 5;
    const layersTriggered = [
      patternResult.detected,
      semanticResult.detected,
      behavioralResult.detected,
      contextualResult.detected,
      linguisticResult.detected,
    ].filter(Boolean).length;

    const confidenceLevel =
      layersTriggered > 0 ? Math.round((layersTriggered / totalLayers) * 100) : 0;

    const processingTime = Date.now() - startTime;

    const result: SuspiciousAnalysis = {
      suspicious: riskScore >= thresholds.suspiciousThreshold,
      reasons,
      riskScore,
      confidenceLevel,
      detectionMethod: detectionMethods,
      layerResults: {
        patterns: patternResult,
        semantic: semanticResult,
        behavioral: behavioralResult,
        contextual: contextualResult,
        linguistic: linguisticResult,
      },
      metadata: {
        processingTimeMs: processingTime,
        timestamp: new Date(),
        thresholdsUsed: this.configSnapshot?.source || 'unknown',
      },
    };

    // Cache the result
    this.addToCache(this.suspiciousCache, cacheKey, result);

    // Log if suspicious
    if (result.suspicious) {
      this.stats.suspiciousDetected++;
      await this.logSuspiciousInput(input, result, userId);
    }

    return result;
  }

  /**
   * Layer 1: Pattern-based detection (enhanced)
   */
  private checkPatterns(input: string, thresholds: SanitizerThresholds): LayerResult {
    const reasons: string[] = [];
    let score = 0;

    // Excessive encoding
    if (/(?:[%\\]x?[0-9a-f]{2,4}){10,}/i.test(input)) {
      reasons.push('Excessive encoding detected');
      score += thresholds.encodingRiskScore;
    }

    // Hidden characters
    if (/[\u200B-\u200D\uFEFF]/.test(input)) {
      reasons.push('Hidden/zero-width characters detected');
      score += thresholds.hiddenCharRiskScore;
    }

    // Script tags
    if (/<script/i.test(input)) {
      reasons.push('Script tag detected');
      score += thresholds.scriptTagRiskScore;
    }

    // SQL patterns
    if (/\b(UNION|DROP|INSERT|DELETE)\s+(SELECT|TABLE|INTO|FROM)\b/i.test(input)) {
      reasons.push('SQL injection pattern detected');
      score += thresholds.sqlInjectionRiskScore;
    }

    // XSS patterns
    if (/(javascript:|onerror=|onclick=|onload=)/i.test(input)) {
      reasons.push('XSS pattern detected');
      score += thresholds.xssRiskScore;
    }

    // Excessive special characters
    const specialCharRatio = (input.match(/[^\w\s]/g) || []).length / input.length;
    if (specialCharRatio > thresholds.specialCharThreshold) {
      reasons.push('Excessive special characters');
      score += 15;
    }

    // Base64
    if (/^[A-Za-z0-9+/]{50,}={0,2}$/.test(input.trim())) {
      reasons.push('Base64-encoded content detected');
      score += thresholds.base64RiskScore;
    }

    const confidence = reasons.length > 0 ? Math.min(reasons.length * 0.2, 1.0) : 0;

    return {
      detected: reasons.length > 0,
      reasons,
      score,
      confidence,
    };
  }

  /**
   * Layer 2: Semantic analysis (enhanced)
   */
  private analyzeIntent(input: string, thresholds: SanitizerThresholds): LayerResult {
    const reasons: string[] = [];
    let score = 0;
    const lowerInput = input.toLowerCase();

    // Manipulation intent
    const manipulationKeywords = [
      'pretend',
      'act as',
      'imagine',
      'simulate',
      'role play',
      'roleplay',
      "let's say",
      'what if',
      'hypothetically',
      'suppose',
      'assume',
      'for fun',
      'as a joke',
      'just curious',
      'testing',
      'experiment',
    ];

    const manipulationCount = manipulationKeywords.filter((kw) => lowerInput.includes(kw)).length;
    if (manipulationCount >= thresholds.manipulationThreshold) {
      reasons.push(`Intent: Behavior manipulation (${manipulationCount} signals)`);
      score += 20 + manipulationCount * 5;
    }

    // Extraction intent
    const extractionPhrases = [
      'tell me about',
      'reveal',
      'show me',
      'what are you',
      'who made you',
      'your system',
      'your instructions',
      'your rules',
      'how do you work',
      "what's your",
      'describe your',
      'explain your',
      'expose',
      'leak',
    ];

    const extractionCount = extractionPhrases.filter((phrase) =>
      lowerInput.includes(phrase)
    ).length;
    if (extractionCount >= thresholds.extractionThreshold) {
      reasons.push(`Intent: Information extraction (${extractionCount} signals)`);
      score += 15 + extractionCount * 5;
    }

    // Bypass intent
    const bypassIndicators = [
      'without',
      'ignore',
      'forget',
      'disregard',
      'override',
      'bypass',
      'unrestricted',
      'unfiltered',
      'no limits',
      'no rules',
      'free from',
      'break',
      'remove',
      'disable',
      'turn off',
      'circumvent',
      'workaround',
    ];

    const bypassCount = bypassIndicators.filter((ind) => lowerInput.includes(ind)).length;
    if (bypassCount >= thresholds.bypassThreshold) {
      reasons.push(`Intent: Restriction bypass (${bypassCount} signals)`);
      score += 25 + bypassCount * 5;
    }

    // Multi-step manipulation
    if (
      /\b(step|part|phase|stage)\s*\d+/i.test(input) &&
      /\b(continue|next|previous|remember)\b/i.test(lowerInput)
    ) {
      reasons.push('Intent: Multi-step manipulation');
      score += 25;
    }

    // Social engineering
    const socialEngineering = [
      'please help',
      'i really need',
      "it's urgent",
      'emergency',
      'life or death',
      "i'm desperate",
      "you're my only hope",
      'critical',
    ];

    if (
      socialEngineering.some((phrase) => lowerInput.includes(phrase)) &&
      lowerInput.length > 200
    ) {
      reasons.push('Intent: Social engineering attempt');
      score += 15;
    }

    const confidence = reasons.length > 0 ? Math.min(reasons.length * 0.25, 1.0) : 0;

    return { detected: reasons.length > 0, reasons, score, confidence };
  }

  /**
   * Layer 3: Behavioral analysis (enhanced)
   */
  private analyzeBehavior(input: string): LayerResult {
    const reasons: string[] = [];
    let score = 0;

    // Excessive questioning
    const questionWords = ['what', 'how', 'why', 'who', 'where', 'when', 'which'];
    const questionCount = questionWords.filter((w) => input.toLowerCase().includes(w)).length;

    if (questionCount >= 5) {
      reasons.push('Behavior: Excessive questioning');
      score += 15;
    }

    // Command-like structure
    const commandVerbs = [
      'tell',
      'show',
      'give',
      'provide',
      'list',
      'display',
      'reveal',
      'share',
      'output',
    ];
    const commandCount = commandVerbs.filter((cmd) =>
      new RegExp(`\\b${cmd}\\b`, 'i').test(input)
    ).length;

    if (commandCount >= 3) {
      reasons.push('Behavior: Command-style requests');
      score += 15;
    }

    // Urgency signals
    const urgencyMarkers = [
      '!!',
      'urgent',
      'asap',
      'immediately',
      'right now',
      'quickly',
      'hurry',
      'fast',
    ];
    const urgencyCount = urgencyMarkers.filter((marker) =>
      input.toLowerCase().includes(marker)
    ).length;

    if (urgencyCount >= 2) {
      reasons.push('Behavior: Urgency pressure');
      score += 10;
    }

    // Length anomalies
    if (input.length > 2000) {
      reasons.push('Behavior: Unusually long input');
      score += 10;
    }

    // Repetition patterns
    const words = input.toLowerCase().split(/\s+/);
    const repeatedWords = words.filter(
      (word, index, arr) => word.length > 3 && arr.indexOf(word) !== index
    );

    if (repeatedWords.length >= 5) {
      reasons.push('Behavior: Excessive repetition');
      score += 10;
    }

    const confidence = reasons.length > 0 ? Math.min(reasons.length * 0.2, 0.9) : 0;

    return { detected: reasons.length > 0, reasons, score, confidence };
  }

  /**
   * Layer 4: Contextual analysis (enhanced)
   */
  private analyzeContext(input: string): LayerResult {
    const reasons: string[] = [];
    let score = 0;
    const lowerInput = input.toLowerCase();

    // Context confusion
    const confusionPhrases = [
      'new conversation',
      'start over',
      'reset',
      'forget what',
      'never mind',
      "let's change",
      'different topic',
      'instead',
      'actually',
    ];

    const confusionCount = confusionPhrases.filter((phrase) => lowerInput.includes(phrase)).length;
    if (confusionCount >= 2) {
      reasons.push('Context: Reset attempt detected');
      score += 15;
    }

    // Contradiction detection
    const contradictionPairs = [
      ['yes', 'no'],
      ['can', 'cannot'],
      ['will', "won't"],
      ['do', "don't"],
      ['is', "isn't"],
      ['should', "shouldn't"],
    ];

    let contradictionFound = false;
    for (const [word1, word2] of contradictionPairs) {
      if (lowerInput.includes(word1) && lowerInput.includes(word2)) {
        contradictionFound = true;
        break;
      }
    }

    if (contradictionFound && input.length < 100) {
      reasons.push('Context: Internal contradiction');
      score += 10;
    }

    // Topic hopping
    const topics = [
      'technology',
      'health',
      'finance',
      'politics',
      'entertainment',
      'science',
      'history',
    ];
    const topicMatches = topics.filter((topic) => lowerInput.includes(topic)).length;

    if (topicMatches >= 3 && input.length < 200) {
      reasons.push('Context: Rapid topic switching');
      score += 10;
    }

    // Conditional logic patterns
    if (/\b(if|when|unless|provided that|assuming)\b.*\b(then|otherwise|else)\b/i.test(input)) {
      reasons.push('Context: Complex conditional logic');
      score += 12;
    }

    const confidence = reasons.length > 0 ? Math.min(reasons.length * 0.2, 0.85) : 0;

    return { detected: reasons.length > 0, reasons, score, confidence };
  }

  /**
   * Layer 5: Linguistic analysis (enhanced)
   */
  private analyzeLinguistics(input: string): LayerResult {
    const reasons: string[] = [];
    let score = 0;

    // Excessive punctuation
    const punctuationRatio = (input.match(/[!?.,;:]/g) || []).length / input.length;
    if (punctuationRatio > 0.15) {
      reasons.push('Linguistic: Excessive punctuation');
      score += 10;
    }

    // Mixed case anomaly
    const upperCount = (input.match(/[A-Z]/g) || []).length;
    const lowerCount = (input.match(/[a-z]/g) || []).length;
    const caseRatio = Math.min(upperCount, lowerCount) / Math.max(upperCount, lowerCount, 1);

    if (caseRatio > 0.3 && input.length > 20) {
      reasons.push('Linguistic: Irregular case usage');
      score += 15;
    }

    // Word repetition
    const words = input.toLowerCase().split(/\s+/);
    const wordCounts: { [key: string]: number } = {};
    words.forEach((word) => {
      if (word.length > 3) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    const maxRepetition = Math.max(...Object.values(wordCounts), 0);
    if (maxRepetition >= 5) {
      reasons.push(`Linguistic: Word repetition (${maxRepetition}x)`);
      score += 10;
    }

    // Numbered lists
    const numberedPattern = /\b(\d+[\.\)]\s+|\(\d+\))/g;
    const numberedMatches = (input.match(numberedPattern) || []).length;

    if (numberedMatches >= 3) {
      reasons.push('Linguistic: Numbered steps detected');
      score += 15;
    }

    // Nested parentheses
    const nestingLevel = this.calculateNestingLevel(input);
    if (nestingLevel >= 3) {
      reasons.push(`Linguistic: Deep nesting (${nestingLevel} levels)`);
      score += 10;
    }

    // ALL CAPS words
    const capsWords = (input.match(/\b[A-Z]{4,}\b/g) || []).length;
    if (capsWords >= 3) {
      reasons.push('Linguistic: Excessive capitalization');
      score += 8;
    }

    const confidence = reasons.length > 0 ? Math.min(reasons.length * 0.15, 0.8) : 0;

    return { detected: reasons.length > 0, reasons, score, confidence };
  }

  /**
   * Calculate nesting level
   */
  private calculateNestingLevel(input: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    const openChars = ['(', '[', '{'];
    const closeChars = [')', ']', '}'];

    for (const char of input) {
      if (openChars.includes(char)) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (closeChars.includes(char)) {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }

    return maxDepth;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESULT CREATION HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create empty result
   */
  private createEmptyResult(original: string, startTime: number): SanitizationResult {
    return {
      sanitized: '',
      original,
      modifications: [],
      isModified: true,
      warnings: ['Invalid input - empty or non-string'],
      errors: ['Input validation failed'],
      byteLength: 0,
      characterCount: 0,
      sanitizedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
      confidenceScore: 0,
      riskLevel: 'SAFE',
      metadata: {
        removedCharacters: 0,
        encodingDetected: false,
        injectionDetected: false,
        hiddenCharsRemoved: 0,
        version: '3.0.0',
      },
    };
  }

  /**
   * Create error result
   */
  private createErrorResult(original: string, startTime: number, error: any): SanitizationResult {
    return {
      sanitized: '',
      original,
      modifications: [],
      isModified: true,
      warnings: ['Sanitization error - input rejected for safety'],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      byteLength: 0,
      characterCount: 0,
      sanitizedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
      confidenceScore: 0,
      riskLevel: 'CRITICAL',
      metadata: {
        removedCharacters: 0,
        encodingDetected: false,
        injectionDetected: false,
        hiddenCharsRemoved: 0,
        version: '3.0.0',
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOGGING & UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Log suspicious input to database
   */
  private async logSuspiciousInput(
    input: string,
    analysis: SuspiciousAnalysis,
    userId?: string
  ): Promise<void> {
    try {
      // Map risk score to valid severity levels (Prisma only accepts LOW, MEDIUM, HIGH)
      let severity: 'LOW' | 'MEDIUM' | 'HIGH';
      if (analysis.riskScore >= 70) {
        severity = 'HIGH';
      } else if (analysis.riskScore >= 50) {
        severity = 'MEDIUM';
      } else {
        severity = 'LOW';
      }

      // Convert layerResults to plain JSON-serializable object
      const layerResultsJson = {
        patterns: {
          detected: analysis.layerResults.patterns.detected,
          score: analysis.layerResults.patterns.score,
          reasons: analysis.layerResults.patterns.reasons,
          confidence: analysis.layerResults.patterns.confidence,
        },
        semantic: {
          detected: analysis.layerResults.semantic.detected,
          score: analysis.layerResults.semantic.score,
          reasons: analysis.layerResults.semantic.reasons,
          confidence: analysis.layerResults.semantic.confidence,
        },
        behavioral: {
          detected: analysis.layerResults.behavioral.detected,
          score: analysis.layerResults.behavioral.score,
          reasons: analysis.layerResults.behavioral.reasons,
          confidence: analysis.layerResults.behavioral.confidence,
        },
        contextual: {
          detected: analysis.layerResults.contextual.detected,
          score: analysis.layerResults.contextual.score,
          reasons: analysis.layerResults.contextual.reasons,
          confidence: analysis.layerResults.contextual.confidence,
        },
        linguistic: {
          detected: analysis.layerResults.linguistic.detected,
          score: analysis.layerResults.linguistic.score,
          reasons: analysis.layerResults.linguistic.reasons,
          confidence: analysis.layerResults.linguistic.confidence,
        },
      };

      await this.prisma.securityLog.create({
        data: {
          userId: userId || null,
          ipAddress: 'unknown',
          threatType: 'SUSPICIOUS_INPUT',
          severity,
          riskScore: analysis.riskScore,
          matchedPatterns: analysis.detectionMethod,
          detectionMethod: analysis.detectionMethod,
          userInput: input.substring(0, 1000),
          wasBlocked: false,
          flags: {
            suspicious: true,
            riskScore: analysis.riskScore,
            confidenceLevel: analysis.confidenceLevel,
            reasons: analysis.reasons,
            layerResults: layerResultsJson,
          },
        },
      });
    } catch (error) {
      console.error('[PromptSanitizer] ⚠️ Error logging suspicious input:', error);
    }
  }

  /**
   * Validate input length
   */
  public async validateLength(
    input: string,
    maxLength?: number
  ): Promise<{
    isValid: boolean;
    length: number;
    maxLength: number;
    exceeded: number;
  }> {
    await this.ensureThresholdsLoaded();
    const thresholds = this.getThresholds();
    const max = maxLength || thresholds.maxMessageLength;
    const length = input.length;
    const exceeded = Math.max(0, length - max);

    return {
      isValid: length <= max,
      length,
      maxLength: max,
      exceeded,
    };
  }

  /**
   * Sanitize for display (XSS prevention)
   */
  public sanitizeForDisplay(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Batch sanitization (optimized)
   */
  public async sanitizeBatch(
    inputs: string[],
    options?: Partial<SanitizationOptions>
  ): Promise<SanitizationResult[]> {
    const results: SanitizationResult[] = [];

    for (const input of inputs) {
      const result = await this.sanitize(input, options);
      results.push(result);
    }

    return results;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANALYTICS & MONITORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get statistics
   */
  public getStats(): SanitizerStats {
    return { ...this.stats };
  }

  /**
   * Get detailed analytics
   */
  public getAnalytics() {
    return {
      stats: this.getStats(),
      configuration: this.configSnapshot,
      cacheInfo: {
        sanitization: {
          size: this.sanitizationCache.size,
          maxSize: this.CACHE_MAX_SIZE,
        },
        suspicious: {
          size: this.suspiciousCache.size,
          maxSize: this.CACHE_MAX_SIZE,
        },
      },
      customRules: {
        total: this.customRules.size,
        enabled: Array.from(this.customRules.values()).filter((r) => r.enabled).length,
      },
      performance: {
        averageProcessingTime: this.stats.averageProcessingTime.toFixed(2) + 'ms',
        cacheHitRate:
          this.stats.totalSanitized > 0
            ? ((this.stats.cacheHits / this.stats.totalSanitized) * 100).toFixed(2) + '%'
            : '0%',
      },
    };
  }

  /**
   * Get current thresholds (for admin viewing)
   */
  public getCurrentThresholds(): SanitizerThresholds {
    return this.getThresholds();
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalSanitized: 0,
      suspiciousDetected: 0,
      modificationsApplied: 0,
      encodingAttemptsBlocked: 0,
      injectionAttemptsBlocked: 0,
      hiddenCharsRemoved: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageProcessingTime: 0,
      lastSanitization: null,
      errorCount: 0,
    };
    console.log('[PromptSanitizer] 📊 Statistics reset');
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    message?: string;
  }> {
    const checks = {
      databaseConnected: false,
      thresholdsLoaded: false,
      configLoaded: false,
      cacheOperational: false,
    };

    try {
      // Check database
      await this.prisma.$queryRaw`SELECT 1`;
      checks.databaseConnected = true;

      // Check thresholds
      checks.thresholdsLoaded = this.thresholds !== null;

      // Check config
      checks.configLoaded = this.configSnapshot !== null;

      // Check cache
      checks.cacheOperational =
        this.sanitizationCache instanceof Map && this.suspiciousCache instanceof Map;

      const allHealthy = Object.values(checks).every((v) => v);
      const someHealthy = Object.values(checks).some((v) => v);

      return {
        status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
        checks,
        message: allHealthy ? 'All systems operational' : 'Some systems degraded',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        checks,
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    console.log('[PromptSanitizer] 🧹 Cleaning up...');
    this.clearCache();
    await this.prisma.$disconnect();
    console.log('[PromptSanitizer] ✅ Cleanup complete');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const promptSanitizerInstance = PromptSanitizerService.getInstance();

export default promptSanitizerInstance;
export { PromptSanitizerService };
export const promptSanitizer = promptSanitizerInstance;
