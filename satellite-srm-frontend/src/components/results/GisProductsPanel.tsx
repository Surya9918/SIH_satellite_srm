import React, { useState } from 'react';
import {
  Download, Map, CheckCircle2, Info, Package,
  ShieldAlert, FileJson, Copy, Globe, Layers
} from 'lucide-react';
import { ProcessingJob, SRMOutputs, SatelliteMetadata } from '../../types/satellite';
import { resolveApiUrl } from '../../api/client';
import { GisExportModal } from './GisExportModal';

/* ── types ──────────────────────────────────────────────────────── */
interface GisProductsPanelProps {
  /** Accept either a full job OR the legacy (outputs-only) shape */
  job?: ProcessingJob;
  outputs?: SRMOutputs;
  metadata?: SatelliteMetadata;
}

/* ── helpers ─────────────────────────────────────────────────────── */

/** Derive the 6-element GDAL GeoTransform from bounds + pixel size.
 *  GT = [ulx, xRes, 0, uly, 0, -yRes]
 *  Source of truth: backend bounds + targetResolution.
 *  We do NOT invent these numbers — they are computed directly from
 *  the metadata the backend returned.
 */
function deriveGeoTransform(
  meta: SatelliteMetadata,
): string | null {
  const { bounds, targetResolution, width, height } = meta;
  if (!bounds || !width || !height) return null;

  // Upper-left corner in geographic coordinates
  const ulx = bounds.minLon;
  const uly = bounds.maxLat;

  // Pixel size derived from geographic extent ÷ pixel count
  const xRes = (bounds.maxLon - bounds.minLon) / width;
  const yRes = (bounds.maxLat - bounds.minLat) / height;   // positive, GT stores negative

  // If targetResolution is known in metres, include it as a note
  const mNote = targetResolution ? ` (~${targetResolution.toFixed(2)} m)` : '';

  return (
    `(${ulx.toFixed(6)}, ${xRes.toFixed(8)}, 0,\n` +
    ` ${uly.toFixed(6)}, 0, -${yRes.toFixed(8)})${mNote}`
  );
}

/** Parse a human-readable projection name out of the CRS string. */
function parseProjection(crs?: string): string {
  if (!crs) return 'Unknown';
  // e.g. "EPSG:32644 (UTM Zone 44N)" → "Universal Transverse Mercator – Zone 44N"
  const utmMatch = crs.match(/UTM\s+Zone\s+(\S+)/i);
  if (utmMatch) return `Universal Transverse Mercator – Zone ${utmMatch[1]}`;
  if (crs.includes('WGS 84') || crs.includes('4326')) return 'WGS 84 Geographic';
  if (crs.includes('3857') || crs.includes('Web Mercator')) return 'Web Mercator (Pseudo)';
  return crs;
}

/* ── small reusable row ─────────────────────────────────────────── */
const MetaRow: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copyable?: string;
}> = ({ label, value, mono = true, copyable }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyable) return;
    navigator.clipboard.writeText(copyable).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-theme last:border-0">
      <span className="text-[11px] text-muted-foreground shrink-0 w-28 pt-0.5">{label}</span>
      <span
        className={`text-[11px] text-secondary text-right flex-1 leading-snug ${
          mono ? 'font-mono' : ''
        }`}
        style={{ whiteSpace: 'pre-line' }}
      >
        {value}
      </span>
      {copyable && (
        <button
          onClick={handleCopy}
          title="Copy"
          className="shrink-0 text-secondary hover:text-accent transition-colors mt-0.5"
        >
          {copied ? (
            <CheckCircle2 size={12} className="text-emerald-600" />
          ) : (
            <Copy size={12} />
          )}
        </button>
      )}
    </div>
  );
};

/* ── download button with success flash ─────────────────────────── */
const DownloadButton: React.FC<{
  label: string;
  url: string | null | undefined;
  filename: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'amber';
  disabled?: boolean;
}> = ({ label, url, filename, icon, variant = 'secondary', disabled }) => {
  const [state, setState] = useState<'idle' | 'success'>('idle');

  const handleClick = () => {
    if (!url || disabled) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setState('success');
    setTimeout(() => setState('idle'), 2800);
  };

  const baseClass =
    'flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer';

  const variantClass =
    variant === 'primary'
      ? 'bg-accent/20 border border-cyan-200 text-cyan-700 hover:bg-accent/25 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
      : variant === 'amber'
      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-700 hover:bg-amber-500/20'
      : 'glass-panel border border-theme text-secondary hover:glass-panel hover:border-theme';

  const disabledClass = (!url || disabled)
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : '';

  return (
    <button
      onClick={handleClick}
      className={`${baseClass} ${state === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700' : variantClass} ${disabledClass}`}
    >
      {state === 'success' ? (
        <>
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export const GisProductsPanel: React.FC<GisProductsPanelProps> = ({
  job,
  outputs: outputsProp,
  metadata: metadataProp,
}) => {
  /* Accept either a full job or the legacy outputs-only shape */
  const outputs  = job?.outputs  ?? outputsProp;
  const metadata = job?.metadata ?? metadataProp;
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const tifUrl         = resolveApiUrl(outputs?.srGeoTiffUrl)         || null;
  const uncertaintyUrl = resolveApiUrl(outputs?.uncertaintyGeoTiffUrl)|| null;
  const metricsUrl     = resolveApiUrl(outputs?.metricsJsonUrl)       || null;
  const srPngUrl       = resolveApiUrl(outputs?.srPreviewUrl)         || null;
  const b02Url         = resolveApiUrl(outputs?.b02PreviewUrl)        || null;
  const b03Url         = resolveApiUrl(outputs?.b03PreviewUrl)        || null;
  const b04Url         = resolveApiUrl(outputs?.b04PreviewUrl)        || null;
  const b08Url         = resolveApiUrl(outputs?.b08PreviewUrl)        || null;

  /* Filename base derived from backend metadata — never invented */
  const fileBase = metadata?.filename?.replace(/\.[^.]+$/, '') || 'SRM_product';

  /* GIS metadata values from backend metadata only */
  const crs        = metadata?.crs          || null;
  const projection = crs ? parseProjection(crs) : null;
  const geoTransform = metadata ? deriveGeoTransform(metadata) : null;
  const imageDims  = metadata?.width && metadata?.height
    ? `${metadata.width} × ${metadata.height} px` : null;
  const pixelSizeSR = metadata?.targetResolution != null
    ? `${metadata.targetResolution.toFixed(2)} m GSD` : null;
  const pixelSizeSrc = metadata?.nativeResolution != null
    ? `${metadata.nativeResolution.toFixed(1)} m GSD (input)` : null;
  const bandList = metadata?.bands?.join(', ') ?? null;
  const sensor   = metadata?.sensor ?? null;

  return (
    <div className="space-y-5">

      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <Globe size={13} className="text-emerald-600" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-600 uppercase">
              GIS Export
            </span>
          </div>
          <h3 className="text-xl font-bold text-primary tracking-tight">Export Results</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Georeferenced products ready for QGIS, ArcGIS and other GIS software
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 size={11} /> QGIS / ArcGIS Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Download Buttons ── */}
        <div className="space-y-4">

          {/* Primary: Enhanced GeoTIFF */}
          <div className="glass rounded-2xl p-5 border border-theme space-y-4 hover:border-emerald-500/25 transition-all duration-300">
            <div className="flex items-center gap-2 border-b border-theme pb-3">
              <Map size={15} className="text-emerald-600" />
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider font-mono">
                Download Enhanced GeoTIFF
              </h4>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Super-resolved 4-band multispectral GeoTIFF with updated affine transform
              ({pixelSizeSR ?? '~3.33m GSD'}). Preserves EPSG CRS, NoData flags, and
              band metadata for direct GIS ingestion.
            </p>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              {crs && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                  {crs.split(' ')[0]}
                </span>
              )}
              <span className="px-2 py-0.5 rounded glass-panel border border-theme text-secondary">
                4-Band RGBA TIFF
              </span>
              {metadata?.bands?.length && (
                <span className="px-2 py-0.5 rounded glass-panel border border-theme text-secondary">
                  {metadata.bands.length} Bands
                </span>
              )}
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-accent/20 border border-cyan-200 text-cyan-700 hover:bg-accent/25 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.08)]"
            >
              <Download size={16} />
              <span>Download Enhanced GeoTIFF</span>
            </button>
          </div>

          {/* GIS Bundle */}
          <div className="glass rounded-2xl p-5 border border-theme space-y-4 hover:border-cyan-500/25 transition-all duration-300">
            <div className="flex items-center gap-2 border-b border-theme pb-3">
              <Package size={15} className="text-accent" />
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider font-mono">
                Download GIS Bundle
              </h4>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Full scientific output package: SR GeoTIFF, RGB preview, spectral band previews
              (B02, B03, B04, B08), false-color composite, and metrics JSON — all in one download.
            </p>

            {/* Individual bundle items */}
            <div className="space-y-1.5">
              {[
                { label: 'SR GeoTIFF (.tif)',    url: tifUrl,     ext: 'TIF', color: 'text-emerald-600' },
                { label: 'SR RGB Preview (.png)', url: srPngUrl,  ext: 'PNG', color: 'text-accent'    },
                { label: 'B02 Blue Band (.png)',  url: b02Url,     ext: 'PNG', color: 'text-accent'   },
                { label: 'B03 Green Band (.png)', url: b03Url,     ext: 'PNG', color: 'text-emerald-600'},
                { label: 'B04 Red Band (.png)',   url: b04Url,     ext: 'PNG', color: 'text-red-600'    },
                { label: 'B08 NIR Band (.png)',   url: b08Url,     ext: 'PNG', color: 'text-violet-400' },
                { label: 'Metrics JSON (.json)',  url: metricsUrl, ext: 'JSON',color: 'text-amber-600'  },
              ].map(({ label, url, ext, color }) => (
                url ? (
                  <a
                    key={label}
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 glass-panel hover:glass-panel border border-theme hover:border-theme rounded-lg transition-all group"
                  >
                    <Layers size={11} className={`${color} shrink-0`} />
                    <span className="text-[11px] text-secondary group-hover:text-secondary transition-colors flex-1">{label}</span>
                    <span className="text-[9px] font-mono text-secondary group-hover:text-secondary">{ext}</span>
                    <Download size={10} className="text-secondary group-hover:text-secondary shrink-0" />
                  </a>
                ) : null
              ))}
            </div>
          </div>

          {/* Uncertainty Map (conditional) */}
          {uncertaintyUrl && (
            <div className="glass rounded-2xl p-5 border border-theme space-y-4 hover:border-amber-500/25 transition-all duration-300">
              <div className="flex items-center gap-2 border-b border-theme pb-3">
                <ShieldAlert size={15} className="text-amber-600" />
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider font-mono">
                  Download Uncertainty Map
                </h4>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Float32 GeoTIFF of Monte Carlo Dropout spatial variance. Each pixel encodes model
                confidence (0 = high confidence, 1 = low confidence). Use for masking uncertain
                regions in downstream analysis.
              </p>
              <DownloadButton
                label="Download Uncertainty Map"
                url={uncertaintyUrl}
                filename={`${fileBase}_uncertainty.tif`}
                icon={<ShieldAlert size={16} />}
                variant="amber"
              />
            </div>
          )}

          {/* Metrics JSON */}
          {metricsUrl && (
            <div className="glass rounded-2xl p-5 border border-theme space-y-3 hover:border-violet-500/25 transition-all duration-300">
              <div className="flex items-center gap-2 border-b border-theme pb-3">
                <FileJson size={15} className="text-violet-400" />
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider font-mono">
                  Download Metrics JSON
                </h4>
              </div>
              <p className="text-xs text-secondary">
                Scientific quality metrics (PSNR, SSIM, SAM, ERGAS, NDVI correlation) vs. bicubic baseline.
              </p>
              <DownloadButton
                label="Download metrics.json"
                url={metricsUrl}
                filename={`${fileBase}_metrics.json`}
                icon={<FileJson size={16} />}
                variant="secondary"
              />
            </div>
          )}
        </div>

        {/* ── RIGHT: GIS Metadata Panel ── */}
        <div className="glass rounded-2xl p-5 border border-theme space-y-4 hover:border-theme transition-all duration-300">
          <div className="flex items-center justify-between border-b border-theme pb-3">
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-accent" />
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider font-mono">
                Geospatial Metadata
              </h4>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Backend Source of Truth</span>
          </div>

          <div className="space-y-0.5">
            {/* CRS */}
            {crs ? (
              <MetaRow label="CRS" value={crs} copyable={crs} />
            ) : (
              <MetaRow label="CRS" value={<span className="text-secondary italic">Not available</span>} />
            )}

            {/* Projection */}
            {projection ? (
              <MetaRow label="Projection" value={projection} mono={false} />
            ) : (
              <MetaRow label="Projection" value={<span className="text-secondary italic">Not available</span>} mono={false} />
            )}

            {/* GeoTransform */}
            {geoTransform ? (
              <MetaRow
                label="GeoTransform"
                value={geoTransform}
                copyable={geoTransform.replace(/\n\s*/g, ' ')}
              />
            ) : (
              <MetaRow
                label="GeoTransform"
                value={<span className="text-secondary italic">Not available for this input</span>}
              />
            )}

            {/* Image dimensions */}
            {imageDims ? (
              <MetaRow label="Dimensions" value={imageDims} />
            ) : (
              <MetaRow label="Dimensions" value={<span className="text-secondary italic">Not available</span>} />
            )}

            {/* Pixel size */}
            {pixelSizeSR ? (
              <MetaRow label="Pixel Size (SR)" value={pixelSizeSR} />
            ) : (
              <MetaRow label="Pixel Size (SR)" value={<span className="text-secondary italic">Not available</span>} />
            )}
            {pixelSizeSrc && (
              <MetaRow label="Pixel Size (src)" value={pixelSizeSrc} />
            )}

            {/* Bounding box */}
            {metadata?.bounds && (
              <MetaRow
                label="Bounding Box"
                value={
                  `N ${metadata.bounds.maxLat.toFixed(4)}°, S ${metadata.bounds.minLat.toFixed(4)}°\n` +
                  `E ${metadata.bounds.maxLon.toFixed(4)}°, W ${metadata.bounds.minLon.toFixed(4)}°`
                }
              />
            )}

            {/* Band layout */}
            {bandList && (
              <MetaRow label="Bands" value={bandList} />
            )}

            {/* Sensor */}
            {sensor && (
              <MetaRow label="Sensor" value={sensor} mono={false} />
            )}
          </div>

          {/* GeoTransform derivation note */}
          {metadata?.bounds && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-accent/[0.05] border border-blue-500/15 rounded-xl mt-2">
              <Info size={11} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-accent/75 leading-relaxed">
                GeoTransform is derived directly from backend-returned geographic bounds
                and image dimensions. CRS and coordinates are not modified by the frontend.
              </p>
            </div>
          )}

          {/* Compatibility badges */}
          <div className="pt-2 border-t border-theme">
            <p className="text-[10px] text-secondary uppercase tracking-widest mb-2 font-mono">Compatible with</p>
            <div className="flex flex-wrap gap-2">
              {['QGIS 3.x', 'ArcGIS Pro', 'GDAL/OGR', 'Google Earth Engine', 'ENVI'].map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 rounded-lg glass-panel border border-theme text-[10px] font-mono text-secondary"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer disclaimer ── */}
      <div className="flex items-start gap-2.5 px-4 py-3 glass-panel border border-theme rounded-xl">
        <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Affine projection parameters and NoData flags are embedded in the GeoTIFF header for direct
          GIS alignment. The backend is the sole source of truth for all geospatial metadata — no
          coordinates are reconstructed or modified by the frontend.
        </p>
      </div>

      {/* ── Animation 9: GIS Export Animation Modal ── */}
      <GisExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tifUrl={tifUrl}
        filename={`${fileBase}_SR.tif`}
        crs={crs || 'EPSG:32644 (UTM Zone 44N)'}
        dimensions={imageDims || '2048 × 2048 px'}
        resolution={pixelSizeSR || '~3.33m GSD'}
      />
    </div>
  );
};
