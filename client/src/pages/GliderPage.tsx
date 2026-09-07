import React, { useEffect, useState } from 'react';
import { Plane, Compass, Activity, Navigation, RefreshCw } from 'lucide-react';
import { observationService } from '../services/api';
import type { Glider } from '../../../shared/types';
import Plot from 'react-plotly.js';

export const GliderPage: React.FC = () => {
  const [gliders, setGliders] = useState<Glider[]>([]);
  const [selectedGlider, setSelectedGlider] = useState<Glider | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGliders = async () => {
      try {
        setLoading(true);
        const res = await observationService.getObservations({ type: 'glider', limit: 10 });
        const list = (res.data || []) as Glider[];
        setGliders(list);
        if (list.length > 0) setSelectedGlider(list[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadGliders();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Plane className="w-8 h-8 text-emerald-400" /> Autonomous Underwater Gliders
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Long-range autonomous buoyancy-driven vehicles executing sawtooth vertical surveys across the Indian Ocean.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
          {loading ? '...' : gliders.length} ACTIVE MISSIONS
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission List */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col h-[700px]">
          <h2 className="text-lg font-semibold text-white mb-3">Glider Deployments</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-textSecondary gap-3">
                 <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                 <p className="text-sm">Fetching glider deployments...</p>
              </div>
            ) : gliders.map((g) => {
              const isSelected = selectedGlider?.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGlider(g)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-surfaceElevated/50 border-border/40 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{g.deploymentId}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                      {g.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-textSecondary font-mono">
                    <span>GPS: {g.latitude}°N, {g.longitude}°E</span>
                    <span className="text-cyan-300">Depth: {g.depth}m</span>
                    <span>Waypoints: {g.track.length}</span>
                    <span className="text-emerald-300">Temp: {g.variables.temperature}°C</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Glider Sawtooth Profile */}
        <div className="lg:col-span-2 space-y-6">
          {selectedGlider ? (
            <div className="p-5 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col h-[700px]">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedGlider.deploymentId} Mission Transect</h2>
                  <p className="text-xs text-textSecondary font-mono">
                    Current Position: {selectedGlider.latitude}°N, {selectedGlider.longitude}°E • Max Dive: {Math.max(...selectedGlider.track.map(t => t.depth))}m
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  Status: {selectedGlider.status}
                </span>
              </div>

              {/* Sawtooth Dive Profile Chart */}
              <div className="flex-1 bg-black/30 rounded-lg p-2 flex flex-col mb-4">
                <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                  2D Sawtooth Dive Path (Depth vs Waypoint Distance)
                </h3>
                <div className="flex-1">
                  <Plot
                    data={[
                      {
                        x: selectedGlider.track.map((_, i) => `Dive Leg ${i + 1}`),
                        y: selectedGlider.track.map(t => t.depth),
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Sawtooth Dive Depth',
                        line: { color: '#00ff88', width: 3, shape: 'spline' },
                        marker: {
                          size: 10,
                          color: selectedGlider.track.map(t => t.variables.temperature || 20),
                          colorscale: 'Thermal',
                          showscale: true,
                          colorbar: { title: { text: 'Temp (°C)' }, len: 0.8 }
                        }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 50, r: 60, t: 20, b: 35 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#8892b0', family: 'monospace', size: 10 },
                      yaxis: {
                        autorange: 'reversed',
                        title: { text: 'Depth (meters)' },
                        gridcolor: '#1f293d'
                      },
                      xaxis: { gridcolor: '#1f293d' }
                    }}
                    useResizeHandler={true}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Waypoints Table */}
              <div className="h-44 overflow-y-auto rounded-lg border border-border/40">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surfaceElevated text-textSecondary sticky top-0 uppercase tracking-wider">
                    <tr>
                      <th className="p-2">Waypoint</th>
                      <th className="p-2">Latitude</th>
                      <th className="p-2">Longitude</th>
                      <th className="p-2">Depth (m)</th>
                      <th className="p-2">Temp (°C)</th>
                      <th className="p-2">Salinity (PSU)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-white">
                    {selectedGlider.track.map((wp, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-2 font-bold text-emerald-400">Leg #{idx + 1}</td>
                        <td className="p-2">{wp.latitude.toFixed(2)}°N</td>
                        <td className="p-2">{wp.longitude.toFixed(2)}°E</td>
                        <td className="p-2 text-cyan-300">{wp.depth}m</td>
                        <td className="p-2 text-red-400">{wp.variables.temperature}°C</td>
                        <td className="p-2 text-emerald-300">{wp.variables.salinity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex items-center justify-center h-[700px] text-textSecondary">
              Select a glider mission to inspect dive profiles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
