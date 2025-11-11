// src/modules/chat/session.manager.ts
/**
 * ==========================================
 * SESSION MANAGER - CHAT SESSION MANAGEMENT
 * ==========================================
 * Created: November 6, 2025
 * Purpose: Manage chat sessions - CRUD, state, metadata
 * Architecture: Class-Based Singleton | Type-Safe | Clean
 *
 * FEATURES:
 * - Session CRUD operations
 * - Session state management (active, pinned, archived)
 * - Metadata updates (message count, tokens, last activity)
 * - User session queries with filters
 * - Archive/pin support
 *
 * SCHEMA ALIGNMENT:
 * ✅ All fields match ChatSession model
 * ✅ Proper indexes used
 * ✅ Cascade deletes handled
 */

import { prisma } from '../../config/prisma';
import { plansManager } from '../../constants';

// ==========================================
// INTERFACES
// ==========================================

interface CreateSessionOptions {
  userId: string;
  title?: string;
  aiModel?: string;
  brainMode?: string;
  personality?: string;
}

interface UpdateSessionOptions {
  title?: string;
  aiModel?: string;
  brainMode?: string;
  personality?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isActive?: boolean;
}

interface SessionQueryOptions {
  limit?: number;
  includeArchived?: boolean;
  onlyPinned?: boolean;
  onlyActive?: boolean;
}

interface SessionStats {
  messageCount: number;
  totalTokens: number;
  lastActivity: Date;
}

// ==========================================
// SESSION MANAGER CLASS
// ==========================================

export class SessionManager {
  private static instance: SessionManager;

  private constructor() {
    console.log('[SessionManager] Initialized');
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION CRUD OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create new chat session
   */
  async createSession(options: CreateSessionOptions) {
    try {
      const { userId, title, aiModel, brainMode, personality } = options;

      // Get user's plan to determine default AI model
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      });

      const plan = user?.subscriptionPlan
        ? plansManager.getPlanByName(user.subscriptionPlan)
        : null;

      const defaultModel = plan?.aiModels?.[0]?.modelId || 'claude-sonnet-4';

      const session = await prisma.chatSession.create({
        data: {
          userId,
          title: title || 'New Chat',
          aiModel: aiModel || defaultModel,
          brainMode: brainMode || null,
          personality: personality || null,
          messageCount: 0,
          totalTokens: 0,
          isActive: true,
          isPinned: false,
          isArchived: false,
          lastMessageAt: new Date(),
        },
      });

      console.log(`[SessionManager] Created session: ${session.id}`);

      return {
        success: true,
        session,
      };
    } catch (error: any) {
      console.error('[SessionManager] Create session failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create session',
      };
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string, userId: string) {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50, // Last 50 messages
          },
        },
      });

      if (!session) {
        return {
          success: false,
          error: 'Session not found',
        };
      }

      return {
        success: true,
        session,
      };
    } catch (error: any) {
      console.error('[SessionManager] Get session failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to get session',
      };
    }
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: string,
    userId: string,
    updates: UpdateSessionOptions
  ) {
    try {
      // Verify ownership
      const existing = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
      });

      if (!existing) {
        return {
          success: false,
          error: 'Session not found',
        };
      }

      const session = await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        session,
      };
    } catch (error: any) {
      console.error('[SessionManager] Update session failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to update session',
      };
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string, userId: string) {
    try {
      // Verify ownership
      const existing = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
      });

      if (!existing) {
        return {
          success: false,
          error: 'Session not found',
        };
      }

      await prisma.chatSession.delete({
        where: { id: sessionId },
      });

      console.log(`[SessionManager] Deleted session: ${sessionId}`);

      return {
        success: true,
        message: 'Session deleted successfully',
      };
    } catch (error: any) {
      console.error('[SessionManager] Delete session failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete session',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION QUERIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's sessions with filters
   */
  async getUserSessions(userId: string, options?: SessionQueryOptions) {
    try {
      const {
        limit = 20,
        includeArchived = false,
        onlyPinned = false,
        onlyActive = true,
      } = options || {};

      const sessions = await prisma.chatSession.findMany({
        where: {
          userId,
          ...(onlyActive && { isActive: true }),
          ...(onlyPinned && { isPinned: true }),
          ...(!includeArchived && { isArchived: false }),
        },
        orderBy: [
          { isPinned: 'desc' }, // Pinned first
          { lastMessageAt: 'desc' }, // Then by recent activity
        ],
        take: limit,
      });

      return {
        success: true,
        sessions,
        total: sessions.length,
      };
    } catch (error: any) {
      console.error('[SessionManager] Get user sessions failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to get sessions',
        sessions: [],
        total: 0,
      };
    }
  }

  /**
   * Get active session for user (most recent)
   */
  async getActiveSession(userId: string) {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          userId,
          isActive: true,
          isArchived: false,
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      return {
        success: true,
        session: session || null,
      };
    } catch (error: any) {
      console.error('[SessionManager] Get active session failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to get active session',
        session: null,
      };
    }
  }

  /**
   * Get pinned sessions
   */
  async getPinnedSessions(userId: string) {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: {
          userId,
          isPinned: true,
          isArchived: false,
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      return {
        success: true,
        sessions,
      };
    } catch (error: any) {
      console.error('[SessionManager] Get pinned sessions failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to get pinned sessions',
        sessions: [],
      };
    }
  }

  /**
   * Get archived sessions
   */
  async getArchivedSessions(userId: string, limit: number = 20) {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: {
          userId,
          isArchived: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });

      return {
        success: true,
        sessions,
      };
    } catch (error: any) {
      console.error('[SessionManager] Get archived sessions failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to get archived sessions',
        sessions: [],
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION STATE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Pin/Unpin session
   */
  async togglePin(sessionId: string, userId: string, pinned: boolean) {
    return this.updateSession(sessionId, userId, { isPinned: pinned });
  }

  /**
   * Archive/Unarchive session
   */
  async toggleArchive(sessionId: string, userId: string, archived: boolean) {
    return this.updateSession(sessionId, userId, { isArchived: archived });
  }

  /**
   * Activate/Deactivate session
   */
  async toggleActive(sessionId: string, userId: string, active: boolean) {
    return this.updateSession(sessionId, userId, { isActive: active });
  }

  /**
   * Update session title
   */
  async updateTitle(sessionId: string, userId: string, title: string) {
    return this.updateSession(sessionId, userId, { title });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION METADATA UPDATES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Increment message count
   */
  async incrementMessageCount(sessionId: string, count: number = 1) {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          messageCount: { increment: count },
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error('[SessionManager] Increment message count failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to update message count',
      };
    }
  }

  /**
   * Update token count
   */
  async updateTokens(sessionId: string, tokensUsed: number) {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          totalTokens: { increment: tokensUsed },
          updatedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error('[SessionManager] Update tokens failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to update tokens',
      };
    }
  }

  /**
   * Update last message timestamp
   */
  async updateLastActivity(sessionId: string) {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error('[SessionManager] Update last activity failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to update last activity',
      };
    }
  }

  /**
   * Get session stats
   */
  async getSessionStats(sessionId: string): Promise<SessionStats | null> {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: {
          messageCount: true,
          totalTokens: true,
          lastMessageAt: true,
        },
      });

      if (!session) return null;

      return {
        messageCount: session.messageCount,
        totalTokens: session.totalTokens,
        lastActivity: session.lastMessageAt,
      };
    } catch (error: any) {
      console.error('[SessionManager] Get session stats failed:', error);
      return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BULK OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Delete all user sessions
   */
  async deleteAllUserSessions(userId: string) {
    try {
      const result = await prisma.chatSession.deleteMany({
        where: { userId },
      });

      console.log(`[SessionManager] Deleted ${result.count} sessions for user ${userId}`);

      return {
        success: true,
        deletedCount: result.count,
      };
    } catch (error: any) {
      console.error('[SessionManager] Delete all sessions failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete sessions',
        deletedCount: 0,
      };
    }
  }

  /**
   * Archive old inactive sessions (cleanup job)
   */
  async archiveInactiveSessions(daysInactive: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

      const result = await prisma.chatSession.updateMany({
        where: {
          lastMessageAt: { lte: cutoffDate },
          isArchived: false,
          isPinned: false, // Don't auto-archive pinned sessions
        },
        data: {
          isArchived: true,
          updatedAt: new Date(),
        },
      });

      console.log(`[SessionManager] Auto-archived ${result.count} inactive sessions`);

      return {
        success: true,
        archivedCount: result.count,
      };
    } catch (error: any) {
      console.error('[SessionManager] Archive inactive sessions failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to archive sessions',
        archivedCount: 0,
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SEARCH & FILTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Search sessions by title
   */
  async searchSessions(userId: string, query: string, limit: number = 20) {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: {
          userId,
          title: {
            contains: query,
            mode: 'insensitive',
          },
          isArchived: false,
        },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
      });

      return {
        success: true,
        sessions,
      };
    } catch (error: any) {
      console.error('[SessionManager] Search sessions failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to search sessions',
        sessions: [],
      };
    }
  }

  /**
   * Count user sessions
   */
  async countUserSessions(userId: string, includeArchived: boolean = false) {
    try {
      const count = await prisma.chatSession.count({
        where: {
          userId,
          ...(!includeArchived && { isArchived: false }),
        },
      });

      return {
        success: true,
        count,
      };
    } catch (error: any) {
      console.error('[SessionManager] Count sessions failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to count sessions',
        count: 0,
      };
    }
  }
}

// ==========================================
// EXPORT SINGLETON INSTANCE
// ==========================================

export default SessionManager.getInstance();