/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ORBIT AI CONTROLLER
 * Handles API requests for AI-powered orbit suggestions
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response } from 'express';
import orbitAIService from '../../services/orbit-ai.service';
import {
  SuggestOrbitRequest,
  OrbitFeedbackRequest,
} from '../../types/orbit-ai.types';

export class OrbitAIController {
  /**
   * POST /api/orbit/suggest
   * Get AI suggestions for which orbit a conversation belongs to
   */
  async suggestOrbit(req: Request, res: Response): Promise<Response> {
    try {
      // @ts-ignore - User added by auth middleware
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const { conversationTitle } = req.body as SuggestOrbitRequest;

      // Validation
      if (!conversationTitle) {
        return res.status(400).json({
          success: false,
          message: 'Conversation title is required',
        });
      }

      // Get AI suggestions
      const suggestions = await orbitAIService.suggestOrbit(
        userId,
        conversationTitle,
      );

      return res.status(200).json({
        success: true,
        data: { suggestions },
      });
    } catch (error: any) {
      console.error('❌ Error suggesting orbit:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to suggest orbit',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/orbit/feedback
   * Track user feedback on AI suggestions (for learning)
   */
  async trackFeedback(req: Request, res: Response): Promise<Response> {
    try {
      // @ts-ignore - User added by auth middleware
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const {
        conversationId,
        suggestedOrbitId,
        userChoice,
        selectedOrbitId,
      } = req.body as OrbitFeedbackRequest;

      // Validation
      if (!conversationId || !suggestedOrbitId || !userChoice) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      if (!['accepted', 'rejected', 'different'].includes(userChoice)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user choice',
        });
      }

      // Track feedback
      await orbitAIService.trackFeedback(
        userId,
        conversationId,
        suggestedOrbitId,
        userChoice,
        selectedOrbitId,
      );

      return res.status(200).json({
        success: true,
        message: 'Feedback recorded successfully',
      });
    } catch (error: any) {
      console.error('❌ Error tracking feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to track feedback',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/orbit/suggestions/stats
   * Get statistics about suggestion accuracy
   */
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      // @ts-ignore - User added by auth middleware
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Get stats
      const stats = await orbitAIService.getStats(userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('❌ Error getting stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message,
      });
    }
  }
}

export default new OrbitAIController();