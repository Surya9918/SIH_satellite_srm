import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, CheckCircle2, Sparkles, Cloud, Eye, ShieldCheck, Radio, AlertCircle } from 'lucide-react';
import { PreprocessingEarthScene } from '../scene/PreprocessingEarthScene';
import { ErrorBoundary } from '../scene/ErrorBoundary';

interface PreprocessingEarthViewerProps {
  progress?: number;
  currentStageId?: string;
  className?: string;
}

// 2D Fallback for environments lacking WebGL
const Preprocessing2DFallback: React.FC<{ isInputReady: boolean }> = ({ isInputReady }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-r from-srm-surface via-srm-base to-srm-elevated">
    <div className="flex items-center gap-2 mb-3 text-xs font-mono text-accent">
      <Grid size={16} className="animate-pulse" />
      <span>Radiometric Normalization & Tiling (2D Fallback)</span>
    </div>
    {isInputReady ? (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-700 text-xs font-bold">
        <CheckCircle2 size={13} />
        <span>4-CHANNEL INPUT READY</span>
      </div>
    ) : (
      <div className="text-[11px] text-secondary font-mono">
        Extracting 64×64 overlapping patches across B02, B03, B04, and B08...
      </div>
    )}
  </div>
);

export const PreprocessingEarthViewer: React.FC<PreprocessingEarthViewerProps> = ({
  progress = 50,
  currentStageId = 'preprocessing',
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

  // "4-CHANNEL INPUT READY" triggers when preprocessing reaches threshold or when ready for inference
  const isInputReady =
    currentStageId !== 'ingestion' &&
    (currentStageId !== 'preprocessing' || progress >= 65);

  const bands = [
    { name: 'B02', label: 'Blue', color: 'text-accent', border: 'border-blue-500/30' },
    { name: 'B03', label: 'Green', color: 'text-emerald-600', border: 'border-emerald-500/30' },
    { name: 'B04', label: 'Red', color: 'text-red-600', border: 'border-red-500/30' },
    { name: 'B08', label: 'NIR', color: 'text-purple-400', border: 'border-purple-500/30' },
  ];

  return (
    <div
      className={`relative w-full rounded-2xl border border-theme glass-panel shadow-[0_0_35px_rgba(0,212,255,0.05)] overflow-hidden ${className}`}
    >
      {/* 3D Preprocessing Scene Canvas */}
      <div className="relative h-[220px] sm:h-[250px] w-full">
        {hasWebGL ? (
          <ErrorBoundary fallback={<Preprocessing2DFallback isInputReady={isInputReady} />}>
            <div className="absolute inset-0">
              <Canvas
                camera={{ position: [0, 0.15, 2.8], fov: 40 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 1.5]}
              >
                <Suspense fallback={null}>
                  <PreprocessingEarthScene
                    progress={progress}
                    isStageActive={currentStageId === 'preprocessing'}
                  />
                </Suspense>
              </Canvas>
            </div>
          </ErrorBoundary>
        ) : (
          <Preprocessing2DFallback isInputReady={isInputReady} />
        )}

        {/* Top Left Status Badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 glass-panel backdrop-blur-md px-3 py-1.5 rounded-xl border border-theme">
          <div className="w-5 h-5 rounded-lg bg-accent/20 border border-cyan-200 flex items-center justify-center text-cyan-700">
            <Radio size={12} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-primary leading-none">
              Satellite Image Preprocessing
            </div>
            <div className="text-[9px] text-secondary font-mono mt-0.5">
              Radiometric Normalization & 64×64 Patch Tiling
            </div>
          </div>
        </div>

        {/* Top Right Cloud Metaphor Indicator */}
        <div className="absolute top-3 right-3 pointer-events-none z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel border border-theme text-[10px] font-mono text-secondary">
          <Cloud size={11} className="text-cyan-700" />
          <span>Noise Attenuation: {Math.min(85, Math.round(progress))}%</span>
        </div>

        {/* Bottom Banner when 4-Channel Input is Ready */}
        {isInputReady && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/25 via-emerald-500/25 to-blue-500/25 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] anim-fade-in">
              <Sparkles size={14} className="text-emerald-700 animate-pulse" />
              <span className="text-xs font-black text-primary tracking-wider uppercase">
                4-CHANNEL INPUT READY
              </span>
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
          </div>
        )}
      </div>

      {/* 4-Band Alignment Bar with Scientific Note */}
      <div className="px-4 py-3 border-t border-theme bg-surface/90 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-secondary text-[11px]">Spatially Aligned:</span>
          {bands.map((band) => (
            <div
              key={band.name}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border glass-panel ${band.border}`}
            >
              <CheckCircle2 size={11} className="text-emerald-600" />
              <span className={`font-bold ${band.color}`}>{band.name}</span>
              <span className="text-[9px] text-secondary hidden sm:inline">{band.label}</span>
            </div>
          ))}
        </div>

        {/* Explicit Disclaimer / Context */}
        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span>* Visual representation of radiometric preparation · Model does not perform cloud removal</span>
        </div>
      </div>
    </div>
  );
};
