import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface UncertaintyAnalysisSceneProps {
  progress?: number;
  isStageActive?: boolean;
  isUncertaintyAvailable?: boolean;
  srTextureUrl?: string;
  uncertaintyTextureUrl?: string;
}

// Sweeping Analysis Scan and Confidence Overlay Plane
const RasterAnalysisPlane: React.FC<{
  sweepPhase: number;
  isUncertaintyAvailable: boolean;
  srTextureUrl?: string;
  uncertaintyTextureUrl?: string;
}> = ({ sweepPhase, isUncertaintyAvailable, srTextureUrl, uncertaintyTextureUrl }) => {
  const meshRef = useRef<THREE.Group>(null);
  const scanBarRef = useRef<THREE.Mesh>(null);

  // Load super-resolved raster texture
  let srMap: THREE.Texture | null = null;
  try {
    srMap = useTexture(srTextureUrl || '/sample-satellite/sr.png');
  } catch {
    srMap = null;
  }

  // Load real uncertainty map texture if available
  let uncMap: THREE.Texture | null = null;
  try {
    if (isUncertaintyAvailable) {
      uncMap = useTexture(uncertaintyTextureUrl || '/sample-satellite/uncertainty.png');
    }
  } catch {
    uncMap = null;
  }

  // Sweep X position across the raster from -1.15 to +1.15
  const sweepX = -1.15 + sweepPhase * 2.3;

  useFrame(() => {
    if (scanBarRef.current) {
      scanBarRef.current.position.x = sweepX;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]} rotation={[-0.28, 0.22, 0]}>
      {/* 1. Base Reconstructed Earth / Raster Plane */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.3, 2.3]} />
        <meshStandardMaterial
          map={srMap}
          color={srMap ? '#ffffff' : '#0f2b48'}
          roughness={0.35}
        />
      </mesh>

      {/* 2. Real Uncertainty Heatmap Overlay (Only displayed if real uncertainty is available) */}
      {isUncertaintyAvailable && uncMap && (
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[2.3, 2.3]} />
          <meshBasicMaterial
            map={uncMap}
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 3. Subtle Sub-4m Spatial Grid Overlay */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.3, 2.3, 22, 22]} />
        <meshBasicMaterial
          color={isUncertaintyAvailable ? '#a855f7' : '#00e5ff'}
          wireframe
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Sweeping Uncertainty Analysis Line */}
      <mesh ref={scanBarRef} position={[sweepX, 0, 0.02]}>
        <boxGeometry args={[0.035, 2.32, 0.01]} />
        <meshBasicMaterial
          color={isUncertaintyAvailable ? '#c084fc' : '#38bdf8'}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Analysis Scan Halo Glow */}
      <mesh position={[sweepX, 0, 0.015]}>
        <boxGeometry args={[0.16, 2.32, 0.005]} />
        <meshBasicMaterial
          color={isUncertaintyAvailable ? '#9333ea' : '#0284c7'}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 6. Subtle Edge Frame */}
      <mesh position={[0, 0, 0.018]}>
        <ringGeometry args={[1.14, 1.16, 4]} />
        <meshBasicMaterial
          color={isUncertaintyAvailable ? '#a855f7' : '#64748b'}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

// Variance Highlighting Particles / Probing Nodes
const VarianceProbingField: React.FC<{ sweepPhase: number; isUncertaintyAvailable: boolean }> = ({
  sweepPhase,
  isUncertaintyAvailable,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const count = 35;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.0;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      pos[i * 3 + 2] = 0.05 + Math.random() * 0.15;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.getElapsedTime();
      const geom = pointsRef.current.geometry;
      const posAttr = geom.attributes.position;
      for (let i = 0; i < count; i++) {
        const pz = 0.05 + Math.sin(time * 2.5 + i) * 0.04;
        posAttr.setZ(i, pz);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]} rotation={[-0.28, 0.22, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color={isUncertaintyAvailable ? '#e879f9' : '#38bdf8'}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export const UncertaintyAnalysisScene: React.FC<UncertaintyAnalysisSceneProps> = ({
  progress = 50,
  isStageActive = true,
  isUncertaintyAvailable = true,
  srTextureUrl,
  uncertaintyTextureUrl,
}) => {
  const [sweepPhase, setSweepPhase] = React.useState(0);
  const containerRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // 3.8s looping analysis sweep
    setSweepPhase((prev) => (prev + delta * 0.26) % 1.0);

    if (containerRef.current) {
      containerRef.current.position.y = Math.sin(sweepPhase * Math.PI * 2) * 0.02;
    }
  });

  return (
    <group ref={containerRef} scale={1.05}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 3]} intensity={1.6} />
      <pointLight
        position={[-2, -2, 2]}
        intensity={0.7}
        color={isUncertaintyAvailable ? '#a855f7' : '#00e5ff'}
      />
      <pointLight position={[2, 2, 2]} intensity={0.5} color="#3b82f6" />

      {/* Raster Plane with Scanning Overlay & Heatmap */}
      <RasterAnalysisPlane
        sweepPhase={sweepPhase}
        isUncertaintyAvailable={isUncertaintyAvailable}
        srTextureUrl={srTextureUrl}
        uncertaintyTextureUrl={uncertaintyTextureUrl}
      />

      {/* Variance Probing Field (Sampling Nodes) */}
      <VarianceProbingField
        sweepPhase={sweepPhase}
        isUncertaintyAvailable={isUncertaintyAvailable}
      />
    </group>
  );
};
