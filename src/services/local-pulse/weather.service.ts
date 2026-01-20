// ═══════════════════════════════════════════════════════════════════════════
// File: src/services/local-pulse/weather.service.ts
// Soriva Local Pulse™ - Weather Service (OpenWeatherMap)
// ═══════════════════════════════════════════════════════════════════════════

import axios from 'axios';
import {
  WeatherData,
  WeatherCondition,
  OpenWeatherResponse,
  CacheEntry,
  MoodLineContext,
  LocalPulseError,
} from '../../types/local-pulse.types';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  apiKey: process.env.OPENWEATHER_API_KEY || '',
  baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
  units: 'metric' as const,
  cacheTTL: 15 * 60 * 1000, // 15 minutes in milliseconds
  timeout: 10000, // 10 seconds
};

// ═══════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE
// ═══════════════════════════════════════════════════════════════════════════

const weatherCache = new Map<string, CacheEntry<WeatherData>>();

// ═══════════════════════════════════════════════════════════════════════════
// MOOD LINE TEMPLATES - Hinglish + English Mix
// ═══════════════════════════════════════════════════════════════════════════

const MOOD_LINES: Record<string, string[]> = {
  // Clear/Sunny conditions
  clear_morning: [
    'Perfect morning for a fresh start ☀️',
    'Bright skies, bright ideas ahead',
    'Sunlight streaming — good vibes only',
    'Clear morning, clear mind',
  ],
  clear_afternoon: [
    'Sunny afternoon — stay hydrated!',
    'Perfect weather for outdoor work',
    'Bright day, brighter possibilities',
    'Sun\'s out — energy levels up',
  ],
  clear_evening: [
    'Golden hour vibes ✨',
    'Beautiful evening ahead',
    'Perfect for an evening walk',
    'Sunset mode activated',
  ],
  clear_night: [
    'Clear skies, starry night',
    'Perfect night for stargazing',
    'Calm and clear — rest well',
    'Peaceful night ahead',
  ],

  // Cloudy conditions
  cloudy_morning: [
    'Cloudy but cozy morning',
    'Overcast skies — chai weather ☕',
    'Soft light, easy start',
    'Gentle morning, no harsh sun',
  ],
  cloudy_afternoon: [
    'Cloudy afternoon — comfortable weather',
    'Perfect for indoor productivity',
    'Overcast but pleasant',
    'Easy on the eyes today',
  ],
  cloudy_evening: [
    'Cloudy evening — relaxed vibes',
    'Soft skies this evening',
    'Comfortable evening ahead',
    'Mellow evening weather',
  ],
  cloudy_night: [
    'Quiet cloudy night',
    'Cozy night in',
    'Soft skies, peaceful night',
    'Blanket weather tonight',
  ],

  // Rainy conditions
  rain_morning: [
    'Rainy morning — perfect chai time ☔',
    'Baarish ki subah — pakora mood',
    'Wet start, stay dry!',
    'Monsoon vibes this morning',
  ],
  rain_afternoon: [
    'Rainy afternoon — work from cozy corner',
    'Baarish continue hai — umbrella ready?',
    'Wet weather — stay indoors if possible',
    'Perfect for some hot chai',
  ],
  rain_evening: [
    'Rainy evening — baarish ki romantic shaam',
    'Wet evening — drive carefully',
    'Rain continues — cozy evening ahead',
    'Perfect pakora weather 🌧️',
  ],
  rain_night: [
    'Rainy night — sleep will be good',
    'Baarish ki raat — peaceful sleep ahead',
    'Wet night — stay warm',
    'Rain sounds for perfect sleep',
  ],

  // Hot conditions (temp > 35°C)
  hot: [
    'Garmi hai — stay hydrated! 💧',
    'Hot day — AC mode on',
    'Drink plenty of water today',
    'Beat the heat — stay cool',
    'Scorching — limit outdoor time',
  ],

  // Cold conditions (temp < 15°C)
  cold: [
    'Thandi hai — layer up! 🧥',
    'Chilly weather — warm clothes ready?',
    'Cold day — hot chai mandatory',
    'Bundle up, it\'s cold outside',
    'Sweater weather activated',
  ],

  // Fog/Mist
  fog: [
    'Foggy — drive slow, stay safe 🌫️',
    'Low visibility — be careful outside',
    'Misty morning — take it slow',
    'Fog advisory — travel safe',
  ],

  // Thunderstorm
  thunderstorm: [
    'Thunderstorm alert — stay indoors ⛈️',
    'Toofan aa raha hai — be safe',
    'Storm warning — avoid travel',
    'Lightning risk — stay inside',
  ],

  // Haze/Dust/Smoke
  poor_air: [
    'Air quality poor — mask recommended 😷',
    'Hazy skies — limit outdoor exposure',
    'Dusty conditions — stay indoors',
    'Poor visibility — drive carefully',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get time of day based on current hour
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Convert OpenWeatherMap condition to our WeatherCondition type
 */
function mapCondition(weatherId: number, description: string): WeatherCondition {
  // Thunderstorm (200-299)
  if (weatherId >= 200 && weatherId < 300) return 'Thunderstorm';
  
  // Drizzle/Light Rain (300-399)
  if (weatherId >= 300 && weatherId < 400) return 'Light Rain';
  
  // Rain (500-599)
  if (weatherId >= 500 && weatherId < 510) return 'Rain';
  if (weatherId >= 510 && weatherId < 600) return 'Heavy Rain';
  
  // Snow (600-699)
  if (weatherId >= 600 && weatherId < 700) return 'Snow';
  
  // Atmosphere (700-799)
  if (weatherId === 701 || weatherId === 721) return 'Mist';
  if (weatherId === 711) return 'Smoke';
  if (weatherId === 731 || weatherId === 761) return 'Dust';
  if (weatherId === 741) return 'Fog';
  if (weatherId === 751) return 'Dust';
  if (weatherId >= 700 && weatherId < 800) return 'Haze';
  
  // Clear (800)
  if (weatherId === 800) return 'Clear';
  
  // Clouds (801-804)
  if (weatherId === 801) return 'Partly Cloudy';
  if (weatherId === 802) return 'Cloudy';
  if (weatherId >= 803) return 'Overcast';
  
  return 'Clear';
}

/**
 * Convert wind degrees to direction string
 */
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Generate cache key from city name
 */
function getCacheKey(city: string): string {
  return city.toLowerCase().trim().replace(/\s+/g, '_');
}

/**
 * Generate mood line based on weather context
 */
function generateMoodLine(context: MoodLineContext): string {
  const { temperature, condition, timeOfDay, aqi } = context;

  // Priority 1: Extreme conditions
  if (condition === 'Thunderstorm') {
    return getRandomLine(MOOD_LINES.thunderstorm);
  }

  // Priority 2: Poor air quality (if available)
  if (aqi && aqi > 150) {
    return getRandomLine(MOOD_LINES.poor_air);
  }

  // Priority 3: Fog/Mist
  if (condition === 'Fog' || condition === 'Mist') {
    return getRandomLine(MOOD_LINES.fog);
  }

  // Priority 4: Extreme temperature
  if (temperature > 35) {
    return getRandomLine(MOOD_LINES.hot);
  }
  if (temperature < 15) {
    return getRandomLine(MOOD_LINES.cold);
  }

  // Priority 5: Rain
  if (condition.includes('Rain')) {
    const key = `rain_${timeOfDay}`;
    return getRandomLine(MOOD_LINES[key] || MOOD_LINES.rain_morning);
  }

  // Priority 6: Cloudy
  if (condition.includes('Cloudy') || condition === 'Overcast') {
    const key = `cloudy_${timeOfDay}`;
    return getRandomLine(MOOD_LINES[key] || MOOD_LINES.cloudy_morning);
  }

  // Default: Clear/Sunny
  const key = `clear_${timeOfDay}`;
  return getRandomLine(MOOD_LINES[key] || MOOD_LINES.clear_morning);
}

/**
 * Get random line from array
 */
function getRandomLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Convert Unix timestamp to ISO string
 */
function unixToISO(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

// ═══════════════════════════════════════════════════════════════════════════
// WEATHER SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = CONFIG.apiKey;
    this.baseUrl = CONFIG.baseUrl;

    if (!this.apiKey) {
      console.warn('⚠️ OPENWEATHER_API_KEY not set. Weather service will not work.');
    }
  }

  /**
   * Get weather by city name
   */
  async getWeatherByCity(city: string, aqi?: number): Promise<WeatherData> {
    const cacheKey = getCacheKey(city);

    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`📦 Weather cache hit for: ${city}`);
      return cached.data;
    }

    // Fetch fresh data
    console.log(`🌤️ Fetching weather for: ${city}`);

    if (!this.apiKey) {
      throw new LocalPulseError(
        'Weather API key not configured',
        'WEATHER_API_ERROR',
        503
      );
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(this.baseUrl, {
        params: {
          q: city,
          appid: this.apiKey,
          units: CONFIG.units,
        },
        timeout: CONFIG.timeout,
      });

      const data = response.data;
      const weatherData = this.transformResponse(data, aqi);

      // Cache the result
      weatherCache.set(cacheKey, {
        data: weatherData,
        expiresAt: Date.now() + CONFIG.cacheTTL,
        city: cacheKey,
      });

      console.log(`✅ Weather fetched for ${city}: ${weatherData.temperature}°C, ${weatherData.condition}`);
      return weatherData;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new LocalPulseError(
            `City not found: ${city}`,
            'LOCATION_NOT_FOUND',
            404
          );
        }
        if (error.response?.status === 429) {
          throw new LocalPulseError(
            'Weather API rate limit exceeded',
            'RATE_LIMIT_EXCEEDED',
            429
          );
        }
      }

      console.error(`❌ Weather fetch error for ${city}:`, error.message);
      throw new LocalPulseError(
        'Failed to fetch weather data',
        'WEATHER_API_ERROR',
        503
      );
    }
  }

  /**
   * Get weather by coordinates
   */
  async getWeatherByCoords(lat: number, lon: number, aqi?: number): Promise<WeatherData> {
    const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;

    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`📦 Weather cache hit for coords: ${lat}, ${lon}`);
      return cached.data;
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new LocalPulseError(
        'Invalid coordinates',
        'INVALID_COORDINATES',
        400
      );
    }

    console.log(`🌤️ Fetching weather for coords: ${lat}, ${lon}`);

    if (!this.apiKey) {
      throw new LocalPulseError(
        'Weather API key not configured',
        'WEATHER_API_ERROR',
        503
      );
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(this.baseUrl, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: CONFIG.units,
        },
        timeout: CONFIG.timeout,
      });

      const data = response.data;
      const weatherData = this.transformResponse(data, aqi);

      // Cache the result
      weatherCache.set(cacheKey, {
        data: weatherData,
        expiresAt: Date.now() + CONFIG.cacheTTL,
        city: cacheKey,
      });

      console.log(`✅ Weather fetched for ${data.name}: ${weatherData.temperature}°C, ${weatherData.condition}`);
      return weatherData;

    } catch (error: any) {
      console.error(`❌ Weather fetch error for coords:`, error.message);
      throw new LocalPulseError(
        'Failed to fetch weather data',
        'WEATHER_API_ERROR',
        503
      );
    }
  }

  /**
   * Transform OpenWeatherMap response to our WeatherData format
   */
  private transformResponse(data: OpenWeatherResponse, aqi?: number): WeatherData {
    const weather = data.weather[0];
    const condition = mapCondition(weather.id, weather.description);
    const timeOfDay = getTimeOfDay();

    const moodLine = generateMoodLine({
      temperature: Math.round(data.main.temp),
      condition,
      humidity: data.main.humidity,
      timeOfDay,
      aqi,
    });

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      condition,
      conditionCode: weather.id,
      icon: weather.icon,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      windDirection: getWindDirection(data.wind.deg || 0),
      visibility: Math.round((data.visibility || 10000) / 1000), // meters to km
      pressure: data.main.pressure,
      sunrise: unixToISO(data.sys.sunrise),
      sunset: unixToISO(data.sys.sunset),
      moodLine,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Clear cache for a specific city
   */
  clearCache(city?: string): void {
    if (city) {
      const cacheKey = getCacheKey(city);
      weatherCache.delete(cacheKey);
      console.log(`🗑️ Weather cache cleared for: ${city}`);
    } else {
      weatherCache.clear();
      console.log('🗑️ Weather cache cleared completely');
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: weatherCache.size,
      entries: Array.from(weatherCache.keys()),
    };
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

export const weatherService = new WeatherService();
export default weatherService;