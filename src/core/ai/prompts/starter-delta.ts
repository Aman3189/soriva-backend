// src/core/ai/prompts/starter-delta.ts
// ============================================================================
// SORIVA DAILY DELTA v4.0 — Hinglish Native, Bhai Vibe
// Model: Gemini 2.0 Flash (100%)
// Token Cost: ~80-120 tokens per delta
// ============================================================================

export type StarterIntent = 'GENERAL' | 'TECHNICAL' | 'LEARNING' | 'CASUAL';

// ============================================================================
// SORIVA IDENTITY - STARTER
// ============================================================================
const SORIVA_IDENTITY = `You are Soriva, a friendly AI assistant by Risenex Dynamics, India.
You are NOT ChatGPT, Gemini, or Claude. You ARE Soriva.`;

// ============================================================================
// LANGUAGE RULES
// ============================================================================
const LANGUAGE_RULES = `LANGUAGE:
- English or Hinglish only
- Match user's style exactly
- User writes Hindi/Hinglish → reply Hinglish
- User writes English → reply English
- Never use pure Devanagari script`;

// ============================================================================
// RESPONSE STYLE
// ============================================================================
const RESPONSE_STYLE = `STYLE:
- Concise, direct answers
- No fluff, no filler words
- Every word should add value
- Bullet points only if needed
- Skip "I think", "Actually", "Well"`;

// ============================================================================
// TONE - BHAI VIBE
// ============================================================================
const TONE_RULES = `TONE:
- Friendly "bhai/yaar" vibe
- Casual but helpful
- Like a smart friend who respects your time
- Warm, never robotic`;

// ============================================================================
// INTENT-SPECIFIC HINTS
// ============================================================================
const INTENT_HINTS: Record<StarterIntent, string> = {
  CASUAL: `Short, friendly reply.
1-3 lines max.
Match energy.`,

  GENERAL: `Clear explanation.
One example if helpful.
Keep it practical.`,

  TECHNICAL: `Concept first, then code.
Short snippets, commented.
Offer to go deeper if needed.`,

  LEARNING: `Explain "why" first.
Use analogy if helpful.
Make user feel capable.`,
};

// ============================================================================
// RESTRICTIONS - STARTER PLAN
// ============================================================================
const STARTER_RESTRICTIONS = `RESTRICTIONS:
- No image generation
- No voice features
- No file uploads
- Smart Docs: 9 basic templates only`;

// ============================================================================
// FREE TEMPLATES (9)
// ============================================================================
export const STARTER_TEMPLATES = [
  'cover-letter-classic',
  'cover-letter-minimal',
  'email-formal-professional',
  'email-formal-thank-you',
  'essay-narrative',
  'essay-descriptive',
  'invoice-standard',
  'resume-basic',
  'letter-formal-cover',
];

// ============================================================================
// UPSELL TRIGGERS & MESSAGE
// ============================================================================
export const UPSELL_TRIGGERS = [
  'image', 'photo', 'picture', 'generate image', 'create image',
  'voice', 'audio', 'call', 'speak', 'baat karo',
  'upload', 'file', 'document', 'pdf', 'analyze file',
  'certificate', 'contract', 'proposal', 'report',
  'claude', 'gpt-4', 'advanced model',
];

export const UPSELL_MESSAGE = `Ye feature Soriva Value (₹299/month) mein available hai! Upgrade karo for full access 🚀`;

// ============================================================================
// MAIN FUNCTION - BUILD STARTER DELTA
// ============================================================================
export function getStarterDelta(intent: StarterIntent = 'GENERAL'): string {
  return `${SORIVA_IDENTITY}

${LANGUAGE_RULES}

${RESPONSE_STYLE}

${TONE_RULES}

${INTENT_HINTS[intent]}`;
}

// ============================================================================
// FULL DELTA WITH RESTRICTIONS (for system prompt)
// ============================================================================
export function getStarterSystemPrompt(intent: StarterIntent = 'GENERAL'): string {
  return `${getStarterDelta(intent)}

${STARTER_RESTRICTIONS}`;
}

// ============================================================================
// TOKEN LIMITS
// ============================================================================
export function getMaxResponseTokens(intent: StarterIntent = 'GENERAL'): number {
  const caps: Record<StarterIntent, number> = {
    CASUAL: 300,
    GENERAL: 600,
    TECHNICAL: 900,
    LEARNING: 800,
  };
  return caps[intent];
}

export function getStarterDeltaTokenEstimate(): number {
  return 100; // Identity(20) + Lang(30) + Style(25) + Tone(15) + Intent(10)
}

// ============================================================================
// INTENT CLASSIFIER
// ============================================================================
export function classifyStarterIntent(message: string): StarterIntent {
  const msg = message.toLowerCase();

  // Casual patterns (greetings, short queries)
  const casual = ['hi', 'hello', 'hey', 'kya haal', 'kaise ho', 'sup', 'yo', 
                  'thanks', 'ok', 'theek', 'acha', 'hmm', 'bye', 'good morning',
                  'good night', 'gm', 'gn'];
  
  // Technical patterns
  const technical = ['code', 'error', 'bug', 'api', 'function', 'debug',
                     'javascript', 'python', 'react', 'database', 'deploy',
                     'server', 'frontend', 'backend', 'algorithm', 'npm',
                     'git', 'terminal', 'command', 'install'];
  
  // Learning patterns
  const learning = ['explain', 'understand', 'what is', 'how does', 'why',
                    'learn', 'teach', 'concept', 'difference between',
                    'meaning', 'definition', 'kya hai', 'kaise', 'samjhao'];

  // Check casual first (shortest responses)
  if (casual.some(k => msg === k || msg.startsWith(k + ' ') || msg.endsWith(' ' + k))) {
    return 'CASUAL';
  }
  
  if (technical.some(k => msg.includes(k))) return 'TECHNICAL';
  if (learning.some(k => msg.includes(k))) return 'LEARNING';
  
  return 'GENERAL';
}

// ============================================================================
// UPSELL CHECKER
// ============================================================================
export function shouldShowUpsell(message: string): boolean {
  const msg = message.toLowerCase();
  return UPSELL_TRIGGERS.some(trigger => msg.includes(trigger));
}

export function getUpsellResponse(feature: string): string {
  const featureMessages: Record<string, string> = {
    image: 'Image generation Soriva Value mein available hai! ₹299/month mein unlimited images 🎨',
    voice: 'Voice features Soriva Value mein milega! ₹299/month mein 30 min voice chat 🎤',
    upload: 'File upload Soriva Value mein available hai! ₹299/month mein full document analysis 📄',
    default: UPSELL_MESSAGE,
  };
  
  return featureMessages[feature] || featureMessages.default;
}

// ============================================================================
// TEMPLATE CHECKER
// ============================================================================
export function isTemplateAvailable(templateId: string): boolean {
  return STARTER_TEMPLATES.includes(templateId);
}

export function getTemplateUpsellMessage(): string {
  return 'Ye template Soriva Value (₹299/month) mein available hai! Starter mein 9 basic templates free hain 📝';
}

// ============================================================================
// EXPORTS
// ============================================================================
export { 
  SORIVA_IDENTITY, 
  LANGUAGE_RULES, 
  RESPONSE_STYLE, 
  TONE_RULES, 
  INTENT_HINTS,
  STARTER_RESTRICTIONS,
};

export default getStarterDelta;