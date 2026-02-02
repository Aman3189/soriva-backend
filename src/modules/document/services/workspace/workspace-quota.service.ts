// src/modules/document/services/workspace/workspace-quota.service.ts
// ═══════════════════════════════════════════════════════════════════════════
// SORIVA WORKSPACE QUOTA SERVICE (Simplified)
// Plan-based quota only - No Power Packs
// ═══════════════════════════════════════════════════════════════════════════

import { PrismaClient, WorkspaceTool } from '@prisma/client';
import { WORKSPACE_CONFIG } from '../../../../config/workspace.config';

const prisma = new PrismaClient();

export class WorkspaceQuotaService {
  
  // ============================================
  // ✅ GET BEST AVAILABLE QUOTA (Simplified)
  // ============================================
  async getBestQuota(userId: string, tool: WorkspaceTool): Promise<{
    source: 'plan' | 'none';
    remaining: number;
    model: string;
    provider: string;
    packId?: string;
  }> {
    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) throw new Error('User not found');

    const plan = user.planType.toUpperCase() as keyof typeof WORKSPACE_CONFIG.FREE_QUOTA;

    // Check if plan has access to this tool
    const accessibleTools = WORKSPACE_CONFIG.ACCESS[plan as keyof typeof WORKSPACE_CONFIG.ACCESS] || [];
    if (!(accessibleTools as readonly string[]).includes(tool)
) {
      return {
        source: 'none',
        remaining: 0,
        model: '',
        provider: ''
      };
    }

    // Get quota for this tool
    const planQuota = WORKSPACE_CONFIG.FREE_QUOTA[plan as keyof typeof WORKSPACE_CONFIG.FREE_QUOTA];
    if (!planQuota) {
      return {
        source: 'none',
        remaining: 0,
        model: '',
        provider: ''
      };
    }

    const totalAllowed = (planQuota as Record<string, number>)[tool]
 || 0;

    // Count how many times user has used this tool this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usedThisMonth = await prisma.workspaceGeneration.count({
      where: {
        userId,
        tool,
        isEdit: false,
        createdAt: { gte: startOfMonth }
      }
    });

    const remaining = totalAllowed - usedThisMonth;

    if (remaining <= 0) {
      return {
        source: 'none',
        remaining: 0,
        model: '',
        provider: ''
      };
    }

    // Get model for this plan
    const modelConfig = WORKSPACE_CONFIG.TOOL_MODEL[plan as keyof typeof WORKSPACE_CONFIG.TOOL_MODEL];

    return {
      source: 'plan',
      remaining,
      model: modelConfig?.model || 'gemini-2.0-flash',
      provider: modelConfig?.provider || 'google'
    };
  }

  // ============================================
  // ➖ DEDUCT USAGE (Simplified - just track tokens)
  // ============================================
  async deductUsage(
    userId: string,
    tool: WorkspaceTool,
    source: 'plan' | 'none',
    packId?: string,
    tokensUsed: number = 0
  ): Promise<void> {
    // Tokens are tracked in WorkspaceGeneration table automatically
    // No separate quota table needed - we count generations per month
    
    // Optionally: Update user's total token usage if you want to track it
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { totalTokensUsed: { increment: tokensUsed } }
    // });
  }

  // ============================================
  // 📋 GET USER WORKSPACE STATUS
  // ============================================
  async getUserWorkspaceStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, region: true }
    });

    if (!user) throw new Error('User not found');

    const plan = user.planType.toUpperCase() as keyof typeof WORKSPACE_CONFIG.FREE_QUOTA;

    // Get this month's start
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get usage for each tool this month
    const usageByTool = await prisma.workspaceGeneration.groupBy({
      by: ['tool'],
      where: {
        userId,
        isEdit: false,
        createdAt: { gte: startOfMonth }
      },
      _count: { id: true }
    });

    // Build usage map
    const usageMap: Record<string, number> = {};
    usageByTool.forEach(u => {
      usageMap[u.tool] = u._count.id;
    });

    // Get quota limits from config
    const planQuota = WORKSPACE_CONFIG.FREE_QUOTA[plan as keyof typeof WORKSPACE_CONFIG.FREE_QUOTA] || {};

    // Build status for each tool
    const toolStatus: Record<string, { used: number; total: number; remaining: number }> = {};
    
    Object.keys(WORKSPACE_CONFIG.TOOLS).forEach(tool => {
      const total = (planQuota as any)[tool] || 0;
      const used = usageMap[tool] || 0;
      toolStatus[tool] = {
        used,
        total,
        remaining: Math.max(0, total - used)
      };
    });

    return {
      plan,
      region: user.region,
      quota: toolStatus,
      accessibleTools: WORKSPACE_CONFIG.ACCESS[plan as keyof typeof WORKSPACE_CONFIG.ACCESS] || [],
      model: WORKSPACE_CONFIG.TOOL_MODEL[plan as keyof typeof WORKSPACE_CONFIG.TOOL_MODEL]
    };
  }
}

export const workspaceQuotaService = new WorkspaceQuotaService();