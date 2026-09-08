import React, { useEffect, useState } from 'react';
import { Navigation, Search, Activity, RefreshCw, Layers } from 'lucide-react';
import { observationService } from '../services/api';
import type { ArgoFloat } from '../../../shared/types';
import Plot from 'react-plotly.js';

export const ArgoPage: React.FC = () => {
  const [floats, setFloats] = useState<ArgoFloat[]>([]);
  const [selectedFloat, setSelectedFloat] = useState<ArgoFloat | null>(null);
  const [profileData, setProfileData] = useState<{ depths: number[]; temperatures: number[]; salinities: number[] } | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchFloats = async () => {
    try {
      setLoading(true);
      const res = await observationService.getObservations({ type: 'argo', limit: 150 });
      const list = (res.data || []) as ArgoFloat[];
      setFloats(list);
      if (list.length > 0 && !selectedFloat) {
        handleSelectFloat(list[0]);
      }
    } catch (err) {
      console.error("Failed to load Argo floats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloats();
  }, []);

  const handleSelectFloat = async (float: ArgoFloat) => {
    setSelectedFloat(float);
    try {
      setLoadingProfile(true);
      const res = await observationService.getObservationProfile(float.wmoId);
      setProfileData(res.data);
    } catch (err) {
      console.error("Failed to fetch float profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const filteredFloats = floats.filter(f => 
    f.wmoId.toLowerCase().includes(search.toLowerCase()) || 
    f.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Navigation className="w-8 h-8 text-primary" /> Active Argo Float Fleet
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Real-time robotic autonomous profiling floats deployed across the Indian Ocean basin (INCOIS ERDDAP).
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Search WMO ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surfaceElevated border border-border/50 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary w-48"
            />
          </div>
          <button 
            onClick={fetchFloats}
            className="p-2 bg-surfaceElevated hover:bg-surfaceLight rounded-lg border border-border/50 text-textSecondary hover:text-white transition-colors"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Float Table */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col h-[700px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Float Telemetry ({filteredFloats.length})</h2>
            <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-semibold">
              INCOIS LIVE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg border border-border/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surfaceElevated/80 text-textSecondary sticky top-0 uppercase tracking-wider border-b border-border/50">
                <tr>
                  <th className="p-3">WMO ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Latitude</th>
                  <th className="p-3">Longitude</th>
                  <th className="p-3">Temp (°C)</th>
                  <th className="p-3">Salinity (PSU)</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-white">
                {loading && filteredFloats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-textSecondary">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                        <p>Connecting to INCOIS ERDDAP... fetching live float telemetry.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredFloats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-textSecondary">
                      No active Argo floats found in this region.
                    </td>
                  </tr>
                ) : (
                  filteredFloats.map((float) => {
                    const isSelected = selectedFloat?.id === float.id;
                    return (
                      <tr 
                        key={float.id}
                        onClick={() => handleSelectFloat(float)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/20 border-l-2 border-primary' : 'hover:bg-white/5'}`}
                      >
                        <td className="p-3 font-bold text-primary">{float.wmoId}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[10px] font-bold">
                            ACTIVE
                          </span>
                        </td>
                        <td className="p-3">{float.latitude.toFixed(2)}°N</td>
                        <td className="p-3">{float.longitude.toFixed(2)}°E</td>
                        <td className="p-3 text-cyan-300 font-bold">{float.variables.temperature?.toFixed(1) || '--'}</td>
                        <td className="p-3 text-emerald-300 font-bold">{float.variables.salinity?.toFixed(1) || '--'}</td>
                        <td className="p-3">
                          <button className="text-primary hover:underline font-sans text-xs">
                            Cast Graph →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Float Depth Cast Graph */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col h-[700px]">
            <h2 className="text-lg font-semibold text-white mb-2">Vertical Hydrographic Profile</h2>
            {selectedFloat ? (
              <div className="flex-1 flex flex-col">
                <div className="bg-surfaceElevated p-3 rounded-lg border border-border/40 mb-3 text-xs space-y-1">
                  <p><span className="text-textSecondary">Target Float:</span> <strong className="text-primary">WMO #{selectedFloat.wmoId}</strong></p>
                  <p><span className="text-textSecondary">Coordinates:</span> <strong className="text-white">{selectedFloat.latitude.toFixed(2)}°N, {selectedFloat.longitude.toFixed(2)}°E</strong></p>
                  <p><span className="text-textSecondary">Last Reading:</span> <strong className="text-white">{new Date(selectedFloat.timestamp).toUTCString()}</strong></p>
                </div>

                <div className="flex-1 min-h-[480px] bg-black/30 rounded-lg p-2 flex items-center justify-center">
                  {loadingProfile ? (
                    <div className="flex items-center gap-2 text-primary text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Fetching 50-level INCOIS telemetry...
                    </div>
                  ) : profileData && profileData.depths.length > 0 ? (
                    <Plot
                      data={[
                        {
                          x: profileData.temperatures,
                          y: profileData.depths,
                          type: 'scatter',
                          mode: 'lines+markers',
                          name: 'Temp (°C)',
                          line: { color: '#00ffff', width: 2.5 },
                          marker: { size: 4 }
                        },
                        {
                          x: profileData.salinities,
                          y: profileData.depths,
                          type: 'scatter',
                          mode: 'lines+markers',
                          name: 'Salinity (PSU)',
                          xaxis: 'x2',
                          line: { color: '#00ff88', width: 2.5, dash: 'dot' },
                          marker: { size: 4 }
                        }
                      ]}
                      layout={{
                        autosize: true,
                        margin: { l: 45, r: 45, t: 30, b: 40 },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { color: '#8892b0', family: 'monospace', size: 10 },
                        yaxis: {
                          autorange: 'reversed',
                          title: { text: 'Depth (dbar)' },
                          gridcolor: '#1f293d',
                          zeroline: false
                        },
                        xaxis: {
                          title: { text: 'Temp (°C)' },
                          titlefont: { color: '#00ffff' },
                          tickfont: { color: '#00ffff' },
                          gridcolor: '#1f293d',
                          zeroline: false
                        },
                        xaxis2: {
                          title: { text: 'Salinity (PSU)' },
                          titlefont: { color: '#00ff88' },
                          tickfont: { color: '#00ff88' },
                          overlaying: 'x',
                          side: 'top',
                          zeroline: false
                        },
                        legend: { orientation: 'h', y: -0.15 }
                      }}
                      useResizeHandler={true}
                      className="w-full h-full"
                    />
                  ) : (
                    <p className="text-xs text-textSecondary">Select a float to view profile</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-textSecondary">No float selected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
