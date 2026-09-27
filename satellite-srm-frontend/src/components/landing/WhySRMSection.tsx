import React from 'react';
import { Layers, ShieldCheck, Compass, Gauge, BarChart3, Binary } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const WhySRMSection: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: '10m → Sub-4m Spatial Elevation',
      description: '3.0x magnification reconstructs fine structural contours, edge definitions, and small-area features previously hidden inside 10m blended pixels.'
    },
    {
      icon: Gauge,
      title: 'Strict Spectral Consistency',
      description: 'Differentiable NDVI loss functions enforce exact radiometric conservation, ensuring vegetative indexes and band ratios remain scientifically valid.'
    },
    {
      icon: ShieldCheck,
      title: 'Uncertainty Awareness',
      description: 'Monte Carlo Dropout generates a calibrated pixel-level variance map, explicitly flagging regions of low model certainty instead of generating hallucinations.'
    },
    {
      icon: Compass,
      title: 'GIS Workflow Compatibility',
      description: 'Exports true georeferenced GeoTIFFs with updated affine transformation matrices, preserving EPSG coordinates for immediate QGIS and ArcGIS integration.'
    }
  ];

  return (
    <section className="py-20 border-t border-blue-100/60 glass-panel relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-3 uppercase tracking-wider">
            Core Advantages
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Why Super Resolution Mapping for Earth Observation?
          </h2>
          <p className="mt-4 text-secondary leading-relaxed text-sm sm:text-base">
            Engineered from first principles for mission-critical satellite remote sensing, not generic computer vision photography upscaling.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="border-blue-100 hover:border-cyan-200 glass-panel p-6 transition-all">
                <div className="h-10 w-10 rounded-lg bg-cyan-950/60 border border-cyan-200 flex items-center justify-center text-accent mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
};
