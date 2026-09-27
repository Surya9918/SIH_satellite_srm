import React from 'react';
import {
  CheckCircle2, ArrowLeft, Zap, Globe, Layers,
  FileCheck, ShieldCheck, MapPin, Gauge
} from 'lucide-react';
import { FourBandValidationResult } from '../../types/satellite';

interface BandMetadataPanelProps {
  validationResult: FourBandValidationResult;
  onBack: () => void;
  onRunInference: () => void;
  isRunning: boolean;
}

export const BandMetadataPanel: React.FC<BandMetadataPanelProps> = ({
  validationResult,
  onBack,
  onRunInference,
  isRunning,
}) => {
  const meta = validationResult.metadata;
  const common = meta?.common;

  const bandList = [
    { key: 'b02', label: 'Band 1: B02', title: 'Blue (490 nm)', color: 'text-accent', border: 'border-blue-500/30', bg: 'bg-accent/10' },
    { key: 'b03', label: 'Band 2: B03', title: 'Green (560 nm)', color: 'text-emerald-600', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    { key: 'b04', label: 'Band 3: B04', title: 'Red (665 nm)', color: 'text-red-600', border: 'border-red-500/30', bg: 'bg-red-500/10' },
    { key: 'b08', label: 'Band 4: B08', title: 'NIR (842 nm)', color: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Validation Success Hero Banner ── */}
      <div className="rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">
                Spatial Alignment & Band Validation Passed
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-700 font-semibold border border-emerald-500/30">
                Pixel-Aligned
              </span>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              All 4 spectral bands are verified. Matching dimensions: {common?.width} × {common?.height} px · {common?.nativeResolution ?? 10}m native GSD · {common?.crs}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent bg-accent/20 border border-cyan-500/25 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Gauge size={13} /> Target: {(common?.targetResolution ?? 3.33).toFixed(2)}m GSD (3× SR)
          </span>
        </div>
      </div>

      {/* ── 4-Band Metadata Grid Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bandList.map(({ key, label, title, color, border, bg }) => {
          const bMeta = meta?.[key];
          if (!bMeta) return null;

          return (
            <div
              key={key}
              className={`glass rounded-xl p-4 border ${border} bg-surface/70 space-y-3 flex flex-col justify-between`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-theme pb-2.5 mb-3">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${color}`}>
                    {label}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${border} ${bg} ${color}`}>
                    {title}
                  </span>
                </div>

                {/* File info */}
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Filename</span>
                    <span className="text-secondary text-[11px] truncate block font-medium" title={bMeta.filename}>
                      {bMeta.filename}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Dimensions</span>
                      <span className="text-secondary font-semibold">
                        {bMeta.width} × {bMeta.height}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Resolution</span>
                      <span className="text-secondary font-semibold">
                        {bMeta.nativeResolution}m GSD
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] text-muted-foreground block">CRS / Projection</span>
                    <span className="text-secondary text-[11px] truncate block" title={bMeta.crs}>
                      {bMeta.crs}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] text-muted-foreground block">File Size</span>
                    <span className="text-secondary">
                      {(bMeta.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-2 border-t border-theme flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">Decoded</span>
                <span className="text-emerald-600 inline-flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={11} /> Verified
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Geographic Extent & Transform Overview ── */}
      {common && (
        <div className="glass rounded-xl p-5 border border-theme space-y-3 bg-surface/40">
          <div className="flex items-center gap-2 text-sm font-bold text-primary font-mono">
            <Globe size={16} className="text-accent" />
            <span>Geospatial Coverage & Spatial Transform</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg glass-panel border border-theme">
              <span className="text-[10px] text-muted-foreground block">West (Min Lon)</span>
              <span className="text-secondary font-semibold">{common.bounds?.minLon}° E</span>
            </div>
            <div className="p-3 rounded-lg glass-panel border border-theme">
              <span className="text-[10px] text-muted-foreground block">East (Max Lon)</span>
              <span className="text-secondary font-semibold">{common.bounds?.maxLon}° E</span>
            </div>
            <div className="p-3 rounded-lg glass-panel border border-theme">
              <span className="text-[10px] text-muted-foreground block">South (Min Lat)</span>
              <span className="text-secondary font-semibold">{common.bounds?.minLat}° N</span>
            </div>
            <div className="p-3 rounded-lg glass-panel border border-theme">
              <span className="text-[10px] text-muted-foreground block">North (Max Lat)</span>
              <span className="text-secondary font-semibold">{common.bounds?.maxLat}° N</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Actions: Back & Run Super Resolution ── */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-theme">
        <button
          type="button"
          onClick={onBack}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel hover:glass-panel border border-theme text-secondary hover:text-primary text-xs font-semibold transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Upload</span>
        </button>

        <button
          type="button"
          onClick={onRunInference}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 text-primary font-bold text-sm shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:shadow-[0_0_35px_rgba(0,212,255,0.7)] transition-all cursor-pointer disabled:opacity-50"
        >
          <Zap size={16} />
          <span>Run Super Resolution</span>
        </button>
      </div>
    </div>
  );
};
