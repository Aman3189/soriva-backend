// src/modules/chatbot-api/lead/chatbot-lead.service.ts

import { ChatbotLeadRepository } from './chatbot-lead.repository';
import type { ChatbotLead, CaptureLeadRequest } from '../chatbot.types';

export class ChatbotLeadService {
  private repository: ChatbotLeadRepository;

  constructor() {
    this.repository = new ChatbotLeadRepository();
  }

  async captureLead(
    clientId: string,
    sessionId: string,
    data: CaptureLeadRequest,
    source?: string
  ): Promise<ChatbotLead> {
    // Check if lead already exists for this session
    const existingLead = await this.repository.findBySessionId(sessionId);
    
    if (existingLead) {
      return existingLead;
    }

    return this.repository.create({
      clientId,
      sessionId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      customFields: data.customFields,
      source
    });
  }

  async getLeadBySession(sessionId: string): Promise<ChatbotLead | null> {
    return this.repository.findBySessionId(sessionId);
  }

  async getClientLeads(clientId: string, limit: number = 50): Promise<ChatbotLead[]> {
    return this.repository.findByClientId(clientId, limit);
  }

  async updateLeadStatus(leadId: string, status: string): Promise<ChatbotLead> {
    return this.repository.updateStatus(leadId, status);
  }

  async scoreLead(leadId: string, score: number): Promise<ChatbotLead> {
    return this.repository.updateScore(leadId, score);
  }
}