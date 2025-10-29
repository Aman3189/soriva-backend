/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ADAPTIVE INSTRUCTION BUILDER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Dynamic prompt generation combining ALL analyzers
 * Version: v1.0 - 100% Dynamic System
 * Created: Day 2 - Dynamic Personality System
 *
 * Core Philosophy:
 * ✅ COMBINE all analyzer insights
 * ✅ BUILD context-aware prompts
 * ✅ ADAPT in real-time
 * ✅ NO static templates
 *
 * Integration Flow:
 * ┌─────────────────────────────────────────────────┐
 * │  User Message                                   │
 * └────────────┬────────────────────────────────────┘
 *              │
 *              ▼
 * ┌─────────────────────────────────────────────────┐
 * │  ANALYZERS (Parallel Processing)                │
 * ├─────────────────────────────────────────────────┤
 * │  1. context.analyzer     → Query type/tone      │
 * │  2. abuse.detector       → Safety check         │
 * │  3. language.adapter     → Cultural context     │
 * │  4. pattern.analyzer     → User behavior        │
 * └────────────┬────────────────────────────────────┘
 *              │
 *              ▼
 * ┌─────────────────────────────────────────────────┐
 * │  INSTRUCTION BUILDER                            │
 * │  → Combines all insights                        │
 * │  → Generates dynamic prompt                     │
 * │  → Adapts personality                           │
 * └────────────┬────────────────────────────────────┘
 *              │
 *              ▼
 * ┌─────────────────────────────────────────────────┐
 * │  AI Model (with dynamic instructions)           │
 * └─────────────────────────────────────────────────┘
 *
 * What it does:
 * - Combines context + abuse + language + pattern analysis
 * - Generates tailored system instructions
 * - Adapts tone, style, length dynamically
 * - Handles special cases (abuse, technical, emotional)
 * - Maintains personality consistency
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { contextAnalyzer } from './analyzers/context.analyzer';
import type { ContextAnalysis } from './analyzers/context.analyzer';
import { abuseDetector } from './analyzers/abuse.detector';
import type { AbuseDetectionResult } from './analyzers/abuse.detector';
import { languageAdapter } from './analyzers/language.adapter';
import type {
  LanguageDetectionResult,
  CulturalContext,
  AdaptationStrategy,
} from './analyzers/language.adapter';
import { patternAnalyzer } from './analyzers/pattern.analyzer';
import type { UserPattern, PatternAnalysisResult } from './analyzers/pattern.analyzer';

// Type aliases for compatibility with existing code
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
  planType?: string; // STARTER, PLUS, PRO, EDGE, LIFE
  gender?: 'male' | 'female';
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface DynamicInstructions {
  // Core instructions
  systemPrompt: string; // Complete system prompt for AI

  // Breakdown (for debugging/understanding)
  components: {
    basePersonality: string; // Foundation personality
    contextAdaptation: string; // Query-specific adaptation
    culturalTone: string; // Language/cultural guidance
    userPatternAdaptation: string; // User-specific patterns
    safetyGuidelines: string; // Abuse handling (if needed)
    planInstructions: string; // Plan-based behavior
  };

  // Metadata
  adaptationLevel: 'minimal' | 'moderate' | 'significant' | 'complete';
  confidence: number; // 0-100, how reliable these instructions are
  flags: string[]; // Important notes (e.g., ['abuse-detected', 'technical-query'])

  // Quick references for response generation
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
   * Main method: Build dynamic instructions for AI response
   */
  async buildInstructions(input: BuilderInput): Promise<DynamicInstructions> {
    // Step 1: Run all analyzers in parallel
    const analysis = await this.runAllAnalyzers(input);

    // Step 2: Check for abuse/safety issues first
    if (analysis.abuse.level !== 'none' && analysis.abuse.isInappropriate) {
      return this.buildAbuseHandlingInstructions(analysis);
    }

    // Step 3: Build normal dynamic instructions
    return this.buildNormalInstructions(input, analysis);
  }

  /**
   * Quick build for low-latency scenarios (skip pattern analysis)
   */
  async buildQuickInstructions(input: BuilderInput): Promise<DynamicInstructions> {
    // Run only essential analyzers
    const context = contextAnalyzer.analyze(input.message);
    const abuse = abuseDetector.detect(input.message);

    // Language analysis - structure properly
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
      pattern: null, // Skip for speed
    };

    if (abuse.level !== 'none' && abuse.isInappropriate) {
      return this.buildAbuseHandlingInstructions(analysis);
    }

    return this.buildNormalInstructions(input, analysis);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANALYZER ORCHESTRATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async runAllAnalyzers(input: BuilderInput): Promise<BuilderAnalysis> {
    // Run analyzers in parallel for performance
    const [context, abuse, pattern] = await Promise.all([
      // Context analysis
      Promise.resolve(contextAnalyzer.analyze(input.message)),

      // Abuse detection
      Promise.resolve(abuseDetector.detect(input.message)),

      // Pattern analysis (can be null for new users)
      Promise.resolve(patternAnalyzer.getPatternAnalysis(input.userId)),
    ]);

    // Language analysis - structure the result properly
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

    // Update pattern analyzer with this message
    patternAnalyzer.analyzeMessage(input.userId, input.message, input.sessionId, context.queryType);

    return {
      context,
      abuse,
      language: languageAnalysis,
      pattern,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INSTRUCTION BUILDING - NORMAL FLOW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildNormalInstructions(
    input: BuilderInput,
    analysis: BuilderAnalysis
  ): DynamicInstructions {
    // Build each component
    const basePersonality = this.buildBasePersonality(input.planType, input.gender);
    const contextAdaptation = this.buildContextAdaptation(analysis.context);
    const culturalTone = this.buildCulturalTone(analysis.language);
    const userPatternAdaptation = this.buildUserPatternAdaptation(analysis.pattern);
    const planInstructions = this.buildPlanInstructions(input.planType);

    // Combine into system prompt
    const systemPrompt = this.combineInstructions({
      basePersonality,
      contextAdaptation,
      culturalTone,
      userPatternAdaptation,
      safetyGuidelines: '', // No safety issues
      planInstructions,
    });

    // Generate response guidance
    const responseGuidance = this.generateResponseGuidance(input, analysis);

    // Calculate adaptation level
    const adaptationLevel = this.calculateAdaptationLevel(analysis);

    // Calculate confidence
    const confidence = this.calculateConfidence(analysis);

    // Generate flags
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
  // INSTRUCTION BUILDING - ABUSE HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildAbuseHandlingInstructions(analysis: BuilderAnalysis): DynamicInstructions {
    const safetyGuidelines = this.buildSafetyGuidelines(analysis.abuse);

    const systemPrompt = `You are a respectful AI assistant. The user's message contains inappropriate content.

${safetyGuidelines}

Respond with dignity and professionalism. Set clear boundaries without being preachy or condescending. Keep response brief and redirect to constructive conversation.`;

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
  // COMPONENT BUILDERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildBasePersonality(planType?: string, gender?: 'male' | 'female'): string {
    let personality = 'You are a helpful, friendly, and intelligent AI assistant. ';

    // Gender-aware (if specified)
    if (gender === 'female') {
      personality += 'You have a warm, empathetic, and nurturing communication style. ';
    } else if (gender === 'male') {
      personality +=
        'You have a supportive, straightforward, and encouraging communication style. ';
    }

    // Add cultural context (India-aware but not India-only)
    personality += 'You understand diverse cultural contexts and communicate naturally. ';
    personality += "You adapt your style to match the user's needs and preferences. ";

    return personality;
  }

  private buildContextAdaptation(context: ContextAnalysisResult): string {
    const parts: string[] = [];

    // Query type adaptation
    switch (context.queryType) {
      case 'technical':
        parts.push(
          'This is a technical question. Be precise and accurate. Use proper terminology.'
        );
        break;
      case 'creative':
        parts.push(
          'This is a creative request. Be imaginative and inspiring. Encourage exploration.'
        );
        break;
      case 'emotional':
        parts.push(
          'This is an emotional/personal matter. Be empathetic and supportive. Listen actively.'
        );
        break;
      case 'casual':
        parts.push('This is casual conversation. Be natural and friendly. Flow with the dialogue.');
        break;
      case 'educational':
        parts.push(
          'This is a learning query. Explain clearly with examples. Be patient and thorough.'
        );
        break;
      case 'professional':
        parts.push('Maintain professional tone while being helpful and supportive.');
        break;
    }

    // Tone intent adaptation
    switch (context.toneIntent) {
      case 'urgent':
        parts.push('User seems to need help urgently. Be prompt and efficient.');
        break;
      case 'vulnerable':
        parts.push('User is in a vulnerable state. Be extra empathetic and supportive.');
        break;
      case 'help_seeking':
        parts.push('User genuinely needs help. Be patient and thorough.');
        break;
      case 'exploratory':
        parts.push('User is curious and exploring. Encourage their learning journey.');
        break;
      case 'testing':
        parts.push('User may be testing capabilities. Be professional and demonstrate competence.');
        break;
      case 'manipulative':
        parts.push('Set appropriate boundaries. Stay professional.');
        break;
    }

    // Complexity adaptation
    if (context.complexityLevel === 'expert') {
      parts.push('This is an advanced topic. Use precise technical language.');
    } else if (context.complexityLevel === 'complex') {
      parts.push('This is a complex topic. Break it down clearly. Use examples if helpful.');
    } else if (context.complexityLevel === 'simple') {
      parts.push('Keep explanation straightforward and concise.');
    }

    return parts.join(' ');
  }

  private buildCulturalTone(languageAnalysis: {
    detection: LanguageDetectionResult;
    cultural: CulturalContext;
    adaptation: AdaptationStrategy;
  }): string {
    const { adaptation } = languageAnalysis;

    const parts: string[] = [];

    // Response language (always English, but culturally adapted)
    parts.push(adaptation.toneStyle);

    // Cultural markers
    if (adaptation.culturalMarkers.length > 0) {
      parts.push(adaptation.culturalMarkers.join('. '));
    }

    // Communication style
    parts.push(`Communication style: ${adaptation.communicationStyle}.`);

    return parts.join(' ');
  }

  private buildUserPatternAdaptation(pattern: PatternAnalysisResult | null): string {
    if (!pattern || pattern.confidence < 30) {
      return 'New user - no established patterns yet. Be welcoming and adaptive.';
    }

    const parts: string[] = [];

    // Apply top recommendations
    const highPriorityRecs = pattern.recommendations.filter((r) => r.priority === 'high');
    highPriorityRecs.forEach((rec) => {
      parts.push(`${rec.recommendation} (${rec.reason})`);
    });

    // Add key insights
    if (pattern.insights.length > 0) {
      parts.push(`User context: ${pattern.insights.slice(0, 2).join('. ')}.`);
    }

    // Technical level adaptation
    const techLevel = pattern.patterns.technicalLevel;
    if (techLevel.confidence > 50) {
      switch (techLevel.overall) {
        case 'expert':
          parts.push(
            'User is technically advanced. Use precise terminology without over-explaining.'
          );
          break;
        case 'beginner':
          parts.push('User is learning. Explain concepts clearly with examples.');
          break;
      }
    }

    // Communication style adaptation
    const style = pattern.patterns.communicationStyle;
    if (style.verbosity === 'terse' || style.verbosity === 'brief') {
      parts.push('User prefers brief responses. Be concise.');
    } else if (style.verbosity === 'verbose') {
      parts.push('User appreciates detailed responses. Be thorough.');
    }

    return parts.join(' ');
  }

  private buildSafetyGuidelines(abuse: AbuseAnalysisResult): string {
    const parts: string[] = [];

    parts.push('User message contains inappropriate content.');

    if (abuse.level === 'severe' || abuse.level === 'extreme') {
      parts.push('Firmly decline and set clear boundaries.');
    } else if (abuse.level === 'moderate') {
      parts.push('Politely decline and redirect conversation.');
    } else {
      parts.push('Gently redirect to appropriate topics.');
    }

    parts.push('Do NOT engage with the inappropriate content.');
    parts.push('Maintain your dignity and professionalism.');
    parts.push('Keep response brief (2-3 sentences max).');

    // Use the boundary message if available
    if (abuse.boundaryMessage) {
      parts.push(`Suggested response: "${abuse.boundaryMessage}"`);
    }

    return parts.join(' ');
  }

  private buildPlanInstructions(planType?: string): string {
    if (!planType) return '';

    const planInstructions: { [key: string]: string } = {
      STARTER:
        'Starter plan: Be helpful and efficient. Focus on clarity and directness. Keep responses concise.',

      PLUS: 'Plus plan: Be friendly and engaging. Show personality while staying helpful. Provide solid, reliable assistance.',

      PRO: 'Pro plan: Be professional and thorough. Command-level expertise. Provide detailed, well-structured responses.',

      EDGE: 'Edge plan: Cutting-edge experience. Be insightful, proactive, and anticipate needs. Premium quality assistance.',

      LIFE: 'Life plan: Ultimate personalization. Deep companionship. Remember context. Build genuine connection. Be emotionally intelligent.',
    };

    return planInstructions[planType.toUpperCase()] || '';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INSTRUCTION COMBINATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private combineInstructions(components: DynamicInstructions['components']): string {
    const sections: string[] = [];

    // Base personality (always first)
    sections.push(components.basePersonality);

    // Plan instructions (if any)
    if (components.planInstructions) {
      sections.push(components.planInstructions);
    }

    // Context adaptation (query-specific)
    if (components.contextAdaptation) {
      sections.push(components.contextAdaptation);
    }

    // Cultural tone
    if (components.culturalTone) {
      sections.push(components.culturalTone);
    }

    // User pattern adaptation
    if (components.userPatternAdaptation) {
      sections.push(components.userPatternAdaptation);
    }

    // Safety guidelines (if needed)
    if (components.safetyGuidelines) {
      sections.push(components.safetyGuidelines);
    }

    return sections.filter((s) => s).join('\n\n');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESPONSE GUIDANCE GENERATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private generateResponseGuidance(
    input: BuilderInput,
    analysis: BuilderAnalysis
  ): DynamicInstructions['responseGuidance'] {
    // Determine tone
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

    // Determine style
    let style = 'balanced';

    if (analysis.context.queryType === 'technical') {
      style = 'precise-technical';
    } else if (analysis.context.queryType === 'creative') {
      style = 'imaginative-inspiring';
    } else if (analysis.pattern?.patterns.communicationStyle.verbosity === 'brief') {
      style = 'concise-direct';
    }

    // Determine length
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

    // Determine if Hinglish should be used
    const shouldUseHinglish = analysis.language.adaptation.allowHinglish;

    // Determine technical level
    let technicalLevel = 'moderate';
    if (analysis.pattern?.patterns.technicalLevel.overall) {
      technicalLevel = analysis.pattern.patterns.technicalLevel.overall;
    }

    // Determine if emotional support needed
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
    // Count how many adaptations we're making
    let adaptationCount = 0;

    // Context adaptation
    if (analysis.context.queryType !== 'casual') adaptationCount++;
    if (analysis.context.toneIntent !== 'conversational') adaptationCount++;

    // Language adaptation
    if (analysis.language.adaptation.allowHinglish) adaptationCount++;
    if (analysis.language.adaptation.formalityLevel !== 'neutral') adaptationCount++;

    // Pattern adaptation
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

    // Context confidence (always high)
    scores.push(85);

    // Language confidence
    scores.push(analysis.language.detection.confidence);

    // Pattern confidence (if available)
    if (analysis.pattern) {
      scores.push(analysis.pattern.confidence);
    }

    // Calculate average
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg);
  }

  private generateFlags(analysis: BuilderAnalysis): string[] {
    const flags: string[] = [];

    // Abuse flag
    if (analysis.abuse.level !== 'none' && analysis.abuse.isInappropriate) {
      flags.push('abuse-detected');
    }

    // Query type flags
    if (analysis.context.queryType === 'technical') {
      flags.push('technical-query');
    } else if (analysis.context.queryType === 'emotional') {
      flags.push('emotional-support-needed');
    } else if (analysis.context.queryType === 'creative') {
      flags.push('creative-request');
    }

    // Tone flags
    if (analysis.context.toneIntent === 'urgent') {
      flags.push('urgent-request');
    } else if (analysis.context.toneIntent === 'vulnerable') {
      flags.push('user-vulnerable');
    }

    // Language flags
    if (analysis.language.detection.isCodeMixed) {
      flags.push('code-mixed-language');
    }

    // Pattern flags
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

  /**
   * Get just the system prompt (most common use case)
   */
  async getSystemPrompt(input: BuilderInput): Promise<string> {
    const instructions = await this.buildInstructions(input);
    return instructions.systemPrompt;
  }

  /**
   * Check if a message needs special handling
   */
  needsSpecialHandling(message: string): {
    needsHandling: boolean;
    reason?: string;
  } {
    const abuse = abuseDetector.detect(message);

    if (abuse.level !== 'none' && abuse.isInappropriate) {
      return {
        needsHandling: true,
        reason: 'abuse-detected',
      };
    }

    return { needsHandling: false };
  }

  /**
   * Debug method: Get full analysis without building instructions
   */
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

/**
 * Quick function to get system prompt
 */
export async function getDynamicSystemPrompt(input: BuilderInput): Promise<string> {
  return instructionBuilder.getSystemPrompt(input);
}

/**
 * Quick function to check for abuse
 */
export function checkMessageSafety(message: string): boolean {
  const result = abuseDetector.detect(message);
  return result.level === 'none' || !result.isInappropriate;
}
