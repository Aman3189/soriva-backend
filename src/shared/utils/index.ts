/**
 * SORIVA UTILS - BARREL EXPORT
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: Export all utility functions and classes
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { Logger, logger, LogLevel, Colors, type LogConfig, type LogEntry } from './logger';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FUTURE UTILITIES (Add as you create them)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Example future exports:
// export * from './helpers';
// export * from './validators';
// export * from './formatters';
// export * from './crypto';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE RE-EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Usage Examples:
 *
 * import { logger, Logger, LogLevel } from '@/utils';
 * import { Colors } from '@/utils';
 *
 * logger.info('Quick log');
 *
 * const customLogger = Logger.getInstance({ prefix: 'API' });
 * customLogger.warn('Warning message');
 */
