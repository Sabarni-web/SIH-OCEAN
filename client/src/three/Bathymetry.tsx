import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SCENE_DIMENSIONS, depthToWorld } from './utils/coordinates';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

export const Bathymetry: React.FC = () => {
  const { bathymetryEnabled, verticalExaggeration } = useAnalyticsStore();

  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(SCENE_DIMENSIONS.width, SCENE_DIMENSIONS.depth, 64, 64);
    const count = geom.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const pos = geom.attributes.position;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // maps to world Z

      // Procedural Indian Ocean bathymetry:
      // Continental shelves along coasts, deep central basin (4000m),
      // Mid-ocean ridge (Carlsberg / Central Indian Ridge) elevating to 2200m depth
      const distFromCenter = Math.sqrt(x * x + y * y);
      let depthMeters = 3800 + Math.sin(x * 0.4) * 600 + Math.cos(y * 0.4) * 600;

      // Ridge feature across northwest to southeast
      const ridgeDist = Math.abs(x * 0.8 - y * 0.6);
      if (ridgeDist < 3.5) {
        depthMeters -= (3.5 - ridgeDist) * 500; // Ridge rises ~1500m
      }

      // Coastal shelf rise
      if (distFromCenter > 11) {
        depthMeters = Math.max(150, depthMeters - (distFromCenter - 11) * 700);
      }

      depthMeters = Math.min(Math.max(depthMeters, 100), 5000);
      const worldY = depthToWorld(depthMeters) * verticalExaggeration;

      pos.setZ(i, worldY);

      // Color mapping: shallow coastal shelf (cyan/teal) to deep abyssal plains (navy/midnight)
      const depthRatio = depthMeters / 5000;
      colors[i * 3] = 0.02 + (1 - depthRatio) * 0.15;     // R
      colors[i * 3 + 1] = 0.08 + (1 - depthRatio) * 0.45; // G
      colors[i * 3 + 2] = 0.22 + (1 - depthRatio) * 0.45; // B
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return geom;
  }, [verticalExaggeration]);

  if (!bathymetryEnabled) return null;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* 3D Shaded Seabed Terrain */}
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          vertexColors 
          roughness={0.85} 
          metalness={0.15} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* Bathymetric depth contour wireframe */}
      <mesh geometry={geometry} position={[0, 0, 0.02]}>
        <meshBasicMaterial color="#00ffff" wireframe={true} transparent opacity={0.15} />
      </mesh>
    </group>
  );
};
