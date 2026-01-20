// ═══════════════════════════════════════════════════════════════════════════
// File: src/types/local-pulse.types.ts
// Soriva Local Pulse™ - Type Definitions (International Support)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// COUNTRY & REGION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CountryCode = 
  | 'IN' | 'US' | 'GB' | 'CA' | 'AU' | 'AE' | 'SG' 
  | 'DE' | 'FR' | 'IT' | 'ES' | 'NL' | 'JP' | 'CN'
  | 'BR' | 'MX' | 'SA' | 'QA' | 'KW' | 'OM' | 'BH'
  | 'NZ' | 'ZA' | 'IE' | 'CH' | 'SE' | 'NO' | 'DK'
  | 'FI' | 'PL' | 'AT' | 'BE' | 'PT' | 'GR' | 'CZ'
  | 'HU' | 'RO' | 'IL' | 'TH' | 'MY' | 'ID' | 'PH'
  | 'VN' | 'KR' | 'TW' | 'HK' | 'BD' | 'PK' | 'LK'
  | 'NP' | 'OTHER';

export type SorivaRegion = 'IN' | 'INTL';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  region: SorivaRegion;
  timezone: string;
  newsLang: string;    // Google News language code
  newsCeid: string;    // Google News country edition
  currency: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// WEATHER TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface WeatherData {
  temperature: number;          // Current temp in Celsius
  feelsLike: number;            // Feels like temp
  humidity: number;             // Humidity percentage
  condition: WeatherCondition;  // Clear, Cloudy, Rainy, etc.
  conditionCode: number;        // OpenWeatherMap condition code
  icon: string;                 // Weather icon code
  windSpeed: number;            // Wind speed in km/h
  windDirection: string;        // N, NE, E, SE, S, SW, W, NW
  visibility: number;           // Visibility in km
  pressure: number;             // Atmospheric pressure in hPa
  sunrise: string;              // ISO timestamp
  sunset: string;               // ISO timestamp
  moodLine: string;             // AI-generated mood line
  updatedAt: string;            // ISO timestamp
}

export type WeatherCondition = 
  | 'Clear'
  | 'Sunny'
  | 'Partly Cloudy'
  | 'Cloudy'
  | 'Overcast'
  | 'Mist'
  | 'Fog'
  | 'Light Rain'
  | 'Rain'
  | 'Heavy Rain'
  | 'Thunderstorm'
  | 'Snow'
  | 'Haze'
  | 'Dust'
  | 'Smoke';

// OpenWeatherMap API Response (partial - only what we need)
export interface OpenWeatherResponse {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  coord: {
    lat: number;
    lon: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AIR QUALITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AQIData {
  aqi: number;                  // AQI value (0-500)
  level: AQILevel;              // Good, Moderate, Unhealthy, etc.
  message: string;              // User-friendly message
  pollutant: string;            // Dominant pollutant (PM2.5, PM10, etc.)
  color: string;                // Hex color for UI
  recommendation: string;       // Health recommendation
  updatedAt: string;            // ISO timestamp
}

export type AQILevel = 
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

// AQICN/IQAir API Response (partial)
export interface AQIAPIResponse {
  status: string;
  data: {
    aqi: number;
    idx: number;
    city: {
      name: string;
      geo: [number, number];
    };
    dominentpol?: string;
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      co?: { v: number };
    };
    time: {
      iso: string;
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL NEWS/HIGHLIGHTS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LocalHighlight {
  id: string;                   // Unique identifier
  icon: string;                 // Emoji icon
  title: string;                // Short headline
  description: string;          // Brief description
  category: HighlightCategory;  // Traffic, Market, Weather, Event, etc.
  source?: string;              // Source name (optional)
  url?: string;                 // Source URL (optional)
  timestamp: string;            // ISO timestamp
}

export type HighlightCategory = 
  | 'traffic'
  | 'market'
  | 'weather_alert'
  | 'event'
  | 'utility'
  | 'general';

// Google News RSS Item (parsed)
export interface NewsRSSItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCATION TYPES (International)
// ═══════════════════════════════════════════════════════════════════════════

export interface LocationData {
  city: string;                 // City name (e.g., "Ferozepur", "New York")
  state: string;                // State/Province name (e.g., "Punjab", "New York")
  country: CountryCode;         // Country code (e.g., "IN", "US")
  countryName: string;          // Country name (e.g., "India", "United States")
  latitude: number;
  longitude: number;
  timezone: string;             // e.g., "Asia/Kolkata", "America/New_York"
  region: SorivaRegion;         // Soriva region (IN or INTL)
}

export interface UserLocation {
  homeCity?: string;            // User's home city (from DB)
  currentCity?: string;         // User's current city (from DB)
  detectedCity?: string;        // Auto-detected city
  country?: CountryCode;        // User's country
  latitude?: number;
  longitude?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL PULSE RESPONSE TYPES (International)
// ═══════════════════════════════════════════════════════════════════════════

export interface LocalPulseData {
  location: {
    city: string;
    state: string;
    country: CountryCode;
    countryName: string;
    formatted: string;          // "Ferozepur, Punjab, India" or "New York, NY, USA"
    region: SorivaRegion;
  };
  weather: WeatherData;
  airQuality: AQIData | null;   // Null if AQI not available for location
  highlights: LocalHighlight[];
  updatedAt: string;
  nextRefresh: string;          // When data will be refreshed
}

export interface LocalPulseResponse {
  success: boolean;
  data: LocalPulseData | null;
  error?: string;
  message?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;            // Unix timestamp
  city: string;                 // Cache key identifier
}

export interface LocalPulseCache {
  weather: Map<string, CacheEntry<WeatherData>>;
  aqi: Map<string, CacheEntry<AQIData>>;
  highlights: Map<string, CacheEntry<LocalHighlight[]>>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LocalPulseConfig {
  weather: {
    apiKey: string;
    cacheTTL: number;           // Cache TTL in seconds (e.g., 900 = 15 min)
    units: 'metric' | 'imperial';
  };
  aqi: {
    apiKey: string;
    cacheTTL: number;
    enabled: boolean;
  };
  news: {
    cacheTTL: number;
    maxItems: number;           // Max highlights to return
    enabled: boolean;
  };
  refreshInterval: number;      // Cron refresh interval in minutes
}

// ═══════════════════════════════════════════════════════════════════════════
// MOOD LINE GENERATION
// ═══════════════════════════════════════════════════════════════════════════

export interface MoodLineContext {
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  aqi?: number;
  country?: CountryCode;        // For localized mood lines
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════

export class LocalPulseError extends Error {
  constructor(
    message: string,
    public code: LocalPulseErrorCode,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'LocalPulseError';
  }
}

export type LocalPulseErrorCode =
  | 'LOCATION_REQUIRED'
  | 'LOCATION_NOT_FOUND'
  | 'WEATHER_API_ERROR'
  | 'AQI_API_ERROR'
  | 'NEWS_FETCH_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_COORDINATES'
  | 'INVALID_COUNTRY'
  | 'SERVICE_UNAVAILABLE';