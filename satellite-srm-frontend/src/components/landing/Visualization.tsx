import React from 'react';
import { Box, Monitor, Code2 } from 'lucide-react';
import { EarthScene, EarthVisualFallback } from './EarthScene';
import { ErrorBoundary } from '../scene/ErrorBoundary';
import { Card, CardContent } from '../ui/Card';

export const Visualization: React.FC = () => {
  return (
    <section
      id="visualization"
      className="relative py-24 glass-panel border-t border-border/40 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6">
            From pixels to a spatial experience
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Enhanced satellite imagery combined with 3D visualization technologies for immersive geographic interpretation.
          </p>

          {/* Technology Highlight Pill */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/60 shadow-lg">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Powered by
            </span>
            <span className="font-mono text-sm font-semibold text-primary">
              Blender + WebGL + React
            </span>
          </div>
        </div>

        {/* 3D Visualization Grid Showcase */}
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Interactive 3D Spatial Scene (7 cols) */}
          <Card className="lg:col-span-7 relative overflow-hidden bg-card/40 border-border/50 backdrop-blur-sm shadow-[0_0_30px_hsl(var(--primary)/0.05)]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-mono text-primary font-semibold tracking-wider">
                    Spatial Viewport • React Three Fiber
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Draco glTF Ready
                </span>
              </div>

              {/* EarthScene wrapped in ErrorBoundary */}
              <div className="w-full h-[400px] sm:h-[500px] relative glass-panel">
                {/* Subtle Grid behind 3D Canvas */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
                
                <ErrorBoundary fallback={<EarthVisualFallback message="Spatial Viewport (Safe Fallback Mode)" />}>
                  <EarthScene
                    interactive={true}
                    enableZoom={true}
                    autoRotateSpeed={0.5}
                    className="w-full h-full relative z-10"
                    showHint={false}
                  />
                </ErrorBoundary>
              </div>

              <div className="px-6 py-3 bg-background/80 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Axial Tilt: 23.4°</span>
                <span className="text-primary font-medium">GLB Drop-In: Active</span>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Architectural Pillars (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Pillar 1: Blender */}
            <Card className="bg-card/30 hover:bg-card/60 border-border/40 hover:border-border transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
                    <Box size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Blender 3D Modeling</h3>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Terrain & Assets</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Design custom planetary bodies, digital elevation models (DEMs), and satellite orbits with precision PBR shaders, exported cleanly as compressed glTF/GLB binaries.
                </p>
              </CardContent>
            </Card>

            {/* Pillar 2: WebGL */}
            <Card className="bg-card/30 hover:bg-card/60 border-border/40 hover:border-border transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                    <Monitor size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">WebGL & Three.js</h3>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Hardware Engine</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Direct GPU pipeline executes custom atmospheric Fresnel shaders and orbital trigonometry at a locked 60 frames per second without external plugins.
                </p>
              </CardContent>
            </Card>

            {/* Pillar 3: React Three Fiber */}
            <Card className="bg-card/30 hover:bg-card/60 border-border/40 hover:border-border transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-inner">
                    <Code2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">React Three Fiber</h3>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Declarative 3D</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Combines React state management with 3D scene graphs, enabling seamless hot-swapping between procedural fallback models and custom Blender GLB assets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
