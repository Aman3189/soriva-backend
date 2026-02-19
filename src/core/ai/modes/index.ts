/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MODES - Main Entry Point
 * Export all modes + config
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Mode Prompts
export { LEARN_PROMPT, LEARN_TOKENS } from './learn.prompt';
export { BUILD_PROMPT, BUILD_TOKENS } from './build.prompt';
export { CODE_PROMPT, CODE_TOKENS } from './code.prompt';
export { INSIGHT_PROMPT, INSIGHT_TOKENS } from './insight.prompt';

// Config
export { Mode, ModeConfig, MODE_CONFIG, getModeConfig } from './mode.config';

// Continuation Engine
export { handleContinuation, getContinuationInstruction } from './continuation.engine';