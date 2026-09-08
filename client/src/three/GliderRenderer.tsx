import React from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useObservationStore } from '../store/useObservationStore';
import { useOceanStore } from '../store/useOceanStore';
import { geoToWorld, depthToWorld } from './utils/coordinates';
import type { Glider } from '../../../shared/types';

interface Props {
  data: Glider[];
}

export const GliderRenderer: React.FC<Props> = ({ data }) => {
  const { selectedObservationId, selectObservation } = useObservationStore();
  const { selectedTime, viewBounds } = useOceanStore();

  return (
    <group>
      {data.map((glider) => {
        const isSelected = selectedObservationId === glider.id;

        // Current point follows selectedTime modulo track length
        const timeIndex = selectedTime % glider.track.length;
        const currentPt = glider.track[timeIndex] || glider.track[glider.track.length - 1];
        const [cx, cz] = geoToWorld(currentPt.latitude, currentPt.longitude, viewBounds);
        const cy = depthToWorld(currentPt.depth);

        return (
          <group 
            key={glider.id}
            onClick={(e) => { e.stopPropagation(); selectObservation(glider.id); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
          >
            <Line 
              points={glider.track.map(pt => {
                const [x, z] = geoToWorld(pt.latitude, pt.longitude, viewBounds);
                return new THREE.Vector3(x, depthToWorld(pt.depth), z);
              })} 
              color={isSelected ? "#00ff88" : "#00aa55"} 
              lineWidth={2} 
              transparent 
              opacity={0.8} 
            />
            
            <mesh position={[cx, cy, cz]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={isSelected ? "#00ff88" : "#00aa55"} emissive={isSelected ? "#00ff88" : "#00aa55"} emissiveIntensity={0.6} />
            </mesh>

            {isSelected && (
              <Html position={[cx, cy + 1, cz]} center className="pointer-events-auto z-50">
                <div className="bg-surfaceElevated/95 border border-green-400/60 text-white p-2.5 rounded-lg text-xs shadow-2xl backdrop-blur-md whitespace-nowrap relative">
                  <div className="flex items-center justify-between gap-3 border-b border-green-400/30 pb-1 mb-1.5">
                    <span className="font-bold text-green-400 tracking-wider uppercase text-[11px]">GLIDER</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); selectObservation(null); }}
                      className="text-textSecondary hover:text-white p-0.5 hover:bg-white/10 rounded transition-colors text-xs font-bold leading-none"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-mono text-[11px]">ID: <span className="text-white font-bold">{glider.deploymentId}</span></p>
                  <p className="text-textSecondary text-[11px]">Depth: <span className="text-cyan-300 font-bold">{currentPt.depth.toFixed(1)}m</span></p>
                  <p className="text-textSecondary text-[11px]">Temp: <span className="text-emerald-300 font-bold">{currentPt.variables.temperature?.toFixed(1)}°C</span></p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
