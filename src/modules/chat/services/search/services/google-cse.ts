/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH - GOOGLE CUSTOM SEARCH ENGINE v1.4 BULLETPROOF
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/google-cse.ts
 * Created by: Risenex Dynamics Pvt. Ltd.
 * Created: February 2026
 *
 * Purpose:
 * - Google Custom Search Engine integration
 * - Category-specific curated search (News, Entertainment, Health, etc.)
 * - PRIMARY search provider (Brave as fallback)
 * 
 * Cost: FREE 100/day (3000/month), then ₹0.46/query
 * 
 * v1.4 UPDATES:
 * ✅ ADDED: 40+ new NEWS keywords (nehar, incident, viral, dhakka, etc.)
 * ✅ ADDED: NEWS_PRESERVE_WORDS for time-sensitive queries
 * ✅ FIXED: Time words (today, latest, aaj) preserved for NEWS category
 * 
 * v1.3 BULLETPROOF FIXES:
 * ✅ FIXED: All dead code removed (tempQuery, sequelMatches, MOVIE_SEQUEL_PATTERN)
 * ✅ FIXED: 'do' noise word conflict (preserves "Dhoom 2", "Housefull 2")
 * ✅ FIXED: Complete Indian cities list (100+ cities)
 * ✅ FIXED: Category priority (entertainment > news for movie queries)
 * ✅ FIXED: Empty query edge case handling
 * ✅ FIXED: Console logs updated to v1.3
 * ✅ FIXED: Dynamic year for festival suffix
 * ✅ ADDED: Sports category support
 * ✅ ADDED: Retry logic on network errors (max 2 retries)
 * ✅ ADDED: Rate limit (429) handling with backoff
 * ✅ ADDED: Input sanitization (XSS protection)
 * ✅ ADDED: Query result caching (5 min TTL)
 * ✅ ADDED: parseInt with radix 10
 * ✅ ADDED: Comprehensive error types
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios, { AxiosError } from "axios";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// v1.5: Extended to include tech, government, local categories
export type SearchCategory = 
  | 'news' 
  | 'sports'
  | 'entertainment' 
  | 'health' 
  | 'finance' 
  | 'food' 
  | 'travel' 
  | 'education'
  | 'weather'
  | 'festival'
  | 'tech'        // ✅ v1.5: Added tech category
  | 'government'  // ✅ v1.5: Added government category
  | 'local'       // ✅ v1.5: Added local category
  | 'general';

export interface CSEResult {
  title: string;
  url: string;
  description: string;
  source: string;
  thumbnail?: string;
}

export interface CSEResponse {
  results: CSEResult[];
  category: SearchCategory;
  query: string;
  originalQuery: string;
  timeMs: number;
  totalResults: number;
  success: boolean;
  error?: string;
  errorType?: 'API_KEY_MISSING' | 'RATE_LIMITED' | 'NETWORK_ERROR' | 'TIMEOUT' | 'API_ERROR' | 'EMPTY_QUERY';
  cached?: boolean;
  retryCount?: number;
}

interface CacheEntry {
  response: CSEResponse;
  timestamp: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CSE_API_URL = 'https://www.googleapis.com/customsearch/v1';
const CSE_TIMEOUT = 10000;
const MIN_RESULTS_THRESHOLD = 3;
const CSE_MAX_QUERY_WORDS = 8;
const CSE_MIN_WORD_LENGTH = 2;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEARCH ENGINE IDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// v1.5: Extended to include tech, government, local engines
// Note: Using general engine for new categories until dedicated CSEs are created
const SEARCH_ENGINES: Record<SearchCategory, string> = {
  news: '71dd74996eb4c4fc9',
  sports: '71dd74996eb4c4fc9',
  entertainment: '60a7f3b1af27842b2',
  health: '375de3f09aee146fb',
  finance: '56da913e084b04891',
  food: '82f485f534fbb4970',
  travel: 'f1aeb707400b54dda',
  education: 'd617debe7a0c242ed',
  weather: 'b6058ecbc8f8a4a1f',
  festival: '931f0aaf88e274d8b',
  tech: '71dd74996eb4c4fc9',       // ✅ v1.5: Using news engine (tech news heavy)
  government: '71dd74996eb4c4fc9', // ✅ v1.5: Using news engine (govt updates)
  local: '82f485f534fbb4970',      // ✅ v1.5: Using food engine (local business focus)
  general: '71dd74996eb4c4fc9',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORY KEYWORDS (Priority Ordered)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORY_KEYWORDS_ORDERED: Array<{ category: SearchCategory; keywords: string[] }> = [
  {
    category: 'sports',
    keywords: [
      'cricket', 'ipl', 'football', 'soccer', 'hockey', 'tennis', 'badminton',
      'match score', 'innings', 'wicket', 'goal', 'tournament', 'champion',
      'world cup', 't20', 'odi', 'test match', 'fifa', 'olympics', 'asian games',
      'player', 'team', 'league', 'bcci', 'icc', 'kohli', 'dhoni', 'rohit',
      'rcb', 'csk', 'mi', 'kkr', 'srh', 'dc', 'pbks', 'rr', 'gt', 'lsg',
      'premier league', 'la liga', 'serie a', 'bundesliga',
      'nba', 'nfl', 'wwe', 'ufc', 'boxing', 'kabaddi', 'pkl',
      'khel', 'kheladi', 'jeet', 'jeeta', 'haara'
    ]
  },
  {
    category: 'entertainment',
    keywords: [
      'movie', 'film', 'song', 'album', 'trailer', 'release',
      'bollywood', 'hollywood', 'tollywood', 'kollywood',
      'actor', 'actress', 'singer', 'director', 'producer',
      'imdb', 'rating', 'review', 'box office', 'collection',
      'netflix', 'amazon prime', 'hotstar', 'disney', 'zee5', 'sony liv',
      'ott', 'web series', 'webseries', 'season',
      'music', 'concert', 'gaana', 'spotify',
      'game', 'gaming', 'ps5', 'xbox', 'pubg', 'bgmi', 'free fire',
      'cinema', 'theatre', 'theater', 'multiplex', 'pvr', 'inox',
      'showtime', 'showtimes', 'ticket', 'booking',
      'salman', 'shahrukh', 'srk', 'aamir', 'akshay', 'hrithik', 'ranbir',
      'alia', 'deepika', 'katrina', 'priyanka', 'kareena'
    ]
  },
  {
    category: 'finance',
    keywords: [
      'stock', 'share', 'market', 'sensex', 'nifty', 'bse', 'nse',
      'bitcoin', 'crypto', 'ethereum', 'trading', 'invest',
      'mutual fund', 'sip', 'ipo', 'dividend',
      'dollar', 'rupee', 'exchange rate', 'forex',
      'gold price', 'silver price', 'sone ka bhav', 'chandi',
      'petrol', 'diesel', 'lpg', 'fuel price',
      'loan', 'emi', 'interest rate', 'rbi', 'bank',
      'tax', 'gst', 'itr', 'income tax', 'epf', 'pf',
      'insurance', 'lic', 'policy',
      'paisa', 'rupaya', 'daam', 'bhav', 'kimat'
    ]
  },
  {
    category: 'health',
    keywords: [
      'health', 'medical', 'doctor', 'hospital', 'clinic',
      'disease', 'symptoms', 'treatment', 'medicine', 'tablet', 'dawai',
      'cure', 'therapy', 'surgery',
      'diabetes', 'sugar', 'cancer', 'heart', 'blood pressure', 'bp',
      'fever', 'bukhar', 'cold', 'cough', 'covid', 'vaccine',
      'ayurveda', 'yoga', 'meditation', 'exercise', 'gym', 'fitness',
      'diet', 'nutrition', 'weight loss',
      'mental health', 'depression', 'anxiety', 'stress', 'sleep',
      'pregnancy', 'aiims', 'apollo', 'fortis'
    ]
  },
  {
    category: 'weather',
    keywords: [
      'weather', 'mausam', 'temperature', 'tapman',
      'rain', 'barish', 'baarish', 'monsoon',
      'sunny', 'dhoop', 'cloudy', 'badal',
      'humidity', 'forecast',
      'storm', 'toofan', 'cyclone',
      'hot', 'cold', 'garmi', 'sardi', 'thand',
      'winter', 'summer', 'aaj ka mausam'
    ]
  },
  {
    category: 'festival',
    keywords: [
      'festival', 'tyohar', 'holiday', 'chutti', 'parv', 'utsav',
      'diwali', 'deepavali', 'holi', 'eid', 'christmas',
      'navratri', 'dussehra', 'durga puja', 'ganesh chaturthi',
      'raksha bandhan', 'rakhi', 'bhai dooj',
      'baisakhi', 'lohri', 'pongal', 'onam', 'ugadi',
      'guru nanak jayanti', 'gurpurab', 'buddha purnima',
      'janmashtami', 'ram navami', 'hanuman jayanti',
      'karwa chauth', 'chhath', 'shivratri', 'mahashivratri',
      'independence day', '15 august', 'republic day', '26 january',
      'gandhi jayanti', 'new year', 'valentine'
    ]
  },
  {
    category: 'food',
    keywords: [
      'recipe', 'cook', 'cooking', 'banane ka tarika',
      'food', 'dish', 'cuisine', 'restaurant', 'dhaba',
      'biryani', 'curry', 'roti', 'dal', 'sabzi',
      'dessert', 'mithai', 'cake',
      'breakfast', 'lunch', 'dinner', 'snack', 'nashta',
      'vegetarian', 'veg', 'vegan', 'non-veg',
      'chicken', 'mutton', 'fish', 'paneer',
      'swiggy', 'zomato', 'cafe', 'bakery', 'pizza', 'burger'
    ]
  },
  {
    category: 'travel',
    keywords: [
      'travel', 'trip', 'tour', 'vacation', 'holiday', 'ghumna',
      'flight', 'airline', 'indigo', 'air india',
      'hotel', 'resort', 'booking',
      'destination', 'tourist', 'tourism',
      'beach', 'mountain', 'hill station', 'temple',
      'visa', 'passport', 'airport', 'railway', 'train', 'irctc',
      'goa', 'kashmir', 'kerala', 'rajasthan', 'himachal', 'manali', 'shimla',
      'makemytrip', 'goibibo', 'airbnb', 'oyo'
    ]
  },
  {
    category: 'education',
    keywords: [
      'learn', 'course', 'tutorial', 'study', 'padhai',
      'exam', 'result', 'marksheet',
      'university', 'college', 'school', 'admission',
      'syllabus', 'notes',
      'programming', 'coding', 'python', 'javascript', 'java',
      'science', 'math', 'physics', 'chemistry', 'biology',
      'upsc', 'ias', 'jee', 'neet', 'cat', 'gate',
      'ssc', 'ibps', 'bank po',
      'scholarship', 'degree', 'diploma',
      'cbse', 'icse', 'board exam', 'iit', 'nit'
    ]
  },
  {
    category: 'news',
    keywords: [
      // Core news terms
      'news', 'khabar', 'samachar', 'headline', 'breaking',
      'update', 'latest', 'announced', 'viral', 'trending',
      
      // Politics & Government
      'election', 'politics', 'government', 'sarkar',
      'minister', 'mantri', 'parliament', 'lok sabha', 'rajya sabha',
      
      // Incidents & Accidents (EXPANDED)
      'accident', 'hadsa', 'ghatna', 'incident', 'mamla', 'case',
      'earthquake', 'flood', 'baadh', 'storm', 'toofan',
      
      // Crime (EXPANDED)
      'crime', 'murder', 'hatya', 'qatl', 'robbery', 'theft', 'chori',
      'arrest', 'giraftaar', 'police', 'thana', 'fir',
      'court', 'adalat', 'verdict', 'faisla',
      
      // Death & Injury (NEW)
      'dead', 'death', 'maut', 'mrityu', 'shaheed', 'martyr',
      'injured', 'zakhmi', 'ghayal', 'hurt',
      'suicide', 'khudkushi', 'aatmhatya',
      
      // Missing & Rescue (NEW)
      'missing', 'lapata', 'gayab', 'kidnap', 'aghwa',
      'rescue', 'bachav', 'rahat',
      
      // Water bodies - for incidents like nehar (NEW)
      'nehar', 'canal', 'river', 'nadi', 'dariya', 'talab', 'pond',
      'drown', 'dooba', 'dubo', 'dhakka', 'giraya', 'feka',
      
      // Protest & Social (EXISTING)
      'protest', 'rally', 'andolan', 'dharna',
      'scam', 'corruption', 'ghotala', 'fraud',
      
      // Fire & Disaster (NEW)
      'fire', 'aag', 'blast', 'dhamaka', 'explosion',
      
      // Investigation (NEW)
      'investigation', 'jaanch', 'inquiry', 'postmortem'
    ]
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOISE WORDS (v1.4: Time words moved to NEWS_PRESERVE_WORDS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CSE_NOISE_WORDS = new Set([
  'hai', 'hain', 'tha', 'the', 'thi', 'ho', 'hota', 'hoti',
  'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'pe',
  'ne', 'na', 'nahi', 'mat', 'bhi', 'toh', 'to', 'hi',
  'kya', 'kaise', 'kahan', 'kahaan', 'kyun', 'kyon', 'kaun',
  'kab', 'kitna', 'kitne', 'kitni', 'konsa', 'konsi',
  'batao', 'bata', 'btao', 'btaao', 'bataye', 'btaiye',
  'dikhao', 'dikha', 'sunao', 'suna', 'btade', 'batade',
  'de', 'dena', 'dedo', 'dijiye', 'kariye',
  'mujhe', 'mujhko', 'hume', 'humko', 'apko', 'aapko', 'unko', 'usko',
  'mere', 'mera', 'meri', 'hamare', 'hamari', 'apna', 'apni',
  'ye', 'yeh', 'wo', 'woh', 'is', 'us', 'in', 'un',
  'uske', 'uski', 'iske', 'iski', 'unke', 'unki',
  'aur', 'ya', 'lekin', 'magar',
  'bahut', 'bohot', 'zyada', 'kam', 'thoda', 'sabse',
  'wala', 'wali', 'wale', 'waala', 'waali', 'waale',
  'kar', 'karo', 'karna', 'karke',
  'raha', 'rahi', 'rahe', 'rhe',
  'about', 'please', 'the', 'a', 'an', 'is', 'are', 'was', 'were',
  'what', 'who', 'when', 'where', 'why', 'how', 'which',
  'tell', 'show', 'find', 'get', 'give', 'can', 'could', 'would',
  'sir', 'bhai', 'yaar', 'bro', 'please', 'pls', 'plz', 'thanks',
  // NOTE: 'latest', 'update', 'today', 'aaj', 'kal', 'abhi' REMOVED
  // These are preserved for NEWS category queries
]);

// Words to preserve for NEWS category (time-sensitive context)
const NEWS_PRESERVE_WORDS = new Set([
  'latest', 'update', 'today', 'aaj', 'kal', 'abhi',
  'breaking', 'live', 'now', 'recent', 'fresh'
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHOWTIME KEYWORDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SHOWTIME_KEYWORDS = new Set([
  'showtime', 'showtimes', 'show', 'timing', 'time', 'schedule',
  'lagi', 'lagti', 'laga', 'chal', 'chalti', 'chala', 'running', 'playing',
  'ticket', 'tickets', 'book', 'booking',
  'theater', 'theatre', 'cinema', 'multiplex', 'pvr', 'inox',
  'kahaan', 'kahan', 'where', 'which', 'konsa', 'kis'
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDIAN LOCATIONS (100+ cities)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const INDIAN_LOCATIONS = new Set([
  'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'bengaluru', 'hyderabad',
  'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
  'indore', 'thane', 'bhopal', 'visakhapatnam', 'vizag', 'patna', 'vadodara',
  'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot',
  'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai',
  'allahabad', 'prayagraj', 'howrah', 'ranchi', 'gwalior', 'jabalpur', 'coimbatore',
  'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'chandigarh', 'guwahati',
  'solapur', 'hubli', 'mysore', 'mysuru', 'trichy', 'bareilly',
  'aligarh', 'moradabad', 'jalandhar', 'bhubaneswar', 'salem',
  'warangal', 'guntur', 'saharanpur', 'gorakhpur', 'bikaner',
  'noida', 'jamshedpur', 'bhilai', 'cuttack',
  'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum', 'thrissur',
  'firozpur', 'ferozepur', 'bathinda', 'patiala', 'mohali', 'pathankot',
  'hoshiarpur', 'batala', 'moga', 'abohar', 'malerkotla', 'khanna', 'phagwara',
  'muktsar', 'barnala', 'sangrur', 'kapurthala', 'fazilka', 'gurdaspur',
  'gurugram', 'gurgaon', 'rohtak', 'panipat', 'karnal', 'sonipat', 'yamunanagar',
  'hisar', 'ambala', 'bhiwani', 'sirsa', 'jind', 'kurukshetra',
  'greater noida', 'mathura', 'muzaffarnagar', 'jhansi', 'ayodhya',
  'udaipur', 'ajmer', 'bhilwara', 'alwar', 'bharatpur', 'sikar',
  'punjab', 'haryana', 'rajasthan', 'gujarat', 'maharashtra', 'karnataka',
  'tamil nadu', 'kerala', 'andhra', 'telangana', 'west bengal', 'bihar',
  'odisha', 'assam', 'jharkhand', 'uttarakhand', 'himachal',
  'jammu', 'kashmir', 'goa', 'india', 'bharat'
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CACHE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const queryCache = new Map<string, CacheEntry>();

function getCacheKey(query: string, category: SearchCategory): string {
  return `${category}:${query.toLowerCase().trim()}`;
}

function getFromCache(query: string, category: SearchCategory): CSEResponse | null {
  const key = getCacheKey(query, category);
  const entry = queryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    queryCache.delete(key);
    return null;
  }
  return { ...entry.response, cached: true };
}

function setCache(query: string, category: SearchCategory, response: CSEResponse): void {
  if (queryCache.size >= MAX_CACHE_SIZE) {
    const firstKey = queryCache.keys().next().value;
    if (firstKey) queryCache.delete(firstKey);
  }
  queryCache.set(getCacheKey(query, category), {
    response: { ...response, cached: false },
    timestamp: Date.now()
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function sanitizeInput(query: string): string {
  if (!query || typeof query !== 'string') return '';
  return query.trim().slice(0, 500).replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function getCategorySuffix(category: SearchCategory): string | null {
  const suffixes: Partial<Record<SearchCategory, string>> = {
    news: 'news hindi',
    sports: 'score news',
    entertainment: 'movie review',
    health: 'health hindi',
    finance: 'price today',
    food: 'recipe hindi',
    travel: 'travel guide',
    weather: 'weather forecast',
    festival: `festival date ${getCurrentYear()}`,
    education: 'hindi',
  };
  return suffixes[category] || null;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const GoogleCSEService = {
  
  detectCategory(query: string): SearchCategory {
    const lowerQuery = query.toLowerCase();
    for (const { category, keywords } of CATEGORY_KEYWORDS_ORDERED) {
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          console.log(`🏷️  [CSE] Category: ${category.toUpperCase()} (keyword: "${keyword}")`);
          return category;
        }
      }
    }
    console.log('🏷️  [CSE] Category: GENERAL');
    return 'general';
  },

  getEngineId(category: SearchCategory): string {
    return SEARCH_ENGINES[category] || SEARCH_ENGINES.general;
  },

  optimizeForCSE(query: string, category: SearchCategory): string {
    if (!query || query.trim().length === 0) return '';

    const queryLower = query.toLowerCase();
    const hasShowtimeIntent = Array.from(SHOWTIME_KEYWORDS).some(kw => queryLower.includes(kw));
    
    let cleaned = query.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleaned.split(' ');
    const meaningfulWords: string[] = [];
    const seenWords = new Set<string>();
    const addedSequels = new Set<string>();

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const nextWord = words[i + 1];
      
      // Preserve movie sequels: "border 2", "dhoom 3"
      if (nextWord && /^\d+$/.test(nextWord) && word.length >= 2) {
        const sequelName = `${word} ${nextWord}`;
        if (!addedSequels.has(sequelName) && !seenWords.has(word)) {
          meaningfulWords.push(word);
          meaningfulWords.push(nextWord);
          seenWords.add(word);
          seenWords.add(nextWord);
          addedSequels.add(sequelName);
          i++;
          continue;
        }
      }
      
      if (/^\d$/.test(word)) continue;
      
      // v1.4: Preserve time-sensitive words for NEWS category
      const isNewsPreserveWord = NEWS_PRESERVE_WORDS.has(word);
      if (CSE_NOISE_WORDS.has(word) && !(category === 'news' && isNewsPreserveWord)) continue;
      
      if (word.length < CSE_MIN_WORD_LENGTH && !/^\d{2,}$/.test(word)) continue;
      if (seenWords.has(word)) continue;
      
      // Skip near-duplicates
      let isDuplicate = false;
      for (const seen of seenWords) {
        if (Math.abs(seen.length - word.length) > 2) continue;
        const shorter = seen.length <= word.length ? seen : word;
        const longer = seen.length <= word.length ? word : seen;
        if (longer.includes(shorter) || longer.replace(/e/g, 'i') === shorter || longer.replace(/i/g, 'e') === shorter) {
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;

      seenWords.add(word);
      meaningfulWords.push(word);
      if (meaningfulWords.length >= CSE_MAX_QUERY_WORDS - 2) break;
    }

    let optimized = meaningfulWords.join(' ');

    // Handle showtime queries
    if (category === 'entertainment' && hasShowtimeIntent) {
      const movieWords: string[] = [];
      const locations: string[] = [];
      
      for (const word of meaningfulWords) {
        if (INDIAN_LOCATIONS.has(word)) {
          if (!locations.includes(word)) locations.push(word);
        } else if (!['movie', 'film', 'showtimes', 'showtime', 'show', 'ticket', 'booking'].includes(word)) {
          movieWords.push(word);
        }
      }
      
      if (movieWords.length > 0) {
        optimized = `${movieWords.join(' ')} showtimes${locations.length > 0 ? ' ' + locations[0] : ''}`.trim();
      }
    } else {
      const suffix = getCategorySuffix(category);
      if (suffix && !suffix.split(' ').some(sw => optimized.includes(sw))) {
        optimized = `${optimized} ${suffix}`;
      }
    }

    optimized = optimized.replace(/\s+/g, ' ').trim();
    if (optimized.split(' ').filter(w => w.length > 0).length < 2) {
      optimized = cleaned.split(' ').slice(0, CSE_MAX_QUERY_WORDS).join(' ');
    }

    return optimized;
  },

  async search(query: string, category?: SearchCategory, count: number = 5): Promise<CSEResponse> {
    const sanitizedQuery = sanitizeInput(query);
    
    if (!sanitizedQuery) {
      return {
        results: [], category: category || 'general', query: '', originalQuery: query,
        timeMs: 0, totalResults: 0, success: false, error: 'Empty query', errorType: 'EMPTY_QUERY'
      };
    }

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    if (!apiKey) {
      return {
        results: [], category: category || 'general', query: sanitizedQuery, originalQuery: query,
        timeMs: 0, totalResults: 0, success: false, error: 'API key not configured', errorType: 'API_KEY_MISSING'
      };
    }

    const start = Date.now();
    const detectedCategory = category || this.detectCategory(sanitizedQuery);
    const engineId = this.getEngineId(detectedCategory);

    // Check cache
    const cached = getFromCache(sanitizedQuery, detectedCategory);
    if (cached) {
      console.log(`⚡ [CSE v1.3] CACHE HIT`);
      return cached;
    }

    const optimizedQuery = this.optimizeForCSE(sanitizedQuery, detectedCategory);
    if (!optimizedQuery) {
      return {
        results: [], category: detectedCategory, query: '', originalQuery: query,
        timeMs: Date.now() - start, totalResults: 0, success: false, error: 'Empty optimized query', errorType: 'EMPTY_QUERY'
      };
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [Google CSE v1.4 BULLETPROOF] SEARCH');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Original: "${sanitizedQuery}"`);
    console.log(`🔄 Optimized: "${optimizedQuery}"`);
    console.log(`🏷️  Category: ${detectedCategory.toUpperCase()}`);
    console.log(`🔑 Engine ID: ${engineId}`);

    let lastError = '';
    let lastErrorType: CSEResponse['errorType'] = 'API_ERROR';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 [CSE] Retry ${attempt}/${MAX_RETRIES}...`);
          await sleep(RETRY_DELAY_MS * attempt);
        }

        const response = await axios.get(CSE_API_URL, {
          params: { key: apiKey, cx: engineId, q: optimizedQuery, num: Math.min(count, 10) },
          timeout: CSE_TIMEOUT,
        });

        const timeMs = Date.now() - start;
        const results: CSEResult[] = (response.data.items || []).map((item: any) => ({
          title: item.title || '',
          url: item.link || '',
          description: item.snippet || '',
          source: item.displayLink || '',
          thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src,
        }));

        const totalResults = parseInt(response.data.searchInformation?.totalResults || '0', 10);

        console.log(`✅ [CSE] ${results.length} results in ${timeMs}ms`);
        if (results.length > 0) console.log(`📰 Sources: ${results.slice(0, 3).map(r => r.source).join(', ')}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const successResponse: CSEResponse = {
          results, category: detectedCategory, query: optimizedQuery, originalQuery: query,
          timeMs, totalResults, success: results.length >= MIN_RESULTS_THRESHOLD, retryCount: attempt
        };

        if (successResponse.success) setCache(sanitizedQuery, detectedCategory, successResponse);
        return successResponse;

      } catch (error) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          if (status === 429) {
            lastError = 'Rate limited (429)';
            lastErrorType = 'RATE_LIMITED';
            if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAY_MS * 3); continue; }
          } else if (status >= 500) {
            lastError = `Server error (${status})`;
            lastErrorType = 'API_ERROR';
            continue;
          } else {
            lastError = `HTTP ${status}`;
            lastErrorType = 'API_ERROR';
            break;
          }
        } else if (axiosError.code === 'ECONNABORTED') {
          lastError = 'Timeout';
          lastErrorType = 'TIMEOUT';
          continue;
        } else if (axiosError.request) {
          lastError = 'Network error';
          lastErrorType = 'NETWORK_ERROR';
          continue;
        } else {
          lastError = axiosError.message || 'Unknown error';
          break;
        }
      }
    }

    console.error(`❌ [CSE] Failed: ${lastError}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      results: [], category: detectedCategory, query: optimizedQuery, originalQuery: query,
      timeMs: Date.now() - start, totalResults: 0, success: false, error: lastError,
      errorType: lastErrorType, retryCount: MAX_RETRIES
    };
  },

  async quickSearch(query: string): Promise<string | null> {
    const response = await this.search(query, undefined, 3);
    return response.success && response.results.length > 0 ? response.results[0].description : null;
  },

  hasEnoughResults(response: CSEResponse): boolean {
    return response.results.length >= MIN_RESULTS_THRESHOLD;
  },

  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_SEARCH_API_KEY);
  },

  getCategories(): SearchCategory[] {
    return Object.keys(SEARCH_ENGINES) as SearchCategory[];
  },

  clearCache(): void {
    queryCache.clear();
    console.log('🗑️  [CSE] Cache cleared');
  },

  getCacheStats(): { size: number; maxSize: number; ttlMs: number } {
    return { size: queryCache.size, maxSize: MAX_CACHE_SIZE, ttlMs: CACHE_TTL_MS };
  }
};

export default GoogleCSEService;