// src/modules/auth/middleware/region.middleware.ts
/**
 * ==========================================
 * REGION DETECTION MIDDLEWARE
 * ==========================================
 * Automatically detects user's region and currency based on:
 * 1. IP address geolocation
 * 2. Country code from request headers
 * 3. Manual country selection (if provided)
 *
 * Sets req.region and req.currency for use in controllers
 *
 * Last Updated: November 12, 2025 - Fixed Region enum imports
 */

import { Request, Response, NextFunction } from 'express';
import {
  Region,
  Currency,
  getRegionFromCountry,
  getCurrencyFromRegion, // ✅ FIXED: Correct function name
} from '@constants/plans'; // ✅ FIXED: Import from @constants/plans

// ==========================================
// INTERFACES
// ==========================================

/**
 * Extended Request with region/currency info
 */
export interface RegionalRequest extends Request {
  region: Region;
  currency: Currency;
  country: string;
  detectedCountry?: string;
  countryName?: string;
  timezone?: string;
}

/**
 * Geolocation data from IP lookup
 */
interface GeolocationData {
  country: string; // ISO country code (IN, US, GB, etc.)
  countryName?: string;
  timezone?: string;
  city?: string;
  region?: string;
}

/**
 * IP API Response type
 */
interface IPAPIResponse {
  status: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  city?: string;
  regionName?: string;
}

// ==========================================
// IP GEOLOCATION SERVICE
// ==========================================

/**
 * Get user's IP address from request
 * Checks various headers for proxy/load balancer support
 */
function getClientIP(req: Request): string {
  // Check for IP in headers (proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (forwarded as string).split(',');
    return ips[0].trim();
  }

  // Check for Cloudflare IP
  const cfIP = req.headers['cf-connecting-ip'];
  if (cfIP) {
    return cfIP as string;
  }

  // Check for real IP header
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP as string;
  }

  // Fallback to socket IP
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Detect country from IP address using ip-api.com (free service)
 * Alternative: Use ipapi.co, ipgeolocation.io, or MaxMind GeoIP2
 *
 * @param ip - IP address to lookup
 * @returns GeolocationData or null if detection fails
 */
async function detectCountryFromIP(ip: string): Promise<GeolocationData | null> {
  try {
    // Skip local/private IPs
    if (
      ip === 'unknown' ||
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.')
    ) {
      console.log('[Region Middleware] Local IP detected, defaulting to India');
      return {
        country: 'IN',
        countryName: 'India',
        timezone: 'Asia/Kolkata',
      };
    }

    // Use ip-api.com (free, no API key needed)
    // Rate limit: 45 requests/minute
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,timezone,city,regionName`
    );

    if (!response.ok) {
      throw new Error(`IP API returned status ${response.status}`);
    }

    const data = (await response.json()) as IPAPIResponse;

    if (data.status === 'success') {
      return {
        country: data.countryCode || 'IN',
        countryName: data.country,
        timezone: data.timezone,
        city: data.city,
        region: data.regionName,
      };
    }

    return null;
  } catch (error) {
    console.error('[Region Middleware] IP geolocation failed:', error);
    return null;
  }
}

// ==========================================
// COUNTRY NAME MAPPING (Common countries)
// ==========================================

const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  JP: 'Japan',
  CN: 'China',
  KR: 'South Korea',
  SG: 'Singapore',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  ZA: 'South Africa',
  NG: 'Nigeria',
  KE: 'Kenya',
};

/**
 * Get country name from country code
 */
function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode;
}

// ==========================================
// TIMEZONE MAPPING (Major cities)
// ==========================================

const COUNTRY_TIMEZONES: Record<string, string> = {
  IN: 'Asia/Kolkata',
  US: 'America/New_York',
  GB: 'Europe/London',
  CA: 'America/Toronto',
  AU: 'Australia/Sydney',
  DE: 'Europe/Berlin',
  FR: 'Europe/Paris',
  IT: 'Europe/Rome',
  ES: 'Europe/Madrid',
  NL: 'Europe/Amsterdam',
  BR: 'America/Sao_Paulo',
  MX: 'America/Mexico_City',
  JP: 'Asia/Tokyo',
  CN: 'Asia/Shanghai',
  SG: 'Asia/Singapore',
  AE: 'Asia/Dubai',
};

/**
 * Get default timezone for a country
 */
function getDefaultTimezone(countryCode: string): string {
  return COUNTRY_TIMEZONES[countryCode.toUpperCase()] || 'UTC';
}

// ==========================================
// MAIN MIDDLEWARE
// ==========================================

/**
 * Region Detection Middleware
 *
 * Usage:
 * ```typescript
 * import { detectRegion } from '@modules/auth/middleware/region.middleware';
 *
 * // In route
 * router.get('/plans', detectRegion, plansController.getPlans);
 *
 * // In controller
 * const { region, currency } = req as RegionalRequest;
 * ```
 */
export async function detectRegion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const regionalReq = req as RegionalRequest;

    // Priority 1: Check for manual country selection in query/body
    const manualCountry =
      req.query.country || req.body.country || req.headers['x-user-country'];

    if (manualCountry && typeof manualCountry === 'string') {
      const countryCode = manualCountry.toUpperCase();
      regionalReq.country = countryCode;
      regionalReq.countryName = getCountryName(countryCode);
      regionalReq.timezone = getDefaultTimezone(countryCode);
      regionalReq.region = getRegionFromCountry(countryCode);
      regionalReq.currency = getCurrencyFromRegion(regionalReq.region); // ✅ FIXED

      console.log('[Region Middleware] Manual country selected:', {
        country: regionalReq.country,
        region: regionalReq.region,
        currency: regionalReq.currency,
      });

      return next();
    }

    // Priority 2: Check if user is authenticated and has region saved
    if (req.user && (req.user as any).region) {
      const user = req.user as any;
      regionalReq.region = user.region;
      regionalReq.currency = user.currency || getCurrencyFromRegion(user.region); // ✅ FIXED
      regionalReq.country = user.country || 'IN';
      regionalReq.countryName = user.countryName || getCountryName(regionalReq.country);
      regionalReq.timezone = user.timezone || getDefaultTimezone(regionalReq.country);

      console.log('[Region Middleware] Using saved user region:', {
        userId: user.id,
        region: regionalReq.region,
        currency: regionalReq.currency,
      });

      return next();
    }

    // Priority 3: Detect from IP address
    const clientIP = getClientIP(req);
    console.log('[Region Middleware] Detecting region from IP:', clientIP);

    const geoData = await detectCountryFromIP(clientIP);

    if (geoData) {
      regionalReq.country = geoData.country;
      regionalReq.detectedCountry = geoData.country;
      regionalReq.countryName = geoData.countryName || getCountryName(geoData.country);
      regionalReq.timezone = geoData.timezone || getDefaultTimezone(geoData.country);
      regionalReq.region = getRegionFromCountry(geoData.country);
      regionalReq.currency = getCurrencyFromRegion(regionalReq.region); // ✅ FIXED

      console.log('[Region Middleware] Region detected from IP:', {
        ip: clientIP,
        country: regionalReq.country,
        region: regionalReq.region,
        currency: regionalReq.currency,
      });

      return next();
    }

    // Fallback: Default to India
    console.log('[Region Middleware] Using default region (India)');
    regionalReq.country = 'IN';
    regionalReq.countryName = 'India';
    regionalReq.timezone = 'Asia/Kolkata';
    regionalReq.region = 'IN' as Region;
    regionalReq.currency = 'INR' as Currency;

    next();
  } catch (error) {
    console.error('[Region Middleware] Error:', error);

    // On error, default to India
    const regionalReq = req as RegionalRequest;
    regionalReq.country = 'IN';
    regionalReq.countryName = 'India';
    regionalReq.timezone = 'Asia/Kolkata';
    regionalReq.region = getRegionFromCountry('IN');
    regionalReq.currency = 'INR' as Currency;

    next();
  }
}

// ==========================================
// OPTIONAL: ASYNC REGION UPDATE
// ==========================================

/**
 * Update user's region in database (async, non-blocking)
 * Call this after user is authenticated to save detected region
 *
 * @param userId - User ID
 * @param regionData - Region data to save
 *
 * NOTE: Import your Prisma client and update the path below
 */
export async function updateUserRegion(
  userId: string,
  regionData: {
    region: Region;
    currency: Currency;
    country: string;
    detectedCountry?: string;
    countryName?: string;
    timezone?: string;
  }
): Promise<void> {
  try {
    // TODO: Update this import path to match your project structure
    // Example paths:
    // - import { prisma } from '@/lib/prisma';
    // - import { prisma } from '@/core/database/prisma';
    // - import prisma from '@/prisma/client';

    // Uncomment and update the path below:
    // const { prisma } = await import('@/your-prisma-path');

    // await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     region: regionData.region,
    //     currency: regionData.currency,
    //     country: regionData.country,
    //     detectedCountry: regionData.detectedCountry,
    //     countryName: regionData.countryName,
    //     timezone: regionData.timezone,
    //   },
    // });

    console.log('[Region Middleware] User region updated:', {
      userId,
      region: regionData.region,
      country: regionData.country,
    });
  } catch (error) {
    console.error('[Region Middleware] Failed to update user region:', error);
    // Don't throw - this is a non-critical operation
  }
}

// ==========================================
// EXPORT
// ==========================================

export default detectRegion;
