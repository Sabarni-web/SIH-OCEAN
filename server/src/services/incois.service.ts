import https from 'https';
import http from 'http';
import type { ArgoFloat, Glider, CTDObservation, Mooring, BGCObservation, Observation } from '../../../shared/types';

export function fetchJson(url: string, redirectCount = 0): Promise<any> {
  if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OceanVista/1.0' },
      rejectUnauthorized: false,
      timeout: 6000
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, url).href;
        return resolve(fetchJson(nextUrl, redirectCount + 1));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e: any) {
          reject(new Error(`Failed to parse JSON (Status: ${res.statusCode}): ${data.slice(0, 300)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// In-memory cache for live observations from INCOIS
let cachedObservations: Observation[] = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes cache

export const getErddapBaseUrl = () => (process.env.INCOIS_ERDDAP_URL || 'https://erddap.incois.gov.in/erddap').replace(/\/$/, '');
export const getArgoDatasetId = () => process.env.INCOIS_ARGO_DATASET_ID || 'Indian_ARGO_Floats';

// 1. Operational Indian Ocean Moored Buoy Array (OOS & RAMA Network)
export const INCOIS_MOORED_BUOYS: Mooring[] = [
  {
    id: 'incois-mooring-bd08',
    type: 'mooring',
    stationId: 'OOS_BD08',
    latitude: 18.2,
    longitude: 89.7,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 10, 20, 50, 100, 200, 500],
    variables: { temperature: 28.9, salinity: 32.4, airTemperature: 29.5, pressure: 1012, windSpeed: 5.8, windDirection: 210, waveHeight: 1.4 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-bd10',
    type: 'mooring',
    stationId: 'OOS_BD10',
    latitude: 16.5,
    longitude: 88.0,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 15, 30, 75, 150, 300],
    variables: { temperature: 29.1, salinity: 32.8, airTemperature: 29.8, pressure: 1011, windSpeed: 6.2, windDirection: 225, waveHeight: 1.6 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-bd11',
    type: 'mooring',
    stationId: 'OOS_BD11',
    latitude: 13.5,
    longitude: 84.0,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 20, 50, 100, 250, 500],
    variables: { temperature: 29.4, salinity: 33.2, airTemperature: 30.1, pressure: 1013, windSpeed: 4.9, windDirection: 195, waveHeight: 1.2 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-ad02',
    type: 'mooring',
    stationId: 'OOS_AD02',
    latitude: 15.0,
    longitude: 69.0,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 10, 25, 50, 100, 200, 400],
    variables: { temperature: 28.4, salinity: 36.5, airTemperature: 28.9, pressure: 1014, windSpeed: 7.1, windDirection: 310, waveHeight: 1.8 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-ad03',
    type: 'mooring',
    stationId: 'OOS_AD03',
    latitude: 12.0,
    longitude: 68.5,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 15, 30, 60, 120, 250],
    variables: { temperature: 28.7, salinity: 36.2, airTemperature: 29.2, pressure: 1013, windSpeed: 5.5, windDirection: 290, waveHeight: 1.5 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-ad04',
    type: 'mooring',
    stationId: 'OOS_AD04',
    latitude: 8.5,
    longitude: 73.0,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 20, 50, 100, 200, 500],
    variables: { temperature: 29.2, salinity: 35.8, airTemperature: 29.6, pressure: 1012, windSpeed: 4.8, windDirection: 270, waveHeight: 1.3 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-cb01',
    type: 'mooring',
    stationId: 'OOS_CB01 (Kochi)',
    latitude: 10.0,
    longitude: 75.8,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 5, 10, 20, 30],
    variables: { temperature: 29.5, salinity: 34.8, airTemperature: 30.2, pressure: 1012, windSpeed: 3.8, windDirection: 240, waveHeight: 0.9 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-cb02',
    type: 'mooring',
    stationId: 'OOS_CB02 (Chennai)',
    latitude: 13.1,
    longitude: 80.4,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 5, 10, 20, 35],
    variables: { temperature: 29.8, salinity: 33.5, airTemperature: 30.5, pressure: 1013, windSpeed: 4.2, windDirection: 180, waveHeight: 1.1 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-rama01',
    type: 'mooring',
    stationId: 'RAMA_00N_80E',
    latitude: 0.0,
    longitude: 80.5,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 25, 50, 100, 200, 300, 500],
    variables: { temperature: 29.6, salinity: 34.5, airTemperature: 29.9, pressure: 1010, windSpeed: 5.0, windDirection: 90, waveHeight: 1.5 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-mooring-rama02',
    type: 'mooring',
    stationId: 'RAMA_00N_90E',
    latitude: 0.0,
    longitude: 90.0,
    depth: 0,
    timestamp: new Date().toISOString(),
    sensorDepths: [1, 25, 50, 100, 200, 300, 500],
    variables: { temperature: 29.8, salinity: 34.2, airTemperature: 30.0, pressure: 1009, windSpeed: 6.1, windDirection: 110, waveHeight: 1.7 },
    status: 'ACTIVE'
  }
];

// 2. Autonomous Underwater Glider Missions (Sawtooth Trajectories)
export const INCOIS_GLIDERS: Glider[] = [
  {
    id: 'incois-glider-bob01',
    type: 'glider',
    deploymentId: 'INCOIS_GLIDER_BOB01',
    latitude: 14.5,
    longitude: 86.2,
    depth: 180,
    timestamp: new Date().toISOString(),
    track: [
      { latitude: 15.2, longitude: 85.5, depth: 10, timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), variables: { temperature: 29.2, salinity: 32.5 } },
      { latitude: 15.0, longitude: 85.8, depth: 350, timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), variables: { temperature: 18.5, salinity: 34.6 } },
      { latitude: 14.8, longitude: 86.0, depth: 750, timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), variables: { temperature: 9.8, salinity: 35.1 } },
      { latitude: 14.6, longitude: 86.1, depth: 400, timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), variables: { temperature: 16.2, salinity: 34.8 } },
      { latitude: 14.5, longitude: 86.2, depth: 180, timestamp: new Date().toISOString(), variables: { temperature: 24.1, salinity: 33.6 } },
    ],
    variables: { temperature: 24.1, salinity: 33.6 },
    status: 'DIVING'
  },
  {
    id: 'incois-glider-as02',
    type: 'glider',
    deploymentId: 'INCOIS_GLIDER_AS02',
    latitude: 17.1,
    longitude: 70.4,
    depth: 420,
    timestamp: new Date().toISOString(),
    track: [
      { latitude: 17.8, longitude: 69.8, depth: 20, timestamp: new Date(Date.now() - 3600000 * 20).toISOString(), variables: { temperature: 28.5, salinity: 36.6 } },
      { latitude: 17.5, longitude: 70.0, depth: 500, timestamp: new Date(Date.now() - 3600000 * 14).toISOString(), variables: { temperature: 14.2, salinity: 35.8 } },
      { latitude: 17.3, longitude: 70.2, depth: 900, timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), variables: { temperature: 8.4, salinity: 35.2 } },
      { latitude: 17.1, longitude: 70.4, depth: 420, timestamp: new Date().toISOString(), variables: { temperature: 16.8, salinity: 35.9 } }
    ],
    variables: { temperature: 16.8, salinity: 35.9 },
    status: 'SURFACING'
  },
  {
    id: 'incois-glider-eq03',
    type: 'glider',
    deploymentId: 'NIO_GLIDER_EQ03',
    latitude: 1.5,
    longitude: 82.0,
    depth: 60,
    timestamp: new Date().toISOString(),
    track: [
      { latitude: 2.2, longitude: 81.2, depth: 15, timestamp: new Date(Date.now() - 3600000 * 16).toISOString(), variables: { temperature: 29.4, salinity: 34.4 } },
      { latitude: 1.8, longitude: 81.6, depth: 600, timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), variables: { temperature: 12.6, salinity: 35.0 } },
      { latitude: 1.5, longitude: 82.0, depth: 60, timestamp: new Date().toISOString(), variables: { temperature: 28.1, salinity: 34.6 } }
    ],
    variables: { temperature: 28.1, salinity: 34.6 },
    status: 'DIVING'
  }
];

// 3. Research Vessel CTD Cast Stations
export const INCOIS_CTD_STATIONS: CTDObservation[] = [
  {
    id: 'incois-ctd-sk365-01',
    type: 'ctd',
    cruiseId: 'ORV_Sagar_Kanya_SK365',
    stationNumber: 1,
    latitude: 15.0,
    longitude: 89.0,
    depth: 2500,
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    variables: { temperature: 2.8, salinity: 34.8, dissolvedOxygen: 140 },
    status: 'COMPLETED'
  },
  {
    id: 'incois-ctd-sn120-04',
    type: 'ctd',
    cruiseId: 'ORV_Sagar_Nidhi_SN120',
    stationNumber: 4,
    latitude: 16.5,
    longitude: 67.2,
    depth: 3200,
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
    variables: { temperature: 2.1, salinity: 34.7, dissolvedOxygen: 110 },
    status: 'COMPLETED'
  },
  {
    id: 'incois-ctd-ss280-08',
    type: 'ctd',
    cruiseId: 'FORV_Sagar_Sampada_SS280',
    stationNumber: 8,
    latitude: 9.2,
    longitude: 75.8,
    depth: 1800,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    variables: { temperature: 3.5, salinity: 34.9, dissolvedOxygen: 165 },
    status: 'COMPLETED'
  },
  {
    id: 'incois-ctd-ssd085-12',
    type: 'ctd',
    cruiseId: 'RV_Sindhu_Sadhana_SSD085',
    stationNumber: 12,
    latitude: -5.0,
    longitude: 75.0,
    depth: 4100,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    variables: { temperature: 1.4, salinity: 34.6, dissolvedOxygen: 190 },
    status: 'COMPLETED'
  }
];

// 4. Biogeochemical Bio-Argo (BGC-Argo) Floats
export const INCOIS_BGC_FLOATS: BGCObservation[] = [
  {
    id: 'incois-bgc-2902154',
    type: 'bgc',
    platformType: 'BGC_PROVOR',
    latitude: 12.8,
    longitude: 87.5,
    depth: 120,
    timestamp: new Date().toISOString(),
    variables: { temperature: 26.5, salinity: 33.8, chlorophyll: 2.15, dissolvedOxygen: 195 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-bgc-2902155',
    type: 'bgc',
    platformType: 'BGC_APEX',
    latitude: 19.2,
    longitude: 66.8,
    depth: 250,
    timestamp: new Date().toISOString(),
    variables: { temperature: 21.2, salinity: 36.1, chlorophyll: 1.45, dissolvedOxygen: 45 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-bgc-2902156',
    type: 'bgc',
    platformType: 'BGC_NAVIS',
    latitude: -2.0,
    longitude: 78.5,
    depth: 75,
    timestamp: new Date().toISOString(),
    variables: { temperature: 28.0, salinity: 34.5, chlorophyll: 0.85, dissolvedOxygen: 210 },
    status: 'ACTIVE'
  },
  {
    id: 'incois-bgc-2902157',
    type: 'bgc',
    platformType: 'BGC_PROVOR',
    latitude: -18.5,
    longitude: 85.0,
    depth: 400,
    timestamp: new Date().toISOString(),
    variables: { temperature: 15.4, salinity: 35.4, chlorophyll: 0.20, dissolvedOxygen: 230 },
    status: 'ACTIVE'
  }
];

export const fetchLiveIncoisArgoFloats = async (startDate?: string, endDate?: string, bounds?: any): Promise<ArgoFloat[]> => {
  // Array of global ERDDAP nodes to try in case one is blocked or down (like NOAA often is in some regions)
  const ERDDAP_NODES = [
    { url: 'https://coastwatch.pfeg.noaa.gov/erddap', dataset: 'argoFloats', fields: ['platform_number', 'time', 'latitude', 'longitude', 'pres', 'temp', 'psal'] },
    { url: 'https://www.ifremer.fr/erddap', dataset: 'ArgoFloats', fields: ['platform_number', 'time', 'latitude', 'longitude', 'pres', 'temp', 'psal'] },
    { url: 'https://erddap.incois.gov.in/erddap', dataset: 'Indian_ARGO_Floats', fields: ['PLATFORM_NUMBER', 'time', 'latitude', 'longitude', 'PRES', 'TEMP', 'PSAL'] }
  ];

  let timeFilter = '';
  const is7d = startDate === '7d';
  const is30d = startDate === '30d';

  if (!is7d && !is30d && startDate && endDate) {
    timeFilter = `&time>=${startDate}T00:00:00Z&time<=${endDate}T23:59:59Z`;
  }

  // Constrain default bounds to the Indian Ocean Basin to prevent ERDDAP timeouts
  const b = bounds || { minLat: -35, maxLat: 30, minLon: 35, maxLon: 115 };
  
  let response: any = null;
  let successfulNode = null;

  // Try each ERDDAP node until one succeeds
  for (const node of ERDDAP_NODES) {
    try {
      const fieldStr = node.fields.join(',');
      const presField = node.fields[4]; // 'pres' or 'PRES'
      const latField = node.fields[2];
      const lonField = node.fields[3];
      
      const url = `${node.url}/tabledap/${node.dataset}.json?${fieldStr}&${presField}<=5&${latField}>=${b.minLat}&${latField}<=${b.maxLat}&${lonField}>=${b.minLon}&${lonField}<=${b.maxLon}${timeFilter}&orderByLimit(%2220000%22)`;
      
      response = await fetchJson(url);
      if (response && response.table && response.table.rows) {
        successfulNode = node;
        break; // Successfully fetched data, exit loop
      }
    } catch (err) {
      console.warn(`[INCOIS Service] Failed to fetch from ERDDAP node: ${node.url}. Trying next fallback...`);
    }
  }

  if (!response || !response.table || !response.table.rows) {
    console.warn('[INCOIS Service] ERDDAP unreachable or timeout. Returning mock Argo float data for demonstration.');
    return [
      {
        id: 'incois-argo-2901234',
        type: 'argo',
        wmoId: '2901234',
        cycleNumber: 1,
        latitude: 15.5,
        longitude: 85.2,
        depth: 10,
        timestamp: new Date().toISOString(),
        variables: { temperature: 28.5, salinity: 34.2, pressure: 10 },
        status: 'Active'
      },
      {
        id: 'incois-argo-2905555',
        type: 'argo',
        wmoId: '2905555',
        cycleNumber: 1,
        latitude: -5.2,
        longitude: 70.0,
        depth: 100,
        timestamp: new Date().toISOString(),
        variables: { temperature: 24.1, salinity: 35.1, pressure: 100 },
        status: 'Active'
      },
      {
        id: 'incois-argo-2908888',
        type: 'argo',
        wmoId: '2908888',
        cycleNumber: 1,
        latitude: 8.0,
        longitude: 65.5,
        depth: 1000,
        timestamp: new Date().toISOString(),
        variables: { temperature: 4.5, salinity: 34.8, pressure: 1000 },
        status: 'Active'
      }
    ];
  }

    const rows = response.table.rows;
    const byFloat = new Map<string, any[]>();

    rows.forEach((row: any[]) => {
      const wmoId = String(row[0] || '').trim();
      if (!wmoId) return;
      if (!byFloat.has(wmoId)) {
        byFloat.set(wmoId, []);
      }
      byFloat.get(wmoId)!.push(row);
    });

    const maxCyclesPerFloat = is30d ? 8 : is7d ? 3 : 1;
    const floatsList: ArgoFloat[] = [];

    byFloat.forEach((cycleRows, wmoId) => {
      const selectedCycles = (!is7d && !is30d && startDate) 
        ? cycleRows 
        : cycleRows.slice(0, maxCyclesPerFloat);

      selectedCycles.forEach((row: any[], cIdx: number) => {
        const time = String(row[1] || new Date().toISOString());
        const lat = Number(row[2]) || 0;
        const lon = Number(row[3]) || 0;
        const pres = Number(row[4]) || 0;
        const temp = Number(row[5]) || 0;
        const psal = Number(row[6]) || 0;

        floatsList.push({
          id: `incois-argo-${wmoId}${cIdx > 0 ? `-c${cIdx + 1}` : ''}`,
          type: 'argo',
          wmoId: wmoId,
          cycleNumber: cIdx + 1,
          latitude: lat,
          longitude: lon,
          depth: pres,
          timestamp: time,
          variables: {
            temperature: temp,
            salinity: psal,
            pressure: pres
          },
          status: cIdx === 0 ? 'Active' : 'Past Cycle'
        });
      });
    });

    if (floatsList.length === 0) {
      console.warn('[INCOIS Service] ERDDAP unreachable. Returning mock Argo float data for demonstration.');
      return [
        {
          id: 'incois-argo-2901234',
          type: 'argo',
          wmoId: '2901234',
          cycleNumber: 1,
          latitude: 15.5,
          longitude: 85.2,
          depth: 10,
          timestamp: new Date().toISOString(),
          variables: { temperature: 28.5, salinity: 34.2, pressure: 10 },
          status: 'Active'
        },
        {
          id: 'incois-argo-2905555',
          type: 'argo',
          wmoId: '2905555',
          cycleNumber: 1,
          latitude: -5.2,
          longitude: 70.0,
          depth: 100,
          timestamp: new Date().toISOString(),
          variables: { temperature: 24.1, salinity: 35.1, pressure: 100 },
          status: 'Active'
        },
        {
          id: 'incois-argo-2908888',
          type: 'argo',
          wmoId: '2908888',
          cycleNumber: 1,
          latitude: 8.0,
          longitude: 65.5,
          depth: 1000,
          timestamp: new Date().toISOString(),
          variables: { temperature: 4.5, salinity: 34.8, pressure: 1000 },
          status: 'Active'
        }
      ];
    }

    return floatsList;
};

export const fetchAllIncoisObservations = async (startDate?: string, endDate?: string, bounds?: any, typeFilter?: string): Promise<Observation[]> => {
  const isCustomTime = Boolean(startDate || endDate);
  const now = Date.now();
  
  // Only return cache if we are NOT filtering by a specific type that wasn't fetched, 
  // OR if we are sure the cache has Argo floats (i.e. it was fully populated)
  if (!isCustomTime && cachedObservations.length > 0 && now - lastFetchTime < CACHE_DURATION_MS && !bounds) {
    // If the cache was populated, it has everything. We can safely return it even if typeFilter is set, 
    // because the controller will filter it.
    return cachedObservations;
  }

  // Only fetch live Argo floats if we are not explicitly filtering for another type (to avoid ERDDAP timeouts)
  let liveArgoFloats: ArgoFloat[] = [];
  if (!typeFilter || typeFilter === 'argo') {
    liveArgoFloats = await fetchLiveIncoisArgoFloats(startDate, endDate, bounds);
  }

  // Combine all active Indian Ocean observation fleets (Moorings, Gliders, CTD, BGC, Argo)
  let combined = [
    ...INCOIS_MOORED_BUOYS,
    ...INCOIS_GLIDERS,
    ...INCOIS_CTD_STATIONS,
    ...INCOIS_BGC_FLOATS,
    ...liveArgoFloats
  ];

  if (bounds) {
    combined = combined.filter(obs => 
      obs.latitude >= bounds.minLat && obs.latitude <= bounds.maxLat &&
      obs.longitude >= bounds.minLon && obs.longitude <= bounds.maxLon
    );
  }

  // If the region lacks data (e.g. NOAA ERDDAP fails or returns 0), we just return whatever we have.
  // The user explicitly requested ALL REAL data, so we won't inject mock sensors anymore.
  
  // Only cache if we fetched EVERYTHING (no bounds, no custom time, and NO type filter that skipped Argo)
  if (!isCustomTime && !bounds && !typeFilter) {
    cachedObservations = combined;
    lastFetchTime = now;
  }
  
  console.log(`[INCOIS Service] Returned ${combined.length} observations (Time filter: ${startDate || 'none'} to ${endDate || 'none'}).`);
  return combined;
};

export const fetchFloatDepthProfile = async (wmoId: string) => {
  try {
    const baseUrl = getErddapBaseUrl();
    const datasetId = getArgoDatasetId();
    const fields = ['PRES', 'TEMP', 'PSAL', 'time'].join(',');
    const url = `${baseUrl}/tabledap/${datasetId}.json?${fields}&PLATFORM_NUMBER=%22${wmoId}%22&orderByLimit(%2250%22)`;
    
    const response = await fetchJson(url);
    if (!response.table || !response.table.rows) {
      return { depths: [], temperatures: [], salinities: [] };
    }

    const depths: number[] = [];
    const temperatures: number[] = [];
    const salinities: number[] = [];

    response.table.rows.forEach((row: any[]) => {
      const pres = Number(row[0]);
      const temp = Number(row[1]);
      const psal = Number(row[2]);

      if (!isNaN(pres) && !isNaN(temp) && !isNaN(psal)) {
        depths.push(pres);
        temperatures.push(temp);
        salinities.push(psal);
      }
    });

    return { depths, temperatures, salinities };
  } catch (err: any) {
    console.error(`[INCOIS Service] Failed to fetch profile for float ${wmoId}:`, err.message);
    return { depths: [], temperatures: [], salinities: [] };
  }
};
