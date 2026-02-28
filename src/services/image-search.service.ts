/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA IMAGE SEARCH SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Uses Serper.dev API for educational image search
 * - Fetches relevant diagrams, infographics, educational images
 * - Returns image URLs with source attribution
 * - Caching support for common topics
 * 
 * @author Soriva AI Engine
 * @version 1.0.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from 'axios';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ImageSearchResult {
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  source: string;
  sourceUrl: string;
  width?: number;
  height?: number;
}

export interface ImageSearchResponse {
  images: ImageSearchResult[];
  query: string;
  cached: boolean;
  timeMs: number;
}

interface SerperImageResult {
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  source: string;
  link: string;
  imageWidth?: number;
  imageHeight?: number;
}

interface SerperResponse {
  images: SerperImageResult[];
  searchParameters: {
    q: string;
    type: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CACHE (Simple in-memory cache)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface CacheEntry {
  data: ImageSearchResult[];
  timestamp: number;
}

const imageCache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMAGE SEARCH SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ImageSearchService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://google.serper.dev/images';

  constructor() {
    this.apiKey = process.env.SERPER_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[ImageSearchService] ⚠️ SERPER_API_KEY not found in environment');
    } else {
      console.log('[ImageSearchService] ✅ Initialized with Serper.dev API');
    }
  }

  /**
   * Search for educational images/diagrams
   * @param topic - The topic to search for (e.g., "fractional distillation")
   * @param options - Search options
   */
  async searchImages(
    topic: string,
    options: {
      count?: number;
      language?: 'en' | 'hi';
      addEducational?: boolean;
    } = {}
  ): Promise<ImageSearchResponse> {
    const startTime = Date.now();
    const { count = 3, language = 'en', addEducational = true } = options;

    // Build search query
    let query = topic.trim();
    if (addEducational) {
      query = `${query} diagram educational labeled`;
    }

    // Normalize query for cache key
    const cacheKey = query.toLowerCase().replace(/\s+/g, '_');

    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`[ImageSearchService] 📦 Cache hit for: "${topic}"`);
      return {
        images: cached.slice(0, count),
        query,
        cached: true,
        timeMs: Date.now() - startTime,
      };
    }

    // Make API request
    try {
      console.log(`[ImageSearchService] 🔍 Searching images for: "${query}"`);

      const response = await axios.post<SerperResponse>(
        this.baseUrl,
        {
          q: query,
          num: Math.min(count + 2, 10), // Fetch extra for filtering
          gl: language === 'hi' ? 'in' : 'us',
          hl: language,
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const images = this.transformResults(response.data.images || []);

      // Filter out low quality images
      const filteredImages = this.filterImages(images);

      // Cache results
      this.addToCache(cacheKey, filteredImages);

      console.log(`[ImageSearchService] ✅ Found ${filteredImages.length} images in ${Date.now() - startTime}ms`);

      return {
        images: filteredImages.slice(0, count),
        query,
        cached: false,
        timeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('[ImageSearchService] ❌ Search failed:', error.message);
      
      return {
        images: [],
        query,
        cached: false,
        timeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Search specifically for educational diagrams
   */
  async searchDiagram(
    topic: string,
    subject?: string
  ): Promise<ImageSearchResult | null> {
    const subjectPrefix = subject ? `${subject} ` : '';
    const query = `${subjectPrefix}${topic} diagram infographic`;

    const result = await this.searchImages(query, { count: 1, addEducational: false });

    return result.images[0] || null;
  }

  /**
   * Transform Serper results to our format
   */
  private transformResults(results: SerperImageResult[]): ImageSearchResult[] {
    return results.map((img) => ({
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl,
      title: img.title || 'Educational Diagram',
      source: this.extractDomain(img.source || img.link),
      sourceUrl: img.link,
      width: img.imageWidth,
      height: img.imageHeight,
    }));
  }

  /**
   * Filter out low quality or irrelevant images
   */
  private filterImages(images: ImageSearchResult[]): ImageSearchResult[] {
    return images.filter((img) => {
      // Skip very small images
      if (img.width && img.width < 200) return false;
      if (img.height && img.height < 200) return false;

      // Skip certain domains (ads, low quality)
      const lowQualityDomains = ['pinterest.com', 'facebook.com', 'instagram.com'];
      if (lowQualityDomains.some((d) => img.source.includes(d))) return false;

      // Prefer educational sources
      const preferredDomains = [
        'wikipedia',
        'shutterstock',
        'britannica',
        'khanacademy',
        'byjus',
        'vedantu',
        'toppr',
        'geeksforgeeks',
        'sciencedirect',
      ];
      
      // Boost preferred domains (they'll be first after sort)
      // For now, just include all that pass basic filters

      return true;
    });
  }

  /**
   * Extract domain name from URL
   */
  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Get from cache if not expired
   */
  private getFromCache(key: string): ImageSearchResult[] | null {
    const entry = imageCache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL) {
      imageCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Add to cache
   */
  private addToCache(key: string, data: ImageSearchResult[]): void {
    imageCache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Limit cache size
    if (imageCache.size > 500) {
      const firstKey = imageCache.keys().next().value;
      if (firstKey) imageCache.delete(firstKey);
    }
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    imageCache.clear();
    console.log('[ImageSearchService] 🗑️ Cache cleared');
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const imageSearchService = new ImageSearchService();

export default ImageSearchService;