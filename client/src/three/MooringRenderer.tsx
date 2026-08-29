import React from 'react';
import { Cylinder, Html } from '@react-three/drei';
import { useObservationStore } from '../store/useObservationStore';
import { geoToWorld, depthToWorld } from './utils/coordinates';
import type { Mooring } from '../../../shared/types';

interface Props {
  data: Mooring[];
}

export const MooringRenderer: React.FC<Props> = ({ data }) => {
  const { selectedObservationId, selectObservation } = useObservationStore();

  return (
    <group>
      {data.map((mooring) => {
        const [x, z] = geoToWorld(mooring.latitude, mooring.longitude);
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
              <Html position={[0, y + 1, 0]} center className="pointer-events-none">
                <div className="bg-surfaceElevated border border-red-400/50 text-white p-2 rounded text-xs shadow-lg backdrop-blur-md whitespace-nowrap z-50">
                  <p className="font-bold text-red-400 mb-1 border-b border-red-400/30 pb-1">MOORING</p>
                  <p>ID: {mooring.stationId}</p>
                  <p>Sensors: {mooring.sensorDepths.length}</p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
