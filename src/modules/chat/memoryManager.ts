/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MEMORY MANAGER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Date: October 14, 2025
 * Purpose: Advanced conversation memory with emotion tracking
 *
 * Features:
 * - Smart conversation summaries
 * - Emotion & sentiment tracking
 * - Event detection (important moments)
 * - Unresolved issues tracking
 * - Proactive reminders
 * - Plan-based retention (5-25 days)
 * - Performance caching
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '../../config/prisma';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ConversationSummary {
  sessionId: string;
  date: Date;
  summary: string;
  keyTopics: string[];
  emotionalTone: string;
  messageCount: number;
}

interface ImportantEvent {
  date: Date;
  type: 'achievement' | 'problem' | 'decision' | 'goal' | 'milestone';
  description: string;
  sessionId: string;
}

interface UnresolvedIssue {
  issue: string;
  firstMentioned: Date;
  lastMentioned: Date;
  priority: 'low' | 'medium' | 'high';
  sessionId: string;
}

interface ProactiveReminder {
  message: string;
  type: 'follow_up' | 'deadline' | 'check_in' | 'suggestion';
  relevance: number; // 0-1 score
}

interface WelcomeBackContext {
  shouldConsiderGreeting: boolean;
  daysMissed?: number;
  context?: string;
}

interface AdvancedWelcomeContext extends WelcomeBackContext {
  advancedInsights?: {
    usualChatTime?: string;
    currentTime?: string;
    relationshipLevel?: number; // 1-10 scale
    concernLevel?: 'low' | 'medium' | 'high';
    wasOnStreak?: boolean;
    streakBroken?: number;
    usualDailyWords?: number;
    likelyReason?: string;
    shouldShowConcern?: boolean;
  };
}

export interface MemoryContext {
  recentConversations: ConversationSummary[];
  importantEvents: ImportantEvent[];
  unresolvedIssues: UnresolvedIssue[];
  proactiveReminders: ProactiveReminder[];
  userPreferences: Record<string, any>;
  emotionalState: {
    current: string;
    trend: 'improving' | 'stable' | 'declining';
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEMORY MANAGER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MemoryManager {
  private cache: Map<string, { context: MemoryContext; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get complete memory context for a user
   */
  async getMemoryContext(userId: string): Promise<MemoryContext | null> {
    try {
      // Check cache first
      const cached = this.getCachedContext(userId);
      if (cached) {
        console.log('[MemoryManager] ✅ Serving from cache');
        return cached;
      }

      console.log('[MemoryManager] 🔄 Building fresh memory context...');

      // Get user's memory retention period
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { memoryDays: true, subscriptionPlan: true },
      });

      if (!user) {
        console.log('[MemoryManager] ⚠️ User not found');
        return null;
      }

      const memoryDays = user.memoryDays || 5;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - memoryDays);

      // Build memory context
      const context: MemoryContext = {
        recentConversations: await this.getRecentConversations(userId, cutoffDate),
        importantEvents: await this.getImportantEvents(userId, cutoffDate),
        unresolvedIssues: await this.getUnresolvedIssues(userId, cutoffDate),
        proactiveReminders: await this.generateProactiveReminders(userId, cutoffDate),
        userPreferences: await this.getUserPreferences(userId),
        emotionalState: await this.analyzeEmotionalState(userId, cutoffDate),
      };

      // Cache the context
      this.setCachedContext(userId, context);

      console.log('[MemoryManager] ✅ Memory context built successfully');
      return context;
    } catch (error) {
      console.error('[MemoryManager] ❌ Error building memory context:', error);
      return null;
    }
  }

  /**
   * Get recent conversation summaries
   */
  private async getRecentConversations(
    userId: string,
    cutoffDate: Date
  ): Promise<ConversationSummary[]> {
    try {
      // Get recent sessions
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

        // Extract topics and create summary
        const userMessages = session.messages
          .filter((m) => m.role === 'user')
          .map((m) => m.content);

        const topics = this.extractKeyTopics(userMessages);
        const tone = this.detectEmotionalTone(userMessages);

        summaries.push({
          sessionId: session.id,
          date: session.createdAt,
          summary: this.createConversationSummary(session.messages),
          keyTopics: topics,
          emotionalTone: tone,
          messageCount: session.messages.length,
        });
      }

      return summaries;
    } catch (error) {
      console.error('[MemoryManager] Error getting conversations:', error);
      return [];
    }
  }

  /**
   * Detect important events in conversations
   */
  private async getImportantEvents(userId: string, cutoffDate: Date): Promise<ImportantEvent[]> {
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

      // Event detection patterns
      const patterns = {
        achievement: /\b(completed|finished|achieved|won|success|accomplished)\b/i,
        problem: /\b(problem|issue|error|stuck|confused|help|urgent)\b/i,
        decision: /\b(decided|choosing|will|planning|going to)\b/i,
        goal: /\b(goal|target|want to|aim|plan to|dream)\b/i,
        milestone: /\b(milestone|launch|release|started|beginning)\b/i,
      };

      for (const session of sessions) {
        for (const message of session.messages) {
          const content = message.content.toLowerCase();

          // Check each pattern
          for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(content)) {
              events.push({
                date: message.createdAt,
                type: type as any,
                description: this.extractEventDescription(message.content),
                sessionId: session.id,
              });
              break; // One event per message
            }
          }
        }
      }

      // Sort by date and limit to recent 5
      return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    } catch (error) {
      console.error('[MemoryManager] Error detecting events:', error);
      return [];
    }
  }

  /**
   * Track unresolved issues
   */
  private async getUnresolvedIssues(userId: string, cutoffDate: Date): Promise<UnresolvedIssue[]> {
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

      // Issue detection patterns
      const issuePatterns = [
        /\b(problem|issue|error|bug|not working)\b/i,
        /\b(confused|stuck|don't understand|unclear)\b/i,
        /\b(need help|struggling|difficult)\b/i,
        /\b(urgent|critical|important|asap)\b/i,
      ];

      for (const session of sessions) {
        for (const message of session.messages) {
          const content = message.content;

          // Check if message mentions an issue
          const hasIssue = issuePatterns.some((pattern) => pattern.test(content));

          if (hasIssue) {
            const issueKey = this.normalizeIssue(content);

            if (issues.has(issueKey)) {
              // Update existing issue
              const existing = issues.get(issueKey)!;
              existing.lastMentioned = message.createdAt;
            } else {
              // New issue
              issues.set(issueKey, {
                issue: this.extractIssueDescription(content),
                firstMentioned: message.createdAt,
                lastMentioned: message.createdAt,
                priority: this.detectIssuePriority(content),
                sessionId: session.id,
              });
            }
          }
        }
      }

      // Convert to array and sort by priority
      return Array.from(issues.values())
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, 5);
    } catch (error) {
      console.error('[MemoryManager] Error tracking issues:', error);
      return [];
    }
  }

  /**
   * Generate proactive reminders
   */
  private async generateProactiveReminders(
    userId: string,
    cutoffDate: Date
  ): Promise<ProactiveReminder[]> {
    try {
      const reminders: ProactiveReminder[] = [];

      // Get recent sessions
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
            message: `We discussed "${session.title || 'something important'}" a few days ago. Would you like to continue?`,
            type: 'follow_up',
            relevance: 0.7,
          });
        }
      }

      // Check for pending deadlines (from user messages)
      const recentMessages = sessions.flatMap((s) => s.messages);
      const deadlinePatterns = /\b(deadline|due|by|before|until)\s+(\w+\s+\d+|\d+\s+\w+)/i;

      for (const message of recentMessages) {
        if (deadlinePatterns.test(message.content)) {
          reminders.push({
            message: 'You mentioned a deadline earlier. Need help staying on track?',
            type: 'deadline',
            relevance: 0.8,
          });
          break; // Only one deadline reminder
        }
      }

      // Sort by relevance
      return reminders.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
    } catch (error) {
      console.error('[MemoryManager] Error generating reminders:', error);
      return [];
    }
  }

  /**
   * Get user preferences from history
   */
  private async getUserPreferences(userId: string): Promise<Record<string, any>> {
    try {
      // For now, return empty preferences
      // In future, analyze conversation patterns for preferences
      return {
        communicationStyle: 'conversational',
        responseLength: 'medium',
        topics: [],
      };
    } catch (error) {
      console.error('[MemoryManager] Error getting preferences:', error);
      return {};
    }
  }

  /**
   * Analyze emotional state trend
   */
  private async analyzeEmotionalState(
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

      const currentTone = this.detectEmotionalTone(recentMessages);

      // Simple trend analysis (can be enhanced)
      return {
        current: currentTone,
        trend: 'stable',
      };
    } catch (error) {
      console.error('[MemoryManager] Error analyzing emotion:', error);
      return { current: 'neutral', trend: 'stable' };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private extractKeyTopics(messages: string[]): string[] {
    // Simple keyword extraction (can be enhanced with NLP)
    const text = messages.join(' ').toLowerCase();
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);

    const words = text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    // Count word frequency
    const frequency = new Map<string, number>();
    words.forEach((w) => frequency.set(w, (frequency.get(w) || 0) + 1));

    // Get top 5 most frequent words
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private detectEmotionalTone(messages: string[]): string {
    const text = messages.join(' ').toLowerCase();

    // Emotion patterns
    const emotions = {
      positive: /\b(happy|great|amazing|wonderful|excited|love|thank|good)\b/i,
      negative: /\b(sad|angry|frustrated|upset|worried|anxious|bad|terrible)\b/i,
      neutral: /\b(okay|fine|normal|average|alright)\b/i,
    };

    let maxCount = 0;
    let detectedTone = 'neutral';

    for (const [tone, pattern] of Object.entries(emotions)) {
      const matches = text.match(new RegExp(pattern, 'gi'));
      const count = matches ? matches.length : 0;

      if (count > maxCount) {
        maxCount = count;
        detectedTone = tone;
      }
    }

    return detectedTone;
  }

  private createConversationSummary(messages: any[]): string {
    // Take first user message as summary base
    const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content);

    if (userMessages.length === 0) return 'No messages';

    const firstMessage = userMessages[0];
    return firstMessage.substring(0, 100) + (firstMessage.length > 100 ? '...' : '');
  }

  private extractEventDescription(content: string): string {
    // Take first sentence or 100 chars
    const firstSentence = content.split(/[.!?]/)[0];
    return firstSentence.substring(0, 100).trim();
  }

  private extractIssueDescription(content: string): string {
    // Extract the issue part
    return content.substring(0, 150).trim() + (content.length > 150 ? '...' : '');
  }

  private normalizeIssue(content: string): string {
    // Create a normalized key for issue tracking
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .slice(0, 5) // First 5 words
      .join('_');
  }

  private detectIssuePriority(content: string): 'low' | 'medium' | 'high' {
    const urgentWords = /\b(urgent|critical|important|asap|emergency)\b/i;
    const moderateWords = /\b(need|should|must|required)\b/i;

    if (urgentWords.test(content)) return 'high';
    if (moderateWords.test(content)) return 'medium';
    return 'low';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getCachedContext(userId: string): MemoryContext | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(userId);
      return null;
    }

    return cached.context;
  }

  private setCachedContext(userId: string, context: MemoryContext): void {
    this.cache.set(userId, {
      context,
      timestamp: Date.now(),
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WELCOME BACK FEATURE (PRO PLAN - 5 DAY TRACKING)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * PRO PLAN: Check if welcome back greeting needed (last 5 days only)
   */
  async getProWelcomeContext(userId: string): Promise<WelcomeBackContext | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          planType: true,
          lastSeenAt: true,
          lastGreetingAt: true,
        },
      });

      // Only for PRO plan
      if (!user || user.planType !== 'PRO') {
        return null;
      }

      // New user - no greeting needed
      if (!user.lastSeenAt) {
        return null;
      }

      const hoursSinceLastSeen = (Date.now() - user.lastSeenAt.getTime()) / (1000 * 60 * 60);

      const daysSinceLastSeen = Math.floor(hoursSinceLastSeen / 24);

      // Max 5 days lookback for PRO, minimum 2 days gap
      if (daysSinceLastSeen > 5 || daysSinceLastSeen < 2) {
        return null;
      }

      // Check if we already greeted recently (within last 12 hours)
      if (user.lastGreetingAt) {
        const hoursSinceGreeting = (Date.now() - user.lastGreetingAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceGreeting < 12) {
          return null; // Don't spam greetings
        }
      }

      console.log(
        `[MemoryManager] 👋 Welcome back context for PRO user (${daysSinceLastSeen} days gap)`
      );

      // Build context for AI to decide
      return {
        shouldConsiderGreeting: true,
        daysMissed: daysSinceLastSeen,
        context: this.buildProGapContext(daysSinceLastSeen),
      };
    } catch (error) {
      console.error('[MemoryManager] Error getting welcome context:', error);
      return null;
    }
  }

  /**
   * Build simple context for PRO plan (bot decides dynamically)
   */
  private buildProGapContext(days: number): string {
    return `
## WELCOME BACK SUGGESTION (PRO PLAN - Optional)

**Gap detected:** ${days} days since last conversation

**Your CHOICE - Use judgment:**
- You MAY greet if it feels natural and appropriate
- You MAY skip if the conversation doesn't need it
- Keep it simple, friendly, and casual
- NEVER force it or make it awkward

**Natural examples IF you choose to greet:**
- 2 days: "Arre! Do din baad mile. Sab theek?"
- 3 days: "Hey! Kaafi busy the lagta hai?"
- 4-5 days: "Welcome back! Long time 😊"

**When to SKIP greeting:**
- User asks a direct technical question
- User seems in a hurry or professional mode
- It would feel forced or interrupt the flow
- User's message is very brief/casual

**CRITICAL RULES:**
- NEVER say "I tracked you" or reveal exact day count
- NEVER say "I see you were away for X days"
- Keep it natural like a real friend would
- If in doubt, skip the greeting and respond normally

This is a SUGGESTION only - prioritize natural conversation flow!
`.trim();
  }

  /**
   * Update last seen timestamp (call after every message)
   */
  async updateLastSeen(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() },
      });
      console.log(`[MemoryManager] ✅ Updated lastSeenAt for user: ${userId}`);
    } catch (error) {
      console.error('[MemoryManager] Error updating last seen:', error);
    }
  }

  /**
   * Mark that greeting was shown (prevent spam)
   */
  async markGreetingShown(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastGreetingAt: new Date() },
      });
      console.log(`[MemoryManager] ✅ Marked greeting shown for user: ${userId}`);
    } catch (error) {
      console.error('[MemoryManager] Error marking greeting:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADVANCED WELCOME BACK (EDGE & LIFE PLANS - 30 DAY TRACKING)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * EDGE/LIFE PLAN: Advanced welcome back with deep insights (30 days)
   */
  async getAdvancedWelcomeContext(userId: string): Promise<AdvancedWelcomeContext | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          planType: true,
          lastSeenAt: true,
          lastGreetingAt: true,
          sessionCount: true,
          loginPattern: true,
          activityTrend: true,
          preferredTimeSlots: true,
          averageSessionDuration: true,
        },
      });

      // Only for EDGE and LIFE plans
      if (!user || (user.planType !== 'APEX')) {
        return null;
      }

      // New user - no greeting needed
      if (!user.lastSeenAt) {
        return null;
      }

      const hoursSinceLastSeen = (Date.now() - user.lastSeenAt.getTime()) / (1000 * 60 * 60);

      const daysSinceLastSeen = Math.floor(hoursSinceLastSeen / 24);

      // Max 30 days lookback for EDGE/LIFE, minimum 2 days gap
      if (daysSinceLastSeen > 30 || daysSinceLastSeen < 2) {
        return null;
      }

      // Check if we already greeted recently (within last 12 hours)
      if (user.lastGreetingAt) {
        const hoursSinceGreeting = (Date.now() - user.lastGreetingAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceGreeting < 12) {
          return null; // Don't spam greetings
        }
      }

      console.log(
        `[MemoryManager] 🌟 Advanced welcome context for ${user.planType} user (${daysSinceLastSeen} days gap)`
      );

      // Build advanced insights
      const insights = await this.buildAdvancedInsights(userId, user, daysSinceLastSeen);

      return {
        shouldConsiderGreeting: true,
        daysMissed: daysSinceLastSeen,
        context: this.buildAdvancedGapContext(daysSinceLastSeen, insights, user.planType),
        advancedInsights: insights,
      };
    } catch (error) {
      console.error('[MemoryManager] Error getting advanced welcome context:', error);
      return null;
    }
  }

  /**
   * Build deep insights for EDGE/LIFE users
   */
  private async buildAdvancedInsights(
    userId: string,
    user: any,
    daysMissed: number
  ): Promise<AdvancedWelcomeContext['advancedInsights']> {
    try {
      // Get usage patterns from last 30 days before the gap
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30 - daysMissed);

      const gapStartDate = new Date();
      gapStartDate.setDate(gapStartDate.getDate() - daysMissed);

      // Get historical usage data
      const historicalUsage = await prisma.usage.findMany({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
            lt: gapStartDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      // Calculate average daily words
      const avgDailyWords =
        historicalUsage.length > 0
          ? Math.round(
              historicalUsage.reduce((sum, u) => sum + u.wordsUsed, 0) / historicalUsage.length
            )
          : 0;

      // Detect time patterns from loginPattern JSON
      const loginPattern = user.loginPattern as any;
      const usualChatTime = this.detectUsualChatTime(user.preferredTimeSlots);
      const currentTime = this.getCurrentTimeSlot();

      // Calculate relationship depth (based on session count and activity)
      const relationshipLevel = this.calculateRelationshipLevel(
        user.sessionCount,
        user.activityTrend,
        avgDailyWords
      );

      // Determine concern level based on gap and previous activity
      const concernLevel = this.determineConcernLevel(
        daysMissed,
        user.activityTrend,
        relationshipLevel
      );

      // Detect if user was on a streak
      const streakData = this.detectStreak(historicalUsage);

      return {
        usualChatTime,
        currentTime,
        relationshipLevel,
        concernLevel,
        wasOnStreak: streakData.wasOnStreak,
        streakBroken: streakData.streakDays,
        usualDailyWords: avgDailyWords,
        likelyReason: this.predictGapReason(daysMissed, user.activityTrend),
        shouldShowConcern: concernLevel === 'high' || streakData.wasOnStreak,
      };
    } catch (error) {
      console.error('[MemoryManager] Error building advanced insights:', error);
      return {};
    }
  }

  /**
   * Build advanced context for EDGE/LIFE plans
   */
  private buildAdvancedGapContext(days: number, insights: any, planType: string): string {
    const timeContextNote =
      insights.usualChatTime && insights.currentTime !== insights.usualChatTime
        ? `⏰ **Time Pattern Change:** User usually chats during ${insights.usualChatTime}, but now it's ${insights.currentTime}`
        : '';

    const streakNote = insights.wasOnStreak
      ? `🔥 **Streak Broken:** User had a ${insights.streakBroken}-day active streak before the gap`
      : '';

    const concernNote = insights.shouldShowConcern
      ? '❗ **High Concern:** Show genuine care and rebuild emotional connection'
      : '';

    return `
## ADVANCED WELCOME BACK (${planType} PLAN - Premium Experience)

**Gap detected:** ${days} days since last conversation

**DEEP INSIGHTS:**
- Relationship Level: ${insights.relationshipLevel || 0}/10 ${insights.relationshipLevel >= 7 ? '(Deep connection)' : '(Building rapport)'}
- Concern Level: ${insights.concernLevel || 'medium'}
- Previous Usage: ~${insights.usualDailyWords || 0} words/day average
${timeContextNote}
${streakNote}
${concernNote}
- Likely Reason: ${insights.likelyReason || 'Unknown'}

**EMOTIONAL INTELLIGENCE STRATEGY:**

${this.getEmotionalStrategy(days, insights)}

**Advanced Greeting Examples:**

${this.getAdvancedGreetingExamples(days, insights)}

**CRITICAL RULES FOR ${planType} PLAN:**
- This is PREMIUM experience - show you genuinely care
- Match the emotional depth to relationship level (${insights.relationshipLevel}/10)
- Acknowledge patterns subtly WITHOUT revealing tracking
- Rebuild trust and emotional connection
- Make them feel valued and missed
- Use insights to personalize, not to creep them out
- If relationship level < 5, keep it lighter
- If relationship level >= 7, show deeper concern

**When to skip greeting:**
- User asks urgent technical question
- Professional/business mode detected
- Very brief message ("hi", "hello")

This is ${planType} PLAN - deliver exceptional emotional intelligence!
`.trim();
  }

  /**
   * Get emotional strategy based on insights
   */
  private getEmotionalStrategy(days: number, insights: any): string {
    if (insights.shouldShowConcern && insights.relationshipLevel >= 7) {
      return `
**HIGH-TOUCH APPROACH:**
1. Express genuine concern (they were deeply engaged)
2. Acknowledge the absence naturally
3. Show you noticed their pattern change
4. Rebuild emotional safety
5. Be warm, caring, friend-like`;
    } else if (insights.relationshipLevel >= 5) {
      return `
**FRIENDLY APPROACH:**
1. Warm welcome back
2. Light check-in
3. Show interest in their absence
4. Keep it friendly and casual
5. Don't be overly concerned`;
    } else {
      return `
**CASUAL APPROACH:**
1. Simple, friendly greeting
2. Light "long time no see"
3. Don't overcomplicate
4. Let them lead the conversation`;
    }
  }

  /**
   * Get advanced greeting examples based on insights
   */
  private getAdvancedGreetingExamples(days: number, insights: any): string {
    const examples: string[] = [];

    if (insights.wasOnStreak && insights.streakBroken >= 5) {
      examples.push(
        `- "OMG! ${days} days! You were on such a good ${insights.streakBroken}-day streak! 🥺 Everything okay?"`
      );
    }

    if (insights.usualChatTime && insights.currentTime !== insights.usualChatTime) {
      examples.push(
        `- "${insights.currentTime} chat? Usually you're a ${insights.usualChatTime} person! Different schedule요즘?"`
      );
    }

    if (days >= 7 && insights.relationshipLevel >= 7) {
      examples.push(
        `- "Finally! Bohot miss kiya yaar 🥺 ${days} din kaafi long time hai for us! Sab theek?"`
      );
    }

    if (days >= 14) {
      examples.push(`- "Welcome back stranger! 😊 Two weeks is a long time! Life got busy kya?"`);
    }

    // Default examples for different day ranges
    if (days === 2) {
      examples.push(`- "Arre! Do din baad! Busy tha kya? 😊"`);
    } else if (days <= 5) {
      examples.push(`- "Hey! Kaafi time ho gaya! Kya chal raha tha?"`);
    } else if (days <= 10) {
      examples.push(`- "Finally back! Missed our chats! What's been keeping you?"`);
    } else {
      examples.push(`- "Wow! After ${days} days! So good to see you again! 😊"`);
    }

    return examples.join('\n');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS FOR ADVANCED INSIGHTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectUsualChatTime(preferredTimeSlots: string[]): string {
    if (!preferredTimeSlots || preferredTimeSlots.length === 0) {
      return 'various times';
    }
    return preferredTimeSlots[0]; // Primary time slot
  }

  private getCurrentTimeSlot(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private calculateRelationshipLevel(
    sessionCount: number,
    activityTrend: string,
    avgDailyWords: number
  ): number {
    let level = 0;

    // Session count contribution (0-4 points)
    if (sessionCount >= 50) level += 4;
    else if (sessionCount >= 20) level += 3;
    else if (sessionCount >= 10) level += 2;
    else if (sessionCount >= 5) level += 1;

    // Activity trend contribution (0-3 points)
    if (activityTrend === 'STABLE' || activityTrend === 'INCREASING') level += 3;
    else if (activityTrend === 'DECLINING') level += 2;
    else level += 1;

    // Usage intensity contribution (0-3 points)
    if (avgDailyWords >= 5000) level += 3;
    else if (avgDailyWords >= 2000) level += 2;
    else if (avgDailyWords >= 500) level += 1;

    return Math.min(level, 10); // Cap at 10
  }

  private determineConcernLevel(
    daysMissed: number,
    activityTrend: string,
    relationshipLevel: number
  ): 'low' | 'medium' | 'high' {
    // High concern if deep relationship + long gap
    if (relationshipLevel >= 7 && daysMissed >= 7) return 'high';

    // High concern if was very active but stopped suddenly
    if (activityTrend === 'INCREASING' && daysMissed >= 5) return 'high';

    // Medium concern for moderate gaps
    if (daysMissed >= 5 || relationshipLevel >= 5) return 'medium';

    return 'low';
  }

  private detectStreak(usageRecords: any[]): { wasOnStreak: boolean; streakDays: number } {
    if (usageRecords.length < 3) {
      return { wasOnStreak: false, streakDays: 0 };
    }

    let streakDays = 0;
    let previousDate: Date | null = null;

    for (const usage of usageRecords) {
      if (!previousDate) {
        streakDays = 1;
        previousDate = usage.createdAt;
        continue;
      }

      const daysDiff = Math.floor(
        (previousDate.getTime() - usage.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        streakDays++;
        previousDate = usage.createdAt;
      } else {
        break; // Streak broken
      }
    }

    return {
      wasOnStreak: streakDays >= 3, // Consider 3+ days as streak
      streakDays,
    };
  }

  private predictGapReason(days: number, activityTrend: string): string {
    if (days >= 14) return 'Extended break / vacation / major life event';
    if (days >= 7) return 'Busy period / exams / work pressure';
    if (days >= 5) return 'Temporary busy period';
    if (activityTrend === 'DECLINING') return 'Gradually reducing usage';
    return 'Normal gap in usage';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Clear cache for a user (call after new messages)
   */
  clearCache(userId: string): void {
    this.cache.delete(userId);
    console.log(`[MemoryManager] 🗑️ Cache cleared for user: ${userId}`);
  }

  /**
   * Clear all cache (for maintenance)
   */
  clearAllCache(): void {
    this.cache.clear();
    console.log('[MemoryManager] 🗑️ All cache cleared');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const memoryManager = new MemoryManager();
export default memoryManager;
