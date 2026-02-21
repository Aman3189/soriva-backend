/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA GEOCODING SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Converts place name → Latitude/Longitude for Kundli calculations
 * Uses OpenCage Geocoding API (free tier: 2500 requests/day)
 * 
 * Created by: Amandeep, Punjab, India
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GeocodingResult {
  success: boolean;
  latitude: number;
  longitude: number;
  timezone: number;      // UTC offset (e.g., 5.5 for IST)
  formattedPlace: string; // Clean place name
  country: string;
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POPULAR INDIAN CITIES CACHE (Instant lookup, no API call)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const INDIAN_CITIES: Record<string, { lat: number; lng: number; state: string }> = {
  // Punjab
  'ferozepur': { lat: 30.9331, lng: 74.6225, state: 'Punjab' },
  'firozpur': { lat: 30.9331, lng: 74.6225, state: 'Punjab' },
  'ludhiana': { lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  'amritsar': { lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  'jalandhar': { lat: 31.3260, lng: 75.5762, state: 'Punjab' },
  'patiala': { lat: 30.3398, lng: 76.3869, state: 'Punjab' },
  'bathinda': { lat: 30.2110, lng: 74.9455, state: 'Punjab' },
  'mohali': { lat: 30.7046, lng: 76.7179, state: 'Punjab' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, state: 'Chandigarh' },
  
  // Delhi NCR
  'delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'noida': { lat: 28.5355, lng: 77.3910, state: 'UP' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  'gurugram': { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  'faridabad': { lat: 28.4089, lng: 77.3178, state: 'Haryana' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, state: 'UP' },
  
  // Maharashtra
  'mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  'nashik': { lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  'thane': { lat: 19.2183, lng: 72.9781, state: 'Maharashtra' },
  
  // Karnataka
  'bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'mysore': { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  'mysuru': { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  
  // Tamil Nadu
  'chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },
  'madurai': { lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  
  // Telangana & AP
  'hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, state: 'AP' },
  'vijayawada': { lat: 16.5062, lng: 80.6480, state: 'AP' },
  
  // West Bengal
  'kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  'howrah': { lat: 22.5958, lng: 88.2636, state: 'West Bengal' },
  
  // Gujarat
  'ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'surat': { lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  'vadodara': { lat: 22.3072, lng: 73.1812, state: 'Gujarat' },
  'rajkot': { lat: 22.3039, lng: 70.8022, state: 'Gujarat' },
  
  // Rajasthan
  'jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, state: 'Rajasthan' },
  'udaipur': { lat: 24.5854, lng: 73.7125, state: 'Rajasthan' },
  'kota': { lat: 25.2138, lng: 75.8648, state: 'Rajasthan' },
  
  // UP
  'lucknow': { lat: 26.8467, lng: 80.9462, state: 'UP' },
  'kanpur': { lat: 26.4499, lng: 80.3319, state: 'UP' },
  'varanasi': { lat: 25.3176, lng: 82.9739, state: 'UP' },
  'agra': { lat: 27.1767, lng: 78.0081, state: 'UP' },
  'prayagraj': { lat: 25.4358, lng: 81.8463, state: 'UP' },
  'allahabad': { lat: 25.4358, lng: 81.8463, state: 'UP' },
  'meerut': { lat: 28.9845, lng: 77.7064, state: 'UP' },
  
  // MP
  'bhopal': { lat: 23.2599, lng: 77.4126, state: 'MP' },
  'indore': { lat: 22.7196, lng: 75.8577, state: 'MP' },
  'gwalior': { lat: 26.2183, lng: 78.1828, state: 'MP' },
  
  // Bihar & Jharkhand
  'patna': { lat: 25.5941, lng: 85.1376, state: 'Bihar' },
  'ranchi': { lat: 23.3441, lng: 85.3096, state: 'Jharkhand' },
  'jamshedpur': { lat: 22.8046, lng: 86.2029, state: 'Jharkhand' },
  
  // Kerala
  'kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  'cochin': { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  'trivandrum': { lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  
  // Others
  'bhubaneswar': { lat: 20.2961, lng: 85.8245, state: 'Odisha' },
  'guwahati': { lat: 26.1445, lng: 91.7362, state: 'Assam' },
  'dehradun': { lat: 30.3165, lng: 78.0322, state: 'Uttarakhand' },
  'shimla': { lat: 31.1048, lng: 77.1734, state: 'HP' },
  'srinagar': { lat: 34.0837, lng: 74.7973, state: 'J&K' },
  'jammu': { lat: 32.7266, lng: 74.8570, state: 'J&K' },
  'raipur': { lat: 21.2514, lng: 81.6296, state: 'Chhattisgarh' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIMEZONE MAPPING (Country → UTC offset)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIMEZONE_MAP: Record<string, number> = {
  'india': 5.5,
  'in': 5.5,
  'pakistan': 5,
  'pk': 5,
  'bangladesh': 6,
  'bd': 6,
  'nepal': 5.75,
  'np': 5.75,
  'sri lanka': 5.5,
  'lk': 5.5,
  'united states': -5,    // EST (approximate)
  'us': -5,
  'usa': -5,
  'united kingdom': 0,
  'uk': 0,
  'gb': 0,
  'canada': -5,
  'ca': -5,
  'australia': 10,
  'au': 10,
  'uae': 4,
  'ae': 4,
  'singapore': 8,
  'sg': 8,
  'malaysia': 8,
  'my': 8,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GEOCODING SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class GeocodingService {
  private apiKey: string;
  private baseUrl = 'https://api.opencagedata.com/geocode/v1/json';

  constructor() {
    this.apiKey = process.env.OPENCAGE_API_KEY || '';
  }

  /**
   * Get coordinates for a place name
   * First checks local cache, then calls API if needed
   */
  async getCoordinates(placeName: string): Promise<GeocodingResult> {
    const normalizedPlace = placeName.toLowerCase().trim();

    // 1. Check local Indian cities cache first (instant, free)
    const cachedCity = INDIAN_CITIES[normalizedPlace];
    if (cachedCity) {
      console.log(`[Geocoding] ✅ Cache hit: ${placeName}`);
      return {
        success: true,
        latitude: cachedCity.lat,
        longitude: cachedCity.lng,
        timezone: 5.5, // IST
        formattedPlace: `${this.capitalize(placeName)}, ${cachedCity.state}, India`,
        country: 'India',
      };
    }

    // 2. Call OpenCage API for other places
    if (!this.apiKey) {
      console.warn('[Geocoding] ⚠️ No API key, using approximate coordinates');
      return this.getFallbackCoordinates(placeName);
    }

    try {
      const url = `${this.baseUrl}?q=${encodeURIComponent(placeName)}&key=${this.apiKey}&limit=1&no_annotations=0`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const country = result.components.country || '';
        const timezone = this.getTimezone(country, result.annotations?.timezone?.offset_sec);

        console.log(`[Geocoding] ✅ API success: ${placeName}`);
        
        return {
          success: true,
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          timezone,
          formattedPlace: result.formatted,
          country,
        };
      }

      return {
        success: false,
        latitude: 0,
        longitude: 0,
        timezone: 5.5,
        formattedPlace: placeName,
        country: '',
        error: 'Place not found',
      };

    } catch (error: any) {
      console.error('[Geocoding] ❌ API error:', error.message);
      return this.getFallbackCoordinates(placeName);
    }
  }

  /**
   * Fallback when API is unavailable
   * Returns Delhi coordinates as default for India
   */
  private getFallbackCoordinates(placeName: string): GeocodingResult {
    console.log(`[Geocoding] ⚠️ Using fallback for: ${placeName}`);
    
    // Default to Delhi, India
    return {
      success: true,
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      formattedPlace: `${this.capitalize(placeName)}, India (approximate)`,
      country: 'India',
    };
  }

  /**
   * Get timezone offset from country or API response
   */
  private getTimezone(country: string, offsetSeconds?: number): number {
    // If API provided offset, use it
    if (offsetSeconds !== undefined) {
      return offsetSeconds / 3600; // Convert seconds to hours
    }

    // Otherwise, lookup by country
    const normalizedCountry = country.toLowerCase();
    return TIMEZONE_MAP[normalizedCountry] ?? 5.5; // Default IST
  }

  /**
   * Capitalize place name
   */
  private capitalize(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Check if a place is in the cache
   */
  isInCache(placeName: string): boolean {
    return placeName.toLowerCase().trim() in INDIAN_CITIES;
  }
}

// Export singleton
export const geocodingService = new GeocodingService();
export default geocodingService;