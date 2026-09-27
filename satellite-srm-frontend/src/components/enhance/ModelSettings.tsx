import React, { useState } from 'react';
import { ChevronDown, Info, Cpu, Target, FileOutput, Shield, Layers, Gauge, X } from 'lucide-react';

export interface ModelSettingsValues {
  model: string;
  scaleFactor: number;
  outputFormat: string;
  enableUncertainty: boolean;
  spectralConsistency: boolean;
  artifactReduction: boolean;
}

interface ModelSettingsProps {
  values: ModelSettingsValues;
  onChange: (values: ModelSettingsValues) => void;
  disabled?: boolean;
}

const MODELS = [
  { 
    id: 'SwinIR-SRM',  
    label: 'SwinIR-SRM',        
    badge: 'Recommended', 
    desc: 'Swin Transformer-based SR — best quality & spectral consistency',
    fullDesc: 'A state-of-the-art transformer model optimized for multispectral satellite imagery. It uses shifted window attention to reconstruct high-frequency details while strictly maintaining radiometric fidelity.',
    inputs: '10m Sentinel-2 (B02, B03, B04, B08)',
    outputs: '~3.33m Super-Resolved 4-Band GeoTIFF'
  },
  { 
    id: 'SRGAN',       
    label: 'SRGAN',               
    badge: 'Fast',        
    desc: 'GAN-based super-resolution — faster inference, good perceptual quality',
    fullDesc: 'Generative Adversarial Network architecture that prioritizes visually pleasing textures and sharp edges over strict spectral preservation. Excellent for visual analysis and rapid inference.',
    inputs: '10m Sentinel-2 (B02, B03, B04, B08)',
    outputs: '~3.33m Super-Resolved 4-Band GeoTIFF'
  },
  { 
    id: 'ESRGAN',      
    label: 'ESRGAN',              
    badge: '',            
    desc: 'Enhanced SRGAN with RRDB blocks — sharper textures',
    fullDesc: 'Enhanced Super-Resolution Generative Adversarial Network utilizing Residual-in-Residual Dense Blocks (RRDB) to hallucinate highly realistic textures. Can sometimes alter radiometry.',
    inputs: '10m Sentinel-2 (B02, B03, B04, B08)',
    outputs: '~3.33m Super-Resolved 4-Band GeoTIFF'
  },
  { 
    id: 'Bicubic-3x',  
    label: 'Bicubic Baseline',    
    badge: 'Baseline',   
    desc: 'Classic bicubic interpolation — used as benchmark comparison',
    fullDesc: 'Standard mathematical interpolation without deep learning. It upsamples the image by smoothing pixel values. Used as the baseline to measure the AI models against.',
    inputs: '10m Sentinel-2 (B02, B03, B04, B08)',
    outputs: '~3.33m Smoothed 4-Band GeoTIFF'
  },
];

const SCALE_OPTIONS = [
  { value: 2, label: '2× — 5m GSD',  desc: '2× SR: 10m → 5m' },
  { value: 3, label: '3× — 3.3m GSD', desc: '3× SR: 10m → 3.3m (Recommended)' },
  { value: 4, label: '4× — 2.5m GSD', desc: '4× SR: 10m → 2.5m' },
];

const FORMAT_OPTIONS = ['GeoTIFF (Georeferenced)', 'GeoTIFF (Float32)', 'PNG (Preview)', 'TIFF (Raw)'];

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className={`toggle-switch ${checked ? 'on' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  />
);

const ModelPreviewOverlay: React.FC<{ modelId: string | null; onClose: () => void; onSelect: () => void }> = ({ modelId, onClose, onSelect }) => {
  if (!modelId) return null;
  const m = MODELS.find(x => x.id === modelId);
  if (!m) return null;

  return (
    <div className="fixed inset-0 z-[100] md:absolute md:inset-auto md:right-[calc(100%+20px)] md:-top-4 md:w-[600px] lg:w-[650px] flex items-center justify-center p-4 md:p-0 pointer-events-none">
      {/* Background overlay - only blocks clicks on mobile. On desktop, it is transparent and non-blocking */}
      <div 
        className="absolute inset-0 bg-background/80 md:hidden backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Panel */}
      <div className="relative bg-white dark:bg-slate-950 text-foreground w-full max-w-3xl md:w-full rounded-3xl border border-slate-200 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto md:pointer-events-none animate-in md:slide-in-from-right-4 zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-primary flex items-center gap-3">
                {m.label} 
                {m.badge && (
                  <span className={`text-xs px-2 py-1 rounded-md border font-bold tracking-wide ${
                    m.badge === 'Recommended' ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/25' :
                    m.badge === 'Fast'        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' :
                    m.badge === 'Baseline'    ? 'bg-slate-500/10 text-secondary border-slate-900/10 dark:border-white/10' :
                    'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/25'
                  }`}>
                    {m.badge}
                  </span>
                )}
              </h2>
              <p className="text-sm sm:text-base text-secondary mt-3 leading-relaxed max-w-2xl">{m.fullDesc}</p>
            </div>
            <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-muted-foreground transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Expected Inputs</div>
              <div className="text-sm font-semibold text-primary">{m.inputs}</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Generated Output</div>
              <div className="text-sm font-semibold text-primary">{m.outputs}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Evaluation Metrics (Reported After Inference)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/15">
                <div className="text-cyan-600 dark:text-cyan-400 font-bold text-sm mb-1">L1 Loss</div>
                <div className="text-[10px] text-cyan-800/70 dark:text-cyan-300/70 leading-tight">Pixel-level reconstruction difference</div>
              </div>
              <div className="p-3 bg-violet-500/5 rounded-xl border border-violet-500/15">
                <div className="text-violet-600 dark:text-violet-400 font-bold text-sm mb-1">Perceptual Loss</div>
                <div className="text-[10px] text-violet-800/70 dark:text-violet-300/70 leading-tight">Feature/visual reconstruction similarity</div>
              </div>
              <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/15">
                <div className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">Spectral Loss</div>
                <div className="text-[10px] text-blue-800/70 dark:text-blue-300/70 leading-tight">Spectral fidelity preservation</div>
              </div>
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">NDVI Loss</div>
                <div className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70 leading-tight">Vegetation/NDVI consistency</div>
              </div>
            </div>
          </div>
          
          {/* Mobile select button */}
          <div className="mt-6 md:hidden pointer-events-auto">
            <button 
              onClick={onSelect} 
              className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20"
            >
              Select {m.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ModelSettings: React.FC<ModelSettingsProps> = ({ values, onChange, disabled }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewModelId, setPreviewModelId] = useState<string | null>(null);

  const update = <K extends keyof ModelSettingsValues>(key: K, val: ModelSettingsValues[K]) =>
    onChange({ ...values, [key]: val });

  return (
    <div className="space-y-5 relative">
      <ModelPreviewOverlay 
        modelId={previewModelId} 
        onClose={() => setPreviewModelId(null)} 
        onSelect={() => {
          if (previewModelId) update('model', previewModelId);
          setPreviewModelId(null);
        }}
      />

      {/* Model Selection */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest mb-3">
          <Cpu size={12} /> Super-Resolution Model
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODELS.map((m) => (
            <div
              key={m.id}
              onMouseEnter={() => {
                if (window.innerWidth >= 768 && !disabled) setPreviewModelId(m.id);
              }}
              onMouseLeave={() => {
                if (window.innerWidth >= 768) setPreviewModelId(null);
              }}
              className="relative"
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setPreviewModelId(m.id);
                  } else {
                    update('model', m.id);
                  }
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  values.model === m.id
                    ? 'bg-cyan-500/10 border-cyan-500/35 shadow-[0_0_16px_rgba(0,212,255,0.08)]'
                    : 'bg-white/60 dark:bg-slate-950/60 border-slate-900/10 dark:border-white/15 hover:bg-white/80 dark:hover:bg-slate-950/80 backdrop-blur-md'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${previewModelId === m.id ? 'opacity-0 md:opacity-100' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${values.model === m.id ? 'text-cyan-700 dark:text-cyan-400' : 'text-primary'}`}>
                    {m.label}
                  </span>
                  {m.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      m.badge === 'Recommended' ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/25' :
                      m.badge === 'Fast'        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25' :
                      m.badge === 'Baseline'    ? 'bg-slate-500/10 text-secondary border border-slate-900/10 dark:border-white/10' :
                      'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/25'
                    }`}>{m.badge}</span>
                  )}
                </div>
                <p className="text-[11px] text-secondary leading-relaxed">{m.desc}</p>
                {values.model === m.id && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
                )}
                
                {/* Mobile Info Hint */}
                <div className="md:hidden mt-2 text-[10px] text-cyan-600 font-semibold flex items-center gap-1">
                  <Info size={10} /> Tap for details
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scale Factor */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest mb-3">
          <Target size={12} /> Scale Factor
        </label>
        <div className="flex gap-2">
          {SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => update('scaleFactor', opt.value)}
              className={`flex-1 py-3 px-2 rounded-xl border text-center transition-all duration-200 ${
                values.scaleFactor === opt.value
                  ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-700 dark:text-cyan-400'
                  : 'bg-white/60 dark:bg-slate-950/60 border-slate-900/10 dark:border-white/15 text-secondary hover:bg-white/80 dark:hover:bg-slate-950/80 backdrop-blur-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-sm font-bold leading-none mb-1 text-primary">{opt.value}×</div>
              <div className="text-[10px] leading-tight">
                {opt.value === 2 ? '5m GSD' : opt.value === 3 ? '3.3m GSD' : '2.5m GSD'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Output Format */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest mb-3">
          <FileOutput size={12} /> Output Format
        </label>
        <div className="relative">
          <select
            className="w-full bg-white/60 dark:bg-slate-950/60 border border-slate-900/10 dark:border-white/15 text-primary text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400 appearance-none backdrop-blur-md"
            value={values.outputFormat}
            onChange={(e) => update('outputFormat', e.target.value)}
            disabled={disabled}
          >
            {FORMAT_OPTIONS.map((fmt) => (
              <option key={fmt} value={fmt} className="bg-white dark:bg-slate-800 text-primary">{fmt}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ChevronDown size={14} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          Advanced Settings
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {/* Uncertainty */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-slate-900/10 dark:border-white/15 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Gauge size={12} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-primary">Uncertainty Estimation</div>
                  <div className="text-[11px] text-muted-foreground">Monte Carlo Dropout — 10 stochastic passes</div>
                </div>
              </div>
              <Toggle checked={values.enableUncertainty} onChange={(v) => update('enableUncertainty', v)} disabled={disabled} />
            </div>

            {/* Spectral Consistency */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-slate-900/10 dark:border-white/15 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Layers size={12} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-primary">Spectral Consistency</div>
                  <div className="text-[11px] text-muted-foreground">Preserve NDVI and inter-band ratios</div>
                </div>
              </div>
              <Toggle checked={values.spectralConsistency} onChange={(v) => update('spectralConsistency', v)} disabled={disabled} />
            </div>

            {/* Artifact Reduction */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-slate-900/10 dark:border-white/15 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Shield size={12} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-primary">Artifact Reduction</div>
                  <div className="text-[11px] text-muted-foreground">Post-processing noise filter on tile boundaries</div>
                </div>
              </div>
              <Toggle checked={values.artifactReduction} onChange={(v) => update('artifactReduction', v)} disabled={disabled} />
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 px-3 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <Info size={13} className="text-cyan-700 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-cyan-800 dark:text-cyan-300 leading-relaxed">
                Enhanced details are model-inferred. Always validate against high-resolution reference data for critical applications.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
