import React from 'react';
import { StageDefinition } from '../../types/satellite';
import { CheckCircle2, CircleDashed, Clock, ChevronRight } from 'lucide-react';
import { Progress } from '../ui/Progress';

interface ProcessingStageProps {
  stage: StageDefinition;
  status: 'completed' | 'active' | 'pending';
  progress: number;
}

export const ProcessingStage: React.FC<ProcessingStageProps> = ({
  stage,
  status,
  progress
}) => {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      status === 'active'
        ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/10'
        : status === 'completed'
        ? 'border-emerald-500/40 bg-surface/90'
        : 'border-blue-100/60 bg-surface/40 opacity-70'
    }`}>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {status === 'completed' ? (
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          ) : status === 'active' ? (
            <div className="h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center animate-spin">
              <CircleDashed className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full glass-panel-secondary text-muted-foreground flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
          )}
          <span className="font-mono text-xs font-bold text-secondary">
            STEP {stage.stepNumber}
          </span>
          <h4 className={`text-sm font-bold ${status === 'active' ? 'text-primary' : status === 'completed' ? 'text-secondary' : 'text-secondary'}`}>
            {stage.name}
          </h4>
        </div>

        <span className="font-mono text-xs">
          {status === 'completed' && <span className="text-emerald-600 font-bold">DONE</span>}
          {status === 'active' && <span className="text-accent font-bold">{progress}%</span>}
          {status === 'pending' && <span className="text-muted-foreground">QUEUED</span>}
        </span>
      </div>

      <p className="text-xs text-secondary mb-3 pl-8">
        {stage.description}
      </p>

      {/* Subtasks list */}
      <div className="space-y-1.5 pl-8 text-xs font-mono">
        {stage.subTasks.map((task, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px]">
            <span className={`h-1.5 w-1.5 rounded-full ${
              status === 'completed' ? 'bg-emerald-400' : status === 'active' ? 'bg-cyan-400 animate-pulse' : 'glass-panel-secondary'
            }`}></span>
            <span className={status === 'completed' ? 'text-secondary' : status === 'active' ? 'text-cyan-800' : 'text-muted-foreground'}>
              {task}
            </span>
          </div>
        ))}
      </div>

      {status === 'active' && (
        <div className="mt-4 pl-8">
          <Progress value={progress} color="cyan" />
        </div>
      )}

    </div>
  );
};
