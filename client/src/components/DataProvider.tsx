import React, { useEffect } from 'react';
import { useOceanStore } from '../store/useOceanStore';
import { useObservationStore } from '../store/useObservationStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeDatasetId = useOceanStore((state) => state.activeDatasetId);
  const selectedVariable = useOceanStore((state) => state.selectedVariable);
  const selectedDepth = useOceanStore((state) => state.selectedDepth);
  const selectedTime = useOceanStore((state) => state.selectedTime);
  const fetchFieldData = useOceanStore((state) => state.fetchFieldData);

  const fetchObservations = useObservationStore((state) => state.fetchObservations);
  const datePreset = useObservationStore((state) => state.datePreset);
  const startDate = useObservationStore((state) => state.startDate);
  const endDate = useObservationStore((state) => state.endDate);
  const fetchCurrentVectors = useAnalyticsStore((state) => state.fetchCurrentVectors);

  // Re-fetch both observations and current vectors whenever the date filter changes
  useEffect(() => {
    fetchObservations();

    // Resolve the correct date parameter for the Copernicus API
    if (datePreset === 'live' || !startDate) {
      fetchCurrentVectors(undefined); // Live / today's data
    } else if (datePreset === '7d') {
      fetchCurrentVectors('7d');
    } else if (datePreset === '30d') {
      fetchCurrentVectors('30d');
    } else if (datePreset === 'custom' && startDate && endDate) {
      // For custom range, pass both dates so the backend can query the midpoint
      fetchCurrentVectors(`${startDate},${endDate}`);
    } else if (startDate) {
      fetchCurrentVectors(startDate);
    }
  }, [fetchObservations, fetchCurrentVectors, datePreset, startDate, endDate]);

  useEffect(() => {
    fetchFieldData();
  }, [activeDatasetId, selectedVariable, selectedDepth, selectedTime, fetchFieldData]);

  return <>{children}</>;
};
