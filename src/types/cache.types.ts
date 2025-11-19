// src/types/cache.types.ts
/**
 * ==========================================
 * CACHE TYPES - SORIVA V2
 * ==========================================
 * TypeScript interfaces for caching system
 * 
 * Phase 3 - Step 1: Performance Optimization
 * Last Updated: November 19, 2025
 */

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CACHE NAMESPACE ENUM (ADDED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export enum CacheNamespace {
  API = 'api',
  USER = 'user',
  PUBLIC = 'public',
  AI = 'ai',
  DOCUMENT = 'document',
  ANALYTICS = 'analytics',
  BRAIN = 'brain',
  SYSTEM = 'system',
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CACHE TTL CONSTANTS (ADDED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export enum CacheTTL {
  INSTANT = 60,        // 1 minute
  SHORT = 300,         // 5 minutes
  MEDIUM = 900,        // 15 minutes
  LONG = 3600,         // 1 hour
  VERY_LONG = 21600,   // 6 hours
  DAY = 86400,         // 24 hours
  WEEK = 604800,       // 7 days
}

/**
 * Cache Entry Structure
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt: number; // Timestamp in ms
  createdAt: number;
  ttl: number; // Time to live in seconds
  hits?: number; // Number of times accessed
}

/**
 * Cache Configuration
 */
export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number; // Default time to live (seconds)
  maxSize: number; // Maximum number of entries
  checkPeriod: number; // Cleanup interval (seconds)
  enableStats: boolean; // Track cache statistics
}

/**
 * Cache Statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  hitRate: number; // Percentage
  memoryUsage?: number; // Bytes
}

/**
 * Cache Operation Options
 */
export interface CacheOptions {
  ttl?: number; // Custom TTL for this entry (seconds)
  tags?: string[]; // Tags for bulk invalidation
  namespace?: string; // Cache namespace/prefix
}

/**
 * Cache Key Patterns
 */
export enum CacheKeyPattern {
  // User-related
  USER_PROFILE = 'user:profile:',
  USER_SUBSCRIPTION = 'user:subscription:',
  USER_USAGE = 'user:usage:',

  // AI-related
  AI_CONVERSATION = 'ai:conversation:',
  AI_RESPONSE = 'ai:response:',
  AI_MODEL_CONFIG = 'ai:model:config:',

  // Document-related
  DOCUMENT_META = 'document:meta:',
  DOCUMENT_CONTENT = 'document:content:',

  // Plan-related
  PLAN_CONFIG = 'plan:config:',
  PLAN_PRICING = 'plan:pricing:',

  // Analytics
  ANALYTICS_SUMMARY = 'analytics:summary:',
  ANALYTICS_REPORT = 'analytics:report:',

  // System
  HEALTH_CHECK = 'health:check',
  SYSTEM_CONFIG = 'system:config:',
}

/**
 * Cache Strategy Types
 */
export type CacheStrategy = 
  | 'no-cache'        // Never cache
  | 'cache-first'     // Try cache first, then fetch
  | 'network-first'   // Try network first, cache as fallback
  | 'cache-only'      // Only use cache (fail if not cached)
  | 'stale-while-revalidate'; // Return stale, fetch in background

/**
 * Cache Invalidation Event
 */
export interface CacheInvalidationEvent {
  pattern?: string; // Pattern to match keys
  keys?: string[]; // Specific keys to invalidate
  tags?: string[]; // Tags to invalidate
  namespace?: string; // Namespace to clear
  all?: boolean; // Clear entire cache
  timestamp: Date;
}

/**
 * Cache Middleware Options
 */
export interface CacheMiddlewareOptions extends CacheOptions {
  strategy?: CacheStrategy;
  keyGenerator?: (req: any) => string; // Custom key generation
  shouldCache?: (req: any, res: any) => boolean; // Conditional caching
}

/**
 * Cache Provider Interface
 */
export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<number>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  getStats(): CacheStats;
}