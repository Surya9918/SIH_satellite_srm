import { create } from 'zustand';
import { ProcessingJob, SatelliteMetadata, ValidationMetrics } from '../types/satellite';

export const DEMO_METADATA: SatelliteMetadata = {
  filename: "S2A_MSIL2A_20260515_T44QND_agriculture.tif",
  fileSize: 1049664,
  format: "GeoTIFF (Multispectral)",
  width: 512,
  height: 512,
  bands: ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"],
  nativeResolution: 10.0,
  targetResolution: 3.33,
  crs: "EPSG:32644 (UTM Zone 44N)",
  bounds: {
    minLon: 78.4520,
    minLat: 17.3850,
    maxLon: 78.5032,
    maxLat: 17.4362
  },
  center: [17.4106, 78.4776],
  sensor: "Sentinel-2 MSI Level-2A",
  acquisitionDate: "2026-05-15 05:42 UTC"
};

export const DEMO_METRICS: ValidationMetrics = {
  l1_loss: {
    bicubic: 0.1250,
    model: 0.0210,
    gain: -0.1040,
    description: "L1 Pixel Loss",
    higherIsBetter: false
  },
  perceptual_loss: {
    bicubic: 0.3540,
    model: 0.0820,
    gain: -0.2720,
    description: "VGG Perceptual Loss",
    higherIsBetter: false
  },
  spectral_loss: {
    bicubic: 0.1420,
    model: 0.0350,
    gain: -0.1070,
    description: "Spectral Consistency Loss",
    higherIsBetter: false
  },
  ndvi_loss: {
    bicubic: 0.0980,
    model: 0.0150,
    gain: -0.0830,
    description: "NDVI Preservation Loss",
    higherIsBetter: false
  },
  ndvi_mae: {
    bicubic: 0.0680,
    model: 0.0160,
    gain: -0.0520,
    description: "NDVI Mean Absolute Error",
    higherIsBetter: false
  },
  uncertainty: {
    mean: 0.0842,
    max: 0.4820,
    min: 0.0120
  },
  scale_factor: 3.0,
  hasReferenceData: true
};

export const DEMO_JOB: ProcessingJob = {
  jobId: "SRM-NTRO-DEMO-01",
  status: "completed",
  currentStageId: "gis_export",
  stageProgress: 100,
  overallProgress: 100,
  message: "Reconstruction mission completed successfully. All GIS GeoTIFF products compiled.",
  telemetry: {
    status: "STANDBY_READY",
    model: "Multispectral SwinIR-SRM (NTRO PS-26142)",
    inputGsd: "10.0 m",
    targetGsd: "3.33 m (x3 Super-Resolution)",
    bandCount: 4,
    device: "CUDA RTX 4090 / PyTorch Fallback",
    elapsedSeconds: 42,
    inferenceSeconds: 2.4,
    tileProgress: "16 / 16 Overlapping Tiles Blended",
    memoryAllocated: "3.82 GB VRAM",
    activeOperation: "Export Finished"
  },
  metadata: DEMO_METADATA,
  outputs: {
    srGeoTiffUrl: "/api/v1/outputs/SR_product.tif",
    uncertaintyGeoTiffUrl: "/api/v1/outputs/uncertainty_map.tif",
    metricsJsonUrl: "/api/v1/outputs/metrics.json",
    lrPreviewUrl: "/api/v1/outputs/lr.png",
    srPreviewUrl: "/api/v1/outputs/sr.png",
    uncertaintyPreviewUrl: "/api/v1/outputs/uncertainty.png",
    ndviPreviewUrl: "/api/v1/outputs/ndvi_comparison.png",
    b02PreviewUrl: "/api/v1/outputs/b02.png",
    b03PreviewUrl: "/api/v1/outputs/b03.png",
    b04PreviewUrl: "/api/v1/outputs/b04.png",
    b08PreviewUrl: "/api/v1/outputs/b08.png",
    falseColorPreviewUrl: "/api/v1/outputs/false_color.png",
    validationReportUrl: "/api/v1/outputs/validation_report.html"
  },
  metrics: DEMO_METRICS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

interface SrmState {
  uploadedFile: File | null;
  uploadedFiles: File[];
  fourBands: import('../types/satellite').FourBandFiles;
  validationResult: import('../types/satellite').FourBandValidationResult | null;
  metadata: SatelliteMetadata | null;
  activeJob: ProcessingJob | null;
  activeJobs: ProcessingJob[];
  selectedJobId: string | null;
  isMockMode: boolean;
  selectedViewerTab: 'slider' | 'split' | 'uncertainty' | 'ndvi';
  sliderPosition: number;
  uncertaintyOpacity: number;
  zoomLevel: number;
  isPixelGridVisible: boolean;
  panOffset: { x: number; y: number };

  setUploadedFile: (file: File | null) => void;
  setUploadedFiles: (files: File[]) => void;
  addUploadedFiles: (files: File[]) => void;
  removeUploadedFile: (index: number) => void;
  setFourBand: (band: 'b02' | 'b03' | 'b04' | 'b08', file: File | null) => void;
  setAllFourBands: (bands: import('../types/satellite').FourBandFiles) => void;
  setValidationResult: (res: import('../types/satellite').FourBandValidationResult | null) => void;
  setMetadata: (meta: SatelliteMetadata | null) => void;
  setActiveJob: (job: ProcessingJob | null) => void;
  setActiveJobs: (jobs: ProcessingJob[]) => void;
  setSelectedJobId: (id: string | null) => void;
  updateJobProgress: (update: Partial<ProcessingJob>) => void;
  setMockMode: (mock: boolean) => void;
  setSelectedViewerTab: (tab: 'slider' | 'split' | 'uncertainty' | 'ndvi') => void;
  setSliderPosition: (pos: number) => void;
  setUncertaintyOpacity: (opacity: number) => void;
  setZoomLevel: (zoom: number) => void;
  togglePixelGrid: () => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  loadDemoDataset: () => void;
  resetAll: () => void;
}

export const useSrmStore = create<SrmState>((set) => ({
  uploadedFile: null,
  uploadedFiles: [],
  fourBands: { b02: null, b03: null, b04: null, b08: null },
  validationResult: null,
  metadata: null,
  activeJob: null,
  activeJobs: [],
  selectedJobId: null,
  isMockMode: false,
  selectedViewerTab: 'slider',
  sliderPosition: 50,
  uncertaintyOpacity: 0.65,
  zoomLevel: 1.0,
  isPixelGridVisible: false,
  panOffset: { x: 0, y: 0 },

  setFourBand: (band, file) => set((state) => ({
    fourBands: { ...state.fourBands, [band]: file },
    validationResult: null
  })),
  setAllFourBands: (bands) => set({ fourBands: bands, validationResult: null }),
  setValidationResult: (res) => set({ validationResult: res }),
  setUploadedFile: (file) => set({ uploadedFile: file, uploadedFiles: file ? [file] : [] }),
  setUploadedFiles: (files) => set({ uploadedFiles: files, uploadedFile: files[0] || null }),
  addUploadedFiles: (newFiles) => set((state) => {
    const combined = [...state.uploadedFiles, ...newFiles];
    return { uploadedFiles: combined, uploadedFile: combined[0] || null };
  }),
  removeUploadedFile: (index) => set((state) => {
    const updated = state.uploadedFiles.filter((_, i) => i !== index);
    return { uploadedFiles: updated, uploadedFile: updated[0] || null };
  }),
  setMetadata: (meta) => set({ metadata: meta }),
  setActiveJob: (job) => set({ activeJob: job, selectedJobId: job?.jobId || null }),
  setActiveJobs: (jobs) => set({
    activeJobs: jobs,
    activeJob: jobs[0] || null,
    selectedJobId: jobs[0]?.jobId || null,
  }),
  setSelectedJobId: (id) => set((state) => {
    const found = state.activeJobs.find(j => j.jobId === id);
    return {
      selectedJobId: id,
      ...(found ? { activeJob: found } : {})
    };
  }),
  updateJobProgress: (update) => set((state) => {
    const updatedActive = state.activeJob ? { ...state.activeJob, ...update, updatedAt: new Date().toISOString() } : null;
    const updatedJobs = state.activeJobs.map(j => (j.jobId === updatedActive?.jobId ? updatedActive : j));
    return { activeJob: updatedActive, activeJobs: updatedJobs };
  }),
  setMockMode: (mock) => set({ isMockMode: mock }),
  setSelectedViewerTab: (tab) => set({ selectedViewerTab: tab }),
  setSliderPosition: (pos) => set({ sliderPosition: pos }),
  setUncertaintyOpacity: (opacity) => set({ uncertaintyOpacity: opacity }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  togglePixelGrid: () => set((state) => ({ isPixelGridVisible: !state.isPixelGridVisible })),
  setPanOffset: (offset) => set({ panOffset: offset }),
  loadDemoDataset: () => set({
    uploadedFile: null,
    uploadedFiles: [],
    fourBands: { b02: null, b03: null, b04: null, b08: null },
    validationResult: null,
    metadata: DEMO_METADATA,
    activeJob: DEMO_JOB,
    activeJobs: [DEMO_JOB],
    selectedJobId: DEMO_JOB.jobId,
    sliderPosition: 50,
    zoomLevel: 1.0,
  }),
  resetAll: () => set({
    uploadedFile: null,
    uploadedFiles: [],
    fourBands: { b02: null, b03: null, b04: null, b08: null },
    validationResult: null,
    metadata: null,
    activeJob: null,
    activeJobs: [],
    selectedJobId: null,
    sliderPosition: 50,
    zoomLevel: 1.0,
    panOffset: { x: 0, y: 0 }
  })
}));
