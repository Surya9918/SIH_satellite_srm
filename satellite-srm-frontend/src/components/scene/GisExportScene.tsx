import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RealisticEarth } from './RealisticEarth';
import { ProceduralSatellite } from './SatelliteModel';

export type GisExportPhase =
  | 'multispectral_data'
  | 'georeferencing'
  | 'coordinates'
  | 'geotiff'
  | 'ready'
  | 'error';

interface GisExportSceneProps {
  phase: GisExportPhase;
  crs?: string;
}

// Stacking & Packaging Multispectral Raster Layers
const PackagingRasterStack: React.FC<{ phase: GisExportPhase }> = ({ phase }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Band colors: B02 Blue, B03 Green, B04 Red, B08 NIR
  const layers = useMemo(
    () => [
      { color: '#00e5ff', z: 0.15, name: 'B02' },
      { color: '#10b981', z: 0.05, name: 'B03' },
      { color: '#ef4444', z: -0.05, name: 'B04' },
      { color: '#a855f7', z: -0.15, name: 'B08' },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      // Gentle floating orientation
      groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.15 + 0.3;
      groupRef.current.rotation.x = -0.35 + Math.cos(t * 0.6) * 0.05;

      // When reaching 'geotiff' or 'ready', compress layers together into a solid GeoTIFF container
      const isCompressed = phase === 'geotiff' || phase === 'ready';
      const targetScaleZ = isCompressed ? 0.2 : 1.0;
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScaleZ, 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0.4]} scale={[1.1, 1.1, 1.0]}>
      {/* 4 Multispectral Band Layers */}
      {layers.map((layer, idx) => {
        const isCollapsed = phase === 'geotiff' || phase === 'ready';
        const zPos = isCollapsed ? (idx - 1.5) * 0.015 : layer.z;

        return (
          <group key={layer.name} position={[0, 0, zPos]}>
            {/* Raster Tile Plane */}
            <mesh>
              <planeGeometry args={[1.2, 1.2]} />
              <meshStandardMaterial
                color={layer.color}
                roughness={0.3}
                metalness={0.4}
                transparent
                opacity={isCollapsed ? 0.85 : 0.65}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Raster Pixel Grid Overlay */}
            <mesh position={[0, 0, 0.002]}>
              <planeGeometry args={[1.2, 1.2, 8, 8]} />
              <meshBasicMaterial
                color="#ffffff"
                wireframe
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}

      {/* Geospatial Affine Bounding Box Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.24, 1.24, 0.38]} />
        <meshBasicMaterial
          color={phase === 'ready' ? '#10b981' : phase === 'error' ? '#ef4444' : '#00e5ff'}
          wireframe
          transparent
          opacity={phase === 'georeferencing' || phase === 'coordinates' ? 0.7 : 0.3}
        />
      </mesh>

      {/* Corner coordinate beacons */}
      {[
        [-0.62, -0.62],
        [0.62, -0.62],
        [0.62, 0.62],
        [-0.62, 0.62],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.19]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial
            color={phase === 'ready' ? '#10b981' : '#00e5ff'}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};

// Orbiting Earth Observation Satellite and Nadir Georeferencing Beam
const OrbitingSatellite: React.FC<{ phase: GisExportPhase }> = ({ phase }) => {
  const satRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.LineSegments>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.9;
    const radius = 1.65;
    const x = Math.cos(t) * radius;
    const y = 0.75 + Math.sin(t * 0.5) * 0.2;
    const z = Math.sin(t) * radius * 0.6 + 0.3;

    if (satRef.current) {
      satRef.current.position.set(x, y, z);
      satRef.current.lookAt(0, -0.1, 0.4); // Points nadir sensor toward raster
    }
  });

  return (
    <group ref={satRef} scale={0.85}>
      <ProceduralSatellite />
    </group>
  );
};

// Projected Coordinate Graticule (Lat/Lon grid rings)
const CoordinateGraticule: React.FC<{ phase: GisExportPhase }> = ({ phase }) => {
  const rings = useMemo(() => [0.8, 1.2, 1.6], []);

  return (
    <group position={[0, -0.1, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
      {rings.map((r, i) => (
        <mesh key={i}>
          <ringGeometry args={[r, r + 0.008, 64]} />
          <meshBasicMaterial
            color={phase === 'coordinates' ? '#00e5ff' : '#1e3a8a'}
            transparent
            opacity={phase === 'coordinates' ? 0.45 : 0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

export const GisExportScene: React.FC<GisExportSceneProps> = ({ phase, crs = 'EPSG:32644' }) => {
  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 3, 3]} intensity={1.7} />
      <pointLight position={[-3, -2, -1]} intensity={0.5} color="#00e5ff" />
      <pointLight position={[2, 2, 2]} intensity={0.6} color="#10b981" />

      {/* Earth Visualization in background */}
      <group position={[0, -1.8, -1.2]} scale={1.2}>
        <RealisticEarth />
      </group>

      {/* Projected Geospatial Coordinate Graticule */}
      <CoordinateGraticule phase={phase} />

      {/* Orbiting Satellite */}
      <OrbitingSatellite phase={phase} />

      {/* Stacking Multispectral Raster Layers & GeoTIFF Container */}
      <PackagingRasterStack phase={phase} />
    </group>
  );
};
