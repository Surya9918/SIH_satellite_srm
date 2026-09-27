import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ChevronRight, Satellite, Zap, Map,
  Globe, Shield, TrendingUp, Building2, Leaf, Flame,
  BarChart2, Play
} from 'lucide-react';

/* ── Animated counter ── */
const Counter: React.FC<{ to: number; suffix?: string; prefix?: string }> = ({ to, suffix = '', prefix = '' }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = to / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        start = to;
        clearInterval(timer);
      }
      setVal(Math.round(start * 10) / 10);
    }, step);
    return () => clearInterval(timer);
  }, [to]);

  return <span ref={ref}>{prefix}{val % 1 === 0 ? val : val.toFixed(1)}{suffix}</span>;
};

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <Satellite size={20} />,
    title: 'Upload',
    desc: 'Upload Sentinel-2 multispectral GeoTIFF imagery (10m GSD)',
    color: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/25',
  },
  {
    step: '02',
    icon: <Zap size={20} />,
    title: 'Process',
    desc: 'SwinIR deep learning reconstructs spatial detail at 3× scale',
    color: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/25',
  },
  {
    step: '03',
    icon: <BarChart2 size={20} />,
    title: 'Analyze',
    desc: 'Compare before/after, inspect spectral metrics and uncertainty',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/25',
  },
  {
    step: '04',
    icon: <Map size={20} />,
    title: 'Export',
    desc: 'Download analysis-ready GeoTIFF with full georeferencing intact',
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/25',
  },
];

const USE_CASES = [
  {
    icon: <Leaf size={18} />,
    title: 'Agriculture',
    desc: 'Crop health monitoring, field boundary detection, yield prediction',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=75&auto=format',
    tags: ['Crop Health', 'NDVI', 'Yield'],
    to: '/use-cases',
  },
  {
    icon: <Building2 size={18} />,
    title: 'Urban Planning',
    desc: 'Building footprint detection, road mapping, urban expansion analysis',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-blue-500/20',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75&auto=format',
    tags: ['Buildings', 'Roads', 'Density'],
    to: '/use-cases',
  },
  {
    icon: <Flame size={18} />,
    title: 'Disaster Response',
    desc: 'Flood extent mapping, damage assessment, emergency response support',
    color: 'text-amber-600',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/20',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&q=75&auto=format',
    tags: ['Flood', 'Damage', 'Response'],
    to: '/use-cases',
  },
  {
    icon: <Globe size={18} />,
    title: 'Environment',
    desc: 'Land-cover classification, deforestation tracking, water body monitoring',
    color: 'text-accent',
    bg: 'bg-accent/20',
    border: 'border-cyan-200',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=75&auto=format',
    tags: ['Land Cover', 'Forests', 'Water'],
    to: '/use-cases',
  },
];

const STATS = [
  { value: 3,    suffix: '×',     label: 'Spatial Enhancement',    color: 'text-accent' },
  { value: 10,   suffix: 'm→3m',  label: 'GSD Improvement',        color: 'text-accent' },
  { value: 4,    suffix: ' bands', label: 'Multispectral',         color: 'text-violet-400' },
  { value: 99.8, suffix: '%',     label: 'Geospatial Consistency', color: 'text-emerald-600' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroLoaded, setHeroLoaded] = useState(false);

  return (
    <div className="min-h-screen glass-panel overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1920&q=60&auto=format"
            alt="Earth from space"
            className={`w-full h-full object-cover transition-opacity duration-1000 ${heroLoaded ? 'opacity-30' : 'opacity-0'}`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-srm-surface via-srm-base to-srm-elevated" />
          <div className="absolute inset-0 bg-gradient-to-r from-srm-surface via-transparent to-srm-elevated" />
        </div>

        {/* Animated dot grid */}
        <div className="absolute inset-0 bg-dots opacity-30" />

        {/* Glowing orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/[0.04] blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="tag-cyan mb-6 anim-fade-up">
              <Satellite size={11} />
              Deep Learning for a Clearer Earth
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary mb-6 leading-[1.08] anim-fade-up delay-1">
              From Pixels to<br />
              <span className="text-gradient">A Clearer Planet</span>
            </h1>

            <p className="text-base sm:text-lg text-secondary leading-relaxed mb-8 max-w-lg anim-fade-up delay-2">
              Transform 10m Sentinel-2 satellite imagery into sharper, analysis-ready maps 
              using advanced deep learning and generative AI — while preserving full 
              spatial and spectral integrity.
            </p>

            <div className="flex flex-wrap gap-3 mb-10 anim-fade-up delay-3">
              <button
                onClick={() => navigate('/enhance')}
                className="btn-primary text-sm px-6 py-3"
              >
                Enhance an Image
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/gallery')}
                className="btn-secondary text-sm px-6 py-3"
              >
                <Play size={14} />
                Explore Examples
              </button>
            </div>

            {/* Value props */}
            <div className="flex flex-wrap gap-4 anim-fade-up delay-4">
              {[
                { icon: <TrendingUp size={13} />, text: 'Higher Spatial Detail' },
                { icon: <Shield size={13} />,     text: 'Spectrally Consistent' },
                { icon: <Globe size={13} />,      text: 'Real-World Impact' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-secondary">
                  <span className="text-accent">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Comparison preview */}
          <div className="hidden lg:block anim-fade-up delay-2">
            <div className="relative rounded-2xl overflow-hidden border border-theme shadow-[0_0_60px_rgba(0,212,255,0.1)] anim-float">
              {/* Before/After split */}
              <div className="relative h-72 overflow-hidden">
                {/* After (enhanced) — left half */}
                <img
                  src="/sample-satellite/sr.png"
                  alt="Enhanced"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Before (LR) — right half clip */}
                <div className="absolute inset-0" style={{ left: '50%' }}>
                  <img
                    src="/sample-satellite/lr.png"
                    alt="Original"
                    className="absolute inset-0 h-full object-cover"
                    style={{ width: '200%', maxWidth: '200%', left: '-100%' }}
                  />
                  <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
                </div>

                {/* Divider */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(0,212,255,0.6)] z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-panel border-2 border-cyan-400 flex items-center justify-center z-20 shadow-[0_0_16px_rgba(0,212,255,0.5)]">
                  <span className="text-accent text-xs font-bold">◂▸</span>
                </div>

                {/* Labels */}
                <div className="absolute top-3 left-3 z-20 tag-cyan text-[10px]">SRM · &lt;4m</div>
                <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-background/70 border border-theme rounded-lg text-[10px] text-secondary">Sentinel-2 · 10m</div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 py-3 glass-panel border-t border-theme">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs text-secondary font-mono">SwinIR-SRM · NTRO PS-26142</span>
                </div>
                <span className="text-xs font-bold text-accent font-mono">3× SR</span>
              </div>
            </div>

            <p className="text-center text-xs text-secondary mt-3">
              Actual model output — Sentinel-2 Agriculture (Hyderabad, 2026)
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-theme bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, suffix, label, color }) => (
              <div key={label} className="text-center">
                <div className={`text-3xl font-black mb-1 ${color} anim-counter`}>
                  <Counter to={value} suffix={suffix} />
                </div>
                <div className="text-xs text-secondary">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-eyebrow justify-center mb-4">Workflow</div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">How SRM Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Four simple steps from raw Sentinel-2 imagery to analysis-ready enhanced maps
            </p>
          </div>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-emerald-500/20" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map(({ step, icon, title, desc, color, border }, i) => (
                <div
                  key={step}
                  className={`relative glass-hover p-6 rounded-2xl border ${border} anim-fade-up delay-${i + 1}`}
                >
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-primary bg-gradient-to-br ${color} border ${border}`}>
                    {icon}
                  </div>
                  <div className="text-[10px] font-bold text-secondary font-mono mb-1">{step}</div>
                  <h3 className="text-base font-bold text-primary mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <ChevronRight
                      size={16}
                      className="hidden lg:block absolute -right-3 top-10 text-secondary z-10"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-24 px-4 sm:px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-eyebrow justify-center mb-4">Applications</div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">
              Explore the Possibilities
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enhanced satellite imagery unlocks capabilities across multiple critical sectors
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {USE_CASES.map(({ icon, title, desc, color, bg, border, image, tags, to }, i) => (
              <div
                key={title}
                className={`group glass rounded-2xl border ${border} overflow-hidden cursor-pointer hover:border-opacity-50 hover:-translate-y-1 transition-all duration-300 anim-fade-up delay-${i + 1}`}
                onClick={() => navigate(to)}
              >
                {/* Image */}
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-srm-surface via-transparent to-transparent" />
                  <div className={`absolute top-3 left-3 w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center ${color}`}>
                    {icon}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-base font-bold text-primary mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{desc}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags.map((tag) => (
                      <span key={tag} className={`text-[10px] px-1.5 py-0.5 ${bg} border ${border} ${color} rounded font-medium`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={`text-xs font-semibold ${color} flex items-center gap-1 group-hover:gap-2 transition-all duration-200`}>
                    Explore <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl border border-cyan-500/15 p-12 relative overflow-hidden shadow-glow-cyan">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />
            <div className="relative z-10">
              <div className="tag-cyan mx-auto mb-5 w-fit">Ready to Start?</div>
              <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">
                Try SRM on Your Imagery
              </h2>
              <p className="text-secondary mb-8 max-w-lg mx-auto leading-relaxed">
                Upload any Sentinel-2 scene and experience sub-4m resolution enhancement 
                powered by deep learning in seconds.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('/enhance')}
                  className="btn-primary px-8 py-3.5 text-sm"
                >
                  <Zap size={16} />
                  Get Started — Free
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="btn-secondary px-8 py-3.5 text-sm"
                >
                  Learn the Science
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
