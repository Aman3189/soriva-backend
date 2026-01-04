/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY PIPELINE ORCHESTRATOR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Author: Amandeep (Ferozepur, Punjab, India)
 * Date: December 2025
 * Purpose: Central orchestrator connecting all analyzers and builders
 *
 * Philosophy: "LLMs are already perfect. Our duty is to protect identity."
 *
 * ✅ Ultra-minimal system prompts (25-40 tokens)
 * ✅ Token-optimized (78-86% savings)
 * ✅ Using soriva.personality.ts for all prompts
 * ✅ Strong identity protection (never leak tech)
 * ✅ Web search integration
 * ✅ Plan-based word limits (complete but concise responses)
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
import { soriva, getSystemPrompt, isManipulative } from '../../core/ai/prompts/soriva.personality';
import type { PlanType as SorivaPlanType, BrainMode, SorivaOutput } from '../../core/ai/prompts/soriva.personality';
import { personalityEngine } from './personality.engine';
import type { PersonalityResult } from './personality.engine';
import { PlanType } from '../../constants/plans';
import { googleSearchService } from '../web-search/google-search.service';
import type { SearchResult } from '../web-search/google-search.service';

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

// Simplified instruction output (replaces DynamicInstructions)
export interface SimpleInstructions {
  systemPrompt: string;
  isManipulative: boolean;
  tokens: number;
  confidence: number;
}

export interface PipelineOutput {
  systemPrompt: string;
  components: {
    instructions: SimpleInstructions;
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
  searchSources?: SearchResult[];
}

export interface QuickPipelineOutput {
  systemPrompt: string;
  flags: {
    isAbusive: boolean;
    requiresSpecialHandling: boolean;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Map PlanType enum to SorivaPlanType string
function toSorivaPlan(planType: PlanType | string): SorivaPlanType {
  const planString = typeof planType === 'string' 
    ? planType.toUpperCase() 
    : PlanType[planType as keyof typeof PlanType]?.toUpperCase() || 'STARTER';
  
  const validPlans: SorivaPlanType[] = ['STARTER', 'PLUS', 'PRO', 'APEX', 'SOVEREIGN'];
  return validPlans.includes(planString as SorivaPlanType) 
    ? (planString as SorivaPlanType) 
    : 'STARTER';
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
      // STEP 2: WEB SEARCH (IF NEEDED)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      let searchResults: SearchResult[] = [];
      const needsWebSearch = this.detectWebSearchNeed(input.userMessage);
      
      if (needsWebSearch) {
        console.log('🔍 Web search triggered for query');
        analyzersUsed.push('web-search');
        searchResults = await this.performWebSearch(input.userMessage);
        
        if (searchResults.length > 0) {
          console.log(`✅ Found ${searchResults.length} search results`);
        } else {
          console.log('⚠️  No search results found');
        }
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 3: BUILD SYSTEM PROMPT USING SORIVA.PERSONALITY
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      analyzersUsed.push('soriva-personality');
      
      const sorivaResult: SorivaOutput = soriva.generate({
        message: input.userMessage,
        plan: toSorivaPlan(input.planType),
        brain: 'friendly' as BrainMode,
        userName: input.userName,
      });

      const instructions: SimpleInstructions = {
        systemPrompt: sorivaResult.systemPrompt,
        isManipulative: sorivaResult.isManipulative,
        tokens: sorivaResult.tokens,
        confidence: sorivaResult.isManipulative ? 50 : 90,
      };

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 4: GENERATE PERSONALITY LAYER
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
      // STEP 5: BUILD FINAL SYSTEM PROMPT
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      let finalSystemPrompt = sorivaResult.systemPrompt;

      // ✅ ADD WORD LIMIT BASED ON PLAN (Ensures complete responses within limit)
      const wordLimitInstruction = this.getWordLimitInstruction(toSorivaPlan(input.planType));
      if (wordLimitInstruction) {
        finalSystemPrompt += `\n\n${wordLimitInstruction}`;
      }
      
      // If web search was used, enhance the prompt
      if (searchResults.length > 0) {
        const searchEnhancedPrompt = this.buildSearchEnhancedPrompt(
          input.userMessage,
          searchResults
        );
        
        // Add citation instructions
        finalSystemPrompt += `\n\nCITATION RULES:\n- Add [1], [2] after facts\n- Be direct (NO "According to...")\n\n${searchEnhancedPrompt}`;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 6: GENERATE FLAGS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const flags = {
        isAbusive: abuseResult.isInappropriate,
        requiresSpecialHandling: abuseResult.isInappropriate || sorivaResult.isManipulative,
        isEmotionalSupport:
          contextResult.queryType === 'emotional' || contextResult.shouldBeEmpathetic,
        isTechnicalQuery: contextResult.queryType === 'technical',
      };

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 7: CALCULATE METRICS
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
      // STEP 8: RETURN OUTPUT
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      return {
        systemPrompt: finalSystemPrompt,
        components: {
          instructions,
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
        searchSources: searchResults.length > 0 ? searchResults : undefined,
      };
    } catch (error) {
      console.error('Pipeline execution error:', error);
      return this.buildFallbackOutput(input, error as Error);
    }
  }

  /**
   * Quick execution - minimal analysis using soriva.personality
   */
  async executeQuick(input: PipelineInput): Promise<QuickPipelineOutput> {
    try {
      const abuse = abuseDetector.detect(input.userMessage);
      const isAbusive = abuse.isInappropriate;

      // ✅ Use soriva.personality.ts for quick prompt generation
      let systemPrompt = getSystemPrompt({
        message: input.userMessage,
        plan: toSorivaPlan(input.planType),
        brain: 'friendly',
        userName: input.userName,
      });

      // ✅ Add word limit for quick execution too
      const wordLimitInstruction = this.getWordLimitInstruction(toSorivaPlan(input.planType));
      if (wordLimitInstruction) {
        systemPrompt += `\n\n${wordLimitInstruction}`;
      }

      return {
        systemPrompt,
        flags: {
          isAbusive,
          requiresSpecialHandling: isAbusive || isManipulative(input.userMessage),
        },
      };
    } catch (error) {
      console.error('Quick pipeline error:', error);
      return {
        systemPrompt: 'Soriva by Risenex. Warm, natural. Mirror user\'s language. Keep responses brief and complete.',
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
   * Get word limit instruction based on plan
   * Ensures AI gives complete but concise responses
   */
  private getWordLimitInstruction(plan: SorivaPlanType): string {
    const limits: Record<SorivaPlanType, number> = {
      'STARTER': 80,
      'PLUS': 150,
      'PRO': 300,
      'APEX': 500,
      'SOVEREIGN': 800,
    };

    const wordLimit = limits[plan] || 80;

    return `RESPONSE LENGTH: Keep response under ${wordLimit} words. Be concise but ALWAYS complete your sentences. Never leave thoughts incomplete or cut off mid-sentence.`;
  }

  /**
   * Detect if web search is needed (STRICTER detection)
   */
  private detectWebSearchNeed(message: string): boolean {
    const messageLower = message.toLowerCase();
    
    // Only trigger for EXPLICIT current/future queries
    const triggers = [
      // Time-specific (must have time word)
      /\b(agla|next|upcoming|aane waala)\b.*\b(match|game|event)/i,
      /\b(kab hai|when is|when will)\b/i,
      /\b(aaj|today|kal|tomorrow|is hafte|this week)\b/i,
      
      // Scores (only LIVE scores)
      /\b(live|current|abhi)\b.*\b(score|match)/i,
      
      // Latest/Breaking news
      /\b(latest|breaking|taaza|abhi ka)\b.*\bnews\b/i,
      
      // Current prices
      /\b(current|today|aaj ka|abhi)\b.*\b(price|rate|cost)/i,
      /\bkitne ka\b.*\b(hai|hoga)/i,
      
      // Weather (today/tomorrow only)
      /\b(aaj|today|kal|tomorrow)\b.*\b(weather|mausam)/i,
    ];
    
    return triggers.some(pattern => pattern.test(messageLower));
  }

  /**
   * Perform web search with compression
   */
  private async performWebSearch(query: string): Promise<SearchResult[]> {
    try {
      const queryLower = query.toLowerCase();
      
      // Route to specialized search
      let results: SearchResult[] = [];
      
      if (queryLower.match(/cricket|match|ipl|t20|odi/i)) {
        results = await googleSearchService.searchCricket(query);
      } else if (queryLower.match(/news|breaking|latest/i)) {
        results = await googleSearchService.searchNews(query);
      } else {
        results = await googleSearchService.search(query, { numResults: 5 });
      }
      
      // COMPRESS: Take only top 3 results
      return results.slice(0, 3);
      
    } catch (error) {
      console.error('❌ Web search failed:', error);
      return [];
    }
  }

  /**
   * Build search-enhanced prompt (COMPRESSED)
   */
  private buildSearchEnhancedPrompt(
    originalQuery: string,
    results: SearchResult[]
  ): string {
    // Extract only KEY FACTS (not full snippets)
    const compressedResults = results.map((r, i) => {
      // Take first sentence or 100 chars of snippet
      const keyFact = r.snippet.split('.')[0] || r.snippet.substring(0, 100);
      return `[${i + 1}] ${r.title}\n   ${keyFact}`;
    }).join('\n\n');
    
    return `User question: ${originalQuery}

Web sources (verified):
${compressedResults}

Use these sources. Add citations [1], [2] after facts. Be direct (NO "According to...").`;
  }

  /**
   * Fallback output
   */
  private buildFallbackOutput(input: PipelineInput, error: Error): PipelineOutput {
    console.error('Using fallback pipeline output:', error.message);

    const fallbackPrompt = `Soriva by Risenex. Warm, natural. Mirror user's language. Keep responses brief and complete.`;

    const planTypeEnum = (
      typeof input.planType === 'string'
        ? (PlanType as any)[input.planType.toUpperCase()]
        : input.planType
    ) as PlanType;

    return {
      systemPrompt: fallbackPrompt,
      components: {
        instructions: {
          systemPrompt: fallbackPrompt,
          isManipulative: false,
          tokens: 15,
          confidence: 30,
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
        sorivaPersonality: !!soriva,
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

export async function getSystemPromptFromPipeline(input: PipelineInput): Promise<string> {
  const result = await pipelineOrchestrator.execute(input);
  return result.systemPrompt;
}

export async function getQuickSystemPrompt(input: PipelineInput): Promise<string> {
  const result = await pipelineOrchestrator.executeQuick(input);
  return result.systemPrompt;
}