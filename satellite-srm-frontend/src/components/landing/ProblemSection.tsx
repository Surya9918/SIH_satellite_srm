import React from 'react';
import { AlertTriangle, Satellite, DollarSign, Clock, HelpCircle, EyeOff } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const ProblemSection: React.FC = () => {
  return (
    <section id="mission" className="py-20 border-t border-blue-100/60 bg-surface/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="amber" className="mb-3 uppercase tracking-wider">
            Operational Limitation
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            The Geospatial Dilemma: Resolution vs. Revisit
          </h2>
          <p className="mt-4 text-secondary leading-relaxed text-sm sm:text-base">
            Earth observation constellations present an inherent physical trade-off between spatial resolution, coverage cadence, and operational cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Limitation 1 */}
          <Card className="border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-600 mb-4">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">10m Coarse Pixels</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Sentinel-2 MSI provides free 5-day global coverage, but its 10m GSD cannot resolve narrow irrigation canals, farm boundaries, individual buildings, or localized disaster damage paths.
            </p>
            <div className="mt-4 pt-4 border-t border-blue-100/60 font-mono text-xs text-amber-600/80">
              1 pixel = 100 m² ground area
            </div>
          </Card>

          {/* Limitation 2 */}
          <Card className="border-red-500/20 hover:border-red-500/40 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-600 mb-4">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">High Cost of VHR Data</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Commercial Very High Resolution (VHR) sensors (0.3m – 1.0m) cost thousands of dollars per scene, lack systematic monitoring cadences, and frequently miss critical multispectral NIR bands.
            </p>
            <div className="mt-4 pt-4 border-t border-blue-100/60 font-mono text-xs text-red-600/80">
              &gt; $15-$30 / km² commercial cost
            </div>
          </Card>

          {/* Limitation 3 */}
          <Card className="border-cyan-200 hover:border-cyan-200 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-cyan-950/60 border border-cyan-200 flex items-center justify-center text-accent mb-4">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">AI Hallucination Risk</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Standard image upscaling models (e.g. bicubic or generic computer vision GANs) distort multispectral radiometric values and invent false structures without estimating confidence.
            </p>
            <div className="mt-4 pt-4 border-t border-blue-100/60 font-mono text-xs text-accent/80">
              Severe spectral distortion in NDVI
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
};
