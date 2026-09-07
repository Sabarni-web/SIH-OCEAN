import React, { useEffect, useState } from 'react';
import { Ship, Droplets, Thermometer, Layers, Compass, Activity, RefreshCw } from 'lucide-react';
import { observationService } from '../services/api';
import type { CTDObservation } from '../../../shared/types';
import Plot from 'react-plotly.js';

export const CTDPage: React.FC = () => {
  const [ctdStations, setCtdStations] = useState<CTDObservation[]>([]);
  const [selectedCtd, setSelectedCtd] = useState<CTDObservation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCTD = async () => {
      try {
        setLoading(true);
        const res = await observationService.getObservations({ type: 'ctd', limit: 10 });
        const list = (res.data || []) as CTDObservation[];
        setCtdStations(list);
        if (list.length > 0) setSelectedCtd(list[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCTD();
  }, []);

  // Generate deep continuous hydrographic profile down to station max depth
  const generateCTDProfile = (maxDepth: number) => {
    const depths = Array.from({ length: 40 }, (_, i) => Math.round((i / 39) * maxDepth));
    const temps = depths.map(d => Math.max(1.2, 28.5 * Math.exp(-d / 450) + (d > 1000 ? 1.5 : 0)));
    const sals = depths.map(d => 34.0 + (d < 200 ? 1.8 * (d / 200) : 0.8 * Math.exp(-d / 2000)));
    const oxygens = depths.map(d => d < 100 ? 210 : d < 800 ? 35 : 160); // Oxygen minimum zone
    return { depths, temps, sals, oxygens };
  };

  const currentProfile = selectedCtd ? generateCTDProfile(selectedCtd.depth) : null;

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Ship className="w-8 h-8 text-purple-400" /> Research Vessel Shipboard CTD Casts
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Ultra-high precision Conductivity-Temperature-Depth (CTD) rosette hydrographic stations from Indian oceanographic expeditions.
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold">
          {loading ? '...' : ctdStations.length} CRUISE STATIONS
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cruise Station List */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col h-[700px]">
          <h2 className="text-lg font-semibold text-white mb-3">Hydrographic Stations</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-textSecondary gap-3">
                 <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                 <p className="text-sm">Fetching hydrographic stations...</p>
              </div>
            ) : ctdStations.map((c) => {
              const isSelected = selectedCtd?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCtd(c)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-500/15 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                      : 'bg-surfaceElevated/50 border-border/40 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{c.cruiseId}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded font-bold">
                      STN #{c.stationNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-textSecondary font-mono">
                    <span>GPS: {c.latitude}°N, {c.longitude}°E</span>
                    <span className="text-cyan-300">Max Cast: {c.depth}m</span>
                    <span className="text-purple-300">Bottom: {c.variables.temperature}°C</span>
                    <span className="text-emerald-300">Status: {c.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Station Deep Hydrographic Cast */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCtd && currentProfile ? (
            <div className="p-5 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col h-[700px]">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCtd.cruiseId} (Station #{selectedCtd.stationNumber})</h2>
                  <p className="text-xs text-textSecondary font-mono">
                    Position: {selectedCtd.latitude}°N, {selectedCtd.longitude}°E • Maximum Wire Out: {selectedCtd.depth}m (Abyssal Floor)
                  </p>
                </div>
                <span className="text-xs font-mono text-purple-400">
                  {new Date(selectedCtd.timestamp).toUTCString()}
                </span>
              </div>

              {/* Hydrographic Deep Plot */}
              <div className="flex-1 bg-black/30 rounded-lg p-2 flex flex-col">
                <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                  Full Water Column Hydrography (0 to {selectedCtd.depth}m)
                </h3>
                <div className="flex-1">
                  <Plot
                    data={[
                      {
                        x: currentProfile.temps,
                        y: currentProfile.depths,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Temp (°C)',
                        line: { color: '#00ffff', width: 2.5 },
                        marker: { size: 4 }
                      },
                      {
                        x: currentProfile.sals,
                        y: currentProfile.depths,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Salinity (PSU)',
                        xaxis: 'x2',
                        line: { color: '#00ff88', width: 2.5, dash: 'dot' },
                        marker: { size: 4 }
                      },
                      {
                        x: currentProfile.oxygens,
                        y: currentProfile.depths,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Dissolved O2 (µmol/kg)',
                        xaxis: 'x3',
                        line: { color: '#ffaa00', width: 2, dash: 'dash' }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 50, r: 60, t: 30, b: 35 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#8892b0', family: 'monospace', size: 10 },
                      yaxis: {
                        autorange: 'reversed',
                        title: { text: 'Depth (meters)' },
                        gridcolor: '#1f293d'
                      },
                      xaxis: {
                        title: { text: 'Temp (°C)' },
                        titlefont: { color: '#00ffff' },
                        tickfont: { color: '#00ffff' },
                        gridcolor: '#1f293d'
                      },
                      xaxis2: {
                        title: { text: 'Salinity (PSU)' },
                        titlefont: { color: '#00ff88' },
                        tickfont: { color: '#00ff88' },
                        overlaying: 'x',
                        side: 'top'
                      },
                      xaxis3: {
                        title: { text: 'O2 (µmol/kg)' },
                        titlefont: { color: '#ffaa00' },
                        tickfont: { color: '#ffaa00' },
                        overlaying: 'x',
                        side: 'bottom',
                        position: 0.05
                      },
                      legend: { orientation: 'h', y: -0.2 }
                    }}
                    useResizeHandler={true}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex items-center justify-center h-[700px] text-textSecondary">
              Select a CTD cruise station to inspect water column hydrography
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
