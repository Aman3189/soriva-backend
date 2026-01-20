// ═══════════════════════════════════════════════════════════════════════════
// File: src/services/local-pulse/local-pulse.service.ts
// Soriva Local Pulse™ - Master Orchestrator Service (International)
// Combines Weather + AQI + Local News into unified response
// ═══════════════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import { weatherService } from './weather.service';
import { aqiService } from './aqi.service';
import { localNewsService } from './local-news.service';
import {
  getCityInfo,
  getCountryInfo,
  getStateFromCity,
  getCountryFromCity,
  formatFullLocation,
  capitalizeCity,
} from './location.helper';
import {
  LocalPulseData,
  LocalPulseResponse,
  WeatherData,
  AQIData,
  LocalHighlight,
  UserLocation,
  LocalPulseError,
  CountryCode,
} from '../../types/local-pulse.types';

// ═══════════════════════════════════════════════════════════════════════════
// PRISMA CLIENT
// ═══════════════════════════════════════════════════════════════════════════

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  refreshInterval: 15, // minutes
  defaultCity: 'Delhi',
  defaultCountry: 'IN' as CountryCode,
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate next refresh time
 */
function getNextRefreshTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + CONFIG.refreshInterval);
  return now.toISOString();
}

/**
 * Get resolved city from UserLocation (priority: current > home > detected)
 */
function getResolvedCity(location: UserLocation): string | undefined {
  return location.currentCity || location.homeCity || location.detectedCity;
}

/**
 * Create empty UserLocation object
 */
function createEmptyUserLocation(): UserLocation {
  return {
    homeCity: undefined,
    currentCity: undefined,
    detectedCity: undefined,
    country: undefined,
    latitude: undefined,
    longitude: undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL PULSE SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class LocalPulseService {
  /**
   * Get complete Local Pulse data for a user
   */
  async getLocalPulse(userId?: string): Promise<LocalPulseResponse> {
    try {
      // Step 1: Get user's location
      const location = await this.getUserLocation(userId);
      const city = getResolvedCity(location);

      if (!city) {
        return {
          success: false,
          data: null,
          error: 'LOCATION_REQUIRED',
          message: 'Location permission required for Local Pulse',
        };
      }

      // Step 2: Get location details
      const state = getStateFromCity(city);
      const country = location.country || getCountryFromCity(city);

      // Step 3: Fetch all data in parallel
      const pulseData = await this.fetchPulseData(city, state, country);

      return {
        success: true,
        data: pulseData,
      };

    } catch (error: any) {
      console.error('❌ Local Pulse error:', error.message);

      if (error instanceof LocalPulseError) {
        return {
          success: false,
          data: null,
          error: error.code,
          message: error.message,
        };
      }

      return {
        success: false,
        data: null,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Local Pulse service temporarily unavailable',
      };
    }
  }

  /**
   * Get Local Pulse data by city name (public endpoint)
   */
  async getLocalPulseByCity(city: string, countryHint?: CountryCode): Promise<LocalPulseResponse> {
    try {
      if (!city || city.trim().length < 2) {
        return {
          success: false,
          data: null,
          error: 'LOCATION_REQUIRED',
          message: 'Valid city name required',
        };
      }

      const cleanCity = city.trim();
      const state = getStateFromCity(cleanCity);
      const country = countryHint || getCountryFromCity(cleanCity);
      
      const pulseData = await this.fetchPulseData(cleanCity, state, country);

      return {
        success: true,
        data: pulseData,
      };

    } catch (error: any) {
      console.error('❌ Local Pulse error:', error.message);

      if (error instanceof LocalPulseError) {
        return {
          success: false,
          data: null,
          error: error.code,
          message: error.message,
        };
      }

      return {
        success: false,
        data: null,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Local Pulse service temporarily unavailable',
      };
    }
  }

  /**
   * Get Local Pulse data by coordinates
   */
  async getLocalPulseByCoords(lat: number, lon: number): Promise<LocalPulseResponse> {
    try {
      // Validate coordinates
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return {
          success: false,
          data: null,
          error: 'INVALID_COORDINATES',
          message: 'Invalid latitude or longitude',
        };
      }

      // Fetch weather by coords (will also get city name)
      const [weather, aqi] = await Promise.all([
        weatherService.getWeatherByCoords(lat, lon),
        aqiService.getAQIByCoords(lat, lon),
      ]);

      // For news, use default highlights (no city name from coords)
      const highlights = await localNewsService.getHighlights('Local Area');

      const pulseData: LocalPulseData = {
        location: {
          city: 'Current Location',
          state: '',
          country: 'OTHER',
          countryName: 'Unknown',
          formatted: 'Current Location',
          region: 'INTL',
        },
        weather,
        airQuality: aqi,
        highlights,
        updatedAt: new Date().toISOString(),
        nextRefresh: getNextRefreshTime(),
      };

      return {
        success: true,
        data: pulseData,
      };

    } catch (error: any) {
      console.error('❌ Local Pulse coords error:', error.message);

      return {
        success: false,
        data: null,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Failed to fetch location data',
      };
    }
  }

  /**
   * Fetch all pulse data in parallel
   */
  private async fetchPulseData(
    city: string, 
    state: string, 
    country: CountryCode
  ): Promise<LocalPulseData> {
    const countryInfo = getCountryInfo(country);
    const formattedCity = capitalizeCity(city);
    
    console.log(`\n🌍 Fetching Local Pulse for: ${formattedCity}, ${state || countryInfo.name}`);

    // Parallel fetch for performance
    const [weather, aqi, highlights] = await Promise.all([
      weatherService.getWeatherByCity(city),
      aqiService.getAQIByCity(city).catch(() => null), // AQI is optional
      localNewsService.getHighlights(city, state, country),
    ]);

    return {
      location: {
        city: formattedCity,
        state: state || '',
        country: country,
        countryName: countryInfo.name,
        formatted: formatFullLocation(formattedCity, state, country),
        region: countryInfo.region,
      },
      weather,
      airQuality: aqi,
      highlights,
      updatedAt: new Date().toISOString(),
      nextRefresh: getNextRefreshTime(),
    };
  }

  /**
   * Get user's location from database
   */
  private async getUserLocation(userId?: string): Promise<UserLocation> {
    if (!userId) {
      return createEmptyUserLocation();
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          homeCity: true,
          currentCity: true,
          // Add country field if exists in your schema
          // country: true,
        },
      });

      if (!user) {
        return createEmptyUserLocation();
      }

      // Determine country from city
      const city = user.currentCity || user.homeCity;
      const country = city ? getCountryFromCity(city) : undefined;

      return {
        homeCity: user.homeCity || undefined,
        currentCity: user.currentCity || undefined,
        detectedCity: undefined,
        country: country,
        latitude: undefined,
        longitude: undefined,
      };

    } catch (error: any) {
      console.error('❌ Error fetching user location:', error.message);
      return createEmptyUserLocation();
    }
  }

  /**
   * Update user's current city
   */
  async updateUserCity(userId: string, city: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { currentCity: city },
      });

      console.log(`✅ Updated current city for user ${userId}: ${city}`);
      return true;

    } catch (error: any) {
      console.error('❌ Error updating user city:', error.message);
      return false;
    }
  }

  /**
   * Get just weather data
   */
  async getWeatherOnly(city: string): Promise<WeatherData> {
    return weatherService.getWeatherByCity(city);
  }

  /**
   * Get just AQI data
   */
  async getAQIOnly(city: string): Promise<AQIData | null> {
    return aqiService.getAQIByCity(city);
  }

  /**
   * Get just highlights
   */
  async getHighlightsOnly(city: string, state?: string, country?: CountryCode): Promise<LocalHighlight[]> {
    return localNewsService.getHighlights(city, state, country);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    weatherService.clearCache();
    aqiService.clearCache();
    localNewsService.clearCache();
    console.log('🗑️ All Local Pulse caches cleared');
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    weather: { configured: boolean; cacheSize: number };
    aqi: { configured: boolean; enabled: boolean; cacheSize: number };
    news: { enabled: boolean; cacheSize: number };
  } {
    return {
      weather: {
        configured: weatherService.isConfigured(),
        cacheSize: weatherService.getCacheStats().size,
      },
      aqi: {
        configured: aqiService.isConfigured(),
        enabled: aqiService.isEnabled(),
        cacheSize: aqiService.getCacheStats().size,
      },
      news: {
        enabled: localNewsService.isEnabled(),
        cacheSize: localNewsService.getCacheStats().size,
      },
    };
  }

  /**
   * Refresh data for a city (force fetch, bypass cache)
   */
  async refreshCity(city: string): Promise<LocalPulseResponse> {
    // Clear caches for this city
    weatherService.clearCache(city);
    aqiService.clearCache(city);
    localNewsService.clearCache(city);

    // Fetch fresh data
    return this.getLocalPulseByCity(city);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const localPulseService = new LocalPulseService();
export default localPulseService;