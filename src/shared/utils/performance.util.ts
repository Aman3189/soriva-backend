// src/shared/utils/performance.util.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Performance Tracker Utility
// Pattern: FUNCTIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Logger, RequestContext } from './logger.util';

export interface PerformanceThresholds {
  fast: number;
  normal: number;
  slow: number;
  verySlow: number;
}

const defaultThresholds: PerformanceThresholds = {
  fast: 100,      // < 100ms
  normal: 500,    // 100-500ms
  slow: 1000,     // 500-1000ms
  verySlow: 5000, // > 5000ms
};

let enabled = true;
let thresholds = { ...defaultThresholds };

export const setPerformanceConfig = (config: {
  enabled?: boolean;
  thresholds?: Partial<PerformanceThresholds>;
}): void => {
  if (config.enabled !== undefined) enabled = config.enabled;
  if (config.thresholds) thresholds = { ...thresholds, ...config.thresholds };
};

export const track = (operation: string, duration: number, context: RequestContext): void => {
  if (!enabled) return;

  let status: string;
  if (duration < thresholds.fast) {
    status = '⚡ FAST';
  } else if (duration < thresholds.normal) {
    status = '✅ NORMAL';
  } else if (duration < thresholds.slow) {
    status = '⚠️ SLOW';
  } else {
    status = '🐌 VERY SLOW';
  }

  Logger.debug(`${status} ${operation}: ${duration}ms`, undefined, context);
};

export const measure = async <T>(
  operation: string,
  fn: () => Promise<T>,
  context: RequestContext
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await fn();
    track(operation, Date.now() - start, context);
    return result;
  } catch (error) {
    track(`${operation} (FAILED)`, Date.now() - start, context);
    throw error;
  }
};

// Namespace export for backward compatibility
export const PerformanceTracker = {
  track,
  measure,
  setConfig: setPerformanceConfig,
} as const;

export default PerformanceTracker;