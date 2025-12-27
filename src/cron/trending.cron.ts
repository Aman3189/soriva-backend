// ═══════════════════════════════════════════════════════════════
// TRENDING CRON JOB - Scheduled Background Tasks
// File: src/cron/trending.cron.ts
//
// News: Every 3 hours (8x/day = 80 API calls, within 100 limit)
// Horoscope: Daily at 6 AM IST (FREE unlimited)
// ═══════════════════════════════════════════════════════════════

import cron from 'node-cron';
import { trendingService } from '../services/trending/trending.service';
import {
  NEWS_REFRESH_INTERVAL_CRON,
  HOROSCOPE_REFRESH_CRON,
} from '../types/trending.types';

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const CONFIG = {
  // News: Every 3 hours (0 */3 * * *)
  // Runs at: 12 AM, 3 AM, 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
  newsSchedule: NEWS_REFRESH_INTERVAL_CRON,

  // Horoscope: Daily at 6 AM IST (0 6 * * *)
  horoscopeSchedule: HOROSCOPE_REFRESH_CRON,

  // Timezone
  timezone: 'Asia/Kolkata',

  // Run on startup?
  runOnStartup: true,
};

// ─────────────────────────────────────────────────────────────────
// NEWS CRON FUNCTION
// ─────────────────────────────────────────────────────────────────

async function fetchNewsJob(): Promise<void> {
  const startTime = Date.now();

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📰 NEWS CRON JOB STARTED');
  console.log(`⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: CONFIG.timezone })}`);
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    const result = await trendingService.fetchAndCacheNews();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('───────────────────────────────────────────────────────────────');
    if (result.success) {
      console.log('✅ NEWS CRON JOB COMPLETED');
      console.log(`📊 Items Fetched: ${result.count}`);
    } else {
      console.log('⚠️ NEWS CRON JOB COMPLETED WITH ERRORS');
    }
    console.log(`⏱️ Duration: ${duration} seconds`);
    console.log(`⏭️ Next Run: ${getNextRunTime(CONFIG.newsSchedule)}`);
    console.log('───────────────────────────────────────────────────────────────');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ NEWS CRON JOB FAILED:', error.message);
  }
}

// ─────────────────────────────────────────────────────────────────
// HOROSCOPE CRON FUNCTION
// ─────────────────────────────────────────────────────────────────

async function fetchHoroscopeJob(): Promise<void> {
  const startTime = Date.now();

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔮 HOROSCOPE CRON JOB STARTED');
  console.log(`⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: CONFIG.timezone })}`);
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    const result = await trendingService.fetchAndCacheHoroscopes();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('───────────────────────────────────────────────────────────────');
    if (result.success) {
      console.log('✅ HOROSCOPE CRON JOB COMPLETED');
      console.log(`🔮 Signs Fetched: ${result.count}/12`);
    } else {
      console.log('⚠️ HOROSCOPE CRON JOB COMPLETED WITH ERRORS');
    }
    console.log(`⏱️ Duration: ${duration} seconds`);
    console.log(`⏭️ Next Run: Tomorrow 6:00 AM IST`);
    console.log('───────────────────────────────────────────────────────────────');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ HOROSCOPE CRON JOB FAILED:', error.message);
  }
}

// ─────────────────────────────────────────────────────────────────
// HELPER: Get Next Run Time
// ─────────────────────────────────────────────────────────────────

function getNextRunTime(cronExpression: string): string {
  // Simple calculation for "every 3 hours" schedule
  const now = new Date();
  const currentHour = now.getHours();
  const nextHour = Math.ceil((currentHour + 1) / 3) * 3;

  const nextRun = new Date(now);
  if (nextHour >= 24) {
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(0, 0, 0, 0);
  } else {
    nextRun.setHours(nextHour, 0, 0, 0);
  }

  return nextRun.toLocaleString('en-IN', { timeZone: CONFIG.timezone });
}

// ─────────────────────────────────────────────────────────────────
// INITIALIZE ALL CRON JOBS
// ─────────────────────────────────────────────────────────────────

export function initTrendingCron(): void {
  console.log('\n');
  console.log('🕐 ═══════════════════════════════════════════════════════════');
  console.log('   INITIALIZING TRENDING CRON JOBS');
  console.log('═══════════════════════════════════════════════════════════════');

  // ─────────────────────────────────────────────────────────
  // Schedule News Cron (Every 3 hours)
  // ─────────────────────────────────────────────────────────
  console.log('\n📰 NEWS CRON:');
  console.log(`   Schedule: ${CONFIG.newsSchedule}`);
  console.log('   Runs at: 12AM, 3AM, 6AM, 9AM, 12PM, 3PM, 6PM, 9PM IST');
  console.log('   API Calls: ~80/day (within 100 limit)');

  cron.schedule(CONFIG.newsSchedule, fetchNewsJob, {
    timezone: CONFIG.timezone,
  });

  console.log('   ✅ News cron scheduled!');

  // ─────────────────────────────────────────────────────────
  // Schedule Horoscope Cron (Daily 6 AM)
  // ─────────────────────────────────────────────────────────
  console.log('\n🔮 HOROSCOPE CRON:');
  console.log(`   Schedule: ${CONFIG.horoscopeSchedule}`);
  console.log('   Runs at: 6:00 AM IST daily');
  console.log('   API Calls: FREE (unlimited)');

  cron.schedule(CONFIG.horoscopeSchedule, fetchHoroscopeJob, {
    timezone: CONFIG.timezone,
  });

  console.log('   ✅ Horoscope cron scheduled!');

  // ─────────────────────────────────────────────────────────
  // Run on startup if enabled
  // ─────────────────────────────────────────────────────────
  if (CONFIG.runOnStartup) {
    console.log('\n🚀 STARTUP FETCH:');
    console.log('   Running initial data fetch...');

    // Run both with slight delay between them
    setTimeout(async () => {
      await fetchNewsJob();
      await fetchHoroscopeJob();
    }, 2000);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ ALL CRON JOBS INITIALIZED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// ─────────────────────────────────────────────────────────────────
// MANUAL TRIGGERS (For testing/admin)
// ─────────────────────────────────────────────────────────────────

export async function triggerNewsFetch(): Promise<{ success: boolean; count: number }> {
  console.log('\n🔧 Manual NEWS fetch triggered...');
  return await trendingService.fetchAndCacheNews();
}

export async function triggerHoroscopeFetch(): Promise<{ success: boolean; count: number }> {
  console.log('\n🔧 Manual HOROSCOPE fetch triggered...');
  return await trendingService.fetchAndCacheHoroscopes();
}

export async function triggerFullFetch(): Promise<{
  news: { success: boolean; count: number };
  horoscope: { success: boolean; count: number };
}> {
  console.log('\n🔧 Manual FULL fetch triggered...');

  const newsResult = await trendingService.fetchAndCacheNews();
  const horoscopeResult = await trendingService.fetchAndCacheHoroscopes();

  return {
    news: newsResult,
    horoscope: horoscopeResult,
  };
}

// ─────────────────────────────────────────────────────────────────
// GET CRON STATUS
// ─────────────────────────────────────────────────────────────────

export function getCronStatus(): {
  news: { schedule: string; nextRun: string };
  horoscope: { schedule: string; nextRun: string };
  timezone: string;
} {
  return {
    news: {
      schedule: CONFIG.newsSchedule,
      nextRun: getNextRunTime(CONFIG.newsSchedule),
    },
    horoscope: {
      schedule: CONFIG.horoscopeSchedule,
      nextRun: 'Tomorrow 6:00 AM IST',
    },
    timezone: CONFIG.timezone,
  };
}

// ─────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────

export default {
  init: initTrendingCron,
  triggerNews: triggerNewsFetch,
  triggerHoroscope: triggerHoroscopeFetch,
  triggerFull: triggerFullFetch,
  getStatus: getCronStatus,
};