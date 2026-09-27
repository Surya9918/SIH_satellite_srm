import React from 'react';
import { Link } from 'react-router-dom';
import { Satellite, Github, ExternalLink, Mail } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Platform', to: '/platform' },
  { label: 'Compare', to: '/compare' },
  { label: 'Analysis', to: '/analysis' },
  { label: 'Use Cases', to: '/use-cases' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
];

const TECH_TAGS = ['SwinIR', 'Sentinel-2', 'SRGAN', 'PyTorch', 'FastAPI', 'GeoTIFF', 'EPSG:32644'];

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-slate-900/10 dark:border-white/15 bg-white/60 dark:bg-slate-950/70 backdrop-blur-xl mt-auto transition-colors duration-300">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
                <Satellite size={16} className="text-white" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-primary">TerraSR</div>
                <div className="text-[11px] text-secondary">Satellite Super-Resolution</div>
              </div>
            </div>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              Deep learning super-resolution for Sentinel-2 multispectral imagery.
              Transforms 10m imagery into sub-4m analysis-ready maps.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/20 transition-colors duration-150"
                title="GitHub"
              >
                <Github size={14} />
              </a>
              <a
                href="mailto:srm@example.com"
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/20 transition-colors duration-150"
                title="Email"
              >
                <Mail size={14} />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/20 transition-colors duration-150"
                title="Documentation"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-[13px] font-semibold text-primary mb-3">Navigation</div>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-secondary hover:text-primary transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology */}
          <div>
            <div className="text-[13px] font-semibold text-primary mb-3">Technology</div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {TECH_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[11px] font-mono font-medium text-secondary bg-slate-500/10 dark:bg-slate-500/20 border border-slate-900/5 dark:border-white/10 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-secondary">Input</span>
                <span className="font-mono text-primary">10m GSD</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-secondary">Output</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-400">&lt;4m GSD</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-secondary">Scale</span>
                <span className="font-mono text-primary">3×</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-secondary">Sensor</span>
                <span className="font-mono text-primary">Sentinel-2 MSI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-900/10 dark:border-white/15 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[12px] text-muted-foreground">
            Deep Learning Based Super Resolution Mapping · NTRO Problem Statement 26142
          </div>
          <span className="text-[12px] text-muted-foreground font-mono">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
