import React, { useMemo } from 'react';
import * as THREE from 'three';

const atmosphereVertexShader = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmosphereFragmentShader = `
varying vec3 vNormal;
uniform vec3 glowColor;
uniform float intensityMultiplier;

void main() {
  // Rayleigh rim scattering: authentic subtle atmospheric gradient following curvature
  float rim = 0.58 - dot(vNormal, vec3(0.0, 0.0, 1.0));
  float intensity = pow(max(0.0, rim), 3.2) * intensityMultiplier;
  gl_FragColor = vec4(glowColor, 1.0) * intensity;
}
`;

interface AtmosphereProps {
  radius?: number;
  color?: string;
  intensity?: number;
}

export const Atmosphere: React.FC<AtmosphereProps> = ({
  radius = 1.032,
  color = '#3895ea', // Natural Earth atmospheric blue
  intensity = 1.15,
}) => {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      intensityMultiplier: { value: intensity },
    }),
    [color, intensity]
  );

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};
