// src/modules/chatbot-api/message/chatbot-message.repository.ts

import { PrismaClient } from '@prisma/client';
import type { ChatbotMessage } from '../chatbot.types';

const prisma = new PrismaClient();

export class ChatbotMessageRepository {

 async create(data: {
    sessionId: string;
    role: string;
    content: string;
    messageType?: string;
    metadata?: Record<string, unknown>;
    model?: string;
    promptTokens?: number;
    outputTokens?: number;
    latencyMs?: number;
  }): Promise<ChatbotMessage> {
    return prisma.chatbotMessage.create({
      data: {
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        messageType: data.messageType || 'text',
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
        model: data.model,
        promptTokens: data.promptTokens,
        outputTokens: data.outputTokens,
        latencyMs: data.latencyMs
      }
    });
  }

  async findBySessionId(sessionId: string, limit: number = 20): Promise<ChatbotMessage[]> {
    return prisma.chatbotMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit
    });
  }

  async getRecentHistory(sessionId: string, limit: number = 10): Promise<ChatbotMessage[]> {
    const messages = await prisma.chatbotMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return messages.reverse();
  }

  async countBySession(sessionId: string): Promise<number> {
    return prisma.chatbotMessage.count({
      where: { 
        sessionId,
        role: 'user'  // Sirf user messages count karo
      }
    });
  }
}