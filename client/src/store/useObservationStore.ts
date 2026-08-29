import { create } from 'zustand';
import type { Observation } from '../../../shared/types';

interface ObservationState {
  observations: Observation[];
  selectedObservationId: string | null;
  selectedObservation: Observation | null;
  
  // Layer Toggles
  showArgo: boolean;
  showGliders: boolean;
  showCTD: boolean;
  showMoorings: boolean;
  showBGC: boolean;

  // Actions
  setObservations: (obs: Observation[]) => void;
  selectObservation: (id: string | null) => void;
  
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
  
  toggleArgo: () => set(state => ({ showArgo: !state.showArgo })),
  toggleGliders: () => set(state => ({ showGliders: !state.showGliders })),
  toggleCTD: () => set(state => ({ showCTD: !state.showCTD })),
  toggleMoorings: () => set(state => ({ showMoorings: !state.showMoorings })),
  toggleBGC: () => set(state => ({ showBGC: !state.showBGC })),
}));

