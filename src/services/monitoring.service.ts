// src/services/monitoring.service.ts
import os from 'os';
import { performance } from 'perf_hooks';
import DatabaseConfig from '../config/database.config';
import { PrismaClient } from '@prisma/client'; // ✅ ADD THIS

/**
 * ==========================================
 * MONITORING SERVICE - SORIVA V2
 * ==========================================
 * Real-time system health monitoring
 * 
 * FEATURES:
 * - CPU & Memory usage tracking
 * - Database connectivity checks
 * - Uptime monitoring
 * - Performance metrics
 * - Health status reporting
 * 
 * Phase 2 - Step 5: Monitoring & Alerts
 * Last Updated: November 18, 2025
 */

/**
 * Health Status Levels
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
}

/**
 * System Metrics Interface
 */
export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };
  uptime: {
    process: number;
    system: number;
  };
  timestamp: Date;
}

/**
 * Database Health Interface
 */
export interface DatabaseHealth {
  connected: boolean;
  responseTime: number;
  status: HealthStatus;
  error?: string;
}

/**
 * Overall Health Report
 */
export interface HealthReport {
  status: HealthStatus;
  version: string;
  environment: string;
  uptime: number;
  timestamp: Date;
  services: {
    database: DatabaseHealth;
    system: {
      status: HealthStatus;
      cpu: number;
      memory: number;
    };
  };
  metrics?: SystemMetrics;
}

/**
 * Monitoring Service - Class-based implementation
 */
class MonitoringService {
  private startTime: number;
  private healthCheckCache: Map<string, { data: any; timestamp: number }>;
  private cacheDuration: number = 5000; // 5 seconds cache

  constructor() {
    this.startTime = Date.now();
    this.healthCheckCache = new Map();
  }

  /**
   * Get basic health status
   */
  public async getBasicHealth(): Promise<{
    status: HealthStatus;
    message: string;
    timestamp: Date;
  }> {
    const dbHealth = await this.checkDatabaseHealth();

    const status = dbHealth.connected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;

    return {
      status,
      message: status === HealthStatus.HEALTHY ? 'All systems operational' : 'System degraded',
      timestamp: new Date(),
    };
  }

  /**
   * Get detailed health report
   */
  public async getDetailedHealth(): Promise<HealthReport> {
    const [dbHealth, systemMetrics] = await Promise.all([
      this.checkDatabaseHealth(),
      this.getSystemMetrics(),
    ]);

    // Determine system health based on resource usage
    const systemStatus = this.evaluateSystemHealth(systemMetrics);

    // Overall status (worst of all services)
    const overallStatus = this.determineOverallStatus(dbHealth.status, systemStatus);

    return {
      status: overallStatus,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: this.getProcessUptime(),
      timestamp: new Date(),
      services: {
        database: dbHealth,
        system: {
          status: systemStatus,
          cpu: systemMetrics.cpu.usage,
          memory: systemMetrics.memory.usagePercentage,
        },
      },
      metrics: systemMetrics,
    };
  }

  /**
   * Check database connectivity and response time
   */
  /**
 * Check database connectivity and response time
 */
private async checkDatabaseHealth(): Promise<DatabaseHealth> {
  // Check cache first
  const cached = this.getFromCache('db_health');
  if (cached) {
    return cached;
  }

  const startTime = performance.now();

  try {
    // Create temporary Prisma client for health check
    const prisma = new PrismaClient(); // ✅ SIMPLE APPROACH
    
    // Simple query to check DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Disconnect after check
    await prisma.$disconnect();

    const responseTime = Math.round(performance.now() - startTime);

    // Evaluate DB health based on response time
    let status: HealthStatus;
    if (responseTime < 100) {
      status = HealthStatus.HEALTHY;
    } else if (responseTime < 500) {
      status = HealthStatus.DEGRADED;
    } else if (responseTime < 1000) {
      status = HealthStatus.UNHEALTHY;
    } else {
      status = HealthStatus.CRITICAL;
    }

    const health: DatabaseHealth = {
      connected: true,
      responseTime,
      status,
    };

    this.setCache('db_health', health);
    return health;
  } catch (error: any) {
    const health: DatabaseHealth = {
      connected: false,
      responseTime: Math.round(performance.now() - startTime),
      status: HealthStatus.CRITICAL,
      error: error.message || 'Database connection failed',
    };

    return health;
  }
}

  /**
   * Get system metrics (CPU, Memory, Uptime)
   */
  private async getSystemMetrics(): Promise<SystemMetrics> {
    // Check cache first
    const cached = this.getFromCache('system_metrics');
    if (cached) {
      return cached;
    }

    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Calculate CPU usage (simplified)
    const cpuUsage = await this.calculateCPUUsage();

    const metrics: SystemMetrics = {
      cpu: {
        usage: cpuUsage,
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercentage: Math.round((usedMemory / totalMemory) * 100),
      },
      uptime: {
        process: this.getProcessUptime(),
        system: os.uptime(),
      },
      timestamp: new Date(),
    };

    this.setCache('system_metrics', metrics);
    return metrics;
  }

  /**
   * Calculate CPU usage percentage
   */
  private async calculateCPUUsage(): Promise<number> {
    const cpus = os.cpus();

    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - Math.round((100 * idle) / total);

    return usage;
  }

  /**
   * Evaluate system health based on resource usage
   */
  private evaluateSystemHealth(metrics: SystemMetrics): HealthStatus {
    const { cpu, memory } = metrics;

    // Critical: CPU > 90% OR Memory > 90%
    if (cpu.usage > 90 || memory.usagePercentage > 90) {
      return HealthStatus.CRITICAL;
    }

    // Unhealthy: CPU > 80% OR Memory > 80%
    if (cpu.usage > 80 || memory.usagePercentage > 80) {
      return HealthStatus.UNHEALTHY;
    }

    // Degraded: CPU > 70% OR Memory > 70%
    if (cpu.usage > 70 || memory.usagePercentage > 70) {
      return HealthStatus.DEGRADED;
    }

    // Healthy: Everything below thresholds
    return HealthStatus.HEALTHY;
  }

  /**
   * Determine overall status (worst case wins)
   */
  private determineOverallStatus(...statuses: HealthStatus[]): HealthStatus {
    const priority: Record<HealthStatus, number> = {
      [HealthStatus.CRITICAL]: 4,
      [HealthStatus.UNHEALTHY]: 3,
      [HealthStatus.DEGRADED]: 2,
      [HealthStatus.HEALTHY]: 1,
    };

    let worstStatus = HealthStatus.HEALTHY;
    let worstPriority = priority[HealthStatus.HEALTHY];

    statuses.forEach((status) => {
      if (priority[status] > worstPriority) {
        worstStatus = status;
        worstPriority = priority[status];
      }
    });

    return worstStatus;
  }

  /**
   * Get process uptime in seconds
   */
  private getProcessUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Cache helpers (avoid hammering system on every request)
   */
  private getFromCache(key: string): any | null {
    const cached = this.healthCheckCache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.cacheDuration) {
      this.healthCheckCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.healthCheckCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Format bytes to human-readable format
   */
  public static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format uptime to human-readable format
   */
  public static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Get Prometheus-style metrics (optional - for advanced monitoring)
   */
  public async getPrometheusMetrics(): Promise<string> {
    const metrics = await this.getSystemMetrics();
    const dbHealth = await this.checkDatabaseHealth();

    const lines: string[] = [];

    // CPU metrics
    lines.push(`# HELP soriva_cpu_usage CPU usage percentage`);
    lines.push(`# TYPE soriva_cpu_usage gauge`);
    lines.push(`soriva_cpu_usage ${metrics.cpu.usage}`);

    // Memory metrics
    lines.push(`# HELP soriva_memory_usage Memory usage percentage`);
    lines.push(`# TYPE soriva_memory_usage gauge`);
    lines.push(`soriva_memory_usage ${metrics.memory.usagePercentage}`);

    // Database response time
    lines.push(`# HELP soriva_db_response_time Database response time in ms`);
    lines.push(`# TYPE soriva_db_response_time gauge`);
    lines.push(`soriva_db_response_time ${dbHealth.responseTime}`);

    // Uptime
    lines.push(`# HELP soriva_uptime_seconds Process uptime in seconds`);
    lines.push(`# TYPE soriva_uptime_seconds counter`);
    lines.push(`soriva_uptime_seconds ${this.getProcessUptime()}`);

    return lines.join('\n');
  }
}

/**
 * Export singleton instance
 */
export const monitoringService = new MonitoringService();

/**
 * Export class for advanced usage
 */
export default MonitoringService;