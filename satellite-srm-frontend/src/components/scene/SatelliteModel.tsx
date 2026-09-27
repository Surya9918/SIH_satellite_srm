import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// PHOTOREALISTIC EARTH-OBSERVATION SATELLITE
// Modelled after Sentinel-2/WorldView-class spacecraft.
// Local axes: +Z points toward Earth (Nadir), +X is along solar arrays.
// ─────────────────────────────────────────────────────────────

// Shared material definitions
const ALU = new THREE.MeshStandardMaterial({
  color: '#8d9bab',
  roughness: 0.35,
  metalness: 0.85,
});
const GRAPHITE = new THREE.MeshStandardMaterial({
  color: '#1c2127',
  roughness: 0.4,
  metalness: 0.7,
});
const KAPTON = new THREE.MeshStandardMaterial({
  color: '#c9891e',
  roughness: 0.65,
  metalness: 0.5,
});
const SOLAR_BACK = new THREE.MeshStandardMaterial({
  color: '#111827',
  roughness: 0.5,
  metalness: 0.4,
});
const SOLAR_CELL = new THREE.MeshStandardMaterial({
  color: '#0d1b4f',
  roughness: 0.1,
  metalness: 0.9,
});
const LENS = new THREE.MeshStandardMaterial({
  color: '#030f1a',
  roughness: 0.02,
  metalness: 1.0,
  envMapIntensity: 3.0,
});
const LENS_INNER = new THREE.MeshStandardMaterial({
  color: '#0284c7',
  roughness: 0.05,
  metalness: 1.0,
  envMapIntensity: 4.0,
});
const WHITE_THERMAL = new THREE.MeshStandardMaterial({
  color: '#dde6ed',
  roughness: 0.6,
  metalness: 0.15,
});
const CHROME = new THREE.MeshStandardMaterial({
  color: '#c0cdd8',
  roughness: 0.2,
  metalness: 0.9,
});

// ─── SOLAR PANEL (single wing, call twice mirrored) ─────────
const SolarWing: React.FC<{ side: number }> = ({ side }) => {
  // side: -1 = left, +1 = right
  const panelX = side * 0.38;  // tighter wingspan — was 0.72

  // Visible cell grid lines
  const colDividers = Array.from({ length: 4 }, (_, i) => i * 0.07 - 0.105);
  const rowDividers = Array.from({ length: 3 }, (_, i) => i * 0.05 - 0.05);

  return (
    <group position={[panelX, 0, 0.02]}>
      {/* Deployment boom */}
      <mesh position={[side * -0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.24, 10]} />
        <meshStandardMaterial {...CHROME as any} />
      </mesh>

      {/* Panel structural frame */}
      <mesh>
        <boxGeometry args={[0.38, 0.008, 0.16]} />
        <meshStandardMaterial {...SOLAR_BACK as any} />
      </mesh>

      {/* Photovoltaic face */}
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[0.36, 0.0015, 0.14]} />
        <meshStandardMaterial {...SOLAR_CELL as any} />
      </mesh>

      {/* Column dividers (cell segmentation) */}
      {colDividers.map((cx, i) => (
        <mesh key={`col-${i}`} position={[cx, 0.006, 0]}>
          <boxGeometry args={[0.002, 0.0025, 0.14]} />
          <meshStandardMaterial color="#1e40af" roughness={0.3} metalness={1.0} />
        </mesh>
      ))}
      {/* Row dividers */}
      {rowDividers.map((rz, i) => (
        <mesh key={`row-${i}`} position={[0, 0.006, rz]}>
          <boxGeometry args={[0.36, 0.002, 0.0015]} />
          <meshStandardMaterial color="#1e40af" roughness={0.3} metalness={1.0} />
        </mesh>
      ))}

      {/* Outer frame border */}
      <mesh position={[0, 0.006, 0]}>
        <boxGeometry args={[0.38, 0.003, 0.16]} />
        <meshStandardMaterial color="#1e3a6e" roughness={0.4} metalness={0.8} wireframe />
      </mesh>

      {/* Hinge bracket at bus attachment */}
      <mesh position={[side * -0.205, 0, 0]}>
        <boxGeometry args={[0.022, 0.032, 0.032]} />
        <meshStandardMaterial {...CHROME as any} />
      </mesh>
    </group>
  );
};

// ─── OPTICAL IMAGING PAYLOAD ─────────────────────────────────
// Mounts on +Z face (Nadir) of the bus. Cylinder axis along Z.
const ImagingPayload: React.FC = () => (
  <group position={[0.02, -0.04, 0.155]}>
    {/* Payload mounting plate */}
    <mesh position={[0, 0, -0.02]}>
      <boxGeometry args={[0.14, 0.14, 0.03]} />
      <meshStandardMaterial {...GRAPHITE as any} />
    </mesh>

    {/* Sunshade tube (outer baffle) */}
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.055, 0.06, 0.16, 32, 1, true]} />
      <meshStandardMaterial {...GRAPHITE as any} side={THREE.DoubleSide} />
    </mesh>

    {/* Sunshade ribs - 4 rings along the barrel */}
    {[0.01, 0.04, 0.07, 0.10].map((z, i) => (
      <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.058, 0.006, 8, 32]} />
        <meshStandardMaterial {...GRAPHITE as any} />
      </mesh>
    ))}

    {/* Inner baffle (slightly smaller) */}
    <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.042, 0.042, 0.08, 24, 1, true]} />
      <meshStandardMaterial {...GRAPHITE as any} side={THREE.DoubleSide} />
    </mesh>

    {/* Primary mirror mount ring */}
    <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.044, 0.044, 0.006, 32]} />
      <meshStandardMaterial {...CHROME as any} />
    </mesh>

    {/* Primary lens glass */}
    <mesh position={[0, 0, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.038, 0.038, 0.004, 32]} />
      <meshStandardMaterial {...LENS as any} />
    </mesh>

    {/* Inner blue-glass aperture reflection */}
    <mesh position={[0, 0, 0.086]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.030, 0.030, 0.003, 32]} />
      <meshStandardMaterial {...LENS_INNER as any} />
    </mesh>

    {/* Detector housing box (behind lens) */}
    <mesh position={[0, 0, -0.03]}>
      <boxGeometry args={[0.09, 0.09, 0.04]} />
      <meshStandardMaterial {...GRAPHITE as any} />
    </mesh>
  </group>
);

// ─── HIGH-GAIN COMMUNICATION DISH ───────────────────────────
const CommDish: React.FC = () => (
  <group position={[-0.12, 0.13, -0.1]} rotation={[-0.4, -0.3, 0]}>
    {/* Dish backing arm */}
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.12, 8]} />
      <meshStandardMaterial {...CHROME as any} />
    </mesh>
    {/* Parabolic dish shell */}
    <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.075, 0.005, 0.04, 24]} />
      <meshStandardMaterial color="#e2eaf0" roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
    </mesh>
    {/* Dish struts */}
    {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
      <mesh key={i} position={[Math.cos(angle) * 0.04, 0.07, Math.sin(angle) * 0.04]} rotation={[0, angle, Math.PI / 6]}>
        <cylinderGeometry args={[0.002, 0.002, 0.06, 6]} />
        <meshStandardMaterial {...CHROME as any} />
      </mesh>
    ))}
    {/* Feed horn at focus */}
    <mesh position={[0, 0, 0.095]}>
      <cylinderGeometry args={[0.008, 0.005, 0.02, 12]} />
      <meshStandardMaterial {...GRAPHITE as any} />
    </mesh>
  </group>
);

// ─── STAR TRACKERS (attitude sensors) ──────────────────────
const StarTrackers: React.FC = () => (
  <group position={[0.1, 0.12, 0]}>
    {[0, 1].map(i => (
      <mesh key={i} position={[i * 0.06, 0, 0]} rotation={[i === 0 ? -0.8 : -0.5, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.018, 0.055, 16]} />
        <meshStandardMaterial {...GRAPHITE as any} />
      </mesh>
    ))}
  </group>
);

// ─── SMALL OMNI ANTENNA ─────────────────────────────────────
const OmniAntenna: React.FC = () => (
  <group position={[0.08, 0.16, 0.04]}>
    <mesh>
      <cylinderGeometry args={[0.003, 0.003, 0.12, 8]} />
      <meshStandardMaterial color="#c8d6df" roughness={0.3} metalness={0.9} />
    </mesh>
    <mesh position={[0, 0.065, 0]}>
      <sphereGeometry args={[0.006, 8, 8]} />
      <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.8} />
    </mesh>
  </group>
);

// ─── STATUS LED BEACON ─────────────────────────────────────
const StatusBeacon: React.FC = () => {
  const beaconRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + Math.sin(clock.getElapsedTime() * 2.5) * 0.7;
    }
  });
  return (
    <mesh ref={beaconRef} position={[0.07, 0.105, 0.08]}>
      <sphereGeometry args={[0.008, 10, 10]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#22d3ee"
        emissiveIntensity={1.2}
        roughness={0.1}
        metalness={0.0}
      />
    </mesh>
  );
};

// ─── MAIN SATELLITE ─────────────────────────────────────────
export const ProceduralSatellite: React.FC = () => {
  return (
    <group scale={0.9}>
      {/* ─── 1. SPACECRAFT BUS (main body) ─────────────────── */}
      {/* Primary structural box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.20, 0.28]} />
        <meshStandardMaterial {...ALU as any} />
      </mesh>

      {/* Kapton gold thermal insulation on the main bus body */}
      <mesh>
        <boxGeometry args={[0.224, 0.204, 0.20]} />
        <meshStandardMaterial {...KAPTON as any} transparent opacity={0.85} />
      </mesh>

      {/* Top structural rail (+Y) */}
      <mesh position={[0, 0.105, 0]}>
        <boxGeometry args={[0.24, 0.01, 0.30]} />
        <meshStandardMaterial {...CHROME as any} />
      </mesh>

      {/* Bottom structural rail (-Y) */}
      <mesh position={[0, -0.105, 0]}>
        <boxGeometry args={[0.24, 0.01, 0.30]} />
        <meshStandardMaterial {...CHROME as any} />
      </mesh>

      {/* Front face thermal panel (anti-nadir face, -Z) */}
      <mesh position={[0, 0, -0.145]}>
        <boxGeometry args={[0.21, 0.19, 0.01]} />
        <meshStandardMaterial {...WHITE_THERMAL as any} />
      </mesh>

      {/* Side thermal radiators (+/-X face) */}
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * 0.115, 0, -0.02]}>
          <boxGeometry args={[0.01, 0.18, 0.22]} />
          <meshStandardMaterial color="#d1dde8" roughness={0.55} metalness={0.2} />
        </mesh>
      ))}

      {/* Panel-seam details: horizontal strips */}
      {[-0.06, 0, 0.06].map((z, i) => (
        <mesh key={i} position={[0, 0.103, z]}>
          <boxGeometry args={[0.23, 0.003, 0.01]} />
          <meshStandardMaterial {...CHROME as any} />
        </mesh>
      ))}

      {/* ─── 2. SOLAR ARRAYS ─────────────────────────────── */}
      <SolarWing side={-1} />
      <SolarWing side={1} />

      {/* ─── 3. OPTICAL IMAGING PAYLOAD ─────────────────── */}
      <ImagingPayload />

      {/* ─── 4. HIGH-GAIN COMM DISH ─────────────────────── */}
      <CommDish />

      {/* ─── 5. STAR TRACKERS ───────────────────────────── */}
      <StarTrackers />

      {/* ─── 6. OMNI ANTENNA ────────────────────────────── */}
      <OmniAntenna />

      {/* ─── 7. STATUS LED ──────────────────────────────── */}
      <StatusBeacon />

      {/* ─── 8. ADDITIONAL STRUCTURAL DETAIL ───────────── */}
      {/* Corner edge brackets */}
      {[
        [0.11, 0.10, 0.14],
        [-0.11, 0.10, 0.14],
        [0.11, -0.10, 0.14],
        [-0.11, -0.10, 0.14],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.012, 0.012, 0.012]} />
          <meshStandardMaterial {...CHROME as any} />
        </mesh>
      ))}
    </group>
  );
};

// ── BLENDER GLB MODEL (HOT-SWAP) ──
const BlenderSatelliteModel: React.FC<{ url: string }> = ({ url }) => {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} scale={0.25} />;
};

// ── MAIN SATELLITE MODEL ENTRY ──
export const SatelliteModel: React.FC = () => {
  const [hasCustomGLB, setHasCustomGLB] = useState<boolean>(false);
  const glbPath = '/models/satellite.glb';

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
    return () => { isMounted = false; };
  }, [glbPath]);

  if (hasCustomGLB) {
    return (
      <Suspense fallback={<ProceduralSatellite />}>
        <BlenderSatelliteModel url={glbPath} />
      </Suspense>
    );
  }

  return <ProceduralSatellite />;
};
