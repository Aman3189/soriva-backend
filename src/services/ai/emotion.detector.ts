/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA EMOTION DETECTOR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: October 14, 2025
 * Purpose: Real-time emotion & mood analysis from user messages
 *
 * Features:
 * - Multi-emotion detection (12 emotions)
 * - Sentiment analysis (positive/negative/neutral)
 * - Intensity scoring (0-1)
 * - Confidence scoring
 * - Response tone suggestions
 * - Context-aware detection
 * - Emoji & punctuation analysis
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type EmotionType =
  | 'happy'
  | 'excited'
  | 'grateful'
  | 'calm'
  | 'neutral'
  | 'confused'
  | 'frustrated'
  | 'sad'
  | 'anxious'
  | 'angry'
  | 'stressed'
  | 'lonely';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface EmotionResult {
  primary: EmotionType;
  secondary?: EmotionType;
  sentiment: SentimentType;
  intensity: number; // 0-1 (0=mild, 1=strong)
  confidence: number; // 0-1 (0=uncertain, 1=very confident)
  suggestedTone: 'supportive' | 'cheerful' | 'empathetic' | 'calm' | 'playful' | 'neutral';
  shouldBeCareful: boolean; // True for sensitive emotions (sad, anxious, angry)
  triggers: string[]; // Words/phrases that triggered detection
}

export interface MoodTrend {
  current: EmotionType;
  trend: 'improving' | 'stable' | 'declining';
  recentEmotions: EmotionType[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMOTION PATTERNS (Keywords & Emojis)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface EmotionPattern {
  keywords: string[];
  emojis: string[];
  weight: number; // Higher weight = stronger indicator
}

const EMOTION_PATTERNS: Record<EmotionType, EmotionPattern> = {
  happy: {
    keywords: [
      'happy',
      'great',
      'awesome',
      'amazing',
      'wonderful',
      'fantastic',
      'excellent',
      'perfect',
      'love',
      'good',
      'nice',
      'glad',
      'pleased',
      'delighted',
      'cheerful',
      'joyful',
      'yay',
      'yayy',
      'woohoo',
      'yes',
    ],
    emojis: ['😊', '😄', '😃', '🙂', '😁', '🤗', '☺️', '💖', '❤️', '💕'],
    weight: 1.0,
  },

  excited: {
    keywords: [
      'excited',
      'omg',
      'wow',
      'amazing',
      'cant wait',
      "can't wait",
      'pumped',
      'thrilled',
      'psyched',
      'stoked',
      'yayyy',
      'yessss',
      'awesome',
      'incredible',
      'finally',
      'letsgo',
      "let's go",
    ],
    emojis: ['🎉', '🥳', '🤩', '😍', '🔥', '⚡', '🚀', '💪', '✨', '🌟'],
    weight: 1.2,
  },

  grateful: {
    keywords: [
      'thank',
      'thanks',
      'grateful',
      'appreciate',
      'thankful',
      'blessed',
      'gratitude',
      'tysm',
      'ty',
      'thx',
      'amazing',
      'helpful',
      'kind',
    ],
    emojis: ['🙏', '💝', '🌸', '🌺', '💐', '🎁'],
    weight: 1.1,
  },

  calm: {
    keywords: [
      'calm',
      'peaceful',
      'relaxed',
      'chill',
      'serene',
      'tranquil',
      'okay',
      'fine',
      'alright',
      'cool',
      'good',
      'better',
      'settled',
    ],
    emojis: ['😌', '🧘', '☮️', '🕊️', '🍃', '🌊'],
    weight: 0.8,
  },

  neutral: {
    keywords: [
      'okay',
      'ok',
      'fine',
      'alright',
      'normal',
      'usual',
      'regular',
      'just',
      'need',
      'want',
      'can you',
      'help',
      'question',
    ],
    emojis: ['😐', '😶', '🤷', '👍'],
    weight: 0.5,
  },

  confused: {
    keywords: [
      'confused',
      'dont understand',
      "don't understand",
      'unclear',
      'lost',
      'what',
      'how',
      'why',
      'huh',
      'wait',
      'dunno',
      "don't know",
      'puzzled',
      'baffled',
      'stuck',
      'hmm',
      'unsure',
    ],
    emojis: ['😕', '🤔', '😵', '🤷', '❓', '❔'],
    weight: 0.9,
  },

  frustrated: {
    keywords: [
      'frustrated',
      'annoying',
      'annoyed',
      'irritated',
      'ugh',
      'argh',
      'difficult',
      'hard',
      'cant',
      "can't",
      'not working',
      'broken',
      'stuck',
      'tried',
      'still',
      'again',
      'keeps',
      'ughhh',
    ],
    emojis: ['😤', '😠', '😡', '💢', '🤬', '😖', '😣'],
    weight: 1.0,
  },

  sad: {
    keywords: [
      'sad',
      'unhappy',
      'down',
      'depressed',
      'upset',
      'hurt',
      'pain',
      'crying',
      'cry',
      'tears',
      'heartbroken',
      'blue',
      'miserable',
      'disappointed',
      'let down',
      'failed',
      'failure',
      'lost',
    ],
    emojis: ['😢', '😭', '😔', '☹️', '🥺', '💔', '😞', '😿'],
    weight: 1.3,
  },

  anxious: {
    keywords: [
      'anxious',
      'worried',
      'nervous',
      'scared',
      'afraid',
      'fear',
      'panic',
      'stress',
      'stressed',
      'overwhelmed',
      'tense',
      'uneasy',
      'concerned',
      'freaking out',
      'freaked',
      'paranoid',
    ],
    emojis: ['😰', '😨', '😱', '😓', '🥶', '😬', '😟'],
    weight: 1.2,
  },

  angry: {
    keywords: [
      'angry',
      'mad',
      'furious',
      'rage',
      'hate',
      'pissed',
      'livid',
      'outraged',
      'enraged',
      'fed up',
      'sick of',
      'done',
      'enough',
      'terrible',
      'worst',
      'horrible',
      'disgusting',
    ],
    emojis: ['😡', '🤬', '😠', '👿', '💢', '🔥'],
    weight: 1.4,
  },

  stressed: {
    keywords: [
      'stressed',
      'stress',
      'pressure',
      'overwhelmed',
      'too much',
      'exhausted',
      'tired',
      'burnt out',
      'burnout',
      'cant handle',
      'deadline',
      'urgent',
      'busy',
      'swamped',
      'drowning',
    ],
    emojis: ['😫', '😩', '😣', '😖', '🤯', '😵'],
    weight: 1.1,
  },

  lonely: {
    keywords: [
      'lonely',
      'alone',
      'isolated',
      'nobody',
      'no one',
      'empty',
      'miss',
      'missing',
      'loneliness',
      'abandoned',
      'left out',
      'friendless',
      'solitary',
      'disconnected',
    ],
    emojis: ['😔', '😞', '🥀', '🌧️', '💔'],
    weight: 1.2,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMOTION DETECTOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class EmotionDetector {
  private static instance: EmotionDetector;
    public static getInstance(): EmotionDetector {
    if (!EmotionDetector.instance) {
      EmotionDetector.instance = new EmotionDetector();
    }
    return EmotionDetector.instance;
  }


  /**
   * Detect emotion from a message
   */
  detectEmotion(message: string): EmotionResult {
    const lowerMessage = message.toLowerCase();
    const scores: Record<EmotionType, number> = {} as any;
    const triggers: Record<EmotionType, string[]> = {} as any;

    // Initialize scores
    Object.keys(EMOTION_PATTERNS).forEach((emotion) => {
      scores[emotion as EmotionType] = 0;
      triggers[emotion as EmotionType] = [];
    });

    // Analyze keywords
    Object.entries(EMOTION_PATTERNS).forEach(([emotion, pattern]) => {
      pattern.keywords.forEach((keyword) => {
        if (lowerMessage.includes(keyword)) {
          scores[emotion as EmotionType] += pattern.weight;
          triggers[emotion as EmotionType].push(keyword);
        }
      });
    });

    // Analyze emojis
    Object.entries(EMOTION_PATTERNS).forEach(([emotion, pattern]) => {
      pattern.emojis.forEach((emoji) => {
        if (message.includes(emoji)) {
          scores[emotion as EmotionType] += pattern.weight * 1.5; // Emojis are stronger indicators
          triggers[emotion as EmotionType].push(emoji);
        }
      });
    });

    // Analyze punctuation intensity
    const exclamationCount = (message.match(/!/g) || []).length;
    const questionCount = (message.match(/\?/g) || []).length;
    const capsRatio = this.getCapsRatio(message);

    // Boost excited/angry if lots of exclamations or caps
    if (exclamationCount >= 2 || capsRatio > 0.5) {
      scores.excited += 0.5;
      scores.angry += 0.3;
    }

    // Boost confused if multiple questions
    if (questionCount >= 2) {
      scores.confused += 0.5;
    }

    // Find top 2 emotions
    const sortedEmotions = (Object.entries(scores) as [EmotionType, number][]).sort(
      ([, a], [, b]) => b - a
    );

    const [primaryEmotion, primaryScore] = sortedEmotions[0];
    const [secondaryEmotion, secondaryScore] = sortedEmotions[1];

    // Calculate intensity (normalized 0-1)
    const maxPossibleScore = 5; // Rough estimate
    const intensity = Math.min(primaryScore / maxPossibleScore, 1);

    // Calculate confidence
    const confidence = this.calculateConfidence(
      primaryScore,
      secondaryScore,
      triggers[primaryEmotion].length
    );

    // Determine sentiment
    const sentiment = this.determineSentiment(primaryEmotion);

    // Suggest response tone
    const suggestedTone = this.suggestTone(primaryEmotion, intensity);

    // Check if should be careful
    const shouldBeCareful = ['sad', 'anxious', 'angry', 'lonely', 'stressed'].includes(
      primaryEmotion
    );

    return {
      primary: primaryEmotion,
      secondary: secondaryScore > 0 ? secondaryEmotion : undefined,
      sentiment,
      intensity,
      confidence,
      suggestedTone,
      shouldBeCareful,
      triggers: triggers[primaryEmotion],
    };
  }

  /**
   * Analyze mood trend from recent emotions
   */
  analyzeMoodTrend(recentEmotions: EmotionType[]): MoodTrend {
    if (recentEmotions.length === 0) {
      return {
        current: 'neutral',
        trend: 'stable',
        recentEmotions: [],
      };
    }

    const current = recentEmotions[recentEmotions.length - 1];

    // Analyze trend (simplified)
    const emotionScores = recentEmotions.map((e) => this.getEmotionScore(e));
    const trend = this.calculateTrend(emotionScores);

    return {
      current,
      trend,
      recentEmotions: recentEmotions.slice(-5), // Last 5 emotions
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate caps ratio (for intensity)
   */
  private getCapsRatio(message: string): number {
    const letters = message.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0;

    const capsCount = (message.match(/[A-Z]/g) || []).length;
    return capsCount / letters.length;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    primaryScore: number,
    secondaryScore: number,
    triggerCount: number
  ): number {
    // High confidence if:
    // 1. Primary score much higher than secondary
    // 2. Multiple triggers found

    const scoreDiff = primaryScore - secondaryScore;
    const diffConfidence = Math.min(scoreDiff / 2, 0.5);
    const triggerConfidence = Math.min(triggerCount * 0.15, 0.5);

    return Math.min(diffConfidence + triggerConfidence, 1);
  }

  /**
   * Determine overall sentiment
   */
  private determineSentiment(emotion: EmotionType): SentimentType {
    const positive: EmotionType[] = ['happy', 'excited', 'grateful', 'calm'];
    const negative: EmotionType[] = ['sad', 'anxious', 'angry', 'stressed', 'lonely', 'frustrated'];

    if (positive.includes(emotion)) return 'positive';
    if (negative.includes(emotion)) return 'negative';
    return 'neutral';
  }

  /**
   * Suggest response tone based on emotion
   */
  private suggestTone(emotion: EmotionType, intensity: number): EmotionResult['suggestedTone'] {
    switch (emotion) {
      case 'happy':
      case 'excited':
      case 'grateful':
        return 'cheerful';

      case 'sad':
      case 'lonely':
        return 'empathetic';

      case 'anxious':
      case 'stressed':
        return 'calm';

      case 'angry':
      case 'frustrated':
        return intensity > 0.7 ? 'calm' : 'supportive';

      case 'confused':
        return 'supportive';

      case 'calm':
        return 'playful';

      default:
        return 'neutral';
    }
  }

  /**
   * Get numeric score for emotion (for trend analysis)
   */
  private getEmotionScore(emotion: EmotionType): number {
    const scores: Record<EmotionType, number> = {
      happy: 8,
      excited: 9,
      grateful: 8,
      calm: 6,
      neutral: 5,
      confused: 4,
      frustrated: 3,
      stressed: 3,
      sad: 2,
      anxious: 2,
      angry: 1,
      lonely: 2,
    };

    return scores[emotion] || 5;
  }

  /**
   * Calculate trend from scores
   */
  private calculateTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
    if (scores.length < 2) return 'stable';

    const recent = scores.slice(-3); // Last 3
    const average = recent.reduce((a, b) => a + b, 0) / recent.length;
    const first = recent[0];
    const last = recent[recent.length - 1];

    const change = last - first;

    if (change > 1) return 'improving';
    if (change < -1) return 'declining';
    return 'stable';
  }

  /**
   * Get emotion description (for display/logs)
   */
  getEmotionDescription(emotion: EmotionType): string {
    const descriptions: Record<EmotionType, string> = {
      happy: 'Happy and content',
      excited: 'Excited and energetic',
      grateful: 'Grateful and appreciative',
      calm: 'Calm and relaxed',
      neutral: 'Neutral',
      confused: 'Confused or uncertain',
      frustrated: 'Frustrated',
      sad: 'Sad or down',
      anxious: 'Anxious or worried',
      angry: 'Angry or upset',
      stressed: 'Stressed or overwhelmed',
      lonely: 'Lonely or isolated',
    };

    return descriptions[emotion];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const emotionDetector = new EmotionDetector();
