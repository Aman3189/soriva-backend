// src/studio/config/studio.config.ts
// ✅ PROVIDER SWITCHING: Change provider in 1 line!
// ✅ CONFIGURATION: All Studio features centralized

export const STUDIO_CONFIG = {
  // ==========================================
  // 🔥 TALKING PHOTOS - MAIN SWITCH HERE!
  // ==========================================
  talkingPhotos: {
    // ⭐ CHANGE THIS LINE TO SWITCH PROVIDERS!
    currentProvider: (process.env.TALKING_PHOTO_PROVIDER || 'replicate') as 'replicate' | 'heygen',
    provider: (process.env.TALKING_PHOTO_PROVIDER || 'replicate') as 'replicate' | 'heygen', // Alias for compatibility
    
    // REPLICATE SETTINGS (Current - LIVE!)
    replicate: {
      enabled: true,
      model: 'fofr/live-portrait',
      apiToken: process.env.REPLICATE_API_TOKEN || '',
      costPerVideo: 1.70, // ₹1.70 per video
      qualityScore: 8.0, // Out of 10
      estimatedTime: '10-30 seconds',
      maxRetries: 3,
    },
    
    // HEYGEN SETTINGS (Ready - DISABLED)
    heygen: {
      enabled: false, // Set to true when switching
      apiKey: process.env.HEYGEN_API_KEY || '',
      costPer5s: 6.30, // ₹6.30 per 5s video
      costPer10s: 8.40, // ₹8.40 per 10s video
      qualityScore: 9.5, // Out of 10
      estimatedTime: '30-60 seconds',
      maxRetries: 3,
    },
    
    // USER PRICING (What users pay)
    pricing: {
      real_photo: {
        '5sec': 15, // ₹15
        '10sec': 25, // ₹25
      },
      ai_baby: {
        '5sec': 25, // ₹25
        '10sec': 30, // ₹30
      },
    },
    
    // VOICE STYLES AVAILABLE
    voiceStyles: ['male', 'female', 'child'],
    
    // A/B TESTING (Future feature)
    abTesting: {
      enabled: false,
      replicatePercentage: 90,
      heygenPercentage: 10,
    },
    
    // AUTO-SWITCH TRIGGERS (Future feature)
    autoSwitch: {
      enabled: false,
      triggers: {
        lowSatisfaction: 70,
        highComplaints: 20,
        highRefunds: 10,
      },
    },
  },
  
  // ==========================================
  // IMAGE GENERATION (SDXL)
  // ==========================================
  imageGeneration: {
    provider: 'replicate',
    model: 'stability-ai/sdxl',
    apiToken: process.env.REPLICATE_API_TOKEN || '',
    costPer512: 0.17,
    costPer1024: 0.17,
    defaultLanguage: 'hinglish',
    supportedLanguages: ['hinglish', 'hindi', 'english', 'punjabi'],
  },
  
  // ==========================================
  // LOGO GENERATION
  // ==========================================
  logoGeneration: {
    previewModel: 'stability-ai/sdxl',
    finalModel: 'stability-ai/stable-diffusion-3',
    previewCount: 3,
    previewCost: 0.51,
    finalCost: 10,
    finalPrice: 29,
    margin: 65,
  },
  
  // ==========================================
  // PROMPT ENHANCEMENT (Claude Haiku)
  // ==========================================
  promptEnhancement: {
    enabled: true,
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    costPerEnhancement: 0.02,
    supportedLanguages: ['hinglish', 'hindi', 'english', 'punjabi'],
    maxTokens: 200,
  },
  
  // ==========================================
  // FEEDBACK & ANALYTICS
  // ==========================================
  feedback: {
    enabled: true,
    collectAfterGeneration: true,
    minRatingForQuality: 4,
    trackMetrics: ['satisfaction', 'quality', 'wouldRecommend', 'shareRate', 'repeatUsage'],
  },
  
  // ==========================================
  // FEATURE FLAGS
  // ==========================================
  features: {
    talkingPhotos: true,
    logoGeneration: true,
    imageGeneration: true,
    promptEnhancement: true,
    imageUpscale: false,
    videoGeneration: false,
    voiceCloning: false,
  },
  
  // ==========================================
  // PLAN-BASED IMAGE LIMITS
  // ==========================================
  planLimits: {
    STARTER: 20,
    PLUS: 50,
    PRO: 120,
    EDGE: 1000,
    LIFE: 1000,
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getTalkingPhotoProvider(): 'replicate' | 'heygen' {
  return STUDIO_CONFIG.talkingPhotos.currentProvider;
}

export function switchTalkingPhotoProvider(newProvider: 'replicate' | 'heygen'): void {
  STUDIO_CONFIG.talkingPhotos.currentProvider = newProvider;
  STUDIO_CONFIG.talkingPhotos.provider = newProvider; // Keep both in sync
  console.log(`✅ Switched to ${newProvider} for Talking Photos`);
}

export function getTalkingPhotoCost(
  provider: 'replicate' | 'heygen',
  duration: '5sec' | '10sec'
): number {
  if (provider === 'replicate') {
    return STUDIO_CONFIG.talkingPhotos.replicate.costPerVideo;
  }
  return duration === '5sec'
    ? STUDIO_CONFIG.talkingPhotos.heygen.costPer5s
    : STUDIO_CONFIG.talkingPhotos.heygen.costPer10s;
}

export function getTalkingPhotoPrice(
  type: 'real_photo' | 'ai_baby',
  duration: '5sec' | '10sec'
): number {
  return STUDIO_CONFIG.talkingPhotos.pricing[type][duration];
}

export function isFeatureEnabled(feature: keyof typeof STUDIO_CONFIG.features): boolean {
  return STUDIO_CONFIG.features[feature];
}

export function getPlanImageLimit(planType: string): number {
  return STUDIO_CONFIG.planLimits[planType as keyof typeof STUDIO_CONFIG.planLimits] || 0;
}

export function isProviderReady(provider: 'replicate' | 'heygen'): boolean {
  if (provider === 'replicate') {
    return STUDIO_CONFIG.talkingPhotos.replicate.enabled &&
           !!STUDIO_CONFIG.talkingPhotos.replicate.apiToken;
  }
  return STUDIO_CONFIG.talkingPhotos.heygen.enabled &&
         !!STUDIO_CONFIG.talkingPhotos.heygen.apiKey;
}