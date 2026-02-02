// src/config/workspace.config.ts
// ═══════════════════════════════════════════════════════════════════════════
// SORIVA WORKSPACE CONFIG v2.0
// AI Tools Configuration - Plans, Quotas, Models
// Matches Prisma: RESUME, INVOICE, PORTFOLIO, CRM, CONTENT
// ═══════════════════════════════════════════════════════════════════════════

export const WORKSPACE_CONFIG = {
  // ============================================
  // 🎁 FREE USES PER MONTH (Per Plan)
  // Keys must match Prisma WorkspaceTool enum
  // ============================================
  FREE_QUOTA: {
    STARTER: {
      RESUME: 2,
      INVOICE: 2,
      PORTFOLIO: 0,
      CRM: 0,
      CONTENT: 2
    },
    LITE: {
      RESUME: 3,
      INVOICE: 3,
      PORTFOLIO: 0,
      CRM: 0,
      CONTENT: 3
    },
    PLUS: {
      RESUME: 5,
      INVOICE: 5,
      PORTFOLIO: 3,
      CRM: 3,
      CONTENT: 5
    },
    PRO: {
      RESUME: 10,
      INVOICE: 10,
      PORTFOLIO: 10,
      CRM: 10,
      CONTENT: 10
    },
    APEX: {
      RESUME: 999,
      INVOICE: 999,
      PORTFOLIO: 999,
      CRM: 999,
      CONTENT: 999
    },
    SOVEREIGN: {
      RESUME: 999,
      INVOICE: 999,
      PORTFOLIO: 999,
      CRM: 999,
      CONTENT: 999
    }
  },

  // ============================================
  // 📄 TOOLS METADATA (5 Tools - Prisma Match)
  // ============================================
  TOOLS: {
    RESUME: {
      id: 'resume',
      name: 'Resume Crafter',
      description: 'Build ATS-friendly professional resumes',
      icon: '📄',
      minPlan: 'STARTER',
      exportFormats: ['pdf', 'docx']
    },
    INVOICE: {
      id: 'invoice',
      name: 'Invoice Generator',
      description: 'Create professional invoices',
      icon: '🧾',
      minPlan: 'STARTER',
      exportFormats: ['pdf']
    },
    PORTFOLIO: {
      id: 'portfolio',
      name: 'Portfolio Builder',
      description: 'Build your professional portfolio',
      icon: '💼',
      minPlan: 'PLUS',
      exportFormats: ['pdf', 'html']
    },
    CRM: {
      id: 'crm',
      name: 'CRM Tool',
      description: 'Manage leads and customers',
      icon: '👥',
      minPlan: 'PLUS',
      exportFormats: ['pdf', 'csv']
    },
    CONTENT: {
      id: 'content',
      name: 'Content Writer',
      description: 'AI-powered content generation',
      icon: '✏️',
      minPlan: 'STARTER',
      exportFormats: ['pdf', 'docx']
    }
  },

  // ============================================
  // 🤖 MODEL PER PLAN (For AI Tools)
  // ============================================
  TOOL_MODEL: {
    STARTER: { model: 'gemini-2.0-flash', provider: 'google' },
    LITE: { model: 'mistral-large-2511', provider: 'mistral' },
    PLUS: { model: 'mistral-large-2511', provider: 'mistral' },
    PRO: { model: 'claude-haiku-4-5', provider: 'anthropic' },
    APEX: { model: 'claude-haiku-4-5', provider: 'anthropic' },
    SOVEREIGN: { model: 'mistral-large-2511', provider: 'mistral' }
  },

  // ============================================
  // 🔄 FALLBACK MODEL
  // ============================================
  FALLBACK_MODEL: {
    model: 'gemini-2.0-flash',
    provider: 'google'
  },

  // ============================================
  // 🎯 TOKEN LIMITS PER TOOL
  // ============================================
  TOKEN_LIMITS: {
    RESUME: { 
      maxTokens: 2000, 
      maxEdits: 3,
      generate: { gemini: 2000, mistral: 2000, anthropic: 2000 },
      edit: { gemini: 1000, mistral: 1000, anthropic: 1000 }
    },
    INVOICE: { 
      maxTokens: 1500, 
      maxEdits: 3,
      generate: { gemini: 1500, mistral: 1500, anthropic: 1500 },
      edit: { gemini: 800, mistral: 800, anthropic: 800 }
    },
    PORTFOLIO: { 
      maxTokens: 3000, 
      maxEdits: 5,
      generate: { gemini: 3000, mistral: 3000, anthropic: 3000 },
      edit: { gemini: 1500, mistral: 1500, anthropic: 1500 }
    },
    CRM: { 
      maxTokens: 2000, 
      maxEdits: 3,
      generate: { gemini: 2000, mistral: 2000, anthropic: 2000 },
      edit: { gemini: 1000, mistral: 1000, anthropic: 1000 }
    },
    CONTENT: { 
      maxTokens: 4000, 
      maxEdits: 5,
      generate: { gemini: 4000, mistral: 4000, anthropic: 4000 },
      edit: { gemini: 2000, mistral: 2000, anthropic: 2000 }
    }
  },

  // ============================================
  // 🔐 ACCESS LEVELS (Which plans can access which tools)
  // ============================================
  ACCESS: {
    STARTER: ['RESUME', 'INVOICE', 'CONTENT'],
    LITE: ['RESUME', 'INVOICE', 'CONTENT'],
    PLUS: ['RESUME', 'INVOICE', 'PORTFOLIO', 'CRM', 'CONTENT'],
    PRO: ['RESUME', 'INVOICE', 'PORTFOLIO', 'CRM', 'CONTENT'],
    APEX: ['RESUME', 'INVOICE', 'PORTFOLIO', 'CRM', 'CONTENT'],
    SOVEREIGN: ['RESUME', 'INVOICE', 'PORTFOLIO', 'CRM', 'CONTENT']
  }
} as const;

export type WorkspaceToolType = keyof typeof WORKSPACE_CONFIG.TOOLS;
export type WorkspacePlan = keyof typeof WORKSPACE_CONFIG.TOOL_MODEL;