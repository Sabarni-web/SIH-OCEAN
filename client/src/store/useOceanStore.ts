import { create } from 'zustand';
import { datasetService } from '../services/api';
import { getGridData } from '../data/engine';

export interface ViewBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  latRes: number;
  lonRes: number;
}

interface OceanState {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  viewBounds: ViewBounds;
  setViewBounds: (bounds: ViewBounds) => void;
  selectedVariable: string;
  setSelectedVariable: (variable: string) => void;
  selectedDepth: number;
  setSelectedDepth: (depth: number) => void;

  // Visualization layers
  layers: {
    model: boolean;
    argo: boolean;
    gliders: boolean;
    ctd: boolean;
    moorings: boolean;
    currents: boolean;
    bathymetry: boolean;
    isosurface: boolean;
  };
  toggleLayer: (layer: keyof OceanState['layers']) => void;

  // App state
  isPlaying: boolean;
  togglePlay: () => void;
  selectedTime: number;
  setSelectedTime: (time: number) => void;
  visualizationMode: string;
  setVisualizationMode: (mode: string) => void;
  dataMode: 'demo' | 'api';
  setDataMode: (mode: 'demo' | 'api') => void;
  activeDatasetId: string | null;
  setActiveDatasetId: (id: string | null) => void;

  // Actual Field Data for 3D
  fieldData: any[] | null;
  isLoadingField: boolean;
  fetchFieldData: () => Promise<void>;
}

export const useOceanStore = create<OceanState>((set, get) => ({
  selectedRegion: 'indian_ocean',
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  viewBounds: { minLat: -30, maxLat: 30, minLon: 40, maxLon: 110, latRes: 2, lonRes: 2 },
  setViewBounds: (bounds) => set({ viewBounds: bounds }),

  selectedVariable: 'temperature',
  setSelectedVariable: (variable) => set({ selectedVariable: variable }),

  selectedDepth: 0,
  setSelectedDepth: (depth) => set({ selectedDepth: depth }),

  layers: {
    model: true,
    argo: true,
    gliders: false,
    ctd: false,
    moorings: false,
    currents: false,
    bathymetry: true,
    isosurface: false,
  },
  toggleLayer: (layer) => set((state) => ({
    layers: { ...state.layers, [layer]: !state.layers[layer] }
  })),

  isPlaying: false,
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  selectedTime: 0,
  setSelectedTime: (time) => set({ selectedTime: time }),

  visualizationMode: '3d',
  setVisualizationMode: (mode) => set({ visualizationMode: mode }),

  dataMode: 'api',
  setDataMode: (mode) => set({ dataMode: mode }),

  activeDatasetId: null,
  setActiveDatasetId: (id) => set({ activeDatasetId: id }),

  fieldData: null,
  isLoadingField: false,
  fetchFieldData: async () => {
    const { activeDatasetId, selectedVariable, selectedDepth, selectedTime, dataMode, viewBounds } = get();
    if (dataMode === 'demo' || !activeDatasetId) {
      try {
        set({ isLoadingField: true });
        const gridData = await getGridData({
          variableId: selectedVariable,
          depth: selectedDepth,
          timeIndex: selectedTime,
          dataMode: 'demo',
          activeDatasetId: null
        });
        set({ fieldData: gridData, isLoadingField: false });
      } catch (err) {
        set({ fieldData: null, isLoadingField: false });
      }
      return;
    }

    try {
      set({ isLoadingField: true });
      const timeIso = new Date(Date.now() + selectedTime * 3600000).toISOString();
      const res = await datasetService.getOceanField(
        activeDatasetId, 
        selectedVariable, 
        selectedDepth, 
        timeIso,
        viewBounds
      );
      set({ fieldData: res.values, isLoadingField: false });
    } catch (err) {
      console.error("Failed to fetch field data", err);
      set({ fieldData: null, isLoadingField: false });
    }
  }
}));

