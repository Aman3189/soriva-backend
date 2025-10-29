/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY PIPELINE ORCHESTRATOR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Author: Amandeep Singh (Ferozepur, Punjab, India)
 * Date: October 2025
 * Purpose: Central orchestrator connecting all analyzers and builders
 *
 * What it does:
 * ✅ Combines all analyzer outputs
 * ✅ Generates dynamic system prompts
 * ✅ Handles safety & abuse detection
 * ✅ Manages pattern learning
 * ✅ Orchestrates personality fusion
 *
 * Flow:
 * User Input → Analyzers (parallel) → Instruction Builder →
 * Personality Engine → Final System Prompt → AI Model
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

// Import PlanType enum
import { PlanType } from '../../constants/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PipelineInput {
  // User identification
  userId: string;
  sessionId: string;
  userName?: string;

  // User attributes
  gender?: 'male' | 'female';
  planType: PlanType | string; // Accept both PlanType enum and string for flexibility
  userRegion?: string;
  userTimeZone?: string;

  // Message & context
  userMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;

  // Optional metadata
  metadata?: {
    isFirstMessage?: boolean;
    isReturningUser?: boolean;
    previousSessionCount?: number;
    lastActiveDate?: string;
    [key: string]: any;
  };
}

export interface PipelineOutput {
  // Main output - ready to use with AI
  systemPrompt: string;

  // Breakdown for debugging/logging
  components: {
    instructionBuilder: DynamicInstructions;
    personality: PersonalityResult;
  };

  // Analysis results
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

  // Flags & metadata
  flags: {
    isAbusive: boolean;
    requiresSpecialHandling: boolean;
    isEmotionalSupport: boolean;
    isTechnicalQuery: boolean;
  };

  // Performance metrics
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
   * Main execution pipeline - Full analysis with all components
   */
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    const startTime = Date.now();
    const analyzersUsed: string[] = [];

    try {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 1: RUN ALL ANALYZERS IN PARALLEL
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const [contextResult, abuseResult, patternResult] = await Promise.all([
        // Context analysis
        Promise.resolve(
          contextAnalyzer.analyze(
            input.userMessage,
            input.conversationHistory?.map((h) => h.content)
          )
        ).then((result) => {
          analyzersUsed.push('context');
          return result;
        }),

        // Abuse detection
        Promise.resolve(
          abuseDetector.detect(
            input.userMessage,
            input.conversationHistory?.map((h) => h.content)
          )
        ).then((result) => {
          analyzersUsed.push('abuse');
          return result;
        }),

        // Pattern analysis (can be null for new users)
        Promise.resolve(patternAnalyzer.getPatternAnalysis(input.userId)).then((result) => {
          analyzersUsed.push('pattern');
          return result;
        }),
      ]);

      // Language analysis (sequential because it has dependencies)
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

      // Update pattern analyzer with this message
      patternAnalyzer.analyzeMessage(
        input.userId,
        input.userMessage,
        input.sessionId,
        contextResult.queryType
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 2: CHECK FOR ABUSE / SPECIAL HANDLING
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const isAbusive = abuseResult.level !== 'none' && abuseResult.isInappropriate;
      const requiresSpecialHandling = isAbusive || abuseResult.requiresImmediateAction;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 3: BUILD DYNAMIC INSTRUCTIONS
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
      // STEP 4: GENERATE PERSONALITY LAYER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      analyzersUsed.push('personality-engine');

      // Convert planType string to PlanType enum if needed
      const planTypeEnum = (
        typeof input.planType === 'string'
          ? (PlanType as any)[input.planType.toUpperCase()]
          : input.planType
      ) as PlanType;

      const personality = personalityEngine.buildPersonality({
        userName: input.userName,
        gender: input.gender ?? 'male', // Always provide a value
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
      // STEP 5: FUSE EVERYTHING INTO FINAL SYSTEM PROMPT
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const finalSystemPrompt = this.fusePrompts(
        instructions,
        personality,
        languageResult,
        isAbusive
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 6: GENERATE FLAGS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const flags = {
        isAbusive,
        requiresSpecialHandling,
        isEmotionalSupport:
          contextResult.queryType === 'emotional' || contextResult.shouldBeEmpathetic,
        isTechnicalQuery: contextResult.queryType === 'technical',
      };

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 7: CALCULATE METRICS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const processingTimeMs = Date.now() - startTime;

      // Calculate overall confidence
      const confidenceScores = [
        instructions.confidence,
        abuseResult.confidence * 100,
        patternResult?.confidence || 50,
      ];
      const averageConfidence = Math.round(
        confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 8: RETURN COMPLETE PIPELINE OUTPUT
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

      // Fallback to safe default
      return this.buildFallbackOutput(input, error as Error);
    }
  }

  /**
   * Quick execution - minimal analysis for speed
   * Use when low latency is critical
   */
  async executeQuick(input: PipelineInput): Promise<QuickPipelineOutput> {
    try {
      // Run only essential checks
      const abuse = abuseDetector.detect(input.userMessage);
      const isAbusive = abuse.level !== 'none' && abuse.isInappropriate;

      // Use quick instruction builder (accepts string)
      const planTypeString =
        typeof input.planType === 'string'
          ? input.planType
          : PlanType[input.planType as keyof typeof PlanType].toLowerCase();

      const instructions = await instructionBuilder.buildQuickInstructions({
        userId: input.userId,
        message: input.userMessage,
        sessionId: input.sessionId,
        planType: planTypeString,
        gender: input.gender,
      });

      // Convert planType to enum for personality engine
      const planTypeEnum = (
        typeof input.planType === 'string'
          ? (PlanType as any)[input.planType.toUpperCase()]
          : input.planType
      ) as PlanType;

      // Quick personality
      const personality = personalityEngine.buildPersonality({
        userName: input.userName,
        gender: input.gender ?? 'male',
        planType: planTypeEnum,
        userMessage: input.userMessage,
        isFirstMessage: true,
        isReturningUser: false,
      });

      // Minimal fusion
      const systemPrompt = `${instructions.systemPrompt}\n\n${personality.systemPrompt}`;

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
        systemPrompt: 'You are a helpful AI assistant.',
        flags: {
          isAbusive: false,
          requiresSpecialHandling: false,
        },
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Fuse all prompts into final system prompt
   */
  private fusePrompts(
    instructions: DynamicInstructions,
    personality: PersonalityResult,
    language: {
      detection: LanguageDetectionResult;
      cultural: CulturalContext;
      adaptation: AdaptationStrategy;
    },
    isAbusive: boolean
  ): string {
    // If abusive, use only instruction builder's prompt (it has safety guidelines)
    if (isAbusive) {
      return instructions.systemPrompt;
    }

    // Normal fusion
    const sections: string[] = [];

    // 1. Personality foundation (who you are)
    sections.push(personality.systemPrompt);

    // 2. Dynamic instructions (how to respond to this specific query)
    sections.push(instructions.systemPrompt);

    // 3. Language/cultural notes (if relevant)
    if (language.detection.isCodeMixed || language.adaptation.allowHinglish) {
      sections.push(
        `Note: User speaks ${language.detection.primaryLanguage}. ${language.adaptation.toneStyle}`
      );
    }

    return sections.join('\n\n');
  }

  /**
   * Build fallback output when pipeline fails
   */
  private buildFallbackOutput(input: PipelineInput, error: Error): PipelineOutput {
    console.error('Using fallback pipeline output due to error:', error.message);

    // Create minimal safe output
    const fallbackPrompt = `You are a helpful, friendly AI assistant. The user's name is ${input.userName || 'there'}. Be respectful and helpful.`;

    // Convert planType to enum for personality engine
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
            basePersonality: 'Fallback personality',
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
   * Validate pipeline input
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

  /**
   * Get pipeline health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
  } {
    try {
      // Check if all components are accessible
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Quick function to get system prompt
 */
export async function getSystemPrompt(input: PipelineInput): Promise<string> {
  const result = await pipelineOrchestrator.execute(input);
  return result.systemPrompt;
}

/**
 * Quick function for speed-critical scenarios
 */
export async function getQuickSystemPrompt(input: PipelineInput): Promise<string> {
  const result = await pipelineOrchestrator.executeQuick(input);
  return result.systemPrompt;
}
