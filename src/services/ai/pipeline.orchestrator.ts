// src/services/ai/pipeline.orchestrator.ts
/**
 * SORIVA PIPELINE v10.0 — SIMPLIFIED
 */

import { buildSystemPrompt, getMaxTokens, isExtreme, EXTREME_RESPONSE, cleanResponse, PlanType } from '../../core/ai/prompts';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PipelineInput {
  userId: string;
  sessionId: string;
  userName?: string;
  planType?: PlanType;
  userMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface PipelineOutput {
  systemPrompt: string;
  maxTokens: number;
  directResponse: string | null;
  source: 'extreme-guard' | 'llm';
  flags: {
    skipLLM: boolean;
    isExtreme: boolean;
  };
  metrics: {
    processingTimeMs: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PIPELINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PipelineOrchestrator {
  
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    const startTime = Date.now();
    const { userMessage, planType = 'STARTER' } = input;

    // ONLY block extreme harmful content
    if (isExtreme(userMessage)) {
      return {
        systemPrompt: '',
        maxTokens: 0,
        directResponse: EXTREME_RESPONSE,
        source: 'extreme-guard',
        flags: { skipLLM: true, isExtreme: true },
        metrics: { processingTimeMs: Date.now() - startTime },
      };
    }

    // Build prompt
    const systemPrompt = buildSystemPrompt(planType as PlanType);
    const maxTokens = getMaxTokens(planType as PlanType);

    return {
      systemPrompt,
      maxTokens,
      directResponse: null,
      source: 'llm',
      flags: { skipLLM: false, isExtreme: false },
      metrics: { processingTimeMs: Date.now() - startTime },
    };
  }

  getHealthStatus() {
    return { status: 'healthy' as const };
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();

export { cleanResponse };