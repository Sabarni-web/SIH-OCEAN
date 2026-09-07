import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { SCENE_DIMENSIONS, geoToWorld } from './utils/coordinates';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useOceanStore } from '../store/useOceanStore';

export const VolumetricBoundingBox: React.FC = () => {
  const { verticalExaggeration } = useAnalyticsStore();
  const { selectedRegion, viewBounds } = useOceanStore();
  const width = SCENE_DIMENSIONS.width;
  const depth = SCENE_DIMENSIONS.depth;
  const height = 8 * verticalExaggeration; // match bathymetry max depth roughly

  const latStep = (viewBounds.maxLat - viewBounds.minLat) / 4;
  const lats = [viewBounds.minLat, viewBounds.minLat + latStep, viewBounds.minLat + latStep*2, viewBounds.minLat + latStep*3, viewBounds.maxLat].map(Math.round);

  const lonStep = (viewBounds.maxLon - viewBounds.minLon) / 4;
  const lons = [viewBounds.minLon, viewBounds.minLon + lonStep, viewBounds.minLon + lonStep*2, viewBounds.minLon + lonStep*3, viewBounds.maxLon].map(Math.round);

  return (
    <group position={[0, -height / 2, 0]}>
      {/* Glassy Bounding Box Walls */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color="#0066ff"
          transparent
          opacity={0.15}
          roughness={0.1}
          transmission={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Grid Wireframe for Bounding Box (like the 3rd image) */}
      <mesh>
        <boxGeometry args={[width, height, depth, 4, 2, 4]} />
        <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.3} />
      </mesh>

      {/* Thicker Outline for Bounding Box */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.8} linewidth={3} />
      </lineSegments>
      
      {/* Gradient texture on the side faces simulating vertical profiles */}
      {/* This is a simple approximation for the sides using planes */}
      <mesh position={[0, 0, depth / 2]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#0288d1" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -depth / 2]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#0288d1" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshBasicMaterial color="#0288d1" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshBasicMaterial color="#0288d1" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Basin Labels moved from Landmass */}
      {selectedRegion === 'indian_ocean' && (
        <>
          <Html position={[geoToWorld(16, 65)[0], height / 2 + 0.5, geoToWorld(16, 65)[1]]} center className="pointer-events-none select-none">
            <div className="text-[12px] font-bold tracking-widest text-cyan-300 uppercase font-mono bg-black/60 px-2.5 py-1 rounded border border-cyan-500/40 backdrop-blur-md">
              Arabian Sea
            </div>
          </Html>
          <Html position={[geoToWorld(15, 88)[0], height / 2 + 0.5, geoToWorld(15, 88)[1]]} center className="pointer-events-none select-none">
            <div className="text-[12px] font-bold tracking-widest text-cyan-300 uppercase font-mono bg-black/60 px-2.5 py-1 rounded border border-cyan-500/40 backdrop-blur-md">
              Bay of Bengal
            </div>
          </Html>
        </>
      )}
      
      {/* Edge coordinate rulers for Lat/Lon */}
      {lats.map((lat) => {
        const [, z] = geoToWorld(lat, viewBounds.minLon, viewBounds);
        return (
          <Html key={`lat-${lat}`} position={[-width / 2, height / 2, z]} center className="pointer-events-none select-none">
            <span className="text-[10px] font-bold font-mono text-cyan-400">{lat > 0 ? `${lat}°N` : lat < 0 ? `${Math.abs(lat)}°S` : '0°EQ'}</span>
          </Html>
        );
      })}
      {lons.map((lon) => {
        const [x] = geoToWorld(viewBounds.minLat, lon, viewBounds);
        return (
          <Html key={`lon-${lon}`} position={[x, height / 2, depth / 2]} center className="pointer-events-none select-none">
            <span className="text-[10px] font-bold font-mono text-cyan-400">{lon > 180 ? `${360 - lon}°W` : lon < 0 ? `${Math.abs(lon)}°W` : `${lon}°E`}</span>
          </Html>
        );
      })}

      {/* Depth Indicators along the front-left vertical edge (matching 3rd image) */}
      {[0, 50, 200, 500, 1000, 2000, 3000, 4000, 5000].map((depthLevel) => {
        // approximate Y mapping (same logic as bathymetry mapping)
        const yPos = height / 2 - (depthLevel / 5000) * height;
        return (
          <Html key={`depth-${depthLevel}`} position={[-width / 2 - 0.5, yPos, depth / 2]} center className="pointer-events-none select-none">
            <div className="text-[10px] font-bold font-mono text-white whitespace-nowrap text-right pr-2">
              <span className={depthLevel === 250 ? "bg-blue-600/80 px-1 py-0.5 rounded" : ""}>
                {depthLevel}m
              </span>
            </div>
          </Html>
        );
      })}
    </group>
  );
};
