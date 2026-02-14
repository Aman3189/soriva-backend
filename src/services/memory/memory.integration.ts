// src/services/memory/memory.integration.ts
/**
 * ==========================================
 * MEMORY INTEGRATION HELPER - SORIVA V2
 * ==========================================
 * 
 * Bridges the 3-Layer Memory System with chat flow.
 * Uses AI-based fact extraction for production quality.
 * 
 * FEATURES:
 * ✅ AI-powered fact extraction (Gemini Flash)
 * ✅ Async non-blocking saves
 * ✅ Smart extraction filtering
 * ✅ Cross-session memory
 * 
 * Last Updated: February 14, 2026
 */

import { memoryService } from './memory.service';
import { factExtractor } from './fact-extractor.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ChatMemoryContext {
  promptContext: string;
  raw: {
    systemMemory: Record<string, any>;
    rollingSummary: string;
    recentMessages: Array<{ role: string; content: string }>;
    totalMessages: number;
  };
  estimatedTokens: number;
}

interface SaveExchangeOptions {
  extractFacts?: boolean;
  userTokenCount?: number;
  assistantTokenCount?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEMORY INTEGRATION CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MemoryIntegration {
  constructor() {
    console.log('🧠 Memory Integration initialized (AI extraction enabled)');
  }

  /**
   * Get memory context formatted for chat
   * Uses GLOBAL user memory + conversation-specific context
   */
  async getContextForChat(
    userId: string, 
    conversationId: string
  ): Promise<ChatMemoryContext | null> {
    try {
      // Use combined memory (global facts + conversation messages)
      const context = await memoryService.getCombinedMemoryContext(userId, conversationId);
      const promptContext = memoryService.buildPromptContext(context);
      const estimatedTokens = Math.ceil(promptContext.length / 4);
      
      return {
        promptContext,
        raw: {
          systemMemory: context.systemMemory,
          rollingSummary: context.rollingSummary,
          recentMessages: context.recentMessages,
          totalMessages: context.totalMessages,
        },
        estimatedTokens,
      };
    } catch (error) {
      console.error('[MemoryIntegration] Error getting context:', error);
      return null;
    }
  }

  /**
   * Save a user-assistant exchange to memory
   * Fact extraction runs async in background
   */
  async saveExchange(
    userId: string,
    conversationId: string,
    userMessage: string,
    assistantMessage: string,
    options: SaveExchangeOptions = {}
  ): Promise<void> {
    try {
      // Save user message
      await memoryService.addMessage({
        userId,
        conversationId,
        role: 'user',
        content: userMessage,
        tokenCount: options.userTokenCount,
      });

      // Save assistant message
      await memoryService.addMessage({
        userId,
        conversationId,
        role: 'assistant',
        content: assistantMessage,
        tokenCount: options.assistantTokenCount,
      });

      console.log(`[MemoryIntegration] Exchange saved: ${conversationId}`);

      // AI-based fact extraction (async, non-blocking)
      if (options.extractFacts && factExtractor.shouldExtract(userMessage)) {
        this.extractFactsAsync(userId, conversationId, userMessage, assistantMessage);
      }
      
    } catch (error) {
      console.error('[MemoryIntegration] Error saving exchange:', error);
    }
  }

  /**
   * Extract facts asynchronously using AI
   * Does not block the response
   */
  private extractFactsAsync(
    userId: string,
    conversationId: string,
    userMessage: string,
    assistantMessage: string
  ): void {
    // Fire and forget - don't await
    (async () => {
      try {
        const extracted = await factExtractor.extractFacts(userMessage, assistantMessage);
        
        // Only update if we found something
        if (Object.keys(extracted.facts).length > 0 || Object.keys(extracted.preferences).length > 0) {
          await memoryService.updateSystemMemory(userId, conversationId, {
            facts: extracted.facts,
            preferences: extracted.preferences,
          });
          
          console.log(`[MemoryIntegration] 🧠 Facts extracted & saved:`, {
            facts: Object.keys(extracted.facts),
            preferences: Object.keys(extracted.preferences),
            tokens: extracted.tokensUsed,
          });
        }
      } catch (err) {
        console.error('[MemoryIntegration] Fact extraction failed:', err);
      }
    })();
  }

  /**
   * Manually update user facts
   */
  async updateFacts(
    userId: string,
    conversationId: string,
    facts: Record<string, string>
  ): Promise<void> {
    await memoryService.updateSystemMemory(userId, conversationId, { facts });
  }

  /**
   * Manually update user preferences
   */
  async updatePreferences(
    userId: string,
    conversationId: string,
    preferences: Record<string, string>
  ): Promise<void> {
    await memoryService.updateSystemMemory(userId, conversationId, { preferences });
  }

  /**
   * Clear memory for a conversation
   */
  async clearConversationMemory(userId: string, conversationId: string): Promise<void> {
    await memoryService.clearMemory(userId, conversationId);
  }

  /**
   * Get memory stats for debugging
   */
  async getStats(userId: string, conversationId: string) {
    return memoryService.getStats(userId, conversationId);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const memoryIntegration = new MemoryIntegration();
export default MemoryIntegration;