import React from 'react';
import { Icosahedron, Html } from '@react-three/drei';
import { useObservationStore } from '../store/useObservationStore';
import { geoToWorld, depthToWorld } from './utils/coordinates';
import type { BGCObservation } from '../../../shared/types';

interface Props {
  data: BGCObservation[];
}

export const BGCRenderer: React.FC<Props> = ({ data }) => {
  const { selectedObservationId, selectObservation } = useObservationStore();

  return (
    <group>
      {data.map((bgc) => {
        const [x, z] = geoToWorld(bgc.latitude, bgc.longitude);
        const y = depthToWorld(bgc.depth);
        const isSelected = selectedObservationId === bgc.id;

        return (
          <group 
            key={bgc.id} 
            position={[x, y, z]}
            onClick={(e) => { e.stopPropagation(); selectObservation(bgc.id); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
          >
            <Icosahedron args={[0.3, 1]}>
              <meshStandardMaterial 
                color={isSelected ? "#ffffff" : "#ffaa00"} // Wait, maybe green for BGC? Let's use #00ffaa
                emissive={isSelected ? "#ffffff" : "#00ffaa"} 
                emissiveIntensity={0.6} 
                wireframe={isSelected}
              />
            </Icosahedron>

            {isSelected && (
              <Html position={[0, 1, 0]} center className="pointer-events-none">
                <div className="bg-surfaceElevated border border-teal-400/50 text-white p-2 rounded text-xs shadow-lg backdrop-blur-md whitespace-nowrap z-50">
                  <p className="font-bold text-teal-400 mb-1 border-b border-teal-400/30 pb-1">BGC OBSERVATION</p>
                  <p>Platform: {bgc.platformType}</p>
                  <p>Depth: {bgc.depth.toFixed(1)}m</p>
                  <p>Chl: {bgc.variables.chlorophyll?.toFixed(2)}</p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
