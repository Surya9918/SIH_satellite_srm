import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Satellite, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

export const CTA: React.FC = () => {
  return (
    <section className="relative py-24 glass-panel border-t border-border/40 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl bg-card/40 border border-border/50 rounded-3xl p-10 sm:p-14 backdrop-blur-md shadow-[0_0_40px_hsl(var(--primary)/0.03)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 relative z-10">
            Ready to explore satellite imagery at higher resolution?
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-10 relative z-10 max-w-xl">
            Enhance Sentinel-2 multispectral imagery from 10m to sub-4m spatial clarity.
            Upload your own GeoTIFF tiles or browse pre-computed benchmarks.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-12 relative z-10">
            <Link to="/platform">
              <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                Launch Platform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link to="/gallery">
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 text-base font-semibold bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted transition-colors"
              >
                Browse Gallery
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-sm text-muted-foreground relative z-10 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Radiometric Integrity</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-primary" />
              <span>GPU-Accelerated</span>
            </div>
            <div className="flex items-center gap-2">
              <Satellite size={18} className="text-cyan-600 dark:text-cyan-400" />
              <span>Cloud-Optimized GeoTIFF</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
