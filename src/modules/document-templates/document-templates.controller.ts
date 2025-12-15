// src/modules/document-templates/document-templates.controller.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * SORIVA DOCUMENT TEMPLATES - CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 * 
 * API handlers for document template operations:
 * - List templates
 * - Start document session
 * - Submit field data
 * - Generate document
 * - Download document
 * 
 * Created by: Risenex Global
 * ═══════════════════════════════════════════════════════════════
 */

import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { documentTemplatesService } from './document-templates.service';
import { documentTemplatesManager, DocumentTemplateId } from './document-templates.config';
import { DocumentFormat, DocumentCategory } from './document-templates.types';

// ═══════════════════════════════════════════════════════════════
// CONTROLLER CLASS
// ═══════════════════════════════════════════════════════════════

export class DocumentTemplatesController {
  
  // ─────────────────────────────────────────────────────────────
  // LIST TEMPLATES
  // ─────────────────────────────────────────────────────────────

  /**
   * GET /api/document-templates
   * List all templates accessible by user's plan
   */
  public async listTemplates(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Please login to access document templates',
        });
        return;
      }

      const result = documentTemplatesService.listTemplates({
        userId: user.userId,
        plan: user.planType,
      });

      res.json(result);

    } catch (error) {
      console.error('List templates error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch templates',
      });
    }
  }

  /**
   * GET /api/document-templates/categories
   * Get templates grouped by category
   */
  public async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const categories = Object.values(DocumentCategory);
      const grouped: Record<string, any[]> = {};

      for (const category of categories) {
        const templates = documentTemplatesManager.getTemplatesByCategory(category);
        const accessible = templates.filter(t => 
          documentTemplatesManager.canAccessTemplate(user.planType, t.id as DocumentTemplateId)
        );
        
        grouped[category] = templates.map(t => ({
          ...t,
          locked: !accessible.find(a => a.id === t.id),
        }));
      }

      res.json({
        success: true,
        categories: grouped,
      });

    } catch (error) {
      console.error('Get by category error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE DETAILS
  // ─────────────────────────────────────────────────────────────

  /**
   * GET /api/document-templates/:templateId
   * Get single template details
   */
  public async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const result = documentTemplatesService.getTemplateDetail(templateId, {
        userId: user.userId,
        plan: user.planType,
      });

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.json(result);

    } catch (error) {
      console.error('Get template error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SESSION MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  /**
   * POST /api/document-templates/start
   * Start a new document generation session
   */
  public async startDocument(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.body;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Please login to create documents',
        });
        return;
      }

      if (!templateId) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Template ID is required',
        });
        return;
      }

      const result = documentTemplatesService.startDocument(templateId, {
        userId: user.userId,
        plan: user.planType,
      });

      if (!result.success) {
        res.status(403).json(result);
        return;
      }

      res.json(result);

    } catch (error) {
      console.error('Start document error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to start document session',
      });
    }
  }

  /**
   * POST /api/document-templates/submit-field
   * Submit data for a single field
   */
  public async submitField(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, fieldId, value } = req.body;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      if (!sessionId || !fieldId) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Session ID and Field ID are required',
        });
        return;
      }

      const result = documentTemplatesService.submitField(
        sessionId,
        fieldId,
        value,
        { userId: user.userId, plan: user.planType }
      );

      res.json(result);

    } catch (error) {
      console.error('Submit field error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to submit field',
      });
    }
  }

  /**
   * POST /api/document-templates/skip-field
   * Skip an optional field
   */
  public async skipField(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, fieldId } = req.body;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      if (!sessionId || !fieldId) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Session ID and Field ID are required',
        });
        return;
      }

      const result = documentTemplatesService.skipField(
        sessionId,
        fieldId,
        { userId: user.userId, plan: user.planType }
      );

      res.json(result);

    } catch (error) {
      console.error('Skip field error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/document-templates/session/:sessionId
   * Get session progress
   */
  public async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const progress = documentTemplatesService.getProgress(sessionId);

      if (!progress) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Session not found or expired',
        });
        return;
      }

      const nextPrompt = documentTemplatesService.getNextPrompt(sessionId);

      res.json({
        success: true,
        progress,
        nextPrompt,
      });

    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DOCUMENT GENERATION
  // ─────────────────────────────────────────────────────────────

  /**
   * POST /api/document-templates/generate
   * Generate the final document
   */
  public async generateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, format = 'docx', enhance = true } = req.body;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Session ID is required',
        });
        return;
      }

      // Validate format
      const docFormat = format.toLowerCase() as DocumentFormat;
      if (!Object.values(DocumentFormat).includes(docFormat)) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid format. Use "docx" or "pdf"',
        });
        return;
      }

      const result = await documentTemplatesService.generateDocument(
        sessionId,
        docFormat,
        { userId: user.userId, plan: user.planType },
        enhance
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);

    } catch (error) {
      console.error('Generate document error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate document',
      });
    }
  }

  /**
   * GET /api/document-templates/download/:fileName
   * Download generated document
   */
  public async downloadDocument(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      // Sanitize filename to prevent path traversal
      const sanitizedName = path.basename(fileName);
      const filePath = documentTemplatesService.getFilePath(sanitizedName);

      if (!filePath) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Document not found or expired',
        });
        return;
      }

      // Set headers for download
      const ext = path.extname(sanitizedName).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.pdf': 'application/pdf',
      };

      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedName}"`);

      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to download document',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // QUICK GENERATE (All data at once)
  // ─────────────────────────────────────────────────────────────

  /**
   * POST /api/document-templates/quick-generate
   * Generate document with all data provided at once
   */
  public async quickGenerate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, data, format = 'docx', enhance = true } = req.body;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      if (!templateId || !data) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Template ID and data are required',
        });
        return;
      }

      // Start session
      const startResult = documentTemplatesService.startDocument(templateId, {
        userId: user.userId,
        plan: user.planType,
      });

      if (!startResult.success) {
        res.status(403).json(startResult);
        return;
      }

      const sessionId = startResult.sessionId;

      // Submit all fields
      const template = documentTemplatesManager.getTemplate(templateId as DocumentTemplateId);
      
      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      for (const field of template.fields) {
        if (data[field.id] !== undefined) {
          documentTemplatesService.submitField(
            sessionId,
            field.id,
            data[field.id],
            { userId: user.userId, plan: user.planType }
          );
        }
      }

      // Generate
      const docFormat = (format?.toLowerCase() || 'docx') as DocumentFormat;
      const result = await documentTemplatesService.generateDocument(
        sessionId,
        docFormat,
        { userId: user.userId, plan: user.planType },
        enhance
      );

      res.json(result);

    } catch (error) {
      console.error('Quick generate error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate document',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // STATISTICS
  // ─────────────────────────────────────────────────────────────

  /**
   * GET /api/document-templates/stats
   * Get template statistics
   */
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = documentTemplatesManager.getStats();

      res.json({
        success: true,
        stats,
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const documentTemplatesController = new DocumentTemplatesController();