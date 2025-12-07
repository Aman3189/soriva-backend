// src/modules/document/controllers/workspace.controller.ts

import { Request, Response } from 'express';
import { WorkspaceTool } from '@prisma/client';
import { workspaceService } from '../modules/document/services/workspace/workspace.service';
import { WORKSPACE_CONFIG } from '../config/workspace.config';

export class WorkspaceController {

  // ============================================
  // 🚀 GENERATE DOCUMENT
  // ============================================
  async generate(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { tool, userInput } = req.body;

      // Validate tool
      if (!tool || !Object.keys(WorkspaceTool).includes(tool)) {
        return res.status(400).json({ error: 'Invalid tool' });
      }

      // Validate userInput
      if (!userInput || typeof userInput !== 'object') {
        return res.status(400).json({ error: 'Invalid user input' });
      }

      const result = await workspaceService.generate(userId, tool as WorkspaceTool, userInput);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Workspace generate error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Generation failed' 
      });
    }
  }

  // ============================================
  // ✏️ EDIT DOCUMENT
  // ============================================
  async edit(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { generationId } = req.params;
      const { editRequest } = req.body;

      if (!generationId) {
        return res.status(400).json({ error: 'Generation ID required' });
      }

      if (!editRequest || typeof editRequest !== 'string') {
        return res.status(400).json({ error: 'Edit request required' });
      }

      const result = await workspaceService.edit(userId, generationId, editRequest);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Workspace edit error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Edit failed' 
      });
    }
  }

  // ============================================
  // 📊 GET USER STATUS
  // ============================================
  async getStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const status = await workspaceService.getStatus(userId);

      return res.status(200).json(status);

    } catch (error) {
      console.error('Workspace status error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get status' 
      });
    }
  }

  // ============================================
  // 📄 GET SINGLE GENERATION
  // ============================================
  async getGeneration(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { generationId } = req.params;

      if (!generationId) {
        return res.status(400).json({ error: 'Generation ID required' });
      }

      const generation = await workspaceService.getGeneration(userId, generationId);

      return res.status(200).json(generation);

    } catch (error) {
      console.error('Get generation error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get generation' 
      });
    }
  }

  // ============================================
  // 📋 LIST GENERATIONS
  // ============================================
  async listGenerations(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { tool, limit } = req.query;

      const generations = await workspaceService.listGenerations(
        userId,
        tool as WorkspaceTool | undefined,
        limit ? parseInt(limit as string) : 20
      );

      return res.status(200).json(generations);

    } catch (error) {
      console.error('List generations error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to list generations' 
      });
    }
  }

  // ============================================
  // 📦 GET AVAILABLE TOOLS
  // ============================================
  async getTools(req: Request, res: Response) {
    try {
      return res.status(200).json({
        tools: WORKSPACE_CONFIG.TOOLS,
        powerPacks: WORKSPACE_CONFIG.POWER_PACKS
      });

    } catch (error) {
      console.error('Get tools error:', error);
      return res.status(500).json({ error: 'Failed to get tools' });
    }
  }
}

export const workspaceController = new WorkspaceController();