// src/studio/studio.cron.ts
// ============================================================================
// SORIVA STUDIO v2.0 - December 2025
// ============================================================================
// Monthly credit reset + 60-day booster expiry
// ============================================================================

import * as cron from 'node-cron';
import { prisma } from '../core/services/prisma.service';
import { PLAN_STUDIO_CREDITS } from './types/studio.types';

export class StudioCronService {
  private monthlyResetJob: cron.ScheduledTask | null = null;
  private boosterExpiryJob: cron.ScheduledTask | null = null;

  // ==========================================================================
  // MONTHLY CREDIT RESET
  // ==========================================================================

  private async handleMonthlyReset() {
    try {
      console.log('🔄 [STUDIO CRON] Starting monthly credit reset...');

      const users = await prisma.user.findMany({
        where: {
          planType: { in: ['PLUS', 'PRO', 'APEX'] },
        },
        select: {
          id: true,
          email: true,
          planType: true,
          studioCreditsMonthly: true,
          studioCreditsUsed: true,
          studioCreditsBooster: true,
          lastStudioReset: true,
        },
      });

      let resetCount = 0;
      let errorCount = 0;
      let totalCarryForward = 0;

      for (const user of users) {
        try {
          const unusedMonthly = Math.max(0, user.studioCreditsMonthly - user.studioCreditsUsed);
          const planCredits = PLAN_STUDIO_CREDITS[user.planType as keyof typeof PLAN_STUDIO_CREDITS] || 0;
          const maxCarryForward = Math.floor(planCredits * 0.5);
          const carryForward = Math.min(unusedMonthly, maxCarryForward);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              studioCreditsMonthly: planCredits,
              studioCreditsCarryForward: carryForward,
              studioCreditsUsed: 0,
              lastStudioReset: new Date(),
            },
          });

          resetCount++;
          totalCarryForward += carryForward;

          console.log(
            `✅ Reset: ${user.email} | Plan: ${user.planType} | Credits: ${planCredits} | CarryForward: ${carryForward}`
          );
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to reset credits for ${user.email}:`, error);
        }
      }

      console.log(`
🎉 [STUDIO CRON] Monthly reset completed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Success: ${resetCount} users
❌ Failed: ${errorCount} users
💰 Total Carry Forward: ${totalCarryForward} credits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    } catch (error) {
      console.error('❌ [STUDIO CRON] Monthly reset failed:', error);
    }
  }

  // ==========================================================================
  // BOOSTER EXPIRY (60 DAYS)
  // ==========================================================================

  private async handleBoosterExpiry() {
    try {
      console.log('🔄 [STUDIO CRON] Checking booster expiry...');

      // Find expired boosters (60 days passed, still ACTIVE)
      const expiredBoosters = await prisma.studioBoosterPurchase.findMany({
        where: {
          expiresAt: { lt: new Date() },
          status: 'ACTIVE',
        },
        select: {
          id: true,
          userId: true,
          boosterType: true,
          creditsAdded: true,
          expiresAt: true,
        },
      });

      if (expiredBoosters.length === 0) {
        console.log('✅ [STUDIO CRON] No expired boosters found');
        return;
      }

      let expiredCount = 0;
      let totalCreditsExpired = 0;

      for (const booster of expiredBoosters) {
        try {
          // Get user's current booster balance
          const user = await prisma.user.findUnique({
            where: { id: booster.userId },
            select: { studioCreditsBooster: true, email: true },
          });

          if (!user) continue;

          // Calculate credits to remove (can't go below 0)
          const creditsToRemove = Math.min(booster.creditsAdded, user.studioCreditsBooster);

          // Update user's booster credits
          await prisma.user.update({
            where: { id: booster.userId },
            data: {
              studioCreditsBooster: { decrement: creditsToRemove },
            },
          });

          // Mark booster as expired
          await prisma.studioBoosterPurchase.update({
            where: { id: booster.id },
            data: { status: 'EXPIRED' },
          });

          expiredCount++;
          totalCreditsExpired += creditsToRemove;

          console.log(
            `⏰ Expired: ${user.email} | ${booster.boosterType} | -${creditsToRemove} credits`
          );
        } catch (error) {
          console.error(`❌ Failed to expire booster ${booster.id}:`, error);
        }
      }

      console.log(`
⏰ [STUDIO CRON] Booster expiry completed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Expired Boosters: ${expiredCount}
💸 Total Credits Expired: ${totalCreditsExpired}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    } catch (error) {
      console.error('❌ [STUDIO CRON] Booster expiry check failed:', error);
    }
  }

  // ==========================================================================
  // CRON MANAGEMENT
  // ==========================================================================

  initialize() {
    // Monthly credit reset (1st of every month at 00:00 IST)
    this.monthlyResetJob = cron.schedule(
      '0 0 1 * *',
      () => this.handleMonthlyReset(),
      { timezone: 'Asia/Kolkata' }
    );

    // Booster expiry check (daily at 01:00 IST)
    this.boosterExpiryJob = cron.schedule(
      '0 1 * * *',
      () => this.handleBoosterExpiry(),
      { timezone: 'Asia/Kolkata' }
    );

    console.log('✅ [STUDIO CRON] Cron jobs initialized');
    console.log('   📅 Monthly reset: 1st of month at 00:00 IST');
    console.log('   ⏰ Booster expiry: Daily at 01:00 IST');
  }

  start() {
    if (!this.monthlyResetJob) {
      this.initialize();
    }
    console.log('🚀 [STUDIO CRON] Studio cron service started');
  }

  stop() {
    console.log('🛑 [STUDIO CRON] Stopping studio cron jobs...');
    this.monthlyResetJob?.stop();
    this.boosterExpiryJob?.stop();
    console.log('✅ Studio cron jobs stopped');
  }

  // Manual triggers for testing
  async triggerMonthlyReset() {
    console.log('🔧 [STUDIO CRON] Manual monthly reset triggered');
    await this.handleMonthlyReset();
  }

  async triggerBoosterExpiry() {
    console.log('🔧 [STUDIO CRON] Manual booster expiry triggered');
    await this.handleBoosterExpiry();
  }

  getStatus() {
    return {
      monthlyReset: {
        active: this.monthlyResetJob !== null,
        schedule: '1st of month, 00:00 IST',
      },
      boosterExpiry: {
        active: this.boosterExpiryJob !== null,
        schedule: 'Daily at 01:00 IST',
        validity: '60 days from purchase',
      },
    };
  }
}

export const studioCronService = new StudioCronService();