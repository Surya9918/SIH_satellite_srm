import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

export const Challenge: React.FC = () => {
  const [selectedAspect, setSelectedAspect] = useState<'urban' | 'agri' | 'disaster'>('agri');

  const aspects = {
    agri: {
      title: 'Precision Agriculture',
      lr: 'Mixed boundary pixels blur crop rows, masking early disease and irrigation stress.',
      sr: 'Sub-4m reconstruction separates individual crop parcels and micro-drainage channels.',
    },
    urban: {
      title: 'Urban Cadastre & Planning',
      lr: 'Buildings blend into roadways; individual structures are unresolved at 10m GSD.',
      sr: 'Clear building footprints, distinct arterial roads, and impervious surface detection.',
    },
    disaster: {
      title: 'Emergency Flood Mapping',
      lr: 'Coarse water-land boundaries impede accurate infrastructure damage estimation.',
      sr: 'Exact flood inundation perimeters down to property lines for targeted relief.',
    },
  };

  return (
    <section id="challenge" className="relative py-24 glass-panel border-t border-border/40 overflow-hidden scroll-mt-[var(--nav-height)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-foreground">
            The spatial resolution bottleneck
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sentinel-2 offers unprecedented 5-day global revisit times, but at 10m GSD, critical structural details and fine boundaries remain unresolved. We break through this limitation.
          </p>
        </div>

        {/* Interactive Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Card 1: Low Resolution */}
          <Card className="group relative overflow-hidden border-border/50 glass-panel transition-all duration-300 hover:border-border">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Low resolution</h3>
                    <p className="text-sm text-muted-foreground font-mono mt-0.5">10m GSD (Sentinel-2)</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-md bg-destructive/10 text-destructive font-mono text-xs font-semibold uppercase tracking-wider">
                  Original 1×
                </span>
              </div>

              {/* Visual Display */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 mb-8 bg-muted/20">
                <img
                  src="/sample-satellite/lr.png"
                  alt="Low Resolution Satellite Input"
                  className="w-full h-full object-cover filter blur-[0.6px] contrast-95 scale-105"
                />
                <div className="absolute inset-0 bg-destructive/10 pointer-events-none mix-blend-overlay" />
                <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--foreground)/0.1)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg glass-panel text-xs font-mono text-destructive font-medium border border-destructive/20">
                  1 Pixel = 100 m²
                </div>
              </div>

              {/* Constraints List */}
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground font-medium">Spectral Bleeding:</strong> Small features blend with surrounding terrain.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground font-medium">Pixelated Edges:</strong> Road curves and field perimeters become staircase artifacts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground font-medium">Limited Analytics:</strong> Critical geospatial algorithms fail to classify sub-10m structures.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Enhanced Resolution */}
          <Card className="group relative overflow-hidden border-primary/30 bg-primary/5 backdrop-blur-sm transition-all duration-500 hover:border-primary/60 hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-500" />
            
            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Enhanced Resolution</h3>
                    <p className="text-sm text-primary opacity-80 font-mono mt-0.5">Sub-4m Reconstructed (SwinIR)</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
                  Enhanced 3×
                </span>
              </div>

              {/* Visual Display */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-primary/30 mb-8 bg-muted/20 shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
                <img
                  src="/sample-satellite/sr.png"
                  alt="Enhanced Resolution Super-Resolved Imagery"
                  className="w-full h-full object-cover scale-105 transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg glass-panel text-xs font-mono text-primary font-medium border border-primary/30">
                  1 Pixel = 11.1 m² (9× Density)
                </div>
              </div>

              {/* Super-Resolution Advantages */}
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/80 mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground font-medium">True Sub-Pixel Recovery:</strong> Deep transformer self-attention reconstructs sub-10m textures.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/80 mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground font-medium">Radiometric Consistency:</strong> Preserves multispectral reflectance and NDVI fidelity.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/80 mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground font-medium">Commercial-Grade Detail:</strong> Near-commercial geospatial analytics without proprietary costs.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Domain Context Selector */}
        <Card className="bg-card/40 border-border/40 backdrop-blur-md overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                Impact on Decision-Making
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(['agri', 'urban', 'disaster'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedAspect(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedAspect === key
                        ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.15)]'
                        : 'bg-background/40 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                    }`}
                  >
                    {aspects[key].title}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-border/30">
              <div className="bg-destructive/5 rounded-xl p-5 border border-destructive/10">
                <div className="text-xs font-mono text-destructive uppercase tracking-wider mb-3 flex items-center gap-2 font-semibold">
                  <AlertCircle size={14} /> Bottleneck at 10m
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {aspects[selectedAspect].lr}
                </p>
              </div>
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                <div className="text-xs font-mono text-primary uppercase tracking-wider mb-3 flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={14} /> TerraSR Solution at 3.3m
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {aspects[selectedAspect].sr}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
