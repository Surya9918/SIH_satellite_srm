import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Layers, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { OutputReconstructionScene } from '../scene/OutputReconstructionScene';
import { ErrorBoundary } from '../scene/ErrorBoundary';

interface OutputReconstructionViewerProps {
  progress?: number;
  currentStageId?: string;
  className?: string;
}

const BAND_STREAMS = [
  { id: 'B02', name: 'B02', label: 'Blue (490nm)', color: '#00e5ff', border: 'border-cyan-200', text: 'text-accent', bg: 'bg-accent/20' },
  { id: 'B03', name: 'B03', label: 'Green (560nm)', color: '#10b981', border: 'border-emerald-500/40', text: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  { id: 'B04', name: 'B04', label: 'Red (665nm)', color: '#ef4444', border: 'border-red-500/40', text: 'text-red-600', bg: 'bg-red-500/10' },
  { id: 'B08', name: 'B08', label: 'NIR (842nm)', color: '#a855f7', border: 'border-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-500/10' },
];

// 2D Fallback if WebGL is unavailable
const Reconstruction2DFallback: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-r from-srm-surface via-srm-base to-srm-elevated">
    <div className="flex items-center gap-2 mb-3 text-xs font-mono text-emerald-600">
      <Activity size={16} className="animate-spin" />
      <span>Multispectral Output Reconstruction (2D Fallback)</span>
    </div>
    <div className="flex items-center gap-3 font-mono text-xs text-secondary">
      <div className="flex flex-col text-left text-[11px] gap-1">
        <span className="text-accent">B02 ─┐</span>
        <span className="text-emerald-600">B03 ─┤</span>
        <span className="text-red-600">B04 ─┼──&gt;</span>
        <span className="text-purple-400">B08 ─┘</span>
      </div>
      <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 font-bold">
        SUPER-RESOLVED MULTISPECTRAL OUTPUT
      </div>
    </div>
  </div>
);

export const OutputReconstructionViewer: React.FC<OutputReconstructionViewerProps> = ({
  progress = 50,
  currentStageId = 'spectral_consistency',
  className = '',
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [activeBandIdx, setActiveBandIdx] = useState<number>(0);

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

  // Cycle through bands for visual indicator highlighting
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBandIdx((prev) => (prev + 1) % BAND_STREAMS.length);
    }, 1300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative w-full rounded-2xl border border-theme glass-panel shadow-[0_0_35px_rgba(16,185,129,0.08)] overflow-hidden ${className}`}
    >
      {/* 3D Visualizer Canvas */}
      <div className="relative h-[240px] sm:h-[280px] w-full">
        {hasWebGL ? (
          <ErrorBoundary fallback={<Reconstruction2DFallback />}>
            <div className="absolute inset-0">
              <Canvas
                camera={{ position: [0, 0, 3.4], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 1.5]}
              >
                <Suspense fallback={null}>
                  <OutputReconstructionScene
                    progress={progress}
                    isStageActive={currentStageId === 'spectral_consistency'}
                  />
                </Suspense>
              </Canvas>
            </div>
          </ErrorBoundary>
        ) : (
          <Reconstruction2DFallback />
        )}

        {/* Top Left Header Badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 glass-panel backdrop-blur-md px-3 py-1.5 rounded-xl border border-theme">
          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-700">
            <Layers size={12} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-primary leading-none">
              Reconstructing Output
            </div>
            <div className="text-[9px] text-emerald-700 font-mono mt-0.5">
              Multi-Band Spectral Blending · 4 Spectral Channels
            </div>
          </div>
        </div>

        {/* Top Right Channel Fusion Badge */}
        <div className="absolute top-3 right-3 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel border border-emerald-500/30 text-[10px] font-mono text-emerald-700">
          <Sparkles size={11} className="text-emerald-600 animate-pulse" />
          <span>4-Channel Synthesis</span>
        </div>

        {/* Bottom Banner Floating Badge */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/25 via-cyan-500/25 to-emerald-500/25 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.25)] anim-fade-in">
            <Sparkles size={13} className="text-emerald-700 animate-pulse" />
            <span className="text-xs font-black text-primary tracking-wider uppercase">
              SUPER-RESOLVED MULTISPECTRAL OUTPUT
            </span>
          </div>
        </div>
      </div>

      {/* Spectral Layer Convergence Diagram (B02/B03/B04/B08 -> SUPER-RESOLVED OUTPUT) */}
      <div className="px-4 py-3 border-t border-theme bg-surface/95">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Visual ASCII / Circuit HUD Flow */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono select-none">
            {/* 4 Input Bands */}
            <div className="flex flex-col gap-1">
              {BAND_STREAMS.map((band, idx) => (
                <div
                  key={band.id}
                  className={`flex items-center justify-between gap-2 px-2 py-0.5 rounded border text-[10px] transition-all duration-300 ${
                    activeBandIdx === idx
                      ? `${band.border} ${band.bg} ${band.text} shadow-[0_0_10px_rgba(0,229,255,0.2)] font-bold`
                      : 'border-theme glass-panel text-secondary'
                  }`}
                >
                  <span className="font-bold">{band.name}</span>
                  <span className="text-[9px] opacity-75">{band.label}</span>
                </div>
              ))}
            </div>

            {/* Convergence Tree Connector */}
            <div className="font-mono text-emerald-600 text-xs leading-none select-none hidden sm:flex flex-col justify-center">
              <pre className="text-[11px] leading-[14px] text-emerald-600/80 font-bold">
{`─┐
─┤
─┼──>
─┘`}
              </pre>
            </div>
            <div className="sm:hidden text-emerald-600 text-xs">
              <ArrowRight size={14} />
            </div>

            {/* Target Output Product */}
            <div className="flex flex-col gap-1 p-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>SUPER-RESOLVED OUTPUT</span>
              </div>
              <div className="text-[9px] text-secondary font-mono">
                ~3.3m GSD · Refined Raster Grid · 4 Bands Blended
              </div>
            </div>
          </div>

          {/* Backend Authoritative Notice */}
          <div className="text-[10px] text-muted-foreground flex items-center gap-1 text-right">
            <span>* Backend output authoritative · Transitions to Results upon completion</span>
          </div>
        </div>
      </div>
    </div>
  );
};
