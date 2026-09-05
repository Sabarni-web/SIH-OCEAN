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
              <Html position={[0, 1, 0]} center className="pointer-events-auto z-50">
                <div className="bg-surfaceElevated/95 border border-teal-400/60 text-white p-2.5 rounded-lg text-xs shadow-2xl backdrop-blur-md whitespace-nowrap relative">
                  <div className="flex items-center justify-between gap-3 border-b border-teal-400/30 pb-1 mb-1.5">
                    <span className="font-bold text-teal-400 tracking-wider uppercase text-[11px]">BGC OBSERVATION</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); selectObservation(null); }}
                      className="text-textSecondary hover:text-white p-0.5 hover:bg-white/10 rounded transition-colors text-xs font-bold leading-none"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-mono text-[11px]">Platform: <span className="text-white font-bold">{bgc.platformType}</span></p>
                  <p className="text-textSecondary text-[11px]">Depth: <span className="text-cyan-300 font-bold">{bgc.depth.toFixed(1)}m</span></p>
                  <p className="text-textSecondary text-[11px]">Chlorophyll: <span className="text-emerald-300 font-bold">{bgc.variables.chlorophyll?.toFixed(2)} mg/m³</span></p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
