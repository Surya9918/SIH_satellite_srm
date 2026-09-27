import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpectralStreamParticlesProps {
  loadedBands: {
    b02: boolean;
    b03: boolean;
    b04: boolean;
    b08: boolean;
  };
  satellitePosition?: THREE.Vector3;
}

interface StreamBandDef {
  key: 'b02' | 'b03' | 'b04' | 'b08';
  color: THREE.Color;
  sourceOffset: THREE.Vector3;
  particleCount: number;
}

const BAND_STREAMS: StreamBandDef[] = [
  {
    key: 'b02',
    color: new THREE.Color('#00e5ff'), // Blue/Cyan
    sourceOffset: new THREE.Vector3(-1.4, 0.6, 0.4),
    particleCount: 45,
  },
  {
    key: 'b03',
    color: new THREE.Color('#10b981'), // Green
    sourceOffset: new THREE.Vector3(-1.1, 0.9, -0.3),
    particleCount: 45,
  },
  {
    key: 'b04',
    color: new THREE.Color('#ef4444'), // Red
    sourceOffset: new THREE.Vector3(1.1, 0.9, -0.3),
    particleCount: 45,
  },
  {
    key: 'b08',
    color: new THREE.Color('#a855f7'), // NIR / Purple
    sourceOffset: new THREE.Vector3(1.4, 0.6, 0.4),
    particleCount: 45,
  },
];

// Single band particle stream component
const SingleBandStream: React.FC<{
  stream: StreamBandDef;
  targetPos: THREE.Vector3;
  active: boolean;
}> = ({ stream, targetPos, active }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize progress and randomized trajectory offsets
  const { positions, progressArray, lateralOffsets } = useMemo(() => {
    const pos = new Float32Array(stream.particleCount * 3);
    const prog = new Float32Array(stream.particleCount);
    const offsets = new Float32Array(stream.particleCount * 3);

    for (let i = 0; i < stream.particleCount; i++) {
      prog[i] = Math.random(); // staggered progression along path
      // random lateral offset for natural particle ribbon width
      offsets[i * 3] = (Math.random() - 0.5) * 0.08;
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    return { positions: pos, progressArray: prog, lateralOffsets: offsets };
  }, [stream.particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const speed = 0.55; // stream velocity

    for (let i = 0; i < stream.particleCount; i++) {
      // Advance progress
      progressArray[i] = (progressArray[i] + delta * speed) % 1.0;
      const t = progressArray[i];

      // Quadratic curve from source offset to satellite target
      const p0 = stream.sourceOffset;
      const p1 = new THREE.Vector3(
        (stream.sourceOffset.x + targetPos.x) * 0.5,
        Math.max(stream.sourceOffset.y, targetPos.y) + 0.35,
        (stream.sourceOffset.z + targetPos.z) * 0.5
      );
      const p2 = targetPos;

      // Bezier interpolation: B(t) = (1-t)^2 * p0 + 2(1-t)t * p1 + t^2 * p2
      const invT = 1 - t;
      const bx = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
      const by = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;
      const bz = invT * invT * p0.z + 2 * invT * t * p1.z + t * t * p2.z;

      // Fade in at source, compress at destination
      const spread = Math.sin(t * Math.PI);
      posAttr.setXYZ(
        i,
        bx + lateralOffsets[i * 3] * spread,
        by + lateralOffsets[i * 3 + 1] * spread,
        bz + lateralOffsets[i * 3 + 2] * spread
      );
    }

    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={stream.particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={stream.color}
        size={0.038}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export const SpectralStreamParticles: React.FC<SpectralStreamParticlesProps> = ({
  loadedBands,
  satellitePosition = new THREE.Vector3(0, 0.45, 1.2),
}) => {
  const allLoaded =
    loadedBands.b02 && loadedBands.b03 && loadedBands.b04 && loadedBands.b08;

  const convergenceRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (convergenceRingRef.current && allLoaded) {
      const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 4.0) * 0.15;
      convergenceRingRef.current.scale.set(pulse, pulse, pulse);
      const mat = convergenceRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.5 + Math.sin(clock.getElapsedTime() * 3.0) * 0.25;
      }
    }
  });

  return (
    <group>
      {/* 4 Spectral Band Streams */}
      {BAND_STREAMS.map((stream) => (
        <SingleBandStream
          key={stream.key}
          stream={stream}
          targetPos={satellitePosition}
          active={Boolean(loadedBands[stream.key])}
        />
      ))}

      {/* Convergence Halo around Satellite Sensor when all 4 bands are loaded */}
      {allLoaded && (
        <mesh ref={convergenceRingRef} position={satellitePosition}>
          <ringGeometry args={[0.07, 0.09, 32]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};
