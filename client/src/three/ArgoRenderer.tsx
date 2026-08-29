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
            position={[x, y, z]}
            onClick={(e) => { e.stopPropagation(); selectObservation(float.id); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
          >
            <Cylinder args={[0.2, 0.2, 1, 16]} rotation={[0, 0, 0]}>
              <meshStandardMaterial 
                color={isSelected ? "#00ffff" : "#ffaa00"} 
                emissive={isSelected ? "#00ffff" : "#ffaa00"} 
                emissiveIntensity={isSelected ? 0.8 : 0.4} 
              />
            </Cylinder>
            <Sphere args={[0.25, 16, 16]} position={[0, 0.5, 0]}>
              <meshStandardMaterial color={isSelected ? "#00ffff" : "#ffaa00"} />
            </Sphere>

            {isSelected && (
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.3} side={2} />
              </mesh>
            )}

            {isSelected && (
              <Html position={[0, 1, 0]} center className="pointer-events-none">
                <div className="bg-surfaceElevated border border-primary/50 text-white p-2 rounded text-xs shadow-lg backdrop-blur-md whitespace-nowrap z-50">
                  <p className="font-bold text-primary mb-1 border-b border-primary/30 pb-1">ARGO FLOAT</p>
                  <p>ID: {float.wmoId}</p>
                  <p>Depth: {float.depth.toFixed(1)}m</p>
                  <p>Temp: {float.variables.temperature?.toFixed(1)}Â°C</p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
