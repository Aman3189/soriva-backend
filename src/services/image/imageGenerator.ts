// src/services/image/imageGenerator.ts

/**
 * ==========================================
 * SORIVA IMAGE GENERATOR
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Generate images using 2-model system
 * 
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 *
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌ (replaced by GPT LOW)
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 *
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25/image - General images (scenery, nature, animals)
 *    - GPT LOW (OpenAI gpt-image-1.5): ₹1.18/image - Text, Ads, Festivals, Transforms
 *
 * ✅ GPT Image 1.5 LOW Pricing:
 *    - Portrait (1024×1536): $0.013 = ₹1.18
 *    - Landscape (1536×1024): $0.013 = ₹1.18
 *
 * Last Updated: February 22, 2026
 */

import {
  ImageGenerationResult,
  ImageProvider,
  IMAGE_COST_BY_PROVIDER,
  GPT_IMAGE_CONFIG,
  GPT_LOW_ROUTING_KEYWORDS,
  SCHNELL_ROUTING_KEYWORDS,
} from '../../types/image.types';

// ==========================================
// API TYPES
// ==========================================

// Fal.ai API Types (Schnell)
interface FalResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings?: {
    inference: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
}

// OpenAI GPT Image API Types
interface GptImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

// Image Routing Config Type (v12.0 - 2 Models)
type ImageModelType = 'schnell' | 'gptLow';

interface ImageRoutingConfig {
  general: ImageModelType;      // Scenery, nature, animals → Schnell
  text: ImageModelType;         // Text in images → GPT LOW
  festival: ImageModelType;     // Festivals → GPT LOW
  advertisement: ImageModelType; // Ads → GPT LOW
  transformation: ImageModelType; // Style transforms → GPT LOW
  document: ImageModelType;     // Document editing → GPT LOW
  logo: ImageModelType;         // Logos → GPT LOW
  card: ImageModelType;         // Cards → GPT LOW
  poster: ImageModelType;       // Posters/Banners → GPT LOW
  deities: 'blocked' | ImageModelType;
  default: ImageModelType;
}

// Routing Result Type (v12.0)
interface RoutingResult {
  provider: ImageProvider;
  category: string;
  blocked: boolean;
  modelType: ImageModelType;
}

// ==========================================
// IMAGE GENERATOR CLASS (v12.0)
// ==========================================

export class ImageGenerator {
  private static instance: ImageGenerator;
  
  // API Keys
  private openaiApiKey: string;
  private falApiKey: string;
  
  // Base URLs
  private falBaseUrl = 'https://fal.run/fal-ai/flux/schnell';
  private openaiImageUrl = 'https://api.openai.com/v1/images/generations';

  // ==========================================
  // KEYWORD LISTS FOR ROUTING (v12.0)
  // ==========================================

  // GPT LOW Keywords (Text, Ads, Festivals, Transforms, etc.)
  private gptLowKeywords = {
    ...GPT_LOW_ROUTING_KEYWORDS
  };

  // Schnell Keywords (Nature, Animals, Objects, People)
  private schnellKeywords = {
    ...SCHNELL_ROUTING_KEYWORDS
  };

  // Deities Keywords (For blocking/special handling)
  private deitiesKeywords = [
    // Hindu deities
    'god', 'goddess', 'deity', 'divine', 'lord', 'bhagwan', 'devi', 'devta',
    'krishna', 'shiva', 'vishnu', 'brahma', 'ganesh', 'ganesha', 'hanuman',
    'durga', 'lakshmi', 'saraswati', 'parvati', 'kali', 'ram', 'rama', 'sita',
    'radha', 'shri ram', 'jai shri ram', 'har har mahadev', 'jai mata di',
    'om namah shivaya', 'jai hanuman', 'jai ganesh', 'mahadev', 'bholenath',
    'shankar', 'narayan', 'hari', 'govind', 'gopal', 'murlidhar', 'balaji',
    // Other religions
    'jesus', 'christ', 'mary', 'allah', 'prophet', 'buddha', 'mahavir',
    'guru nanak', 'waheguru', 'sikh guru', 'gurudwara',
    // Religious places/items
    'temple', 'mandir', 'church', 'mosque', 'masjid', 'gurudwara',
    'murti', 'idol', 'statue of god', 'puja', 'aarti', 'religious'
  ];

  private constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.falApiKey = process.env.FAL_KEY || '';
    
    if (!this.openaiApiKey) {
      console.warn('[ImageGenerator] ⚠️ OPENAI_API_KEY not set!');
    }
    if (!this.falApiKey) {
      console.warn('[ImageGenerator] ⚠️ FAL_KEY not set!');
    }
  }

  public static getInstance(): ImageGenerator {
    if (!ImageGenerator.instance) {
      ImageGenerator.instance = new ImageGenerator();
    }
    return ImageGenerator.instance;
  }

  // ==========================================
  // IMAGE ROUTING LOGIC (v12.0)
  // ==========================================

  /**
   * Detect image category from prompt (v12.0 - Simplified)
   * Returns category that determines which provider to use
   */
  public detectImageCategory(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // 1. Check for DEITIES FIRST (highest priority - cultural sensitivity)
    for (const keyword of this.deitiesKeywords) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'deities';
      }
    }

    // 2. Check GPT LOW categories (in order of priority)
    
    // Text in images
    for (const keyword of this.gptLowKeywords.text) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'text';
      }
    }

    // Style Transformations (GTA, Anime, Pixar, etc.)
    for (const keyword of this.gptLowKeywords.transformations) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'transformation';
      }
    }

    // Festivals
    for (const keyword of this.gptLowKeywords.festivals) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'festival';
      }
    }

    // Advertisements
    for (const keyword of this.gptLowKeywords.advertisements) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'advertisement';
      }
    }

    // Posters & Banners
    for (const keyword of this.gptLowKeywords.posters) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'poster';
      }
    }

    // Cards
    for (const keyword of this.gptLowKeywords.cards) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'card';
      }
    }

    // Logos
    for (const keyword of this.gptLowKeywords.logos) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'logo';
      }
    }

    // Documents
    for (const keyword of this.gptLowKeywords.documents) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'document';
      }
    }

    // Multi-image work
    for (const keyword of this.gptLowKeywords.multiImage) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'multiImage';
      }
    }

    // Religious/Cultural
    for (const keyword of this.gptLowKeywords.religious) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'religious';
      }
    }

    // Cultural
    for (const keyword of this.gptLowKeywords.cultural) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return 'cultural';
      }
    }

    // 3. Default: General (Schnell)
    // Nature, Animals, Objects, People without special requirements
    return 'general';
  }

  /**
   * Get provider based on category (v12.0 - Simplified)
   */
  public getProviderFromCategory(category: string): ImageProvider {
    // GPT LOW categories
    const gptLowCategories = [
      'text', 'transformation', 'festival', 'advertisement', 
      'poster', 'card', 'logo', 'document', 'multiImage',
      'religious', 'cultural', 'deities'
    ];

    if (gptLowCategories.includes(category)) {
      return ImageProvider.GPT_LOW;
    }

    // Default: Schnell for general images
    return ImageProvider.SCHNELL;
  }

  /**
   * Get provider based on plan's imageRouting config (v12.0)
   */
  public getProviderFromRouting(
    prompt: string,
    imageRouting: ImageRoutingConfig
  ): RoutingResult {
    const category = this.detectImageCategory(prompt);

    // Check for deities blocking
    if (category === 'deities' && imageRouting.deities === 'blocked') {
      return {
        provider: ImageProvider.SCHNELL,
        category,
        blocked: true,
        modelType: 'schnell',
      };
    }

    // Get model from routing config based on category
    let modelType: ImageModelType;

    switch (category) {
      case 'deities':
        modelType = imageRouting.deities === 'blocked' ? imageRouting.default : imageRouting.deities;
        break;
      case 'text':
        modelType = imageRouting.text || 'gptLow';
        break;
      case 'festival':
        modelType = imageRouting.festival || 'gptLow';
        break;
      case 'advertisement':
        modelType = imageRouting.advertisement || 'gptLow';
        break;
      case 'transformation':
        modelType = imageRouting.transformation || 'gptLow';
        break;
      case 'document':
        modelType = imageRouting.document || 'gptLow';
        break;
      case 'logo':
        modelType = imageRouting.logo || 'gptLow';
        break;
      case 'card':
        modelType = imageRouting.card || 'gptLow';
        break;
      case 'poster':
        modelType = imageRouting.poster || 'gptLow';
        break;
      case 'general':
      default:
        modelType = imageRouting.general || imageRouting.default || 'schnell';
        break;
    }

    // Map modelType to ImageProvider
    const provider = modelType === 'gptLow' ? ImageProvider.GPT_LOW : ImageProvider.SCHNELL;

    return {
      provider,
      category,
      blocked: false,
      modelType,
    };
  }

  /**
   * Generate with automatic routing based on plan config
   */
  public async generateWithRouting(
    prompt: string,
    imageRouting: ImageRoutingConfig,
    aspectRatio: string = '1:1'
  ): Promise<ImageGenerationResult> {
    // Get provider from routing
    const routing = this.getProviderFromRouting(prompt, imageRouting);

    // Block deities if configured
    if (routing.blocked) {
      console.log('[ImageGenerator] 🙏 Deities blocked - Respectful message shown');
      return this.createErrorResult(
        prompt,
        ImageProvider.SCHNELL,
        `Gods aren't generated. They're honored.

Millions of AI tools generate random faces and call them divine. I won't.

Because deities aren't just "characters" — they're devotion, faith, and centuries of meaning. These aren't prompts — they're prayers.

So here's my offer: bring the image that means something to you, and I'll turn it into something extraordinary.

That's not limitation — that's respect.`,
        'DEITIES_BLOCKED'
      );
    }

    console.log(`[ImageGenerator] 🎯 Auto-routed: "${routing.category}" → ${routing.provider}`);

    // Generate with selected provider
    return this.generate(prompt, routing.provider, aspectRatio);
  }

  /**
   * Smart generate - automatically detects category and routes
   */
  public async smartGenerate(
    prompt: string,
    aspectRatio: string = '1:1'
  ): Promise<ImageGenerationResult> {
    const category = this.detectImageCategory(prompt);
    const provider = this.getProviderFromCategory(category);
    
    console.log(`[ImageGenerator] 🧠 Smart routing: "${category}" → ${provider}`);
    
    return this.generate(prompt, provider, aspectRatio);
  }

  // ==========================================
  // MAIN GENERATION METHOD (v12.0)
  // ==========================================

  /**
   * Generate image using selected provider (v12.0 - 2 Models)
   * Routes to Schnell or GPT LOW
   */
  public async generate(
    prompt: string,
    provider: ImageProvider = ImageProvider.SCHNELL,
    aspectRatio: string = '1:1'
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`[ImageGenerator] 🎨 Generating with ${provider}...`);
      console.log(`[ImageGenerator] 📝 Prompt: ${prompt.substring(0, 100)}...`);

      // Route to appropriate provider
      switch (provider) {
        case ImageProvider.GPT_LOW:
          return await this.generateWithGptLow(prompt, aspectRatio, startTime);
        case ImageProvider.SCHNELL:
        default:
          return await this.generateWithSchnell(prompt, aspectRatio, startTime);
      }

    } catch (error) {
      console.error('[ImageGenerator] ❌ Error:', error);

      return this.createErrorResult(
        prompt,
        provider,
        error instanceof Error ? error.message : 'Unknown error',
        'API_ERROR'
      );
    }
  }

  // ==========================================
  // SCHNELL (Fal.ai) - ₹0.25/image
  // ==========================================

  /**
   * Generate image using FLUX Schnell via Fal.ai
   * Best for: General images (nature, animals, scenery, objects, people)
   * Cost: ₹0.25/image
   */
  private async generateWithSchnell(
    prompt: string,
    aspectRatio: string,
    startTime: number
  ): Promise<ImageGenerationResult> {
    const provider = ImageProvider.SCHNELL;

    // Validate API key
    if (!this.falApiKey) {
      return this.createErrorResult(
        prompt,
        provider,
        'FAL_KEY not configured',
        'CONFIG_ERROR'
      );
    }

    // Get dimensions from aspect ratio
    const { width, height } = this.getDimensions(aspectRatio);
    
    console.log(`[ImageGenerator] ⚡ Schnell - Size: ${width}x${height}`);

    try {
      // Fal.ai is synchronous (faster!)
      const response = await fetch(this.falBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.falApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image_size: { width, height },
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
          output_format: 'jpeg',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ImageGenerator] Fal.ai Error:', response.status, errorText);
        return this.createErrorResult(
          prompt,
          provider,
          `Fal.ai API error: ${response.status}`,
          'API_ERROR'
        );
      }

      const result = await response.json() as FalResponse;
      const generationTime = Date.now() - startTime;

      if (result.images && result.images.length > 0 && result.images[0].url) {
        console.log(`[ImageGenerator] ✅ Schnell completed in ${generationTime}ms`);
        
        return {
          success: true,
          imageUrl: result.images[0].url,
          provider,
          prompt,
          optimizedPrompt: prompt,
          generationTimeMs: generationTime,
          costINR: IMAGE_COST_BY_PROVIDER[provider],
        };
      }

      // Check for NSFW
      if (result.has_nsfw_concepts && result.has_nsfw_concepts[0]) {
        return this.createErrorResult(
          prompt,
          provider,
          'Content was flagged as inappropriate',
          'MODERATION_ERROR'
        );
      }

      return this.createErrorResult(
        prompt,
        provider,
        'Schnell generation failed - no image returned',
        'GENERATION_ERROR'
      );

    } catch (error) {
      console.error('[ImageGenerator] Schnell error:', error);
      return this.createErrorResult(
        prompt,
        provider,
        error instanceof Error ? error.message : 'Schnell API error',
        'API_ERROR'
      );
    }
  }

  // ==========================================
  // GPT LOW (OpenAI gpt-image-1.5) - ₹1.18/image
  // ==========================================

  /**
   * Generate image using OpenAI GPT Image 1.5 with quality: low
   * Best for: Text in images, Ads, Festivals, Posters, Style Transforms, Documents
   * Cost: ₹1.18/image (Portrait/Landscape)
   */
  private async generateWithGptLow(
    prompt: string,
    aspectRatio: string,
    startTime: number
  ): Promise<ImageGenerationResult> {
    const provider = ImageProvider.GPT_LOW;

    // Validate API key
    if (!this.openaiApiKey) {
      return this.createErrorResult(
        prompt,
        provider,
        'OPENAI_API_KEY not configured',
        'CONFIG_ERROR'
      );
    }

    // Get GPT Image size from aspect ratio
    const size = this.getGptImageSize(aspectRatio);
    
    console.log(`[ImageGenerator] 🎨 GPT LOW - Size: ${size}, Quality: ${GPT_IMAGE_CONFIG.quality}`);

    try {
      const response = await fetch(this.openaiImageUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GPT_IMAGE_CONFIG.model,        // 'gpt-image-1.5'
          prompt,
          n: 1,
          size,                                  // '1024x1536' or '1536x1024'
          quality: GPT_IMAGE_CONFIG.quality,    // 'low'
          response_format: GPT_IMAGE_CONFIG.responseFormat,  // 'url'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData as any)?.error?.message || `HTTP ${response.status}`;
        console.error('[ImageGenerator] OpenAI Error:', response.status, errorMessage);
        return this.createErrorResult(
          prompt,
          provider,
          `OpenAI API error: ${errorMessage}`,
          'API_ERROR'
        );
      }

      const result = await response.json() as GptImageResponse;
      const generationTime = Date.now() - startTime;

      if (result.data && result.data.length > 0 && result.data[0].url) {
        console.log(`[ImageGenerator] ✅ GPT LOW completed in ${generationTime}ms`);
        
        return {
          success: true,
          imageUrl: result.data[0].url,
          provider,
          prompt,
          optimizedPrompt: result.data[0].revised_prompt || prompt,
          generationTimeMs: generationTime,
          costINR: IMAGE_COST_BY_PROVIDER[provider],
        };
      }

      return this.createErrorResult(
        prompt,
        provider,
        'GPT LOW generation failed - no image returned',
        'GENERATION_ERROR'
      );

    } catch (error) {
      console.error('[ImageGenerator] GPT LOW error:', error);
      return this.createErrorResult(
        prompt,
        provider,
        error instanceof Error ? error.message : 'OpenAI API error',
        'API_ERROR'
      );
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Get dimensions from aspect ratio (for Schnell/Fal.ai)
   */
  private getDimensions(aspectRatio: string): { width: number; height: number } {
    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1360, height: 768 },
      '9:16': { width: 768, height: 1360 },
      '4:3': { width: 1184, height: 888 },
      '3:4': { width: 888, height: 1184 },
      '3:2': { width: 1248, height: 832 },
      '2:3': { width: 832, height: 1248 },
    };

    return dimensions[aspectRatio] || dimensions['1:1'];
  }

  /**
   * Get GPT Image size from aspect ratio (v12.0)
   * GPT Image 1.5 only supports: 1024x1024, 1024x1536, 1536x1024
   */
  private getGptImageSize(aspectRatio: string): '1024x1024' | '1024x1536' | '1536x1024' {
    const sizeMap: Record<string, '1024x1024' | '1024x1536' | '1536x1024'> = {
      '1:1': '1024x1536',     // Use portrait instead of square (better quality, same cost)
      '16:9': '1536x1024',    // Landscape
      '9:16': '1024x1536',    // Portrait
      '4:3': '1536x1024',     // Landscape
      '3:4': '1024x1536',     // Portrait
      '3:2': '1536x1024',     // Landscape
      '2:3': '1024x1536',     // Portrait
    };

    return sizeMap[aspectRatio] || '1024x1536';  // Default to portrait
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create error result
   */
  private createErrorResult(
    prompt: string,
    provider: ImageProvider,
    error: string,
    errorCode: string
  ): ImageGenerationResult {
    return {
      success: false,
      provider,
      prompt,
      optimizedPrompt: prompt,
      generationTimeMs: 0,
      costINR: 0,
      error,
      errorCode,
    };
  }

  /**
   * Check if APIs are configured (v12.0)
   */
  public isConfigured(): { schnell: boolean; gptLow: boolean } {
    return {
      schnell: !!this.falApiKey,
      gptLow: !!this.openaiApiKey,
    };
  }

  /**
   * Get supported aspect ratios
   */
  public getSupportedAspectRatios(): string[] {
    return ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'];
  }

  // ==========================================
  // 🎨 GPT IMAGE EDITING FEATURES (v12.0)
  // ==========================================

  /**
   * 1️⃣ IMAGE-TO-IMAGE TRANSFORMATION
   * Transform an uploaded image to a new style
   * 
   * Examples:
   * - Photo → "Convert to GTA style"
   * - Portrait → "Make it anime"
   * - Landscape → "Add dramatic sunset"
   * 
   * @param sourceImageUrl - URL or base64 of source image
   * @param editPrompt - Transformation instruction
   * @param aspectRatio - Output aspect ratio
   */
  public async transformImage(
    sourceImageUrl: string,
    editPrompt: string,
    aspectRatio: string = 'portrait'
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const provider = ImageProvider.GPT_LOW;

    console.log(`[ImageGenerator] 🔄 Transform Image - Prompt: "${editPrompt.substring(0, 50)}..."`);

    if (!this.openaiApiKey) {
      return this.createErrorResult(editPrompt, provider, 'OPENAI_API_KEY not configured', 'CONFIG_ERROR');
    }

    try {
      // Convert image to base64 if URL
      const imageBase64 = await this.imageToBase64(sourceImageUrl);
      
      // Build prompt with transformation instruction
      const fullPrompt = `Transform this image: ${editPrompt}. Maintain the core subject but apply the requested style/changes.`;

      const response = await fetch(this.openaiImageUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GPT_IMAGE_CONFIG.model,
          prompt: fullPrompt,
          n: 1,
          size: this.getGptImageSize(aspectRatio),
          quality: GPT_IMAGE_CONFIG.quality,
          response_format: GPT_IMAGE_CONFIG.responseFormat,
          image: imageBase64, // Source image for transformation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData as any)?.error?.message || `HTTP ${response.status}`;
        return this.createErrorResult(editPrompt, provider, `Transform failed: ${errorMessage}`, 'API_ERROR');
      }

      const result = await response.json() as GptImageResponse;
      const generationTime = Date.now() - startTime;

      if (result.data?.[0]?.url) {
        console.log(`[ImageGenerator] ✅ Transform completed in ${generationTime}ms`);
        return {
          success: true,
          imageUrl: result.data[0].url,
          provider,
          prompt: editPrompt,
          optimizedPrompt: result.data[0].revised_prompt || fullPrompt,
          generationTimeMs: generationTime,
          costINR: IMAGE_COST_BY_PROVIDER[provider],
        };
      }

      return this.createErrorResult(editPrompt, provider, 'Transform failed - no image returned', 'GENERATION_ERROR');

    } catch (error) {
      console.error('[ImageGenerator] Transform error:', error);
      return this.createErrorResult(
        editPrompt,
        provider,
        error instanceof Error ? error.message : 'Transform failed',
        'API_ERROR'
      );
    }
  }

  /**
   * 2️⃣ MULTI-IMAGE MERGE
   * Combine multiple images into one (logo + letterhead, etc.)
   * 
   * Examples:
   * - Logo + Old Letterhead → "Create new letterhead with this logo"
   * - Photo + Background → "Place person on beach background"
   * - Multiple products → "Create product collage"
   * 
   * @param images - Array of image URLs/base64 (max 4)
   * @param mergePrompt - How to combine them
   * @param aspectRatio - Output aspect ratio
   */
  public async mergeImages(
    images: string[],
    mergePrompt: string,
    aspectRatio: string = 'portrait'
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const provider = ImageProvider.GPT_LOW;

    console.log(`[ImageGenerator] 🔗 Merge ${images.length} Images - Prompt: "${mergePrompt.substring(0, 50)}..."`);

    if (!this.openaiApiKey) {
      return this.createErrorResult(mergePrompt, provider, 'OPENAI_API_KEY not configured', 'CONFIG_ERROR');
    }

    if (images.length < 2) {
      return this.createErrorResult(mergePrompt, provider, 'At least 2 images required for merge', 'VALIDATION_ERROR');
    }

    if (images.length > 4) {
      return this.createErrorResult(mergePrompt, provider, 'Maximum 4 images allowed for merge', 'VALIDATION_ERROR');
    }

    try {
      // Convert all images to base64
      const imagesBase64 = await Promise.all(
        images.map(img => this.imageToBase64(img))
      );

      // Build descriptive prompt for merging
      const fullPrompt = `Combine these ${images.length} images: ${mergePrompt}. Create a cohesive, professional output that incorporates elements from all provided images.`;

      const response = await fetch(this.openaiImageUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GPT_IMAGE_CONFIG.model,
          prompt: fullPrompt,
          n: 1,
          size: this.getGptImageSize(aspectRatio),
          quality: GPT_IMAGE_CONFIG.quality,
          response_format: GPT_IMAGE_CONFIG.responseFormat,
          image: imagesBase64, // Multiple images for merging
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData as any)?.error?.message || `HTTP ${response.status}`;
        return this.createErrorResult(mergePrompt, provider, `Merge failed: ${errorMessage}`, 'API_ERROR');
      }

      const result = await response.json() as GptImageResponse;
      const generationTime = Date.now() - startTime;

      if (result.data?.[0]?.url) {
        console.log(`[ImageGenerator] ✅ Merge completed in ${generationTime}ms`);
        return {
          success: true,
          imageUrl: result.data[0].url,
          provider,
          prompt: mergePrompt,
          optimizedPrompt: result.data[0].revised_prompt || fullPrompt,
          generationTimeMs: generationTime,
          costINR: IMAGE_COST_BY_PROVIDER[provider],
        };
      }

      return this.createErrorResult(mergePrompt, provider, 'Merge failed - no image returned', 'GENERATION_ERROR');

    } catch (error) {
      console.error('[ImageGenerator] Merge error:', error);
      return this.createErrorResult(
        mergePrompt,
        provider,
        error instanceof Error ? error.message : 'Merge failed',
        'API_ERROR'
      );
    }
  }

  /**
   * 3️⃣ CONVERSATIONAL IMAGE EDITING
   * Continue editing a previously generated image
   * 
   * Examples:
   * - "Mountain sunset" → "Add eagle flying" → "Make eagle bigger"
   * - "Portrait" → "Add hat" → "Change background to beach"
   * 
   * @param previousImageUrl - URL of previously generated image
   * @param editPrompt - New edit instruction
   * @param aspectRatio - Output aspect ratio (maintains previous if not specified)
   */
  public async continueEditing(
    previousImageUrl: string,
    editPrompt: string,
    aspectRatio: string = 'portrait'
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const provider = ImageProvider.GPT_LOW;

    console.log(`[ImageGenerator] ✏️ Continue Editing - Prompt: "${editPrompt.substring(0, 50)}..."`);

    if (!this.openaiApiKey) {
      return this.createErrorResult(editPrompt, provider, 'OPENAI_API_KEY not configured', 'CONFIG_ERROR');
    }

    try {
      // Convert previous image to base64
      const imageBase64 = await this.imageToBase64(previousImageUrl);
      
      // Build edit prompt that preserves context
      const fullPrompt = `Edit this image: ${editPrompt}. Keep all existing elements unless specifically asked to change them.`;

      const response = await fetch(this.openaiImageUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GPT_IMAGE_CONFIG.model,
          prompt: fullPrompt,
          n: 1,
          size: this.getGptImageSize(aspectRatio),
          quality: GPT_IMAGE_CONFIG.quality,
          response_format: GPT_IMAGE_CONFIG.responseFormat,
          image: imageBase64, // Previous image to edit
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData as any)?.error?.message || `HTTP ${response.status}`;
        return this.createErrorResult(editPrompt, provider, `Edit failed: ${errorMessage}`, 'API_ERROR');
      }

      const result = await response.json() as GptImageResponse;
      const generationTime = Date.now() - startTime;

      if (result.data?.[0]?.url) {
        console.log(`[ImageGenerator] ✅ Edit completed in ${generationTime}ms`);
        return {
          success: true,
          imageUrl: result.data[0].url,
          provider,
          prompt: editPrompt,
          optimizedPrompt: result.data[0].revised_prompt || fullPrompt,
          generationTimeMs: generationTime,
          costINR: IMAGE_COST_BY_PROVIDER[provider],
        };
      }

      return this.createErrorResult(editPrompt, provider, 'Edit failed - no image returned', 'GENERATION_ERROR');

    } catch (error) {
      console.error('[ImageGenerator] Continue editing error:', error);
      return this.createErrorResult(
        editPrompt,
        provider,
        error instanceof Error ? error.message : 'Edit failed',
        'API_ERROR'
      );
    }
  }

  // ==========================================
  // 🔧 HELPER: Image to Base64 Converter
  // ==========================================

  /**
   * Convert image URL or existing base64 to proper base64 format
   * Handles: URLs, data URLs, raw base64
   */
  private async imageToBase64(imageSource: string): Promise<string> {
    // Already base64 data URL
    if (imageSource.startsWith('data:image')) {
      return imageSource;
    }

    // Raw base64 string (add data URL prefix)
    if (!imageSource.startsWith('http')) {
      return `data:image/jpeg;base64,${imageSource}`;
    }

    // URL - fetch and convert
    try {
      const response = await fetch(imageSource);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error('[ImageGenerator] Failed to convert image to base64:', error);
      throw new Error('Failed to process source image');
    }
  }
}

// ==========================================
// EXPORT SINGLETON & HELPERS
// ==========================================

export const imageGenerator = ImageGenerator.getInstance();

/**
 * Generate image with manual provider selection
 */
export async function generateImage(
  prompt: string,
  provider?: ImageProvider,
  aspectRatio?: string
): Promise<ImageGenerationResult> {
  return imageGenerator.generate(prompt, provider, aspectRatio);
}

/**
 * Generate image with automatic routing based on plan config
 * This is the RECOMMENDED method for production use
 */
export async function generateImageWithRouting(
  prompt: string,
  imageRouting: {
    general: 'schnell' | 'gptLow';
    text: 'schnell' | 'gptLow';
    festival: 'schnell' | 'gptLow';
    advertisement: 'schnell' | 'gptLow';
    transformation: 'schnell' | 'gptLow';
    document: 'schnell' | 'gptLow';
    logo: 'schnell' | 'gptLow';
    card: 'schnell' | 'gptLow';
    poster: 'schnell' | 'gptLow';
    deities: 'blocked' | 'schnell' | 'gptLow';
    default: 'schnell' | 'gptLow';
  },
  aspectRatio?: string
): Promise<ImageGenerationResult> {
  return imageGenerator.generateWithRouting(prompt, imageRouting, aspectRatio);
}

/**
 * Smart generate - automatically detects category and routes
 * Use this for simple generation without custom routing config
 */
export async function smartGenerateImage(
  prompt: string,
  aspectRatio?: string
): Promise<ImageGenerationResult> {
  return imageGenerator.smartGenerate(prompt, aspectRatio);
}

/**
 * Detect image category from prompt (for testing/debugging)
 */
export function detectCategory(prompt: string): string {
  return imageGenerator.detectImageCategory(prompt);
}