import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Sprout, BarChart2, Activity } from 'lucide-react';
import { DEMO_METRICS } from '../../store/useSrmStore';

interface NDVIViewerProps {
  ndviUrl: string;
}

export const NDVIViewer: React.FC<NDVIViewerProps> = ({ ndviUrl }) => {
  return (
    <Card className="border-blue-100 glass-panel p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-blue-100 mb-4">
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold font-mono text-primary">
            SPECTRAL VEGETATION INDEX (NDVI ANALYSIS)
          </h3>
        </div>
        <Badge variant="emerald">SPECTRAL INTEGRITY: r = 0.7585</Badge>
      </div>

      <div className="relative h-80 sm:h-[450px] w-full rounded-xl border border-blue-100 overflow-hidden glass-panel mb-6">
        <img
          src={ndviUrl}
          alt="NDVI comparison raster"
          className="h-full w-full object-contain glass-panel"
        />
        <div className="absolute top-3 left-3 z-10 rounded bg-surface/85 px-3 py-1.5 text-xs font-mono text-emerald-700 border border-emerald-500/40 backdrop-blur-md">
          NDVI FALSE-COLOR SPECTRAL MAP
        </div>
      </div>

      {/* NDVI Metrics Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs mb-4">
        
        <div className="p-3 rounded glass-panel border border-blue-100">
          <span className="text-muted-foreground text-[10px] uppercase block mb-1">Vegetation Score</span>
          <span className="font-bold text-emerald-600 text-sm">
            r ≈ {(1.0 - DEMO_METRICS.ndvi_loss.model).toFixed(4)}
          </span>
          <span className="text-[10px] text-secondary block mt-0.5">vs bicubic 0.9020</span>
        </div>

        <div className="p-3 rounded glass-panel border border-blue-100">
          <span className="text-muted-foreground text-[10px] uppercase block mb-1">Mean Absolute Error</span>
          <span className="font-bold text-cyan-700 text-sm">
            {DEMO_METRICS.ndvi_mae.model.toFixed(4)}
          </span>
          <span className="text-[10px] text-secondary block mt-0.5">MAE across scene</span>
        </div>

        <div className="p-3 rounded glass-panel border border-blue-100">
          <span className="text-muted-foreground text-[10px] uppercase block mb-1">Spectral Formulation</span>
          <span className="font-bold text-primary text-sm">
            (B08 - B04) / (B08 + B04)
          </span>
          <span className="text-[10px] text-secondary block mt-0.5">NIR and Red Channels</span>
        </div>

        <div className="p-3 rounded glass-panel border border-blue-100">
          <span className="text-muted-foreground text-[10px] uppercase block mb-1">Vegetation Fidelity</span>
          <span className="font-bold text-emerald-700 text-sm">
            Preserved
          </span>
          <span className="text-[10px] text-secondary block mt-0.5">L_NDVI loss enforced</span>
        </div>

      </div>

      {/* Color Ramp Legend */}
      <div className="pt-4 border-t border-blue-100 font-mono text-xs">
        <span className="text-secondary block mb-1">NDVI Reflectance Scale:</span>
        <div className="h-3 w-full rounded bg-gradient-to-r from-amber-700 via-yellow-400 via-lime-500 to-emerald-700 border border-blue-100"></div>
        <div className="flex justify-between text-[10px] text-secondary mt-1">
          <span>-0.2 (Water / Bare Soil)</span>
          <span>0.3 (Sparse Vegetation)</span>
          <span className="text-emerald-600">+0.85 (Dense Green Canopy)</span>
        </div>
      </div>
    </Card>
  );
};
