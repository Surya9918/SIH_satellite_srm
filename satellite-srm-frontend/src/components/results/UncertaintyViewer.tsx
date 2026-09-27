import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ShieldAlert, Info, Layers, Eye } from 'lucide-react';

interface UncertaintyViewerProps {
  srUrl: string;
  uncertaintyUrl: string;
}

export const UncertaintyViewer: React.FC<UncertaintyViewerProps> = ({ srUrl, uncertaintyUrl }) => {
  const [opacity, setOpacity] = useState(0.65);

  return (
    <Card className="border-blue-100 glass-panel p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-blue-100 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-bold font-mono text-primary">
            MODEL UNCERTAINTY QUANTIFICATION
          </h3>
        </div>
        <Badge variant="purple">MONTE CARLO DROPOUT VARIANCE</Badge>
      </div>

      <div className="mb-4 text-xs text-secondary leading-relaxed bg-surface/70 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
        <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <span>
          The uncertainty layer represents model variability across stochastic inference passes and helps identify areas where reconstructed details are less certain (e.g. cloud boundaries or complex texture transitions).
        </span>
      </div>

      {/* Interactive visual with overlay */}
      <div className="relative h-80 sm:h-[450px] w-full rounded-xl border border-blue-100 overflow-hidden glass-panel">
        
        {/* Base: SR Image */}
        <img
          src={srUrl}
          alt="Super resolution base imagery"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay: Uncertainty Heatmap */}
        <img
          src={uncertaintyUrl}
          alt="Uncertainty variance heatmap"
          className="absolute inset-0 h-full w-full object-cover mix-blend-screen transition-opacity duration-200"
          style={{ opacity }}
        />

        {/* Overlay Opacity Floating Badge */}
        <div className="absolute top-3 left-3 z-10 rounded bg-surface/85 px-3 py-1.5 text-xs font-mono text-indigo-700 border border-indigo-500/40 backdrop-blur-md">
          UNCERTAINTY OVERLAY ({(opacity * 100).toFixed(0)}% OPACITY)
        </div>
      </div>

      {/* Controls and Scientific Legend */}
      <div className="mt-4 pt-4 border-t border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center font-mono text-xs">
        
        <div>
          <label className="flex items-center justify-between text-secondary mb-1.5">
            <span>Uncertainty Layer Opacity:</span>
            <span className="text-cyan-700 font-bold">{(opacity * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            aria-label="Uncertainty opacity slider"
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Legend */}
        <div>
          <span className="text-secondary block mb-1.5">Model Predictive Variance:</span>
          <div className="h-4 w-full rounded-md bg-gradient-to-r from-blue-900 via-purple-600 via-amber-500 to-red-600 border border-blue-100"></div>
          <div className="flex justify-between text-[10px] text-secondary mt-1">
            <span className="text-accent">Low Variance (High Confidence)</span>
            <span className="text-red-600">High Variance (Less Certain)</span>
          </div>
        </div>

      </div>
    </Card>
  );
};
