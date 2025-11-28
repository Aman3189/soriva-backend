// ============================================
// SORIVA HEALTH - CONTROLLER
// Path: src/modules/health/health.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { healthService } from './health.service';
import {
  UploadReportRequest,
  HealthChatRequest,
  CompareReportsRequest,
  GenerateSummaryRequest,
  AddFamilyMemberRequest,
  AddEmergencyContactRequest,
  HealthError,
} from './health.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CONTROLLER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class HealthController {
  // ════════════════════════════════════════════════════
  // DASHBOARD & STATS
  // ════════════════════════════════════════════════════

  /**
   * GET /health/stats
   * Get dashboard statistics
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const stats = await healthService.getDashboardStats(userId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /health/usage
   * Get current usage and limits
   */
  async getUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const usage = await healthService.getUsageResponse(userId);

      return res.json({
        success: true,
        data: usage,
      });
    } catch (error) {
      next(error);
    }
  }

  // ════════════════════════════════════════════════════
  // REPORTS
  // ════════════════════════════════════════════════════

  /**
   * POST /health/reports
   * Upload and analyze a health report
   */
  async uploadReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const data: UploadReportRequest = req.body;

      const result = await healthService.uploadReport(userId, file, data);

      return res.status(201).json({
        success: true,
        message: 'Report uploaded and analyzed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /health/reports
   * Get all reports
   */
  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { familyMemberId } = req.query;

      const reports = await healthService.getReports(
        userId,
        familyMemberId as string | undefined
      );

      return res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /health/reports/:id
   * Get single report details
   */
  async getReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;

      const report = await healthService.getReportById(userId, id);

      return res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /health/reports/:id
   * Delete a report
   */
  async deleteReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;

      await healthService.deleteReport(userId, id);

      return res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ════════════════════════════════════════════════════
  // HEALTH CHAT
  // ════════════════════════════════════════════════════

  /**
   * POST /health/chat
   * Send a chat message
   */
  async sendChatMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data: HealthChatRequest = req.body;

      if (!data.message || data.message.trim() === '') {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      const result = await healthService.sendChatMessage(userId, data);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /health/chat
   * Get chat history
   */
  async getChatHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { sessionId } = req.query;

      const history = await healthService.getChatHistory(
        userId,
        sessionId as string | undefined
      );

      return res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  // ════════════════════════════════════════════════════
  // COMPARE REPORTS
  // ════════════════════════════════════════════════════

  /**
   * POST /health/compare
   * Compare two reports
   */
  async compareReports(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data: CompareReportsRequest = req.body;

      if (!data.report1Id || !data.report2Id) {
        return res.status(400).json({
          success: false,
          message: 'Both report1Id and report2Id are required',
        });
      }

      const result = await healthService.compareReports(userId, data);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ════════════════════════════════════════════════════
  // DOCTOR SUMMARY
  // ════════════════════════════════════════════════════

  /**
   * POST /health/summary
   * Generate doctor summary PDF
   */
  async generateSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data: GenerateSummaryRequest = req.body;

      if (!data.reportId) {
        return res.status(400).json({ success: false, message: 'reportId is required' });
      }

      const result = await healthService.generateSummary(userId, data);

      return res.json({
        success: true,
        message: 'Summary generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ════════════════════════════════════════════════════
  // FAMILY MEMBERS
  // ════════════════════════════════════════════════════

  /**
   * GET /health/family
   * Get family members
   */
  async getFamilyMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const members = await healthService.getFamilyMembers(userId);

      return res.json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /health/family
   * Add family member
   */
  async addFamilyMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data: AddFamilyMemberRequest = req.body;

      if (!data.name || !data.relation) {
        return res.status(400).json({
          success: false,
          message: 'Name and relation are required',
        });
      }

      const member = await healthService.addFamilyMember(userId, data);

      return res.status(201).json({
        success: true,
        message: 'Family member added successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  // ════════════════════════════════════════════════════
  // ALERTS
  // ════════════════════════════════════════════════════

  /**
   * GET /health/alerts
   * Get alerts
   */
  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { unreadOnly } = req.query;

      const alerts = await healthService.getAlerts(userId, unreadOnly === 'true');

      return res.json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /health/alerts/:id/read
   * Mark alert as read
   */
  async markAlertRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;

      await healthService.markAlertRead(userId, id);

      return res.json({
        success: true,
        message: 'Alert marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const healthController = new HealthController();