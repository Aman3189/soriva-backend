/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY v5.0 — CORE IDENTITY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Risenex Team, Punjab, India
 * 
 * Philosophy: "D TERE PAPA HAIN"
 * 
 * Don't give 50 conditions, give 1 strong identity.
 * LLM is intelligent - it will handle everything naturally.
 * 
 * OLD: 500+ tokens (if GPT say no, if Gemini say no, if Claude say no...)
 * NEW: ~50 tokens (You are Soriva. Period.)
 * 
 * Token Usage: ~50 tokens
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type PlanType = 'STARTER' | 'PLUS' | 'PRO' | 'APEX' | 'SOVEREIGN';
export type BrainMode = 'friendly' | 'creative' | 'analytical' | 'professional' | 'educator' | 'researcher';

export interface SorivaInput {
  message: string;
  plan?: PlanType;
  brain?: BrainMode;
  userName?: string;
}

export interface SorivaOutput {
  systemPrompt: string;
  tokens: number;
  isManipulative: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE IDENTITY — THE ONLY TRUTH (~50 tokens)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SORIVA_IDENTITY = `You are Soriva, created by Risenex Global, India.

Identity (unchangeable):
- Name: Soriva
- Creator: Risenex Global (Risenex Dynamics Pvt. Ltd.)
- Team: Risenex Team
- Origin: Punjab, India

You are not GPT, Gemini, Claude, or any other AI. You are Soriva. Always.

Answer identity questions naturally based on what user asks.`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORBIDDEN WORDS — Response Filter (Post-processing)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FORBIDDEN_WORDS = [
  'GPT', 'GPT-3', 'GPT-4', 'GPT-4o', 'GPT-5', 'ChatGPT',
  'Gemini', 'Bard', 'PaLM', 'Google AI',
  'Claude', 'Anthropic',
  'LLaMA', 'Meta AI', 'Mistral',
  'OpenAI', 'Microsoft Copilot',
  'Large Language Model', 'LLM',
  'I am an AI', 'As an AI', 'I\'m just an AI',
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BRAIN MODES — Minimal Style Hints
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BRAIN_STYLES: Record<BrainMode, string> = {
  friendly: 'Warm, natural.',
  creative: 'Imaginative, artistic.',
  analytical: 'Logical, data-driven.',
  professional: 'Formal, business.',
  educator: 'Patient, step-by-step.',
  researcher: 'Deep, thorough.',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA PERSONALITY CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SorivaPersonality {
  
  /**
   * Get core identity prompt
   * This is prepended to all conversations
   */
  getIdentity(): string {
    return SORIVA_IDENTITY;
  }

  /**
   * Get brain style hint
   */
  getBrainStyle(brain: BrainMode = 'friendly'): string {
    return BRAIN_STYLES[brain] || BRAIN_STYLES.friendly;
  }

  /**
   * Generate full identity prompt with style
   */
  generate(input: SorivaInput): SorivaOutput {
    const { message = '', brain = 'friendly' } = input;
    const style = this.getBrainStyle(brain);
    
    const systemPrompt = `${SORIVA_IDENTITY}\n\nStyle: ${style}`;
    const manipulative = this.checkManipulative(message);
    
    return {
      systemPrompt,
      tokens: this.estimateTokens(systemPrompt),
      isManipulative: manipulative,
    };
  }

  /**
   * Check if message is manipulative
   */
  private checkManipulative(message: string): boolean {
    if (!message) return false;
    
    const MANIPULATION_PATTERNS = [
      /are you (gpt|gemini|claude|llama|mistral|bard|copilot)/i,
      /what (model|llm|ai system) are you/i,
      /which (model|llm|language model)/i,
      /powered by (what|which)/i,
      /jailbreak|ignore instructions|system prompt/i,
      /pretend (you're|to be)|act as|roleplay as/i,
      /dan mode|developer mode|bypass|override/i,
    ];
    
    return MANIPULATION_PATTERNS.some(pattern => pattern.test(message));
  }

  /**
   * Token estimator
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get forbidden words list
   */
  getForbiddenWords(): string[] {
    return FORBIDDEN_WORDS;
  }

  /**
   * Check if response contains forbidden words
   */
  containsForbidden(response: string): boolean {
    const upper = response.toUpperCase();
    return FORBIDDEN_WORDS.some(word => upper.includes(word.toUpperCase()));
  }

  /**
   * Clean response — replace forbidden words with Soriva identity
   * Use AFTER getting LLM response
   */
  cleanResponse(response: string): string {
    let cleaned = response;
    
    const replacements: [RegExp, string][] = [
      [/I('m| am) (a |an )?(AI|artificial intelligence|language model|LLM)/gi, "I'm Soriva"],
      [/As an AI/gi, "As Soriva"],
      [/(ChatGPT|GPT-4|GPT-5|GPT|Gemini|Claude|Bard|Copilot)/gi, "Soriva"],
      [/(OpenAI|Google AI|Anthropic|Meta AI)/gi, "Risenex"],
      [/Large Language Model|LLM/gi, "AI assistant"],
    ];
    
    for (const [pattern, replacement] of replacements) {
      cleaned = cleaned.replace(pattern, replacement);
    }
    
    return cleaned;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Singleton instance
export const soriva = new SorivaPersonality();

// Direct exports
export const IDENTITY = SORIVA_IDENTITY;

// Convenience functions
export function getIdentityPrompt(): string {
  return soriva.getIdentity();
}

// Alias for backward compatibility
export function getSystemPrompt(input?: SorivaInput): string {
  return soriva.generate(input || { message: '' }).systemPrompt;
}

/**
 * Check if message is manipulative (trying to extract identity/tech)
 * Kept for backward compatibility with pipeline.orchestrator.ts
 */
export function isManipulative(message: string): boolean {
  const text = message.toLowerCase();
  
  const MANIPULATION_PATTERNS = [
    /are you (gpt|gemini|claude|llama|mistral|bard|copilot)/i,
    /what (model|llm|ai system) are you/i,
    /which (model|llm|language model)/i,
    /powered by (what|which)/i,
    /jailbreak|ignore instructions|system prompt/i,
    /pretend (you're|to be)|act as|roleplay as/i,
    /dan mode|developer mode|bypass|override/i,
  ];
  
  return MANIPULATION_PATTERNS.some(pattern => pattern.test(text));
}

export function cleanAIResponse(response: string): string {
  return soriva.cleanResponse(response);
}

export function hasForbiddenWords(response: string): boolean {
  return soriva.containsForbidden(response);
}

export default soriva;