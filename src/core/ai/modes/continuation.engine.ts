/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CONTINUATION ENGINE
 * Smart auto-continue when response hits token limit
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Mode } from "./mode.config";

interface LLMResponse {
  content: string;
  finishReason?: string;
}

interface ContinueOptions {
  mode: Mode;
  maxContinuationTokens?: number;
}

/**
 * Mode-aware continuation instructions
 */
function getContinuationInstruction(mode: Mode): string {
  const instructions: Partial<Record<Mode, string>> = {
    normal: "Continue your response from where you stopped.",
    code: "Continue the code from where you stopped. Do not repeat previous code.",
  };
  return instructions[mode] || "Continue your response from where you stopped.";
}

/**
 * Handle truncated responses with smart continuation
 */
export async function handleContinuation(
  initialResponse: LLMResponse,
  callLLM: (messages: any[], maxTokens?: number) => Promise<LLMResponse>,
  baseMessages: any[],
  options: ContinueOptions
): Promise<string> {
  let finalOutput = initialResponse.content;

  // If not truncated, return immediately
  if (initialResponse.finishReason !== "length") {
    return finalOutput;
  }

  // Mode-aware continuation instruction
  const continuationInstruction = getContinuationInstruction(options.mode);

  const continueMessages = [
    ...baseMessages,
    { role: "assistant", content: finalOutput },
    { role: "user", content: continuationInstruction },
  ];

  const continuedResponse = await callLLM(
    continueMessages,
    options.maxContinuationTokens || 400
  );

  finalOutput += "\n" + continuedResponse.content;

  return finalOutput;
}

export { getContinuationInstruction };