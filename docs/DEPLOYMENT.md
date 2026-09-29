# 🚀 Deployment Guide

This document outlines how to deploy the Satellite-SRM platform in a production environment.

## 1. Prerequisites
- Docker & Docker Compose installed
- NVIDIA GPU with drivers & nvidia-container-toolkit (Recommended for production)
- Minimum 16GB RAM (32GB recommended for large GeoTIFFs)

## 2. Environment Setup
1. Clone the repository.
2. Copy `.env.example` to `.env` at the root.
3. Configure `MODEL_WEIGHTS_PATH` and verify `CUDA_VISIBLE_DEVICES`.

## 3. Deploying with Docker Compose
From the root directory, run:
```bash
docker-compose up -d --build
```
This spins up:
- The backend FastAPI service on port `8000`.
- The frontend React service on port `3000`.

## 4. Production Checklist
- [ ] Ensure `VITE_USE_MOCK_API` is `false`.
- [ ] Mount persistent volumes for `/data` and `/outputs`.
- [ ] Place model weights in the mounted checkpoints directory.
- [ ] Set up a reverse proxy (e.g., Nginx, Traefik) for HTTPS/SSL termination.
