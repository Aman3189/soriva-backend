// ═══════════════════════════════════════════════════════════════
// NEWS SERVICE - Category-Based News Fetcher
// File: src/services/trending/news.service.ts
//
// Fetches news headlines for 10 categories
// Uses: NewsAPI.org (100/day FREE) + GNews.io (100/day FREE backup)
// Schedule: Every 3 hours = 8 fetches/day = 80 calls (within limit)
// ═══════════════════════════════════════════════════════════════

import axios, { AxiosInstance } from 'axios';
import {
  NewsCategory,
  NEWS_CATEGORY_CONFIG,
  RawNewsArticle,
  NewsItem,
  generateSlug,
  NEWS_PER_CATEGORY,
  NEWS_EXPIRY_HOURS
} from '../../types/trending.types';

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const CONFIG = {
  newsApi: {
    baseUrl: 'https://newsapi.org/v2',
    apiKey: process.env.NEWSAPI_KEY || '',
    dailyLimit: 100,
  },
  gnews: {
    baseUrl: 'https://gnews.io/api/v4',
    apiKey: process.env.GNEWS_KEY || '',
    dailyLimit: 100,
  },
  timeout: 15000,
  defaultCountry: 'in',
  itemsPerCategory: NEWS_PER_CATEGORY,  // 5 items per category
};

// ─────────────────────────────────────────────────────────────────
// REQUEST TRACKING (Stay within free limits)
// ─────────────────────────────────────────────────────────────────

interface RequestTracker {
  newsApi: { count: number; resetTime: Date };
  gnews: { count: number; resetTime: Date };
}

const requestTracker: RequestTracker = {
  newsApi: { count: 0, resetTime: new Date() },
  gnews: { count: 0, resetTime: new Date() },
};

function resetTrackerIfNeeded(): void {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (requestTracker.newsApi.resetTime < todayStart) {
    requestTracker.newsApi = { count: 0, resetTime: now };
  }
  if (requestTracker.gnews.resetTime < todayStart) {
    requestTracker.gnews = { count: 0, resetTime: now };
  }
}

// ─────────────────────────────────────────────────────────────────
// NEWSAPI CATEGORY MAPPING
// NewsAPI only supports: business, entertainment, general, health, science, sports, technology
// ─────────────────────────────────────────────────────────────────

const NEWSAPI_CATEGORY_MAP: Record<NewsCategory, string> = {
  [NewsCategory.ENTERTAINMENT]: 'entertainment',
  [NewsCategory.SPORTS]: 'sports',
  [NewsCategory.TECHNOLOGY]: 'technology',
  [NewsCategory.BUSINESS]: 'business',
  [NewsCategory.GENERAL]: 'general',
  [NewsCategory.SCIENCE]: 'science',
  [NewsCategory.HEALTH]: 'health',
  [NewsCategory.POLITICS]: 'general',    // No direct mapping, use general
  [NewsCategory.WORLD]: 'general',       // Fetch without country filter
  [NewsCategory.LIFESTYLE]: 'entertainment', // Closest match
};

// Categories that need search instead of top-headlines
const SEARCH_BASED_CATEGORIES: NewsCategory[] = [
  NewsCategory.POLITICS,
  NewsCategory.WORLD,
  NewsCategory.LIFESTYLE,
];

// Search keywords for categories without direct NewsAPI support
const CATEGORY_SEARCH_KEYWORDS: Partial<Record<NewsCategory, string>> = {
  [NewsCategory.POLITICS]: 'India politics government election',
  [NewsCategory.WORLD]: 'international world news global',
  [NewsCategory.LIFESTYLE]: 'lifestyle fashion travel food',
};

// ─────────────────────────────────────────────────────────────────
// MAIN SERVICE CLASS
// ─────────────────────────────────────────────────────────────────

export class NewsService {
  private newsApiClient: AxiosInstance;
  private gnewsClient: AxiosInstance;

  constructor() {
    // NewsAPI Client
    this.newsApiClient = axios.create({
      baseURL: CONFIG.newsApi.baseUrl,
      timeout: CONFIG.timeout,
      headers: {
        'X-Api-Key': CONFIG.newsApi.apiKey,
      },
    });

    // GNews Client
    this.gnewsClient = axios.create({
      baseURL: CONFIG.gnews.baseUrl,
      timeout: CONFIG.timeout,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // API AVAILABILITY CHECKS
  // ═══════════════════════════════════════════════════════════════

  private canUseNewsApi(): boolean {
    resetTrackerIfNeeded();
    return requestTracker.newsApi.count < CONFIG.newsApi.dailyLimit;
  }

  private canUseGnews(): boolean {
    resetTrackerIfNeeded();
    return requestTracker.gnews.count < CONFIG.gnews.dailyLimit;
  }

  // ═══════════════════════════════════════════════════════════════
  // NEWSAPI: GET TOP HEADLINES BY CATEGORY
  // ═══════════════════════════════════════════════════════════════

  private async fetchTopHeadlines(
    newsApiCategory: string,
    country: string = 'in'
  ): Promise<RawNewsArticle[]> {
    if (!this.canUseNewsApi()) {
      console.warn('⚠️ NewsAPI daily limit reached');
      return [];
    }

    if (!CONFIG.newsApi.apiKey) {
      console.warn('⚠️ NewsAPI key not configured');
      return [];
    }

    try {
      const response = await this.newsApiClient.get('/top-headlines', {
        params: {
          country: country,
          category: newsApiCategory,
          pageSize: CONFIG.itemsPerCategory + 2, // Fetch extra for filtering
        },
      });

      requestTracker.newsApi.count++;

      if (response.data.status === 'ok') {
        return response.data.articles || [];
      }

      return [];
    } catch (error: any) {
      console.error(`❌ NewsAPI headlines error:`, error.message);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // NEWSAPI: SEARCH NEWS (For categories without direct support)
  // ═══════════════════════════════════════════════════════════════

  private async searchNews(
    query: string,
    options: { language?: string; sortBy?: string; pageSize?: number } = {}
  ): Promise<RawNewsArticle[]> {
    if (!this.canUseNewsApi()) {
      console.warn('⚠️ NewsAPI daily limit reached');
      return [];
    }

    if (!CONFIG.newsApi.apiKey) {
      console.warn('⚠️ NewsAPI key not configured');
      return [];
    }

    try {
      const response = await this.newsApiClient.get('/everything', {
        params: {
          q: query,
          language: options.language || 'en',
          sortBy: options.sortBy || 'publishedAt',
          pageSize: options.pageSize || CONFIG.itemsPerCategory + 2,
        },
      });

      requestTracker.newsApi.count++;

      if (response.data.status === 'ok') {
        return response.data.articles || [];
      }

      return [];
    } catch (error: any) {
      console.error(`❌ NewsAPI search error for "${query}":`, error.message);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GNEWS: FETCH NEWS (Backup API)
  // ═══════════════════════════════════════════════════════════════

  private async fetchFromGnews(
    topic: string,
    options: { lang?: string; country?: string; max?: number } = {}
  ): Promise<RawNewsArticle[]> {
    if (!this.canUseGnews()) {
      console.warn('⚠️ GNews daily limit reached');
      return [];
    }

    if (!CONFIG.gnews.apiKey) {
      console.warn('⚠️ GNews key not configured');
      return [];
    }

    try {
      const response = await this.gnewsClient.get('/search', {
        params: {
          q: topic,
          lang: options.lang || 'en',
          country: options.country || 'in',
          max: options.max || CONFIG.itemsPerCategory,
          token: CONFIG.gnews.apiKey,
        },
      });

      requestTracker.gnews.count++;

      if (response.data.articles) {
        // Transform GNews format to our format
        return response.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          content: article.content,
          source: { id: null, name: article.source.name },
          author: null,
          url: article.url,
          urlToImage: article.image,
          publishedAt: article.publishedAt,
        }));
      }

      return [];
    } catch (error: any) {
      console.error(`❌ GNews error for "${topic}":`, error.message);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // FETCH NEWS BY CATEGORY (Main Method)
  // ═══════════════════════════════════════════════════════════════

  async fetchByCategory(category: NewsCategory): Promise<NewsItem[]> {
    const config = NEWS_CATEGORY_CONFIG[category];
    console.log(`📰 Fetching ${config.icon} ${config.label} news...`);

    let rawArticles: RawNewsArticle[] = [];

    // Check if this category needs search-based fetching
    if (SEARCH_BASED_CATEGORIES.includes(category)) {
      const searchKeywords = CATEGORY_SEARCH_KEYWORDS[category];
      if (searchKeywords) {
        rawArticles = await this.searchNews(searchKeywords, { pageSize: 7 });
      }
    } else {
      // Use top-headlines endpoint
      const newsApiCategory = NEWSAPI_CATEGORY_MAP[category];
      rawArticles = await this.fetchTopHeadlines(newsApiCategory);
    }

    // Fallback to GNews if no results
    if (rawArticles.length === 0) {
      console.log(`   ↳ Trying GNews as fallback for ${config.label}...`);
      rawArticles = await this.fetchFromGnews(config.label, { max: 7 });
    }

    // Transform to NewsItem format
    const newsItems = this.transformArticles(rawArticles, category);

    console.log(`   ↳ Got ${newsItems.length} items for ${config.label}`);
    return newsItems.slice(0, CONFIG.itemsPerCategory);
  }

  // ═══════════════════════════════════════════════════════════════
  // FETCH ALL CATEGORIES (Batch Method)
  // ═══════════════════════════════════════════════════════════════

  async fetchAllCategories(): Promise<Map<NewsCategory, NewsItem[]>> {
    console.log('\n═══════════════════════════════════════');
    console.log('📰 FETCHING NEWS FOR ALL CATEGORIES');
    console.log('═══════════════════════════════════════\n');

    const results = new Map<NewsCategory, NewsItem[]>();
    const categories = Object.values(NewsCategory);

    for (const category of categories) {
      try {
        const items = await this.fetchByCategory(category);
        results.set(category, items);

        // Small delay between requests to avoid rate limiting
        await this.delay(500);
      } catch (error: any) {
        console.error(`❌ Error fetching ${category}:`, error.message);
        results.set(category, []);
      }
    }

    // Log summary
    console.log('\n───────────────────────────────────────');
    console.log('📊 FETCH SUMMARY:');
    let total = 0;
    results.forEach((items, cat) => {
      const config = NEWS_CATEGORY_CONFIG[cat];
      console.log(`   ${config.icon} ${config.label}: ${items.length} items`);
      total += items.length;
    });
    console.log(`   📦 TOTAL: ${total} news items`);
    console.log('───────────────────────────────────────\n');

    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // TRANSFORM RAW ARTICLES TO NEWS ITEMS
  // ═══════════════════════════════════════════════════════════════

  private transformArticles(
    articles: RawNewsArticle[],
    category: NewsCategory
  ): NewsItem[] {
    const config = NEWS_CATEGORY_CONFIG[category];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + NEWS_EXPIRY_HOURS * 60 * 60 * 1000);

    return articles
      .filter((article) => {
        // Filter out articles with missing essential data
        return (
          article.title &&
          article.title !== '[Removed]' &&
          article.url &&
          article.source?.name
        );
      })
      .map((article) => ({
        title: this.cleanTitle(article.title),
        slug: generateSlug(article.title),
        summary: this.generateSummary(article),
        source: article.source.name,
        sourceUrl: article.url,
        imageUrl: article.urlToImage || null,
        category: category,
        icon: config.icon,
        color: config.color,
        publishedAt: new Date(article.publishedAt),
        fetchedAt: now,
        expiresAt: expiresAt,
      }));
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Clean article title
  // ═══════════════════════════════════════════════════════════════

  private cleanTitle(title: string): string {
    // Remove source suffix like " - NDTV" or " | Times of India"
    return title
      .replace(/\s*[-|]\s*[^-|]+$/, '')
      .trim();
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Generate summary from article
  // ═══════════════════════════════════════════════════════════════

  private generateSummary(article: RawNewsArticle, maxLength: number = 350): string {
    // Priority: description > content > title
    let text = article.description || article.content || article.title;

    if (!text) return '';

    // Clean up the text
    text = text
      .replace(/\[\+\d+ chars\]/, '') // Remove "[+1234 chars]"
      .replace(/<[^>]*>/g, '')        // Remove HTML tags
      .trim();

    // Truncate if needed
    if (text.length > maxLength) {
      text = text.substring(0, maxLength).trim();
      // Cut at last complete word
      const lastSpace = text.lastIndexOf(' ');
      if (lastSpace > maxLength * 0.7) {
        text = text.substring(0, lastSpace);
      }
      text += '...';
    }

    return text;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Delay between requests
  // ═══════════════════════════════════════════════════════════════

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════════════
  // GET API USAGE STATS
  // ═══════════════════════════════════════════════════════════════

  getUsageStats(): {
    newsApi: { used: number; limit: number; remaining: number };
    gnews: { used: number; limit: number; remaining: number };
    totalUsed: number;
    totalLimit: number;
  } {
    resetTrackerIfNeeded();

    const newsApiStats = {
      used: requestTracker.newsApi.count,
      limit: CONFIG.newsApi.dailyLimit,
      remaining: CONFIG.newsApi.dailyLimit - requestTracker.newsApi.count,
    };

    const gnewsStats = {
      used: requestTracker.gnews.count,
      limit: CONFIG.gnews.dailyLimit,
      remaining: CONFIG.gnews.dailyLimit - requestTracker.gnews.count,
    };

    return {
      newsApi: newsApiStats,
      gnews: gnewsStats,
      totalUsed: newsApiStats.used + gnewsStats.used,
      totalLimit: newsApiStats.limit + gnewsStats.limit,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // CHECK IF KEYS ARE CONFIGURED
  // ═══════════════════════════════════════════════════════════════

  isConfigured(): { newsApi: boolean; gnews: boolean; any: boolean } {
    return {
      newsApi: !!CONFIG.newsApi.apiKey,
      gnews: !!CONFIG.gnews.apiKey,
      any: !!CONFIG.newsApi.apiKey || !!CONFIG.gnews.apiKey,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

export const newsService = new NewsService();