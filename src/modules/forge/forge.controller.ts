// src/modules/forge/forge.controller.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔥 SORIVA FORGE - CONTROLLER
 * AI-Powered Content Generation & Storage System
 * ═══════════════════════════════════════════════════════════════
 */

import { Request, Response } from 'express';
import { forgeService } from './forge.service';
import { CreateForgeRequest, UpdateForgeRequest, ListForgesQuery } from './forge.types';
import { ForgeType } from '@prisma/client';

class ForgeController {

  // ============================================
  // CREATE FORGE
  // ============================================

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const data: CreateForgeRequest = req.body;

      // Validation
      if (!data.title || !data.content || !data.contentType) {
        res.status(400).json({
          success: false,
          message: 'Title, content, and contentType are required',
        });
        return;
      }

      // Validate contentType
      const validTypes: ForgeType[] = ['CODE', 'DOCUMENT', 'MARKDOWN', 'HTML', 'TABLE', 'JSON', 'CSV', 'DIAGRAM'];
      if (!validTypes.includes(data.contentType)) {
        res.status(400).json({
          success: false,
          message: `Invalid contentType. Must be one of: ${validTypes.join(', ')}`,
        });
        return;
      }

      const forge = await forgeService.createForge(userId, data);

      res.status(201).json({
        success: true,
        message: 'Forge created successfully 🔥',
        data: forge,
      });
    } catch (error) {
      console.error('❌ Forge create error:', error);
      res.status(500).json({ success: false, message: 'Failed to create forge' });
    }
  }

  // ============================================
  // GET FORGE BY ID
  // ============================================

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const forge = await forgeService.getForgeById(id, userId);

      if (!forge) {
        res.status(404).json({ success: false, message: 'Forge not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: forge,
      });
    } catch (error) {
      console.error('❌ Forge getById error:', error);
      res.status(500).json({ success: false, message: 'Failed to get forge' });
    }
  }

  // ============================================
  // GET FORGE BY SHARE TOKEN
  // ============================================

  async getByShareToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const forge = await forgeService.getForgeByShareToken(token);

      if (!forge) {
        res.status(404).json({ success: false, message: 'Shared forge not found or not public' });
        return;
      }

      res.status(200).json({
        success: true,
        data: forge,
      });
    } catch (error) {
      console.error('❌ Forge getByShareToken error:', error);
      res.status(500).json({ success: false, message: 'Failed to get shared forge' });
    }
  }

  // ============================================
  // LIST USER FORGES
  // ============================================

  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const query: ListForgesQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        contentType: req.query.contentType as ForgeType,
        search: req.query.search as string,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await forgeService.listUserForges(userId, query);

      res.status(200).json({
        success: true,
        data: result.forges,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('❌ Forge list error:', error);
      res.status(500).json({ success: false, message: 'Failed to list forges' });
    }
  }

  // ============================================
  // UPDATE FORGE
  // ============================================

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const data: UpdateForgeRequest = req.body;

      const forge = await forgeService.updateForge(id, userId, data);

      if (!forge) {
        res.status(404).json({ success: false, message: 'Forge not found or access denied' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Forge updated successfully',
        data: forge,
      });
    } catch (error) {
      console.error('❌ Forge update error:', error);
      res.status(500).json({ success: false, message: 'Failed to update forge' });
    }
  }

  // ============================================
  // DELETE FORGE
  // ============================================

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const deleted = await forgeService.deleteForge(id, userId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Forge not found or access denied' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Forge deleted successfully',
      });
    } catch (error) {
      console.error('❌ Forge delete error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete forge' });
    }
  }

  // ============================================
  // GENERATE SHARE LINK
  // ============================================

  async generateShareLink(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const shareToken = await forgeService.generateShareLink(id, userId);

      if (!shareToken) {
        res.status(404).json({ success: false, message: 'Forge not found or access denied' });
        return;
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const shareUrl = `${baseUrl}/forge/${shareToken}`;

      res.status(200).json({
        success: true,
        message: 'Share link generated',
        data: {
          shareToken,
          shareUrl,
        },
      });
    } catch (error) {
      console.error('❌ Forge generateShareLink error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate share link' });
    }
  }

  // ============================================
  // REVOKE SHARE LINK
  // ============================================

  async revokeShareLink(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const revoked = await forgeService.revokeShareLink(id, userId);

      if (!revoked) {
        res.status(404).json({ success: false, message: 'Forge not found or access denied' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Share link revoked',
      });
    } catch (error) {
      console.error('❌ Forge revokeShareLink error:', error);
      res.status(500).json({ success: false, message: 'Failed to revoke share link' });
    }
  }

  // ============================================
  // TRACK COPY
  // ============================================

  async trackCopy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await forgeService.trackCopy(id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  }

  // ============================================
  // TRACK DOWNLOAD
  // ============================================

  async trackDownload(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await forgeService.trackDownload(id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  }

  // ============================================
  // GET USER STATS
  // ============================================

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const stats = await forgeService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ Forge getStats error:', error);
      res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
  }

  // ============================================
  // EXECUTE CODE VIA PISTON API
  // ============================================

  async executePiston(req: Request, res: Response): Promise<void> {
    try {
      const { language, version, files } = req.body;

      // Validation
      if (!language || !files || !Array.isArray(files) || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Language and files are required',
        });
        return;
      }

      // Supported languages whitelist
      const supportedLanguages = [
        'c', 'cpp', 'java', 'rust', 'go', 'ruby', 'php', 'swift',
        'kotlin', 'typescript', 'csharp', 'bash', 'perl', 'lua',
        'r', 'scala', 'haskell', 'python', 'javascript'
      ];

      if (!supportedLanguages.includes(language.toLowerCase())) {
        res.status(400).json({
          success: false,
          message: `Language '${language}' is not supported`,
        });
        return;
      }

      // Call Piston API
      const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language.toLowerCase(),
          version: version || '*',
          files: files,
        }),
      });

      if (!pistonResponse.ok) {
        throw new Error(`Piston API error: ${pistonResponse.status}`);
      }

      const result = await pistonResponse.json();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Piston execute error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to execute code',
      });
    }
  }
}

export const forgeController = new ForgeController();