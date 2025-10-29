/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI - SECURITY CONFIG SERVICE (REFINED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: Dynamic security configuration management
 * Architecture: Singleton class with database-driven configs
 *
 * Features:
 * - Load all security configs from database
 * - In-memory caching with auto-reload
 * - Hot reload without server restart
 * - Type-safe config access
 * - Full compatibility with security-config.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SecurityPatternConfig {
  id: string;
  name: string;
  pattern: RegExp;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'BLOCK' | 'WARN' | 'LOG';
  description: string;
  isActive: boolean;
  priority: number;
}

export interface BlockedModel {
  id: string;
  modelName: string;
  aliases: string[];
  provider: string | null;
  replacement: string | null;
  isActive: boolean;
}

export interface ProviderConfig {
  id: string;
  providerName: string;
  displayName: string;
  isEnabled: boolean;
  priority: number;
  modelsConfig: Record<string, string>;
  baseUrl: string | null;
  timeout: number;
  retryAttempts: number;
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsAudio: boolean;
}

export interface ConfigValue {
  key: string;
  value: any;
  dataType: 'INT' | 'FLOAT' | 'BOOLEAN' | 'STRING' | 'JSON';
  category: string;
  isActive: boolean;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  lastReload: Date | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIG SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ConfigService {
  private static instance: ConfigService;
  private prisma: PrismaClient;

  // In-memory caches
  private securityPatternsCache: Map<string, SecurityPatternConfig> = new Map();
  private blockedModelsCache: Map<string, BlockedModel> = new Map();
  private providerConfigsCache: Map<string, ProviderConfig> = new Map();
  private configValuesCache: Map<string, ConfigValue> = new Map();

  // Cache statistics
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private lastReload: Date | null = null;

  // Cache settings
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private cacheTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.prisma = new PrismaClient();
    this.initializeAutoReload();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Initialize automatic cache reload
   */
  private initializeAutoReload(): void {
    // Auto-reload every 5 minutes
    this.cacheTimer = setInterval(async () => {
      console.log('[ConfigService] Auto-reloading configs from database...');
      await this.reloadAll();
    }, this.CACHE_TTL);
  }

  /**
   * Load all configurations from database
   */
  public async loadAll(): Promise<void> {
    try {
      console.log('[ConfigService] Loading all configurations from database...');

      await Promise.all([
        this.loadSecurityPatterns(),
        this.loadBlockedModels(),
        this.loadProviderConfigs(),
        this.loadConfigValues(),
      ]);

      this.lastReload = new Date();
      console.log('[ConfigService] All configurations loaded successfully');
    } catch (error) {
      console.error('[ConfigService] Error loading configurations:', error);
      throw error;
    }
  }

  /**
   * Reload all configurations (hot reload)
   */
  public async reloadAll(): Promise<void> {
    await this.loadAll();
  }

  /**
   * Reload config (alias for compatibility)
   */
  public async reloadConfig(): Promise<void> {
    await this.reloadAll();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECURITY PATTERNS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Load security patterns from database
   */
  private async loadSecurityPatterns(): Promise<void> {
    try {
      const patterns = await this.prisma.securityPattern.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });

      this.securityPatternsCache.clear();

      for (const pattern of patterns) {
        try {
          const config: SecurityPatternConfig = {
            id: pattern.id,
            name: pattern.name,
            pattern: new RegExp(pattern.pattern, 'i'),
            category: pattern.category,
            severity: pattern.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
            action: pattern.action as 'BLOCK' | 'WARN' | 'LOG',
            description: pattern.description,
            isActive: pattern.isActive,
            priority: pattern.priority,
          };

          this.securityPatternsCache.set(pattern.id, config);
        } catch (regexError) {
          console.error(`[ConfigService] Invalid regex for pattern ${pattern.name}:`, regexError);
        }
      }

      console.log(`[ConfigService] Loaded ${this.securityPatternsCache.size} security patterns`);
    } catch (error) {
      console.error('[ConfigService] Error loading security patterns:', error);
      throw error;
    }
  }

  /**
   * Get all security patterns (internal format)
   */
  public getSecurityPatternsInternal(): SecurityPatternConfig[] {
    if (this.securityPatternsCache.size === 0) {
      this.cacheMisses++;
      console.warn('[ConfigService] Security patterns cache empty - load first!');
      return [];
    }

    this.cacheHits++;
    return Array.from(this.securityPatternsCache.values());
  }

  /**
   * Get all security patterns (returns array for compatibility)
   */
  public async getSecurityPatterns(): Promise<any[]> {
    const patterns = this.getSecurityPatternsInternal();

    return patterns.map((pattern) => ({
      id: pattern.id,
      name: pattern.name,
      pattern: pattern.pattern.source, // Convert RegExp to string
      category: pattern.category,
      severity: pattern.severity,
      action: pattern.action,
      description: pattern.description,
      isActive: pattern.isActive,
      priority: pattern.priority,
      matchCount: 0,
      blockCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMatched: null,
    }));
  }

  /**
   * Get security patterns by category
   */
  public getSecurityPatternsByCategory(category: string): SecurityPatternConfig[] {
    this.cacheHits++;
    return this.getSecurityPatternsInternal().filter((p) => p.category === category);
  }

  /**
   * Get security pattern by ID
   */
  public getSecurityPatternById(id: string): SecurityPatternConfig | undefined {
    const pattern = this.securityPatternsCache.get(id);
    if (pattern) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
    return pattern;
  }

  /**
   * Update pattern match count (for analytics)
   */
  public async updatePatternMatchCount(patternId: string): Promise<void> {
    try {
      await this.prisma.securityPattern.update({
        where: { id: patternId },
        data: {
          matchCount: { increment: 1 },
          lastMatched: new Date(),
        },
      });
    } catch (error) {
      console.error('[ConfigService] Error updating pattern match count:', error);
    }
  }

  /**
   * Update pattern block count
   */
  public async updatePatternBlockCount(patternId: string): Promise<void> {
    try {
      await this.prisma.securityPattern.update({
        where: { id: patternId },
        data: {
          blockCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error('[ConfigService] Error updating pattern block count:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BLOCKED MODELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Load blocked model names from database
   */
  private async loadBlockedModels(): Promise<void> {
    try {
      const models = await this.prisma.blockedModelName.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });

      this.blockedModelsCache.clear();

      for (const model of models) {
        const config: BlockedModel = {
          id: model.id,
          modelName: model.modelName,
          aliases: model.aliases,
          provider: model.provider,
          replacement: model.replacement,
          isActive: model.isActive,
        };

        this.blockedModelsCache.set(model.modelName.toLowerCase(), config);

        // Also cache aliases
        for (const alias of model.aliases) {
          this.blockedModelsCache.set(alias.toLowerCase(), config);
        }
      }

      console.log(
        `[ConfigService] Loaded ${models.length} blocked model names (${this.blockedModelsCache.size} total with aliases)`
      );
    } catch (error) {
      console.error('[ConfigService] Error loading blocked models:', error);
      throw error;
    }
  }

  /**
   * Get all blocked model names (returns array for compatibility)
   */
  public async getBlockedModelNames(): Promise<any[]> {
    const models = this.getBlockedModels();

    return models.map((model) => ({
      id: model.id,
      modelName: model.modelName,
      aliases: model.aliases,
      provider: model.provider,
      replacement: model.replacement,
      isActive: model.isActive,
      priority: 0,
      blockCount: 0,
      detectionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastDetected: null,
    }));
  }

  /**
   * Get all blocked models (internal format)
   */
  public getBlockedModels(): BlockedModel[] {
    if (this.blockedModelsCache.size === 0) {
      this.cacheMisses++;
      console.warn('[ConfigService] Blocked models cache empty - load first!');
      return [];
    }

    this.cacheHits++;
    // Return unique models (remove duplicate aliases)
    const uniqueModels = new Map<string, BlockedModel>();
    for (const model of this.blockedModelsCache.values()) {
      uniqueModels.set(model.id, model);
    }
    return Array.from(uniqueModels.values());
  }

  /**
   * Check if model name is blocked
   */
  public isModelBlocked(modelName: string): boolean {
    this.cacheHits++;
    return this.blockedModelsCache.has(modelName.toLowerCase());
  }

  /**
   * Get blocked model config
   */
  public getBlockedModel(modelName: string): BlockedModel | undefined {
    const model = this.blockedModelsCache.get(modelName.toLowerCase());
    if (model) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
    return model;
  }

  /**
   * Update model detection count
   */
  public async updateModelDetectionCount(modelName: string): Promise<void> {
    try {
      await this.prisma.blockedModelName.update({
        where: { modelName },
        data: {
          detectionCount: { increment: 1 },
          lastDetected: new Date(),
        },
      });
    } catch (error) {
      console.error('[ConfigService] Error updating model detection count:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROVIDER CONFIGURATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Load provider configurations from database
   */
  private async loadProviderConfigs(): Promise<void> {
    try {
      const providers = await this.prisma.providerConfiguration.findMany({
        where: { isEnabled: true },
        orderBy: { priority: 'desc' },
      });

      this.providerConfigsCache.clear();

      for (const provider of providers) {
        const config: ProviderConfig = {
          id: provider.id,
          providerName: provider.providerName,
          displayName: provider.displayName,
          isEnabled: provider.isEnabled,
          priority: provider.priority,
          modelsConfig: provider.modelsConfig as Record<string, string>,
          baseUrl: provider.baseUrl,
          timeout: provider.timeout || 30000,
          retryAttempts: provider.retryAttempts || 3,
          supportsStreaming: provider.supportsStreaming,
          supportsImages: provider.supportsImages,
          supportsAudio: provider.supportsAudio,
        };

        this.providerConfigsCache.set(provider.providerName, config);
      }

      console.log(
        `[ConfigService] Loaded ${this.providerConfigsCache.size} provider configurations`
      );
    } catch (error) {
      console.error('[ConfigService] Error loading provider configs:', error);
      throw error;
    }
  }

  /**
   * Get all provider configurations
   */
  public getProviderConfigs(): ProviderConfig[] {
    if (this.providerConfigsCache.size === 0) {
      this.cacheMisses++;
      console.warn('[ConfigService] Provider configs cache empty - load first!');
      return [];
    }

    this.cacheHits++;
    return Array.from(this.providerConfigsCache.values());
  }

  /**
   * Get provider configuration by name
   */
  public getProviderConfig(providerName: string): ProviderConfig | undefined {
    const config = this.providerConfigsCache.get(providerName);
    if (config) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
    return config;
  }

  /**
   * Get model for plan
   */
  public getModelForPlan(providerName: string, planName: string): string | undefined {
    const provider = this.getProviderConfig(providerName);
    return provider?.modelsConfig[planName];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIG VALUES (Thresholds, Settings)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Load config values from database
   */
  private async loadConfigValues(): Promise<void> {
    try {
      const configs = await this.prisma.securityConfig.findMany({
        where: { isActive: true },
      });

      this.configValuesCache.clear();

      for (const config of configs) {
        const value: ConfigValue = {
          key: config.configKey,
          value: this.parseConfigValue(config.configValue, config.dataType),
          dataType: config.dataType as 'INT' | 'FLOAT' | 'BOOLEAN' | 'STRING' | 'JSON',
          category: config.category,
          isActive: config.isActive,
        };

        this.configValuesCache.set(config.configKey, value);
      }

      console.log(`[ConfigService] Loaded ${this.configValuesCache.size} config values`);
    } catch (error) {
      console.error('[ConfigService] Error loading config values:', error);
      throw error;
    }
  }

  /**
   * Parse config value based on data type
   */
  private parseConfigValue(value: string, dataType: string): any {
    try {
      switch (dataType) {
        case 'INT':
          return parseInt(value, 10);
        case 'FLOAT':
          return parseFloat(value);
        case 'BOOLEAN':
          return value.toLowerCase() === 'true';
        case 'JSON':
          return JSON.parse(value);
        case 'STRING':
        default:
          return value;
      }
    } catch (error) {
      console.error(`[ConfigService] Error parsing config value: ${value}`, error);
      return value;
    }
  }

  /**
   * Get security config by key (returns object with value property)
   */
  public async getSecurityConfig(key: string): Promise<any | null> {
    const configValue = this.getConfigSafe(key);
    if (configValue === null) return null;

    // Return object with 'value' property for compatibility
    return {
      id: key,
      configKey: key,
      configValue: JSON.stringify(configValue),
      dataType: 'JSON',
      category: 'security',
      description: '',
      isActive: true,
      previousValue: null,
      changedBy: null,
      changedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      key: key,
      value: configValue, // ← This is what security-config.ts needs
      enabled: true,
    };
  }

  /**
   * Get config value
   */
  public getConfig<T = any>(key: string, defaultValue?: T): T {
    const config = this.configValuesCache.get(key);

    if (config) {
      this.cacheHits++;
      return config.value as T;
    }

    this.cacheMisses++;

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Config key not found: ${key}`);
  }

  /**
   * Get config value safely (returns null if not found)
   */
  public getConfigSafe<T = any>(key: string): T | null {
    try {
      return this.getConfig<T>(key);
    } catch {
      return null;
    }
  }

  /**
   * Get all configs by category
   */
  public getConfigsByCategory(category: string): ConfigValue[] {
    this.cacheHits++;
    return Array.from(this.configValuesCache.values()).filter((c) => c.category === category);
  }

  /**
   * Update config value in database
   */
  public async updateConfig(key: string, value: any, updatedBy?: string): Promise<void> {
    try {
      const config = this.configValuesCache.get(key);
      if (!config) {
        throw new Error(`Config key not found: ${key}`);
      }

      const stringValue = this.stringifyConfigValue(value, config.dataType);

      await this.prisma.securityConfig.update({
        where: { configKey: key },
        data: {
          previousValue: config.value.toString(),
          configValue: stringValue,
          changedBy: updatedBy,
          changedAt: new Date(),
        },
      });

      // Update cache
      config.value = value;
      this.configValuesCache.set(key, config);

      console.log(`[ConfigService] Updated config: ${key} = ${value}`);
    } catch (error) {
      console.error('[ConfigService] Error updating config:', error);
      throw error;
    }
  }

  /**
   * Stringify config value for database storage
   */
  private stringifyConfigValue(value: any, dataType: string): string {
    switch (dataType) {
      case 'JSON':
        return JSON.stringify(value);
      case 'BOOLEAN':
        return value ? 'true' : 'false';
      default:
        return value.toString();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.securityPatternsCache.clear();
    this.blockedModelsCache.clear();
    this.providerConfigsCache.clear();
    this.configValuesCache.clear();

    this.cacheHits = 0;
    this.cacheMisses = 0;

    console.log('[ConfigService] All caches cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): CacheStats {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    return {
      size:
        this.securityPatternsCache.size +
        this.blockedModelsCache.size +
        this.providerConfigsCache.size +
        this.configValuesCache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      lastReload: this.lastReload,
    };
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    details: {
      database: boolean;
      cacheLoaded: boolean;
      lastReload: Date | null;
      cacheStats: CacheStats;
    };
  }> {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      const cacheLoaded =
        this.securityPatternsCache.size > 0 ||
        this.blockedModelsCache.size > 0 ||
        this.providerConfigsCache.size > 0 ||
        this.configValuesCache.size > 0;

      return {
        healthy: cacheLoaded,
        details: {
          database: true,
          cacheLoaded,
          lastReload: this.lastReload,
          cacheStats: this.getCacheStats(),
        },
      };
    } catch (error) {
      console.error('[ConfigService] Health check failed:', error);
      return {
        healthy: false,
        details: {
          database: false,
          cacheLoaded: false,
          lastReload: this.lastReload,
          cacheStats: this.getCacheStats(),
        },
      };
    }
  }

  /**
   * Cleanup (stop timers, close connections)
   */
  public async cleanup(): Promise<void> {
    if (this.cacheTimer) {
      clearInterval(this.cacheTimer);
      this.cacheTimer = null;
    }

    await this.prisma.$disconnect();
    console.log('[ConfigService] Cleanup completed');
  }

  /**
   * Shutdown (alias for cleanup)
   */
  public async shutdown(): Promise<void> {
    await this.cleanup();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Export named instance
export const configService = ConfigService.getInstance();

// Export default instance
export default ConfigService.getInstance();
