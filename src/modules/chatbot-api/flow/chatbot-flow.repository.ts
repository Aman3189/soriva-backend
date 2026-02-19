// src/modules/chatbot-api/flow/chatbot-flow.repository.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatbotFlowRepository {

  async findInitialFlow(clientId: string) {
    return prisma.chatbotFlow.findFirst({
      where: {
        clientId,
        trigger: 'initial'
      }
    });
  }

  async findByKeyword(clientId: string, message: string) {
    const flows = await prisma.chatbotFlow.findMany({
      where: {
        clientId,
        trigger: 'keyword'
      },
      orderBy: { order: 'asc' }
    });

    const normalizedMessage = message.toLowerCase();
    
    for (const flow of flows) {
      for (const keyword of flow.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          return flow;
        }
      }
    }
    
    return null;
  }

  async findByOptionValue(clientId: string, optionValue: string) {
    const flows = await prisma.chatbotFlow.findMany({
      where: {
        clientId,
        trigger: 'keyword'
      }
    });

    // Match option value with keywords
    for (const flow of flows) {
      if (flow.keywords.some(k => k.toLowerCase() === optionValue.toLowerCase())) {
        return flow;
      }
    }
    
    return null;
  }

  async findAllByClient(clientId: string) {
    return prisma.chatbotFlow.findMany({
      where: { clientId },
      orderBy: { order: 'asc' }
    });
  }

  async findFallbackFlow(clientId: string, language: 'en' | 'hi') {
    const trigger = language === 'hi' ? 'fallback_hi' : 'fallback_en';
    
    return prisma.chatbotFlow.findFirst({
      where: {
        clientId,
        trigger
      }
    });
  }
}