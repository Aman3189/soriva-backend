// src/modules/chatbot-api/client/chatbot-client.repository.ts

import { PrismaClient } from '@prisma/client';
import type { ChatbotClient } from '../chatbot.types';

const prisma = new PrismaClient();

export class ChatbotClientRepository {
  
  async findBySlug(slug: string): Promise<ChatbotClient | null> {
    return prisma.chatbotClient.findUnique({
      where: { slug }
    });
  }

  async findByApiKey(apiKey: string): Promise<ChatbotClient | null> {
    return prisma.chatbotClient.findUnique({
      where: { apiKey }
    });
  }

  async findById(id: string): Promise<ChatbotClient | null> {
    return prisma.chatbotClient.findUnique({
      where: { id }
    });
  }

  async getDailyMessageCount(clientId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.chatbotMessage.count({
      where: {
        session: { clientId },
        role: 'user',
        createdAt: { gte: today }
      }
    });
  }

  async getMonthlyLeadCount(clientId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return prisma.chatbotLead.count({
      where: {
        clientId,
        createdAt: { gte: startOfMonth }
      }
    });
  }
  async updateLastActive(clientId: string): Promise<void> {
    await prisma.chatbotClient.update({
      where: { id: clientId },
      data: { updatedAt: new Date() }
    });
  }
  async updateUsage(clientId: string, inputTokens: number, outputTokens: number): Promise<void> {
    await prisma.chatbotClient.update({
      where: { id: clientId },
      data: {
        usedInputTokens: { increment: inputTokens },
        usedOutputTokens: { increment: outputTokens },
        usedMessages: { increment: 1 }
      }
    });
  }

  async resetMonthlyUsage(clientId: string): Promise<void> {
    await prisma.chatbotClient.update({
      where: { id: clientId },
      data: {
        usedInputTokens: 0,
        usedOutputTokens: 0,
        usedMessages: 0,
        usageResetDate: new Date()
      }
    });
  }

  async checkAndResetIfNewMonth(clientId: string): Promise<void> {
    const client = await this.findById(clientId);
    if (!client) return;

    const now = new Date();
    const resetDate = new Date(client.usageResetDate);
    
    // Check if it's a new month
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      await this.resetMonthlyUsage(clientId);
    }
  }
}