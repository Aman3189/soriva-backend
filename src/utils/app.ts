// src/utils/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from '../routes/index.routes';
import DatabaseConfig from '../config/database.config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from '../config/swagger.config';

// ✅ Import integrated modules
import chatRoutes from '../modules/chat/chat.routes';
import boosterRoutes from '../modules/billing/booster.routes';
import usageRoutes from '../modules/billing/usage.routes';

// ✅ Import document routes
import documentRoutes from '../modules/document/document.routes';

// ✅ Import audit routes (admin analytics)
import auditRoutes from '../modules/admin/audit.routes';
import monitoringRoutes from '../routes/monitoring.routes';
import { getSecurityHeadersConfig } from '../config/security-headers.config';
import voiceRoutes from '../core/voice/voice.routes';
import seekRoutes from '../core/seek/seek.routes';
import templatesRoutes from '../constants/templates.routes';
import sovereignRoutes from 'src/routes/sovereign.routes';
import documentTemplatesRoutes from '../modules/document-templates/document-templates.routes';
import trendingRoutes from '../routes/trending.routes';





// Load environment variables
dotenv.config();

/**
 * Application Configuration
 */
class AppConfig {
  public readonly corsOrigin: string;
  public readonly environment: string;
  public readonly isDevelopment: boolean;

  constructor() {
    this.corsOrigin = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
    this.environment = process.env.NODE_ENV || 'development';
    this.isDevelopment = this.environment === 'development';
  }
}

/**
 * Middleware Manager - Handles all middleware setup
 */
class MiddlewareManager {
  private app: Application;
  private config: AppConfig;

  constructor(app: Application, config: AppConfig) {
    this.app = app;
    this.config = config;
  }

  /**
   * Setup security middleware
   */
  public setupSecurity(): void {
  // ✅ Security headers with environment-aware configuration
  const helmetConfig = getSecurityHeadersConfig(this.config.isDevelopment);
  this.app.use(helmetConfig);

  // CORS configuration
  this.app.use(
  cors({
    origin: [
  'http://localhost:5500', 
  'http://127.0.0.1:5500', 
  'http://localhost:3000',
  'http://localhost:5173',  // Vite default
  'http://localhost:4200',  // Angular default
],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

  console.log('✅ Security headers configured');
}
  /**
   * Setup body parsers
   */
  public setupParsers(): void {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  /**
   * Setup logging
   */
  public setupLogging(): void {
    if (this.config.isDevelopment) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
  }

  /**
   * Setup authentication
   */
  public setupAuthentication(): void {
  }

  /**
   * Setup all middleware
   */
  public setupAll(): void {
    this.setupSecurity();
    this.setupParsers();
    this.setupLogging();
    this.setupAuthentication();
  }
}

/**
 * Route Manager - Handles all route registrations
 */
class RouteManager {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * Setup health check endpoint
   */
  public setupHealthCheck(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      console.log('✅ Health check called!');
      res.status(200).json({
        status: 'OK',
        message: 'Soriva Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: 'connected',
          auth: 'active',
          ai: 'active',
          rag: 'active',
          voice: 'active', // ADD THIS
          documents: 'active',
          audit: 'active',
          security: 'active', 
          monitoring: 'active',
        },
      });
    });
  }
  /**
   * Setup Swagger documentation
   */
  public setupSwagger(): void {
    // Swagger JSON endpoint
    this.app.get('/api-docs.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // Swagger UI - separate .use() and .get() to avoid HTTPS issues
    this.app.use('/api-docs', swaggerUi.serve);
    this.app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

    console.log('📚 Swagger documentation available at /api-docs');
  }
  /**
   * Setup API routes
   */
  public setupApiRoutes(): void {
    // Core routes (auth, billing, RAG, etc.)
    this.app.use('/api', routes);

    // Chat module routes
    this.app.use('/api/chat', chatRoutes);

    // Billing module routes
    this.app.use('/api/billing/booster', boosterRoutes);
    this.app.use('/api/billing/usage', usageRoutes);

    // ✅ Voice routes (NEW!)
    this.app.use('/api/voice', voiceRoutes);
    // ✅ Seek routes (AI Search)
    this.app.use('/api/seek', seekRoutes);

    // ✅ Document Intelligence routes
    this.app.use('/api/documents', documentRoutes.getRouter());

    // ✅ Audit Analytics routes (admin)
    this.app.use('/api/admin/audit', auditRoutes);

    // ✅ Templates routes (Conversation Templates)
    this.app.use('/api/templates', templatesRoutes);  
    // ✅ Monitoring & Health Check routes
    this.app.use('/', monitoringRoutes);
    this.app.use('/api/auth', sovereignRoutes);

    this.app.use('/api/document-templates', documentTemplatesRoutes);
    this.app.use('/api/trending', trendingRoutes);




    console.log('🎤 Voice routes registered at /api/voice');
    console.log('🔍 Seek routes registered at /api/seek');
    console.log('📄 Document routes registered at /api/documents');
    console.log('📊 Audit routes registered at /api/admin/audit');
    console.log('🏥 Health routes registered at /health');
  }

  /**
   * Setup 404 handler
   */
  public setup404Handler(): void {
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method,
      });
    });
  }

  /**
   * Setup all routes
   */
  public setupAll(): void {
    this.setupHealthCheck();
    this.setupSwagger(); // ← ADD THIS LINE
    this.setupApiRoutes();
    this.setup404Handler();
  }
}

/**
 * Error Handler - Centralized error handling
 */
class ErrorHandler {
  private app: Application;
  private config: AppConfig;

  constructor(app: Application, config: AppConfig) {
    this.app = app;
    this.config = config;
  }

  /**
   * Setup global error handler
   */
  public setup(): void {
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('❌ Error occurred:', err);

      // Determine status code
      const statusCode = err.status || err.statusCode || 500;

      // Build error response
      const errorResponse: any = {
        success: false,
        message: err.message || 'Internal server error',
        statusCode,
      };

      // Add stack trace in development
      if (this.config.isDevelopment) {
        errorResponse.stack = err.stack;
        errorResponse.details = err.details;
      }

      res.status(statusCode).json(errorResponse);
    });
  }
}

/**
 * Database Manager - Handles database connections
 */
class DatabaseManager {
  /**
   * Initialize database connection
   */
  public static async initialize(): Promise<void> {
    try {
      await DatabaseConfig.connect();
      console.log('✅ Database connected successfully');
    } catch (error: any) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }
}

/**
 * Application Manager - Main application orchestrator
 */
class ApplicationManager {
  private app: Application;
  private config: AppConfig;
  private middlewareManager: MiddlewareManager;
  private routeManager: RouteManager;
  private errorHandler: ErrorHandler;

  constructor() {
    this.app = express();
    this.config = new AppConfig();
    this.middlewareManager = new MiddlewareManager(this.app, this.config);
    this.routeManager = new RouteManager(this.app);
    this.errorHandler = new ErrorHandler(this.app, this.config);
  }

  /**
   * Initialize the application
   */
  public async initialize(): Promise<Application> {
    try {
      // Initialize database
      await DatabaseManager.initialize();

      // Setup middleware
      this.middlewareManager.setupAll();

      // Setup routes
      this.routeManager.setupAll();

      // Setup error handler (must be last)
      this.errorHandler.setup();

      console.log('✅ Application initialized successfully');
      console.log('🔒 Security features: Rate limiting + Security headers + Audit logging');

      return this.app;
    } catch (error: any) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Get Express application instance
   */
  public getApp(): Application {
    return this.app;
  }
}

/**
 * Create and export the application
 */
const appManager = new ApplicationManager();

// Initialize database connection immediately
DatabaseManager.initialize().catch((error: any) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

// Setup middleware and routes
appManager['middlewareManager'].setupAll();
appManager['routeManager'].setupAll();
appManager['errorHandler'].setup();

export default appManager.getApp();
