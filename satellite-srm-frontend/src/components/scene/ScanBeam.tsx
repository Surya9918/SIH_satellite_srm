import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ScanBeamProps {
  satellitePosition?: THREE.Vector3;
}

// ─────────────────────────────────────────────────────────────
// IMAGING SCAN CONE + FOOTPRINT
// Renders:
//  1. A narrow transparent cone from the optical sensor toward Earth.
//  2. A rectangular scan-footprint quad projected on the Earth surface.
//  3. Expanding concentric rings at the footprint center.
// ─────────────────────────────────────────────────────────────
export const ScanBeam: React.FC<ScanBeamProps> = ({ satellitePosition }) => {
  const coneRef = useRef<THREE.Mesh>(null);
  const coneGroupRef = useRef<THREE.Group>(null);

  const footprintRef = useRef<THREE.Mesh>(null);
  const footprintGroupRef = useRef<THREE.Group>(null);

  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  // Reusable objects
  const _up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const _groundNorm = useMemo(() => new THREE.Vector3(), []);
  const _quat = useMemo(() => new THREE.Quaternion(), []);

  useFrame(({ clock }) => {
    if (!satellitePosition) return;

    const time = clock.getElapsedTime();
    const satPos = satellitePosition;

    // Ground point directly under the satellite (nadir)
    const groundPoint = satPos.clone().normalize().multiplyScalar(1.001);
    const distance = satPos.distanceTo(groundPoint);

    // ── CONE (from satellite down to Earth) ─────────────────
    if (coneGroupRef.current && coneRef.current) {
      // Midpoint between satellite and ground
      const mid = satPos.clone().add(groundPoint).multiplyScalar(0.5);
      coneGroupRef.current.position.copy(mid);

      // Orient so cone tip points toward satellite (+Y of cylinder = satellite)
      _groundNorm.copy(satPos).normalize();
      _quat.setFromUnitVectors(_up, _groundNorm);
      coneGroupRef.current.quaternion.copy(_quat);

      // Scale height to span the gap
      coneRef.current.scale.y = distance;

      // Gentle opacity pulse
      const mat = coneRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(time * 1.2) * 0.03;
    }

    // ── FOOTPRINT QUAD (on Earth surface) ───────────────────
    if (footprintGroupRef.current) {
      footprintGroupRef.current.position.copy(groundPoint);

      // Orient the plane so it lies tangent to Earth's surface at groundPoint
      _groundNorm.copy(groundPoint).normalize();
      _quat.setFromUnitVectors(_up, _groundNorm);
      footprintGroupRef.current.quaternion.copy(_quat);

      // Subtle slow rotation to simulate swath scanning
      footprintGroupRef.current.rotateY(time * 0.04);
    }

    if (footprintRef.current) {
      // Pulsing footprint
      const mat = footprintRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(time * 0.8) * 0.15;
    }

    // ── CONCENTRIC RINGS ─────────────────────────────────────
    if (ring1Ref.current && ring2Ref.current) {
      const p1 = (time % 2.0) / 2.0;
      const p2 = ((time + 1.0) % 2.0) / 2.0;

      ring1Ref.current.scale.setScalar(1.0 + p1 * 3.5);
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - p1);

      ring2Ref.current.scale.setScalar(1.0 + p2 * 3.5);
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * (1 - p2);
    }
  });

  return (
    <group>
      {/* ── TORCH LIGHT (satellite → Earth) ───────────────────── */}
      <group ref={coneGroupRef}>
        {/* Volumetric light cone */}
        <mesh ref={coneRef}>
          {/* args: topRadius, bottomRadius, height, radialSegments, heightSegments, openEnded */}
          <cylinderGeometry args={[0.001, 0.15, 1.0, 64, 1, true]} />
          <meshBasicMaterial
            color="#ffd700"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ── FOOTPRINT (circular torch spotlight on Earth) ───── */}
      <group ref={footprintGroupRef}>
        {/* Circular footprint */}
        <mesh ref={footprintRef} position={[0, 0.001, 0]}>
          <circleGeometry args={[0.15, 64]} />
          <meshBasicMaterial
            color="#ffd700"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Concentric expanding rings at footprint center */}
        <mesh ref={ring1Ref}>
          <ringGeometry args={[0.03, 0.036, 32]} />
          <meshBasicMaterial
            color="#ffb700"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh ref={ring2Ref}>
          <ringGeometry args={[0.05, 0.056, 32]} />
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Center crosshair dot */}
        <mesh position={[0, 0.003, 0]}>
          <circleGeometry args={[0.012, 16]} />
          <meshBasicMaterial
            color="#ff8c00"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
