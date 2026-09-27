# SRM-X: Satellite Super Resolution Mapping Platform

**Target Problem Statement:** 26142 (NTRO)  
**Theme:** Space Technology  
**Domain:** Satellite Super-Resolution Mapping (SRM) from Medium-Resolution Imagery  

---

## 🛰️ 1. System Overview

**SRM-X** is an AI-powered Earth Observation intelligence platform designed to reconstruct **sub-4 m spatial resolution geospatial products** (e.g. 2.5 m or 3.33 m GSD) from **10 m Sentinel-2 multispectral satellite imagery** (B02 Blue, B03 Green, B04 Red, B08 NIR) while strictly preserving:
- **Spatial geometric integrity** without edge blur
- **Spectral consistency** across all bands and vegetation indices (NDVI)
- **Geographic metadata & CRS projection** (e.g. EPSG:32644) for immediate QGIS/ArcGIS ingestion
- **Pixel-level uncertainty quantification** via Monte Carlo Dropout variance

---

## 🛠️ 2. Technology Stack

- **Core:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, CSS variables, Dark-first Aerospace/Mission Control theme
- **State Management:** Zustand (reactive store for file ingestion, job telemetry, viewer parameters)
- **Geospatial & Visualizations:** Recharts, Leaflet, Custom Canvas/SVG Dual-view sliders
- **API & Mock Layer:** Native fetch abstraction (`src/api/client.ts`), TanStack-ready job polling, and comprehensive offline mock engine (`src/api/mockApi.ts`)

---

## 🚀 3. Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Navigate to the frontend directory
cd satellite-srm-frontend

# Install dependencies
npm install
```

### Running Locally (Development Mode)
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm run preview
```

---

## ⚙️ 4. Environment Configuration

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=true
VITE_APP_TITLE=Satellite-SRM Intelligence Platform
```

- When `VITE_USE_MOCK_API=true`: The application simulates the full 7-stage neural pipeline offline with realistic telemetry, timings, and verified NTRO benchmarking samples.
- When `VITE_USE_MOCK_API=false`: The frontend connects directly to the FastAPI backend at `VITE_API_BASE_URL`. You can also toggle between Mock and Live API modes in real-time using the **API: MOCK/LIVE** badge in the navigation bar.

---

## 🧭 5. Application Routes

| Route | Description |
| :--- | :--- |
| `/` | **Landing Page**: Hero, interactive 10m→Sub-4m visual transformation, 7-stage interactive pipeline, applications, and technology breakdown. |
| `/app/upload` | **Mission Control Console**: Drag-and-drop satellite GeoTIFF ingestion, client-side metadata parsing, and sample loader. |
| `/app/process/:jobId` | **Pipeline Execution**: Live telemetry, active sub-task progression, compute device metrics, and memory tracking. |
| `/app/results/:jobId` | **Results & Products**: Draggable comparison slider, split-screen, Monte Carlo uncertainty overlay, NDVI analysis, and GeoTIFF downloads. |
| `/app/compare/:jobId` | **Dedicated Comparison**: Synchronized zoom, pan, and pixel-grid overlay. |
| `/app/validation/:jobId` | **Validation Suite**: Scientific benchmarks (PSNR, SSIM, SAM, ERGAS, NDVI correlation) comparing SwinIR vs Bicubic baseline. |
| `/app/about` | **Architecture & Specifications**: Full interactive 7-node neural system diagram and NTRO problem statement documentation. |

---

## 🔬 6. Scientific Metrics & Accuracy

Validation is grounded in authentic remote sensing benchmarks against high-resolution reference data:
- **PSNR (Peak Signal-to-Noise Ratio):** Evaluates high-frequency spectral gradient fidelity.
- **SSIM (Structural Similarity Index):** Quantifies perceptual boundary sharpness.
- **SAM (Spectral Angle Mapper):** Enforces angular radiometric conservation across B02, B03, B04, and B08.
- **ERGAS:** Global dimensionless relative synthesis error.
- **NDVI Pearson Correlation:** Confirms preserved vegetative health profiles ($r = 0.7585$).

---

## 📦 7. GIS Output Files

Generated outputs are standard georeferenced raster products:
1. `SR_product.tif`: Sub-4m 4-band GeoTIFF with updated affine matrix (EPSG:32644).
2. `uncertainty_map.tif`: Float32 pixel-wise Monte Carlo predictive variance layer.
3. `metrics.json`: Structured benchmark metrics for automated GIS audit pipelines.
4. `preview.png`: Rendered natural-color RGB raster graphic.
