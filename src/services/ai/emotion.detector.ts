/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA EMOTION DETECTOR v3.0 - HYBRID INTELLIGENCE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Version: 3.0 (January 2026)
 * 
 * APPROACH:
 * - Static Layer: High-confidence signals (emojis, punctuation, obvious phrases)
 * - Dynamic Layer: LLM analyzes ambiguous/complex cases
 * - Hybrid: Combines both for accurate emotion detection
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type EmotionType =
  | 'happy' | 'excited' | 'grateful' | 'proud' | 'hopeful'
  | 'calm' | 'neutral' | 'curious'
  | 'confused' | 'frustrated' | 'sad' | 'anxious'
  | 'angry' | 'stressed' | 'lonely';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export type ResponseTone = 
  | 'supportive' | 'cheerful' | 'empathetic' | 'calm' 
  | 'playful' | 'neutral' | 'encouraging' | 'gentle';

export interface EmotionResult {
  primary: EmotionType;
  secondary?: EmotionType;
  sentiment: SentimentType;
  intensity: number;          // 0-1
  confidence: number;         // 0-1
  suggestedTone: ResponseTone;
  shouldBeCareful: boolean;
  detectionMethod: 'static' | 'dynamic' | 'hybrid';
  triggers: string[];
}

export interface StaticSignal {
  emotion: EmotionType;
  confidence: number;
  trigger: string;
}

export interface LLMEmotionRequest {
  message: string;
  staticHints: StaticSignal[];
  conversationContext?: string;
}

export interface LLMEmotionResponse {
  emotion: EmotionType;
  confidence: number;
  reasoning: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC PATTERNS (Only HIGH CONFIDENCE signals)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Emojis are CLEAR indicators - no ambiguity
const EMOJI_EMOTIONS: Record<string, { emotion: EmotionType; confidence: number }> = {
  // Happy / Positive
  '😊': { emotion: 'happy', confidence: 0.9 },
  '😄': { emotion: 'happy', confidence: 0.9 },
  '😃': { emotion: 'happy', confidence: 0.85 },
  '🥰': { emotion: 'happy', confidence: 0.9 },
  '😁': { emotion: 'happy', confidence: 0.85 },
  
  // Excited
  '🎉': { emotion: 'excited', confidence: 0.95 },
  '🥳': { emotion: 'excited', confidence: 0.95 },
  '🤩': { emotion: 'excited', confidence: 0.9 },
  '🚀': { emotion: 'excited', confidence: 0.8 },
  '🔥': { emotion: 'excited', confidence: 0.75 },
  '⚡': { emotion: 'excited', confidence: 0.75 },
  
  // Grateful
  '🙏': { emotion: 'grateful', confidence: 0.9 },
  '💝': { emotion: 'grateful', confidence: 0.85 },
  
  // Sad
  '😢': { emotion: 'sad', confidence: 0.95 },
  '😭': { emotion: 'sad', confidence: 0.95 },
  '😔': { emotion: 'sad', confidence: 0.9 },
  '💔': { emotion: 'sad', confidence: 0.9 },
  '😞': { emotion: 'sad', confidence: 0.85 },
  '🥺': { emotion: 'sad', confidence: 0.8 },
  
  // Angry
  '😡': { emotion: 'angry', confidence: 0.95 },
  '🤬': { emotion: 'angry', confidence: 0.95 },
  '😠': { emotion: 'angry', confidence: 0.9 },
  '💢': { emotion: 'angry', confidence: 0.85 },
  
  // Anxious / Stressed
  '😰': { emotion: 'anxious', confidence: 0.9 },
  '😨': { emotion: 'anxious', confidence: 0.9 },
  '😱': { emotion: 'anxious', confidence: 0.85 },
  '😫': { emotion: 'stressed', confidence: 0.85 },
  '🤯': { emotion: 'stressed', confidence: 0.8 },
  
  // Confused
  '😕': { emotion: 'confused', confidence: 0.85 },
  '🤔': { emotion: 'curious', confidence: 0.8 },
  '😵': { emotion: 'confused', confidence: 0.8 },
  
  // Frustrated
  '😤': { emotion: 'frustrated', confidence: 0.85 },
  '😖': { emotion: 'frustrated', confidence: 0.8 },
  
  // Calm
  '😌': { emotion: 'calm', confidence: 0.85 },
  '🧘': { emotion: 'calm', confidence: 0.9 },
};

// Only EXPLICIT phrases that clearly indicate emotion
const EXPLICIT_PHRASES: Array<{ pattern: RegExp; emotion: EmotionType; confidence: number }> = [
  // Direct statements (user explicitly saying their emotion)
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(happy|great|good)\b/i, emotion: 'happy', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(excited|thrilled|pumped)\b/i, emotion: 'excited', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(sad|down|depressed|low)\b/i, emotion: 'sad', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(angry|mad|furious|pissed)\b/i, emotion: 'angry', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(anxious|worried|nervous|scared)\b/i, emotion: 'anxious', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(stressed|overwhelmed)\b/i, emotion: 'stressed', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(confused|lost)\b/i, emotion: 'confused', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(lonely|alone|isolated)\b/i, emotion: 'lonely', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(grateful|thankful)\b/i, emotion: 'grateful', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(frustrated|irritated|annoyed)\b/i, emotion: 'frustrated', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(calm|peaceful|relaxed)\b/i, emotion: 'calm', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(proud)\b/i, emotion: 'proud', confidence: 0.95 },
  { pattern: /\b(i'?m|i am|feeling|feel)\s+(so\s+)?(hopeful|optimistic)\b/i, emotion: 'hopeful', confidence: 0.95 },
  
  // Hinglish explicit statements
  { pattern: /\b(bahut|bohot|bht)\s+(khush|happy)\b/i, emotion: 'happy', confidence: 0.9 },
  { pattern: /\b(bahut|bohot|bht)\s+(sad|dukhi)\b/i, emotion: 'sad', confidence: 0.9 },
  { pattern: /\b(bahut|bohot|bht)\s+(gussa|angry)\b/i, emotion: 'angry', confidence: 0.9 },
  { pattern: /\b(bahut|bohot|bht)\s+(tension|stressed)\b/i, emotion: 'stressed', confidence: 0.9 },
  
  // Clear gratitude
  { pattern: /\b(thank you so much|thanks a lot|really appreciate)\b/i, emotion: 'grateful', confidence: 0.9 },
  { pattern: /\b(tysm|thank u so much)\b/i, emotion: 'grateful', confidence: 0.85 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMOTION DETECTOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class EmotionDetector {
  private static instance: EmotionDetector;
  private llmCallback?: (request: LLMEmotionRequest) => Promise<LLMEmotionResponse>;
  
  // Confidence threshold - below this, use LLM
  private readonly STATIC_CONFIDENCE_THRESHOLD = 0.75;

  public static getInstance(): EmotionDetector {
    if (!EmotionDetector.instance) {
      EmotionDetector.instance = new EmotionDetector();
    }
    return EmotionDetector.instance;
  }

  /**
   * Register LLM callback for dynamic analysis
   */
  registerLLMCallback(callback: (request: LLMEmotionRequest) => Promise<LLMEmotionResponse>): void {
    this.llmCallback = callback;
  }

  /**
   * Main detection method - Hybrid approach
   */
  async detectEmotion(message: string, conversationContext?: string): Promise<EmotionResult> {
    // Step 1: Get static signals
    const staticSignals = this.analyzeStaticSignals(message);
    const bestStatic = this.getBestStaticSignal(staticSignals);
    
    // Step 2: Check punctuation patterns
    const punctuationHints = this.analyzePunctuation(message);
    
    // Step 3: Decide - Static or LLM?
    if (bestStatic && bestStatic.confidence >= this.STATIC_CONFIDENCE_THRESHOLD) {
      // High confidence static detection
      return this.buildResult(bestStatic.emotion, bestStatic.confidence, 'static', [bestStatic.trigger], punctuationHints);
    }
    
    // Step 4: Low confidence or ambiguous - Use LLM
    if (this.llmCallback) {
      try {
        const llmResponse = await this.llmCallback({
          message,
          staticHints: staticSignals,
          conversationContext
        });
        
        // Hybrid: Combine LLM result with static hints
        const finalConfidence = bestStatic 
          ? (llmResponse.confidence * 0.7 + bestStatic.confidence * 0.3)
          : llmResponse.confidence;
          
        return this.buildResult(
          llmResponse.emotion, 
          finalConfidence, 
          bestStatic ? 'hybrid' : 'dynamic',
          staticSignals.map(s => s.trigger),
          punctuationHints
        );
      } catch (error) {
        // LLM failed, fallback to static or neutral
        console.error('[EmotionDetector] LLM callback failed:', error);
      }
    }
    
    // Fallback: Use best static or neutral
    if (bestStatic) {
      return this.buildResult(bestStatic.emotion, bestStatic.confidence, 'static', [bestStatic.trigger], punctuationHints);
    }
    
    return this.buildResult('neutral', 0.5, 'static', [], punctuationHints);
  }

  /**
   * Synchronous detection (static only, for quick checks)
   */
  detectEmotionSync(message: string): EmotionResult {
    const staticSignals = this.analyzeStaticSignals(message);
    const bestStatic = this.getBestStaticSignal(staticSignals);
    const punctuationHints = this.analyzePunctuation(message);
    
    if (bestStatic) {
      return this.buildResult(bestStatic.emotion, bestStatic.confidence, 'static', [bestStatic.trigger], punctuationHints);
    }
    
    return this.buildResult('neutral', 0.5, 'static', [], punctuationHints);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATIC ANALYSIS METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeStaticSignals(message: string): StaticSignal[] {
    const signals: StaticSignal[] = [];
    
    // Check emojis
    for (const [emoji, data] of Object.entries(EMOJI_EMOTIONS)) {
      if (message.includes(emoji)) {
        signals.push({
          emotion: data.emotion,
          confidence: data.confidence,
          trigger: emoji
        });
      }
    }
    
    // Check explicit phrases
    for (const phrase of EXPLICIT_PHRASES) {
      if (phrase.pattern.test(message)) {
        const match = message.match(phrase.pattern);
        signals.push({
          emotion: phrase.emotion,
          confidence: phrase.confidence,
          trigger: match?.[0] || 'phrase match'
        });
      }
    }
    
    return signals;
  }

  private getBestStaticSignal(signals: StaticSignal[]): StaticSignal | null {
    if (signals.length === 0) return null;
    return signals.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  private analyzePunctuation(message: string): { intensity: number; confused: boolean } {
    const exclamations = (message.match(/!/g) || []).length;
    const questions = (message.match(/\?/g) || []).length;
    const caps = message.replace(/[^A-Z]/g, '').length;
    const letters = message.replace(/[^a-zA-Z]/g, '').length;
    const capsRatio = letters > 0 ? caps / letters : 0;
    
    return {
      intensity: Math.min((exclamations * 0.15) + (capsRatio * 0.5), 1),
      confused: questions >= 2
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESULT BUILDING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildResult(
    emotion: EmotionType,
    confidence: number,
    method: 'static' | 'dynamic' | 'hybrid',
    triggers: string[],
    punctuationHints: { intensity: number; confused: boolean }
  ): EmotionResult {
    return {
      primary: emotion,
      sentiment: this.getSentiment(emotion),
      intensity: Math.max(punctuationHints.intensity, this.getBaseIntensity(emotion)),
      confidence,
      suggestedTone: this.getSuggestedTone(emotion),
      shouldBeCareful: this.isSensitiveEmotion(emotion),
      detectionMethod: method,
      triggers
    };
  }

  private getSentiment(emotion: EmotionType): SentimentType {
    const positive: EmotionType[] = ['happy', 'excited', 'grateful', 'proud', 'hopeful', 'calm'];
    const negative: EmotionType[] = ['sad', 'anxious', 'angry', 'stressed', 'lonely', 'frustrated'];
    
    if (positive.includes(emotion)) return 'positive';
    if (negative.includes(emotion)) return 'negative';
    return 'neutral';
  }

  private getSuggestedTone(emotion: EmotionType): ResponseTone {
    const toneMap: Record<EmotionType, ResponseTone> = {
      happy: 'cheerful',
      excited: 'cheerful',
      grateful: 'cheerful',
      proud: 'encouraging',
      hopeful: 'encouraging',
      calm: 'playful',
      neutral: 'neutral',
      curious: 'supportive',
      confused: 'supportive',
      frustrated: 'calm',
      sad: 'empathetic',
      anxious: 'gentle',
      angry: 'calm',
      stressed: 'gentle',
      lonely: 'empathetic'
    };
    return toneMap[emotion];
  }

  private isSensitiveEmotion(emotion: EmotionType): boolean {
    return ['sad', 'anxious', 'angry', 'stressed', 'lonely'].includes(emotion);
  }

  private getBaseIntensity(emotion: EmotionType): number {
    // Intense emotions have higher base intensity
    const highIntensity: EmotionType[] = ['excited', 'angry', 'anxious'];
    const lowIntensity: EmotionType[] = ['calm', 'neutral'];
    
    if (highIntensity.includes(emotion)) return 0.6;
    if (lowIntensity.includes(emotion)) return 0.3;
    return 0.5;
  }

  /**
   * Get LLM prompt for emotion analysis
   * Use this to generate the prompt for your AI provider
   */
  static getLLMPrompt(message: string, staticHints: StaticSignal[]): string {
    const hintsText = staticHints.length > 0
      ? `\nDetected signals: ${staticHints.map(h => `${h.trigger}→${h.emotion}`).join(', ')}`
      : '';
    
    return `Analyze the emotional tone of this message and respond with ONLY a JSON object.

Message: "${message}"${hintsText}

Consider:
- Sarcasm and irony (positive words with negative intent)
- Cultural context (Hinglish, Indian expressions)
- Implicit emotions (not directly stated)
- Overall sentence tone, not just individual words

Respond with JSON:
{
  "emotion": "happy|excited|grateful|proud|hopeful|calm|neutral|curious|confused|frustrated|sad|anxious|angry|stressed|lonely",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const emotionDetector = EmotionDetector.getInstance();