import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle, ArrowDown } from 'lucide-react';
import { ProcessingJob, ProcessingStageId } from '../../types/satellite';
import { MultispectralBandReaderViewer } from './MultispectralBandReaderViewer';
import { PreprocessingEarthViewer } from './PreprocessingEarthViewer';
import { SwinIRResolutionViewer } from './SwinIRResolutionViewer';
import { OutputReconstructionViewer } from './OutputReconstructionViewer';
import { UncertaintyAnalysisViewer } from './UncertaintyAnalysisViewer';

interface ProcessingProgressProps {
  job: ProcessingJob;
}

interface RealStage {
  id: string;
  label: string;
  description: string;
  matches: (currentStage: ProcessingStageId, isCompleted: boolean) => 'completed' | 'active' | 'pending';
}

const REAL_STAGES: RealStage[] = [
  {
    id: 'stage_1',
    label: 'Preparing imagery',
    description: 'Ingesting raster structure & validating TIFF headers',
    matches: (curr, done) => {
      if (done) return 'completed';
      if (curr === 'ingestion') return 'active';
      return 'completed'; // ingestion is first, so if curr is anything else it is completed
    },
  },
  {
    id: 'stage_2',
    label: 'Reading bands',
    description: 'Calibrating radiometric channels (B02, B03, B04, B08) & patch tiling',
    matches: (curr, done) => {
      if (done) return 'completed';
      if (curr === 'ingestion') return 'pending';
      if (curr === 'preprocessing') return 'active';
      return 'completed';
    },
  },
  {
    id: 'stage_3',
    label: 'Running SwinIR',
    description: 'Deep residual transformer neural inference (3× spatial scaling)',
    matches: (curr, done) => {
      if (done) return 'completed';
      if (curr === 'ingestion' || curr === 'preprocessing') return 'pending';
      if (curr === 'super_resolution') return 'active';
      return 'completed';
    },
  },
  {
    id: 'stage_4',
    label: 'Reconstructing output',
    description: 'Multi-band spectral blending & inter-band ratio preservation',
    matches: (curr, done) => {
      if (done) return 'completed';
      if (['ingestion', 'preprocessing', 'super_resolution'].includes(curr)) return 'pending';
      if (curr === 'spectral_consistency') return 'active';
      return 'completed';
    },
  },
  {
    id: 'stage_5',
    label: 'Uncertainty analysis',
    description: 'Monte Carlo Dropout spatial variance & confidence mapping',
    matches: (curr, done) => {
      if (done) return 'completed';
      if (['ingestion', 'preprocessing', 'super_resolution', 'spectral_consistency'].includes(curr)) return 'pending';
      if (curr === 'uncertainty_estimation') return 'active';
      return 'completed';
    },
  },
  {
    id: 'stage_6',
    label: 'Generating metrics',
    description: 'Calculating PSNR, SSIM, SAM, ERGAS & GeoTIFF product export',
    matches: (curr, done) => {
      if (done) return 'completed';
      if (['validation', 'gis_export'].includes(curr)) return 'active';
      return 'pending';
    },
  },
  {
    id: 'stage_7',
    label: 'Complete',
    description: 'All sub-4m super-resolution products verified and ready for review',
    matches: (_curr, done) => {
      if (done) return 'completed';
      return 'pending';
    },
  },
];

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ job }) => {
  const isCompleted = job.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Overall progress header */}
      <div className="rounded-2xl border border-theme bg-surface/90 p-5 shadow-[0_0_30px_rgba(0,212,255,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {isCompleted ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <Loader2 size={18} className="text-accent animate-spin" />
            )}
            <div>
              <h3 className="text-sm font-bold text-primary leading-none">
                {isCompleted ? 'Reconstruction Complete' : 'Super-Resolution Engine Active'}
              </h3>
              <p className="text-[11px] text-secondary mt-1">
                {job.message || 'Processing multispectral satellite imagery…'}
              </p>
            </div>
          </div>
          <span className={`text-base font-black font-mono ${isCompleted ? 'text-emerald-600' : 'text-accent'}`}>
            {job.overallProgress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full glass-panel overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${Math.max(5, job.overallProgress)}%` }}
          />
        </div>
      </div>

      {/* ── Real-Time Stage 3D Visualizations (Animations 3, 4, 5, 6 & 7) ── */}
      {job.currentStageId === 'ingestion' ? (
        <MultispectralBandReaderViewer currentStageId={job.currentStageId} />
      ) : job.currentStageId === 'preprocessing' ? (
        <PreprocessingEarthViewer
          progress={job.stageProgress || job.overallProgress}
          currentStageId={job.currentStageId}
        />
      ) : job.currentStageId === 'super_resolution' ? (
        <SwinIRResolutionViewer
          progress={job.stageProgress || job.overallProgress}
          scaleFactor={job.metrics?.scale_factor || 3}
          currentStageId={job.currentStageId}
        />
      ) : job.currentStageId === 'spectral_consistency' ? (
        <OutputReconstructionViewer
          progress={job.stageProgress || job.overallProgress}
          currentStageId={job.currentStageId}
        />
      ) : (
        <UncertaintyAnalysisViewer
          progress={job.stageProgress || job.overallProgress}
          currentStageId={job.currentStageId}
          isUncertaintyAvailable={
            Boolean(job.metrics?.uncertainty || job.outputs?.uncertaintyPreviewUrl || !job.message?.toLowerCase().includes('disabled'))
          }
          uncertaintyMetrics={job.metrics?.uncertainty}
          uncertaintyPreviewUrl={job.outputs?.uncertaintyPreviewUrl}
          srPreviewUrl={job.outputs?.srPreviewUrl}
        />
      )}

      {/* Real Backend Processing Flow (Vertical Flow with ↓ connectors) */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1 mb-2">
          Execution Stages
        </div>

        {REAL_STAGES.map((stage, idx) => {
          const status = stage.matches(job.currentStageId, isCompleted);
          const isLast = idx === REAL_STAGES.length - 1;

          return (
            <React.Fragment key={stage.id}>
              <div
                className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                  status === 'active'
                    ? 'bg-accent/[0.08] border-cyan-200 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                    : status === 'completed'
                    ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                    : 'glass-panel border-theme text-muted-foreground'
                }`}
              >
                {/* Status Indicator Icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  status === 'completed'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : status === 'active'
                    ? 'bg-accent/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200'
                    : 'glass-panel text-secondary border border-theme'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : status === 'active' ? (
                    <Loader2 size={13} className="text-accent animate-spin" />
                  ) : (
                    <Clock size={12} className="text-secondary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold leading-tight ${
                      status === 'active'
                        ? 'text-cyan-700 dark:text-cyan-400'
                        : status === 'completed'
                        ? 'text-secondary'
                        : 'text-muted-foreground'
                    }`}>
                      {stage.label}
                    </span>
                    {status === 'active' && (
                      <span className="text-[10px] font-mono text-accent bg-accent/20 px-2 py-0.5 rounded border border-cyan-200 animate-pulse">
                        RUNNING
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed mt-0.5">
                    {stage.description}
                  </p>
                </div>
              </div>

              {/* Downward connecting indicator */}
              {!isLast && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown
                    size={11}
                    className={`transition-colors duration-300 ${
                      status === 'completed' ? 'text-emerald-600/50' : 'text-secondary'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Real Live Telemetry Panel */}
      <div className="rounded-2xl border border-theme bg-surface/80 p-4">
        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">
          Backend System Telemetry
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg glass-panel border border-theme">
            <span className="text-[10px] text-muted-foreground block mb-0.5">Model</span>
            <span className="font-mono text-cyan-700 dark:text-cyan-400 font-bold truncate block" title={job.telemetry.model}>
              {job.telemetry.model || 'SwinIR-SRM'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg glass-panel border border-theme">
            <span className="text-[10px] text-muted-foreground block mb-0.5">Resolution</span>
            <span className="font-mono text-primary truncate block">
              {job.telemetry.inputGsd} → {job.telemetry.targetGsd}
            </span>
          </div>

          <div className="p-2.5 rounded-lg glass-panel border border-theme">
            <span className="text-[10px] text-muted-foreground block mb-0.5">Elapsed</span>
            <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
              {job.telemetry.elapsedSeconds}s
            </span>
          </div>

          <div className="p-2.5 rounded-lg glass-panel border border-theme">
            <span className="text-[10px] text-muted-foreground block mb-0.5">Operation</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 truncate block" title={job.telemetry.activeOperation}>
              {job.telemetry.activeOperation || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      {!isCompleted && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>Processing in progress on backend — do not close or navigate away.</span>
        </div>
      )}
    </div>
  );
};

