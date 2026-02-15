// src/config/workspace.config.ts
// ═══════════════════════════════════════════════════════════════════════════
// SORIVA WORKSPACE CONFIG v2.2
// AI Tools Configuration - Plans, Quotas, Models
// Matches Prisma: RESUME, LETTER, INVOICE, CERTIFICATE,
//   AGREEMENT, MEMO, PROPOSAL, NEWSLETTER
// ═══════════════════════════════════════════════════════════════════════════

export const WORKSPACE_CONFIG = {
  // ============================================
  // 🎁 FREE USES PER MONTH (Per Plan)
  // Keys must match Prisma WorkspaceTool enum
  // ============================================
  FREE_QUOTA: {
    STARTER: {
      RESUME: 2,
      LETTER: 2,
      INVOICE: 2,
      CERTIFICATE: 0,
      AGREEMENT: 0,
      MEMO: 0,
      PROPOSAL: 0,
      NEWSLETTER: 0
    },
    LITE: {
      RESUME: 3,
      LETTER: 3,
      INVOICE: 3,
      CERTIFICATE: 2,
      AGREEMENT: 2,
      MEMO: 2,
      PROPOSAL: 0,
      NEWSLETTER: 0
    },
    PLUS: {
      RESUME: 5,
      LETTER: 5,
      INVOICE: 5,
      CERTIFICATE: 5,
      AGREEMENT: 5,
      MEMO: 5,
      PROPOSAL: 3,
      NEWSLETTER: 3
    },
    PRO: {
      RESUME: 10,
      LETTER: 10,
      INVOICE: 10,
      CERTIFICATE: 10,
      AGREEMENT: 10,
      MEMO: 10,
      PROPOSAL: 10,
      NEWSLETTER: 10
    },
    APEX: {
      RESUME: 999,
      LETTER: 999,
      INVOICE: 999,
      CERTIFICATE: 999,
      AGREEMENT: 999,
      MEMO: 999,
      PROPOSAL: 999,
      NEWSLETTER: 999
    },
    SOVEREIGN: {
      RESUME: 999,
      LETTER: 999,
      INVOICE: 999,
      CERTIFICATE: 999,
      AGREEMENT: 999,
      MEMO: 999,
      PROPOSAL: 999,
      NEWSLETTER: 999
    }
  },

  // ============================================
  // 📄 TOOLS METADATA (8 Tools - Prisma Match)
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
    LETTER: {
      id: 'letter',
      name: 'Letter',
      description: 'Professional letters',
      icon: '💌',
      minPlan: 'STARTER',
      exportFormats: ['pdf', 'docx']
    },
    INVOICE: {
      id: 'invoice',
      name: 'Invoice',
      description: 'Professional invoices',
      icon: '🧾',
      minPlan: 'STARTER',
      exportFormats: ['pdf']
    },
    CERTIFICATE: {
      id: 'certificate',
      name: 'Certificate',
      description: 'Award certificates',
      icon: '🏆',
      minPlan: 'LITE',
      exportFormats: ['pdf']
    },
    AGREEMENT: {
      id: 'agreement',
      name: 'Agreement',
      description: 'Legal agreements',
      icon: '📋',
      minPlan: 'LITE',
      exportFormats: ['pdf', 'docx']
    },
    MEMO: {
      id: 'memo',
      name: 'Memo / Notice',
      description: 'Office communications',
      icon: '📢',
      minPlan: 'LITE',
      exportFormats: ['pdf', 'docx']
    },
    PROPOSAL: {
      id: 'proposal',
      name: 'Proposal',
      description: 'Business proposals',
      icon: '💼',
      minPlan: 'PLUS',
      exportFormats: ['pdf', 'docx']
    },
    NEWSLETTER: {
      id: 'newsletter',
      name: 'Newsletter',
      description: 'Email newsletters',
      icon: '📰',
      minPlan: 'PLUS',
      exportFormats: ['pdf', 'html']
    }
  },

  // ============================================
  // 🤖 MODEL PER PLAN (For AI Tools) - V10.3 Updated
  // ============================================
  TOOL_MODEL: {
    STARTER: { model: 'gemini-2.0-flash', provider: 'google' },
    LITE: { model: 'mistral-large-latest', provider: 'mistral' },
    PLUS: { model: 'mistral-large-latest', provider: 'mistral' },
    PRO: { model: 'mistral-large-latest', provider: 'mistral' },
    APEX: { model: 'mistral-large-latest', provider: 'mistral' },
    SOVEREIGN: { model: 'mistral-large-latest', provider: 'mistral' }
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
    LETTER: {
      maxTokens: 1500,
      maxEdits: 3,
      generate: { gemini: 1500, mistral: 1500, anthropic: 1500 },
      edit: { gemini: 800, mistral: 800, anthropic: 800 }
    },
    INVOICE: {
      maxTokens: 1500,
      maxEdits: 3,
      generate: { gemini: 1500, mistral: 1500, anthropic: 1500 },
      edit: { gemini: 800, mistral: 800, anthropic: 800 }
    },
    CERTIFICATE: {
      maxTokens: 1000,
      maxEdits: 2,
      generate: { gemini: 1000, mistral: 1000, anthropic: 1000 },
      edit: { gemini: 500, mistral: 500, anthropic: 500 }
    },
    AGREEMENT: {
      maxTokens: 2500,
      maxEdits: 3,
      generate: { gemini: 2500, mistral: 2500, anthropic: 2500 },
      edit: { gemini: 1200, mistral: 1200, anthropic: 1200 }
    },
    MEMO: {
      maxTokens: 1500,
      maxEdits: 3,
      generate: { gemini: 1500, mistral: 1500, anthropic: 1500 },
      edit: { gemini: 800, mistral: 800, anthropic: 800 }
    },
    PROPOSAL: {
      maxTokens: 3000,
      maxEdits: 5,
      generate: { gemini: 3000, mistral: 3000, anthropic: 3000 },
      edit: { gemini: 1500, mistral: 1500, anthropic: 1500 }
    },
    NEWSLETTER: {
      maxTokens: 2500,
      maxEdits: 3,
      generate: { gemini: 2500, mistral: 2500, anthropic: 2500 },
      edit: { gemini: 1200, mistral: 1200, anthropic: 1200 }
    }
  },

  // ============================================
  // 🔐 ACCESS LEVELS (Which plans can access which tools)
  // ============================================
  ACCESS: {
    STARTER: [
      'RESUME', 'LETTER', 'INVOICE'
    ],
    LITE: [
      'RESUME', 'LETTER', 'INVOICE',
      'CERTIFICATE', 'AGREEMENT', 'MEMO'
    ],
    PLUS: [
      'RESUME', 'LETTER', 'INVOICE',
      'CERTIFICATE', 'AGREEMENT', 'MEMO',
      'PROPOSAL', 'NEWSLETTER'
    ],
    PRO: [
      'RESUME', 'LETTER', 'INVOICE',
      'CERTIFICATE', 'AGREEMENT', 'MEMO',
      'PROPOSAL', 'NEWSLETTER'
    ],
    APEX: [
      'RESUME', 'LETTER', 'INVOICE',
      'CERTIFICATE', 'AGREEMENT', 'MEMO',
      'PROPOSAL', 'NEWSLETTER'
    ],
    SOVEREIGN: [
      'RESUME', 'LETTER', 'INVOICE',
      'CERTIFICATE', 'AGREEMENT', 'MEMO',
      'PROPOSAL', 'NEWSLETTER'
    ]
  }
} as const;

export type WorkspaceToolType = keyof typeof WORKSPACE_CONFIG.TOOLS;
export type WorkspacePlan = keyof typeof WORKSPACE_CONFIG.TOOL_MODEL;