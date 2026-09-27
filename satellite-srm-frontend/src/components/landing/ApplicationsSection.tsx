import React from 'react';
import { Sprout, Building2, Waves, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

export const ApplicationsSection: React.FC = () => {
  const useCases = [
    {
      id: 'agriculture',
      title: 'Precision Agriculture',
      category: 'VEGETATION DYNAMICS',
      description: 'Delineate field parcel boundaries, inspect micro-canopy health gradients, and resolve localized crop stress with preserved NDVI reflectance ratios.',
      keyBands: ['B04 (Red)', 'B08 (NIR)', 'NDVI Matrix'],
      image: '/sample-satellite/sr.png',
      badge: 'CROP CANOPY 3.3m GSD'
    },
    {
      id: 'urban',
      title: 'Urban Morphology & Planning',
      category: 'INFRASTRUCTURE INTELLIGENCE',
      description: 'Disentangle dense building footprints, transportation corridors, and informal settlement expansion without purchasing costly private commercial imagery.',
      keyBands: ['B02 (Blue)', 'B03 (Green)', 'B04 (Red)'],
      image: '/sample-satellite/lr.png',
      badge: 'URBAN SPRAWL MONITORING'
    },
    {
      id: 'disaster',
      title: 'Flood & Disaster Response',
      category: 'EMERGENCY REMOTE SENSING',
      description: 'Accurately map inundated feeder canals, washed-out bridge approaches, and emergency levee breaches using enhanced high-frequency spatial gradients.',
      keyBands: ['MNDWI', 'B08 NIR Water Absorption', 'Uncertainty Mask'],
      image: '/sample-satellite/uncertainty.png',
      badge: 'WATER EXTENT RESOLUTION'
    }
  ];

  return (
    <section id="applications" className="py-20 border-t border-blue-100/60 bg-surface/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="purple" className="mb-3 uppercase tracking-wider">
            Operational Applications
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Where Sub-4m Spatial Intelligence Delivers Critical Impact
          </h2>
          <p className="mt-4 text-secondary leading-relaxed text-sm sm:text-base">
            Enabling high-impact geospatial decisions across environmental, civil, and defense domains where 10m pixels are too coarse and commercial imagery is cost-prohibitive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((app) => (
            <Card key={app.id} className="overflow-hidden border-blue-100 bg-surface/90 flex flex-col group hover:border-cyan-200 transition-all">
              <div className="relative h-48 w-full overflow-hidden glass-panel-secondary">
                <img
                  src={app.image}
                  alt={app.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-card via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <Badge variant="cyan" className="text-[10px] uppercase font-bold">
                    {app.badge}
                  </Badge>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] text-accent font-bold uppercase tracking-wider">
                    {app.category}
                  </span>
                  <h3 className="text-xl font-bold text-primary mt-1 mb-2">
                    {app.title}
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed mb-4">
                    {app.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-blue-100/60">
                  <span className="text-[11px] font-mono text-secondary block mb-2">
                    Critical Spectral Components:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {app.keyBands.map((band, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded glass-panel text-[10px] font-mono text-secondary border border-blue-100">
                        {band}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};
