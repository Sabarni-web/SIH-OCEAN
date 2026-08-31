import React, { useEffect, useState } from 'react';
import { Anchor, Wind, Droplets, Thermometer, Compass, Activity, Waves } from 'lucide-react';
import { observationService } from '../services/api';
import type { Mooring } from '../../../shared/types';
import Plot from 'react-plotly.js';

export const MooringsPage: React.FC = () => {
  const [moorings, setMoorings] = useState<Mooring[]>([]);
  const [selectedMooring, setSelectedMooring] = useState<Mooring | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMoorings = async () => {
      try {
        setLoading(true);
        const res = await observationService.getObservations({ type: 'mooring', limit: 20 });
        const list = (res.data || []) as Mooring[];
        setMoorings(list);
        if (list.length > 0) setSelectedMooring(list[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadMoorings();
  }, []);

  // Generate simulated 24h meteorological time-series for the selected buoy
  const generateMooringTimeSeries = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const sst = hours.map((_, i) => 28.5 + Math.sin(i * 0.3) * 0.8 + (Math.random() * 0.2));
    const waves = hours.map((_, i) => 1.2 + Math.cos(i * 0.25) * 0.4 + (Math.random() * 0.1));
    const wind = hours.map((_, i) => 5.2 + Math.sin(i * 0.2) * 2.1 + (Math.random() * 0.3));
    return { hours, sst, waves, wind };
  };

  const timeSeries = generateMooringTimeSeries();

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Anchor className="w-8 h-8 text-rose-500" /> Moored Buoy Network (OOS & RAMA)
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Deep-sea and coastal anchored meteorological-oceanographic buoys across the Arabian Sea & Bay of Bengal.
          </p>
        </div>
        <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-semibold">
          {moorings.length} ACTIVE BUOYS
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buoy List */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col h-[700px]">
          <h2 className="text-lg font-semibold text-white mb-3">Mooring Stations</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {moorings.map((m) => {
              const isSelected = selectedMooring?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMooring(m)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                      : 'bg-surfaceElevated/50 border-border/40 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{m.stationId}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded font-bold">
                      {m.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-textSecondary font-mono">
                    <span>GPS: {m.latitude}°N, {m.longitude}°E</span>
                    <span className="text-cyan-300">SST: {m.variables.temperature}°C</span>
                    <span>Winds: {m.variables.windSpeed} m/s</span>
                    <span className="text-amber-300">Wave: {m.variables.waveHeight} m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Buoy Telemetry Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {selectedMooring ? (
            <div className="p-5 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col h-[700px]">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMooring.stationId} Telemetry</h2>
                  <p className="text-xs text-textSecondary font-mono">
                    Coordinates: {selectedMooring.latitude}°N, {selectedMooring.longitude}°E • Subsurface Sensors: {selectedMooring.sensorDepths.length} Levels
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400">
                  {new Date(selectedMooring.timestamp).toUTCString()}
                </span>
              </div>

              {/* Real-time Parameter Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-surfaceElevated rounded-lg border border-border/40">
                  <span className="text-[10px] text-textSecondary uppercase font-bold flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" /> Sea Surface Temp
                  </span>
                  <p className="text-lg font-bold text-red-400 font-mono mt-1">{selectedMooring.variables.temperature}°C</p>
                </div>

                <div className="p-3 bg-surfaceElevated rounded-lg border border-border/40">
                  <span className="text-[10px] text-textSecondary uppercase font-bold flex items-center gap-1">
                    <Waves className="w-3.5 h-3.5 text-cyan-400" /> Significant Wave Height
                  </span>
                  <p className="text-lg font-bold text-cyan-400 font-mono mt-1">{selectedMooring.variables.waveHeight} m</p>
                </div>

                <div className="p-3 bg-surfaceElevated rounded-lg border border-border/40">
                  <span className="text-[10px] text-textSecondary uppercase font-bold flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" /> Wind Velocity
                  </span>
                  <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{selectedMooring.variables.windSpeed} m/s ({selectedMooring.variables.windDirection}°)</p>
                </div>

                <div className="p-3 bg-surfaceElevated rounded-lg border border-border/40">
                  <span className="text-[10px] text-textSecondary uppercase font-bold flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-amber-400" /> Air Pressure
                  </span>
                  <p className="text-lg font-bold text-amber-400 font-mono mt-1">{selectedMooring.variables.pressure} hPa</p>
                </div>
              </div>

              {/* Met-Ocean 24h Trend Chart */}
              <div className="flex-1 bg-black/30 rounded-lg p-2 flex flex-col">
                <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                  24-Hour Meteorological & Wave Trend
                </h3>
                <div className="flex-1">
                  <Plot
                    data={[
                      {
                        x: timeSeries.hours,
                        y: timeSeries.sst,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'SST (°C)',
                        line: { color: '#ff4b1f', width: 2 }
                      },
                      {
                        x: timeSeries.hours,
                        y: timeSeries.waves,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Wave Height (m)',
                        yaxis: 'y2',
                        line: { color: '#00ffff', width: 2, dash: 'dash' }
                      },
                      {
                        x: timeSeries.hours,
                        y: timeSeries.wind,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Wind (m/s)',
                        yaxis: 'y3',
                        line: { color: '#00ff88', width: 2, dash: 'dot' }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 40, r: 50, t: 20, b: 35 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#8892b0', family: 'monospace', size: 10 },
                      yaxis: { title: { text: 'SST (°C)' }, gridcolor: '#1f293d' },
                      yaxis2: { title: { text: 'Wave (m)' }, overlaying: 'y', side: 'right', gridcolor: '#1f293d' },
                      xaxis: { gridcolor: '#1f293d' },
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
              Select a mooring station to inspect telemetry
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
