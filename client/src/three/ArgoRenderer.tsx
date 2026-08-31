import React from 'react';
import { Sphere, Cylinder, Html } from '@react-three/drei';
import { useObservationStore } from '../store/useObservationStore';
import { geoToWorld, depthToWorld } from './utils/coordinates';
import type { ArgoFloat } from '../../../shared/types';

interface Props {
  data: ArgoFloat[];
}

export const ArgoRenderer: React.FC<Props> = ({ data }) => {
  const { selectedObservationId, selectObservation } = useObservationStore();

  return (
    <group>
      {data.map((float) => {
        const [x, z] = geoToWorld(float.latitude, float.longitude);
        const y = depthToWorld(float.depth);
        const isSelected = selectedObservationId === float.id;

        return (
          <group 
            key={float.id} 
            position={[x, y + 0.3, z]}
            onClick={(e) => { e.stopPropagation(); selectObservation(float.id); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
          >
            {/* Float body cylinder */}
            <Cylinder args={[0.1, 0.1, 0.5, 12]} rotation={[0, 0, 0]}>
              <meshStandardMaterial 
                color={isSelected ? "#00ffff" : "#ffb703"} 
                emissive={isSelected ? "#00ffff" : "#fb8500"} 
                emissiveIntensity={isSelected ? 1.0 : 0.5} 
              />
            </Cylinder>
            
            {/* Float antenna beacon top */}
            <Sphere args={[0.13, 12, 12]} position={[0, 0.3, 0]}>
              <meshStandardMaterial 
                color={isSelected ? "#00ffff" : "#ffb703"} 
                emissive={isSelected ? "#00ffff" : "#fb8500"} 
                emissiveIntensity={isSelected ? 1.2 : 0.6} 
              />
            </Sphere>

            {/* Selection glowing aura */}
            {isSelected && (
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.7, 16]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.4} side={2} />
              </mesh>
            )}

            {/* Floating details badge when selected */}
            {isSelected && (
              <Html position={[0, 0.8, 0]} center className="pointer-events-auto z-50">
                <div className="bg-surfaceElevated/95 border border-primary/60 text-white p-2.5 rounded-lg text-xs shadow-2xl backdrop-blur-md whitespace-nowrap relative">
                  <div className="flex items-center justify-between gap-3 border-b border-primary/30 pb-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-primary tracking-wider uppercase text-[11px]">ARGO FLOAT</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-green-500/20 text-green-400 border border-green-500/30 rounded font-semibold">LIVE</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); selectObservation(null); }}
                      className="text-textSecondary hover:text-white p-0.5 hover:bg-white/10 rounded transition-colors text-xs font-bold leading-none"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-mono text-[11px]">WMO: <span className="text-white font-bold">{float.wmoId}</span></p>
                  <p className="text-textSecondary text-[11px]">Lat: {float.latitude.toFixed(2)}° | Lon: {float.longitude.toFixed(2)}°</p>
                  <p className="text-textSecondary text-[11px]">Temp: <span className="text-cyan-300 font-bold">{float.variables.temperature?.toFixed(1)}°C</span></p>
                  <p className="text-textSecondary text-[11px]">Salinity: <span className="text-emerald-300 font-bold">{float.variables.salinity?.toFixed(1)} PSU</span></p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
