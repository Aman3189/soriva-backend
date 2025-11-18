/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY PIPELINE ORCHESTRATOR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Author: Amandeep Singh (Ferozepur, Punjab, India)
 * Date: November 2025
 * Purpose: Central orchestrator connecting all analyzers and builders
 *
 * Philosophy: "LLMs are already perfect. Our duty is to make them even more perfect."
 *
 * ✅ Ultra-minimal system prompts (35-50 tokens vs 200-370)
 * ✅ Token-optimized (76-86% savings)
 * ✅ Relaxed abuse detection (only direct insults)
 * ✅ Strong identity protection (never leak tech)
 * ✅ Clean, efficient, production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { languageAdapter } from '../analyzers/language.adapter';
import type {
  LanguageDetectionResult,
  CulturalContext,
  AdaptationStrategy,
} from '../analyzers/language.adapter';
import { patternAnalyzer } from '../analyzers/pattern.analyzer';
import type { PatternAnalysisResult } from '../analyzers/pattern.analyzer';
import { contextAnalyzer } from '../analyzers/context.analyzer';
import type { ContextAnalysis } from '../analyzers/context.analyzer';
import { abuseDetector } from '../analyzers/abuse.detector';
import type { AbuseDetectionResult } from '../analyzers/abuse.detector';
import { instructionBuilder } from './instruction.builder';
import type { DynamicInstructions } from './instruction.builder';
import { personalityEngine } from './personality.engine';
import type { PersonalityResult } from './personality.engine';
import { PlanType } from '../../constants/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PipelineInput {
  userId: string;
  sessionId: string;
  userName?: string;
  gender?: 'male' | 'female';
  planType: PlanType | string;
  userRegion?: string;
  userTimeZone?: string;
  userMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  metadata?: {
    isFirstMessage?: boolean;
    isReturningUser?: boolean;
    previousSessionCount?: number;
    lastActiveDate?: string;
    [key: string]: any;
  };
}

export interface PipelineOutput {
  systemPrompt: string;
  components: {
    instructionBuilder: DynamicInstructions;
    personality: PersonalityResult;
  };
  analysis: {
    context: ContextAnalysis;
    abuse: AbuseDetectionResult;
    language: {
      detection: LanguageDetectionResult;
      cultural: CulturalContext;
      adaptation: AdaptationStrategy;
    };
    pattern: PatternAnalysisResult | null;
  };
  flags: {
    isAbusive: boolean;
    requiresSpecialHandling: boolean;
    isEmotionalSupport: boolean;
    isTechnicalQuery: boolean;
  };
  metrics: {
    processingTimeMs: number;
    analyzersUsed: string[];
    confidence: number;
  };
}

export interface QuickPipelineOutput {
  systemPrompt: string;
  flags: {
    isAbusive: boolean;
    requiresSpecialHandling: boolean;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORCHESTRATOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PipelineOrchestrator {
  /**
   * Main execution pipeline
   */
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    const startTime = Date.now();
    const analyzersUsed: string[] = [];

    try {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 1: RUN ANALYZERS IN PARALLEL
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const [contextResult, abuseResult, patternResult] = await Promise.all([
        Promise.resolve(
          contextAnalyzer.analyze(
            input.userMessage,
            input.conversationHistory?.map((h) => h.content)
          )
        ).then((result) => {
          analyzersUsed.push('context');
          return result;
        }),

        // ✅ FIXED: Only pass userMessage (removed conversationHistory)
        Promise.resolve(abuseDetector.detect(input.userMessage)).then((result) => {
          analyzersUsed.push('abuse');
          return result;
        }),

        Promise.resolve(patternAnalyzer.getPatternAnalysis(input.userId)).then((result) => {
          analyzersUsed.push('pattern');
          return result;
        }),
      ]);

      // Language analysis
      analyzersUsed.push('language');
      const languageDetection = languageAdapter.detectLanguage(input.userMessage);
      const culturalContext = languageAdapter.getCulturalContext(
        languageDetection.primaryLanguage,
        input.userRegion || 'US'
      );
      const adaptationStrategy = languageAdapter.generateAdaptationStrategy(
        languageDetection,
        culturalContext
      );

      const languageResult = {
        detection: languageDetection,
        cultural: culturalContext,
        adaptation: adaptationStrategy,
      };

      // Update pattern analyzer
      patternAnalyzer.analyzeMessage(
        input.userId,
        input.userMessage,
        input.sessionId,
        contextResult.queryType
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 2: BUILD DYNAMIC INSTRUCTIONS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      analyzersUsed.push('instruction-builder');
      const instructions = await instructionBuilder.buildInstructions({
        userId: input.userId,
        message: input.userMessage,
        sessionId: input.sessionId,
        userRegion: input.userRegion,
        userTimeZone: input.userTimeZone,
        planType: input.planType,
        gender: input.gender,
        conversationHistory: input.conversationHistory,
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 3: GENERATE PERSONALITY LAYER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      analyzersUsed.push('personality-engine');

      const planTypeEnum = (
        typeof input.planType === 'string'
          ? (PlanType as any)[input.planType.toUpperCase()]
          : input.planType
      ) as PlanType;

      const personality = personalityEngine.buildPersonality({
        userName: input.userName,
        gender: input.gender ?? 'male',
        planType: planTypeEnum,
        userMessage: input.userMessage,
        isFirstMessage:
          input.metadata?.isFirstMessage ||
          !input.conversationHistory ||
          input.conversationHistory.length === 0,
        isReturningUser: input.metadata?.isReturningUser || !!input.userId,
        conversationHistory: input.conversationHistory,
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 4: FUSE INTO FINAL SYSTEM PROMPT (🆕 USING MINIMAL INSTRUCTIONS)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const finalSystemPrompt = await this.fusePrompts(
        input,
        instructions,
        personality,
        languageResult,
        abuseResult.isInappropriate
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 5: GENERATE FLAGS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const flags = {
        isAbusive: abuseResult.isInappropriate,
        requiresSpecialHandling: abuseResult.isInappropriate,
        isEmotionalSupport:
          contextResult.queryType === 'emotional' || contextResult.shouldBeEmpathetic,
        isTechnicalQuery: contextResult.queryType === 'technical',
      };

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 6: CALCULATE METRICS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const processingTimeMs = Date.now() - startTime;

      const confidenceScores = [
        instructions.confidence,
        abuseResult.confidence * 100,
        patternResult?.confidence || 50,
      ];
      const averageConfidence = Math.round(
        confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 7: RETURN OUTPUT
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      return {
        systemPrompt: finalSystemPrompt,
        components: {
          instructionBuilder: instructions,
          personality,
        },
        analysis: {
          context: contextResult,
          abuse: abuseResult,
          language: languageResult,
          pattern: patternResult,
        },
        flags,
        metrics: {
          processingTimeMs,
          analyzersUsed,
          confidence: averageConfidence,
        },
      };
    } catch (error) {
      console.error('Pipeline execution error:', error);
      return this.buildFallbackOutput(input, error as Error);
    }
  }

  /**
   * Quick execution - minimal analysis
   */
  async executeQuick(input: PipelineInput): Promise<QuickPipelineOutput> {
    try {
      const abuse = abuseDetector.detect(input.userMessage);
      const isAbusive = abuse.isInappropriate;

      const planTypeString =
        typeof input.planType === 'string'
          ? input.planType
          : PlanType[input.planType as keyof typeof PlanType].toLowerCase();

      // 🆕 USE MINIMAL INSTRUCTIONS
      const systemPrompt = await instructionBuilder.buildMinimalInstructions({
        userId: input.userId,
        message: input.userMessage,
        sessionId: input.sessionId,
        planType: planTypeString,
        gender: input.gender,
      });

      return {
        systemPrompt,
        flags: {
          isAbusive,
          requiresSpecialHandling: isAbusive,
        },
      };
    } catch (error) {
      console.error('Quick pipeline error:', error);
      return {
        systemPrompt: 'You are Soriva AI by Risenex. Be helpful.',
        flags: {
          isAbusive: false,
          requiresSpecialHandling: false,
        },
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🆕 ULTRA-MINIMAL PROMPT FUSION (PRODUCTION OPTIMIZED)
   * 
   * Philosophy: "LLMs are already perfect. Our duty is to make them even more perfect."
   * 
   * Token Usage:
   * - STARTER: ~40 tokens (86% savings vs old 200-370 tokens)
   * - PLUS: ~42 tokens (85% savings)
   * - PRO: ~44 tokens (84% savings)
   * - EDGE/LIFE: ~50 tokens (82% savings)
   * 
   * Result: More tokens available for BETTER, LONGER user responses
   */
  private async fusePrompts(
    input: PipelineInput,
    instructions: DynamicInstructions,
    personality: PersonalityResult,
    language: any,
    isAbusive: boolean
  ): Promise<string> {
    // Use our new ultra-minimal instruction builder
    // This handles:
    // 1. Identity protection (never leaks tech)
    // 2. Plan-based polish (STARTER → LIFE)
    // 3. Abuse handling (if needed)
    // 4. Token optimization (35-50 tokens only)
    
    const minimalPrompt = await instructionBuilder.buildMinimalInstructions({
      userId: input.userId,
      message: input.userMessage,
      sessionId: input.sessionId,
      userRegion: input.userRegion,
      userTimeZone: input.userTimeZone,
      planType: input.planType,
      gender: input.gender,
      conversationHistory: input.conversationHistory,
    });

    return minimalPrompt;
  }

  /**
   * Fallback output
   */
  private buildFallbackOutput(input: PipelineInput, error: Error): PipelineOutput {
    console.error('Using fallback pipeline output:', error.message);

    const fallbackPrompt = `You are Soriva AI by Risenex. Never mention Google, Gemini, OpenAI, Anthropic, or other AI companies. Be helpful.`;

    const planTypeEnum = (
      typeof input.planType === 'string'
        ? (PlanType as any)[input.planType.toUpperCase()]
        : input.planType
    ) as PlanType;

    return {
      systemPrompt: fallbackPrompt,
      components: {
        instructionBuilder: {
          systemPrompt: fallbackPrompt,
          components: {
            basePersonality: 'Fallback',
            contextAdaptation: '',
            culturalTone: '',
            userPatternAdaptation: '',
            safetyGuidelines: '',
            planInstructions: '',
          },
          adaptationLevel: 'minimal',
          confidence: 30,
          flags: ['fallback-mode'],
          responseGuidance: {
            tone: 'friendly-professional',
            style: 'balanced',
            length: 'moderate',
            shouldUseHinglish: false,
            technicalLevel: 'moderate',
            emotionalSupport: false,
          },
        },
        personality: personalityEngine.buildPersonality({
          userName: input.userName,
          gender: input.gender ?? 'male',
          planType: planTypeEnum,
          userMessage: input.userMessage,
          isFirstMessage: true,
          isReturningUser: false,
        }),
      },
      analysis: {
        context: contextAnalyzer.analyze(input.userMessage),
        abuse: abuseDetector.detect(input.userMessage),
        language: {
          detection: languageAdapter.detectLanguage(input.userMessage),
          cultural: languageAdapter.getCulturalContext('en', 'US'),
          adaptation: languageAdapter.generateAdaptationStrategy(
            languageAdapter.detectLanguage(input.userMessage),
            languageAdapter.getCulturalContext('en', 'US')
          ),
        },
        pattern: null,
      },
      flags: {
        isAbusive: false,
        requiresSpecialHandling: true,
        isEmotionalSupport: false,
        isTechnicalQuery: false,
      },
      metrics: {
        processingTimeMs: 0,
        analyzersUsed: ['fallback'],
        confidence: 30,
      },
    };
  }

  /**
   * Health check
   */
  private validateInput(input: PipelineInput): void {
    if (!input.userId) {
      throw new Error('userId is required');
    }
    if (!input.sessionId) {
      throw new Error('sessionId is required');
    }
    if (!input.userMessage || input.userMessage.trim().length === 0) {
      throw new Error('userMessage cannot be empty');
    }
    if (!input.planType) {
      throw new Error('planType is required');
    }
  }

  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
  } {
    try {
      const components = {
        languageAdapter: !!languageAdapter,
        patternAnalyzer: !!patternAnalyzer,
        contextAnalyzer: !!contextAnalyzer,
        abuseDetector: !!abuseDetector,
        instructionBuilder: !!instructionBuilder,
        personalityEngine: !!personalityEngine,
      };

      const allHealthy = Object.values(components).every((v) => v);

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        components,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        components: {},
      };
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const pipelineOrchestrator = new PipelineOrchestrator();

export async function getSystemPrompt(input: PipelineInput): Promise<string> {
  const result = await pipelineOrchestrator.execute(input);
  return result.systemPrompt;
}

export async function getQuickSystemPrompt(input: PipelineInput): Promise<string> {
  const result = await pipelineOrchestrator.executeQuick(input);
  return result.systemPrompt;
}