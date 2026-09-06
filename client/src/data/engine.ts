import { datasetService } from '../services/api';
import { useOceanStore } from '../store/useOceanStore';

// Spatial grid bounds for Indian Ocean basin
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

const dataCache = new Map<string, any>();


export const getGridData = async (params: {
  variableId: string;
  depth: number;
  timeIndex: number;
  dataMode: 'demo' | 'api';
  activeDatasetId: string | null;
}) => {
  const { activeDatasetId } = useOceanStore.getState();

  if (!activeDatasetId) {
    return [];
  }

  const { variableId, depth, timeIndex, dataMode } = params;
  const cacheKey = `${dataMode}_${activeDatasetId}_${variableId}_${depth}_${timeIndex}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }

  try {
    const isoTime = new Date(Date.now() + params.timeIndex * 86400000).toISOString();
    const response = await datasetService.getOceanField(activeDatasetId, params.variableId, params.depth, isoTime);
    
    if (response && response.values) {
      dataCache.set(cacheKey, response.values);
      return response.values;
    }
    return [];
  } catch (e) {
    console.error("Failed to fetch real grid data from dataset API:", e);
    return [];
  }
};
