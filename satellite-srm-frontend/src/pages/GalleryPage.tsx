import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn } from 'lucide-react';
import { SatelliteComparison } from '../components/ui/SatelliteComparison';

const CATEGORIES = ['All', 'Agriculture', 'Urban', 'Disaster', 'Environment'];

const EXAMPLES = [
  {
    id: 1,
    title: 'Agricultural Fields',
    category: 'Agriculture',
    location: 'Punjab, India',
    desc: 'Enhanced visibility of field boundaries and crop variations. 10m to 3.3m GSD.',
    lr: '/sample-satellite/lr.png',
    sr: '/sample-satellite/sr.png',
  },
  {
    id: 2,
    title: 'Urban Expansion',
    category: 'Urban',
    location: 'Hyderabad, India',
    desc: 'Clearer detection of individual building footprints and road networks.',
    lr: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80&auto=format&fit=crop',
    sr: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Flood Extent Mapping',
    category: 'Disaster',
    location: 'Assam, India',
    desc: 'Improved delineation of flooded areas vs. permanent water bodies.',
    lr: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&auto=format&fit=crop',
    sr: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Deforestation Tracking',
    category: 'Environment',
    location: 'Amazon Rainforest',
    desc: 'Sharper tracking of logging roads and localized deforestation.',
    lr: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80&auto=format&fit=crop',
    sr: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&auto=format&fit=crop',
  },
];

export const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredExamples = activeCategory === 'All' 
    ? EXAMPLES 
    : EXAMPLES.filter(e => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-white dark:from-transparent dark:via-transparent dark:to-transparent dark:bg-transparent">
      {/* Header */}
      <div className="border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-secondary hover:glass-panel transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black text-primary leading-none">Result Gallery</h1>
            <p className="text-xs text-muted-foreground mt-0.5">See what SRM can reveal across domains</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-accent/10 border border-accent/30 text-accent dark:bg-accent/20 dark:border-cyan-200 dark:shadow-glow-cyan'
                  : 'glass-panel border border-theme text-secondary hover:text-secondary hover:glass-panel'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredExamples.map((item, i) => (
            <div key={item.id} className={`glass rounded-3xl overflow-hidden border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-transparent dark:shadow-none dark:border-theme anim-fade-up delay-${i + 1}`}>
              
              {/* Top Meta */}
              <div className="p-5 border-b border-theme flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-primary leading-tight">{item.title}</h3>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1">{item.location}</div>
                </div>
                <div className="tag-cyan text-[10px]">{item.category}</div>
              </div>

              {/* Comparison Viewer */}
              <div className="relative">
                <SatelliteComparison 
                  beforeUrl={item.sr} 
                  afterUrl={item.lr}
                  beforeLabel="Enhanced"
                  afterLabel="Original"
                  height="300px"
                  showControls={false}
                  className="rounded-none border-x-0"
                />
                <button className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-background/80 border border-theme flex items-center justify-center text-secondary hover:text-accent transition-colors z-30">
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Bottom Desc */}
              <div className="p-5 glass-panel">
                <p className="text-sm text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
