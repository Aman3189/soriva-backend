// src/modules/chatbot-api/lead/chatbot-lead.repository.ts

import { PrismaClient } from '@prisma/client';
import type { ChatbotLead } from '../chatbot.types';

const prisma = new PrismaClient();

export class ChatbotLeadRepository {

  async create(data: {
    clientId: string;
    sessionId: string;
    name?: string;
    email?: string;
    phone?: string;
    customFields?: Record<string, unknown>;
    source?: string;
  }): Promise<ChatbotLead> {
    return prisma.chatbotLead.create({
      data: {
        clientId: data.clientId,
        sessionId: data.sessionId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        customFields: data.customFields ? JSON.parse(JSON.stringify(data.customFields)) : null,
        source: data.source
      }
    });
  }

  async findBySessionId(sessionId: string): Promise<ChatbotLead | null> {
    return prisma.chatbotLead.findUnique({
      where: { sessionId }
    });
  }

  async findByClientId(clientId: string, limit: number = 50): Promise<ChatbotLead[]> {
    return prisma.chatbotLead.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async updateStatus(leadId: string, status: string): Promise<ChatbotLead> {
    return prisma.chatbotLead.update({
      where: { id: leadId },
      data: { status }
    });
  }

  async updateScore(leadId: string, score: number): Promise<ChatbotLead> {
    return prisma.chatbotLead.update({
      where: { id: leadId },
      data: { score }
    });
  }
}