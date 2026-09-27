import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Cpu, Zap, ArrowRight, Grid, Sparkles, Network } from 'lucide-react';
import { SwinIRResolutionScene } from '../scene/SwinIRResolutionScene';
import { ErrorBoundary } from '../scene/ErrorBoundary';

interface SwinIRResolutionViewerProps {
  progress?: number;
  scaleFactor?: number;
  currentStageId?: string;
  className?: string;
}

const SEQUENCE_STEPS = [
  { id: 'step_1', label: 'Low-Res Image', sub: '10m GSD' },
  { id: 'step_2', label: 'Feature Extraction', sub: 'Convolutional Stem' },
  { id: 'step_3', label: 'Deep Residual Transformation', sub: 'Shifted Window Attention' },
  { id: 'step_4', label: 'High-Res Reconstruction', sub: '~3.3m GSD' },
];

// 2D Fallback if WebGL is unavailable
const SwinIR2DFallback: React.FC<{ scaleFactor: number }> = ({ scaleFactor }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-r from-srm-surface via-srm-base to-srm-elevated">
    <div className="flex items-center gap-2 mb-3 text-xs font-mono text-accent">
      <Cpu size={16} className="animate-spin" />
      <span>SwinIR Deep Residual Transformer (2D Fallback)</span>
    </div>
    <div className="flex items-center gap-2 text-xs font-mono text-secondary">
      <span className="text-amber-600">10m GSD</span>
      <span>→</span>
      <span className="text-purple-400">Deep Transformer Attention</span>
      <span>→</span>
      <span className="text-cyan-700 font-bold">~3.3m Sub-4m ({scaleFactor}×)</span>
    </div>
  </div>
);

export const SwinIRResolutionViewer: React.FC<SwinIRResolutionViewerProps> = ({
  progress = 50,
  scaleFactor = 3,
  currentStageId = 'super_resolution',
  className = '',
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(2);

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

  // Step indicator progression
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % 4);
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative w-full rounded-2xl border border-theme glass-panel shadow-[0_0_35px_rgba(139,92,246,0.08)] overflow-hidden ${className}`}
    >
      {/* 3D Visualizer Canvas */}
      <div className="relative h-[220px] sm:h-[250px] w-full">
        {hasWebGL ? (
          <ErrorBoundary fallback={<SwinIR2DFallback scaleFactor={scaleFactor} />}>
            <div className="absolute inset-0">
              <Canvas
                camera={{ position: [0, 0, 3.2], fov: 42 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 1.5]}
              >
                <Suspense fallback={null}>
                  <SwinIRResolutionScene
                    progress={progress}
                    scaleFactor={scaleFactor}
                    isStageActive={currentStageId === 'super_resolution'}
                  />
                </Suspense>
              </Canvas>
            </div>
          </ErrorBoundary>
        ) : (
          <SwinIR2DFallback scaleFactor={scaleFactor} />
        )}

        {/* Top Left Header Badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 glass-panel backdrop-blur-md px-3 py-1.5 rounded-xl border border-theme">
          <div className="w-5 h-5 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Cpu size={12} className="animate-spin-slow" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-primary leading-none">
              Running SwinIR
            </div>
            <div className="text-[9px] text-purple-300 font-mono mt-0.5">
              Deep Residual Transformer · {scaleFactor}× Spatial Reconstruction
            </div>
          </div>
        </div>

        {/* Top Right Resolution Scale Badge */}
        <div className="absolute top-3 right-3 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel border border-purple-500/30 text-[10px] font-mono text-purple-300">
          <Zap size={11} className="text-purple-400 animate-pulse" />
          <span>10.0m → ~3.3m GSD</span>
        </div>

        {/* Bottom Banner Indicator */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/25 via-cyan-500/25 to-purple-500/25 border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.25)] anim-fade-in">
            <Sparkles size={13} className="text-purple-300 animate-pulse" />
            <span className="text-xs font-black text-primary tracking-wider uppercase">
              {scaleFactor}× SPATIAL RECONSTRUCTION ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Sequential Neural Processing Steps Strip */}
      <div className="px-4 py-3 border-t border-theme bg-surface/90 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {SEQUENCE_STEPS.map((step, idx) => {
            const isActive = activeStepIdx === idx;
            const isCompleted = activeStepIdx > idx;

            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-300 ${
                    isActive
                      ? 'border-purple-500/50 bg-purple-500/20 text-primary shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/40'
                      : isCompleted
                      ? 'border-cyan-200 bg-accent/20 text-cyan-700'
                      : 'border-theme glass-panel text-muted-foreground opacity-60'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive
                        ? 'bg-purple-400 animate-pulse'
                        : isCompleted
                        ? 'bg-cyan-400'
                        : 'glass-panel-secondary'
                    }`}
                  />
                  <span className="font-bold">{step.label}</span>
                </div>

                {idx < SEQUENCE_STEPS.length - 1 && (
                  <span className="text-secondary text-[10px]">↓</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Disclaimer / Note */}
        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span>* Visual explanation of SwinIR spatial reconstruction · Inference executed on backend</span>
        </div>
      </div>
    </div>
  );
};
