// ═══════════════════════════════════════════════════════════════
// HOROSCOPE SERVICE - Daily Rashifal Fetcher
// File: src/services/trending/horoscope.service.ts
//
// Fetches daily horoscope for 12 zodiac signs (rashis)
// Uses: Aztro API (FREE, unlimited) + Fallback options
// Schedule: Once daily at 6 AM IST
// ═══════════════════════════════════════════════════════════════

import axios, { AxiosInstance } from 'axios';
import {
  HoroscopeSign,
  HOROSCOPE_CONFIG,
  RawHoroscope,
  HoroscopeItem,
  getAllSigns
} from '../../types/trending.types';

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const CONFIG = {
  // Primary: Aztro API (FREE, no key required)
  aztro: {
    baseUrl: 'https://aztro.sameerkumar.website',
    timeout: 10000,
  },
  // Backup: Horoscope App API
  horoscopeApp: {
    baseUrl: 'https://horoscope-app-api.vercel.app/api/v1',
    timeout: 10000,
  },
  // Retry settings
  maxRetries: 3,
  retryDelay: 1000,
};

// ─────────────────────────────────────────────────────────────────
// FETCH TRACKER
// ─────────────────────────────────────────────────────────────────

interface FetchTracker {
  lastFetchDate: string | null;  // YYYY-MM-DD format
  successCount: number;
  failureCount: number;
}

const fetchTracker: FetchTracker = {
  lastFetchDate: null,
  successCount: 0,
  failureCount: 0,
};

// ─────────────────────────────────────────────────────────────────
// MAIN SERVICE CLASS
// ─────────────────────────────────────────────────────────────────

export class HoroscopeService {
  private aztroClient: AxiosInstance;
  private horoscopeAppClient: AxiosInstance;

  constructor() {
    // Aztro API Client (uses POST method)
    this.aztroClient = axios.create({
      baseURL: CONFIG.aztro.baseUrl,
      timeout: CONFIG.aztro.timeout,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Backup Horoscope App API Client
    this.horoscopeAppClient = axios.create({
      baseURL: CONFIG.horoscopeApp.baseUrl,
      timeout: CONFIG.horoscopeApp.timeout,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // AZTRO API: FETCH SINGLE SIGN HOROSCOPE
  // ═══════════════════════════════════════════════════════════════

  private async fetchFromAztro(sign: HoroscopeSign): Promise<RawHoroscope | null> {
    try {
      // Aztro API uses POST with sign and day as query params
      const response = await this.aztroClient.post('/', null, {
        params: {
          sign: sign,
          day: 'today',
        },
      });

      if (response.data) {
        return response.data as RawHoroscope;
      }

      return null;
    } catch (error: any) {
      console.error(`❌ Aztro API error for ${sign}:`, error.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BACKUP API: HOROSCOPE APP API
  // ═══════════════════════════════════════════════════════════════

  private async fetchFromHoroscopeApp(sign: HoroscopeSign): Promise<RawHoroscope | null> {
    try {
      const response = await this.horoscopeAppClient.get(`/get-horoscope/daily`, {
        params: {
          sign: sign,
          day: 'TODAY',
        },
      });

      if (response.data?.data) {
        // Transform to our RawHoroscope format
        const data = response.data.data;
        return {
          date_range: HOROSCOPE_CONFIG[sign].dateRange,
          current_date: new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          description: data.horoscope_data || '',
          compatibility: '',  // Not provided by this API
          mood: '',
          color: '',
          lucky_number: '',
          lucky_time: '',
        };
      }

      return null;
    } catch (error: any) {
      console.error(`❌ Horoscope App API error for ${sign}:`, error.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // FETCH SINGLE SIGN WITH FALLBACK
  // ═══════════════════════════════════════════════════════════════

  async fetchSignHoroscope(sign: HoroscopeSign): Promise<HoroscopeItem | null> {
    const config = HOROSCOPE_CONFIG[sign];
    console.log(`🔮 Fetching horoscope for ${config.icon} ${config.label} (${config.labelHi})...`);

    let rawData: RawHoroscope | null = null;

    // Try Aztro API first
    rawData = await this.fetchFromAztro(sign);

    // Fallback to Horoscope App API
    if (!rawData) {
      console.log(`   ↳ Trying backup API for ${config.label}...`);
      rawData = await this.fetchFromHoroscopeApp(sign);
    }

    // If all APIs fail, return null
    if (!rawData || !rawData.description) {
      console.log(`   ↳ ❌ Failed to fetch horoscope for ${config.label}`);
      fetchTracker.failureCount++;
      return null;
    }

    // Transform to HoroscopeItem
    const horoscopeItem = this.transformToHoroscopeItem(sign, rawData);
    fetchTracker.successCount++;

    console.log(`   ↳ ✅ Got horoscope for ${config.label}`);
    return horoscopeItem;
  }

  // ═══════════════════════════════════════════════════════════════
  // FETCH ALL 12 SIGNS (Batch Method)
  // ═══════════════════════════════════════════════════════════════

  async fetchAllHoroscopes(): Promise<HoroscopeItem[]> {
    console.log('\n═══════════════════════════════════════');
    console.log('🔮 FETCHING DAILY HOROSCOPES (12 RASHIS)');
    console.log('═══════════════════════════════════════\n');

    const results: HoroscopeItem[] = [];
    const signs = getAllSigns();

    // Reset tracker for new batch
    fetchTracker.successCount = 0;
    fetchTracker.failureCount = 0;
    fetchTracker.lastFetchDate = this.getTodayDateString();

    for (const sign of signs) {
      try {
        const horoscope = await this.fetchSignHoroscope(sign);

        if (horoscope) {
          results.push(horoscope);
        }

        // Small delay between requests to be nice to the API
        await this.delay(300);
      } catch (error: any) {
        console.error(`❌ Error fetching ${sign}:`, error.message);
        fetchTracker.failureCount++;
      }
    }

    // Log summary
    console.log('\n───────────────────────────────────────');
    console.log('📊 HOROSCOPE FETCH SUMMARY:');
    console.log(`   ✅ Success: ${fetchTracker.successCount}/12`);
    console.log(`   ❌ Failed: ${fetchTracker.failureCount}/12`);
    console.log(`   📅 Date: ${fetchTracker.lastFetchDate}`);
    console.log('───────────────────────────────────────\n');

    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // TRANSFORM RAW DATA TO HOROSCOPE ITEM
  // ═══════════════════════════════════════════════════════════════

  private transformToHoroscopeItem(
    sign: HoroscopeSign,
    rawData: RawHoroscope
  ): HoroscopeItem {
    const config = HOROSCOPE_CONFIG[sign];
    const now = new Date();

    // Create validFor date (today at midnight)
    const validFor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      sign: sign,
      icon: config.icon,
      label: config.label,
      labelHi: config.labelHi,
      dateRange: config.dateRange,
      prediction: this.cleanPrediction(rawData.description),
      predictionHi: undefined,  // Can be added later with translation API
      mood: rawData.mood || 'Neutral',
      moodHi: undefined,
      luckyNumber: rawData.lucky_number || this.generateRandomLuckyNumber(),
      luckyColor: rawData.color || config.color,
      luckyTime: rawData.lucky_time || this.generateRandomLuckyTime(),
      compatibility: rawData.compatibility || this.getRandomCompatibility(sign),
      fetchedAt: now,
      validFor: validFor,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Clean prediction text
  // ═══════════════════════════════════════════════════════════════

  private cleanPrediction(text: string): string {
    if (!text) return '';

    return text
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/^\s+|\s+$/g, '')      // Trim
      .replace(/\n/g, ' ')            // Remove newlines
      .trim();
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Generate fallback lucky number
  // ═══════════════════════════════════════════════════════════════

  private generateRandomLuckyNumber(): string {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    return `${num1}, ${num2}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Generate fallback lucky time
  // ═══════════════════════════════════════════════════════════════

  private generateRandomLuckyTime(): string {
    const hours = [
      '9 AM', '10 AM', '11 AM', '12 PM',
      '2 PM', '3 PM', '4 PM', '5 PM', '7 PM'
    ];
    const randomIndex = Math.floor(Math.random() * hours.length);
    return hours[randomIndex];
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Get random compatibility sign
  // ═══════════════════════════════════════════════════════════════

  private getRandomCompatibility(currentSign: HoroscopeSign): string {
    // Compatibility based on elements
    const elementCompatibility: Record<string, HoroscopeSign[]> = {
      fire: [HoroscopeSign.ARIES, HoroscopeSign.LEO, HoroscopeSign.SAGITTARIUS],
      earth: [HoroscopeSign.TAURUS, HoroscopeSign.VIRGO, HoroscopeSign.CAPRICORN],
      air: [HoroscopeSign.GEMINI, HoroscopeSign.LIBRA, HoroscopeSign.AQUARIUS],
      water: [HoroscopeSign.CANCER, HoroscopeSign.SCORPIO, HoroscopeSign.PISCES],
    };

    const currentElement = HOROSCOPE_CONFIG[currentSign].element;
    const compatibleSigns = elementCompatibility[currentElement].filter(
      (s) => s !== currentSign
    );

    const randomSign = compatibleSigns[Math.floor(Math.random() * compatibleSigns.length)];
    return HOROSCOPE_CONFIG[randomSign].label;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Get today's date string
  // ═══════════════════════════════════════════════════════════════

  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];  // YYYY-MM-DD
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Delay between requests
  // ═══════════════════════════════════════════════════════════════

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════════════
  // CHECK IF ALREADY FETCHED TODAY
  // ═══════════════════════════════════════════════════════════════

  hasAlreadyFetchedToday(): boolean {
    return fetchTracker.lastFetchDate === this.getTodayDateString();
  }

  // ═══════════════════════════════════════════════════════════════
  // GET FETCH STATS
  // ═══════════════════════════════════════════════════════════════

  getFetchStats(): {
    lastFetchDate: string | null;
    successCount: number;
    failureCount: number;
    totalSigns: number;
  } {
    return {
      lastFetchDate: fetchTracker.lastFetchDate,
      successCount: fetchTracker.successCount,
      failureCount: fetchTracker.failureCount,
      totalSigns: 12,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // GET HOROSCOPE FOR USER'S SIGN (Single sign quick fetch)
  // ═══════════════════════════════════════════════════════════════

  async getHoroscopeForSign(sign: HoroscopeSign): Promise<HoroscopeItem | null> {
    return this.fetchSignHoroscope(sign);
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDATE SIGN STRING
  // ═══════════════════════════════════════════════════════════════

  isValidSign(sign: string): sign is HoroscopeSign {
    return Object.values(HoroscopeSign).includes(sign as HoroscopeSign);
  }

  // ═══════════════════════════════════════════════════════════════
  // GET SIGN FROM DATE OF BIRTH
  // ═══════════════════════════════════════════════════════════════

  getSignFromBirthDate(month: number, day: number): HoroscopeSign {
    // Month is 1-indexed (1 = January)
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return HoroscopeSign.ARIES;
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return HoroscopeSign.TAURUS;
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return HoroscopeSign.GEMINI;
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return HoroscopeSign.CANCER;
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return HoroscopeSign.LEO;
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return HoroscopeSign.VIRGO;
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return HoroscopeSign.LIBRA;
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return HoroscopeSign.SCORPIO;
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return HoroscopeSign.SAGITTARIUS;
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return HoroscopeSign.CAPRICORN;
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return HoroscopeSign.AQUARIUS;
    return HoroscopeSign.PISCES;  // Feb 19 - Mar 20
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

export const horoscopeService = new HoroscopeService();