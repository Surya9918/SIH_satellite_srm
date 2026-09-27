import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Satellite, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSrmStore } from '../../store/useSrmStore';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const { loadDemoDataset } = useSrmStore();

  const handleDemo = () => {
    loadDemoDataset();
    navigate('/app/results/SRM-NTRO-DEMO-01');
  };

  return (
    <section className="py-20 border-t border-blue-100 bg-gradient-to-b from-blue-50 to-white/90 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-200 text-accent mb-6 shadow-lg shadow-cyan-500/20">
          <Satellite className="h-6 w-6 animate-pulse-slow" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-primary leading-tight">
          Initialize Your Satellite Reconstruction Mission
        </h2>

        <p className="mt-4 text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
          Upload any 10m Sentinel-2 multispectral GeoTIFF or explore our precomputed NTRO benchmarking dataset to inspect sub-4m spatial detail and uncertainty maps.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/app/upload')}
            className="w-full sm:w-auto font-mono font-bold"
          >
            Launch Reconstruction Console
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={handleDemo}
            className="w-full sm:w-auto font-mono"
          >
            <Play className="h-4 w-4 mr-2 text-accent" />
            Explore Precomputed Dataset
          </Button>
        </div>

        <div className="mt-8 text-xs font-mono text-muted-foreground">
          Supports .TIF / .TIFF • B02, B03, B04, B08 Bands • QGIS / GDAL Ready
        </div>
      </div>
    </section>
  );
};
