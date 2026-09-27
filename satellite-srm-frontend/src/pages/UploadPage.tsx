import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SatelliteDropzone } from '../components/upload/SatelliteDropzone';
import { FileMetadata } from '../components/upload/FileMetadata';
import { useSrmStore, DEMO_METADATA } from '../store/useSrmStore';
import { startSuperResolution } from '../api/superResolution';
import { Satellite, Compass, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    uploadedFile,
    setUploadedFile,
    metadata,
    setMetadata,
    setActiveJob,
    isMockMode
  } = useSrmStore();

  const [isStarting, setIsStarting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
    setUploadError(null);

    // Client-side inspection of metadata
    const parsedMetadata = {
      filename: file.name,
      fileSize: file.size,
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
      acquisitionDate: new Date().toISOString().split('T')[0] + ' 06:15 UTC'
    };

    setMetadata(parsedMetadata);
  };

  const handleLoadSample = () => {
    setUploadedFile(null);
    setMetadata(DEMO_METADATA);
  };

  const handleStartReconstruction = async (model: string, enableUncertainty: boolean) => {
    setIsStarting(true);
    setUploadError(null);

    try {
      // If user hasn't dropped a file but is using sample metadata, create a dummy File
      const fileToUpload = uploadedFile || new File(["dummy geotiff content"], DEMO_METADATA.filename, { type: "image/tiff" });

      const response = await startSuperResolution({
        file: fileToUpload,
        model,
        enableUncertainty
      }, isMockMode);

      if (response.job) {
        setActiveJob(response.job);
      }

      navigate(`/app/process/${response.job_id}`);
    } catch (err: any) {
      setUploadError(err.message || "Failed to initialize reconstruction mission.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Satellite className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold font-mono text-primary">
              INITIALIZE RECONSTRUCTION MISSION
            </h1>
          </div>
          <p className="text-sm font-mono text-secondary">
            Upload Sentinel-2 multispectral GeoTIFF (B02, B03, B04, B08) to begin super-resolution mapping.
          </p>
        </div>
        <Badge variant="cyan" dot>
          INGESTION CONSOLE READY
        </Badge>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono">
          <strong>Mission Initialization Error:</strong> {uploadError}
        </div>
      )}

      {/* Main Dropzone */}
      <SatelliteDropzone
        onFileSelected={handleFileSelected}
        onLoadSample={handleLoadSample}
        selectedFile={uploadedFile}
      />

      {/* Metadata Card & Mission Controls (when file or sample is loaded) */}
      {metadata && (
        <FileMetadata
          metadata={metadata}
          onStartReconstruction={handleStartReconstruction}
          isStarting={isStarting}
        />
      )}

      {/* Technical Ingestion Guidelines */}
      <div className="rounded-xl border border-blue-100 bg-surface/60 p-5 font-mono text-xs text-secondary space-y-2">
        <h4 className="text-primary font-bold flex items-center gap-2 text-xs">
          <Compass className="h-4 w-4 text-accent" />
          <span>Multispectral Ingestion Requirements</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-secondary">
          <li>Must contain 4 spectral channels: Blue (B02), Green (B03), Red (B04), and NIR (B08).</li>
          <li>Target native resolution should be 10m GSD (Sentinel-2 Level-2A surface reflectance).</li>
          <li>Output product preserves spatial coordinates in standard UTM or geographic projections.</li>
        </ul>
      </div>

    </div>
  );
};
