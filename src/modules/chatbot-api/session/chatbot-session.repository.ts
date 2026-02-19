// src/modules/chatbot-api/session/chatbot-session.repository.ts

import { PrismaClient } from '@prisma/client';
import type { ChatbotSession } from '../chatbot.types';

const prisma = new PrismaClient();

export class ChatbotSessionRepository {

  async create(data: {
    clientId: string;
    visitorId: string;
    visitorIp?: string;
    userAgent?: string;
    referrer?: string;
    currentPage?: string;
  }): Promise<ChatbotSession> {
    return prisma.chatbotSession.create({
      data
    });
  }

  async findById(id: string): Promise<ChatbotSession | null> {
    return prisma.chatbotSession.findUnique({
      where: { id }
    });
  }

  async findActiveSession(clientId: string, visitorId: string): Promise<ChatbotSession | null> {
    return prisma.chatbotSession.findFirst({
      where: {
        clientId,
        visitorId,
        isActive: true
      },
      orderBy: { startedAt: 'desc' }
    });
  }

  async updateLastActive(sessionId: string, currentPage?: string): Promise<void> {
    await prisma.chatbotSession.update({
      where: { id: sessionId },
      data: {
        lastActiveAt: new Date(),
        ...(currentPage && { currentPage })
      }
    });
  }

  async endSession(sessionId: string): Promise<void> {
    await prisma.chatbotSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        endedAt: new Date()
      }
    });
  }


  async getMessageCount(sessionId: string): Promise<number> {
    return prisma.chatbotMessage.count({
      where: { sessionId }
    });
  }
}