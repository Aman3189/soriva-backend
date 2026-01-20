// ═══════════════════════════════════════════════════════════════════════════
// File: src/routes/local-pulse.routes.ts
// Soriva Local Pulse™ - API Routes
// ═══════════════════════════════════════════════════════════════════════════
//
// Endpoints:
// GET  /api/local-pulse              - Complete pulse for authenticated user
// GET  /api/local-pulse/city/:city   - Public pulse by city name
// GET  /api/local-pulse/coords       - Pulse by coordinates (query params)
// GET  /api/local-pulse/weather/:city - Weather only
// GET  /api/local-pulse/aqi/:city    - AQI only
// GET  /api/local-pulse/news/:city   - News/highlights only
// POST /api/local-pulse/refresh/:city - Force refresh city data
// GET  /api/local-pulse/health       - Service health check
//
// ═══════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { localPulseService } from '../services/local-pulse/local-pulse.service';
import { LocalPulseError } from '../types/local-pulse.types';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE - Optional Auth (extracts userId if token present)
// ═══════════════════════════════════════════════════════════════════════════

// Note: Import your actual auth middleware here
// import { optionalAuth } from '../middleware/auth.middleware';

/**
 * Simple optional auth middleware placeholder
 * Replace with your actual auth middleware
 */
const optionalAuth = (req: Request, res: Response, next: Function) => {
  // Extract userId from token if present
  // This is a placeholder - use your actual auth logic
  const authHeader = req.headers.authorization;
  
  if (authHeader?.startsWith('Bearer ')) {
    try {
      // Decode token and extract userId
      // Replace with your actual token decoding logic
      const token = authHeader.split(' ')[1];
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      (req as any).userId = decoded.userId || decoded.sub || decoded.id;
    } catch (e) {
      // Token invalid, continue without userId
    }
  }
  
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/local-pulse
 * Get complete Local Pulse for authenticated user
 * Uses user's saved location (homeCity/currentCity)
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/local-pulse');
    
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required for personalized Local Pulse. Use /api/local-pulse/city/:city for public access.',
      });
    }

    const result = await localPulseService.getLocalPulse(userId);
    
    if (!result.success) {
      const statusCode = result.error === 'LOCATION_REQUIRED' ? 400 : 500;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('❌ Error in GET /api/local-pulse:', error.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/local-pulse/city/:city
 * Get Local Pulse for a specific city (public endpoint)
 */
router.get('/city/:city', async (req: Request, res: Response) => {
  try {
    const { city } = req.params;
    console.log(`\n📥 GET /api/local-pulse/city/${city}`);

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CITY',
        message: 'Valid city name required (minimum 2 characters)',
      });
    }

    const result = await localPulseService.getLocalPulseByCity(city);
    
    if (!result.success) {
      const statusCode = result.error === 'LOCATION_NOT_FOUND' ? 404 : 500;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);

  } catch (error: any) {
    console.error(`❌ Error in GET /api/local-pulse/city:`, error.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/local-pulse/coords
 * Get Local Pulse by coordinates
 * Query params: lat, lon
 */
router.get('/coords', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    console.log(`\n📥 GET /api/local-pulse/coords?lat=${lat}&lon=${lon}`);

    // Validate query params
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_COORDINATES',
        message: 'Both lat and lon query parameters are required',
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_COORDINATES',
        message: 'lat and lon must be valid numbers',
      });
    }

    const result = await localPulseService.getLocalPulseByCoords(latitude, longitude);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('❌ Error in GET /api/local-pulse/coords:', error.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/local-pulse/weather/:city
 * Get weather data only for a city
 */
router.get('/weather/:city', async (req: Request, res: Response) => {
  try {
    const { city } = req.params;
    console.log(`\n📥 GET /api/local-pulse/weather/${city}`);

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CITY',
        message: 'Valid city name required',
      });
    }

    const weather = await localPulseService.getWeatherOnly(city);

    return res.status(200).json({
      success: true,
      data: weather,
    });

  } catch (error: any) {
    console.error(`❌ Error in GET /api/local-pulse/weather:`, error.message);
    
    if (error instanceof LocalPulseError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch weather data',
    });
  }
});

/**
 * GET /api/local-pulse/aqi/:city
 * Get AQI data only for a city
 */
router.get('/aqi/:city', async (req: Request, res: Response) => {
  try {
    const { city } = req.params;
    console.log(`\n📥 GET /api/local-pulse/aqi/${city}`);

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CITY',
        message: 'Valid city name required',
      });
    }

    const aqi = await localPulseService.getAQIOnly(city);

    if (!aqi) {
      return res.status(404).json({
        success: false,
        error: 'AQI_NOT_AVAILABLE',
        message: `AQI data not available for ${city}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: aqi,
    });

  } catch (error: any) {
    console.error(`❌ Error in GET /api/local-pulse/aqi:`, error.message);
    
    if (error instanceof LocalPulseError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch AQI data',
    });
  }
});

/**
 * GET /api/local-pulse/news/:city
 * Get local news/highlights for a city
 */
router.get('/news/:city', async (req: Request, res: Response) => {
  try {
    const { city } = req.params;
    const { state } = req.query;
    console.log(`\n📥 GET /api/local-pulse/news/${city}`);

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CITY',
        message: 'Valid city name required',
      });
    }

    const highlights = await localPulseService.getHighlightsOnly(
      city, 
      state as string | undefined
    );

    return res.status(200).json({
      success: true,
      data: highlights,
      count: highlights.length,
    });

  } catch (error: any) {
    console.error(`❌ Error in GET /api/local-pulse/news:`, error.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch local news',
    });
  }
});

/**
 * POST /api/local-pulse/refresh/:city
 * Force refresh data for a city (bypass cache)
 */
router.post('/refresh/:city', async (req: Request, res: Response) => {
  try {
    const { city } = req.params;
    console.log(`\n📥 POST /api/local-pulse/refresh/${city}`);

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CITY',
        message: 'Valid city name required',
      });
    }

    const result = await localPulseService.refreshCity(city);

    return res.status(200).json({
      ...result,
      refreshed: true,
    });

  } catch (error: any) {
    console.error(`❌ Error in POST /api/local-pulse/refresh:`, error.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to refresh data',
    });
  }
});

/**
 * GET /api/local-pulse/health
 * Health check for Local Pulse services
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    console.log('\n📥 GET /api/local-pulse/health');

    const health = localPulseService.getHealthStatus();

    const allHealthy = 
      health.weather.configured && 
      health.news.enabled;

    return res.status(allHealthy ? 200 : 503).json({
      success: true,
      status: allHealthy ? 'healthy' : 'degraded',
      services: health,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error in GET /api/local-pulse/health:', error.message);
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * POST /api/local-pulse/update-city
 * Update user's current city (authenticated)
 */
router.post('/update-city', optionalAuth, async (req: Request, res: Response) => {
  try {
    console.log('\n📥 POST /api/local-pulse/update-city');

    const userId = (req as any).userId;
    const { city } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CITY',
        message: 'Valid city name required',
      });
    }

    const updated = await localPulseService.updateUserCity(userId, city.trim());

    if (!updated) {
      return res.status(500).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update city',
      });
    }

    return res.status(200).json({
      success: true,
      message: `City updated to ${city}`,
      city: city.trim(),
    });

  } catch (error: any) {
    console.error('❌ Error in POST /api/local-pulse/update-city:', error.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error',
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default router;