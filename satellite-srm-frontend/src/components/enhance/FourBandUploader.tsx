import React, { useState, useRef } from 'react';
import {
  Upload, CheckCircle2, AlertCircle, FileUp, Sparkles,
  Layers, ShieldAlert, ChevronDown, RefreshCw, X
} from 'lucide-react';
import { FourBandFiles } from '../../types/satellite';
import { useSrmStore } from '../../store/useSrmStore';
import { MultispectralUploadViewer } from './MultispectralUploadViewer';

interface FourBandUploaderProps {
  onValidate: () => Promise<void>;
  isValidating: boolean;
  validationError: string | null;
  disabled?: boolean;
}

interface BandConfig {
  key: keyof FourBandFiles;
  name: string;
  colorName: string;
  wavelength: string;
  gsd: string;
  badgeColor: string;
  borderColor: string;
  dotColor: string;
  description: string;
}

const BAND_CONFIGS: BandConfig[] = [
  {
    key: 'b02',
    name: 'B02',
    colorName: 'Blue',
    wavelength: '490 nm',
    gsd: '10m GSD',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    borderColor: 'hover:border-blue-500/50',
    dotColor: 'bg-blue-500 dark:bg-blue-400',
    description: 'Atmospheric aerosols, water body penetration, soil/vegetation discrimination'
  },
  {
    key: 'b03',
    name: 'B03',
    colorName: 'Green',
    wavelength: '560 nm',
    gsd: '10m GSD',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    borderColor: 'hover:border-emerald-500/50',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
    description: 'Vegetation peak reflectance, canopy health, chlorophyll concentration'
  },
  {
    key: 'b04',
    name: 'B04',
    colorName: 'Red',
    wavelength: '665 nm',
    gsd: '10m GSD',
    badgeColor: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
    borderColor: 'hover:border-red-500/50',
    dotColor: 'bg-red-500 dark:bg-red-400',
    description: 'Chlorophyll absorption maximum, vegetation index lower anchor'
  },
  {
    key: 'b08',
    name: 'B08',
    colorName: 'NIR (Near-Infrared)',
    wavelength: '842 nm',
    gsd: '10m GSD',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
    borderColor: 'hover:border-purple-500/50',
    dotColor: 'bg-purple-500 dark:bg-purple-400',
    description: 'High cellular leaf scattering, biomass evaluation, water boundary edge detection'
  },
];

export const FourBandUploader: React.FC<FourBandUploaderProps> = ({
  onValidate,
  isValidating,
  validationError,
  disabled = false
}) => {
  const { fourBands, setFourBand, setAllFourBands } = useSrmStore();
  const [isDragOverAll, setIsDragOverAll] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);

  // Hidden input refs for individual slot picking
  const slotInputRefs = {
    b02: useRef<HTMLInputElement>(null),
    b03: useRef<HTMLInputElement>(null),
    b04: useRef<HTMLInputElement>(null),
    b08: useRef<HTMLInputElement>(null),
  };
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect band from filename
  const detectBandFromFilename = (filename: string): keyof FourBandFiles | null => {
    const fn = filename.toLowerCase();
    if (fn.includes('b02') || fn.includes('_b2_') || fn.includes('-b2.') || fn.includes('blue')) return 'b02';
    if (fn.includes('b03') || fn.includes('_b3_') || fn.includes('-b3.') || fn.includes('green')) return 'b03';
    if (fn.includes('b04') || fn.includes('_b4_') || fn.includes('-b4.') || fn.includes('red')) return 'b04';
    if (fn.includes('b08') || fn.includes('_b8_') || fn.includes('-b8.') || fn.includes('nir')) return 'b08';
    return null;
  };

  // Handle multi-file selection or multi-drop
  const handleMultiFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newBands = { ...fourBands };
    const unassigned: File[] = [];

    // Step 1: Detect from filenames
    fileArray.forEach(file => {
      const detected = detectBandFromFilename(file.name);
      if (detected && !newBands[detected]) {
        newBands[detected] = file;
      } else {
        unassigned.push(file);
      }
    });

    // Step 2: Fill remaining empty slots with unassigned files in standard order
    const bandKeys: (keyof FourBandFiles)[] = ['b02', 'b03', 'b04', 'b08'];
    bandKeys.forEach(key => {
      if (!newBands[key] && unassigned.length > 0) {
        newBands[key] = unassigned.shift()!;
      }
    });

    setAllFourBands(newBands);
  };

  // Individual slot file selection
  const handleSlotFileChange = (bandKey: keyof FourBandFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFourBand(bandKey, file);
    }
    e.target.value = '';
  };

  // Drag & drop on individual slot
  const handleSlotDrop = (bandKey: keyof FourBandFiles, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length === 1) {
        setFourBand(bandKey, e.dataTransfer.files[0]);
      } else {
        handleMultiFiles(e.dataTransfer.files);
      }
    }
  };

  // Drop anywhere in the container
  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverAll(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultiFiles(e.dataTransfer.files);
    }
  };

  // Load genuine sample Sentinel-2 bands from public/sample-satellite/
  const handleLoadSampleBands = async () => {
    try {
      setIsLoadingSample(true);
      setSampleError(null);

      const fetchSample = async (filename: string, bandName: string) => {
        const res = await fetch(`/sample-satellite/${filename}`);
        if (!res.ok) throw new Error(`Could not fetch sample ${filename}`);
        const blob = await res.blob();
        return new File([blob], filename, { type: 'image/tiff' });
      };

      const [b02File, b03File, b04File, b08File] = await Promise.all([
        fetchSample('S2_B02.tif', 'B02'),
        fetchSample('S2_B03.tif', 'B03'),
        fetchSample('S2_B04.tif', 'B04'),
        fetchSample('S2_B08.tif', 'B08'),
      ]);

      setAllFourBands({
        b02: b02File,
        b03: b03File,
        b04: b04File,
        b08: b08File,
      });
    } catch (err) {
      console.error('Failed to load sample Sentinel-2 bands:', err);
      setSampleError('Demo data unavailable. Please upload B02, B03, B04 and B08 manually.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Check if all four bands are loaded
  const allBandsLoaded = Boolean(
    fourBands.b02 && fourBands.b03 && fourBands.b04 && fourBands.b08
  );

  const loadedCount = [fourBands.b02, fourBands.b03, fourBands.b04, fourBands.b08].filter(Boolean).length;

  return (
    <div
      className={`space-y-6 rounded-2xl border transition-all duration-300 p-6 ${
        isDragOverAll
          ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(0,212,255,0.2)]'
          : 'bg-white/75 dark:bg-slate-950/60 backdrop-blur-xl border-slate-900/10 dark:border-white/15 shadow-sm'
      }`}
      onDragEnter={(e) => { e.preventDefault(); if (!disabled) setIsDragOverAll(true); }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOverAll(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragOverAll(false); }}
      onDrop={handleContainerDrop}
    >
      {/* ── Top Header Strip ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900/10 dark:border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <Layers size={13} className="text-cyan-600 dark:text-cyan-400" />
            Option A · 4-Band Sentinel-2 Ingestion
          </div>
          <h3 className="text-xl font-bold text-primary tracking-tight">
            Sentinel-2 Multispectral Input
          </h3>
          <p className="text-xs text-secondary mt-1 max-w-xl leading-relaxed">
            Upload the four required 10m Sentinel-2 band files individually or select all 4 at once.
            Filenames will be automatically matched to their respective spectral channels.
          </p>
        </div>

        {/* Multi-file picker */}
        <div className="flex items-center gap-3">
          <input
            ref={multiFileInputRef}
            type="file"
            multiple
            accept=".tif,.tiff"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleMultiFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => multiFileInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/40 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800/50 text-cyan-800 dark:text-cyan-100 text-xs font-bold transition-all shadow-sm"
          >
            <FileUp size={14} />
            <span>Select 4 Files</span>
          </button>
        </div>
      </div>

      {sampleError && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs">
          <AlertCircle size={15} className="shrink-0 text-red-600" />
          <span>{sampleError}</span>
        </div>
      )}

      {/* ── 3D Multispectral Upload & Orbital Stream Animation ── */}
      <MultispectralUploadViewer fourBands={fourBands} />

      {/* ── 4 Dedicated Band Upload Slots ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BAND_CONFIGS.map((config) => {
          const file = fourBands[config.key];
          const isSlotActive = dragOverSlot === config.key;

          return (
            <div
              key={config.key}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(config.key); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(config.key); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(null); }}
              onDrop={(e) => handleSlotDrop(config.key, e)}
              className={`relative rounded-xl p-4 transition-all duration-200 backdrop-blur-xl border ${
                isSlotActive
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,212,255,0.25)]'
                  : file
                  ? 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 hover:border-emerald-500/50'
                  : 'bg-white/80 border-slate-900/15 dark:bg-slate-950/65 dark:border-white/20 hover:border-slate-900/25 dark:hover:border-white/30'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                  <span className="font-mono text-sm font-bold text-primary tracking-wide">
                    {config.name}
                  </span>
                  <span className="text-xs text-secondary font-medium">
                    — {config.colorName}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${config.badgeColor}`}>
                    {config.wavelength}
                  </span>
                </div>

                {file && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Ready
                  </span>
                )}
              </div>

              <p className="text-[11px] text-secondary mb-3 leading-relaxed">
                {config.description}
              </p>

              {/* Slot Content: File Assigned vs Empty */}
              {file ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-950/60 border border-slate-900/10 dark:border-white/15 backdrop-blur-md">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-medium text-primary truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {(file.size / 1024).toFixed(1)} KB • {config.gsd}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Manual reassign selector */}
                    <div className="relative group">
                      <select
                        value={config.key}
                        onChange={(e) => {
                          const targetKey = e.target.value as keyof FourBandFiles;
                          if (targetKey !== config.key) {
                            const targetFile = fourBands[targetKey];
                            setAllFourBands({
                              ...fourBands,
                              [config.key]: targetFile,
                              [targetKey]: file,
                            });
                          }
                        }}
                        className="text-[10px] font-mono bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-900/80 border border-slate-900/10 dark:border-white/20 rounded px-2 py-1 text-secondary focus:outline-none focus:border-cyan-400 cursor-pointer"
                        title="Change assigned band"
                      >
                        <option value="b02" className="bg-white dark:bg-slate-800">B02 Blue</option>
                        <option value="b03" className="bg-white dark:bg-slate-800">B03 Green</option>
                        <option value="b04" className="bg-white dark:bg-slate-800">B04 Red</option>
                        <option value="b08" className="bg-white dark:bg-slate-800">B08 NIR</option>
                      </select>
                    </div>

                    {/* Remove file button */}
                    <button
                      type="button"
                      onClick={() => setFourBand(config.key, null)}
                      className="p-1 rounded text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => slotInputRefs[config.key].current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-lg border border-dashed border-slate-300 dark:border-white/20 bg-white/60 dark:bg-slate-950/60 hover:bg-white/80 dark:hover:bg-slate-950/80 cursor-pointer transition-all text-center group backdrop-blur-md"
                >
                  <Upload size={18} className="text-secondary group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-1.5" />
                  <span className="text-xs font-semibold text-primary group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                    Upload {config.name} ({config.colorName})
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    Click to browse or drop .tif
                  </span>
                </div>
              )}

              {/* Hidden file input for this specific band */}
              <input
                ref={slotInputRefs[config.key]}
                type="file"
                accept=".tif,.tiff"
                onChange={(e) => handleSlotFileChange(config.key, e)}
                className="hidden"
                disabled={disabled}
              />
            </div>
          );
        })}
      </div>

      {/* ── Status Bar & Validation / Demo Error ── */}
      {(validationError || sampleError) && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert size={16} className="text-red-600 shrink-0" />
            <span>{sampleError ? 'Demo Error' : 'Validation Error'}</span>
          </div>
          <p className="text-secondary pl-6 leading-relaxed">
            {sampleError || validationError}
          </p>
        </div>
      )}

      {/* ── Bottom Action Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-900/10 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-secondary">Bands Loaded:</span>
          <span className={`font-bold ${loadedCount === 4 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
            {loadedCount} / 4
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-secondary">Order:</span>
          <span className="text-primary font-medium">B02 → B03 → B04 → B08</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Demo Button */}
          <button
            type="button"
            id="multispectral-demo-btn"
            onClick={handleLoadSampleBands}
            disabled={disabled || isLoadingSample}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 bg-white/70 dark:bg-slate-900/70 hover:bg-white/90 dark:hover:bg-slate-900/90 border border-slate-300 dark:border-white/20 text-primary cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md"
          >
            {isLoadingSample ? (
              <>
                <RefreshCw size={15} className="animate-spin text-cyan-600 dark:text-cyan-400" />
                <span>Loading Demo...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="text-cyan-600 dark:text-cyan-400" />
                <span>Demo</span>
              </>
            )}
          </button>

          {/* Validate Satellite Imagery Button */}
          <button
            type="button"
            id="multispectral-validate-btn"
            onClick={onValidate}
            disabled={!allBandsLoaded || isValidating || disabled}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
              allBandsLoaded && !isValidating && !disabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                : 'bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-white/10 text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isValidating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Validating Satellite Imagery...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Validate Satellite Imagery</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
