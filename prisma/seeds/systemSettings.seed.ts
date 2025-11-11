import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const systemSettingsSeeds = [
  // AI Provider Settings
  {
    key: 'openai_api_key',
    value: process.env.OPENAI_API_KEY || '',
    category: 'ai_providers',
    description: 'OpenAI API key for GPT models',
    isPublic: false
  },
  {
    key: 'openai_default_model',
    value: 'gpt-4o',
    category: 'ai_providers',
    description: 'Default OpenAI model',
    isPublic: true
  },
  {
    key: 'claude_api_key',
    value: process.env.ANTHROPIC_API_KEY || '',
    category: 'ai_providers',
    description: 'Anthropic Claude API key',
    isPublic: false
  },
  {
    key: 'claude_default_model',
    value: 'claude-sonnet-4-20250514',
    category: 'ai_providers',
    description: 'Default Claude model',
    isPublic: true
  },
  {
    key: 'gemini_api_key',
    value: process.env.GEMINI_API_KEY || '',
    category: 'ai_providers',
    description: 'Google Gemini API key',
    isPublic: false
  },
  {
    key: 'groq_api_key',
    value: process.env.GROQ_API_KEY || '',
    category: 'ai_providers',
    description: 'Groq API key for fast inference',
    isPublic: false
  },

  // Plan Limits
  {
    key: 'starter_message_limit',
    value: '50',
    category: 'plan_limits',
    description: 'Monthly message limit for Starter plan',
    isPublic: true
  },
  {
    key: 'plus_message_limit',
    value: '500',
    category: 'plan_limits',
    description: 'Monthly message limit for Plus plan',
    isPublic: true
  },
  {
    key: 'pro_message_limit',
    value: '2000',
    category: 'plan_limits',
    description: 'Monthly message limit for Pro plan',
    isPublic: true
  },
  {
    key: 'edge_message_limit',
    value: '10000',
    category: 'plan_limits',
    description: 'Monthly message limit for Edge plan',
    isPublic: true
  },

  // Document Intelligence Limits
  {
    key: 'starter_document_limit',
    value: '5',
    category: 'document_limits',
    description: 'Document upload limit for Starter plan',
    isPublic: true
  },
  {
    key: 'plus_document_limit',
    value: '20',
    category: 'document_limits',
    description: 'Document upload limit for Plus plan',
    isPublic: true
  },
  {
    key: 'pro_document_limit',
    value: '100',
    category: 'document_limits',
    description: 'Document upload limit for Pro plan',
    isPublic: true
  },

  // Studio Credits
  {
    key: 'starter_monthly_credits',
    value: '0',
    category: 'studio_credits',
    description: 'Monthly studio credits for Starter plan',
    isPublic: true
  },
  {
    key: 'plus_monthly_credits',
    value: '100',
    category: 'studio_credits',
    description: 'Monthly studio credits for Plus plan',
    isPublic: true
  },
  {
    key: 'pro_monthly_credits',
    value: '500',
    category: 'studio_credits',
    description: 'Monthly studio credits for Pro plan',
    isPublic: true
  },

  // System Configuration
  {
    key: 'maintenance_mode',
    value: 'false',
    category: 'system',
    description: 'Enable/disable maintenance mode',
    isPublic: true
  },
  {
    key: 'max_tokens_per_request',
    value: '4096',
    category: 'system',
    description: 'Maximum tokens allowed per AI request',
    isPublic: true
  },
  {
    key: 'request_timeout',
    value: '60000',
    category: 'system',
    description: 'API request timeout in milliseconds',
    isPublic: false
  },

  // Features Toggle
  {
    key: 'enable_document_intelligence',
    value: 'true',
    category: 'features',
    description: 'Enable document intelligence feature',
    isPublic: true
  },
  {
    key: 'enable_studio',
    value: 'true',
    category: 'features',
    description: 'Enable creative studio feature',
    isPublic: true
  },
  {
    key: 'enable_web_search',
    value: 'true',
    category: 'features',
    description: 'Enable web search in chat',
    isPublic: true
  },

  // Security
  {
    key: 'enable_jailbreak_detection',
    value: 'true',
    category: 'security',
    description: 'Enable jailbreak attempt detection',
    isPublic: false
  },
  {
    key: 'enable_content_moderation',
    value: 'true',
    category: 'security',
    description: 'Enable content moderation',
    isPublic: false
  },
  {
    key: 'max_login_attempts',
    value: '5',
    category: 'security',
    description: 'Maximum login attempts before lockout',
    isPublic: false
  }
];

export async function seedSystemSettings() {
  console.log('🌱 Seeding system settings...');

  for (const setting of systemSettingsSeeds) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting
    });
  }

  console.log('✅ System settings seeded successfully!');
}