// src/modules/document/services/workspace/workspace-llm.service.ts

import { WorkspaceTool } from '@prisma/client';
import { WORKSPACE_CONFIG } from '../../../../config/workspace.config';

// ============================================
// 📝 API RESPONSE TYPES
// ============================================
interface LLMResponse {
  json: Record<string, any>;
  inputTokens: number;
  outputTokens: number;
}

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>;
  usage: { prompt_tokens: number; completion_tokens: number };
}

interface AnthropicResponse {
  content: Array<{ text: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

type KimiResponse = OpenAIResponse;

// ============================================
// 🔧 LLM MODEL KEYS
// ============================================
type LLMModelKey = 'kimiK2' | 'gpt4o' | 'sonnet';

const PROVIDER_TO_MODEL_KEY: Record<string, LLMModelKey> = {
  'moonshot': 'kimiK2',
  'openai': 'gpt4o',
  'anthropic': 'sonnet'
};

export class WorkspaceLLMService {

  // ============================================
  // 🧠 GENERATE JSON OUTPUT
  // ============================================
  async generateOutput(
    tool: WorkspaceTool,
    userInput: Record<string, any>,
    model: string,
    provider: string
  ): Promise<{
    outputJson: Record<string, any>;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  }> {
    const prompt = this.buildPrompt(tool, userInput);
    const maxTokens = this.getTokenLimit(tool, provider, 'generate');

    const response = await this.callProvider(provider, prompt, maxTokens);

    return {
      outputJson: response.json,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.inputTokens + response.outputTokens
    };
  }

  // ============================================
  // ✏️ EDIT EXISTING OUTPUT
  // ============================================
  async editOutput(
    tool: WorkspaceTool,
    existingJson: Record<string, any>,
    editRequest: string,
    model: string,
    provider: string
  ): Promise<{
    outputJson: Record<string, any>;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  }> {
    const prompt = this.buildEditPrompt(tool, existingJson, editRequest);
    const maxTokens = this.getTokenLimit(tool, provider, 'edit');

    const response = await this.callProvider(provider, prompt, maxTokens);

    return {
      outputJson: response.json,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.inputTokens + response.outputTokens
    };
  }

  // ============================================
  // 🎯 GET TOKEN LIMIT (LLM-wise)
  // ============================================
  private getTokenLimit(
    tool: WorkspaceTool, 
    provider: string, 
    operation: 'generate' | 'edit'
  ): number {
    const modelKey = PROVIDER_TO_MODEL_KEY[provider];
    if (!modelKey) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const toolLimits = WORKSPACE_CONFIG.TOKEN_LIMITS[tool];
    
    const limits = toolLimits[operation] as Record<LLMModelKey, number>;
    return limits[modelKey];
}

  // ============================================
  // 🔀 CALL PROVIDER (Unified)
  // ============================================
  private async callProvider(provider: string, prompt: string, maxTokens: number): Promise<LLMResponse> {
    switch (provider) {
      case 'moonshot':
        return this.callKimiK2(prompt, maxTokens);
      case 'openai':
        return this.callGPT4o(prompt, maxTokens);
      case 'anthropic':
        return this.callSonnet(prompt, maxTokens);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // ============================================
  // 📝 BUILD PROMPTS
  // ============================================
  private buildPrompt(tool: WorkspaceTool, userInput: Record<string, any>): string {
    const promptBuilders: Record<WorkspaceTool, (input: Record<string, any>) => string> = {
      RESUME: this.buildResumePrompt.bind(this),
      INVOICE: this.buildInvoicePrompt.bind(this),
      PORTFOLIO: this.buildPortfolioPrompt.bind(this),
      CRM: this.buildCRMPrompt.bind(this),
      CONTENT: this.buildContentPrompt.bind(this)
    };
    return promptBuilders[tool](userInput);
  }

  private buildEditPrompt(
    tool: WorkspaceTool,
    existingJson: Record<string, any>,
    editRequest: string
  ): string {
    return `You previously generated this ${tool.toLowerCase()} data:
${JSON.stringify(existingJson, null, 2)}

User wants this change: "${editRequest}"

Return the COMPLETE updated JSON with the requested changes.
Respond ONLY with valid JSON, no explanations.`;
  }

  // ============================================
  // 📄 RESUME PROMPT
  // ============================================
  private buildResumePrompt(input: Record<string, any>): string {
    return `Generate a professional resume in JSON format.

User Input:
${JSON.stringify(input, null, 2)}

Return JSON with this EXACT structure:
{
  "header": {
    "name": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string (optional)",
    "website": "string (optional)"
  },
  "summary": "string (2-3 sentences)",
  "skills": [
    { "name": "string", "level": number (0-100), "category": "string" }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string or Present",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "year": "string",
      "gpa": "string (optional)"
    }
  ],
  "certifications": [
    { "name": "string", "issuer": "string", "year": "string" }
  ],
  "languages": [
    { "language": "string", "proficiency": number (0-100) }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string (optional)"
    }
  ]
}

Respond ONLY with valid JSON. No markdown, no explanations.`;
  }

  // ============================================
  // 🧾 INVOICE PROMPT
  // ============================================
  private buildInvoicePrompt(input: Record<string, any>): string {
    return `Generate a professional invoice in JSON format.

User Input:
${JSON.stringify(input, null, 2)}

Return JSON with this EXACT structure:
{
  "invoiceNumber": "string",
  "invoiceDate": "string (YYYY-MM-DD)",
  "dueDate": "string (YYYY-MM-DD)",
  "from": {
    "name": "string",
    "company": "string (optional)",
    "address": "string",
    "email": "string",
    "phone": "string",
    "gst": "string (optional)"
  },
  "to": {
    "name": "string",
    "company": "string (optional)",
    "address": "string",
    "email": "string",
    "gst": "string (optional)"
  },
  "items": [
    {
      "description": "string",
      "quantity": number,
      "rate": number,
      "amount": number
    }
  ],
  "subtotal": number,
  "tax": { "label": "string", "rate": number, "amount": number },
  "discount": { "label": "string (optional)", "amount": number },
  "total": number,
  "currency": "string (INR/USD)",
  "notes": "string (optional)",
  "terms": "string (optional)",
  "bankDetails": {
    "bankName": "string",
    "accountNumber": "string",
    "ifsc": "string",
    "upiId": "string (optional)"
  }
}

Respond ONLY with valid JSON. No markdown, no explanations.`;
  }

  // ============================================
  // 🎨 PORTFOLIO PROMPT
  // ============================================
  private buildPortfolioPrompt(input: Record<string, any>): string {
    return `Generate a professional portfolio in JSON format.

User Input:
${JSON.stringify(input, null, 2)}

Return JSON with this EXACT structure:
{
  "header": {
    "name": "string",
    "title": "string",
    "tagline": "string",
    "avatar": "string (placeholder URL)",
    "location": "string"
  },
  "contact": {
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string",
    "website": "string"
  },
  "about": "string (3-4 sentences)",
  "skills": [
    { "name": "string", "level": number (0-100), "category": "string" }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "image": "string (placeholder URL)",
      "technologies": ["string"],
      "liveUrl": "string",
      "githubUrl": "string",
      "featured": boolean
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "testimonials": [
    {
      "name": "string",
      "role": "string",
      "company": "string",
      "text": "string"
    }
  ],
  "stats": [
    { "label": "string", "value": "string" }
  ]
}

Respond ONLY with valid JSON. No markdown, no explanations.`;
  }

  // ============================================
  // 👥 CRM PROMPT
  // ============================================
  private buildCRMPrompt(input: Record<string, any>): string {
    return `Generate CRM lead data in JSON format.

User Input:
${JSON.stringify(input, null, 2)}

Return JSON with this EXACT structure:
{
  "lead": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "company": "string",
    "designation": "string",
    "source": "string",
    "status": "NEW | CONTACTED | QUALIFIED | PROPOSAL | NEGOTIATION | WON | LOST",
    "priority": "LOW | MEDIUM | HIGH",
    "value": number,
    "currency": "string"
  },
  "timeline": [
    {
      "date": "string",
      "action": "string",
      "notes": "string"
    }
  ],
  "nextActions": [
    {
      "action": "string",
      "dueDate": "string",
      "priority": "string"
    }
  ],
  "notes": "string",
  "tags": ["string"]
}

Respond ONLY with valid JSON. No markdown, no explanations.`;
  }

  // ============================================
  // 📅 CONTENT PROMPT
  // ============================================
  private buildContentPrompt(input: Record<string, any>): string {
    return `Generate a content plan in JSON format.

User Input:
${JSON.stringify(input, null, 2)}

Return JSON with this EXACT structure:
{
  "planName": "string",
  "duration": "string",
  "platforms": ["string"],
  "goals": ["string"],
  "content": [
    {
      "date": "string (YYYY-MM-DD)",
      "day": "string",
      "platform": "string",
      "type": "POST | REEL | STORY | BLOG | VIDEO | CAROUSEL",
      "topic": "string",
      "caption": "string",
      "hashtags": ["string"],
      "callToAction": "string",
      "status": "PLANNED | DRAFT | SCHEDULED | PUBLISHED"
    }
  ],
  "themes": [
    { "name": "string", "color": "string", "percentage": number }
  ],
  "analytics": {
    "totalPosts": number,
    "postsPerWeek": number,
    "platformDistribution": [
      { "platform": "string", "count": number, "percentage": number }
    ]
  }
}

Respond ONLY with valid JSON. No markdown, no explanations.`;
  }

  // ============================================
  // 🌙 KIMI K2 CALL
  // ============================================
  private async callKimiK2(prompt: string, maxTokens: number): Promise<LLMResponse> {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kimi-k2',
        messages: [
          { role: 'system', content: 'You are a JSON generator. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    const data = (await response.json()) as KimiResponse;
    const content = data.choices[0].message.content;

    return {
      json: this.parseJSON(content),
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens
    };
  }

  // ============================================
  // 🟢 GPT-4o CALL
  // ============================================
  private async callGPT4o(prompt: string, maxTokens: number): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a JSON generator. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    const data = (await response.json()) as OpenAIResponse;
    const content = data.choices[0].message.content;

    return {
      json: this.parseJSON(content),
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens
    };
  }

  // ============================================
  // 🟣 SONNET 4.5 CALL
  // ============================================
  private async callSonnet(prompt: string, maxTokens: number): Promise<LLMResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: maxTokens,
        system: 'You are a JSON generator. Always respond with valid JSON only. No markdown, no explanations.',
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = (await response.json()) as AnthropicResponse;
    const content = data.content[0].text;

    return {
      json: this.parseJSON(content),
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens
    };
  }

  // ============================================
  // 🔧 PARSE JSON SAFELY
  // ============================================
  private parseJSON(content: string): Record<string, any> {
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      return JSON.parse(cleanContent.trim());
    } catch (error) {
      throw new Error(`Failed to parse LLM response as JSON: ${content.substring(0, 100)}...`);
    }
  }
}

export const workspaceLLMService = new WorkspaceLLMService();