// src/studio/studio.cron.ts
// ✅ CLASS-BASED cron jobs for studio credit resets

import * as cron from 'node-cron';
import { prisma } from '../core/services/prisma.service';
import { studioService } from './studio.service';
import { PLAN_BONUS_CREDITS } from './types/studio.types';

export class StudioCronService {
  private monthlyResetJob: cron.ScheduledTask | null = null;
  private dailyExpiryJob: cron.ScheduledTask | null = null;

  /**
   * Monthly credit reset handler
   */
  private async handleMonthlyReset() {
    try {
      console.log('🔄 [STUDIO CRON] Starting monthly credit reset...');

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          planType: true,
          studioCreditsRemaining: true,
        },
      });

      let resetCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await studioService.resetMonthlyCredits(user.id);
          resetCount++;
          
          const bonusCredits = PLAN_BONUS_CREDITS[user.planType] || 0;
          console.log(
            `✅ Reset: ${user.email} | Plan: ${user.planType} | New Credits: ${bonusCredits}`
          );
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to reset credits for ${user.email}:`, error);
        }
      }

      console.log(`
🎉 [STUDIO CRON] Monthly reset completed!
✅ Success: ${resetCount} users
❌ Failed: ${errorCount} users
      `);
    } catch (error) {
      console.error('❌ [STUDIO CRON] Monthly reset failed:', error);
    }
  }

  /**
   * Daily booster expiry handler
   */
  private async handleDailyExpiry() {
    try {
      console.log('🔄 [STUDIO CRON] Checking for expired boosters...');

      const usersWithBoosters = await prisma.studioBoosterPurchase.findMany({
        where: {
          active: true,
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      });

      let expiredCount = 0;

      for (const { userId } of usersWithBoosters) {
        try {
          await studioService.expireBoosters(userId);
          expiredCount++;
        } catch (error) {
          console.error(`❌ Failed to expire boosters for user ${userId}:`, error);
        }
      }

      console.log(`✅ [STUDIO CRON] Expired boosters for ${expiredCount} users`);
    } catch (error) {
      console.error('❌ [STUDIO CRON] Booster expiry failed:', error);
    }
  }

  /**
   * Initialize cron jobs
   */
  initialize() {
    // Monthly credit reset (1st of every month at 00:00 IST)
    this.monthlyResetJob = cron.schedule(
      '0 0 1 * *',
      () => this.handleMonthlyReset(),
      {
        scheduled: false,
        timezone: 'Asia/Kolkata',
      } as any
    );

    // Daily booster expiry (every day at 00:00 IST)
    this.dailyExpiryJob = cron.schedule(
      '0 0 * * *',
      () => this.handleDailyExpiry(),
      {
        scheduled: false,
        timezone: 'Asia/Kolkata',
      } as any
    );

    console.log('✅ [STUDIO CRON] Cron jobs initialized');
  }

  /**
   * Start all cron jobs
   */
  start() {
    if (!this.monthlyResetJob || !this.dailyExpiryJob) {
      this.initialize();
    }

    console.log('🚀 [STUDIO CRON] Starting studio cron jobs...');
    
    this.monthlyResetJob?.start();
    console.log('✅ Monthly credit reset job started (runs on 1st of every month at 00:00 IST)');
    
    this.dailyExpiryJob?.start();
    console.log('✅ Daily booster expiry job started (runs daily at 00:00 IST)');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    console.log('🛑 [STUDIO CRON] Stopping studio cron jobs...');
    
    this.monthlyResetJob?.stop();
    this.dailyExpiryJob?.stop();
    
    console.log('✅ All studio cron jobs stopped');
  }

  /**
   * Manual trigger for testing
   */
  async triggerMonthlyReset() {
    await this.handleMonthlyReset();
  }

  /**
   * Manual trigger for testing
   */
  async triggerDailyExpiry() {
    await this.handleDailyExpiry();
  }
}

// Export singleton instance
export const studioCronService = new StudioCronService();