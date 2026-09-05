import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OceanWorld } from './OceanWorld';
import { useObservationStore } from '../store/useObservationStore';

export const OceanScene: React.FC = () => {
  const { selectObservation } = useObservationStore();

  return (
    <div className="w-full h-full bg-background/50 rounded-b-xl overflow-hidden cursor-move">
      <Canvas 
        camera={{ position: [15, 10, 15], fov: 45 }}
        onPointerMissed={() => selectObservation(null)}
      >
        <color attach="background" args={['#040b16']} />
        <OceanWorld />
      </Canvas>
    </div>
  );
};
