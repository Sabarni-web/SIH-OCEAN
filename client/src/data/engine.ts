
import { OCEAN_VARIABLES } from './variables';

// Define the mock spatial grid bounds for Indian Ocean
export const GRID_CONFIG = {
  minLat: -30,
  maxLat: 30,
  minLon: 40,
  maxLon: 110,
  latResolution: 2, // degrees
  lonResolution: 2,
};

// Generate latitude and longitude arrays
export const lats = Array.from(
  { length: Math.floor((GRID_CONFIG.maxLat - GRID_CONFIG.minLat) / GRID_CONFIG.latResolution) + 1 },
  (_, i) => GRID_CONFIG.minLat + i * GRID_CONFIG.latResolution
);

export const lons = Array.from(
  { length: Math.floor((GRID_CONFIG.maxLon - GRID_CONFIG.minLon) / GRID_CONFIG.lonResolution) + 1 },
  (_, i) => GRID_CONFIG.minLon + i * GRID_CONFIG.lonResolution
);

// Procedural data generation with caching
const dataCache = new Map<string, any>();

function noise(x: number, y: number, z: number, t: number) {
  // A simple deterministic pseudo-noise function
  return Math.sin(x * 0.1 + t) * Math.cos(y * 0.1 + z * 0.05) + 
         Math.sin(y * 0.2 - t) * Math.cos(x * 0.15);
}

import { datasetService } from '../services/api';
import { useOceanStore } from '../store/useOceanStore';

export const getGridData = async (params: {
  variableId: string;
  depth: number;
  timeIndex: number;
}) => {
  const { dataMode, activeDatasetId } = useOceanStore.getState();

  const cacheKey = `${dataMode}_${activeDatasetId}_${params.variableId}_${params.depth}_${params.timeIndex}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }

  // --- API MODE ---
  if (dataMode === 'api' && activeDatasetId) {
    try {
      // timeIndex mapped back to a date string for API
      const isoTime = new Date(Date.now() + params.timeIndex * 86400000).toISOString();
      const response = await datasetService.getOceanField(activeDatasetId, params.variableId, params.depth, isoTime);
      
      dataCache.set(cacheKey, response.values);
      return response.values;
    } catch (e) {
      console.warn("API Error, falling back to Demo Data:", e);
    }
  }

  // --- DEMO MODE FALLBACK ---
  const variable = OCEAN_VARIABLES[params.variableId];
  if (!variable) throw new Error(`Variable ${params.variableId} not found`);

  const gridData = [];

  for (let lat of lats) {
    for (let lon of lons) {
      let val = 0;
      let u = 0;
      let v = 0;
      const t = params.timeIndex;
      const d = variable.depthDependent ? params.depth : 0;
      
      const n = noise(lat, lon, d, t);
      
      if (params.variableId === 'temperature') {
        const equatorDist = Math.abs(lat) / 30;
        const baseTemp = 30 - (equatorDist * 10);
        const depthDecay = Math.max(0, 1 - (d / 2000));
        val = (baseTemp * depthDecay) + (n * 2);
      } 
      else if (params.variableId === 'salinity') {
        val = 35 + (n * 1.5) - (d / 4000);
      }
      else if (params.variableId === 'chlorophyll') {
        const depthFactor = d > 200 ? 0 : 1 - (d/200);
        val = Math.max(0, (1 + n * 2) * depthFactor);
      }
      else if (params.variableId === 'dissolvedOxygen') {
        val = 200 - (d / 20) + (n * 20);
        val = Math.max(10, val);
      }
      else if (params.variableId === 'mixedLayerDepth') {
        val = 50 + (n * 30) + (Math.abs(lat) * 2);
      }
      else if (params.variableId === 'currentVelocity' || params.variableId === 'currentDirection') {
        u = Math.sin(lat * 0.1 + t) * Math.cos(lon * 0.1 - d*0.001);
        v = Math.cos(lat * 0.1 - t) * Math.sin(lon * 0.1 + d*0.001);
        
        if (params.variableId === 'currentVelocity') {
          val = Math.sqrt(u*u + v*v);
        } else {
          let dir = Math.atan2(v, u) * (180 / Math.PI);
          if (dir < 0) dir += 360;
          val = dir;
        }
      }

      if (params.variableId !== 'currentVelocity' && params.variableId !== 'currentDirection') {
        val = Math.max(variable.min, Math.min(variable.max, val));
      }

      gridData.push({ lat, lon, depth: d, value: val, u, v });
    }
  }

  dataCache.set(cacheKey, gridData);
  return gridData;
};
