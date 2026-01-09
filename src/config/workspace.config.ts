// src/config/workspace.config.ts

export const WORKSPACE_CONFIG = {
  
  // ============================================
  // 💳 POWER PACK PRICING
  // ============================================
  POWER_PACKS: {
    PLUS: {
    tier: 'PLUS',
    usesPerTool: 5,
    maxTokens: 125000,
    model: 'mistral-large-3',
    provider: 'mistral',
    pricing: {
    IN: { price: 79, currency: 'INR' },
    INTL: { price: 4.99, currency: 'USD' }
          }
        },
    PRO: {
      tier: 'PRO',
      usesPerTool: 5,
      maxTokens: 125000,
      model: 'gpt-4o',
      provider: 'openai',
      pricing: {
        IN: { price: 99, currency: 'INR' },
        INTL: { price: 6.99, currency: 'USD' }
      }
    },
    APEX: {
      tier: 'APEX',
      usesPerTool: 5,
      maxTokens: 125000,
      model: 'claude-sonnet-4.5',
      provider: 'anthropic',
      pricing: {
        IN: { price: 139, currency: 'INR' },
        INTL: { price: 8.99, currency: 'USD' }
      }
    }
  },

  // ============================================
  // 🎁 FREE QUOTA (Paid Subscribers Only)
  // ============================================
  FREE_QUOTA: {
    STARTER: null,  // No access
    PLUS: { resume: 2, invoice: 3, portfolio: 0, crm: 0, content: 0 },
    PRO: { resume: 2, invoice: 3, portfolio: 0, crm: 0, content: 0 },
    EDGE: { resume: 2, invoice: 3, portfolio: 0, crm: 0, content: 0 },
    LIFE: { resume: 2, invoice: 3, portfolio: 0, crm: 0, content: 0 }
  },

  // ============================================
  // 🔧 TOKEN LIMITS (JSON Approach)
  // ============================================
  // ============================================
  // 🔧 TOKEN LIMITS (LLM-wise per tool)
  // ============================================
  TOKEN_LIMITS: {
    RESUME: {
    generate: { mistral: 2400, gpt4o: 2700, sonnet: 3000 },
    edit: { mistral: 600, gpt4o: 650, sonnet: 700 },
    maxEdits: 2
        },
    INVOICE: {
    generate: { mistral: 1500, gpt4o: 1650, sonnet: 1800 },
    edit: { mistral: 350, gpt4o: 375, sonnet: 400 },
    maxEdits: 2
        },
    PORTFOLIO: {
    generate: { mistral: 3200, gpt4o: 3600, sonnet: 4000 },
    edit: { mistral: 800, gpt4o: 900, sonnet: 1000 },
    maxEdits: 2
        },
    CRM: {
    generate: { mistral: 1350, gpt4o: 1475, sonnet: 1600 },
    edit: { mistral: 325, gpt4o: 360, sonnet: 400 },
    maxEdits: 2
        },
    CONTENT: {
    generate: { mistral: 2550, gpt4o: 2850, sonnet: 3150 },
    edit: { mistral: 625, gpt4o: 675, sonnet: 750 },
    maxEdits: 2
        }
      },

  // ============================================
  // 📄 TOOL METADATA
  // ============================================
  TOOLS: {
    RESUME: {
      id: 'resume',
      name: 'Resume & Cover Letter Builder',
      icon: '📄',
      hasCharts: true,
      exportFormats: ['pdf', 'docx', 'png']
    },
    INVOICE: {
      id: 'invoice',
      name: 'Invoice & Quotation Generator',
      icon: '🧾',
      hasCharts: false,
      exportFormats: ['pdf', 'xlsx']
    },
    PORTFOLIO: {
      id: 'portfolio',
      name: 'Portfolio / Profile Builder',
      icon: '🎨',
      hasCharts: true,
      exportFormats: ['pdf', 'html', 'png']
    },
    CRM: {
      id: 'crm',
      name: 'CRM & Lead Manager',
      icon: '👥',
      hasCharts: true,
      exportFormats: ['pdf', 'xlsx', 'csv']
    },
    CONTENT: {
      id: 'content',
      name: 'Content Planner',
      icon: '📅',
      hasCharts: true,
      exportFormats: ['pdf', 'xlsx']
    }
  },

  // ============================================
  // 🔐 ACCESS CONTROL
  // ============================================
  ACCESS: {
    STARTER: ['PLUS'],  // Can only buy PLUS pack
    PLUS: ['PLUS', 'PRO', 'APEX'],
    PRO: ['PLUS', 'PRO', 'APEX'],
    EDGE: ['PLUS', 'PRO', 'APEX'],
    LIFE: ['PLUS', 'PRO', 'APEX']
  },

  // Free quota model
FREE_QUOTA_MODEL: 'mistral-large-3',
FREE_QUOTA_PROVIDER: 'mistral'
} as const;

export type PowerPackTier = keyof typeof WORKSPACE_CONFIG.POWER_PACKS;
export type WorkspaceToolType = keyof typeof WORKSPACE_CONFIG.TOOLS;