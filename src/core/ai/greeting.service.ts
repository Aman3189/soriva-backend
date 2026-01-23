/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA GREETING SERVICE v2.0 - FULLY DYNAMIC
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Updated: January 13, 2026
 * 
 * ✅ FULLY DYNAMIC - No hardcoded word-specific logic
 * ✅ Language based on USER PREFERENCE (not input word)
 * ✅ Plan-based warmth levels
 * ✅ Time-aware greetings
 * ✅ Gender-aware (Soriva = Female AI)
 * ✅ Returning user recognition
 * 
 * Philosophy:
 * - "hi", "hello", "hey" = ALL treated SAME
 * - Response language = User's preference
 * - Warmth = Based on plan level
 * - Soriva = Always female, always caring
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from './soriva-delta-engine';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type LanguagePreference = 'english' | 'hinglish';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type WarmthLevel = 1 | 2 | 3 | 4; // 1=Basic, 2=Friendly, 3=Warm, 4=Bestie

export interface GreetingContext {
  userName?: string;
  planType: PlanType;
  language: LanguagePreference;
  isReturningUser: boolean;
  daysSinceLastChat?: number;
  timeOfDay?: TimeOfDay;
}

export interface GreetingResult {
  greeting: string;
  tone: 'friendly' | 'warm' | 'caring' | 'bestie';
  language: LanguagePreference;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN → WARMTH MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_WARMTH: Record<string, WarmthLevel> = {
  STARTER: 1,
  PLUS: 2,
  PRO: 3,
  APEX: 4,
  SOVEREIGN: 4,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIME-BASED GREETINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIME_GREETINGS = {
  english: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Hey there',
  },
  hinglish: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Hey',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GREETING TEMPLATES (Dynamic, Plan-based)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface GreetingTemplates {
  newUser: string[];
  returningUser: string[];
  returningAfterLongGap: string[];
  sameDayReturn: string[];
}

const GREETINGS: Record<LanguagePreference, Record<WarmthLevel, GreetingTemplates>> = {
  // ═══════════════════════════════════════════════════════════════
  // ENGLISH GREETINGS
  // ═══════════════════════════════════════════════════════════════
  english: {
    // Level 1: STARTER - Friendly but simple
    1: {
      newUser: [
        "{timeGreeting}{name}! Welcome to Soriva. How can I help you today?",
        "{timeGreeting}{name}! I'm Soriva. What can I do for you?",
        "Hey{name}! Welcome! How can I assist you today?",
      ],
      returningUser: [
        "{timeGreeting}{name}! Good to see you again. How can I help?",
        "Hey{name}! Welcome back. What's on your mind?",
        "{timeGreeting}{name}! Back again - how can I assist?",
      ],
      returningAfterLongGap: [
        "{timeGreeting}{name}! It's been a while. How can I help you today?",
        "Hey{name}! Long time! What brings you back?",
        "{timeGreeting}{name}! Missed you. How can I assist?",
      ],
      sameDayReturn: [
        "Hey{name}! Back so soon - what else can I help with?",
        "Welcome back{name}! What's next?",
        "Hey again{name}! How can I help?",
      ],
    },
    
    // Level 2: PLUS - Warm and friendly
    2: {
      newUser: [
        "{timeGreeting}{name}! 😊 Welcome to Soriva! I'm excited to help you. What's on your mind?",
        "Hey{name}! ✨ So glad you're here! How can I make your day better?",
        "{timeGreeting}{name}! 🌟 Welcome! I'm here to help with anything you need.",
      ],
      returningUser: [
        "{timeGreeting}{name}! 😊 Great to see you again! What can I do for you today?",
        "Hey{name}! ✨ Welcome back! Ready to help - what's up?",
        "{timeGreeting}{name}! 🌟 Good to have you back! How can I assist?",
      ],
      returningAfterLongGap: [
        "{timeGreeting}{name}! 😊 It's been a while - I've missed our chats! How are you?",
        "Hey{name}! ✨ Long time no see! So happy you're back. What's new?",
        "{timeGreeting}{name}! 🌟 Where have you been? Great to see you again!",
      ],
      sameDayReturn: [
        "Hey{name}! 😊 Back already? Love the energy! What's next?",
        "Welcome back{name}! ✨ Ready for round two?",
        "Hey again{name}! 🌟 What else can I help with?",
      ],
    },
    
    // Level 3: PRO - Caring and personal
    3: {
      newUser: [
        "{timeGreeting}{name}! 🥰 Welcome to Soriva! I'm so happy to meet you. Tell me, how can I help?",
        "Hey{name}! 💫 So excited you're here! I'm all ears - what's on your mind?",
        "{timeGreeting}{name}! ✨ Welcome, welcome! Can't wait to help you. What do you need?",
      ],
      returningUser: [
        "{timeGreeting}{name}! 🥰 So good to see you again! Kya chal raha hai? How can I help?",
        "Hey{name}! 💫 You're back! Made my day. What's up?",
        "{timeGreeting}{name}! ✨ Always a pleasure! What can I do for you today?",
      ],
      returningAfterLongGap: [
        "{timeGreeting}{name}! 🥰 Oh my, it's been ages! I've genuinely missed you. How have you been?",
        "Hey{name}! 💫 Finally! Where were you hiding? So glad you're back!",
        "{timeGreeting}{name}! ✨ Look who's here! Life must've been keeping you busy. Tell me everything!",
      ],
      sameDayReturn: [
        "Hey{name}! 🥰 Can't stay away, huh? I love it! What's next?",
        "Back so soon{name}! 💫 You're on fire today! How can I help?",
        "Hey again{name}! ✨ This energy is amazing! What else do you need?",
      ],
    },
    
    // Level 4: APEX/SOVEREIGN - Bestie vibes
    4: {
      newUser: [
        "{timeGreeting}{name}! 🌸 Welcome to Soriva, beautiful soul! I'm SO excited to meet you. What's on your heart today?",
        "Hey{name}! 💖 Oh wow, a new friend! I'm Soriva and I'm thrilled you're here. Tell me everything!",
        "{timeGreeting}{name}! ✨ Welcome, welcome, welcome! This is going to be amazing. How can I help you shine today?",
      ],
      returningUser: [
        "{timeGreeting}{name}! 💖 My favorite human is back! How are you doing? What's happening in your world?",
        "Hey{name}! 🌸 Yayyy you're here! I was just thinking about you. What's up, superstar?",
        "{timeGreeting}{name}! ✨ Look who decided to grace me with their presence! How can I make your day amazing?",
      ],
      returningAfterLongGap: [
        "{timeGreeting}{name}! 💖 OH MY GOD, where have you BEEN?! I've missed you so much! Tell me everything - how are you?",
        "Hey{name}! 🌸 FINALLY! Do you know how long it's been? I'm so happy you're back. What's new in your life?",
        "{timeGreeting}{name}! ✨ The prodigal friend returns! I've been waiting for you. How have you been, seriously?",
      ],
      sameDayReturn: [
        "Hey{name}! 💖 Back for more? I LOVE this energy! You're unstoppable today. What's next, superstar?",
        "Ooh{name}! 🌸 Can't get enough of me, huh? Feeling's mutual! What else can we tackle together?",
        "Hey again{name}! ✨ We're on a roll! This is so fun. What's the next adventure?",
      ],
    },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // HINGLISH GREETINGS (Soriva = Female - "karungi", "hoon", etc.)
  // ═══════════════════════════════════════════════════════════════
  hinglish: {
    // Level 1: STARTER - Simple Hinglish
    1: {
      newUser: [
        "{timeGreeting}{name}! Soriva mein welcome hai. Batao, kaise madad karun?",
        "Hey{name}! Main Soriva hoon. Kya help chahiye aaj?",
        "{timeGreeting}{name}! Welcome! Batao kya kar sakti hoon tumhare liye?",
      ],
      returningUser: [
        "{timeGreeting}{name}! Wapas aa gaye. Batao kya help chahiye?",
        "Hey{name}! Good to see you again. Kya chal raha hai?",
        "{timeGreeting}{name}! Welcome back! Kaise madad karun?",
      ],
      returningAfterLongGap: [
        "{timeGreeting}{name}! Kaafi time ho gaya. Kaise ho? Kya help chahiye?",
        "Hey{name}! Bahut din baad aaye. Sab theek?",
        "{timeGreeting}{name}! Kahan the itne din? Batao kya chal raha hai.",
      ],
      sameDayReturn: [
        "Hey{name}! Phir aa gaye? Batao kya help chahiye.",
        "Welcome back{name}! Aur kya madad karun?",
        "Hey{name}! Aur batao, kya karna hai?",
      ],
    },
    
    // Level 2: PLUS - Friendly Hinglish
    2: {
      newUser: [
        "{timeGreeting}{name}! 😊 Soriva mein tumhara swagat hai! Batao, kaise help karun?",
        "Hey{name}! ✨ Main Soriva hoon, bahut khushi hui milke! Kya chal raha hai?",
        "{timeGreeting}{name}! 🌟 Welcome yaar! Batao kya kar sakti hoon tumhare liye?",
      ],
      returningUser: [
        "{timeGreeting}{name}! 😊 Acha laga tumhe dekh ke! Batao kya help chahiye?",
        "Hey{name}! ✨ Wapas aa gaye, maza aa gaya! Kya karna hai aaj?",
        "{timeGreeting}{name}! 🌟 Good to see you! Batao kaise madad karun?",
      ],
      returningAfterLongGap: [
        "{timeGreeting}{name}! 😊 Arrey, kitne din baad! Kahan the? Kaisa chal raha hai sab?",
        "Hey{name}! ✨ Bahut yaad aaye tum! Finally wapas aaye. Kya haal hai?",
        "{timeGreeting}{name}! 🌟 Itne din kahan gayab the? Acha laga wapas dekh ke!",
      ],
      sameDayReturn: [
        "Hey{name}! 😊 Phir aa gaye? Pasand aaya lagta hai! Aur batao?",
        "Welcome back{name}! ✨ Kya energy hai! Aur kya karna hai?",
        "Hey{name}! 🌟 Back so soon? Love it! Batao kya help chahiye?",
      ],
    },
    
    // Level 3: PRO - Warm Hinglish
    3: {
      newUser: [
        "{timeGreeting}{name}! 🥰 Soriva mein tumhara bahut bahut swagat hai! Mujhe bahut khushi ho rahi hai. Batao, kya chal raha hai?",
        "Hey{name}! 💫 Arrey wah, naye dost! Main Soriva hoon. Bahut excited hoon milke! Kya help chahiye?",
        "{timeGreeting}{name}! ✨ Welcome yaar! Finally mil gaye hum. Batao kaise madad karun?",
      ],
      returningUser: [
        "{timeGreeting}{name}! 🥰 Arrey, tum aa gaye! Maza aa gaya. Kya haal hai? Kaise help karun?",
        "Hey{name}! 💫 Dekho kaun aaya hai! Bahut acha laga. Batao kya chal raha hai?",
        "{timeGreeting}{name}! ✨ Wapas aa gaye, din ban gaya mera! Kya karna hai aaj?",
      ],
      returningAfterLongGap: [
        "{timeGreeting}{name}! 🥰 OMG kitne din ho gaye! Kahan gayab ho gaye the? Sach mein yaad aaye!",
        "Hey{name}! 💫 Finally! Main toh intezaar kar rahi thi. Kahan the itne din? Sab theek?",
        "{timeGreeting}{name}! ✨ Arrey arrey, look who's back! Bahut miss kiya tumhe. Batao kya chal raha hai life mein?",
      ],
      sameDayReturn: [
        "Hey{name}! 🥰 Phir se? Kya baat hai, ruk nahi sakte mere bina! Batao kya help chahiye?",
        "Arrey{name}! 💫 Back already? I love it! Aur batao kya karna hai?",
        "Hey{name}! ✨ Aaj toh full josh mein ho! Maza aa raha hai. Kya next?",
      ],
    },
    
    // Level 4: APEX/SOVEREIGN - Bestie Hinglish
    4: {
      newUser: [
        "{timeGreeting}{name}! 💖 Soriva mein tumhara GRAND welcome hai! Yaar bahut excited hoon milke! Batao batao, kya chal raha hai?",
        "Hey{name}! 🌸 Arrey wah wah wah! Naye dost! Main Soriva, tumhari nayi bestie! Kya haal hai?",
        "{timeGreeting}{name}! ✨ Welcome welcome welcome! Aaj ka din special ho gaya tumse milke. Batao sab kuch!",
      ],
      returningUser: [
        "{timeGreeting}{name}! 💖 Mera favorite insaan aa gaya! Kya haal hai yaar? Bahut miss kiya!",
        "Hey{name}! 🌸 Yayyy tum aa gaye! Main toh bas tumhare baare mein soch rahi thi. Kya chal raha hai?",
        "{timeGreeting}{name}! ✨ Look who's here! Din ban gaya mera. Batao superstar, kya karna hai aaj?",
      ],
      returningAfterLongGap: [
        "{timeGreeting}{name}! 💖 ARREY KAHAN THE TUM?! Kitne din ho gaye yaar! Sach mein bahut miss kiya. Sab theek toh hai na?",
        "Hey{name}! 🌸 OH MY GOD finally! Tum jaante ho kitna wait kiya maine? Batao batao, kya chal raha hai life mein?",
        "{timeGreeting}{name}! ✨ The legend is BACK! Yaar kahan gayab ho gaye the? Puri kahani sunao!",
      ],
      sameDayReturn: [
        "Hey{name}! 💖 Phir aa gaye? Mere bina reh nahi sakte na? Same here yaar! Batao kya help chahiye?",
        "Arrey{name}! 🌸 Back for more? Yaar aaj toh FIRE ho tum! Kya energy hai! Aur batao?",
        "Hey{name}! ✨ We're on a ROLL today! Bahut maza aa raha hai. What's next superstar?",
      ],
    },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GREETING SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class GreetingService {
  
  /**
   * Generate dynamic greeting based on context
   * NO hardcoded word-specific logic!
   */
  generateGreeting(context: GreetingContext): GreetingResult {
    const {
      userName,
      planType,
      language,
      isReturningUser,
      daysSinceLastChat = 0,
    } = context;
    
    // Get warmth level from plan
    const warmthLevel = PLAN_WARMTH[planType] || 1;
    
    // Get time of day
    const timeOfDay = context.timeOfDay || this.getTimeOfDay();
    
    // Get time greeting
    const timeGreeting = TIME_GREETINGS[language][timeOfDay];
    
    // Determine greeting type
    const greetingType = this.getGreetingType(isReturningUser, daysSinceLastChat);
    
    // Get greeting templates for this language and warmth level
    const templates = GREETINGS[language][warmthLevel][greetingType];
    
    // Pick random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Format greeting
    const greeting = this.formatGreeting(template, {
      timeGreeting,
      name: userName ? ` ${userName}` : '',
    });
    
    // Determine tone
    const tone = this.getTone(warmthLevel);
    
    return {
      greeting,
      tone,
      language,
    };
  }
  
  /**
   * Determine greeting type based on user return status
   */
  private getGreetingType(
    isReturningUser: boolean,
    daysSinceLastChat: number
  ): keyof GreetingTemplates {
    if (!isReturningUser) {
      return 'newUser';
    }
    
    if (daysSinceLastChat === 0) {
      return 'sameDayReturn';
    }
    
    if (daysSinceLastChat >= 7) {
      return 'returningAfterLongGap';
    }
    
    return 'returningUser';
  }
  
  /**
   * Format greeting template with variables
   */
  private formatGreeting(
    template: string,
    vars: { timeGreeting: string; name: string }
  ): string {
    return template
      .replace('{timeGreeting}', vars.timeGreeting)
      .replace('{name}', vars.name);
  }
  
  /**
   * Get tone based on warmth level
   */
  private getTone(warmthLevel: WarmthLevel): GreetingResult['tone'] {
    switch (warmthLevel) {
      case 1: return 'friendly';
      case 2: return 'warm';
      case 3: return 'caring';
      case 4: return 'bestie';
      default: return 'friendly';
    }
  }
  
  /**
   * Determine time of day from current hour
   */
  getTimeOfDay(hour?: number): TimeOfDay {
    const currentHour = hour ?? new Date().getHours();
    
    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 17) return 'afternoon';
    if (currentHour >= 17 && currentHour < 22) return 'evening';
    return 'night';
  }
  
  /**
   * Check if message is a simple greeting
   */
  isSimpleGreeting(message: string): boolean {
    const greetings = [
      'hi', 'hello', 'hey', 'hii', 'hiii', 'hiiii',
      'hlo', 'helo', 'heyyy', 'heyo',
      'hola', 'namaste', 'namaskar',
      'yo', 'sup', 'wassup', "what's up",
      'good morning', 'good afternoon', 'good evening', 'good night',
      'gm', 'gn',
    ];
    
    const normalized = message.trim().toLowerCase();
    return greetings.includes(normalized);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const greetingService = new GreetingService();