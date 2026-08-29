import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_DIMENSIONS } from './utils/coordinates';

export const OceanSurface: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Custom shader material could be used here, but for now we use StandardMaterial with simple vertex animation
  useFrame((state) => {
    if (meshRef.current) {
      // Very subtle wave motion so it doesn't distract from scientific data
      const time = state.clock.elapsedTime;
      const positionAttribute = meshRef.current.geometry.getAttribute('position');
      
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        
        // Z in geometry corresponds to Y in world because it's rotated
        const z = Math.sin(x * 0.5 + time) * 0.05 + Math.cos(y * 0.5 + time * 0.8) * 0.05;
        positionAttribute.setZ(i, z);
      }
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} renderOrder={1}>
      <planeGeometry args={[SCENE_DIMENSIONS.width, SCENE_DIMENSIONS.depth, 32, 32]} />
      <meshPhysicalMaterial 
        color="#006994" 
        transparent 
        opacity={0.4} 
        transmission={0.9}
        roughness={0.1}
        metalness={0.8}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};
