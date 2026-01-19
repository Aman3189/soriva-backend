// src/services/cache.service.ts
import {
  CacheEntry,
  CacheStats,
  CacheOptions,
  ICacheProvider,
} from '../types/cache.types';
import { cacheConfig, CacheTTL } from '../config/cache.config';
import { PlanType } from '../constants';

/**
 * ==========================================
 * IN-MEMORY CACHE SERVICE - SORIVA V2
 * ==========================================
 * High-performance in-memory caching
 * Redis-ready architecture (easy upgrade path)
 * 
 * FEATURES:
 * - Automatic TTL expiration
 * - LRU eviction (when max size reached)
 * - Statistics tracking
 * - Pattern-based deletion
 * - Namespace support
 * 
 * Phase 3 - Step 1: Performance Optimization
 * Last Updated: January 19, 2026
 */

/**
 * Plan-based cache limits configuration
 * Controls response caching for repeated queries
 */
const PLAN_LIMITS: Record<PlanType, {
  maxCacheEntries: number;
  cacheTTLMultiplier: number;
  enableResponseCaching: boolean;
}> = {
  STARTER: {
    maxCacheEntries: 50,
    cacheTTLMultiplier: 0.5,
    enableResponseCaching: false,
  },
  LITE: {
    maxCacheEntries: 100,
    cacheTTLMultiplier: 0.75,
    enableResponseCaching: true,
  },
  PLUS: {
    maxCacheEntries: 200,
    cacheTTLMultiplier: 1.0,
    enableResponseCaching: true,
  },
  PRO: {
    maxCacheEntries: 500,
    cacheTTLMultiplier: 1.5,
    enableResponseCaching: true,
  },
  APEX: {
    maxCacheEntries: 1000,
    cacheTTLMultiplier: 2.0,
    enableResponseCaching: true,
  },
  SOVEREIGN: {
    maxCacheEntries: 5000,
    cacheTTLMultiplier: 3.0,
    enableResponseCaching: true,
  },
};

/**
 * In-Memory Cache Service - Class-based implementation
 */
class CacheService implements ICacheProvider {
  private cache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private cleanupInterval?: NodeJS.Timeout;
  private maxSize: number;
  private defaultTTL: number;

  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
      hitRate: 0,
    };

    const config = cacheConfig.getConfig();
    this.maxSize = config.maxSize;
    this.defaultTTL = config.defaultTTL;

    // Start automatic cleanup
    if (config.enabled) {
      this.startCleanup(config.checkPeriod);
    }

    console.log('📦 Cache service initialized:', {
      enabled: config.enabled,
      maxSize: this.maxSize,
      defaultTTL: `${this.defaultTTL}s`,
    });
  }

  /**
   * Get plan-specific cache limits
   */
  public getPlanLimits(plan: PlanType) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.STARTER;
  }

  /**
   * Check if response caching is enabled for plan
   */
  public isResponseCachingEnabled(plan: PlanType): boolean {
    return this.getPlanLimits(plan).enableResponseCaching;
  }

  /**
   * Get adjusted TTL based on plan
   */
  public getAdjustedTTL(baseTTL: number, plan: PlanType): number {
    const multiplier = this.getPlanLimits(plan).cacheTTLMultiplier;
    return Math.floor(baseTTL * multiplier);
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    // Cache miss
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Cache hit
    this.stats.hits++;
    entry.hits = (entry.hits || 0) + 1;
    this.updateHitRate();

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  public async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    // Check if cache is full (LRU eviction)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const ttl = options?.ttl || this.defaultTTL;
    const now = Date.now();

    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt: now + ttl * 1000,
      createdAt: now,
      ttl,
      hits: 0,
    };

    this.cache.set(key, entry);
    this.stats.keys = this.cache.size;
  }

  /**
   * Set value with plan-based TTL adjustment
   */
  public async setWithPlan<T>(
    key: string,
    value: T,
    plan: PlanType,
    options?: CacheOptions
  ): Promise<void> {
    if (!this.isResponseCachingEnabled(plan)) {
      return; // Don't cache for plans without caching enabled
    }

    const baseTTL = options?.ttl || this.defaultTTL;
    const adjustedTTL = this.getAdjustedTTL(baseTTL, plan);

    await this.set(key, value, { ...options, ttl: adjustedTTL });
  }

  /**
   * Delete key from cache
   */
  public async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    this.stats.keys = this.cache.size;
    return deleted;
  }

  /**
   * Clear cache (pattern-based or all)
   */
  public async clear(pattern?: string): Promise<number> {
    if (!pattern) {
      // Clear all
      const count = this.cache.size;
      this.cache.clear();
      this.stats.keys = 0;
      return count;
    }

    // Pattern-based deletion
    let count = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.stats.keys = this.cache.size;
    return count;
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get remaining TTL for key (in seconds)
   */
  public async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key);
    if (!entry) return -2; // Key doesn't exist

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return -2;
    }

    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -1; // -1 means expired
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return {
      ...this.stats,
      keys: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Get all keys (for debugging)
   */
  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get multiple values at once
   */
  public async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        results.set(key, value);
      }
    }

    return results;
  }

  /**
   * Set multiple values at once
   */
  public async setMany<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.options);
    }
  }

  /**
   * Delete by prefix
   */
  public async deleteByPrefix(prefix: string): Promise<number> {
    return this.clear(`^${prefix}`);
  }

  /**
   * Wrap async function with caching
   */
  public async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    await this.set(key, result, options);

    return result;
  }

  /**
   * Wrap async function with plan-based caching
   */
  public async wrapWithPlan<T>(
    key: string,
    fn: () => Promise<T>,
    plan: PlanType,
    options?: CacheOptions
  ): Promise<T> {
    // Check if caching is enabled for this plan
    if (!this.isResponseCachingEnabled(plan)) {
      return await fn();
    }

    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result with plan-adjusted TTL
    await this.setWithPlan(key, result, plan, options);

    return result;
  }

  /**
   * Reset all statistics
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      keys: this.cache.size,
      hitRate: 0,
    };
  }

  /**
   * Private: Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Private: Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Private: Evict least recently used entry (LRU)
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;

    // Find entry with lowest hits
    for (const [key, entry] of this.cache.entries()) {
      const hits = entry.hits || 0;
      if (hits < lruHits) {
        lruHits = hits;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log(`📦 Cache evicted (LRU): ${lruKey}`);
    }
  }

  /**
   * Private: Start automatic cleanup of expired entries
   */
  private startCleanup(intervalSeconds: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, intervalSeconds * 1000);

    console.log(`📦 Cache cleanup started (every ${intervalSeconds}s)`);
  }

  /**
   * Private: Clean up expired entries
   */
  private cleanupExpired(): void {
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.keys = this.cache.size;
      console.log(`📦 Cache cleanup: ${cleaned} expired entries removed`);
    }
  }

  /**
   * Private: Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let bytes = 0;

    for (const entry of this.cache.values()) {
      // Rough estimate: JSON size
      bytes += JSON.stringify(entry).length * 2; // UTF-16 = 2 bytes per char
    }

    return bytes;
  }

  /**
   * Shutdown cache service (cleanup)
   */
  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      console.log('📦 Cache service shutdown');
    }
  }
}

/**
 * Export singleton instance
 */
export const cacheService = new CacheService();

/**
 * Export class for testing/advanced usage
 */
export default CacheService;