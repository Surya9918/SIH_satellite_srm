import React, { useState } from 'react';
import { Sliders, Grid, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ImageComparisonSliderProps {
  lrUrl: string;
  srUrl: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({ lrUrl, srUrl }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [zoom, setZoom] = useState(1.0);
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="relative w-full rounded-xl border border-blue-100 glass-panel p-4 shadow-sm">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-100 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-amber-600 font-bold">10m Sentinel-2</span>
          <span className="text-muted-foreground">⟷</span>
          <span className="text-accent font-bold">Sub-4m SwinIR Output</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
              showGrid ? 'bg-accent/20 border-cyan-400 text-cyan-700' : 'glass-panel border-blue-100 text-secondary'
            }`}
          >
            <Grid className="h-3 w-3 inline mr-1" />
            Pixel Grid
          </button>

          <div className="flex items-center border border-blue-100 rounded glass-panel">
            <button
              onClick={() => setZoom(prev => Math.max(1, prev - 0.25))}
              className="px-2 py-1 text-secondary hover:text-primary"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] text-cyan-700">{zoom.toFixed(1)}x</span>
            <button
              onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
              className="px-2 py-1 text-secondary hover:text-primary"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="px-2 py-1 text-secondary hover:text-primary border-l border-blue-100"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Comparison Canvas Container */}
      <div className="relative mt-3 h-[420px] sm:h-[500px] w-full select-none overflow-hidden rounded-lg border border-blue-100 glass-panel">
        
        {/* Right Layer: Sub-4m SR */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <img
            src={srUrl}
            alt="Super-resolved satellite imagery"
            className="h-full w-full object-cover transition-transform duration-100"
            style={{ transform: `scale(${zoom})` }}
          />
          <div className="absolute top-3 right-3 z-10 rounded bg-surface/80 px-2.5 py-1 text-[11px] font-mono font-bold text-cyan-700 border border-cyan-200 backdrop-blur-md">
            SUB-4m RECONSTRUCTION
          </div>
        </div>

        {/* Left Layer: 10m Input (clipped by slider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={lrUrl}
            alt="10m Sentinel-2 input imagery"
            className="h-full w-full object-cover max-w-none transition-transform duration-100"
            style={{ width: '100%', height: '100%', transform: `scale(${zoom})` }}
          />

          {showGrid && (
            <div className="absolute inset-0 pixel-grid-overlay pointer-events-none opacity-60" />
          )}

          <div className="absolute top-3 left-3 z-10 rounded bg-surface/80 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-700 border border-amber-500/40 backdrop-blur-md">
            10m NATIVE INPUT
          </div>
        </div>

        {/* Draggable Divider Line */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-cyan-400 shadow-[0_0_12px_#00f0ff] cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="flex h-9 w-9 -ml-4.5 items-center justify-center rounded-full border-2 border-cyan-300 glass-panel shadow-sm text-cyan-700">
            <Sliders className="h-4 w-4 rotate-90" />
          </div>
        </div>

        {/* Invisible range input for intuitive slider scrubbing */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          aria-label="Image comparison divider slider"
          className="absolute inset-0 z-30 opacity-0 cursor-ew-resize w-full h-full"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-mono text-secondary">
        <span>GSD Magnification: <strong>3.0x Spatial Detail</strong></span>
        <span>Drag divider horizontally to compare fine structural boundaries</span>
      </div>
    </div>
  );
};
