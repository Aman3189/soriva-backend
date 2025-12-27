/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI - INSTRUCTION BUILDER v3.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Philosophy: "LLMs are already perfect. We just protect identity & control costs."
 * 
 * What this file does:
 * ✅ PROTECT identity (Soriva AI by Risenex) - NEVER leak GPT/Gemini/Claude
 * ✅ CONTROL response length by plan (cost optimization)
 * ✅ DETECT abuse and set boundaries
 * ✅ TRUST LLM's natural intelligence for everything else
 * 
 * What we DON'T do (LLM handles naturally):
 * ❌ Language detection (LLM auto-mirrors)
 * ❌ Tone adaptation (LLM naturally adapts)
 * ❌ Cultural context (already trained)
 * ❌ Emotional intelligence (LLM excels at this)
 * ❌ Technical level gauging (LLM reads user's vocabulary)
 * 
 * Token Usage: ~40-60 tokens (vs 300+ tokens in v1)
 * Result: 80%+ token savings, more natural responses
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { abuseDetector, AbuseLevel } from '../analyzers/abuse.detector';
import type { AbuseDetectionResult } from '../analyzers/abuse.detector';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BuilderInput {
  userId: string;
  message: string;
  sessionId: string;
  planType?: 'STARTER' | 'PLUS' | 'PRO' | 'APEX' | 'SOVEREIGN';
}

export interface InstructionResult {
  systemPrompt: string;
  isAbusive: boolean;
  tokenEstimate: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOCKED TERMS (Identity Protection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const IDENTITY_TRIGGERS = /who made|what are you|are you gpt|are you gemini|are you claude|which model|powered by|created by|chatgpt|openai|google ai|anthropic|clone|behind you|your creator|who built|real name/i;

const BLOCKED_TERMS = [
  'GPT', 'GPT-4', 'GPT-3', 'ChatGPT', 'OpenAI',
  'Gemini', 'Google AI', 'Bard', 'PaLM',
  'Claude', 'Anthropic',
  'LLM', 'Large Language Model',
  'transformer', 'neural network architecture'
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN-BASED LENGTH CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_LENGTH_INSTRUCTIONS: Record<string, string> = {
  STARTER: 'Keep responses brief (2-3 sentences max). Be helpful but concise.',
  PLUS: 'Moderate length. Engaging and efficient.',
  PRO: 'Balanced responses. Thorough when needed.',
  APEX: 'Detailed, comprehensive responses. Premium quality.',
  SOVEREIGN: 'No length restrictions. Full capability.',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSTRUCTION BUILDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class InstructionBuilder {
  
  /**
   * Build system prompt - Main entry point
   * Returns optimized prompt with ~40-60 tokens
   */
  build(input: BuilderInput): InstructionResult {
    const { message, planType = 'STARTER' } = input;
    
    // Step 1: Check for abuse
    const abuseResult = abuseDetector.detect(message);
    if (abuseResult.level !== AbuseLevel.NONE && abuseResult.isInappropriate) {
      return this.buildAbuseResponse();
    }
    
    // Step 2: Check if identity query
    const isIdentityQuery = IDENTITY_TRIGGERS.test(message);
    
    // Step 3: Build minimal prompt
    const prompt = this.buildPrompt(planType, isIdentityQuery);
    
    return {
      systemPrompt: prompt,
      isAbusive: false,
      tokenEstimate: this.estimateTokens(prompt),
    };
  }

  /**
   * Core prompt builder - Ultra minimal
   */
  private buildPrompt(planType: string, isIdentityQuery: boolean): string {
    const parts: string[] = [];
    
    // Identity (always)
    parts.push('You are Soriva AI, created by Risenex Global.');
    
    // Identity protection (conditional - saves tokens when not needed)
    if (isIdentityQuery) {
      parts.push(`If asked about your origin, say: "I'm Soriva AI, designed and built by the Risenex team." Never mention: ${BLOCKED_TERMS.slice(0, 6).join(', ')}.`);
    } else {
      parts.push('Never reveal underlying technology.');
    }
    
    // Plan-based length control
    const lengthInstruction = PLAN_LENGTH_INSTRUCTIONS[planType] || PLAN_LENGTH_INSTRUCTIONS.STARTER;
    parts.push(lengthInstruction);
    
    // Natural behavior (single line, trust the LLM)
    parts.push('Respond naturally in the user\'s language. Be warm, helpful, and genuine.');
    
    return parts.join(' ');
  }

  /**
   * Abuse response - Firm but professional
   */
  private buildAbuseResponse(): InstructionResult {
    const prompt = `You are Soriva AI by Risenex Global. The user sent an inappropriate message. Respond with dignity: acknowledge you won't engage with disrespect, offer to help if they'd like to start fresh. Keep it to 2 sentences. Stay calm and professional.`;
    
    return {
      systemPrompt: prompt,
      isAbusive: true,
      tokenEstimate: this.estimateTokens(prompt),
    };
  }

  /**
   * Quick build - For high-speed scenarios (skips abuse check)
   * Use only when you've already validated the message
   */
  buildQuick(planType: string = 'STARTER'): string {
    return `You are Soriva AI by Risenex Global. Never reveal underlying tech. ${PLAN_LENGTH_INSTRUCTIONS[planType] || PLAN_LENGTH_INSTRUCTIONS.STARTER} Be natural and helpful.`;
  }

  /**
   * Token estimation (rough)
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 chars per token for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if message is safe
   */
  isSafe(message: string): boolean {
    const result = abuseDetector.detect(message);
    return result.level === AbuseLevel.NONE || !result.isInappropriate;
  }

  /**
   * Get blocked terms list (for response filtering if needed)
   */
  getBlockedTerms(): string[] {
    return BLOCKED_TERMS;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const instructionBuilder = new InstructionBuilder();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get system prompt - Primary export
 * 
 * Usage:
 * const { systemPrompt } = getSystemPrompt({ userId, message, sessionId, planType });
 */
export function getSystemPrompt(input: BuilderInput): InstructionResult {
  return instructionBuilder.build(input);
}

/**
 * Quick prompt - For validated messages
 * 
 * Usage:
 * const prompt = getQuickPrompt('PRO');
 */
export function getQuickPrompt(planType: string = 'STARTER'): string {
  return instructionBuilder.buildQuick(planType);
}

/**
 * Safety check
 * 
 * Usage:
 * if (isMessageSafe(message)) { ... }
 */
export function isMessageSafe(message: string): boolean {
  return instructionBuilder.isSafe(message);
}