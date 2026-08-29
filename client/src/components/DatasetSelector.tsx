import React, { useEffect, useState } from 'react';
import { Database, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';
import { datasetService } from '../services/api';

export const DatasetSelector: React.FC = () => {
  const { dataMode, setDataMode, activeDatasetId, setActiveDatasetId } = useOceanStore();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await datasetService.getDatasets();
      setDatasets(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setDataMode('demo'); // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataMode === 'api') {
      fetchDatasets();
    }
  }, [dataMode]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      await datasetService.uploadDataset(e.target.files[0]);
      setTimeout(fetchDatasets, 2000); // refresh list
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-textSecondary flex items-center gap-2">
          <Database className="w-4 h-4" /> Data Source
        </h3>
        
        {/* Toggle Mode */}
        <div className="flex items-center bg-surfaceElevated rounded-lg p-1 border border-border/50">
          <button 
            className={`px-3 py-1 text-xs rounded-md transition-all ${dataMode === 'demo' ? 'bg-primary text-black font-bold' : 'text-textSecondary hover:text-white'}`}
            onClick={() => setDataMode('demo')}
          >
            DEMO
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-md transition-all ${dataMode === 'api' ? 'bg-primary text-black font-bold' : 'text-textSecondary hover:text-white'}`}
            onClick={() => setDataMode('api')}
          >
            API
          </button>
        </div>
      </div>

      {dataMode === 'api' ? (
        <div className="space-y-4">
          {error && (
            <div className="text-red-400 text-xs bg-red-900/20 p-2 rounded flex items-center gap-2 border border-red-900/50">
              <AlertCircle className="w-3 h-3" /> {error}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <select 
              className="flex-1 bg-surfaceElevated border border-border/50 rounded-lg text-sm p-2 text-white outline-none focus:border-primary transition-colors"
              value={activeDatasetId || ''}
              onChange={(e) => setActiveDatasetId(e.target.value || null)}
            >
              <option value="">-- Select Dataset --</option>
              {datasets.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name} ({ds.status})</option>
              ))}
            </select>
            <button 
              className="p-2 bg-surfaceElevated hover:bg-surfaceLight rounded-lg border border-border/50 transition-colors"
              onClick={fetchDatasets}
              title="Refresh Datasets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'text-textSecondary'}`} />
            </button>
          </div>

          <div className="relative overflow-hidden group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleUpload}
              disabled={uploading}
              accept=".nc,.csv,.json,.txt"
            />
            <div className={`w-full py-2 border border-dashed rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${uploading ? 'bg-primary/20 border-primary text-primary' : 'border-border text-textSecondary group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5'}`}>
              {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload .nc, .csv'}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-textSecondary bg-surfaceElevated p-3 rounded-lg border border-border/50">
          Using deterministic procedural noise models (Demo Fallback). Switch to API to fetch actual NETCDF/CSV subsets.
        </div>
      )}
    </div>
  );
};
