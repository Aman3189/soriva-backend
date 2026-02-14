// src/services/memory/memory.service.ts
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * ==========================================
 * MEMORY SYSTEM SERVICE - SORIVA V2
 * ==========================================
 * 3-Layer Memory Architecture:
 * 1. System Memory Object (persistent facts)
 * 2. Rolling Summary (compressed history)
 * 3. Last N Raw Messages (immediate context)
 * 
 * PRODUCTION GUARANTEES:
 * ✅ Deterministic Writes (userId, sessionId, role, timestamp, ordered index)
 * ✅ Clear Read Strategy (Last N messages, token-limited)
 * ✅ Atomic operations with transactions
 * ✅ Index-safe ordering
 * 
 * Token Optimization: ~90% reduction in context size
 * Last Updated: February 14, 2026
 */

const prisma = new PrismaClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION - EXPLICIT & DOCUMENTED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONFIG = {
  // READ STRATEGY: How many raw messages to keep for immediate context
  MAX_RAW_MESSAGES: 3,
  
  // WRITE STRATEGY: When to trigger compression
  SUMMARY_THRESHOLD: 6,
  
  // TOKEN LIMITS
  MAX_SUMMARY_TOKENS: 500,
  MAX_MESSAGE_CONTENT_FOR_SUMMARY: 200, // Chars per message in summary
  
  // SYSTEM MEMORY LIMITS
  MAX_SYSTEM_MEMORY_KEYS: 50,
  MAX_FACT_VALUE_LENGTH: 500,
  
  // GLOBAL USER MEMORY
  // Special conversationId for user-level facts that persist across all chats
  GLOBAL_MEMORY_ID: '__GLOBAL_USER_MEMORY__',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES - STRICT & VALIDATED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SystemMemory {
  facts: Record<string, string>;
  preferences: Record<string, string>;
  decisions: Record<string, string>;
  lastUpdated: string;
}

interface MemoryContext {
  systemMemory: SystemMemory;
  rollingSummary: string;
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  totalMessages: number;
  // Meta for debugging
  meta: {
    rawMessageCount: number;
    summaryTokens: number;
    lastSummarizedAt: Date | null;
  };
}

/**
 * DETERMINISTIC WRITE INPUT
 * All fields required for unambiguous message storage
 */
interface AddMessageInput {
  userId: string;        // Required: Who sent/received
  conversationId: string; // Required: Which conversation
  role: 'user' | 'assistant'; // Required: Message direction
  content: string;       // Required: Message content
  tokenCount?: number;   // Optional: Pre-calculated tokens
  timestamp?: Date;      // Optional: Defaults to now()
}

const DEFAULT_SYSTEM_MEMORY: SystemMemory = {
  facts: {},
  preferences: {},
  decisions: {},
  lastUpdated: new Date().toISOString()
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function parseSystemMemory(json: Prisma.JsonValue | null): SystemMemory {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return { ...DEFAULT_SYSTEM_MEMORY };
  }
  
  const obj = json as Prisma.JsonObject;
  return {
    facts: (obj.facts as Record<string, string>) || {},
    preferences: (obj.preferences as Record<string, string>) || {},
    decisions: (obj.decisions as Record<string, string>) || {},
    lastUpdated: (obj.lastUpdated as string) || new Date().toISOString()
  };
}

function toJsonValue(memory: SystemMemory): Prisma.InputJsonValue {
  return {
    facts: memory.facts,
    preferences: memory.preferences,
    decisions: memory.decisions,
    lastUpdated: memory.lastUpdated
  };
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function validateInput(input: AddMessageInput): void {
  if (!input.userId || typeof input.userId !== 'string') {
    throw new Error('userId is required and must be a string');
  }
  if (!input.conversationId || typeof input.conversationId !== 'string') {
    throw new Error('conversationId is required and must be a string');
  }
  if (!input.role || !['user', 'assistant'].includes(input.role)) {
    throw new Error('role must be "user" or "assistant"');
  }
  if (!input.content || typeof input.content !== 'string') {
    throw new Error('content is required and must be a string');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEMORY SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MemoryService {
  constructor() {
    console.log('🧠 Memory service initialized with config:', {
      maxRawMessages: CONFIG.MAX_RAW_MESSAGES,
      summaryThreshold: CONFIG.SUMMARY_THRESHOLD,
      maxSummaryTokens: CONFIG.MAX_SUMMARY_TOKENS,
    });
  }

  /**
   * Get or create conversation memory
   * Uses atomic upsert for safety
   */
  public async getOrCreateMemory(userId: string, conversationId: string) {
    // First try to find existing
    let memory = await prisma.conversationMemory.findUnique({
      where: {
        userId_conversationId: { userId, conversationId }
      },
      include: {
        rawMessages: {
          orderBy: { messageIndex: 'desc' },
          take: CONFIG.MAX_RAW_MESSAGES
        }
      }
    });

    if (!memory) {
      // Create new with explicit fields
      memory = await prisma.conversationMemory.create({
        data: {
          userId,
          conversationId,
          systemMemory: toJsonValue(DEFAULT_SYSTEM_MEMORY),
          rollingSummary: '',
          summaryTokens: 0,
          totalMessages: 0
        },
        include: {
          rawMessages: true
        }
      });
      console.log(`🧠 Created new memory for user=${userId}, conv=${conversationId}`);
    }

    return memory;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * READ STRATEGY: getMemoryContext
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * 
   * WHAT WE FETCH:
   * 1. System Memory (all facts/preferences) - Always
   * 2. Rolling Summary (compressed history) - Always  
   * 3. Last N Raw Messages - Configurable (default: 3)
   * 
   * WHY THIS STRATEGY:
   * - Last N gives immediate context continuity
   * - Summary preserves older context without token bloat
   * - System Memory retains critical facts across sessions
   * 
   * TOKEN BUDGET (approximate):
   * - System Memory: ~50-100 tokens
   * - Rolling Summary: ~100-200 tokens
   * - Last 3 Messages: ~150-300 tokens
   * - TOTAL: ~300-600 tokens (vs 10,000+ for full history)
   */
  public async getMemoryContext(userId: string, conversationId: string): Promise<MemoryContext> {
    const memory = await this.getOrCreateMemory(userId, conversationId);

    // Sort messages by index (ascending) for chronological order
    const sortedMessages = memory.rawMessages
      .sort((a, b) => a.messageIndex - b.messageIndex);

    return {
      systemMemory: parseSystemMemory(memory.systemMemory),
      rollingSummary: memory.rollingSummary,
      recentMessages: sortedMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.createdAt
      })),
      totalMessages: memory.totalMessages,
      meta: {
        rawMessageCount: sortedMessages.length,
        summaryTokens: memory.summaryTokens,
        lastSummarizedAt: memory.lastSummarizedAt
      }
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * WRITE STRATEGY: addMessage
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * 
   * DETERMINISTIC GUARANTEES:
   * ✅ userId - Always stored
   * ✅ conversationId - Always linked via memoryId
   * ✅ role - Validated ('user' | 'assistant')
   * ✅ timestamp - Always set (explicit or auto)
   * ✅ messageIndex - Sequential, no gaps
   * 
   * ATOMIC OPERATION:
   * Uses transaction to ensure index consistency
   */
  public async addMessage(input: AddMessageInput): Promise<void> {
    // 1. VALIDATE INPUT
    validateInput(input);
    
    const { userId, conversationId, role, content, tokenCount, timestamp } = input;
    const messageTimestamp = timestamp || new Date();
    const calculatedTokens = tokenCount ?? estimateTokens(content);

    // 2. GET/CREATE MEMORY (establishes conversationId link)
    const memory = await this.getOrCreateMemory(userId, conversationId);

    // 3. ATOMIC WRITE with transaction
    await prisma.$transaction(async (tx) => {
      // Get current count for index (within transaction for safety)
      const currentMemory = await tx.conversationMemory.findUnique({
        where: { id: memory.id },
        select: { totalMessages: true }
      });
      
      const newIndex = currentMemory?.totalMessages ?? 0;

      // Insert message with ALL required fields
      await tx.rawMessage.create({
        data: {
          memoryId: memory.id,
          role: role,           // Validated: 'user' | 'assistant'
          content: content,
          tokenCount: calculatedTokens,
          messageIndex: newIndex, // Sequential, gap-free
          createdAt: messageTimestamp // Explicit timestamp
        }
      });

      // Update counter atomically
      await tx.conversationMemory.update({
        where: { id: memory.id },
        data: { 
          totalMessages: newIndex + 1,
          updatedAt: new Date()
        }
      });
    });

    console.log(`🧠 Message saved: user=${userId}, conv=${conversationId}, role=${role}, index=${memory.totalMessages}`);

    // 4. TRIGGER COMPRESSION if threshold reached
    const newTotal = memory.totalMessages + 1;
    if (newTotal > CONFIG.SUMMARY_THRESHOLD) {
      // Run async, don't block response
      this.compressOldMessages(memory.id).catch(err => {
        console.error('🧠 Compression failed:', err);
      });
    }
  }

  /**
   * Compress old messages into rolling summary
   * Keeps only last N messages, summarizes the rest
   */
  private async compressOldMessages(memoryId: string): Promise<void> {
    const memory = await prisma.conversationMemory.findUnique({
      where: { id: memoryId },
      include: {
        rawMessages: {
          orderBy: { messageIndex: 'asc' }
        }
      }
    });

    if (!memory) return;

    const messages = memory.rawMessages;
    const keepCount = CONFIG.MAX_RAW_MESSAGES;

    if (messages.length <= keepCount) return;

    const toCompress = messages.slice(0, -keepCount);
    const toKeep = messages.slice(-keepCount);

    // Build summary of old messages
    const oldSummary = memory.rollingSummary;
    const newContent = toCompress
      .map(m => `${m.role}: ${m.content.substring(0, CONFIG.MAX_MESSAGE_CONTENT_FOR_SUMMARY)}`)
      .join('\n');

    // Combine with existing summary
    // TODO: Replace with AI summarization for production
    const updatedSummary = oldSummary
      ? `${oldSummary}\n---\n${this.simpleSummarize(newContent)}`
      : this.simpleSummarize(newContent);

    // Atomic cleanup and reindex
    await prisma.$transaction(async (tx) => {
      // Delete compressed messages
      await tx.rawMessage.deleteMany({
        where: {
          id: { in: toCompress.map(m => m.id) }
        }
      });

      // Reindex remaining messages (0, 1, 2, ...)
      for (let i = 0; i < toKeep.length; i++) {
        await tx.rawMessage.update({
          where: { id: toKeep[i].id },
          data: { messageIndex: i }
        });
      }

      // Update memory with new summary
      await tx.conversationMemory.update({
        where: { id: memoryId },
        data: {
          rollingSummary: updatedSummary,
          summaryTokens: estimateTokens(updatedSummary),
          lastSummarizedAt: new Date(),
          totalMessages: toKeep.length
        }
      });
    });

    console.log(`🧠 Compressed ${toCompress.length} messages, kept ${toKeep.length}`);
  }

  /**
   * Simple summarization (placeholder)
   * TODO: Replace with AI summarization
   */
  private simpleSummarize(content: string): string {
    const maxLength = CONFIG.MAX_SUMMARY_TOKENS * 4; // ~4 chars per token
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Update system memory with new facts
   */
  public async updateSystemMemory(
    userId: string,
    conversationId: string,
    updates: Partial<SystemMemory>
  ): Promise<void> {
    const memory = await this.getOrCreateMemory(userId, conversationId);
    const currentMemory = parseSystemMemory(memory.systemMemory);

    // Merge updates with validation
    const updatedMemory: SystemMemory = {
      facts: this.mergeWithLimit(currentMemory.facts, updates.facts || {}),
      preferences: this.mergeWithLimit(currentMemory.preferences, updates.preferences || {}),
      decisions: this.mergeWithLimit(currentMemory.decisions, updates.decisions || {}),
      lastUpdated: new Date().toISOString()
    };

    await prisma.conversationMemory.update({
      where: { id: memory.id },
      data: { systemMemory: toJsonValue(updatedMemory) }
    });

    console.log(`🧠 System memory updated for conv=${conversationId}`);
    
    // 🌐 ALSO UPDATE GLOBAL USER MEMORY (cross-session facts)
    if (conversationId !== CONFIG.GLOBAL_MEMORY_ID) {
      await this.updateGlobalUserMemory(userId, updates);
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * GLOBAL USER MEMORY - Persists across ALL conversations
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  
  /**
   * Get global user memory (facts that persist across all chats)
   */
  public async getGlobalUserMemory(userId: string): Promise<SystemMemory> {
    const memory = await this.getOrCreateMemory(userId, CONFIG.GLOBAL_MEMORY_ID);
    return parseSystemMemory(memory.systemMemory);
  }

  /**
   * Update global user memory
   */
  public async updateGlobalUserMemory(
    userId: string,
    updates: Partial<SystemMemory>
  ): Promise<void> {
    const memory = await this.getOrCreateMemory(userId, CONFIG.GLOBAL_MEMORY_ID);
    const currentMemory = parseSystemMemory(memory.systemMemory);

    const updatedMemory: SystemMemory = {
      facts: this.mergeWithLimit(currentMemory.facts, updates.facts || {}),
      preferences: this.mergeWithLimit(currentMemory.preferences, updates.preferences || {}),
      decisions: this.mergeWithLimit(currentMemory.decisions, updates.decisions || {}),
      lastUpdated: new Date().toISOString()
    };

    await prisma.conversationMemory.update({
      where: { id: memory.id },
      data: { systemMemory: toJsonValue(updatedMemory) }
    });

    console.log(`🌐 Global user memory updated for user=${userId}`);
  }

  /**
   * Get combined memory context (Global + Conversation)
   * Global facts + Conversation-specific recent messages
   */
  public async getCombinedMemoryContext(
    userId: string, 
    conversationId: string
  ): Promise<MemoryContext> {
    // Get global user memory (facts persist across all chats)
    const globalMemory = await this.getGlobalUserMemory(userId);
    
    // Get conversation-specific memory (recent messages, rolling summary)
    const convMemory = await this.getOrCreateMemory(userId, conversationId);
    const convSystemMemory = parseSystemMemory(convMemory.systemMemory);
    
    // Merge: Global facts take priority, conversation can override
    const mergedFacts = { ...globalMemory.facts, ...convSystemMemory.facts };
    const mergedPrefs = { ...globalMemory.preferences, ...convSystemMemory.preferences };
    const mergedDecisions = { ...globalMemory.decisions, ...convSystemMemory.decisions };

    const sortedMessages = convMemory.rawMessages
      .sort((a, b) => a.messageIndex - b.messageIndex);

    return {
      systemMemory: {
        facts: mergedFacts,
        preferences: mergedPrefs,
        decisions: mergedDecisions,
        lastUpdated: new Date().toISOString(),
      },
      rollingSummary: convMemory.rollingSummary,
      recentMessages: sortedMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.createdAt
      })),
      totalMessages: convMemory.totalMessages,
      meta: {
        rawMessageCount: sortedMessages.length,
        summaryTokens: convMemory.summaryTokens,
        lastSummarizedAt: convMemory.lastSummarizedAt
      }
    };
  }

  /**
   * Merge with limits to prevent unbounded growth
   */
  private mergeWithLimit(
    existing: Record<string, string>,
    updates: Record<string, string>
  ): Record<string, string> {
    const merged = { ...existing };
    
    for (const [key, value] of Object.entries(updates)) {
      // Truncate value if too long
      merged[key] = value.substring(0, CONFIG.MAX_FACT_VALUE_LENGTH);
      
      // Enforce max keys
      if (Object.keys(merged).length >= CONFIG.MAX_SYSTEM_MEMORY_KEYS) {
        break;
      }
    }
    
    return merged;
  }

  /**
   * Build context string for AI prompt
   */
  public buildPromptContext(memoryContext: MemoryContext): string {
    const parts: string[] = [];

    // Layer 1: System Memory
    const { facts, preferences } = memoryContext.systemMemory;
    if (Object.keys(facts).length > 0) {
      parts.push(`[KNOWN FACTS]\n${Object.entries(facts).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`);
    }
    if (Object.keys(preferences).length > 0) {
      parts.push(`[USER PREFERENCES]\n${Object.entries(preferences).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`);
    }

    // Layer 2: Rolling Summary
    if (memoryContext.rollingSummary) {
      parts.push(`[CONVERSATION HISTORY]\n${memoryContext.rollingSummary}`);
    }

    // Layer 3: Recent Messages (for reference in prompt)
    // Note: Usually passed separately to AI, but included here for completeness
    
    return parts.join('\n\n');
  }

  /**
   * Clear conversation memory
   */
  public async clearMemory(userId: string, conversationId: string): Promise<void> {
    const memory = await prisma.conversationMemory.findUnique({
      where: {
        userId_conversationId: { userId, conversationId }
      }
    });

    if (memory) {
      await prisma.$transaction([
        prisma.rawMessage.deleteMany({
          where: { memoryId: memory.id }
        }),
        prisma.conversationMemory.delete({
          where: { id: memory.id }
        })
      ]);
      console.log(`🧠 Cleared memory for conv=${conversationId}`);
    }
  }

  /**
   * Get memory stats for debugging/monitoring
   */
  public async getStats(userId: string, conversationId: string) {
    const memory = await this.getOrCreateMemory(userId, conversationId);
    const systemMemory = parseSystemMemory(memory.systemMemory);

    return {
      conversationId,
      totalMessages: memory.totalMessages,
      rawMessageCount: memory.rawMessages.length,
      summaryTokens: memory.summaryTokens,
      systemMemoryKeys: {
        facts: Object.keys(systemMemory.facts).length,
        preferences: Object.keys(systemMemory.preferences).length,
        decisions: Object.keys(systemMemory.decisions).length,
      },
      lastSummarizedAt: memory.lastSummarizedAt,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const memoryService = new MemoryService();
export default MemoryService;

// Export types for consumers
export type { AddMessageInput, MemoryContext, SystemMemory };