// src/studio/queue/job-processor.ts
import { Worker, Job, Queue } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../../core/services/prisma.service';
import { GenerationStatus, StudioFeatureType } from '@prisma/client';

// ============ REDIS CONNECTION ============
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// ============ QUEUE INSTANCE ============
export const studioQueue = new Queue('studio-generations', { connection });

// ============ JOB TYPES ============
export type StudioJobType = 'IDEOGRAM_GENERATE' | 'BANANA_TRANSFORM';

export interface StudioJobData {
  generationId: string;
  userId: string;
  jobType: StudioJobType;
  provider: 'IDEOGRAM' | 'BANANA_PRO';
  // Ideogram specific
  prompt?: string;
  style?: string;
  aspectRatio?: string;
  negativePrompt?: string;
  // Banana specific
  imageBase64?: string;
  imageMimeType?: string;
  // External tracking
  externalJobId?: string;
}

// ============ JOB PROCESSOR ============
async function processStudioJob(job: Job<StudioJobData>) {
  const { generationId, jobType, provider } = job.data;
  
  console.log(`[STUDIO QUEUE] Processing: ${job.id} | ${provider} | ${jobType}`);

  try {
    // Get generation record
    const generation = await prisma.studioGeneration.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      throw new Error(`Generation ${generationId} not found`);
    }

    // Skip if already terminal state
    if (generation.status === GenerationStatus.COMPLETED) {
      console.log(`✅ [${generationId}] Already completed`);
      return { success: true, skipped: true };
    }

    if (generation.status === GenerationStatus.FAILED) {
      console.log(`❌ [${generationId}] Already failed`);
      return { success: false, skipped: true };
    }

    // Update to processing
    await prisma.studioGeneration.update({
      where: { id: generationId },
      data: { status: GenerationStatus.PROCESSING },
    });

    // Route to appropriate processor
    let result: { outputUrl: string; metadata?: Record<string, any> };

    switch (provider) {
      case 'IDEOGRAM':
        result = await processIdeogramJob(job.data);
        break;
      case 'BANANA_PRO':
        result = await processBananaJob(job.data);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    // Mark completed
    await prisma.studioGeneration.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.COMPLETED,
        outputUrl: result.outputUrl,
        metadata: result.metadata || {},
        completedAt: new Date(),
      },
    });

    console.log(`✅ [${generationId}] Completed: ${result.outputUrl}`);
    return { success: true, outputUrl: result.outputUrl };

  } catch (error: any) {
    console.error(`❌ [STUDIO QUEUE] Job failed: ${job.id}`, error.message);

    // Mark failed
    await prisma.studioGeneration.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.FAILED,
        errorMessage: error.message || 'Generation failed',
        completedAt: new Date(),
      },
    }).catch(() => {}); // Ignore if record doesn't exist

    throw error;
  }
}

// ============ IDEOGRAM PROCESSOR ============
async function processIdeogramJob(data: StudioJobData): Promise<{ outputUrl: string; metadata?: Record<string, any> }> {
  const { prompt, style, aspectRatio, negativePrompt } = data;

  // TODO: Implement actual Ideogram API call
  // const ideogramService = new IdeogramService();
  // const result = await ideogramService.generate({ prompt, style, aspectRatio, negativePrompt });
  
  // Placeholder - replace with actual API integration
  console.log(`[IDEOGRAM] Generating: "${prompt?.substring(0, 50)}..."`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    outputUrl: 'https://placeholder.ideogram.ai/generated-image.png',
    metadata: {
      provider: 'IDEOGRAM',
      style: style || 'auto',
      aspectRatio: aspectRatio || '1:1',
    },
  };
}

// ============ BANANA PRO PROCESSOR ============
async function processBananaJob(data: StudioJobData): Promise<{ outputUrl: string; metadata?: Record<string, any> }> {
  const { prompt, imageBase64, imageMimeType } = data;

  // TODO: Implement actual Banana PRO API call
  // const bananaService = new BananaProService();
  // const result = await bananaService.transform({ prompt, imageBase64, imageMimeType });

  // Placeholder - replace with actual API integration
  console.log(`[BANANA PRO] Transforming with prompt: "${prompt?.substring(0, 50)}..."`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 3000));

  return {
    outputUrl: 'https://placeholder.banana.pro/transformed-image.png',
    metadata: {
      provider: 'BANANA_PRO',
      hasSourceImage: !!imageBase64,
    },
  };
}

// ============ QUEUE HELPERS ============
export async function addGenerationJob(data: StudioJobData): Promise<string> {
  const job = await studioQueue.add(data.jobType, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  });

  console.log(`[STUDIO QUEUE] Added job: ${job.id} | ${data.provider}`);
  return job.id!;
}

export async function getJobStatus(jobId: string) {
  const job = await studioQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  return {
    jobId: job.id,
    state,
    data: job.data,
    progress: job.progress,
    failedReason: job.failedReason,
  };
}

// ============ WORKER INSTANCE ============
export const studioWorker = new Worker('studio-generations', processStudioJob, {
  connection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000, // 10 jobs per second
  },
});

// ============ WORKER EVENTS ============
studioWorker.on('completed', (job) => {
  console.log(`✅ [STUDIO WORKER] Completed: ${job.id}`);
});

studioWorker.on('failed', (job, err) => {
  console.error(`❌ [STUDIO WORKER] Failed: ${job?.id} - ${err.message}`);
});

studioWorker.on('error', (err) => {
  console.error('[STUDIO WORKER] Error:', err);
});

studioWorker.on('ready', () => {
  console.log('🚀 [STUDIO WORKER] Ready and listening for jobs');
});

export default studioWorker;