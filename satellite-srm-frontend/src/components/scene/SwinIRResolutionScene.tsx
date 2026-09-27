import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface SwinIRResolutionSceneProps {
  progress?: number;
  scaleFactor?: number;
  isStageActive?: boolean;
}

// Low-Res to High-Res Split Sweep Plane
const ResolutionMorphPlane: React.FC<{
  sweepPhase: number;
  scaleFactor: number;
}> = ({ sweepPhase, scaleFactor }) => {
  const meshRef = useRef<THREE.Group>(null);
  const sweepBarRef = useRef<THREE.Mesh>(null);

  // Load sample previews for visual demonstration
  let lrMap: THREE.Texture | null = null;
  let srMap: THREE.Texture | null = null;
  try {
    lrMap = useTexture('/sample-satellite/lr.png');
    srMap = useTexture('/sample-satellite/sr.png');
  } catch {
    lrMap = null;
    srMap = null;
  }

  // Sweep X position from -1.1 to +1.1
  const sweepX = -1.1 + sweepPhase * 2.2;

  useFrame(() => {
    if (sweepBarRef.current) {
      sweepBarRef.current.position.x = sweepX;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]} rotation={[-0.35, 0.25, 0]}>
      {/* 1. Underlying Low-Res Texture Plane (10m representation) */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial
          map={lrMap}
          color={lrMap ? '#ffffff' : '#1e3a8a'}
          roughness={0.5}
        />
      </mesh>

      {/* 2. Coarse Grid Overlay (10m GSD: 8x8 coarse cells) */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[2.2, 2.2, 8, 8]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. High-Res Refined Zone (Emerges behind the sweep line) */}
      <mesh
        position={[(-1.1 + sweepX) * 0.5, 0, 0.01]}
        scale={[Math.max(0.001, (sweepX + 1.1) / 2.2), 1, 1]}
      >
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial
          map={srMap || lrMap}
          color={srMap ? '#ffffff' : '#38bdf8'}
          roughness={0.25}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 4. Fine Grid Overlay (3.3m GSD: 24x24 fine cells, 3x density) */}
      <mesh
        position={[(-1.1 + sweepX) * 0.5, 0, 0.015]}
        scale={[Math.max(0.001, (sweepX + 1.1) / 2.2), 1, 1]}
      >
        <planeGeometry args={[2.2, 2.2, 24, 24]} />
        <meshBasicMaterial
          color="#00e5ff"
          wireframe
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Glowing Vertical Reconstruction Sweep Line */}
      <mesh ref={sweepBarRef} position={[sweepX, 0, 0.025]}>
        <boxGeometry args={[0.04, 2.24, 0.01]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sweep Line Cyan Halo Glow */}
      <mesh position={[sweepX, 0, 0.02]}>
        <boxGeometry args={[0.12, 2.24, 0.005]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

// Neural-Network Shifted Window Transformer Attention Lines
const SwinTransformerLattice: React.FC<{ sweepPhase: number }> = ({ sweepPhase }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate lattice grid nodes representing transformer token patches
  const { positions, linePositions } = useMemo(() => {
    const pos: number[] = [];
    const lines: number[] = [];
    const gridSize = 6;
    const spacing = 0.36;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const px = (x - (gridSize - 1) / 2) * spacing;
        const py = (y - (gridSize - 1) / 2) * spacing;
        const pz = 0.15 + Math.sin(x + y) * 0.05;
        pos.push(px, py, pz);

        // Attention connection to right neighbor
        if (x < gridSize - 1) {
          lines.push(px, py, pz);
          lines.push(px + spacing, py, 0.15 + Math.sin(x + 1 + y) * 0.05);
        }
        // Attention connection to top neighbor
        if (y < gridSize - 1) {
          lines.push(px, py, pz);
          lines.push(px, py + spacing, 0.15 + Math.sin(x + y + 1) * 0.05);
        }
      }
    }

    return {
      positions: new Float32Array(pos),
      linePositions: new Float32Array(lines),
    };
  }, []);

  return (
    <group position={[0, 0, 0.08]} rotation={[-0.35, 0.25, 0]}>
      {/* Shifted Window Attention Lines */}
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
          color="#8b5cf6"
          transparent
          opacity={0.25 + Math.sin(sweepPhase * Math.PI * 2) * 0.15}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Neural Token Node Points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#a855f7"
          size={0.045}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export const SwinIRResolutionScene: React.FC<SwinIRResolutionSceneProps> = ({
  progress = 50,
  scaleFactor = 3,
  isStageActive = true,
}) => {
  const [sweepPhase, setSweepPhase] = React.useState(0);
  const containerRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Continuous 4.5s reconstruction sweep cycle
    setSweepPhase((prev) => (prev + delta * 0.22) % 1.0);

    if (containerRef.current) {
      containerRef.current.position.y = Math.sin(sweepPhase * Math.PI * 2) * 0.02;
    }
  });

  return (
    <group ref={containerRef} scale={1.05}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 3]} intensity={1.6} />
      <pointLight position={[-2, -2, 2]} intensity={0.7} color="#00e5ff" />
      <pointLight position={[2, 2, 2]} intensity={0.5} color="#8b5cf6" />

      {/* Resolution Morphing Plane & Sweep */}
      <ResolutionMorphPlane
        sweepPhase={sweepPhase}
        scaleFactor={scaleFactor}
      />

      {/* Swin Transformer Shifted Window Attention Lattice */}
      <SwinTransformerLattice sweepPhase={sweepPhase} />
    </group>
  );
};
