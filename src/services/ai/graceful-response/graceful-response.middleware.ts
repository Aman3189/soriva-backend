/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GRACEFUL RESPONSE MIDDLEWARE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Updated: November 16, 2025 (Phase 2 - AI Regeneration)
 * Purpose: Orchestrate conflict detection, validation, and regeneration
 *
 * Phase 1: Detection + Validation ✅
 * Phase 2: AI-powered dynamic correction ✅ (IMPLEMENTED!)
 *
 * Features:
 * - Conflict detection
 * - Response validation
 * - AI-powered regeneration (NEW!)
 * - Analytics tracking
 * - Graceful degradation
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import {
  ConflictDetectorService,
  ConflictAnalysis,
  ConflictType,
  conflictDetector,
} from './conflict-detector.service';
import {
  ResponseValidatorService,
  ValidationResult,
  ViolationSeverity,
  responseValidator,
} from './response-validator.service';
import { responseRegenerator } from './response-regenerator.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GracefulResponseResult {
  finalResponse: string;
  wasModified: boolean;
  needsRegeneration: boolean; // ⭐ NEW: Flag for AI service
  regenerationPrompts?: {     // ⭐ NEW: Prompts for regeneration
    systemPrompt: string;
    userPrompt: string;
  };
  analytics: {
    conflictDetected: boolean;
    conflictType: ConflictType | null;
    conflictSeverity: string | null;
    userIntent: string | null;
    validationScore: number;
    passedValidation: boolean;
    criticalViolations: number;
    suggestedAction: string | null;
    processingTimeMs: number;
  };
  violations?: Array<{
    type: string;
    severity: string;
    evidence: string;
  }>;
}

export interface MiddlewareConfig {
  enableValidation: boolean;
  enableCorrection: boolean; // Phase 2 feature (NOW ENABLED!)
  minValidationScore: number; // Minimum acceptable score
  logViolations: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRACEFUL RESPONSE MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class GracefulResponseMiddleware {
  private config: MiddlewareConfig;
  private detector: ConflictDetectorService;
  private validator: ResponseValidatorService;
  private violationLog: Array<any> = []; // For analytics
  private lastRegenerationPrompts: { systemPrompt: string; userPrompt: string } | null = null; // ⭐ NEW

  constructor(config: Partial<MiddlewareConfig> = {}) {
    this.config = {
      enableValidation: true,
      enableCorrection: true, // ⭐ Phase 2: NOW ENABLED!
      minValidationScore: 75,
      logViolations: true,
      ...config,
    };

    this.detector = conflictDetector;
    this.validator = responseValidator;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN PROCESSING METHOD (PHASE 2 - WITH REGENERATION)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Process user message and AI response
   * ⭐ Phase 2: Detection + Validation + Regeneration Preparation
   */
  public async process(userMessage: string, aiResponse: string): Promise<GracefulResponseResult> {
    const startTime = Date.now();

    try {
      // Step 1: Detect conflict in user message
      const conflictAnalysis = this.detector.analyze(userMessage);

      // If no conflict, return as-is
      if (!conflictAnalysis.hasConflict) {
        return this.createSuccessResult(aiResponse, conflictAnalysis, null, startTime, false);
      }

      console.log('[GracefulMiddleware] 🔍 Conflict detected:', {
        type: conflictAnalysis.type,
        severity: conflictAnalysis.severity,
        intent: conflictAnalysis.userIntent,
      });

      // Step 2: Validate AI response (if validation enabled)
      let validationResult: ValidationResult | null = null;

      if (this.config.enableValidation) {
        validationResult = this.validator.validate(aiResponse, conflictAnalysis.type);

        console.log('[GracefulMiddleware] ✅ Validation result:', {
          score: validationResult.score,
          isValid: validationResult.isValid,
          violations: validationResult.violations.length,
        });

        // Log violations if enabled
        if (this.config.logViolations && !validationResult.isValid) {
          this.logViolation({
            userMessage,
            aiResponse,
            conflictAnalysis,
            validationResult,
            timestamp: new Date(),
          });
        }
      }

      // Step 3: Check if response needs correction
      const needsCorrection =
        this.config.enableCorrection &&
        validationResult &&
        validationResult.score < this.config.minValidationScore;

      // ⭐ Phase 2: Prepare regeneration prompts if needed
      if (needsCorrection) {
        console.log('[GracefulMiddleware] 🔄 Response needs regeneration!', {
          score: validationResult?.score,
          violations: validationResult?.violations.length,
        });

        // Prepare regeneration context
        const regenerationContext = {
          originalMessage: userMessage,
          failedResponse: aiResponse,
          conflictType: conflictAnalysis.type || 'general',
          violations: validationResult!.violations.map((v) => ({
            rule: v.type,
            severity: v.severity,
            description: v.evidence,
          })),
          userIntent: conflictAnalysis.userIntent || 'unknown',
          conversationHistory: undefined,
        };

        // Get regeneration prompts
        const prompts = responseRegenerator.getRegenerationPrompts(regenerationContext);
        this.lastRegenerationPrompts = prompts;

        console.log('[GracefulMiddleware] 📋 Regeneration prompts prepared');
        console.log('[GracefulMiddleware] 🎯 System Rules (preview):', 
          prompts.systemPrompt.substring(0, 150) + '...');

        // Return result with regeneration prompts
        return this.createRegenerationResult(
          aiResponse,
          conflictAnalysis,
          validationResult!,
          prompts,
          startTime
        );
      }

      // No regeneration needed
      return this.createSuccessResult(aiResponse, conflictAnalysis, validationResult, startTime, false);
    } catch (error) {
      // Graceful degradation - return original response on error
      console.error('[GracefulMiddleware] ❌ Error processing response:', error);
      return this.createErrorResult(aiResponse, startTime);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESULT BUILDERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private createSuccessResult(
    response: string,
    conflictAnalysis: ConflictAnalysis,
    validationResult: ValidationResult | null,
    startTime: number,
    wasRegenerated: boolean
  ): GracefulResponseResult {
    const criticalViolations = validationResult
      ? validationResult.violations.filter((v) => v.severity === ViolationSeverity.CRITICAL).length
      : 0;

    return {
      finalResponse: response,
      wasModified: wasRegenerated,
      needsRegeneration: false,
      analytics: {
        conflictDetected: conflictAnalysis.hasConflict,
        conflictType: conflictAnalysis.type,
        conflictSeverity: conflictAnalysis.hasConflict ? conflictAnalysis.severity : null,
        userIntent: conflictAnalysis.hasConflict ? conflictAnalysis.userIntent : null,
        validationScore: validationResult?.score || 100,
        passedValidation: validationResult?.isValid ?? true,
        criticalViolations,
        suggestedAction: conflictAnalysis.hasConflict ? conflictAnalysis.suggestedAction : null,
        processingTimeMs: Date.now() - startTime,
      },
      violations: validationResult?.violations.map((v) => ({
        type: v.type,
        severity: v.severity,
        evidence: v.evidence,
      })),
    };
  }

  // ⭐ NEW: Create result with regeneration prompts
  private createRegenerationResult(
    response: string,
    conflictAnalysis: ConflictAnalysis,
    validationResult: ValidationResult,
    prompts: { systemPrompt: string; userPrompt: string },
    startTime: number
  ): GracefulResponseResult {
    const criticalViolations = validationResult.violations.filter(
      (v) => v.severity === ViolationSeverity.CRITICAL
    ).length;

    return {
      finalResponse: response, // Original response (will be replaced by AI service)
      wasModified: false,
      needsRegeneration: true, // ⭐ Signal AI service to regenerate
      regenerationPrompts: prompts, // ⭐ Provide prompts for regeneration
      analytics: {
        conflictDetected: conflictAnalysis.hasConflict,
        conflictType: conflictAnalysis.type,
        conflictSeverity: conflictAnalysis.severity,
        userIntent: conflictAnalysis.userIntent,
        validationScore: validationResult.score,
        passedValidation: validationResult.isValid,
        criticalViolations,
        suggestedAction: conflictAnalysis.suggestedAction,
        processingTimeMs: Date.now() - startTime,
      },
      violations: validationResult.violations.map((v) => ({
        type: v.type,
        severity: v.severity,
        evidence: v.evidence,
      })),
    };
  }

  private createErrorResult(response: string, startTime: number): GracefulResponseResult {
    return {
      finalResponse: response,
      wasModified: false,
      needsRegeneration: false,
      analytics: {
        conflictDetected: false,
        conflictType: null,
        conflictSeverity: null,
        userIntent: null,
        validationScore: 0,
        passedValidation: false,
        criticalViolations: 0,
        suggestedAction: null,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REGENERATION HELPERS (NEW!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get last regeneration prompts (for AI service)
   */
  public getLastRegenerationPrompts(): { systemPrompt: string; userPrompt: string } | null {
    return this.lastRegenerationPrompts;
  }

  /**
   * Clear regeneration prompts
   */
  public clearRegenerationPrompts(): void {
    this.lastRegenerationPrompts = null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOGGING & ANALYTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private logViolation(data: {
    userMessage: string;
    aiResponse: string;
    conflictAnalysis: ConflictAnalysis;
    validationResult: ValidationResult;
    timestamp: Date;
  }): void {
    this.violationLog.push(data);

    // Keep only last 100 entries (or move to database)
    if (this.violationLog.length > 100) {
      this.violationLog = this.violationLog.slice(-100);
    }

    // Log to console for debugging
    console.log('[GracefulMiddleware] 📝 Violation logged:', {
      conflictType: data.conflictAnalysis.type,
      score: data.validationResult.score,
      violations: data.validationResult.violations.length,
      criticalViolations: data.validationResult.violations.filter(
        (v) => v.severity === ViolationSeverity.CRITICAL
      ).length,
    });
  }

  /**
   * Get violation analytics (for monitoring)
   */
  public getViolationStats(): {
    totalViolations: number;
    byConflictType: Record<string, number>;
    avgValidationScore: number;
    criticalViolationsCount: number;
  } {
    if (this.violationLog.length === 0) {
      return {
        totalViolations: 0,
        byConflictType: {},
        avgValidationScore: 100,
        criticalViolationsCount: 0,
      };
    }

    const byConflictType: Record<string, number> = {};
    let totalScore = 0;
    let criticalCount = 0;

    for (const log of this.violationLog) {
      const type = log.conflictAnalysis.type;
      byConflictType[type] = (byConflictType[type] || 0) + 1;
      totalScore += log.validationResult.score;

      const critical = log.validationResult.violations.filter(
        (v: any) => v.severity === ViolationSeverity.CRITICAL
      ).length;
      criticalCount += critical;
    }

    return {
      totalViolations: this.violationLog.length,
      byConflictType,
      avgValidationScore: totalScore / this.violationLog.length,
      criticalViolationsCount: criticalCount,
    };
  }

  /**
   * Clear violation log
   */
  public clearViolationLog(): void {
    this.violationLog = [];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Update middleware configuration
   */
  public updateConfig(config: Partial<MiddlewareConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): MiddlewareConfig {
    return { ...this.config };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const gracefulMiddleware = new GracefulResponseMiddleware({
  enableValidation: true,
  enableCorrection: true, // ⭐ Phase 2: ENABLED!
  minValidationScore: 75,
  logViolations: true,
});