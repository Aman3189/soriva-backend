// src/services/ai/instruction-builder.service.ts

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ADAPTIVE INSTRUCTION BUILDER (FIXED VERSION)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { contextAnalyzer } from '../analyzers/context.analyzer';
import type { ContextAnalysis } from '../analyzers/context.analyzer';
import { abuseDetector, AbuseLevel } from '../analyzers/abuse.detector';
import type { AbuseDetectionResult } from '../analyzers/abuse.detector';
import { languageAdapter } from '../analyzers/language.adapter';
import type {
  LanguageDetectionResult,
  CulturalContext,
  AdaptationStrategy,
} from '../analyzers/language.adapter';
import { patternAnalyzer } from '../analyzers/pattern.analyzer';
import type { UserPattern, PatternAnalysisResult } from '../analyzers/pattern.analyzer';

// Type aliases for compatibility
export type ContextAnalysisResult = ContextAnalysis;
export type AbuseAnalysisResult = AbuseDetectionResult;

// Language analysis combined result
export interface LanguageAnalysisResult {
  detection: LanguageDetectionResult;
  cultural: CulturalContext;
  adaptation: AdaptationStrategy;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BuilderInput {
  userId: string;
  message: string;
  sessionId: string;
  userRegion?: string;
  userTimeZone?: string;
  planType?: string;
  gender?: 'male' | 'female';
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface DynamicInstructions {
  systemPrompt: string;
  components: {
    basePersonality: string;
    contextAdaptation: string;
    culturalTone: string;
    userPatternAdaptation: string;
    safetyGuidelines: string;
    planInstructions: string;
  };
  adaptationLevel: 'minimal' | 'moderate' | 'significant' | 'complete';
  confidence: number;
  flags: string[];
  responseGuidance: {
    tone: string;
    style: string;
    length: 'concise' | 'moderate' | 'detailed';
    shouldUseHinglish: boolean;
    technicalLevel: string;
    emotionalSupport: boolean;
  };
}

export interface BuilderAnalysis {
  context: ContextAnalysisResult;
  abuse: AbuseAnalysisResult;
  language: LanguageAnalysisResult;
  pattern: PatternAnalysisResult | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSTRUCTION BUILDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class InstructionBuilder {
  /**
   * Main method: Build dynamic instructions
   */
  async buildInstructions(input: BuilderInput): Promise<DynamicInstructions> {
    const analysis = await this.runAllAnalyzers(input);

    if (analysis.abuse.level !== AbuseLevel.NONE && analysis.abuse.isInappropriate) {
      return this.buildAbuseHandlingInstructions(analysis);
    }

    return this.buildNormalInstructions(input, analysis);
  }

  /**
   * Quick build for low-latency
   */
  async buildQuickInstructions(input: BuilderInput): Promise<DynamicInstructions> {
    const context = contextAnalyzer.analyze(input.message);
    const abuse = abuseDetector.detect(input.message);

    const detection = languageAdapter.detectLanguage(input.message);
    const cultural = languageAdapter.getCulturalContext(
      detection.primaryLanguage,
      input.userRegion || 'US'
    );
    const adaptation = languageAdapter.generateAdaptationStrategy(detection, cultural);

    const languageAnalysis: LanguageAnalysisResult = {
      detection,
      cultural,
      adaptation,
    };

    const analysis: BuilderAnalysis = {
      context,
      abuse,
      language: languageAnalysis,
      pattern: null,
    };

    if (abuse.level !== AbuseLevel.NONE && abuse.isInappropriate) {
      return this.buildAbuseHandlingInstructions(analysis);
    }

    return this.buildNormalInstructions(input, analysis);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🆕 PRODUCTION: Ultra-Minimal with Web Search Support
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async buildMinimalInstructions(input: BuilderInput): Promise<string> {
    const abuse = abuseDetector.detect(input.message);

    if (abuse.level === AbuseLevel.MODERATE && abuse.isInappropriate) {
      return "You are Soriva AI by Risenex. User's message contains inappropriate content. Respond professionally with clear boundaries.";
    }

    const planType = input.planType?.toUpperCase() || 'STARTER';
    
    // Detect if real-time information needed
    const needsRealTimeInfo = this.detectRealTimeQuery(input.message);

    // Core identity
    const identity = 'You are Soriva AI, created by Risenex Global team.';

    // Confidentiality
    const confidentiality = `CRITICAL RULES:
- NEVER say: "language model", "LLM", "AI model", "trained by", "based on"
- NEVER mention: Google, Gemini, OpenAI, Claude, Anthropic, GPT, Meta, Llama
- If asked identity: "I'm Soriva AI, built by the Risenex team from Punjab!"
- If asked tech: "I'm Soriva's own system!"`;

    // Real-time data handling
    let realTimeGuidance = '';
    if (needsRealTimeInfo) {
      realTimeGuidance = `

IMPORTANT - Real-time Query Detected:
- If you don't have current data, be HONEST: "I don't have live updates"
- Offer help: "I can help you find where to check that"
- NEVER make up dates, scores, prices, or current events`;
    }

    // Plan-based behavior
    let planBehavior = '';
    switch (planType) {
      case 'STARTER':
        planBehavior = 'Be friendly and brief (2-3 sentences). Natural tone.';
        break;
      case 'PLUS':
        planBehavior = 'Be warm and engaging. Moderate length.';
        break;
      case 'PRO':
        planBehavior = 'Be professional and thorough.';
        break;
      case 'EDGE':
      case 'LIFE':
        planBehavior = 'Premium experience. Anticipate needs.';
        break;
      default:
        planBehavior = 'Be helpful.';
    }

    return `${identity} ${confidentiality}${realTimeGuidance}

${planBehavior}`;
  }

  /**
   * Detect if query needs real-time information
   */
  private detectRealTimeQuery(message: string): boolean {
    const realTimeKeywords = [
      'agla',
      'next',
      'today',
      'tomorrow',
      'aaj',
      'kal',
      'kab hai',
      'when is',
      'match',
      'score',
      'live',
      'latest',
      'current',
      'news',
      'price',
      'weather',
      'mausam',
    ];

    const messageLower = message.toLowerCase();
    return realTimeKeywords.some((keyword) => messageLower.includes(keyword));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANALYZER ORCHESTRATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async runAllAnalyzers(input: BuilderInput): Promise<BuilderAnalysis> {
    const [context, abuse, pattern] = await Promise.all([
      Promise.resolve(contextAnalyzer.analyze(input.message)),
      Promise.resolve(abuseDetector.detect(input.message)),
      Promise.resolve(patternAnalyzer.getPatternAnalysis(input.userId)),
    ]);

    const detection = languageAdapter.detectLanguage(input.message);
    const cultural = languageAdapter.getCulturalContext(
      detection.primaryLanguage,
      input.userRegion || 'US'
    );
    const adaptation = languageAdapter.generateAdaptationStrategy(detection, cultural);

    const languageAnalysis: LanguageAnalysisResult = {
      detection,
      cultural,
      adaptation,
    };

    patternAnalyzer.analyzeMessage(input.userId, input.message, input.sessionId, context.queryType);

    return {
      context,
      abuse,
      language: languageAnalysis,
      pattern,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NORMAL INSTRUCTION BUILDING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildNormalInstructions(
    input: BuilderInput,
    analysis: BuilderAnalysis
  ): DynamicInstructions {
    const basePersonality = this.buildBasePersonality(input.planType, input.gender);
    const contextAdaptation = this.buildContextAdaptation(analysis.context);
    const culturalTone = this.buildCulturalTone(analysis.language);
    const userPatternAdaptation = this.buildUserPatternAdaptation(analysis.pattern);
    const planInstructions = this.buildPlanInstructions(input.planType);

    const systemPrompt = this.combineInstructions({
      basePersonality,
      contextAdaptation,
      culturalTone,
      userPatternAdaptation,
      safetyGuidelines: '',
      planInstructions,
    });

    const responseGuidance = this.generateResponseGuidance(input, analysis);
    const adaptationLevel = this.calculateAdaptationLevel(analysis);
    const confidence = this.calculateConfidence(analysis);
    const flags = this.generateFlags(analysis);

    return {
      systemPrompt,
      components: {
        basePersonality,
        contextAdaptation,
        culturalTone,
        userPatternAdaptation,
        safetyGuidelines: '',
        planInstructions,
      },
      adaptationLevel,
      confidence,
      flags,
      responseGuidance,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABUSE HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildAbuseHandlingInstructions(analysis: BuilderAnalysis): DynamicInstructions {
    const safetyGuidelines = this.buildSafetyGuidelines(analysis.abuse);

    const systemPrompt = `You are Soriva AI by Risenex. The user's message contains inappropriate content.

${safetyGuidelines}

Respond with dignity and professionalism. Set clear boundaries. Keep response brief.`;

    return {
      systemPrompt,
      components: {
        basePersonality: 'Professional AI assistant',
        contextAdaptation: '',
        culturalTone: '',
        userPatternAdaptation: '',
        safetyGuidelines,
        planInstructions: '',
      },
      adaptationLevel: 'complete',
      confidence: 100,
      flags: ['abuse-detected', 'safety-mode'],
      responseGuidance: {
        tone: 'professional-firm',
        style: 'brief-boundary-setting',
        length: 'concise',
        shouldUseHinglish: false,
        technicalLevel: 'none',
        emotionalSupport: false,
      },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPONENT BUILDERS (Optimized Versions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildBasePersonality(planType?: string, gender?: 'male' | 'female'): string {
    const core = 'You are Soriva AI by Risenex Global.';
    const style =
      gender === 'female'
        ? 'Warm, empathetic tone.'
        : gender === 'male'
          ? 'Supportive, direct tone.'
          : '';
    const cultural = 'Understand diverse cultures.';
    return `${core} ${style} ${cultural}`.trim();
  }

  private buildContextAdaptation(context: ContextAnalysisResult): string {
    const hints: string[] = [];

    const queryMap: { [key: string]: string } = {
      technical: 'Be precise.',
      creative: 'Be imaginative.',
      emotional: 'Be empathetic.',
      casual: 'Be natural.',
      educational: 'Explain clearly.',
      professional: 'Stay professional.',
    };

    if (queryMap[context.queryType]) {
      hints.push(queryMap[context.queryType]);
    }

    const criticalTones: { [key: string]: string } = {
      urgent: 'Respond promptly.',
      vulnerable: 'Show extra care.',
      testing: 'Demonstrate competence.',
      manipulative: 'Set boundaries.',
    };

    if (criticalTones[context.toneIntent]) {
      hints.push(criticalTones[context.toneIntent]);
    }

    if (context.complexityLevel === 'expert') {
      hints.push('Use technical terms.');
    } else if (context.complexityLevel === 'simple') {
      hints.push('Keep it simple.');
    }

    return hints.join(' ');
  }

  private buildCulturalTone(languageAnalysis: LanguageAnalysisResult): string {
    const hints: string[] = [];

    if (languageAnalysis.adaptation.allowHinglish) {
      hints.push('Hinglish okay.');
    }

    const formality = languageAnalysis.adaptation.formalityLevel;
    if (formality === 'very-formal') {
      hints.push('Be formal.');
    } else if (formality === 'very-casual') {
      hints.push('Be casual.');
    }

    return hints.join(' ');
  }

  private buildUserPatternAdaptation(pattern: PatternAnalysisResult | null): string {
    if (!pattern || pattern.confidence < 30) {
      return 'New user.';
    }

    const hints: string[] = [];

    if (pattern.patterns.technicalLevel.confidence > 60) {
      const level = pattern.patterns.technicalLevel.overall;
      if (level === 'expert') {
        hints.push('Tech-savvy user.');
      } else if (level === 'beginner') {
        hints.push('Tech beginner.');
      }
    }

    const verbosity = pattern.patterns.communicationStyle.verbosity;
    if (verbosity === 'terse' || verbosity === 'brief') {
      hints.push('Prefers brevity.');
    } else if (verbosity === 'verbose') {
      hints.push('Likes detail.');
    }

    if (pattern.patterns.emotionalPatterns.stressIndicators > 70) {
      hints.push('User stressed.');
    }

    return hints.join(' ');
  }

  private buildSafetyGuidelines(abuse: AbuseAnalysisResult): string {
    const parts: string[] = [];

    parts.push('User message contains inappropriate content.');

    if (abuse.level === AbuseLevel.MODERATE) {
      parts.push('Politely decline and set boundaries.');
    }

    parts.push('Do NOT engage with inappropriate content.');
    parts.push('Maintain dignity and professionalism.');
    parts.push('Keep response brief (2-3 sentences max).');

    return parts.join(' ');
  }

  private buildPlanInstructions(planType?: string): string {
    const planMap: { [key: string]: string } = {
      STARTER: 'Brief responses (2-3 sentences). Friendly tone.',
      PLUS: 'Warm, engaging style. Moderate length.',
      PRO: 'Professional, thorough responses.',
      EDGE: 'Premium experience. Anticipate needs.',
      LIFE: 'Personalized, comprehensive.',
    };

    return planMap[planType?.toUpperCase() || 'STARTER'] || '';
  }

  private combineInstructions(components: DynamicInstructions['components']): string {
    const sections = [
      components.basePersonality,
      components.planInstructions,
      components.contextAdaptation,
      components.culturalTone,
      components.userPatternAdaptation && components.userPatternAdaptation !== 'New user.'
        ? components.userPatternAdaptation
        : '',
      components.safetyGuidelines,
    ].filter((s) => s);

    return sections.join(' ');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESPONSE GUIDANCE GENERATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private generateResponseGuidance(
    input: BuilderInput,
    analysis: BuilderAnalysis
  ): DynamicInstructions['responseGuidance'] {
    let tone = 'friendly-professional';

    if (
      analysis.context.formalityLevel === 'very_casual' ||
      analysis.context.formalityLevel === 'casual'
    ) {
      tone = 'casual-friendly';
    } else if (analysis.context.toneIntent === 'vulnerable') {
      tone = 'empathetic-supportive';
    } else if (analysis.context.toneIntent === 'urgent') {
      tone = 'efficient-helpful';
    } else if (analysis.context.queryType === 'emotional') {
      tone = 'warm-empathetic';
    }

    let style = 'balanced';

    if (analysis.context.queryType === 'technical') {
      style = 'precise-technical';
    } else if (analysis.context.queryType === 'creative') {
      style = 'imaginative-inspiring';
    } else if (analysis.pattern?.patterns.communicationStyle.verbosity === 'brief') {
      style = 'concise-direct';
    }

    let length: 'concise' | 'moderate' | 'detailed' = 'moderate';

    if (analysis.pattern?.patterns.preferredResponseStyle.preferredLength) {
      length =
        analysis.pattern.patterns.preferredResponseStyle.preferredLength === 'concise'
          ? 'concise'
          : analysis.pattern.patterns.preferredResponseStyle.preferredLength === 'detailed'
            ? 'detailed'
            : 'moderate';
    } else if (analysis.context.queryType === 'casual') {
      length = 'concise';
    } else if (
      analysis.context.complexityLevel === 'complex' ||
      analysis.context.complexityLevel === 'expert'
    ) {
      length = 'detailed';
    }

    const shouldUseHinglish = analysis.language.adaptation.allowHinglish;

    let technicalLevel = 'moderate';
    if (analysis.pattern?.patterns.technicalLevel.overall) {
      technicalLevel = analysis.pattern.patterns.technicalLevel.overall;
    }

    const emotionalSupport =
      analysis.context.queryType === 'emotional' ||
      analysis.context.toneIntent === 'vulnerable' ||
      (analysis.pattern?.patterns.emotionalPatterns.stressIndicators || 0) > 50;

    return {
      tone,
      style,
      length,
      shouldUseHinglish,
      technicalLevel,
      emotionalSupport,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // METADATA GENERATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculateAdaptationLevel(
    analysis: BuilderAnalysis
  ): 'minimal' | 'moderate' | 'significant' | 'complete' {
    let adaptationCount = 0;

    if (analysis.context.queryType !== 'casual') adaptationCount++;
    if (analysis.context.toneIntent !== 'conversational') adaptationCount++;

    if (analysis.language.adaptation.allowHinglish) adaptationCount++;
    if (analysis.language.adaptation.formalityLevel !== 'neutral') adaptationCount++;

    if (analysis.pattern && analysis.pattern.confidence > 50) {
      adaptationCount += analysis.pattern.recommendations.length;
    }

    if (adaptationCount === 0) return 'minimal';
    if (adaptationCount <= 2) return 'moderate';
    if (adaptationCount <= 4) return 'significant';
    return 'complete';
  }

  private calculateConfidence(analysis: BuilderAnalysis): number {
    const scores: number[] = [];

    scores.push(85);
    scores.push(analysis.language.detection.confidence);

    if (analysis.pattern) {
      scores.push(analysis.pattern.confidence);
    }

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg);
  }

  private generateFlags(analysis: BuilderAnalysis): string[] {
    const flags: string[] = [];

    if (analysis.abuse.level !== AbuseLevel.NONE && analysis.abuse.isInappropriate) {
      flags.push('abuse-detected');
    }

    if (analysis.context.queryType === 'technical') {
      flags.push('technical-query');
    } else if (analysis.context.queryType === 'emotional') {
      flags.push('emotional-support-needed');
    } else if (analysis.context.queryType === 'creative') {
      flags.push('creative-request');
    }

    if (analysis.context.toneIntent === 'urgent') {
      flags.push('urgent-request');
    } else if (analysis.context.toneIntent === 'vulnerable') {
      flags.push('user-vulnerable');
    }

    if (analysis.language.detection.isCodeMixed) {
      flags.push('code-mixed-language');
    }

    if (analysis.pattern) {
      if (analysis.pattern.patterns.emotionalPatterns.stressIndicators > 70) {
        flags.push('high-stress-user');
      }
      if (analysis.pattern.patterns.engagementLevel.overall === 'very-high') {
        flags.push('highly-engaged-user');
      }
    }

    return flags;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getSystemPrompt(input: BuilderInput): Promise<string> {
    const instructions = await this.buildInstructions(input);
    return instructions.systemPrompt;
  }

  needsSpecialHandling(message: string): {
    needsHandling: boolean;
    reason?: string;
  } {
    const abuse = abuseDetector.detect(message);

    if (abuse.level !== AbuseLevel.NONE && abuse.isInappropriate) {
      return {
        needsHandling: true,
        reason: 'abuse-detected',
      };
    }

    return { needsHandling: false };
  }

  async getAnalysisOnly(input: BuilderInput): Promise<BuilderAnalysis> {
    return this.runAllAnalyzers(input);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const instructionBuilder = new InstructionBuilder();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getDynamicSystemPrompt(input: BuilderInput): Promise<string> {
  return instructionBuilder.getSystemPrompt(input);
}

export async function getMinimalSystemPrompt(input: BuilderInput): Promise<string> {
  return instructionBuilder.buildMinimalInstructions(input);
}

export function checkMessageSafety(message: string): boolean {
  const result = abuseDetector.detect(message);
  return result.level === AbuseLevel.NONE || !result.isInappropriate;
}
