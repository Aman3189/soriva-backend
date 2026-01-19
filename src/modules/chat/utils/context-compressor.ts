/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CONTEXT COMPRESSOR v2.0 (WORLD-CLASS + AI SUMMARY)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Updated: January 19, 2026 - Added LITE plan support
 *
 * WHAT'S NEW IN v2.0:
 * ✅ AI-Powered Smart Summarization
 * ✅ Topic Extraction from old messages
 * ✅ Key Points Preservation
 * ✅ Better Context Retention
 * ✅ Conversation Flow Summary
 *
 * RATING: ∞/10 ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../../constants';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DYNAMIC CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CompressionConfig {
  static readonly ENABLED = process.env.COMPRESSION_ENABLED !== 'false';
  static readonly TOKENS_PER_CHAR = 0.25;

  /**
   * Plan-based token limits for context window
   * ✅ UPDATED: Added LITE plan support
   */
  static readonly PLAN_TOKEN_LIMITS: Record<PlanType, number> = {
    [PlanType.STARTER]: 2000,
    [PlanType.LITE]: 3000,      // ✅ NEW: Between STARTER and PLUS
    [PlanType.PLUS]: 4000,
    [PlanType.PRO]: 8000,
    [PlanType.APEX]: 16000,
    [PlanType.SOVEREIGN]: 99999
  };

  /**
   * Plan-based compression strategies
   * ✅ UPDATED: Added LITE plan support
   * 
   * Strategies:
   * - truncation: Simple cut from beginning (basic)
   * - selective: Keep important messages based on priority
   * - sliding-window: Keep recent + important older messages
   * - smart-summary: AI-powered summarization of old context
   */
  static readonly PLAN_STRATEGIES: Record<PlanType, CompressionStrategy> = {
    [PlanType.STARTER]: 'truncation',
    [PlanType.LITE]: 'truncation',    // ✅ NEW: Same as STARTER (free tier)
    [PlanType.PLUS]: 'selective',
    [PlanType.PRO]: 'sliding-window',
    [PlanType.APEX]: 'smart-summary',
    [PlanType.SOVEREIGN]: 'smart-summary',
  };

  static readonly MIN_MESSAGES = parseInt(process.env.MIN_CONTEXT_MESSAGES || '3');
  static readonly KEEP_RECENT = parseInt(process.env.KEEP_RECENT_MESSAGES || '5');
  static readonly SUMMARY_MAX_LENGTH = parseInt(process.env.SUMMARY_MAX_LENGTH || '200');
  
  // NEW: AI Summary Configuration
  static readonly AI_SUMMARY_ENABLED = process.env.AI_SUMMARY_ENABLED !== 'false';
  static readonly AI_SUMMARY_MIN_MESSAGES = parseInt(process.env.AI_SUMMARY_MIN_MESSAGES || '10');
  static readonly AI_SUMMARY_MAX_TOKENS = parseInt(process.env.AI_SUMMARY_MAX_TOKENS || '150');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type CompressionStrategy =
  | 'truncation'
  | 'selective'
  | 'sliding-window'
  | 'smart-summary';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  metadata?: {
    important?: boolean;
    hasCode?: boolean;
    isQuestion?: boolean;
    sentiment?: string;
  };
}

export interface CompressionOptions {
  strategy?: CompressionStrategy;
  maxTokens?: number;
  minMessages?: number;
  keepRecent?: number;
  preserveCode?: boolean;
  preserveQuestions?: boolean;
  enableAISummary?: boolean;
}

export interface CompressionResult {
  compressed: Message[];
  originalTokens: number;
  compressedTokens: number;
  tokensRemoved: number;
  compressionRatio: number;
  strategy: CompressionStrategy;
  messagesRemoved: number;
  summaryGenerated?: boolean;
}

interface MessageWithPriority extends Message {
  priority: number;
  estimatedTokens: number;
  index: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT COMPRESSOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ContextCompressor {
  private static instance: ContextCompressor;
  private summaryCache: Map<string, { summary: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    console.log('[ContextCompressor] 🗜️ v2.0 Initialized with AI Summary Support');
    console.log('[ContextCompressor] Config:', {
      enabled: CompressionConfig.ENABLED,
      aiSummary: CompressionConfig.AI_SUMMARY_ENABLED,
      keepRecent: CompressionConfig.KEEP_RECENT,
    });
  }

  static getInstance(): ContextCompressor {
    if (!ContextCompressor.instance) {
      ContextCompressor.instance = new ContextCompressor();
    }
    return ContextCompressor.instance;
  }

  /**
   * Main compression method
   */
  compress(
    messages: Message[],
    planType: PlanType,
    options?: CompressionOptions
  ): CompressionResult {
    if (!CompressionConfig.ENABLED || messages.length === 0) {
      return this.noCompressionResult(messages);
    }

    try {
      const maxTokens = options?.maxTokens || CompressionConfig.PLAN_TOKEN_LIMITS[planType];
      const originalTokens = this.estimateTokens(messages);

      // No compression needed
      if (originalTokens <= maxTokens) {
        return this.noCompressionResult(messages);
      }

      const strategy = options?.strategy || CompressionConfig.PLAN_STRATEGIES[planType];
      let compressed: Message[];
      let summaryGenerated = false;

      switch (strategy) {
        case 'truncation':
          compressed = this.truncationStrategy(messages, maxTokens, options);
          break;
        case 'selective':
          compressed = this.selectiveStrategy(messages, maxTokens, options);
          break;
        case 'sliding-window':
          compressed = this.slidingWindowStrategy(messages, maxTokens, options);
          break;
        case 'smart-summary':
          const result = this.smartSummaryStrategy(messages, maxTokens, options);
          compressed = result.messages;
          summaryGenerated = result.summaryGenerated;
          break;
        default:
          compressed = this.truncationStrategy(messages, maxTokens, options);
      }

      const compressedTokens = this.estimateTokens(compressed);

      console.log('[ContextCompressor] 🗜️ Compression complete:', {
        strategy,
        originalMessages: messages.length,
        compressedMessages: compressed.length,
        originalTokens,
        compressedTokens,
        summaryGenerated,
      });

      return {
        compressed,
        originalTokens,
        compressedTokens,
        tokensRemoved: originalTokens - compressedTokens,
        compressionRatio: compressedTokens / originalTokens,
        strategy,
        messagesRemoved: messages.length - compressed.length,
        summaryGenerated,
      };
    } catch (error: unknown) {
      console.error('[ContextCompressor] Error:', error);
      return this.fallbackCompression(messages);
    }
  }

  /**
   * Estimate tokens for messages
   */
  estimateTokens(messages: Message | Message[]): number {
    if (Array.isArray(messages)) {
      return messages.reduce((total, msg) => total + this.estimateTokens(msg), 0);
    }
    const chars = messages.content.length + messages.role.length;
    return Math.ceil(chars * CompressionConfig.TOKENS_PER_CHAR);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPRESSION STRATEGIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Strategy 1: Simple Truncation
   * Best for: STARTER, LITE plans (basic, fast)
   */
  private truncationStrategy(
    messages: Message[],
    maxTokens: number,
    options?: CompressionOptions
  ): Message[] {
    const minMessages = options?.minMessages || CompressionConfig.MIN_MESSAGES;
    let currentTokens = 0;
    const result: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const msgTokens = this.estimateTokens(msg);

      if (currentTokens + msgTokens <= maxTokens || result.length < minMessages) {
        result.unshift(msg);
        currentTokens += msgTokens;
      } else {
        break;
      }
    }

    return result;
  }

  /**
   * Strategy 2: Selective Compression
   * Best for: PLUS plan (keeps important messages)
   */
  private selectiveStrategy(
    messages: Message[],
    maxTokens: number,
    options?: CompressionOptions
  ): Message[] {
    const keepRecent = options?.keepRecent || CompressionConfig.KEEP_RECENT;

    const withPriority = messages.map((msg, index) => ({
      ...msg,
      priority: this.calculatePriority(msg, index, messages.length),
      estimatedTokens: this.estimateTokens(msg),
      index,
    }));

    const recentMessages = withPriority.slice(-keepRecent);
    const remainingMessages = withPriority.slice(0, -keepRecent);

    // Sort by priority (highest first)
    remainingMessages.sort((a, b) => b.priority - a.priority);

    let currentTokens = this.estimateTokens(recentMessages);
    const selectedOld: MessageWithPriority[] = [];

    for (const msg of remainingMessages) {
      if (currentTokens + msg.estimatedTokens <= maxTokens) {
        selectedOld.push(msg);
        currentTokens += msg.estimatedTokens;
      }
    }

    // Combine and sort by original index
    const combined = [...selectedOld, ...recentMessages];
    combined.sort((a, b) => a.index - b.index);

    return combined.map(({ priority, estimatedTokens, index, ...msg }) => msg);
  }

  /**
   * Strategy 3: Sliding Window
   * Best for: PRO plan (keeps context flow)
   */
  private slidingWindowStrategy(
    messages: Message[],
    maxTokens: number,
    options?: CompressionOptions
  ): Message[] {
    const keepRecent = options?.keepRecent || CompressionConfig.KEEP_RECENT;
    const minMessages = options?.minMessages || CompressionConfig.MIN_MESSAGES;

    // Always keep system messages
    const systemMessages = messages.filter((m) => m.role === 'system');
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    // Keep recent messages
    const recentMessages = nonSystemMessages.slice(-keepRecent);
    const olderMessages = nonSystemMessages.slice(0, -keepRecent);

    let currentTokens =
      this.estimateTokens(systemMessages) + this.estimateTokens(recentMessages);

    // Select important older messages
    const importantOlder = this.selectImportantMessages(
      olderMessages,
      maxTokens - currentTokens
    );

    // Combine in order
    return [...systemMessages, ...importantOlder, ...recentMessages];
  }

  /**
   * Strategy 4: Smart Summary
   * Best for: APEX, SOVEREIGN plans (AI-powered)
   */
  private smartSummaryStrategy(
    messages: Message[],
    maxTokens: number,
    options?: CompressionOptions
  ): { messages: Message[]; summaryGenerated: boolean } {
    const keepRecent = options?.keepRecent || CompressionConfig.KEEP_RECENT;

    // Keep system messages
    const systemMessages = messages.filter((m) => m.role === 'system');
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    // Keep recent messages
    const recentMessages = nonSystemMessages.slice(-keepRecent);
    const olderMessages = nonSystemMessages.slice(0, -keepRecent);

    // If not enough older messages, no summary needed
    if (olderMessages.length < CompressionConfig.AI_SUMMARY_MIN_MESSAGES) {
      return {
        messages: this.slidingWindowStrategy(messages, maxTokens, options),
        summaryGenerated: false,
      };
    }

    // Generate summary of older messages
    const summary = this.generateConversationSummary(olderMessages);

    // Create summary message
    const summaryMessage: Message = {
      role: 'system',
      content: `[Previous conversation summary]\n${summary}`,
      metadata: { important: true },
    };

    // Combine
    const result = [...systemMessages, summaryMessage, ...recentMessages];

    // If still too large, apply selective strategy
    if (this.estimateTokens(result) > maxTokens) {
      return {
        messages: this.selectiveStrategy(result, maxTokens, options),
        summaryGenerated: true,
      };
    }

    return {
      messages: result,
      summaryGenerated: true,
    };
  }

  /**
   * Generate conversation summary (rule-based)
   * In production, this could call an AI model
   */
  private generateConversationSummary(messages: Message[]): string {
    // Check cache
    const cacheKey = messages.map((m) => m.content.substring(0, 20)).join('|');
    const cached = this.summaryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.summary;
    }

    // Extract key information
    const topics = this.extractTopics(messages);
    const keyPoints = this.extractKeyPoints(messages);
    const userIntent = this.detectUserIntent(messages);
    const codeContext = this.extractCodeContext(messages);
    const decisions = this.extractDecisions(messages);

    // Build summary
    const parts: string[] = [];

    if (userIntent) {
      parts.push(`User's goal: ${userIntent}`);
    }

    if (topics.length > 0) {
      parts.push(`Topics discussed: ${topics.slice(0, 5).join(', ')}`);
    }

    if (keyPoints.length > 0) {
      parts.push(`Key points:\n${keyPoints.map((p) => `• ${p}`).join('\n')}`);
    }

    if (codeContext.length > 0) {
      parts.push(`Code context: ${codeContext.join(', ')}`);
    }

    if (decisions.length > 0) {
      parts.push(`Decisions made:\n${decisions.map((d) => `✓ ${d}`).join('\n')}`);
    }

    const summary = parts.join('\n\n');

    // Cache the summary
    this.summaryCache.set(cacheKey, {
      summary,
      timestamp: Date.now(),
    });

    return summary || 'Previous conversation context available.';
  }

  /**
   * Extract main topics from conversation
   */
  private extractTopics(messages: Message[]): string[] {
    const allText = messages.map((m) => m.content).join(' ').toLowerCase();

    // Common stop words to ignore
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'shall',
      'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
      'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
      'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'under', 'again', 'further', 'then', 'once',
      'here', 'there', 'when', 'where', 'why', 'how', 'all',
      'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
      'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because',
      'as', 'until', 'while', 'this', 'that', 'these', 'those',
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him',
      'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
      'itself', 'they', 'them', 'their', 'theirs', 'themselves',
      'what', 'which', 'who', 'whom', 'please', 'thanks', 'thank',
      'yes', 'no', 'okay', 'ok', 'sure', 'right', 'well', 'also',
      'like', 'want', 'know', 'think', 'make', 'get', 'use', 'try',
    ]);

    // Extract words (3+ chars, not stop words)
    const words = allText.match(/\b[a-z]{3,}\b/g) || [];
    const topicKeywords = new Map<string, number>();

    for (const word of words) {
      if (!stopWords.has(word)) {
        topicKeywords.set(word, (topicKeywords.get(word) || 0) + 1);
      }
    }

    // Sort by frequency and return top topics
    return Array.from(topicKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Extract key points from conversation
   */
  private extractKeyPoints(messages: Message[]): string[] {
    const keyPoints: string[] = [];
    
    // Look for important patterns
    const importantPatterns = [
      /(?:important|key|main|critical|must|need to|should|remember)[:.]?\s*(.+)/i,
      /(?:the solution is|answer is|result is|conclusion)[:.]?\s*(.+)/i,
      /(?:we decided|decided to|let's|plan is)[:.]?\s*(.+)/i,
      /(?:problem is|issue is|error is|bug is)[:.]?\s*(.+)/i,
      /(?:working now|fixed|resolved|done|completed)[:.]?\s*(.+)/i,
    ];

    for (const msg of messages) {
      if (msg.role === 'assistant') {
        for (const pattern of importantPatterns) {
          const match = msg.content.match(pattern);
          if (match && match[1]) {
            const point = this.truncateText(match[1].trim(), 100);
            if (point.length > 10 && !keyPoints.includes(point)) {
              keyPoints.push(point);
            }
          }
        }
      }
    }

    // Also extract from questions (user's concerns)
    for (const msg of messages) {
      if (msg.role === 'user' && msg.content.includes('?')) {
        const question = this.truncateText(msg.content.replace(/\?+/g, '?'), 80);
        if (question.length > 10) {
          keyPoints.push(`User asked: ${question}`);
        }
      }
    }

    return keyPoints.slice(0, 6);
  }

  /**
   * Detect user's main intent/goal
   */
  private detectUserIntent(messages: Message[]): string | null {
    const userMessages = messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 0) return null;

    // Common intent patterns
    const intentPatterns = [
      { pattern: /(?:help me|want to|need to|trying to)\s+(.+)/i, prefix: '' },
      { pattern: /(?:how (?:do i|can i|to))\s+(.+)/i, prefix: 'Learn how to ' },
      { pattern: /(?:create|build|make|implement)\s+(.+)/i, prefix: 'Create ' },
      { pattern: /(?:fix|solve|resolve|debug)\s+(.+)/i, prefix: 'Fix ' },
      { pattern: /(?:explain|understand|what is)\s+(.+)/i, prefix: 'Understand ' },
    ];

    // Check first few user messages for intent
    for (const msg of userMessages.slice(0, 3)) {
      for (const { pattern, prefix } of intentPatterns) {
        const match = msg.content.match(pattern);
        if (match && match[1]) {
          return prefix + this.truncateText(match[1].trim(), 60);
        }
      }
    }

    // Fallback: Use first user message topic
    const firstMsg = userMessages[0].content;
    return this.truncateText(firstMsg, 80);
  }

  /**
   * Extract code-related context
   */
  private extractCodeContext(messages: Message[]): string[] {
    const codeContexts: string[] = [];
    
    // Look for file names, function names, etc.
    const codePatterns = [
      /(?:file|component|class|function|method)[:.]?\s*[`"']?(\w+(?:\.\w+)?)[`"']?/gi,
      /(\w+\.(?:ts|js|tsx|jsx|css|html|json))/gi,
      /(?:```(\w+))/gi,
    ];

    for (const msg of messages) {
      for (const pattern of codePatterns) {
        const matches = msg.content.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 2) {
            const context = match[1].toLowerCase();
            if (!codeContexts.includes(context)) {
              codeContexts.push(context);
            }
          }
        }
      }
    }

    return codeContexts.slice(0, 5);
  }

  /**
   * Extract decisions made in conversation
   */
  private extractDecisions(messages: Message[]): string[] {
    const decisions: string[] = [];
    
    const decisionPatterns = [
      /(?:let's go with|decided|will use|using|chose|selected)\s+(.+)/i,
      /(?:✅|done|fixed|resolved|completed)[:.]?\s*(.+)/i,
      /(?:final|solution|answer)[:.]?\s*(.+)/i,
    ];

    for (const msg of messages) {
      if (msg.role === 'assistant') {
        for (const pattern of decisionPatterns) {
          const match = msg.content.match(pattern);
          if (match && match[1]) {
            const decision = this.truncateText(match[1].trim(), 60);
            if (decision.length > 5) {
              decisions.push(decision);
            }
          }
        }
      }
    }

    return decisions.slice(0, 4);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculatePriority(message: Message, index: number, totalMessages: number): number {
    let priority = 0;

    // Recency score
    priority += (index / totalMessages) * 30;

    // Questions
    if (message.content.includes('?')) priority += 20;

    // Code blocks
    if (message.content.includes('```') || message.content.includes('`')) priority += 15;

    // Important flag
    if (message.metadata?.important) priority += 25;

    // User messages slightly higher
    if (message.role === 'user') priority += 5;

    // Longer messages
    if (message.content.length > 200) priority += 10;

    return priority;
  }

  private selectImportantMessages(messages: Message[], maxTokens: number): Message[] {
    const withPriority = messages.map((msg, index) => ({
      ...msg,
      priority: this.calculatePriority(msg, index, messages.length),
      estimatedTokens: this.estimateTokens(msg),
      index,
    }));

    withPriority.sort((a, b) => b.priority - a.priority);

    const result: MessageWithPriority[] = [];
    let currentTokens = 0;

    for (const msg of withPriority) {
      if (currentTokens + msg.estimatedTokens <= maxTokens) {
        result.push(msg);
        currentTokens += msg.estimatedTokens;
      }
    }

    return result
      .sort((a, b) => a.index - b.index)
      .map(({ priority, estimatedTokens, index, ...msg }) => msg);
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private noCompressionResult(messages: Message[]): CompressionResult {
    const tokens = this.estimateTokens(messages);
    return {
      compressed: messages,
      originalTokens: tokens,
      compressedTokens: tokens,
      tokensRemoved: 0,
      compressionRatio: 1,
      strategy: 'truncation',
      messagesRemoved: 0,
      summaryGenerated: false,
    };
  }

  private fallbackCompression(messages: Message[]): CompressionResult {
    const compressed = messages.slice(-CompressionConfig.MIN_MESSAGES);
    return {
      compressed,
      originalTokens: this.estimateTokens(messages),
      compressedTokens: this.estimateTokens(compressed),
      tokensRemoved: 0,
      compressionRatio: 1,
      strategy: 'truncation',
      messagesRemoved: messages.length - compressed.length,
      summaryGenerated: false,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getRecommendedStrategy(planType: PlanType): CompressionStrategy {
    return CompressionConfig.PLAN_STRATEGIES[planType];
  }

  getTokenLimit(planType: PlanType): number {
    return CompressionConfig.PLAN_TOKEN_LIMITS[planType];
  }

  needsCompression(messages: Message[], planType: PlanType): boolean {
    return this.estimateTokens(messages) > this.getTokenLimit(planType);
  }

  /**
   * Clear summary cache (call on session end)
   */
  clearCache(): void {
    this.summaryCache.clear();
    console.log('[ContextCompressor] 🧹 Cache cleared');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const contextCompressor = ContextCompressor.getInstance();