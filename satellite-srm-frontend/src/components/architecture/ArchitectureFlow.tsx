import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Network, ArrowRight, Cpu, Layers, ShieldCheck, Database, FileSpreadsheet, Server, Laptop } from 'lucide-react';

interface ArchNode {
  id: string;
  name: string;
  icon: any;
  purpose: string;
  input: string;
  output: string;
  technology: string;
  status: string;
}

export const ArchitectureFlow: React.FC = () => {
  const nodes: ArchNode[] = [
    {
      id: 'frontend',
      name: 'SRM-X Console',
      icon: Laptop,
      purpose: 'Interactive mission control, GeoTIFF inspection, comparison slider, uncertainty overlay, and GIS product export.',
      input: 'User multispectral GeoTIFF (.tif) or Sentinel-2 bundle (.zip)',
      output: 'Multipart/form-data payload, real-time telemetry polling',
      technology: 'React 18, TypeScript, Tailwind CSS, Zustand, Framer Motion',
      status: 'PRODUCTION READY'
    },
    {
      id: 'api',
      name: 'FastAPI Gateway',
      icon: Server,
      purpose: 'RESTful API gateway handling asynchronous background jobs, metadata extraction, and telemetry streaming.',
      input: 'HTTP POST /api/v1/super-resolution & GET /api/v1/jobs/{id}',
      output: 'JSON status, progress percentage, raster download endpoints',
      technology: 'FastAPI, Uvicorn, Pydantic, Python 3.11',
      status: 'OPERATIONAL'
    },
    {
      id: 'preprocessing',
      name: 'Raster Preprocessor',
      icon: Database,
      purpose: 'Cloud & shadow masking, radiometric normalization to [0, 10000], and overlapping 64x64 sub-patch extraction.',
      input: '10m 4-Band L2A GeoTIFF (B02, B03, B04, B08)',
      output: 'Normalized float32 tensors with 16px tile overlap',
      technology: 'GDAL, Rasterio, NumPy, SciPy',
      status: 'OPERATIONAL'
    },
    {
      id: 'model',
      name: 'Multispectral SwinIR',
      icon: Cpu,
      purpose: 'Deep learning super-resolution using shifted-window residual Swin Transformer blocks tuned for multispectral satellite data.',
      input: '64x64x4 patch tensors (10m ground resolution)',
      output: '192x192x4 reconstructed tensors (3.33m ground resolution)',
      technology: 'PyTorch, CUDA, Swin Transformer (RSTB), Spectral Loss',
      status: 'MODEL WEIGHTS TRAINED'
    },
    {
      id: 'uncertainty',
      name: 'Uncertainty Estimator',
      icon: ShieldCheck,
      purpose: 'Quantifies predictive pixel variance via 10 stochastic Monte Carlo Dropout forward passes.',
      input: 'Stochastic model activation samples',
      output: 'Float32 spatial predictive variance & confidence raster',
      technology: 'Monte Carlo Dropout, Epistemic Uncertainty Estimation',
      status: 'ACTIVE'
    },
    {
      id: 'validation',
      name: 'Scientific Validator',
      icon: FileSpreadsheet,
      purpose: 'Benchmarks reconstructed rasters against baseline interpolation across PSNR, SSIM, SAM, ERGAS, and NDVI correlation.',
      input: 'Super-resolved raster vs high-resolution reference raster',
      output: 'metrics.json, validation_report.html, CSV summary tables',
      technology: 'Remote Sensing Quality Metrics Suite',
      status: 'BENCHMARK VERIFIED'
    },
    {
      id: 'export',
      name: 'GIS Product Compiler',
      icon: Layers,
      purpose: 'Compiles final 4-band GeoTIFF with updated affine transformation matrix, preserving exact CRS (EPSG:32644).',
      input: 'Super-resolved array + original geospatial georeference tags',
      output: 'QGIS / ArcGIS compatible SR_product.tif and uncertainty_map.tif',
      technology: 'GDAL / GeoTIFF Affine Writer',
      status: 'GIS COMPLIANT'
    }
  ];

  const [selectedNode, setSelectedNode] = useState<ArchNode>(nodes[3]); // default SwinIR

  return (
    <Card className="border-blue-100 glass-panel p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-blue-100 mb-6">
        <div>
          <h3 className="text-base font-bold font-mono text-primary">
            END-TO-END NEURAL & GEOSPATIAL PIPELINE FLOW
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Click any node in the system diagram to view internal operational parameters.
          </p>
        </div>
        <Badge variant="cyan">NTRO ARCHITECTURE PS-26142</Badge>
      </div>

      {/* Interactive Node Map */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
        {nodes.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNode.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-2 transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/50 shadow-lg shadow-cyan-500/20'
                  : 'border-blue-100 glass-panel hover:glass-panel'
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                isSelected ? 'bg-accent/20 text-cyan-700' : 'glass-panel text-secondary'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[11px] font-mono font-bold text-center ${
                isSelected ? 'text-primary' : 'text-secondary'
              }`}>
                {node.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Node Details Box */}
      <div className="rounded-xl border border-cyan-200 glass-panel p-6 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-100 mb-4">
          <div className="flex items-center gap-2">
            <selectedNode.icon className="h-5 w-5 text-accent" />
            <span className="text-base font-bold text-primary uppercase">{selectedNode.name}</span>
          </div>
          <Badge variant="emerald">{selectedNode.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Primary Purpose:</span>
              <p className="text-secondary leading-relaxed font-sans text-xs">
                {selectedNode.purpose}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Underlying Technology:</span>
              <span className="text-cyan-700 font-bold">{selectedNode.technology}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Input Specification:</span>
              <span className="text-amber-700 block">{selectedNode.input}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Output Artifact:</span>
              <span className="text-emerald-600 block">{selectedNode.output}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
