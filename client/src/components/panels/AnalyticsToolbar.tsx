import React from 'react';
import { Layers, Thermometer, Wind, Eye, MousePointer2, Download, AlertTriangle } from 'lucide-react';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';

export const AnalyticsToolbar: React.FC = () => {
  const {
    depthSliceEnabled, setDepthSliceEnabled,
    isosurfaceEnabled, setIsosurfaceEnabled,
    vectorEnabled, setVectorEnabled,
    particleEnabled, setParticleEnabled,
    probeEnabled, setProbeEnabled,
    bathymetryEnabled, setBathymetryEnabled,
    anomalyEnabled, setAnomalyEnabled
  } = useAnalyticsStore();

  const tools = [
    { id: 'probe', label: 'Data Probe', icon: MousePointer2, state: probeEnabled, toggle: setProbeEnabled },
    { id: 'depth', label: 'Depth Slice', icon: Layers, state: depthSliceEnabled, toggle: setDepthSliceEnabled },
    { id: 'iso', label: 'Isosurface', icon: Thermometer, state: isosurfaceEnabled, toggle: setIsosurfaceEnabled },
    { id: 'vector', label: 'Vectors', icon: Wind, state: vectorEnabled, toggle: setVectorEnabled },
    { id: 'particles', label: 'Particles', icon: Wind, state: particleEnabled, toggle: setParticleEnabled },
    { id: 'bathy', label: 'Bathymetry', icon: Eye, state: bathymetryEnabled, toggle: setBathymetryEnabled },
    { id: 'anomaly', label: 'Anomaly', icon: AlertTriangle, state: anomalyEnabled, toggle: setAnomalyEnabled }
  ];

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div className="glass-panel p-2 rounded-xl flex flex-col gap-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => tool.toggle(!tool.state)}
            className={`p-2 rounded-lg flex items-center justify-center transition-all group relative ${tool.state ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-surfaceElevated text-textSecondary border border-border/50 hover:text-white'}`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
              {tool.label}
            </div>
          </button>
        ))}
      </div>
      <button className="glass-panel p-2 rounded-xl flex items-center justify-center text-textSecondary hover:text-white transition-colors" title="Export Screenshot">
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
};
