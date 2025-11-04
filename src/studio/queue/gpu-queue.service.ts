import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// GPU Job Queue
export const gpuQueue = new Queue('gpu-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5 seconds
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 50, // Keep last 50 failed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
});

// Queue Events for monitoring
export const queueEvents = new QueueEvents('gpu-jobs', { connection });

// Add job to queue
export async function addGPUJob(
  generationId: string,
  jobType: string,
  data: any
) {
  try {
    const job = await gpuQueue.add(
      jobType,
      {
        generationId,
        jobType,
        data,
        timestamp: new Date(),
      },
      {
        jobId: generationId, // Use generationId as jobId for tracking
      }
    );

    console.log(`GPU Job added: ${job.id} (${jobType})`);
    return job;
  } catch (error) {
    console.error('Error adding GPU job:', error);
    throw error;
  }
}

// Get job status
export async function getJobStatus(jobId: string) {
  try {
    const job = await gpuQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      state,
      timestamp: job.timestamp,
    };
  } catch (error) {
    console.error('Error getting job status:', error);
    return null;
  }
}

// Remove job from queue
export async function removeJob(jobId: string) {
  try {
    const job = await gpuQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`Job removed: ${jobId}`);
    }
  } catch (error) {
    console.error('Error removing job:', error);
  }
}

export default gpuQueue;