import fs from 'fs';
import csv from 'csv-parser';
import { OceanDataPoint } from '../../../shared/types';

export const parseCSV = (filePath: string): Promise<OceanDataPoint[]> => {
  return new Promise((resolve, reject) => {
    const results: OceanDataPoint[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Basic normalization assuming columns might be lat, lon, depth, time, value
        // Note: For a real generic parser, we'd inspect headers and map them dynamically.
        const lat = parseFloat(data.latitude || data.lat);
        const lon = parseFloat(data.longitude || data.lon);
        const depth = parseFloat(data.depth || data.lev || '0');
        const time = data.time || data.timestamp || new Date().toISOString();
        const value = parseFloat(data.temperature || data.temp || data.value || '0'); // Placeholder variable mapping

        if (!isNaN(lat) && !isNaN(lon) && !isNaN(value)) {
          results.push({ lat, lon, depth, time, value });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
