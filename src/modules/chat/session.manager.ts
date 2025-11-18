// src/modules/chat/session.manager.ts
/**
 * ==========================================
 * SESSION MANAGER - CHAT SESSION MANAGEMENT
 * ==========================================
 * Created: November 6, 2025
 * Updated: November 15, 2025 - Added Gender/Age Personalization
 * Purpose: Manage chat sessions - CRUD, state, metadata, personalization
 * Architecture: Class-Based Singleton | Type-Safe | Clean
 *
 * FEATURES:
 * - Session CRUD operations
 * - Session state management (active, pinned, archived)
 * - Metadata updates (message count, tokens, last activity)
 * - User session queries with filters
 * - Archive/pin support
 * - ⭐ NEW: Gender/Age-based personalization
 *
 * SCHEMA ALIGNMENT:
 * ✅ All fields match ChatSession model
 * ✅ Proper indexes used
 * ✅ Cascade deletes handled
 * ✅ Gender/Age personalization integrated
 */

import { prisma } from '../../config/prisma';
import { plansManager } from '../../constants';
import { Gender, AgeGroup } from '@prisma/client'; // ⭐ NEW: Import enums

// ==========================================
// INTERFACES
// ==========================================

interface CreateSessionOptions {
  userId: string;
  title?: string;
  aiModel?: string;
  brainMode?: string;
  personality?: string;
  // ⭐ NEW: Personalization fields (optional)
  sessionName?: string;        // Name for this session (e.g., "Mummy", "Me")
  sessionGender?: Gender;       // Gender for this session
  sessionAgeGroup?: AgeGroup;   // Age group for this session
}

interface UpdateSessionOptions {
  title?: string;
  aiModel?: string;
  brainMode?: string;
  personality?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isActive?: boolean;
  // ⭐ NEW: Allow updating personalization
  sessionName?: string;
  sessionGender?: Gender;
  sessionAgeGroup?: AgeGroup;
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

// ⭐ NEW: Personalization context interface
interface PersonalizationContext {
  name: string | null;
  gender: Gender;
  ageGroup: AgeGroup;
}

// ==========================================
// SESSION MANAGER CLASS
// ==========================================

export class SessionManager {
  private static instance: SessionManager;

  private constructor() {
    console.log('[SessionManager] Initialized with personalization support');
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION CRUD OPERATIONS (ENHANCED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create new chat session
   * ⭐ ENHANCED: Now supports gender/age personalization
   */
  async createSession(options: CreateSessionOptions) {
    try {
      const {
        userId,
        title,
        aiModel,
        brainMode,
        personality,
        sessionName,      // ⭐ NEW
        sessionGender,    // ⭐ NEW
        sessionAgeGroup,  // ⭐ NEW
      } = options;

      // Get user's plan to determine default AI model
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionPlan: true,
          name: true,                    // ⭐ NEW: Get user name
          defaultGender: true,           // ⭐ NEW: Get default gender
          defaultAgeGroup: true,         // ⭐ NEW: Get default age
        },
      });

      const plan = user?.subscriptionPlan
        ? plansManager.getPlanByName(user.subscriptionPlan)
        : null;

      const defaultModel = plan?.aiModels?.[0]?.modelId || 'claude-sonnet-4';

      // ⭐ NEW: Use provided session data or fall back to user defaults
      const finalSessionName = sessionName || user?.name || 'User';
      const finalGender = sessionGender || user?.defaultGender || Gender.NOT_SPECIFIED;
      const finalAgeGroup = sessionAgeGroup || user?.defaultAgeGroup || AgeGroup.NOT_SPECIFIED;

      const session = await prisma.chatSession.create({
        data: {
          userId,
          title: title || 'New Chat',
          aiModel: aiModel || defaultModel,
          brainMode: brainMode || null,
          personality: personality || null,
          
          // ⭐ NEW: Personalization fields
          sessionName: finalSessionName,
          sessionGender: finalGender,
          sessionAgeGroup: finalAgeGroup,
          
          messageCount: 0,
          totalTokens: 0,
          isActive: true,
          isPinned: false,
          isArchived: false,
          lastMessageAt: new Date(),
        },
      });

      console.log(`[SessionManager] Created session: ${session.id} (${finalSessionName}, ${finalGender}, ${finalAgeGroup})`);

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
  // ⭐ NEW: PERSONALIZATION METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get personalization context for session
   * Used by chat service to build appropriate personality
   */
  async getPersonalizationContext(sessionId: string): Promise<PersonalizationContext | null> {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: {
          sessionName: true,
          sessionGender: true,
          sessionAgeGroup: true,
        },
      });

      if (!session) return null;

      return {
        name: session.sessionName,
        gender: session.sessionGender,
        ageGroup: session.sessionAgeGroup,
      };
    } catch (error: any) {
      console.error('[SessionManager] Get personalization context failed:', error);
      return null;
    }
  }

  /**
   * Update session personalization
   */
  async updatePersonalization(
    sessionId: string,
    userId: string,
    personalization: {
      sessionName?: string;
      sessionGender?: Gender;
      sessionAgeGroup?: AgeGroup;
    }
  ) {
    return this.updateSession(sessionId, userId, personalization);
  }

  /**
   * Get or create session with personalization
   * Useful for new chat flows
   */
  async getOrCreatePersonalizedSession(
    userId: string,
    personalization?: {
      sessionName?: string;
      sessionGender?: Gender;
      sessionAgeGroup?: AgeGroup;
    }
  ) {
    try {
      // Try to get active session
      const activeResult = await this.getActiveSession(userId);
      
      if (activeResult.session) {
        // If personalization provided, update existing session
        if (personalization) {
          await this.updatePersonalization(
            activeResult.session.id,
            userId,
            personalization
          );
        }
        
        return {
          success: true,
          session: activeResult.session,
          isNew: false,
        };
      }

      // No active session - create new one
      const createResult = await this.createSession({
        userId,
        ...personalization,
      });

      return {
        success: createResult.success,
        session: createResult.session,
        isNew: true,
        error: createResult.error,
      };
    } catch (error: any) {
      console.error('[SessionManager] Get or create personalized session failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to get or create session',
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION QUERIES (UNCHANGED)
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
  // SESSION STATE MANAGEMENT (UNCHANGED)
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
  // SESSION METADATA UPDATES (UNCHANGED)
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
  // BULK OPERATIONS (UNCHANGED)
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
  // SEARCH & FILTER (UNCHANGED)
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