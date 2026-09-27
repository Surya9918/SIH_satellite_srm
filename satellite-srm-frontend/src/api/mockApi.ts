import { ProcessingJob, ProcessingStageId, SatelliteMetadata, StageDefinition } from '../types/satellite';
import { DEMO_METADATA, DEMO_METRICS } from '../store/useSrmStore';
import { StartReconstructionParams } from './superResolution';

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

// In-memory simulated jobs store
const mockJobs = new Map<string, ProcessingJob>();

export async function mockStartJob(params: StartReconstructionParams): Promise<{ job_id: string; status: string; job: ProcessingJob }> {
  const jobId = `SRM-JOB-${Math.floor(100000 + Math.random() * 900000)}`;
  
  const primaryFile = params.file || (params.files && params.files[0]);
  const filename = primaryFile?.name || 'satellite_raster.tif';
  const fileSize = primaryFile?.size || 1049664;

  const metadata: SatelliteMetadata = {
    filename,
    fileSize,
    format: "GeoTIFF (Multispectral)",
    width: 512,
    height: 512,
    bands: ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"],
    nativeResolution: 10.0,
    targetResolution: 3.33,
    crs: "EPSG:32644 (UTM Zone 44N)",
    bounds: DEMO_METADATA.bounds,
    center: DEMO_METADATA.center,
    sensor: "Sentinel-2 MSI Level-2A",
    acquisitionDate: "2026-05-15 05:42 UTC"
  };

  const initialJob: ProcessingJob = {
    jobId,
    status: "processing",
    currentStageId: "ingestion",
    stageProgress: 10,
    overallProgress: 3,
    message: "Starting reconstruction mission pipeline...",
    telemetry: {
      status: "RUNNING",
      model: params.model || "Multispectral SwinIR-SRM",
      inputGsd: "10.0 m",
      targetGsd: "3.33 m",
      bandCount: 4,
      device: "CUDA RTX 4090 / PyTorch",
      elapsedSeconds: 1,
      tileProgress: "0 / 16 Tiles",
      memoryAllocated: "2.1 GB VRAM",
      activeOperation: "Ingesting GeoTIFF"
    },
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockJobs.set(jobId, initialJob);

  // Trigger background simulation
  runMockSimulation(jobId);

  return {
    job_id: jobId,
    status: "queued",
    job: initialJob
  };
}

function runMockSimulation(jobId: string) {
  const stages: { id: ProcessingStageId; durationMs: number; msg: string; op: string; tiles: string }[] = [
    { id: 'ingestion', durationMs: 1200, msg: 'Validating 4-band multispectral raster headers...', op: 'Raster parsing', tiles: '0 / 16' },
    { id: 'preprocessing', durationMs: 1600, msg: 'Normalizing radiometry and tiling 64x64 patches...', op: 'Patch tiling', tiles: '4 / 16' },
    { id: 'super_resolution', durationMs: 2500, msg: 'Executing SwinIR deep residual reconstruction...', op: 'Deep inference', tiles: '12 / 16' },
    { id: 'spectral_consistency', durationMs: 1500, msg: 'Evaluating spectral consistency & NDVI preservation...', op: 'Spectral constraint', tiles: '16 / 16' },
    { id: 'uncertainty_estimation', durationMs: 1800, msg: 'Executing 10 Monte Carlo stochastic passes for uncertainty...', op: 'MC-Dropout', tiles: '16 / 16' },
    { id: 'validation', durationMs: 1400, msg: 'Benchmarking PSNR, SSIM, SAM, ERGAS metrics vs bicubic...', op: 'Metric evaluation', tiles: '16 / 16' },
    { id: 'gis_export', durationMs: 1200, msg: 'Compiling EPSG:32644 sub-4m GeoTIFF & GIS outputs...', op: 'GeoTIFF writer', tiles: '16 / 16' },
  ];

  let elapsed = 0;
  let stageIdx = 0;

  const interval = setInterval(() => {
    elapsed += 0.5;
    const job = mockJobs.get(jobId);
    if (!job) {
      clearInterval(interval);
      return;
    }

    const currentStageDef = stages[stageIdx];
    if (!currentStageDef) {
      // Completed!
      clearInterval(interval);
      job.status = "completed";
      job.currentStageId = "gis_export";
      job.stageProgress = 100;
      job.overallProgress = 100;
      job.message = "Reconstruction mission completed. All geospatial products are ready.";
      job.telemetry.status = "STANDBY_READY";
      job.telemetry.activeOperation = "Completed";
      job.telemetry.elapsedSeconds = Math.round(elapsed);
      job.outputs = {
        srGeoTiffUrl: "/sample-satellite/SR_product.tif",
        uncertaintyGeoTiffUrl: "/sample-satellite/uncertainty_map.tif",
        metricsJsonUrl: "/sample-satellite/metrics.json",
        lrPreviewUrl: "/sample-satellite/lr.png",
        srPreviewUrl: "/sample-satellite/sr.png",
        uncertaintyPreviewUrl: "/sample-satellite/uncertainty.png",
        ndviPreviewUrl: "/sample-satellite/ndvi_comparison.png",
        validationReportUrl: "/sample-satellite/validation_report.html"
      };
      job.metrics = DEMO_METRICS;
      job.updatedAt = new Date().toISOString();
      mockJobs.set(jobId, job);
      return;
    }

    job.currentStageId = currentStageDef.id;
    job.message = currentStageDef.msg;
    job.telemetry.activeOperation = currentStageDef.op;
    job.telemetry.tileProgress = `${currentStageDef.tiles} Blended`;
    job.telemetry.elapsedSeconds = Math.round(elapsed);
    job.telemetry.memoryAllocated = `${(2.4 + stageIdx * 0.25).toFixed(1)} GB VRAM`;

    const overallP = Math.min(98, Math.round(((stageIdx + 0.5) / stages.length) * 100));
    job.overallProgress = overallP;
    job.stageProgress = Math.min(100, Math.round(((elapsed % 2) / 2) * 100));
    job.updatedAt = new Date().toISOString();
    mockJobs.set(jobId, job);

    if (elapsed > (stageIdx + 1) * 1.8) {
      stageIdx++;
    }
  }, 500);
}

export async function mockGetJobStatus(jobId: string): Promise<ProcessingJob> {
  const job = mockJobs.get(jobId);
  if (job) {
    return { ...job };
  }
  // If demo job requested
  if (jobId.includes('DEMO')) {
    return {
      jobId,
      status: "completed",
      currentStageId: "gis_export",
      stageProgress: 100,
      overallProgress: 100,
      message: "Reconstruction completed successfully.",
      telemetry: {
        status: "STANDBY_READY",
        model: "Multispectral SwinIR-SRM",
        inputGsd: "10.0 m",
        targetGsd: "3.33 m",
        bandCount: 4,
        device: "CUDA RTX 4090",
        elapsedSeconds: 38,
        tileProgress: "16 / 16 Tiles",
        memoryAllocated: "3.8 GB VRAM",
        activeOperation: "Export Finished"
      },
      metadata: DEMO_METADATA,
      outputs: {
        srGeoTiffUrl: "/sample-satellite/SR_product.tif",
        uncertaintyGeoTiffUrl: "/sample-satellite/uncertainty_map.tif",
        metricsJsonUrl: "/sample-satellite/metrics.json",
        lrPreviewUrl: "/sample-satellite/lr.png",
        srPreviewUrl: "/sample-satellite/sr.png",
        uncertaintyPreviewUrl: "/sample-satellite/uncertainty.png",
        ndviPreviewUrl: "/sample-satellite/ndvi_comparison.png"
      },
      metrics: DEMO_METRICS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  throw new Error(`Job ${jobId} not found in mock state`);
}

export async function mockValidateBandsApi(bands: any): Promise<import('../types/satellite').FourBandValidationResult> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 800));
  
  return {
    valid: true,
    mode: "four_bands",
    message: "All 4 Sentinel-2 bands (B02, B03, B04, B08) validated and spatially aligned.",
    metadata: {
      common: {
        width: 1024, height: 1024,
        crs: "EPSG:32644 (UTM Zone 44N)",
        nativeResolution: 10.0,
        targetResolution: 3.33,
        bounds: DEMO_METADATA.bounds,
        bands: ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"],
        sensor: "Sentinel-2 MSI Level-2A"
      }
    }
  };
}
