import React from 'react';
import { Link } from 'react-router-dom';
import { Satellite, Github, ExternalLink, Mail, Award, Globe, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative glass-panel border-t border-border/40 text-muted-foreground overflow-hidden">
      {/* Top primary gradient highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand & Mission (2 cols) */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.2)] group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] transition-all duration-300">
                <Satellite size={24} className="text-primary transform group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tracking-tight">TerraSR</div>
                <div className="text-xs text-primary font-medium tracking-wide uppercase mt-0.5">Multispectral Intelligence</div>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              AI-Powered Multispectral Super Resolution platform transforming 10m Sentinel-2
              satellite imagery into sub-4m spatial intelligence for defense, agriculture, and environmental observation.
            </p>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50 text-xs font-mono text-muted-foreground shadow-sm">
              <Award size={16} className="text-primary" />
              <span>Smart India Hackathon • NTRO PS-26142</span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest font-mono mb-5">
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/platform" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>Enhance Imagery</span>
                  <ArrowUpRight size={14} className="opacity-70" />
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-muted-foreground hover:text-primary transition-colors">
                  Dual-Layer Compare
                </Link>
              </li>
              <li>
                <Link to="/analysis" className="text-muted-foreground hover:text-primary transition-colors">
                  Spectral Analytics
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors">
                  Sample Gallery
                </Link>
              </li>
              <li>
                <Link to="/use-cases" className="text-muted-foreground hover:text-primary transition-colors">
                  Real-World Use Cases
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Technology */}
          <div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest font-mono mb-5">
              Technology
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">SwinIR Transformer</span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">Sentinel-2 (10m L2A)</span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">React Three Fiber</span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">WebGL & Blender</span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">GeoTIFF & EPSG:32644</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Project & Links */}
          <div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest font-mono mb-5">
              Connect
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Github size={16} />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@terrasr.ai"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail size={16} />
                  <span>Project Contact</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground opacity-80">
          <div>
            © 2026 <strong className="text-foreground">TerraSR</strong>. AI-Powered Multispectral Super Resolution.
          </div>
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-[10px] sm:text-[11px] text-muted-foreground">
            <span>FastAPI Backend</span>
            <span className="opacity-30">•</span>
            <span>PyTorch Deep Learning</span>
            <span className="opacity-30">•</span>
            <span>Three.js WebGL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
