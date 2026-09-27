import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface BandReadingStackSceneProps {
  currentStageId?: string;
  isStackedOverride?: boolean;
}

interface SpectralLayerDef {
  key: string;
  label: string;
  colorName: string;
  color: string;
  wavelength: string;
  baseY: number; // initial unstacked Y position
  texturePath: string;
}

const LAYERS: SpectralLayerDef[] = [
  {
    key: 'b02',
    label: 'B02',
    colorName: 'Blue',
    color: '#00e5ff',
    wavelength: '490 nm',
    baseY: 0.65,
    texturePath: '/sample-satellite/b02.png',
  },
  {
    key: 'b03',
    label: 'B03',
    colorName: 'Green',
    color: '#10b981',
    wavelength: '560 nm',
    baseY: 0.22,
    texturePath: '/sample-satellite/b03.png',
  },
  {
    key: 'b04',
    label: 'B04',
    colorName: 'Red',
    color: '#ef4444',
    wavelength: '665 nm',
    baseY: -0.22,
    texturePath: '/sample-satellite/b04.png',
  },
  {
    key: 'b08',
    label: 'B08',
    colorName: 'NIR',
    color: '#a855f7',
    wavelength: '842 nm',
    baseY: -0.65,
    texturePath: '/sample-satellite/b08.png',
  },
];

// Single Spectral Plane Layer in 3D Space
const SpectralLayerPlane: React.FC<{
  layer: SpectralLayerDef;
  index: number;
  cycleTime: number;
  isStacked: boolean;
}> = ({ layer, index, cycleTime, isStacked }) => {
  const meshRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);

  // Load band raster texture with safe graceful fallback
  let texture: THREE.Texture | null = null;
  try {
    texture = useTexture(layer.texturePath);
  } catch {
    texture = null;
  }

  // Determine scanning phase: 0=B02, 1=B03, 2=B04, 3=B08, 4=Stacking
  const scanWindowStart = index * 1.15;
  const scanWindowEnd = scanWindowStart + 1.15;
  const isThisScanning = cycleTime >= scanWindowStart && cycleTime < scanWindowEnd;
  const hasBeenScanned = cycleTime >= scanWindowEnd;

  // Stacking interpolation factor (0.0 = separated, 1.0 = aligned stack)
  const stackProgress = isStacked ? 1.0 : Math.max(0, Math.min(1, (cycleTime - 4.6) * 1.2));

  // Current target Y position: interpolates from baseY to compressed stack Y
  const stackedY = (1.5 - index) * 0.07;
  const currentY = THREE.MathUtils.lerp(layer.baseY, stackedY, stackProgress);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = currentY;
    }

    // Laser scan line translation across raster plane
    if (scanLineRef.current && isThisScanning) {
      const scanPhase = (cycleTime - scanWindowStart) / 1.15;
      scanLineRef.current.position.y = -0.55 + scanPhase * 1.1;
      const mat = scanLineRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.85;
      }
    } else if (scanLineRef.current) {
      const mat = scanLineRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0;
      }
    }
  });

  return (
    <group ref={meshRef} position={[0, layer.baseY, 0]} rotation={[-0.85, 0.55, 0.45]}>
      {/* 1. Main Raster Image Plane */}
      <mesh>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? '#ffffff' : layer.color}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={stackProgress > 0.8 ? 0.75 : hasBeenScanned || isThisScanning ? 0.95 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Glowing Spectral Band Tint & Grid Border */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[1.52, 1.52]} />
        <meshBasicMaterial
          color={layer.color}
          wireframe
          transparent
          opacity={isThisScanning ? 0.9 : hasBeenScanned ? 0.5 : 0.25}
        />
      </mesh>

      {/* 3. Laser Sweep Scan Line */}
      <mesh ref={scanLineRef} position={[0, 0, 0.005]}>
        <boxGeometry args={[1.5, 0.03, 0.002]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

// Corner Vertical Alignment Guide Lasers
const AlignmentCornerGuides: React.FC<{ stackProgress: number }> = ({ stackProgress }) => {
  const corners = useMemo(() => [
    [-0.75, -0.75],
    [0.75, -0.75],
    [0.75, 0.75],
    [-0.75, 0.75],
  ], []);

  if (stackProgress < 0.2) return null;

  return (
    <group rotation={[-0.85, 0.55, 0.45]}>
      {corners.map(([x, y], idx) => (
        <mesh key={idx} position={[x, y, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 1.4, 8]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={Math.min(0.7, stackProgress * 0.75)}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

export const BandReadingStackScene: React.FC<BandReadingStackSceneProps> = ({
  currentStageId = 'preprocessing',
  isStackedOverride = false,
}) => {
  const [cycleTime, setCycleTime] = React.useState(0);
  const groupRef = useRef<THREE.Group>(null);

  const isPreprocessing = currentStageId === 'preprocessing' || currentStageId === 'ingestion';
  const isStacked = isStackedOverride || (!isPreprocessing && currentStageId !== undefined);

  useFrame((_, delta) => {
    // 6.5s seamless scanning loop
    setCycleTime((prev) => (prev + delta) % 6.5);

    // Gentle global isometric drift
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(cycleTime * 0.4) * 0.08;
    }
  });

  const stackProgress = isStacked ? 1.0 : Math.max(0, Math.min(1, (cycleTime - 4.6) * 1.2));

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.15}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 3]} intensity={1.5} />
      <pointLight position={[-2, -3, 2]} intensity={0.6} color="#00e5ff" />

      {/* 4 Spectral Planes: B02, B03, B04, B08 */}
      {LAYERS.map((layer, idx) => (
        <SpectralLayerPlane
          key={layer.key}
          layer={layer}
          index={idx}
          cycleTime={cycleTime}
          isStacked={isStacked}
        />
      ))}

      {/* Vertical Alignment Locking Guides */}
      <AlignmentCornerGuides stackProgress={stackProgress} />
    </group>
  );
};
