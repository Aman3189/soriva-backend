// src/studio/studio.cron.ts
// ✅ UPDATED: Image count reset (no more credits/boosters)

import * as cron from 'node-cron';
import { prisma } from '../core/services/prisma.service';
import { studioService } from './studio.service';

// Plan image limits
const PLAN_IMAGE_LIMITS: Record<string, number> = {
  STARTER: 20,
  BASIC: 50,
  PREMIUM: 120,
  PRO: 200,
  EDGE: 1000,
  LIFE: 1000,
};

export class StudioCronService {
  private monthlyResetJob: cron.ScheduledTask | null = null;

  /**
   * Monthly image reset handler
   */
  private async handleMonthlyReset() {
    try {
      console.log('🔄 [STUDIO CRON] Starting monthly image reset...');

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          planType: true,
        },
      });

      let resetCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await studioService.resetMonthlyImages(user.id);
          resetCount++;

          const imageLimit = PLAN_IMAGE_LIMITS[user.planType] || 0;
          console.log(
            `✅ Reset: ${user.email} | Plan: ${user.planType} | Images: ${imageLimit}`
          );
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to reset images for ${user.email}:`, error);
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
   * Initialize cron jobs
   */
  initialize() {
    // Monthly image reset (1st of every month at 00:00 IST)
    this.monthlyResetJob = cron.schedule(
      '0 0 1 * *',
      () => this.handleMonthlyReset(),
      {
        timezone: 'Asia/Kolkata',
      }
    );

    console.log('✅ [STUDIO CRON] Cron job initialized');
  }

  /**
   * Start all cron jobs
   */
  start() {
    if (!this.monthlyResetJob) {
      this.initialize();
    }

    console.log('🚀 [STUDIO CRON] Starting studio cron job...');
    console.log('✅ Monthly image reset job active (runs 1st of month at 00:00 IST)');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    console.log('🛑 [STUDIO CRON] Stopping studio cron job...');
    this.monthlyResetJob?.stop();
    console.log('✅ Studio cron job stopped');
  }

  /**
   * Manual trigger for testing
   */
  async triggerMonthlyReset() {
    await this.handleMonthlyReset();
  }
}

// Export singleton instance
export const studioCronService = new StudioCronService();