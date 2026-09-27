import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Layers, Eye, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2,
  Info, Compass, Sparkles, Droplets, Leaf, Sun, Crosshair, Palette
} from 'lucide-react';
import { resolveApiUrl } from '../../api/client';
import { GeoBounds } from '../../types/satellite';

export type BandSelection = 'rgb' | 'blue' | 'green' | 'red' | 'nir' | 'false_color';

interface BandConfig {
  id: BandSelection;
  label: string;
  fullName: string;
  bandDesignation?: string;
  wavelength?: string;
  spectralRange?: string;
  channelMapping?: string;
  description: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  icon: React.ReactNode;
}

const BAND_CONFIGS: Record<BandSelection, BandConfig> = {
  rgb: {
    id: 'rgb',
    label: 'RGB',
    fullName: 'Natural Color Composite',
    channelMapping: 'B04 → Red • B03 → Green • B02 → Blue',
    description: 'True-color synthesis approximating human photoreceptor vision across the visible spectrum.',
    accentColor: 'text-accent',
    badgeBg: 'bg-accent/20',
    badgeBorder: 'border-cyan-200',
    icon: <Eye size={13} className="text-accent" />
  },
  blue: {
    id: 'blue',
    label: 'Blue',
    fullName: 'Band 2 (Blue)',
    bandDesignation: 'B02',
    wavelength: '490 nm',
    spectralRange: '458 – 523 nm',
    description: 'Shortest visible wavelength; essential for shallow bathymetry, aerosol scattering correction, and water-soil discrimination.',
    accentColor: 'text-cyan-700',
    badgeBg: 'bg-accent/20',
    badgeBorder: 'border-cyan-400/30',
    icon: <Droplets size={13} className="text-cyan-700" />
  },
  green: {
    id: 'green',
    label: 'Green',
    fullName: 'Band 3 (Green)',
    bandDesignation: 'B03',
    wavelength: '560 nm',
    spectralRange: '543 – 578 nm',
    description: 'Captures peak reflectance from green chlorophyll in plant canopies and sediment dynamics in inland water bodies.',
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-400/30',
    icon: <Leaf size={13} className="text-emerald-600" />
  },
  red: {
    id: 'red',
    label: 'Red',
    fullName: 'Band 4 (Red)',
    bandDesignation: 'B04',
    wavelength: '665 nm',
    spectralRange: '650 – 680 nm',
    description: 'Strongest chlorophyll-a absorption band. Essential baseline for determining photosynthetic activity and urban built-up infrastructure.',
    accentColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-400/30',
    icon: <Sun size={13} className="text-rose-400" />
  },
  nir: {
    id: 'nir',
    label: 'NIR',
    fullName: 'Band 8 (Near-Infrared)',
    bandDesignation: 'B08',
    wavelength: '842 nm',
    spectralRange: '785 – 900 nm',
    description: 'High reflectance from leaf cellular mesophyll and complete absorption in clear water; definitive band for vegetation biomass and shorelines.',
    accentColor: 'text-violet-400',
    badgeBg: 'bg-violet-500/15',
    badgeBorder: 'border-violet-400/30',
    icon: <Sparkles size={13} className="text-violet-400" />
  },
  false_color: {
    id: 'false_color',
    label: 'False Color',
    fullName: 'Color-Infrared (CIR) Composite',
    channelMapping: 'B08 (NIR) → Red • B04 (Red) → Green • B03 (Green) → Blue',
    description: 'Standard remote sensing false-color composite. Dense vegetation reflects strongly in NIR appearing crimson; water absorbs NIR appearing dark navy.',
    accentColor: 'text-fuchsia-400',
    badgeBg: 'bg-fuchsia-500/15',
    badgeBorder: 'border-fuchsia-400/30',
    icon: <Layers size={13} className="text-fuchsia-400" />
  }
};

interface MultispectralPanelProps {
  srPreviewUrl?: string;
  b02Url?: string;
  b03Url?: string;
  b04Url?: string;
  b08Url?: string;
  falseColorUrl?: string;
  bounds?: GeoBounds;
  crs?: string;
  resolution?: string;
}

export const MultispectralPanel: React.FC<MultispectralPanelProps> = ({
  srPreviewUrl,
  b02Url,
  b03Url,
  b04Url,
  b08Url,
  falseColorUrl,
  bounds,
  crs = 'EPSG:32644 (UTM Zone 44N)',
  resolution = '3.33m GSD'
}) => {
  const [selectedBand, setSelectedBand] = useState<BandSelection>('rgb');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [singleBandMode, setSingleBandMode] = useState<'grayscale' | 'spectral'>('grayscale');
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);
  const [sampledPixel, setSampledPixel] = useState<{ r: number; g: number; b: number; a: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const samplingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map selection to appropriate real image URL
  const currentImageUrl = useMemo(() => {
    switch (selectedBand) {
      case 'rgb':
        return resolveApiUrl(srPreviewUrl) || '/sample-satellite/sr.png';
      case 'blue':
        return resolveApiUrl(b02Url) || '/sample-satellite/b02.png';
      case 'green':
        return resolveApiUrl(b03Url) || '/sample-satellite/b03.png';
      case 'red':
        return resolveApiUrl(b04Url) || '/sample-satellite/b04.png';
      case 'nir':
        return resolveApiUrl(b08Url) || '/sample-satellite/b08.png';
      case 'false_color':
        return resolveApiUrl(falseColorUrl) || '/sample-satellite/false_color.png';
      default:
        return resolveApiUrl(srPreviewUrl) || '/sample-satellite/sr.png';
    }
  }, [selectedBand, srPreviewUrl, b02Url, b03Url, b04Url, b08Url, falseColorUrl]);

  const activeConfig = BAND_CONFIGS[selectedBand];
  const isSingleBand = selectedBand === 'blue' || selectedBand === 'green' || selectedBand === 'red' || selectedBand === 'nir';

  // Prepare offline canvas for real pixel value extraction (zero invented data)
  useEffect(() => {
    if (!currentImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 512;
      canvas.height = img.naturalHeight || 512;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        samplingCanvasRef.current = canvas;
      }
    };
  }, [currentImageUrl]);

  // Handle Zoom
  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.min(5, Math.max(0.75, +(prev + delta).toFixed(2))));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const normX = Math.max(0, Math.min(1, relX / rect.width));
    const normY = Math.max(0, Math.min(1, relY / rect.height));

    setCursorPos({ x: relX, y: relY, normX, normY });

    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
    }

    // Query real pixel buffer
    if (samplingCanvasRef.current) {
      const canvas = samplingCanvasRef.current;
      const px = Math.floor(normX * (canvas.width - 1));
      const py = Math.floor(normY * (canvas.height - 1));
      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const pixelData = ctx.getImageData(px, py, 1, 1).data;
          setSampledPixel({
            r: pixelData[0],
            g: pixelData[1],
            b: pixelData[2],
            a: pixelData[3]
          });
        }
      } catch {
        // Fallback silently if canvas security restriction triggers
      }
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    handleZoom(zoomFactor);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Compute live coordinates from GeoTIFF bounds
  const liveCoordinates = useMemo(() => {
    if (!bounds || !cursorPos) return null;
    const lat = bounds.maxLat - cursorPos.normY * (bounds.maxLat - bounds.minLat);
    const lon = bounds.minLon + cursorPos.normX * (bounds.maxLon - bounds.minLon);
    return {
      latStr: `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`,
      lonStr: `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`
    };
  }, [bounds, cursorPos]);

  // Single band tint filter
  const filterStyle = useMemo(() => {
    if (!isSingleBand || singleBandMode === 'grayscale') return undefined;
    switch (selectedBand) {
      case 'blue':
        // Spectral blue tint
        return 'sepia(100%) hue-rotate(180deg) saturate(350%) brightness(1.1)';
      case 'green':
        // Spectral green tint
        return 'sepia(100%) hue-rotate(75deg) saturate(320%) brightness(1.05)';
      case 'red':
        // Spectral red tint
        return 'sepia(100%) hue-rotate(320deg) saturate(400%) brightness(1.1)';
      case 'nir':
        // Spectral NIR violet/infrared tint
        return 'sepia(100%) hue-rotate(240deg) saturate(300%) brightness(1.15)';
      default:
        return undefined;
    }
  }, [isSingleBand, singleBandMode, selectedBand]);

  return (
    <div className="glass rounded-2xl p-5 border border-theme shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
      {/* ── Header: Title & Band Selector ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-theme pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-accent/20 border border-cyan-500/25 flex items-center justify-center">
              <Layers size={13} className="text-accent" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-accent uppercase">
              Multispectral Radiometry
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono glass-panel text-secondary border border-theme">
              Sentinel-2 4-Band
            </span>
          </div>
          <h3 className="text-lg font-bold text-primary tracking-tight">
            Spectral Band Analysis & Composites
          </h3>
        </div>

        {/* ── Band Selector Buttons ── */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 glass-panel rounded-xl border border-theme">
          {(['rgb', 'blue', 'green', 'red', 'nir', 'false_color'] as BandSelection[]).map((key) => {
            const conf = BAND_CONFIGS[key];
            const isSelected = selectedBand === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedBand(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-accent/20 text-cyan-700 border border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-secondary hover:text-secondary hover:glass-panel border border-transparent'
                }`}
              >
                {conf.icon}
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selected Band Metadata Banner ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 glass-panel border border-theme rounded-xl">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold ${activeConfig.badgeBg} ${activeConfig.badgeBorder} border ${activeConfig.accentColor}`}>
            {activeConfig.fullName}
          </span>

          {activeConfig.wavelength && (
            <div className="flex items-center gap-1 font-mono text-secondary">
              <span className="text-muted-foreground">λ:</span>
              <span className="font-bold text-primary">{activeConfig.wavelength}</span>
              {activeConfig.spectralRange && (
                <span className="text-muted-foreground text-[11px]">({activeConfig.spectralRange})</span>
              )}
            </div>
          )}

          {activeConfig.channelMapping && (
            <span className="text-secondary font-mono text-[11px] hidden sm:inline">
              {activeConfig.channelMapping}
            </span>
          )}
        </div>

        {/* View Controls & Single Band Mode Toggle */}
        <div className="flex items-center gap-2">
          {isSingleBand && (
            <div className="flex items-center gap-1 p-0.5 glass-panel rounded-lg border border-theme text-[11px] font-mono">
              <button
                onClick={() => setSingleBandMode('grayscale')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  singleBandMode === 'grayscale'
                    ? 'glass-panel text-primary font-bold'
                    : 'text-secondary hover:text-secondary'
                }`}
                title="Scientific raw radiance grayscale"
              >
                Grayscale
              </button>
              <button
                onClick={() => setSingleBandMode('spectral')}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                  singleBandMode === 'spectral'
                    ? 'bg-accent/20 text-cyan-700 font-bold border border-cyan-200'
                    : 'text-secondary hover:text-secondary'
                }`}
                title="Channel spectral colorization"
              >
                <Palette size={10} />
                Spectral
              </button>
            </div>
          )}

          <span className="text-xs font-mono text-accent/80 bg-accent/20 px-2 py-0.5 rounded border border-cyan-200">
            {resolution}
          </span>
        </div>
      </div>

      {/* ── Main Interactive Viewer Canvas ── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[460px] sm:h-[500px] glass-panel rounded-xl overflow-hidden border border-theme select-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        } ${isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : ''}`}
      >
        {/* Floating Top-Right Toolbar */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1 p-1 glass-panel backdrop-blur-md rounded-lg border border-theme shadow-xl">
          <button
            onClick={() => handleZoom(0.25)}
            className="w-7 h-7 flex items-center justify-center rounded text-secondary hover:text-primary hover:glass-panel transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <span className="px-1.5 text-[11px] font-mono font-bold text-accent min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(-0.25)}
            className="w-7 h-7 flex items-center justify-center rounded text-secondary hover:text-primary hover:glass-panel transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleResetView}
            className="w-7 h-7 flex items-center justify-center rounded text-secondary hover:text-primary hover:glass-panel transition-colors"
            title="Reset View (100%)"
          >
            <RotateCcw size={13} />
          </button>
          <div className="w-px h-4 glass-panel mx-0.5" />
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 flex items-center justify-center rounded text-secondary hover:text-primary hover:glass-panel transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>

        {/* Floating Top-Left Band Badge */}
        <div className="absolute top-3 left-3 z-30 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 glass-panel backdrop-blur-md rounded-lg border border-theme">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              {activeConfig.label}
            </span>
            {activeConfig.wavelength && (
              <span className="text-[11px] font-mono text-cyan-700">
                ({activeConfig.wavelength})
              </span>
            )}
          </div>
        </div>

        {/* Raster Image Layer with Smooth Transform */}
        <div
          className="w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            ref={imageRef}
            src={currentImageUrl}
            alt={activeConfig.fullName}
            className="max-w-full max-h-full object-contain pointer-events-auto"
            style={{
              filter: filterStyle
            }}
            draggable={false}
          />
        </div>

        {/* Floating Bottom Telemetry & Pixel Value Inspector */}
        <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none flex flex-wrap items-center justify-between gap-2">
          {/* Live Geographic Coordinates */}
          <div className="px-3 py-1.5 glass-panel backdrop-blur-md rounded-lg border border-theme text-[11px] font-mono text-secondary flex items-center gap-2">
            <Compass size={12} className="text-accent" />
            {liveCoordinates ? (
              <span>
                {liveCoordinates.latStr} • {liveCoordinates.lonStr}
              </span>
            ) : (
              <span className="text-muted-foreground">Hover across raster for coordinates</span>
            )}
            <span className="text-secondary">|</span>
            <span className="text-secondary text-[10px]">{crs}</span>
          </div>

          {/* Live Pixel Radiance Readout (Real pixel data, zero simulated numbers) */}
          {sampledPixel && (
            <div className="px-3 py-1.5 glass-panel backdrop-blur-md rounded-lg border border-cyan-200 text-[11px] font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Crosshair size={12} className="text-accent" />
              {isSingleBand ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-secondary">{activeConfig.bandDesignation || activeConfig.label} Radiance:</span>
                  <span className="text-primary font-bold">{sampledPixel.r}</span>
                  <span className="text-muted-foreground">/ 255</span>
                  <span className="text-accent font-bold">
                    ({((sampledPixel.r / 255) * 100).toFixed(1)}% Reflectance)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">R:{sampledPixel.r}</span>
                  <span className="text-emerald-600 font-bold">G:{sampledPixel.g}</span>
                  <span className="text-accent font-bold">B:{sampledPixel.b}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Compact Contextual Legend ── */}
      <div className="p-3.5 glass-panel border border-theme rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-secondary">
            <Info size={13} className="text-accent" />
            <span className="font-semibold text-primary">Spectral Interpretation:</span>
            <span>{activeConfig.description}</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
            Radiometric Depth: 8-bit / 256 Levels
          </span>
        </div>

        {/* Legend Bars based on Mode */}
        {isSingleBand ? (
          /* Single Band Radiometric Reflectance Ramp */
          <div className="pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-secondary mb-1">
              <span>0 (Low Reflectance / Absorption)</span>
              <span>128 (Moderate Reflectance)</span>
              <span>255 (High Reflectance / Albedo)</span>
            </div>
            <div
              className="h-3 rounded-full w-full border border-theme"
              style={{
                background:
                  singleBandMode === 'grayscale'
                    ? 'linear-gradient(to right, #FFFFFF, #555555, #aaaaaa, #ffffff)'
                    : selectedBand === 'blue'
                    ? 'linear-gradient(to right, #000814, #003566, #0077b6, #90e0ef)'
                    : selectedBand === 'green'
                    ? 'linear-gradient(to right, #001207, #0b522c, #2d6a4f, #95d5b2)'
                    : selectedBand === 'red'
                    ? 'linear-gradient(to right, #1a0005, #660708, #ba181b, #f5cac3)'
                    : 'linear-gradient(to right, #10002b, #3c096c, #7b2cbf, #e0aaff)'
              }}
            />
          </div>
        ) : selectedBand === 'false_color' ? (
          /* False Color (CIR) Spectral Key */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 flex-shrink-0" />
              <span className="truncate">Dense Vegetation / Canopy</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-accent/10 border border-blue-500/20 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-sm glass-panel-secondary border border-blue-400 flex-shrink-0" />
              <span className="truncate">Water / Moisture (Absorbed)</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-accent/20 border border-cyan-200 text-cyan-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 flex-shrink-0" />
              <span className="truncate">Urban Built-up / Impervious</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/20 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 flex-shrink-0" />
              <span className="truncate">Bare Soil / Fallow Ground</span>
            </div>
          </div>
        ) : (
          /* True Color RGB Reference */
          <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> B02 Blue (490 nm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> B03 Green (560 nm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> B04 Red (665 nm)
            </span>
            <span className="text-muted-foreground hidden sm:inline">Natural Surface Reflectance</span>
          </div>
        )}
      </div>
    </div>
  );
};
