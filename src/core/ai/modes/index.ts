/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MODES - Main Entry Point
 * Export all modes + config
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Mode Prompts
export { CODE_PROMPT, CODE_TOKENS } from './code.prompt';

// Config
export { Mode, ModeConfig, MODE_CONFIG, getModeConfig } from './mode.config';

// Continuation Engine
export { handleContinuation, getContinuationInstruction } from './continuation.engine';