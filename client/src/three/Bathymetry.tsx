import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SCENE_DIMENSIONS, depthToWorld } from './utils/coordinates';
import { useOceanStore } from '../store/useOceanStore';

export const Bathymetry: React.FC = () => {
  const { layers } = useOceanStore();
  
  // Generate procedural bathymetry
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(SCENE_DIMENSIONS.width, SCENE_DIMENSIONS.depth, 64, 64);
    const positionAttribute = geom.getAttribute('position');
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      
      // Procedural depth (e.g. continental shelf dropping off into a basin)
      // distance from center roughly
      const dist = Math.sqrt(x*x + y*y);
      let depth = 500;
      
      if (dist > 10) {
        depth = 500 + (dist - 10) * 400; // Drop off
      }
      // add some noise
      depth += Math.sin(x*2)*100 + Math.cos(y*2)*100;
      
      // Cap depth
      depth = Math.min(Math.max(depth, 0), 5000);
      
      const worldY = depthToWorld(depth);
      
      // Plane is rotated -PI/2, so Z represents world Y
      positionAttribute.setZ(i, worldY);
    }
    
    geom.computeVertexNormals();
    return geom;
  }, []);

  if (!layers.bathymetry) return null;

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial 
        color="#051923" 
        roughness={0.8}
        metalness={0.2}
        wireframe={false}
      />
    </mesh>
  );
};
