import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, Sparkles, Droplets, Leaf, Building, Sun, Eye, Info } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface BandCard {
  id: string;
  name: string;
  bandCode: string;
  wavelength: string;
  range: string;
  icon: React.ReactNode;
  themeColor: string;
  accentBg: string;
  borderGlow: string;
  badgeColor: string;
  summary: string;
  primaryUses: string[];
  scientificValue: string;
}

export const Multispectral: React.FC = () => {
  const [selectedBand, setSelectedBand] = useState<string>('nir');

  const bands: BandCard[] = [
    {
      id: 'blue',
      name: 'BLUE',
      bandCode: 'Band 2',
      wavelength: '490 nm',
      range: '458 – 523 nm',
      icon: <Droplets size={24} />,
      themeColor: 'text-cyan-600 dark:text-cyan-400',
      accentBg: 'from-cyan-500/20 to-cyan-500/5',
      borderGlow: 'hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]',
      badgeColor: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      summary:
        'Maximum penetration through shallow aquatic environments and critical for aerosol scattering correction.',
      primaryUses: [
        'Coastal bathymetry and reef health',
        'Atmospheric aerosol optical depth (AOD)',
        'Soil vs. water body distinction',
      ],
      scientificValue:
        'Shortest visible wavelength; essential for true-color RGB synthesis and atmospheric path radiance compensation.',
    },
    {
      id: 'green',
      name: 'GREEN',
      bandCode: 'Band 3',
      wavelength: '560 nm',
      range: '543 – 578 nm',
      icon: <Leaf size={24} />,
      themeColor: 'text-emerald-600 dark:text-emerald-400',
      accentBg: 'from-emerald-500/20 to-emerald-500/5',
      borderGlow: 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      summary:
        'Captures peak reflectance from healthy green vegetation canopies and sediment dynamics in inland water bodies.',
      primaryUses: [
        'Vegetation vigor & canopy cover',
        'Turbidity & suspended matter in lakes',
        'NDWI water index calculations',
      ],
      scientificValue:
        'Corresponds to the green chlorophyll reflection peak, revealing subtle nuances in plant nutrition and river turbidity.',
    },
    {
      id: 'red',
      name: 'RED',
      bandCode: 'Band 4',
      wavelength: '665 nm',
      range: '650 – 680 nm',
      icon: <Sun size={24} />,
      themeColor: 'text-red-600 dark:text-red-400',
      accentBg: 'from-red-500/20 to-red-500/5',
      borderGlow: 'hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
      badgeColor: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
      summary:
        'Strongest chlorophyll-a absorption band. Essential baseline for determining photosynthetic activity and urban materials.',
      primaryUses: [
        'Chlorophyll-a absorption quantification',
        'Urban built-up infrastructure contrast',
        'Soil boundary & geological mapping',
      ],
      scientificValue:
        'Pairs inversely with NIR to formulate the Normalized Difference Vegetation Index (NDVI = (NIR - Red) / (NIR + Red)).',
    },
    {
      id: 'nir',
      name: 'NIR',
      bandCode: 'Band 8 (Near-Infrared)',
      wavelength: '842 nm',
      range: '785 – 900 nm',
      icon: <Sparkles size={24} />,
      themeColor: 'text-violet-600 dark:text-violet-400',
      accentBg: 'from-violet-500/20 to-violet-500/5',
      borderGlow: 'hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]',
      badgeColor: 'bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30',
      summary:
        'Invisible to human eyes, NIR radiation reflects powerfully off spongy plant mesophyll cells and absorbs completely in pure water.',
      primaryUses: [
        'Biomass volume & plant cellular stress',
        'Razor-sharp land-water boundary definition',
        'Drought assessment & soil moisture',
      ],
      scientificValue:
        'The definitive band for bio-physical Earth analysis. Sharp contrast against Red creates high-confidence vegetation and moisture masks.',
    },
  ];

  return (
    <section id="multispectral" className="relative py-24 glass-panel border-t border-border/40 overflow-hidden scroll-mt-[var(--nav-height)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03),transparent)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            Complementary spectral intelligence
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Multispectral sensors capture discrete wavebands far beyond the visible spectrum. Each band provides complementary physical measurements of Earth’s atmosphere, vegetation, soil, and water.
          </p>
        </div>

        {/* 4 Spectral Band Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {bands.map((band) => {
            const isSelected = selectedBand === band.id;
            return (
              <Card
                key={band.id}
                onClick={() => setSelectedBand(band.id)}
                className={`cursor-pointer overflow-hidden transition-all duration-300 group flex flex-col justify-between ${
                  isSelected
                    ? `glass-panel border-border/80 shadow-lg -translate-y-1.5 ${band.borderGlow}`
                    : 'bg-card/40 border-border/40 hover:bg-card/60 hover:border-border/60'
                }`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-0 transition-opacity duration-500 pointer-events-none ${isSelected ? 'opacity-100 bg-current ' + band.themeColor : 'group-hover:opacity-50 bg-muted-foreground'}`} />
                
                <CardContent className="p-6 relative z-10 flex flex-col h-full">
                  <div>
                    {/* Top Bar: Icon + Band Code */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl glass-panel border border-border/50 flex items-center justify-center transition-transform ${isSelected ? 'scale-110 shadow-md ' + band.themeColor : 'text-muted-foreground'}`}>
                        {band.icon}
                      </div>
                      <span className="px-2.5 py-1 rounded glass-panel border border-border/50 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                        {band.bandCode}
                      </span>
                    </div>

                    {/* Title & Wavelength */}
                    <div className="mb-4">
                      <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {band.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-mono font-bold ${band.themeColor}`}>
                          λ {band.wavelength}
                        </span>
                        <span className="text-[12px] text-muted-foreground font-mono">
                          ({band.range})
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-8 min-h-[80px]">
                      {band.summary}
                    </p>
                  </div>

                  {/* Primary Applications List */}
                  <div className="pt-5 border-t border-border/50 space-y-3 mt-auto">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground opacity-70 mb-3">
                      Key Indicators
                    </div>
                    {band.primaryUses.map((use, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className={`w-1.5 h-1.5 rounded-full ${band.themeColor} bg-current`} />
                        <span className="truncate">{use}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Deep Dive Spectral Band Insight Box */}
        {(() => {
          const current = bands.find((b) => b.id === selectedBand) || bands[3];
          return (
            <motion.div 
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 p-6 sm:p-8 shadow-lg overflow-hidden relative`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${current.accentBg} pointer-events-none opacity-50`} />
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border/50 mb-5">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold font-mono ${current.themeColor} flex items-center gap-2`}>
                      <Info size={20} /> {current.name} Channel
                    </span>
                    <span className="px-2.5 py-1 rounded glass-panel border border-border/50 font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Sentinel-2 MSI
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground tracking-wide font-medium glass-panel px-3 py-1.5 rounded border border-border/50">
                    GSD: 10m Native <span className="mx-2 text-border">|</span> <span className="text-primary font-bold">TerraSR: 3.3m</span>
                  </div>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  <strong className="text-foreground font-semibold uppercase tracking-wider text-sm mr-2">Radiometric Role:</strong>
                  {current.scientificValue}
                </p>
              </div>
            </motion.div>
          );
        })()}
      </div>
    </section>
  );
};
