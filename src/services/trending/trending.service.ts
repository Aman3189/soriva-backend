// ═══════════════════════════════════════════════════════════════
// TRENDING SERVICE - Main Orchestrator
// File: src/services/trending/trending.service.ts
//
// Combines News (10 categories) + Horoscope (12 rashis)
// Schedule: News every 3 hours, Horoscope daily 6 AM
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import { newsService } from './news.service';
import { horoscopeService } from './horoscope.service';
import {
  NewsCategory,
  NEWS_CATEGORY_CONFIG,
  NewsItem,
  HoroscopeSign,
  HOROSCOPE_CONFIG,
  HoroscopeItem,
  TrendingNewsResponse,
  HoroscopeResponse,
  SingleHoroscopeResponse,
  TrendingResponse,
  NewsPopupData,
  HoroscopePopupData,
  FetchLog,
  generateNewsChatPrompt,
  generateHoroscopeChatPrompt,
  getSortedCategories,
  NEWS_EXPIRY_HOURS,
} from '../../types/trending.types';

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const CONFIG = {
  news: {
    cacheExpiryHours: NEWS_EXPIRY_HOURS,  // 3 hours
    itemsPerCategory: 5,
  },
  horoscope: {
    cacheExpiryHours: 24,  // 1 day
  },
};

// ─────────────────────────────────────────────────────────────────
// MAIN SERVICE CLASS
// ─────────────────────────────────────────────────────────────────

export class TrendingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // ═══════════════════════════════════════════════════════════════
  // NEWS: GET ALL CACHED NEWS
  // ═══════════════════════════════════════════════════════════════

  async getAllNews(): Promise<TrendingNewsResponse> {
    const now = new Date();

    // Get cached news that hasn't expired
    const cachedNews = await this.prisma.trendingTopic.findMany({
      where: {
        expiresAt: { gt: now },
      },
      orderBy: [
        { category: 'asc' },
        { rank: 'asc' },
      ],
    });

    // Transform to NewsItem format
    const newsItems: NewsItem[] = cachedNews.map((item) => ({
      id: item.id,
      title: item.headline,
      slug: item.slug,
      summary: item.summary,
      source: item.source || '',
      sourceUrl: item.sourceUrl || '',
      imageUrl: item.imageUrl,
      category: item.category as NewsCategory,
      icon: item.icon,
      color: NEWS_CATEGORY_CONFIG[item.category as NewsCategory]?.color || '#666',
      publishedAt: item.trendingAt,
      fetchedAt: item.trendingAt,
      expiresAt: item.expiresAt,
    }));

    // Count by category
    const byCategory: Record<NewsCategory, number> = {} as Record<NewsCategory, number>;
    Object.values(NewsCategory).forEach((cat) => {
      byCategory[cat] = newsItems.filter((n) => n.category === cat).length;
    });

    // Get last update time
    const lastUpdated = cachedNews[0]?.trendingAt || now;
    const nextUpdate = new Date(lastUpdated.getTime() + CONFIG.news.cacheExpiryHours * 60 * 60 * 1000);

    return {
      success: true,
      data: {
        news: newsItems,
        categories: getSortedCategories(),
        lastUpdated: lastUpdated.toISOString(),
        nextUpdate: nextUpdate.toISOString(),
      },
      meta: {
        total: newsItems.length,
        byCategory,
        cached: true,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // NEWS: GET BY CATEGORY
  // ═══════════════════════════════════════════════════════════════

  async getNewsByCategory(category: NewsCategory): Promise<NewsItem[]> {
    const now = new Date();

    const cachedNews = await this.prisma.trendingTopic.findMany({
      where: {
        category: category,
        expiresAt: { gt: now },
      },
      orderBy: { rank: 'asc' },
      take: CONFIG.news.itemsPerCategory,
    });

    return cachedNews.map((item) => ({
      id: item.id,
      title: item.headline,
      slug: item.slug,
      summary: item.summary,
      source: item.source || '',
      sourceUrl: item.sourceUrl || '',
      imageUrl: item.imageUrl,
      category: item.category as NewsCategory,
      icon: item.icon,
      color: NEWS_CATEGORY_CONFIG[item.category as NewsCategory]?.color || '#666',
      publishedAt: item.trendingAt,
      fetchedAt: item.trendingAt,
      expiresAt: item.expiresAt,
    }));
  }

  // ═══════════════════════════════════════════════════════════════
  // NEWS: FETCH AND CACHE (Called by Cron)
  // ═══════════════════════════════════════════════════════════════
  async fetchAndCacheNews(): Promise<{ success: boolean; count: number }> {
    console.log('\n═══════════════════════════════════════');
    console.log('🔄 TRENDING SERVICE: Fetching News');
    console.log('═══════════════════════════════════════\n');

    const startTime = Date.now();

    try {
      let allNews: NewsItem[] = [];
      let apiUsed = 'rss';

      // ═══════════════════════════════════════════════════════════
      // PRIORITY 1: RSS FEEDS (FREE & UNLIMITED)
      // ═══════════════════════════════════════════════════════════
      console.log('📡 Trying RSS feeds (FREE)...');
      
      const { rssService } = await import('./rss.service');
      const rssData = await rssService.fetchAll();
      
      if (rssData.india.length > 0 || rssData.international.length > 0) {
        allNews = [...rssData.india, ...rssData.international];
        apiUsed = 'rss';
        console.log(`✅ RSS fetched: ${allNews.length} items`);
      }

      // ═══════════════════════════════════════════════════════════
      // PRIORITY 2: NewsAPI/GNews (FALLBACK - Limited)
      // ═══════════════════════════════════════════════════════════
      if (allNews.length === 0) {
        console.log('⚠️ RSS failed, trying NewsAPI/GNews fallback...');
        
        const newsMap = await newsService.fetchAllCategories();
        
        newsMap.forEach((items, category) => {
          items.forEach((item) => {
            allNews.push({ ...item, id: undefined });
          });
        });
        
        apiUsed = 'newsapi';
        console.log(`✅ NewsAPI/GNews fetched: ${allNews.length} items`);
      }

      // ═══════════════════════════════════════════════════════════
      // SAVE TO DATABASE
      // ═══════════════════════════════════════════════════════════
      if (allNews.length > 0) {
        await this.clearExpiredNews();
        await this.saveNewsToDb(allNews);
      }

      // Log the fetch
      await this.logFetch({
        type: 'news',
        status: 'success',
        itemsFetched: allNews.length,
        apiUsed: apiUsed as any,
        responseTime: Date.now() - startTime,
        fetchedAt: new Date(),
      });

      console.log(`\n✅ News fetch complete: ${allNews.length} items via ${apiUsed.toUpperCase()}`);

      return { success: true, count: allNews.length };

    } catch (error: any) {
      console.error('❌ Error fetching news:', error.message);

      await this.logFetch({
        type: 'news',
        status: 'error',
        itemsFetched: 0,
        apiUsed: 'newsapi',
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
        fetchedAt: new Date(),
      });

      return { success: false, count: 0 };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HOROSCOPE: GET ALL CACHED
  // ═══════════════════════════════════════════════════════════════

  async getAllHoroscopes(): Promise<HoroscopeResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cachedHoroscopes = await this.prisma.horoscope.findMany({
      where: {
        validFor: { gte: today },
      },
      orderBy: { sign: 'asc' },
    });

    const horoscopes: HoroscopeItem[] = cachedHoroscopes.map((h) => ({
      id: h.id,
      sign: h.sign as HoroscopeSign,
      icon: HOROSCOPE_CONFIG[h.sign as HoroscopeSign]?.icon || '⭐',
      label: HOROSCOPE_CONFIG[h.sign as HoroscopeSign]?.label || h.sign,
      labelHi: HOROSCOPE_CONFIG[h.sign as HoroscopeSign]?.labelHi || '',
      dateRange: HOROSCOPE_CONFIG[h.sign as HoroscopeSign]?.dateRange || '',
      prediction: h.prediction,
      predictionHi: h.predictionHi || undefined,
      mood: h.mood,
      moodHi: h.moodHi || undefined,
      luckyNumber: h.luckyNumber,
      luckyColor: h.luckyColor,
      luckyTime: h.luckyTime,
      compatibility: h.compatibility,
      fetchedAt: h.fetchedAt,
      validFor: h.validFor,
    }));

    return {
      success: true,
      data: {
        horoscopes,
        validFor: today.toISOString().split('T')[0],
        lastUpdated: cachedHoroscopes[0]?.fetchedAt?.toISOString() || new Date().toISOString(),
      },
      meta: {
        total: horoscopes.length,
        cached: true,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HOROSCOPE: GET BY SIGN
  // ═══════════════════════════════════════════════════════════════

  async getHoroscopeBySign(sign: HoroscopeSign): Promise<SingleHoroscopeResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let horoscope = await this.prisma.horoscope.findFirst({
      where: {
        sign: sign,
        validFor: { gte: today },
      },
    });

    // If not cached, fetch fresh
    if (!horoscope) {
      console.log(`🔮 Cache miss for ${sign}, fetching fresh...`);
      const freshHoroscope = await horoscopeService.fetchSignHoroscope(sign);

      if (freshHoroscope) {
        await this.saveHoroscopeToDb([freshHoroscope]);

        return {
          success: true,
          data: freshHoroscope,
          meta: { cached: false },
        };
      }

      // Return error response if fetch failed
      return {
        success: false,
        data: {} as HoroscopeItem,
        meta: { cached: false },
      };
    }

    const config = HOROSCOPE_CONFIG[sign];

    return {
      success: true,
      data: {
        id: horoscope.id,
        sign: horoscope.sign as HoroscopeSign,
        icon: config.icon,
        label: config.label,
        labelHi: config.labelHi,
        dateRange: config.dateRange,
        prediction: horoscope.prediction,
        predictionHi: horoscope.predictionHi || undefined,
        mood: horoscope.mood,
        moodHi: horoscope.moodHi || undefined,
        luckyNumber: horoscope.luckyNumber,
        luckyColor: horoscope.luckyColor,
        luckyTime: horoscope.luckyTime,
        compatibility: horoscope.compatibility,
        fetchedAt: horoscope.fetchedAt,
        validFor: horoscope.validFor,
      },
      meta: { cached: true },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HOROSCOPE: FETCH AND CACHE (Called by Cron)
  // ═══════════════════════════════════════════════════════════════

  async fetchAndCacheHoroscopes(): Promise<{ success: boolean; count: number }> {
    console.log('\n═══════════════════════════════════════');
    console.log('🔄 TRENDING SERVICE: Fetching Horoscopes');
    console.log('═══════════════════════════════════════\n');

    const startTime = Date.now();

    try {
      // Check if already fetched today
      if (horoscopeService.hasAlreadyFetchedToday()) {
        console.log('✅ Horoscopes already fetched today, skipping...');
        return { success: true, count: 12 };
      }

      // Fetch all horoscopes
      const horoscopes = await horoscopeService.fetchAllHoroscopes();

      // Clear old and save new
      await this.clearOldHoroscopes();
      await this.saveHoroscopeToDb(horoscopes);

      // Log the fetch
      await this.logFetch({
        type: 'horoscope',
        status: 'success',
        itemsFetched: horoscopes.length,
        apiUsed: 'aztro',
        responseTime: Date.now() - startTime,
        fetchedAt: new Date(),
      });

      return { success: true, count: horoscopes.length };

    } catch (error: any) {
      console.error('❌ Error fetching horoscopes:', error.message);

      await this.logFetch({
        type: 'horoscope',
        status: 'error',
        itemsFetched: 0,
        apiUsed: 'aztro',
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
        fetchedAt: new Date(),
      });

      return { success: false, count: 0 };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // COMBINED: GET NEWS + HOROSCOPE
  // ═══════════════════════════════════════════════════════════════

  async getTrendingData(): Promise<TrendingResponse> {
    const [newsResponse, horoscopeResponse] = await Promise.all([
      this.getAllNews(),
      this.getAllHoroscopes(),
    ]);

    return {
      success: true,
      data: {
        news: newsResponse.data.news,
        horoscopes: horoscopeResponse.data.horoscopes,
        lastUpdated: new Date().toISOString(),
      },
      meta: {
        newsCount: newsResponse.meta.total,
        horoscopeCount: horoscopeResponse.meta.total,
        cached: true,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // POPUP DATA: NEWS
  // ═══════════════════════════════════════════════════════════════

  async getNewsPopupData(slug: string): Promise<NewsPopupData | null> {
    const news = await this.prisma.trendingTopic.findFirst({
      where: { slug },
    });

    if (!news) return null;

    const config = NEWS_CATEGORY_CONFIG[news.category as NewsCategory];

    return {
      title: news.headline,
      summary: news.summary,
      source: news.source || '',
      sourceUrl: news.sourceUrl || '',
      imageUrl: news.imageUrl,
      category: news.category as NewsCategory,
      icon: news.icon,
      color: config?.color || '#666',
      publishedAt: news.trendingAt.toISOString(),
      chatPrompt: generateNewsChatPrompt(news.headline),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // POPUP DATA: HOROSCOPE
  // ═══════════════════════════════════════════════════════════════

  async getHoroscopePopupData(sign: HoroscopeSign): Promise<HoroscopePopupData | null> {
    const response = await this.getHoroscopeBySign(sign);

    if (!response.success) return null;

    const h = response.data;
    const config = HOROSCOPE_CONFIG[sign];

    return {
      sign: h.sign,
      icon: config.icon,
      label: config.label,
      labelHi: config.labelHi,
      dateRange: config.dateRange,
      prediction: h.prediction,
      mood: h.mood,
      luckyNumber: h.luckyNumber,
      luckyColor: h.luckyColor,
      compatibility: h.compatibility,
      chatPrompt: generateHoroscopeChatPrompt(sign, config.labelHi),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // DATABASE OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  private async saveNewsToDb(newsItems: NewsItem[]): Promise<void> {
    let rank = 1;

    for (const item of newsItems) {
      await this.prisma.trendingTopic.create({
        data: {
          topic: item.title.substring(0, 100),  // Short topic name
          slug: item.slug,
          headline: item.title,
          summary: item.summary,
          source: item.source,
          sourceUrl: item.sourceUrl,
          imageUrl: item.imageUrl,
          category: item.category,
          icon: item.icon,
          scope: 'NATIONAL',
          region: null,
          country: 'IN',
          searchVolume: null,
          rank: rank++,
          trendingAt: item.publishedAt,
          expiresAt: item.expiresAt,
        },
      });
    }

    console.log(`💾 Saved ${newsItems.length} news items to database`);
  }

  private async saveHoroscopeToDb(horoscopes: HoroscopeItem[]): Promise<void> {
    for (const h of horoscopes) {
      await this.prisma.horoscope.upsert({
        where: {
          sign_validFor: {
            sign: h.sign,
            validFor: h.validFor,
          },
        },
        update: {
          prediction: h.prediction,
          predictionHi: h.predictionHi,
          mood: h.mood,
          moodHi: h.moodHi,
          luckyNumber: h.luckyNumber,
          luckyColor: h.luckyColor,
          luckyTime: h.luckyTime,
          compatibility: h.compatibility,
          fetchedAt: h.fetchedAt,
        },
        create: {
          sign: h.sign,
          prediction: h.prediction,
          predictionHi: h.predictionHi,
          mood: h.mood,
          moodHi: h.moodHi,
          luckyNumber: h.luckyNumber,
          luckyColor: h.luckyColor,
          luckyTime: h.luckyTime,
          compatibility: h.compatibility,
          fetchedAt: h.fetchedAt,
          validFor: h.validFor,
        },
      });
    }

    console.log(`💾 Saved ${horoscopes.length} horoscopes to database`);
  }

  private async clearExpiredNews(): Promise<void> {
    const deleted = await this.prisma.trendingTopic.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (deleted.count > 0) {
      console.log(`🗑️ Cleared ${deleted.count} expired news items`);
    }
  }

  private async clearOldHoroscopes(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const deleted = await this.prisma.horoscope.deleteMany({
      where: {
        validFor: { lt: yesterday },
      },
    });

    if (deleted.count > 0) {
      console.log(`🗑️ Cleared ${deleted.count} old horoscopes`);
    }
  }

  private async logFetch(log: FetchLog): Promise<void> {
    await this.prisma.trendingFetchLog.create({
      data: {
        fetchType: log.type.toUpperCase(),
        region: log.category || log.sign || 'ALL',
        status: log.status.toUpperCase(),
        topicsFound: log.itemsFetched,
        errorMessage: log.errorMessage,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════

  async getHealthStatus(): Promise<{
    news: { count: number; lastUpdate: string | null; isStale: boolean };
    horoscope: { count: number; lastUpdate: string | null; isStale: boolean };
    apiStatus: { newsApi: boolean; gnews: boolean };
  }> {
    const now = new Date();

    // News status
    const newsCount = await this.prisma.trendingTopic.count({
      where: { expiresAt: { gt: now } },
    });

    const latestNews = await this.prisma.trendingTopic.findFirst({
      orderBy: { trendingAt: 'desc' },
    });

    const newsStaleThreshold = new Date(now.getTime() - CONFIG.news.cacheExpiryHours * 60 * 60 * 1000);
    const isNewsStale = !latestNews || latestNews.trendingAt < newsStaleThreshold;

    // Horoscope status
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const horoscopeCount = await this.prisma.horoscope.count({
      where: { validFor: { gte: today } },
    });

    const latestHoroscope = await this.prisma.horoscope.findFirst({
      orderBy: { fetchedAt: 'desc' },
    });

    const isHoroscopeStale = horoscopeCount < 12;

    // API status
    const apiConfig = newsService.isConfigured();

    return {
      news: {
        count: newsCount,
        lastUpdate: latestNews?.trendingAt?.toISOString() || null,
        isStale: isNewsStale,
      },
      horoscope: {
        count: horoscopeCount,
        lastUpdate: latestHoroscope?.fetchedAt?.toISOString() || null,
        isStale: isHoroscopeStale,
      },
      apiStatus: {
        newsApi: apiConfig.newsApi,
        gnews: apiConfig.gnews,
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

export const trendingService = new TrendingService();