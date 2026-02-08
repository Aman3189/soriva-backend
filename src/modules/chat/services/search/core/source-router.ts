/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SOURCE ROUTER v1.0 - SMART CITY & DOMAIN AWARE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/core/source-router.ts
 * Created by: Risenex Dynamics Pvt. Ltd.
 * Created: February 2026
 *
 * PURPOSE:
 * - Smart source selection based on city type (small/metro/international)
 * - Domain-aware source prioritization (movies, news, local)
 * - Fallback chains when primary sources have no data
 * 
 * KEY INSIGHT:
 * - BookMyShow = Great for metros, NO DATA for small cities
 * - District.in (Zomato) = Great for small Indian cities
 * - IMDB/Fandango = International
 * 
 * USAGE:
 * const router = SourceRouter.getInstance();
 * const sources = router.getSourcesForQuery(query, domain, userLocation);
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type CityTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'INTERNATIONAL' | 'UNKNOWN';
export type SourceDomain = 'movies' | 'news' | 'local_business' | 'sports' | 'finance' | 'general';
export type Region = 'INDIA' | 'USA' | 'UK' | 'GLOBAL';

export interface SourceConfig {
  name: string;
  domain: string;
  priority: number;        // 1 = highest
  reliability: number;     // 0-100 score
  dataAvailability: {
    tier1: boolean;        // Metro cities
    tier2: boolean;        // Mid-size cities
    tier3: boolean;        // Small towns
    international: boolean;
  };
  queryModifier?: string;  // Append to search query
}

export interface SourceRoutingResult {
  primarySources: SourceConfig[];
  fallbackSources: SourceConfig[];
  cityTier: CityTier;
  region: Region;
  queryModifiers: string[];
  reasoning: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CITY DATABASES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// TIER 1: Metro Cities (BookMyShow has full data)
const TIER_1_CITIES = new Set([
  // India Metros
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata',
  'hyderabad', 'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow',
  'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam',
  'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
  'faridabad', 'meerut', 'rajkot', 'varanasi', 'srinagar', 'aurangabad',
  'dhanbad', 'amritsar', 'allahabad', 'prayagraj', 'ranchi', 'howrah',
  'coimbatore', 'jabalpur', 'gwalior', 'vijayawada', 'jodhpur', 'madurai',
  'raipur', 'kota', 'chandigarh', 'guwahati', 'solapur', 'hubli',
  'mysore', 'mysuru', 'tiruchirappalli', 'trichy', 'bareilly', 'aligarh',
  'tiruppur', 'gurgaon', 'gurugram', 'noida', 'greater noida',
  // NCR
  'new delhi', 'south delhi', 'north delhi', 'east delhi', 'west delhi',
  // Mumbai Region
  'navi mumbai', 'kalyan', 'dombivli', 'vasai', 'virar', 'mira road',
]);

// TIER 2: Mid-size cities (BookMyShow has partial data)
const TIER_2_CITIES = new Set([
  'moradabad', 'gorakhpur', 'bikaner', 'udaipur', 'bhilai', 'jamshedpur',
  'nellore', 'cuttack', 'firozabad', 'dehra dun', 'dehradun', 'durgapur',
  'asansol', 'rourkela', 'nanded', 'kolhapur', 'ajmer', 'gulbarga',
  'jamnagar', 'ujjain', 'loni', 'siliguri', 'jhansi', 'ulhasnagar',
  'jammu', 'sangli', 'mangalore', 'erode', 'belgaum', 'ambattur',
  'tirunelveli', 'malegaon', 'gaya', 'jalgaon', 'udaipur', 'maheshtala',
  'davanagere', 'kozhikode', 'calicut', 'kurnool', 'rajahmundry',
  'bokaro', 'south dumdum', 'bellary', 'patiala', 'gopalpur', 'agartala',
  'bhagalpur', 'muzaffarnagar', 'bhatpara', 'panihati', 'latur', 'dhule',
  'rohtak', 'korba', 'bhilwara', 'berhampur', 'muzaffarpur', 'ahmednagar',
  'mathura', 'kollam', 'avadi', 'kadapa', 'anantapur', 'kamarhati',
  'bilaspur', 'shahjahanpur', 'satara', 'bijapur', 'rampur', 'shimoga',
  'chandrapur', 'junagadh', 'thrissur', 'alwar', 'bardhaman', 'kulti',
  'kakinada', 'nizamabad', 'parbhani', 'tumkur', 'khammam', 'ozhukarai',
  'bihar sharif', 'panipat', 'darbhanga', 'bally', 'aizawl', 'dewas',
  'ichalkaranji', 'karnal', 'bathinda', 'bhatinda', 'jalna', 'barasat',
  'kirari suleman nagar', 'purnia', 'satna', 'mau', 'sonipat', 'farrukhabad',
]);

// TIER 3: Small towns (BookMyShow usually has NO data, use District.in)
const TIER_3_CITIES = new Set([
  // Punjab Small Towns
  'ferozepur', 'firozpur', 'fazilka', 'abohar', 'malout', 'muktsar',
  'moga', 'faridkot', 'kotkapura', 'barnala', 'sangrur', 'malerkotla',
  'phagwara', 'kapurthala', 'nawanshahr', 'hoshiarpur', 'gurdaspur',
  'pathankot', 'batala', 'tarn taran', 'mansa', 'sardulgarh',
  // Haryana Small Towns
  'jind', 'kaithal', 'fatehabad', 'sirsa', 'bhiwani', 'charkhi dadri',
  'narnaul', 'rewari', 'palwal', 'hodal', 'tosham',
  // UP Small Towns
  'bijnor', 'amroha', 'sambhal', 'chandausi', 'kasganj', 'etah',
  'mainpuri', 'etawah', 'auraiya', 'kannauj', 'farrukhabad', 'hardoi',
  'lakhimpur', 'sitapur', 'shahjahanpur', 'pilibhit', 'bahraich',
  'shravasti', 'balrampur', 'gonda', 'basti', 'sant kabir nagar',
  'siddharthnagar', 'maharajganj', 'kushinagar', 'deoria', 'mau',
  'azamgarh', 'ballia', 'ghazipur', 'jaunpur', 'pratapgarh', 'sultanpur',
  'amethi', 'raebareli', 'fatehpur', 'kaushambi', 'chitrakoot', 'banda',
  'hamirpur', 'mahoba', 'jalaun', 'lalitpur', 'jhansi', 'sonbhadra',
  'mirzapur', 'bhadohi', 'chandauli',
  // Rajasthan Small Towns
  'churu', 'jhunjhunu', 'sikar', 'nagaur', 'pali', 'sirohi', 'jalor',
  'barmer', 'jaisalmer', 'jodhpur rural', 'bikaner rural', 'hanumangarh',
  'sriganganagar', 'karauli', 'dholpur', 'sawai madhopur', 'bundi',
  'baran', 'jhalawar', 'kota rural', 'chittorgarh', 'pratapgarh',
  'banswara', 'dungarpur', 'udaipur rural', 'rajsamand', 'bhilwara',
  // MP Small Towns
  'tikamgarh', 'chhatarpur', 'panna', 'damoh', 'sagar', 'vidisha',
  'raisen', 'sehore', 'rajgarh', 'shajapur', 'agar malwa', 'mandsaur',
  'neemuch', 'ratlam', 'jhabua', 'alirajpur', 'dhar', 'khargone',
  'barwani', 'burhanpur', 'khandwa', 'betul', 'harda', 'hoshangabad',
  'narsinghpur', 'chhindwara', 'seoni', 'balaghat', 'mandla', 'dindori',
  'shahdol', 'umaria', 'anuppur', 'sidhi', 'singrauli', 'rewa', 'satna',
  // Bihar Small Towns
  'araria', 'kishanganj', 'katihar', 'purnia', 'madhepura', 'saharsa',
  'supaul', 'darbhanga', 'madhubani', 'sitamarhi', 'sheohar', 'muzaffarpur',
  'vaishali', 'samastipur', 'begusarai', 'khagaria', 'bhagalpur', 'banka',
  'munger', 'lakhisarai', 'sheikhpura', 'jamui', 'nawada', 'nalanda',
  'arwal', 'jehanabad', 'aurangabad', 'gaya', 'rohtas', 'buxar', 'bhojpur',
  'saran', 'siwan', 'gopalganj', 'east champaran', 'west champaran',
  // Other states small towns
  'dibrugarh', 'tinsukia', 'jorhat', 'sibsagar', 'golaghat', 'nagaon',
  'morigaon', 'darrang', 'sonitpur', 'lakhimpur', 'dhemaji', 'tezpur',
]);

// International cities
const INTERNATIONAL_CITIES = new Set([
  // USA
  'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
  'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
  'fort worth', 'columbus', 'san francisco', 'charlotte', 'indianapolis',
  'seattle', 'denver', 'washington', 'boston', 'el paso', 'nashville',
  'detroit', 'portland', 'las vegas', 'memphis', 'louisville', 'baltimore',
  'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento', 'kansas city',
  'atlanta', 'miami', 'oakland', 'minneapolis', 'cleveland', 'tampa',
  // UK
  'london', 'birmingham', 'manchester', 'glasgow', 'liverpool', 'bristol',
  'sheffield', 'leeds', 'edinburgh', 'leicester', 'cardiff', 'belfast',
  'nottingham', 'newcastle', 'brighton', 'cambridge', 'oxford', 'york',
  // Canada
  'toronto', 'montreal', 'vancouver', 'calgary', 'edmonton', 'ottawa',
  'winnipeg', 'quebec city', 'hamilton', 'kitchener',
  // Australia
  'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'gold coast',
  'canberra', 'newcastle', 'wollongong', 'hobart',
  // UAE/Gulf
  'dubai', 'abu dhabi', 'sharjah', 'doha', 'riyadh', 'jeddah', 'muscat',
  'kuwait city', 'manama', 'bahrain',
  // Singapore/SEA
  'singapore', 'kuala lumpur', 'bangkok', 'jakarta', 'manila', 'ho chi minh',
  // Europe
  'paris', 'berlin', 'amsterdam', 'rome', 'madrid', 'barcelona', 'munich',
  'vienna', 'zurich', 'brussels', 'stockholm', 'oslo', 'copenhagen', 'dublin',
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOURCE CONFIGURATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOVIE_SOURCES: Record<string, SourceConfig> = {
  // Ratings & Info
  imdb: {
    name: 'IMDb',
    domain: 'imdb.com',
    priority: 1,
    reliability: 95,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: true },
    queryModifier: 'imdb',
  },
  rottenTomatoes: {
    name: 'Rotten Tomatoes',
    domain: 'rottentomatoes.com',
    priority: 2,
    reliability: 90,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: true },
    queryModifier: 'rotten tomatoes',
  },
  
  // India Showtimes - Metro
  bookmyshow: {
    name: 'BookMyShow',
    domain: 'bookmyshow.com',
    priority: 1,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: false, international: false },
    queryModifier: 'bookmyshow',
  },
  paytmMovies: {
    name: 'Paytm Movies',
    domain: 'paytm.com',
    priority: 2,
    reliability: 80,
    dataAvailability: { tier1: true, tier2: true, tier3: false, international: false },
    queryModifier: 'paytm movies',
  },
  
  // India Showtimes - Small Towns (CRITICAL for Ferozepur!)
  district: {
    name: 'District.in (Zomato)',
    domain: 'district.in',
    priority: 1,  // TOP PRIORITY for small towns
    reliability: 90,
    dataAvailability: { tier1: false, tier2: true, tier3: true, international: false },
    queryModifier: 'district.in',
  },
  justdial: {
    name: 'JustDial',
    domain: 'justdial.com',
    priority: 2,
    reliability: 75,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
    queryModifier: 'justdial cinema',
  },
  
  // International Showtimes
  fandango: {
    name: 'Fandango',
    domain: 'fandango.com',
    priority: 1,
    reliability: 90,
    dataAvailability: { tier1: false, tier2: false, tier3: false, international: true },
    queryModifier: 'fandango',
  },
  atomTickets: {
    name: 'Atom Tickets',
    domain: 'atomtickets.com',
    priority: 2,
    reliability: 85,
    dataAvailability: { tier1: false, tier2: false, tier3: false, international: true },
    queryModifier: 'atom tickets',
  },
  
  // Bollywood News
  bollywoodHungama: {
    name: 'Bollywood Hungama',
    domain: 'bollywoodhungama.com',
    priority: 3,
    reliability: 80,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: true },
  },
  filmfare: {
    name: 'Filmfare',
    domain: 'filmfare.com',
    priority: 3,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: true },
  },
};

const NEWS_SOURCES: Record<string, SourceConfig> = {
  // National News
  timesofindia: {
    name: 'Times of India',
    domain: 'timesofindia.indiatimes.com',
    priority: 1,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
  },
  hindustantimes: {
    name: 'Hindustan Times',
    domain: 'hindustantimes.com',
    priority: 1,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
  },
  indianexpress: {
    name: 'Indian Express',
    domain: 'indianexpress.com',
    priority: 1,
    reliability: 90,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
  },
  ndtv: {
    name: 'NDTV',
    domain: 'ndtv.com',
    priority: 2,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
  },
  
  // Regional News - Punjab (for Ferozepur etc.)
  ptcnews: {
    name: 'PTC News',
    domain: 'ptcnews.tv',
    priority: 1,  // TOP for Punjab
    reliability: 80,
    dataAvailability: { tier1: false, tier2: true, tier3: true, international: false },
    queryModifier: 'PTC news punjab',
  },
  tribuneindia: {
    name: 'The Tribune',
    domain: 'tribuneindia.com',
    priority: 1,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
    queryModifier: 'tribune',
  },
  dailypost: {
    name: 'Daily Post',
    domain: 'dailypost.in',
    priority: 2,
    reliability: 70,
    dataAvailability: { tier1: false, tier2: true, tier3: true, international: false },
  },
  jagbani: {
    name: 'Jagbani',
    domain: 'jagbani.punjabkesari.in',
    priority: 2,
    reliability: 75,
    dataAvailability: { tier1: false, tier2: true, tier3: true, international: false },
  },
  
  // International News
  bbc: {
    name: 'BBC News',
    domain: 'bbc.com',
    priority: 1,
    reliability: 95,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: true },
  },
  cnn: {
    name: 'CNN',
    domain: 'cnn.com',
    priority: 1,
    reliability: 90,
    dataAvailability: { tier1: false, tier2: false, tier3: false, international: true },
  },
  reuters: {
    name: 'Reuters',
    domain: 'reuters.com',
    priority: 1,
    reliability: 95,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: true },
  },
};

const LOCAL_BUSINESS_SOURCES: Record<string, SourceConfig> = {
  // India
  justdial: {
    name: 'JustDial',
    domain: 'justdial.com',
    priority: 1,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
  },
  sulekha: {
    name: 'Sulekha',
    domain: 'sulekha.com',
    priority: 2,
    reliability: 75,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
  },
  indiamart: {
    name: 'IndiaMart',
    domain: 'indiamart.com',
    priority: 2,
    reliability: 80,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
  },
  zomato: {
    name: 'Zomato',
    domain: 'zomato.com',
    priority: 1,
    reliability: 90,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: false },
    queryModifier: 'zomato',
  },
  swiggy: {
    name: 'Swiggy',
    domain: 'swiggy.com',
    priority: 2,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: false, international: false },
  },
  
  // International
  yelp: {
    name: 'Yelp',
    domain: 'yelp.com',
    priority: 1,
    reliability: 90,
    dataAvailability: { tier1: false, tier2: false, tier3: false, international: true },
  },
  tripadvisor: {
    name: 'TripAdvisor',
    domain: 'tripadvisor.com',
    priority: 1,
    reliability: 85,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: true },
  },
  googleMaps: {
    name: 'Google Maps',
    domain: 'google.com/maps',
    priority: 1,
    reliability: 95,
    dataAvailability: { tier1: true, tier2: true, tier3: true, international: true },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUNJAB SPECIFIC - STATE DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PUNJAB_CITIES = new Set([
  'ferozepur', 'firozpur', 'ludhiana', 'amritsar', 'jalandhar', 'patiala',
  'bathinda', 'bhatinda', 'mohali', 'pathankot', 'moga', 'batala',
  'abohar', 'malerkotla', 'khanna', 'phagwara', 'muktsar', 'barnala',
  'rajpura', 'hoshiarpur', 'kapurthala', 'faridkot', 'sangrur', 'fazilka',
  'gurdaspur', 'mansa', 'nawanshahr', 'tarn taran', 'kotkapura', 'malout',
]);

const HARYANA_CITIES = new Set([
  'gurgaon', 'gurugram', 'faridabad', 'panipat', 'ambala', 'yamunanagar',
  'rohtak', 'hisar', 'karnal', 'sonipat', 'panchkula', 'bhiwani', 'sirsa',
  'bahadurgarh', 'jind', 'thanesar', 'kaithal', 'rewari', 'palwal',
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOURCE ROUTER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SourceRouter {
  private static instance: SourceRouter;
  
  private constructor() {
    console.log('[SourceRouter] 🚀 v1.0 initialized');
  }
  
  static getInstance(): SourceRouter {
    if (!SourceRouter.instance) {
      SourceRouter.instance = new SourceRouter();
    }
    return SourceRouter.instance;
  }
  
  /**
   * Detect city tier from location string
   */
  detectCityTier(location?: string): CityTier {
    if (!location) return 'UNKNOWN';
    
    const normalized = location.toLowerCase().trim();
    const words = normalized.split(/[\s,]+/);
    
    for (const word of words) {
      if (TIER_1_CITIES.has(word)) return 'TIER_1';
      if (TIER_2_CITIES.has(word)) return 'TIER_2';
      if (TIER_3_CITIES.has(word)) return 'TIER_3';
      if (INTERNATIONAL_CITIES.has(word)) return 'INTERNATIONAL';
    }
    
    // Check for compound names
    if (TIER_1_CITIES.has(normalized)) return 'TIER_1';
    if (TIER_2_CITIES.has(normalized)) return 'TIER_2';
    if (TIER_3_CITIES.has(normalized)) return 'TIER_3';
    if (INTERNATIONAL_CITIES.has(normalized)) return 'INTERNATIONAL';
    
    return 'UNKNOWN';
  }
  
  /**
   * Detect region (INDIA/USA/UK/GLOBAL)
   */
  detectRegion(location?: string): Region {
    if (!location) return 'INDIA'; // Default for Soriva
    
    const normalized = location.toLowerCase();
    
    // Check for international indicators
    if (/\b(usa|united states|america|us)\b/.test(normalized)) return 'USA';
    if (/\b(uk|united kingdom|england|britain)\b/.test(normalized)) return 'UK';
    if (INTERNATIONAL_CITIES.has(normalized)) return 'GLOBAL';
    
    // Check if any Indian city
    if (TIER_1_CITIES.has(normalized) || 
        TIER_2_CITIES.has(normalized) || 
        TIER_3_CITIES.has(normalized)) {
      return 'INDIA';
    }
    
    // Default
    return 'INDIA';
  }
  
  /**
   * Check if city is in Punjab (for regional news priority)
   */
  isPunjabCity(location?: string): boolean {
    if (!location) return false;
    const normalized = location.toLowerCase().trim();
    return PUNJAB_CITIES.has(normalized) || /punjab/i.test(location);
  }
  
  /**
   * Main method: Get sources for a query based on domain and location
   */
  getSourcesForQuery(
    query: string,
    domain: SourceDomain,
    userLocation?: string
  ): SourceRoutingResult {
    const cityTier = this.detectCityTier(userLocation);
    const region = this.detectRegion(userLocation);
    const isPunjab = this.isPunjabCity(userLocation);
    
    let primarySources: SourceConfig[] = [];
    let fallbackSources: SourceConfig[] = [];
    let queryModifiers: string[] = [];
    let reasoning = '';
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MOVIES DOMAIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (domain === 'movies') {
      const isShowtimeQuery = /showtime|ticket|cinema|theatre|theater|lagi|chal|book/i.test(query);
      const isRatingQuery = /rating|imdb|review|kaisi|kaise/i.test(query);
      
      if (isRatingQuery) {
        // Rating queries → Always IMDB first
        primarySources = [MOVIE_SOURCES.imdb, MOVIE_SOURCES.rottenTomatoes];
        fallbackSources = [MOVIE_SOURCES.bollywoodHungama, MOVIE_SOURCES.filmfare];
        reasoning = 'Rating query → IMDb/RT priority';
        
      } else if (isShowtimeQuery) {
        // Showtime queries → City-tier dependent
        switch (cityTier) {
          case 'TIER_1':
            primarySources = [MOVIE_SOURCES.bookmyshow, MOVIE_SOURCES.paytmMovies];
            fallbackSources = [MOVIE_SOURCES.justdial];
            reasoning = 'Metro city → BookMyShow priority';
            break;
            
          case 'TIER_2':
            primarySources = [MOVIE_SOURCES.bookmyshow, MOVIE_SOURCES.district];
            fallbackSources = [MOVIE_SOURCES.justdial, MOVIE_SOURCES.paytmMovies];
            reasoning = 'Mid-size city → BookMyShow + District.in';
            break;
            
          case 'TIER_3':
            // CRITICAL: Small towns → District.in FIRST, BookMyShow as fallback
            primarySources = [MOVIE_SOURCES.district, MOVIE_SOURCES.justdial];
            fallbackSources = [MOVIE_SOURCES.bookmyshow]; // Might have no data
            reasoning = 'Small town → District.in priority (BookMyShow may have no data)';
            queryModifiers.push('district.in');
            break;
            
          case 'INTERNATIONAL':
            primarySources = [MOVIE_SOURCES.fandango, MOVIE_SOURCES.atomTickets];
            fallbackSources = [MOVIE_SOURCES.imdb];
            reasoning = 'International → Fandango/Atom priority';
            break;
            
          default:
            primarySources = [MOVIE_SOURCES.bookmyshow, MOVIE_SOURCES.district];
            fallbackSources = [MOVIE_SOURCES.justdial];
            reasoning = 'Unknown location → Mixed sources';
        }
        
      } else {
        // General movie info
        primarySources = [MOVIE_SOURCES.imdb, MOVIE_SOURCES.bollywoodHungama];
        fallbackSources = [MOVIE_SOURCES.filmfare];
        reasoning = 'General movie query → IMDb + Bollywood sites';
      }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NEWS DOMAIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (domain === 'news') {
      const isLocalNews = /local|incident|ghatna|hadsa|mamla/i.test(query);
      
      if (isLocalNews && isPunjab) {
        // Punjab local news → Regional sources first
        primarySources = [NEWS_SOURCES.ptcnews, NEWS_SOURCES.tribuneindia, NEWS_SOURCES.jagbani];
        fallbackSources = [NEWS_SOURCES.timesofindia, NEWS_SOURCES.hindustantimes];
        reasoning = 'Punjab local news → PTC/Tribune priority';
        queryModifiers.push('punjab');
        
      } else if (isLocalNews && region === 'INDIA') {
        // Other Indian local news
        primarySources = [NEWS_SOURCES.timesofindia, NEWS_SOURCES.hindustantimes];
        fallbackSources = [NEWS_SOURCES.indianexpress, NEWS_SOURCES.ndtv];
        reasoning = 'India local news → TOI/HT priority';
        
      } else if (region === 'GLOBAL' || region === 'USA' || region === 'UK') {
        // International news
        primarySources = [NEWS_SOURCES.bbc, NEWS_SOURCES.reuters, NEWS_SOURCES.cnn];
        fallbackSources = [];
        reasoning = 'International news → BBC/Reuters priority';
        
      } else {
        // General Indian news
        primarySources = [NEWS_SOURCES.timesofindia, NEWS_SOURCES.indianexpress];
        fallbackSources = [NEWS_SOURCES.ndtv, NEWS_SOURCES.hindustantimes];
        reasoning = 'General news → National sources';
      }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LOCAL BUSINESS DOMAIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (domain === 'local_business') {
      const isFoodQuery = /restaurant|food|khana|cafe|dhaba|zomato|swiggy/i.test(query);
      
      if (region === 'INDIA') {
        if (isFoodQuery) {
          primarySources = [LOCAL_BUSINESS_SOURCES.zomato, LOCAL_BUSINESS_SOURCES.swiggy];
          fallbackSources = [LOCAL_BUSINESS_SOURCES.justdial, LOCAL_BUSINESS_SOURCES.tripadvisor];
          reasoning = 'India food → Zomato/Swiggy priority';
        } else {
          primarySources = [LOCAL_BUSINESS_SOURCES.justdial, LOCAL_BUSINESS_SOURCES.googleMaps];
          fallbackSources = [LOCAL_BUSINESS_SOURCES.sulekha, LOCAL_BUSINESS_SOURCES.indiamart];
          reasoning = 'India local business → JustDial priority';
        }
      } else {
        primarySources = [LOCAL_BUSINESS_SOURCES.googleMaps, LOCAL_BUSINESS_SOURCES.yelp];
        fallbackSources = [LOCAL_BUSINESS_SOURCES.tripadvisor];
        reasoning = 'International local business → Google Maps/Yelp priority';
      }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DEFAULT / GENERAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else {
      // General queries - no specific source priority
      reasoning = 'General query → Standard search';
    }
    
    console.log(`[SourceRouter] 📍 City: ${userLocation || 'unknown'} → Tier: ${cityTier}`);
    console.log(`[SourceRouter] 🎯 Domain: ${domain} | Region: ${region}`);
    console.log(`[SourceRouter] 📋 Primary: ${primarySources.map(s => s.name).join(', ') || 'default'}`);
    console.log(`[SourceRouter] 📝 Reasoning: ${reasoning}`);
    
    return {
      primarySources,
      fallbackSources,
      cityTier,
      region,
      queryModifiers,
      reasoning,
    };
  }
  
  /**
   * Get preferred domains for site: search restriction
   */
  getPreferredDomains(
    domain: SourceDomain,
    userLocation?: string
  ): string[] {
    const result = this.getSourcesForQuery('', domain, userLocation);
    const domains: string[] = [];
    
    for (const source of [...result.primarySources, ...result.fallbackSources]) {
      if (source.domain && !domains.includes(source.domain)) {
        domains.push(source.domain);
      }
    }
    
    return domains;
  }
  
  /**
   * Check if BookMyShow should be trusted for this location
   */
  isBookMyShowReliable(location?: string): boolean {
    const tier = this.detectCityTier(location);
    return tier === 'TIER_1' || tier === 'TIER_2';
  }
  
  /**
   * Get the best showtime source for a location
   */
  getBestShowtimeSource(location?: string): string {
    const tier = this.detectCityTier(location);
    
    switch (tier) {
      case 'TIER_1':
      case 'TIER_2':
        return 'bookmyshow.com';
      case 'TIER_3':
        return 'district.in';
      case 'INTERNATIONAL':
        return 'fandango.com';
      default:
        return 'district.in'; // Safe default for India
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const sourceRouter = SourceRouter.getInstance();
export { SourceRouter };

// Convenience exports
export {
  TIER_1_CITIES,
  TIER_2_CITIES,
  TIER_3_CITIES,
  INTERNATIONAL_CITIES,
  PUNJAB_CITIES,
  MOVIE_SOURCES,
  NEWS_SOURCES,
  LOCAL_BUSINESS_SOURCES,
};