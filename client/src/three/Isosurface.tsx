import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useOceanStore } from '../store/useOceanStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { SCENE_DIMENSIONS, depthToWorld } from './utils/coordinates';

export const Isosurface: React.FC = () => {
  const { selectedVariable, selectedTime } = useOceanStore();
  const { isosurfaceEnabled, verticalExaggeration } = useAnalyticsStore();
  
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(SCENE_DIMENSIONS.width, SCENE_DIMENSIONS.depth, 48, 48);
    const count = geom.attributes.position.count;
    const pos = geom.attributes.position;
    
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      // Isosurface thermocline depth layer (varying around 500m to 1200m depth)
      let depth = 650 + Math.sin(x * 0.35 + selectedTime * 0.2) * 180 + Math.cos(y * 0.35 - selectedTime * 0.2) * 220;
      if (selectedVariable === 'chlorophyll') {
        depth = 120 + Math.sin(x * 0.4) * 40;
      }

      pos.setZ(i, depthToWorld(depth) * verticalExaggeration);
    }

    geom.computeVertexNormals();
    return geom;
  }, [selectedVariable, selectedTime, verticalExaggeration]);

  const { visualizationMode } = useOceanStore();
  if (visualizationMode !== 'iso' && !isosurfaceEnabled) return null;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Semi-transparent glowing 3D Isosurface */}
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          color="#ffb703" 
          emissive="#fb8500"
          emissiveIntensity={0.4}
          transparent 
          opacity={0.65}
          side={THREE.DoubleSide}
          roughness={0.2}
          metalness={0.2}
        />
      </mesh>
      {/* Contour lines overlay */}
      <mesh geometry={geometry} position={[0, 0, 0.02]}>
        <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.25} />
      </mesh>
    </group>
  );
};
