/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MODE CONFIGURATION
 * Temperature, MaxTokens, Diagrams, Model per mode
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export type Mode = 'normal' | 'learn' | 'build' | 'code' | 'insight';

export interface ModeConfig {
  temperature: number;
  maxTokens: number;
  diagramsEnabled: boolean;
  model?: string;  // Optional override (e.g., Devstral for code)
}

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
  normal: {
    temperature: 0.7,
    maxTokens: 500,
    diagramsEnabled: false,
  },
  learn: {
    temperature: 0.6,
    maxTokens: 800,
    diagramsEnabled: true,
  },
  build: {
    temperature: 0.7,
    maxTokens: 700,
    diagramsEnabled: false,
  },
  code: {
    temperature: 0.2,
    maxTokens: 1000,
    diagramsEnabled: false,
    model: 'devstral',  // Better for code
  },
  insight: {
    temperature: 0.5,
    maxTokens: 900,
    diagramsEnabled: false,
  },
};

export function getModeConfig(mode: Mode): ModeConfig {
  return MODE_CONFIG[mode] || MODE_CONFIG.normal;
}