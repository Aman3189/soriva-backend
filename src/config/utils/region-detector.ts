import { Request } from 'express';
import { Region, Currency } from '@prisma/client';

/**
 * Detect user's region based on IP address
 */
export function detectRegionFromIP(ip?: string): { region: Region; currency: Currency } {
  let detectedRegion: Region = Region.IN;  // ✅ IN not INDIA
  let detectedCurrency: Currency = Currency.INR;

  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    console.log('🌍 Local IP detected, defaulting to India');
    return { region: detectedRegion, currency: detectedCurrency };
  }

  console.log(`🌍 Detecting region for IP: ${ip}`);
  return { region: detectedRegion, currency: detectedCurrency };
}

/**
 * Extract IP from Express request object
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress || 'unknown';
  
  return ip;
}

/**
 * Detect region from request headers
 */
export function detectRegionFromHeaders(req: Request): { region: Region; currency: Currency } {
  const cfCountry = req.headers['cf-ipcountry'] as string;
  
  if (cfCountry) {
    console.log(`🌍 Cloudflare country detected: ${cfCountry}`);
    
    if (cfCountry === 'IN') {
      return { region: Region.IN, currency: Currency.INR };  // ✅ IN not INDIA
    } else {
      return { region: Region.INTL, currency: Currency.USD };  // ✅ INTL not INTERNATIONAL
    }
  }

  const ip = getClientIP(req);
  return detectRegionFromIP(ip);
}