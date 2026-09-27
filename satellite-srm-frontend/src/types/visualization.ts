/**
 * TerraSR Reusable 3D Stage-Based Visualization System Types
 * 
 * Maps real backend and frontend processing states to visual 3D animation stages.
 * Strictly decoupled from backend inference and model logic.
 */

export type TerraSRVisualStage =
  | 'UPLOAD'              // 1. Uploading B02/B03/B04/B08 bands
  | 'VALIDATING'          // 2. Checking spatial extents, CRS, resolution
  | 'READING_BANDS'       // 3. Ingesting raster structure, calibrating channels
  | 'PREPROCESSING'       // 4. Radiometric normalization, patch tiling
  | 'SWINIR'              // 5. Deep residual transformer neural inference
  | 'RECONSTRUCTING'      // 6. Spectral blending & inter-band consistency
  | 'UNCERTAINTY'         // 7. Monte Carlo variance analysis & confidence mapping
  | 'RESULTS'             // 8. Super-resolved products & metric validation
  | 'EXPORTING'           // 9. GIS bundle & GeoTIFF export packaging
  | 'COMPLETE';           // 10. Mission complete / standby ready

export interface VisualStageConfig {
  stage: TerraSRVisualStage;
  label: string;
  sublabel: string;
  primaryColor: string;
  accentColor: string;
  // Visual layer toggles in the unified 3D scene
  layers: {
    earth: boolean;
    atmosphere: boolean;
    cloudLayer: boolean;
    satellite: boolean;
    orbit: boolean;
    scanBeam: boolean;
    spectralParticles: boolean;
    multispectralLayers: boolean;
    rasterGrid: boolean;
    highResGrid: boolean;
    uncertaintyOverlay: boolean;
  };
  // Camera & orbital dynamics
  cameraMode: 'orbital' | 'nadir_zoom' | 'sensor_focus' | 'split_view' | 'wide_recon';
}

/**
 * Stage configuration registry for the unified 3D visualization scene.
 * Each stage toggles specific visual explanations within the SAME single 3D scene.
 */
export const VISUAL_STAGE_REGISTRY: Record<TerraSRVisualStage, VisualStageConfig> = {
  UPLOAD: {
    stage: 'UPLOAD',
    label: 'Band Ingestion',
    sublabel: 'Awaiting B02, B03, B04, and B08 raster channels',
    primaryColor: '#00e5ff',
    accentColor: '#3b8eed',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: true,
      satellite: true,
      orbit: true,
      scanBeam: false,
      spectralParticles: false,
      multispectralLayers: true,
      rasterGrid: false,
      highResGrid: false,
      uncertaintyOverlay: false,
    },
    cameraMode: 'orbital',
  },
  VALIDATING: {
    stage: 'VALIDATING',
    label: 'Spatial Alignment',
    sublabel: 'Verifying CRS, affine matrix, and bounding extents',
    primaryColor: '#f59e0b',
    accentColor: '#00e5ff',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: true,
      satellite: true,
      orbit: true,
      scanBeam: true,
      spectralParticles: false,
      multispectralLayers: true,
      rasterGrid: true,
      highResGrid: false,
      uncertaintyOverlay: false,
    },
    cameraMode: 'sensor_focus',
  },
  READING_BANDS: {
    stage: 'READING_BANDS',
    label: 'Radiometric Calibration',
    sublabel: 'Reading 10m Sentinel-2 bands into aligned spectral tensor',
    primaryColor: '#00e5ff',
    accentColor: '#10b981',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: true,
      satellite: true,
      orbit: true,
      scanBeam: true,
      spectralParticles: true,
      multispectralLayers: true,
      rasterGrid: true,
      highResGrid: false,
      uncertaintyOverlay: false,
    },
    cameraMode: 'nadir_zoom',
  },
  PREPROCESSING: {
    stage: 'PREPROCESSING',
    label: 'Preprocessing & Tiling',
    sublabel: 'Normalizing reflectance & extracting overlapping 64x64 sub-patches',
    primaryColor: '#3b8eed',
    accentColor: '#00e5ff',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: false, // Cloud layer clears to reveal clean ground target
      satellite: true,
      orbit: true,
      scanBeam: true,
      spectralParticles: true,
      multispectralLayers: true,
      rasterGrid: true,
      highResGrid: false,
      uncertaintyOverlay: false,
    },
    cameraMode: 'nadir_zoom',
  },
  SWINIR: {
    stage: 'SWINIR',
    label: 'Neural Super-Resolution',
    sublabel: 'SwinIR residual transformer reconstructing sub-4m spatial details',
    primaryColor: '#8b5cf6',
    accentColor: '#00e5ff',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: false,
      satellite: true,
      orbit: true,
      scanBeam: true,
      spectralParticles: true,
      multispectralLayers: true,
      rasterGrid: true,
      highResGrid: true, // High-resolution sub-4m grid emerges
      uncertaintyOverlay: false,
    },
    cameraMode: 'split_view',
  },
  RECONSTRUCTING: {
    stage: 'RECONSTRUCTING',
    label: 'Spectral Reconstruction',
    sublabel: 'Reconstructing 4-band composite & Hann window tile blending',
    primaryColor: '#10b981',
    accentColor: '#8b5cf6',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: false,
      satellite: true,
      orbit: true,
      scanBeam: true,
      spectralParticles: true,
      multispectralLayers: true,
      rasterGrid: false,
      highResGrid: true,
      uncertaintyOverlay: false,
    },
    cameraMode: 'wide_recon',
  },
  UNCERTAINTY: {
    stage: 'UNCERTAINTY',
    label: 'Uncertainty Estimation',
    sublabel: 'Computing Monte Carlo spatial variance & model confidence',
    primaryColor: '#ec4899',
    accentColor: '#f59e0b',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: false,
      satellite: true,
      orbit: true,
      scanBeam: true,
      spectralParticles: false,
      multispectralLayers: true,
      rasterGrid: false,
      highResGrid: true,
      uncertaintyOverlay: true, // Thermal/variance confidence heatmap layer
    },
    cameraMode: 'nadir_zoom',
  },
  RESULTS: {
    stage: 'RESULTS',
    label: 'Reconstruction Results',
    sublabel: 'Sub-4m GeoTIFF, false color CIR, and NDVI verified',
    primaryColor: '#10b981',
    accentColor: '#00e5ff',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: true,
      satellite: true,
      orbit: true,
      scanBeam: false,
      spectralParticles: false,
      multispectralLayers: true,
      rasterGrid: false,
      highResGrid: true,
      uncertaintyOverlay: false,
    },
    cameraMode: 'orbital',
  },
  EXPORTING: {
    stage: 'EXPORTING',
    label: 'GIS Product Export',
    sublabel: 'Packaging georeferenced GeoTIFF with affine transforms & metadata',
    primaryColor: '#00e5ff',
    accentColor: '#10b981',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: true,
      satellite: true,
      orbit: true,
      scanBeam: true,
      spectralParticles: true,
      multispectralLayers: true,
      rasterGrid: true,
      highResGrid: true,
      uncertaintyOverlay: false,
    },
    cameraMode: 'wide_recon',
  },
  COMPLETE: {
    stage: 'COMPLETE',
    label: 'Mission Ready',
    sublabel: 'All geospatial products compiled and ready for GIS integration',
    primaryColor: '#10b981',
    accentColor: '#00e5ff',
    layers: {
      earth: true,
      atmosphere: true,
      cloudLayer: true,
      satellite: true,
      orbit: true,
      scanBeam: false,
      spectralParticles: false,
      multispectralLayers: true,
      rasterGrid: false,
      highResGrid: true,
      uncertaintyOverlay: false,
    },
    cameraMode: 'orbital',
  },
};

/**
 * Pure helper function to derive the current 3D visual stage from
 * real frontend and backend state variables.
 */
export function deriveVisualStage(params: {
  frontendStep: 'upload' | 'metadata' | 'processing' | 'results';
  isValidating?: boolean;
  isExporting?: boolean;
  backendStageId?: string;
  jobStatus?: string;
}): TerraSRVisualStage {
  const { frontendStep, isValidating, isExporting, backendStageId, jobStatus } = params;

  // 1. Export in progress
  if (isExporting) {
    return 'EXPORTING';
  }

  // 2. Validation in progress
  if (isValidating) {
    return 'VALIDATING';
  }

  // 3. Step-based mapping
  if (frontendStep === 'upload') {
    return 'UPLOAD';
  }

  if (frontendStep === 'metadata') {
    return 'READING_BANDS';
  }

  if (frontendStep === 'processing') {
    if (jobStatus === 'completed') {
      return 'COMPLETE';
    }

    switch (backendStageId) {
      case 'ingestion':
        return 'READING_BANDS';
      case 'preprocessing':
        return 'PREPROCESSING';
      case 'super_resolution':
        return 'SWINIR';
      case 'spectral_consistency':
        return 'RECONSTRUCTING';
      case 'uncertainty_estimation':
        return 'UNCERTAINTY';
      case 'validation':
        return 'RESULTS';
      case 'gis_export':
        return 'EXPORTING';
      default:
        return 'SWINIR';
    }
  }

  if (frontendStep === 'results') {
    return 'RESULTS';
  }

  return 'UPLOAD';
}
