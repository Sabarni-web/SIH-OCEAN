import React from 'react';
import { Cylinder, Html } from '@react-three/drei';
import { useObservationStore } from '../store/useObservationStore';
import { useOceanStore } from '../store/useOceanStore';
import { geoToWorld, depthToWorld } from './utils/coordinates';
import type { Mooring } from '../../../shared/types';

interface Props {
  data: Mooring[];
}

export const MooringRenderer: React.FC<Props> = ({ data }) => {
  const { selectedObservationId, selectObservation } = useObservationStore();
  const { viewBounds } = useOceanStore();

  return (
    <group>
      {data.map((mooring) => {
        const [x, z] = geoToWorld(mooring.latitude, mooring.longitude, viewBounds);
        const y = depthToWorld(0); // Surface marker
        const maxDepthY = depthToWorld(mooring.sensorDepths[mooring.sensorDepths.length - 1] || 1000);
        const isSelected = selectedObservationId === mooring.id;

        return (
          <group 
            key={mooring.id} 
            position={[x, 0, z]}
            onClick={(e) => { e.stopPropagation(); selectObservation(mooring.id); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
          >
            {/* Mooring Line */}
            <mesh position={[0, (maxDepthY) / 2, 0]}>
              <cylinderGeometry args={[0.05, 0.05, Math.abs(maxDepthY), 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>

            {/* Surface Buoy */}
            <Cylinder args={[0.4, 0.4, 0.5, 16]} position={[0, y, 0]}>
              <meshStandardMaterial 
                color={isSelected ? "#ffffff" : "#ff3333"} 
                emissive={isSelected ? "#ffffff" : "#ff3333"} 
                emissiveIntensity={0.5} 
              />
            </Cylinder>

            {isSelected && (
              <Html position={[0, y + 1, 0]} center className="pointer-events-auto z-50">
                <div className="bg-surfaceElevated/95 border border-red-400/60 text-white p-2.5 rounded-lg text-xs shadow-2xl backdrop-blur-md whitespace-nowrap relative">
                  <div className="flex items-center justify-between gap-3 border-b border-red-400/30 pb-1 mb-1.5">
                    <span className="font-bold text-red-400 tracking-wider uppercase text-[11px]">MOORING BUOY</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); selectObservation(null); }}
                      className="text-textSecondary hover:text-white p-0.5 hover:bg-white/10 rounded transition-colors text-xs font-bold leading-none"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-mono text-[11px]">ID: <span className="text-white font-bold">{mooring.stationId}</span></p>
                  <p className="text-textSecondary text-[11px]">Lat: {mooring.latitude.toFixed(2)}° | Lon: {mooring.longitude.toFixed(2)}°</p>
                  <p className="text-textSecondary text-[11px]">SST: <span className="text-red-300 font-bold">{mooring.variables.temperature?.toFixed(1)}°C</span></p>
                  <p className="text-textSecondary text-[11px]">Wave: <span className="text-cyan-300 font-bold">{mooring.variables.waveHeight} m</span></p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
