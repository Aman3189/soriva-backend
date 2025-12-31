// src/rag/config/rag-controller.config.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RAG Controller Configuration (100% Dynamic - ENV Driven)
// Pattern: FUNCTIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ControllerConfiguration {
  enableDetailedErrors: boolean;
  enableRequestLogging: boolean;
  enablePerformanceTracking: boolean;
  maxUploadSize: number;
  allowedOrigins: string[];
  rateLimitWindow: number;
  rateLimitMax: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

let cachedConfig: ControllerConfiguration | null = null;

const loadConfiguration = (): ControllerConfiguration => {
  return {
    enableDetailedErrors: process.env.RAG_DETAILED_ERRORS === 'true',
    enableRequestLogging: process.env.RAG_REQUEST_LOGGING !== 'false',
    enablePerformanceTracking: process.env.RAG_PERFORMANCE_TRACKING !== 'false',
    maxUploadSize: parseInt(process.env.RAG_MAX_UPLOAD_SIZE || '52428800', 10),
    allowedOrigins: (process.env.RAG_ALLOWED_ORIGINS || '*').split(','),
    rateLimitWindow: parseInt(process.env.RAG_RATE_LIMIT_WINDOW || '60000', 10),
    rateLimitMax: parseInt(process.env.RAG_RATE_LIMIT_MAX || '100', 10),
    logLevel: (process.env.RAG_LOG_LEVEL as ControllerConfiguration['logLevel']) || 'info',
  };
};

export const getControllerConfig = (): ControllerConfiguration => {
  if (!cachedConfig) {
    cachedConfig = loadConfiguration();
  }
  return cachedConfig;
};

export const reloadControllerConfig = (): ControllerConfiguration => {
  cachedConfig = loadConfiguration();
  return cachedConfig;
};

export default {
  get: getControllerConfig,
  reload: reloadControllerConfig,
};