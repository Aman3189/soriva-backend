// src/modules/forge/forge.service.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔥 SORIVA FORGE - SERVICE
 * AI-Powered Content Generation & Storage System
 * ═══════════════════════════════════════════════════════════════
 */

import { PrismaClient, ForgeType, Forge } from '@prisma/client';
import { randomBytes } from 'crypto';
import {
  CreateForgeRequest,
  UpdateForgeRequest,
  ListForgesQuery,
  ForgeResponse,
  ForgeListResponse,
  ForgeStatsResponse,
  FORGE_TYPE_EXTENSIONS,
  CODE_LANGUAGE_EXTENSIONS,
} from './forge.types';

const prisma = new PrismaClient();

class ForgeService {
  
  // ============================================
  // CREATE FORGE
  // ============================================
  
  async createForge(userId: string, data: CreateForgeRequest): Promise<ForgeResponse> {
    const forge = await prisma.forge.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        contentType: data.contentType,
        language: data.language || null,
        sessionId: data.sessionId || null,
        messageId: data.messageId || null,
        isPublic: data.isPublic || false,
      },
    });

    return this.formatForgeResponse(forge);
  }

  // ============================================
  // GET FORGE BY ID
  // ============================================

  async getForgeById(forgeId: string, userId?: string): Promise<ForgeResponse | null> {
    const forge = await prisma.forge.findUnique({
      where: { id: forgeId },
    });

    if (!forge) return null;

    // Check access
    if (!forge.isPublic && forge.userId !== userId) {
      return null;
    }

    // Increment view count
    await prisma.forge.update({
      where: { id: forgeId },
      data: { viewCount: { increment: 1 } },
    });

    return this.formatForgeResponse(forge);
  }

  // ============================================
  // GET FORGE BY SHARE TOKEN
  // ============================================

  async getForgeByShareToken(shareToken: string): Promise<ForgeResponse | null> {
    const forge = await prisma.forge.findUnique({
      where: { shareToken },
    });

    if (!forge || !forge.isPublic) return null;

    // Increment view count
    await prisma.forge.update({
      where: { id: forge.id },
      data: { viewCount: { increment: 1 } },
    });

    return this.formatForgeResponse(forge);
  }

  // ============================================
  // LIST USER FORGES
  // ============================================

  async listUserForges(userId: string, query: ListForgesQuery): Promise<ForgeListResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.contentType) {
      where.contentType = query.contentType;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[query.sortBy || 'createdAt'] = query.sortOrder || 'desc';

    const [forges, total] = await Promise.all([
      prisma.forge.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.forge.count({ where }),
    ]);

    return {
      forges: forges.map((f) => this.formatForgeResponse(f)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // UPDATE FORGE
  // ============================================

  async updateForge(
    forgeId: string,
    userId: string,
    data: UpdateForgeRequest
  ): Promise<ForgeResponse | null> {
    const forge = await prisma.forge.findUnique({
      where: { id: forgeId },
    });

    if (!forge || forge.userId !== userId) return null;

    const updated = await prisma.forge.update({
      where: { id: forgeId },
      data: {
        ...data,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    return this.formatForgeResponse(updated);
  }

  // ============================================
  // DELETE FORGE
  // ============================================

  async deleteForge(forgeId: string, userId: string): Promise<boolean> {
    const forge = await prisma.forge.findUnique({
      where: { id: forgeId },
    });

    if (!forge || forge.userId !== userId) return false;

    await prisma.forge.delete({
      where: { id: forgeId },
    });

    return true;
  }

  // ============================================
  // GENERATE SHARE LINK
  // ============================================

  async generateShareLink(forgeId: string, userId: string): Promise<string | null> {
    const forge = await prisma.forge.findUnique({
      where: { id: forgeId },
    });

    if (!forge || forge.userId !== userId) return null;

    const shareToken = randomBytes(16).toString('hex');

    await prisma.forge.update({
      where: { id: forgeId },
      data: {
        shareToken,
        isPublic: true,
      },
    });

    return shareToken;
  }

  // ============================================
  // REVOKE SHARE LINK
  // ============================================

  async revokeShareLink(forgeId: string, userId: string): Promise<boolean> {
    const forge = await prisma.forge.findUnique({
      where: { id: forgeId },
    });

    if (!forge || forge.userId !== userId) return false;

    await prisma.forge.update({
      where: { id: forgeId },
      data: {
        shareToken: null,
        isPublic: false,
      },
    });

    return true;
  }

  // ============================================
  // TRACK COPY
  // ============================================

  async trackCopy(forgeId: string): Promise<void> {
    await prisma.forge.update({
      where: { id: forgeId },
      data: { copyCount: { increment: 1 } },
    });
  }

  // ============================================
  // TRACK DOWNLOAD
  // ============================================

  async trackDownload(forgeId: string): Promise<void> {
    await prisma.forge.update({
      where: { id: forgeId },
      data: { downloadCount: { increment: 1 } },
    });
  }

  // ============================================
  // GET USER STATS
  // ============================================

  async getUserStats(userId: string): Promise<ForgeStatsResponse> {
    const forges = await prisma.forge.findMany({
      where: { userId },
      select: {
        contentType: true,
        copyCount: true,
        downloadCount: true,
        viewCount: true,
      },
    });

    const byType: Record<ForgeType, number> = {
      CODE: 0,
      DOCUMENT: 0,
      MARKDOWN: 0,
      HTML: 0,
      TABLE: 0,
      JSON: 0,
      CSV: 0,
      DIAGRAM: 0,
    };

    let totalCopies = 0;
    let totalDownloads = 0;
    let totalViews = 0;

    forges.forEach((f) => {
      byType[f.contentType]++;
      totalCopies += f.copyCount;
      totalDownloads += f.downloadCount;
      totalViews += f.viewCount;
    });

    return {
      totalForges: forges.length,
      byType,
      totalCopies,
      totalDownloads,
      totalViews,
    };
  }

  // ============================================
  // GET DOWNLOAD FILENAME
  // ============================================

  getDownloadFilename(forge: ForgeResponse): string {
    const baseTitle = forge.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    if (forge.contentType === 'CODE' && forge.language) {
      const ext = CODE_LANGUAGE_EXTENSIONS[forge.language.toLowerCase()] || 'txt';
      return `${baseTitle}.${ext}`;
    }

    const ext = FORGE_TYPE_EXTENSIONS[forge.contentType] || 'txt';
    return `${baseTitle}.${ext}`;
  }

  // ============================================
  // FORMAT RESPONSE
  // ============================================

  private formatForgeResponse(forge: Forge): ForgeResponse {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      id: forge.id,
      title: forge.title,
      content: forge.content,
      contentType: forge.contentType,
      language: forge.language,
      version: forge.version,
      isPublic: forge.isPublic,
      shareToken: forge.shareToken,
      shareUrl: forge.shareToken ? `${baseUrl}/forge/${forge.shareToken}` : null,
      copyCount: forge.copyCount,
      downloadCount: forge.downloadCount,
      viewCount: forge.viewCount,
      createdAt: forge.createdAt,
      updatedAt: forge.updatedAt,
    };
  }
}

export const forgeService = new ForgeService();