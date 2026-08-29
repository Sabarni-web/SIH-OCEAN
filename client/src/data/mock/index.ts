import type { ArgoFloat, Glider, CTDObservation, Mooring, BGCObservation } from '../../../../shared/types';

export const MOCK_ARGO_FLOATS: ArgoFloat[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `argo-${i}`,
  type: 'argo',
  wmoId: `2903${700 + i}`,
  cycleNumber: 142 + i,
  latitude: 5 + Math.random() * 20, // Indian ocean bounds roughly
  longitude: 50 + Math.random() * 40,
  depth: 50 + Math.random() * 1950,
  timestamp: new Date().toISOString(),
  variables: {
    temperature: 5 + Math.random() * 25,
    salinity: 34 + Math.random() * 2
  },
  status: 'Active'
}));

export const MOCK_GLIDERS: Glider[] = Array.from({ length: 5 }).map((_, i) => {
  const startLat = 10 + Math.random() * 10;
  const startLon = 60 + Math.random() * 20;
  
  const track = Array.from({ length: 20 }).map((_, j) => ({
    latitude: startLat + (j * 0.1),
    longitude: startLon + (j * 0.1),
    depth: 50 + Math.sin(j) * 500,
    timestamp: new Date(Date.now() - (20 - j) * 3600000).toISOString(),
    variables: {
      temperature: 15 + Math.random() * 10,
      salinity: 35 + Math.random(),
      chlorophyll: Math.random() * 2
    }
  }));

  return {
    id: `glider-${i}`,
    type: 'glider',
    deploymentId: `GLIDER-${i+1}`,
    latitude: track[19].latitude,
    longitude: track[19].longitude,
    depth: track[19].depth,
    timestamp: track[19].timestamp,
    variables: track[19].variables,
    status: 'Active',
    track
  };
});

export const MOCK_CTD: CTDObservation[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `ctd-${i}`,
  type: 'ctd',
  cruiseId: `CRUISE-2024-${i}`,
  latitude: 0 + Math.random() * 25,
  longitude: 55 + Math.random() * 35,
  depth: 1000 + Math.random() * 3000,
  timestamp: new Date().toISOString(),
  variables: {
    temperature: 4 + Math.random() * 15,
    salinity: 34.5 + Math.random(),
    pressure: 1000 + Math.random() * 3000
  },
  status: 'Completed'
}));

export const MOCK_MOORINGS: Mooring[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `mooring-${i}`,
  type: 'mooring',
  stationId: `RAMA-${i}`,
  latitude: -10 + Math.random() * 25,
  longitude: 65 + Math.random() * 25,
  depth: 0,
  timestamp: new Date().toISOString(),
  variables: {
    temperature: 28 + Math.random() * 2,
    salinity: 35 + Math.random()
  },
  status: 'Active',
  sensorDepths: [0, 50, 100, 250, 500, 1000]
}));

export const MOCK_BGC: BGCObservation[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `bgc-${i}`,
  type: 'bgc',
  platformType: 'Bio-Argo',
  latitude: -5 + Math.random() * 20,
  longitude: 70 + Math.random() * 20,
  depth: 150 + Math.random() * 300,
  timestamp: new Date().toISOString(),
  variables: {
    temperature: 18 + Math.random() * 10,
    salinity: 35 + Math.random(),
    chlorophyll: Math.random() * 3,
    oxygen: 3 + Math.random() * 4
  },
  status: 'Active'
}));

export const MOCK_CHART_DATA = {
  depths: [0, 50, 100, 200, 500, 1000, 2000],
  modelTemp: [29.5, 28.2, 24.1, 18.5, 12.3, 6.5, 2.1],
  obsTemp: [29.1, 28.0, 23.8, 18.2, 12.1, 6.4, 2.0],
};
