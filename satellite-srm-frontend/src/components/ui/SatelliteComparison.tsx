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
  // Keep the slider semantics explicit: the original/low-resolution image stays behind,
  // while the super-resolved result is revealed over it according to the handle position.
  const finalOriginalUrl = afterLabel.toLowerCase().includes('original') || afterLabel.toLowerCase().includes('sentinel') ? afterUrl : beforeUrl;
  const finalSuperResolvedUrl = beforeLabel.toLowerCase().includes('enhanced') || beforeLabel.toLowerCase().includes('srm') || beforeLabel.toLowerCase().includes('super') ? beforeUrl : afterUrl;
  const finalOriginalLabel = afterLabel.toLowerCase().includes('original') || afterLabel.toLowerCase().includes('sentinel') ? afterLabel : beforeLabel;
  const finalSuperResolvedLabel = beforeLabel.toLowerCase().includes('enhanced') || beforeLabel.toLowerCase().includes('srm') || beforeLabel.toLowerCase().includes('super') ? beforeLabel : afterLabel;

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
