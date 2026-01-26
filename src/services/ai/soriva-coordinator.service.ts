/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA COORDINATOR v1.0 - THE MASTER ORCHESTRATOR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/ai/soriva-coordinator.service.ts
 *
 * THE BRAIN OF SORIVA - Connects ALL components:
 * 1. Orchestrator v4.2 (Intelligence Layer)
 * 2. Hybrid Search (50/30/20)
 * 3. Delta Engine v2.1 (Companion Prompts)
 * 4. AI Service (LLM Call)
 *
 * COMPANION FORMULA:
 * ANSWER + VALUE ADD + PROACTIVE OFFER
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../constants';
import { aiService } from './ai.service';

// Intelligence Layer
import { 
  intelligenceOrchestrator,
  OrchestratorConfig,
  type ProcessWithPreprocessorResult,
} from './intelligence/orchestrator.service';

// Hybrid Search - search folder is at services/search (sibling of services/ai)
import { 
  HybridSearchService,
  HybridSearchConfig,
  type HybridSearchResult,
} from '../../modules/chat/services/search/hybrid-search.service';


// Delta Engine
import {
  buildEnhancedDelta,
  classifyIntent,
  getMaxTokens,
  type DeltaOutput,
  type DomainType,
} from '../../core/ai/soriva-delta-engine';

// Types
import type { AIMessage } from '../../core/ai/providers';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CoordinatorRequest {
  userId: string;
  message: string;
  planType: PlanType;
  userName?: string;
  userLocation?: string;
  userLanguage?: 'english' | 'hinglish' | 'hindi';
  userTimezone?: string;
  conversationHistory?: AIMessage[];
  memoryContext?: any;
  sessionId?: string;
  temperature?: number;
  maxTokens?: number;
  skipSearch?: boolean;
  forceSearchProvider?: 'brave' | 'tavily' | 'google';
  region?: 'IN' | 'INTL';
}

export interface CoordinatorResponse {
  success: boolean;
  message: string;
  metadata: {
    complexity: string;
    intent: string;
    domain: DomainType;
    language: string;
    searchUsed: boolean;
    searchProvider?: string;
    searchResults?: number;
    searchFallback?: boolean;
    deltaTokens: number;
    maxTokensAllowed: number;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    orchestratorTimeMs: number;
    searchTimeMs: number;
    deltaTimeMs: number;
    aiTimeMs: number;
    totalTimeMs: number;
    companionFormulaApplied: boolean;
    proactiveHintIncluded: boolean;
  };
  raw?: {
    orchestratorResult?: ProcessWithPreprocessorResult;
    searchResult?: HybridSearchResult;
    deltaOutput?: DeltaOutput;
  };
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface CoordinatorSettings {
  searchEnabled: boolean;
  searchTimeout: number;
  injectSearchContext: boolean;
  deltaEnabled: boolean;
  useEnhancedDelta: boolean;
  companionFormulaEnabled: boolean;
  proactiveHintsEnabled: boolean;
  detailedLogs: boolean;
  includeRawInResponse: boolean;
  maxSystemPromptChars: number;
  truncateOnOverflow: boolean;
}

const DEFAULT_SETTINGS: CoordinatorSettings = {
  searchEnabled: true,
  searchTimeout: 15000,
  injectSearchContext: true,
  deltaEnabled: true,
  useEnhancedDelta: true,
  companionFormulaEnabled: true,
  proactiveHintsEnabled: true,
  detailedLogs: true,
  includeRawInResponse: false,
  maxSystemPromptChars: 2000,
  truncateOnOverflow: true,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COORDINATOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SorivaCoordinator {
  private static instance: SorivaCoordinator;
  private settings: CoordinatorSettings;

  private constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    console.log('[SorivaCoordinator] 🚀 v1.0 - Master Orchestrator initialized');
  }

  static getInstance(): SorivaCoordinator {
    if (!SorivaCoordinator.instance) {
      SorivaCoordinator.instance = new SorivaCoordinator();
    }
    return SorivaCoordinator.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN COORDINATION METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async process(request: CoordinatorRequest): Promise<CoordinatorResponse> {
    const totalStartTime = Date.now();
    
    const {
      userId,
      message,
      planType,
      userName,
      userLocation,
      userLanguage,
      userTimezone,
      conversationHistory = [],
      memoryContext,
      temperature = 0.7,
      maxTokens,
      skipSearch = false,
      forceSearchProvider,
      region = 'IN',
    } = request;

    this.log('');
    this.log('╔══════════════════════════════════════════════════════════════╗');
    this.log('║          SORIVA COORDINATOR v1.0 - Processing                ║');
    this.log('╚══════════════════════════════════════════════════════════════╝');
    this.log(`📝 Message: "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`);
    this.log(`👤 User: ${userName || userId.slice(0, 8)} | Plan: ${planType}`);

    // ─────────────────────────────────────────────────────────────
    // STEP 1: ORCHESTRATOR (Intelligence Layer)
    // ─────────────────────────────────────────────────────────────
    
    const orchestratorStart = Date.now();
    let orchestratorResult: ProcessWithPreprocessorResult | null = null;
    
    try {
      orchestratorResult = await intelligenceOrchestrator.processWithPreprocessor({
        userId,
        message,
        planType,
        userName,
        userLocation,
        userLanguage,
      });

      this.log(`\n🔱 STEP 1: Orchestrator (${Date.now() - orchestratorStart}ms)`);
      this.log(`   ├─ Complexity: ${orchestratorResult.complexity}`);
      this.log(`   ├─ Intent: ${orchestratorResult.intent}`);
      this.log(`   ├─ Domain: ${orchestratorResult.domain}`);
      this.log(`   ├─ Search Needed: ${orchestratorResult.searchNeeded}`);
      this.log(`   └─ Language: ${orchestratorResult.enhancedResult?.analysis?.tone?.language || 'unknown'}`);
      
    } catch (error: any) {
      this.log(`⚠️ Orchestrator failed: ${error.message}`);
      orchestratorResult = this.getDefaultOrchestratorResult(message, planType);
    }
    
    const orchestratorTimeMs = Date.now() - orchestratorStart;

    // ─────────────────────────────────────────────────────────────
    // STEP 2: HYBRID SEARCH (If needed)
    // ─────────────────────────────────────────────────────────────
    
    const searchStart = Date.now();
    let searchResult: HybridSearchResult | null = null;
    let searchContext = '';
    
    if (
      this.settings.searchEnabled && 
      !skipSearch && 
      orchestratorResult?.searchNeeded
    ) {
      try {
        const searchQuery = orchestratorResult.searchQuery || message;
        
        searchResult = await HybridSearchService.search(searchQuery, {
          domain: orchestratorResult.domain,
          preferredProvider: forceSearchProvider,
          maxResults: 5,
          enableFallback: true,
        });

        this.log(`\n🔍 STEP 2: Hybrid Search (${Date.now() - searchStart}ms)`);
        this.log(`   ├─ Provider: ${searchResult.provider}${searchResult.fallbackUsed ? ` (fallback: ${searchResult.fallbackProvider})` : ''}`);
        this.log(`   ├─ Results: ${searchResult.results.length}`);
        this.log(`   └─ Answer: ${searchResult.answer ? 'Yes' : 'No'}`);

        if (this.settings.injectSearchContext && searchResult.results.length > 0) {
          searchContext = this.buildSearchContext(searchResult, orchestratorResult.domain);
        }
        
      } catch (error: any) {
        this.log(`⚠️ Search failed: ${error.message}`);
      }
    } else {
      this.log(`\n🔍 STEP 2: Search SKIPPED (not needed or disabled)`);
    }
    
    const searchTimeMs = Date.now() - searchStart;

    // ─────────────────────────────────────────────────────────────
    // STEP 3: DELTA ENGINE (Companion Prompt)
    // ─────────────────────────────────────────────────────────────
    
    const deltaStart = Date.now();
    let deltaOutput: DeltaOutput | null = null;
    let systemPrompt = '';
    
    if (this.settings.deltaEnabled) {
      try {
        const toneData = orchestratorResult?.enhancedResult?.analysis?.tone;
        
        // Build intelligence sync with correct types
        const intelligenceSync = {
          toneAnalysis: {
            shouldUseHinglish: toneData?.shouldUseHinglish || false,
            formalityLevel: (toneData?.formality || 'casual') as 'casual' | 'semi_formal' | 'formal',
          },
          emotionalState: { 
            mood: 'neutral' as const, 
            stressLevel: 0 
          },
          proactiveContext: { 
            recentTopics: [] as string[], 
            pendingFollowUps: [] as string[] 
          },
        };

        if (this.settings.useEnhancedDelta) {
          deltaOutput = buildEnhancedDelta(
            {
              message,
              userContext: {
                plan: planType,
                name: userName,
                location: userLocation,
                language: userLanguage || 'hinglish',
              },
              searchContext: {
                hasResults: searchResult !== null && searchResult.results.length > 0,
                domain: orchestratorResult?.domain || 'general',
              },
            },
            intelligenceSync
          );
          
          systemPrompt = deltaOutput.systemPrompt;
        } else {
          classifyIntent(planType, message);
          systemPrompt = orchestratorResult?.systemPrompt || '';
        }

        this.log(`\n📜 STEP 3: Delta Engine (${Date.now() - deltaStart}ms)`);
        this.log(`   ├─ Enhanced: ${this.settings.useEnhancedDelta}`);
        this.log(`   ├─ Prompt Length: ${systemPrompt.length} chars`);
        this.log(`   └─ Max Tokens: ${deltaOutput?.maxTokens || 'default'}`);
        
      } catch (error: any) {
        this.log(`⚠️ Delta failed: ${error.message}`);
        systemPrompt = this.getFallbackSystemPrompt(planType, userName);
      }
    }
    
    const deltaTimeMs = Date.now() - deltaStart;

    // ─────────────────────────────────────────────────────────────
    // STEP 4: BUILD FINAL PROMPT
    // ─────────────────────────────────────────────────────────────
    
    let finalSystemPrompt = systemPrompt;
    
    if (searchContext) {
      finalSystemPrompt += `\n\n${searchContext}`;
    }
    
    const now = new Date();
    const timeString = now.toLocaleString('en-IN', {
      timeZone: userTimezone || 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    finalSystemPrompt += `\n\n📅 ${timeString}`;
    
    if (
      this.settings.truncateOnOverflow && 
      finalSystemPrompt.length > this.settings.maxSystemPromptChars
    ) {
      finalSystemPrompt = finalSystemPrompt.slice(0, this.settings.maxSystemPromptChars);
      this.log(`⚠️ System prompt truncated to ${this.settings.maxSystemPromptChars} chars`);
    }

    this.log(`\n📋 Final Prompt: ${finalSystemPrompt.length} chars (~${Math.ceil(finalSystemPrompt.length / 4)} tokens)`);

    // ─────────────────────────────────────────────────────────────
    // STEP 5: AI CALL
    // ─────────────────────────────────────────────────────────────
    
    const aiStart = Date.now();
    
    try {
      const detectedLanguage = orchestratorResult?.enhancedResult?.analysis?.tone?.language;
      const effectiveMaxTokens = maxTokens || deltaOutput?.maxTokens || getMaxTokens(planType, orchestratorResult?.intent || 'GENERAL');
      
      const aiResponse = await aiService.chat({
        message,
        conversationHistory,
        memory: memoryContext,
        userId,
        planType,
        language: detectedLanguage === 'hinglish' ? 'hinglish' : 'english',
        userName,
        temperature,
        maxTokens: effectiveMaxTokens,
        systemPrompt: finalSystemPrompt,
        region,
      } as any);

      const aiTimeMs = Date.now() - aiStart;
      const totalTimeMs = Date.now() - totalStartTime;

      this.log(`\n🤖 STEP 5: AI Response (${aiTimeMs}ms)`);
      this.log(`   ├─ Model: ${aiResponse.metadata?.model || 'unknown'}`);
      this.log(`   ├─ Prompt Tokens: ${aiResponse.usage?.promptTokens || 0}`);
      this.log(`   ├─ Completion Tokens: ${aiResponse.usage?.completionTokens || 0}`);
      this.log(`   └─ Response Length: ${aiResponse.message.length} chars`);

      this.log(`\n✅ TOTAL TIME: ${totalTimeMs}ms`);
      this.log('╚══════════════════════════════════════════════════════════════╝\n');

      return {
        success: true,
        message: aiResponse.message,
        metadata: {
          complexity: orchestratorResult?.complexity || 'SIMPLE',
          intent: orchestratorResult?.intent || 'GENERAL',
          domain: orchestratorResult?.domain || 'general',
          language: detectedLanguage || 'hinglish',
          searchUsed: searchResult !== null && searchResult.results.length > 0,
          searchProvider: searchResult?.provider,
          searchResults: searchResult?.results.length,
          searchFallback: searchResult?.fallbackUsed,
          deltaTokens: Math.ceil(systemPrompt.length / 4),
          maxTokensAllowed: effectiveMaxTokens,
          model: aiResponse.metadata?.model || 'unknown',
          promptTokens: aiResponse.usage?.promptTokens || 0,
          completionTokens: aiResponse.usage?.completionTokens || 0,
          totalTokens: aiResponse.usage?.totalTokens || 0,
          orchestratorTimeMs,
          searchTimeMs,
          deltaTimeMs,
          aiTimeMs,
          totalTimeMs,
          companionFormulaApplied: this.settings.companionFormulaEnabled,
          proactiveHintIncluded: this.settings.proactiveHintsEnabled && deltaOutput !== null,
        },
        raw: this.settings.includeRawInResponse ? {
          orchestratorResult: orchestratorResult || undefined,
          searchResult: searchResult || undefined,
          deltaOutput: deltaOutput || undefined,
        } : undefined,
      };
      
    } catch (error: any) {
      this.log(`❌ AI Call failed: ${error.message}`);
      
      return {
        success: false,
        message: '',
        metadata: {
          complexity: orchestratorResult?.complexity || 'SIMPLE',
          intent: orchestratorResult?.intent || 'GENERAL',
          domain: orchestratorResult?.domain || 'general',
          language: 'hinglish',
          searchUsed: false,
          deltaTokens: 0,
          maxTokensAllowed: 0,
          model: 'error',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          orchestratorTimeMs,
          searchTimeMs,
          deltaTimeMs,
          aiTimeMs: Date.now() - aiStart,
          totalTimeMs: Date.now() - totalStartTime,
          companionFormulaApplied: false,
          proactiveHintIncluded: false,
        },
        error: error.message,
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildSearchContext(searchResult: HybridSearchResult, domain: DomainType): string {
    if (!searchResult.results.length) return '';
    
    let context = `[SEARCH DATA - ${domain.toUpperCase()}]\n`;
    context += `Source: ${searchResult.provider}\n`;
    
    if (searchResult.answer) {
      context += `Answer: ${searchResult.answer}\n`;
    }
    
    const topResults = searchResult.results.slice(0, 3);
    for (let i = 0; i < topResults.length; i++) {
      const result = topResults[i];
      context += `\n${i + 1}. ${result.title}\n`;
      const desc = result.description || '';
      context += `   ${desc.slice(0, 200)}${desc.length > 200 ? '...' : ''}\n`;
      if (result.age) context += `   (${result.age})\n`;
    }
    
    context += `\n[/SEARCH DATA]\n`;
    context += `\n⚡ USE THIS DATA CONFIDENTLY. It's fresh from web search.`;
    
    return context;
  }

  private getDefaultOrchestratorResult(message: string, _planType: PlanType): ProcessWithPreprocessorResult {
    return {
      complexity: 'SIMPLE',
      core: message.slice(0, 40),
      searchNeeded: false,
      intent: 'GENERAL',
      domain: 'general',
      routedTo: 'MISTRAL',
      processingTimeMs: 0,
      enhancedResult: {
        analysis: {
          emotion: 'neutral',
          tone: { language: 'hinglish' },
          context: { userIntent: 'general', complexity: 'SIMPLE', questionType: 'general' },
        },
        metadata: { processingTimeMs: 0 },
      },
    };
  }

  private getFallbackSystemPrompt(_planType: PlanType, userName?: string): string {
    const name = userName || 'dost';
    return `You are Soriva, a helpful AI companion. Talk naturally in Hinglish. Be friendly to ${name}. Answer clearly and offer relevant follow-up suggestions.`;
  }

  private log(message: string): void {
    if (this.settings.detailedLogs) {
      console.log(`[SorivaCoordinator] ${message}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETTINGS MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  updateSettings(newSettings: Partial<CoordinatorSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('[SorivaCoordinator] ⚙️ Settings updated');
  }

  getSettings(): CoordinatorSettings {
    return { ...this.settings };
  }

  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    console.log('[SorivaCoordinator] 🔄 Settings reset to defaults');
  }

  getOrchestratorConfig() {
    return OrchestratorConfig;
  }

  getSearchConfig() {
    return HybridSearchConfig;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      orchestrator: boolean;
      search: { status: string; providers: Record<string, boolean> };
      delta: boolean;
      ai: boolean;
    };
  }> {
    const searchHealth = await HybridSearchService.healthCheck();
    
    return {
      status: searchHealth.status === 'healthy' ? 'healthy' : 'degraded',
      components: {
        orchestrator: true,
        search: {
          status: searchHealth.status,
          providers: searchHealth.providers,
        },
        delta: true,
        ai: true,
      },
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const sorivaCoordinator = SorivaCoordinator.getInstance();
export { SorivaCoordinator };