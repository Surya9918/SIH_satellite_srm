export type ProcessingStageId = 
  | 'ingestion'
  | 'preprocessing'
  | 'super_resolution'
  | 'spectral_consistency'
  | 'uncertainty_estimation'
  | 'validation'
  | 'gis_export';

export type ProcessingStatus = 
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export interface StageDefinition {
  id: ProcessingStageId;
  stepNumber: string;
  name: string;
  description: string;
  subTasks: string[];
}

export const PIPELINE_STAGES: StageDefinition[] = [
  {
    id: 'ingestion',
    stepNumber: '01',
    name: 'Data Ingestion',
    description: 'Ingesting multispectral raster & parsing GeoTIFF metadata',
    subTasks: [
      'Decoding TIFF headers & raster structure',
      'Validating 4 spectral bands: B02, B03, B04, B08',
      'Extracting EPSG coordinate reference system (CRS)'
    ]
  },
  {
    id: 'preprocessing',
    stepNumber: '02',
    name: 'Preprocessing',
    description: 'Radiometric calibration & geospatial tiling',
    subTasks: [
      'SCL-based cloud and shadow mask evaluation',
      'Min-Max reflectance radiometric normalization [0, 10000]',
      'Extracting overlapping 64x64 sub-patches with 16px margin'
    ]
  },
  {
    id: 'super_resolution',
    stepNumber: '03',
    name: 'AI Super Resolution',
    description: 'Deep learning spatial reconstruction to sub-4m',
    subTasks: [
      'Initializing SwinIR residual transformer weights',
      'Running patch-based neural inference (scale x3.0)',
      'Applying 2D Hann window blending across tile boundaries'
    ]
  },
  {
    id: 'spectral_consistency',
    stepNumber: '04',
    name: 'Spectral Consistency',
    description: 'Preserving inter-band ratios and vegetative fidelity',
    subTasks: [
      'Penalizing NDVI deviation across vegetation indices',
      'Validating Red-to-NIR spectral ratio preservation',
      'Enforcing low-frequency radiometric conservation'
    ]
  },
  {
    id: 'uncertainty_estimation',
    stepNumber: '05',
    name: 'Uncertainty Estimation',
    description: 'Quantifying spatial variance via Monte Carlo Dropout',
    subTasks: [
      'Executing 10 stochastic forward passes with active dropout',
      'Computing pixel-wise predictive variance & standard deviation',
      'Generating model confidence GeoTIFF layer'
    ]
  },
  {
    id: 'validation',
    stepNumber: '06',
    name: 'Validation & Benchmarking',
    description: 'Computing scientific remote sensing quality metrics',
    subTasks: [
      'Computing PSNR, SSIM, SAM, and ERGAS against bicubic baseline',
      'Calculating NDVI correlation coefficient (r = 0.7585)',
      'Compiling quantitative verification report'
    ]
  },
  {
    id: 'gis_export',
    stepNumber: '07',
    name: 'GIS Product Compilation',
    description: 'Preserving geographic metadata in final GeoTIFFs',
    subTasks: [
      'Writing georeferenced sub-4m GeoTIFF (EPSG:32644)',
      'Exporting float32 uncertainty raster and colorized preview',
      'Packaging metrics.json & GIS-compatible manifest'
    ]
  }
];

export interface BatchFileItem {
  id: string;
  file: File;
  jobId?: string;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  job?: ProcessingJob;
  error?: string;
  progress: number;
  stageMessage?: string;
}

export interface GeoBounds {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface SatelliteMetadata {
  filename: string;
  fileSize: number;
  format: string;
  width: number;
  height: number;
  bands: string[];
  nativeResolution: number; // in meters (e.g. 10.0)
  targetResolution: number; // in meters (e.g. 2.5 or 3.3)
  crs: string; // e.g. "EPSG:32644"
  bounds: GeoBounds;
  center: [number, number]; // [lat, lon]
  acquisitionDate?: string;
  sensor: string;
}

export interface MetricEntry {
  bicubic: number;
  model: number;
  gain: number;
  description: string;
  unit?: string;
  higherIsBetter: boolean;
}

export interface ValidationMetrics {
  l1_loss: MetricEntry;
  perceptual_loss: MetricEntry;
  spectral_loss: MetricEntry;
  ndvi_loss: MetricEntry;
  ndvi_mae: MetricEntry;
  uncertainty?: {
    mean: number;
    max: number;
    min?: number;
  };
  scale_factor: number;
  hasReferenceData: boolean;
}

export interface TelemetryData {
  status: string;
  model: string;
  inputGsd: string;
  targetGsd: string;
  bandCount: number;
  device: string;
  elapsedSeconds: number;
  inferenceSeconds?: number;
  tileProgress: string;
  memoryAllocated: string;
  activeOperation: string;
}

export interface SRMOutputs {
  srGeoTiffUrl: string;
  uncertaintyGeoTiffUrl: string;
  metricsJsonUrl: string;
  lrPreviewUrl: string;
  srPreviewUrl: string;
  uncertaintyPreviewUrl: string;
  ndviPreviewUrl: string;
  validationReportUrl?: string;
  b02PreviewUrl?: string;
  b03PreviewUrl?: string;
  b04PreviewUrl?: string;
  b08PreviewUrl?: string;
  falseColorPreviewUrl?: string;
}

export interface ProcessingJob {
  jobId: string;
  status: ProcessingStatus;
  currentStageId: ProcessingStageId;
  stageProgress: number; // 0-100 within stage
  overallProgress: number; // 0-100 overall
  message: string;
  telemetry: TelemetryData;
  metadata: SatelliteMetadata;
  outputs?: SRMOutputs;
  metrics?: ValidationMetrics;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NDVIStats {
  meanOriginal: number;
  meanSR: number;
  minVal: number;
  maxVal: number;
  difference: number;
  correlation: number;
}

export interface ApplicationUseCase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  impactMetrics: string[];
  keyBands: string[];
  image: string;
}

export interface FourBandFiles {
  b02: File | null;
  b03: File | null;
  b04: File | null;
  b08: File | null;
}

export interface SingleBandMetadata {
  band: string;
  filename: string;
  fileSize: number;
  width: number;
  height: number;
  format: string;
  nativeResolution: number;
  crs: string;
  bounds: {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  };
  readable: boolean;
  error?: string | null;
}

export interface FourBandValidationResult {
  valid: boolean;
  mode?: string;
  message?: string;
  error?: string;
  metadata?: {
    b02?: SingleBandMetadata;
    b03?: SingleBandMetadata;
    b04?: SingleBandMetadata;
    b08?: SingleBandMetadata;
    common?: {
      width: number;
      height: number;
      crs: string;
      nativeResolution: number;
      targetResolution: number;
      bounds: {
        minLon: number;
        minLat: number;
        maxLon: number;
        maxLat: number;
      };
      bands: string[];
      sensor: string;
    };
  };
}
