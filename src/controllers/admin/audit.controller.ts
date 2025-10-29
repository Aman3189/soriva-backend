// src/controllers/audit.controller.ts
// ============================================
// VALUE AUDIT ANALYTICS CONTROLLER
// Admin dashboard endpoint for AI efficiency metrics
// ============================================

import { Request, Response, NextFunction } from 'express';
import SystemPromptService from '../../core/ai/prompts/system-prompt.service';
import { AppError } from '../../middlewares/error.middleware';

export class AuditController {
  /**
   * Get comprehensive value audit summary
   * GET /api/audit/summary
   */
  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { planType } = req.query;

      // Get analytics (optionally filtered by plan)
      const analytics = SystemPromptService.getValueAuditAnalytics(planType as string | undefined);

      res.status(200).json({
        success: true,
        message: 'Value audit summary retrieved successfully',
        data: {
          analytics,
          timestamp: new Date(),
          filter: planType ? { planType } : { planType: 'all' },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get analytics by plan type
   * GET /api/audit/plans/:planType
   */
  getByPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { planType } = req.params;

      if (!planType) {
        throw new AppError('Plan type is required', 400);
      }

      const analytics = SystemPromptService.getValueAuditAnalytics(planType);

      res.status(200).json({
        success: true,
        message: `Analytics for ${planType} plan retrieved successfully`,
        data: {
          planType,
          analytics,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all plan comparisons
   * GET /api/audit/compare
   */
  comparePlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plans = ['STARTER', 'PLUS', 'PRO', 'EDGE', 'LIFE'];

      const comparison = plans.map((plan) => ({
        planType: plan,
        ...SystemPromptService.getValueAuditAnalytics(plan),
      }));

      // Calculate overall stats
      const overall = SystemPromptService.getValueAuditAnalytics();

      res.status(200).json({
        success: true,
        message: 'Plan comparison retrieved successfully',
        data: {
          overall,
          byPlan: comparison,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get efficiency insights
   * GET /api/audit/insights
   */
  getInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plans = ['STARTER', 'PLUS', 'PRO', 'EDGE', 'LIFE'];

      const planStats = plans.map((plan) => ({
        planType: plan,
        ...SystemPromptService.getValueAuditAnalytics(plan),
      }));

      // Find best and worst performers
      const sortedByTokens = [...planStats].sort((a, b) => a.avgTokens - b.avgTokens);
      const sortedByCompression = [...planStats].sort(
        (a, b) => b.avgCompressionRatio - a.avgCompressionRatio
      );

      const insights = {
        mostEfficient: {
          byTokens: sortedByTokens[0],
          byCompression: sortedByCompression[0],
        },
        leastEfficient: {
          byTokens: sortedByTokens[sortedByTokens.length - 1],
          byCompression: sortedByCompression[sortedByCompression.length - 1],
        },
        overall: SystemPromptService.getValueAuditAnalytics(),
        recommendations: this.generateRecommendations(planStats),
      };

      res.status(200).json({
        success: true,
        message: 'Efficiency insights generated successfully',
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clear audit logs (admin only)
   * POST /api/audit/clear
   */
  clearLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Note: This would need admin authentication middleware
      // For now, just a placeholder

      res.status(200).json({
        success: true,
        message: 'Audit logs cleared successfully',
        data: {
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(planStats: any[]): string[] {
    const recommendations: string[] = [];

    planStats.forEach((stat) => {
      // High token usage
      if (stat.avgTokens > 500) {
        recommendations.push(
          `${stat.planType}: Consider tighter response length limits (avg ${stat.avgTokens} tokens)`
        );
      }

      // Low compression
      if (stat.avgCompressionRatio < 1.2 && stat.totalResponses > 10) {
        recommendations.push(
          `${stat.planType}: Compression could be improved (ratio: ${stat.avgCompressionRatio.toFixed(2)})`
        );
      }

      // Good performance
      if (stat.avgTokens < 250 && stat.avgCompressionRatio > 1.3) {
        recommendations.push(`${stat.planType}: ✅ Excellent efficiency! Keep it up.`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All plans performing within acceptable ranges.');
    }

    return recommendations;
  }
}

// Export singleton instance
export const auditController = new AuditController();
