/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CHAT SERVICE v2.3 - Usage Alert Enhanced
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ✨ NEW: Usage Alert System (75% warning, 100% limit)
 * ✨ ENHANCED: Clean UX - No counters in main chat
 * ✨ Philosophy: Show alerts only when needed
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Updated: November 18, 2025
 */

import { aiService } from '../../services/ai/ai.service';
// 🧠 SORIVA INTELLIGENCE LAYER
import IntelligenceOrchestrator from '../../services/ai/intelligence/orchestrator.service';
import { IntelligenceRequest, IntelligenceResponse } from '../../services/ai/intelligence/intelligence.types';
import usageService from '../../modules/billing/usage.service';
import { BrainService } from '../../services/ai/brain.service';
// NEW MEMORY MODULE (Refactored)
import {
  getMemoryContext,
  clearUserMemoryCache,
  getSafeProWelcomeHints,
  getSafeApexWelcomeHints,
  buildProWelcomePrompt,
  buildApexWelcomePrompt,
  getTimeAwareHints,
  getLateNightCareHints,
  buildTimeAwarePrompt,
} from './memory';
import { personalityEngine } from '../../services/ai/personality.engine';
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
import encryptionUtil from '@/shared/utils/encryption-util';
import { branchingService } from './services/branching.service';
import sessionManager from './session.manager';
import { Gender, AgeGroup } from '@prisma/client';
import { contextAnalyzer } from '../../services/analyzers/context.analyzer';
import { locationService } from '../location/location.service';
import { sorivaIntelligence } from '../../services/ai/intelligence/soriva-intelligence';
// Create RAG service instance
const ragService = RAGService.getInstance();
// Create Intelligence Orchestrator instance
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
  region?: 'IN' | 'INTL';  // ← NEW: Region for model routing
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
    promptTokens: number;        // ✅ ADD
    completionTokens: number;    // ✅ ADD
    totalTokens: number;         // ✅ ADD
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
  usageAlert?: AlertResponse | null; // ✅ NEW: Usage alert system
  forge?: {  // 🔥 NEW: Forge content detection
    type: 'CODE' | 'HTML' | 'JSON' | 'MARKDOWN';
    language: string;
    title: string;
    content: string;
  } | null;
  error?: string;
  reason?: string;
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
// CHAT SERVICE CLASS (ENHANCED WITH USAGE ALERTS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ChatService {
  private static instance: ChatService;

  private constructor() {
    console.log('[ChatService] 🚀 Initialized with Usage Alert System v2.3');
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

    // Memory context only for PLUS and above
        let memoryContext = null;
        if (user.planType !== 'STARTER') {
          memoryContext = await getMemoryContext(userId);
        }
       if (memoryContext) {
      const memoryString = typeof memoryContext === 'string' 
        ? memoryContext 
        : JSON.stringify(memoryContext);
      if (memoryString.length > 200) {
        if (typeof memoryContext === 'object') {
          memoryContext = { summary: memoryString.substring(0, 200) + '...' } as any;
        } else {
          memoryContext = memoryString.substring(0, 200) + '...' as any;
        }
        console.log('[ChatService] 🔪 Memory truncated to save tokens');
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌟 WELCOME BACK HINTS (Plan-based)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    let welcomePromptSection = '';
    const planType = user.planType;
    
    if (planType === 'APEX' || planType === 'SOVEREIGN') {
      const apexHints = await getSafeApexWelcomeHints(userId);
      if (apexHints) {
        welcomePromptSection = buildApexWelcomePrompt(apexHints);
        console.log('[ChatService] 🌟 APEX welcome hints applied');
      }
    } else if (planType === 'PRO') {
      const proHints = await getSafeProWelcomeHints(userId);
      if (proHints) {
        welcomePromptSection = buildProWelcomePrompt(proHints);
        console.log('[ChatService] 👋 PRO welcome hints applied');
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌙 TIME-AWARE CARE (Late night detection)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    
    console.log('[ChatService] 🎭 Building personality...');

    const isFirstMessage = history.length === 0;
    let daysSinceLastChat = 0;

    if (chatSession.lastMessageAt) {
      const daysDiff = (Date.now() - chatSession.lastMessageAt.getTime()) / (1000 * 60 * 60 * 24);
      daysSinceLastChat = Math.floor(daysDiff);
    }

    const genderForPersonality = personalizationContext?.gender === Gender.MALE 
      ? 'male' 
      : personalizationContext?.gender === Gender.FEMALE 
      ? 'female' 
      : 'other';

    const ageGroupForPersonality = personalizationContext?.ageGroup === AgeGroup.YOUNG
      ? 'young'
      : personalizationContext?.ageGroup === AgeGroup.MIDDLE
      ? 'middle'
      : personalizationContext?.ageGroup === AgeGroup.SENIOR
      ? 'senior'
      : undefined;
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌙 TIME-AWARE CARE (Late night detection)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    let timeAwarePromptSection = '';
    
    // Only for PRO+ plans
    if (planType === 'PRO' || planType === 'APEX' || planType === 'SOVEREIGN') {
      const userIdentity = {
        name: personalizationContext?.name || user.name || undefined,
        gender: genderForPersonality as 'male' | 'female' | 'other',
      };
      
      const lateNightHints = getLateNightCareHints(userIdentity, userId);
      if (lateNightHints.shouldShowCare) {
        timeAwarePromptSection = buildTimeAwarePrompt(lateNightHints, userIdentity);
        console.log('[ChatService] 🌙 Late night care hints applied:', lateNightHints.careLevel);
      }
    }


    const personality = personalityEngine.buildPersonality({
      userName: personalizationContext?.name || user.name || undefined,
      gender: genderForPersonality,
      ageGroup: ageGroupForPersonality,
      planType: user.planType as any,
      brainMode: (options.brainMode as any) || 'friendly',
      isFirstMessage,
      isReturningUser: daysSinceLastChat > 0,
      daysSinceLastChat,
      userMessage: message,
      conversationHistory: conversationHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧠 SORIVA INTELLIGENCE LAYER v2.0
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const intelligence = sorivaIntelligence.process({
      message,
      userId,
      userName: personalizationContext?.name || user.name || undefined,
      planType: user.planType as 'STARTER' | 'PLUS' | 'PRO' | 'APEX',
      history: conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    });

    console.log('[ChatService] 🧠 Soriva Intelligence:', {
      intent: intelligence.primaryIntent,
      complexity: intelligence.complexity,
      safety: intelligence.safety,
      promptTokens: intelligence.promptTokens,
      analysisTime: intelligence.analysisTimeMs + 'ms',
    });

   // If blocked by safety
      if (intelligence.blocked) {
        throw new Error('Content policy violation');
      }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎉 GREETING INJECTION (Simple greetings - No LLM needed!)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const simpleGreetings = ['hi', 'hello', 'hey', 'hii', 'hola', 'namaste', 'hlo', 'hiiii', 'heyyy'];
const isSimpleGreeting = simpleGreetings.includes(message.trim().toLowerCase());

if (isFirstMessage && isSimpleGreeting && personality.greeting) {
  console.log('[ChatService] 🎉 Simple greeting detected - Using greeting service (0 tokens!)');
  
  // 🔐 Encrypt greeting
  const encryptedGreeting = this.encryptMessage(personality.greeting);
  
  const assistantMessage = await prisma.message.create({
    data: {
      sessionId: chatSession.id,
      userId,
      role: 'assistant',
      content: encryptedGreeting.content,
      encryptedContent: encryptedGreeting.encryptedContent,
      encryptionIV: encryptedGreeting.encryptionIV,
      encryptionAuthTag: encryptedGreeting.encryptionAuthTag,
      aiModel: 'greeting-service',
      wordsUsed: this.countWords(personality.greeting),
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
      content: personality.greeting,
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
  };
}
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 APPEND MEMORY HINTS TO SYSTEM PROMPT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Use Soriva Intelligence prompt (80-90% fewer tokens!)
      let enhancedSystemPrompt = intelligence.systemPrompt;

      // 📍 Location Context (only data, ~5-10 tokens)
      const locationPrompt = await locationService.getLocationPrompt(userId);
      if (locationPrompt) {
        enhancedSystemPrompt += `\n${locationPrompt}`;
        console.log('[ChatService] 📍 Location injected:', locationPrompt);
      }
    console.log('📊 BASE PROMPT:', personality.systemPrompt.length, 'chars');
    console.log('📊 LOCATION:', locationPrompt?.length || 0, 'chars');
    console.log('📊 WELCOME:', welcomePromptSection?.length || 0, 'chars');
    console.log('📊 TIME:', timeAwarePromptSection?.length || 0, 'chars');
    console.log('📊 FINAL:', enhancedSystemPrompt.length, 'chars');
    console.log('📊 SYSTEM PROMPT:', enhancedSystemPrompt);
    
    if (welcomePromptSection) {
      enhancedSystemPrompt += '\n\n' + welcomePromptSection;
    }
    
    if (timeAwarePromptSection) {
      enhancedSystemPrompt += '\n\n' + timeAwarePromptSection;
    }

    if (cacheHit && cachedResponse) {
     // 🔐 Encrypt cached assistant message
const encryptedCachedMsg = this.encryptMessage(cachedResponse.content);

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
          content: cachedResponse.content,
          branchId,
          createdAt: assistantMessage.createdAt,
        },
        cache: {
          hit: true,
          similarity: cacheSimilarity,
        },
        personalizationDetection,
        gracefulHandling: undefined,
      };
    }

    let enabledTools: string[] = [];

    if (ChatConfig.TOOLS_ENABLED && this.isPlanEligibleForTools(user.planType as any)) {
      enabledTools = options.tools || ['web_search', 'calculator', 'code_execution'];
    }

    let finalMessage = message;

   // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧠 SORIVA INTELLIGENCE LAYER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let intelligenceContext: IntelligenceResponse | null = null;
/*
// 🚀 OPTIMIZATION: Skip intelligence for simple queries
const isSimpleQuery = this.isObviouslySimple(finalMessage);

if (isSimpleQuery) {
  console.log('[ChatService] ⚡ Simple query - skipping intelligence layer');
} else {
  try {
    intelligenceContext = await intelligenceOrchestrator.enhance({
      userId,
      message: finalMessage,
      planType: user.planType as PlanType,
    });

    console.log('[ChatService] 🧠 Intelligence Layer:', {
      emotion: intelligenceContext.analysis.emotion,
      tone: intelligenceContext.analysis.tone.language,
      hasMemory: !!intelligenceContext.memoryContext,
    });
  } catch (error) {
    console.error('[ChatService] Intelligence enhancement failed:', error);
  }
} */
    const aiResponse = await aiService.chat({
      message: finalMessage,
      conversationHistory,
      memory: memoryContext,
      userId,
      planType: user.planType as any,
      language: 'english',
      userName: user.name || undefined,
      temperature: options.temperature || 0.7,
      isRepetitive: intelligence.isRepetitive,
      systemPrompt: enhancedSystemPrompt, // 🔗 Uses enhanced prompt with memory hints
      // 🧠 Intelligence Context
      emotionalContext: null,
      region: options.region || 'IN',
    } as any);
    const forgeContent = this.detectForgeContent(aiResponse.message);
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

    // 🔐 Encrypt AI assistant message
const encryptedAiMsg = this.encryptMessage(aiResponse.message);

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

    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        messageCount: { increment: 2 },
        totalTokens: { increment: aiResponse.usage.totalTokens },
        lastMessageAt: new Date(),
      },
    });

    if (ChatConfig.CACHE_ENABLED) {
      await cacheService.cacheResponse({
        userId,
        message,
        response: {
          content: aiResponse.message,
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
        lastMessage: aiResponse.message,
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
    
    // Get today's usage from database
    let usageAlert: AlertResponse | null = null;
    
    // If we have usage limits in response, calculate alert
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
        content: aiResponse.message,
        branchId,
        createdAt: assistantMessage.createdAt,
      },
      usage: {
        wordsUsed: aiResponse.usage.wordsUsed,
          promptTokens: aiResponse.usage.promptTokens,      // ✅ ADD
          completionTokens: aiResponse.usage.completionTokens, // ✅ ADD
          totalTokens: aiResponse.usage.totalTokens,        // ✅ ADD

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
       usageAlert, // ✅ Include usage alert
      forge: forgeContent, // 🔥 Include forge content
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
          content: this.decryptMessage(m), // 🔓 Decrypt before sending
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
    // Regex for ```language ... ``` blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = message.match(codeBlockRegex);
    
    if (!match) return null;
    
    const language = match[1] || 'plaintext';
    const content = match[2].trim();
    
    // Determine type
    let type: 'CODE' | 'HTML' | 'JSON' | 'MARKDOWN' = 'CODE';
    if (language === 'html') type = 'HTML';
    if (language === 'json') type = 'JSON';
    if (language === 'markdown' || language === 'md') type = 'MARKDOWN';
    
    // Generate title from first line or language
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
        content, // Keep original for backward compatibility
        encryptedContent: encrypted.encrypted,
        encryptionIV: encrypted.iv,
        encryptionAuthTag: encrypted.authTag,
      };
    } catch (error) {
      console.error('[ChatService] ❌ Encryption failed:', error);
      // Fallback: store unencrypted if encryption fails
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
      // If encrypted fields exist, decrypt
      if (message.encryptedContent && message.encryptionIV && message.encryptionAuthTag) {
        return encryptionUtil.decrypt({
          encrypted: message.encryptedContent,
          iv: message.encryptionIV,
          authTag: message.encryptionAuthTag,
        });
      }
      // Fallback: return plain content
      return message.content;
    } catch (error) {
      console.error('[ChatService] ❌ Decryption failed:', error);
      // Fallback: return original content
      return message.content;
    }
  }
  private isObviouslySimple(message: string): boolean {
  const trimmed = message.trim().toLowerCase();
  const wordCount = trimmed.split(/\s+/).length;
  
  // ONLY 1-2 word messages that are clearly greetings
  if (wordCount <= 2) {
    const obviousGreetings = ['hi', 'hello', 'hey', 'bye', 'thanks', 'ok'];
    return obviousGreetings.includes(trimmed);
  }
  
  return false;
}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const chatService = ChatService.getInstance();