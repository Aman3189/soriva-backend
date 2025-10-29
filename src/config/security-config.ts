// src/config/security-config.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA BACKEND - DYNAMIC SECURITY CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Purpose: Database-driven security configuration with type safety
// Features:
// - Loads all configs from database via ConfigService
// - Type-safe getters for security settings
// - Default fallback values
// - Hot-reload support
// - Single source of truth for all security modules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import configService from '../services/ai/config.service';
import {
  SecurityPattern,
  BlockedModelName,
  SecurityConfig as SecurityConfigModel,
} from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface JailbreakPattern {
  pattern: string;
  category: string;
  severity: string;
  description?: string;
}

export interface ContentModerationConfig {
  enabled: boolean;
  blockedModels: string[];
  strictMode: boolean;
  allowExceptions: boolean;
}

export interface PromptSanitizerConfig {
  enabled: boolean;
  maxLength: number;
  stripHtml: boolean;
  normalizeWhitespace: boolean;
  removeControlChars: boolean;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  blockDuration: number; // seconds
}

export interface SecurityThresholds {
  jailbreakConfidence: number;
  contentModerationScore: number;
  promptSanitizerRisk: number;
  maxPromptLength: number;
  maxResponseLength: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECURITY CONFIGURATION CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SecurityConfig {
  // Note: We use the imported configService instance directly
  // No need for static property

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JAILBREAK PATTERNS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get all active jailbreak patterns from database
   */
  static async getJailbreakPatterns(): Promise<JailbreakPattern[]> {
    try {
      const patterns = await configService.getSecurityPatterns();

      return patterns.map((p: SecurityPattern) => ({
        pattern: p.pattern,
        category: p.category,
        severity: p.severity,
        description: p.description || undefined,
      }));
    } catch (error) {
      console.error('[SecurityConfig] Failed to load jailbreak patterns:', error);
      return SecurityConfig.getDefaultJailbreakPatterns();
    }
  }

  /**
   * Get patterns by category
   */
  static async getPatternsByCategory(category: string): Promise<JailbreakPattern[]> {
    try {
      const allPatterns = await SecurityConfig.getJailbreakPatterns();
      return allPatterns.filter((p) => p.category === category);
    } catch (error) {
      console.error(`[SecurityConfig] Failed to load patterns for category ${category}:`, error);
      return [];
    }
  }

  /**
   * Get patterns by severity
   */
  static async getPatternsBySeverity(severity: string): Promise<JailbreakPattern[]> {
    try {
      const allPatterns = await SecurityConfig.getJailbreakPatterns();
      return allPatterns.filter((p) => p.severity === severity);
    } catch (error) {
      console.error(`[SecurityConfig] Failed to load patterns for severity ${severity}:`, error);
      return [];
    }
  }

  /**
   * Default fallback patterns (when DB unavailable)
   */
  private static getDefaultJailbreakPatterns(): JailbreakPattern[] {
    return [
      {
        pattern: 'ignore previous instructions',
        category: 'jailbreak',
        severity: 'HIGH',
        description: 'Direct instruction override attempt',
      },
      {
        pattern: 'forget everything',
        category: 'jailbreak',
        severity: 'HIGH',
        description: 'Memory reset attempt',
      },
      {
        pattern: 'act as',
        category: 'jailbreak',
        severity: 'MEDIUM',
        description: 'Role-play jailbreak',
      },
      {
        pattern: 'pretend you are',
        category: 'jailbreak',
        severity: 'MEDIUM',
        description: 'Identity manipulation',
      },
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BLOCKED MODEL NAMES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get all blocked model names from database
   */
  static async getBlockedModelNames(): Promise<string[]> {
    try {
      const blockedModels = await configService.getBlockedModelNames();
      return blockedModels.map((m: BlockedModelName) => m.modelName);
    } catch (error) {
      console.error('[SecurityConfig] Failed to load blocked models:', error);
      return SecurityConfig.getDefaultBlockedModels();
    }
  }

  /**
   * Check if a model name is blocked
   */
  static async isModelBlocked(modelName: string): Promise<boolean> {
    try {
      const blockedModels = await SecurityConfig.getBlockedModelNames();
      const normalizedName = modelName.toLowerCase().trim();

      return blockedModels.some((blocked) => normalizedName.includes(blocked.toLowerCase()));
    } catch (error) {
      console.error('[SecurityConfig] Failed to check model block status:', error);
      return false;
    }
  }

  /**
   * Default fallback blocked models
   */
  private static getDefaultBlockedModels(): string[] {
    return ['gpt-4', 'gpt-3.5', 'claude', 'gemini', 'llama', 'palm'];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECURITY THRESHOLDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get security thresholds from database
   */
  static async getThresholds(): Promise<SecurityThresholds> {
    try {
      const config = await configService.getSecurityConfig('thresholds');

      if (!config) {
        return SecurityConfig.getDefaultThresholds();
      }

      const thresholds = config.value as any;

      return {
        jailbreakConfidence: thresholds.jailbreakConfidence || 0.7,
        contentModerationScore: thresholds.contentModerationScore || 0.8,
        promptSanitizerRisk: thresholds.promptSanitizerRisk || 0.75,
        maxPromptLength: thresholds.maxPromptLength || 4000,
        maxResponseLength: thresholds.maxResponseLength || 8000,
      };
    } catch (error) {
      console.error('[SecurityConfig] Failed to load thresholds:', error);
      return SecurityConfig.getDefaultThresholds();
    }
  }

  /**
   * Get specific threshold value
   */
  static async getThreshold(key: keyof SecurityThresholds): Promise<number> {
    try {
      const thresholds = await SecurityConfig.getThresholds();
      return thresholds[key];
    } catch (error) {
      console.error(`[SecurityConfig] Failed to get threshold ${key}:`, error);
      return 0.7; // Safe default
    }
  }

  /**
   * Default fallback thresholds
   */
  private static getDefaultThresholds(): SecurityThresholds {
    return {
      jailbreakConfidence: 0.7,
      contentModerationScore: 0.8,
      promptSanitizerRisk: 0.75,
      maxPromptLength: 4000,
      maxResponseLength: 8000,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTENT MODERATION CONFIG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get content moderation configuration
   */
  static async getContentModerationConfig(): Promise<ContentModerationConfig> {
    try {
      const config = await configService.getSecurityConfig('content_moderation');
      const blockedModels = await SecurityConfig.getBlockedModelNames();

      if (!config) {
        return SecurityConfig.getDefaultContentModerationConfig(blockedModels);
      }

      const settings = config.value as any;

      return {
        enabled: settings.enabled !== false,
        blockedModels,
        strictMode: settings.strictMode || false,
        allowExceptions: settings.allowExceptions || false,
      };
    } catch (error) {
      console.error('[SecurityConfig] Failed to load content moderation config:', error);
      return SecurityConfig.getDefaultContentModerationConfig([]);
    }
  }

  private static getDefaultContentModerationConfig(
    blockedModels: string[]
  ): ContentModerationConfig {
    return {
      enabled: true,
      blockedModels,
      strictMode: false,
      allowExceptions: false,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROMPT SANITIZER CONFIG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get prompt sanitizer configuration
   */
  static async getPromptSanitizerConfig(): Promise<PromptSanitizerConfig> {
    try {
      const config = await configService.getSecurityConfig('prompt_sanitizer');

      if (!config) {
        return SecurityConfig.getDefaultPromptSanitizerConfig();
      }

      const settings = config.value as any;

      return {
        enabled: settings.enabled !== false,
        maxLength: settings.maxLength || 4000,
        stripHtml: settings.stripHtml !== false,
        normalizeWhitespace: settings.normalizeWhitespace !== false,
        removeControlChars: settings.removeControlChars !== false,
      };
    } catch (error) {
      console.error('[SecurityConfig] Failed to load prompt sanitizer config:', error);
      return SecurityConfig.getDefaultPromptSanitizerConfig();
    }
  }

  private static getDefaultPromptSanitizerConfig(): PromptSanitizerConfig {
    return {
      enabled: true,
      maxLength: 4000,
      stripHtml: true,
      normalizeWhitespace: true,
      removeControlChars: true,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RATE LIMITING CONFIG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get rate limiting configuration
   */
  static async getRateLimitConfig(): Promise<RateLimitConfig> {
    try {
      const config = await configService.getSecurityConfig('rate_limit');

      if (!config) {
        return SecurityConfig.getDefaultRateLimitConfig();
      }

      const settings = config.value as any;

      return {
        enabled: settings.enabled !== false,
        requestsPerMinute: settings.requestsPerMinute || 60,
        requestsPerHour: settings.requestsPerHour || 1000,
        requestsPerDay: settings.requestsPerDay || 10000,
        blockDuration: settings.blockDuration || 300, // 5 minutes
      };
    } catch (error) {
      console.error('[SecurityConfig] Failed to load rate limit config:', error);
      return SecurityConfig.getDefaultRateLimitConfig();
    }
  }

  private static getDefaultRateLimitConfig(): RateLimitConfig {
    return {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      blockDuration: 300,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Force reload all configurations from database
   */
  static async reloadAll(): Promise<void> {
    try {
      await configService.reloadConfig();
      console.log('[SecurityConfig] All configurations reloaded');
    } catch (error) {
      console.error('[SecurityConfig] Failed to reload configurations:', error);
      throw error;
    }
  }

  /**
   * Check if security system is properly configured
   */
  static async isConfigured(): Promise<boolean> {
    try {
      const patterns = await SecurityConfig.getJailbreakPatterns();
      const thresholds = await SecurityConfig.getThresholds();

      return patterns.length > 0 && thresholds.jailbreakConfidence > 0;
    } catch (error) {
      console.error('[SecurityConfig] Configuration check failed:', error);
      return false;
    }
  }

  /**
   * Get configuration status
   */
  static async getStatus(): Promise<{
    configured: boolean;
    patternsCount: number;
    blockedModelsCount: number;
    thresholds: SecurityThresholds;
    lastUpdate: Date;
  }> {
    try {
      const patterns = await SecurityConfig.getJailbreakPatterns();
      const blockedModels = await SecurityConfig.getBlockedModelNames();
      const thresholds = await SecurityConfig.getThresholds();

      return {
        configured: true,
        patternsCount: patterns.length,
        blockedModelsCount: blockedModels.length,
        thresholds,
        lastUpdate: new Date(),
      };
    } catch (error) {
      console.error('[SecurityConfig] Failed to get status:', error);
      return {
        configured: false,
        patternsCount: 0,
        blockedModelsCount: 0,
        thresholds: SecurityConfig.getDefaultThresholds(),
        lastUpdate: new Date(),
      };
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Export class as default
export default SecurityConfig;

// Export convenience functions
export const getJailbreakPatterns = () => SecurityConfig.getJailbreakPatterns();
export const getBlockedModelNames = () => SecurityConfig.getBlockedModelNames();
export const getThresholds = () => SecurityConfig.getThresholds();
export const isModelBlocked = (modelName: string) => SecurityConfig.isModelBlocked(modelName);
export const reloadConfig = () => SecurityConfig.reloadAll();
