import React, { useEffect, useState } from 'react';
import { datasetService } from '../services/api';
import { useOceanStore } from '../store/useOceanStore';
import { Database, Map, Layers, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ModelDataPage: React.FC = () => {
  const { activeDatasetId, setActiveDatasetId } = useOceanStore();
  
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await datasetService.getDatasets();
        const data = res.data || res;
        setDatasets(data);
        if (data.length > 0) {
          // Select the first dataset by default if none is selected
          setSelectedDataset(data[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Model Data Explorer</h1>
      
      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Available Datasets */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Available Datasets
          </h2>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-textSecondary">
              Loading datasets...
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-textSecondary">
              No datasets available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-2">
              {datasets.map(ds => (
                <div 
                  key={ds.id || ds._id}
                  onClick={() => setSelectedDataset(ds)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col gap-2
                    ${selectedDataset?.id === (ds.id || ds._id) || selectedDataset?._id === (ds.id || ds._id)
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,212,255,0.15)]' 
                      : 'border-border/50 bg-surfaceElevated hover:border-textSecondary'
                    }
                  `}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-white line-clamp-2">{ds.name || ds.id}</h3>
                    {ds.status === 'READY' ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0 animate-pulse"></span>
                    )}
                  </div>
                  
                  <div className="text-sm text-textSecondary">
                    <span className="text-xs uppercase tracking-wider text-white/40 mr-1">Source:</span> 
                    {ds.source || 'Unknown'}
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="text-xs font-mono text-cyan-400/70 bg-cyan-900/20 px-2 py-1 rounded">
                      {ds.format ? ds.format.toUpperCase() : 'UNKNOWN'}
                    </div>
                    {activeDatasetId === (ds.id || ds._id) && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active Model
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dataset Details */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Dataset Details</h2>
            
            {!selectedDataset ? (
              <div className="flex-1 flex items-center justify-center text-textSecondary text-center p-4">
                Select a dataset from the list to view its details.
              </div>
            ) : (
              <div className="flex flex-col gap-6 overflow-y-auto pr-2 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{selectedDataset.name || selectedDataset.id}</h3>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    {selectedDataset.description || 'No description available for this dataset.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-surfaceElevated p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-white">
                      <Map className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-sm">Spatial Bounds</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-textSecondary">
                      <div>Lat: {selectedDataset.spatialBounds?.latMin ?? 'N/A'}° to {selectedDataset.spatialBounds?.latMax ?? 'N/A'}°</div>
                      <div>Lon: {selectedDataset.spatialBounds?.lonMin ?? 'N/A'}° to {selectedDataset.spatialBounds?.lonMax ?? 'N/A'}°</div>
                      <div className="col-span-2">Depth: {selectedDataset.depthRange?.min ?? 'N/A'}m to {selectedDataset.depthRange?.max ?? 'N/A'}m</div>
                    </div>
                  </div>

                  <div className="bg-surfaceElevated p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-white">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-sm">Temporal Range</span>
                    </div>
                    <div className="text-xs text-textSecondary space-y-1">
                      <div>Start: {selectedDataset.timeRange?.start ? formatDate(selectedDataset.timeRange.start) : 'N/A'}</div>
                      <div>End: {selectedDataset.timeRange?.end ? formatDate(selectedDataset.timeRange.end) : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-white">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-sm">Variables ({selectedDataset.variables?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedDataset.variables && selectedDataset.variables.length > 0 ? (
                        selectedDataset.variables.map((v: any) => (
                          <div key={v.id} className="text-xs bg-surfaceElevated border border-border/50 px-2 py-1 rounded text-textSecondary" title={v.name}>
                            {v.id} <span className="text-white/30 ml-1">[{v.unit}]</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-textSecondary">No variables defined.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button 
                    onClick={() => setActiveDatasetId(selectedDataset.id || selectedDataset._id)}
                    disabled={activeDatasetId === (selectedDataset.id || selectedDataset._id) || selectedDataset.status !== 'READY'}
                    className={`w-full py-3 rounded-lg font-semibold transition-all shadow-lg ${
                      activeDatasetId === (selectedDataset.id || selectedDataset._id)
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                        : selectedDataset.status !== 'READY'
                          ? 'bg-surfaceElevated text-textSecondary cursor-not-allowed'
                          : 'bg-primary hover:bg-primary-dark text-black hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                    }`}
                  >
                    {activeDatasetId === (selectedDataset.id || selectedDataset._id)
                      ? 'Currently Active Model'
                      : selectedDataset.status !== 'READY'
                        ? 'Dataset Processing...'
                        : 'Set as Active Model'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
