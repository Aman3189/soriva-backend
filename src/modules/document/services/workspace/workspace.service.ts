// src/modules/document/services/workspace/workspace.service.ts
// ═══════════════════════════════════════════════════════════════════════════
// SORIVA WORKSPACE SERVICE v2.0
// Smart Document Generation - Casual Input Support
// ═══════════════════════════════════════════════════════════════════════════

import { PrismaClient, WorkspaceTool, WorkspaceStatus } from '@prisma/client';
import { WORKSPACE_CONFIG } from '../../../../config/workspace.config';
import { workspaceLLMService } from './workspace-llm.service';
import { workspaceQuotaService } from './workspace-quota.service';
import { workspaceTemplateService } from './workspace-template.service';

const prisma = new PrismaClient();

export class WorkspaceService {

  // ════════════════════════════════════════════════════════════════════════════
  // 🚀 GENERATE FROM CASUAL INPUT (NEW - Smart Generation)
  // ════════════════════════════════════════════════════════════════════════════
  /**
   * Generate document from user's casual/natural language input
   * Example: "Mai Aman hoon, 2 years developer, React Node jaanta hoon"
   */
  async generateFromCasualInput(
    userId: string,
    tool: WorkspaceTool,
    casualInput: string
  ) {
    // 1. Validate input
    if (!casualInput || casualInput.trim().length < 10) {
      throw new Error('Please provide more details about yourself. Minimum 10 characters required.');
    }

    // 2. Check quota
    const quota = await workspaceQuotaService.getBestQuota(userId, tool);
    
    if (quota.source === 'none') {
      throw new Error('No quota available. Please upgrade your plan or wait for monthly reset.');
    }

    // 3. Create generation record
    const generation = await prisma.workspaceGeneration.create({
      data: {
        userId,
        tool,
        toolName: WORKSPACE_CONFIG.TOOLS[tool as keyof typeof WORKSPACE_CONFIG.TOOLS]?.name || tool,
        userInput: { casualInput }, // Store original casual input
        userPrompt: casualInput,     // Also store as prompt for reference
        status: WorkspaceStatus.PROCESSING,
        powerPackId: quota.packId || null,
        llmModel: quota.model,
        llmProvider: quota.provider
      }
    });

    try {
      // 4. Generate output using smart LLM prompt
      const startTime = Date.now();
      const result = await workspaceLLMService.generateFromCasualInput(
        tool,
        casualInput,
        quota.model,
        quota.provider
      );

      // 5. Select random template for this tool
      const templateName = this.selectRandomTemplate(tool);

      // 6. Update generation record with output
      const updated = await prisma.workspaceGeneration.update({
        where: { id: generation.id },
        data: {
          outputJson: result.outputJson,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
          status: WorkspaceStatus.COMPLETED,
          processingTime: Date.now() - startTime,
          completedAt: new Date(),
          templateUsed: templateName
        }
      });

      // 7. Deduct quota
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
        remaining: quota.remaining - 1,
        templateUsed: templateName,
        processingTime: Date.now() - startTime
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

  // ════════════════════════════════════════════════════════════════════════════
  // 🚀 GENERATE DOCUMENT (Legacy - Structured Input)
  // ════════════════════════════════════════════════════════════════════════════
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
        toolName: WORKSPACE_CONFIG.TOOLS[tool as keyof typeof WORKSPACE_CONFIG.TOOLS]?.name || tool,
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

      // 4. Select random template
      const templateName = this.selectRandomTemplate(tool);

      // 5. Update generation record
      const updated = await prisma.workspaceGeneration.update({
        where: { id: generation.id },
        data: {
          outputJson: result.outputJson,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
          status: WorkspaceStatus.COMPLETED,
          processingTime: Date.now() - startTime,
          completedAt: new Date(),
          templateUsed: templateName
        }
      });

      // 6. Deduct quota
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
        remaining: quota.remaining - 1,
        templateUsed: templateName
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

  // ════════════════════════════════════════════════════════════════════════════
  // ✏️ EDIT DOCUMENT
  // ════════════════════════════════════════════════════════════════════════════
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

    const toolLimits = WORKSPACE_CONFIG.TOKEN_LIMITS[original.tool as keyof typeof WORKSPACE_CONFIG.TOKEN_LIMITS];
    const maxEdits = toolLimits?.maxEdits || 3;
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
        editNumber: editCount + 1,
        templateUsed: original.templateUsed // Keep same template for edits
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

  // ════════════════════════════════════════════════════════════════════════════
  // 📊 GET USER STATUS
  // ════════════════════════════════════════════════════════════════════════════
  async getStatus(userId: string) {
    return workspaceQuotaService.getUserWorkspaceStatus(userId);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 📄 GET GENERATION
  // ════════════════════════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════════════════════════
  // 📋 LIST GENERATIONS
  // ════════════════════════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════════════════════════
  // 👁️ PREVIEW DOCUMENT (Render HTML)
  // ════════════════════════════════════════════════════════════════════════════
  async previewDocument(userId: string, generationId: string): Promise<string> {
    const generation = await this.getGeneration(userId, generationId);
    
    if (!generation.outputJson) {
      throw new Error('No output available for preview');
    }

    // Get template name (or use default)
    const templateName = generation.templateUsed || this.getDefaultTemplate(generation.tool);

    // Render HBS template with output JSON
    const html = await workspaceTemplateService.renderTemplate(
      generation.tool,
      templateName,
      generation.outputJson as Record<string, any>
    );

    return html;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 📥 DOWNLOAD DOCUMENT (PDF/DOCX/PNG)
  // ════════════════════════════════════════════════════════════════════════════
  async downloadDocument(
    userId: string, 
    generationId: string, 
    format: 'pdf' | 'docx' | 'png'
  ): Promise<{ buffer: Buffer; filename: string }> {
    const generation = await this.getGeneration(userId, generationId);
    
    if (!generation.outputJson) {
      throw new Error('No output available for download');
    }

    // Get template name
    const templateName = generation.templateUsed || this.getDefaultTemplate(generation.tool);

    // Render HTML first
    const html = await workspaceTemplateService.renderTemplate(
      generation.tool,
      templateName,
      generation.outputJson as Record<string, any>
    );

    // Convert to requested format
    const buffer = await workspaceTemplateService.convertToFormat(html, format);

    // Generate filename
    const toolName = WORKSPACE_CONFIG.TOOLS[generation.tool as keyof typeof WORKSPACE_CONFIG.TOOLS]?.name || generation.tool;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${toolName.replace(/\s+/g, '-')}_${timestamp}.${format}`;

    return { buffer, filename };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🎲 SELECT RANDOM TEMPLATE
  // ════════════════════════════════════════════════════════════════════════════
  private selectRandomTemplate(tool: WorkspaceTool): string {
    const templates: Record<string, string[]> = {
      RESUME: [
        'two-column-resume-one',
        'two-column-resume-two',
        'two-column-resume-three',
        'two-column-resume-four',
        'two-column-resume-five',
        'two-column-resume-custom'
      ],
      INVOICE: [
        'invoice-commercial',
        'invoice-service',
        'invoice-professional'
      ],
      PORTFOLIO: [
        'portfolio-developer',
        'portfolio-creative'
      ],
      CRM: [
        'crm-lead-card'
      ],
      CONTENT: [
        'content-plan-calendar'
      ]
    };

    const toolTemplates = templates[tool] || ['default'];
    const randomIndex = Math.floor(Math.random() * toolTemplates.length);
    return toolTemplates[randomIndex];
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 📄 GET DEFAULT TEMPLATE
  // ════════════════════════════════════════════════════════════════════════════
  private getDefaultTemplate(tool: WorkspaceTool): string {
    const defaults: Record<string, string> = {
      RESUME: 'two-column-resume-one',
      INVOICE: 'invoice-commercial',
      PORTFOLIO: 'portfolio-developer',
      CRM: 'crm-lead-card',
      CONTENT: 'content-plan-calendar'
    };

    return defaults[tool] || 'default';
  }
}

export const workspaceService = new WorkspaceService();