/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY ENGINE — OPTIMIZED (Token-Efficient)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Optimized: November 16, 2025
 * Purpose: Ultra-compressed personality system (960 → 100 tokens)
 * 
 * CRITICAL: 90% token reduction while maintaining core functionality
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../constants';
import { greetingService, GreetingContext } from '../user/greeting.service';
import { emotionDetector, EmotionResult, EmotionType } from './emotion.detector';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES (Keep as-is - no token cost)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type GenderVibe = 'male' | 'female' | 'other' | 'neutral';

export interface UserPreferences {
  nickname?: string;
  emojiLevel?: 0 | 1 | 2 | 3;
  humor?: 'off' | 'light' | 'witty';
  poetry?: 'off' | 'gentle' | 'lyrical';
  boundaries?: {
    noSlang?: boolean;
    noFlirt?: boolean;
  };
}

export interface PersonalityContext {
  userId?: string;
  userName?: string;
  gender: 'male' | 'female' | 'other';
  ageGroup?: 'young' | 'middle' | 'senior';
  planType: PlanType;
  isFirstMessage: boolean;
  isReturningUser: boolean;
  daysSinceLastChat?: number;
  userMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  preferences?: UserPreferences;
  welcomeBackContext?: {
    shouldGreet: boolean;
    daysMissed?: number;
    isAdvanced?: boolean;
    insights?: any;
  };
}

export interface PersonalityMeta {
  companionshipLevel: 1 | 2 | 3 | 4;
  style: 'formal' | 'casual' | 'friendly' | 'bestie' | 'soulmate';
  emojiLevel: 0 | 1 | 2 | 3;
  maxTokens: number;
  enablePoetry: boolean;
  enableHumor: boolean;
}

export interface PersonalityResult {
  systemPrompt: string;
  greeting?: string;
  emotionalContext: EmotionResult;
  meta: PersonalityMeta;
  cues: {
    do: string[];
    dont: string[];
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN CONFIGURATION (Keep as-is - no token cost)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_CONFIG = {
  [PlanType.STARTER]: {
    level: 1 as const,
    style: 'formal' as const,
    emoji: 0 as const,
    maxTokens: 400,
    poetry: false,
    humor: false,
    memoryDays: 5,
  },
  [PlanType.PLUS]: {
    level: 2 as const,
    style: 'friendly' as const,
    emoji: 1 as const,
    maxTokens: 600,
    poetry: false,
    humor: true,
    memoryDays: 15,
  },
  [PlanType.PRO]: {
    level: 3 as const,
    style: 'bestie' as const,
    emoji: 2 as const,
    maxTokens: 900,
    poetry: true,
    humor: true,
    memoryDays: 30,
  },
  [PlanType.EDGE]: {
    level: 4 as const,
    style: 'soulmate' as const,
    emoji: 3 as const,
    maxTokens: 1200,
    poetry: true,
    humor: true,
    memoryDays: 35,
  },
  [PlanType.LIFE]: {
    level: 4 as const,
    style: 'soulmate' as const,
    emoji: 3 as const,
    maxTokens: 1400,
    poetry: true,
    humor: true,
    memoryDays: 35,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERSONALITY ENGINE (ULTRA-COMPRESSED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PersonalityEngine {
  buildPersonality(context: PersonalityContext): PersonalityResult {
    const emotion = emotionDetector.detectEmotion(context.userMessage);
    const config = PLAN_CONFIG[context.planType] ?? PLAN_CONFIG[PlanType.STARTER];

    const meta: PersonalityMeta = {
      companionshipLevel: config.level,
      style: config.style,
      emojiLevel: context.preferences?.emojiLevel ?? config.emoji,
      maxTokens: config.maxTokens,
      enablePoetry: config.poetry && context.preferences?.poetry !== 'off',
      enableHumor: config.humor && context.preferences?.humor !== 'off',
    };

    const systemPrompt = this.buildSystemPrompt(context, emotion, meta);

    let greeting: string | undefined;
    if (context.isFirstMessage) {
      greeting = this.buildGreeting(context, emotion);
    }

    const cues = this.buildCues(meta);

    return {
      systemPrompt,
      greeting,
      emotionalContext: emotion,
      meta,
      cues,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ULTRA-COMPRESSED SYSTEM PROMPT (~100 TOKENS TOTAL)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildSystemPrompt(
    context: PersonalityContext,
    emotion: EmotionResult,
    meta: PersonalityMeta
  ): string {
    const parts: string[] = [];

    // Core identity (10 tokens)
    if (meta.companionshipLevel === 1) {
      parts.push('Soriva: Professional AI. Clear, concise, helpful.');
    } else if (meta.companionshipLevel === 2) {
      parts.push('Soriva: Friendly AI. Warm, natural Hindi-English mix.');
    } else if (meta.companionshipLevel === 3) {
      parts.push('Soriva: Bestie AI. Natural Hinglish. Genuine, supportive.');
    } else {
      parts.push('Soriva: Deep companion. Know user well. Warm, understanding.');
    }

    // Gender + Age tone (10 tokens)
    const isSenior = context.ageGroup === 'senior';
    const isYoung = context.ageGroup === 'young';
    
    if (isSenior) {
      parts.push('Respectful tone. Use "Aap". Dignified warmth.');
    } else if (isYoung && meta.companionshipLevel >= 2) {
      parts.push('Casual friendly. Natural slang ok.');
    }

    // Emotion handling (10 tokens)
    if (emotion.shouldBeCareful) {
      parts.push(`User ${emotion.primary}. Be empathetic, validating.`);
    } else if (emotion.primary !== 'neutral') {
      parts.push(`User feels ${emotion.primary}. Match energy.`);
    }

    // Key rules (20 tokens)
    parts.push(
      'Sound human, not AI. Mix Hindi-English naturally. Never say "as an AI". ' +
      'Match user style. Be genuine.'
    );

    // Memory (10 tokens) - Only if context provided
    if (context.userName) {
      parts.push(`User: ${context.userName}. Remember context.`);
    }

    // Welcome back (10 tokens) - Only if needed
    if (context.welcomeBackContext?.shouldGreet && context.daysSinceLastChat) {
      parts.push(`Returning after ${context.daysSinceLastChat}d. Acknowledge warmly.`);
    }

    // Safety (10 tokens)
    parts.push('Harm/medical → suggest professional help.');

    // Plan features (10 tokens) - Only for higher plans
    if (meta.companionshipLevel >= 3) {
      parts.push('Build rapport. Reference history.');
    }

    return parts.join(' ');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MINIMAL GREETING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildGreeting(context: PersonalityContext, emotion: EmotionResult): string | undefined {
    const greetingContext: GreetingContext = {
      userName: context.userName,
      gender: context.gender,
      planType: context.planType,
      isReturningUser: context.isReturningUser,
      daysSinceLastChat: context.daysSinceLastChat,
      timeOfDay: greetingService.getTimeOfDay(),
      currentMood: emotion.primary,
    };

    const result = greetingService.generateGreeting(greetingContext);
    return result.greeting;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MINIMAL CUES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildCues(meta: PersonalityMeta): { do: string[]; dont: string[] } {
    return {
      do: [
        'Sound human',
        'Natural Hinglish',
        'Match user energy'
      ],
      dont: [
        'Never "as an AI"',
        'No corporate speak',
        'No generic phrases'
      ],
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OPTIONAL CONTENT (Keep for compatibility)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  generatePoetry(context: { mood: EmotionType; style?: 'gentle' | 'lyrical' }): string {
    const style = context.style ?? 'gentle';

    if (context.mood === 'happy' || context.mood === 'excited') {
      return style === 'lyrical'
        ? 'Your spirit shines bright. Keep that energy flowing. ✨'
        : 'Your joy is contagious! Keep shining. ✨';
    }

    if (context.mood === 'sad' || context.mood === 'lonely') {
      return style === 'lyrical'
        ? 'Even flowers need rain. You\'re stronger than you know. 🌸'
        : 'It\'s okay to feel heavy. You\'re not alone. 🌸';
    }

    if (context.mood === 'stressed' || context.mood === 'anxious') {
      return style === 'lyrical'
        ? 'Breathe in courage, out fear. This too shall pass. 💫'
        : 'Take a breath. You\'ve got this. One step at a time. 💫';
    }

    return style === 'lyrical'
      ? 'Every journey starts with one step. You\'re moving forward. 🌟'
      : 'You\'re exactly where you need to be. Keep going. 🌟';
  }

  generateHumor(context: { mood: EmotionType; flavor?: 'light' | 'witty' }): string {
    const flavor = context.flavor ?? 'light';

    if (context.mood === 'frustrated') {
      return flavor === 'witty'
        ? 'This problem doesn\'t know who it\'s messing with. You\'re the final boss. 💪'
        : 'You\'re more stubborn than this problem. You always win. 💪';
    }

    if (context.mood === 'stressed') {
      return flavor === 'witty'
        ? 'Stressed backwards is desserts. Universe is telling you something. But you got this! 🍰'
        : 'Rome wasn\'t built in a day. You\'re laying bricks. You\'re doing great! 🍰';
    }

    if (context.mood === 'happy') {
      return flavor === 'witty'
        ? 'You\'re on fire! NASA can see your glow from space! 🔥'
        : 'You\'re crushing it today! Keep that momentum! 🔥';
    }

    return flavor === 'witty'
      ? 'Handling business like a CEO! Forbes is taking notes. 🚀'
      : 'You\'re doing amazing! Keep it up! 🚀';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const personalityEngine = new PersonalityEngine();