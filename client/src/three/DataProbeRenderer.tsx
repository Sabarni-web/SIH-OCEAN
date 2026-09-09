import React, { useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useOceanStore } from '../store/useOceanStore';
import { SCENE_DIMENSIONS, worldToGeo } from './utils/coordinates';

export const DataProbeRenderer: React.FC = () => {
  const { probeEnabled } = useAnalyticsStore();
  const { selectedVariable, selectedDepth, selectedTime } = useOceanStore();
  const [probePos, setProbePos] = useState<[number, number, number] | null>(null);
  const [probeData, setProbeData] = useState<{
    lat: number;
    lon: number;
    temp: number;
    sal: number;
    curr: number;
    depth: number;
    basin: string;
  } | null>(null);

  const { raycaster, mouse, camera } = useThree();
  const hitPlane = React.useMemo(() => {
    return new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  }, []);
  const hitPoint = React.useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!probeEnabled) {
      if (probePos !== null) setProbePos(null);
      return;
    }

    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.ray.intersectPlane(hitPlane, hitPoint);

    if (hit) {
      const halfW = SCENE_DIMENSIONS.width / 2;
      const halfD = SCENE_DIMENSIONS.depth / 2;

      if (Math.abs(hit.x) <= halfW && Math.abs(hit.z) <= halfD) {
        setProbePos([hit.x, 0.45, hit.z]);
        const [lat, lon] = worldToGeo(hit.x, hit.z);

        const latNorm = (-hit.z + halfD) / SCENE_DIMENSIONS.depth;
        const b = useOceanStore.getState().viewBounds;
        const minLat = Number(b.minLat);
        const maxLat = Number(b.maxLat);
        const actualLat = minLat + latNorm * (maxLat - minLat);
        const tempBase = 32 - Math.pow(Math.abs(actualLat) / 60, 2) * 32;
        const tempVal = Math.max(-2.0, tempBase - (selectedDepth / 1600) * (tempBase + 2.0));
        const salVal = hit.x < 0 ? 36.5 : 32.8;
        const currVal = 0.35 + Math.abs(Math.sin(hit.x * 0.3 + hit.z * 0.3 + selectedTime * 0.2)) * 0.85;

        let basin = 'Central Indian Ocean';
        if (lat > 5 && lon < 77) basin = 'Arabian Sea';
        else if (lat > 5 && lon >= 77) basin = 'Bay of Bengal';
        else if (lat >= -5 && lat <= 5) basin = 'Equatorial Indian Ocean';
        else if (lat < -15) basin = 'South Indian Ocean';

        setProbeData({
          lat,
          lon,
          temp: tempVal,
          sal: salVal,
          curr: currVal,
          depth: selectedDepth,
          basin
        });
      } else {
        setProbePos(null);
      }
    }
  });

  if (!probeEnabled || !probePos || !probeData) return null;

  return (
    <group position={probePos}>
      {/* Reticle targeting ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.45, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner beacon point */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} />
      </mesh>

      {/* Floating 3D Data Probe Telemetry HUD */}
      <Html position={[0, 0.8, 0]} center className="pointer-events-none z-50">
        <div className="bg-surfaceElevated/95 border border-cyan-400/70 text-white p-2.5 rounded-lg text-xs shadow-2xl backdrop-blur-md whitespace-nowrap">
          <div className="flex items-center justify-between gap-3 border-b border-cyan-400/40 pb-1 mb-1.5">
            <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">🎯 DATA PROBE</span>
            <span className="text-[10px] text-textSecondary font-medium">{probeData.basin}</span>
          </div>
          <p className="font-mono text-[11px] text-white">
            GPS: <span className="font-bold text-cyan-200">{probeData.lat.toFixed(2)}°N, {probeData.lon.toFixed(2)}°E</span>
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1 text-[11px]">
            <p className="text-textSecondary">Depth: <span className="text-white font-bold">{probeData.depth} m</span></p>
            <p className="text-textSecondary">Temp: <span className="text-amber-300 font-bold">{probeData.temp.toFixed(1)}°C</span></p>
            <p className="text-textSecondary">Salinity: <span className="text-emerald-300 font-bold">{probeData.sal.toFixed(1)} PSU</span></p>
            <p className="text-textSecondary">Current: <span className="text-blue-300 font-bold">{probeData.curr.toFixed(2)} m/s</span></p>
          </div>
        </div>
      </Html>
    </group>
  );
};
