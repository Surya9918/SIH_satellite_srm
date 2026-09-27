import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ScanningGridProps {
  color?: string;
  isScanning?: boolean;
  isValidated?: boolean;
  isFailed?: boolean;
}

export const ScanningGrid: React.FC<ScanningGridProps> = ({
  color = '#00e5ff',
  isScanning = true,
  isValidated = false,
  isFailed = false,
}) => {
  const sweepRef = useRef<THREE.Mesh>(null);
  const reticleRef = useRef<THREE.Group>(null);
  const gridMeshRef = useRef<THREE.Mesh>(null);

  const activeColor = isFailed ? '#ef4444' : isValidated ? '#10b981' : color;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Radar sweep rotation
    if (sweepRef.current && isScanning) {
      sweepRef.current.rotation.z = -t * 2.2;
    }

    // 2. Pulsing reticle
    if (reticleRef.current) {
      const scale = 1.0 + Math.sin(t * 3.5) * 0.05;
      reticleRef.current.scale.set(scale, scale, 1);
    }

    // 3. Grid scanline translation
    if (gridMeshRef.current && isScanning) {
      const mat = gridMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.25 + Math.sin(t * 4.0) * 0.15;
      }
    }
  });

  return (
    <group position={[0, 0, 1.02]} rotation={[-0.2, 0.3, 0]}>
      {/* Planar Coordinate Grid Overlay */}
      <mesh ref={gridMeshRef}>
        <planeGeometry args={[1.6, 1.6, 16, 16]} />
        <meshBasicMaterial
          color={activeColor}
          wireframe
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Coordinate Target Frame */}
      <group ref={reticleRef}>
        {/* Outer Circular Reticle */}
        <mesh>
          <ringGeometry args={[0.75, 0.77, 64]} />
          <meshBasicMaterial
            color={activeColor}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Inner Precision Target Ring */}
        <mesh>
          <ringGeometry args={[0.38, 0.395, 48]} />
          <meshBasicMaterial
            color={activeColor}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Crosshair Cardinal Coordinate Ticks */}
        {[-0.8, 0.8].map((offset, i) => (
          <React.Fragment key={i}>
            <mesh position={[offset, 0, 0]}>
              <boxGeometry args={[0.08, 0.006, 0.001]} />
              <meshBasicMaterial color={activeColor} />
            </mesh>
            <mesh position={[0, offset, 0]}>
              <boxGeometry args={[0.006, 0.08, 0.001]} />
              <meshBasicMaterial color={activeColor} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Radial Radar Sweep Beam */}
      {isScanning && !isValidated && !isFailed && (
        <mesh ref={sweepRef}>
          <circleGeometry args={[0.76, 32, 0, Math.PI / 3]} />
          <meshBasicMaterial
            color={activeColor}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Validated Lock-in Flash */}
      {isValidated && (
        <mesh>
          <ringGeometry args={[0.01, 0.82, 48]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};
