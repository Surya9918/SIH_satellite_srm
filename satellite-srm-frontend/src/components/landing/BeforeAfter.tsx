import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, SlidersHorizontal, Maximize2, MoveHorizontal, Check, RefreshCw } from 'lucide-react';

export const BeforeAfter: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(clamped);
  }, []);

  const handlePointerDown = () => setIsDragging(true);

  useEffect(() => {
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleMove(clientX);
    };

    const onPointerUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove);
      window.addEventListener('touchend', onPointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDragging, handleMove]);

  return (
    <section
      id="before-after"
      className="relative py-24 glass-panel border-t border-border/40 overflow-hidden select-none"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6">
            Interactive image comparison
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Drag the slider horizontally to inspect how SwinIR-SRM eliminates pixelation and recovers sub-pixel spatial boundaries.
          </p>
        </div>

        {/* ── INTERACTIVE SLIDER CONTAINER ── */}
        <div className="relative max-w-5xl mx-auto shadow-[0_0_40px_hsl(var(--primary)/0.1)] rounded-xl border border-border/50">
          {/* Metrics Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 rounded-t-xl bg-card/60 backdrop-blur-md border-b border-border/50 text-[11px] font-mono text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground opacity-80">Dataset: Sentinel-2 L2A</span>
              <span className="hidden sm:inline opacity-50">•</span>
              <span className="text-primary font-medium tracking-wide">EPSG:32644 (UTM Zone 44N)</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">
              <span>PSNR: +4.2 dB</span>
              <span className="text-border">•</span>
              <span>SSIM: 0.912</span>
            </div>
          </div>

          {/* Interactive Split View Screen */}
          <div
            ref={containerRef}
            className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-b-xl overflow-hidden cursor-ew-resize bg-muted/20"
            onClick={(e) => handleMove(e.clientX)}
          >
            {/* 1. Super-Resolved Layer (Full Width Base Layer - Right Side) */}
            <img
              src="/sample-satellite/sr.png"
              alt="Super-Resolved Satellite Imagery"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* 2. Original Low-Res Layer (Clipped to Slider Percentage - Left Side) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none border-r border-primary/50 shadow-[5px_0_15px_rgba(0,0,0,0.5)]"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src="/sample-satellite/lr.png"
                alt="Original Low-Res Satellite Imagery"
                className="absolute inset-0 w-full h-full object-cover max-w-none filter blur-[0.4px]"
                style={{ width: containerRef.current?.clientWidth || '100%' }}
              />
              {/* Subtle pixel grid on LR side to emphasize native 10m pixel discretization */}
              <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--foreground)/0.1)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            </div>

            {/* Floating Label: Left (Original LR) */}
            <div
              className="absolute top-6 left-6 z-20 pointer-events-none transition-opacity duration-300"
              style={{ opacity: sliderPos < 15 ? 0 : 1 }}
            >
              <div className="px-4 py-2 rounded-lg glass-panel bg-background/80 backdrop-blur-md border border-border text-[11px] font-mono shadow-lg">
                <span className="text-destructive font-bold tracking-widest mr-1.5">LEFT:</span>
                <span className="text-foreground font-medium">Original (10m)</span>
              </div>
            </div>

            {/* Floating Label: Right (Super-Resolved SR) */}
            <div
              className="absolute top-6 right-6 z-20 pointer-events-none transition-opacity duration-300"
              style={{ opacity: sliderPos > 85 ? 0 : 1 }}
            >
              <div className="px-4 py-2 rounded-lg glass-panel bg-background/80 backdrop-blur-md border border-border text-[11px] font-mono shadow-lg">
                <span className="text-primary font-bold tracking-widest mr-1.5">RIGHT:</span>
                <span className="text-foreground font-medium">Super-Resolved (3.3m)</span>
              </div>
            </div>

            {/* Solid Vertical Slider Line */}
            <div
              className="absolute top-0 bottom-0 z-30 w-[2px] bg-primary shadow-[0_0_10px_hsl(var(--primary)/1)] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Center Drag Handle Button */}
              <div
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-panel border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)] cursor-grab active:cursor-grabbing hover:scale-110 transition-transform pointer-events-auto"
              >
                <MoveHorizontal size={18} />
              </div>
            </div>
          </div>

          {/* Quick Jump Split Preset Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest font-semibold">Jump to View:</span>
            {[
              { label: 'Original (10m)', val: 95 },
              { label: '50/50 Split', val: 50 },
              { label: 'Super-Resolved (3m)', val: 5 },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => setSliderPos(btn.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-300 font-medium ${
                  Math.abs(sliderPos - btn.val) < 8
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)]'
                    : 'glass-panel text-muted-foreground hover:text-foreground border border-border hover:bg-muted'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
