import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, Building2, Flame, Globe, ArrowRight } from 'lucide-react';

const USE_CASES = [
  {
    id: 'agriculture',
    icon: <Leaf size={24} />,
    title: 'Agriculture & Farming',
    color: 'emerald',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop',
    problem: '10m Sentinel-2 data struggles to clearly delineate field boundaries for smallholder farms (<2 hectares), making yield prediction and micro-level crop health monitoring difficult.',
    solution: 'SRM enhances spatial resolution to ~3.3m while strictly preserving the NDVI and Red-Edge spectral signatures necessary for agricultural analysis.',
    benefits: [
      'Accurate extraction of small plot boundaries',
      'Precise within-field crop variation mapping',
      'Improved crop yield modeling',
      'Better spectral index (NDVI/EVI) spatial mapping'
    ]
  },
  {
    id: 'urban',
    icon: <Building2 size={24} />,
    title: 'Urban Planning & Development',
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80&auto=format&fit=crop',
    problem: 'Medium resolution limits the detection of individual buildings, narrow roads, and informal settlements in rapidly expanding urban centers.',
    solution: 'Deep learning reconstruction recovers sharp edges, right angles, and structural features typical of human-made environments without requiring expensive commercial satellite tasking.',
    benefits: [
      'Automated building footprint extraction',
      'Mapping of tertiary road networks',
      'Informal settlement / slum monitoring',
      'High-frequency urban expansion tracking'
    ]
  },
  {
    id: 'disaster',
    icon: <Flame size={24} />,
    title: 'Disaster Management',
    color: 'amber',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&q=80&auto=format&fit=crop',
    problem: 'During floods or earthquakes, rapid assessment is crucial, but free frequent-revisit satellites (like Sentinel-2) lack the detail needed for localized damage assessment.',
    solution: 'SRM bridges the gap between high temporal frequency and high spatial resolution, allowing rapid enhancement of the latest available disaster imagery.',
    benefits: [
      'Clearer flood extent mapping around infrastructure',
      'Detection of blocked critical roadways',
      'Rapid landslide boundary delineation',
      'Post-disaster recovery monitoring'
    ]
  },
  {
    id: 'environment',
    icon: <Globe size={24} />,
    title: 'Environmental Monitoring',
    color: 'cyan',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format&fit=crop',
    problem: 'Tracking illegal logging, selective deforestation, and subtle coastline changes requires continuous, high-detail monitoring over vast remote areas.',
    solution: 'SRM enables scaling high-resolution analysis globally using open data, providing the detail needed to spot localized environmental degradation.',
    benefits: [
      'Detecting small-scale illegal logging roads',
      'Mapping narrow river and coastline changes',
      'Monitoring protected forest reserves',
      'Tracking glacier and ice-sheet dynamics'
    ]
  }
];

export const UseCasesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-slate-50 via-blue-50/20 to-white dark:from-transparent dark:via-transparent dark:to-transparent dark:bg-transparent">
      {/* Light Mode top atmospheric glow */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-100/30 via-cyan-50/10 to-transparent pointer-events-none dark:hidden" />
      
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-border bg-white/80 dark:bg-surface/80 backdrop-blur-md sticky top-[64px] z-40 shadow-sm dark:shadow-none">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-secondary hover:glass-panel transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black text-primary leading-none">Use Cases</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Real-world applications of SRM</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-24">
        
        {USE_CASES.map((uc, i) => (
          <div key={uc.id} className={`grid md:grid-cols-2 gap-10 items-center anim-fade-up delay-${(i % 3) + 1}`}>
            
            {/* Image Side */}
            <div className={`relative rounded-2xl overflow-hidden border border-white/40 dark:border-theme shadow-[0_6px_24px_rgb(0,0,0,0.04)] dark:shadow-glow-${uc.color} bg-white/35 backdrop-blur-md dark:bg-transparent h-[400px] ${i % 2 !== 0 ? 'md:order-2' : ''}`}>
              <img src={uc.image} alt={uc.title} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-normal dark:mix-blend-screen" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-srm-surface dark:via-srm-surface/60" />
              
              <div className="absolute bottom-6 left-6 flex items-center gap-4 bg-white/55 backdrop-blur-md border border-white/40 shadow-none rounded-2xl p-3 pr-6 dark:bg-transparent dark:backdrop-blur-none dark:border-transparent dark:shadow-none dark:p-0 dark:pr-0">
                <div className={`w-14 h-14 rounded-2xl bg-${uc.color}-500/20 border border-${uc.color}-500/40 flex items-center justify-center text-${uc.color}-600 dark:text-${uc.color}-400 backdrop-blur-md`}>
                  {uc.icon}
                </div>
                <h2 className="text-2xl font-black text-primary">{uc.title}</h2>
              </div>
            </div>

            {/* Text Side */}
            <div className={`space-y-6 ${i % 2 !== 0 ? 'md:order-1' : ''}`}>
              
              <div className="bg-white/35 backdrop-blur-md border border-white/40 shadow-none rounded-2xl p-5 dark:bg-transparent dark:backdrop-blur-none dark:border-transparent dark:shadow-none dark:p-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-foreground uppercase tracking-widest mb-2">The Problem</h3>
                <p className="text-slate-700 dark:text-muted-foreground leading-relaxed text-sm bg-transparent border-transparent shadow-none dark:bg-surface/50 dark:border dark:border-theme dark:p-4 dark:rounded-xl">
                  {uc.problem}
                </p>
              </div>

              <div className="bg-white/35 backdrop-blur-md border border-white/40 shadow-none rounded-2xl p-5 dark:bg-transparent dark:backdrop-blur-none dark:border-transparent dark:shadow-none dark:p-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-foreground uppercase tracking-widest mb-2">How SRM Helps</h3>
                <p className={`text-slate-700 dark:text-muted-foreground leading-relaxed text-sm bg-transparent border-transparent shadow-none dark:bg-${uc.color}-500/[0.05] dark:border dark:border-${uc.color}-500/15 dark:p-4 dark:rounded-xl dark:shadow-none`}>
                  {uc.solution}
                </p>
              </div>

              <div className="bg-white/35 backdrop-blur-md border border-white/40 shadow-none rounded-2xl p-5 dark:bg-transparent dark:backdrop-blur-none dark:border-transparent dark:shadow-none dark:p-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-foreground uppercase tracking-widest mb-3">Key Benefits</h3>
                <ul className="space-y-2.5 bg-transparent border-transparent shadow-none">
                  {uc.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-muted-foreground">
                      <ArrowRight size={16} className={`text-${uc.color}-600 dark:text-${uc.color}-400 mt-0.5 flex-shrink-0`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <button onClick={() => navigate('/enhance')} className={`text-sm font-bold text-${uc.color}-700 dark:text-${uc.color}-400 hover:text-${uc.color}-800 dark:hover:text-${uc.color}-300 flex items-center gap-1.5 transition-colors bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-2.5 dark:bg-transparent dark:backdrop-blur-none dark:border-transparent dark:px-0 dark:py-0`}>
                  Enhance Imagery for {uc.title.split('&')[0].trim()} <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};
