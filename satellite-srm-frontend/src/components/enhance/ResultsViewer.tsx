import React, { useState, useRef, MouseEvent } from 'react';
import {
  Download, BarChart3, RefreshCcw, SplitSquareHorizontal, CheckCircle2, FileText, Layers, Eye, Diff
} from 'lucide-react';
import { ProcessingJob } from '../../types/satellite';
import { InteractiveComparisonViewer } from '../results/InteractiveComparisonViewer';
import { MultispectralPanel } from '../results/MultispectralPanel';
import { MetricCard } from '../ui/MetricCard';
import { GisProductsPanel } from '../results/GisProductsPanel';
import { GisExportModal } from '../results/GisExportModal';
import { resolveApiUrl } from '../../api/client';
import { SatelliteComparison } from '../ui/SatelliteComparison';

interface ResultsViewerProps {
  job: ProcessingJob;
  onNewEnhancement: () => void;
  onViewAnalysis?: () => void; 
  onViewCompare?: () => void;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({
  job,
  onNewEnhancement,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'compare' | 'analysis' | 'export'>('overview');
  const [isGisExportModalOpen, setIsGisExportModalOpen] = useState(false);
  const [compareMode, setCompareMode] = useState<'slider' | 'split' | 'difference'>('slider');
  const [showUncertaintyHeatmap, setShowUncertaintyHeatmap] = useState(true);

  const [hoverData, setHoverData] = useState<{ x: number, y: number, uncertainty: number | null } | null>(null);
  const imgRefCompare = useRef<HTMLImageElement>(null);
  const imgRefAnalysis = useRef<HTMLImageElement>(null);
  
  const handleMouseMove = (e: MouseEvent<HTMLImageElement>, imgRef: React.RefObject<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;
        ctx.drawImage(img, x * scaleX, y * scaleY, 1, 1, 0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        
        if (a === 0) {
          setHoverData({ x: e.clientX, y: e.clientY, uncertainty: null });
          return;
        }

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        if (max === min) h = 0;
        else if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
        else if (max === g) h = (60 * ((b - r) / (max - min)) + 120);
        else if (max === b) h = (60 * ((r - g) / (max - min)) + 240);
        
        let unc = 1.0 - (h / 240);
        if (unc < 0) unc = 0;
        if (unc > 1) unc = 1;
        
        setHoverData({ x: e.clientX, y: e.clientY, uncertainty: unc });
      }
    } catch (err) {
      setHoverData({ x: e.clientX, y: e.clientY, uncertainty: null });
    }
  };

  const handleMouseLeave = () => setHoverData(null);

  const outputs = job.outputs;
  const metrics = job.metrics;
  const meta = job.metadata;

  const lrUrl  = resolveApiUrl(outputs?.lrPreviewUrl) || '/sample-satellite/lr.png';
  const srUrl  = resolveApiUrl(outputs?.srPreviewUrl) || '/sample-satellite/sr.png';
  const tifUrl = resolveApiUrl(outputs?.srGeoTiffUrl);
  const uncertaintyUrl = resolveApiUrl(outputs?.uncertaintyPreviewUrl) || '/sample-satellite/uncertainty.png';

  const b02Url = resolveApiUrl(outputs?.b02PreviewUrl) || '/sample-satellite/b02.png';
  const b03Url = resolveApiUrl(outputs?.b03PreviewUrl) || '/sample-satellite/b03.png';
  const b04Url = resolveApiUrl(outputs?.b04PreviewUrl) || '/sample-satellite/b04.png';
  const b08Url = resolveApiUrl(outputs?.b08PreviewUrl) || '/sample-satellite/b08.png';
  const falseColorUrl = resolveApiUrl(outputs?.falseColorPreviewUrl) || '/sample-satellite/false_color.png';

  const uncMean = metrics?.uncertainty?.mean ?? 0.0842;
  const confidencePercent = Math.max(0, Math.min(100, (1 - uncMean) * 100));

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = srUrl;
    link.download = `SRM_Enhanced_${meta?.filename || 'output'}.png`;
    link.click();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText size={14} /> },
    { id: 'compare', label: 'Compare', icon: <SplitSquareHorizontal size={14} /> },
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={14} /> },
    { id: 'export', label: 'Export Data', icon: <Download size={14} /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button onClick={handleDownloadImage} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border/50 hover:bg-muted transition-colors bg-card text-foreground">
              <Download size={14} />
              Quick PNG
           </button>
           <button onClick={onNewEnhancement} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border/50 hover:bg-muted transition-colors bg-card text-foreground">
              <RefreshCcw size={14} />
              New Image
           </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 anim-fade-in">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Enhancement Complete</h3>
                    <p className="text-sm text-muted-foreground">Successfully reconstructed 10m Sentinel-2 data to ~3.33m resolution using SwinIR.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard label="L1 Loss" value={metrics?.l1_loss?.model?.toFixed(4) || 'N/A'} size="sm" color="cyan" />
                  <MetricCard label="Perceptual Loss" value={metrics?.perceptual_loss?.model?.toFixed(4) || 'N/A'} size="sm" color="violet" />
                  <MetricCard label="Spectral Loss" value={metrics?.spectral_loss?.model?.toFixed(4) || 'N/A'} size="sm" color="blue" />
                  <MetricCard label="NDVI Loss" value={metrics?.ndvi_loss?.model?.toFixed(4) || 'N/A'} size="sm" color="emerald" />
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm h-full flex flex-col">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Metadata</h4>
                <div className="space-y-3 flex-1">
                   <div className="flex justify-between items-center py-2 border-b border-border/50">
                     <span className="text-sm text-muted-foreground">Resolution</span>
                     <span className="text-sm font-medium text-foreground">10m → ~3.33m</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-border/50">
                     <span className="text-sm text-muted-foreground">Bands</span>
                     <span className="text-sm font-medium text-foreground">4 (B02-B08)</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-border/50">
                     <span className="text-sm text-muted-foreground">CRS</span>
                     <span className="text-sm font-medium text-foreground">{meta?.crs || 'EPSG:32644'}</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                     <span className="text-sm text-muted-foreground">Center</span>
                     <span className="text-sm font-medium text-foreground">{meta?.center?.[0]?.toFixed(2)}, {meta?.center?.[1]?.toFixed(2)}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-card p-4 rounded-2xl border border-border/50">
                <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Enhanced RGB</span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">True Color</span>
                </h4>
                <div className="aspect-video rounded-xl overflow-hidden border border-border/50 bg-muted">
                  <img src={srUrl} alt="Enhanced RGB" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
              <div className="space-y-3 bg-card p-4 rounded-2xl border border-border/50">
                <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Enhanced NIR</span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">Band 8</span>
                </h4>
                <div className="aspect-video rounded-xl overflow-hidden border border-border/50 bg-muted">
                  <img src={b08Url} alt="Enhanced NIR" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPARE TAB */}
        {activeTab === 'compare' && (
          <div className="space-y-4 anim-fade-in bg-card p-2 rounded-2xl border border-border/50">
            <div className="flex items-center gap-2 p-1 bg-muted rounded-xl w-fit m-4">
              <button onClick={() => setCompareMode('slider')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${compareMode === 'slider' ? 'bg-background shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>Slider Swipe</button>
              <button onClick={() => setCompareMode('split')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${compareMode === 'split' ? 'bg-background shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>Side-by-Side Split</button>
              <button onClick={() => setCompareMode('difference')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${compareMode === 'difference' ? 'bg-background shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>Uncertainty Map</button>
            </div>
            
            <div className="px-4 pb-4">
              {compareMode === 'slider' && (
                 <SatelliteComparison
                   beforeUrl={srUrl}
                   afterUrl={lrUrl}
                   beforeLabel={`SRM Enhanced · <${meta?.targetResolution?.toFixed(1) || '3.3'}m`}
                   afterLabel={`Sentinel-2 · ${meta?.nativeResolution?.toFixed(0) || '10'}m`}
                   height="600px"
                   initialPosition={50}
                 />
              )}

              {compareMode === 'split' && (
                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <div className="flex items-center justify-between bg-muted px-3 py-2 rounded-lg">
                       <span className="text-sm font-bold text-foreground">Enhanced SR</span>
                       <span className="text-xs font-mono text-muted-foreground">~3.33m</span>
                     </div>
                     <div className="h-[550px] rounded-xl overflow-hidden border border-border/50">
                       <img src={srUrl} alt="Enhanced" className="w-full h-full object-cover" />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex items-center justify-between bg-muted px-3 py-2 rounded-lg">
                       <span className="text-sm font-bold text-foreground">Original LR</span>
                       <span className="text-xs font-mono text-muted-foreground">10m</span>
                     </div>
                     <div className="h-[550px] rounded-xl overflow-hidden border border-border/50">
                       <img src={lrUrl} alt="Original" className="w-full h-full object-cover" />
                     </div>
                   </div>
                 </div>
              )}

              {compareMode === 'difference' && (
                 <div className="relative h-[600px] rounded-xl overflow-hidden border border-border/50 bg-slate-950">
                   <img 
                     ref={imgRefCompare}
                     src={uncertaintyUrl} 
                     alt="Uncertainty" 
                     crossOrigin="anonymous"
                     onMouseMove={(e) => handleMouseMove(e, imgRefCompare)}
                     onMouseLeave={handleMouseLeave}
                     className="w-full h-full object-cover mix-blend-screen opacity-90 cursor-crosshair" 
                   />
                   <div className="absolute top-4 left-4 px-3 py-1.5 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg text-foreground text-xs font-mono font-bold shadow-lg">
                     AI Reconstruction & Uncertainty Map
                   </div>
                   
                   {/* Continuous Color Scale Legend */}
                   <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-background/95 backdrop-blur-md border border-border/50 rounded-xl p-3 shadow-xl">
                     <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Predictive Uncertainty</div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-xs font-bold w-6">0.0</span>
                       <div className="flex-1 sm:w-64 h-3 rounded-full bg-gradient-to-r from-[#00008b] via-[#00ffff] via-[#00ff00] via-[#ffff00] via-[#ffa500] to-[#ff0000]"></div>
                       <span className="text-xs font-bold w-6 text-right">1.0</span>
                     </div>
                     <div className="flex justify-between text-[10px] text-muted-foreground">
                       <span>Low Uncertainty</span>
                       <span>High Uncertainty</span>
                     </div>
                   </div>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === 'analysis' && (
          <div className="space-y-8 anim-fade-in">
            <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Layers className="text-primary" size={20} />
                Multispectral Band Analysis
              </h3>
              <MultispectralPanel
                srPreviewUrl={srUrl}
                b02Url={b02Url}
                b03Url={b03Url}
                b04Url={b04Url}
                b08Url={b08Url}
                falseColorUrl={falseColorUrl}
                bounds={meta?.bounds}
                crs={meta?.crs}
                resolution={`~${meta?.targetResolution?.toFixed(2) || '3.33'}m GSD`}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-bold text-foreground">Reconstruction Losses</h3>
                <div className="space-y-5">
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <h4 className="font-bold text-cyan-500 flex justify-between items-center">
                      <span>L1 Loss</span>
                      <span className="text-foreground">{metrics?.l1_loss?.model?.toFixed(4) || 'N/A'}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Measures the absolute difference between reconstructed and reference pixel values. Lower values indicate smaller pixel-level reconstruction error.</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <h4 className="font-bold text-violet-500 flex justify-between items-center">
                      <span>Perceptual Loss</span>
                      <span className="text-foreground">{metrics?.perceptual_loss?.model?.toFixed(4) || 'N/A'}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Evaluates higher-level visual and feature similarity, beyond raw pixel values. Lower perceptual loss means the reconstructed imagery correctly captures textures and patterns like roads or buildings.</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <h4 className="font-bold text-blue-500 flex justify-between items-center">
                      <span>Spectral Loss</span>
                      <span className="text-foreground">{metrics?.spectral_loss?.model?.toFixed(4) || 'N/A'}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Measures the preservation of spectral relationships across bands (e.g., RGB to NIR). Lower spectral loss indicates that the radiometry remains faithful, critical for downstream classification.</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <h4 className="font-bold text-emerald-500 flex justify-between items-center">
                      <span>NDVI Loss</span>
                      <span className="text-foreground">{metrics?.ndvi_loss?.model?.toFixed(4) || 'N/A'}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Measures preservation of vegetation-related information. Lower NDVI loss means vegetation mapping tasks will still function accurately after AI enhancement.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">Uncertainty / Reconstruction Map</h3>
                    <button onClick={() => setShowUncertaintyHeatmap(!showUncertaintyHeatmap)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors">
                      {showUncertaintyHeatmap ? 'Show RGB' : 'Show Map'}
                    </button>
                  </div>
                  <div className="h-64 rounded-xl overflow-hidden border border-border/50 bg-slate-950 relative">
                    <img 
                      ref={imgRefAnalysis}
                      src={showUncertaintyHeatmap ? uncertaintyUrl : srUrl} 
                      alt="Map" 
                      crossOrigin="anonymous"
                      onMouseMove={showUncertaintyHeatmap ? ((e) => handleMouseMove(e, imgRefAnalysis)) : undefined}
                      onMouseLeave={handleMouseLeave}
                      className="w-full h-full object-cover mix-blend-screen cursor-crosshair" 
                    />
                    {showUncertaintyHeatmap && (
                       <div className="absolute bottom-2 left-2 right-2 bg-background/95 backdrop-blur-md p-3 rounded-lg border border-border/50 shadow-lg">
                         <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Predictive Uncertainty</div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-bold w-6">0.0</span>
                           <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-[#00008b] via-[#00ffff] via-[#00ff00] via-[#ffff00] via-[#ffa500] to-[#ff0000]"></div>
                           <span className="text-xs font-bold w-6 text-right">1.0</span>
                         </div>
                         <div className="flex justify-between text-[10px] text-muted-foreground">
                           <span>Low</span>
                           <span>High</span>
                         </div>
                       </div>
                    )}
                  </div>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                  <h3 className="text-md font-bold text-foreground mb-2">Pixel / Region Confidence</h3>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Actual class probabilities (e.g., Vegetation, Building, Water) are currently <span className="font-bold text-foreground">unavailable</span> from the reconstruction model. The uncertainty map above displays spatial variance where AI hallucination occurred, but does not classify land-cover.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="anim-fade-in">
            <GisProductsPanel job={job} />
          </div>
        )}
      </div>

      {/* Uncertainty Tooltip */}
      {hoverData && (
        <div 
          className="fixed z-[100] pointer-events-none transform -translate-x-1/2 -translate-y-full pb-4"
          style={{ left: hoverData.x, top: hoverData.y }}
        >
          <div className="bg-card/95 backdrop-blur-md text-foreground p-3 rounded-xl border border-border/50 shadow-2xl space-y-1.5 w-48">
            <div className="flex justify-between items-center border-b border-border/50 pb-1.5 mb-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Uncertainty</span>
              <span className="text-sm font-black text-primary">{hoverData.uncertainty?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">AI Reconstruction</span>
              <span className="font-semibold text-primary">{hoverData.uncertainty && hoverData.uncertainty > 0.6 ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Predicted Class</span>
              <span className="font-semibold text-primary">N/A</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-semibold text-primary">N/A</span>
            </div>
          </div>
        </div>
      )}

      <GisExportModal
        isOpen={isGisExportModalOpen}
        onClose={() => setIsGisExportModalOpen(false)}
        tifUrl={tifUrl}
        filename={`SRM_${meta?.filename?.replace(/\.[^.]+$/, '') || 'product'}.tif`}
        crs={meta?.crs || 'EPSG:32644'}
        dimensions={`${meta?.width || 2048} × ${meta?.height || 2048} px`}
        resolution={`~${meta?.targetResolution?.toFixed(2) || '3.33'}m GSD`}
      />
    </div>
  );
};
