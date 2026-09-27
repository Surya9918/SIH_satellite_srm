import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload, FileImage, X, AlertCircle, CheckCircle2,
  Layers, HardDrive, Compass, Target, ShieldCheck, RefreshCw, FileText
} from 'lucide-react';
import { inspectAndValidateRaster, RasterMetadata, RasterInspectionResult } from '../../lib/rasterInspection';

interface ImageUploaderProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  selectedFile?: File | null;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  onClear?: () => void;
  onValidationChange?: (isValid: boolean, error: string | null, metadata?: RasterMetadata | null) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  onFilesSelect,
  selectedFile,
  selectedFiles = [],
  onRemoveFile,
  onClear,
  onValidationChange,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResults, setInspectionResults] = useState<Map<string, RasterInspectionResult>>(new Map());
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Normalize files array: if selectedFiles has items use it, else fallback to selectedFile
  const allFiles = selectedFiles.length > 0 ? selectedFiles : (selectedFile ? [selectedFile] : []);

  // Inspect file(s) whenever allFiles changes
  useEffect(() => {
    let isCancelled = false;

    if (allFiles.length === 0) {
      setInspectionResults(new Map());
      setGeneralError(null);
      onValidationChange?.(false, null, null);
      return;
    }

    const inspectAll = async () => {
      setIsInspecting(true);
      const resultsMap = new Map<string, RasterInspectionResult>();
      let allValid = true;
      let firstError: string | null = null;
      let primaryMetadata: RasterMetadata | null = null;

      for (const file of allFiles) {
        const result = await inspectAndValidateRaster(file);
        if (isCancelled) return;
        resultsMap.set(file.name, result);

        if (!result.isValid) {
          allValid = false;
          if (!firstError) firstError = result.error || `Invalid satellite raster "${file.name}"`;
        } else if (!primaryMetadata && result.metadata) {
          primaryMetadata = result.metadata;
        }
      }

      if (isCancelled) return;
      setInspectionResults(resultsMap);
      setGeneralError(firstError);
      setIsInspecting(false);
      onValidationChange?.(allValid, firstError, primaryMetadata);
    };

    inspectAll();

    return () => {
      isCancelled = true;
    };
  }, [allFiles]); // eslint-disable-line

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setGeneralError(null);

    if (onFilesSelect) {
      onFilesSelect(files);
    }
    if (onFileSelect) {
      onFileSelect(files[0]);
    }
  }, [onFilesSelect, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) handleFiles(droppedFiles);
  }, [disabled, handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files ? Array.from(e.target.files) : [];
    if (inputFiles.length > 0) handleFiles(inputFiles);
    e.target.value = '';
  };

  const handleClear = () => {
    setGeneralError(null);
    setInspectionResults(new Map());
    onClear?.();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  // ── Selected File(s) View: Shows Metadata Card & Validation Status ──
  if (allFiles.length > 0) {
    const primaryFile = allFiles[0];
    const primaryResult = inspectionResults.get(primaryFile.name);
    const meta = primaryResult?.metadata;
    const isPrimaryValid = primaryResult?.isValid ?? true;

    return (
      <div className="space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {isInspecting ? (
              <RefreshCw size={15} className="text-accent animate-spin" />
            ) : isPrimaryValid ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="text-rose-400" />
            )}
            <span className={`text-xs font-bold ${
              isInspecting ? 'text-accent' : isPrimaryValid ? 'text-emerald-600' : 'text-rose-400'
            }`}>
              {isInspecting
                ? 'Inspecting Satellite Metadata…'
                : isPrimaryValid
                ? allFiles.length > 1
                  ? `${allFiles.length} Satellite Rasters Selected (Batch Mode)`
                  : 'Satellite Raster Verified & Ready'
                : 'Validation Failed'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-secondary hover:text-rose-400 transition-colors font-medium"
          >
            Clear File
          </button>
        </div>

        {/* Validation Error Alert */}
        {generalError && (
          <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300">
            <AlertCircle size={17} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block mb-0.5">Validation Error</span>
              <span>{generalError}</span>
            </div>
          </div>
        )}

        {/* Primary File Metadata Card */}
        {meta && (
          <div className="rounded-2xl border border-cyan-200 bg-surface/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.06)] space-y-4">
            {/* File title & type badge */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-theme">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-accent/20 border border-cyan-200 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                  <FileImage size={20} className="text-cyan-700" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-primary truncate max-w-sm" title={meta.filename}>
                    {meta.filename}
                  </h4>
                  <p className="text-[11px] text-cyan-700 font-mono mt-0.5">
                    {meta.fileType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-1 rounded glass-panel border border-theme text-secondary">
                  {formatSize(meta.fileSize)}
                </span>
                {meta.bandCount === 4 && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-700">
                    4-Band Native
                  </span>
                )}
              </div>
            </div>

            {/* Extracted Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Dimensions */}
              <div className="p-3 rounded-xl glass-panel border border-theme">
                <div className="text-[10px] uppercase font-mono tracking-wider text-secondary mb-1 flex items-center gap-1">
                  <Target size={11} className="text-accent" /> Dimensions
                </div>
                <div className="font-bold text-primary font-mono text-xs">
                  {meta.dimensions}
                </div>
              </div>

              {/* Number of Bands */}
              <div className="p-3 rounded-xl glass-panel border border-theme">
                <div className="text-[10px] uppercase font-mono tracking-wider text-secondary mb-1 flex items-center gap-1">
                  <Layers size={11} className="text-accent" /> Spectral Bands
                </div>
                <div className="font-bold text-primary font-mono text-xs">
                  {meta.bandCount} Channels
                </div>
              </div>

              {/* Spatial Resolution */}
              <div className="p-3 rounded-xl glass-panel border border-theme">
                <div className="text-[10px] uppercase font-mono tracking-wider text-secondary mb-1 flex items-center gap-1">
                  <HardDrive size={11} className="text-accent" /> Resolution (GSD)
                </div>
                <div className="font-bold text-amber-700 font-mono text-xs truncate" title={meta.spatialResolution}>
                  {meta.spatialResolution}
                </div>
              </div>

              {/* CRS / Projection */}
              <div className="p-3 rounded-xl glass-panel border border-theme">
                <div className="text-[10px] uppercase font-mono tracking-wider text-secondary mb-1 flex items-center gap-1">
                  <Compass size={11} className="text-accent" /> CRS / Projection
                </div>
                <div className="font-bold text-emerald-700 font-mono text-xs truncate" title={meta.crs}>
                  {meta.crs}
                </div>
              </div>
            </div>

            {/* Spectral Band Breakdown Strip */}
            <div className="p-3 rounded-xl glass-panel border border-theme flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-accent flex-shrink-0" />
                <span className="text-secondary font-medium">
                  {meta.bandsDescription}
                </span>
              </div>
              {meta.bitsPerSample && (
                <span className="text-[10px] font-mono text-secondary glass-panel px-2 py-0.5 rounded border border-theme">
                  {meta.bitsPerSample}
                </span>
              )}
            </div>
          </div>
        )}

        {/* If multiple batch files are uploaded, list them */}
        {allFiles.length > 1 && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div className="text-[11px] font-bold text-secondary uppercase tracking-wider px-1">
              Batch Queue ({allFiles.length} files)
            </div>
            {allFiles.map((file, idx) => {
              const res = inspectionResults.get(file.name);
              const isValid = res?.isValid ?? true;
              return (
                <div
                  key={`${file.name}-${idx}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isValid
                      ? 'border-theme glass-panel hover:border-cyan-200'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileImage size={15} className={isValid ? 'text-accent' : 'text-rose-400'} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-secondary truncate max-w-xs" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[10px] text-secondary font-mono">
                        {formatSize(file.size)} {res?.metadata ? `· ${res.metadata.dimensions} · ${res.metadata.bandCount} bands` : ''}
                      </div>
                    </div>
                  </div>

                  {onRemoveFile && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile(idx)}
                      className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10"
                      title="Remove file"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Change file action */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-accent hover:text-cyan-700 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>Replace / Select Different File</span>
          </button>
        </div>

        <input
          ref={inputRef}
          id="satellite-file-input-change"
          type="file"
          accept=".tif,.tiff"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // ── Empty State: Follows the exact requested UI specifications ──
  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragActive
            ? 'border-cyan-400 bg-accent/20 shadow-[0_0_30px_rgba(0,212,255,0.2)]'
            : 'border-theme bg-surface/60 hover:border-cyan-200 hover:bg-surface/80'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); if (!disabled) setIsDragActive(true); }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
        onDrop={handleDrop}
        onClick={() => { if (!disabled) inputRef.current?.click(); }}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          {/* Header Title */}
          <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/20 border border-cyan-400/30">
            <Upload size={13} className="text-cyan-700" />
            <span className="font-mono text-xs font-bold tracking-widest text-cyan-700 uppercase">
              UPLOAD 4-BAND GEOTIFF
            </span>
          </div>

          {/* Main prompt */}
          <h3 className="text-base sm:text-lg font-bold text-primary mb-2">
            Upload 4-Band Sentinel-2 GeoTIFF
          </h3>
          <p className="text-xs text-secondary mb-5 max-w-sm leading-relaxed">
            Provide a single GeoTIFF containing all four Sentinel-2 spectral bands:
            Band 1 = B02 Blue, Band 2 = B03 Green, Band 3 = B04 Red, Band 4 = B08 NIR.
          </p>

          {/* Workflow steps */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 text-[10px] font-mono">
            {[
              'Upload 4-Band GeoTIFF',
              'Validate Sentinel-2 Bands',
              'Run Super Resolution',
              'Before / After',
              'RGB / NIR / False Color',
              'Download SR GeoTIFF',
            ].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span className="px-2 py-0.5 rounded glass-panel border border-theme text-secondary">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-secondary">↓</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Choose File button */}
          <button
            type="button"
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-[length:200%_auto] hover:bg-right text-primary font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.35)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all duration-300"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            disabled={disabled}
          >
            <span>Choose GeoTIFF File</span>
          </button>

          {/* Supported formats */}
          <div className="mt-8 pt-6 border-t border-theme w-full max-w-md">
            <div className="text-[11px] font-mono uppercase tracking-wider text-secondary mb-2 font-semibold">
              Accepted Input:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg glass-panel border border-cyan-500/25 text-cyan-700 font-medium">
                .tif / .tiff (GeoTIFF)
              </span>
              <span className="px-2.5 py-1 rounded-lg glass-panel border border-cyan-500/25 text-cyan-700 font-medium">
                4 bands: B02, B03, B04, B08
              </span>
              <span className="px-2.5 py-1 rounded-lg glass-panel border border-theme text-secondary font-medium">
                Georeferenced (EPSG embedded)
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">
              Max file size: 500 MB • Output: 4-band georeferenced GeoTIFF at 3× resolution
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          id="satellite-file-input"
          type="file"
          accept=".tif,.tiff"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error display */}
      {generalError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300">
          <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
          <span>{generalError}</span>
        </div>
      )}
    </div>
  );
};

