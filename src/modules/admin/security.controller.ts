/**
 * SORIVA ADMIN - SECURITY CONTROLLER (CLASS-BASED)
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: CRUD operations for security patterns and configuration
 * Architecture: Class-based, Singleton pattern, Future-proof
 */

import { Request, Response } from 'express';
import { ConfigService } from '../../services/config.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOCAL TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECURITY CONTROLLER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SecurityController {
  private static instance: SecurityController;
  private configService: ConfigService;
  private readonly VALID_SEVERITIES: SecuritySeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  private constructor() {
    this.configService = ConfigService.getInstance();
  }

  /**
   * Singleton pattern - Get instance
   */
  public static getInstance(): SecurityController {
    if (!SecurityController.instance) {
      SecurityController.instance = new SecurityController();
    }
    return SecurityController.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getUserId(req: Request): string | undefined {
    const user = (req as any).user;
    return user?.userId;
  }

  private validateSeverity(severity: string): boolean {
    return this.VALID_SEVERITIES.includes(severity as SecuritySeverity);
  }

  private validateRegexPattern(pattern: string): { valid: boolean; error?: string } {
    try {
      new RegExp(pattern);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid regex pattern' };
    }
  }

  private sendError(res: Response, status: number, code: string, message: string): void {
    res.status(status).json({
      success: false,
      error: { code, message },
    });
  }

  private sendSuccess(res: Response, data: any, status: number = 200): void {
    res.status(status).json({
      success: true,
      data,
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JAILBREAK PATTERNS CRUD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * GET /admin/security/patterns
   * List all jailbreak patterns
   */
  public getAllPatterns = async (req: Request, res: Response): Promise<void> => {
    try {
      const { enabled, severity } = req.query;

      // TODO: Implement getAllJailbreakPatterns in ConfigService
      // Mock data for now
      const mockPatterns = [
        {
          id: '1',
          pattern: 'ignore previous instructions',
          severity: 'HIGH',
          description: 'Ignore previous instructions attempt',
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      let filtered = mockPatterns;

      // Apply filters
      if (enabled !== undefined) {
        const isEnabled = enabled === 'true';
        filtered = filtered.filter((p) => p.enabled === isEnabled);
      }

      if (severity) {
        filtered = filtered.filter((p) => p.severity === severity);
      }

      this.sendSuccess(res, {
        patterns: filtered,
        total: filtered.length,
      });
    } catch (error) {
      console.error('[SecurityController] Get all patterns error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to fetch patterns');
    }
  };

  /**
   * GET /admin/security/patterns/:id
   * Get single pattern by ID
   */
  public getPatternById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // TODO: Implement getJailbreakPatternById in ConfigService
      const pattern = null;

      if (!pattern) {
        this.sendError(res, 404, 'NOT_FOUND', 'Pattern not found');
        return;
      }

      this.sendSuccess(res, pattern);
    } catch (error) {
      console.error('[SecurityController] Get pattern by ID error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to fetch pattern');
    }
  };

  /**
   * POST /admin/security/patterns
   * Create new jailbreak pattern
   */
  public createPattern = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pattern, severity, description, enabled } = req.body;

      // Validation
      if (!pattern || !severity || !description) {
        this.sendError(
          res,
          400,
          'VALIDATION_ERROR',
          'Pattern, severity, and description are required'
        );
        return;
      }

      // Validate severity
      if (!this.validateSeverity(severity)) {
        this.sendError(res, 400, 'VALIDATION_ERROR', 'Invalid severity level');
        return;
      }

      // Validate regex pattern
      const regexValidation = this.validateRegexPattern(pattern);
      if (!regexValidation.valid) {
        this.sendError(res, 400, 'VALIDATION_ERROR', regexValidation.error || 'Invalid pattern');
        return;
      }

      // Create new pattern - plain object, no type annotation
      const timestamp = new Date();
      const newPattern = {
        id: Date.now().toString(),
        pattern: pattern,
        severity: severity,
        description: description,
        enabled: enabled !== undefined ? enabled : true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // TODO: Implement createJailbreakPattern in ConfigService

      console.log('[SecurityController] Pattern created:', {
        id: newPattern.id,
        createdBy: this.getUserId(req),
      });

      this.sendSuccess(res, newPattern, 201);
    } catch (error) {
      console.error('[SecurityController] Create pattern error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to create pattern');
    }
  };

  /**
   * PUT /admin/security/patterns/:id
   * Update existing pattern
   */
  public updatePattern = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { pattern, severity, description, enabled } = req.body;

      // TODO: Implement getJailbreakPatternById in ConfigService
      const existing = null;

      if (!existing) {
        this.sendError(res, 404, 'NOT_FOUND', 'Pattern not found');
        return;
      }

      // Validate severity if provided
      if (severity && !this.validateSeverity(severity)) {
        this.sendError(res, 400, 'VALIDATION_ERROR', 'Invalid severity level');
        return;
      }

      // Validate regex pattern if provided
      if (pattern) {
        const regexValidation = this.validateRegexPattern(pattern);
        if (!regexValidation.valid) {
          this.sendError(res, 400, 'VALIDATION_ERROR', regexValidation.error || 'Invalid pattern');
          return;
        }
      }

      // Update pattern - plain object
      const updated = {
        id: (existing as any).id,
        pattern: pattern !== undefined ? pattern : (existing as any).pattern,
        severity: severity !== undefined ? severity : (existing as any).severity,
        description: description !== undefined ? description : (existing as any).description,
        enabled: enabled !== undefined ? enabled : (existing as any).enabled,
        createdAt: (existing as any).createdAt,
        updatedAt: new Date(),
      };

      // TODO: Implement updateJailbreakPattern in ConfigService

      console.log('[SecurityController] Pattern updated:', {
        id: id,
        updatedBy: this.getUserId(req),
      });

      this.sendSuccess(res, updated);
    } catch (error) {
      console.error('[SecurityController] Update pattern error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to update pattern');
    }
  };

  /**
   * DELETE /admin/security/patterns/:id
   * Delete pattern
   */
  public deletePattern = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // TODO: Implement getJailbreakPatternById in ConfigService
      const existing = null;

      if (!existing) {
        this.sendError(res, 404, 'NOT_FOUND', 'Pattern not found');
        return;
      }

      // TODO: Implement deleteJailbreakPattern in ConfigService

      console.log('[SecurityController] Pattern deleted:', {
        id: id,
        deletedBy: this.getUserId(req),
      });

      res.json({
        success: true,
        message: 'Pattern deleted successfully',
      });
    } catch (error) {
      console.error('[SecurityController] Delete pattern error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to delete pattern');
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECURITY CONFIGURATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * GET /admin/security/config
   * Get security configuration
   */
  public getSecurityConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.configService.getSecurityConfig('default');
      this.sendSuccess(res, config);
    } catch (error) {
      console.error('[SecurityController] Get security config error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to fetch security config');
    }
  };

  /**
   * PUT /admin/security/config
   * Update security configuration
   */
  public updateSecurityConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const updates = req.body;

      // Validate boolean fields
      const booleanFields = [
        'enableJailbreakDetection',
        'enableContentModeration',
        'enablePromptSanitization',
        'enableLearning',
        'logSecurityEvents',
      ];

      for (const field of booleanFields) {
        if (updates[field] !== undefined && typeof updates[field] !== 'boolean') {
          this.sendError(res, 400, 'VALIDATION_ERROR', `${field} must be a boolean`);
          return;
        }
      }

      // Validate numeric fields
      if (updates.maxTokensPerRequest !== undefined) {
        if (typeof updates.maxTokensPerRequest !== 'number' || updates.maxTokensPerRequest < 1) {
          this.sendError(
            res,
            400,
            'VALIDATION_ERROR',
            'maxTokensPerRequest must be a positive number'
          );
          return;
        }
      }

      // Get current config and merge updates
      const currentConfig = await this.configService.getSecurityConfig('default');
      const updated = { ...currentConfig, ...updates };

      // TODO: Implement updateSecurityConfig method in ConfigService

      console.log('[SecurityController] Security config updated:', {
        updatedBy: this.getUserId(req),
        changes: Object.keys(updates),
      });

      this.sendSuccess(res, updated);
    } catch (error) {
      console.error('[SecurityController] Update security config error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to update security config');
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATISTICS & MONITORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * GET /admin/security/stats
   * Get security statistics
   */
  public getSecurityStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Get all patterns from database
      const patterns: any[] = [];

      // Calculate stats
      const stats = {
        patterns: {
          total: patterns.length,
          enabled: patterns.filter((p) => p.enabled).length,
          disabled: patterns.filter((p) => !p.enabled).length,
          bySeverity: {
            LOW: patterns.filter((p) => p.severity === 'LOW').length,
            MEDIUM: patterns.filter((p) => p.severity === 'MEDIUM').length,
            HIGH: patterns.filter((p) => p.severity === 'HIGH').length,
            CRITICAL: patterns.filter((p) => p.severity === 'CRITICAL').length,
          },
        },
        timestamp: new Date().toISOString(),
      };

      this.sendSuccess(res, stats);
    } catch (error) {
      console.error('[SecurityController] Get security stats error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to fetch security stats');
    }
  };

  /**
   * POST /admin/security/test-pattern
   * Test a pattern against sample text
   */
  public testPattern = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pattern, text } = req.body;

      if (!pattern || !text) {
        this.sendError(res, 400, 'VALIDATION_ERROR', 'Pattern and text are required');
        return;
      }

      // Validate regex
      let regex: RegExp;
      try {
        regex = new RegExp(pattern, 'i');
      } catch (error) {
        this.sendError(res, 400, 'VALIDATION_ERROR', 'Invalid regex pattern');
        return;
      }

      // Test pattern
      const matches = regex.test(text);
      const matchDetails = text.match(regex);

      this.sendSuccess(res, {
        matches: matches,
        matchedText: matchDetails ? matchDetails[0] : null,
        allMatches: text.match(new RegExp(pattern, 'gi')),
      });
    } catch (error) {
      console.error('[SecurityController] Test pattern error:', error);
      this.sendError(res, 500, 'INTERNAL_ERROR', 'Failed to test pattern');
    }
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS (Singleton instance)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const securityController = SecurityController.getInstance();

export default {
  // Patterns CRUD
  getAllPatterns: securityController.getAllPatterns,
  getPatternById: securityController.getPatternById,
  createPattern: securityController.createPattern,
  updatePattern: securityController.updatePattern,
  deletePattern: securityController.deletePattern,

  // Config
  getSecurityConfig: securityController.getSecurityConfig,
  updateSecurityConfig: securityController.updateSecurityConfig,

  // Stats & Testing
  getSecurityStats: securityController.getSecurityStats,
  testPattern: securityController.testPattern,
};
