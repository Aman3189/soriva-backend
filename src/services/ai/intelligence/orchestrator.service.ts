/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE ORCHESTRATOR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ✅ OPTIMIZED v2.0: Parallel LLM calls for 3x faster response
 * 
 * Previous: 15s (sequential calls)
 * Target:   5-7s (parallel calls)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { MemoryService } from './memory.service';
import { ContextAnalyzerService } from './context-analyzer.service';
import { QueryProcessorService } from './query-processor.service';
import { ToneMatcherService } from './tone-matcher.service';
import { AnalogyService } from './analogy.service';
import { ProactiveService } from './proactive.service';
import { ChoiceAdvisorService } from './choice-advisor.service';
import { EmotionDetector, EmotionType } from '../emotion.detector';
import { aiService } from '../ai.service';

import {
  IntelligenceRequest,
  IntelligenceResponse,
  IntelligenceConfig,
  StoredMessage,
  MemorySummary,
  MemoryStats,
  ContextAnalysis,
  ToneAnalysis,
  GeneratedAnalogy,
  ProactiveMessage,
  ChoiceAnalysis,
  DeepUnderstanding,
  ProcessedQuery,
  LLMService,
} from './intelligence.types';

import { PlanType } from '../../../constants/plans';

const DEFAULT_CONFIG: IntelligenceConfig = {
  memory: {
    enableSemanticSearch: true,
    contextWindow: 10,
    summarizationThreshold: 50,
  },
  analogy: {
    enabled: true,
    defaultComplexity: 'moderate',
    culturalContext: 'auto',
  },
  proactive: {
    enabled: true,
    idleThresholdMinutes: 2880,
    lateNightHourStart: 23,
    healthCheckEnabled: true,
  },
  tone: {
    enabled: true,
    matchUserStyle: true,
    hinglishEnabled: true,
  },
  context: {
    deepAnalysisEnabled: true,
    intentDetectionEnabled: true,
    urgencyDetectionEnabled: true,
  },
};

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * LLM SERVICE ADAPTER (Connected to Smart Routing)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
class LLMServiceAdapter implements LLMService {
  private planType: PlanType;
  private userId: string;

  constructor(planType: PlanType = 'STARTER', userId: string = 'system') {
    this.planType = planType;
    this.userId = userId;
  }

  setPlanType(planType: PlanType): void {
    this.planType = planType;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  async generateCompletion(prompt: string, context?: any): Promise<string> {
    try {
      const response = await aiService.chat({
        message: prompt,
        conversationHistory: [],
        userId: this.userId,
        planType: this.planType,
        language: 'english',
        temperature: 0.3,
        systemPrompt:
          'You are a JSON generator. Always respond with valid JSON only. No markdown, no explanations, no backticks.',
      });

      return response.message;
    } catch (error) {
      console.error('[LLMServiceAdapter] Error:', error);
      throw error;
    }
  }
}

export class IntelligenceOrchestrator {
  private static instance: IntelligenceOrchestrator;

  private memoryService: MemoryService;
  private contextAnalyzer: ContextAnalyzerService;
  private queryProcessor: QueryProcessorService;
  private toneMatcher: ToneMatcherService;
  private analogyService: AnalogyService;
  private proactiveService: ProactiveService;
  private choiceAdvisor: ChoiceAdvisorService;
  private emotionDetector: EmotionDetector;
  private config: IntelligenceConfig;
  private llmService: LLMServiceAdapter;

  private constructor(config?: Partial<IntelligenceConfig>) {
    // Create LLMService adapter - connected to Smart Routing
    this.llmService = new LLMServiceAdapter();

    this.memoryService = MemoryService.getInstance();
    this.emotionDetector = EmotionDetector.getInstance();

    // ✅ All services get correct parameters
    this.queryProcessor = new QueryProcessorService(this.llmService);
    this.toneMatcher = new ToneMatcherService(this.llmService);
    this.analogyService = new AnalogyService(this.llmService);
    this.proactiveService = new ProactiveService(this.llmService);
    this.contextAnalyzer = new ContextAnalyzerService(this.llmService, this.memoryService);
    this.choiceAdvisor = new ChoiceAdvisorService(this.llmService, this.memoryService);

    this.config = { ...DEFAULT_CONFIG, ...config };

    console.log('[IntelligenceOrchestrator] ✅ Initialized (v2.0 - Parallel Optimized)');
  }

  public static getInstance(config?: Partial<IntelligenceConfig>): IntelligenceOrchestrator {
    if (!IntelligenceOrchestrator.instance) {
      IntelligenceOrchestrator.instance = new IntelligenceOrchestrator(config);
    }
    return IntelligenceOrchestrator.instance;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * ✅ OPTIMIZED: Main enhance method with PARALLEL execution
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  async enhance(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    const startTime = Date.now();
    const featuresUsed: string[] = [];

    try {
      // 🔥 Set userId and planType for LLM calls
      this.llmService.setUserId(request.userId);
      this.llmService.setPlanType(request.planType);

      const features = {
        useMemory: true,
        generateAnalogy: false,
        checkProactive: true,
        matchTone: true,
        deepAnalysis: true,
        provideChoiceAdvice: false,
        ...request.features,
      };

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PHASE 1: PARALLEL - Memory + Emotion (Fast, no LLM)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      console.log('[Orchestrator] 🚀 Phase 1: Memory + Emotion (parallel, no LLM)');
      const phase1Start = Date.now();

      let relevantHistory: StoredMessage[] = [];
      let memorySummary: MemorySummary | undefined;
      let memoryStats: MemoryStats | undefined;

      // Emotion detection (instant, no LLM)
      featuresUsed.push('emotion');
      const emotionResult = this.emotionDetector.detectEmotionSync(request.message);
      const emotion: EmotionType = emotionResult.primary;

      // Memory retrieval (parallel with emotion)
      if (features.useMemory && this.config.memory.enableSemanticSearch) {
        featuresUsed.push('memory');
        try {
          const [history, stats] = await Promise.all([
            this.memoryService.getRecentContext(
              request.userId,
              request.planType,
              this.config.memory.contextWindow
            ),
            this.memoryService.getMemoryStats(request.userId, request.planType),
          ]);
          relevantHistory = history;
          memoryStats = stats;

          if (relevantHistory.length > this.config.memory.summarizationThreshold) {
            memorySummary = await this.memoryService.generateSummary(
              request.userId,
              request.planType
            );
          }
        } catch (error) {
          console.error('[Intelligence] Memory retrieval failed:', error);
        }
      }

      console.log(`[Orchestrator] ✅ Phase 1 complete: ${Date.now() - phase1Start}ms`);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PHASE 2: PARALLEL - All LLM calls together! 🔥
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      console.log('[Orchestrator] 🚀 Phase 2: LLM calls (ALL PARALLEL)');
      const phase2Start = Date.now();

      featuresUsed.push('query-processor', 'context-analyzer', 'tone-matcher');

      // ✅ OPTIMIZATION: Run QueryProcessor, ContextAnalyzer, ToneMatcher in PARALLEL
      const [processedQuery, contextAnalysis, toneAnalysis] = await Promise.all([
        this.queryProcessor
          .processQuery(request.userId, request.message, request.planType)
          .catch((err) => {
            console.error('[Orchestrator] QueryProcessor failed:', err);
            return this.getDefaultProcessedQuery(request.message);
          }),

        this.contextAnalyzer
          .analyzeContext(request.userId, request.message, request.planType)
          .catch((err) => {
            console.error('[Orchestrator] ContextAnalyzer failed:', err);
            return this.getDefaultContextAnalysis();
          }),

        this.toneMatcher.analyzeTone(request.message).catch((err) => {
          console.error('[Orchestrator] ToneMatcher failed:', err);
          return this.getDefaultToneAnalysis();
        }),
      ]);

      console.log(`[Orchestrator] ✅ Phase 2 complete: ${Date.now() - phase2Start}ms`);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PHASE 3: CONDITIONAL - Deep analysis (only if needed)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let deepUnderstanding: DeepUnderstanding | undefined;

      if (
        features.deepAnalysis &&
        this.config.context.deepAnalysisEnabled &&
        contextAnalysis.complexity !== 'simple'
      ) {
        console.log('[Orchestrator] 🧠 Phase 3: Deep understanding (complex query)');
        const phase3Start = Date.now();
        featuresUsed.push('deep-understanding');
        try {
          deepUnderstanding = await this.contextAnalyzer.getDeepUnderstanding(
            request.message,
            contextAnalysis
          );
        } catch (error) {
          console.error('[Intelligence] Deep understanding failed:', error);
        }
        console.log(`[Orchestrator] ✅ Phase 3 complete: ${Date.now() - phase3Start}ms`);
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PHASE 4: CONDITIONAL PARALLEL - Analogy + Choice (if needed)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let generatedAnalogy: GeneratedAnalogy | undefined;
      let choiceAnalysis: ChoiceAnalysis | undefined;

      const needsAnalogy =
        (features.generateAnalogy || contextAnalysis.requiresAnalogy) &&
        this.config.analogy.enabled;

      const needsChoice =
        (features.provideChoiceAdvice ||
          contextAnalysis.questionType === 'comparison' ||
          contextAnalysis.userIntent === 'decision_making') &&
        this.isChoiceQuery(request.message);

      if (needsAnalogy || needsChoice) {
        console.log('[Orchestrator] 🎯 Phase 4: Analogy/Choice (parallel if both needed)');
        const phase4Start = Date.now();

        const phase4Promises: Promise<any>[] = [];

        if (needsAnalogy) {
          featuresUsed.push('analogy-generator');
          phase4Promises.push(
            this.analogyService
              .generateAnalogy(request.message, {
                topic: request.message,
                complexity: this.config.analogy.defaultComplexity,
                culturalPreference: this.config.analogy.culturalContext,
              })
              .catch((err) => {
                console.error('[Intelligence] Analogy generation failed:', err);
                return null;
              })
          );
        }

        if (needsChoice) {
          featuresUsed.push('choice-advisor');
          phase4Promises.push(
            this.choiceAdvisor.analyzeChoice(request.userId, request.message).catch((err) => {
              console.error('[Intelligence] Choice advice failed:', err);
              return null;
            })
          );
        }

        const phase4Results = await Promise.all(phase4Promises);

        let resultIndex = 0;
        if (needsAnalogy) {
          generatedAnalogy = phase4Results[resultIndex++] || undefined;
        }
        if (needsChoice) {
          choiceAnalysis = phase4Results[resultIndex] || undefined;
        }

        console.log(`[Orchestrator] ✅ Phase 4 complete: ${Date.now() - phase4Start}ms`);
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PHASE 5: Proactive check (lightweight, usually skipped)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let proactiveMessage: ProactiveMessage | undefined;
      const shouldShowProactive = features.checkProactive && this.config.proactive.enabled;

      if (shouldShowProactive) {
        featuresUsed.push('proactive-service');
        try {
          const proactiveResult = await this.proactiveService.generateProactive(request.userId, {
            userId: request.userId,
            preferredLanguage: toneAnalysis.shouldMatchTone ? 'hinglish' : 'english',
            recentTopics: memorySummary?.recentTopics,
          });
          proactiveMessage = proactiveResult || undefined;
        } catch (error) {
          console.error('[Intelligence] Proactive check failed:', error);
        }
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // BUILD RESPONSE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const enhancedMessage = this.buildEnhancedMessage(request.message, {
        memory: relevantHistory,
        context: contextAnalysis,
        tone: toneAnalysis,
        query: processedQuery,
        deepUnderstanding,
      });

      const processingTimeMs = Date.now() - startTime;
      const confidenceScores = [
        processedQuery.metadata.confidence,
        deepUnderstanding?.confidence || 70,
        generatedAnalogy?.confidence ? generatedAnalogy.confidence * 100 : 80,
      ];
      const averageConfidence = Math.round(
        confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      );

      const response: IntelligenceResponse = {
        enhancedMessage,

        memoryContext: features.useMemory
          ? {
              relevantHistory,
              summary: memorySummary,
              stats: memoryStats!,
            }
          : undefined,

        analysis: {
          emotion,
          context: contextAnalysis,
          tone: toneAnalysis,
          deepUnderstanding,
        },

        content: {
          analogy: generatedAnalogy,
          choiceComparison: choiceAnalysis
            ? this.convertToLegacyComparison(choiceAnalysis)
            : undefined,
        },

        proactive: {
          shouldShowProactive: !!proactiveMessage && proactiveMessage.shouldSend,
          message: proactiveMessage,
        },

        metadata: {
          processingTimeMs,
          featuresUsed,
          confidence: averageConfidence,
        },
      };

      console.log(`[IntelligenceOrchestrator] ✅ Enhanced in ${processingTimeMs}ms (v2.0 Parallel)`);

      return response;
    } catch (error) {
      console.error('[IntelligenceOrchestrator] ❌ Enhancement failed:', error);
      throw new Error('Intelligence enhancement failed');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEFAULT FALLBACKS (for graceful degradation)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getDefaultProcessedQuery(message: string): ProcessedQuery {
    return {
      original: message,
      normalized: message.toLowerCase().trim(),
      classification: {
        type: 'factual',
        intent: 'information_seeking',
        requiresContext: false,
        isFollowUp: false,
        complexity: 'moderate',
      },
      semantic: {
        mainIntent: message,
        subIntents: [],
        entities: [],
        keywords: [],
        implicitNeeds: [],
      },
      enrichment: undefined,
      metadata: {
        processingTimeMs: 0,
        confidence: 50,
      },
    };
  }

  private getDefaultContextAnalysis(): ContextAnalysis {
    return {
      questionType: 'factual',
      userIntent: 'information_seeking',
      requiresAnalogy: false,
      requiresStepByStep: false,
      requiresEmotionalSupport: false,
      complexity: 'moderate',
      urgency: 'low',
      suggestedResponseStyle: {
        tone: 'casual',
        length: 'moderate',
        includeExamples: false,
        includeWarnings: false,
      },
      keywords: [],
      entities: [],
    };
  }

  private getDefaultToneAnalysis(): ToneAnalysis {
    return {
      formality: 'semi_formal',
      language: 'english',
      hindiWordsPercent: 0,
      englishWordsPercent: 100,
      hinglishPhrases: [],
      shouldMatchTone: true,
      suggestedStyle: {
        formalityLevel: 'semi_formal',
        useHinglish: false,
        examplePhrases: [],
      },
    };
  }

  /**
   * Quick enhance for simple queries (minimal processing)
   */
  async enhanceQuick(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    const startTime = Date.now();

    try {
      const emotionResult = this.emotionDetector.detectEmotionSync(request.message);
      const emotion: EmotionType = emotionResult.primary;

      const toneAnalysis = await this.toneMatcher.analyzeTone(request.message);
      const contextAnalysis = await this.contextAnalyzer.quickAnalyze(request.message);

      const enhancedMessage = `User query: "${request.message}"\nEmotion: ${emotion}\nTone: ${toneAnalysis.formality}`;

      const memoryStats = await this.memoryService.getMemoryStats(
        request.userId,
        request.planType
      );

      return {
        enhancedMessage,

        memoryContext: {
          relevantHistory: [],
          stats: memoryStats,
        },

        analysis: {
          emotion,
          context: contextAnalysis,
          tone: toneAnalysis,
        },

        proactive: {
          shouldShowProactive: false,
        },

        metadata: {
          processingTimeMs: Date.now() - startTime,
          featuresUsed: ['emotion', 'tone', 'quick-context'],
          confidence: 60,
        },
      };
    } catch (error) {
      console.error('[IntelligenceOrchestrator] ❌ Quick enhancement failed:', error);
      throw new Error('Quick intelligence enhancement failed');
    }
  }

  private buildEnhancedMessage(
    originalMessage: string,
    context: {
      memory: StoredMessage[];
      context: ContextAnalysis;
      tone: ToneAnalysis;
      query: ProcessedQuery;
      deepUnderstanding?: DeepUnderstanding;
    }
  ): string {
    const sections: string[] = [];

    sections.push(`User Query: "${originalMessage}"`);

    if (context.deepUnderstanding) {
      sections.push(
        `Real Concern: ${context.deepUnderstanding.realConcern}`,
        `Suggested Approach: ${context.deepUnderstanding.suggestedApproach}`
      );
    } else {
      sections.push(
        `Query Type: ${context.context.questionType}`,
        `User Intent: ${context.context.userIntent}`
      );
    }

    sections.push(
      `Urgency: ${context.context.urgency}`,
      `Complexity: ${context.context.complexity}`
    );

    if (context.tone.shouldMatchTone) {
      sections.push(
        `User's Tone: ${context.tone.formality} ${context.tone.language}`,
        `Match this style: ${context.tone.suggestedStyle.formalityLevel}`
      );
    }

    if (context.memory.length > 0) {
      const recentContext = context.memory
        .slice(0, 3)
        .map((m) => `- ${m.content.substring(0, 100)}...`)
        .join('\n');
      sections.push(`Recent Context:\n${recentContext}`);
    }

    const guidance = context.context.suggestedResponseStyle;
    sections.push(
      `Response Style: ${guidance.tone}, ${guidance.length} length`,
      `Include Examples: ${guidance.includeExamples ? 'Yes' : 'No'}`
    );

    return sections.join('\n\n');
  }

  private isChoiceQuery(message: string): boolean {
    const choiceKeywords = [
      'should i',
      'which one',
      'better',
      'versus',
      'vs',
      'or',
      'decide',
      'choice',
      'option',
      'recommend',
      'suggest',
    ];

    const lowerMessage = message.toLowerCase();
    return choiceKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  private convertToLegacyComparison(analysis: ChoiceAnalysis): any {
    return {
      options: analysis.options,
      recommendation: {
        topChoice: analysis.recommendation.recommendedOption,
        reasoning: analysis.recommendation.reasoning,
        confidence: analysis.recommendation.confidence,
        alternatives: analysis.recommendation.alternativeOption
          ? [analysis.recommendation.alternativeOption]
          : [],
      },
      considerations: analysis.recommendation.considerations,
      finalAdvice: analysis.recommendation.nextSteps.join(' '),
    };
  }

  getConfig(): IntelligenceConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<IntelligenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[IntelligenceOrchestrator] ✅ Configuration updated');
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    timestamp: Date;
  }> {
    try {
      const services = {
        memory: !!this.memoryService,
        contextAnalyzer: !!this.contextAnalyzer,
        queryProcessor: !!this.queryProcessor,
        toneMatcher: !!this.toneMatcher,
        analogyService: !!this.analogyService,
        proactiveService: !!this.proactiveService,
        choiceAdvisor: !!this.choiceAdvisor,
        emotionDetector: !!this.emotionDetector,
      };

      const allHealthy = Object.values(services).every((v) => v);
      const someHealthy = Object.values(services).some((v) => v);

      return {
        status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
        services,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services: {},
        timestamp: new Date(),
      };
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.memoryService.shutdown();
      console.log('[IntelligenceOrchestrator] ✅ Shut down gracefully');
    } catch (error) {
      console.error('[IntelligenceOrchestrator] ❌ Shutdown error:', error);
      throw error;
    }
  }
}

export default IntelligenceOrchestrator;