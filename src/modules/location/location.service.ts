/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA LOCATION INTELLIGENCE SERVICE v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Risenex Dynamics
 * Date: January 13, 2026
 * 
 * Philosophy:
 * ✅ ONLY DATA - No hardcoded greetings/instructions
 * ✅ LLM handles responses naturally
 * ✅ Service provides context, LLM provides personality
 * 
 * Features:
 * ✅ Reverse Geocoding (Nominatim - FREE)
 * ✅ Home vs Current Location Tracking
 * ✅ Travel Detection
 * ✅ Works Worldwide (India + International)
 * 
 * Cost: FREE (OpenStreetMap Nominatim API)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '../../config/prisma';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  city: string;
  state: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export interface LocationUpdateResult {
  success: boolean;
  location?: LocationData;
  isFirstTime?: boolean;
  error?: string;
}

export interface TravelContext {
  hasLocation: boolean;
  isTraveling: boolean;
  homeCity?: string;
  homeCountry?: string;
  currentCity?: string;
  currentCountry?: string;
  isInternational?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOMINATIM CONFIG (FREE API)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Soriva-AI/1.0 (contact@risenex.com)';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOCATION SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class LocationService {
  private static instance: LocationService;

  private constructor() {
    console.log('[LocationService] 🌍 Initialized v2.0 (Data Only)');
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REVERSE GEOCODING (Coordinates → City, Country)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async reverseGeocode(coords: Coordinates): Promise<LocationData | null> {
    try {
      const { latitude, longitude } = coords;

      const url = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) {
        console.error('[LocationService] ❌ Nominatim error:', response.status);
        return null;
      }

      const data: any = await response.json();

      if (!data?.address) {
        console.error('[LocationService] ❌ No address data');
        return null;
      }

      const address: any = data.address;

      // Extract city (multiple fallbacks)
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        address.district ||
        'Unknown';

      const state = address.state || address.province || address.region || '';
      const country = address.country || 'Unknown';
      const countryCode = address.country_code?.toUpperCase() || 'XX';

      console.log('[LocationService] 📍 Resolved:', { city, country: countryCode });

      return {
        city,
        state,
        country,
        countryCode,
        latitude,
        longitude,
      };
    } catch (error) {
      console.error('[LocationService] ❌ Geocoding error:', error);
      return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UPDATE USER LOCATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async updateLocation(userId: string, coords: Coordinates): Promise<LocationUpdateResult> {
    try {
      // Get location from coordinates
      const location = await this.reverseGeocode(coords);

      if (!location) {
        return { success: false, error: 'Could not resolve location' };
      }

      // Get user's current data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { homeCity: true },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const isFirstTime = !user.homeCity;

      // First time = Set as home + current
      if (isFirstTime) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            // Home
            homeCity: location.city,
            homeState: location.state,
            homeCountry: location.country,
            homeCountryCode: location.countryCode,
            homeLatitude: location.latitude,
            homeLongitude: location.longitude,
            homeLocationSetAt: new Date(),
            // Current
            currentCity: location.city,
            currentState: location.state,
            currentCountry: location.country,
            currentCountryCode: location.countryCode,
            currentLatitude: location.latitude,
            currentLongitude: location.longitude,
            currentLocationUpdatedAt: new Date(),
            // Permission
            locationPermissionGranted: true,
          },
        });

        console.log('[LocationService] 🏠 Home set:', location.city);
      } else {
        // Not first time = Update current only
        await prisma.user.update({
          where: { id: userId },
          data: {
            currentCity: location.city,
            currentState: location.state,
            currentCountry: location.country,
            currentCountryCode: location.countryCode,
            currentLatitude: location.latitude,
            currentLongitude: location.longitude,
            currentLocationUpdatedAt: new Date(),
            locationPermissionGranted: true,
          },
        });

        console.log('[LocationService] 📍 Current updated:', location.city);
      }

      return {
        success: true,
        location,
        isFirstTime,
      };
    } catch (error) {
      console.error('[LocationService] ❌ Update error:', error);
      return { success: false, error: 'Failed to update location' };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET TRAVEL CONTEXT (For chat - ONLY DATA)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getTravelContext(userId: string): Promise<TravelContext> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          homeCity: true,
          homeCountry: true,
          homeCountryCode: true,
          currentCity: true,
          currentCountry: true,
          currentCountryCode: true,
          locationPermissionGranted: true,
        },
      });

      // No permission or no location
      if (!user?.locationPermissionGranted || !user.homeCity) {
        return { hasLocation: false, isTraveling: false };
      }

      // Check if traveling (different city)
      const isTraveling = !this.isSameCity(user.homeCity, user.currentCity || '');
      const isInternational = user.homeCountryCode !== user.currentCountryCode;

      return {
        hasLocation: true,
        isTraveling,
        homeCity: user.homeCity,
        homeCountry: user.homeCountry || undefined,
        currentCity: user.currentCity || undefined,
        currentCountry: user.currentCountry || undefined,
        isInternational: isTraveling ? isInternational : undefined,
      };
    } catch (error) {
      console.error('[LocationService] ❌ Travel context error:', error);
      return { hasLocation: false, isTraveling: false };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET LOCATION STRING FOR PROMPT (~5-10 tokens)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getLocationPrompt(userId: string): Promise<string> {
    const context = await this.getTravelContext(userId);

    // No location = empty string (0 tokens)
    if (!context.hasLocation) return '';

    // Not traveling = just current city (~3 tokens)
    if (!context.isTraveling) {
      return `📍 ${context.currentCity}`;
    }

    // Traveling domestic (~6 tokens)
    if (!context.isInternational) {
      return `📍 ${context.homeCity}→${context.currentCity}`;
    }

    // Traveling international (~10 tokens)
    return `📍 ${context.homeCity},${context.homeCountry}→${context.currentCity},${context.currentCountry}`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET CURRENT LOCATION (Simple getter)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getCurrentLocation(userId: string): Promise<LocationData | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          currentCity: true,
          currentState: true,
          currentCountry: true,
          currentCountryCode: true,
          currentLatitude: true,
          currentLongitude: true,
          locationPermissionGranted: true,
        },
      });

      if (!user?.locationPermissionGranted || !user.currentCity) {
        return null;
      }

      return {
        city: user.currentCity,
        state: user.currentState || '',
        country: user.currentCountry || '',
        countryCode: user.currentCountryCode || '',
        latitude: user.currentLatitude || 0,
        longitude: user.currentLongitude || 0,
      };
    } catch (error) {
      console.error('[LocationService] ❌ Get location error:', error);
      return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PERMISSION HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async setPermissionDenied(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          locationPermissionGranted: false,
          locationPermissionAskedAt: new Date(),
        },
      });
      console.log('[LocationService] ❌ Permission denied:', userId);
    } catch (error) {
      console.error('[LocationService] ❌ Set permission error:', error);
    }
  }

  async shouldAskPermission(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          locationPermissionGranted: true,
          locationPermissionAskedAt: true,
        },
      });

      if (!user) return false;

      // Already granted
      if (user.locationPermissionGranted) return false;

      // Never asked
      if (!user.locationPermissionAskedAt) return true;

      // Denied = don't ask again for 7 days
      const daysSinceAsked = Math.floor(
        (Date.now() - user.locationPermissionAskedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceAsked >= 7;
    } catch (error) {
      console.error('[LocationService] ❌ Should ask error:', error);
      return false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET SEARCH CONTEXT (For Tavily/Web Search - Hyper Local)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getSearchContext(userId: string): Promise<{
    city: string;
    state: string;
    country: string;
    countryCode: string;
    searchString: string;
  } | null> {
    const location = await this.getCurrentLocation(userId);
    
    // 🔍 DEBUG: Location data check
    console.log('📍 [LocationService] getSearchContext:', {
      locationFound: !!location,
      city: location?.city || 'N/A',
      state: location?.state || 'N/A',
      country: location?.country || 'N/A',
    });
    
    if (!location) {
      console.log('📍 [LocationService] ❌ No location - returning null');
      return null;
    }

    const searchString = `${location.city} ${location.state} ${location.country}`.trim();
    
    console.log('📍 [LocationService] ✅ SEARCH STRING:', searchString);

    return {
      city: location.city,
      state: location.state,
      country: location.country,
      countryCode: location.countryCode,
      searchString
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER: Same city check (fuzzy)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private isSameCity(city1: string, city2: string): boolean {
    if (!city1 || !city2) return false;
    const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    return normalize(city1) === normalize(city2);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const locationService = LocationService.getInstance();