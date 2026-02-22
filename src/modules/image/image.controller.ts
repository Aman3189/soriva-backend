// src/modules/image/image.controller.ts

/**
 * ==========================================
 * SORIVA IMAGE CONTROLLER v12.0
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: HTTP handlers for image generation API endpoints
 * 
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 * 
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 *    - img2img endpoint ❌ (was using Nano Banana)
 * 
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25/image - General images (scenery, nature, animals)
 *    - GPT LOW (OpenAI gpt-image-1.5): ₹1.18/image - Text, Ads, Festivals, Transforms
 * 
 * ✅ ROUTING LOGIC:
 *    - Scenery/Nature/Animals → Schnell (₹0.25)
 *    - Text/Ads/Festivals/Posters/Transforms/Deities → GPT LOW (₹1.18)
 * 
 * ==========================================
 * ENDPOINTS:
 * ==========================================
 * - POST   /api/image/generate        → Generate an image (auto-routes to Schnell/GPT LOW)
 * - POST   /api/image/edit-generate   → Edit & regenerate image
 * - GET    /api/image/quota           → Get user's image quota
 * - GET    /api/image/history         → Get generation history
 * - POST   /api/image/detect-intent   → Check if message is image request
 * 
 * Last Updated: February 22, 2026
 */

import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { createImageService, ImageService } from '../../services/image';
import { ImageProvider, SUPPORTED_ASPECT_RATIOS, IMAGE_COST_BY_PROVIDER } from '../../types/image.types';
import { optimizePrompt } from '../../services/image/promptOptimizer';
import { PlanType } from '../../constants/plans';
import axios from 'axios';

// ==========================================
// 🙏 LLM-BASED DEITY DETECTION (Mistral Small - Fast & Cheap)
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

// ==========================================
// INTERFACES
// ==========================================

interface GenerateImageBody {
  prompt: string;
  provider?: 'schnell' | 'gptLow' | 'auto';
  aspectRatio?: 'portrait' | 'landscape' | string;
  sessionId?: string;
}

interface EditAndGenerateBody {
  originalPrompt: string;
  editInstruction: string;
  provider?: 'schnell' | 'gptLow' | 'auto';
  aspectRatio?: 'portrait' | 'landscape' | string;
  sessionId?: string;
}

// ==========================================
// SMART ROUTING KEYWORDS (v12.0 - 2 Model System)
// ==========================================

/**
 * Keywords that trigger GPT LOW routing
 * GPT LOW is best for: Text, Logos, Festivals, Ads, Cards, Deities, Transforms
 */
const GPT_LOW_KEYWORDS = [
  // Text/Typography
  'text', 'quote', 'quotes', 'typography', 'font', 'letter', 'word', 'message',
  'likha', 'likhna', 'likho', 'text likho', 'quote likho', 'लिखो', 'लिखना',
  
  // Cards/Greetings
  'card', 'greeting', 'invitation', 'poster', 'banner', 'flyer',
  'birthday card', 'wedding card', 'anniversary card', 'wish card',
  'greeting card', 'visiting card', 'business card',
  'शुभकामना', 'कार्ड',
  
  // Festivals
  'diwali', 'holi', 'navratri', 'durga puja', 'ganesh chaturthi',
  'raksha bandhan', 'rakhi', 'eid', 'christmas', 'new year',
  'festival', 'celebration', 'tyohar',
  
  // Indian Cultural
  'rangoli', 'mehndi', 'henna', 'diya', 'deepak', 'mandala',
  'kolam', 'alpana', 'toran', 'kandil',
  
  // Logos/Brands
  'logo', 'brand', 'emblem', 'icon', 'symbol', 'monogram', 'mascot',
  
  // Advertisements
  'ad', 'advertisement', 'promotional', 'promo', 'offer', 'sale',
  'discount', 'marketing', 'campaign', 'billboard', 'hoarding',
  
  // Style Transformations
  'gta', 'gta style', 'anime', 'anime style', 'manga',
  'pixar', 'disney', 'cartoon', 'caricature',
  'oil painting', 'watercolor', 'sketch', 'comic',
  '3d render', 'clay render',
  
  // Religious/Deities
  'god', 'goddess', 'deity', 'temple', 'mandir',
  'krishna', 'shiva', 'ganesh', 'durga', 'lakshmi', 'hanuman',
  'ram', 'sita', 'vishnu', 'brahma', 'saraswati',
  'jesus', 'buddha', 'bhagwan', 'devi', 'prabhu',
];

/**
 * Detect best provider based on 2-model system
 * v12.0: Schnell (general) or GPT LOW (text/ads/festivals/transforms)
 */
function detectBestProvider(
  prompt: string
): { 
  provider: 'schnell' | 'gptLow'; 
  category: string; 
  reason: string;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for GPT LOW keywords
 // Check for GPT LOW keywords (word boundary matching)
for (const keyword of GPT_LOW_KEYWORDS) {
  // Use word boundary regex to avoid partial matches like "ladki" matching "ad"
  const regex = new RegExp(`\\b${keyword}\\b`, 'i');
  if (regex.test(lowerPrompt)) {
      // Determine category based on keyword type
      let category = 'general';
      let reason = `Contains '${keyword}' → GPT LOW for best quality`;
      
      if (['text', 'quote', 'typography', 'likho', 'likhna'].some(k => keyword.includes(k))) {
        category = 'text';
        reason = `Text/Typography detected → GPT LOW for accurate text rendering`;
      } else if (['card', 'greeting', 'invitation', 'poster', 'banner'].some(k => keyword.includes(k))) {
        category = 'card';
        reason = `Card/Poster detected → GPT LOW for professional design`;
      } else if (['diwali', 'holi', 'eid', 'christmas', 'festival'].some(k => keyword.includes(k))) {
        category = 'festival';
        reason = `Festival detected → GPT LOW for cultural accuracy`;
      } else if (['logo', 'brand', 'emblem'].some(k => keyword.includes(k))) {
        category = 'logo';
        reason = `Logo detected → GPT LOW for clean vector-like output`;
      } else if (['ad', 'advertisement', 'promo', 'marketing'].some(k => keyword.includes(k))) {
        category = 'advertisement';
        reason = `Advertisement detected → GPT LOW for professional quality`;
      } else if (['gta', 'anime', 'pixar', 'cartoon', 'sketch'].some(k => keyword.includes(k))) {
        category = 'transformation';
        reason = `Style transformation detected → GPT LOW for accurate style`;
      } else if (['god', 'goddess', 'deity', 'krishna', 'shiva', 'bhagwan'].some(k => keyword.includes(k))) {
        category = 'religious';
        reason = `Religious content detected → GPT LOW for respectful rendering`;
      }
      
      return { provider: 'gptLow', category, reason };
    }
  }
  
  // Default: Schnell for general images (nature, animals, people, objects)
  return {
    provider: 'schnell',
    category: 'general',
    reason: 'General image → Schnell for fast, cost-effective generation',
  };
}

// ==========================================
// IMAGE CONTROLLER CLASS
// ==========================================

export class ImageController {
  private imageService: ImageService;

  constructor() {
    this.imageService = createImageService(prisma);
    console.log('[ImageController] ✅ v12.0 Ready (2-Model System: Schnell + GPT LOW)');
  }

  // ==========================================
  // GENERATE IMAGE
  // ==========================================

  /**
   * POST /api/image/generate
   * Generate an image from prompt
   * 
   * v12.0 Smart Routing:
   * - 'auto' (default): Automatically selects Schnell or GPT LOW based on prompt
   * - 'schnell': Force Schnell (₹0.25) - general images
   * - 'gptLow': Force GPT LOW (₹1.18) - text/ads/festivals/transforms
   */
  async generateImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { prompt, provider = 'auto', aspectRatio, sessionId } = req.body as GenerateImageBody;
      
      console.log('[ImageController] 🎨 Generate request:', { provider, aspectRatio });

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

      // Validate aspect ratio if provided (v12.0: portrait/landscape only)
      const validAspectRatios = ['portrait', 'landscape', '1:1', '16:9', '9:16', '4:3', '3:4'];
      if (aspectRatio && !validAspectRatios.includes(aspectRatio)) {
        res.status(400).json({
          success: false,
          error: `Invalid aspect ratio. Supported: portrait, landscape`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate provider (v12.0: only schnell, gptLow, auto)
      const validProviders = ['schnell', 'gptLow', 'auto'];
      if (provider && !validProviders.includes(provider)) {
        res.status(400).json({
          success: false,
          error: `Invalid provider. Use: ${validProviders.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // ==========================================
      // 🙏 DEITY DETECTION - BLOCK TEXT-TO-IMAGE
      // ==========================================
      const deityCheck = await isDeityImageRequest(prompt);
      if (deityCheck.isDeity) {
        console.log(`[DEITY BLOCKED] Reason: "${deityCheck.reason}" | Prompt: "${prompt.substring(0, 50)}..."`);
        res.status(400).json({
          success: false,
          error: `Gods aren't generated. They're honored.

Millions of AI tools generate random faces and call them divine. I won't.

Because deities aren't just "characters" — they're devotion, faith, and centuries of meaning. These aren't prompts — they're prayers.

So here's my offer: bring the image that means something to you, and I'll turn it into something extraordinary.

That's not limitation — that's respect.`,
          code: 'DEITIES_BLOCKED',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get user's plan
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true },
      });
      const userPlanType = (user?.planType as PlanType) || PlanType.STARTER;

      // ==========================================
      // SMART ROUTING: Auto-detect best provider (2-model)
      // ==========================================
      let selectedProvider: 'schnell' | 'gptLow';
      let routingReason: string;
      let detectedCategory: string = 'general';

      if (provider === 'auto' || !provider) {
        const routing = detectBestProvider(prompt);
        selectedProvider = routing.provider;
        routingReason = routing.reason;
        detectedCategory = routing.category;
      } else {
        selectedProvider = provider as 'schnell' | 'gptLow';
        routingReason = `User selected ${selectedProvider}`;
      }

      console.log(`[ImageController] 🎯 Provider: ${selectedProvider} - ${routingReason}`);

      // Map to ImageProvider enum (v12.0: 2-model)
      const providerEnumMap: Record<string, ImageProvider> = {
        'schnell': ImageProvider.SCHNELL,
        'gptLow': ImageProvider.GPT_LOW,
      };
      const imageProvider = providerEnumMap[selectedProvider] || ImageProvider.SCHNELL;

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

      // Get cost for response
      const cost = IMAGE_COST_BY_PROVIDER[imageProvider];

      // Success response
      res.status(200).json({
        ...result,
        routing: {
          provider: selectedProvider,
          category: detectedCategory,
          reason: routingReason,
          cost: `₹${cost}`,
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
   * Uses Mistral for intelligent prompt merging
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
      const validAspectRatios = ['portrait', 'landscape', '1:1', '16:9', '9:16', '4:3', '3:4'];
      if (aspectRatio && !validAspectRatios.includes(aspectRatio)) {
        res.status(400).json({
          success: false,
          error: `Invalid aspect ratio. Supported: portrait, landscape`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create merged prompt
      const mergedPrompt = `${originalPrompt}. Changes: ${editInstruction}`;

      // Get user's plan
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true },
      });
      const userPlanType = (user?.planType as PlanType) || PlanType.STARTER;

      // Smart routing for edited content (v12.0: 2-model)
      let selectedProvider: 'schnell' | 'gptLow';
      let routingReason: string;
      let detectedCategory: string = 'general';

      if (provider === 'auto' || !provider) {
        const routing = detectBestProvider(mergedPrompt);
        selectedProvider = routing.provider;
        routingReason = routing.reason;
        detectedCategory = routing.category;
      } else {
        selectedProvider = provider as 'schnell' | 'gptLow';
        routingReason = `User selected ${selectedProvider}`;
      }

      console.log(`[ImageController - Edit] Provider: ${selectedProvider} - ${routingReason}`);

      // Map to ImageProvider enum (v12.0: 2-model)
      const providerEnumMap: Record<string, ImageProvider> = {
        'schnell': ImageProvider.SCHNELL,
        'gptLow': ImageProvider.GPT_LOW,
      };
      const imageProvider = providerEnumMap[selectedProvider] || ImageProvider.SCHNELL;

      // Optimize merged prompt with Mistral
      const optimizationResult = await optimizePrompt(mergedPrompt, imageProvider);
      const finalPrompt = optimizationResult.optimizedPrompt;

      console.log(`[ImageController - Edit] Final prompt: "${finalPrompt.substring(0, 80)}..."`);

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

      // Get cost for response
      const cost = IMAGE_COST_BY_PROVIDER[imageProvider];

      // Success response with edit info
      res.status(200).json({
        ...result,
        routing: {
          provider: selectedProvider,
          category: detectedCategory,
          reason: routingReason,
          cost: `₹${cost}`,
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
   * Get user's image generation quota (Schnell + GPT LOW)
   * v12.0: Returns 2-model quota
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

      // v12.0: Return 2-model quota (Schnell + GPT LOW)
      res.status(200).json({
        success: true,
        data: {
          planType: quota.planType,
          region: quota.region,
          schnell: {
            limit: quota.schnellLimit,
            used: quota.schnellUsed,
            remaining: quota.schnellRemaining,
            booster: quota.boosterSchnell,
            cost: '₹0.25/image',
            bestFor: 'Nature, Animals, Scenery, General Images',
          },
          gptLow: {
            limit: quota.gptLowLimit,
            used: quota.gptLowUsed,
            remaining: quota.gptLowRemaining,
            booster: quota.boosterGptLow,
            cost: '₹1.18/image',
            bestFor: 'Text, Logos, Festivals, Ads, Cards, Transforms',
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
          optimizedPrompt: true,
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

      // v12.0: Map provider to 2-model display names
      const providerDisplayMap: Record<string, string> = {
        'schnell': 'Schnell',
        'gptLow': 'GPT LOW',
      };

      res.status(200).json({
        success: true,
        data: {
          isImageRequest: intentResult.isImageRequest,
          confidence: intentResult.confidence,
          intentType: intentResult.intentType,
          suggestedProvider: intentResult.suggestedProvider,
          suggestedProviderDisplay: providerDisplayMap[intentResult.suggestedProvider] || 'Schnell',
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

  // ==========================================
  // 🎨 GPT IMAGE EDITING FEATURES (v12.0)
  // ==========================================

  /**
   * POST /api/image/transform
   * Transform an uploaded image to a new style (img2img)
   * 
   * Examples:
   * - Photo → "Convert to GTA style"
   * - Portrait → "Make it anime"
   * - Landscape → "Add dramatic sunset"
   * 
   * Cost: ₹1.18 (GPT LOW)
   */
  async transformImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { imageUrl, prompt, aspectRatio = 'portrait' } = req.body;

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
      if (!imageUrl || typeof imageUrl !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Image URL is required. Upload an image first.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Transform instruction is required. E.g., "Convert to GTA style"',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.log(`[ImageController] 🔄 Transform Request: "${prompt.substring(0, 50)}..."`);

      // Import ImageGenerator
      const { ImageGenerator } = require('../../services/image/imageGenerator');
      const imageGenerator = ImageGenerator.getInstance();

      // Transform image
      const result = await imageGenerator.transformImage(imageUrl, prompt, aspectRatio);

      if (!result.success) {
        res.status(400).json({
          ...result,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Success response
      res.status(200).json({
        success: true,
        data: {
          imageUrl: result.imageUrl,
          provider: 'gptLow',
          generationTimeMs: result.generationTimeMs,
        },
        routing: {
          provider: 'gptLow',
          category: 'transform',
          reason: 'Image-to-Image transformation via GPT Image 1.5',
          cost: '₹1.18',
        },
        transformInfo: {
          sourceImage: imageUrl,
          instruction: prompt,
          optimizedPrompt: result.optimizedPrompt,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] Transform error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/image/merge
   * Combine multiple images into one (logo + letterhead, etc.)
   * 
   * Examples:
   * - Logo + Old Letterhead → "Create new letterhead with this logo"
   * - Photo + Background → "Place person on beach background"
   * 
   * Cost: ₹1.18 (GPT LOW)
   */
  async mergeImages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { images, prompt, aspectRatio = 'portrait' } = req.body;

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
      if (!images || !Array.isArray(images) || images.length < 2) {
        res.status(400).json({
          success: false,
          error: 'At least 2 images are required for merge.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (images.length > 4) {
        res.status(400).json({
          success: false,
          error: 'Maximum 4 images allowed for merge.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Merge instruction is required. E.g., "Create letterhead with this logo"',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.log(`[ImageController] 🔗 Merge Request: ${images.length} images - "${prompt.substring(0, 50)}..."`);

      // Import ImageGenerator
      const { ImageGenerator } = require('../../services/image/imageGenerator');
      const imageGenerator = ImageGenerator.getInstance();

      // Merge images
      const result = await imageGenerator.mergeImages(images, prompt, aspectRatio);

      if (!result.success) {
        res.status(400).json({
          ...result,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Success response
      res.status(200).json({
        success: true,
        data: {
          imageUrl: result.imageUrl,
          provider: 'gptLow',
          generationTimeMs: result.generationTimeMs,
        },
        routing: {
          provider: 'gptLow',
          category: 'merge',
          reason: `Multi-image merge (${images.length} images) via GPT Image 1.5`,
          cost: '₹1.18',
        },
        mergeInfo: {
          sourceImagesCount: images.length,
          instruction: prompt,
          optimizedPrompt: result.optimizedPrompt,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] Merge error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/image/continue-edit
   * Continue editing a previously generated image (conversational)
   * 
   * Examples:
   * - "Mountain sunset" → "Add eagle flying" → "Make eagle bigger"
   * - "Portrait" → "Add hat" → "Change background to beach"
   * 
   * Cost: ₹1.18 (GPT LOW)
   */
  async continueEdit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { previousImageUrl, prompt, aspectRatio = 'portrait' } = req.body;

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
      if (!previousImageUrl || typeof previousImageUrl !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Previous image URL is required.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Edit instruction is required. E.g., "Add eagle flying"',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.log(`[ImageController] ✏️ Continue Edit Request: "${prompt.substring(0, 50)}..."`);

      // Import ImageGenerator
      const { ImageGenerator } = require('../../services/image/imageGenerator');
      const imageGenerator = ImageGenerator.getInstance();

      // Continue editing
      const result = await imageGenerator.continueEditing(previousImageUrl, prompt, aspectRatio);

      if (!result.success) {
        res.status(400).json({
          ...result,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Success response
      res.status(200).json({
        success: true,
        data: {
          imageUrl: result.imageUrl,
          provider: 'gptLow',
          generationTimeMs: result.generationTimeMs,
        },
        routing: {
          provider: 'gptLow',
          category: 'continue-edit',
          reason: 'Conversational image editing via GPT Image 1.5',
          cost: '₹1.18',
        },
        editInfo: {
          previousImage: previousImageUrl,
          instruction: prompt,
          optimizedPrompt: result.optimizedPrompt,
        },
        isConversational: true,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[ImageController] Continue edit error:', error);
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