import {
  fetchJson,
  getErddapBaseUrl,
  getArgoDatasetId,
  fetchLiveIncoisArgoFloats,
  INCOIS_GLIDERS,
  INCOIS_CTD_STATIONS,
  INCOIS_BGC_FLOATS
} from './incois.service';
import type { InstrumentSnapshot, ArgoFloat } from '../../../shared/types';

export interface ArgoHistoricalRecord {
  time: string;
  lat: number;
  lon: number;
  depth: number;
  temp: number;
  psal: number;
}

export async function fetchHistoricalArgoPositions(
  startDate: string,
  endDate: string
): Promise<Map<string, ArgoHistoricalRecord[]>> {
  const baseUrl = getErddapBaseUrl();
  const datasetId = getArgoDatasetId();
  const fields = 'PLATFORM_NUMBER,time,latitude,longitude,PRES,TEMP,PSAL';

  const cleanStart = startDate.slice(0, 10);
  const cleanEnd = endDate.slice(0, 10);

  const url = `${baseUrl}/tabledap/${datasetId}.json?${fields}`
    + `&time>=${cleanStart}T00:00:00Z&time<=${cleanEnd}T23:59:59Z`
    + `&PRES<=5`
    + `&latitude>=-28&latitude<=26&longitude>=42&longitude<=105`
    + `&orderByLimit(%2220000%22)`;

  const byWmo = new Map<string, ArgoHistoricalRecord[]>();

  try {
    const response = await fetchJson(url);
    const rows = response?.table?.rows || [];

    for (const row of rows) {
      const wmo = String(row[0] || '').trim();
      if (!wmo) continue;
      if (!byWmo.has(wmo)) byWmo.set(wmo, []);
      byWmo.get(wmo)!.push({
        time: String(row[1]),
        lat: Number(row[2]) || 0,
        lon: Number(row[3]) || 0,
        depth: Number(row[4]) || 0,
        temp: Number(row[5]) || 0,
        psal: Number(row[6]) || 0
      });
    }

    // Sort each float's observations chronologically
    byWmo.forEach((obs) => obs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()));
  } catch (err: any) {
    console.warn('[Timeline Instruments] ERDDAP historical query failed:', err.message);
  }

  // If specific date-window query returned 0 rows (e.g. current/future date presets),
  // fallback to the active Indian Ocean float array from ERDDAP
  if (byWmo.size === 0) {
    try {
      const liveFloats: ArgoFloat[] = await fetchLiveIncoisArgoFloats('30d');
      const startMs = new Date(cleanStart).getTime();
      const endMs = new Date(cleanEnd).getTime();
      const spanMs = Math.max(1000, endMs - startMs);

      liveFloats.forEach(f => {
        const wmo = f.wmoId || f.id;
        if (!byWmo.has(wmo)) byWmo.set(wmo, []);
        const cycleFrac = f.cycleNumber ? Math.min(1, (f.cycleNumber - 1) / 3) : 0;
        const assignedTime = new Date(startMs + (1 - cycleFrac) * spanMs).toISOString();

        byWmo.get(wmo)!.push({
          time: assignedTime,
          lat: f.latitude,
          lon: f.longitude,
          depth: f.depth || 0,
          temp: f.variables?.temperature || 26.5,
          psal: f.variables?.salinity || 34.5
        });
      });
      byWmo.forEach((obs) => obs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()));
    } catch (e: any) {
      console.warn('[Timeline Instruments] Fallback float mapping error:', e.message);
    }
  }

  return byWmo;
}

export function buildInstrumentSnapshots(
  frameTimestamps: string[],
  argoHistory: Map<string, ArgoHistoricalRecord[]>
): InstrumentSnapshot[] {
  return frameTimestamps.map((frameTs) => {
    const frameTime = new Date(frameTs).getTime();

    // 1. Argo: For each WMO ID, find the observation nearest to frameTs
    const argos: InstrumentSnapshot['argos'] = [];
    argoHistory.forEach((observations, wmoId) => {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < observations.length; i++) {
        const record = observations[i];
        if (!record) continue;
        const dist = Math.abs(new Date(record.time).getTime() - frameTime);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      // Include if within 5 days of the frame timestamp
      const obs = observations[bestIdx];
      if (bestDist <= 5 * 24 * 3600 * 1000 && obs) {
        argos.push({
          wmoId,
          latitude: obs.lat,
          longitude: obs.lon,
          depth: obs.depth,
          temperature: obs.temp,
          salinity: obs.psal
        });
      }
    });

    // 2. Gliders: Active if frameTime falls within survey track duration
    const activeGliderIndices: number[] = [];
    INCOIS_GLIDERS.forEach((glider, idx) => {
      if (!glider.track || glider.track.length === 0) return;
      const first = glider.track[0];
      const last = glider.track[glider.track.length - 1];
      if (!first || !last) return;

      const trackStart = new Date(first.timestamp).getTime();
      const trackEnd = new Date(last.timestamp).getTime();
      const minTime = Math.min(trackStart, trackEnd) - 3 * 24 * 3600 * 1000;
      const maxTime = Math.max(trackStart, trackEnd) + 3 * 24 * 3600 * 1000;
      if (frameTime >= minTime && frameTime <= maxTime) {
        activeGliderIndices.push(idx);
      }
    });

    // 3. CTD: Show if frameTs is within ±48h of the CTD cast timestamp
    const activeCTDIds = INCOIS_CTD_STATIONS
      .filter(ctd => Math.abs(new Date(ctd.timestamp).getTime() - frameTime) <= 48 * 3600 * 1000)
      .map(ctd => ctd.id);

    // 4. BGC: Show if frameTs is within ±72h of the BGC profile report
    const activeBGCIds = INCOIS_BGC_FLOATS
      .filter(bgc => Math.abs(new Date(bgc.timestamp).getTime() - frameTime) <= 72 * 3600 * 1000)
      .map(bgc => bgc.id);

    return {
      timestamp: frameTs,
      label: frameTs,
      argos,
      activeGliderIndices,
      activeCTDIds,
      activeBGCIds
    };
  });
}
