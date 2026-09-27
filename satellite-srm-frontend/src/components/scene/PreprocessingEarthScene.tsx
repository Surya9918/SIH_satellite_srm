import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralSatellite } from './SatelliteModel';
import { ScanBeam } from './ScanBeam';
import { Atmosphere } from './Atmosphere';

interface PreprocessingEarthSceneProps {
  progress?: number; // 0 to 100
  isStageActive?: boolean;
}

// 10m Raster Grid & Tiling Overlay hovering above ground observation area
const RasterPatchGrid: React.FC<{
  progressRatio: number;
  satellitePosition: THREE.Vector3;
}> = ({ progressRatio, satellitePosition }) => {
  const gridGroupRef = useRef<THREE.Group>(null);
  const scanSweepRef = useRef<THREE.Mesh>(null);

  // Calculate ground footprint center on Earth surface (radius = 1.006)
  const groundPoint = satellitePosition.clone().normalize().multiplyScalar(1.006);

  useFrame(({ clock }) => {
    if (gridGroupRef.current) {
      gridGroupRef.current.position.copy(groundPoint);
      gridGroupRef.current.lookAt(satellitePosition);
    }

    if (scanSweepRef.current) {
      const t = clock.getElapsedTime();
      // Scanline sweeps across the 64x64 sub-patches
      scanSweepRef.current.position.y = -0.16 + ((t * 0.4) % 1.0) * 0.32;
    }
  });

  // Alignment interpolation for the 4 spectral layers (B02, B03, B04, B08)
  // Starts with slight offsets, then snaps into alignment as preprocessing progresses
  const alignmentFactor = Math.min(1.0, progressRatio * 1.5);
  const b02Offset = (1 - alignmentFactor) * 0.035;
  const b03Offset = (1 - alignmentFactor) * 0.025;
  const b04Offset = (1 - alignmentFactor) * 0.015;

  return (
    <group ref={gridGroupRef}>
      {/* 1. Base 10m Overlapping Patch Grid (64x64 sub-patches representation) */}
      <mesh>
        <planeGeometry args={[0.34, 0.34, 8, 8]} />
        <meshBasicMaterial
          color="#00e5ff"
          wireframe
          transparent
          opacity={0.35 + alignmentFactor * 0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Moving Laser Scan Sweep Line */}
      <mesh ref={scanSweepRef}>
        <planeGeometry args={[0.34, 0.015]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Four Aligning Spectral Corner Frames (B02, B03, B04, B08) */}
      {/* B02 Blue Frame */}
      <mesh position={[-b02Offset, b02Offset, 0.001]}>
        <ringGeometry args={[0.18, 0.185, 4]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* B03 Green Frame */}
      <mesh position={[b03Offset, b03Offset, 0.002]}>
        <ringGeometry args={[0.18, 0.185, 4]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* B04 Red Frame */}
      <mesh position={[-b04Offset, -b04Offset, 0.003]}>
        <ringGeometry args={[0.18, 0.185, 4]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* B08 NIR Frame (Centered Anchor) */}
      <mesh position={[0, 0, 0.004]}>
        <ringGeometry args={[0.18, 0.185, 4]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Ground illumination halo */}
      <mesh position={[0, 0, -0.001]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export const PreprocessingEarthScene: React.FC<PreprocessingEarthSceneProps> = ({
  progress = 50,
  isStageActive = true,
}) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const satelliteGroupRef = useRef<THREE.Group>(null);

  // Load NASA Earth day, night, and clouds textures locally
  const [dayMap, nightMap, cloudsMap, specularMap] = useTexture([
    '/textures/earth/earth_day.jpg',
    '/textures/earth/earth_night.jpg',
    '/textures/earth/earth_clouds.png',
    '/textures/earth/earth_specular.jpg',
  ]);

  useEffect(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
  }, [dayMap, nightMap]);

  // Satellite position stationed above observation target
  const satellitePos = new THREE.Vector3(0.5, 0.45, 1.25);

  // Progress ratio 0.0 -> 1.0
  const progressRatio = Math.max(0, Math.min(1, progress / 100));

  useFrame((_, delta) => {
    // Gentle planetary rotation
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.02;
    }

    // Cloud layer opacity reduction (visual metaphor for clearing radiometric noise)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.028;
      const mat = cloudsRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        // Opacity smoothly drops from 0.65 to 0.18 as imagery preparation finishes
        const targetOpacity = THREE.MathUtils.lerp(0.65, 0.18, progressRatio);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
      }
    }
  });

  return (
    <group position={[0, -0.2, 0]} scale={1.1}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 2, 3]} intensity={1.7} />
      <pointLight position={[-3, -2, -2]} intensity={0.4} color="#00e5ff" />

      {/* ── EARTH GLOBE WITH DYNAMIC CLOUD METAPHOR ── */}
      <group rotation={[0.41, 0, 0.23]}>
        {/* Terrestrial Earth Mesh */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[1.0, 64, 64]} />
          <meshStandardMaterial
            map={dayMap}
            roughnessMap={specularMap}
            roughness={0.45}
            metalness={0.06}
            emissiveMap={nightMap}
            emissive="#ffe4b5"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Dynamic Cloud Layer (Fades opacity during preprocessing) */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.012, 64, 64]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent={true}
            opacity={0.65}
            blending={THREE.NormalBlending}
            depthWrite={false}
            roughness={0.8}
          />
        </mesh>

        {/* Atmosphere Rim */}
        <Atmosphere radius={1.032} color="#3b8eed" intensity={1.15} />
      </group>

      {/* ── SATELLITE IN NADIR OBSERVATION POSE ── */}
      <group ref={satelliteGroupRef} position={satellitePos} rotation={[-0.32, -0.42, 0.12]} scale={0.85}>
        <ProceduralSatellite />
      </group>

      {/* ── OBSERVATION SCAN BEAM ── */}
      <ScanBeam satellitePosition={satellitePos} />

      {/* ── 10M RASTER GRID & 4-BAND ALIGNMENT OVERLAY ── */}
      <RasterPatchGrid
        progressRatio={progressRatio}
        satellitePosition={satellitePos}
      />
    </group>
  );
};
