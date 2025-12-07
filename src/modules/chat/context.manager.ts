// src/modules/chat/context.manager.ts
// Updated: October 14, 2025 (Session 2 - Plan Migration)
// Changes:
// - FIXED: Import from new constants structure
// - FIXED: Updated all plan enum values to new names
// - FIXED: Removed EPISTEME plan (separate ecosystem)
// - MAINTAINED: Class-based structure (100%)

import { PlanType } from '../../constants'; // ✅ FIXED: New import structure

/**
 * Context Manager
 * Manages conversation context window based on user's plan
 */
export class ContextManager {
  /**
   * Get context window size based on plan
   */
  getContextWindowSize(planType: string): number {
    const contextSizes: Record<string, number> = {
      [PlanType.STARTER]: 6, // ✅ UPDATED: Free tier (was VIBE_FREE)
      [PlanType.PLUS]: 10, // ✅ UPDATED: Paid tier (was VIBE_PAID)
      [PlanType.PRO]: 12, // ✅ UPDATED: Pro tier (was SPARK)
      [PlanType.APEX]: 15, // ✅ UPDATED: Edge tier (was APEX)
    };

    return contextSizes[planType] || 6; // Default: 6
  }

  /**
   * Trim messages to fit context window
   * Keeps system message + recent N messages
   */
  trimContext(
    messages: Array<{ role: string; content: string }>,
    windowSize: number
  ): Array<{ role: string; content: string }> {
    // Always keep system message if it exists
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    // Take last N messages
    const recentMessages = conversationMessages.slice(-windowSize);

    // Combine: system message + recent messages
    return systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
  }

  /**
   * Prepare messages for AI API call
   */
  prepareContextForAI(
    chatHistory: Array<{ role: string; content: string; userId: string }>,
    planType: string
  ): Array<{ role: string; content: string }> {
    const windowSize = this.getContextWindowSize(planType);

    // Convert to API format (remove userId)
    const messages = chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    return this.trimContext(messages, windowSize);
  }

  /**
   * Calculate token estimate (rough)
   * 1 token ≈ 0.75 words for English
   */
  estimateTokens(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 0.75);
  }

  /**
   * Check if context exceeds token limit
   */
  exceedsTokenLimit(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number = 4000
  ): boolean {
    const totalText = messages.map((m) => m.content).join(' ');
    const estimatedTokens = this.estimateTokens(totalText);
    return estimatedTokens > maxTokens;
  }
}
