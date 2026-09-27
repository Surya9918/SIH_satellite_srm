import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  CheckCircle2, Loader2, AlertCircle, Sparkles,
  ShieldCheck, ShieldAlert, X, Globe, Layers, MapPin
} from 'lucide-react';
import { FourBandValidationResult } from '../../types/satellite';
import { RealisticEarth } from '../scene/RealisticEarth';
import { ProceduralSatellite } from '../scene/SatelliteModel';
import { ScanBeam } from '../scene/ScanBeam';
import { ScanningGrid } from '../scene/ScanningGrid';
import { ErrorBoundary } from '../scene/ErrorBoundary';
import * as THREE from 'three';

interface ValidationScannerModalProps {
  isOpen: boolean;
  phase: 'idle' | 'scanning' | 'success' | 'failed';
  validationResult: FourBandValidationResult | null;
  error: string | null;
  onClose: () => void;
}

// 3D Scene for the Validation Scanner
const Validation3DScene: React.FC<{
  phase: 'idle' | 'scanning' | 'success' | 'failed';
}> = ({ phase }) => {
  const satellitePos = new THREE.Vector3(0.55, 0.48, 1.25);
  const isScanning = phase === 'scanning';
  const isValidated = phase === 'success';
  const isFailed = phase === 'failed';

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 2, 3]} intensity={1.8} />
      <pointLight position={[-3, -2, -2]} intensity={0.5} color="#00e5ff" />

      {/* Rotating Earth Globe centered in scan viewport */}
      <group position={[-0.1, -0.4, 0.1]} scale={0.95}>
        <RealisticEarth />
      </group>

      {/* Observation Satellite */}
      <group position={satellitePos} rotation={[-0.3, -0.5, 0.1]} scale={0.85}>
        <ProceduralSatellite />
      </group>

      {/* Nadir Observation Scan Beam */}
      <ScanBeam satellitePosition={satellitePos} />

      {/* Precision Scanning Coordinate Grid & Radar Sweep */}
      <ScanningGrid
        isScanning={isScanning}
        isValidated={isValidated}
        isFailed={isFailed}
      />
    </>
  );
};

// 2D Fallback for environments lacking WebGL
const Validation2DFallback: React.FC<{
  phase: 'idle' | 'scanning' | 'success' | 'failed';
}> = ({ phase }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-b from-srm-surface to-srm-elevated">
    <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-200 flex items-center justify-center animate-spin-slow mb-4">
      {phase === 'scanning' && <Loader2 size={32} className="text-accent animate-spin" />}
      {phase === 'success' && <CheckCircle2 size={36} className="text-emerald-600" />}
      {phase === 'failed' && <AlertCircle size={36} className="text-red-600" />}
    </div>
    <span className="text-xs font-mono text-cyan-700 uppercase tracking-wider">
      {phase === 'scanning' && 'Raster Coordinate Validation In Progress'}
      {phase === 'success' && 'Raster Coordinate Validation Passed'}
      {phase === 'failed' && 'Validation Error Detected'}
    </span>
  </div>
);

export const ValidationScannerModal: React.FC<ValidationScannerModalProps> = ({
  isOpen,
  phase,
  validationResult,
  error,
  onClose,
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

  if (!isOpen) return null;

  const isScanning = phase === 'scanning';
  const isSuccess = phase === 'success';
  const isFailed = phase === 'failed';

  const common = validationResult?.metadata?.common;
  const b02 = validationResult?.metadata?.b02;
  const b03 = validationResult?.metadata?.b03;
  const b04 = validationResult?.metadata?.b04;
  const b08 = validationResult?.metadata?.b08;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 glass-panel backdrop-blur-md anim-fade-in select-none">
      <div className="relative w-full max-w-4xl rounded-2xl border border-theme bg-surface/95 shadow-[0_0_60px_rgba(0,212,255,0.15)] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme glass-panel">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                isSuccess
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : isFailed
                  ? 'bg-red-500/15 border-red-500/40 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-accent/20 border-cyan-200 text-cyan-700 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
              }`}
            >
              {isSuccess ? (
                <ShieldCheck size={18} />
              ) : isFailed ? (
                <ShieldAlert size={18} />
              ) : (
                <Loader2 size={18} className="animate-spin" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-primary tracking-wide flex items-center gap-2">
                <span>Satellite Imagery Validation</span>
                {isScanning && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/20 border border-cyan-200 text-cyan-700 animate-pulse">
                    SCANNING
                  </span>
                )}
                {isSuccess && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 font-bold">
                    VALIDATED
                  </span>
                )}
                {isFailed && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-700 font-bold">
                    FAILED
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-secondary font-mono">
                Sentinel-2 MSI 10m Multi-Band Raster Verification
              </p>
            </div>
          </div>

          {isFailed && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:glass-panel transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content Body: Left 3D Scanner, Right Verification Checklist */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: 3D Earth Scanning Viewport */}
          <div className="relative h-[260px] md:h-[340px] glass-panel border-b md:border-b-0 md:border-r border-theme overflow-hidden">
            {hasWebGL ? (
              <ErrorBoundary fallback={<Validation2DFallback phase={phase} />}>
                <Canvas
                  camera={{ position: [0, 0.1, 2.7], fov: 38 }}
                  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                  dpr={[1, 1.5]}
                >
                  <Suspense fallback={null}>
                    <Validation3DScene phase={phase} />
                  </Suspense>
                </Canvas>
              </ErrorBoundary>
            ) : (
              <Validation2DFallback phase={phase} />
            )}

            {/* Coordinate overlay badge */}
            <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded glass-panel border border-theme text-[10px] font-mono text-cyan-700">
              <Globe size={11} className="text-accent" />
              <span>Footprint: UTM 44N (78.45°E, 17.41°N)</span>
            </div>

            {/* Scan mode watermark */}
            <div className="absolute bottom-3 left-3 pointer-events-none z-10 text-[10px] font-mono text-muted-foreground">
              Sensor: Sentinel-2 MSI · Band Calibration
            </div>
          </div>

          {/* Right: Validation Checks List */}
          <div className="p-5 md:p-6 space-y-4 flex flex-col justify-between bg-surface/60">
            <div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">
                Validation Verification Protocol
              </div>

              <div className="space-y-2">
                {/* 1. Band Check: B02 */}
                <div className="flex items-center justify-between p-2.5 rounded-xl glass-panel border border-theme text-xs">
                  <div className="flex items-center gap-2.5">
                    {isSuccess && b02 ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    ) : isFailed && !b02 ? (
                      <AlertCircle size={15} className="text-red-600 shrink-0" />
                    ) : (
                      <Loader2 size={14} className="text-accent animate-spin shrink-0" />
                    )}
                    <span className="font-semibold text-secondary">B02 Blue (490 nm)</span>
                  </div>
                  <span className="font-mono text-[11px] text-secondary">
                    {isSuccess && b02 ? `${b02.width}×${b02.height}` : 'Verifying raster…'}
                  </span>
                </div>

                {/* 2. Band Check: B03 */}
                <div className="flex items-center justify-between p-2.5 rounded-xl glass-panel border border-theme text-xs">
                  <div className="flex items-center gap-2.5">
                    {isSuccess && b03 ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    ) : isFailed && !b03 ? (
                      <AlertCircle size={15} className="text-red-600 shrink-0" />
                    ) : (
                      <Loader2 size={14} className="text-accent animate-spin shrink-0" />
                    )}
                    <span className="font-semibold text-secondary">B03 Green (560 nm)</span>
                  </div>
                  <span className="font-mono text-[11px] text-secondary">
                    {isSuccess && b03 ? `${b03.width}×${b03.height}` : 'Verifying raster…'}
                  </span>
                </div>

                {/* 3. Band Check: B04 */}
                <div className="flex items-center justify-between p-2.5 rounded-xl glass-panel border border-theme text-xs">
                  <div className="flex items-center gap-2.5">
                    {isSuccess && b04 ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    ) : isFailed && !b04 ? (
                      <AlertCircle size={15} className="text-red-600 shrink-0" />
                    ) : (
                      <Loader2 size={14} className="text-accent animate-spin shrink-0" />
                    )}
                    <span className="font-semibold text-secondary">B04 Red (665 nm)</span>
                  </div>
                  <span className="font-mono text-[11px] text-secondary">
                    {isSuccess && b04 ? `${b04.width}×${b04.height}` : 'Verifying raster…'}
                  </span>
                </div>

                {/* 4. Band Check: B08 */}
                <div className="flex items-center justify-between p-2.5 rounded-xl glass-panel border border-theme text-xs">
                  <div className="flex items-center gap-2.5">
                    {isSuccess && b08 ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    ) : isFailed && !b08 ? (
                      <AlertCircle size={15} className="text-red-600 shrink-0" />
                    ) : (
                      <Loader2 size={14} className="text-accent animate-spin shrink-0" />
                    )}
                    <span className="font-semibold text-secondary">B08 NIR (842 nm)</span>
                  </div>
                  <span className="font-mono text-[11px] text-secondary">
                    {isSuccess && b08 ? `${b08.width}×${b08.height}` : 'Verifying raster…'}
                  </span>
                </div>

                {/* 5. Spatial Consistency Checks (Dimensions, Resolution, CRS) */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg glass-panel border border-theme">
                    <div className="text-[10px] text-muted-foreground">Dimensions</div>
                    <div className="text-secondary font-semibold flex items-center gap-1 mt-0.5">
                      {isSuccess ? (
                        <>
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>{common ? `${common.width}×${common.height}` : 'Aligned'}</span>
                        </>
                      ) : isFailed ? (
                        <>
                          <AlertCircle size={11} className="text-red-600" />
                          <span>Mismatch</span>
                        </>
                      ) : (
                        <span className="text-secondary">Checking…</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg glass-panel border border-theme">
                    <div className="text-[10px] text-muted-foreground">Resolution</div>
                    <div className="text-secondary font-semibold flex items-center gap-1 mt-0.5">
                      {isSuccess ? (
                        <>
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>{common?.nativeResolution || 10.0}m GSD</span>
                        </>
                      ) : isFailed ? (
                        <span className="text-secondary">N/A</span>
                      ) : (
                        <span className="text-secondary">Checking…</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg glass-panel border border-theme">
                    <div className="text-[10px] text-muted-foreground">CRS</div>
                    <div className="text-secondary font-semibold flex items-center gap-1 mt-0.5 truncate">
                      {isSuccess ? (
                        <>
                          <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{common?.crs || 'EPSG:32644'}</span>
                        </>
                      ) : isFailed ? (
                        <>
                          <AlertCircle size={11} className="text-red-600 shrink-0" />
                          <span>Mismatch</span>
                        </>
                      ) : (
                        <span className="text-secondary">Parsing tags…</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg glass-panel border border-theme">
                    <div className="text-[10px] text-muted-foreground">Spatial Alignment</div>
                    <div className="text-secondary font-semibold flex items-center gap-1 mt-0.5 truncate">
                      {isSuccess ? (
                        <>
                          <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          <span className="truncate">Pixel-Aligned</span>
                        </>
                      ) : isFailed ? (
                        <>
                          <AlertCircle size={11} className="text-red-600 shrink-0" />
                          <span>Misaligned</span>
                        </>
                      ) : (
                        <span className="text-secondary">Checking…</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Footer Banner */}
            <div className="pt-3 border-t border-theme">
              {isScanning && (
                <div className="flex items-center gap-2.5 text-xs text-cyan-700 font-mono">
                  <Loader2 size={14} className="animate-spin text-accent shrink-0" />
                  <span>Scanning raster headers and validating spatial compatibility…</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.25)] anim-fade-in flex items-center gap-2.5">
                  <Sparkles size={16} className="text-emerald-700 shrink-0 animate-pulse" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-emerald-700 tracking-wide uppercase">
                      SATELLITE IMAGERY VALIDATED
                    </div>
                    <div className="text-[10px] text-emerald-200/80 font-mono mt-0.5">
                      All 4 bands verified & spatial compatibility confirmed.
                    </div>
                  </div>
                </div>
              )}

              {isFailed && (
                <div className="space-y-3 anim-fade-in">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-red-600">
                      <AlertCircle size={14} />
                      <span>Validation Failed</span>
                    </div>
                    <p className="text-[11px] text-red-700/90 leading-relaxed font-mono">
                      {error || 'The uploaded bands failed compatibility checks.'}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl glass-panel hover:glass-panel border border-theme text-secondary text-xs font-semibold transition-all"
                    >
                      Dismiss & Adjust Bands
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
