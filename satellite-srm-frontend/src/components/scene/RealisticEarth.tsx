import React, { useRef, Suspense, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Atmosphere } from './Atmosphere';

// ── PHOTOREALISTIC EARTH WITH ENHANCED SATELLITE VISIBILITY ──
const PhotorealisticGlobe: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  // Load new authentic, vibrant Blue Marble daylight textures
  const [dayMap, cloudsMap, specularMap] = useTexture([
    '/textures/earth/earth_day_daylight.jpg', // Renamed again to bust cache for the new NASA Blue Marble texture
    '/textures/earth/earth_clouds_vivid.png',
    '/textures/earth/earth_specular_vivid.jpg',
  ]);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    dayMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = maxAnisotropy;
    dayMap.minFilter = THREE.LinearMipmapLinearFilter;
    dayMap.needsUpdate = true;

    cloudsMap.anisotropy = maxAnisotropy;
    cloudsMap.needsUpdate = true;

    specularMap.anisotropy = maxAnisotropy;
    specularMap.needsUpdate = true;
  }, [dayMap, cloudsMap, specularMap, gl]);

  useFrame((_, delta) => {
    // Smooth planetary rotation
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.025;
    }
    // Independent atmospheric cloud drift
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.033;
    }
  });

  return (
    <group rotation={[0.41, 0, 0.23] /* Realistic 23.4° axial tilt */}>
      {/* 1. Main Terrestrial Earth Globe (Vibrant continents, bright blue oceans) */}
      <mesh ref={earthRef} castShadow receiveShadow rotation={[0, Math.PI * 1.15, 0]}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          metalnessMap={specularMap}
          roughness={0.65} // Balanced diffuse reflection for land
          metalness={0.4} // Water reflects ambient/directional light realistically
          color="#ffffff"
        />
      </mesh>

      {/* 2. Real NASA Cloud Layer (Crisp, defined white cloud patterns) */}
      <mesh ref={cloudsRef} rotation={[0, Math.PI * 1.15, 0]}>
        <sphereGeometry args={[1.008, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.48} // Slightly increased visibility for crispness
          blending={THREE.AdditiveBlending} // Ensures clouds are bright white and never cast dark artifacts
          depthWrite={false}
          roughness={1.0}
        />
      </mesh>

      {/* 3. Soft Natural Blue Atmospheric Rim */}
      <Atmosphere radius={1.03} color="#3ba4ff" intensity={1.15} />
    </group>
  );
};

// ── SAFE FALLBACK GLOBE (IF TEXTURES STILL LOADING) ──
const SimpleFallbackGlobe: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0.41, 0, 0.23]}>
      <sphereGeometry args={[1.0, 64, 64]} />
      <meshStandardMaterial
        color="#1b4d89"
        roughness={0.5}
        metalness={0.1}
      />
      <Atmosphere radius={1.034} color="#3b8eed" intensity={1.2} />
    </mesh>
  );
};

// ── BLENDER GLB EARTH (HOT-SWAP SUPPORT) ──
const BlenderEarthModel: React.FC<{ url: string }> = ({ url }) => {
  const gltf = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.41, 0, 0.23]}>
      <primitive object={gltf.scene} scale={1.0} />
      <Atmosphere radius={1.034} color="#3b8eed" intensity={1.2} />
    </group>
  );
};

// ── MAIN REALISTIC EARTH ENTRY ──
export const RealisticEarth: React.FC = () => {
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
      <Suspense fallback={<SimpleFallbackGlobe />}>
        <BlenderEarthModel url={glbPath} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<SimpleFallbackGlobe />}>
      <PhotorealisticGlobe />
    </Suspense>
  );
};
