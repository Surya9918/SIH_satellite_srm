import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Realistic distances are too huge, so we scale them for visual appeal.
// Earth distance is 40 units.
const ORBIT_DATA = {
  earthDistance: 40,
  earthSpeed: 0.02, // Base speed of Earth's orbit around the sun
  mercury: { distance: 15, speed: 0.08, radius: 0.3, color: '#e5e7eb' }, // gray/white
  venus: { distance: 26, speed: 0.05, radius: 0.8, color: '#d97706' }, // orange/gold
  mars: { distance: 55, speed: 0.015, radius: 0.5, color: '#ea580c' }, // rusty orange
  jupiter: { distance: 100, speed: 0.005, radius: 4.5, color: '#d4a373' }, // banded tan/brown
  saturn: { distance: 140, speed: 0.002, radius: 3.8, color: '#fef08a' }, // pale gold
  uranus: { distance: 180, speed: 0.001, radius: 2.8, color: '#67e8f9' }, // pale cyan
  neptune: { distance: 220, speed: 0.0005, radius: 2.7, color: '#3b82f6' }, // deep blue
};

export const DeepSpaceElements: React.FC = () => {
  const solarSystemRef = useRef<THREE.Group>(null);
  
  // Refs for planets to rotate them on their own axis
  const sunRef = useRef<THREE.Mesh>(null);
  const flame1Ref = useRef<THREE.Mesh>(null);
  const flame2Ref = useRef<THREE.Mesh>(null);
  
  const mercuryRef = useRef<THREE.Mesh>(null);
  const venusRef = useRef<THREE.Mesh>(null);
  const marsRef = useRef<THREE.Mesh>(null);
  const jupiterRef = useRef<THREE.Mesh>(null);
  const saturnRef = useRef<THREE.Mesh>(null);
  const uranusRef = useRef<THREE.Mesh>(null);
  const neptuneRef = useRef<THREE.Mesh>(null);

  // Asteroid belt (Between Mars at 55 and Jupiter at 100)
  const asteroidCount = 800;
  const asteroidsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const asteroidData = useMemo(() => {
    const data = [];
    for (let i = 0; i < asteroidCount; i++) {
      // Asteroid belt radius 65 to 85
      const radius = 65 + Math.random() * 20;
      const angle = Math.random() * Math.PI * 2;
      // Slight vertical variation
      const y = (Math.random() - 0.5) * 4;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      data.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        // Realistic irregular shapes can be simulated by scaling differently on axes
        scale: new THREE.Vector3(
          0.1 + Math.random() * 0.3,
          0.1 + Math.random() * 0.3,
          0.1 + Math.random() * 0.3
        ),
        orbitSpeed: 0.01 + Math.random() * 0.005, // Speed orbiting the sun
        rotSpeed: new THREE.Euler(
          Math.random() * 0.05,
          Math.random() * 0.05,
          Math.random() * 0.05
        )
      });
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // 1. Calculate Earth's position in the solar system
    // We want the sun to be roughly in the +X, +Z, +Y direction initially to match lighting
    const earthAngle = time * ORBIT_DATA.earthSpeed + (Math.PI / 4); 
    const earthX = Math.cos(earthAngle) * ORBIT_DATA.earthDistance;
    const earthZ = Math.sin(earthAngle) * ORBIT_DATA.earthDistance;

    // Shift the entire solar system so that Earth is exactly at (0,0,0)
    if (solarSystemRef.current) {
      solarSystemRef.current.position.set(-earthX, 0, -earthZ);
    }

    // 2. Update planet positions in their orbits (relative to the Sun at 0,0,0)
    if (mercuryRef.current) {
      mercuryRef.current.position.x = Math.cos(time * ORBIT_DATA.mercury.speed) * ORBIT_DATA.mercury.distance;
      mercuryRef.current.position.z = Math.sin(time * ORBIT_DATA.mercury.speed) * ORBIT_DATA.mercury.distance;
      mercuryRef.current.rotation.y += 0.01;
    }
    if (venusRef.current) {
      venusRef.current.position.x = Math.cos(time * ORBIT_DATA.venus.speed) * ORBIT_DATA.venus.distance;
      venusRef.current.position.z = Math.sin(time * ORBIT_DATA.venus.speed) * ORBIT_DATA.venus.distance;
      venusRef.current.rotation.y -= 0.005; // Venus rotates backwards
    }
    if (marsRef.current) {
      marsRef.current.position.x = Math.cos(time * ORBIT_DATA.mars.speed + 1) * ORBIT_DATA.mars.distance;
      marsRef.current.position.z = Math.sin(time * ORBIT_DATA.mars.speed + 1) * ORBIT_DATA.mars.distance;
      marsRef.current.rotation.y += 0.01;
    }
    if (jupiterRef.current) {
      jupiterRef.current.position.x = Math.cos(time * ORBIT_DATA.jupiter.speed + 2) * ORBIT_DATA.jupiter.distance;
      jupiterRef.current.position.z = Math.sin(time * ORBIT_DATA.jupiter.speed + 2) * ORBIT_DATA.jupiter.distance;
      jupiterRef.current.rotation.y += 0.02; // Fast rotation
    }
    if (saturnRef.current) {
      saturnRef.current.position.x = Math.cos(time * ORBIT_DATA.saturn.speed + 3) * ORBIT_DATA.saturn.distance;
      saturnRef.current.position.z = Math.sin(time * ORBIT_DATA.saturn.speed + 3) * ORBIT_DATA.saturn.distance;
      saturnRef.current.rotation.y += 0.018;
    }
    if (uranusRef.current) {
      uranusRef.current.position.x = Math.cos(time * ORBIT_DATA.uranus.speed + 4) * ORBIT_DATA.uranus.distance;
      uranusRef.current.position.z = Math.sin(time * ORBIT_DATA.uranus.speed + 4) * ORBIT_DATA.uranus.distance;
      uranusRef.current.rotation.y += 0.015;
    }
    if (neptuneRef.current) {
      neptuneRef.current.position.x = Math.cos(time * ORBIT_DATA.neptune.speed + 5) * ORBIT_DATA.neptune.distance;
      neptuneRef.current.position.z = Math.sin(time * ORBIT_DATA.neptune.speed + 5) * ORBIT_DATA.neptune.distance;
      neptuneRef.current.rotation.y += 0.01;
    }

    // Flame Effect on Sun
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.002;
    }
    if (flame1Ref.current) {
      flame1Ref.current.rotation.x += 0.01;
      flame1Ref.current.rotation.y += 0.015;
      flame1Ref.current.rotation.z += 0.005;
    }
    if (flame2Ref.current) {
      flame2Ref.current.rotation.x -= 0.008;
      flame2Ref.current.rotation.y -= 0.012;
      flame2Ref.current.rotation.z -= 0.009;
    }

    // 3. Update Asteroids
    if (asteroidsRef.current) {
      asteroidData.forEach((data, i) => {
        // Orbit around the Sun
        data.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), data.orbitSpeed * 0.05);
        
        // Local rotation (tumbling)
        data.rotation.x += data.rotSpeed.x;
        data.rotation.y += data.rotSpeed.y;
        data.rotation.z += data.rotSpeed.z;

        dummy.position.copy(data.position);
        dummy.rotation.copy(data.rotation);
        dummy.scale.copy(data.scale);
        dummy.updateMatrix();
        asteroidsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      asteroidsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={solarSystemRef}>
      {/* ── THE DETAILED ORANGE SUN ── */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <pointLight color="#ffedd5" intensity={6} distance={800} decay={1.5} />
        
        {/* Deep Orange Solid Core */}
        <mesh>
          <sphereGeometry args={[4.5, 64, 64]} />
          <meshBasicMaterial color="#c2410c" />
        </mesh>
        
        {/* Surface Texture Simulation (Wireframe) */}
        <mesh>
          <sphereGeometry args={[4.52, 128, 128]} />
          <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Tight Bright Orange Edge/Corona */}
        <mesh>
          <sphereGeometry args={[4.65, 64, 64]} />
          <meshBasicMaterial color="#ea580c" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* Subtle Outer Red Halo */}
        <mesh>
          <sphereGeometry args={[5.2, 64, 64]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </mesh>

      {/* ── MERCURY ── */}
      <mesh ref={mercuryRef}>
        <sphereGeometry args={[ORBIT_DATA.mercury.radius, 32, 32]} />
        <meshStandardMaterial color={ORBIT_DATA.mercury.color} roughness={0.9} />
      </mesh>

      {/* ── VENUS ── */}
      <mesh ref={venusRef}>
        <sphereGeometry args={[ORBIT_DATA.venus.radius, 32, 32]} />
        <meshStandardMaterial color={ORBIT_DATA.venus.color} roughness={0.6} />
      </mesh>

      {/* ── EARTH IS AT (earthX, 0, earthZ) BUT RENDERED BY RealisticEarth COMPONENT ── */}

      {/* ── MARS ── */}
      <mesh ref={marsRef}>
        <sphereGeometry args={[ORBIT_DATA.mars.radius, 32, 32]} />
        <meshStandardMaterial color={ORBIT_DATA.mars.color} roughness={0.8} />
      </mesh>

      {/* ── ASTEROID BELT ── */}
      <instancedMesh ref={asteroidsRef} args={[undefined, undefined, asteroidCount]}>
        <dodecahedronGeometry args={[1, 0]} /> {/* 0 detail for low-poly rocky look */}
        <meshStandardMaterial color="#78716c" roughness={0.9} metalness={0.2} />
      </instancedMesh>

      {/* ── JUPITER ── */}
      <mesh ref={jupiterRef}>
        <sphereGeometry args={[ORBIT_DATA.jupiter.radius, 64, 64]} />
        <meshStandardMaterial color={ORBIT_DATA.jupiter.color} roughness={0.5} />
      </mesh>

      {/* ── SATURN ── */}
      <mesh ref={saturnRef}>
        <sphereGeometry args={[ORBIT_DATA.saturn.radius, 64, 64]} />
        <meshStandardMaterial color={ORBIT_DATA.saturn.color} roughness={0.5} />
        {/* Saturn's Rings */}
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[ORBIT_DATA.saturn.radius + 1.5, ORBIT_DATA.saturn.radius + 4, 64]} />
          <meshStandardMaterial color="#d4a373" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[ORBIT_DATA.saturn.radius + 4.5, ORBIT_DATA.saturn.radius + 6, 64]} />
          <meshStandardMaterial color="#e5e7eb" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </mesh>
      
      {/* ── URANUS ── */}
      <mesh ref={uranusRef}>
        <sphereGeometry args={[ORBIT_DATA.uranus.radius, 64, 64]} />
        <meshStandardMaterial color={ORBIT_DATA.uranus.color} roughness={0.4} />
      </mesh>
      
      {/* ── NEPTUNE ── */}
      <mesh ref={neptuneRef}>
        <sphereGeometry args={[ORBIT_DATA.neptune.radius, 64, 64]} />
        <meshStandardMaterial color={ORBIT_DATA.neptune.color} roughness={0.3} />
      </mesh>
    </group>
  );
};
