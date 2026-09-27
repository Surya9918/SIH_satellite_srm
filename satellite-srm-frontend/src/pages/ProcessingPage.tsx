import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSrmStore } from '../store/useSrmStore';
import { getJobStatus } from '../api/jobs';
import { ProcessingPipeline } from '../components/processing/ProcessingPipeline';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export const ProcessingPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { activeJob, setActiveJob, updateJobProgress, isMockMode } = useSrmStore();

  const currentJobId = jobId || activeJob?.jobId || "SRM-JOB-SAMPLE";

  useEffect(() => {
    let timer: any = null;

    const poll = async () => {
      try {
        const job = await getJobStatus(currentJobId, isMockMode);
        setActiveJob(job);

        if (job.status === 'completed') {
          clearInterval(timer);
        }
      } catch (err) {
        console.error("Failed to poll job status:", err);
      }
    };

    poll();
    timer = setInterval(poll, 1000);

    return () => clearInterval(timer);
  }, [currentJobId, isMockMode, setActiveJob]);

  const isCompleted = activeJob?.status === 'completed';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Processing view */}
      {activeJob ? (
        <>
          <ProcessingPipeline job={activeJob} />

          {/* Action on completion */}
          {isCompleted && (
            <div className="p-6 rounded-2xl border border-emerald-500/50 bg-emerald-950/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm glow-box-emerald">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/30 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-primary">
                    RECONSTRUCTION MISSION COMPLETE
                  </h3>
                  <p className="text-xs font-mono text-secondary">
                    Sub-4m GeoTIFF, uncertainty map, and NDVI spectral analysis compiled.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate(`/app/results/${activeJob.jobId}`)}
                className="w-full sm:w-auto font-mono font-bold text-sm bg-emerald-400 hover:bg-emerald-300 text-foreground shadow-lg shadow-emerald-500/20"
              >
                Inspect Results & Compare
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-blue-100 glass-panel font-mono">
          <RefreshCw className="h-8 w-8 text-accent animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-primary mb-2">Connecting to Telemetry Stream...</h3>
          <p className="text-xs text-secondary">Fetching processing stage for Job {currentJobId}</p>
        </div>
      )}

    </div>
  );
};
