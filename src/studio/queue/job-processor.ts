// src/studio/queue/job-processor.ts
// ✅ SIMPLIFIED: No queue needed with Replicate API
// All processing happens directly in studio.service.ts

import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../../core/services/prisma.service';
import { GenerationStatus } from '@prisma/client';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

/**
 * NOTE: With Replicate API integration, this queue processor is optional.
 * 
 * All generation happens directly in studio.service.ts methods:
 * - createImageGeneration() - Direct Replicate API call
 * - createImageUpscale() - Direct Replicate API call
 * - createImageToVideo() - Direct Replicate API call
 * 
 * This file is kept for:
 * 1. Backwards compatibility
 * 2. Future async processing if needed
 * 3. Rate limiting / queue management
 */

// Simple job processor (mostly no-op now)
async function processStudioJob(job: Job) {
  const { generationId, jobType } = job.data;
  console.log(`[STUDIO QUEUE] Processing job: ${job.id} (${jobType})`);

  try {
    // Check if generation was already processed by service
    const generation = await prisma.studioGeneration.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      throw new Error(`Generation ${generationId} not found`);
    }

    // If already completed/failed by service, just acknowledge
    if (generation.status === GenerationStatus.COMPLETED) {
      console.log(`✅ Generation ${generationId} already completed by service`);
      return { success: true, output: generation.outputUrl };
    }

    if (generation.status === GenerationStatus.FAILED) {
      console.log(`❌ Generation ${generationId} already failed`);
      throw new Error(generation.errorMessage || 'Generation failed');
    }

    // If still processing, wait for service to complete
    console.log(`⏳ Generation ${generationId} being processed by Replicate API...`);
    return { success: true, message: 'Processing via Replicate API' };

  } catch (error: any) {
    console.error(`[STUDIO QUEUE] Job failed: ${job.id}`, error);
    throw error;
  }
}

// Create worker (optional - can be disabled)
export const studioWorker = new Worker('studio-jobs', processStudioJob, {
  connection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
});

// Worker events
studioWorker.on('completed', (job) => {
  console.log(`✅ [STUDIO QUEUE] Job completed: ${job.id}`);
});

studioWorker.on('failed', (job, err) => {
  console.error(`❌ [STUDIO QUEUE] Job failed: ${job?.id}`, err.message);
});

studioWorker.on('error', (err) => {
  console.error('[STUDIO QUEUE] Worker error:', err);
});

export default studioWorker;