import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useOceanStore } from '../store/useOceanStore';
import { SCENE_DIMENSIONS, depthToWorld } from './utils/coordinates';
import { getVariableColor } from './colorScales';
import { OceanGrid } from './OceanGrid';
import { OCEAN_VARIABLES } from '../data/variables';

export const VerticalSection: React.FC = () => {
  const { selectedVariable, selectedTime, layers } = useOceanStore();

  const geometry = useMemo(() => {
    // A vertical plane across the middle of the ocean
    const geom = new THREE.PlaneGeometry(SCENE_DIMENSIONS.width, Math.abs(depthToWorld(5000)), 64, 32);
    const variableDef = OCEAN_VARIABLES[selectedVariable];
    if (!variableDef || variableDef.rendererType !== 'scalar-field') return geom;
    
    const positionAttribute = geom.getAttribute('position');
    const colors = new Float32Array(positionAttribute.count * 3);
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i); // This is true vertical Y
      
      const depth = Math.abs(y / depthToWorld(1));
      let value = 0;
      
      // Inline procedural mock logic aligned with engine for section
      const n = Math.sin(x * 0.1 + selectedTime) * Math.cos(depth * 0.05);
      
      if (selectedVariable === 'temperature') {
        const baseTemp = 30;
        const depthDecay = Math.max(0, 1 - (depth / 2000));
        value = (baseTemp * depthDecay) + (n * 2);
      } else if (selectedVariable === 'salinity') {
        value = 35 + (n * 1.5) - (depth / 4000);
      } else if (selectedVariable === 'chlorophyll') {
        const depthFactor = depth > 200 ? 0 : 1 - (depth/200);
        value = Math.max(0, (1 + n * 2) * depthFactor);
      } else if (selectedVariable === 'dissolvedOxygen') {
        value = Math.max(10, 200 - (depth / 20) + (n * 20));
      }
      
      // Clamp
      value = Math.max(variableDef.min, Math.min(variableDef.max, value));

      const color = getVariableColor(selectedVariable, value);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [selectedVariable, selectedTime]);

  return (
    <group>
      <OceanGrid />
      {layers.model && (
        <mesh geometry={geometry} position={[0, depthToWorld(2500), 0]}>
          <meshBasicMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
};
