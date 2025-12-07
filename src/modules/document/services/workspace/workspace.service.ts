// src/modules/document/services/workspace/workspace.service.ts

import { PrismaClient, WorkspaceTool, WorkspaceStatus } from '@prisma/client';
import { WORKSPACE_CONFIG } from '../../../../config/workspace.config';
import { workspaceLLMService } from './workspace-llm.service';
import { workspaceQuotaService } from './workspace-quota.service';

const prisma = new PrismaClient();

export class WorkspaceService {

  // ============================================
  // 🚀 GENERATE DOCUMENT
  // ============================================
  async generate(
    userId: string,
    tool: WorkspaceTool,
    userInput: Record<string, any>
  ) {
    // 1. Check quota
    const quota = await workspaceQuotaService.getBestQuota(userId, tool);
    
    if (quota.source === 'none') {
      throw new Error('No quota available. Please purchase a Power Pack.');
    }

    // 2. Create generation record
    const generation = await prisma.workspaceGeneration.create({
      data: {
        userId,
        tool,
        toolName: WORKSPACE_CONFIG.TOOLS[tool].name,
        userInput,
        status: WorkspaceStatus.PROCESSING,
        powerPackId: quota.packId || null,
        llmModel: quota.model,
        llmProvider: quota.provider
      }
    });

    try {
      // 3. Generate output
      const startTime = Date.now();
      const result = await workspaceLLMService.generateOutput(
        tool,
        userInput,
        quota.model,
        quota.provider
      );

      // 4. Update generation record
      const updated = await prisma.workspaceGeneration.update({
        where: { id: generation.id },
        data: {
          outputJson: result.outputJson,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
          status: WorkspaceStatus.COMPLETED,
          processingTime: Date.now() - startTime,
          completedAt: new Date()
        }
      });

      // 5. Deduct quota
      await workspaceQuotaService.deductUsage(
        userId,
        tool,
        quota.source,
        quota.packId,
        result.totalTokens
      );

      return {
        success: true,
        generationId: updated.id,
        output: result.outputJson,
        tokensUsed: result.totalTokens,
        quotaSource: quota.source,
        remaining: quota.remaining - 1
      };

    } catch (error) {
      // Update as failed
      await prisma.workspaceGeneration.update({
        where: { id: generation.id },
        data: {
          status: WorkspaceStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  // ============================================
  // ✏️ EDIT DOCUMENT
  // ============================================
  async edit(
    userId: string,
    generationId: string,
    editRequest: string
  ) {
    // 1. Get original generation
    const original = await prisma.workspaceGeneration.findUnique({
      where: { id: generationId }
    });

    if (!original || original.userId !== userId) {
      throw new Error('Generation not found');
    }

    if (!original.outputJson) {
      throw new Error('No output to edit');
    }

    // 2. Check edit limit
    const editCount = await prisma.workspaceGeneration.count({
      where: { parentGenerationId: generationId }
    });

    const maxEdits = WORKSPACE_CONFIG.TOKEN_LIMITS[original.tool].maxEdits;
    if (editCount >= maxEdits) {
      throw new Error(`Maximum ${maxEdits} edits allowed per generation`);
    }

    // 3. Check quota for edit
    const quota = await workspaceQuotaService.getBestQuota(userId, original.tool);
    if (quota.source === 'none') {
      throw new Error('No quota available for edit');
    }

    // 4. Create edit record
    const editGeneration = await prisma.workspaceGeneration.create({
      data: {
        userId,
        tool: original.tool,
        toolName: original.toolName,
        userInput: original.userInput as Record<string, any>,
        userPrompt: editRequest,
        status: WorkspaceStatus.PROCESSING,
        powerPackId: quota.packId || null,
        llmModel: quota.model,
        llmProvider: quota.provider,
        isEdit: true,
        parentGenerationId: generationId,
        editNumber: editCount + 1
      }
    });

    try {
      // 5. Call LLM for edit
      const startTime = Date.now();
      const result = await workspaceLLMService.editOutput(
        original.tool,
        original.outputJson as Record<string, any>,
        editRequest,
        quota.model,
        quota.provider
      );

      // 6. Update edit record
      const updated = await prisma.workspaceGeneration.update({
        where: { id: editGeneration.id },
        data: {
          outputJson: result.outputJson,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
          status: WorkspaceStatus.COMPLETED,
          processingTime: Date.now() - startTime,
          completedAt: new Date()
        }
      });

      // 7. Deduct quota (edits are free, only tokens counted)
      await workspaceQuotaService.deductUsage(
        userId,
        original.tool,
        quota.source,
        quota.packId,
        result.totalTokens
      );

      return {
        success: true,
        generationId: updated.id,
        output: result.outputJson,
        tokensUsed: result.totalTokens,
        editNumber: editCount + 1,
        editsRemaining: maxEdits - editCount - 1
      };

    } catch (error) {
      await prisma.workspaceGeneration.update({
        where: { id: editGeneration.id },
        data: {
          status: WorkspaceStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  // ============================================
  // 📊 GET USER STATUS
  // ============================================
  async getStatus(userId: string) {
    return workspaceQuotaService.getUserWorkspaceStatus(userId);
  }

  // ============================================
  // 📄 GET GENERATION
  // ============================================
  async getGeneration(userId: string, generationId: string) {
    const generation = await prisma.workspaceGeneration.findUnique({
      where: { id: generationId },
      include: { edits: true }
    });

    if (!generation || generation.userId !== userId) {
      throw new Error('Generation not found');
    }

    return generation;
  }

  // ============================================
  // 📋 LIST GENERATIONS
  // ============================================
  async listGenerations(userId: string, tool?: WorkspaceTool, limit = 20) {
    return prisma.workspaceGeneration.findMany({
      where: {
        userId,
        ...(tool && { tool }),
        isEdit: false
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

export const workspaceService = new WorkspaceService();