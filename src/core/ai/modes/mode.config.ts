/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MODE CONFIGURATION v2.0 (INTEGRATED)
 * Single source of truth for all mode settings
 * Updated: February 25, 2026
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export type Mode = 'normal' | 'code';

export interface ModeConfig {
  temperature: number;
  maxTokens: number;
  diagramsEnabled: boolean;
  preferredModel: string;
  fallbackModel: string;
}

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
  normal: {
    temperature: 0.7,
    maxTokens: 500,
    diagramsEnabled: false,
    preferredModel: 'gemini-2.0-flash',
    fallbackModel: 'mistral-large-latest',
  },
  code: {
    temperature: 0.2,
    maxTokens: 1500,
    diagramsEnabled: false,
    preferredModel: 'devstral-medium-latest',
    fallbackModel: 'mistral-large-latest',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getModeConfig(mode: Mode): ModeConfig {
  return MODE_CONFIG[mode] || MODE_CONFIG.normal;
}

export function getPreferredModel(mode: Mode): string {
  return MODE_CONFIG[mode]?.preferredModel || 'gemini-2.0-flash';
}

export function getFallbackModel(mode: Mode): string {
  return MODE_CONFIG[mode]?.fallbackModel || 'mistral-large-latest';
}

export function getModeTemperature(mode: Mode): number {
  return MODE_CONFIG[mode]?.temperature || 0.7;
}

export function getModeMaxTokens(mode: Mode): number {
  return MODE_CONFIG[mode]?.maxTokens || 500;
}

export function isDiagramsEnabled(mode: Mode): boolean {
  return MODE_CONFIG[mode]?.diagramsEnabled || false;
}