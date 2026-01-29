// src/modules/image/image.controller.ts

/**
 * ==========================================
 * SORIVA IMAGE CONTROLLER
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: HTTP handlers for image generation API endpoints
 * Last Updated: January 20, 2026 - v10.6 LLM Deity Detection
 *
 * CHANGELOG v10.6 (January 20, 2026):
 * - 🧠 NEW: LLM-based deity detection (Mistral) - no more false positives!
 * - ✅ "Govind sharma photo" → ALLOWED (person name)
 * - ✅ "lehnga suit" → ALLOWED (no more agni false match)
 * - 🚫 "Bhagwan Krishna" → BLOCKED (actual deity request)
 * - 🚫 REMOVED: Keyword-based detection (too many false positives)
 *
 * CHANGELOG v10.5 (January 20, 2026):
 * - 🚫 ADDED: Deity/Religious content blocking with respectful disclaimer
 * - 🛡️ Protects against culturally inaccurate AI-generated religious imagery
 *
 * CHANGELOG v10.4:
 * - Added dual model support: Klein 9B + Schnell (Fal.ai)
 * - Smart routing based on prompt content
 *
 * ENDPOINTS:
 * - POST   /api/image/generate        → Generate an image (auto-routes to Klein/Schnell)
 * - POST   /api/image/edit-generate   → Edit & regenerate image
 * - GET    /api/image/quota           → Get user's image quota
 * - GET    /api/image/history         → Get generation history
 * - POST   /api/image/detect-intent   → Check if message is image request
 */

import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { createImageService, ImageService } from '../../services/image';
import { ImageProvider, SUPPORTED_ASPECT_RATIOS } from '../../types/image.types';
import { optimizePrompt } from '../../services/image/promptOptimizer';
import { detectCategory } from '../../services/image/imageGenerator';
import { PLANS_STATIC_CONFIG, PlanType } from '../../constants/plans';
import axios from 'axios';

// ==========================================
// INTERFACES
// ==========================================

interface GenerateImageBody {
  prompt: string;
  provider?: 'klein9b' | 'schnell' | 'auto';
  aspectRatio?: string;
  sessionId?: string;
}

interface EditAndGenerateBody {
  originalPrompt: string;
  editInstruction: string;
  provider?: 'klein9b' | 'schnell' | 'auto';
  aspectRatio?: string;
  sessionId?: string;
}

// ==========================================
// 🧠 LLM-BASED DEITY DETECTION (Mistral Small - Fast & Cheap)
// ==========================================

/**
 * Use Mistral to detect if prompt is requesting deity/religious figure image
 * Fast (~1-2 sec) and accurate - understands context!
 * 
 * Examples:
 * - "Govind sharma portrait" → NO (person name)
 * - "Bhagwan Govind playing flute" → YES (deity)
 * - "lehnga suit girl" → NO (clothing)
 * - "Lord Krishna" → YES (deity)
 */
async function isDeityImageRequest(prompt: string): Promise<{ isDeity: boolean; reason?: string }> {
  try {
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [{
          role: 'user',
          content: `You are a content classifier. Determine if this image generation prompt is requesting an image of a deity, god, goddess, or religious figure from ANY religion (Hindu, Christian, Islamic, Sikh, Buddhist, Jain, etc.)

IMPORTANT DISTINCTIONS:
- "Govind sharma photo" → NO (Govind is a common Indian name)
- "Lord Govind with flute" → YES (Lord Govind = Krishna = deity)
- "Ram kumar portrait" → NO (Ram is a common name)
- "Shri Ram with bow" → YES (Shri Ram = Lord Rama = deity)
- "Diwali celebration with diyas" → NO (festival, not deity)
- "Ganesh Chaturthi decorations" → NO (festival decorations)
- "Lord Ganesha idol" → YES (deity figure)
- "Beautiful temple" → NO (building, not deity)
- "Jesus Christ" → YES (religious figure)
- "Buddha statue" → YES (religious figure)

Prompt: "${prompt}"

Reply in this exact format:
DEITY: YES or NO
REASON: (brief explanation)`
        }],
        max_tokens: 100,
        temperature: 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || '';
    const isDeity = text.toUpperCase().includes('DEITY: YES');
    const reasonMatch = text.match(/REASON:\s*(.+)/i);
    const reason = reasonMatch ? reasonMatch[1].trim() : undefined;

    console.log(`[LLM DEITY CHECK] Prompt: "${prompt.substring(0, 50)}..." | Result: ${isDeity ? 'BLOCKED' : 'ALLOWED'}`);
    
    return { isDeity, reason };
  } catch (error: any) {
    console.error('[LLM DEITY CHECK] Error:', error?.response?.data || error.message);
    // On error, allow the request (fail open) - backend shouldn't block on LLM failure
    return { isDeity: false, reason: 'LLM check failed, allowing request' };
  }
}

// Respectful disclaimer message for blocked deity content
const DEITY_BLOCK_RESPONSE = {
  success: false,
  error: '🙏 We deeply respect religious sentiments. AI-generated deity images may not accurately represent authentic religious iconography as per cultural traditions and scriptures. To maintain the sanctity and dignity of our beloved deities, this feature is currently unavailable for deity imagery.',
  errorCode: 'DEITY_CONTENT_BLOCKED',
  suggestion: '✨ Try creating festival greeting cards, rangoli designs, or beautiful portraits instead!',
  alternatives: [
    'Create festival greeting cards (Diwali, Holi, Navratri)',
    'Generate rangoli designs',
    'Create birthday/anniversary cards',
    'Generate beautiful landscapes, portraits, animals',
  ],
};

// ==========================================
// SMART ROUTING KEYWORDS (Non-deity content only)
// ==========================================

const KLEIN_KEYWORDS = [
  // Text/Typography
  'text', 'quote', 'quotes', 'typography', 'font', 'letter', 'word', 'message',
  'likha', 'likhna', 'likho', 'text likho', 'quote likho', 'लिखो', 'लिखना',
  
  // Cards/Greetings
  'card', 'greeting', 'invitation', 'poster', 'banner', 'flyer',
  'birthday card', 'wedding card', 'anniversary card', 'wish card',
  'greeting card', 'शुभकामना', 'कार्ड',
  
  // Festivals (Cards/Greetings - NOT deity images)
  'diwali card', 'diwali greeting', 'diwali wish', 'diwali poster',
  'holi card', 'holi greeting', 'holi wish',
  'navratri card', 'navratri greeting',
  'raksha bandhan card', 'rakhi card',
  'eid card', 'eid greeting', 'eid mubarak',
  'christmas card', 'christmas greeting',
  'new year card', 'new year wish',
  
  // Indian Cultural (decorative - NOT deities)
  'rangoli', 'mehndi', 'henna', 'diya', 'deepak', 'diya design',
  'mandala', 'paisley', 'ethnic pattern', 'indian pattern',
  'kolam', 'alpana', 'muggu',
  
  // Festival Decorations
  'toran', 'bandhanwar', 'flower decoration', 'marigold',
  'lantern', 'kandil', 'akash kandil',
];

/**
 * Detect best provider based on plan's imageRouting config
 * Uses smart category detection (human/text/nonHuman)
 */
function detectBestProvider(
  prompt: string, 
  planType: PlanType = PlanType.STARTER
): { provider: 'klein9b' | 'schnell'; category: string; reason: string } {
  const plan = PLANS_STATIC_CONFIG[planType];
  const imageRouting = plan?.imageRouting || {
    human: 'schnell',
    nonHuman: 'schnell',
    text: 'schnell',
    deities: 'blocked',
    default: 'schnell',
  };

  // Detect category from prompt
  const category = detectCategory(prompt);

  // Get model from routing config
  let model: 'klein' | 'schnell';
  let reason: string;

  switch (category) {
    case 'human':
      model = imageRouting.human;
      reason = `Human/People detected → ${model === 'klein' ? 'Klein (quality)' : 'Schnell (fast)'}`;
      break;
    case 'text':
      model = imageRouting.text;
      reason = `Text/Typography detected → ${model === 'klein' ? 'Klein (clarity)' : 'Schnell'}`;
      break;
    case 'deities':
      // This shouldn't reach here (LLM blocks first), but just in case
      model = 'schnell';
      reason = 'Deity content (should be blocked)';
      break;
    case 'nonHuman':
    default:
      model = imageRouting.nonHuman || imageRouting.default;
      reason = `General content → ${model === 'klein' ? 'Klein' : 'Schnell (cost-effective)'}`;
      break;
  }

  return {
    provider: model === 'klein' ? 'klein9b' : 'schnell',
    category,
    reason,
  };
}

// ==========================================
// IMAGE CONTROLLER CLASS
// ==========================================

export class ImageController {
  private imageService: ImageService;

  constructor() {
    this.imageService = createImageService(prisma);
  }

  // ==========================================
  // GENERATE IMAGE
  // ==========================================

  /**
   * POST /api/image/generate
   * Generate an image from prompt
   * 
   * Smart Routing:
   * - 'auto' (default): Automatically selects Klein or Schnell based on prompt
   * - 'klein9b': Force Klein 9B (text/festivals)
   * - 'schnell': Force Schnell (general images)
   */
  async generateImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { prompt, provider = 'auto', aspectRatio, sessionId } = req.body as GenerateImageBody;
      console.log('[DEBUG] Received provider:', provider, '| Full body:', JSON.stringify(req.body));

      // Validate authentication
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate prompt
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Prompt is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate prompt length
      if (prompt.length > 2000) {
        res.status(400).json({
          success: false,
          error: 'Prompt too long (maximum 2000 characters)',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate aspect ratio if provided
      if (aspectRatio && !SUPPORTED_ASPECT_RATIOS.includes(aspectRatio as any)) {
        res.status(400).json({
          success: false,
          error: `Invalid aspect ratio. Supported: ${SUPPORTED_ASPECT_RATIOS.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate provider if provided
      const validProviders = ['klein9b', 'schnell', 'auto'];
      if (provider && !validProviders.includes(provider)) {
        res.status(400).json({
          success: false,
          error: `Invalid provider. Use: ${validProviders.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // ==========================================
      // 🧠 LLM-BASED DEITY DETECTION
      // ==========================================
      const deityCheck = await isDeityImageRequest(prompt);
      if (deityCheck.isDeity) {
        console.warn(`[DEITY BLOCKED] Reason: "${deityCheck.reason}" | Prompt: "${prompt.substring(0, 50)}..."`);
        res.status(403).json({
          ...DEITY_BLOCK_RESPONSE,
          detectionReason: deityCheck.reason,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // ==========================================
      // GET USER'S PLAN FOR ROUTING
      // ==========================================
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true },
      });
      const userPlanType = (user?.planType as PlanType) || PlanType.STARTER;

      // ==========================================
      // SMART ROUTING: Auto-detect best provider based on plan
      // ==========================================
      let selectedProvider: 'klein9b' | 'schnell';
      let routingReason: string;
      let detectedCategory: string = 'unknown';

      if (provider === 'auto' || !provider) {
        const routing = detectBestProvider(prompt, userPlanType);
        selectedProvider = routing.provider;
        routingReason = routing.reason;
        detectedCategory = routing.category;
      } else {
        selectedProvider = provider as 'klein9b' | 'schnell';
        routingReason = `User selected ${selectedProvider}`;
      }

      console.log(`[ImageController] Provider: ${selectedProvider} - ${routingReason}`);

      // Map to ImageProvider enum
      const imageProvider = selectedProvider === 'klein9b' 
        ? ImageProvider.KLEIN9B 
        : ImageProvider.SCHNELL;

      // Generate image
      const result = await this.imageService.generateImage({
        userId,
        prompt: prompt.trim(),
        provider: imageProvider,
        aspectRatio,
        sessionId,
      });

      // Handle quota exhausted
      if (!result.success && result.errorCode === 'QUOTA_EXHAUSTED') {
        res.status(429).json(result);
        return;
      }

      // Handle other errors
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Success - include routing info
      res.status(200).json({
        ...result,
        routing: {
          provider: selectedProvider,
          category: detectedCategory,
          reason: routingReason,
          cost: selectedProvider === 'klein9b' ? '₹1.26' : '₹0.25',
          planType: userPlanType,
        },
      });

    } catch (error) {
      console.error('[ImageController] Generate error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // EDIT & REGENERATE IMAGE
  // ==========================================

  /**
   * POST /api/image/edit-generate
   * Edit an existing prompt and regenerate with new instructions
   * Uses Mistral Large for intelligent prompt merging
   */
  async editAndGenerate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { 
        originalPrompt, 
        editInstruction, 
        provider = 'auto', 
        aspectRatio, 
        sessionId 
      } = req.body as EditAndGenerateBody;

      // Validate authentication
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate inputs
      if (!originalPrompt || typeof originalPrompt !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Original prompt is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!editInstruction || typeof editInstruction !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Edit instruction is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate aspect ratio if provided
      if (aspectRatio && !SUPPORTED_ASPECT_RATIOS.includes(aspectRatio as any)) {
        res.status(400).json({
          success: false,
          error: `Invalid aspect ratio. Supported: ${SUPPORTED_ASPECT_RATIOS.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // ==========================================
      // Create merged prompt for optimization
      // ==========================================
      const mergedPrompt = `${originalPrompt}. Changes: ${editInstruction}`;

      // ==========================================
      // 🧠 LLM-BASED DEITY DETECTION (for edited prompt too)
      // ==========================================
      const deityCheck = await isDeityImageRequest(mergedPrompt);
      if (deityCheck.isDeity) {
        console.warn(`[DEITY BLOCKED - EDIT] Reason: "${deityCheck.reason}" | Prompt: "${mergedPrompt.substring(0, 50)}..."`);
        res.status(403).json({
          ...DEITY_BLOCK_RESPONSE,
          detectionReason: deityCheck.reason,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // ==========================================
      // GET USER'S PLAN FOR ROUTING
      // ==========================================
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true },
      });
      const userPlanType = (user?.planType as PlanType) || PlanType.STARTER;

      // ==========================================
      // SMART ROUTING for edited content based on plan
      // ==========================================
      let selectedProvider: 'klein9b' | 'schnell';
      let routingReason: string;
      let detectedCategory: string = 'unknown';

      if (provider === 'auto' || !provider) {
        const routing = detectBestProvider(mergedPrompt, userPlanType);
        selectedProvider = routing.provider;
        routingReason = routing.reason;
        detectedCategory = routing.category;
      } else {
        selectedProvider = provider as 'klein9b' | 'schnell';
        routingReason = `User selected ${selectedProvider}`;
      }

      console.log(`[ImageController - Edit] Provider: ${selectedProvider} - ${routingReason}`);

      // Map to ImageProvider enum
      const imageProvider = selectedProvider === 'klein9b' 
        ? ImageProvider.KLEIN9B 
        : ImageProvider.SCHNELL;

      // ==========================================
      // Optimize merged prompt with Mistral
      // ==========================================
      const optimizationResult = await optimizePrompt(mergedPrompt, imageProvider);
      const finalPrompt = optimizationResult.optimizedPrompt;

      console.log(`[ImageController - Edit] Final optimized prompt: "${finalPrompt.substring(0, 80)}..."`);

      // Generate with optimized prompt
      const result = await this.imageService.generateImage({
        userId,
        prompt: finalPrompt,
        provider: imageProvider,
        aspectRatio,
        sessionId,
      });

      // Handle quota exhausted
      if (!result.success && result.errorCode === 'QUOTA_EXHAUSTED') {
        res.status(429).json(result);
        return;
      }

      // Handle other errors
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // ==========================================
      // Success Response with Edit Info
      // ==========================================
      
      res.status(200).json({
        ...result,
        routing: {
          provider: selectedProvider,
          reason: routingReason,
          cost: selectedProvider === 'klein9b' ? '₹1.26' : '₹0.25',
        },
        editInfo: {
          originalPrompt: originalPrompt.trim(),
          editInstruction: editInstruction.trim(),
          optimizedPrompt: finalPrompt,
          detectedLanguage: optimizationResult.detectedLanguage,
          enhancements: optimizationResult.enhancements,
          containsText: optimizationResult.containsText,
          containsLogo: optimizationResult.containsLogo,
          isRealistic: optimizationResult.isRealistic,
        },
      });

    } catch (error) {
      console.error('[ImageController] Edit & Generate error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // GET QUOTA
  // ==========================================

  /**
   * GET /api/image/quota
   * Get user's image generation quota (Klein 9B + Schnell)
   */
  async getQuota(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const quota = await this.imageService.getUserQuota(userId);

      if (!quota) {
        res.status(404).json({
          success: false,
          error: 'Quota information not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          planType: quota.planType,
          region: quota.region,
          klein9b: {
            limit: quota.klein9bLimit,
            used: quota.klein9bUsed,
            remaining: quota.klein9bRemaining,
            booster: quota.boosterKlein9b,
            cost: '₹1.26/image',
            bestFor: 'Text, Cards, Festivals',
          },
          schnell: {
            limit: quota.schnellLimit || 0,
            used: quota.schnellUsed || 0,
            remaining: quota.schnellRemaining || 0,
            booster: quota.boosterSchnell || 0,
            cost: '₹0.25/image',
            bestFor: 'General images - People, Animals, Objects',
          },
          totalRemaining: quota.totalRemaining,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] Quota error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // GET HISTORY
  // ==========================================

  /**
   * GET /api/image/history
   * Get user's image generation history
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate limit
      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const history = await prisma.imageGeneration.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          provider: true,
          prompt: true,
          imageUrl: true,
          status: true,
          costINR: true,
          generationTime: true,
          createdAt: true,
        },
      });

      const total = await prisma.imageGeneration.count({
        where: { userId },
      });

      res.status(200).json({
        success: true,
        data: {
          images: history,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + history.length < total,
          },
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] History error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // DETECT INTENT
  // ==========================================

  /**
   * POST /api/image/detect-intent
   * Check if message is an image generation request
   * Useful for frontend to show image generation UI
   */
  async detectIntent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { message } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - Please login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Message is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const intentResult = this.imageService.detectIntent(message);

      res.status(200).json({
        success: true,
        data: {
          isImageRequest: intentResult.isImageRequest,
          confidence: intentResult.confidence,
          intentType: intentResult.intentType,
          suggestedProvider: intentResult.suggestedProvider,
          extractedPrompt: intentResult.extractedPrompt,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] Detect intent error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export default new ImageController();