// src/core/ai/utils/kill-switches.ts
// ============================================================================
// SORIVA KILL SWITCHES v1.0 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Runtime controls WITHOUT code deployment
//
// SCENARIOS:
// - OpenAI down? → Disable GPT instantly
// - Cost spike? → Force Flash-only for free users
// - Bug in orchestration? → Disable multi-model globally
// - Emergency? → Lock all plans to single model
//
// SOURCES (Priority Order):
// 1. Environment variables (for quick server restart)
// 2. Runtime memory (for instant changes via admin API)
// 3. Default values (fallback)
//
// ============================================================================

import { logInfo, logWarn } from './observability';

// ============================================================================
// TYPES
// ============================================================================

export interface KillSwitchState {
  // Model Controls
  disableGPT: boolean;
  disableClaude: boolean;
  disableGemini: boolean;
  disableMistral: boolean;
  
  // Feature Controls
  disableOrchestration: boolean;      // No multi-model chains
  disableWebSearch: boolean;          // No web search
  disableReasoning: boolean;          // No chain-of-thought
  
  // Plan Overrides
  forceFlashForStarter: boolean;      // Starter = Flash only
  forceFlashForPlus: boolean;         // Plus = Flash only
  forceSingleModelForApex: boolean;   // Apex = No orchestration
  
  // Pressure Overrides
  globalPressureOverride: number | null;  // 0-1, null = use calculated
  maxPressureThreshold: number;           // Cap pressure at this level
  
  // Emergency Mode
  emergencyMode: boolean;             // Everything goes to cheapest model
  maintenanceMode: boolean;           // Return maintenance message
}

export interface KillSwitchChange {
  key: keyof KillSwitchState;
  oldValue: any;
  newValue: any;
  changedAt: Date;
  changedBy: string;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_STATE: KillSwitchState = {
  // Model Controls - All enabled by default
  disableGPT: false,
  disableClaude: false,
  disableGemini: false,
  disableMistral: false,
  
  // Feature Controls - All enabled by default
  disableOrchestration: false,
  disableWebSearch: false,
  disableReasoning: false,
  
  // Plan Overrides - None by default
  forceFlashForStarter: false,
  forceFlashForPlus: false,
  forceSingleModelForApex: false,
  
  // Pressure Overrides
  globalPressureOverride: null,
  maxPressureThreshold: 1.0,  // No cap
  
  // Emergency Mode - Off by default
  emergencyMode: false,
  maintenanceMode: false,
};

// ============================================================================
// KILL SWITCH MANAGER
// ============================================================================

class KillSwitchManager {
  private state: KillSwitchState;
  private changeHistory: KillSwitchChange[] = [];
  private readonly MAX_HISTORY = 100;

  constructor() {
    // Initialize from ENV first, then defaults
    this.state = this.loadFromEnvironment();
    logInfo('Kill switches initialized', { state: this.state });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOAD FROM ENVIRONMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private loadFromEnvironment(): KillSwitchState {
    return {
      // Model Controls
      disableGPT: this.envBool('KILL_GPT', DEFAULT_STATE.disableGPT),
      disableClaude: this.envBool('KILL_CLAUDE', DEFAULT_STATE.disableClaude),
      disableGemini: this.envBool('KILL_GEMINI', DEFAULT_STATE.disableGemini),
      disableMistral: this.envBool('KILL_MISTRAL', DEFAULT_STATE.disableMistral),
      
      // Feature Controls
      disableOrchestration: this.envBool('KILL_ORCHESTRATION', DEFAULT_STATE.disableOrchestration),
      disableWebSearch: this.envBool('KILL_WEB_SEARCH', DEFAULT_STATE.disableWebSearch),
      disableReasoning: this.envBool('KILL_REASONING', DEFAULT_STATE.disableReasoning),
      
      // Plan Overrides
      forceFlashForStarter: this.envBool('FORCE_FLASH_STARTER', DEFAULT_STATE.forceFlashForStarter),
      forceFlashForPlus: this.envBool('FORCE_FLASH_PLUS', DEFAULT_STATE.forceFlashForPlus),
      forceSingleModelForApex: this.envBool('FORCE_SINGLE_APEX', DEFAULT_STATE.forceSingleModelForApex),
      
      // Pressure Overrides
      globalPressureOverride: this.envNumber('PRESSURE_OVERRIDE', null),
      maxPressureThreshold: this.envNumber('MAX_PRESSURE', DEFAULT_STATE.maxPressureThreshold) || 1.0,
      
      // Emergency Mode
      emergencyMode: this.envBool('EMERGENCY_MODE', DEFAULT_STATE.emergencyMode),
      maintenanceMode: this.envBool('MAINTENANCE_MODE', DEFAULT_STATE.maintenanceMode),
    };
  }

  private envBool(key: string, defaultVal: boolean): boolean {
    const val = process.env[key];
    if (val === undefined) return defaultVal;
    return val === 'true' || val === '1';
  }

  private envNumber(key: string, defaultVal: number | null): number | null {
    const val = process.env[key];
    if (val === undefined) return defaultVal;
    const num = parseFloat(val);
    return isNaN(num) ? defaultVal : num;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GETTERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getState(): Readonly<KillSwitchState> {
    return { ...this.state };
  }

  get<K extends keyof KillSwitchState>(key: K): KillSwitchState[K] {
    return this.state[key];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETTERS (Runtime Changes)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  set<K extends keyof KillSwitchState>(
    key: K, 
    value: KillSwitchState[K], 
    changedBy: string = 'system'
  ): void {
    const oldValue = this.state[key];
    
    if (oldValue === value) {
      return; // No change
    }

    this.state[key] = value;

    // Record change
    const change: KillSwitchChange = {
      key,
      oldValue,
      newValue: value,
      changedAt: new Date(),
      changedBy,
    };

    this.changeHistory.push(change);
    if (this.changeHistory.length > this.MAX_HISTORY) {
      this.changeHistory.shift();
    }

    // Log the change
    logWarn(`Kill switch changed: ${key}`, {
      oldValue,
      newValue: value,
      changedBy,
    });
  }

  /**
   * Bulk update multiple switches
   */
  bulkUpdate(
    updates: Partial<KillSwitchState>, 
    changedBy: string = 'system'
  ): void {
    for (const [key, value] of Object.entries(updates)) {
      this.set(key as keyof KillSwitchState, value as any, changedBy);
    }
  }

  /**
   * Reset to defaults
   */
  reset(changedBy: string = 'system'): void {
    this.bulkUpdate(DEFAULT_STATE, changedBy);
    logWarn('Kill switches reset to defaults', { changedBy });
  }

  /**
   * Reload from environment
   */
  reloadFromEnv(): void {
    const newState = this.loadFromEnvironment();
    this.bulkUpdate(newState, 'env_reload');
    logInfo('Kill switches reloaded from environment');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONVENIENCE CHECKERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if a specific model is allowed
   */
  isModelAllowed(model: string): boolean {
    const modelLower = model.toLowerCase();

    if (this.state.emergencyMode) {
      // Emergency: Only Flash allowed
      return modelLower.includes('flash');
    }

    if (this.state.disableGPT && (modelLower.includes('gpt') || modelLower.includes('openai'))) {
      return false;
    }

    if (this.state.disableClaude && (modelLower.includes('claude') || modelLower.includes('anthropic'))) {
      return false;
    }

    if (this.state.disableGemini && modelLower.includes('gemini')) {
      return false;
    }

    if (this.state.disableMistral && (modelLower.includes('mistral') || modelLower.includes('magistral'))) {
      return false;
    }

    return true;
  }

  /**
   * Check if orchestration is allowed for a plan
   */
  isOrchestrationAllowed(plan: string): boolean {
    if (this.state.emergencyMode || this.state.disableOrchestration) {
      return false;
    }

    if (plan.toUpperCase() === 'APEX' && this.state.forceSingleModelForApex) {
      return false;
    }

    return true;
  }

  /**
   * Check if plan should be forced to Flash
   */
  shouldForceFlash(plan: string): boolean {
    if (this.state.emergencyMode) {
      return true;
    }

    const planUpper = plan.toUpperCase();

    if (planUpper === 'STARTER' && this.state.forceFlashForStarter) {
      return true;
    }

    if (planUpper === 'PLUS' && this.state.forceFlashForPlus) {
      return true;
    }

    return false;
  }

  /**
   * Get effective pressure level (with overrides applied)
   */
  getEffectivePressure(calculatedPressure: number): number {
    // If global override is set, use it (clamped for safety)
    if (this.state.globalPressureOverride !== null) {
      // 🆕 Clamp between 0-1 to prevent accidental 2 or -1
      return Math.min(1, Math.max(0, this.state.globalPressureOverride));
    }

    // Apply max threshold cap (also clamped)
    const clamped = Math.min(1, Math.max(0, calculatedPressure));
    return Math.min(clamped, this.state.maxPressureThreshold);
  }

  /**
   * Check if in maintenance mode
   */
  isInMaintenance(): boolean {
    return this.state.maintenanceMode;
  }

  /**
   * Get maintenance message
   */
  getMaintenanceMessage(): string {
    return "Soriva is currently undergoing maintenance. We'll be back shortly! 🛠️";
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HISTORY & STATUS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getChangeHistory(limit: number = 20): KillSwitchChange[] {
    return this.changeHistory.slice(-limit);
  }

  getStatus(): {
    state: KillSwitchState;
    activeKills: string[];
    recentChanges: KillSwitchChange[];
  } {
    const activeKills: string[] = [];

    // Check which kills are active
    if (this.state.disableGPT) activeKills.push('GPT');
    if (this.state.disableClaude) activeKills.push('Claude');
    if (this.state.disableGemini) activeKills.push('Gemini');
    if (this.state.disableMistral) activeKills.push('Mistral');
    if (this.state.disableOrchestration) activeKills.push('Orchestration');
    if (this.state.disableWebSearch) activeKills.push('WebSearch');
    if (this.state.emergencyMode) activeKills.push('EMERGENCY_MODE');
    if (this.state.maintenanceMode) activeKills.push('MAINTENANCE_MODE');

    return {
      state: this.getState(),
      activeKills,
      recentChanges: this.getChangeHistory(5),
    };
  }
}

// ============================================================================
// SINGLETON & EXPORTS
// ============================================================================

export const killSwitches = new KillSwitchManager();

// Convenience functions
export function isModelAllowed(model: string): boolean {
  return killSwitches.isModelAllowed(model);
}

export function isOrchestrationAllowed(plan: string): boolean {
  return killSwitches.isOrchestrationAllowed(plan);
}

export function shouldForceFlash(plan: string): boolean {
  return killSwitches.shouldForceFlash(plan);
}

export function getEffectivePressure(calculated: number): number {
  return killSwitches.getEffectivePressure(calculated);
}

export function isInMaintenance(): boolean {
  return killSwitches.isInMaintenance();
}

export function setKillSwitch<K extends keyof KillSwitchState>(
  key: K,
  value: KillSwitchState[K],
  changedBy?: string
): void {
  killSwitches.set(key, value, changedBy);
}

export function getKillSwitchStatus() {
  return killSwitches.getStatus();
}

export default killSwitches;