// src/providers/factory/provider.factory.ts

/**
 * SORIVA AI PROVIDERS - PROVIDER FACTORY (COMPLETE PRODUCTION)
 * Created by: Amandeep, Punjab, India
 * Purpose: Smart provider routing, fallback logic, database-driven configuration
 * Updated: November 26, 2025 - Added OpenRouter support for Kimi K2
 *
 * FEATURES:
 * - Creates providers with automatic fallback chains
 * - Plan-based configuration (memory days, response delays)
 * - Database-driven OR static configuration
 * - Hot-reload support
 * - Comprehensive error handling
 * - Statistics tracking
 * - Health monitoring
 * - 100% Future-proof
 *
 * v5.1 CHANGES:
 * - Added OPENROUTER provider support
 * - Added MOONSHOT → OPENROUTER mapping
 * - Kimi K2 Thinking (Normal Mode) integration
 */

import {
  AIProvider,
  AIModel,
  ProviderConfig,
  AIRequestConfig,
  AIResponse,
  FailureReason,
  Providers,
  Models,
  createAIProvider,
  createAIModel,
} from './base/types';

// Import actual provider implementations
import { ClaudeProvider } from './claude.provider';
import { GeminiProvider } from './gemini.provider';
import { GPTProvider } from './gpt.provider';
import { OpenRouterProvider } from './openrouter.provider';  // ✅ NEW IMPORT
import { AIProviderBase } from './base/AIProvider';

// Import plan configurations (NEW: using central index)
import { PlanType, plansManager } from '../../../constants';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ProviderFactoryConfig {
  anthropicApiKey?: string;
  googleApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;  // ✅ NEW: OpenRouter API key for Kimi K2
  customProviders?: Record<string, string>; // For future providers
}

interface TierProviderConfig {
  planType: PlanType;
  primaryProvider: AIProvider;
  primaryModel: AIModel;
  fallbackProvider?: AIProvider;
  fallbackModel?: AIModel;
  memoryDays: number;
  responseDelay: number;
  enabled: boolean;
}

interface ProviderInstanceCache {
  provider: AIProviderBase;
  createdAt: Date;
  usageCount: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR CLASSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ConfigMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigMissingError';
  }
}

class AllProvidersFailedError extends Error {
  constructor(public failureChain: FailureReason[]) {
    super(`All providers failed: ${failureChain.join(', ')}`);
    this.name = 'AllProvidersFailedError';
  }
}

class NoFallbackAvailableError extends Error {
  constructor(provider: AIProvider) {
    super(`No fallback available for provider: ${provider}`);
    this.name = 'NoFallbackAvailableError';
  }
}

class ProviderNotInitializedError extends Error {
  constructor() {
    super('ProviderFactory not initialized. Call initialize() first.');
    this.name = 'ProviderNotInitializedError';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER FACTORY CLASS (COMPLETE PRODUCTION VERSION)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ProviderFactory {
  private static instance: ProviderFactory;
  private readonly apiKeys: ProviderFactoryConfig;

  // Provider instance cache (key: planType, value: cached instance)
  private providerCache: Map<PlanType, ProviderInstanceCache> = new Map();

  // Plan configurations (loaded from plans.ts OR database)
  private tierConfigs: Map<PlanType, TierProviderConfig> = new Map();

  // Configuration state
  private initialized: boolean = false;
  private configSource: 'STATIC' | 'DATABASE' = 'STATIC';
  private lastConfigLoad: Date | null = null;

  // Optional ConfigService for database-driven configuration
  private configService: any = null;

  // Statistics tracking
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    fallbacksUsed: 0,
    providerErrors: new Map<AIProvider, number>(),
    averageLatency: 0,
    totalLatency: 0,
  };

  // Health monitoring
  private healthStatus: Map<
    PlanType,
    {
      healthy: boolean;
      lastCheck: Date;
      consecutiveFailures: number;
    }
  > = new Map();

  private constructor(config: ProviderFactoryConfig) {
    this.apiKeys = config;
    this.validateApiKeys();

    // Try to load ConfigService (optional - for database-driven config)
    this.tryLoadConfigService();
  }

  /**
   * Get singleton instance of ProviderFactory
   */
  public static getInstance(config?: ProviderFactoryConfig): ProviderFactory {
    if (!ProviderFactory.instance) {
      if (!config) {
        throw new ConfigMissingError('ProviderFactory config required for initialization');
      }
      ProviderFactory.instance = new ProviderFactory(config);
    }
    return ProviderFactory.instance;
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (ProviderFactory.instance) {
      ProviderFactory.instance.clearCache();
      ProviderFactory.instance = null as any;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INITIALIZATION & CONFIGURATION LOADING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Initialize factory by loading configurations
   * Tries database first, falls back to static plans.ts
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[ProviderFactory] Already initialized');
      return;
    }

    console.log('[ProviderFactory] Initializing...');

    try {
      // Try database-driven configuration first
      if (this.configService) {
        try {
          await this.loadFromDatabase();
          this.configSource = 'DATABASE';
          console.log('[ProviderFactory] Using DATABASE configuration');
        } catch (dbError) {
          console.warn('[ProviderFactory] Database load failed, using static config', dbError);
          this.loadFromStaticPlans();
          this.configSource = 'STATIC';
        }
      } else {
        // Use static plans.ts configuration
        this.loadFromStaticPlans();
        this.configSource = 'STATIC';
        console.log('[ProviderFactory] Using STATIC configuration from plans.ts');
      }

      this.initialized = true;
      this.lastConfigLoad = new Date();

      console.log('[ProviderFactory] Initialization complete', {
        plans: this.tierConfigs.size,
        source: this.configSource,
        providers: Array.from(
          new Set(Array.from(this.tierConfigs.values()).map((c) => c.primaryProvider))
        ),
      });
    } catch (error) {
      console.error('[ProviderFactory] Initialization failed', error);
      throw error;
    }
  }

  /**
   * Try to load ConfigService (optional dependency)
   */
  private tryLoadConfigService(): void {
    try {
      const ConfigServiceModule = require('../../../services/config.service');
      if (ConfigServiceModule && ConfigServiceModule.ConfigService) {
        this.configService = ConfigServiceModule.ConfigService.getInstance();
        console.log('[ProviderFactory] ConfigService available');
      }
    } catch (error) {
      console.log('[ProviderFactory] ConfigService not available, will use static config');
    }
  }

  /**
   * Load configurations from database (via ConfigService)
   * This enables dynamic configuration updates without code changes
   */
  private async loadFromDatabase(): Promise<void> {
    if (!this.configService) {
      throw new Error('ConfigService not available');
    }

    console.log('[ProviderFactory] Loading from database...');

    // Check if ConfigService has required methods
    if (
      typeof this.configService.getAllTiers !== 'function' ||
      typeof this.configService.getAllProviders !== 'function' ||
      typeof this.configService.getAllModels !== 'function'
    ) {
      throw new Error('ConfigService missing required methods');
    }

    const [tierDefs, providerDefs, modelDefs] = await Promise.all([
      this.configService.getAllTiers(),
      this.configService.getAllProviders(),
      this.configService.getAllModels(),
    ]);

    // Process tier definitions from database
    for (const tierDef of tierDefs) {
      if (tierDef.enabled && tierDef.config) {
        const config: TierProviderConfig = {
          planType: tierDef.tier as PlanType,
          primaryProvider: tierDef.config.primaryProvider,
          primaryModel: tierDef.config.primaryModel,
          fallbackProvider: tierDef.config.fallbackProvider,
          fallbackModel: tierDef.config.fallbackModel,
          memoryDays: tierDef.config.memoryDays || 5,
          responseDelay: tierDef.config.responseDelay || 5,
          enabled: true,
        };

        this.tierConfigs.set(tierDef.tier as PlanType, config);
      }
    }

    console.log('[ProviderFactory] Loaded from database:', {
      tiers: this.tierConfigs.size,
      providers: providerDefs.length,
      models: modelDefs.length,
    });
  }

  /**
   * Load plan configurations from static plans.ts
   * Now DYNAMICALLY reads from plans.ts aiModels array
   * Updated: November 26, 2025 - Added MOONSHOT/OPENROUTER support
   */
  private loadFromStaticPlans(): void {
    console.log('[ProviderFactory] Loading from plans.ts...');

    // Iterate through all plan types
    for (const planType of Object.values(PlanType)) {
      const plan = plansManager.getPlan(planType);
      
      if (!plan || !plan.enabled) {
        console.log(`[ProviderFactory] Skipping disabled plan: ${planType}`);
        continue;
      }

      const aiModels = plansManager.getAIModels(planType);
      
      if (!aiModels || aiModels.length === 0) {
        console.warn(`[ProviderFactory] No AI models configured for plan: ${planType}`);
        continue;
      }

      // Primary model (first in array)
      const primaryModel = aiModels[0];
      
      // Fallback model (second in array, if exists)
      const fallbackModel = aiModels.length > 1 ? aiModels[1] : undefined;

      // Convert provider enum from plans.ts to Providers enum
      const primaryProvider = this.convertProvider(primaryModel.provider);
      const fallbackProvider = fallbackModel ? this.convertProvider(fallbackModel.provider) : undefined;

      this.tierConfigs.set(planType, {
        planType: planType,
        primaryProvider: primaryProvider,
        primaryModel: createAIModel(primaryModel.modelId),
        fallbackProvider: fallbackProvider,
        fallbackModel: fallbackModel ? createAIModel(fallbackModel.modelId) : undefined,
        memoryDays: plan.limits.memoryDays,
        responseDelay: plan.limits.responseDelay,
        enabled: true,
      });

      console.log(`[ProviderFactory] Loaded ${planType}:`, {
        primary: `${primaryProvider}/${primaryModel.modelId}`,
        fallback: fallbackModel ? `${fallbackProvider}/${fallbackModel.modelId}` : 'none'
      });
    }
  }

  /**
   * Convert AIProvider enum from plans.ts to Providers enum
   * Updated: November 26, 2025 - Added MOONSHOT → OPENROUTER mapping
   */
  private convertProvider(provider: string): AIProvider {
    const mapping: Record<string, string> = {
      'GEMINI': 'GOOGLE',
      'GOOGLE': 'GOOGLE',
      'CLAUDE': 'ANTHROPIC',
      'ANTHROPIC': 'ANTHROPIC',
      'OPENAI': 'OPENAI',
      'GPT': 'OPENAI',
      'MOONSHOT': 'OPENROUTER',   // ✅ NEW: Kimi K2 via OpenRouter
      'OPENROUTER': 'OPENROUTER', // ✅ NEW: Direct OpenRouter reference
    };
    
    const result = mapping[provider.toUpperCase()] || provider;
    console.log(`[ProviderFactory] Provider mapping: ${provider} → ${result}`);
    return result as AIProvider;
  }

  /**
   * Reload configurations (hot reload)
   * Useful for updating configs without restarting server
   */
  public async reloadConfigs(): Promise<void> {
    console.log('[ProviderFactory] Reloading configurations...');

    // Clear existing configs and cache
    this.tierConfigs.clear();
    this.providerCache.clear();
    this.healthStatus.clear();

    this.initialized = false;
    await this.initialize();

    console.log('[ProviderFactory] Configuration reload complete');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIMARY METHODS - Provider Creation & Routing
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get provider for a specific plan
   * Returns cached instance if available, creates new one if needed
   */
  public getProviderForPlan(planType: PlanType): AIProviderBase {
    this.ensureInitialized();

    const config = this.tierConfigs.get(planType);

    if (!config) {
      throw new ConfigMissingError(`Plan configuration not found: ${planType}`);
    }

    if (!config.enabled) {
      throw new ConfigMissingError(`Plan is disabled: ${planType}`);
    }

    // Check cache first
    const cached = this.providerCache.get(planType);
    if (cached) {
      cached.usageCount++;
      return cached.provider;
    }

    // Create new provider with fallback
    const provider = this.createProviderWithFallback(config);

    // Cache it
    this.providerCache.set(planType, {
      provider,
      createdAt: new Date(),
      usageCount: 1,
    });

    console.log('[ProviderFactory] Created provider for plan:', planType);

    return provider;
  }

  /**
   * Execute request with automatic fallback
   * Main entry point for AI requests - handles all error recovery
   */
  public async executeWithFallback(
    planType: PlanType,
    config: AIRequestConfig
  ): Promise<AIResponse> {
    this.ensureInitialized();

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      const provider = this.getProviderForPlan(planType);
      const response = await provider.chat(config);

      // Track success
      const latency = Date.now() - startTime;
      this.stats.successfulRequests++;
      this.stats.totalLatency += latency;
      this.stats.averageLatency = this.stats.totalLatency / this.stats.successfulRequests;

      // Track fallback usage
      if (response.metadata?.usedFallback) {
        this.stats.fallbacksUsed++;
      }

      // Update health status
      this.updateHealthStatus(planType, true);

      console.log('[ProviderFactory] Request successful', {
        plan: planType,
        latency: `${latency}ms`,
        fallback: response.metadata?.usedFallback || false,
      });

      return response;
    } catch (error: any) {
      // Track failure
      this.stats.failedRequests++;
      this.updateHealthStatus(planType, false);

      // Track provider errors
      const tierConfig = this.tierConfigs.get(planType);
      if (tierConfig) {
        const errorCount = this.stats.providerErrors.get(tierConfig.primaryProvider) || 0;
        this.stats.providerErrors.set(tierConfig.primaryProvider, errorCount + 1);
      }

      console.error('[ProviderFactory] Request failed', {
        plan: planType,
        error: error.message,
        latency: `${Date.now() - startTime}ms`,
      });

      throw error;
    }
  }

  /**
   * Stream with automatic fallback
   * Streaming version with same error recovery
   */
  public async *streamWithFallback(
    planType: PlanType,
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    this.ensureInitialized();
    this.stats.totalRequests++;

    try {
      const provider = this.getProviderForPlan(planType);
      yield* provider.streamChat(config);

      this.stats.successfulRequests++;
      this.updateHealthStatus(planType, true);
    } catch (error) {
      this.stats.failedRequests++;
      this.updateHealthStatus(planType, false);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROVIDER CREATION & MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create provider with fallback chain
   * This is the core method that connects primary + fallback providers
   */
  private createProviderWithFallback(tierConfig: TierProviderConfig): AIProviderBase {
    // Create fallback provider first (if available)
    let fallbackProvider: AIProviderBase | undefined;

    if (tierConfig.fallbackProvider && tierConfig.fallbackModel) {
      try {
        const fallbackConfig: ProviderConfig = {
          provider: tierConfig.fallbackProvider,
          model: tierConfig.fallbackModel,
          apiKey: this.getApiKeyForProvider(tierConfig.fallbackProvider),
          timeout: 60000,
        };

        fallbackProvider = this.instantiateProvider(tierConfig.fallbackProvider, fallbackConfig);

        // Set plan config on fallback
        fallbackProvider.setPlanConfig({
          planType: tierConfig.planType,
          responseDelay: tierConfig.responseDelay,
          memoryDays: tierConfig.memoryDays,
        });

        console.log('[ProviderFactory] Created fallback provider', {
          plan: tierConfig.planType,
          fallback: tierConfig.fallbackProvider,
        });
      } catch (error) {
        console.warn('[ProviderFactory] Failed to create fallback provider', error);
        // Continue without fallback
      }
    }

    // Create primary provider with fallback
    const primaryConfig: ProviderConfig = {
      provider: tierConfig.primaryProvider,
      model: tierConfig.primaryModel,
      apiKey: this.getApiKeyForProvider(tierConfig.primaryProvider),
      timeout: 60000,
    };

    const primaryProvider = this.instantiateProvider(
      tierConfig.primaryProvider,
      primaryConfig,
      fallbackProvider
    );

    // Set plan configuration
    primaryProvider.setPlanConfig({
      planType: tierConfig.planType,
      responseDelay: tierConfig.responseDelay,
      memoryDays: tierConfig.memoryDays,
    });

    console.log('[ProviderFactory] Created primary provider', {
      plan: tierConfig.planType,
      primary: tierConfig.primaryProvider,
      hasFallback: !!fallbackProvider,
    });

    return primaryProvider;
  }

  /**
   * Instantiate the actual provider class based on type
   * Factory method that creates concrete provider instances
   * Updated: November 26, 2025 - Added OPENROUTER case
   */
  private instantiateProvider(
    provider: AIProvider,
    config: ProviderConfig,
    fallbackProvider?: AIProviderBase
  ): AIProviderBase {
    const providerType = provider as string;

    switch (providerType) {
      case 'ANTHROPIC':
        return new ClaudeProvider(config, fallbackProvider);

      case 'GOOGLE':
        return new GeminiProvider(config, fallbackProvider);

      case 'OPENAI':
        return new GPTProvider(config, fallbackProvider);

      case 'OPENROUTER':  // ✅ NEW: OpenRouter for Kimi K2 and other models
        return new OpenRouterProvider(config, fallbackProvider);

      default:
        throw new Error(`Unknown provider type: ${provider}`);
    }
  }

  /**
   * Get API key for specific provider
   * Updated: November 26, 2025 - Added OPENROUTER key
   */
  private getApiKeyForProvider(provider: AIProvider): string {
    const providerKey = provider as string;

    const keyMap: Record<string, string | undefined> = {
      ANTHROPIC: this.apiKeys.anthropicApiKey,
      GOOGLE: this.apiKeys.googleApiKey,
      OPENAI: this.apiKeys.openaiApiKey,
      OPENROUTER: this.apiKeys.openrouterApiKey,  // ✅ NEW
    };

    let apiKey = keyMap[providerKey];

    // Check custom providers
    if (!apiKey && this.apiKeys.customProviders) {
      apiKey = this.apiKeys.customProviders[providerKey];
    }

    if (!apiKey) {
      throw new ConfigMissingError(`API key missing for provider: ${provider}`);
    }

    return apiKey;
  }

  /**
   * Validate that required API keys are present
   * Updated: November 26, 2025 - Added openrouterApiKey check
   */
  private validateApiKeys(): void {
    const hasAnyKey = !!(
      this.apiKeys.anthropicApiKey ||
      this.apiKeys.googleApiKey ||
      this.apiKeys.openaiApiKey ||
      this.apiKeys.openrouterApiKey ||  // ✅ NEW
      (this.apiKeys.customProviders && Object.keys(this.apiKeys.customProviders).length > 0)
    );

    if (!hasAnyKey) {
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        console.warn('⚠️  WARNING: No API keys configured - AI requests will fail!');
      } else {
        throw new ConfigMissingError('At least one provider API key is required');
      }
    }
  }

  /**
   * Ensure factory is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new ProviderNotInitializedError();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEALTH MONITORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Update health status for a plan
   */
  private updateHealthStatus(planType: PlanType, healthy: boolean): void {
    const current = this.healthStatus.get(planType) || {
      healthy: true,
      lastCheck: new Date(),
      consecutiveFailures: 0,
    };

    if (healthy) {
      current.healthy = true;
      current.consecutiveFailures = 0;
    } else {
      current.consecutiveFailures++;
      if (current.consecutiveFailures >= 3) {
        current.healthy = false;
      }
    }

    current.lastCheck = new Date();
    this.healthStatus.set(planType, current);
  }

  /**
   * Health check all providers
   */
  public async healthCheckAll(): Promise<Record<PlanType, boolean>> {
    this.ensureInitialized();

    const results: Partial<Record<PlanType, boolean>> = {};

    for (const planType of this.getAvailablePlans()) {
      try {
        const provider = this.getProviderForPlan(planType);
        const healthy = await provider.healthCheck();
        results[planType] = healthy;
        this.updateHealthStatus(planType, healthy);
      } catch (error) {
        results[planType] = false;
        this.updateHealthStatus(planType, false);
      }
    }

    return results as Record<PlanType, boolean>;
  }

  /**
   * Get health status for a specific plan
   */
  public getHealthStatus(planType: PlanType): {
    healthy: boolean;
    lastCheck: Date;
    consecutiveFailures: number;
  } | null {
    return this.healthStatus.get(planType) || null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY & MANAGEMENT METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get plan configuration
   */
  public getPlanConfig(planType: PlanType): TierProviderConfig | undefined {
    this.ensureInitialized();
    return this.tierConfigs.get(planType);
  }

  /**
   * Get all available plans
   */
  public getAvailablePlans(): PlanType[] {
    this.ensureInitialized();
    return Array.from(this.tierConfigs.keys()).filter(
      (planType) => this.tierConfigs.get(planType)?.enabled
    );
  }

  /**
   * Check if a plan has fallback
   */
  public hasFallback(planType: PlanType): boolean {
    this.ensureInitialized();
    const config = this.tierConfigs.get(planType);
    return !!(config?.fallbackProvider && config?.fallbackModel);
  }

  /**
   * Get factory statistics with detailed metrics
   */
  public getStats() {
    const providerErrorsObj: Record<string, number> = {};
    this.stats.providerErrors.forEach((count, provider) => {
      providerErrorsObj[provider as string] = count;
    });

    return {
      totalRequests: this.stats.totalRequests,
      successfulRequests: this.stats.successfulRequests,
      failedRequests: this.stats.failedRequests,
      fallbacksUsed: this.stats.fallbacksUsed,
      successRate:
        this.stats.totalRequests > 0
          ? (this.stats.successfulRequests / this.stats.totalRequests) * 100
          : 0,
      fallbackRate:
        this.stats.totalRequests > 0
          ? (this.stats.fallbacksUsed / this.stats.totalRequests) * 100
          : 0,
      averageLatency: Math.round(this.stats.averageLatency),
      providerErrors: providerErrorsObj,
      cachedProviders: this.providerCache.size,
      initialized: this.initialized,
      configSource: this.configSource,
      lastConfigLoad: this.lastConfigLoad,
    };
  }

  /**
   * Get detailed statistics per plan
   */
  public getStatsPerPlan(): Record<PlanType, any> {
    const stats: Partial<Record<PlanType, any>> = {};

    for (const planType of this.getAvailablePlans()) {
      const cached = this.providerCache.get(planType);
      const health = this.healthStatus.get(planType);

      stats[planType] = {
        usageCount: cached?.usageCount || 0,
        createdAt: cached?.createdAt || null,
        healthy: health?.healthy ?? true,
        consecutiveFailures: health?.consecutiveFailures || 0,
        lastHealthCheck: health?.lastCheck || null,
      };
    }

    return stats as Record<PlanType, any>;
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbacksUsed: 0,
      providerErrors: new Map(),
      averageLatency: 0,
      totalLatency: 0,
    };

    console.log('[ProviderFactory] Statistics reset');
  }

  /**
   * Clear provider cache (forces recreation on next request)
   */
  public clearCache(): void {
    this.providerCache.clear();
    console.log('[ProviderFactory] Provider cache cleared');
  }

  /**
   * Get provider info for a plan
   */
  public getProviderInfo(planType: PlanType): {
    primary: string;
    primaryModel: string;
    fallback?: string;
    fallbackModel?: string;
    memoryDays: number;
    responseDelay: number;
    enabled: boolean;
  } | null {
    this.ensureInitialized();

    const config = this.tierConfigs.get(planType);
    if (!config) return null;

    return {
      primary: config.primaryProvider as string,
      primaryModel: config.primaryModel as string,
      fallback: config.fallbackProvider as string | undefined,
      fallbackModel: config.fallbackModel as string | undefined,
      memoryDays: config.memoryDays,
      responseDelay: config.responseDelay,
      enabled: config.enabled,
    };
  }

  /**
   * Check initialization status
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get configuration source
   */
  public getConfigSource(): 'STATIC' | 'DATABASE' {
    return this.configSource;
  }

  /**
   * Check if using database configuration
   */
  public isUsingDatabase(): boolean {
    return this.configSource === 'DATABASE';
  }

  /**
   * Get last configuration load time
   */
  public getLastConfigLoad(): Date | null {
    return this.lastConfigLoad;
  }

  /**
   * Get cache info
   */
  public getCacheInfo(): Array<{
    plan: PlanType;
    createdAt: Date;
    usageCount: number;
  }> {
    const info: Array<any> = [];

    this.providerCache.forEach((cache, planType) => {
      info.push({
        plan: planType,
        createdAt: cache.createdAt,
        usageCount: cache.usageCount,
      });
    });

    return info;
  }
}