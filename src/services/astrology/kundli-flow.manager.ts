/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA KUNDLI FLOW MANAGER v3.0 — DYNAMIC MULTILINGUAL
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Step-by-step conversational flow with full language support:
 * - Hindi, English, Hinglish
 * - All responses dynamic based on user preference
 * 
 * Created by: Amandeep, Punjab, India
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { kundliParserService } from './kundli-parser.service';
import { geocodingService } from './geocoding.service';
import { astrologyServiceV2 } from './astrology.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type KundliStep = 'IDLE' | 'ASK_NAME' | 'ASK_DATE' | 'ASK_TIME' | 'ASK_PLACE' | 'GENERATE';
export type KundliLanguage = 'hindi' | 'english' | 'hinglish';

export interface KundliSession {
  step: KundliStep;
  name?: string;
  date?: string;
  time?: string;
  place?: string;
  language: KundliLanguage;
  startedAt: number;
}

export interface KundliFlowInput {
  userId: string;
  message: string;
  language?: KundliLanguage;
}

export interface KundliFlowOutput {
  isKundliFlow: boolean;
  session: KundliSession | null;
  directResponse: string | null;
  skipLLM: boolean;
  kundliData: any | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SESSION STORE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const sessions: Map<string, KundliSession> = new Map();
const SESSION_TIMEOUT = 10 * 60 * 1000;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KUNDLI TRIGGERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const KUNDLI_TRIGGERS = [
  /\b(meri|mera|apni|apna)\s*(kundli|kundali|janampatri|patrika)\b/i,
  /\b(kundli|kundali|janampatri)\s*(banao|banana|chahiye|bana\s*do)\b/i,
  /\b(create|make|generate|show)\s*(my\s*)?(kundli|birth\s*chart)\b/i,
  /^kundli$/i,
  /^birth\s*chart$/i,
  /\bmy\s*kundli\b/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTILINGUAL RESPONSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LANG = {
  hindi: {
    askName: `🙏 जय सिया राम!

मैं आपकी कुंडली बनाने में मदद करूंगी। पहले आपका शुभ नाम बताइए?`,
    askDate: (name: string) => `धन्यवाद ${name} जी! 🙏

अब आपकी **जन्म तिथि** बताइए।
(जैसे: 31 January 1989 या 31-01-1989)`,
    askTime: (name: string) => `बहुत अच्छा ${name} जी! ✨

अब **जन्म का समय** बताइए।
(जैसे: शाम 4 बजे या 16:00)`,
    askPlace: (name: string) => `बिल्कुल सही ${name} जी! 📍

अंतिम चरण - **जन्म स्थान** बताइए।
(शहर का नाम, जैसे: दिल्ली, मुंबई)`,
    errorDate: `🙏 यह तिथि समझ नहीं आई। कृपया इस प्रकार लिखें:
• 31 January 1989
• 31-01-1989`,
    errorTime: `🙏 यह समय समझ नहीं आया। कृपया इस प्रकार लिखें:
• शाम 4 बजे
• 16:00`,
    errorPlace: `🙏 यह जगह नहीं मिली। कृपया शहर का नाम लिखें।`,
    shortName: `🙏 कृपया अपना नाम बताइए (कम से कम 2 अक्षर)`,
    errorGeneric: `🙏 क्षमा करें, कुंडली बनाने में त्रुटि आई। कृपया दोबारा प्रयास करें।`,
  },
  english: {
    askName: `🙏 Hello!

I'll help you create your Kundli (Birth Chart). Please tell me your name?`,
    askDate: (name: string) => `Thank you ${name}! 🙏

Now please share your **date of birth**.
(Example: 31 January 1989 or 31-01-1989)`,
    askTime: (name: string) => `Great ${name}! ✨

Now please share your **time of birth**.
(Example: 4:00 PM or 16:00)`,
    askPlace: (name: string) => `Perfect ${name}! 📍

Last step - please share your **place of birth**.
(City name, e.g., Delhi, Mumbai, London)`,
    errorDate: `🙏 I couldn't understand that date. Please write like:
• 31 January 1989
• 31-01-1989`,
    errorTime: `🙏 I couldn't understand that time. Please write like:
• 4:00 PM
• 16:00`,
    errorPlace: `🙏 I couldn't find that place. Please enter a city name.`,
    shortName: `🙏 Please enter your name (at least 2 characters)`,
    errorGeneric: `🙏 Sorry, there was an error creating your Kundli. Please try again.`,
  },
  hinglish: {
    askName: `🙏 Jai Siya Ram!

Main aapki Kundli banane mein madad karungi. Pehle aapka shubh naam batayein?`,
    askDate: (name: string) => `Dhanyavaad ${name} ji! 🙏

Ab aapki **janam tithi** batayein.
(Jaise: 31 January 1989 ya 31-01-1989)`,
    askTime: (name: string) => `Bahut accha ${name} ji! ✨

Ab **janam ka samay** batayein.
(Jaise: 4:00 PM ya 16:00 ya subah 6 baje)`,
    askPlace: (name: string) => `Perfect ${name} ji! 📍

Last step - **janam sthan** batayein.
(City ka naam, jaise: Ferozepur, Delhi, Mumbai)`,
    errorDate: `🙏 Ye date format samajh nahi aayi. Kripya aise likhein:
• 31 January 1989
• 31-01-1989`,
    errorTime: `🙏 Ye time format samajh nahi aayi. Kripya aise likhein:
• 4:00 PM
• 16:00`,
    errorPlace: `🙏 Ye jagah nahi mili. Kripya city ka naam likhein.`,
    shortName: `🙏 Kripya apna naam batayein (kam se kam 2 letters)`,
    errorGeneric: `🙏 Sorry, Kundli generate karne mein error aayi. Kripya dobara try karein.`,
  },
};

// Kundli Result Language
const KUNDLI_LANG = {
  hindi: {
    greeting: (name: string) => `🙏 **जय सिया राम ${name} जी!**`,
    ready: '✨ **आपकी कुंडली तैयार है!**',
    lagna: 'लग्न',
    moonSign: 'चंद्र राशि',
    nakshatra: 'नक्षत्र',
    pada: 'पद',
    mahadasha: 'महादशा',
    yearsLeft: 'वर्ष शेष',
    planets: 'ग्रह स्थिति',
    tableHeaders: '| ग्रह | राशि | भाव | अंश |',
    askMore: '🔮 **और जानना चाहते हैं? पूछें:**',
    marriage: '💍 **विवाह** - "मेरी शादी कब होगी?"',
    career: '💰 **करियर** - "करियर में सफलता कैसे?"',
    health: '❤️ **स्वास्थ्य** - "स्वास्थ्य कैसा रहेगा?"',
    family: '👨‍👩‍👧 **परिवार** - "पारिवारिक जीवन?"',
    education: '📚 **शिक्षा** - "पढ़ाई में कैसा?"',
    disclaimer: '⚠️ _कुंडली मार्गदर्शन है। मेहनत पर भरोसा रखें!_ 🙏',
  },
  english: {
    greeting: (name: string) => `🙏 **Hello ${name}!**`,
    ready: '✨ **Your Kundli is ready!**',
    lagna: 'Ascendant',
    moonSign: 'Moon Sign',
    nakshatra: 'Nakshatra',
    pada: 'Pada',
    mahadasha: 'Mahadasha',
    yearsLeft: 'years left',
    planets: 'Planetary Positions',
    tableHeaders: '| Planet | Sign | House | Degree |',
    askMore: '🔮 **Want to know more? Ask:**',
    marriage: '💍 **Marriage** - "When will I marry?"',
    career: '💰 **Career** - "How will my career be?"',
    health: '❤️ **Health** - "How is my health?"',
    family: '👨‍👩‍👧 **Family** - "Family life?"',
    education: '📚 **Education** - "Studies?"',
    disclaimer: '⚠️ _Kundli is guidance. Trust your efforts!_ 🙏',
  },
  hinglish: {
    greeting: (name: string) => `🙏 **Jai Siya Ram ${name} ji!**`,
    ready: '✨ **Aapki Kundli taiyaar hai!**',
    lagna: 'Lagna',
    moonSign: 'Chandra Rashi',
    nakshatra: 'Nakshatra',
    pada: 'Pada',
    mahadasha: 'Mahadasha',
    yearsLeft: 'saal baaki',
    planets: 'Graha Sthiti',
    tableHeaders: '| ग्रह | राशि | भाव | अंश |',
    askMore: '🔮 **Aur jaanna hai? Poochein:**',
    marriage: '💍 **Marriage** - "Shaadi kab?"',
    career: '💰 **Career** - "Success kaise?"',
    health: '❤️ **Health** - "Health kaisi?"',
    family: '👨‍👩‍👧 **Family** - "Family life?"',
    education: '📚 **Education** - "Padhai?"',
    disclaimer: '⚠️ _Kundli margdarshan hai. Mehnat par bharosa!_ 🙏',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KUNDLI FLOW MANAGER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class KundliFlowManager {

  private getLang(language: KundliLanguage) {
    return LANG[language] || LANG.hinglish;
  }

  private getKundliLang(language: KundliLanguage) {
    return KUNDLI_LANG[language] || KUNDLI_LANG.hinglish;
  }

  async process(input: KundliFlowInput): Promise<KundliFlowOutput> {
    const { userId, message, language = 'hinglish' } = input;
    
    // Check if new Kundli trigger
    const isKundliTrigger = KUNDLI_TRIGGERS.some(pattern => pattern.test(message));
    
    // Clear old session on new trigger
    if (isKundliTrigger) {
      console.log('[KundliFlow] 🔮 New trigger - clearing old session');
      sessions.delete(userId);
    }
    
    let session = sessions.get(userId);
    
    // Check expiry
    if (session && Date.now() - session.startedAt > SESSION_TIMEOUT) {
      console.log('[KundliFlow] ⏰ Session expired');
      sessions.delete(userId);
      session = undefined;
    }

    // New session
    if (!session) {
      if (!isKundliTrigger) {
        return this.nonKundliResponse();
      }

      console.log('[KundliFlow] 🔮 New session, language:', language);
      session = {
        step: 'ASK_NAME',
        language: language,
        startedAt: Date.now(),
      };
      sessions.set(userId, session);

      const L = this.getLang(language);
      return {
        isKundliFlow: true,
        session,
        directResponse: L.askName,
        skipLLM: true,
        kundliData: null,
      };
    }

    // Update language if changed
    if (language && language !== session.language) {
      session.language = language;
      sessions.set(userId, session);
    }

    console.log(`[KundliFlow] 📍 Step: ${session.step}, Lang: ${session.language}`);

    switch (session.step) {
      case 'ASK_NAME':
        return this.handleName(userId, message, session);
      case 'ASK_DATE':
        return this.handleDate(userId, message, session);
      case 'ASK_TIME':
        return this.handleTime(userId, message, session);
      case 'ASK_PLACE':
        return this.handlePlace(userId, message, session);
      default:
        return this.nonKundliResponse();
    }
  }

  private handleName(userId: string, message: string, session: KundliSession): KundliFlowOutput {
    const name = message.trim();
    const L = this.getLang(session.language);
    
    if (name.length < 2) {
      return {
        isKundliFlow: true,
        session,
        directResponse: L.shortName,
        skipLLM: true,
        kundliData: null,
      };
    }

    session.name = name;
    session.step = 'ASK_DATE';
    sessions.set(userId, session);

    console.log(`[KundliFlow] ✅ Name: ${name}`);

    return {
      isKundliFlow: true,
      session,
      directResponse: L.askDate(name),
      skipLLM: true,
      kundliData: null,
    };
  }

  private handleDate(userId: string, message: string, session: KundliSession): KundliFlowOutput {
    const parsed = kundliParserService.parseBirthDetails(message);
    const L = this.getLang(session.language);
    
    if (!parsed.date) {
      return {
        isKundliFlow: true,
        session,
        directResponse: L.errorDate,
        skipLLM: true,
        kundliData: null,
      };
    }

    session.date = parsed.date;
    session.step = 'ASK_TIME';
    sessions.set(userId, session);

    console.log(`[KundliFlow] ✅ Date: ${parsed.date}`);

    return {
      isKundliFlow: true,
      session,
      directResponse: L.askTime(session.name || 'Friend'),
      skipLLM: true,
      kundliData: null,
    };
  }

  private handleTime(userId: string, message: string, session: KundliSession): KundliFlowOutput {
    const parsed = kundliParserService.parseBirthDetails(message);
    const L = this.getLang(session.language);
    
    if (!parsed.time) {
      return {
        isKundliFlow: true,
        session,
        directResponse: L.errorTime,
        skipLLM: true,
        kundliData: null,
      };
    }

    session.time = parsed.time;
    session.step = 'ASK_PLACE';
    sessions.set(userId, session);

    console.log(`[KundliFlow] ✅ Time: ${parsed.time}`);

    return {
      isKundliFlow: true,
      session,
      directResponse: L.askPlace(session.name || 'Friend'),
      skipLLM: true,
      kundliData: null,
    };
  }

  private async handlePlace(userId: string, message: string, session: KundliSession): Promise<KundliFlowOutput> {
    const place = message.trim();
    const L = this.getLang(session.language);

    if (place.length < 2) {
      return {
        isKundliFlow: true,
        session,
        directResponse: L.errorPlace,
        skipLLM: true,
        kundliData: null,
      };
    }

    console.log(`[KundliFlow] 📍 Getting coordinates: ${place}`);
    const geo = await geocodingService.getCoordinates(place);

    if (!geo.success) {
      return {
        isKundliFlow: true,
        session,
        directResponse: L.errorPlace,
        skipLLM: true,
        kundliData: null,
      };
    }

    console.log(`[KundliFlow] ✅ Coords: ${geo.latitude}, ${geo.longitude}`);

    session.place = geo.formattedPlace;
    session.step = 'GENERATE';
    sessions.set(userId, session);

    // Generate Kundli
    console.log(`[KundliFlow] 🔮 Generating Kundli...`);

    try {
      const kundliResult = await astrologyServiceV2.getKundli({
        date: session.date!,
        time: session.time!,
        latitude: geo.latitude,
        longitude: geo.longitude,
        timezone: geo.timezone,
      });

      if (!kundliResult.success) {
        console.error('[KundliFlow] ❌ Failed:', kundliResult.error);
        sessions.delete(userId);
        return {
          isKundliFlow: true,
          session: null,
          directResponse: L.errorGeneric,
          skipLLM: true,
          kundliData: null,
        };
      }

      console.log('[KundliFlow] ✅ Kundli generated!');

      const kundliData = {
        ...kundliResult.data,
        birthDetails: {
          name: session.name,
          date: session.date,
          time: session.time,
          place: session.place,
        },
      };

      sessions.delete(userId);

      const response = this.formatKundliResponse(session.name!, kundliData, session.language);

      return {
        isKundliFlow: true,
        session: null,
        directResponse: response,
        skipLLM: true,
        kundliData,
      };

    } catch (error: any) {
      console.error('[KundliFlow] ❌ Error:', error.message);
      sessions.delete(userId);
      return {
        isKundliFlow: true,
        session: null,
        directResponse: L.errorGeneric,
        skipLLM: true,
        kundliData: null,
      };
    }
  }

  private formatKundliResponse(name: string, data: any, language: KundliLanguage): string {
    const { lagna, moonSign, nakshatra, mahadasha, planets, calculations } = data;
    const L = this.getKundliLang(language);

    const formatDegree = (lng: number): string => {
      const deg = Math.floor(lng % 30);
      const min = Math.floor((lng % 1) * 60);
      return `${deg}°${min}'`;
    };

    const rashiNames: Record<string, { hindi: string; english: string }> = {
      'Aries': { hindi: 'मेष', english: 'Aries' },
      'Taurus': { hindi: 'वृषभ', english: 'Taurus' },
      'Gemini': { hindi: 'मिथुन', english: 'Gemini' },
      'Cancer': { hindi: 'कर्क', english: 'Cancer' },
      'Leo': { hindi: 'सिंह', english: 'Leo' },
      'Virgo': { hindi: 'कन्या', english: 'Virgo' },
      'Libra': { hindi: 'तुला', english: 'Libra' },
      'Scorpio': { hindi: 'वृश्चिक', english: 'Scorpio' },
      'Sagittarius': { hindi: 'धनु', english: 'Sagittarius' },
      'Capricorn': { hindi: 'मकर', english: 'Capricorn' },
      'Aquarius': { hindi: 'कुंभ', english: 'Aquarius' },
      'Pisces': { hindi: 'मीन', english: 'Pisces' },
    };

    const getRashi = (rashi: string): string => {
      const r = rashiNames[rashi];
      if (!r) return rashi;
      if (language === 'english') return r.english;
      if (language === 'hindi') return r.hindi;
      return `${r.hindi} (${r.english})`;
    };

    let response = `${L.greeting(name)}

${L.ready}

━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌅 **${L.lagna}:** ${lagna?.english} (${lagna?.hindi}) - ${calculations?.lagnaLongitude || ''}
🌙 **${L.moonSign}:** ${moonSign?.english} (${moonSign?.hindi})
⭐ **${L.nakshatra}:** ${nakshatra?.english} (${nakshatra?.hindi}) - ${L.pada} ${nakshatra?.pada}
🔄 **${L.mahadasha}:** ${mahadasha?.current} - ${mahadasha?.yearsRemaining?.toFixed(1)} ${L.yearsLeft}

━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **${L.planets}:**

${L.tableHeaders}
|:-----|:-----|:---:|----:|
`;

    if (planets) {
      const planetInfo = [
        { key: 'sun', emoji: '☀️', hindi: 'सूर्य', english: 'Sun' },
        { key: 'moon', emoji: '🌙', hindi: 'चंद्र', english: 'Moon' },
        { key: 'mars', emoji: '🔴', hindi: 'मंगल', english: 'Mars' },
        { key: 'mercury', emoji: '💚', hindi: 'बुध', english: 'Mercury' },
        { key: 'jupiter', emoji: '🟡', hindi: 'गुरु', english: 'Jupiter' },
        { key: 'venus', emoji: '💖', hindi: 'शुक्र', english: 'Venus' },
        { key: 'saturn', emoji: '🪐', hindi: 'शनि', english: 'Saturn' },
        { key: 'rahu', emoji: '🐍', hindi: 'राहु', english: 'Rahu' },
        { key: 'ketu', emoji: '🔥', hindi: 'केतु', english: 'Ketu' },
      ];

      for (const p of planetInfo) {
        const planet = planets[p.key];
        if (planet) {
          const pName = language === 'english' ? p.english : p.hindi;
          const rashi = getRashi(planet.rashi);
          const house = planet.house || '-';
          const degree = planet.longitude ? formatDegree(planet.longitude) : '-';
          response += `| ${p.emoji} ${pName} | ${rashi} | ${house} | ${degree} |\n`;
        }
      }
    }

    response += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${L.askMore}

${L.marriage}
${L.career}
${L.health}
${L.family}
${L.education}

━━━━━━━━━━━━━━━━━━━━━━━━━━━

${L.disclaimer}`;

    response += `\n\n[[KUNDLI_DATA:${JSON.stringify(data)}]]`;

    return response;
  }

  private nonKundliResponse(): KundliFlowOutput {
    return {
      isKundliFlow: false,
      session: null,
      directResponse: null,
      skipLLM: false,
      kundliData: null,
    };
  }

  hasActiveSession(userId: string): boolean {
    const session = sessions.get(userId);
    if (!session) return false;
    if (Date.now() - session.startedAt > SESSION_TIMEOUT) {
      sessions.delete(userId);
      return false;
    }
    return true;
  }

  clearSession(userId: string): void {
    sessions.delete(userId);
  }
}

export const kundliFlowManager = new KundliFlowManager();
export default kundliFlowManager;