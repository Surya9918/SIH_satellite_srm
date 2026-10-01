# Satellite-SRM Integration Platform (SRM-X)

![Build](https://github.com/Surya9918/SIH_satellite_srm/workflows/Build%20Docker%20Images/badge.svg)
![Tests](https://github.com/Surya9918/SIH_satellite_srm/workflows/Run%20Tests/badge.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)

**Problem Statement ID:** 26142  
**Organization:** National Technical Research Organisation (NTRO)  
**Theme:** Space Technology  
**Domain:** Satellite Super-Resolution Mapping (SRM) from Medium-Resolution Imagery  

## 🔗 Quick Links
- [📚 Architecture Docs](./docs/ARCHITECTURE.md)
- [🚀 Deployment Guide](./docs/DEPLOYMENT.md)
- [🔧 Development Setup](./docs/DEVELOPMENT.md)
- [🔌 API Specs](./docs/API.md)

## 🌍 Overview

**SRM-X** is an AI-powered Earth Observation intelligence platform designed to reconstruct **sub-4 m spatial resolution geospatial products** from **10 m Sentinel-2 multispectral satellite imagery**. This project is a full-stack repository containing both the deep learning inference engine and the interactive web mission control platform.

The system rigorously preserves:
- **Spatial geometric integrity** without edge blur.
- **Spectral consistency** across all bands and vegetation indices (like NDVI).
- **Geographic metadata & CRS projection** (e.g. EPSG:32644) for immediate QGIS/ArcGIS ingestion.
- **Pixel-level uncertainty quantification** via Monte Carlo Dropout variance.

## 📁 Repository Structure

- **[`Satellite_SRM_DL`](./Satellite_SRM_DL)**: 
  The Python/FastAPI backend containing the core Deep Learning pipeline (PyTorch/SwinIR) for geospatial data processing, patching, multi-band super-resolution, and tile blending.
- **[`satellite-srm-frontend`](./satellite-srm-frontend)**: 
  The React 18 / TypeScript frontend application built with Vite and Tailwind CSS. It provides a drag-and-drop interface, active job telemetry, dual-view slider comparisons, and a rich visualization suite.

## 🚀 Getting Started (Windows)

We provide bundled batch scripts to quickly set up and run the entire stack on Windows via Anaconda.

### 1. Installation

Run the setup script to create a conda environment named `satellite-srm`, install all required geospatial C++ libraries (GDAL, GeoPandas, OpenCV, etc.), and install the backend pip dependencies.

```bat
setup_conda.bat
```

### 2. Running the Application

To boot the full application (builds the frontend, serves it via the FastAPI backend, and starts the local server at `http://localhost:8000`):

```bat
start.bat
```

> **Note:** If you already have the environment set up and just want to run the conda-based server, use `start_conda.bat`.

## 📚 Detailed Documentation

For module-specific instructions, architecture diagrams, and scientific metrics, please refer to:
- [Backend Deep Learning Documentation](./Satellite_SRM_DL/README.md)
- [Frontend Mission Control Documentation](./satellite-srm-frontend/README.md)

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
