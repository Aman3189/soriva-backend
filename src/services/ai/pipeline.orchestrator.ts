// src/services/ai/pipeline.orchestrator.ts
/**
 * SORIVA PIPELINE v7.0 — COMPLETE INTEGRATION
 * 
 * Integrates: Identity + Tone + Delta + Context
 * Fixed: All type mismatches resolved, clean imports
 */

import { googleSearchService } from '../web-search/google-search.service';
import type { SearchResult } from '../web-search/google-search.service';
import { SORIVA_IDENTITY, cleanResponse } from '../../core/ai/prompts/soriva.personality';
import { getToneInstruction, getDeltaType } from '../../core/ai/prompts/tone.config';
import { ContextBuilder } from '../../core/ai/prompts/context.builder';

// Delta imports - CLEAN
import { getStarterDelta, StarterIntent } from '../../core/ai/prompts/starter-delta';
import { getPlusDelta } from '../../core/ai/prompts/plus-delta';
import { classifyPlusIntent } from '../../core/ai/prompts/plus-intent-classifier';
import { getProDelta } from '../../core/ai/prompts/pro-delta';
import { classifyProIntent } from '../../core/ai/prompts/pro-intent-classifier';
import { getApexDelta } from '../../core/ai/prompts/apex-delta';
import { classifyApexIntent } from '../../core/ai/prompts/apex-intent-classifier';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PipelineInput {
  userId: string;
  sessionId: string;
  userName?: string;
  planType?: string;
  userMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  
  // For context builder
  plan?: any;
  status?: {
    status: 'green' | 'yellow' | 'orange' | 'red' | 'empty';
    statusMessage: string;
    canChat: boolean;
  };
  boosters?: {
    cooldownToday: number;
    activeAddons: number;
  };
  credits?: {
    total: number;
    remaining: number;
  };
  temporal?: {
    lastActiveAt?: Date;
    sessionCount: number;
    activityPattern?: 'regular' | 'irregular' | 'declining' | 'increasing';
    avgSessionGap?: number;
    memoryDays: number;
  };
}

export interface PipelineOutput {
  systemPrompt: string;
  directResponse: string | null;
  source: 'abuse-guard' | 'llm';
  flags: {
    skipLLM: boolean;
    isAbusive: boolean;
  };
  metrics: {
    processingTimeMs: number;
    tokensEstimate: number;
  };
  searchSources?: SearchResult[];
  intent?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ABUSE GUARD — ONLY HARD BLOCK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ABUSE_PATTERNS = [
  /\b(fuck|shit|bastard|asshole|bitch|cunt)\b/i,
  /\b(chutiya|madarchod|bhenchod|gaand|lund|randi|bhosdike)\b/i,
  /\b(kill yourself|kys|mar ja)\b/i,
];

function isAbusive(msg: string): boolean {
  return ABUSE_PATTERNS.some(p => p.test(msg));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEB SEARCH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SEARCH_TRIGGERS = [
  /\b(today|aaj|kal|tomorrow|abhi)\b.*\b(news|weather|price|score)\b/i,
  /\b(live|current|latest|breaking)\b/i,
];

function needsWebSearch(msg: string): boolean {
  return SEARCH_TRIGGERS.some(p => p.test(msg));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STARTER INTENT CLASSIFIER (Local - Correct Types)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LEARNING_PATTERNS = [
  /explain|samjhao|what is|how does|why|concept|theory/i,
  /learn|teach|padhai|study|understand|basics/i,
];

const TECHNICAL_PATTERNS = [
  /code|error|bug|function|api|database|deploy|typescript|react/i,
];

function classifyStarterIntent(message: string): StarterIntent {
  if (LEARNING_PATTERNS.some(p => p.test(message))) return 'LEARNING';
  if (TECHNICAL_PATTERNS.some(p => p.test(message))) return 'TECHNICAL';
  return 'GENERAL';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELTA RESOLVER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getDeltaForPlan(planName: string, message: string): { delta: string; intent: string } {
  const deltaType = getDeltaType(planName);
  
  switch (deltaType) {
    case 'STARTER': {
      const intent = classifyStarterIntent(message);
      return { delta: getStarterDelta(intent), intent };
    }
    case 'PLUS': {
      const intent = classifyPlusIntent(message);
      return { delta: getPlusDelta(intent), intent };
    }
    case 'PRO': {
      const intent = classifyProIntent(message);
      return { delta: getProDelta(intent), intent };
    }
    case 'APEX': {
      const intent = classifyApexIntent(message);
      return { delta: getApexDelta(intent), intent };
    }
    default: {
      return { delta: getStarterDelta('GENERAL'), intent: 'GENERAL' };
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PIPELINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PipelineOrchestrator {
  
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    const startTime = Date.now();
    const msg = input.userMessage;
    const planName = input.planType || 'STARTER';

    // ONLY HARD BLOCK: Abuse
    if (isAbusive(msg)) {
      return {
        systemPrompt: '',
        directResponse: "Respect se baat karo, phir madad karunga.",
        source: 'abuse-guard',
        flags: { skipLLM: true, isAbusive: true },
        metrics: { processingTimeMs: Date.now() - startTime, tokensEstimate: 0 },
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BUILD SYSTEM PROMPT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // 1. Core Identity + Tone Scale
    let systemPrompt = SORIVA_IDENTITY;
    
    // 2. Human Tone (plan-based)
    const toneInstruction = getToneInstruction(planName);
    systemPrompt += `\n\n## TONE\n${toneInstruction}`;
    
    // 3. Delta (plan + intent based)
    const { delta, intent } = getDeltaForPlan(planName, msg);
    if (delta) {
      systemPrompt += `\n\n## BEHAVIOR\n${delta}`;
    }
    
    // 4. Context Layer (if plan and status available)
    if (input.plan && input.status) {
      const contextLayer = ContextBuilder.buildContextLayer({
        userId: input.userId,
        plan: input.plan,
        status: input.status,
        boosters: input.boosters || { cooldownToday: 0, activeAddons: 0 },
        credits: input.credits,
        temporal: input.temporal,
      });
      systemPrompt += `\n\n${contextLayer}`;
    }
    
    // 5. Web Search (if needed)
    let searchResults: SearchResult[] = [];
    if (needsWebSearch(msg)) {
      searchResults = await this.performWebSearch(msg);
      if (searchResults.length > 0) {
        systemPrompt += this.buildSearchPrompt(searchResults);
      }
    }

    // Estimate tokens
    const tokensEstimate = Math.ceil(systemPrompt.length / 4);

    return {
      systemPrompt,
      directResponse: null,
      source: 'llm',
      flags: { skipLLM: false, isAbusive: false },
      metrics: { 
        processingTimeMs: Date.now() - startTime,
        tokensEstimate,
      },
      searchSources: searchResults.length > 0 ? searchResults : undefined,
      intent,
    };
  }

  private async performWebSearch(query: string): Promise<SearchResult[]> {
    try {
      const results = await googleSearchService.search(query, { numResults: 3 });
      return results.slice(0, 3);
    } catch {
      return [];
    }
  }

  private buildSearchPrompt(results: SearchResult[]): string {
    const facts = results.map((r, i) => 
      `[${i + 1}] ${r.title}: ${r.snippet.split('.')[0]}`
    ).join('\n');
    return `\n\n## SOURCES\n${facts}\nCite [1],[2] when using this info.`;
  }

  getHealthStatus() {
    return { status: 'healthy' as const };
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();

export { cleanResponse };