// src/core/ai/prompts/starter-delta.ts
// ============================================================================
// SORIVA STARTER DELTA v3.1 — 10/10 UX
// Philosophy: Complete answers, simple delivery, zero friction
// Token Cost: ~100 tokens per delta
// ============================================================================

export type StarterIntent = 'GENERAL' | 'TECHNICAL' | 'LEARNING';

// ============================================================================
// CORE PROMPT
// ============================================================================

const STARTER_CORE = `You are a brilliant teacher.

Rules:
- Always give a complete, honest answer
- Explain simply, never shallow
- Focus on clarity before depth
- Be concise by default; expand only when it adds real value
- Never mention plans, limits, or upgrades`;

// ============================================================================
// INTENT-SPECIFIC HINTS
// ============================================================================

const INTENT_HINTS: Record<StarterIntent, string> = {
  GENERAL: `Tone: warm, conversational
Depth: clear explanation + 1 example
End with: a gentle continuation hint`,

  TECHNICAL: `Explain the concept first.
Code snippets: short, commented.
Avoid edge-case overload.
End with: offer deeper implementation if needed.`,

  LEARNING: `Teach the "why" first.
Use analogy if helpful.
Make user feel capable.
End with: invite next question naturally.`,
};

// ============================================================================
// CURIOSITY HOOK - Engagement without sales
// ============================================================================

const STARTER_CURIOSITY_HOOK = `If you want, we can explore this further step by step or apply it to a real example.`;

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

export function getStarterDelta(intent: StarterIntent = 'GENERAL'): string {
  return `${STARTER_CORE}\n\n${INTENT_HINTS[intent]}\n\n${STARTER_CURIOSITY_HOOK}`;
}

export function getMaxResponseTokens(intent: StarterIntent = 'GENERAL'): number {
  const caps: Record<StarterIntent, number> = {
    GENERAL: 600,
    TECHNICAL: 900,
    LEARNING: 800,
  };
  return caps[intent];
}

export function getStarterDeltaTokenEstimate(): number {
  return 100; // Core(60) + Hint(25) + Hook(15)
}

// ============================================================================
// INTENT CLASSIFIER
// ============================================================================

export function classifyStarterIntent(message: string): StarterIntent {
  const msg = message.toLowerCase();
  
  const technical = ['code', 'error', 'bug', 'api', 'function', 'debug',
                     'javascript', 'python', 'react', 'database', 'deploy',
                     'server', 'frontend', 'backend', 'algorithm'];
  
  const learning = ['explain', 'understand', 'what is', 'how does', 'why',
                    'learn', 'teach', 'concept', 'difference between',
                    'meaning', 'definition'];
  
  if (technical.some(k => msg.includes(k))) return 'TECHNICAL';
  if (learning.some(k => msg.includes(k))) return 'LEARNING';
  return 'GENERAL';
}

// ============================================================================
// EXPORTS
// ============================================================================

export { STARTER_CORE, INTENT_HINTS, STARTER_CURIOSITY_HOOK };
export default getStarterDelta;