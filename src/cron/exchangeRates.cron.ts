// ═══════════════════════════════════════════════════════════════
// EXCHANGE RATES CRON - Daily rate refresh
// ═══════════════════════════════════════════════════════════════

import cron from 'node-cron';
import currencyService from '../services/currency.service';

// ─────────────────────────────────────────────────────────────
// CRON SCHEDULE
// ─────────────────────────────────────────────────────────────

// Run daily at 00:05 IST (18:35 UTC previous day)
// This ensures rates are updated at start of Indian business day
const CRON_SCHEDULE = '35 18 * * *';  // 18:35 UTC = 00:05 IST

// Alternative schedules:
// '0 0 * * *'     - Midnight UTC
// '0 */6 * * *'   - Every 6 hours
// '0 8 * * *'     - 8 AM UTC daily

// ─────────────────────────────────────────────────────────────
// START CRON JOB
// ─────────────────────────────────────────────────────────────

export function startExchangeRateCron() {
  console.log('📅 Exchange rate cron job scheduled:', CRON_SCHEDULE);

  cron.schedule(CRON_SCHEDULE, async () => {
    console.log('🔄 Running exchange rate update cron job...');
    
    try {
      await currencyService.updateExchangeRatesInDB();
      console.log('✅ Exchange rates updated successfully via cron');
    } catch (error) {
      console.error('❌ Cron job failed to update exchange rates:', error);
    }
  });

  // Also update on server start if rates are stale (older than 24 hours)
  initializeRates();
}

// ─────────────────────────────────────────────────────────────
// INITIALIZE RATES ON SERVER START
// ─────────────────────────────────────────────────────────────

async function initializeRates() {
  try {
    const lastUpdated = await currencyService.getLastUpdatedTime();
    
    if (!lastUpdated) {
      console.log('📊 No exchange rates found, fetching initial rates...');
      await currencyService.updateExchangeRatesInDB();
      return;
    }

    // Check if rates are older than 24 hours
    const hoursOld = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    if (hoursOld > 24) {
      console.log(`📊 Exchange rates are ${Math.round(hoursOld)} hours old, refreshing...`);
      await currencyService.updateExchangeRatesInDB();
    } else {
      console.log(`📊 Exchange rates are ${Math.round(hoursOld)} hours old, using cached rates`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize exchange rates:', error);
  }
}

export default { startExchangeRateCron };