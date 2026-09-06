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
            {/* Top antenna pole */}
            <Cylinder args={[0.02, 0.02, 0.4, 8]} position={[0, 0.4, 0]}>
              <meshStandardMaterial color="#222222" roughness={0.7} />
            </Cylinder>
            
            {/* Top antenna beacon/bulb */}
            <Sphere args={[0.06, 12, 12]} position={[0, 0.6, 0]}>
              <meshStandardMaterial 
                color={isSelected ? "#00ffff" : "#ffb703"} 
                emissive={isSelected ? "#00ffff" : "#fb8500"} 
                emissiveIntensity={isSelected ? 1.5 : 0.8} 
              />
            </Sphere>

            {/* Bottom weighted pole */}
            <Cylinder args={[0.03, 0.03, 0.3, 8]} position={[0, -0.4, 0]}>
              <meshStandardMaterial color="#222222" roughness={0.7} />
            </Cylinder>
            
            {/* Bottom weight bulb */}
            <Sphere args={[0.07, 12, 12]} position={[0, -0.55, 0]}>
              <meshStandardMaterial color="#ffb703" roughness={0.5} />
            </Sphere>

            {/* Float main body cylinder */}
            <Cylinder args={[0.12, 0.12, 0.5, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color={isSelected ? "#00ffff" : "#ffb703"} 
                emissive={isSelected ? "#00ffff" : "#fb8500"} 
                emissiveIntensity={isSelected ? 0.8 : 0.3}
                roughness={0.4}
              />
            </Cylinder>

            {/* Black bands on the body */}
            <Cylinder args={[0.125, 0.125, 0.05, 16]} position={[0, 0.15, 0]}>
              <meshStandardMaterial color="#111111" roughness={0.8} />
            </Cylinder>
            <Cylinder args={[0.125, 0.125, 0.05, 16]} position={[0, -0.15, 0]}>
              <meshStandardMaterial color="#111111" roughness={0.8} />
            </Cylinder>

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
                <div className="bg-[#0a1128]/90 border border-[#1b2a4a] text-white p-3 rounded-lg text-[13px] shadow-2xl backdrop-blur-md whitespace-nowrap relative min-w-[150px]">
                  {/* Tooltip connector pointer */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1b2a4a]"></div>
                  
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-bold text-white tracking-wide">Argo Float</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); selectObservation(null); }}
                      className="text-gray-400 hover:text-white p-0.5 rounded transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 text-gray-300">
                    <p>ID: <span className="text-white">{float.wmoId}</span></p>
                    <p>Depth: <span className="text-white">{Math.round(float.depth)} m</span></p>
                    <p>Temp: <span className="text-white">{float.variables.temperature?.toFixed(1)} °C</span></p>
                    <p>Salinity: <span className="text-white">{float.variables.salinity?.toFixed(1)} PSU</span></p>
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
