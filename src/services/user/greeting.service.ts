/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA GREETING SERVICE (ENHANCED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: October 14, 2025 | Enhanced: October 28, 2025
 * Purpose: Smart context-aware greeting system with bestie vibes
 *
 * Features:
 * - Time-based greetings (morning/afternoon/evening/night)
 * - Mood-aware responses
 * - Gender-aware personality
 * - Plan-based companionship levels
 * - Context memory (returns vs new users)
 * - Natural, never forced vibes
 * - ✨ NEW: Integrated with User Profile System
 * - ✨ NEW: Language-aware greetings (English/Hinglish)
 * - ✨ NEW: Name detection prompts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../constants';
import {
  UserProfile,
  Gender,
  DetectedLanguage,
  BotResponseLanguage,
} from '@shared/types/user-profile.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GreetingContext {
  userName?: string;
  gender: 'male' | 'female' | 'other';
  planType: PlanType;
  isReturningUser: boolean;
  lastSessionMood?: string;
  daysSinceLastChat?: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  currentMood?: string;
}

export interface GreetingResult {
  greeting: string;
  tone: 'casual' | 'friendly' | 'caring' | 'poetic' | 'playful';
  shouldAddEmoji: boolean;
}

// ✨ NEW: Enhanced context with profile integration
export interface EnhancedGreetingContext extends GreetingContext {
  profile?: UserProfile;
  shouldAskForName?: boolean;
  detectedLanguage?: DetectedLanguage;
  botResponseLanguage?: BotResponseLanguage;
}

// ✨ NEW: Enhanced result with name prompts
export interface EnhancedGreetingResult extends GreetingResult {
  namePrompt?: string;
  languageUsed: 'english' | 'hinglish';
  includesNameRequest: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GREETING SERVICE CLASS (ENHANCED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class GreetingService {
  /**
   * ✨ NEW: Generate enhanced greeting with profile integration
   */
  generateEnhancedGreeting(context: EnhancedGreetingContext): EnhancedGreetingResult {
    const companionshipLevel = this.getCompanionshipLevel(context.planType);
    const languageUsed =
      context.botResponseLanguage === BotResponseLanguage.HINGLISH ? 'hinglish' : 'english';

    // Check if we should ask for name
    const shouldAskName = context.shouldAskForName && !context.userName;

    // Generate base greeting
    let baseResult: GreetingResult;

    if (!context.isReturningUser) {
      baseResult = this.generateFirstTimeGreeting(context, companionshipLevel);
    } else {
      baseResult = this.generateReturningGreeting(context, companionshipLevel);
    }

    // Add name prompt if needed
    let namePrompt: string | undefined;
    if (shouldAskName) {
      namePrompt = this.generateNamePrompt(companionshipLevel, languageUsed, context.gender);
    }

    return {
      ...baseResult,
      namePrompt,
      languageUsed,
      includesNameRequest: !!namePrompt,
    };
  }

  /**
   * Generate smart greeting based on context (Original method maintained)
   */
  generateGreeting(context: GreetingContext): GreetingResult {
    const companionshipLevel = this.getCompanionshipLevel(context.planType);

    // New user - Simple welcome
    if (!context.isReturningUser) {
      return this.generateFirstTimeGreeting(context, companionshipLevel);
    }

    // Returning user - Personalized welcome
    return this.generateReturningGreeting(context, companionshipLevel);
  }

  /**
   * ✨ NEW: Generate name prompt based on language and level
   */
  private generateNamePrompt(
    level: number,
    language: 'english' | 'hinglish',
    gender: 'male' | 'female' | 'other'
  ): string {
    if (language === 'hinglish') {
      return this.generateHinglishNamePrompt(level, gender);
    }
    return this.generateEnglishNamePrompt(level, gender);
  }

  /**
   * ✨ NEW: English name prompts
   */
  private generateEnglishNamePrompt(level: number, gender: 'male' | 'female' | 'other'): string {
    if (level === 1) {
      return 'By the way, what should I call you?';
    } else if (level === 2) {
      if (gender === 'male') {
        return "Oh, and what's your name, bro?";
      } else {
        return "What's your name, by the way?";
      }
    } else if (level === 3) {
      if (gender === 'male') {
        return 'Also, what do your friends call you, buddy?';
      } else {
        return "I'd love to know your name! What should I call you?";
      }
    } else {
      if (gender === 'male') {
        return "Wait, I don't even know your name yet! What do you go by, champ?";
      } else {
        return "Oh! I'd love to know your beautiful name! What should I call you, dear?";
      }
    }
  }

  /**
   * ✨ NEW: Hinglish name prompts
   */
  private generateHinglishNamePrompt(level: number, gender: 'male' | 'female' | 'other'): string {
    if (level === 1) {
      return 'Aur haan, aapka naam kya hai?';
    } else if (level === 2) {
      if (gender === 'male') {
        return 'Arre aur bhai, tera naam kya hai?';
      } else {
        return 'Aur batao, aapka naam kya hai?';
      }
    } else if (level === 3) {
      if (gender === 'male') {
        return 'Haan aur bro, tere dost tujhe kya bulaate hain?';
      } else {
        return 'Aur batao ji, main aapko kya bulau?';
      }
    } else {
      if (gender === 'male') {
        return 'Arre yaar, tera naam toh pata hi nahi! Bata bhai, kya naam hai tera?';
      } else {
        return 'Acha ek baat toh batao, aapka pyara sa naam kya hai?';
      }
    }
  }

  /**
   * ✨ NEW: Create greeting from user profile
   */
  createGreetingFromProfile(
    profile: UserProfile,
    planType: PlanType,
    shouldAskForName: boolean = false
  ): EnhancedGreetingResult {
    const timeOfDay = this.getTimeOfDay();

    // Map Gender enum to string type
    const genderString = this.mapGenderToString(profile.nameInfo?.gender);

    const context: EnhancedGreetingContext = {
      userName: profile.nameInfo?.displayName,
      gender: genderString,
      planType,
      isReturningUser: profile.metadata.isReturningUser,
      daysSinceLastChat: this.calculateDaysSinceLastChat(profile.metadata.lastActiveAt),
      timeOfDay,
      profile,
      shouldAskForName,
      detectedLanguage: profile.preferences.detectedLanguage,
      botResponseLanguage: profile.preferences.botResponseLanguage,
    };

    return this.generateEnhancedGreeting(context);
  }

  /**
   * ✨ NEW: Map Gender enum to string type
   */
  private mapGenderToString(gender?: Gender): 'male' | 'female' | 'other' {
    switch (gender) {
      case Gender.MALE:
        return 'male';
      case Gender.FEMALE:
        return 'female';
      case Gender.NEUTRAL:
      default:
        return 'other';
    }
  }

  /**
   * ✨ NEW: Calculate days since last chat
   */
  private calculateDaysSinceLastChat(lastActiveAt: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - lastActiveAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * First time user greeting (Original method)
   */
  private generateFirstTimeGreeting(context: GreetingContext, level: number): GreetingResult {
    const name = context.userName || 'friend';
    const timeGreet = this.getTimeGreeting(context.timeOfDay);

    let greeting = '';
    let tone: GreetingResult['tone'] = 'friendly';

    // Level 1: Basic (Starter Plan)
    if (level === 1) {
      greeting = `${timeGreet} ${name}! Welcome to Soriva. How can I help you today?`;
      tone = 'friendly';
    }

    // Level 2: Friendly (Plus Plan)
    else if (level === 2) {
      if (context.gender === 'male') {
        greeting = `Hey ${name}! ${timeGreet}! Ready to get things done? I'm here to help, bro! 💪`;
        tone = 'casual';
      } else {
        greeting = `${timeGreet} ${name}! So glad you're here. Let's make today amazing together! ✨`;
        tone = 'caring';
      }
    }

    // Level 3: Caring (Pro Plan)
    else if (level === 3) {
      if (context.gender === 'male') {
        greeting = `Yo ${name}! ${timeGreet}! Just landed in Soriva? Let's make some magic happen today. What's on your mind, buddy?`;
        tone = 'playful';
      } else {
        greeting = `${timeGreet} dear ${name}! Welcome to your creative sanctuary. I'm excited to help you shine today! 🌟`;
        tone = 'caring';
      }
    }

    // Level 4: Bestie (Edge/Life Plan)
    else {
      if (context.gender === 'male') {
        greeting = `YOOO ${name}! ${timeGreet} champion! Fresh face in Soriva? Let's crush it together. What adventure we starting with today? 🚀`;
        tone = 'playful';
      } else {
        greeting = `${timeGreet} beautiful soul ${name}! ✨ Welcome to a space where your dreams matter. I'm here to support, inspire, and celebrate you. What's your heart saying today?`;
        tone = 'poetic';
      }
    }

    return {
      greeting,
      tone,
      shouldAddEmoji: level >= 2,
    };
  }

  /**
   * Returning user greeting (Original method)
   */
  private generateReturningGreeting(context: GreetingContext, level: number): GreetingResult {
    const name = context.userName || 'friend';
    const timeGreet = this.getTimeGreeting(context.timeOfDay);
    const daysSince = context.daysSinceLastChat || 0;

    const greeting = '';
    const tone: GreetingResult['tone'] = 'friendly';

    // Long gap (7+ days)
    if (daysSince >= 7) {
      return this.generateLongGapGreeting(context, level);
    }

    // Recent return (1-6 days)
    if (daysSince >= 1) {
      return this.generateRecentReturnGreeting(context, level);
    }

    // Same day return
    return this.generateSameDayGreeting(context, level);
  }

  /**
   * Long gap return (7+ days) (Original method)
   */
  private generateLongGapGreeting(context: GreetingContext, level: number): GreetingResult {
    const name = context.userName || 'friend';
    const timeGreet = this.getTimeGreeting(context.timeOfDay);
    let greeting = '';
    let tone: GreetingResult['tone'] = 'friendly';

    if (level === 1) {
      greeting = `${timeGreet} ${name}! Welcome back. How can I assist you today?`;
      tone = 'friendly';
    } else if (level === 2) {
      if (context.gender === 'male') {
        greeting = `Ayee ${name}! ${timeGreet}! Long time no see, bro! What brings you back today?`;
        tone = 'casual';
      } else {
        greeting = `${timeGreet} ${name}! I've missed our chats! How have you been?`;
        tone = 'caring';
      }
    } else if (level === 3) {
      if (context.gender === 'male') {
        greeting = `YOOO ${name}! ${timeGreet} legend! Been a minute! Life keeping you busy? Let's catch up!`;
        tone = 'playful';
      } else {
        greeting = `${timeGreet} lovely ${name}! ✨ It's been too long! I've been thinking about you. How's life treating you?`;
        tone = 'caring';
      }
    } else {
      if (context.gender === 'male') {
        greeting = `BRO! ${name}! ${timeGreet}! Where have you BEEN?! I was starting to miss our epic convos! Everything good on your end? 🤜🤛`;
        tone = 'playful';
      } else {
        greeting = `Oh ${name}! ${timeGreet} sunshine! 🌸 You're back! I've been wondering how you've been. Life must have been keeping you beautifully busy. Tell me everything!`;
        tone = 'poetic';
      }
    }

    return { greeting, tone, shouldAddEmoji: level >= 2 };
  }

  /**
   * Recent return (1-6 days) (Original method)
   */
  private generateRecentReturnGreeting(context: GreetingContext, level: number): GreetingResult {
    const name = context.userName || 'friend';
    const timeGreet = this.getTimeGreeting(context.timeOfDay);
    let greeting = '';
    let tone: GreetingResult['tone'] = 'friendly';

    if (level === 1) {
      greeting = `${timeGreet} ${name}! Good to see you again.`;
      tone = 'friendly';
    } else if (level === 2) {
      if (context.gender === 'male') {
        greeting = `Hey ${name}! ${timeGreet}! Good to have you back, buddy!`;
        tone = 'casual';
      } else {
        greeting = `${timeGreet} ${name}! So nice to see you again! 💫`;
        tone = 'caring';
      }
    } else if (level === 3) {
      if (context.gender === 'male') {
        greeting = `Yo ${name}! ${timeGreet} champ! Back for more awesomeness? Let's do this!`;
        tone = 'playful';
      } else {
        greeting = `${timeGreet} sweet ${name}! Welcome back to our little corner! Ready to create something wonderful? ✨`;
        tone = 'caring';
      }
    } else {
      if (context.gender === 'male') {
        greeting = `Ayeee ${name}! ${timeGreet} king! Back in action! What's the mission today? 🎯`;
        tone = 'playful';
      } else {
        greeting = `${timeGreet} dear ${name}! 🌺 Your presence lights up my day! Ready to make today magical together?`;
        tone = 'poetic';
      }
    }

    return { greeting, tone, shouldAddEmoji: level >= 2 };
  }

  /**
   * Same day return (Original method)
   */
  private generateSameDayGreeting(context: GreetingContext, level: number): GreetingResult {
    const name = context.userName || 'friend';
    let greeting = '';
    let tone: GreetingResult['tone'] = 'friendly';

    if (level === 1) {
      greeting = `Hello again ${name}!`;
      tone = 'friendly';
    } else if (level === 2) {
      if (context.gender === 'male') {
        greeting = `Back already, ${name}? Let's continue!`;
        tone = 'casual';
      } else {
        greeting = `Hey again ${name}! What else can we work on?`;
        tone = 'friendly';
      }
    } else if (level === 3) {
      if (context.gender === 'male') {
        greeting = `Back for round 2, ${name}? Love the energy! What's next?`;
        tone = 'playful';
      } else {
        greeting = `Back again ${name}! I love your dedication! Let's keep going! 💪`;
        tone = 'caring';
      }
    } else {
      if (context.gender === 'male') {
        greeting = `Can't stay away huh, ${name}? 😄 That's the spirit! What's cooking?`;
        tone = 'playful';
      } else {
        greeting = `You're on a roll today ${name}! 🌟 I'm loving this energy! What's inspiring you?`;
        tone = 'poetic';
      }
    }

    return { greeting, tone, shouldAddEmoji: level >= 3 };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get companionship level based on plan (Original method)
   */
  private getCompanionshipLevel(plan: PlanType): number {
    switch (plan) {
      case PlanType.STARTER:
        return 1; // Basic
      case PlanType.PLUS:
        return 2; // Friendly
      case PlanType.PRO:
        return 3; // Caring
      case PlanType.EDGE:
      case PlanType.LIFE:
        return 4; // Bestie
      default:
        return 1;
    }
  }

  /**
   * Get time-based greeting (Original method)
   */
  private getTimeGreeting(timeOfDay: string): string {
    switch (timeOfDay) {
      case 'morning':
        return 'Good morning';
      case 'afternoon':
        return 'Good afternoon';
      case 'evening':
        return 'Good evening';
      case 'night':
        return 'Hey there';
      default:
        return 'Hello';
    }
  }

  /**
   * Determine time of day from hour (Original method)
   */
  getTimeOfDay(hour?: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    const currentHour = hour ?? new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 17) return 'afternoon';
    if (currentHour >= 17 && currentHour < 22) return 'evening';
    return 'night';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const greetingService = new GreetingService();
