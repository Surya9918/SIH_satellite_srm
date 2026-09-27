import { apiClient } from './client';
import { ProcessingJob } from '../types/satellite';

export async function getJobStatus(jobId: string): Promise<ProcessingJob> {
  return apiClient<ProcessingJob>(`/api/v1/jobs/${jobId}`);
}
