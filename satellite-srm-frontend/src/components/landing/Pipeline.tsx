import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite,
  Sliders,
  Cpu,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  glowColor: string;
  description: string;
  specs: { label: string; value: string }[];
}

export const Pipeline: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(3); // SwinIR active by default

  const stages: Stage[] = [
    {
      id: 1,
      title: 'Satellite Imagery',
      subtitle: 'Raw Acquisition',
      tag: 'Step 01',
      icon: <Satellite size={20} />,
      color: 'bg-primary/10 text-primary',
      borderColor: 'border-primary/30',
      glowColor: 'shadow-[0_0_20px_hsl(var(--primary)/0.2)]',
      description:
        'Acquires 10m Sentinel-2 MSI Level-2A surface reflectance data containing high-precision geospatial coordinate reference systems.',
      specs: [
        { label: 'Ground Sample Distance', value: '10 Meters' },
        { label: 'Data Container', value: 'Cloud-Optimized GeoTIFF' },
        { label: 'Revisit Period', value: '5 Days' },
      ],
    },
    {
      id: 2,
      title: 'Multispectral Processing',
      subtitle: 'Radiometric Calibration',
      tag: 'Step 02',
      icon: <Sliders size={20} />,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/30',
      glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      description:
        'Normalizes dynamic range, harmonizes cross-band co-registration, and isolates spectral channels (Blue, Green, Red, Near-Infrared).',
      specs: [
        { label: 'Bands Processed', value: 'B2, B3, B4, B8' },
        { label: 'Normalization', value: 'Robust Percentile Clipping' },
        { label: 'Registration Error', value: '< 0.15 Pixel' },
      ],
    },
    {
      id: 3,
      title: 'Deep Learning',
      subtitle: 'Cross-Spectral Attention',
      tag: 'Step 03',
      icon: <Cpu size={20} />,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
      description:
        'Deep residual feature extractors learn joint spectral-spatial representations, correlating physical reflectance across all wavebands.',
      specs: [
        { label: 'Architecture', value: 'Deep Residual Network' },
        { label: 'Feature Depth', value: '180 Channels' },
        { label: 'Fusion Scheme', value: 'Cross-Band Attention' },
      ],
    },
    {
      id: 4,
      title: 'SwinIR Super Resolution',
      subtitle: 'Shifted Window Transformer',
      tag: 'Step 04',
      icon: <Sparkles size={20} />,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-500/30',
      glowColor: 'shadow-[0_0_25px_rgba(34,211,238,0.25)]',
      description:
        'Shifted Window Self-Attention calculates long-range contextual relationships, driving 3× sub-pixel feature reconstruction.',
      specs: [
        { label: 'Attention Mechanism', value: 'Shifted Window Self-Attention' },
        { label: 'Window Size', value: '8 × 8 Patches' },
        { label: 'Upsampling Method', value: 'Sub-Pixel PixelShuffle' },
      ],
    },
    {
      id: 5,
      title: 'Enhanced Imagery',
      subtitle: 'Analysis-Ready Intelligence',
      tag: 'Step 05',
      icon: <CheckCircle2 size={20} />,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      description:
        'Produces sub-4m analysis-ready geospatial imagery with pristine spatial crispness while strictly preserving original spectral indices.',
      specs: [
        { label: 'Reconstructed GSD', value: 'Sub-4m (3.3 Meters)' },
        { label: 'PSNR Improvement', value: '+4.2 dB Average' },
        { label: 'Spatial Factor', value: '3× Scale (9× Pixels)' },
      ],
    },
  ];

  return (
    <section id="approach" className="relative py-24 glass-panel border-t border-border/40 overflow-hidden scroll-mt-[var(--nav-height)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-6 px-3 py-1 glass-panel">Deep Learning Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            End-to-end super-resolution pipeline
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From raw multispectral GeoTIFF to sub-4m spatial clarity, using state-of-the-art transformer-based vision architectures.
          </p>
        </div>

        {/* ── DESKTOP HORIZONTAL CONNECTED PIPELINE ── */}
        <div className="relative hidden xl:block mb-16">
          {/* Thin connector line */}
          <div className="absolute top-[38px] left-[10%] right-[10%] h-px bg-border/60 z-0" />

          {/* 5 Sequential Stage Nodes */}
          <div className="grid grid-cols-5 gap-6 relative z-10">
            {stages.map((stage) => {
              const isSelected = activeStage === stage.id;
              return (
                <div
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`cursor-pointer rounded-xl p-5 transition-all duration-300 border backdrop-blur-sm ${
                    isSelected
                      ? `glass-panel border-primary shadow-[0_0_25px_hsl(var(--primary)/0.15)] -translate-y-1.5`
                      : `bg-card/40 border-border/50 hover:bg-card/80 hover:border-border`
                  }`}
                >
                  {/* Top: Icon + Indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isSelected ? `${stage.color} ring-1 ring-current/20 scale-110 shadow-lg` : 'bg-muted opacity-50 text-muted-foreground'
                      }`}
                    >
                      {stage.icon}
                    </div>
                    <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-muted-foreground opacity-60'}`}>
                      {stage.tag}
                    </span>
                  </div>

                  <h3 className={`text-base font-bold mb-1 leading-snug ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stage.title}
                  </h3>
                  <p className="text-xs text-muted-foreground opacity-70 font-mono mb-4">
                    {stage.subtitle}
                  </p>

                  <div className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground opacity-40'}`}>
                    <span>Inspect</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE / TABLET VERTICAL CONNECTED PIPELINE ── */}
        <div className="xl:hidden space-y-4 mb-16 relative pl-4">
          <div className="absolute top-6 bottom-6 left-8 w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 z-0" />
          {stages.map((stage) => {
            const isSelected = activeStage === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`relative z-10 flex items-start gap-5 rounded-2xl p-5 border backdrop-blur-md cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? `glass-panel ${stage.borderColor} ${stage.glowColor}`
                    : 'bg-card/40 border-border/50 hover:bg-card/80'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    isSelected ? `${stage.color} ring-1 ring-current/20 shadow-md` : 'bg-muted opacity-50 text-muted-foreground'
                  }`}
                >
                  {stage.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-base font-bold truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{stage.title}</h3>
                    <span className="font-mono text-[10px] text-muted-foreground opacity-60">{stage.tag}</span>
                  </div>
                  <p className="text-xs text-muted-foreground opacity-80">{stage.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── ACTIVE STAGE DEEP DIVE CARD ── */}
        <AnimatePresence mode="wait">
          {(() => {
            const current = stages.find((s) => s.id === activeStage) || stages[3];
            return (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`overflow-hidden border ${current.borderColor} bg-card/60 backdrop-blur-xl ${current.glowColor} relative`}>
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-current opacity-[0.03] rounded-full blur-[80px]" style={{ color: current.color.split('text-')[1]?.split(' ')[0] || 'var(--primary)' }} />
                  
                  <CardContent className="p-8 sm:p-10">
                    <div className="grid lg:grid-cols-12 gap-10 items-center">
                      {/* Left: Stage summary & details (7 cols) */}
                      <div className="lg:col-span-7">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold mb-6 ${current.color} ${current.borderColor}`}>
                          <Activity size={14} className="animate-pulse" /> {current.tag} Active Focus
                        </div>
                        
                        <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                          {current.title}
                        </h3>
                        <p className="text-muted-foreground text-base leading-relaxed mb-8">
                          {current.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {current.specs.map((spec, i) => (
                            <div
                              key={i}
                              className="rounded-xl bg-background/50 border border-border/50 p-4 hover:border-primary/30 transition-colors"
                            >
                              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                                {spec.label}
                              </div>
                              <div className="text-sm font-bold text-foreground font-mono">
                                {spec.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Technical Diagram Badge (5 cols) */}
                      <div className="lg:col-span-5 rounded-2xl bg-background/80 border border-border/50 p-6 flex flex-col justify-between shadow-inner">
                        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pb-4 border-b border-border/50 mb-5">
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> OPERATIONAL</span>
                          <span className="text-primary font-semibold">LATENCY: ~2.4s / TILE</span>
                        </div>

                        <div className="space-y-4 font-mono text-sm text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground opacity-70">Pipeline Flow:</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-medium">GeoTIFF → Tensors → SR Raster</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground opacity-70">Inference Core:</span>
                            <span className="text-foreground font-medium">PyTorch + CUDA</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground opacity-70">Coordinate Sync:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">EPSG:32644 (UTM)</span>
                          </div>
                        </div>

                        <div className="mt-8 pt-5 border-t border-border/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">SwinIR Deep Model</span>
                          <span className="px-3 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold uppercase tracking-wider">
                            v1.4 Production
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </section>
  );
};
