import React from 'react';
import Plot from 'react-plotly.js';
import { X, Activity } from 'lucide-react';
import type { Observation } from '../../../../shared/types';

interface Props {
  observation: Observation;
  onClose: () => void;
}

export const ObservationProfile: React.FC<Props> = ({ observation, onClose }) => {
  // Generate a mock profile for this observation (since the core data point only holds surface/current depth)
  // We'll create a nice descending profile.
  const depths = [0, 50, 100, 200, 500, 1000, 2000];
  const baseTemp = observation.variables.temperature || 25;
  const temps = depths.map(d => Math.max(2, baseTemp - (d / 2000) * (baseTemp - 2) + (Math.random() - 0.5)));
  
  const baseSal = observation.variables.salinity || 35;
  const sals = depths.map(d => baseSal + (Math.random() - 0.5) * 0.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="glass-panel-elevated w-full max-w-4xl h-[80vh] rounded-xl flex flex-col border border-border">
        
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-white tracking-wider">
              {observation.type.toUpperCase()} PROFILE - {observation.id}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-textSecondary hover:text-white bg-surfaceElevated rounded-md border border-border">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Temperature Profile */}
          <div className="glass-panel p-4 rounded-xl flex flex-col h-[400px]">
            <h3 className="text-sm font-semibold text-textSecondary text-center mb-2">Temperature vs Depth</h3>
            <div className="flex-1 w-full">
              <Plot
                data={[
                  {
                    x: temps,
                    y: depths,
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { color: '#00d4ff', width: 2, shape: 'spline' },
                    marker: { color: '#ffffff', size: 6 },
                    name: 'Temperature'
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { t: 10, r: 10, l: 50, b: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: '#8892b0' },
                  yaxis: { title: 'Depth (m)', autorange: 'reversed', gridcolor: '#1e293b' },
                  xaxis: { title: 'Temperature (Â°C)', gridcolor: '#1e293b' },
                  hovermode: 'closest'
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>

          {/* Salinity Profile */}
          <div className="glass-panel p-4 rounded-xl flex flex-col h-[400px]">
            <h3 className="text-sm font-semibold text-textSecondary text-center mb-2">Salinity vs Depth</h3>
            <div className="flex-1 w-full">
              <Plot
                data={[
                  {
                    x: sals,
                    y: depths,
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { color: '#00ff88', width: 2, shape: 'spline' },
                    marker: { color: '#ffffff', size: 6 },
                    name: 'Salinity'
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { t: 10, r: 10, l: 50, b: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: '#8892b0' },
                  yaxis: { title: 'Depth (m)', autorange: 'reversed', gridcolor: '#1e293b' },
                  xaxis: { title: 'Salinity (PSU)', gridcolor: '#1e293b' },
                  hovermode: 'closest'
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
