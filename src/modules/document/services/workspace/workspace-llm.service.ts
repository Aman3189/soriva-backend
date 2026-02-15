// src/modules/document/services/workspace/workspace-llm.service.ts
// ═══════════════════════════════════════════════════════════════════════════
// SORIVA WORKSPACE LLM SERVICE v2.0
// Smart Document Generation from Casual Input
// ═══════════════════════════════════════════════════════════════════════════

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

interface GeminiResponse {
  candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  usageMetadata: { promptTokenCount: number; candidatesTokenCount: number };
}

interface MistralResponse {
  choices: Array<{ message: { content: string } }>;
  usage: { prompt_tokens: number; completion_tokens: number };
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

// ============================================
// 🔧 LLM MODEL KEYS
// ============================================
type LLMModelKey = 'gemini' | 'mistral' | 'anthropic';

const PROVIDER_TO_MODEL_KEY: Record<string, LLMModelKey> = {
  'google': 'gemini',
  'mistral': 'mistral',
  'anthropic': 'anthropic'
};

export class WorkspaceLLMService {

  // ============================================
  // 🚀 GENERATE FROM CASUAL INPUT (NEW!)
  // ============================================
  async generateFromCasualInput(
    tool: WorkspaceTool,
    casualInput: string,
    model: string,
    provider: string
  ): Promise<{
    outputJson: Record<string, any>;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  }> {
    const prompt = this.buildSmartPrompt(tool, casualInput);
    const maxTokens = this.getTokenLimit(tool, provider, 'generate');

    const response = await this.callProvider(provider, prompt, maxTokens);

    // Post-process to ensure HBS compatibility
    const processedJson = this.postProcessForHBS(tool, response.json);

    return {
      outputJson: processedJson,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.inputTokens + response.outputTokens
    };
  }

  // ============================================
  // 🧠 GENERATE JSON OUTPUT (Legacy - Structured Input)
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

    const toolLimits = WORKSPACE_CONFIG.TOKEN_LIMITS[tool as keyof typeof WORKSPACE_CONFIG.TOKEN_LIMITS];
    if (!toolLimits) {
      return 2000; // Default fallback
    }
    const limits = toolLimits[operation] as Record<LLMModelKey, number>;
    return limits[modelKey] || 2000;
  }

  // ============================================
  // 🔀 CALL PROVIDER (Unified)
  // ============================================
  private async callProvider(provider: string, prompt: string, maxTokens: number): Promise<LLMResponse> {
    switch (provider) {
      case 'google':
        return this.callGemini(prompt, maxTokens);
      case 'mistral':
        return this.callMistral(prompt, maxTokens);
      case 'anthropic':
        return this.callAnthropic(prompt, maxTokens);
      default:
        // Fallback to Gemini
        console.warn(`Unknown provider: ${provider}, falling back to Gemini`);
        return this.callGemini(prompt, maxTokens);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🧠 SMART PROMPT BUILDER (Casual Input → Professional Document)
  // ════════════════════════════════════════════════════════════════════════════

 private buildSmartPrompt(tool: WorkspaceTool, casualInput: string): string {
    const promptBuilders: Record<string, (input: string) => string> = {
      RESUME: this.buildSmartResumePrompt.bind(this),
      LETTER: this.buildSmartInternshipLetterPrompt.bind(this),
      INVOICE: this.buildSmartInvoicePrompt.bind(this),
      CERTIFICATE: this.buildSmartCertificatePrompt.bind(this),
      AGREEMENT: this.buildSmartAgreementPrompt.bind(this),
      MEMO: this.buildSmartMemoPrompt.bind(this),
      PROPOSAL: this.buildSmartProposalPrompt.bind(this),
      NEWSLETTER: this.buildSmartNewsletterPrompt.bind(this)
    };

    const builder = promptBuilders[tool];
    if (!builder) {
      throw new Error(`No smart prompt builder for tool: ${tool}`);
    }
    return builder(casualInput);
  }
  // ════════════════════════════════════════════════════════════════════════════
  // 📄 SMART RESUME PROMPT (HBS Template Compatible)
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartResumePrompt(casualInput: string): string {
    return `You are a professional resume writer. Create a complete, polished resume from the user's casual description.

═══════════════════════════════════════════════════════════════
USER'S INPUT (may be incomplete, casual, in Hindi/English/Hinglish):
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Pull out any information the user provided (name, skills, experience, education, etc.)
2. INFER: Make reasonable assumptions based on context (e.g., if they say "developer", assume modern tech stack)
3. GENERATE: Create professional content for anything missing
4. ENHANCE: Make everything sound polished and professional

═══════════════════════════════════════════════════════════════
RULES:
═══════════════════════════════════════════════════════════════
- If user gave name: Use exact name
- If user mentioned skills: Expand with related technologies (e.g., "React" → also add JavaScript, HTML, CSS)
- If user mentioned experience years: Create realistic job entries
- If contact not provided: Use placeholders like "[Your Email]", "[Your Phone]"
- If education partial: Complete with realistic details
- Generate 4-6 technical skills with proficiency levels (60-95%)
- Generate 3-5 soft skills/technologies as tags
- If no experience mentioned, create 1-2 relevant entries based on their skills
- If no projects mentioned, create 1-2 projects showcasing their tech stack
- Always include at least 2 languages (English + one regional if Indian name)
- Keep everything realistic, professional, and ATS-friendly

═══════════════════════════════════════════════════════════════
OUTPUT JSON (EXACT HBS TEMPLATE STRUCTURE):
═══════════════════════════════════════════════════════════════
{
  "fullName": "string (full name)",
  "jobTitle": "string (professional title like 'Full Stack Developer')",
  "initials": "string (first 2 letters of name, uppercase)",
  
  "hasPhoto": false,
  "profilePhoto": "",
  
  "email": "string (email or '[Your Email]')",
  "phone": "string (phone or '[Your Phone]')",
  "location": "string (city, country)",
  
  "hasLinkedin": boolean,
  "linkedin": "string (LinkedIn URL or username)",
  
  "hasGithub": boolean,
  "github": "string (GitHub username)",
  
  "hasPortfolio": boolean,
  "portfolio": "string (portfolio URL)",
  
  "hasObjective": true,
  "objective": "string (2-3 sentence professional summary highlighting key strengths)",
  
  "hasSkills": true,
  "technicalSkills": [
    {
      "name": "string (skill name)",
      "level": number (60-95, proficiency percentage)
    }
  ],
  
  "softSkills": [
    {
      "name": "string (technology/tool name for tags)"
    }
  ],
  
  "hasLanguages": true,
  "languages": [
    {
      "name": "string (language name)",
      "proficiency": number (1-5, where 5=Native, 4=Fluent, 3=Proficient, 2=Intermediate, 1=Basic)
    }
  ],
  
  "hasInterests": boolean,
  "interests": [
    {
      "name": "string (interest/hobby)",
      "icon": "string (emoji, optional)"
    }
  ],
  
  "hasEducation": true,
  "education": [
    {
      "degree": "string (e.g., 'Bachelor of Technology')",
      "field": "string (e.g., 'Computer Science')",
      "institution": "string (college/university name)",
      "location": "string (city, optional)",
      "startYear": "string (YYYY, optional)",
      "endYear": "string (YYYY or 'Present')",
      "score": "string (e.g., '8.5 CGPA' or '85%', optional)"
    }
  ],
  
  "hasExperience": boolean,
  "experience": [
    {
      "role": "string (job title)",
      "company": "string (company name)",
      "location": "string (city, optional)",
      "startDate": "string (e.g., 'Jan 2023')",
      "endDate": "string (e.g., 'Present' or 'Dec 2024')",
      "description": "string (2-3 key responsibilities/achievements in one paragraph)"
    }
  ],
  
  "hasProjects": true,
  "projects": [
    {
      "name": "string (project name)",
      "description": "string (1-2 sentence description)",
      "technologies": ["string (tech used)"]
    }
  ],
  
  "hasCertifications": boolean,
  "certifications": [
    {
      "name": "string (certification name)",
      "issuer": "string (issuing organization)"
    }
  ],
  
  "hasAchievements": boolean,
  "achievements": [
    {
      "title": "string (achievement title)",
      "description": "string (brief description, optional)"
    }
  ]
}

═══════════════════════════════════════════════════════════════
IMPORTANT NOTES:
═══════════════════════════════════════════════════════════════
- All "has*" fields must be boolean (true/false) based on whether that section has content
- technicalSkills: Use for skills with progress bars (4-6 items, level 60-95)
- softSkills: Use for technology tags without levels (3-5 items)
- languages proficiency: 1-5 scale (5=Native, 4=Fluent, 3=Proficient, 2=Intermediate, 1=Basic)
- education.endYear: Use "Present" if currently studying
- experience.endDate: Use "Present" if currently working

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 💌 SMART INTERNSHIP LETTER PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartInternshipLetterPrompt(casualInput: string): string {
    return `You are a professional HR document writer. Create an internship offer/completion letter from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT:
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Company name, intern name, role, duration, dates, etc.
2. INFER: Letter type (offer/completion), department, responsibilities
3. GENERATE: Professional letter content with proper formatting

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "letterType": "offer | completion | experience",
  "referenceNumber": "string (e.g., INT/2024/001)",
  "date": "string (DD Month YYYY)",
  
  "company": {
    "name": "string",
    "address": "string",
    "logo": "",
    "website": "string (optional)",
    "phone": "string (optional)",
    "email": "string (optional)"
  },
  
  "intern": {
    "name": "string",
    "address": "string (optional)",
    "email": "string (optional)"
  },
  
  "internship": {
    "role": "string",
    "department": "string",
    "startDate": "string",
    "endDate": "string",
    "duration": "string (e.g., 3 months)",
    "type": "Full-time | Part-time",
    "stipend": "string (optional)",
    "location": "string"
  },
  
  "content": {
    "salutation": "string",
    "openingParagraph": "string",
    "bodyParagraphs": ["string"],
    "responsibilities": ["string (if offer letter)"],
    "achievements": ["string (if completion letter)"],
    "closingParagraph": "string"
  },
  
  "signatory": {
    "name": "string",
    "designation": "string",
    "department": "string"
  }
}

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🧾 SMART FREELANCE INVOICE PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartFreelanceInvoicePrompt(casualInput: string): string {
    return `You are a professional invoice generator for freelancers. Create a complete invoice from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT:
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Freelancer details, client details, work done, amounts
2. INFER: Invoice number, dates, tax calculations
3. GENERATE: Professional invoice with all necessary fields

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "invoiceNumber": "string (e.g., INV-2024-001)",
  "invoiceDate": "string (YYYY-MM-DD)",
  "dueDate": "string (YYYY-MM-DD)",
  "status": "draft | sent | paid",
  
  "from": {
    "name": "string",
    "businessName": "string (optional)",
    "address": "string",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "email": "string",
    "phone": "string",
    "pan": "string (optional)",
    "gst": "string (optional)"
  },
  
  "to": {
    "name": "string",
    "company": "string",
    "address": "string",
    "city": "string",
    "email": "string",
    "gst": "string (optional)"
  },
  
  "items": [
    {
      "description": "string",
      "details": "string (optional extra details)",
      "quantity": number,
      "unit": "string (hours/days/units)",
      "rate": number,
      "amount": number
    }
  ],
  
  "summary": {
    "subtotal": number,
    "discount": {
      "description": "string (optional)",
      "percentage": number,
      "amount": number
    },
    "taxable": number,
    "tax": {
      "label": "string (GST/Tax)",
      "percentage": number,
      "amount": number
    },
    "total": number,
    "amountInWords": "string"
  },
  
  "currency": {
    "code": "INR | USD",
    "symbol": "₹ | $"
  },
  
  "payment": {
    "bankName": "string",
    "accountName": "string",
    "accountNumber": "string",
    "ifsc": "string",
    "upiId": "string (optional)"
  },
  
  "notes": "string (optional)",
  "terms": "string (optional)"
}

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🧾 SMART PAYMENT RECEIPT PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartPaymentReceiptPrompt(casualInput: string): string {
    return `You are a professional receipt generator. Create a payment receipt from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT:
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Payer, amount, purpose, payment method
2. INFER: Receipt number, date, transaction details
3. GENERATE: Professional receipt with all fields

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "receiptNumber": "string (e.g., RCP-2024-001)",
  "receiptDate": "string (YYYY-MM-DD)",
  "receiptTime": "string (HH:MM AM/PM)",
  
  "receivedFrom": {
    "name": "string",
    "email": "string (optional)",
    "phone": "string (optional)",
    "address": "string (optional)"
  },
  
  "receivedBy": {
    "name": "string",
    "businessName": "string (optional)",
    "address": "string",
    "phone": "string",
    "email": "string"
  },
  
  "payment": {
    "amount": number,
    "amountInWords": "string",
    "currency": "INR | USD",
    "currencySymbol": "₹ | $",
    "method": "Cash | Bank Transfer | UPI | Cheque | Card",
    "referenceNumber": "string (optional)",
    "chequeNumber": "string (if cheque)",
    "bankName": "string (if cheque/transfer)"
  },
  
  "purpose": "string (what the payment is for)",
  "description": "string (detailed description)",
  
  "invoiceReference": "string (optional - linked invoice)",
  "balanceDue": number,
  
  "notes": "string (optional)",
  
  "signatory": {
    "name": "string",
    "designation": "string"
  }
}

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🏆 SMART CERTIFICATE PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartCertificatePrompt(casualInput: string): string {
    return `You are a professional certificate generator. Create a completion/achievement certificate from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT:
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Recipient name, course/achievement, issuer details
2. INFER: Certificate type, dates, credentials
3. GENERATE: Professional certificate with all fields

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "certificateType": "completion | achievement | participation | excellence",
  "certificateNumber": "string (e.g., CERT-2024-001)",
  "issueDate": "string (DD Month YYYY)",
  
  "title": "string (Certificate of Completion)",
  "subtitle": "string (optional - This is to certify that)",
  
  "recipient": {
    "name": "string",
    "designation": "string (optional)"
  },
  
  "achievement": {
    "description": "string (main achievement text)",
    "courseName": "string (if course completion)",
    "duration": "string (optional)",
    "completionDate": "string (optional)",
    "grade": "string (optional)",
    "score": "string (optional)"
  },
  
  "issuer": {
    "organizationName": "string",
    "organizationLogo": "",
    "address": "string (optional)",
    "website": "string (optional)"
  },
  
  "signatories": [
    {
      "name": "string",
      "designation": "string",
      "signature": ""
    }
  ],
  
  "additionalInfo": {
    "skills": ["string (skills acquired)"],
    "credentialId": "string (optional)",
    "verificationUrl": "string (optional)"
  },
  
  "design": {
    "accentColor": "#1a365d",
    "showBorder": true,
    "showSeal": true
  }
}

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🧾 SMART INVOICE PROMPT (General)
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartInvoicePrompt(casualInput: string): string {
    return `You are a professional invoice generator. Create a complete business invoice from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT:
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Business details, client details, items/services, amounts
2. INFER: Invoice number, dates, tax calculations, totals
3. GENERATE: Professional invoice with Indian GST format if applicable

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "invoiceNumber": "string",
  "invoiceDate": "string (YYYY-MM-DD)",
  "dueDate": "string (YYYY-MM-DD)",
  
  "from": {
    "name": "string",
    "company": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "email": "string",
    "phone": "string",
    "gst": "string (optional)",
    "pan": "string (optional)"
  },
  
  "to": {
    "name": "string",
    "company": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "email": "string",
    "gst": "string (optional)"
  },
  
  "items": [
    {
      "sno": number,
      "description": "string",
      "hsn": "string (optional)",
      "quantity": number,
      "unit": "string",
      "rate": number,
      "amount": number
    }
  ],
  
  "summary": {
    "subtotal": number,
    "discount": { "label": "string", "amount": number },
    "taxableAmount": number,
    "cgst": { "rate": number, "amount": number },
    "sgst": { "rate": number, "amount": number },
    "igst": { "rate": number, "amount": number },
    "total": number,
    "amountInWords": "string",
    "roundOff": number
  },
  
  "currency": "INR | USD",
  "currencySymbol": "₹ | $",
  
  "bankDetails": {
    "bankName": "string",
    "accountName": "string",
    "accountNumber": "string",
    "ifsc": "string",
    "branch": "string",
    "upiId": "string (optional)"
  },
  
  "terms": ["string"],
  "notes": "string"
}

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🎨 SMART PORTFOLIO PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartPortfolioPrompt(casualInput: string): string {
    return `You are a professional portfolio creator. Create a complete portfolio from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT:
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Name, profession, skills, projects, experience
2. INFER: Professional title, skill levels, project descriptions
3. GENERATE: Impressive portfolio content that showcases their work

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "header": {
    "name": "string",
    "title": "string (professional title)",
    "tagline": "string (catchy one-liner)",
    "avatar": "",
    "location": "string"
  },
  
  "contact": {
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string",
    "twitter": "string",
    "website": "string"
  },
  
  "about": "string (3-4 sentences about themselves)",
  
  "skills": [
    {
      "name": "string",
      "level": number (0-100),
      "category": "string"
    }
  ],
  
  "projects": [
    {
      "name": "string",
      "description": "string",
      "image": "",
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
      "description": "string",
      "highlights": ["string"]
    }
  ],
  
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
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
  ],
  
  "services": [
    {
      "title": "string",
      "description": "string",
      "icon": "string"
    }
  ]
}

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 👥 SMART CRM PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartCRMPrompt(casualInput: string): string {
    return `You are a CRM assistant. Create a lead/contact entry from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT:
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "lead": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "company": "string",
    "designation": "string",
    "source": "string",
    "status": "NEW | CONTACTED | QUALIFIED | PROPOSAL | WON | LOST",
    "priority": "LOW | MEDIUM | HIGH",
    "value": number,
    "currency": "INR | USD"
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

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 📅 SMART CONTENT PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartContentPrompt(casualInput: string): string {
    return `You are a content strategist. Create a content plan from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT:
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "planName": "string",
  "duration": "string",
  "platforms": ["string"],
  "goals": ["string"],
  
  "content": [
    {
      "date": "string",
      "day": "string",
      "platform": "string",
      "type": "POST | REEL | STORY | BLOG | VIDEO",
      "topic": "string",
      "caption": "string",
      "hashtags": ["string"],
      "callToAction": "string",
      "status": "PLANNED"
    }
  ],
  
  "themes": [
    { "name": "string", "color": "string", "percentage": number }
  ],
  
  "analytics": {
    "totalPosts": number,
    "postsPerWeek": number,
    "platformDistribution": [
      { "platform": "string", "count": number }
    ]
  }
}

═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }
  // ════════════════════════════════════════════════════════════════════════════
  // 📋 SMART AGREEMENT PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartAgreementPrompt(casualInput: string): string {
    return `You are a professional legal document writer. Create a complete agreement/contract from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT (may be casual, in Hindi/English/Hinglish):
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Party details, agreement type, terms, conditions
2. INFER: Agreement type (service/NDA/rental/employment/freelance/partnership/vendor), jurisdiction, duration
3. GENERATE: Professional legal agreement with all necessary clauses

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "agreementType": "service | nda | employment | rental | freelance | partnership | vendor",
  "title": "string (e.g., 'Service Level Agreement')",
  "referenceNumber": "string (e.g., AGR/2024/001)",
  "effectiveDate": "string (DD Month YYYY)",
  "expiryDate": "string (DD Month YYYY or 'Until terminated')",

  "partyA": {
    "name": "string",
    "type": "Individual | Company | Organization",
    "address": "string",
    "representedBy": "string (optional)",
    "designation": "string (optional)",
    "contact": "string (optional)",
    "pan": "string (optional)",
    "gst": "string (optional)"
  },

  "partyB": {
    "name": "string",
    "type": "Individual | Company | Organization",
    "address": "string",
    "representedBy": "string (optional)",
    "designation": "string (optional)",
    "contact": "string (optional)",
    "pan": "string (optional)",
    "gst": "string (optional)"
  },

  "recitals": "string (WHEREAS clauses - background/purpose of agreement)",

  "terms": [
    {
      "clauseNumber": "string (e.g., '1', '1.1')",
      "title": "string (clause heading)",
      "content": "string (clause text)"
    }
  ],

  "scopeOfWork": "string (description of services/obligations)",

  "compensation": {
    "amount": "string",
    "currency": "INR | USD",
    "paymentSchedule": "string",
    "paymentMethod": "string"
  },

  "confidentiality": "string (confidentiality clause text)",
  "termination": "string (termination conditions)",
  "disputeResolution": "string (arbitration/jurisdiction details)",
  "jurisdiction": "string (e.g., 'Courts of New Delhi, India')",
  "governingLaw": "string (e.g., 'Laws of India')",

  "signatures": [
    {
      "partyLabel": "string (Party A / Party B)",
      "name": "string",
      "designation": "string",
      "date": "string",
      "witness": "string (optional)"
    }
  ],

  "annexures": [
    {
      "title": "string",
      "content": "string"
    }
  ]
}

═══════════════════════════════════════════════════════════════
IMPORTANT:
- Use formal legal language
- Include standard clauses: confidentiality, termination, dispute resolution, force majeure
- If Indian context, reference Indian Contract Act, 1872
- Generate realistic but placeholder details for missing info
═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 📢 SMART MEMO / NOTICE PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartMemoPrompt(casualInput: string): string {
    return `You are a professional office communications writer. Create a memo or notice from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT (may be casual, in Hindi/English/Hinglish):
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Sender, recipients, subject, key message
2. INFER: Memo type (internal/official/meeting/policy/announcement/circular), urgency, department
3. GENERATE: Professional office communication with proper formatting

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "memoType": "internal | official | meeting | policy | announcement | circular",
  "referenceNumber": "string (e.g., MEMO/2024/001)",
  "date": "string (DD Month YYYY)",
  "priority": "Normal | Urgent | Confidential",

  "organization": {
    "name": "string",
    "department": "string (optional)",
    "logo": "",
    "address": "string (optional)"
  },

  "from": {
    "name": "string",
    "designation": "string",
    "department": "string",
    "email": "string (optional)"
  },

  "to": {
    "recipients": "string (e.g., 'All Employees' or 'Marketing Department')",
    "cc": "string (optional)",
    "distribution": "string (optional)"
  },

  "subject": "string (clear, concise subject line)",

  "content": {
    "opening": "string (context/purpose paragraph)",
    "body": ["string (main content paragraphs)"],
    "keyPoints": ["string (bullet points if applicable)"],
    "actionRequired": "string (what recipients need to do)",
    "deadline": "string (optional - deadline for action)",
    "closing": "string (closing paragraph)"
  },

  "effectiveDate": "string (optional - when the memo/notice takes effect)",

  "attachments": ["string (list of attached documents, optional)"],

  "signatory": {
    "name": "string",
    "designation": "string",
    "department": "string"
  },

  "footer": {
    "confidentialityNotice": "string (optional)",
    "contactForQueries": "string (optional)"
  }
}

═══════════════════════════════════════════════════════════════
IMPORTANT:
- Use formal, professional tone
- Be clear and concise
- Include action items where applicable
- For meeting notices: include agenda, date, time, venue
- For policy updates: clearly state what changed and effective date
═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 💼 SMART PROPOSAL PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartProposalPrompt(casualInput: string): string {
    return `You are a professional business proposal writer. Create a compelling proposal from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT (may be casual, in Hindi/English/Hinglish):
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Proposer details, client/recipient, project/service details
2. INFER: Proposal type (business/project/sales/research/grant/sponsorship), scope, timeline
3. GENERATE: Professional, compelling proposal with all sections

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "proposalType": "business | project | sales | research | grant | sponsorship",
  "title": "string (compelling proposal title)",
  "referenceNumber": "string (e.g., PROP/2024/001)",
  "date": "string (DD Month YYYY)",
  "validUntil": "string (DD Month YYYY)",

  "preparedBy": {
    "name": "string",
    "company": "string",
    "designation": "string",
    "address": "string",
    "email": "string",
    "phone": "string",
    "website": "string (optional)",
    "logo": ""
  },

  "preparedFor": {
    "name": "string",
    "company": "string",
    "designation": "string (optional)",
    "address": "string",
    "email": "string (optional)"
  },

  "executiveSummary": "string (2-3 paragraph overview of the proposal)",

  "problemStatement": "string (what problem/need this addresses)",

  "proposedSolution": {
    "overview": "string (solution description)",
    "keyFeatures": ["string (main features/benefits)"],
    "methodology": "string (approach/methodology)",
    "deliverables": ["string (list of deliverables)"]
  },

  "scope": {
    "inScope": ["string (what is included)"],
    "outOfScope": ["string (what is not included)"]
  },

  "timeline": [
    {
      "phase": "string (phase name)",
      "duration": "string (e.g., '2 weeks')",
      "milestones": ["string"],
      "startDate": "string",
      "endDate": "string"
    }
  ],

  "investment": {
    "items": [
      {
        "description": "string",
        "quantity": "string",
        "unitCost": "string",
        "total": "string"
      }
    ],
    "subtotal": "string",
    "tax": "string",
    "total": "string",
    "currency": "INR | USD",
    "currencySymbol": "₹ | $",
    "paymentTerms": "string",
    "paymentSchedule": ["string"]
  },

  "whyChooseUs": ["string (differentiators/USPs)"],

  "teamMembers": [
    {
      "name": "string",
      "role": "string",
      "experience": "string"
    }
  ],

  "caseStudies": [
    {
      "client": "string",
      "project": "string",
      "outcome": "string"
    }
  ],

  "termsAndConditions": ["string"],

  "nextSteps": ["string (what happens after acceptance)"],

  "signature": {
    "name": "string",
    "designation": "string",
    "company": "string",
    "date": "string"
  }
}

═══════════════════════════════════════════════════════════════
IMPORTANT:
- Make it compelling and professional
- Use persuasive language in executive summary
- Include realistic timelines and pricing
- Add value propositions and differentiators
- For Indian context: use INR, include GST considerations
═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 📰 SMART NEWSLETTER PROMPT
  // ════════════════════════════════════════════════════════════════════════════

  private buildSmartNewsletterPrompt(casualInput: string): string {
    return `You are a professional newsletter writer. Create an engaging newsletter from casual input.

═══════════════════════════════════════════════════════════════
USER'S INPUT (may be casual, in Hindi/English/Hinglish):
═══════════════════════════════════════════════════════════════
"${casualInput}"

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════
1. EXTRACT: Company/brand details, key news/updates, audience
2. INFER: Newsletter type (company/product/event/digest/promotional), tone, layout
3. GENERATE: Engaging newsletter with all sections

═══════════════════════════════════════════════════════════════
OUTPUT JSON:
═══════════════════════════════════════════════════════════════
{
  "newsletterType": "company | product | event | digest | promotional",
  "title": "string (newsletter title/edition)",
  "subtitle": "string (tagline or edition info, e.g., 'January 2024 Edition')",
  "date": "string (DD Month YYYY)",
  "edition": "string (e.g., 'Vol. 1, Issue 3')",

  "brand": {
    "name": "string",
    "logo": "",
    "website": "string",
    "tagline": "string (optional)",
    "color": "#1a365d"
  },

  "header": {
    "headline": "string (main attention-grabbing headline)",
    "preheader": "string (email preview text)",
    "bannerImage": ""
  },

  "greeting": "string (e.g., 'Dear Readers,' or 'Hi Team,')",

  "editorsNote": "string (optional - personal message from editor)",

  "featuredStory": {
    "title": "string",
    "content": "string (2-3 paragraphs)",
    "image": "",
    "ctaText": "string (e.g., 'Read More')",
    "ctaUrl": "string"
  },

  "sections": [
    {
      "title": "string (section heading)",
      "articles": [
        {
          "title": "string",
          "summary": "string (2-3 sentences)",
          "image": "",
          "link": "string (optional)"
        }
      ]
    }
  ],

  "highlights": [
    {
      "icon": "string (emoji)",
      "stat": "string (number/metric)",
      "label": "string (description)"
    }
  ],

  "upcomingEvents": [
    {
      "name": "string",
      "date": "string",
      "time": "string (optional)",
      "venue": "string (optional)",
      "description": "string"
    }
  ],

  "callToAction": {
    "text": "string",
    "buttonText": "string",
    "buttonUrl": "string",
    "description": "string (optional)"
  },

  "socialLinks": {
    "twitter": "string (optional)",
    "linkedin": "string (optional)",
    "instagram": "string (optional)",
    "facebook": "string (optional)",
    "youtube": "string (optional)"
  },

  "footer": {
    "companyName": "string",
    "address": "string",
    "unsubscribeText": "string",
    "copyrightYear": "string"
  }
}

═══════════════════════════════════════════════════════════════
IMPORTANT:
- Make content engaging and scannable
- Use compelling headlines
- Keep article summaries concise
- Include clear calls to action
- Generate realistic placeholder content for missing info
- Tone should match the newsletter type (formal for company, exciting for product, etc.)
═══════════════════════════════════════════════════════════════
RESPOND ONLY WITH VALID JSON. NO MARKDOWN. NO EXPLANATIONS.
═══════════════════════════════════════════════════════════════`;
  }
  // ════════════════════════════════════════════════════════════════════════════
  // 📝 LEGACY PROMPT BUILDERS (Structured Input)
  // ════════════════════════════════════════════════════════════════════════════

  private buildPrompt(tool: WorkspaceTool, userInput: Record<string, any>): string {
    // Convert structured input to casual text and use smart prompt
    const casualText = JSON.stringify(userInput, null, 2);
    return this.buildSmartPrompt(tool, casualText);
  }

  private buildEditPrompt(
    tool: WorkspaceTool,
    existingJson: Record<string, any>,
    editRequest: string
  ): string {
    return `You previously generated this ${tool.toLowerCase()} data:
${JSON.stringify(existingJson, null, 2)}

User wants this change: "${editRequest}"

RULES:
- Keep ALL existing data intact
- Only modify what user specifically requested
- Maintain the exact same JSON structure
- Recalculate totals if amounts change

Return the COMPLETE updated JSON with the requested changes.
Respond ONLY with valid JSON, no explanations.`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🔧 POST-PROCESS FOR HBS COMPATIBILITY
  // ════════════════════════════════════════════════════════════════════════════

  private postProcessForHBS(tool: WorkspaceTool, json: Record<string, any>): Record<string, any> {
    switch (tool) {
      case 'RESUME':
        return this.postProcessResume(json);
      case 'INVOICE':
        return this.postProcessInvoice(json);
      default:
        return json;
    }
  }

  private postProcessResume(json: Record<string, any>): Record<string, any> {
    // Ensure initials exist
    if (!json.initials && json.fullName) {
      const names = json.fullName.split(' ');
      json.initials = names.map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    }
    
    // Ensure all boolean flags are set correctly
    json.hasPhoto = !!(json.profilePhoto && json.profilePhoto.length > 0);
    json.hasLinkedin = !!(json.linkedin && json.linkedin.length > 0);
    json.hasGithub = !!(json.github && json.github.length > 0);
    json.hasPortfolio = !!(json.portfolio && json.portfolio.length > 0);
    json.hasObjective = !!(json.objective && json.objective.length > 0);
    json.hasSkills = !!(json.technicalSkills && json.technicalSkills.length > 0);
    json.hasLanguages = !!(json.languages && json.languages.length > 0);
    json.hasInterests = !!(json.interests && json.interests.length > 0);
    json.hasEducation = !!(json.education && json.education.length > 0);
    json.hasExperience = !!(json.experience && json.experience.length > 0);
    json.hasProjects = !!(json.projects && json.projects.length > 0);
    json.hasCertifications = !!(json.certifications && json.certifications.length > 0);
    json.hasAchievements = !!(json.achievements && json.achievements.length > 0);
    
    // Ensure skills have proper structure for progress bars
    if (json.technicalSkills) {
      json.technicalSkills = json.technicalSkills.map((skill: any) => ({
        ...skill,
        level: Math.min(95, Math.max(60, skill.level || 75))
      }));
    }
    
    // Ensure softSkills is array of objects with name
    if (json.softSkills) {
      json.softSkills = json.softSkills.map((skill: any) => {
        if (typeof skill === 'string') {
          return { name: skill };
        }
        return skill;
      });
    }
    
    // Ensure languages have correct proficiency (1-5 scale)
    if (json.languages) {
      json.languages = json.languages.map((lang: any) => ({
        ...lang,
        proficiency: Math.min(5, Math.max(1, lang.proficiency || 3))
      }));
    }
    
    // Ensure interests have name property
    if (json.interests) {
      json.interests = json.interests.map((interest: any) => {
        if (typeof interest === 'string') {
          return { name: interest };
        }
        return interest;
      });
    }
    
    // Ensure achievements have title property
    if (json.achievements) {
      json.achievements = json.achievements.map((achievement: any) => {
        if (typeof achievement === 'string') {
          return { title: achievement };
        }
        return achievement;
      });
    }
    
    return json;
  }

  private postProcessInvoice(json: Record<string, any>): Record<string, any> {
    // Recalculate totals to ensure accuracy
    if (json.items && Array.isArray(json.items)) {
      let subtotal = 0;
      json.items = json.items.map((item: any, index: number) => {
        const amount = (item.quantity || 1) * (item.rate || 0);
        subtotal += amount;
        return {
          ...item,
          sno: index + 1,
          amount
        };
      });
      
      if (json.summary) {
        json.summary.subtotal = subtotal;
        // Recalculate tax and total
        const taxRate = json.summary.tax?.percentage || 18;
        const taxAmount = subtotal * (taxRate / 100);
        const discount = json.summary.discount?.amount || 0;
        json.summary.tax = { ...json.summary.tax, amount: taxAmount };
        json.summary.total = subtotal + taxAmount - discount;
      }
    }
    
    return json;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 GEMINI 2.0 FLASH CALL
  // ════════════════════════════════════════════════════════════════════════════

  private async callGemini(prompt: string, maxTokens: number): Promise<LLMResponse> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7
          },
          systemInstruction: {
            parts: [{ text: 'You are a professional document generator. Always respond with valid JSON only. No markdown, no explanations, no code blocks.' }]
          }
        })
      }
    );

    const data = (await response.json()) as GeminiResponse;
    const content = data.candidates[0].content.parts[0].text;

    return {
      json: this.parseJSON(content),
      inputTokens: data.usageMetadata.promptTokenCount,
      outputTokens: data.usageMetadata.candidatesTokenCount
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🟠 MISTRAL LARGE CALL
  // ════════════════════════════════════════════════════════════════════════════

  private async callMistral(prompt: string, maxTokens: number): Promise<LLMResponse> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: 'You are a professional document generator. Always respond with valid JSON only. No markdown, no explanations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    const data = (await response.json()) as any;
    console.log('[WorkspaceLLM] Mistral raw response:', JSON.stringify(data).substring(0, 500));
    console.log('[WorkspaceLLM] HTTP Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`[WorkspaceLLM] Mistral API error (${response.status}): ${JSON.stringify(data)}`);
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error(`[WorkspaceLLM] Mistral empty choices. Response: ${JSON.stringify(data).substring(0, 300)}`);
    }

    const content = data.choices[0].message.content;

    return {
      json: this.parseJSON(content),
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🟣 ANTHROPIC (Claude) CALL
  // ════════════════════════════════════════════════════════════════════════════

  private async callAnthropic(prompt: string, maxTokens: number): Promise<LLMResponse> {
    // V10.3: Using Mistral Large instead of Claude Haiku
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: 'You are a professional document generator. Always respond with valid JSON only. No markdown, no explanations.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      json: this.parseJSON(content),
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🔧 PARSE JSON SAFELY
  // ════════════════════════════════════════════════════════════════════════════

  private parseJSON(content: string): Record<string, any> {
    try {
      let cleanContent = content.trim();
      
      // Remove markdown code blocks
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      // Remove any leading/trailing whitespace
      cleanContent = cleanContent.trim();
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('JSON Parse Error:', content.substring(0, 200));
      throw new Error(`Failed to parse LLM response as JSON`);
    }
  }
}

export const workspaceLLMService = new WorkspaceLLMService();