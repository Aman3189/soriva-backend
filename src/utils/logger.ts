/**
 * SORIVA LOGGER UTILITY
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: Centralized logging with colors, timestamps, and log levels
 *
 * Features:
 * - Singleton pattern
 * - Color-coded console output
 * - Log levels (debug, info, warn, error)
 * - Timestamps
 * - Structured logging
 * - Production-safe (no debug logs in prod)
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & ENUMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogConfig {
  level: LogLevel;
  enableColors: boolean;
  enableTimestamps: boolean;
  prefix?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: any;
  error?: Error;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANSI COLOR CODES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',

  // Foreground colors
  Black: '\x1b[30m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m',
  White: '\x1b[37m',
  Gray: '\x1b[90m',

  // Background colors
  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGGER CLASS (SINGLETON)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class Logger {
  private static instance: Logger;
  private config: LogConfig;
  private logHistory: LogEntry[] = [];
  private readonly maxHistorySize = 1000; // Keep last 1000 logs

  private constructor(config?: Partial<LogConfig>) {
    const isDev = process.env.NODE_ENV === 'development';

    this.config = {
      level: isDev ? LogLevel.DEBUG : LogLevel.INFO,
      enableColors: true,
      enableTimestamps: true,
      prefix: '',
      ...config,
    };
  }

  /**
   * Get singleton instance of Logger
   */
  public static getInstance(config?: Partial<LogConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    Logger.instance = null as any;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC LOGGING METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Log debug message (only in development)
   */
  public debug(message: string, context?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log info message
   */
  public info(message: string, context?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, context);
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, context?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, context);
    }
  }

  /**
   * Log error message
   */
  public error(message: string, error?: Error | any, context?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.log(LogLevel.ERROR, message, context, error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CORE LOGGING LOGIC
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Core log method
   */
  private log(level: LogLevel, message: string, context?: any, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    // Add to history
    this.addToHistory(entry);

    // Format and print to console
    const formattedMessage = this.formatMessage(entry);
    this.printToConsole(level, formattedMessage);

    // Print context if provided
    if (context !== undefined) {
      this.printContext(level, context);
    }

    // Print error stack if provided
    if (error && error.stack) {
      this.printError(error);
    }
  }

  /**
   * Format log message with colors and timestamp
   */
  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp } = entry;

    let formatted = '';

    // Add timestamp
    if (this.config.enableTimestamps) {
      const timeStr = this.formatTimestamp(timestamp);
      formatted += this.config.enableColors
        ? `${Colors.Gray}${timeStr}${Colors.Reset} `
        : `${timeStr} `;
    }

    // Add log level with color
    const levelStr = this.formatLevel(level);
    formatted += levelStr + ' ';

    // Add prefix if configured
    if (this.config.prefix) {
      formatted += this.config.enableColors
        ? `${Colors.Cyan}[${this.config.prefix}]${Colors.Reset} `
        : `[${this.config.prefix}] `;
    }

    // Add message
    formatted += message;

    return formatted;
  }

  /**
   * Format log level with colors
   */
  private formatLevel(level: LogLevel): string {
    if (!this.config.enableColors) {
      return `[${level}]`;
    }

    switch (level) {
      case LogLevel.DEBUG:
        return `${Colors.Gray}[DEBUG]${Colors.Reset}`;

      case LogLevel.INFO:
        return `${Colors.Blue}[INFO]${Colors.Reset}`;

      case LogLevel.WARN:
        return `${Colors.Yellow}[WARN]${Colors.Reset}`;

      case LogLevel.ERROR:
        return `${Colors.Red}[ERROR]${Colors.Reset}`;

      default:
        return `[${level}]`;
    }
  }

  /**
   * Format timestamp
   */
  private formatTimestamp(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const ms = date.getMilliseconds().toString().padStart(3, '0');

    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  /**
   * Print to console based on log level
   */
  private printToConsole(level: LogLevel, message: string): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;

      case LogLevel.INFO:
        console.info(message);
        break;

      case LogLevel.WARN:
        console.warn(message);
        break;

      case LogLevel.ERROR:
        console.error(message);
        break;

      default:
        console.log(message);
    }
  }

  /**
   * Print context object
   */
  private printContext(level: LogLevel, context: any): void {
    const color = this.getColorForLevel(level);

    if (this.config.enableColors) {
      console.log(`${color}${Colors.Dim}Context:${Colors.Reset}`, context);
    } else {
      console.log('Context:', context);
    }
  }

  /**
   * Print error stack trace
   */
  private printError(error: Error): void {
    if (this.config.enableColors) {
      console.error(`${Colors.Red}${Colors.Dim}${error.stack}${Colors.Reset}`);
    } else {
      console.error(error.stack);
    }
  }

  /**
   * Get color for log level
   */
  private getColorForLevel(level: LogLevel): string {
    if (!this.config.enableColors) {
      return '';
    }

    switch (level) {
      case LogLevel.DEBUG:
        return Colors.Gray;
      case LogLevel.INFO:
        return Colors.Blue;
      case LogLevel.WARN:
        return Colors.Yellow;
      case LogLevel.ERROR:
        return Colors.Red;
      default:
        return Colors.White;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HISTORY MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Add log entry to history
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);

    // Keep history size under control
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift(); // Remove oldest entry
    }
  }

  /**
   * Get log history
   */
  public getHistory(level?: LogLevel, limit?: number): LogEntry[] {
    let history = this.logHistory;

    // Filter by level if specified
    if (level) {
      history = history.filter((entry) => entry.level === level);
    }

    // Limit results if specified
    if (limit && limit > 0) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Clear log history
   */
  public clearHistory(): void {
    this.logHistory = [];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURATION & UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= configLevelIndex;
  }

  /**
   * Update logger configuration
   */
  public configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): LogConfig {
    return { ...this.config };
  }

  /**
   * Set log level
   */
  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable colors
   */
  public setColors(enabled: boolean): void {
    this.config.enableColors = enabled;
  }

  /**
   * Enable/disable timestamps
   */
  public setTimestamps(enabled: boolean): void {
    this.config.enableTimestamps = enabled;
  }

  /**
   * Set prefix for all logs
   */
  public setPrefix(prefix: string): void {
    this.config.prefix = prefix;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SPECIALIZED LOGGING METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Log with custom color (always prints, ignores level)
   */
  public custom(message: string, color: string = Colors.White): void {
    if (this.config.enableColors) {
      console.log(`${color}${message}${Colors.Reset}`);
    } else {
      console.log(message);
    }
  }

  /**
   * Log success message (green)
   */
  public success(message: string, context?: any): void {
    const successMessage = this.config.enableColors
      ? `${Colors.Green}✓${Colors.Reset} ${message}`
      : `✓ ${message}`;

    this.info(successMessage, context);
  }

  /**
   * Log failure message (red)
   */
  public fail(message: string, error?: Error, context?: any): void {
    const failMessage = this.config.enableColors
      ? `${Colors.Red}✗${Colors.Reset} ${message}`
      : `✗ ${message}`;

    this.error(failMessage, error, context);
  }

  /**
   * Log section header (for organizing logs)
   */
  public section(title: string): void {
    const line = '━'.repeat(60);

    if (this.config.enableColors) {
      console.log(`\n${Colors.Cyan}${Colors.Bright}${line}`);
      console.log(`${title}`);
      console.log(`${line}${Colors.Reset}\n`);
    } else {
      console.log(`\n${line}`);
      console.log(title);
      console.log(`${line}\n`);
    }
  }

  /**
   * Log table (for structured data)
   */
  public table(data: any): void {
    console.table(data);
  }

  /**
   * Log JSON (pretty printed)
   */
  public json(data: any): void {
    const jsonStr = JSON.stringify(data, null, 2);

    if (this.config.enableColors) {
      console.log(`${Colors.Gray}${jsonStr}${Colors.Reset}`);
    } else {
      console.log(jsonStr);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PERFORMANCE LOGGING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create a timer for performance logging
   */
  public timer(label: string): () => void {
    const start = Date.now();

    return () => {
      const duration = Date.now() - start;
      const message = `${label} took ${duration}ms`;

      if (this.config.enableColors) {
        this.info(`⏱️  ${message}`, { duration });
      } else {
        this.info(message, { duration });
      }
    };
  }

  /**
   * Log execution time of async function
   */
  public async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const endTimer = this.timer(label);
    try {
      const result = await fn();
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      throw error;
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT CONVENIENCE INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Default logger instance for quick usage
 * Usage: import { logger } from './logger';
 */
export const logger = Logger.getInstance();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { Colors };
