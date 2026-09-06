import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';

export const GlobeRenderer: React.FC = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  
  // Load standard earth textures from reliable public CDNs
  const [colorMap, bumpMap, specularMap] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-water.png'
  ]);

  useFrame(() => {
    if (globeRef.current) {
      // Very slow rotation for the globe
      globeRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group position={[0, -45, 0]}>
      {/* Main Earth Sphere */}
      <mesh ref={globeRef} rotation={[0, -Math.PI / 2, 0]}>
        <sphereGeometry args={[40, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.8}
          roughnessMap={specularMap}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[41, 64, 64]} />
        <meshBasicMaterial
          color="#00aaff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
