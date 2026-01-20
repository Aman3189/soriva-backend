// ═══════════════════════════════════════════════════════════════════════════
// File: src/services/local-pulse/aqi.service.ts
// Soriva Local Pulse™ - Air Quality Index Service (AQICN)
// ═══════════════════════════════════════════════════════════════════════════

import axios from 'axios';
import {
  AQIData,
  AQILevel,
  AQIAPIResponse,
  CacheEntry,
  LocalPulseError,
} from '../../types/local-pulse.types';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  apiKey: process.env.AQICN_API_KEY || '',
  baseUrl: 'https://api.waqi.info/feed',
  cacheTTL: 30 * 60 * 1000, // 30 minutes in milliseconds
  timeout: 10000, // 10 seconds
  enabled: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE
// ═══════════════════════════════════════════════════════════════════════════

const aqiCache = new Map<string, CacheEntry<AQIData>>();

// ═══════════════════════════════════════════════════════════════════════════
// AQI LEVEL DEFINITIONS
// Based on US EPA Air Quality Index
// ═══════════════════════════════════════════════════════════════════════════

interface AQILevelInfo {
  level: AQILevel;
  color: string;
  message: string;
  recommendation: string;
}

const AQI_LEVELS: { max: number; info: AQILevelInfo }[] = [
  {
    max: 50,
    info: {
      level: 'Good',
      color: '#00E400',
      message: 'Clean air • Outdoor-friendly today',
      recommendation: 'Perfect day for outdoor activities!',
    },
  },
  {
    max: 100,
    info: {
      level: 'Moderate',
      color: '#FFFF00',
      message: 'Acceptable air quality',
      recommendation: 'Unusually sensitive people should limit prolonged outdoor exertion.',
    },
  },
  {
    max: 150,
    info: {
      level: 'Unhealthy for Sensitive',
      color: '#FF7E00',
      message: 'Sensitive groups take care',
      recommendation: 'Children, elderly, and those with respiratory issues should limit outdoor time.',
    },
  },
  {
    max: 200,
    info: {
      level: 'Unhealthy',
      color: '#FF0000',
      message: 'Health risk — limit outdoor exposure',
      recommendation: 'Everyone should reduce prolonged outdoor exertion. Wear mask if going out.',
    },
  },
  {
    max: 300,
    info: {
      level: 'Very Unhealthy',
      color: '#8F3F97',
      message: 'Serious health risk — stay indoors',
      recommendation: 'Avoid outdoor activities. Keep windows closed. Use air purifier if available.',
    },
  },
  {
    max: 500,
    info: {
      level: 'Hazardous',
      color: '#7E0023',
      message: 'Emergency conditions — do not go outside',
      recommendation: 'Stay indoors with windows sealed. Use N95 mask if must go out. Health emergency.',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// POLLUTANT NAMES
// ═══════════════════════════════════════════════════════════════════════════

const POLLUTANT_NAMES: Record<string, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3: 'Ozone',
  no2: 'Nitrogen Dioxide',
  so2: 'Sulfur Dioxide',
  co: 'Carbon Monoxide',
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get AQI level info based on AQI value
 */
function getAQILevelInfo(aqi: number): AQILevelInfo {
  for (const level of AQI_LEVELS) {
    if (aqi <= level.max) {
      return level.info;
    }
  }
  // If AQI > 500, return Hazardous
  return AQI_LEVELS[AQI_LEVELS.length - 1].info;
}

/**
 * Generate cache key from city name
 */
function getCacheKey(city: string): string {
  return `aqi_${city.toLowerCase().trim().replace(/\s+/g, '_')}`;
}

/**
 * Get dominant pollutant name
 */
function getPollutantName(pollutant?: string): string {
  if (!pollutant) return 'PM2.5';
  return POLLUTANT_NAMES[pollutant.toLowerCase()] || pollutant.toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════════
// AQI SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class AQIService {
  private apiKey: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = CONFIG.apiKey;
    this.baseUrl = CONFIG.baseUrl;
    this.enabled = CONFIG.enabled && !!this.apiKey;

    if (!this.apiKey) {
      console.warn('⚠️ AQICN_API_KEY not set. AQI service will be disabled.');
    }
  }

  /**
   * Get AQI by city name
   */
  async getAQIByCity(city: string): Promise<AQIData | null> {
    if (!this.enabled) {
      console.log('⚠️ AQI service is disabled');
      return null;
    }

    const cacheKey = getCacheKey(city);

    // Check cache first
    const cached = aqiCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`📦 AQI cache hit for: ${city}`);
      return cached.data;
    }

    console.log(`🌬️ Fetching AQI for: ${city}`);

    try {
      const response = await axios.get<AQIAPIResponse>(
        `${this.baseUrl}/${encodeURIComponent(city)}/`,
        {
          params: { token: this.apiKey },
          timeout: CONFIG.timeout,
        }
      );

      if (response.data.status !== 'ok') {
        console.warn(`⚠️ AQI not available for: ${city}`);
        return null;
      }

      const data = response.data.data;
      const aqiData = this.transformResponse(data);

      // Cache the result
      aqiCache.set(cacheKey, {
        data: aqiData,
        expiresAt: Date.now() + CONFIG.cacheTTL,
        city: cacheKey,
      });

      console.log(`✅ AQI fetched for ${city}: ${aqiData.aqi} (${aqiData.level})`);
      return aqiData;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new LocalPulseError(
            'AQI API rate limit exceeded',
            'RATE_LIMIT_EXCEEDED',
            429
          );
        }
      }

      console.error(`❌ AQI fetch error for ${city}:`, error.message);
      // Return null instead of throwing - AQI is optional
      return null;
    }
  }

  /**
   * Get AQI by coordinates
   */
  async getAQIByCoords(lat: number, lon: number): Promise<AQIData | null> {
    if (!this.enabled) {
      console.log('⚠️ AQI service is disabled');
      return null;
    }

    const cacheKey = `aqi_${lat.toFixed(2)}_${lon.toFixed(2)}`;

    // Check cache first
    const cached = aqiCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`📦 AQI cache hit for coords: ${lat}, ${lon}`);
      return cached.data;
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      console.warn('⚠️ Invalid coordinates for AQI');
      return null;
    }

    console.log(`🌬️ Fetching AQI for coords: ${lat}, ${lon}`);

    try {
      const response = await axios.get<AQIAPIResponse>(
        `${this.baseUrl}/geo:${lat};${lon}/`,
        {
          params: { token: this.apiKey },
          timeout: CONFIG.timeout,
        }
      );

      if (response.data.status !== 'ok') {
        console.warn(`⚠️ AQI not available for coords: ${lat}, ${lon}`);
        return null;
      }

      const data = response.data.data;
      const aqiData = this.transformResponse(data);

      // Cache the result
      aqiCache.set(cacheKey, {
        data: aqiData,
        expiresAt: Date.now() + CONFIG.cacheTTL,
        city: cacheKey,
      });

      console.log(`✅ AQI fetched for coords: ${aqiData.aqi} (${aqiData.level})`);
      return aqiData;

    } catch (error: any) {
      console.error(`❌ AQI fetch error for coords:`, error.message);
      return null;
    }
  }

  /**
   * Transform AQICN response to our AQIData format
   */
  private transformResponse(data: AQIAPIResponse['data']): AQIData {
    const aqi = data.aqi;
    const levelInfo = getAQILevelInfo(aqi);
    const pollutant = getPollutantName(data.dominentpol);

    return {
      aqi,
      level: levelInfo.level,
      message: levelInfo.message,
      pollutant,
      color: levelInfo.color,
      recommendation: levelInfo.recommendation,
      updatedAt: data.time?.iso || new Date().toISOString(),
    };
  }

  /**
   * Get AQI level info (for external use)
   */
  getAQILevel(aqi: number): AQILevelInfo {
    return getAQILevelInfo(aqi);
  }

  /**
   * Clear cache for a specific city
   */
  clearCache(city?: string): void {
    if (city) {
      const cacheKey = getCacheKey(city);
      aqiCache.delete(cacheKey);
      console.log(`🗑️ AQI cache cleared for: ${city}`);
    } else {
      aqiCache.clear();
      console.log('🗑️ AQI cache cleared completely');
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: aqiCache.size,
      entries: Array.from(aqiCache.keys()),
    };
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const aqiService = new AQIService();
export default aqiService;