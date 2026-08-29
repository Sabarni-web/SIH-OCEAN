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
  const { selectedTime } = useOceanStore();

  return (
    <group>
      {data.map((glider) => {
        const isSelected = selectedObservationId === glider.id;

        // Current point follows selectedTime modulo track length
        const timeIndex = selectedTime % glider.track.length;
        const currentPt = glider.track[timeIndex] || glider.track[glider.track.length - 1];
        const [cx, cz] = geoToWorld(currentPt.latitude, currentPt.longitude);
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
                const [x, z] = geoToWorld(pt.latitude, pt.longitude);
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
              <Html position={[cx, cy + 1, cz]} center className="pointer-events-none">
                <div className="bg-surfaceElevated border border-green-400/50 text-white p-2 rounded text-xs shadow-lg backdrop-blur-md whitespace-nowrap z-50">
                  <p className="font-bold text-green-400 mb-1 border-b border-green-400/30 pb-1">GLIDER</p>
                  <p>ID: {glider.deploymentId}</p>
                  <p>Depth: {currentPt.depth.toFixed(1)}m</p>
                  <p>Temp: {currentPt.variables.temperature?.toFixed(1)}°C</p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
