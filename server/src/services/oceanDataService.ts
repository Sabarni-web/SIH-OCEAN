import axios from 'axios';
import { getCache, setCache } from './redis';
import { interpolateIDW, Point } from '../utils/interpolation';
export const fetchRealOceanData = async (lats: number[], lons: number[], variable: string, depth: number, timeStr: string) => {
  // NOAA ERDDAP Integration for Global 3D Ocean Data
  
  // Map our internal variables to standard ERDDAP variables
  const variableMap: Record<string, { datasetId: string, varName: string }> = {
    'temperature': { datasetId: 'erdTAgeo1day', varName: 'sst' }, // Example SST dataset
    'salinity': { datasetId: 'hycom_glbu_08pt24_latest', varName: 'salinity' }, 
    'currentVelocity': { datasetId: 'hycom_glbu_08pt24_latest', varName: 'water_u' }, 
    // Add other mappings as needed. For prototype, we attempt these.
  };

  const mapping = variableMap[variable];
  if (!mapping && variable !== 'salinity') {
    return null; // Fallback to simulation for unsupported variables
  }

  // Calculate bounding box
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  // ERDDAP URL Format:
  // /erddap/griddap/{datasetID}.json?{varName}[({time})][({depth})][({latMin}):({latMax})][({lonMin}):({lonMax})]
  // Note: some datasets don't have depth. We will attempt a generic format.
  
  // For safety and performance in this prototype, we'll try a generic bounding box fetch.
  // We use a short timeout so the UI doesn't hang if the NOAA server is slow.
  
  const baseUrl = process.env.NOAA_GRIDDAP_URL || 'https://coastwatch.pfeg.noaa.gov/erddap/griddap';
  
  // Format time to ERDDAP ISO
  const time = new Date(timeStr || Date.now()).toISOString().split('.')[0] + 'Z'; 
  
  // Create a unique cache key for this request
  const cacheKey = `ocean_data:${variable}:${minLat}:${maxLat}:${minLon}:${maxLon}:${depth}`;
  
  try {
    // Check Redis cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] Returning cached data for ${variable}`);
      return cachedData;
    }
    
    console.log(`[CACHE MISS] Fetching fresh data from NOAA for ${variable}`);
    
    const headers: Record<string, string> = {};
    if (process.env.NOAA_ERDDAP_API_KEY) {
      // Some protected ERDDAP instances or proxies require authentication
      headers['Authorization'] = `Bearer ${process.env.NOAA_ERDDAP_API_KEY}`;
    }

    if (variable === 'salinity') {
      // Use timeStr to construct the time window.
      // E.g., fetch data up to the requested time, going back 7 days to ensure we find valid points.
      const requestedDate = timeStr ? new Date(timeStr).getTime() : Date.now();
      const timeFrom = new Date(requestedDate - 7 * 24 * 60 * 60 * 1000).toISOString().split('.')[0] + 'Z';
      const timeTo = new Date(requestedDate).toISOString().split('.')[0] + 'Z';
      
      const tableDapBaseUrl = process.env.NOAA_TABLEDAP_URL || 'https://coastwatch.pfeg.noaa.gov/erddap/tabledap';
      const url = `${tableDapBaseUrl}/nosSosSalinity.json?longitude,latitude,station_id,altitude,time,sensor_id,sea_water_salinity&longitude>=${minLon}&longitude<=${maxLon}&latitude>=${minLat}&latitude<=${maxLat}&time>=${timeFrom}&time<=${timeTo}`;
      
      const response = await axios.get(url, { 
        timeout: 5000,
        headers 
      });
      
      if (response.data && response.data.table && response.data.table.rows) {
        const rows = response.data.table.rows;
        const values = [];
        for (const row of rows) {
          // row format: [longitude, latitude, station_id, altitude, time, sensor_id, sea_water_salinity]
          const valLon = row[0];
          const valLat = row[1];
          const val = row[6];
          
          if (val !== null && !isNaN(val)) {
             values.push({
               lat: valLat,
               lon: valLon,
               depth: depth,
               value: val
             });
          }
        }
        
        if (values.length > 0) {
          // Interpolate the raw sensor points into a smooth grid matching the requested coordinates
          const interpolatedValues = interpolateIDW(values, lats, lons, depth);
          
          // Save to cache for 1 hour
          await setCache(cacheKey, interpolatedValues, 3600);
          return interpolatedValues;
        }
      }
      return null;
    }

    if (!mapping) {
      return null;
    }

    // Construct URL (simplistic version for the prototype)
    // Example: hycom_glbu_08pt24_latest.json?salinity[(2023-01-01T00:00:00Z)][(0.0)][(-30):(30)][(40):(110)]
    const query = `${mapping.datasetId}.json?${mapping.varName}[(last)][(${depth})][(${minLat}):1:(${maxLat})][(${minLon}):1:(${maxLon})]`;
    const url = `${baseUrl}/${query}`;
    
    // We wrap in a try-catch with a 3-second timeout. 
    // ERDDAP servers are notoriously slow for large 3D subsets.
    
    const response = await axios.get(url, { 
      timeout: 3000,
      headers 
    });
    
    // ERDDAP returns a table-like structure:
    // response.data.table.rows = [[time, depth, lat, lon, value], ...]
    if (response.data && response.data.table && response.data.table.rows) {
      const rows = response.data.table.rows;
      const values = [];
      
      // Interpolate ERDDAP data onto our requested grid
      // For simplicity in this demo, we just return the raw points or map them roughly
      for (const row of rows) {
        // row format depends on dimensions, typically: [time, depth, lat, lon, value]
        const valLat = row[row.length - 3];
        const valLon = row[row.length - 2];
        const val = row[row.length - 1];
        
        if (val !== null && !isNaN(val)) {
           values.push({
             lat: valLat,
             lon: valLon,
             depth: depth,
             value: val
           });
        }
      }
      
      // If we got valid data, return it
      if (values.length > 0) {
        // Save to cache for 1 hour
        await setCache(cacheKey, values, 3600);
        return values;
      }
    }
    
    return null;
  } catch (error) {
    // Silently fallback to simulation if ERDDAP times out, 404s (dataset deprecated), or 500s.
    // console.error("ERDDAP Fetch Failed, falling back to math simulation.");
    return null;
  }
};
