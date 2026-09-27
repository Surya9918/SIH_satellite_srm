import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronsLeftRight, Layers, Eye, Diff, Download,
  MapPin, Clock, Cpu, Info, ArrowLeft
} from 'lucide-react';
import { SatelliteComparison } from '../components/ui/SatelliteComparison';
import { InlineMetric } from '../components/ui/MetricCard';
import { useSrmStore, DEMO_JOB } from '../store/useSrmStore';
import { resolveApiUrl } from '../api/client';

type CompareMode = 'slider' | 'split' | 'opacity' | 'difference';

const COMPARE_MODES: { id: CompareMode; label: string; icon: React.ReactNode }[] = [
  { id: 'slider', label: 'Swipe', icon: <ChevronsLeftRight size={15} /> },
  { id: 'split', label: 'Split', icon: <Layers size={15} /> },
  { id: 'opacity', label: 'Opacity', icon: <Eye size={15} /> },
  { id: 'difference', label: 'Difference', icon: <Diff size={15} /> },
];

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeJob, activeJobs, selectedJobId, setSelectedJobId, setActiveJob } = useSrmStore();
  const job = activeJob ?? DEMO_JOB;

  const [mode, setMode] = useState<CompareMode>('slider');
  const [opacity, setOpacity] = useState(60);

  const lrUrl = resolveApiUrl(job.outputs?.lrPreviewUrl) || '/sample-satellite/lr.png';
  const srUrl = resolveApiUrl(job.outputs?.srPreviewUrl) || '/sample-satellite/sr.png';
  const meta = job.metadata;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = srUrl;
    a.download = `SRM_Enhanced_${meta?.filename || 'output'}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-none">Compare Results</h1>
            <p className="text-xs text-muted-foreground mt-1">Before / after deep learning enhancement</p>
          </div>

          {activeJobs.length > 1 && (
            <div className="flex items-center gap-1.5 ml-2 sm:ml-6 bg-background/50 p-1.5 rounded-xl border border-border/50">
              <span className="text-[11px] font-semibold text-muted-foreground px-2 uppercase tracking-widest">Batch:</span>
              {activeJobs.map((j, idx) => (
                <button
                  key={j.jobId}
                  onClick={() => {
                    setSelectedJobId(j.jobId);
                    setActiveJob(j);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    (selectedJobId || job.jobId) === j.jobId
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_hsl(var(--primary)/0.2)] font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                  title={j.metadata?.filename}
                >
                  #{idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            <button onClick={handleDownload} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
              <Download size={16} />
              Download Enhanced
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main viewer */}
          <div className="lg:col-span-3 space-y-5">
            {/* Mode selector */}
            <div className="flex items-center gap-1.5 p-1.5 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl w-fit shadow-lg">
              {COMPARE_MODES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    mode === id
                      ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Comparison view */}
            {mode === 'slider' && (
              <SatelliteComparison
                beforeUrl={srUrl}
                afterUrl={lrUrl}
                beforeLabel={`SRM Enhanced · <${meta?.targetResolution?.toFixed(1) || '3.3'}m`}
                afterLabel={`Sentinel-2 · ${meta?.nativeResolution?.toFixed(0) || '10'}m`}
                ndviUrl={resolveApiUrl(job.outputs?.ndviPreviewUrl)}
                uncertaintyUrl={resolveApiUrl(job.outputs?.uncertaintyPreviewUrl)}
                height="560px"
                initialPosition={50}
                bounds={meta?.bounds}
                center={meta?.center}
                crs={meta?.crs}
              />
            )}

            {mode === 'split' && (
              <div className="grid grid-cols-2 gap-4 rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative rounded-xl overflow-hidden border border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                  <img src={srUrl} alt="Enhanced" className="w-full object-cover" style={{ height: '600px' }} />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/30 text-[11px] font-mono text-primary font-bold shadow-lg">
                    SRM Enhanced · &lt;{meta?.targetResolution?.toFixed(1) || '3.3'}m
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-border/50 glass-panel">
                  <img src={lrUrl} alt="Original" className="w-full object-cover" style={{ height: '600px' }} />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg glass-panel border border-border/50 text-[11px] font-mono text-muted-foreground shadow-lg">
                    Sentinel-2 · {meta?.nativeResolution?.toFixed(0) || '10'}m
                  </div>
                </div>
              </div>
            )}

            {mode === 'opacity' && (
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl" style={{ height: '600px' }}>
                <img src={lrUrl} alt="Original" className="absolute inset-0 w-full h-full object-cover" />
                <img
                  src={srUrl}
                  alt="Enhanced"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75"
                  style={{ opacity: opacity / 100 }}
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-card/80 backdrop-blur-xl rounded-xl p-4 border border-border/50 shadow-lg max-w-xl mx-auto">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="text-xs font-mono font-medium text-muted-foreground w-16">Original</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="flex-1 accent-primary cursor-ew-resize"
                      />
                      <span className="text-xs font-mono font-bold text-primary w-24 text-right">{opacity}% Enhanced</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg glass-panel border border-border/50 text-[11px] font-mono text-foreground shadow-lg">Opacity Mode</div>
              </div>
            )}

            {mode === 'difference' && (
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl" style={{ height: '600px' }}>
                <img
                  src={job.outputs?.uncertaintyPreviewUrl ?? '/sample-satellite/uncertainty.png'}
                  alt="Difference/Uncertainty"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ mixBlendMode: 'screen' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-purple-500/20 backdrop-blur-md border border-purple-500/40 rounded-lg text-purple-400 text-[11px] font-mono font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  Uncertainty / Confidence Map
                </div>
                <div className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto">
                  <div className="bg-card/80 backdrop-blur-xl rounded-xl px-4 py-3 border border-border/50 shadow-lg">
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Info size={14} className="text-purple-400" />
                      Brighter regions indicate higher model uncertainty (Monte Carlo Dropout)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel — Metadata */}
          <div className="lg:col-span-1 space-y-4">
            {/* Input info */}
            <div className="bg-white/75 dark:bg-slate-950/65 backdrop-blur-xl rounded-2xl p-6 border border-slate-900/10 dark:border-white/15 shadow-lg">
              <div className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest mb-5">Image Metadata</div>
              <div className="space-y-3">
                <InlineMetric label="Input Resolution" value="10m" color="default" />
                <InlineMetric label="Output Resolution" value={`<${meta?.targetResolution?.toFixed(1) || '3.3'}m`} color="cyan" />
                <InlineMetric label="Scale Factor" value={`${job.metrics?.scale_factor ?? 3}×`} color="cyan" />
                <InlineMetric label="Width" value={`${meta?.width ?? 512}px`} />
                <InlineMetric label="Height" value={`${meta?.height ?? 512}px`} />
                <InlineMetric label="Bands" value="4 (B02-08)" />
                <InlineMetric label="CRS" value={meta?.crs ?? 'EPSG:32644'} />
                <InlineMetric label="Sensor" value="Sentinel-2 MSI" />
              </div>
            </div>

            {/* Model info */}
            <div className="bg-white/75 dark:bg-slate-950/65 backdrop-blur-xl rounded-2xl p-6 border border-slate-900/10 dark:border-white/15 shadow-lg">
              <div className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest mb-5">Processing Info</div>
              <div className="space-y-3">
                <InlineMetric label="Model" value={job.telemetry.model.split(' ')[0]} color="cyan" />
                <InlineMetric label="Device" value={job.telemetry.device.split('/')[0].trim()} />
                <InlineMetric label="Tiles" value={job.telemetry.tileProgress} />
                <InlineMetric label="Elapsed" value={`${job.telemetry.elapsedSeconds}s`} />
                <InlineMetric label="Memory" value={job.telemetry.memoryAllocated} />
                <InlineMetric label="Status" value={job.status} color="emerald" />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white/75 dark:bg-slate-950/65 backdrop-blur-xl rounded-2xl p-6 border border-slate-900/10 dark:border-white/15 shadow-lg">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-primary uppercase tracking-widest mb-4">
                <MapPin size={14} />
                Location
              </div>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Lat</span>
                  <span className="text-primary font-bold">{meta?.center?.[0]?.toFixed(4) ?? '17.4106'}°N</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Lon</span>
                  <span className="text-primary font-bold">{meta?.center?.[1]?.toFixed(4) ?? '78.4776'}°E</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Acquired</span>
                  <span className="text-primary font-bold">{meta?.acquisitionDate ?? '2026-05-15'}</span>
                </div>
              </div>
            </div>

            {/* Download */}
            <button onClick={handleDownload} className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-colors">
              <Download size={16} />
              Download GeoTIFF
            </button>

            <button
              onClick={() => navigate('/analysis')}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-card/60 hover:bg-card/90 backdrop-blur-md border border-border/50 text-foreground text-sm font-semibold rounded-xl transition-colors"
            >
              View Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
