// src/services/calendar/festivalService.ts

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA FESTIVAL SERVICE v3.0 (PRODUCTION)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Risenex Dynamics
 * Date: January 23, 2026
 * 
 * v3.0 CHANGES:
 * ✅ FIX 1: US/UK holidays added to synonyms
 * ✅ FIX 2: Description-based matching
 * ✅ FIX 3: Description fallback in primary selection
 * ✅ FIX 4: City abbreviations (NYC, LA, SF, NY)
 * ✅ FIX 5: Cache key includes state/region
 * ✅ FIX 6: Calendarific state abbreviation mapping
 * ✅ FIX 7: Timezone normalization by country
 * ✅ FIX 8: Smart month search (avoid 12 API calls)
 * ✅ FIX 9: Country-specific fallback (India = religious+national)
 * ✅ FIX 10: "This Sunday" / "Is Sunday" parser
 * ✅ COST: 0% extra (only +10-20 tokens when festival detected)
 * 
 * PURPOSE:
 * - Accurate festival/holiday detection using Calendarific API
 * - Supports fixed + variable date festivals worldwide
 * - Regional awareness with smart country-specific fallback
 * - Human-date intelligence (Hinglish + English)
 * - Timezone-aware date handling
 * 
 * API: Calendarific (https://calendarific.com)
 * - FREE: 1000 calls/month
 * - Paid: $9/month for 10K calls
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from 'axios';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Festival {
  name: string;
  localName?: string;
  description?: string;
  date: string;
  dateHuman: string;
  type: string[];
  isNational: boolean;
  isReligious: boolean;
  regions?: string[];
  country: string;
  countryCode: string;
  normalizedName: string;
}

export interface FestivalQueryResult {
  success: boolean;
  date: string;
  dateHuman: string;
  location: string;
  festivals: Festival[];
  primaryFestival?: Festival;
  count: number;
  cached: boolean;
  source: 'calendarific' | 'cache' | 'fallback';
  regionFiltered: boolean;
  fallbackUsed: boolean;
  fallbackType?: 'all' | 'religious_national';
  error?: string;
}

export interface FestivalQueryInput {
  date?: Date | string;
  country?: string;
  countryCode?: string;
  state?: string;
  city?: string;
}

export interface ParsedDate {
  date: Date;
  original: string;
  parsed: string;
  confidence: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIX 7: TIMEZONE BY COUNTRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COUNTRY_TIMEZONES: Record<string, number> = {
  // Asia
  'IN': 5.5,    // India IST
  'PK': 5,      // Pakistan PKT
  'BD': 6,      // Bangladesh BST
  'NP': 5.75,   // Nepal NPT
  'LK': 5.5,    // Sri Lanka IST
  'AE': 4,      // UAE GST
  'SA': 3,      // Saudi Arabia AST
  'QA': 3,      // Qatar AST
  'KW': 3,      // Kuwait AST
  'BH': 3,      // Bahrain AST
  'OM': 4,      // Oman GST
  'SG': 8,      // Singapore SGT
  'MY': 8,      // Malaysia MYT
  'TH': 7,      // Thailand ICT
  'ID': 7,      // Indonesia WIB (default)
  'HK': 8,      // Hong Kong HKT
  'CN': 8,      // China CST
  'JP': 9,      // Japan JST
  
  // Europe
  'GB': 0,      // UK GMT (default, ignore DST)
  'DE': 1,      // Germany CET
  'FR': 1,      // France CET
  'IT': 1,      // Italy CET
  'ES': 1,      // Spain CET
  'NL': 1,      // Netherlands CET
  'CH': 1,      // Switzerland CET
  
  // Americas
  'US': -5,     // USA EST (default)
  'CA': -5,     // Canada EST (default)
  'MX': -6,     // Mexico CST
  
  // Oceania
  'AU': 10,     // Australia AEST (default)
  'NZ': 12,     // New Zealand NZST
  
  // Africa
  'ZA': 2,      // South Africa SAST
  'KE': 3,      // Kenya EAT
  'NG': 1,      // Nigeria WAT
};

function getDateForCountry(countryCode: string): Date {
  const now = new Date();
  const offset = COUNTRY_TIMEZONES[countryCode] ?? 5.5; // Default to IST
  const offsetMs = offset * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  return new Date(utc + offsetMs);
}

function getISTDate(): Date {
  return getDateForCountry('IN');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIX 1: FESTIVAL SYNONYMS (US/UK/Global added)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FESTIVAL_SYNONYMS: Record<string, string[]> = {
  // ─────────────────────────────────────────────────────────────
  // INDIAN FESTIVALS
  // ─────────────────────────────────────────────────────────────
  'diwali': ['diwali', 'deepavali', 'dipawali', 'deepawali', 'divali', 'lakshmi puja'],
  'dussehra': ['dussehra', 'vijayadashami', 'vijaya dashami', 'dasara', 'dashain'],
  'holi': ['holi', 'holika', 'dhulandi', 'phagwah', 'rang panchami', 'holika dahan'],
  'navratri': ['navratri', 'navaratri', 'durga puja', 'sharad navratri', 'chaitra navratri'],
  'ganesh chaturthi': ['ganesh chaturthi', 'vinayaka chaturthi', 'ganpati', 'ganeshotsav', 'vinayak chaturthi'],
  'raksha bandhan': ['raksha bandhan', 'rakhi', 'rakshabandhan', 'rakhi purnima'],
  'janmashtami': ['janmashtami', 'krishna janmashtami', 'gokulashtami', 'krishnashtami'],
  'mahashivratri': ['mahashivratri', 'maha shivaratri', 'shivratri', 'shivaratri'],
  'vasant panchami': ['vasant panchami', 'basant panchami', 'saraswati puja', 'shri panchami', 'basant'],
  'karwa chauth': ['karwa chauth', 'karva chauth', 'karvachauth'],
  'chhath': ['chhath', 'chhath puja', 'dala chhath', 'surya shashthi'],
  'onam': ['onam', 'thiruvonam', 'onam festival'],
  'pongal': ['pongal', 'thai pongal', 'makar pongal'],
  'ugadi': ['ugadi', 'yugadi', 'gudi padwa'],
  'makar sankranti': ['makar sankranti', 'sankranti', 'uttarayan', 'maghi'],
  'bhai dooj': ['bhai dooj', 'bhai phonta', 'bhau beej', 'bhai tika'],
  
  // Sikh Festivals
  'baisakhi': ['baisakhi', 'vaisakhi', 'vaishakhi', 'khalsa sirjana divas'],
  'gurpurab': ['gurpurab', 'guru nanak jayanti', 'guru nanak gurpurab', 'prakash parv', 'guru purab'],
  'lohri': ['lohri', 'lohdi', 'til sankranti'],
  
  // Islamic Festivals
  'eid ul fitr': ['eid ul fitr', 'eid al fitr', 'eid', 'ramadan eid', 'meethi eid', 'chhoti eid', 'idul fitri'],
  'eid ul adha': ['eid ul adha', 'eid al adha', 'bakrid', 'bakra eid', 'badi eid', 'qurbani eid', 'idul adha'],
  'muharram': ['muharram', 'ashura', 'yaum e ashura'],
  'milad un nabi': ['milad un nabi', 'mawlid', 'eid milad un nabi', 'prophet birthday', 'mawlid al nabi'],
  
  // Indian National Days
  'republic day': ['republic day', 'gantantra diwas', '26 january', '26th january'],
  'independence day': ['independence day india', 'swatantrata diwas', '15 august', '15th august', 'indian independence'],
  'gandhi jayanti': ['gandhi jayanti', 'mahatma gandhi birthday', '2 october', 'gandhi birthday'],
  
  // ─────────────────────────────────────────────────────────────
  // US HOLIDAYS (FIX 1)
  // ─────────────────────────────────────────────────────────────
  'thanksgiving': ['thanksgiving', 'thanksgiving day', 'turkey day', 'thanksgiving usa'],
  'black friday': ['black friday', 'black friday sale'],
  'independence day us': ['independence day', 'july 4th', '4th of july', 'fourth of july', 'july fourth', 'us independence'],
  'veterans day': ['veterans day', 'veterans day usa', 'armistice day'],
  'memorial day': ['memorial day', 'memorial day usa', 'decoration day'],
  'presidents day': ['presidents day', "president's day", 'washington birthday', 'presidents day usa'],
  'labor day us': ['labor day', 'labor day usa', 'labour day usa'],
  'martin luther king day': ['martin luther king day', 'mlk day', 'martin luther king jr day', 'mlk jr day'],
  'columbus day': ['columbus day', 'indigenous peoples day'],
  'juneteenth': ['juneteenth', 'freedom day', 'emancipation day'],
  
  // ─────────────────────────────────────────────────────────────
  // UK/EUROPE HOLIDAYS (FIX 1)
  // ─────────────────────────────────────────────────────────────
  'boxing day': ['boxing day', 'day after christmas', '26 december'],
  'easter monday': ['easter monday', 'monday after easter'],
  'may day': ['may day', 'early may bank holiday', 'workers day'],
  'spring bank holiday': ['spring bank holiday', 'late may bank holiday', 'whit monday'],
  'summer bank holiday': ['summer bank holiday', 'august bank holiday'],
  'guy fawkes': ['guy fawkes', 'bonfire night', 'guy fawkes night', '5th november'],
  'st patricks day': ["st patrick's day", 'saint patricks day', 'paddys day', 'st paddy'],
  
  // ─────────────────────────────────────────────────────────────
  // CANADA/AUSTRALIA/NZ (FIX 1)
  // ─────────────────────────────────────────────────────────────
  'canada day': ['canada day', 'dominion day', '1st july canada', 'july 1 canada'],
  'victoria day': ['victoria day', 'may two-four', 'queen victoria birthday'],
  'anzac day': ['anzac day', 'anzac', 'australia new zealand army corps day'],
  'australia day': ['australia day', '26 january australia', 'invasion day'],
  'waitangi day': ['waitangi day', 'new zealand day'],
  
  // ─────────────────────────────────────────────────────────────
  // CHRISTIAN FESTIVALS
  // ─────────────────────────────────────────────────────────────
  'christmas': ['christmas', 'xmas', 'christmas day', 'bada din', '25 december', 'christmas eve'],
  'easter': ['easter', 'easter sunday', 'resurrection sunday', 'pascha'],
  'good friday': ['good friday', 'holy friday', 'great friday'],
  'ash wednesday': ['ash wednesday', 'start of lent'],
  'palm sunday': ['palm sunday', 'passion sunday'],
  'pentecost': ['pentecost', 'whitsunday', 'whit sunday'],
  
  // ─────────────────────────────────────────────────────────────
  // CHINESE/ASIAN FESTIVALS
  // ─────────────────────────────────────────────────────────────
  'chinese new year': ['chinese new year', 'lunar new year', 'spring festival', 'cny', 'chunjie'],
  'mid autumn festival': ['mid autumn festival', 'moon festival', 'mooncake festival', 'zhongqiu'],
  'dragon boat festival': ['dragon boat festival', 'duanwu festival', 'double fifth'],
  'qingming': ['qingming', 'tomb sweeping day', 'ching ming'],
  'vesak': ['vesak', 'buddha purnima', 'buddha day', 'buddha jayanti'],
  'deepavali singapore': ['deepavali', 'diwali singapore', 'diwali malaysia'],
  'thaipusam': ['thaipusam', 'thai pusam'],
  'hungry ghost festival': ['hungry ghost festival', 'zhongyuan', 'ghost month'],
};

// FIX 8: Festival month hints for smart search
const FESTIVAL_MONTHS: Record<string, number[]> = {
  'diwali': [10, 11],
  'holi': [2, 3],
  'dussehra': [9, 10],
  'navratri': [9, 10],
  'ganesh chaturthi': [8, 9],
  'janmashtami': [8, 9],
  'raksha bandhan': [7, 8],
  'mahashivratri': [2, 3],
  'vasant panchami': [1, 2],
  'onam': [8, 9],
  'pongal': [1],
  'makar sankranti': [1],
  'lohri': [1],
  'baisakhi': [4],
  'eid ul fitr': [3, 4, 5],
  'eid ul adha': [6, 7],
  'muharram': [7, 8],
  'christmas': [12],
  'easter': [3, 4],
  'good friday': [3, 4],
  'thanksgiving': [11],
  'chinese new year': [1, 2],
  'mid autumn festival': [9, 10],
  'vesak': [4, 5],
};

// Create reverse lookup
const SYNONYM_TO_CANONICAL: Record<string, string> = {};
for (const [canonical, synonyms] of Object.entries(FESTIVAL_SYNONYMS)) {
  for (const syn of synonyms) {
    SYNONYM_TO_CANONICAL[syn.toLowerCase()] = canonical;
  }
}

function normalizeFestivalName(name: string): string {
  const lower = name.toLowerCase().trim();
  return SYNONYM_TO_CANONICAL[lower] || lower;
}

// FIX 2: Match festival by name AND description
function matchesFestival(festival: Festival, searchTerm: string): boolean {
  const normalizedFestival = normalizeFestivalName(festival.name);
  const normalizedSearch = normalizeFestivalName(searchTerm);
  
  // Direct name match
  if (normalizedFestival === normalizedSearch) return true;
  if (normalizedFestival.includes(normalizedSearch)) return true;
  if (normalizedSearch.includes(normalizedFestival)) return true;
  
  // FIX 2: Check description
  if (festival.description) {
    const descLower = festival.description.toLowerCase();
    if (descLower.includes(normalizedSearch)) return true;
    if (descLower.includes(searchTerm.toLowerCase())) return true;
  }
  
  return false;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIX 4: CITY ABBREVIATIONS + WORLD CITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// City abbreviation expansions
const CITY_ABBREVIATIONS: Record<string, string> = {
  'nyc': 'new york',
  'ny': 'new york',
  'la': 'los angeles',
  'sf': 'san francisco',
  'dc': 'washington',
  'philly': 'philadelphia',
  'chi': 'chicago',
  'ldn': 'london',
  'hk': 'hong kong',
  'sg': 'singapore',
  'kl': 'kuala lumpur',
  'bom': 'mumbai',
  'del': 'delhi',
  'blr': 'bangalore',
  'chn': 'chennai',
  'hyd': 'hyderabad',
  'cal': 'kolkata',
};

function normalizeCity(city: string): string {
  let normalized = city.toLowerCase()
    .replace(/\bcity\b/gi, '')     // Remove "city"
    .replace(/\./g, '')            // Remove dots
    .replace(/\s+/g, ' ')          // Normalize spaces
    .trim();
  
  // Check abbreviations
  if (CITY_ABBREVIATIONS[normalized]) {
    return CITY_ABBREVIATIONS[normalized];
  }
  
  return normalized;
}

interface CityMapping {
  countryCode: string;
  country: string;
  region?: string;
}

const WORLD_CITIES: Record<string, CityMapping> = {
  // UAE
  'dubai': { countryCode: 'AE', country: 'United Arab Emirates', region: 'Dubai' },
  'abu dhabi': { countryCode: 'AE', country: 'United Arab Emirates', region: 'Abu Dhabi' },
  'sharjah': { countryCode: 'AE', country: 'United Arab Emirates', region: 'Sharjah' },
  
  // UK
  'london': { countryCode: 'GB', country: 'United Kingdom', region: 'England' },
  'manchester': { countryCode: 'GB', country: 'United Kingdom', region: 'England' },
  'birmingham': { countryCode: 'GB', country: 'United Kingdom', region: 'England' },
  'edinburgh': { countryCode: 'GB', country: 'United Kingdom', region: 'Scotland' },
  'glasgow': { countryCode: 'GB', country: 'United Kingdom', region: 'Scotland' },
  'cardiff': { countryCode: 'GB', country: 'United Kingdom', region: 'Wales' },
  'belfast': { countryCode: 'GB', country: 'United Kingdom', region: 'Northern Ireland' },
  
  // USA
  'new york': { countryCode: 'US', country: 'United States', region: 'New York' },
  'los angeles': { countryCode: 'US', country: 'United States', region: 'California' },
  'chicago': { countryCode: 'US', country: 'United States', region: 'Illinois' },
  'houston': { countryCode: 'US', country: 'United States', region: 'Texas' },
  'san francisco': { countryCode: 'US', country: 'United States', region: 'California' },
  'seattle': { countryCode: 'US', country: 'United States', region: 'Washington' },
  'miami': { countryCode: 'US', country: 'United States', region: 'Florida' },
  'boston': { countryCode: 'US', country: 'United States', region: 'Massachusetts' },
  'washington': { countryCode: 'US', country: 'United States', region: 'District of Columbia' },
  'philadelphia': { countryCode: 'US', country: 'United States', region: 'Pennsylvania' },
  'dallas': { countryCode: 'US', country: 'United States', region: 'Texas' },
  'atlanta': { countryCode: 'US', country: 'United States', region: 'Georgia' },
  'denver': { countryCode: 'US', country: 'United States', region: 'Colorado' },
  'phoenix': { countryCode: 'US', country: 'United States', region: 'Arizona' },
  'las vegas': { countryCode: 'US', country: 'United States', region: 'Nevada' },
  
  // Canada
  'toronto': { countryCode: 'CA', country: 'Canada', region: 'Ontario' },
  'vancouver': { countryCode: 'CA', country: 'Canada', region: 'British Columbia' },
  'montreal': { countryCode: 'CA', country: 'Canada', region: 'Quebec' },
  'calgary': { countryCode: 'CA', country: 'Canada', region: 'Alberta' },
  'ottawa': { countryCode: 'CA', country: 'Canada', region: 'Ontario' },
  
  // Australia
  'sydney': { countryCode: 'AU', country: 'Australia', region: 'New South Wales' },
  'melbourne': { countryCode: 'AU', country: 'Australia', region: 'Victoria' },
  'brisbane': { countryCode: 'AU', country: 'Australia', region: 'Queensland' },
  'perth': { countryCode: 'AU', country: 'Australia', region: 'Western Australia' },
  'adelaide': { countryCode: 'AU', country: 'Australia', region: 'South Australia' },
  
  // Singapore/Malaysia
  'singapore': { countryCode: 'SG', country: 'Singapore' },
  'kuala lumpur': { countryCode: 'MY', country: 'Malaysia', region: 'Kuala Lumpur' },
  'penang': { countryCode: 'MY', country: 'Malaysia', region: 'Penang' },
  'johor bahru': { countryCode: 'MY', country: 'Malaysia', region: 'Johor' },
  
  // Middle East
  'doha': { countryCode: 'QA', country: 'Qatar' },
  'riyadh': { countryCode: 'SA', country: 'Saudi Arabia' },
  'jeddah': { countryCode: 'SA', country: 'Saudi Arabia' },
  'mecca': { countryCode: 'SA', country: 'Saudi Arabia' },
  'medina': { countryCode: 'SA', country: 'Saudi Arabia' },
  'kuwait city': { countryCode: 'KW', country: 'Kuwait' },
  'muscat': { countryCode: 'OM', country: 'Oman' },
  'manama': { countryCode: 'BH', country: 'Bahrain' },
  
  // Europe
  'paris': { countryCode: 'FR', country: 'France' },
  'berlin': { countryCode: 'DE', country: 'Germany' },
  'munich': { countryCode: 'DE', country: 'Germany', region: 'Bavaria' },
  'frankfurt': { countryCode: 'DE', country: 'Germany', region: 'Hesse' },
  'amsterdam': { countryCode: 'NL', country: 'Netherlands' },
  'rome': { countryCode: 'IT', country: 'Italy' },
  'milan': { countryCode: 'IT', country: 'Italy', region: 'Lombardy' },
  'madrid': { countryCode: 'ES', country: 'Spain' },
  'barcelona': { countryCode: 'ES', country: 'Spain', region: 'Catalonia' },
  'zurich': { countryCode: 'CH', country: 'Switzerland' },
  'geneva': { countryCode: 'CH', country: 'Switzerland' },
  'dublin': { countryCode: 'IE', country: 'Ireland' },
  
  // Asia
  'tokyo': { countryCode: 'JP', country: 'Japan' },
  'osaka': { countryCode: 'JP', country: 'Japan' },
  'hong kong': { countryCode: 'HK', country: 'Hong Kong' },
  'bangkok': { countryCode: 'TH', country: 'Thailand' },
  'jakarta': { countryCode: 'ID', country: 'Indonesia' },
  'beijing': { countryCode: 'CN', country: 'China' },
  'shanghai': { countryCode: 'CN', country: 'China' },
  'seoul': { countryCode: 'KR', country: 'South Korea' },
  
  // South Asia
  'kathmandu': { countryCode: 'NP', country: 'Nepal' },
  'dhaka': { countryCode: 'BD', country: 'Bangladesh' },
  'colombo': { countryCode: 'LK', country: 'Sri Lanka' },
  'karachi': { countryCode: 'PK', country: 'Pakistan' },
  'lahore': { countryCode: 'PK', country: 'Pakistan', region: 'Punjab' },
  'islamabad': { countryCode: 'PK', country: 'Pakistan' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIX 6: INDIAN STATE ABBREVIATION MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STATE_ABBREVIATIONS: Record<string, string> = {
  'MH': 'Maharashtra',
  'PB': 'Punjab',
  'HR': 'Haryana',
  'KA': 'Karnataka',
  'GJ': 'Gujarat',
  'TN': 'Tamil Nadu',
  'WB': 'West Bengal',
  'RJ': 'Rajasthan',
  'BR': 'Bihar',
  'UP': 'Uttar Pradesh',
  'MP': 'Madhya Pradesh',
  'AP': 'Andhra Pradesh',
  'TG': 'Telangana',
  'KL': 'Kerala',
  'OR': 'Odisha',
  'AS': 'Assam',
  'JH': 'Jharkhand',
  'CG': 'Chhattisgarh',
  'UK': 'Uttarakhand',
  'HP': 'Himachal Pradesh',
  'GA': 'Goa',
  'JK': 'Jammu and Kashmir',
  'DL': 'Delhi',
  'CH': 'Chandigarh',
  'PN': 'Puducherry',
};

function expandStateAbbreviation(state: string): string {
  if (state.length === 2) {
    return STATE_ABBREVIATIONS[state.toUpperCase()] || state;
  }
  return state;
}

// Country codes
const COUNTRY_CODES: Record<string, string> = {
  'india': 'IN',
  'united states': 'US',
  'usa': 'US',
  'america': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'england': 'GB',
  'britain': 'GB',
  'canada': 'CA',
  'australia': 'AU',
  'pakistan': 'PK',
  'bangladesh': 'BD',
  'nepal': 'NP',
  'sri lanka': 'LK',
  'uae': 'AE',
  'united arab emirates': 'AE',
  'dubai': 'AE',
  'saudi arabia': 'SA',
  'qatar': 'QA',
  'kuwait': 'KW',
  'bahrain': 'BH',
  'oman': 'OM',
  'china': 'CN',
  'japan': 'JP',
  'germany': 'DE',
  'france': 'FR',
  'italy': 'IT',
  'spain': 'ES',
  'netherlands': 'NL',
  'singapore': 'SG',
  'malaysia': 'MY',
  'thailand': 'TH',
  'indonesia': 'ID',
  'hong kong': 'HK',
  'new zealand': 'NZ',
  'south africa': 'ZA',
  'kenya': 'KE',
  'nigeria': 'NG',
  'ireland': 'IE',
  'south korea': 'KR',
  'korea': 'KR',
};

// Indian states for region mapping
const INDIAN_STATES: Record<string, string[]> = {
  'punjab': ['Punjab', 'PB'],
  'haryana': ['Haryana', 'HR'],
  'delhi': ['Delhi', 'DL'],
  'uttar pradesh': ['Uttar Pradesh', 'UP'],
  'maharashtra': ['Maharashtra', 'MH'],
  'tamil nadu': ['Tamil Nadu', 'TN'],
  'karnataka': ['Karnataka', 'KA'],
  'west bengal': ['West Bengal', 'WB'],
  'gujarat': ['Gujarat', 'GJ'],
  'rajasthan': ['Rajasthan', 'RJ'],
  'kerala': ['Kerala', 'KL'],
  'andhra pradesh': ['Andhra Pradesh', 'AP'],
  'telangana': ['Telangana', 'TG'],
  'bihar': ['Bihar', 'BR'],
  'madhya pradesh': ['Madhya Pradesh', 'MP'],
  'odisha': ['Odisha', 'OR'],
  'assam': ['Assam', 'AS'],
  'jharkhand': ['Jharkhand', 'JH'],
  'chhattisgarh': ['Chhattisgarh', 'CG'],
  'uttarakhand': ['Uttarakhand', 'UK'],
  'himachal pradesh': ['Himachal Pradesh', 'HP'],
  'goa': ['Goa', 'GA'],
  'jammu and kashmir': ['Jammu and Kashmir', 'JK'],
  // Indian cities → State
  'ferozepur': ['Punjab', 'PB'],
  'firozpur': ['Punjab', 'PB'],
  'ludhiana': ['Punjab', 'PB'],
  'amritsar': ['Punjab', 'PB'],
  'chandigarh': ['Chandigarh', 'CH'],
  'mumbai': ['Maharashtra', 'MH'],
  'pune': ['Maharashtra', 'MH'],
  'chennai': ['Tamil Nadu', 'TN'],
  'kolkata': ['West Bengal', 'WB'],
  'bangalore': ['Karnataka', 'KA'],
  'bengaluru': ['Karnataka', 'KA'],
  'hyderabad': ['Telangana', 'TG'],
  'ahmedabad': ['Gujarat', 'GJ'],
  'jaipur': ['Rajasthan', 'RJ'],
  'lucknow': ['Uttar Pradesh', 'UP'],
  'patna': ['Bihar', 'BR'],
  'bhopal': ['Madhya Pradesh', 'MP'],
  'kochi': ['Kerala', 'KL'],
  'thiruvananthapuram': ['Kerala', 'KL'],
  'guwahati': ['Assam', 'AS'],
  'bhubaneswar': ['Odisha', 'OR'],
  'ranchi': ['Jharkhand', 'JH'],
  'dehradun': ['Uttarakhand', 'UK'],
  'shimla': ['Himachal Pradesh', 'HP'],
  'srinagar': ['Jammu and Kashmir', 'JK'],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIX 10: NATURAL LANGUAGE DATE PARSER (improved)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateHuman(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function parseNaturalDate(input: string | Date | undefined, countryCode: string = 'IN'): ParsedDate {
  const now = getDateForCountry(countryCode);
  
  if (input instanceof Date) {
    return { date: input, original: input.toISOString(), parsed: formatDateHuman(input), confidence: 1.0 };
  }
  
  if (!input || input.trim() === '') {
    return { date: now, original: 'today (default)', parsed: formatDateHuman(now), confidence: 1.0 };
  }
  
  const text = input.toLowerCase().trim();
  
  // ─────────────────────────────────────────────────────────────
  // TODAY
  // ─────────────────────────────────────────────────────────────
  if (/^(aaj|today|abhi|filhaal|is\s*waqt|aj)$/i.test(text) || /\b(aaj|today)\b/i.test(text)) {
    return { date: now, original: input, parsed: `Today (${formatDateHuman(now)})`, confidence: 1.0 };
  }
  
  // ─────────────────────────────────────────────────────────────
  // TOMORROW (but not "beeta kal" = yesterday)
  // ─────────────────────────────────────────────────────────────
  if (/^(kal|tomorrow|agle\s*din|agla\s*din)$/i.test(text) ||
      (/\b(kal|tomorrow)\b/i.test(text) && !/\b(beeta|guzra|pichla|bita)\b/i.test(text))) {
    const d = new Date(now); d.setDate(now.getDate() + 1);
    return { date: d, original: input, parsed: `Tomorrow (${formatDateHuman(d)})`, confidence: 0.95 };
  }
  
  // ─────────────────────────────────────────────────────────────
  // YESTERDAY
  // ─────────────────────────────────────────────────────────────
  if (/\b(yesterday|beeta\s*kal|bita\s*kal|guzra\s*kal|pichla\s*din)\b/i.test(text)) {
    const d = new Date(now); d.setDate(now.getDate() - 1);
    return { date: d, original: input, parsed: `Yesterday (${formatDateHuman(d)})`, confidence: 0.95 };
  }
  
  // ─────────────────────────────────────────────────────────────
  // PARSO (day after tomorrow)
  // ─────────────────────────────────────────────────────────────
  if (/\b(parso|parson|day\s*after\s*tomorrow|do\s*din\s*baad)\b/i.test(text)) {
    const d = new Date(now); d.setDate(now.getDate() + 2);
    return { date: d, original: input, parsed: `Day after tomorrow (${formatDateHuman(d)})`, confidence: 0.9 };
  }
  
  // ─────────────────────────────────────────────────────────────
  // NARSO/TARSO (3 days)
  // ─────────────────────────────────────────────────────────────
  if (/\b(narso|tarso|three\s*days|teen\s*din)\b/i.test(text)) {
    const d = new Date(now); d.setDate(now.getDate() + 3);
    return { date: d, original: input, parsed: `3 days from now (${formatDateHuman(d)})`, confidence: 0.85 };
  }
  
  // ─────────────────────────────────────────────────────────────
  // NEXT WEEK
  // ─────────────────────────────────────────────────────────────
  if (/\b(next\s*week|agle\s*hafte|agli\s*week|agla\s*hafta)\b/i.test(text)) {
    const d = new Date(now); d.setDate(now.getDate() + 7);
    return { date: d, original: input, parsed: `Next week (${formatDateHuman(d)})`, confidence: 0.8 };
  }
  
  // ─────────────────────────────────────────────────────────────
  // FIX 10: THIS/IS SUNDAY + NEXT SUNDAY (improved)
  // ─────────────────────────────────────────────────────────────
  const weekdays: Record<string, number> = {
    'sunday': 0, 'ravivar': 0, 'itwaar': 0,
    'monday': 1, 'somvar': 1, 'pir': 1,
    'tuesday': 2, 'mangalvar': 2,
    'wednesday': 3, 'budhvar': 3,
    'thursday': 4, 'guruvar': 4, 'brihaspativar': 4,
    'friday': 5, 'shukravar': 5, 'jumma': 5,
    'saturday': 6, 'shanivar': 6,
  };
  
  // "This Sunday", "Is Sunday", "Iss Sunday"
  const thisDayMatch = text.match(/\b(this|is|iss|ye|yeh)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday|ravivar|somvar|mangalvar|budhvar|guruvar|shukravar|shanivar)\b/i);
  if (thisDayMatch) {
    const targetDay = weekdays[thisDayMatch[2].toLowerCase()];
    if (targetDay !== undefined) {
      const d = new Date(now);
      const currentDay = d.getDay();
      
      // If today IS that day, return today
      if (currentDay === targetDay) {
        return { date: d, original: input, parsed: `This ${thisDayMatch[2]} (${formatDateHuman(d)})`, confidence: 0.9 };
      }
      
      // Otherwise, find next occurrence
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      d.setDate(d.getDate() + daysToAdd);
      return { date: d, original: input, parsed: `This ${thisDayMatch[2]} (${formatDateHuman(d)})`, confidence: 0.85 };
    }
  }
  
  // "Next Sunday", "Agle Sunday", "Coming Sunday"
  const nextDayMatch = text.match(/\b(next|agle|agli|coming|aane\s*wale)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday|ravivar|somvar|mangalvar|budhvar|guruvar|shukravar|shanivar)\b/i);
  if (nextDayMatch) {
    const targetDay = weekdays[nextDayMatch[2].toLowerCase()];
    if (targetDay !== undefined) {
      const d = new Date(now);
      const currentDay = d.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      d.setDate(d.getDate() + daysToAdd);
      return { date: d, original: input, parsed: `Next ${nextDayMatch[2]} (${formatDateHuman(d)})`, confidence: 0.85 };
    }
  }
  
  // ─────────────────────────────────────────────────────────────
  // ABSOLUTE DATE PARSING
  // ─────────────────────────────────────────────────────────────
  const months: Record<string, number> = {
    'january': 0, 'jan': 0, 'जनवरी': 0,
    'february': 1, 'feb': 1, 'फरवरी': 1,
    'march': 2, 'mar': 2, 'मार्च': 2,
    'april': 3, 'apr': 3, 'अप्रैल': 3,
    'may': 4, 'मई': 4,
    'june': 5, 'jun': 5, 'जून': 5,
    'july': 6, 'jul': 6, 'जुलाई': 6,
    'august': 7, 'aug': 7, 'अगस्त': 7,
    'september': 8, 'sep': 8, 'sept': 8, 'सितंबर': 8,
    'october': 9, 'oct': 9, 'अक्टूबर': 9,
    'november': 10, 'nov': 10, 'नवंबर': 10,
    'december': 11, 'dec': 11, 'दिसंबर': 11,
  };
  
  const datePatterns = [
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s*(\d{4})?/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2}),?\s*(\d{4})?/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let day: number, month: number, year: number;
        
        if (pattern === datePatterns[0]) {
          day = parseInt(match[1]);
          month = months[match[2].toLowerCase()];
          year = match[3] ? parseInt(match[3]) : now.getFullYear();
        } else if (pattern === datePatterns[1]) {
          month = months[match[1].toLowerCase()];
          day = parseInt(match[2]);
          year = match[3] ? parseInt(match[3]) : now.getFullYear();
        } else {
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
        }
        
        if (month !== undefined && day >= 1 && day <= 31) {
          const d = new Date(year, month, day);
          return { date: d, original: input, parsed: formatDateHuman(d), confidence: 0.9 };
        }
      } catch (e) { /* continue */ }
    }
  }
  
  // Fallback: today
  return { date: now, original: input, parsed: `Today (${formatDateHuman(now)}) [could not parse]`, confidence: 0.5 };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIX 5: CACHE WITH STATE KEY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface CacheEntry {
  data: Festival[];
  timestamp: number;
  expiresAt: number;
}

const festivalCache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

// FIX 5: Include state in cache key
function getCacheKey(countryCode: string, date: string, state?: string): string {
  return `${countryCode}_${state || 'ALL'}_${date}`;
}

function getFromCache(key: string): Festival[] | null {
  const entry = festivalCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    festivalCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: Festival[]): void {
  festivalCache.set(key, { data, timestamp: Date.now(), expiresAt: Date.now() + CACHE_TTL });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FESTIVAL SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class FestivalService {
  private static instance: FestivalService;
  private apiKey: string;
  private baseUrl = 'https://calendarific.com/api/v2/holidays';
  
  private constructor() {
  // Lazy load - will check when actually used
  this.apiKey = '';
  console.log('🎉 [FestivalService] Initialized v3.0 (Lazy Load)');
}

    private getApiKey(): string {
      if (!this.apiKey) {
        this.apiKey = process.env.CALENDARIFIC_API_KEY || '';
        if (this.apiKey) {
          console.log('✅ [FestivalService] API Key loaded!');
        } else {
          console.warn('⚠️ [FestivalService] CALENDARIFIC_API_KEY not set!');
        }
      }
      return this.apiKey;
    }
  
  public static getInstance(): FestivalService {
    if (!FestivalService.instance) {
      FestivalService.instance = new FestivalService();
    }
    return FestivalService.instance;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  async getFestivalsForDate(input: FestivalQueryInput = {}): Promise<FestivalQueryResult> {
    const startTime = Date.now();
    
    // Resolve location first (for timezone)
    const locationInfo = this.resolveLocation(input);
    const countryCode = locationInfo.countryCode;
    const state = locationInfo.state;
    
    // FIX 7: Parse date with country timezone
    const parsedDate = parseNaturalDate(input.date, countryCode);
    const date = parsedDate.date;
    
    console.log(`📅 [FestivalService] Date: "${parsedDate.original}" → ${parsedDate.parsed} (TZ: ${countryCode})`);
    
    const dateStr = formatDateYYYYMMDD(date);
    const dateHuman = formatDateHuman(date);
    const locationStr = locationInfo.locationString;
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 [FestivalService] Festival Query v3.0');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📅 Date: ${dateHuman} (${dateStr})`);
    console.log(`🌍 Country: ${countryCode} (${locationInfo.country})`);
    console.log(`📍 State/Region: ${state || 'All'}`);
    
    // FIX 5: Cache with state
    const cacheKey = getCacheKey(countryCode, dateStr, state);
    const cached = getFromCache(cacheKey);
    
    let allFestivals: Festival[];
    let fromCache = false;
    
    if (cached) {
      console.log('⚡ [FestivalService] Cache HIT!');
      allFestivals = cached;
      fromCache = true;
    } else {
      console.log('🌐 [FestivalService] Calling API...');
      try {
        allFestivals = await this.fetchFromAPI(countryCode, date);
        setCache(cacheKey, allFestivals);
      } catch (error: any) {
        console.error('❌ [FestivalService] API Error:', error.message);
        return {
          success: false, date: dateStr, dateHuman, location: locationStr,
          festivals: [], count: 0, cached: false, source: 'fallback',
          regionFiltered: false, fallbackUsed: false, error: error.message,
        };
      }
    }
    
    // FIX 1 + FIX 9: Region filter with country-specific fallback
    let filtered = allFestivals;
    let regionFiltered = false;
    let fallbackUsed = false;
    let fallbackType: 'all' | 'religious_national' | undefined;
    
    if (state) {
      filtered = this.filterByRegion(allFestivals, state);
      regionFiltered = true;
      
      if (filtered.length === 0 && allFestivals.length > 0) {
        console.log(`⚠️ [FestivalService] Region filter returned 0 - using fallback`);
        
        // FIX 9: Country-specific fallback
        if (countryCode === 'IN') {
          // India: only religious + national
          filtered = allFestivals.filter(f => f.isReligious || f.isNational);
          fallbackType = 'religious_national';
          console.log(`📍 [FestivalService] India fallback: religious + national only (${filtered.length})`);
        } else {
          // Other countries: all festivals
          filtered = allFestivals;
          fallbackType = 'all';
        }
        fallbackUsed = true;
      }
    }
    
    // FIX 3: Primary selection with description fallback
    const primary = this.selectPrimaryFestival(filtered);
    
    const elapsed = Date.now() - startTime;
    
    console.log('');
    console.log(`✅ Festivals: ${filtered.length} | Primary: ${primary?.name || 'None'} | Time: ${elapsed}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return {
      success: true, date: dateStr, dateHuman, location: locationStr,
      festivals: filtered, primaryFestival: primary, count: filtered.length,
      cached: fromCache, source: fromCache ? 'cache' : 'calendarific',
      regionFiltered, fallbackUsed, fallbackType,
    };
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESOLVE LOCATION (FIX 4: City normalization)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  private resolveLocation(input: FestivalQueryInput): {
    countryCode: string;
    country: string;
    state?: string;
    locationString: string;
  } {
    // FIX 4: Normalize city
    if (input.city) {
      const cityNormalized = normalizeCity(input.city);
      const worldCity = WORLD_CITIES[cityNormalized];
      
      if (worldCity) {
        console.log(`🌍 [FestivalService] City: "${input.city}" → ${worldCity.countryCode}`);
        return {
          countryCode: worldCity.countryCode,
          country: worldCity.country,
          state: worldCity.region,
          locationString: `${input.city}, ${worldCity.country}`,
        };
      }
      
      // Indian city check
      const indianState = INDIAN_STATES[cityNormalized];
      if (indianState) {
        return {
          countryCode: 'IN', country: 'India', state: indianState[0],
          locationString: `${input.city}, ${indianState[0]}, India`,
        };
      }
    }
    
    // Country code
    if (input.countryCode && input.countryCode.length === 2) {
      return {
        countryCode: input.countryCode.toUpperCase(),
        country: input.country || input.countryCode,
        state: this.resolveState(input.state, input.city),
        locationString: input.state ? `${input.state}, ${input.country || input.countryCode}` : input.country || input.countryCode,
      };
    }
    
    // Country name
    if (input.country) {
      const code = COUNTRY_CODES[input.country.toLowerCase()];
      if (code) {
        return {
          countryCode: code, country: input.country,
          state: this.resolveState(input.state, input.city),
          locationString: input.state ? `${input.state}, ${input.country}` : input.country,
        };
      }
    }
    
    // State only
    if (input.state) {
      const indianState = INDIAN_STATES[input.state.toLowerCase()];
      if (indianState) {
        return { countryCode: 'IN', country: 'India', state: indianState[0], locationString: `${indianState[0]}, India` };
      }
    }
    
    // Default
    return { countryCode: 'IN', country: 'India', state: undefined, locationString: 'India' };
  }
  
  private resolveState(state?: string, city?: string): string | undefined {
    if (state) {
      const stateLower = state.toLowerCase();
      const mapped = INDIAN_STATES[stateLower];
      return mapped ? mapped[0] : state;
    }
    if (city) {
      const cityNormalized = normalizeCity(city);
      const mapped = INDIAN_STATES[cityNormalized];
      return mapped ? mapped[0] : undefined;
    }
    return undefined;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // API FETCH (FIX 6: State abbreviation expansion)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  private async fetchFromAPI(countryCode: string, date: Date): Promise<Festival[]> {
  const apiKey = this.getApiKey();
  if (!apiKey) throw new Error('CALENDARIFIC_API_KEY not configured');
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const url = `${this.baseUrl}?api_key=${apiKey}&country=${countryCode}&year=${year}&month=${month}&day=${day}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data?.response?.holidays) {
      return response.data.response.holidays.map((h: any) => this.transformHoliday(h, countryCode));
    }
    return [];
  }
  
  private transformHoliday(h: any, countryCode: string): Festival {
    const dateObj = new Date(h.date.iso);
    const types = h.type || [];
    
    // FIX 6: Expand state abbreviations
    let regions: string[] = ['All'];
    if (h.states && h.states !== 'All') {
      regions = (h.states || []).map((s: any) => {
        const name = s.name || s;
        return expandStateAbbreviation(name);
      });
    }
    
    return {
      name: h.name,
      localName: h.name_local || undefined,
      description: h.description || undefined,
      date: h.date.iso,
      dateHuman: formatDateHuman(dateObj),
      type: types,
      isNational: types.includes('National holiday') || types.includes('National'),
      isReligious: types.some((t: string) => ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Religious'].includes(t)),
      regions,
      country: h.country?.name || countryCode,
      countryCode,
      normalizedName: normalizeFestivalName(h.name),
    };
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FILTER BY REGION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  private filterByRegion(festivals: Festival[], state: string): Festival[] {
    const stateLower = state.toLowerCase();
    
    return festivals.filter(f => {
      if (f.isNational) return true;
      if (f.regions?.includes('All')) return true;
      if (f.regions?.some(r => r.toLowerCase().includes(stateLower))) return true;
      if (f.isReligious) return true;
      return false;
    });
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FIX 3: PRIMARY SELECTION with description fallback
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  private selectPrimaryFestival(festivals: Festival[]): Festival | undefined {
    if (festivals.length === 0) return undefined;
    if (festivals.length === 1) return festivals[0];
    
    const majorFestivals = Object.keys(FESTIVAL_SYNONYMS);
    
    // Check major festivals
    for (const festival of festivals) {
      if (majorFestivals.includes(festival.normalizedName)) return festival;
    }
    
    // Prefer religious
    const religious = festivals.find(f => f.isReligious);
    if (religious) return religious;
    
    // Prefer national
    const national = festivals.find(f => f.isNational);
    if (national) return national;
    
    // FIX 3: Description-based fallback
    for (const festival of festivals) {
      if (festival.description?.toLowerCase().includes(festival.normalizedName)) {
        return festival;
      }
    }
    
    return festivals[0];
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FIX 8: SMART SEARCH (month hints)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  async searchFestivalByName(name: string, year?: number, countryCode: string = 'IN'): Promise<Festival | null> {
    const targetYear = year || getDateForCountry(countryCode).getFullYear();
    const normalizedSearch = normalizeFestivalName(name);
    
    console.log(`🔍 [FestivalService] Searching: "${name}" (${normalizedSearch}) in ${targetYear}`);
    
    // FIX 8: Get month hints
    const monthHints = FESTIVAL_MONTHS[normalizedSearch] || Array.from({ length: 12 }, (_, i) => i + 1);
    console.log(`📅 [FestivalService] Searching months: ${monthHints.join(', ')}`);
    
    for (const month of monthHints) {
      const cacheKey = getCacheKey(countryCode, `${targetYear}-${String(month).padStart(2, '0')}`);
      let festivals: Festival[] | null = getFromCache(cacheKey);
      
      if (!festivals) {
        try {
          const url = `${this.baseUrl}?api_key=${this.apiKey}&country=${countryCode}&year=${targetYear}&month=${month}`;
          const response = await axios.get(url, { timeout: 10000 });
          
          if (response.data?.response?.holidays) {
            festivals = response.data.response.holidays.map((h: any) => this.transformHoliday(h, countryCode));
            if (festivals) setCache(cacheKey, festivals);
          }
        } catch (e) { continue; }
      }
      
      if (festivals && festivals.length > 0) {
        // FIX 2: Use enhanced matching
        const match = festivals.find(f => matchesFestival(f, name));
        if (match) {
          console.log(`✅ [FestivalService] Found: ${match.name} on ${match.dateHuman}`);
          return match;
        }
      }
    }
    
    console.log(`❌ [FestivalService] Not found: ${name}`);
    return null;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FORMAT FOR CONTEXT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  formatForContext(result: FestivalQueryResult): string {
    if (!result.success || result.count === 0) {
      return `[FESTIVAL] No festival on ${result.dateHuman} in ${result.location} [/FESTIVAL]`;
    }
    
    const p = result.primaryFestival;
    if (!p) return '';
    
    let ctx = `[FESTIVAL] ${result.dateHuman} is ${p.name}`;
    if (p.type.length) ctx += ` (${p.type.join(', ')})`;
    if (p.description) ctx += `. ${p.description.slice(0, 150)}`;
    ctx += ` in ${result.location}`;
    
    if (result.count > 1) {
      const others = result.festivals.filter(f => f.name !== p.name).map(f => f.name).slice(0, 2).join(', ');
      if (others) ctx += `. Also: ${others}`;
    }
    
    return ctx + ' [/FESTIVAL]';
  }
  
  async isTodayFestival(location?: string): Promise<{ isFestival: boolean; festival?: Festival; allFestivals: Festival[] }> {
    const result = await this.getFestivalsForDate({ city: location });
    return { isFestival: result.count > 0, festival: result.primaryFestival, allFestivals: result.festivals };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const festivalService = FestivalService.getInstance();

export async function getTodaysFestivals(location?: string): Promise<FestivalQueryResult> {
  let city, state, country;
  if (location) {
    const parts = location.split(',').map(p => p.trim());
    if (parts.length >= 1) city = parts[0];
    if (parts.length >= 2) state = parts[1];
    if (parts.length >= 3) country = parts[2];
  }
  return festivalService.getFestivalsForDate({ city, state, country });
}

export async function getFestivalsForDate(dateInput: string | Date, location?: string): Promise<FestivalQueryResult> {
  let city, state, country;
  if (location) {
    const parts = location.split(',').map(p => p.trim());
    if (parts.length >= 1) city = parts[0];
    if (parts.length >= 2) state = parts[1];
    if (parts.length >= 3) country = parts[2];
  }
  return festivalService.getFestivalsForDate({ date: dateInput, city, state, country });
}

export async function isTodayFestival(location?: string): Promise<boolean> {
  return (await festivalService.isTodayFestival(location)).isFestival;
}

export async function getFestivalContext(location?: string): Promise<string> {
  return festivalService.formatForContext(await getTodaysFestivals(location));
}

