// ═══════════════════════════════════════════════════════════════
// TRENDING API ROUTES
// File: src/routes/trending.routes.ts
//
// NEWS Endpoints:
// GET  /api/trending/news              - All news (10 categories)
// GET  /api/trending/news/:category    - News by category
// GET  /api/trending/news/popup/:slug  - Popup data for news item
// GET  /api/trending/news/rss          - RSS news (FREE, region-based)
// GET  /api/trending/news/rss/:region  - RSS news by region (IN/INTL)
//
// HOROSCOPE Endpoints:
// GET  /api/trending/horoscope         - All 12 rashis
// GET  /api/trending/horoscope/:sign   - Single rashi
//
// COMBINED Endpoints:
// GET  /api/trending                   - News + Horoscope combined
// GET  /api/trending/health            - Health check
//
// ADMIN Endpoints:
// POST /api/trending/refresh/news      - Manual news refresh
// POST /api/trending/refresh/horoscope - Manual horoscope refresh
// POST /api/trending/refresh/all       - Manual full refresh
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { trendingService } from '../services/trending/trending.service';
import { horoscopeService } from '../services/trending/horoscope.service';
import { rssService } from '../services/trending/rss.service';
import {
  triggerNewsFetch,
  triggerHoroscopeFetch,
  triggerFullFetch,
  getCronStatus,
} from '../cron/trending.cron';
import {
  NewsCategory,
  HoroscopeSign,
  NEWS_CATEGORY_CONFIG,
  HOROSCOPE_CONFIG,
} from '../types/trending.types';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// 🆕 RSS NEWS ROUTES (FREE & UNLIMITED)
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/news/rss - All RSS news (both regions)
// ─────────────────────────────────────────────────────────────────

router.get('/news/rss', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/trending/news/rss');
    
    const { region } = req.query;
    
    // If region specified, fetch that region only
    if (region === 'IN' || region === 'INTL') {
      const news = await rssService.fetchByRegion(region);
      
      return res.json({
        success: true,
        data: {
          region: region,
          news: news,
          sources: rssService.getAvailableFeeds()[region === 'IN' ? 'india' : 'international'],
        },
        meta: {
          total: news.length,
          fetchedAt: new Date().toISOString(),
          source: 'RSS (FREE)',
        },
      });
    }
    
    // Fetch both regions
    const { india, international } = await rssService.fetchAll();
    
    res.json({
      success: true,
      data: {
        india: india,
        international: international,
        sources: rssService.getAvailableFeeds(),
      },
      meta: {
        totalIndia: india.length,
        totalInternational: international.length,
        total: india.length + international.length,
        fetchedAt: new Date().toISOString(),
        source: 'RSS (FREE)',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending/news/rss:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSS news',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/news/rss/india - India RSS news only
// ─────────────────────────────────────────────────────────────────

router.get('/news/rss/india', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/trending/news/rss/india');
    
    const news = await rssService.fetchByRegion('IN');
    
    res.json({
      success: true,
      data: {
        region: 'IN',
        regionName: 'India',
        flag: '🇮🇳',
        news: news,
        sources: rssService.getAvailableFeeds().india,
      },
      meta: {
        total: news.length,
        fetchedAt: new Date().toISOString(),
        source: 'RSS (FREE)',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending/news/rss/india:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch India RSS news',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/news/rss/international - International RSS news
// ─────────────────────────────────────────────────────────────────

router.get('/news/rss/international', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/trending/news/rss/international');
    
    const news = await rssService.fetchByRegion('INTL');
    
    res.json({
      success: true,
      data: {
        region: 'INTL',
        regionName: 'International',
        flag: '🌍',
        news: news,
        sources: rssService.getAvailableFeeds().international,
      },
      meta: {
        total: news.length,
        fetchedAt: new Date().toISOString(),
        source: 'RSS (FREE)',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending/news/rss/international:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch International RSS news',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/news/rss/marquee - Marquee-ready news (short titles)
// ─────────────────────────────────────────────────────────────────

router.get('/news/rss/marquee', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/trending/news/rss/marquee');
    
    const { region = 'IN', limit = '20' } = req.query;
    const regionKey = region === 'INTL' ? 'INTL' : 'IN';
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 50);
    
    const news = await rssService.fetchByRegion(regionKey as 'IN' | 'INTL');
    
    // Format for marquee - just title, icon, source
    const marqueeItems = news.slice(0, limitNum).map((item) => ({
      id: item.slug,
      title: item.title.length > 80 ? item.title.substring(0, 77) + '...' : item.title,
      icon: item.icon,
      source: item.source,
      category: item.category,
      url: item.sourceUrl,
      summary: item.summary || 'Tap "Explore with Soriva" to get AI-powered insights and analysis about this trending topic.',
    }));
    
    res.json({
      success: true,
      data: {
        region: regionKey,
        items: marqueeItems,
      },
      meta: {
        total: marqueeItems.length,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending/news/rss/marquee:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch marquee news',
      message: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// NEWS ROUTES (Existing - NewsAPI/GNews)
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/news - All news (10 categories)
// ─────────────────────────────────────────────────────────────────

router.get('/news', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/trending/news');

    const response = await trendingService.getAllNews();

    res.json(response);
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending/news:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/news/categories - List all categories
// ─────────────────────────────────────────────────────────────────

router.get('/news/categories', async (req: Request, res: Response) => {
  try {
    const categories = Object.values(NewsCategory).map((cat) => ({
      id: cat,
      ...NEWS_CATEGORY_CONFIG[cat],
    }));

    res.json({
      success: true,
      data: categories,
      meta: { total: categories.length },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/news/:category - News by category
// ─────────────────────────────────────────────────────────────────

router.get('/news/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    console.log(`\n📥 GET /api/trending/news/${category}`);

    // Validate category
    if (!Object.values(NewsCategory).includes(category as NewsCategory)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        validCategories: Object.values(NewsCategory),
      });
    }

    const news = await trendingService.getNewsByCategory(category as NewsCategory);
    const config = NEWS_CATEGORY_CONFIG[category as NewsCategory];

    res.json({
      success: true,
      data: {
        category: {
          id: category,
          ...config,
        },
        news,
      },
      meta: { total: news.length },
    });
  } catch (error: any) {
    console.error(`❌ Error in GET /api/trending/news/${req.params.category}:`, error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch news by category',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/news/popup/:slug - Popup data for news
// ─────────────────────────────────────────────────────────────────

router.get('/news/popup/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    console.log(`\n📥 GET /api/trending/news/popup/${slug}`);

    const popupData = await trendingService.getNewsPopupData(slug);

    if (!popupData) {
      return res.status(404).json({
        success: false,
        error: 'News item not found',
      });
    }

    res.json({
      success: true,
      data: popupData,
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending/news/popup:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch popup data',
      message: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// HOROSCOPE ROUTES
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/horoscope - All 12 rashis
// ─────────────────────────────────────────────────────────────────

router.get('/horoscope', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/trending/horoscope');

    const response = await trendingService.getAllHoroscopes();

    res.json(response);
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending/horoscope:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch horoscopes',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/horoscope/signs - List all signs
// ─────────────────────────────────────────────────────────────────

router.get('/horoscope/signs', async (req: Request, res: Response) => {
  try {
    const signs = Object.values(HoroscopeSign).map((sign) => ({
      id: sign,
      ...HOROSCOPE_CONFIG[sign],
    }));

    res.json({
      success: true,
      data: signs,
      meta: { total: signs.length },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signs',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/horoscope/:sign - Single rashi
// ─────────────────────────────────────────────────────────────────

router.get('/horoscope/:sign', async (req: Request, res: Response) => {
  try {
    const { sign } = req.params;
    console.log(`\n📥 GET /api/trending/horoscope/${sign}`);

    // Validate sign
    if (!horoscopeService.isValidSign(sign)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid horoscope sign',
        validSigns: Object.values(HoroscopeSign),
      });
    }

    const response = await trendingService.getHoroscopeBySign(sign as HoroscopeSign);

    if (!response.success) {
      return res.status(404).json({
        success: false,
        error: 'Horoscope not found',
      });
    }

    res.json(response);
  } catch (error: any) {
    console.error(`❌ Error in GET /api/trending/horoscope/${req.params.sign}:`, error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch horoscope',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/horoscope/popup/:sign - Popup data for horoscope
// ─────────────────────────────────────────────────────────────────

router.get('/horoscope/popup/:sign', async (req: Request, res: Response) => {
  try {
    const { sign } = req.params;
    console.log(`\n📥 GET /api/trending/horoscope/popup/${sign}`);

    if (!horoscopeService.isValidSign(sign)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid horoscope sign',
      });
    }

    const popupData = await trendingService.getHoroscopePopupData(sign as HoroscopeSign);

    if (!popupData) {
      return res.status(404).json({
        success: false,
        error: 'Horoscope not found',
      });
    }

    res.json({
      success: true,
      data: popupData,
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending/horoscope/popup:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch popup data',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/horoscope/by-dob - Get sign by date of birth
// ─────────────────────────────────────────────────────────────────

router.get('/horoscope/by-dob', async (req: Request, res: Response) => {
  try {
    const { month, day } = req.query;

    if (!month || !day) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: month and day',
      });
    }

    const monthNum = parseInt(month as string, 10);
    const dayNum = parseInt(day as string, 10);

    if (isNaN(monthNum) || isNaN(dayNum) || monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month or day',
      });
    }

    const sign = horoscopeService.getSignFromBirthDate(monthNum, dayNum);
    const config = HOROSCOPE_CONFIG[sign];

    res.json({
      success: true,
      data: {
        sign,
        ...config,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to determine sign',
      message: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// COMBINED ROUTES
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// GET /api/trending - All trending data (News + Horoscope)
// ─────────────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/trending');

    const response = await trendingService.getTrendingData();

    res.json(response);
  } catch (error: any) {
    console.error('❌ Error in GET /api/trending:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending data',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/trending/health - Health check
// ─────────────────────────────────────────────────────────────────

router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = await trendingService.getHealthStatus();
    const cronStatus = getCronStatus();

    res.json({
      success: true,
      data: {
        ...healthStatus,
        cron: cronStatus,
        rssFeeds: rssService.getAvailableFeeds(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES (Manual Refresh)
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// POST /api/trending/refresh/news - Manual news refresh
// ─────────────────────────────────────────────────────────────────

router.post('/refresh/news', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 POST /api/trending/refresh/news');

    const result = await triggerNewsFetch();

    res.json({
      success: result.success,
      message: result.success ? 'News refresh completed' : 'News refresh failed',
      data: { itemsFetched: result.count },
    });
  } catch (error: any) {
    console.error('❌ Error in POST /api/trending/refresh/news:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to refresh news',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/trending/refresh/horoscope - Manual horoscope refresh
// ─────────────────────────────────────────────────────────────────

router.post('/refresh/horoscope', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 POST /api/trending/refresh/horoscope');

    const result = await triggerHoroscopeFetch();

    res.json({
      success: result.success,
      message: result.success ? 'Horoscope refresh completed' : 'Horoscope refresh failed',
      data: { itemsFetched: result.count },
    });
  } catch (error: any) {
    console.error('❌ Error in POST /api/trending/refresh/horoscope:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to refresh horoscope',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/trending/refresh/all - Manual full refresh
// ─────────────────────────────────────────────────────────────────

router.post('/refresh/all', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 POST /api/trending/refresh/all');

    const result = await triggerFullFetch();

    res.json({
      success: result.news.success && result.horoscope.success,
      message: 'Full refresh completed',
      data: {
        news: { itemsFetched: result.news.count },
        horoscope: { itemsFetched: result.horoscope.count },
      },
    });
  } catch (error: any) {
    console.error('❌ Error in POST /api/trending/refresh/all:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to refresh all',
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// EXPORT ROUTER
// ─────────────────────────────────────────────────────────────────

export default router;