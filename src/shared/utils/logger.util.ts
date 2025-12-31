// src/shared/utils/logger.util.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared Logger Utility (Enhanced with Colors & Request Tracking)
// Pattern: FUNCTIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Request } from 'express';

export interface RequestContext {
  requestId: string;
  userId?: string;
  endpoint: string;
  method: string;
  startTime: number;
  ip?: string;
  userAgent?: string;
}

export interface LoggerConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableRequestLogging: boolean;
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

let loggerConfig: LoggerConfig = {
  logLevel: 'info',
  enableRequestLogging: true,
};

export const setLoggerConfig = (config: Partial<LoggerConfig>): void => {
  loggerConfig = { ...loggerConfig, ...config };
};

const getTimestamp = (): string => new Date().toISOString();

const formatMessage = (level: string, message: string, context?: RequestContext): string => {
  const timestamp = getTimestamp();
  const reqId = context?.requestId ? `[${context.requestId.slice(0, 8)}]` : '';
  const userId = context?.userId ? `[User: ${context.userId.slice(0, 8)}]` : '';
  return `${timestamp} ${level} ${reqId}${userId} ${message}`;
};

const shouldLog = (level: 'debug' | 'info' | 'warn' | 'error'): boolean => {
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentIndex = levels.indexOf(loggerConfig.logLevel);
  const targetIndex = levels.indexOf(level);
  return targetIndex >= currentIndex;
};

export const info = (message: string, context?: RequestContext): void => {
  if (shouldLog('info')) {
    console.log(`${colors.cyan}${formatMessage('INFO', message, context)}${colors.reset}`);
  }
};

export const success = (message: string, context?: RequestContext): void => {
  if (shouldLog('info')) {
    console.log(`${colors.green}${formatMessage('SUCCESS', message, context)}${colors.reset}`);
  }
};

export const warn = (message: string, context?: RequestContext): void => {
  if (shouldLog('warn')) {
    console.warn(`${colors.yellow}${formatMessage('WARN', message, context)}${colors.reset}`);
  }
};

export const error = (message: string, err?: any, context?: RequestContext): void => {
  if (shouldLog('error')) {
    console.error(`${colors.red}${formatMessage('ERROR', message, context)}${colors.reset}`);
    if (err) {
      console.error(`${colors.red}${err.stack || err}${colors.reset}`);
    }
  }
};

export const debug = (message: string, data?: any, context?: RequestContext): void => {
  if (shouldLog('debug')) {
    console.log(`${colors.dim}${formatMessage('DEBUG', message, context)}${colors.reset}`);
    if (data) {
      console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  }
};

export const request = (req: Request, context: RequestContext): void => {
  if (loggerConfig.enableRequestLogging) {
    info(`${colors.magenta}→ ${req.method} ${req.path}${colors.reset}`, context);
  }
};

export const response = (statusCode: number, processingTime: number, context: RequestContext): void => {
  if (loggerConfig.enableRequestLogging) {
    const color = statusCode < 400 ? colors.green : colors.red;
    info(`${color}← ${statusCode} (${processingTime}ms)${colors.reset}`, context);
  }
};

// Namespace export for backward compatibility
export const Logger = {
  info,
  success,
  warn,
  error,
  debug,
  request,
  response,
  setConfig: setLoggerConfig,
} as const;

export default Logger;