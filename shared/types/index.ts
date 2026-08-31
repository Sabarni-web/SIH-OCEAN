// Scientific Data Model Types

export interface OceanVariableDefinition {
  id: string;
  name: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  defaultMin: number;
  defaultMax: number;
  colorScale: string;
  rendererType: 'scalar-field' | 'vector-field' | 'surface-field' | 'depth-field';
  depthDependent: boolean;
  timeDependent: boolean;
}

export interface OceanDataPoint {
  lat: number;
  lon: number;
  depth: number;
  time: string;
  value: number;
}

export interface OceanGrid {
  lats: number[];
  lons: number[];
  depths: number[];
  times: string[];
  data: number[][][][]; // [time][depth][lat][lon]
}

export type DatasetStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';

export interface DatasetVariable {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  dimensions: string[];
}

export interface Dataset {
  id: string;
  name: string;
  source: string;
  format: 'netcdf' | 'csv' | 'json' | 'ascii';
  description: string;
  variables: DatasetVariable[];
  spatialBounds: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
  depthRange: {
    min: number;
    max: number;
  };
  timeRange: {
    start: string;
    end: string;
  };
  createdAt: string;
  status: DatasetStatus;
  progress?: number;
  message?: string;
}

export interface Observation {
  id: string;
  type: 'argo' | 'glider' | 'ctd' | 'mooring' | 'bgc';
  latitude: number;
  longitude: number;
  depth: number;
  timestamp: string;
  variables: Record<string, number>;
  status: string;
}

export interface ArgoFloat extends Observation {
  type: 'argo';
  wmoId: string;
  cycleNumber: number;
}

export interface GliderTrackPoint {
  latitude: number;
  longitude: number;
  depth: number;
  timestamp: string;
  variables: Record<string, number>;
}

export interface Glider extends Observation {
  type: 'glider';
  deploymentId: string;
  track: GliderTrackPoint[];
}

export interface CTDObservation extends Observation {
  type: 'ctd';
  cruiseId: string;
  stationNumber?: number;
}

export interface Mooring extends Observation {
  type: 'mooring';
  stationId: string;
  sensorDepths: number[];
}

export interface BGCObservation extends Observation {
  type: 'bgc';
  platformType: string;
}

export interface OceanProfile {
  id: string;
  lat: number;
  lon: number;
  time: string;
  depths: number[];
  temperature: number[];
  salinity: number[];
}

export interface CurrentVector {
  u: number;
  v: number;
  w: number;
}

export interface DepthLevel {
  index: number;
  depth: number;
}

export interface TimeStep {
  index: number;
  timestamp: string;
}

export interface VisualizationSettings {
  showModel: boolean;
  showArgo: boolean;
  showGliders: boolean;
  showCTD: boolean;
  showMoorings: boolean;
  showCurrents: boolean;
  showBathymetry: boolean;
  showIsosurface: boolean;
  visualizationMode: '2d' | '3d';
  opacity: number;
  verticalExaggeration: number;
}

export interface AnalyticsResult {
  metric: string;
  value: number;
  unit: string;
}

export interface UploadDataset {
  name: string;
  file: File;
  type: string;
}

export interface CurrentVectorPoint {
  latitude: number;
  longitude: number;
  speed: number; // in m/s
  direction: number; // in degrees (0 - 360)
  u: number; // zonal velocity (m/s)
  v: number; // meridional velocity (m/s)
  windSpeed?: number | undefined; // 10m wind speed (m/s)
  windDirection?: number | undefined; // 10m wind direction (deg)
}

export interface SSTGridPoint {
  latitude: number;
  longitude: number;
  temperature: number; // °C
}

export interface InstrumentSnapshot {
  timestamp: string;
  label: string;
  argos: {
    wmoId: string;
    latitude: number;
    longitude: number;
    depth: number;
    temperature: number;
    salinity: number;
  }[];
  activeGliderIndices: number[];   // indices into the glider array
  activeCTDIds: string[];          // IDs of CTD stations visible at this time
  activeBGCIds: string[];          // IDs of BGC floats visible at this time
}

export interface TimelineFrame {
  timestamp: string;           // ISO string: "2026-08-24T06:00:00Z"
  label: string;               // Human-readable: "Aug 24, 06:00 UTC"
  vectors: CurrentVectorPoint[]; // 37 grid nodes with u,v,speed,direction
  sst?: SSTGridPoint[];        // 37 grid nodes with real satellite SST (°C)
}

export interface TimelineResponse {
  frames: TimelineFrame[];
  instrumentSnapshots?: InstrumentSnapshot[];
  meta: {
    startDate: string;
    endDate: string;
    totalDays: number;
    stepHours: number;        // e.g. 6 for "every 6 hours"
    totalFrames: number;
    samplingStrategy: string; // e.g. "6-hourly", "daily", "weekly", "monthly"
    source: string;
    dataAvailable?: boolean;
  };
}

export interface APIResponse<T> {
  data: T;
  meta?: any;
  error?: string;
}


