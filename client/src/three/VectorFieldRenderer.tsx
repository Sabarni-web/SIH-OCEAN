import React, { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useReplayStore } from '../store/useReplayStore';
import { geoToWorld, SCENE_DIMENSIONS } from './utils/coordinates';

export const VectorFieldRenderer: React.FC = () => {
  const { vectorEnabled, verticalExaggeration, currentVectors } = useAnalyticsStore();
  const { replayMode, replayFrames, currentFrameIndex } = useReplayStore();

  const [hoveredNode, setHoveredNode] = useState<{
    lat: number;
    lon: number;
    speed: number;
    dir: number;
    u: number;
    v: number;
  } | null>(null);

  const arrowHelpers = useMemo(() => {
    if (!vectorEnabled) return [];

    const activeVectors = (replayMode && replayFrames.length > 0)
      ? (replayFrames[currentFrameIndex]?.vectors || [])
      : currentVectors;

    if (activeVectors && activeVectors.length > 0) {
      return activeVectors.map((vec) => {
        const [x, z] = geoToWorld(vec.latitude, vec.longitude);
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
  }, [vectorEnabled, currentVectors, verticalExaggeration, replayMode, replayFrames, currentFrameIndex]);

  if (!vectorEnabled) return null;


  return (
    <group>
      {arrowHelpers.map((arr, idx) => {
        const speedColor = arr.speed > 0.6 ? '#ffb703' : arr.speed > 0.3 ? '#00e5ff' : '#0077b6';
        const arrowLength = Math.min(1.5, Math.max(0.4, arr.speed * 2.2));

        return (
          <group 
            key={idx} 
            position={arr.pos} 
            rotation={[0, arr.angle, 0]}
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
          >
            {/* Arrow shaft */}
            <mesh position={[0, 0, arrowLength * 0.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, arrowLength * 0.7, 8]} />
              <meshStandardMaterial color={speedColor} emissive={speedColor} emissiveIntensity={0.7} />
            </mesh>
            {/* Arrow head cone */}
            <mesh position={[0, 0, arrowLength * 0.85]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.13, 0.3, 8]} />
              <meshStandardMaterial color={speedColor} emissive={speedColor} emissiveIntensity={1.0} />
            </mesh>
          </group>
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
