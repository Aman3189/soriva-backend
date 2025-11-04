import axios, { AxiosInstance } from 'axios';
import GPU_CONFIG from './gpu-config';

interface RunPodJobInput {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

interface RunPodJobResponse {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  output?: any;
  error?: string;
}

export class RunPodService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: GPU_CONFIG.RUNPOD_API_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GPU_CONFIG.RUNPOD_API_KEY}`,
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Submit a job to RunPod
   */
  async submitJob(
    endpointId: string,
    input: RunPodJobInput
  ): Promise<RunPodJobResponse> {
    try {
      const response = await this.client.post(`/${endpointId}/run`, {
        input,
      });

      return {
        id: response.data.id,
        status: response.data.status,
      };
    } catch (error: any) {
      console.error('RunPod submitJob error:', error.response?.data || error.message);
      throw new Error(`Failed to submit job to RunPod: ${error.message}`);
    }
  }

  /**
   * Check job status
   */
  async checkJobStatus(
    endpointId: string,
    jobId: string
  ): Promise<RunPodJobResponse> {
    try {
      const response = await this.client.get(`/${endpointId}/status/${jobId}`);

      return {
        id: response.data.id,
        status: response.data.status,
        output: response.data.output,
        error: response.data.error,
      };
    } catch (error: any) {
      console.error('RunPod checkJobStatus error:', error.response?.data || error.message);
      throw new Error(`Failed to check job status: ${error.message}`);
    }
  }

  /**
   * Cancel a running job
   */
  async cancelJob(endpointId: string, jobId: string): Promise<void> {
    try {
      await this.client.post(`/${endpointId}/cancel/${jobId}`);
    } catch (error: any) {
      console.error('RunPod cancelJob error:', error.response?.data || error.message);
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  }

  /**
   * Get endpoint health
   */
  async getEndpointHealth(endpointId: string): Promise<boolean> {
    try {
      const response = await this.client.get(`/${endpointId}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export default new RunPodService();