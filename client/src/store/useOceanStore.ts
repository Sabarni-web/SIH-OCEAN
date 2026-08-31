import { create } from 'zustand';
import { datasetService } from '../services/api';

interface OceanState {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
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
    const { activeDatasetId, selectedVariable, selectedDepth, selectedTime, dataMode } = get();
    if (dataMode === 'demo' || !activeDatasetId) {
      set({ fieldData: null });
      return;
    }
    
    try {
      set({ isLoadingField: true });
      const timeIso = new Date(Date.now() + selectedTime * 3600000).toISOString();
      const res = await datasetService.getOceanField(activeDatasetId, selectedVariable, selectedDepth, timeIso);
      set({ fieldData: res.values, isLoadingField: false });
    } catch (err) {
      console.error("Failed to fetch field data", err);
      set({ fieldData: null, isLoadingField: false });
    }
  }
}));

