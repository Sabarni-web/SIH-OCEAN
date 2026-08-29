import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OceanWorld } from './OceanWorld';

export const OceanScene: React.FC = () => {
  return (
    <div className="w-full h-full bg-background/50 rounded-b-xl overflow-hidden cursor-move">
      <Canvas camera={{ position: [15, 10, 15], fov: 45 }}>
        <color attach="background" args={['#040b16']} />
        <OceanWorld />
      </Canvas>
    </div>
  );
};
