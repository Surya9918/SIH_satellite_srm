import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Layers, CheckCircle2, ArrowDown, Sparkles, Loader2, Radio } from 'lucide-react';
import { BandReadingStackScene } from '../scene/BandReadingStackScene';
import { ErrorBoundary } from '../scene/ErrorBoundary';

interface MultispectralBandReaderViewerProps {
  currentStageId?: string;
  className?: string;
}

const BAND_INFOS = [
  { key: 'b02', name: 'B02', colorName: 'Blue', color: '#00e5ff', wavelength: '490 nm', border: 'border-blue-200', bg: 'bg-accent/10' },
  { key: 'b03', name: 'B03', colorName: 'Green', color: '#10b981', wavelength: '560 nm', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  { key: 'b04', name: 'B04', colorName: 'Red', color: '#ef4444', wavelength: '665 nm', border: 'border-red-500/40', bg: 'bg-red-500/10' },
  { key: 'b08', name: 'B08', colorName: 'NIR', color: '#a855f7', wavelength: '842 nm', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
];

// 2D Fallback for environments lacking WebGL
const BandReader2DFallback: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-r from-srm-surface via-srm-base to-srm-elevated">
    <div className="flex items-center gap-2 mb-3 text-xs font-mono text-accent">
      <Layers size={16} className="animate-pulse" />
      <span>Multispectral Channel Stacking (2D Fallback)</span>
    </div>
    <div className="flex items-center gap-2 text-xs font-mono text-secondary">
      <span className="text-accent">B02</span>
      <span>→</span>
      <span className="text-emerald-600">B03</span>
      <span>→</span>
      <span className="text-red-600">B04</span>
      <span>→</span>
      <span className="text-purple-400">B08</span>
      <span>→</span>
      <span className="text-cyan-700 font-bold">4-Channel Tensor</span>
    </div>
  </div>
);

export const MultispectralBandReaderViewer: React.FC<MultispectralBandReaderViewerProps> = ({
  currentStageId = 'preprocessing',
  className = '',
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [activeScanIdx, setActiveScanIdx] = useState<number>(0);
  const [isStackCombined, setIsStackCombined] = useState<boolean>(false);

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

  // Synchronize 2D status indicators with the 3D 6.5s scanning loop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScanIdx((prev) => {
        const next = (prev + 1) % 5;
        setIsStackCombined(next === 4);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative w-full rounded-2xl border border-theme glass-panel shadow-[0_0_35px_rgba(0,212,255,0.05)] overflow-hidden ${className}`}
    >
      {/* 3D Visualizer Canvas */}
      <div className="relative h-[220px] sm:h-[250px] w-full">
        {hasWebGL ? (
          <ErrorBoundary fallback={<BandReader2DFallback />}>
            <div className="absolute inset-0">
              <Canvas
                camera={{ position: [0, 0.2, 3.2], fov: 42 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 1.5]}
              >
                <Suspense fallback={null}>
                  <BandReadingStackScene currentStageId={currentStageId} />
                </Suspense>
              </Canvas>
            </div>
          </ErrorBoundary>
        ) : (
          <BandReader2DFallback />
        )}

        {/* Top Header Badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 glass-panel backdrop-blur-md px-3 py-1.5 rounded-xl border border-theme">
          <div className="w-5 h-5 rounded-lg bg-accent/20 border border-cyan-200 flex items-center justify-center text-cyan-700">
            <Radio size={12} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-primary leading-none">
              Multispectral Band Reading & Stacking
            </div>
            <div className="text-[9px] text-secondary font-mono mt-0.5">
              Calibrating B02, B03, B04, B08 into 4-Channel Input Tensor
            </div>
          </div>
        </div>

        {/* Top Right Stage Badge */}
        <div className="absolute top-3 right-3 pointer-events-none z-10">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-accent/20 border border-cyan-200 text-cyan-700 font-semibold animate-pulse">
            STAGE: READING BANDS
          </span>
        </div>

        {/* Bottom Banner when 4-Channel Stack is Aligned */}
        {isStackCombined && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/25 via-emerald-500/25 to-purple-500/25 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] anim-fade-in">
              <Sparkles size={14} className="text-cyan-700 animate-pulse" />
              <span className="text-xs font-black text-primary tracking-wider uppercase">
                4-CHANNEL MULTISPECTRAL STACK ALIGNED
              </span>
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
          </div>
        )}
      </div>

      {/* Sequential Flow Indicator Strip */}
      <div className="px-4 py-3 border-t border-theme bg-surface/90 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {BAND_INFOS.map((band, idx) => {
            const isScanning = activeScanIdx === idx;
            const isScanned = activeScanIdx > idx || activeScanIdx === 4;

            return (
              <React.Fragment key={band.key}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-300 ${
                    isScanning
                      ? `${band.border} ${band.bg} text-primary shadow-[0_0_15px_rgba(0,212,255,0.25)] ring-1 ring-cyan-400/40`
                      : isScanned
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                      : 'border-theme glass-panel text-muted-foreground opacity-60'
                  }`}
                >
                  {isScanning ? (
                    <Loader2 size={11} className="animate-spin text-cyan-700" />
                  ) : isScanned ? (
                    <CheckCircle2 size={11} className="text-emerald-600" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full glass-panel-secondary" />
                  )}
                  <span className="font-bold">{band.name}</span>
                  <span className="text-[10px] opacity-70 hidden sm:inline">{band.colorName}</span>
                </div>

                {idx < BAND_INFOS.length - 1 && (
                  <span className="text-secondary text-[10px]">↓</span>
                )}
              </React.Fragment>
            );
          })}

          <span className="text-secondary text-[10px]">↓</span>

          {/* Combined Output Stack Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all duration-300 ${
              isStackCombined
                ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold'
                : 'border-theme glass-panel text-muted-foreground opacity-60'
            }`}
          >
            {isStackCombined ? (
              <CheckCircle2 size={12} className="text-emerald-600" />
            ) : (
              <Layers size={12} className="text-muted-foreground" />
            )}
            <span>4-Channel Stack</span>
          </div>
        </div>

        <div className="text-[11px] text-secondary flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Calibrating Radiometry</span>
        </div>
      </div>
    </div>
  );
};
