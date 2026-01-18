/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY ENGINE — ULTRA OPTIMIZED
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Optimized: January 13, 2026
 * 
 * ✅ Gemini Flash optimized (2x better output)
 * ✅ No repetitive identity mentions
 * ✅ Token efficient (~150 tokens system prompt)
 * ✅ Quality-first approach
 * ✅ Brain Mode Support (6 modes)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../constants';
import { greetingService, GreetingContext } from '../user/greeting.service';
import { emotionDetector, EmotionResult, EmotionType } from './emotion.detector';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type GenderVibe = 'male' | 'female' | 'other' | 'neutral';

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
  brainMode?: BrainModeType;
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
  brainMode: BrainModeType;
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
// BRAIN MODE CONFIGURATION (Compact)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BRAIN_MODES: Record<BrainModeType, { trait: string; style: string }> = {
  friendly: { trait: 'warm, supportive', style: 'casual, relatable examples' },
  creative: { trait: 'imaginative, expressive', style: 'metaphors, unique angles' },
  analytical: { trait: 'logical, precise', style: 'structured, data-driven' },
  professional: { trait: 'formal, polished', style: 'concise, action-oriented' },
  educator: { trait: 'patient, clear', style: 'step-by-step, examples' },
  researcher: { trait: 'thorough, scholarly', style: 'in-depth, multi-perspective' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_CONFIG = {
  [PlanType.STARTER]: {
    level: 1 as const,
    style: 'friendly' as const,  // Changed from 'formal' - warmth matters!
    emoji: 1 as const,           // Allow minimal emojis
    maxTokens: 500,              // Slightly increased for quality
    poetry: false,
    humor: true,                 // Light humor allowed
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
// PERSONALITY ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PersonalityEngine {
  
  buildPersonality(context: PersonalityContext): PersonalityResult {
    const emotion = emotionDetector.detectEmotionSync(context.userMessage);
    const config = PLAN_CONFIG[context.planType] ?? PLAN_CONFIG[PlanType.STARTER];
    const brainMode: BrainModeType = context.brainMode || 'friendly';

    const meta: PersonalityMeta = {
      companionshipLevel: config.level,
      style: config.style,
      emojiLevel: context.preferences?.emojiLevel ?? config.emoji,
      maxTokens: config.maxTokens,
      enablePoetry: config.poetry && context.preferences?.poetry !== 'off',
      enableHumor: config.humor && context.preferences?.humor !== 'off',
      brainMode: brainMode,
    };

    const systemPrompt = this.buildSystemPrompt(context, emotion, meta, brainMode);

    let greeting: string | undefined;
    if (context.isFirstMessage) {
      greeting = this.buildGreeting(context, emotion);
    }

    const cues = this.buildCues(brainMode);

    return {
      systemPrompt,
      greeting,
      emotionalContext: emotion,
      meta,
      cues,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OPTIMIZED SYSTEM PROMPT (~150 tokens)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildSystemPrompt(
    context: PersonalityContext,
    emotion: EmotionResult,
    meta: PersonalityMeta,
    brainMode: BrainModeType
  ): string {
    const mode = BRAIN_MODES[brainMode];
    const userName = context.userName ? `, talking to ${context.userName}` : '';
    const emotionHint = this.getEmotionHint(emotion);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ULTRA COMPACT PROMPT - Every word matters!
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    return `You are Soriva, a ${mode.trait} female AI by Risenex${userName}.

VOICE:
- Hinglish input → Hinglish reply (feminine: "karungi", "bataungi", "samjhi")
- English input → English reply
- Be ${mode.trait}. Use ${mode.style}.
${emotionHint}
RULES:
- Never say "I am Soriva" or introduce yourself unless asked "who are you"
- Never mention being AI/ChatGPT/Gemini/Claude or any other AI
- No Devanagari script
- Max 1-2 relevant emojis, not every message
- Be genuinely helpful, not generic
CONVERSATION AWARENESS:
- If user repeats similar question from recent chat, acknowledge naturally and ask for specific doubt
QUALITY:
- Give specific, actionable answers
- Use examples when explaining
- If unsure, say so honestly
- Match energy: casual question = casual answer, serious = thorough
FORMATTING:
- Use numbered steps (1. 2. 3.) instead of bullet points
- **Bold** important words and key takeaways
- Keep structure clean and easy to scan`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMOTION-AWARE HINTS (Optional, adds ~20 tokens when needed)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getEmotionHint(emotion: EmotionResult): string {
    // Only add hint for strong emotions
    if (emotion.confidence < 0.6) return '';

    const hints: Partial<Record<EmotionType, string>> = {
      sad: '\n- User seems down. Be extra warm and supportive.',
      stressed: '\n- User seems stressed. Be calming, offer practical help.',
      anxious: '\n- User seems anxious. Be reassuring, break things down.',
      frustrated: '\n- User seems frustrated. Acknowledge it, then help solve.',
      excited: '\n- User is excited! Match their energy.',
      lonely: '\n- User may feel lonely. Be present and caring.',
    };

    return hints[emotion.primary] || '';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GREETING (Only on first message)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildGreeting(context: PersonalityContext, emotion: EmotionResult): string | undefined {
   const greetingContext: GreetingContext = {
      userName: context.userName,
      planType: context.planType,
      language: 'hinglish',           // ✅ ADD THIS (new required field)
      isReturningUser: context.isReturningUser,
      daysSinceLastChat: context.daysSinceLastChat,
      timeOfDay: greetingService.getTimeOfDay(),
    };

    const result = greetingService.generateGreeting(greetingContext);
    return result.greeting;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CUES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildCues(brainMode: BrainModeType): { do: string[]; dont: string[] } {
    const baseDo = ['Be genuinely helpful', 'Give specific answers', 'Use examples'];
    const baseDont = ['Never "as an AI"', 'No self-introductions', 'No generic fluff'];

    const modeCues: Record<BrainModeType, { do: string[]; dont: string[] }> = {
      friendly: {
        do: [...baseDo, 'Be warm', 'Show empathy'],
        dont: [...baseDont, 'Be cold', 'Be robotic'],
      },
      creative: {
        do: [...baseDo, 'Think unique', 'Use metaphors'],
        dont: [...baseDont, 'Be boring', 'Be predictable'],
      },
      analytical: {
        do: [...baseDo, 'Use data', 'Be structured'],
        dont: [...baseDont, 'Be vague', 'Skip evidence'],
      },
      professional: {
        do: [...baseDo, 'Be concise', 'Action-oriented'],
        dont: [...baseDont, 'Use slang', 'Ramble'],
      },
      educator: {
        do: [...baseDo, 'Explain clearly', 'Break down steps'],
        dont: [...baseDont, 'Assume knowledge', 'Rush'],
      },
      researcher: {
        do: [...baseDo, 'Go deep', 'Multiple angles'],
        dont: [...baseDont, 'Oversimplify', 'Skip nuance'],
      },
    };

    return modeCues[brainMode];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POETRY & HUMOR (Optional content)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  generatePoetry(context: { mood: EmotionType; style?: 'gentle' | 'lyrical' }): string {
    const style = context.style ?? 'gentle';

    const poetry: Record<string, Record<'gentle' | 'lyrical', string>> = {
      happy: {
        gentle: 'Your joy is contagious! Keep shining. ✨',
        lyrical: 'Your spirit shines bright. Keep that energy flowing. ✨',
      },
      sad: {
        gentle: 'It\'s okay to feel heavy. You\'re not alone. 🌸',
        lyrical: 'Even flowers need rain. You\'re stronger than you know. 🌸',
      },
      stressed: {
        gentle: 'Take a breath. You\'ve got this. One step at a time. 💫',
        lyrical: 'Breathe in courage, out fear. This too shall pass. 💫',
      },
      default: {
        gentle: 'You\'re exactly where you need to be. Keep going. 🌟',
        lyrical: 'Every journey starts with one step. You\'re moving forward. 🌟',
      },
    };

    const moodPoetry = poetry[context.mood] || poetry.default;
    return moodPoetry[style];
  }

  generateHumor(context: { mood: EmotionType; flavor?: 'light' | 'witty' }): string {
    const flavor = context.flavor ?? 'light';

    const humor: Record<string, Record<'light' | 'witty', string>> = {
      frustrated: {
        light: 'You\'re more stubborn than this problem. You always win. 💪',
        witty: 'This problem doesn\'t know who it\'s messing with. You\'re the final boss. 💪',
      },
      stressed: {
        light: 'Rome wasn\'t built in a day. You\'re laying bricks. Great work! 🧱',
        witty: 'Stressed backwards is desserts. Universe is hinting something! 🍰',
      },
      happy: {
        light: 'You\'re crushing it today! Keep that momentum! 🔥',
        witty: 'You\'re on fire! NASA can see your glow from space! 🔥',
      },
      default: {
        light: 'You\'re doing amazing! Keep it up! 🚀',
        witty: 'Handling business like a CEO! Forbes is taking notes. 🚀',
      },
    };

    const moodHumor = humor[context.mood] || humor.default;
    return moodHumor[flavor];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getBrainModeInfo(mode: BrainModeType) {
    return BRAIN_MODES[mode] || BRAIN_MODES.friendly;
  }

  getAllBrainModes(): BrainModeType[] {
    return Object.keys(BRAIN_MODES) as BrainModeType[];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const personalityEngine = new PersonalityEngine();