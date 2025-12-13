// src/modules/studio/services/studio.service.ts
// ============================================================================
// SORIVA STUDIO v2.0 - December 2025
// ============================================================================
// Credit-based system with multi-API routing
// APIs: Ideogram, Banana PRO, Hedra, Kling (Coming Soon)
// ============================================================================

import { StudioFeatureType, GenerationStatus } from '@prisma/client';
import { prisma } from '@/core/services/prisma.service';
import {
  StudioApiProvider,
  FeatureCategory,
  IdeogramStyle,
  StudioGenerationRequest,
  StudioGenerationResponse,
  CreditsBalance,
  FeatureConfig,
  STUDIO_CREDITS,
  API_COSTS,
  PLAN_STUDIO_CREDITS,
  BOOSTER_CONFIGS,
  FEATURE_CONFIGS,
  IDEOGRAM_FEATURES,
  BANANA_PRO_FEATURES,
  TALKING_PHOTO_FEATURES,
  VIDEO_FEATURES,
  AVAILABLE_FEATURES,
  ASPECT_RATIO_OPTIONS,
  getFeatureConfig,
  getCreditsRequired,
  getApiProvider,
  isFeatureAvailable,
  requiresImage,
  detectIdeogramStyle,
} from './types/studio.types';


// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY || '';
const BANANA_PRO_API_KEY = process.env.BANANA_PRO_API_KEY || '';
const HEDRA_API_KEY = process.env.HEDRA_API_KEY || '';
const KLING_API_KEY = process.env.KLING_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// ============================================================================
// API ENDPOINTS
// ============================================================================

const API_ENDPOINTS = {
  IDEOGRAM: 'https://api.ideogram.ai/generate',
  BANANA_PRO: 'https://api.banana.dev/v1',
  HEDRA: 'https://api.hedra.com/v1',
  KLING: 'https://api.kling.ai/v1',
} as const;

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface ApiResponse {
  success: boolean;
  outputUrl?: string;
  error?: string;
  processingTime?: number;
}

interface IdeogramRequest {
  prompt: string;
  style?: IdeogramStyle;
  aspectRatio?: keyof typeof ASPECT_RATIO_OPTIONS;
  negativePrompt?: string;
}

interface BananaProRequest {
  featureType: StudioFeatureType;
  inputImageUrl: string;
  prompt?: string;
  options?: Record<string, unknown>;
}

interface HedraRequest {
  imageUrl: string;
  text: string;
  voiceStyle: 'male' | 'female' | 'child';
  duration: 5 | 10;
}

interface BabyPredictionRequest {
  momImageUrl: string;
  dadImageUrl: string;
  babyGender?: 'boy' | 'girl' | 'random';
}

interface IdeogramApiResponse {
  data?: Array<{ url: string }>;
  message?: string;
}

interface BananaProApiResponse {
  output_url?: string;
  result_url?: string;
  message?: string;
}

interface HedraCreateResponse {
  job_id: string;
  message?: string;
}

interface HedraStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
}

interface AnthropicResponse {
  content?: Array<{ text: string }>;
}

// ============================================================================
// STUDIO SERVICE CLASS
// ============================================================================

export class StudioService {
  // ==========================================================================
  // CREDIT MANAGEMENT
  // ==========================================================================

  async getCreditsBalance(userId: string): Promise<CreditsBalance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        studioCreditsMonthly: true,
        studioCreditsBooster: true,
        studioCreditsCarryForward: true,
        studioCreditsUsed: true,
        lastStudioReset: true,
      },
    });

    if (!user) throw new Error('User not found');

    await this.checkAndResetCredits(userId);

    const total = user.studioCreditsMonthly + user.studioCreditsBooster + user.studioCreditsCarryForward;
    const remaining = total - user.studioCreditsUsed;

    return {
      total,
      used: user.studioCreditsUsed,
      remaining: Math.max(0, remaining),
      monthlyCredits: user.studioCreditsMonthly,
      boosterCredits: user.studioCreditsBooster,
      carryForward: user.studioCreditsCarryForward,
    };
  }

  async hasEnoughCredits(userId: string, featureType: StudioFeatureType): Promise<boolean> {
    const balance = await this.getCreditsBalance(userId);
    const required = getCreditsRequired(featureType);
    return balance.remaining >= required;
  }

  private async deductCredits(userId: string, amount: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        studioCreditsUsed: { increment: amount },
      },
    });
  }

  private async checkAndResetCredits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        lastStudioReset: true,
        studioCreditsUsed: true,
        studioCreditsMonthly: true,
        studioCreditsBooster: true,
      },
    });

    if (!user) return;

    const now = new Date();
    const lastReset = new Date(user.lastStudioReset);
    const nextReset = new Date(lastReset);
    nextReset.setMonth(nextReset.getMonth() + 1);

    if (now >= nextReset) {
      const unusedMonthly = user.studioCreditsMonthly - user.studioCreditsUsed;
      const maxCarryForward = Math.floor(user.studioCreditsMonthly * 0.5);
      const carryForward = Math.min(Math.max(0, unusedMonthly), maxCarryForward);
      const planCredits = PLAN_STUDIO_CREDITS[user.planType as keyof typeof PLAN_STUDIO_CREDITS] || 0;

      await prisma.user.update({
        where: { id: userId },
        data: {
          studioCreditsMonthly: planCredits,
          studioCreditsCarryForward: carryForward,
          studioCreditsUsed: 0,
          lastStudioReset: now,
        },
      });
    }
  }

  async addBoosterCredits(
    userId: string,
    boosterType: 'LITE' | 'PRO' | 'MAX'
  ): Promise<{ credits: number; newBalance: number }> {
    const booster = BOOSTER_CONFIGS[boosterType];
    if (!booster) throw new Error('Invalid booster type');

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        studioCreditsBooster: { increment: booster.credits },
      },
      select: {
        studioCreditsMonthly: true,
        studioCreditsBooster: true,
        studioCreditsCarryForward: true,
        studioCreditsUsed: true,
      },
    });

    const newBalance =
      user.studioCreditsMonthly +
      user.studioCreditsBooster +
      user.studioCreditsCarryForward -
      user.studioCreditsUsed;

    return { credits: booster.credits, newBalance };
  }

  // ==========================================================================
  // MAIN GENERATION METHOD
  // ==========================================================================

  async generate(userId: string, request: StudioGenerationRequest): Promise<StudioGenerationResponse> {
    const { featureType, prompt, inputImageUrl, options } = request;

    // 1. Validate feature availability
    if (!isFeatureAvailable(featureType)) {
      throw new Error('This feature is coming soon. Stay tuned!');
    }

    // 2. Check feature config
    const config = getFeatureConfig(featureType);
    if (!config) {
      throw new Error('Invalid feature type');
    }

    // 3. Check if image required but not provided
    if (requiresImage(featureType) && !inputImageUrl) {
      throw new Error('This feature requires an input image');
    }

    // 4. Check credits
    const hasCredits = await this.hasEnoughCredits(userId, featureType);
    if (!hasCredits) {
      const balance = await this.getCreditsBalance(userId);
      throw new Error(
        `Not enough credits. Required: ${config.credits}, Available: ${balance.remaining}. Buy a booster to continue!`
      );
    }

    // 5. Create generation record
    const generation = await prisma.studioGeneration.create({
      data: {
        userId,
        featureType,
        featureName: config.name,
        userPrompt: prompt,
        parameters: {
          inputImageUrl,
          options,
          style: options?.style,
        },
        creditsUsed: config.credits,
        generationCredits: config.credits,  // ADD THIS
        previewCredits: 0,                  // ADD THIS IF NEEDED
        apiCost: config.apiCost,      
        apiProvider: config.apiProvider,
        featureCategory: config.category,
        inputImageUrl,
        status: 'PROCESSING',
        outputType: config.category === 'video' || config.category === 'talking_photo' ? 'video' : 'image',
      },
    });

    try {
      // 6. Route to correct API
      let result: ApiResponse;

      switch (config.apiProvider) {
        case 'ideogram':
          result = await this.callIdeogram({
            prompt,
            style: options?.style || detectIdeogramStyle(prompt),
            aspectRatio: options?.aspectRatio || 'square',
            negativePrompt: options?.negativePrompt,
          });
          break;

        case 'banana_pro':
          result = await this.callBananaPro({
            featureType,
            inputImageUrl: inputImageUrl!,
            prompt,
            options,
          });
          break;

        case 'hedra':
          result = await this.callHedra({
            imageUrl: inputImageUrl!,
            text: options?.text || prompt,
            voiceStyle: options?.voiceStyle || 'female',
            duration: featureType === 'TALKING_PHOTO_5S' ? 5 : 10,
          });
          break;

        case 'baby_prediction':
          if (!inputImageUrl || !options?.secondImageUrl) {
            throw new Error('Baby Prediction requires both Mom and Dad photos');
          }
          result = await this.callBabyPrediction({
            momImageUrl: inputImageUrl,
            dadImageUrl: options.secondImageUrl as string,
            babyGender: options?.babyGender as 'boy' | 'girl' | 'random',
          });
          break;

        case 'kling':
          throw new Error('Video generation is coming soon!');

        default:
          throw new Error('Unknown API provider');
      }

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      // 7. Deduct credits on success
      await this.deductCredits(userId, config.credits);

      // 8. Update generation record
      await this.updateGenerationStatus(generation.id, 'COMPLETED', result.outputUrl, {
        processingTime: result.processingTime,
        apiProvider: config.apiProvider,
      });

      return {
        id: generation.id,
        status: 'COMPLETED',
        outputUrl: result.outputUrl,
        creditsUsed: config.credits,
        apiCost: config.apiCost,
        processingTime: result.processingTime,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateGenerationStatus(generation.id, 'FAILED', undefined, undefined, errorMessage);

      return {
        id: generation.id,
        status: 'FAILED',
        creditsUsed: 0,
        apiCost: 0,
        error: errorMessage,
      };
    }
  }

  // ==========================================================================
  // API INTEGRATIONS
  // ==========================================================================

  private async callIdeogram(request: IdeogramRequest): Promise<ApiResponse> {
    const startTime = Date.now();

    try {
      const aspectRatio = ASPECT_RATIO_OPTIONS[request.aspectRatio || 'square'];

      const response = await fetch(API_ENDPOINTS.IDEOGRAM, {
        method: 'POST',
        headers: {
          'Api-Key': IDEOGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_request: {
            prompt: request.prompt,
            aspect_ratio: this.mapAspectRatio(request.aspectRatio),
            model: 'V_2',
            magic_prompt_option: 'AUTO',
            style_type: this.mapIdeogramStyle(request.style),
            negative_prompt: request.negativePrompt,
          },
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as IdeogramApiResponse;
        throw new Error(errorData.message || 'Ideogram API error');
      }

      const data = (await response.json()) as IdeogramApiResponse;
      const outputUrl = data.data?.[0]?.url;

      if (!outputUrl) {
        throw new Error('No image generated');
      }

      return {
        success: true,
        outputUrl,
        processingTime: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private mapIdeogramStyle(style?: IdeogramStyle): string {
    const styleMap: Record<IdeogramStyle, string> = {
      realistic: 'REALISTIC',
      design: 'DESIGN',
      '3d': 'RENDER_3D',
      anime: 'ANIME',
      auto: 'AUTO',
    };
    return styleMap[style || 'auto'];
  }
  private mapAspectRatio(ratio?: string): string {
    const ratioMap: Record<string, string> = {
      'square': 'ASPECT_1_1',
      '1:1': 'ASPECT_1_1',
      'landscape': 'ASPECT_16_9',
      '16:9': 'ASPECT_16_9',
      'portrait': 'ASPECT_9_16',
      '9:16': 'ASPECT_9_16',
      '4:3': 'ASPECT_4_3',
      '3:4': 'ASPECT_3_4',
    };
    return ratioMap[ratio || 'square'] || 'ASPECT_1_1';
}
  private async callBananaPro(request: BananaProRequest): Promise<ApiResponse> {
    const startTime = Date.now();

    try {
      const endpointMap: Record<string, string> = {
        OBJECT_REMOVE: '/remove',
        BACKGROUND_CHANGE: '/background/change',
        PORTRAIT_STUDIO: '/portrait',
        SKETCH_COMPLETE: '/sketch',
        PHOTO_ENHANCE: '/enhance',
        BACKGROUND_EXPAND: '/expand',
        STYLE_TRANSFER: '/style',
        CELEBRITY_MERGE: '/merge',
      };

      const endpoint = endpointMap[request.featureType];
      if (!endpoint) {
        throw new Error('Invalid Banana PRO feature');
      }

      const response = await fetch(`${API_ENDPOINTS.BANANA_PRO}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BANANA_PRO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: request.inputImageUrl,
          prompt: request.prompt,
          ...request.options,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as BananaProApiResponse;
        throw new Error(errorData.message || 'Banana PRO API error');
      }

      const data = (await response.json()) as BananaProApiResponse;
      const outputUrl = data.output_url || data.result_url;

      if (!outputUrl) {
        throw new Error('No output generated');
      }

      return {
        success: true,
        outputUrl,
        processingTime: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private async callHedra(request: HedraRequest): Promise<ApiResponse> {
    const startTime = Date.now();

    try {
      const createResponse = await fetch(`${API_ENDPOINTS.HEDRA}/characters/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HEDRA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: request.imageUrl,
          text: request.text,
          voice: this.mapHedraVoice(request.voiceStyle),
          duration: request.duration,
        }),
      });

      if (!createResponse.ok) {
        const errorData = (await createResponse.json()) as HedraCreateResponse;
        throw new Error(errorData.message || 'Hedra API error');
      }

      const createData = (await createResponse.json()) as HedraCreateResponse;
      const jobId = createData.job_id;

      const outputUrl = await this.pollHedraResult(jobId);

      return {
        success: true,
        outputUrl,
        processingTime: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private mapHedraVoice(style: 'male' | 'female' | 'child'): string {
    const voiceMap = {
      male: 'en_male_1',
      female: 'en_female_1',
      child: 'en_child_1',
    };
    return voiceMap[style];
  }

  private async pollHedraResult(jobId: string, maxAttempts: number = 60): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`${API_ENDPOINTS.HEDRA}/characters/status/${jobId}`, {
        headers: {
          Authorization: `Bearer ${HEDRA_API_KEY}`,
        },
      });

      const data = (await response.json()) as HedraStatusResponse;

      if (data.status === 'completed' && data.video_url) {
        return data.video_url;
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Hedra generation failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Hedra generation timeout');
  }

  private async callBabyPrediction(request: BabyPredictionRequest): Promise<ApiResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${API_ENDPOINTS.BANANA_PRO}/baby-prediction`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BANANA_PRO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mother_image: request.momImageUrl,
          father_image: request.dadImageUrl,
          gender: request.babyGender || 'random',
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as BananaProApiResponse;
        throw new Error(errorData.message || 'Baby Prediction API error');
      }

      const data = (await response.json()) as BananaProApiResponse;
      const outputUrl = data.output_url || data.result_url;

      if (!outputUrl) {
        throw new Error('No baby image generated');
      }

      return {
        success: true,
        outputUrl,
        processingTime: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime,
      };
    }
  }

  // ==========================================================================
  // PROMPT ENHANCEMENT (Haiku)
  // ==========================================================================

  async enhancePrompt(originalPrompt: string, context: 'image' | 'logo' | 'transform'): Promise<string> {
    if (!ANTHROPIC_API_KEY) {
      return originalPrompt;
    }

    try {
      const systemPrompt = `You are an expert prompt engineer for AI image generation. Transform user input (which may be in Hinglish, Hindi, or English) into detailed, professional English prompts.

Rules:
1. Maintain cultural context (Indian festivals, traditions, clothing)
2. Add professional photography/art terminology
3. Keep the core intent but enhance with quality descriptors
4. For logos: emphasize "professional", "clean", "vector-style"
5. For transforms: describe the desired output clearly
6. Keep it under 200 words

Context: ${context}
Transform this prompt:`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: 'user', content: originalPrompt }],
        }),
      });

      const data = (await response.json()) as AnthropicResponse;
      return data.content?.[0]?.text?.trim() || originalPrompt;
    } catch {
      return originalPrompt;
    }
  }

  // ==========================================================================
  // GENERATION MANAGEMENT
  // ==========================================================================

  async getGeneration(generationId: string, userId: string) {
    const generation = await prisma.studioGeneration.findUnique({
      where: { id: generationId },
    });

    if (!generation) throw new Error('Generation not found');
    if (generation.userId !== userId) throw new Error('Unauthorized');

    return generation;
  }

  async getUserGenerations(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      category?: FeatureCategory;
      status?: GenerationStatus;
    }
  ) {
    const { limit = 20, offset = 0, category, status } = options || {};

    return await prisma.studioGeneration.findMany({
      where: {
        userId,
        ...(category && { featureCategory: category }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  private async updateGenerationStatus(
    generationId: string,
    status: GenerationStatus,
    outputUrl?: string,
    metadata?: Record<string, unknown>,
    errorMessage?: string
  ) {
    return await prisma.studioGeneration.update({
      where: { id: generationId },
      data: {
        status,
        outputUrl,
        metadata: metadata as object,
        errorMessage,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  // ==========================================================================
  // FEATURE INFO
  // ==========================================================================

  getAvailableFeatures() {
    return AVAILABLE_FEATURES.map((featureType: StudioFeatureType) => {
      const config = getFeatureConfig(featureType);
      return {
        featureType,
        name: config?.name,
        description: config?.description,
        credits: config?.credits,
        category: config?.category,
        examplePrompts: config?.examplePrompts,
      };
    });
  }

  getFeatureCategories() {
    return {
      text_to_image: IDEOGRAM_FEATURES.map((f: StudioFeatureType) => getFeatureConfig(f)),
      photo_transform: BANANA_PRO_FEATURES.map((f: StudioFeatureType) => getFeatureConfig(f)),
      talking_photo: TALKING_PHOTO_FEATURES.map((f: StudioFeatureType) => getFeatureConfig(f)),
      video: VIDEO_FEATURES.map((f: StudioFeatureType) => ({
        ...getFeatureConfig(f),
        comingSoon: true,
      })),
    };
  }

  async getStudioStatus(userId: string) {
    const balance = await this.getCreditsBalance(userId);
    const recentGenerations = await this.getUserGenerations(userId, { limit: 5 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, lastStudioReset: true },
    });

    const nextReset = new Date(user?.lastStudioReset || new Date());
    nextReset.setMonth(nextReset.getMonth() + 1);

    return {
      credits: balance,
      planType: user?.planType,
      nextReset,
      recentGenerations,
      features: this.getAvailableFeatures(),
    };
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  async getUsageStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const generations = await prisma.studioGeneration.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
      select: {
        featureType: true,
        featureCategory: true,
        apiProvider: true,
        creditsUsed: true,
        apiCost: true,
        createdAt: true,
      },
    });

    const byCategory: Record<string, number> = {};
    const byProvider: Record<string, number> = {};
    let totalCredits = 0;
    let totalApiCost = 0;

    for (const gen of generations) {
      const category = gen.featureCategory || 'unknown';
      const provider = gen.apiProvider || 'unknown';

      byCategory[category] = (byCategory[category] || 0) + 1;
      byProvider[provider] = (byProvider[provider] || 0) + 1;
      totalCredits += gen.creditsUsed;
      totalApiCost += gen.apiCost || 0;    }

    return {
      totalGenerations: generations.length,
      totalCreditsUsed: totalCredits,
      totalApiCost,
      byCategory,
      byProvider,
      period: `Last ${days} days`,
    };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const studioService = new StudioService();