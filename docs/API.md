# 📡 API Specifications

The backend provides a RESTful API via FastAPI. Once the backend is running, you can access the full interactive OpenAPI documentation (Swagger) at:
`http://localhost:8000/docs`

## Core Endpoints Overview

### `POST /api/v1/jobs/submit`
Submit a new inference job.
- **Payload**: Multipart form-data containing the Sentinel-2 `.tif` file.
- **Returns**: `job_id`

### `GET /api/v1/jobs/{job_id}/status`
Poll the status of a specific job.
- **Returns**: JSON object containing status (pending, processing, complete, failed) and active stage telemetry.

### `GET /api/v1/jobs/{job_id}/results`
Retrieve the generated sub-4m SR product and uncertainty maps.
- **Returns**: JSON metadata with download links.

### `GET /api/v1/download/{filename}`
Download standard processed files and visual layers.
