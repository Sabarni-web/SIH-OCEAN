import React from 'react';
import { Grid, Html } from '@react-three/drei';
import { SCENE_DIMENSIONS, depthToWorld } from './utils/coordinates';

export const OceanGrid: React.FC = () => {
  const depths = [0, 500, 1000, 2000, 3000, 4000, 5000];

  return (
    <group>
      {depths.map((depth, idx) => {
        const y = depthToWorld(depth);
        return (
          <group key={depth} position={[0, y, 0]}>
            {/* Grid at specific depths */}
            <Grid 
              args={[SCENE_DIMENSIONS.width, SCENE_DIMENSIONS.depth]} 
              cellSize={SCENE_DIMENSIONS.width / 10} 
              cellThickness={0.5} 
              cellColor={depth === 0 ? "#00d4ff" : "#0a66c2"} 
              sectionSize={SCENE_DIMENSIONS.width / 2} 
              sectionThickness={depth === 0 ? 1 : 0.5} 
              sectionColor={depth === 0 ? "#00ffff" : "#00d4ff"} 
              fadeDistance={SCENE_DIMENSIONS.width * 1.5} 
              fadeStrength={1}
            />
            {/* Depth label on the edge */}
            <Html 
              position={[SCENE_DIMENSIONS.width / 2 + 0.5, 0, SCENE_DIMENSIONS.depth / 2]} 
              center 
              style={{ 
                color: '#8892b0', 
                fontSize: '10px', 
                fontFamily: 'monospace',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            >
              {depth}m
            </Html>
          </group>
        );
      })}
    </group>
  );
};
