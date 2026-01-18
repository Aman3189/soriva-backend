// src/modules/document/services/workspace/workspace-quota.service.ts

import { PrismaClient, WorkspaceTool } from '@prisma/client';
import { WORKSPACE_CONFIG } from '../../../../config/workspace.config';

const prisma = new PrismaClient();

export class WorkspaceQuotaService {
  
  // ============================================
  // 🎁 CHECK FREE QUOTA
  // ============================================
  async checkFreeQuota(userId: string, tool: WorkspaceTool): Promise<{
    hasQuota: boolean;
    remaining: number;
    total: number;
  }> {
    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) throw new Error('User not found');

    const plan = user.planType.toUpperCase();
    
    // STARTER has no free quota
    if (plan === 'STARTER') {
      return { hasQuota: false, remaining: 0, total: 0 };
    }

    // Get or create free quota record
    let quota = await prisma.workspaceFreeQuota.findUnique({
      where: { userId }
    });

    if (!quota) {
      quota = await this.initializeFreeQuota(userId, plan);
    }

    // Get tool-specific usage
    const toolKey = tool.toLowerCase();
    const usedKey = `${toolKey}UsesUsed` as keyof typeof quota;
    const totalKey = `${toolKey}UsesTotal` as keyof typeof quota;

    const used = quota[usedKey] as number;
    const total = quota[totalKey] as number;
    const remaining = total - used;

    return {
      hasQuota: remaining > 0,
      remaining,
      total
    };
  }

  // ============================================
  // 📦 CHECK POWER PACK QUOTA
  // ============================================
  async checkPowerPackQuota(userId: string, tool: WorkspaceTool): Promise<{
    hasQuota: boolean;
    remaining: number;
    total: number;
    packId: string | null;
    tier: string | null;
  }> {
    // Find active power pack with remaining uses
    const pack = await prisma.workspacePowerPack.findFirst({
      where: {
        userId,
        status: 'active',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { purchasedAt: 'asc' }  // Use oldest first
    });

    if (!pack) {
      return { hasQuota: false, remaining: 0, total: 0, packId: null, tier: null };
    }

    const toolKey = tool.toLowerCase();
    const usedKey = `${toolKey}UsesUsed` as keyof typeof pack;
    const totalKey = `${toolKey}UsesTotal` as keyof typeof pack;

    const used = pack[usedKey] as number;
    const total = pack[totalKey] as number;
    const remaining = total - used;

    return {
      hasQuota: remaining > 0,
      remaining,
      total,
      packId: pack.id,
      tier: pack.tier
    };
  }

  // ============================================
  // ✅ GET BEST AVAILABLE QUOTA
  // ============================================
  async getBestQuota(userId: string, tool: WorkspaceTool): Promise<{
    source: 'free' | 'powerpack' | 'none';
    remaining: number;
    packId?: string;
    model: string;
    provider: string;
  }> {
    // Check free quota first
    const freeQuota = await this.checkFreeQuota(userId, tool);
    if (freeQuota.hasQuota) {
      return {
        source: 'free',
        remaining: freeQuota.remaining,
        model: WORKSPACE_CONFIG.FREE_QUOTA_MODEL,
        provider: WORKSPACE_CONFIG.FREE_QUOTA_PROVIDER
      };
    }

    // Check power pack
    const packQuota = await this.checkPowerPackQuota(userId, tool);
    if (packQuota.hasQuota && packQuota.packId) {
      const packConfig = WORKSPACE_CONFIG.POWER_PACKS[packQuota.tier as keyof typeof WORKSPACE_CONFIG.POWER_PACKS];
      return {
        source: 'powerpack',
        remaining: packQuota.remaining,
        packId: packQuota.packId,
        model: packConfig.model,
        provider: packConfig.provider
      };
    }

    return {
      source: 'none',
      remaining: 0,
      model: '',
      provider: ''
    };
  }

  // ============================================
  // ➖ DEDUCT USAGE
  // ============================================
  async deductUsage(
    userId: string,
    tool: WorkspaceTool,
    source: 'free' | 'powerpack',
    packId?: string,
    tokensUsed: number = 0
  ): Promise<void> {
    const toolKey = tool.toLowerCase();
    const usedKey = `${toolKey}UsesUsed`;

    if (source === 'free') {
      await prisma.workspaceFreeQuota.update({
        where: { userId },
        data: {
          [usedKey]: { increment: 1 },
          tokensUsed: { increment: tokensUsed }
        }
      });
    } else if (source === 'powerpack' && packId) {
      await prisma.workspacePowerPack.update({
        where: { id: packId },
        data: {
          [usedKey]: { increment: 1 },
          tokensUsed: { increment: tokensUsed }
        }
      });

      // Check if pack is exhausted
      await this.checkAndUpdatePackStatus(packId);
    }
  }

  // ============================================
  // 🔄 INITIALIZE FREE QUOTA
  // ============================================
  private async initializeFreeQuota(userId: string, plan: string) {
    const quotaConfig = WORKSPACE_CONFIG.FREE_QUOTA[plan as keyof typeof WORKSPACE_CONFIG.FREE_QUOTA];
    
    if (!quotaConfig) {
      throw new Error('Invalid plan for free quota');
    }

    return prisma.workspaceFreeQuota.create({
      data: {
        userId,
        subscriptionPlan: plan,
        resumeUsesTotal: quotaConfig.resume,
        invoiceUsesTotal: quotaConfig.invoice,
        portfolioUsesTotal: quotaConfig.portfolio,
        crmUsesTotal: quotaConfig.crm,
        contentUsesTotal: quotaConfig.content
      }
    });
  }

  // ============================================
  // 📊 CHECK PACK STATUS
  // ============================================
  private async checkAndUpdatePackStatus(packId: string): Promise<void> {
    const pack = await prisma.workspacePowerPack.findUnique({
      where: { id: packId }
    });

    if (!pack) return;

    const totalUsed = 
      pack.resumeUsesUsed +
      pack.invoiceUsesUsed +
      pack.portfolioUsesUsed +
      pack.crmUsesUsed +
      pack.contentUsesUsed;

    const totalAvailable =
      pack.resumeUsesTotal +
      pack.invoiceUsesTotal +
      pack.portfolioUsesTotal +
      pack.crmUsesTotal +
      pack.contentUsesTotal;

    if (totalUsed >= totalAvailable) {
      await prisma.workspacePowerPack.update({
        where: { id: packId },
        data: { status: 'exhausted' }
      });
    }
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

    const plan = user.planType.toUpperCase();
    const isStarter = plan === 'STARTER';

    // Get free quota
    const freeQuota = isStarter ? null : await prisma.workspaceFreeQuota.findUnique({
      where: { userId }
    });

    // Get active power packs
    const powerPacks = await prisma.workspacePowerPack.findMany({
      where: {
        userId,
        status: 'active'
      }
    });

    return {
      plan,
      region: user.region,
      hasToolsAccess: !isStarter,
      freeQuota: freeQuota ? {
        resume: { used: freeQuota.resumeUsesUsed, total: freeQuota.resumeUsesTotal },
        invoice: { used: freeQuota.invoiceUsesUsed, total: freeQuota.invoiceUsesTotal },
        portfolio: { used: freeQuota.portfolioUsesUsed, total: freeQuota.portfolioUsesTotal },
        crm: { used: freeQuota.crmUsesUsed, total: freeQuota.crmUsesTotal },
        content: { used: freeQuota.contentUsesUsed, total: freeQuota.contentUsesTotal }
      } : null,
      powerPacks: powerPacks.map(p => ({
        id: p.id,
        tier: p.tier,
        resume: { used: p.resumeUsesUsed, total: p.resumeUsesTotal },
        invoice: { used: p.invoiceUsesUsed, total: p.invoiceUsesTotal },
        portfolio: { used: p.portfolioUsesUsed, total: p.portfolioUsesTotal },
        crm: { used: p.crmUsesUsed, total: p.crmUsesTotal },
        content: { used: p.contentUsesUsed, total: p.contentUsesTotal }
      })),
      availablePacks: WORKSPACE_CONFIG.ACCESS[plan as keyof typeof WORKSPACE_CONFIG.ACCESS] || ['PLUS']
    };
  }
}

export const workspaceQuotaService = new WorkspaceQuotaService();