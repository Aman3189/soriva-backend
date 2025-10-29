import { PrismaClient } from '@prisma/client';

class DatabaseConfig {
  private static instance: PrismaClient;
  private static isConnected: boolean = false;

  /**
   * Get Prisma Client instance (Singleton)
   */
  static getInstance(): PrismaClient {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty',
      });
    }
    return DatabaseConfig.instance;
  }

  /**
   * Connect to database
   */
  static async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('⚠️  Database already connected');
      return;
    }

    try {
      const prisma = this.getInstance();
      await prisma.$connect();
      this.isConnected = true;
      console.log('✅ Database connected successfully');

      // Test query
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database health check passed');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  static async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const prisma = this.getInstance();
      await prisma.$disconnect();
      this.isConnected = false;
      console.log('✅ Database disconnected');
    } catch (error) {
      console.error('❌ Database disconnect failed:', error);
    }
  }

  /**
   * Check if database is connected
   */
  static getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default DatabaseConfig;
export const prisma = DatabaseConfig.getInstance();
