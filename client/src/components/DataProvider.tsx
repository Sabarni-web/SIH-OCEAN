import React, { useEffect } from 'react';
import { useOceanStore } from '../store/useOceanStore';
import { useObservationStore } from '../store/useObservationStore';
import { observationService } from '../services/api';
import { MOCK_ARGO_FLOATS, MOCK_GLIDERS, MOCK_CTD, MOCK_MOORINGS, MOCK_BGC } from '../data/mock';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dataMode = useOceanStore((state) => state.dataMode);
  const activeDatasetId = useOceanStore((state) => state.activeDatasetId);
  const selectedVariable = useOceanStore((state) => state.selectedVariable);
  const selectedDepth = useOceanStore((state) => state.selectedDepth);
  const selectedTime = useOceanStore((state) => state.selectedTime);
  const fetchFieldData = useOceanStore((state) => state.fetchFieldData);

  const setObservations = useObservationStore((state) => state.setObservations);

  useEffect(() => {
    const loadData = async () => {
      if (dataMode === 'demo') {
        setObservations([
          ...MOCK_ARGO_FLOATS,
          ...MOCK_GLIDERS,
          ...MOCK_CTD,
          ...MOCK_MOORINGS,
          ...MOCK_BGC
        ]);
      } else {
        try {
          const res = await observationService.getObservations();
          setObservations(res.data);
        } catch (error) {
          console.error("Failed to fetch API observations, falling back to empty:", error);
          setObservations([]);
        }
      }
    };

    loadData();
  }, [dataMode, setObservations]);

  useEffect(() => {
    fetchFieldData();
  }, [dataMode, activeDatasetId, selectedVariable, selectedDepth, selectedTime, fetchFieldData]);

  return <>{children}</>;
};

