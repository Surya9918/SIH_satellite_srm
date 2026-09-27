import React, { useState, useRef } from 'react';
import { Upload, Satellite, Radio, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { formatBytes } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface SatelliteDropzoneProps {
  onFileSelected: (file: File) => void;
  onLoadSample: () => void;
  selectedFile: File | null;
}

export const SatelliteDropzone: React.FC<SatelliteDropzoneProps> = ({
  onFileSelected,
  onLoadSample,
  selectedFile
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndProcess = (file: File) => {
    setError(null);
    const validExtensions = ['.tif', '.tiff', '.zip'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError('Invalid format. Please upload a GeoTIFF (.tif / .tiff) or Sentinel-2 bundle (.zip).');
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 shadow-sm shadow-cyan-500/30 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-500/50 bg-surface/90 shadow-xl'
            : 'border-blue-100 hover:border-cyan-500/50 bg-surface/70 hover:glass-panel'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".tif,.tiff,.zip"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Radar radar sweep background */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <div className="w-96 h-96 rounded-full border border-cyan-400 animate-pulse"></div>
          <div className="absolute w-64 h-64 rounded-full border border-cyan-400"></div>
          <div className="absolute w-32 h-32 rounded-full border border-cyan-400"></div>
        </div>

        {/* Center Satellite Icon with animated orbit */}
        <div className="relative mb-6">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center border transition-all ${
            isDragging
              ? 'border-cyan-300 bg-accent/20 text-cyan-700 shadow-[0_0_25px_rgba(0,240,255,0.6)]'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-950/60 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'border-cyan-200 glass-panel text-accent'
          }`}>
            <Satellite className={`h-10 w-10 ${isDragging ? 'animate-bounce' : 'animate-pulse-slow'}`} />
          </div>

          {/* Orbiting blip */}
          <div className="absolute -inset-2 animate-spin duration-10000 pointer-events-none">
            <span className="absolute top-0 left-1/2 -ml-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
          </div>
        </div>

        {/* State description */}
        {selectedFile ? (
          <div className="text-center">
            <Badge variant="emerald" dot className="mb-2">
              SATELLITE DATA DETECTED
            </Badge>
            <h3 className="text-lg font-bold text-primary font-mono break-all max-w-md">
              {selectedFile.name}
            </h3>
            <p className="text-xs font-mono text-secondary mt-1">
              {formatBytes(selectedFile.size)} • Click or drop another file to replace
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Badge variant="cyan" className="mb-2 uppercase tracking-widest text-[10px]">
              MISSION CONTROL INGESTION CONSOLE
            </Badge>
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-1 font-mono">
              {isDragging ? 'RELEASE SATELLITE RASTER' : 'DROP SENTINEL-2 GEOTIFF HERE'}
            </h3>
            <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
              Drag and drop your 4-band multispectral GeoTIFF, or click to browse files
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Supported: .TIF, .TIFF (B02, B03, B04, B08)</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500 text-red-700 text-xs font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>

      {/* Quick Sample Loader Option */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-secondary p-3 rounded-xl border border-blue-100 glass-panel">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent shrink-0" />
          <span>Need a verified Sentinel-2 multispectral dataset to test?</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLoadSample();
          }}
          className="px-3 py-1.5 rounded-md glass-panel hover:bg-space-border border border-cyan-200 text-cyan-700 hover:text-primary font-bold transition-all"
        >
          Load NTRO Benchmark GeoTIFF (Agriculture)
        </button>
      </div>
    </div>
  );
};
