/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ASTROLOGY ENGINE v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Using Swiss Ephemeris (sweph) - NASA-level accuracy
 * Lahiri Ayanamsa for Vedic calculations
 * 
 * Created by: Amandeep, Punjab, India
 * Created: February 2026
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { 
  julday, 
  calc_ut, 
  houses, 
  set_sid_mode, 
  get_ayanamsa_ut, 
  constants 
} from 'sweph';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BirthDetails {
  date: string;       // Format: 'YYYY-MM-DD'
  time: string;       // Format: 'HH:MM' (24hr)
  latitude: number;
  longitude: number;
  timezone: number;   // UTC offset in hours, e.g., 5.5 for IST
}

// Rashi (Moon Sign) mapping
const RASHI_NAMES = [
  { index: 1, english: 'Aries', hindi: 'मेष', hinglish: 'Mesh', lord: 'Mars' },
  { index: 2, english: 'Taurus', hindi: 'वृषभ', hinglish: 'Vrishabh', lord: 'Venus' },
  { index: 3, english: 'Gemini', hindi: 'मिथुन', hinglish: 'Mithun', lord: 'Mercury' },
  { index: 4, english: 'Cancer', hindi: 'कर्क', hinglish: 'Kark', lord: 'Moon' },
  { index: 5, english: 'Leo', hindi: 'सिंह', hinglish: 'Simha', lord: 'Sun' },
  { index: 6, english: 'Virgo', hindi: 'कन्या', hinglish: 'Kanya', lord: 'Mercury' },
  { index: 7, english: 'Libra', hindi: 'तुला', hinglish: 'Tula', lord: 'Venus' },
  { index: 8, english: 'Scorpio', hindi: 'वृश्चिक', hinglish: 'Vrishchik', lord: 'Mars' },
  { index: 9, english: 'Sagittarius', hindi: 'धनु', hinglish: 'Dhanu', lord: 'Jupiter' },
  { index: 10, english: 'Capricorn', hindi: 'मकर', hinglish: 'Makar', lord: 'Saturn' },
  { index: 11, english: 'Aquarius', hindi: 'कुंभ', hinglish: 'Kumbh', lord: 'Saturn' },
  { index: 12, english: 'Pisces', hindi: 'मीन', hinglish: 'Meen', lord: 'Jupiter' },
];

// 27 Nakshatras with their lords
const NAKSHATRA_NAMES = [
  { index: 1, english: 'Ashwini', hindi: 'अश्विनी', lord: 'Ketu', deity: 'Ashwini Kumaras' },
  { index: 2, english: 'Bharani', hindi: 'भरणी', lord: 'Venus', deity: 'Yama' },
  { index: 3, english: 'Krittika', hindi: 'कृत्तिका', lord: 'Sun', deity: 'Agni' },
  { index: 4, english: 'Rohini', hindi: 'रोहिणी', lord: 'Moon', deity: 'Brahma' },
  { index: 5, english: 'Mrigashira', hindi: 'मृगशिरा', lord: 'Mars', deity: 'Soma' },
  { index: 6, english: 'Ardra', hindi: 'आर्द्रा', lord: 'Rahu', deity: 'Rudra' },
  { index: 7, english: 'Punarvasu', hindi: 'पुनर्वसु', lord: 'Jupiter', deity: 'Aditi' },
  { index: 8, english: 'Pushya', hindi: 'पुष्य', lord: 'Saturn', deity: 'Brihaspati' },
  { index: 9, english: 'Ashlesha', hindi: 'आश्लेषा', lord: 'Mercury', deity: 'Nagas' },
  { index: 10, english: 'Magha', hindi: 'मघा', lord: 'Ketu', deity: 'Pitris' },
  { index: 11, english: 'Purva Phalguni', hindi: 'पूर्व फाल्गुनी', lord: 'Venus', deity: 'Bhaga' },
  { index: 12, english: 'Uttara Phalguni', hindi: 'उत्तर फाल्गुनी', lord: 'Sun', deity: 'Aryaman' },
  { index: 13, english: 'Hasta', hindi: 'हस्त', lord: 'Moon', deity: 'Savitar' },
  { index: 14, english: 'Chitra', hindi: 'चित्रा', lord: 'Mars', deity: 'Vishwakarma' },
  { index: 15, english: 'Swati', hindi: 'स्वाति', lord: 'Rahu', deity: 'Vayu' },
  { index: 16, english: 'Vishakha', hindi: 'विशाखा', lord: 'Jupiter', deity: 'Indra-Agni' },
  { index: 17, english: 'Anuradha', hindi: 'अनुराधा', lord: 'Saturn', deity: 'Mitra' },
  { index: 18, english: 'Jyeshtha', hindi: 'ज्येष्ठा', lord: 'Mercury', deity: 'Indra' },
  { index: 19, english: 'Mula', hindi: 'मूल', lord: 'Ketu', deity: 'Nirriti' },
  { index: 20, english: 'Purva Ashadha', hindi: 'पूर्वाषाढ़ा', lord: 'Venus', deity: 'Apas' },
  { index: 21, english: 'Uttara Ashadha', hindi: 'उत्तराषाढ़ा', lord: 'Sun', deity: 'Vishvedevas' },
  { index: 22, english: 'Shravana', hindi: 'श्रवण', lord: 'Moon', deity: 'Vishnu' },
  { index: 23, english: 'Dhanishta', hindi: 'धनिष्ठा', lord: 'Mars', deity: 'Vasus' },
  { index: 24, english: 'Shatabhisha', hindi: 'शतभिषा', lord: 'Rahu', deity: 'Varuna' },
  { index: 25, english: 'Purva Bhadrapada', hindi: 'पूर्व भाद्रपद', lord: 'Jupiter', deity: 'Ajaikapada' },
  { index: 26, english: 'Uttara Bhadrapada', hindi: 'उत्तर भाद्रपद', lord: 'Saturn', deity: 'Ahirbudhnya' },
  { index: 27, english: 'Revati', hindi: 'रेवती', lord: 'Mercury', deity: 'Pushan' },
];

// Mahadasha periods (Vimshottari Dasha - 120 year cycle)
const MAHADASHA_PERIODS: Record<string, number> = {
  'Ketu': 7,
  'Venus': 20,
  'Sun': 6,
  'Moon': 10,
  'Mars': 7,
  'Rahu': 18,
  'Jupiter': 16,
  'Saturn': 19,
  'Mercury': 17,
};

// Mahadasha sequence (starting from Ketu)
const MAHADASHA_SEQUENCE = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

// Planet IDs in Swiss Ephemeris
const PLANETS = {
  SUN: constants.SE_SUN,
  MOON: constants.SE_MOON,
  MARS: constants.SE_MARS,
  MERCURY: constants.SE_MERCURY,
  JUPITER: constants.SE_JUPITER,
  VENUS: constants.SE_VENUS,
  SATURN: constants.SE_SATURN,
  RAHU: constants.SE_MEAN_NODE,  // Mean North Node
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASTROLOGY SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AstrologyServiceV2 {
  
  constructor() {
    // Set Lahiri Ayanamsa (most commonly used in India)
    set_sid_mode(constants.SE_SIDM_LAHIRI, 0, 0);
    console.log('[AstrologyV2] 🔮 Initialized with Lahiri Ayanamsa');
  }

  /**
   * Convert date/time to Julian Day
   */
  private getJulianDay(date: string, time: string, timezone: number): number {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    // Convert local time to UTC
    const decimalHour = hour + (minute / 60) - timezone;
    
    // Calculate Julian Day
    const jd = julday(year, month, day, decimalHour, constants.SE_GREG_CAL);
    return jd;
  }

  /**
   * Get sidereal position of a planet
   */
  private getPlanetPosition(julianDay: number, planet: number): number {
    const flags = constants.SEFLG_SIDEREAL | constants.SEFLG_SPEED;
    const result = calc_ut(julianDay, planet, flags);
    
    if (result.flag < 0) {
      console.error('[AstrologyV2] Error calculating planet position:', result.error);
      return 0;
    }
    
    // result.data[0] is longitude
    return result.data[0];
  }

  /**
   * Get Lagna (Ascendant)
   */
  /**
   * Get Lagna (Ascendant)
   */
    private getLagna(julianDay: number, latitude: number, longitude: number): number {
    const houseResult = houses(julianDay, latitude, longitude, 'P') as any; // Placidus
    
    // Apply ayanamsa to get sidereal ascendant
    const ayanamsa = get_ayanamsa_ut(julianDay);
    
    console.log('[AstrologyV2] 🏠 Full Houses Result:', JSON.stringify(houseResult, null, 2));
    
    // Access ascendant from sweph houses() result
    // The ascendant is at data.points[0] or data.houses[0]
    let tropicalAsc = 0;
    
    if (houseResult?.data?.points?.[0] !== undefined) {
      tropicalAsc = houseResult.data.points[0];
      console.log('[AstrologyV2] ✅ Found ascendant from data.points[0]:', tropicalAsc);
    } else if (houseResult?.data?.houses?.[0] !== undefined) {
      tropicalAsc = houseResult.data.houses[0];
      console.log('[AstrologyV2] ✅ Found ascendant from data.houses[0]:', tropicalAsc);
    } else if (houseResult?.ascendant !== undefined) {
      tropicalAsc = houseResult.ascendant;
      console.log('[AstrologyV2] ✅ Found ascendant at root:', tropicalAsc);
    }
    
    console.log('[AstrologyV2] 🌐 Tropical Ascendant:', tropicalAsc);
    console.log('[AstrologyV2] 🔄 Ayanamsa:', ayanamsa);
    
    let siderealAsc = tropicalAsc - ayanamsa;
    
    // Normalize to 0-360
    if (siderealAsc < 0) siderealAsc += 360;
    
    console.log('[AstrologyV2] ⬆️ Sidereal Ascendant:', siderealAsc);
    console.log('[AstrologyV2] 🏠 Lagna Rashi Index:', Math.floor(siderealAsc / 30));
    
    return siderealAsc;
  }
  /**
   * Get Rashi from longitude
   */
  private getRashiFromLongitude(longitude: number) {
    // Normalize longitude to 0-360
    let normalizedLong = longitude % 360;
    if (normalizedLong < 0) normalizedLong += 360;
    
    const rashiIndex = Math.floor(normalizedLong / 30);
    return RASHI_NAMES[rashiIndex];
  }

  /**
   * Get Nakshatra from longitude
   */
  private getNakshatraFromLongitude(longitude: number) {
    // Normalize longitude to 0-360
    let normalizedLong = longitude % 360;
    if (normalizedLong < 0) normalizedLong += 360;
    
    // Each nakshatra = 13°20' = 13.3333°
    const nakshatraIndex = Math.floor(normalizedLong / (360 / 27));
    const nakshatra = NAKSHATRA_NAMES[nakshatraIndex];
    
    // Calculate pada (quarter) - each nakshatra has 4 padas
    const positionInNakshatra = normalizedLong % (360 / 27);
    const pada = Math.floor(positionInNakshatra / (360 / 108)) + 1;
    
    return { ...nakshatra, pada };
  }

  /**
   * Calculate current Mahadasha
   */
  private calculateMahadasha(birthDate: Date, birthNakshatraLord: string, moonLongitude: number) {
    const now = new Date();
    
    // Calculate balance of dasha at birth
    const nakshatraSpan = 360 / 27; // 13.333°
    const positionInNakshatra = moonLongitude % nakshatraSpan;
    const progressInNakshatra = positionInNakshatra / nakshatraSpan;
    
    // Balance of first dasha (remaining portion)
    const firstDashaPeriod = MAHADASHA_PERIODS[birthNakshatraLord];
    const firstDashaBalance = firstDashaPeriod * (1 - progressInNakshatra);
    
    // Find starting position in sequence
    const startIndex = MAHADASHA_SEQUENCE.indexOf(birthNakshatraLord);
    if (startIndex === -1) {
      return { current: 'Unknown', error: 'Invalid nakshatra lord' };
    }
    
    // Calculate age in years
    const ageInMs = now.getTime() - birthDate.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    
    // Find current Mahadasha
    let yearsElapsed = 0;
    let currentDasha = birthNakshatraLord;
    let currentDashaStart = 0;
    let isFirstDasha = true;
    
    for (let i = 0; i < MAHADASHA_SEQUENCE.length * 2; i++) {
      const idx = (startIndex + i) % MAHADASHA_SEQUENCE.length;
      const planet = MAHADASHA_SEQUENCE[idx];
      const period = isFirstDasha ? firstDashaBalance : MAHADASHA_PERIODS[planet];
      
      if (yearsElapsed + period > ageInYears) {
        currentDasha = planet;
        currentDashaStart = yearsElapsed;
        break;
      }
      
      yearsElapsed += period;
      isFirstDasha = false;
    }
    
    const yearsIntoDasha = ageInYears - currentDashaStart;
    const totalPeriod = MAHADASHA_PERIODS[currentDasha];
    const remainingYears = totalPeriod - yearsIntoDasha;
    
    // Calculate approximate end date
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + Math.floor(remainingYears));
    endDate.setMonth(endDate.getMonth() + Math.floor((remainingYears % 1) * 12));
    
    return {
      current: currentDasha,
      currentHindi: this.getPlanetHindi(currentDasha),
      totalYears: totalPeriod,
      yearsCompleted: Math.round(yearsIntoDasha * 10) / 10,
      yearsRemaining: Math.round(remainingYears * 10) / 10,
      approximateEndDate: endDate.toISOString().split('T')[0],
      birthDashaBalance: Math.round(firstDashaBalance * 10) / 10,
    };
  }

  /**
   * Get Hindi name for planet
   */
  private getPlanetHindi(planet: string): string {
    const mapping: Record<string, string> = {
      'Sun': 'सूर्य (Surya)',
      'Moon': 'चंद्र (Chandra)',
      'Mars': 'मंगल (Mangal)',
      'Mercury': 'बुध (Budh)',
      'Jupiter': 'गुरु (Guru)',
      'Venus': 'शुक्र (Shukra)',
      'Saturn': 'शनि (Shani)',
      'Rahu': 'राहु (Rahu)',
      'Ketu': 'केतु (Ketu)',
    };
    return mapping[planet] || planet;
  }

  /**
   * Get complete Kundli
   */
  async getKundli(birthDetails: BirthDetails) {
    try {
      const { date, time, latitude, longitude, timezone } = birthDetails;
      
      console.log('[AstrologyV2] 📅 Calculating for:', date, time);
      console.log('[AstrologyV2] 📍 Location:', latitude, longitude, 'TZ:', timezone);
      
      // Get Julian Day
      const jd = this.getJulianDay(date, time, timezone);
      console.log('[AstrologyV2] 📆 Julian Day:', jd);
      
      // Get Ayanamsa value
      const ayanamsa = get_ayanamsa_ut(jd);
      console.log('[AstrologyV2] 🔄 Lahiri Ayanamsa:', ayanamsa.toFixed(4) + '°');
      
      // Get Moon position (sidereal)
      const moonLongitude = this.getPlanetPosition(jd, PLANETS.MOON);
      console.log('[AstrologyV2] 🌙 Moon Sidereal Longitude:', moonLongitude.toFixed(4) + '°');
      
      // Get Lagna (Ascendant)
      const lagnaLongitude = this.getLagna(jd, latitude, longitude);
      console.log('[AstrologyV2] ⬆️ Lagna Longitude:', lagnaLongitude.toFixed(4) + '°');
      
      // Calculate Rashi (Moon Sign)
      const moonRashi = this.getRashiFromLongitude(moonLongitude);
      console.log('[AstrologyV2] 🌙 Moon Rashi:', moonRashi.english);
      
      // Calculate Lagna Rashi
      const lagnaRashi = this.getRashiFromLongitude(lagnaLongitude);
      console.log('[AstrologyV2] ⬆️ Lagna Rashi:', lagnaRashi.english);
      
      // Calculate Nakshatra
      const nakshatra = this.getNakshatraFromLongitude(moonLongitude);
      console.log('[AstrologyV2] ⭐ Nakshatra:', nakshatra.english, 'Pada:', nakshatra.pada);
      
      // Calculate Mahadasha
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      const birthDate = new Date(year, month - 1, day, hour, minute);
      const mahadasha = this.calculateMahadasha(birthDate, nakshatra.lord, moonLongitude);
      console.log('[AstrologyV2] 🪐 Current Mahadasha:', mahadasha.current);
      
      // Get all planet positions
      const sunLong = this.getPlanetPosition(jd, PLANETS.SUN);
      const marsLong = this.getPlanetPosition(jd, PLANETS.MARS);
      const mercuryLong = this.getPlanetPosition(jd, PLANETS.MERCURY);
      const jupiterLong = this.getPlanetPosition(jd, PLANETS.JUPITER);
      const venusLong = this.getPlanetPosition(jd, PLANETS.VENUS);
      const saturnLong = this.getPlanetPosition(jd, PLANETS.SATURN);
      const rahuLong = this.getPlanetPosition(jd, PLANETS.RAHU);
      const ketuLong = (rahuLong + 180) % 360;
      
      const planets = {
        sun: { longitude: sunLong, rashi: this.getRashiFromLongitude(sunLong).english },
        moon: { longitude: moonLongitude, rashi: moonRashi.english },
        mars: { longitude: marsLong, rashi: this.getRashiFromLongitude(marsLong).english },
        mercury: { longitude: mercuryLong, rashi: this.getRashiFromLongitude(mercuryLong).english },
        jupiter: { longitude: jupiterLong, rashi: this.getRashiFromLongitude(jupiterLong).english },
        venus: { longitude: venusLong, rashi: this.getRashiFromLongitude(venusLong).english },
        saturn: { longitude: saturnLong, rashi: this.getRashiFromLongitude(saturnLong).english },
        rahu: { longitude: rahuLong, rashi: this.getRashiFromLongitude(rahuLong).english },
        ketu: { longitude: ketuLong, rashi: this.getRashiFromLongitude(ketuLong).english },
      };
      
      return {
        success: true,
        data: {
          birthDetails: {
            date,
            time,
            place: { latitude, longitude },
            timezone: `UTC+${timezone}`,
          },
          moonSign: moonRashi,
          lagna: lagnaRashi,
          nakshatra: {
            ...nakshatra,
            lordHindi: this.getPlanetHindi(nakshatra.lord),
          },
          mahadasha,
          planets,
          calculations: {
            julianDay: jd,
            ayanamsa: ayanamsa.toFixed(4) + '°',
            moonLongitude: moonLongitude.toFixed(4) + '°',
            lagnaLongitude: lagnaLongitude.toFixed(4) + '°',
          },
        },
      };
    } catch (error: any) {
      console.error('[AstrologyV2] ❌ Error:', error.message);
      console.error('[AstrologyV2] Stack:', error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  /**
   * Get today's planetary positions for horoscope
   */
  async getTodayTransits() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = `${now.getHours()}:${now.getMinutes()}`;
    
    // Use a neutral location (0,0) for general transits
    const jd = this.getJulianDay(date, time, 0);
    
    const sunLong = this.getPlanetPosition(jd, PLANETS.SUN);
    const moonLong = this.getPlanetPosition(jd, PLANETS.MOON);
    const marsLong = this.getPlanetPosition(jd, PLANETS.MARS);
    const mercuryLong = this.getPlanetPosition(jd, PLANETS.MERCURY);
    const jupiterLong = this.getPlanetPosition(jd, PLANETS.JUPITER);
    const venusLong = this.getPlanetPosition(jd, PLANETS.VENUS);
    const saturnLong = this.getPlanetPosition(jd, PLANETS.SATURN);
    const rahuLong = this.getPlanetPosition(jd, PLANETS.RAHU);
    
    return {
      sun: { longitude: sunLong, rashi: this.getRashiFromLongitude(sunLong) },
      moon: { longitude: moonLong, rashi: this.getRashiFromLongitude(moonLong) },
      mars: { longitude: marsLong, rashi: this.getRashiFromLongitude(marsLong) },
      mercury: { longitude: mercuryLong, rashi: this.getRashiFromLongitude(mercuryLong) },
      jupiter: { longitude: jupiterLong, rashi: this.getRashiFromLongitude(jupiterLong) },
      venus: { longitude: venusLong, rashi: this.getRashiFromLongitude(venusLong) },
      saturn: { longitude: saturnLong, rashi: this.getRashiFromLongitude(saturnLong) },
      rahu: { longitude: rahuLong, rashi: this.getRashiFromLongitude(rahuLong) },
      moonNakshatra: this.getNakshatraFromLongitude(moonLong),
      date: date,
    };
  }

  /**
   * Get daily horoscope for a specific sign
   */
  async getDailyHoroscope(signName: string) {
    const sign = signName.toLowerCase();
    const signIndex = RASHI_NAMES.findIndex(r => r.english.toLowerCase() === sign);
    
    if (signIndex === -1) {
      return { success: false, error: 'Invalid sign name' };
    }
    
    const rashi = RASHI_NAMES[signIndex];
    const transits = await this.getTodayTransits();
    const today = new Date();
    
    // Day of week ruling planet
    const dayRulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const todayRuler = dayRulers[today.getDay()];
    
    // Calculate house positions relative to this sign
    const moonFromSign = ((transits.moon.rashi.index - rashi.index + 12) % 12) + 1;
    const sunFromSign = ((transits.sun.rashi.index - rashi.index + 12) % 12) + 1;
    const jupiterFromSign = ((transits.jupiter.rashi.index - rashi.index + 12) % 12) + 1;
    const saturnFromSign = ((transits.saturn.rashi.index - rashi.index + 12) % 12) + 1;
    const venusFromSign = ((transits.venus.rashi.index - rashi.index + 12) % 12) + 1;
    
    // Generate prediction based on transits
    const prediction = this.generatePrediction(rashi, {
      moonHouse: moonFromSign,
      sunHouse: sunFromSign,
      jupiterHouse: jupiterFromSign,
      saturnHouse: saturnFromSign,
      venusHouse: venusFromSign,
      dayRuler: todayRuler,
    });
    
    // Lucky number based on sign lord + date
    const luckyNumber = this.calculateLuckyNumber(rashi, today);
    
    // Lucky color based on day ruler and sign
    const luckyColor = this.calculateLuckyColor(rashi, todayRuler);
    
    return {
      success: true,
      data: {
        sign: rashi,
        date: today.toISOString().split('T')[0],
        dayRuler: todayRuler,
        prediction: prediction,
        luckyNumber: luckyNumber,
        luckyColor: luckyColor,
        transits: {
          moon: { house: moonFromSign, rashi: transits.moon.rashi.english },
          sun: { house: sunFromSign, rashi: transits.sun.rashi.english },
          jupiter: { house: jupiterFromSign, rashi: transits.jupiter.rashi.english },
          saturn: { house: saturnFromSign, rashi: transits.saturn.rashi.english },
        },
      },
    };
  }

  /**
   * Generate prediction based on transit positions
   */
  private generatePrediction(rashi: typeof RASHI_NAMES[0], transits: {
    moonHouse: number;
    sunHouse: number;
    jupiterHouse: number;
    saturnHouse: number;
    venusHouse: number;
    dayRuler: string;
  }): string {
    const predictions: string[] = [];
    
    // Moon transit effects
    const moonEffects: Record<number, string> = {
      1: "Your emotions are heightened today. Focus on self-care and personal matters.",
      2: "Financial matters need attention. A good day for planning expenses.",
      3: "Communication flows easily. Reach out to siblings or neighbors.",
      4: "Home and family matters take priority. Spend time with loved ones.",
      5: "Creativity is strong. Romance and children bring joy.",
      6: "Focus on health and daily routines. Help others if you can.",
      7: "Relationships are in focus. Partnership matters need attention.",
      8: "A transformative day. Research and investigation favored.",
      9: "Learning and travel are highlighted. Seek higher knowledge.",
      10: "Career matters demand attention. Professional recognition possible.",
      11: "Social connections bring opportunities. Friends are supportive.",
      12: "Rest and reflection needed. Spiritual practices are beneficial.",
    };
    
    // Jupiter transit effects (benefic)
    const jupiterBenefic: number[] = [1, 2, 5, 7, 9, 11];
    const saturnChallenge: number[] = [1, 4, 7, 8, 10, 12];
    
    predictions.push(moonEffects[transits.moonHouse] || "A balanced day awaits you.");
    
    if (jupiterBenefic.includes(transits.jupiterHouse)) {
      predictions.push("Jupiter's blessings bring growth and opportunities.");
    }
    
    if (saturnChallenge.includes(transits.saturnHouse)) {
      predictions.push("Stay disciplined and patient. Hard work will pay off.");
    } else {
      predictions.push("Saturn supports your steady efforts today.");
    }
    
    if (transits.venusHouse === 1 || transits.venusHouse === 5 || transits.venusHouse === 7) {
      predictions.push("Love and beauty surround you. Enjoy life's pleasures.");
    }
    
    // Day ruler effect
    if (transits.dayRuler === rashi.lord) {
      predictions.push(`Today is especially favorable as ${transits.dayRuler} rules both the day and your sign!`);
    }
    
    return predictions.join(" ");
  }

  /**
   * Calculate lucky number based on sign and date
   */
  private calculateLuckyNumber(rashi: typeof RASHI_NAMES[0], date: Date): number {
    const lordNumbers: Record<string, number[]> = {
      'Sun': [1, 4, 10],
      'Moon': [2, 7, 11],
      'Mars': [3, 9, 18],
      'Mercury': [5, 14, 23],
      'Jupiter': [3, 12, 21],
      'Venus': [6, 15, 24],
      'Saturn': [8, 17, 26],
    };
    
    const numbers = lordNumbers[rashi.lord] || [7, 14, 21];
    const dateSum = date.getDate() + date.getMonth() + 1;
    
    return numbers[dateSum % numbers.length];
  }

  /**
   * Calculate lucky color based on sign and day ruler
   */
  private calculateLuckyColor(rashi: typeof RASHI_NAMES[0], dayRuler: string): { name: string; hex: string } {
    const lordColors: Record<string, { name: string; hex: string }> = {
      'Sun': { name: 'Gold', hex: '#FFD700' },
      'Moon': { name: 'White', hex: '#FFFFFF' },
      'Mars': { name: 'Red', hex: '#E53935' },
      'Mercury': { name: 'Green', hex: '#43A047' },
      'Jupiter': { name: 'Yellow', hex: '#FFC107' },
      'Venus': { name: 'Pink', hex: '#EC407A' },
      'Saturn': { name: 'Blue', hex: '#1E88E5' },
    };
    
    // Combine sign lord and day ruler for variety
    const today = new Date();
    const useSignLord = today.getDate() % 2 === 0;
    
    return lordColors[useSignLord ? rashi.lord : dayRuler] || lordColors['Jupiter'];
  }
}

// Export singleton
export const astrologyServiceV2 = new AstrologyServiceV2();
export default astrologyServiceV2;