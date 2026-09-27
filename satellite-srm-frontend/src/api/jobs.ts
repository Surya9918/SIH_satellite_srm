import { apiClient } from './client';
import { ProcessingJob } from '../types/satellite';
import { mockGetJobStatus } from './mockApi';

export async function getJobStatus(jobId: string, isMock = false): Promise<ProcessingJob> {
  if (isMock) {
    return mockGetJobStatus(jobId);
  }
  return apiClient<ProcessingJob>(`/api/v1/jobs/${jobId}`);
}
