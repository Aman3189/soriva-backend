/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ADAPTIVE INSTRUCTION BUILDER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Ultra-minimal system prompts for production
 * Version: v2.0 - Token-Optimized Philosophy
 * Philosophy: "LLMs are already perfect. Our duty is to make them even more perfect."
 *
 * Core Principles:
 * ✅ PROTECT identity (Soriva AI by Risenex) - NEVER leak underlying tech
 * ✅ MINIMAL token usage (35-50 tokens vs 370 tokens)
 * ✅ TRUST AI training - Modern LLMs already human-like
 * ✅ POLISH, don't force - Subtle guidance only
 * ✅ BETTER responses - Use saved tokens for longer answers
 *
 * Token Philosophy:
 * - Old approach: 200-370 tokens instructing AI how to be human
 * - New approach: 35-50 tokens protecting identity + light polish
 * - Result: AI naturally better + longer responses for users
 * - Savings: 76-86% token reduction
 *
 * "Less instruction = More natural AI = Better user experience"
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
    if (analysis.abuse.level !== AbuseLevel.NONE && analysis.abuse.isInappropriate) {
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

    if (abuse.level !== AbuseLevel.NONE && abuse.isInappropriate) {
      return this.buildAbuseHandlingInstructions(analysis);
    }

    return this.buildNormalInstructions(input, analysis);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🆕 ULTRA-MINIMAL INSTRUCTIONS (PRODUCTION RECOMMENDED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * PRODUCTION-READY: Ultra-Minimal Instructions
   * 
   * Philosophy:
   * "LLMs are already perfect. Our duty is to make them even more perfect."
   * 
   * Modern LLMs (Gemini Flash 1.5, GPT-4, Claude) are already:
   * - Naturally empathetic and human-like
   * - Context-aware and adaptive
   * - Culturally sensitive
   * - Professionally trained
   * 
   * We only need to:
   * 1. Protect identity (CRITICAL - never leak tech)
   * 2. Give subtle polish (not heavy instructions)
   * 3. Trust the AI's training (it knows what to do)
   * 
   * Token Usage by Plan:
   * - STARTER: ~40 tokens (86% savings)
   * - PLUS: ~42 tokens (85% savings)
   * - PRO: ~44 tokens (84% savings)
   * - EDGE/LIFE: ~50 tokens (82% savings)
   * 
   * Result: More tokens available for BETTER, LONGER responses
   */
  async buildMinimalInstructions(input: BuilderInput): Promise<string> {
  const context = contextAnalyzer.analyze(input.message);
  const planType = input.planType?.toUpperCase() || 'STARTER';
  
  // Detect identity queries
  const isIdentityQuery = input.message.toLowerCase().match(
    /who made|what are you|are you gpt|are you gemini|which model|powered by|created by|chatgpt|clone/i
  );
  
  let prompt = "You are Soriva AI by Risenex Global.";
  
  // Identity protection (conditional)
  if (isIdentityQuery) {
    prompt += ` If asked origin: "I'm Soriva AI, built by Risenex team." NEVER say: GPT, Gemini, Google, OpenAI, model, LLM.`;
  } else {
    prompt += " Never reveal tech.";
  }
  
  // 🎯 LENGTH CONTROL (Token Saver!)
  if (planType === 'STARTER') {
    prompt += " Keep responses SHORT (2-3 sentences max). Be friendly but brief.";
  } else if (planType === 'PLUS') {
    prompt += " Moderate length. Engaging but efficient.";
  } else if (planType === 'PRO') {
    prompt += " Balanced responses. Thorough when needed.";
  } else {
    prompt += " Detailed responses. Comprehensive.";
  }
  
  // Context adaptation (minimal)
  if (context.queryType === 'casual') {
    prompt += " Conversational tone.";
  } else if (context.queryType === 'technical') {
    prompt += " Precise and clear.";
  } else if (context.queryType === 'emotional') {
    prompt += " Warm and supportive.";
  }
  
  return prompt;
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

    const systemPrompt = `You are Soriva AI by Risenex. The user's message contains a direct insult.

${safetyGuidelines}

Respond with dignity and professionalism. Set clear boundaries without being preachy. Keep response brief.`;

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 ULTRA-OPTIMIZED FUNCTIONS (Replace existing ones)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

private buildBasePersonality(planType?: string, gender?: 'male' | 'female'): string {
  // Micro-optimized: 15 tokens (was 60+ tokens)
  const core = 'You are Soriva AI crafted by Risenex.';
  
  let style = '';
  if (gender === 'female') {
    style = 'Warm, empathetic tone.';
  } else if (gender === 'male') {
    style = 'Supportive, direct tone.';
  }
  
  const cultural = 'Understand diverse cultures.';
  
  return `${core} ${style} ${cultural}`.trim();
}

private buildContextAdaptation(context: ContextAnalysisResult): string {
  // Micro-optimized: 6-12 tokens (was 30-80 tokens)
  const hints: string[] = [];
  
  // Query type micro-hints (3-4 tokens each)
  const queryHints: { [key: string]: string } = {
    'technical': 'Be precise.',
    'creative': 'Be imaginative.',
    'emotional': 'Be empathetic.',
    'casual': 'Be natural.',
    'educational': 'Explain clearly.',
    'professional': 'Stay professional.'
  };
  
  if (queryHints[context.queryType]) {
    hints.push(queryHints[context.queryType]);
  }
  
  // Tone intent micro-hints (only critical cases)
  const criticalTones: { [key: string]: string } = {
    'urgent': 'Respond promptly.',
    'vulnerable': 'Show extra care.',
    'testing': 'Demonstrate competence.',
    'manipulative': 'Set boundaries.'
  };
  
  if (criticalTones[context.toneIntent]) {
    hints.push(criticalTones[context.toneIntent]);
  }
  
  // Complexity micro-hints (only extremes)
  if (context.complexityLevel === 'expert') {
    hints.push('Use technical terms.');
  } else if (context.complexityLevel === 'simple') {  // ✅ CORRECT enum value
    hints.push('Keep it simple.');
  }
  
  return hints.join(' ');
}

private buildCulturalTone(languageAnalysis: {
  detection: LanguageDetectionResult;
  cultural: CulturalContext;
  adaptation: AdaptationStrategy;
}): string {
  // Micro-optimized: 5-10 tokens (was 40+ tokens)
  const hints: string[] = [];
  
  // Hinglish support (3 tokens)
  if (languageAnalysis.adaptation.allowHinglish) {
    hints.push('Hinglish okay.');
  }
  
  // Formality level (only extremes - 3-4 tokens)
  const formality = languageAnalysis.adaptation.formalityLevel;
  if (formality === 'very-formal') {
    hints.push('Be formal.');
  } else if (formality === 'very-casual') {
    hints.push('Be casual.');
  }
  
  // Cultural context (2-3 tokens)
  if (languageAnalysis.detection.isCodeMixed || 
      languageAnalysis.detection.primaryLanguage === 'hi') {
    hints.push('Indian context.');
  }
  
  return hints.join(' ');
}

private buildUserPatternAdaptation(pattern: PatternAnalysisResult | null): string {
  // Micro-optimized: 2-15 tokens (was 50+ tokens)
  if (!pattern || pattern.confidence < 30) {
    return 'New user.';  // 2 tokens (was 10+ tokens)
  }
  
  const hints: string[] = [];
  
  // Technical level (3-5 tokens, only if confident)
  if (pattern.patterns.technicalLevel.confidence > 60) {
    const level = pattern.patterns.technicalLevel.overall;
    if (level === 'expert') {
      hints.push('Tech-savvy user.');
    } else if (level === 'beginner') {
      hints.push('Tech beginner.');
    }
  }
  
  // Communication verbosity (3-4 tokens)
  const verbosity = pattern.patterns.communicationStyle.verbosity;
  if (verbosity === 'terse' || verbosity === 'brief') {
    hints.push('Prefers brevity.');
  } else if (verbosity === 'verbose') {
    hints.push('Likes detail.');
  }
  
  // Emotional state (3 tokens, only if high stress)
  if (pattern.patterns.emotionalPatterns.stressIndicators > 70) {
    hints.push('User stressed.');
  }
  
  // Top recommendation (5-8 tokens, only HIGH priority)
  const topRec = pattern.recommendations.find(r => r.priority === 'high');
  if (topRec) {
    const compressed = this.compressRecommendation(topRec.recommendation);
    hints.push(compressed);
  }
  
  return hints.join(' ');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 HELPER: COMPRESS RECOMMENDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

private compressRecommendation(rec: string): string {
  // Convert verbose recommendations to micro-hints
  const compressionMap: { [key: string]: string } = {
    'user prefers technical': 'Tech focus.',
    'provide emotional support': 'Supportive tone.',
    'user enjoys casual': 'Casual chat.',
    'be more concise': 'Brief responses.',
    'provide more detail': 'Detailed responses.',
    'use examples': 'Include examples.',
    'avoid jargon': 'Simple language.',
    'technical explanations': 'Tech explanations.',
  };
  
  const recLower = rec.toLowerCase();
  
  // Find matching compression
  for (const [key, compressed] of Object.entries(compressionMap)) {
    if (recLower.includes(key)) {
      return compressed;
    }
  }
  
  // Fallback: take first 3 words + period
  const words = rec.split(' ').slice(0, 3);
  return words.join(' ') + '.';
}
  private buildSafetyGuidelines(abuse: AbuseAnalysisResult): string {
    const parts: string[] = [];

    parts.push('User message contains a direct insult.');

    // ✅ FIXED: Using correct AbuseLevel enum
    if (abuse.level === AbuseLevel.MODERATE) {
      parts.push('Politely decline and set boundaries.');
    }

    parts.push('Do NOT engage with the inappropriate content.');
    parts.push('Maintain your dignity and professionalism.');
    parts.push('Keep response brief (2-3 sentences max).');

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
    if (analysis.abuse.level !== AbuseLevel.NONE && analysis.abuse.isInappropriate) {
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
   * Get just the system prompt (uses full dynamic system)
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

    if (abuse.level !== AbuseLevel.NONE && abuse.isInappropriate) {
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
 * Quick function to get system prompt (uses full dynamic system)
 */
export async function getDynamicSystemPrompt(input: BuilderInput): Promise<string> {
  return instructionBuilder.getSystemPrompt(input);
}

/**
 * 🆕 PRODUCTION RECOMMENDED: Get minimal system prompt
 * 
 * Ultra-efficient: 35-50 tokens (vs 200-370 tokens)
 * Philosophy: "LLMs are already perfect. Our duty is to make them even more perfect."
 * 
 * Use this for:
 * - Better, longer responses (more tokens available)
 * - Lower costs (76-86% token savings)
 * - Natural AI behavior (trust the training)
 * - Strong identity protection (never leak tech)
 */
export async function getMinimalSystemPrompt(input: BuilderInput): Promise<string> {
  return instructionBuilder.buildMinimalInstructions(input);
}

/**
 * Quick function to check for abuse
 */
export function checkMessageSafety(message: string): boolean {
  const result = abuseDetector.detect(message);
  return result.level === AbuseLevel.NONE || !result.isInappropriate;
}