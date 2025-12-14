/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEEK CONTROLLER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Handle Soriva Seek API endpoints
 * 
 * Endpoints:
 * - POST /api/seek/search     - Main AI search
 * - GET  /api/seek/trending   - Trending searches
 * - GET  /api/seek/stats      - User's search stats
 * - GET  /api/seek/modes      - Available search modes
 * - GET  /api/seek/limits     - User's search limits
 * 
 * Author: Risenex Global
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response } from 'express';
import seekService from './seek.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEEK CONTROLLER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SeekController {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN SEARCH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Perform AI-powered search
   * 
   * POST /api/seek/search
   * Body: { query: string, mode?: 'quick' | 'deep' | 'research' }
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { query, mode } = req.body;

      // ─────────────────────────────────────────────────────────────────
      // Authentication Check
      // ─────────────────────────────────────────────────────────────────
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Validation
      // ─────────────────────────────────────────────────────────────────
      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      if (query.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: 'Query too short. Please enter at least 2 characters.'
        });
        return;
      }

      if (query.length > 500) {
        res.status(400).json({
          success: false,
          error: 'Query too long. Maximum 500 characters allowed.'
        });
        return;
      }

      // Validate mode if provided
      const validModes = ['quick', 'deep', 'research'];
      if (mode && !validModes.includes(mode)) {
        res.status(400).json({
          success: false,
          error: `Invalid mode. Choose from: ${validModes.join(', ')}`
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Check Limits First
      // ─────────────────────────────────────────────────────────────────
      const limitCheck = await seekService.checkSearchLimit(userId);
      
      if (!limitCheck.allowed) {
        res.status(429).json({
          success: false,
          error: limitCheck.reason,
          limits: {
            used: limitCheck.used,
            limit: limitCheck.limit,
            remaining: limitCheck.remaining,
            resetsAt: limitCheck.resetsAt,
          }
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Perform Search
      // ─────────────────────────────────────────────────────────────────
      console.log(`🔍 Seek request: "${query}" [${mode || 'quick'}] by user: ${userId}`);

      const result = await seekService.search(userId, {
        query: query.trim(),
        mode: mode || 'quick',
      });

      // ─────────────────────────────────────────────────────────────────
      // Success Response
      // ─────────────────────────────────────────────────────────────────
      res.status(200).json({
        success: true,
        data: {
          query: result.query,
          mode: result.mode,
          summary: result.summary,
          sources: result.sources,
          relatedQuestions: result.relatedQuestions,
          cached: result.cached || false,
        },
        meta: {
          processingTime: result.processingTime,
          sourcesCount: result.sources.length,
          tokenUsage: result.tokenUsage,
        },
        limits: {
          used: limitCheck.used + 1,
          limit: limitCheck.limit,
          remaining: limitCheck.remaining - 1,
        }
      });

    } catch (error: any) {
      console.error('❌ Seek search error:', error.message);
      
      // Check if it's a limit error
      if (error.message.includes('limit') || error.message.includes('upgrade')) {
        res.status(429).json({
          success: false,
          error: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Search failed. Please try again.'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRENDING SEARCHES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get trending searches
   * 
   * GET /api/seek/trending
   */
  async getTrending(req: Request, res: Response): Promise<void> {
    try {
      const trending = seekService.getTrendingSearches();

      res.status(200).json({
        success: true,
        trending,
        updatedAt: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error('❌ Trending error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trending searches'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USER STATS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's search stats
   * 
   * GET /api/seek/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const stats = await seekService.getSearchStats(userId);

      res.status(200).json({
        success: true,
        stats: {
          searchesUsed: stats.used,
          searchesLimit: stats.limit,
          searchesRemaining: stats.remaining,
          resetsAt: stats.resetsAt,
          planType: stats.planType,
        }
      });

    } catch (error: any) {
      console.error('❌ Stats error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch search stats'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SEARCH MODES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get available search modes
   * 
   * GET /api/seek/modes
   */
  async getModes(req: Request, res: Response): Promise<void> {
    try {
      const modes = seekService.getSearchModes();

      res.status(200).json({
        success: true,
        modes: {
          quick: {
            name: 'Quick',
            icon: '⚡',
            description: modes.quick.description,
            sources: modes.quick.numResults,
          },
          deep: {
            name: 'Deep',
            icon: '📚',
            description: modes.deep.description,
            sources: modes.deep.numResults,
          },
          research: {
            name: 'Research',
            icon: '🔬',
            description: modes.research.description,
            sources: modes.research.numResults,
          },
        },
        default: 'quick',
      });

    } catch (error: any) {
      console.error('❌ Modes error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch search modes'
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LIMITS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get user's search limits
   * 
   * GET /api/seek/limits
   */
  async getLimits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const limitStatus = await seekService.checkSearchLimit(userId);

      res.status(200).json({
        success: true,
        limits: {
          allowed: limitStatus.allowed,
          used: limitStatus.used,
          limit: limitStatus.limit,
          remaining: limitStatus.remaining,
          resetsAt: limitStatus.resetsAt,
        },
        message: limitStatus.allowed
          ? `You have ${limitStatus.remaining} searches remaining this month.`
          : limitStatus.reason,
      });

    } catch (error: any) {
      console.error('❌ Limits error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch search limits'
      });
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default new SeekController();