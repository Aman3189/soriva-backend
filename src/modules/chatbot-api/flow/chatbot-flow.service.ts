// src/modules/chatbot-api/flow/chatbot-flow.service.ts

import { ChatbotFlowRepository } from './chatbot-flow.repository';

interface FlowResponse {
  type: 'static' | 'ai';
  response?: string;
  route?: string;
  options?: Array<{ label: string; value: string }>;
  useAI: boolean;
}

export class ChatbotFlowService {
  private repository: ChatbotFlowRepository;

  constructor() {
    this.repository = new ChatbotFlowRepository();
  }

  async getInitialFlow(clientId: string): Promise<FlowResponse | null> {
    const flow = await this.repository.findInitialFlow(clientId);
    
    if (!flow) return null;

    return {
      type: 'static',
      response: flow.response || undefined,
      options: flow.options as Array<{ label: string; value: string }> || undefined,
      useAI: flow.useAI
    };
  }

  async processMessage(clientId: string, message: string, messageType?: string): Promise<FlowResponse> {
    // ONLY handle option clicks with static responses
    // All free text messages go to AI
    
    if (messageType === 'option_select') {
      // Option button click - use static flow
      const flow = await this.repository.findByOptionValue(clientId, message);
      
      if (flow) {
        return {
          type: 'static',
          response: flow.response || undefined,
          route: flow.route || undefined,
          options: flow.options as Array<{ label: string; value: string }> || undefined,
          useAI: false
        };
      }
    }

    // Free text message - ALWAYS use AI (Gemini)
    return { type: 'ai', useAI: true };
  }
}