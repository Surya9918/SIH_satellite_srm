import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteOrbitProps {
  orbitRadius?: number;
  eccentricity?: number;
  inclinationDeg?: number;
  rotationYDeg?: number;
  color?: string;
  opacity?: number;
}

export const SatelliteOrbit: React.FC<SatelliteOrbitProps> = ({
  orbitRadius = 1.72,
  eccentricity = 0.88,
  inclinationDeg = 45,
  rotationYDeg = 25,
  color = '#00d4ff',
  opacity = 0.22,
}) => {
  const a = orbitRadius;
  const b = orbitRadius * eccentricity;

  // Orbit plane orientation
  const orbitEuler = useMemo(() => {
    const incRad = (inclinationDeg * Math.PI) / 180;
    const rotYRad = (rotationYDeg * Math.PI) / 180;
    return new THREE.Euler(incRad, rotYRad, 0, 'YXZ');
  }, [inclinationDeg, rotationYDeg]);

  // Generate smooth elliptical curve points
  const { geometry, pointsGeometry } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const nodePts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = a * Math.cos(theta);
      const z = b * Math.sin(theta);
      const pt = new THREE.Vector3(x, 0, z).applyEuler(orbitEuler);
      pts.push(pt);
      
      // Add a node point every 16 segments
      if (i % 16 === 0) {
        nodePts.push(pt);
      }
    }
    
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const nodesGeom = new THREE.BufferGeometry().setFromPoints(nodePts);
    
    // Compute line distances for dashed material
    let currentDist = 0;
    const distArray = [0];
    for (let i = 1; i < pts.length; i++) {
      currentDist += pts[i].distanceTo(pts[i - 1]);
      distArray.push(currentDist);
    }
    geom.setAttribute('lineDistance', new THREE.Float32BufferAttribute(distArray, 1));
    
    return { geometry: geom, pointsGeometry: nodesGeom };
  }, [a, b, orbitEuler]);

  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      // Telemetry pulse moves slightly faster than the satellite
      const t = clock.getElapsedTime() * 0.45; 
      const px = a * Math.cos(t);
      const pz = b * Math.sin(t);
      
      const pos = new THREE.Vector3(px, 0, pz).applyEuler(orbitEuler);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* Primary subtle dashed orbit line */}
      {/* @ts-ignore */}
      <line geometry={geometry}>
        <lineDashedMaterial
          color="#38bdf8"
          transparent
          opacity={0.3}
          dashSize={0.04}
          gapSize={0.02}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      {/* @ts-ignore */}
      </line>

      {/* Orbital Nodes (Subtle glowing points along the path) */}
      {/* @ts-ignore */}
      <points geometry={pointsGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={0.015}
          transparent
          opacity={0.6}
          blending={THREE.NormalBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      {/* @ts-ignore */}
      </points>

      {/* Moving Telemetry Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial
          color="#67E8F9"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
