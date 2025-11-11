// src/utils/server.ts
import dotenv from 'dotenv';
dotenv.config();

import app from './utils/app';
import DatabaseConfig from './config/database.config';
import { ProviderFactory } from './core/ai/providers/provider.factory';
import { logger } from '@shared/utils/logger';
import { studioWorker } from './studio/queue/job-processor';

/**
 * Server Configuration
 */
class ServerConfig {
  private static instance: ServerConfig;

  public readonly port: number;
  public readonly environment: string;
  public readonly host: string;

  private constructor() {
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.environment = process.env.NODE_ENV || 'development';
    this.host = process.env.HOST || 'localhost';
  }

  public static getInstance(): ServerConfig {
    if (!ServerConfig.instance) {
      ServerConfig.instance = new ServerConfig();
    }
    return ServerConfig.instance;
  }

  public getBaseUrl(): string {
    return `http://${this.host}:${this.port}`;
  }
}

/**
 * Service Initializer - Handles all external service connections
 */
class ServiceInitializer {
  private static aiProvidersInitialized = false;

  /**
   * Initialize AI Providers
   */
  public static async initializeAIProviders(): Promise<void> {
    if (this.aiProvidersInitialized) {
      console.warn('⚠️ AI Providers already initialized');
      return;
    }

    try {
      const factory = ProviderFactory.getInstance({
        groqApiKey: process.env.GROQ_API_KEY,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        googleApiKey: process.env.GOOGLE_API_KEY,
        openaiApiKey: process.env.OPENAI_API_KEY,
      });

      await factory.initialize();
      this.aiProvidersInitialized = true;
      logger.success('AI Providers initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Providers:', error);
      throw error;
    }
  }

  /**
   * Initialize Database Connection
   */
  public static async initializeDatabase(): Promise<void> {
    try {
      await DatabaseConfig.connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Initialize all services
   */
  public static async initializeAll(): Promise<void> {
    await Promise.all([this.initializeAIProviders(), this.initializeDatabase()]);
  }
}

/**
 * Graceful Shutdown Handler
 */
class GracefulShutdown {
  private static isShuttingDown = false;

  /**
   * Handle graceful shutdown
   */
  public static async shutdown(server: any, signal: string): Promise<void> {
    if (this.isShuttingDown) {
      console.warn('⚠️ Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    console.log(`\n👋 ${signal} signal received: initiating graceful shutdown`);

    try {
      // Close database connections
      await DatabaseConfig.disconnect();
      console.log('✅ Database disconnected');

      // Close server
      server.close(() => {
        console.log('✅ HTTP server closed');
        console.log('✨ Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after timeout
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

/**
 * Route Logger - Dynamically logs available routes
 */
class RouteLogger {
  /**
   * Log all available routes
   */
  public static logRoutes(config: ServerConfig): void {
    const baseUrl = config.getBaseUrl();

    console.log('╔════════════════════════════════════════════════╗');
    console.log('║                                                ║');
    console.log('║   🚀 Soriva Lumos Backend is Running! 🚀      ║');
    console.log('║                                                ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📡 Server URL: ${baseUrl}`);
    console.log(`🌍 Environment: ${config.environment}`);
    console.log(`⚡ API Base: ${baseUrl}/api`);
    console.log(`❤️  Health Check: ${baseUrl}/health`);
    console.log('');

    // Auth Routes
    this.logRouteGroup('📋 Auth Routes', [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'GET    /api/auth/google',
      'GET    /api/auth/google/callback',
      'GET    /api/auth/me',
      'PUT    /api/auth/profile',
    ]);

    // AI Routes
    this.logRouteGroup('🤖 AI Routes', [
      'POST   /api/ai/chat',
      'POST   /api/ai/chat/stream',
      'GET    /api/ai/suggestions',
      'GET    /api/ai/health',
    ]);

    // Chat Routes
    this.logRouteGroup('💬 Chat Routes', [
      'POST   /api/chat/send',
      'GET    /api/chat/history/:sessionId',
      'GET    /api/chat/sessions',
      'DELETE /api/chat/session/:sessionId',
      'DELETE /api/chat/sessions/all',
      'PATCH  /api/chat/session/:sessionId/title',
    ]);

    // Studio Routes (UPDATED)
    this.logRouteGroup('🎨 Studio Routes (UPDATED)', [
      'POST   /api/studio/generate/image',
      'POST   /api/studio/upscale',
      'POST   /api/studio/image-to-video',
      'GET    /api/studio/credits/balance',
      'GET    /api/studio/credits/history',
      'GET    /api/studio/generation/:id',
      'GET    /api/studio/generations',
      'POST   /api/studio/boosters/purchase',
    ]);

    // RAG Routes
    this.logRouteGroup('🧠 RAG Routes', [
      'POST   /api/rag/documents/upload',
      'POST   /api/rag/embeddings/generate',
      'POST   /api/rag/query',
      'GET    /api/rag/documents',
      'GET    /api/rag/documents/:id',
      'DELETE /api/rag/documents/:id',
    ]);

    // Booster Routes
    this.logRouteGroup('🚀 Booster Routes', [
      'POST   /api/billing/booster/cooldown/purchase',
      'POST   /api/billing/booster/addon/purchase',
      'GET    /api/billing/booster/active',
      'GET    /api/billing/booster/available',
      'GET    /api/billing/booster/history',
    ]);

    // Usage Routes
    this.logRouteGroup('📊 Usage Routes', [
      'GET    /api/billing/usage/current',
      'GET    /api/billing/usage/limits',
      'GET    /api/billing/usage/studio-credits',
      'GET    /api/billing/usage/booster-context',
      'GET    /api/billing/usage/history',
      'POST   /api/billing/usage/check',
      'POST   /api/billing/usage/deduct',
      'POST   /api/billing/usage/reset-daily',
    ]);

    console.log('');
    console.log('✨ Total Endpoints: 40+');
    console.log('🎯 Status: Ready for Production!');
    console.log('');
    console.log('Press CTRL+C to stop the server');
    console.log('─────────────────────────────────────────────────');
  }

  /**
   * Log a group of routes
   */
  private static logRouteGroup(title: string, routes: string[]): void {
    console.log(title);
    routes.forEach((route) => console.log(`   - ${route}`));
    console.log('');
  }
}

/**
 * Main Server Manager
 */
class ServerManager {
  private server: any;
  private config: ServerConfig;

  constructor() {
    this.config = ServerConfig.getInstance();
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Initialize all services
      await ServiceInitializer.initializeAll();

      // ✨ Start Studio worker (optional with Replicate API)
      logger.info('🎨 Studio worker initialized (optional with Replicate API)');
      // Worker is already started when imported

      // Start HTTP server
      this.server = app.listen(this.config.port, () => {
        RouteLogger.logRoutes(this.config);
      });

      // Setup error handlers
      this.setupErrorHandlers();

      // Setup graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup error handlers
   */
  private setupErrorHandlers(): void {
    process.on('unhandledRejection', (err: Error) => {
      console.error('❌ Unhandled Rejection:', err.message);
      console.error(err.stack);
      this.server.close(() => {
        process.exit(1);
      });
    });

    process.on('uncaughtException', (err: Error) => {
      console.error('❌ Uncaught Exception:', err.message);
      console.error(err.stack);
      process.exit(1);
    });
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing studio worker...');
      await studioWorker.close();
      GracefulShutdown.shutdown(this.server, 'SIGTERM');
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, closing studio worker...');
      await studioWorker.close();
      GracefulShutdown.shutdown(this.server, 'SIGINT');
    });
  }
}

/**
 * Bootstrap the application
 */
const bootstrap = async (): Promise<void> => {
  const serverManager = new ServerManager();
  await serverManager.start();
};

// Start the server
bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});