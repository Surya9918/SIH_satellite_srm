import React from 'react';
import { PIPELINE_STAGES } from '../../types/satellite';
import { ProcessingJob, ProcessingStageId } from '../../types/satellite';
import { ProcessingStage } from './ProcessingStage';
import { TelemetryPanel } from './TelemetryPanel';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Satellite, Cpu, CheckCircle } from 'lucide-react';

interface ProcessingPipelineProps {
  job: ProcessingJob;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ job }) => {
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === job.currentStageId);

  return (
    <div className="w-full space-y-6">
      
      {/* Overall Progress Banner */}
      <Card className="border-cyan-200 glass-panel p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-200 text-accent flex items-center justify-center shadow-lg">
              <Satellite className="h-5 w-5 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-primary">
                  MISSION: {job.jobId}
                </h2>
                <Badge variant={job.status === 'completed' ? 'emerald' : 'cyan'} dot>
                  {job.status === 'completed' ? 'MISSION COMPLETED' : 'RECONSTRUCTING RASTER'}
                </Badge>
              </div>
              <p className="text-xs font-mono text-secondary mt-0.5">
                {job.message}
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-2xl font-bold text-accent">{job.overallProgress}%</span>
            <span className="text-xs text-secondary block">Overall Pipeline Progress</span>
          </div>
        </div>

        <Progress value={job.overallProgress} color="cyan" className="h-2.5" />
      </Card>

      {/* Telemetry Panel */}
      <TelemetryPanel telemetry={job.telemetry} />

      {/* 7 Granular Stages List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-secondary">
            Pipeline Computational Execution Sequence
          </h3>
          <span className="text-xs font-mono text-secondary">
            Active: Step {Math.min(7, Math.max(1, currentStageIndex + 1))} of 7
          </span>
        </div>

        <div className="space-y-3">
          {PIPELINE_STAGES.map((stageDef, idx) => {
            let status: 'completed' | 'active' | 'pending' = 'pending';
            let stageProgress = 0;

            if (job.status === 'completed' || idx < currentStageIndex) {
              status = 'completed';
              stageProgress = 100;
            } else if (idx === currentStageIndex) {
              status = 'active';
              stageProgress = job.stageProgress || 50;
            }

            return (
              <ProcessingStage
                key={stageDef.id}
                stage={stageDef}
                status={status}
                progress={stageProgress}
              />
            );
          })}
        </div>
      </div>

    </div>
  );
};
