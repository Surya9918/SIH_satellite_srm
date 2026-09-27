import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { EarthScene, EarthVisualFallback } from './EarthScene';
import { ErrorBoundary } from '../scene/ErrorBoundary';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

gsap.registerPlugin(useGSAP);

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  const scrollToHowItWorks = () => {
    const el = document.querySelector('#challenge');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
      .from('.hero-headline', { opacity: 0, y: 30, duration: 0.8 }, '-=0.4')
      .from('.hero-subtext', { opacity: 0, y: 20, duration: 0.7 }, '-=0.6')
      .from('.hero-actions', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
      .from('.hero-social', { opacity: 0, y: 15, duration: 0.6 }, '-=0.4')
      .from('.hero-earth', { opacity: 0, scale: 0.9, duration: 1.2, ease: 'power2.out' }, '-=1.0');
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen w-full flex items-center pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden text-foreground"
    >
      {/* Deep Space Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-6rem)]">

          {/* Left: Copy */}
          <div className="flex flex-col justify-center text-left pt-6 lg:pt-0 lg:pr-8 glass-panel p-8 sm:p-10 rounded-[2rem]">
            <div className="hero-badge mb-6">
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-secondary/50 text-foreground border border-border/50">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  TerraSR v2.0 is Live
                </span>
              </Badge>
            </div>

            <h1 className="hero-headline text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Transform 10m imagery into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">sub-4m insights</span>.
            </h1>

            <p className="hero-subtext text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10">
              Stop settling for low-resolution satellite data. Our AI-powered super-resolution pipeline reveals unprecedented clarity for critical Earth observation analysis.
            </p>

            <div className="hero-actions flex flex-wrap items-center gap-4 mb-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={scrollToHowItWorks}
                className="h-14 px-8 text-base font-semibold bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted transition-colors text-foreground"
              >
                See How It Works
              </Button>
            </div>

            {/* Tech Stack / Polish */}
            <div className="hero-social flex items-center gap-6 pt-6 border-t border-border/40">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest font-bold">Powered By</span>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-md border border-border/50 text-sm font-medium hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <span className="text-blue-600 dark:text-blue-400">PyTorch</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-md border border-border/50 text-sm font-medium hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <span className="text-teal-600 dark:text-teal-400">FastAPI</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-md border border-border/50 text-sm font-medium hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <span className="text-sky-600 dark:text-sky-400">React</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Earth Visual */}
          <div className="hero-earth relative h-[400px] sm:h-[500px] lg:h-[700px] flex items-center justify-center">
            {/* Soft backdrop for Earth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-[80px] -z-10" />
            <div className="w-full h-full max-w-[850px] lg:w-[150%] lg:max-w-none mx-auto lg:ml-0 lg:-mr-[50%]">
              <ErrorBoundary fallback={<EarthVisualFallback />}>
                <EarthScene interactive={true} showHint={true} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={scrollToHowItWorks}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-pulse-slow"
        >
          <span className="text-xs tracking-widest uppercase font-medium">Scroll</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </section>
  );
};
