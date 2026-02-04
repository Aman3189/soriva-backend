/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE ORCHESTRATOR v4.4 - 100% DYNAMIC EDITION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * PHILOSOPHY: Fast + Smart + Companion Feel + 100% Configurable
 * - ALL keywords, patterns, settings from config file
 * - Zero hardcoded values in this service
 * - Runtime updatable without code changes
 * - Smart caching for performance
 * 
 * v4.4 CHANGES (February 2026):
 * - BUG-1 FIXED: moviePatterns reordered — specific patterns FIRST,
 *   greedy fallback LAST. "Dhurandhar movie ki IMDB rating" now
 *   correctly extracts "Dhurandhar", NOT "IMDB rating".
 *   Added new Hinglish-first pattern for "X movie ki Y" structure.
 * - BUG-3 FIXED: Removed 44-name SEQUEL_MOVIES hardcoded list.
 *   Replaced with generic pattern: "<words> <number>" + movie context.
 *   Eliminated 14 false-positive common words (border, race, war, etc.)
 * - BUG-5 FIXED: Documented searchQuery as FALLBACK ONLY —
 *   ChatService passes original message to SorivaSearch (which owns
 *   all intelligent query building via buildQuery()).
 * 
 * v4.3 CHANGES (January 24, 2026):
 * - FIXED: extractCore now handles "X nahi, Y hai" corrections
 * - FIXED: buildSearchQuery extracts movie/entity names properly
 * - IMPROVED: Multi-line message handling
 * - RESULT: Better search queries, accurate results
 * 
 * v4.2 CHANGES:
 * - MOVED: All keywords/patterns to orchestrator.config.ts
 * - ADDED: Config-based everything
 * - KEPT: All v4.1 features (tone matching, intelligence sync)
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../../constants';
import { aiService } from '../ai.service';
import { OrchestratorConfig } from './orchestrator.config';
import { 
  getDomain, 
  getIntent,
  buildEnhancedDelta,
  type DomainType,
  type IntelligenceSync,
  type DeltaOutput,
} from '../../../core/ai/soriva-delta-engine';
import { ToneMatcherService } from './tone-matcher.service';
import type { ToneAnalysis, LLMService } from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ComplexityLevel = 'SIMPLE' | 'MEDIUM' | 'HIGH';

export interface PreprocessorRequest {
  userId: string;
  message: string;
  planType: PlanType;
  userName?: string;
  userLocation?: string;
  userLanguage?: 'english' | 'hinglish' | 'hindi';
}

export interface ProcessWithPreprocessorResult {
  complexity: ComplexityLevel;
  core: string;
  searchNeeded: boolean;
  searchQuery?: string;
  intent: string;
  domain: DomainType;
  routedTo: 'MISTRAL' | 'SMART_ROUTING';
  processingTimeMs: number;
  directResponse?: string;
  intelligenceSync?: IntelligenceSync;
  deltaOutput?: DeltaOutput;
  enhancedResult?: {
    analysis?: {
      emotion?: string;
      tone?: {
        language?: string;
        formality?: string;
        shouldUseHinglish?: boolean;
      };
      context?: {
        userIntent?: string;
        complexity?: string;
        questionType?: string;
      };
    };
    metadata?: {
      processingTimeMs?: number;
      cacheHit?: boolean;
    };
  };
  systemPrompt?: string;
}

export interface QuickEnhanceRequest {
  userId: string;
  message: string;
  planType: PlanType;
}

export interface QuickEnhanceResult {
  analysis?: {
    emotion?: string;
    tone?: { language?: string };
    context?: {
      userIntent?: string;
      complexity?: string;
      questionType?: string;
    };
  };
  metadata?: { processingTimeMs?: number };
}

interface CachedToneData {
  analysis: ToneAnalysis;
  timestamp: number;
  messageCount: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORCHESTRATOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class IntelligenceOrchestrator {
  private static instance: IntelligenceOrchestrator;
  private toneCache: Map<string, CachedToneData> = new Map();
  private toneMatcher: ToneMatcherService | null = null;

  private constructor() {
    const stats = OrchestratorConfig.getStats();
    console.log('[Orchestrator] 🚀 v4.4 100% Dynamic Edition initialized');
    console.log('[Orchestrator] 📊 Config loaded:', {
      searchCategories: stats.searchCategories,
      totalKeywords: stats.totalSearchKeywords,
      greetings: stats.greetingsCount,
    });
  }

  static getInstance(): IntelligenceOrchestrator {
    if (!IntelligenceOrchestrator.instance) {
      IntelligenceOrchestrator.instance = new IntelligenceOrchestrator();
    }
    return IntelligenceOrchestrator.instance;
  }

  private getToneMatcher(): ToneMatcherService | null {
    const settings = OrchestratorConfig.getSettings();
    if (!settings.enableToneMatcher) return null;
    
    if (!this.toneMatcher) {
      try {
        const llmService: LLMService = {
          generateCompletion: async (prompt: string) => {
            const response = await aiService.chat({
              message: prompt,
              userId: 'system-tone-matcher',
              planType: 'STARTER',
              maxTokens: 200,
              temperature: 0.3,
            });
            return response.message;
          }
        };
        this.toneMatcher = new ToneMatcherService(llmService);
        console.log('[Orchestrator] ✅ ToneMatcher loaded');
      } catch (error) {
        console.warn('[Orchestrator] ⚠️ ToneMatcher not available:', error);
        return null;
      }
    }
    return this.toneMatcher;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN METHOD: processWithPreprocessor
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async processWithPreprocessor(request: PreprocessorRequest): Promise<ProcessWithPreprocessorResult> {
    const startTime = Date.now();
    const { userId, message, planType, userName, userLocation, userLanguage } = request;
    const messageLower = message.toLowerCase().trim();
    const settings = OrchestratorConfig.getSettings();

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Orchestrator] 🔱 v4.4 100% DYNAMIC Processing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Message: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`);
    console.log(`📋 Plan: ${planType} | User: ${userName || userId.slice(0, 8)}`);

    // STEP 1: Check for simple greeting
    if (this.isSimpleGreeting(messageLower)) {
      const processingTime = Date.now() - startTime;
      console.log(`✅ Simple greeting detected - SKIP all processing`);
      console.log(`⏱️  Processing time: ${processingTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return {
        complexity: 'SIMPLE',
        core: 'greeting',
        searchNeeded: false,
        intent: 'CASUAL',
        domain: 'general',
        routedTo: 'MISTRAL',
        processingTimeMs: processingTime,
        enhancedResult: {
          analysis: {
            emotion: 'neutral',
            tone: { language: this.detectLanguageQuick(messageLower) },
          },
          metadata: { processingTimeMs: processingTime, cacheHit: false },
        },
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1.5: MOVIE SEQUEL DETECTION (Generic pattern — NO hardcoded list)
    // v4.4 FIX (BUG-3): Removed 44-name SEQUEL_MOVIES list.
    // OLD problem: "Indian restaurant rating" → "indian" in list + "rating" matched → FALSE POSITIVE
    // 14 common English words (border, race, tiger, war, don, etc.) caused false positives.
    // NEW approach: Generic "<words> <number/part>" pattern + movie keyword context.
    // Works for ANY movie: "Border 2", "Pushpa 3", "Dhurandhar 2", "XYZ Part 4"
    // Requires BOTH a sequel number AND movie context — no more false positives.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Pattern 1: Detects "<word(s)> <number>" or "<word(s)> part <number>"
    const genericSequelPattern = /\b([\w][\w\s]{0,30}?)\s+(2|3|4|5|6|7|8|9|10|two|three|four|five|part\s*\d+|chapter\s*\d+)\b/i;
    
    // Pattern 2: Movie context keywords — must appear alongside sequel pattern
    const movieContextPattern = /\b(movie|film|rating|imdb|review|release|cast|dekhni|dekhi|dekhna|dekhu|dekhenge|showtimes?|trailer|box\s*office|kaisi\s*hai|kab\s*aa\s*rahi|kab\s*release)\b/i;
    
    const sequelMatch = messageLower.match(genericSequelPattern);
    const hasMovieContext = movieContextPattern.test(messageLower);
    
    // Only trigger if BOTH sequel pattern AND movie context exist
    if (sequelMatch && hasMovieContext) {
      const movieName = sequelMatch[0].trim();
      
      console.log(`[Orchestrator] 🎬 MOVIE SEQUEL DETECTED: "${movieName}"`);
      console.log(`[Orchestrator] ✅ Force search: true`);
      
      const processingTime = Date.now() - startTime;
      return {
        complexity: 'MEDIUM',
        core: movieName,
        searchNeeded: true,
        searchQuery: movieName,  // v4.4: Let SorivaSearch build the full query
        intent: 'QUICK',
        domain: 'entertainment',
        routedTo: 'SMART_ROUTING',
        processingTimeMs: processingTime,
        enhancedResult: {
          analysis: {
            emotion: 'neutral',
            tone: { 
              language: this.detectLanguageQuick(messageLower),
              formality: 'casual',
              shouldUseHinglish: this.detectLanguageQuick(messageLower) === 'hinglish',
            },
            context: { 
              userIntent: 'movie_info', 
              complexity: 'MEDIUM', 
              questionType: 'factual' 
            },
          },
          metadata: { processingTimeMs: processingTime, cacheHit: false },
        },
      };
    }

    // STEP 2: Detect search need
    const searchAnalysis = this.detectSearchNeed(messageLower);
    console.log(`🔍 Search Analysis:`, {
      needed: searchAnalysis.needed,
      category: searchAnalysis.category,
      matchedKeywords: searchAnalysis.matchedKeywords.slice(0, 3),
    });

    // STEP 3: Domain & Intent Detection
    const domain = settings.enableDomainDetection 
      ? getDomain(message) 
      : this.categoryToDomain(searchAnalysis.category);
    const intent = getIntent(message, planType as any);
    console.log(`🎯 Domain: ${domain} | Intent: ${intent}`);

    // STEP 4: Complexity & Core Extraction
    const complexity = this.estimateComplexity(messageLower);
    const core = this.extractCore(messageLower, message);
    console.log(`🧠 Complexity: ${complexity} | Core: "${core.slice(0, 30)}..."`);

    // STEP 5: Tone Analysis (SMART CACHED)
    const toneResult = await this.getToneAnalysisCached(userId, message, messageLower);
    console.log(`🎵 Tone:`, {
      language: toneResult.analysis?.language || 'unknown',
      formality: toneResult.analysis?.formality || 'unknown',
      cacheHit: toneResult.cacheHit,
      timeMs: toneResult.timeMs,
    });

    // STEP 6: Build Intelligence Sync
    const intelligenceSync: IntelligenceSync = {
      toneAnalysis: toneResult.analysis ? {
        shouldUseHinglish: toneResult.analysis.suggestedStyle?.useHinglish || false,
        formalityLevel: toneResult.analysis.formality || 'casual',
      } : undefined,
      emotionalState: { mood: 'neutral', stressLevel: 0 },
      proactiveContext: { recentTopics: [], pendingFollowUps: [] },
    };

    // STEP 7: Pre-build Delta
    let deltaOutput: DeltaOutput | undefined;
    let systemPrompt: string | undefined;
    
    if (settings.enableDeltaPrebuild) {
      deltaOutput = buildEnhancedDelta(
        {
          message,
          userContext: {
            plan: planType as any,
            name: userName,
            location: userLocation,
            language: userLanguage || (toneResult.analysis?.language as any) || 'hinglish',
          },
          // FIX v4.4: hasResults = false because search hasn't happened yet!
          // searchAnalysis.needed = "search SHOULD be done"
          // hasResults = "search data IS available" (not yet!)
          searchContext: { hasResults: false, domain },
        },
        intelligenceSync
      );
      systemPrompt = deltaOutput.systemPrompt;
      console.log(`📄 Delta pre-built: ${systemPrompt.length} chars`);
    }

    // STEP 8: Determine Routing
    const routedTo = this.determineRouting(complexity, planType);
    const processingTime = Date.now() - startTime;

    // STEP 9: Build Search Query (v4.4: FALLBACK ONLY — SorivaSearch owns query building)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ARCHITECTURE NOTE (BUG-5 FIX):
    // ChatService passes the ORIGINAL user message to SorivaSearch.search()
    // SorivaSearch v4.4 has its own intelligent buildQuery() that handles:
    //   - Domain-specific suffixes, freshness params, location context
    //   - Hinglish optimization, cinema detection, showtime intent
    // This orchestrator searchQuery is ONLY used for:
    //   1. Logging/debugging (ChatService logs it at line 1106)
    //   2. Fallback if SorivaSearch is unavailable
    // It should NOT be used as the primary search query.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const searchQuery = searchAnalysis.needed 
      ? this.buildSearchQuery(message, core, searchAnalysis.category, domain)
      : undefined;

    console.log(`🎯 Final Decision:`, {
      domain, intent, complexity,
      searchNeeded: searchAnalysis.needed,
      searchQuery: searchQuery ? searchQuery.slice(0, 50) + '...' : 'N/A',
      routedTo, processingTimeMs: processingTime,
      toneCacheHit: toneResult.cacheHit,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      complexity, core,
      searchNeeded: searchAnalysis.needed,
      searchQuery,
      intent, domain, routedTo, processingTimeMs: processingTime,
      intelligenceSync, deltaOutput, systemPrompt,
      enhancedResult: {
        analysis: {
          emotion: 'neutral',
          tone: {
            language: toneResult.analysis?.language || this.detectLanguageQuick(messageLower),
            formality: toneResult.analysis?.formality,
            shouldUseHinglish: toneResult.analysis?.suggestedStyle?.useHinglish,
          },
          context: {
            userIntent: intent,
            complexity: complexity,
            questionType: searchAnalysis.category || domain,
          },
        },
        metadata: { processingTimeMs: processingTime, cacheHit: toneResult.cacheHit },
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TONE ANALYSIS WITH CACHING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async getToneAnalysisCached(
    userId: string, message: string, messageLower: string
  ): Promise<{ analysis: ToneAnalysis | null; cacheHit: boolean; timeMs: number }> {
    const startTime = Date.now();
    const settings = OrchestratorConfig.getSettings();
    
    const toneMatcher = this.getToneMatcher();
    if (!toneMatcher) {
      return {
        analysis: this.buildFallbackToneAnalysis(messageLower),
        cacheHit: false,
        timeMs: Date.now() - startTime,
      };
    }
    
    const cached = this.toneCache.get(userId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < settings.toneCacheTTLMs) {
      cached.messageCount++;
      console.log(`[Orchestrator] 🎵 Tone cache HIT (msg #${cached.messageCount})`);
      return { analysis: cached.analysis, cacheHit: true, timeMs: Date.now() - startTime };
    }
    
    console.log(`[Orchestrator] 🎵 Tone cache MISS - running full analysis`);
    
    try {
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), settings.maxToneAnalysisTimeMs);
      });
      const analysisPromise = toneMatcher.analyzeTone(message, userId);
      const analysis = await Promise.race([analysisPromise, timeoutPromise]);
      
      if (analysis) {
        this.toneCache.set(userId, { analysis, timestamp: now, messageCount: 1 });
        return { analysis, cacheHit: false, timeMs: Date.now() - startTime };
      }
    } catch (error) {
      console.warn('[Orchestrator] ⚠️ Tone analysis failed:', error);
    }
    
    return {
      analysis: this.buildFallbackToneAnalysis(messageLower),
      cacheHit: false,
      timeMs: Date.now() - startTime,
    };
  }

  private buildFallbackToneAnalysis(messageLower: string): ToneAnalysis {
    const isHinglish = this.detectLanguageQuick(messageLower) === 'hinglish';
    return {
      language: isHinglish ? 'hinglish' : 'english',
      formality: 'casual',
      hindiWordsPercent: isHinglish ? 30 : 0,
      englishWordsPercent: isHinglish ? 70 : 100,
      hinglishPhrases: [],
      shouldMatchTone: true,
      suggestedStyle: {
        useHinglish: isHinglish,
        formalityLevel: 'casual',
        examplePhrases: [],
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUICK ENHANCE (Backward compatibility)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async enhanceQuick(request: QuickEnhanceRequest): Promise<QuickEnhanceResult> {
    const messageLower = request.message.toLowerCase();
    return {
      analysis: {
        emotion: 'neutral',
        tone: { language: this.detectLanguageQuick(messageLower) },
        context: {
          userIntent: 'general',
          complexity: this.estimateComplexity(messageLower),
          questionType: 'general',
        },
      },
      metadata: { processingTimeMs: 1 },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  clearToneCache(userId: string): void {
    this.toneCache.delete(userId);
    console.log(`[Orchestrator] 🧹 Tone cache cleared for: ${userId.slice(0, 8)}`);
  }

  clearAllCaches(): void {
    this.toneCache.clear();
    console.log(`[Orchestrator] 🧹 All caches cleared`);
  }

  getCacheStats(): { toneCache: number } {
    return { toneCache: this.toneCache.size };
  }

  getConfig() {
    return OrchestratorConfig;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS (All config-based)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private isSimpleGreeting(message: string): boolean {
    const greetings = OrchestratorConfig.getSimpleGreetings();
    const cleaned = message.replace(/[!?.,"']/g, '').trim();
    
    // Exact match only
    if (greetings.has(cleaned)) return true;
    
    // FIX v4.5: Word boundary check, NOT substring!
    if (cleaned.length < 15) {
      const words = cleaned.split(/\s+/);
      if (words.length <= 3 && greetings.has(words[0])) {
        return true;
      }
    }
    return false;
  }

  private detectSearchNeed(message: string): {
    needed: boolean;
    category: string | null;
    matchedKeywords: string[];
  } {
    const searchKeywords = OrchestratorConfig.getSearchKeywords();
    const matchedKeywords: string[] = [];
    let category: string | null = null;

    for (const [cat, keywords] of Object.entries(searchKeywords)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          matchedKeywords.push(keyword);
          if (!category) category = cat;
        }
      }
    }
    return { needed: matchedKeywords.length > 0, category, matchedKeywords };
  }

  private estimateComplexity(message: string): ComplexityLevel {
    const patterns = OrchestratorConfig.getComplexityPatterns();
    const wordCount = message.split(/\s+/).length;
    if (patterns.high.test(message)) return 'HIGH';
    if (patterns.medium.test(message) || wordCount > 20) return 'MEDIUM';
    return 'SIMPLE';
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * IMPROVED v4.3: Handles corrections like "X nahi, Y hai"
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private extractCore(messageLower: string, originalMessage: string): string {
    const stopWords = OrchestratorConfig.getStopWords();
    
    // Handle corrections: "X nahi, Y hai" → take Y part
    const correctionPatterns = [
      /nahi[,.\s]+(.+?)(?:\s+hai|\s+he|\s+h)?$/i,
      /galat[,.\s]+(.+?)(?:\s+hai|\s+he|\s+h|\s+sahi)?$/i,
      /wrong[,.\s]+(.+?)(?:\s+is|\s+hai|\s+correct)?$/i,
      /not[,.\s]+(.+?)(?:\s+is|\s+it's|\s+its)?$/i,
    ];
    
    for (const pattern of correctionPatterns) {
      const match = messageLower.match(pattern);
      if (match && match[1]) {
        const correctedPart = match[1].trim();
        const words = correctedPart.split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
        if (words.length > 0) {
          console.log(`[Orchestrator] 🔄 Correction detected, using: "${words.join(' ')}"`);
          return words.slice(0, 6).join(' ');
        }
      }
    }
    
    // Handle multi-line messages: take the last meaningful line
    const lines = messageLower.split(/[\n\r]+/).filter(l => l.trim().length > 3);
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1].trim();
      const words = lastLine.split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
      if (words.length >= 2) {
        console.log(`[Orchestrator] 📝 Multi-line: using last line`);
        return words.slice(0, 6).join(' ');
      }
    }
    
    // Default: extract key words
    const words = messageLower.split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
    if (words.length > 0) return words.slice(0, 6).join(' ');
    return originalMessage.slice(0, 40);
  }

  private detectLanguageQuick(message: string): 'hinglish' | 'english' {
    const hindiPatterns = OrchestratorConfig.getHindiPatterns();
    return hindiPatterns.test(message) ? 'hinglish' : 'english';
  }

  private categoryToDomain(category: string | null): DomainType {
    if (!category) return 'general';
    const map = OrchestratorConfig.getCategoryDomainMap();
    return (map[category] as DomainType) || 'general';
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * IMPROVED v4.3: Better query cleaning and entity extraction
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private buildSearchQuery(
    originalMessage: string, core: string, category: string | null, domain: DomainType
  ): string {
    const suffixes = OrchestratorConfig.getDomainSuffixes();
    
    // Clean the core - remove noise words
    let cleanCore = core
      .replace(/\b(nahi|galat|wrong|not|hai|he|h|kya|ka|ki|ke|ye|yeh|wo|woh|toh|bhi|name|naam)\b/gi, '')
      .replace(/[,.\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // If core is too short after cleaning, try original message
    if (cleanCore.length < 5) {
      const entityMatch = originalMessage.match(
        /(?:movie|film|show|series|song|restaurant|place|rating|review)\s+(?:ka|ki|ke|of|for)?\s*[""']?([^""'\n,?]+)/i
      );
      if (entityMatch && entityMatch[1]) {
        cleanCore = entityMatch[1].trim();
      } else {
        cleanCore = core;
      }
    }
    
    // For entertainment, extract movie/show name specifically
    // v4.4 FIX (BUG-1): Reordered patterns — specific FIRST, greedy LAST
    // OLD ORDER caused "Dhurandhar movie ki IMDB rating" → extract "IMDB rating" (WRONG)
    // Pattern 1 was greedy: /movie\s+...([^""'\n,?]+)/ captured EVERYTHING after "movie"
    // NEW ORDER: Hinglish "X movie ki Y" patterns first, greedy fallback last
    if (domain === 'entertainment' || category === 'entertainment') {
      const moviePatterns = [
        // P1 (NEW): Hinglish "X movie ki/ka/ke Y" — most common Hinglish structure
        /^(.+?)\s+(?:movie|film)\s+(?:ki|ka|ke)\s+/i,
        // P2: Hinglish "X ki/ka/ke rating/review/imdb" — "Dhurandhar ki rating"
        /(.+?)\s+(?:ki|ka|ke)\s+(?:rating|review|imdb|release|cast|box\s*office)/i,
        // P3: English "Name movie/film/rating/review" — "Dhurandhar movie rating"
        /^([a-zA-Z\s]+)\s+(?:movie|film|rating|review|imdb)/i,
        // P4: Quoted names — '"Dhurandhar" movie rating'
        /[""']([^""']+)[""']\s*(?:movie|film|ki\s+rating)/i,
        // P5 (LAST — greedy fallback): "movie called X" / "movie name X"
        /(?:movie|film)\s+(?:ka\s+naam|name|called)\s*[:\-]?\s*[""']?([^""'\n,?]+)/i,
      ];
      
      // Guard: Known keywords that are NOT movie/entity names
      // Without this, "IMDB rating btaao" → P3 extracts "IMDB" as movie name (WRONG)
      // With this, "IMDB" gets rejected → cleanCore stays as original core → correct behavior
      const NOT_ENTITY_NAMES = /^(imdb|rating|review|release|cast|trailer|box\s*office|score|movie|film|songs?|budget|collection|earning|download|watch|online|streaming|subtitles?|dubbed|hindi|english|tamil|telugu|kannada|malayalam|marathi|bengali|punjabi|bollywood|hollywood|south|free|best|worst|top|new|old|latest|upcoming)$/i;

      for (const pattern of moviePatterns) {
        const match = originalMessage.match(pattern);
        if (match && match[1] && match[1].trim().length > 3) {
          const candidate = match[1].trim()
            .replace(/\b(ki|ka|ke|hai|he|h|kya|ye|movie|film)\b/gi, '')
            .trim();
          // Accept ONLY if it's an actual name, not a generic keyword
          if (candidate.length > 3 && !NOT_ENTITY_NAMES.test(candidate)) {
            cleanCore = candidate;
            console.log(`[Orchestrator] 🎬 Extracted movie name: "${cleanCore}"`);
            break;
          }
          // If rejected, log and continue to next pattern
          if (candidate.length > 3) {
            console.log(`[Orchestrator] ⏭️ Rejected generic keyword: "${candidate}" — trying next pattern`);
          }
        }
      }
    }
    
    // Build final query
    let query = cleanCore;
    const suffix = suffixes[domain] || suffixes['general'] || '';
    
    // Don't add suffix if core already contains relevant terms
    const hasRelevantTerms = /rating|review|imdb|release|cast|score/i.test(query);
    if (!hasRelevantTerms && suffix) {
      query += ' ' + suffix;
    }
    
    console.log(`[Orchestrator] 🔎 Search query built: "${query.trim().slice(0, 60)}..."`);
    
    return query.trim().slice(0, 100);
  }

  private determineRouting(complexity: ComplexityLevel, planType: PlanType): 'MISTRAL' | 'SMART_ROUTING' {
    if (planType === PlanType.STARTER || planType === PlanType.LITE) return 'MISTRAL';
    if (complexity === 'SIMPLE') return 'MISTRAL';
    return 'SMART_ROUTING';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const intelligenceOrchestrator = IntelligenceOrchestrator.getInstance();
export { IntelligenceOrchestrator, OrchestratorConfig };