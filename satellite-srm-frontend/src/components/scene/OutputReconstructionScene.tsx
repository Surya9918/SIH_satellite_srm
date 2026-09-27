import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface OutputReconstructionSceneProps {
  progress?: number;
  isStageActive?: boolean;
}

interface BandLayerConfig {
  key: string;
  name: string;
  color: string;
  basePos: [number, number, number];
  texturePath: string;
}

const BANDS: BandLayerConfig[] = [
  { key: 'b02', name: 'B02', color: '#00e5ff', basePos: [-1.2, 0.65, 0], texturePath: '/sample-satellite/b02.png' },
  { key: 'b03', name: 'B03', color: '#10b981', basePos: [-1.2, 0.22, 0], texturePath: '/sample-satellite/b03.png' },
  { key: 'b04', name: 'B04', color: '#ef4444', basePos: [-1.2, -0.22, 0], texturePath: '/sample-satellite/b04.png' },
  { key: 'b08', name: 'B08', color: '#a855f7', basePos: [-1.2, -0.65, 0], texturePath: '/sample-satellite/b08.png' },
];

// Single band plane with progressive sharpening sweep
const SharpeningBandPlane: React.FC<{
  band: BandLayerConfig;
  index: number;
  cycleTime: number;
  convergeProgress: number;
}> = ({ band, index, cycleTime, convergeProgress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const sharpMeshRef = useRef<THREE.Mesh>(null);

  let texture: THREE.Texture | null = null;
  try {
    texture = useTexture(band.texturePath);
  } catch {
    texture = null;
  }

  // Progressive sharpening timing: B02 -> B03 -> B04 -> B08
  const sharpenStart = index * 0.8;
  const isSharpened = cycleTime >= sharpenStart + 0.6;
  const sharpenFactor = Math.max(0, Math.min(1, (cycleTime - sharpenStart) / 0.6));

  // Convergence position: moves toward the right central output node (X = 0.85, Y = 0)
  const targetX = 0.85;
  const targetY = 0;
  const currentX = THREE.MathUtils.lerp(band.basePos[0], targetX, convergeProgress);
  const currentY = THREE.MathUtils.lerp(band.basePos[1], targetY, convergeProgress);
  const currentZ = THREE.MathUtils.lerp(band.basePos[2], (index - 1.5) * 0.05, convergeProgress);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(currentX, currentY, currentZ);
    }
  });

  return (
    <group ref={groupRef} scale={convergeProgress > 0.7 ? 0.85 : 0.75} rotation={[-0.2, 0.35, 0]}>
      {/* 1. Underlying raster plane */}
      <mesh>
        <planeGeometry args={[0.95, 0.95]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? '#ffffff' : band.color}
          roughness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 2. Coarse wireframe (Initial 10m representation) */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[0.95, 0.95, 6, 6]} />
        <meshBasicMaterial
          color={band.color}
          wireframe
          transparent
          opacity={Math.max(0.1, 0.45 - sharpenFactor * 0.35)}
        />
      </mesh>

      {/* 3. Refined sub-4m fine wireframe (Emerges as band sharpens) */}
      <mesh ref={sharpMeshRef} position={[0, 0, 0.004]}>
        <planeGeometry args={[0.95, 0.95, 18, 18]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={sharpenFactor * 0.55}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Glowing edge border */}
      <mesh position={[0, 0, 0.006]}>
        <ringGeometry args={[0.46, 0.48, 4]} />
        <meshBasicMaterial
          color={isSharpened ? '#10b981' : band.color}
          transparent
          opacity={0.75}
        />
      </mesh>
    </group>
  );
};

// Converging Laser Guide Rays from the 4 bands to the central output
const ConvergingRays: React.FC<{ convergeProgress: number }> = ({ convergeProgress }) => {
  const linePositions = useMemo(() => {
    const lines: number[] = [];
    const targetX = 0.85;
    const targetY = 0;

    BANDS.forEach((b) => {
      lines.push(b.basePos[0], b.basePos[1], 0);
      lines.push(targetX, targetY, 0);
    });

    return new Float32Array(lines);
  }, []);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={linePositions.length / 3}
          array={linePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00e5ff"
        transparent
        opacity={0.25 + convergeProgress * 0.45}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
};

// Central Super-Resolved Output Composite Plane
const SuperResolvedOutputPlane: React.FC<{
  convergeProgress: number;
}> = ({ convergeProgress }) => {
  const meshRef = useRef<THREE.Group>(null);

  let srTexture: THREE.Texture | null = null;
  try {
    srTexture = useTexture('/sample-satellite/sr.png');
  } catch {
    srTexture = null;
  }

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 3.0) * 0.02;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const activeOpacity = Math.min(1.0, Math.max(0.1, (convergeProgress - 0.3) * 1.5));

  return (
    <group ref={meshRef} position={[0.85, 0, 0.05]} rotation={[-0.2, 0.35, 0]}>
      {/* Super-Resolved Output Image Plane */}
      <mesh>
        <planeGeometry args={[1.35, 1.35]} />
        <meshStandardMaterial
          map={srTexture}
          color={srTexture ? '#ffffff' : '#00e5ff'}
          roughness={0.2}
          transparent
          opacity={activeOpacity}
        />
      </mesh>

      {/* Refined Super-Resolution Fine Grid */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[1.36, 1.36, 24, 24]} />
        <meshBasicMaterial
          color="#00e5ff"
          wireframe
          transparent
          opacity={0.35 * activeOpacity}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Radiant Output Glow Frame */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.67, 0.70, 4]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.8 * activeOpacity}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export const OutputReconstructionScene: React.FC<OutputReconstructionSceneProps> = ({
  progress = 50,
  isStageActive = true,
}) => {
  const [cycleTime, setCycleTime] = React.useState(0);
  const containerRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // 5.5s looping reconstruction cycle
    setCycleTime((prev) => (prev + delta) % 5.5);

    if (containerRef.current) {
      containerRef.current.rotation.y = Math.sin(cycleTime * 0.5) * 0.05;
    }
  });

  // Converge progress (0.0 -> 1.0 from 3.2s to 4.5s)
  const convergeProgress = Math.max(0, Math.min(1.0, (cycleTime - 3.2) * 1.1));

  return (
    <group ref={containerRef} position={[0, 0, 0]} scale={1.1}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 3, 3]} intensity={1.6} />
      <pointLight position={[-2, 0, 2]} intensity={0.6} color="#00e5ff" />
      <pointLight position={[2, 0, 2]} intensity={0.8} color="#10b981" />

      {/* Converging Guide Rays */}
      <ConvergingRays convergeProgress={convergeProgress} />

      {/* 4 Sharpening Band Layers: B02, B03, B04, B08 */}
      {BANDS.map((band, idx) => (
        <SharpeningBandPlane
          key={band.key}
          band={band}
          index={idx}
          cycleTime={cycleTime}
          convergeProgress={convergeProgress}
        />
      ))}

      {/* Central Super-Resolved Output Composite */}
      <SuperResolvedOutputPlane convergeProgress={convergeProgress} />
    </group>
  );
};
