import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import { useOceanStore } from '../../store/useOceanStore';

export const AnalyticsPanel: React.FC = () => {
  const { 
    verticalExaggeration, setVerticalExaggeration,
    isosurfaceEnabled, setIsosurfaceEnabled, isovalue, setIsovalue,
    vectorEnabled, setVectorEnabled, vectorDensity, setVectorDensity,
    particleEnabled, setParticleEnabled, particleSpeed, setParticleSpeed
  } = useAnalyticsStore();

  const { selectedVariable, activeDatasetId } = useOceanStore();
  const [stats, setStats] = useState({ min: '0.0', max: '0.0', mean: '0.0', std: '0.0' });

  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    const ds = activeDatasetId || 'incois_hoofs_indian_ocean';
    
    fetch(`${apiBase}/analytics/stats?datasetId=${ds}&variable=${selectedVariable}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.min !== undefined) {
          setStats({
            min: Number(data.min).toFixed(1),
            max: Number(data.max).toFixed(1),
            mean: Number(data.mean).toFixed(1),
            std: Number(data.std).toFixed(1)
          });
        }
      })
      .catch(e => console.error("Failed to fetch analytics stats:", e));
  }, [selectedVariable, activeDatasetId]);

  const getUnit = () => {
    switch (selectedVariable) {
      case 'temperature': return '°C';
      case 'salinity': return ' PSU';
      case 'current':
      case 'currentVelocity': return ' m/s';
      case 'chlorophyll': return ' mg/m³';
      default: return '';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl h-full flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-textSecondary">Scientific Analytics</h2>
      </div>

      <div className="bg-surfaceElevated border border-border/50 rounded-lg p-3">
        <h3 className="text-[10px] uppercase text-textSecondary mb-2 font-bold tracking-widest">
          Field Statistics ({selectedVariable.toUpperCase()})
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-textSecondary">MIN</span>
            <span className="font-bold text-blue-400">{stats.min}{getUnit()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-textSecondary">MAX</span>
            <span className="font-bold text-red-400">{stats.max}{getUnit()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-textSecondary">MEAN</span>
            <span className="font-bold text-white">{stats.mean}{getUnit()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-textSecondary">STD</span>
            <span className="font-bold text-yellow-400">{stats.std}{getUnit()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-textSecondary">Vertical Exaggeration</span>
            <span className="text-primary font-bold">{verticalExaggeration}x</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="0.5"
            value={verticalExaggeration}
            onChange={(e) => setVerticalExaggeration(Number(e.target.value))}
            className="w-full accent-primary h-1 bg-surfaceElevated rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-textSecondary">Iso-surface Extraction</span>
            <input 
              type="checkbox" 
              checked={isosurfaceEnabled}
              onChange={(e) => setIsosurfaceEnabled(e.target.checked)}
              className="accent-primary"
            />
          </div>
          {isosurfaceEnabled && (
            <input 
              type="range" 
              min="0" 
              max="35" 
              value={isovalue}
              onChange={(e) => setIsovalue(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-surfaceElevated rounded-lg appearance-none cursor-pointer"
            />
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-textSecondary">Vector Field Grid</span>
            <input 
              type="checkbox" 
              checked={vectorEnabled}
              onChange={(e) => setVectorEnabled(e.target.checked)}
              className="accent-primary"
            />
          </div>
          {vectorEnabled && (
            <select
              value={vectorDensity}
              onChange={(e) => setVectorDensity(e.target.value)}
              className="w-full bg-surfaceElevated border border-border text-xs rounded p-1 text-white"
            >
              <option value="Low">Low Density</option>
              <option value="Medium">Medium Density</option>
              <option value="High">High Density</option>
            </select>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-textSecondary">Particle Flow Simulation</span>
            <input 
              type="checkbox" 
              checked={particleEnabled}
              onChange={(e) => setParticleEnabled(e.target.checked)}
              className="accent-primary"
            />
          </div>
          {particleEnabled && (
            <input 
              type="range" 
              min="0.1" 
              max="2" 
              step="0.1"
              value={particleSpeed}
              onChange={(e) => setParticleSpeed(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-surfaceElevated rounded-lg appearance-none cursor-pointer"
            />
          )}
        </div>

      </div>
    </div>
  );
};
