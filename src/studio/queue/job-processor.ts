import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import runPodService from '../gpu/runpod.service';
import GPU_CONFIG from '../gpu/gpu-config';
import { prisma } from '../../config/prisma';
import { GenerationStatus } from '@prisma/client';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// ✅ SIMULATION MODE FOR TESTING (Set to false when GPU is ready)
const SIMULATION_MODE = true;

// Job processor function
async function processGPUJob(job: Job) {
  const { generationId, jobType, data } = job.data;
  console.log(`Processing job: ${job.id} (${jobType})`);

  try {
    // Update status to PROCESSING
    await prisma.studioGeneration.update({
      where: { id: generationId },
      data: { status: GenerationStatus.PROCESSING },
    });

    // ✅ SIMULATION MODE: Mock GPU processing for testing
    if (SIMULATION_MODE) {
      console.log('🧪 SIMULATION MODE: Mocking GPU processing...');
      
      // Simulate processing time (3-5 seconds based on job type)
      const processingTime = jobType.includes('VIDEO') ? 5000 : 3000;
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      // Generate mock output URL based on job type
      let mockOutputUrl = '';
      let mockMetadata: any = {};
      
      if (jobType.includes('IMAGE')) {
        mockOutputUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
        mockMetadata = {
          resolution: '512x512',
          fileSize: 102400, // 100KB
          format: 'png',
        };
      } else if (jobType.includes('VIDEO')) {
        mockOutputUrl = `https://example.com/mock-video-${Date.now()}.mp4`;
        mockMetadata = {
          resolution: '512x512',
          duration: 5,
          fileSize: 2048000, // 2MB
          format: 'mp4',
          fps: 24,
        };
      } else if (jobType.includes('UPSCALE')) {
        mockOutputUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
        mockMetadata = {
          resolution: '1024x1024',
          fileSize: 204800, // 200KB
          format: 'png',
        };
      } else {
        mockOutputUrl = `https://example.com/mock-output-${Date.now()}.png`;
        mockMetadata = {
          resolution: '512x512',
          fileSize: 102400,
        };
      }
      
      // Update generation as completed
      await prisma.studioGeneration.update({
        where: { id: generationId },
        data: {
          status: GenerationStatus.COMPLETED,
          outputUrl: mockOutputUrl,
          metadata: mockMetadata,
          completedAt: new Date(),
        },
      });
      
      console.log(`✅ SIMULATION: Job completed - ${job.id}`);
      return { success: true, output: { url: mockOutputUrl, metadata: mockMetadata } };
    }

    // ✅ REAL GPU MODE: Actual RunPod processing
    // Determine endpoint based on job type
    let endpointId = '';
    if (jobType.includes('IMAGE')) {
      endpointId = GPU_CONFIG.ENDPOINTS.SDXL;
    } else if (jobType.includes('UPSCALE')) {
      endpointId = GPU_CONFIG.ENDPOINTS.UPSCALE;
    } else if (jobType.includes('VIDEO')) {
      endpointId = GPU_CONFIG.ENDPOINTS.VIDEO;
    }

    if (!endpointId) {
      throw new Error(`No endpoint configured for job type: ${jobType}`);
    }

    // Submit job to RunPod
    const runpodJob = await runPodService.submitJob(endpointId, data);

    // Poll for job completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (5 sec interval)
    let jobStatus = runpodJob.status;

    while (
      jobStatus === 'IN_QUEUE' ||
      jobStatus === 'IN_PROGRESS'
    ) {
      if (attempts >= maxAttempts) {
        throw new Error('Job timeout - exceeded max polling attempts');
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusCheck = await runPodService.checkJobStatus(
        endpointId,
        runpodJob.id
      );
      jobStatus = statusCheck.status;
      attempts++;

      // Update progress
      await job.updateProgress((attempts / maxAttempts) * 100);

      if (jobStatus === 'COMPLETED') {
        // Job completed successfully
        await prisma.studioGeneration.update({
          where: { id: generationId },
          data: {
            status: GenerationStatus.COMPLETED,
            outputUrl: statusCheck.output?.image_url || statusCheck.output?.video_url,
            completedAt: new Date(),
          },
        });

        console.log(`Job completed: ${job.id}`);
        return { success: true, output: statusCheck.output };
      }

      if (jobStatus === 'FAILED') {
        throw new Error(statusCheck.error || 'RunPod job failed');
      }
    }
  } catch (error: any) {
    console.error(`Job failed: ${job.id}`, error);

    // Update status to FAILED
    await prisma.studioGeneration.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.FAILED,
        errorMessage: error.message,
      },
    });

    throw error;
  }
}

// Create worker
export const gpuWorker = new Worker('gpu-jobs', processGPUJob, {
  connection,
  concurrency: 5, // Process 5 jobs concurrently
  limiter: {
    max: 10, // Max 10 jobs
    duration: 1000, // Per second
  },
});

// Worker events
gpuWorker.on('completed', (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

gpuWorker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err.message);
});

gpuWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

export default gpuWorker;