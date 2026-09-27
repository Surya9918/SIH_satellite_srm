import React from 'react';
import { InteractiveComparisonViewer } from '../results/InteractiveComparisonViewer';

export interface SatelliteComparisonProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  ndviUrl?: string;
  uncertaintyUrl?: string;
  initialPosition?: number; // 0-100
  height?: string;
  showControls?: boolean;
  className?: string;
  originalResolution?: string;
  enhancedResolution?: string;
  crs?: string;
  bounds?: {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  };
  center?: [number, number];
}

export const SatelliteComparison: React.FC<SatelliteComparisonProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Original · 10m',
  afterLabel = 'SRM Enhanced · <4m',
  ndviUrl,
  uncertaintyUrl,
  initialPosition = 50,
  height = '480px',
  className = '',
  originalResolution,
  enhancedResolution,
  crs,
  bounds,
  center,
}) => {
  // Normalize orientation: Ensure Original (10m / LR) is on Left and Super-Resolved (SR) is on Right
  const isBeforeEnhanced =
    beforeUrl.includes('sr') ||
    beforeLabel.toLowerCase().includes('enhanced') ||
    beforeLabel.toLowerCase().includes('srm') ||
    beforeLabel.toLowerCase().includes('super');

  const finalOriginalUrl = isBeforeEnhanced ? afterUrl : beforeUrl;
  const finalSuperResolvedUrl = isBeforeEnhanced ? beforeUrl : afterUrl;
  const finalOriginalLabel = isBeforeEnhanced ? afterLabel : beforeLabel;
  const finalSuperResolvedLabel = isBeforeEnhanced ? beforeLabel : afterLabel;

  return (
    <InteractiveComparisonViewer
      originalUrl={finalOriginalUrl}
      superResolvedUrl={finalSuperResolvedUrl}
      ndviUrl={ndviUrl}
      uncertaintyUrl={uncertaintyUrl}
      originalLabel={finalOriginalLabel}
      superResolvedLabel={finalSuperResolvedLabel}
      originalResolution={originalResolution || '10m GSD'}
      enhancedResolution={enhancedResolution || '~3.33m GSD'}
      crs={crs || 'EPSG:32644 (UTM Zone 44N)'}
      bounds={bounds}
      center={center}
      height={height}
      initialPosition={initialPosition}
      className={className}
    />
  );
};
