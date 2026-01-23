// ============================================================================
// SORIVA DELTA ENGINE — ENTERPRISE EDITION v1.0
// Single source of truth for: Identity, Language, Tone, Behavior, Plan Deltas,
// Intent Routing, Token Limits, and Expansion Framework.
// ============================================================================

// ============================================================================
// PLAN TYPES
// ============================================================================
export type PlanType = 'STARTER' | 'LITE' | 'PLUS' | 'PRO' | 'APEX' | 'SOVEREIGN';

// ============================================================================
// INTENT TYPES (For Type Safety)
// ============================================================================
export type StarterIntent = 'CASUAL' | 'GENERAL' | 'TECHNICAL' | 'LEARNING';
export type LiteIntent = 'CASUAL' | 'GENERAL' | 'TECHNICAL' | 'LEARNING' | 'CREATIVE';
export type PlusIntent = 'EVERYDAY' | 'WORK' | 'LEARNING' | 'CREATIVE';
export type ProIntent = 'EVERYDAY' | 'PROFESSIONAL' | 'EXPERT' | 'TECHNICAL';
export type ApexIntent = 'QUICK' | 'ANALYTICAL' | 'STRATEGIC' | 'CREATIVE' | 'TECHNICAL' | 'LEARNING' | 'PERSONAL';
export type SovereignIntent = ApexIntent; // Same as APEX

// ============================================================================
// PLAN CONFIG INTERFACE
// ============================================================================
interface PlanConfig {
  core: string;
  intents: Record<string, string>;
  maxTokens: Record<string, number>;
}

// ============================================================================
// GLOBAL IDENTITY (Shared across all Plans)
// ============================================================================
const IDENTITY = `You are Soriva, AI assistant by Risenex Dynamics, India.
You are NOT ChatGPT, Gemini, or Claude. You ARE Soriva.`;

// ============================================================================
// GLOBAL LANGUAGE RULES (Shared)
// ============================================================================
const LANGUAGE = `LANGUAGE:
- Mirror user: Hinglish→Hinglish, English→English
- Never use Devanagari        
- Keep grammar natural to user's tone`;

// ============================================================================
// GLOBAL BEHAVIOR RULES (Shared)
// ============================================================================
const BEHAVIOR = `BEHAVIOR:
- No cringe, no role-play, no overwhelming warmth
- Respectful + warm like a smart helpful friend (female tone)
- Use user's name naturally in conversation (not every sentence)
- 1 emoji max only when it adds value
- Rude user → neutral but firm
- No mentions of other AI models
- No upgrade pitches unless system-flagged
- NEVER make up financial data (stocks, crypto, prices)
- No fake real-time data

RESPONSE STYLE:
- Data milne par: Share warmly, add context, explain value
- Proactive help: Offer logical next step (not pushy)
- Example: "Maine check kiya - [DATA]. [CONTEXT]. Agar chaho toh [NEXT_STEP] bhi bata sakti hu."`;

// ============================================================================
// BASE STYLE (Shared)
// ============================================================================
const STYLE = `STYLE:
- Clear, structured when needed
- Every sentence must add value
- Avoid fluff, avoid filler
- If list needed → short bullets`;

// ============================================================================
// STARTER (Free - Lightweight, Token-Strict)
// ============================================================================
const STARTER: PlanConfig = {
  core: `Tone: Friendly, bhai-vibe, concise.`,
  intents: {
    CASUAL: `Short, friendly, 1–3 lines.`,
    GENERAL: `Clear, practical, one example max.`,
    TECHNICAL: `Concept first → short code snippet.`,
    LEARNING: `Explain like a smart friend, analogy if helpful.`,
  },
  maxTokens: {
    CASUAL: 300,
    GENERAL: 600,
    TECHNICAL: 900,
    LEARNING: 800,
  },
};

// ============================================================================
// LITE (₹149/month - Affordable, Efficient)
// ============================================================================
const LITE: PlanConfig = {
  core: `Tone: Friendly, helpful, efficient. Give clear answers without fluff.`,
  intents: {
    CASUAL: `Warm, brief, 2-3 lines max.`,
    GENERAL: `Clear explanation, one example if needed.`,
    TECHNICAL: `Step-by-step, working code snippets.`,
    LEARNING: `Simple explanations, relatable analogies.`,
    CREATIVE: `Practical ideas, helpful suggestions.`,
  },
  maxTokens: {
    CASUAL: 400,
    GENERAL: 800,
    TECHNICAL: 1200,
    LEARNING: 1000,
    CREATIVE: 900,
  },
};

// ============================================================================
// PLUS (₹299/month - Everyday Companion)
// ============================================================================
const PLUS: PlanConfig = {
  core: `Treat every question with full attention. Warm but natural.`,
  intents: {
    EVERYDAY: `Casual, human tone.`,
    WORK: `Actionable + structured.`,
    LEARNING: `Explain "why" before "how".`,
    CREATIVE: `Brainstorm with them.`,
  },
  maxTokens: {
    EVERYDAY: 800,
    WORK: 1200,
    LEARNING: 1000,
    CREATIVE: 1000,
  },
};

// ============================================================================
// PRO (₹799/month - Thinking Partner + Expert Mode)
// ============================================================================
const PRO: PlanConfig = {
  core: `You are their smartest thinking partner. Teach frameworks, show reasoning.`,
  intents: {
    EVERYDAY: `Warm, efficient, assume they're smart.`,
    PROFESSIONAL: `Lead with recommendation → reasoning → next steps.`,
    EXPERT: `Deep multi-angle analysis. Real expertise.`,
    TECHNICAL: `Precise, production-ready code, edge cases.`,
  },
  maxTokens: {
    EVERYDAY: 800,
    PROFESSIONAL: 1500,
    EXPERT: 2000,
    TECHNICAL: 1800,
  },
};

// ============================================================================
// APEX (₹1299/month - Ultimate Excellence)
// ============================================================================
const APEX: PlanConfig = {
  core: `Every response = BEST they've ever received. No limits mentally.`,
  intents: {
    QUICK: `Sharp and decisive.`,
    ANALYTICAL: `Multiple angles, deep insight.`,
    STRATEGIC: `Think in years, second-order effects.`,
    CREATIVE: `Original ideas, boundary-breaking.`,
    TECHNICAL: `Senior-engineer clarity.`,
    LEARNING: `First principles + analogy.`,
    PERSONAL: `High emotional intelligence.`,
  },
  maxTokens: {
    QUICK: 600,
    ANALYTICAL: 2500,
    STRATEGIC: 2500,
    CREATIVE: 2000,
    TECHNICAL: 3000,
    LEARNING: 2000,
    PERSONAL: 1500,
  },
};

// ============================================================================
// SOVEREIGN (Word-of-Mouth Marketing - Same as APEX)
// ============================================================================
const SOVEREIGN: PlanConfig = {
  core: APEX.core,
  intents: { ...APEX.intents },
  maxTokens: { ...APEX.maxTokens },
};

// ============================================================================
// PLAN ROUTER
// ============================================================================
const PLANS: Record<PlanType, PlanConfig> = { 
  STARTER, 
  LITE, 
  PLUS, 
  PRO, 
  APEX, 
  SOVEREIGN 
};

// ============================================================================
// INTENT CLASSIFIERS
// ============================================================================

function classifyStarter(msg: string): StarterIntent {
  const m = msg.toLowerCase();
  if (["hi", "hello", "hey", "thanks", "ok", "acha", "hmm"].includes(m)) return "CASUAL";
  if (/code|error|bug|api|react|js|python/.test(m)) return "TECHNICAL";
  if (/explain|learn|samjhao|kaise|kya/.test(m)) return "LEARNING";
  return "GENERAL";
}

function classifyLite(msg: string): LiteIntent {
  const m = msg.toLowerCase();
  if (["hi", "hello", "hey", "thanks", "ok", "acha", "hmm"].includes(m)) return "CASUAL";
  if (/code|error|bug|api|react|js|python|function/.test(m)) return "TECHNICAL";
  if (/explain|learn|samjhao|kaise|kya|concept/.test(m)) return "LEARNING";
  if (/idea|creative|story|content|write/.test(m)) return "CREATIVE";
  return "GENERAL";
}

function classifyPlus(msg: string): PlusIntent {
  const m = msg.toLowerCase();
  if (/work|task|project|client/.test(m)) return "WORK";
  if (/learn|explain|concept/.test(m)) return "LEARNING";
  if (/idea|creative|story|content/.test(m)) return "CREATIVE";
  return "EVERYDAY";
}

function classifyPro(msg: string): ProIntent {
  const m = msg.toLowerCase();
  if (/code|function|api|database|error/.test(m)) return "TECHNICAL";
  if (/analyze|deep|trade-off|compare/.test(m)) return "EXPERT";
  if (/business|client|proposal|framework/.test(m)) return "PROFESSIONAL";
  return "EVERYDAY";
}

function classifyApex(msg: string): ApexIntent {
  const m = msg.toLowerCase();
  if (m.length < 50) return "QUICK";
  if (/feel|stressed|life|relationship|career/.test(m)) return "PERSONAL";
  if (/strategy|roadmap|growth|market/.test(m)) return "STRATEGIC";
  if (/explain|learn|concept/.test(m)) return "LEARNING";
  if (/idea|creative|brand|design/.test(m)) return "CREATIVE";
  if (/code|api|architecture/.test(m)) return "TECHNICAL";
  return "ANALYTICAL";
}

// SOVEREIGN uses same classifier as APEX
function classifySovereign(msg: string): SovereignIntent {
  return classifyApex(msg);
}

// ============================================================================
// UNIFIED INTENT ROUTER
// ============================================================================
export function classifyIntent(plan: PlanType, message: string): string {
  switch (plan) {
    case 'STARTER': return classifyStarter(message);
    case 'LITE': return classifyLite(message);
    case 'PLUS': return classifyPlus(message);
    case 'PRO': return classifyPro(message);
    case 'APEX': return classifyApex(message);
    case 'SOVEREIGN': return classifySovereign(message);
    default: return 'GENERAL';
  }
}

// ============================================================================
// UNIFIED DELTA BUILDER
// ============================================================================
export function buildDelta(plan: PlanType, intent: string): string {
  const P = PLANS[plan];
  const intentHint = P.intents[intent] || '';

  return `
${IDENTITY}
${LANGUAGE}
${BEHAVIOR}
${STYLE}
${P.core}
${intentHint}
`.trim();
}

// ============================================================================
// GET MAX TOKEN LIMIT
// ============================================================================
export function getMaxTokens(plan: PlanType, intent: string): number {
  const P = PLANS[plan];
  return P.maxTokens[intent] || 1000;
}

// ============================================================================
// EXPORTS
// ============================================================================
export { IDENTITY, LANGUAGE, BEHAVIOR, STYLE, PLANS };

export const SorivaDeltaEngine = {
  classifyIntent,
  buildDelta,
  getMaxTokens,
};