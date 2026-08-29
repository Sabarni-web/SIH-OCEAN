import { create } from 'zustand';

interface ComparisonState {
  isComparisonOpen: boolean;
  setIsComparisonOpen: (isOpen: boolean) => void;
  selectedObservationId: string | null;
  setSelectedObservationId: (id: string | null) => void;
  
  // Tolerances
  spatialTolerance: number;
  setSpatialTolerance: (val: number) => void;
  depthTolerance: number;
  setDepthTolerance: (val: number) => void;
  timeTolerance: number;
  setTimeTolerance: (val: number) => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  isComparisonOpen: false,
  setIsComparisonOpen: (isOpen) => set({ isComparisonOpen: isOpen }),
  selectedObservationId: null,
  setSelectedObservationId: (id) => set({ selectedObservationId: id }),
  
  spatialTolerance: 10,
  setSpatialTolerance: (val) => set({ spatialTolerance: val }),
  depthTolerance: 10,
  setDepthTolerance: (val) => set({ depthTolerance: val }),
  timeTolerance: 30,
  setTimeTolerance: (val) => set({ timeTolerance: val })
}));
