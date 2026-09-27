import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
  speed?: number;
}

export const StarField: React.FC<StarFieldProps> = ({
  count = 2400,
  speed = 0.6,
}) => {
  const starsGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (starsGroupRef.current) {
      // Subtle, slow space rotation to give life without distraction
      starsGroupRef.current.rotation.y += delta * 0.005;
      starsGroupRef.current.rotation.x = Math.sin(Date.now() * 0.00005) * 0.02;
    }
  });

  return (
    <group ref={starsGroupRef}>
      <Stars
        radius={130}
        depth={60}
        count={count}
        factor={4.2}
        saturation={0}
        fade
        speed={speed}
      />
    </group>
  );
};
