export const API_BASE_URL = '/api/v1';

export const REGIONS = {
  INDIAN_OCEAN: {
    name: 'Indian Ocean',
    minLat: -40,
    maxLat: 30,
    minLon: 30,
    maxLon: 120,
    minDepth: 0,
    maxDepth: 5000,
  }
};

export const VARIABLES = {
  TEMPERATURE: 'temperature',
  SALINITY: 'salinity',
  CURRENT_U: 'current_u',
  CURRENT_V: 'current_v',
  CHLOROPHYLL: 'chlorophyll',
  DISSOLVED_OXYGEN: 'dissolved_oxygen'
};
