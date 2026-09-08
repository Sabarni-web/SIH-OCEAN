import React, { useEffect, useState } from 'react';
import { ComparisonPanel } from '../components/panels/ComparisonPanel';
import { datasetService, observationService } from '../services/api';
import { useComparisonStore } from '../store/useComparisonStore';
import { useOceanStore } from '../store/useOceanStore';

export const ComparePage: React.FC = () => {
  const { setSelectedObservationId, selectedObservationId } = useComparisonStore();
  const { setActiveDatasetId, setSelectedVariable, activeDatasetId, selectedVariable } = useOceanStore();
  
  const [datasets, setDatasets] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dsRes, obsRes] = await Promise.all([
          datasetService.getDatasets(),
          observationService.getObservations()
        ]);
        setDatasets(dsRes.data || dsRes);
        setObservations(obsRes.data || obsRes);
      } catch (e) {
        console.error("Failed to fetch data for comparison page:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set default dataset if none selected and datasets are available
  useEffect(() => {
    if (!activeDatasetId && datasets.length > 0) {
      setActiveDatasetId(datasets[0].id);
    } else if (!activeDatasetId && datasets.length === 0) {
       setActiveDatasetId('demo_model');
    }
  }, [datasets, activeDatasetId, setActiveDatasetId]);

  // Auto-select the first observation to prevent empty view
  useEffect(() => {
    if (!selectedObservationId && observations.length > 0) {
      const firstObs = observations[0];
      setSelectedObservationId(firstObs.wmoId || firstObs.id);
    }
  }, [observations, selectedObservationId, setSelectedObservationId]);

  return (
    <div className="max-w-[1600px] mx-auto w-full h-full animate-in fade-in duration-500 flex flex-col">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Model vs Observation</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        {/* Sidebar for Selection */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Comparison Setup</h2>
          
          {loading ? (
            <div className="text-textSecondary text-sm">Loading options...</div>
          ) : (
            <>
              {/* Dataset Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-textSecondary uppercase tracking-wider">Model Dataset</label>
                <select 
                  className="bg-background border border-border rounded-lg p-2 text-white outline-none focus:border-primary"
                  value={activeDatasetId || ''}
                  onChange={(e) => setActiveDatasetId(e.target.value)}
                >
                  <option value="" disabled>Select Dataset</option>
                  {datasets.map(ds => (
                    <option key={ds.id} value={ds.id}>{ds.name || ds.id}</option>
                  ))}
                  {datasets.length === 0 && <option value="demo_model">Demo Model (Default)</option>}
                </select>
              </div>

              {/* Variable Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-textSecondary uppercase tracking-wider">Variable</label>
                <select 
                  className="bg-background border border-border rounded-lg p-2 text-white outline-none focus:border-primary"
                  value={selectedVariable || 'temperature'}
                  onChange={(e) => setSelectedVariable(e.target.value)}
                >
                  <option value="temperature">Temperature</option>
                  <option value="salinity">Salinity</option>
                </select>
              </div>

              {/* Observation Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-textSecondary uppercase tracking-wider">Observation</label>
                <select 
                  className="bg-background border border-border rounded-lg p-2 text-white outline-none focus:border-primary"
                  value={selectedObservationId || ''}
                  onChange={(e) => setSelectedObservationId(e.target.value)}
                >
                  <option value="" disabled>Select Observation</option>
                  {observations.map(obs => (
                    <option key={obs.wmoId || obs.id} value={obs.wmoId || obs.id}>
                      {obs.type || 'Observation'} - {obs.wmoId || obs.id}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-3 rounded-xl flex flex-col min-h-[500px]">
          {!selectedObservationId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-textSecondary border border-border/50 bg-surface/50 backdrop-blur-md rounded-xl p-6">
               <h3 className="text-xl font-bold mb-2 text-white/50">No Observation Selected</h3>
               <p>Please select a model and an observation from the sidebar to begin comparison.</p>
            </div>
          ) : (
            <ComparisonPanel inline={true} />
          )}
        </div>
      </div>
    </div>
  );
};
