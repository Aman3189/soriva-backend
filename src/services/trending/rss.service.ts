// ═══════════════════════════════════════════════════════════════
// RSS NEWS SERVICE - 100% FREE, UNLIMITED
// File: src/services/trending/rss.service.ts
//
// Fetches news from FREE RSS feeds - NO API LIMITS!
// India: TOI, NDTV, Zee News, India Today, HT, ET, The Hindu
// International: BBC, Reuters, CNN, Al Jazeera
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import {
  NewsCategory,
  NEWS_CATEGORY_CONFIG,
  NewsItem,
  generateSlug,
  NEWS_EXPIRY_HOURS
} from '../../types/trending.types';

// ─────────────────────────────────────────────────────────────────
// RSS FEED CONFIGURATION
// ─────────────────────────────────────────────────────────────────

export type Region = 'IN' | 'INTL';

interface RSSFeed {
  name: string;
  url: string;
  region: Region;
  category: NewsCategory;
  icon: string;
}

const RSS_FEEDS: RSSFeed[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🇮🇳 INDIA FEEDS
  // ═══════════════════════════════════════════════════════════════
  
  // Times of India
  { name: 'TOI', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', region: 'IN', category: NewsCategory.GENERAL, icon: '📰' },
  { name: 'TOI Sports', url: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', region: 'IN', category: NewsCategory.SPORTS, icon: '🏏' },
  { name: 'TOI Tech', url: 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms', region: 'IN', category: NewsCategory.TECHNOLOGY, icon: '📱' },
  { name: 'TOI Business', url: 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', region: 'IN', category: NewsCategory.BUSINESS, icon: '💰' },
  { name: 'TOI Entertainment', url: 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms', region: 'IN', category: NewsCategory.ENTERTAINMENT, icon: '🎬' },
  
  // NDTV
  { name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', region: 'IN', category: NewsCategory.GENERAL, icon: '📰' },
  { name: 'NDTV Sports', url: 'https://feeds.feedburner.com/ndtvsports-latest', region: 'IN', category: NewsCategory.SPORTS, icon: '🏏' },
  { name: 'NDTV Tech', url: 'https://feeds.feedburner.com/gadgets360-latest', region: 'IN', category: NewsCategory.TECHNOLOGY, icon: '📱' },
  
  // India Today
  { name: 'India Today', url: 'https://www.indiatoday.in/rss/home', region: 'IN', category: NewsCategory.GENERAL, icon: '📰' },
  { name: 'India Today Business', url: 'https://www.indiatoday.in/rss/business', region: 'IN', category: NewsCategory.BUSINESS, icon: '💰' },

  // Hindustan Times
  { name: 'HT', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', region: 'IN', category: NewsCategory.GENERAL, icon: '📰' },
  { name: 'HT Sports', url: 'https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml', region: 'IN', category: NewsCategory.SPORTS, icon: '🏏' },
  { name: 'HT Tech', url: 'https://www.hindustantimes.com/feeds/rss/technology/rssfeed.xml', region: 'IN', category: NewsCategory.TECHNOLOGY, icon: '📱' },
  { name: 'HT Entertainment', url: 'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml', region: 'IN', category: NewsCategory.ENTERTAINMENT, icon: '🎬' },

  // Economic Times
  { name: 'ET Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', region: 'IN', category: NewsCategory.BUSINESS, icon: '📈' },
  { name: 'ET Tech', url: 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms', region: 'IN', category: NewsCategory.TECHNOLOGY, icon: '📱' },
  { name: 'ET Startups', url: 'https://economictimes.indiatimes.com/small-biz/rssfeeds/5575607.cms', region: 'IN', category: NewsCategory.BUSINESS, icon: '🚀' },

  // The Hindu
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss', region: 'IN', category: NewsCategory.GENERAL, icon: '📰' },
  { name: 'The Hindu Business', url: 'https://www.thehindu.com/business/feeder/default.rss', region: 'IN', category: NewsCategory.BUSINESS, icon: '💰' },
  { name: 'The Hindu Science', url: 'https://www.thehindu.com/sci-tech/science/feeder/default.rss', region: 'IN', category: NewsCategory.SCIENCE, icon: '🔬' },
  
  // ═══════════════════════════════════════════════════════════════
  // 🌍 INTERNATIONAL FEEDS
  // ═══════════════════════════════════════════════════════════════
  
  // BBC
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', region: 'INTL', category: NewsCategory.WORLD, icon: '🌍' },
  { name: 'BBC Tech', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', region: 'INTL', category: NewsCategory.TECHNOLOGY, icon: '📱' },
  { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', region: 'INTL', category: NewsCategory.BUSINESS, icon: '💰' },
  { name: 'BBC Health', url: 'https://feeds.bbci.co.uk/news/health/rss.xml', region: 'INTL', category: NewsCategory.HEALTH, icon: '🏥' },
  { name: 'BBC Science', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', region: 'INTL', category: NewsCategory.SCIENCE, icon: '🔬' },
  { name: 'BBC Entertainment', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', region: 'INTL', category: NewsCategory.ENTERTAINMENT, icon: '🎬' },
  
  // Reuters
  { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?best-regions=asia&post_type=best', region: 'INTL', category: NewsCategory.WORLD, icon: '🌍' },
  { name: 'Reuters Business', url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best', region: 'INTL', category: NewsCategory.BUSINESS, icon: '💰' },
  { name: 'Reuters Tech', url: 'https://www.reutersagency.com/feed/?best-topics=tech&post_type=best', region: 'INTL', category: NewsCategory.TECHNOLOGY, icon: '📱' },
  
  // CNN
  { name: 'CNN Top', url: 'http://rss.cnn.com/rss/edition.rss', region: 'INTL', category: NewsCategory.GENERAL, icon: '📰' },
  { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss', region: 'INTL', category: NewsCategory.WORLD, icon: '🌍' },
  { name: 'CNN Tech', url: 'http://rss.cnn.com/rss/edition_technology.rss', region: 'INTL', category: NewsCategory.TECHNOLOGY, icon: '📱' },
  { name: 'CNN Entertainment', url: 'http://rss.cnn.com/rss/edition_entertainment.rss', region: 'INTL', category: NewsCategory.ENTERTAINMENT, icon: '🎬' },
];

// ─────────────────────────────────────────────────────────────────
// RSS SERVICE CLASS
// ─────────────────────────────────────────────────────────────────

export class RSSService {
  private timeout = 10000;

  // ═══════════════════════════════════════════════════════════════
  // FETCH SINGLE RSS FEED
  // ═══════════════════════════════════════════════════════════════

  private async fetchFeed(feed: RSSFeed): Promise<NewsItem[]> {
    try {
      console.log(`   📡 Fetching ${feed.name}...`);
      
      const response = await axios.get(feed.url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Soriva News Bot/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      });

      const parsed = await parseStringPromise(response.data, {
        explicitArray: false,
        ignoreAttrs: true,
      });

      const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
      const itemsArray = Array.isArray(items) ? items : [items];

      return this.transformItems(itemsArray, feed);
    } catch (error: any) {
      console.error(`   ❌ Failed ${feed.name}: ${error.message}`);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TRANSFORM RSS ITEMS TO NEWS ITEMS
  // ═══════════════════════════════════════════════════════════════

  private transformItems(items: any[], feed: RSSFeed): NewsItem[] {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + NEWS_EXPIRY_HOURS * 60 * 60 * 1000);
    const config = NEWS_CATEGORY_CONFIG[feed.category];

    return items
      .slice(0, 10) // Max 10 items per feed
      .filter((item) => {
        const title = item.title?._text || item.title || '';
        return title && title.length > 10;
      })
      .map((item) => {
        const title = this.cleanTitle(item.title?._text || item.title || '');
        const description = item.description?._text || item.description || 
                           item.summary?._text || item.summary || '';
        const link = item.link?.href || item.link || '';
        const pubDate = item.pubDate || item.published || item.updated || now.toISOString();
        
        // Try to get image
        let imageUrl: string | null = null;
        if (item['media:content']?.url) {
          imageUrl = item['media:content'].url;
        } else if (item.enclosure?.url) {
          imageUrl = item.enclosure.url;
        }

        return {
          title: title,
          slug: generateSlug(title),
          summary: this.cleanDescription(description),
          source: feed.name,
          sourceUrl: link,
          imageUrl: imageUrl,
          category: feed.category,
          icon: feed.icon,
          color: config.color,
          publishedAt: new Date(pubDate),
          fetchedAt: now,
          expiresAt: expiresAt,
        };
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // FETCH BY REGION
  // ═══════════════════════════════════════════════════════════════

  async fetchByRegion(region: Region): Promise<NewsItem[]> {
    console.log(`\n🌐 Fetching ${region === 'IN' ? '🇮🇳 INDIA' : '🌍 INTERNATIONAL'} news via RSS...`);
    
    const feeds = RSS_FEEDS.filter((f) => f.region === region);
    const allNews: NewsItem[] = [];
    
    for (const feed of feeds) {
      const items = await this.fetchFeed(feed);
      allNews.push(...items);
      
      // Small delay between feeds
      await this.delay(200);
    }

    // Remove duplicates by title
    const uniqueNews = this.removeDuplicates(allNews);
    
    console.log(`   ✅ Got ${uniqueNews.length} unique items for ${region}`);
    return uniqueNews;
  }

  // ═══════════════════════════════════════════════════════════════
  // FETCH BY CATEGORY + REGION
  // ═══════════════════════════════════════════════════════════════

  async fetchByCategoryAndRegion(
    category: NewsCategory,
    region: Region
  ): Promise<NewsItem[]> {
    const feeds = RSS_FEEDS.filter(
      (f) => f.region === region && f.category === category
    );

    if (feeds.length === 0) {
      console.log(`   ⚠️ No RSS feeds for ${category} in ${region}`);
      return [];
    }

    const allNews: NewsItem[] = [];
    
    for (const feed of feeds) {
      const items = await this.fetchFeed(feed);
      allNews.push(...items);
    }

    return this.removeDuplicates(allNews);
  }

  // ═══════════════════════════════════════════════════════════════
  // FETCH ALL (Both regions)
  // ═══════════════════════════════════════════════════════════════

  async fetchAll(): Promise<{ india: NewsItem[]; international: NewsItem[] }> {
    console.log('\n═══════════════════════════════════════');
    console.log('📰 RSS NEWS FETCH - FREE & UNLIMITED');
    console.log('═══════════════════════════════════════\n');

    const india = await this.fetchByRegion('IN');
    const international = await this.fetchByRegion('INTL');

    console.log('\n───────────────────────────────────────');
    console.log('📊 RSS FETCH SUMMARY:');
    console.log(`   🇮🇳 India: ${india.length} items`);
    console.log(`   🌍 International: ${international.length} items`);
    console.log(`   📦 Total: ${india.length + international.length} items`);
    console.log('───────────────────────────────────────\n');

    return { india, international };
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Clean title
  // ═══════════════════════════════════════════════════════════════

  private cleanTitle(title: string): string {
    return title
      .replace(/<[^>]*>/g, '')           // Remove HTML
      .replace(/\s*[-|–]\s*[^-|–]+$/, '') // Remove source suffix
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Clean description
  // ═══════════════════════════════════════════════════════════════

  private cleanDescription(desc: string, maxLength: number = 500): string {
    let text = desc
      .replace(/<[^>]*>/g, '')  // Remove HTML
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length > maxLength) {
      text = text.substring(0, maxLength);
      const lastSpace = text.lastIndexOf(' ');
      if (lastSpace > maxLength * 0.7) {
        text = text.substring(0, lastSpace);
      }
      text += '...';
    }

    return text;
  }
// ═══════════════════════════════════════════════════════════════
  // HELPER: Remove duplicates (SUPER AGGRESSIVE)
  // ═══════════════════════════════════════════════════════════════

  private removeDuplicates(news: NewsItem[]): NewsItem[] {
    const seenKeys = new Set<string>();
    const seenShortKeys = new Set<string>();
    
    return news.filter((item) => {
      // Normalize title
      const normalized = item.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')  // Keep spaces for word matching
        .replace(/\s+/g, ' ');
      
      // Full key (first 40 chars, no spaces)
      const fullKey = normalized.replace(/\s/g, '').substring(0, 40);
      
      // Short key (first 3 words)
      const words = normalized.split(' ').filter(w => w.length > 2);
      const shortKey = words.slice(0, 3).join('');
      
      // Check if duplicate
      if (seenKeys.has(fullKey)) {
        console.log('   🔄 Exact duplicate removed:', item.title.substring(0, 40));
        return false;
      }
      
      // Check if similar (same first 3 important words)
      if (shortKey.length > 8 && seenShortKeys.has(shortKey)) {
        console.log('   🔄 Similar duplicate removed:', item.title.substring(0, 40));
        return false;
      }
      
      seenKeys.add(fullKey);
      if (shortKey.length > 8) {
        seenShortKeys.add(shortKey);
      }
      
      return true;
    });
  } 

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Delay
  // ═══════════════════════════════════════════════════════════════

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════════════
  // GET AVAILABLE FEEDS INFO
  // ═══════════════════════════════════════════════════════════════

  getAvailableFeeds(): { india: string[]; international: string[] } {
    return {
      india: RSS_FEEDS.filter((f) => f.region === 'IN').map((f) => f.name),
      international: RSS_FEEDS.filter((f) => f.region === 'INTL').map((f) => f.name),
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

export const rssService = new RSSService();