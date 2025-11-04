// GPU Configuration for RunPod
export const GPU_CONFIG = {
  // RunPod API
  RUNPOD_API_URL: 'https://api.runpod.io/v2',
  RUNPOD_API_KEY: process.env.RUNPOD_API_KEY || '',

  // GPU Pod Configuration
  POD_CONFIG: {
    gpuType: 'NVIDIA A100',
    minVRAM: 40, // GB
    containerImage: 'runpod/pytorch:2.1.0-py3.10-cuda12.1.0-devel',
  },

  // Model Endpoints (will be configured later)
  ENDPOINTS: {
    SDXL: process.env.RUNPOD_SDXL_ENDPOINT || '',
    UPSCALE: process.env.RUNPOD_UPSCALE_ENDPOINT || '',
    VIDEO: process.env.RUNPOD_VIDEO_ENDPOINT || '',
  },

  // Job Timeouts (seconds)
  TIMEOUTS: {
    IMAGE_512: 30,
    IMAGE_1024: 60,
    UPSCALE_2X: 45,
    UPSCALE_4X: 90,
    VIDEO_5SEC: 120,
    VIDEO_15SEC: 300,
    VIDEO_30SEC: 600,
  },

  // Cost per generation (credits)
  COSTS: {
    IMAGE_GENERATION_512: 10,
    IMAGE_GENERATION_1024: 20,
    BACKGROUND_REMOVAL: 5,
    IMAGE_UPSCALE_2X: 15,
    IMAGE_UPSCALE_4X: 30,
    TEXT_TO_SPEECH: 8,
    VOICE_CLONE: 12,
    VIDEO_5SEC: 50,
    VIDEO_15SEC: 100,
    VIDEO_30SEC: 150,
  },
};

export default GPU_CONFIG;