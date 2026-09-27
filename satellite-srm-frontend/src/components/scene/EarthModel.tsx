import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Atmosphere } from './Atmosphere';
import { OrbitRings } from './OrbitRings';

// ── PROCEDURAL TEXTURE GENERATOR ──
// Generates high-detail satellite-grade Earth maps safely with fallback
function createProceduralEarthTextures() {
  try {
    const width = 1024;
    const height = 512;

    // 1. Day Map (Satellite color)
    const dayCanvas = document.createElement('canvas');
    dayCanvas.width = width;
    dayCanvas.height = height;
    const dayCtx = dayCanvas.getContext('2d');

    // 2. Specular Map (Oceans reflective, continents matte)
    const specCanvas = document.createElement('canvas');
    specCanvas.width = width;
    specCanvas.height = height;
    const specCtx = specCanvas.getContext('2d');

    // 3. Cloud Map
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = width;
    cloudCanvas.height = height;
    const cloudCtx = cloudCanvas.getContext('2d');

    if (dayCtx && specCtx && cloudCtx) {
      // ── BASE OCEANS ──
      const oceanGrad = dayCtx.createLinearGradient(0, 0, 0, height);
      oceanGrad.addColorStop(0, '#040b18');   // Arctic deep navy
      oceanGrad.addColorStop(0.5, '#05122b'); // Equatorial deep blue
      oceanGrad.addColorStop(1, '#030814');   // Antarctic navy
      dayCtx.fillStyle = oceanGrad;
      dayCtx.fillRect(0, 0, width, height);

      // Specular ocean: bright
      specCtx.fillStyle = '#6090c0';
      specCtx.fillRect(0, 0, width, height);

      // Cloud background: transparent
      cloudCtx.clearRect(0, 0, width, height);

      // ── PROCEDURAL LANDMASSES WITH SATELLITE TONES ──
      const drawContinent = (
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        color: string,
        details: number = 8
      ) => {
        dayCtx.save();
        specCtx.save();

        dayCtx.beginPath();
        specCtx.beginPath();

        for (let i = 0; i <= details; i++) {
          const angle = (i / details) * Math.PI * 2;
          const noise =
            Math.sin(angle * 3 + cx) * 0.25 +
            Math.cos(angle * 5 + cy) * 0.15 +
            Math.sin(angle * 7) * 0.1;
          const radX = rx * (1 + noise);
          const radY = ry * (1 + noise);

          const x = cx + Math.cos(angle) * radX;
          const y = cy + Math.sin(angle) * radY;

          if (i === 0) {
            dayCtx.moveTo(x, y);
            specCtx.moveTo(x, y);
          } else {
            dayCtx.lineTo(x, y);
            specCtx.lineTo(x, y);
          }
        }

        dayCtx.closePath();
        specCtx.closePath();

        dayCtx.fillStyle = color;
        dayCtx.shadowColor = '#005577';
        dayCtx.shadowBlur = 10;
        dayCtx.fill();

        specCtx.fillStyle = '#060a12';
        specCtx.fill();

        dayCtx.restore();
        specCtx.restore();
      };

      // Continental masses
      drawContinent(width * 0.58, height * 0.32, width * 0.16, height * 0.16, '#0f2420', 12);
      drawContinent(width * 0.53, height * 0.54, width * 0.11, height * 0.19, '#18241e', 10);
      drawContinent(width * 0.72, height * 0.38, width * 0.15, height * 0.14, '#132822', 10);
      // Indian Subcontinent (Prominent for SIH)
      drawContinent(width * 0.68, height * 0.48, width * 0.05, height * 0.09, '#183628', 10);
      // Americas
      drawContinent(width * 0.22, height * 0.34, width * 0.13, height * 0.17, '#122625', 12);
      drawContinent(width * 0.29, height * 0.65, width * 0.09, height * 0.18, '#102d20', 10);
      // Australia
      drawContinent(width * 0.82, height * 0.72, width * 0.08, height * 0.11, '#23221b', 8);

      // Night City Clusters
      dayCtx.save();
      for (let c = 0; c < 90; c++) {
        const lx = (width * 0.15 + (c * 79) % (width * 0.75)) % width;
        const ly = (height * 0.25 + (c * 43) % (height * 0.5)) % height;
        dayCtx.beginPath();
        dayCtx.arc(lx, ly, (c % 2 === 0 ? 1.5 : 1.0), 0, Math.PI * 2);
        dayCtx.fillStyle = c % 3 === 0 ? '#00e5ff' : '#f59e0b';
        dayCtx.shadowColor = '#00d4ff';
        dayCtx.shadowBlur = 6;
        dayCtx.fill();
      }
      dayCtx.restore();

      // Cloud Trade Winds
      cloudCtx.save();
      cloudCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      cloudCtx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      cloudCtx.shadowBlur = 15;

      for (let i = 0; i < 35; i++) {
        const cx = (i * 123) % width;
        const cy = height * 0.2 + (Math.sin(i) * 0.5 + 0.5) * (height * 0.6);
        const rx = 50 + (i % 7) * 20;
        const ry = 14 + (i % 5) * 6;

        cloudCtx.beginPath();
        cloudCtx.ellipse(cx, cy, rx, ry, (i * 0.2) % Math.PI, 0, Math.PI * 2);
        cloudCtx.fill();
      }
      cloudCtx.restore();

      const dayTexture = new THREE.CanvasTexture(dayCanvas);
      dayTexture.colorSpace = THREE.SRGBColorSpace;
      const specTexture = new THREE.CanvasTexture(specCanvas);
      const cloudTexture = new THREE.CanvasTexture(cloudCanvas);

      return { dayTexture, specTexture, cloudTexture };
    }
  } catch (err) {
    console.warn('[TerraSR] Canvas texture generation fallback:', err);
  }

  // Safe fallback solid textures if 2D canvas is unavailable
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = 16;
  fallbackCanvas.height = 16;
  const ctx = fallbackCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#06152b';
    ctx.fillRect(0, 0, 16, 16);
  }
  const fallbackTex = new THREE.CanvasTexture(fallbackCanvas);
  return { dayTexture: fallbackTex, specTexture: fallbackTex, cloudTexture: fallbackTex };
}

// ── BLENDER GLB COMPONENT (HOT-SWAP) ──
const BlenderEarthModel: React.FC<{ url: string }> = ({ url }) => {
  const gltf = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} scale={1.0} />
      <Atmosphere radius={1.12} color="#00d4ff" intensity={1.2} />
      <OrbitRings />
    </group>
  );
};

// ── PROCEDURAL THREE.JS EARTH COMPONENT ──
export const ProceduralEarth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const systemRef = useRef<THREE.Group>(null);

  const { dayTexture, specTexture, cloudTexture } = useMemo(() => {
    return createProceduralEarthTextures();
  }, []);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.08;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.11;
      cloudsRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.03;
    }
  });

  return (
    <group ref={systemRef} rotation={[0.4, 0, 0.2]}>
      {/* Main Solid Earth Sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshStandardMaterial
          map={dayTexture}
          roughnessMap={specTexture}
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* Atmospheric Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.018, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent={true}
          opacity={0.52}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric Rayleigh Rim Glow Shader */}
      <Atmosphere radius={1.14} color="#00d4ff" intensity={1.35} />

      {/* Orbit Trajectory & Reconnaissance Satellites */}
      <OrbitRings />
    </group>
  );
};

// ── COMPONENT ENTRY WITH BLENDER FALLBACK DETECTOR ──
export const EarthModel: React.FC = () => {
  const [hasCustomGLB, setHasCustomGLB] = useState<boolean>(false);
  const glbPath = '/models/earth.glb';

  useEffect(() => {
    let isMounted = true;
    fetch(glbPath, { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (isMounted && res.ok && !contentType.includes('text/html')) {
          setHasCustomGLB(true);
        }
      })
      .catch(() => {
        if (isMounted) setHasCustomGLB(false);
      });

    return () => {
      isMounted = false;
    };
  }, [glbPath]);

  if (hasCustomGLB) {
    return (
      <Suspense fallback={<ProceduralEarth />}>
        <BlenderEarthModel url={glbPath} />
      </Suspense>
    );
  }

  return <ProceduralEarth />;
};
