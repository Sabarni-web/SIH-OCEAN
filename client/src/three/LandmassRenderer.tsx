import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { geoToWorld, SCENE_DIMENSIONS } from './utils/coordinates';
import { useOceanStore } from '../store/useOceanStore';

// Helper to convert array of [lat, lon] coordinates into a THREE.Shape in world space (X, Z)
function createLandShape(points: [number, number][], bounds: any): THREE.Shape {
  const shape = new THREE.Shape();
  points.forEach(([lat, lon], idx) => {
    const [x, z] = geoToWorld(lat, lon, bounds);
    // In THREE.ExtrudeGeometry, shape is in 2D (x, y) which we later rotate onto (x, z)
    if (idx === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  return shape;
}

export const LandmassRenderer: React.FC = () => {
  const { selectedRegion, viewBounds } = useOceanStore();
  
  // 1. Indian Subcontinent Polygon
  const indiaShape = useMemo(() => {
    const coords: [number, number][] = [
      [24.0, 68.5], // Gujarat West
      [22.5, 69.5], // Gulf of Kutch
      [20.5, 72.8], // Gujarat South
      [19.0, 72.8], // Mumbai
      [15.5, 73.8], // Goa
      [12.9, 74.8], // Mangalore
      [9.5, 76.5],  // Kochi
      [8.08, 77.55],// Kanyakumari (Southern Tip)
      [9.3, 79.2],  // Rameswaram
      [13.0, 80.3], // Chennai
      [16.2, 81.5], // Krishna Delta
      [17.7, 83.3], // Visakhapatnam
      [19.8, 85.8], // Puri
      [21.8, 87.5], // Balasore
      [22.0, 89.0], // Sundarbans / Bengal
      [26.0, 89.5], // North East border
      [28.0, 77.0], // North India interior
      [24.0, 68.5], // Close
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  // 2. Sri Lanka Polygon
  const sriLankaShape = useMemo(() => {
    const coords: [number, number][] = [
      [9.8, 80.2],
      [8.5, 81.2],
      [6.9, 81.8],
      [5.9, 80.5],
      [7.0, 79.8],
      [8.5, 79.8],
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  // 3. Arabian Peninsula & Middle East Coastline
  const arabiaShape = useMemo(() => {
    const coords: [number, number][] = [
      [28.0, 48.0], // Persian Gulf NW
      [25.0, 56.5], // Strait of Hormuz
      [23.6, 58.5], // Muscat / Oman
      [20.0, 58.0], // Oman East
      [17.0, 54.5], // Salalah
      [12.6, 44.0], // Bab-el-Mandeb
      [15.0, 42.0], // Red Sea
      [28.0, 35.0], // North West Boundary
      [28.0, 48.0]
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  // 4. East Africa & Horn of Africa
  const africaShape = useMemo(() => {
    const coords: [number, number][] = [
      [12.0, 43.5], // Djibouti
      [11.8, 51.2], // Guardafui / Horn of Africa
      [8.0, 50.0],  // Somalia
      [2.0, 45.3],  // Mogadishu
      [-4.0, 39.6], // Mombasa
      [-6.8, 39.3], // Dar es Salaam
      [-15.0, 40.5],// Mozambique
      [-25.0, 33.0],// Maputo / South Boundary
      [-28.0, 30.0],
      [12.0, 30.0], // Interior
      [12.0, 43.5]
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  // 5. Madagascar
  const madagascarShape = useMemo(() => {
    const coords: [number, number][] = [
      [-12.0, 49.3],
      [-15.5, 50.5],
      [-25.0, 47.0],
      [-25.5, 45.0],
      [-16.0, 44.0],
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  // 6. Southeast Asia & Sumatra / Indonesia
  const seAsiaShape = useMemo(() => {
    const coords: [number, number][] = [
      [20.0, 93.0], // Myanmar / Arakan
      [16.0, 94.5], // Irrawaddy Delta
      [13.0, 98.2], // Tenasserim
      [8.0, 98.3],  // Phuket
      [3.0, 101.4], // Malacca
      [1.3, 103.8], // Singapore
      [-5.5, 105.8],// Sunda Strait
      [-8.5, 115.0],// Java / Bali
      [-8.5, 120.0],// East boundary
      [26.0, 120.0],// North East
      [26.0, 93.0], // Close
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  const australiaShape = useMemo(() => {
    const coords: [number, number][] = [
      [-12.0, 130.0], [-15.0, 145.0], [-25.0, 153.0], [-38.0, 150.0],
      [-35.0, 135.0], [-35.0, 115.0], [-22.0, 114.0], [-15.0, 125.0], [-12.0, 130.0]
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  const americasShape = useMemo(() => {
    const coords: [number, number][] = [
      [70.0, -160.0], [70.0, -50.0], [50.0, -50.0], [30.0, -80.0], [10.0, -75.0],
      [-5.0, -35.0], [-55.0, -65.0], [-55.0, -75.0], [-20.0, -70.0], [10.0, -85.0],
      [30.0, -115.0], [50.0, -130.0], [70.0, -160.0]
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  const antarcticaShape = useMemo(() => {
    const coords: [number, number][] = [
      [-70.0, -180.0], [-70.0, 180.0], [-90.0, 180.0], [-90.0, -180.0], [-70.0, -180.0]
    ];
    return createLandShape(coords, viewBounds);
  }, [viewBounds]);

  const extrudeSettings = {
    depth: 0.6, // Height of land above water
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08
  };

  const landMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0e1e2d',
    roughness: 0.85,
    metalness: 0.15,
    flatShading: true,
  }), []);

  const coastLineMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: '#00e5ff',
    linewidth: 1.5,
    transparent: true,
    opacity: 0.6
  }), []);

  const renderExtrudedMesh = (shape: THREE.Shape, key: string) => {
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return (
      <mesh 
        key={key} 
        geometry={geom} 
        material={landMaterial}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.05, 0]}
      />
    );
  };

  return (
    <group>
      {/* 3D Landmass Geometries - Only render for non-polar regions to prevent projection glitches */}
      {selectedRegion !== 'southern_ocean' && selectedRegion !== 'arctic_ocean' && (
        <>
          {renderExtrudedMesh(indiaShape, 'india')}
          {renderExtrudedMesh(sriLankaShape, 'srilanka')}
          {renderExtrudedMesh(arabiaShape, 'arabia')}
          {renderExtrudedMesh(africaShape, 'africa')}
          {renderExtrudedMesh(madagascarShape, 'madagascar')}
          {renderExtrudedMesh(seAsiaShape, 'seasia')}
          {renderExtrudedMesh(australiaShape, 'australia')}
        </>
      )}

      {selectedRegion === 'indian_ocean' && (
        <>
          {/* 3D Geographic Basin Labels (Floating in scene) */}
          <Html position={[geoToWorld(16, 65)[0], 0.2, geoToWorld(16, 65)[1]]} center className="pointer-events-none select-none">
            <div className="text-[11px] font-bold tracking-widest text-cyan-300/80 uppercase font-mono bg-black/40 px-2 py-0.5 rounded border border-cyan-500/20 backdrop-blur-xs">
              Arabian Sea
            </div>
          </Html>

          <Html position={[geoToWorld(15, 88)[0], 0.2, geoToWorld(15, 88)[1]]} center className="pointer-events-none select-none">
            <div className="text-[11px] font-bold tracking-widest text-cyan-300/80 uppercase font-mono bg-black/40 px-2 py-0.5 rounded border border-cyan-500/20 backdrop-blur-xs">
              Bay of Bengal
            </div>
          </Html>

          <Html position={[geoToWorld(22, 79)[0], 0.8, geoToWorld(22, 79)[1]]} center className="pointer-events-none select-none">
            <div className="text-[13px] font-black tracking-widest text-amber-400/90 uppercase font-mono">
              INDIA
            </div>
          </Html>

          <Html position={[geoToWorld(-10, 75)[0], 0.2, geoToWorld(-10, 75)[1]]} center className="pointer-events-none select-none">
            <div className="text-[11px] font-semibold tracking-widest text-blue-300/60 uppercase font-mono">
              Equatorial Indian Ocean
            </div>
          </Html>
        </>
      )}

      {selectedRegion === 'pacific_ocean' && (
        <Html position={[geoToWorld(0, 180)[0], 0.2, geoToWorld(0, 180)[1]]} center className="pointer-events-none select-none">
          <div className="text-[11px] font-bold tracking-widest text-cyan-300/80 uppercase font-mono bg-black/40 px-2 py-0.5 rounded border border-cyan-500/20 backdrop-blur-xs">
            Pacific Ocean
          </div>
        </Html>
      )}

      {selectedRegion === 'atlantic_ocean' && (
        <Html position={[geoToWorld(0, -30)[0], 0.2, geoToWorld(0, -30)[1]]} center className="pointer-events-none select-none">
          <div className="text-[11px] font-bold tracking-widest text-cyan-300/80 uppercase font-mono bg-black/40 px-2 py-0.5 rounded border border-cyan-500/20 backdrop-blur-xs">
            Atlantic Ocean
          </div>
        </Html>
      )}

      {selectedRegion === 'southern_ocean' && (
        <Html position={[geoToWorld(-65, 0)[0], 0.2, geoToWorld(-65, 0)[1]]} center className="pointer-events-none select-none">
          <div className="text-[11px] font-bold tracking-widest text-cyan-300/80 uppercase font-mono bg-black/40 px-2 py-0.5 rounded border border-cyan-500/20 backdrop-blur-xs">
            Southern Ocean
          </div>
        </Html>
      )}

      {selectedRegion === 'arctic_ocean' && (
        <Html position={[geoToWorld(80, 0)[0], 0.2, geoToWorld(80, 0)[1]]} center className="pointer-events-none select-none">
          <div className="text-[11px] font-bold tracking-widest text-cyan-300/80 uppercase font-mono bg-black/40 px-2 py-0.5 rounded border border-cyan-500/20 backdrop-blur-xs">
            Arctic Ocean
          </div>
        </Html>
      )}

      {/* Geographic Lat / Lon Coordinate Boundary Rulers */}
      {[
        viewBounds.minLat,
        viewBounds.minLat + (viewBounds.maxLat - viewBounds.minLat) * 0.25,
        viewBounds.minLat + (viewBounds.maxLat - viewBounds.minLat) * 0.5,
        viewBounds.minLat + (viewBounds.maxLat - viewBounds.minLat) * 0.75,
        viewBounds.maxLat
      ].map(Math.round).map((lat) => {
        const [, z] = geoToWorld(lat, viewBounds.minLon + (viewBounds.maxLon - viewBounds.minLon) * 0.1, viewBounds);
        return (
          <Html key={`lat-${lat}`} position={[-SCENE_DIMENSIONS.width / 2 - 0.8, 0.1, z]} center className="pointer-events-none select-none">
            <span className="text-[9px] font-mono text-cyan-400/70">{lat > 0 ? `${lat}°N` : lat < 0 ? `${Math.abs(lat)}°S` : '0°EQ'}</span>
          </Html>
        );
      })}

      {[
        viewBounds.minLon,
        viewBounds.minLon + (viewBounds.maxLon - viewBounds.minLon) * 0.25,
        viewBounds.minLon + (viewBounds.maxLon - viewBounds.minLon) * 0.5,
        viewBounds.minLon + (viewBounds.maxLon - viewBounds.minLon) * 0.75,
        viewBounds.maxLon
      ].map(Math.round).map((lon) => {
        const [x] = geoToWorld((viewBounds.minLat + viewBounds.maxLat) / 2, lon, viewBounds);
        return (
          <Html key={`lon-${lon}`} position={[x, 0.1, SCENE_DIMENSIONS.depth / 2 + 0.8]} center className="pointer-events-none select-none">
            <span className="text-[9px] font-mono text-cyan-400/70">{lon > 180 ? `${360 - lon}°W` : lon < 0 ? `${Math.abs(lon)}°W` : `${lon}°E`}</span>
          </Html>
        );
      })}
    </group>
  );
};
