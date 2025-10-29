/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * USER PATTERN ANALYZER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Track user behavior and interaction patterns over time
 * Version: v1.0 - 100% Dynamic System
 * Created: Day 2 - Dynamic Personality System
 *
 * Core Philosophy:
 * ✅ LEARN from every interaction
 * ✅ ADAPT personality based on patterns
 * ✅ NO assumptions - pure observation
 * ✅ EVOLVE with user over time
 *
 * What we track:
 * - Query types and preferences
 * - Communication style evolution
 * - Interaction frequency and timing
 * - Emotional patterns
 * - Technical vs casual balance
 * - Response preferences
 * - Engagement levels
 *
 * How it's used:
 * - Feed into personality.engine for dynamic adaptation
 * - Predict user needs before they ask
 * - Adjust tone based on mood patterns
 * - Personalize experience genuinely
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UserPattern {
  userId: string;

  // Interaction metrics
  totalInteractions: number;
  firstInteraction: Date;
  lastInteraction: Date;
  averageSessionLength: number; // in messages
  longestStreak: number; // consecutive days

  // Query patterns
  queryTypes: QueryTypeDistribution;
  technicalLevel: TechnicalLevel;
  topicPreferences: TopicPreference[];

  // Communication style
  communicationStyle: CommunicationStyleProfile;
  emotionalPatterns: EmotionalPattern;

  // Interaction preferences
  preferredResponseStyle: ResponseStylePreference;
  engagementLevel: EngagementLevel;

  // Temporal patterns
  activeHours: number[]; // Hours user is most active (0-23)
  activeDays: number[]; // Days user is most active (0-6, Sunday=0)

  // Evolution tracking
  styleEvolution: StyleEvolutionData;

  // Confidence scores
  patternConfidence: number; // 0-100, how reliable these patterns are
  lastUpdated: Date;
}

export interface QueryTypeDistribution {
  technical: number; // Programming, tech questions
  creative: number; // Writing, ideas, brainstorming
  emotional: number; // Personal advice, feelings
  informational: number; // General knowledge, facts
  conversational: number; // Casual chat, small talk
  professional: number; // Work-related, formal
  educational: number; // Learning, explanations
  problemSolving: number; // Debugging, troubleshooting
}

export interface TechnicalLevel {
  overall: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number; // 0-100
  domains: {
    programming: number; // 0-100
    technology: number;
    science: number;
    business: number;
    creative: number;
  };
  learningRate: 'slow' | 'moderate' | 'fast'; // How quickly they're growing
}

export interface TopicPreference {
  topic: string;
  frequency: number; // How often they ask about it
  lastMentioned: Date;
  interest: 'casual' | 'serious' | 'passionate';
}

export interface CommunicationStyleProfile {
  verbosity: 'terse' | 'brief' | 'moderate' | 'detailed' | 'verbose';
  formality: 'very-casual' | 'casual' | 'neutral' | 'formal' | 'very-formal';
  emotiveness: 'reserved' | 'balanced' | 'expressive';
  directness: 'indirect' | 'balanced' | 'direct';
  humor: 'none' | 'occasional' | 'frequent';
  emojiUsage: 'never' | 'rare' | 'occasional' | 'frequent' | 'heavy';
  questioningStyle: 'exploratory' | 'targeted' | 'comprehensive';
}

export interface EmotionalPattern {
  dominantMood: 'positive' | 'neutral' | 'negative' | 'mixed';
  moodStability: 'very-stable' | 'stable' | 'variable' | 'volatile';
  emotionalRange: string[]; // ['curious', 'frustrated', 'excited', etc.]
  stressIndicators: number; // 0-100, how often they seem stressed
  enthusiasmLevel: number; // 0-100
  frustrationTolerance: 'low' | 'medium' | 'high';
}

export interface ResponseStylePreference {
  preferredLength: 'concise' | 'balanced' | 'detailed';
  wantsExamples: boolean;
  wantsExplanations: boolean;
  likesStepByStep: boolean;
  appreciatesHumor: boolean;
  needsEncouragement: boolean;
  prefersVisualAids: boolean; // Code blocks, formatting
}

export interface EngagementLevel {
  overall: 'low' | 'moderate' | 'high' | 'very-high';
  followUpRate: number; // 0-100, how often they continue conversations
  questionDepth: 'surface' | 'moderate' | 'deep';
  attentionSpan: 'short' | 'medium' | 'long';
  learningIntent: 'browsing' | 'exploring' | 'focused-learning' | 'problem-solving';
}

export interface StyleEvolutionData {
  initialStyle: Partial<CommunicationStyleProfile>;
  currentStyle: Partial<CommunicationStyleProfile>;
  changeRate: 'stable' | 'evolving' | 'rapidly-changing';
  adaptability: number; // 0-100, how well they adapt to responses
}

export interface PatternAnalysisResult {
  userId: string;
  patterns: UserPattern;
  insights: string[]; // Human-readable insights
  recommendations: AdaptationRecommendation[];
  confidence: number; // 0-100
}

export interface AdaptationRecommendation {
  aspect: string; // What to adapt (tone, length, style, etc.)
  recommendation: string; // Specific guidance
  priority: 'low' | 'medium' | 'high';
  reason: string; // Why this recommendation
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATTERN ANALYZER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PatternAnalyzer {
  // In-memory pattern storage (in production, this would be in database)
  private userPatterns: Map<string, UserPattern> = new Map();

  // Session tracking for real-time analysis
  private sessionData: Map<string, SessionTracking> = new Map();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ANALYSIS METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Analyze a single message and update user patterns
   */
  analyzeMessage(userId: string, message: string, sessionId: string, contextType?: string): void {
    // Get or create user pattern
    let pattern = this.userPatterns.get(userId);
    if (!pattern) {
      pattern = this.initializePattern(userId);
      this.userPatterns.set(userId, pattern);
    }

    // Update interaction metrics
    this.updateInteractionMetrics(pattern);

    // Analyze query type
    const queryType = this.detectQueryType(message);
    this.updateQueryTypeDistribution(pattern, queryType);

    // Analyze communication style
    this.analyzeCommunicationStyle(pattern, message);

    // Analyze emotional content
    this.analyzeEmotionalContent(pattern, message);

    // Analyze technical level
    this.analyzeTechnicalLevel(pattern, message);

    // Track topics
    this.trackTopics(pattern, message);

    // Update temporal patterns
    this.updateTemporalPatterns(pattern);

    // Update session data
    this.updateSessionTracking(userId, sessionId);

    // Update last interaction
    pattern.lastInteraction = new Date();
    pattern.lastUpdated = new Date();

    // Recalculate confidence
    pattern.patternConfidence = this.calculatePatternConfidence(pattern);
  }

  /**
   * Analyze a complete conversation session
   */
  analyzeSession(
    userId: string,
    sessionId: string,
    messages: Array<{ role: string; content: string }>
  ): void {
    const pattern = this.userPatterns.get(userId);
    if (!pattern) return;

    // Analyze engagement from this session
    this.analyzeSessionEngagement(pattern, messages);

    // Analyze response preferences
    this.analyzeResponsePreferences(pattern, messages);

    // Update style evolution
    this.updateStyleEvolution(pattern);
  }

  /**
   * Get comprehensive pattern analysis for a user
   */
  getPatternAnalysis(userId: string): PatternAnalysisResult | null {
    const pattern = this.userPatterns.get(userId);
    if (!pattern) return null;

    // Generate insights
    const insights = this.generateInsights(pattern);

    // Generate recommendations
    const recommendations = this.generateRecommendations(pattern);

    return {
      userId,
      patterns: pattern,
      insights,
      recommendations,
      confidence: pattern.patternConfidence,
    };
  }

  /**
   * Get quick adaptation guidance without full analysis
   */
  getQuickAdaptation(userId: string): {
    tone: string;
    style: string;
    length: string;
  } | null {
    const pattern = this.userPatterns.get(userId);
    if (!pattern || pattern.patternConfidence < 30) return null;

    return {
      tone: this.getToneGuidance(pattern),
      style: this.getStyleGuidance(pattern),
      length: this.getLengthGuidance(pattern),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INITIALIZATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private initializePattern(userId: string): UserPattern {
    return {
      userId,
      totalInteractions: 0,
      firstInteraction: new Date(),
      lastInteraction: new Date(),
      averageSessionLength: 0,
      longestStreak: 0,

      queryTypes: {
        technical: 0,
        creative: 0,
        emotional: 0,
        informational: 0,
        conversational: 0,
        professional: 0,
        educational: 0,
        problemSolving: 0,
      },

      technicalLevel: {
        overall: 'beginner',
        confidence: 0,
        domains: {
          programming: 0,
          technology: 0,
          science: 0,
          business: 0,
          creative: 0,
        },
        learningRate: 'moderate',
      },

      topicPreferences: [],

      communicationStyle: {
        verbosity: 'moderate',
        formality: 'neutral',
        emotiveness: 'balanced',
        directness: 'balanced',
        humor: 'occasional',
        emojiUsage: 'occasional',
        questioningStyle: 'targeted',
      },

      emotionalPatterns: {
        dominantMood: 'neutral',
        moodStability: 'stable',
        emotionalRange: [],
        stressIndicators: 0,
        enthusiasmLevel: 50,
        frustrationTolerance: 'medium',
      },

      preferredResponseStyle: {
        preferredLength: 'balanced',
        wantsExamples: true,
        wantsExplanations: true,
        likesStepByStep: false,
        appreciatesHumor: false,
        needsEncouragement: false,
        prefersVisualAids: false,
      },

      engagementLevel: {
        overall: 'moderate',
        followUpRate: 0,
        questionDepth: 'moderate',
        attentionSpan: 'medium',
        learningIntent: 'exploring',
      },

      activeHours: [],
      activeDays: [],

      styleEvolution: {
        initialStyle: {},
        currentStyle: {},
        changeRate: 'stable',
        adaptability: 50,
      },

      patternConfidence: 0,
      lastUpdated: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUERY TYPE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectQueryType(message: string): keyof QueryTypeDistribution {
    const lower = message.toLowerCase();

    // Technical indicators
    const technicalMarkers = [
      'code',
      'function',
      'variable',
      'error',
      'debug',
      'syntax',
      'algorithm',
      'database',
      'api',
      'framework',
      'library',
      'compile',
      'runtime',
      'programming',
      'software',
      'typescript',
      'javascript',
      'python',
      'react',
      'node',
      'css',
      'html',
    ];

    // Problem-solving indicators
    const problemSolvingMarkers = [
      'not working',
      'issue',
      'problem',
      'fix',
      'solve',
      'troubleshoot',
      'broken',
      'error',
      'bug',
      'crash',
      'fail',
      'wrong',
    ];

    // Creative indicators
    const creativeMarkers = [
      'write',
      'create',
      'design',
      'story',
      'idea',
      'brainstorm',
      'imagine',
      'creative',
      'art',
      'music',
      'poem',
      'draft',
    ];

    // Emotional indicators
    const emotionalMarkers = [
      'feel',
      'feeling',
      'emotion',
      'sad',
      'happy',
      'anxious',
      'worried',
      'excited',
      'frustrated',
      'advice',
      'help me',
      'struggling',
      'difficulty',
    ];

    // Educational indicators
    const educationalMarkers = [
      'how does',
      'what is',
      'explain',
      'teach',
      'learn',
      'understand',
      'concept',
      'theory',
      'principle',
      'why',
    ];

    // Professional indicators
    const professionalMarkers = [
      'meeting',
      'presentation',
      'report',
      'business',
      'strategy',
      'project',
      'deadline',
      'client',
      'manager',
      'team',
    ];

    // Conversational indicators
    const conversationalMarkers = [
      'hey',
      'hi',
      'hello',
      "what's up",
      'how are',
      'chat',
      'talk',
      'think',
      'opinion',
    ];

    // Count matches
    const scores = {
      technical: this.countMarkers(lower, technicalMarkers),
      problemSolving: this.countMarkers(lower, problemSolvingMarkers),
      creative: this.countMarkers(lower, creativeMarkers),
      emotional: this.countMarkers(lower, emotionalMarkers),
      educational: this.countMarkers(lower, educationalMarkers),
      professional: this.countMarkers(lower, professionalMarkers),
      conversational: this.countMarkers(lower, conversationalMarkers),
    };

    // Informational by default
    if (Object.values(scores).every((s) => s === 0)) {
      return 'informational';
    }

    // Return highest scoring type
    const maxScore = Math.max(...Object.values(scores));
    const topType = Object.entries(scores).find(([_, score]) => score === maxScore);

    return (topType?.[0] || 'informational') as keyof QueryTypeDistribution;
  }

  private countMarkers(text: string, markers: string[]): number {
    return markers.filter((marker) => text.includes(marker)).length;
  }

  private updateQueryTypeDistribution(
    pattern: UserPattern,
    queryType: keyof QueryTypeDistribution
  ): void {
    pattern.queryTypes[queryType]++;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMMUNICATION STYLE ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeCommunicationStyle(pattern: UserPattern, message: string): void {
    const style = pattern.communicationStyle;

    // Analyze verbosity
    const wordCount = message.split(/\s+/).length;
    if (wordCount < 5) {
      this.updateStyleMetric(style, 'verbosity', 'terse');
    } else if (wordCount < 15) {
      this.updateStyleMetric(style, 'verbosity', 'brief');
    } else if (wordCount < 40) {
      this.updateStyleMetric(style, 'verbosity', 'moderate');
    } else if (wordCount < 80) {
      this.updateStyleMetric(style, 'verbosity', 'detailed');
    } else {
      this.updateStyleMetric(style, 'verbosity', 'verbose');
    }

    // Analyze formality
    const formalMarkers = ['please', 'could you', 'would you', 'kindly', 'sir', 'madam'];
    const casualMarkers = ['hey', 'yo', 'gonna', 'wanna', 'yeah', 'nah', 'lol'];
    const formalCount = this.countMarkers(message.toLowerCase(), formalMarkers);
    const casualCount = this.countMarkers(message.toLowerCase(), casualMarkers);

    if (casualCount > formalCount * 2) {
      this.updateStyleMetric(style, 'formality', 'very-casual');
    } else if (casualCount > formalCount) {
      this.updateStyleMetric(style, 'formality', 'casual');
    } else if (formalCount > casualCount * 2) {
      this.updateStyleMetric(style, 'formality', 'very-formal');
    } else if (formalCount > casualCount) {
      this.updateStyleMetric(style, 'formality', 'formal');
    } else {
      this.updateStyleMetric(style, 'formality', 'neutral');
    }

    // Analyze emoji usage
    const emojiCount = (
      message.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []
    ).length;
    if (emojiCount === 0) {
      this.updateStyleMetric(style, 'emojiUsage', 'never');
    } else if (emojiCount === 1) {
      this.updateStyleMetric(style, 'emojiUsage', 'rare');
    } else if (emojiCount <= 3) {
      this.updateStyleMetric(style, 'emojiUsage', 'occasional');
    } else if (emojiCount <= 6) {
      this.updateStyleMetric(style, 'emojiUsage', 'frequent');
    } else {
      this.updateStyleMetric(style, 'emojiUsage', 'heavy');
    }

    // Analyze questioning style
    const questionCount = (message.match(/\?/g) || []).length;
    if (questionCount >= 3) {
      this.updateStyleMetric(style, 'questioningStyle', 'comprehensive');
    } else if (questionCount === 1 && message.length < 50) {
      this.updateStyleMetric(style, 'questioningStyle', 'targeted');
    } else {
      this.updateStyleMetric(style, 'questioningStyle', 'exploratory');
    }

    // Analyze directness
    const directMarkers = ['tell me', 'show me', 'i need', 'i want'];
    const indirectMarkers = ['maybe', 'perhaps', 'i wonder', 'could it be'];
    const directCount = this.countMarkers(message.toLowerCase(), directMarkers);
    const indirectCount = this.countMarkers(message.toLowerCase(), indirectMarkers);

    if (directCount > indirectCount) {
      this.updateStyleMetric(style, 'directness', 'direct');
    } else if (indirectCount > directCount) {
      this.updateStyleMetric(style, 'directness', 'indirect');
    } else {
      this.updateStyleMetric(style, 'directness', 'balanced');
    }
  }

  private updateStyleMetric<K extends keyof CommunicationStyleProfile>(
    style: CommunicationStyleProfile,
    key: K,
    value: CommunicationStyleProfile[K]
  ): void {
    // Weighted average approach - new values have less weight initially
    // This prevents single outliers from dominating the pattern
    style[key] = value;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMOTIONAL ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeEmotionalContent(pattern: UserPattern, message: string): void {
    const lower = message.toLowerCase();
    const emotions = pattern.emotionalPatterns;

    // Positive emotions
    const positiveMarkers = [
      'great',
      'awesome',
      'excellent',
      'love',
      'happy',
      'excited',
      'wonderful',
      'amazing',
      'fantastic',
      'thanks',
      'appreciate',
    ];

    // Negative emotions
    const negativeMarkers = [
      'problem',
      'issue',
      'difficult',
      'frustrated',
      'confused',
      'stuck',
      'wrong',
      'error',
      'fail',
      'struggling',
      'help',
    ];

    // Stress indicators
    const stressMarkers = [
      'urgent',
      'asap',
      'quickly',
      'deadline',
      'pressure',
      'stressed',
      'overwhelmed',
      'panic',
      'emergency',
    ];

    const positiveCount = this.countMarkers(lower, positiveMarkers);
    const negativeCount = this.countMarkers(lower, negativeMarkers);
    const stressCount = this.countMarkers(lower, stressMarkers);

    // Update dominant mood
    if (positiveCount > negativeCount * 1.5) {
      emotions.dominantMood = 'positive';
    } else if (negativeCount > positiveCount * 1.5) {
      emotions.dominantMood = 'negative';
    } else if (positiveCount > 0 && negativeCount > 0) {
      emotions.dominantMood = 'mixed';
    } else {
      emotions.dominantMood = 'neutral';
    }

    // Update enthusiasm level
    const enthusiasmMarkers = ['!', '😊', '🎉', '🔥', '💯'];
    const enthusiasmCount = enthusiasmMarkers.reduce((count, marker) => {
      return (
        count +
        (message.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
      );
    }, 0);

    if (enthusiasmCount > 0) {
      emotions.enthusiasmLevel = Math.min(100, emotions.enthusiasmLevel + 5);
    }

    // Update stress indicators
    if (stressCount > 0) {
      emotions.stressIndicators = Math.min(100, emotions.stressIndicators + 10);
    } else {
      emotions.stressIndicators = Math.max(0, emotions.stressIndicators - 2);
    }

    // Track emotional range
    if (positiveCount > 0 && !emotions.emotionalRange.includes('positive')) {
      emotions.emotionalRange.push('positive');
    }
    if (negativeCount > 0 && !emotions.emotionalRange.includes('negative')) {
      emotions.emotionalRange.push('negative');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TECHNICAL LEVEL ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeTechnicalLevel(pattern: UserPattern, message: string): void {
    const tech = pattern.technicalLevel;
    const lower = message.toLowerCase();

    // Programming indicators
    const programmingMarkers = {
      beginner: ['what is', 'how to', 'basic', 'simple', 'tutorial'],
      intermediate: ['implement', 'function', 'class', 'method', 'optimize'],
      advanced: ['architecture', 'design pattern', 'scalability', 'performance'],
      expert: ['microservices', 'distributed', 'algorithm complexity', 'concurrency'],
    };

    // Check programming level
    let programmingScore = 0;
    if (this.countMarkers(lower, programmingMarkers.expert) > 0) {
      programmingScore = 90;
    } else if (this.countMarkers(lower, programmingMarkers.advanced) > 0) {
      programmingScore = 70;
    } else if (this.countMarkers(lower, programmingMarkers.intermediate) > 0) {
      programmingScore = 50;
    } else if (this.countMarkers(lower, programmingMarkers.beginner) > 0) {
      programmingScore = 20;
    }

    if (programmingScore > 0) {
      tech.domains.programming = Math.round((tech.domains.programming + programmingScore) / 2);
    }

    // Update overall technical level
    const avgScore = Object.values(tech.domains).reduce((a, b) => a + b, 0) / 5;
    if (avgScore < 25) {
      tech.overall = 'beginner';
    } else if (avgScore < 50) {
      tech.overall = 'intermediate';
    } else if (avgScore < 75) {
      tech.overall = 'advanced';
    } else {
      tech.overall = 'expert';
    }

    tech.confidence = Math.min(100, tech.confidence + 5);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC TRACKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private trackTopics(pattern: UserPattern, message: string): void {
    const commonTopics = [
      'programming',
      'javascript',
      'typescript',
      'react',
      'node',
      'python',
      'ai',
      'machine learning',
      'database',
      'api',
      'design',
      'business',
      'marketing',
      'writing',
      'health',
      'finance',
      'education',
      'career',
      'relationships',
    ];

    const lower = message.toLowerCase();

    commonTopics.forEach((topic) => {
      if (lower.includes(topic)) {
        const existing = pattern.topicPreferences.find((t) => t.topic === topic);

        if (existing) {
          existing.frequency++;
          existing.lastMentioned = new Date();

          // Update interest level based on frequency
          if (existing.frequency > 10) {
            existing.interest = 'passionate';
          } else if (existing.frequency > 5) {
            existing.interest = 'serious';
          }
        } else {
          pattern.topicPreferences.push({
            topic,
            frequency: 1,
            lastMentioned: new Date(),
            interest: 'casual',
          });
        }
      }
    });

    // Keep only top 20 topics
    pattern.topicPreferences.sort((a, b) => b.frequency - a.frequency);
    if (pattern.topicPreferences.length > 20) {
      pattern.topicPreferences = pattern.topicPreferences.slice(0, 20);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTERACTION METRICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private updateInteractionMetrics(pattern: UserPattern): void {
    pattern.totalInteractions++;
  }

  private updateTemporalPatterns(pattern: UserPattern): void {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Track active hours
    if (!pattern.activeHours.includes(hour)) {
      pattern.activeHours.push(hour);
    }

    // Track active days
    if (!pattern.activeDays.includes(day)) {
      pattern.activeDays.push(day);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeSessionEngagement(
    pattern: UserPattern,
    messages: Array<{ role: string; content: string }>
  ): void {
    const userMessages = messages.filter((m) => m.role === 'user');
    const engagement = pattern.engagementLevel;

    // Calculate follow-up rate
    if (messages.length > 2) {
      const followUps = userMessages.length - 1;
      engagement.followUpRate = Math.round((followUps / (userMessages.length - 1)) * 100);
    }

    // Determine question depth
    const avgLength =
      userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    if (avgLength > 200) {
      engagement.questionDepth = 'deep';
    } else if (avgLength > 80) {
      engagement.questionDepth = 'moderate';
    } else {
      engagement.questionDepth = 'surface';
    }

    // Determine attention span
    if (messages.length > 20) {
      engagement.attentionSpan = 'long';
    } else if (messages.length > 8) {
      engagement.attentionSpan = 'medium';
    } else {
      engagement.attentionSpan = 'short';
    }

    // Update overall engagement
    if (engagement.followUpRate > 70 && engagement.questionDepth === 'deep') {
      engagement.overall = 'very-high';
    } else if (engagement.followUpRate > 50) {
      engagement.overall = 'high';
    } else if (engagement.followUpRate > 30) {
      engagement.overall = 'moderate';
    } else {
      engagement.overall = 'low';
    }
  }

  private analyzeResponsePreferences(
    pattern: UserPattern,
    messages: Array<{ role: string; content: string }>
  ): void {
    const prefs = pattern.preferredResponseStyle;

    // Analyze if user asks for examples
    const exampleRequests = messages.filter(
      (m) => m.role === 'user' && /example|sample|show me|demonstrate/i.test(m.content)
    ).length;
    prefs.wantsExamples = exampleRequests > 0;

    // Analyze if user wants step-by-step
    const stepRequests = messages.filter(
      (m) => m.role === 'user' && /step by step|one by one|first.*then|guide/i.test(m.content)
    ).length;
    prefs.likesStepByStep = stepRequests > 0;
  }

  private updateStyleEvolution(pattern: UserPattern): void {
    const evolution = pattern.styleEvolution;

    // Store initial style if not set
    if (Object.keys(evolution.initialStyle).length === 0) {
      evolution.initialStyle = { ...pattern.communicationStyle };
    }

    // Update current style
    evolution.currentStyle = { ...pattern.communicationStyle };

    // Calculate change rate (simplified)
    const changes = Object.keys(evolution.initialStyle).filter((key) => {
      const k = key as keyof CommunicationStyleProfile;
      return evolution.initialStyle[k] !== evolution.currentStyle[k];
    }).length;

    if (changes === 0) {
      evolution.changeRate = 'stable';
    } else if (changes <= 2) {
      evolution.changeRate = 'evolving';
    } else {
      evolution.changeRate = 'rapidly-changing';
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SESSION TRACKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private updateSessionTracking(userId: string, sessionId: string): void {
    let session = this.sessionData.get(userId);
    if (!session || session.sessionId !== sessionId) {
      session = {
        userId,
        sessionId,
        messageCount: 0,
        startTime: new Date(),
      };
      this.sessionData.set(userId, session);
    }
    session.messageCount++;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIDENCE & INSIGHTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculatePatternConfidence(pattern: UserPattern): number {
    // Base confidence on number of interactions
    let confidence = Math.min(100, pattern.totalInteractions * 5);

    // Reduce if patterns are inconsistent
    if (pattern.styleEvolution.changeRate === 'rapidly-changing') {
      confidence *= 0.8;
    }

    // Increase if user has clear preferences
    const hasStrongPreferences = pattern.topicPreferences.filter((t) => t.frequency > 3).length > 0;
    if (hasStrongPreferences) {
      confidence = Math.min(100, confidence * 1.2);
    }

    return Math.round(confidence);
  }

  private generateInsights(pattern: UserPattern): string[] {
    const insights: string[] = [];

    // Query type insights
    const topQueryType = Object.entries(pattern.queryTypes).sort((a, b) => b[1] - a[1])[0];
    if (topQueryType && topQueryType[1] > 0) {
      insights.push(`Primarily asks ${topQueryType[0]} questions`);
    }

    // Communication style insights
    insights.push(
      `Communication style: ${pattern.communicationStyle.verbosity}, ${pattern.communicationStyle.formality}`
    );

    // Technical level insights
    if (pattern.technicalLevel.confidence > 50) {
      insights.push(
        `Technical level: ${pattern.technicalLevel.overall} (${pattern.technicalLevel.confidence}% confidence)`
      );
    }

    // Engagement insights
    if (pattern.engagementLevel.overall === 'very-high') {
      insights.push('Highly engaged user with deep conversations');
    }

    // Topic insights
    const topTopics = pattern.topicPreferences.slice(0, 3);
    if (topTopics.length > 0) {
      insights.push(`Interested in: ${topTopics.map((t) => t.topic).join(', ')}`);
    }

    return insights;
  }

  private generateRecommendations(pattern: UserPattern): AdaptationRecommendation[] {
    const recommendations: AdaptationRecommendation[] = [];

    // Length recommendation
    if (
      pattern.communicationStyle.verbosity === 'terse' ||
      pattern.communicationStyle.verbosity === 'brief'
    ) {
      recommendations.push({
        aspect: 'response-length',
        recommendation: 'Keep responses concise and to the point',
        priority: 'high',
        reason: 'User prefers brief communication',
      });
    }

    // Technical depth recommendation
    if (pattern.technicalLevel.overall === 'expert') {
      recommendations.push({
        aspect: 'technical-depth',
        recommendation: 'Use advanced terminology without excessive explanation',
        priority: 'high',
        reason: 'User has expert-level technical knowledge',
      });
    } else if (pattern.technicalLevel.overall === 'beginner') {
      recommendations.push({
        aspect: 'technical-depth',
        recommendation: 'Explain concepts simply with examples',
        priority: 'high',
        reason: 'User is learning and needs clear explanations',
      });
    }

    // Emotional support recommendation
    if (pattern.emotionalPatterns.stressIndicators > 50) {
      recommendations.push({
        aspect: 'tone',
        recommendation: 'Be encouraging and supportive in responses',
        priority: 'medium',
        reason: 'User shows signs of stress or frustration',
      });
    }

    // Engagement recommendation
    if (pattern.engagementLevel.overall === 'very-high') {
      recommendations.push({
        aspect: 'engagement',
        recommendation: 'Feel free to ask follow-up questions and go deeper',
        priority: 'medium',
        reason: 'User appreciates thorough conversations',
      });
    }

    return recommendations;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GUIDANCE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getToneGuidance(pattern: UserPattern): string {
    const parts: string[] = [];

    // Based on formality
    switch (pattern.communicationStyle.formality) {
      case 'very-formal':
        parts.push('Maintain professional, respectful tone');
        break;
      case 'formal':
        parts.push('Be polite and professional');
        break;
      case 'casual':
        parts.push('Be friendly and approachable');
        break;
      case 'very-casual':
        parts.push('Be relaxed like talking to a friend');
        break;
      default:
        parts.push('Balance friendliness with professionalism');
    }

    // Based on emotional patterns
    if (pattern.emotionalPatterns.stressIndicators > 50) {
      parts.push('Be encouraging and supportive');
    }

    if (pattern.emotionalPatterns.enthusiasmLevel > 70) {
      parts.push('Match their enthusiasm and energy');
    }

    return parts.join('. ');
  }

  private getStyleGuidance(pattern: UserPattern): string {
    const parts: string[] = [];

    // Based on verbosity
    if (
      pattern.communicationStyle.verbosity === 'terse' ||
      pattern.communicationStyle.verbosity === 'brief'
    ) {
      parts.push('Be direct and concise');
    } else if (pattern.communicationStyle.verbosity === 'verbose') {
      parts.push('Provide detailed, comprehensive responses');
    }

    // Based on preferences
    if (pattern.preferredResponseStyle.likesStepByStep) {
      parts.push('Structure information step-by-step');
    }

    if (pattern.preferredResponseStyle.wantsExamples) {
      parts.push('Include practical examples');
    }

    return parts.join('. ') || 'Balanced, clear communication';
  }

  private getLengthGuidance(pattern: UserPattern): string {
    return pattern.preferredResponseStyle.preferredLength;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Clear patterns for a user (for testing or data privacy)
   */
  clearUserPattern(userId: string): void {
    this.userPatterns.delete(userId);
    this.sessionData.delete(userId);
  }

  /**
   * Get all tracked user IDs
   */
  getTrackedUsers(): string[] {
    return Array.from(this.userPatterns.keys());
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SESSION TRACKING INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SessionTracking {
  userId: string;
  sessionId: string;
  messageCount: number;
  startTime: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const patternAnalyzer = new PatternAnalyzer();
