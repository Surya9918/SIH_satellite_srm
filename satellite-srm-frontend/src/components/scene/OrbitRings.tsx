import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const OrbitRings: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);

  // Subtle floating telemetry coordinate points
  const particleGeo = useMemo(() => {
    const count = 36;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 1.35 + (i % 4) * 0.09;

      positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.04;
      particlesRef.current.rotation.x = Math.sin(t * 0.02) * 0.08;
    }
  });

  return (
    <group>
      {/* Subtle secondary equatorial reference ring */}
      <group rotation={[0.2, 0.1, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.52, 0.0018, 16, 100]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Multispectral Telemetry Particles */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          size={0.016}
          color="#00e5ff"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
