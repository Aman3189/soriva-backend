/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MEMORY CORE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * Purpose: Core memory data extraction and analysis
 *
 * Rules:
 * - FACTS ONLY, no emotions, no decisions
 * - NO welcome back text
 * - NO greeting examples
 * - NO emotional strategy text
 * - NO "how to talk" logic
 * - This file = DATA LAYER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '../../../config/prisma';
import {
  MemoryContext,
  ConversationSummary,
  ImportantEvent,
  UnresolvedIssue,
  ProactiveReminder,
  EmotionHeuristic,
  MEMORY_RETENTION_DAYS,
  MemoryPlanType,
} from './memory.types';
import { memoryCache, createMemoryCacheKey } from './memory.cache';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATTERN CONSTANTS (For heuristic detection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EVENT_PATTERNS = {
  achievement: /\b(completed|finished|achieved|won|success|accomplished|done|passed|cleared)\b/i,
  problem: /\b(problem|issue|error|stuck|confused|help|urgent|failed|broken)\b/i,
  decision: /\b(decided|choosing|will|planning|going to|selected|picked)\b/i,
  goal: /\b(goal|target|want to|aim|plan to|dream|aspire|wish)\b/i,
  milestone: /\b(milestone|launch|release|started|beginning|first time|debut)\b/i,
} as const;

const ISSUE_PATTERNS = [
  /\b(problem|issue|error|bug|not working|broken)\b/i,
  /\b(confused|stuck|don't understand|unclear|lost)\b/i,
  /\b(need help|struggling|difficult|hard|tough)\b/i,
  /\b(urgent|critical|important|asap|emergency)\b/i,
] as const;

const EMOTION_PATTERNS = {
  positive: /\b(happy|great|amazing|wonderful|excited|love|thank|good|awesome|fantastic|brilliant)\b/i,
  negative: /\b(sad|angry|frustrated|upset|worried|anxious|bad|terrible|awful|stressed|depressed)\b/i,
  neutral: /\b(okay|fine|normal|average|alright|so-so)\b/i,
} as const;

const PRIORITY_PATTERNS = {
  high: /\b(urgent|critical|important|asap|emergency|immediately|now)\b/i,
  medium: /\b(need|should|must|required|soon|today)\b/i,
} as const;

const DEADLINE_PATTERN = /\b(deadline|due|by|before|until)\s+(\w+\s+\d+|\d+\s+\w+)/i;

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
  'in', 'to', 'for', 'of', 'with', 'as', 'by', 'from', 'that', 'this',
  'it', 'be', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'i', 'me', 'my', 'you', 'your', 'we', 'our', 'they', 'their', 'he', 'she',
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN MEMORY CORE FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get complete memory context for a user
 * Returns cached if available, otherwise builds fresh
 */
export async function getMemoryContext(userId: string): Promise<MemoryContext | null> {
  try {
    const cacheKey = createMemoryCacheKey(userId);

    // Check cache first
    const cached = memoryCache.get<MemoryContext>(cacheKey);
    if (cached) {
      console.log('[MemoryCore] ✅ Serving from cache');
      return cached;
    }

    console.log('[MemoryCore] 🔄 Building fresh memory context...');

    // Get user's memory retention period
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { memoryDays: true, planType: true },
    });

    if (!user) {
      console.log('[MemoryCore] ⚠️ User not found');
      return null;
    }

    const planType = (user.planType || 'STARTER') as MemoryPlanType;
    const memoryDays = user.memoryDays || MEMORY_RETENTION_DAYS[planType] || 5;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - memoryDays);

    // Build memory context (parallel execution for performance)
    const [
      recentConversations,
      importantEvents,
      unresolvedIssues,
      proactiveReminders,
      emotionalState,
    ] = await Promise.all([
      getRecentConversations(userId, cutoffDate),
      getImportantEvents(userId, cutoffDate),
      getUnresolvedIssues(userId, cutoffDate),
      generateProactiveReminders(userId, cutoffDate),
      analyzeEmotionalState(userId, cutoffDate),
    ]);

    const context: MemoryContext = {
      recentConversations,
      importantEvents,
      unresolvedIssues,
      proactiveReminders,
      userPreferences: await getUserPreferences(userId),
      emotionalState,
    };

    // Cache the context
    memoryCache.set(cacheKey, context);

    console.log('[MemoryCore] ✅ Memory context built successfully');
    return context;
  } catch (error) {
    console.error('[MemoryCore] ❌ Error building memory context:', error);
    return null;
  }
}

/**
 * Get recent conversation summaries
 */
export async function getRecentConversations(
  userId: string,
  cutoffDate: Date
): Promise<ConversationSummary[]> {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50, // Limit per session for performance
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Last 10 sessions
    });

    const summaries: ConversationSummary[] = [];

    for (const session of sessions) {
      if (session.messages.length === 0) continue;

      const userMessages = session.messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content);

      if (userMessages.length === 0) continue;

      summaries.push({
        sessionId: session.id,
        date: session.createdAt,
        summary: createConversationSummary(session.messages),
        keyTopics: extractKeyTopics(userMessages),
        emotionalTone: detectEmotionalTone(userMessages),
        messageCount: session.messages.length,
      });
    }

    return summaries;
  } catch (error) {
    console.error('[MemoryCore] Error getting conversations:', error);
    return [];
  }
}

/**
 * Detect important events in conversations
 */
export async function getImportantEvents(
  userId: string,
  cutoffDate: Date
): Promise<ImportantEvent[]> {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      include: {
        messages: {
          where: { role: 'user' },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const events: ImportantEvent[] = [];

    for (const session of sessions) {
      for (const message of session.messages) {
        const content = message.content;

        // Check each pattern
        for (const [type, pattern] of Object.entries(EVENT_PATTERNS)) {
          if (pattern.test(content)) {
            events.push({
              date: message.createdAt,
              type: type as ImportantEvent['type'],
              description: extractEventDescription(content),
              sessionId: session.id,
            });
            break; // One event per message
          }
        }
      }
    }

    // Sort by date and limit to recent 5
    return events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  } catch (error) {
    console.error('[MemoryCore] Error detecting events:', error);
    return [];
  }
}

/**
 * Track unresolved issues
 */
export async function getUnresolvedIssues(
  userId: string,
  cutoffDate: Date
): Promise<UnresolvedIssue[]> {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      include: {
        messages: {
          where: { role: 'user' },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const issues: Map<string, UnresolvedIssue> = new Map();

    for (const session of sessions) {
      for (const message of session.messages) {
        const content = message.content;

        // Check if message mentions an issue
        const hasIssue = ISSUE_PATTERNS.some((pattern) => pattern.test(content));

        if (hasIssue) {
          const issueKey = normalizeIssue(content);

          if (issues.has(issueKey)) {
            // Update existing issue
            const existing = issues.get(issueKey)!;
            existing.lastMentioned = message.createdAt;
          } else {
            // New issue
            issues.set(issueKey, {
              issue: extractIssueDescription(content),
              firstMentioned: message.createdAt,
              lastMentioned: message.createdAt,
              priority: detectIssuePriority(content),
              sessionId: session.id,
            });
          }
        }
      }
    }

    // Convert to array and sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return Array.from(issues.values())
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 5);
  } catch (error) {
    console.error('[MemoryCore] Error tracking issues:', error);
    return [];
  }
}

/**
 * Generate proactive reminders
 */
export async function generateProactiveReminders(
  userId: string,
  cutoffDate: Date
): Promise<ProactiveReminder[]> {
  try {
    const reminders: ProactiveReminder[] = [];

    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    // Check for follow-ups needed
    for (const session of sessions) {
      const lastMessage = session.messages[0];
      if (!lastMessage) continue;

      const daysSinceLastMessage =
        (Date.now() - lastMessage.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      // If 3+ days since last message in active session
      if (daysSinceLastMessage >= 3 && daysSinceLastMessage <= 7) {
        reminders.push({
          message: `Topic from earlier: "${session.title || 'previous discussion'}"`,
          type: 'follow_up',
          relevance: 0.7,
        });
      }
    }

    // Check for pending deadlines
    const recentMessages = sessions.flatMap((s) => s.messages);

    for (const message of recentMessages) {
      if (DEADLINE_PATTERN.test(message.content)) {
        reminders.push({
          message: 'Deadline mentioned earlier',
          type: 'deadline',
          relevance: 0.8,
        });
        break; // Only one deadline reminder
      }
    }

    // Sort by relevance
    return reminders
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  } catch (error) {
    console.error('[MemoryCore] Error generating reminders:', error);
    return [];
  }
}

/**
 * Get user preferences from history
 * @internal Currently placeholder - can be enhanced
 */
export async function getUserPreferences(userId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: Analyze conversation patterns for preferences
    // - Average message length preference
    // - Response style preference
    // - Topic interests
    return {
      communicationStyle: 'conversational',
      responseLength: 'medium',
      topics: [],
    };
  } catch (error) {
    console.error('[MemoryCore] Error getting preferences:', error);
    return {};
  }
}

/**
 * Analyze emotional state trend
 * NOTE: Heuristic only. Never assume emotional truth.
 */
export async function analyzeEmotionalState(
  userId: string,
  cutoffDate: Date
): Promise<{ current: string; trend: 'improving' | 'stable' | 'declining' }> {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      include: {
        messages: {
          where: { role: 'user' },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (sessions.length === 0) {
      return { current: 'neutral', trend: 'stable' };
    }

    // Analyze recent messages
    const recentMessages = sessions
      .slice(-3) // Last 3 sessions
      .flatMap((s) => s.messages)
      .map((m) => m.content);

    const currentTone = detectEmotionalTone(recentMessages);

    // Simple trend analysis
    // NOTE: This is heuristic only - not ground truth
    return {
      current: currentTone,
      trend: 'stable',
    };
  } catch (error) {
    console.error('[MemoryCore] Error analyzing emotion:', error);
    return { current: 'neutral', trend: 'stable' };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS (Pure extraction - no decisions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract key topics from messages
 * Uses simple frequency analysis
 */
export function extractKeyTopics(messages: string[]): string[] {
  const text = messages.join(' ').toLowerCase();

  const words = text
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  // Count word frequency
  const frequency = new Map<string, number>();
  words.forEach((w) => frequency.set(w, (frequency.get(w) || 0) + 1));

  // Get top 5 most frequent words
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Detect emotional tone from messages
 * NOTE: Heuristic only. Never assume emotional truth.
 */
export function detectEmotionalTone(messages: string[]): string {
  const text = messages.join(' ').toLowerCase();

  let maxCount = 0;
  let detectedTone = 'neutral';

  for (const [tone, pattern] of Object.entries(EMOTION_PATTERNS)) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    const count = matches ? matches.length : 0;

    if (count > maxCount) {
      maxCount = count;
      detectedTone = tone;
    }
  }

  return detectedTone;
}

/**
 * Detect emotion with confidence level
 * NOTE: Heuristic only. Never assume emotional truth.
 */
export function detectEmotionHeuristic(text: string): EmotionHeuristic {
  const lowerText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  const positiveMatches = lowerText.match(EMOTION_PATTERNS.positive);
  const negativeMatches = lowerText.match(EMOTION_PATTERNS.negative);
  const neutralMatches = lowerText.match(EMOTION_PATTERNS.neutral);

  positiveCount = positiveMatches ? positiveMatches.length : 0;
  negativeCount = negativeMatches ? negativeMatches.length : 0;
  neutralCount = neutralMatches ? neutralMatches.length : 0;

  const total = positiveCount + negativeCount + neutralCount;
  
  let detected: EmotionHeuristic['detected'] = 'neutral';
  let confidence: EmotionHeuristic['confidence'] = 'low';

  if (total === 0) {
    detected = 'neutral';
    confidence = 'low';
  } else if (positiveCount > 0 && negativeCount > 0) {
    detected = 'mixed';
    confidence = 'medium';
  } else if (positiveCount > negativeCount) {
    detected = 'positive';
    confidence = positiveCount >= 3 ? 'high' : positiveCount >= 2 ? 'medium' : 'low';
  } else if (negativeCount > positiveCount) {
    detected = 'negative';
    confidence = negativeCount >= 3 ? 'high' : negativeCount >= 2 ? 'medium' : 'low';
  }

  return {
    detected,
    confidence,
    isHeuristicOnly: true, // ALWAYS true - never claim certainty
  };
}

/**
 * Create conversation summary from messages
 */
export function createConversationSummary(messages: Array<{ role: string; content: string }>): string {
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content);

  if (userMessages.length === 0) return 'No messages';

  const firstMessage = userMessages[0];
  return firstMessage.substring(0, 100) + (firstMessage.length > 100 ? '...' : '');
}

/**
 * Extract event description from content
 */
export function extractEventDescription(content: string): string {
  const firstSentence = content.split(/[.!?]/)[0];
  return firstSentence.substring(0, 100).trim();
}

/**
 * Extract issue description from content
 */
export function extractIssueDescription(content: string): string {
  return content.substring(0, 150).trim() + (content.length > 150 ? '...' : '');
}

/**
 * Normalize issue for deduplication
 */
export function normalizeIssue(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .slice(0, 5)
    .join('_');
}

/**
 * Detect issue priority
 */
export function detectIssuePriority(content: string): 'low' | 'medium' | 'high' {
  if (PRIORITY_PATTERNS.high.test(content)) return 'high';
  if (PRIORITY_PATTERNS.medium.test(content)) return 'medium';
  return 'low';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CACHE MANAGEMENT HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Clear memory cache for a user
 * Call after new messages to refresh context
 */
export function clearUserMemoryCache(userId: string): void {
  const cacheKey = createMemoryCacheKey(userId);
  memoryCache.delete(cacheKey);
  console.log(`[MemoryCore] 🗑️ Cache cleared for user: ${userId}`);
}

/**
 * Clear all memory cache
 * For maintenance purposes
 */
export function clearAllMemoryCache(): void {
  memoryCache.clear();
  console.log('[MemoryCore] 🗑️ All memory cache cleared');
}