import { REGIONS } from '../../../../shared/constants/index';

// We map the Indian Ocean Region to a 3D coordinate system.
// X = Longitude, Z = Latitude, Y = Depth
// We'll normalize the horizontal scale to a 30x30 unit area approximately.

const LON_RANGE = REGIONS.INDIAN_OCEAN.maxLon - REGIONS.INDIAN_OCEAN.minLon;
const LAT_RANGE = REGIONS.INDIAN_OCEAN.maxLat - REGIONS.INDIAN_OCEAN.minLat;
const SCENE_WIDTH = 30; // X axis
const SCENE_DEPTH = 30; // Z axis

// Y scale depends on vertical exaggeration, but base scale maps 5000m to -10 units
const MAX_DEPTH = REGIONS.INDIAN_OCEAN.maxDepth;
const BASE_Y_SCALE = -10 / MAX_DEPTH;

export const geoToWorld = (lat: number, lon: number, bounds?: { minLat: number; maxLat: number; minLon: number; maxLon: number }): [number, number] => {
  const b = bounds || { 
    minLat: REGIONS.INDIAN_OCEAN.minLat, 
    maxLat: REGIONS.INDIAN_OCEAN.maxLat, 
    minLon: REGIONS.INDIAN_OCEAN.minLon, 
    maxLon: REGIONS.INDIAN_OCEAN.maxLon 
  };
  
  const midLon = (b.maxLon + b.minLon) / 2;
  const midLat = (b.maxLat + b.minLat) / 2;
  const lonRange = b.maxLon - b.minLon;
  const latRange = b.maxLat - b.minLat;
  
  const x = ((lon - midLon) / lonRange) * SCENE_WIDTH;
  const z = -((lat - midLat) / latRange) * SCENE_DEPTH; 
  
  return [x, z];
};

export const depthToWorld = (depth: number, verticalExaggeration: number = 1): number => {
  return depth * BASE_Y_SCALE * verticalExaggeration;
};

export const worldToGeo = (x: number, z: number, bounds?: { minLat: number; maxLat: number; minLon: number; maxLon: number }): [number, number] => {
  const b = bounds || { 
    minLat: REGIONS.INDIAN_OCEAN.minLat, 
    maxLat: REGIONS.INDIAN_OCEAN.maxLat, 
    minLon: REGIONS.INDIAN_OCEAN.minLon, 
    maxLon: REGIONS.INDIAN_OCEAN.maxLon 
  };

  const midLon = (b.maxLon + b.minLon) / 2;
  const midLat = (b.maxLat + b.minLat) / 2;
  const lonRange = b.maxLon - b.minLon;
  const latRange = b.maxLat - b.minLat;

  const lon = (x / SCENE_WIDTH) * lonRange + midLon;
  const lat = -(z / SCENE_DEPTH) * latRange + midLat;

  return [lat, lon];
};

export const worldToDepth = (y: number, verticalExaggeration: number = 1): number => {
  return y / (BASE_Y_SCALE * verticalExaggeration);
};

export const SCENE_DIMENSIONS = {
  width: SCENE_WIDTH,
  depth: SCENE_DEPTH,
  baseDepth: -10
};
