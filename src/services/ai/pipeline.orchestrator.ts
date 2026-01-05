/**
 * SORIVA PIPELINE v6.0 — LLM-FIRST, ZERO REDUNDANCY
 * 
 * Only blocks ABUSE. Everything else = LLM handles naturally.
 */

import { googleSearchService } from '../web-search/google-search.service';
import type { SearchResult } from '../web-search/google-search.service';
import { SORIVA_IDENTITY, cleanResponse } from '../../core/ai/prompts/soriva.personality';

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
  };
  searchSources?: SearchResult[];
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
// PIPELINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PipelineOrchestrator {
  
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    const startTime = Date.now();
    const msg = input.userMessage;

    // ONLY HARD BLOCK: Abuse
    if (isAbusive(msg)) {
      return {
        systemPrompt: '',
        directResponse: "Respect se baat karo, phir madad karunga.",
        source: 'abuse-guard',
        flags: { skipLLM: true, isAbusive: true },
        metrics: { processingTimeMs: Date.now() - startTime },
      };
    }

    // EVERYTHING ELSE: LLM handles naturally
    let systemPrompt = SORIVA_IDENTITY;  // ✅ IMPORTED, not duplicated
    let searchResults: SearchResult[] = [];

    if (needsWebSearch(msg)) {
      searchResults = await this.performWebSearch(msg);
      if (searchResults.length > 0) {
        systemPrompt += this.buildSearchPrompt(searchResults);
      }
    }

    return {
      systemPrompt,
      directResponse: null,
      source: 'llm',
      flags: { skipLLM: false, isAbusive: false },
      metrics: { processingTimeMs: Date.now() - startTime },
      searchSources: searchResults.length > 0 ? searchResults : undefined,
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
    return `\n\nSources:\n${facts}\nCite [1],[2].`;
  }

  getHealthStatus() {
    return { status: 'healthy' as const };
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();

// Re-export cleanResponse for ai.controller.ts
export { cleanResponse }