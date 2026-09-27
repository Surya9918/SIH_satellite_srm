import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../theme/ThemeProvider';

function EarthModel({ isDarkMode }: { isDarkMode: boolean }) {
  const { scene } = useGLTF('/assets/Earth.glb');
  const earthRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (earthRef.current) {
      // Slow rotation for the background
      earthRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      earthRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  // Adjust material properties based on theme
  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (isDarkMode) {
          // Enhance colors for dark mode
          material.color.setScalar(1.2);
          material.roughness = 0.6;
          material.metalness = 0.1;
        } else {
          // Brighten up slightly for light mode
          material.color.setScalar(2.0); // Make the earth brighter to contrast with white background
          material.roughness = 0.8;
          material.metalness = 0.0;
        }
      }
    });
  }, [scene, isDarkMode]);

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <primitive 
        ref={earthRef}
        object={scene} 
        scale={2.5}
        position={[0, -2, 0]} 
        rotation={[0.2, 0, 0]}
      />
    </Float>
  );
}

// Preload the model
useGLTF.preload('/assets/Earth.glb');

export const EarthBackground: React.FC = () => {
  const { theme } = useTheme();
  
  // Determine if it's dark mode, accounting for 'system' preference
  const isDarkMode = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] transition-colors duration-700">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* Environment lighting adapts to theme implicitly by using different intensities */}
        <ambientLight intensity={isDarkMode ? 0.8 : 2.5} />
        <directionalLight 
          position={[5, 3, 5]} 
          intensity={isDarkMode ? 1.5 : 3.0} 
          color={isDarkMode ? "#ffffff" : "#fdf4dc"} 
        />
        <directionalLight 
          position={[-5, -3, -5]} 
          intensity={isDarkMode ? 0.5 : 1.0} 
          color="#3B7DD8" 
        />
        
        <EarthModel isDarkMode={isDarkMode} />
        
        {/* Only show stars in dark mode */}
        {isDarkMode && (
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        )}
        
        {/* Optional Environment for reflections */}
        <Environment preset={isDarkMode ? "night" : "city"} blur={0.8} />
      </Canvas>
    </div>
  );
};
