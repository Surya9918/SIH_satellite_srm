import React, { useState } from 'react';
import { SatelliteMetadata } from '../../types/satellite';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatBytes } from '../../lib/utils';
import { Play, Layers, Compass, Cpu, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';

interface FileMetadataProps {
  metadata: SatelliteMetadata;
  onStartReconstruction: (model: string, enableUncertainty: boolean) => void;
  isStarting: boolean;
}

export const FileMetadata: React.FC<FileMetadataProps> = ({
  metadata,
  onStartReconstruction,
  isStarting
}) => {
  const [selectedModel, setSelectedModel] = useState("SwinIR-SRM (Multispectral)");
  const [enableUncertainty, setEnableUncertainty] = useState(true);

  return (
    <Card className="border-cyan-200 glass-panel p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-blue-100 mb-6">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold font-mono text-primary">
            SATELLITE RASTER METADATA INSPECTION
          </h3>
        </div>
        <Badge variant="emerald" dot>VERIFIED GEOSPATIAL STRUCTURE</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-mono text-xs">
        
        <div className="p-3 rounded-lg glass-panel border border-blue-100">
          <span className="text-secondary text-[10px] uppercase block mb-1">Source Sensor</span>
          <span className="font-bold text-primary">{metadata.sensor}</span>
        </div>

        <div className="p-3 rounded-lg glass-panel border border-blue-100">
          <span className="text-secondary text-[10px] uppercase block mb-1">Native Pixel Resolution</span>
          <span className="font-bold text-amber-700">{metadata.nativeResolution.toFixed(1)} m Ground GSD</span>
        </div>

        <div className="p-3 rounded-lg glass-panel border border-blue-100">
          <span className="text-secondary text-[10px] uppercase block mb-1">Target SR Resolution</span>
          <span className="font-bold text-cyan-700">&lt; 4.0 m ({metadata.targetResolution.toFixed(2)} m)</span>
        </div>

        <div className="p-3 rounded-lg glass-panel border border-blue-100">
          <span className="text-secondary text-[10px] uppercase block mb-1">Coordinate Reference (CRS)</span>
          <span className="font-bold text-emerald-600">{metadata.crs}</span>
        </div>

      </div>

      {/* Raster & Band Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-mono text-xs">
        
        <div className="p-4 rounded-xl bg-surface/70 border border-blue-100 space-y-2">
          <span className="text-secondary uppercase font-bold text-[10px] block mb-2">
            Spectral Channels Detected
          </span>
          <div className="grid grid-cols-2 gap-2">
            {metadata.bands.map((band, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded glass-panel border border-blue-100">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                <span className="text-secondary">{band}</span>
              </div>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground mt-2 block">
            4-Band native processing preserved without RGB decimation.
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface/70 border border-blue-100 space-y-2">
          <span className="text-secondary uppercase font-bold text-[10px] block mb-2">
            Spatial Dimensions & Bounding Envelope
          </span>
          <div className="space-y-1.5 text-secondary">
            <div className="flex justify-between">
              <span className="text-secondary">Dimensions:</span>
              <span className="text-primary font-bold">{metadata.width} × {metadata.height} px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">File Size:</span>
              <span className="text-primary">{formatBytes(metadata.fileSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Bounding Box:</span>
              <span className="text-cyan-700 font-mono text-[11px]">
                [{metadata.bounds.minLon.toFixed(4)}, {metadata.bounds.minLat.toFixed(4)}]
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Mission Configuration Controls */}
      <div className="pt-4 border-t border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6">
        <div>
          <label className="block text-xs font-mono text-secondary mb-1.5 font-semibold">
            Select Reconstruction Neural Architecture:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full rounded-lg glass-panel border border-blue-100 px-3 py-2 text-xs font-mono text-primary focus:outline-none focus:border-cyan-400"
          >
            <option value="SwinIR-SRM (Multispectral)">Multispectral SwinIR (Recommended • NTRO Baseline)</option>
            <option value="Diffusion-SRM (Experimental)">Conditional Diffusion SRM (Experimental)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2 md:pt-6">
          <input
            type="checkbox"
            id="enableUncertainty"
            checked={enableUncertainty}
            onChange={(e) => setEnableUncertainty(e.target.checked)}
            className="h-4 w-4 rounded border-blue-100 glass-panel text-accent focus:ring-cyan-400"
          />
          <label htmlFor="enableUncertainty" className="text-xs font-mono text-secondary cursor-pointer">
            Compute Monte Carlo Dropout Uncertainty Map <br />
            <span className="text-muted-foreground text-[10px]">(Generates spatial confidence GeoTIFF layer)</span>
          </label>
        </div>
      </div>

      {/* Launch Action */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-blue-100/60">
        <Button
          size="lg"
          variant="primary"
          loading={isStarting}
          onClick={() => onStartReconstruction(selectedModel, enableUncertainty)}
          className="w-full sm:w-auto font-mono font-bold text-sm"
        >
          <Play className="h-4 w-4 mr-2" />
          Initialize AI Reconstruction Mission
        </Button>
      </div>

    </Card>
  );
};
