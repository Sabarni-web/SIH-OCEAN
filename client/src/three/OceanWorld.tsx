import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

import { useOceanStore } from '../store/useOceanStore';
import { useObservationStore } from '../store/useObservationStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { ObservationSystem } from './ObservationSystem';
import { LandmassRenderer } from './LandmassRenderer';
import { VolumetricBoundingBox } from './VolumetricBoundingBox';
import { VerticalSection } from './VerticalSection';
import { Isosurface } from './Isosurface';
import { Bathymetry } from './Bathymetry';
import { VectorFieldRenderer } from './VectorFieldRenderer';
import { ParticleFlowRenderer } from './ParticleFlowRenderer';
import { DataProbeRenderer } from './DataProbeRenderer';
import { getVariableColor } from './colorScales';
import { OCEAN_VARIABLES } from '../data/variables';
import { useReplayStore } from '../store/useReplayStore';
import type { SSTGridPoint } from '../../../shared/types';
import { SCENE_DIMENSIONS, geoToWorld, depthToWorld } from './utils/coordinates';
import { VolumeBounds } from './VolumeBounds';

function interpolateSST(sstGrid: SSTGridPoint[], targetLat: number, targetLon: number): number {
  let weightedSum = 0;
  let weightTotal = 0;
  for (let j = 0; j < sstGrid.length; j++) {
    const node = sstGrid[j];
    const dLat = node.latitude - targetLat;
    const dLon = node.longitude - targetLon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < 0.04) return node.temperature;
    const weight = 1 / distSq;
    weightedSum += node.temperature * weight;
    weightTotal += weight;
  }
  return weightTotal > 0 ? weightedSum / weightTotal : 27.5;
}



const AlertMarkerItem: React.FC<{ alert: any }> = ({ alert }) => {
  const [hovered, setHovered] = useState(false);
  const [x, z] = geoToWorld(alert.location!.lat, alert.location!.lon);
  const position: [number, number, number] = [x, 0.4, z];
  const color = alert.severity === 'CRITICAL' ? '#ff3344' : '#ffaa00';

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.35, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>

      {hovered && (
        <Html position={[0, 0.6, 0]} center className="pointer-events-none z-50">
          <div className="bg-surfaceElevated/95 text-white text-xs p-2.5 rounded-lg whitespace-nowrap border border-red-500/60 shadow-xl backdrop-blur-md">
            <span className="font-bold uppercase tracking-wider text-red-400 block mb-0.5">{alert.severity} ALERT</span>
            <span className="text-textSecondary">{alert.message}</span>
            <span className="block text-[10px] text-primary/80 mt-1 font-mono">
              GPS: {alert.location.lat.toFixed(2)}°N, {alert.location.lon.toFixed(2)}°E
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};

const AlertMarkers = () => {
  const { alerts, fetchMonitoringData } = useMonitoringStore();
  const { anomalyEnabled } = useAnalyticsStore();

  useEffect(() => {
    if (anomalyEnabled) {
      fetchMonitoringData();
    }
  }, [anomalyEnabled, fetchMonitoringData]);

  if (!anomalyEnabled) return null;
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' && a.location);

  return (
    <group>
      {activeAlerts.map(alert => (
        <AlertMarkerItem key={alert.id} alert={alert} />
      ))}
    </group>
  );
};

// 3D Depth Slice Renderer (renders horizontal slice at selected depth)
const DepthSliceMesh = () => {
  const { selectedVariable, selectedDepth, selectedTime } = useOceanStore();
  const { verticalExaggeration } = useAnalyticsStore();
  const sizeWidth = SCENE_DIMENSIONS.width;
  const sizeDepth = SCENE_DIMENSIONS.depth;
  const yPos = depthToWorld(selectedDepth) * verticalExaggeration;

  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(sizeWidth, sizeDepth, 32, 32);
    const count = geom.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const pos = geom.attributes.position;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i); // planar Y maps to world Z

      // Realistic decay with depth
      let val = 28;
      if (selectedVariable === 'temperature') {
        const surf = 29 - Math.abs(z / sizeDepth) * 6;
        val = Math.max(2, surf * Math.exp(-selectedDepth / 600));
      } else if (selectedVariable === 'salinity') {
        val = x < 0 ? 36.2 : 33.0;
      } else if (selectedVariable === 'chlorophyll') {
        // Smooth organic distribution
        const dist = Math.sqrt(x * x + z * z);
        const coastalBoost = Math.max(0, (dist - 8) * 0.15);
        const organicSwirl = Math.sin(x * 0.4 + z * 0.3) * Math.cos(x * 0.2 - z * 0.5) * 0.8;
        const baseValue = 0.8 + coastalBoost + organicSwirl;
        val = Math.max(0.01, Math.min(5.0, baseValue * (selectedDepth < 200 ? (1 - selectedDepth / 200) : 0.05)));
      } else if (selectedVariable === 'dissolvedOxygen') {
        const latNorm = (z + sizeDepth / 2) / sizeDepth;
        // Stronger North-South gradient and dynamic surface patterns (upwelling, currents)
        const surfaceO2 = 210 + (0.5 - latNorm) * 90;
        const surfaceVariations = Math.sin(x * 0.4 + z * 0.3) * 30 + Math.cos(x * 0.2 - z * 0.5) * 20;

        let omzFactor = 1.0;
        // Start OMZ impact from 50m to make it highly visible
        if (selectedDepth > 50 && selectedDepth < 1500) {
          // Arabian Sea OMZ (North-West) - enlarged radius
          const arabianOMZ = (x < 2 && z > -2) ? Math.max(0, 1 - Math.sqrt((x + 6) * (x + 6) + (z - 6) * (z - 6)) * 0.08) : 0;
          // Bay of Bengal OMZ (North-East)
          const bengalOMZ = (x > 2 && z > 0) ? Math.max(0, 1 - Math.sqrt((x - 6) * (x - 6) + (z - 4) * (z - 4)) * 0.12) * 0.7 : 0;

          const depthIntensity = Math.max(0, 1 - Math.abs(selectedDepth - 400) / 400);
          omzFactor = 1.0 - (arabianOMZ + bengalOMZ) * depthIntensity * 0.95;
        } else if (selectedDepth >= 1500) {
          omzFactor = 0.5 + Math.min(0.4, (selectedDepth - 1500) * 0.00015); // Deep recovery
        }
      } else if (selectedVariable === 'currentVelocity') {
        const latNorm = (z + sizeDepth / 2) / sizeDepth;
        val = 0.25 + Math.abs(Math.sin(x * 0.3 + z * 0.3)) * 0.9 + Math.cos(latNorm * 3) * 0.25;
      } else if (selectedVariable === 'currentDirection') {
        const latNorm = (z + sizeDepth / 2) / sizeDepth;
        const u = Math.cos(x * 0.3 + z * 0.3);
        const v = Math.sin(latNorm * 3);
        val = (Math.atan2(v, u) * (180 / Math.PI) + 360) % 360;
      }

      const color = getVariableColor(selectedVariable, val);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [selectedVariable, selectedDepth, selectedTime, sizeWidth, sizeDepth]);

  return (
    <group position={[0, yPos, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.3} transparent opacity={0.88} />
      </mesh>
      {/* Slice Depth Indicator Wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(sizeWidth, sizeDepth)]} />
        <lineBasicMaterial color="#00e5ff" linewidth={2} />
      </lineSegments>
    </group>
  );
};

const OceanDataMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedVariable, layers, selectedTime, selectedDepth } = useOceanStore();
  const { verticalExaggeration, bathymetryEnabled, gridEnabled } = useAnalyticsStore();

  const resolution = 64;
  const sizeWidth = SCENE_DIMENSIONS.width;
  const sizeDepth = SCENE_DIMENSIONS.depth;

  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(sizeWidth, sizeDepth, resolution, resolution);
    const count = geom.attributes.position.count;
    geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return geom;
  }, [sizeWidth, sizeDepth]);

  const { replayMode, currentFrameIndex, replayFrames } = useReplayStore();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const geom = meshRef.current.geometry as THREE.BufferGeometry;
      const pos = geom.attributes.position;
      const colors = geom.attributes.color;
      const replayOffset = replayMode ? currentFrameIndex * 0.4 : 0;
      const t = clock.getElapsedTime() * 0.5 + (selectedTime + replayOffset) * 0.3;

      const activeSST = (replayMode && replayFrames[currentFrameIndex]?.sst) || null;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);

        // Multi-frequency dynamic ocean wave displacement
        const primaryWave = Math.sin(x * 0.35 + t * 1.2) * Math.cos(y * 0.35 + t * 0.9) * 0.22;
        const secondaryRipples = Math.sin((x + y) * 0.6 + t * 1.6) * 0.10;
        pos.setZ(i, primaryWave + secondaryRipples);

        // Normalize geographical space across requested bounds
        const latNorm = (y + sizeDepth / 2) / sizeDepth; // 0 = South, 1 = North
        const lonNorm = (x + sizeWidth / 2) / sizeWidth; // 0 = West, 1 = East

        let val = 26;
        if (selectedVariable === 'temperature') {
          if (activeSST && activeSST.length > 0) {
            // Real satellite Sea Surface Temperature interpolated from API
            const b = useOceanStore.getState().viewBounds;
            const latRange = b.maxLat - b.minLat;
            const lonRange = b.maxLon - b.minLon;
            
            const geoLat = b.minLat + latNorm * latRange;
            const geoLon = b.minLon + lonNorm * lonRange;
            
            const realTemp = interpolateSST(activeSST, geoLat, geoLon);
            // Apply vertical depth decay if depth slider is moved
            val = Math.max(1.5, realTemp - (selectedDepth / 1600) * (realTemp - 1.5));
          } else {
            // Baseline Indian Ocean Warm Pool thermal model for live view
            const tropicalWarmth = Math.sin(latNorm * Math.PI * 0.85) * 20 + 9;
            const warmPoolCore = (lonNorm > 0.45 && latNorm > 0.35) ? 2.5 : 0;
            const thermalRipples = Math.sin(x * 0.3 + t * 0.7) * Math.cos(y * 0.25 + t * 0.5) * 1.6;

            const surfaceTemp = tropicalWarmth + warmPoolCore + thermalRipples;
            val = Math.max(1.5, surfaceTemp - (selectedDepth / 1600) * (surfaceTemp - 1.5));
          }
        } else if (selectedVariable === 'salinity') {
          // Arabian Sea (high salinity 36.5) vs Bay of Bengal (monsoon river runoff 32.5)
          const baseSal = x < 0 ? 36.5 : 32.8;
          val = baseSal + Math.sin(x * 0.4 + t * 0.6) * 0.4;
        } else if (selectedVariable === 'currentVelocity') {
          // Flow velocity in m/s with gyre circulation
          val = 0.25 + Math.abs(Math.sin(x * 0.3 + y * 0.3 + t)) * 0.9 + Math.cos(latNorm * 3 + t) * 0.25;
        } else if (selectedVariable === 'currentDirection') {
          // Calculate angle based on the u and v components of the current
          const u = Math.cos(x * 0.3 + y * 0.3 + t);
          const v = Math.sin(latNorm * 3 + t);
          // atan2 returns radians from -PI to PI. Convert to 0-360 degrees.
          val = (Math.atan2(v, u) * (180 / Math.PI) + 360) % 360;
        } else if (selectedVariable === 'chlorophyll') {
          // Smooth organic bloom simulation
          const dist = Math.sqrt(x * x + y * y);
          const coastalBoost = Math.max(0, (dist - 8) * 0.15);
          const organicSwirl = Math.sin(x * 0.4 + y * 0.3 + t * 0.5) * Math.cos(x * 0.2 - y * 0.5 + t * 0.3) * 0.8;
          const baseValue = 0.8 + coastalBoost + organicSwirl;
          val = Math.max(0.01, Math.min(5.0, baseValue * (selectedDepth < 200 ? (1 - selectedDepth / 200) : 0.05)));
        } else if (selectedVariable === 'dissolvedOxygen') {
          // Stronger North-South gradient and dynamic surface patterns
          const surfaceO2 = 210 + (0.5 - latNorm) * 90;
          const surfaceVariations = Math.sin(x * 0.4 + y * 0.3 + t * 0.5) * 30 + Math.cos(x * 0.2 - y * 0.5 + t * 0.3) * 20;

          let omzFactor = 1.0;
          if (selectedDepth > 50 && selectedDepth < 1500) {
            const arabianOMZ = (x < 2 && y > -2) ? Math.max(0, 1 - Math.sqrt((x + 6) * (x + 6) + (y - 6) * (y - 6)) * 0.08) : 0;
            const bengalOMZ = (x > 2 && y > 0) ? Math.max(0, 1 - Math.sqrt((x - 6) * (x - 6) + (y - 4) * (y - 4)) * 0.12) * 0.7 : 0;
            const depthIntensity = Math.max(0, 1 - Math.abs(selectedDepth - 400) / 400);
            omzFactor = 1.0 - (arabianOMZ + bengalOMZ) * depthIntensity * 0.95;
          } else if (selectedDepth >= 1500) {
            omzFactor = 0.5 + Math.min(0.4, (selectedDepth - 1500) * 0.00015); // Deep recovery
          }
          val = (surfaceO2 + surfaceVariations) * omzFactor;
        }

        const color = getVariableColor(selectedVariable, val);
        colors.setXYZ(i, color.r, color.g, color.b);
      }

      pos.needsUpdate = true;
      colors.needsUpdate = true;
      geom.computeVertexNormals();
    }
  });

  const { selectObservation } = useObservationStore();

  return (
    <group>
      {layers.model && (
        <mesh
          ref={meshRef}
          geometry={geometry}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onClick={() => selectObservation(null)}
        >
          <meshStandardMaterial
            vertexColors
            roughness={0.25}
            metalness={0.15}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
          />
        </mesh>
      )}

      {/* Seafloor bathymetry grid */}
      {bathymetryEnabled && (
        <mesh position={[0, -8 * verticalExaggeration, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[sizeWidth, sizeDepth, 15, 15]} />
          <meshStandardMaterial color="#011627" wireframe={true} transparent opacity={0.5} />
        </mesh>
      )}

      {gridEnabled && (
        <VolumeBounds />
      )}

      <AlertMarkers />
    </group>
  );
};

export const OceanWorld: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { visualizationMode } = useOceanStore();
  const { isosurfaceEnabled } = useAnalyticsStore();

  useEffect(() => {
    const handleReset = () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        camera.position.set(0, 18, 22);
        camera.lookAt(0, 0, 0);
      }
    };
    window.addEventListener('reset-camera', handleReset);
    return () => window.removeEventListener('reset-camera', handleReset);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[15, 30, 15]} intensity={2.0} color="#ffffff" castShadow />
      <directionalLight position={[-15, -15, -15]} intensity={0.8} color="#00e5ff" />

      {/* 3D Indian Ocean Landmasses, Coastlines, and Geo Labels */}
      <LandmassRenderer />

      {/* Tab 1: 3D Ocean Surface & Basin Field */}
      {visualizationMode === '3d' && <OceanDataMesh />}

      {/* Volumetric Bounding Box for Cutout Effect */}
      <VolumetricBoundingBox />

      {/* Tab 2: Depth Slices View */}
      {visualizationMode === 'slices' && <DepthSliceMesh />}

      {/* Tab 3: Vertical Transect Section Curtain */}
      {visualizationMode === 'vertical' && <VerticalSection />}

      {/* Tab 4: 3D Isosurface Boundary */}
      {(visualizationMode === 'iso' || isosurfaceEnabled) && <Isosurface />}

      {/* 3D Seafloor Bathymetry Terrain */}
      <Bathymetry />

      {/* 3D Dynamic Current Vector Field Grid */}
      <VectorFieldRenderer />

      {/* 3D Flowing Particle Streamline Simulation */}
      <ParticleFlowRenderer />

      {/* Interactive 3D Cursor Data Probe HUD */}
      <DataProbeRenderer />

      {/* In-Situ Observation System (Argo Floats, Moorings, Gliders, CTD, BGC) */}
      <ObservationSystem />

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={3}
        maxDistance={60}
        target={[0, 0, 0]}
      />
      <Environment preset="night" />
    </>
  );
};
