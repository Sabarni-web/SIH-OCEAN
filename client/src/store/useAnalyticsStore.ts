import { create } from 'zustand';
import { currentsService } from '../services/api';
import type { CurrentVectorPoint } from '../../../shared/types';

interface AnalyticsState {
  // Modes
  depthSliceEnabled: boolean;
  setDepthSliceEnabled: (val: boolean) => void;
  crossSectionEnabled: boolean;
  setCrossSectionEnabled: (val: boolean) => void;
  isosurfaceEnabled: boolean;
  setIsosurfaceEnabled: (val: boolean) => void;
  vectorEnabled: boolean;
  setVectorEnabled: (val: boolean) => void;
  particleEnabled: boolean;
  setParticleEnabled: (val: boolean) => void;
  bathymetryEnabled: boolean;
  setBathymetryEnabled: (val: boolean) => void;
  gridEnabled: boolean;
  setGridEnabled: (val: boolean) => void;
  anomalyEnabled: boolean;
  setAnomalyEnabled: (val: boolean) => void;
  probeEnabled: boolean;
  setProbeEnabled: (val: boolean) => void;

  // Configurations
  verticalExaggeration: number;
  setVerticalExaggeration: (val: number) => void;
  isovalue: number;
  setIsovalue: (val: number) => void;
  vectorDensity: string;
  setVectorDensity: (val: string) => void;
  particleSpeed: number;
  setParticleSpeed: (val: number) => void;

  // Live Satellite Ocean Currents
  currentVectors: CurrentVectorPoint[];
  currentsLoading: boolean;
  fetchCurrentVectors: (dateStr?: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  depthSliceEnabled: true,
  setDepthSliceEnabled: (val) => set({ depthSliceEnabled: val }),
  crossSectionEnabled: false,
  setCrossSectionEnabled: (val) => set({ crossSectionEnabled: val }),
  isosurfaceEnabled: false,
  setIsosurfaceEnabled: (val) => set({ isosurfaceEnabled: val }),
  vectorEnabled: false,
  setVectorEnabled: (val) => set({ vectorEnabled: val }),
  particleEnabled: false,
  setParticleEnabled: (val) => set({ particleEnabled: val }),
  bathymetryEnabled: true,
  setBathymetryEnabled: (val) => set({ bathymetryEnabled: val }),
  gridEnabled: false,
  setGridEnabled: (val) => set({ gridEnabled: val }),
  anomalyEnabled: false,
  setAnomalyEnabled: (val) => set({ anomalyEnabled: val }),
  probeEnabled: true,
  setProbeEnabled: (val) => set({ probeEnabled: val }),

  verticalExaggeration: 1,
  setVerticalExaggeration: (val) => set({ verticalExaggeration: val }),
  isovalue: 20,
  setIsovalue: (val) => set({ isovalue: val }),
  vectorDensity: 'Medium',
  setVectorDensity: (val) => set({ vectorDensity: val }),
  particleSpeed: 1,
  setParticleSpeed: (val) => set({ particleSpeed: val }),

  currentVectors: [],
  currentsLoading: false,
  fetchCurrentVectors: async (dateStr?: string) => {
    try {
      set({ currentsLoading: true });
      const res = await currentsService.getCurrents(dateStr);
      if (res && res.data) {
        set({ currentVectors: res.data });
      }
    } catch (err) {
      console.warn('Failed to fetch live ocean currents:', err);
    } finally {
      set({ currentsLoading: false });
    }
  }
}));
