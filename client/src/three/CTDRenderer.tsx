import React from 'react';
import { Box, Html } from '@react-three/drei';
import { useObservationStore } from '../store/useObservationStore';
import { useOceanStore } from '../store/useOceanStore';
import { geoToWorld, depthToWorld } from './utils/coordinates';
import type { CTDObservation } from '../../../shared/types';

interface Props {
  data: CTDObservation[];
}

export const CTDRenderer: React.FC<Props> = ({ data }) => {
  const { selectedObservationId, selectObservation } = useObservationStore();
  const { viewBounds } = useOceanStore();

  return (
    <group>
      {data.map((ctd) => {
        const [x, z] = geoToWorld(ctd.latitude, ctd.longitude, viewBounds);
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
              <Html position={[0, 1, 0]} center className="pointer-events-auto z-50">
                <div className="bg-surfaceElevated/95 border border-purple-400/60 text-white p-2.5 rounded-lg text-xs shadow-2xl backdrop-blur-md whitespace-nowrap relative">
                  <div className="flex items-center justify-between gap-3 border-b border-purple-400/30 pb-1 mb-1.5">
                    <span className="font-bold text-purple-400 tracking-wider uppercase text-[11px]">CTD STATION</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); selectObservation(null); }}
                      className="text-textSecondary hover:text-white p-0.5 hover:bg-white/10 rounded transition-colors text-xs font-bold leading-none"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-mono text-[11px]">Cruise: <span className="text-white font-bold">{ctd.cruiseId}</span></p>
                  <p className="text-textSecondary text-[11px]">Lat: {ctd.latitude.toFixed(2)}° | Lon: {ctd.longitude.toFixed(2)}°</p>
                  <p className="text-textSecondary text-[11px]">Depth: <span className="text-cyan-300 font-bold">{ctd.depth.toFixed(1)}m</span></p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
