// src/core/ai/utils/memory-boundaries.ts
// ============================================================================
// SORIVA MEMORY BOUNDARIES v1.0 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Predictable memory behavior - no "why did it forget?" complaints
//
// DEFINES:
// - What gets dropped first when context is full
// - Plan-wise memory limits
// - When to summarize vs keep raw
// - Conversation decay rules
//
// PHILOSOPHY:
// "User should never be surprised by what Soriva remembers or forgets"
//
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens: number;
  importance: TurnImportance;
  metadata?: {
    hasCode?: boolean;
    hasNumbers?: boolean;
    isQuestion?: boolean;
    isInstruction?: boolean;
    topics?: string[];
  };
}

export type TurnImportance = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'DISPOSABLE';

export interface MemoryConfig {
  maxContextTokens: number;
  maxTurns: number;
  summaryThreshold: number;      // Summarize after this many tokens
  preserveLastNTurns: number;    // Always keep last N turns raw
  memoryDays: number;            // How many days of history to consider
}

export interface TruncationResult {
  turns: ConversationTurn[];
  summary: string | null;
  droppedCount: number;
  droppedTokens: number;
  strategy: TruncationStrategy;
}

export type TruncationStrategy = 
  | 'NONE'              // No truncation needed
  | 'DROP_OLD'          // Drop oldest turns
  | 'DROP_LOW_PRIORITY' // Drop by importance
  | 'SUMMARIZE'         // Summarize old turns
  | 'HYBRID';           // Summarize + drop

// ============================================================================
// PLAN-WISE MEMORY CONFIGURATION
// ============================================================================

export const MEMORY_CONFIGS: Record<string, MemoryConfig> = {
  STARTER: {
    maxContextTokens: 4000,       // ~3K words context
    maxTurns: 10,                 // Last 10 turns only
    summaryThreshold: 3000,       // Summarize after 3K tokens
    preserveLastNTurns: 4,        // Always keep last 4 raw
    memoryDays: 1,                // Only today's context
  },
  
  PLUS: {
    maxContextTokens: 16000,      // ~12K words context
    maxTurns: 30,                 // Last 30 turns
    summaryThreshold: 12000,      // Summarize after 12K tokens
    preserveLastNTurns: 8,        // Always keep last 8 raw
    memoryDays: 3,                // 3 days of context
  },
  
  PRO: {
    maxContextTokens: 32000,      // ~24K words context
    maxTurns: 50,                 // Last 50 turns
    summaryThreshold: 24000,      // Summarize after 24K tokens
    preserveLastNTurns: 12,       // Always keep last 12 raw
    memoryDays: 7,                // 7 days of context
  },
  
  APEX: {
    maxContextTokens: 64000,      // ~48K words context
    maxTurns: 100,                // Last 100 turns
    summaryThreshold: 48000,      // Summarize after 48K tokens
    preserveLastNTurns: 20,       // Always keep last 20 raw
    memoryDays: 30,               // 30 days of context
  },
  
  SOVEREIGN: {
    maxContextTokens: 128000,     // Full context
    maxTurns: 200,                // Last 200 turns
    summaryThreshold: 100000,     // Summarize after 100K tokens
    preserveLastNTurns: 30,       // Always keep last 30 raw
    memoryDays: 90,               // 90 days of context
  },
};

// ============================================================================
// IMPORTANCE SCORING
// ============================================================================

/**
 * Score a turn's importance for retention decisions
 * Higher = more important to keep
 */
export function scoreTurnImportance(turn: ConversationTurn): TurnImportance {
  let score = 0;

  // Role-based scoring
  if (turn.role === 'system') {
    return 'CRITICAL'; // Never drop system prompts
  }

  // Content-based scoring
  const content = turn.content.toLowerCase();

  // CRITICAL indicators
  if (
    content.includes('remember this') ||
    content.includes('important:') ||
    content.includes('don\'t forget') ||
    content.includes('yaad rakhna') ||
    content.includes('zaruri hai')
  ) {
    return 'CRITICAL';
  }

  // HIGH importance indicators
  if (turn.metadata?.hasCode) score += 3;
  if (turn.metadata?.hasNumbers) score += 2;
  if (turn.metadata?.isInstruction) score += 3;
  if (content.includes('my name is')) score += 4;
  if (content.includes('i work at') || content.includes('i work for')) score += 3;
  if (content.includes('project')) score += 2;
  if (content.includes('deadline')) score += 2;

  // MEDIUM importance indicators
  if (turn.metadata?.isQuestion) score += 1;
  if (turn.content.length > 500) score += 1; // Longer = more effort

  // LOW importance indicators (negative)
  if (content.match(/^(ok|okay|thanks|thx|got it|understood|hmm|haan|theek hai)$/i)) {
    return 'DISPOSABLE';
  }
  if (content.length < 20) score -= 1;

  // Map score to importance
  if (score >= 5) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  if (score >= 0) return 'LOW';
  return 'DISPOSABLE';
}

/**
 * Extract metadata from turn content
 */
export function extractTurnMetadata(content: string): ConversationTurn['metadata'] {
  return {
    hasCode: /```|`[^`]+`|function\s|const\s|let\s|var\s|import\s|class\s/.test(content),
    hasNumbers: /\d{4,}|\$\d+|₹\d+|\d+%/.test(content), // Years, money, percentages
    isQuestion: /\?$|\?["\s]|kya\s|kaun\s|kahan\s|kab\s|kaise\s|kitna\s/i.test(content),
    isInstruction: /please\s|karo\s|batao\s|likho\s|banao\s|do this|make sure/i.test(content),
  };
}

// ============================================================================
// TRUNCATION ENGINE
// ============================================================================

class MemoryBoundaryManager {
  
  /**
   * Get memory config for a plan
   */
  getConfig(plan: string): MemoryConfig {
    return MEMORY_CONFIGS[plan.toUpperCase()] || MEMORY_CONFIGS.STARTER;
  }

  /**
   * Calculate total tokens in turns
   */
  calculateTotalTokens(turns: ConversationTurn[]): number {
    return turns.reduce((sum, turn) => sum + turn.tokens, 0);
  }

  /**
   * Apply memory boundaries to conversation
   * Returns truncated/summarized conversation that fits within limits
   */
  applyBoundaries(
    turns: ConversationTurn[],
    plan: string
  ): TruncationResult {
    const config = this.getConfig(plan);
    const totalTokens = this.calculateTotalTokens(turns);

    // Check if truncation needed
    if (totalTokens <= config.maxContextTokens && turns.length <= config.maxTurns) {
      return {
        turns,
        summary: null,
        droppedCount: 0,
        droppedTokens: 0,
        strategy: 'NONE',
      };
    }

    // Decide strategy based on how much we need to cut
    const excessTokens = totalTokens - config.maxContextTokens;
    const excessRatio = excessTokens / totalTokens;

    if (excessRatio < 0.2) {
      // Small excess: Just drop old low-priority turns
      return this.dropByPriority(turns, config);
    } else if (excessRatio < 0.5) {
      // Medium excess: Summarize old + keep recent
      return this.summarizeOld(turns, config);
    } else {
      // Large excess: Aggressive hybrid
      return this.hybridTruncation(turns, config);
    }
  }

  /**
   * Strategy 1: Drop low-priority turns from the beginning
   */
  private dropByPriority(
    turns: ConversationTurn[],
    config: MemoryConfig
  ): TruncationResult {
    const preserved = turns.slice(-config.preserveLastNTurns);
    const candidates = turns.slice(0, -config.preserveLastNTurns);

    // Sort candidates by importance (keep high, drop low)
    const sorted = [...candidates].sort((a, b) => {
      const priority: Record<TurnImportance, number> = {
        CRITICAL: 5,
        HIGH: 4,
        MEDIUM: 3,
        LOW: 2,
        DISPOSABLE: 1,
      };
      return priority[b.importance] - priority[a.importance];
    });

    // Keep dropping until we fit
    let currentTokens = this.calculateTotalTokens([...sorted, ...preserved]);
    let droppedCount = 0;
    let droppedTokens = 0;

    while (currentTokens > config.maxContextTokens && sorted.length > 0) {
      const dropped = sorted.pop()!; // Remove lowest priority
      currentTokens -= dropped.tokens;
      droppedCount++;
      droppedTokens += dropped.tokens;
    }

    return {
      turns: [...sorted, ...preserved],
      summary: null,
      droppedCount,
      droppedTokens,
      strategy: 'DROP_LOW_PRIORITY',
    };
  }

  /**
   * Strategy 2: Summarize old turns, keep recent raw
   */
  private summarizeOld(
    turns: ConversationTurn[],
    config: MemoryConfig
  ): TruncationResult {
    const preserved = turns.slice(-config.preserveLastNTurns);
    const toSummarize = turns.slice(0, -config.preserveLastNTurns);

    // Generate summary of old turns
    const summary = this.generateSummary(toSummarize);
    const summaryTokens = Math.ceil(summary.length / 4);

    // Create summary turn
    const summaryTurn: ConversationTurn = {
      role: 'system',
      content: `[Previous conversation summary: ${summary}]`,
      timestamp: new Date(),
      tokens: summaryTokens,
      importance: 'HIGH',
    };

    return {
      turns: [summaryTurn, ...preserved],
      summary,
      droppedCount: toSummarize.length,
      droppedTokens: this.calculateTotalTokens(toSummarize),
      strategy: 'SUMMARIZE',
    };
  }

  /**
   * Strategy 3: Aggressive hybrid - summarize + drop
   */
  private hybridTruncation(
    turns: ConversationTurn[],
    config: MemoryConfig
  ): TruncationResult {
    // Keep only critical and high importance from old turns
    const preserved = turns.slice(-config.preserveLastNTurns);
    const old = turns.slice(0, -config.preserveLastNTurns);

    // Filter old: keep only CRITICAL and HIGH
    const importantOld = old.filter(
      t => t.importance === 'CRITICAL' || t.importance === 'HIGH'
    );

    // Summarize the rest
    const toSummarize = old.filter(
      t => t.importance !== 'CRITICAL' && t.importance !== 'HIGH'
    );

    const summary = this.generateSummary(toSummarize);
    const summaryTokens = Math.ceil(summary.length / 4);

    const summaryTurn: ConversationTurn = {
      role: 'system',
      content: `[Conversation context: ${summary}]`,
      timestamp: new Date(),
      tokens: summaryTokens,
      importance: 'MEDIUM',
    };

    const result = [summaryTurn, ...importantOld, ...preserved];

    // If still too big, drop more
    if (this.calculateTotalTokens(result) > config.maxContextTokens) {
      return this.dropByPriority(result, config);
    }

    return {
      turns: result,
      summary,
      droppedCount: toSummarize.length,
      droppedTokens: this.calculateTotalTokens(toSummarize),
      strategy: 'HYBRID',
    };
  }

  /**
   * Generate summary of turns (simple extraction for now)
   * In production, this could use LLM summarization
   */
  private generateSummary(turns: ConversationTurn[]): string {
    if (turns.length === 0) return '';

    // Extract key points
    const keyPoints: string[] = [];

    for (const turn of turns) {
      // Extract names
      const nameMatch = turn.content.match(/my name is (\w+)/i);
      if (nameMatch) keyPoints.push(`User's name: ${nameMatch[1]}`);

      // Extract work info
      const workMatch = turn.content.match(/i work (at|for) ([^.]+)/i);
      if (workMatch) keyPoints.push(`Works at: ${workMatch[2]}`);

      // Extract projects
      const projectMatch = turn.content.match(/project[:\s]+([^.]+)/i);
      if (projectMatch) keyPoints.push(`Project: ${projectMatch[1].slice(0, 50)}`);

      // Extract questions asked
      if (turn.role === 'user' && turn.metadata?.isQuestion) {
        const shortQ = turn.content.slice(0, 100);
        keyPoints.push(`Asked about: ${shortQ}`);
      }
    }

    // Deduplicate and limit
    const unique = [...new Set(keyPoints)].slice(0, 10);
    
    if (unique.length === 0) {
      return `${turns.length} previous messages exchanged.`;
    }

    return unique.join('. ') + '.';
  }

  /**
   * Check if a turn is within memory days limit
   */
  isWithinMemoryLimit(turn: ConversationTurn, plan: string): boolean {
    const config = this.getConfig(plan);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - config.memoryDays);
    return turn.timestamp >= cutoff;
  }

  /**
   * Filter turns by memory days
   */
  filterByMemoryDays(turns: ConversationTurn[], plan: string): ConversationTurn[] {
    const config = this.getConfig(plan);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - config.memoryDays);
    return turns.filter(t => t.timestamp >= cutoff);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const memoryBoundaries = new MemoryBoundaryManager();

// Convenience functions
export function getMemoryConfig(plan: string): MemoryConfig {
  return memoryBoundaries.getConfig(plan);
}

export function applyMemoryBoundaries(
  turns: ConversationTurn[],
  plan: string
): TruncationResult {
  return memoryBoundaries.applyBoundaries(turns, plan);
}

export function scoreTurn(turn: ConversationTurn): TurnImportance {
  return scoreTurnImportance(turn);
}

export function filterByDays(turns: ConversationTurn[], plan: string): ConversationTurn[] {
  return memoryBoundaries.filterByMemoryDays(turns, plan);
}

export default memoryBoundaries;