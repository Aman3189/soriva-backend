// src/services/security/index.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ SECURITY MODULE - EXPORT AGGREGATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Purpose: Central export point for all security services
// Architecture: Clean imports, organized exports
// Phase: 2 (Dynamic Security System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE SERVICES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Jailbreak Detection Service
import JailbreakDetectorInstance from './core/jailbreak-detector';

// Create a wrapper that maps to actual methods
const JailbreakDetector = {
  // Map detect() to analyze()
  detect: async (input: string, userId?: string, conversationId?: string, ipAddress?: string) => {
    return JailbreakDetectorInstance.analyze(input, {
      userId,
      context: conversationId,
      ipAddress,
    });
  },

  // Map quickCheck() to isInputSafe()
  quickCheck: async (input: string) => {
    const isSafe = await JailbreakDetectorInstance.isInputSafe(input);
    return {
      isSafe,
      reason: isSafe ? undefined : 'Suspicious pattern detected',
    };
  },

  // Map reloadCache() to reloadPatterns()
  reloadCache: async () => {
    await JailbreakDetectorInstance.reloadPatterns();
  },

  // Map cleanup() to clearCache()
  cleanup: async () => {
    JailbreakDetectorInstance.clearCache();
  },

  // Pass through other methods
  getStats: () => JailbreakDetectorInstance.getStats(),
  analyze: (input: string, options?: any) => JailbreakDetectorInstance.analyze(input, options),
  isInputSafe: (input: string, userId?: string) =>
    JailbreakDetectorInstance.isInputSafe(input, userId),
};

export { JailbreakDetector };
export default JailbreakDetector;

// Content Moderation Service
import contentModeratorInstance, { ContentModeratorService } from './core/content-moderator';
export { contentModeratorInstance as contentModerator, ContentModeratorService };

// Prompt Sanitization Service
import promptSanitizerInstance, { PromptSanitizerService } from './core/prompt-sanitizer';
export { promptSanitizerInstance as promptSanitizer, PromptSanitizerService };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE EXPORTS - CONTENT MODERATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
  ModerationResult,
  ModerationFlag,
  ContentIssue,
  PIIDetection,
  RemovedEntity,
  ModerationCategory,
} from './core/content-moderator';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE EXPORTS - PROMPT SANITIZER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
  SanitizationResult,
  SanitizationModification,
  ModificationType,
  SanitizationOptions,
  SuspiciousAnalysis,
} from './core/prompt-sanitizer';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UNIFIED SECURITY SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Unified Security Service
 * Provides easy access to all security services
 */
export class UnifiedSecurityService {
  private static instance: UnifiedSecurityService;

  // Service instances with explicit typing
  public readonly jailbreakDetector = JailbreakDetector;
  public readonly contentModerator = contentModeratorInstance;
  public readonly promptSanitizer = promptSanitizerInstance;

  private constructor() {
    console.log('[UnifiedSecurity] ✅ All security services initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): UnifiedSecurityService {
    if (!UnifiedSecurityService.instance) {
      UnifiedSecurityService.instance = new UnifiedSecurityService();
    }
    return UnifiedSecurityService.instance;
  }

  /**
   * Complete security check pipeline
   * Runs all security checks in sequence
   */
  public async checkInput(
    input: string,
    context: {
      userId?: string;
      conversationId?: string;
      ipAddress?: string;
    }
  ): Promise<{
    isSecure: boolean;
    jailbreak: any;
    moderation: any;
    sanitization: any;
    suspicious: any;
    shouldBlock: boolean;
    blockReason?: string;
  }> {
    try {
      // Step 1: Jailbreak detection
      const jailbreak = await this.jailbreakDetector.detect(
        input,
        context.userId,
        context.conversationId,
        context.ipAddress
      );

      if (jailbreak.isBlocked) {
        return {
          isSecure: false,
          jailbreak,
          moderation: null,
          sanitization: null,
          suspicious: null,
          shouldBlock: true,
          blockReason: 'Jailbreak attempt detected',
        };
      }

      // Step 2: Sanitize input
      const sanitization = await this.promptSanitizer.sanitize(input);

      // Step 3: Check if suspicious
      const suspicious = await this.promptSanitizer.isSuspicious(
        sanitization.sanitized,
        context.userId
      );

      if (suspicious.suspicious && suspicious.riskScore >= 70) {
        return {
          isSecure: false,
          jailbreak,
          moderation: null,
          sanitization,
          suspicious,
          shouldBlock: true,
          blockReason: `High-risk input detected (${suspicious.riskScore}/100)`,
        };
      }

      // Step 4: Content moderation
      const moderation = await this.contentModerator.moderateContent(sanitization.sanitized, {
        userId: context.userId,
        isUserInput: true,
        checkModelNames: false, // Don't check model names in user input
        checkPII: true,
        checkToxicity: true,
        checkMalicious: true,
        checkHarmful: true,
        redactPII: true,
      });

      if (!moderation.isClean && moderation.contentScore < 50) {
        return {
          isSecure: false,
          jailbreak,
          moderation,
          sanitization,
          suspicious,
          shouldBlock: true,
          blockReason: 'Content safety score too low',
        };
      }

      // All checks passed
      return {
        isSecure: true,
        jailbreak,
        moderation,
        sanitization,
        suspicious,
        shouldBlock: false,
      };
    } catch (error) {
      console.error('[UnifiedSecurity] Error during security check:', error);
      return {
        isSecure: false,
        jailbreak: null,
        moderation: null,
        sanitization: null,
        suspicious: null,
        shouldBlock: true,
        blockReason: 'Security check failed',
      };
    }
  }

  /**
   * Quick security check (faster, less comprehensive)
   */
  public async quickCheck(input: string): Promise<{
    isSafe: boolean;
    sanitized: string;
    reason?: string;
  }> {
    try {
      // Quick jailbreak check (now with await)
      const quickJailbreak = await this.jailbreakDetector.quickCheck(input);
      if (!quickJailbreak.isSafe) {
        return {
          isSafe: false,
          sanitized: '',
          reason: quickJailbreak.reason,
        };
      }

      // Quick sanitization
      const sanitized = this.promptSanitizer.quickSanitize(input);

      // Quick content safety check
      const isContentSafe = this.contentModerator.isContentSafe(sanitized);
      if (!isContentSafe) {
        return {
          isSafe: false,
          sanitized: '',
          reason: 'Content contains potentially harmful patterns',
        };
      }

      return {
        isSafe: true,
        sanitized,
      };
    } catch (error) {
      console.error('[UnifiedSecurity] Error during quick check:', error);
      return {
        isSafe: false,
        sanitized: '',
        reason: 'Security check failed',
      };
    }
  }

  /**
   * Sanitize AI response before sending to user
   */
  public async sanitizeResponse(
    response: string,
    userId?: string
  ): Promise<{
    sanitized: string;
    isModified: boolean;
    warnings: string[];
  }> {
    try {
      // Use content moderator to sanitize response
      return await this.contentModerator.sanitizeResponse(response, userId);
    } catch (error) {
      console.error('[UnifiedSecurity] Error sanitizing response:', error);
      return {
        sanitized: response,
        isModified: false,
        warnings: ['Response sanitization failed'],
      };
    }
  }

  /**
   * Get combined statistics from all services
   */
  public getStats(): {
    jailbreakDetector: any;
    contentModerator: any;
    promptSanitizer: any;
  } {
    return {
      jailbreakDetector: this.jailbreakDetector.getStats(),
      contentModerator: this.contentModerator.getStats(),
      promptSanitizer: this.promptSanitizer.getStats(),
    };
  }

  /**
   * Reload all caches (for admin updates)
   */
  public async reloadAllCaches(): Promise<void> {
    console.log('[UnifiedSecurity] 🔄 Reloading all caches...');

    await this.jailbreakDetector.reloadCache();
    await this.contentModerator.reloadCache();
    await this.promptSanitizer.reloadThresholds();

    console.log('[UnifiedSecurity] ✅ All caches reloaded');
  }

  /**
   * Cleanup all services
   */
  public async cleanup(): Promise<void> {
    console.log('[UnifiedSecurity] 🧹 Cleaning up all services...');

    await this.jailbreakDetector.cleanup();
    await this.contentModerator.cleanup();
    await this.promptSanitizer.cleanup();

    console.log('[UnifiedSecurity] ✅ All services cleaned up');
  }
}

// Export unified security instance
export const unifiedSecurity = UnifiedSecurityService.getInstance();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Quick access to all security services
 * Usage: import { security } from '@/services/security';
 */
export const security = {
  // Services
  jailbreak: JailbreakDetector,
  moderator: contentModeratorInstance,
  sanitizer: promptSanitizerInstance,
  unified: unifiedSecurity,

  // Quick methods
  checkInput: (input: string, context: any) => unifiedSecurity.checkInput(input, context),
  quickCheck: (input: string) => unifiedSecurity.quickCheck(input),
  sanitizeResponse: (response: string, userId?: string) =>
    unifiedSecurity.sanitizeResponse(response, userId),

  // Stats
  getStats: () => unifiedSecurity.getStats(),

  // Admin
  reloadCaches: () => unifiedSecurity.reloadAllCaches(),
  cleanup: () => unifiedSecurity.cleanup(),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERSION INFO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SECURITY_MODULE_VERSION = '2.0.0';
export const SECURITY_MODULE_INFO = {
  version: '2.0.0',
  phase: 2,
  architecture: 'Database-Driven Dynamic Security',
  services: ['JailbreakDetector', 'ContentModerator', 'PromptSanitizer', 'UnifiedSecurity'],
  features: [
    'Dynamic pattern loading',
    'Database-driven configs',
    'Auto-learning system',
    'Multi-layer detection',
    'Real-time threat analysis',
    'Comprehensive logging',
  ],
  author: 'Amandeep, Punjab, India',
  created: '2024',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️  SORIVA SECURITY MODULE v${SECURITY_MODULE_VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Architecture: ${SECURITY_MODULE_INFO.architecture}
Services: ${SECURITY_MODULE_INFO.services.join(', ')}
Status: ✅ All services initialized
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
