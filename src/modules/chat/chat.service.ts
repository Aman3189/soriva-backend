/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CHAT SERVICE v3.0 - LEAN PROMPT EDITION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * v3.0 TOKEN OPTIMIZATION (February 14, 2026):
 * ✨ LEAN PROMPTS: 70-85% token reduction on system prompts
 * ✨ TIERED SYSTEM: MICRO/MINI/LIGHT/FULL based on query complexity
 * ✨ REMOVED: Redundant block stacking (location, welcome, time, style)
 * ✨ COMPACT: Search data reduced from 1200 to 800 chars
 * ✨ SMART: History selection based on query type
 * 
 * BEFORE: 9360 chars (~2300 tokens) system prompts
 * AFTER:  100-800 chars (~25-200 tokens) system prompts
 * SAVINGS: 70-85% reduction
 * 
 * PHILOSOPHY: Quality SAME for ALL plans, only limits differ
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Updated: February 14, 2026
 */

import { aiService } from '../../services/ai/ai.service';
// 🔱 BRAHMASTRA v3.0: Intelligence Orchestrator
import { 
  IntelligenceOrchestrator,
  type ProcessWithPreprocessorResult,
} from '../../services/ai/intelligence/orchestrator.service';
import usageService from '../../modules/billing/usage.service';
import { geminiTokenCounter } from '../../services/gemini-token-counter.service';
import { BrainService } from '../../services/ai/brain.service';
import { SorivaSearchV2 as SorivaSearch } from './services/search';
import { memoryIntegration } from '../../services/memory';


// NEW MEMORY MODULE (Refactored)
import {
  clearUserMemoryCache,
} from './memory';
import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import { AIMessage, MessageRole } from '../../core/ai/providers';
import { AlertService, UsageStatus, AlertResponse } from '../../services/alert.service';

// NEW IMPORTS
import { RAGService } from '../../rag/services/rag.service';
import { cacheService } from './services/cache.service';
import { analyticsService } from './services/analytics.service';
import { exportService } from './services/export.service';
import { suggestionService } from './services/suggestion.service';
import { contextCompressor } from './utils/context-compressor';
import encryptionUtil from '../../shared/utils/encryption-util';
import { branchingService } from './services/branching.service';
import sessionManager from './session.manager';
import { Gender, AgeGroup } from '@prisma/client';
import { contextAnalyzer } from '../../services/analyzers/context.analyzer';

// ✅ AI Tools Integration (Conversational Document Generation)

import { locationService } from '../location/location.service';
// ✅ RESTRUCTURED: All AI imports from single source
import { 
  type LanguagePreference 
} from '../../core/ai';

// ✅ NEW: Delta Engine v2.5.0 for optimized prompts
import { 
  classifyIntent, 
  buildDelta,
  buildDeltaV2,
  buildSearchDelta,
  buildGreetingDelta,
} from '../../core/ai/soriva-delta-engine';

// ✅ NEW v3.0: Lean Prompt Builder for 70-85% token savings
import {
  buildLeanSystemPrompt,
  getPromptTier,
  buildLeanSearchContext,
  selectLeanHistory,
  isFollowUpQuery,
  type PromptTier,
} from './lean-prompt.service';

// ✅ NEW: Query Router for direct responses (0 tokens!)
import { 
  routeQuery, 
  type RouterResult,
  type UserContext as RouterUserContext 
} from '../../core/soriva-query-router';



// Create RAG service instance
const ragService = RAGService.getInstance();

// 🔱 BRAHMASTRA: Intelligence Orchestrator
const intelligenceOrchestrator = IntelligenceOrchestrator.getInstance();


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION (100% DYNAMIC)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ChatConfig {
  static readonly CACHE_ENABLED = process.env.CHAT_CACHE_ENABLED === 'true';
  static readonly CACHE_TTL = parseInt(process.env.CHAT_CACHE_TTL || '3600');
  static readonly CACHE_SIMILARITY_THRESHOLD = parseFloat(
    process.env.CHAT_CACHE_SIMILARITY_THRESHOLD || '0.85'
  );
  static readonly STREAMING_ENABLED = process.env.STREAMING_ENABLED !== 'false';
  static readonly STREAMING_CHUNK_SIZE = parseInt(process.env.STREAMING_CHUNK_SIZE || '10');
  static readonly RAG_ENABLED = process.env.RAG_ENABLED === 'true';
  static readonly RAG_MIN_PLAN = process.env.RAG_MIN_PLAN || 'PRO';
  static readonly RAG_TOP_K = parseInt(process.env.RAG_TOP_K || '5');
  static readonly ANALYTICS_ENABLED = process.env.ANALYTICS_ENABLED !== 'false';
  static readonly TRACK_SENTIMENT = process.env.TRACK_SENTIMENT === 'true';
  static readonly TRACK_TOPICS = process.env.TRACK_TOPICS === 'true';
  static readonly CONTEXT_MAX_TOKENS = parseInt(process.env.CONTEXT_MAX_TOKENS || '4000');
  static readonly CONTEXT_COMPRESSION_ENABLED = process.env.CONTEXT_COMPRESSION_ENABLED === 'true';
  static readonly MAX_RETRY_ATTEMPTS = parseInt(process.env.MAX_RETRY_ATTEMPTS || '3');
  static readonly RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS || '1000');
  static readonly BRANCHING_ENABLED = process.env.BRANCHING_ENABLED !== 'false';
  static readonly MAX_BRANCHES = parseInt(process.env.MAX_BRANCHES || '5');
  static readonly TOOLS_ENABLED = process.env.TOOLS_ENABLED === 'true';
  static readonly TOOLS_MIN_PLAN = process.env.TOOLS_MIN_PLAN || 'PRO';
  static readonly SUGGESTIONS_ENABLED = process.env.SUGGESTIONS_ENABLED === 'true';
  static readonly MAX_SUGGESTIONS = parseInt(process.env.MAX_SUGGESTIONS || '3');
  static readonly PERSONALIZATION_DETECTION_ENABLED = process.env.PERSONALIZATION_DETECTION_ENABLED !== 'false';
  static readonly PERSONALIZATION_SUGGESTION_THRESHOLD = parseFloat(
    process.env.PERSONALIZATION_SUGGESTION_THRESHOLD || '0.65'
  );
  static readonly MIN_MESSAGES_FOR_DETECTION = parseInt(process.env.MIN_MESSAGES_FOR_DETECTION || '1');
  // ✅ NEW v2.5: Max prompt tokens (200-250 limit)
  static readonly MAX_PROMPT_TOKENS = parseInt(process.env.MAX_PROMPT_TOKENS || '3500');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES (ENHANCED WITH USAGE ALERTS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SendMessageOptions {
  userId: string;
  message: string;
  sessionId?: string;
  parentMessageId?: string;
  brainMode?: string;
  attachments?: Array<{
    type: 'file' | 'image' | 'document';
    url: string;
    name: string;
  }>;
  tools?: string[];
  temperature?: number;
  streaming?: boolean;
  region?: 'IN' | 'INTL';
  mode?: 'normal' | 'code';
  isModeSwitchFollowUp?: boolean;  // 🎯 Flag for mode switch auto follow-up
}

interface SendMessageResult {
  success: boolean;
  sessionId?: string;
  message?: {
    id: string;
    role: string;
    content: string;
    branchId?: string;
    createdAt: Date;
  };
  usage?: {
    wordsUsed: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    remainingDaily: number;
    remainingMonthly: number;
    usagePercentage?: number;
  };
  suggestions?: string[];
  tools?: Array<{
    name: string;
    result: any;
  }>;
  rag?: {
    documentsUsed: number;
    citations: string[];
  };
  // 🔗 Web Search Sources (v11.0)
  webSources?: Array<{
    title: string;
    url: string;
  }>;
  cache?: {
    hit: boolean;
    similarity?: number;
  };
  personalizationDetection?: {
    detected: boolean;
    gender?: Gender;
    ageGroup?: AgeGroup;
    confidence: {
      gender: number;
      ageGroup: number;
    };
    shouldSuggest: boolean;
  };
  gracefulHandling?: {
    conflictDetected: boolean;
    conflictType: string | null;
    conflictSeverity: string | null;
    userIntent: string | null;
    validationScore: number;
    passedValidation: boolean;
    criticalViolations: number;
    suggestedAction: string | null;
    processingTimeMs: number;
  };
  usageAlert?: AlertResponse | null;
  forge?: {
    type: 'CODE' | 'HTML' | 'JSON' | 'MARKDOWN';
    language: string;
    title: string;
    content: string;
  } | null;
  // ✅ NEW v2.5: Intelligence analysis metadata
  intelligence?: {
    intent: string;
    complexity: string;
    language: string;
    safety: string;
    promptTokens: number;
  };
  error?: string;
  reason?: string;
  // 📊 Visual Education Engine
  visual?: {
    subject: string;
    type: string;
    title: string;
    description?: string;
    data: any;
  };
  // 🗜️ Context Compaction Message (for long conversations)
  compactionMessage?: string;
}

interface CachedResponse {
  content: string;
  model: string;
  wordsUsed: number;
  timestamp: number;
}

interface ChatResponse {
  content: string;
  model: string;
  tokens?: number;
  cached?: boolean;
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface StreamMessageOptions extends SendMessageOptions {
  onChunk: (chunk: string) => void;
  onComplete: (result: SendMessageResult) => void;
  onError: (error: Error) => void;
}

interface EditMessageOptions {
  userId: string;
  sessionId: string;
  messageId: string;
  newContent: string;
  createBranch?: boolean;
}

interface RegenerateOptions {
  userId: string;
  sessionId: string;
  messageId: string;
  temperature?: number;
}

interface ChatHistoryResult {
  success: boolean;
  session?: {
    id: string;
    title: string | null;
    aiModel: string | null;
    messageCount: number;
    branches?: number;
    isPinned?: boolean;
    isArchived?: boolean;
    createdAt: Date;
  };
  messages?: Array<{
    id: string;
    role: string;
    content: string;
    wordsUsed: number | null;
    branchId?: string | null;
    parentMessageId?: string | null;
    reactions?: {
      thumbsUp: number;
      thumbsDown: number;
    };
    createdAt: Date;
  }>;
  error?: string;
}

interface UserChatsResult {
  success: boolean;
  sessions?: Array<{
    id: string;
    title: string | null;
    aiModel: string | null;
    messageCount: number;
    lastMessage?: string;
    isPinned?: boolean;
    isArchived?: boolean;
    branches?: number;
    updatedAt: Date;
    createdAt: Date;
  }>;
  error?: string;
}

interface SearchChatsOptions {
  userId: string;
  query: string;
  limit?: number;
  includeArchived?: boolean;
}

interface SearchChatsResult {
  success: boolean;
  results?: Array<{
    sessionId: string;
    sessionTitle: string;
    messageId: string;
    messageContent: string;
    relevanceScore: number;
    createdAt: Date;
  }>;
  error?: string;
}

interface ExportOptions {
  userId: string;
  sessionId: string;
  format: 'pdf' | 'json' | 'markdown';
  includeMetadata?: boolean;
  includeAnalytics?: boolean;
}

interface ExportResult {
  success: boolean;
  data?: Buffer | string;
  filename?: string;
  error?: string;
}

interface AnalyticsResult {
  success: boolean;
  analytics?: {
    totalConversations: number;
    totalMessages: number;
    totalWords: number;
    totalTokens: number;
    averageMessagesPerConversation: number;
    topTopics?: string[];
    sentimentDistribution?: {
      positive: number;
      neutral: number;
      negative: number;
    };
    toolsUsage?: Record<string, number>;
    timeSpentMinutes: number;
  };
  error?: string;
}

interface ReactToMessageOptions {
  userId: string;
  messageId: string;
  reaction: 'thumbsUp' | 'thumbsDown';
}

interface PinConversationOptions {
  userId: string;
  sessionId: string;
  pinned: boolean;
}

interface ArchiveConversationOptions {
  userId: string;
  sessionId: string;
  archived: boolean;
}

interface DeleteResult {
  success: boolean;
  message?: string;
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHAT SERVICE CLASS (ENHANCED WITH INTELLIGENCE LAYER FOR ALL)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ChatService {
  private static instance: ChatService;

  private constructor() {
    console.log('[ChatService] 🚀 Initialized v2.7 - Intelligence Layer + Delta Engine v2.5.0');
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(options: SendMessageOptions): Promise<SendMessageResult> {
    const startTime = Date.now();
    let retryCount = 0;

    while (retryCount < ChatConfig.MAX_RETRY_ATTEMPTS) {
      try {
        return await this.sendMessageInternal(options, startTime);
      } catch (error: any) {
        retryCount++;

        if (retryCount >= ChatConfig.MAX_RETRY_ATTEMPTS) {
          throw error;
        }

        console.log(`[ChatService] Retry ${retryCount}/${ChatConfig.MAX_RETRY_ATTEMPTS}...`);

        await this.delay(ChatConfig.RETRY_DELAY_MS * retryCount);
      }
    }

    throw new Error('Max retry attempts exceeded');
  }

  private async sendMessageInternal(
    options: SendMessageOptions,
    startTime: number
  ): Promise<SendMessageResult> {
    const { userId, message, sessionId, parentMessageId, attachments } = options;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        gender: true,
        planType: true,
        memoryDays: true,
        responseDelay: true,
        timezone: true, 
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const plan = plansManager.getPlanByName(user.planType);
    if (!plan) {
      return { success: false, error: 'Invalid subscription plan' };
    }

    let cacheHit = false;
    let cachedResponse: CachedResponse | null = null;
    let cacheSimilarity: number | undefined;

    if (ChatConfig.CACHE_ENABLED && !parentMessageId) {
      const cacheResult = await cacheService.checkCache({
        userId,
        message,
        sessionId,
        planType: user.planType as any,
        similarityThreshold: ChatConfig.CACHE_SIMILARITY_THRESHOLD,
      });

      if (cacheResult.hit && cacheResult.response) {
        cacheHit = true;
        cachedResponse = cacheResult.response;
        cacheSimilarity = cacheResult.similarity;

        console.log(
          `[ChatService] 🎯 Cache HIT! Similarity: ${Math.round((cacheSimilarity || 0) * 100)}%`
        );
      } else {
        console.log('[ChatService] ⚠️ Cache MISS');
      }
    }

    if (!cacheHit) {
      const estimatedWords = Math.ceil(message.length / 5) + 100;

      const canUse = await usageService.canUseWords(userId, estimatedWords);

      if (!canUse.canUse) {
        return {
          success: false,
          error: canUse.reason || 'Usage limit exceeded',
          reason: canUse.reason?.includes('Daily')
            ? 'daily_limit_exceeded'
            : 'monthly_limit_exceeded',
        };
      }
    }

    let chatSession;

    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId },
      });

      if (!chatSession) {
        return { success: false, error: 'Chat session not found' };
      }
    } else {
      const sessionTitle = this.generateSessionTitle(message);
      
      const sessionResult = await sessionManager.createSession({
        userId,
        title: sessionTitle,
        aiModel: plan.aiModels[0].modelId,
      });

      if (!sessionResult.success || !sessionResult.session) {
        return { success: false, error: 'Failed to create session' };
      }

      chatSession = sessionResult.session;
    }

    const personalizationContext = await sessionManager.getPersonalizationContext(chatSession.id);

    console.log('[ChatService] 🎭 Current Personalization:', {
      name: personalizationContext?.name,
      gender: personalizationContext?.gender,
      age: personalizationContext?.ageGroup,
    });

    let branchId: string | undefined;

    if (ChatConfig.BRANCHING_ENABLED && parentMessageId) {
      const branchResult = await branchingService.createBranch({
        sessionId: chatSession.id,
        parentMessageId,
        userId,
      });

      if (branchResult.success) {
        branchId = branchResult.branchId;
        console.log(`[ChatService] 🌳 Created branch: ${branchId}`);
      }
    }

    const userMessageWords = this.countWords(message);

    // 🔐 Encrypt user message
    const encryptedUserMsg = this.encryptMessage(message);

    const userMessage = await prisma.message.create({
      data: {
        sessionId: chatSession.id,
        userId,
        role: 'user',
        content: encryptedUserMsg.content,
        encryptedContent: encryptedUserMsg.encryptedContent,
        encryptionIV: encryptedUserMsg.encryptionIV,
        encryptionAuthTag: encryptedUserMsg.encryptionAuthTag,
        wordsUsed: userMessageWords,
        branchId: branchId || null,
        parentMessageId: parentMessageId || null,
      },
    });

    const historyLimit = (user.memoryDays || 5) * 10;

    let history = await prisma.message.findMany({
      where: {
        sessionId: chatSession.id,
        ...(branchId && { branchId }),
      },
      orderBy: { createdAt: 'asc' },
      take: historyLimit,
    });
    history = history.map(msg => ({
      ...msg,
      content: this.decryptMessage(msg),
    }));

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GENDER/AGE DETECTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    let personalizationDetection: SendMessageResult['personalizationDetection'];

    if (
      ChatConfig.PERSONALIZATION_DETECTION_ENABLED &&
      (personalizationContext?.gender === 'NOT_SPECIFIED' || 
       personalizationContext?.ageGroup === 'NOT_SPECIFIED') &&
      history.length >= ChatConfig.MIN_MESSAGES_FOR_DETECTION
    ) {
      console.log('[ChatService] 🔍 Analyzing conversation for gender/age detection...');

      const recentHistory = history.slice(-5).map(m => m.content);
      const contextAnalysis = contextAnalyzer.analyze(message, recentHistory);

      console.log('[ChatService] 📊 Detection Results:', {
        detectedGender: contextAnalysis.detectedGender,
        detectedAgeGroup: contextAnalysis.detectedAgeGroup,
        genderConfidence: Math.round((contextAnalysis.personalizationConfidence.gender) * 100) + '%',
        ageConfidence: Math.round((contextAnalysis.personalizationConfidence.ageGroup) * 100) + '%',
        shouldSuggest: contextAnalysis.shouldSuggestPersonalization,
      });

      personalizationDetection = {
        detected: contextAnalysis.detectedGender !== undefined || contextAnalysis.detectedAgeGroup !== undefined,
        gender: contextAnalysis.detectedGender,
        ageGroup: contextAnalysis.detectedAgeGroup,
        confidence: {
          gender: contextAnalysis.personalizationConfidence.gender,
          ageGroup: contextAnalysis.personalizationConfidence.ageGroup,
        },
        shouldSuggest: contextAnalysis.shouldSuggestPersonalization,
      };

      if (contextAnalysis.shouldSuggestPersonalization) {
        console.log('[ChatService] ✨ High confidence detection! Storing suggestion...');

        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO personalization_suggestions (
              "sessionId", "userId", "detectedGender", "detectedAgeGroup",
              "genderConfidence", "ageConfidence", "status", "createdAt"
            ) VALUES (
              '${chatSession.id}', '${userId}',
              ${contextAnalysis.detectedGender ? `'${contextAnalysis.detectedGender}'` : 'NULL'},
              ${contextAnalysis.detectedAgeGroup ? `'${contextAnalysis.detectedAgeGroup}'` : 'NULL'},
              ${contextAnalysis.personalizationConfidence.gender},
              ${contextAnalysis.personalizationConfidence.ageGroup},
              'PENDING', NOW()
            ) ON CONFLICT ("sessionId") DO UPDATE SET
              "detectedGender" = EXCLUDED."detectedGender",
              "detectedAgeGroup" = EXCLUDED."detectedAgeGroup",
              "genderConfidence" = EXCLUDED."genderConfidence",
              "ageConfidence" = EXCLUDED."ageConfidence",
              "updatedAt" = NOW()
          `);

          console.log('[ChatService] ✅ Personalization suggestion stored in database');
        } catch (dbError) {
          console.log('[ChatService] ⚠️ Could not store suggestion:', dbError);
        }
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Track compaction message for frontend display
    let compactionMessage: string | undefined;

    if (ChatConfig.CONTEXT_COMPRESSION_ENABLED) {
      const totalTokens = this.estimateTokens(history.map((m) => m.content).join('\n'));

      if (totalTokens > ChatConfig.CONTEXT_MAX_TOKENS) {
        console.log(`[ChatService] ⚠️ Context too large (${totalTokens} tokens), compressing...`);

        const compressResult = contextCompressor.compress(
          history.map((m) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
            timestamp: m.createdAt,
          })),
          user.planType as PlanType,
          {
            maxTokens: ChatConfig.CONTEXT_MAX_TOKENS,
            keepRecent: 5,
          }
        );

        history = compressResult.compressed.map((msg: any, idx: number) => ({
          ...history[idx],
          content: msg.content,
        }));

        // Store compaction message for frontend
        compactionMessage = compressResult.compactionMessage;

        console.log(
          `[ChatService] ✅ Context compressed to ${this.estimateTokens(
            history.map((m) => m.content).join('\n')
          )} tokens`
        );
      }
    }

    const conversationHistory: AIMessage[] = history
      .filter((m) => m.id !== userMessage.id)
      .map((m) => ({
        role: m.role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT,
        content: m.content,
      }));

    const ragContext: any = null;
    const ragDocumentsUsed = 0;
    const ragCitations: string[] = [];

    console.log('[ChatService] 🧠 Retrieving memory...');

    // NEW: 3-Layer Memory System
    let memoryContext = null;
    let memoryPromptContext = '';

    if (user.planType !== 'STARTER') {
      const memoryData = await memoryIntegration.getContextForChat(userId, chatSession.id);
      if (memoryData) {
        memoryPromptContext = memoryData.promptContext;
        memoryContext = memoryData.raw;
        console.log('[ChatService] 🧠 Memory loaded:', {
          tokens: memoryData.estimatedTokens,
          totalMessages: memoryData.raw.totalMessages,
          hasSummary: !!memoryData.raw.rollingSummary,
        });
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // v3.0: REMOVED WELCOME & TIME-AWARE SECTIONS
    // These are now handled by buildLeanSystemPrompt() for FULL tier only
    // SAVINGS: ~150-200 tokens per query
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔱 BRAHMASTRA v3.0: Quick Intelligence Analysis
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Quick analysis using orchestrator (for safety checks & basic routing)
    let intelligenceResult = {
      primaryIntent: 'general',
      complexity: 'moderate',
      language: 'hi',
      emotion: 'neutral',
      safety: 'safe',
      blocked: false,
      blockReason: null as string | null,
      promptTokens: 0,
      healthResponseMode: 'none',
      supportResources: null as string[] | null,
      systemPrompt: '',
      isRepetitive: false,
      routingIntent: { requiresLowTemp: false },
    };

    try {
      // 🔱 Quick enhance for emotion & safety analysis
      const quickAnalysis = await intelligenceOrchestrator.quickEnhance({
        userId,
        message,
        planType: user.planType as PlanType,
      });

      // Map orchestrator response to intelligenceResult format
      intelligenceResult = {
        primaryIntent: quickAnalysis.analysis?.context?.userIntent || 'general',
        complexity: quickAnalysis.analysis?.context?.complexity || 'moderate',
        language: quickAnalysis.analysis?.tone?.language === 'hinglish' ? 'hi' : 'en',
        emotion: quickAnalysis.analysis?.emotion || 'neutral',
        safety: 'safe', // Safety handled by orchestrator internally
        blocked: false,
        blockReason: null,
        promptTokens: quickAnalysis.metadata?.processingTimeMs || 0,
        healthResponseMode: 'none',
        supportResources: null,
        systemPrompt: '',
        isRepetitive: false,
        routingIntent: { 
          requiresLowTemp: quickAnalysis.analysis?.context?.questionType === 'factual' 
        },
      };

      console.log('[ChatService] 🔱 Quick Intelligence Analysis:', {
        intent: intelligenceResult.primaryIntent,
        complexity: intelligenceResult.complexity,
        language: intelligenceResult.language,
        emotion: intelligenceResult.emotion,
        processingMs: quickAnalysis.metadata?.processingTimeMs,
      });

    } catch (e: any) {
      console.warn('[ChatService] ⚠️ Quick analysis failed, using defaults:', e.message);
      // Continue with default intelligenceResult - non-blocking
    }

    // ⛔ BLOCKED CONTENT CHECK (handled by orchestrator, but keep safety net)
    if (intelligenceResult.blocked) {
      console.log('[ChatService] ⛔ Message blocked by Intelligence Layer');
      return {
        success: false,
        error: 'Content blocked',
        reason: intelligenceResult.blockReason || 'Safety violation detected'
      };
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 QUERY ROUTER - Direct Response (0 tokens for simple queries!)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const routerContext: RouterUserContext = {
      userId,
      userName: user.name || undefined,
      location: (await locationService.getSearchContext(userId))?.searchString || 'India',
      language: intelligenceResult.language === 'hi' ? 'hinglish' : 'en',
      timezone: user.timezone || 'Asia/Kolkata',
    };

    const routerResult = await routeQuery(message, routerContext);

    if (routerResult.handledDirectly && routerResult.directResponse?.success) {
      console.log('[ChatService] 🚀 Query Router - DIRECT RESPONSE (0 tokens!):', {
        type: routerResult.classification?.queryType,
        source: routerResult.directResponse.source,
        timeMs: routerResult.directResponse.processingTimeMs,
      });

      // 🔐 Encrypt direct response
      const sanitizedDirectResponse = this.sanitizeIdentityLeaks(routerResult.directResponse.response);
      const encryptedDirectResponse = this.encryptMessage(sanitizedDirectResponse);

      const assistantMessage = await prisma.message.create({
        data: {
          sessionId: chatSession.id,
          userId,
          role: 'assistant',
          content: encryptedDirectResponse.content,
          encryptedContent: encryptedDirectResponse.encryptedContent,
          encryptionIV: encryptedDirectResponse.encryptionIV,
          encryptionAuthTag: encryptedDirectResponse.encryptionAuthTag,
          aiModel: 'query-router-direct',
          wordsUsed: this.countWords(routerResult.directResponse.response),
          branchId: branchId || null,
        },
      });

      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          messageCount: { increment: 2 },
          lastMessageAt: new Date(),
        },
      });

      return {
        success: true,
        sessionId: chatSession.id,
        message: {
          id: assistantMessage.id,
          role: 'assistant',
          content: sanitizedDirectResponse,
          branchId,
          createdAt: assistantMessage.createdAt,
        },
        
        usage: {
          wordsUsed: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          remainingDaily: 0,
          remainingMonthly: 0,
        },
        cache: { hit: false },
        personalizationDetection,
        intelligence: {
          intent: routerResult.classification?.queryType || 'direct',
          complexity: 'simple',
          language: intelligenceResult.language,
          safety: 'safe',
          promptTokens: 0,
        },
      };
    }

    console.log('[ChatService] 🔄 Query Router - LLM needed:', {
      
      type: routerResult.classification?.queryType,
      mode: routerResult.classification?.responseMode,
    });

    
    // ═══════════════════════════════════════════════════════════════
// 🔱 v3.0 LEAN PROMPT ENGINE - 70-85% Token Savings
// ═══════════════════════════════════════════════════════════════

const deltaIntent = classifyIntent(user.planType as any, message);

// Detect query types
const isSearchQueryFromRouter = routerResult.classification?.queryType === 'LOCAL_BUSINESS' ||
                      routerResult.classification?.queryType === 'NEWS' ||
                      routerResult.classification?.queryType === 'WEATHER'||
                      routerResult.classification?.queryType === 'MOVIE' ||
                      routerResult.classification?.queryType === 'SPORTS';

const isGreeting = routerResult.classification?.queryType === 'GREETING' || deltaIntent === 'CASUAL';

// v3.0: Prompt tier will be determined after orchestrator
let promptTier: PromptTier = 'LIGHT';
let finalSystemPrompt = '';

// v3.0: Get date/time for FULL tier only (compact format)
const userTimezone = user.timezone || 'Asia/Kolkata';
const now = new Date();
const currentDateTime = now.toLocaleDateString('en-IN', { 
  weekday: 'short',
  day: 'numeric', 
  month: 'short',
  timeZone: userTimezone
}) + ', ' + now.toLocaleTimeString('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: userTimezone
});

console.log('[ChatService] 📝 v3.0 Lean Prompt Engine initialized');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 CACHE HIT HANDLING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (cacheHit && cachedResponse) {
      // 🛡️ Sanitize cached content (could contain leaked model names from previous responses)
      const sanitizedCachedContent = this.sanitizeIdentityLeaks(cachedResponse.content);
      // 🔐 Encrypt cached assistant message
      const encryptedCachedMsg = this.encryptMessage(sanitizedCachedContent);

      const assistantMessage = await prisma.message.create({
        data: {
          sessionId: chatSession.id,
          userId,
          role: 'assistant',
          content: encryptedCachedMsg.content,
          encryptedContent: encryptedCachedMsg.encryptedContent,
          encryptionIV: encryptedCachedMsg.encryptionIV,
          encryptionAuthTag: encryptedCachedMsg.encryptionAuthTag,
          aiModel: cachedResponse.model,
          wordsUsed: cachedResponse.wordsUsed,
          branchId: branchId || null,
        },
      });

      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          messageCount: { increment: 2 },
          lastMessageAt: new Date(),
        },
      });

      if (ChatConfig.ANALYTICS_ENABLED) {
        await analyticsService.trackMessage({
          userId,
          sessionId: chatSession.id,
          messageId: assistantMessage.id,
          wordsUsed: cachedResponse.wordsUsed,
          cacheHit: true,
          responseTimeMs: Date.now() - startTime,
        });
      }

      return {
        success: true,
        sessionId: chatSession.id,
        message: {
          id: assistantMessage.id,
          role: 'assistant',
          content: sanitizedCachedContent,
          branchId,
          createdAt: assistantMessage.createdAt,
        },
        cache: {
          hit: true,
          similarity: cacheSimilarity,
        },
        personalizationDetection,
        gracefulHandling: undefined,
        intelligence: {
          intent: intelligenceResult.primaryIntent,
          complexity: intelligenceResult.complexity,
          language: intelligenceResult.language,
          safety: intelligenceResult.safety,
          promptTokens: intelligenceResult.promptTokens,
        },
      };
    }

    let enabledTools: string[] = [];

    if (ChatConfig.TOOLS_ENABLED && this.isPlanEligibleForTools(user.planType as any)) {
      enabledTools = options.tools || ['web_search', 'calculator', 'code_execution'];
    }

    let finalMessage = message;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔱 STEP 1: ORCHESTRATOR (Fast keyword analysis - NO LLM)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    let orchestratorResult: ProcessWithPreprocessorResult | null = null;
    const locationContext = await locationService.getSearchContext(userId);
    const locationString = locationContext?.searchString || 'India';
    
    try {
      orchestratorResult = await intelligenceOrchestrator.processWithPreprocessor({
          userId,
          message,
          planType: user.planType as PlanType,
          userName: user.name || undefined,
          userLocation: locationString,
          // v4.5: Pass conversation history for re-check intent detection
          conversationHistory: history.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        });

      console.log('[ChatService] 🔱 Orchestrator Analysis:', {
        complexity: orchestratorResult.complexity,
        core: orchestratorResult.core,
        searchNeeded: orchestratorResult.searchNeeded,
        searchQuery: orchestratorResult.searchQuery || 'N/A',
        processingTimeMs: orchestratorResult.processingTimeMs,
      });
    } catch (e: any) {
      console.warn('[ChatService] ⚠️ Orchestrator failed:', e.message);
    }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 FINAL isSearchQuery (after orchestrator)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 📍 LAYER 1: DOMAIN-BASED SEARCH OVERRIDE — Real-world domains MUST search
const FORCE_SEARCH_DOMAINS = ['health', 'local', 'finance', 'travel', 'shopping', 'entertainment'];
const shouldForceByDomain = orchestratorResult?.domain 
  && FORCE_SEARCH_DOMAINS.includes(orchestratorResult.domain)
  && !isSearchQueryFromRouter
  && !orchestratorResult?.searchNeeded;

// 📍 LAYER 2: MESSAGE KEYWORD FALLBACK — catches misclassified domains
// If domain detection fails (e.g., "health" not in keyword engine), 
// these keywords in the user message will STILL trigger search
const FORCE_SEARCH_KEYWORDS = /\b(scheme|yojana|insurance|bima|hospital|ilaj|treatment|doctor|medical|clinic|pharmacy|dawai|medicine|govt|government|sarkari|pension|subsidy|loan|emi|tax|gst|income tax|mutual fund|sip|stock|share market|bitcoin|crypto|weather|mausam|temperature|flight|train|bus|ticket|hotel|booking|price|rate|cost|kitna|bhav|daam|salary|naukri|vacancy|recruitment|result|admit card|syllabus|exam|board result|cutoff)\b/i;
const shouldForceByKeyword = !isSearchQueryFromRouter 
  && !orchestratorResult?.searchNeeded
  && FORCE_SEARCH_KEYWORDS.test(message);

const shouldForceSearch = shouldForceByDomain || shouldForceByKeyword;

if (shouldForceSearch) {
  const reason = shouldForceByDomain 
    ? `domain="${orchestratorResult!.domain}"` 
    : `keyword match in message`;
  console.log(`[ChatService] 🔄 FORCE SEARCH: ${reason} requires fresh data`);
  if (orchestratorResult) {
    orchestratorResult.searchNeeded = true;
    orchestratorResult.searchQuery = message;
  }
}

const isSearchQuery = isSearchQueryFromRouter || orchestratorResult?.searchNeeded === true;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// v5.1: SMART FOLLOW-UP DETECTION — Skip search, use minimal context
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Problem: "explain them" after "what are neurons" was triggering:
//   - New search (unnecessary, context already in history)
//   - 9331 char system prompt (massive token waste)
//   - 5247 tokens for simple follow-up!
// Fix: Detect follow-up patterns → skip search → use MICRO tier
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// v5.2: Enhanced follow-up detection with better patterns
const followUpPatterns = /^(explain|elaborate|more|detail|details|continue|aur|phir|iske baare|tell me more|go on|and\?|what about|how about|why|batao|btao|samjhao|aage|expand|clarify)\b/i;
const pronounPatterns = /\b(it|this|that|them|these|those|isko|usko|ise|use|ye|wo|inhe|unhe|inka|unka)\b/i;
const messageLower = message.toLowerCase().trim();
const wordCount = message.split(/\s+/).length;

// Check conditions separately for debugging
const hasFollowUpWord = followUpPatterns.test(messageLower);
const hasPronoun = pronounPatterns.test(messageLower);
const hasEnoughHistory = conversationHistory.length >= 2;
const isShortQuery = wordCount <= 8; // Increased from 6

const isLikelyFollowUp = (hasFollowUpWord || hasPronoun) && hasEnoughHistory && isShortQuery;

console.log('[ChatService] 🔍 v5.2 Follow-up Check:', {
  message: messageLower.slice(0, 30),
  hasFollowUpWord,
  hasPronoun,
  historyLength: conversationHistory.length,
  wordCount,
  isLikelyFollowUp
});

// Override search for follow-ups
let skipSearchForFollowUp = false;
if (isLikelyFollowUp) {
  skipSearchForFollowUp = true;
  console.log('[ChatService] ✅ v5.2: FOLLOW-UP DETECTED → Skip search, use MICRO tier, trim history');
}

// ═══════════════════════════════════════════════════════════════
// v3.0 LEAN PROMPT BUILD - FINAL ASSEMBLY
// ═══════════════════════════════════════════════════════════════

// Get detected language from orchestrator
const detectedLanguage = orchestratorResult?.enhancedResult?.analysis?.tone?.language || 
                         (orchestratorResult?.enhancedResult?.analysis?.tone?.shouldUseHinglish === false ? 'english' : 'hinglish');

// Determine prompt tier based on query type and complexity
promptTier = getPromptTier(
  isGreeting,
  isSearchQuery && !skipSearchForFollowUp, // Don't treat follow-up as search query
  (orchestratorResult?.complexity || 'SIMPLE') as 'SIMPLE' | 'MEDIUM' | 'HIGH'
);

// v5.1: Force MICRO tier for follow-ups (context is in history, not prompt)
if (skipSearchForFollowUp) {
  promptTier = 'MICRO';
}

// ✅ LEARNING/TECHNICAL intent needs FULL tier for detailed explanations
const isLearningIntent = orchestratorResult?.intent === 'LEARNING' || 
                         orchestratorResult?.intent === 'TECHNICAL';
if (isLearningIntent && !skipSearchForFollowUp) {
  promptTier = 'FULL';
  console.log('[ChatService] 🎓 Learning/Technical intent - using FULL tier');
}

console.log('[ChatService] 🎯 v3.0 Prompt Tier:', promptTier, {
  isGreeting,
  isSearchQuery,
  complexity: orchestratorResult?.complexity,
  language: detectedLanguage,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 STEP 2: SORIVA SEARCH v3.2 (FIXED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIXES:
// - No visible tags in response (removed [SEARCH RESULT])
// - Clear LLM instruction to TRUST search data
// - Source URL included for transparency
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let searchContext = '';
let searchTokensUsed = 0;
let webSources: Array<{ title: string; url: string }> = [];

if ((orchestratorResult?.searchNeeded || routerResult.classification?.queryType === 'LOCAL_BUSINESS') && !skipSearchForFollowUp) {
  try {
    // v3.0: Reduced content limit for token savings
    const contentLimit = orchestratorResult?.domain === 'entertainment' ? 1000 : 2000;
    
    const searchResult = await SorivaSearch.search(message, {
      userLocation: locationString,
      enableWebFetch: true,
      maxContentChars: contentLimit,
    });
    
    console.log('[ChatService] 🔎 SorivaSearch:', {
      domain: searchResult.domain,
      source: searchResult.source,
      results: searchResult.resultsFound,
      time: searchResult.totalTimeMs + 'ms',
    });
    
    // 🔗 Store sources for frontend citations (v11.0)
    if (searchResult.sources && searchResult.sources.length > 0) {
      webSources = searchResult.sources;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // v3.0 LEAN SEARCH CONTEXT (~800 chars vs 1200)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (searchResult.fact && searchResult.source !== 'none') {
      const isNumberQuery = /\b(rating|score|price|cost|kitna|kitne|kya hai|review)\b/i.test(message);
      searchContext = buildLeanSearchContext(searchResult.fact, isNumberQuery);
      
      searchTokensUsed = searchResult.promptTokens;
      
      if (searchTokensUsed > 0) {
        await usageService.deductPromptTokens(userId, searchTokensUsed);
        console.log(`[ChatService] 💰 Search tokens: ${searchTokensUsed} deducted`);
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📍 SUPPLEMENTARY LOCAL SEARCH (Layer 3 — Location Enrichment)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // v2.6 FIX (BUG-4): Smarter local enrichment
    // OLD problem: "Silverbird cinemas movies today" got "offices centers helpline"
    // appended because orchestrator misclassified domain as non-entertainment.
    // FIX: Check BOTH orchestrator domain AND SorivaSearch result domain.
    // Also cleaned up garbage keywords and added more exclusions.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Domains where local enrichment is NEVER useful
    const LOCAL_EXCLUDED_DOMAINS = new Set([
      'entertainment', 'tech', 'finance', 'education',
    ]);
    
    // Check both orchestrator AND search result domain
    const orchDomain = orchestratorResult?.domain || 'general';
    const searchDomain = searchResult?.domain || orchDomain;
    const isExcludedDomain = LOCAL_EXCLUDED_DOMAINS.has(orchDomain) 
                           || LOCAL_EXCLUDED_DOMAINS.has(searchDomain);
    
    const isLocalRelevant = !isExcludedDomain
      && locationString 
      && locationString !== 'India';

    if (isLocalRelevant && searchContext) {
      try {
        const cityName = locationString.split(/[\s,]+/)[0];
        
        // Domain-specific local keywords — targeted and useful
        const localKeywords: Record<string, string> = {
          health: `${cityName} hospitals clinics`,
          local: `${cityName} nearby`,
          shopping: `${cityName} stores shops`,
          travel: `${cityName} hotels transport`,
          general: `${cityName}`,  // v2.6 FIX: Just city name, no garbage suffix
        };
        
        const domain = orchDomain;
        const localSuffix = localKeywords[domain] || localKeywords.general;
        const localQuery = `${message} ${localSuffix}`;
        
        const localResult = await SorivaSearch.search(localQuery, {
          userLocation: locationString,
          enableWebFetch: false,
          maxContentChars: 1000,
        });

        if (localResult.fact && localResult.source !== 'none') {
          searchContext = searchContext.replace(
            '</web_search_data>',
            `\n\n--- LOCAL DATA (${cityName}) ---\n${localResult.fact}\n</web_search_data>`
          );
          
          console.log(`[ChatService] 📍 Local enrichment added for ${cityName}:`, {
            domain,
            source: localResult.source,
            results: localResult.resultsFound,
          });

          if (localResult.promptTokens > 0) {
            await usageService.deductPromptTokens(userId, localResult.promptTokens);
          }
        }
      } catch (localErr: any) {
        console.log('[ChatService] ⚠️ Local enrichment failed (non-blocking):', localErr.message);
      }
    }
  } catch (e: any) {
    console.error('[ChatService] ❌ Search failed:', e.message);
  }
}

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔱 v3.0 LEAN PROMPT: FINAL BUILD
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Build lean system prompt based on tier
    finalSystemPrompt = buildLeanSystemPrompt({
      tier: promptTier,
      userName: personalizationContext?.name || user.name || undefined,
      language: detectedLanguage as 'english' | 'hinglish' | 'hindi',
      searchData: searchContext || undefined,
      location: promptTier === 'FULL' ? locationString : undefined,
      dateTime: promptTier === 'FULL' ? currentDateTime : undefined,
      planType: user.planType,
      mode: (options.mode === 'code' ? 'code' : 'normal') as 'normal' | 'code',
      isModeSwitchFollowUp: options.isModeSwitchFollowUp || false,
    });
    if (memoryPromptContext) {
        finalSystemPrompt = finalSystemPrompt + '\n\n' + memoryPromptContext;
      }

  

    console.log('[ChatService] 🎯 v3.0 Lean Prompt Built:', {
      tier: promptTier,
      promptLength: finalSystemPrompt.length,
      searchLength: searchContext.length,
      estimatedTokens: Math.ceil(finalSystemPrompt.length / 4),
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 v3.0 TOKEN DIAGNOSTICS (Should be 70-85% less)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
const estimatedPromptTokens = Math.ceil(finalSystemPrompt.length / 4);

console.log(`
━━━━━━━━━━ v3.0 LEAN PROMPT DEBUG ━━━━━━━━━━
📏 System Prompt: ${finalSystemPrompt.length} chars
🔢 Prompt Tokens: ~${estimatedPromptTokens}
🎯 Tier: ${promptTier}
💬 User Msg: ${message.length} chars
📚 History: ${conversationHistory.length} messages
⚡ Target: <200 tokens (non-search), <300 tokens (search)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// v3.0: Truncation should rarely be needed now
if (estimatedPromptTokens > ChatConfig.MAX_PROMPT_TOKENS) {
  console.warn(`⚠️ v3.0: Unexpected prompt size (${estimatedPromptTokens}), truncating...`);
  finalSystemPrompt = finalSystemPrompt.substring(0, ChatConfig.MAX_PROMPT_TOKENS * 4);
}

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤖 AI CALL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // v3.0: Smart history selection based on query type
    const isFollowUp = isFollowUpQuery(message);
    let historyForAI = selectLeanHistory(
      conversationHistory.map(m => ({ role: m.role, content: m.content })),
      isSearchQuery && !skipSearchForFollowUp,
      isFollowUp
    );
    
    // v5.2: For follow-ups, AGGRESSIVELY trim - only last exchange needed
    if (skipSearchForFollowUp) {
      // Only keep last user message + last assistant response (2 messages max)
      historyForAI = historyForAI.slice(-2);
      console.log('[ChatService] ✂️ v5.2: Follow-up history TRIMMED to last 1 exchange (2 messages)');
    }
    
    console.log('[ChatService] 📜 v3.0 History:', historyForAI.length, 'messages (full:', conversationHistory.length, ', followUp:', isFollowUp, ', skipSearch:', skipSearchForFollowUp, ')');

    const aiResponse = await aiService.chat({
      message: finalMessage,
      conversationHistory: historyForAI as AIMessage[],
      memory: memoryContext,
      userId,
      planType: user.planType as any,
      language: intelligenceResult.language === 'hi' ? 'hinglish' : 'english',
      userName: user.name || undefined,
      temperature: intelligenceResult.routingIntent.requiresLowTemp 
        ? 0.3  // Low temp for health, technical, factual
        : (options.temperature || 0.7),
      isRepetitive: intelligenceResult.isRepetitive,
      systemPrompt: finalSystemPrompt,
      emotionalContext: intelligenceResult.emotion !== 'neutral' 
        ? { detected: true, type: intelligenceResult.emotion } 
        : null,
      region: options.region || 'IN',
      mode: (options.mode === 'code' ? 'code' : 'normal') as 'normal' | 'code',
      isModeSwitchFollowUp: options.isModeSwitchFollowUp || false,
    } as any);

    const gracefulHandling = aiResponse.metadata?.gracefulHandling;

    if (gracefulHandling) {
      console.log('[ChatService] 🎯 Graceful Handling Analytics:', {
        conflictDetected: gracefulHandling.conflictDetected,
        conflictType: gracefulHandling.conflictType,
        validationScore: gracefulHandling.validationScore,
        passedValidation: gracefulHandling.passedValidation,
        criticalViolations: gracefulHandling.criticalViolations,
      });
    }

    const responseTools = (aiResponse as any).tools || [];
    const responseSentiment = (aiResponse as any).sentiment || 'neutral';

    // 🧹 Sanitize response - remove ALL XML tags variations
      let cleanedResponse = aiResponse.message;
      
      // v4.0: BULLETPROOF cleanup - catches every possible leak pattern
      // 1. Remove specific known tags (opening + closing)
      cleanedResponse = cleanedResponse.replace(/<\/?web_search_data[^>]*>/gi, '');
      cleanedResponse = cleanedResponse.replace(/<\/?search_data[^>]*>/gi, '');
      cleanedResponse = cleanedResponse.replace(/<\/?search_instructions[^>]*>/gi, '');
      cleanedResponse = cleanedResponse.replace(/<\/?local_data[^>]*>/gi, '');
      cleanedResponse = cleanedResponse.replace(/<\/?data[^>]*>/gi, '');
      
      // 2. Catch ANY internal XML-like tags the LLM might echo back
      // Matches: <word_word>, </word_word>, <word-word>, </word-word>
      cleanedResponse = cleanedResponse.replace(/<\/?[a-z][a-z0-9]*[-_][a-z][a-z0-9_-]*[^>]*>/gi, '');
      
      // 3. Remove "Source: https://..." lines that come from search injection
      cleanedResponse = cleanedResponse.replace(/^Source:\s*https?:\/\/\S+\s*$/gm, '');
      
      // 4. Remove "--- LOCAL DATA (...) ---" section headers
      cleanedResponse = cleanedResponse.replace(/^---\s*LOCAL DATA\s*\([^)]*\)\s*---\s*$/gm, '');
      
      // 5. Clean up excessive whitespace left behind
      cleanedResponse = cleanedResponse.replace(/\n{3,}/g, '\n\n');
      cleanedResponse = cleanedResponse.trim();

      // 6. 🛡️ IDENTITY LEAK GUARD — uses shared method
      cleanedResponse = this.sanitizeIdentityLeaks(cleanedResponse);

      // 7. 🛡️ v3.0: JSON DUMP GUARD — removes raw visualization/technical JSON
      cleanedResponse = this.sanitizeJsonDumps(cleanedResponse);

      // 🔥 Forge detection on CLEANED response (moved here from before cleanup)
      const forgeContent = this.detectForgeContent(cleanedResponse);

      // 🔐 Encrypt AI assistant message
      const encryptedAiMsg = this.encryptMessage(cleanedResponse);
    const assistantMessage = await prisma.message.create({
      data: {
        sessionId: chatSession.id,
        userId,
        role: 'assistant',
        content: encryptedAiMsg.content,
        encryptedContent: encryptedAiMsg.encryptedContent,
        encryptionIV: encryptedAiMsg.encryptionIV,
        encryptionAuthTag: encryptedAiMsg.encryptionAuthTag,
        aiModel: aiResponse.metadata.model,
        tokens: aiResponse.usage.totalTokens,
        wordsUsed: aiResponse.usage.wordsUsed - userMessageWords,
        branchId: branchId || null,
      },
    });
    // NEW: Save exchange to memory system
    if (user.planType !== 'STARTER') {
      memoryIntegration.saveExchange(
        userId,
        chatSession.id,
        message,
        cleanedResponse,
        { extractFacts: true }
      ).catch(err => console.error('[ChatService] Memory save failed:', err));
    }

    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        messageCount: { increment: 2 },
        totalTokens: { increment: aiResponse.usage.totalTokens },
        lastMessageAt: new Date(),
      },
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 PROMPT TOKEN POOL DEDUCTION (ALL LLM tokens from pool)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 SMART POOL DEDUCTION (Gemini counts INPUT, Output is FREE!)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STRATEGY:
    // - Input tokens: Counted by Gemini Flash ($0.10/M - CHEAP!)
    // - Pool deduction: Only INPUT tokens
    // - Output tokens: Generated by Smart Routing LLM (Soriva's cost, not user's)
    // - User savings: ~60-70% less pool consumption!
    
    // Count input tokens using Gemini Flash (cheap tokenizer)
    const inputTokenCount = await geminiTokenCounter.countChatInputTokens(
      message,
      finalSystemPrompt,
      historyForAI.map(msg => ({ role: msg.role as 'user' | 'assistant' | 'system', content: msg.content }))
    );
    
    const inputTokensToDeduct = inputTokenCount.inputTokens;
    
    if (inputTokensToDeduct > 0) {
      const poolDeductResult = await usageService.deductPromptTokens(userId, inputTokensToDeduct);
      
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💰 [ChatService] SMART POOL DEDUCTION (INPUT ONLY!)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📥 Input Tokens (Gemini counted): ${inputTokensToDeduct}`);
      console.log(`📤 Output Tokens (FREE for user): ${aiResponse.usage.completionTokens}`);
      console.log(`📊 Pool Deducted: ${inputTokensToDeduct} (only input!)`);
      console.log(`🎁 User Saved: ${aiResponse.usage.completionTokens} tokens (output free!)`);
      console.log(`📉 Pool Remaining: ${poolDeductResult.poolRemaining?.toLocaleString() || 'N/A'}`);
      console.log(`✅ Success: ${poolDeductResult.success}`);
      console.log(`💡 Counter Model: ${inputTokenCount.model}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    if (ChatConfig.CACHE_ENABLED) {
      await cacheService.cacheResponse({
        userId,
        message,
        response: {
          content: cleanedResponse,  // ✅ FIX: Cache cleaned response, not raw
          model: aiResponse.metadata.model,
          wordsUsed: aiResponse.usage.wordsUsed,
          timestamp: Date.now(),
        },
        sessionId: chatSession.id,
        ttl: ChatConfig.CACHE_TTL,
      });
    }

    let suggestions: string[] = [];

    if (ChatConfig.SUGGESTIONS_ENABLED) {
      const suggestionResult = await suggestionService.generateSuggestions({
        userId,
        sessionId: chatSession.id,
        lastMessage: cleanedResponse,  // ✅ FIX: Use cleaned response
        conversationHistory: conversationHistory as any,
        maxSuggestions: ChatConfig.MAX_SUGGESTIONS,
      });

      if (suggestionResult.success && suggestionResult.suggestions) {
        suggestions = suggestionResult.suggestions;
      }
    }

    if (ChatConfig.ANALYTICS_ENABLED) {
      await analyticsService.trackMessage({
        userId,
        sessionId: chatSession.id,
        messageId: assistantMessage.id,
        wordsUsed: aiResponse.usage.wordsUsed,
        tokensUsed: aiResponse.usage.totalTokens,
        cacheHit: false,
        ragUsed: ragDocumentsUsed > 0,
        toolsUsed: responseTools.map((t: any) => t.name) || [],
        responseTimeMs: Date.now() - startTime,
        sentiment: responseSentiment,
      });
    }

    await BrainService.getInstance().recordSession(userId);

    clearUserMemoryCache(userId);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ USAGE ALERT CALCULATION (75% warning / 100% limit)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    let usageAlert: AlertResponse | null = null;
    
    if (aiResponse.limits?.dailyRemaining !== undefined) {
      const planLimits = plan.limits;
      const dailyRemaining = aiResponse.limits.dailyRemaining;
      const dailyLimit = planLimits.dailyTokens;
      const tokensUsed = dailyLimit - dailyRemaining;
      
      const usageStatus: UsageStatus = {
        tokensUsed,
        tokensLimit: dailyLimit,
        percentage: (tokensUsed / dailyLimit) * 100,
        resetTime: AlertService.calculateResetTime(),
      };
      
      usageAlert = AlertService.generateAlert(
        usageStatus,
        user.planType as PlanType
      );
      
      if (usageAlert) {
        console.log('[ChatService] 🚨 Usage Alert:', {
          type: usageAlert.type,
          percentage: usageAlert.percentage + '%',
          resetTime: usageAlert.resetTime + 'h',
        });
      }
    }

    return {
      success: true,
      sessionId: chatSession.id,
      message: {
        id: assistantMessage.id,
        role: 'assistant',
        content: cleanedResponse,  // ✅ FIX: Send CLEANED response to user (was aiResponse.message — leaked XML tags!)
        branchId,
        createdAt: assistantMessage.createdAt,
      },
      usage: {
        wordsUsed: aiResponse.usage.wordsUsed,
        promptTokens: aiResponse.usage.promptTokens,
        completionTokens: aiResponse.usage.completionTokens,
        totalTokens: aiResponse.usage.totalTokens,
        remainingDaily: aiResponse.limits?.dailyRemaining || 0,
        remainingMonthly: aiResponse.limits?.monthlyRemaining || 0,
      },
      suggestions,
      tools: responseTools,
      rag:
        ragDocumentsUsed > 0
          ? {
              documentsUsed: ragDocumentsUsed,
              citations: ragCitations,
            }
          : undefined,
      cache: {
        hit: false,
      },
      personalizationDetection,
      gracefulHandling,
      usageAlert,
      forge: forgeContent,
      intelligence: {
        intent: intelligenceResult.primaryIntent,
        complexity: intelligenceResult.complexity,
        language: intelligenceResult.language,
        safety: intelligenceResult.safety,
        promptTokens: intelligenceResult.promptTokens,
      },
      // 🔗 Web Sources for Citations (v11.0)
      webSources: webSources.length > 0 ? webSources : undefined,
      // 📊 Visual Education Engine
      visual: aiResponse.visual,
      // 🗜️ Context Compaction Message (for long conversations)
      compactionMessage,
    };
  }

  async streamMessage(options: StreamMessageOptions): Promise<void> {
    const { onChunk, onComplete, onError } = options;

    try {
      const result = await this.sendMessage(options);

      if (result.success && result.message) {
        const content = result.message.content;
        const chunkSize = ChatConfig.STREAMING_CHUNK_SIZE;

        for (let i = 0; i < content.length; i += chunkSize) {
          const chunk = content.substring(i, i + chunkSize);
          onChunk(chunk);
          await this.delay(50);
        }

        onComplete(result);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error: any) {
      onError(error);
    }
  }

  async editMessage(options: EditMessageOptions): Promise<SendMessageResult> {
    const { userId, sessionId, messageId, newContent, createBranch = true } = options;

    if (!ChatConfig.BRANCHING_ENABLED || !createBranch) {
      return {
        success: false,
        error: 'Message editing requires branching',
      };
    }

    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!originalMessage || originalMessage.userId !== userId) {
      return { success: false, error: 'Message not found' };
    }

    return this.sendMessage({
      userId,
      message: newContent,
      sessionId,
      parentMessageId: messageId,
    });
  }

  async regenerateResponse(options: RegenerateOptions): Promise<SendMessageResult> {
    const { userId, sessionId, messageId, temperature } = options;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.role !== 'assistant') {
      return { success: false, error: 'Invalid message for regeneration' };
    }

    const userMessage = await prisma.message.findFirst({
      where: {
        sessionId,
        createdAt: { lt: message.createdAt },
        role: 'user',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!userMessage) {
      return { success: false, error: 'User message not found' };
    }

    return this.sendMessage({
      userId,
      message: userMessage.content,
      sessionId,
      parentMessageId: userMessage.id,
      temperature: temperature || Math.random() * 0.3 + 0.7,
    });
  }

  async reactToMessage(options: ReactToMessageOptions): Promise<DeleteResult> {
    const { userId, messageId, reaction } = options;

    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      if (ChatConfig.ANALYTICS_ENABLED) {
        await analyticsService.trackReaction({
          userId,
          messageId,
          reaction,
        });
      }

      return {
        success: true,
        message: 'Reaction recorded',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to react to message',
      };
    }
  }

  private calculateUsagePercentage(remaining: number, total: number): number {
    if (total === 0) return 0;
    const used = total - remaining;
    return Math.round((used / total) * 100);
  }

  async searchChats(options: SearchChatsOptions): Promise<SearchChatsResult> {
    const { userId, query, limit = 20, includeArchived = false } = options;

    try {
      const messages = await prisma.message.findMany({
        where: {
          userId,
          content: {
            contains: query,
            mode: 'insensitive',
          },
          session: includeArchived
            ? undefined
            : {
                isArchived: false,
              },
        },
        include: {
          session: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return {
        success: true,
        results: messages.map((msg) => ({
          sessionId: msg.sessionId,
          sessionTitle: msg.session.title || 'Untitled Chat',
          messageId: msg.id,
          messageContent: msg.content.substring(0, 200),
          relevanceScore: 1.0,
          createdAt: msg.createdAt,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to search chats',
      };
    }
  }

  async exportConversation(options: ExportOptions): Promise<ExportResult> {
    try {
      return await exportService.exportChats(options as any);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to export conversation',
      };
    }
  }

  async getUserAnalytics(
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<AnalyticsResult> {
    try {
      return await analyticsService.getUserAnalytics(userId, timeRange);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get analytics',
      };
    }
  }

  async pinConversation(options: PinConversationOptions): Promise<DeleteResult> {
    const { userId, sessionId, pinned } = options;

    try {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId },
      });

      if (!session) {
        return { success: false, error: 'Chat session not found' };
      }

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { isPinned: pinned },
      });

      return {
        success: true,
        message: pinned ? 'Conversation pinned' : 'Conversation unpinned',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to pin conversation',
      };
    }
  }

  async archiveConversation(options: ArchiveConversationOptions): Promise<DeleteResult> {
    const { userId, sessionId, archived } = options;

    try {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId },
      });

      if (!session) {
        return { success: false, error: 'Chat session not found' };
      }

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { isArchived: archived },
      });

      return {
        success: true,
        message: archived ? 'Conversation archived' : 'Conversation unarchived',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to archive conversation',
      };
    }
  }

  async getChatHistory(userId: string, sessionId: string): Promise<ChatHistoryResult> {
    try {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!chatSession) {
        return { success: false, error: 'Chat session not found' };
      }

      const branches = await prisma.message.groupBy({
        by: ['branchId'],
        where: {
          sessionId,
          branchId: { not: null },
        },
      });

      return {
        success: true,
        session: {
          id: chatSession.id,
          title: chatSession.title,
          aiModel: chatSession.aiModel,
          messageCount: chatSession.messageCount,
          branches: branches.length,
          isPinned: chatSession.isPinned || false,
          isArchived: chatSession.isArchived || false,
          createdAt: chatSession.createdAt,
        },
        messages: chatSession.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: this.decryptMessage(m),
          wordsUsed: m.wordsUsed,
          branchId: m.branchId,
          parentMessageId: m.parentMessageId,
          createdAt: m.createdAt,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get chat history',
      };
    }
  }

  async getUserChats(
    userId: string,
    options?: {
      limit?: number;
      includeArchived?: boolean;
      onlyPinned?: boolean;
    }
  ): Promise<UserChatsResult> {
    const { limit = 20, includeArchived = false, onlyPinned = false } = options || {};

    try {
      const sessions = await prisma.chatSession.findMany({
        where: {
          userId,
          ...(onlyPinned && { isPinned: true }),
          ...(!includeArchived && { isArchived: false }),
        },
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        take: limit,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return {
        success: true,
        sessions: await Promise.all(
          sessions.map(async (session) => {
            const branches = await prisma.message.groupBy({
              by: ['branchId'],
              where: {
                sessionId: session.id,
                branchId: { not: null },
              },
            });

            return {
              id: session.id,
              title: session.title,
              aiModel: session.aiModel,
              messageCount: session.messageCount,
              lastMessage: session.messages[0]?.content.substring(0, 100),
              isPinned: session.isPinned || false,
              isArchived: session.isArchived || false,
              branches: branches.length,
              updatedAt: session.updatedAt,
              createdAt: session.createdAt,
            };
          })
        ),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get chats',
      };
    }
  }

  async deleteChat(userId: string, sessionId: string): Promise<DeleteResult> {
    try {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId },
      });

      if (!chatSession) {
        return { success: false, error: 'Chat session not found' };
      }

      await prisma.chatSession.delete({
        where: { id: sessionId },
      });

      clearUserMemoryCache(userId);

      return {
        success: true,
        message: 'Chat deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete chat',
      };
    }
  }

  async clearAllChats(userId: string): Promise<DeleteResult> {
    try {
      const result = await prisma.chatSession.deleteMany({
        where: { userId },
      });

      clearUserMemoryCache(userId);

      return {
        success: true,
        message: `Deleted ${result.count} chat sessions`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to clear chats',
      };
    }
  }

  async updateChatTitle(userId: string, sessionId: string, title: string): Promise<DeleteResult> {
    try {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId },
      });

      if (!chatSession) {
        return { success: false, error: 'Chat session not found' };
      }

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title },
      });

      return {
        success: true,
        message: 'Chat title updated',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update title',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private generateSessionTitle(message: string): string {
    let title = message.substring(0, 50).trim();

    if (title.length < 10) {
      return 'New Chat';
    }

    if (message.length > 50) {
      title += '...';
    }

    return title;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private isPlanEligibleForRAG(planType: PlanType): boolean {
    const eligiblePlans: PlanType[] = [
      PlanType.PRO,
      PlanType.APEX,
      PlanType.APEX,
    ];
    return eligiblePlans.includes(planType as any);
  }

  private isPlanEligibleForTools(planType: PlanType): boolean {
    const eligiblePlans: PlanType[] = [
      PlanType.PRO,
      PlanType.APEX,
      PlanType.APEX,
    ];
    return eligiblePlans.includes(planType as any);
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 🔥 FORGE DETECTION - Detect code blocks in AI response
   */
  private detectForgeContent(message: string): {
    type: 'CODE' | 'HTML' | 'JSON' | 'MARKDOWN';
    language: string;
    title: string;
    content: string;
  } | null {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = message.match(codeBlockRegex);
    
    if (!match) return null;
    
    const language = match[1] || 'plaintext';
    const content = match[2].trim();
    
    let type: 'CODE' | 'HTML' | 'JSON' | 'MARKDOWN' = 'CODE';
    if (language === 'html') type = 'HTML';
    if (language === 'json') type = 'JSON';
    if (language === 'markdown' || language === 'md') type = 'MARKDOWN';
    
    const firstLine = content.split('\n')[0];
    const title = firstLine.startsWith('//') || firstLine.startsWith('#')
      ? firstLine.replace(/^[/#\s]+/, '').substring(0, 30)
      : `${language.charAt(0).toUpperCase() + language.slice(1)} Code`;
    
    console.log('[ChatService] 🔥 Forge content detected:', { type, language, title: title.substring(0, 20) });
    
    return { type, language, title, content };
  }

  /**
   * 🔐 Encrypt message content before saving to DB
   */
  private encryptMessage(content: string): {
    content: string;
    encryptedContent: string;
    encryptionIV: string;
    encryptionAuthTag: string;
  } {
    try {
      const encrypted = encryptionUtil.encrypt(content);
      return {
        content,
        encryptedContent: encrypted.encrypted,
        encryptionIV: encrypted.iv,
        encryptionAuthTag: encrypted.authTag,
      };
    } catch (error) {
      console.error('[ChatService] ❌ Encryption failed:', error);
      return {
        content,
        encryptedContent: '',
        encryptionIV: '',
        encryptionAuthTag: '',
      };
    }
  }

  /**
   * 🔓 Decrypt message content after fetching from DB
   */
  private decryptMessage(message: any): string {
    try {
      if (message.encryptedContent && message.encryptionIV && message.encryptionAuthTag) {
        return encryptionUtil.decrypt({
          encrypted: message.encryptedContent,
          iv: message.encryptionIV,
          authTag: message.encryptionAuthTag,
        });
      }
      return message.content;
    } catch (error) {
      console.error('[ChatService] ❌ Decryption failed:', error);
      return message.content;
    }
  }

  private isObviouslySimple(message: string): boolean {
    const trimmed = message.trim().toLowerCase();
    const wordCount = trimmed.split(/\s+/).length;
    
    if (wordCount <= 2) {
      const obviousGreetings = ['hi', 'hello', 'hey', 'bye', 'thanks', 'ok'];
      return obviousGreetings.includes(trimmed);
    }
    
    return false;
  }

  /**
   * 🛡️ IDENTITY LEAK GUARD v5 — Smart Safety Net
   * Only replaces if model CLAIMS to be another AI (positive identity).
   * Does NOT replace in negative context ("I am not X").
   */
  private sanitizeIdentityLeaks(response: string): string {
    // AI model names to watch for
    const aiModels = ['DeepSeek', 'ChatGPT', 'GPT-4o', 'GPT-4', 'GPT-3\\.5', 'Claude', 'Gemini', 'Bard', 'Llama', 'Mistral', 'Copilot'];
    const aiCompanies = ['OpenAI', 'Anthropic', 'Meta AI', 'Google AI', 'Mistral AI', 'DeepSeek AI'];
    
    let result = response;
    
    // Only replace POSITIVE identity claims: "I am X", "Main X hoon", "I'm X"
    // NOT negative: "I am not X", "Main X nahi hoon", "I'm not X"
    for (const model of aiModels) {
      // Positive patterns (replace these)
      result = result.replace(new RegExp(`\\b(I am|I'm|Main|Mai)\\s+${model}\\b`, 'gi'), '$1 Soriva');
      result = result.replace(new RegExp(`\\b(I am|I'm|Main|Mai)\\s+(a|an|ek)\\s+${model}\\b`, 'gi'), '$1 $2 Soriva');
    }
    
    for (const company of aiCompanies) {
      // Only replace when claiming to be made by them
      result = result.replace(new RegExp(`\\b(made by|created by|built by|banaya|banayi)\\s+${company}\\b`, 'gi'), '$1 Risenex Dynamics');
      result = result.replace(new RegExp(`\\b${company}\\s+(ne banaya|ne banayi|made me|created me)\\b`, 'gi'), 'Risenex Dynamics $1');
    }
    
    return result;
  }

  /**
   * 🛡️ JSON DUMP GUARD v3.0 — Removes raw visualization/technical JSON from responses
   * Permanent fix for Visual Education Engine JSON leak issue
   */
  private sanitizeJsonDumps(response: string): string {
    let cleaned = response;
    const originalLength = response.length;
    
    // Pattern 1: "Visualization:" followed by JSON block
    cleaned = cleaned.replace(/Visualization:\s*\n?\s*```(?:json)?\s*\n?\{[\s\S]*?\}\s*```/gi, '');
    cleaned = cleaned.replace(/Visualization:\s*\n?\s*\{[\s\S]*?"renderInstructions"[\s\S]*?\}\s*$/gi, '');
    
    // Pattern 2: Standalone JSON with visualization keys (subject, type, renderInstructions)
    cleaned = cleaned.replace(/\{[^{}]*"subject"\s*:\s*"[^"]*"[^{}]*"type"\s*:\s*"[^"]*"[^{}]*"renderInstructions"[\s\S]*?\}(?:\s*```)?/gi, '');
    
    // Pattern 3: Code blocks containing visualization JSON
    cleaned = cleaned.replace(/```(?:json)?\s*\n?\{[\s\S]*?"(?:renderInstructions|primitives|layout)"[\s\S]*?\}\s*\n?```/gi, '');
    
    // Pattern 4: Any JSON starting with { "subject": 
    cleaned = cleaned.replace(/\{\s*"subject"\s*:\s*"(?:physics|math|chemistry|biology|science)"[\s\S]*?"renderInstructions"[\s\S]*?\}/gi, '');
    
    // Pattern 5: Leftover "Visualization:" text without content
    cleaned = cleaned.replace(/Visualization:\s*$/gim, '');
    
    // Clean up excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    // Log if we removed significant content
    if (originalLength - cleaned.length > 100) {
      console.log('[ChatService] 🛡️ JSON DUMP GUARD: Removed raw visualization data', {
        originalLength,
        cleanedLength: cleaned.length,
        removedChars: originalLength - cleaned.length,
      });
    }
    
    return cleaned;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const chatService = ChatService.getInstance();