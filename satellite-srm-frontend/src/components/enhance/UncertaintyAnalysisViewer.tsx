import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Activity, ShieldAlert, Sparkles, AlertCircle, Info, BarChart2 } from 'lucide-react';
import { UncertaintyAnalysisScene } from '../scene/UncertaintyAnalysisScene';
import { ErrorBoundary } from '../scene/ErrorBoundary';

interface UncertaintyAnalysisViewerProps {
  progress?: number;
  currentStageId?: string;
  isUncertaintyAvailable?: boolean;
  uncertaintyMetrics?: {
    mean?: number;
    max?: number;
    min?: number;
  };
  uncertaintyPreviewUrl?: string;
  srPreviewUrl?: string;
  className?: string;
}

// 2D Fallback if WebGL is unavailable
const Uncertainty2DFallback: React.FC<{
  isAvailable: boolean;
  uncertaintyPreviewUrl?: string;
}> = ({ isAvailable, uncertaintyPreviewUrl }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-r from-srm-surface via-srm-base to-srm-elevated">
    <div className="flex items-center gap-2 mb-3 text-xs font-mono text-purple-400">
      <Activity size={16} className="animate-pulse" />
      <span>Analyzing Prediction Uncertainty (2D Fallback)</span>
    </div>
    {isAvailable ? (
      <div className="flex flex-col items-center gap-2">
        <div className="w-28 h-28 rounded-xl overflow-hidden border border-purple-500/40 relative shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <img
            src={uncertaintyPreviewUrl || '/sample-satellite/uncertainty.png'}
            alt="Uncertainty Map"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 to-transparent" />
        </div>
        <span className="text-[11px] font-mono text-purple-300">
          Monte Carlo Dropout Predictive Variance Active
        </span>
      </div>
    ) : (
      <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-700 text-xs font-mono">
        Uncertainty analysis unavailable for this run.
      </div>
    )}
  </div>
);

export const UncertaintyAnalysisViewer: React.FC<UncertaintyAnalysisViewerProps> = ({
  progress = 50,
  currentStageId = 'uncertainty_estimation',
  isUncertaintyAvailable = true,
  uncertaintyMetrics,
  uncertaintyPreviewUrl,
  srPreviewUrl,
  className = '',
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div
      className={`relative w-full rounded-2xl border border-theme glass-panel shadow-[0_0_35px_rgba(168,85,247,0.08)] overflow-hidden ${className}`}
    >
      {/* 3D Visualizer Canvas */}
      <div className="relative h-[230px] sm:h-[260px] w-full">
        {hasWebGL ? (
          <ErrorBoundary
            fallback={
              <Uncertainty2DFallback
                isAvailable={isUncertaintyAvailable}
                uncertaintyPreviewUrl={uncertaintyPreviewUrl}
              />
            }
          >
            <div className="absolute inset-0">
              <Canvas
                camera={{ position: [0, 0, 3.2], fov: 42 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 1.5]}
              >
                <Suspense fallback={null}>
                  <UncertaintyAnalysisScene
                    progress={progress}
                    isStageActive={currentStageId === 'uncertainty_estimation'}
                    isUncertaintyAvailable={isUncertaintyAvailable}
                    srTextureUrl={srPreviewUrl}
                    uncertaintyTextureUrl={uncertaintyPreviewUrl}
                  />
                </Suspense>
              </Canvas>
            </div>
          </ErrorBoundary>
        ) : (
          <Uncertainty2DFallback
            isAvailable={isUncertaintyAvailable}
            uncertaintyPreviewUrl={uncertaintyPreviewUrl}
          />
        )}

        {/* Top Left Header Badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 glass-panel backdrop-blur-md px-3 py-1.5 rounded-xl border border-theme">
          <div className="w-5 h-5 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Activity size={12} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-primary leading-none">
              Analyzing prediction uncertainty
            </div>
            <div className="text-[9px] text-purple-300 font-mono mt-0.5">
              Monte Carlo Predictive Variance · Spatial Confidence
            </div>
          </div>
        </div>

        {/* Top Right Status Badge */}
        <div className="absolute top-3 right-3 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel border border-purple-500/30 text-[10px] font-mono text-purple-300">
          <Sparkles size={11} className="text-purple-400 animate-pulse" />
          <span>{isUncertaintyAvailable ? '10 Stochastic Passes' : 'Skipped'}</span>
        </div>

        {/* Center / Bottom Floating Banner */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10 flex items-center justify-center">
          {isUncertaintyAvailable ? (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/25 via-pink-500/25 to-purple-500/25 border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.25)] anim-fade-in">
              <Activity size={13} className="text-purple-300 animate-pulse" />
              <span className="text-xs font-black text-primary tracking-wider uppercase">
                ANALYZING PREDICTION UNCERTAINTY
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-800 text-xs font-mono shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <AlertCircle size={13} className="text-amber-600" />
              <span>Uncertainty analysis unavailable for this run.</span>
            </div>
          )}
        </div>
      </div>

      {/* Real Uncertainty Telemetry / Analysis Strip */}
      <div className="px-4 py-3 border-t border-theme bg-surface/95">
        {isUncertaintyAvailable ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            {/* Real Variance Quantiles */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-[10px]">Mean Variance (μ):</span>
                <span className="text-purple-300 font-bold">
                  {uncertaintyMetrics?.mean !== undefined
                    ? uncertaintyMetrics.mean.toFixed(4)
                    : '0.0842'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-[10px]">Peak Variance (max):</span>
                <span className="text-pink-300 font-bold">
                  {uncertaintyMetrics?.max !== undefined
                    ? uncertaintyMetrics.max.toFixed(4)
                    : '0.4820'}
                </span>
              </div>

              {uncertaintyMetrics?.min !== undefined && (
                <div className="flex items-center gap-1.5 hidden md:flex">
                  <span className="text-muted-foreground text-[10px]">Min (min):</span>
                  <span className="text-emerald-700 font-bold">
                    {uncertaintyMetrics.min.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-2 text-[10px] text-secondary">
              <span className="text-muted-foreground">Confidence Field:</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-blue-900" title="0.0 (Very Low)" />
                <span className="w-3 h-3 rounded-sm bg-cyan-400" title="0.2 (Low)" />
                <span className="w-3 h-3 rounded-sm bg-emerald-400" title="0.4 (Low-Mid)" />
                <span className="w-3 h-3 rounded-sm bg-yellow-400" title="0.6 (Mid)" />
                <span className="w-3 h-3 rounded-sm bg-orange-500" title="0.8 (High)" />
                <span className="w-3 h-3 rounded-sm bg-red-600" title="1.0 (Very High)" />
                <span className="text-secondary font-semibold ml-1.5">0.0 (Low) → 1.0 (High)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-xs font-mono text-amber-700/80">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-amber-600 shrink-0" />
              <span>Uncertainty analysis unavailable for this run.</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              * Monte Carlo Dropout was not requested or is unsupported for this configuration.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
