// src/config/workspace.config.ts
export const WORKSPACE_CONFIG = {
  // ============================================
  // 🎁 FREE USES PER MONTH (Tokens from main pool)
  // ============================================
  FREE_QUOTA: {
    STARTER: {
      resume: 2,
      internship_letter: 3,
      freelance_invoice: 3,
      payment_receipt: 5,
      completion_certificate: 2,
      invoice: 3,
      portfolio: 0,
      crm: 0,
      content: 0
    },
    PLUS: {
      resume: 5,
      internship_letter: 5,
      freelance_invoice: 5,
      payment_receipt: 10,
      completion_certificate: 5,
      invoice: 5,
      portfolio: 3,
      crm: 3,
      content: 5
    },
    PRO: {
      resume: 10,
      internship_letter: 10,
      freelance_invoice: 10,
      payment_receipt: 20,
      completion_certificate: 10,
      invoice: 10,
      portfolio: 10,
      crm: 10,
      content: 10
    },
    APEX: {
      resume: 999,
      internship_letter: 999,
      freelance_invoice: 999,
      payment_receipt: 999,
      completion_certificate: 999,
      invoice: 999,
      portfolio: 999,
      crm: 999,
      content: 999
    }
  },

  // ============================================
  // 📄 STARTER TOOLS (5 Free Tools)
  // ============================================
  TOOLS: {
    RESUME: {
      id: 'resume',
      name: 'Resume Crafter',
      description: 'Build ATS-friendly resumes',
      icon: '📄',
      minPlan: 'STARTER',
      exportFormats: ['pdf', 'docx']
    },
    INTERNSHIP_LETTER: {
      id: 'internship_letter',
      name: 'Internship Letter',
      description: 'Professional internship letters',
      icon: '💌',
      minPlan: 'STARTER',
      exportFormats: ['pdf', 'docx']
    },
    FREELANCE_INVOICE: {
      id: 'freelance_invoice',
      name: 'Freelance Invoice',
      description: 'Invoice for freelance work',
      icon: '🧾',
      minPlan: 'STARTER',
      exportFormats: ['pdf']
    },
    PAYMENT_RECEIPT: {
      id: 'payment_receipt',
      name: 'Payment Receipt',
      description: 'Payment confirmation receipts',
      icon: '🧾',
      minPlan: 'STARTER',
      exportFormats: ['pdf']
    },
    COMPLETION_CERTIFICATE: {
      id: 'completion_certificate',
      name: 'Completion Certificate',
      description: 'Course/training completion',
      icon: '🏆',
      minPlan: 'STARTER',
      exportFormats: ['pdf', 'png']
    },
    // Add these for Prisma enum match
    INVOICE: {
      id: 'invoice',
      name: 'Invoice Generator',
      description: 'Create professional invoices',
      icon: '🧾',
      minPlan: 'PLUS',
      exportFormats: ['pdf']
    },
    PORTFOLIO: {
      id: 'portfolio',
      name: 'Portfolio Builder',
      description: 'Build your portfolio',
      icon: '💼',
      minPlan: 'PLUS',
      exportFormats: ['pdf', 'html']
    },
    CRM: {
      id: 'crm',
      name: 'CRM Tool',
      description: 'Customer management',
      icon: '👥',
      minPlan: 'PRO',
      exportFormats: ['pdf', 'csv']
    },
    CONTENT: {
      id: 'content',
      name: 'Content Writer',
      description: 'AI content generation',
      icon: '✍️',
      minPlan: 'PLUS',
      exportFormats: ['pdf', 'docx']
    }
  },

  // ============================================
  // 🤖 MODEL PER PLAN (Tools use same as chat)
  // ============================================
  TOOL_MODEL: {
    STARTER: { model: 'gemini-2.0-flash', provider: 'google' },
    PLUS: { model: 'mistral-large-latest', provider: 'mistral' },
    PRO: { model: 'mistral-large-latest', provider: 'mistral' },
    APEX: { model: 'gpt-5.1', provider: 'openai' }
  },

  // ============================================
  // 🎯 TOKEN LIMITS PER TOOL
  // ============================================
  TOKEN_LIMITS: {
    RESUME: { 
      maxTokens: 2000, 
      maxEdits: 3,
      generate: { gemini: 2000, mistral: 2000, gpt: 2000 },
      edit: { gemini: 1000, mistral: 1000, gpt: 1000 }
    },
    INTERNSHIP_LETTER: { 
      maxTokens: 1500, 
      maxEdits: 3,
      generate: { gemini: 1500, mistral: 1500, gpt: 1500 },
      edit: { gemini: 800, mistral: 800, gpt: 800 }
    },
    FREELANCE_INVOICE: { 
      maxTokens: 1000, 
      maxEdits: 2,
      generate: { gemini: 1000, mistral: 1000, gpt: 1000 },
      edit: { gemini: 500, mistral: 500, gpt: 500 }
    },
    PAYMENT_RECEIPT: { 
      maxTokens: 800, 
      maxEdits: 2,
      generate: { gemini: 800, mistral: 800, gpt: 800 },
      edit: { gemini: 400, mistral: 400, gpt: 400 }
    },
    COMPLETION_CERTIFICATE: { 
      maxTokens: 1000, 
      maxEdits: 2,
      generate: { gemini: 1000, mistral: 1000, gpt: 1000 },
      edit: { gemini: 500, mistral: 500, gpt: 500 }
    },
    INVOICE: { 
      maxTokens: 1500, 
      maxEdits: 3,
      generate: { gemini: 1500, mistral: 1500, gpt: 1500 },
      edit: { gemini: 800, mistral: 800, gpt: 800 }
    },
    PORTFOLIO: { 
      maxTokens: 3000, 
      maxEdits: 5,
      generate: { gemini: 3000, mistral: 3000, gpt: 3000 },
      edit: { gemini: 1500, mistral: 1500, gpt: 1500 }
    },
    CRM: { 
      maxTokens: 2000, 
      maxEdits: 3,
      generate: { gemini: 2000, mistral: 2000, gpt: 2000 },
      edit: { gemini: 1000, mistral: 1000, gpt: 1000 }
    },
    CONTENT: { 
      maxTokens: 4000, 
      maxEdits: 5,
      generate: { gemini: 4000, mistral: 4000, gpt: 4000 },
      edit: { gemini: 2000, mistral: 2000, gpt: 2000 }
    }
  },
  // ============================================
  // 🆓 FREE QUOTA MODEL CONFIG
  // ============================================
  FREE_QUOTA_MODEL: 'gemini-2.0-flash',
  FREE_QUOTA_PROVIDER: 'google',

  // ============================================
  // 💎 POWER PACKS
  // ============================================
  POWER_PACKS: {
    STARTER: { tokens: 0, model: 'gemini-2.0-flash', provider: 'google' },
    PLUS: { tokens: 50000, model: 'gemini-2.0-flash', provider: 'google' },
    PRO: { tokens: 100000, model: 'gpt-4o', provider: 'openai' },
    APEX: { tokens: 200000, model: 'claude-sonnet-4.5', provider: 'anthropic' }
  },

  // ============================================
  // 🔐 ACCESS LEVELS
  // ============================================
  ACCESS: {
    STARTER: ['STARTER'],
    PLUS: ['STARTER', 'PLUS'],
    PRO: ['STARTER', 'PLUS', 'PRO'],
    APEX: ['STARTER', 'PLUS', 'PRO', 'APEX']
  }
} as const;

export type WorkspaceToolType = keyof typeof WORKSPACE_CONFIG.TOOLS;