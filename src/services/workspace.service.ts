// ==========================================
// WORKSPACE SERVICE
// Handles all workspace CRUD operations
// ==========================================

import { PrismaClient, Workspace } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class WorkspaceService {
  /**
   * Create a new workspace
   */
  async createWorkspace(data: {
    orbitId: string;
    title: string;
    content?: string;
    contentType: string;
    language?: string;
    aiPrompt?: string;
  }): Promise<Workspace> {
    try {
      // Calculate initial metadata
      const content = data.content || '';
      const wordCount = this.countWords(content);
      const metadata = {
        wordCount,
        lineCount: content.split('\n').length,
        characterCount: content.length,
        version: 1,
      };

      const workspace = await prisma.workspace.create({
        data: {
          orbitId: data.orbitId,
          title: data.title,
          content,
          contentType: data.contentType,
          language: data.language || null,
          status: data.aiPrompt ? 'generating' : 'draft',
          aiPrompt: data.aiPrompt || null,
          generationProgress: 0,
          metadata,
          statusMessage: data.aiPrompt ? '✨ Starting to craft your document...' : null,
          exportCount: 0,
        },
      });

      return workspace;
    } catch (error: any) {
      throw new Error(`Failed to create workspace: ${error.message}`);
    }
  }

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          orbit: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
      });

      return workspace;
    } catch (error: any) {
      throw new Error(`Failed to get workspace: ${error.message}`);
    }
  }

  /**
   * Get all workspaces for an orbit
   */
  async getWorkspacesByOrbit(orbitId: string): Promise<Workspace[]> {
    try {
      const workspaces = await prisma.workspace.findMany({
        where: { orbitId },
        orderBy: { updatedAt: 'desc' },
      });

      return workspaces;
    } catch (error: any) {
      throw new Error(`Failed to get workspaces: ${error.message}`);
    }
  }

  /**
   * Get all workspaces for a user (across all orbits)
   */
  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    try {
      const orbits = await prisma.orbit.findMany({
        where: { userId },
        select: { id: true },
      });

      const orbitIds = orbits.map((o) => o.id);

      const workspaces = await prisma.workspace.findMany({
        where: {
          orbitId: {
            in: orbitIds,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return workspaces;
    } catch (error: any) {
      throw new Error(`Failed to get user workspaces: ${error.message}`);
    }
  }

  /**
   * Update workspace content
   */
  async updateWorkspaceContent(
    workspaceId: string,
    content: string,
    updateMetadata: boolean = true
  ): Promise<Workspace> {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      let metadata = workspace.metadata as any;

      if (updateMetadata) {
        const wordCount = this.countWords(content);
        const currentVersion = (metadata?.version || 1) + 1;

        metadata = {
          ...metadata,
          wordCount,
          lineCount: content.split('\n').length,
          characterCount: content.length,
          version: currentVersion,
          lastModified: new Date().toISOString(),
        };
      }

      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          content,
          metadata,
          updatedAt: new Date(),
        },
      });

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to update workspace: ${error.message}`);
    }
  }

  /**
   * Update workspace metadata (title, contentType, language)
   */
  async updateWorkspaceMetadata(
    workspaceId: string,
    data: {
      title?: string;
      contentType?: string;
      language?: string;
      status?: string;
    }
  ): Promise<Workspace> {
    try {
      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.contentType && { contentType: data.contentType }),
          ...(data.language !== undefined && { language: data.language }),
          ...(data.status && { status: data.status }),
          updatedAt: new Date(),
        },
      });

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to update workspace metadata: ${error.message}`);
    }
  }

  /**
   * Update AI generation progress (for SSE streaming)
   */
  async updateGenerationProgress(
    workspaceId: string,
    progress: number,
    statusMessage?: string
  ): Promise<Workspace> {
    try {
      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          generationProgress: progress,
          ...(statusMessage && { statusMessage }),
          ...(progress === 100 && { status: 'completed' }),
          updatedAt: new Date(),
        },
      });

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to update generation progress: ${error.message}`);
    }
  }

  /**
   * Mark workspace as error state
   */
  async markWorkspaceError(workspaceId: string, errorMessage: string): Promise<Workspace> {
    try {
      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          status: 'error',
          statusMessage: errorMessage,
          updatedAt: new Date(),
        },
      });

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to mark workspace error: ${error.message}`);
    }
  }

  /**
   * Track export (increment counter)
   */
  async trackExport(workspaceId: string): Promise<Workspace> {
    try {
      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          lastExportedAt: new Date(),
          exportCount: {
            increment: 1,
          },
        },
      });

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to track export: ${error.message}`);
    }
  }

  /**
   * Delete workspace
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await prisma.workspace.delete({
        where: { id: workspaceId },
      });
    } catch (error: any) {
      throw new Error(`Failed to delete workspace: ${error.message}`);
    }
  }

  /**
   * Get workspace statistics
   */
  async getWorkspaceStats(workspaceId: string) {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      const metadata = workspace.metadata as any;

      return {
        id: workspace.id,
        title: workspace.title,
        contentType: workspace.contentType,
        status: workspace.status,
        wordCount: metadata?.wordCount || 0,
        characterCount: metadata?.characterCount || 0,
        lineCount: metadata?.lineCount || 0,
        version: metadata?.version || 1,
        exportCount: workspace.exportCount,
        lastExportedAt: workspace.lastExportedAt,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      };
    } catch (error: any) {
      throw new Error(`Failed to get workspace stats: ${error.message}`);
    }
  }

  /**
   * Search workspaces
   */
  async searchWorkspaces(userId: string, query: string): Promise<Workspace[]> {
    try {
      const orbits = await prisma.orbit.findMany({
        where: { userId },
        select: { id: true },
      });

      const orbitIds = orbits.map((o) => o.id);

      const workspaces = await prisma.workspace.findMany({
        where: {
          orbitId: {
            in: orbitIds,
          },
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
      });

      return workspaces;
    } catch (error: any) {
      throw new Error(`Failed to search workspaces: ${error.message}`);
    }
  }

  /**
   * Get workspaces by status
   */
  async getWorkspacesByStatus(userId: string, status: string): Promise<Workspace[]> {
    try {
      const orbits = await prisma.orbit.findMany({
        where: { userId },
        select: { id: true },
      });

      const orbitIds = orbits.map((o) => o.id);

      const workspaces = await prisma.workspace.findMany({
        where: {
          orbitId: {
            in: orbitIds,
          },
          status,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return workspaces;
    } catch (error: any) {
      throw new Error(`Failed to get workspaces by status: ${error.message}`);
    }
  }

  /**
   * Get workspaces by content type
   */
  async getWorkspacesByContentType(userId: string, contentType: string): Promise<Workspace[]> {
    try {
      const orbits = await prisma.orbit.findMany({
        where: { userId },
        select: { id: true },
      });

      const orbitIds = orbits.map((o) => o.id);

      const workspaces = await prisma.workspace.findMany({
        where: {
          orbitId: {
            in: orbitIds,
          },
          contentType,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return workspaces;
    } catch (error: any) {
      throw new Error(`Failed to get workspaces by type: ${error.message}`);
    }
  }

  /**
   * Helper: Count words
   */
  private countWords(text: string): number {
    if (!text) return 0;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

// Export singleton
export const workspaceService = new WorkspaceService();
