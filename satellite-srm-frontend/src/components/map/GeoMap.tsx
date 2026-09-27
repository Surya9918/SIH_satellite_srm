import React, { useEffect, useRef } from 'react';
import { GeoBounds } from '../../types/satellite';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Globe, MapPin, Compass, Navigation } from 'lucide-react';

interface GeoMapProps {
  bounds: GeoBounds;
  center: [number, number];
  crs: string;
  nativeRes: number;
  targetRes: number;
}

export const GeoMap: React.FC<GeoMapProps> = ({
  bounds,
  center,
  crs,
  nativeRes,
  targetRes
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="border-blue-100 glass-panel p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-100 mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent" />
          <h3 className="text-base font-bold font-mono text-primary">
            GEOSPATIAL COVERAGE & AOI FOOTPRINT
          </h3>
        </div>
        <Badge variant="cyan">{crs}</Badge>
      </div>

      {/* Stylized Geospatial Map Visualizer */}
      <div className="relative h-72 sm:h-80 w-full rounded-xl border border-blue-100 overflow-hidden glass-panel flex items-center justify-center">
        
        {/* Subtle coordinate grid lines */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Global coordinate ticks */}
        <div className="absolute top-2 left-3 font-mono text-[10px] text-muted-foreground">
          NW: {bounds.maxLat.toFixed(4)}°N, {bounds.minLon.toFixed(4)}°E
        </div>
        <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground">
          NE: {bounds.maxLat.toFixed(4)}°N, {bounds.maxLon.toFixed(4)}°E
        </div>
        <div className="absolute bottom-2 left-3 font-mono text-[10px] text-muted-foreground">
          SW: {bounds.minLat.toFixed(4)}°N, {bounds.minLon.toFixed(4)}°E
        </div>
        <div className="absolute bottom-2 right-3 font-mono text-[10px] text-muted-foreground">
          SE: {bounds.minLat.toFixed(4)}°N, {bounds.maxLon.toFixed(4)}°E
        </div>

        {/* Footprint Bounding Box graphic */}
        <div className="relative z-10 w-64 h-48 border-2 border-cyan-400/80 bg-cyan-950/20 rounded-lg flex flex-col items-center justify-center p-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
          <div className="h-8 w-8 rounded-full bg-accent/30 text-cyan-700 flex items-center justify-center mb-2 animate-pulse">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="font-mono text-xs font-bold text-primary tracking-wider">
            SCENE FOOTPRINT
          </span>
          <span className="font-mono text-[11px] text-cyan-700 mt-1">
            Center: {center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E
          </span>
          <span className="font-mono text-[10px] text-emerald-600 mt-1">
            Reconstructed: {nativeRes.toFixed(1)}m → {targetRes.toFixed(2)}m GSD
          </span>
        </div>

        {/* Radar beam circle */}
        <div className="absolute w-80 h-80 rounded-full border border-cyan-200 pointer-events-none"></div>
      </div>

      {/* Geospatial Metrics Bar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-2.5 rounded glass-panel border border-blue-100">
          <span className="text-muted-foreground text-[10px] uppercase block">Coordinate System</span>
          <span className="font-bold text-primary">{crs}</span>
        </div>
        <div className="p-2.5 rounded glass-panel border border-blue-100">
          <span className="text-muted-foreground text-[10px] uppercase block">Center Latitude</span>
          <span className="font-bold text-cyan-700">{center[0].toFixed(4)}° N</span>
        </div>
        <div className="p-2.5 rounded glass-panel border border-blue-100">
          <span className="text-muted-foreground text-[10px] uppercase block">Center Longitude</span>
          <span className="font-bold text-cyan-700">{center[1].toFixed(4)}° E</span>
        </div>
        <div className="p-2.5 rounded glass-panel border border-blue-100">
          <span className="text-muted-foreground text-[10px] uppercase block">Affine Transform</span>
          <span className="font-bold text-emerald-600">Strict GDAL Compliant</span>
        </div>
      </div>
    </Card>
  );
};
