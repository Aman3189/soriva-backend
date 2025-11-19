// src/routes/monitoring.routes.ts
import { Router, Request, Response } from 'express';
import { monitoringService, HealthStatus } from '../services/monitoring.service';
import { adminGuardLight } from '../middleware/admin-guard.middleware';
import MonitoringService from '../services/monitoring.service';
import { cacheMiddleware } from '../middleware/cache.middleware';

/**
 * ==========================================
 * MONITORING ROUTES - SORIVA V2
 * ==========================================
 * System health and monitoring endpoints
 * 
 * ENDPOINTS:
 * - GET /health → Basic health check (public)
 * - GET /health/detailed → Detailed health report (admin only)
 * - GET /metrics → Prometheus metrics (admin only)
 * 
 * Phase 2 - Step 5: Monitoring & Alerts
 * Last Updated: November 18, 2025
 */

const router = Router();

/**
 * @route   GET /health
 * @desc    Basic health check (public endpoint)
 * @access  Public
 * @returns { status, message, timestamp }
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await monitoringService.getBasicHealth();

    // Set appropriate status code based on health
    const statusCode = health.status === HealthStatus.HEALTHY ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      ...health,
    });
  } catch (error: any) {
    console.error('Health check failed:', error);

    res.status(500).json({
      success: false,
      status: HealthStatus.CRITICAL,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date(),
    });
  }
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed system health report with metrics
 * @access  Private (Admin only - IP restricted)
 * @returns Full health report with system metrics
 */
router.get('/health/detailed', adminGuardLight, async (req: Request, res: Response) => {
  try {
    const healthReport = await monitoringService.getDetailedHealth();

    // Set appropriate status code based on health
    const statusCode = healthReport.status === HealthStatus.HEALTHY ? 200 : 503;

    // Format memory values for readability
    if (healthReport.metrics) {
      const { memory } = healthReport.metrics;
      (healthReport.metrics as any).memoryFormatted = {
           total: MonitoringService.formatBytes(memory.total), // ✅ FIXED
           used: MonitoringService.formatBytes(memory.used),   // ✅ FIXED
           free: MonitoringService.formatBytes(memory.free),   // ✅ FIXED
        usagePercentage: `${memory.usagePercentage}%`,
      };

      // Format uptime
      (healthReport as any).uptimeFormatted = MonitoringService.formatUptime( 
        healthReport.uptime
      );
    }

    res.status(statusCode).json({
      success: true,
      ...healthReport,
    });
  } catch (error: any) {
    console.error('Detailed health check failed:', error);

    res.status(500).json({
      success: false,
      status: HealthStatus.CRITICAL,
      message: 'Detailed health check failed',
      error: error.message,
      timestamp: new Date(),
    });
  }
});

/**
 * @route   GET /metrics
 * @desc    Prometheus-style metrics (for monitoring tools)
 * @access  Private (Admin only - IP restricted)
 * @returns Prometheus format metrics
 */
router.get('/metrics', adminGuardLight, async (req: Request, res: Response) => {
  try {
    const metrics = await monitoringService.getPrometheusMetrics();

    // Set content type to plain text (Prometheus format)
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.status(200).send(metrics);
  } catch (error: any) {
    console.error('Metrics generation failed:', error);

    res.status(500).json({
      success: false,
      message: 'Metrics generation failed',
      error: error.message,
      timestamp: new Date(),
    });
  }
});

/**
 * @route   GET /health/ping
 * @desc    Ultra-lightweight ping endpoint (no DB check)
 * @access  Public
 * @returns Simple pong response
 */
router.get('/health/ping', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date(),
  });
});
/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CACHE MONITORING ENDPOINTS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * @route   GET /cache/stats
 * @desc    Get cache performance statistics
 * @access  Private (Admin only)
 * @returns Cache hit/miss rates and performance metrics
 */
router.get('/cache/stats', adminGuardLight, (req: Request, res: Response) => {
  try {
    const stats = cacheMiddleware.getStats();
    
    res.status(200).json({
      success: true,
      stats: {
        hits: stats.hits,
        misses: stats.misses,
        errors: stats.errors,
        totalRequests: stats.totalRequests,
        hitRate: `${stats.hitRate.toFixed(2)}%`,
        lastReset: stats.lastReset
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cache stats fetch failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cache stats',
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route   DELETE /cache/clear
 * @desc    Clear all cache (dangerous - admin only)
 * @access  Private (Admin only)
 * @returns Success confirmation
 */
router.delete('/cache/clear', adminGuardLight, async (req: Request, res: Response) => {
  try {
    const success = await cacheMiddleware.clearAll();
    
    res.status(200).json({
      success,
      message: success ? 'All cache cleared successfully' : 'Failed to clear cache',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cache clear failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route   DELETE /cache/invalidate/:pattern
 * @desc    Invalidate cache by pattern (e.g., user:123:*)
 * @access  Private (Admin only)
 * @returns Number of cache entries invalidated
 */
router.delete('/cache/invalidate/:pattern', adminGuardLight, async (req: Request, res: Response) => {
  try {
    const pattern = req.params.pattern;
    const deleted = await cacheMiddleware.invalidate(pattern);
    
    res.status(200).json({
      success: true,
      message: `Invalidated ${deleted} cache entries`,
      pattern,
      deleted,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cache invalidation failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache',
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ENDPOINT SUMMARY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Public Endpoints:
 * - GET /health → Basic health (status + DB connectivity)
 * - GET /health/ping → Ultra-fast ping (no checks)
 * 
 * Admin Endpoints (IP Restricted):
 * - GET /health/detailed → Full system report (CPU, memory, uptime)
 * - GET /metrics → Prometheus metrics (for monitoring tools)
 * 
 * Usage Examples:
 * 
 * # Basic health check
 * curl http://localhost:3001/health
 * 
 * # Detailed health (admin only)
 * curl http://localhost:3001/health/detailed
 * 
 * # Prometheus metrics (admin only)
 * curl http://localhost:3001/metrics
 * 
 * # Quick ping
 * curl http://localhost:3001/health/ping
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export default router;