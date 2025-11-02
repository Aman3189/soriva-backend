// src/core/services/prisma.service.ts

import { PrismaClient } from '@prisma/client';

class PrismaService extends PrismaClient {
  private static instance: PrismaService;

  private constructor() {
    super();
  }

  static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  async connect() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async disconnect() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }
}

export const prisma = PrismaService.getInstance();