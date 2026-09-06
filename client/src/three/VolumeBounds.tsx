import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Grid, Html } from '@react-three/drei';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { SCENE_DIMENSIONS } from './utils/coordinates';

export const VolumeBounds: React.FC = () => {
  const { verticalExaggeration } = useAnalyticsStore();

  const width = SCENE_DIMENSIONS.width;
  const depth = SCENE_DIMENSIONS.depth;
  const height = SCENE_DIMENSIONS.baseDepth * verticalExaggeration;

  const halfW = width / 2;
  const halfD = depth / 2;

  // The box spans from y=height to y=0
  const midY = height / 2;

  // Creating a wireframe material for the bounding box
  const boxGeometry = useMemo(() => {
    // A box geometry centered at origin
    return new THREE.BoxGeometry(width, Math.abs(height), depth);
  }, [width, height, depth]);

  return (
    <group>
      {/* Main bounding box outline */}
      <mesh geometry={boxGeometry} position={[0, midY, 0]}>
        <meshBasicMaterial color="#00e5ff" wireframe={true} transparent opacity={0.15} />
      </mesh>

      {/* Grid on the Bottom */}
      <Grid 
        position={[0, height, 0]} 
        args={[width, depth]} 
        cellColor="#00d4ff" 
        sectionColor="#0066aa" 
        cellThickness={0.5} 
        sectionThickness={1}
        fadeDistance={50}
      />

      {/* Grid on the Back Wall (Z = -halfD) */}
      <group position={[0, midY, -halfD]} rotation={[Math.PI / 2, 0, 0]}>
        <Grid 
          args={[width, Math.abs(height)]} 
          cellColor="#00d4ff" 
          sectionColor="#0066aa" 
          cellThickness={0.5} 
          sectionThickness={1}
          fadeDistance={50}
        />
      </group>

      {/* Grid on the Left Wall (X = -halfW) */}
      <group position={[-halfW, midY, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <Grid 
          args={[depth, Math.abs(height)]} 
          cellColor="#00d4ff" 
          sectionColor="#0066aa" 
          cellThickness={0.5} 
          sectionThickness={1}
          fadeDistance={50}
        />
      </group>

      {/* Depth Labels (Example: 0m, -1000m, -2000m, etc.) */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const yPos = height * ratio;
        const depthVal = Math.round(5000 * ratio); // 5000m is max depth
        return (
          <Html key={`depth-label-${depthVal}`} position={[-halfW - 0.5, yPos, halfD + 0.5]} center className="pointer-events-none">
            <div className="text-[10px] text-cyan-400 font-mono tracking-wider opacity-70">
              {depthVal === 0 ? 'Surface' : `${depthVal}m`}
            </div>
          </Html>
        );
      })}
    </group>
  );
};
