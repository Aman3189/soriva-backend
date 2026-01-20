// ═══════════════════════════════════════════════════════════════════════════
// File: src/services/local-pulse/location.helper.ts
// Soriva Local Pulse™ - International Location Helper
// City → State → Country mapping for global support
// ═══════════════════════════════════════════════════════════════════════════

import { CountryCode, CountryInfo, SorivaRegion } from '../../types/local-pulse.types';

// ═══════════════════════════════════════════════════════════════════════════
// COUNTRY DATABASE
// ═══════════════════════════════════════════════════════════════════════════

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  // South Asia
  IN: { code: 'IN', name: 'India', region: 'IN', timezone: 'Asia/Kolkata', newsLang: 'en-IN', newsCeid: 'IN:en', currency: 'INR' },
  PK: { code: 'PK', name: 'Pakistan', region: 'INTL', timezone: 'Asia/Karachi', newsLang: 'en-PK', newsCeid: 'PK:en', currency: 'PKR' },
  BD: { code: 'BD', name: 'Bangladesh', region: 'INTL', timezone: 'Asia/Dhaka', newsLang: 'en-BD', newsCeid: 'BD:en', currency: 'BDT' },
  LK: { code: 'LK', name: 'Sri Lanka', region: 'INTL', timezone: 'Asia/Colombo', newsLang: 'en-LK', newsCeid: 'LK:en', currency: 'LKR' },
  NP: { code: 'NP', name: 'Nepal', region: 'INTL', timezone: 'Asia/Kathmandu', newsLang: 'en-NP', newsCeid: 'NP:en', currency: 'NPR' },

  // North America
  US: { code: 'US', name: 'United States', region: 'INTL', timezone: 'America/New_York', newsLang: 'en-US', newsCeid: 'US:en', currency: 'USD' },
  CA: { code: 'CA', name: 'Canada', region: 'INTL', timezone: 'America/Toronto', newsLang: 'en-CA', newsCeid: 'CA:en', currency: 'CAD' },
  MX: { code: 'MX', name: 'Mexico', region: 'INTL', timezone: 'America/Mexico_City', newsLang: 'es-MX', newsCeid: 'MX:es', currency: 'MXN' },

  // Europe
  GB: { code: 'GB', name: 'United Kingdom', region: 'INTL', timezone: 'Europe/London', newsLang: 'en-GB', newsCeid: 'GB:en', currency: 'GBP' },
  DE: { code: 'DE', name: 'Germany', region: 'INTL', timezone: 'Europe/Berlin', newsLang: 'de', newsCeid: 'DE:de', currency: 'EUR' },
  FR: { code: 'FR', name: 'France', region: 'INTL', timezone: 'Europe/Paris', newsLang: 'fr', newsCeid: 'FR:fr', currency: 'EUR' },
  IT: { code: 'IT', name: 'Italy', region: 'INTL', timezone: 'Europe/Rome', newsLang: 'it', newsCeid: 'IT:it', currency: 'EUR' },
  ES: { code: 'ES', name: 'Spain', region: 'INTL', timezone: 'Europe/Madrid', newsLang: 'es', newsCeid: 'ES:es', currency: 'EUR' },
  NL: { code: 'NL', name: 'Netherlands', region: 'INTL', timezone: 'Europe/Amsterdam', newsLang: 'nl', newsCeid: 'NL:nl', currency: 'EUR' },
  CH: { code: 'CH', name: 'Switzerland', region: 'INTL', timezone: 'Europe/Zurich', newsLang: 'de-CH', newsCeid: 'CH:de', currency: 'CHF' },
  SE: { code: 'SE', name: 'Sweden', region: 'INTL', timezone: 'Europe/Stockholm', newsLang: 'sv', newsCeid: 'SE:sv', currency: 'SEK' },
  NO: { code: 'NO', name: 'Norway', region: 'INTL', timezone: 'Europe/Oslo', newsLang: 'no', newsCeid: 'NO:no', currency: 'NOK' },
  DK: { code: 'DK', name: 'Denmark', region: 'INTL', timezone: 'Europe/Copenhagen', newsLang: 'da', newsCeid: 'DK:da', currency: 'DKK' },
  FI: { code: 'FI', name: 'Finland', region: 'INTL', timezone: 'Europe/Helsinki', newsLang: 'fi', newsCeid: 'FI:fi', currency: 'EUR' },
  IE: { code: 'IE', name: 'Ireland', region: 'INTL', timezone: 'Europe/Dublin', newsLang: 'en-IE', newsCeid: 'IE:en', currency: 'EUR' },
  PL: { code: 'PL', name: 'Poland', region: 'INTL', timezone: 'Europe/Warsaw', newsLang: 'pl', newsCeid: 'PL:pl', currency: 'PLN' },
  AT: { code: 'AT', name: 'Austria', region: 'INTL', timezone: 'Europe/Vienna', newsLang: 'de-AT', newsCeid: 'AT:de', currency: 'EUR' },
  BE: { code: 'BE', name: 'Belgium', region: 'INTL', timezone: 'Europe/Brussels', newsLang: 'nl-BE', newsCeid: 'BE:nl', currency: 'EUR' },
  PT: { code: 'PT', name: 'Portugal', region: 'INTL', timezone: 'Europe/Lisbon', newsLang: 'pt-PT', newsCeid: 'PT:pt', currency: 'EUR' },
  GR: { code: 'GR', name: 'Greece', region: 'INTL', timezone: 'Europe/Athens', newsLang: 'el', newsCeid: 'GR:el', currency: 'EUR' },
  CZ: { code: 'CZ', name: 'Czech Republic', region: 'INTL', timezone: 'Europe/Prague', newsLang: 'cs', newsCeid: 'CZ:cs', currency: 'CZK' },
  HU: { code: 'HU', name: 'Hungary', region: 'INTL', timezone: 'Europe/Budapest', newsLang: 'hu', newsCeid: 'HU:hu', currency: 'HUF' },
  RO: { code: 'RO', name: 'Romania', region: 'INTL', timezone: 'Europe/Bucharest', newsLang: 'ro', newsCeid: 'RO:ro', currency: 'RON' },

  // Middle East
  AE: { code: 'AE', name: 'United Arab Emirates', region: 'INTL', timezone: 'Asia/Dubai', newsLang: 'en-AE', newsCeid: 'AE:en', currency: 'AED' },
  SA: { code: 'SA', name: 'Saudi Arabia', region: 'INTL', timezone: 'Asia/Riyadh', newsLang: 'ar-SA', newsCeid: 'SA:ar', currency: 'SAR' },
  QA: { code: 'QA', name: 'Qatar', region: 'INTL', timezone: 'Asia/Qatar', newsLang: 'en-QA', newsCeid: 'QA:en', currency: 'QAR' },
  KW: { code: 'KW', name: 'Kuwait', region: 'INTL', timezone: 'Asia/Kuwait', newsLang: 'en-KW', newsCeid: 'KW:en', currency: 'KWD' },
  OM: { code: 'OM', name: 'Oman', region: 'INTL', timezone: 'Asia/Muscat', newsLang: 'en-OM', newsCeid: 'OM:en', currency: 'OMR' },
  BH: { code: 'BH', name: 'Bahrain', region: 'INTL', timezone: 'Asia/Bahrain', newsLang: 'en-BH', newsCeid: 'BH:en', currency: 'BHD' },
  IL: { code: 'IL', name: 'Israel', region: 'INTL', timezone: 'Asia/Jerusalem', newsLang: 'he', newsCeid: 'IL:he', currency: 'ILS' },

  // Asia Pacific
  AU: { code: 'AU', name: 'Australia', region: 'INTL', timezone: 'Australia/Sydney', newsLang: 'en-AU', newsCeid: 'AU:en', currency: 'AUD' },
  NZ: { code: 'NZ', name: 'New Zealand', region: 'INTL', timezone: 'Pacific/Auckland', newsLang: 'en-NZ', newsCeid: 'NZ:en', currency: 'NZD' },
  SG: { code: 'SG', name: 'Singapore', region: 'INTL', timezone: 'Asia/Singapore', newsLang: 'en-SG', newsCeid: 'SG:en', currency: 'SGD' },
  JP: { code: 'JP', name: 'Japan', region: 'INTL', timezone: 'Asia/Tokyo', newsLang: 'ja', newsCeid: 'JP:ja', currency: 'JPY' },
  CN: { code: 'CN', name: 'China', region: 'INTL', timezone: 'Asia/Shanghai', newsLang: 'zh-CN', newsCeid: 'CN:zh-Hans', currency: 'CNY' },
  HK: { code: 'HK', name: 'Hong Kong', region: 'INTL', timezone: 'Asia/Hong_Kong', newsLang: 'zh-HK', newsCeid: 'HK:zh-Hant', currency: 'HKD' },
  TW: { code: 'TW', name: 'Taiwan', region: 'INTL', timezone: 'Asia/Taipei', newsLang: 'zh-TW', newsCeid: 'TW:zh-Hant', currency: 'TWD' },
  KR: { code: 'KR', name: 'South Korea', region: 'INTL', timezone: 'Asia/Seoul', newsLang: 'ko', newsCeid: 'KR:ko', currency: 'KRW' },
  TH: { code: 'TH', name: 'Thailand', region: 'INTL', timezone: 'Asia/Bangkok', newsLang: 'th', newsCeid: 'TH:th', currency: 'THB' },
  MY: { code: 'MY', name: 'Malaysia', region: 'INTL', timezone: 'Asia/Kuala_Lumpur', newsLang: 'en-MY', newsCeid: 'MY:en', currency: 'MYR' },
  ID: { code: 'ID', name: 'Indonesia', region: 'INTL', timezone: 'Asia/Jakarta', newsLang: 'id', newsCeid: 'ID:id', currency: 'IDR' },
  PH: { code: 'PH', name: 'Philippines', region: 'INTL', timezone: 'Asia/Manila', newsLang: 'en-PH', newsCeid: 'PH:en', currency: 'PHP' },
  VN: { code: 'VN', name: 'Vietnam', region: 'INTL', timezone: 'Asia/Ho_Chi_Minh', newsLang: 'vi', newsCeid: 'VN:vi', currency: 'VND' },

  // South America
  BR: { code: 'BR', name: 'Brazil', region: 'INTL', timezone: 'America/Sao_Paulo', newsLang: 'pt-BR', newsCeid: 'BR:pt-419', currency: 'BRL' },

  // Africa
  ZA: { code: 'ZA', name: 'South Africa', region: 'INTL', timezone: 'Africa/Johannesburg', newsLang: 'en-ZA', newsCeid: 'ZA:en', currency: 'ZAR' },

  // Default/Other
  OTHER: { code: 'OTHER', name: 'Other', region: 'INTL', timezone: 'UTC', newsLang: 'en', newsCeid: 'US:en', currency: 'USD' },
};

// ═══════════════════════════════════════════════════════════════════════════
// CITY → LOCATION DATABASE (International)
// Format: city_lowercase → { state, country }
// ═══════════════════════════════════════════════════════════════════════════

interface CityMapping {
  state: string;
  country: CountryCode;
}

export const CITY_DATABASE: Record<string, CityMapping> = {
  // ═══════════════════════════════════════════════════════════════════════
  // INDIA 🇮🇳
  // ═══════════════════════════════════════════════════════════════════════
  
  // Punjab
  ferozepur: { state: 'Punjab', country: 'IN' },
  ludhiana: { state: 'Punjab', country: 'IN' },
  amritsar: { state: 'Punjab', country: 'IN' },
  jalandhar: { state: 'Punjab', country: 'IN' },
  patiala: { state: 'Punjab', country: 'IN' },
  bathinda: { state: 'Punjab', country: 'IN' },
  mohali: { state: 'Punjab', country: 'IN' },
  
  // Delhi NCR
  delhi: { state: 'Delhi', country: 'IN' },
  'new delhi': { state: 'Delhi', country: 'IN' },
  noida: { state: 'Uttar Pradesh', country: 'IN' },
  gurgaon: { state: 'Haryana', country: 'IN' },
  gurugram: { state: 'Haryana', country: 'IN' },
  faridabad: { state: 'Haryana', country: 'IN' },
  ghaziabad: { state: 'Uttar Pradesh', country: 'IN' },
  
  // Maharashtra
  mumbai: { state: 'Maharashtra', country: 'IN' },
  pune: { state: 'Maharashtra', country: 'IN' },
  nagpur: { state: 'Maharashtra', country: 'IN' },
  thane: { state: 'Maharashtra', country: 'IN' },
  
  // Karnataka
  bangalore: { state: 'Karnataka', country: 'IN' },
  bengaluru: { state: 'Karnataka', country: 'IN' },
  mysore: { state: 'Karnataka', country: 'IN' },
  mysuru: { state: 'Karnataka', country: 'IN' },
  
  // Tamil Nadu
  chennai: { state: 'Tamil Nadu', country: 'IN' },
  coimbatore: { state: 'Tamil Nadu', country: 'IN' },
  madurai: { state: 'Tamil Nadu', country: 'IN' },
  
  // Telangana & Andhra
  hyderabad: { state: 'Telangana', country: 'IN' },
  secunderabad: { state: 'Telangana', country: 'IN' },
  visakhapatnam: { state: 'Andhra Pradesh', country: 'IN' },
  vijayawada: { state: 'Andhra Pradesh', country: 'IN' },
  
  // West Bengal
  kolkata: { state: 'West Bengal', country: 'IN' },
  howrah: { state: 'West Bengal', country: 'IN' },
  
  // Gujarat
  ahmedabad: { state: 'Gujarat', country: 'IN' },
  surat: { state: 'Gujarat', country: 'IN' },
  vadodara: { state: 'Gujarat', country: 'IN' },
  rajkot: { state: 'Gujarat', country: 'IN' },
  
  // Rajasthan
  jaipur: { state: 'Rajasthan', country: 'IN' },
  jodhpur: { state: 'Rajasthan', country: 'IN' },
  udaipur: { state: 'Rajasthan', country: 'IN' },
  kota: { state: 'Rajasthan', country: 'IN' },
  
  // Uttar Pradesh
  lucknow: { state: 'Uttar Pradesh', country: 'IN' },
  kanpur: { state: 'Uttar Pradesh', country: 'IN' },
  varanasi: { state: 'Uttar Pradesh', country: 'IN' },
  agra: { state: 'Uttar Pradesh', country: 'IN' },
  prayagraj: { state: 'Uttar Pradesh', country: 'IN' },
  
  // Kerala
  kochi: { state: 'Kerala', country: 'IN' },
  cochin: { state: 'Kerala', country: 'IN' },
  thiruvananthapuram: { state: 'Kerala', country: 'IN' },
  kozhikode: { state: 'Kerala', country: 'IN' },
  
  // Others
  chandigarh: { state: 'Chandigarh', country: 'IN' },
  bhopal: { state: 'Madhya Pradesh', country: 'IN' },
  indore: { state: 'Madhya Pradesh', country: 'IN' },
  patna: { state: 'Bihar', country: 'IN' },
  ranchi: { state: 'Jharkhand', country: 'IN' },
  bhubaneswar: { state: 'Odisha', country: 'IN' },
  guwahati: { state: 'Assam', country: 'IN' },
  shimla: { state: 'Himachal Pradesh', country: 'IN' },
  dehradun: { state: 'Uttarakhand', country: 'IN' },
  srinagar: { state: 'Jammu & Kashmir', country: 'IN' },
  jammu: { state: 'Jammu & Kashmir', country: 'IN' },
  goa: { state: 'Goa', country: 'IN' },
  panaji: { state: 'Goa', country: 'IN' },

  // ═══════════════════════════════════════════════════════════════════════
  // UNITED STATES 🇺🇸
  // ═══════════════════════════════════════════════════════════════════════
  
  'new york': { state: 'New York', country: 'US' },
  'new york city': { state: 'New York', country: 'US' },
  nyc: { state: 'New York', country: 'US' },
  manhattan: { state: 'New York', country: 'US' },
  brooklyn: { state: 'New York', country: 'US' },
  'los angeles': { state: 'California', country: 'US' },
  la: { state: 'California', country: 'US' },
  'san francisco': { state: 'California', country: 'US' },
  'san jose': { state: 'California', country: 'US' },
  'san diego': { state: 'California', country: 'US' },
  chicago: { state: 'Illinois', country: 'US' },
  houston: { state: 'Texas', country: 'US' },
  dallas: { state: 'Texas', country: 'US' },
  austin: { state: 'Texas', country: 'US' },
  'san antonio': { state: 'Texas', country: 'US' },
  phoenix: { state: 'Arizona', country: 'US' },
  philadelphia: { state: 'Pennsylvania', country: 'US' },
  seattle: { state: 'Washington', country: 'US' },
  denver: { state: 'Colorado', country: 'US' },
  boston: { state: 'Massachusetts', country: 'US' },
  miami: { state: 'Florida', country: 'US' },
  atlanta: { state: 'Georgia', country: 'US' },
  'washington dc': { state: 'District of Columbia', country: 'US' },
  washington: { state: 'District of Columbia', country: 'US' },
  'las vegas': { state: 'Nevada', country: 'US' },
  detroit: { state: 'Michigan', country: 'US' },
  minneapolis: { state: 'Minnesota', country: 'US' },
  portland: { state: 'Oregon', country: 'US' },
  nashville: { state: 'Tennessee', country: 'US' },
  'salt lake city': { state: 'Utah', country: 'US' },
  raleigh: { state: 'North Carolina', country: 'US' },
  charlotte: { state: 'North Carolina', country: 'US' },

  // ═══════════════════════════════════════════════════════════════════════
  // UNITED KINGDOM 🇬🇧
  // ═══════════════════════════════════════════════════════════════════════
  
  london: { state: 'England', country: 'GB' },
  manchester: { state: 'England', country: 'GB' },
  birmingham: { state: 'England', country: 'GB' },
  leeds: { state: 'England', country: 'GB' },
  liverpool: { state: 'England', country: 'GB' },
  bristol: { state: 'England', country: 'GB' },
  sheffield: { state: 'England', country: 'GB' },
  newcastle: { state: 'England', country: 'GB' },
  nottingham: { state: 'England', country: 'GB' },
  cambridge: { state: 'England', country: 'GB' },
  oxford: { state: 'England', country: 'GB' },
  edinburgh: { state: 'Scotland', country: 'GB' },
  glasgow: { state: 'Scotland', country: 'GB' },
  cardiff: { state: 'Wales', country: 'GB' },
  belfast: { state: 'Northern Ireland', country: 'GB' },

  // ═══════════════════════════════════════════════════════════════════════
  // CANADA 🇨🇦
  // ═══════════════════════════════════════════════════════════════════════
  
  toronto: { state: 'Ontario', country: 'CA' },
  vancouver: { state: 'British Columbia', country: 'CA' },
  montreal: { state: 'Quebec', country: 'CA' },
  calgary: { state: 'Alberta', country: 'CA' },
  edmonton: { state: 'Alberta', country: 'CA' },
  ottawa: { state: 'Ontario', country: 'CA' },
  winnipeg: { state: 'Manitoba', country: 'CA' },
  quebec: { state: 'Quebec', country: 'CA' },
  'quebec city': { state: 'Quebec', country: 'CA' },
  hamilton: { state: 'Ontario', country: 'CA' },

  // ═══════════════════════════════════════════════════════════════════════
  // AUSTRALIA 🇦🇺
  // ═══════════════════════════════════════════════════════════════════════
  
  sydney: { state: 'New South Wales', country: 'AU' },
  melbourne: { state: 'Victoria', country: 'AU' },
  brisbane: { state: 'Queensland', country: 'AU' },
  perth: { state: 'Western Australia', country: 'AU' },
  adelaide: { state: 'South Australia', country: 'AU' },
  canberra: { state: 'Australian Capital Territory', country: 'AU' },
  hobart: { state: 'Tasmania', country: 'AU' },
  darwin: { state: 'Northern Territory', country: 'AU' },
  'gold coast': { state: 'Queensland', country: 'AU' },

  // ═══════════════════════════════════════════════════════════════════════
  // UAE & MIDDLE EAST 🇦🇪
  // ═══════════════════════════════════════════════════════════════════════
  
  dubai: { state: 'Dubai', country: 'AE' },
  'abu dhabi': { state: 'Abu Dhabi', country: 'AE' },
  sharjah: { state: 'Sharjah', country: 'AE' },
  ajman: { state: 'Ajman', country: 'AE' },
  riyadh: { state: 'Riyadh', country: 'SA' },
  jeddah: { state: 'Makkah', country: 'SA' },
  mecca: { state: 'Makkah', country: 'SA' },
  medina: { state: 'Madinah', country: 'SA' },
  doha: { state: 'Doha', country: 'QA' },
  kuwait: { state: 'Kuwait City', country: 'KW' },
  'kuwait city': { state: 'Kuwait City', country: 'KW' },
  muscat: { state: 'Muscat', country: 'OM' },
  manama: { state: 'Capital', country: 'BH' },
  'tel aviv': { state: 'Tel Aviv', country: 'IL' },
  jerusalem: { state: 'Jerusalem', country: 'IL' },

  // ═══════════════════════════════════════════════════════════════════════
  // SINGAPORE 🇸🇬
  // ═══════════════════════════════════════════════════════════════════════
  
  singapore: { state: 'Singapore', country: 'SG' },

  // ═══════════════════════════════════════════════════════════════════════
  // EUROPE 🇪🇺
  // ═══════════════════════════════════════════════════════════════════════
  
  // Germany
  berlin: { state: 'Berlin', country: 'DE' },
  munich: { state: 'Bavaria', country: 'DE' },
  frankfurt: { state: 'Hesse', country: 'DE' },
  hamburg: { state: 'Hamburg', country: 'DE' },
  cologne: { state: 'North Rhine-Westphalia', country: 'DE' },
  
  // France
  paris: { state: 'Île-de-France', country: 'FR' },
  lyon: { state: 'Auvergne-Rhône-Alpes', country: 'FR' },
  marseille: { state: 'Provence-Alpes-Côte d\'Azur', country: 'FR' },
  nice: { state: 'Provence-Alpes-Côte d\'Azur', country: 'FR' },
  
  // Italy
  rome: { state: 'Lazio', country: 'IT' },
  milan: { state: 'Lombardy', country: 'IT' },
  naples: { state: 'Campania', country: 'IT' },
  florence: { state: 'Tuscany', country: 'IT' },
  venice: { state: 'Veneto', country: 'IT' },
  
  // Spain
  madrid: { state: 'Community of Madrid', country: 'ES' },
  barcelona: { state: 'Catalonia', country: 'ES' },
  valencia: { state: 'Valencian Community', country: 'ES' },
  seville: { state: 'Andalusia', country: 'ES' },
  
  // Netherlands
  amsterdam: { state: 'North Holland', country: 'NL' },
  rotterdam: { state: 'South Holland', country: 'NL' },
  'the hague': { state: 'South Holland', country: 'NL' },
  
  // Switzerland
  zurich: { state: 'Zürich', country: 'CH' },
  geneva: { state: 'Geneva', country: 'CH' },
  bern: { state: 'Bern', country: 'CH' },
  
  // Others
  dublin: { state: 'Leinster', country: 'IE' },
  vienna: { state: 'Vienna', country: 'AT' },
  brussels: { state: 'Brussels', country: 'BE' },
  lisbon: { state: 'Lisbon', country: 'PT' },
  athens: { state: 'Attica', country: 'GR' },
  prague: { state: 'Prague', country: 'CZ' },
  budapest: { state: 'Budapest', country: 'HU' },
  warsaw: { state: 'Masovian', country: 'PL' },
  stockholm: { state: 'Stockholm', country: 'SE' },
  oslo: { state: 'Oslo', country: 'NO' },
  copenhagen: { state: 'Capital Region', country: 'DK' },
  helsinki: { state: 'Uusimaa', country: 'FI' },

  // ═══════════════════════════════════════════════════════════════════════
  // ASIA PACIFIC 🌏
  // ═══════════════════════════════════════════════════════════════════════
  
  // Japan
  tokyo: { state: 'Tokyo', country: 'JP' },
  osaka: { state: 'Osaka', country: 'JP' },
  kyoto: { state: 'Kyoto', country: 'JP' },
  yokohama: { state: 'Kanagawa', country: 'JP' },
  
  // China
  beijing: { state: 'Beijing', country: 'CN' },
  shanghai: { state: 'Shanghai', country: 'CN' },
  guangzhou: { state: 'Guangdong', country: 'CN' },
  shenzhen: { state: 'Guangdong', country: 'CN' },
  
  // Hong Kong & Taiwan
  'hong kong': { state: 'Hong Kong', country: 'HK' },
  taipei: { state: 'Taipei', country: 'TW' },
  
  // South Korea
  seoul: { state: 'Seoul', country: 'KR' },
  busan: { state: 'Busan', country: 'KR' },
  
  // Southeast Asia
  bangkok: { state: 'Bangkok', country: 'TH' },
  'kuala lumpur': { state: 'Kuala Lumpur', country: 'MY' },
  jakarta: { state: 'Jakarta', country: 'ID' },
  manila: { state: 'Metro Manila', country: 'PH' },
  'ho chi minh': { state: 'Ho Chi Minh City', country: 'VN' },
  hanoi: { state: 'Hanoi', country: 'VN' },
  
  // New Zealand
  auckland: { state: 'Auckland', country: 'NZ' },
  wellington: { state: 'Wellington', country: 'NZ' },
  christchurch: { state: 'Canterbury', country: 'NZ' },

  // ═══════════════════════════════════════════════════════════════════════
  // SOUTH ASIA (Non-India) 🌏
  // ═══════════════════════════════════════════════════════════════════════
  
  karachi: { state: 'Sindh', country: 'PK' },
  lahore: { state: 'Punjab', country: 'PK' },
  islamabad: { state: 'Islamabad', country: 'PK' },
  dhaka: { state: 'Dhaka', country: 'BD' },
  colombo: { state: 'Western', country: 'LK' },
  kathmandu: { state: 'Bagmati', country: 'NP' },

  // ═══════════════════════════════════════════════════════════════════════
  // SOUTH AMERICA & AFRICA 🌍
  // ═══════════════════════════════════════════════════════════════════════
  
  'sao paulo': { state: 'São Paulo', country: 'BR' },
  'rio de janeiro': { state: 'Rio de Janeiro', country: 'BR' },
  'mexico city': { state: 'Mexico City', country: 'MX' },
  johannesburg: { state: 'Gauteng', country: 'ZA' },
  'cape town': { state: 'Western Cape', country: 'ZA' },
  durban: { state: 'KwaZulu-Natal', country: 'ZA' },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get location info from city name
 */
export function getCityInfo(city: string): CityMapping | null {
  const cityLower = city.toLowerCase().trim();
  return CITY_DATABASE[cityLower] || null;
}

/**
 * Get country info from country code
 */
export function getCountryInfo(code: CountryCode): CountryInfo {
  return COUNTRIES[code] || COUNTRIES.OTHER;
}

/**
 * Get state from city (backwards compatible)
 */
export function getStateFromCity(city: string): string {
  const info = getCityInfo(city);
  return info?.state || '';
}

/**
 * Get country from city
 */
export function getCountryFromCity(city: string): CountryCode {
  const info = getCityInfo(city);
  return info?.country || 'OTHER';
}

/**
 * Get Soriva region from city
 */
export function getRegionFromCity(city: string): SorivaRegion {
  const country = getCountryFromCity(city);
  return COUNTRIES[country]?.region || 'INTL';
}

/**
 * Format full location string
 */
export function formatFullLocation(city: string, state: string, countryCode: CountryCode): string {
  const countryInfo = getCountryInfo(countryCode);
  
  if (countryCode === 'IN') {
    // For India: "Ferozepur, Punjab"
    return state ? `${city}, ${state}` : city;
  }
  
  if (countryCode === 'US') {
    // For US: "New York, NY, USA"
    return state ? `${city}, ${state}, USA` : `${city}, USA`;
  }
  
  // For others: "London, England, UK"
  if (state) {
    return `${city}, ${state}, ${countryInfo.name}`;
  }
  return `${city}, ${countryInfo.name}`;
}

/**
 * Get news configuration for a country
 */
export function getNewsConfig(countryCode: CountryCode): { lang: string; ceid: string; gl: string } {
  const info = getCountryInfo(countryCode);
  return {
    lang: info.newsLang,
    ceid: info.newsCeid,
    gl: countryCode === 'OTHER' ? 'US' : countryCode,
  };
}

/**
 * Capitalize city name properly
 */
export function capitalizeCity(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}