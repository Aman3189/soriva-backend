/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE ORCHESTRATOR
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
 * LLM SERVICE ADAPTER (for dependency injection)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
class LLMServiceAdapter implements LLMService {
  constructor(private apiKey: string) {}

  async generateCompletion(prompt: string, context?: any): Promise<string> {
    // Placeholder - actual implementation will call OpenAI/Anthropic
    return `Generated completion for: ${prompt.substring(0, 50)}...`;
  }

  getApiKey(): string {
    return this.apiKey;
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

  private constructor(apiKey: string, config?: Partial<IntelligenceConfig>) {
    // Create LLMService adapter
    this.llmService = new LLMServiceAdapter(apiKey);
    
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

    console.log('[IntelligenceOrchestrator] ✅ Initialized');
  }

  public static getInstance(
    apiKey: string,
    config?: Partial<IntelligenceConfig>
  ): IntelligenceOrchestrator {
    if (!IntelligenceOrchestrator.instance) {
      IntelligenceOrchestrator.instance = new IntelligenceOrchestrator(apiKey, config);
    }
    return IntelligenceOrchestrator.instance;
  }

  async enhance(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    const startTime = Date.now();
    const featuresUsed: string[] = [];

    try {
      const features = {
        useMemory: true,
        generateAnalogy: false,
        checkProactive: true,
        matchTone: true,
        deepAnalysis: true,
        provideChoiceAdvice: false,
        ...request.features,
      };

      let relevantHistory: StoredMessage[] = [];
      let memorySummary: MemorySummary | undefined;
      let memoryStats: MemoryStats | undefined;

      if (features.useMemory && this.config.memory.enableSemanticSearch) {
        featuresUsed.push('memory');
        try {
          relevantHistory = await this.memoryService.getRecentContext(
            request.userId,
            request.planType,
            this.config.memory.contextWindow
          );

          memoryStats = await this.memoryService.getMemoryStats(
            request.userId,
            request.planType
          );

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

      featuresUsed.push('emotion');
      // ✅ FIXED: EmotionDetector returns EmotionResult, extract .primary
      const emotionResult = this.emotionDetector.detectEmotion(request.message);
      const emotion: EmotionType = emotionResult.primary;

      featuresUsed.push('query-processor', 'context-analyzer');

      const [processedQuery, contextAnalysis] = await Promise.all([
        this.queryProcessor.processQuery(
          request.userId,
          request.message,
          request.planType
        ),
        this.contextAnalyzer.analyzeContext(
          request.userId,
          request.message,
          request.planType
        ),
      ]);

      let deepUnderstanding: DeepUnderstanding | undefined;

      if (
        features.deepAnalysis &&
        this.config.context.deepAnalysisEnabled &&
        contextAnalysis.complexity !== 'simple'
      ) {
        featuresUsed.push('deep-understanding');
        try {
          deepUnderstanding = await this.contextAnalyzer.getDeepUnderstanding(
            request.message,
            contextAnalysis
          );
        } catch (error) {
          console.error('[Intelligence] Deep understanding failed:', error);
        }
      }

      featuresUsed.push('tone-matcher');
      const toneAnalysis = await this.toneMatcher.analyzeTone(request.message);

      let generatedAnalogy: GeneratedAnalogy | undefined;
      let choiceAnalysis: ChoiceAnalysis | undefined;

      if (
        (features.generateAnalogy || contextAnalysis.requiresAnalogy) &&
        this.config.analogy.enabled
      ) {
        featuresUsed.push('analogy-generator');
        try {
          const analogyResult = await this.analogyService.generateAnalogy(
            request.message,
            {
              topic: request.message,
              complexity: this.config.analogy.defaultComplexity,
              culturalPreference: this.config.analogy.culturalContext,
            }
          );
          generatedAnalogy = analogyResult || undefined;
        } catch (error) {
          console.error('[Intelligence] Analogy generation failed:', error);
        }
      }

      if (
        (features.provideChoiceAdvice ||
          contextAnalysis.questionType === 'comparison' ||
          contextAnalysis.userIntent === 'decision_making') &&
        this.isChoiceQuery(request.message)
      ) {
        featuresUsed.push('choice-advisor');
        try {
          choiceAnalysis = await this.choiceAdvisor.analyzeChoice(
            request.userId,
            request.message
          );
        } catch (error) {
          console.error('[Intelligence] Choice advice failed:', error);
        }
      }

      let proactiveMessage: ProactiveMessage | undefined;
      const shouldShowProactive = features.checkProactive && this.config.proactive.enabled;

      if (shouldShowProactive) {
        featuresUsed.push('proactive-service');
        try {
          // ✅ FIXED: Add userId to UserContext
          const proactiveResult = await this.proactiveService.generateProactive(
            request.userId,
            {
              userId: request.userId,
              preferredLanguage: toneAnalysis.shouldMatchTone ? 'hinglish' : 'english',
              recentTopics: memorySummary?.recentTopics,
            }
          );
          // ✅ FIXED: Convert null to undefined
          proactiveMessage = proactiveResult || undefined;
        } catch (error) {
          console.error('[Intelligence] Proactive check failed:', error);
        }
      }

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

      console.log(
        `[IntelligenceOrchestrator] ✅ Enhanced in ${processingTimeMs}ms`
      );

      return response;
    } catch (error) {
      console.error('[IntelligenceOrchestrator] ❌ Enhancement failed:', error);
      throw new Error('Intelligence enhancement failed');
    }
  }

  async enhanceQuick(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    const startTime = Date.now();

    try {
      // ✅ FIXED: Extract .primary from EmotionResult
      const emotionResult = this.emotionDetector.detectEmotion(request.message);
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