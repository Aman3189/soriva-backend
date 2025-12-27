// ═══════════════════════════════════════════════════════════════
// TRENDING TOPICS & HOROSCOPE - TYPESCRIPT TYPES
// File: src/types/trending.types.ts
// Updated: Category-based news (10) + Horoscope (12 rashis)
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// NEWS CATEGORIES ENUM (10 Categories)
// ─────────────────────────────────────────────────────────────────

export enum NewsCategory {
  ENTERTAINMENT = 'entertainment',  // 🎬 Movies, Celebs, OTT
  SPORTS = 'sports',                // 🏏 Cricket, Football
  TECHNOLOGY = 'technology',        // 📱 Gadgets, AI, Apps
  BUSINESS = 'business',            // 💰 Stocks, Markets, Economy
  GENERAL = 'general',              // 📰 General News
  SCIENCE = 'science',              // 🔬 Research, Space, Discovery
  HEALTH = 'health',                // 🏥 Medical, Fitness, Wellness
  POLITICS = 'politics',            // 🏛️ Government, Elections
  WORLD = 'world',                  // 🌍 International News
  LIFESTYLE = 'lifestyle'           // ✨ Fashion, Food, Travel
}

// ─────────────────────────────────────────────────────────────────
// NEWS CATEGORY CONFIG
// ─────────────────────────────────────────────────────────────────

export const NEWS_CATEGORY_CONFIG: Record<NewsCategory, {
  icon: string;
  label: string;
  labelHi: string;
  color: string;
  newsApiCategory: string;  // NewsAPI supported: business, entertainment, general, health, science, sports, technology
  priority: number;         // Display order (1 = highest)
}> = {
  [NewsCategory.ENTERTAINMENT]: {
    icon: '🎬',
    label: 'Entertainment',
    labelHi: 'मनोरंजन',
    color: '#FF6B6B',
    newsApiCategory: 'entertainment',
    priority: 1
  },
  [NewsCategory.SPORTS]: {
    icon: '🏏',
    label: 'Sports',
    labelHi: 'खेल',
    color: '#4ECDC4',
    newsApiCategory: 'sports',
    priority: 2
  },
  [NewsCategory.TECHNOLOGY]: {
    icon: '📱',
    label: 'Technology',
    labelHi: 'तकनीक',
    color: '#45B7D1',
    newsApiCategory: 'technology',
    priority: 3
  },
  [NewsCategory.BUSINESS]: {
    icon: '💰',
    label: 'Business',
    labelHi: 'व्यापार',
    color: '#96CEB4',
    newsApiCategory: 'business',
    priority: 4
  },
  [NewsCategory.GENERAL]: {
    icon: '📰',
    label: 'General',
    labelHi: 'सामान्य',
    color: '#9B59B6',
    newsApiCategory: 'general',
    priority: 5
  },
  [NewsCategory.SCIENCE]: {
    icon: '🔬',
    label: 'Science',
    labelHi: 'विज्ञान',
    color: '#3498DB',
    newsApiCategory: 'science',
    priority: 6
  },
  [NewsCategory.HEALTH]: {
    icon: '🏥',
    label: 'Health',
    labelHi: 'स्वास्थ्य',
    color: '#2ECC71',
    newsApiCategory: 'health',
    priority: 7
  },
  [NewsCategory.POLITICS]: {
    icon: '🏛️',
    label: 'Politics',
    labelHi: 'राजनीति',
    color: '#E74C3C',
    newsApiCategory: 'general',  // NewsAPI doesn't have politics, use general
    priority: 8
  },
  [NewsCategory.WORLD]: {
    icon: '🌍',
    label: 'World',
    labelHi: 'विश्व',
    color: '#1ABC9C',
    newsApiCategory: 'general',  // Fetch with country filter
    priority: 9
  },
  [NewsCategory.LIFESTYLE]: {
    icon: '✨',
    label: 'Lifestyle',
    labelHi: 'जीवनशैली',
    color: '#F39C12',
    newsApiCategory: 'entertainment',  // Closest match
    priority: 10
  }
};

// ─────────────────────────────────────────────────────────────────
// HOROSCOPE SIGNS ENUM (12 Rashis)
// ─────────────────────────────────────────────────────────────────

export enum HoroscopeSign {
  ARIES = 'aries',
  TAURUS = 'taurus',
  GEMINI = 'gemini',
  CANCER = 'cancer',
  LEO = 'leo',
  VIRGO = 'virgo',
  LIBRA = 'libra',
  SCORPIO = 'scorpio',
  SAGITTARIUS = 'sagittarius',
  CAPRICORN = 'capricorn',
  AQUARIUS = 'aquarius',
  PISCES = 'pisces'
}

// ─────────────────────────────────────────────────────────────────
// HOROSCOPE SIGNS CONFIG
// ─────────────────────────────────────────────────────────────────

export const HOROSCOPE_CONFIG: Record<HoroscopeSign, {
  icon: string;
  label: string;
  labelHi: string;
  dateRange: string;
  dateRangeHi: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  color: string;
}> = {
  [HoroscopeSign.ARIES]: {
    icon: '♈',
    label: 'Aries',
    labelHi: 'मेष',
    dateRange: 'Mar 21 - Apr 19',
    dateRangeHi: '21 मार्च - 19 अप्रैल',
    element: 'fire',
    color: '#FF6B6B'
  },
  [HoroscopeSign.TAURUS]: {
    icon: '♉',
    label: 'Taurus',
    labelHi: 'वृषभ',
    dateRange: 'Apr 20 - May 20',
    dateRangeHi: '20 अप्रैल - 20 मई',
    element: 'earth',
    color: '#96CEB4'
  },
  [HoroscopeSign.GEMINI]: {
    icon: '♊',
    label: 'Gemini',
    labelHi: 'मिथुन',
    dateRange: 'May 21 - Jun 20',
    dateRangeHi: '21 मई - 20 जून',
    element: 'air',
    color: '#F7DC6F'
  },
  [HoroscopeSign.CANCER]: {
    icon: '♋',
    label: 'Cancer',
    labelHi: 'कर्क',
    dateRange: 'Jun 21 - Jul 22',
    dateRangeHi: '21 जून - 22 जुलाई',
    element: 'water',
    color: '#85C1E9'
  },
  [HoroscopeSign.LEO]: {
    icon: '♌',
    label: 'Leo',
    labelHi: 'सिंह',
    dateRange: 'Jul 23 - Aug 22',
    dateRangeHi: '23 जुलाई - 22 अगस्त',
    element: 'fire',
    color: '#F5B041'
  },
  [HoroscopeSign.VIRGO]: {
    icon: '♍',
    label: 'Virgo',
    labelHi: 'कन्या',
    dateRange: 'Aug 23 - Sep 22',
    dateRangeHi: '23 अगस्त - 22 सितंबर',
    element: 'earth',
    color: '#82E0AA'
  },
  [HoroscopeSign.LIBRA]: {
    icon: '♎',
    label: 'Libra',
    labelHi: 'तुला',
    dateRange: 'Sep 23 - Oct 22',
    dateRangeHi: '23 सितंबर - 22 अक्टूबर',
    element: 'air',
    color: '#D7BDE2'
  },
  [HoroscopeSign.SCORPIO]: {
    icon: '♏',
    label: 'Scorpio',
    labelHi: 'वृश्चिक',
    dateRange: 'Oct 23 - Nov 21',
    dateRangeHi: '23 अक्टूबर - 21 नवंबर',
    element: 'water',
    color: '#922B21'
  },
  [HoroscopeSign.SAGITTARIUS]: {
    icon: '♐',
    label: 'Sagittarius',
    labelHi: 'धनु',
    dateRange: 'Nov 22 - Dec 21',
    dateRangeHi: '22 नवंबर - 21 दिसंबर',
    element: 'fire',
    color: '#8E44AD'
  },
  [HoroscopeSign.CAPRICORN]: {
    icon: '♑',
    label: 'Capricorn',
    labelHi: 'मकर',
    dateRange: 'Dec 22 - Jan 19',
    dateRangeHi: '22 दिसंबर - 19 जनवरी',
    element: 'earth',
    color: '#5D6D7E'
  },
  [HoroscopeSign.AQUARIUS]: {
    icon: '♒',
    label: 'Aquarius',
    labelHi: 'कुंभ',
    dateRange: 'Jan 20 - Feb 18',
    dateRangeHi: '20 जनवरी - 18 फरवरी',
    element: 'air',
    color: '#3498DB'
  },
  [HoroscopeSign.PISCES]: {
    icon: '♓',
    label: 'Pisces',
    labelHi: 'मीन',
    dateRange: 'Feb 19 - Mar 20',
    dateRangeHi: '19 फरवरी - 20 मार्च',
    element: 'water',
    color: '#1ABC9C'
  }
};

// ─────────────────────────────────────────────────────────────────
// NEWS INTERFACES
// ─────────────────────────────────────────────────────────────────

// Raw article from NewsAPI/GNews
export interface RawNewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
}

// Processed news item for DB/Frontend
export interface NewsItem {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  source: string;
  sourceUrl: string;
  imageUrl: string | null;
  category: NewsCategory;
  icon: string;
  color: string;
  publishedAt: Date;
  fetchedAt: Date;
  expiresAt: Date;
}

// ─────────────────────────────────────────────────────────────────
// HOROSCOPE INTERFACES
// ─────────────────────────────────────────────────────────────────

// Raw horoscope from Aztro API
export interface RawHoroscope {
  date_range: string;
  current_date: string;
  description: string;
  compatibility: string;
  mood: string;
  color: string;
  lucky_number: string;
  lucky_time: string;
}

// Processed horoscope for DB/Frontend
export interface HoroscopeItem {
  id?: string;
  sign: HoroscopeSign;
  icon: string;
  label: string;
  labelHi: string;
  dateRange: string;
  prediction: string;
  predictionHi?: string;  // Optional Hindi translation
  mood: string;
  moodHi?: string;
  luckyNumber: string;
  luckyColor: string;
  luckyTime: string;
  compatibility: string;
  fetchedAt: Date;
  validFor: Date;  // Date this horoscope is valid for
}

// ─────────────────────────────────────────────────────────────────
// API RESPONSE INTERFACES
// ─────────────────────────────────────────────────────────────────

// News API Response
export interface TrendingNewsResponse {
  success: boolean;
  data: {
    news: NewsItem[];
    categories: NewsCategory[];
    lastUpdated: string;
    nextUpdate: string;
  };
  meta: {
    total: number;
    byCategory: Record<NewsCategory, number>;
    cached: boolean;
  };
}

// Horoscope API Response
export interface HoroscopeResponse {
  success: boolean;
  data: {
    horoscopes: HoroscopeItem[];
    validFor: string;
    lastUpdated: string;
  };
  meta: {
    total: number;
    cached: boolean;
  };
}

// Single Horoscope Response
export interface SingleHoroscopeResponse {
  success: boolean;
  data: HoroscopeItem;
  meta: {
    cached: boolean;
  };
}

// Combined Trending Response (News + Horoscope)
export interface TrendingResponse {
  success: boolean;
  data: {
    news: NewsItem[];
    horoscopes: HoroscopeItem[];
    lastUpdated: string;
  };
  meta: {
    newsCount: number;
    horoscopeCount: number;
    cached: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────
// POPUP DATA FOR FRONTEND
// ─────────────────────────────────────────────────────────────────

// News Popup
export interface NewsPopupData {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  imageUrl: string | null;
  category: NewsCategory;
  icon: string;
  color: string;
  publishedAt: string;
  chatPrompt: string;  // Pre-filled: "Tell me more about [title]"
}

// Horoscope Popup
export interface HoroscopePopupData {
  sign: HoroscopeSign;
  icon: string;
  label: string;
  labelHi: string;
  dateRange: string;
  prediction: string;
  mood: string;
  luckyNumber: string;
  luckyColor: string;
  compatibility: string;
  chatPrompt: string;  // Pre-filled: "Tell me more about my horoscope today"
}

// ─────────────────────────────────────────────────────────────────
// FETCH LOG INTERFACE
// ─────────────────────────────────────────────────────────────────

export interface FetchLog {
  id?: string;
  type: 'news' | 'horoscope';
  category?: NewsCategory;
  sign?: HoroscopeSign;
  status: 'success' | 'error';
  itemsFetched: number;
  apiUsed: 'newsapi' | 'gnews' | 'aztro';
  responseTime: number;  // in ms
  errorMessage?: string;
  fetchedAt: Date;
}

// ─────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    .trim();
}

/**
 * Get category config by category enum
 */
export function getCategoryConfig(category: NewsCategory) {
  return NEWS_CATEGORY_CONFIG[category];
}

/**
 * Get horoscope config by sign enum
 */
export function getHoroscopeConfig(sign: HoroscopeSign) {
  return HOROSCOPE_CONFIG[sign];
}

/**
 * Get all news categories sorted by priority
 */
export function getSortedCategories(): NewsCategory[] {
  return Object.values(NewsCategory).sort((a, b) => {
    return NEWS_CATEGORY_CONFIG[a].priority - NEWS_CATEGORY_CONFIG[b].priority;
  });
}

/**
 * Get all horoscope signs in order
 */
export function getAllSigns(): HoroscopeSign[] {
  return Object.values(HoroscopeSign);
}

/**
 * Generate chat prompt for news item
 */
export function generateNewsChatPrompt(title: string): string {
  return `Tell me more about: ${title}`;
}

/**
 * Generate chat prompt for horoscope
 */
export function generateHoroscopeChatPrompt(sign: HoroscopeSign, labelHi: string): string {
  return `Tell me more about today's horoscope for ${HOROSCOPE_CONFIG[sign].label} (${labelHi})`;
}

/**
 * Check if news item is expired
 */
export function isNewsExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Check if horoscope is valid for today
 */
export function isHoroscopeValidToday(validFor: Date): boolean {
  const today = new Date();
  const validDate = new Date(validFor);
  return (
    today.getFullYear() === validDate.getFullYear() &&
    today.getMonth() === validDate.getMonth() &&
    today.getDate() === validDate.getDate()
  );
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

// News refresh interval: 3 hours
export const NEWS_REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000;
export const NEWS_REFRESH_INTERVAL_CRON = '0 */3 * * *';  // Every 3 hours

// Horoscope refresh: Once daily at 6 AM IST
export const HOROSCOPE_REFRESH_CRON = '0 6 * * *';  // 6:00 AM daily

// News expiry: 3 hours after fetch
export const NEWS_EXPIRY_HOURS = 3;

// Items per category
export const NEWS_PER_CATEGORY = 5;

// Total API calls per day (NewsAPI: 100 free)
// 10 categories × 8 fetches/day = 80 calls (within 100 limit)
export const MAX_NEWS_API_CALLS_PER_DAY = 80;