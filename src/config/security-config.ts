// src/config/security-config.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA BACKEND - DYNAMIC SECURITY CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Purpose: Database-driven security configuration with type safety
// Pattern: FUNCTIONAL (config file)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import configService from '../services/ai/config.service';
import {
  SecurityPattern,
  BlockedModelName,
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
  blockDuration: number;
}

export interface SecurityThresholds {
  jailbreakConfidence: number;
  contentModerationScore: number;
  promptSanitizerRisk: number;
  maxPromptLength: number;
  maxResponseLength: number;
}

export interface SecurityStatus {
  configured: boolean;
  patternsCount: number;
  blockedModelsCount: number;
  thresholds: SecurityThresholds;
  lastUpdate: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT VALUES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_JAILBREAK_PATTERNS: JailbreakPattern[] = [
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

const DEFAULT_BLOCKED_MODELS: string[] = [
  'gpt-4', 'gpt-3.5', 'claude', 'gemini', 'llama', 'palm'
];

const DEFAULT_THRESHOLDS: SecurityThresholds = {
  jailbreakConfidence: 0.7,
  contentModerationScore: 0.8,
  promptSanitizerRisk: 0.75,
  maxPromptLength: 4000,
  maxResponseLength: 8000,
};

const DEFAULT_CONTENT_MODERATION: ContentModerationConfig = {
  enabled: true,
  blockedModels: [],
  strictMode: false,
  allowExceptions: false,
};

const DEFAULT_PROMPT_SANITIZER: PromptSanitizerConfig = {
  enabled: true,
  maxLength: 4000,
  stripHtml: true,
  normalizeWhitespace: true,
  removeControlChars: true,
};

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  enabled: true,
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  requestsPerDay: 10000,
  blockDuration: 300,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JAILBREAK PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getJailbreakPatterns(): Promise<JailbreakPattern[]> {
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
    return DEFAULT_JAILBREAK_PATTERNS;
  }
}

export async function getPatternsByCategory(category: string): Promise<JailbreakPattern[]> {
  try {
    const allPatterns = await getJailbreakPatterns();
    return allPatterns.filter((p) => p.category === category);
  } catch (error) {
    console.error(`[SecurityConfig] Failed to load patterns for category ${category}:`, error);
    return [];
  }
}

export async function getPatternsBySeverity(severity: string): Promise<JailbreakPattern[]> {
  try {
    const allPatterns = await getJailbreakPatterns();
    return allPatterns.filter((p) => p.severity === severity);
  } catch (error) {
    console.error(`[SecurityConfig] Failed to load patterns for severity ${severity}:`, error);
    return [];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOCKED MODEL NAMES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getBlockedModelNames(): Promise<string[]> {
  try {
    const blockedModels = await configService.getBlockedModelNames();
    return blockedModels.map((m: BlockedModelName) => m.modelName);
  } catch (error) {
    console.error('[SecurityConfig] Failed to load blocked models:', error);
    return DEFAULT_BLOCKED_MODELS;
  }
}

export async function isModelBlocked(modelName: string): Promise<boolean> {
  try {
    const blockedModels = await getBlockedModelNames();
    const normalizedName = modelName.toLowerCase().trim();
    return blockedModels.some((blocked) => normalizedName.includes(blocked.toLowerCase()));
  } catch (error) {
    console.error('[SecurityConfig] Failed to check model block status:', error);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECURITY THRESHOLDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getThresholds(): Promise<SecurityThresholds> {
  try {
    const config = await configService.getSecurityConfig('thresholds');
    if (!config) return DEFAULT_THRESHOLDS;

    const thresholds = config.value as Record<string, number>;
    return {
      jailbreakConfidence: thresholds.jailbreakConfidence || 0.7,
      contentModerationScore: thresholds.contentModerationScore || 0.8,
      promptSanitizerRisk: thresholds.promptSanitizerRisk || 0.75,
      maxPromptLength: thresholds.maxPromptLength || 4000,
      maxResponseLength: thresholds.maxResponseLength || 8000,
    };
  } catch (error) {
    console.error('[SecurityConfig] Failed to load thresholds:', error);
    return DEFAULT_THRESHOLDS;
  }
}

export async function getThreshold(key: keyof SecurityThresholds): Promise<number> {
  try {
    const thresholds = await getThresholds();
    return thresholds[key];
  } catch (error) {
    console.error(`[SecurityConfig] Failed to get threshold ${key}:`, error);
    return 0.7;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTENT MODERATION CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getContentModerationConfig(): Promise<ContentModerationConfig> {
  try {
    const config = await configService.getSecurityConfig('content_moderation');
    const blockedModels = await getBlockedModelNames();

    if (!config) {
      return { ...DEFAULT_CONTENT_MODERATION, blockedModels };
    }

    const settings = config.value as Record<string, unknown>;
    return {
      enabled: settings.enabled !== false,
      blockedModels,
      strictMode: (settings.strictMode as boolean) || false,
      allowExceptions: (settings.allowExceptions as boolean) || false,
    };
  } catch (error) {
    console.error('[SecurityConfig] Failed to load content moderation config:', error);
    return DEFAULT_CONTENT_MODERATION;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMPT SANITIZER CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getPromptSanitizerConfig(): Promise<PromptSanitizerConfig> {
  try {
    const config = await configService.getSecurityConfig('prompt_sanitizer');
    if (!config) return DEFAULT_PROMPT_SANITIZER;

    const settings = config.value as Record<string, unknown>;
    return {
      enabled: settings.enabled !== false,
      maxLength: (settings.maxLength as number) || 4000,
      stripHtml: settings.stripHtml !== false,
      normalizeWhitespace: settings.normalizeWhitespace !== false,
      removeControlChars: settings.removeControlChars !== false,
    };
  } catch (error) {
    console.error('[SecurityConfig] Failed to load prompt sanitizer config:', error);
    return DEFAULT_PROMPT_SANITIZER;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RATE LIMITING CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getRateLimitConfig(): Promise<RateLimitConfig> {
  try {
    const config = await configService.getSecurityConfig('rate_limit');
    if (!config) return DEFAULT_RATE_LIMIT;

    const settings = config.value as Record<string, unknown>;
    return {
      enabled: settings.enabled !== false,
      requestsPerMinute: (settings.requestsPerMinute as number) || 60,
      requestsPerHour: (settings.requestsPerHour as number) || 1000,
      requestsPerDay: (settings.requestsPerDay as number) || 10000,
      blockDuration: (settings.blockDuration as number) || 300,
    };
  } catch (error) {
    console.error('[SecurityConfig] Failed to load rate limit config:', error);
    return DEFAULT_RATE_LIMIT;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function reloadConfig(): Promise<void> {
  try {
    await configService.reloadConfig();
    console.log('[SecurityConfig] All configurations reloaded');
  } catch (error) {
    console.error('[SecurityConfig] Failed to reload configurations:', error);
    throw error;
  }
}

export async function isConfigured(): Promise<boolean> {
  try {
    const patterns = await getJailbreakPatterns();
    const thresholds = await getThresholds();
    return patterns.length > 0 && thresholds.jailbreakConfidence > 0;
  } catch (error) {
    console.error('[SecurityConfig] Configuration check failed:', error);
    return false;
  }
}

export async function getStatus(): Promise<SecurityStatus> {
  try {
    const patterns = await getJailbreakPatterns();
    const blockedModels = await getBlockedModelNames();
    const thresholds = await getThresholds();

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
      thresholds: DEFAULT_THRESHOLDS,
      lastUpdate: new Date(),
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAMESPACE EXPORT (for backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SecurityConfig = {
  getJailbreakPatterns,
  getPatternsByCategory,
  getPatternsBySeverity,
  getBlockedModelNames,
  isModelBlocked,
  getThresholds,
  getThreshold,
  getContentModerationConfig,
  getPromptSanitizerConfig,
  getRateLimitConfig,
  reloadAll: reloadConfig,
  isConfigured,
  getStatus,
} as const;

export default SecurityConfig;