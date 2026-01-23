/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CHAT SERVICE v2.5 - Intelligence Layer + Delta Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ✨ REFACTORED: Removed personalityEngine, using greetingService
 * ✨ REFACTORED: Using soriva-delta-engine for prompts
 * ✨ ENHANCED: Clean UX - No counters in main chat
 * ✨ NEW v2.5: Intelligence Layer for ALL users (not just premium)
 * ✨ NEW v2.5: braveSearchService.smartSearch() integration
 * ✨ NEW v2.5: Max 200-250 prompt tokens enforced
 * 
 * PHILOSOPHY: Quality SAME for ALL plans, only limits differ
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Updated: January 2026
 */

import { aiService } from '../../services/ai/ai.service';
// 🧠 SORIVA INTELLIGENCE LAYER (v2.5 - Now used for ALL users)
import { 
  sorivaIntelligence, 
  SorivaInput, 
  SorivaOutput 
} from '../../core/ai/soriva-intelligence';
import usageService from '../../modules/billing/usage.service';
import { BrainService } from '../../services/ai/brain.service';
import { braveSearchService } from './services/search/brave-search.service';
import { detectSearchIntent, mightNeedSearch } from './services/search/searchIntentDetector';
import { festivalService } from '../../services/calender/festivalService';
// NEW MEMORY MODULE (Refactored)
import {
  getMemoryContext,
  clearUserMemoryCache,
  getSafeProWelcomeHints,
  getSafeApexWelcomeHints,
  buildProWelcomePrompt,
  buildApexWelcomePrompt,
  getMemoryHints,
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
import encryptionUtil from '@/shared/utils/encryption-util';
import { branchingService } from './services/branching.service';
import sessionManager from './session.manager';
import { Gender, AgeGroup } from '@prisma/client';
import { contextAnalyzer } from '../../services/analyzers/context.analyzer';
import { locationService } from '../location/location.service';
// ✅ RESTRUCTURED: All AI imports from single source
import { 
  greetingService, 
  type LanguagePreference 
} from '../../core/ai';

// ✅ NEW: Delta Engine for optimized prompts
import { 
  classifyIntent, 
  buildDelta,
} from '../../core/ai/soriva-delta-engine';

// 🔱 BRAHMASTRA: Preprocessor for Mistral-first architecture
import { sorivaPreprocessor } from '../../core/ai/soriva-preprocessor';

// Create RAG service instance
const ragService = RAGService.getInstance();

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
  static readonly MAX_PROMPT_TOKENS = parseInt(process.env.MAX_PROMPT_TOKENS || '250');
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
    console.log('[ChatService] 🚀 Initialized v2.5 - Intelligence Layer for ALL users');
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
    // 🌟 WELCOME BACK HINTS (Plan-based - Feature difference, not quality)
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
    // 🌙 TIME-AWARE CARE (Late night detection) - ALL USERS NOW
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    console.log('[ChatService] 🎭 Building greeting...');

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

    let timeAwarePromptSection = '';
    
    // ✅ v2.5: Time-aware care for ALL users (Quality = Same for all)
    const userIdentity = {
      name: personalizationContext?.name || user.name || undefined,
      gender: genderForPersonality as 'male' | 'female' | 'other',
    };
    
    const memoryHints = getMemoryHints(userIdentity, userId);
    if (memoryHints.careLevel !== 'none') {
      timeAwarePromptSection = `🌙 ${memoryHints.timeContext} | Care: ${memoryHints.careLevel}`;
      console.log('[ChatService] 🌙 Time-aware applied:', memoryHints.careLevel);
    }

    // ✅ Generate greeting using greetingService
    const greetingResult = greetingService.generateGreeting({
      userName: personalizationContext?.name || user.name || undefined,
      planType: user.planType as PlanType,
      language: 'hinglish' as LanguagePreference,
      isReturningUser: daysSinceLastChat > 0,
      daysSinceLastChat,
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧠 SORIVA INTELLIGENCE LAYER v5.0 - ALL USERS (Quality = Same)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Prepare input for Intelligence Layer
    const intelligenceInput: SorivaInput = {
      message: message,
      userId: userId,
      userName: user.name || undefined,
      planType: user.planType as 'STARTER' | 'PLUS' | 'PRO' | 'APEX',
      history: conversationHistory.map(h => ({
        role: h.role,
        content: h.content
      }))
    };

    // ✅ Analyze message with Soriva Intelligence (ALL USERS - no plan check!)
    const intelligenceResult: SorivaOutput = sorivaIntelligence.process(intelligenceInput);
    
    console.log('[ChatService] 🧠 Intelligence Layer Analysis:', {
      intent: intelligenceResult.primaryIntent,
      complexity: intelligenceResult.complexity,
      language: intelligenceResult.language,
      emotion: intelligenceResult.emotion,
      safety: intelligenceResult.safety,
      blocked: intelligenceResult.blocked,
      promptTokens: intelligenceResult.promptTokens,
      healthMode: intelligenceResult.healthResponseMode || 'none',
    });

    // ⛔ BLOCKED CONTENT CHECK
    if (intelligenceResult.blocked) {
      console.log('[ChatService] ⛔ Message blocked by Intelligence Layer');
      return {
        success: false,
        error: 'Content blocked',
        reason: intelligenceResult.blockReason || 'Safety violation detected'
      };
    }

    // 🏥 HEALTH SAFETY - Log support resources if needed
    if (intelligenceResult.safety === 'escalate' && intelligenceResult.supportResources) {
      console.log('[ChatService] 🏥 Mental health support resources available');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎉 GREETING INJECTION (Simple greetings - No LLM needed!)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const isSimpleGreeting = greetingService.isSimpleGreeting(message);

    if (isFirstMessage && isSimpleGreeting && greetingResult.greeting) {
      console.log('[ChatService] 🎉 Simple greeting detected - Using greeting service (0 tokens!)');
      
      // 🔐 Encrypt greeting
      const encryptedGreeting = this.encryptMessage(greetingResult.greeting);
      
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
          wordsUsed: this.countWords(greetingResult.greeting),
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
          content: greetingResult.greeting,
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
          intent: intelligenceResult.primaryIntent,
          complexity: intelligenceResult.complexity,
          language: intelligenceResult.language,
          safety: intelligenceResult.safety,
          promptTokens: 0,
        },
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 SYSTEM PROMPT CONSTRUCTION (Max 200-250 tokens!)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // ═══════════════════════════════════════════════════════════════
// 🔱 BRAHMASTRA: Delta Engine + Intelligence Layer MERGE
// ═══════════════════════════════════════════════════════════════

// Step 1: Get intent from Delta Engine
const deltaIntent = classifyIntent(user.planType as any, message);

// Step 2: Build Delta prompt (Identity + Language + Behavior + Style + Plan Tone)
const deltaPrompt = buildDelta(user.planType as any, deltaIntent);

// Step 3: Get Intelligence prompt (Safety + Health + Context + Emotion)
const intelligencePrompt = intelligenceResult.systemPrompt;

// Step 4: MERGE - Delta first (personality), then Intelligence (safety/context)
let finalSystemPrompt = `${deltaPrompt}

${intelligencePrompt}`;

console.log('[ChatService] 🔱 BRAHMASTRA Merge Complete:', {
  deltaIntent,
  planType: user.planType,
  promptLength: finalSystemPrompt.length,
});

    // 📍 Location Context (minimal ~5-10 tokens)
    const locationPrompt = await locationService.getLocationPrompt(userId);
    if (locationPrompt) {
      finalSystemPrompt += `\n${locationPrompt}`;
      console.log('[ChatService] 📍 Location injected');
    }
    
    if (welcomePromptSection) {
      finalSystemPrompt += '\n' + welcomePromptSection;
    }
    
    if (timeAwarePromptSection) {
      finalSystemPrompt += '\n' + timeAwarePromptSection;
    }

    // 🌍 User's timezone (fallback to IST)
    const userTimezone = user.timezone || 'Asia/Kolkata';
    const now = new Date();

    const currentDate = now.toLocaleDateString('en-IN', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short',
      timeZone: userTimezone
    });
    console.log('🕐 DEBUG - Current Date Object:', now);
    console.log('🕐 DEBUG - Year:', now.getFullYear());         
    const currentTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone
    });

    finalSystemPrompt += `\n📅 ${currentDate}, ${currentTime}`;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 CACHE HIT HANDLING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
    // 🔍 INTELLIGENT SEARCH v2.2 (Web Fetch + Prompt Pool)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    let webSearchContext = '';
    let festivalContext = '';
    let promptTokensUsed = 0;
    
    // Quick pre-check (sync, fast, 0 cost)
    if (mightNeedSearch(message)) {
      console.log('[ChatService] 🔍 Possible search query detected...');
      
      try {
        // Get user location for context
        const locationContext = await locationService.getSearchContext(userId);
        const locationString = locationContext?.searchString || 'India';
        
        // LLM-based intent detection (smart, no hardcoding!)
        const searchIntent = await detectSearchIntent({
          message,
          userLocation: locationString,
        });
        
        console.log('[ChatService] 🧠 Search Intent:', {
          needsSearch: searchIntent.needsSearch,
          type: searchIntent.type,
          confidence: Math.round(searchIntent.confidence * 100) + '%',
          hasFestivalData: !!searchIntent.festivalData,
        });
        
        // ─────────────────────────────────────────────────────────
        // 🎉 FESTIVAL HANDLING (Priority 1)
        // ─────────────────────────────────────────────────────────
        if (searchIntent.type === 'festival' && searchIntent.festivalData) {
          const festivalResult = searchIntent.festivalData;
          
          if (festivalResult.success && festivalResult.primaryFestival) {
            // We have accurate festival data - use it directly!
            festivalContext = festivalService.formatForContext(festivalResult);
            console.log('[ChatService] 🎉 Festival context injected:', festivalResult.primaryFestival.name);
            
            // If festival has description, we might not need Brave Search
            if (!festivalResult.primaryFestival.description) {
              // Festival found but no description - supplement with Web Fetch
              console.log('[ChatService] 🔍 Supplementing festival info with Web Fetch...');
              const fetchResult = await braveSearchService.smartSearchWithFetch(
                searchIntent.searchQuery,
                locationString,
                true // enableWebFetch
              );
              if (fetchResult.fact && fetchResult.fact.length > 0) {
                webSearchContext = `[LIVE DATA] ${fetchResult.fact} [/LIVE]`;
                promptTokensUsed = fetchResult.totalPromptTokens;
              }
            }
          } else {
            // No festival found for today - use Web Fetch as fallback
            console.log('[ChatService] ⚠️ No festival today - using Web Fetch');
            const fetchResult = await braveSearchService.smartSearchWithFetch(
              searchIntent.searchQuery,
              locationString,
              true
            );
            if (fetchResult.fact && fetchResult.fact.length > 0) {
              webSearchContext = `[LIVE DATA] ${fetchResult.fact} [/LIVE]`;
              promptTokensUsed = fetchResult.totalPromptTokens;
            }
          }
        }
        
        // ─────────────────────────────────────────────────────────
        // 🔍 NON-FESTIVAL SEARCH (news/sports/finance/etc)
        // ─────────────────────────────────────────────────────────
        else if (searchIntent.needsSearch && searchIntent.confidence >= 0.5) {
          console.log('[ChatService] 🔍 Web Fetch triggered...');
          console.log('[ChatService] 📝 Optimized Query:', searchIntent.searchQuery);
          
          const fetchResult = await braveSearchService.smartSearchWithFetch(
            searchIntent.searchQuery,
            locationString,
            true // enableWebFetch
          );
          
          if (fetchResult.fact && fetchResult.fact.length > 0) {
            webSearchContext = `[LIVE DATA - ${searchIntent.type.toUpperCase()}] ${fetchResult.fact} [/LIVE]`;
            promptTokensUsed = fetchResult.totalPromptTokens;
            console.log('[ChatService] ✅ Web Fetch result injected:', fetchResult.fact.slice(0, 50));
          }
        }
        
        // ─────────────────────────────────────────────────────────
        // ⏭️ NO SEARCH NEEDED
        // ─────────────────────────────────────────────────────────
        else {
          console.log('[ChatService] ⏭️ Search skipped - not needed');
        }

        // ─────────────────────────────────────────────────────────
        // 💰 DEDUCT PROMPT TOKENS FROM POOL
        // ─────────────────────────────────────────────────────────
        if (promptTokensUsed > 0) {
          console.log('');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('💰 [ChatService] PROMPT TOKEN DEDUCTION');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`📝 Prompt Tokens Used: ${promptTokensUsed}`);
          
          const deductResult = await usageService.deductPromptTokens(userId, promptTokensUsed);
          
          if (deductResult.success) {
            console.log(`✅ Deducted: ${deductResult.tokensDeducted} tokens`);
            console.log(`📉 Pool Remaining: ${deductResult.poolRemaining.toLocaleString()}`);
          } else {
            console.log(`⚠️ Deduction failed: ${deductResult.message}`);
          }
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
        
      } catch (e: any) {
        console.error('[ChatService] ❌ Search/Festival detection failed:', e.message);
        // Silent fail - don't block the response
      }
    }

    // Add contexts to system prompt
     if (festivalContext) {
      finalSystemPrompt += '\n' + festivalContext;
    }
    if (webSearchContext) {
      finalSystemPrompt += '\n' + webSearchContext;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔱 BRAHMASTRA: Mini Instruction for Warm + Proactive Response
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Existing search logic handles: Web fetch + Data
    // Preprocessor handles: Response style + Proactive hints
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    try {
      const locationContext = await locationService.getSearchContext(userId);
      const locationString = locationContext?.searchString || 'India';

      // 🔱 Preprocessor for personality layer only (search already done above)
      const preprocessorResult = await sorivaPreprocessor.process({
        message,
        userId,
        userName: user.name || undefined,
        planType: user.planType as any,
        userLocation: locationString,
        history: conversationHistory,
      });

      console.log('[ChatService] 🔱 Brahmastra Personality:', {
        intent: preprocessorResult.routing.intent,
        proactiveHint: preprocessorResult.responseGuidance.proactiveHint,
        tokensUsed: preprocessorResult.tokensUsed,
      });

      // Add personality instruction (without data - data already added above)
      if (preprocessorResult.miniInstruction && !preprocessorResult.fetchedData) {
        // Only add style guidance, not data (avoid duplicate)
        const styleInstruction = `
        RESPONSE STYLE:
        - User: ${user.name || 'Friend'}
        - Tone: Warm, respectful, helpful (female voice)
        - Language: ${preprocessorResult.responseGuidance.language === 'hinglish' ? 'Hinglish (Roman script, karungi/bataungi)' : 'English'}
        ${preprocessorResult.responseGuidance.proactiveHint ? `- Proactive: Offer ${preprocessorResult.responseGuidance.proactiveHint} naturally` : ''}`;
                
                finalSystemPrompt += '\n' + styleInstruction;
              }

              // 💰 Deduct Preprocessor tokens (Mistral analysis cost)
              if (preprocessorResult.tokensUsed > 0) {
                const deductResult = await usageService.deductPromptTokens(userId, preprocessorResult.tokensUsed);
                console.log(`[ChatService] 🔱 Brahmastra Tokens: ${preprocessorResult.tokensUsed} (Pool: ${deductResult.poolRemaining?.toLocaleString() || 'N/A'})`);
              }

            } catch (e: any) {
              console.error('[ChatService] ⚠️ Brahmastra personality failed (non-critical):', e.message);
              // Non-critical - existing search/response will still work
            }
            


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 TOKEN DEBUG (Ensure 200-250 limit)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const estimatedPromptTokens = Math.ceil(finalSystemPrompt.length / 4);
    
    console.log('═══════════════════════════════════════');
    console.log('📊 TOKEN DEBUG (Target: 200-250 max):');
    console.log('📊 System Prompt Length:', finalSystemPrompt.length, 'chars');
    console.log('📊 Estimated Prompt Tokens:', estimatedPromptTokens);
    console.log('📊 User Message:', message.length, 'chars');
    console.log('📊 History Messages:', conversationHistory.length);
    console.log('📊 Intelligence Tokens:', intelligenceResult.promptTokens);
    
    // ⚠️ TOKEN LIMIT WARNING
    if (estimatedPromptTokens > ChatConfig.MAX_PROMPT_TOKENS) {
      console.warn(`⚠️ [ChatService] PROMPT TOKENS EXCEEDED ${ChatConfig.MAX_PROMPT_TOKENS}! Current:`, estimatedPromptTokens);
      // Truncate system prompt to stay within limits
      const maxChars = ChatConfig.MAX_PROMPT_TOKENS * 4;
      finalSystemPrompt = finalSystemPrompt.substring(0, maxChars);
      console.log('📊 Truncated to:', Math.ceil(finalSystemPrompt.length / 4), 'tokens');
    } else {
      console.log('✅ [ChatService] Prompt tokens within limit');
    }
    console.log('═══════════════════════════════════════');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤖 AI CALL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const aiResponse = await aiService.chat({
      message: finalMessage,
      conversationHistory,
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
        content: aiResponse.message,
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
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const chatService = ChatService.getInstance();