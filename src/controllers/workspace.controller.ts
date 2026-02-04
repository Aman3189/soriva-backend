// src/modules/document/controllers/workspace.controller.ts
// ═══════════════════════════════════════════════════════════════════════════
// SORIVA WORKSPACE CONTROLLER v2.0
// Supports both Casual Input and Structured Input
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import { WorkspaceTool } from '@prisma/client';
import { workspaceService } from '../modules/document/services/workspace/workspace.service';
import { WORKSPACE_CONFIG } from '../config/workspace.config';

export class WorkspaceController {

  // ============================================
  // 🚀 GENERATE DOCUMENT (Smart Casual Input)
  // ============================================
  /**
   * POST /api/workspace/generate
   * 
   * Body (Casual - Recommended):
   * {
   *   "tool": "RESUME",
   *   "casualInput": "Mai Aman hoon Punjab se, 2 saal developer, React Node jaanta hoon"
   * }
   * 
   * Body (Structured - Legacy):
   * {
   *   "tool": "RESUME",
   *   "userInput": { "name": "Aman", "skills": ["React", "Node"] }
   * }
   */
  async generate(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { tool, casualInput, userInput } = req.body;

      // Validate tool
      if (!tool || !Object.keys(WorkspaceTool).includes(tool)) {
        return res.status(400).json({ 
          error: 'Invalid tool',
          validTools: Object.keys(WorkspaceTool)
        });
      }

      // Must provide either casualInput or userInput
      if (!casualInput && !userInput) {
        return res.status(400).json({ 
          error: 'Please provide either casualInput (recommended) or userInput',
          example: {
            casualInput: "Mai Aman hoon, 2 years developer experience, React Node.js jaanta hoon, BTech 2022"
          }
        });
      }

      let result;

      // Prefer casual input if provided
      if (casualInput && typeof casualInput === 'string' && casualInput.trim().length > 0) {
        result = await workspaceService.generateFromCasualInput(
          userId, 
          tool as WorkspaceTool, 
          casualInput.trim()
        );
      } else if (userInput && typeof userInput === 'object') {
        // Legacy structured input
        result = await workspaceService.generate(
          userId, 
          tool as WorkspaceTool, 
          userInput
        );
      } else {
        return res.status(400).json({ error: 'Invalid input format' });
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error('Workspace generate error:', error);
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed' 
      });
    }
  }

  // ============================================
  // ✏️ EDIT DOCUMENT
  // ============================================
  /**
   * PUT /api/workspace/edit/:generationId
   * 
   * Body:
   * {
   *   "editRequest": "Change my job title to Senior Developer"
   * }
   */
  async edit(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { generationId } = req.params;
      const { editRequest } = req.body;

      if (!generationId) {
        return res.status(400).json({ error: 'Generation ID required' });
      }

      if (!editRequest || typeof editRequest !== 'string') {
        return res.status(400).json({ 
          error: 'Edit request required',
          example: "Change my job title to Senior Developer"
        });
      }

      const result = await workspaceService.edit(userId, generationId, editRequest);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Workspace edit error:', error);
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Edit failed' 
      });
    }
  }

  // ============================================
  // 📊 GET USER STATUS & QUOTA
  // ============================================
  /**
   * GET /api/workspace/status
   * 
   * Returns user's current quota usage for each tool
   */
  async getStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const status = await workspaceService.getStatus(userId);

      return res.status(200).json({
        success: true,
        ...status
      });

    } catch (error) {
      console.error('Workspace status error:', error);
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status' 
      });
    }
  }

  // ============================================
  // 📄 GET SINGLE GENERATION
  // ============================================
  /**
   * GET /api/workspace/generation/:generationId
   */
  async getGeneration(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { generationId } = req.params;

      if (!generationId) {
        return res.status(400).json({ error: 'Generation ID required' });
      }

      const generation = await workspaceService.getGeneration(userId, generationId);

      return res.status(200).json({
        success: true,
        generation
      });

    } catch (error) {
      console.error('Get generation error:', error);
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get generation' 
      });
    }
  }

  // ============================================
  // 📋 LIST USER'S GENERATIONS
  // ============================================
  /**
   * GET /api/workspace/generations
   * Query params: tool (optional), limit (default 20)
   */
  async listGenerations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { tool, limit } = req.query;

      const generations = await workspaceService.listGenerations(
        userId,
        tool as WorkspaceTool | undefined,
        limit ? parseInt(limit as string) : 20
      );

      return res.status(200).json({
        success: true,
        generations,
        count: generations.length
      });

    } catch (error) {
      console.error('List generations error:', error);
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list generations' 
      });
    }
  }

  // ============================================
  // 🔧 GET AVAILABLE TOOLS
  // ============================================
  /**
   * GET /api/workspace/tools
   * Returns list of available tools with their metadata
   */
  async getTools(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const planType = (req as any).user?.planType; // From JWT token
      
      // Get user's plan - prefer JWT, fallback to DB
      let userPlan = planType?.toUpperCase() || 'STARTER';
      if (userPlan === 'STARTER' && userId) {
        try {
          const status = await workspaceService.getStatus(userId);
          userPlan = status.plan || 'STARTER';
        } catch (e) {
          // Use JWT plan
        }
      }

      // Filter tools based on user's plan
      const accessibleTools = Object.entries(WORKSPACE_CONFIG.TOOLS)
        .filter(([_, toolConfig]) => {
          const minPlan = toolConfig.minPlan || 'STARTER';
          const planOrder = ['STARTER', 'LITE', 'PLUS', 'PRO', 'APEX', 'SOVEREIGN'];
          return planOrder.indexOf(userPlan) >= planOrder.indexOf(minPlan);
        })
        .reduce((acc, [key, value]) => {
          acc[key] = {
            ...value,
            available: true
          };
          return acc;
        }, {} as Record<string, any>);

      // Mark unavailable tools
      const allTools = Object.entries(WORKSPACE_CONFIG.TOOLS)
        .reduce((acc, [key, value]) => {
          acc[key] = {
            ...value,
            available: !!accessibleTools[key]
          };
          return acc;
        }, {} as Record<string, any>);

      return res.status(200).json({
        success: true,
        tools: allTools,
        userPlan,
        totalTools: Object.keys(allTools).length,
        accessibleTools: Object.keys(accessibleTools).length
      });

    } catch (error) {
      console.error('Get tools error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to get tools' 
      });
    }
  }

  // ============================================
  // 📥 DOWNLOAD DOCUMENT (PDF/DOCX)
  // ============================================
  /**
   * GET /api/workspace/download/:generationId
   * Query params: format (pdf/docx)
   */
  async download(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { generationId } = req.params;
      const { format = 'pdf' } = req.query;

      if (!generationId) {
        return res.status(400).json({ error: 'Generation ID required' });
      }

      if (!['pdf', 'docx', 'png'].includes(format as string)) {
        return res.status(400).json({ 
          error: 'Invalid format',
          validFormats: ['pdf', 'docx', 'png']
        });
      }

      const result = await workspaceService.downloadDocument(
        userId, 
        generationId, 
        format as 'pdf' | 'docx' | 'png'
      );

      // Set appropriate headers
      const contentTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'png': 'image/png'
      };

      res.setHeader('Content-Type', contentTypes[format as string]);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      
      return res.send(result.buffer);

    } catch (error) {
      console.error('Download error:', error);
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Download failed' 
      });
    }
  }

  // ============================================
  // 👁️ PREVIEW DOCUMENT (HTML)
  // ============================================
  /**
   * GET /api/workspace/preview/:generationId
   * Returns rendered HTML for preview
   */
  async preview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { generationId } = req.params;

      if (!generationId) {
        return res.status(400).json({ error: 'Generation ID required' });
      }

      const html = await workspaceService.previewDocument(userId, generationId);

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);

    } catch (error) {
      console.error('Preview error:', error);
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Preview failed' 
      });
    }
  }
}

export const workspaceController = new WorkspaceController();