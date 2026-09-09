import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useOceanStore } from '../store/useOceanStore';
import { useReplayStore } from '../store/useReplayStore';
import { geoToWorld, SCENE_DIMENSIONS } from './utils/coordinates';

const AnimatedArrow: React.FC<{
  arr: any;
  speedColor: string;
  arrowLength: number;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ arr, speedColor, arrowLength, onPointerOver, onPointerOut }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tailMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const headMatRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      // Calculate a phase based on initial position to desynchronize the arrows
      const phase = Math.abs(arr.pos[0] * 13.3 + arr.pos[2] * 7.7);
      
      // Move forward continuously and loop every 4 units of distance
      const distance = 4.0;
      const rawOffset = (t * arr.speed * 2.0 + phase);
      const offset = rawOffset % distance;
      
      // Apply offset to position based on angle
      const dx = Math.sin(arr.angle) * offset;
      const dz = Math.cos(arr.angle) * offset;
      
      groupRef.current.position.set(arr.pos[0] + dx, arr.pos[1], arr.pos[2] + dz);
      
      // Fade in and out at the edges of the loop for smooth resetting
      let opacity = 1;
      if (offset < 0.5) opacity = offset / 0.5;
      else if (offset > distance - 0.5) opacity = (distance - offset) / 0.5;
      
      if (tailMatRef.current) tailMatRef.current.opacity = opacity * 0.8;
      if (headMatRef.current) headMatRef.current.opacity = opacity;
    }
  });

  return (
    <group 
      ref={groupRef}
      position={arr.pos} 
      rotation={[0, arr.angle, 0]}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Sleek Arrow shaft/tail */}
      <mesh position={[0, 0, arrowLength * 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.04, arrowLength * 0.8, 8]} />
        <meshStandardMaterial 
          ref={tailMatRef}
          color="#ffffff" 
          emissive={speedColor} 
          emissiveIntensity={1.2} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      {/* Pronounced Arrow head */}
      <mesh position={[0, 0, arrowLength * 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.35, 12]} />
        <meshStandardMaterial 
          ref={headMatRef}
          color="#ffffff" 
          emissive={speedColor} 
          emissiveIntensity={1.8}
          transparent
        />
      </mesh>
    </group>
  );
};

export const VectorFieldRenderer: React.FC = () => {
  const { verticalExaggeration, currentVectors, fetchCurrentVectors, vectorEnabled } = useAnalyticsStore();
  const { layers } = useOceanStore();
  const { replayMode, replayFrames, currentFrameIndex } = useReplayStore();

  const showVectors = layers.currents || vectorEnabled;

  useEffect(() => {
    if (showVectors && currentVectors.length === 0) {
      fetchCurrentVectors();
    }
  }, [showVectors, currentVectors.length, fetchCurrentVectors]);

  const [hoveredNode, setHoveredNode] = useState<{
    lat: number;
    lon: number;
    speed: number;
    dir: number;
    u: number;
    v: number;
  } | null>(null);

  const arrowHelpers = useMemo(() => {
    if (!showVectors) return [];

    const activeVectors = (replayMode && replayFrames.length > 0)
      ? (replayFrames[currentFrameIndex]?.vectors || [])
      : currentVectors;

    const b = useOceanStore.getState().viewBounds;
    if (activeVectors && activeVectors.length > 0) {
      return activeVectors.map((vec) => {
        const [x, z] = geoToWorld(vec.latitude, vec.longitude, b);
        const rad = (vec.direction * Math.PI) / 180;
        const u = vec.u ?? (vec.speed * Math.sin(rad));
        const v = vec.v ?? (vec.speed * Math.cos(rad));
        const speed = vec.speed || Math.sqrt(u * u + v * v) || 0.3;

        // In Three.js: East is +x, North is -z
        const angle = Math.atan2(u, -v);

        return {
          pos: [x, 0.45 * verticalExaggeration, z] as [number, number, number],
          angle,
          speed,
          dir: vec.direction,
          lat: vec.latitude,
          lon: vec.longitude,
          u,
          v
        };
      });
    }

    // Grid fallback if API is loading
    const arrows = [];
    const step = 2.4;
    const halfW = SCENE_DIMENSIONS.width / 2;
    const halfD = SCENE_DIMENSIONS.depth / 2;

    for (let x = -halfW + 1.2; x <= halfW - 1.2; x += step) {
      for (let z = -halfD + 1.2; z <= halfD - 1.2; z += step) {
        arrows.push({
          pos: [x, 0.45 * verticalExaggeration, z] as [number, number, number],
          angle: 0.8,
          speed: 0.45,
          dir: 45,
          lat: 10,
          lon: 70,
          u: 0.3,
          v: 0.3
        });
      }
    }
    return arrows;
  }, [showVectors, currentVectors, verticalExaggeration, replayMode, replayFrames, currentFrameIndex]);

  if (!showVectors) return null;


  return (
    <group>
      {arrowHelpers.map((arr, idx) => {
        const speedColor = arr.speed > 0.6 ? '#ffb703' : arr.speed > 0.3 ? '#00e5ff' : '#0077b6';
        const arrowLength = Math.min(1.5, Math.max(0.4, arr.speed * 2.2));

        return (
          <AnimatedArrow
            key={idx}
            arr={arr}
            speedColor={speedColor}
            arrowLength={arrowLength}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNode({
                lat: arr.lat,
                lon: arr.lon,
                speed: arr.speed,
                dir: arr.dir,
                u: arr.u,
                v: arr.v
              });
            }}
            onPointerOut={() => setHoveredNode(null)}
          />
        );
      })}

      {/* Floating vector telemetry tooltip */}
      {hoveredNode && (
        <Html 
          position={geoToWorld(hoveredNode.lat, hoveredNode.lon).concat([0.9]) as any} 
          center 
          className="pointer-events-none z-50"
        >
          <div className="bg-surfaceElevated/95 border border-cyan-400/60 text-white p-2.5 rounded-lg text-xs shadow-2xl backdrop-blur-md whitespace-nowrap">
            <div className="flex items-center justify-between gap-2 border-b border-cyan-400/30 pb-1 mb-1">
              <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">🌊 REAL CURRENT VECTOR</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded font-semibold">COPERNICUS</span>
            </div>
            <p className="font-mono text-[11px]">GPS: {hoveredNode.lat.toFixed(1)}°N, {hoveredNode.lon.toFixed(1)}°E</p>
            <p className="text-textSecondary text-[11px]">Speed: <span className="text-amber-300 font-bold">{hoveredNode.speed.toFixed(2)} m/s ({(hoveredNode.speed * 3.6).toFixed(1)} km/h)</span></p>
            <p className="text-textSecondary text-[11px]">Direction: <span className="text-cyan-300 font-bold">{hoveredNode.dir}°</span> (u: {hoveredNode.u.toFixed(2)}, v: {hoveredNode.v.toFixed(2)})</p>
          </div>
        </Html>
      )}
    </group>
  );
};
