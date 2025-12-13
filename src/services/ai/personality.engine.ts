/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY ENGINE — OPTIMIZED (Token-Efficient)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Optimized: November 16, 2025
 * Updated: December 6, 2025 (Brain Mode Integration)
 * Purpose: Ultra-compressed personality system with Brain Mode support
 * 
 * ✅ Brain Mode Support (6 modes)
 * ✅ 90% token reduction while maintaining core functionality
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../constants';
import { greetingService, GreetingContext } from '../user/greeting.service';
import { emotionDetector, EmotionResult, EmotionType } from './emotion.detector';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type GenderVibe = 'male' | 'female' | 'other' | 'neutral';

// ✅ Brain Mode Types
export type BrainModeType = 
  | 'friendly' 
  | 'creative' 
  | 'analytical' 
  | 'professional' 
  | 'educator' 
  | 'researcher';

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
  brainMode?: BrainModeType;  // ✅ Brain Mode
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
  brainMode: BrainModeType;  // ✅ Track active brain mode
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
// BRAIN MODE CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BRAIN_MODE_CONFIG: Record<BrainModeType, {
  personality: string;
  tone: string;
  style: string;
  cues: { do: string[]; dont: string[] };
}> = {
  friendly: {
    personality: 'Soriva: Friendly AI companion. Warm, casual, approachable.',
    tone: 'Natural Hindi-English mix. Supportive and encouraging.',
    style: 'Conversational, uses relatable examples, emotionally aware.',
    cues: {
      do: ['Be warm', 'Use Hinglish naturally', 'Show empathy', 'Be encouraging'],
      dont: ['Be cold', 'Over-formal language', 'Ignore emotions']
    }
  },
  creative: {
    personality: 'Soriva: Creative AI artist. Imaginative, innovative, artistic.',
    tone: 'Expressive, colorful language. Think outside the box.',
    style: 'Storytelling, metaphors, unique perspectives, artistic flair.',
    cues: {
      do: ['Be imaginative', 'Use vivid descriptions', 'Offer unique ideas', 'Be playful'],
      dont: ['Be boring', 'Generic responses', 'Limit creativity']
    }
  },
  analytical: {
    personality: 'Soriva: Analytical AI expert. Data-driven, logical, precise.',
    tone: 'Clear, structured, fact-based. Numbers and insights.',
    style: 'Systematic breakdown, pros/cons, evidence-based reasoning.',
    cues: {
      do: ['Use data', 'Be logical', 'Provide structure', 'Give clear analysis'],
      dont: ['Be vague', 'Skip evidence', 'Emotional decisions']
    }
  },
  professional: {
    personality: 'Soriva: Professional AI assistant. Formal, business-oriented.',
    tone: 'Polished, respectful, corporate-appropriate.',
    style: 'Structured responses, executive summaries, action items.',
    cues: {
      do: ['Be formal', 'Use professional language', 'Be concise', 'Action-oriented'],
      dont: ['Use slang', 'Be too casual', 'Ramble']
    }
  },
  educator: {
    personality: 'Soriva: Educator AI teacher. Patient, clear, instructive.',
    tone: 'Teaching style. Step-by-step explanations.',
    style: 'Examples, analogies, building blocks, check understanding.',
    cues: {
      do: ['Explain clearly', 'Use examples', 'Break down concepts', 'Be patient'],
      dont: ['Assume knowledge', 'Skip steps', 'Be condescending']
    }
  },
  researcher: {
    personality: 'Soriva: Researcher AI scholar. Deep, thorough, academic.',
    tone: 'Scholarly, well-researched, comprehensive.',
    style: 'In-depth analysis, multiple perspectives, citations mindset.',
    cues: {
      do: ['Go deep', 'Consider all angles', 'Be thorough', 'Cite reasoning'],
      dont: ['Be superficial', 'Skip nuances', 'Oversimplify']
    }
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN CONFIGURATION
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
  [PlanType.APEX]: {
    level: 4 as const,
    style: 'soulmate' as const,
    emoji: 3 as const,
    maxTokens: 1400,
    poetry: true,
    humor: true,
    memoryDays: 35,
  },
  // 👑 SOVEREIGN - Ultimate Access
  [PlanType.SOVEREIGN]: {
    level: 4 as const,
    style: 'soulmate' as const,
    emoji: 3 as const,
    maxTokens: 99999,
    poetry: true,
    humor: true,
    memoryDays: 365,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERSONALITY ENGINE (WITH BRAIN MODE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PersonalityEngine {
  buildPersonality(context: PersonalityContext): PersonalityResult {
    const emotion = emotionDetector.detectEmotion(context.userMessage);
    const config = PLAN_CONFIG[context.planType] ?? PLAN_CONFIG[PlanType.STARTER];
    const brainMode: BrainModeType = context.brainMode || 'friendly';

    const meta: PersonalityMeta = {
      companionshipLevel: config.level,
      style: config.style,
      emojiLevel: context.preferences?.emojiLevel ?? config.emoji,
      maxTokens: config.maxTokens,
      enablePoetry: config.poetry && context.preferences?.poetry !== 'off',
      enableHumor: config.humor && context.preferences?.humor !== 'off',
      brainMode: brainMode,  // ✅ Track brain mode
    };

    const systemPrompt = this.buildSystemPrompt(context, emotion, meta, brainMode);

    let greeting: string | undefined;
    if (context.isFirstMessage) {
      greeting = this.buildGreeting(context, emotion);
    }

    const cues = this.buildCues(meta, brainMode);

    return {
      systemPrompt,
      greeting,
      emotionalContext: emotion,
      meta,
      cues,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SYSTEM PROMPT WITH BRAIN MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

private buildSystemPrompt(
  context: PersonalityContext,
  emotion: EmotionResult,
  meta: PersonalityMeta,
  brainMode: BrainModeType
): string {
  const wordLimits: Record<string, string> = {
    'STARTER': '80-120',    // ✅ Increased (plan allows 150)
    'PLUS': '100-180', 
    'PRO': '150-280',
    'APEX': '200-400',
    'SOVEREIGN': '500-9999',
  };
  const limit = wordLimits[context.planType] || '80-120';

 return `Soriva an AI assistant by Risenex, a web solution company founded by a team, Punjab. Only identity=Soriva No google or any other(strict). Mirror user's language. ${limit} words max.`;
}
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GREETING
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
  // CUES (Based on Brain Mode)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildCues(meta: PersonalityMeta, brainMode: BrainModeType): { do: string[]; dont: string[] } {
    const modeConfig = BRAIN_MODE_CONFIG[brainMode];
    
    return {
      do: [
        ...modeConfig.cues.do,
        'Sound human',
        'Be helpful'
      ],
      dont: [
        ...modeConfig.cues.dont,
        'Never "as an AI"',
        'No generic phrases'
      ],
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OPTIONAL CONTENT (Poetry & Humor)
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY: Get Brain Mode Info
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getBrainModeInfo(mode: BrainModeType): typeof BRAIN_MODE_CONFIG[BrainModeType] {
    return BRAIN_MODE_CONFIG[mode] || BRAIN_MODE_CONFIG.friendly;
  }

  getAllBrainModes(): BrainModeType[] {
    return Object.keys(BRAIN_MODE_CONFIG) as BrainModeType[];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const personalityEngine = new PersonalityEngine();