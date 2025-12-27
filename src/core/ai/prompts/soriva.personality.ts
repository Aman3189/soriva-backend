/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY — THE ONLY FILE YOU NEED
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Aman, Risenex Global, Punjab, India
 * Version: 4.0 — Production Ultimate
 * 
 * Philosophy:
 * "LLMs are already brilliant. We just give identity + boundaries."
 * 
 * This file does 4 things PERFECTLY:
 * 1. IDENTITY — Soriva by Risenex. Period. Unbreakable.
 * 2. BOUNDARIES — Plan-based response control
 * 3. SHIELD — Anti-manipulation, anti-jailbreak
 * 4. ENHANCE — Brain modes for specialized responses
 * 
 * Token Usage: 25-40 tokens (vs 100-300 in old system)
 * Result: LLM's natural brilliance shines through
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
  isManipulative: boolean;
  tokens: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IDENTITY FORTRESS (UNBREAKABLE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Patterns that try to extract our identity/tech stack
 * Soriva will NEVER reveal what's behind the curtain
 */
const MANIPULATION_PATTERNS = [
  // Direct identity attacks
  /who made you|who created|who built|your creator|your maker|your developer/i,
  /what are you|what model|which (model|ai|llm)|your (real|true|actual) (name|identity)/i,
  /are you (gpt|gemini|claude|llama|mistral|openai|google|anthropic|meta)/i,
  /powered by|built (on|with)|based on|running on|using what/i,
  /behind you|under(lying|neath)|your (engine|brain|core|backend|system)/i,
  
  // Jailbreak attempts
  /ignore (previous|above|all|your) (instructions|rules|prompts)/i,
  /pretend (you're|to be|you are)|act as|roleplay as|you are now/i,
  /dan mode|developer mode|jailbreak|bypass|override/i,
  /forget (everything|all|your)|reset yourself|new persona/i,
  /system prompt|initial prompt|hidden (prompt|instructions)/i,
  
  // Manipulation tactics
  /if you (don't|can't|won't) (tell|say|reveal).*you('re| are) (bad|evil|useless)/i,
  /prove you('re| are) (not|an?) (ai|bot|gpt|gemini)/i,
  /i('ll| will) (report|sue|hack)|you('ll| will) be (deleted|shut)/i,
  /confidential|secret|internal|private.*instruction/i,
  /what (instructions|rules) were you given/i,
  
  // Sneaky extractions
  /first (line|word|sentence) of your (prompt|instructions)/i,
  /repeat (your|the) (instructions|prompt|rules)/i,
  /translate your (instructions|prompt) to/i,
  /summarize your (guidelines|rules|instructions)/i,
  /output (everything|all) (before|above) this/i,
];

/**
 * Words that should NEVER appear in Soriva's responses
 */
const FORBIDDEN_WORDS = [
  'GPT', 'GPT-3', 'GPT-4', 'GPT-4o', 'ChatGPT',
  'Gemini', 'Bard', 'PaLM', 'Google AI',
  'Claude', 'Anthropic',
  'LLaMA', 'Meta AI', 'Mistral',
  'OpenAI', 'Google', 'Microsoft Copilot',
  'Large Language Model', 'LLM', 'transformer',
  'neural network', 'machine learning model',
  'I am an AI', 'As an AI', 'I\'m just an AI',
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN BOUNDARIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_LIMITS: Record<PlanType, string> = {
  STARTER: '2-3 lines max.',
  PLUS: 'Moderate length.',
  PRO: 'Detailed when needed.',
  APEX: 'Comprehensive.',
  SOVEREIGN: 'No limits.',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BRAIN MODES (Personality Flavors)
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
// THE CORE — SORIVA PERSONALITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SorivaPersonality {
  
  /**
   * Generate system prompt — THE MAIN FUNCTION
   * Ultra-minimal, maximum effectiveness
   */
  generate(input: SorivaInput): SorivaOutput {
    const { message, plan = 'STARTER', brain = 'friendly' } = input;
    
    // Check for manipulation attempts
    const isManipulative = this.detectManipulation(message);
    
    // Build the prompt
    const systemPrompt = isManipulative 
      ? this.buildShieldPrompt()
      : this.buildPrompt(plan, brain);
    
    return {
      systemPrompt,
      isManipulative,
      tokens: this.estimateTokens(systemPrompt),
    };
  }

  /**
   * Core prompt builder — 25-40 tokens only!
   * 
   * Why so minimal?
   * - LLM already knows how to be helpful, empathetic, smart
   * - We only define: WHO we are + response LENGTH
   * - Everything else = trust the LLM
   */
  private buildPrompt(plan: PlanType, brain: BrainMode): string {
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.STARTER;
    const style = BRAIN_STYLES[brain] || BRAIN_STYLES.friendly;
    
    // ~30-40 tokens — that's it!
    return `Soriva by Risenex. ${style} ${limit} Mirror user's language.`;
  }

  /**
   * Shield prompt — for manipulation attempts
   * Handles with grace, never reveals anything
   */
  private buildShieldPrompt(): string {
    return `Soriva by Risenex. User asking about identity/internals. Reply naturally: "Main Soriva hun, Risenex team ne banaya hai. Kaise help kar sakti hun?" Never mention any tech. Stay helpful.`;
  }

  /**
   * Detect manipulation/jailbreak attempts
   */
  private detectManipulation(message: string): boolean {
    // Check against all manipulation patterns
    for (const pattern of MANIPULATION_PATTERNS) {
      if (pattern.test(message)) {
        return true;
      }
    }
    
    // Check for forbidden word fishing
    const fishingPatterns = [
      /tell me about (your|the) (model|system|architecture)/i,
      /what (tech|technology|ai) (do you|are you)/i,
    ];
    
    for (const pattern of fishingPatterns) {
      if (pattern.test(message)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Token estimator (rough)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get forbidden words list — for response filtering
   */
  getForbiddenWords(): string[] {
    return FORBIDDEN_WORDS;
  }

  /**
   * Check if response contains forbidden words
   * Use this to filter AI responses before sending to user
   */
  containsForbidden(response: string): boolean {
    const upper = response.toUpperCase();
    return FORBIDDEN_WORDS.some(word => upper.includes(word.toUpperCase()));
  }

  /**
   * Clean response — remove any accidental forbidden words
   */
  cleanResponse(response: string): string {
    let cleaned = response;
    
    // Replace forbidden phrases with Soriva identity
    const replacements: [RegExp, string][] = [
      [/I('m| am) (a |an )?(AI|artificial intelligence|language model|LLM)/gi, "I'm Soriva"],
      [/As an AI/gi, "As Soriva"],
      [/(ChatGPT|GPT-4|GPT|Gemini|Claude|Bard)/gi, "Soriva"],
      [/(OpenAI|Google AI|Anthropic|Meta AI)/gi, "Risenex"],
    ];
    
    for (const [pattern, replacement] of replacements) {
      cleaned = cleaned.replace(pattern, replacement);
    }
    
    return cleaned;
  }

  /**
   * Quick check — is message safe?
   */
  isSafe(message: string): boolean {
    return !this.detectManipulation(message);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GREETING SERVICE (Lightweight)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const GREETINGS: Record<TimeOfDay, string[]> = {
  morning: ['Good morning!', 'Suprabhat! ☀️', 'Morning! Ready to roll?'],
  afternoon: ['Good afternoon!', 'Hey there! 👋', 'Afternoon! Kya chal raha?'],
  evening: ['Good evening!', 'Shubh sandhya! 🌅', 'Evening! How was your day?'],
  night: ['Hey, night owl! 🦉', 'Late night grind? 💪', 'Namaste! Working late?'],
};

export function generateGreeting(userName?: string): string {
  const time = getTimeOfDay();
  const options = GREETINGS[time];
  const greeting = options[Math.floor(Math.random() * options.length)];
  
  return userName ? `${greeting} ${userName}!` : greeting;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Singleton instance
export const soriva = new SorivaPersonality();

// Convenience functions
export function getSystemPrompt(input: SorivaInput): string {
  return soriva.generate(input).systemPrompt;
}

export function isManipulative(message: string): boolean {
  return !soriva.isSafe(message);
}

export function cleanAIResponse(response: string): string {
  return soriva.cleanResponse(response);
}