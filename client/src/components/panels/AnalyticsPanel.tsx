import React, { useEffect, useState } from 'react';
import { Activity, Thermometer, Wind, Droplets } from 'lucide-react';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';

export const AnalyticsPanel: React.FC = () => {
  const { 
    verticalExaggeration, setVerticalExaggeration,
    isosurfaceEnabled, isovalue, setIsovalue,
    vectorEnabled, vectorDensity, setVectorDensity,
    particleEnabled, particleSpeed, setParticleSpeed
  } = useAnalyticsStore();

  const [stats, setStats] = useState({ min: 0, max: 0, mean: 0, std: 0 });

  useEffect(() => {
    // Mock fetch stats
    fetch('http://localhost:5000/api/analytics/stats?datasetId=1&variable=temperature')
      .then(res => res.json())
      .then(data => setStats({
        min: data.min.toFixed(2),
        max: data.max.toFixed(2),
        mean: data.mean.toFixed(2),
        std: data.std.toFixed(2)
      }))
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="glass-panel p-4 rounded-xl h-full flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-textSecondary">Scientific Analytics</h2>
      </div>

      <div className="bg-surfaceElevated border border-border/50 rounded-lg p-3">
        <h3 className="text-[10px] uppercase text-textSecondary mb-2 font-bold tracking-widest">Field Statistics (Temperature)</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-textSecondary">MIN</span>
            <span className="font-bold text-blue-400">{stats.min}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-textSecondary">MAX</span>
            <span className="font-bold text-red-400">{stats.max}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-textSecondary">MEAN</span>
            <span className="font-bold text-white">{stats.mean}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-textSecondary">STD</span>
            <span className="font-bold text-yellow-400">{stats.std}°C</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-textSecondary uppercase font-bold tracking-wider">Vertical Exaggeration</span>
            <span className="text-primary font-bold">{verticalExaggeration}x</span>
          </div>
          <input 
            type="range" min="1" max="20" step="1" 
            value={verticalExaggeration} onChange={(e) => setVerticalExaggeration(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-background rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {isosurfaceEnabled && (
          <div className="space-y-1 bg-primary/5 p-2 rounded-lg border border-primary/20">
            <div className="flex justify-between text-xs">
              <span className="text-textSecondary uppercase font-bold tracking-wider flex items-center gap-1"><Thermometer className="w-3 h-3"/> Isovalue</span>
              <span className="text-primary font-bold">{isovalue}</span>
            </div>
            <input 
              type="range" min="0" max="35" step="0.5" 
              value={isovalue} onChange={(e) => setIsovalue(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-background rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {vectorEnabled && (
          <div className="space-y-1 bg-primary/5 p-2 rounded-lg border border-primary/20">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-textSecondary uppercase font-bold tracking-wider flex items-center gap-1"><Wind className="w-3 h-3"/> Vector Density</span>
            </div>
            <select 
              value={vectorDensity}
              onChange={(e) => setVectorDensity(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-md text-xs p-1 text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        )}

        {particleEnabled && (
          <div className="space-y-1 bg-primary/5 p-2 rounded-lg border border-primary/20">
            <div className="flex justify-between text-xs">
              <span className="text-textSecondary uppercase font-bold tracking-wider flex items-center gap-1"><Droplets className="w-3 h-3"/> Particle Speed</span>
              <span className="text-primary font-bold">{particleSpeed}x</span>
            </div>
            <input 
              type="range" min="0.1" max="5" step="0.1" 
              value={particleSpeed} onChange={(e) => setParticleSpeed(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-background rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

      </div>
    </div>
  );
};
