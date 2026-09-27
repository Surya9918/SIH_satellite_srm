import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  ChevronsLeftRight, ZoomIn, ZoomOut, Maximize2, Minimize2,
  RotateCcw, Grid3X3, Compass, Layers, Eye, ShieldAlert,
  Sparkles, Check, Info, MousePointer2
} from 'lucide-react';

export interface InteractiveComparisonViewerProps {
  originalUrl: string;
  superResolvedUrl: string;
  ndviUrl?: string;
  uncertaintyUrl?: string;
  originalLabel?: string;
  superResolvedLabel?: string;
  originalResolution?: string;
  enhancedResolution?: string;
  crs?: string;
  bounds?: {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  };
  center?: [number, number];
  height?: string;
  initialPosition?: number;
  className?: string;
}

type ActiveBandLayer = 'rgb' | 'ndvi' | 'uncertainty';

export const InteractiveComparisonViewer: React.FC<InteractiveComparisonViewerProps> = ({
  originalUrl,
  superResolvedUrl,
  ndviUrl,
  uncertaintyUrl,
  originalLabel = 'ORIGINAL',
  superResolvedLabel = 'SUPER-RESOLVED',
  originalResolution = '10m GSD',
  enhancedResolution = '~3.33m GSD',
  crs = 'EPSG:32644 (UTM Zone 44N)',
  bounds = { minLon: 78.452, minLat: 17.385, maxLon: 78.5032, maxLat: 17.4362 },
  center = [17.4106, 78.4776],
  height = '560px',
  initialPosition = 50,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(initialPosition); // 0 - 100 percentage
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  // Optional features
  const [showPixelGrid, setShowPixelGrid] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [activeLayer, setActiveLayer] = useState<ActiveBandLayer>('rgb');
  const [cursorGeo, setCursorGeo] = useState<{
    lat: number;
    lon: number;
    pixelX: number;
    pixelY: number;
  }>({
    lat: center[0],
    lon: center[1],
    pixelX: 512,
    pixelY: 512,
  });

  // Determine active Super-Resolved image based on band selector
  const currentSuperResolvedUrl =
    activeLayer === 'ndvi' && ndviUrl
      ? ndviUrl
      : activeLayer === 'uncertainty' && uncertaintyUrl
      ? uncertaintyUrl
      : superResolvedUrl;

  const currentSuperResolvedLabel =
    activeLayer === 'ndvi'
      ? 'NDVI VEGETATION INDEX'
      : activeLayer === 'uncertainty'
      ? 'UNCERTAINTY VARIANCE'
      : superResolvedLabel;

  // Handle position calculation from clientX
  const calculatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return position;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  }, [position]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const handleX = (position / 100) * rect.width;

    // If clicked within 20px of handle, drag handle; else initiate pan
    if (Math.abs(clickX - handleX) < 24) {
      e.preventDefault();
      setIsDraggingHandle(true);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Handle Mouse Move over container (computes coordinates and handles dragging/panning)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingHandle) {
        setPosition(calculatePosition(e.clientX));
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }

      // Compute cursor coordinates if container exists
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        const lon = bounds.minLon + normX * (bounds.maxLon - bounds.minLon);
        const lat = bounds.maxLat - normY * (bounds.maxLat - bounds.minLat);
        const pixelX = Math.round(normX * 1024);
        const pixelY = Math.round(normY * 1024);

        setCursorGeo({ lat, lon, pixelX, pixelY });
      }
    },
    [isDraggingHandle, isPanning, panStart, calculatePosition, bounds]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingHandle(false);
    setIsPanning(false);
  }, []);

  // Global mouse up / mouse move listeners when interacting
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const onMouseUp = () => handleMouseUp();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Touch handlers for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || e.touches.length === 0) return;
    const rect = container.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const handleX = (position / 100) * rect.width;

    if (Math.abs(touchX - handleX) < 32) {
      setIsDraggingHandle(true);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    if (isDraggingHandle) {
      setPosition(calculatePosition(e.touches[0].clientX));
    } else if (isPanning) {
      setPan({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.max(0.6, Math.min(5.0, Number((z + delta).toFixed(2)))));
  };

  // Keyboard shortcut for reset or fullscreen escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreen]);

  // Reset view
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPosition(50);
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(5.0, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Number((z - 0.25).toFixed(2))));

  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-theme glass-panel overflow-hidden shadow-sm select-none ${
        fullscreen ? 'fixed inset-0 z-[100] rounded-none border-none' : className
      }`}
    >
      {/* ── Top Bar: Mode & Layer Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-surface/95 border-b border-theme backdrop-blur-md z-30">
        {/* Left: Band Selector Pills */}
        <div className="flex items-center gap-1.5 glass-panel p-1 rounded-xl border border-theme">
          <span className="text-[10px] font-mono uppercase tracking-wider text-secondary px-2 flex items-center gap-1">
            <Layers size={11} className="text-accent" /> Output:
          </span>

          <button
            type="button"
            onClick={() => setActiveLayer('rgb')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeLayer === 'rgb'
                ? 'bg-accent/20 text-cyan-700 border border-cyan-200 shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                : 'text-secondary hover:text-secondary'
            }`}
          >
            True Color (RGB)
          </button>

          {ndviUrl && (
            <button
              type="button"
              onClick={() => setActiveLayer('ndvi')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLayer === 'ndvi'
                  ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'text-secondary hover:text-secondary'
              }`}
            >
              NDVI Vegetation
            </button>
          )}

          {uncertaintyUrl && (
            <button
              type="button"
              onClick={() => setActiveLayer('uncertainty')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLayer === 'uncertainty'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'text-secondary hover:text-secondary'
              }`}
            >
              Uncertainty Map
            </button>
          )}
        </div>

        {/* Right: Auxiliary Toggles (Pixel Grid, Coordinates, Reset, Fullscreen) */}
        <div className="flex items-center gap-2">
          {/* Pixel Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowPixelGrid(!showPixelGrid)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all border ${
              showPixelGrid
                ? 'bg-accent/20 text-cyan-700 border-cyan-200 shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                : 'glass-panel text-secondary border-theme hover:glass-panel'
            }`}
            title="Toggle macro vs sub-pixel grid"
          >
            <Grid3X3 size={13} />
            <span className="hidden sm:inline">Pixel Grid</span>
          </button>

          {/* Coordinates Toggle */}
          <button
            type="button"
            onClick={() => setShowCoordinates(!showCoordinates)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all border ${
              showCoordinates
                ? 'bg-accent/20 text-cyan-700 border-cyan-200'
                : 'glass-panel text-secondary border-theme hover:glass-panel'
            }`}
            title="Toggle cursor coordinates bar"
          >
            <Compass size={13} />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          <div className="h-4 w-px glass-panel mx-1" />

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setFullscreen(!fullscreen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg glass-panel hover:glass-panel text-secondary hover:text-primary border border-theme transition-all"
            title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ── Main Comparison Canvas Area ── */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden w-full select-none ${
          isDraggingHandle
            ? 'cursor-col-resize'
            : isPanning
            ? 'cursor-grabbing'
            : zoom > 1
            ? 'cursor-grab'
            : 'cursor-default'
        }`}
        style={{ height: fullscreen ? 'calc(100vh - 84px)' : height }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Layer 1: ORIGINAL (Left Side, Low-Resolution Input) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.12s ease-out',
            }}
          >
            <img
              src={originalUrl}
              alt="Original Sentinel-2 Satellite Input"
              className="max-w-full max-h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Layer 2: SUPER-RESOLVED (Right Side, Reconstructed Output), Clipped from position% to 100% */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            clipPath: `polygon(${position}% 0%, 100% 0%, 100% 100%, ${position}% 100%)`,
            WebkitClipPath: `polygon(${position}% 0%, 100% 0%, 100% 100%, ${position}% 100%)`,
          }}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.12s ease-out',
            }}
          >
            <img
              src={currentSuperResolvedUrl}
              alt="Super-Resolved Reconstructed Output"
              className="max-w-full max-h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Optional Pixel Grid Overlay (Scales with Zoom) */}
        {showPixelGrid && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-45"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              backgroundImage: `
                linear-gradient(to right, rgba(0, 212, 255, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 212, 255, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />
        )}

        {/* ── Vertical Draggable Divider Handle ── */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Glowing line */}
          <div className="w-[2px] h-full bg-gradient-to-b from-cyan-400 via-sky-300 to-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.9)]" />

          {/* Draggable Circular Knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-[1px] w-10 h-10 rounded-full glass-panel border-2 border-cyan-400 shadow-[0_0_24px_rgba(0,212,255,0.7)] flex items-center justify-center cursor-col-resize pointer-events-auto transform hover:scale-110 active:scale-95 transition-transform"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDraggingHandle(true);
            }}
          >
            <ChevronsLeftRight size={17} className="text-cyan-700 animate-pulse" />
          </div>
        </div>

        {/* ── Metadata Overlay Badges (Top Left & Top Right) ── */}
        {/* Left Side: ORIGINAL */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="rounded-xl bg-surface/85 backdrop-blur-md border border-theme p-2.5 shadow-xl">
            <div className="text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">
              {originalLabel}
            </div>
            <div className="text-xs font-black text-primary font-mono mt-0.5">
              {originalResolution}
            </div>
          </div>
        </div>

        {/* Right Side: SUPER-RESOLVED */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="rounded-xl bg-surface/85 backdrop-blur-md border border-cyan-200 p-2.5 shadow-[0_0_20px_rgba(0,212,255,0.15)] text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold flex items-center justify-end gap-1">
              <Sparkles size={11} className="text-accent" />
              <span>{currentSuperResolvedLabel}</span>
            </div>
            <div className="text-xs font-black text-cyan-800 font-mono mt-0.5">
              {enhancedResolution}
            </div>
          </div>
        </div>

        {/* First-time Interaction Hint */}
        {position === initialPosition && !isDraggingHandle && zoom === 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-bounce">
            <div className="px-3.5 py-1.5 rounded-full glass-panel backdrop-blur-md border border-cyan-200 text-secondary text-xs font-medium flex items-center gap-2 shadow-lg">
              <ChevronsLeftRight size={13} className="text-accent" />
              <span>Drag handle left or right to compare · Scroll to zoom</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Floating Action Bar & Telemetry ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface/95 border-t border-theme text-xs font-mono z-30">
        {/* Left: Zoom Controls */}
        <div className="flex items-center gap-1 glass-panel p-1 rounded-xl border border-theme">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.6}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-secondary hover:text-primary hover:glass-panel disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>

          <span className="w-14 text-center font-bold text-cyan-700 text-xs select-none">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 5.0}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-secondary hover:text-primary hover:glass-panel disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>

          <div className="h-4 w-px glass-panel mx-1" />

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 flex items-center gap-1 rounded-lg text-secondary hover:text-cyan-700 hover:glass-panel transition-all"
            title="Reset Zoom, Pan & Slider"
          >
            <RotateCcw size={12} />
            <span className="text-[11px]">Reset View</span>
          </button>
        </div>

        {/* Middle/Right: Live Coordinates & Telemetry */}
        {showCoordinates && (
          <div className="flex items-center gap-4 text-[11px] text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Lat:</span>
              <span className="text-primary font-bold">{cursorGeo.lat.toFixed(4)}°N</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Lon:</span>
              <span className="text-primary font-bold">{cursorGeo.lon.toFixed(4)}°E</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-muted-foreground">Pixel:</span>
              <span className="text-cyan-700">({cursorGeo.pixelX}, {cursorGeo.pixelY})</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground">
              <span>CRS:</span>
              <span className="text-emerald-600">{crs}</span>
            </div>
          </div>
        )}

        {/* Right: Slider Position */}
        <div className="text-[11px] text-secondary">
          Split: <span className="text-cyan-700 font-bold">{Math.round(position)}%</span>
        </div>
      </div>
    </div>
  );
};
