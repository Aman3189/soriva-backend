/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MEMORY SERVICE - PLAN-BASED CONVERSATION MEMORY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: November 4, 2025
 * Purpose: Intelligent conversation memory with plan-based retention
 *
 * Features:
 * - Plan-based retention: STARTER(5d) → LIFE(25d)
 * - Auto-cleanup after 30 days
 * - Important message tagging
 * - Memory statistics
 * - Context-aware retrieval
 * - Semantic search (keyword-based)
 * - Relevant memory extraction (NEW)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';
import { PlanType } from '../../../constants/plans';
import { EmotionType } from '../emotion.detector';
import {
  MEMORY_LIMITS,
  StoredMessage,
  MemoryRetrievalOptions,
  MemoryStats,
  MemorySummary,
  MessageRole,
} from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MEMORY_CONFIG = {
  MAX_RETENTION_DAYS: 30, // System-wide cleanup
  DEFAULT_RETRIEVAL_LIMIT: 20,
  MAX_RETRIEVAL_LIMIT: 100,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  IMPORTANT_KEYWORDS: [
    'remember',
    'important',
    "don't forget",
    'remind me',
    'keep in mind',
    'note that',
    'crucial',
    'critical',
  ],
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEMORY SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class MemoryService {
  private static instance: MemoryService;
  private prisma: PrismaClient;

  // In-memory cache
  private statsCache: Map<string, { stats: MemoryStats; timestamp: Date }> = new Map();

  /**
   * Private constructor (Singleton)
   */
  private constructor() {
    this.prisma = new PrismaClient();
    console.log('[MemoryService] ✅ Initialized - Plan-based memory active');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MESSAGE STORAGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Store a conversation message
   */
  public async storeMessage(data: {
    userId: string;
    conversationId?: string;
    role: MessageRole;
    content: string;
    emotion?: EmotionType;
    metadata?: {
      tokens?: number;
      model?: string;
      tags?: string[];
    };
  }): Promise<StoredMessage> {
    try {
      const { userId, conversationId, role, content, emotion, metadata } = data;

      // Check if message is important
      const isImportant = this.detectImportance(content);

      // Store in database (assuming ConversationMessage model exists)
      const message = await this.prisma.conversationMessage.create({
        data: {
          userId,
          conversationId: conversationId || `conv_${userId}_${Date.now()}`,
          role,
          content,
          emotion,
          isImportant,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          timestamp: new Date(),
        },
      });

      // Invalidate cache
      this.statsCache.delete(userId);

      console.log(
        `[MemoryService] ✅ Message stored: ${role} (important: ${isImportant})`
      );

      return this.convertToStoredMessage(message);
    } catch (error) {
      console.error('[MemoryService] ❌ Failed to store message:', error);
      throw new Error('Failed to store message');
    }
  }

  /**
   * Store multiple messages (batch)
   */
  public async storeMessages(
    userId: string,
    messages: Array<{
      role: MessageRole;
      content: string;
      emotion?: EmotionType;
      metadata?: any;
    }>
  ): Promise<StoredMessage[]> {
    try {
      const conversationId = `conv_${userId}_${Date.now()}`;
      const storedMessages: StoredMessage[] = [];

      for (const msg of messages) {
        const stored = await this.storeMessage({
          userId,
          conversationId,
          ...msg,
        });
        storedMessages.push(stored);
      }

      console.log(
        `[MemoryService] ✅ Batch stored: ${messages.length} messages`
      );

      return storedMessages;
    } catch (error) {
      console.error('[MemoryService] ❌ Batch store failed:', error);
      throw new Error('Failed to store messages');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MESSAGE RETRIEVAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Retrieve messages for a user (plan-based)
   */
  public async retrieveMessages(
    userId: string,
    planType: PlanType,
    options?: MemoryRetrievalOptions
  ): Promise<StoredMessage[]> {
    try {
      const dayLimit = MEMORY_LIMITS[planType];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayLimit);

      const limit = Math.min(
        options?.limit || MEMORY_CONFIG.DEFAULT_RETRIEVAL_LIMIT,
        MEMORY_CONFIG.MAX_RETRIEVAL_LIMIT
      );

      // Build query
      const where: any = {
        userId,
        timestamp: { gte: cutoffDate },
      };

      // Apply filters
      if (options?.beforeDate) {
        where.timestamp.lte = options.beforeDate;
      }
      if (options?.afterDate) {
        where.timestamp.gte = options.afterDate;
      }
      if (options?.emotionFilter && options.emotionFilter.length > 0) {
        where.emotion = { in: options.emotionFilter };
      }
      if (options?.importantOnly) {
        where.isImportant = true;
      }
      if (!options?.includeSystem) {
        where.role = { not: 'system' };
      }

      // Search query (keyword-based semantic search)
      if (options?.searchQuery) {
        where.content = {
          contains: options.searchQuery,
          mode: 'insensitive',
        };
      }

      // Fetch messages
      const messages = await this.prisma.conversationMessage.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      console.log(
        `[MemoryService] ✅ Retrieved ${messages.length} messages (${planType}, ${dayLimit}d)`
      );

      return messages.map((msg) => this.convertToStoredMessage(msg));
    } catch (error) {
      console.error('[MemoryService] ❌ Retrieval failed:', error);
      throw new Error('Failed to retrieve messages');
    }
  }

  /**
   * Get recent conversation context
   */
  public async getRecentContext(
    userId: string,
    planType: PlanType,
    messageCount: number = 10
  ): Promise<StoredMessage[]> {
    try {
      const messages = await this.retrieveMessages(userId, planType, {
        limit: messageCount,
        includeSystem: false,
      });

      // Return in chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      console.error('[MemoryService] ❌ Context retrieval failed:', error);
      throw new Error('Failed to get context');
    }
  }

  /**
   * Search messages by keywords
   */
  public async searchMessages(
    userId: string,
    planType: PlanType,
    query: string,
    limit: number = 10
  ): Promise<StoredMessage[]> {
    try {
      const messages = await this.retrieveMessages(userId, planType, {
        searchQuery: query,
        limit,
      });

      console.log(
        `[MemoryService] ✅ Search found ${messages.length} results for: "${query}"`
      );

      return messages;
    } catch (error) {
      console.error('[MemoryService] ❌ Search failed:', error);
      throw new Error('Failed to search messages');
    }
  }

  /**
   * Get relevant memories for a query (for intelligence services)
   * Returns simplified format optimized for LLM context
   */
  public async getRelevantMemories(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<Array<{ content: string; timestamp: Date; importance: number }>> {
    try {
      // Extract keywords from query for better search
      const keywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .slice(0, 3)
        .join(' ');

      // Search with keywords or use recent messages if no good keywords
      const searchQuery = keywords.length > 3 ? keywords : undefined;

      // Try to determine user's plan (fallback to PRO if not available)
      // In production, you should fetch this from user profile
      const planType = PlanType.PRO;

      const messages = await this.retrieveMessages(userId, planType, {
        searchQuery,
        limit: limit * 2, // Get more to filter
        importantOnly: false,
      });

      // Score and rank messages by relevance
      const scoredMessages = messages.map((msg) => {
        let score = 0;

        // Boost important messages
        if (msg.metadata?.isImportant) {
          score += 2;
        }

        // Boost recent messages
        const ageInDays =
          (Date.now() - msg.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays < 1) score += 3;
        else if (ageInDays < 3) score += 2;
        else if (ageInDays < 7) score += 1;

        // Boost messages with query keywords
        const lowerContent = msg.content.toLowerCase();
        const queryWords = query.toLowerCase().split(/\s+/);
        queryWords.forEach((word) => {
          if (word.length > 3 && lowerContent.includes(word)) {
            score += 1;
          }
        });

        // Boost longer, more detailed messages
        if (msg.content.length > 100) score += 1;

        return {
          message: msg,
          score,
        };
      });

      // Sort by score and take top N
      const topMessages = scoredMessages
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.message);

      // Format for intelligence services
      const relevantMemories = topMessages.map((msg) => ({
        content: msg.content,
        timestamp: msg.timestamp,
        importance: msg.metadata?.isImportant ? 1 : 0.5,
      }));

      console.log(
        `[MemoryService] ✅ Retrieved ${relevantMemories.length} relevant memories for query`
      );

      return relevantMemories;
    } catch (error) {
      console.error('[MemoryService] ❌ Relevant memories retrieval failed:', error);
      // Return empty array instead of throwing to prevent breaking other services
      return [];
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEMORY STATISTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get memory statistics for user
   */
  public async getMemoryStats(userId: string, planType: PlanType): Promise<MemoryStats> {
    try {
      // Check cache
      const cached = this.statsCache.get(userId);
      if (cached && this.isCacheFresh(cached.timestamp)) {
        return cached.stats;
      }

      const dayLimit = MEMORY_LIMITS[planType];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayLimit);

      // Total messages (all time)
      const totalMessages = await this.prisma.conversationMessage.count({
        where: { userId },
      });

      // Messages in retention window
      const messagesInRetention = await this.prisma.conversationMessage.count({
        where: {
          userId,
          timestamp: { gte: cutoffDate },
        },
      });

      // User messages
      const userMessages = await this.prisma.conversationMessage.count({
        where: {
          userId,
          timestamp: { gte: cutoffDate },
          role: 'user',
        },
      });

      // Assistant messages
      const assistantMessages = await this.prisma.conversationMessage.count({
        where: {
          userId,
          timestamp: { gte: cutoffDate },
          role: 'assistant',
        },
      });

      // Oldest and newest messages
      const oldestMessage = await this.prisma.conversationMessage.findFirst({
        where: {
          userId,
          timestamp: { gte: cutoffDate },
        },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true },
      });

      const newestMessage = await this.prisma.conversationMessage.findFirst({
        where: {
          userId,
          timestamp: { gte: cutoffDate },
        },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });

      // Calculate days retained
      const daysRetained = oldestMessage
        ? Math.ceil(
            (Date.now() - oldestMessage.timestamp.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      // Utilization percentage
      const utilizationPercent =
        dayLimit > 0 ? Math.min((daysRetained / dayLimit) * 100, 100) : 0;

      const stats: MemoryStats = {
        totalMessages,
        userMessages,
        assistantMessages,
        oldestMessage: oldestMessage?.timestamp,
        newestMessage: newestMessage?.timestamp,
        daysRetained,
        planLimitDays: dayLimit,
        messagesInRetention,
        utilizationPercent: Math.round(utilizationPercent * 10) / 10,
      };

      // Cache stats
      this.statsCache.set(userId, {
        stats,
        timestamp: new Date(),
      });

      return stats;
    } catch (error) {
      console.error('[MemoryService] ❌ Stats calculation failed:', error);
      throw new Error('Failed to get memory stats');
    }
  }

  /**
   * Generate memory summary
   */
  public async generateSummary(
    userId: string,
    planType: PlanType
  ): Promise<MemorySummary> {
    try {
      const messages = await this.retrieveMessages(userId, planType, {
        limit: 50,
      });

      // Extract topics (simple keyword extraction)
      const topics = this.extractTopics(messages);

      // Find common questions
      const questions = messages
        .filter((m) => m.role === 'user' && m.content.includes('?'))
        .map((m) => m.content)
        .slice(0, 5);

      // Detect conversation style
      const avgLength =
        messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length || 0;
      const conversationStyle: 'casual' | 'formal' | 'mixed' =
        avgLength < 50 ? 'casual' : avgLength > 150 ? 'formal' : 'mixed';

      // Emotional patterns
      const emotionalPatterns = messages
        .filter((m) => m.emotion)
        .map((m) => m.emotion!)
        .filter((e, i, arr) => arr.indexOf(e) === i) // Unique
        .slice(0, 5);

      return {
        recentTopics: topics,
        commonQuestions: questions,
        userPreferences: [], // TODO: Implement preference extraction
        emotionalPatterns,
        conversationStyle,
      };
    } catch (error) {
      console.error('[MemoryService] ❌ Summary generation failed:', error);
      throw new Error('Failed to generate summary');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEANUP & MAINTENANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Cleanup old messages (30+ days)
   */
  public async cleanupOldMessages(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - MEMORY_CONFIG.MAX_RETENTION_DAYS);

      const result = await this.prisma.conversationMessage.deleteMany({
        where: {
          timestamp: { lt: cutoffDate },
        },
      });

      console.log(
        `[MemoryService] 🧹 Cleaned up ${result.count} old messages (30+ days)`
      );

      return result.count;
    } catch (error) {
      console.error('[MemoryService] ❌ Cleanup failed:', error);
      throw new Error('Failed to cleanup messages');
    }
  }

  /**
   * Delete all messages for a user
   */
  public async deleteUserMemory(userId: string): Promise<number> {
    try {
      const result = await this.prisma.conversationMessage.deleteMany({
        where: { userId },
      });

      // Clear cache
      this.statsCache.delete(userId);

      console.log(
        `[MemoryService] 🗑️ Deleted ${result.count} messages for user: ${userId}`
      );

      return result.count;
    } catch (error) {
      console.error('[MemoryService] ❌ Delete failed:', error);
      throw new Error('Failed to delete user memory');
    }
  }

  /**
   * Clear cache for user
   */
  public clearCache(userId?: string): void {
    if (userId) {
      this.statsCache.delete(userId);
      console.log(`[MemoryService] 🧹 Cache cleared for user: ${userId}`);
    } else {
      this.statsCache.clear();
      console.log('[MemoryService] 🧹 All cache cleared');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Detect if message is important
   */
  private detectImportance(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return MEMORY_CONFIG.IMPORTANT_KEYWORDS.some((keyword) =>
      lowerContent.includes(keyword)
    );
  }

  /**
   * Extract topics from messages (simple keyword extraction)
   */
  private extractTopics(messages: StoredMessage[]): string[] {
    const allText = messages.map((m) => m.content).join(' ').toLowerCase();

    // Simple word frequency
    const words = allText
      .split(/\s+/)
      .filter((w) => w.length > 4) // Filter short words
      .filter((w) => !/^[0-9]+$/.test(w)); // Filter numbers

    const wordCount = new Map<string, number>();
    words.forEach((word) => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Get top 5 words
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Convert database message to StoredMessage
   */
  private convertToStoredMessage(dbMessage: any): StoredMessage {
    return {
      id: dbMessage.id,
      role: dbMessage.role as MessageRole,
      content: dbMessage.content,
      timestamp: dbMessage.timestamp,
      emotion: dbMessage.emotion as EmotionType | undefined,
      metadata: dbMessage.metadata ? JSON.parse(dbMessage.metadata) : undefined,
    };
  }

  /**
   * Check if cache is fresh
   */
  private isCacheFresh(timestamp: Date): boolean {
    const now = Date.now();
    const age = now - timestamp.getTime();
    return age < MEMORY_CONFIG.CACHE_TTL_MS;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SHUTDOWN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Cleanup and shutdown
   */
  public async shutdown(): Promise<void> {
    try {
      this.statsCache.clear();
      await this.prisma.$disconnect();
      console.log('[MemoryService] ✅ Service shut down gracefully');
    } catch (error) {
      console.error('[MemoryService] ❌ Shutdown error:', error);
      throw error;
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default MemoryService.getInstance();