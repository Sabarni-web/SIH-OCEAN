import React from 'react';
import { Box, Html } from '@react-three/drei';
import { useObservationStore } from '../store/useObservationStore';
import { geoToWorld, depthToWorld } from './utils/coordinates';
import type { CTDObservation } from '../../../shared/types';

interface Props {
  data: CTDObservation[];
}

export const CTDRenderer: React.FC<Props> = ({ data }) => {
  const { selectedObservationId, selectObservation } = useObservationStore();

  return (
    <group>
      {data.map((ctd) => {
        const [x, z] = geoToWorld(ctd.latitude, ctd.longitude);
        const y = depthToWorld(ctd.depth);
        const isSelected = selectedObservationId === ctd.id;

        return (
          <group 
            key={ctd.id} 
            position={[x, y, z]}
            onClick={(e) => { e.stopPropagation(); selectObservation(ctd.id); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
          >
            <Box args={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial 
                color={isSelected ? "#ffffff" : "#a200ff"} 
                emissive={isSelected ? "#ffffff" : "#a200ff"} 
                emissiveIntensity={0.5} 
              />
            </Box>

            {isSelected && (
              <Html position={[0, 1, 0]} center className="pointer-events-none">
                <div className="bg-surfaceElevated border border-purple-400/50 text-white p-2 rounded text-xs shadow-lg backdrop-blur-md whitespace-nowrap z-50">
                  <p className="font-bold text-purple-400 mb-1 border-b border-purple-400/30 pb-1">CTD STATION</p>
                  <p>ID: {ctd.cruiseId}</p>
                  <p>Depth: {ctd.depth.toFixed(1)}m</p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
