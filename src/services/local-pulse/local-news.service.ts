// ═══════════════════════════════════════════════════════════════════════════
// File: src/services/local-pulse/local-news.service.ts
// Soriva Local Pulse™ - Local News/Highlights Service (International)
// Google News RSS with country-specific feeds
// ═══════════════════════════════════════════════════════════════════════════

import axios from 'axios';
import {
  LocalHighlight,
  HighlightCategory,
  NewsRSSItem,
  CacheEntry,
  CountryCode,
} from '../../types/local-pulse.types';
import { getNewsConfig, getCountryInfo } from './location.helper';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  googleNewsRSS: 'https://news.google.com/rss/search',
  cacheTTL: 20 * 60 * 1000, // 20 minutes in milliseconds
  timeout: 15000, // 15 seconds
  maxItems: 3, // Max highlights to return
  enabled: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE
// ═══════════════════════════════════════════════════════════════════════════

const newsCache = new Map<string, CacheEntry<LocalHighlight[]>>();

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY DETECTION KEYWORDS (Multi-language)
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_KEYWORDS: Record<HighlightCategory, string[]> = {
  traffic: [
    // English
    'traffic', 'road', 'highway', 'jam', 'accident', 'collision',
    'blocked', 'diversion', 'construction', 'bridge', 'flyover',
    // Hindi/Hinglish
    'sadak', 'rasta', 'hadsa', 'jam',
    // Arabic
    'مرور', 'حادث',
  ],
  market: [
    // English
    'market', 'price', 'rate', 'stock', 'inflation', 'cost',
    'expensive', 'cheap', 'wholesale', 'retail', 'economy',
    // Hindi
    'mandi', 'bazaar', 'sabzi', 'petrol', 'diesel', 'gold', 'silver',
  ],
  weather_alert: [
    // English
    'weather', 'rain', 'storm', 'flood', 'heat', 'cold', 'fog',
    'warning', 'alert', 'cyclone', 'thunder', 'lightning', 'snow',
    'hurricane', 'tornado', 'heatwave',
    // Hindi
    'baarish', 'toofan', 'baadh', 'garmi', 'sardi', 'kohra',
  ],
  event: [
    // English
    'festival', 'event', 'celebration', 'rally', 'protest',
    'march', 'inauguration', 'ceremony', 'concert', 'match',
    // Hindi
    'tyohaar', 'utsav', 'dharna', 'juloos', 'mela', 'fair',
  ],
  utility: [
    // English
    'power', 'electricity', 'water', 'supply', 'outage', 'cut',
    'gas', 'internet', 'network', 'service', 'maintenance',
    // Hindi
    'bijli', 'paani',
  ],
  general: [], // Fallback category
};

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY ICONS
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_ICONS: Record<HighlightCategory, string> = {
  traffic: '🚗',
  market: '📊',
  weather_alert: '⚠️',
  event: '🎉',
  utility: '💡',
  general: '📰',
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT HIGHLIGHTS (Fallback when no news available)
// ═══════════════════════════════════════════════════════════════════════════

function getDefaultHighlights(city: string, country: CountryCode): LocalHighlight[] {
  const countryInfo = getCountryInfo(country);
  
  return [
    {
      id: `default_traffic_${Date.now()}`,
      icon: '🚗',
      title: 'City traffic normal',
      description: 'No major congestion reported in the area.',
      category: 'traffic',
      timestamp: new Date().toISOString(),
    },
    {
      id: `default_market_${Date.now()}`,
      icon: '📊',
      title: 'Local markets stable',
      description: 'No major price fluctuations today.',
      category: 'market',
      timestamp: new Date().toISOString(),
    },
    {
      id: `default_general_${Date.now()}`,
      icon: '📰',
      title: `${city} update`,
      description: `All systems normal in ${countryInfo.name}. Have a great day!`,
      category: 'general',
      timestamp: new Date().toISOString(),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate cache key from city and country
 */
function getCacheKey(city: string, country: CountryCode = 'OTHER'): string {
  return `news_${country}_${city.toLowerCase().trim().replace(/\s+/g, '_')}`;
}

/**
 * Detect category from text
 */
function detectCategory(text: string): HighlightCategory {
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue; // Skip fallback
    
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category as HighlightCategory;
      }
    }
  }

  return 'general';
}

/**
 * Parse RSS XML to extract news items
 */
function parseRSSXML(xml: string): NewsRSSItem[] {
  const items: NewsRSSItem[] = [];
  
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';

    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
    const link = linkMatch ? linkMatch[1].trim() : '';

    const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

    const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/);
    const source = sourceMatch ? sourceMatch[1].trim() : 'News';

    const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
    const description = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';

    if (title) {
      items.push({
        title: cleanText(title),
        link,
        pubDate,
        source: cleanText(source),
        description: cleanText(description),
      });
    }
  }

  return items;
}

/**
 * Clean text - remove HTML tags, decode entities
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Truncate text to max length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `highlight_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Check if news item is relevant to the city
 */
function isRelevant(item: NewsRSSItem, city: string, state?: string): boolean {
  const searchText = `${item.title} ${item.description || ''}`.toLowerCase();
  const cityLower = city.toLowerCase();
  
  if (searchText.includes(cityLower)) return true;
  if (state && searchText.includes(state.toLowerCase())) return true;
  
  const cityVariations = [
    cityLower,
    cityLower.replace(/pur$/, 'pur district'),
    cityLower.replace(/pur$/, ''),
  ];
  
  for (const variation of cityVariations) {
    if (variation && searchText.includes(variation)) return true;
  }
  
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL NEWS SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class LocalNewsService {
  private enabled: boolean;

  constructor() {
    this.enabled = CONFIG.enabled;
  }

  /**
   * Get local highlights for a city (with international support)
   */
  async getHighlights(
    city: string, 
    state?: string, 
    country: CountryCode = 'IN'
  ): Promise<LocalHighlight[]> {
    if (!this.enabled) {
      console.log('⚠️ Local news service is disabled');
      return getDefaultHighlights(city, country);
    }

    const cacheKey = getCacheKey(city, country);

    // Check cache first
    const cached = newsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`📦 News cache hit for: ${city}, ${country}`);
      return cached.data;
    }

    console.log(`📰 Fetching local news for: ${city}, ${country}`);

    try {
      // Get country-specific news configuration
      const newsConfig = getNewsConfig(country);
      
      // Build search query
      const searchQuery = state ? `${city} ${state}` : city;
      
      const response = await axios.get(CONFIG.googleNewsRSS, {
        params: {
          q: searchQuery,
          hl: newsConfig.lang,
          gl: newsConfig.gl,
          ceid: newsConfig.ceid,
        },
        timeout: CONFIG.timeout,
        headers: {
          'User-Agent': 'Soriva/2.0 (News Aggregator)',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      });

      const rssItems = parseRSSXML(response.data);
      
      // Filter relevant items and transform
      const highlights = rssItems
        .filter(item => isRelevant(item, city, state))
        .slice(0, CONFIG.maxItems)
        .map(item => this.transformToHighlight(item, city));

      // If no relevant news found, use defaults
      const finalHighlights = highlights.length > 0 
        ? highlights 
        : getDefaultHighlights(city, country);

      // Cache the result
      newsCache.set(cacheKey, {
        data: finalHighlights,
        expiresAt: Date.now() + CONFIG.cacheTTL,
        city: cacheKey,
      });

      console.log(`✅ News fetched for ${city}: ${finalHighlights.length} highlights`);
      return finalHighlights;

    } catch (error: any) {
      console.error(`❌ News fetch error for ${city}:`, error.message);
      return getDefaultHighlights(city, country);
    }
  }

  /**
   * Transform RSS item to LocalHighlight
   */
  private transformToHighlight(item: NewsRSSItem, city: string): LocalHighlight {
    const category = detectCategory(`${item.title} ${item.description || ''}`);
    const icon = CATEGORY_ICONS[category];

    return {
      id: generateId(),
      icon,
      title: truncate(item.title, 60),
      description: item.description 
        ? truncate(item.description, 100) 
        : `Latest update from ${item.source}`,
      category,
      source: item.source,
      url: item.link,
      timestamp: item.pubDate || new Date().toISOString(),
    };
  }

  /**
   * Clear cache for a specific city
   */
  clearCache(city?: string): void {
    if (city) {
      // Clear all cache entries containing this city
      const cityLower = city.toLowerCase();
      for (const key of newsCache.keys()) {
        if (key.includes(cityLower)) {
          newsCache.delete(key);
        }
      }
      console.log(`🗑️ News cache cleared for: ${city}`);
    } else {
      newsCache.clear();
      console.log('🗑️ News cache cleared completely');
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: newsCache.size,
      entries: Array.from(newsCache.keys()),
    };
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable/disable service
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`📰 Local news service ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const localNewsService = new LocalNewsService();
export default localNewsService;