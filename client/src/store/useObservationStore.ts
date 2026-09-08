import { create } from 'zustand';
import type { Observation } from '../../../shared/types';
import { observationService } from '../services/api';

export type DatePreset = 'live' | '7d' | '30d' | 'custom';

interface ObservationState {
  observations: Observation[];
  selectedObservationId: string | null;
  selectedObservation: Observation | null;
  loading: boolean;
  
  // Date Filtering
  datePreset: DatePreset;
  startDate: string | null;
  endDate: string | null;

  // Layer Toggles
  showArgo: boolean;
  showGliders: boolean;
  showCTD: boolean;
  showMoorings: boolean;
  showBGC: boolean;

  // Actions
  setObservations: (obs: Observation[]) => void;
  selectObservation: (id: string | null) => void;
  setDateFilter: (preset: DatePreset, start?: string, end?: string) => Promise<void>;
  fetchObservations: () => Promise<void>;
  
  toggleArgo: () => void;
  toggleGliders: () => void;
  toggleCTD: () => void;
  toggleMoorings: () => void;
  toggleBGC: () => void;
}

export const useObservationStore = create<ObservationState>((set, get) => ({
  observations: [],
  selectedObservationId: null,
  selectedObservation: null,
  loading: false,

  datePreset: 'live',
  startDate: null,
  endDate: null,
  
  showArgo: true,
  showGliders: true,
  showCTD: true,
  showMoorings: true,
  showBGC: true,

  setObservations: (obs) => set({ observations: obs }),
  
  selectObservation: (id) => {
    const obs = get().observations.find(o => o.id === id) || null;
    set({ selectedObservationId: id, selectedObservation: obs });
  },

  fetchObservations: async () => {
    const { startDate, endDate } = get();
    // Dynamically import useOceanStore state to avoid circular dependency
    const { useOceanStore } = await import('./useOceanStore');
    const { viewBounds } = useOceanStore.getState();

    try {
      set({ loading: true });
      const params: any = { 
        limit: 1200,
        minLat: viewBounds.minLat,
        maxLat: viewBounds.maxLat,
        minLon: viewBounds.minLon,
        maxLon: viewBounds.maxLon
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await observationService.getObservations(params);
      if (res && res.data) {
        set({ observations: res.data });
        // Automatically select the first instrument if none is selected
        if (res.data.length > 0 && !get().selectedObservationId) {
          get().selectObservation(res.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch observations:", err);
    } finally {
      set({ loading: false });
    }
  },

  setDateFilter: async (preset, start, end) => {
    let sDate = start || null;
    let eDate = end || null;

    if (preset === 'live') {
      sDate = null;
      eDate = null;
    } else if (preset === '7d') {
      sDate = '7d';
      eDate = 'now';
    } else if (preset === '30d') {
      sDate = '30d';
      eDate = 'now';
    }

    set({ datePreset: preset, startDate: sDate, endDate: eDate });
    await get().fetchObservations();
  },
  
  toggleArgo: () => set(state => ({ showArgo: !state.showArgo })),
  toggleGliders: () => set(state => ({ showGliders: !state.showGliders })),
  toggleCTD: () => set(state => ({ showCTD: !state.showCTD })),
  toggleMoorings: () => set(state => ({ showMoorings: !state.showMoorings })),
  toggleBGC: () => set(state => ({ showBGC: !state.showBGC })),
}));
