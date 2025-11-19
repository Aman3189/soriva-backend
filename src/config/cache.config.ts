// src/config/cache.config.ts
import { CacheConfig } from '../types/cache.types';

/**
 * ==========================================
 * CACHE CONFIGURATION - SORIVA V2
 * ==========================================
 * In-memory caching configuration
 * Redis-ready architecture (upgrade path available)
 * 
 * Phase 3 - Step 1: Performance Optimization
 * Last Updated: November 19, 2025
 */

/**
 * Cache Configuration Manager - Class-based implementation
 */
class CacheConfigManager {
  private isDevelopment: boolean;
  private config: CacheConfig;

  constructor(isDevelopment: boolean = false) {
    this.isDevelopment = isDevelopment;
    this.config = this.initializeConfig();
  }

  /**
   * Initialize cache configuration based on environment
   */
  private initializeConfig(): CacheConfig {
    // Development: More aggressive caching for faster testing
    if (this.isDevelopment) {
      return {
        enabled: true,
        defaultTTL: 300, // 5 minutes (shorter for dev)
        maxSize: 500, // Smaller cache size
        checkPeriod: 60, // Check every minute
        enableStats: true, // Always track stats in dev
      };
    }

    // Production: Optimized for performance
    return {
      enabled: process.env.CACHE_ENABLED !== 'false', // Can disable via env
      defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'), // 1 hour default
      maxSize: parseInt(process.env.CACHE_MAX_SIZE || '5000'), // 5000 entries
      checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '300'), // 5 minutes
      enableStats: process.env.CACHE_ENABLE_STATS !== 'false',
    };
  }

  /**
   * Get cache configuration
   */
  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Check if cache is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get default TTL
   */
  public getDefaultTTL(): number {
    return this.config.defaultTTL;
  }

  /**
   * Get max cache size
   */
  public getMaxSize(): number {
    return this.config.maxSize;
  }

  /**
   * Update configuration (runtime)
   */
  public updateConfig(updates: Partial<CacheConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    console.log('📦 Cache configuration updated:', updates);
  }

  /**
   * Enable/disable cache
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`📦 Cache ${enabled ? 'enabled' : 'disabled'}`);
  }
}

/**
 * Predefined TTL values for different cache types
 */
export const CacheTTL = {
  // Very short cache (1-5 minutes)
  VERY_SHORT: 60,           // 1 minute
  SHORT: 300,               // 5 minutes

  // Medium cache (15-30 minutes)
  MEDIUM: 900,              // 15 minutes
  MEDIUM_LONG: 1800,        // 30 minutes

  // Long cache (1-6 hours)
  LONG: 3600,               // 1 hour
  VERY_LONG: 21600,         // 6 hours

  // Extra long cache (12-24 hours)
  EXTRA_LONG: 43200,        // 12 hours
  DAY: 86400,               // 24 hours

  // Week/Month (for rarely changing data)
  WEEK: 604800,             // 7 days
  MONTH: 2592000,           // 30 days
} as const;

/**
 * Cache key prefixes for different data types
 */
export const CachePrefix = {
  // User data
  USER: 'user:',
  USER_PROFILE: 'user:profile:',
  USER_SUBSCRIPTION: 'user:sub:',
  USER_USAGE: 'user:usage:',
  USER_SESSION: 'user:session:',

  // AI/Chat data
  CONVERSATION: 'conv:',
  AI_RESPONSE: 'ai:resp:',
  AI_CONFIG: 'ai:cfg:',
  AI_MODEL: 'ai:model:',

  // Document data
  DOCUMENT: 'doc:',
  DOCUMENT_META: 'doc:meta:',
  DOCUMENT_CONTENT: 'doc:content:',

  // Plan/Billing data
  PLAN: 'plan:',
  PLAN_CONFIG: 'plan:cfg:',
  PLAN_PRICING: 'plan:price:',
  BOOSTER: 'booster:',

  // Analytics
  ANALYTICS: 'analytics:',
  AUDIT: 'audit:',
  STATS: 'stats:',

  // System
  HEALTH: 'health:',
  CONFIG: 'config:',
  RATE_LIMIT: 'rate:',
} as const;

/**
 * Recommended TTL for different cache types
 */
export const RecommendedTTL = {
  // User data (changes moderately)
  userProfile: CacheTTL.MEDIUM,           // 15 min
  userSubscription: CacheTTL.LONG,        // 1 hour
  userUsage: CacheTTL.SHORT,              // 5 min

  // AI data (changes frequently)
  conversation: CacheTTL.MEDIUM,          // 15 min
  aiResponse: CacheTTL.SHORT,             // 5 min (for retries)
  aiConfig: CacheTTL.VERY_LONG,           // 6 hours

  // Document data (relatively static)
  documentMeta: CacheTTL.LONG,            // 1 hour
  documentContent: CacheTTL.VERY_LONG,    // 6 hours

  // Plan data (rarely changes)
  planConfig: CacheTTL.DAY,               // 24 hours
  planPricing: CacheTTL.DAY,              // 24 hours

  // Analytics (can be stale)
  analyticsReport: CacheTTL.MEDIUM_LONG,  // 30 min
  auditSummary: CacheTTL.MEDIUM,          // 15 min

  // System (varies)
  healthCheck: CacheTTL.VERY_SHORT,       // 1 min
  systemConfig: CacheTTL.EXTRA_LONG,      // 12 hours
} as const;

/**
 * Singleton instances for different environments
 */
const isDev = process.env.NODE_ENV === 'development';
const developmentCacheConfig = new CacheConfigManager(true);
const productionCacheConfig = new CacheConfigManager(false);

/**
 * Get appropriate configuration based on NODE_ENV
 */
export const getCacheConfig = (isDevelopment: boolean = isDev) => {
  return isDevelopment ? developmentCacheConfig : productionCacheConfig;
};

/**
 * Export active config instance
 */
export const cacheConfig = getCacheConfig();

/**
 * Export manager class for advanced usage
 */
export default CacheConfigManager;