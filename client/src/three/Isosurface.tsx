import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useOceanStore } from '../store/useOceanStore';
import { SCENE_DIMENSIONS, depthToWorld } from './utils/coordinates';
import { OceanGrid } from './OceanGrid';
import { Bathymetry } from './Bathymetry';
import { OCEAN_VARIABLES } from '../data/variables';
import { getVariableColor } from './colorScales';

export const Isosurface: React.FC = () => {
  const { layers, selectedVariable, selectedTime } = useOceanStore();
  
  // Create a wavy 3D surface to mock an isosurface extraction
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(SCENE_DIMENSIONS.width, SCENE_DIMENSIONS.depth, 32, 32);
    const positionAttribute = geom.getAttribute('position');
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      
      // Isosurface depth varies spatially
      let depth = 500 + Math.sin(x/2 + selectedTime)*200 + Math.cos(y/3 - selectedTime)*300;
      if (selectedVariable === 'chlorophyll') depth = 100 + Math.sin(x/5)*50;
      else if (selectedVariable === 'dissolvedOxygen') depth = 1000 + Math.sin(y/4)*300;
      
      positionAttribute.setZ(i, depthToWorld(depth));
    }
    geom.computeVertexNormals();
    return geom;
  }, [selectedVariable, selectedTime]);

  return (
    <group>
      <OceanGrid />
      <Bathymetry />
      {layers.isosurface !== false && (
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={OCEAN_VARIABLES[selectedVariable] ? getVariableColor(selectedVariable, OCEAN_VARIABLES[selectedVariable].defaultMax) : "#ffffff"} 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
};
