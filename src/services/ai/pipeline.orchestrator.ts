// src/services/ai/pipeline.orchestrator.ts
/**
 * SORIVA PIPELINE v10.1 — SIMPLIFIED
 * Updated: January 22, 2026 - Fixed getMaxTokens to include intent parameter
 */
import { 
  buildSystemPrompt, 
  getMaxTokens, 
  classifyIntent,  // ✅ Added
  isExtreme, 
  EXTREME_RESPONSE, 
  cleanResponse, 
  PlanType 
} from '../../core/ai/prompts';

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

    // ✅ FIXED: Classify intent first, then use it for both functions
    const intent = classifyIntent(planType as PlanType, userMessage);
    const systemPrompt = buildSystemPrompt(planType as PlanType, intent);
    const maxTokens = getMaxTokens(planType as PlanType, intent);

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